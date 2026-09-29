import { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { modelAvailable } from "@/app/lib/aiClearedGrader";
import { runEvalSlice } from "@/app/lib/aiClearedEval";
import { EVAL_BANK } from "@/app/ai-cleared/engine/evalBank";

/* GET /api/ops/eval?from=0&count=10
 * Staff run the grader eval where the key lives: a slice of the 40-prompt
 * bank through the real grader, scored. The ops console calls it in
 * slices so one request stays well inside the function's time limit.
 * Nothing is stored; each call costs a few pence of model usage. */

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  if (!modelAvailable()) return Response.json({ error: "ANTHROPIC_API_KEY is not set on this deployment, so there is no model to evaluate." }, { status: 409 });
  const p = new URL(req.url).searchParams;
  const from = Math.max(0, Math.min(EVAL_BANK.length, Number(p.get("from") ?? 0) || 0));
  const count = Math.max(1, Math.min(10, Number(p.get("count") ?? 10) || 10));
  const results = await runEvalSlice(from, count);
  return Response.json({ from, count: results.length, total: EVAL_BANK.length, results });
}
