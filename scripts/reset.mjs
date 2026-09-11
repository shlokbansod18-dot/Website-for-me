#!/usr/bin/env node
/**
 * Deletes the local database and every uploaded file, then rebuilds an empty
 * database. Your .env — and therefore your encryption key — is left alone.
 *
 * Requires --yes, because this removes real orders and real customer records.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

import { SCHEMA } from "../src/lib/schema.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, "data"));

if (!process.argv.includes("--yes")) {
  console.log(`
  This deletes everything in ${dataDir}:
    · the database, including all accounts, orders and licence keys
    · every uploaded product file

  Re-run with:  npm run reset -- --yes
`);
  process.exit(1);
}

for (const name of ["softsystem.db", "softsystem.db-wal", "softsystem.db-shm"]) {
  const file = path.join(dataDir, name);
  if (fs.existsSync(file)) {
    fs.unlinkSync(file);
    console.log(`  removed ${name}`);
  }
}

const uploads = path.join(dataDir, "uploads");
if (fs.existsSync(uploads)) {
  const files = fs.readdirSync(uploads);
  for (const file of files) fs.unlinkSync(path.join(uploads, file));
  console.log(`  removed ${files.length} uploaded file${files.length === 1 ? "" : "s"}`);
}

fs.mkdirSync(uploads, { recursive: true, mode: 0o700 });
const db = new Database(path.join(dataDir, "softsystem.db"));
db.exec(SCHEMA);
db.close();

console.log("\n  Empty database created. Run `npm run seed` to fill the shop again.\n");
