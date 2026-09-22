// Generate the ATLAS "Mission Command" week-intro narration for Cyber Heroes.
// One MP3 per week -> public/audio/atlas/heroes-week-NN.mp3.
//
// Voice: ATLAS = ElevenLabs "Daniel" (steady British male) — the SAME voice as
// the Explorers block intro, with a FLOWING, conversational script (no hard
// <break> pauses — those staccato breaks made the first take "sound too AI").
//
// MODEL: eleven_multilingual_v2 (was eleven_v3). The v3 alpha model added a
// reverby/doubled "echo" artifact to the read (worse, not better, at low
// style), which the owner flagged. v2 is the stable production model and
// renders the same voice cleanly. Keep flowing script; style kept modest.
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
const MODEL_ID = "eleven_multilingual_v2"; // stable model — no v3 echo artifact
const VOICE_SETTINGS = {
  stability: 0.45,
  similarity_boost: 0.75,
  style: 0.35,
  use_speaker_boost: true,
};
const OUTPUT_FORMAT = "mp3_44100_128";
const OUT_DIR = join("public", "audio", "atlas");

// Warm mission-commander briefings, one per week — connected, conversational
// speech for ages 6–9. No <break> tags: punctuation carries the natural rhythm.
const SCRIPTS = {
  1: "Hello there, Cyber Hero. This week you're going to learn the secret of a really strong password. A password is like a secret key that proves it's you, and it keeps that sneaky Hacker Raccoon locked out of your games and messages. You'll learn to make it nice and long, to mix it up, to keep it secret, and to never pick one he could guess. And once you can do all of that, the Raccoon can try and try, but he will never get in. You learn the skill, and you are protected. So take a deep breath, Cyber Hero, and let's begin.",
  2: "Welcome back, Cyber Hero. This week is all about your secrets, the little pieces of information that belong to just you, like your name, where you live, and where you go to school. Here's your mission. You're going to learn which secrets to guard, and which things are perfectly fine to share. And here's why that matters so much. Once you can do that, the Hacker Raccoon can never find you, never fool you, and never collect a single secret about you. You learn the skill, and you are protected. Ready to become a secret keeper? Let's begin.",
  3: "Hello again, Cyber Hero. Online, not everyone is who they say they are. Someone can put on a friendly face and pretend to be a kid, when really they're a stranger, or even the Hacker Raccoon in disguise. This week you'll learn how to tell a real friend from a foe, and exactly what to do when someone you don't know tries to talk to you. Trust your hero instincts. Let's begin.",
  // Rewritten 2026-09-16 for the Learn-Loop rebuild (learn X, so you're
  // protected from Y; the W15 model). Regenerate with the old mp3 deleted so
  // only this week re-records.
  4: "Welcome back, Cyber Hero. The Hacker Raccoon has opened a carnival of fakes: shiny prizes, shouting countdowns, and messages dressed up as people you trust. Here's your mission this week. You're going to learn what a scam really wants, how to measure an offer that sounds too good, how to slow down when a message rushes you, how to catch a copycat sender, and the three step rule that beats every trick: stop, check, show. And here's why that matters so much. Once you can do that, no fake prize, no countdown and no lookalike can ever trick you into a tap. You learn the skill, and you are protected. Stay sharp, hero. Let's begin.",
  5: "Hello, Cyber Hero. This week is about kindness, and about what to do when words online turn mean. You are going to learn the laugh test, so you can always tell a joke from bullying. You will learn the biggest truth of all: if someone is mean to you, it is never your fault. And you will learn the calm moves that stop a pile-on cold: don't feed the fire, don't pass it on, and tell someone you trust. Once you know those moves, no mean message can ever make you feel small or alone. You learn the skill, and you are protected. Take a deep breath, Cyber Hero. Let's begin.",
  6: "Welcome back, Cyber Hero. Games are brilliant fun, and every game zone needs a guard. This week you are going to learn how to keep your real-life info out of game chat, how to lock your lobby to friends only, how to spot the trick that says let's chat somewhere else, where the report and block buttons live in any game, and how to close a free-download trap. Once you can do all of that, no stranger can fish your secrets out of a lobby, and no fake mod can steal your account. You learn the skill, and you are protected. Grab your controller, Cyber Hero. Let's begin.",
  7: "Hello again, Cyber Hero. Games love to wave shiny coins and skins in front of you, and every single one costs real money, often your family's money. Here's your mission this week. You're going to learn to count game coins back into real money, to see the odds hiding inside a loot box, to freeze a fake countdown and read the real price, to ask before every buy, and to spot that free game money does not exist. And here's why that matters so much. Once you can do all of that, no shiny shop, no mystery box and no free-coin trick can ever empty your family's wallet. You learn the skill, and you are protected. Keep your coins close, Cyber Hero. Let's begin.",
  8: "Welcome back, Cyber Hero. A photo can travel much further than you would ever imagine, and once it is out there, it is very hard to bring back. Here's your mission this week. You're going to learn that delete only deletes your own copy, to ask before you post anyone else's face, to spot what a photo gives away in its corners, to pick the door that fits every photo, and to look, think and ask before a photo goes anywhere. And here's why that matters so much. Once you can do all of that, no photo of yours can wander off to strangers, and no friend of yours gets shared without a yes. You learn the skill, and you are protected. Eyes sharp, Cyber Hero. Let's begin.",
  9: "Hello, Cyber Hero. Not every app is what it pretends to be. Some are copycats, dressed up to look real, with sneaky little surprises hiding inside. Here's your mission this week. You're going to learn where real apps come from, how to count the whiskers on a copycat, why an app only gets the keys its job needs, what FREE really costs, and why every new app gets installed together with a grown-up. And here's why that matters so much. Once you can do all of that, no copycat, no greedy app and no fake FREE tag can sneak onto your device. You learn the skill, and you are protected. Warehouse doors open, Cyber Hero. Let's begin.",
  10: "Welcome back, Cyber Hero. Videos can be brilliant, but under the screen there is a belt, and its only job is to keep you watching until hours have quietly slipped away. Here's your mission this week. You're going to learn to spot the belt that picks the next video for you, to ask who would really know before believing a wild claim, to pause, back out and tell when a video is not for you, to name what a fishing comment is really after, and to hear the little bell your own body rings. And here's why that matters so much. Once you can do all of that, no autoplay belt, no shouty claim and no comment hook can decide your afternoon for you. You learn the skill, and you are protected. Grab the ladder, Cyber Hero. Let's begin.",
  11: "Hello, Cyber Hero. Sometimes, even when you are being careful, something lands on your screen that just feels wrong. Before anything else, here is the truth this week is built on: when somebody is unkind to you, that was their choice, and it is never your fault. Here is your mission. You are going to learn to put down the heavy feeling that was never yours, to name the grown-ups who come running before anything is wrong, to starve a mean sender by giving them nothing back, to keep the proof instead of deleting it, and to run the whole calm drill in order: breathe, snap, stop, block, tell. And here is why that matters so much. Once you can do all of that, nothing that lands on your screen can leave you stuck, or silent, or carrying it on your own. You learn the skill, and you are protected. The lighthouse is lit, Cyber Hero. Let us begin.",
  12: "Welcome back, Cyber Hero. Everywhere you go online you leave little tracks behind, like footprints in fresh snow, and out there the snow never melts. Here's your mission this week. You're going to learn to see the print behind every tap and search, to count the copies one share really makes, to hold a post up to the mirror and ask whether older you would be glad it is still there, to stamp the proud and kind version on purpose, and to walk your own trail back with a trusted grown-up. And here's why that matters so much. Once you can do all of that, no bio, no caption and no old post can point a stranger at you, and the trail you leave will be one you are proud of. You learn the skill, and you are protected. Pull your boots on, Cyber Hero. Let's begin.",
  13: "Hello again, Cyber Hero. Let's be clear about something first: screens are brilliant, and nobody here is taking them off you. This week is about their SIZE. Here's your mission. You're going to learn that a level day keeps the fun in and never means none at all, that a day is a jug which never gets any bigger, so every hour you pour into one thing is an hour not going into another, that the easy moment to decide how long is before you start and not halfway in, that stopping well is a thing you can practise, save it, say goodbye, plug it in, and that the last hour before bed belongs to your body. And here's why that matters so much. Once you can do all of that, no screen can quietly eat a whole afternoon, and no argument about stopping ever has to happen again. You learn the skill, and you are protected. The Power Station is warmed up, Cyber Hero. Let's begin.",
  14: "Welcome back, Cyber Hero. These days, all sorts of gadgets can listen and watch — speakers, toys, even the television. This week you'll learn which devices have ears and eyes, and how to keep your secrets safe when they're nearby. Knowing who's listening is a real hero's superpower. Let's switch it on, and begin.",
  15: "Hello, Cyber Hero. Some of the voices you meet online aren't people at all — they're clever robots called chatbots, like ChatGPT. Here's your mission this week. You're going to learn how to tell a robot from a real person, and how to double check anything it tells you before you believe it. And here's why that matters so much. Once you can do that, no chatbot can ever trick you, feed you a fib, or talk you into sharing a secret. You learn the skill, and you are protected. Stay sharp, hero. Let's begin.",
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
