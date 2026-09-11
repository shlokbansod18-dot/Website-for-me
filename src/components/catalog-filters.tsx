"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

const SORTS = [
  { value: "trending", label: "Trending" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

/**
 * Wrapped in a real `<form method="get">` pointing at this same page, so the
 * filters still work with JavaScript switched off — the client code below
 * just makes them instant.
 */
export function CatalogFilters({
  categories,
  resultCount,
}: {
  categories: string[];
  resultCount: number;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  const activeCategory = params.get("category") ?? "All";
  const activeSort = params.get("sort") ?? "trending";
  const [search, setSearch] = useState(params.get("q") ?? "");
  const firstRender = useRef(true);

  function apply(next: Record<string, string | null>) {
    const query = new URLSearchParams(params.toString());
    for (const [key, value] of Object.entries(next)) {
      if (!value || value === "All" || (key === "sort" && value === "trending")) query.delete(key);
      else query.set(key, value);
    }
    const qs = query.toString();
    startTransition(() => router.replace(qs ? `/products?${qs}` : "/products", { scroll: false }));
  }

  // Debounced so typing does not fire a request per keystroke.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => apply({ q: search.trim() || null }), 260);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <form
      action="/products"
      method="get"
      // The header is 64px on phones and 96px from md up, where the promise
      // bar appears — the offsets here have to match or this bar tucks under it.
      className="sticky top-16 z-30 -mx-5 mb-10 border-y border-line bg-canvas/85 px-5 py-4 backdrop-blur-xl md:top-24 md:-mx-8 md:px-8"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="relative lg:w-72">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-faint"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden
          >
            <circle cx="11" cy="11" r="6.5" />
            <path strokeLinecap="round" d="M16 16l4.5 4.5" />
          </svg>
          <input
            type="search"
            name="q"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products, tags, creators"
            aria-label="Search products"
            className="w-full rounded-full border border-line bg-surface-2 py-2.5 pl-11 pr-4 text-sm outline-none transition-colors placeholder:text-faint hover:border-line-strong focus:border-acid focus:ring-2 focus:ring-acid/20"
          />
        </div>

        {/* Horizontally scrollable on phones so the pills never wrap into a wall. */}
        <div className="-mx-5 flex flex-1 gap-2 overflow-x-auto px-5 pb-1 lg:mx-0 lg:px-0 lg:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {["All", ...categories].map((category) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                onClick={() => apply({ category: category === "All" ? null : category })}
                aria-pressed={active}
                className={`shrink-0 rounded-full border px-3.5 py-1.5 text-[0.8125rem] transition-colors ${
                  active
                    ? "border-acid bg-acid text-acid-ink"
                    : "border-line text-dim hover:border-line-strong hover:text-text"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3">
          <label htmlFor="sort" className="sr-only">
            Sort by
          </label>
          <select
            id="sort"
            name="sort"
            value={activeSort}
            onChange={(e) => apply({ sort: e.target.value })}
            className="cursor-pointer rounded-full border border-line bg-surface-2 py-2.5 pl-4 pr-9 text-[0.8125rem] outline-none transition-colors hover:border-line-strong focus:border-acid"
          >
            {SORTS.map((sort) => (
              <option key={sort.value} value={sort.value}>
                {sort.label}
              </option>
            ))}
          </select>

          <span
            className={`numeric hidden whitespace-nowrap text-xs text-faint transition-opacity sm:block ${pending ? "opacity-40" : ""}`}
            aria-live="polite"
          >
            {resultCount} result{resultCount === 1 ? "" : "s"}
          </span>

          <noscript>
            <button
              type="submit"
              className="rounded-full bg-acid px-4 py-2 text-[0.8125rem] font-medium text-acid-ink"
            >
              Apply
            </button>
          </noscript>
        </div>
      </div>
    </form>
  );
}
