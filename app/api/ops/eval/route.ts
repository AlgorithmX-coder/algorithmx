import { NextRequest } from "next/server";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { KEY_STATUS_MESSAGE, apiKeyStatus } from "@/app/lib/anthropicClient";
import { runEvalSlice } from "@/app/lib/aiClearedEval";
import { runFluentSlice } from "@/app/lib/aiFluentEval";
import { EVAL_BANK } from "@/app/ai-cleared/engine/evalBank";
import { FLUENT_BANK } from "@/app/ai-fluent/engine/fluentBank";

/* GET /api/ops/eval?from=0&count=10[&course=ai-fluent]
 * Staff run a grader eval where the key lives: a slice of the 40-prompt
 * bank through the real grader, scored. Cleared's leak grader by default;
 * Fluent's rubric grader with course=ai-fluent. The ops console calls it
 * in slices so one request stays well inside the function's time limit.
 * Nothing is stored; each call costs a few pence of model usage. */

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const key = apiKeyStatus();
  if (key !== "ok") return Response.json({ error: `${KEY_STATUS_MESSAGE[key]} There is no model to evaluate until it is fixed.` }, { status: 409 });
  const p = new URL(req.url).searchParams;
  const fluent = p.get("course") === "ai-fluent";
  const bank = fluent ? FLUENT_BANK : EVAL_BANK;
  const from = Math.max(0, Math.min(bank.length, Number(p.get("from") ?? 0) || 0));
  const count = Math.max(1, Math.min(10, Number(p.get("count") ?? 10) || 10));
  const results = fluent ? await runFluentSlice(from, count) : await runEvalSlice(from, count);
  return Response.json({ from, count: results.length, total: bank.length, results });
}
