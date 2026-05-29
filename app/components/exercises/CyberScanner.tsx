"use client";

/*
 * CyberScanner - Pixar 2.5D commercial polish.
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
import { useComfortMode } from "@/app/lib/comfortMode";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import {
  setupHiDpiCanvas,
  easeOutCubic,
  easeOutBack,
  ease01,
  scaledParticleCount,
  playSoftWrong,
} from "@/app/lib/gameEngine";

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
  /**
   * Fires when a new tier of HintBubble becomes visible.
   * Tier mapping: 1 wrong = tier 1, 2 wrong = tier 2, 3+ = tier 3.
   * The parent useLessonProgress hook dedupes by max-per-screen.
   */
  onHintReached?: (tier: 1 | 2 | 3) => void;
}

const DEFAULT_PASSWORDS: CyberScannerPassword[] = [
  { text: "password123", isStrong: false, explanation: "Too common and predictable" },
  { text: "Tr0pic4l$unR1se!", isStrong: true, explanation: "Mix of upper, lower, numbers, and symbols" },
  { text: "qwerty", isStrong: false, explanation: "Keyboard pattern - easy to guess" },
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

/* ───────────────── COSMIC CANVAS PALETTE ─────────────────
 * Was the warm Pixar parchment / sunset-gold treatment; swept to the
 * cosmic-cyber palette so the scanner reads in the same key as the
 * boss flow (cosmic violet / pink / coral / cyan / gold). */

const CV = {
  // Sky-to-floor cosmic gradient - deep cosmic-violet → abyss
  bgTop: "#1a1f4d",
  bgBottom: "#0f1530",
  // Cosmic grid
  gridStroke: "rgba(125, 240, 255, 0.08)",
  // Beam (cosmic violet → cyan)
  beamCore: "rgba(231, 236, 255, 0.85)",
  beamGlow: "rgba(124, 92, 255, 0.42)",
  beamEdge: "rgba(124, 92, 255, 0)",
  beamCenterLine: "rgba(125, 240, 255, 0.85)",
  // Shield (cyan/cosmic)
  shieldFill: "rgba(125, 240, 255, 0.32)",
  shieldStroke: "#7c5cff",
  shieldGlyph: "#e7ecff",
  // Card
  cardShadow: "rgba(8, 10, 22, 0.45)",
  cardBodyTop: "rgba(15, 21, 48, 0.92)",
  cardBodyBottom: "rgba(26, 31, 77, 0.92)",
  cardBorderIdle: "rgba(124, 92, 255, 0.55)",
  cardBorderCorrect: "#7eff97",
  cardBorderWrong: "#ff5fb3",
  cardSweep: "rgba(125, 240, 255, 0.32)",
  cardText: "#e7ecff",
  // Timer bar
  timerTrack: "rgba(125, 240, 255, 0.18)",
  timerGood: "#7eff97",
  timerWarn: "#ffd158",
  timerBad: "#ff5fb3",
  // Floaters
  floaterCorrect: "#7eff97",
  floaterWrong: "#ff5fb3",
  floaterSlow: "#ffd158",
  floaterBonus: "#7c5cff",
  // Particles
  burstCorrect: "#a0ffb0",
  burstWrong: "#ff9bcb",
  // Explanation
  explainBg: "rgba(8, 10, 22, 0.92)",
  explainStrong: "#a0ffb0",
  explainWeak: "#ff9bcb",
  // HUD
  hudScanned: "#a06aff",
  hudScore: "#7eff97",
  hudStreak: "#7df0ff",
} as const;

function transitTimeMs(i: number, comfort: boolean) {
  // Standard pacing for older / quick learners.
  let base: number;
  if (i === 0) base = 10500;
  else if (i < 4) base = 8000;
  else if (i < 7) base = 6000;
  else base = 4500;
  // Comfort mode: a lot more reading time per card. We don't go to
  // Infinity because the card needs to drift across the beam visually.
  return comfort ? Math.round(base * 2.2) + 4000 : base;
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
  onHintReached,
}: CyberScannerProps) {
  const list = useMemo(() => passwords ?? DEFAULT_PASSWORDS, [passwords]);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const [showIntro, setShowIntro] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const comfort = useComfortMode();
  const comfortRef = useRef(comfort.enabled);
  useEffect(() => {
    comfortRef.current = comfort.enabled;
  }, [comfort.enabled]);

  // Pause-on-wrong feedback overlay. While `feedback` is non-null the
  // card stays on screen and the next card does not spawn - the child
  // must tap "Got it" to continue.
  const [feedback, setFeedback] = useState<null | {
    title: string;
    explanation: string;
    tip?: string;
  }>(null);
  // Tiered-hint counter (1/2/3 wrong on this screen).
  const [wrongCount, setWrongCount] = useState(0);

  // Hint-tier emission: when wrongCount crosses a tier threshold,
  // notify the parent. The parent's useLessonProgress hook keeps the
  // running max per screen and emits a hint_used analytics event the
  // first time each tier is reached. Safe to over-emit here - the
  // hook dedupes.
  useEffect(() => {
    if (!onHintReached) return;
    if (wrongCount === 0) return;
    const tier: 1 | 2 | 3 = wrongCount === 1 ? 1 : wrongCount === 2 ? 2 : 3;
    onHintReached(tier);
  }, [wrongCount, onHintReached]);

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
    // Paused waiting for "Got it" - swallow button presses.
    if (feedback) return;
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
      burst(c.absorbStartX, c.absorbStartY, CV.burstCorrect, scaledParticleCount(14));
      addFloater("CORRECT!", c.absorbStartX, c.absorbStartY - 30, CV.floaterCorrect, 22);
      if (progress <= 0.3) {
        s.speedBonuses += 1;
        addFloater("+SPEED BONUS!", c.absorbStartX, c.absorbStartY - 58, CV.floaterBonus, 18);
      }
      onCorrect?.();
    } else {
      c.outcome = "wrong";
      playSoftWrong();
      s.wrong += 1;
      s.streak = 0;
      burst(c.absorbStartX, c.absorbStartY, CV.burstWrong, scaledParticleCount(12));
      addFloater("WRONG!", c.absorbStartX, c.absorbStartY - 30, CV.floaterWrong, 22);
      onWrong?.();
      // Pause-on-wrong: stop spawning the next card, show overlay,
      // wait for "Got it". The card stays resolved on the beam and is
      // cleared by the gotIt handler.
      setWrongCount((n) => n + 1);
      setFeedback({
        title: c.isStrong ? "That one was STRONG" : "That one was WEAK",
        explanation: c.explanation,
        tip: c.isStrong
          ? "Strong passwords mix UPPER, lower, numbers and symbols, and have 8+ characters."
          : "Weak passwords are short, common, or things people could guess about you.",
      });
      return;
    }
    // Correct path: advance after the absorb animation.
    window.setTimeout(() => {
      s.card = null;
      s.idx = c.idx + 1;
      s.nextStartAt = performance.now() + 600;
    }, 700);
  };

  // Got-It handler: clear pause, advance to next card.
  const gotIt = () => {
    setFeedback(null);
    const s = state.current;
    if (s.card) {
      const c = s.card;
      s.card = null;
      s.idx = c.idx + 1;
      s.nextStartAt = performance.now() + 400;
    }
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
    setFeedback(null);
    setWrongCount(0);
  };

  // Render loop
  useEffect(() => {
    if (showIntro) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Hi-DPI setup so card text + shield glyphs are crisp on Retina.
    // Without this the canvas was being upscaled by the browser from
    // 720×340 → ~1440×680 on 2x displays, producing soft text.
    const setup = setupHiDpiCanvas(canvas, {
      logicalWidth: CANVAS_W,
      logicalHeight: CANVAS_H,
      maxDpr: 2,
    });
    if (!setup) return;
    const ctx = setup.ctx;

    let running = true;
    let lastTime = performance.now();
    state.current.nextStartAt = performance.now() + 2200;

    // Visibility-aware: when the tab is hidden the browser still
    // delivers rAF callbacks but at ~1Hz, which made cards "teleport"
    // on tab return. Re-baseline lastTime when visibility flips.
    const onVis = () => {
      if (document.hidden) lastTime = performance.now();
    };
    document.addEventListener("visibilitychange", onVis);

    const spawnNext = (now: number) => {
      const s = state.current;
      if (s.card) return;
      if (s.idx >= list.length) {
        if (!s.finished) {
          s.finished = true;
          // Pass best streak so the finale burst scales with how
          // confidently the kid played - bigger streak = bigger party.
          void correctAnswerBurst(s.bestStreak);
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
        duration: transitTimeMs(s.idx, comfortRef.current),
        resolved: false,
        outcome: null,
        absorbProgress: 0,
        absorbStartX: 0,
        absorbStartY: 0,
      };
    };

    const tick = (now: number) => {
      if (!running) return;
      // True-pause when the tab is hidden: skip all update + draw
      // work entirely. The browser still delivers throttled frames
      // (~1Hz) so we just re-arm rAF and bail. lastTime is
      // rebaselined via the visibilitychange listener so dt doesn't
      // explode on resume.
      if (document.hidden) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }
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
          addFloater("TIME'S UP!", x - 30, BEAM_Y - 40, CV.floaterSlow, 22);
          s.streak = 0;
          s.wrong += 1;
          playSoftWrong();
          onWrong?.();
          // Pause-on-timeout: show the same friendly overlay rather
          // than punishing with a fast auto-advance. Got-It will move
          // to the next card.
          setWrongCount((n) => n + 1);
          setFeedback({
            title: "That one ran out of time",
            explanation: `It was ${c.isStrong ? "STRONG" : "WEAK"} - ${c.explanation}`,
            tip: "It's OK to take your time. Tap STRONG or WEAK before the card crosses the beam.",
          });
        }
      }

      if (s.card && s.card.resolved && s.card.outcome === "correct") {
        s.card.absorbProgress = Math.min(1, s.card.absorbProgress + 0.08 * frames);
      }
      // Eased absorb position for nicer "snap into the shield" feel.
      // Linear progress made the card look like it was on a rail; an
      // easeOutBack overshoots slightly then settles, which reads as
      // a real magnetic pull.

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

      // Cyber scanner beam - was a warm cream/orange centre with a
      // warm-orange centre stroke (comment said "Golden" - Pixar
      // leftover). Now a cool cyan-white centre over a violet halo,
      // with a cyan centre stroke. Reads as a holographic scanner
      // beam not a stage spotlight.
      const beamPulse = 0.85 + 0.15 * Math.sin(now / 300);
      const beamGrad = ctx.createLinearGradient(0, BEAM_Y - 50, 0, BEAM_Y + 50);
      beamGrad.addColorStop(0, CV.beamEdge);
      beamGrad.addColorStop(0.4, `rgba(124, 92, 255, ${0.45 * beamPulse})`);
      beamGrad.addColorStop(0.5, `rgba(220, 250, 255, ${0.7 * beamPulse})`);
      beamGrad.addColorStop(0.6, `rgba(124, 92, 255, ${0.45 * beamPulse})`);
      beamGrad.addColorStop(1, CV.beamEdge);
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, BEAM_Y - 50, CANVAS_W, 100);
      ctx.strokeStyle = `rgba(125, 240, 255, ${0.75 * beamPulse})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, BEAM_Y);
      ctx.lineTo(CANVAS_W, BEAM_Y);
      ctx.stroke();

      // Cyber shield, top-right
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
      shieldGrad.addColorStop(0, "#7df0ff");
      shieldGrad.addColorStop(0.6, "#00e5ff");
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
          const tRaw = c.absorbProgress;
          const t = ease01(tRaw, easeOutBack);
          const tScale = ease01(tRaw, easeOutCubic);
          x = c.absorbStartX + (SHIELD_X - c.absorbStartX) * t;
          y = c.absorbStartY + (SHIELD_Y - c.absorbStartY) * t;
          scale = 1 - tScale * 0.85;
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

        // Card body - paper gradient
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
          ctx.fillStyle = "rgba(255, 95, 179, 0.18)";
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
      document.removeEventListener("visibilitychange", onVis);
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
        // The wrapper caps width AND derives its width from available
        // vertical room. 720/340 is the canvas aspect ratio. The
        // reserve (280px) covers HUD + safe-area-bottom + hint area
        // + STRONG/WEAK button row + LessonStage padding. With this
        // calc, on a short browser window (e.g. 700px tall) the
        // wrapper shrinks horizontally so the canvas+buttons fit
        // vertically without clipping.
        // Expanded cap: the playable area now scales up with the
        // viewport instead of sitting in a fixed 760px island. The
        // calc-from-height term still caps the canvas vertically so
        // it never clips on short windows.
        maxWidth: "min(1400px, calc((100dvh - 280px) * 720 / 340))",
        margin: "0 auto",
        borderRadius: 28,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #0f1530 0%, #1a2147 55%, #252d5e 100%)",
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
        accent="#3a7bff"
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

      {/* Tiered hint - reserves layout space so the buttons don't jump */}
      <div style={{ minHeight: 0, padding: wrongCount > 0 ? "10px 22px 0" : 0 }}>
        {wrongCount === 1 && (
          <HintBubble
            tier={1}
            speaker="adam"
            text="Look at the password's LENGTH first - 8 or more characters is the safe minimum. Then check if it uses both LETTERS and numbers/symbols."
          />
        )}
        {wrongCount === 2 && (
          <HintBubble
            tier={2}
            speaker="adam"
            text="STRONG = long AND mixed AND not a word you'd find in a book. WEAK = short, common, or about you."
            example="STRONG: Tr0pic4l$un!   WEAK: football"
          />
        )}
        {wrongCount >= 3 && (
          <HintBubble
            tier={3}
            speaker="layla"
            text="Quick rule card: 8+ characters · mix UPPER + lower + numbers + symbols · no real words · no your-name."
            example="Tr0pic4l$un!  ✅    password123  ❌"
          />
        )}
      </div>

      {/* Big tactile answer buttons */}
      <div
        style={{
          display: "flex",
          gap: 16,
          padding: "18px 22px 24px",
          // Was a warm parchment-orange gradient under the buttons
          // (Pixar leftover). Now a deep abyss → midnight wash that
          // visually anchors the buttons in the cyber surface.
          background:
            "linear-gradient(180deg, transparent 0%, rgba(15, 21, 48, 0.55) 60%, rgba(8, 10, 22, 0.78) 100%)",
        }}
      >
        <ScannerButton
          label="🛡  STRONG"
          tint="#4a9a6a"
          accent="#7eff97"
          disabled={s.finished}
          onClick={() => resolveCurrent(true)}
        />
        <ScannerButton
          label="💀  WEAK"
          tint="#ff7a59"
          accent="#ff5fb3"
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
      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          speaker="layla"
          onContinue={gotIt}
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
        color: "#e8edff",
        fontWeight: 900,
        fontSize: 18,
        letterSpacing: 2,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontFamily: "inherit",
        // Was warm parchment inner highlight + warm-brown bottom rim.
        // Cyber: cyan inner glint + abyss-navy bottom rim.
        boxShadow: `0 14px 28px -8px ${tint}aa, 0 0 0 1px rgba(125, 240, 255, 0.5) inset, 0 -4px 0 rgba(8, 10, 22, 0.55) inset`,
        textShadow: "0 1px 2px rgba(8, 10, 22, 0.55)",
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
        // Was a warm purple-brown second stop (rgba(20,8,24,0.96)) -
        // tightened to pure cyber abyss so the overlay reads as the
        // same surface as the rest of the lesson.
        background:
          "linear-gradient(180deg, rgba(15, 21, 48, 0.95) 0%, rgba(4, 5, 13, 0.96) 100%)",
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
          color: "#7df0ff",
          textTransform: "uppercase",
          marginBottom: 4,
          fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
          textShadow: "0 0 10px rgba(0, 229, 255, 0.5)",
        }}
      >
        ◇ Scan Complete ◇
      </div>
      <div
        style={{
          fontSize: 36,
          fontWeight: 900,
          background:
            "linear-gradient(135deg, #00e5ff, #7c5cff, #3a7bff)",
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
          Accuracy <strong style={{ color: "#a0ffb0" }}>{accuracy}%</strong>
        </span>
        <span>·</span>
        <span>
          Speed bonuses <strong style={{ color: "#00e5ff" }}>{speedBonuses}</strong>
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
            background: "rgba(15, 21, 48, 0.65)",
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
