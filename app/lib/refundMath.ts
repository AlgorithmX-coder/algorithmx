/**
 * The arithmetic of a refund, kept apart from Prisma and Stripe so it can be
 * read and tested on its own. Used by app/lib/refundEffects.ts.
 *
 * Stripe reports a charge's refunds as one running total (amount_refunded),
 * so everything here works from totals, never from "this refund": applying
 * the same total twice changes nothing, which is what lets a refund made in
 * the admin portal and the webhook Stripe then sends (or a refund made in
 * the Stripe dashboard, which only the webhook hears about) end in the same
 * state whichever arrives first.
 */

/**
 * How many of the seats or places a purchase bought count as refunded, for
 * a running refunded total. A full refund is every unit. A partial one is
 * the share of the money, rounded DOWN: refunding £1 of a fifty-place block
 * takes no place away, and staff never take back more than was paid for.
 */
export function refundedUnits(args: { units: number; paidPence: number; refundedPence: number; fully?: boolean }): number {
  const units = Math.max(0, Math.floor(args.units));
  if (args.fully || (args.paidPence > 0 && args.refundedPence >= args.paidPence)) return units;
  if (args.paidPence <= 0 || args.refundedPence <= 0) return 0;
  return Math.min(units, Math.floor((units * args.refundedPence) / args.paidPence));
}

/**
 * Lower a licence count by `remove`, never below what is already in use and
 * never above where it is now. `clamped` means the full amount could not
 * come off because people already hold those seats or places, which a
 * person then has to look at.
 */
export function lowerCount(args: { current: number; remove: number; inUse: number }): { next: number; removed: number; clamped: boolean } {
  const remove = Math.max(0, Math.floor(args.remove));
  const target = args.current - remove;
  const floor = Math.min(Math.max(0, args.inUse), args.current);
  const next = Math.max(target, floor);
  return { next, removed: args.current - next, clamped: next > target };
}

/** A consumer course loses its access only when the whole payment is back. */
export function consumerFullyRefunded(args: { paidPence: number; refundedPence: number; fully?: boolean }): boolean {
  return Boolean(args.fully) || (args.paidPence > 0 && args.refundedPence >= args.paidPence);
}
