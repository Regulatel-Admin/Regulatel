/**
 * Suscriptores a actualizaciones (noticias, eventos).
 * Almacenamiento en Neon; el envío de correos se hace con Resend (server/lib/sendNewsletter.ts).
 */

import crypto from "crypto";
import { getDb } from "./db.js";

export async function addSubscriber(email: string): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    return { ok: false, error: "Correo electrónico no válido." };
  }
  const sql = getDb();
  const id = crypto.randomUUID();
  try {
    const rows = await sql<{ id: string }[]>`
      INSERT INTO subscribers (id, email, created_at)
      VALUES (${id}, ${normalized}, NOW())
      ON CONFLICT (email) DO UPDATE SET unsubscribed_at = NULL
      RETURNING id
    `;
    return { ok: true, id: rows[0]?.id ?? id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("unique") || msg.includes("duplicate")) {
      return { ok: false, error: "Este correo ya está suscrito." };
    }
    throw e;
  }
}

/** Emails activos (no dados de baja) para envío de notificaciones. */
export async function getActiveSubscriberEmails(): Promise<string[]> {
  const sql = getDb();
  const rows = await sql<{ email: string }[]>`
    SELECT email FROM subscribers WHERE unsubscribed_at IS NULL ORDER BY created_at ASC
  `;
  return rows.map((r) => r.email);
}
