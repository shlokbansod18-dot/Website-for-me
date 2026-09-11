import type { NextConfig } from "next";

/**
 * Headers that apply to every response, including static assets.
 * The Content-Security-Policy is *not* here — it carries a per-request nonce
 * and is therefore built in `src/middleware.ts`.
 */
const securityHeaders = [
  // Never let a browser guess a file's type; stops a text upload being run as script.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Belt-and-braces alongside the CSP frame-ancestors directive.
  { key: "X-Frame-Options", value: "DENY" },
  // Don't leak the page a customer came from — including any query string.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Switch off device APIs the store has no use for.
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), interest-cohort=()",
  },
  // Isolate our browsing context from anything that tries to open us.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  // Two years of HTTPS-only, applied once the site is served over TLS.
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // better-sqlite3 is a native module: keep it out of the bundler.
  serverExternalPackages: ["better-sqlite3"],

  // Don't advertise the framework version to anyone scanning for targets.
  poweredByHeader: false,

  experimental: {
    // Uploaded product files are streamed through a server action.
    serverActions: { bodySizeLimit: "25mb" },
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
