import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { TRACKS, practisesOf, resolveTrack, type ScenePractise } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "./index";

/* Module 4's content has the shape the player expects and keeps the
 * house rules: the same block on every desk, a scene to look round where
 * some spots only look risky and every spot explains itself, markers that
 * sit on the drawing without crowding each other, no answer tell in
 * Prove, every real figure and case cited, every invented address on
 * .example, and no em-dash, emoji or backslash anywhere a learner reads,
 * the drawings included. */

const m4 = getAwarenessModule(4)!;
const strings = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const allText = strings(m4).join("\n");
const BACKSLASH = String.fromCharCode(92);
const scene = () => practisesOf(resolveTrack(m4, "general").block)[0] as ScenePractise;
const art = readFileSync(join(process.cwd(), "app", "cyber-awareness", "scenes", "SceneArt.tsx"), "utf8");

describe("Cyber Awareness module 4", () => {
  it("is listed as available after modules 1 to 3", () => {
    expect(m4).toBeTruthy();
    expect(m4.course).toBe("cyber-awareness");
    expect(AWARENESS_MODULE_LIST[3]).toMatchObject({ n: 4, title: m4.title, minutes: m4.minutes, available: true });
    expect(AWARENESS_MODULE_LIST.filter((m) => m.available).map((m) => m.n)).toEqual(expect.arrayContaining([1, 2, 3, 4]));
  });

  it("plays the same block on every desk", () => {
    const first = resolveTrack(m4, "general").block;
    for (const track of TRACKS) {
      const { track: used, block } = resolveTrack(m4, track);
      expect(used, `${track} resolves to itself`).toBe(track);
      expect(block, `${track} gets the same block`).toBe(first);
    }
  });

  it("has a scene where every spot explains itself and some only look risky", () => {
    const sp = scene();
    expect(sp.kind).toBe("scene");
    expect(sp.calls.risk.length).toBeGreaterThan(0);
    expect(sp.calls.fine.length).toBeGreaterThan(0);
    expect(sp.views.length).toBeGreaterThanOrEqual(2);
    expect(new Set(sp.views.map((v) => v.art)).size, "each view is its own drawing").toBe(sp.views.length);
    const spots = sp.views.flatMap((v) => v.spots);
    expect(spots.length).toBeGreaterThanOrEqual(8);
    expect(spots.length).toBeLessThanOrEqual(12);
    const fine = spots.filter((s) => !s.risk);
    expect(fine.length, "safe things that look risky").toBeGreaterThanOrEqual(3);
    expect(spots.length - fine.length, "real risks").toBeGreaterThanOrEqual(5);
    for (const v of sp.views) {
      expect(v.alt.length, `${v.label}: the drawing is described`).toBeGreaterThan(40);
      expect(v.spots.length, `${v.label}: something to look at`).toBeGreaterThanOrEqual(3);
      expect(v.spots.length, `${v.label}: not crowded`).toBeLessThanOrEqual(6);
      for (const s of v.spots) {
        expect(s.label.length, `${s.label}: labelled`).toBeGreaterThan(8);
        expect(s.seen.length, `${s.label}: says what is there`).toBeGreaterThan(40);
        expect(s.why.length, `${s.label}: explains itself`).toBeGreaterThan(80);
        expect(s.x, `${s.label}: on the drawing`).toBeGreaterThanOrEqual(5);
        expect(s.x).toBeLessThanOrEqual(95);
        expect(s.y, `${s.label}: on the drawing`).toBeGreaterThanOrEqual(5);
        expect(s.y).toBeLessThanOrEqual(95);
      }
      /* Markers far enough apart to tap on a phone. */
      for (let i = 0; i < v.spots.length; i++) {
        for (let j = i + 1; j < v.spots.length; j++) {
          const a = v.spots[i];
          const b = v.spots[j];
          expect(Math.hypot(a.x - b.x, (a.y - b.y) * 0.625), `${a.label} and ${b.label} are apart`).toBeGreaterThan(9);
        }
      }
    }
    /* A label never gives the answer away: no "risky", "safe" or "fine" in it. */
    for (const s of spots) expect(s.label).not.toMatch(/\b(risk|risky|safe|fine|danger|suspicious)\b/i);
    /* The doors the module teaches all turn up in the scene. */
    const seen = spots.map((s) => `${s.label} ${s.seen}`).join("\n");
    for (const thing of [/USB/, /update/i, /restart/i, /download/i, /call/i, /laptop on the train/i, /hotspot/i, /VPN/]) expect(seen, String(thing)).toMatch(thing);
  });

  it("proves with five choose items, explained, with no answer tell", () => {
    const { prove } = resolveTrack(m4, "general").block;
    expect(prove.length).toBe(5);
    expect(m4.passMark).toBe(4);
    expect(m4.shuffleOptions, "options shuffle per attempt").toBe(true);
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

  it("cites every real figure and case, and keeps everything invented clearly fictional", () => {
    const cards = m4.learn.flatMap((l) => (l.kind === "cards" ? l.cards ?? [] : []));
    const cited = cards.filter((c) => c.sources);
    expect(cited.length).toBeGreaterThanOrEqual(12);
    for (const c of cited) for (const s of c.sources!) expect(s.href).toMatch(/^https:\/\//);
    expect(cited.map((c) => c.title)).toEqual(expect.arrayContaining(["The British Library, 2023", "Synnovis, 2024", "UK businesses, 2025"]));
    /* A card that quotes a figure or a named source carries one. */
    for (const c of cards) {
      if (/\d+(\.\d+)?%|\d+GB|\bmillion\b|NCSC|Microsoft|Cyber Essentials|Survey|British Library|Synnovis|NHS|Center for Internet Security/.test(`${c.body} ${c.detail ?? ""}`)) expect(c.sources?.length, `${c.title}: cited`).toBeGreaterThan(0);
    }
    /* Outside the source links, every domain a learner reads is invented. */
    const readable = strings(JSON.parse(JSON.stringify(m4, (k, v) => (k === "sources" ? undefined : v)))).join("\n");
    const domains = readable.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:example|com|net|org|io|uk|co|info|biz|app|xyz)\b/gi) ?? [];
    for (const d of domains) expect(d.toLowerCase(), `${d} is an .example domain`).toMatch(/\.example$/);
    /* Any UK mobile number is from Ofcom's drama range. */
    for (const n of readable.match(/\b07\d{3}\s?\d{6}\b/g) ?? []) expect(n, `${n} is a drama number`).toMatch(/^07700 ?900\d{3}$/);
  });

  it("stays in its lane: reporting, payments, deepfakes and data handling get a pointer at most", () => {
    expect(allText).toMatch(/Module 8/);
    expect(allText).not.toMatch(/deepfake/i);
    expect(allText).not.toMatch(/bank details|invoice fraud/i);
  });

  it("keeps the house rules, in the drawings too", () => {
    for (const [what, text] of [["module", allText], ["drawings", art]] as const) {
      expect(text.includes(String.fromCharCode(0x2014)), `${what}: no em-dash`).toBe(false);
      expect(text, `${what}: no emoji`).not.toMatch(/\p{Extended_Pictographic}/u);
      expect(text.includes(BACKSLASH), `${what}: no backslash`).toBe(false);
    }
    for (const word of ["organization", "recognize", "realize", "behavior", "color", "authorize"]) expect(allText.toLowerCase(), `British spelling: ${word}`).not.toContain(word);
    /* The drawings are pictures only: no photo, no file or link from outside. */
    expect(art).not.toMatch(/<image|href=|https?:/);
  });
});
