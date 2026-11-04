import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { revokeOrg, unrevokeOrg } from "@/app/lib/orgRevoke";
import { firstNameOf } from "@/app/lib/aiCleared";

/* POST /api/admin/revoke: close (or reopen) a school's or firm's access
 * immediately. Staff only, shared by both tabs - both are Organisation
 * rows. */

const Body = z.object({ orgId: z.string(), action: z.enum(["revoke", "unrevoke"]) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  if (parsed.data.action === "revoke") {
    await revokeOrg(parsed.data.orgId, { name: firstNameOf(session.user.name, session.user.email), email: session.user.email ?? null });
  } else {
    await unrevokeOrg(parsed.data.orgId);
  }
  return Response.json({ ok: true });
}
