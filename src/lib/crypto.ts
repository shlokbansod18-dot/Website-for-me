import "server-only";

import crypto from "node:crypto";

import { ENCRYPTION_KEY, SESSION_SECRET } from "./env";

/**
 * Small crypto toolbox. Three jobs:
 *   1. hash passwords (re-exported from ./hash.mjs, shared with the scripts)
 *   2. encrypt personal data before it touches the disk (AES-256-GCM)
 *   3. sign values we hand to the browser, e.g. the guest cart cookie
 *
 * Everything here uses Node's built-in crypto, so there is no third-party
 * dependency sitting between a customer's password and the database.
 */

export { fakePasswordWork, hashPassword, verifyPassword } from "./hash.mjs";

import { decryptJSON as decrypt, encryptJSON as encrypt } from "./encryption.mjs";

/* ── Encryption at rest (AES-256-GCM) ──────────────────────────────────── */

/**
 * Thin wrappers that bind the primitives in ./encryption.mjs to this app's
 * key, so no caller has to handle the key itself. The seed script uses the
 * same primitives with the key from the environment, which is why demo orders
 * decrypt correctly in the running app.
 */
export function encryptJSON(value: unknown): string {
  return encrypt(ENCRYPTION_KEY, value);
}

export function decryptJSON<T>(payload: string | null | undefined): T | null {
  return decrypt(ENCRYPTION_KEY, payload) as T | null;
}

/* ── Signing & hashing helpers ─────────────────────────────────────────── */

export function hmac(value: string): string {
  return crypto.createHmac("sha256", SESSION_SECRET).update(value).digest("base64url");
}

export function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("base64url");
}

/** Signs a payload so the browser can hold it without being able to forge it. */
export function sign(payload: string): string {
  return `${payload}.${hmac(payload)}`;
}

export function unsign(signed: string | undefined | null): string | null {
  if (!signed) return null;
  const index = signed.lastIndexOf(".");
  if (index < 1) return null;
  const payload = signed.slice(0, index);
  const provided = signed.slice(index + 1);
  const expected = hmac(payload);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;
  return payload;
}

export function randomToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function randomId(): string {
  return crypto.randomUUID();
}

/**
 * A short, human-friendly, unambiguous code — used for order numbers and
 * licence keys. Skips characters people confuse (0/O, 1/I).
 */
export function humanCode(length = 6): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.randomBytes(length);
  let out = "";
  for (let i = 0; i < length; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}
