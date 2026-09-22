"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/actions/account";
import { Checkbox, Field, Notice } from "@/components/ui/field";
import type { ActionState, PublicUser } from "@/lib/types";

const initial: ActionState = { ok: false };

export function ProfileForm({ user }: { user: PublicUser }) {
  const [state, formAction, pending] = useActionState(updateProfileAction, initial);
  const errors = state.fieldErrors ?? {};
  const kept = state.values ?? {};

  return (
    <form action={formAction} className="space-y-5">
      {state.message ? (
        <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice>
      ) : null}

      <Field
        label="Display name"
        name="name"
        defaultValue={kept.name ?? user.name}
        autoComplete="name"
        required
        error={errors.name}
        hint="Shown on your receipts"
      />

      <div>
        <label htmlFor="email-display" className="mb-2 block text-[0.8125rem] font-medium">
          Email
        </label>
        <input
          id="email-display"
          value={user.email}
          readOnly
          disabled
          className="w-full cursor-not-allowed rounded border border-line bg-paper px-4 py-3 text-sm text-ink-3"
        />
        <p className="mt-1.5 text-[0.6875rem] text-ink-3">
          Your email is your sign-in and where receipts go. Changing it needs a verification step we
          have not built yet. For now, contact support.
        </p>
      </div>

      <div className="border-t border-line pt-5">
        <Checkbox name="marketingOptIn" defaultChecked={user.marketingOptIn}>
          Send me occasional email about new products and updates. Off by default; unsubscribing is
          one click and we never pass your address to anyone else.
        </Checkbox>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 items-center justify-center rounded bg-accent px-6 text-sm font-medium text-on-accent transition-[filter] hover:brightness-110 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
