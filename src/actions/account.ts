"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  destroySession,
  getCurrentSession,
  revokeAllSessions,
  revokeOtherSessions,
  revokeSession,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/crypto";
import { getDb } from "@/lib/db";
import { audit, rateLimit } from "@/lib/rate-limit";
import { clientFingerprint } from "@/lib/request";
import { keepValues } from "@/lib/form-values";
import { fieldErrors, passwordChangeSchema, profileSchema } from "@/lib/validation";
import type { ActionState, UserRow } from "@/lib/types";

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, message: "Please sign in again." };

  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    marketingOptIn: formData.get("marketingOptIn") === "on",
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: fieldErrors(parsed.error), values: keepValues(formData, ["name"]) };
  }

  getDb()
    .prepare("UPDATE users SET name = ?, marketing_opt_in = ?, updated_at = ? WHERE id = ?")
    .run(parsed.data.name, parsed.data.marketingOptIn ? 1 : 0, Date.now(), session.user.id);

  audit("user.profile_updated", { userId: session.user.id });
  revalidatePath("/account", "layout");
  return { ok: true, message: "Saved." };
}

export async function changePasswordAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, message: "Please sign in again." };

  const { ipHash } = await clientFingerprint();
  const limit = rateLimit(`pwchange:${session.user.id}`, 6, 15 * 60 * 1000);
  if (!limit.ok) return { ok: false, message: "Too many attempts. Please wait a few minutes." };

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrors(parsed.error) };

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.user.id) as
    | UserRow
    | undefined;
  if (!user) return { ok: false, message: "Please sign in again." };

  if (!verifyPassword(parsed.data.currentPassword, user.password_hash)) {
    return { ok: false, fieldErrors: { currentPassword: "That is not your current password." } };
  }

  db.prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?").run(
    hashPassword(parsed.data.newPassword),
    Date.now(),
    user.id,
  );

  // A password change should kick every other device out — that is the whole
  // point of changing it when you think someone else has it.
  revokeOtherSessions(user.id, session.sessionId);
  audit("user.password_changed", { userId: user.id, ipHash });

  revalidatePath("/account/security");
  return { ok: true, message: "Password updated. Every other device has been signed out." };
}

export async function revokeSessionAction(formData: FormData): Promise<void> {
  const session = await getCurrentSession();
  if (!session) return;
  const target = String(formData.get("sessionId") ?? "");
  if (!target || target === session.sessionId) return;
  revokeSession(target, session.user.id);
  audit("user.session_revoked", { userId: session.user.id });
  revalidatePath("/account/security");
}

export async function signOutEverywhereAction(): Promise<void> {
  const session = await getCurrentSession();
  if (!session) return;
  revokeAllSessions(session.user.id);
  audit("user.signed_out_everywhere", { userId: session.user.id });
  await destroySession();
  redirect("/login");
}

/**
 * Exports everything we hold about the signed-in person, as JSON. Included
 * because a shop that stores personal data should be able to hand it back
 * without anyone having to write a support ticket.
 */
export async function exportDataAction(): Promise<ActionState & { payload?: string }> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, message: "Please sign in again." };

  const db = getDb();
  const userId = session.user.id;

  const user = db
    .prepare("SELECT id, email, name, role, marketing_opt_in, created_at FROM users WHERE id = ?")
    .get(userId);
  const orders = db
    .prepare(
      `SELECT order_number, status, subtotal_cents, discount_cents, total_cents, currency,
              coupon_code, payment_brand, payment_last4, created_at
       FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
    )
    .all(userId);
  const items = db
    .prepare(
      `SELECT oi.title, oi.price_cents, oi.licence_key, o.order_number
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.user_id = ?`,
    )
    .all(userId);
  const sessions = db
    .prepare("SELECT user_agent, created_at, last_seen_at, expires_at FROM sessions WHERE user_id = ?")
    .all(userId);
  const activity = db
    .prepare("SELECT action, created_at FROM audit_log WHERE user_id = ? ORDER BY created_at DESC LIMIT 200")
    .all(userId);

  audit("user.data_exported", { userId });

  return {
    ok: true,
    payload: JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        note:
          "This is everything SoftSystem stores about your account. Billing addresses are " +
          "encrypted at rest and are shown on each order page rather than here.",
        account: user,
        orders,
        purchasedItems: items,
        signedInDevices: sessions,
        recentActivity: activity,
      },
      null,
      2,
    ),
  };
}

/**
 * Deletes the account for real: ON DELETE CASCADE takes the sessions, orders,
 * line items and entitlements with it. Requires the password so a borrowed
 * laptop cannot be used to wipe someone's purchases.
 */
export async function deleteAccountAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getCurrentSession();
  if (!session) return { ok: false, message: "Please sign in again." };

  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "").trim();

  if (confirm.toUpperCase() !== "DELETE") {
    return { ok: false, fieldErrors: { confirm: 'Type DELETE to confirm.' } };
  }

  const db = getDb();
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(session.user.id) as
    | UserRow
    | undefined;
  if (!user) return { ok: false, message: "Please sign in again." };

  if (!verifyPassword(password, user.password_hash)) {
    return { ok: false, fieldErrors: { password: "That password is not correct." } };
  }

  db.prepare("DELETE FROM users WHERE id = ?").run(user.id);
  // The audit row deliberately keeps no user id — there is no user any more.
  audit("user.deleted");
  await destroySession();

  redirect("/?farewell=1");
}
