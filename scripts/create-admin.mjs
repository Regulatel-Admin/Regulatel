import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import postgres from "postgres";

function readArg(name) {
  const index = process.argv.findIndex((arg) => arg === `--${name}`);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

function normalize(value) {
  return value?.trim();
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definido.");
  }

  const name = normalize(readArg("name"));
  const email = normalize(readArg("email"))?.toLowerCase();
  const username = normalize(readArg("username"))?.toLowerCase();
  const password = readArg("password");
  const role = normalize(readArg("role")) || "admin";

  if (!name || !email || !password) {
    throw new Error(
      'Uso: npm run admin:create -- --name "Nombre" --email "correo@dominio.com" --password "tu-password" [--username "usuario"] [--role admin|editor]'
    );
  }

  if (!["admin", "editor"].includes(role)) {
    throw new Error('El rol debe ser "admin" o "editor".');
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const id = `usr_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    const existing = await sql`
      SELECT id
      FROM admin_users
      WHERE lower(email) = ${email}
         OR lower(coalesce(username, '')) = ${username ?? ""}
      LIMIT 1
    `;

    if (existing.length > 0) {
      throw new Error("Ya existe un admin con ese email o username.");
    }

    await sql`
      INSERT INTO admin_users (
        id, name, email, username, password_hash, role, is_active, created_at, updated_at
      ) VALUES (
        ${id}, ${name}, ${email}, ${username ?? null}, ${passwordHash},
        ${role}, true, ${now}::timestamptz, ${now}::timestamptz
      )
    `;

    console.log(`Admin creado correctamente: ${email} (${role})`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
