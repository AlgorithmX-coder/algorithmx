import { describe, expect, it } from "vitest";
import {
  FIRM_RATE_FROM,
  SECURED_RATE_PENCE,
  SECURED_SEAT_MAX,
  SECURED_SEAT_MIN,
  cheaperAtThreshold,
  clampSeats,
  gbp,
  purchaseFromMetadata,
  ratePenceFor,
  securedQuote,
  seatsAfterTopUp,
  tierForSeats,
  validateSecuredSeats,
} from "./cyberSecuredPricing";

/* Cyber Secured, owner-confirmed 2026-11-09: £99 a seat a year below 50
   seats, £85 a seat a year from 50, the whole order at the rate its own
   count earns, VAT on top. Pinned here because a rep quotes these out loud. */

describe("the rate an order earns", () => {
  it("49 seats is Team at £99", () => {
    expect(tierForSeats(49)).toBe("TEAM");
    expect(ratePenceFor(49)).toBe(9900);
  });

  it("50 seats is Firm at £85", () => {
    expect(tierForSeats(50)).toBe("FIRM");
    expect(ratePenceFor(50)).toBe(8500);
  });

  it("puts the whole order at one rate", () => {
    expect(securedQuote(10, "none", 0).exVatPence).toBe(99_000); // £990
    expect(securedQuote(49, "none", 0).exVatPence).toBe(485_100); // £4,851
    expect(securedQuote(50, "none", 0).exVatPence).toBe(425_000); // £4,250
    expect(securedQuote(120, "none", 0).exVatPence).toBe(1_020_000); // £10,200
    expect(securedQuote(SECURED_SEAT_MAX, "none", 0).exVatPence).toBe(SECURED_SEAT_MAX * SECURED_RATE_PENCE.FIRM);
  });
});

describe("VAT, ex and inc, in each mode", () => {
  it("fixed: 20% on top", () => {
    const q49 = securedQuote(49, "fixed", 20);
    expect(q49).toMatchObject({ tier: "TEAM", ratePence: 9900, exVatPence: 485_100, vatPence: 97_020, incVatPence: 582_120 });
    const q50 = securedQuote(50, "fixed", 20);
    expect(q50).toMatchObject({ tier: "FIRM", ratePence: 8500, exVatPence: 425_000, vatPence: 85_000, incVatPence: 510_000 });
  });

  it("automatic: the ex VAT total is known, the VAT is not until checkout", () => {
    const q49 = securedQuote(49, "automatic", 0);
    expect(q49.exVatPence).toBe(485_100);
    expect(q49.vatPence).toBeNull();
    expect(q49.incVatPence).toBeNull();
    const q50 = securedQuote(50, "automatic", 0);
    expect(q50.exVatPence).toBe(425_000);
    expect(q50.incVatPence).toBeNull();
  });

  it("none: inc and ex are the same", () => {
    const q49 = securedQuote(49, "none", 0);
    expect(q49).toMatchObject({ exVatPence: 485_100, vatPence: 0, incVatPence: 485_100 });
    const q50 = securedQuote(50, "none", 0);
    expect(q50).toMatchObject({ exVatPence: 425_000, vatPence: 0, incVatPence: 425_000 });
  });

  it("rounds VAT once on the total, as Stripe does", () => {
    /* 11 x £99 = £1,089.00, VAT £217.80: no rounding drift either way. */
    expect(securedQuote(11, "fixed", 20)).toMatchObject({ exVatPence: 108_900, vatPence: 21_780, incVatPence: 130_680 });
  });
});

describe("just under the threshold", () => {
  it("points a firm at 50 when 50 costs no more", () => {
    expect(cheaperAtThreshold(49)).toEqual({ seats: 50, exVatPence: 425_000 });
    expect(cheaperAtThreshold(43)).toEqual({ seats: 50, exVatPence: 425_000 }); // £4,257 vs £4,250
  });

  it("says nothing where the smaller order really is cheaper, or at 50 and above", () => {
    expect(cheaperAtThreshold(42)).toBeNull(); // £4,158
    expect(cheaperAtThreshold(10)).toBeNull();
    expect(cheaperAtThreshold(FIRM_RATE_FROM)).toBeNull();
    expect(cheaperAtThreshold(120)).toBeNull();
  });

  it("the only step down in price is at the threshold itself", () => {
    for (let n = SECURED_SEAT_MIN + 1; n <= SECURED_SEAT_MAX; n++) {
      const up = securedQuote(n, "none", 0).exVatPence > securedQuote(n - 1, "none", 0).exVatPence;
      expect(up, `${n - 1} -> ${n}`).toBe(n !== FIRM_RATE_FROM);
    }
  });
});

describe("what can be bought", () => {
  it("any whole number from 10 to 249", () => {
    expect(validateSecuredSeats(10)).toBeNull();
    expect(validateSecuredSeats(49)).toBeNull();
    expect(validateSecuredSeats(50)).toBeNull();
    expect(validateSecuredSeats(249)).toBeNull();
    expect(validateSecuredSeats(9)).toMatch(/smallest order is 10/);
    expect(validateSecuredSeats(250)).toMatch(/quote/);
    expect(validateSecuredSeats(20.5)).toMatch(/whole number/);
  });

  it("clamps a typed or linked count into range", () => {
    expect(clampSeats(49)).toBe(49);
    expect(clampSeats(3)).toBe(10);
    expect(clampSeats(900)).toBe(249);
    expect(clampSeats(Number.NaN)).toBe(10);
    expect(clampSeats(49.6)).toBe(50);
  });
});

describe("top-up maths", () => {
  it("a repeat purchase adds to the licence", () => {
    expect(seatsAfterTopUp(60, 10)).toBe(70);
    expect(seatsAfterTopUp(0, 25)).toBe(25);
  });

  it("prices a top-up on what is bought now, not on the total held after", () => {
    /* A firm on 60 seats buying 10 more pays the Team rate for the 10. */
    expect(securedQuote(10, "none", 0)).toMatchObject({ tier: "TEAM", exVatPence: 99_000 });
  });

  it("a Cyber Secured session adds its seat count, as one CYBER_SECURED row", () => {
    expect(purchaseFromMetadata({ product: "corporate-seats", course: "cyber-secured", seats: "49" })).toEqual({
      people: 49,
      rows: [{ course: "CYBER_SECURED", seats: 49, sessionSuffix: "" }],
      legacy: false,
    });
  });

  it("an old Cleared + Fluent session counts its people once, the larger line", () => {
    expect(purchaseFromMetadata({ course: "ai-cleared", seats: "40", fluentSeats: "20" })).toEqual({
      people: 40,
      rows: [
        { course: "AI_CLEARED", seats: 40, sessionSuffix: "" },
        { course: "AI_FLUENT", seats: 20, sessionSuffix: ":fluent" },
      ],
      legacy: true,
    });
    expect(purchaseFromMetadata({ course: "ai-cleared", seats: "10", fluentSeats: "30" }).people).toBe(30);
  });

  it("an old single-course session adds that line", () => {
    expect(purchaseFromMetadata({ course: "ai-cleared", seats: "20", fluentSeats: "0" })).toMatchObject({ people: 20, rows: [{ course: "AI_CLEARED", seats: 20 }] });
    expect(purchaseFromMetadata({ course: "ai-fluent", seats: "10" })).toMatchObject({ people: 10, rows: [{ course: "AI_FLUENT", seats: 10 }] });
  });

  it("garbage in the metadata adds nothing", () => {
    expect(purchaseFromMetadata({ course: "cyber-secured", seats: "lots" }).people).toBe(0);
    expect(purchaseFromMetadata({ course: "cyber-secured", seats: "-5" }).people).toBe(0);
  });
});

describe("gbp", () => {
  it("prints whole pounds without pence and pence when there are any", () => {
    expect(gbp(425_000)).toBe("£4,250");
    expect(gbp(582_120)).toBe("£5,821.20");
  });
});
