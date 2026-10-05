import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { eraseLearner } from "@/app/lib/aiClearedOps";

/* POST /api/ops/erase { email, confirm }: a firm has asked in writing for
 * a person's data to go. Staff only; the email is typed twice. */

const Body = z.object({ email: z.string().email().max(200), confirm: z.string().max(200) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Give the email address and type it again to confirm." }, { status: 400 });
  const email = parsed.data.email.trim().toLowerCase();
  if (parsed.data.confirm.trim().toLowerCase() !== email) return Response.json({ error: "The two addresses do not match." }, { status: 400 });
  if (session.user.email?.toLowerCase() === email) return Response.json({ error: "You cannot remove your own account from here." }, { status: 400 });
  const r = await eraseLearner(email);
  if (!r.ok) return Response.json({ error: r.message }, { status: 409 });
  return Response.json(r);
}
