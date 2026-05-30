import { prisma } from "@/app/lib/prisma";
import type { Entitlement, EntitlementSource } from "@prisma/client";

/**
 * Server-side access checks for the multi-track platform.
 *
 * Every gated route/server-action must call `hasEntitlement` before
 * surfacing product content. Returns boolean — the caller decides
 * what to do on false (typically `redirect('/hub')`).
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
    select: { id: true },
  });
  return row !== null;
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
    select: { product: { select: { slug: true } } },
  });
  return new Set(rows.map((r) => r.product.slug));
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
export function getAge(dateOfBirth: Date): number {
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
