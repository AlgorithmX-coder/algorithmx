"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import {
  badgeEarnedCelebration,
  correctAnswerBurst,
} from "@/app/lib/celebrations";
import ExerciseIntro from "./ExerciseIntro";

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
        padding: "20px 18px 28px",
        borderRadius: 24,
        background:
          "radial-gradient(circle at 50% 30%, rgba(168,85,247,0.15), transparent 60%), linear-gradient(180deg, #0a0e2a 0%, #05060f 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#e2e8f0",
        overflow: "hidden",
      }}
    >
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
              {/* Back (face-down) */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 16,
                  background:
                    "linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%)",
                  border: "1px solid rgba(96,165,250,0.35)",
                  boxShadow:
                    "inset 0 0 16px rgba(59,130,246,0.15), 0 4px 14px rgba(0,0,0,0.4)",
                  backfaceVisibility: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (c.matched || c.flipped) return;
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-3px)";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "inset 0 0 20px rgba(59,130,246,0.3), 0 8px 20px rgba(0,0,0,0.5)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.transform = "";
                  (e.currentTarget as HTMLDivElement).style.boxShadow =
                    "inset 0 0 16px rgba(59,130,246,0.15), 0 4px 14px rgba(0,0,0,0.4)";
                }}
              >
                {/* Shield mark */}
                <svg
                  width="46"
                  height="46"
                  viewBox="0 0 24 24"
                  aria-hidden
                  style={{ opacity: 0.55 }}
                >
                  <defs>
                    <linearGradient id={`mmsh-${c.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="100%" stopColor="#3b82f6" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
                    fill={`url(#mmsh-${c.id})`}
                    opacity="0.65"
                  />
                  <path
                    d="M8 12l3 3 5-6"
                    stroke="#fff"
                    strokeWidth="1.6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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
