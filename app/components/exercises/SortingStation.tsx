"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import {
  correctAnswerBurst,
  wrongAnswerShake,
  badgeEarnedCelebration,
} from "@/app/lib/celebrations";
import { playSound } from "@/app/lib/sounds";

type SortItem = {
  text: string;
  category: string;
  explanation?: string;
};

type SortCategory = {
  id: string;
  label: string;
  color: string;
  icon?: string;
};

type SortingStationProps = {
  title?: string;
  instruction?: string;
  items: SortItem[];
  categories: SortCategory[];
  onComplete: (score: number, total: number) => void;
};

type Phase = "active" | "complete";
type BinFlash = { id: string; kind: "correct" | "wrong" } | null;

const STYLES = `
@keyframes ssScanSweep { 0% { transform: translateY(-10%); } 100% { transform: translateY(100%); } }
@keyframes ssScannerPop { 0% { transform: scale(0.9); opacity: 0; } 60% { transform: scale(1.04); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
@keyframes ssItemAccept { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(0.55); opacity: 0; } }
@keyframes ssBinPulseGood { 0%,100% { box-shadow: 0 0 0 rgba(52,211,153,0); } 50% { box-shadow: 0 0 22px rgba(52,211,153,0.65); } }
@keyframes ssBinPulseBad { 0%,100% { box-shadow: 0 0 0 rgba(239,68,68,0); transform: translateX(0); } 20% { transform: translateX(-8px); box-shadow: 0 0 20px rgba(239,68,68,0.55); } 40% { transform: translateX(8px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
@keyframes ssCheckPop { 0% { opacity: 0; transform: translate(-50%,-50%) scale(0.2); } 40% { opacity: 1; transform: translate(-50%,-50%) scale(1.1); } 100% { opacity: 0; transform: translate(-50%,-50%) scale(1); } }
@keyframes ssDotFill { from { transform: scale(0.4); opacity: 0.4; } to { transform: scale(1); opacity: 1; } }
@keyframes ssStreakIn { 0% { opacity: 0; transform: translateX(-50%) scale(0.6); } 100% { opacity: 1; transform: translateX(-50%) scale(1); } }
@keyframes ssBannerIn { from { opacity: 0; transform: translateY(-16px); } to { opacity: 1; transform: none; } }
@keyframes ssScannerShake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-6px); } 75% { transform: translateX(6px); } }
@keyframes ssExplanationIn { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 160px; } }
`;

let stylesInjected = false;
function ensureStyles() {
  if (typeof document === "undefined" || stylesInjected) return;
  const el = document.createElement("style");
  el.id = "ax-sorting-station-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

export default function SortingStation({
  title,
  instruction,
  items,
  categories,
  onComplete,
}: SortingStationProps) {
  const total = items.length;
  const [phase, setPhase] = useState<Phase>("active");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [hadMistake, setHadMistake] = useState(false);
  const [binFlash, setBinFlash] = useState<BinFlash>(null);
  const [itemFading, setItemFading] = useState(false);
  const [scannerShakeKey, setScannerShakeKey] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const advanceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completeFiredRef = useRef(false);
  const perfectCelebratedRef = useRef(false);

  useEffect(() => {
    ensureStyles();
  }, []);

  useEffect(() => {
    return () => {
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
      if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    };
  }, []);

  const current = items[currentIdx];

  const triggerBinFlash = useCallback((id: string, kind: "correct" | "wrong") => {
    setBinFlash({ id, kind });
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setBinFlash(null), 650);
  }, []);

  const handleSort = useCallback(
    (categoryId: string) => {
      if (!current || itemFading || phase !== "active") return;
      const isCorrect = categoryId === current.category;

      if (isCorrect) {
        triggerBinFlash(categoryId, "correct");
        playSound("pour");
        playSound("sortCorrect");
        void correctAnswerBurst();
        setItemFading(true);
        const nextStreak = hadMistake ? streak : streak + 1;
        if (!hadMistake) {
          setScore((s) => s + 1);
          setStreak((s) => s + 1);
        }
        if (nextStreak === 3) playSound("streak3");
        else if (nextStreak === 5) playSound("streak5");
        else if (nextStreak >= 7 && nextStreak % 2 === 1) playSound("streak7");
        if (current.explanation) setShowExplanation(true);

        if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
        advanceTimerRef.current = setTimeout(() => {
          const nextIdx = currentIdx + 1;
          setItemFading(false);
          setHadMistake(false);
          setShowExplanation(false);
          if (nextIdx >= total) {
            setPhase("complete");
            if (!completeFiredRef.current) {
              completeFiredRef.current = true;
              const finalScore = hadMistake ? score : score + 1;
              onComplete(finalScore, total);
              if (!perfectCelebratedRef.current && finalScore / total > 0.8) {
                perfectCelebratedRef.current = true;
                playSound("confetti");
                playSound("badgeEarned");
                void badgeEarnedCelebration();
              }
            }
          } else {
            setCurrentIdx(nextIdx);
          }
        }, 900);
      } else {
        triggerBinFlash(categoryId, "wrong");
        playSound("sortWrong");
        wrongAnswerShake();
        setHadMistake(true);
        setStreak(0);
        setScannerShakeKey((k) => k + 1);
      }
    },
    [current, itemFading, phase, hadMistake, currentIdx, total, score, streak, onComplete, triggerBinFlash],
  );

  // Layout: row for up to 3 categories, 2x2 grid for 4+
  const useGridLayout = categories.length > 3;

  const binsStyle: CSSProperties = useGridLayout
    ? {
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: 14,
      }
    : {
        display: "grid",
        gridTemplateColumns: `repeat(${categories.length}, 1fr)`,
        gap: 14,
      };

  return (
    <div
      style={{
        maxWidth: 820,
        margin: "0 auto",
        background: "#0d1220",
        border: "1px solid rgba(96,165,250,0.14)",
        borderRadius: 24,
        padding: "28px 24px 32px",
        color: "#f1f5f9",
        fontFamily: "'Nunito', sans-serif",
        position: "relative",
        boxShadow: "0 12px 36px rgba(0,0,0,0.4)",
        overflow: "hidden",
      }}
    >
      {title && (
        <h2
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 24,
            letterSpacing: "-0.02em",
            textAlign: "center",
            margin: "0 0 6px",
          }}
        >
          {title}
        </h2>
      )}
      {instruction && (
        <p style={{ textAlign: "center", color: "#94a3b8", fontSize: 14, margin: "0 0 22px" }}>
          {instruction}
        </p>
      )}

      {phase === "active" ? (
        <ActiveStage
          current={current}
          currentIdx={currentIdx}
          total={total}
          score={score}
          streak={streak}
          categories={categories}
          binsStyle={binsStyle}
          binFlash={binFlash}
          itemFading={itemFading}
          scannerShakeKey={scannerShakeKey}
          showExplanation={showExplanation}
          onSort={handleSort}
        />
      ) : (
        <CompletionStage score={score} total={total} />
      )}
    </div>
  );
}

/* ─────────────────── Active stage ─────────────────── */
function ActiveStage({
  current,
  currentIdx,
  total,
  score,
  streak,
  categories,
  binsStyle,
  binFlash,
  itemFading,
  scannerShakeKey,
  showExplanation,
  onSort,
}: {
  current: SortItem | undefined;
  currentIdx: number;
  total: number;
  score: number;
  streak: number;
  categories: SortCategory[];
  binsStyle: CSSProperties;
  binFlash: BinFlash;
  itemFading: boolean;
  scannerShakeKey: number;
  showExplanation: boolean;
  onSort: (categoryId: string) => void;
}) {
  // Void reference so we can use `score` for the completion threshold without eslint flagging it.
  void score;

  return (
    <>
      {/* Streak badge — top-right so it never clips the title. */}
      {streak >= 3 && (
        <div
          key={`streak-${streak}`}
          style={{
            position: "absolute",
            top: 12,
            right: 16,
            background: "linear-gradient(135deg, #f59e0b, #f97316)",
            color: "#fff",
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 13,
            letterSpacing: "0.03em",
            padding: "5px 14px",
            borderRadius: 999,
            boxShadow: "0 0 20px rgba(245,158,11,0.55), 0 4px 14px rgba(0,0,0,0.3)",
            animation: "ssStreakIn 0.35s cubic-bezier(0.2,1.5,0.4,1) both",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          🔥 x{streak}
        </div>
      )}

      {/* ITEM counter */}
      <div
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 12,
          color: "#60a5fa",
          letterSpacing: "0.15em",
          textAlign: "center",
          marginBottom: 10,
        }}
      >
        ITEM {Math.min(currentIdx + 1, total)}/{total}
      </div>

      {/* Scanner platform */}
      <div
        key={`scanner-${currentIdx}-${scannerShakeKey}`}
        style={{
          position: "relative",
          maxWidth: 400,
          margin: "0 auto 14px",
          background: "#0c1019",
          border: "2px solid rgba(96,165,250,0.2)",
          borderRadius: 20,
          padding: 24,
          boxShadow: "0 0 30px rgba(96,165,250,0.08)",
          overflow: "hidden",
          animation:
            scannerShakeKey > 0
              ? "ssScannerShake 0.3s ease, ssScannerPop 0.4s cubic-bezier(0.2,1.5,0.4,1)"
              : "ssScannerPop 0.4s cubic-bezier(0.2,1.5,0.4,1) both",
          willChange: "transform, opacity",
        }}
      >
        {/* Scanning sweep line */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.45), transparent)",
            opacity: 0.4,
            animation: "ssScanSweep 2s linear infinite",
            willChange: "transform",
          }}
        />

        {/* Item text */}
        <div
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 20,
            letterSpacing: "-0.01em",
            textAlign: "center",
            color: "#f1f5f9",
            minHeight: 28,
            animation: itemFading ? "ssItemAccept 0.45s ease-out forwards" : undefined,
            willChange: "transform, opacity",
          }}
        >
          {current?.text ?? ""}
        </div>
      </div>

      {/* Progress dots */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 6,
          marginBottom: 22,
        }}
      >
        {Array.from({ length: total }, (_, i) => {
          const done = i < currentIdx || (i === currentIdx && itemFading);
          return (
            <div
              key={i}
              style={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: done ? "#34d399" : "rgba(255,255,255,0.08)",
                boxShadow: done ? "0 0 8px rgba(52,211,153,0.5)" : "none",
                transition: "background 0.4s, box-shadow 0.4s",
                animation: done ? "ssDotFill 0.4s cubic-bezier(0.2,1.5,0.4,1)" : undefined,
              }}
            />
          );
        })}
      </div>

      {/* Bins */}
      <div style={binsStyle}>
        {categories.map((cat) => (
          <BinCard
            key={cat.id}
            category={cat}
            flash={binFlash && binFlash.id === cat.id ? binFlash.kind : null}
            onClick={() => onSort(cat.id)}
          />
        ))}
      </div>

      {/* Inline explanation (only if current item has one and the answer was correct) */}
      {showExplanation && current?.explanation && (
        <div
          style={{
            marginTop: 18,
            background: "rgba(52,211,153,0.08)",
            border: "1px solid rgba(52,211,153,0.25)",
            borderRadius: 12,
            padding: "12px 16px",
            overflow: "hidden",
            animation: "ssExplanationIn 0.4s cubic-bezier(0.16,1,0.3,1) both",
            fontSize: 13,
            color: "#cbd5e1",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "#34d399", fontWeight: 700 }}>Nice sort — </strong>
          {current.explanation}
        </div>
      )}
    </>
  );
}

function BinCard({
  category,
  flash,
  onClick,
}: {
  category: SortCategory;
  flash: "correct" | "wrong" | null;
  onClick: () => void;
}) {
  const [hover, setHover] = useState(false);
  const solidBorder = hover || flash !== null;
  const flashColor = flash === "correct" ? "#34d399" : flash === "wrong" ? "#ef4444" : category.color;
  const border = flash
    ? `2px solid ${flashColor}`
    : solidBorder
      ? `2px solid ${category.color}`
      : `2px dashed ${category.color}55`;
  const bg = flash === "correct"
    ? "rgba(52,211,153,0.1)"
    : flash === "wrong"
      ? "rgba(239,68,68,0.1)"
      : hover
        ? `${category.color}10`
        : "#111827";
  const boxShadow = flash === "correct"
    ? "0 0 22px rgba(52,211,153,0.55)"
    : flash === "wrong"
      ? "0 0 20px rgba(239,68,68,0.55)"
      : hover
        ? `0 6px 24px rgba(0,0,0,0.3), 0 0 18px ${category.color}44`
        : "0 2px 8px rgba(0,0,0,0.25)";
  const animation = flash === "correct"
    ? "ssBinPulseGood 0.6s ease-out"
    : flash === "wrong"
      ? "ssBinPulseBad 0.5s ease-out"
      : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: "relative",
        minHeight: 80,
        borderRadius: 16,
        padding: 20,
        background: bg,
        border,
        color: category.color,
        fontFamily: "'Fredoka', 'Nunito', sans-serif",
        fontWeight: 700,
        fontSize: 14,
        cursor: "pointer",
        transition: "background 0.25s, border-color 0.25s, transform 0.2s, box-shadow 0.25s",
        boxShadow,
        transform: hover ? "scale(1.03)" : "scale(1)",
        animation,
        willChange: "transform, box-shadow",
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        {category.icon && (
          <span style={{ fontSize: 24, lineHeight: 1 }} aria-hidden>
            {category.icon}
          </span>
        )}
        <span style={{ fontSize: 14, letterSpacing: "0.02em" }}>{category.label}</span>
      </div>

      {/* Check overlay for correct flashes */}
      {flash === "correct" && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            fontSize: 48,
            color: "#34d399",
            textShadow: "0 0 14px rgba(52,211,153,0.7)",
            animation: "ssCheckPop 0.6s cubic-bezier(0.16,1,0.3,1) both",
            pointerEvents: "none",
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

/* ─────────────────── Completion stage ─────────────────── */
function CompletionStage({ score, total }: { score: number; total: number }) {
  const pct = total === 0 ? 0 : score / total;
  const perfect = pct > 0.8;
  return (
    <div style={{ textAlign: "center", padding: "28px 8px 8px", position: "relative" }}>
      <div
        style={{
          display: "inline-block",
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 24,
          padding: "10px 22px",
          borderRadius: 999,
          background: "rgba(52,211,153,0.14)",
          border: "1px solid rgba(52,211,153,0.35)",
          color: "#34d399",
          letterSpacing: "-0.01em",
          animation: "ssBannerIn 0.5s cubic-bezier(0.16,1,0.3,1) both",
          boxShadow: "0 0 24px rgba(52,211,153,0.35)",
          marginBottom: 18,
        }}
      >
        ✨ SORTED!
      </div>
      <h3
        style={{
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 22,
          margin: "0 0 8px",
          background: perfect
            ? "linear-gradient(135deg, #f59e0b, #34d399)"
            : "linear-gradient(135deg, #60a5fa, #34d399)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        {score}/{total} sorted correctly!
      </h3>
      {perfect && (
        <p style={{ color: "#94a3b8", fontSize: 14, margin: "0 0 18px" }}>
          Amazing work, sorting champion.
        </p>
      )}
      <button
        type="button"
        onClick={() => {
          /* parent drives continuation via onComplete; keep as-is */
        }}
        style={{
          padding: "12px 28px",
          borderRadius: 999,
          border: "none",
          background: "linear-gradient(135deg, #f97316, #f59e0b)",
          color: "#fff",
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          boxShadow: "0 6px 20px rgba(249,115,22,0.4)",
          letterSpacing: "0.01em",
        }}
      >
        Continue →
      </button>
    </div>
  );
}

export type { SortingStationProps, SortItem, SortCategory };
