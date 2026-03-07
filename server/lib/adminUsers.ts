import { getDb } from "./db.js";

let authSchemaEnsured: Promise<void> | null = null;

export interface AdminUserRow {
  id: string;
  name: string;
  email: string;
  username: string | null;
  password_hash: string;
  role: "admin" | "editor";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}

export function normalizeLoginIdentifier(value: string): string {
  return value.trim().toLowerCase();
}

export async function ensureAdminAuthSchema() {
  if (!authSchemaEnsured) {
    authSchemaEnsured = (async () => {
      const sql = getDb();
      await sql`
        CREATE TABLE IF NOT EXISTS admin_users (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          email TEXT NOT NULL UNIQUE,
          username TEXT UNIQUE,
          password_hash TEXT NOT NULL,
          role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
          is_active BOOLEAN DEFAULT true,
          last_login_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_users_username ON admin_users(username)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(is_active)`;
      await sql`
        CREATE TABLE IF NOT EXISTS admin_sessions (
          id TEXT PRIMARY KEY,
          user_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
          session_token_hash TEXT NOT NULL UNIQUE,
          expires_at TIMESTAMPTZ NOT NULL,
          revoked_at TIMESTAMPTZ,
          user_agent TEXT,
          ip_address TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
        )
      `;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_user_id ON admin_sessions(user_id)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_admin_sessions_expires_at ON admin_sessions(expires_at)`;
    })().catch((error) => {
      authSchemaEnsured = null;
      throw error;
    });
  }
  await authSchemaEnsured;
}

export async function findAdminUserByIdentifier(identifier: string): Promise<AdminUserRow | null> {
  await ensureAdminAuthSchema();
  const sql = getDb();
  const normalized = normalizeLoginIdentifier(identifier);
  const [row] = await sql<AdminUserRow[]>`
    SELECT id, name, email, username, password_hash, role, is_active, last_login_at, created_at, updated_at
    FROM admin_users
    WHERE lower(email) = ${normalized}
       OR lower(coalesce(username, '')) = ${normalized}
    LIMIT 1
  `;
  return row ?? null;
}

export async function updateAdminLastLogin(userId: string) {
  await ensureAdminAuthSchema();
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`
    UPDATE admin_users
    SET last_login_at = ${now}::timestamptz,
        updated_at = ${now}::timestamptz
    WHERE id = ${userId}
  `;
}

export async function getAdminUserCount(): Promise<number> {
  await ensureAdminAuthSchema();
  const sql = getDb();
  const [row] = await sql<{ count: string }[]>`
    SELECT count(*)::text AS count FROM admin_users
  `;
  return Number(row?.count ?? "0");
}

export async function getAdminUserById(userId: string): Promise<AdminUserRow | null> {
  await ensureAdminAuthSchema();
  const sql = getDb();
  const [row] = await sql<AdminUserRow[]>`
    SELECT id, name, email, username, password_hash, role, is_active, last_login_at, created_at, updated_at
    FROM admin_users
    WHERE id = ${userId}
    LIMIT 1
  `;
  return row ?? null;
}

export async function createAdminUser(input: {
  id: string;
  name: string;
  email: string;
  username?: string | null;
  passwordHash: string;
  role: "admin" | "editor";
}) {
  await ensureAdminAuthSchema();
  const sql = getDb();
  const now = new Date().toISOString();
  await sql`
    INSERT INTO admin_users (
      id, name, email, username, password_hash, role, is_active, created_at, updated_at
    ) VALUES (
      ${input.id}, ${input.name}, ${normalizeLoginIdentifier(input.email)},
      ${input.username ? normalizeLoginIdentifier(input.username) : null},
      ${input.passwordHash}, ${input.role}, true, ${now}::timestamptz, ${now}::timestamptz
    )
  `;
}

export interface AdminUserPublic {
  id: string;
  name: string;
  email: string;
  username: string | null;
  role: "admin" | "editor";
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

export async function listAdminUsers(): Promise<AdminUserPublic[]> {
  await ensureAdminAuthSchema();
  const sql = getDb();
  const rows = await sql<AdminUserPublic[]>`
    SELECT id, name, email, username, role, is_active, last_login_at, created_at
    FROM admin_users
    ORDER BY created_at DESC
  `;
  return rows;
}
