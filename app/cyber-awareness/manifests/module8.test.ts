import { describe, expect, it } from "vitest";
import { TRACKS, practisesOf, resolveTrack, type ReportChoice, type ReportsPractise } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "./index";

/* Module 8's content has the shape the player expects and keeps the house
 * rules: the same block on every desk; a day of incidents where the
 * learner builds each report (who and how, which details, what meanwhile),
 * every choice explains itself, every step has a best move and a wrong
 * one, and the useful details are mixed in with the noise; the pull to
 * keep quiet is shown and answered; no answer tell in the practice or in
 * Prove; every real figure and service cited, none reused from earlier
 * modules; every invented address on .example and every invented number in
 * Ofcom's drama ranges, with the real reporting services (and only those)
 * given exactly; the course's closing names one habit per module; and no
 * em-dash, emoji or backslash anywhere a learner reads. */

const m8 = getAwarenessModule(8)!;
const strings = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const allText = strings(m8).join("\n");
const BACKSLASH = String.fromCharCode(92);
const day = () => practisesOf(resolveTrack(m8, "general").block)[0] as ReportsPractise;

describe("Cyber Awareness module 8", () => {
  it("is listed as available, and with it every module of the course", () => {
    expect(m8).toBeTruthy();
    expect(m8.course).toBe("cyber-awareness");
    expect(m8.title).toBe("Report It");
    expect(AWARENESS_MODULE_LIST[7]).toMatchObject({ n: 8, title: m8.title, minutes: m8.minutes, available: true });
    expect(AWARENESS_MODULE_LIST.length).toBe(8);
    expect(AWARENESS_MODULE_LIST.every((m) => m.available), "all eight are out").toBe(true);
    for (const m of AWARENESS_MODULE_LIST) expect(getAwarenessModule(m.n), `module ${m.n} has a manifest`).toBeTruthy();
  });

  it("plays the same block on every desk", () => {
    const first = resolveTrack(m8, "general").block;
    for (const track of TRACKS) {
      const { track: used, block } = resolveTrack(m8, track);
      expect(used, `${track} resolves to itself`).toBe(track);
      expect(block, `${track} gets the same block`).toBe(first);
    }
  });

  it("has a day of reports where every choice explains itself", () => {
    const d = day();
    expect(d.kind).toBe("reports");
    expect(d.incidents.length).toBeGreaterThanOrEqual(3);
    expect(d.incidents.length).toBeLessThanOrEqual(5);
    expect(new Set(d.incidents.map((i) => i.time)).size, "the e2e tells the incidents apart by time").toBe(d.incidents.length);
    expect(new Set(d.incidents.map((i) => i.art)).size, "each incident is drawn differently").toBe(d.incidents.length);
    const routeBest = new Set<number>();
    const meanBest = new Set<number>();
    const steps = (list: ReportChoice[], name: string, where: Set<number>) => {
      expect(list.length, `${name}: three or four choices`).toBeGreaterThanOrEqual(3);
      expect(list.length).toBeLessThanOrEqual(4);
      expect(new Set(list.map((o) => o.label)).size, `${name}: choices named apart`).toBe(list.length);
      expect(list.filter((o) => o.grade === "best").length, `${name}: exactly one best`).toBe(1);
      expect(list.some((o) => o.grade === "wrong"), `${name}: a wrong choice`).toBe(true);
      where.add(list.findIndex((o) => o.grade === "best"));
      for (const o of list) {
        expect(o.why.length, `${name} · ${o.label}: explains itself`).toBeGreaterThan(50);
        /* A choice's words never give the answer away. */
        expect(`${o.label} ${o.desc ?? ""}`).not.toMatch(/\b(safe|safely|right|correct|best|wise|smart|properly)\b/i);
      }
    };
    for (const inc of d.incidents) {
      const name = `${inc.time} ${inc.title}`;
      expect(inc.happened.length, `${name}: what happened`).toBeGreaterThan(80);
      steps(inc.route, `${name} route`, routeBest);
      steps(inc.meanwhile, `${name} meanwhile`, meanBest);
      /* The details: useful ones and noise, mixed, each explained. */
      const useful = inc.details.filter((x) => x.useful).length;
      expect(inc.details.length, `${name}: four to seven details`).toBeGreaterThanOrEqual(4);
      expect(inc.details.length).toBeLessThanOrEqual(7);
      expect(useful, `${name}: at least three useful details`).toBeGreaterThanOrEqual(3);
      expect(inc.details.length - useful, `${name}: at least two that do not belong`).toBeGreaterThanOrEqual(2);
      const lastUseful = inc.details.map((x) => x.useful).lastIndexOf(true);
      expect(inc.details.slice(0, lastUseful).some((x) => !x.useful), `${name}: the useful details are not simply listed first`).toBe(true);
      for (const x of inc.details) expect(x.why.length, `${name} · ${x.text}: explains itself`).toBeGreaterThan(30);
      expect(new Set(inc.details.map((x) => x.text)).size, `${name}: details named apart`).toBe(inc.details.length);
      /* A password never belongs in a report. */
      for (const x of inc.details.filter((y) => /password/i.test(y.text) && /so IT can|send/i.test(y.text))) expect(x.useful, `${name}: never send a password`).toBe(false);
      /* The pay-off: a model report to the firm's contact, what happens next by the clock, and the cost of silence. */
      expect(inc.model.to).toBe("{{firm.contact}}");
      expect(inc.model.lines.length).toBeGreaterThan(0);
      expect(inc.after.length, `${name}: what happens next`).toBeGreaterThanOrEqual(3);
      for (const a of inc.after) expect(a.time, `${name}: a clock time`).toMatch(/^\d{2}:\d{2}$/);
      expect(inc.after[0].text, `${name}: it starts with your report`).toMatch(/\{\{firm\.contact\}\}/);
      expect(inc.ifQuiet.length, `${name}: what silence would cost`).toBeGreaterThan(80);
    }
    expect(routeBest.size, "the best route sits in more than one place").toBeGreaterThan(2);
    expect(meanBest.size, "the best move meanwhile sits in more than one place").toBeGreaterThan(2);
  });

  it("shows the pull to keep quiet or sort it yourself, and answers it", () => {
    const tempted = day().incidents.filter((i) => i.tempt);
    expect(tempted.length, "more than one incident tempts silence").toBeGreaterThanOrEqual(2);
    for (const inc of tempted) {
      /* Keeping quiet, waiting or fixing it yourself is offered, and graded wrong. */
      const quiet = inc.route.filter((o) => /say nothing|nothing happened|in the morning|yourself/i.test(`${o.label} ${o.desc ?? ""}`));
      expect(quiet.length, `${inc.title}: the quiet route is on offer`).toBeGreaterThan(0);
      for (const o of quiet) expect(o.grade, `${inc.title} · ${o.label}`).toBe("wrong");
      /* The best route reports it to the firm's contact. */
      expect(inc.route.find((o) => o.grade === "best")!.label).toMatch(/\{\{firm\.contact\}\}/);
    }
    /* A near miss is in the day, and reporting it is the best route. */
    expect(day().incidents.some((i) => /nothing happened/i.test(i.tempt ?? ""))).toBe(true);
  });

  it("proves with five choose items, explained, with no answer tell", () => {
    const { prove } = resolveTrack(m8, "general").block;
    expect(prove.length).toBe(5);
    expect(m8.passMark).toBe(4);
    expect(m8.shuffleOptions, "options shuffle per attempt").toBe(true);
    const positions = new Set<number>();
    const stems = new Set<string>();
    for (const q of prove) {
      expect(q.kind).toBe("choose");
      if (q.kind !== "choose") continue;
      expect(q.stem).toMatch(/What do you do next\?$/);
      stems.add(q.stem.slice(0, 40));
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
    expect(stems.size, "the e2e tells the stems apart").toBe(prove.length);
    expect(positions.size, "authored answers sit in more than one place").toBeGreaterThan(1);
  });

  it("cites every real figure, case and service", () => {
    const cards = m8.learn.flatMap((l) => (l.kind === "cards" ? l.cards ?? [] : []));
    const cited = cards.filter((c) => c.sources);
    expect(cited.length).toBeGreaterThanOrEqual(9);
    for (const c of cited) for (const s of c.sources!) expect(s.href).toMatch(/^https:\/\//);
    /* A card that quotes a figure, a named source or a national service carries one. */
    for (const c of cards) {
      if (/\d+(\.\d+)?%|£\d|\b\d{2,}\b|\bmillion\b|NCSC|ICO|Report Fraud|Action Fraud|Police Scotland|phishing\.gov\.uk|7726/.test(`${c.title} ${c.tag ?? ""} ${c.body} ${c.detail ?? ""}`)) expect(c.sources?.length, `${c.title}: cited`).toBeGreaterThan(0);
    }
    /* Earlier modules' figures are not reused. */
    expect(allText).not.toMatch(/Cyber Security Breaches Survey|59\.6 million|263,700|466,300|48%|£3\.9m|£750k|25m\b/);
    /* Module 5's 72 hours is referred back to, not taught again. */
    expect(allText).toMatch(/As Module 5 said/);
  });

  it("keeps everything invented clearly fictional, and the real services exact", () => {
    const readable = strings(JSON.parse(JSON.stringify(m8, (k, v) => (k === "sources" ? undefined : v)))).join("\n");
    /* The real reporting services, given exactly. */
    expect(readable).toContain("report@phishing.gov.uk");
    expect(readable).toContain("7726");
    expect(readable).toContain("reportfraud.police.uk");
    expect(readable).toContain("0300 123 2040");
    expect(readable).toMatch(/Police Scotland on 101/);
    expect(readable).toMatch(/Report Fraud took over from Action Fraud/);
    /* Outside those, every domain a learner reads is invented. */
    const REAL = new Set(["phishing.gov.uk", "reportfraud.police.uk"]);
    const domains = readable.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:example|com|net|org|io|uk|co|info|biz|app|xyz|gov)\b/gi) ?? [];
    expect(domains.filter((d) => d.endsWith(".example")).length, "the day has invented addresses").toBeGreaterThan(1);
    for (const d of domains) if (!REAL.has(d.toLowerCase())) expect(d.toLowerCase(), `${d} is an .example domain`).toMatch(/\.example$/);
    /* Phone numbers: the drama ranges, or the one real fraud line. */
    const mobiles = readable.match(/\b07\d{3}\s?\d{6}\b/g) ?? [];
    const landlines = readable.match(/\b01\d{3}\s?\d{6}\b/g) ?? [];
    const national = readable.match(/\b0[2389]\d{2}\s?\d{3}\s?\d{4}\b/g) ?? [];
    expect(landlines.length, "the call shows a number").toBeGreaterThan(0);
    for (const n of mobiles) expect(n, `${n} is a drama mobile`).toMatch(/^07700 ?900\d{3}$/);
    for (const n of landlines) expect(n, `${n} is a drama landline`).toMatch(/^01632 ?960\d{3}$/);
    for (const n of national) expect(n, `${n} is Report Fraud's line`).toBe("0300 123 2040");
    /* Short numbers: only 7726 and Police Scotland's 101. */
    const short = readable.match(/\b(?:on|to) (\d{3,4})\b(?! \d)/g) ?? [];
    for (const s of short) expect(s, `${s} is a real reporting number`).toMatch(/ (7726|101)$/);
  });

  it("closes the course: one habit per module, no certificate", () => {
    const o = m8.outro!;
    expect(o).toBeTruthy();
    expect(o.done).toMatch(/finished Cyber Awareness/);
    expect(o.habits.map((h) => h.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    for (const h of o.habits) {
      expect(h.title, `habit ${h.n} names its module`).toBe(AWARENESS_MODULE_LIST[h.n - 1].title);
      expect(h.habit.length).toBeGreaterThan(25);
    }
    expect(allText).not.toMatch(/certificate|certified/i);
    expect(o.lead).toMatch(/register/);
  });

  it("pays off the earlier modules' pointers", () => {
    for (const n of [4, 5, 6]) expect(allText).toMatch(new RegExp(`Module ${n}\\b`));
    expect(allText).toMatch(/Nobody is blamed/);
    expect(allText).toMatch(/near miss/i);
  });

  it("keeps the house rules", () => {
    expect(allText.includes(String.fromCharCode(0x2014)), "no em-dash").toBe(false);
    expect(allText, "no emoji").not.toMatch(/\p{Extended_Pictographic}/u);
    expect(allText.includes(BACKSLASH), "no backslash").toBe(false);
    for (const word of ["organization", "recognize", "realize", "behavior", "color", "authorize", "favor", "center ", "license ", "apologize"]) expect(allText.toLowerCase(), `British spelling: ${word}`).not.toContain(word);
  });
});
