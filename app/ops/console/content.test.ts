import { describe, expect, it } from "vitest";
import { enrolHref } from "@/app/lib/consumerCatalogue";
import { AXO, moduleArc, stepLabel } from "./content";

/* Every string on the page, walked out of the content object. */
function strings(v: unknown): string[] {
  if (typeof v === "string") return [v];
  if (Array.isArray(v)) return v.flatMap(strings);
  if (v && typeof v === "object") return Object.values(v).flatMap(strings);
  return [];
}

describe("/ops Glass Console content", () => {
  const all = strings(AXO);

  it("has no em-dashes and no price", () => {
    expect(all.filter((s) => s.includes(String.fromCharCode(0x2014)))).toEqual([]);
    expect(all.filter((s) => s.includes("£"))).toEqual([]);
  });

  it("sends every Sign up button through the enrol switch", () => {
    const enrol = enrolHref("cyberstart");
    expect(AXO.nav.cta.href).toBe(enrol);
    expect(AXO.hero.buttons[0].href).toBe(enrol);
    expect(AXO.cta.buttons[0].href).toBe(enrol);
    expect(AXO.nav.signIn.href).toBe("/ops/login");
  });

  it("lists 20 modules whose stages match the stage bar (11, 3, 2, 4)", () => {
    const M = AXO.curriculum.modules;
    expect(M).toHaveLength(20);
    const counts = AXO.curriculum.arcs.map((a) => M.filter((m) => m.arc === a.kind).length);
    expect(counts).toEqual([11, 3, 2, 4]);
    /* each stage is one unbroken run, in bar order */
    const order = M.map((m) => m.arc).filter((k, i, a) => i === 0 || a[i - 1] !== k);
    expect(order).toEqual(AXO.curriculum.arcs.map((a) => a.kind));
  });

  it("reads a module out with its number and stage tag", () => {
    expect(moduleArc(AXO.curriculum.defaultModule)).toEqual({ n: "05", title: "Injection", kind: "attack", tag: "Attacker" });
    expect(moduleArc(12)).toMatchObject({ n: "13", tag: "Defender" });
    expect(moduleArc(19)).toMatchObject({ n: "20", tag: "AI frontier" });
  });

  it("gives each of the five steps a typed command and its output", () => {
    const S = AXO.range.steps;
    expect(S.map((s) => s.n)).toEqual(["01", "02", "03", "04", "05"]);
    for (const s of S) {
      expect(s.lines[0][0]).toBe("p");
      expect(s.lines.length).toBeGreaterThan(1);
    }
    expect(stepLabel(2)).toBe("03 / 05");
  });
});
