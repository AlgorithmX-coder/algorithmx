import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { getAdminContext, orgRefOf, saveProfile } from "@/app/lib/aiClearedAdmin";

/* PUT /api/org/profile: the firm's own rules, read by modules 2, 3 and 5
 * at render time. */

const list = z.array(z.string().max(120)).max(20);
const Body = z.object({
  approvedTools: list,
  askFirstTools: list,
  bannedTools: list,
  escalationContact: z.string().min(1).max(120),
  escalationRole: z.string().max(120).default(""),
  regulator: z.string().max(120).default(""),
  classPublic: z.string().max(40).default("PUBLIC"),
  classInternal: z.string().max(40).default("INTERNAL"),
  classConfidential: z.string().max(40).default("CONFIDENTIAL"),
  classRestricted: z.string().max(40).default("RESTRICTED"),
});

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  const ctx = await getAdminContext(session.user.id, orgRefOf(req));
  if (!ctx) return Response.json({ error: "Not an admin." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Check the fields: the contact is required and lists hold up to twenty entries." }, { status: 400 });
  const clean = (xs: string[]) => xs.map((s) => s.trim()).filter(Boolean);
  await saveProfile(ctx.orgId, { ...parsed.data, approvedTools: clean(parsed.data.approvedTools), askFirstTools: clean(parsed.data.askFirstTools), bannedTools: clean(parsed.data.bannedTools) });
  return Response.json({ ok: true });
}
