import crypto from "node:crypto";

/**
 * AES-256-GCM for the personal data we have to keep — billing name, address,
 * tax ID. GCM authenticates as well as encrypts, so a row someone has tampered
 * with fails to decrypt rather than quietly returning something wrong.
 *
 * Plain JavaScript so the seed script can write demo orders in exactly the
 * format the running app reads back. The key is always passed in: nothing here
 * reaches for the environment on its own.
 */

export function encryptJSON(key, value) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const body = Buffer.concat([
    cipher.update(Buffer.from(JSON.stringify(value), "utf8")),
    cipher.final(),
  ]);
  return [
    "v1",
    iv.toString("base64url"),
    cipher.getAuthTag().toString("base64url"),
    body.toString("base64url"),
  ].join(".");
}

export function decryptJSON(key, payload) {
  if (!payload) return null;
  try {
    const [version, ivB64, tagB64, bodyB64] = String(payload).split(".");
    if (version !== "v1") return null;
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      key,
      Buffer.from(ivB64, "base64url"),
    );
    decipher.setAuthTag(Buffer.from(tagB64, "base64url"));
    const out = Buffer.concat([
      decipher.update(Buffer.from(bodyB64, "base64url")),
      decipher.final(),
    ]);
    return JSON.parse(out.toString("utf8"));
  } catch {
    // A wrong key, a truncated row or a tampered one all land here.
    return null;
  }
}
