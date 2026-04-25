"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";

export interface CutsceneSlide {
  character?: "adam" | "layla" | "raccoon" | "both";
  characterMood?: string;
  text: string;
  textColour?: string;
  bg?: "dark" | "danger" | "victory" | "normal";
  shake?: boolean;
  sound?: string;
  duration?: number;
}

export interface StoryCutsceneProps {
  slides: CutsceneSlide[];
  onComplete: () => void;
  title?: string;
}

const DEFAULT_DURATION = 4000;
const TITLE_DURATION = 2500;
const SLIDE_FADE_OUT_MS = 250;
const SLIDE_GAP_MS = 0;
const WORD_STAGGER_MS = 60;

type Phase = "title" | "showing" | "transition" | "complete";

export default function StoryCutscene({ slides, onComplete, title }: StoryCutsceneProps) {
  const [index, setIndex] = useState<number>(title ? -1 : 0);
  const [phase, setPhase] = useState<Phase>(title ? "title" : "showing");
  const advanceTimerRef = useRef<number | null>(null);
  const transitionTimerRef = useRef<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const totalSlides = slides.length;
  const activeSlide: CutsceneSlide | null = index >= 0 ? slides[index] ?? null : null;
  const duration = useMemo(() => {
    if (phase === "title") return TITLE_DURATION;
    return activeSlide?.duration ?? DEFAULT_DURATION;
  }, [phase, activeSlide]);

  useEffect(() => {
    if (phase !== "showing") return;
    if (!activeSlide?.sound) return;
    playSound(activeSlide.sound);
  }, [phase, activeSlide]);


  const clearTimers = () => {
    if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current);
    if (transitionTimerRef.current) window.clearTimeout(transitionTimerRef.current);
    advanceTimerRef.current = null;
    transitionTimerRef.current = null;
  };

  const goToNext = useCallback(() => {
    clearTimers();
    if (phase === "title") {
      setPhase("transition");
      transitionTimerRef.current = window.setTimeout(() => {
        setIndex(0);
        setPhase("showing");
      }, SLIDE_FADE_OUT_MS + SLIDE_GAP_MS);
      return;
    }
    if (index + 1 >= totalSlides) {
      setPhase("transition");
      transitionTimerRef.current = window.setTimeout(() => {
        setPhase("complete");
        onCompleteRef.current();
      }, SLIDE_FADE_OUT_MS + SLIDE_GAP_MS + 200);
      return;
    }
    setPhase("transition");
    transitionTimerRef.current = window.setTimeout(() => {
      setIndex((i) => i + 1);
      setPhase("showing");
    }, SLIDE_FADE_OUT_MS + SLIDE_GAP_MS);
  }, [index, phase, totalSlides]);

  const skipAll = useCallback(() => {
    clearTimers();
    setPhase("complete");
    onCompleteRef.current();
  }, []);

  // Button-gated advance: "Continue →" shows once the typewriter finishes
  // AND the slide's `duration` (as a minimum-hold) has elapsed.
  const [textDone, setTextDone] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const typewriterTimerRef = useRef<number | null>(null);
  const minHoldTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // Reset gating state whenever we enter a new slide/title.
    setTextDone(false);
    setMinElapsed(false);
    if (typewriterTimerRef.current) window.clearTimeout(typewriterTimerRef.current);
    if (minHoldTimerRef.current) window.clearTimeout(minHoldTimerRef.current);

    if (phase !== "showing" && phase !== "title") return;

    // Compute how long the typewriter needs for the visible text.
    const textForTypewriter = phase === "title" ? (title ?? "") : (activeSlide?.text ?? "");
    const wordCount = textForTypewriter
      .split(/\n/)
      .reduce((acc, line) => acc + line.split(/\s+/).filter(Boolean).length, 0);
    const typewriterMs = Math.max(200, wordCount * WORD_STAGGER_MS + 350);

    typewriterTimerRef.current = window.setTimeout(
      () => setTextDone(true),
      typewriterMs
    );
    minHoldTimerRef.current = window.setTimeout(
      () => setMinElapsed(true),
      duration
    );

    return () => {
      if (typewriterTimerRef.current) window.clearTimeout(typewriterTimerRef.current);
      if (minHoldTimerRef.current) window.clearTimeout(minHoldTimerRef.current);
    };
  }, [phase, index, duration, title, activeSlide]);

  const continueReady = textDone && minElapsed;
  const isLastSlide = phase === "showing" && index + 1 >= totalSlides;

  useEffect(() => () => clearTimers(), []);

  const bg = activeSlide?.bg ?? "normal";
  const shake = activeSlide?.shake && phase === "showing";

  // Overall progress percent (title counts as 0, last slide counts as 100).
  const progressPct = phase === "title"
    ? 0
    : Math.round(((index + 1) / Math.max(1, totalSlides)) * 100);

  /* Floating particle config — colour set depends on bg. */
  const particles = useMemo(() => {
    const palette =
      bg === "danger"
        ? ["#ef4444", "#f97316", "#fb923c", "#f43f5e", "#fbbf24"]
        : bg === "victory"
          ? ["#fbbf24", "#fde047", "#34d399", "#a7f3d0", "#f472b6"]
          : ["#60a5fa", "#34d399", "#a78bfa", "#fde047", "#fbbf24", "#f472b6"];
    return Array.from({ length: 25 }).map((_, i) => ({
      left: (i * 4.1 + (i % 3) * 2) % 100,
      size: 4 + (i % 4),
      colour: palette[i % palette.length],
      delay: (i * 0.9) % 14,
      duration: 16 + (i % 7) * 2.2,
      // Per-particle opacity ∈ [0.2, 0.35] for brighter, more vibrant feel.
      peakOpacity: 0.2 + ((i * 13) % 16) / 100,
    }));
  }, [bg]);

  return (
    <div className={`sc-root sc-bg-${phase === "title" ? "normal" : bg} ${shake ? "sc-shake" : ""}`}>
      {/* Warm stage lighting band at the bottom */}
      <div className="sc-stage-light" aria-hidden="true" />

      {/* Animated starfield — 50 stars, brighter */}
      <div className="sc-stars" aria-hidden="true">
        {Array.from({ length: 50 }).map((_, i) => (
          <span
            key={i}
            className="sc-star"
            style={{
              left: `${(i * 2.1 + (i % 7) * 1.3) % 100}%`,
              top: `${(i * 3.1 + (i % 5) * 2.1) % 100}%`,
              width: `${2 + (i % 2)}px`,
              height: `${2 + (i % 2)}px`,
              animationDuration: `${2 + (i % 4)}s`,
              animationDelay: `${(i * 0.19) % 5}s`,
              // Per-star peak opacity ∈ [0.2, 0.6]
              ["--sc-star-peak" as string]: `${0.2 + ((i * 11) % 41) / 100}`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Scrolling cyber grid */}
      <div className={`sc-grid sc-grid-${bg}`} aria-hidden="true" />

      {/* Ambient drifting radials */}
      <div className="sc-ambient sc-ambient-blue" aria-hidden="true" />
      <div className="sc-ambient sc-ambient-purple" aria-hidden="true" />

      {/* Floating particles */}
      <div className="sc-particles" aria-hidden="true">
        {particles.map((p, i) => (
          <span
            key={i}
            className="sc-particle"
            style={{
              left: `${p.left}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              background: p.colour,
              boxShadow: `0 0 10px ${p.colour}`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              ["--sc-particle-peak" as string]: `${p.peakOpacity}`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Danger vignette + pulsing red edges */}
      {bg === "danger" && (
        <>
          <div className="sc-danger-vignette" aria-hidden="true" />
          <div className="sc-danger-pulse" aria-hidden="true" />
        </>
      )}

      {/* Victory confetti + golden glow */}
      {bg === "victory" && (
        <>
          <div className="sc-victory-glow" aria-hidden="true" />
          <div className="sc-confetti" aria-hidden="true">
            {Array.from({ length: 20 }).map((_, i) => (
              <span
                key={i}
                className={i % 2 === 0 ? "sc-confetti-square" : "sc-confetti-circle"}
                style={{
                  left: `${(i * 5.1 + (i % 4) * 2.1) % 100}%`,
                  background: ["#fbbf24", "#fde047", "#34d399", "#60a5fa"][i % 4],
                  animationDelay: `${(i * 0.21) % 4}s`,
                  animationDuration: `${8 + (i % 4) * 2}s`,
                }}
              />
            ))}
          </div>
        </>
      )}

      {/* Top branded accent line */}
      <div className="sc-top-line" aria-hidden="true" />

      {/* Title slide */}
      {phase === "title" && title && (
        <div className="sc-slide sc-title-slide">
          <div className="sc-title-starburst" aria-hidden="true" />
          <h1 className="sc-title-text">{renderLines(title)}</h1>
        </div>
      )}

      {/* Regular slide */}
      {phase === "showing" && activeSlide && (
        <div key={`slide-${index}`} className="sc-slide">
          {activeSlide.character && (
            <div className={`sc-chars sc-chars-${activeSlide.character}`}>
              {activeSlide.character === "both" ? (
                <>
                  <div className="sc-char-slot sc-char-adam-slot">
                    <div className="sc-char-glow sc-char-glow-both-left" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={charSrc("adam", activeSlide.characterMood)}
                      alt="Adam"
                      className="sc-char-img sc-char-from-left"
                      onError={(e) => fallbackToIdle(e.currentTarget, "adam")}
                    />
                  </div>
                  <div className="sc-char-slot sc-char-layla-slot">
                    <div className="sc-char-glow sc-char-glow-both-right" aria-hidden="true" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={charSrc("layla", activeSlide.characterMood)}
                      alt="Layla"
                      className="sc-char-img sc-char-from-right"
                      onError={(e) => fallbackToIdle(e.currentTarget, "layla")}
                    />
                  </div>
                </>
              ) : activeSlide.character === "raccoon" ? (
                <>
                  <div className="sc-char-glow sc-char-glow-raccoon" aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={raccoonSrc(activeSlide.characterMood)}
                    alt="Raccoon"
                    className="sc-char-img sc-char-from-right"
                    onError={(e) => {
                      e.currentTarget.src = "/game/characters/raccoon-idle.png";
                    }}
                  />
                </>
              ) : (
                <>
                  <div className={`sc-char-glow sc-char-glow-${activeSlide.character}`} aria-hidden="true" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={charSrc(activeSlide.character, activeSlide.characterMood)}
                    alt={activeSlide.character}
                    className={
                      "sc-char-img " +
                      (activeSlide.character === "layla" ? "sc-char-from-right" : "sc-char-from-left")
                    }
                    onError={(e) => fallbackToIdle(e.currentTarget, activeSlide.character!)}
                  />
                </>
              )}
            </div>
          )}

          <div
            className={
              "sc-text-panel " +
              (activeSlide.character ? "sc-text-side" : "sc-text-centre") +
              (activeSlide.textColour ? " sc-text-villain" : "")
            }
          >
            <div
              className="sc-text-body"
              style={activeSlide.textColour ? { color: activeSlide.textColour } : undefined}
            >
              <WordReveal key={`words-${index}`} text={activeSlide.text} />
            </div>
          </div>
        </div>
      )}

      {/* Progress bar + dots */}
      {phase !== "title" && totalSlides > 0 && (
        <div className="sc-progress" aria-hidden="true">
          <div className="sc-progress-bar">
            <div className="sc-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="sc-dots">
            {slides.map((_, i) => {
              let cls = "sc-dot";
              if (i === index) cls = "sc-dot sc-dot-active";
              else if (i < index) cls = "sc-dot sc-dot-past";
              return <span key={i} className={cls} />;
            })}
          </div>
        </div>
      )}

      {/* Skip All (top-right) */}
      <button type="button" onClick={skipAll} className="sc-skip-all">
        Skip All ▸▸
      </button>

      {/* Continue / Start Lesson button — only after typewriter + min-hold */}
      {(phase === "showing" || phase === "title") && continueReady && (
        <button
          type="button"
          onClick={goToNext}
          className="sc-continue"
        >
          {isLastSlide ? "Start Lesson →" : "Continue →"}
        </button>
      )}

      <style>{CSS}</style>
    </div>
  );
}

/* ───────────────────────── helpers ───────────────────────── */

function charSrc(character: "adam" | "layla", mood?: string): string {
  const m = mood && mood.length > 0 ? mood : "idle";
  return `/game/characters/${character}-${m}.png`;
}
function raccoonSrc(mood?: string): string {
  const m = mood && mood.length > 0 ? mood : "idle";
  return `/game/characters/raccoon-${m}.png`;
}
function fallbackToIdle(img: HTMLImageElement, character: string) {
  const fallback = `/game/characters/${character}-idle.png`;
  if (img.src !== window.location.origin + fallback) {
    img.src = fallback;
  }
}
function renderLines(text: string) {
  return text.split("\n").map((line, i) => (
    <span key={i} style={{ display: "block" }}>{line}</span>
  ));
}

function WordReveal({ text }: { text: string }) {
  const lines = text.split("\n");
  let wordCount = 0;
  return (
    <>
      {lines.map((line, li) => (
        <span key={li} style={{ display: "block" }}>
          {line.split(/(\s+)/).map((part, wi) => {
            if (part.trim() === "") return <span key={wi}>{part}</span>;
            const delay = wordCount * WORD_STAGGER_MS;
            wordCount += 1;
            return (
              <span
                key={wi}
                className="sc-word"
                style={{ animationDelay: `${delay}ms` }}
              >
                {part}
              </span>
            );
          })}
        </span>
      ))}
    </>
  );
}

/* ───────────────────────── styles ───────────────────────── */

const CSS = `
@keyframes scWordIn {
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes scSlideIn {
  0% { opacity: 0; transform: scale(1.03); }
  100% { opacity: 1; transform: scale(1); }
}
@keyframes scSlideOut {
  0% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(0.97); }
}
@keyframes scShake {
  0%,100% { transform: translate(0,0); }
  20% { transform: translate(-6px, 2px); }
  40% { transform: translate(5px, -2px); }
  60% { transform: translate(-3px, 3px); }
  80% { transform: translate(4px, -1px); }
}
@keyframes scStarTwinkle {
  0%,100% { opacity: 0.2; }
  50% { opacity: var(--sc-star-peak, 0.6); }
}
@keyframes scParticleRise {
  0% { transform: translateY(0); opacity: 0; }
  10% { opacity: var(--sc-particle-peak, 0.32); }
  90% { opacity: var(--sc-particle-peak, 0.32); }
  100% { transform: translateY(-110vh); opacity: 0; }
}
@keyframes scGridScroll {
  0% { background-position: 0 0; }
  100% { background-position: 0 80px; }
}
@keyframes scAmbientBlue {
  0%,100% { transform: translate(-10%, -10%) scale(1); }
  50% { transform: translate(10%, 8%) scale(1.08); }
}
@keyframes scAmbientPurple {
  0%,100% { transform: translate(10%, 12%) scale(1); }
  50% { transform: translate(-12%, -8%) scale(1.08); }
}
@keyframes scDangerPulse {
  0%,100% { opacity: 0.5; }
  50% { opacity: 1; }
}
@keyframes scVictoryGlow {
  0%,100% { opacity: 0.6; }
  50% { opacity: 1; }
}
@keyframes scConfettiFall {
  0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
  10% { opacity: 0.9; }
  100% { transform: translateY(110vh) rotate(720deg); opacity: 0.9; }
}
@keyframes scCharFromLeft {
  0% { opacity: 0; transform: translateX(-80px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes scCharFromRight {
  0% { opacity: 0; transform: translateX(80px); }
  100% { opacity: 1; transform: translateX(0); }
}
@keyframes scGlowPulse {
  0%,100% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
  50% { opacity: 1; transform: translate(-50%, -50%) scale(1.08); }
}
@keyframes scTitlePulse {
  0%,100% { text-shadow: 0 0 30px rgba(250,204,21,0.7), 0 0 60px rgba(249,115,22,0.45); }
  50% { text-shadow: 0 0 56px rgba(250,204,21,1), 0 0 100px rgba(249,115,22,0.7); }
}
@keyframes scStarburst {
  0% { transform: translate(-50%, -50%) scale(0.6) rotate(0deg); opacity: 0.3; }
  100% { transform: translate(-50%, -50%) scale(1.4) rotate(360deg); opacity: 0.08; }
}

.sc-root {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 32px;
  font-family: 'DM Sans', sans-serif;
  overflow: hidden;
  animation: scSlideIn 0.4s ease-out both;
}
.sc-bg-normal, .sc-bg-dark, .sc-bg-danger, .sc-bg-victory {
  background: radial-gradient(ellipse at 50% 30%, #1a1040 0%, #0c1225 50%, #080c14 100%);
}
.sc-bg-dark { background: radial-gradient(ellipse at 50% 30%, #12102e 0%, #07091a 60%, #04060a 100%); }

/* Warm stage lighting from below — a drifting amber/blue band. */
.sc-stage-light {
  position: absolute;
  left: -20%; right: -20%;
  bottom: 0;
  height: 200px;
  background: linear-gradient(180deg, transparent 0%, rgba(59,130,246,0.06) 60%, rgba(251,191,36,0.045) 100%);
  filter: blur(12px);
  pointer-events: none;
  animation: scStageLight 14s ease-in-out infinite;
  z-index: 0;
}
@keyframes scStageLight {
  0%,100% { transform: translateX(-6%); }
  50%     { transform: translateX(6%); }
}

.sc-shake { animation: scSlideIn 0.4s ease-out, scShake 0.5s ease-in-out 0.2s; }

/* Top accent */
.sc-top-line {
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, #3b82f6, #34d399, #f97316);
  box-shadow: 0 0 12px rgba(59,130,246,0.45);
  z-index: 4;
  pointer-events: none;
}

/* Stars */
.sc-stars { position: absolute; inset: 0; pointer-events: none; }
.sc-star {
  position: absolute;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(255,255,255,0.85);
  animation: scStarTwinkle ease-in-out infinite;
  opacity: 0.35;
}

/* Grid */
.sc-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(96,165,250,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(96,165,250,0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  animation: scGridScroll 20s linear infinite;
  pointer-events: none;
}
.sc-grid-danger {
  background-image:
    linear-gradient(rgba(239,68,68,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(239,68,68,0.04) 1px, transparent 1px);
}
.sc-grid-victory {
  background-image:
    linear-gradient(rgba(251,191,36,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(251,191,36,0.04) 1px, transparent 1px);
}

/* Ambient radial glows drifting */
.sc-ambient {
  position: absolute;
  width: 80vmax; height: 80vmax;
  border-radius: 50%;
  filter: blur(40px);
  pointer-events: none;
}
.sc-ambient-blue {
  top: -30vmax; left: -30vmax;
  background: radial-gradient(circle, rgba(59,130,246,0.12), transparent 65%);
  animation: scAmbientBlue 22s ease-in-out infinite;
}
.sc-ambient-purple {
  bottom: -30vmax; right: -30vmax;
  background: radial-gradient(circle, rgba(124,58,237,0.12), transparent 65%);
  animation: scAmbientPurple 22s ease-in-out infinite;
}

/* Floating particles */
.sc-particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.sc-particle {
  position: absolute;
  bottom: -8px;
  border-radius: 50%;
  animation: scParticleRise linear infinite;
  opacity: 0;
}

/* Danger overlay */
.sc-danger-vignette {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.4) 100%);
  pointer-events: none;
}
.sc-danger-pulse {
  position: absolute; inset: 0;
  box-shadow: inset 0 0 150px rgba(239,68,68,0.12);
  animation: scDangerPulse 2s ease-in-out infinite;
  pointer-events: none;
}

/* Victory overlay */
.sc-victory-glow {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, rgba(251,191,36,0.08), transparent 70%);
  animation: scVictoryGlow 2.2s ease-in-out infinite;
  pointer-events: none;
}
.sc-confetti { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.sc-confetti-square, .sc-confetti-circle {
  position: absolute;
  top: -20px;
  width: 10px; height: 14px;
  animation: scConfettiFall linear infinite;
  opacity: 0.85;
}
.sc-confetti-circle { width: 10px; height: 10px; border-radius: 50%; }

/* Slide container */
.sc-slide {
  position: relative;
  z-index: 2;
  max-width: 1160px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 56px;
  animation: scSlideIn 0.4s ease-out both;
}

/* Title slide */
.sc-title-slide { justify-content: center; flex-direction: column; }
.sc-title-starburst {
  position: absolute;
  top: 50%; left: 50%;
  width: 520px; height: 520px;
  border-radius: 50%;
  background:
    conic-gradient(from 0deg,
      rgba(251,191,36,0.14) 0deg, transparent 20deg,
      rgba(251,191,36,0.14) 40deg, transparent 60deg,
      rgba(251,191,36,0.14) 80deg, transparent 100deg,
      rgba(251,191,36,0.14) 120deg, transparent 140deg,
      rgba(251,191,36,0.14) 160deg, transparent 180deg,
      rgba(251,191,36,0.14) 200deg, transparent 220deg,
      rgba(251,191,36,0.14) 240deg, transparent 260deg,
      rgba(251,191,36,0.14) 280deg, transparent 300deg,
      rgba(251,191,36,0.14) 320deg, transparent 340deg);
  transform: translate(-50%, -50%);
  animation: scStarburst 18s linear infinite;
  filter: blur(4px);
  pointer-events: none;
}
.sc-title-text {
  position: relative;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 56px;
  font-weight: 900;
  text-align: center;
  letter-spacing: 0.04em;
  margin: 0;
  background: linear-gradient(180deg, #fde047, #f59e0b);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  animation: scTitlePulse 2.2s ease-in-out infinite;
  line-height: 1.08;
}

/* Character column */
.sc-chars {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
  gap: 20px;
  min-width: 360px;
  min-height: 380px;
}
.sc-chars-both { min-width: 520px; gap: 20px; }
.sc-char-slot {
  position: relative;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  flex-shrink: 0;
}
.sc-char-img {
  position: relative;
  z-index: 1;
  height: 350px;
  width: auto;
  object-fit: contain;
  display: block;
  filter: drop-shadow(0 14px 28px rgba(0,0,0,0.65));
}
.sc-chars-both .sc-char-img { height: 300px; }

/* Layla's source PNG is full-body while Adam's is waist-up. Crop Layla
   to roughly Adam's framing so the two characters feel consistent when
   shown together (or alone in a scene that pairs with Adam elsewhere). */
.sc-chars-layla .sc-char-img,
.sc-char-layla-slot .sc-char-img {
  max-height: 310px;
  object-fit: cover;
  object-position: center top;
}

/* Character glow (soft radial in character colour) */
.sc-char-glow {
  position: absolute;
  top: 50%; left: 50%;
  width: 400px; height: 400px;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  z-index: 0;
  pointer-events: none;
  filter: blur(12px);
  animation: scGlowPulse 3.6s ease-in-out infinite;
}
.sc-char-glow-adam   { background: radial-gradient(circle, rgba(96,165,250,0.28), transparent 65%); }
.sc-char-glow-layla  { background: radial-gradient(circle, rgba(52,211,153,0.28), transparent 65%); }
.sc-char-glow-both-left  { background: radial-gradient(circle, rgba(96,165,250,0.22), transparent 65%); width: 320px; height: 320px; }
.sc-char-glow-both-right { background: radial-gradient(circle, rgba(52,211,153,0.22), transparent 65%); width: 320px; height: 320px; }
.sc-char-glow-raccoon {
  background:
    radial-gradient(circle, rgba(239,68,68,0.3), transparent 40%),
    radial-gradient(circle, rgba(124,58,237,0.22), transparent 65%);
  width: 440px; height: 440px;
  animation: scGlowPulse 1.8s ease-in-out infinite;
}

.sc-char-from-left  { animation: scCharFromLeft 0.5s ease-out both; }
.sc-char-from-right { animation: scCharFromRight 0.5s ease-out both; }

/* Text panel */
.sc-text-panel {
  position: relative;
  z-index: 2;
  background: rgba(10,14,26,0.7);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 28px 32px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  max-width: 560px;
}
.sc-text-centre { max-width: 760px; text-align: center; }
.sc-text-side   { text-align: left; }
.sc-text-body {
  font-family: 'DM Sans', sans-serif;
  font-size: 24px;
  line-height: 1.65;
  color: #e2e8f0;
  font-weight: 500;
}
.sc-text-villain .sc-text-body {
  text-shadow: 0 0 14px rgba(192,132,252,0.55), 0 0 28px rgba(239,68,68,0.35);
}
.sc-word {
  display: inline-block;
  opacity: 0;
  animation: scWordIn 0.35s ease-out forwards;
  will-change: transform, opacity;
}

/* Progress bar + dots */
.sc-progress {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  z-index: 3;
  width: 240px;
}
.sc-progress-bar {
  position: relative;
  width: 100%;
  height: 2px;
  background: rgba(148,163,184,0.14);
  border-radius: 1px;
  overflow: hidden;
}
.sc-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #34d399);
  transition: width 0.5s ease-out;
  box-shadow: 0 0 6px rgba(59,130,246,0.7);
}
.sc-dots { display: flex; gap: 8px; align-items: center; }
.sc-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  border: 1px solid rgba(148,163,184,0.3);
  transition: all 0.2s ease;
}
.sc-dot-past { background: rgba(148,163,184,0.55); border-color: transparent; }
.sc-dot-active {
  width: 10px; height: 10px;
  background: #60a5fa;
  border-color: transparent;
  box-shadow: 0 0 8px rgba(96,165,250,0.9);
}

/* Skip buttons */
.sc-continue {
  position: absolute;
  bottom: 64px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 5;
  background: rgba(15,23,42,0.6);
  border: 1.5px solid rgba(59,130,246,0.55);
  color: #f1f5f9;
  font-family: 'DM Sans', sans-serif;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.02em;
  padding: 10px 28px;
  border-radius: 12px;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 6px 20px rgba(59,130,246,0.25);
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  animation: scContinueIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.sc-continue:hover {
  background: rgba(59,130,246,0.18);
  border-color: #60a5fa;
  box-shadow: 0 8px 28px rgba(96,165,250,0.5);
  transform: translateX(-50%) translateY(-2px);
}
@keyframes scContinueIn {
  0% { opacity: 0; transform: translateX(-50%) translateY(12px); }
  100% { opacity: 1; transform: translateX(-50%) translateY(0); }
}

.sc-skip-all, .sc-skip-one {
  position: absolute;
  background: rgba(148,163,184,0.05);
  border: 1px solid rgba(255,255,255,0.08);
  color: #475569;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  letter-spacing: 0.04em;
  padding: 6px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease, background 0.15s ease;
  z-index: 4;
}
.sc-skip-all { top: 20px; right: 20px; font-weight: 600; }
.sc-skip-one { bottom: 20px; right: 20px; }
.sc-skip-all:hover, .sc-skip-one:hover {
  color: #e2e8f0;
  border-color: rgba(96,165,250,0.35);
  background: rgba(96,165,250,0.08);
  box-shadow: 0 0 12px rgba(96,165,250,0.25);
}

@media (max-width: 820px) {
  .sc-slide { flex-direction: column; gap: 28px; }
  .sc-chars { min-width: 0; min-height: 260px; }
  .sc-char-img { height: 260px; }
  .sc-chars-both .sc-char-img { height: 220px; }
  .sc-chars-both { min-width: 0; }
  .sc-text-body { font-size: 18px; }
  .sc-text-panel { padding: 20px 22px; }
  .sc-title-text { font-size: 40px; }
  .sc-title-starburst { width: 380px; height: 380px; }
}
`;
