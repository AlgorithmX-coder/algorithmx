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
 */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import { validateMaze, pathFromExit } from "./maze-helpers";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
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

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;

const SPOKEN_GATE_MAX_MS = 15000;

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
  introTitle,
  introSubtitle,
  introIcon,
  gateLabel,
  gatesLabel,
  tokensLabel,
  movePrompt,
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
  const voice = introNarration?.speaker ?? "adam";

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
    fromX: 0,
    fromY: 0,
    toX: 0,
    toY: 0,
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
  // Read-aloud chain: the how-to once as the maze appears, each gate's
  // proposal as its card opens, the why after the hero reply. Taps are held
  // while Sarah speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "ask" | "why" | "idle">("idle");
  const [whyText, setWhyText] = useState<string | null>(null);
  // NO SEQUENCE (owner rule): each gate's replies show in a random order every
  // play (authored data leads with the hero reply). Shuffled after mount so the
  // server and first client render agree.
  const [answerOrder, setAnswerOrder] = useState<number[][]>(() => qList.map((q) => q.answers.map((_, i) => i)));
  useIsoLayoutEffect(() => {
    setAnswerOrder(qList.map((q) => fisherYates(q.answers.map((_, i) => i))));
  }, [qList]);

  const speaking = narr !== "idle";

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
          colour: ["#00e5ff", "#fbbf24", "#f97316"][i % 3],
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
          colour: ["#7eff97", "#00e5ff", "#00e5ff"][i % 3],
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
      // Sarah explains why that was the hero reply (audio only).
      if (q.why && !isAudioMuted()) {
        setWhyText(q.why);
        setNarr("why");
      }
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
      baseGrad.addColorStop(0, "#1a2147");
      baseGrad.addColorStop(0.55, "#0f1530");
      baseGrad.addColorStop(1, "#080a16");
      ctx.fillStyle = baseGrad;
      ctx.fillRect(0, 0, BOARD_W, BOARD_H);

      // Diagonal scan-line streaks drifting across the floor
      ctx.save();
      ctx.globalAlpha = 0.1;
      ctx.strokeStyle = "#00e5ff";
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
      ctx.strokeStyle = "rgba(124, 92, 255, 0.22)";
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
          const tint = ctx.createLinearGradient(x, y, x, y + CELL);
          tint.addColorStop(0, "rgba(255, 200, 130, 0.08)");
          tint.addColorStop(1, "rgba(255, 95, 179, 0.06)");
          ctx.fillStyle = tint;
          ctx.fillRect(x + 4, y + 4, CELL - 8, CELL - 8);
          ctx.strokeStyle = `rgba(124, 92, 255, ${0.14 * cellPulse + 0.08})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6);
          ctx.strokeStyle = "rgba(125, 240, 255, 0.3)";
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
          grad.addColorStop(0, "#6b3818");
          grad.addColorStop(0.5, "#4a2818");
          grad.addColorStop(1, "#2a1208");
          ctx.fillStyle = grad;
          ctx.fillRect(x + 2, y + 2, CELL - 4, CELL - 4);
          ctx.fillStyle = "rgba(125, 240, 255, 0.4)";
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
          sg.addColorStop(0, "rgba(124, 92, 255, 0)");
          sg.addColorStop(0.5, "rgba(124, 92, 255, 0.28)");
          sg.addColorStop(1, "rgba(124, 92, 255, 0)");
          ctx.fillStyle = sg;
          ctx.fillRect(x, y, CELL, CELL);
          ctx.restore();
          ctx.strokeStyle = "rgba(124, 92, 255, 0.7)";
          ctx.shadowColor = "#00e5ff";
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
      halo.addColorStop(0, `rgba(255, 220, 130, ${0.65 * portalPulse})`);
      halo.addColorStop(0.5, "rgba(124, 92, 255, 0.32)");
      halo.addColorStop(1, "rgba(212, 115, 58, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(exitX - CELL, exitY - CELL, CELL * 2, CELL * 2);
      for (let k = 0; k < 3; k++) {
        const radius = CELL / 2 - 6 - k * 5;
        if (radius <= 4) break;
        ctx.save();
        ctx.translate(exitX, exitY);
        ctx.rotate((now / (450 + k * 120)) * (k % 2 === 0 ? 1 : -1));
        ctx.strokeStyle = k === 0 ? "#7df0ff" : k === 1 ? "#ffd158" : "#7c5cff";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#ffd158";
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
        const baseCol = flashing ? "#ff7a59" : "#ffd158";
        const accent = flashing ? "#f4a89a" : "#ffe9b8";
        const pulse = 0.6 + 0.4 * Math.sin(now / 280);
        const gateGlow = ctx.createRadialGradient(cxg, cyg, 0, cxg, cyg, CELL / 2 + 4);
        gateGlow.addColorStop(0, flashing ? "rgba(255, 95, 179, 0.55)" : "rgba(255, 220, 130, 0.5)");
        gateGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gateGlow;
        ctx.fillRect(gx, gy, CELL, CELL);
        ctx.save();
        ctx.translate(cxg, cyg);
        ctx.rotate(now / 1200);
        const hr = CELL / 2 - 9;
        ctx.fillStyle = "rgba(15, 21, 48, 0.85)";
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
        ctx.fillStyle = "#e8edff";
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
        ctx.rotate(now / 500);
        const crystGrad = ctx.createLinearGradient(0, -12, 0, 12);
        crystGrad.addColorStop(0, "#fef3c7");
        crystGrad.addColorStop(0.45, "#00e5ff");
        crystGrad.addColorStop(1, "#b45309");
        ctx.fillStyle = crystGrad;
        ctx.strokeStyle = "#fbbf24";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#00e5ff";
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
        ctx.fillStyle = "#ffd158";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Player
      const pGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 14);
      pGrad.addColorStop(0, "#7df0ff");
      pGrad.addColorStop(0.5, "#ffd158");
      pGrad.addColorStop(1, "#7c5cff");
      ctx.fillStyle = pGrad;
      ctx.shadowColor = "#7c5cff";
      ctx.shadowBlur = 16;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#e8edff";
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
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.35 + 0.45 * ringPulse})`;
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

      // Fog of war (lighter than before so the next squares always read)
      const fog = ctx.createRadialGradient(s.x, s.y, CELL * 1.6, s.x, s.y, CELL * 4.2);
      fog.addColorStop(0, "rgba(0,0,0,0)");
      fog.addColorStop(1, "rgba(0,0,0,0.45)");
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
  }, [walls]);

  const s = state.current;
  const stars = s.wrongCount === 0 ? 3 : s.wrongCount <= 2 ? 2 : 1;
  const activeQ = activeQuestion !== null ? qList[activeQuestion] : null;
  const activeOrder = activeQuestion !== null ? answerOrder[activeQuestion] ?? activeQ?.answers.map((_, i) => i) ?? [] : [];
  const gatesLeft = s.gates.length - s.questionsAnswered;

  return (
    <ExerciseFrame
      maxWidth={1000}
      aspectRatio={{ w: 486, h: 378 }}
      reserve={220}
      padding={14}
      background="linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)"
      style={{
        boxShadow:
          "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
        color: "#e8edff",
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
        <span style={{ color: "#a0ffb0" }}>
          {gatesLabel ?? "GATES"} {s.questionsAnswered}/{s.gates.length}
        </span>
        <span style={{ color: "#00e5ff" }}>
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
          background: "#0a0e1a",
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
        <span style={{ padding: "6px 12px", borderRadius: 999, border: "1.5px solid #ffd158", background: "rgba(255,209,88,0.14)", color: "#ffe9b8" }}>
          {activeQ
            ? "Pick the hero reply to open the gate"
            : s.complete
              ? "You made it out!"
              : movePrompt ?? "Tap a glowing square next to your hero to move"}
        </span>
        {!activeQ && !s.complete && (
          <span style={{ padding: "6px 12px", borderRadius: 999, border: "1.5px solid rgba(125,240,255,0.4)", color: "#9fd8ff" }}>
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
          {narr === "why" && whyText && (
            <InfoNarration key={`cm-why-${s.questionsAnswered}`} speaker={voice} lines={[whyText]} accent="#ffd158" recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {/* Gate card */}
      {activeQ && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(5,8,18,0.88)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              padding: 22,
              borderRadius: 18,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(5,8,18,0.98))",
              border: "2px solid rgba(255,209,88,0.55)",
              boxShadow: "0 0 30px rgba(124,92,255,0.35)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "#ffd158",
                fontWeight: 900,
                marginBottom: 8,
              }}
            >
              {gateLabel ?? "SECURITY GATE"}
            </div>
            {activeQ.from && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 8, color: "#c9b8ff", fontSize: 13, fontWeight: 800 }}>
                <PixIcon emoji="💬" size={18} />
                {activeQ.from} says:
              </div>
            )}
            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#f1f5f9",
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
            <div style={{ fontSize: 11.5, fontWeight: 900, letterSpacing: "0.1em", color: "#9fd8ff", marginBottom: 10 }}>
              WHAT DOES A HERO REPLY?
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
                    background: "rgba(30,41,59,0.8)",
                    border: "1.5px solid rgba(255,209,88,0.4)",
                    color: "#e8edff",
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
                    t.style.background = "rgba(124,92,255,0.2)";
                    t.style.borderColor = "#ffd158";
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget;
                    t.style.background = "rgba(30,41,59,0.8)";
                    t.style.borderColor = "rgba(255,209,88,0.4)";
                  }}
                >
                  {activeQ.answers[ai]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? "Maze cleared!"}
          stars={stars}
          statLines={[
            `${s.questionsAnswered}/${s.gates.length} gates opened with a hero reply`,
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
      </div>
    </ExerciseFrame>
  );
}
