"use client";

import { useEffect, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import {
  badgeEarnedCelebration,
  correctAnswerBurst,
} from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import { PixarFinishOverlay } from "@/app/components/scene";

export interface FirewallBuilderProps {
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

// Play area dimensions — bigger blocks so the full text reads.
const CANVAS_W = 640;
const CANVAS_H = 560;
const PLAY_W = 400;
const PLAY_H = 440;
const PLAY_X = (CANVAS_W - PLAY_W) / 2;
const PLAY_Y = 70;
const COLS = 5;
const COL_W = PLAY_W / COLS; // 80
const BLOCK_H = 40;
const ROWS = Math.floor(PLAY_H / BLOCK_H); // 12

interface BlockDef {
  text: string;
  kind: "good" | "bad";
  primary: string;
  secondary: string;
}

const GOOD_BLOCKS: BlockDef[] = [
  { text: "Strong Passwords", kind: "good", primary: "#7eff97", secondary: "#15803d" },
  { text: "Enable 2FA", kind: "good", primary: "#7c5cff", secondary: "#3a7bff" },
  { text: "Avoid Unknown Links", kind: "good", primary: "#00e5ff", secondary: "#3a7bff" },
  { text: "Keep Software Updated", kind: "good", primary: "#7eff97", secondary: "#15803d" },
  { text: "Password Manager", kind: "good", primary: "#7c5cff", secondary: "#3a7bff" },
  { text: "Check URLs Carefully", kind: "good", primary: "#00e5ff", secondary: "#3a7bff" },
  { text: "Log Out When Done", kind: "good", primary: "#7eff97", secondary: "#15803d" },
  { text: "Use Antivirus", kind: "good", primary: "#7c5cff", secondary: "#3a7bff" },
];

const BAD_BLOCKS: BlockDef[] = [
  { text: "Share Passwords", kind: "bad", primary: "#ef4444", secondary: "#991b1b" },
  { text: "Click Every Link", kind: "bad", primary: "#f97316", secondary: "#9a3412" },
  { text: "Use 'password123'", kind: "bad", primary: "#ef4444", secondary: "#991b1b" },
  { text: "Ignore Updates", kind: "bad", primary: "#f97316", secondary: "#9a3412" },
];

interface Falling {
  def: BlockDef;
  col: number; // 0..COLS-1
  y: number; // top y in play-area coords
  landed: boolean;
}

interface StackCell {
  def: BlockDef;
  flashUntil: number;
  cracked: boolean;
}

interface Floater {
  id: number;
  x: number;
  y: number;
  text: string;
  colour: string;
  bornAt: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  colour: string;
  rot: number;
  rotSpeed: number;
}

/** Power-up types. Drop every 5 catches as a special falling token. */
type PowerUpKind = "slowmo" | "shield" | "multicatch";
interface PowerUp {
  id: number;
  kind: PowerUpKind;
  col: number;
  y: number;
  speed: number;
}

const WIN_GOOD = 15;
/** Drop a power-up after this many catches. */
const PU_INTERVAL = 5;
const LOSE_BAD = 5;
const LEVEL_THRESHOLDS = [5, 10, 15];

export default function FirewallBuilder({
  onComplete,
  onCorrect,
  onWrong,
}: FirewallBuilderProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const state = useRef({
    falling: null as Falling | null,
    nextSpawnAt: 0,
    stacks: Array.from({ length: COLS }, () => [] as StackCell[]),
    goodLanded: 0,
    badLanded: 0,
    goodRejected: 0,
    wrongRejected: 0,
    level: 0,
    speed: 2, // px/frame at 60fps
    floaters: [] as Floater[],
    particles: [] as Particle[],
    floaterId: 0,
    particleId: 0,
    shakeUntil: 0,
    levelFlashUntil: 0,
    levelFlashText: "",
    won: false,
    lost: false,
    finished: false,
    // Gaming juice: combo chains, mouse-drag tracking, threat lock-on.
    combo: 0,
    bestCombo: 0,
    comboFlashUntil: 0,
    mouseColTarget: null as number | null,
    threatPulseStart: 0, // performance.now() when current bad-block warning began
    lastFallingKind: null as "good" | "bad" | null,
    // Power-up system — drop a special token every PU_INTERVAL catches.
    powerUps: [] as PowerUp[],
    powerUpId: 0,
    catchesSinceLastPowerUp: 0,
    slowMoUntil: 0,    // performance.now() until which speed is halved
    shieldBigUntil: 0, // performance.now() until which paddle is 50% wider
    multiCatchLeft: 0, // number of next blocks auto-counted as catches
  });

  const [render, setRender] = useState(0);

  // Stack height in px for a column (counting blocks from bottom)
  const stackHeightPx = (col: number) => state.current.stacks[col].length * BLOCK_H;

  const spawnBlock = () => {
    const s = state.current;
    const pickGood = Math.random() < 0.7;
    const pool = pickGood ? GOOD_BLOCKS : BAD_BLOCKS;
    const def = pool[Math.floor(Math.random() * pool.length)];
    const col = Math.floor(Math.random() * COLS);
    s.falling = { def, col, y: 0, landed: false };
  };

  const addFloater = (
    text: string,
    xInPlay: number,
    yInPlay: number,
    colour: string
  ) => {
    const s = state.current;
    s.floaters.push({
      id: ++s.floaterId,
      x: PLAY_X + xInPlay,
      y: PLAY_Y + yInPlay,
      text,
      colour,
      bornAt: performance.now(),
    });
  };

  const burst = (xInPlay: number, yInPlay: number, colour: string, count: number) => {
    const s = state.current;
    const x0 = PLAY_X + xInPlay;
    const y0 = PLAY_Y + yInPlay;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 4;
      s.particles.push({
        id: ++s.particleId,
        x: x0,
        y: y0,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        life: 700,
        colour,
        rot: Math.random() * Math.PI,
        rotSpeed: (Math.random() - 0.5) * 0.3,
      });
    }
  };

  const onLandGood = (f: Falling) => {
    const s = state.current;
    const col = f.col;
    s.stacks[col].push({
      def: f.def,
      flashUntil: performance.now() + 300,
      cracked: false,
    });
    s.goodLanded += 1;
    s.combo += 1;
    s.catchesSinceLastPowerUp += 1;
    if (s.combo > s.bestCombo) s.bestCombo = s.combo;
    if (s.combo === 3 || s.combo === 5 || s.combo === 8 || s.combo === 12) {
      addFloater(`COMBO x${s.combo}!`, col * COL_W + COL_W / 2, PLAY_H - stackHeightPx(col) - 24, "#00e5ff");
      s.comboFlashUntil = performance.now() + 700;
      playSound("streak3");
    }
    // POWER-UP DROP — every PU_INTERVAL catches, spawn one in a random
    // column. Cycles through the three kinds so the kid always gets a
    // mix of effects rather than the same one repeatedly.
    if (s.catchesSinceLastPowerUp >= PU_INTERVAL) {
      s.catchesSinceLastPowerUp = 0;
      const KINDS: PowerUpKind[] = ["slowmo", "shield", "multicatch"];
      const kind = KINDS[(s.powerUpId + 1) % KINDS.length];
      s.powerUps.push({
        id: ++s.powerUpId,
        kind,
        col: Math.floor(Math.random() * COLS),
        y: 0,
        speed: 1.6,
      });
      addFloater("POWER-UP!", col * COL_W + COL_W / 2, PLAY_H - stackHeightPx(col) - 50, "#ffb347");
      playSound("streak3");
    }
    playSound("correct");
    onCorrect?.();
    burst(col * COL_W + COL_W / 2, PLAY_H - stackHeightPx(col) + BLOCK_H / 2, "#7eff97", 10 + Math.min(20, s.combo * 2));
    const milestone = LEVEL_THRESHOLDS.indexOf(s.goodLanded);
    if (milestone >= 0) {
      s.level = milestone + 1;
      s.levelFlashText = `FIREWALL LEVEL ${s.level}!`;
      s.levelFlashUntil = performance.now() + 1500;
      playSound("streak3");
    }
    if (s.goodLanded >= WIN_GOOD) {
      s.won = true;
      s.finished = true;
      playSound("confetti");
      void correctAnswerBurst();
      void badgeEarnedCelebration();
      setRender((n) => n + 1);
      return;
    }
    // Speed curve: +0.5 every 5 blocks
    s.speed = 2 + Math.floor(s.goodLanded / 5) * 0.5;
  };

  const onLandBad = (f: Falling) => {
    const s = state.current;
    const col = f.col;
    // Cracked-top: if there is a top block, crack it and pop it off
    if (s.stacks[col].length > 0) {
      s.stacks[col].pop();
    }
    s.badLanded += 1;
    s.combo = 0;
    s.shakeUntil = performance.now() + 450;
    playSound("wrong");
    onWrong?.();
    burst(col * COL_W + COL_W / 2, PLAY_H - stackHeightPx(col), "#ef4444", 14);
    addFloater("FIREWALL HIT!", col * COL_W + COL_W / 2, PLAY_H - stackHeightPx(col) - 12, "#ef4444");
    if (s.badLanded >= LOSE_BAD) {
      s.lost = true;
      s.finished = true;
      setRender((n) => n + 1);
    }
  };

  const move = (dir: -1 | 1) => {
    const s = state.current;
    if (!s.falling || s.falling.landed || s.finished) return;
    const next = s.falling.col + dir;
    if (next < 0 || next >= COLS) return;
    // Can't move into a column where the block would collide with the stack at current y
    const topYOfCol = PLAY_H - stackHeightPx(next);
    if (s.falling.y + BLOCK_H > topYOfCol) return;
    s.falling.col = next;
    playSound("pop");
  };

  const reject = () => {
    const s = state.current;
    if (!s.falling || s.falling.landed || s.finished) return;
    const f = s.falling;
    if (f.def.kind === "bad") {
      // good reject: explode + reward
      playSound("sortCorrect");
      onCorrect?.();
      burst(f.col * COL_W + COL_W / 2, f.y + BLOCK_H / 2, "#f97316", 14);
      addFloater("REJECTED!", f.col * COL_W + COL_W / 2, f.y, "#fbbf24");
      s.goodRejected += 1;
    } else {
      // wrong reject
      playSound("wrong");
      onWrong?.();
      addFloater("OOPS! That was good!", f.col * COL_W + COL_W / 2, f.y, "#f97316");
      s.wrongRejected += 1;
      // good block bypassed = a loss of potential. count slightly: no penalty beyond
    }
    s.falling = null;
    s.nextSpawnAt = performance.now() + 1500;
  };

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (state.current.finished) return;
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        e.preventDefault();
        move(1);
      } else if (
        e.key === " " ||
        e.key === "ArrowDown" ||
        e.key === "s" ||
        e.key === "S"
      ) {
        e.preventDefault();
        reject();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Touch: tap left half moves left, right half moves right, hold center rejects
  const onCanvasTap = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const y = (e.clientY - rect.top) * scale;
    const s = state.current;

    // TAP-TO-BLAST: if the tap lands directly on the falling block AND
    // it's a bad block, blast it (= reject without waiting). This gives
    // the kid an active "shoot it down" verb in addition to dodging.
    if (s.falling && !s.falling.landed && !s.finished) {
      const f = s.falling;
      const blockX = PLAY_X + f.col * COL_W;
      const blockY = PLAY_Y + f.y;
      const onBlock =
        x >= blockX && x <= blockX + COL_W && y >= blockY && y <= blockY + BLOCK_H;
      if (onBlock && f.def.kind === "bad") {
        reject();
        return;
      }
    }

    // Tap below the play area also triggers REJECT (legacy gesture).
    if (y > CANVAS_H - 80) {
      reject();
      return;
    }
    // Tap inside the play area: snap the falling block to that column.
    const playRelX = x - PLAY_X;
    if (playRelX < 0 || playRelX > PLAY_W) return;
    const targetCol = Math.max(0, Math.min(COLS - 1, Math.floor(playRelX / COL_W)));
    if (!s.falling || s.falling.landed || s.finished) return;
    while (s.falling.col !== targetCol) {
      const dir = targetCol > s.falling.col ? 1 : -1;
      const next = s.falling.col + dir;
      if (next < 0 || next >= COLS) break;
      const topYOfCol = PLAY_H - stackHeightPx(next);
      if (s.falling.y + BLOCK_H > topYOfCol) break;
      s.falling.col = next;
    }
  };

  /** Mouse hover (without click) tracks the cursor's column so the
   *  paddle can preview where the block would land. The block itself
   *  doesn't move — that happens on tap — but a visible cyber-shield
   *  paddle at the bottom of the play area follows the cursor. */
  const onCanvasHover = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_W / rect.width;
    const x = (e.clientX - rect.left) * scale;
    const playRelX = x - PLAY_X;
    if (playRelX < 0 || playRelX > PLAY_W) {
      state.current.mouseColTarget = null;
      return;
    }
    state.current.mouseColTarget = Math.max(0, Math.min(COLS - 1, Math.floor(playRelX / COL_W)));
  };
  const onCanvasLeave = () => {
    state.current.mouseColTarget = null;
  };

  const resetExercise = () => {
    state.current = {
      falling: null,
      nextSpawnAt: 0,
      stacks: Array.from({ length: COLS }, () => [] as StackCell[]),
      goodLanded: 0,
      badLanded: 0,
      goodRejected: 0,
      wrongRejected: 0,
      level: 0,
      speed: 2,
      floaters: [],
      particles: [],
      floaterId: 0,
      particleId: 0,
      shakeUntil: 0,
      levelFlashUntil: 0,
      levelFlashText: "",
      won: false,
      lost: false,
      finished: false,
      combo: 0,
      bestCombo: 0,
      comboFlashUntil: 0,
      mouseColTarget: null,
      threatPulseStart: 0,
      lastFallingKind: null,
      powerUps: [],
      powerUpId: 0,
      catchesSinceLastPowerUp: 0,
      slowMoUntil: 0,
      shieldBigUntil: 0,
      multiCatchLeft: 0,
    };
    setShowIntro(true);
    setResetKey((k) => k + 1);
    setRender((n) => n + 1);
  };

  // Render loop
  useEffect(() => {
    if (showIntro) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    let running = true;
    let lastTime = performance.now();
    state.current.nextSpawnAt = performance.now() + 400;

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(50, now - lastTime);
      lastTime = now;
      const frames = dt / (1000 / 60);
      const s = state.current;

      if (!s.falling && !s.finished) {
        if (now >= s.nextSpawnAt) spawnBlock();
      }

      if (s.falling && !s.falling.landed && !s.finished) {
        const f = s.falling;
        f.y += s.speed * frames;

        // Continuously track mouse position — block follows the
        // cursor smoothly so the kid feels in direct control. Old
        // mechanic was arrow-keys + click-snap; now the falling
        // block migrates one column at a time toward mouseColTarget
        // every ~80ms, respecting stack-collision rules.
        if (s.mouseColTarget !== null && s.mouseColTarget !== f.col) {
          if (now - s.threatPulseStart > 80) {
            s.threatPulseStart = now;
            const dir = s.mouseColTarget > f.col ? 1 : -1;
            const next = f.col + dir;
            if (next >= 0 && next < COLS) {
              const topYOfCol = PLAY_H - stackHeightPx(next);
              if (f.y + BLOCK_H <= topYOfCol) {
                f.col = next;
              }
            }
          }
        }

        // Check collision with stack or floor
        const topYOfCol = PLAY_H - stackHeightPx(f.col);
        if (f.y + BLOCK_H >= topYOfCol) {
          f.y = topYOfCol - BLOCK_H;
          f.landed = true;
          if (f.def.kind === "good") onLandGood(f);
          else onLandBad(f);
          s.falling = null;
          // Tighter cadence — was 1500ms, now 900ms for more pace.
          s.nextSpawnAt = now + 900;
        }
      }

      // POWER-UP TICK — fall the tokens, catch when they reach the
      // paddle/cursor column, apply effect.
      const slowMo = now < s.slowMoUntil;
      const slowFactor = slowMo ? 0.5 : 1;
      const guideCol =
        s.mouseColTarget !== null
          ? s.mouseColTarget
          : s.falling
            ? s.falling.col
            : Math.floor(COLS / 2);
      s.powerUps = s.powerUps
        .map((p) => ({ ...p, y: p.y + p.speed * frames * slowFactor }))
        .filter((p) => {
          // Caught if reaches the bottom in the kid's current column.
          if (p.y + 28 >= PLAY_H && p.col === guideCol) {
            // Apply effect
            if (p.kind === "slowmo") {
              s.slowMoUntil = now + 5000;
              addFloater("SLOW-MO!", PLAY_X + p.col * COL_W + COL_W / 2 - PLAY_X, PLAY_H - 8, "#7c5cff");
            } else if (p.kind === "shield") {
              s.shieldBigUntil = now + 10000;
              addFloater("BIG SHIELD!", PLAY_X + p.col * COL_W + COL_W / 2 - PLAY_X, PLAY_H - 8, "#7eff97");
            } else {
              s.multiCatchLeft += 3;
              addFloater("MULTI-CATCH x3!", PLAY_X + p.col * COL_W + COL_W / 2 - PLAY_X, PLAY_H - 8, "#ff5fb3");
            }
            playSound("streak3");
            burst(p.col * COL_W + COL_W / 2, PLAY_H - 8, "#ffb347", 16);
            return false;
          }
          // Drop off screen if missed
          if (p.y > PLAY_H + 20) return false;
          return true;
        });

      // Apply slow-mo to falling block speed if active.
      if (s.falling && slowMo && !s.falling.landed) {
        // Already advanced once above with full speed; rewind half
        // the step to net out at half-speed for this frame.
        s.falling.y -= s.speed * frames * 0.5;
      }

      // Particles
      s.particles = s.particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx * frames,
          y: p.y + p.vy * frames,
          vy: p.vy + 0.3 * frames,
          rot: p.rot + p.rotSpeed * frames,
          life: p.life - dt,
        }))
        .filter((p) => p.life > 0);
      s.floaters = s.floaters.filter((f) => now - f.bornAt < 900);

      // DRAW
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Shake
      const shakeX = now < s.shakeUntil ? (Math.random() - 0.5) * 6 : 0;
      const shakeY = now < s.shakeUntil ? (Math.random() - 0.5) * 4 : 0;

      // Background — animated cyberpunk firewall control room. Radial
      // gradient + circuit traces + drifting scan ring + hex starfield.
      const bg = ctx.createRadialGradient(CANVAS_W / 2, CANVAS_H * 0.35, 0, CANVAS_W / 2, CANVAS_H * 0.35, Math.max(CANVAS_W, CANVAS_H));
      bg.addColorStop(0, "#1a2147");
      bg.addColorStop(0.55, "#0f1530");
      bg.addColorStop(1, "#080a16");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Drifting warm-gold stars
      for (let i = 0; i < 60; i++) {
        const sx = (i * 91.7 + (now * 0.012) * (1 + (i % 3) * 0.4)) % CANVAS_W;
        const sy = (i * 173.7) % CANVAS_H;
        const r = ((i * 13) % 3) / 2 + 0.4;
        const tw = 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(now * 0.002 + i * 0.5));
        ctx.fillStyle = `rgba(255, 220, 168, ${0.22 + 0.4 * tw})`;
        ctx.beginPath();
        ctx.arc(sx, sy, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Pulsing scan ring (radar sweep) centred on play area
      const ringPhase = (now / 2400) % 1;
      const ringR = 60 + ringPhase * 320;
      ctx.save();
      ctx.strokeStyle = `rgba(124, 92, 255, ${0.45 * (1 - ringPhase)})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2, PLAY_Y + PLAY_H * 0.5, ringR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(124, 92, 255, ${0.3 * (1 - ringPhase)})`;
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2, PLAY_Y + PLAY_H * 0.5, ringR + 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Warm circuit traces along the top edge
      ctx.strokeStyle = "rgba(255, 220, 168, 0.4)";
      ctx.lineWidth = 1.4;
      const dash = (now / 30) % 18;
      ctx.setLineDash([8, 10]);
      ctx.lineDashOffset = -dash;
      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(CANVAS_W, 36);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.save();
      ctx.translate(shakeX, shakeY);

      // Play area — warm parchment floor
      const floorGrad = ctx.createLinearGradient(0, PLAY_Y, 0, PLAY_Y + PLAY_H);
      floorGrad.addColorStop(0, "rgba(74, 36, 32, 0.85)");
      floorGrad.addColorStop(1, "rgba(40, 18, 24, 0.95)");
      ctx.fillStyle = floorGrad;
      ctx.fillRect(PLAY_X, PLAY_Y, PLAY_W, PLAY_H);
      // Diagonal scan stripes inside the play area
      ctx.save();
      ctx.beginPath();
      ctx.rect(PLAY_X, PLAY_Y, PLAY_W, PLAY_H);
      ctx.clip();
      const stripeOff = (now / 16) % 24;
      ctx.strokeStyle = "rgba(255, 220, 168, 0.08)";
      ctx.lineWidth = 1;
      for (let i = -PLAY_H; i < PLAY_W + PLAY_H; i += 24) {
        ctx.beginPath();
        ctx.moveTo(PLAY_X + i + stripeOff, PLAY_Y);
        ctx.lineTo(PLAY_X + i + stripeOff - PLAY_H, PLAY_Y + PLAY_H);
        ctx.stroke();
      }
      ctx.restore();
      // Grid (warmer)
      ctx.strokeStyle = "rgba(124, 92, 255, 0.2)";
      ctx.lineWidth = 1;
      for (let c = 1; c < COLS; c++) {
        ctx.beginPath();
        ctx.moveTo(PLAY_X + c * COL_W, PLAY_Y);
        ctx.lineTo(PLAY_X + c * COL_W, PLAY_Y + PLAY_H);
        ctx.stroke();
      }
      for (let r = 1; r < ROWS; r++) {
        ctx.beginPath();
        ctx.moveTo(PLAY_X, PLAY_Y + r * BLOCK_H);
        ctx.lineTo(PLAY_X + PLAY_W, PLAY_Y + r * BLOCK_H);
        ctx.stroke();
      }
      // Top scan beam crossing the play area — warm gold
      const beamY = PLAY_Y + ((now / 12) % PLAY_H);
      const beamGrad = ctx.createLinearGradient(0, beamY - 24, 0, beamY + 24);
      beamGrad.addColorStop(0, "rgba(124, 92, 255, 0)");
      beamGrad.addColorStop(0.5, "rgba(255, 220, 130, 0.22)");
      beamGrad.addColorStop(1, "rgba(124, 92, 255, 0)");
      ctx.fillStyle = beamGrad;
      ctx.fillRect(PLAY_X, beamY - 24, PLAY_W, 48);
      // Bordering glow rectangle
      ctx.strokeStyle = "rgba(124, 92, 255, 0.55)";
      ctx.lineWidth = 1.5;
      ctx.shadowColor = "#ffd158";
      ctx.shadowBlur = 14;
      ctx.strokeRect(PLAY_X + 0.5, PLAY_Y + 0.5, PLAY_W - 1, PLAY_H - 1);
      ctx.shadowBlur = 0;

      // Side wooden frames — riveted rails with travelling embers
      ctx.fillStyle = "#3a1a08";
      ctx.fillRect(PLAY_X - 8, PLAY_Y, 6, PLAY_H);
      ctx.fillRect(PLAY_X + PLAY_W + 2, PLAY_Y, 6, PLAY_H);
      // Static brass rivets
      ctx.fillStyle = "rgba(124, 92, 255, 0.7)";
      for (let i = 0; i < 12; i++) {
        const y = PLAY_Y + 10 + i * 38;
        ctx.fillRect(PLAY_X - 7, y, 4, 4);
        ctx.fillRect(PLAY_X + PLAY_W + 3, y, 4, 4);
      }
      // Travelling ember pulse along each rail
      const pulseY = PLAY_Y + ((now / 5) % PLAY_H);
      ctx.fillStyle = "#ffd158";
      ctx.shadowColor = "#7c5cff";
      ctx.shadowBlur = 12;
      ctx.fillRect(PLAY_X - 8, pulseY, 6, 12);
      ctx.fillRect(PLAY_X + PLAY_W + 2, PLAY_H + PLAY_Y - (pulseY - PLAY_Y) - 12, 6, 12);
      ctx.shadowBlur = 0;

      // Foundation — gold-trimmed base plate
      const foundGrad = ctx.createLinearGradient(0, PLAY_Y + PLAY_H, 0, PLAY_Y + PLAY_H + 12);
      foundGrad.addColorStop(0, "#ffd158");
      foundGrad.addColorStop(1, "#0f1530");
      ctx.fillStyle = foundGrad;
      ctx.fillRect(PLAY_X - 14, PLAY_Y + PLAY_H, PLAY_W + 28, 12);
      // Rivets along foundation
      ctx.fillStyle = "rgba(40, 18, 8, 0.6)";
      for (let i = 0; i < 14; i++) {
        ctx.beginPath();
        ctx.arc(PLAY_X - 14 + 12 + i * (PLAY_W + 28 - 24) / 13, PLAY_Y + PLAY_H + 6, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stacked blocks
      for (let c = 0; c < COLS; c++) {
        const stack = s.stacks[c];
        for (let i = 0; i < stack.length; i++) {
          const cell = stack[i];
          const x = PLAY_X + c * COL_W + 2;
          const y = PLAY_Y + PLAY_H - (i + 1) * BLOCK_H;
          const flashing = now < cell.flashUntil;
          drawBlock(ctx, x, y, COL_W - 4, BLOCK_H - 2, cell.def, flashing);
        }
      }

      // Falling block
      if (s.falling) {
        const x = PLAY_X + s.falling.col * COL_W + 2;
        const y = PLAY_Y + s.falling.y;
        drawBlock(ctx, x, y, COL_W - 4, BLOCK_H - 2, s.falling.def, false);

        // THREAT LOCK-ON: if the falling block is bad, draw a pulsing
        // red corner-bracket reticule around it + a faint red halo so
        // kids can see at a glance "this one's the threat — TAP IT".
        if (s.falling.def.kind === "bad") {
          const pulse = 0.55 + 0.45 * Math.sin(now / 150);
          const w = COL_W - 4;
          const h = BLOCK_H - 2;
          const armLen = 10;
          ctx.save();
          ctx.strokeStyle = `rgba(255, 80, 100, ${pulse})`;
          ctx.lineWidth = 2.5;
          ctx.shadowColor = "#ff5577";
          ctx.shadowBlur = 14 * pulse;
          ctx.lineCap = "round";
          // Top-left
          ctx.beginPath();
          ctx.moveTo(x, y + armLen);
          ctx.lineTo(x, y);
          ctx.lineTo(x + armLen, y);
          ctx.stroke();
          // Top-right
          ctx.beginPath();
          ctx.moveTo(x + w - armLen, y);
          ctx.lineTo(x + w, y);
          ctx.lineTo(x + w, y + armLen);
          ctx.stroke();
          // Bottom-right
          ctx.beginPath();
          ctx.moveTo(x + w, y + h - armLen);
          ctx.lineTo(x + w, y + h);
          ctx.lineTo(x + w - armLen, y + h);
          ctx.stroke();
          // Bottom-left
          ctx.beginPath();
          ctx.moveTo(x + armLen, y + h);
          ctx.lineTo(x, y + h);
          ctx.lineTo(x, y + h - armLen);
          ctx.stroke();
          // "TAP" hint pill above the bad block
          ctx.shadowBlur = 0;
          ctx.font = "900 10px 'Space Grotesk', sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = `rgba(255, 80, 100, ${pulse})`;
          ctx.fillText("TAP TO BLAST", x + w / 2, y - 10);
          ctx.restore();
        }
      }

      // POWER-UP RENDER — falling tokens with an animated halo
      for (const p of s.powerUps) {
        const px = PLAY_X + p.col * COL_W + COL_W / 2;
        const py = PLAY_Y + p.y;
        const r = 18;
        const colour =
          p.kind === "slowmo"
            ? "#7c5cff"
            : p.kind === "shield"
              ? "#7eff97"
              : "#ff5fb3";
        const pulse = 0.7 + 0.3 * Math.sin(now / 180);
        ctx.save();
        // Halo
        const halo = ctx.createRadialGradient(px, py, 2, px, py, r * 2);
        halo.addColorStop(0, `${colour}cc`);
        halo.addColorStop(1, "transparent");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(px, py, r * 2, 0, Math.PI * 2);
        ctx.fill();
        // Token disc
        ctx.fillStyle = colour;
        ctx.shadowColor = colour;
        ctx.shadowBlur = 16 * pulse;
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        // Inner ring
        ctx.strokeStyle = "#e8edff";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(px, py, r - 4, 0, Math.PI * 2);
        ctx.stroke();
        // Glyph
        ctx.fillStyle = "#080a16";
        ctx.font = "900 14px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          p.kind === "slowmo" ? "T" : p.kind === "shield" ? "S" : "x3",
          px,
          py
        );
        ctx.restore();
      }

      // Cyber shield paddle — visible at the bottom of the play area,
      // tracks the cursor (or the falling block's column if cursor is
      // outside). Acts as a visual "you can drop the block here" guide
      // to make the kid feel directly in control.
      if (!s.finished) {
        const px = PLAY_X + guideCol * COL_W + COL_W / 2;
        const py = PLAY_Y + PLAY_H - 6;
        // Shield-big power-up grows the paddle 50% wider for 10s.
        const bigShield = now < s.shieldBigUntil;
        const paddleW = COL_W * (bigShield ? 1.4 : 0.92);
        const paddleH = 14;
        // Glow halo
        const haloGrad = ctx.createRadialGradient(px, py, 2, px, py, paddleW * 0.85);
        haloGrad.addColorStop(0, "rgba(0, 229, 255, 0.55)");
        haloGrad.addColorStop(1, "rgba(0, 229, 255, 0)");
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(px, py, paddleW * 0.85, 0, Math.PI * 2);
        ctx.fill();
        // Shield body — chevron / rounded bar
        ctx.save();
        ctx.translate(px, py);
        ctx.beginPath();
        ctx.moveTo(-paddleW / 2, 0);
        ctx.lineTo(-paddleW / 2 + 6, -paddleH);
        ctx.lineTo(paddleW / 2 - 6, -paddleH);
        ctx.lineTo(paddleW / 2, 0);
        ctx.lineTo(paddleW / 2 - 6, paddleH * 0.5);
        ctx.lineTo(-paddleW / 2 + 6, paddleH * 0.5);
        ctx.closePath();
        const bodyGrad = ctx.createLinearGradient(0, -paddleH, 0, paddleH);
        bodyGrad.addColorStop(0, "#7df0ff");
        bodyGrad.addColorStop(1, "#00e5ff");
        ctx.fillStyle = bodyGrad;
        ctx.shadowColor = "#00e5ff";
        ctx.shadowBlur = 14;
        ctx.fill();
        ctx.shadowBlur = 0;
        // Cosmic violet inner accent line
        ctx.strokeStyle = "rgba(124, 92, 255, 0.85)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-paddleW / 2 + 8, -2);
        ctx.lineTo(paddleW / 2 - 8, -2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();

      // Particles
      for (const p of s.particles) {
        const alpha = Math.max(0, p.life / 700);
        ctx.globalAlpha = alpha;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.colour;
        ctx.fillRect(-4, -4, 8, 8);
        ctx.restore();
      }
      ctx.globalAlpha = 1;

      // Floaters
      for (const f of s.floaters) {
        const age = now - f.bornAt;
        const alpha = Math.max(0, 1 - age / 900);
        const dy = -age * 0.06;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.colour;
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 3;
        ctx.font = "900 14px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(f.text, f.x, f.y + dy);
        ctx.fillText(f.text, f.x, f.y + dy);
      }
      ctx.globalAlpha = 1;

      // Level-up flash
      if (now < s.levelFlashUntil) {
        const age = now - (s.levelFlashUntil - 1500);
        const alpha = age < 300 ? age / 300 : 1 - (age - 300) / 1200;
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = "#00e5ff";
        ctx.strokeStyle = "rgba(0,0,0,0.8)";
        ctx.lineWidth = 4;
        ctx.font = "900 32px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(s.levelFlashText, CANVAS_W / 2, CANVAS_H / 2);
        ctx.fillText(s.levelFlashText, CANVAS_W / 2, CANVAS_H / 2);
      }
      ctx.globalAlpha = 1;

      // HUD
      ctx.font = "800 13px ui-rounded, 'Fredoka', system-ui, sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = "#a0ffb0";
      ctx.fillText(`FIREWALL LEVEL ${s.level}`, 14, 12);
      ctx.textAlign = "right";
      ctx.fillStyle = "#00e5ff";
      ctx.fillText(`BLOCKS ${s.goodLanded}/${WIN_GOOD}`, CANVAS_W - 14, 12);
      ctx.textAlign = "center";
      ctx.fillStyle = s.badLanded >= LOSE_BAD - 1 ? "#ff5fb3" : "#ffd158";
      ctx.fillText(`VIRUSES ${s.badLanded}/${LOSE_BAD}`, CANVAS_W / 2, 12);

      // STREAK MULTIPLIER — visible at the top centre when combo>=2.
      // Pulses with the combo, scales up at higher tiers, drives a
      // "x2" / "x3" / "x5!" type readout the kid can see at all times
      // (was previously only fired as a transient floater at 3/5/8/12).
      if (s.combo >= 2) {
        const mult =
          s.combo >= 12 ? 5 : s.combo >= 8 ? 4 : s.combo >= 5 ? 3 : 2;
        const pulse = 0.7 + 0.3 * Math.sin(now / 220);
        const colour =
          mult >= 5 ? "#ff5fb3" : mult >= 4 ? "#7c5cff" : mult >= 3 ? "#7df0ff" : "#7eff97";
        ctx.save();
        ctx.font = `900 ${14 + mult}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "top";
        ctx.shadowColor = colour;
        ctx.shadowBlur = 14 * pulse;
        ctx.fillStyle = colour;
        ctx.fillText(`STREAK x${mult}`, CANVAS_W / 2, 30);
        ctx.restore();
      }

      // Active power-up indicators — pill row in the top-left under
      // FIREWALL LEVEL, one badge per active effect.
      const activePU: { label: string; remaining: number; colour: string }[] = [];
      if (now < s.slowMoUntil) {
        activePU.push({ label: "SLOW-MO", remaining: s.slowMoUntil - now, colour: "#7c5cff" });
      }
      if (now < s.shieldBigUntil) {
        activePU.push({ label: "BIG SHIELD", remaining: s.shieldBigUntil - now, colour: "#7eff97" });
      }
      if (s.multiCatchLeft > 0) {
        activePU.push({ label: `MULTI x${s.multiCatchLeft}`, remaining: 9999, colour: "#ff5fb3" });
      }
      if (activePU.length > 0) {
        let bx = 14;
        const by = 32;
        ctx.save();
        ctx.font = "900 10px 'Space Grotesk', sans-serif";
        ctx.textBaseline = "middle";
        for (const pu of activePU) {
          const labelW = ctx.measureText(pu.label).width;
          const w = labelW + 14;
          ctx.fillStyle = `${pu.colour}33`;
          ctx.strokeStyle = pu.colour;
          ctx.lineWidth = 1;
          ctx.shadowColor = pu.colour;
          ctx.shadowBlur = 8;
          ctx.beginPath();
          if (typeof ctx.roundRect === "function") {
            (ctx as CanvasRenderingContext2D & { roundRect: (x: number, y: number, w: number, h: number, r: number) => void }).roundRect(bx, by - 8, w, 16, 8);
          } else {
            ctx.rect(bx, by - 8, w, 16);
          }
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = pu.colour;
          ctx.textAlign = "center";
          ctx.fillText(pu.label, bx + w / 2, by);
          bx += w + 6;
        }
        ctx.restore();
      }

      // Legend row
      ctx.font = "800 13px ui-rounded, 'Fredoka', system-ui, sans-serif";
      // Static legend only when there's NO falling block — otherwise it
      // overlaps with the big CATCH IT! / REJECT IT! prompt below.
      if (!s.falling) {
        ctx.fillStyle = "#c5cdf0";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("🟢 GREEN = Catch it!   🔴 RED = Press SPACE to reject!", CANVAS_W / 2, 34);
      }

      // Huge CATCH IT! / REJECT IT! indicator above the play area
      if (s.falling) {
        const isGood = s.falling.def.kind === "good";
        const col = isGood ? "#7eff97" : "#ef4444";
        const label = isGood ? "CATCH IT!" : "REJECT IT!";
        const glowPulse = 0.6 + 0.4 * Math.sin(now / 180);
        ctx.shadowColor = col;
        ctx.shadowBlur = 18 * glowPulse;
        ctx.fillStyle = col;
        ctx.strokeStyle = "rgba(0,0,0,0.85)";
        ctx.lineWidth = 5;
        ctx.font = "900 32px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(label, CANVAS_W / 2, PLAY_Y - 30);
        ctx.fillText(label, CANVAS_W / 2, PLAY_Y - 30);
        ctx.shadowBlur = 0;

        // Arrow pointing at the falling block
        const bx = PLAY_X + s.falling.col * COL_W + COL_W / 2;
        const ay = PLAY_Y + s.falling.y - 10;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(bx, ay);
        ctx.lineTo(bx - 8, ay - 10);
        ctx.lineTo(bx + 8, ay - 10);
        ctx.closePath();
        ctx.fill();
      } else {
        ctx.fillStyle = "#64748b";
        ctx.font = "600 12px 'Space Grotesk', sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("← → move · SPACE reject", CANVAS_W / 2, PLAY_Y - 30);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showIntro, resetKey]);

  const s = state.current;
  const stars =
    s.won && s.badLanded === 0 ? 3 : s.goodLanded >= 12 ? 2 : 1;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 660,
        margin: "0 auto",
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #2a1240 0%, #1a2147 35%, #252d5e 70%, #3a7bff 92%, #7df0ff 100%)",
        boxShadow:
          "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
        color: "#e8edff",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
      tabIndex={0}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onCanvasTap}
        onPointerMove={onCanvasHover}
        onPointerLeave={onCanvasLeave}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          touchAction: "manipulation",
          cursor: "pointer",
        }}
        aria-label="Firewall Builder"
      />

      {s.finished && (
        <PixarFinishOverlay
          badge={s.won ? "Firewall Built" : "Firewall Breached"}
          title={s.won ? "WELL DEFENDED!" : "TRY AGAIN!"}
          subline={`Level ${s.level} · Blocks ${s.goodLanded}/${WIN_GOOD} · Viruses caught ${s.goodRejected} · Through ${s.badLanded}`}
          stars={s.won ? stars : 0}
          onContinue={() => {
            playSound("click");
            onComplete(s.won ? stars : Math.max(1, s.level));
          }}
          onRetry={() => {
            playSound("select");
            resetExercise();
          }}
        />
      )}
      {showIntro && (
        <ExerciseIntro
          title="Build the Firewall!"
          description="Good security blocks are falling — catch them to build your firewall! But REJECT the virus blocks before they land!"
          icon="🧱"
          controls="← → to move · SPACE to reject"
          onStart={() => setShowIntro(false)}
        />
      )}
      <span style={{ display: "none" }}>{render}</span>
    </div>
  );
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  def: BlockDef,
  flash: boolean
) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  grad.addColorStop(0, def.primary);
  grad.addColorStop(1, def.secondary);
  ctx.fillStyle = grad;
  roundRect(ctx, x, y, w, h, 8);
  ctx.fill();
  // Bright border — green for good, red for bad.
  ctx.strokeStyle = flash
    ? "#fff"
    : def.kind === "good"
      ? "#7eff97"
      : "#ef4444";
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 8);
  ctx.stroke();

  // Icon on the left
  ctx.font = "900 18px 'Space Grotesk', sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 3;
  ctx.fillText(def.kind === "good" ? "🛡" : "💀", x + 13, y + h / 2);
  ctx.shadowBlur = 0;

  // Text — 12px, wraps to 2 lines within the block width.
  ctx.font = "800 12px 'Space Grotesk', sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#fff";
  const textLeft = x + 26;
  const textRight = x + w - 4;
  const maxWidth = textRight - textLeft;
  const words = def.text.split(/\s+/);
  const lines: string[] = [];
  let cur = "";
  for (const word of words) {
    const probe = cur ? cur + " " + word : word;
    if (ctx.measureText(probe).width <= maxWidth) {
      cur = probe;
    } else {
      if (cur) lines.push(cur);
      cur = word;
    }
    if (lines.length === 2) break;
  }
  if (cur && lines.length < 2) lines.push(cur);
  if (lines.length === 1) {
    ctx.fillText(lines[0], textLeft, y + h / 2);
  } else if (lines.length >= 2) {
    ctx.fillText(lines[0], textLeft, y + h / 2 - 7);
    ctx.fillText(lines[1], textLeft, y + h / 2 + 7);
  }
}

function roundRect(
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
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
  ctx.closePath();
}
