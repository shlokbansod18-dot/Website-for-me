#!/usr/bin/env node
/**
 * Promotes an existing account to owner, which unlocks the Creator Studio.
 *
 *   npm run make-owner -- you@example.com
 *
 * This is the safe way to claim a live shop. There is no email verification
 * in the sign-up flow, so nothing on the public site can be allowed to hand
 * out owner access on the strength of a typed address alone — running this
 * requires shell access to the server, which is the actual proof of ownership.
 *
 * Register through the site first with your own password, then run this.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import Database from "better-sqlite3";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.resolve(process.env.DATA_DIR || path.join(root, "data"));

const email = (process.argv[2] || "").trim().toLowerCase();

if (!email || !email.includes("@")) {
  console.log(`
  Promote an account to owner (unlocks the Creator Studio).

    npm run make-owner -- you@example.com

  The account has to exist already — sign up through the site first, with a
  password you chose. This only changes that account's role.
`);
  process.exit(1);
}

const db = new Database(path.join(dataDir, "softsystem.db"));
const user = db.prepare("SELECT id, email, name, role FROM users WHERE email = ?").get(email);

if (!user) {
  console.log(`
  No account found for ${email}.

  Sign up on the site with that address first, then run this again. This
  script deliberately cannot create accounts — an account made here would
  need a password, and a password set from a command line tends to end up
  in your shell history.
`);
  process.exit(1);
}

if (user.role === "owner") {
  console.log(`\n  ${user.email} is already an owner. Nothing to do.\n`);
  process.exit(0);
}

db.prepare("UPDATE users SET role = 'owner', updated_at = ? WHERE id = ?").run(Date.now(), user.id);
db.close();

console.log(`
  ${user.email} is now an owner (was ${user.role}).

  The Creator Studio is at /studio. Sign out and back in if it was already
  open in a tab.
`);
