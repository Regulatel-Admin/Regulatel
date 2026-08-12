/**
 * Solicitudes de acceso a actas restringidas.
 * El revisor (dcuervo@indotel.gob.do y aarango@indotel.gob.do) autoriza o deniega desde el correo.
 */
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { getDb } from "./db.js";
import {
  createDocumentAccessUser,
  findDocumentAccessUserByEmail,
} from "./documentAccess.js";
import { emailButton, emailDetailsTable, escapeHtml, siteBaseUrl, wrapEmailHtml } from "./emailLayout.js";

const DEFAULT_REVIEWERS = ["dcuervo@indotel.gob.do", "aarango@indotel.gob.do"];

export function documentAccessReviewerEmails() {
  const extra = (process.env.DOCUMENT_ACCESS_REVIEWER_EMAIL ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
  return [...new Set([...DEFAULT_REVIEWERS, ...extra])];
}

export const DOCUMENT_ACCESS_REVIEWER_EMAIL = documentAccessReviewerEmails().join(", ");

const FROM_EMAIL = process.env.NEWSLETTER_FROM_EMAIL ?? "REGULATEL <onboarding@resend.dev>";
const TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 días

let schemaEnsured: Promise<void> | null = null;

export async function ensureDocumentAccessRequestsSchema() {
  if (!schemaEnsured) {
    schemaEnsured = (async () => {
      const sql = getDb();
      await sql`
        CREATE TABLE IF NOT EXISTS document_access_requests (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          name TEXT NOT NULL,
          institution TEXT,
          position TEXT,
          country TEXT,
          document_id TEXT,
          document_title TEXT,
          collection_tipo TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          decided_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_dar_email ON document_access_requests(lower(email))`;
      await sql`CREATE INDEX IF NOT EXISTS idx_dar_status ON document_access_requests(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_dar_token ON document_access_requests(token_hash)`;
    })().catch((err) => {
      schemaEnsured = null;
      throw err;
    });
  }
  await schemaEnsured;
}

export interface DocumentAccessRequestRow {
  id: string;
  email: string;
  name: string;
  institution: string | null;
  position: string | null;
  country: string | null;
  document_id: string | null;
  document_title: string | null;
  collection_tipo: string | null;
  status: "pending" | "approved" | "denied";
  token_hash: string;
  expires_at: string;
  decided_at: string | null;
  created_at: string;
}

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

function randomToken() {
  return crypto.randomBytes(32).toString("base64url");
}

function generatePassword() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(12);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  const { Resend } = await import("resend");
  return new Resend(key);
}

export async function findPendingRequestByEmail(email: string): Promise<DocumentAccessRequestRow | null> {
  await ensureDocumentAccessRequestsSchema();
  const sql = getDb();
  const normalized = email.trim().toLowerCase();
  const [row] = await sql<DocumentAccessRequestRow[]>`
    SELECT id, email, name, institution, position, country, document_id, document_title,
           collection_tipo, status, token_hash, expires_at, decided_at, created_at
    FROM document_access_requests
    WHERE lower(email) = ${normalized} AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  return row ?? null;
}

export async function findRequestByToken(token: string): Promise<DocumentAccessRequestRow | null> {
  await ensureDocumentAccessRequestsSchema();
  const sql = getDb();
  const tokenHash = hashToken(token);
  const [row] = await sql<DocumentAccessRequestRow[]>`
    SELECT id, email, name, institution, position, country, document_id, document_title,
           collection_tipo, status, token_hash, expires_at, decided_at, created_at
    FROM document_access_requests
    WHERE token_hash = ${tokenHash}
    LIMIT 1
  `;
  return row ?? null;
}

export function toPublicRequest(row: DocumentAccessRequestRow) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    institution: row.institution,
    position: row.position,
    country: row.country,
    documentId: row.document_id,
    documentTitle: row.document_title,
    collectionTipo: row.collection_tipo,
    status: row.status,
    expiresAt: row.expires_at,
    createdAt: row.created_at,
  };
}

export async function createAccessRequest(input: {
  email: string;
  name: string;
  institution?: string | null;
  position?: string | null;
  country?: string | null;
  documentId?: string | null;
  documentTitle?: string | null;
  collectionTipo?: string | null;
}): Promise<{ ok: true; id: string } | { ok: false; error: string; status: number }> {
  await ensureDocumentAccessRequestsSchema();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  const institution = input.institution?.trim() || "";
  const position = input.position?.trim() || "";
  const country = input.country?.trim() || "";
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Indique un correo electrónico válido.", status: 400 };
  }
  if (!name) {
    return { ok: false, error: "El nombre es obligatorio.", status: 400 };
  }
  if (!institution) {
    return { ok: false, error: "La institución es obligatoria.", status: 400 };
  }
  if (!position) {
    return { ok: false, error: "El cargo es obligatorio.", status: 400 };
  }
  if (!country) {
    return { ok: false, error: "El país es obligatorio.", status: 400 };
  }

  const existingUser = await findDocumentAccessUserByEmail(email);
  if (existingUser) {
    return {
      ok: false,
      error: "Este correo ya tiene acceso. Inicie sesión con su email y contraseña.",
      status: 409,
    };
  }

  const pending = await findPendingRequestByEmail(email);
  if (pending) {
    return {
      ok: false,
      error: "Ya hay una solicitud pendiente para este correo. Espere la respuesta del administrador.",
      status: 409,
    };
  }

  const sql = getDb();
  const id = `dar_${crypto.randomUUID()}`;
  const token = randomToken();
  const tokenHash = hashToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + TOKEN_TTL_MS);

  await sql`
    INSERT INTO document_access_requests (
      id, email, name, institution, position, country, document_id, document_title,
      collection_tipo, status, token_hash, expires_at, created_at
    )
    VALUES (
      ${id}, ${email}, ${name}, ${institution},
      ${position}, ${country},
      ${input.documentId ?? null}, ${input.documentTitle ?? null},
      ${input.collectionTipo ?? null}, 'pending', ${tokenHash},
      ${expiresAt.toISOString()}::timestamptz, ${now.toISOString()}::timestamptz
    )
  `;

  const sent = await sendReviewerEmail({
    token,
    name,
    email,
    institution,
    position,
    country,
    documentTitle: input.documentTitle ?? null,
  });

  if (!sent.ok) {
    console.warn("[document-access-requests] Solicitud guardada pero el correo al revisor no se envió:", sent.error);
  }

  return { ok: true, id };
}

export async function decideAccessRequest(
  token: string,
  action: "approve" | "deny"
): Promise<
  | { ok: true; status: "approved" | "denied"; email: string; name: string }
  | { ok: false; error: string; status: number }
> {
  const row = await findRequestByToken(token);
  if (!row) {
    return { ok: false, error: "El enlace no es válido o ya no existe.", status: 404 };
  }
  if (row.status !== "pending") {
    return {
      ok: false,
      error: row.status === "approved" ? "Esta solicitud ya fue autorizada." : "Esta solicitud ya fue denegada.",
      status: 409,
    };
  }
  if (new Date(row.expires_at).getTime() < Date.now()) {
    return { ok: false, error: "Este enlace expiró. Pida a la persona que vuelva a solicitar acceso.", status: 410 };
  }

  const sql = getDb();
  const now = new Date().toISOString();
  const nextStatus = action === "approve" ? "approved" : "denied";

  if (action === "approve") {
    const existingUser = await findDocumentAccessUserByEmail(row.email);
    let password: string | null = null;
    if (!existingUser) {
      password = generatePassword();
      const passwordHash = await bcrypt.hash(password, 12);
      await createDocumentAccessUser({
        id: `dau_${crypto.randomUUID()}`,
        email: row.email,
        passwordHash,
        name: row.name,
        institution: row.institution,
        position: row.position,
        country: row.country,
      });
    }
    await sql`
      UPDATE document_access_requests
      SET status = ${nextStatus}, decided_at = ${now}::timestamptz
      WHERE id = ${row.id} AND status = 'pending'
    `;
    await sendRequesterDecisionEmail({
      to: row.email,
      name: row.name,
      approved: true,
      password,
      documentTitle: row.document_title,
    });
  } else {
    await sql`
      UPDATE document_access_requests
      SET status = ${nextStatus}, decided_at = ${now}::timestamptz
      WHERE id = ${row.id} AND status = 'pending'
    `;
    await sendRequesterDecisionEmail({
      to: row.email,
      name: row.name,
      approved: false,
      password: null,
      documentTitle: row.document_title,
    });
  }

  return { ok: true, status: nextStatus, email: row.email, name: row.name };
}

async function sendReviewerEmail(params: {
  token: string;
  name: string;
  email: string;
  institution: string | null;
  position: string | null;
  country: string | null;
  documentTitle: string | null;
}): Promise<{ ok: boolean; error?: string }> {
  const resend = await getResend();
  if (!resend) {
    return { ok: false, error: "RESEND_API_KEY no configurado." };
  }
  const base = siteBaseUrl();
  const approveUrl = `${base}/acceso-solicitud?token=${encodeURIComponent(params.token)}&action=approve`;
  const denyUrl = `${base}/acceso-solicitud?token=${encodeURIComponent(params.token)}&action=deny`;
  const details = emailDetailsTable([
    { label: "Nombre", value: params.name },
    { label: "Correo", value: params.email },
    { label: "País", value: params.country },
    { label: "Cargo", value: params.position },
    { label: "Institución", value: params.institution },
    { label: "Documento", value: params.documentTitle },
  ]);

  const html = wrapEmailHtml({
    preheader: `${params.name} solicitó acceso a las actas restringidas de REGULATEL.`,
    title: "Solicitud de acceso a actas",
    footerNote: "El enlace caduca en 7 días. Si no reconoce esta solicitud, deniegue el acceso.",
    bodyHtml: `
      <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
        Revise los datos de la persona y autorice o deniegue el acceso a las actas restringidas.
      </p>
      ${details}
      ${emailButton(approveUrl, "Autorizar acceso", "primary")}
      ${emailButton(denyUrl, "Denegar", "ghost")}
    `,
  });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: documentAccessReviewerEmails(),
    subject: `REGULATEL – Solicitud de acceso: ${params.name}`,
    html,
    text: `${params.name} (${params.email}) solicitó acceso a actas restringidas.\nAutorizar: ${approveUrl}\nDenegar: ${denyUrl}`,
  });
  if (error) {
    console.error("[document-access-requests] Error enviando al revisor", error);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}

async function sendRequesterDecisionEmail(params: {
  to: string;
  name: string;
  approved: boolean;
  password: string | null;
  documentTitle: string | null;
}): Promise<void> {
  const resend = await getResend();
  if (!resend) {
    console.warn("[document-access-requests] RESEND_API_KEY no configurado. No se avisó a", params.to);
    return;
  }
  const loginUrl = `${siteBaseUrl()}/acceso-documentos`;
  const html = params.approved
    ? wrapEmailHtml({
        preheader: "Su solicitud de acceso a las actas de REGULATEL fue autorizada.",
        title: "Acceso autorizado",
        footerNote: "Guarde esta contraseña. Si la pierde, contacte al administrador.",
        bodyHtml: `
          <p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
            Hola ${escapeHtml(params.name)}, su solicitud de acceso a las actas restringidas de REGULATEL fue autorizada.
          </p>
          ${
            params.password
              ? `${emailDetailsTable([
                  { label: "Correo", value: params.to },
                  { label: "Contraseña temporal", value: params.password },
                ])}`
              : `<p style="margin:0 0 18px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">Ya tenía una cuenta. Inicie sesión con sus credenciales habituales.</p>`
          }
          <p style="margin:0 0 8px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;"><strong>Qué hacer ahora:</strong></p>
          <ol style="margin:0 0 24px;padding-left:20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#2c3a47;">
            <li>Entre a <a href="${loginUrl}" style="color:#4489c6;font-weight:700;">www.regulatel.org/acceso-documentos</a></li>
            <li>Inicie sesión con el correo y la contraseña de este mensaje.</li>
            <li>Ya podrá ver y descargar las actas restringidas (Asambleas y Comité Ejecutivo).</li>
          </ol>
          ${emailButton(loginUrl, "Ingresar a las actas")}
        `,
      })
    : wrapEmailHtml({
        preheader: "Su solicitud de acceso a las actas de REGULATEL no fue autorizada.",
        title: "Solicitud no autorizada",
        footerNote: `Si cree que se trata de un error, escriba a ${escapeHtml(DOCUMENT_ACCESS_REVIEWER_EMAIL)}.`,
        bodyHtml: `
          <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#2c3a47;">
            Hola ${escapeHtml(params.name)}, su solicitud de acceso a las actas restringidas${
              params.documentTitle ? ` (${escapeHtml(params.documentTitle)})` : ""
            } no fue autorizada.
          </p>
        `,
      });

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: params.to,
    subject: params.approved
      ? "REGULATEL – Acceso a actas autorizado"
      : "REGULATEL – Solicitud de acceso no autorizada",
    html,
  });
  if (error) {
    console.error("[document-access-requests] Error avisando al solicitante", params.to, error);
  }
}

