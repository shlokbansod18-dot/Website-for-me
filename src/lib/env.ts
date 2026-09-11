import "server-only";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Central place where every secret and path is resolved once.
 *
 * In production the process refuses to start without real secrets. In
 * development we fall back to a locally generated key file so that
 * `npm run dev` works on a fresh clone without any manual steps.
 */

const isProd = process.env.NODE_ENV === "production";

export const DATA_DIR = path.resolve(process.env.DATA_DIR || "./data");
export const UPLOAD_DIR = path.join(DATA_DIR, "uploads");

function ensureDataDir() {
  for (const dir of [DATA_DIR, UPLOAD_DIR]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  }
}

/**
 * Development-only secrets. Written once to data/.dev-secrets.json (which is
 * gitignored) so sessions survive a dev-server restart.
 */
function devSecret(name: string): string {
  ensureDataDir();
  const file = path.join(DATA_DIR, ".dev-secrets.json");
  let store: Record<string, string> = {};
  try {
    store = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    store = {};
  }
  if (!store[name]) {
    store[name] = crypto.randomBytes(32).toString("hex");
    fs.writeFileSync(file, JSON.stringify(store, null, 2), { mode: 0o600 });
  }
  return store[name];
}

function readKey(name: "SESSION_SECRET" | "ENCRYPTION_KEY"): Buffer {
  const raw = (process.env[name] || "").trim();
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");

  if (isProd) {
    throw new Error(
      `${name} is missing or malformed. It must be 64 hex characters. ` +
        `Run "npm run setup" to generate a .env file, or set it in your host's environment settings.`,
    );
  }
  return Buffer.from(devSecret(name), "hex");
}

export const SESSION_SECRET = readKey("SESSION_SECRET");
export const ENCRYPTION_KEY = readKey("ENCRYPTION_KEY");

export const APP_URL = (process.env.APP_URL || "http://localhost:3000").replace(/\/+$/, "");

/** The email that is granted Studio (seller) access when it registers. */
export const OWNER_EMAIL = (process.env.OWNER_EMAIL || "").trim().toLowerCase();

export const IS_PROD = isProd;

ensureDataDir();
