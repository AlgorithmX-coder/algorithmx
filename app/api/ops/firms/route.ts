import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { createFirm } from "@/app/lib/aiClearedOps";
import { firstNameOf } from "@/app/lib/aiCleared";

/* POST /api/ops/firms: AlgorithmX staff create a firm by hand and get its
 * admin invite link. */

const Body = z.object({
  name: z.string().min(2).max(120),
  sector: z.string().max(80).optional().nullable(),
  contactName: z.string().max(120).optional().nullable(),
  contactRole: z.string().max(120).optional().nullable(),
  plan: z.enum(["TEAM", "FIRM", "ENTERPRISE"]),
  seatsPurchased: z.number().int().min(1).max(100000),
  adminEmail: z.string().email().max(200),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Check the fields: a name, a plan, a seat count and the admin's email are required." }, { status: 400 });
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
  const result = await createFirm({
    ...parsed.data,
    origin: `${proto}://${host}`,
    staffName: session.user.name?.trim() || firstNameOf(session.user.name, session.user.email),
    staffEmail: session.user.email ?? null,
  });
  return Response.json({ ok: true, slug: result.org.slug, name: result.org.name, link: result.link, emailed: result.emailed });
}
