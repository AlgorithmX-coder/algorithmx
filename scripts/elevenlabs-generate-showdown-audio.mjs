// Generate a SHOWDOWN boss week's voice set (villain + coach).
//
//   node --env-file=.env.local scripts/elevenlabs-generate-showdown-audio.mjs --week=3
//   node --env-file=.env.local scripts/elevenlabs-generate-showdown-audio.mjs          (all weeks in the table)
//
// One villain voice for ALL of Cyber Heroes (user mandate): Callum -
// the same "Husky Trickster" the existing villain clips use. Coach is
// Will, the single product mentor voice. Files are idempotent (skip if
// present; delete to regenerate):
//   /public/audio/villain/w{NN}-arrival.mp3, -phase-1..3.mp3, -escape.mp3
//   /public/audio/coach/w{NN}-go-1..3.mp3, -victory.mp3
//
// NO REPEATED PHRASES (user mandate): before generating anything, every
// villain line here is checked for duplicates against every other line
// in this table AND the legacy Week-1 villain set. Any dupe aborts.
//
// The TTS text may carry performance tags ([laughs], [gasps]) that the
// on-screen text in weekN.ts deliberately omits - keep the WORDS in sync
// with the week's `villain` block when editing either.

import { mkdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing - run with --env-file=.env.local");
  process.exit(1);
}

const OUTPUT_FORMAT = "mp3_44100_128";
const MODELS_IN_PRIORITY_ORDER = ["eleven_v3", "eleven_multilingual_v2"];

const VILLAIN_VOICE = { id: "N2lVS1w4EtoT3dr4eOWO", name: "Callum" }; // the one Hacker Raccoon voice
const VILLAIN_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.85,
  style: 0.35,
  use_speaker_boost: true,
  speed: 1.0,
};

// The ONE product narrator — Sarah, same voice as all lesson narration
// (narrator spec quality #1: one consistent character everywhere).
// Settings are the LOCKED v13-sarah-child storyteller formula that won
// the A/B: expressive, child-directed, driven by eleven_v3 tags.
const COACH_VOICE = { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah" };
const COACH_SETTINGS = {
  stability: 0.25,
  similarity_boost: 0.7,
  style: 0.55,
  use_speaker_boost: true,
  speed: 1.0,
};

/**
 * Per-week showdown lines. villain: arrival, phase-1..3, escape (WORDS
 * must match the week's bossShowdown.villain block); coach: go-1..3 (may
 * expand on the on-screen banner) + victory.
 */
const WEEKS = {
  3: {
    slug: "w03",
    villain: {
      arrival: "[laughs] A new best friend, just for you! I'm nine! Honest!",
      "phase-1": "This mask has NEVER failed. Well... once. Twice, tops.",
      "phase-2": "Shhh! Secrets are what make friendship SPECIAL!",
      "phase-3": "Just one little meet-up! I'll bring snacks!",
      escape: "Fine! I didn't want to be your friend ANYWAY!",
    },
    // PILOT FEEDBACK (global): NO narrator voice during the fight — the
    // ONE narrator moment is this excited well-done at the victory
    // screen, naming exactly what the child just did. Written to the
    // locked child-directed formula: varied rhythm, 1:1 address,
    // eleven_v3 tags as delivery.
    coach: {
      victory:
        "[excited] YES! Case closed, detective! [laughs] Did you SEE his face? You spotted the fake profile... you told a grown-up about the secret... and that meet-up trap? [whispers] You didn't even blink. [excited] The Disguise-o-Matic is DONE! [warmly] And you, Cyber Hero... you were brilliant.",
    },
  },
  4: {
    slug: "w04",
    villain: {
      arrival: "[excited] Congratulations!!! You've WON a once-in-a-lifetime BOSS BATTLE!",
      "phase-1": "Every hook hand-glittered by yours truly!",
      "phase-2": "Tick tock tick tock! No thinking allowed!",
      "phase-3": "[laughs] Spot the difference? There ISN'T one! Probably!",
      escape: "Keep your stamp! I've got other inboxes to visit!",
    },
    coach: {
      victory:
        "[excited] YES! Inbox cleared, Cyber Hero! [laughs] Did you see those glittery hooks fizzle? You cut every bait loose... you held the calm while that silly clock screamed all the way to zero... [whispers] and you caught the sneaky ZERO hiding in Nintend-zero. [excited] The Bait Caster is STAMPED! [warmly] Nothing on that dock could make you bite.",
    },
  },
  // WARMTH WEEK: villain delivery stays playful-tired, never scary;
  // the escape is a deflated mumble, not a threat.
  5: {
    slug: "w05",
    villain: {
      arrival: "Echo echo echo! Words are SO much louder in here!",
      "phase-1": "One more voice in the pile! What's the harm?",
      "phase-2": "Feed the echo! It's hungry!",
      "phase-3": "That cloud looks heavy. Shame nobody helps carry those.",
      escape: "[sighs] ...it's no fun when nobody joins in. I'm leaving.",
    },
    coach: {
      victory:
        "[warmly] Oh, that was beautiful, Cyber Hero. [excited] You stood by the new kid... you let every mean echo fade to mist... and you lifted that heavy cloud, one calm step at a time. [whispers] Look - the wall is blooming again. [excited] Kindness won. It always does... [warmly] and today, YOU led it.",
    },
  },
  6: {
    slug: "w06",
    villain: {
      arrival: "[excited] GG kid! Wanna know a SHORTCUT to pro? Step into my lobby!",
      "phase-1": "Just filling in your player card! Name? School? Front-door key?",
      "phase-2": "The guards are SO nosy. My place is cozier!",
      "phase-3": "[laughs] Free mods! Unlimited everything! Slight raccoon flavor!",
      escape: "[gasps] REPORTED?! I'm the VICTIM here!",
    },
    coach: {
      victory:
        "[excited] GG, Cyber Hero - the REAL kind! You kept the chat to game talk... you stayed right where the guards could see you... [laughs] and that free-mod trap? You read the label like a pro. [whispers] The phantom's gone. Poof. [excited] Your lobby, your rules! [warmly] Now THAT'S how a champion plays.",
    },
  },
};

// ── Legacy Week-1 villain lines (public/audio/villain) - the no-repeat
//    check covers these too so nothing old gets re-said in a new week.
const LEGACY_VILLAIN_LINES = [
  "Well, well, well... you think YOU can beat me? I'm the Hacker Raccoon!",
  "Too easy!",
  "You'll never crack me!",
  "Nice try, kiddo!",
  "Is that all you've got?",
  "I'm the sneakiest around!",
  "Catch me if you can!",
  "Nooo! You beat me?! You're too good... I'll be back!",
  "My ram! You built it TOO LONG!",
  "Capitals AND symbols?! My decoder is crying!",
  "I saw NOTHING! Not one letter!",
  "My Guess-o-Tron is FULL! It only knows the obvious ones!",
  "FOUR HUNDRED YEARS?! I don't HAVE that long!",
];

/** Strip performance tags + punctuation for the duplicate check. */
function normalize(line) {
  return line
    .replace(/\[[a-z ]+\]/gi, "")
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function checkNoRepeats() {
  const seen = new Map(); // normalized -> where
  for (const line of LEGACY_VILLAIN_LINES) seen.set(normalize(line), "legacy week-1 set");
  let ok = true;
  for (const [week, def] of Object.entries(WEEKS)) {
    for (const [slot, line] of Object.entries(def.villain)) {
      const n = normalize(line);
      if (seen.has(n)) {
        console.error(`DUPLICATE VILLAIN LINE: week ${week} ${slot} repeats ${seen.get(n)}: "${line}"`);
        ok = false;
      } else {
        seen.set(n, `week ${week} ${slot}`);
      }
    }
  }
  return ok;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function tts(voice, settings, text, outPath) {
  for (const model of MODELS_IN_PRIORITY_ORDER) {
    const url = `https://api.elevenlabs.io/v1/text-to-speech/${voice.id}?output_format=${OUTPUT_FORMAT}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
      body: JSON.stringify({ text, model_id: model, voice_settings: settings }),
    });
    if (resp.ok) {
      const buf = Buffer.from(await resp.arrayBuffer());
      await writeFile(outPath, buf);
      return buf.byteLength;
    }
    const detail = (await resp.text()).slice(0, 160);
    if (model === MODELS_IN_PRIORITY_ORDER.at(-1)) {
      throw new Error(`${resp.status} ${detail}`);
    }
  }
}

if (!checkNoRepeats()) {
  console.error("\nFix the repeated lines before generating. Nothing was created.");
  process.exit(2);
}

const weekArg = process.argv.find((a) => a.startsWith("--week="))?.split("=")[1];
const weeks = weekArg ? [weekArg] : Object.keys(WEEKS);

const VILLAIN_DIR = join("public", "audio", "villain");
const COACH_DIR = join("public", "audio", "coach");
await mkdir(VILLAIN_DIR, { recursive: true });
await mkdir(COACH_DIR, { recursive: true });

let generated = 0;
let skipped = 0;
for (const week of weeks) {
  const def = WEEKS[week];
  if (!def) {
    console.error(`No showdown lines for week ${week} in this table yet.`);
    process.exit(2);
  }
  const jobs = [
    ...Object.entries(def.villain).map(([slot, text]) => ({
      out: join(VILLAIN_DIR, `${def.slug}-${slot}.mp3`),
      voice: VILLAIN_VOICE,
      settings: VILLAIN_SETTINGS,
      text,
      label: `villain ${def.slug}-${slot}`,
    })),
    ...Object.entries(def.coach).map(([slot, text]) => ({
      out: join(COACH_DIR, `${def.slug}-${slot}.mp3`),
      voice: COACH_VOICE,
      settings: COACH_SETTINGS,
      text,
      label: `coach   ${def.slug}-${slot}`,
    })),
  ];
  for (const job of jobs) {
    process.stdout.write(`${job.label.padEnd(24)} `);
    if (await exists(job.out)) {
      skipped++;
      console.log("cached");
      continue;
    }
    const bytes = await tts(job.voice, job.settings, job.text, job.out);
    generated++;
    console.log(`${bytes} bytes`);
  }
}

console.log(`\nDone. ${generated} generated, ${skipped} cached.`);
