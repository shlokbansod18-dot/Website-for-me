import { configProblems } from "./lib/env-check";

/**
 * Runs once when the server starts, before it accepts a request.
 *
 * Without this, a production deploy with no SESSION_SECRET starts cleanly,
 * passes its health check, and then throws on the first request that touches
 * the database — a site that looks up and is entirely broken. Failing here
 * instead means the container exits immediately and the platform reports a
 * failed deploy, which is what you want to see.
 */
export async function register() {
  // Middleware runs on the edge runtime, which has no secrets of its own and
  // no filesystem; the check belongs to the Node server that serves requests.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.NODE_ENV !== "production") return;

  const problems = configProblems();

  if (problems.length > 0) {
    const lines = problems.map((p) => `  · ${p}`).join("\n");
    throw new Error(
      `\n\nsoftsystem cannot start — the environment is incomplete:\n\n${lines}\n\n` +
        "Generate each key with:\n" +
        "  node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\"\n\n" +
        "Then set them in your host's environment settings. See DEPLOY.md.\n",
    );
  }

  // One line in the deploy log, with nothing sensitive in it.
  console.log(
    `softsystem ready · ${process.env.APP_URL} · data in ${process.env.DATA_DIR || "./data"}`,
  );
}
