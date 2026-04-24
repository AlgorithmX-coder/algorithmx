"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";

export type ConveyorCategory = "strong" | "weak";

export interface ConveyorItem {
  text: string;
  category: ConveyorCategory;
}

export interface ConveyorBeltProps {
  items: ConveyorItem[];
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
}

type LeverPos = "neutral" | "up" | "down";

type PhaseTag = "enter" | "moving" | "routed" | "missed" | "pause";

interface Card {
  idx: number;
  text: string;
  category: ConveyorCategory;
  x: number;
  speed: number;
  phase: PhaseTag;
  routedAs: "strong" | "weak" | null;
  routeProgress: number;
  wasCorrect: boolean | null;
}

const STYLES = `
@keyframes cbBeltScroll {
  from { background-position: 0 0; }
  to   { background-position: -48px 0; }
}
@keyframes cbShredder {
  from { background-position: 0 0; }
  to   { background-position: 0 24px; }
}
@keyframes cbCardFall {
  0%   { opacity: 1; transform: translateY(0) rotate(0); }
  100% { opacity: 0; transform: translateY(220px) rotate(18deg); }
}
@keyframes cbFlashGood {
  0%,100% { box-shadow: 0 0 0 rgba(34,197,94,0); }
  50%     { box-shadow: 0 0 28px rgba(34,197,94,0.75); }
}
@keyframes cbFlashBad {
  0%,100% { box-shadow: 0 0 0 rgba(239,68,68,0); }
  25%     { box-shadow: 0 0 30px rgba(239,68,68,0.85); }
}
@keyframes cbSpark {
  0%   { transform: translate(0,0) scale(1); opacity: 1; }
  100% { transform: translate(var(--dx,0), var(--dy,0)) scale(0.3); opacity: 0; }
}
@keyframes cbMissed {
  0%   { opacity: 0; transform: translateY(-10px) scale(0.6); }
  100% { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes cbPulse {
  0%,100% { transform: scale(1); }
  50%     { transform: scale(1.08); }
}
@keyframes cbRoller {
  to { transform: rotate(360deg); }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-conveyor-belt-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

// Belt runs from BELT_LEFT px to BELT_RIGHT px within the playfield.
const BELT_LEFT = 24;
const BELT_RIGHT = 680;
const FORK_X = BELT_RIGHT - 40;
const BELT_Y = 260; // vertical centre of the belt

// How many px per frame to move a card at base speed.
const BASE_SPEED = (BELT_RIGHT - BELT_LEFT) / (6 * 60);

function speedForIndex(i: number) {
  if (i < 3) return BASE_SPEED;
  if (i < 6) return BASE_SPEED * 1.2;
  return BASE_SPEED * 1.4;
}

export default function ConveyorBelt({
  items,
  onComplete,
  onCorrect,
  onWrong,
}: ConveyorBeltProps) {
  useEffect(ensureStyles, []);

  const [card, setCard] = useState<Card | null>(null);
  const [lever, setLever] = useState<LeverPos>("neutral");
  const [leverFlash, setLeverFlash] = useState<"up" | "down" | null>(null);
  const [sortedIdx, setSortedIdx] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [savedCount, setSavedCount] = useState(0);
  const [shreddedCount, setShreddedCount] = useState(0);
  const [beltFlash, setBeltFlash] = useState<"good" | "bad" | null>(null);
  const [sparkKey, setSparkKey] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [missedBanner, setMissedBanner] = useState(false);

  const rafRef = useRef<number | null>(null);
  const nextSpawnRef = useRef<number>(0);
  const resolvingRef = useRef(false);

  // spawn next card
  useEffect(() => {
    if (card || showResult) return;
    if (sortedIdx >= items.length) {
      setShowResult(true);
      return;
    }
    const delay = sortedIdx === 0 ? 300 : 1200;
    const t = window.setTimeout(() => {
      const it = items[sortedIdx];
      setCard({
        idx: sortedIdx,
        text: it.text,
        category: it.category,
        x: BELT_LEFT,
        speed: speedForIndex(sortedIdx),
        phase: "moving",
        routedAs: null,
        routeProgress: 0,
        wasCorrect: null,
      });
      setLever("neutral");
      setLeverFlash(null);
      setMissedBanner(false);
      resolvingRef.current = false;
    }, delay);
    nextSpawnRef.current = t;
    return () => window.clearTimeout(t);
  }, [card, sortedIdx, items, showResult]);

  const resolveCard = useCallback(
    (c: Card, outcome: "strongOK" | "strongBad" | "weakOK" | "weakBad" | "miss") => {
      if (resolvingRef.current) return;
      resolvingRef.current = true;
      let correct = false;
      if (outcome === "strongOK" || outcome === "weakOK") correct = true;
      const routedAs: "strong" | "weak" | null =
        outcome === "strongOK" || outcome === "strongBad"
          ? "strong"
          : outcome === "weakOK" || outcome === "weakBad"
            ? "weak"
            : null;

      if (outcome === "miss") {
        playSound("wrong");
        setMissedBanner(true);
        onWrong?.();
        setStreak(0);
      } else if (correct) {
        playSound("sortCorrect");
        setCorrectCount((n) => n + 1);
        setStreak((s) => {
          const ns = s + 1;
          setBestStreak((b) => Math.max(b, ns));
          return ns;
        });
        if (routedAs === "strong") setSavedCount((n) => n + 1);
        else if (routedAs === "weak") setShreddedCount((n) => n + 1);
        setBeltFlash("good");
        window.setTimeout(() => setBeltFlash(null), 400);
        onCorrect?.();
      } else {
        playSound("sortWrong");
        setBeltFlash("bad");
        setSparkKey((k) => k + 1);
        window.setTimeout(() => setBeltFlash(null), 500);
        setStreak(0);
        if (routedAs === "strong") setSavedCount((n) => n + 1);
        else if (routedAs === "weak") setShreddedCount((n) => n + 1);
        onWrong?.();
      }
      setCard({
        ...c,
        phase: outcome === "miss" ? "missed" : "routed",
        routedAs,
        wasCorrect: correct,
      });
      window.setTimeout(() => {
        setSortedIdx((i) => i + 1);
        setCard(null);
      }, outcome === "miss" ? 900 : 700);
    },
    [onCorrect, onWrong]
  );

  // RAF loop
  useEffect(() => {
    if (!card || card.phase !== "moving") return;
    const step = () => {
      setCard((prev) => {
        if (!prev || prev.phase !== "moving") return prev;
        const nextX = prev.x + prev.speed;
        if (nextX >= FORK_X) {
          if (lever === "up") {
            resolveCard({ ...prev, x: FORK_X }, prev.category === "strong" ? "strongOK" : "strongBad");
          } else if (lever === "down") {
            resolveCard({ ...prev, x: FORK_X }, prev.category === "weak" ? "weakOK" : "weakBad");
          } else {
            resolveCard({ ...prev, x: FORK_X }, "miss");
          }
          return prev;
        }
        return { ...prev, x: nextX };
      });
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [card, lever, resolveCard]);

  useEffect(
    () => () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    },
    []
  );

  const pickLever = (pos: "up" | "down") => {
    if (!card || card.phase !== "moving") return;
    if (lever === pos) return;
    setLever(pos);
    setLeverFlash(pos);
    playSound("click");
    window.setTimeout(() => setLeverFlash(null), 350);
  };

  const total = items.length;
  const timeToFork =
    card && card.phase === "moving"
      ? Math.max(0, (FORK_X - card.x) / card.speed / 60)
      : 0;

  const stars =
    correctCount >= total * 0.9 ? 3 : correctCount >= total * 0.6 ? 2 : 1;

  // Spark particles triggered on wrong routing
  const sparks = Array.from({ length: 10 }).map((_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    return {
      key: `${sparkKey}-${i}`,
      dx: Math.cos(angle) * 60,
      dy: Math.sin(angle) * 60,
    };
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: 760,
        margin: "0 auto",
        height: 500,
        borderRadius: 24,
        overflow: "hidden",
        background:
          "radial-gradient(circle at 30% 30%, rgba(249,115,22,0.08), transparent 55%), linear-gradient(180deg, #1a0f1e 0%, #06080f 100%)",
        border: "1px solid rgba(255,255,255,0.08)",
        color: "#e2e8f0",
        fontFamily: "sans-serif",
        userSelect: "none",
        touchAction: "manipulation",
      }}
    >
      {/* HUD */}
      <div
        style={{
          position: "absolute",
          top: 10,
          left: 16,
          right: 16,
          display: "flex",
          justifyContent: "space-between",
          fontWeight: 800,
          fontSize: 14,
          letterSpacing: 1,
          zIndex: 4,
        }}
      >
        <span style={{ color: "#7dd3fc" }}>
          SORTED {sortedIdx}/{total}
        </span>
        <span style={{ color: "#fbbf24" }}>STREAK {streak}</span>
        <span style={{ color: "#f97316" }}>
          TIME {timeToFork.toFixed(1)}s
        </span>
      </div>
      <div
        style={{
          position: "absolute",
          top: 36,
          left: 0,
          right: 0,
          textAlign: "center",
          fontWeight: 900,
          letterSpacing: 3,
          fontSize: 14,
          color: "#94a3b8",
          zIndex: 4,
        }}
      >
        PASSWORD SORTING FACTORY
      </div>

      {/* Safe zone (top right) */}
      <div
        style={{
          position: "absolute",
          right: 16,
          top: 74,
          width: 130,
          height: 88,
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.22), rgba(34,197,94,0.08))",
          border: "2px solid rgba(34,197,94,0.5)",
          boxShadow: "0 0 18px rgba(34,197,94,0.25)",
          padding: 10,
          textAlign: "center",
          zIndex: 3,
        }}
      >
        <div style={{ fontSize: 11, color: "#86efac", letterSpacing: 1 }}>
          SAFE VAULT
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#4ade80",
            lineHeight: 1,
            marginTop: 4,
          }}
        >
          {savedCount}
        </div>
        <div style={{ fontSize: 10, color: "#bbf7d0", marginTop: 2 }}>
          saved ✓
        </div>
      </div>

      {/* Shredder (bottom right) */}
      <div
        style={{
          position: "absolute",
          right: 16,
          bottom: 22,
          width: 130,
          height: 88,
          borderRadius: 16,
          background:
            "linear-gradient(135deg, rgba(239,68,68,0.22), rgba(239,68,68,0.08))",
          border: "2px solid rgba(239,68,68,0.5)",
          boxShadow: "0 0 18px rgba(239,68,68,0.25)",
          padding: 10,
          textAlign: "center",
          overflow: "hidden",
          zIndex: 3,
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "repeating-linear-gradient(180deg, transparent 0 8px, rgba(239,68,68,0.35) 8px 12px)",
            backgroundSize: "100% 24px",
            animation: "cbShredder 0.8s linear infinite",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontSize: 11, color: "#fca5a5", letterSpacing: 1 }}>
            SHREDDER
          </div>
          <div
            style={{
              fontSize: 28,
              fontWeight: 900,
              color: "#f87171",
              lineHeight: 1,
              marginTop: 4,
            }}
          >
            {shreddedCount}
          </div>
          <div style={{ fontSize: 10, color: "#fecaca", marginTop: 2 }}>
            destroyed ✗
          </div>
        </div>
      </div>

      {/* Belt */}
      <div
        style={{
          position: "absolute",
          left: BELT_LEFT - 20,
          right: 170,
          top: BELT_Y - 8,
          height: 70,
          display: "flex",
          alignItems: "center",
          zIndex: 1,
        }}
      >
        {/* rollers */}
        <div
          style={{
            position: "absolute",
            left: -18,
            top: 5,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 30%, #cbd5e1 0%, #475569 55%, #0f172a 100%)",
            border: "2px solid #1e293b",
            boxShadow: "0 0 12px rgba(255,255,255,0.1)",
            animation: "cbRoller 1.8s linear infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: -18,
            top: 5,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 40% 30%, #cbd5e1 0%, #475569 55%, #0f172a 100%)",
            border: "2px solid #1e293b",
            animation: "cbRoller 1.8s linear infinite",
          }}
        />
        {/* belt surface */}
        <div
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            top: 12,
            height: 46,
            borderRadius: 8,
            background:
              "repeating-linear-gradient(135deg, #1e293b 0 12px, #0f172a 12px 24px)",
            backgroundSize: "48px 48px",
            animation: "cbBeltScroll 0.8s linear infinite",
            boxShadow:
              "inset 0 2px 6px rgba(255,255,255,0.1), inset 0 -2px 6px rgba(0,0,0,0.6)",
            outline:
              beltFlash === "good"
                ? "2px solid #22c55e"
                : beltFlash === "bad"
                  ? "2px solid #ef4444"
                  : "none",
            animationName: beltFlash
              ? beltFlash === "good"
                ? "cbFlashGood"
                : "cbFlashBad"
              : "cbBeltScroll",
          }}
        />
      </div>

      {/* Fork chutes */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: FORK_X - 8,
          top: BELT_Y - 80,
          width: 90,
          height: 72,
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.35), rgba(34,197,94,0.1))",
          border: "2px solid rgba(34,197,94,0.55)",
          borderRadius: "10px 20px 20px 10px",
          transform: "skewY(-18deg)",
          boxShadow: "0 0 12px rgba(34,197,94,0.25)",
          zIndex: 2,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: FORK_X - 8,
          top: BELT_Y + 34,
          width: 90,
          height: 72,
          background:
            "linear-gradient(135deg, rgba(239,68,68,0.35), rgba(239,68,68,0.1))",
          border: "2px solid rgba(239,68,68,0.55)",
          borderRadius: "10px 20px 20px 10px",
          transform: "skewY(18deg)",
          boxShadow: "0 0 12px rgba(239,68,68,0.25)",
          zIndex: 2,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: FORK_X + 4,
          top: BELT_Y - 96,
          fontSize: 11,
          fontWeight: 900,
          color: "#4ade80",
          letterSpacing: 1,
        }}
      >
        STRONG ↑
      </div>
      <div
        style={{
          position: "absolute",
          left: FORK_X + 4,
          top: BELT_Y + 112,
          fontSize: 11,
          fontWeight: 900,
          color: "#f87171",
          letterSpacing: 1,
        }}
      >
        WEAK ↓
      </div>

      {/* Lever */}
      <div
        style={{
          position: "absolute",
          left: FORK_X - 150,
          top: BELT_Y - 110,
          width: 70,
          height: 260,
          zIndex: 5,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          fontFamily: "monospace",
        }}
      >
        <button
          type="button"
          onClick={() => pickLever("up")}
          disabled={!card || card.phase !== "moving"}
          aria-label="Route to STRONG"
          style={{
            width: "100%",
            height: 60,
            borderRadius: "12px 12px 4px 4px",
            background:
              lever === "up"
                ? "linear-gradient(180deg, #22c55e, #15803d)"
                : "linear-gradient(180deg, #1e293b, #0f172a)",
            border: "2px solid rgba(34,197,94,0.5)",
            color: "#fff",
            fontWeight: 900,
            letterSpacing: 1,
            cursor: card ? "pointer" : "default",
            boxShadow:
              leverFlash === "up"
                ? "0 0 24px rgba(34,197,94,0.75)"
                : "0 2px 8px rgba(0,0,0,0.4)",
            transition: "all 0.25s ease",
          }}
        >
          ↑ STRONG
        </button>
        {/* lever body */}
        <div
          aria-hidden
          style={{
            position: "relative",
            flex: 1,
            width: 24,
            background:
              "linear-gradient(180deg, #64748b, #334155 50%, #0f172a)",
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.6)",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top:
                lever === "up"
                  ? "15%"
                  : lever === "down"
                    ? "85%"
                    : "50%",
              transform: "translate(-50%, -50%)",
              width: 36,
              height: 36,
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 40% 30%, #f8fafc, #94a3b8 55%, #1e293b)",
              boxShadow:
                "0 0 10px rgba(147,197,253,0.45), 0 3px 8px rgba(0,0,0,0.6)",
              transition: "top 0.25s cubic-bezier(0.4, 1.6, 0.5, 1)",
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => pickLever("down")}
          disabled={!card || card.phase !== "moving"}
          aria-label="Route to WEAK"
          style={{
            width: "100%",
            height: 60,
            borderRadius: "4px 4px 12px 12px",
            background:
              lever === "down"
                ? "linear-gradient(180deg, #ef4444, #991b1b)"
                : "linear-gradient(180deg, #0f172a, #1e293b)",
            border: "2px solid rgba(239,68,68,0.5)",
            color: "#fff",
            fontWeight: 900,
            letterSpacing: 1,
            cursor: card ? "pointer" : "default",
            boxShadow:
              leverFlash === "down"
                ? "0 0 24px rgba(239,68,68,0.75)"
                : "0 2px 8px rgba(0,0,0,0.4)",
            transition: "all 0.25s ease",
          }}
        >
          ↓ WEAK
        </button>
      </div>

      {/* The card on the belt */}
      {card && (
        <div
          style={{
            position: "absolute",
            left: card.x,
            top: card.phase === "routed"
              ? card.routedAs === "strong"
                ? BELT_Y - 50
                : BELT_Y + 50
              : BELT_Y,
            width: 200,
            height: 62,
            borderRadius: 12,
            background:
              card.phase === "routed" && card.wasCorrect === false
                ? "linear-gradient(135deg, rgba(239,68,68,0.45), rgba(127,29,29,0.7))"
                : "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
            border:
              card.phase === "routed" && card.wasCorrect === true
                ? "2px solid #4ade80"
                : card.phase === "routed" && card.wasCorrect === false
                  ? "2px solid #ef4444"
                  : "2px solid rgba(148,163,184,0.35)",
            color: "#f1f5f9",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Courier New', monospace",
            fontWeight: 700,
            fontSize: 15,
            padding: "0 10px",
            overflow: "hidden",
            transform: card.phase === "missed"
              ? "translateY(0)"
              : undefined,
            animation:
              card.phase === "missed"
                ? "cbCardFall 0.9s ease-in forwards"
                : undefined,
            transition:
              card.phase === "routed" ? "top 0.4s ease, left 0.4s ease" : "none",
            zIndex: 4,
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            boxShadow:
              card.phase === "routed" && card.wasCorrect === true
                ? "0 0 20px rgba(74,222,128,0.6)"
                : card.phase === "routed" && card.wasCorrect === false
                  ? "0 0 20px rgba(239,68,68,0.6)"
                  : "0 4px 12px rgba(0,0,0,0.5)",
          }}
        >
          {card.text}
        </div>
      )}

      {/* Spark particles on wrong route */}
      {sparkKey > 0 && card && card.phase === "routed" && card.wasCorrect === false && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: FORK_X + 20,
            top: BELT_Y,
            pointerEvents: "none",
            zIndex: 6,
          }}
        >
          {sparks.map((s) => (
            <span
              key={s.key}
              style={
                {
                  position: "absolute",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#fbbf24",
                  boxShadow: "0 0 6px #fbbf24",
                  "--dx": `${s.dx}px`,
                  "--dy": `${s.dy}px`,
                  animation: "cbSpark 0.6s ease-out forwards",
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Missed banner */}
      {missedBanner && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "40%",
            transform: "translate(-50%, -50%)",
            background: "rgba(239,68,68,0.9)",
            color: "#fff",
            padding: "10px 24px",
            borderRadius: 14,
            fontWeight: 900,
            letterSpacing: 2,
            fontSize: 18,
            animation: "cbMissed 0.25s ease-out both",
            zIndex: 7,
          }}
        >
          MISSED!
        </div>
      )}

      {/* Results */}
      {showResult && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(5,8,18,0.92)",
            backdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
            padding: 24,
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: 30,
              fontWeight: 900,
              marginBottom: 8,
              background:
                "linear-gradient(135deg, #60a5fa, #22c55e, #fbbf24)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            SHIFT COMPLETE!
          </div>
          <div style={{ fontSize: 20, color: "#e2e8f0", margin: "6px 0" }}>
            {correctCount} / {total} correct
          </div>
          <div style={{ fontSize: 14, color: "#94a3b8", marginBottom: 14 }}>
            Best streak: {bestStreak}
          </div>
          <div style={{ fontSize: 38, marginBottom: 16 }}>
            {"★".repeat(stars)}
            <span style={{ color: "rgba(148,163,184,0.4)" }}>
              {"★".repeat(3 - stars)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              playSound("click");
              onComplete(correctCount);
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
    </div>
  );
}
