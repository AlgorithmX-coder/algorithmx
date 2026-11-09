import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { createSchool, setPlaces } from "@/app/lib/schoolOps";
import { prisma } from "@/app/lib/prisma";
import { firstNameOf } from "@/app/lib/aiCleared";

/* POST /api/admin/schools: AlgorithmX staff create a school by hand, with
 * its pupil-place count, and get its first teacher's invite link.
 *
 * The invite is sent from the schools address rather than from whoever is
 * signed in, so a teacher replies to a mailbox the team reads rather than to
 * one person who may not be here next term. */

const Body = z.object({
  name: z.string().min(2).max(120),
  /* A school, or a youth club / council / charity / training provider that
     teaches the same courses. Same machinery either way; it only decides
     which staff tab it lands under. */
  kind: z.enum(["SCHOOL", "ORGANISATION"]).optional(),
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

/* PATCH /api/admin/schools: change what a school has already bought.
 *
 * Separate from POST because creating a school and re-licensing one are
 * different acts with different consequences: one sends an invite to a
 * person, the other quietly changes how many children a school may teach.
 * Takes the org by id or by slug, so the school's own page can call it
 * without first looking an id up. */

const Patch = z
  .object({
    orgId: z.string().optional(),
    slug: z.string().optional(),
    seatsPurchased: z.number().int().min(0).max(100000),
  })
  .refine((b) => Boolean(b.orgId || b.slug), { message: "Name the organisation." });

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Patch.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Give a whole number of places." }, { status: 400 });

  let orgId = parsed.data.orgId ?? null;
  if (!orgId && parsed.data.slug) {
    const found = await prisma.organisation.findUnique({ where: { slug: parsed.data.slug }, select: { id: true } });
    orgId = found?.id ?? null;
  }
  if (!orgId) return Response.json({ error: "That organisation does not exist." }, { status: 404 });

  const result = await setPlaces({
    orgId,
    places: parsed.data.seatsPurchased,
    actor: { name: firstNameOf(session.user.name, session.user.email), email: session.user.email ?? null },
  });

  if (!result.ok) {
    if (result.error === "not_found") {
      return Response.json({ error: "That organisation does not exist." }, { status: 404 });
    }
    /* Deliberately a 409 and not a 400: the number is a perfectly good
       number, it is the school's own ledger that makes it impossible. The
       message carries the floor so staff do not have to go and count. */
    return Response.json(
      {
        error: `This one has already spent ${result.spent} place${result.spent === 1 ? "" : "s"}, so it cannot be licensed for fewer than that. Take those pupils out first, or close its access.`,
        spent: result.spent,
      },
      { status: 409 },
    );
  }

  return Response.json({ ok: true, places: result.places, spent: result.spent, previous: result.previous });
}
