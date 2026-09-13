"use server";

import { redirect } from "next/navigation";

import { createSession, destroySession } from "@/lib/auth";
import { fakePasswordWork, hashPassword, randomId, verifyPassword } from "@/lib/crypto";
import { getDb, now } from "@/lib/db";
import { OWNER_EMAIL } from "@/lib/env";
import { audit, rateLimit, sweepRateLimits } from "@/lib/rate-limit";
import { clientFingerprint } from "@/lib/request";
import { keepValues } from "@/lib/form-values";
import { fieldErrors, loginSchema, signupSchema } from "@/lib/validation";
import type { ActionState, UserRow } from "@/lib/types";

const LOCKOUT_THRESHOLD = 8;
const LOCKOUT_MS = 15 * 60 * 1000;

/** Only ever redirect to a path on this site — never to a URL a form supplied. */
function safeNext(value: FormDataEntryValue | null): string {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") ? next : "/account";
}

export async function signUpAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  sweepRateLimits();
  const { ipHash } = await clientFingerprint();

  // Everything the person typed except the password, so a rejected sign-up
  // does not make them fill the form in again.
  const keep = keepValues(formData, ["name", "email"]);

  const limit = rateLimit(`signup:${ipHash}`, 5, 60 * 60 * 1000);
  if (!limit.ok) {
    return {
      ok: false,
      message: "Too many accounts created from here. Try again in a little while.",
      values: keep,
    };
  }

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    marketingOptIn: formData.get("marketingOptIn") === "on",
    acceptTerms: formData.get("acceptTerms") === "on",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error), values: keep };
  }

  const { name, email, password, marketingOptIn } = parsed.data;
  const db = getDb();

  const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
  if (existing) {
    return {
      ok: false,
      fieldErrors: { email: "That email already has an account. Sign in instead." },
      values: keep,
    };
  }

  const id = randomId();
  const ts = now();

  /**
   * OWNER_EMAIL is a one-time bootstrap, not a standing rule.
   *
   * There is no email verification here, so "this address always becomes the
   * owner" would let whoever registers it first take the shop. Instead the
   * grant only applies while no owner exists — register right after deploying
   * and it is yours; after that the door is shut and `npm run make-owner`
   * is the only way in, which needs server access.
   */
  const ownerExists = Boolean(
    db.prepare("SELECT 1 AS x FROM users WHERE role = 'owner' LIMIT 1").get(),
  );
  const role = OWNER_EMAIL && email === OWNER_EMAIL && !ownerExists ? "owner" : "customer";

  try {
    db.prepare(
      `INSERT INTO users (id, email, name, password_hash, role, marketing_opt_in, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    ).run(id, email, name, hashPassword(password), role, marketingOptIn ? 1 : 0, ts, ts);
  } catch {
    return { ok: false, message: "We could not create that account. Please try again.", values: keep };
  }

  await createSession(id);
  audit("user.signup", { userId: id, ipHash });

  redirect(safeNext(formData.get("next")));
}

export async function signInAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  sweepRateLimits();
  const { ipHash } = await clientFingerprint();

  const keep = keepValues(formData, ["email"]);

  const limit = rateLimit(`login:${ipHash}`, 12, 10 * 60 * 1000);
  if (!limit.ok) {
    return {
      ok: false,
      message: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.`,
      values: keep,
    };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error), values: keep };
  }

  const { email, password } = parsed.data;
  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as UserRow | undefined;

  // Deliberately identical wording and timing whether the email exists or not:
  // otherwise this form becomes a way to discover who has an account here.
  const generic: ActionState = {
    ok: false,
    message: "That email and password do not match.",
    values: keep,
  };

  if (!user) {
    fakePasswordWork();
    audit("user.login_failed", { detail: { reason: "no_user" }, ipHash });
    return generic;
  }

  if (user.locked_until && user.locked_until > now()) {
    const minutes = Math.ceil((user.locked_until - now()) / 60000);
    return {
      ok: false,
      message: `This account is locked for ${minutes} more minute${minutes === 1 ? "" : "s"} after repeated failed sign-ins.`,
      values: keep,
    };
  }

  if (!verifyPassword(password, user.password_hash)) {
    const failures = user.failed_logins + 1;
    const lockUntil = failures >= LOCKOUT_THRESHOLD ? now() + LOCKOUT_MS : null;
    db.prepare("UPDATE users SET failed_logins = ?, locked_until = ? WHERE id = ?").run(
      failures,
      lockUntil,
      user.id,
    );
    audit("user.login_failed", { userId: user.id, detail: { failures }, ipHash });
    return generic;
  }

  db.prepare("UPDATE users SET failed_logins = 0, locked_until = NULL WHERE id = ?").run(user.id);
  await createSession(user.id);
  audit("user.login", { userId: user.id, ipHash });

  redirect(safeNext(formData.get("next")));
}

export async function signOutAction() {
  await destroySession();
  redirect("/");
}
