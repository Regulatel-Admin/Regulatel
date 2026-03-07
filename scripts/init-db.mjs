/**
 * Run db/schema.sql against the database in DATABASE_URL.
 * Use: npm run db:init
 * Ensure .env has DATABASE_URL set (or export it in the shell).
 */
import "dotenv/config";
import postgres from "postgres";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "..", "db", "schema.sql");

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL no está definido. Configúralo en .env o exporta la variable.");
  }

  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  const sql = postgres(databaseUrl, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  try {
    await sql.unsafe(schemaSql);
    console.log("Tablas e índices creados correctamente en Neon.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
