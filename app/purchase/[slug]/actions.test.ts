import { beforeEach, describe, expect, it, vi } from "vitest";

/* The stub checkout grants a free entitlement to whatever ACTIVE product
 * it is asked for. Firm courses must never come through it: they are
 * licensed per seat by a firm. Session, database and grant are stubbed;
 * redirect throws, as Next's does, so the test sees where it went. */

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

  for (const slug of ["cyber-heroes", "cyberexplorers", "cyberstart-pro", "desk-ready"]) {
    it(`still grants the consumer course ${slug}`, async () => {
      await expect(startCheckoutAction(slug)).rejects.toThrow(`REDIRECT /purchase/${slug}?status=success`);
      expect(m.grantEntitlement).toHaveBeenCalledWith("u1", slug, "PURCHASE");
    });
  }
});
