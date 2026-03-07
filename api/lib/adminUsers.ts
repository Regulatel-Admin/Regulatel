import { getDb } from "./db.js";

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

export async function findAdminUserByIdentifier(identifier: string): Promise<AdminUserRow | null> {
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
  const sql = getDb();
  const [row] = await sql<{ count: string }[]>`
    SELECT count(*)::text AS count FROM admin_users
  `;
  return Number(row?.count ?? "0");
}

export async function getAdminUserById(userId: string): Promise<AdminUserRow | null> {
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
