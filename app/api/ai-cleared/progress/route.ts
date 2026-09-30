import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { getEnrolment, recordAttempt, saveScreen } from "@/app/lib/aiCleared";

/* POST /api/ai-cleared/progress
 * Two writes, both scores-only, for either course: the learner's place in
 * a module on every screen change, and a sandbox attempt (verdict and
 * class counts; on Fluent the rubric verdict and score too). The enrolment
 * is resolved from the session and the course field, never from the body's
 * ids, and the prompt text is never accepted here. */

const Course = z.enum(["ai-cleared", "ai-fluent"]).optional();

const Screen = z.object({
  type: z.literal("screen"),
  course: Course,
  module: z.number().int().min(1).max(9),
  phase: z.enum(["learn", "practise", "prove", "done"]),
  screen: z.number().int().min(0).max(200),
  proveScore: z.number().int().min(0).max(50).optional(),
  proveTotal: z.number().int().min(1).max(50).optional(),
  bestVerdict: z.enum(["ok", "warn", "crit"]).optional(),
  bestFluent: z.enum(["fluent", "nearly", "notyet"]).optional(),
  completed: z.boolean().optional(),
});

const Attempt = z.object({
  type: z.literal("attempt"),
  course: Course,
  module: z.number().int().min(1).max(9),
  tool: z.enum(["copilot", "chatgpt", "gemini", "claude"]),
  verdict: z.enum(["ok", "warn", "crit"]),
  counts: z.object({ P: z.number().int().min(0), I: z.number().int().min(0), C: z.number().int().min(0), R: z.number().int().min(0) }),
  halted: z.boolean(),
  fluent: z.enum(["fluent", "nearly", "notyet"]).optional(),
  rubricScore: z.number().int().min(0).max(100).optional(),
});

const Body = z.discriminatedUnion("type", [Screen, Attempt]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const b = parsed.data;
  const enrolment = await getEnrolment(session.user.id, b.course ?? "ai-cleared");
  if (!enrolment) return Response.json({ error: "No enrolment." }, { status: 403 });

  if (b.type === "screen") {
    const { type: _t, course: _c, ...rest } = b;
    void _t;
    void _c;
    await saveScreen({ enrolmentId: enrolment.id, ...rest });
  } else {
    const { type: _t, course: _c, ...rest } = b;
    void _t;
    void _c;
    await recordAttempt({ enrolmentId: enrolment.id, ...rest });
  }
  return Response.json({ ok: true });
}
