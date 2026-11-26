import { beforeEach, describe, expect, it, vi } from "vitest";

/* The buy button must never grant a course. It opens a Stripe checkout
 * only for staff while CONSUMER_CHECKOUT_OPEN is false, only with the
 * 14-day cancellation tick, and only for a course on the owner's price
 * list. Everyone else goes back to the buy page ("Buying opens soon").
 * Session, database and Stripe are stubbed; redirect throws, as Next's
 * does, so the test sees where it went. */

const m = vi.hoisted(() => ({
  redirect: vi.fn((to: string) => {
    throw new Error(`REDIRECT ${to}`);
  }),
  auth: vi.fn(),
  findUnique: vi.fn(),
  grantEntitlement: vi.fn(),
  hasEntitlement: vi.fn(),
  isStaffUser: vi.fn(),
  createConsumerCheckout: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
vi.mock("next/headers", () => ({ headers: async () => new Map([["host", "example.test"], ["x-forwarded-proto", "https"]]) }));
vi.mock("@/app/lib/auth", () => ({ auth: m.auth }));
vi.mock("@/app/lib/prisma", () => ({ prisma: { product: { findUnique: m.findUnique }, user: { findUnique: vi.fn() } } }));
vi.mock("@/app/lib/entitlements", () => ({ grantEntitlement: m.grantEntitlement, hasEntitlement: m.hasEntitlement }));
vi.mock("@/app/lib/courseIntent", () => ({ CATALOGUE: "/" }));
vi.mock("@/app/lib/aiClearedStaff", () => ({ isStaffUser: m.isStaffUser }));
vi.mock("@/app/lib/consumerCheckout", () => ({ createConsumerCheckout: m.createConsumerCheckout }));

import { startCheckoutAction } from "./actions";

function ticked(): FormData {
  const f = new FormData();
  f.set("waiver", "on");
  return f;
}

const ALL = ["cyber-heroes", "cyberexplorers", "cyberstart", "cyberstart-pro", "desk-ready", "ai-cleared", "ai-fluent", "cyber-awareness"];

describe("startCheckoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.auth.mockResolvedValue({ user: { id: "u1", email: "buyer@example.test" } });
    m.hasEntitlement.mockResolvedValue(false);
    m.isStaffUser.mockResolvedValue(false);
    m.findUnique.mockImplementation(async ({ where }: { where: { slug: string } }) => ({ id: `p-${where.slug}` }));
    m.createConsumerCheckout.mockResolvedValue({ url: "https://checkout.stripe.test/c/1" });
  });

  it("sends the firm licence itself to /corporate and grants nothing", async () => {
    await expect(startCheckoutAction("cyber-secured", ticked())).rejects.toThrow("REDIRECT /corporate");
    expect(m.grantEntitlement).not.toHaveBeenCalled();
    expect(m.createConsumerCheckout).not.toHaveBeenCalled();
  });

  for (const slug of ALL) {
    it(`keeps ${slug} shut to the public until launch, and never grants it`, async () => {
      await expect(startCheckoutAction(slug, ticked())).rejects.toThrow(`REDIRECT /purchase/${slug}`);
      expect(m.grantEntitlement).not.toHaveBeenCalled();
      expect(m.createConsumerCheckout).not.toHaveBeenCalled();
    });
  }

  it("opens a real checkout for staff, for that one course, to the signed-in address", async () => {
    m.isStaffUser.mockResolvedValue(true);
    await expect(startCheckoutAction("desk-ready", ticked())).rejects.toThrow("REDIRECT https://checkout.stripe.test/c/1");
    expect(m.createConsumerCheckout).toHaveBeenCalledTimes(1);
    const arg = m.createConsumerCheckout.mock.calls[0][0];
    expect(arg).toMatchObject({ slug: "desk-ready", userId: "u1", email: "buyer@example.test", origin: "https://example.test" });
    expect(arg.waiverConsentAt).toBeInstanceOf(Date);
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });

  it("refuses to open checkout without the 14-day tick", async () => {
    m.isStaffUser.mockResolvedValue(true);
    await expect(startCheckoutAction("cyber-heroes", new FormData())).rejects.toThrow("REDIRECT /purchase/cyber-heroes?error=consent");
    expect(m.createConsumerCheckout).not.toHaveBeenCalled();
  });

  it("says so calmly when Stripe will not open a checkout", async () => {
    m.isStaffUser.mockResolvedValue(true);
    m.createConsumerCheckout.mockResolvedValue({ error: "off", status: 503 });
    await expect(startCheckoutAction("cyber-heroes", ticked())).rejects.toThrow("REDIRECT /purchase/cyber-heroes?error=unavailable");
  });

  it("sends an owner to the success view without charging again", async () => {
    m.hasEntitlement.mockResolvedValue(true);
    m.isStaffUser.mockResolvedValue(true);
    await expect(startCheckoutAction("cyber-heroes", ticked())).rejects.toThrow("REDIRECT /purchase/cyber-heroes?status=success");
    expect(m.createConsumerCheckout).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to that course's sign-up, coming back here", async () => {
    m.auth.mockResolvedValue(null);
    await expect(startCheckoutAction("cyberstart", ticked())).rejects.toThrow(`REDIRECT /ops/signup?callbackUrl=${encodeURIComponent("/purchase/cyberstart")}`);
    expect(m.createConsumerCheckout).not.toHaveBeenCalled();
  });
});
