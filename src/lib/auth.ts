import "server-only";

import { cookies } from "next/headers";
import crypto from "node:crypto";
import { cache } from "react";

import { getDb, now } from "./db";
import { randomId, randomToken, sha256 } from "./crypto";
import { clientFingerprint } from "./request";
import { IS_PROD } from "./env";
import type { PublicUser, Role, SessionRow, UserRow } from "./types";

export const SESSION_COOKIE = "ss_session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const SESSION_REFRESH_MS = 24 * 60 * 60 * 1000;

/**
 * Sessions use the split-token pattern: the cookie carries `id.secret`, the
 * database stores only a SHA-256 of the secret. A stolen database dump
 * therefore cannot be replayed as a login, and lookups stay a fast indexed
 * primary-key hit rather than a scan.
 */

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true as const,
    sameSite: "lax" as const,
    secure: IS_PROD,
    path: "/",
    maxAge,
  };
}

export async function createSession(userId: string): Promise<void> {
  const id = randomId();
  const secret = randomToken(32);
  const { ipHash, userAgent } = await clientFingerprint();
  const ts = now();

  getDb()
    .prepare(
      `INSERT INTO sessions (id, user_id, token_hash, user_agent, ip_hash, created_at, last_seen_at, expires_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(id, userId, sha256(secret), userAgent, ipHash, ts, ts, ts + SESSION_TTL_MS);

  const jar = await cookies();
  jar.set(SESSION_COOKIE, `${id}.${secret}`, cookieOptions(SESSION_TTL_MS / 1000));
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (raw) {
    const [id] = raw.split(".");
    if (id) getDb().prepare("DELETE FROM sessions WHERE id = ?").run(id);
  }
  jar.set(SESSION_COOKIE, "", cookieOptions(0));
}

export function revokeSession(sessionId: string, userId: string) {
  getDb().prepare("DELETE FROM sessions WHERE id = ? AND user_id = ?").run(sessionId, userId);
}

export function revokeOtherSessions(userId: string, keepSessionId: string) {
  getDb().prepare("DELETE FROM sessions WHERE user_id = ? AND id != ?").run(userId, keepSessionId);
}

export function revokeAllSessions(userId: string) {
  getDb().prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    marketingOptIn: row.marketing_opt_in === 1,
    createdAt: row.created_at,
  };
}

/**
 * Resolves the signed-in user for the current request. `cache()` means a page
 * that asks five times still hits the database once.
 */
export const getCurrentSession = cache(
  async (): Promise<{ user: PublicUser; sessionId: string } | null> => {
    const jar = await cookies();
    const raw = jar.get(SESSION_COOKIE)?.value;
    if (!raw) return null;

    const separator = raw.indexOf(".");
    if (separator < 1) return null;
    const id = raw.slice(0, separator);
    const secret = raw.slice(separator + 1);

    const db = getDb();
    const session = db.prepare("SELECT * FROM sessions WHERE id = ?").get(id) as
      | SessionRow
      | undefined;
    if (!session) return null;

    const expected = Buffer.from(session.token_hash);
    const actual = Buffer.from(sha256(secret));
    if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) return null;

    if (session.expires_at <= now()) {
      db.prepare("DELETE FROM sessions WHERE id = ?").run(id);
      return null;
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.user_id) as
      | UserRow
      | undefined;
    if (!user) return null;

    if (now() - session.last_seen_at > SESSION_REFRESH_MS) {
      db.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").run(now(), id);
    }

    return { user: toPublicUser(user), sessionId: id };
  },
);

export async function getCurrentUser(): Promise<PublicUser | null> {
  return (await getCurrentSession())?.user ?? null;
}

/**
 * This is a single-seller shop. Only the owner ever lists anything; every
 * other account can buy, download and manage itself, and nothing else.
 *
 * The "seller" role stays in the type so existing rows keep parsing, but it
 * grants nothing. Widening this one function is the only way to turn the
 * shop back into a marketplace, which is exactly where that decision belongs.
 */
export function canSell(role: Role): boolean {
  return role === "owner";
}

export function listSessions(userId: string): SessionRow[] {
  return getDb()
    .prepare("SELECT * FROM sessions WHERE user_id = ? ORDER BY last_seen_at DESC")
    .all(userId) as SessionRow[];
}
