import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const migrationsDirectory = new URL("../supabase/migrations/", import.meta.url);
const files = (await readdir(migrationsDirectory)).filter((file) => file.endsWith(".sql")).sort();

if (files.length === 0) {
  throw new Error("No Supabase migrations found.");
}

const unsafeAdminGrant =
  /insert\s+into\s+public\.user_roles[\s\S]{0,300}['\"][0-9a-f]{8}-[0-9a-f-]{27,}['\"][\s\S]{0,100}admin/i;
const failures = [];

for (const file of files) {
  const sql = await readFile(join(migrationsDirectory.pathname, file), "utf8");
  if (unsafeAdminGrant.test(sql)) {
    failures.push(`${file}: contains a hardcoded administrator UUID`);
  }
}

if (failures.length > 0) {
  throw new Error(`Unsafe migration detected:\n${failures.join("\n")}`);
}

console.log(`Checked ${files.length} Supabase migrations.`);
