"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";

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

// BFS from (0,0) through all 0-cells. Returns the distance map; Infinity if unreachable.
function bfs(grid: number[][]): number[][] {
  const dist: number[][] = Array.from({ length: ROWS }, () =>
    Array(COLS).fill(Infinity)
  );
  if (grid[0][0] === 1) return dist;
  const q: Array<[number, number]> = [[0, 0]];
  dist[0][0] = 0;
  while (q.length) {
    const [r, c] = q.shift()!;
    const d = dist[r][c];
    const neigh: Array<[number, number]> = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    for (const [nr, nc] of neigh) {
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (grid[nr][nc] !== 0) continue;
      if (dist[nr][nc] !== Infinity) continue;
      dist[nr][nc] = d + 1;
      q.push([nr, nc]);
    }
  }
  return dist;
}

// Guarantee start → exit is reachable. If not, knock walls along the bottom
// row open until a path exists. Returns a sanitised grid + the BFS distances.
function validateMaze(src: number[][]): { grid: number[][]; dist: number[][] } {
  const grid = src.map((row) => row.slice());
  let dist = bfs(grid);
  if (dist[ROWS - 1][COLS - 1] === Infinity) {
    // eslint-disable-next-line no-console
    console.warn(
      "[CyberMaze] exit unreachable with initial layout — opening path on bottom row"
    );
    // Open up the bottom row + the right column so exit is always reachable.
    for (let c = 0; c < COLS; c++) grid[ROWS - 1][c] = 0;
    for (let r = 0; r < ROWS; r++) grid[r][COLS - 1] = 0;
    dist = bfs(grid);
  }
  return { grid, dist };
}

const VALIDATED = validateMaze(RAW_MAZE_GRID);

// Pick gate cells along the verified shortest path so every gate is solvable.
// Walk back from the exit using BFS distances to reconstruct a path.
function pathFromExit(grid: number[][], dist: number[][]): Array<{ row: number; col: number }> {
  const path: Array<{ row: number; col: number }> = [];
  let r = ROWS - 1;
  let c = COLS - 1;
  if (dist[r][c] === Infinity) return path;
  while (!(r === 0 && c === 0)) {
    path.push({ row: r, col: c });
    const d = dist[r][c];
    const neigh: Array<[number, number]> = [
      [r - 1, c],
      [r + 1, c],
      [r, c - 1],
      [r, c + 1],
    ];
    let moved = false;
    for (const [nr, nc] of neigh) {
      if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
      if (grid[nr][nc] !== 0) continue;
      if (dist[nr][nc] === d - 1) {
        r = nr;
        c = nc;
        moved = true;
        break;
      }
    }
    if (!moved) break;
  }
  path.push({ row: 0, col: 0 });
  return path.reverse();
}

const SOLUTION_PATH = pathFromExit(VALIDATED.grid, VALIDATED.dist);

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

// Token positions — open cells that are NOT gates and NOT start/exit.
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
    // Gate collision — only stop if gate isn't open yet
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
      // sparkle burst
      for (let i = 0; i < 10; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 3;
        s.particles.push({
          id: ++s.particleId,
          x: s.toX,
          y: s.toY,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 600,
          colour: ["#fde047", "#fbbf24", "#f97316"][i % 3],
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
    if (choice === q.correctIndex) {
      // Open the gate, play correct, continue motion into that cell
      gate.open = true;
      s.questionsAnswered += 1;
      playSound("correct");
      onCorrect?.();
      // burst at gate
      const gx = gate.col * CELL + CELL / 2;
      const gy = gate.row * CELL + CELL / 2;
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 2 + Math.random() * 4;
        s.particles.push({
          id: ++s.particleId,
          x: gx,
          y: gy,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 700,
          colour: ["#4ade80", "#22d3ee", "#fde047"][i % 3],
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
      playSound("wrong");
      onWrong?.();
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = BOARD_W;
    canvas.height = BOARD_H;

    let running = true;
    let lastTime = performance.now();

    const tick = (now: number) => {
      if (!running) return;
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
      ctx.fillStyle = "#0a0e1a";
      ctx.fillRect(0, 0, BOARD_W, BOARD_H);

      // Hex floor hint
      ctx.strokeStyle = "rgba(96,165,250,0.05)";
      ctx.lineWidth = 1;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (walls[r][c]) continue;
          ctx.strokeRect(c * CELL + 3, r * CELL + 3, CELL - 6, CELL - 6);
        }
      }

      // Walls
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!walls[r][c]) continue;
          const x = c * CELL;
          const y = r * CELL;
          const grad = ctx.createLinearGradient(x, y, x, y + CELL);
          grad.addColorStop(0, "#1e3a5f");
          grad.addColorStop(1, "#0b1730");
          ctx.fillStyle = grad;
          ctx.fillRect(x, y, CELL, CELL);
          ctx.strokeStyle = "#3b82f6";
          ctx.lineWidth = 1;
          ctx.strokeRect(x + 1, y + 1, CELL - 2, CELL - 2);
        }
      }

      // Exit portal
      const exitX = (COLS - 1) * CELL + CELL / 2;
      const exitY = (ROWS - 1) * CELL + CELL / 2;
      const portalPulse = 0.7 + 0.3 * Math.sin(now / 350);
      const portalGrad = ctx.createRadialGradient(
        exitX,
        exitY,
        0,
        exitX,
        exitY,
        CELL / 2
      );
      portalGrad.addColorStop(0, `rgba(74,222,128,${portalPulse})`);
      portalGrad.addColorStop(0.5, "rgba(34,197,94,0.35)");
      portalGrad.addColorStop(1, "rgba(22,163,74,0)");
      ctx.fillStyle = portalGrad;
      ctx.fillRect(exitX - CELL / 2, exitY - CELL / 2, CELL, CELL);
      ctx.strokeStyle = "#4ade80";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(exitX, exitY, CELL / 2 - 8, 0, Math.PI * 2);
      ctx.stroke();

      // Gates
      for (const g of s.gates) {
        if (g.open) continue;
        const gx = g.col * CELL;
        const gy = g.row * CELL;
        const flashing = now < g.flashUntil;
        const col = flashing ? "rgba(239,68,68,0.55)" : "rgba(96,165,250,0.45)";
        ctx.fillStyle = col;
        ctx.fillRect(gx + 6, gy + 6, CELL - 12, CELL - 12);
        ctx.strokeStyle = flashing ? "#ef4444" : "#60a5fa";
        ctx.lineWidth = 2;
        ctx.shadowColor = flashing ? "#ef4444" : "#60a5fa";
        ctx.shadowBlur = 14;
        ctx.strokeRect(gx + 6, gy + 6, CELL - 12, CELL - 12);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#dbeafe";
        ctx.font = "900 18px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("?", gx + CELL / 2, gy + CELL / 2);
      }

      // Tokens
      for (const t of s.tokens) {
        if (t.collected) continue;
        const tx = t.col * CELL + CELL / 2;
        const ty = t.row * CELL + CELL / 2;
        ctx.save();
        ctx.translate(tx, ty);
        ctx.rotate(now / 500);
        ctx.fillStyle = "#fde047";
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 2;
        ctx.shadowColor = "#fbbf24";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(8, -6);
        ctx.lineTo(8, 4);
        ctx.lineTo(0, 10);
        ctx.lineTo(-8, 4);
        ctx.lineTo(-8, -6);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.restore();
      }

      // Trail
      for (let i = 0; i < s.trail.length; i++) {
        const p = s.trail[i];
        const alpha = (1 - p.age / 350) * 0.45 * (i / s.trail.length);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#34d399";
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Player
      const pGrad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 14);
      pGrad.addColorStop(0, "#86efac");
      pGrad.addColorStop(0.5, "#34d399");
      pGrad.addColorStop(1, "#60a5fa");
      ctx.fillStyle = pGrad;
      ctx.shadowColor = "#4ade80";
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "#fff";
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
        maxWidth: 640,
        margin: "0 auto",
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(180deg, #05060f 0%, #010106 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#e2e8f0",
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
        <span style={{ color: "#86efac" }}>
          GATES {s.questionsAnswered}/{s.gates.length}
        </span>
        <span style={{ color: "#fde047" }}>
          TOKENS {s.tokensCollected}/{s.tokens.length}
        </span>
        <span style={{ color: "#a78bfa", fontFamily: "monospace" }}>
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
              border: "2px solid rgba(96,165,250,0.5)",
              boxShadow: "0 0 30px rgba(59,130,246,0.35)",
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
                    border: "1px solid rgba(96,165,250,0.35)",
                    color: "#e2e8f0",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    const t = e.currentTarget;
                    t.style.background = "rgba(59,130,246,0.2)";
                    t.style.borderColor = "#60a5fa";
                  }}
                  onMouseLeave={(e) => {
                    const t = e.currentTarget;
                    t.style.background = "rgba(30,41,59,0.8)";
                    t.style.borderColor = "rgba(96,165,250,0.35)";
                  }}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {finished && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(4,6,14,0.94)",
            backdropFilter: "blur(8px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 24,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              background: "linear-gradient(135deg, #4ade80, #22d3ee, #fde047)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 2,
            }}
          >
            MAZE CLEARED!
          </div>
          <div style={{ marginTop: 8, fontSize: 18 }}>
            {s.questionsAnswered}/{s.gates.length} gates &nbsp;·&nbsp;{" "}
            {s.tokensCollected}/{s.tokens.length} tokens
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Time: {secs}s &nbsp;·&nbsp; Wrong answers: {s.wrongCount}
          </div>
          <div style={{ fontSize: 36, margin: "14px 0" }}>
            {"★".repeat(stars)}
            <span style={{ color: "rgba(148,163,184,0.4)" }}>
              {"★".repeat(3 - stars)}
            </span>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => {
                playSound("click");
                onComplete(s.questionsAnswered);
              }}
              style={{
                background: "linear-gradient(135deg, #f97316, #f59e0b)",
                color: "#fff",
                fontWeight: 800,
                borderRadius: 14,
                padding: "14px 36px",
                fontSize: 17,
                border: "none",
                cursor: "pointer",
                boxShadow: "0 0 18px rgba(249,115,22,0.5)",
              }}
            >
              Continue &rarr;
            </button>
            <button
              type="button"
              onClick={() => { playSound("select"); resetExercise(); }}
              style={{
                background: "transparent",
                color: "#93c5fd",
                fontWeight: 700,
                borderRadius: 14,
                padding: "12px 24px",
                fontSize: 14,
                border: "2px solid rgba(96,165,250,0.55)",
                cursor: "pointer",
              }}
            >
              🔄 Try Again
            </button>
          </div>
        </div>
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
      <span style={{ display: "none" }}>{render}</span>
    </div>
  );
}
