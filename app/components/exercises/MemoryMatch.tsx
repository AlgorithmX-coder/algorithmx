"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import {
  badgeEarnedCelebration,
  correctAnswerBurst,
} from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";
import ExerciseHowTo from "./ExerciseHowTo";

export interface MemoryPair {
  term: string;
  match: string;
  colour: string;
}

export interface MemoryMatchProps {
  pairs?: MemoryPair[];
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

const DEFAULT_PAIRS: MemoryPair[] = [
  { term: "Strong Password", match: "Tr0pic4l$unR1se!", colour: "#34d399" },
  { term: "Phishing", match: "Fake email stealing info", colour: "#ef4444" },
  { term: "2FA", match: "Second check to prove it's you", colour: "#60a5fa" },
  { term: "Firewall", match: "Blocks dangerous traffic", colour: "#f97316" },
  { term: "Digital Footprint", match: "Everything you do online", colour: "#a78bfa" },
  { term: "Private Info", match: "Name, address, phone number", colour: "#f472b6" },
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
@keyframes mmRingSpin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

  const [cards, setCards] = useState<Card[]>(() => {
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
    const shuffled = shuffle(raw);
    return shuffled.map((c, idx) => ({ ...c, waveDelay: idx * 0.05 }));
  });

  const [showIntro, setShowIntro] = useState(true);
  const [flippedIdxs, setFlippedIdxs] = useState<number[]>([]);
  // matchedPairIds is the authoritative completion source — an array of
  // successfully-matched pair IDs, not a counter that could double-increment.
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
    setCards(s.map((c, idx) => ({ ...c, waveDelay: idx * 0.05 })));
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

  // Stop the timer once finished
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
          setBestStreak((b) => Math.max(b, ns));
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
    // Wait for the match pop animation (~500ms) before the wave celebration
    // so the final pair's green-glow finishes before the results overlay.
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
  const mm = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
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
        borderRadius: 24,
        background:
          "radial-gradient(circle at 50% 30%, rgba(168,85,247,0.15), transparent 60%), linear-gradient(180deg, #0a0e2a 0%, #05060f 100%)",
        border: "1px solid rgba(168,85,247,0.25)",
        boxShadow: "0 30px 60px -25px rgba(168,85,247,0.45), 0 0 60px rgba(168,85,247,0.15)",
        color: "#e2e8f0",
        overflow: "hidden",
      }}
    >
      {/* Animated neural-network backdrop — abstract synapse lines pulsing
          across the board. Pure SVG so it scales & costs nothing. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <style>{`
          @keyframes mmSynapse { 0%,100% { opacity: 0.25; } 50% { opacity: 0.7; } }
          @keyframes mmDataDrift { 0% { transform: translateX(-100%); } 100% { transform: translateX(120%); } }
          @keyframes mmNodeGlow { 0%,100% { opacity: 0.4; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
        `}</style>
        <svg width="100%" height="100%" viewBox="0 0 720 600" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0 }}>
          <defs>
            <linearGradient id="mmNodeGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#a78bfa" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          {/* Synapse lines */}
          {Array.from({ length: 18 }).map((_, i) => {
            const x1 = (i * 71) % 720;
            const y1 = (i * 113) % 600;
            const x2 = ((i + 3) * 89) % 720;
            const y2 = ((i + 5) * 137) % 600;
            return (
              <line
                key={`syn-${i}`}
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke="url(#mmNodeGrad)"
                strokeWidth="1"
                strokeOpacity="0.3"
                style={{ animation: `mmSynapse ${3 + (i % 5)}s ease-in-out ${i * 0.3}s infinite` }}
              />
            );
          })}
          {/* Network nodes */}
          {Array.from({ length: 22 }).map((_, i) => {
            const cx = (i * 53 + 17) % 720;
            const cy = (i * 89 + 31) % 600;
            const c = i % 3 === 0 ? "#a78bfa" : i % 3 === 1 ? "#22d3ee" : "#f472b6";
            return (
              <circle
                key={`node-${i}`}
                cx={cx} cy={cy} r="2.4"
                fill={c}
                style={{
                  filter: `drop-shadow(0 0 4px ${c})`,
                  animation: `mmNodeGlow ${2 + (i % 4)}s ease-in-out ${i * 0.18}s infinite`,
                  transformOrigin: `${cx}px ${cy}px`,
                }}
              />
            );
          })}
        </svg>
        {/* Drifting data streams */}
        {Array.from({ length: 6 }).map((_, i) => (
          <span key={`stream-${i}`} style={{
            position: "absolute",
            top: `${10 + i * 14}%`,
            left: 0,
            width: 80,
            height: 1.5,
            background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.7), transparent)",
            animation: `mmDataDrift ${6 + i * 1.4}s linear ${i * 1.2}s infinite`,
          }} />
        ))}
      </div>

      <div style={{ position: "relative", zIndex: 1, padding: "0 18px" }}>
      <ExerciseHowTo
        title="Memory Match"
        steps={[
          { glyph: "🧠", text: "Flip two cards to find a matching pair" },
          { glyph: "🔗", text: "Match the term to its meaning" },
          { glyph: "⚡", text: "Fewer flips = more stars" },
        ]}
        accent="#a78bfa"
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
        }}
      >
        <span style={{ color: "#7dd3fc" }}>
          PAIRS {pairsFound}/{totalPairs}
        </span>
        <span style={{ color: "#fbbf24" }}>FLIPS {flipCount}</span>
        <span style={{ color: "#a78bfa", fontFamily: "monospace" }}>
          {mm}:{ss}
        </span>
        {streak >= 2 && (
          <span style={{ color: "#f97316" }}>STREAK x{streak}</span>
        )}
      </div>

      {/* Card grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12,
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
                transition: "transform 0.45s cubic-bezier(0.4, 1.2, 0.4, 1)",
                transform: showFace ? "rotateY(180deg)" : "rotateY(0)",
                animation: extraAnim,
              }}
            >
              {/* Back (face-down) — holographic chip with rotating ring,
                  hex pattern and circuit-board feel. Replaces the flat
                  shield card the user said looked too plain. */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 16,
                  background:
                    "radial-gradient(circle at 30% 25%, rgba(167,139,250,0.45), transparent 60%)," +
                    "linear-gradient(135deg, #1f2150 0%, #0a0e2a 100%)",
                  border: "1px solid rgba(167,139,250,0.5)",
                  boxShadow:
                    "inset 0 0 18px rgba(167,139,250,0.2), 0 8px 22px rgba(167,139,250,0.25), 0 0 0 1px rgba(255,255,255,0.04)",
                  backfaceVisibility: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  if (c.matched || c.flipped) return;
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "inset 0 0 22px rgba(167,139,250,0.4), 0 14px 28px rgba(167,139,250,0.45), 0 0 0 1px rgba(255,255,255,0.08)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "inset 0 0 18px rgba(167,139,250,0.2), 0 8px 22px rgba(167,139,250,0.25), 0 0 0 1px rgba(255,255,255,0.04)";
                }}
              >
                {/* Hex grid texture */}
                <div aria-hidden style={{
                  position: "absolute", inset: 0, opacity: 0.18,
                  backgroundImage:
                    "radial-gradient(circle at 4px 4px, rgba(167,139,250,0.6) 1px, transparent 1.5px)",
                  backgroundSize: "10px 10px",
                }} />
                {/* Corner brackets */}
                <span aria-hidden style={{ position: "absolute", top: 4, left: 4, width: 8, height: 8, borderTop: "1.5px solid #a78bfa", borderLeft: "1.5px solid #a78bfa", opacity: 0.7 }} />
                <span aria-hidden style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderTop: "1.5px solid #22d3ee", borderRight: "1.5px solid #22d3ee", opacity: 0.7 }} />
                <span aria-hidden style={{ position: "absolute", bottom: 4, left: 4, width: 8, height: 8, borderBottom: "1.5px solid #22d3ee", borderLeft: "1.5px solid #22d3ee", opacity: 0.7 }} />
                <span aria-hidden style={{ position: "absolute", bottom: 4, right: 4, width: 8, height: 8, borderBottom: "1.5px solid #a78bfa", borderRight: "1.5px solid #a78bfa", opacity: 0.7 }} />
                {/* Slowly rotating gradient ring */}
                <span aria-hidden style={{
                  position: "absolute",
                  width: "65%", height: "65%",
                  borderRadius: "50%",
                  background: "conic-gradient(from 0deg, transparent 0deg, rgba(34,211,238,0.65) 70deg, transparent 140deg, rgba(167,139,250,0.65) 240deg, transparent 320deg)",
                  filter: "blur(4px)",
                  animation: `mmRingSpin 8s linear infinite`,
                }} />
                {/* Centre brain/chip glyph */}
                <svg width="50%" height="50%" viewBox="0 0 60 60" aria-hidden style={{ position: "relative" }}>
                  <defs>
                    <linearGradient id={`mmcg-${c.id}`} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="50%" stopColor="#a78bfa" />
                      <stop offset="100%" stopColor="#22d3ee" />
                    </linearGradient>
                  </defs>
                  {/* Chip outline */}
                  <rect x="14" y="14" width="32" height="32" rx="4"
                    fill="none" stroke={`url(#mmcg-${c.id})`} strokeWidth="2" />
                  {/* Pins */}
                  {[0, 1, 2, 3].map((p) => (
                    <g key={p}>
                      <line x1={20 + p * 6} y1="14" x2={20 + p * 6} y2="8" stroke="#a78bfa" strokeWidth="1.5" />
                      <line x1={20 + p * 6} y1="46" x2={20 + p * 6} y2="52" stroke="#a78bfa" strokeWidth="1.5" />
                      <line x1="14" y1={20 + p * 6} x2="8" y2={20 + p * 6} stroke="#22d3ee" strokeWidth="1.5" />
                      <line x1="46" y1={20 + p * 6} x2="52" y2={20 + p * 6} stroke="#22d3ee" strokeWidth="1.5" />
                    </g>
                  ))}
                  {/* Centre dot */}
                  <circle cx="30" cy="30" r="5" fill={`url(#mmcg-${c.id})`}>
                    <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="30" cy="30" r="2" fill="#fff" />
                </svg>
              </div>

              {/* Front (face-up) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 16,
                  background: `linear-gradient(135deg, ${c.colour}30, rgba(15,23,42,0.95))`,
                  border: `2px solid ${c.matched ? "#4ade80" : `${c.colour}99`}`,
                  boxShadow: c.matched
                    ? `0 0 22px ${c.colour}66, inset 0 0 18px ${c.colour}55`
                    : `inset 0 0 10px ${c.colour}33`,
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 10,
                  textAlign: "center",
                  fontFamily: "'DM Sans', 'Space Grotesk', sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  color: "#f1f5f9",
                  wordBreak: "break-word",
                }}
              >
                {c.text}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bursts on match */}
      {bursts.map((b, i) => {
        const angle = ((i % 8) / 8) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
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
                boxShadow: `0 0 10px ${b.colour}`,
                pointerEvents: "none",
                "--dx": `${Math.cos(angle) * r}px`,
                "--dy": `${Math.sin(angle) * r - 30}px`,
                animation: "mmBurst 1s ease-out forwards",
              } as React.CSSProperties
            }
          />
        );
      })}

      </div> {/* close zIndex:1 padded inner wrapper */}

      {/* Results overlay */}
      {finished && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(5,8,18,0.94)",
            backdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: 24,
            animation: "mmFadeIn 0.5s ease-out both",
            zIndex: 20,
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              background:
                "linear-gradient(135deg, #4ade80, #60a5fa, #a855f7)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 2,
            }}
          >
            ALL PAIRS MATCHED!
          </div>
          <div style={{ marginTop: 8, fontSize: 18 }}>
            Time: {mm}:{ss} &nbsp;·&nbsp; Flips: {flipCount}
          </div>
          <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>
            Best streak: {bestStreak}
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
                onComplete(stars);
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
          title="Memory Match"
          description="Flip the cards and match the cybersecurity pairs! Try to remember where each card is!"
          icon="🧠"
          controls="Click cards to flip them"
          onStart={() => setShowIntro(false)}
        />
      )}
    </div>
  );
}
