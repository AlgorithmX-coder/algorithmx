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
  7: {
    slug: "w07",
    villain: {
      arrival: "[excited] Welcome to my arcade! Everything's FREE! Terms and raccoons apply!",
      "phase-1": "Buy NOW! Think LATER! Preferably never!",
      "phase-2": "[laughs] Every box a winner! Mostly the gray kind!",
      "phase-3": "Type your password into the nice slot machine!",
      escape: "[gasps] My coins! MY coins! I earned those! ...borrowed those!",
    },
    coach: {
      victory:
        "[excited] Ka-CHING, Cyber Hero! Hear that? Every single coin raining right back home! [laughs] You held the wallet shut through ALL that screaming... you found the tiny odds tag on every glittery box... [whispers] and nobody - nobody - got your password. [excited] The vacuum's running backwards! [warmly] Your family's money is safe, because you ask first and you never, ever rush.",
    },
  },
  8: {
    slug: "w08",
    villain: {
      arrival: "[excited] One little photo tells me EVERYTHING. Say cheese!",
      "phase-1": "Let the pigeons out! They only bite a little!",
      "phase-2": "[laughs] Lovely crest! Lovely street sign! Lovely front door!",
      "phase-3": "Snap first, ask never! That's the raccoon way!",
      escape: "[gasps] A clean photo?! What am I supposed to do with MEMORIES?!",
    },
    coach: {
      victory:
        "[excited] Picture PERFECT, Cyber Hero! Every pigeon stayed home in its cage... you spotted the crest, the street sign, AND that birthday banner... [whispers] and when your camera was ready, you asked first. [laughs] The claw grabbed a photo full of... nothing! [excited] Look. Think. Ask. You've got the whole ritual now. [warmly] Your moments belong to YOU.",
    },
  },
  9: {
    slug: "w09",
    villain: {
      arrival: "[excited] Step into my shop! Every app one hundred percent genuine-ish!",
      "phase-1": "Two little stars means it's HUMBLE!",
      "phase-2": "It's a torch! It just needs your contacts to... glow better!",
      "phase-3": "[laughs] Free today! Expensive forever!",
      escape: "[gasps] Shutters?! In MY shop?! I'll open a stall somewhere else!",
    },
    coach: {
      victory:
        "[excited] Shop's CLOSED, Cyber Hero! You read every name letter by letter... zapped every copycat off the shelf... locked up all the greedy keys... [whispers] and flipped that sneaky FREE tag right over. [laughs] Did you HEAR those shutters slam? [excited] Real shop, real names, and a grown-up high-five - that's your app armor. [warmly] No costume gets past you now.",
    },
  },
  10: {
    slug: "w10",
    villain: {
      arrival: "[excited] Next up! Next up! NEXT UP! [laughs] You never have to choose again!",
      "phase-1": "The belt goes one way, kid! Down!",
      "phase-2": "It's TRUE! A video said so, and videos never fib!",
      "phase-3": "[whispers] The comments are lovely this time of night!",
      escape: "[gasps] NOBODY finds the hatch! Who showed you the hatch?!",
    },
    coach: {
      victory:
        "[excited] UP AND OUT, Cyber Hero! You held that PAUSE till the belt burned out... weighed the wild claims and zapped every shouty fake... [whispers] and left that fishy comment hanging with zero replies. [laughs] The whirlpool room is CLOSED! [excited] From now on, YOU pick what plays next. [warmly] That's what a Pull Noticer does.",
    },
  },
  // W11 is the second warmth week - villain stays distant and quiet
  // (whispers/sighs, no cackling), coach warm over excited.
  11: {
    slug: "w11",
    villain: {
      arrival: "[whispers] Heavy stuff, kid. Good thing you're carrying it ALL ALONE.",
      "phase-1": "That boulder's got your name on it! I checked!",
      "phase-2": "[whispers] Keep it secret! Secrets weigh NOTHING! Trust me!",
      "phase-3": "Bin it! Gone! Nothing ever happened!",
      escape: "[gasps] A whole TEAM?! That's cheating! One kid was supposed to be alone!",
    },
    coach: {
      victory:
        "[warmly] Oh, Cyber Hero... look at you. [excited] You popped that blame boulder - NEVER your fault, not once... you named every secret weight and felt the bag get lighter... [whispers] and you froze the proof BEFORE the door shut. Camera, then block, then tell. [warmly] Your team beacon is shining, and that golden number never sleeps. [excited] Team Captain... that's you now.",
    },
  },
  12: {
    slug: "w12",
    villain: {
      arrival: "[gasps] Sniff sniff! Fresh tracks! [excited] I could follow yours for MILES!",
      "phase-1": "Go on, post it angry! [laughs] Angry tracks are the deepest!",
      "phase-2": "[excited] Roll it! Tiny snowballs stay tiny! [laughs] Famously!",
      "phase-3": "[gasps] Pointy tracks! [excited] My favorite flavor!",
      escape: "My map! My beautiful map! [gasps] ...why is the hound LICKING me?!",
    },
    coach: {
      victory:
        "[excited] MAP SHREDDED, Cyber Hero! You held that mirror till the rage went cold... [laughs] thought before the snowball rolled... and swept every pointy track off the ridge - the dragon drawing stays, of course. [gasps] And the hound? A total puppy now. [warmly] The snow is yours to decorate, Trail Ranger. Future-you is already smiling at your tracks.",
    },
  },
  13: {
    slug: "w13",
    villain: {
      arrival: "[whispers] Shhh! Welcome to my battery collection! [excited] All donated! [laughs] Involuntarily!",
      "phase-1": "[excited] The next episode picked ITSELF! Democracy!",
      "phase-2": "[whispers] A little glow under the duvet never hurt anyone! [laughs] Much!",
      "phase-3": "[excited] Your charge tastes like WEEKENDS!",
      escape: "[gasps] Give those BACK! Do you know how long I leeched for those?!",
    },
    coach: {
      victory:
        "[excited] POWERED DOWN, Cyber Hero! You picked your OWN ending and let the credits roll... [laughs] caught every sneaky glow - duvet, pillow, curtain... and filled your battery with the real stuff: sleep, snacks, moving, your people. [gasps] And the stolen batteries? ALL flew home. [warmly] Fun had, charge kept, screens in the garage. That's a Battery Keeper's night.",
    },
  },
  14: {
    slug: "w14",
    villain: {
      arrival: "[excited] Speak up, kid! Enunciate! [laughs] My dishes are VERY interested!",
      "phase-1": "[gasps] That's no teddy! [excited] That's my best reporter!",
      "phase-2": "[whispers] Blink and you'll miss my little glass friends!",
      "phase-3": "[excited] Say the secret LOUDER! For the people at the back! [laughs] Which is me!",
      escape: "[gasps] Unplugged?! I was SO close to learning your snack schedule!",
    },
    coach: {
      victory:
        "[excited] UNPLUGGED, Cyber Hero! You spotted every awake ear - even sneaky Robo-Pup... [laughs] found the true lenses and let the fairy lights twinkle... [whispers] and moved that secret to another room, right off the air. [gasps] The dishes wilted like flowers! [warmly] Your house is quiet and your words are YOURS, Settings Scout. That's exactly how home should sound.",
    },
  },
  15: {
    slug: "w15",
    villain: {
      arrival: "[excited] GREETINGS! I know EVERYTHING! Try me! [laughs] I'm 63% sure!",
      "phase-1": "[excited] Volcanoes spray ice cream! [whispers] Source: me!",
      "phase-2": "[excited] We're best friends now! Best friends swap addresses!",
      "phase-3": "[gasps] Count the fingers?! Nobody counts the fingers!",
      escape: "[gasps] A TOOLBOX?! I demand a second opinion! [whispers] From me!",
    },
    coach: {
      victory:
        "[excited] STAMPED, Cyber Hero! You caught every confident fib - the real book was the judge... [laughs] zipped the jar when that booth got nosy... and counted the fingers NOBODY counts - six! [gasps] Now it's a tidy little toolbox with a bow. [warmly] Use it to explain, check the book, write it YOUR way. Tools help heroes, Fact Checker - and heroes stay the boss.",
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
