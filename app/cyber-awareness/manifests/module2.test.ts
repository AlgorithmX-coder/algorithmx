import { describe, expect, it } from "vitest";
import { TRACKS, practisesOf, resolveTrack, type InboxPractise } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "./index";

/* Module 2's content has the shape the player expects and keeps the
 * house rules: the same block on every desk, an inbox across email, text
 * and Teams with phishes and genuine messages that no surface feature
 * gives away, a valid tell on every phish, an explanation on every
 * reveal, no answer tell in Prove, every invented address on .example,
 * and no em-dash, emoji or backslash anywhere a learner reads. */

const m2 = getAwarenessModule(2)!;
const strings = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const allText = strings(m2).join("\n");
const BACKSLASH = String.fromCharCode(92);
const inbox = () => practisesOf(resolveTrack(m2, "general").block)[0] as InboxPractise;

describe("Cyber Awareness module 2", () => {
  it("is listed as available after module 1", () => {
    expect(m2).toBeTruthy();
    expect(m2.course).toBe("cyber-awareness");
    expect(AWARENESS_MODULE_LIST[1]).toMatchObject({ n: 2, title: m2.title, minutes: m2.minutes, available: true });
    expect(AWARENESS_MODULE_LIST.filter((m) => m.available).map((m) => m.n)).toEqual(expect.arrayContaining([1, 2]));
  });

  it("plays the same block on every desk", () => {
    const first = resolveTrack(m2, "general").block;
    for (const track of TRACKS) {
      const { track: used, block } = resolveTrack(m2, track);
      expect(used, `${track} resolves to itself`).toBe(track);
      expect(block, `${track} gets the same block`).toBe(first);
    }
  });

  it("triages an inbox across email, text and Teams, with a valid tell on every phish", () => {
    const ip = inbox();
    expect(ip.kind).toBe("inbox");
    const ids = new Set(ip.tells.map((x) => x.id));
    expect(ids.size).toBe(5);
    expect(ip.messages.length).toBeGreaterThanOrEqual(7);
    expect(ip.messages.length).toBeLessThanOrEqual(9);
    expect(new Set(ip.messages.map((m) => m.channel))).toEqual(new Set(["email", "sms", "teams"]));
    const phishes = ip.messages.filter((m) => m.tells?.length);
    const genuine = ip.messages.filter((m) => !m.tells?.length);
    expect(phishes.length).toBeGreaterThanOrEqual(4);
    expect(genuine.length).toBeGreaterThanOrEqual(3);
    for (const m of ip.messages) {
      expect(m.why.length, `${m.time}: explains itself`).toBeGreaterThan(60);
      expect(m.realFrom.length, `${m.time}: has something behind the sender`).toBeGreaterThan(5);
      for (const x of m.tells ?? []) expect(ids.has(x), `${m.time}: ${x} is a tell`).toBe(true);
    }
    /* Every tell is accepted somewhere, so the list is not padding, and
     * the main tells vary, so one answer does not fit every phish. */
    for (const x of ids) expect(phishes.flatMap((m) => m.tells!), `${x} is used`).toContain(x);
    expect(new Set(phishes.map((m) => m.tells![0])).size).toBeGreaterThanOrEqual(3);
    /* No surface tell: a link, a file, a subject line or a known name turns up on a genuine message too. */
    expect(genuine.some((m) => m.link), "a genuine message has a link").toBe(true);
    expect(genuine.some((m) => m.file), "a genuine message has a file").toBe(true);
    expect(genuine.some((m) => m.subject), "a genuine message is an email").toBe(true);
    /* Phishes are spread across the channels. */
    expect(new Set(phishes.map((m) => m.channel)).size).toBe(3);
  });

  it("proves with five choose items, explained, with no answer tell", () => {
    const { prove } = resolveTrack(m2, "general").block;
    expect(prove.length).toBe(5);
    expect(m2.passMark).toBe(4);
    expect(m2.shuffleOptions, "options shuffle per attempt").toBe(true);
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

  it("cites every real figure, and keeps every invented address fictional", () => {
    const cited = m2.learn.flatMap((l) => (l.kind === "cards" ? l.cards ?? [] : [])).filter((c) => c.sources);
    expect(cited.map((c) => c.title)).toEqual(["Email", "QR codes", "Chat apps, and Teams from outside", "Put together"]);
    for (const c of cited) for (const s of c.sources!) expect(s.href).toMatch(/^https:\/\//);
    /* Outside the source links, every domain a learner reads is invented. */
    const readable = strings(JSON.parse(JSON.stringify(m2, (k, v) => (k === "sources" ? undefined : v)))).join("\n");
    const domains = readable.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:example|com|net|org|io|uk|co|info|biz|app|xyz)\b/gi) ?? [];
    expect(domains.length).toBeGreaterThan(10);
    for (const d of domains) expect(d.toLowerCase(), `${d} is an .example domain`).toMatch(/\.example$/);
  });

  it("keeps the house rules", () => {
    expect(allText.includes(String.fromCharCode(0x2014)), "no em-dash").toBe(false);
    expect(allText, "no emoji").not.toMatch(/\p{Extended_Pictographic}/u);
    expect(allText.includes(BACKSLASH), "no backslash anywhere").toBe(false);
    for (const word of ["organization", "recognize", "realize", "behavior", "color"]) expect(allText.toLowerCase(), `British spelling: ${word}`).not.toContain(word);
  });
});
