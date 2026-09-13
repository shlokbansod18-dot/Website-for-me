import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ProductForm } from "@/components/product-form";
import { canSell, getCurrentUser } from "@/lib/auth";
import { CATEGORIES } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "New product",
  robots: { index: false, follow: false },
};

export default async function NewProductPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/studio/new");
  if (!canSell(user.role)) redirect("/studio");

  return (
    <div className="shell py-12 lg:py-16">
      <header className="mb-10">
        <Link
          href="/studio"
          className="text-[0.8125rem] text-ink-3 transition-colors hover:text-ink"
        >
          ← Studio
        </Link>
        <h1 className="display-2 mt-4">New product</h1>
        <p className="mt-3 max-w-lg text-ink-2">
          Save it as a draft while you work on it. Nothing is visible to anyone until you publish.
        </p>
      </header>

      <ProductForm categories={[...CATEGORIES]} />
    </div>
  );
}
