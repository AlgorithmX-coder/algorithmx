// audit-read-alouds.mjs - is every line Sarah reads ALOUD in a game actually
// recorded?
//
// WHY THIS EXISTS. audit-verdict-voice.mjs checks VERDICT reasons: the sentence
// after "That's right!" or "Not quite.". It has never looked at the lines an
// engine reads out as a thing arrives on the board. Those come from the clip
// generator's per-type scans, and on 2026-09-23 that whole block turned out to
// be gated on a HARDCODED list of week files that weeks 15, 17 and 18 were
// never added to. The result: 20 read-aloud lines in Week 17 shipped completely
// silent, and nothing anywhere reported a problem. Week 14 was silent for two
// further reasons: hookSort, replyCards and settingsSwitch had no read-aloud
// scan written for them at all.
//
// Silence is the worst failure mode this codebase has, because it looks exactly
// like success: no error, no crash, a board that plays perfectly and says
// nothing. So it gets its own gate.
//
//   node scripts/audit-read-alouds.mjs                 all weeks
//   node scripts/audit-read-alouds.mjs --week=18       one week, listing misses
//   node scripts/audit-read-alouds.mjs --strict        exit 1 if anything is silent
//
// SCOPED BY SCREEN TYPE ON PURPOSE. A blanket text scan gets this wrong, because
// the same field name means different things in different engines: ClueStamper
// SPEAKS its `teach`, and LensCheck's `teach` is read on screen and never
// spoken. Checking `teach` everywhere would report four false alarms on Week 14
// and train whoever reads this to ignore it. So every entry below is a claim
// about one engine's contract, taken from that engine's own header.
import { readFileSync, existsSync } from "node:fs";

const args = process.argv.slice(2);
const strict = args.includes("--strict");
const weekArg = (args.find((a) => a.startsWith("--week=")) || "").split("=")[1];

/** Fields an engine SPEAKS, over and above the shared `readAloud`. */
const EXTRA_BY_TYPE = {
  // AccountRescue's moves skin reads each tile out as it is tapped.
  accountRescue: [],
  // The Log Out sweep speaks per card, and on each of its committed moments.
  logOutFlick: ["logOut", "lockWhy", "earlyLockExplanation", "goblinLine", "lookBackWhy"],
  // Sarah reads each step's affirmation as it lands (`speakSteps`).
  stepOrder: ["affirmation"],
  // The Clue Stamper speaks its case why and each clue's teach.
  clueStamper: ["rightWhy", "teach"],
  // The inspectors speak a "Think!" line once every zone is open.
  requestInspector: ["nudge"],
  profileInspector: ["nudge"],
};

/**
 * Screen types that do NOT speak `readAloud` even though they carry one. Keep
 * this empty unless an engine header actually says the field is on-screen only,
 * and name the engine in a comment when adding.
 */
const READ_ALOUD_IS_SILENT_ON = new Set([]);

/** Spine screens: no board, nothing read aloud from an item. */
const SPINE = new Set([
  "video", "alert", "weekIntro", "mission", "info", "recap", "quickCheck",
  "bossBattle", "missionDebrief", "stickerUnlock", "completion", "cutscene", "reward",
]);

const manifestPath = "public/audio/voice/manifest.json";
if (!existsSync(manifestPath)) {
  console.error("No voice manifest at " + manifestPath + " - run the generator first.");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const recorded = new Set((manifest.entries || []).map((e) => (e.text || "").trim()));

const grab = (span, field) => {
  const out = [];
  const re = new RegExp("\\b" + field + ":\\s*\"((?:[^\"\\\\]|\\\\.)*)\"", "g");
  let m;
  while ((m = re.exec(span)) !== null) {
    const text = m[1].replace(/\\"/g, '"').replace(/\\\\/g, "\\").trim();
    if (text) out.push(text);
  }
  return out;
};

const weeks = weekArg ? [weekArg] : Array.from({ length: 20 }, (_, i) => String(i + 1));
let totalSilent = 0;
let totalLines = 0;

for (const w of weeks) {
  const path = `app/lesson/weekContent/week${w}.ts`;
  if (!existsSync(path)) continue;
  const src = readFileSync(path, "utf8").replace(/\r\n/g, "\n");

  // Slice the file into one span per screen, the same way the generator does.
  const typeRe = /^\s*\{?\s*type:\s*"([a-zA-Z]+)"/gm;
  const starts = [];
  let tm;
  while ((tm = typeRe.exec(src)) !== null) starts.push({ type: tm[1], off: tm.index });

  let lines = 0;
  const silent = [];
  starts.forEach((st, i) => {
    if (SPINE.has(st.type)) return;
    const span = src.slice(st.off, i + 1 < starts.length ? starts[i + 1].off : src.length);
    const fields = [
      ...(READ_ALOUD_IS_SILENT_ON.has(st.type) ? [] : ["readAloud"]),
      ...(EXTRA_BY_TYPE[st.type] || []),
    ];
    for (const f of fields) {
      for (const text of grab(span, f)) {
        lines++;
        if (!recorded.has(text)) silent.push({ type: st.type, field: f, text });
      }
    }
  });

  totalLines += lines;
  totalSilent += silent.length;
  const mark = silent.length === 0 ? "ok" : `*** ${silent.length} SILENT ***`;
  console.log(`week${String(w).padEnd(2)}  ${String(lines).padStart(3)} spoken board line(s)  ${mark}`);
  if (silent.length && weekArg) {
    for (const s of silent) console.log(`    [${s.type}] ${s.field}: ${s.text.slice(0, 92)}`);
  }
}

console.log(`\n${totalLines} spoken board line(s) across ${weeks.length} week file(s) - ${totalSilent} SILENT`);
if (totalSilent) {
  console.log("A silent line plays as nothing at all, with no error anywhere.");
  console.log("First try generating: node --env-file=.env.local scripts/elevenlabs-generate-narration.mjs");
  console.log("If that does not fix it, the generator has no scan for that engine's field.");
  console.log("Add one in the per-type block of elevenlabs-generate-narration.mjs.");
  if (!weekArg) console.log("Re-run with --week=N to see the actual lines and their engines.");
}
if (strict && totalSilent) process.exit(1);
