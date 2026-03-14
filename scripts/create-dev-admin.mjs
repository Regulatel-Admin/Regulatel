/**
 * Crea un usuario admin de PRUEBA para desarrollo local (localhost).
 * USO: npm run admin:dev
 *
 * Credenciales por defecto:
 *   Email:    admin@regulatel.local
 *   Password: DevAdmin2026!
 *
 * IMPORTANTE: En producción elimina este usuario o no ejecutes este script.
 * Para borrarlo en Neon: DELETE FROM admin_users WHERE email = 'admin@regulatel.local';
 */
import "dotenv/config";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import postgres from "postgres";

const DEV_EMAIL = "admin@regulatel.local";
const DEV_PASSWORD = "DevAdmin2026!";
const DEV_NAME = "Admin Desarrollo";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definido. Configúralo en .env para ejecutar este script.");
  }

  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);
    const id = `usr_dev_${crypto.randomUUID()}`;
    const now = new Date().toISOString();

    await sql`
      INSERT INTO admin_users (
        id, name, email, username, password_hash, role, is_active, created_at, updated_at
      ) VALUES (
        ${id}, ${DEV_NAME}, ${DEV_EMAIL}, ${"admin-dev"}, ${passwordHash},
        ${"admin"}, true, ${now}::timestamptz, ${now}::timestamptz
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = ${passwordHash},
        updated_at = ${now}::timestamptz
    `;

    console.log("Usuario de desarrollo creado/actualizado.");
    console.log("  Email:   ", DEV_EMAIL);
    console.log("  Password:", DEV_PASSWORD);
    console.log("  Logueate en http://localhost:5173/login (o tu URL local).");
    console.log("");
    console.log("En producción: elimina este usuario o no uses este script.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
