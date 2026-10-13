/**
 * Existing subscribers remain active. New requests require email verification;
 * unconfirmed requests never receive newsletters.
 */
import crypto from "crypto";
import { getDb } from "./db.js";
import { isValidPublicEmail } from "./formSecurity.js";

export type SubscriberRow = {
  id: string;
  email: string;
  created_at: string;
  unsubscribed_at: string | null;
  verification_required: boolean;
  confirmed_at: string | null;
  status: "active" | "pending" | "unsubscribed";
};

export type SubscriberRecord = {
  id: string;
  email: string;
  unsubscribeToken: string;
  created: boolean;
  reactivated: boolean;
  confirmationKey?: string;
};

type StoredSubscriber = {
  id: string;
  email: string;
  unsubscribed_at: string | null;
  unsubscribe_token: string | null;
  verification_required: boolean;
  confirmed_at: string | null;
  confirmation_recent: boolean;
};

type SubscriptionRequestResult =
  | { ok: true; subscriber: SubscriberRecord; confirmationToken: string | null }
  | { ok: false; error: string };

let schemaEnsured: Promise<void> | null = null;

export async function ensureSubscribersSchema() {
  if (!schemaEnsured) {
    schemaEnsured = (async () => {
      const sql = getDb();
      await sql`
        CREATE TABLE IF NOT EXISTS subscribers (
          id TEXT PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          unsubscribed_at TIMESTAMPTZ,
          unsubscribe_token TEXT UNIQUE
        )
      `;
      await sql`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT`;
      // FALSE deliberately preserves existing subscribers, including their opt-outs.
      await sql`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS verification_required BOOLEAN NOT NULL DEFAULT FALSE`;
      await sql`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ`;
      await sql`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirmation_token_hash TEXT`;
      await sql`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirmation_expires_at TIMESTAMPTZ`;
      await sql`ALTER TABLE subscribers ADD COLUMN IF NOT EXISTS confirmation_requested_at TIMESTAMPTZ`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL`;
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_confirmation_token ON subscribers(confirmation_token_hash) WHERE confirmation_token_hash IS NOT NULL`;
      await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_email ON subscribers(lower(email))`;
      await sql`CREATE INDEX IF NOT EXISTS idx_subscribers_active ON subscribers(unsubscribed_at) WHERE unsubscribed_at IS NULL`;
    })().catch((err) => {
      schemaEnsured = null;
      throw err;
    });
  }
  await schemaEnsured;
}

function newUnsubscribeToken() {
  return crypto.randomBytes(24).toString("base64url");
}

function confirmationHash(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/** Reserve one confirmation email, without activating a new or opted-out address. */
export async function addSubscriber(email: string): Promise<SubscriptionRequestResult> {
  const normalized = email.trim().toLowerCase();
  if (!isValidPublicEmail(normalized)) {
    return { ok: false, error: "Correo electrónico no válido." };
  }

  await ensureSubscribersSchema();
  const sql = getDb();
  return sql.begin(async (transaction): Promise<SubscriptionRequestResult> => {
    // postgres 3.4's TransactionSql type omits the callable tag signature.
    const tx = transaction as unknown as typeof sql;
    // Serialize requests for the same normalized email across all server instances.
    await tx`SELECT pg_advisory_xact_lock(hashtextextended(${normalized}, 0))`;
    const rows = await tx<StoredSubscriber[]>`
      SELECT id, email, unsubscribed_at, unsubscribe_token, verification_required, confirmed_at,
        COALESCE(confirmation_requested_at > NOW() - INTERVAL '10 minutes', FALSE) AS confirmation_recent
      FROM subscribers
      WHERE lower(email) = ${normalized}
      ORDER BY created_at ASC
      LIMIT 1
      FOR UPDATE
    `;
    const existing = rows[0];
    const subscriber: SubscriberRecord = {
      id: existing?.id ?? crypto.randomUUID(),
      email: existing?.email ?? normalized,
      unsubscribeToken: existing?.unsubscribe_token ?? newUnsubscribeToken(),
      created: !existing,
      reactivated: Boolean(existing?.unsubscribed_at),
    };
    const active = existing && !existing.unsubscribed_at &&
      (!existing.verification_required || Boolean(existing.confirmed_at));
    if (active || existing?.confirmation_recent) {
      return { ok: true, subscriber, confirmationToken: null };
    }

    const confirmationToken = crypto.randomBytes(32).toString("base64url");
    const tokenHash = confirmationHash(confirmationToken);
    if (existing) {
      await tx`
        UPDATE subscribers
        SET verification_required = TRUE, confirmed_at = NULL,
            unsubscribe_token = ${subscriber.unsubscribeToken},
            confirmation_token_hash = ${tokenHash},
            confirmation_expires_at = NOW() + INTERVAL '24 hours',
            confirmation_requested_at = NOW()
        WHERE id = ${subscriber.id}
      `;
    } else {
      await tx`
        INSERT INTO subscribers (
          id, email, created_at, unsubscribe_token, verification_required, confirmed_at,
          confirmation_token_hash, confirmation_expires_at, confirmation_requested_at
        ) VALUES (
          ${subscriber.id}, ${normalized}, NOW(), ${subscriber.unsubscribeToken}, TRUE, NULL,
          ${tokenHash}, NOW() + INTERVAL '24 hours', NOW()
        )
      `;
    }
    return { ok: true, subscriber, confirmationToken };
  });
}

/** A failed mail send leaves the address pending and invalidates only that request. */
export async function revokePendingConfirmation(token: string): Promise<void> {
  await ensureSubscribersSchema();
  const sql = getDb();
  await sql`
    UPDATE subscribers
    SET confirmation_token_hash = NULL, confirmation_expires_at = NULL,
        confirmation_requested_at = NULL
    WHERE confirmation_token_hash = ${confirmationHash(token)}
  `;
}

export async function confirmSubscriber(token: string): Promise<
  { ok: true; subscriber: SubscriberRecord } | { ok: false; error: string }
> {
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) {
    return { ok: false, error: "Este enlace de confirmación no es válido o ha vencido." };
  }
  await ensureSubscribersSchema();
  const sql = getDb();
  const tokenHash = confirmationHash(token);
  return sql.begin(async (transaction) => {
    const tx = transaction as unknown as typeof sql;
    const rows = await tx<StoredSubscriber[]>`
      SELECT id, email, unsubscribed_at, unsubscribe_token, verification_required, confirmed_at
      FROM subscribers
      WHERE confirmation_token_hash = ${tokenHash}
        AND confirmation_expires_at > clock_timestamp()
        AND verification_required = TRUE
      FOR UPDATE
    `;
    const row = rows[0];
    if (!row) {
      return { ok: false as const, error: "Este enlace de confirmación ya se usó, fue cancelado o ha vencido. Puede volver a solicitar la suscripción." };
    }
    const unsubscribeToken = row.unsubscribe_token ?? newUnsubscribeToken();
    const activated = await tx<{ id: string }[]>`
      UPDATE subscribers
      SET confirmed_at = NOW(), unsubscribed_at = NULL,
          unsubscribe_token = ${unsubscribeToken},
          confirmation_token_hash = NULL, confirmation_expires_at = NULL,
          confirmation_requested_at = NULL
      WHERE id = ${row.id} AND confirmation_token_hash = ${tokenHash}
        AND confirmation_expires_at > clock_timestamp()
      RETURNING id
    `;
    if (!activated[0]) {
      return { ok: false as const, error: "Este enlace de confirmación no es válido o ha vencido." };
    }
    return {
      ok: true as const,
      subscriber: {
        id: row.id,
        email: row.email,
        unsubscribeToken,
        created: !row.unsubscribed_at,
        reactivated: Boolean(row.unsubscribed_at),
        confirmationKey: tokenHash,
      },
    };
  });
}

export async function unsubscribeByToken(token: string): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const value = token.trim();
  if (!value) return { ok: false, error: "El enlace de baja no es válido." };
  await ensureSubscribersSchema();
  const sql = getDb();
  const rows = await sql<{ email: string }[]>`
    UPDATE subscribers
    SET unsubscribed_at = NOW(), confirmation_token_hash = NULL,
        confirmation_expires_at = NULL, confirmation_requested_at = NULL
    WHERE unsubscribe_token = ${value}
    RETURNING email
  `;
  if (!rows[0]) return { ok: false, error: "Este enlace de baja no es válido o ya se usó." };
  return { ok: true, email: rows[0].email };
}

export async function unsubscribeById(id: string): Promise<boolean> {
  await ensureSubscribersSchema();
  const sql = getDb();
  const rows = await sql<{ id: string }[]>`
    UPDATE subscribers
    SET unsubscribed_at = NOW(), confirmation_token_hash = NULL,
        confirmation_expires_at = NULL, confirmation_requested_at = NULL
    WHERE id = ${id} AND (unsubscribed_at IS NULL OR confirmation_token_hash IS NOT NULL)
    RETURNING id
  `;
  return rows.length > 0;
}

export async function listSubscribers(): Promise<SubscriberRow[]> {
  await ensureSubscribersSchema();
  const sql = getDb();
  return sql<SubscriberRow[]>`
    SELECT id, email, created_at, unsubscribed_at, verification_required, confirmed_at,
      CASE
        WHEN unsubscribed_at IS NOT NULL THEN 'unsubscribed'
        WHEN verification_required = TRUE AND confirmed_at IS NULL THEN 'pending'
        ELSE 'active'
      END AS status
    FROM subscribers
    ORDER BY created_at DESC
  `;
}

export async function getActiveSubscribers(): Promise<Array<{ email: string; unsubscribeToken: string }>> {
  await ensureSubscribersSchema();
  const sql = getDb();
  const rows = await sql<{ email: string; unsubscribe_token: string | null; id: string }[]>`
    SELECT id, email, unsubscribe_token
    FROM subscribers
    WHERE unsubscribed_at IS NULL
      AND (verification_required = FALSE OR confirmed_at IS NOT NULL)
    ORDER BY created_at ASC
  `;
  const result: Array<{ email: string; unsubscribeToken: string }> = [];
  for (const row of rows) {
    let token = row.unsubscribe_token;
    if (!token) {
      const updated = await sql<{ unsubscribe_token: string }[]>`
        UPDATE subscribers SET unsubscribe_token = COALESCE(unsubscribe_token, ${newUnsubscribeToken()})
        WHERE id = ${row.id} AND unsubscribed_at IS NULL
          AND (verification_required = FALSE OR confirmed_at IS NOT NULL)
        RETURNING unsubscribe_token
      `;
      token = updated[0]?.unsubscribe_token ?? null;
    }
    if (token) result.push({ email: row.email, unsubscribeToken: token });
  }
  return result;
}
