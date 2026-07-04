"use client";

/**
 * VaultDrop — "Treasure or Trumpet?" (the DRAG sort).
 *
 * One info-treasure at a time sits on the table. The child physically
 * DRAGS it into the vault (private — the door swallows it with a clunk)
 * or onto the share board (safe — it pins up with a pop). No timer, no
 * belt, no beam: the deliberate, tactile opposite of Week 1's reflex
 * scanner. Wrong drops bounce back to the table and teach.
 *
 * Accessibility: two buttons under the card mirror the drag targets so
 * keyboard/switch users can sort without dragging.
 */

import { useRef, useState } from "react";
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
import GameButton from "@/app/components/lesson/GameButton";
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

  // toVault: where the child put it. Returns true when the drop landed
  // (right or wrong); false = dropped on neither zone (card just snaps back).
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
        window.setTimeout(() => setVaultChomp(false), 500);
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
        title: item.isPrivate
          ? "Whoa - that one is private treasure!"
          : "That one was safe to share!",
        explanation: item.explanation,
        tip: hints?.tier1,
      });
    }
  };

  const handleDragEnd = (point: { x: number; y: number }) => {
    setDragging(false);
    const inRect = (el: HTMLDivElement | null) => {
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return point.x >= r.left && point.x <= r.right && point.y >= r.top && point.y <= r.bottom;
    };
    if (inRect(vaultRef.current)) sortCurrent(true);
    else if (inRect(boardRef.current)) sortCurrent(false);
    // Neither zone: dragSnapToOrigin returns the card, no judgment.
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  const zoneGlow = (active: boolean, colour: string) =>
    dragging
      ? `0 0 ${active ? 26 : 14}px ${colour}, inset 0 1px 0 rgba(255,255,255,0.08)`
      : "inset 0 1px 0 rgba(255,255,255,0.06)";

  return (
    <ExerciseFrame maxWidth={720} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title="The Treasure Table"
          subtitle="Drag each treasure to the vault or the share board."
          icon="🛡️"
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {/* ── Drop zones ── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {/* Share board */}
          <div
            ref={boardRef}
            aria-label="Share board - safe to share"
            style={{
              minHeight: 148,
              borderRadius: 16,
              padding: "10px 10px 8px",
              background: "linear-gradient(180deg, rgba(96,64,34,0.85) 0%, rgba(70,45,24,0.9) 100%)",
              border: dragging ? "2px dashed #7eff97" : "2px solid rgba(140,96,52,0.9)",
              boxShadow: zoneGlow(dragging, "rgba(126,255,151,0.35)"),
              transition: "border-color 150ms ease, box-shadow 150ms ease",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center", marginBottom: 6 }}>
              <PixIcon emoji="🎮" size={20} />
              <span style={{ fontSize: 12.5, fontWeight: 900, letterSpacing: "0.06em", color: "#ffe9bd" }}>
                SHARE BOARD
              </span>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, justifyContent: "center" }}>
              <AnimatePresence>
                {pinned.map((p) => (
                  <motion.span
                    key={p.id}
                    initial={reduce ? false : { scale: 1.6, opacity: 0, rotate: -8 }}
                    // Deterministic per-item jitter so pins look hand-placed
                    // without impure randomness in render.
                    animate={{ scale: 1, opacity: 1, rotate: ((p.id.charCodeAt(0) % 7) - 3) }}
                    style={{
                      position: "relative",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                      padding: "4px 8px",
                      borderRadius: 7,
                      background: "#fff7e6",
                      border: "1px solid #e8cf9e",
                      color: "#4a3208",
                      fontSize: 10.5,
                      fontWeight: 800,
                      boxShadow: "0 3px 6px rgba(0,0,0,0.4)",
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        position: "absolute",
                        top: -4,
                        left: "50%",
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "radial-gradient(circle at 35% 30%, #ff8d8d, #b91c1c)",
                      }}
                    />
                    <PixIcon emoji={p.icon} size={13} /> {p.text}
                  </motion.span>
                ))}
              </AnimatePresence>
              {pinned.length === 0 && (
                <span style={{ fontSize: 11, fontWeight: 700, color: "#c9a878", padding: "14px 0" }}>
                  Safe stuff gets pinned here
                </span>
              )}
            </div>
          </div>

          {/* Vault */}
          <motion.div
            ref={vaultRef}
            aria-label="The vault - keep private"
            animate={vaultChomp && !reduce ? { scale: [1, 1.05, 0.98, 1] } : { scale: 1 }}
            transition={{ duration: 0.45 }}
            style={{
              minHeight: 148,
              borderRadius: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              background: "radial-gradient(circle at 50% 42%, #2c3763 0%, #171e40 65%, #0e1330 100%)",
              border: dragging ? "2px dashed #7df0ff" : "2px solid rgba(122,140,255,0.5)",
              boxShadow: zoneGlow(dragging, "rgba(125,240,255,0.35)"),
              transition: "border-color 150ms ease, box-shadow 150ms ease",
            }}
          >
            {/* Vault door */}
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "radial-gradient(circle at 40% 35%, #4d5a94 0%, #222b58 70%)",
                border: "4px solid #6a79bd",
                boxShadow: "inset 0 0 14px rgba(0,0,0,0.6), 0 6px 16px rgba(0,0,0,0.5)",
              }}
            >
              <PixIcon emoji={vaultChomp ? "✅" : "🔒"} size={36} />
            </div>
            <span style={{ fontSize: 12.5, fontWeight: 900, letterSpacing: "0.06em", color: "#9fb1ff" }}>
              THE VAULT
            </span>
            <span style={{ fontSize: 10.5, fontWeight: 800, color: "#7eff97" }}>
              {vaulted} treasure{vaulted === 1 ? "" : "s"} locked away
            </span>
          </motion.div>
        </div>

        {/* ── The table + active treasure ── */}
        <div
          style={{
            position: "relative",
            minHeight: 168,
            borderRadius: 16,
            background: "linear-gradient(180deg, rgba(26,33,71,0.85) 0%, rgba(15,21,48,0.92) 100%)",
            border: "2px solid rgba(122,140,255,0.3)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            padding: "14px 12px",
          }}
        >
          <AnimatePresence mode="wait">
            {item && !finished && (
              <motion.div
                key={item.id}
                drag={!feedback}
                dragSnapToOrigin
                dragElastic={0.18}
                whileDrag={{ scale: 1.08, rotate: 2, zIndex: 20 }}
                onDragStart={() => {
                  setDragging(true);
                  setHasInteracted(true);
                  audio.tap();
                }}
                onDragEnd={(_e, info) => handleDragEnd(info.point)}
                initial={reduce ? false : { y: 26, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, scale: 0.7 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "14px 18px",
                  borderRadius: 14,
                  cursor: "grab",
                  touchAction: "none",
                  background: "linear-gradient(180deg, #ffe9a8 0%, #f5c854 100%)",
                  border: "2px solid #ffdf8e",
                  boxShadow: "0 0 20px rgba(255,214,110,0.5), 0 10px 22px -8px rgba(0,0,0,0.7)",
                  color: "#4a3208",
                }}
              >
                <PixIcon emoji={item.icon} size={34} />
                <span style={{ fontSize: 15.5, fontWeight: 900, lineHeight: 1.2, maxWidth: 300 }}>
                  {item.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ fontSize: 11.5, fontWeight: 800, color: "#7d8cc9" }}>
            {finished ? "Table cleared!" : `Drag it up · treasure ${Math.min(idx + 1, items.length)} of ${items.length}`}
          </div>

          {/* Keyboard / no-drag fallback */}
          {item && !finished && (
            <div style={{ display: "flex", gap: 8 }}>
              <GameButton variant="success" size="md" onClick={() => sortCurrent(false)}>
                📌 Pin to board
              </GameButton>
              <GameButton variant="primary" size="md" onClick={() => sortCurrent(true)}>
                🔒 Lock in vault
              </GameButton>
            </div>
          )}
        </div>

        <div style={{ padding: wrongCount > 0 ? "0 4px" : 0 }}>
          {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
          {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
        </div>
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
