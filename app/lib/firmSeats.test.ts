import { describe, expect, it } from "vitest";
import { checkFirmSeats, FIRM_SEATS_MAX } from "./firmSeats";
import { SECURED_SEAT_MAX } from "./cyberSecuredPricing";

const base = { held: 12, current: 20, reason: "Invoice 1042 paid" };

describe("checkFirmSeats", () => {
  it("accepts a whole number at or above the people holding a seat", () => {
    expect(checkFirmSeats({ ...base, seats: 25 })).toEqual({ ok: true, seats: 25, reason: "Invoice 1042 paid", unchanged: false });
    expect(checkFirmSeats({ ...base, seats: 12 })).toMatchObject({ ok: true, seats: 12 });
  });

  it("refuses to go below the people holding a seat, naming the floor", () => {
    const r = checkFirmSeats({ ...base, seats: 11 });
    expect(r).toMatchObject({ ok: false, error: "below_held" });
    if (!r.ok) expect(r.message).toContain("cannot go below 12");
  });

  it("says person, not people, when one holds a seat", () => {
    const r = checkFirmSeats({ ...base, held: 1, seats: 0 });
    if (r.ok) throw new Error("should refuse");
    expect(r.message).toContain("1 person already holds a seat");
  });

  it("allows zero when nobody holds a seat", () => {
    expect(checkFirmSeats({ ...base, held: 0, seats: 0 })).toMatchObject({ ok: true, seats: 0 });
  });

  it("refuses fractions, negatives, text and missing values", () => {
    for (const seats of [12.5, -1, "abc", "", "1e3", "12.0", null, undefined, NaN, Infinity]) {
      expect(checkFirmSeats({ ...base, seats })).toMatchObject({ ok: false, error: "not_whole" });
    }
  });

  it("reads a raw input string", () => {
    expect(checkFirmSeats({ ...base, seats: " 30 " })).toMatchObject({ ok: true, seats: 30 });
  });

  it("allows staff past the buy page's 249 but caps at the maximum", () => {
    expect(checkFirmSeats({ ...base, seats: SECURED_SEAT_MAX + 1 })).toMatchObject({ ok: true, seats: SECURED_SEAT_MAX + 1 });
    expect(FIRM_SEATS_MAX).toBeGreaterThan(SECURED_SEAT_MAX);
    expect(checkFirmSeats({ ...base, seats: FIRM_SEATS_MAX })).toMatchObject({ ok: true });
    expect(checkFirmSeats({ ...base, seats: FIRM_SEATS_MAX + 1 })).toMatchObject({ ok: false, error: "over_max" });
  });

  it("requires a short reason, trimmed", () => {
    expect(checkFirmSeats({ ...base, seats: 25, reason: "" })).toMatchObject({ ok: false, error: "no_reason" });
    expect(checkFirmSeats({ ...base, seats: 25, reason: "  ok " })).toMatchObject({ ok: false, error: "no_reason" });
    expect(checkFirmSeats({ ...base, seats: 25, reason: undefined })).toMatchObject({ ok: false, error: "no_reason" });
    expect(checkFirmSeats({ ...base, seats: 25, reason: "x".repeat(201) })).toMatchObject({ ok: false, error: "reason_too_long" });
    expect(checkFirmSeats({ ...base, seats: 25, reason: "  goodwill seat  " })).toMatchObject({ ok: true, reason: "goodwill seat" });
  });

  it("checks the number before the reason, so the floor message wins", () => {
    expect(checkFirmSeats({ ...base, seats: 5, reason: "" })).toMatchObject({ ok: false, error: "below_held" });
  });

  it("flags a re-save of the current number as unchanged", () => {
    expect(checkFirmSeats({ ...base, seats: 20 })).toMatchObject({ ok: true, unchanged: true });
  });
});
