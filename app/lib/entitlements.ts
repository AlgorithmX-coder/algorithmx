import { prisma } from "@/app/lib/prisma";
import type { Entitlement, EntitlementSource } from "@prisma/client";

/**
 * Server-side access checks for the multi-track platform.
 *
 * Every gated route/server-action must call `hasEntitlement` before
 * surfacing product content. Returns boolean — the caller decides
 * what to do on false (typically `redirect(CATALOGUE)`).
 *
 * NEVER call from client components — the prisma import would leak
 * the secret key. Always run on the server (server components,
 * route handlers, server actions, getServerSession-style code).
 */
export async function hasEntitlement(
  userId: string,
  productSlug: string,
): Promise<boolean> {
  if (!userId || !productSlug) return false;
  const row = await prisma.entitlement.findFirst({
    where: { userId, product: { slug: productSlug } },
    select: { id: true, source: true },
  });
  if (!row) return false;
  /* A BUNDLE grant is the organisation's access, not the person's: it came
     with a school place or a firm seat and was never bought by whoever is
     holding it. So closing that org's access closes this too. Checked only
     for BUNDLE, which means an individual's own PURCHASE or a comped
     MANUAL grant never pays for the extra read and can never be switched
     off by somebody else's licence ending. */
  if (row.source === "BUNDLE" && (await accessClosedFor(userId))) return false;
  return true;
}

/**
 * True when this person's access came from an organisation whose access
 * staff have closed.
 *
 * Revoking used to stop the adults and nobody else. The teacher dashboard,
 * the head's portal and the firm console all checked `revokedAt`, so a
 * school that stopped paying lost its staff screens while every child it
 * had already added carried on playing indefinitely: the schema said so in
 * as many words, calling it "a deliberate, smaller first cut rather than
 * touching the live kids' lesson-loading path".
 *
 * Two ways in, because the two sides of the product reach an org
 * differently: a pupil through the class they sit in, a firm learner
 * through the seat they claimed.
 */
export async function accessClosedFor(userId: string): Promise<boolean> {
  if (!userId) return false;
  const [pupilOfClosed, seatAtClosed] = await Promise.all([
    prisma.childProfile.count({ where: { userId, class: { org: { revokedAt: { not: null } } } } }),
    prisma.seat.count({ where: { userId, org: { revokedAt: { not: null } } } }),
  ]);
  return pupilOfClosed > 0 || seatAtClosed > 0;
}

/**
 * Bulk variant — returns the set of product slugs the user owns. Use
 * this on the hub so we don't fire one query per card.
 */
export async function getOwnedProductSlugs(
  userId: string,
): Promise<Set<string>> {
  if (!userId) return new Set();
  const rows = await prisma.entitlement.findMany({
    where: { userId },
    select: { source: true, product: { select: { slug: true } } },
  });
  /* Must agree with hasEntitlement or the catalogue offers a course that
     the gate then refuses. Asked once for the whole set, and only when
     there is a BUNDLE row that could be affected. */
  const closed = rows.some((r) => r.source === "BUNDLE") ? await accessClosedFor(userId) : false;
  return new Set(rows.filter((r) => !(closed && r.source === "BUNDLE")).map((r) => r.product.slug));
}

/**
 * Grant an entitlement for (user, product). The single funnel through
 * which ANY new entitlement is created — the stub purchase flow today,
 * the Stripe webhook tomorrow, the admin "comp this user" hatch later.
 *
 * Idempotent: re-granting an existing entitlement is a no-op (the
 * upsert's `update` branch deliberately leaves every column alone).
 * This matters because Stripe webhooks can fire more than once for
 * the same payment_intent — the second call must not produce a dupe
 * row, an error, or a clock-shifted `grantedAt`.
 *
 * Webhook-safe: no dependency on the current request or session.
 * The caller is responsible for resolving the right `userId` from
 * whatever channel triggered the grant (a session for the inline
 * flow; the Stripe customer metadata for the webhook).
 *
 * Throws a plain Error with a recognisable message when the slug
 * doesn't resolve to a Product — let the caller decide how to
 * surface that (page-level 404 redirect / webhook-level log).
 */
export async function grantEntitlement(
  userId: string,
  productSlug: string,
  source: EntitlementSource,
): Promise<Entitlement> {
  if (!userId) throw new Error("grantEntitlement: userId required");
  if (!productSlug) throw new Error("grantEntitlement: productSlug required");

  const product = await prisma.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  if (!product) {
    throw new Error(`grantEntitlement: no Product with slug "${productSlug}"`);
  }

  return prisma.entitlement.upsert({
    where: { userId_productId: { userId, productId: product.id } },
    create: { userId, productId: product.id, source },
    // Deliberate no-op on existing rows — preserves the original
    // `grantedAt` and `source`. If a freebie MANUAL grant pre-existed
    // a PURCHASE webhook later, we keep the MANUAL provenance.
    update: {},
  });
}

/**
 * Compute a child's current integer age in whole years from their DOB.
 * We never store age — only DOB — so this is the single derivation.
 */
export function getAge(dateOfBirth: Date | null | undefined): number | null {
  /* A school pupil has no date of birth: a school should not have to hand
     over a child's birthday to run a cyber-safety lesson, and the class
     carries a year group instead. Callers print the age only when there is
     one to print. */
  if (!dateOfBirth) return null;
  const now = new Date();
  let age = now.getFullYear() - dateOfBirth.getFullYear();
  const monthDiff = now.getMonth() - dateOfBirth.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && now.getDate() < dateOfBirth.getDate())
  ) {
    age -= 1;
  }
  return Math.max(0, age);
}
