import { describe, expect, it } from "vitest";
import { TRACKS, practisesOf, resolveTrack, type MomentsPractise } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "./index";

/* Module 1's content has the shape the player expects and keeps the
 * house rules: the same block on every desk, three moments to find with
 * a valid pressure button each, an explanation on every reveal, no
 * answer tell, and no em-dash, emoji or backslash anywhere a learner
 * reads. Content mistakes fail here, not in front of a learner. */

const m1 = getAwarenessModule(1)!;
const strings = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const allText = strings(m1).join("\n");
const BACKSLASH = String.fromCharCode(92);

describe("Cyber Awareness module 1", () => {
  it("is listed as available, with the renamed modules", () => {
    expect(m1).toBeTruthy();
    expect(m1.course).toBe("cyber-awareness");
    expect(AWARENESS_MODULE_LIST[0]).toMatchObject({ n: 1, title: m1.title, minutes: m1.minutes, available: true });
    expect(AWARENESS_MODULE_LIST[3].title).toBe("Malware, Devices & Working Remotely");
    expect(AWARENESS_MODULE_LIST[6].title).toBe("AI-Powered Scams & Deepfakes");
    expect(AWARENESS_MODULE_LIST.filter((m) => m.available).map((m) => m.n)).toEqual([1]);
  });

  it("plays the same block on every desk", () => {
    const first = resolveTrack(m1, "general").block;
    for (const track of TRACKS) {
      const { track: used, block } = resolveTrack(m1, track);
      expect(used, `${track} resolves to itself`).toBe(track);
      expect(block, `${track} gets the same block`).toBe(first);
    }
  });

  it("has three moments to find, each with a valid pressure button and a reason", () => {
    const [pr] = practisesOf(resolveTrack(m1, "general").block);
    expect(pr.kind).toBe("moments");
    const mp = pr as MomentsPractise;
    const ids = new Set(mp.levers.map((l) => l.id));
    expect(ids.size).toBe(5);
    const targets = mp.moments.filter((m) => m.levers?.length);
    expect(targets.length).toBe(3);
    expect(mp.moments.length).toBeGreaterThan(targets.length);
    for (const m of mp.moments) {
      expect(m.why.length, `${m.time}: explains itself`).toBeGreaterThan(30);
      for (const l of m.levers ?? []) expect(ids.has(l), `${m.time}: ${l} is a lever`).toBe(true);
    }
    expect(new Set(targets.map((m) => m.where)).size, "the three come in different ways").toBe(3);
  });

  it("proves with five choose items, explained, with no answer tell", () => {
    const { prove } = resolveTrack(m1, "general").block;
    expect(prove.length).toBe(5);
    expect(m1.passMark).toBe(4);
    expect(m1.shuffleOptions, "options shuffle per attempt").toBe(true);
    const positions = new Set<number>();
    for (const q of prove) {
      expect(q.kind).toBe("choose");
      if (q.kind !== "choose") continue;
      expect(q.options.length).toBe(3);
      expect(q.answer).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.why.length, "every reveal explains").toBeGreaterThan(60);
      positions.add(q.answer);
      /* No length tell: the right option is never the longest by a clear
       * margin, nor the only short one. */
      const lens = q.options.map((o) => o.length);
      const right = lens[q.answer];
      const others = lens.filter((_, i) => i !== q.answer);
      expect(right, `"${q.stem.slice(0, 40)}": right answer not the longest by far`).toBeLessThanOrEqual(Math.max(...others) * 1.15);
      expect(right, `"${q.stem.slice(0, 40)}": right answer not the shortest by far`).toBeGreaterThanOrEqual(Math.min(...others) * 0.85);
    }
    expect(positions.size, "authored answers sit in more than one place").toBeGreaterThan(1);
  });

  it("cites every real case and keeps the house rules", () => {
    const cases = m1.learn.flatMap((l) => (l.kind === "cards" ? l.cards ?? [] : [])).filter((c) => c.sources);
    expect(cases.map((c) => c.title)).toEqual(["UK businesses, 2025", "Marks & Spencer, 2025", "Arup, 2024"]);
    for (const c of cases) for (const s of c.sources!) expect(s.href).toMatch(/^https:\/\//);
    expect(allText.includes(String.fromCharCode(0x2014)), "no em-dash").toBe(false);
    expect(allText, "no emoji").not.toMatch(/\p{Extended_Pictographic}/u);
    expect(allText.includes(BACKSLASH), "no backslash anywhere").toBe(false);
    for (const word of ["organization", "recognize", "realize", "behavior", "color"]) expect(allText.toLowerCase(), `British spelling: ${word}`).not.toContain(word);
  });
});
