/*
 * openart-generate.mjs — batch-generate the Cyber Heroes art set.
 *
 * Mirrors the elevenlabs-* scripts: reads its key from the env, holds the
 * locked character refs + house-style prompt prefixes, runs a manifest of
 * jobs, and writes each PNG straight to its public/ path.
 *
 * The manifest is the code form of docs/cyberheroes/image-assets.md.
 *
 * USAGE (run from project root):
 *   node --env-file=.env.local scripts/openart-generate.mjs --dry        # print every prompt+path, no API call
 *   node --env-file=.env.local scripts/openart-generate.mjs --list       # list job ids
 *   node --env-file=.env.local scripts/openart-generate.mjs              # generate ALL
 *   node --env-file=.env.local scripts/openart-generate.mjs --only week-01,adam-head
 *
 * BEFORE IT CAN GENERATE, fill the two CONFIG blanks below:
 *   1. OPENART_API_KEY  -> add to .env.local
 *   2. CHARACTERS.adam/layla/raccoon -> the OpenArt character ids/handles
 * If your working call from the other chat differs from callOpenArt() below,
 * paste it in and we'll swap that one function — everything else stays.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

/* ───────────────────────── CONFIG (fill these) ───────────────────────── */

const API_KEY = process.env.OPENART_API_KEY ?? "";
// The OpenArt endpoints — adjust if your account/working call uses different ones.
const ENDPOINT_CREATE = process.env.OPENART_ENDPOINT ?? "https://api.openart.ai/v1/images/generations";
const MODEL = process.env.OPENART_MODEL ?? "";            // e.g. the model/workflow you tested with

// The locked characters you built in OpenArt. Put their ids/handles here so
// every generation stays on-model. (Exact field name depends on the API —
// see buildBody() below.)
const CHARACTERS = {
  adam: "",     // <- Adam character id/handle
  layla: "",    // <- Layla character id/handle
  raccoon: "",  // <- Hacker Raccoon character id/handle
};

/* ───────────────────────── STYLE PREFIXES ───────────────────────── */
// Match style to job. These lead every prompt; the per-job text follows.

const STYLE = {
  "2d-cutout":
    "2D Pixar-style character render, clean vector-soft shading, friendly, " +
    "FULL TRANSPARENT BACKGROUND (alpha), no scenery, centered, ",
  "3d":
    "high-quality 3D character render, cinematic soft lighting, expressive, " +
    "FULL TRANSPARENT BACKGROUND (alpha), no scenery, centered, ",
  scene:
    "warm 2D Pixar-style full scene illustration, soft cinematic lighting, " +
    "child-friendly (ages 6-9), empowering not scary, ",
};

// Shared safety/brand tail.
const TAIL =
  " Consistent with the locked Cyber Heroes character designs. " +
  "Bright, premium, kid-safe, no text, no watermark.";

/* ───────────────────────── JOB MANIFEST ───────────────────────── */
// id, style, prompt (per-job bit), out (public path), w/h, transparent.

const ALERTS = [
  ["week-01", "Passwords", "a broken padlock on Adam and Layla's tablet while the Hacker Raccoon yanks a glowing PASSWORD key away"],
  ["week-02", "Private Info", "the Hacker Raccoon peeking at an About-Me form spilling Adam and Layla's name, address and school"],
  ["week-03", "Stranger Danger", "a smiling profile picture with the Hacker Raccoon hiding behind the mask, reaching through the screen toward Adam and Layla"],
  ["week-04", "Scams & Tricks", "a flashy YOU WON popup; the Hacker Raccoon dangling a too-good-to-be-true golden prize at Adam and Layla"],
  ["week-05", "Cyberbullying", "gentle scene: mean message bubbles raining down, Layla looks sad while Adam steps in to help"],
  ["week-06", "Gaming Safety", "a video-game chat window; the Hacker Raccoon as a fake player offering a free skin to lure Adam and Layla off-platform"],
  ["week-07", "In-Game Spending", "a loot box and a pile of coins; the Hacker Raccoon at a slot machine flashing FREE coins at Adam and Layla"],
  ["week-08", "Photos & Videos", "a photo escaping into the wild; the Hacker Raccoon grabbing a picture that shows a school uniform and a street sign"],
  ["week-09", "Apps & Downloads", "a copycat app icon; the Hacker Raccoon offering a FREE download with sneaky camera and microphone permission icons"],
  ["week-10", "YouTube & Videos", "an autoplay rabbit-hole of video thumbnails swirling downward; the Hacker Raccoon tugging Adam and Layla into it"],
  ["week-11", "Emergency Protocol", "a big red BLOCK and REPORT button and a trusted grown-up's hand; Adam takes a screenshot as the Hacker Raccoon retreats"],
  ["week-12", "Digital Footprint", "glowing footprints leading across the internet; the Hacker Raccoon following Adam and Layla's trail"],
  ["week-13", "Screen Time", "a clock and moon, tired eyes, a screen-versus-play balance scale; Layla gently powering off a device"],
  ["week-14", "Smart Devices", "a smart speaker, TV, watch and doorbell with little listening ears and eyes; the Hacker Raccoon hiding inside the speaker"],
  ["week-15", "AI & Chatbots", "a friendly-but-fake robot chatbot; the Hacker Raccoon puppeteering it with a confidently-wrong speech bubble, Adam and Layla curious"],
  ["week-16", "QR Codes & Links", "a QR code as a glowing doorway; the Hacker Raccoon slapping a fake QR sticker over a real one"],
  ["week-17", "Social Media", "a phone feed with a 13-plus age gate and follower counts; the Hacker Raccoon as a fake follower watching Adam and Layla"],
  ["week-18", "Sharing Devices", "a shared family tablet still logged in; the Hacker Raccoon sneaking onto the un-logged-out device"],
  ["week-19", "Protecting Family", "Adam and Layla as the experts, helping grown-ups spot a scam; the whole family foiling the Hacker Raccoon"],
  ["week-20", "Graduation", "Adam and Layla in hero capes holding a Cyber Hero certificate and trophy; the Hacker Raccoon defeated; celebratory confetti"],
];

const JOBS = [
  // 1 · Character cutouts (2D, transparent)
  j("adam-head", "2d-cutout", "Adam, head and shoulders, forward, warm friendly smile", "public/game/characters/adam-head.png", 512, 512),
  j("layla-head", "2d-cutout", "Layla, head and shoulders, forward, warm friendly smile", "public/game/characters/layla-head.png", 512, 512),
  j("raccoon-head", "2d-cutout", "the Hacker Raccoon, head only, sneaky grin", "public/game/characters/raccoon-head.png", 256, 256),
  j("adam-cheer", "2d-cutout", "Adam, knee-up, cheering and celebrating, arms up", "public/cyberheroes/characters/adam-cheer.png", 700, 900),
  j("layla-cheer", "2d-cutout", "Layla, knee-up, cheering and celebrating, arms up", "public/cyberheroes/characters/layla-cheer.png", 700, 900),
  j("adam-layla-duo", "2d-cutout", "Adam and Layla standing side by side, friendly welcoming pose", "public/cyberheroes/characters/adam-layla-duo.png", 900, 600),

  // 2 · Villain (3D, transparent) — boss poses are DROP-IN replacements
  j("raccoon-idle", "3d", "the Hacker Raccoon, idle menacing stance facing left, plotting", "public/game/characters/raccoon-idle.png", 1024, 1024),
  j("raccoon-attack", "3d", "the Hacker Raccoon, dynamic lunge with a claw strike, facing left", "public/game/characters/raccoon-attack.png", 1024, 1024),
  j("raccoon-hurt", "3d", "the Hacker Raccoon, recoiling in pain, facing left", "public/game/characters/raccoon-hurt.png", 1024, 1024),
  j("raccoon-taunt", "3d", "the Hacker Raccoon, triumphant mocking taunt, facing left", "public/game/characters/raccoon-taunt.png", 1024, 1024),
  j("raccoon-defeated", "3d", "the Hacker Raccoon, collapsed and stunned, defeated, facing left", "public/game/characters/raccoon-defeated.png", 1024, 1024),
  j("raccoon-villain", "3d", "the Hacker Raccoon, upper body, menacing villain pose", "public/cyberheroes/characters/raccoon-villain.png", 600, 600),

  // 3 · Scene backgrounds (2D scene)
  j("boss-arena", "scene", "a futuristic cyber-lab / server room, neon accents, holographic data streams, violet-cyan-pink palette, empty calm centre for sprites", "public/game/backgrounds/cyber-classroom.png", 1920, 1080, false),
  j("learn-bg", "scene", "a cosy cyber command-center: desk, window, shelf of books labelled Be Smart Be Safe Be a Hero, the Raccoon peeking; calm dim centre so a text panel sits on top", "public/cyberheroes/scenes/learn-command-center.png", 1920, 1080, false),
  j("cyber-hq", "scene", "Adam and Layla standing proud in a bright Cyber HQ lab, an earned badge glowing on a pedestal, celebratory", "public/cyberheroes/scenes/cyber-hq.png", 1920, 1080, false),

  // 3a · Per-week Alert intro photos (2D scene, 4:3)
  ...ALERTS.map(([id, _topic, concept]) =>
    j(id, "scene", concept, `public/cyberheroes/alerts/${id}.png`, 1200, 900, false)
  ),
];

function j(id, style, prompt, out, w, h, transparent = true) {
  return { id, style, prompt, out, w, h, transparent };
}

function fullPrompt(job) {
  return STYLE[job.style] + job.prompt + TAIL;
}

/* ───────────────────────── OPENART CALL (the one integration point) ───────────────────────── */
/*
 * Returns a Buffer of PNG bytes. If your working call from the other chat
 * differs (different endpoint, body shape, or async polling), replace the
 * body of THIS function — nothing else needs to change.
 */
function buildBody(job) {
  return {
    model: MODEL || undefined,
    prompt: fullPrompt(job),
    width: job.w,
    height: job.h,
    transparent_background: job.transparent,
    // Character conditioning — exact field name depends on the API. Common
    // shapes: `character_ids: [...]` or `characters: [...]`. Adjust to match.
    character_ids: pickCharacters(job).filter(Boolean),
  };
}

function pickCharacters(job) {
  const p = (job.prompt + " " + job.id).toLowerCase();
  const ids = [];
  if (p.includes("adam")) ids.push(CHARACTERS.adam);
  if (p.includes("layla")) ids.push(CHARACTERS.layla);
  if (p.includes("raccoon")) ids.push(CHARACTERS.raccoon);
  return ids;
}

async function callOpenArt(job) {
  const res = await fetch(ENDPOINT_CREATE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(buildBody(job)),
  });
  if (!res.ok) {
    throw new Error(`OpenArt ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();

  // Handle both shapes: direct result, or an async job we poll.
  let url = data.url ?? data.image_url ?? data.data?.[0]?.url ?? null;
  if (!url && (data.id || data.job_id)) {
    url = await pollForResult(data.id ?? data.job_id);
  }
  if (data.b64_json ?? data.image_base64) {
    return Buffer.from(data.b64_json ?? data.image_base64, "base64");
  }
  if (!url) throw new Error(`No image URL in response: ${JSON.stringify(data).slice(0, 300)}`);

  const img = await fetch(url);
  if (!img.ok) throw new Error(`download ${img.status} for ${url}`);
  return Buffer.from(await img.arrayBuffer());
}

async function pollForResult(id, tries = 40, delayMs = 3000) {
  const statusUrl = `${ENDPOINT_CREATE.replace(/\/generations$/, "")}/${id}`;
  for (let i = 0; i < tries; i++) {
    await sleep(delayMs);
    const res = await fetch(statusUrl, { headers: { Authorization: `Bearer ${API_KEY}` } });
    if (!res.ok) continue;
    const d = await res.json();
    const url = d.url ?? d.image_url ?? d.data?.[0]?.url ?? null;
    if (url) return url;
    if ((d.status ?? "").toLowerCase() === "failed") throw new Error(`job ${id} failed`);
  }
  throw new Error(`job ${id} timed out`);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ───────────────────────── RUNNER ───────────────────────── */

async function run() {
  const args = process.argv.slice(2);
  const dry = args.includes("--dry");
  const list = args.includes("--list");
  const onlyArg = args.find((a) => a.startsWith("--only"));
  const only = onlyArg ? (onlyArg.split("=")[1] ?? args[args.indexOf(onlyArg) + 1] ?? "").split(",").filter(Boolean) : null;

  let jobs = JOBS;
  if (only && only.length) jobs = jobs.filter((job) => only.includes(job.id));

  if (list) {
    console.log(JOBS.map((job) => `${job.id.padEnd(16)} ${job.style.padEnd(10)} -> ${job.out}`).join("\n"));
    console.log(`\n${JOBS.length} jobs total.`);
    return;
  }

  if (dry) {
    for (const job of jobs) {
      console.log(`\n# ${job.id}  [${job.style}]  ${job.w}x${job.h}  -> ${job.out}`);
      console.log(fullPrompt(job));
    }
    console.log(`\n(${jobs.length} jobs — DRY RUN, nothing generated.)`);
    return;
  }

  // Real generation — needs config.
  const missing = [];
  if (!API_KEY) missing.push("OPENART_API_KEY (.env.local)");
  if (!CHARACTERS.adam || !CHARACTERS.layla || !CHARACTERS.raccoon)
    missing.push("CHARACTERS.adam/layla/raccoon (top of this file)");
  if (missing.length) {
    console.error("Cannot generate yet — fill in:\n  - " + missing.join("\n  - "));
    console.error("\nTip: run with --dry to review every prompt without an API call.");
    process.exit(1);
  }

  let ok = 0;
  for (const job of jobs) {
    try {
      process.stdout.write(`→ ${job.id} … `);
      const bytes = await callOpenArt(job);
      const abs = resolve(process.cwd(), job.out);
      await mkdir(dirname(abs), { recursive: true });
      await writeFile(abs, bytes);
      console.log(`saved ${job.out} (${(bytes.length / 1024).toFixed(0)} KB)`);
      ok++;
    } catch (err) {
      console.log(`FAILED: ${err.message}`);
    }
  }
  console.log(`\nDone: ${ok}/${jobs.length} generated.`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
