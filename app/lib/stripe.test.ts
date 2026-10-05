import { afterEach, describe, expect, it } from "vitest";
import { SEAT_PRICE_PENCE, planForSeats, priceIdFor, sellableCourses, stripeConfigured, vatMode, vatPercentShown } from "./stripe";
import { validateSeats } from "./aiClearedCheckout";

/* The pack rules the checkout enforces, and the switch that keeps
 * checkout off until every variable exists. */

const KEYS = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_AI_CLEARED_TEAM", "STRIPE_PRICE_AI_CLEARED_FIRM", "STRIPE_PRICE_AI_FLUENT_TEAM", "STRIPE_PRICE_AI_FLUENT_FIRM", "VAT_MODE", "STRIPE_AUTOMATIC_TAX"];

describe("corporate seat packs", () => {
  afterEach(() => {
    for (const k of KEYS) delete process.env[k];
  });

  it("maps seat counts to packs", () => {
    expect(planForSeats(10)).toBe("TEAM");
    expect(planForSeats(49)).toBe("TEAM");
    expect(planForSeats(50)).toBe("FIRM");
    expect(planForSeats(249)).toBe("FIRM");
    expect(planForSeats(250)).toBe("ENTERPRISE");
  });

  it("charges the published prices", () => {
    expect(SEAT_PRICE_PENCE["ai-cleared"].TEAM).toBe(2900);
    expect(SEAT_PRICE_PENCE["ai-cleared"].FIRM).toBe(2500);
    expect(SEAT_PRICE_PENCE["ai-fluent"].TEAM).toBe(5900);
    expect(SEAT_PRICE_PENCE["ai-fluent"].FIRM).toBe(4500);
  });

  it("sells in packs of ten between 10 and 249", () => {
    expect(validateSeats(10)).toBeNull();
    expect(validateSeats(240)).toBeNull();
    expect(validateSeats(5)).toMatch(/smallest pack/);
    expect(validateSeats(15)).toMatch(/packs of 10/);
    expect(validateSeats(250)).toMatch(/Enterprise/);
    expect(validateSeats(20.5)).toMatch(/whole number/);
  });

  it("stays off until every variable exists", () => {
    expect(stripeConfigured()).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    expect(stripeConfigured()).toBe(false);
    process.env.STRIPE_PRICE_AI_CLEARED_TEAM = "price_team";
    process.env.STRIPE_PRICE_AI_CLEARED_FIRM = "price_firm";
    expect(stripeConfigured()).toBe(true);
    expect(priceIdFor("ai-cleared", "TEAM")).toBe("price_team");
    expect(priceIdFor("ai-cleared", "FIRM")).toBe("price_firm");
    expect(priceIdFor("ai-cleared", "ENTERPRISE")).toBeNull();
  });

  it("puts AI Fluent on sale only once both its prices exist", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    process.env.STRIPE_PRICE_AI_CLEARED_TEAM = "price_team";
    process.env.STRIPE_PRICE_AI_CLEARED_FIRM = "price_firm";
    expect(sellableCourses()).toEqual(["ai-cleared"]);
    process.env.STRIPE_PRICE_AI_FLUENT_TEAM = "price_fluent_team";
    expect(sellableCourses()).toEqual(["ai-cleared"]);
    process.env.STRIPE_PRICE_AI_FLUENT_FIRM = "price_fluent_firm";
    expect(sellableCourses()).toEqual(["ai-cleared", "ai-fluent"]);
    expect(stripeConfigured()).toBe(true);
  });

  it("adds the fixed UK rate unless VAT_MODE says otherwise", () => {
    expect(vatMode()).toBe("fixed");
    expect(vatPercentShown()).toBe(20);
    process.env.VAT_MODE = "none";
    expect(vatMode()).toBe("none");
    expect(vatPercentShown()).toBe(0);
    process.env.VAT_MODE = "automatic";
    expect(vatMode()).toBe("automatic");
    expect(vatPercentShown()).toBe(0);
    process.env.VAT_MODE = "nonsense";
    expect(vatMode()).toBe("fixed");
    delete process.env.VAT_MODE;
    process.env.STRIPE_AUTOMATIC_TAX = "1";
    expect(vatMode()).toBe("automatic");
  });

  it("stays off when only AI Fluent is priced", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    process.env.STRIPE_PRICE_AI_FLUENT_TEAM = "price_fluent_team";
    process.env.STRIPE_PRICE_AI_FLUENT_FIRM = "price_fluent_firm";
    expect(sellableCourses()).toEqual(["ai-fluent"]);
    expect(stripeConfigured()).toBe(false);
  });
});
