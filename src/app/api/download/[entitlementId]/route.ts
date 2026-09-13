import { NextResponse } from "next/server";

import { getCurrentUser } from "@/lib/auth";
import { getDb, now } from "@/lib/db";
import { readUpload } from "@/lib/files";
import { audit, rateLimit } from "@/lib/rate-limit";
import { clientFingerprint } from "@/lib/request";

export const dynamic = "force-dynamic";

/**
 * The only way a product file ever leaves the server.
 *
 * Uploads live outside the web root, so there is no URL that serves them
 * directly — a request has to come through here, carrying a session that owns
 * an entitlement for that exact product. Guessing the id of someone else's
 * entitlement gets a 404, not a file.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ entitlementId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to download your purchases." }, { status: 401 });
  }

  const { entitlementId } = await params;

  const limit = rateLimit(`download:${user.id}`, 60, 60 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Download limit reached for now. Try again shortly." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } },
    );
  }

  const db = getDb();
  const row = db
    .prepare(
      `SELECT e.id, e.downloads_used, p.file_path, p.file_name, p.title
       FROM entitlements e
       JOIN products p ON p.id = e.product_id
       WHERE e.id = ? AND e.user_id = ?`,
    )
    .get(entitlementId, user.id) as
    | {
        id: string;
        downloads_used: number;
        file_path: string | null;
        file_name: string | null;
        title: string;
      }
    | undefined;

  // Same response whether the entitlement belongs to someone else or does not
  // exist, so this endpoint cannot be used to probe what other people own.
  if (!row || !row.file_path) {
    return NextResponse.json({ error: "Not found." }, { status: 404 });
  }

  const bytes = await readUpload(row.file_path);
  if (!bytes) {
    return NextResponse.json(
      { error: "That file is temporarily unavailable. Please contact support." },
      { status: 503 },
    );
  }

  db.prepare("UPDATE entitlements SET downloads_used = downloads_used + 1 WHERE id = ?").run(row.id);
  const { ipHash } = await clientFingerprint();
  audit("product.downloaded", { userId: user.id, detail: { entitlementId: row.id }, ipHash });

  /**
   * Anything that reaches a response header gets scrubbed again here. Upload
   * already strips control characters from the stored name, but a stray CR or
   * LF in a header value is how header injection works — it is not a check
   * worth relying on one layer for.
   */
  const filename = (row.file_name || `${row.title}.zip`)
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f"\\]/g, "")
    .slice(0, 120)
    .trim() || "download";

  return new NextResponse(new Uint8Array(bytes), {
    status: 200,
    headers: {
      // Always a generic binary type, never the uploaded file's own MIME. An
      // SVG or HTML file served with its real type could run script on this
      // origin; as an octet-stream attachment it can only ever be saved.
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${filename}"; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "Content-Length": String(bytes.byteLength),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store, max-age=0",
      "X-Robots-Tag": "noindex, nofollow",
      "X-Download-Timestamp": String(now()),
    },
  });
}
