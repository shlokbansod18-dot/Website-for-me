import crypto from "node:crypto";

/**
 * Password hashing, in plain JavaScript so the seed script can create a demo
 * account with exactly the same hash format the running app expects.
 *
 * scrypt is deliberately slow and, more importantly, memory-hard: the 32 MB
 * working set is cheap for one login and ruinous for someone trying billions
 * of guesses on rented GPUs. It ships inside Node, so nothing between a
 * customer's password and the database is third-party code.
 */
const PARAMS = { N: 32768, r: 8, p: 1, keylen: 64, maxmem: 96 * 1024 * 1024 };

export function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password.normalize("NFKC"), salt, PARAMS.keylen, PARAMS);
  return [
    "scrypt",
    PARAMS.N,
    PARAMS.r,
    PARAMS.p,
    salt.toString("base64url"),
    hash.toString("base64url"),
  ].join("$");
}

export function verifyPassword(password, stored) {
  try {
    const [scheme, n, r, p, saltB64, hashB64] = String(stored).split("$");
    if (scheme !== "scrypt") return false;
    const salt = Buffer.from(saltB64, "base64url");
    const expected = Buffer.from(hashB64, "base64url");
    const actual = crypto.scryptSync(password.normalize("NFKC"), salt, expected.length, {
      N: Number(n),
      r: Number(r),
      p: Number(p),
      maxmem: PARAMS.maxmem,
    });
    return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

/**
 * Burns roughly the same CPU as a real check. Called when an email is not
 * registered so that "no such account" and "wrong password" take the same
 * time — otherwise response timing alone reveals who has an account here.
 */
export function fakePasswordWork() {
  crypto.scryptSync("decoy-password", crypto.randomBytes(16), PARAMS.keylen, PARAMS);
}
