import { describe, expect, it } from "vitest";
import { TRACKS, practisesOf, resolveTrack, type CallsPractise, type IncomingCall } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "./index";

/* Module 7's content has the shape the player expects and keeps the house
 * rules: the same block on every desk; a week of incoming calls, voice and
 * video, with genuine callers as well as impostors, where every response
 * explains itself, every turn has a best move and a wrong one, and every
 * path through a call ends; impostors dodge a check and a genuine caller
 * welcomes one; no answer tell in the practice or in Prove; every real
 * figure and case cited, none reused from earlier modules; every invented
 * address on .example and every number in Ofcom's drama ranges; and no
 * em-dash, emoji or backslash anywhere a learner reads. */

const m7 = getAwarenessModule(7)!;
const strings = (v: unknown): string[] => (typeof v === "string" ? [v] : v && typeof v === "object" ? Object.values(v).flatMap(strings) : []);
const allText = strings(m7).join("\n");
const BACKSLASH = String.fromCharCode(92);
const week = () => practisesOf(resolveTrack(m7, "general").block)[0] as CallsPractise;

/* Every path through a call, as the options picked at each turn. */
function paths(call: IncomingCall, turn = 0, depth = 0): { grade: string; label: string }[][] {
  expect(depth, "a call cannot loop").toBeLessThan(call.turns.length + 1);
  return call.turns[turn].options.flatMap((o) => (o.next === undefined ? [[o]] : paths(call, o.next, depth + 1).map((rest) => [o, ...rest])));
}

describe("Cyber Awareness module 7", () => {
  it("is listed as available after modules 1 to 6", () => {
    expect(m7).toBeTruthy();
    expect(m7.course).toBe("cyber-awareness");
    expect(m7.title).toBe("AI-Powered Scams & Deepfakes");
    expect(AWARENESS_MODULE_LIST[6]).toMatchObject({ n: 7, title: m7.title, minutes: m7.minutes, available: true });
    expect(AWARENESS_MODULE_LIST.filter((m) => m.available).map((m) => m.n)).toEqual(expect.arrayContaining([1, 2, 3, 4, 5, 6, 7]));
  });

  it("plays the same block on every desk", () => {
    const first = resolveTrack(m7, "general").block;
    for (const track of TRACKS) {
      const { track: used, block } = resolveTrack(m7, track);
      expect(used, `${track} resolves to itself`).toBe(track);
      expect(block, `${track} gets the same block`).toBe(first);
    }
  });

  it("has a week of calls where every response explains itself and every call ends", () => {
    const w = week();
    expect(w.kind).toBe("calls");
    expect(w.calls.length).toBeGreaterThanOrEqual(4);
    expect(w.calls.length).toBeLessThanOrEqual(6);
    expect(new Set(w.calls.map((c) => c.kind)), "voice and video calls").toEqual(new Set(["voice", "video"]));
    const genuine = w.calls.filter((c) => c.genuine);
    expect(genuine.length, "some callers are genuine").toBeGreaterThanOrEqual(1);
    expect(genuine.length, "most are not").toBeLessThan(w.calls.length / 2);
    expect(new Set(w.calls.map((c) => c.time)).size, "the e2e tells the calls apart by time").toBe(w.calls.length);
    const bestAt = new Set<number>();
    for (const c of w.calls) {
      const name = `${c.time} ${c.caller}`;
      expect(c.opening.length, `${name}: the caller speaks first`).toBeGreaterThan(0);
      expect(c.truth.length, `${name}: who it really was`).toBeGreaterThan(40);
      expect(c.doing.length, `${name}: what you are doing`).toBeGreaterThan(20);
      c.turns.forEach((turn, ti) => {
        expect(turn.options.length, `${name} turn ${ti}: three or four moves`).toBeGreaterThanOrEqual(3);
        expect(turn.options.length).toBeLessThanOrEqual(4);
        expect(new Set(turn.options.map((o) => o.label)).size, `${name} turn ${ti}: moves named apart`).toBe(turn.options.length);
        expect(turn.options.some((o) => o.grade === "best"), `${name} turn ${ti}: a best move`).toBe(true);
        expect(turn.options.some((o) => o.grade === "wrong"), `${name} turn ${ti}: a wrong move`).toBe(true);
        turn.options.forEach((o, oi) => {
          if (o.grade === "best") bestAt.add(oi);
          expect(o.why.length, `${name} · ${o.label}: explains itself`).toBeGreaterThan(60);
          expect(o.say.length, `${name} · ${o.label}: what you say`).toBeGreaterThan(10);
          expect(o.reply || o.then, `${name} · ${o.label}: the call reacts`).toBeTruthy();
          if (o.next === undefined) expect(o.then, `${name} · ${o.label}: an ending says what happens`).toBeTruthy();
          else {
            expect(o.next, `${name} · ${o.label}: moves forward`).toBeGreaterThan(ti);
            expect(o.next).toBeLessThan(c.turns.length);
          }
          /* A move's label never gives the answer away. */
          expect(o.label).not.toMatch(/\b(safe|right|correct|best|wise|smart)\b/i);
        });
      });
      for (const path of paths(c)) expect(path.length, `${name}: every path ends`).toBeGreaterThan(0);
      /* Every turn reached is reachable: each later turn is some move's next. */
      for (let ti = 1; ti < c.turns.length; ti++) expect(c.turns.some((tn) => tn.options.some((o) => o.next === ti)), `${name}: turn ${ti} is reachable`).toBe(true);
    }
    expect(bestAt.size, "the best move sits in more than one place").toBeGreaterThan(1);
  });

  it("makes impostors dodge the check and genuine callers welcome it", () => {
    const w = week();
    for (const c of w.calls) {
      const name = `${c.time} ${c.caller}`;
      const first = c.turns[0].options;
      /* Going along without a check is never the best move, real caller or not. */
      const comply = first.filter((o) => o.grade === "wrong");
      expect(comply.length, `${name}: a wrong move`).toBeGreaterThan(0);
      /* A call-back on a number you already hold is always on offer at the start. */
      const callBack = first.find((o) => /call (you|her|him) (straight )?back|ring (you|your|his|her)|call the service desk|ring the service desk/i.test(o.say));
      expect(callBack, `${name}: a call-back`).toBeTruthy();
      expect(callBack!.grade, `${name}: the call-back is the best move`).toBe("best");
      if (c.genuine) {
        /* A genuine caller is happy to be checked, and assuming fake is wrong. */
        for (const o of first.filter((x) => x.grade === "best")) expect(o.reply, `${name}: a genuine caller answers the check`).toMatch(/good idea|please do|fair|of course|yes/i);
        expect(first.some((o) => o.grade === "wrong" && /scam|fake|deepfake/i.test(`${o.label} ${o.say}`)), `${name}: assuming fake is wrong`).toBe(true);
      } else {
        /* An impostor deflects, pushes or gets angry when checked. */
        for (const o of first.filter((x) => x.grade === "best")) expect(o.reply, `${name}: the impostor pushes back`).toBeTruthy();
      }
    }
  });

  it("proves with five choose items, explained, with no answer tell", () => {
    const { prove } = resolveTrack(m7, "general").block;
    expect(prove.length).toBe(5);
    expect(m7.passMark).toBe(4);
    expect(m7.shuffleOptions, "options shuffle per attempt").toBe(true);
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
    const cards = m7.learn.flatMap((l) => (l.kind === "cards" ? l.cards ?? [] : []));
    const cited = cards.filter((c) => c.sources);
    expect(cited.length).toBeGreaterThanOrEqual(10);
    for (const c of cited) for (const s of c.sources!) expect(s.href).toMatch(/^https:\/\//);
    /* A card that quotes a figure or a named source carries one. */
    for (const c of cards) {
      if (/\d+(\.\d+)?%|£\d|\b\d{2,}\b|\bmillion\b|NCSC|FBI|Starling|KnowBe4|Guardian|Bloomberg|WPP|Ferrari|Stop! Think Fraud|Police Scotland|Department of Justice/.test(`${c.body} ${c.detail ?? ""}`)) expect(c.sources?.length, `${c.title}: cited`).toBeGreaterThan(0);
    }
    /* The reported cases are phrased as reported. */
    for (const c of cards.filter((x) => /WPP|Ferrari/.test(x.title))) expect(c.detail, `${c.title}: as reported`).toMatch(/reported/);
    /* Earlier modules' figures are not reused, and Arup gets one line at most. */
    expect(allText).not.toMatch(/Cyber Security Breaches Survey|25m|200m|41\.3m/);
    expect(allText.match(/Arup/g)?.length ?? 0, "Arup in one line at most").toBeLessThanOrEqual(1);
  });

  it("keeps everything invented clearly fictional", () => {
    /* Outside the source links, every domain a learner reads is invented. */
    const readable = strings(JSON.parse(JSON.stringify(m7, (k, v) => (k === "sources" ? undefined : v)))).join("\n");
    const domains = readable.match(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)*\.(?:example|com|net|org|io|uk|co|info|biz|app|xyz|gov)\b/gi) ?? [];
    expect(domains.length, "the calls have an address to read").toBeGreaterThan(0);
    for (const d of domains) expect(d.toLowerCase(), `${d} is an .example domain`).toMatch(/\.example$/);
    /* Phone numbers sit in Ofcom's drama ranges. */
    const mobiles = readable.match(/\b07\d{3}\s?\d{6}\b/g) ?? [];
    const landlines = readable.match(/\b01\d{3}\s?\d{6}\b/g) ?? [];
    expect(mobiles.length + landlines.length, "the calls show numbers").toBeGreaterThan(2);
    for (const n of mobiles) expect(n, `${n} is a drama mobile`).toMatch(/^07700 ?900\d{3}$/);
    for (const n of landlines) expect(n, `${n} is a drama landline`).toMatch(/^01632 ?960\d{3}$/);
    /* Nobody real is the caller in the practice: real names appear only in the cited cases. */
    const callers = strings(week().calls.map((c) => [c.caller, c.role, c.shown, c.others ?? [], c.opening])).join("\n");
    expect(callers).not.toMatch(/Mark Read|Vigna|WPP|Ferrari|Arup|Martin Lewis/);
  });

  it("stays in its lane: safe AI use, payments and reporting get a pointer at most", () => {
    expect(allText).toMatch(/AI Cleared/);
    expect(allText).toMatch(/Module 6/);
    expect(allText).toMatch(/Module 8/);
    expect(allText).not.toMatch(/paste test|approved tools?/i);
    expect(allText).not.toMatch(/sort code|bank details/i);
  });

  it("keeps the house rules", () => {
    expect(allText.includes(String.fromCharCode(0x2014)), "no em-dash").toBe(false);
    expect(allText, "no emoji").not.toMatch(/\p{Extended_Pictographic}/u);
    expect(allText.includes(BACKSLASH), "no backslash").toBe(false);
    for (const word of ["organization", "recognize", "realize", "behavior", "color", "authorize", "favor", "center ", "license "]) expect(allText.toLowerCase(), `British spelling: ${word}`).not.toContain(word);
  });
});
