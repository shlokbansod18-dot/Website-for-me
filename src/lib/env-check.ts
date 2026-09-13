/**
 * Environment validation, deliberately free of any Node built-in imports.
 *
 * `src/instrumentation.ts` is compiled for the edge runtime as well as the
 * Node one, so anything it reaches must work in both. Pulling in `lib/env.ts`
 * — which touches `node:fs` to manage the data directory — breaks the edge
 * build outright. This module reads `process.env` and nothing else, so both
 * runtimes and the startup check can share one definition of "configured".
 */

export type SecretName = "SESSION_SECRET" | "ENCRYPTION_KEY";

const HEX_64 = /^[0-9a-fA-F]{64}$/;

/** Returns a human-readable problem with one secret, or null if it is fine. */
export function keyProblem(name: SecretName): string | null {
  const raw = (process.env[name] || "").trim();
  if (HEX_64.test(raw)) return null;
  return raw
    ? `${name} is malformed — it must be exactly 64 hex characters.`
    : `${name} is not set. It must be 64 hex characters.`;
}

/**
 * Browsers treat localhost as a secure context, so a Secure cookie is returned
 * over plain HTTP there. That makes `npm run build && npm start` on your own
 * machine — the normal way to check a production build before shipping it —
 * legitimate, and it must not trip the HTTPS requirement.
 */
function isLoopback(url: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?(\/|$)/i.test(url);
}

/** Everything wrong with the current environment, in the order worth fixing. */
export function configProblems(): string[] {
  const problems: string[] = [];

  for (const name of ["SESSION_SECRET", "ENCRYPTION_KEY"] as const) {
    const problem = keyProblem(name);
    if (problem) problems.push(problem);
  }

  const appUrl = (process.env.APP_URL || "").trim();
  if (!appUrl) {
    problems.push("APP_URL is not set. Invoices and links would point at localhost.");
  } else if (!appUrl.startsWith("https://") && !isLoopback(appUrl)) {
    problems.push(
      `APP_URL is "${appUrl}". It has to start with https:// in production — session ` +
        "cookies are marked Secure, and a browser will not send those over plain HTTP.",
    );
  }

  return problems;
}
