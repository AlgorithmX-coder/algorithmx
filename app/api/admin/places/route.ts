import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { creditPlaceBack, placesUsed } from "@/app/lib/schoolPlaces";
import { opsAlert } from "@/app/lib/opsAlert";
import { prisma } from "@/app/lib/prisma";
import { firstNameOf } from "@/app/lib/aiCleared";

/**
 * POST /api/admin/places: hand one spent place back to a school's pool.
 *
 * STAFF ONLY, AND DELIBERATELY SO. A place follows the child (owner,
 * 2026-11-09), which is what stops a school running a hundred children
 * through fifty places by deleting them one after another. If a school
 * could free its own places that rule would mean nothing, so the button
 * lives in the staff console and the school asks for it.
 *
 * The usual reason is a mistake rather than a dispute: a teacher deletes a
 * misspelled pupil and adds them again, which spends two places for one
 * child. `creditPlaceBack` stamps the row rather than deleting it, so the
 * school's history still shows what happened and who put it right.
 *
 * The ledger is money, so every credit is announced to ops the same way a
 * licence change is.
 */
const Body = z.object({
  orgId: z.string().min(1),
  redemptionId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Name the organisation and the place." }, { status: 400 });

  const org = await prisma.organisation.findUnique({
    where: { id: parsed.data.orgId },
    select: { id: true, name: true, slug: true, seatsPurchased: true },
  });
  if (!org) return Response.json({ error: "That organisation does not exist." }, { status: 404 });

  const done = await creditPlaceBack({
    orgId: org.id,
    redemptionId: parsed.data.redemptionId,
    staffUserId: session.user.id,
  });

  /* Idempotent underneath, so a second press is not an error: it is simply
     a place that is already back. Saying so is kinder than a red box. */
  if (!done) {
    return Response.json({ ok: true, credited: false, spent: await placesUsed(org.id) });
  }

  const spent = await placesUsed(org.id);
  await opsAlert({
    what: "Place credited back",
    detail: {
      org: org.name,
      slug: org.slug,
      redemption: parsed.data.redemptionId,
      spentNow: spent,
      licensed: org.seatsPurchased,
      by: firstNameOf(session.user.name, session.user.email),
      email: session.user.email ?? "",
    },
  });

  return Response.json({ ok: true, credited: true, spent, licensed: org.seatsPurchased });
}
