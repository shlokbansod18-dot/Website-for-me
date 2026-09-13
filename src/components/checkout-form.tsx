"use client";

import { useActionState, useState } from "react";

import { checkoutAction } from "@/actions/checkout";
import { Field, Notice, Select } from "@/components/ui/field";
import { COUNTRIES } from "@/lib/countries";
import type { ActionState } from "@/lib/types";

const initial: ActionState = { ok: false };

/** Groups digits the way the panel networks print them. */
function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  if (/^3[47]/.test(digits)) {
    return digits.replace(/(\d{4})(\d{0,6})(\d{0,5})/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(" "),
    );
  }
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function brandOf(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 2) return null;
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^6(?:011|5)/.test(digits)) return "Discover";
  if (/^(60|65|81|82)/.test(digits)) return "RuPay";
  return null;
}

export function CheckoutForm({ defaultName }: { defaultName: string }) {
  const [state, formAction, pending] = useActionState(checkoutAction, initial);

  /**
   * React resets a `<form action>` once the action settles. Card details are
   * held in component state so a declined payment does not empty the fields
   * the customer has to retype — and unlike the billing fields below they are
   * never echoed back from the server, so no part of a panel makes a round trip.
   */
  const [panel, setCard] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cardName, setCardName] = useState(defaultName);
  const [cvc, setCvc] = useState("");

  const errors = state.fieldErrors ?? {};
  const brand = brandOf(panel);

  /** Billing fields survive a failed submit by coming back from the action. */
  const kept = state.values ?? {};

  return (
    <form action={formAction} className="space-y-8">
      {state.message ? <Notice tone="error">{state.message}</Notice> : null}

      {/* ── Billing ──────────────────────────────────────────────────────── */}
      <section className="panel p-6 sm:p-7">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-lg">Billing details</h2>
          <span className="label">Step 1</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full name"
            name="fullName"
            defaultValue={kept.fullName ?? defaultName}
            autoComplete="name"
            required
            error={errors.fullName}
            className="sm:col-span-2"
          />
          <Select
            label="Country"
            name="country"
            defaultValue={kept.country ?? "United States"}
            autoComplete="country-name"
            required
            error={errors.country}
          >
            {COUNTRIES.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </Select>
          <Field
            label="City"
            name="city"
            defaultValue={kept.city ?? ""}
            autoComplete="address-level2"
            required
            error={errors.city}
          />
          <Field
            label="Street address"
            name="addressLine"
            defaultValue={kept.addressLine ?? ""}
            autoComplete="street-address"
            required
            error={errors.addressLine}
            className="sm:col-span-2"
          />
          <Field
            label="Postal / ZIP code"
            name="postalCode"
            defaultValue={kept.postalCode ?? ""}
            autoComplete="postal-code"
            required
            error={errors.postalCode}
          />
          <Field
            label="Tax ID"
            name="taxId"
            defaultValue={kept.taxId ?? ""}
            hint="optional"
            placeholder="VAT, GST or GSTIN"
            autoComplete="off"
            error={errors.taxId}
          />
        </div>

        <p className="mt-5 flex gap-2.5 text-[0.6875rem] leading-relaxed text-ink-3">
          <LockIcon />
          <span>
            This address is encrypted with AES-256-GCM before it is written to disk. It is used for
            your invoice and nothing else — never for advertising, never shared, never sold.
          </span>
        </p>
      </section>

      {/* ── Payment ──────────────────────────────────────────────────────── */}
      <section className="panel p-6 sm:p-7">
        <div className="mb-6 flex items-baseline justify-between">
          <h2 className="font-display text-lg">Payment</h2>
          <span className="label">Step 2</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="relative sm:col-span-2">
            <Field
              label="Card number"
              name="cardNumber"
              value={panel}
              onChange={(e) => setCard(formatCardNumber(e.target.value))}
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="4242 4242 4242 4242"
              required
              error={errors.cardNumber}
              className="[&_input]:font-mono [&_input]:tracking-wider"
            />
            {brand ? (
              <span className="pointer-events-none absolute right-4 top-[2.35rem] rounded-md border border-line bg-paper px-2 py-0.5 text-[0.625rem] font-medium text-ink-2">
                {brand}
              </span>
            ) : null}
          </div>

          <Field
            label="Name on panel"
            name="cardName"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            autoComplete="cc-name"
            required
            error={errors.cardName}
            className="sm:col-span-2"
          />

          <Field
            label="Expiry"
            name="expiry"
            value={expiry}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
              setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
            }}
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM/YY"
            required
            error={errors.expiry}
            className="[&_input]:font-mono"
          />
          <Field
            label="Security code"
            name="cvc"
            value={cvc}
            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
            inputMode="numeric"
            autoComplete="cc-csc"
            maxLength={4}
            placeholder="123"
            required
            error={errors.cvc}
            className="[&_input]:font-mono"
          />
        </div>

        <div className="mt-6 rounded border border-line bg-surface-2 p-4">
          <p className="flex gap-2.5 text-[0.6875rem] leading-relaxed text-ink-3">
            <ShieldIcon />
            <span>
              <span className="text-ink-2">Your panel number is never stored.</span> It exists only for
              the instant the payment is authorised, then it is gone. All we keep is the brand and
              the last four digits, so your receipt can say &ldquo;Visa ending 4242&rdquo;.
            </span>
          </p>
        </div>

        <details className="mt-4 text-[0.6875rem] text-ink-3">
          <summary className="cursor-pointer transition-colors hover:text-ink-2">
            This is a demo processor — what should I type?
          </summary>
          <div className="mt-3 space-y-1.5 border-l border-line pl-4 font-mono">
            <p>4242 4242 4242 4242 — approved</p>
            <p>4000 0000 0000 0002 — declined by bank</p>
            <p>4000 0000 0000 0119 — network timeout</p>
            <p className="font-sans">Any future expiry date and any 3-digit code will do.</p>
          </div>
        </details>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-accent text-[0.9375rem] font-medium text-on-accent transition-[filter,transform] hover:brightness-110 active:translate-y-px disabled:opacity-60"
      >
        {pending ? (
          <>
            <span className="spin size-4 rounded-full border-2 border-current border-t-transparent" />
            Authorising payment…
          </>
        ) : (
          <>
            <LockIcon />
            Pay and download now
          </>
        )}
      </button>

      <p className="text-center text-[0.6875rem] text-ink-3">
        By paying you agree to our{" "}
        <a href="/legal/terms" className="underline underline-offset-2 hover:text-ink-2">
          terms
        </a>{" "}
        and{" "}
        <a href="/legal/refunds" className="underline underline-offset-2 hover:text-ink-2">
          refund policy
        </a>
        .
      </p>
    </form>
  );
}

function LockIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      aria-hidden
    >
      <rect x="4.5" y="10.5" width="15" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 018 0v3" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-3.5 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      aria-hidden
    >
      <path strokeLinejoin="round" d="M12 3l7 3v5.5c0 4.4-2.9 8.2-7 9.5-4.1-1.3-7-5.1-7-9.5V6l7-3z" />
    </svg>
  );
}
