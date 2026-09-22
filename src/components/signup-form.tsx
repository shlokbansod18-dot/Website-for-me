"use client";

import { useActionState, useState } from "react";

import { signUpAction } from "@/actions/auth";
import { Checkbox, Field, Notice } from "@/components/ui/field";
import { STRENGTH_LABELS, passwordStrength } from "@/lib/password-strength";
import type { ActionState } from "@/lib/types";

const initial: ActionState = { ok: false };

export function SignupForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(signUpAction, initial);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const errors = state.fieldErrors ?? {};
  // Name and email come back from the action so a rejected sign-up does not
  // make someone fill the whole form in again.
  const kept = state.values ?? {};

  const score = passwordStrength(password);
  const tone = ["bg-alert", "bg-alert", "bg-accent", "bg-accent", "bg-accent"][score];

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="next" value={next} />

      {state.message ? <Notice tone="error">{state.message}</Notice> : null}

      <Field
        label="Your name"
        name="name"
        defaultValue={kept.name ?? ""}
        autoComplete="name"
        autoFocus
        required
        placeholder="Alex Rivera"
        error={errors.name}
      />

      <Field
        label="Email"
        name="email"
        type="email"
        defaultValue={kept.email ?? ""}
        autoComplete="email"
        required
        placeholder="you@example.com"
        error={errors.email}
      />

      <div>
        <div className="relative">
          <Field
            label="Password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            minLength={10}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 10 characters"
            error={errors.password}
            hint="10+ characters"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-4 top-[2.4rem] text-[0.6875rem] text-ink-3 transition-colors hover:text-accent"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {password ? (
          <div className="mt-3">
            <div className="flex gap-1" aria-hidden>
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                    i < score ? tone : "bg-line-2"
                  }`}
                />
              ))}
            </div>
            <p className="mt-1.5 text-[0.6875rem] text-ink-3" aria-live="polite">
              Strength: <span className="text-ink-2">{STRENGTH_LABELS[score]}</span>
              {score < 3 ? ", add length, or mix in a symbol." : ", that will do nicely."}
            </p>
          </div>
        ) : null}
      </div>

      <div className="space-y-3 pt-1">
        <Checkbox name="acceptTerms" required error={errors.acceptTerms}>
          I agree to the{" "}
          <a href="/legal/terms" className="text-accent underline-offset-2 hover:underline">
            terms of service
          </a>{" "}
          and{" "}
          <a href="/legal/privacy" className="text-accent underline-offset-2 hover:underline">
            privacy policy
          </a>
          .
        </Checkbox>

        <Checkbox name="marketingOptIn">
          Email me when something genuinely good lands. Off by default, and one click to stop.
        </Checkbox>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-accent text-sm font-medium text-on-accent transition-[filter] hover:brightness-110 disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="spin size-4 rounded-full border-2 border-current border-t-transparent" />
            Creating your account…
          </>
        ) : (
          "Create account"
        )}
      </button>

      <p className="text-center text-[0.6875rem] leading-relaxed text-ink-3">
        Your password is hashed with scrypt before it is stored. Nobody here, including us, can
        read it back.
      </p>
    </form>
  );
}
