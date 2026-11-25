import { prisma } from "@/app/lib/prisma";

/**
 * GET /api/health: is the app up, and can it reach its database?
 *
 * For uptime monitors and smoke checks. It runs one `SELECT 1` and nothing
 * else: no writes, no table reads, no secrets or error text in the reply.
 * 200 {ok:true,db:"ok"} when the database answers, 503 {ok:false,db:"down"}
 * when it does not.
 *
 * Never cached: route handlers are dynamic by default, force-dynamic keeps
 * it that way, and the reply says no-store so no CDN or browser holds an
 * old answer. /api is outside the launch gate, so monitors reach it without
 * the site password.
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const NO_STORE = { "Cache-Control": "no-store, max-age=0" };

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return Response.json({ ok: true, db: "ok" }, { headers: NO_STORE });
  } catch {
    return Response.json({ ok: false, db: "down" }, { status: 503, headers: NO_STORE });
  }
}
