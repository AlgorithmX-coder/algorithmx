"use client";

import { CSSProperties, useCallback, useEffect, useRef, useState } from "react";
import {
  correctAnswerBurst,
  wrongAnswerShake,
  badgeEarnedCelebration,
} from "@/app/lib/celebrations";
import { playSound } from "@/app/lib/sounds";

type EvaluateItem = {
  text: string;
  isStrong: boolean;
  explanation?: string;
};

type CreateComponent = {
  text: string;
  isGood: boolean;
};

type VaultLockProps = {
  title?: string;
  mode: "evaluate" | "create";
  items?: EvaluateItem[];
  components?: CreateComponent[];
  onComplete: (score: number, total: number) => void;
};

type Phase = "intro" | "active" | "feedback" | "complete" | "helping-adam";

const STYLES = `
@keyframes vaultSpin { to { transform: rotate(360deg); } }
@keyframes vaultRingPulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }
@keyframes vaultTerminalFlashGood { 0% { background: #0c1019; } 40% { background: rgba(168,227,187,0.15); } 100% { background: #0c1019; } }
@keyframes vaultTerminalFlashBad {  0% { background: #0c1019; } 40% { background: rgba(239,68,68,0.2);  } 100% { background: #0c1019; } }
@keyframes vaultShakeX { 0%,100% { transform: translateX(0); } 20% { transform: translateX(-8px); } 40% { transform: translateX(8px); } 60% { transform: translateX(-4px); } 80% { transform: translateX(4px); } }
@keyframes vaultType { from { max-width: 0; } to { max-width: 100%; } }
@keyframes vaultSlideDown { from { opacity: 0; max-height: 0; transform: translateY(-8px); } to { opacity: 1; max-height: 240px; transform: none; } }
@keyframes vaultLockSwap { 0% { transform: rotate(0) scale(1); } 40% { transform: rotate(-20deg) scale(0.6); } 100% { transform: rotate(0) scale(1); } }
@keyframes vaultIntroPulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
@keyframes vaultCompleteGlow { 0%,100% { box-shadow: 0 0 24px rgba(245,158,11,0.35), 0 0 60px rgba(245,158,11,0.2); } 50% { box-shadow: 0 0 44px rgba(245,158,11,0.65), 0 0 100px rgba(245,158,11,0.4); } }
@keyframes vaultCardPop { 0% { opacity: 0; transform: translateY(6px) scale(0.96); } 100% { opacity: 1; transform: none; } }
`;

let stylesInjected = false;
function ensureStyles() {
  if (typeof document === "undefined" || stylesInjected) return;
  const el = document.createElement("style");
  el.id = "ax-vault-lock-keyframes";
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

function LockIcon({ size = 40, color = "#fff" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 1 1 8 0v4" />
    </svg>
  );
}

function UnlockIcon({ size = 40, color = "#7eff97" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="4" y="11" width="16" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 7-2" />
    </svg>
  );
}

const SEGMENT_COLORS = ["#00e5ff", "#7eff97", "#f97316", "#f59e0b"];

function VaultDoor({
  securityLevel,
  phase,
  pulseKey,
  totalSegments = 4,
}: {
  securityLevel: number;
  phase: Phase;
  pulseKey: number;
  totalSegments?: number;
}) {
  const completed = phase === "complete";

  const status =
    phase === "complete"
      ? { text: "VAULT OPENED 🔓", color: "#7eff97", bg: "rgba(168,227,187,0.12)" }
      : phase === "intro"
        ? { text: "LOCKED 🔒", color: "#ef4444", bg: "rgba(239,68,68,0.12)" }
        : { text: "UNLOCKING…", color: "#f97316", bg: "rgba(249,115,22,0.12)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18, marginBottom: 24 }}>
      <span
        style={{
          fontFamily: "'JetBrains Mono', 'Nunito', monospace",
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: "0.2em",
          padding: "5px 14px",
          borderRadius: 999,
          background: status.bg,
          color: status.color,
          border: `1px solid ${status.color}55`,
        }}
      >
        {status.text}
      </span>

      <div
        key={`vault-${pulseKey}-${completed ? "c" : "o"}`}
        style={{
          position: "relative",
          width: 160,
          height: 160,
          animation: pulseKey > 0 ? "vaultRingPulse 0.6s ease-out" : undefined,
        }}
      >
        {/* Rotating conic ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, #00e5ff, #7eff97, #f97316, #f59e0b, #00e5ff)",
            animation: "vaultSpin 8s linear infinite",
            willChange: "transform",
          }}
          aria-hidden
        />
        {/* Static inner circle */}
        <div
          style={{
            position: "absolute",
            inset: 3,
            borderRadius: "50%",
            background: "#0a0e1a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: completed
              ? "inset 0 0 20px rgba(168,227,187,0.25)"
              : "inset 0 0 18px rgba(0,0,0,0.5)",
            animation: completed ? "vaultCompleteGlow 2.2s ease-in-out infinite" : undefined,
          }}
        >
          <span
            key={`lock-${completed ? "u" : "l"}`}
            style={{
              display: "inline-flex",
              animation: completed ? "vaultLockSwap 0.8s ease-out both" : undefined,
            }}
          >
            {completed ? <UnlockIcon size={40} color="#7eff97" /> : <LockIcon size={40} color="#fff" />}
          </span>
        </div>
      </div>

      {/* Security level segments */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${totalSegments}, 1fr)`,
          gap: 6,
          width: 240,
        }}
      >
        {Array.from({ length: totalSegments }, (_, i) => {
          const filled = i < securityLevel;
          const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];
          return (
            <div
              key={i}
              style={{
                height: 8,
                borderRadius: 999,
                background: filled ? color : "rgba(255,255,255,0.06)",
                border: filled ? "none" : "1px solid rgba(255,255,255,0.04)",
                boxShadow: filled ? `0 0 10px ${color}66` : "none",
                transition: "background 0.5s, box-shadow 0.5s",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────────── Evaluate mode panel ─────────────────── */
function EvaluatePanel({
  items,
  onFinish,
  registerTick,
}: {
  items: EvaluateItem[];
  onFinish: (score: number, total: number) => void;
  registerTick: (correct: boolean) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<"strong" | "weak" | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const scoreRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const current = items[idx];
  const isLast = idx >= items.length - 1;

  const answer = useCallback(
    (choice: "strong" | "weak") => {
      if (selected || !current) return;
      const correct = (choice === "strong") === current.isStrong;
      setSelected(choice);
      setShowFeedback(true);
      playSound("lock");

      if (correct) {
        scoreRef.current += 1;
        playSound("correct");
        void correctAnswerBurst();
        registerTick(true);
      } else {
        playSound("wrong");
        wrongAnswerShake();
        registerTick(false);
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (isLast) {
          onFinish(scoreRef.current, items.length);
          return;
        }
        setSelected(null);
        setShowFeedback(false);
        setIdx((i) => i + 1);
      }, 1800);
    },
    [current, selected, isLast, items.length, onFinish, registerTick],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!current) return null;

  const correctChoice = current.isStrong ? "strong" : "weak";
  const isCorrect = selected !== null && selected === correctChoice;

  const flashAnim =
    showFeedback && isCorrect
      ? "vaultTerminalFlashGood 0.8s ease-out"
      : showFeedback && !isCorrect
        ? "vaultTerminalFlashBad 0.8s ease-out, vaultShakeX 0.3s ease"
        : undefined;

  return (
    <>
      <div style={{ fontSize: 12, color: "#64748b", letterSpacing: "0.1em", textAlign: "center", marginBottom: 10 }}>
        PASSWORD {idx + 1} / {items.length}
      </div>

      {/* Terminal display */}
      <div
        style={{
          background: "#0c1019",
          border: "1px solid rgba(0,229,255,0.12)",
          borderRadius: 14,
          padding: 20,
          textAlign: "center",
          animation: flashAnim,
          willChange: "background, transform",
        }}
      >
        <span
          key={`typed-${idx}`}
          style={{
            display: "inline-block",
            maxWidth: "100%",
            overflow: "hidden",
            whiteSpace: "nowrap",
            fontFamily: "'JetBrains Mono', 'Courier New', monospace",
            fontSize: 20,
            color: "#7eff97",
            letterSpacing: "0.02em",
            animation: "vaultType 0.9s steps(30, end) both",
            willChange: "max-width",
          }}
        >
          {current.text}
        </span>
      </div>

      {/* Answer buttons */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 18 }}>
        <AnswerButton
          label="🛡️ STRONG"
          tone="good"
          disabled={selected !== null}
          selected={selected === "strong"}
          selectedIsCorrect={selected === "strong" && isCorrect}
          selectedIsWrong={selected === "strong" && !isCorrect}
          onClick={() => answer("strong")}
        />
        <AnswerButton
          label="⚠️ WEAK"
          tone="bad"
          disabled={selected !== null}
          selected={selected === "weak"}
          selectedIsCorrect={selected === "weak" && isCorrect}
          selectedIsWrong={selected === "weak" && !isCorrect}
          onClick={() => answer("weak")}
        />
      </div>

      {/* Explanation */}
      {showFeedback && (
        <div
          style={{
            marginTop: 16,
            overflow: "hidden",
            background: isCorrect ? "rgba(168,227,187,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${isCorrect ? "rgba(168,227,187,0.3)" : "rgba(239,68,68,0.3)"}`,
            borderRadius: 12,
            padding: "14px 18px",
            animation: "vaultSlideDown 0.45s cubic-bezier(0.16,1,0.3,1) both",
          }}
        >
          <div
            style={{
              fontFamily: "'Fredoka', 'Nunito', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: isCorrect ? "#7eff97" : "#fca5a5",
              marginBottom: 4,
            }}
          >
            {isCorrect ? "Correct!" : "Not quite."}
          </div>
          {current.explanation && (
            <div style={{ fontSize: 14, color: "#cbd5e1", lineHeight: 1.55 }}>
              {current.explanation}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function AnswerButton({
  label,
  tone,
  disabled,
  selected,
  selectedIsCorrect,
  selectedIsWrong,
  onClick,
}: {
  label: string;
  tone: "good" | "bad";
  disabled: boolean;
  selected: boolean;
  selectedIsCorrect: boolean;
  selectedIsWrong: boolean;
  onClick: () => void;
}) {
  const accent = tone === "good" ? "#7eff97" : "#ef4444";
  const glow = tone === "good" ? "rgba(168,227,187,0.4)" : "rgba(239,68,68,0.4)";
  const [hover, setHover] = useState(false);

  const border = selectedIsCorrect
    ? "#7eff97"
    : selectedIsWrong
      ? "#ef4444"
      : hover && !disabled
        ? accent
        : "rgba(255,255,255,0.1)";

  const shadow = selected
    ? `0 0 20px ${selectedIsCorrect ? "rgba(168,227,187,0.5)" : "rgba(239,68,68,0.5)"}`
    : hover && !disabled
      ? `0 0 16px ${glow}`
      : "none";

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        minHeight: 60,
        borderRadius: 14,
        background: "#111827",
        border: `2px solid ${border}`,
        color: "#f1f5f9",
        fontFamily: "'Fredoka', 'Nunito', sans-serif",
        fontWeight: 700,
        fontSize: 16,
        cursor: disabled ? "default" : "pointer",
        transition: "border-color 0.25s, box-shadow 0.25s, transform 0.2s",
        boxShadow: shadow,
        opacity: disabled && !selected ? 0.4 : 1,
        transform: hover && !disabled ? "translateY(-2px)" : "none",
        animation: selectedIsWrong ? "vaultShakeX 0.3s ease" : undefined,
      }}
    >
      {label}
    </button>
  );
}

/* ─────────────────── Create mode panel ─────────────────── */
function CreatePanel({
  components,
  onFinish,
  registerTick,
}: {
  components: CreateComponent[];
  onFinish: (score: number, total: number) => void;
  registerTick: (correct: boolean) => void;
}) {
  const total = components.length;
  const goodCount = components.filter((c) => c.isGood).length || 1;
  const [picked, setPicked] = useState<number[]>([]);
  const [lastFeedback, setLastFeedback] = useState<"good" | "bad" | null>(null);
  const [completed, setCompleted] = useState(false);
  const finishRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goodsPicked = picked.filter((i) => components[i]?.isGood).length;
  const strength = Math.min(100, Math.round((goodsPicked / goodCount) * 100));
  const strengthColor =
    strength >= 75 ? "#7eff97" : strength >= 40 ? "#f59e0b" : "#ef4444";

  const pick = useCallback(
    (i: number) => {
      if (completed || picked.includes(i)) return;
      const c = components[i];
      if (!c) return;

      setPicked((p) => [...p, i]);

      if (c.isGood) {
        playSound("correct");
        void correctAnswerBurst();
        setLastFeedback("good");
        registerTick(true);
      } else {
        playSound("wrong");
        wrongAnswerShake();
        setLastFeedback("bad");
        registerTick(false);
      }

      // Clear feedback indicator after a moment
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setLastFeedback(null), 900);

      // Check if all good components are now picked
      const allGoodPicked =
        components
          .map((cc, idx) => ({ cc, idx }))
          .filter((x) => x.cc.isGood)
          .every((x) => [...picked, i].includes(x.idx));

      if (allGoodPicked && !finishRef.current) {
        finishRef.current = true;
        const score = [...picked, i].filter((j) => components[j]?.isGood).length;
        window.setTimeout(() => {
          setCompleted(true);
          onFinish(score, total);
        }, 900);
      }
    },
    [completed, picked, components, onFinish, total, registerTick],
  );

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const builtPassword =
    picked
      .map((i) => components[i]?.text || "")
      .filter(Boolean)
      .join(" · ") || " ";

  return (
    <>
      <div style={{ fontSize: 12, color: "#64748b", letterSpacing: "0.1em", textAlign: "center", marginBottom: 10 }}>
        TAP THE SAFE COMPONENTS
      </div>

      {/* Target zone */}
      <div
        style={{
          minHeight: 60,
          border: `2px dashed ${lastFeedback === "good" ? "#7eff97" : lastFeedback === "bad" ? "#ef4444" : "rgba(0,229,255,0.3)"}`,
          background: "rgba(0,229,255,0.04)",
          borderRadius: 14,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          color: picked.length === 0 ? "#64748b" : "#f1f5f9",
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: 16,
          transition: "border-color 0.3s",
          animation: lastFeedback === "bad" ? "vaultShakeX 0.3s ease" : undefined,
        }}
      >
        {picked.length === 0 ? "Build your password…" : builtPassword}
      </div>

      {/* Strength meter - 5-segment power gauge */}
      <div style={{ marginTop: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, color: "rgba(125,240,255,0.55)", letterSpacing: "0.08em", marginBottom: 6 }}>
          <span>STRENGTH</span>
          <span style={{ color: strengthColor }}>{strength}%</span>
        </div>
        <div style={{ display: "flex", gap: 6, height: 16 }}>
          {(() => {
            // 5 segments - each segment lights up as strength crosses its threshold.
            const segColours = ["#ef4444", "#f97316", "#fbbf24", "#84cc16", "#7eff97"];
            const filled = Math.min(5, Math.ceil((strength / 100) * 5));
            return segColours.map((c, i) => {
              const on = i < filled;
              return (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    borderRadius: 4,
                    border: `1px solid ${on ? c : "rgba(255,255,255,0.08)"}`,
                    background: on
                      ? `linear-gradient(180deg, ${c}, ${c}88)`
                      : "rgba(255,255,255,0.04)",
                    boxShadow: on
                      ? `0 0 12px ${c}cc, inset 0 0 8px ${c}44`
                      : "inset 0 1px 2px rgba(0,0,0,0.4)",
                    transition: "background 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease",
                    animation: on ? `vaultSegPulse${i} 1.6s ease-in-out infinite` : undefined,
                  }}
                />
              );
            });
          })()}
        </div>
        <style>{`
          @keyframes vaultSegPulse0 { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.2); } }
          @keyframes vaultSegPulse1 { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.25); } }
          @keyframes vaultSegPulse2 { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.3); } }
          @keyframes vaultSegPulse3 { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.35); } }
          @keyframes vaultSegPulse4 { 0%,100% { filter: brightness(1); } 50% { filter: brightness(1.4); } }
        `}</style>
      </div>

      {/* Component grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        {components.map((c, i) => {
          const isPicked = picked.includes(i);
          const wasBad = isPicked && !c.isGood;
          const wasGood = isPicked && c.isGood;
          return (
            <ComponentCard
              key={i}
              label={c.text}
              disabled={isPicked || completed}
              highlight={wasGood ? "good" : wasBad ? "bad" : "neutral"}
              onClick={() => pick(i)}
              enterDelay={i * 60}
            />
          );
        })}
      </div>
    </>
  );
}

function ComponentCard({
  label,
  disabled,
  highlight,
  onClick,
  enterDelay = 0,
}: {
  label: string;
  disabled: boolean;
  highlight: "good" | "bad" | "neutral";
  onClick: () => void;
  enterDelay?: number;
}) {
  const [hover, setHover] = useState(false);
  const accent =
    highlight === "good" ? "#7eff97" : highlight === "bad" ? "#ef4444" : "#00e5ff";
  const border =
    highlight === "good"
      ? "#7eff97"
      : highlight === "bad"
        ? "#ef4444"
        : hover && !disabled
          ? "rgba(0,229,255,0.45)"
          : "rgba(255,255,255,0.08)";
  const bg =
    highlight === "good"
      ? "rgba(168,227,187,0.08)"
      : highlight === "bad"
        ? "rgba(239,68,68,0.08)"
        : "#111827";
  const style: CSSProperties = {
    background: bg,
    border: `1px solid ${border}`,
    borderRadius: 12,
    padding: "14px 16px",
    cursor: disabled ? "default" : "pointer",
    color: "#f1f5f9",
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
    fontSize: 14,
    fontWeight: 600,
    textAlign: "left",
    transition: "border-color 0.25s, background 0.25s, transform 0.2s, box-shadow 0.25s",
    transform: hover && !disabled ? "translateY(-2px)" : "none",
    boxShadow: hover && !disabled ? `0 4px 14px rgba(0,0,0,0.3), 0 0 12px ${accent}33` : "none",
    opacity: disabled && highlight === "neutral" ? 0.5 : 1,
    animation: `vaultCardPop 0.35s cubic-bezier(0.16,1,0.3,1) ${enterDelay}ms both`,
  };
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
    >
      {label}
    </button>
  );
}

/* ─────────────────── Main export ─────────────────── */
export default function VaultLock({
  title,
  mode,
  items,
  components,
  onComplete,
}: VaultLockProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [securityLevel, setSecurityLevel] = useState(0);
  const [pulseKey, setPulseKey] = useState(0);
  const badgeFiredRef = useRef(false);

  useEffect(() => {
    ensureStyles();
  }, []);

  // Intro → active after 1.2s
  useEffect(() => {
    if (phase !== "intro") return;
    const t = setTimeout(() => setPhase("active"), 1200);
    return () => clearTimeout(t);
  }, [phase]);

  // Trigger celebration on completion
  useEffect(() => {
    if (phase !== "complete" || badgeFiredRef.current) return;
    badgeFiredRef.current = true;
    playSound("confetti");
    playSound("badgeEarned");
    void badgeEarnedCelebration();
  }, [phase]);

  const total =
    mode === "evaluate"
      ? items?.length ?? 0
      : components?.filter((c) => c.isGood).length ?? 0;
  const totalSegments = Math.max(4, Math.min(total || 4, 8));

  const registerTick = useCallback(
    (correct: boolean) => {
      if (correct) {
        setSecurityLevel((s) => Math.min(totalSegments, s + 1));
        setPulseKey((k) => k + 1);
      }
    },
    [totalSegments],
  );

  // Stash the Phase A result so we can pass it through after the
  // Phase B (Adam Forgot) mini-game.
  const [phaseAResult, setPhaseAResult] = useState<{ score: number; total: number } | null>(null);
  const finish = useCallback(
    (score: number, t: number) => {
      setPhase("complete");
      setSecurityLevel(totalSegments);
      setPhaseAResult({ score, total: t });
      // Brief celebration on Phase A then drop into the Phase B
      // "Adam forgot his password" mini-game.
      window.setTimeout(() => setPhase("helping-adam"), 1600);
    },
    [totalSegments],
  );

  const canRenderEvaluate = mode === "evaluate" && items && items.length > 0;
  const canRenderCreate =
    mode === "create" && components && components.length > 0;

  return (
    <div
      style={{
        maxWidth: 800,
        margin: "0 auto",
        background: "#0d1220",
        border: "1px solid rgba(0,229,255,0.12)",
        borderRadius: 24,
        padding: "28px 24px",
        color: "#f1f5f9",
        fontFamily: "'Nunito', sans-serif",
        boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {title && (
        <h2
          style={{
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 26,
            letterSpacing: "-0.02em",
            textAlign: "center",
            margin: "0 0 20px",
          }}
        >
          {title}
        </h2>
      )}

      <VaultDoor
        securityLevel={securityLevel}
        phase={phase}
        pulseKey={pulseKey}
        totalSegments={totalSegments}
      />

      {phase === "intro" ? (
        <div
          style={{
            textAlign: "center",
            padding: "10px 0",
            color: "rgba(125,240,255,0.55)",
            fontSize: 14,
            animation: "vaultIntroPulse 1.2s ease-in-out infinite",
          }}
        >
          Initialising vault…
        </div>
      ) : phase === "complete" ? (
        <CompletePanel
          title={mode === "evaluate" ? "Vault Secured!" : "Strong Password Built!"}
        />
      ) : phase === "helping-adam" ? (
        <AdamForgotPanel
          onFinish={() => {
            if (phaseAResult) {
              onComplete(phaseAResult.score, phaseAResult.total);
            }
          }}
        />
      ) : canRenderEvaluate ? (
        <EvaluatePanel items={items!} onFinish={finish} registerTick={registerTick} />
      ) : canRenderCreate ? (
        <CreatePanel
          components={components!}
          onFinish={finish}
          registerTick={registerTick}
        />
      ) : (
        <div style={{ textAlign: "center", color: "rgba(125,240,255,0.55)", fontSize: 14 }}>
          No exercise data supplied.
        </div>
      )}
    </div>
  );
}

function CompletePanel({ title }: { title: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "12px 0 6px",
        animation: "vaultCardPop 0.5s cubic-bezier(0.16,1,0.3,1) both",
      }}
    >
      <h3
        style={{
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 26,
          margin: "0 0 6px",
          background: "linear-gradient(135deg, #7eff97, #f59e0b)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        🔓 {title}
      </h3>
      <p style={{ color: "rgba(125,240,255,0.55)", fontSize: 14, margin: 0 }}>
        All security segments activated.
      </p>
    </div>
  );
}

type ForgotHint = {
  id: string;
  emoji: string;
  label: string;
  safe: boolean;
  reason: string;
};

const FORGOT_HINTS: ForgotHint[] = [
  { id: "pet", emoji: "🐶", label: "Pet's name + a number", safe: true, reason: "Only Adam's family knows his pet - perfect clue!" },
  { id: "food", emoji: "🍕", label: "Favourite food", safe: true, reason: "Nice - most people don't know exactly what Adam loves to eat." },
  { id: "colour", emoji: "🎨", label: "Favourite colour", safe: true, reason: "Personal taste - only Adam truly knows!" },
  { id: "bday", emoji: "🎂", label: "Adam's birthday", safe: false, reason: "Friends and family ALL know birthdays - it's an easy guess for the Raccoon!" },
  { id: "addr", emoji: "🏠", label: "Home address", safe: false, reason: "Addresses are on letters and parcels - strangers can find them. Never a hint!" },
];

function AdamForgotPanel({ onFinish }: { onFinish: () => void }) {
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ id: string; ok: boolean; reason: string } | null>(null);

  const safeCount = FORGOT_HINTS.filter((h) => h.safe && picked.has(h.id)).length;
  const ready = safeCount >= 3;

  const tap = useCallback((h: ForgotHint) => {
    if (picked.has(h.id)) return;
    setFeedback({ id: h.id, ok: h.safe, reason: h.reason });
    if (h.safe) {
      setPicked((prev) => {
        const next = new Set(prev);
        next.add(h.id);
        return next;
      });
      try { correctAnswerBurst(); } catch {}
      try { playSound("xpGain"); } catch {}
    } else {
      setShake(h.id);
      try { wrongAnswerShake(); } catch {}
      try { playSound("error"); } catch {}
      window.setTimeout(() => setShake(null), 500);
    }
  }, [picked]);

  const handleContinue = useCallback(() => {
    if (!ready) return;
    try { badgeEarnedCelebration(); } catch {}
    onFinish();
  }, [ready, onFinish]);

  return (
    <div style={{ animation: "vaultCardPop 0.5s cubic-bezier(0.16,1,0.3,1) both", padding: "6px 0 4px" }}>
      <h3
        style={{
          fontFamily: "'Fredoka', 'Nunito', sans-serif",
          fontWeight: 700,
          fontSize: 22,
          margin: "0 0 4px",
          textAlign: "center",
          background: "linear-gradient(135deg, #00e5ff, #7eff97)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        🦝 Adam Forgot His Password!
      </h3>
      <p
        style={{
          color: "rgba(125,240,255,0.7)",
          fontSize: 13,
          margin: "0 0 14px",
          textAlign: "center",
        }}
      >
        Pick 3 SAFE hints - clues only Adam would know. Skip ones the Raccoon could guess!
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 10,
        }}
      >
        {FORGOT_HINTS.map((h) => {
          const isPicked = picked.has(h.id);
          const isShaking = shake === h.id;
          return (
            <button
              key={h.id}
              onClick={() => tap(h)}
              disabled={isPicked}
              style={{
                padding: "12px 10px",
                borderRadius: 14,
                border: isPicked
                  ? "2px solid #7eff97"
                  : "1px solid rgba(0,229,255,0.25)",
                background: isPicked
                  ? "rgba(126,255,151,0.12)"
                  : "rgba(15,21,48,0.6)",
                color: "#e7ecff",
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 600,
                fontSize: 13,
                textAlign: "center",
                cursor: isPicked ? "default" : "pointer",
                transition: "all 0.2s ease",
                animation: isShaking ? "vaultShakeX 0.4s" : "none",
                opacity: isPicked ? 0.85 : 1,
              }}
            >
              <div style={{ fontSize: 26, marginBottom: 6 }}>{h.emoji}</div>
              <div>{h.label}</div>
              {isPicked && (
                <div style={{ fontSize: 11, color: "#7eff97", marginTop: 4 }}>
                  ✓ in hint box
                </div>
              )}
            </button>
          );
        })}
      </div>

      {feedback && (
        <div
          key={feedback.id + (feedback.ok ? "-ok" : "-no")}
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 12,
            background: feedback.ok
              ? "rgba(126,255,151,0.12)"
              : "rgba(239,68,68,0.12)",
            border: `1px solid ${feedback.ok ? "rgba(126,255,151,0.4)" : "rgba(239,68,68,0.4)"}`,
            color: feedback.ok ? "#a8ffb8" : "#ffb4b4",
            fontSize: 13,
            animation: "vaultCardPop 0.3s ease both",
          }}
        >
          {feedback.ok ? "✅ " : "⚠️ "}
          {feedback.reason}
        </div>
      )}

      <div
        style={{
          marginTop: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ color: "rgba(125,240,255,0.6)", fontSize: 12 }}>
          {safeCount}/3 safe clues picked
        </div>
        <button
          onClick={handleContinue}
          disabled={!ready}
          style={{
            padding: "10px 18px",
            borderRadius: 12,
            border: "none",
            background: ready
              ? "linear-gradient(135deg, #7eff97, #00e5ff)"
              : "rgba(125,240,255,0.15)",
            color: ready ? "#0d1220" : "rgba(125,240,255,0.5)",
            fontFamily: "'Fredoka', 'Nunito', sans-serif",
            fontWeight: 700,
            fontSize: 14,
            cursor: ready ? "pointer" : "not-allowed",
            boxShadow: ready ? "0 4px 16px rgba(126,255,151,0.4)" : "none",
            transition: "all 0.2s ease",
          }}
        >
          {ready ? "Help Adam →" : "Pick 3 safe clues"}
        </button>
      </div>
    </div>
  );
}

export type { VaultLockProps, EvaluateItem, CreateComponent };
