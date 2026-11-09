import { NextRequest } from "next/server";
import { z } from "zod";
import { createPlacesCheckout } from "@/app/lib/learnerPlaces";

/* POST /api/organisations/checkout: start a Stripe Checkout for a block of
 * pupil places. No sign-in needed, the same as the firm lane: the buyer is
 * the organisation's lead-to-be, and the organisation itself is created by
 * the webhook after the payment clears, never here. */

const Body = z.object({
  orgName: z.string().min(2).max(120),
  blocks: z.number().int(),
  leadEmail: z.string().email().max(200),
  contactName: z.string().max(120).optional().nullable(),
  sector: z.string().max(80).optional().nullable(),
  /* Honeypot: a real person never fills a field they cannot see. */
  website: z.string().max(0).optional(),
});

export async function POST(req: NextRequest) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Check the fields: the organisation's name, how many places, and the lead's email are all needed." },
      { status: 400 },
    );
  }
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "www.algorithmx.co.uk";
  const result = await createPlacesCheckout({ ...parsed.data, origin: `${proto}://${host}` });
  if ("error" in result) return Response.json({ error: result.error }, { status: result.status });
  return Response.json({ url: result.url });
}
