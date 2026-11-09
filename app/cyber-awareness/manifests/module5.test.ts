import { describe, expect, it } from "vitest";
import { DEFAULT_FIRM, TRACKS, fill, practisesOf, resolveTrack, type OutboxPractise } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "./index";

/* Module 5's content has the shape the player expects and keeps the
 * house rules: the same block on every desk, an outbox where some items
 * are fine to send, every faulty item names a real line and shows what it
 * becomes, every item explains itself, the firm's own class names come
 * through the placeholders, no answer tell in Prove, every real figure
 * and case cited, every invented address on .example and every invented
 * figure round, and no em-dash, emoji or backslash anywhere a learner
 * reads. */

const m5 = getAwarenessModule(5)!;
const strings = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const allText = strings(m5).join("\n");
const BACKSLASH = String.fromCharCode(92);
const outbox = () => practisesOf(resolveTrack(m5, "general").block)[0] as OutboxPractise;

describe("Cyber Awareness module 5", () => {
  it("is listed as available after modules 1 to 4", () => {
    expect(m5).toBeTruthy();
    expect(m5.course).toBe("cyber-awareness");
    expect(m5.title).toBe("Data Handling");
    expect(AWARENESS_MODULE_LIST[4]).toMatchObject({ n: 5, title: m5.title, minutes: m5.minutes, available: true });
    expect(AWARENESS_MODULE_LIST.filter((m) => m.available).map((m) => m.n)).toEqual(expect.arrayContaining([1, 2, 3, 4, 5]));
  });

  it("plays the same block on every desk", () => {
    const first = resolveTrack(m5, "general").block;
    for (const track of TRACKS) {
      const { track: used, block } = resolveTrack(m5, track);
      expect(used, `${track} resolves to itself`).toBe(track);
      expect(block, `${track} gets the same block`).toBe(first);
    }
  });

  it("has an outbox where every item explains itself and some are fine to send", () => {
    const ob = outbox();
    expect(ob.kind).toBe("outbox");
    expect(ob.items.length).toBeGreaterThanOrEqual(6);
    expect(ob.items.length).toBeLessThanOrEqual(9);
    const fine = ob.items.filter((i) => !i.fault?.length);
    expect(fine.length, "items that are fine to send").toBeGreaterThanOrEqual(1);
    expect(fine.length).toBeLessThanOrEqual(2);
    expect(ob.items.some((i) => i.kind === "share"), "a file share as well as emails").toBe(true);
    for (const item of ob.items) {
      expect(item.meant.length, `${item.title}: says what you meant to do`).toBeGreaterThan(40);
      expect(item.why.length, `${item.title}: explains itself`).toBeGreaterThan(80);
      expect(item.parts.length, `${item.title}: lines to check`).toBeGreaterThanOrEqual(2);
      const ids = item.parts.map((p) => p.id);
      expect(new Set(ids).size, `${item.title}: line ids are unique`).toBe(ids.length);
      for (const p of item.parts) {
        expect(p.label.length, `${item.title}: every line is labelled`).toBeGreaterThan(1);
        /* A line never gives the answer away. */
        expect(`${p.label} ${p.look?.action ?? ""}`).not.toMatch(/\b(wrong|risk|risky|safe|fine|mistake|problem)\b/i);
        if (p.look) expect(p.look.found.length, `${item.title} · ${p.label}: looking closer finds something`).toBeGreaterThan(30);
      }
      for (const id of item.fault ?? []) expect(ids, `${item.title}: the fault is a real line`).toContain(id);
      if (item.fault?.length) {
        /* The main fault shows what it becomes once fixed. */
        const main = item.parts.find((p) => p.id === item.fault![0])!;
        expect(main.fixed, `${item.title}: the fix is shown`).toBeTruthy();
      } else {
        expect(item.parts.every((p) => p.fixed === undefined), `${item.title}: a fine item has nothing to fix`).toBe(true);
      }
    }
    /* Faults on more than one kind of line, so the answer is never "always the attachment". */
    expect(new Set(ob.items.flatMap((i) => (i.fault?.length ? [i.fault[0]] : []))).size).toBeGreaterThanOrEqual(3);
    /* The checks the module teaches all turn up in the outbox. */
    const seen = strings(ob).join("\n");
    for (const thing of [/External|external: true/, /Bcc/, /hidden/i, /Anyone with the link/, /\[\[/, /Access ends/]) expect(seen, String(thing)).toMatch(thing);
    /* The fake spreadsheet uses obviously invented names and round figures. */
    for (const item of ob.items) for (const p of item.parts) for (const row of p.look?.table?.rows ?? []) {
      for (const cell of row) if (/£/.test(cell)) expect(cell, "round figures only").toMatch(/^£\d{1,3},000$/);
      expect(row[0]).toMatch(/Example|Sample|Specimen|Placeholder|Test/);
    }
  });

  it("uses the firm's own names for its data classes", () => {
    const firm = { ...DEFAULT_FIRM, classNames: { P: "OPEN", I: "STAFF ONLY", C: "CLIENT", R: "SECRET" } };
    expect(allText).toMatch(/\{\{class\.R\}\}/);
    expect(fill("{{class.P}} {{class.I}} {{class.C}} {{class.R}}", { firm, tool: "copilot" })).toBe("OPEN STAFF ONLY CLIENT SECRET");
    expect(fill("{{class.R}}", { firm: DEFAULT_FIRM, tool: "copilot" })).toBe("RESTRICTED");
    const tiles = m5.learn.find((l) => l.kind === "tiles");
    expect(tiles && tiles.kind === "tiles" ? tiles.tiles.map((x) => x.cls) : []).toEqual(["P", "I", "C", "R"]);
    expect(outbox().items.every((i) => i.cls), "every draft carries the firm's label").toBe(true);
    /* AI Cleared's paste test gets a pointer, not a lesson. */
    expect(allText.match(/paste test/gi)?.length ?? 0).toBe(1);
  });

  it("proves with five choose items, explained, with no answer tell", () => {
    const { prove } = resolveTrack(m5, "general").block;
    expect(prove.length).toBe(5);
    expect(m5.passMark).toBe(4);
    expect(m5.shuffleOptions, "options shuffle per attempt").toBe(true);
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
      /* The e2e finds the right option by the words before any placeholder:
       * those words must be in no other option. */
      const key = q.options[q.answer].split("{{")[0].slice(0, 30).toLowerCase();
      for (const [i, o] of q.options.entries()) if (i !== q.answer) expect(o.toLowerCase(), `"${key}" names one option only`).not.toContain(key);
    }
    expect(positions.size, "authored answers sit in more than one place").toBeGreaterThan(1);
  });

  it("cites every real figure and case, and keeps everything invented clearly fictional", () => {
    const cards = m5.learn.flatMap((l) => (l.kind === "cards" ? l.cards ?? [] : []));
    const cited = cards.filter((c) => c.sources);
    expect(cited.length).toBeGreaterThanOrEqual(12);
    for (const c of cited) for (const s of c.sources!) expect(s.href).toMatch(/^https:\/\//);
    expect(cited.map((c) => c.title)).toEqual(expect.arrayContaining(["Police Service of Northern Ireland, 2023", "Central YMCA, 2024"]));
    /* A card that quotes a figure or a named source carries one. */
    for (const c of cards) {
      if (/\d+(\.\d+)?%|£\d|\b\d{2,}\b|\bmillion\b|ICO|NCSC|Microsoft|PSNI|YMCA|NHS|GDPR|72 hours/.test(`${c.body} ${c.detail ?? ""}`)) expect(c.sources?.length, `${c.title}: cited`).toBeGreaterThan(0);
    }
    /* Outside the source links, every domain a learner reads is invented. */
    const readable = strings(JSON.parse(JSON.stringify(m5, (k, v) => (k === "sources" ? undefined : v)))).join("\n");
    const domains = readable.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:example|com|net|org|io|uk|co|info|biz|app|xyz)\b/gi) ?? [];
    expect(domains.length, "the outbox has addresses to read").toBeGreaterThan(5);
    for (const d of domains) expect(d.toLowerCase(), `${d} is an .example domain`).toMatch(/\.example$/);
    /* Any UK mobile number is from Ofcom's drama range. */
    for (const n of readable.match(/\b07\d{3}\s?\d{6}\b/g) ?? []) expect(n, `${n} is a drama number`).toMatch(/^07700 ?900\d{3}$/);
  });

  it("stays in its lane: reporting, payments and deepfakes get a pointer at most", () => {
    expect(allText).toMatch(/Module 8/);
    expect(allText).not.toMatch(/deepfake/i);
    expect(allText).not.toMatch(/bank details|invoice fraud|payment fraud/i);
    /* The data protection contact decides: no legal advice. */
    expect(allText).toMatch(/data protection contact decides/);
  });

  it("keeps the house rules", () => {
    expect(allText.includes(String.fromCharCode(0x2014)), "no em-dash").toBe(false);
    expect(allText, "no emoji").not.toMatch(/\p{Extended_Pictographic}/u);
    expect(allText.includes(BACKSLASH), "no backslash").toBe(false);
    for (const word of ["organization", "recognize", "realize", "behavior", "color", "authorize", "favor", "center "]) expect(allText.toLowerCase(), `British spelling: ${word}`).not.toContain(word);
  });
});
