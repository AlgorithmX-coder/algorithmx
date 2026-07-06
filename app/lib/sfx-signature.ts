/**
 * Signature SFX catalogue - the small set of branded one-off cues
 * that go through ElevenLabs' Sound Effects API instead of being
 * stock chimes. Reserved for moments where a designed cue meaningfully
 * beats a generic chime; we deliberately do NOT use this for every
 * click/hover.
 *
 * Each entry is:
 *   id              - stable key, used in the manifest
 *   prompt          - text description fed to /v1/sound-generation
 *   durationSeconds - capped output length (0.5-22, optional)
 *   promptInfluence - 0=creative, 1=strict-to-prompt (default 0.3)
 *
 * Generator: scripts/elevenlabs-generate-sfx.mjs reads this file as
 * source-of-truth. Idempotent + cached by (id, prompt, duration).
 *
 * Iteration: tweak a prompt here -> re-run generator -> only that one
 * cue regenerates (hash includes the prompt text + duration).
 */

export interface SignatureSfx {
  id: string;
  prompt: string;
  durationSeconds?: number;
  promptInfluence?: number;
  /** Human-readable note for the catalogue page / manifest. */
  description: string;
}

export const SIGNATURE_SFX: readonly SignatureSfx[] = [
  {
    id: "vault-open",
    prompt:
      "Heavy metal vault door unsealing: deep mechanical clunks, hydraulic hiss, single dramatic clang as it unlocks, then a low resonant boom. Cinematic, slightly futuristic, family-friendly tone.",
    durationSeconds: 2.5,
    promptInfluence: 0.45,
    description: "Plays when the Password Vault door swings open at the end of all 5 locks active.",
  },
  {
    id: "vault-reveal",
    prompt:
      "Magical treasure-chamber reveal: cascading bell chimes, ethereal shimmer, soft choir swell, ascending sparkle. Warm, awe-inspiring, kid-friendly fantasy.",
    durationSeconds: 2.5,
    promptInfluence: 0.4,
    description: "Plays when the vault interior treasure chamber becomes visible (the shield core + artifacts).",
  },
  {
    id: "sticker-drop",
    prompt:
      "Playful sticker landing: quick paper-fluttering whoosh, light pop, tiny celebratory chime. Snappy, cute, ~half second.",
    durationSeconds: 0.9,
    promptInfluence: 0.5,
    description: "Plays as each individual sticker lands on its shelf in StickerUnlock.",
  },
  {
    id: "boss-defeated",
    prompt:
      "Triumphant boss defeat stinger: ascending heroic fanfare, victory bells, descending raccoon-like grumble of defeat, bright crystalline finale. Family-friendly, not scary.",
    durationSeconds: 2.5,
    promptInfluence: 0.45,
    description: "Plays when the Hacker Raccoon is defeated at the end of the boss battle.",
  },
  {
    id: "badge-bloom",
    prompt:
      "Golden badge unlock: warm bell-like resonance with shimmer wash, soft heraldic flourish, glowing finale chord. Reward-feel, satisfying, ~1.5 seconds.",
    durationSeconds: 1.5,
    promptInfluence: 0.45,
    description: "Plays when the badge appears in the Mission Complete / completion ceremony.",
  },
  {
    id: "mission-start",
    prompt:
      "Heroic mission briefing sting: brief warm fanfare, ascending chord with light percussion, sparkle finish. Inviting and adventurous, family-friendly, ~1.4 seconds.",
    durationSeconds: 1.4,
    promptInfluence: 0.45,
    description: "Plays on the Mission Brief screen (screen 1) to mark the start of the lesson.",
  },
  {
    id: "hq-entry",
    prompt:
      "Welcoming chamber entrance: soft door-open swoosh, magical entryway swell, distant bell chimes, warm ambient bloom. Friendly, slightly mystical, kid-safe, ~2.5 seconds.",
    durationSeconds: 2.5,
    promptInfluence: 0.4,
    description: "Plays once when the Cyber HQ page (/cyberhq) is opened.",
  },
  {
    id: "mission-complete",
    prompt:
      "Triumphant mission-complete fanfare: bright golden brass chord resolving into a warm major cadence, shimmering bell tail. Celebratory, family-friendly, ~2.5 seconds.",
    durationSeconds: 2.5,
    promptInfluence: 0.45,
    description: "Plays on the final completion screen (screen 22) when the badge ceremony lands.",
  },

  /* ── Week 1 Vault Boss (The Cracking Machine) ───────────────────── */
  {
    id: "vault-word-slam",
    prompt:
      "Giant cartoon word block stamping onto a metal vault door: a short whoosh into one big satisfying rubber-stamp THUNK with a bright confirmation chime tail. Chunky, joyful, kid-friendly, under a second.",
    durationSeconds: 1.0,
    promptInfluence: 0.5,
    description: "VaultBoss BUILD phase: a word block slams onto the vault door.",
  },
  {
    id: "vault-mixer-pop",
    prompt:
      "Fizzy magical transformation pop: a bubbly champagne-cork pop into a quick sparkling shimmer, like letters fizzing and rearranging. Bright, playful, kid-friendly, under a second.",
    durationSeconds: 0.9,
    promptInfluence: 0.5,
    description: "VaultBoss MIX phase: a mixer button transforms the password.",
  },
  {
    id: "vault-forge-charge",
    prompt:
      "Rising power-charge hum: a warm sci-fi charge-up swelling upward with sparkly overtones and a gentle heartbeat pulse, building excitement without tension. Kid-friendly, about two and a half seconds.",
    durationSeconds: 2.5,
    promptInfluence: 0.45,
    description: "VaultBoss FINAL phase: the forge button charges the 400-year password.",
  },
  {
    id: "vault-chomp",
    prompt:
      "Comedic robot chomp: quick mechanical jaw snap with a springy metallic boing and a tiny gulp. Silly cartoon robot eating something, kid-friendly, well under a second.",
    durationSeconds: 0.8,
    promptInfluence: 0.5,
    description: "VaultBoss REEL phase: the Guess-o-Tron devours an obvious password.",
  },
  {
    id: "vault-overload",
    prompt:
      "Cartoon machine overload alarm: muffled industrial klaxon with rising steam-pressure whistle and rattling bolts, comedic not frightening, about a second and a half.",
    durationSeconds: 1.5,
    promptInfluence: 0.45,
    description: "VaultBoss FINAL phase: the CRACK-O-MATIC redlines and starts to overload.",
  },
  {
    id: "vault-detonate",
    prompt:
      "Cartoon machine falling apart in a comedic explosion: springs boinging away, bolts pinging off metal, one soft harmless boom with a whistling spring tail. Funny, family-friendly, about two seconds.",
    durationSeconds: 2.2,
    promptInfluence: 0.45,
    description: "VaultBoss victory: the CRACK-O-MATIC detonates against the 400-year password.",
  },
];
