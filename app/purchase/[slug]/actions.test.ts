import { beforeEach, describe, expect, it, vi } from "vitest";

/* The checkout action must never grant a course. Until real payment lands
 * it sends the buyer back to the purchase page ("Buying opens soon"), or to
 * the success view when they already own the course. Firm courses go to
 * /corporate. Session and database are stubbed; redirect throws, as Next's
 * does, so the test sees where it went. */

const m = vi.hoisted(() => ({
  redirect: vi.fn((to: string) => {
    throw new Error(`REDIRECT ${to}`);
  }),
  auth: vi.fn(),
  findUnique: vi.fn(),
  grantEntitlement: vi.fn(),
  hasEntitlement: vi.fn(),
}));
vi.mock("next/navigation", () => ({ redirect: m.redirect }));
vi.mock("@/app/lib/auth", () => ({ auth: m.auth }));
vi.mock("@/app/lib/prisma", () => ({ prisma: { product: { findUnique: m.findUnique } } }));
vi.mock("@/app/lib/entitlements", () => ({ grantEntitlement: m.grantEntitlement, hasEntitlement: m.hasEntitlement }));
vi.mock("@/app/lib/courseIntent", () => ({ CATALOGUE: "/" }));

import { startCheckoutAction } from "./actions";

describe("startCheckoutAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    m.auth.mockResolvedValue({ user: { id: "u1" } });
    m.hasEntitlement.mockResolvedValue(false);
    m.findUnique.mockImplementation(async ({ where }: { where: { slug: string } }) => ({ id: `p-${where.slug}`, slug: where.slug, status: "ACTIVE" }));
  });

  for (const slug of ["ai-cleared", "ai-fluent", "cyber-awareness", "cyber-secured"]) {
    it(`sends ${slug} to /corporate and grants nothing`, async () => {
      await expect(startCheckoutAction(slug)).rejects.toThrow("REDIRECT /corporate");
      expect(m.grantEntitlement).not.toHaveBeenCalled();
      expect(m.findUnique).not.toHaveBeenCalled();
    });
  }

  for (const slug of ["cyber-heroes", "cyberexplorers", "cyberstart", "cyberstart-pro", "desk-ready"]) {
    it(`never grants the consumer course ${slug} for free`, async () => {
      await expect(startCheckoutAction(slug)).rejects.toThrow(`REDIRECT /purchase/${slug}`);
      expect(m.grantEntitlement).not.toHaveBeenCalled();
    });
  }

  it("sends an owner to the success view without granting again", async () => {
    m.hasEntitlement.mockResolvedValue(true);
    await expect(startCheckoutAction("cyber-heroes")).rejects.toThrow("REDIRECT /purchase/cyber-heroes?status=success");
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });

  it("sends a signed-out visitor to sign in and grants nothing", async () => {
    m.auth.mockResolvedValue(null);
    await expect(startCheckoutAction("cyber-heroes")).rejects.toThrow("REDIRECT /login");
    expect(m.grantEntitlement).not.toHaveBeenCalled();
  });
});
