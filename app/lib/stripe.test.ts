import { afterEach, describe, expect, it } from "vitest";
import { planForSeats, stripeConfigured, vatMode, vatPercentShown } from "./stripe";

/* The switch that keeps firm checkout off until Stripe is set up, and the
 * VAT setting the buy page and the checkout share. The price itself is
 * pinned in cyberSecuredPricing.test.ts. */

const KEYS = ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "STRIPE_PRICE_AI_CLEARED_TEAM", "STRIPE_PRICE_AI_CLEARED_FIRM", "VAT_MODE", "STRIPE_AUTOMATIC_TAX"];

describe("firm checkout", () => {
  afterEach(() => {
    for (const k of KEYS) delete process.env[k];
  });

  it("maps seat counts to the firm's plan", () => {
    expect(planForSeats(10)).toBe("TEAM");
    expect(planForSeats(49)).toBe("TEAM");
    expect(planForSeats(50)).toBe("FIRM");
    expect(planForSeats(249)).toBe("FIRM");
    expect(planForSeats(250)).toBe("ENTERPRISE");
  });

  it("switches on with the key and the webhook secret, and no Stripe prices", () => {
    expect(stripeConfigured()).toBe(false);
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    expect(stripeConfigured()).toBe(false);
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_x";
    expect(stripeConfigured()).toBe(true);
  });

  it("stays off without the webhook secret, whatever price ids are set", () => {
    process.env.STRIPE_SECRET_KEY = "sk_test_x";
    process.env.STRIPE_PRICE_AI_CLEARED_TEAM = "price_team";
    process.env.STRIPE_PRICE_AI_CLEARED_FIRM = "price_firm";
    expect(stripeConfigured()).toBe(false);
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
});
