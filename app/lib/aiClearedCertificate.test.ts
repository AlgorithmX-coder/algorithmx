import { beforeEach, describe, expect, it, vi } from "vitest";

/* No new certificate issues on AI Cleared or AI Fluent (owner,
 * 2026-11-09), but a certificate already issued must keep working for its
 * holder. The database is stubbed: these check what issueCertificate does
 * with what it returns. */

const db = vi.hoisted(() => ({
  enrolment: { findUnique: vi.fn() },
  certificate: { create: vi.fn() },
}));
vi.mock("@/app/lib/prisma", () => ({ prisma: db }));
vi.mock("@/app/lib/resend", () => ({ sendEmail: vi.fn() }));

import { issueCertificate } from "./aiClearedCertificate";

const issuedAt = new Date("2026-10-01T09:00:00Z");
const expiresAt = new Date("2099-10-01T09:00:00Z");

function enrolment(slug: string, extra: Record<string, unknown> = {}) {
  return { id: "e1", orgId: "o1", completedAt: new Date("2026-11-01T09:00:00Z"), finalScore: 90, certificate: null, product: { slug }, ...extra };
}

describe("certificates after issuing stopped", () => {
  beforeEach(() => {
    db.enrolment.findUnique.mockReset();
    db.certificate.create.mockReset();
  });

  for (const slug of ["ai-cleared", "ai-fluent", "cyber-awareness"]) {
    it(`issues nothing new on a completed ${slug} enrolment`, async () => {
      db.enrolment.findUnique.mockResolvedValue(enrolment(slug));
      const r = await issueCertificate("e1");
      expect(r).toEqual({ ok: false, reason: "not-issued" });
      expect(db.certificate.create).not.toHaveBeenCalled();
    });
  }

  it("still returns a certificate issued before, for its holder", async () => {
    db.enrolment.findUnique.mockResolvedValue(enrolment("ai-fluent", { certificate: { serial: "AXF-B7KD-3NQ2", issuedAt, expiresAt, score: 88 } }));
    const r = await issueCertificate("e1");
    expect(r).toEqual({ ok: true, serial: "AXF-B7KD-3NQ2", issuedAt, expiresAt, score: 88, alreadyIssued: true });
    expect(db.certificate.create).not.toHaveBeenCalled();
  });

});
