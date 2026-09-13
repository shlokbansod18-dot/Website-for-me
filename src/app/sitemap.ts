import type { MetadataRoute } from "next";

import { listProducts } from "@/lib/catalog";
import { APP_URL } from "@/lib/env";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${APP_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${APP_URL}/products`, changeFrequency: "daily", priority: 0.9 },
    { url: `${APP_URL}/sell`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${APP_URL}/security`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${APP_URL}/help`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${APP_URL}/legal/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/legal/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${APP_URL}/legal/refunds`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const products = listProducts().map((product) => ({
    url: `${APP_URL}/products/${product.slug}`,
    lastModified: new Date(product.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...products];
}
