import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { prisma } from "@/app/lib/prisma";
import { chargeAfterRefund, refundPurchase } from "@/app/lib/refund";
import { opsAlert } from "@/app/lib/opsAlert";
import { firstNameOf } from "@/app/lib/aiCleared";
import { applyConsumerRefund, applyPlaceRefund, applySeatRefund, totalsOf, type RefundOutcome } from "@/app/lib/refundEffects";

/* POST /api/admin/refund: refund a purchase, staff only.
 *
 *   { seatPurchaseId, amountPence }   a firm's seats, some or all
 *   { placePurchaseId, amountPence }  an organisation's places, some or all
 *   { consumerPurchaseId }            one person's course, always in full
 *
 * Stripe is the source of truth for what was paid and what is already
 * refunded: the typed amount is passed through and Stripe's own validation
 * (no refunding more than was paid) does the rest. The effect (access
 * removed, licence lowered) is applied at once from the charge's running
 * total, through the same functions the charge.refunded webhook uses, so
 * whichever arrives second changes nothing (app/lib/refundEffects.ts). */

const Body = z.union([
  z.object({ seatPurchaseId: z.string().min(1), amountPence: z.number().int().min(1) }),
  z.object({ placePurchaseId: z.string().min(1), amountPence: z.number().int().min(1) }),
  z.object({ consumerPurchaseId: z.string().min(1) }),
]);

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });
  const body = parsed.data;
  const by = session.user.email ?? firstNameOf(session.user.name, session.user.email);

  /* Which purchase, its Stripe session, how much to refund, and how to apply it. */
  let target: { sessionId: string; amountPence: number; apply: (t: ReturnType<typeof totalsOf>) => Promise<RefundOutcome> } | null = null;
  if ("consumerPurchaseId" in body) {
    const p = await prisma.consumerPurchase.findUnique({ where: { id: body.consumerPurchaseId }, select: { id: true, stripeSessionId: true, amountPence: true, refundedPence: true } });
    if (!p) return Response.json({ error: "That purchase does not exist." }, { status: 404 });
    const left = p.amountPence - p.refundedPence;
    if (left <= 0) return Response.json({ error: "That purchase is already refunded in full." }, { status: 400 });
    target = { sessionId: p.stripeSessionId, amountPence: left, apply: (t) => applyConsumerRefund(p.id, t, by) };
  } else if ("placePurchaseId" in body) {
    const p = await prisma.placePurchase.findUnique({ where: { id: body.placePurchaseId }, select: { id: true, stripeCheckoutSessionId: true } });
    if (!p) return Response.json({ error: "That purchase does not exist." }, { status: 404 });
    target = { sessionId: p.stripeCheckoutSessionId, amountPence: body.amountPence, apply: (t) => applyPlaceRefund(p.id, t, by) };
  } else {
    const p = await prisma.seatPurchase.findUnique({ where: { id: body.seatPurchaseId }, select: { id: true, stripeCheckoutSessionId: true } });
    if (!p) return Response.json({ error: "That purchase does not exist." }, { status: 404 });
    target = { sessionId: p.stripeCheckoutSessionId, amountPence: body.amountPence, apply: (t) => applySeatRefund(p.id, t, by) };
  }

  const result = await refundPurchase({ stripeCheckoutSessionId: target.sessionId, amountPence: target.amountPence });
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  /* The money has gone back. Applying the effect now is a convenience; if
     it fails, the charge.refunded webhook applies it in a moment, so the
     answer to staff is still "refunded". */
  let outcome: RefundOutcome | null = null;
  try {
    const charge = await chargeAfterRefund(result.refundId);
    if (charge) outcome = await target.apply(totalsOf(charge));
  } catch (err) {
    await opsAlert({ what: "A refund went through but its effect was not applied yet; the webhook will retry", detail: { refundId: result.refundId, by }, error: err });
  }
  return Response.json({ ok: true, refundId: result.refundId, outcome });
}
