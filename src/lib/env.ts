import "server-only";

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { keyProblem } from "./env-check";

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

/**
 * `next build` evaluates server modules to collect page data, so this file is
 * imported during the build as well as at runtime — and the build runs with
 * NODE_ENV=production. Without this check a container build would demand the
 * production secrets just to compile, which is both wrong and a good way to
 * end up baking them into an image.
 *
 * Nothing is served during a build, so a throwaway key is safe here. The real
 * requirement is enforced at startup instead, in src/instrumentation.ts.
 */
const isBuildPhase = process.env.NEXT_PHASE === "phase-production-build";

function readKey(name: "SESSION_SECRET" | "ENCRYPTION_KEY"): Buffer {
  const raw = (process.env[name] || "").trim();
  if (/^[0-9a-fA-F]{64}$/.test(raw)) return Buffer.from(raw, "hex");

  if (isBuildPhase) return crypto.randomBytes(32);

  if (isProd) {
    throw new Error(
      `${keyProblem(name)} ` +
        `Set it in your host's environment settings, or run "npm run setup" locally.`,
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

// Storage is a runtime concern; a build must not create directories.
if (!isBuildPhase) ensureDataDir();
