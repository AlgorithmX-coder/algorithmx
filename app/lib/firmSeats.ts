/* Staff changing a firm's Cyber Secured seat count by hand: an invoice paid
 * for a top-up, a correction, a goodwill seat. Until this existed the only
 * way to do any of those was editing the database.
 *
 * Dependency-free on purpose (no Prisma), so the ops screen can run the
 * same check as the server while staff type, and so it can be unit-tested.
 * The server is still the gate: it recounts the people holding a seat and
 * runs this again before anything is written.
 *
 * The floor is the people already holding a seat, counted the way the seat
 * cap counts them (distinct emails, see seatsLeft in aiClearedAdmin.ts and
 * onePerPerson in cyberSecured.ts). A firm licensed for fewer seats than
 * it has people is a firm whose cap is already blown, so staff who really
 * mean it take people off the register first.
 *
 * The ceiling is generous rather than the buy page's 249
 * (SECURED_SEAT_MAX in cyberSecuredPricing.ts): staff routinely
 * settle Enterprise deals by invoice. 10,000 is a typo guard, not a price
 * band. */

export const FIRM_SEATS_MAX = 10_000;
export const SEAT_REASON_MIN = 3;
export const SEAT_REASON_MAX = 200;

export type FirmSeatsCheck =
  | { ok: true; seats: number; reason: string; unchanged: boolean }
  | { ok: false; error: "not_whole" | "below_held" | "over_max" | "no_reason" | "reason_too_long"; message: string };

export function checkFirmSeats(args: {
  /* What staff typed. A number from JSON, or the raw input string. */
  seats: unknown;
  /* People already holding a seat: the floor. */
  held: number;
  /* What the firm has now, so a re-save of the same number is a no-op. */
  current: number;
  reason: unknown;
}): FirmSeatsCheck {
  const raw = typeof args.seats === "string" ? args.seats.trim() : args.seats;
  const n = typeof raw === "number" ? raw : typeof raw === "string" && /^\d+$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isInteger(n) || n < 0) {
    return { ok: false, error: "not_whole", message: "Seats must be a whole number." };
  }
  if (n > FIRM_SEATS_MAX) {
    return { ok: false, error: "over_max", message: `That is more than ${FIRM_SEATS_MAX.toLocaleString("en-GB")} seats. Check the number.` };
  }
  if (n < args.held) {
    return {
      ok: false,
      error: "below_held",
      message: `${args.held} ${args.held === 1 ? "person already holds" : "people already hold"} a seat, so it cannot go below ${args.held}. Take people off the register first.`,
    };
  }
  const reason = typeof args.reason === "string" ? args.reason.trim() : "";
  if (reason.length < SEAT_REASON_MIN) {
    return { ok: false, error: "no_reason", message: "Give a short reason, for example \"Invoice 1042 paid, 5 more seats\"." };
  }
  if (reason.length > SEAT_REASON_MAX) {
    return { ok: false, error: "reason_too_long", message: `Keep the reason under ${SEAT_REASON_MAX} characters.` };
  }
  return { ok: true, seats: n, reason, unchanged: n === args.current };
}
