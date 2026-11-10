/**
 * What Cyber Secured costs a firm. Pure arithmetic, no runtime imports, so
 * the buy form (a client component) prices the order as the buyer types
 * and the checkout charges the very same figure. Same split, same reason,
 * as learnerPlacesPricing.ts.
 *
 * THE PRICE (owner, 2026-11-09): one product, per seat per year.
 *   Team  fewer than 50 seats  £99 a seat
 *   Firm  50 seats or more     £85 a seat
 * The whole order goes at the rate its own seat count earns. A firm that
 * already holds seats and buys more is priced on what it buys now, not on
 * what it will hold afterwards.
 *
 * VAT goes on top, as it always has for firms: the fixed UK rate, or
 * Stripe Tax from the billing address, or none (VAT_MODE).
 */
import type { CourseKey } from "@prisma/client";
import type { VatMode } from "@/app/lib/corporateProducts";

export type SecuredTier = "TEAM" | "FIRM";

export const SECURED_SEAT_MIN = 10;
export const SECURED_SEAT_MAX = 249;
/* At this many seats the order moves to the Firm rate. */
export const FIRM_RATE_FROM = 50;
export const SECURED_RATE_PENCE: Record<SecuredTier, number> = { TEAM: 9900, FIRM: 8500 };
export const TIER_NAME: Record<SecuredTier, string> = { TEAM: "Team", FIRM: "Firm" };

/* The metadata value that marks a Cyber Secured checkout session. Older
 * sessions carried "ai-cleared" or "ai-fluent" here. */
export const SECURED_COURSE_META = "cyber-secured";

export function tierForSeats(seats: number): SecuredTier {
  return seats >= FIRM_RATE_FROM ? "FIRM" : "TEAM";
}

export function ratePenceFor(seats: number): number {
  return SECURED_RATE_PENCE[tierForSeats(seats)];
}

export function validateSecuredSeats(seats: number): string | null {
  if (!Number.isInteger(seats)) return "Seats must be a whole number.";
  if (seats < SECURED_SEAT_MIN) return `The smallest order is ${SECURED_SEAT_MIN} seats.`;
  if (seats > SECURED_SEAT_MAX) return `For more than ${SECURED_SEAT_MAX} seats, talk to us and we will quote you.`;
  return null;
}

/* Keep a typed or linked number inside what can be bought. */
export function clampSeats(n: number): number {
  if (!Number.isFinite(n)) return SECURED_SEAT_MIN;
  return Math.min(SECURED_SEAT_MAX, Math.max(SECURED_SEAT_MIN, Math.round(n)));
}

export interface SecuredQuote {
  seats: number;
  tier: SecuredTier;
  ratePence: number;
  /* Before VAT: what the Stripe line carries. */
  exVatPence: number;
  /* Null when Stripe works the VAT out from the billing address, because
   * nobody knows it until the buyer types that address in. */
  vatPence: number | null;
  incVatPence: number | null;
}

/* The figures the buyer sees, all in pence. Stripe applies the fixed rate
 * to the whole line, so VAT is rounded once on the total, as Stripe does. */
export function securedQuote(seats: number, mode: VatMode, vatPercent: number): SecuredQuote {
  const tier = tierForSeats(seats);
  const ratePence = SECURED_RATE_PENCE[tier];
  const exVatPence = ratePence * seats;
  const vatPence = mode === "automatic" ? null : mode === "fixed" ? Math.round((exVatPence * vatPercent) / 100) : 0;
  return { seats, tier, ratePence, exVatPence, vatPence, incVatPence: vatPence === null ? null : exVatPence + vatPence };
}

/* Just under the threshold, 50 seats cost less than the smaller order
 * (43 at £99 is £4,257; 50 at £85 is £4,250). The page says so rather than
 * let a firm pay more for fewer seats. Null when there is nothing to say. */
export function cheaperAtThreshold(seats: number): { seats: number; exVatPence: number } | null {
  if (seats >= FIRM_RATE_FROM) return null;
  const at = FIRM_RATE_FROM * SECURED_RATE_PENCE.FIRM;
  return at <= seats * SECURED_RATE_PENCE.TEAM ? { seats: FIRM_RATE_FROM, exVatPence: at } : null;
}

/* What one paid checkout adds to a firm, read from its session metadata.
 *
 * New sessions say course "cyber-secured" and carry the seat count: that
 * many people, one CYBER_SECURED purchase row.
 *
 * Sessions opened before Cyber Secured was the product (and paid after the
 * deploy) carry an AI Cleared line, an AI Fluent line, or both. One seat
 * now opens every track, so a Cleared line and a Fluent line bought
 * together are the same people twice: the larger line is the head count.
 * Their purchase rows keep the course they were bought as, and the Fluent
 * row keeps its ":fluent" suffix on the session id, exactly as before. */
export interface PurchaseRow {
  course: Extract<CourseKey, "CYBER_SECURED" | "AI_CLEARED" | "AI_FLUENT">;
  seats: number;
  sessionSuffix: "" | ":fluent";
}

export function purchaseFromMetadata(m: Record<string, string | undefined>): { people: number; rows: PurchaseRow[]; legacy: boolean } {
  const seats = Math.max(0, Math.floor(Number(m.seats) || 0));
  if (m.course === SECURED_COURSE_META) {
    return { people: seats, rows: [{ course: "CYBER_SECURED", seats, sessionSuffix: "" }], legacy: false };
  }
  if (m.course === "ai-fluent") {
    return { people: seats, rows: [{ course: "AI_FLUENT", seats, sessionSuffix: "" }], legacy: true };
  }
  const fluentSeats = Math.max(0, Math.floor(Number(m.fluentSeats) || 0));
  const rows: PurchaseRow[] = [{ course: "AI_CLEARED", seats, sessionSuffix: "" }];
  if (fluentSeats > 0) rows.push({ course: "AI_FLUENT", seats: fluentSeats, sessionSuffix: ":fluent" });
  return { people: Math.max(seats, fluentSeats), rows, legacy: true };
}

/* A repeat purchase adds to the licence; it never replaces it. */
export function seatsAfterTopUp(current: number, added: number): number {
  return Math.max(0, current) + Math.max(0, added);
}

export function gbp(pence: number): string {
  return `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: pence % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
}
