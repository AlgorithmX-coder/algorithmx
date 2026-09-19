"use client";

/**
 * CyberMaze — the NAVIGATE drill (Week 3 debut as "The Meet-Up Maze").
 *
 * A glowing maze on a canvas. The child taps a lit square next to their hero
 * to move. Five forks are blocked by a fake friend's gate: at each one the
 * "friend" proposes something (a meet-up, a photo swap, a secret) and three
 * replies fan out. The hero reply opens the gate; a wrong reply teaches and
 * closes it again for another go. Reach the exit and the trusted grown-up is
 * waiting at the door.
 *
 * Kid-first contract: tap-only (arrow keys still work for laptops), nothing
 * races the child, no timer, no lose state, wrong answers teach and retry.
 *
 * Learn-Loop wiring (owner standards, 2026-09-11), the first legacy canvas
 * engine brought to the standard: shared intro beat with `introNarration` +
 * the Raccoon's boast (`threat`); Sarah reads the how-to once as the maze
 * appears (`coachLines`), each gate's proposal as it opens and its `why`
 * after the hero reply (audio-only, `recordedOnly`), holding taps while she
 * speaks; the reply options are shuffled per play (never authored order); a
 * per-gate teach (`explanation`) on a wrong reply; a visible action strip
 * naming the next move; shared complete beat with a spoken payoff
 * (`completeNarration`). Legacy weeks that never used the engine are
 * unaffected (this is its first outing).
 *
 * Skins (`skin` prop): "default" is the glowing cyber maze (Week 3, unchanged).
 * "darkroom" is Week 8's review "The Share Maze": the same maze, gates, moves,
 * narration and verdicts re-painted as a darkroom (amber safelight glow, a
 * tiled darkroom floor, gates hung as little photo prints on the board and a
 * photo-print gate card). "snow" is Week 12's review "The Snow Maze": the
 * board's first daylight world, packed snow and drifts under a low winter sun
 * with flakes falling, wooden signposts for gates, storm lanterns for tokens,
 * boot prints behind the hero and a whiteout haze for fog. Paint only:
 * nothing about play changes on any skin.
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import { validateMaze, pathFromExit } from "./maze-helpers";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { fisherYates } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import {
  setupHiDpiCanvas,
  scaledParticleCount,
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;

// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface MazeQuestion {
  /** The gate's proposal / question ("Let's meet at the park after school!"). */
  question: string;
  /** Reply options; authored data may put the hero reply first (shuffled at runtime). */
  answers: string[];
  correctIndex: number;
  /** Optional: who is asking (shown on the gate card). */
  from?: string;
  /** Optional: Sarah's spoken why after the hero reply. */
  why?: string;
  /** Optional: teach copy on a wrong reply (defaults to a generic line). */
  explanation?: string;
}

export interface CyberMazeProps {
  questions: MazeQuestion[];
  /** Visual skin: "default" (the cyber maze, Week 3), "darkroom" (Week 8's
   *  Share Maze: amber safelight, photo-print gates) or "snow" (Week 12's Snow
   *  Maze: a daylight snowfield, signpost gates, lanterns). Paint only. */
  skin?: "default" | "darkroom" | "snow";
  /** Copy overrides (defaults keep the generic cyber-maze skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Eyebrow on the gate card ("SECURITY GATE"). */
  gateLabel?: string;
  /** HUD labels. */
  gatesLabel?: string;
  tokensLabel?: string;
  /** Visible action strip under the maze. */
  movePrompt?: string;
  /** Action strip while a gate card is open. Default "Pick the hero reply to open the gate". */
  pickPrompt?: string;
  /** Gate card line above the replies. Default "WHAT DOES A HERO REPLY?". */
  replyPrompt?: string;
  /** Complete-beat line after "5/5". Default "gates opened with a hero reply". */
  gatesDoneLabel?: string;
  gateToast?: string;
  wrongTitle?: string;
  wrongTip?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier2: string; tier3: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken "you're protected" payoff on the complete screen. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  /**
   * Fires once per answer (correct or wrong). `questionIndex` is the
   * 0-based position in the `questions` prop - the parent translates
   * this into a stable key like "maze-2" for persistence. No question
   * text is leaked through this callback by design.
   */
  onAnswered?: (data: {
    questionIndex: number;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
  /** See CyberScanner.onHintReached. */
  onHintReached?: (tier: 1 | 2 | 3) => void;
}

// 7 rows × 9 cols. 0 = open, 1 = wall. Start (0,0), Exit (6,8).
const RAW_MAZE_GRID: number[][] = [
  [0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 1, 0, 0],
  [1, 0, 1, 0, 0, 0, 1, 0, 1],
  [0, 0, 1, 0, 1, 0, 0, 0, 0],
  [0, 1, 0, 0, 0, 1, 1, 0, 1],
  [0, 0, 0, 1, 0, 0, 0, 0, 0],
  [1, 0, 1, 0, 1, 0, 1, 0, 0],
];

const COLS = 9;
const ROWS = 7;
const CELL = 54;
const BOARD_W = COLS * CELL;
const BOARD_H = ROWS * CELL;

const VALIDATED = validateMaze(RAW_MAZE_GRID, ROWS, COLS);
const SOLUTION_PATH = pathFromExit(VALIDATED.grid, VALIDATED.dist, ROWS, COLS);

// Pick 5 gate positions evenly along the solution (skip the start and exit).
const GATES: Array<{ row: number; col: number }> = (() => {
  const interior = SOLUTION_PATH.filter(
    (p) => !(p.row === 0 && p.col === 0) && !(p.row === ROWS - 1 && p.col === COLS - 1)
  );
  if (interior.length === 0) return [];
  const picks: Array<{ row: number; col: number }> = [];
  const gateCount = Math.min(5, interior.length);
  for (let i = 0; i < gateCount; i++) {
    const idx = Math.floor(((i + 1) * interior.length) / (gateCount + 1));
    picks.push(interior[Math.min(idx, interior.length - 1)]);
  }
  const seen = new Set<string>();
  return picks.filter((p) => {
    const k = `${p.row},${p.col}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
})();

// Token positions - open cells that are NOT gates and NOT start/exit.
const TOKENS: Array<{ row: number; col: number }> = (() => {
  const gateSet = new Set(GATES.map((g) => `${g.row},${g.col}`));
  const candidates: Array<{ row: number; col: number }> = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (VALIDATED.grid[r][c] !== 0) continue;
      if (r === 0 && c === 0) continue;
      if (r === ROWS - 1 && c === COLS - 1) continue;
      if (gateSet.has(`${r},${c}`)) continue;
      if (VALIDATED.dist[r][c] === Infinity) continue;
      candidates.push({ row: r, col: c });
    }
  }
  const picks: Array<{ row: number; col: number }> = [];
  const stride = Math.max(1, Math.floor(candidates.length / 6));
  for (let i = 0; i < candidates.length && picks.length < 6; i += stride) {
    picks.push(candidates[i]);
  }
  return picks;
})();

const DEFAULT_QUESTIONS: MazeQuestion[] = [
  {
    question: "What should you NEVER share online?",
    answers: ["Your home address", "Your favourite game", "Your favourite colour", "Your age range"],
    correctIndex: 0,
  },
  {
    question: "A strong password should have...",
    answers: ["At least 8 characters with a mix", "Your name", "Just numbers", "One word"],
    correctIndex: 0,
  },
  {
    question: "If someone online asks to meet in person...",
    answers: ["Tell a trusted adult immediately", "Meet them at a park", "Ask a friend to come", "Ignore it"],
    correctIndex: 0,
  },
  {
    question: "Two-factor authentication means...",
    answers: ["A second check to prove it's you", "Two passwords", "Logging in twice", "Two email addresses"],
    correctIndex: 0,
  },
  {
    question: "What is a digital footprint?",
    answers: ["Everything you do online that stays", "Your shoe size", "A computer game", "Your profile picture"],
    correctIndex: 0,
  },
];

/** Every colour the maze paints, per skin. The skin swaps paint only. */
interface MazePaint {
  // Frame, HUD, canvas element and action strip (DOM)
  frameBg: string;
  frameShadow: string;
  frameInk: string;
  hudGates: string;
  hudTokens: string;
  canvasBg: string;
  pillBorder: string;
  pillBg: string;
  pillInk: string;
  pill2Border: string;
  pill2Ink: string;
  // Board (canvas)
  base: readonly [string, string, string];
  /** A warm safelight wash from the top of the board (null = none). */
  lamp: string | null;
  scan: string;
  scanAlpha: number;
  filament: string;
  floorTint: readonly [string, string];
  floorLineRGB: string;
  floorTick: string;
  wall: readonly [string, string, string];
  wallRivet: string;
  /** [edge, middle] of the light stripe sweeping the walls. */
  wallStripe: readonly [string, string];
  wallStroke: string;
  wallGlow: string;
  exitHaloRGB: string;
  exitHaloMid: string;
  exitHaloEdge: string;
  exitRings: readonly [string, string, string];
  exitGlow: string;
  /** Gates drawn as little photo prints instead of spinning hexagons. */
  printGates: boolean;
  /** Snow skin: gates drawn as wooden trail signposts planted in the snow. */
  signGates?: boolean;
  /** Snow skin: tokens drawn as little storm lanterns instead of gems. */
  lanternTokens?: boolean;
  /** Snow skin: floor cells drawn as soft packed-snow pads, not tech tiles. */
  snowFloor?: boolean;
  /** Snow skin: the hero's trail is pressed boot prints, not glow blobs. */
  bootTrail?: boolean;
  /** Snow skin: flakes drifting down over the whole board. */
  snowfall?: boolean;
  /** "R, G, B" of the "tap me" rings on the open neighbour cells (default white). */
  tapRingRGB?: string;
  gateBase: string;
  gateFlash: string;
  gateAccent: string;
  gateFlashAccent: string;
  gateGlow: string;
  gateFlashGlow: string;
  /** Hexagon fill (default) or print paper (printGates). */
  gateFill: string;
  gateGlyph: string;
  token: readonly [string, string, string];
  tokenStroke: string;
  tokenGlow: string;
  trail: string;
  player: readonly [string, string, string];
  playerGlow: string;
  playerRing: string;
  sparkle: readonly [string, string, string];
  burst: readonly [string, string, string];
  fog: string;
  // Gate card (DOM)
  overlayBg: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  eyebrow: string;
  fromInk: string;
  questionInk: string;
  promptInk: string;
  answerBg: string;
  answerBorder: string;
  answerInk: string;
  answerHoverBg: string;
  answerHoverBorder: string;
}

/** The cyber maze as it has always been painted (Week 3). */
const DEFAULT_PAINT: MazePaint = {
  frameBg: "linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)",
  frameShadow: "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
  frameInk: "#e8edff",
  hudGates: "#a0ffb0",
  hudTokens: "#00e5ff",
  canvasBg: "#0a0e1a",
  pillBorder: "#ffd158",
  pillBg: "rgba(255,209,88,0.14)",
  pillInk: "#ffe9b8",
  pill2Border: "rgba(125,240,255,0.4)",
  pill2Ink: "#9fd8ff",
  base: ["#1a2147", "#0f1530", "#080a16"],
  lamp: null,
  scan: "#00e5ff",
  scanAlpha: 0.1,
  filament: "rgba(124, 92, 255, 0.22)",
  floorTint: ["rgba(255, 200, 130, 0.08)", "rgba(255, 95, 179, 0.06)"],
  floorLineRGB: "124, 92, 255",
  floorTick: "rgba(125, 240, 255, 0.3)",
  wall: ["#6b3818", "#4a2818", "#2a1208"],
  wallRivet: "rgba(125, 240, 255, 0.4)",
  wallStripe: ["rgba(124, 92, 255, 0)", "rgba(124, 92, 255, 0.28)"],
  wallStroke: "rgba(124, 92, 255, 0.7)",
  wallGlow: "#00e5ff",
  exitHaloRGB: "255, 220, 130",
  exitHaloMid: "rgba(124, 92, 255, 0.32)",
  exitHaloEdge: "rgba(212, 115, 58, 0)",
  exitRings: ["#7df0ff", "#ffd158", "#7c5cff"],
  exitGlow: "#ffd158",
  printGates: false,
  gateBase: "#ffd158",
  gateFlash: "#ff7a59",
  gateAccent: "#ffe9b8",
  gateFlashAccent: "#f4a89a",
  gateGlow: "rgba(255, 220, 130, 0.5)",
  gateFlashGlow: "rgba(255, 95, 179, 0.55)",
  gateFill: "rgba(15, 21, 48, 0.85)",
  gateGlyph: "#e8edff",
  token: ["#fef3c7", "#00e5ff", "#b45309"],
  tokenStroke: "#fbbf24",
  tokenGlow: "#00e5ff",
  trail: "#ffd158",
  player: ["#7df0ff", "#ffd158", "#7c5cff"],
  playerGlow: "#7c5cff",
  playerRing: "#e8edff",
  sparkle: ["#00e5ff", "#fbbf24", "#f97316"],
  burst: ["#7eff97", "#00e5ff", "#00e5ff"],
  fog: "rgba(0,0,0,0.45)",
  overlayBg: "rgba(5,8,18,0.88)",
  cardBg: "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(5,8,18,0.98))",
  cardBorder: "2px solid rgba(255,209,88,0.55)",
  cardShadow: "0 0 30px rgba(124,92,255,0.35)",
  eyebrow: "#ffd158",
  fromInk: "#c9b8ff",
  questionInk: "#f1f5f9",
  promptInk: "#9fd8ff",
  answerBg: "rgba(30,41,59,0.8)",
  answerBorder: "rgba(255,209,88,0.4)",
  answerInk: "#e8edff",
  answerHoverBg: "rgba(124,92,255,0.2)",
  answerHoverBorder: "#ffd158",
};

/** Week 8's darkroom: amber safelight over a dark tiled floor, photo-print gates. */
const DARKROOM_PAINT: MazePaint = {
  frameBg: "linear-gradient(180deg, #241009 0%, #38160c 52%, #140805 100%)",
  frameShadow: "0 40px 90px -30px rgba(40, 14, 6, 0.6), 0 0 0 1px rgba(255,157,110,0.3) inset",
  frameInk: "#fff1e0",
  hudGates: "#ffd9a0",
  hudTokens: "#ff9d6e",
  canvasBg: "#120705",
  pillBorder: "#ff9d2e",
  pillBg: "rgba(255,157,46,0.14)",
  pillInk: "#ffe2c4",
  pill2Border: "rgba(255,196,155,0.4)",
  pill2Ink: "#ffc49b",
  base: ["#2e140a", "#1f0d06", "#0f0503"],
  lamp: "rgba(255, 107, 61, 0.3)",
  scan: "#ff9d2e",
  scanAlpha: 0.05,
  filament: "rgba(255, 140, 70, 0.2)",
  floorTint: ["rgba(255, 170, 110, 0.07)", "rgba(224, 80, 46, 0.05)"],
  floorLineRGB: "255, 140, 80",
  floorTick: "rgba(255, 196, 155, 0.22)",
  wall: ["#3a1a0c", "#2a1208", "#160904"],
  wallRivet: "rgba(255, 179, 71, 0.35)",
  wallStripe: ["rgba(255, 107, 61, 0)", "rgba(255, 107, 61, 0.2)"],
  wallStroke: "rgba(255, 140, 70, 0.55)",
  wallGlow: "#ff6b3d",
  exitHaloRGB: "255, 196, 120",
  exitHaloMid: "rgba(255, 107, 61, 0.3)",
  exitHaloEdge: "rgba(138, 58, 20, 0)",
  exitRings: ["#ffe0b8", "#ff9d2e", "#e0502e"],
  exitGlow: "#ffb347",
  printGates: true,
  gateBase: "#ff9d2e",
  gateFlash: "#ff5f5f",
  gateAccent: "#ffe2aa",
  gateFlashAccent: "#ffb4a8",
  gateGlow: "rgba(255, 157, 46, 0.5)",
  gateFlashGlow: "rgba(255, 95, 95, 0.55)",
  gateFill: "#fbf3e4",
  gateGlyph: "#ffe2b8",
  token: ["#fff3e0", "#ffb347", "#8a3a14"],
  tokenStroke: "#ffd9a0",
  tokenGlow: "#ff9d2e",
  trail: "#ffb347",
  player: ["#ffe9c4", "#ffb347", "#e0502e"],
  playerGlow: "#ff6b3d",
  playerRing: "#fff1e0",
  sparkle: ["#ffb347", "#ffe0b8", "#ff6b3d"],
  burst: ["#7eff97", "#ffb347", "#ffe0b8"],
  fog: "rgba(8,3,1,0.5)",
  overlayBg: "rgba(18,7,5,0.88)",
  cardBg: "radial-gradient(ellipse at 50% 18%, rgba(255,107,61,0.22) 0%, rgba(255,107,61,0) 60%), linear-gradient(180deg, #3a1a0c 0%, #1c0c07 100%)",
  cardBorder: "none",
  cardShadow: "inset 0 0 0 1px rgba(0,0,0,0.45)",
  eyebrow: "#ffb347",
  fromInk: "#ffc49b",
  questionInk: "#fff6ea",
  promptInk: "#ffc49b",
  answerBg: "rgba(58,26,12,0.85)",
  answerBorder: "rgba(255,157,46,0.45)",
  answerInk: "#fff1e0",
  answerHoverBg: "rgba(255,107,61,0.22)",
  answerHoverBorder: "#ff9d2e",
};

/**
 * Week 12's snowfield: the only DAYLIGHT board the maze has ever had. Packed
 * snow underfoot, drifts for walls, a low winter sun from the top, flakes
 * drifting over everything and a whiteout haze instead of a black fog. The
 * gates are wooden trail signposts, the tokens are storm lanterns and the
 * hero leaves boot prints behind. Paint only: nothing about play changes.
 */
const SNOW_PAINT: MazePaint = {
  frameBg: "linear-gradient(180deg, #dbe9fb 0%, #b9d2ef 46%, #8fb3dd 100%)",
  frameShadow: "0 40px 90px -30px rgba(28, 56, 104, 0.45), 0 0 0 1px rgba(255,255,255,0.65) inset",
  frameInk: "#17243f",
  hudGates: "#0f6b3a",
  hudTokens: "#8a5a12",
  // The board is the library's only DAYLIGHT world, so the dark skins' trick of
  // a bright rim on a dark ground had to be inverted rather than recoloured: the
  // drifts are the sunlit white blocks and the trodden snow between them is in
  // shadow. Painted pale-on-pale it measured 7 luminance levels between floor
  // and wall against the shipped skins' 41 to 48, and a child could not tell a
  // path from a drift. These values put the gap back at roughly 60.
  canvasBg: "#9db8d6",
  pillBorder: "#2f5c9e",
  pillBg: "rgba(47,92,158,0.12)",
  pillInk: "#17314f",
  pill2Border: "rgba(47,92,158,0.4)",
  pill2Ink: "#2a4a74",
  base: ["#c4d9f0", "#a3c0de", "#87a8ca"],
  lamp: "rgba(255, 246, 214, 0.5)",
  scan: "#ffffff",
  scanAlpha: 0.14,
  filament: "rgba(70, 105, 155, 0.28)",
  floorTint: ["rgba(126, 158, 198, 0.34)", "rgba(88, 122, 168, 0.30)"],
  floorLineRGB: "62, 96, 145",
  floorTick: "rgba(52, 84, 130, 0.38)",
  wall: ["#ffffff", "#f3f9ff", "#dceaf9"],
  wallRivet: "rgba(255, 255, 255, 0.95)",
  wallStripe: ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.6)"],
  wallStroke: "rgba(46, 84, 134, 0.92)",
  wallGlow: "#ffffff",
  exitHaloRGB: "255, 226, 150",
  exitHaloMid: "rgba(255, 190, 90, 0.32)",
  exitHaloEdge: "rgba(255, 190, 90, 0)",
  exitRings: ["#ffcf6b", "#ffffff", "#8fbfe8"],
  exitGlow: "#ffcf6b",
  printGates: false,
  signGates: true,
  lanternTokens: true,
  snowFloor: true,
  bootTrail: true,
  snowfall: true,
  tapRingRGB: "47, 92, 158",
  gateBase: "#8a5f2e",
  gateFlash: "#d64545",
  gateAccent: "#f6e7c9",
  gateFlashAccent: "#ffd7d7",
  gateGlow: "rgba(120, 160, 215, 0.45)",
  gateFlashGlow: "rgba(214, 69, 69, 0.45)",
  gateFill: "#a3762f",
  gateGlyph: "#fff6e6",
  token: ["#fff6d8", "#ffd067", "#b06f16"],
  tokenStroke: "#8a5a12",
  tokenGlow: "#ffce5e",
  trail: "#8fa9cd",
  player: ["#ffffff", "#9fd8ff", "#3a7bff"],
  playerGlow: "#3a7bff",
  playerRing: "#1e3a6b",
  sparkle: ["#ffffff", "#bfe6ff", "#ffd067"],
  burst: ["#7eff97", "#ffffff", "#bfe6ff"],
  fog: "rgba(226, 240, 255, 0.62)",
  overlayBg: "rgba(226,242,255,0.88)",
  cardBg: "linear-gradient(180deg, #ffffff 0%, #e8f1fd 100%)",
  cardBorder: "2px solid rgba(47,92,158,0.35)",
  cardShadow: "0 24px 60px -24px rgba(28,56,104,0.55)",
  eyebrow: "#2f5c9e",
  fromInk: "#4a6da0",
  questionInk: "#17243f",
  promptInk: "#2f5c9e",
  answerBg: "rgba(255,255,255,0.92)",
  answerBorder: "rgba(47,92,158,0.35)",
  answerInk: "#17243f",
  answerHoverBg: "rgba(47,92,158,0.14)",
  answerHoverBorder: "#2f5c9e",
};

/** Rounded-rect path helper (the snow skin's soft pads and lantern bodies). */
function roundRectPath(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
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

/** Darkroom gate card: a strip of tape over a print's top corner. */
const TAPE_STYLE = {
  position: "absolute",
  top: -2,
  width: 70,
  height: 18,
  background: "rgba(255,226,170,0.8)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.2)",
  pointerEvents: "none",
} as const;

interface Token {
  row: number;
  col: number;
  collected: boolean;
}

interface GateState {
  row: number;
  col: number;
  qIdx: number;
  open: boolean;
  flashUntil: number;
}

export default function CyberMaze({
  questions,
  skin,
  introTitle,
  introSubtitle,
  introIcon,
  gateLabel,
  gatesLabel,
  tokensLabel,
  movePrompt,
  pickPrompt,
  replyPrompt,
  gatesDoneLabel,
  gateToast,
  wrongTitle,
  wrongTip,
  completeTitle,
  completeLine,
  hints,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onAnswered,
  onHintReached,
}: CyberMazeProps) {
  const qList = useMemo(
    () => (questions.length > 0 ? questions : DEFAULT_QUESTIONS),
    [questions]
  );
  // In-game read-alouds, verdict reasons and teach lines are recorded under
  // "adam" (both content voices are Sarah), so every manifest lookup here uses
  // that key. Keying them to the intro's speaker ("layla" on Week 3) found no
  // clip, and the gate questions, reasons and teaches played silent.
  const voice = "adam" as const;
  // Paint only: a module constant per skin, so the board's render loop (which
  // depends on it) still starts exactly once.
  const darkroom = skin === "darkroom";
  const pal = skin === "snow" ? SNOW_PAINT : darkroom ? DARKROOM_PAINT : DEFAULT_PAINT;

  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const intensityRef = useRef(intensity);
  useEffect(() => {
    intensityRef.current = intensity;
  }, [intensity]);

  const walls = useMemo(() => {
    return VALIDATED.grid.map((row) => row.map((v) => v === 1));
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  const state = useRef({
    cellCol: 0,
    cellRow: 0,
    // The hero rests at the centre of its start cell. The frame loop snaps
    // x/y to toX/toY whenever no move is running, so the move target must
    // start there too, or the hero sits in the canvas corner until the
    // first move.
    fromX: CELL / 2,
    fromY: CELL / 2,
    toX: CELL / 2,
    toY: CELL / 2,
    tweenStart: 0,
    tweenDuration: 150,
    x: CELL / 2,
    y: CELL / 2,
    gates: GATES.map((g, i) => ({
      ...g,
      qIdx: i % qList.length,
      open: false,
      flashUntil: 0,
    })) as GateState[],
    tokens: TOKENS.map((t) => ({ ...t, collected: false })) as Token[],
    tokensCollected: 0,
    questionsAnswered: 0,
    wrongCount: 0,
    activeGateIdx: null as number | null,
    complete: false,
    particles: [] as Array<{
      id: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      colour: string;
    }>,
    particleId: 0,
    trail: [] as Array<{ x: number; y: number; age: number }>,
  });

  const [activeQuestion, setActiveQuestion] = useState<number | null>(null);
  const [render, setRender] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showIntro, setShowIntro] = useState(true);
  const [feedback, setFeedback] = useState<null | {
    title: string;
    explanation: string;
    tip?: string;
  }>(null);
  const [wrongOnGate, setWrongOnGate] = useState<Record<number, number>>({});
  // Read-aloud chain: the how-to once as the maze appears, then each gate's
  // proposal as its card opens (the why after the hero reply is the verdict's
  // one take). Taps are held while Sarah speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "ask" | "idle">("idle");
  // NO SEQUENCE (owner rule): each gate's replies show in a random order every
  // play (authored data leads with the hero reply). Shuffled after mount so the
  // server and first client render agree.
  const [answerOrder, setAnswerOrder] = useState<number[][]>(() => qList.map((q) => q.answers.map((_, i) => i)));
  useIsoLayoutEffect(() => {
    setAnswerOrder(qList.map((q) => fisherYates(q.answers.map((_, i) => i))));
  }, [qList]);

  // Spoken verdicts (owner 2026-09-12): "That's right!" leads the gate's why;
  // a wrong reply speaks through WrongAnswerPanel. Moves wait for her.
  const verdict = useVerdictVoice();
  const speaking = narr !== "idle" || verdict.speaking;

  // How-to once as the maze appears.
  useEffect(() => {
    if (showIntro || finished) return;
    if (coachLines && !isAudioMuted()) setNarr("howto");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIntro]);

  useEffect(() => {
    if (!speaking) return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [speaking, narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Hint-tier emission: tier 2 when a single gate has been failed twice,
  // tier 3 at 3+ wrongs on the same gate.
  useEffect(() => {
    if (!onHintReached) return;
    let maxOnAnyGate = 0;
    for (const v of Object.values(wrongOnGate)) {
      if (v > maxOnAnyGate) maxOnAnyGate = v;
    }
    if (maxOnAnyGate < 2) return;
    const tier: 1 | 2 | 3 = maxOnAnyGate >= 3 ? 3 : 2;
    onHintReached(tier);
  }, [wrongOnGate, onHintReached]);

  useEffect(() => {
    state.current.x = CELL / 2;
    state.current.y = CELL / 2;
  }, []);

  const tryMove = (dr: number, dc: number) => {
    const s = state.current;
    if (showIntro || speaking || feedback) return;
    if (s.complete || activeQuestion !== null) return;
    if (performance.now() < s.tweenStart + s.tweenDuration) return;
    const newRow = s.cellRow + dr;
    const newCol = s.cellCol + dc;
    if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) return;
    if (walls[newRow][newCol]) return;
    // The exit stays locked until every gate has been opened with a hero reply:
    // the maze has more than one route, and the lesson is the five replies.
    if (newRow === ROWS - 1 && newCol === COLS - 1 && s.questionsAnswered < s.gates.length) {
      audio.select();
      fx.toast({ text: `Open every ? gate first! ${s.gates.length - s.questionsAnswered} to go`, tone: "danger" });
      return;
    }
    // Gate collision - only stop if gate isn't open yet
    const gateIdx = s.gates.findIndex(
      (g) => g.row === newRow && g.col === newCol
    );
    if (gateIdx >= 0 && !s.gates[gateIdx].open) {
      s.activeGateIdx = gateIdx;
      setActiveQuestion(s.gates[gateIdx].qIdx);
      audio.select();
      // Sarah reads the proposal; the replies wait for her.
      if (!isAudioMuted()) setNarr("ask");
      return;
    }
    // move
    s.fromX = s.x;
    s.fromY = s.y;
    s.cellRow = newRow;
    s.cellCol = newCol;
    s.toX = newCol * CELL + CELL / 2;
    s.toY = newRow * CELL + CELL / 2;
    s.tweenStart = performance.now();
    playSound("pop");

    // Check token
    const tIdx = s.tokens.findIndex(
      (t) => !t.collected && t.row === newRow && t.col === newCol
    );
    if (tIdx >= 0) {
      s.tokens[tIdx].collected = true;
      s.tokensCollected += 1;
      audio.xpTick();
      const sparkleCount = scaledParticleCount(10);
      for (let i = 0; i < sparkleCount; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 3;
        s.particles.push({
          id: ++s.particleId,
          x: s.toX,
          y: s.toY,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 600,
          colour: pal.sparkle[i % 3],
        });
      }
    }

    // Check exit
    if (newRow === ROWS - 1 && newCol === COLS - 1) {
      s.complete = true;
      playSound("confetti");
      if (intensityRef.current > 0) void correctAnswerBurst();
      window.setTimeout(() => setFinished(true), 1000);
    }
    setRender((n) => n + 1);
  };

  const answerQuestion = (choice: number) => {
    const s = state.current;
    if (s.activeGateIdx === null || speaking || feedback) return;
    const gate = s.gates[s.activeGateIdx];
    const q = qList[gate.qIdx];

    onAnswered?.({
      questionIndex: gate.qIdx,
      selectedIndex: choice,
      correctIndex: q.correctIndex,
      wasCorrect: choice === q.correctIndex,
    });

    if (choice === q.correctIndex) {
      gate.open = true;
      s.questionsAnswered += 1;
      audio.correct();
      onCorrect?.();
      fx.correct({ xp: 25, text: gateToast ?? "GATE OPEN!" });
      const gx = gate.col * CELL + CELL / 2;
      const gy = gate.row * CELL + CELL / 2;
      const gateBurst = scaledParticleCount(14);
      for (let i = 0; i < gateBurst; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 4;
        s.particles.push({
          id: ++s.particleId,
          x: gx,
          y: gy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 700,
          colour: pal.burst[i % 3],
        });
      }
      // Move into the gate cell
      s.fromX = s.x;
      s.fromY = s.y;
      s.cellRow = gate.row;
      s.cellCol = gate.col;
      s.toX = gate.col * CELL + CELL / 2;
      s.toY = gate.row * CELL + CELL / 2;
      s.tweenStart = performance.now();
      s.activeGateIdx = null;
      setActiveQuestion(null);
      // Sarah: "That's right!" + why that was the hero reply, in one take.
      verdict.say("right", q.why ?? null);
    } else {
      s.wrongCount += 1;
      gate.flashUntil = performance.now() + 500;
      audio.wrong();
      onWrong?.();
      setWrongOnGate((prev) => ({
        ...prev,
        [s.activeGateIdx!]: (prev[s.activeGateIdx!] ?? 0) + 1,
      }));
      setFeedback({
        title: wrongTitle ?? "Not quite",
        explanation:
          q.explanation ??
          `The hero reply was "${q.answers[q.correctIndex]}". Read the gate again next time you reach it.`,
        tip: wrongTip ?? "Use what we learned: strong passwords are long, mixed, secret and unique.",
      });
      // The gate stays shut; step back one cell so the child can re-approach.
      const dirs: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]];
      for (const [dr, dc] of dirs) {
        const nr = s.cellRow + dr;
        const nc = s.cellCol + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (walls[nr][nc]) continue;
        const isGate = s.gates.some((g) => g.row === nr && g.col === nc && !g.open);
        if (isGate) continue;
        s.fromX = s.x;
        s.fromY = s.y;
        s.cellRow = nr;
        s.cellCol = nc;
        s.toX = nc * CELL + CELL / 2;
        s.toY = nr * CELL + CELL / 2;
        s.tweenStart = performance.now();
        break;
      }
      s.activeGateIdx = null;
      setActiveQuestion(null);
    }
    setRender((n) => n + 1);
  };

  // Keyboard input (laptops); tapping is the primary control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (activeQuestion !== null) return;
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        e.preventDefault();
        tryMove(-1, 0);
      } else if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        e.preventDefault();
        tryMove(1, 0);
      } else if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        tryMove(0, -1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        tryMove(0, 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeQuestion, showIntro, speaking, feedback]);

  // Click / tap on neighbour cell
  const onCanvasClick = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeQuestion !== null) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = BOARD_W / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    const col = Math.floor(x / CELL);
    const row = Math.floor(y / CELL);
    const s = state.current;
    const dr = row - s.cellRow;
    const dc = col - s.cellCol;
    if (Math.abs(dr) + Math.abs(dc) !== 1) return;
    tryMove(dr, dc);
  };

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = setupHiDpiCanvas(canvas, {
      logicalWidth: BOARD_W,
      logicalHeight: BOARD_H,
      maxDpr: 2,
    });
    if (!setup) return;
    const ctx = setup.ctx;

    let running = true;
    let lastTime = performance.now();

    const onVis = () => {
      if (document.hidden) lastTime = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);

    const tick = (now: number) => {
      if (!running) return;
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
      const dt = Math.min(50, now - lastTime);
      lastTime = now;
      const s = state.current;

      // Tween position
      if (now < s.tweenStart + s.tweenDuration) {
        const t = (now - s.tweenStart) / s.tweenDuration;
        const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        s.x = s.fromX + (s.toX - s.fromX) * ease;
        s.y = s.fromY + (s.toY - s.fromY) * ease;
      } else {
        s.x = s.toX;
        s.y = s.toY;
      }

      // Trail
      s.trail.push({ x: s.x, y: s.y, age: 0 });
      s.trail = s.trail
        .map((t) => ({ ...t, age: t.age + dt }))
        .filter((t) => t.age < 350);
      if (s.trail.length > 12) s.trail = s.trail.slice(-12);

      // Particles
      s.particles = s.particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.12,
          life: p.life - dt,
        }))
        .filter((p) => p.life > 0);

      // DRAW
      ctx.clearRect(0, 0, BOARD_W, BOARD_H);
      const baseGrad = ctx.createRadialGradient(BOARD_W / 2, BOARD_H / 2, 0, BOARD_W / 2, BOARD_H / 2, Math.max(BOARD_W, BOARD_H));
      baseGrad.addColorStop(0, pal.base[0]);
      baseGrad.addColorStop(0.55, pal.base[1]);
      baseGrad.addColorStop(1, pal.base[2]);
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, BOARD_W, BOARD_H);

      // Darkroom: the safelight, a warm wash spilling down from the top edge.
      if (pal.lamp) {
        const lamp = ctx.createRadialGradient(BOARD_W / 2, -CELL, 0, BOARD_W / 2, -CELL, BOARD_H);
        lamp.addColorStop(0, pal.lamp);
        lamp.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = lamp;
        ctx.fillRect(0, 0, BOARD_W, BOARD_H);
      }

      // Diagonal scan-line streaks drifting across the floor
      ctx.save();
      ctx.globalAlpha = pal.scanAlpha;
      ctx.strokeStyle = pal.scan;
      ctx.lineWidth = 1;
      const scanOffset = (now / 18) % 30;
      for (let i = -BOARD_H; i < BOARD_W + BOARD_H; i += 30) {
        ctx.beginPath();
        ctx.moveTo(i + scanOffset, 0);
        ctx.lineTo(i + scanOffset - BOARD_H, BOARD_H);
        ctx.stroke();
      }
      ctx.restore();

      // Animated data-flow filaments around the perimeter
      ctx.save();
      ctx.strokeStyle = pal.filament;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 4; i++) {
        const phase = (now / 4000 + i * 0.25) % 1;
        const inset = 4 + i * 6;
        ctx.globalAlpha = 0.3 - i * 0.06;
        ctx.beginPath();
        ctx.rect(inset, inset, BOARD_W - inset * 2, BOARD_H - inset * 2);
        const dashLen = 60;
        ctx.setLineDash([dashLen, 80]);
        ctx.lineDashOffset = -(phase * (dashLen + 80) * 8);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // Floor cells
      const cellPulse = 0.55 + 0.25 * Math.sin(now / 600);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (walls[r][c]) continue;
          const x = c * CELL;
          const y = r * CELL;
          if (pal.snowFloor) {
            // Snow: a soft pad of packed snow with a crusted speckle or two,
            // instead of the tech tile's ruled corners.
            const pad = ctx.createLinearGradient(x, y, x, y + CELL);
            pad.addColorStop(0, pal.floorTint[0]);
            pad.addColorStop(1, pal.floorTint[1]);
            roundRectPath(ctx, x + 3, y + 3, CELL - 6, CELL - 6, 11);
            ctx.fillStyle = pad;
            ctx.fill();
            ctx.strokeStyle = `rgba(${pal.floorLineRGB}, ${0.1 * cellPulse + 0.06})`;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.fillStyle = pal.floorTick;
            ctx.fillRect(x + 12 + ((r * 7 + c * 5) % 9), y + 13, 2, 2);
            ctx.fillRect(x + CELL - 17 - ((r * 3 + c * 11) % 9), y + CELL - 15, 2, 2);
            continue;
          }
          const tint = ctx.createLinearGradient(x, y, x, y + CELL);
          tint.addColorStop(0, pal.floorTint[0]);
          tint.addColorStop(1, pal.floorTint[1]);
          ctx.fillStyle = tint;
          ctx.fillRect(x + 4, y + 4, CELL - 8, CELL - 8);
          ctx.strokeStyle = `rgba(${pal.floorLineRGB}, ${0.14 * cellPulse + 0.08})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6);
          ctx.strokeStyle = pal.floorTick;
          ctx.lineWidth = 1.2;
          const tick = 5;
          ctx.beginPath();
          ctx.moveTo(x + 3, y + 3 + tick); ctx.lineTo(x + 3, y + 3); ctx.lineTo(x + 3 + tick, y + 3);
          ctx.moveTo(x + CELL - 3, y + 3 + tick); ctx.lineTo(x + CELL - 3, y + 3); ctx.lineTo(x + CELL - 3 - tick, y + 3);
          ctx.moveTo(x + 3, y + CELL - 3 - tick); ctx.lineTo(x + 3, y + CELL - 3); ctx.lineTo(x + 3 + tick, y + CELL - 3);
          ctx.moveTo(x + CELL - 3, y + CELL - 3 - tick); ctx.lineTo(x + CELL - 3, y + CELL - 3); ctx.lineTo(x + CELL - 3 - tick, y + CELL - 3);
          ctx.stroke();
        }
      }

      // Walls
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!walls[r][c]) continue;
          const x = c * CELL;
          const y = r * CELL;
          const grad = ctx.createLinearGradient(x, y, x + CELL, y + CELL);
          grad.addColorStop(0, pal.wall[0]);
          grad.addColorStop(0.5, pal.wall[1]);
          grad.addColorStop(1, pal.wall[2]);
          ctx.fillStyle = grad;
          ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
          ctx.fillStyle = pal.wallRivet;
          ctx.fillRect(x + CELL / 2 - 1, y + 8, 2, 2);
          ctx.fillRect(x + 8, y + CELL / 2 - 1, 2, 2);
          ctx.fillRect(x + CELL - 10, y + CELL / 2 - 1, 2, 2);
          ctx.fillRect(x + CELL / 2 - 1, y + CELL - 10, 2, 2);
          ctx.save();
          ctx.beginPath();
          ctx.rect(x + 2, y + 2, CELL - 4, CELL - 4);
          ctx.clip();
          const stripe = ((now / 8) % (CELL * 2)) - CELL;
          const sg = ctx.createLinearGradient(x + stripe, y, x + stripe + CELL, y + CELL);
          sg.addColorStop(0, pal.wallStripe[0]);
          sg.addColorStop(0.5, pal.wallStripe[1]);
          sg.addColorStop(1, pal.wallStripe[0]);
          ctx.fillStyle = sg;
          ctx.fillRect(x, y, CELL, CELL);
          ctx.restore();
          ctx.strokeStyle = pal.wallStroke;
          ctx.shadowColor = pal.wallGlow;
          ctx.shadowBlur = 8;
          ctx.lineWidth = 1.4;
          ctx.strokeRect(x + 2.5, y + 2.5, CELL - 5, CELL - 5);
          ctx.shadowBlur = 0;
        }
      }

      // Exit portal
      const exitX = (COLS - 1) * CELL + CELL / 2;
      const exitY = (ROWS - 1) * CELL + CELL / 2;
      const portalPulse = 0.7 + 0.3 * Math.sin(now / 350);
      const halo = ctx.createRadialGradient(exitX, exitY, 0, exitX, exitY, CELL);
      halo.addColorStop(0, `rgba(${pal.exitHaloRGB}, ${0.65 * portalPulse})`);
      halo.addColorStop(0.5, pal.exitHaloMid);
      halo.addColorStop(1, pal.exitHaloEdge);
      ctx.fillStyle = halo;
      ctx.fillRect(exitX - CELL, exitY - CELL, CELL * 2, CELL * 2);
      for (let k = 0; k < 3; k++) {
        const radius = CELL / 2 - 6 - k * 5;
        if (radius <= 4) break;
        ctx.save();
        ctx.translate(exitX, exitY);
        ctx.rotate((now / (450 + k * 120)) * (k % 2 === 0 ? 1 : -1));
        ctx.strokeStyle = pal.exitRings[k];
        ctx.lineWidth = 2;
        ctx.shadowColor = pal.exitGlow;
        ctx.shadowBlur = 12;
        ctx.setLineDash([10, 6]);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
      ctx.shadowBlur = 0;
      ctx.setLineDash([]);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(exitX, exitY, 2 + portalPulse * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Gates
      for (const g of s.gates) {
        if (g.open) continue;
        const gx = g.col * CELL;
        const gy = g.row * CELL;
        const cxg = gx + CELL / 2;
        const cyg = gy + CELL / 2;
        const flashing = now < g.flashUntil;
        const baseCol = flashing ? pal.gateFlash : pal.gateBase;
        const accent = flashing ? pal.gateFlashAccent : pal.gateAccent;
        const pulse = 0.6 + 0.4 * Math.sin(now / 280);
        const gateGlow = ctx.createRadialGradient(cxg, cyg, 0, cxg, cyg, CELL / 2 + 4);
        gateGlow.addColorStop(0, flashing ? pal.gateFlashGlow : pal.gateGlow);
        gateGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gateGlow;
        ctx.fillRect(gx, gy, CELL, CELL);
        if (pal.printGates) {
          // Darkroom: a little photo print hung in the gate cell, swaying
          // gently under the safelight, a "?" developing in its dark photo.
          const pw = CELL - 18;
          const ph = CELL - 12;
          const edge = 3.5;
          const photoH = ph - edge - 9;
          ctx.save();
          ctx.translate(cxg, cyg);
          ctx.rotate(Math.sin(now / 700 + g.col + g.row) * 0.09);
          ctx.shadowColor = baseCol;
          ctx.shadowBlur = 14 * pulse;
          ctx.fillStyle = pal.gateFill;
          ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
          ctx.shadowBlur = 0;
          const photoGrad = ctx.createLinearGradient(0, -ph / 2 + edge, 0, -ph / 2 + edge + photoH);
          photoGrad.addColorStop(0, "#7a4526");
          photoGrad.addColorStop(1, "#24100a");
          ctx.fillStyle = photoGrad;
          ctx.fillRect(-pw / 2 + edge, -ph / 2 + edge, pw - edge * 2, photoH);
          // The tape holding it up
          ctx.globalAlpha = 0.85;
          ctx.fillStyle = accent;
          ctx.fillRect(-7, -ph / 2 - 3, 14, 6);
          ctx.globalAlpha = 1;
          ctx.fillStyle = pal.gateGlyph;
          ctx.font = "900 18px ui-rounded, 'Fredoka', system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.shadowColor = baseCol;
          ctx.shadowBlur = 8;
          ctx.fillText("?", 0, -ph / 2 + edge + photoH / 2 + 1);
          ctx.shadowBlur = 0;
          ctx.restore();
          continue;
        }
        if (pal.signGates) {
          // Snow: a wooden trail signpost planted in the drift, its arm
          // creaking in the wind under a cap of snow, a "?" burnt into it.
          const armW = CELL - 20;
          const armH = 19;
          ctx.save();
          ctx.translate(cxg, cyg + 6);
          ctx.rotate(Math.sin(now / 900 + g.col + g.row) * 0.05);
          ctx.fillStyle = "#6b4a24";
          ctx.fillRect(-3, -6, 6, CELL / 2 - 6);
          ctx.shadowColor = baseCol;
          ctx.shadowBlur = 14 * pulse;
          ctx.fillStyle = pal.gateFill;
          roundRectPath(ctx, -armW / 2, -armH - 4, armW, armH, 4);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.strokeStyle = baseCol;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          // the pointing tip of the plank
          ctx.beginPath();
          ctx.moveTo(armW / 2 - 1, -armH - 4);
          ctx.lineTo(armW / 2 + 7, -armH / 2 - 4);
          ctx.lineTo(armW / 2 - 1, -4);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          // a cap of snow along the top edge
          ctx.fillStyle = accent;
          roundRectPath(ctx, -armW / 2 - 1, -armH - 8, armW + 3, 5, 2.5);
          ctx.fill();
          ctx.fillStyle = pal.gateGlyph;
          ctx.font = "900 15px ui-rounded, 'Fredoka', system-ui, sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("?", 0, -armH / 2 - 3.5);
          ctx.restore();
          continue;
        }
        ctx.save();
        ctx.translate(cxg, cyg);
        ctx.rotate(now / 1200);
        const hr = CELL / 2 - 9;
        ctx.fillStyle = pal.gateFill;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i;
          const px = Math.cos(a) * hr;
          const py = Math.sin(a) * hr;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = baseCol;
        ctx.shadowColor = baseCol;
        ctx.shadowBlur = 14 * pulse;
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
        ctx.save();
        ctx.translate(cxg, cyg);
        ctx.rotate(-now / 600);
        ctx.setLineDash([6, 6]);
        ctx.lineDashOffset = -(now / 20) % 24;
        ctx.strokeStyle = accent;
        ctx.globalAlpha = 0.6;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(0, 0, hr + 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        ctx.setLineDash([]);
        ctx.fillStyle = pal.gateGlyph;
        ctx.font = "900 20px ui-rounded, 'Fredoka', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = baseCol;
        ctx.shadowBlur = 8;
        ctx.fillText("?", cxg, cyg);
        ctx.shadowBlur = 0;
      }

      // Tokens
      for (const t of s.tokens) {
        if (t.collected) continue;
        const tx = t.col * CELL + CELL / 2;
        const ty = t.row * CELL + CELL / 2 + Math.sin(now / 280 + t.col + t.row) * 2;
        ctx.save();
        ctx.translate(tx, ty);
        if (pal.lanternTokens) {
          // Snow (Week 12): a little storm lantern swinging on its handle.
          ctx.rotate(Math.sin(now / 520 + t.col + t.row) * 0.16);
          ctx.shadowColor = pal.tokenGlow;
          ctx.shadowBlur = 16;
          ctx.strokeStyle = pal.tokenStroke;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          ctx.arc(0, -10, 5.5, Math.PI, 0);
          ctx.stroke();
          const glass = ctx.createLinearGradient(0, -8, 0, 10);
          glass.addColorStop(0, pal.token[0]);
          glass.addColorStop(0.5, pal.token[1]);
          glass.addColorStop(1, pal.token[2]);
          ctx.fillStyle = glass;
          roundRectPath(ctx, -7, -8, 14, 17, 4);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = pal.tokenStroke;
          ctx.fillRect(-8, -11, 16, 3.5);
          ctx.fillRect(-8, 9, 16, 3.5);
          ctx.fillStyle = "rgba(255,255,255,0.75)";
          ctx.beginPath();
          ctx.ellipse(0, 1, 2.4, 4.2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (pal.printGates) {
          // Darkroom (Week 8): a roll of film, a canister with its sprocketed
          // leader strip poking out, swaying gently. Week 3's shield gem spins.
          ctx.rotate(Math.sin(now / 420 + t.col + t.row) * 0.2);
          ctx.shadowColor = pal.tokenGlow;
          ctx.shadowBlur = 12;
          ctx.fillStyle = "#4a2c16";
          ctx.fillRect(2, -5, 14, 10);
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(255, 226, 170, 0.9)";
          for (const px of [6, 10, 14]) {
            ctx.fillRect(px - 1, -4, 2, 2);
            ctx.fillRect(px - 1, 2, 2, 2);
          }
          const body = ctx.createLinearGradient(-11, 0, 5, 0);
          body.addColorStop(0, pal.token[2]);
          body.addColorStop(0.5, pal.token[0]);
          body.addColorStop(1, pal.token[1]);
          ctx.fillStyle = body;
          ctx.strokeStyle = pal.tokenStroke;
          ctx.lineWidth = 1.5;
          ctx.shadowColor = pal.tokenGlow;
          ctx.shadowBlur = 12;
          ctx.beginPath();
          ctx.moveTo(-8, -10);
          ctx.lineTo(2, -10);
          ctx.quadraticCurveTo(5, -10, 5, -7);
          ctx.lineTo(5, 7);
          ctx.quadraticCurveTo(5, 10, 2, 10);
          ctx.lineTo(-8, 10);
          ctx.quadraticCurveTo(-11, 10, -11, 7);
          ctx.lineTo(-11, -7);
          ctx.quadraticCurveTo(-11, -10, -8, -10);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#2a160b";
          ctx.fillRect(-12, -13, 18, 3);
          ctx.fillRect(-12, 10, 18, 3);
          ctx.fillStyle = pal.tokenStroke;
          ctx.fillRect(-5, -16, 5, 3);
          ctx.fillStyle = "rgba(255,255,255,0.35)";
          ctx.fillRect(-10, -3, 14, 5);
        } else {
          ctx.rotate(now / 500);
          const crystGrad = ctx.createLinearGradient(0, -12, 0, 12);
          crystGrad.addColorStop(0, pal.token[0]);
          crystGrad.addColorStop(0.45, pal.token[1]);
          crystGrad.addColorStop(1, pal.token[2]);
          ctx.fillStyle = crystGrad;
          ctx.strokeStyle = pal.tokenStroke;
          ctx.lineWidth = 2;
          ctx.shadowColor = pal.tokenGlow;
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(0, -12);
          ctx.lineTo(10, -7);
          ctx.lineTo(10, 5);
          ctx.lineTo(0, 12);
          ctx.lineTo(-10, 5);
          ctx.lineTo(-10, -7);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(255,255,255,0.45)";
          ctx.beginPath();
          ctx.moveTo(-4, -7);
          ctx.lineTo(0, -10);
          ctx.lineTo(2, -2);
          ctx.lineTo(-3, 0);
          ctx.closePath();
          ctx.fill();
        }
        ctx.restore();
        const spkA = 0.4 + 0.6 * Math.abs(Math.sin(now / 200 + t.col));
        ctx.fillStyle = `rgba(255,255,255,${spkA})`;
        ctx.beginPath();
        ctx.arc(tx + 8, ty - 10, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Trail
      for (let i = 0; i < s.trail.length; i++) {
        const p = s.trail[i];
        const alpha = (1 - p.age / 350) * 0.45 * (i / s.trail.length);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = pal.trail;
        if (pal.bootTrail) {
          // Snow: every step presses a boot print, sole and heel, instead of
          // a glow blob. The week's whole point, drawn under the hero.
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(i % 2 === 0 ? 0.22 : -0.22);
          ctx.beginPath();
          ctx.ellipse(0, 1, 4.4, 6.8, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.ellipse(0, -7.5, 3.3, 2.9, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          continue;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Player
      const pGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 14);
      pGrad.addColorStop(0, pal.player[0]);
      pGrad.addColorStop(0.5, pal.player[1]);
      pGrad.addColorStop(1, pal.player[2]);
      ctx.fillStyle = pGrad;
      ctx.shadowColor = pal.playerGlow;
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = pal.playerRing;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 11, 0, Math.PI * 2);
      ctx.stroke();

      // "Tap me" rings on the open neighbour cells (the on-board instruction:
      // the child always sees exactly where they can go next).
      if (!s.complete && s.activeGateIdx === null) {
        const ringPulse = 0.5 + 0.5 * Math.sin(now / 320);
        const dirs: Array<[number, number]> = [[-1, 0], [1, 0], [0, -1], [0, 1]];
        for (const [dr, dc] of dirs) {
          const nr = s.cellRow + dr;
          const nc = s.cellCol + dc;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
          if (walls[nr][nc]) continue;
          const nx = nc * CELL;
          const ny = nr * CELL;
          ctx.save();
          ctx.strokeStyle = `rgba(${pal.tapRingRGB ?? "255, 255, 255"}, ${0.35 + 0.45 * ringPulse})`;
          ctx.lineWidth = 2.5;
          ctx.setLineDash([6, 5]);
          ctx.lineDashOffset = -(now / 40) % 22;
          ctx.strokeRect(nx + 7, ny + 7, CELL - 14, CELL - 14);
          ctx.restore();
        }
      }

      // Particles
      for (const p of s.particles) {
        const alpha = Math.max(0, p.life / 700);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.colour;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Snow: flakes drifting down over the whole snowfield.
      if (pal.snowfall) {
        const flakes = scaledParticleCount(44);
        ctx.save();
        ctx.fillStyle = "#ffffff";
        for (let i = 0; i < flakes; i++) {
          const seed = i * 97.3;
          const x = (seed * 7.1 + Math.sin(now / 1700 + i) * 16 + BOARD_W) % BOARD_W;
          const y = (seed * 3.7 + now / (14 + (i % 7))) % BOARD_H;
          ctx.globalAlpha = 0.3 + 0.45 * ((i % 5) / 5);
          ctx.beginPath();
          ctx.arc(x, y, 1 + (i % 3) * 0.7, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      // Fog of war (lighter than before so the next squares always read)
      const fog = ctx.createRadialGradient(s.x, s.y, CELL * 1.6, s.x, s.y, CELL * 4.2);
      fog.addColorStop(0, "rgba(0,0,0,0)");
      fog.addColorStop(1, pal.fog);
      ctx.fillStyle = fog;
      ctx.fillRect(0, 0, BOARD_W, BOARD_H);

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      document.removeEventListener("visibilitychange", onVis);
      ctx.clearRect(0, 0, BOARD_W, BOARD_H);
    };
  }, [walls, pal]);

  const s = state.current;
  const stars = s.wrongCount === 0 ? 3 : s.wrongCount <= 2 ? 2 : 1;
  const activeQ = activeQuestion !== null ? qList[activeQuestion] : null;
  const activeOrder = activeQuestion !== null ? answerOrder[activeQuestion] ?? activeQ?.answers.map((_, i) => i) ?? [] : [];
  const gatesLeft = s.gates.length - s.questionsAnswered;

  // The gate card's contents: the same on both skins (only the paint and the
  // card around it change).
  const gateCardBody = activeQ ? (
    <>
      <div
        style={{
          fontSize: 11,
          letterSpacing: 3,
          color: pal.eyebrow,
          fontWeight: 900,
          marginBottom: 8,
        }}
      >
        {gateLabel ?? "SECURITY GATE"}
      </div>
      {activeQ.from && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, color: pal.fromInk, fontSize: 13, fontWeight: 800 }}>
          <PixIcon emoji="💬" size={18} />
          {activeQ.from} says:
        </div>
      )}
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color: pal.questionInk,
          marginBottom: 18,
          lineHeight: 1.4,
          padding: activeQ.from ? "12px 16px" : 0,
          borderRadius: activeQ.from ? "16px 16px 16px 4px" : 0,
          background: activeQ.from ? "rgba(255,255,255,0.08)" : "transparent",
          border: activeQ.from ? "1.5px solid rgba(255,255,255,0.25)" : "none",
          textAlign: activeQ.from ? "left" : "center",
        }}
      >
        {activeQ.question}
      </div>
      <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: "0.1em", color: pal.promptInk, marginBottom: 10 }}>
        {replyPrompt ?? "WHAT DOES A HERO REPLY?"}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        {activeOrder.map((ai) => (
          <button
            key={ai}
            type="button"
            disabled={speaking || !!feedback}
            onClick={() => answerQuestion(ai)}
            style={{
              padding: "13px 14px",
              borderRadius: 12,
              background: pal.answerBg,
              border: `1.5px solid ${pal.answerBorder}`,
              color: pal.answerInk,
              fontSize: 14.5,
              fontWeight: 700,
              cursor: speaking ? "wait" : "pointer",
              opacity: speaking ? 0.7 : 1,
              textAlign: "left",
              transition: "all 0.15s ease",
              fontFamily: "inherit",
              touchAction: "manipulation",
            }}
            onMouseEnter={(e) => {
              const t = e.currentTarget;
              t.style.background = pal.answerHoverBg;
              t.style.borderColor = pal.answerHoverBorder;
            }}
            onMouseLeave={(e) => {
              const t = e.currentTarget;
              t.style.background = pal.answerBg;
              t.style.borderColor = pal.answerBorder;
            }}
          >
            {activeQ.answers[ai]}
          </button>
        ))}
      </div>
    </>
  ) : null;

  return (
    <ExerciseFrame
      maxWidth={1000}
      aspectRatio={{ w: 486, h: 378 }}
      reserve={220}
      padding={14}
      background={pal.frameBg}
      style={{
        boxShadow: pal.frameShadow,
        color: pal.frameInk,
      }}
    >
      <div tabIndex={0} style={{ outline: "none" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 1.5,
        }}
      >
        <span style={{ color: pal.hudGates }}>
          {gatesLabel ?? "GATES"} {s.questionsAnswered}/{s.gates.length}
        </span>
        <span style={{ color: pal.hudTokens }}>
          {tokensLabel ?? "TOKENS"} {s.tokensCollected}/{s.tokens.length}
        </span>
      </div>

      <canvas
        ref={canvasRef}
        onPointerDown={onCanvasClick}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          borderRadius: 14,
          background: pal.canvasBg,
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
        }}
        aria-label={introTitle ?? "Cyber Maze"}
      />

      {/* On-board action strip: says what to do right now. */}
      <div
        role="status"
        style={{
          marginTop: 10,
          display: "flex",
          justifyContent: "center",
          gap: 8,
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          flexWrap: "wrap",
        }}
      >
        <span style={{ padding: "6px 12px", borderRadius: 999, border: `1.5px solid ${pal.pillBorder}`, background: pal.pillBg, color: pal.pillInk }}>
          {activeQ
            ? pickPrompt ?? "Pick the hero reply to open the gate"
            : s.complete
              ? "You made it out!"
              : movePrompt ?? "Tap a glowing square next to your hero to move"}
        </span>
        {!activeQ && !s.complete && (
          <span style={{ padding: "6px 12px", borderRadius: 999, border: `1.5px solid ${pal.pill2Border}`, color: pal.pill2Ink }}>
            {gatesLeft > 0
              ? `Find the ${gatesLeft} glowing ? gate${gatesLeft === 1 ? "" : "s"}, then the exit at the bottom right`
              : "Every gate open! Head for the exit at the bottom right"}
          </span>
        )}
      </div>

      {/* Sarah's read-aloud chain (audio only; the board waits for her). */}
      {!showIntro && !finished && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="cm-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent="#ffd158" recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "ask" && activeQ && (
            <InfoNarration key={`cm-ask-${activeQuestion}`} speaker={voice} lines={[activeQ.question]} accent="#ffd158" recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {/* Gate card */}
      {activeQ && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: pal.overlayBg,
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 10,
          }}
        >
          {darkroom ? (
            // Darkroom: the gate card is a photo print (white border, taped
            // corners) with the proposal and the replies on its dark photo.
            // Same total padding as the default card, so it fits the same frame.
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 520,
                padding: "8px 8px 14px",
                borderRadius: 6,
                background: "linear-gradient(180deg, #fffdf8 0%, #f1e6d3 100%)",
                boxShadow: "0 24px 60px -24px rgba(0,0,0,0.85), 0 0 60px -12px rgba(255,107,61,0.55)",
                textAlign: "center",
              }}
            >
              <span aria-hidden style={{ ...TAPE_STYLE, left: -20, transform: "rotate(-32deg)" }} />
              <span aria-hidden style={{ ...TAPE_STYLE, right: -20, transform: "rotate(32deg)" }} />
              <div style={{ padding: "12px 16px", borderRadius: 3, background: pal.cardBg, border: pal.cardBorder, boxShadow: pal.cardShadow }}>
                {gateCardBody}
              </div>
            </div>
          ) : (
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 22,
              borderRadius: 18,
              background: pal.cardBg,
              border: pal.cardBorder,
              boxShadow: pal.cardShadow,
              textAlign: "center",
            }}
          >
            {gateCardBody}
          </div>
          )}
        </div>
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? "Maze cleared!"}
          stars={stars}
          statLines={[
            `${s.questionsAnswered}/${s.gates.length} ${gatesDoneLabel ?? "gates opened with a hero reply"}`,
            completeLine ?? `${s.tokensCollected}/${s.tokens.length} tokens collected along the way.`,
          ]}
          narration={completeNarration}
          onContinue={() => {
            audio.tap();
            onComplete(s.questionsAnswered);
          }}
        />
      )}
      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "Cyber Maze"}
          subtitle={
            introSubtitle ??
            "Find your way through the maze. Every gate asks a question - the right answer opens it. Collect the tokens along the way!"
          }
          icon={introIcon ?? "🧩"}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          overlay
          onDismiss={() => setShowIntro(false)}
        />
      )}
      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker={voice}
          onContinue={() => setFeedback(null)}
        />
      )}
      {/* Tiered hint - kicks in when the same gate has been failed twice */}
      {!feedback &&
        activeQuestion !== null &&
        s.activeGateIdx !== null &&
        (wrongOnGate[s.activeGateIdx] ?? 0) >= 2 && (
          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 12,
              zIndex: 10,
            }}
          >
            <HintBubble
              tier={(wrongOnGate[s.activeGateIdx] ?? 0) >= 3 ? 3 : 2}
              speaker={voice}
              text={
                (wrongOnGate[s.activeGateIdx] ?? 0) >= 3
                  ? hints?.tier3 ?? "Read the question slowly. One answer matches what we learned earlier - the others don't."
                  : hints?.tier2 ?? "Read the question slowly. One answer matches what we learned earlier - the others don't."
              }
            />
          </div>
        )}
      <span style={{ display: "none" }}>{render}</span>
      {fx.layer()}
      {verdict.element}
      </div>
    </ExerciseFrame>
  );
}
