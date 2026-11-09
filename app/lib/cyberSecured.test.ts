import { describe, expect, it } from "vitest";
import { SECURED_TRACKS, isFirmProduct, liveTrackNames, onePerPerson } from "./cyberSecured";

const d = (day: number) => new Date(Date.UTC(2026, 10, day));
const seat = (id: string, email: string, invited: number, claimed: number | null = null) => ({ id, email, invitedAt: d(invited), claimedAt: claimed === null ? null : d(claimed) });

describe("onePerPerson", () => {
  it("counts someone with an old Cleared seat and an old Fluent seat once", () => {
    const rows = onePerPerson([seat("c", "ann@firm.co.uk", 1), seat("f", "ann@firm.co.uk", 2), seat("b", "bo@firm.co.uk", 3)]);
    expect(rows.map((r) => r.email)).toEqual(["ann@firm.co.uk", "bo@firm.co.uk"]);
  });

  it("shows the seat the person claimed, even when it was sent second", () => {
    const rows = onePerPerson([seat("cleared", "ann@firm.co.uk", 1), seat("fluent", "ann@firm.co.uk", 2, 4)]);
    expect(rows).toHaveLength(1);
    expect(rows[0].id).toBe("fluent");
  });

  it("keeps the first seat sent when neither is claimed", () => {
    const rows = onePerPerson([seat("later", "ann@firm.co.uk", 5), seat("first", "ann@firm.co.uk", 2)]);
    expect(rows[0].id).toBe("first");
  });

  it("puts claimed people first in claim order, then the rest in invite order", () => {
    const rows = onePerPerson([
      seat("u1", "u1@firm.co.uk", 1),
      seat("c2", "c2@firm.co.uk", 2, 9),
      seat("u2", "u2@firm.co.uk", 3),
      seat("c1", "c1@firm.co.uk", 4, 6),
    ]);
    expect(rows.map((r) => r.id)).toEqual(["c1", "c2", "u1", "u2"]);
  });
});

describe("Cyber Secured tracks", () => {
  it("never promises a track that is not built", () => {
    for (const t of SECURED_TRACKS.filter((x) => !x.live)) expect(liveTrackNames()).not.toContain(t.name);
  });

  it("names the live tracks as one phrase", () => {
    expect(liveTrackNames()).toBe("AI Cleared, AI Fluent and Cyber Awareness");
  });
});

describe("isFirmProduct", () => {
  it("knows every firm course, and Cyber Secured itself", () => {
    for (const slug of ["ai-cleared", "ai-fluent", "cyber-awareness", "cyber-secured", " AI-Fluent "]) expect(isFirmProduct(slug)).toBe(true);
  });

  it("covers every Cyber Secured track, built or not", () => {
    for (const t of SECURED_TRACKS) expect(isFirmProduct(t.slug)).toBe(true);
  });

  it("leaves every consumer course alone", () => {
    for (const slug of ["cyber-heroes", "cyberexplorers", "cyberstart", "cyberstart-pro", "desk-ready", "", null, undefined]) expect(isFirmProduct(slug)).toBe(false);
  });
});
