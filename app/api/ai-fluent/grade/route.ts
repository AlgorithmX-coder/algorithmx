import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { TRACKS } from "@/app/ai-cleared/engine/types";
import { gradeFluent } from "@/app/lib/aiFluentGrader";

/* POST /api/ai-fluent/grade
 * The rubric grader. The grading lives in app/lib/aiFluentGrader so the
 * eval runs the same code. Nothing is stored: this route never touches
 * the database. */

export const runtime = "nodejs";

const Body = z.object({
  module: z.number().int().min(1).max(9),
  track: z.enum(TRACKS),
  tool: z.enum(["copilot", "chatgpt", "gemini", "claude"]),
  practise: z.number().int().min(0).max(4).optional(),
  turns: z.array(z.string().max(4000)).min(1).max(6),
  replies: z.array(z.string().max(6000)).max(6).optional(),
  firmName: z.string().max(120).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const out = await gradeFluent(parsed.data);
  if ("error" in out) return Response.json({ error: out.error }, { status: out.status });
  return Response.json(out);
}
