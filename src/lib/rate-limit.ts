import "server-only";

import { getDb, now } from "./db";
import { randomId } from "./crypto";

/**
 * A fixed-window rate limiter backed by the same SQLite file as everything
 * else, so it survives restarts and needs no extra infrastructure.
 *
 * Used to blunt password guessing, signup floods and download scraping.
 */
export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const db = getDb();
  const ts = now();

  const row = db.prepare("SELECT count, reset_at FROM rate_limits WHERE bucket = ?").get(key) as
    | { count: number; reset_at: number }
    | undefined;

  if (!row || row.reset_at <= ts) {
    db.prepare(
      `INSERT INTO rate_limits (bucket, count, reset_at) VALUES (?, 1, ?)
       ON CONFLICT(bucket) DO UPDATE SET count = 1, reset_at = excluded.reset_at`,
    ).run(key, ts + windowMs);
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  if (row.count >= limit) {
    return {
      ok: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((row.reset_at - ts) / 1000)),
    };
  }

  db.prepare("UPDATE rate_limits SET count = count + 1 WHERE bucket = ?").run(key);
  return { ok: true, remaining: limit - row.count - 1, retryAfterSeconds: 0 };
}

/** Occasionally clears expired buckets so the table cannot grow forever. */
export function sweepRateLimits() {
  if (Math.random() > 0.02) return;
  getDb().prepare("DELETE FROM rate_limits WHERE reset_at < ?").run(now());
}

export function audit(
  action: string,
  opts: { userId?: string | null; detail?: unknown; ipHash?: string | null } = {},
) {
  try {
    getDb()
      .prepare(
        "INSERT INTO audit_log (id, user_id, action, detail, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      )
      .run(
        randomId(),
        opts.userId ?? null,
        action,
        opts.detail === undefined ? null : JSON.stringify(opts.detail),
        opts.ipHash ?? null,
        now(),
      );
  } catch {
    // Auditing must never break the user-facing request.
  }
}
