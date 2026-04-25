"use client";

/*
 * MemoryMatch — Pixar 2.5D commercial polish.
 *
 * Game logic preserved (flip two cards, match the pair, mismatched
 * cards flip back, all-matched triggers a wave celebration). Visuals
 * fully redesigned: sunset backdrop with drifting motes (replaces the
 * neural-network SVG), parchment card backs with a golden ribbon
 * seal (replaces the hex-grid + chip glyph), warm paper card fronts
 * tinted by pair colour, design-token typography, polished finish
 * overlay with star pop.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { playSound } from "@/app/lib/sounds";
import {
  badgeEarnedCelebration,
  correctAnswerBurst,
} from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import ExerciseHowTo from "./ExerciseHowTo";
import { COLOR, SHADOW, SPRING } from "@/app/components/scene/tokens";

export interface MemoryPair {
  term: string;
  match: string;
  /** Hex accent. Defaults will pull from a Pixar-warm palette. */
  colour: string;
}

export interface MemoryMatchProps {
  pairs?: MemoryPair[];
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

const DEFAULT_PAIRS: MemoryPair[] = [
  { term: "Strong Password", match: "Tr0pic4l$unR1se!", colour: "#4a9a6a" },
  { term: "Phishing", match: "Fake email stealing info", colour: "#c4513a" },
  { term: "2FA", match: "Second check to prove it's you", colour: "#3a6e8e" },
  { term: "Firewall", match: "Blocks dangerous traffic", colour: "#d4733a" },
  { term: "Digital Footprint", match: "Everything you do online", colour: "#8e6abf" },
  { term: "Private Info", match: "Name, address, phone number", colour: "#c43c6a" },
];

interface Card {
  id: string;
  pairId: number;
  text: string;
  colour: string;
  flipped: boolean;
  matched: boolean;
  waveDelay: number;
}

const STYLES = `
@keyframes mmShake {
  0%,100% { transform: rotateY(180deg) translateX(0); }
  25%  { transform: rotateY(180deg) translateX(-6px); }
  75%  { transform: rotateY(180deg) translateX(6px); }
}
@keyframes mmPop {
  0%   { transform: rotateY(180deg) scale(1); }
  50%  { transform: rotateY(180deg) scale(1.12); }
  100% { transform: rotateY(180deg) scale(1); }
}
@keyframes mmWave {
  0%,100% { transform: rotateY(180deg) scale(1); }
  50%     { transform: rotateY(180deg) scale(1.18); }
}
@keyframes mmBurst {
  0%   { opacity: 1; transform: translate(0, 0) scale(1); }
  100% { opacity: 0; transform: translate(var(--dx, 0), var(--dy, -80px)) scale(0.3); }
}
@keyframes mmFadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: none; }
}
@keyframes mmSealSpin {
  to { transform: rotate(360deg); }
}
@keyframes mmMoteRise {
  0% { transform: translate(0, 0); opacity: 0; }
  15% { opacity: 1; }
  85% { opacity: 1; }
  100% { transform: translate(var(--mx, 0), var(--my, -180px)); opacity: 0; }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-memory-match-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

function shuffle<T>(arr: T[]): T[] {
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface Burst {
  id: number;
  x: number;
  y: number;
  colour: string;
}

export default function MemoryMatch({
  pairs,
  onComplete,
  onCorrect,
  onWrong,
}: MemoryMatchProps) {
  useEffect(ensureStyles, []);

  const pairList = useMemo(() => pairs ?? DEFAULT_PAIRS, [pairs]);

  const [cards, setCards] = useState<Card[]>(() => buildDeck(pairList));

  const [showIntro, setShowIntro] = useState(true);
  const [flippedIdxs, setFlippedIdxs] = useState<number[]>([]);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [flipCount, setFlipCount] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [shakeIdxs, setShakeIdxs] = useState<number[]>([]);
  const [popIdxs, setPopIdxs] = useState<number[]>([]);
  const [waveOn, setWaveOn] = useState(false);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const burstIdRef = useRef(0);
  const lockRef = useRef(false);
  const completedRef = useRef(false);
  const pairsFound = matchedPairIds.length;

  const resetExercise = () => {
    setCards(buildDeck(pairList));
    setFlippedIdxs([]);
    setMatchedPairIds([]);
    setFlipCount(0);
    setElapsedMs(0);
    setStreak(0);
    setBestStreak(0);
    setBursts([]);
    setShakeIdxs([]);
    setPopIdxs([]);
    setWaveOn(false);
    setFinished(false);
    lockRef.current = false;
    completedRef.current = false;
    startTimeRef.current = performance.now();
    setShowIntro(true);
  };

  // Timer
  useEffect(() => {
    startTimeRef.current = performance.now();
    timerRef.current = window.setInterval(() => {
      setElapsedMs(performance.now() - startTimeRef.current);
    }, 200) as unknown as ReturnType<typeof setInterval>;
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (finished && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [finished]);

  const flip = (idx: number) => {
    if (lockRef.current) return;
    if (showIntro) return;
    const c = cards[idx];
    if (!c || c.flipped || c.matched || finished) return;
    playSound("pop");
    setFlipCount((n) => n + 1);
    setCards((prev) => {
      const next = prev.slice();
      next[idx] = { ...next[idx], flipped: true };
      return next;
    });
    setFlippedIdxs((prev) => {
      const now = [...prev, idx];
      if (now.length === 2) checkMatch(now[0], now[1]);
      return now;
    });
  };

  const addBurst = (idx: number, colour: string) => {
    const el = document.querySelector<HTMLDivElement>(
      `[data-mm-card="${idx}"]`
    );
    if (!el) return;
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const parent = el.closest<HTMLDivElement>("[data-mm-root]");
    if (!parent) return;
    const pr = parent.getBoundingClientRect();
    const x = cx - pr.left;
    const y = cy - pr.top;
    const add: Burst[] = [];
    for (let i = 0; i < 8; i++) {
      add.push({ id: ++burstIdRef.current, x, y, colour });
    }
    setBursts((prev) => [...prev, ...add]);
    window.setTimeout(() => {
      const ids = new Set(add.map((b) => b.id));
      setBursts((prev) => prev.filter((b) => !ids.has(b.id)));
    }, 1100);
  };

  const checkMatch = (aIdx: number, bIdx: number) => {
    const a = cards[aIdx];
    const b = cards[bIdx];
    if (!a || !b) return;
    lockRef.current = true;
    if (a.pairId === b.pairId) {
      window.setTimeout(() => {
        playSound("correct");
        playSound("sortCorrect");
        addBurst(aIdx, a.colour);
        addBurst(bIdx, b.colour);
        setCards((prev) => {
          const next = prev.slice();
          next[aIdx] = { ...next[aIdx], matched: true };
          next[bIdx] = { ...next[bIdx], matched: true };
          return next;
        });
        setPopIdxs([aIdx, bIdx]);
        window.setTimeout(() => setPopIdxs([]), 450);
        setMatchedPairIds((prev) => {
          if (prev.includes(a.pairId)) return prev;
          const nn = [...prev, a.pairId];
          if (nn.length >= pairList.length && !completedRef.current) {
            triggerFinish();
          }
          return nn;
        });
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((bb) => Math.max(bb, ns));
          return ns;
        });
        setFlippedIdxs([]);
        lockRef.current = false;
        onCorrect?.();
      }, 320);
    } else {
      playSound("wrong");
      setStreak(0);
      setShakeIdxs([aIdx, bIdx]);
      onWrong?.();
      window.setTimeout(() => {
        setShakeIdxs([]);
        setCards((prev) => {
          const next = prev.slice();
          next[aIdx] = { ...next[aIdx], flipped: false };
          next[bIdx] = { ...next[bIdx], flipped: false };
          return next;
        });
        setFlippedIdxs([]);
        lockRef.current = false;
      }, 1200);
    }
  };

  const triggerFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    window.setTimeout(() => {
      setWaveOn(true);
      playSound("confetti");
      void correctAnswerBurst();
      void badgeEarnedCelebration();
      window.setTimeout(() => {
        setWaveOn(false);
        setFinished(true);
      }, 1600);
    }, 500);
  };

  const totalPairs = pairList.length;
  const totalCards = totalPairs * 2;
  const cols = totalCards >= 16 ? 4 : totalCards >= 12 ? 4 : 3;

  const stars = flipCount <= 14 ? 3 : flipCount <= 20 ? 2 : 1;
  const totalSeconds = Math.floor(elapsedMs / 1000);
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const ss = (totalSeconds % 60).toString().padStart(2, "0");

  return (
    <div
      data-mm-root
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 720,
        margin: "0 auto",
        maxHeight: "calc(100vh - 140px)",
        padding: "0 0 22px",
        borderRadius: 28,
        background:
          "linear-gradient(180deg, #fff7e0 0%, #fde2b5 55%, #f9c27a 100%)",
        boxShadow: SHADOW.sceneFrame,
        color: COLOR.inkDeep,
        overflow: "hidden",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
      }}
    >
      <PixarBackdrop />

      <div style={{ position: "relative", zIndex: 1, padding: "0 18px" }}>
        <ExerciseHowTo
          title="Memory Match"
          steps={[
            { glyph: "🧠", text: "Flip two cards to find a matching pair" },
            { glyph: "🔗", text: "Match the term to its meaning" },
            { glyph: "⚡", text: "Fewer flips = more stars" },
          ]}
          accent="#d4733a"
        />
        <div style={{ height: 14 }} />
        {/* HUD */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            fontSize: 13,
            fontWeight: 800,
            letterSpacing: 1,
            padding: "8px 14px",
            background: "rgba(50, 20, 35, 0.65)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            borderRadius: 14,
            color: COLOR.cream,
          }}
        >
          <span style={{ color: "#a8e3bb" }}>
            PAIRS {pairsFound}/{totalPairs}
          </span>
          <span style={{ color: "#fcd34d" }}>FLIPS {flipCount}</span>
          <span
            style={{
              color: "#ffd58a",
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
            }}
          >
            {mm}:{ss}
          </span>
          {streak >= 2 && (
            <span style={{ color: "#f08e7e" }}>STREAK x{streak}</span>
          )}
        </div>

        {/* Card grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 14,
            perspective: 900,
          }}
        >
          {cards.map((c, idx) => {
            const showFace = c.flipped || c.matched;
            const extraAnim =
              waveOn && c.matched
                ? `mmWave 0.5s ease-out ${c.waveDelay}s`
                : popIdxs.includes(idx)
                  ? "mmPop 0.4s ease-out"
                  : shakeIdxs.includes(idx)
                    ? "mmShake 0.35s ease-in-out 2"
                    : undefined;
            const jSeed =
              (c.id.charCodeAt(0) +
                c.id.charCodeAt(c.id.length - 1) +
                idx * 37) %
              360;
            const jRot = ((jSeed % 11) - 5) * 1.0;
            const jX = ((jSeed % 7) - 3) * 1.2;
            const jY = (((jSeed >> 3) % 7) - 3) * 1.2;
            const baseTransform = `translate(${jX}px, ${jY}px) rotate(${jRot}deg)`;
            return (
              <div
                key={c.id}
                data-mm-card={idx}
                onClick={() => flip(idx)}
                style={{
                  cursor: c.matched ? "default" : "pointer",
                  aspectRatio: "1 / 1",
                  position: "relative",
                  transformStyle: "preserve-3d",
                  transition:
                    "transform 0.45s cubic-bezier(0.4, 1.2, 0.4, 1)",
                  transform: showFace
                    ? `${baseTransform} rotateY(180deg)`
                    : baseTransform,
                  animation: extraAnim,
                  zIndex: c.matched ? 1 : 2,
                }}
              >
                <CardBack faceDown={!showFace} disabled={c.matched || c.flipped} />
                <CardFront
                  text={c.text}
                  colour={c.colour}
                  matched={c.matched}
                />
              </div>
            );
          })}
        </div>

        {/* Bursts on match */}
        {bursts.map((b, i) => {
          const angle =
            ((i % 8) / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
          const r = 50 + Math.random() * 30;
          return (
            <span
              key={b.id}
              style={
                {
                  position: "absolute",
                  left: b.x,
                  top: b.y,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: b.colour,
                  boxShadow: `0 0 12px ${b.colour}`,
                  pointerEvents: "none",
                  "--dx": `${Math.cos(angle) * r}px`,
                  "--dy": `${Math.sin(angle) * r - 30}px`,
                  animation: "mmBurst 1s ease-out forwards",
                } as React.CSSProperties
              }
            />
          );
        })}
      </div>

      {finished && (
        <FinishOverlay
          mm={mm}
          ss={ss}
          flipCount={flipCount}
          bestStreak={bestStreak}
          stars={stars}
          onContinue={() => {
            playSound("click");
            onComplete(stars);
          }}
          onRetry={() => {
            playSound("select");
            resetExercise();
          }}
        />
      )}

      {showIntro && (
        <ExerciseIntro
          title="Memory Match"
          description="Flip the cards and match each term with its meaning! Fewer flips earn more stars."
          icon="🧠"
          controls="Click cards to flip them"
          onStart={() => setShowIntro(false)}
        />
      )}
    </div>
  );
}

/* ───────────────────────── PIXAR BACKDROP ───────────────────────── */

function PixarBackdrop() {
  const motes = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => ({
        left: (i * 47 + 11) % 100,
        top: 40 + ((i * 19) % 50),
        size: 2 + ((i * 5) % 4),
        duration: 8 + ((i * 3) % 6),
        delay: (i * 0.41) % 8,
        drift: ((i * 11) % 30) - 15,
      })),
    []
  );
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}
    >
      {/* Soft sun glow top-right */}
      <div
        style={{
          position: "absolute",
          top: "10%",
          right: "12%",
          width: 220,
          height: 220,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(255, 240, 180, 0.7) 0%, rgba(255, 200, 130, 0.3) 40%, transparent 80%)",
          filter: "blur(2px)",
        }}
      />
      {/* Drifting motes */}
      {motes.map((m, i) => (
        <span
          key={i}
          style={
            {
              position: "absolute",
              left: `${m.left}%`,
              top: `${m.top}%`,
              width: m.size,
              height: m.size,
              borderRadius: "50%",
              background: "rgba(255, 220, 170, 0.85)",
              boxShadow: `0 0 ${m.size * 3}px rgba(255, 200, 140, 0.6)`,
              animation: `mmMoteRise ${m.duration}s ease-in-out ${m.delay}s infinite`,
              "--mx": `${m.drift}px`,
              "--my": "-180px",
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}

/* ───────────────────────── CARD BACK ───────────────────────── */

function CardBack({
  faceDown,
  disabled,
}: {
  faceDown: boolean;
  disabled: boolean;
}) {
  void faceDown;
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        background:
          "linear-gradient(135deg, #fffaf0 0%, #fde2b5 60%, #f4cfa1 100%)",
        borderStyle: "solid",
        borderWidth: 1,
        borderColor: "rgba(196, 115, 64, 0.55)",
        boxShadow:
          "0 12px 28px -8px rgba(40, 18, 8, 0.45), inset 0 0 0 4px rgba(255, 245, 215, 0.85), inset 0 0 0 5px rgba(196, 115, 64, 0.35)",
        backfaceVisibility: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        overflow: "hidden",
        cursor: disabled ? "default" : "pointer",
      }}
      onMouseEnter={(e) => {
        if (disabled) return;
        (e.currentTarget as HTMLDivElement).style.transform =
          "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 18px 36px -8px rgba(40, 18, 8, 0.55), inset 0 0 0 4px rgba(255, 245, 215, 0.95), inset 0 0 0 5px rgba(196, 115, 64, 0.5)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 12px 28px -8px rgba(40, 18, 8, 0.45), inset 0 0 0 4px rgba(255, 245, 215, 0.85), inset 0 0 0 5px rgba(196, 115, 64, 0.35)";
      }}
    >
      {/* Subtle parchment grain via diagonal stripes */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.18,
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(140, 70, 25, 0.18) 0px, rgba(140, 70, 25, 0.18) 1px, transparent 1px, transparent 6px)",
        }}
      />
      {/* Slowly rotating gold halo */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          width: "70%",
          height: "70%",
          borderRadius: "50%",
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(255, 200, 100, 0.55) 70deg, transparent 140deg, rgba(255, 165, 80, 0.55) 240deg, transparent 320deg)",
          filter: "blur(6px)",
          animation: "mmSealSpin 10s linear infinite",
        }}
      />
      {/* Centre seal — gold star/medallion */}
      <svg
        width="58%"
        height="58%"
        viewBox="0 0 60 60"
        aria-hidden
        style={{ position: "relative", zIndex: 1 }}
      >
        <defs>
          <radialGradient id="mmSealG" cx="32%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#fff5cc" />
            <stop offset="35%" stopColor="#ffd158" />
            <stop offset="80%" stopColor="#d48a18" />
            <stop offset="100%" stopColor="#7a3a08" />
          </radialGradient>
        </defs>
        <circle
          cx="30"
          cy="30"
          r="22"
          fill="url(#mmSealG)"
          stroke="rgba(120, 60, 5, 0.45)"
          strokeWidth="1.5"
        />
        {/* Inner ring */}
        <circle
          cx="30"
          cy="30"
          r="16"
          fill="none"
          stroke="rgba(140, 70, 5, 0.45)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />
        {/* 4-point star */}
        <path
          d="M30 14 L33 27 L46 30 L33 33 L30 46 L27 33 L14 30 L27 27 Z"
          fill="#7a3a08"
          opacity="0.85"
        />
        {/* Centre sparkle */}
        <circle cx="30" cy="30" r="2" fill="#fff5cc" />
      </svg>
    </div>
  );
}

/* ───────────────────────── CARD FRONT ───────────────────────── */

function CardFront({
  text,
  colour,
  matched,
}: {
  text: string;
  colour: string;
  matched: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 16,
        background:
          "linear-gradient(180deg, #fffaf0 0%, #fdebcb 100%)",
        borderStyle: "solid",
        borderWidth: 2,
        borderColor: matched ? "#4a9a6a" : `${colour}88`,
        boxShadow: matched
          ? `0 0 22px ${colour}66, inset 0 0 18px ${colour}44, 0 12px 24px -8px rgba(40, 18, 8, 0.4)`
          : `0 8px 18px -6px rgba(40, 18, 8, 0.35), inset 0 0 0 1px ${colour}33`,
        backfaceVisibility: "hidden",
        transform: "rotateY(180deg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch",
        justifyContent: "center",
        padding: 0,
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      {/* Top accent ribbon */}
      <div
        style={{
          height: 6,
          background: `linear-gradient(90deg, ${colour}aa, ${colour}, ${colour}aa)`,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 12,
          fontSize: 14,
          fontWeight: 700,
          lineHeight: 1.3,
          color: COLOR.inkDeep,
          wordBreak: "break-word",
          fontFamily: "inherit",
        }}
      >
        {text}
      </div>
      {/* Matched green check */}
      {matched && (
        <div
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "#4a9a6a",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 900,
            boxShadow: "0 0 12px rgba(74, 154, 106, 0.6)",
          }}
        >
          ✓
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── FINISH OVERLAY ───────────────────────── */

function FinishOverlay({
  mm,
  ss,
  flipCount,
  bestStreak,
  stars,
  onContinue,
  onRetry,
}: {
  mm: string;
  ss: string;
  flipCount: number;
  bestStreak: number;
  stars: number;
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
        zIndex: 20,
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
        ✦ All Pairs Matched ✦
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
        BRILLIANT!
      </div>
      <div style={{ marginTop: 6, fontSize: 16, opacity: 0.92 }}>
        Time {mm}:{ss} &nbsp;·&nbsp; Flips {flipCount}
      </div>
      {bestStreak >= 2 && (
        <div style={{ marginTop: 2, fontSize: 12, opacity: 0.7, letterSpacing: 1 }}>
          Best streak: {bestStreak}
        </div>
      )}
      <div style={{ display: "flex", gap: 4, margin: "12px 0" }}>
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
          gap: 12,
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: 8,
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

function buildDeck(pairList: MemoryPair[]): Card[] {
  const raw: Card[] = [];
  pairList.forEach((p, i) => {
    raw.push({
      id: `p${i}-term`,
      pairId: i,
      text: p.term,
      colour: p.colour,
      flipped: false,
      matched: false,
      waveDelay: 0,
    });
    raw.push({
      id: `p${i}-match`,
      pairId: i,
      text: p.match,
      colour: p.colour,
      flipped: false,
      matched: false,
      waveDelay: 0,
    });
  });
  const s = shuffle(raw);
  return s.map((c, idx) => ({ ...c, waveDelay: idx * 0.05 }));
}
