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
 *
 * The arithmetic itself lives in learnerPlacesPricing.ts, so the buy form
 * can import it without dragging Prisma into the browser bundle, and is
 * re-exported below so server callers still have one place to look.
 */
import type Stripe from "stripe";
import { prisma } from "@/app/lib/prisma";
import { createSchool, sendPlacesAdded } from "@/app/lib/schoolOps";
import { opsAlert } from "@/app/lib/opsAlert";
import { stripe, vatMode, vatTaxRateId, VAT_PERCENT } from "@/app/lib/stripe";
import { PLACES_PER_BLOCK, placesPricePence, validateBlocks } from "@/app/lib/learnerPlacesPricing";

export * from "@/app/lib/learnerPlacesPricing";

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
   Kept apart from stripe.ts's stripeConfigured() (today the same test) so
   a future condition on the firm lane cannot switch this lane off. */
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
            description: `${input.blocks} block${input.blocks === 1 ? "" : "s"} of ${PLACES_PER_BLOCK}. A place is one young person on one course, follows them between groups, and never expires.`,
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
 * Every learner organisation this email already leads, newest first.
 *
 * Two ways to lead one, and both have to count. The obvious one is being an
 * ADMIN or MANAGER of it. The other is holding its invite and never having
 * claimed it, which is exactly the person who bought fifty places last week,
 * left the email in their inbox, and has just bought fifty more.
 *
 * Firms are excluded (`school: { isNot: null }`), because a law firm's admin
 * buying pupil places for a youth club is not the same account.
 */
async function learnerOrgsLedBy(email: string) {
  return prisma.organisation.findMany({
    where: {
      school: { isNot: null },
      OR: [
        { members: { some: { role: { in: ["ADMIN", "MANAGER"] }, user: { email } } } },
        { teacherInvites: { some: { email, role: { in: ["ADMIN", "MANAGER"] } } } },
      ],
    },
    select: { id: true, name: true, slug: true, seatsPurchased: true, revokedAt: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Called by the webhook once the payment has cleared.
 *
 * A FIRST purchase creates the organisation, its places and the lead's
 * invite, exactly as staff creating one by hand in /admin would. A SECOND
 * purchase adds places to the organisation that buyer already runs.
 *
 * That second case used to be impossible. There was one path and it always
 * called createSchool, so an organisation coming back for another block got
 * a whole second record: its own slug, its own invite, its own places, and
 * no way to merge the two. Their existing classes and pupils stayed behind
 * on the first one.
 *
 * Idempotent two ways over. The PlacePurchase row is keyed on the Stripe
 * session, which is the constraint that stops one payment becoming two lots
 * of places; and the organisation's own stripeCheckoutSessionId is still
 * checked, so a webhook redelivered across the deploy that introduced
 * PlacePurchase does not pay out a second time.
 */
export async function fulfilPlacesSession(session: Stripe.Checkout.Session, origin: string) {
  const m = session.metadata ?? {};
  if (m.product !== "learner-places") return { skipped: "not a places purchase" };
  if (session.payment_status !== "paid") return { skipped: `payment status ${session.payment_status}` };

  const [recorded, legacy] = await Promise.all([
    prisma.placePurchase.findUnique({
      where: { stripeCheckoutSessionId: session.id },
      select: { places: true, org: { select: { slug: true } } },
    }),
    prisma.organisation.findUnique({
      where: { stripeCheckoutSessionId: session.id },
      select: { slug: true },
    }),
  ]);
  if (recorded) return { already: true, slug: recorded.org.slug };
  if (legacy) return { already: true, slug: legacy.slug };

  const places = Number(m.places) || 0;
  const leadEmail = (m.leadEmail || session.customer_details?.email || session.customer_email || "").toLowerCase();
  if (!leadEmail || !m.orgName) return { skipped: "session is missing the organisation name or the lead's email" };
  if (places < 1) return { skipped: "session carries no places" };

  /* What they paid before VAT, from Stripe rather than re-derived from the
     ladder: the ladder can change price between the purchase and anybody
     asking a question about it. */
  const netPence = session.amount_subtotal ?? 0;
  const customerId = typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;

  const led = await learnerOrgsLedBy(leadEmail);

  if (led.length > 0) {
    /* More than one is rare and we do not refuse the payment over it. They
       have paid; leaving them with nothing while an email sits unread in the
       ops mailbox is the worse failure. So the places go on the newest
       account and staff are told loudly that it was a guess. Moving them is
       now one number on the school's own page in /admin, which is why
       guessing is safe here and was not before. */
    const org = led[0];
    if (led.length > 1) {
      await opsAlert({
        what: "An organisation bought more places and leads more than one account, so we guessed",
        detail: {
          leadEmail,
          places,
          putOn: org.slug,
          alsoLeads: led.slice(1).map((o) => o.slug).join(", "),
          sessionId: session.id,
          fix: "If it went on the wrong one, change both place counts from each organisation's page in /admin.",
        },
      });
    }
    if (org.revokedAt) {
      await opsAlert({
        what: "A closed organisation has just paid for more places",
        detail: {
          org: org.name,
          slug: org.slug,
          places,
          leadEmail,
          sessionId: session.id,
          fix: "The places are on their account. Reopen the organisation from its page in /admin or they cannot use them.",
        },
      });
    }

    /* One transaction: the places and the record of why they are there have
       to land together, or a retried webhook sees no purchase row and adds
       the places again. */
    await prisma.$transaction([
      prisma.organisation.update({
        where: { id: org.id },
        data: { seatsPurchased: { increment: places } },
      }),
      prisma.placePurchase.create({
        data: { orgId: org.id, places, netPence, leadEmail, stripeCheckoutSessionId: session.id },
      }),
    ]);

    let emailed = true;
    try {
      await sendPlacesAdded({
        to: leadEmail,
        orgName: org.name,
        added: places,
        total: org.seatsPurchased + places,
        origin,
      });
    } catch (err) {
      emailed = false;
      await opsAlert({
        what: "An organisation's extra places landed but the email did not send",
        detail: { org: org.name, slug: org.slug, places, leadEmail, sessionId: session.id },
        error: err,
      });
    }
    return { toppedUp: true, slug: org.slug, places, total: org.seatsPurchased + places, emailed };
  }

  const made = await createSchool({
    name: m.orgName,
    kind: "ORGANISATION",
    sector: m.sector || null,
    contactName: m.contactName || null,
    seatsPurchased: places,
    teacherEmail: leadEmail,
    origin,
  });

  await prisma.$transaction([
    prisma.organisation.update({
      where: { id: made.org.id },
      data: { stripeCheckoutSessionId: session.id, stripeCustomerId: customerId },
    }),
    prisma.placePurchase.create({
      data: { orgId: made.org.id, places, netPence, leadEmail, stripeCheckoutSessionId: session.id },
    }),
  ]);

  if (!made.emailed) {
    await opsAlert({
      what: "An organisation paid but its invite email did not send",
      detail: { org: made.org.name, slug: made.org.slug, leadEmail, places, link: made.link, sessionId: session.id },
    });
  }
  return { created: true, slug: made.org.slug, places, emailed: made.emailed };
}

/**
 * What became of one checkout, for the page the buyer lands on afterwards.
 *
 * Read from our own purchase rows rather than guessed from the buyer's
 * email, because guessing races the webhook. A first-time buyer whose
 * webhook has already landed looks exactly like a returning customer if you
 * only ask "does this email already lead an organisation": createSchool has
 * by then made them the invite that would answer yes.
 *
 * Counting this organisation's purchases cannot race: one purchase means
 * this was the one that created it, more than one means they came back.
 * Null means the webhook has not landed yet, which is a third thing the page
 * has to be able to say without being wrong.
 */
export async function placesPurchaseOutcome(
  sessionId: string,
): Promise<{ orgName: string; places: number; total: number; firstPurchase: boolean } | null> {
  const row = await prisma.placePurchase.findUnique({
    where: { stripeCheckoutSessionId: sessionId },
    select: {
      places: true,
      org: { select: { name: true, seatsPurchased: true, _count: { select: { placePurchases: true } } } },
    },
  });
  if (!row) return null;
  return {
    orgName: row.org.name,
    places: row.places,
    total: row.org.seatsPurchased,
    firstPurchase: row.org._count.placePurchases <= 1,
  };
}
