/**
 * One person buying one course: the Stripe checkout and its fulfilment.
 *
 * Owner, 2026-11-26: a person pays once for one course and keeps it for
 * life. The price is the whole price, VAT included, from consumerCatalogue.ts.
 * Nothing here grants anything until Stripe says the money has arrived: the
 * buy page only creates a Checkout Session, and the webhook calls
 * fulfilConsumerSession, which writes the PURCHASE entitlement and the
 * ConsumerPurchase row that records it.
 *
 * Server only. Never import from a client component.
 */
import type Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";
import { stripe, vatInclusiveTaxRateId, vatMode } from "@/app/lib/stripe";
import { consumerCourse, purchasePath, type ConsumerCourse } from "@/app/lib/consumerCatalogue";
import { INDIVIDUAL_LEARNERS_ORG_NAME, INDIVIDUAL_LEARNERS_ORG_SLUG } from "@/app/lib/cyberSecured";

/** The metadata tag the webhook routes on. */
export const CONSUMER_PRODUCT = "consumer-course";

/* Card checkout needs the key and the webhook secret, and nothing else. */
export function consumerCheckoutConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET);
}

export interface ConsumerCheckoutInput {
  slug: string;
  /** The account the course is FOR. It receives the entitlement. */
  userId: string;
  /** Where the receipt goes: the buyer, or the parent paying for a child. */
  email: string;
  /** When the buyer ticked the 14-day cancellation box. Required. */
  waiverConsentAt: Date;
  origin: string;
  /** Where Stripe sends them back to. Defaults to the course's buy page. */
  successPath?: string;
  cancelPath?: string;
  /** "parent" when a grown-up pays for a child's account. */
  paidBy?: "self" | "parent";
}

/**
 * The Stripe fields that make the price VAT-inclusive, for the current
 * VAT_MODE. The amount charged is the catalogue price in every mode; only
 * how the receipt shows the VAT differs. Exported for the unit test.
 */
export async function inclusiveTax(): Promise<{ taxRates?: string[]; taxBehavior?: "inclusive"; automaticTax: boolean }> {
  const mode = vatMode();
  if (mode === "fixed") return { taxRates: [await vatInclusiveTaxRateId()], automaticTax: false };
  if (mode === "automatic") return { taxBehavior: "inclusive", automaticTax: true };
  return { automaticTax: false };
}

/** The Checkout Session parameters for one course. Pure, for the unit test. */
export function consumerSessionParams(
  course: ConsumerCourse,
  input: ConsumerCheckoutInput,
  tax: { taxRates?: string[]; taxBehavior?: "inclusive"; automaticTax: boolean },
): Stripe.Checkout.SessionCreateParams {
  const email = input.email.trim().toLowerCase();
  const metadata = {
    product: CONSUMER_PRODUCT,
    slug: course.slug,
    userId: input.userId,
    waiverConsentAt: input.waiverConsentAt.toISOString(),
    paidBy: input.paidBy ?? "self",
  };
  const success = input.successPath ?? `${purchasePath(course.slug)}?status=success`;
  const join = success.includes("?") ? "&" : "?";
  return {
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        tax_rates: tax.taxRates,
        price_data: {
          currency: "gbp",
          unit_amount: course.pence,
          tax_behavior: tax.taxBehavior,
          product_data: {
            name: `${course.name}, lifetime access`,
            description: `${course.line} One payment, VAT included.`,
          },
        },
      },
    ],
    customer_email: email,
    client_reference_id: input.userId,
    automatic_tax: { enabled: tax.automaticTax },
    /* The same tags on the payment itself, so a refund made later in the
       Stripe dashboard can be traced back to this purchase. */
    payment_intent_data: { receipt_email: email, metadata },
    metadata,
    success_url: `${input.origin}${success}${join}session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${input.origin}${input.cancelPath ?? purchasePath(course.slug)}`,
  };
}

export async function createConsumerCheckout(
  input: ConsumerCheckoutInput,
): Promise<{ url: string } | { error: string; status: number }> {
  if (!consumerCheckoutConfigured()) return { error: "Card payment is not switched on yet.", status: 503 };
  const course = consumerCourse(input.slug);
  if (!course) return { error: "That course is not for sale here.", status: 404 };
  if (!input.userId || !input.email) return { error: "Sign in first.", status: 401 };

  const session = await stripe().checkout.sessions.create(consumerSessionParams(course, input, await inclusiveTax()));
  if (!session.url) return { error: "Stripe did not return a checkout page. Try again in a moment.", status: 502 };
  return { url: session.url };
}

/**
 * Give a buyer the course they paid for. Idempotent: the entitlement grant
 * and the enrolment are both safe to repeat, and the purchase row is
 * written LAST, so a webhook that fails half way is retried in full rather
 * than finding a row and assuming the grant happened.
 *
 * The entitlement's source becomes PURCHASE even if a tester grant was
 * there first, so a refund (which removes PURCHASE access) treats it as
 * the paid access it now is.
 */
export async function grantPurchasedCourse(userId: string, course: ConsumerCourse): Promise<void> {
  const product = await prisma.product.findUnique({ where: { slug: course.slug }, select: { id: true } });
  if (!product) throw new Error(`grantPurchasedCourse: no Product with slug "${course.slug}"`);
  await prisma.entitlement.upsert({
    where: { userId_productId: { userId, productId: product.id } },
    create: { userId, productId: product.id, source: "PURCHASE" },
    update: { source: "PURCHASE" },
  });
  if (course.workplace) await enrolIndividual(userId, product.id);
}

/** The house record individual buyers of the workplace courses sit under. */
async function individualLearnersOrgId(): Promise<string> {
  const org = await prisma.organisation.upsert({
    where: { slug: INDIVIDUAL_LEARNERS_ORG_SLUG },
    create: { name: INDIVIDUAL_LEARNERS_ORG_NAME, slug: INDIVIDUAL_LEARNERS_ORG_SLUG, contactName: "your manager" },
    update: {},
    select: { id: true },
  });
  return org.id;
}

/**
 * The AI Cleared, AI Fluent and Cyber Awareness pages open for someone with
 * the entitlement AND an Enrolment. A firm's people get theirs when they
 * claim a seat; an individual buyer gets one here, under the house record.
 * Someone already enrolled through their firm keeps that enrolment, desk
 * and progress untouched.
 */
async function enrolIndividual(userId: string, productId: string): Promise<void> {
  const held = await prisma.enrolment.findUnique({ where: { userId_productId: { userId, productId } }, select: { id: true } });
  if (held) return;
  /* Their desk on any other workplace course, so a second purchase starts
     where the first one left them. */
  const other = await prisma.enrolment.findFirst({ where: { userId }, orderBy: { startedAt: "asc" }, select: { track: true } });
  const orgId = await individualLearnersOrgId();
  await prisma.enrolment.createMany({
    data: [{ userId, productId, orgId, track: other?.track ?? "GENERAL" }],
    skipDuplicates: true,
  });
}

export type ConsumerFulfilment =
  | { skipped: string }
  | { already: true; slug: string }
  | { granted: true; slug: string; userId: string };

/** Called by the webhook once a "consumer-course" checkout has been paid. */
export async function fulfilConsumerSession(session: Stripe.Checkout.Session): Promise<ConsumerFulfilment> {
  const m = session.metadata ?? {};
  if (m.product !== CONSUMER_PRODUCT) return { skipped: "not a consumer course purchase" };
  if (session.payment_status !== "paid") return { skipped: `payment status ${session.payment_status}` };

  const course = consumerCourse(m.slug);
  if (!course) return { skipped: `unknown course "${m.slug ?? ""}"` };
  const userId = m.userId ?? "";
  if (!userId) return { skipped: "session carries no account" };

  const recorded = await prisma.consumerPurchase.findUnique({ where: { stripeSessionId: session.id }, select: { slug: true } });
  if (recorded) return { already: true, slug: recorded.slug };

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true } });
  if (!user) return { skipped: "the account this was bought for no longer exists" };

  await grantPurchasedCourse(userId, course);

  const consent = m.waiverConsentAt ? new Date(m.waiverConsentAt) : null;
  const paymentIntentId = typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null;
  try {
    await prisma.consumerPurchase.create({
      data: {
        userId,
        slug: course.slug,
        amountPence: session.amount_total ?? course.pence,
        currency: session.currency ?? "gbp",
        stripeSessionId: session.id,
        paymentIntentId,
        buyerEmail: (session.customer_details?.email ?? session.customer_email ?? "").trim().toLowerCase(),
        waiverConsentAt: consent && !Number.isNaN(consent.getTime()) ? consent : null,
      },
    });
  } catch (err) {
    /* Two deliveries of the same event racing each other: the other one
       wrote the row, and the grant above is idempotent. */
    if ((err as { code?: string } | null)?.code === "P2002") return { already: true, slug: course.slug };
    throw err;
  }
  return { granted: true, slug: course.slug, userId };
}

/** True when this checkout has been recorded for this account. */
export async function consumerPurchaseRecorded(sessionId: string, userId: string): Promise<boolean> {
  if (!sessionId || !userId) return false;
  const row = await prisma.consumerPurchase.findUnique({ where: { stripeSessionId: sessionId }, select: { userId: true } });
  return row?.userId === userId;
}
