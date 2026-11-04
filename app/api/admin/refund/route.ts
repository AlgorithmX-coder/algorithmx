import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/app/lib/auth";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { prisma } from "@/app/lib/prisma";
import { refundPurchase } from "@/app/lib/refund";
import { opsAlert } from "@/app/lib/opsAlert";
import { firstNameOf } from "@/app/lib/aiCleared";

/* POST /api/admin/refund: refund some or all of a firm's seat purchase.
 * Staff only. Stripe is the source of truth for the amount already
 * refunded - we just pass the typed amount through and let Stripe's own
 * validation (can't refund more than was paid) do the rest. */

const Body = z.object({ seatPurchaseId: z.string(), amountPence: z.number().int().min(1) });

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return Response.json({ error: "Sign in first." }, { status: 401 });
  if (!(await isStaffUser(session.user.id))) return Response.json({ error: "Staff only." }, { status: 403 });
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Bad request." }, { status: 400 });

  const purchase = await prisma.seatPurchase.findUnique({ where: { id: parsed.data.seatPurchaseId }, include: { org: { select: { name: true } } } });
  if (!purchase) return Response.json({ error: "That purchase does not exist." }, { status: 404 });

  const result = await refundPurchase({ stripeCheckoutSessionId: purchase.stripeCheckoutSessionId, amountPence: parsed.data.amountPence });
  if (!result.ok) return Response.json({ error: result.error }, { status: 400 });

  await opsAlert({ what: "Refund issued", detail: { org: purchase.org.name, amountPence: parsed.data.amountPence, refundId: result.refundId, by: session.user.email ?? firstNameOf(session.user.name, session.user.email) } });
  return Response.json({ ok: true, refundId: result.refundId });
}
