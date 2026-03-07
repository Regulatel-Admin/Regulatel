/**
 * Cambiar contraseña de un usuario admin por email.
 * Uso: node scripts/change-password.mjs --email "user@domain.com" --password "nueva-clave"
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import postgres from "postgres";

function readArg(name) {
  const index = process.argv.findIndex((arg) => arg === `--${name}`);
  if (index === -1) return undefined;
  return process.argv[index + 1];
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL no está definido.");

  const email = readArg("email")?.trim()?.toLowerCase();
  const password = readArg("password");
  if (!email || !password) {
    throw new Error('Uso: node scripts/change-password.mjs --email "user@domain.com" --password "nueva-clave"');
  }

  const sql = postgres(databaseUrl, { max: 1, idle_timeout: 20, connect_timeout: 10 });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const result = await sql`
      UPDATE admin_users
      SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE lower(email) = ${email}
      RETURNING id, email
    `;
    if (result.length === 0) throw new Error(`No existe ningún usuario con email: ${email}`);
    console.log(`Contraseña actualizada para: ${result[0].email}`);
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
