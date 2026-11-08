import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { createSchool } from "@/app/lib/schoolOps";

/* POST /api/admin/schools: AlgorithmX staff create a school by hand, with
 * its pupil-place count, and get its first teacher's invite link.
 *
 * The invite is sent from the schools address rather than from whoever is
 * signed in, so a teacher replies to a mailbox the team reads rather than to
 * one person who may not be here next term. */

const Body = z.object({
  name: z.string().min(2).max(120),
  sector: z.string().max(80).optional().nullable(),
  country: z.string().max(80).optional().nullable(),
  contactName: z.string().max(120).optional().nullable(),
  contactRole: z.string().max(120).optional().nullable(),
  safeguardingContact: z.string().max(120).optional().nullable(),
  seatsPurchased: z.number().int().min(1).max(100000),
  /* Only so the invite email can say "on a 2-day trial" rather than
     announcing places nobody bought. The trial itself is still granted by
     /api/admin/trial straight after this call. */
  trialDays: z.number().int().min(1).max(60).optional().nullable(),
  teacherEmail: z.string().email().max(200),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Check the fields: a name, a pupil count and the teacher's email are required." }, { status: 400 });
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
  const result = await createSchool({
    ...parsed.data,
    origin: `${proto}://${host}`,
  });
  return Response.json({ ok: true, slug: result.org.slug, name: result.org.name, link: result.link, emailed: result.emailed });
}
