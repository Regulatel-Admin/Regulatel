/**
 * Neon Postgres connection. Uses only process.env.DATABASE_URL.
 * No credentials in code.
 */

import postgres from "postgres";

const connectionString = process.env.DATABASE_URL;

function getSql() {
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return postgres(connectionString, {
    max: 1,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

let sql: ReturnType<typeof postgres> | null = null;

export function getDb() {
  if (!sql) {
    sql = getSql();
  }
  return sql;
}

export function isDbConfigured(): boolean {
  return Boolean(connectionString);
}
