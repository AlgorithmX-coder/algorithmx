"use client";

/**
 * VaultDrop — "The Treasure Table" (the DRAG sort), showcase edition.
 *
 * Art-directed to the approved reference: a starry royal-purple scene,
 * two glassy destination cards (cork SHARE BOARD art / ornate golden
 * VAULT door art), a golden ticket treasure in the middle with dashed
 * guide paths, glossy pedestal action buttons, Layla's "You decide!"
 * moment, and a motto strip. One treasure at a time; the child DRAGS it
 * to either destination card OR its matching glossy button (all four
 * are live drop zones), or just taps the buttons. No timer. Wrong drops
 * bounce back and teach.
 */

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { playSound } from "@/app/lib/sounds";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface VaultDropItem {
  id: string;
  text: string;
  icon: string;
  isPrivate: boolean;
  explanation: string;
}

export interface VaultDropProps {
  items: VaultDropItem[];
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

const ROUNDED = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif";

// Deterministic starfield (x%, y%, px, opacity) — no randomness in render.
const STARS: [number, number, number, number][] = [
  [4, 8, 10, 0.8], [12, 30, 7, 0.5], [7, 62, 8, 0.6], [16, 84, 9, 0.7],
  [28, 5, 8, 0.6], [38, 16, 6, 0.4], [50, 4, 9, 0.7], [63, 12, 7, 0.5],
  [76, 6, 10, 0.8], [88, 18, 7, 0.5], [95, 40, 9, 0.7], [92, 68, 8, 0.6],
  [85, 90, 9, 0.7], [55, 92, 7, 0.5], [30, 94, 8, 0.6], [70, 45, 6, 0.4],
];

export default function VaultDrop({
  items,
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: VaultDropProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [pinned, setPinned] = useState<VaultDropItem[]>([]);
  const [vaulted, setVaulted] = useState(0);
  const [vaultChomp, setVaultChomp] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [dragging, setDragging] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const vaultRef = useRef<HTMLDivElement>(null);
  const pinBtnRef = useRef<HTMLButtonElement>(null);
  const lockBtnRef = useRef<HTMLButtonElement>(null);
  const reportedTier = useRef(0);

  const finished = idx >= items.length;
  const item = items[idx];

  const bumpHints = () => {
    setWrongCount((n) => {
      const next = n + 1;
      const tier = next >= 2 ? 2 : 1;
      if (tier > reportedTier.current) {
        reportedTier.current = tier;
        onHintReached?.(tier as 1 | 2);
      }
      return next;
    });
  };

  const sortCurrent = (toVault: boolean) => {
    if (!item || feedback || finished) return;
    setHasInteracted(true);
    const wasCorrect = toVault === item.isPrivate;
    onAnswered?.({
      questionKey: `vault-${item.id}`,
      selectedIndex: toVault ? 1 : 0,
      correctIndex: item.isPrivate ? 1 : 0,
      wasCorrect,
    });
    if (wasCorrect) {
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      if (toVault) {
        playSound("lock");
        setVaulted((v) => v + 1);
        setVaultChomp(true);
        window.setTimeout(() => setVaultChomp(false), 550);
        fx.correct({ xp: 25, text: "LOCKED!" });
      } else {
        audio.drop();
        setPinned((p) => [...p, item]);
        fx.correct({ xp: 25, text: "PINNED!" });
      }
      setIdx((i) => i + 1);
    } else {
      audio.wrong();
      onWrong?.();
      bumpHints();
      setFeedback({
        title: item.isPrivate ? "Whoa - that one is private treasure!" : "That one was safe to share!",
        explanation: item.explanation,
        tip: hints?.tier1,
      });
    }
  };

  const handleDragEnd = (point: { x: number; y: number }) => {
    setDragging(false);
    const inRect = (el: HTMLElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom;
    };
    if (inRect(vaultRef.current) || inRect(lockBtnRef.current)) sortCurrent(true);
    else if (inRect(boardRef.current) || inRect(pinBtnRef.current)) sortCurrent(false);
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
  const glassCard: React.CSSProperties = {
    borderRadius: 20,
    background: "linear-gradient(180deg, rgba(88,66,180,0.28) 0%, rgba(46,32,110,0.34) 100%)",
    border: "1.5px solid rgba(168,142,255,0.45)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 14px 34px -18px rgba(0,0,0,0.8)",
    backdropFilter: "blur(6px)",
  };

  const starfield = useMemo(
    () =>
      STARS.map(([x, y, s, o], i) => (
        <span
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            left: `${x}%`,
            top: `${y}%`,
            fontSize: s,
            opacity: o,
            color: i % 3 === 0 ? "#ffd158" : "#cdbcff",
            animation: reduce ? undefined : `vdTwinkle ${2.2 + (i % 4) * 0.7}s ease-in-out ${i * 0.35}s infinite`,
            pointerEvents: "none",
          }}
        >
          {i % 2 === 0 ? "✦" : "✧"}
        </span>
      )),
    [reduce],
  );

  return (
    <ExerciseFrame maxWidth={860} decor={false} background="transparent">
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title="The Treasure Table"
          subtitle="Drag each treasure to the share board or the vault."
          icon="🛡️"
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* ── The scene ── */}
      <div
        style={{
          position: "relative",
          borderRadius: 26,
          padding: "18px 18px 14px",
          overflow: "hidden",
          fontFamily: ROUNDED,
          background:
            "radial-gradient(ellipse at 50% -10%, rgba(124,92,255,0.4) 0%, transparent 55%), radial-gradient(ellipse at 12% 110%, rgba(76,29,149,0.55) 0%, transparent 55%), radial-gradient(ellipse at 88% 110%, rgba(76,29,149,0.55) 0%, transparent 55%), linear-gradient(180deg, #2a1b5e 0%, #1d1145 55%, #150c33 100%)",
          border: "2px solid rgba(168,142,255,0.35)",
          boxShadow: "0 24px 60px -24px rgba(0,0,0,0.9)",
        }}
      >
        {starfield}

        {/* ── Destination cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, position: "relative", zIndex: 2 }}>
          {/* Share board */}
          <div
            ref={boardRef}
            aria-label="Share board - safe to share"
            style={{
              ...glassCard,
              padding: "12px 14px",
              minHeight: 108,
              border: dragging ? "2px dashed #5eead4" : (glassCard.border as string),
              boxShadow: dragging ? "0 0 26px rgba(94,234,212,0.4), inset 0 1px 0 rgba(255,255,255,0.14)" : (glassCard.boxShadow as string),
              transition: "border 150ms ease, box-shadow 150ms ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/cyberheroes/icons/share-board.png" alt="" style={{ width: 74, height: 74, objectFit: "contain", transform: "rotate(-4deg)", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.5))" }} />
              <div>
                <div style={{ fontSize: 21, fontWeight: 900, color: "#ffffff", letterSpacing: "0.02em", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
                  SHARE BOARD
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "#b9a8f5" }}>Safe things get pinned here</div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: pinned.length ? 8 : 0 }}>
              <AnimatePresence>
                {pinned.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={reduce ? false : { scale: 1.6, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: (p.id.charCodeAt(0) % 7) - 3 }}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 9px",
                      borderRadius: 7,
                      background: "#fff7e6",
                      border: "1px solid #e8cf9e",
                      color: "#4a3208",
                      fontSize: 10.5,
                      fontWeight: 800,
                      boxShadow: "0 3px 7px rgba(0,0,0,0.45)",
                    }}
                  >
                    <span aria-hidden style={{ position: "absolute", top: -4, left: "50%", width: 7, height: 7, borderRadius: "50%", background: "radial-gradient(circle at 35% 30%, #ff8d8d, #b91c1c)" }} />
                    <PixIcon emoji={p.icon} size={13} /> {p.text}
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* The vault */}
          <motion.div
            ref={vaultRef}
            aria-label="The vault - keep private"
            animate={vaultChomp && !reduce ? { scale: [1, 1.04, 0.985, 1] } : { scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{
              ...glassCard,
              padding: "12px 14px",
              minHeight: 108,
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "space-between",
              border: dragging ? "2px dashed #ffd158" : (glassCard.border as string),
              boxShadow: dragging ? "0 0 26px rgba(255,209,88,0.4), inset 0 1px 0 rgba(255,255,255,0.14)" : (glassCard.boxShadow as string),
              transition: "border 150ms ease, box-shadow 150ms ease",
            }}
          >
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#ffffff", letterSpacing: "0.02em", textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
                THE VAULT
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 700, color: "#7fe6c3" }}>
                {vaulted} treasure{vaulted === 1 ? "" : "s"} locked away
              </div>
            </div>
            <motion.img
              src="/cyberheroes/icons/vault-door.png"
              alt=""
              animate={vaultChomp && !reduce ? { rotate: [0, -6, 4, 0] } : undefined}
              style={{ width: 86, height: 86, objectFit: "contain", filter: "drop-shadow(0 6px 12px rgba(0,0,0,0.55)) drop-shadow(0 0 18px rgba(255,190,80,0.35))" }}
            />
          </motion.div>
        </div>

        {/* ── The treasure ── */}
        <div style={{ position: "relative", zIndex: 3, textAlign: "center", padding: "16px 0 6px" }}>
          <div style={{ fontSize: 15, fontWeight: 900, color: "#ffffff", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
            ↖ Drag it to the right place ↗
          </div>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#ffd158", marginTop: 2, letterSpacing: "0.06em" }}>
            ✦ Treasure {Math.min(idx + 1, items.length)} of {items.length} ✦
          </div>

          <div style={{ minHeight: 108, display: "flex", alignItems: "center", justifyContent: "center", marginTop: 10 }}>
            <AnimatePresence mode="wait">
              {item && !finished && (
                <motion.div
                  key={item.id}
                  drag={!feedback}
                  dragSnapToOrigin
                  dragElastic={0.18}
                  whileDrag={{ scale: 1.08, rotate: 2, zIndex: 30 }}
                  onDragStart={() => {
                    setDragging(true);
                    setHasInteracted(true);
                    audio.tap();
                  }}
                  onDragEnd={(_e, info) => handleDragEnd(info.point)}
                  initial={reduce ? false : { y: 24, opacity: 0, scale: 0.9 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.7 }}
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "16px 22px",
                    borderRadius: 16,
                    cursor: "grab",
                    touchAction: "none",
                    background: "linear-gradient(180deg, #ffedb0 0%, #f7cf5e 78%, #eab53e 100%)",
                    border: "2.5px solid #ffe291",
                    boxShadow: "0 0 34px rgba(255,214,110,0.55), 0 14px 26px -10px rgba(0,0,0,0.75), inset 0 2px 0 rgba(255,255,255,0.55)",
                    color: "#4a3208",
                  }}
                >
                  {/* Ticket inner border */}
                  <span aria-hidden style={{ position: "absolute", inset: 5, borderRadius: 11, border: "1.5px dashed rgba(140,96,20,0.4)", pointerEvents: "none" }} />
                  <PixIcon emoji={item.icon} size={42} />
                  <span style={{ fontSize: 19, fontWeight: 900, lineHeight: 1.22, maxWidth: 320, textAlign: "left" }}>
                    {item.text}
                  </span>
                  <span aria-hidden style={{ position: "absolute", top: -9, right: -7, fontSize: 15, color: "#ffd158" }}>✦</span>
                  <span aria-hidden style={{ position: "absolute", bottom: -8, left: -9, fontSize: 12, color: "#ffd158" }}>✧</span>
                </motion.div>
              )}
            </AnimatePresence>
            {finished && (
              <div style={{ fontSize: 16, fontWeight: 900, color: "#7fe6c3" }}>Table cleared! ✨</div>
            )}
          </div>

          {/* Dashed guide paths to the buttons */}
          <svg aria-hidden width="100%" height="34" viewBox="0 0 800 34" style={{ display: "block", opacity: 0.6 }}>
            <path d="M 330 4 C 260 18, 210 22, 165 28" stroke="#a88eff" strokeWidth="2.5" strokeDasharray="6 7" fill="none" strokeLinecap="round" />
            <path d="M 470 4 C 540 18, 590 22, 635 28" stroke="#a88eff" strokeWidth="2.5" strokeDasharray="6 7" fill="none" strokeLinecap="round" />
            <path d="M 172 22 L 163 29 L 174 32" stroke="#a88eff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 628 22 L 637 29 L 626 32" stroke="#a88eff" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* ── Action row: glossy buttons + Layla's moment ── */}
        <div style={{ position: "relative", zIndex: 3, display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 12, alignItems: "center" }}>
          <motion.button
            ref={pinBtnRef}
            onClick={() => sortCurrent(false)}
            disabled={!item || finished || !!feedback || showIntro}
            whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            style={{
              display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
              padding: "14px 16px", borderRadius: 18, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit",
              background: "linear-gradient(180deg, #5eeaa5 0%, #22b573 60%, #178a56 100%)",
              border: dragging ? "2.5px dashed #d3ffe9" : "2.5px solid #a4f5cd",
              boxShadow: "0 12px 28px -10px rgba(34,181,115,0.75), inset 0 2px 0 rgba(255,255,255,0.45)",
              color: "#ffffff", textAlign: "left",
              transition: "border 150ms ease",
            }}
          >
            <PixIcon emoji="📌" size={30} />
            <span>
              <span style={{ display: "block", fontSize: 17.5, fontWeight: 900, textShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>Pin to board</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 700, opacity: 0.9 }}>Share with friends</span>
            </span>
          </motion.button>

          {/* Layla: you decide! */}
          <div style={{ position: "relative", textAlign: "center", width: 92 }}>
            <div
              style={{
                display: "inline-block", marginBottom: 4, padding: "4px 12px", borderRadius: 999, borderBottomLeftRadius: 3,
                background: "linear-gradient(180deg, #7c5cff, #5b3fd4)", border: "1.5px solid #b39dff",
                color: "#ffffff", fontSize: 11.5, fontWeight: 900, whiteSpace: "nowrap",
                boxShadow: "0 6px 16px -6px rgba(124,92,255,0.8)",
              }}
            >
              You decide! ⭐
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/game/characters/layla-head.png" alt="Layla" style={{ width: 58, height: 58, objectFit: "contain", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.55))" }} />
          </div>

          <motion.button
            ref={lockBtnRef}
            onClick={() => sortCurrent(true)}
            disabled={!item || finished || !!feedback || showIntro}
            whileHover={reduce ? undefined : { scale: 1.03, y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.96 }}
            style={{
              display: "flex", alignItems: "center", gap: 12, justifyContent: "center",
              padding: "14px 16px", borderRadius: 18, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit",
              background: "linear-gradient(180deg, #ffcf5e 0%, #f59e0b 60%, #d97706 100%)",
              border: dragging ? "2.5px dashed #ffedc2" : "2.5px solid #ffe1a1",
              boxShadow: "0 12px 28px -10px rgba(245,158,11,0.75), inset 0 2px 0 rgba(255,255,255,0.5)",
              color: "#ffffff", textAlign: "left",
              transition: "border 150ms ease",
            }}
          >
            <PixIcon emoji="🔒" size={30} />
            <span>
              <span style={{ display: "block", fontSize: 17.5, fontWeight: 900, textShadow: "0 2px 6px rgba(0,0,0,0.35)" }}>Lock in vault</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 700, opacity: 0.9 }}>Keep it safe</span>
            </span>
          </motion.button>
        </div>

        {/* ── Motto strip ── */}
        <div style={{ position: "relative", zIndex: 2, display: "flex", justifyContent: "center", marginTop: 12 }}>
          <span
            style={{
              padding: "6px 18px", borderRadius: 999,
              background: "rgba(30,18,70,0.7)", border: "1px solid rgba(168,142,255,0.4)",
              color: "#cdbcff", fontSize: 12, fontWeight: 800, letterSpacing: "0.02em",
            }}
          >
            ⭐ Make smart choices. Share kindly. Keep treasures safe. 💜
          </span>
        </div>

        <style>{`
          @keyframes vdTwinkle {
            0%, 100% { opacity: 0.25; transform: scale(0.9); }
            50% { opacity: 1; transform: scale(1.15); }
          }
        `}</style>
      </div>

      {/* Hints */}
      <div style={{ padding: wrongCount > 0 ? "8px 4px 0" : 0 }}>
        {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
        {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
      </div>

      {coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={() => {
            setFeedback(null);
            setIdx((i) => i + 1);
          }}
        />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title="Every treasure sorted!"
          stars={stars}
          statLines={[
            `${correctCount}/${items.length} sorted first try`,
            `${vaulted} locked in the vault · ${pinned.length} pinned to share`,
          ]}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
