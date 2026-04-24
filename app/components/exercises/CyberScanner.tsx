"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import { correctAnswerBurst } from "@/app/lib/celebrations";

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

function transitTimeMs(i: number) {
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
  absorbProgress: number; // 0..1 for shield absorption
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
    explanationColour: "#fca5a5",
    finished: false,
  });

  const [render, setRender] = useState(0);

  const addFloater = (text: string, x: number, y: number, colour: string, size = 20, duration = 900) => {
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
      burst(c.absorbStartX, c.absorbStartY, "#4ade80", 14);
      addFloater("CORRECT!", c.absorbStartX, c.absorbStartY - 30, "#4ade80", 22);
      if (progress <= 0.3) {
        s.speedBonuses += 1;
        addFloater("+SPEED BONUS!", c.absorbStartX, c.absorbStartY - 58, "#22d3ee", 18);
      }
      onCorrect?.();
    } else {
      c.outcome = "wrong";
      playSound("wrong");
      s.wrong += 1;
      s.streak = 0;
      burst(c.absorbStartX, c.absorbStartY, "#ef4444", 12);
      addFloater("WRONG!", c.absorbStartX, c.absorbStartY - 30, "#ef4444", 22);
      s.explanationText = `${c.isStrong ? "STRONG" : "WEAK"}: ${c.explanation}`;
      s.explanationUntil = now + 2400;
      s.explanationColour = c.isStrong ? "#86efac" : "#fca5a5";
      onWrong?.();
    }
    // Give it ~700ms of resolution animation before advancing
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

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    let running = true;
    let lastTime = performance.now();
    state.current.nextStartAt = performance.now() + 500;

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

      // Time-out if card reaches right edge without resolution
      if (s.card && !s.card.resolved) {
        const progress = (now - s.card.startTime) / s.card.duration;
        if (progress >= 1) {
          const c = s.card;
          c.resolved = true;
          c.outcome = "slow";
          const x = CANVAS_W - CARD_W / 2;
          addFloater("TOO SLOW!", x - 30, BEAM_Y - 40, "#f97316", 22);
          addFloater("🦝", x + 50, BEAM_Y - 10, "#fbbf24", 40, 1200);
          s.streak = 0;
          s.wrong += 1;
          s.explanationText = `${c.isStrong ? "STRONG" : "WEAK"}: ${c.explanation}`;
          s.explanationUntil = now + 2400;
          s.explanationColour = c.isStrong ? "#86efac" : "#fca5a5";
          playSound("wrong");
          onWrong?.();
          window.setTimeout(() => {
            s.card = null;
            s.idx = c.idx + 1;
            s.nextStartAt = performance.now() + 600;
          }, 700);
        }
      }

      // Absorb animation for correct-outcome resolved cards
      if (s.card && s.card.resolved && s.card.outcome === "correct") {
        s.card.absorbProgress = Math.min(1, s.card.absorbProgress + 0.08 * frames);
      }

      // Particles
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
      // bg
      const bg = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
      bg.addColorStop(0, "#0b1225");
      bg.addColorStop(1, "#04060f");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // grid lines
      ctx.strokeStyle = "rgba(59,130,246,0.05)";
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_W; x += 60) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_H);
        ctx.stroke();
      }

      // Scanning beam
      const beamPulse = 0.85 + 0.15 * Math.sin(now / 300);
      const beamGrad = ctx.createLinearGradient(0, BEAM_Y - 40, 0, BEAM_Y + 40);
      beamGrad.addColorStop(0, "rgba(59,130,246,0)");
      beamGrad.addColorStop(0.5, `rgba(147,197,253,${0.35 * beamPulse})`);
      beamGrad.addColorStop(1, "rgba(59,130,246,0)");
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, BEAM_Y - 40, CANVAS_W, 80);
      ctx.strokeStyle = `rgba(96,165,250,${0.8 * beamPulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, BEAM_Y);
      ctx.lineTo(CANVAS_W, BEAM_Y);
      ctx.stroke();

      // Shield (top-right, absorbs correct cards)
      ctx.fillStyle = "rgba(96,165,250,0.15)";
      ctx.beginPath();
      ctx.arc(SHIELD_X, SHIELD_Y, 34, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#60a5fa";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(SHIELD_X, SHIELD_Y, 28, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#93c5fd";
      ctx.font = "900 22px 'Space Grotesk', sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🛡", SHIELD_X, SHIELD_Y);

      // Current card
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
        const flash =
          c.resolved && c.outcome === "wrong"
            ? Math.sin(now / 60) > 0
              ? "#ef4444"
              : null
            : null;

        // shadow
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        roundRect(ctx, -CARD_W / 2 + 3, -CARD_H / 2 + 4, CARD_W, CARD_H, 12);
        ctx.fill();

        // body
        const grad = ctx.createLinearGradient(0, -CARD_H / 2, 0, CARD_H / 2);
        grad.addColorStop(0, "#1f2937");
        grad.addColorStop(1, "#0f172a");
        ctx.fillStyle = grad;
        roundRect(ctx, -CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 12);
        ctx.fill();
        ctx.strokeStyle =
          c.resolved && c.outcome === "correct"
            ? "#4ade80"
            : c.resolved && c.outcome === "wrong"
              ? "#ef4444"
              : "rgba(147,197,253,0.55)";
        ctx.lineWidth = 2;
        roundRect(ctx, -CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 12);
        ctx.stroke();

        if (flash) {
          ctx.fillStyle = "rgba(239,68,68,0.25)";
          roundRect(ctx, -CARD_W / 2, -CARD_H / 2, CARD_W, CARD_H, 12);
          ctx.fill();
        }

        // scanning sweep when passing through the beam band
        const progress = Math.min(1, (now - c.startTime) / c.duration);
        const inBeam = Math.abs(progress - 0.5) < 0.2 && !c.resolved;
        if (inBeam) {
          const sweep = ((now / 400) % 1) * CARD_W - CARD_W / 2;
          ctx.fillStyle = "rgba(147,197,253,0.25)";
          ctx.fillRect(sweep - 4, -CARD_H / 2, 8, CARD_H);
        }

        // password text
        ctx.fillStyle = "#f1f5f9";
        ctx.font = "700 18px 'Courier New', monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.text, 0, -2, CARD_W - 20);
        // timer bar below card (only while moving)
        if (!c.resolved) {
          ctx.fillStyle = "rgba(255,255,255,0.1)";
          ctx.fillRect(-CARD_W / 2 + 12, CARD_H / 2 - 10, CARD_W - 24, 4);
          const fill = 1 - progress;
          const colour =
            fill > 0.5 ? "#4ade80" : fill > 0.2 ? "#fbbf24" : "#ef4444";
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

      // Floaters
      for (const f of s.floaters) {
        const age = now - f.bornAt;
        const alpha = Math.max(0, 1 - age / f.duration);
        const dy = -age * 0.08;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = f.colour;
        ctx.strokeStyle = "rgba(0,0,0,0.7)";
        ctx.lineWidth = 3;
        ctx.font = `900 ${f.size}px 'Space Grotesk', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.strokeText(f.text, f.x, f.y + dy);
        ctx.fillText(f.text, f.x, f.y + dy);
      }
      ctx.globalAlpha = 1;

      // Explanation pill
      if (s.explanationText && now < s.explanationUntil) {
        ctx.fillStyle = "rgba(15,23,42,0.9)";
        ctx.strokeStyle = s.explanationColour;
        ctx.lineWidth = 2;
        ctx.font = "600 13px 'Space Grotesk', sans-serif";
        const w = ctx.measureText(s.explanationText).width + 30;
        roundRect(ctx, CANVAS_W / 2 - w / 2, CANVAS_H - 46, w, 30, 10);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = s.explanationColour;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(s.explanationText, CANVAS_W / 2, CANVAS_H - 31);
      }

      // HUD
      ctx.font = "800 13px 'Space Grotesk', sans-serif";
      ctx.textBaseline = "top";
      ctx.textAlign = "left";
      ctx.fillStyle = "#7dd3fc";
      const scannedNum = s.idx + (s.card ? 1 : 0);
      ctx.fillText(`SCANNED ${Math.min(list.length, scannedNum)}/${list.length}`, 14, 10);
      ctx.textAlign = "right";
      ctx.fillStyle = "#86efac";
      ctx.fillText(`SCORE ${s.correct}`, CANVAS_W - 14, 10);
      if (s.streak >= 3) {
        ctx.textAlign = "center";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`STREAK x${s.streak}`, CANVAS_W / 2, 10);
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
  }, [list]);

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
        borderRadius: 24,
        overflow: "hidden",
        background: "linear-gradient(180deg, #05060f 0%, #010106 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#e2e8f0",
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
        aria-label="Cyber Scanner game"
      />

      {/* Answer buttons — big chunky game buttons */}
      <div
        style={{
          display: "flex",
          gap: 14,
          padding: "16px 18px 20px",
          background: "linear-gradient(180deg, transparent, rgba(5,8,18,0.95))",
        }}
      >
        <ScannerButton
          tint="#22c55e"
          accent="#4ade80"
          label="🛡  STRONG"
          disabled={!s.card || s.card.resolved || s.finished}
          onClick={() => resolveCurrent(true)}
        />
        <ScannerButton
          tint="#ef4444"
          accent="#f87171"
          label="💀  WEAK"
          disabled={!s.card || s.card.resolved || s.finished}
          onClick={() => resolveCurrent(false)}
        />
      </div>

      {s.finished && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(4,6,14,0.94)",
            backdropFilter: "blur(6px)",
            color: "#e2e8f0",
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
              background:
                "linear-gradient(135deg, #22d3ee, #60a5fa, #a78bfa)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 2,
            }}
          >
            SCAN COMPLETE!
          </div>
          <div style={{ marginTop: 8, fontSize: 18 }}>
            Accuracy {accuracy}% &nbsp;·&nbsp; Speed bonuses {s.speedBonuses}
          </div>
          <div style={{ fontSize: 36, margin: "14px 0" }}>
            {"★".repeat(stars)}
            <span style={{ color: "rgba(148,163,184,0.4)" }}>
              {"★".repeat(3 - stars)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              onComplete(s.correct);
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
        </div>
      )}
      <span style={{ display: "none" }}>{render}</span>
    </div>
  );
}

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
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onMouseEnter={() => !disabled && playSound("hover")}
      style={{
        flex: 1,
        height: 56,
        borderRadius: 16,
        border: "none",
        background: `linear-gradient(180deg, ${accent}, ${tint})`,
        color: "#fff",
        fontWeight: 900,
        fontSize: 18,
        letterSpacing: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        boxShadow: pressed
          ? `0 2px 6px ${tint}88, inset 0 2px 8px rgba(0,0,0,0.3)`
          : `0 8px 24px ${tint}88, 0 0 18px ${tint}66, inset 0 2px 2px rgba(255,255,255,0.3)`,
        transform: pressed ? "scale(0.97) translateY(1px)" : "scale(1)",
        transition: "transform 0.12s ease, box-shadow 0.12s ease",
      }}
    >
      {label}
    </button>
  );
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
