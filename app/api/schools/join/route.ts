import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { claimTeacherInvite } from "@/app/lib/schoolOps";

/* POST /api/schools/join
 * Claims a teacher invite for the signed-in user. The invite landing page
 * posts here after sign-in. No job-title/track picker: a teacher enrols
 * on nothing, so there is nothing to choose. */

const Body = z.object({ token: z.string().min(6).max(120) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const result = await claimTeacherInvite(parsed.data.token, session.user.id);
  if (!result.ok) {
    const status = result.error === "not_found" ? 404 : 409;
    const message = result.error === "not_found" ? "That invite link is not valid. Ask AlgorithmX for a new one." : "That invite has already been claimed by someone else.";
    return Response.json({ error: message }, { status });
  }
  return Response.json({ ok: true, orgName: result.orgName, redirect: "/schools/classes" });
}
