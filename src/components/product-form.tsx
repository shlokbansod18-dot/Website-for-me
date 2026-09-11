"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { saveProductAction } from "@/actions/studio";
import { ProductCover } from "@/components/product-cover";
import { Field, Notice, Select, TextArea } from "@/components/ui/field";
import { formatBytes } from "@/lib/money";
import type { ActionState, Product } from "@/lib/types";

const initial: ActionState = { ok: false };

const ACCENT_SWATCHES = [
  { value: "acid", label: "Acid", color: "#d8ff3e" },
  { value: "violet", label: "Violet", color: "#8b6bff" },
  { value: "flare", label: "Flare", color: "#ff5f3c" },
  { value: "sky", label: "Sky", color: "#4fd4f5" },
];

const GLYPHS = ["◆", "◈", "▣", "✳", "▲", "⬢", "★", "♪", "◐", "⌘", "∆", "Aa"];

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: string[];
}) {
  const [state, formAction, pending] = useActionState(saveProductAction, initial);
  const errors = state.fieldErrors ?? {};

  /**
   * React empties a `<form action>` as soon as the action settles, so a single
   * validation slip would otherwise throw away a description someone just
   * spent ten minutes writing. The action hands every listing field back and
   * they are re-seeded here.
   */
  const kept = state.values ?? {};

  const [title, setTitle] = useState(product?.title ?? "");
  const [accent, setAccent] = useState(product?.accent ?? "acid");
  const [glyph, setGlyph] = useState(product?.glyph ?? "◆");
  const [fileName, setFileName] = useState<string | null>(null);

  // If the server sent a title back after a failed save, adopt it so the cover
  // preview matches what the form now shows.
  const [echoedTitle, setEchoedTitle] = useState<string | undefined>(undefined);
  if (kept.title !== undefined && kept.title !== echoedTitle) {
    setEchoedTitle(kept.title);
    setTitle(kept.title);
  }

  return (
    <form action={formAction} className="grid gap-8 lg:grid-cols-[1.6fr_1fr] lg:items-start">
      {product ? <input type="hidden" name="productId" value={product.id} /> : null}

      <div className="space-y-8">
        {state.message ? (
          <Notice tone={state.ok ? "success" : "error"}>{state.message}</Notice>
        ) : null}

        {/* ── The listing ─────────────────────────────────────────────── */}
        <section className="card p-6 sm:p-7">
          <h2 className="mb-6 font-display text-lg font-bold tracking-[-0.035em]">The listing</h2>

          <div className="space-y-5">
            <Field
              label="Title"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={90}
              placeholder="Nocturne UI"
              error={errors.title}
            />
            <Field
              label="One-line pitch"
              name="tagline"
              defaultValue={kept.tagline ?? product?.tagline}
              required
              maxLength={140}
              placeholder="A 340-component dark-first design system for Figma."
              error={errors.tagline}
              hint="Shown under the title everywhere"
            />
            <TextArea
              label="Description"
              name="description"
              defaultValue={kept.description ?? product?.description}
              required
              rows={9}
              placeholder={
                "What is it, who is it for, and what do they get?\n\nLeave a blank line between paragraphs."
              }
              error={errors.description}
              hint="Blank line = new paragraph"
            />
            <TextArea
              label="What's included"
              name="highlights"
              defaultValue={kept.highlights ?? product?.highlights.join("\n")}
              rows={5}
              placeholder={"340 components, all auto-layout\nLight and dark themes\nFree updates for life"}
              error={errors.highlights}
              hint="One per line, up to 8"
            />
            <Field
              label="Tags"
              name="tags"
              defaultValue={kept.tags ?? product?.tags.join(", ")}
              placeholder="figma, design system, dark mode"
              error={errors.tags}
              hint="Comma separated, up to 8"
            />
          </div>
        </section>

        {/* ── Price ───────────────────────────────────────────────────── */}
        <section className="card p-6 sm:p-7">
          <h2 className="mb-6 font-display text-lg font-bold tracking-[-0.035em]">Price</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Price (USD)"
              name="price"
              defaultValue={kept.price ?? (product ? (product.priceCents / 100).toFixed(2) : "")}
              required
              inputMode="decimal"
              placeholder="49"
              error={errors.price}
            />
            <Field
              label="Compare-at price"
              name="compareAt"
              defaultValue={
                kept.compareAt ??
                (product?.compareAtCents ? (product.compareAtCents / 100).toFixed(2) : "")
              }
              inputMode="decimal"
              placeholder="99"
              hint="optional"
              error={errors.compareAt}
            />
            <Select
              label="Category"
              name="category"
              defaultValue={kept.category ?? product?.category ?? "UI Kits"}
              error={errors.category}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </Select>
            <Field
              label="Version"
              name="version"
              defaultValue={kept.version ?? product?.version ?? "1.0"}
              placeholder="1.0"
              error={errors.version}
            />
            <Field
              label="Licence"
              name="licence"
              defaultValue={kept.licence ?? product?.licence ?? "Standard commercial licence"}
              className="sm:col-span-2"
              error={errors.licence}
            />
          </div>
        </section>

        {/* ── File ────────────────────────────────────────────────────── */}
        <section className="card p-6 sm:p-7">
          <h2 className="font-display text-lg font-bold tracking-[-0.035em]">Product file</h2>
          <p className="mt-1.5 text-[0.8125rem] text-dim">
            This is what buyers download. Stored outside the public folder and served only to
            accounts that have bought it.
          </p>

          <label
            htmlFor="file"
            className="mt-5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong bg-surface-2 px-6 py-10 text-center transition-colors hover:border-acid"
          >
            <span aria-hidden className="text-2xl text-faint">
              ⇧
            </span>
            <span className="text-[0.875rem] font-medium">
              {fileName ?? (product?.fileName ? "Replace the current file" : "Choose a file")}
            </span>
            <span className="text-[0.6875rem] text-faint">
              zip, pdf, font, image, audio, video, 3D — up to 24 MB
            </span>
            <input
              id="file"
              name="file"
              type="file"
              className="sr-only"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
          </label>

          {product?.fileName && !fileName ? (
            <p className="mt-3 flex flex-wrap items-center gap-2 text-xs text-faint">
              Currently attached:
              <code className="rounded border border-line bg-canvas px-2 py-1 font-mono text-[0.6875rem] text-dim">
                {product.fileName}
              </code>
              <span>{formatBytes(product.fileSize)}</span>
            </p>
          ) : null}

          {errors.file ? (
            <p role="alert" className="mt-3 text-xs text-flare">
              ▲ {errors.file}
            </p>
          ) : null}
        </section>
      </div>

      {/* ── Sidebar: art, status, save ────────────────────────────────── */}
      <aside className="space-y-4 lg:sticky lg:top-28">
        <section className="card overflow-hidden">
          <ProductCover
            seed={title || product?.slug || "preview"}
            accent={accent}
            glyph={glyph}
            className="aspect-[4/3] w-full"
          />
          <div className="p-6">
            <p className="eyebrow">Cover art</p>
            <p className="mt-2 text-[0.8125rem] leading-relaxed text-dim">
              Generated from your accent and symbol — no design tool needed.
            </p>

            <div className="mt-5">
              <span className="mb-2 block text-[0.8125rem] font-medium">Accent</span>
              <div className="flex gap-2">
                {ACCENT_SWATCHES.map((swatch) => (
                  <label
                    key={swatch.value}
                    className={`size-9 cursor-pointer rounded-full border-2 transition-transform hover:scale-110 ${
                      accent === swatch.value ? "border-text" : "border-transparent"
                    }`}
                    style={{ background: swatch.color }}
                    title={swatch.label}
                  >
                    <input
                      type="radio"
                      name="accent"
                      value={swatch.value}
                      checked={accent === swatch.value}
                      onChange={() => setAccent(swatch.value)}
                      className="sr-only"
                    />
                    <span className="sr-only">{swatch.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="mb-2 block text-[0.8125rem] font-medium">Symbol</span>
              <div className="flex flex-wrap gap-1.5">
                {GLYPHS.map((option) => (
                  <label
                    key={option}
                    className={`grid size-9 cursor-pointer place-items-center rounded-lg border font-display text-sm transition-colors ${
                      glyph === option
                        ? "border-acid bg-acid text-acid-ink"
                        : "border-line text-dim hover:border-line-strong"
                    }`}
                  >
                    <input
                      type="radio"
                      name="glyph"
                      value={option}
                      checked={glyph === option}
                      onChange={() => setGlyph(option)}
                      className="sr-only"
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="card p-6">
          <Select
            label="Status"
            name="status"
            defaultValue={kept.status ?? product?.status ?? "draft"}
          >
            <option value="draft">Draft — only you can see it</option>
            <option value="published">Published — live in the shop</option>
          </Select>

          <button
            type="submit"
            disabled={pending}
            className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-acid text-sm font-medium text-acid-ink transition-[filter] hover:brightness-110 disabled:opacity-60"
          >
            {pending ? (
              <>
                <span className="spin size-4 rounded-full border-2 border-current border-t-transparent" />
                Saving…
              </>
            ) : product ? (
              "Save changes"
            ) : (
              "Create product"
            )}
          </button>

          <Link
            href="/studio"
            className="mt-3 block text-center text-[0.8125rem] text-faint transition-colors hover:text-text"
          >
            Cancel
          </Link>
        </section>
      </aside>
    </form>
  );
}
