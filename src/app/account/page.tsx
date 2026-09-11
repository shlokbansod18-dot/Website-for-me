import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductCover } from "@/components/product-cover";
import { ButtonLink } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth";
import { formatBytes, formatDate } from "@/lib/money";
import { listLibrary } from "@/lib/orders";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your library",
  robots: { index: false, follow: false },
};

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  const library = listLibrary(user.id);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-[-0.035em]">Your library</h2>
          <p className="mt-1 text-[0.8125rem] text-dim">
            {library.length === 0
              ? "Everything you buy shows up here, forever."
              : `${library.length} product${library.length === 1 ? "" : "s"} · download as many times as you like`}
          </p>
        </div>
        {library.length > 0 && (
          <ButtonLink href="/products" variant="outline" size="sm">
            Find something new
          </ButtonLink>
        )}
      </div>

      {library.length === 0 ? (
        <div className="card grid place-items-center px-6 py-20 text-center">
          <span aria-hidden className="font-display text-4xl text-faint">
            ◌
          </span>
          <h3 className="mt-5 font-display text-lg font-bold">Nothing here yet</h3>
          <p className="mt-2 max-w-xs text-sm text-dim">
            Once you buy something it lands here instantly, with its licence key and every future
            update.
          </p>
          <ButtonLink href="/products" className="mt-7">
            Browse the shop
          </ButtonLink>
        </div>
      ) : (
        <ul className="space-y-px overflow-hidden rounded-[1.5rem] border border-line">
          {library.map((entry) => (
            <li key={entry.entitlementId} className="bg-surface p-5">
              <div className="flex flex-wrap items-center gap-4">
                <ProductCover
                  seed={entry.product.slug}
                  accent={entry.product.accent}
                  glyph={entry.product.glyph}
                  size="sm"
                  className="size-16 shrink-0 rounded-xl border border-line"
                />

                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${entry.product.slug}`}
                    className="font-display text-[0.9375rem] font-bold tracking-[-0.03em] transition-colors hover:text-acid"
                  >
                    {entry.product.title}
                  </Link>
                  <p className="mt-0.5 text-xs text-faint">
                    v{entry.product.version} · {formatBytes(entry.product.fileSize)} · bought{" "}
                    {formatDate(entry.purchasedAt)}
                  </p>
                </div>

                <a
                  href={`/api/download/${entry.entitlementId}`}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-acid px-5 text-[0.8125rem] font-medium text-acid-ink transition-[filter] hover:brightness-110"
                >
                  <DownloadIcon />
                  Download
                </a>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4 text-xs">
                <span className="text-faint">Licence key</span>
                <code className="rounded-md border border-line bg-canvas px-2 py-1 font-mono text-[0.6875rem] tracking-wider text-acid">
                  {entry.licenceKey}
                </code>
                <span className="text-faint">
                  {entry.downloadsUsed === 0
                    ? "Not downloaded yet"
                    : `Downloaded ${entry.downloadsUsed} time${entry.downloadsUsed === 1 ? "" : "s"}`}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v11m0 0l4-4m-4 4l-4-4M5 19h14" />
    </svg>
  );
}
