import Link from "next/link";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/logo";

/**
 * Shared frame for sign-in and sign-up: the form on the left, and a bold
 * editorial panel on the right that only appears once there is room for it.
 */
export function AuthShell({
  label,
  title,
  subtitle,
  children,
  footer,
  panel,
}: {
  label: string;
  title: ReactNode;
  subtitle: string;
  children: ReactNode;
  footer: ReactNode;
  panel: { heading: string; points: string[] };
}) {
  return (
    <div className="shell grid gap-12 py-14 lg:grid-cols-2 lg:gap-20 lg:py-24">
      <div className="mx-auto w-full max-w-md">
        <p className="label">{label}</p>
        <h1 className="display-2 mt-3">{title}</h1>
        <p className="mt-4 text-[0.9375rem] text-ink-2">{subtitle}</p>

        <div className="mt-9">{children}</div>

        <div className="mt-8 border-t border-line pt-6 text-[0.8125rem] text-ink-2">{footer}</div>
      </div>

      <aside className="relative hidden overflow-hidden rounded-[2rem] border border-line bg-surface p-10 lg:flex lg:flex-col lg:justify-between">
        <div
          className="bloom -right-24 -top-24 size-80 opacity-25"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="bloom -bottom-32 -left-20 size-72 opacity-20"
          style={{ background: "var(--accent)" }}
        />

        <div className="relative">
          <LogoMark className="size-9" />
          <h2 className="mt-8 font-display text-3xl leading-[1.08]">
            {panel.heading}
          </h2>
        </div>

        <ul className="relative mt-12 space-y-5">
          {panel.points.map((point) => (
            <li key={point} className="flex gap-3.5 text-[0.875rem] leading-relaxed text-ink-2">
              <span aria-hidden className="mt-0.5 shrink-0 text-accent">
                ✓
              </span>
              {point}
            </li>
          ))}
        </ul>

        <p className="relative mt-12 border-t border-line pt-6 text-[0.6875rem] leading-relaxed text-ink-3">
          We ask for an email and a password. Not a phone number, not a date of birth, not your
          contacts. Read the{" "}
          <Link href="/legal/privacy" className="underline underline-offset-2 hover:text-ink-2">
            privacy policy
          </Link>{" "}
         , it is short on purpose.
        </p>
      </aside>
    </div>
  );
}
