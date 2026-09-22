import type { MetadataRoute } from "next";

import { APP_URL } from "@/lib/env";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Anything behind a sign-in, or that reflects one person's data, stays
      // out of search results.
      disallow: ["/account", "/account/", "/studio", "/studio/", "/checkout", "/cart", "/api/"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
