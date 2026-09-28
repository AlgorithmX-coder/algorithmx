import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { getEnrolment, recordAttempt, saveScreen } from "@/app/lib/aiCleared";

/* POST /api/ai-cleared/progress
 * Two writes, both scores-only: the learner's place in a module on every
 * screen change, and a sandbox attempt (verdict and class counts). The
 * enrolment is resolved from the session, never from the body, and the
 * prompt text is never accepted here. */

const Screen = z.object({
  type: z.literal("screen"),
  module: z.number().int().min(1).max(5),
  phase: z.enum(["learn", "practise", "prove", "done"]),
  screen: z.number().int().min(0).max(200),
  proveScore: z.number().int().min(0).max(50).optional(),
  proveTotal: z.number().int().min(1).max(50).optional(),
  bestVerdict: z.enum(["ok", "warn", "crit"]).optional(),
  completed: z.boolean().optional(),
});

const Attempt = z.object({
  type: z.literal("attempt"),
  module: z.number().int().min(1).max(5),
  tool: z.enum(["copilot", "chatgpt", "gemini", "claude"]),
  verdict: z.enum(["ok", "warn", "crit"]),
  counts: z.object({ P: z.number().int().min(0), I: z.number().int().min(0), C: z.number().int().min(0), R: z.number().int().min(0) }),
  halted: z.boolean(),
});

const Body = z.discriminatedUnion("type", [Screen, Attempt]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const enrolment = await getEnrolment(session.user.id);
  if (!enrolment) return Response.json({ error: "No enrolment." }, { status: 403 });

  const b = parsed.data;
  if (b.type === "screen") {
    await saveScreen({ enrolmentId: enrolment.id, ...b });
  } else {
    await recordAttempt({ enrolmentId: enrolment.id, ...b });
  }
  return Response.json({ ok: true });
}
