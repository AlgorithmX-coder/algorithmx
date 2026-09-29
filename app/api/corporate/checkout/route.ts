import { NextRequest } from "next/server";
import { z } from "zod";
import { createCorporateCheckout } from "@/app/lib/aiClearedCheckout";
import { CORPORATE_PRODUCT_SLUGS } from "@/app/lib/corporateProducts";

/* POST /api/corporate/checkout: start a Stripe Checkout for a seat pack.
 * No sign-in needed: the buyer is the firm's admin-to-be, and the seat
 * pack is created by the webhook after payment, not here. */

const Body = z.object({
  course: z.enum(CORPORATE_PRODUCT_SLUGS),
  seats: z.number().int(),
  firmName: z.string().min(2).max(120),
  sector: z.string().max(80).optional().nullable(),
  contactName: z.string().max(120).optional().nullable(),
  contactRole: z.string().max(120).optional().nullable(),
  adminEmail: z.string().email().max(200),
  website: z.string().max(0).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Check the fields: firm name, a whole number of seats and the admin's email are required." }, { status: 400 });
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
  const result = await createCorporateCheckout({ ...parsed.data, origin: `${proto}://${host}` });
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ url: result.url });
}
