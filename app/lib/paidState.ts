/**
 * Has this organisation actually paid?
 *
 * The console used to answer that by elimination: not revoked and not on a
 * trial meant "Paid (manual)". That is not what the field said. A school is
 * onboarded on a licence the moment it agrees to buy, which is often weeks
 * before the invoice is settled, so the console was reporting every unpaid
 * school as paid and staff had no way to tell one from the other.
 *
 * So the answer now comes from two facts and nothing else: a Stripe customer
 * has paid by definition, and for everyone else a member of staff ticks the
 * box when the money lands. Deliberately Prisma-free so the rule can be
 * tested on its own and cannot drift between the places that ask it.
 */

export type PaidState = "stripe" | "paid" | "unpaid";

export interface PaidFacts {
  /** Set once a card payment has gone through Stripe. */
  stripeCustomerId?: string | null;
  /** Set by staff when a manual deal's money has arrived. */
  paidAt?: Date | string | null;
}

export function paidState(o: PaidFacts): PaidState {
  if (o.stripeCustomerId) return "stripe";
  if (o.paidAt) return "paid";
  return "unpaid";
}

/** True when the money is in, however it got there. */
export function hasPaid(o: PaidFacts): boolean {
  return paidState(o) !== "unpaid";
}

/** What the tick says next to it. */
export function paidLabel(s: PaidState): string {
  if (s === "stripe") return "Paid by card";
  if (s === "paid") return "Paid";
  return "Not paid yet";
}

/**
 * Whether staff may change the tick. A Stripe payment is a fact about money
 * that moved, so staff cannot un-tick it here; everything else is their call.
 */
export function canToggle(s: PaidState): boolean {
  return s !== "stripe";
}
