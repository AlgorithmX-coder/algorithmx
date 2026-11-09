import type Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";
import { createSchool } from "@/app/lib/schoolOps";
import { opsAlert } from "@/app/lib/opsAlert";
import { stripe, vatMode, vatTaxRateId, VAT_PERCENT } from "@/app/lib/stripe";

/**
 * Buying places, for an educational organisation.
 *
 * A club, a tutoring business or a training provider buys places by card
 * and is set up the moment the payment clears. Schools do NOT come through
 * here: the owner quotes a school against its own budget after a
 * conversation, so a school is raised as an invoice and created by staff
 * in /admin/schools. See pricing-four-segments.
 *
 * THE LADDER: £2,500 for the first fifty places, £2,250 for every further
 * fifty. Places are sold in blocks of fifty because that is the published
 * deal, and a block is the only unit the ladder is defined on.
 *
 * VAT is added ON TOP here, which is right for a business buyer and is the
 * opposite of the consumer price, where the £99 includes it.
 */

export const PLACES_PER_BLOCK = 50;
export const BLOCK_FIRST_PENCE = 250_000;
export const BLOCK_FURTHER_PENCE = 225_000;
/* Twenty blocks is a thousand places. Past that somebody should be talking
   to us rather than typing a card number in. */
export const MAX_BLOCKS = 20;

/** What `blocks` blocks cost, in pence, before VAT. */
export function placesPricePence(blocks: number): number {
  if (!Number.isInteger(blocks) || blocks < 1) return 0;
  return BLOCK_FIRST_PENCE + (blocks - 1) * BLOCK_FURTHER_PENCE;
}

export function validateBlocks(blocks: number): string | null {
  if (!Number.isInteger(blocks)) return "Choose a whole number of blocks.";
  if (blocks < 1) return `The smallest licence is ${PLACES_PER_BLOCK} places.`;
  if (blocks > MAX_BLOCKS) {
    return `For more than ${MAX_BLOCKS * PLACES_PER_BLOCK} places, talk to us and we will quote you.`;
  }
  return null;
}

/** The figures a buyer sees before they commit, all in pence. */
export function placesQuote(blocks: number) {
  const net = placesPricePence(blocks);
  const vat = vatMode() === "fixed" ? Math.round((net * VAT_PERCENT) / 100) : 0;
  return { places: blocks * PLACES_PER_BLOCK, net, vat, gross: net + vat };
}

export interface PlacesCheckoutInput {
  orgName: string;
  blocks: number;
  leadEmail: string;
  contactName?: string | null;
  sector?: string | null;
  origin: string;
}

/* Card checkout needs the key and the webhook secret, and nothing else.
   Deliberately NOT stripe.ts's stripeConfigured(), which also insists on
   AI Cleared's two price ids: those belong to the firm lane and have
   nothing to say about whether an organisation can buy places. */
export function placesCheckoutConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export async function createPlacesCheckout(
  input: PlacesCheckoutInput,
): Promise<{ url: string } | { error: string; status: number }> {
  if (!placesCheckoutConfigured()) {
    return { error: "Card payment is not switched on yet. Ask us for an invoice and we will send one.", status: 503 };
  }
  const blocksError = validateBlocks(input.blocks);
  if (blocksError) return { error: blocksError, status: 400 };

  const quote = placesQuote(input.blocks);
  const taxRates = vatMode() === "fixed" ? [await vatTaxRateId()] : undefined;

  /* An inline price rather than a Price object in the dashboard. The
     ladder is not a per-unit rate (the first fifty cost more than the
     rest), so the total is worked out here, where it can be read and
     tested, and the invoice shows that figure against a line naming the
     places. It also means nobody has to create anything in Stripe before
     this works. */
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        tax_rates: taxRates,
        price_data: {
          currency: "gbp",
          unit_amount: quote.net,
          product_data: {
            name: `AlgorithmX, ${quote.places} pupil places`,
            description: `${input.blocks} block${input.blocks === 1 ? "" : "s"} of ${PLACES_PER_BLOCK}. A place belongs to a child and never expires.`,
          },
        },
      },
    ],
    customer_email: input.leadEmail.trim().toLowerCase(),
    customer_creation: "always",
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: vatMode() === "automatic" },
    invoice_creation: { enabled: true },
    metadata: {
      product: "learner-places",
      blocks: String(input.blocks),
      places: String(quote.places),
      orgName: input.orgName.trim().slice(0, 120),
      sector: (input.sector ?? "").trim().slice(0, 80),
      contactName: (input.contactName ?? "").trim().slice(0, 120),
      leadEmail: input.leadEmail.trim().toLowerCase().slice(0, 200),
    },
    success_url: `${input.origin}/organisations/buy/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/organisations/buy?blocks=${input.blocks}`,
  });
  if (!session.url) return { error: "Stripe did not return a checkout page. Try again in a moment.", status: 502 };
  return { url: session.url };
}

/**
 * Called by the webhook once the payment has cleared. Creates the
 * organisation, its places and the lead's invite, exactly as staff
 * creating one by hand in /admin would.
 *
 * Idempotent on the Stripe session id, which Organisation already carries
 * for the firm lane, because Stripe delivers a webhook at least once.
 */
export async function fulfilPlacesSession(session: Stripe.Checkout.Session, origin: string) {
  const m = session.metadata ?? {};
  if (m.product !== "learner-places") return { skipped: "not a places purchase" };
  if (session.payment_status !== "paid") return { skipped: `payment status ${session.payment_status}` };

  const done = await prisma.organisation.findUnique({
    where: { stripeCheckoutSessionId: session.id },
    select: { id: true, slug: true },
  });
  if (done) return { already: true, slug: done.slug };

  const places = Number(m.places) || 0;
  const leadEmail = (m.leadEmail || session.customer_details?.email || session.customer_email || "").toLowerCase();
  if (!leadEmail || !m.orgName) return { skipped: "session is missing the organisation name or the lead's email" };
  if (places < 1) return { skipped: "session carries no places" };

  const made = await createSchool({
    name: m.orgName,
    kind: "ORGANISATION",
    sector: m.sector || null,
    contactName: m.contactName || null,
    seatsPurchased: places,
    teacherEmail: leadEmail,
    origin,
  });

  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  await prisma.organisation.update({
    where: { id: made.org.id },
    data: { stripeCheckoutSessionId: session.id, stripeCustomerId: customerId },
  });

  if (!made.emailed) {
    await opsAlert({
      what: "An organisation paid but its invite email did not send",
      detail: { org: made.org.name, slug: made.org.slug, leadEmail, places, link: made.link, sessionId: session.id },
    });
  }
  return { created: true, slug: made.org.slug, places, emailed: made.emailed };
}
