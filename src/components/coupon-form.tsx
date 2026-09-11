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
          <span aria-hidden className="text-acid">
            ✓
          </span>
          <span className="truncate font-mono text-xs uppercase tracking-wide text-acid">
            {applied}
          </span>
          <span className="shrink-0 text-faint">applied</span>
        </span>
        <button
          type="submit"
          className="shrink-0 text-xs text-faint underline-offset-4 transition-colors hover:text-flare hover:underline"
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
          className="min-w-0 flex-1 rounded-full border border-line bg-surface-2 px-4 py-2.5 font-mono text-xs uppercase tracking-wider outline-none transition-colors placeholder:font-sans placeholder:normal-case placeholder:tracking-normal placeholder:text-faint hover:border-line-strong focus:border-acid"
        />
        <button
          type="submit"
          disabled={pending}
          className="shrink-0 rounded-full border border-line-strong px-4 text-[0.8125rem] transition-colors hover:border-acid hover:text-acid disabled:opacity-50"
        >
          {pending ? "…" : "Apply"}
        </button>
      </div>
      {state.message ? (
        <p
          role="status"
          className={`mt-2 text-xs ${state.ok ? "text-acid" : "text-flare"}`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
