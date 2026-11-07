// Script standard for WREN's lines (Cyber Explorers), checked before any
// recording. Owner, 2026-11-07: "the scripting is fluent... with punctuation
// and everything. So the Eleven Labs know exactly how to read it, where to take
// the breaks, where to flow" and "full complete sentences... all the
// punctuation's in the right places".
//
// What the rules prevent, each measured on her recordings:
//   one tag     a second [tag] switches her tone mid-line (243 lines)
//   tag by role every line of a kind uses the same tone, so a skill sounds like one voice
//   quotes      v3 pauses at quote marks ("paid the ... 'postage'", UAT M2-3a)
//   caps        an ALL-CAPS stress word gets a pause in front of it ("fix ... ONE")
//   end         every sentence ends in . ? or !, so she knows where to stop
//   length      a sentence over 25 words runs her out of breath; split it
//   ellipsis, dashes, brackets, symbols: she reads each as an unplanned pause or a word
// Whether a line is a complete, teaching sentence still needs a human read.
//
// Usage: node scripts/lint-wren-voice-scripts.mjs 01 [02 ...]   (no args = all 20)

const NAMES = new Set([
  "ARC", "WREN", "QR", "DM", "AI", "PC", "URL", "PIN", "OK", "UK", "USB", "VPN", "HTTPS", "ID",
  "PACKRAT", "GHOSTWRITER", "MIMIC", "SIREN", "SKELETON", "KEY", "PHANTOM", "HOOK", "SKINSTORM", "COORD", "IFMMP", "FLOOD",
]);

const TAG_FOR = (path) =>
  /-debrief\.|-catch-pass\./.test(path) ? "proud" : /-boss-p\d/.test(path) ? "determined" : /-transmission\./.test(path) ? null : "warm";

const RULES = {
  "one tag": (raw) => !/^\[[a-z ]+\][^[]*$/.test(raw.trim()) && "needs exactly one [tag], at the start",
  "tag by role": (raw, path) => {
    const want = TAG_FOR(path), tag = raw.match(/^\[([a-z ]+)\]/)?.[1];
    return want && tag !== want && `[${tag}] should be [${want}]`;
  },
  quotes: (t) => /["“”]|(^|[^A-Za-z])['‘’]|['‘’](?![A-Za-z])/.test(t) && "quote marks",
  caps: (t) => {
    const w = [...t.matchAll(/\b[A-Z]{2,}\b/g)].map((m) => m[0]).filter((x) => !NAMES.has(x));
    return w.length > 0 && `stress in capitals: ${w.join(" ")}`;
  },
  end: (t) => !/[.?!]$/.test(t.trim()) && "last sentence has no . ? or !",
  length: (t) => {
    const long = t.split(/(?<=[.?!])\s+/).filter((s) => s.split(/\s+/).length > 25);
    return long.length > 0 && `sentence over 25 words: "${long[0].slice(0, 60)}..."`;
  },
  ellipsis: (t) => /\.\.\.|…/.test(t) && "ellipsis",
  dash: (t) => /[—–]|\s-\s/.test(t) && "dash",
  brackets: (t) => /[()]/.test(t) && "brackets",
  // web addresses are read out in words by the generator ("dot", "slash")
  symbols: (t) => /[&%/£$#@*+=<>]/.test(t.replace(/\b[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:\/[a-z0-9-]+)*/gi, "")) && "symbol",
};

const missions = process.argv.slice(2).length ? process.argv.slice(2) : Array.from({ length: 20 }, (_, i) => String(i + 1));
let lines = 0, bad = 0;
const counts = Object.fromEntries(Object.keys(RULES).map((k) => [k, 0]));
for (const m of missions) {
  const nn = m.padStart(2, "0");
  const { [`mission${nn}VoiceScripts`]: scripts } = await import(`./wren-voice-scripts/mission${nn}.mjs`);
  for (const [path, raw] of Object.entries(scripts)) {
    lines++;
    const text = raw.replace(/^\[[a-z ]+\]\s*/, "");
    const hits = Object.entries(RULES).flatMap(([k, f]) => {
      const r = f(k === "one tag" || k === "tag by role" ? raw : text, path);
      return r ? [[k, r]] : [];
    });
    if (!hits.length) continue;
    bad++;
    console.log(`${path}\n  ${hits.map(([k, r]) => { counts[k]++; return `${k}: ${r}`; }).join("\n  ")}`);
  }
}
console.log(`\n${lines} lines, ${bad} need work`);
for (const [k, n] of Object.entries(counts)) if (n) console.log(`  ${k.padEnd(12)} ${n}`);
process.exit(bad ? 1 : 0);
