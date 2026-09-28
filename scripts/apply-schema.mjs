// Applies prisma/turso-init.sql to a Turso database, so you don't need
// the separate Turso CLI installed - just Node (already required for this project).
//
// Usage:
//   TURSO_DATABASE_URL="libsql://..." TURSO_AUTH_TOKEN="..." npm run db:push-turso

import { createClient } from "@libsql/client";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Missing TURSO_DATABASE_URL environment variable.");
  process.exit(1);
}

const sqlPath = path.join(__dirname, "..", "prisma", "turso-init.sql");
const sql = readFileSync(sqlPath, "utf8");

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);

const client = createClient({ url, authToken });

for (const statement of statements) {
  console.log(`Running: ${statement.slice(0, 60)}...`);
  await client.execute(statement);
}

console.log(`Done - applied ${statements.length} statements to ${url}`);
client.close();
