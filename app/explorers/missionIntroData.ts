/**
 * Mission-intro briefings — the per-CASE equivalent of blockIntroData.ts's
 * block-level cards, one per mission (eventually all 20), spoken by ATLAS
 * (ARC Command), same visual language as the block briefing but scoped to a
 * single case: no five-case preview grid (nothing to preview for one case),
 * and the "by the end you'll be able to" checklist is THAT case's own skill
 * list instead of an aggregate across five.
 *
 * Owner, 2026-10-25: "create one of these for the beginning of every single
 * mission... 20, each appropriate for the theme of the mission."
 * Narrator = ATLAS (owner's explicit call — previously ATLAS spoke 4 times
 * total, once per block; this means every mission opens on a short ATLAS
 * brief before WREN picks up for the case itself). PILOT: Case 011 only,
 * for a format sign-off before the other 19 are written and recorded.
 */

import type { BackdropVariant } from "./BlockBackdrop";

export interface MissionTheme {
  accent: string;
  accentHi: string;
  accentRGB: string;
  classification: string;
  matrix: string[];
  backdrop: BackdropVariant;
}

export interface MissionIntroData {
  caseId: string;
  caseNumber: string;
  codename: string;
  title: string;
  thesis: string;
  realWorld: string;
  audio: string;
  /** The literal ElevenLabs script — see blockIntroData.ts's identical field
   *  for why this is kept as the source of truth alongside the clip. */
  voiceScript: string;
  skills: string[];
  beginLabel: string;
  theme: MissionTheme;
}

export const mission11Intro: MissionIntroData = {
  caseId: "explorers-m11",
  caseNumber: "CASE 011",
  codename: "SKELETON KEY",
  title: "The Master Key",
  thesis: "One machine, millions of guesses a second, and every password you own in its sights.",
  realWorld:
    "This is the single most common break-in there is — not a clever trick, just a machine trying password after password until one works. Build a vault that doesn't crack, and this attack fails before it starts.",
  audio: "/audio/atlas/m11-brief.mp3",
  voiceScript:
    "[serious] Agent. SKELETON KEY doesn't guess, it grinds. Millions of attempts a second, every password you've ever reused, every weak one you thought was clever enough. [determined] Today you stop being a guessable target. You're going to build a vault: one master key strong enough to hold forty-one others, and a second lock that turns a stolen password into a dead end. [warm] WREN's got the console ready. [excited] Let's build something that holds.",
  skills: [
    "Why your brain can't do this",
    "Build the master passphrase",
    "Let the vault do the rest",
    "The second lock (2FA)",
    "A code is a key",
    "Know SKELETON KEY's play",
    "Turn it on today",
  ],
  beginLabel: "Begin Case 011 →",
  theme: {
    accent: "#2DD4BF",
    accentHi: "#7FEFE2",
    accentRGB: "45, 212, 191",
    classification: "TOP SECRET",
    matrix: ["#2DD4BF", "#7FEFE2", "#17A398"],
    backdrop: "vault",
  },
};

export const MISSION_INTROS: Record<string, MissionIntroData> = {
  "explorers-m11": mission11Intro,
};
