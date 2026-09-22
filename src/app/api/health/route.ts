import { NextResponse } from "next/server";

import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * What a load balancer polls to decide whether this instance should receive
 * traffic. It touches the database on purpose: a server that is listening but
 * cannot reach its data is not healthy, and answering "ok" in that state would
 * keep a broken instance in rotation.
 *
 * The response deliberately carries no version string, no paths and no counts.
 * This endpoint is reachable by anyone, and a health check is a favourite
 * place to accidentally publish the shape of your system.
 */
export async function GET() {
  try {
    getDb().prepare("SELECT 1").get();
  } catch {
    return NextResponse.json(
      { status: "unavailable" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  return NextResponse.json(
    { status: "ok" },
    { status: 200, headers: { "Cache-Control": "no-store" } },
  );
}
