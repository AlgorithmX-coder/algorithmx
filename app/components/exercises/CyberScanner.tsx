"use client";

/*
 * CyberScanner — Pixar 2.5D commercial polish.
 *
 * Game logic preserved (passwords drift across a scanner beam, tap
 * STRONG or WEAK before they exit). Only the visual layer is rebuilt:
 * warm parchment beam + golden shield + paper-style password cards
 * + tactile spring buttons + design-token typography.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import ExerciseHowTo from "./ExerciseHowTo";
import { COLOR, SHADOW, SPRING } from "@/app/components/scene/tokens";

export interface CyberScannerPassword {
  text: string;
  isStrong: boolean;
  explanation: string;
}

export interface CyberScannerProps {
  passwords?: CyberScannerPassword[];
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

const DEFAULT_PASSWORDS: CyberScannerPassword[] = [
  { text: "password123", isStrong: false, explanation: "Too common and predictable" },
  { text: "Tr0pic4l$unR1se!", isStrong: true, explanation: "Mix of upper, lower, numbers, and symbols" },
  { text: "qwerty", isStrong: false, explanation: "Keyboard pattern — easy to guess" },
  { text: "MyN@me1sJ0hn!", isStrong: true, explanation: "Good length with mixed characters" },
  { text: "ilovecats", isStrong: false, explanation: "Common phrase, no numbers or symbols" },
  { text: "G4m3r#Pr0!", isStrong: true, explanation: "Short but has all character types" },
  { text: "123456789", isStrong: false, explanation: "Just numbers in order" },
  { text: "Cyb3r$h13ld_2024!", isStrong: true, explanation: "Long, random, all character types" },
  { text: "football", isStrong: false, explanation: "Dictionary word, easy to crack" },
  { text: "X#9kL2$mP!", isStrong: true, explanation: "Random characters, very strong" },
];

const CANVAS_W = 720;
const CANVAS_H = 340;
const BEAM_Y = CANVAS_H / 2;
const CARD_W = 240;
const CARD_H = 70;
const CARD_Y = BEAM_Y;
const SHIELD_X = CANVAS_W - 54;
const SHIELD_Y = 54;

/* ───────────────── PIXAR CANVAS PALETTE ───────────────── */

const CV = {
  // Sky-to-floor parchment gradient
  bgTop: "#fcebc6",
  bgBottom: "#f4cfa1",
  // Warm grid
  gridStroke: "rgba(140, 70, 25, 0.07)",
  // Beam (gold)
  beamCore: "rgba(255, 248, 220, 0.85)",
  beamGlow: "rgba(255, 200, 110, 0.42)",
  beamEdge: "rgba(255, 178, 110, 0)",
  beamCenterLine: "rgba(255, 178, 90, 0.85)",
  // Shield (warm gold)
  shieldFill: "rgba(255, 220, 160, 0.45)",
  shieldStroke: "#c47340",
  shieldGlyph: "#5a2e14",
  // Card
  cardShadow: "rgba(80, 40, 10, 0.28)",
  cardBodyTop: "#fffaf0",
  cardBodyBottom: "#fdebcb",
  cardBorderIdle: "rgba(196, 115, 64, 0.55)",
  cardBorderCorrect: "#4a9a6a",
  cardBorderWrong: "#c4513a",
  cardSweep: "rgba(255, 220, 150, 0.45)",
  cardText: "#3b2615",
  // Timer bar
  timerTrack: "rgba(140, 70, 25, 0.18)",
  timerGood: "#4a9a6a",
  timerWarn: "#e89938",
  timerBad: "#c4513a",
  // Floaters
  floaterCorrect: "#4a9a6a",
  floaterWrong: "#c4513a",
  floaterSlow: "#e89938",
  floaterBonus: "#a06aff",
  // Particles
  burstCorrect: "#a8e3bb",
  burstWrong: "#f4a89a",
  // Explanation
  explainBg: "rgba(48, 22, 38, 0.92)",
  explainStrong: "#a8e3bb",
  explainWeak: "#f4a89a",
  // HUD
  hudScanned: "#7a3a52",
  hudScore: "#4a9a6a",
  hudStreak: "#d4733a",
} as const;

function transitTimeMs(i: number) {
  if (i === 0) return 10500;
  if (i < 4) return 8000;
  if (i < 7) return 6000;
  return 4500;
}

interface RunningCard {
  idx: number;
  text: string;
  isStrong: boolean;
  explanation: string;
  startTime: number;
  duration: number;
  resolved: boolean;
  outcome: "correct" | "wrong" | "slow" | null;
  absorbProgress: number;
  absorbStartX: number;
  absorbStartY: number;
}

interface Floater {
  id: number;
  x: number;
  y: number;
  text: string;
  colour: string;
  bornAt: number;
  duration: number;
  size: number;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  colour: string;
}

export default function CyberScanner({
  passwords,
  onComplete,
  onCorrect,
  onWrong,
}: CyberScannerProps) {
  const list = useMemo(() => passwords ?? DEFAULT_PASSWORDS, [passwords]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [resetKey, setResetKey] = useState(0);

  const state = useRef({
    idx: 0,
    card: null as RunningCard | null,
    nextStartAt: 0,
    floaters: [] as Floater[],
    particles: [] as Particle[],
    floaterId: 0,
    particleId: 0,
    correct: 0,
    wrong: 0,
    speedBonuses: 0,
    streak: 0,
    bestStreak: 0,
    explanationText: "" as string,
    explanationUntil: 0,
    explanationColour: CV.explainWeak as string,
    finished: false,
  });

  const [render, setRender] = useState(0);

  const addFloater = (
    text: string,
    x: number,
    y: number,
    colour: string,
    size = 20,
    duration = 900
  ) => {
    const s = state.current;
    s.floaters.push({
      id: ++s.floaterId,
      x,
      y,
      text,
      colour,
      bornAt: performance.now(),
      duration,
      size,
    });
  };

  const burst = (x: number, y: number, colour: string, count: number) => {
    const s = state.current;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 2 + Math.random() * 4;
      s.particles.push({
        id: ++s.particleId,
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 2,
        life: 700,
        colour,
      });
    }
  };

  const resolveCurrent = (guess: boolean) => {
    const s = state.current;
    const c = s.card;
    if (!c || c.resolved) return;
    const now = performance.now();
    const progress = Math.min(1, (now - c.startTime) / c.duration);
    const correct = guess === c.isStrong;
    c.resolved = true;
    c.absorbStartX = cardX(c, now);
    c.absorbStartY = CARD_Y;
    if (correct) {
      c.outcome = "correct";
      playSound("correct");
      s.correct += 1;
      s.streak += 1;
      s.bestStreak = Math.max(s.bestStreak, s.streak);
      burst(c.absorbStartX, c.absorbStartY, CV.burstCorrect, 14);
      addFloater("CORRECT!", c.absorbStartX, c.absorbStartY - 30, CV.floaterCorrect, 22);
      if (progress <= 0.3) {
        s.speedBonuses += 1;
        addFloater("+SPEED BONUS!", c.absorbStartX, c.absorbStartY - 58, CV.floaterBonus, 18);
      }
      onCorrect?.();
    } else {
      c.outcome = "wrong";
      playSound("wrong");
      s.wrong += 1;
      s.streak = 0;
      burst(c.absorbStartX, c.absorbStartY, CV.burstWrong, 12);
      addFloater("WRONG!", c.absorbStartX, c.absorbStartY - 30, CV.floaterWrong, 22);
      s.explanationText = `${c.isStrong ? "STRONG" : "WEAK"}: ${c.explanation}`;
      s.explanationUntil = now + 2400;
      s.explanationColour = c.isStrong ? CV.explainStrong : CV.explainWeak;
      onWrong?.();
    }
    window.setTimeout(() => {
      s.card = null;
      s.idx = c.idx + 1;
      s.nextStartAt = performance.now() + 600;
    }, 700);
  };

  const cardX = (c: RunningCard, now: number) => {
    const elapsed = now - c.startTime;
    const progress = Math.min(1, Math.max(0, elapsed / c.duration));
    return -CARD_W / 2 + progress * (CANVAS_W + CARD_W);
  };

  const resetExercise = () => {
    state.current = {
      idx: 0,
      card: null,
      nextStartAt: 0,
      floaters: [],
      particles: [],
      floaterId: 0,
      particleId: 0,
      correct: 0,
      wrong: 0,
      speedBonuses: 0,
      streak: 0,
      bestStreak: 0,
      explanationText: "",
      explanationUntil: 0,
      explanationColour: CV.explainWeak,
      finished: false,
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
    state.current.nextStartAt = performance.now() + 2200;

    const spawnNext = (now: number) => {
      const s = state.current;
      if (s.card) return;
      if (s.idx >= list.length) {
        if (!s.finished) {
          s.finished = true;
          void correctAnswerBurst();
          setRender((n) => n + 1);
        }
        return;
      }
      if (now < s.nextStartAt) return;
      const p = list[s.idx];
      s.card = {
        idx: s.idx,
        text: p.text,
        isStrong: p.isStrong,
        explanation: p.explanation,
        startTime: now,
        duration: transitTimeMs(s.idx),
        resolved: false,
        outcome: null,
        absorbProgress: 0,
        absorbStartX: 0,
        absorbStartY: 0,
      };
    };

    const tick = (now: number) => {
      if (!running) return;
      const dt = Math.min(50, now - lastTime);
      lastTime = now;
      const frames = dt / (1000 / 60);
      const s = state.current;

      spawnNext(now);

      if (s.card && !s.card.resolved) {
        const progress = (now - s.card.startTime) / s.card.duration;
        if (progress >= 1) {
          const c = s.card;
          c.resolved = true;
          c.outcome = "slow";
          const x = CANVAS_W - CARD_W / 2;
          addFloater("TOO SLOW!", x - 30, BEAM_Y - 40, CV.floaterSlow, 22);
          addFloater("🦝", x + 50, BEAM_Y - 10, "#c4513a", 40, 1200);
          s.streak = 0;
          s.wrong += 1;
          s.explanationText = `${c.isStrong ? "STRONG" : "WEAK"}: ${c.explanation}`;
          s.explanationUntil = now + 2400;
          s.explanationColour = c.isStrong ? CV.explainStrong : CV.explainWeak;
          playSound("wrong");
          onWrong?.();
          window.setTimeout(() => {
            s.card = null;
            s.idx = c.idx + 1;
            s.nextStartAt = performance.now() + 600;
          }, 700);
        }
      }

      if (s.card && s.card.resolved && s.card.outcome === "correct") {
        s.card.absorbProgress = Math.min(1, s.card.absorbProgress + 0.08 * frames);
      }

      s.particles = s.particles
        .map((p) => ({
          ...p,
          x: p.x + p.vx * frames,
          y: p.y + p.vy * frames,
          vy: p.vy + 0.3 * frames,
          life: p.life - dt,
        }))
        .filter((p) => p.life > 0);
      s.floaters = s.floaters.filter((f) => now - f.bornAt < f.duration);

      // ── DRAW ──
      ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

      // Parchment gradient sky
      const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bg.addColorStop(0, CV.bgTop);
      bg.addColorStop(1, CV.bgBottom);
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Soft warm grid
      ctx.strokeStyle = CV.gridStroke;
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_W; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_H);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_H; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_W, y);
        ctx.stroke();
      }

      // Golden scanner beam
      const beamPulse = 0.85 + 0.15 * Math.sin(now / 300);
      const beamGrad = ctx.createLinearGradient(0, BEAM_Y - 50, 0, BEAM_Y + 50);
      beamGrad.addColorStop(0, CV.beamEdge);
      beamGrad.addColorStop(0.4, `rgba(255, 200, 110, ${0.45 * beamPulse})`);
      beamGrad.addColorStop(0.5, `rgba(255, 248, 220, ${0.65 * beamPulse})`);
      beamGrad.addColorStop(0.6, `rgba(255, 200, 110, ${0.45 * beamPulse})`);
      beamGrad.addColorStop(1, CV.beamEdge);
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, BEAM_Y - 50, CANVAS_W, 100);
      ctx.strokeStyle = `rgba(255, 178, 90, ${0.7 * beamPulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, BEAM_Y);
      ctx.lineTo(CANVAS_W, BEAM_Y);
      ctx.stroke();

      // Golden shield, top-right
      // Outer halo
      ctx.fillStyle = CV.shieldFill;
      ctx.beginPath();
      ctx.arc(SHIELD_X, SHIELD_Y, 36, 0, Math.PI * 2);
      ctx.fill();
      // Ring
      ctx.strokeStyle = CV.shieldStroke;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(SHIELD_X, SHIELD_Y, 28, 0, Math.PI * 2);
      ctx.stroke();
      // Inner gold highlight
      const shieldGrad = ctx.createRadialGradient(
        SHIELD_X - 6,
        SHIELD_Y - 6,
        2,
        SHIELD_X,
        SHIELD_Y,
        26
      );
      shieldGrad.addColorStop(0, "#fff5cc");
      shieldGrad.addColorStop(0.6, "#ffd58a");
      shieldGrad.addColorStop(1, "#d68a4c");
      ctx.fillStyle = shieldGrad;
      ctx.beginPath();
      ctx.arc(SHIELD_X, SHIELD_Y, 25, 0, Math.PI * 2);
      ctx.fill();
      // Glyph
      ctx.fillStyle = CV.shieldGlyph;
      ctx.font = "900 22px ui-rounded, 'Fredoka', system-ui, sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🛡", SHIELD_X, SHIELD_Y);

      // Active card
      const c = s.card;
      if (c) {
        let x: number;
        let y: number;
        let scale: number;
        if (c.resolved && c.outcome === "correct") {
          const t = c.absorbProgress;
          x = c.absorbStartX + (SHIELD_X - c.absorbStartX) * t;
          y = c.absorbStartY + (SHIELD_Y - c.absorbStartY) * t;
          scale = 1 - t * 0.85;
        } else {
          x = cardX(c, now);
          y = CARD_Y;
          scale = 1;
        }
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        // Soft drop shadow
        ctx.fillStyle = CV.cardShadow;
        roundRect(ctx, -CARD_W / 2 + 2, -CARD_H / 2 + 5, CARD_W, CARD_H, 14);
        ctx.fill();

        // Card body — paper gradient
        const grad = ctx.createLinearGradient(0, -CARD_H / 2, 0, CARD_H / 2);
        grad.addColorStop(0, CV.cardBodyTop);
        grad.addColorStop(1, CV.cardBodyBottom);
        ctx.fillStyle = grad;
        roundRect(ctx, -CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 14);
        ctx.fill();

        // Border tint by outcome
        ctx.strokeStyle =
          c.resolved && c.outcome === "correct"
            ? CV.cardBorderCorrect
            : c.resolved && c.outcome === "wrong"
              ? CV.cardBorderWrong
              : CV.cardBorderIdle;
        ctx.lineWidth = 2.5;
        roundRect(ctx, -CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 14);
        ctx.stroke();

        // Wrong-flash overlay
        if (c.resolved && c.outcome === "wrong" && Math.sin(now / 60) > 0) {
          ctx.fillStyle = "rgba(196, 81, 58, 0.18)";
          roundRect(ctx, -CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 14);
          ctx.fill();
        }

        // Scanning sweep when in beam
        const progress = Math.min(1, (now - c.startTime) / c.duration);
        const inBeam = Math.abs(progress - 0.5) < 0.2 && !c.resolved;
        if (inBeam) {
          const sweep = ((now / 400) % 1) * CARD_W - CARD_W / 2;
          ctx.fillStyle = CV.cardSweep;
          ctx.fillRect(sweep - 4, -CARD_H / 2, 8, CARD_H);
        }

        // Password text
        ctx.fillStyle = CV.cardText;
        ctx.font = "700 18px 'JetBrains Mono', 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.text, 0, -2, CARD_W - 20);

        // Timer bar
        if (!c.resolved) {
          ctx.fillStyle = CV.timerTrack;
          ctx.fillRect(-CARD_W / 2 + 12, CARD_H / 2 - 10, CARD_W - 24, 4);
          const fill = 1 - progress;
          const colour =
            fill > 0.5
              ? CV.timerGood
              : fill > 0.2
                ? CV.timerWarn
                : CV.timerBad;
          ctx.fillStyle = colour;
          ctx.fillRect(
            -CARD_W / 2 + 12,
            CARD_H / 2 - 10,
            (CARD_W - 24) * fill,
            4
          );
        }
        ctx.restore();
      }

      // Particles
      for (const p of s.particles) {
        const alpha = Math.max(0, p.life / 700);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.colour;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // Floaters with warm dark stroke
      for (const f of s.floaters) {
        const age = now - f.bornAt;
        const alpha = Math.max(0, 1 - age / f.duration);
        const dy = -age * 0.08;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.colour;
        ctx.strokeStyle = "rgba(48, 22, 12, 0.7)";
        ctx.lineWidth = 4;
        ctx.font = `900 ${f.size}px ui-rounded, 'Fredoka', system-ui, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(f.text, f.x, f.y + dy);
        ctx.fillText(f.text, f.x, f.y + dy);
      }
      ctx.globalAlpha = 1;

      // Explanation pill
      if (s.explanationText && now < s.explanationUntil) {
        ctx.font = "700 13px ui-rounded, 'Fredoka', system-ui, sans-serif";
        const w = ctx.measureText(s.explanationText).width + 36;
        ctx.fillStyle = CV.explainBg;
        roundRect(ctx, CANVAS_W / 2 - w / 2, CANVAS_H - 50, w, 32, 12);
        ctx.fill();
        ctx.strokeStyle = s.explanationColour;
        ctx.lineWidth = 2;
        roundRect(ctx, CANVAS_W / 2 - w / 2, CANVAS_H - 50, w, 32, 12);
        ctx.stroke();
        ctx.fillStyle = s.explanationColour;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.explanationText, CANVAS_W / 2, CANVAS_H - 34);
      }

      // HUD
      ctx.font = "800 13px ui-rounded, 'Fredoka', system-ui, sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = CV.hudScanned;
      const scannedNum = s.idx + (s.card ? 1 : 0);
      ctx.fillText(
        `SCANNED ${Math.min(list.length, scannedNum)}/${list.length}`,
        14,
        12
      );
      ctx.textAlign = "right";
      ctx.fillStyle = CV.hudScore;
      ctx.fillText(`SCORE ${s.correct}`, CANVAS_W - 14, 12);
      if (s.streak >= 3) {
        ctx.textAlign = "center";
        ctx.fillStyle = CV.hudStreak;
        ctx.fillText(`STREAK x${s.streak}`, CANVAS_W / 2, 12);
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
  }, [list, showIntro, resetKey]);

  const s = state.current;
  const total = list.length;
  const accuracy = total > 0 ? Math.round((s.correct / total) * 100) : 0;
  const stars =
    s.correct === total ? 3 : s.correct >= Math.ceil(total * 0.7) ? 2 : 1;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #fff7e0 0%, #fde2b5 55%, #f9c27a 100%)",
        boxShadow: SHADOW.sceneFrame,
        color: COLOR.inkDeep,
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <ExerciseHowTo
        title="Cyber Scanner"
        steps={[
          { glyph: "🛡", text: "Tap STRONG for safe passwords" },
          { glyph: "💀", text: "Tap WEAK for guessable ones" },
          { glyph: "⚡", text: "Decide before they cross the beam" },
        ]}
        accent="#d4733a"
      />
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
        aria-label="Cyber Scanner game"
      />

      {/* Big tactile answer buttons */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "18px 22px 24px",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(255, 220, 168, 0.4) 60%, rgba(196, 115, 64, 0.18) 100%)",
        }}
      >
        <ScannerButton
          label="🛡  STRONG"
          tint="#4a9a6a"
          accent="#7cc89a"
          disabled={s.finished}
          onClick={() => resolveCurrent(true)}
        />
        <ScannerButton
          label="💀  WEAK"
          tint="#c4513a"
          accent="#f08e7e"
          disabled={s.finished}
          onClick={() => resolveCurrent(false)}
        />
      </div>

      {s.finished && <FinishOverlay
        accuracy={accuracy}
        stars={stars}
        speedBonuses={s.speedBonuses}
        onContinue={() => {
          playSound("click");
          onComplete(s.correct);
        }}
        onRetry={() => {
          playSound("select");
          resetExercise();
        }}
      />}
      {showIntro && (
        <ExerciseIntro
          title="Cyber Scanner"
          description="Passwords will float across the scanner. Tap STRONG or WEAK before they escape!"
          icon="🔍"
          controls="Tap the buttons below"
          onStart={() => setShowIntro(false)}
        />
      )}
      <span style={{ display: "none" }}>{render}</span>
    </div>
  );
}

/* ───────────────────────── ANSWER BUTTON ───────────────────────── */

function ScannerButton({
  tint,
  accent,
  label,
  disabled,
  onClick,
}: {
  tint: string;
  accent: string;
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -3, scale: 1.03 } : undefined}
      whileTap={!disabled ? { scale: 0.96, y: 1 } : undefined}
      transition={SPRING.snappy}
      onMouseEnter={() => !disabled && playSound("hover")}
      style={{
        flex: 1,
        height: 64,
        borderRadius: 999,
        border: "none",
        background: `linear-gradient(135deg, ${accent}, ${tint})`,
        color: "#fff7e6",
        fontWeight: 900,
        fontSize: 18,
        letterSpacing: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "inherit",
        boxShadow: `0 14px 28px -8px ${tint}aa, 0 0 0 1px rgba(255, 245, 220, 0.45) inset, 0 -4px 0 rgba(40, 18, 5, 0.3) inset`,
        textShadow: "0 1px 2px rgba(40, 18, 5, 0.3)",
      }}
    >
      {label}
    </motion.button>
  );
}

/* ───────────────────────── FINISH OVERLAY ───────────────────────── */

function FinishOverlay({
  accuracy,
  stars,
  speedBonuses,
  onContinue,
  onRetry,
}: {
  accuracy: number;
  stars: number;
  speedBonuses: number;
  onContinue: () => void;
  onRetry: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      style={{
        position: "absolute",
        inset: 0,
        background:
          "linear-gradient(180deg, rgba(40, 18, 38, 0.95) 0%, rgba(20, 8, 24, 0.96) 100%)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        color: COLOR.cream,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 28,
        gap: 4,
      }}
    >
      <div
        style={{
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 5,
          color: "#ffd58a",
          textTransform: "uppercase",
          marginBottom: 4,
        }}
      >
        ✦ Scan Complete ✦
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          background:
            "linear-gradient(135deg, #ffd58a, #ff9b4a, #d4733a)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: 1,
        }}
      >
        WELL DONE!
      </div>
      <div style={{ display: "flex", gap: 4, margin: "10px 0" }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            animate={{
              opacity: i < stars ? 1 : 0.25,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              ...SPRING.bouncy,
              delay: 0.3 + i * 0.18,
            }}
            style={{
              fontSize: 38,
              filter:
                i < stars
                  ? "drop-shadow(0 0 14px rgba(255, 200, 100, 0.7))"
                  : "grayscale(0.6)",
            }}
          >
            ★
          </motion.span>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          gap: 14,
          fontSize: 14,
          opacity: 0.9,
          marginBottom: 18,
        }}
      >
        <span>
          Accuracy <strong style={{ color: "#a8e3bb" }}>{accuracy}%</strong>
        </span>
        <span>·</span>
        <span>
          Speed bonuses <strong style={{ color: "#ffd58a" }}>{speedBonuses}</strong>
        </span>
      </div>
      <div
        style={{
          display: "flex",
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <motion.button
          type="button"
          onClick={onContinue}
          whileHover={{ y: -3, scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "14px 36px",
            fontSize: 16,
            fontWeight: 800,
            color: COLOR.goldDark,
            background:
              `linear-gradient(135deg, ${COLOR.goldLight}, ${COLOR.goldMid})`,
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow: SHADOW.primaryButton,
          }}
        >
          Continue →
        </motion.button>
        <motion.button
          type="button"
          onClick={onRetry}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={SPRING.snappy}
          style={{
            border: "none",
            cursor: "pointer",
            padding: "12px 24px",
            fontSize: 14,
            fontWeight: 800,
            color: COLOR.cream,
            background: "rgba(50, 20, 35, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            borderRadius: 999,
            fontFamily: "inherit",
            letterSpacing: 0.5,
            boxShadow: SHADOW.drop,
          }}
        >
          ↻ Try Again
        </motion.button>
      </div>
    </motion.div>
  );
}

/* ───────────────────────── HELPERS ───────────────────────── */

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
