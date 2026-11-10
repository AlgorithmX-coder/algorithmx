import type Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";
import { createFirm } from "@/app/lib/aiClearedOps";
import { sendSeatsAdded } from "@/app/lib/aiClearedAdmin";
import { opsAlert } from "@/app/lib/opsAlert";
import { planForSeats, stripe, stripeConfigured, vatMode, vatTaxRateId } from "@/app/lib/stripe";
import { approvedToolLabel } from "@/app/lib/corporateProducts";
import { CYBER_SECURED_NAME, liveTrackNames } from "@/app/lib/cyberSecured";
import { SECURED_COURSE_META, TIER_NAME, purchaseFromMetadata, seatsAfterTopUp, securedQuote, validateSecuredSeats } from "@/app/lib/cyberSecuredPricing";

/* Card checkout for Cyber Secured seats, and the fulfilment that follows
 * the webhook. The checkout carries everything needed to create the firm
 * in the session's metadata; fulfilment is idempotent on the session id,
 * because Stripe delivers webhooks at least once. */

export interface CheckoutInput {
  seats: number;
  firmName: string;
  sector?: string | null;
  contactName?: string | null;
  contactRole?: string | null;
  /* One of FIRM_TOOL_KEYS, or empty for "not decided yet". */
  tool?: string | null;
  adminEmail: string;
  origin: string;
}

export async function createCorporateCheckout(input: CheckoutInput): Promise<{ url: string } | { error: string; status: number }> {
  if (!stripeConfigured()) return { error: "Card checkout is not switched on yet. Use the enquiry form and we will invoice you.", status: 503 };
  const seatsError = validateSecuredSeats(input.seats);
  if (seatsError) return { error: seatsError, status: 400 };

  /* VAT: the fixed UK rate on the line, or Stripe Tax from the billing
   * address, or none at all; the two Stripe mechanisms are never combined. */
  const mode = vatMode();
  const taxRates = mode === "fixed" ? [await vatTaxRateId()] : undefined;
  const quote = securedQuote(input.seats, mode, 0);

  /* One line, priced inline: the rate the seat count earns, times the
   * seats. Worked out here, where it is tested, so nobody creates a Price
   * in the Stripe dashboard or carries its id in a variable, and the same
   * code charges the sandbox and the live account. */
  const session = await stripe().checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: input.seats,
        tax_rates: taxRates,
        price_data: {
          currency: "gbp",
          unit_amount: quote.ratePence,
          tax_behavior: mode === "automatic" ? "exclusive" : undefined,
          product_data: {
            name: `${CYBER_SECURED_NAME}, one seat for a year`,
            description: `${TIER_NAME[quote.tier]} rate. One seat is one person and opens ${liveTrackNames()}.`,
          },
        },
      },
    ],
    customer_email: input.adminEmail.trim().toLowerCase(),
    customer_creation: "always",
    billing_address_collection: "required",
    tax_id_collection: { enabled: true },
    automatic_tax: { enabled: mode === "automatic" },
    invoice_creation: { enabled: true },
    allow_promotion_codes: true,
    metadata: {
      product: "corporate-seats",
      course: SECURED_COURSE_META,
      seats: String(input.seats),
      plan: planForSeats(input.seats),
      ratePence: String(quote.ratePence),
      firmName: input.firmName.trim().slice(0, 120),
      sector: (input.sector ?? "").trim().slice(0, 80),
      contactName: (input.contactName ?? "").trim().slice(0, 120),
      contactRole: (input.contactRole ?? "").trim().slice(0, 120),
      tool: (input.tool ?? "").trim().slice(0, 20),
      adminEmail: input.adminEmail.trim().toLowerCase().slice(0, 200),
    },
    success_url: `${input.origin}/corporate/buy/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}/corporate/buy?seats=${input.seats}`,
  });
  if (!session.url) return { error: "Stripe did not return a checkout page. Try again in a moment.", status: 502 };
  return { url: session.url };
}

/* Called by the webhook on checkout.session.completed. The same admin
 * email means the same firm: a buyer who already runs a firm with us gets
 * the seats added to it and a note saying so; anyone else gets a new firm
 * and the admin invite, under AlgorithmX's name. Once per session.
 *
 * Reads both shapes of session: a Cyber Secured one, and one opened under
 * the old per-course checkout and paid after the deploy (see
 * purchaseFromMetadata). Either way the firm gains people, as seats on its
 * one licence. */
export async function fulfilCheckoutSession(session: Stripe.Checkout.Session, origin: string) {
  const m = session.metadata ?? {};
  if (m.product !== "corporate-seats") return { skipped: "not a corporate seat purchase" };
  if (session.payment_status !== "paid") return { skipped: `payment status ${session.payment_status}` };

  const done = await prisma.seatPurchase.findUnique({ where: { stripeCheckoutSessionId: session.id }, select: { orgId: true } });
  if (done) return { already: true, orgId: done.orgId };
  const legacy = await prisma.organisation.findUnique({ where: { stripeCheckoutSessionId: session.id }, select: { id: true, slug: true } });
  if (legacy) return { already: true, slug: legacy.slug };

  const { people, rows } = purchaseFromMetadata(m);
  const adminEmail = (m.adminEmail || session.customer_details?.email || session.customer_email || "").toLowerCase();
  if (!adminEmail || !m.firmName) return { skipped: "session is missing the firm name or the admin email" };
  if (people < 1) return { skipped: "session carries no seats" };
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const staffName = "AlgorithmX";
  const staffEmail = process.env.CORPORATE_ENQUIRY_TO ?? "admissions@algorithmx.co.uk";
  const purchaseRows = (orgId: string) => rows.map((r) => prisma.seatPurchase.create({ data: { orgId, course: r.course, seats: r.seats, stripeCheckoutSessionId: `${session.id}${r.sessionSuffix}` } }));

  const admin = await prisma.seat.findFirst({
    where: { email: adminEmail, role: "ADMIN" },
    orderBy: { invitedAt: "asc" },
    select: { org: { select: { id: true, name: true, slug: true, seatsPurchased: true } } },
  });
  if (admin) {
    /* The seats and the record of why they are there land together, or a
       retried webhook sees no purchase row and adds the seats again. */
    await prisma.$transaction([
      prisma.organisation.update({
        where: { id: admin.org.id },
        data: { seatsPurchased: { increment: people } },
      }),
      ...purchaseRows(admin.org.id),
    ]);
    const total = seatsAfterTopUp(admin.org.seatsPurchased, people);
    let emailed = true;
    try {
      await sendSeatsAdded({ to: adminEmail, firmName: admin.org.name, seats: people, total, origin, staffName, staffEmail });
    } catch (err) {
      emailed = false;
      console.error("[corporate/checkout] seats-added email failed", err instanceof Error ? err.message : err);
      await opsAlert({ what: "A seats-added email did not send", detail: { firm: admin.org.name, slug: admin.org.slug, adminEmail, seats: people, total, sessionId: session.id }, error: err });
    }
    return { added: true, slug: admin.org.slug, seats: people, total, emailed };
  }

  const made = await createFirm({
    name: m.firmName,
    sector: m.sector || null,
    contactName: m.contactName || null,
    contactRole: m.contactRole || null,
    approvedTool: approvedToolLabel(m.tool),
    plan: planForSeats(people),
    seatsPurchased: people,
    adminEmail,
    origin,
    staffName,
    staffEmail,
  });
  await prisma.$transaction([
    prisma.organisation.update({ where: { id: made.org.id }, data: { stripeCheckoutSessionId: session.id, stripeCustomerId: customerId } }),
    ...purchaseRows(made.org.id),
  ]);
  return { created: true, slug: made.org.slug, seats: people, emailed: made.emailed, link: made.link };
}
