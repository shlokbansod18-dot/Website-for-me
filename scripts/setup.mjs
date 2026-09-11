#!/usr/bin/env node
/**
 * First-run setup. Safe to run any number of times.
 *
 *   • creates ./data (the SQLite file and uploaded product files live there)
 *   • writes a .env with freshly generated secrets, if you do not have one
 *   • creates the database tables
 *
 * `npm run dev` runs this automatically, so a fresh clone needs nothing more
 * than `npm install && npm run dev`.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

import { SCHEMA } from "../src/lib/schema.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, "data"));
const envPath = path.join(root, ".env");

const key = () => crypto.randomBytes(32).toString("hex");
const say = (icon, message) => console.log(`  ${icon}  ${message}`);

console.log("\n  SoftSystem — setup\n");

/* 1. Storage ------------------------------------------------------------- */

for (const dir of [dataDir, path.join(dataDir, "uploads")]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
    say("+", `created ${path.relative(root, dir) || dir}/`);
  }
}

/* 2. Secrets ------------------------------------------------------------- */

if (fs.existsSync(envPath)) {
  // Fill in any blank secrets without disturbing anything already set.
  let env = fs.readFileSync(envPath, "utf8");
  let touched = false;
  for (const name of ["SESSION_SECRET", "ENCRYPTION_KEY"]) {
    const pattern = new RegExp(`^${name}\\s*=\\s*["']?\\s*["']?\\s*$`, "m");
    if (pattern.test(env)) {
      env = env.replace(pattern, `${name}="${key()}"`);
      touched = true;
      say("+", `generated ${name}`);
    }
  }
  if (touched) fs.writeFileSync(envPath, env, { mode: 0o600 });
  else say("=", ".env already configured");
} else {
  const template = fs.readFileSync(path.join(root, ".env.example"), "utf8");
  const env = template
    .replace(/^SESSION_SECRET=.*$/m, `SESSION_SECRET="${key()}"`)
    .replace(/^ENCRYPTION_KEY=.*$/m, `ENCRYPTION_KEY="${key()}"`);
  fs.writeFileSync(envPath, env, { mode: 0o600 });
  say("+", "wrote .env with newly generated secrets");
}

/* 3. Database ------------------------------------------------------------ */

const db = new Database(path.join(dataDir, "softsystem.db"));
db.pragma("journal_mode = WAL");
db.exec(SCHEMA);

const tables = db
  .prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table'")
  .get().n;
db.close();
say("=", `database ready (${tables} tables)`);

console.log(`
  Next:
    npm run seed     fill the shop with example products and demo logins
    npm run dev      start the site on http://localhost:3000
`);
