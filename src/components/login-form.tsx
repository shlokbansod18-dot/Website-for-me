"use client";

import { useActionState, useState } from "react";

import { signInAction } from "@/actions/auth";
import { Field, Notice } from "@/components/ui/field";
import type { ActionState } from "@/lib/types";

const initial: ActionState = { ok: false };

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signInAction, initial);
  const [showPassword, setShowPassword] = useState(false);
  const errors = state.fieldErrors ?? {};
  // React clears a `<form action>` once the action settles; the action hands
  // the email back so a wrong password does not mean retyping it.
  const kept = state.values ?? {};

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {state.message ? <Notice tone="error">{state.message}</Notice> : null}

      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={kept.email ?? ""}
        autoComplete="email"
        autoFocus
        required
        placeholder="you@example.com"
        error={errors.email}
      />

      <div className="relative">
        <Field
          label="Password"
          name="password"
          type={showPassword ? "text" : "password"}
          autoComplete="current-password"
          required
          placeholder="••••••••••"
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute right-4 top-[2.4rem] text-[0.6875rem] text-faint transition-colors hover:text-acid"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-acid text-sm font-medium text-acid-ink transition-[filter] hover:brightness-110 disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="spin size-4 rounded-full border-2 border-current border-t-transparent" />
            Signing in…
          </>
        ) : (
          "Sign in"
        )}
      </button>

      <p className="text-center text-[0.6875rem] leading-relaxed text-faint">
        After eight wrong attempts an account locks itself for fifteen minutes. That is deliberate —
        it makes guessing your password impractical.
      </p>
    </form>
  );
}
