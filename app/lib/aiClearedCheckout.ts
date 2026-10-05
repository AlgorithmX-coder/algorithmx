import type Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";
import { createFirm } from "@/app/lib/aiClearedOps";
import { sendSeatsAdded } from "@/app/lib/aiClearedAdmin";
import { COURSE_NAME, SEAT_MAX, SEAT_MIN, SEAT_STEP, planForSeats, priceIdFor, sellableCourses, stripe, stripeConfigured, vatMode, vatTaxRateId } from "@/app/lib/stripe";
import { FLUENT_NEEDS_CLEARED_FIRM, type CorporateProductSlug } from "@/app/lib/corporateProducts";

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
  if (!sellableCourses().includes(input.course)) return { error: `${COURSE_NAME[input.course]} is not on sale by card yet.`, status: 400 };
  const seatsError = validateSeats(input.seats);
  if (seatsError) return { error: seatsError, status: 400 };
  if (input.course === "ai-fluent" && !(await runsAFirm(input.adminEmail))) return { error: FLUENT_NEEDS_CLEARED_FIRM, status: 400 };
  const plan = planForSeats(input.seats);
  const price = priceIdFor(input.course, plan);
  if (!price) return { error: "That pack is priced on a call. Use the enquiry form.", status: 400 };

  /* VAT: the fixed UK rate on every line, or Stripe Tax from the billing
   * address, or none at all; the two Stripe mechanisms are never combined. */
  const mode = vatMode();
  const automaticTax = mode === "automatic";
  const taxRates = mode === "fixed" ? [await vatTaxRateId()] : undefined;

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

const COURSE_KEY = { "ai-cleared": "AI_CLEARED", "ai-fluent": "AI_FLUENT" } as const;

/* The admin email of a firm that exists: an ADMIN seat under it. No firm
 * means no Cleared seats, so nobody who could claim a Fluent seat. */
export async function runsAFirm(adminEmail: string): Promise<boolean> {
  const seat = await prisma.seat.findFirst({ where: { email: adminEmail.trim().toLowerCase(), role: "ADMIN" }, select: { id: true } });
  return !!seat;
}

/* Called by the webhook on checkout.session.completed. The same admin
 * email means the same firm: a buyer who already runs a firm with us gets
 * the seats added to it and a note saying so; anyone else gets a new firm
 * and the admin invite, under AlgorithmX's name. Once per session. */
export async function fulfilCheckoutSession(session: Stripe.Checkout.Session, origin: string) {
  const m = session.metadata ?? {};
  if (m.product !== "corporate-seats") return { skipped: "not a corporate seat purchase" };
  if (session.payment_status !== "paid") return { skipped: `payment status ${session.payment_status}` };

  const done = await prisma.seatPurchase.findUnique({ where: { stripeCheckoutSessionId: session.id }, select: { orgId: true } });
  if (done) return { already: true, orgId: done.orgId };
  const legacy = await prisma.organisation.findUnique({ where: { stripeCheckoutSessionId: session.id }, select: { id: true, slug: true } });
  if (legacy) return { already: true, slug: legacy.slug };

  const seats = Number(m.seats) || 0;
  const course: CorporateProductSlug = m.course === "ai-fluent" ? "ai-fluent" : "ai-cleared";
  const adminEmail = (m.adminEmail || session.customer_details?.email || session.customer_email || "").toLowerCase();
  if (!adminEmail || !m.firmName) return { skipped: "session is missing the firm name or the admin email" };
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const staffName = "AlgorithmX";
  const staffEmail = process.env.CORPORATE_ENQUIRY_TO ?? "admissions@algorithmx.co.uk";

  const admin = await prisma.seat.findFirst({
    where: { email: adminEmail, role: "ADMIN" },
    orderBy: { invitedAt: "asc" },
    select: { org: { select: { id: true, name: true, slug: true } } },
  });
  if (admin) {
    await prisma.$transaction([
      prisma.organisation.update({
        where: { id: admin.org.id },
        data: course === "ai-fluent" ? { fluentSeatsPurchased: { increment: seats } } : { seatsPurchased: { increment: seats } },
      }),
      prisma.seatPurchase.create({ data: { orgId: admin.org.id, course: COURSE_KEY[course], seats, stripeCheckoutSessionId: session.id } }),
    ]);
    let emailed = true;
    try {
      await sendSeatsAdded({ to: adminEmail, firmName: admin.org.name, course, seats, origin, staffName, staffEmail });
    } catch (err) {
      emailed = false;
      console.error("[corporate/checkout] seats-added email failed", err instanceof Error ? err.message : err);
    }
    return { added: true, slug: admin.org.slug, course, seats, emailed };
  }

  const made = await createFirm({
    name: m.firmName,
    sector: m.sector || null,
    contactName: m.contactName || null,
    contactRole: m.contactRole || null,
    plan: planForSeats(seats),
    seatsPurchased: course === "ai-cleared" ? seats : 0,
    fluentSeatsPurchased: course === "ai-fluent" ? seats : 0,
    adminEmail,
    origin,
    staffName,
    staffEmail,
  });
  await prisma.$transaction([
    prisma.organisation.update({ where: { id: made.org.id }, data: { stripeCheckoutSessionId: session.id, stripeCustomerId: customerId } }),
    prisma.seatPurchase.create({ data: { orgId: made.org.id, course: COURSE_KEY[course], seats, stripeCheckoutSessionId: session.id } }),
  ]);
  return { created: true, slug: made.org.slug, course, seats, emailed: made.emailed, link: made.link };
}
