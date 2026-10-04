import { describe, expect, it } from "vitest";
import { TRACKS, practisesOf, resolveTrack, type Practise, type Track } from "@/app/ai-cleared/engine/types";
import { getFluentModule as fluentManifest } from "../manifests";

/* Every desk's content has the shape the player and the grader expect:
 * a block for every track on every module, a rubric on every scored
 * turn, one wrong sentence per spot, one invented source per list, and
 * every prove answer inside its options. Content mistakes fail here, not
 * in front of a learner. */

const MODULES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

function checkPractise(where: string, p: Practise) {
  if (p.kind === "loop") {
    expect(p.turns.length, `${where}: a loop has turns`).toBeGreaterThan(0);
    expect(p.turns[0].rubric, `${where}: the first turn is scored`).toBeTruthy();
    for (const t of p.turns) if (t.rubric) expect(t.rubric.requires.length, `${where}: a rubric names elements`).toBeGreaterThan(0);
    if (p.office) expect(p.material, `${where}: an office view needs a document`).toBeTruthy();
  }
  if (p.kind === "spot") {
    expect(p.sentences.length, `${where}: a spot has sentences`).toBeGreaterThan(2);
    expect(p.errorIndex, `${where}: the wrong sentence is one of them`).toBeGreaterThanOrEqual(0);
    expect(p.errorIndex, `${where}: the wrong sentence is one of them`).toBeLessThan(p.sentences.length);
    expect(p.why.length, `${where}: a spot explains itself`).toBeGreaterThan(20);
  }
  if (p.kind === "sources") {
    expect(p.sources.filter((s) => !s.real).length, `${where}: exactly one invented source`).toBe(1);
    expect(p.sources.length, `${where}: a sources list has several entries`).toBeGreaterThan(2);
  }
}

describe("AI Fluent desks", () => {
  for (const n of MODULES) {
    const manifest = fluentManifest(n);
    it(`module ${n} has a block for every track`, () => {
      expect(manifest).toBeTruthy();
      for (const track of TRACKS) {
        const { block } = resolveTrack(manifest!, track);
        const where = `module ${n}, ${track}`;
        expect(practisesOf(block).length, `${where}: at least one practice`).toBeGreaterThan(0);
        for (const p of practisesOf(block)) checkPractise(where, p);
        expect(block.prove.length, `${where}: prove items`).toBeGreaterThanOrEqual(4);
        for (const item of block.prove) {
          if (item.kind === "choose") {
            expect(item.answer, `${where}: answer inside options`).toBeGreaterThanOrEqual(0);
            expect(item.answer, `${where}: answer inside options`).toBeLessThan(item.options.length);
          }
        }
      }
    });
  }

  it("modules 4 to 9 have their own block on every role desk", () => {
    const own: Track[] = ["finance", "legal", "hr", "sales", "support", "ops", "it", "leadership", "general"];
    for (const n of [4, 5, 6, 7, 8, 9]) {
      const manifest = fluentManifest(n)!;
      for (const track of own) expect(manifest.tracks[track], `module ${n} ${track}`).toBeTruthy();
    }
  });

  it("modules 1 to 3 fall back to the General desk for every role but Finance", () => {
    for (const n of [1, 2, 3]) {
      const manifest = fluentManifest(n)!;
      for (const track of TRACKS) {
        const r = resolveTrack(manifest, track);
        expect(r.track, `module ${n} ${track}`).toBe(track === "finance" ? "finance" : "general");
      }
    }
  });

  it("the final assessment draws from every module", () => {
    const m9 = fluentManifest(9)!;
    const from = new Set(m9.final!.bank.map((i) => i.from));
    for (const n of MODULES) expect(from.has(n), `module ${n} in the final bank`).toBe(true);
  });
});
