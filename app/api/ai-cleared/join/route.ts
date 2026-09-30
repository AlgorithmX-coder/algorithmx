import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { claimSeat } from "@/app/lib/aiCleared";
import { COURSES } from "@/app/ai-cleared/engine/courses";
import { TRACKS } from "@/app/ai-cleared/engine/types";

/* POST /api/ai-cleared/join
 * Claims an invite seat for the signed-in user on the chosen track. The
 * invite landing page posts here after sign-in. The seat knows its course;
 * a Fluent seat is refused without a valid Cleared certificate. */

const Body = z.object({
  token: z.string().min(6).max(120),
  track: z.enum(TRACKS),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const result = await claimSeat({ token: parsed.data.token, userId: session.user.id, track: parsed.data.track });
  if (!result.ok) {
    const status = result.reason === "not-found" ? 404 : result.reason === "taken" || result.reason === "needs-cleared" ? 409 : 500;
    const message =
      result.reason === "not-found"
        ? "That invite link is not valid. Ask your admin for a new one."
        : result.reason === "taken"
          ? "That seat has already been claimed by someone else."
          : result.reason === "needs-cleared"
            ? "AI Fluent needs a valid AI Cleared certificate on this login first. Finish AI Cleared, then open this link again."
            : "The course is not set up yet. Ask your admin.";
    return Response.json({ error: message }, { status });
  }
  return Response.json({ ok: true, orgName: result.orgName, redirect: COURSES[result.course].base });
}
