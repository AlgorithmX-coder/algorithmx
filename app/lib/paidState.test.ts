import { describe, it, expect } from "vitest";
import { paidState, hasPaid, paidLabel, canToggle } from "./paidState";

describe("paidState", () => {
  it("calls a Stripe customer paid, whatever else is set", () => {
    expect(paidState({ stripeCustomerId: "cus_123", paidAt: null })).toBe("stripe");
  });

  it("calls a ticked organisation paid", () => {
    expect(paidState({ stripeCustomerId: null, paidAt: new Date("2026-11-20") })).toBe("paid");
  });

  it("accepts the stamp as an ISO string, the shape a client component is handed", () => {
    expect(paidState({ stripeCustomerId: null, paidAt: "2026-11-20T10:00:00.000Z" })).toBe("paid");
  });

  /* The bug this field exists to fix: a school onboarded on a licence had
     paid nothing, and the console called it "Paid (manual)" regardless. */
  it("does NOT call a school paid merely because it holds a licence", () => {
    expect(paidState({ stripeCustomerId: null, paidAt: null })).toBe("unpaid");
    expect(hasPaid({ stripeCustomerId: null, paidAt: null })).toBe(false);
  });

  it("treats missing fields as not paid rather than throwing", () => {
    expect(paidState({})).toBe("unpaid");
  });

  it("treats an empty Stripe id as no Stripe customer", () => {
    expect(paidState({ stripeCustomerId: "", paidAt: null })).toBe("unpaid");
  });

  it("lets staff change their own tick but not a card payment", () => {
    expect(canToggle(paidState({ paidAt: new Date() }))).toBe(true);
    expect(canToggle(paidState({ paidAt: null }))).toBe(true);
    expect(canToggle(paidState({ stripeCustomerId: "cus_1" }))).toBe(false);
  });

  it("labels each state in the words staff use", () => {
    expect(paidLabel("stripe")).toBe("Paid by card");
    expect(paidLabel("paid")).toBe("Paid");
    expect(paidLabel("unpaid")).toBe("Not paid yet");
  });
});
