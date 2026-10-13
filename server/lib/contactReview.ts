import crypto from "crypto";
import { getDb } from "./db.js";
import { sendContactMessage, type ValidContactMessage } from "./contactMessages.js";

export type ContactReviewStatus = "pending" | "sending" | "approved" | "discarded" | "failed";
export type ContactReviewMessage = ValidContactMessage & {
  id: string;
  reasons: string[];
  status: ContactReviewStatus;
  created_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  last_error: string | null;
};

let schemaEnsured: Promise<void> | null = null;

export async function ensureContactReviewSchema() {
  if (!schemaEnsured) {
    schemaEnsured = (async () => {
      const sql = getDb();
      await sql`
        CREATE TABLE IF NOT EXISTS contact_message_reviews (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL,
          organization TEXT,
          subject TEXT NOT NULL,
          message TEXT NOT NULL,
          reasons JSONB NOT NULL DEFAULT '[]',
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sending', 'approved', 'discarded', 'failed')),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          reviewed_at TIMESTAMPTZ,
          reviewed_by TEXT,
          last_error TEXT
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_contact_message_reviews_status ON contact_message_reviews(status, created_at DESC)`;
    })().catch((err) => {
      schemaEnsured = null;
      throw err;
    });
  }
  await schemaEnsured;
}

// A long foreign name is not evidence of spam. This only flags both fields
// when they resemble ASCII random strings with many case transitions.
function resemblesRandomString(value: string) {
  if (!/^[A-Za-z]{14,120}$/.test(value)) return false;
  const upper = (value.match(/[A-Z]/g) ?? []).length;
  const lower = value.length - upper;
  let transitions = 0;
  for (let i = 1; i < value.length; i++) {
    if ((value[i - 1] === value[i - 1].toUpperCase()) !== (value[i] === value[i].toUpperCase())) transitions++;
  }
  return upper >= 4 && lower >= 4 && transitions >= 5 && new Set(value.toLowerCase()).size >= 10;
}

export function contactReviewReasons(input: ValidContactMessage): string[] {
  const reasons: string[] = [];
  const combined = [input.name, input.organization ?? "", input.subject, input.message].join("\n");
  const urlCount = (combined.match(/(?:https?:\/\/|www\.)[^\s<>]+/gi) ?? []).length;
  if (urlCount >= 4) reasons.push(`El mensaje incluye ${urlCount} enlaces; requiere revisión para evitar publicidad no solicitada.`);
  if (resemblesRandomString(input.name) && resemblesRandomString(input.subject)) {
    reasons.push("El nombre y el asunto tienen secuencias sin espacios con un patrón parecido a texto aleatorio.");
  }
  return reasons;
}

export async function queueContactForReview(input: ValidContactMessage, reasons: string[]): Promise<string> {
  await ensureContactReviewSchema();
  const sql = getDb();
  const id = `contact_${crypto.randomUUID()}`;
  await sql`
    INSERT INTO contact_message_reviews (id, name, email, organization, subject, message, reasons)
    VALUES (${id}, ${input.name}, ${input.email}, ${input.organization}, ${input.subject}, ${input.message}, ${JSON.stringify(reasons)}::jsonb)
  `;
  return id;
}

export async function listContactReviews(status: ContactReviewStatus | "all" = "pending", limit = 50, offset = 0) {
  await ensureContactReviewSchema();
  const sql = getDb();
  const safeLimit = Math.min(100, Math.max(1, Number.isFinite(limit) ? Math.trunc(limit) : 50));
  const safeOffset = Math.max(0, Number.isFinite(offset) ? Math.trunc(offset) : 0);
  const items = status === "all"
    ? await sql<ContactReviewMessage[]>`SELECT * FROM contact_message_reviews ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`
    : await sql<ContactReviewMessage[]>`SELECT * FROM contact_message_reviews WHERE status = ${status} ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`;
  const counts = status === "all"
    ? await sql<{ total: string }[]>`SELECT COUNT(*) AS total FROM contact_message_reviews`
    : await sql<{ total: string }[]>`SELECT COUNT(*) AS total FROM contact_message_reviews WHERE status = ${status}`;
  return { items, total: Number(counts[0]?.total ?? 0) };
}

type ReviewActionResult = { ok: true } | { ok: false; status: number; error: string };

export async function approveContactReview(id: string, reviewerId: string): Promise<ReviewActionResult> {
  await ensureContactReviewSchema();
  const sql = getDb();
  // The database owns the claim. Two admins or a repeated request cannot send
  // the same message twice. An interrupted claim remains visible for review.
  const claimed = await sql<ContactReviewMessage[]>`
    UPDATE contact_message_reviews
    SET status = 'sending', reviewed_at = NOW(), reviewed_by = ${reviewerId}, last_error = NULL
    WHERE id = ${id} AND status = 'pending'
    RETURNING *
  `;
  if (!claimed[0]) return { ok: false, status: 409, error: "El mensaje ya fue revisado o su envío está en curso. Actualice la lista." };

  try {
    const result = await sendContactMessage(claimed[0]);
    if (!result.ok) {
      await sql`UPDATE contact_message_reviews SET status = 'failed', last_error = ${result.error} WHERE id = ${id} AND status = 'sending'`;
      return { ok: false, status: result.status, error: result.error };
    }
    await sql`UPDATE contact_message_reviews SET status = 'approved', last_error = NULL WHERE id = ${id} AND status = 'sending'`;
    return { ok: true };
  } catch {
    console.error("[contact-review] No se pudo confirmar la entrega del mensaje aprobado.");
    await sql`UPDATE contact_message_reviews SET status = 'failed', last_error = 'No se pudo confirmar la entrega. Revise el proveedor de correo antes de reenviar.' WHERE id = ${id} AND status = 'sending'`;
    return { ok: false, status: 502, error: "No se pudo confirmar la entrega del mensaje." };
  }
}

export async function discardContactReview(id: string, reviewerId: string): Promise<ReviewActionResult> {
  await ensureContactReviewSchema();
  const sql = getDb();
  const rows = await sql<{ id: string }[]>`
    UPDATE contact_message_reviews
    SET status = 'discarded', reviewed_at = NOW(), reviewed_by = ${reviewerId}
    WHERE id = ${id} AND status IN ('pending', 'failed')
    RETURNING id
  `;
  if (!rows[0]) return { ok: false, status: 409, error: "El mensaje ya fue revisado o su envío está en curso. Actualice la lista." };
  return { ok: true };
}
