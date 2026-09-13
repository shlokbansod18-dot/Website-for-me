import Link from "next/link";

const TABS = [
  { href: "/legal/privacy", label: "Privacy" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/refunds", label: "Refunds" },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell max-w-3xl py-16 lg:py-24">
      <nav aria-label="Legal documents" className="mb-12 flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className="rounded-full border border-line px-4 py-2 text-[0.8125rem] text-ink-2 transition-colors hover:border-accent hover:text-accent"
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      <article
        className="
          [&_h1]:display-2 [&_h1]:mb-4
          [&_h2]:mb-3 [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-[-0.035em]
          [&_p]:mb-4 [&_p]:text-[0.9375rem] [&_p]:leading-relaxed [&_p]:text-ink-2
          [&_ul]:mb-4 [&_ul]:space-y-2.5 [&_ul]:text-[0.9375rem] [&_ul]:leading-relaxed [&_ul]:text-ink-2
          [&_li]:relative [&_li]:pl-6
          [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:text-accent [&_li]:before:content-['—']
          [&_strong]:font-medium [&_strong]:text-ink
          [&_a]:text-accent [&_a]:underline-offset-4 hover:[&_a]:underline
          [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_code]:text-accent
        "
      >
        {children}
      </article>

      <aside className="panel mt-14 p-6">
        <p className="text-[0.8125rem] leading-relaxed text-ink-2">
          <strong className="font-medium text-ink">A note on these documents.</strong> They are
          written in plain English and describe exactly what this software does. They are a starting
          point, not legal advice — before you sell to the public, have someone qualified in your
          jurisdiction check them, particularly around consumer rights, tax on digital sales, and
          whichever privacy law applies where your customers live.
        </p>
      </aside>
    </div>
  );
}
