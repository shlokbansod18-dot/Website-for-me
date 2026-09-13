"use client";

import { useActionState } from "react";

import { applyCouponAction, removeCouponAction } from "@/actions/cart";
import type { ActionState } from "@/lib/types";

const initial: ActionState = { ok: false };

export function CouponForm({ applied }: { applied: string | null }) {
  const [state, formAction, pending] = useActionState(applyCouponAction, initial);

  if (applied) {
    return (
      <form action={removeCouponAction} className="flex items-center justify-between gap-3">
        <span className="flex min-w-0 items-center gap-2 text-[0.8125rem]">
          <span aria-hidden className="text-accent">
            ✓
          </span>
          <span className="truncate font-mono text-xs uppercase tracking-wide text-accent">
            {applied}
          </span>
          <span className="shrink-0 text-ink-3">applied</span>
        </span>
        <button
          type="submit"
          className="shrink-0 text-xs text-ink-3 underline-offset-4 transition-colors hover:text-alert hover:underline"
        >
          Remove
        </button>
      </form>
    );
  }

  return (
    <form action={formAction}>
      <label htmlFor="code" className="sr-only">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input
          id="code"
          name="code"
          placeholder="Coupon code"
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 rounded border border-line bg-surface-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider outline-none transition-colors placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-ink-3 hover:border-line-2 focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full border border-line-2 px-4 text-[0.8125rem] transition-colors hover:border-accent hover:text-accent disabled:opacity-50"
        >
          {pending ? "…" : "Apply"}
        </button>
      </div>
      {state.message ? (
        <p
          role="status"
          className={`mt-2 text-xs ${state.ok ? "text-accent" : "text-alert"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
