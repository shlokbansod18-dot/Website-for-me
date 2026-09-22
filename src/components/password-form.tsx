"use client";

import { useActionState, useState } from "react";

import { changePasswordAction } from "@/actions/account";
import { Field, Notice } from "@/components/ui/field";
import { STRENGTH_LABELS, passwordStrength } from "@/lib/password-strength";
import type { ActionState } from "@/lib/types";

const initial: ActionState = { ok: false };

export function PasswordForm() {
  const [state, formAction, pending] = useActionState(changePasswordAction, initial);
  const [next, setNext] = useState("");
  const errors = state.fieldErrors ?? {};

  const score = passwordStrength(next);
  const tone = ["bg-alert", "bg-alert", "bg-accent", "bg-accent", "bg-accent"][score];

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice>
      ) : null}

      <Field
        label="Current password"
        name="currentPassword"
        type="password"
        autoComplete="current-password"
        required
        error={errors.currentPassword}
      />

      <div>
        <Field
          label="New password"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={next}
          onChange={(e) => setNext(e.target.value)}
          error={errors.newPassword}
          hint="10+ characters"
        />
        {next ? (
          <div className="mt-3">
            <div className="flex gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${i < score ? tone : "bg-line-2"}`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[0.6875rem] text-ink-3" aria-live="polite">
              Strength: <span className="text-ink-2">{STRENGTH_LABELS[score]}</span>
            </p>
          </div>
        ) : null}
      </div>

      <Field
        label="Confirm new password"
        name="confirmPassword"
        type="password"
        autoComplete="new-password"
        required
        error={errors.confirmPassword}
      />

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded bg-accent px-6 text-sm font-medium text-on-accent transition-[filter] hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update password"}
      </button>

      <p className="text-[0.6875rem] leading-relaxed text-ink-3">
        Changing your password signs out every other device immediately, which is exactly what you
        want if you are changing it because you think someone else has it.
      </p>
    </form>
  );
}
