import type { NextRequest } from "next/server";
import { applyRetention, planRetention, sendRetentionSummary, summarise } from "@/app/lib/retention";

/* GET /api/cron/retention
 *
 * The daily data-retention job, run by Vercel Cron (vercel.json). Vercel
 * sends `Authorization: Bearer <CRON_SECRET>` when the CRON_SECRET
 * environment variable is set, and nothing else can know it, so a request
 * without that exact header is refused. With no CRON_SECRET configured the
 * route refuses everybody rather than running open.
 *
 * In this release it is a DRY RUN: it works out what the policy would
 * remove, logs the counts, and emails ops one summary. applyRetention does
 * nothing while RETENTION_DELETE_ENABLED is false (app/lib/retention.ts). */

export const dynamic = "force-dynamic";
/* A plan reads a handful of tables; deletion, once on, walks accounts one
   at a time. Room for both without running forever. */
export const maxDuration = 300;

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Unauthorised." }, { status: 401 });
  }

  const plan = await planRetention();
  const applied = await applyRetention(plan);
  const summary = summarise(plan);

  console.log(
    "[retention]",
    applied.ran ? "ran" : "dry run",
    JSON.stringify(Object.fromEntries(summary.categories.map((c) => [c.key, { wouldDelete: c.wouldDelete, wouldWarn: c.wouldWarn ?? 0 }]))),
  );
  await sendRetentionSummary(plan, applied);

  return Response.json({ ok: true, ran: applied.ran, ...summary, deleted: applied.deleted, failures: applied.failures.length });
}
