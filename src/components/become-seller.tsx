"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { becomeSellerAction } from "@/actions/studio";

const PERKS = [
  "Keep 95% of every sale, one flat fee, no listing charges",
  "Cover art generated for you, so you can publish without a design tool",
  "Files delivered automatically, only to accounts that paid",
  "Licence keys issued per purchase, no work on your side",
  "Ship an update and every past buyer gets it free",
];

export function BecomeSeller({ name }: { name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function open() {
    setError(null);
    startTransition(async () => {
      const result = await becomeSellerAction();
      if (!result.ok) {
        setError(result.message ?? "Something went wrong. Try again.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="shell py-20 lg:py-28">
      <div className="panel relative mx-auto max-w-2xl overflow-hidden p-8 sm:p-12">
        <div
          className="bloom -right-24 -top-24 size-72 opacity-25"
          style={{ background: "var(--accent)" }}
        />

        <div className="relative">
          <p className="label">Creator studio</p>
          <h1 className="display-2 mt-3">
            Open your
            <br />
            <span className="text-accent">shop</span>, {name.split(" ")[0]}.
          </h1>
          <p className="mt-5 max-w-md text-[0.9375rem] leading-relaxed text-ink-2">
            Your account can start selling right now. No application, no waiting list, no interview
           , turn it on and upload your first product.
          </p>

          <ul className="mt-8 space-y-3.5">
            {PERKS.map((perk) => (
              <li key={perk} className="flex gap-3.5 text-[0.875rem] leading-relaxed text-ink-2">
                <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                  ✓
                </span>
                {perk}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={open}
            disabled={pending}
            className="mt-9 inline-flex h-13 items-center justify-center gap-2 rounded bg-accent px-8 text-[0.9375rem] font-medium text-on-accent transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            {pending ? (
              <>
                <span className="spin size-4 rounded-full border-2 border-current border-t-transparent" />
                Opening…
              </>
            ) : (
              <>
                Open my Studio
                <span aria-hidden>→</span>
              </>
            )}
          </button>

          {error ? (
            <p role="alert" className="mt-3 text-xs text-alert">
              {error}
            </p>
          ) : null}

          <p className="mt-6 text-[0.6875rem] leading-relaxed text-ink-3">
            Becoming a seller only lets you list your own products. It gives you no access to other
            creators&rsquo; work, to other customers, or to anything beyond your own rows.
          </p>
        </div>
      </div>
    </div>
  );
}
