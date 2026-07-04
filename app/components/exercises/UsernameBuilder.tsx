"use client";

/**
 * UsernameBuilder — the Secret Identity Machine (BUILD).
 *
 * Three reels forge a username: hero word + sidekick + lucky number.
 * TRAP parts carrying real-life details (a first name, a school, a birth
 * year) are mixed into the trays — picking one trips the LEAK! alarm and
 * teaches, safe picks raise the DISGUISE-O-METER. All three reels locked
 * in → the hero's ID badge is stamped.
 *
 * Judges identity-LEAKAGE, not strength — deliberately unlike Week 1's
 * threeRandomWords (which is about length). You're crafting a mask, not
 * a key.
 */

import { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface BuilderSlot {
  id: string;
  label: string;
  icon: string;
}

export interface BuilderPart {
  id: string;
  text: string;
  slotId: string;
  /** If set, this part LEAKS real info; value = why (teach copy). */
  trap?: string;
}

export interface UsernameBuilderProps {
  slots: BuilderSlot[];
  parts: BuilderPart[];
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

export default function UsernameBuilder({
  slots,
  parts,
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: UsernameBuilderProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [picked, setPicked] = useState<Record<string, BuilderPart>>({});
  const [leakFlash, setLeakFlash] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [badgeStamped, setBadgeStamped] = useState(false);

  const filledCount = Object.keys(picked).length;
  const allFilled = filledCount >= slots.length;
  const meter = Math.round((filledCount / slots.length) * 100);
  const forgedName = useMemo(
    () => slots.map((s) => picked[s.id]?.text ?? "").join(""),
    [slots, picked],
  );

  const reportedTier = useRef(0);
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

  const pick = (part: BuilderPart) => {
    if (showIntro || badgeStamped || picked[part.slotId]) return;
    setHasInteracted(true);
    onAnswered?.({
      questionKey: `forge-${part.slotId}@${part.id}`,
      selectedIndex: part.trap ? 1 : 0,
      correctIndex: 0,
      wasCorrect: !part.trap,
    });
    if (part.trap) {
      audio.wrong();
      onWrong?.();
      bumpHints();
      setLeakFlash(true);
      window.setTimeout(() => setLeakFlash(false), 650);
      setFeedback({
        title: "LEAK! That part gives you away",
        explanation: part.trap,
        tip: hints?.tier1,
      });
      return;
    }
    audio.drop();
    fx.correct({ xp: 25 });
    onCorrect?.();
    const next = { ...picked, [part.slotId]: part };
    setPicked(next);
    if (Object.keys(next).length >= slots.length) {
      window.setTimeout(() => {
        fx.unlock({ text: "IDENTITY SEALED!" });
        setBadgeStamped(true);
      }, reduce ? 400 : 900);
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  return (
    <ExerciseFrame maxWidth={760} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title="The Secret Identity Machine"
          subtitle="Forge a hero name that says NOTHING about the real you."
          icon="🎭"
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      <motion.div
        animate={leakFlash && !reduce ? { x: [0, -7, 7, -4, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          borderRadius: 20,
          padding: "16px 14px 14px",
          background: leakFlash
            ? "linear-gradient(180deg, rgba(70,18,40,0.94) 0%, rgba(40,10,26,0.96) 100%)"
            : "linear-gradient(180deg, rgba(26,33,71,0.9) 0%, rgba(15,21,48,0.95) 100%)",
          border: leakFlash ? "2px solid #ff5fb3" : "2px solid rgba(122,140,255,0.35)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 18px 44px -22px rgba(0,0,0,0.8)",
          transition: "background 200ms ease, border-color 200ms ease",
        }}
      >
        {/* Header + disguise meter */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <PixIcon emoji="🎭" size={26} />
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.06em", color: "#9fb1ff" }}>
            DISGUISE-O-METER
          </span>
          <div
            style={{
              flex: 1,
              height: 14,
              borderRadius: 999,
              background: "rgba(8,10,22,0.7)",
              border: "1px solid rgba(122,140,255,0.35)",
              overflow: "hidden",
            }}
            role="progressbar"
            aria-valuenow={meter}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              animate={{ width: `${meter}%` }}
              transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 120, damping: 20 }}
              style={{
                height: "100%",
                borderRadius: 999,
                background: "linear-gradient(90deg, #7c5cff, #00e5ff, #7eff97)",
              }}
            />
          </div>
          <span style={{ fontSize: 13, fontWeight: 900, color: "#7eff97", width: 42, textAlign: "right" }}>
            {meter}%
          </span>
        </div>

        {/* The three reels */}
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${slots.length}, minmax(0,1fr))`, gap: 10 }}>
          {slots.map((slot) => {
            const part = picked[slot.id];
            return (
              <div key={slot.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {/* Reel window */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 4,
                    padding: "10px 6px",
                    borderRadius: 12,
                    minHeight: 74,
                    background: part
                      ? "linear-gradient(180deg, rgba(52,211,153,0.16), rgba(52,211,153,0.06))"
                      : "rgba(8,10,22,0.55)",
                    border: part ? "2px solid #34d399" : "2px dashed rgba(122,140,255,0.45)",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, fontWeight: 900, letterSpacing: "0.06em", color: "#9fb1ff", textTransform: "uppercase" }}>
                    <PixIcon emoji={slot.icon} size={15} /> {slot.label}
                  </span>
                  <AnimatePresence mode="popLayout">
                    {part ? (
                      <motion.span
                        key={part.id}
                        initial={reduce ? false : { y: -16, opacity: 0, scale: 0.8 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 320, damping: 18 }}
                        style={{ fontSize: 19, fontWeight: 900, color: "#7eff97" }}
                      >
                        {part.text}
                      </motion.span>
                    ) : (
                      <span style={{ fontSize: 17, fontWeight: 900, color: "#3d466f" }}>?</span>
                    )}
                  </AnimatePresence>
                </div>
                {/* Tray */}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {parts
                    .filter((p) => p.slotId === slot.id)
                    .map((p) => {
                      const used = part?.id === p.id;
                      const lockedOut = !!part;
                      return (
                        <motion.button
                          key={p.id}
                          onClick={() => pick(p)}
                          disabled={lockedOut || showIntro || badgeStamped}
                          whileHover={lockedOut || reduce ? undefined : { scale: 1.04 }}
                          whileTap={lockedOut || reduce ? undefined : { scale: 0.95 }}
                          style={{
                            padding: "8px 6px",
                            borderRadius: 10,
                            cursor: lockedOut ? "default" : "pointer",
                            touchAction: "manipulation",
                            fontFamily: "inherit",
                            fontSize: 13.5,
                            fontWeight: 900,
                            letterSpacing: "0.02em",
                            background: used
                              ? "rgba(52,211,153,0.2)"
                              : lockedOut
                                ? "rgba(8,10,22,0.4)"
                                : "linear-gradient(180deg, rgba(124,92,255,0.22), rgba(124,92,255,0.1))",
                            border: used ? "1.5px solid #34d399" : "1.5px solid rgba(160,140,255,0.45)",
                            color: used ? "#7eff97" : lockedOut ? "#3d466f" : "#dcd6ff",
                          }}
                        >
                          {p.text}
                        </motion.button>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Forged-name readout */}
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            borderRadius: 12,
            textAlign: "center",
            background: "rgba(8,10,22,0.6)",
            border: "1px solid rgba(122,140,255,0.3)",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.08em", color: "#7d8cc9" }}>
            YOUR HERO NAME
          </span>
          <div style={{ fontSize: 22, fontWeight: 900, color: allFilled ? "#00e5ff" : "#4d578a", minHeight: 30 }}>
            {forgedName || "· · ·"}
          </div>
        </div>

        <div style={{ padding: wrongCount > 0 ? "10px 4px 0" : 0 }}>
          {wrongCount === 1 && hints && <HintBubble tier={1} speaker="layla" text={hints.tier1} />}
          {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="layla" text={hints.tier2} />}
        </div>
      </motion.div>

      {coachLines && !showIntro && !hasInteracted && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={() => setFeedback(null)}
        />
      )}

      {badgeStamped && (
        <ExerciseCompleteBeat
          title={`${forgedName} — identity sealed!`}
          stars={stars}
          statLines={[
            "No real name. No school. No birthday.",
            "The Raccoon can stare all day and learn NOTHING.",
          ]}
          encouragement="Your mask has no holes, Cyber Hero!"
          onContinue={() => onComplete(slots.length)}
        />
      )}
    </ExerciseFrame>
  );
}
