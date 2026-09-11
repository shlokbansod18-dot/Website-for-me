import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { headers } from "next/headers";

import "./globals.css";
import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { APP_URL } from "@/lib/env";

/**
 * Fonts are served from our own origin, never from a font CDN. That keeps
 * `font-src 'self'` in the CSP and means visiting the shop does not hand a
 * third party a record of the visit.
 */
const bricolage = localFont({
  src: "../fonts/bricolage-grotesque-latin.woff2",
  weight: "300 800",
  style: "normal",
  display: "swap",
  variable: "--font-bricolage",
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

const inter = localFont({
  src: "../fonts/inter-latin.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  fallback: ["system-ui", "-apple-system", "Segoe UI", "sans-serif"],
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "SoftSystem — digital products, built to be sold",
    template: "%s · SoftSystem",
  },
  description:
    "A marketplace for publishing and selling digital products. Instant delivery, private by default, and a checkout that respects your customers.",
  applicationName: "SoftSystem",
  openGraph: {
    title: "SoftSystem — digital products, built to be sold",
    description:
      "Publish once. Sell everywhere. Instant delivery, encrypted billing, and no trackers.",
    url: APP_URL,
    siteName: "SoftSystem",
    type: "website",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#08080a",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The nonce is minted per request in src/middleware.ts. Any inline script
  // without it is refused by the Content-Security-Policy.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <body className={`${bricolage.variable} ${inter.variable} grain antialiased`}>
        {/* Marks the document as script-enabled and applies the saved theme,
            both before first paint — no flash, and no scroll animation that
            could leave content stranded at opacity 0 if script never runs. */}
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{
            __html:
              `document.documentElement.classList.add("js");` +
              `try{var t=localStorage.getItem("ss-theme");document.documentElement.dataset.theme=t==="light"?"light":"dark";}catch(e){}`,
          }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <Reveal />
      </body>
    </html>
  );
}
