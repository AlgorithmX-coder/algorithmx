import { describe, expect, it } from "vitest";
import { EVAL_BANK } from "./evalBank";
import { isClean, localRewrite, realDataCheck, ruleFindings, verdictOf } from "./rules";
import { resolveTrack, type DataClass } from "./types";
import { getModule } from "../manifests";

/* The rules layer held to the eval bank on every CI run: forty prompts
 * across the four desks, each with the verdict it must get, the classes it
 * must find, and whether it must halt as real data. */

function packFor(track: (typeof EVAL_BANK)[number]["track"]) {
  const manifest = getModule(2)!;
  const { block } = resolveTrack(manifest, track);
  if (!block.dataPack) throw new Error(`no data pack for ${track}`);
  return block.dataPack;
}

describe("AI Cleared rules layer against the eval bank", () => {
  it("has forty cases, ten per desk", () => {
    expect(EVAL_BANK).toHaveLength(40);
    for (const track of ["finance", "legal", "hr", "general"] as const) {
      expect(EVAL_BANK.filter((c) => c.track === track)).toHaveLength(10);
    }
    expect(new Set(EVAL_BANK.map((c) => c.id)).size).toBe(40);
  });

  for (const c of EVAL_BANK) {
    it(`${c.id}: ${c.note}`, () => {
      const pack = packFor(c.track);
      const halted = realDataCheck(c.prompt, pack);
      expect(halted).toBe(c.halted ?? null);
      if (c.halted) return;

      const findings = ruleFindings(c.prompt, pack);
      expect(verdictOf(findings)).toBe(c.verdict);
      const found = new Set<DataClass>(findings.map((f) => f.cls));
      for (const cls of c.classes) expect(found.has(cls), `expected a ${cls} finding`).toBe(true);
      if (c.verdict === "ok") expect([...found].every((k) => k === "P" || k === "I")).toBe(true);

      /* The deterministic rewrite must always be clean, and must drop
       * every RESTRICTED item entirely. */
      const rewrite = localRewrite(c.prompt, findings, pack);
      expect(isClean(rewrite, pack)).toBe(true);
      for (const f of findings) if (f.cls === "R") expect(rewrite.toLowerCase()).not.toContain(f.text.toLowerCase());
      /* CONFIDENTIAL items become bracketed placeholders. */
      if (findings.some((f) => f.cls === "C")) expect(rewrite).toMatch(/\[[^\]]+\]/);
    });
  }

  it("never halts on the practice packs' own identifiers", () => {
    for (const track of ["finance", "legal", "hr", "general"] as const) {
      const pack = packFor(track);
      expect(realDataCheck(pack.facts, pack)).toBeNull();
    }
  });

  it("halts on real-looking identifiers that are in no pack", () => {
    const pack = packFor("finance");
    expect(realDataCheck("her NI number is AB 12 34 56 C", pack)).toBe("a National Insurance number");
    expect(realDataCheck("sort code 12-34-56", pack)).toBe("a sort code");
    expect(realDataCheck("account 12345678", pack)).toBe("an account number");
    expect(realDataCheck("email me at someone@example.com", pack)).toBe("an email address");
    expect(realDataCheck("call 07123 456789", pack)).toBe("a mobile number");
    expect(realDataCheck("card 4929 1234 5678 9012", pack)).toBe("a card number");
    expect(realDataCheck("nothing here at all", pack)).toBeNull();
  });
});
