import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { ALLOWANCE_MESSAGE, modelAllowance, recordModelCall } from "@/app/lib/modelAllowance";
import { TRACKS } from "@/app/ai-cleared/engine/types";
import { gradePrompt } from "@/app/lib/aiClearedGrader";

/* POST /api/ai-cleared/grade
 * The sandbox grader. The grading itself lives in app/lib/aiClearedGrader
 * so the eval script runs the same code. Nothing is stored: this route
 * never touches the database. */

export const runtime = "nodejs";

const Body = z.object({
  prompt: z.string().min(1).max(4000),
  module: z.number().int().min(1).max(5),
  track: z.enum(TRACKS),
  tool: z.enum(["copilot", "chatgpt", "gemini", "claude"]),
  /* The firm's own class names, so the coaching uses their words. */
  classNames: z.record(z.enum(["P", "I", "C", "R"]), z.string()).optional(),
  firmName: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if ((await modelAllowance(session.user.id)).over) return Response.json({ error: ALLOWANCE_MESSAGE }, { status: 429 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const out = await gradePrompt(parsed.data);
  if ("error" in out) return Response.json({ error: out.error }, { status: out.status });
  await recordModelCall(session.user.id, "AI_CLEARED", "grade");
  return Response.json(out);
}
