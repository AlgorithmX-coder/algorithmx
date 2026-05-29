"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import { validateMaze, pathFromExit } from "./maze-helpers";
import { PixarFinishOverlay } from "@/app/components/scene";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import { setupHiDpiCanvas, scaledParticleCount, playSoftWrong } from "@/app/lib/gameEngine";

export interface MazeQuestion {
  question: string;
  answers: string[];
  correctIndex: number;
}

export interface CyberMazeProps {
  questions: MazeQuestion[];
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
  // Deduplicate
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
  // Pick up to 6 spread across the map.
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
    answers: [
      "Your home address",
      "Your favourite game",
      "Your favourite colour",
      "Your age range",
    ],
    correctIndex: 0,
  },
  {
    question: "A strong password should have...",
    answers: [
      "At least 8 characters with a mix",
      "Your name",
      "Just numbers",
      "One word",
    ],
    correctIndex: 0,
  },
  {
    question: "If someone online asks to meet in person...",
    answers: [
      "Tell a trusted adult immediately",
      "Meet them at a park",
      "Ask a friend to come",
      "Ignore it",
    ],
    correctIndex: 0,
  },
  {
    question: "Two-factor authentication means...",
    answers: [
      "A second check to prove it's you",
      "Two passwords",
      "Logging in twice",
      "Two email addresses",
    ],
    correctIndex: 0,
  },
  {
    question: "What is a digital footprint?",
    answers: [
      "Everything you do online that stays",
      "Your shoe size",
      "A computer game",
      "Your profile picture",
    ],
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

  const walls = useMemo(() => {
    return VALIDATED.grid.map((row) => row.map((v) => v === 1));
  }, []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const state = useRef({
    // player position in cells (logical)
    cellCol: 0,
    cellRow: 0,
    // tween animation
    fromX: 0,
    fromY: 0,
    toX: 0,
    toY: 0,
    tweenStart: 0,
    tweenDuration: 150,
    // current render position
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

  // Hint-tier emission. CyberMaze gates surface the HintBubble when
  // a single gate has been failed >= 2 times, so the screen reaches
  // tier 2 first and tier 3 at 3+ wrongs on the same gate. We
  // compute the max across all gates so the screen's overall tier
  // reflects the worst point. The hook dedupes per-screen, so
  // re-emitting on every wrongOnGate change is safe.
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

  const resetExercise = () => {
    state.current = {
      cellCol: 0,
      cellRow: 0,
      fromX: 0,
      fromY: 0,
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
      })),
      tokens: TOKENS.map((t) => ({ ...t, collected: false })),
      tokensCollected: 0,
      questionsAnswered: 0,
      wrongCount: 0,
      activeGateIdx: null,
      complete: false,
      particles: [],
      particleId: 0,
      trail: [],
    };
    startTimeRef.current = performance.now();
    setActiveQuestion(null);
    setFinished(false);
    setShowIntro(true);
    setRender((n) => n + 1);
  };

  useEffect(() => {
    startTimeRef.current = performance.now();
    state.current.x = CELL / 2;
    state.current.y = CELL / 2;
  }, []);

  const tryMove = (dr: number, dc: number) => {
    const s = state.current;
    if (showIntro) return;
    if (s.complete || activeQuestion !== null) return;
    if (performance.now() < s.tweenStart + s.tweenDuration) return;
    const newRow = s.cellRow + dr;
    const newCol = s.cellCol + dc;
    if (newRow < 0 || newRow >= ROWS || newCol < 0 || newCol >= COLS) return;
    if (walls[newRow][newCol]) return;
    // Gate collision - only stop if gate isn't open yet
    const gateIdx = s.gates.findIndex(
      (g) => g.row === newRow && g.col === newCol
    );
    if (gateIdx >= 0 && !s.gates[gateIdx].open) {
      // trigger question
      s.activeGateIdx = gateIdx;
      setActiveQuestion(s.gates[gateIdx].qIdx);
      playSound("select");
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
      playSound("xpGain");
      // sparkle burst (adaptive: low-power tier renders fewer dots)
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
      void correctAnswerBurst();
      window.setTimeout(() => setFinished(true), 1000);
    }
    setRender((n) => n + 1);
  };

  const answerQuestion = (choice: number) => {
    const s = state.current;
    if (s.activeGateIdx === null) return;
    const gate = s.gates[s.activeGateIdx];
    const q = qList[gate.qIdx];

    // Per-question hook for persistence + analytics. Fires once per
    // answer regardless of correct/wrong - the parent decides what
    // to persist. `questionIndex` is the position in the input list
    // so the parent can build a stable key.
    onAnswered?.({
      questionIndex: gate.qIdx,
      selectedIndex: choice,
      correctIndex: q.correctIndex,
      wasCorrect: choice === q.correctIndex,
    });

    if (choice === q.correctIndex) {
      // Open the gate, play correct, continue motion into that cell
      gate.open = true;
      s.questionsAnswered += 1;
      playSound("correct");
      onCorrect?.();
      // burst at gate
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
    } else {
      // wrong: push back a cell in any open direction away from gate
      s.wrongCount += 1;
      gate.flashUntil = performance.now() + 500;
      playSoftWrong();
      onWrong?.();
      // Pause-on-wrong: explain the correct answer before letting the
      // child move on. The maze gate stays closed so they'll have to
      // re-attempt the question on the next pass.
      setWrongOnGate((prev) => ({
        ...prev,
        [s.activeGateIdx!]: (prev[s.activeGateIdx!] ?? 0) + 1,
      }));
      setFeedback({
        title: "Not quite",
        explanation: `The right answer was "${q.answers[q.correctIndex]}". Read the question again next time you reach this gate.`,
        tip: "Use what we learned: strong passwords are long, mixed, secret and unique.",
      });
      // push back to previous cell (approx): move player back to start-side neighbour
      // simplest: bump back by one cell in direction away from gate, or stay
      const dirs: Array<[number, number]> = [
        [-1, 0],
        [1, 0],
        [0, -1],
        [0, 1],
      ];
      for (const [dr, dc] of dirs) {
        const nr = s.cellRow + dr;
        const nc = s.cellCol + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (walls[nr][nc]) continue;
        const isGate = s.gates.some(
          (g) => g.row === nr && g.col === nc && !g.open
        );
        if (isGate) continue;
        // push back
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
      // Re-trigger: open question again after a beat if player re-enters the cell
    }
    setRender((n) => n + 1);
  };

  // Keyboard input
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
  }, [activeQuestion]);

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
    // Hi-DPI buffer so the maze grid lines, gate glyphs and token
    // sparkles render at native pixel sharpness on Retina/2x screens.
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
      // True-pause when tab is hidden. The maze loop draws fog, a
      // trail, and particles every frame - none of which need to
      // tick while invisible.
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
      // Cyber-grid base - radial gradient plus animated diagonal scan lines
      // and a subtle nebula glow. Reads like a holographic data-vault floor.
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

      // Floor cells - pulsing hex-style outlines with a soft inner tint
      const cellPulse = 0.55 + 0.25 * Math.sin(now / 600);
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (walls[r][c]) continue;
          const x = c * CELL;
          const y = r * CELL;
          // Inner tint
          const tint = ctx.createLinearGradient(x, y, x, y + CELL);
          tint.addColorStop(0, "rgba(255, 200, 130, 0.08)");
          tint.addColorStop(1, "rgba(255, 95, 179, 0.06)");
          ctx.fillStyle = tint;
          ctx.fillRect(x + 4, y + 4, CELL - 8, CELL - 8);
          // Outline
          ctx.strokeStyle = `rgba(124, 92, 255, ${0.14 * cellPulse + 0.08})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 3, y + 3, CELL - 6, CELL - 6);
          // Corner ticks (HUD-style)
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

      // Walls - neon-edged data blocks with a moving highlight stripe
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
          // Inner circuit dots
          ctx.fillStyle = "rgba(125, 240, 255, 0.4)";
          ctx.fillRect(x + CELL / 2 - 1, y + 8, 2, 2);
          ctx.fillRect(x + 8, y + CELL / 2 - 1, 2, 2);
          ctx.fillRect(x + CELL - 10, y + CELL / 2 - 1, 2, 2);
          ctx.fillRect(x + CELL / 2 - 1, y + CELL - 10, 2, 2);
          // Moving highlight stripe
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
          // Warm edge
          ctx.strokeStyle = "rgba(124, 92, 255, 0.7)";
          ctx.shadowColor = "#00e5ff";
          ctx.shadowBlur = 8;
          ctx.lineWidth = 1.4;
          ctx.strokeRect(x + 2.5, y + 2.5, CELL - 5, CELL - 5);
          ctx.shadowBlur = 0;
        }
      }

      // Exit portal - multi-ring cinematic vortex
      const exitX = (COLS - 1) * CELL + CELL / 2;
      const exitY = (ROWS - 1) * CELL + CELL / 2;
      const portalPulse = 0.7 + 0.3 * Math.sin(now / 350);
      // Outer halo
      const halo = ctx.createRadialGradient(exitX, exitY, 0, exitX, exitY, CELL);
      halo.addColorStop(0, `rgba(255, 220, 130, ${0.65 * portalPulse})`);
      halo.addColorStop(0.5, "rgba(124, 92, 255, 0.32)");
      halo.addColorStop(1, "rgba(212, 115, 58, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(exitX - CELL, exitY - CELL, CELL * 2, CELL * 2);
      // Concentric spinning rings
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
      // Inner sparkle dot
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(exitX, exitY, 2 + portalPulse * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Gates - pulsing hex-coded data nodes with rotating outline
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
        // Soft glow
        const gateGlow = ctx.createRadialGradient(cxg, cyg, 0, cxg, cyg, CELL / 2 + 4);
        gateGlow.addColorStop(0, flashing ? "rgba(255, 95, 179, 0.55)" : "rgba(255, 220, 130, 0.5)");
        gateGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = gateGlow;
        ctx.fillRect(gx, gy, CELL, CELL);
        // Hex body
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
        // Animated dashed counter-ring
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
        // ? glyph
        ctx.fillStyle = "#e8edff";
        ctx.font = "900 20px ui-rounded, 'Fredoka', system-ui, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.shadowColor = baseCol;
        ctx.shadowBlur = 8;
        ctx.fillText("?", cxg, cyg);
        ctx.shadowBlur = 0;
      }

      // Tokens - 3D-looking data crystals with sparkle
      for (const t of s.tokens) {
        if (t.collected) continue;
        const tx = t.col * CELL + CELL / 2;
        const ty = t.row * CELL + CELL / 2 + Math.sin(now / 280 + t.col + t.row) * 2;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(now / 500);
        // Outer crystal
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
        // Inner facet (lighter)
        ctx.fillStyle = "rgba(255,255,255,0.45)";
        ctx.beginPath();
        ctx.moveTo(-4, -7);
        ctx.lineTo(0, -10);
        ctx.lineTo(2, -2);
        ctx.lineTo(-3, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
        // Floating sparkle
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

      // Player - warm gold-coral hero orb
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

      // Fog of war
      const fog = ctx.createRadialGradient(
        s.x,
        s.y,
        CELL * 1.2,
        s.x,
        s.y,
        CELL * 3.5
      );
      fog.addColorStop(0, "rgba(0,0,0,0)");
      fog.addColorStop(1, "rgba(0,0,0,0.55)");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walls]);

  const s = state.current;
  const secs = Math.floor((performance.now() - startTimeRef.current) / 1000);
  const stars = s.wrongCount === 0 ? 3 : s.wrongCount <= 2 ? 2 : 1;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        // Maze canvas is 486×378 (aspect ~1.286). Reserve 220px for
        // HUD + safe-area + outer padding so the maze never gets
        // clipped at the bottom on short viewports.
        // Expanded cap: the maze grid scales up with the viewport.
        // Capped at 1000px because the maze cells start to feel
        // oversized beyond that.
        maxWidth: "min(1000px, calc((100dvh - 220px) * 486 / 378))",
        margin: "0 auto",
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)",
        boxShadow:
          "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
        color: "#e8edff",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        padding: 14,
      }}
      tabIndex={0}
    >
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
          GATES {s.questionsAnswered}/{s.gates.length}
        </span>
        <span style={{ color: "#00e5ff" }}>
          TOKENS {s.tokensCollected}/{s.tokens.length}
        </span>
        <span style={{ color: "#7c5cff", fontFamily: "monospace" }}>
          TIME {secs}s
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
          cursor: "pointer",
          touchAction: "manipulation",
        }}
        aria-label="Cyber Maze"
      />

      <div
        style={{
          marginTop: 8,
          fontSize: 11,
          color: "#64748b",
          textAlign: "center",
        }}
      >
        Arrow keys / WASD / tap an adjacent cell to move
      </div>

      {/* Question modal */}
      {activeQuestion !== null && (
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
              maxWidth: 460,
              padding: 22,
              borderRadius: 18,
              background:
                "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(5,8,18,0.98))",
              border: "2px solid rgba(0,229,255,0.5)",
              boxShadow: "0 0 30px rgba(124,92,255,0.35)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: "#93c5fd",
                fontWeight: 900,
                marginBottom: 6,
              }}
            >
              SECURITY GATE
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#f1f5f9",
                marginBottom: 18,
                lineHeight: 1.35,
              }}
            >
              {qList[activeQuestion].question}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {qList[activeQuestion].answers.map((a, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => answerQuestion(i)}
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: "rgba(30,41,59,0.8)",
                    border: "1px solid rgba(0,229,255,0.35)",
                    color: "#e8edff",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    const t = e.currentTarget;
                    t.style.background = "rgba(124,92,255,0.2)";
                    t.style.borderColor = "#00e5ff";
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget;
                    t.style.background = "rgba(30,41,59,0.8)";
                    t.style.borderColor = "rgba(0,229,255,0.35)";
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {finished && (
        <PixarFinishOverlay
          badge="Maze Cleared"
          title="WELL DONE!"
          subline={`${s.questionsAnswered}/${s.gates.length} gates · ${s.tokensCollected}/${s.tokens.length} tokens · ${secs}s · ${s.wrongCount} wrong`}
          stars={stars}
          onContinue={() => {
            playSound("click");
            onComplete(s.questionsAnswered);
          }}
          onRetry={() => {
            playSound("select");
            resetExercise();
          }}
        />
      )}
      {showIntro && (
        <ExerciseIntro
          title="Cyber Maze"
          description="Navigate through the maze and answer questions at each gate to unlock the path! Collect shield tokens along the way!"
          icon="🧩"
          controls="Arrow keys / WASD to move"
          onStart={() => setShowIntro(false)}
        />
      )}
      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker="layla"
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
              speaker="adam"
              text="Read the question slowly. One answer matches what we learned earlier - the other three don't."
            />
          </div>
        )}
      <span style={{ display: "none" }}>{render}</span>
    </div>
  );
}
