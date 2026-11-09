import { describe, expect, it } from "vitest";
import { TRACKS, practisesOf, resolveTrack, type PhonePractise } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "./index";

/* Module 3's content has the shape the player expects and keeps the
 * house rules: the same block on every desk, a day of sign-in prompts
 * where no surface feature gives the answer away, an explanation on every
 * reveal, no answer tell in Prove, no password anywhere, every invented
 * address on .example and every phone number in Ofcom's drama range, and
 * no em-dash, emoji or backslash anywhere a learner reads. */

const m3 = getAwarenessModule(3)!;
const strings = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const allText = strings(m3).join("\n");
const BACKSLASH = String.fromCharCode(92);
const phone = () => practisesOf(resolveTrack(m3, "general").block)[0] as PhonePractise;

describe("Cyber Awareness module 3", () => {
  it("is listed as available after modules 1 and 2", () => {
    expect(m3).toBeTruthy();
    expect(m3.course).toBe("cyber-awareness");
    expect(AWARENESS_MODULE_LIST[2]).toMatchObject({ n: 3, title: m3.title, minutes: m3.minutes, available: true });
    expect(AWARENESS_MODULE_LIST.filter((m) => m.available).map((m) => m.n)).toEqual(expect.arrayContaining([1, 2, 3]));
  });

  it("plays the same block on every desk", () => {
    const first = resolveTrack(m3, "general").block;
    for (const track of TRACKS) {
      const { track: used, block } = resolveTrack(m3, track);
      expect(used, `${track} resolves to itself`).toBe(track);
      expect(block, `${track} gets the same block`).toBe(first);
    }
  });

  it("runs a day of prompts where every action is right somewhere and nothing on the surface gives it away", () => {
    const pp = phone();
    expect(pp.kind).toBe("phone");
    const ids = pp.actions.map((a) => a.id);
    expect(ids).toEqual(["approve", "deny", "report"]);
    expect(pp.events.length).toBeGreaterThanOrEqual(6);
    expect(pp.events.length).toBeLessThanOrEqual(8);
    for (const e of pp.events) {
      expect(e.why.length, `${e.time}: explains itself`).toBeGreaterThan(60);
      expect(e.doing.length, `${e.time}: says what you were doing`).toBeGreaterThan(20);
      expect(e.accept.length, `${e.time}: has a right answer`).toBeGreaterThan(0);
      for (const a of e.accept) expect(ids, `${e.time}: ${a} is an action`).toContain(a);
      /* Approving is never one of several right answers: it is right
       * only when you started it, or wrong. */
      if (e.accept.includes("approve")) expect(e.accept).toEqual(["approve"]);
    }
    /* Times run through the day in order. */
    const times = pp.events.map((e) => e.time);
    expect([...times].sort()).toEqual(times);
    /* Each action is the best answer at least once, and the day is not all denials. */
    const best = pp.events.map((e) => e.accept[0]);
    for (const a of ids) expect(best, `${a} is the best answer somewhere`).toContain(a);
    expect(best.filter((a) => a === "approve").length).toBeGreaterThanOrEqual(2);
    /* No surface tell: the same title appears on prompts to approve and to
     * refuse, a message arrives with one to refuse that is from a genuine
     * colleague, and a known place turns up on one to refuse. */
    const promptTitle = (a: string) => pp.events.filter((e) => e.accept[0] === a).map((e) => e.title);
    expect(promptTitle("approve").some((tt) => promptTitle("report").includes(tt)), "same title, different answer").toBe(true);
    expect(pp.events.filter((e) => e.message).length).toBeGreaterThanOrEqual(2);
    const london = pp.events.filter((e) => e.lines.some((l) => /London/.test(l)));
    expect(new Set(london.map((e) => e.accept[0])).size, "a familiar place does not decide it").toBeGreaterThan(1);
    expect(pp.events.some((e) => (e.count ?? 1) > 1), "a burst of prompts").toBe(true);
  });

  it("proves with five choose items, explained, with no answer tell", () => {
    const { prove } = resolveTrack(m3, "general").block;
    expect(prove.length).toBe(5);
    expect(m3.passMark).toBe(4);
    expect(m3.shuffleOptions, "options shuffle per attempt").toBe(true);
    const positions = new Set<number>();
    for (const q of prove) {
      expect(q.kind).toBe("choose");
      if (q.kind !== "choose") continue;
      expect(q.stem).toMatch(/What do you do next\?$/);
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

  it("cites every real figure, and keeps everything invented clearly fictional", () => {
    const cited = m3.learn.flatMap((l) => (l.kind === "cards" ? l.cards ?? [] : [])).filter((c) => c.sources);
    expect(cited.length).toBeGreaterThanOrEqual(12);
    for (const c of cited) for (const s of c.sources!) expect(s.href).toMatch(/^https:\/\//);
    /* A card that quotes a figure or a named case carries a source. */
    for (const l of m3.learn) {
      if (l.kind !== "cards") continue;
      for (const c of l.cards ?? []) {
        if (/\d+(\.\d+)?%|\bmillion\b|Uber|NCSC|Microsoft|Cyber Essentials|Survey/.test(c.detail ?? "")) expect(c.sources?.length, `${c.title}: cited`).toBeGreaterThan(0);
      }
    }
    /* Outside the source links, every domain a learner reads is invented. */
    const readable = strings(JSON.parse(JSON.stringify(m3, (k, v) => (k === "sources" ? undefined : v)))).join("\n");
    const domains = readable.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:example|com|net|org|io|uk|co|info|biz|app|xyz)\b/gi) ?? [];
    for (const d of domains) expect(d.toLowerCase(), `${d} is an .example domain`).toMatch(/\.example$/);
    /* Every UK mobile number is from Ofcom's drama range. */
    const mobiles = readable.match(/\b07\d{3}\s?\d{6}\b/g) ?? [];
    expect(mobiles.length).toBeGreaterThan(0);
    for (const n of mobiles) expect(n, `${n} is a drama number`).toMatch(/^07700 ?900\d{3}$/);
  });

  it("never shows a password anyone could copy", () => {
    /* No quoted string that looks like a password: a run of letters and
     * digits or symbols with no spaces, in quotes. The one weak example
     * the NCSC published (123456) is shown only as a guessed password. */
    const quoted = allText.match(/"[^"\s]{6,}"/g) ?? [];
    expect(quoted).toEqual([]);
    expect(allText).not.toMatch(/password (is|was|could be|like) ["']/i);
    expect(allText).not.toMatch(/\b(?=[A-Za-z]*\d)(?=\d*[A-Za-z])[A-Za-z0-9!@#$%^&*]{8,}\b/);
  });

  it("keeps the house rules", () => {
    expect(allText.includes(String.fromCharCode(0x2014)), "no em-dash").toBe(false);
    expect(allText, "no emoji").not.toMatch(/\p{Extended_Pictographic}/u);
    expect(allText.includes(BACKSLASH), "no backslash anywhere").toBe(false);
    for (const word of ["organization", "recognize", "realize", "behavior", "color", "authorize"]) expect(allText.toLowerCase(), `British spelling: ${word}`).not.toContain(word);
  });
});
