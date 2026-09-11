import "server-only";

import { headers } from "next/headers";

import { hmac } from "./crypto";

/**
 * Everything we learn about the caller — deliberately reduced to what we
 * actually need. The raw IP address never reaches the database; only a keyed
 * hash of it does, which is enough to rate-limit and to show "last seen from a
 * new device" without keeping a log of where customers live.
 */
export async function clientFingerprint() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for") || "";
  const ip = (forwarded.split(",")[0] || h.get("x-real-ip") || "local").trim();
  const userAgent = h.get("user-agent") || "";
  return {
    ipHash: hmac(`ip:${ip}`),
    /** Truncated so a device label can never become a tracking surface. */
    userAgent: shortUserAgent(userAgent),
  };
}

function shortUserAgent(ua: string): string {
  if (!ua) return "Unknown device";
  const browser =
    /Edg\//.test(ua) ? "Edge"
    : /OPR\//.test(ua) ? "Opera"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari"
    : "Browser";
  const os =
    /Windows/.test(ua) ? "Windows"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iOS/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux"
    : "";
  return os ? `${browser} on ${os}` : browser;
}
