import { describe, expect, it } from "vitest";
import { TRACKS, practisesOf, resolveTrack, type PaymentsPractise } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "./index";

/* Module 6's content has the shape the player expects and keeps the house
 * rules: the same block on every desk; a payment queue with genuine
 * requests as well as frauds, where every request has checks that find
 * something and every decision explains itself; one fraud from a real
 * mailbox, where the address check matches and only the call-back does
 * not; no answer tell in Prove; every real figure and case cited; every
 * invented address on .example, every phone number in Ofcom's drama
 * ranges, every sort code 00-00-00 and marked as an example; and no
 * em-dash, emoji or backslash anywhere a learner reads. */

const m6 = getAwarenessModule(6)!;
const strings = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const allText = strings(m6).join("\n");
const BACKSLASH = String.fromCharCode(92);
const queue = () => practisesOf(resolveTrack(m6, "general").block)[0] as PaymentsPractise;

describe("Cyber Awareness module 6", () => {
  it("is listed as available after modules 1 to 5", () => {
    expect(m6).toBeTruthy();
    expect(m6.course).toBe("cyber-awareness");
    expect(m6.title).toBe("Invoice Fraud & BEC");
    expect(AWARENESS_MODULE_LIST[5]).toMatchObject({ n: 6, title: m6.title, minutes: m6.minutes, available: true });
    expect(AWARENESS_MODULE_LIST.filter((m) => m.available).map((m) => m.n)).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6]));
  });

  it("plays the same block on every desk", () => {
    const first = resolveTrack(m6, "general").block;
    for (const track of TRACKS) {
      const { track: used, block } = resolveTrack(m6, track);
      expect(used, `${track} resolves to itself`).toBe(track);
      expect(block, `${track} gets the same block`).toBe(first);
    }
  });

  it("has a payment queue where every request can be checked and every decision explains itself", () => {
    const q = queue();
    expect(q.kind).toBe("payments");
    expect(q.decisions.map((d) => d.id)).toEqual(["pay", "hold", "report"]);
    expect(q.requests.length).toBeGreaterThanOrEqual(5);
    expect(q.requests.length).toBeLessThanOrEqual(8);
    const genuine = q.requests.filter((r) => r.accept.includes("pay"));
    expect(genuine.length, "some requests are genuine").toBeGreaterThanOrEqual(2);
    expect(genuine.length, "most are not").toBeLessThan(q.requests.length / 2 + 1);
    for (const r of q.requests) {
      const name = r.subject;
      expect(r.accept.length, `${name}: accepts a decision`).toBeGreaterThan(0);
      expect(new Set(r.accept).size).toBe(r.accept.length);
      /* A genuine request is paid; a fraud is never paid. */
      if (r.accept.includes("pay")) expect(r.accept, `${name}: genuine means pay`).toEqual(["pay"]);
      for (const d of ["pay", "hold", "report"] as const) expect(r.outcomes[d].length, `${name}: ${d} explains itself`).toBeGreaterThan(50);
      expect(r.why.length, `${name}: the lesson`).toBeGreaterThan(80);
      expect(r.checks.length, `${name}: checks to take`).toBeGreaterThanOrEqual(3);
      for (const c of r.checks) {
        expect(c.found.length, `${name} · ${c.action}: a check finds something`).toBeGreaterThan(40);
        /* A check's label never gives the answer away. */
        expect(c.action).not.toMatch(/\b(fake|fraud|scam|wrong|risk|safe|genuine|real)\b/i);
      }
      /* A genuine request's checks all come back clean; a fraud has at least one that does not. */
      if (r.accept.includes("pay")) expect(r.checks.every((c) => c.result !== "mismatch"), `${name}: clean checks`).toBe(true);
      else expect(r.checks.some((c) => c.result === "mismatch"), `${name}: a check catches it`).toBe(true);
    }
    /* The twist: one fraud comes from the supplier's real address, so the
     * address check matches and only the call to the number on file does not. */
    const twist = q.requests.filter((r) => !r.accept.includes("pay") && r.checks.some((c) => /address/i.test(c.action) && c.result === "match"));
    expect(twist.length, "a fraud from a real mailbox").toBe(1);
    expect(twist[0].checks.find((c) => /^Call the number on file$/.test(c.action))?.result).toBe("mismatch");
    /* A genuine change of bank details, confirmed the right way, is in the queue too. */
    expect(genuine.some((r) => r.bank && /changed|new account|moved banks/i.test(`${r.subject} ${r.text}`)), "a genuine, confirmed change").toBe(true);
    /* The shapes the module teaches all turn up. */
    const seen = strings(q).join("\n");
    for (const thing of [/gift card/i, /keep this between us/i, /Re: /, /purchase order/i, /Call the number on file/]) expect(seen, String(thing)).toMatch(thing);
  });

  it("proves with five choose items, explained, with no answer tell", () => {
    const { prove } = resolveTrack(m6, "general").block;
    expect(prove.length).toBe(5);
    expect(m6.passMark).toBe(4);
    expect(m6.shuffleOptions, "options shuffle per attempt").toBe(true);
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

  it("cites every real figure and case", () => {
    const cards = m6.learn.flatMap((l) => (l.kind === "cards" ? l.cards ?? [] : []));
    const cited = cards.filter((c) => c.sources);
    expect(cited.length).toBeGreaterThanOrEqual(8);
    for (const c of cited) for (const s of c.sources!) expect(s.href).toMatch(/^https:\/\//);
    /* A card that quotes a figure or a named source carries one. */
    for (const c of cards) {
      if (/\d+(\.\d+)?%|£\d|\b\d{2,}\b|\bmillion\b|NCSC|UK Finance|Take Five|SRA|Solicitors Regulation|National Crime Agency|Report Fraud|Crown Court/.test(`${c.body} ${c.detail ?? ""}`)) expect(c.sources?.length, `${c.title}: cited`).toBeGreaterThan(0);
    }
    /* Figures used in earlier modules are not reused: this module's are its own. */
    expect(allText).not.toMatch(/Cyber Security Breaches Survey|Arup|25m/);
  });

  it("keeps everything invented clearly fictional", () => {
    /* Outside the source links, every domain a learner reads is invented. */
    const readable = strings(JSON.parse(JSON.stringify(m6, (k, v) => (k === "sources" ? undefined : v)))).join("\n");
    const domains = readable.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:example|com|net|org|io|uk|co|info|biz|app|xyz)\b/gi) ?? [];
    expect(domains.length, "the queue has addresses to read").toBeGreaterThan(4);
    for (const d of domains) expect(d.toLowerCase(), `${d} is an .example domain`).toMatch(/\.example$/);
    /* Phone numbers sit in Ofcom's drama ranges. */
    for (const n of readable.match(/\b07\d{3}\s?\d{6}\b/g) ?? []) expect(n, `${n} is a drama mobile`).toMatch(/^07700 ?900\d{3}$/);
    for (const n of readable.match(/\b01\d{3}\s?\d{6}\b/g) ?? []) expect(n, `${n} is a drama landline`).toMatch(/^01632 ?960\d{3}$/);
    /* Bank details are plainly made up: sort code 00-00-00, an account
     * starting 0000, and the words "example details" beside them. */
    const q = queue();
    for (const code of readable.match(/\b\d{2}-\d{2}-\d{2}\b/g) ?? []) expect(code, "sort code").toBe("00-00-00");
    for (const r of q.requests) {
      if (!r.bank) continue;
      expect(r.bank).toMatch(/^Sort code 00-00-00 · Account 0000 \d{4} \(example details\)$/);
    }
    expect(q.requests.filter((r) => r.bank).length).toBeGreaterThanOrEqual(4);
  });

  it("stays in its lane: deepfakes and reporting get a pointer at most", () => {
    expect(allText).toMatch(/Module 7/);
    expect(allText).toMatch(/Module 8/);
    expect(allText).not.toMatch(/deepfake/i);
    expect(allText.match(/\bvoices?\b/gi)?.length ?? 0, "voice cloning is Module 7's").toBeLessThanOrEqual(1);
  });

  it("keeps the house rules", () => {
    expect(allText.includes(String.fromCharCode(0x2014)), "no em-dash").toBe(false);
    expect(allText, "no emoji").not.toMatch(/\p{Extended_Pictographic}/u);
    expect(allText.includes(BACKSLASH), "no backslash").toBe(false);
    for (const word of ["organization", "recognize", "realize", "behavior", "color", "authorize", "favor", "center "]) expect(allText.toLowerCase(), `British spelling: ${word}`).not.toContain(word);
  });
});
