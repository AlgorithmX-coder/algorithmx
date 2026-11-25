import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { prisma } from "@/app/lib/prisma";
import { paidState } from "@/app/lib/paidState";

/* POST /api/admin/paid: tick or un-tick "they have paid" on a school,
 * organisation or firm (one Organisation row either way). Staff only.
 *
 * A Stripe customer is refused rather than silently ignored: that payment
 * is a fact about money that moved, and a staff tick must never be able to
 * contradict it. Un-ticking is allowed because staff tick by hand and a
 * hand can slip; the stamp simply goes back to null. */

const Body = z.object({
  orgId: z.string().optional(),
  slug: z.string().optional(),
  paid: z.boolean(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const { orgId, slug, paid } = parsed.data;
  if (!orgId && !slug) return Response.json({ error: "Bad request." }, { status: 400 });

  const org = orgId
    ? await prisma.organisation.findUnique({ where: { id: orgId }, select: { id: true, stripeCustomerId: true, paidAt: true } })
    : await prisma.organisation.findUnique({ where: { slug: slug! }, select: { id: true, stripeCustomerId: true, paidAt: true } });
  if (!org) return Response.json({ error: "That organisation does not exist." }, { status: 404 });

  if (paidState(org) === "stripe") {
    return Response.json({ error: "This one pays by card, so the tick is set by Stripe." }, { status: 409 });
  }

  const updated = await prisma.organisation.update({
    where: { id: org.id },
    data: paid
      ? { paidAt: new Date(), paidById: session.user.id }
      : { paidAt: null, paidById: null },
    select: { paidAt: true, stripeCustomerId: true },
  });

  return Response.json({
    ok: true,
    state: paidState(updated),
    paidAt: updated.paidAt ? updated.paidAt.toISOString() : null,
  });
}
