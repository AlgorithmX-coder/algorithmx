import { beforeEach, describe, expect, it, vi } from "vitest";

/* No new certificate issues on AI Cleared or AI Fluent (owner,
 * 2026-11-09), but a certificate already issued must keep working for its
 * holder and on /verify. The database is stubbed: these check what
 * issueCertificate and verifyCertificate do with what it returns. */

const db = vi.hoisted(() => ({
  enrolment: { findUnique: vi.fn() },
  certificate: { create: vi.fn(), findUnique: vi.fn() },
}));
vi.mock("@/app/lib/prisma", () => ({ prisma: db }));
vi.mock("@/app/lib/resend", () => ({ sendEmail: vi.fn() }));

import { issueCertificate, verifyCertificate } from "./aiClearedCertificate";

const issuedAt = new Date("2026-10-01T09:00:00Z");
const expiresAt = new Date("2099-10-01T09:00:00Z");

function enrolment(slug: string, extra: Record<string, unknown> = {}) {
  return { id: "e1", orgId: "o1", completedAt: new Date("2026-11-01T09:00:00Z"), finalScore: 90, certificate: null, product: { slug }, ...extra };
}

describe("certificates after issuing stopped", () => {
  beforeEach(() => {
    db.enrolment.findUnique.mockReset();
    db.certificate.create.mockReset();
    db.certificate.findUnique.mockReset();
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

  it("still verifies an existing AXC serial", async () => {
    db.certificate.findUnique.mockResolvedValue({
      serial: "AXC-B7KD-3NQ2",
      issuedAt,
      expiresAt,
      enrolment: { user: { name: "Hannah Clarke", email: "hannah@example.com" }, org: { name: "Marlow Fenwick LLP" }, product: { slug: "ai-cleared" } },
    });
    const v = await verifyCertificate("axc-b7kd-3nq2");
    expect(db.certificate.findUnique).toHaveBeenCalledWith(expect.objectContaining({ where: { serial: "AXC-B7KD-3NQ2" } }));
    expect(v).toMatchObject({ serial: "AXC-B7KD-3NQ2", holder: "Hannah Clarke", firm: "Marlow Fenwick LLP", valid: true, course: "ai-cleared" });
  });

  it("still verifies an existing AXF serial", async () => {
    db.certificate.findUnique.mockResolvedValue({
      serial: "AXF-B7KD-3NQ2",
      issuedAt,
      expiresAt,
      enrolment: { user: { name: null, email: "sam@example.com" }, org: { name: "Marlow Fenwick LLP" }, product: { slug: "ai-fluent" } },
    });
    const v = await verifyCertificate("AXF-B7KD-3NQ2");
    expect(v).toMatchObject({ serial: "AXF-B7KD-3NQ2", holder: "sam", valid: true, course: "ai-fluent" });
  });
});
