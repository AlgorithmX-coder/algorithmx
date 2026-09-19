"use client";

/**
 * THE DEVELOPING TRAY: Week 8 (Photos & Videos) signature exercise, rebuilt as
 * a data-driven, tap-only concept game to the Learn-Loop standard.
 *
 * Darkroom fantasy: a blank photo sits in a developer tray under a grid of
 * film tiles. Three steps, each one only after the last is done:
 *
 *   1. DEVELOP: the child taps every tile; each tap clears that part of the
 *      developer film with a short fade. The WHOLE photo has to be developed
 *      (every corner) before anything else happens: you can't judge a photo
 *      you haven't looked at.
 *   2. SPOT THE LEAKS: the child taps the photo where it gives something away.
 *      The drawn photo hides three leaks around the edges (house number,
 *      school pennant, a friend who never said yes). A found leak gets its red
 *      ring and chip, Sarah reads it, and it stays marked. A tap anywhere else
 *      only wobbles the photo: no penalty, no voice. After 8 s without a find,
 *      the nearest unfound leak softly pulses.
 *   3. DECIDE: two IDENTICAL neutral buttons, SHARE and KEEP, their sides
 *      shuffled once as the step starts. KEEP is right (this photo leaks).
 *      SHARE runs the red-wash teach visuals, then the shared teach panel, and
 *      the two buttons stay for the retry. No timer, no lose state.
 *
 * Content is data-driven (per-leak chip / bullet / read-aloud, every prompt,
 * label, verdict reason and the teach panel are props); the defaults keep the
 * legacy signature mount (`{ onComplete, narration, accent }`) working.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the shared intro
 * (`threat`), Sarah speaks the how-to once as the tray opens (`coachLines`),
 * then each step's read-aloud as it starts and each leak's read-aloud as it is
 * found (audio-only, `recordedOnly`, the board held while she speaks). A right
 * KEEP gets a spoken verdict with its reason ("That's right!" + `why` via the
 * shared VerdictVoice) under the confetti, SHARE speaks through
 * WrongAnswerPanel, and the complete beat speaks the payoff
 * (`completeNarration`). Taps only; nothing drags.
 *
 * Canvas stack (all hi-DPI via setupHiDpiCanvas, logical 720x460):
 *   photo  (bottom)  the illustration, drawn once per size
 *   cover  (middle)  developer film, cleared tile by tile
 *   fx     (top)     found-leak rings / red wash / flash / confetti, rAF loop
 *
 * SKINS. `skin="darkroom"` (the default) is the shipped Week 8 board, byte for
 * byte. `skin="evidence"` keeps every step and repaints the tray as Week 11's
 * EVIDENCE TRAY: what develops is the screenshot the child kept of a mean
 * message (the sender already deleted the original, so it comes up blank on
 * the chat), the three things to spot are what make it good PROOF (who sent
 * it, when it came, what it said, ringed in green rather than alarm red), and
 * the decision is SHOW A GROWN-UP versus DELETE IT. Deleting washes the
 * screenshot blank instead of red: the proof is simply gone. Nothing here
 * blames the child.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { motion, useAnimationControls } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import { setupHiDpiCanvas, getPointerLogicalPos } from "@/app/lib/gameEngine/canvas";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { fisherYates } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as the True-Price Lever.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface TrayLeakCopy { chip: string; bullet: string; readAloud: string }
/** Which world the tray is painted in. "darkroom" = the shipped Week 8 look. */
export type TraySkin = "darkroom" | "evidence";
export interface DevelopingTrayProps {
  /** World paint + board wording. Default "darkroom" = the shipped Week 8 board. */
  skin?: TraySkin;
  leakCopy?: Partial<Record<string, TrayLeakCopy>>;
  developPrompt?: string; developReadAloud?: string;
  spotPrompt?: string; spotReadAloud?: string;
  decidePrompt?: string; decideReadAloud?: string;
  shareLabel?: string; keepLabel?: string;
  why?: string;
  teach?: { title: string; body: string; tip: string };
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  completeTitle?: string; completeLine?: string;
  hints?: { tier1: string; tier2: string };
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
  onComplete: (score?: number) => void;
  onCorrect?: () => void; onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

type Step = "develop" | "spot" | "decide";
type Choice = "share" | "keep";

interface Ring {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface TrayLeak extends TrayLeakCopy {
  id: string;
  /** Ring box in logical photo px: marked when found, pulsed by the red wash. */
  ring: Ring;
  /** Callout chip placement over the photo (percent of the photo). */
  chipLeftPct: number;
  chipTopPct: number;
  /** PixIcon beside the bullet once the leak is found. */
  icon: string;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
  life: number;
}

/**
 * Everything the rAF loop draws, mutated only by handlers and the loop.
 * Handlers queue timed effects with a null start; the loop stamps the start on
 * the first frame that draws them (so no handler ever reads the clock).
 */
interface SceneState {
  /** How far each tile's film has cleared, 0..1. */
  clear: Float32Array;
  /** Tiles mid-fade: tile index -> fade start + length. */
  fades: Map<number, { start: number | null; ms: number }>;
  /** Every tile tapped: the film layer retires once the last fade ends. */
  developed: boolean;
  /** Found leaks, in find order, with their ring pop-in timing. */
  found: { id: string; at: number | null; ms: number }[];
  /** The red wash (a SHARE teach) is showing. */
  wash: boolean;
  washPulse: boolean;
  /** The warm developer flash as the last tile clears. */
  flashQueued: boolean;
  flashStart: number | null;
  particles: Particle[];
}

/* ------------------------------------------------------------------ */
/* Constants + default content (the legacy signature mount)           */
/* ------------------------------------------------------------------ */

const CANVAS_W = 720;
const CANVAS_H = 460;
const PHOTO_MARGIN = 12; // white photo-paper border inside the canvas

// Tap-to-develop tiles: 4 x 3 over the photo (180 x 153 logical px each).
const TILE_COLS = 4;
const TILE_ROWS = 3;
const TOTAL_TILES = TILE_COLS * TILE_ROWS;
const TILE_W = CANVAS_W / TILE_COLS;
const TILE_H = CANVAS_H / TILE_ROWS;
/** Each tile's clear bleeds this far into its neighbours so no seam is left. */
const TILE_OVERLAP = 1.5;
const TILE_FADE_MS = 280;
/** Round 1 teaches the mechanic: this tile (top-left corner, clear of the
 *  film's stamped hint) breathes until the first tap. */
const GUIDE_TILE = 0;

/** Invisible tap target padding around each leak's ring box (logical px). */
const LEAK_PAD = 20;
const RING_POP_MS = 320;
/** Spot step: this long without a find softly pulses the nearest unfound leak. */
const IDLE_GUIDE_MS = 8000;

/** The red wash plays this long before the teach panel covers it. */
const WASH_MS = 1300;
const WASH_MS_REDUCED = 500;
/** A right KEEP holds the confetti on screen at least this long. */
const MIN_WIN_MS = 1800;
const CONFETTI_COUNT = 110;

/**
 * Viewport height everything but the photo needs (HUD, stage and frame
 * padding, header, meter, prompt, buttons). On a short window the photo
 * shrinks to fit instead of pushing the decision below the fold.
 */
const PHOTO_RESERVE_PX = 440;
const TRAY_MAX_W = `calc(max(320px, calc((100dvh - ${PHOTO_RESERVE_PX}px) * ${CANVAS_W} / ${CANVAS_H})) + 24px)`;

const SAFELIGHT = "#ff9d7a";
const GOOD_GREEN = "#34d399";

const CONFETTI_COLORS = [
  "#ffd166",
  "#7df0ff",
  "#ff6b6b",
  "#8bffb0",
  "#c9a7ff",
  "#fff3d6",
];

const FONT_STACK = "'Fredoka', 'Quicksand', ui-rounded, system-ui, sans-serif";

const CANVAS_STYLE = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  display: "block",
} as const;

const LEAKS: readonly TrayLeak[] = [
  {
    id: "house",
    ring: { x: 38, y: 184, w: 92, h: 66 },
    chipLeftPct: ((38 + 46) / CANVAS_W) * 100,
    chipTopPct: ((184 + 66 + 10) / CANVAS_H) * 100,
    icon: "🏠",
    chip: "Your house number!",
    bullet: "Your house number 42 is right there on the door",
    readAloud: "",
  },
  {
    id: "school",
    ring: { x: 534, y: 22, w: 180, h: 92 },
    chipLeftPct: ((534 + 90) / CANVAS_W) * 100,
    chipTopPct: ((22 + 92 + 10) / CANVAS_H) * 100,
    icon: "🏫",
    chip: "Your school name!",
    bullet: "Your school name is on the wall pennant",
    readAloud: "",
  },
  {
    id: "friend",
    ring: { x: 572, y: 302, w: 140, h: 150 },
    chipLeftPct: ((572 + 70) / CANVAS_W) * 100,
    chipTopPct: ((302 - 34) / CANVAS_H) * 100,
    icon: "👤",
    chip: "No YES from your friend!",
    bullet: "Your friend is in the photo, and they never said YES",
    readAloud: "",
  },
];

const RING_BY_ID = new Map(LEAKS.map((leak) => [leak.id, leak.ring] as const));
const NO_TILES: readonly boolean[] = Array.from({ length: TOTAL_TILES }, () => false);
const NO_LEAKS: readonly string[] = [];
const CHOICES: readonly Choice[] = ["share", "keep"];

const DEFAULT_INTRO_SUBTITLE =
  "Tap every tile to develop the photo, spot what it gives away, then decide: SHARE or KEEP.";
const DEFAULT_DEVELOP_PROMPT = "Tap every tile to develop the photo";
const DEFAULT_SPOT_PROMPT = "Now tap everything this photo gives away";
const DEFAULT_DECIDE_PROMPT = "SHARE it, or KEEP it?";
const DEFAULT_WHY =
  "This photo shows your house number, your school name and a friend who never said YES, so keeping it private keeps everyone safe.";
const DEFAULT_TEACH = {
  title: "Whoa, hold on!",
  body: "You almost shared your house number, your school name and a friend who never said YES.",
  tip: "A photo with clues like these should stay private.",
};
const DEFAULT_COMPLETE_LINE = "Look at every corner before a photo goes anywhere.";

/* ------------------------------------------------------------------ */
/* Default content for the "evidence" skin (Week 11, the Lighthouse)  */
/* ------------------------------------------------------------------ */

/** The three things that make the kept screenshot good proof. */
const EVIDENCE_LEAKS: readonly TrayLeak[] = [
  {
    id: "sender",
    ring: { x: 70, y: 18, w: 220, h: 46 },
    chipLeftPct: ((70 + 110) / CANVAS_W) * 100,
    chipTopPct: ((18 + 46 + 8) / CANVAS_H) * 100,
    icon: "👤",
    chip: "Who sent it!",
    bullet: "The sender's name is right there at the top",
    readAloud: "",
  },
  {
    id: "time",
    ring: { x: 280, y: 78, w: 180, h: 34 },
    // Chips sit clear of the message bubble, out to the right of the stamp.
    chipLeftPct: ((280 + 230) / CANVAS_W) * 100,
    chipTopPct: ((78 + 34 + 8) / CANVAS_H) * 100,
    icon: "⏱️",
    chip: "When it came!",
    bullet: "The day and the time are stamped on it",
    readAloud: "",
  },
  {
    id: "words",
    ring: { x: 48, y: 130, w: 372, h: 92 },
    chipLeftPct: ((48 + 492) / CANVAS_W) * 100,
    chipTopPct: ((130 + 45) / CANVAS_H) * 100,
    icon: "💬",
    chip: "What they said!",
    bullet: "The exact words are saved, word for word",
    readAloud: "",
  },
];

const EVIDENCE_INTRO_SUBTITLE =
  "Tap every tile to develop the screenshot you kept, tap the three things that make it good proof, then decide: show a grown-up, or delete it?";
const EVIDENCE_DEVELOP_PROMPT = "Tap every tile to develop the screenshot";
const EVIDENCE_SPOT_PROMPT = "Now tap everything that makes this good proof";
const EVIDENCE_DECIDE_PROMPT = "SHOW A GROWN-UP, or DELETE IT?";
const EVIDENCE_WHY =
  "Your screenshot shows who sent it, when it came and exactly what it said, so a grown-up can help you straight away.";
const EVIDENCE_TEACH = {
  title: "Wait, keep that!",
  body: "The sender already deleted their message, so it comes up blank. Your screenshot is the only proof left.",
  tip: "Keep the proof and show a grown-up you trust.",
};
const EVIDENCE_COMPLETE_LINE = "A screenshot is proof a grown-up can act on.";

/* ------------------------------------------------------------------ */
/* Board wording + paint per skin (the darkroom column is today's)    */
/* ------------------------------------------------------------------ */

interface TraySkinCopy {
  stepDevelop: string; // the step chip, top right
  stepSpot: string;
  stepDecide: string;
  meterDevelop: string; // the meter label per step
  meterSpot: string;
  photoAria: string; // the picture canvas
  tileAria: string; // one film tile
  leakAria: string; // one spot-step target
  coverStamp: string; // the words stamped on the undeveloped film
  coverStampSub: string;
  statTiles: (n: number) => string; // complete-beat stat lines
  statLeaks: (n: number) => string;
}

const TRAY_COPY: Record<TraySkin, TraySkinCopy> = {
  darkroom: {
    stepDevelop: "Develop",
    stepSpot: "Spot the leaks",
    stepDecide: "Decide",
    meterDevelop: "DEVELOPING",
    meterSpot: "LEAKS FOUND",
    photoAria: "A photo in the developing tray",
    tileAria: "Develop this part of the photo",
    leakAria: "Look closer here",
    coverStamp: "TAP TO DEVELOP",
    coverStampSub: "every corner counts",
    statTiles: (n) => `All ${n} tiles developed`,
    statLeaks: (n) => `${n} leak${n === 1 ? "" : "s"} spotted`,
  },
  evidence: {
    stepDevelop: "Develop",
    stepSpot: "Spot the proof",
    stepDecide: "Decide",
    meterDevelop: "DEVELOPING",
    meterSpot: "PROOF FOUND",
    photoAria: "A screenshot in the evidence tray",
    tileAria: "Develop this part of the screenshot",
    leakAria: "Look closer here",
    coverStamp: "TAP TO DEVELOP",
    coverStampSub: "the whole screenshot counts",
    statTiles: (n) => `All ${n} tiles developed`,
    statLeaks: (n) => `${n} proof mark${n === 1 ? "" : "s"} spotted`,
  },
};

interface TraySkinPaint {
  /** The persistent ring around a found mark: shadow pass, then the bright pass. */
  ringShadow: string;
  ringStroke: string;
  /** The callout chip pinned over the picture. */
  chipBg: string;
  /** The wrong-choice wash: "r, g, b" plus its resting and pulse alpha. */
  washRgb: string;
  washAlpha: number;
  washPulseAlpha: number;
  /** The rings pulsed by that wash. */
  washRing: string;
  /** The tray the picture sits in. */
  trayBg: string;
  trayShadow: string;
  /** The little lamp beside the title (darkroom safelight / lighthouse lamp). */
  lampDot: string;
  lampGlow: string;
  titleColor: string;
  meterColor: string;
  promptColor: string;
  bulletColor: string;
  /** The two decision buttons, identical to each other until the pick. */
  choiceBorder: string;
  choiceBg: string;
  choiceColor: string;
}

const TRAY_PAINT: Record<TraySkin, TraySkinPaint> = {
  darkroom: {
    ringShadow: "rgba(70, 14, 14, 0.4)",
    ringStroke: "rgba(255, 82, 82, 0.95)",
    chipBg: "#c92a2a",
    washRgb: "255, 60, 60",
    washAlpha: 0.14,
    washPulseAlpha: 0.06,
    washRing: "rgba(255, 82, 82, 0.95)",
    trayBg: "linear-gradient(180deg, #34161a 0%, #23090d 60%, #1a070a 100%)",
    trayShadow:
      "inset 0 4px 14px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.35), 0 0 0 2px rgba(255, 120, 90, 0.14)",
    lampDot: "radial-gradient(circle, #ff5a5a 0%, #a11515 70%)",
    lampGlow: "0 0 12px 4px rgba(255, 70, 70, 0.45)",
    titleColor: "#ffd9c4",
    meterColor: SAFELIGHT,
    promptColor: "#fff3e8",
    bulletColor: "#ffe3d6",
    choiceBorder: "rgba(255, 217, 196, 0.55)",
    choiceBg: "linear-gradient(180deg, #4a2328 0%, #321519 100%)",
    choiceColor: "#fff3e8",
  },
  evidence: {
    // Proof is a good thing: green rings, and DELETE washes the sheet blank.
    ringShadow: "rgba(6, 58, 40, 0.4)",
    ringStroke: "rgba(52, 211, 153, 0.95)",
    chipBg: "#1f8f63",
    washRgb: "238, 240, 245",
    washAlpha: 0.72,
    washPulseAlpha: 0.08,
    washRing: "rgba(148, 163, 184, 0.85)",
    trayBg: "linear-gradient(180deg, #16263a 0%, #0d1928 60%, #091320 100%)",
    trayShadow:
      "inset 0 4px 14px rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.35), 0 0 0 2px rgba(120, 170, 255, 0.16)",
    lampDot: "radial-gradient(circle, #ffd166 0%, #b57e12 70%)",
    lampGlow: "0 0 12px 4px rgba(255, 200, 80, 0.45)",
    titleColor: "#ffe7bd",
    meterColor: "#ffc978",
    promptColor: "#eef4ff",
    bulletColor: "#e2ecff",
    choiceBorder: "rgba(200, 224, 255, 0.55)",
    choiceBg: "linear-gradient(180deg, #1e3550 0%, #14243a 100%)",
    choiceColor: "#eef4ff",
  },
};

const LEAKS_BY_SKIN: Record<TraySkin, readonly TrayLeak[]> = {
  darkroom: LEAKS,
  evidence: EVIDENCE_LEAKS,
};
const RINGS_BY_SKIN: Record<TraySkin, Map<string, Ring>> = {
  darkroom: RING_BY_ID,
  evidence: new Map(EVIDENCE_LEAKS.map((leak) => [leak.id, leak.ring] as const)),
};

// "read" is only ever entered for a step that has something to read, so the
// spoken gate can never wait on a clip that does not exist (mute-aware).
const readOrIdle = (text?: string): "read" | "idle" => (!isAudioMuted() && text ? "read" : "idle");

const tileCenter = (i: number) => ({
  x: ((i % TILE_COLS) + 0.5) * TILE_W,
  y: (Math.floor(i / TILE_COLS) + 0.5) * TILE_H,
});

const ringCenter = (r: Ring) => ({ x: r.x + r.w / 2, y: r.y + r.h / 2 });

/** A leak's generous tap target: its ring box padded, kept inside the photo. */
function targetPlacement(r: Ring) {
  const x0 = Math.max(0, r.x - LEAK_PAD);
  const y0 = Math.max(0, r.y - LEAK_PAD);
  const x1 = Math.min(CANVAS_W, r.x + r.w + LEAK_PAD);
  const y1 = Math.min(CANVAS_H, r.y + r.h + LEAK_PAD);
  return {
    left: `${(x0 / CANVAS_W) * 100}%`,
    top: `${(y0 / CANVAS_H) * 100}%`,
    width: `${((x1 - x0) / CANVAS_W) * 100}%`,
    height: `${((y1 - y0) / CANVAS_H) * 100}%`,
  };
}

/* ------------------------------------------------------------------ */
/* Canvas draw helpers                                                */
/* ------------------------------------------------------------------ */

function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function starPath(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outer: number,
  inner: number
) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    const px = cx + Math.cos(a) * r;
    const py = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
}

/** Deterministic 0..1 noise so the cover blotches are stable across redraws. */
function prand(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/** The "photo": a kid with a trophy in the center, leaks around the edges. */
function drawPhotoScene(ctx: CanvasRenderingContext2D) {
  const W = CANVAS_W;
  const H = CANVAS_H;
  const M = PHOTO_MARGIN;

  ctx.clearRect(0, 0, W, H);

  // Photo paper (white border all around).
  ctx.fillStyle = "#f7f3ea";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  roundRectPath(ctx, M, M, W - M * 2, H - M * 2, 10);
  ctx.clip();

  // Party wall + floor.
  const wall = ctx.createLinearGradient(0, M, 0, H);
  wall.addColorStop(0, "#ffe9c6");
  wall.addColorStop(1, "#ffd8a2");
  ctx.fillStyle = wall;
  ctx.fillRect(M, M, W - M * 2, H - M * 2);

  ctx.fillStyle = "#c98d5e";
  ctx.fillRect(M, 374, W - M * 2, H - 374 - M);
  ctx.strokeStyle = "rgba(122, 76, 40, 0.35)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const fx = M + 40 + i * 118;
    ctx.beginPath();
    ctx.moveTo(fx, 380);
    ctx.lineTo(fx - 26, H - M);
    ctx.stroke();
  }

  // Bunting across the top.
  ctx.strokeStyle = "rgba(122, 76, 40, 0.55)";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(M, 44);
  ctx.quadraticCurveTo(300, 92, 520, 52);
  ctx.stroke();
  const buntingColors = ["#ff6b6b", "#ffd166", "#7dd9ff", "#8bffb0", "#c9a7ff"];
  for (let i = 0; i < 9; i++) {
    const t = 0.06 + i * 0.105;
    const bx =
      (1 - t) * (1 - t) * M + 2 * (1 - t) * t * 300 + t * t * 520;
    const by = (1 - t) * (1 - t) * 44 + 2 * (1 - t) * t * 92 + t * t * 52;
    ctx.fillStyle = buntingColors[i % buntingColors.length];
    ctx.beginPath();
    ctx.moveTo(bx - 13, by);
    ctx.lineTo(bx + 13, by);
    ctx.lineTo(bx, by + 26);
    ctx.closePath();
    ctx.fill();
  }

  // LEAK 1: front door with the house number 42 (left edge).
  ctx.fillStyle = "#7a5230";
  ctx.fillRect(24, 134, 122, 300);
  ctx.fillStyle = "#3f5f8f";
  ctx.strokeStyle = "#2c4468";
  ctx.lineWidth = 3;
  roundRectPath(ctx, 34, 144, 102, 290, 6);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
  ctx.lineWidth = 2.5;
  roundRectPath(ctx, 48, 262, 74, 74, 6);
  ctx.stroke();
  roundRectPath(ctx, 48, 352, 74, 66, 6);
  ctx.stroke();
  ctx.fillStyle = "#ffd76e";
  ctx.beginPath();
  ctx.arc(124, 306, 5.5, 0, Math.PI * 2);
  ctx.fill();
  // Brass number plaque: the readable leak.
  roundRectPath(ctx, 52, 194, 66, 46, 8);
  ctx.fillStyle = "#f9e9b5";
  ctx.fill();
  ctx.strokeStyle = "#b48a3c";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#4a3411";
  ctx.font = `800 30px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("42", 85, 219);

  // LEAK 2: school pennant (top-right wall).
  ctx.strokeStyle = "#8a6a4a";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(548, 26);
  ctx.lineTo(548, 112);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(552, 34);
  ctx.lineTo(704, 68);
  ctx.lineTo(552, 102);
  ctx.closePath();
  ctx.fillStyle = "#2f7d4f";
  ctx.fill();
  ctx.strokeStyle = "#245f3c";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = "#eaf6ee";
  ctx.textAlign = "left";
  ctx.font = `800 16px ${FONT_STACK}`;
  ctx.fillText("OAKWOOD", 562, 62);
  ctx.font = `700 13px ${FONT_STACK}`;
  ctx.fillText("SCHOOL", 562, 82);

  // LEAK 3: friend peeking in the bottom-right corner.
  // Jumper (school green, matching the pennant).
  roundRectPath(ctx, 582, 392, 130, 62, 26);
  ctx.fillStyle = "#2e8b57";
  ctx.fill();
  ctx.strokeStyle = "#1f5c3c";
  ctx.lineWidth = 3;
  ctx.stroke();
  // Collar.
  ctx.fillStyle = "#eab98d";
  ctx.beginPath();
  ctx.ellipse(646, 396, 22, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  // Head.
  ctx.fillStyle = "#eab98d";
  ctx.beginPath();
  ctx.arc(646, 352, 42, 0, Math.PI * 2);
  ctx.fill();
  // Short dark hair cap.
  ctx.fillStyle = "#2f2a26";
  ctx.beginPath();
  ctx.arc(646, 348, 43, Math.PI * 1.02, Math.PI * 1.98);
  ctx.closePath();
  ctx.fill();
  // Uncertain face: raised brows, dot eyes, wobbly flat mouth.
  ctx.strokeStyle = "#3a2c20";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(624, 336);
  ctx.lineTo(638, 332);
  ctx.moveTo(654, 332);
  ctx.lineTo(668, 336);
  ctx.stroke();
  ctx.fillStyle = "#2b2320";
  ctx.beginPath();
  ctx.arc(632, 348, 4.2, 0, Math.PI * 2);
  ctx.arc(660, 348, 4.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3a2c20";
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.moveTo(632, 370);
  ctx.quadraticCurveTo(646, 365, 660, 370);
  ctx.stroke();
  // Tiny school crest on the jumper.
  roundRectPath(ctx, 634, 416, 24, 26, 5);
  ctx.fillStyle = "#f4e9c9";
  ctx.fill();
  ctx.strokeStyle = "#1f5c3c";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#1f5c3c";
  ctx.font = `800 13px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.fillText("O", 646, 430);
  ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
  ctx.font = `700 10px ${FONT_STACK}`;
  ctx.fillText("OAKWOOD", 685, 448);

  // Center: the kid with the trophy (the fun bit).
  // Trophy glow.
  const glow = ctx.createRadialGradient(360, 108, 8, 360, 108, 86);
  glow.addColorStop(0, "rgba(255, 210, 80, 0.4)");
  glow.addColorStop(1, "rgba(255, 210, 80, 0)");
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(360, 108, 86, 0, Math.PI * 2);
  ctx.fill();

  // Legs + shoes.
  ctx.fillStyle = "#3b6ea5";
  roundRectPath(ctx, 334, 326, 20, 62, 8);
  ctx.fill();
  roundRectPath(ctx, 366, 326, 20, 62, 8);
  ctx.fill();
  ctx.fillStyle = "#2b2320";
  roundRectPath(ctx, 328, 384, 30, 14, 7);
  ctx.fill();
  roundRectPath(ctx, 362, 384, 30, 14, 7);
  ctx.fill();

  // Arms up to the trophy.
  ctx.strokeStyle = "#ffcf9f";
  ctx.lineCap = "round";
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(328, 258);
  ctx.quadraticCurveTo(312, 190, 326, 128);
  ctx.moveTo(392, 258);
  ctx.quadraticCurveTo(408, 190, 394, 128);
  ctx.stroke();

  // Torso (bright tee).
  roundRectPath(ctx, 315, 236, 90, 98, 24);
  ctx.fillStyle = "#ff6b6b";
  ctx.fill();
  ctx.strokeStyle = "#d94f4f";
  ctx.lineWidth = 3;
  ctx.stroke();
  starPath(ctx, 360, 284, 5, 16, 7);
  ctx.fillStyle = "#fff3d6";
  ctx.fill();

  // Head + hair + happy face.
  ctx.fillStyle = "#ffcf9f";
  ctx.beginPath();
  ctx.arc(360, 190, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#5b3a1e";
  ctx.beginPath();
  ctx.arc(360, 184, 47, Math.PI * 1.05, Math.PI * 1.95);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2b2320";
  ctx.beginPath();
  ctx.arc(346, 186, 4.6, 0, Math.PI * 2);
  ctx.arc(374, 186, 4.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#a3502e";
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.arc(360, 198, 15, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 140, 120, 0.5)";
  ctx.beginPath();
  ctx.arc(332, 202, 6, 0, Math.PI * 2);
  ctx.arc(388, 202, 6, 0, Math.PI * 2);
  ctx.fill();

  // Trophy.
  ctx.fillStyle = "#ffc93c";
  ctx.strokeStyle = "#d99a1a";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(330, 76);
  ctx.lineTo(390, 76);
  ctx.quadraticCurveTo(388, 112, 360, 120);
  ctx.quadraticCurveTo(332, 112, 330, 76);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(324, 88, 12, Math.PI * 0.4, Math.PI * 1.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(396, 88, 12, Math.PI * 1.4, Math.PI * 0.6);
  ctx.stroke();
  ctx.fillStyle = "#ffc93c";
  ctx.fillRect(353, 118, 14, 14);
  roundRectPath(ctx, 338, 132, 44, 12, 5);
  ctx.fill();
  ctx.stroke();
  starPath(ctx, 360, 94, 5, 11, 4.5);
  ctx.fillStyle = "#fff6d8";
  ctx.fill();

  // Hands over the trophy handles.
  ctx.fillStyle = "#ffcf9f";
  ctx.beginPath();
  ctx.arc(324, 118, 11, 0, Math.PI * 2);
  ctx.arc(396, 118, 11, 0, Math.PI * 2);
  ctx.fill();

  // Confetti flecks in the air around the middle.
  for (let i = 0; i < 16; i++) {
    const cx = 200 + prand(i * 3 + 1) * 320;
    const cy = 70 + prand(i * 3 + 2) * 210;
    // Keep flecks off the leaks so they stay legible.
    if (cx > 520 && cy < 130) continue;
    ctx.fillStyle = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(prand(i * 7 + 3) * Math.PI);
    ctx.fillRect(-4, -2.5, 8, 5);
    ctx.restore();
  }

  // Soft photo vignette so it reads as a printed picture.
  const vig = ctx.createRadialGradient(
    W / 2,
    H / 2,
    H * 0.35,
    W / 2,
    H / 2,
    H * 0.72
  );
  vig.addColorStop(0, "rgba(90, 60, 20, 0)");
  vig.addColorStop(1, "rgba(90, 60, 20, 0.18)");
  ctx.fillStyle = vig;
  ctx.fillRect(M, M, W - M * 2, H - M * 2);

  ctx.restore();
}

/**
 * The "evidence" skin's picture: the screenshot the child kept of a mean
 * message. The proof marks are the sender at the top, the time stamp under it
 * and the words themselves; the sender's own message below has already been
 * deleted, so it comes up blank.
 */
function drawEvidenceScene(ctx: CanvasRenderingContext2D) {
  const W = CANVAS_W;
  const H = CANVAS_H;
  const M = PHOTO_MARGIN;

  ctx.clearRect(0, 0, W, H);

  // Photo paper (white border all around), same as the darkroom print.
  ctx.fillStyle = "#f7f3ea";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  roundRectPath(ctx, M, M, W - M * 2, H - M * 2, 10);
  ctx.clip();

  // The chat app behind everything.
  ctx.fillStyle = "#eef2f8";
  ctx.fillRect(M, M, W - M * 2, H - M * 2);

  // PROOF 1: the app header with who sent it.
  ctx.fillStyle = "#2c4a7a";
  ctx.fillRect(M, M, W - M * 2, 70 - M);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(48, 32);
  ctx.lineTo(36, 42);
  ctx.lineTo(48, 52);
  ctx.stroke();
  ctx.fillStyle = "#9fb6d6";
  ctx.beginPath();
  ctx.arc(92, 42, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2c4a7a";
  ctx.beginPath();
  ctx.arc(92, 37, 6.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(92, 58, 12, Math.PI * 1.15, Math.PI * 1.85);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.font = `800 22px ${FONT_STACK}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillText("buzzkid_99", 118, 42);

  // PROOF 2: the day and time stamp.
  roundRectPath(ctx, 288, 80, 164, 30, 15);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#d8e0ec";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#4a5a72";
  ctx.font = `700 16px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.fillText("Today 7:42 pm", 370, 96);

  // PROOF 3: the message itself, word for word.
  roundRectPath(ctx, 52, 134, 364, 84, 18);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#d8e0ec";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = "#2a3446";
  ctx.font = `700 20px ${FONT_STACK}`;
  ctx.textAlign = "left";
  ctx.fillText("You can't play with us any more.", 72, 163);
  ctx.fillText("Don't tell anyone.", 72, 193);

  // The sender's next message: already deleted, so it comes up blank.
  ctx.save();
  ctx.setLineDash([9, 8]);
  roundRectPath(ctx, 52, 246, 320, 70, 18);
  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.fill();
  ctx.strokeStyle = "#b9c3d3";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = "#94a2b8";
  ctx.font = `700 17px ${FONT_STACK}`;
  ctx.fillText("This message was deleted", 74, 281);

  // A little "this is a screenshot" badge in the corner.
  roundRectPath(ctx, 512, 330, 188, 44, 14);
  ctx.fillStyle = "#dfe6f2";
  ctx.fill();
  ctx.strokeStyle = "#b9c3d3";
  ctx.lineWidth = 2;
  ctx.stroke();
  roundRectPath(ctx, 528, 342, 30, 22, 5);
  ctx.fillStyle = "#4a5a72";
  ctx.fill();
  ctx.fillStyle = "#dfe6f2";
  ctx.beginPath();
  ctx.arc(543, 353, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a5a72";
  ctx.font = `800 15px ${FONT_STACK}`;
  ctx.fillText("SCREENSHOT", 570, 353);

  // The message box at the bottom, so it reads as a real chat.
  roundRectPath(ctx, 52, 392, 596, 46, 23);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.strokeStyle = "#d8e0ec";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#a9b4c6";
  ctx.font = `700 17px ${FONT_STACK}`;
  ctx.fillText("Message", 74, 415);
  ctx.fillStyle = "#2c4a7a";
  ctx.beginPath();
  ctx.arc(672, 415, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(664, 405);
  ctx.lineTo(683, 415);
  ctx.lineTo(664, 425);
  ctx.closePath();
  ctx.fill();

  // The same soft vignette, so it still reads as paper in the tray.
  const vig = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.72);
  vig.addColorStop(0, "rgba(40, 50, 70, 0)");
  vig.addColorStop(1, "rgba(40, 50, 70, 0.16)");
  ctx.fillStyle = vig;
  ctx.fillRect(M, M, W - M * 2, H - M * 2);

  ctx.restore();
}

/** The undeveloped "film": milky chemical wash hiding the photo. */
function drawCoverScene(
  ctx: CanvasRenderingContext2D,
  /** The words stamped on the film. Defaults: the shipped darkroom stamp. */
  stamp = "TAP TO DEVELOP",
  stampSub = "every corner counts"
) {
  const W = CANVAS_W;
  const H = CANVAS_H;

  ctx.clearRect(0, 0, W, H);
  const base = ctx.createLinearGradient(0, 0, 0, H);
  base.addColorStop(0, "#ded4c2");
  base.addColorStop(1, "#c6baa4");
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, W, H);

  // Chemical blotches (stable pseudo-random).
  for (let i = 0; i < 26; i++) {
    const bx = prand(i * 5 + 11) * W;
    const by = prand(i * 5 + 12) * H;
    const br = 26 + prand(i * 5 + 13) * 56;
    ctx.fillStyle =
      i % 2 === 0 ? "rgba(120, 105, 80, 0.07)" : "rgba(255, 255, 255, 0.07)";
    ctx.beginPath();
    ctx.ellipse(bx, by, br, br * 0.7, prand(i * 5 + 14) * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Diagonal liquid sheen.
  const sheen = ctx.createLinearGradient(0, 0, W, H);
  sheen.addColorStop(0.32, "rgba(255, 255, 255, 0)");
  sheen.addColorStop(0.5, "rgba(255, 255, 255, 0.1)");
  sheen.addColorStop(0.68, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, W, H);

  // Edge darkening so the film reads as paper sitting in fluid.
  ctx.strokeStyle = "rgba(90, 75, 55, 0.35)";
  ctx.lineWidth = 10;
  roundRectPath(ctx, 3, 3, W - 6, H - 6, 12);
  ctx.stroke();

  // Faint stamped hint on the film itself.
  ctx.fillStyle = "rgba(90, 75, 55, 0.4)";
  ctx.font = `800 27px ${FONT_STACK}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(stamp, W / 2, H / 2 - 12);
  ctx.font = `700 16px ${FONT_STACK}`;
  ctx.fillStyle = "rgba(90, 75, 55, 0.32)";
  ctx.fillText(stampSub, W / 2, H / 2 + 22);
}

/** Repaint the film, then clear each tile by how far it has developed. */
function paintCover(
  ctx: CanvasRenderingContext2D,
  clear: Float32Array,
  stamp?: string,
  stampSub?: string
) {
  drawCoverScene(ctx, stamp, stampSub);
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000000";
  for (let i = 0; i < TOTAL_TILES; i++) {
    const a = clear[i];
    if (a <= 0) continue;
    ctx.globalAlpha = Math.min(1, a);
    const col = i % TILE_COLS;
    const row = Math.floor(i / TILE_COLS);
    ctx.fillRect(
      col * TILE_W - TILE_OVERLAP,
      row * TILE_H - TILE_OVERLAP,
      TILE_W + TILE_OVERLAP * 2,
      TILE_H + TILE_OVERLAP * 2
    );
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function DevelopingTray({
  skin = "darkroom",
  leakCopy,
  developPrompt = skin === "evidence" ? EVIDENCE_DEVELOP_PROMPT : DEFAULT_DEVELOP_PROMPT,
  developReadAloud = "",
  spotPrompt = skin === "evidence" ? EVIDENCE_SPOT_PROMPT : DEFAULT_SPOT_PROMPT,
  spotReadAloud = "",
  decidePrompt = skin === "evidence" ? EVIDENCE_DECIDE_PROMPT : DEFAULT_DECIDE_PROMPT,
  decideReadAloud = "",
  shareLabel = skin === "evidence" ? "DELETE IT" : "SHARE",
  keepLabel = skin === "evidence" ? "SHOW A GROWN-UP" : "KEEP",
  why = skin === "evidence" ? EVIDENCE_WHY : DEFAULT_WHY,
  teach = skin === "evidence" ? EVIDENCE_TEACH : DEFAULT_TEACH,
  introTitle = skin === "evidence" ? "The Evidence Tray" : "The Developing Tray",
  introSubtitle = skin === "evidence" ? EVIDENCE_INTRO_SUBTITLE : DEFAULT_INTRO_SUBTITLE,
  introIcon = skin === "evidence" ? "📸" : "🔍",
  completeTitle = skin === "evidence" ? "Proof developed and saved!" : "Photo developed, leaks spotted!",
  completeLine = skin === "evidence" ? EVIDENCE_COMPLETE_LINE : DEFAULT_COMPLETE_LINE,
  hints,
  narration,
  coachLines,
  threat,
  completeNarration,
  accent,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: DevelopingTrayProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const themeAccent = useLessonTheme()?.accent;
  const tint = accent ?? themeAccent ?? SAFELIGHT;
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;
  const photoControls = useAnimationControls();
  // Board wording, paint and marks for this skin; the darkroom column is the
  // shipped copy and the shipped LEAKS array itself.
  const t = TRAY_COPY[skin];
  const paint = TRAY_PAINT[skin];
  const skinLeaks = LEAKS_BY_SKIN[skin];

  // The built-in leaks, with any per-leak copy from the week file on top.
  const leaks = useMemo<TrayLeak[]>(
    () =>
      skinLeaks.map((leak) => {
        const copy = leakCopy?.[leak.id];
        return copy ? { ...leak, chip: copy.chip, bullet: copy.bullet, readAloud: copy.readAloud } : leak;
      }),
    [leakCopy, skinLeaks]
  );

  const [showIntro, setShowIntro] = useState(true);
  const [developed, setDeveloped] = useState<readonly boolean[]>(NO_TILES);
  const [found, setFound] = useState<readonly string[]>(NO_LEAKS);
  // SHARE / KEEP sides, shuffled once as the decide step starts.
  const [order, setOrder] = useState<readonly Choice[]>(CHOICES);
  // Read-aloud chain: the how-to once as the tray opens, each step as it
  // starts ("read"), each leak as it is found ("leak"). The board is held
  // while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "leak" | "idle">("idle");
  const [readLeakId, setReadLeakId] = useState<string | null>(null);
  // Spot step guide: the unfound leak that softly pulses after an idle spell.
  const [guideId, setGuideId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  // SHARE's red wash is playing (before and under the teach panel).
  const [washing, setWashing] = useState(false);
  // KEEP was chosen: the verdict plays, then the complete beat once she has
  // finished AND the confetti has had its moment.
  const [sealed, setSealed] = useState(false);
  const [verdictHeard, setVerdictHeard] = useState(false);
  const [confettiShown, setConfettiShown] = useState(false);
  const [wrongs, setWrongs] = useState(0);
  const finished = verdictHeard && confettiShown;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const photoRef = useRef<HTMLCanvasElement | null>(null);
  const coverRef = useRef<HTMLCanvasElement | null>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const coverCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const fxCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const sceneRef = useRef<SceneState>({
    clear: new Float32Array(TOTAL_TILES),
    fades: new Map(),
    developed: false,
    found: [],
    wash: false,
    washPulse: true,
    flashQueued: false,
    flashStart: null,
    particles: [],
  });
  // Where the child last looked (logical px): "nearest" for the leak guide.
  const lastTapRef = useRef({ x: CANVAS_W / 2, y: CANVAS_H / 2 });
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const developedCount = developed.filter(Boolean).length;
  const allDeveloped = developedCount >= TOTAL_TILES;
  const allFound = found.length >= leaks.length;
  // The decision appears once the last leak has been read out.
  const step: Step = !allDeveloped ? "develop" : !allFound || narr === "leak" ? "spot" : "decide";
  // Round 1 teaches the mechanic only: one tile breathes until the first tap.
  const guided = developedCount === 0;

  // Spoken verdicts: Sarah says "That's right!" + why on KEEP and the complete
  // beat waits for her. SHARE speaks through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback;

  // Safety releases for the spoken gate (never leave the tray held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Hint tiers reported once each (for the parent dashboard).
  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongs >= 2 ? 2 : wrongs >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongs, onHintReached]);

  /* ---------------- canvases ---------------- */

  // Set up (and re-set up on resize) all three layers, replaying the film.
  useEffect(() => {
    const setup = () => {
      const photo = photoRef.current;
      const cover = coverRef.current;
      const fxCanvas = fxCanvasRef.current;
      if (!photo || !cover || !fxCanvas) return;
      const opts = { logicalWidth: CANVAS_W, logicalHeight: CANVAS_H, maxDpr: 2 };
      const ps = setupHiDpiCanvas(photo, opts);
      const cs = setupHiDpiCanvas(cover, opts);
      const fs = setupHiDpiCanvas(fxCanvas, opts);
      if (!ps || !cs || !fs) return;
      coverCtxRef.current = cs.ctx;
      fxCtxRef.current = fs.ctx;
      if (skin === "evidence") drawEvidenceScene(ps.ctx);
      else drawPhotoScene(ps.ctx);
      const scene = sceneRef.current;
      if (scene.developed && scene.fades.size === 0) cs.ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
      else paintCover(cs.ctx, scene.clear, TRAY_COPY[skin].coverStamp, TRAY_COPY[skin].coverStampSub);
    };
    let lastW = -1;
    const wrap = wrapRef.current;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      if (Math.abs(w - lastW) < 2) return;
      lastW = w;
      setup();
    });
    if (wrap) ro.observe(wrap);
    return () => ro.disconnect();
  }, [skin]);

  // One rAF loop: tile fades on the film, then rings / wash / flash / confetti.
  useEffect(() => {
    let raf = 0;
    let lastNow = performance.now();
    // Resolved once per mount: the skin never changes under a live board.
    const copy = TRAY_COPY[skin];
    const skinPaint = TRAY_PAINT[skin];
    const rings = RINGS_BY_SKIN[skin];
    const marks = LEAKS_BY_SKIN[skin];
    const loop = (now: number) => {
      const dt = Math.min(0.05, Math.max(0, now - lastNow) / 1000);
      lastNow = now;
      const scene = sceneRef.current;

      // The developer film: each tapped tile fades clear.
      if (scene.fades.size > 0) {
        for (const [i, f] of scene.fades) {
          if (f.start === null) f.start = now;
          const k = f.ms <= 0 ? 1 : Math.min(1, Math.max(0, now - f.start) / f.ms);
          scene.clear[i] = k;
          if (k >= 1) scene.fades.delete(i);
        }
        const cctx = coverCtxRef.current;
        if (cctx) paintCover(cctx, scene.clear, copy.coverStamp, copy.coverStampSub);
        if (scene.fades.size === 0 && scene.developed) {
          // Every tile clear: retire the film layer entirely.
          const cover = coverRef.current;
          if (cover) {
            cover.style.transition = "opacity 300ms ease";
            cover.style.opacity = "0";
          }
        }
      }

      const ctx = fxCtxRef.current;
      if (ctx) {
        ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

        // Found leaks stay marked: each ring pops in, then holds.
        for (const mark of scene.found) {
          const ring = rings.get(mark.id);
          if (!ring) continue;
          if (mark.at === null) mark.at = now;
          const k = mark.ms <= 0 ? 1 : Math.min(1, Math.max(0, now - mark.at) / mark.ms);
          const ease = 1 - (1 - k) * (1 - k);
          const grow = (1 - ease) * 16;
          ctx.save();
          ctx.globalAlpha = 0.2 + 0.8 * ease;
          roundRectPath(ctx, ring.x - grow, ring.y - grow, ring.w + grow * 2, ring.h + grow * 2, 14);
          ctx.strokeStyle = skinPaint.ringShadow;
          ctx.lineWidth = 9;
          ctx.stroke();
          ctx.strokeStyle = skinPaint.ringStroke;
          ctx.lineWidth = 5;
          ctx.stroke();
          ctx.restore();
        }

        // The wrong-choice wash: the picture tints and every mark's ring pulses.
        if (scene.wash) {
          const pulse = scene.washPulse ? Math.sin(now / 280) : 0;
          ctx.fillStyle = `rgba(${skinPaint.washRgb}, ${(skinPaint.washAlpha + skinPaint.washPulseAlpha * pulse).toFixed(3)})`;
          ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
          ctx.strokeStyle = skinPaint.washRing;
          ctx.lineWidth = 4.5 + 1.5 * pulse;
          for (const leak of marks) {
            roundRectPath(ctx, leak.ring.x, leak.ring.y, leak.ring.w, leak.ring.h, 14);
            ctx.stroke();
          }
        }

        // The warm developer flash as the last tile clears.
        if (scene.flashQueued) {
          scene.flashQueued = false;
          scene.flashStart = now;
        }
        if (scene.flashStart !== null) {
          const t = now - scene.flashStart;
          if (t > 750) {
            scene.flashStart = null;
          } else {
            ctx.fillStyle = `rgba(255, 243, 214, ${(0.55 * (1 - t / 750)).toFixed(3)})`;
            ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
          }
        }

        // Confetti over the kept photo.
        if (scene.particles.length > 0) {
          const alive: Particle[] = [];
          for (const p of scene.particles) {
            p.life -= dt;
            if (p.life <= 0 || p.y > CANVAS_H + 30) continue;
            p.vy += 300 * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.rot += p.vr * dt;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.globalAlpha = Math.min(1, p.life / 0.6);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 3, p.size, p.size * 0.66);
            ctx.restore();
            alive.push(p);
          }
          scene.particles = alive;
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [skin]);

  // Spot step guide: after an idle spell with no new find (Sarah not
  // speaking), softly pulse the unfound leak nearest to where the child last
  // looked. Every find restarts the wait.
  useEffect(() => {
    if (showIntro || step !== "spot" || speaking) return;
    const id = window.setTimeout(() => {
      const from = lastTapRef.current;
      let best: string | null = null;
      let bestDist = Number.POSITIVE_INFINITY;
      for (const leak of skinLeaks) {
        if (found.includes(leak.id)) continue;
        const c = ringCenter(leak.ring);
        const dist = Math.hypot(c.x - from.x, c.y - from.y);
        if (dist < bestDist) {
          bestDist = dist;
          best = leak.id;
        }
      }
      setGuideId(best);
    }, IDLE_GUIDE_MS);
    return () => window.clearTimeout(id);
  }, [showIntro, step, speaking, found, skinLeaks]);

  /* ---------------- beats ---------------- */

  const startBoard = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : readOrIdle(developReadAloud));
  };

  /* Step 1: develop, one tile per tap. */
  const tapTile = (i: number) => {
    if (showIntro || speaking || developed[i]) return;
    audio.tap();
    const next = developed.map((done, k) => done || k === i);
    setDeveloped(next);
    const scene = sceneRef.current;
    scene.fades.set(i, { start: null, ms: reduce ? 0 : TILE_FADE_MS });
    lastTapRef.current = tileCenter(i);
    if (next.every(Boolean)) {
      // Every corner developed: a warm developer flash, then spot the leaks.
      scene.developed = true;
      if (!reduce) scene.flashQueued = true;
      audio.heal();
      setNarr(readOrIdle(spotReadAloud));
    }
  };

  /* Step 2: spot the leaks. */
  const tapLeak = (leak: TrayLeak) => {
    if (showIntro || step !== "spot" || speaking || found.includes(leak.id)) return;
    audio.correct();
    const next = [...found, leak.id];
    setFound(next);
    setGuideId(null);
    lastTapRef.current = ringCenter(leak.ring);
    sceneRef.current.found.push({ id: leak.id, at: null, ms: reduce ? 0 : RING_POP_MS });
    const last = next.length >= leaks.length;
    // The last find starts the decide step: its two sides are chosen here, once.
    if (last) setOrder(fisherYates(CHOICES));
    if (readOrIdle(leak.readAloud) === "read") {
      setReadLeakId(leak.id);
      setNarr("leak");
    } else if (last) {
      setNarr(readOrIdle(decideReadAloud));
    }
  };

  // A leak's read-aloud ended: after the last one, Sarah reads the decision.
  const afterLeak = () => setNarr(found.length >= leaks.length ? readOrIdle(decideReadAloud) : "idle");

  // A tap that is not on a leak: a tiny wobble, no penalty, no voice.
  const missTap = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (showIntro || step !== "spot" || speaking) return;
    audio.hover();
    const photo = photoRef.current;
    if (photo) lastTapRef.current = getPointerLogicalPos(photo, e, CANVAS_W, CANVAS_H);
    if (!reduce) void photoControls.start({ x: [0, -5, 5, -3, 3, 0], transition: { duration: 0.35 } });
  };

  /* Step 3: decide. */
  const launchConfetti = () => {
    const count = Math.round(CONFETTI_COUNT * intensity);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: CANVAS_W * (0.15 + 0.7 * Math.random()),
        y: -20 - Math.random() * 60,
        vx: (Math.random() - 0.5) * 170,
        vy: 70 + Math.random() * 190,
        size: 6 + Math.random() * 7,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 9,
        life: 2 + Math.random() * 1.3,
      });
    }
    sceneRef.current.particles = particles;
  };

  const stars = wrongs === 0 ? 3 : wrongs === 1 ? 2 : 1;
  const score = stars === 3 ? 100 : stars === 2 ? 70 : 40;

  // The verdict has been heard: a short beat, then the complete beat (which
  // also waits for the confetti's minimum time on screen).
  const finish = () => {
    later(() => setVerdictHeard(true), reduce ? 200 : 900);
  };

  const complete = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete(score);
  };

  const choose = (share: boolean) => {
    if (step !== "decide" || speaking || washing || sealed) return;
    const wasCorrect = !share;
    onAnswered?.({ questionKey: "tray-decide", selectedIndex: share ? 0 : 1, correctIndex: 1, wasCorrect });

    if (wasCorrect) {
      setSealed(true);
      // fx.correct plays its own chime (no audio.correct() here).
      fx.correct({ xp: 25, text: "GOOD CALL!" });
      onCorrect?.();
      launchConfetti();
      later(() => setConfettiShown(true), reduce ? 400 : MIN_WIN_MS);
      // Sarah: "That's right!" + why, one take; the complete beat waits.
      verdict.say("right", why, finish);
      return;
    }

    // SHARE: the red wash shows what would have gone out, then the teach
    // panel. Both buttons stay for the retry.
    audio.wrong();
    onWrong?.();
    const prior = wrongs;
    setWrongs(prior + 1);
    setWashing(true);
    const scene = sceneRef.current;
    scene.wash = true;
    scene.washPulse = !reduce;
    const panel = {
      title: teach.title,
      explanation: teach.body,
      tip: hints ? (prior >= 1 ? hints.tier2 : hints.tier1) : teach.tip,
    };
    later(() => setFeedback(panel), reduce ? WASH_MS_REDUCED : WASH_MS);
  };

  const closePanel = () => {
    setFeedback(null);
    setWashing(false);
    sceneRef.current.wash = false;
  };

  /* ---------------- per-step copy ---------------- */

  const stepName = step === "develop" ? t.stepDevelop : step === "spot" ? t.stepSpot : t.stepDecide;
  const prompt = step === "develop" ? developPrompt : step === "spot" ? spotPrompt : decidePrompt;
  const promptIcon = step === "develop" ? "👆" : step === "spot" ? "🔍" : "👀";
  const stepRead = step === "develop" ? developReadAloud : step === "spot" ? spotReadAloud : decideReadAloud;
  const readingLeak = narr === "leak" ? leaks.find((l) => l.id === readLeakId) : undefined;

  const meterLabel = step === "develop" ? t.meterDevelop : t.meterSpot;
  const meterDone = step === "develop" ? developedCount : found.length;
  const meterTotal = step === "develop" ? TOTAL_TILES : leaks.length;
  const meterFull = meterDone >= meterTotal;

  /* ---------------- render ---------------- */

  return (
    <ExerciseFrame maxWidth={880} padding={24} decor>
      {fx.layer()}
      {verdict.element}

      {/* Sarah's read-alouds (audio only): the how-to once, each step as it starts, each leak as it is found. */}
      {!showIntro && !finished && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="dt-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={tint} recordedOnly onDone={() => setNarr(readOrIdle(developReadAloud))} />
          )}
          {narr === "read" && stepRead && (
            <InfoNarration key={`dt-read-${step}`} speaker={voice} lines={[stepRead]} accent={tint} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "leak" && readingLeak?.readAloud && (
            <InfoNarration key={`dt-leak-${readingLeak.id}`} speaker={voice} lines={[readingLeak.readAloud]} accent={tint} recordedOnly onDone={afterLeak} />
          )}
        </div>
      )}

      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* ------------ header: the game, and the step the child is on ------------ */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            // Side padding keeps the header clear of the frame's corner ornaments.
            padding: "2px 22px 0",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              fontWeight: 900,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: paint.titleColor,
            }}
          >
            {/* The darkroom safelight */}
            <motion.span
              aria-hidden
              animate={reduce ? { opacity: 1 } : { opacity: [0.55, 1, 0.55] }}
              transition={reduce ? undefined : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              style={{
                display: "inline-block",
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: paint.lampDot,
                boxShadow: paint.lampGlow,
                flexShrink: 0,
              }}
            />
            {introTitle}
          </span>
          <span
            aria-live="polite"
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: tint,
            }}
          >
            {stepName}
          </span>
        </div>

        {/* ------------ the tray ------------ */}
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: TRAY_MAX_W,
            margin: "0 auto",
            borderRadius: 20,
            padding: 12,
            background: paint.trayBg,
            boxShadow: paint.trayShadow,
          }}
        >
          {/* The photo: canvas stack + the step's tap layer */}
          <motion.div
            ref={wrapRef}
            animate={photoControls}
            style={{
              position: "relative",
              width: "100%",
              aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: "inset 0 0 22px rgba(0, 0, 0, 0.45)",
              // Chips size with the photo (cqw), so they keep their placement.
              containerType: "inline-size",
              touchAction: "manipulation",
            }}
          >
            <canvas ref={photoRef} role="img" aria-label={t.photoAria} style={CANVAS_STYLE} />
            <canvas ref={coverRef} aria-hidden style={CANVAS_STYLE} />
            <canvas ref={fxCanvasRef} aria-hidden style={{ ...CANVAS_STYLE, pointerEvents: "none" }} />

            {/* Step 1: the film tiles. A developed tile leaves an inert gap. */}
            {step === "develop" && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  gridTemplateColumns: `repeat(${TILE_COLS}, 1fr)`,
                  gridTemplateRows: `repeat(${TILE_ROWS}, 1fr)`,
                }}
              >
                {developed.map((done, i) => {
                  if (done) return <div key={i} aria-hidden />;
                  const held = showIntro || speaking;
                  const glow = guided && i === GUIDE_TILE && !held;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={t.tileAria}
                      disabled={held}
                      onClick={() => tapTile(i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: 0,
                        padding: 0,
                        border: "none",
                        borderRadius: 0,
                        background: "transparent",
                        color: "inherit",
                        fontFamily: "inherit",
                        cursor: held ? "wait" : "pointer",
                        boxShadow: glow
                          ? "inset 0 0 0 3px rgba(255, 170, 60, 0.95), inset 0 0 18px rgba(255, 200, 90, 0.35)"
                          : "inset 0 0 0 1px rgba(90, 75, 55, 0.3)",
                        animation: glow && !reduce ? "dtTileGuide 1.4s ease-in-out infinite" : undefined,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      {glow && <PixIcon emoji="👆" size={40} />}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: generous invisible targets over each leak; a miss only wobbles. */}
            {step === "spot" && (
              <>
                {/* Same cursor as the targets, so hovering never reveals where a leak is. */}
                <div
                  aria-hidden
                  onClick={missTap}
                  style={{ position: "absolute", inset: 0, cursor: speaking ? "wait" : "pointer" }}
                />
                {leaks.map((leak) => {
                  const place = targetPlacement(leak.ring);
                  // A found leak stays marked; re-tapping it does nothing.
                  if (found.includes(leak.id)) {
                    return (
                      <div
                        key={leak.id}
                        aria-hidden
                        style={{ position: "absolute", ...place, cursor: speaking ? "wait" : "pointer" }}
                      />
                    );
                  }
                  const glow = guideId === leak.id && !speaking;
                  return (
                    <button
                      key={leak.id}
                      type="button"
                      aria-label={t.leakAria}
                      disabled={speaking}
                      onClick={() => tapLeak(leak)}
                      style={{
                        position: "absolute",
                        ...place,
                        margin: 0,
                        padding: 0,
                        border: "none",
                        borderRadius: 16,
                        background: glow ? "rgba(255, 214, 110, 0.16)" : "transparent",
                        cursor: speaking ? "wait" : "pointer",
                        boxShadow: glow ? "0 0 0 3px rgba(255, 150, 60, 0.9), 0 0 14px rgba(255, 150, 60, 0.45)" : "none",
                        animation: glow && !reduce ? "dtLeakGuide 1.6s ease-in-out infinite" : undefined,
                        WebkitTapHighlightColor: "transparent",
                      }}
                    />
                  );
                })}
              </>
            )}

            {/* Found leaks: the callout chip at its spot, kept for the rest of the game. */}
            {leaks.map((leak) =>
              found.includes(leak.id) ? (
                <motion.div
                  key={`chip-${leak.id}`}
                  initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 0.6 }}
                  animate={{ opacity: 1, x: "-50%", scale: 1 }}
                  transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 20, delay: 0.12 }}
                  style={{
                    position: "absolute",
                    left: `${leak.chipLeftPct}%`,
                    top: `${leak.chipTopPct}%`,
                    background: paint.chipBg,
                    color: "#ffffff",
                    fontSize: "clamp(10px, 1.75cqw, 14px)",
                    fontWeight: 800,
                    padding: "0.4em 0.8em",
                    borderRadius: 999,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
                    pointerEvents: "none",
                  }}
                >
                  {leak.chip}
                </motion.div>
              ) : null
            )}
          </motion.div>

          {/* Progress on the tray: tiles developed, then leaks found */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 10, padding: "0 4px" }}>
            <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: 2, color: paint.meterColor, flexShrink: 0 }}>
              {meterLabel}
            </div>
            <div
              role="progressbar"
              aria-label={meterLabel}
              aria-valuemin={0}
              aria-valuemax={meterTotal}
              aria-valuenow={meterDone}
              style={{
                flex: 1,
                height: 12,
                borderRadius: 999,
                background: "rgba(0, 0, 0, 0.5)",
                overflow: "hidden",
                boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.5)",
              }}
            >
              <div
                style={{
                  width: `${meterTotal > 0 ? (meterDone / meterTotal) * 100 : 0}%`,
                  height: "100%",
                  borderRadius: 999,
                  background: meterFull
                    ? "linear-gradient(90deg, #2ecc71, #8bffb0)"
                    : "linear-gradient(90deg, #ffb347, #ffd166)",
                  transition: "width 220ms ease, background 400ms ease",
                }}
              />
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: meterFull ? "#8bffb0" : "#ffd166",
                minWidth: 52,
                textAlign: "right",
                flexShrink: 0,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {meterDone} / {meterTotal}
            </div>
          </div>
        </div>

        {/* ------------ the step's prompt ------------ */}
        <div style={{ display: "flex", justifyContent: "center", padding: "0 12px" }}>
          <div
            aria-live="polite"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "10px 18px",
              borderRadius: 16,
              background: `${tint}1a`,
              border: `1px solid ${tint}59`,
              color: paint.promptColor,
              fontSize: 17,
              fontWeight: 800,
              lineHeight: 1.3,
              textAlign: "center",
            }}
          >
            <PixIcon emoji={promptIcon} size={24} />
            {prompt}
          </div>
        </div>

        {/* ------------ found leaks (spot) / the decision (decide) ------------ */}
        <div
          style={{
            minHeight: 92,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            padding: "0 16px",
          }}
        >
          {step === "spot" &&
            found.map((id) => {
              const leak = leaks.find((l) => l.id === id);
              if (!leak) return null;
              return (
                <motion.div
                  key={`found-${id}`}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: 1.3,
                    color: paint.bulletColor,
                  }}
                >
                  <PixIcon emoji={leak.icon} size={22} />
                  {leak.bullet}
                </motion.div>
              );
            })}

          {step === "decide" && (
            <motion.div
              key="choices"
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}
            >
              {/* Two IDENTICAL neutral buttons: nothing here hints at the answer. */}
              {order.map((choice) => (
                <ChoiceButton
                  key={choice}
                  label={choice === "share" ? shareLabel : keepLabel}
                  disabled={speaking || washing || sealed}
                  sealed={sealed && choice === "keep"}
                  reduce={reduce}
                  tone={paint}
                  onClick={() => choose(choice === "share")}
                />
              ))}
            </motion.div>
          )}
        </div>

        <style>{`
          @keyframes dtTileGuide { 0%,100% { box-shadow: inset 0 0 0 3px rgba(255,170,60,0.95), inset 0 0 18px rgba(255,200,90,0.35) } 50% { box-shadow: inset 0 0 0 5px rgba(255,170,60,0.55), inset 0 0 34px rgba(255,200,90,0.7) } }
          @keyframes dtLeakGuide { 0%,100% { box-shadow: 0 0 0 3px rgba(255,150,60,0.9), 0 0 14px rgba(255,150,60,0.45); background: rgba(255,214,110,0.1) } 50% { box-shadow: 0 0 0 6px rgba(255,150,60,0.4), 0 0 28px rgba(255,150,60,0.8); background: rgba(255,214,110,0.26) } }
        `}</style>
      </div>

      {/* ------------ overlays ------------ */}
      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={narration}
          threat={threat}
          character={narration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={closePanel}
        />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[t.statTiles(TOTAL_TILES), t.statLeaks(leaks.length), completeLine]}
          narration={completeNarration}
          onContinue={complete}
        />
      )}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Small shared bits                                                  */
/* ------------------------------------------------------------------ */

/** The decision button: SHARE and KEEP share this exact look until the pick. */
function ChoiceButton({
  label,
  onClick,
  disabled,
  sealed,
  reduce,
  tone,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  /** The right pick, shown only after it was made. */
  sealed: boolean;
  reduce: boolean;
  /** Skin paint for the button; both buttons always share it. */
  tone: Pick<TraySkinPaint, "choiceBorder" | "choiceBg" | "choiceColor">;
}) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled || reduce ? undefined : { scale: 0.95 }}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        minHeight: 64,
        minWidth: 190,
        padding: "12px 30px",
        borderRadius: 18,
        border: `2px solid ${sealed ? GOOD_GREEN : tone.choiceBorder}`,
        background: tone.choiceBg,
        color: tone.choiceColor,
        fontFamily: "inherit",
        fontSize: 20,
        fontWeight: 900,
        letterSpacing: 1,
        cursor: disabled ? "wait" : "pointer",
        opacity: disabled && !sealed ? 0.6 : 1,
        boxShadow: sealed ? "0 0 20px rgba(52, 211, 153, 0.55)" : "0 8px 20px rgba(0, 0, 0, 0.35)",
        transition: "opacity 200ms ease, border-color 200ms ease, box-shadow 200ms ease",
      }}
    >
      {sealed && <PixIcon emoji="✅" size={24} />}
      {label}
    </motion.button>
  );
}
