import { NextResponse, type NextRequest } from "next/server";

/**
 * Three jobs, all about keeping other people's code, other people's sites,
 * and signed-out visitors out of places they do not belong.
 *
 * 1. A per-request Content-Security-Policy nonce. Only scripts carrying this
 *    request's nonce run, so an injected `<script>` — the classic way a
 *    checkout page gets skimmed — is inert even if it somehow reaches the
 *    HTML.
 * 2. A same-origin check on every state-changing request, so another site
 *    cannot make a logged-in customer's browser buy something or change their
 *    password on their behalf.
 * 3. A fast bounce off signed-in-only pages, so a signed-out request is
 *    answered with a redirect instead of a rendered page.
 */

const MUTATING = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/** Pages that mean nothing without an account. */
const SIGNED_IN_ONLY = [/^\/account(\/|$)/, /^\/studio(\/|$)/, /^\/checkout(\/|$)/];

export function middleware(request: NextRequest) {
  const isDev = process.env.NODE_ENV !== "production";
  const { pathname, search } = request.nextUrl;

  /**
   * Middleware runs on the edge runtime and cannot open the database, so this
   * only checks that a session cookie is *present*. That is enough to turn
   * every signed-out request into a real 307 rather than a rendered page.
   * Whether the cookie is genuine is decided by `getCurrentUser()` inside each
   * page, which is the check that actually guards the data — a forged cookie
   * gets past this line and straight into a second redirect.
   */
  if (request.method === "GET" && SIGNED_IN_ONLY.some((re) => re.test(pathname))) {
    if (!request.cookies.has("ss_session")) {
      const login = new URL("/login", request.url);
      login.searchParams.set("next", pathname + search);
      return NextResponse.redirect(login, 307);
    }
  }

  if (MUTATING.has(request.method)) {
    const origin = request.headers.get("origin");
    if (origin) {
      const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
      let originHost = "";
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = "";
      }
      if (!host || originHost !== host) {
        return new NextResponse("Cross-origin request blocked.", { status: 403 });
      }
    }
  }

  const nonce = btoa(crypto.randomUUID());

  const csp = [
    `default-src 'self'`,
    // 'strict-dynamic' lets Next's own loader pull in its chunks; everything
    // else needs the nonce. 'unsafe-eval' is dev-only — React Refresh needs it.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https:${isDev ? " 'unsafe-eval'" : ""}`,
    // React writes inline style attributes, which style-src governs.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data:`,
    `font-src 'self' data:`,
    // No third-party analytics, no ad pixels, no external calls at all.
    `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `manifest-src 'self'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set(
    isDev ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy",
    csp,
  );
  return response;
}

export const config = {
  matcher: [
    // Everything except Next's own static output and image optimiser.
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
