import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { MILESTONES, getAchievedMilestones, getCertificateUrl } from "./certificates";

/**
 * The certificate used to be a name-to-PDF service.
 *
 * The route took childName, weekNumber and completedDate as query
 * parameters and printed whatever it was handed, with no session and no
 * check that the milestone had been earned. Anybody could mint one in any
 * name, at any rank, dated anything, and the /schools page promises a
 * school "certificates for every pupil".
 *
 * These guard the shape of that fix, which is the part a later change could
 * quietly undo: the caller says which milestone and, for a teacher, which
 * pupil, and nothing else.
 */
describe("the certificate link", () => {
  it("carries no name and no date", () => {
    const url = getCertificateUrl(5);
    expect(url).toBe("/api/certificate?week=5");
    expect(url).not.toMatch(/childName/);
    expect(url).not.toMatch(/completedDate/);
  });

  it("carries a pupil id only when a teacher asks for one", () => {
    expect(getCertificateUrl(20)).not.toMatch(/childProfileId/);
    expect(getCertificateUrl(20, "cp_abc")).toBe(
      "/api/certificate?week=20&childProfileId=cp_abc",
    );
  });

  it("encodes the pupil id, so an id can never break out of the query", () => {
    expect(getCertificateUrl(10, "a&week=20")).toBe(
      "/api/certificate?week=10&childProfileId=a%26week%3D20",
    );
  });

  it("is refused by the route without a session", () => {
    /* Read rather than invoked: the route pulls in jsPDF and Prisma, which
       is not worth standing up for one assertion. What matters is that the
       auth check and the earned check are both still there. */
    const src = readFileSync("app/api/certificate/route.ts", "utf8");
    expect(src).toContain("const session = await auth()");
    expect(src).toContain("certificateFor");
    expect(src, "the name must come from the database, never the query").not.toMatch(
      /searchParams\.get\(\s*"childName"\s*\)/,
    );
  });

  /**
   * The certificate is handed to a child and shown to their parents, so a
   * claim about a third party on it has to be one we can evidence. It read
   * "Aligned with CyberFirst & ASDAN frameworks": CyberFirst is the NCSC's
   * programme and ASDAN is an awarding organisation, and nothing in this
   * repository evidences either agreement. Until it does, it stays off.
   */
  it("makes no accreditation claim we cannot evidence", () => {
    const src = readFileSync("app/api/certificate/route.ts", "utf8");
    const printed = src.match(/doc\.text\((["`])[^"`]*\1/g)?.join("\n") ?? "";
    expect(printed).not.toMatch(/CyberFirst/i);
    expect(printed).not.toMatch(/ASDAN/i);
    /* And the footer names a domain we own. */
    expect(printed).not.toMatch(/algorithmx\.com/);
  });
});

describe("which milestones are earned", () => {
  it("needs the weeks finished, not the weeks reached", () => {
    const at4 = getAchievedMilestones(4);
    expect(at4.find((m) => m.week === 5)?.achieved).toBe(false);
    expect(at4.find((m) => m.week === 5)?.weeksRemaining).toBe(1);

    const at5 = getAchievedMilestones(5);
    expect(at5.find((m) => m.week === 5)?.achieved).toBe(true);
  });

  it("gives all four at the end of the course", () => {
    const done = getAchievedMilestones(20);
    expect(done.every((m) => m.achieved)).toBe(true);
    expect(done).toHaveLength(MILESTONES.length);
  });
});
