"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";
import ExerciseIntro from "./ExerciseIntro";
import ExerciseHowTo from "./ExerciseHowTo";
import { PixarFinishOverlay } from "@/app/components/scene";

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
  // First card is 25% slower than base so new players have time to learn
  // where the lever is and what each position does.
  if (i === 0) return BASE_SPEED * 0.75;
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

  const [showIntro, setShowIntro] = useState(true);
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

  /* ─── PHASE B: FRENZY MODE ──────────────────────────────────────
   * After the kid sorts every standard item, instead of going straight
   * to the result we kick off a 6-card frenzy finale. Cards spawn
   * faster, the screen flashes "FRENZY!" overhead, and every correct
   * sort during this phase counts double toward a treasure-chest
   * bonus revealed at the end. Adds ~30s of high-tempo arcade play
   * without adding more questions. */
  type CBPhase = "playing" | "phase-a-done" | "frenzy" | "chest" | "result";
  const [phase, setPhase] = useState<CBPhase>("playing");
  const FRENZY_CARDS = 6;
  const [frenzyIdx, setFrenzyIdx] = useState(0);
  const [frenzyHits, setFrenzyHits] = useState(0);
  const frenzyItems = useMemo(() => {
    if (items.length === 0) return [] as typeof items;
    // Shuffle the standard items into a frenzy queue. We re-use the
    // same content so the kid is doubling down on what they just
    // learned, not solving brand-new content.
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    while (out.length < FRENZY_CARDS) out.push(...items);
    return out.slice(0, FRENZY_CARDS);
  }, [items]);

  const resetExercise = () => {
    setCard(null);
    setLever("neutral");
    setLeverFlash(null);
    setSortedIdx(0);
    setCorrectCount(0);
    setStreak(0);
    setBestStreak(0);
    setSavedCount(0);
    setShreddedCount(0);
    setBeltFlash(null);
    setSparkKey(0);
    setShowResult(false);
    setMissedBanner(false);
    setShowIntro(true);
    setPhase("playing");
    setFrenzyIdx(0);
    setFrenzyHits(0);
  };

  const rafRef = useRef<number | null>(null);
  const nextSpawnRef = useRef<number>(0);
  const resolvingRef = useRef(false);

  // spawn next card
  useEffect(() => {
    if (showIntro) return;
    if (card || showResult) return;
    if (phase === "phase-a-done" || phase === "chest" || phase === "result") return;

    // Phase A — exhausted the standard items? Pivot to the frenzy
    // transition card instead of going straight to the result. The
    // transition button kicks the player into "frenzy" phase.
    if (phase === "playing" && sortedIdx >= items.length) {
      setPhase("phase-a-done");
      return;
    }

    // Frenzy — exhausted the 6 frenzy cards? Open the chest reveal.
    if (phase === "frenzy" && frenzyIdx >= FRENZY_CARDS) {
      setPhase("chest");
      return;
    }

    // Pull the next item from the right queue + speed table for the
    // current phase. Frenzy cards spawn faster (700ms vs 1200ms) and
    // travel ~1.6× the base speed for a tangible tempo lift.
    const isFrenzy = phase === "frenzy";
    const idxThisPhase = isFrenzy ? frenzyIdx : sortedIdx;
    const queue = isFrenzy ? frenzyItems : items;
    const it = queue[idxThisPhase];
    if (!it) return;
    const delay = isFrenzy ? 700 : sortedIdx === 0 ? 2000 : 1200;
    const speed = isFrenzy ? BASE_SPEED * 1.6 : speedForIndex(sortedIdx);
    const t = window.setTimeout(() => {
      setCard({
        idx: idxThisPhase,
        text: it.text,
        category: it.category,
        x: BELT_LEFT,
        speed,
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
  }, [card, sortedIdx, items, showResult, showIntro, phase, frenzyIdx, frenzyItems]);

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
        // Frenzy-only: also bump the bonus tally for the chest reveal.
        if (phase === "frenzy") setFrenzyHits((n) => n + 1);
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
        // Advance the right counter for whichever phase we're in.
        if (phase === "frenzy") {
          setFrenzyIdx((i) => i + 1);
        } else {
          setSortedIdx((i) => i + 1);
        }
        setCard(null);
      }, outcome === "miss" ? 900 : 700);
    },
    [onCorrect, onWrong, phase]
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
        maxHeight: "calc(100vh - 140px)",
        borderRadius: 28,
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 20% 30%, rgba(255, 178, 110, 0.5), transparent 55%)," +
          "radial-gradient(ellipse at 80% 75%, rgba(196, 81, 58, 0.4), transparent 55%)," +
          "linear-gradient(180deg, #2a1240 0%, #5a2540 35%, #a04a4a 70%, #e88550 92%, #fcd58a 100%)",
        boxShadow:
          "0 40px 90px -30px rgba(40, 22, 12, 0.55), 0 0 0 1px rgba(255,210,170,0.25) inset",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        color: "#fff7e6",
        userSelect: "none",
        touchAction: "manipulation",
      }}
    >
      {/* Cyberpunk factory backdrop — hazard stripes, riveted plates,
          rotating cogs in shadow, drifting embers + steam, warning lights.
          All decorative; sits at zIndex 0 so HUD/cards land on top. */}
      <FactoryBackdrop />

      <div style={{ position: "relative", zIndex: 5 }}>
        <ExerciseHowTo
          title="Sorting Factory"
          steps={[
            { glyph: "⬆", text: "Lever UP to send STRONG to the safe" },
            { glyph: "⬇", text: "Lever DOWN to shred WEAK passwords" },
            { glyph: "⏱", text: "Decide before each card hits the fork" },
          ]}
          accent="#fbbf24"
        />
      </div>

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
          color: "rgba(255,233,200,0.55)",
          zIndex: 4,
        }}
      >
        PASSWORD SORTING FACTORY
      </div>

      {/* Safe zone (top right) — bumped down so it sits below the
          ExerciseHowTo header card instead of clipping into its
          rounded top edge. */}
      <div
        style={{
          position: "absolute",
          right: 16,
          top: 168,
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
        <div style={{ fontSize: 11, color: "#a8e3bb", letterSpacing: 1 }}>
          SAFE VAULT
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: "#7cc89a",
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
              "radial-gradient(circle at 40% 30%, #cbd5e1 0%, #475569 55%, #2a0d2e 100%)",
            border: "2px solid #3a1a3e",
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
              "radial-gradient(circle at 40% 30%, #cbd5e1 0%, #475569 55%, #2a0d2e 100%)",
            border: "2px solid #3a1a3e",
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
              "repeating-linear-gradient(135deg, #3a1a3e 0 12px, #2a0d2e 12px 24px)",
            backgroundSize: "48px 48px",
            animation: "cbBeltScroll 0.8s linear infinite",
            boxShadow:
              "inset 0 2px 6px rgba(255,255,255,0.1), inset 0 -2px 6px rgba(0,0,0,0.6)",
            outline:
              beltFlash === "good"
                ? "2px solid #7cc89a"
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
          color: "#7cc89a",
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
                ? "linear-gradient(180deg, #7cc89a, #15803d)"
                : "linear-gradient(180deg, #3a1a3e, #2a0d2e)",
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
              "linear-gradient(180deg, #64748b, #334155 50%, #2a0d2e)",
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
                "radial-gradient(circle at 40% 30%, #f8fafc, rgba(255,233,200,0.55) 55%, #3a1a3e)",
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
                : "linear-gradient(180deg, #2a0d2e, #3a1a3e)",
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
                ? "2px solid #7cc89a"
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

      {/* FRENZY mode banner — pulses overhead while frenzy phase is
          active so the kid feels the tempo shift. */}
      {phase === "frenzy" && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: 60,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 6,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 18px",
            borderRadius: 999,
            background:
              "linear-gradient(135deg, rgba(255, 213, 138, 0.95), rgba(255, 155, 74, 0.92))",
            boxShadow:
              "0 12px 28px -8px rgba(40, 18, 8, 0.5), 0 0 28px rgba(255, 213, 138, 0.55)",
            color: "#3a1a06",
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: 3,
            fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
            animation: "cbFrenzyPulse 0.9s ease-in-out infinite",
            textTransform: "uppercase",
          }}
        >
          ⚡ FRENZY {Math.min(frenzyIdx + (card ? 1 : 0), FRENZY_CARDS)}/{FRENZY_CARDS} · 2× POINTS
        </div>
      )}

      {/* Phase A → Phase B transition card */}
      {phase === "phase-a-done" && (
        <FrenzyTransitionCard
          standardCorrect={correctCount}
          standardTotal={total}
          onStart={() => {
            playSound("click");
            setPhase("frenzy");
          }}
        />
      )}

      {/* Treasure-chest reveal between Phase B and the result overlay */}
      {phase === "chest" && (
        <ChestRevealCard
          frenzyHits={frenzyHits}
          frenzyTotal={FRENZY_CARDS}
          onClaim={() => {
            playSound("click");
            // Frenzy hits are already counted into correctCount via the
            // resolver. The chest "bonus" here is purely a celebration
            // beat — a visible reward for the kid's accuracy in Phase B.
            // Roll the result overlay next.
            setPhase("result");
            setShowResult(true);
          }}
        />
      )}

      {showResult && (
        <PixarFinishOverlay
          badge={frenzyHits >= FRENZY_CARDS ? "Frenzy Champion" : "Shift Complete"}
          title={frenzyHits >= FRENZY_CARDS ? "PERFECT SHIFT!" : "WELL SORTED!"}
          subline={`${correctCount}/${total + FRENZY_CARDS} correct · ${frenzyHits}/${FRENZY_CARDS} frenzy · best streak ${bestStreak}`}
          stars={stars}
          onContinue={() => {
            playSound("click");
            onComplete(correctCount);
          }}
          onRetry={() => {
            playSound("select");
            resetExercise();
          }}
        />
      )}

      {showIntro && (
        <ExerciseIntro
          title="Conveyor Belt Factory"
          description="Passwords are moving along the belt! Pull the lever to sort them into STRONG or WEAK before they fall off!"
          icon="⚙️"
          controls="Click the lever up or down"
          onStart={() => setShowIntro(false)}
        />
      )}
      <style>{`
        @keyframes cbFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes cbFrenzyPulse {
          0%,100% { transform: translateX(-50%) scale(1); }
          50%     { transform: translateX(-50%) scale(1.06); }
        }
        @keyframes cbChestLid {
          0%   { transform: rotate(0); }
          70%  { transform: rotate(-95deg); }
          100% { transform: rotate(-80deg); }
        }
        @keyframes cbChestRise {
          from { transform: translateY(60px) scale(0.85); opacity: 0; }
          to   { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes cbChestSparkle {
          0%   { opacity: 0; transform: translate(0, 0) scale(0.4); }
          100% { opacity: 1; transform: translate(var(--sx, 0), var(--sy, -50px)) scale(1); }
        }
      `}</style>
    </div>
  );
}

/* ───────────────────────── FRENZY TRANSITION CARD ───────────── */

function FrenzyTransitionCard({
  standardCorrect,
  standardTotal,
  onStart,
}: {
  standardCorrect: number;
  standardTotal: number;
  onStart: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Frenzy Mode unlocking"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, rgba(40, 18, 38, 0.85) 0%, rgba(20, 8, 24, 0.92) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: 24,
        animation: "cbFadeIn 0.45s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          padding: "26px 28px 22px",
          borderRadius: 22,
          background:
            "linear-gradient(180deg, rgba(40, 18, 38, 0.92), rgba(20, 8, 24, 0.95))",
          border: "1px solid rgba(255, 220, 180, 0.42)",
          boxShadow:
            "0 30px 60px -20px rgba(20,6,12,0.7), 0 0 36px rgba(255, 178, 110, 0.3)",
          textAlign: "center",
          color: "#fff7e6",
          fontFamily:
            "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            letterSpacing: 4,
            fontWeight: 800,
            color: "#ffd58a",
            textTransform: "uppercase",
            padding: "4px 14px",
            background: "rgba(20, 6, 12, 0.55)",
            border: "1px solid rgba(255, 220, 180, 0.4)",
            borderRadius: 999,
            marginBottom: 12,
          }}
        >
          Phase 2 of 2
        </div>
        <div
          style={{
            fontSize: 56,
            lineHeight: 1,
            marginBottom: 4,
            filter:
              "drop-shadow(0 0 18px rgba(255, 213, 138, 0.7)) drop-shadow(0 0 32px rgba(255, 178, 110, 0.45))",
          }}
        >
          ⚡
        </div>
        <h2
          style={{
            fontSize: 26,
            fontWeight: 900,
            background:
              "linear-gradient(135deg, #fff5cc, #ffd58a, #ff9b4a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "4px 0 6px",
            letterSpacing: 0.3,
            fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
          }}
        >
          FRENZY MODE!
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#a8e3bb",
            margin: "0 0 6px",
            fontWeight: 700,
          }}
        >
          Phase 1: {standardCorrect}/{standardTotal} sorted ✓
        </p>
        <p
          style={{
            fontSize: 15,
            color: "#ffe9c8",
            opacity: 0.92,
            margin: "0 0 18px",
            lineHeight: 1.55,
          }}
        >
          Six rapid-fire passwords are about to fly down the belt. Get them
          all right and a treasure chest drops at the end!
        </p>
        <button
          type="button"
          onClick={onStart}
          style={{
            height: 46,
            padding: "0 28px",
            border: "none",
            borderRadius: 999,
            background: "linear-gradient(135deg, #ffd58a, #ff9b4a)",
            color: "#3a1a06",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: 0.5,
            cursor: "pointer",
            fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
            boxShadow:
              "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
          }}
        >
          Bring on the FRENZY →
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────── CHEST REVEAL CARD ─────────────────── */

function ChestRevealCard({
  frenzyHits,
  frenzyTotal,
  onClaim,
}: {
  frenzyHits: number;
  frenzyTotal: number;
  onClaim: () => void;
}) {
  const tier =
    frenzyHits >= frenzyTotal ? "gold" : frenzyHits >= 4 ? "silver" : "bronze";
  const tierColour =
    tier === "gold" ? "#ffd58a" : tier === "silver" ? "#e0d7c8" : "#d4985a";
  const tierLabel =
    tier === "gold" ? "GOLD CHEST" : tier === "silver" ? "SILVER CHEST" : "BRONZE CHEST";
  const sparkles = Array.from({ length: 12 }, (_, i) => ({
    angle: (i / 12) * Math.PI * 2,
    delay: i * 0.05,
  }));

  return (
    <div
      role="dialog"
      aria-label="Treasure chest reveal"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "linear-gradient(180deg, rgba(40, 18, 38, 0.9) 0%, rgba(20, 8, 24, 0.96) 100%)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: 24,
        animation: "cbFadeIn 0.45s ease-out",
      }}
    >
      <div
        style={{
          maxWidth: 460,
          width: "100%",
          padding: "26px 28px 22px",
          borderRadius: 22,
          background:
            "linear-gradient(180deg, rgba(40, 18, 38, 0.92), rgba(20, 8, 24, 0.95))",
          border: `1px solid ${tierColour}`,
          boxShadow: `0 30px 60px -20px rgba(20,6,12,0.7), 0 0 40px ${tierColour}55`,
          textAlign: "center",
          color: "#fff7e6",
          fontFamily:
            "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            letterSpacing: 4,
            fontWeight: 800,
            color: tierColour,
            textTransform: "uppercase",
            padding: "4px 14px",
            background: "rgba(20, 6, 12, 0.55)",
            border: `1px solid ${tierColour}`,
            borderRadius: 999,
            marginBottom: 14,
          }}
        >
          {tierLabel}
        </div>

        {/* Animated chest — body sits, lid hinges open via CSS */}
        <div
          style={{
            position: "relative",
            width: 130,
            height: 110,
            margin: "0 auto 14px",
            animation: "cbChestRise 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
          }}
        >
          {/* Sparkles emanating outward */}
          {sparkles.map((s, i) => {
            const dist = 70;
            const sx = Math.cos(s.angle) * dist;
            const sy = Math.sin(s.angle) * dist - 30;
            return (
              <span
                key={i}
                style={
                  {
                    position: "absolute",
                    left: "50%",
                    top: "50%",
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: tierColour,
                    boxShadow: `0 0 12px ${tierColour}`,
                    "--sx": `${sx}px`,
                    "--sy": `${sy}px`,
                    animation: `cbChestSparkle 1s ease-out ${s.delay}s forwards`,
                    opacity: 0,
                  } as React.CSSProperties
                }
              />
            );
          })}

          {/* Chest body */}
          <div
            style={{
              position: "absolute",
              left: 10,
              right: 10,
              bottom: 0,
              height: 60,
              background: "linear-gradient(180deg, #6a3a14, #3a1a06)",
              borderRadius: "6px 6px 10px 10px",
              border: `2px solid ${tierColour}`,
              boxShadow: "inset 0 -8px 14px rgba(0,0,0,0.45)",
            }}
          />
          {/* Glow inside the open chest */}
          <div
            style={{
              position: "absolute",
              left: 22,
              right: 22,
              bottom: 36,
              height: 30,
              borderRadius: 8,
              background: `radial-gradient(circle, ${tierColour} 0%, transparent 70%)`,
              filter: "blur(6px)",
              opacity: 0.95,
            }}
          />
          {/* Lid */}
          <div
            style={{
              position: "absolute",
              left: 8,
              right: 8,
              top: 24,
              height: 30,
              background: "linear-gradient(180deg, #8a4a18, #4a1f06)",
              borderRadius: "10px 10px 4px 4px",
              border: `2px solid ${tierColour}`,
              transformOrigin: "0% 100%",
              animation:
                "cbChestLid 0.9s cubic-bezier(0.4, 1.6, 0.55, 1) 0.4s both",
            }}
          />
          {/* Lock plate */}
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: 50,
              transform: "translateX(-50%)",
              width: 16,
              height: 16,
              borderRadius: 3,
              background: tierColour,
              border: "1px solid rgba(40, 18, 8, 0.55)",
              zIndex: 1,
            }}
          />
        </div>

        <h2
          style={{
            fontSize: 24,
            fontWeight: 900,
            background:
              "linear-gradient(135deg, #fff5cc, #ffd58a, #ff9b4a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            margin: "4px 0 4px",
            letterSpacing: 0.3,
            fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
          }}
        >
          {frenzyHits === frenzyTotal
            ? "ALL SIX!"
            : `${frenzyHits} of ${frenzyTotal} caught!`}
        </h2>
        <p
          style={{
            fontSize: 14,
            color: "#ffe9c8",
            opacity: 0.92,
            margin: "0 0 18px",
            lineHeight: 1.55,
          }}
        >
          {frenzyHits === frenzyTotal
            ? "A perfect frenzy run — you sorted every single one. The chest is yours!"
            : frenzyHits >= 4
            ? "Solid sorting under pressure. Take the chest!"
            : "Tough finale. Your brain is faster than you think — try again any time."}
        </p>
        <button
          type="button"
          onClick={onClaim}
          style={{
            height: 46,
            padding: "0 28px",
            border: "none",
            borderRadius: 999,
            background: "linear-gradient(135deg, #ffd58a, #ff9b4a)",
            color: "#3a1a06",
            fontWeight: 800,
            fontSize: 15,
            letterSpacing: 0.5,
            cursor: "pointer",
            fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif",
            boxShadow:
              "0 18px 36px -10px rgba(255,120,40,0.6), 0 0 0 1px rgba(255,235,200,0.55) inset, 0 -3px 0 rgba(180,80,30,0.4) inset",
          }}
        >
          Claim Treasure →
        </button>
      </div>
    </div>
  );
}

/* Cyber-deck decorative backdrop. Replaces the previous "old factory"
   look (cogs / pipes / pistons) with a holographic data-vault feel that
   matches the rest of the AlgorithmX UI: scan rings, neon circuit
   traces, drifting binary, server-rack racks of LEDs, and a sweeping
   light beam. Pure CSS / SVG, no game-state dependencies. */
function FactoryBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes cbHazardSlide { 0% { background-position: 0 0; } 100% { background-position: 60px 0; } }
        @keyframes cbWarnBlink { 0%,55%,100% { opacity: 0.35; box-shadow: 0 0 6px currentColor; } 60%,80% { opacity: 1; box-shadow: 0 0 22px currentColor; } }
        @keyframes cbBgPulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
        @keyframes cbScanRing { 0% { transform: translate(-50%, -50%) scale(0.4); opacity: 0.55; } 100% { transform: translate(-50%, -50%) scale(2); opacity: 0; } }
        @keyframes cbScanLine { 0% { transform: translateY(-100%); } 100% { transform: translateY(120%); } }
        @keyframes cbDataDrift { 0% { transform: translateX(-100%); } 100% { transform: translateX(120%); } }
        @keyframes cbHexFloat { 0%,100% { transform: translateY(0) rotate(0deg); opacity: 0.45; } 50% { transform: translateY(-12px) rotate(8deg); opacity: 0.85; } }
        @keyframes cbCircuitFlow { 0% { stroke-dashoffset: 0; } 100% { stroke-dashoffset: -64; } }
        @keyframes cbServerLed { 0%,100% { opacity: 0.3; } 50% { opacity: 1; } }
        @keyframes cbBeamSweep { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>

      {/* Layer 1 — radial cyan/violet/pink data-vault glow (replaces the
          warm orange/yellow factory ceiling lighting) */}
      <div style={{
        position: "absolute", inset: 0,
        background:
          "radial-gradient(ellipse at 22% 20%, rgba(255,213,138,0.22), transparent 38%)," +
          "radial-gradient(ellipse at 78% 22%, rgba(160,106,255,0.22), transparent 38%)," +
          "radial-gradient(ellipse at 50% 88%, rgba(247,193,214,0.16), transparent 50%)",
        animation: "cbBgPulse 4.4s ease-in-out infinite",
      }} />

      {/* Hex-grid texture (replaces riveted-plate dots) */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage:
          "radial-gradient(circle at 6px 6px, rgba(255,213,138,0.08) 1.2px, transparent 1.6px)," +
          "radial-gradient(circle at 18px 18px, rgba(160,106,255,0.06) 1px, transparent 1.4px)",
        backgroundSize: "24px 24px, 36px 36px",
        opacity: 0.85,
      }} />

      {/* Sweeping conic-gradient beam from the centre */}
      <span aria-hidden style={{
        position: "absolute", left: "50%", top: "50%",
        width: "180%", height: "180%",
        transform: "translate(-50%, -50%)",
        background:
          "conic-gradient(from 0deg, transparent 0deg, rgba(255,213,138,0.08) 30deg, transparent 60deg, rgba(160,106,255,0.08) 150deg, transparent 200deg)",
        animation: "cbBeamSweep 22s linear infinite",
        pointerEvents: "none",
      }} />

      {/* Vertical scan line drifting down */}
      <span aria-hidden style={{
        position: "absolute", left: 0, right: 0, height: 80,
        background: "linear-gradient(180deg, transparent, rgba(255,213,138,0.18), transparent)",
        animation: "cbScanLine 4.5s linear infinite",
        pointerEvents: "none",
        mixBlendMode: "screen",
      }} />

      {/* SVG cyber-deck: circuit traces, server-rack LEDs, holo-grid */}
      <svg
        aria-hidden
        viewBox="0 0 760 500"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <defs>
          <linearGradient id="cbCircuit" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffd58a" />
            <stop offset="100%" stopColor="#a06aff" />
          </linearGradient>
          <linearGradient id="cbServer" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(255,213,138,0.18)" />
            <stop offset="100%" stopColor="rgba(15,23,42,0.6)" />
          </linearGradient>
        </defs>

        {/* Top circuit-trace bus running across the screen */}
        <line x1="0" y1="28" x2="760" y2="28" stroke="url(#cbCircuit)" strokeWidth="1.5" opacity="0.55" />
        <line x1="0" y1="28" x2="760" y2="28"
          stroke="#ffd58a" strokeWidth="2"
          strokeDasharray="20 44"
          style={{ animation: "cbCircuitFlow 1.8s linear infinite", opacity: 0.85 }} />
        {/* Pad junctions */}
        {[120, 320, 540, 700].map((x) => (
          <g key={x}>
            <rect x={x - 5} y="22" width="10" height="12" fill="#2a0d2e" stroke="#ffd58a" strokeWidth="1" rx="1" />
            <circle cx={x} cy="28" r="2.5" fill="#ffd58a">
              <animate attributeName="opacity" values="0.4;1;0.4" dur="1.6s" repeatCount="indefinite" />
            </circle>
          </g>
        ))}

        {/* Server-rack tower (left) */}
        <g transform="translate(20 80)">
          <rect width="48" height="200" fill="url(#cbServer)" stroke="rgba(255,213,138,0.5)" strokeWidth="1" rx="3" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <line x1="0" y1={20 + i * 30} x2="48" y2={20 + i * 30} stroke="rgba(160,106,255,0.4)" strokeWidth="0.8" />
              {/* LED triplet per slot */}
              {[10, 22, 34].map((lx, j) => (
                <circle
                  key={j}
                  cx={lx}
                  cy={28 + i * 30}
                  r="1.6"
                  fill={j === 0 ? "#7cc89a" : j === 1 ? "#ffd58a" : "#a06aff"}
                  style={{ animation: `cbServerLed ${1.2 + (i + j) * 0.18}s ease-in-out ${(i * 0.1 + j * 0.2)}s infinite` }}
                />
              ))}
              {/* Slot label stripe */}
              <rect x="4" y={24 + i * 30} width="28" height="1" fill="rgba(255,255,255,0.18)" />
            </g>
          ))}
          {/* Top status text */}
          <text x="24" y="14" textAnchor="middle" fontFamily="monospace" fontSize="6" fill="#ffd58a" letterSpacing="1">
            NODE_07
          </text>
        </g>

        {/* Server-rack tower (right) — slightly offset for parallax */}
        <g transform="translate(696 110)">
          <rect width="44" height="180" fill="url(#cbServer)" stroke="rgba(160,106,255,0.5)" strokeWidth="1" rx="3" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i}>
              <line x1="0" y1={18 + i * 30} x2="44" y2={18 + i * 30} stroke="rgba(255,213,138,0.4)" strokeWidth="0.8" />
              {[8, 22, 36].map((lx, j) => (
                <circle
                  key={j}
                  cx={lx}
                  cy={26 + i * 30}
                  r="1.6"
                  fill={j === 0 ? "#a06aff" : j === 1 ? "#7cc89a" : "#f472b6"}
                  style={{ animation: `cbServerLed ${1.4 + (i + j) * 0.2}s ease-in-out ${(i * 0.15 + j * 0.18)}s infinite` }}
                />
              ))}
              <rect x="4" y={22 + i * 30} width="22" height="1" fill="rgba(255,255,255,0.18)" />
            </g>
          ))}
          <text x="22" y="12" textAnchor="middle" fontFamily="monospace" fontSize="6" fill="#a06aff" letterSpacing="1">
            NODE_12
          </text>
        </g>

        {/* Mid-deck circuit traces with pads */}
        <g stroke="rgba(255,213,138,0.32)" strokeWidth="1" fill="none">
          <path d="M 90 110 L 200 110 L 200 160 L 320 160" />
          <path d="M 440 100 L 540 100 L 540 150" />
          <path d="M 200 240 L 320 240 L 320 280 L 460 280" />
        </g>
        {/* Pad squares along those traces */}
        {[
          [90, 110], [200, 110], [200, 160], [320, 160],
          [440, 100], [540, 100], [540, 150],
          [200, 240], [320, 240], [320, 280], [460, 280],
        ].map(([x, y], i) => (
          <rect
            key={i}
            x={x - 2}
            y={y - 2}
            width="4"
            height="4"
            fill="#ffd58a"
            opacity="0.7"
            style={{ animation: `cbServerLed ${1.2 + (i % 4) * 0.4}s ease-in-out ${i * 0.12}s infinite` }}
          />
        ))}

        {/* Faint hex panels (replaces grid panels) */}
        {[120, 380, 600].map((x, i) => {
          const cx = x;
          const cy = 220 + (i % 2) * 30;
          const r = 18;
          const pts: string[] = [];
          for (let k = 0; k < 6; k++) {
            const a = (Math.PI / 3) * k;
            pts.push(`${cx + Math.cos(a) * r},${cy + Math.sin(a) * r}`);
          }
          return <polygon key={i} points={pts.join(" ")} fill="none" stroke="rgba(160,106,255,0.18)" strokeWidth="1" />;
        })}
      </svg>

      {/* Floating hex tokens */}
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={`hex-${i}`}
          style={{
            position: "absolute",
            left: `${10 + i * 18}%`,
            top: `${20 + (i % 2) * 30}%`,
            width: 18,
            height: 20,
            clipPath: "polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)",
            background: i % 2 === 0
              ? "linear-gradient(135deg, rgba(255,213,138,0.5), rgba(160,106,255,0.5))"
              : "linear-gradient(135deg, rgba(247,193,214,0.5), rgba(255,213,138,0.5))",
            filter: "drop-shadow(0 0 8px rgba(255,213,138,0.5))",
            animation: `cbHexFloat ${5 + (i % 3)}s ease-in-out ${i * 0.7}s infinite`,
          }}
        />
      ))}

      {/* Drifting binary stream */}
      {Array.from({ length: 6 }).map((_, i) => (
        <span
          key={`bin-${i}`}
          style={{
            position: "absolute",
            top: `${12 + i * 14}%`,
            left: 0,
            fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
            fontSize: 11,
            color: "rgba(255,213,138,0.45)",
            whiteSpace: "nowrap",
            animation: `cbDataDrift ${10 + i * 1.7}s linear ${i * 1.4}s infinite`,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 18 }).map((__, j) => ((i + j) % 2)).join(" ")}
        </span>
      ))}

      {/* Pulsing scan ring radiating from centre */}
      {[0, 1].map((i) => (
        <span
          key={`ring-${i}`}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 200,
            height: 200,
            borderRadius: "50%",
            border: "1.5px solid rgba(255,213,138,0.55)",
            animation: `cbScanRing 4.6s ease-out ${i * 2.3}s infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Hazard stripes ribbon along the bottom edge */}
      <div style={{
        position: "absolute", left: 0, right: 0, bottom: 0, height: 14,
        backgroundImage: "repeating-linear-gradient(45deg, #fbbf24 0 12px, #1a0f1e 12px 24px)",
        opacity: 0.7,
        animation: "cbHazardSlide 1.6s linear infinite",
      }} />
      {/* Top accent thin neon bar */}
      <div style={{
        position: "absolute", left: 0, right: 0, top: 0, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(255,213,138,0.55), rgba(160,106,255,0.55), transparent)",
      }} />

      {/* Status LED triplet — top-right HUD */}
      <span style={{ position: "absolute", top: 14, right: 22, width: 10, height: 10, borderRadius: "50%", background: "#ffd58a", color: "#ffd58a", animation: "cbWarnBlink 2.4s ease-in-out infinite" }} />
      <span style={{ position: "absolute", top: 14, right: 42, width: 10, height: 10, borderRadius: "50%", background: "#a06aff", color: "#a06aff", animation: "cbWarnBlink 2.4s ease-in-out 0.7s infinite" }} />
      <span style={{ position: "absolute", top: 14, right: 62, width: 10, height: 10, borderRadius: "50%", background: "#7cc89a", color: "#7cc89a", animation: "cbWarnBlink 2.4s ease-in-out 1.4s infinite" }} />

      {/* Drifting embers / sparks */}
      {Array.from({ length: 14 }).map((_, i) => {
        const left = (i * 47) % 100;
        const dur = 6 + (i % 5);
        const delay = (i * 0.7) % 8;
        const drift = ((i % 4) - 2) * 14;
        const c = ["#ffd58a", "#f97316", "#fb923c", "#fbbf24"][i % 4];
        return (
          <span
            key={`ember-${i}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: -6,
              width: 3, height: 3, borderRadius: "50%",
              background: c,
              boxShadow: `0 0 6px ${c}`,
              animation: `cbEmberRise ${dur}s linear ${delay}s infinite`,
              ["--cb-drift" as string]: `${drift}px`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* Steam puffs from bottom corners */}
      {Array.from({ length: 4 }).map((_, i) => {
        const left = i < 2 ? 8 + i * 6 : 92 - (i - 2) * 6;
        const dur = 7 + (i % 3);
        const delay = i * 1.4;
        const sx = i < 2 ? 30 + i * 20 : -(30 + (i - 2) * 20);
        return (
          <span
            key={`steam-${i}`}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: 12,
              width: 24, height: 24, borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,255,255,0.55), rgba(255,255,255,0))",
              filter: "blur(2px)",
              animation: `cbSteamPuff ${dur}s ease-in-out ${delay}s infinite`,
              ["--cb-sx" as string]: `${sx}px`,
            } as React.CSSProperties}
          />
        );
      })}

      {/* Vignette so foreground contrast stays readable */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(circle at 50% 50%, transparent 50%, rgba(0,0,0,0.45) 100%)",
        pointerEvents: "none",
      }} />
    </div>
  );
}

function Cog({
  size,
  top,
  left,
  colour,
  speed,
  reverse,
}: {
  size: number;
  top: number;
  left: number;
  colour: string;
  speed: string;
  reverse?: boolean;
}) {
  // 12-toothed cog drawn as an SVG so it scales crisply at any size.
  const teeth = 12;
  const r = size / 2;
  const inner = r * 0.7;
  const tooth = r * 1.05;
  const points: string[] = [];
  for (let i = 0; i < teeth * 2; i++) {
    const a = (i / (teeth * 2)) * Math.PI * 2;
    const rad = i % 2 === 0 ? tooth : inner;
    points.push(`${(r + Math.cos(a) * rad).toFixed(2)},${(r + Math.sin(a) * rad).toFixed(2)}`);
  }
  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width: size,
        height: size,
        opacity: 0.35,
        animation: `${reverse ? "cbCogSpinRev" : "cbCogSpin"} ${speed} linear infinite`,
        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.6))",
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <polygon points={points.join(" ")} fill={colour} stroke="#0b0f1a" strokeWidth={1} />
        <circle cx={r} cy={r} r={inner * 0.55} fill="#0b0f1a" />
        <circle cx={r} cy={r} r={inner * 0.25} fill={colour} />
        {/* spokes */}
        {[0, 60, 120].map((deg) => (
          <rect
            key={deg}
            x={r - 2}
            y={r - inner * 0.5}
            width={4}
            height={inner}
            fill="#0b0f1a"
            transform={`rotate(${deg} ${r} ${r})`}
          />
        ))}
      </svg>
    </div>
  );
}
