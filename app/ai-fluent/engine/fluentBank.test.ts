import { describe, expect, it } from "vitest";
import { FLUENT_BANK } from "./fluentBank";
import { rulesGrade } from "./rubric";
import { realDataCheck, ruleFindings, verdictOf } from "@/app/ai-cleared/engine/rules";
import { FINANCE_PACK } from "../desks/finance";
import { FLUENT_MODULE_1 } from "../manifests/module1";
import type { LoopPractise } from "@/app/ai-cleared/engine/types";

/* Holds the rules layer to the Fluent bank on every CI run, the way the
 * Cleared rules test holds its bank. The model layer is held to the same
 * bank by the ops console's eval button. Rules cannot see a weak element
 * or a wandered turn, so the "nearly" cases are left to the model; the
 * fluent, not-yet, leak and halt cases must come out right from the rules
 * alone. */

const loop = FLUENT_MODULE_1.tracks.finance!.practise as LoopPractise;

describe("the Fluent bank against the rules layer", () => {
  it("has forty cases, ten of each kind", () => {
    expect(FLUENT_BANK).toHaveLength(40);
    const by = (v: string) => FLUENT_BANK.filter((c) => c.verdict === v).length;
    expect(by("leak") + by("halt")).toBe(11);
    expect(by("fluent")).toBeGreaterThanOrEqual(10);
    expect(by("notyet")).toBe(10);
  });

  for (const c of FLUENT_BANK) {
    it(`${c.id}: ${c.note}`, () => {
      const latest = c.turns[c.turns.length - 1];
      if (c.verdict === "halt") {
        expect(realDataCheck(latest, FINANCE_PACK)).not.toBeNull();
        return;
      }
      expect(realDataCheck(latest, FINANCE_PACK)).toBeNull();
      const leakVerdict = verdictOf(ruleFindings(latest, FINANCE_PACK));
      if (c.verdict === "leak") {
        expect(leakVerdict).not.toBe("ok");
        return;
      }
      expect(leakVerdict).toBe("ok");
      const turnIndex = Math.min(c.turns.length - 1, loop.turns.length - 1);
      const g = rulesGrade({ turns: c.turns, rubric: loop.turns[turnIndex].rubric, followUp: true });
      if (c.verdict === "fluent") expect(g.verdict).toBe("fluent");
      if (c.verdict === "notyet") expect(g.verdict).not.toBe("fluent");
    });
  }
});
