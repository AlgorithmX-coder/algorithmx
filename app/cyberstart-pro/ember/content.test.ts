import { describe, expect, it } from "vitest";
import { AXP, moduleReadout, stackDepth } from "./content";
import { EMPTY_COLOUR, WORDLIST, crackEstimate, poolSize } from "./crack";

/* Every string on the page, walked out of the content object. */
function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

describe("/pro Ember Console content", () => {
  const all = strings(AXP);

  it("has no em-dashes and no hard-coded course price", () => {
    expect(all.filter((s) => s.includes(String.fromCharCode(0x2014)))).toEqual([]);
    /* the only pound signs are the salary range in the honest section */
    expect(all.filter((s) => s.includes("£") && !s.includes("£25,000"))).toEqual([]);
  });

  it("keeps the live link targets", () => {
    expect(AXP.nav.logo.href).toBe("/");
    expect(AXP.nav.links.map((l) => l.href)).toEqual(["/pro/course", "#enrol"]);
    expect(AXP.nav.signIn.href).toBe("/pro/login");
    expect(AXP.enrol.anchorId).toBe("enrol");
    expect(AXP.waitlist.endpoint).toBe("/api/waitlist");
    expect(AXP.footer.links.find((l) => l.current)?.href).toBe("/pro");
  });

  it("lists 21 modules across four acts of 5, 6, 5 and 5, in order", () => {
    const M = AXP.journey.modules;
    expect(M).toHaveLength(21);
    expect([0, 1, 2, 3].map((a) => M.filter((m) => m.act === a).length)).toEqual([5, 6, 5, 5]);
    expect(M.map((m) => m.act)).toEqual([...M.map((m) => m.act)].sort());
  });

  it("reads a module out with its number and act", () => {
    const r = moduleReadout(AXP.journey.defaultModule);
    expect(r.n).toBe("09");
    expect(r.title).toBe("Web attacks & the OWASP Top 10");
    expect(r.actLabel).toBe("ACT 2 · MODULES 6 TO 11");
    expect(moduleReadout(20).act.badge).toBe("A4");
  });

  it("starts every terminal with a typed command", () => {
    for (const x of [...AXP.labs.items, ...AXP.how.steps]) {
      expect(x.lines[0][0]).toBe("p");
      expect(x.lines[0][1].startsWith("$ ")).toBe(true);
    }
  });

  it("stacks the portfolio pile with the picked piece in front", () => {
    expect([0, 1, 2, 3, 4].map((j) => stackDepth(j, 0))).toEqual([0, 1, 2, 3, 4]);
    expect([0, 1, 2, 3, 4].map((j) => stackDepth(j, 3))).toEqual([2, 3, 4, 0, 1]);
  });
});

describe("/pro password lab maths", () => {
  it("counts the character pool", () => {
    expect(poolSize("")).toBe(0);
    expect(poolSize("abc")).toBe(26);
    expect(poolSize("password123")).toBe(36);
    expect(poolSize("Ab1!")).toBe(95);
  });

  it("gives the empty, wordlist and length verdicts", () => {
    expect(crackEstimate("")).toMatchObject({ verdict: "Type a password above", colour: EMPTY_COLOUR, pct: 0 });
    expect(WORDLIST.has("password123")).toBe(true);
    expect(crackEstimate("Password123").verdict).toBe("Cracked instantly");
    expect(crackEstimate("zq").verdict).toBe("Cracked instantly");
    expect(crackEstimate("correct horse battery staple").verdict).toBe("Safe past the end of time");
  });
});
