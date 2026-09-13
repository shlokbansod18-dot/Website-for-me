import "server-only";

import Database from "better-sqlite3";
import path from "node:path";

import { DATA_DIR } from "./env";
import { SCHEMA } from "./schema.mjs";

/**
 * A single SQLite connection, reused across hot reloads in development.
 *
 * Every query in this project goes through prepared statements with bound
 * parameters — user input is never concatenated into SQL, which is what keeps
 * SQL injection off the table entirely.
 */

declare global {
  // eslint-disable-next-line no-var
  var __softsystemDb: Database.Database | undefined;
}

function connect(): Database.Database {
  const db = new Database(path.join(DATA_DIR, "softsystem.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");
  migrate(db);
  return db;
}

function migrate(db: Database.Database) {
  db.exec(SCHEMA);
}

export function getDb(): Database.Database {
  if (!global.__softsystemDb) global.__softsystemDb = connect();
  return global.__softsystemDb;
}

export const now = () => Date.now();
