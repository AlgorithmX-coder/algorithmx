// Generate the ATLAS "Mission Command" week-intro narration for Cyber Heroes.
// One MP3 per week -> public/audio/atlas/heroes-week-NN.mp3.
//
// Voice: ATLAS = ElevenLabs "Daniel" (steady British male) — the SAME voice as
// the Explorers block intro. The owner auditioned takes and chose the eleven_v3
// read with a FLOWING, conversational script (no hard <break> pauses — those
// staccato breaks are what made the first take "sound too AI").
//
// Usage:
//   node --env-file=.env.local scripts/generate-atlas-weekintros.mjs [--force]

import { mkdir, writeFile, stat } from "node:fs/promises";
import { join } from "node:path";

const KEY = process.env.ELEVENLABS_API_KEY;
if (!KEY) {
  console.error("ELEVENLABS_API_KEY missing — run with --env-file=.env.local");
  process.exit(1);
}
const FORCE = process.argv.includes("--force");

const VOICE_ID = "onwK4e9ZLuTAKqWW03F9"; // Daniel — Steady Broadcaster
const MODEL_ID = "eleven_v3"; // owner-chosen (more expressive than v2)
const VOICE_SETTINGS = {
  stability: 0.4,
  similarity_boost: 0.75,
  style: 0.4,
  use_speaker_boost: true,
};
const OUTPUT_FORMAT = "mp3_44100_128";
const OUT_DIR = join("public", "audio", "atlas");

// Warm mission-commander briefings, one per week — connected, conversational
// speech for ages 6–9. No <break> tags: punctuation carries the natural rhythm.
const SCRIPTS = {
  1: "Hello there, Cyber Hero. This week you're going to learn the secret of the password, and it's a big one. A password is like a magic word that keeps all your things safe and locks that sneaky Hacker Raccoon right out. Your job is to build one so strong that nobody could ever guess it, not in a million years. I know you can do it. So take a deep breath, and let's begin.",
  2: "Welcome back, Cyber Hero. This week is all about your secrets — the little pieces of information that belong to just you, like your full name, where you live, and where you go to school. Some things are fine to share, but others you keep locked away, because the Hacker Raccoon loves collecting secrets. Your mission is to learn what to guard and what's okay to give. Ready to become a secret keeper? Let's begin.",
  3: "Hello again, Cyber Hero. Online, not everyone is who they say they are. Someone can put on a friendly face and pretend to be a kid, when really they're a stranger, or even the Hacker Raccoon in disguise. This week you'll learn how to tell a real friend from a foe, and exactly what to do when someone you don't know tries to talk to you. Trust your instincts, hero. Let's begin.",
  4: "Welcome back, Cyber Hero. The internet is full of shiny promises — free prizes, amazing deals, and messages that shout you've won. But some of them are traps, set by tricksters who want to fool you. This week you'll become a fake spotter, learning the little clues that give a scam away. Remember, if something seems too good to be true, it usually is. Let's begin.",
  5: "Hello, Cyber Hero. Words can build someone up, or they can really hurt. This week is about being kind online, standing up for others, and knowing exactly what to do if mean words ever come your way. A true hero never joins the pile on, and never leaves anyone to face it alone. Let's learn how to be the kind one, and stop the bullies cold. Let's begin.",
  6: "Welcome back, Cyber Hero. Games are brilliant fun, but every game zone needs a guard. This week you'll learn how to keep strangers out of your games, spot the sneaky tricks that pop up while you play, and keep your account safe from the Hacker Raccoon. So grab your controller, hero. Let's defend the game zone, and begin.",
  7: "Hello again, Cyber Hero. Games love to wave shiny coins and skins in front of you, and every single one costs real money, often your family's money. This week you'll learn to spot the spending traps, and why you always ask a grown up first. Real heroes never tap buy on their own. Let's uncover the trick behind the trap, and begin.",
  8: "Welcome back, Cyber Hero. A photo can travel much further than you'd ever imagine, and once it's out there, it's very hard to bring back. This week you'll learn to think before you share — what's safe to post, what to keep private, and how to look after the people in your pictures. A moment's thought keeps everyone safe. Let's begin.",
  9: "Hello, Cyber Hero. Not every app is what it pretends to be. Some are copycats, dressed up to look real, hiding sneaky little surprises inside. This week you'll learn to spot the fakes before you download, and to always check with a grown up first. A careful hero never installs a trick. Let's learn how, and begin.",
  10: "Welcome back, Cyber Hero. Videos can be brilliant, but they're built to keep you watching, one after another, until hours have quietly slipped away. This week you'll learn to notice the rabbit hole, and how to climb back out — choosing when to stop, instead of letting the screen choose for you. You're the one in charge, hero. Let's begin.",
  11: "Hello, Cyber Hero. Sometimes, even when you're being careful, something online just feels wrong. This week is one of the most important of all — knowing what to do in that moment. You'll learn the emergency steps: stay calm, don't reply, and tell a grown up you trust. Telling isn't tattling; it's how heroes stay safe. Let's learn the protocol, and begin.",
  12: "Welcome back, Cyber Hero. Everywhere you go online, you leave little tracks behind, like footprints in the snow. This week you'll learn what your digital footprint is, who can see it, and how to keep yours clean and safe. Every step you take online tells a story, so let's make yours a good one. Let's begin.",
  13: "Hello again, Cyber Hero. Screens are wonderful, but even heroes need to recharge. This week you'll learn to balance your power — knowing when to play, when to rest, and how to notice when your battery is running low. A hero in balance is a hero at their very strongest. Let's find that balance, and begin.",
  14: "Welcome back, Cyber Hero. These days, all sorts of gadgets can listen and watch — speakers, toys, even the television. This week you'll learn which devices have ears and eyes, and how to keep your secrets safe when they're nearby. Knowing who's listening is a real hero's superpower. Let's switch it on, and begin.",
  15: "Hello, Cyber Hero. Some of the voices you meet online aren't people at all — they're clever robots called chatbots. They can be helpful, but they can also get things wrong, or ask for things they really shouldn't. This week you'll learn to tell a robot from a real person, and to double check whatever they tell you. Stay sharp, hero. Let's begin.",
  16: "Welcome back, Cyber Hero. A link is like a doorway, and a QR code is a hidden one — but not every door leads somewhere safe. This week you'll learn to check a link before you tap, peel back the tricks, and never, ever take the bait. A careful hero always looks before they leap. Let's begin.",
  17: "Hello again, Cyber Hero. On social media, it's so easy to share a little too much. This week you'll raise your profile shield — keeping your account private, remembering that followers aren't the same as friends, and knowing that a feed only ever shows the shiny bits. Shield up, hero. Let's begin.",
  18: "Welcome back, Cyber Hero. Sometimes you'll use a device that isn't yours — a school computer, a family tablet, a borrowed phone. This week you'll learn the golden rule: lock before you leave. Log out, keep your keys, and respect other people's privacy too. A tidy hero never leaves a door open. Let's begin.",
  19: "Hello, Cyber Hero. You've learned so much — and now it's time to protect the people you love. This week you'll build a family firewall, helping the grown ups spot the tricks, and making safety a team effort for everyone at home. The very best heroes look out for their family. Let's build that firewall, and begin.",
  20: "Welcome, Cyber Hero. This is it — your final mission. Over twenty weeks you've learned to outsmart every single trick the Hacker Raccoon could throw at you, and today you put it all together. I've watched you grow from a rookie into a true Cyber Hero, and I could not be prouder. One last time — take a deep breath, and let's begin.",
};

await mkdir(OUT_DIR, { recursive: true });
const fileExists = async (p) => { try { await stat(p); return true; } catch { return false; } };

let made = 0, cached = 0;
for (let n = 1; n <= 20; n++) {
  const num = String(n).padStart(2, "0");
  const outPath = join(OUT_DIR, `heroes-week-${num}.mp3`);
  if (!FORCE && (await fileExists(outPath))) {
    console.log(`week ${num}: cached`);
    cached++;
    continue;
  }
  const text = SCRIPTS[n];
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}?output_format=${OUTPUT_FORMAT}`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "xi-api-key": KEY, "Content-Type": "application/json", Accept: "audio/mpeg" },
    body: JSON.stringify({ text, model_id: MODEL_ID, voice_settings: VOICE_SETTINGS }),
  });
  if (!resp.ok) {
    console.error(`week ${num}: FAILED ${resp.status} ${(await resp.text()).slice(0, 200)}`);
    process.exit(3);
  }
  const buf = Buffer.from(await resp.arrayBuffer());
  await writeFile(outPath, buf);
  console.log(`week ${num}: ${buf.byteLength} bytes`);
  made++;
}
console.log(`\nDone. ${made} generated, ${cached} cached -> ${OUT_DIR}`);
