import type Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";
import { createFirm } from "@/app/lib/aiClearedOps";
import { COURSE_NAME, SEAT_MAX, SEAT_MIN, SEAT_STEP, SELLABLE, planForSeats, priceIdFor, stripe, stripeConfigured, vatTaxRateId } from "@/app/lib/stripe";
import type { CorporateProductSlug } from "@/app/lib/corporateProducts";

/* Card checkout for a firm's seat pack, and the fulfilment that follows
 * the webhook. The checkout carries everything needed to create the firm
 * in the session's metadata; fulfilment is idempotent on the session id,
 * because Stripe delivers webhooks at least once. */

export interface CheckoutInput {
  course: CorporateProductSlug;
  seats: number;
  firmName: string;
  sector?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  adminEmail: string;
  origin: string;
}

export function validateSeats(seats: number): string | null {
  if (!Number.isInteger(seats)) return "Seats must be a whole number.";
  if (seats < SEAT_MIN) return `The smallest pack is ${SEAT_MIN} seats.`;
  if (seats > SEAT_MAX) return `For more than ${SEAT_MAX} seats, ask for an Enterprise quote.`;
  if (seats % SEAT_STEP !== 0) return `Seats come in packs of ${SEAT_STEP}.`;
  return null;
}

export async function createCorporateCheckout(input: CheckoutInput): Promise<{ url: string } | { error: string; status: number }> {
  if (!stripeConfigured()) return { error: "Card checkout is not switched on yet. Use the enquiry form and we will invoice you.", status: 503 };
  if (!SELLABLE.includes(input.course)) return { error: `${COURSE_NAME[input.course]} is not on sale by card yet.`, status: 400 };
  const seatsError = validateSeats(input.seats);
  if (seatsError) return { error: seatsError, status: 400 };
  const plan = planForSeats(input.seats);
  const price = priceIdFor(input.course, plan);
  if (!price) return { error: "That pack is priced on a call. Use the enquiry form.", status: 400 };

  /* VAT: the fixed UK rate on every line, unless Stripe Tax is switched
   * on, in which case Stripe works the tax out from the billing address
   * and the two must not be combined. */
  const automaticTax = process.env.STRIPE_AUTOMATIC_TAX === "1";
  const taxRates = automaticTax ? undefined : [await vatTaxRateId()];

  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [{ price, quantity: input.seats, tax_rates: taxRates }],
    customer_email: input.adminEmail.trim().toLowerCase(),
    customer_creation: "always",
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: automaticTax },
    invoice_creation: { enabled: true },
    allow_promotion_codes: true,
    metadata: {
      product: "corporate-seats",
      course: input.course,
      seats: String(input.seats),
      plan,
      firmName: input.firmName.trim().slice(0, 120),
      sector: (input.sector ?? "").trim().slice(0, 80),
      contactName: (input.contactName ?? "").trim().slice(0, 120),
      contactRole: (input.contactRole ?? "").trim().slice(0, 120),
      adminEmail: input.adminEmail.trim().toLowerCase().slice(0, 200),
    },
    success_url: `${input.origin}/corporate/buy/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/corporate/buy?course=${input.course}&seats=${input.seats}`,
  });
  if (!session.url) return { error: "Stripe did not return a checkout page. Try again in a moment.", status: 502 };
  return { url: session.url };
}

/* Called by the webhook on checkout.session.completed. Creates the firm
 * once per session and sends the admin invite under AlgorithmX's name. */
export async function fulfilCheckoutSession(session: Stripe.Checkout.Session, origin: string) {
  const m = session.metadata ?? {};
  if (m.product !== "corporate-seats") return { skipped: "not a corporate seat purchase" };
  if (session.payment_status !== "paid") return { skipped: `payment status ${session.payment_status}` };

  const existing = await prisma.organisation.findUnique({ where: { stripeCheckoutSessionId: session.id }, select: { id: true, slug: true } });
  if (existing) return { already: true, slug: existing.slug };

  const seats = Number(m.seats) || 0;
  const adminEmail = (m.adminEmail || session.customer_details?.email || session.customer_email || "").toLowerCase();
  if (!adminEmail || !m.firmName) return { skipped: "session is missing the firm name or the admin email" };
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  const made = await createFirm({
    name: m.firmName,
    sector: m.sector || null,
    contactName: m.contactName || null,
    contactRole: m.contactRole || null,
    plan: planForSeats(seats),
    seatsPurchased: seats,
    adminEmail,
    origin,
    staffName: "AlgorithmX",
    staffEmail: process.env.CORPORATE_ENQUIRY_TO ?? "admissions@algorithmx.co.uk",
  });
  await prisma.organisation.update({ where: { id: made.org.id }, data: { stripeCheckoutSessionId: session.id, stripeCustomerId: customerId } });
  return { created: true, slug: made.org.slug, emailed: made.emailed, link: made.link };
}
