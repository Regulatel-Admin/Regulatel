import crypto from "crypto";
import { getDb } from "./db.js";

let auditSchemaEnsured: Promise<void> | null = null;

export async function ensureAuditSchema() {
  if (!auditSchemaEnsured) {
    auditSchemaEnsured = (async () => {
      const sql = getDb();
      await sql`
        CREATE TABLE IF NOT EXISTS admin_audit_log (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL,
          user_email TEXT NOT NULL,
          user_name TEXT,
          action TEXT NOT NULL,
          resource_type TEXT NOT NULL,
          resource_id TEXT,
          details JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_audit_created_at ON admin_audit_log(created_at DESC)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_audit_user_id ON admin_audit_log(user_id)`;
    })().catch((err) => {
      auditSchemaEnsured = null;
      throw err;
    });
  }
  await auditSchemaEnsured;
}

export type AuditAction = "created" | "updated" | "deleted" | "uploaded";
export type AuditResourceType = "news" | "event" | "document" | "upload" | "admin_user" | "cifras" | "site_settings";

export async function logAudit(params: {
  userId: string;
  userEmail: string;
  userName?: string | null;
  action: AuditAction;
  resourceType: AuditResourceType;
  resourceId?: string | null;
  details?: Record<string, unknown>;
}) {
  await ensureAuditSchema();
  const sql = getDb();
  const id = `audit_${crypto.randomUUID()}`;
  await sql`
    INSERT INTO admin_audit_log (id, user_id, user_email, user_name, action, resource_type, resource_id, details)
    VALUES (
      ${id},
      ${params.userId},
      ${params.userEmail},
      ${params.userName ?? null},
      ${params.action},
      ${params.resourceType},
      ${params.resourceId ?? null},
      ${JSON.stringify(params.details ?? {})}::jsonb
    )
  `;
}

export interface AuditLogRow {
  id: string;
  user_id: string;
  user_email: string;
  user_name: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  created_at: string;
}

export async function listAuditLog(limit: number, offset: number): Promise<AuditLogRow[]> {
  await ensureAuditSchema();
  const sql = getDb();
  const rows = await sql<AuditLogRow[]>`
    SELECT id, user_id, user_email, user_name, action, resource_type, resource_id, details, created_at
    FROM admin_audit_log
    ORDER BY created_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
  return rows;
}

/** Historial de cambios de un recurso (noticia, evento, documento, etc.) */
export async function listAuditLogByResource(
  resourceType: string,
  resourceId: string,
  limit: number = 50
): Promise<AuditLogRow[]> {
  await ensureAuditSchema();
  const sql = getDb();
  const rows = await sql<AuditLogRow[]>`
    SELECT id, user_id, user_email, user_name, action, resource_type, resource_id, details, created_at
    FROM admin_audit_log
    WHERE resource_type = ${resourceType} AND resource_id = ${resourceId}
    ORDER BY created_at DESC
    LIMIT ${limit}
  `;
  return rows;
}
