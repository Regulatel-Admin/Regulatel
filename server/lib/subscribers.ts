/**
 * Suscriptores a actualizaciones (noticias, eventos).
 * La tabla se crea sola en Neon la primera vez que alguien se suscribe.
 */

import crypto from "crypto";
import { getDb } from "./db.js";

export type SubscriberRow = {
  id: string;
  email: string;
  created_at: string;
  unsubscribed_at: string | null;
};

export type SubscriberRecord = {
  id: string;
  email: string;
  unsubscribeToken: string;
  created: boolean;
  reactivated: boolean;
};

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
      await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_subscribers_unsubscribe_token ON subscribers(unsubscribe_token) WHERE unsubscribe_token IS NOT NULL`;
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function addSubscriber(
  email: string
): Promise<{ ok: true; subscriber: SubscriberRecord } | { ok: false; error: string }> {
  const normalized = normalizeEmail(email);
  if (!normalized || !isValidEmail(normalized)) {
    return { ok: false, error: "Correo electrónico no válido." };
  }

  await ensureSubscribersSchema();
  const sql = getDb();
  const existing = await sql<{
    id: string;
    email: string;
    unsubscribed_at: string | null;
    unsubscribe_token: string | null;
  }[]>`
    SELECT id, email, unsubscribed_at, unsubscribe_token
    FROM subscribers
    WHERE lower(email) = ${normalized}
    LIMIT 1
  `;

  if (existing[0]) {
    const row = existing[0];
    const token = row.unsubscribe_token || newUnsubscribeToken();
    if (!row.unsubscribe_token) {
      await sql`UPDATE subscribers SET unsubscribe_token = ${token} WHERE id = ${row.id}`;
    }
    if (row.unsubscribed_at) {
      await sql`
        UPDATE subscribers
        SET unsubscribed_at = NULL, unsubscribe_token = ${token}
        WHERE id = ${row.id}
      `;
      return {
        ok: true,
        subscriber: {
          id: row.id,
          email: row.email,
          unsubscribeToken: token,
          created: false,
          reactivated: true,
        },
      };
    }
    return {
      ok: true,
      subscriber: {
        id: row.id,
        email: row.email,
        unsubscribeToken: token,
        created: false,
        reactivated: false,
      },
    };
  }

  const id = crypto.randomUUID();
  const token = newUnsubscribeToken();
  await sql`
    INSERT INTO subscribers (id, email, created_at, unsubscribe_token)
    VALUES (${id}, ${normalized}, NOW(), ${token})
  `;
  return {
    ok: true,
    subscriber: {
      id,
      email: normalized,
      unsubscribeToken: token,
      created: true,
      reactivated: false,
    },
  };
}

export async function unsubscribeByToken(token: string): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  const value = token.trim();
  if (!value) return { ok: false, error: "El enlace de baja no es válido." };
  await ensureSubscribersSchema();
  const sql = getDb();
  const rows = await sql<{ email: string }[]>`
    UPDATE subscribers
    SET unsubscribed_at = NOW()
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
    SET unsubscribed_at = NOW()
    WHERE id = ${id} AND unsubscribed_at IS NULL
    RETURNING id
  `;
  return rows.length > 0;
}

export async function listSubscribers(): Promise<SubscriberRow[]> {
  await ensureSubscribersSchema();
  const sql = getDb();
  return sql<SubscriberRow[]>`
    SELECT id, email, created_at, unsubscribed_at
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
    ORDER BY created_at ASC
  `;
  const result: Array<{ email: string; unsubscribeToken: string }> = [];
  for (const row of rows) {
    let token = row.unsubscribe_token;
    if (!token) {
      token = newUnsubscribeToken();
      await sql`UPDATE subscribers SET unsubscribe_token = ${token} WHERE id = ${row.id}`;
    }
    result.push({ email: row.email, unsubscribeToken: token });
  }
  return result;
}
