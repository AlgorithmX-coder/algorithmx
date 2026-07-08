"use client";

/**
 * ProfileInspector — the fake-profile spotting drill (INSPECT, Week 3).
 *
 * A friendly-looking social profile arrives. Before the child may decide
 * anything, they must tap every inspect zone — when it joined, its friends
 * & photos, how it talks, and what it's asking for. Only then do the
 * verdict buttons unlock: "Real friend" or "FAKE!".
 *
 * The social-profile sibling of RequestInspector (same zones→verdict
 * skeleton), teaching the four fake-profile tells: brand-new account, no
 * real friends, copied photo, too-friendly-too-fast. Lane-clean: this
 * judges PEOPLE, not messages (W4's inspector) and not the report/block
 * protocol (W11).
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";

export interface ProfileZone {
  id: string;
  label: string;
  note: string;
  isRedFlag: boolean;
}

export interface InspectProfile {
  id: string;
  handle: string;
  avatar: string;
  bio: string;
  stats: { label: string; value: string }[];
  isFake: boolean;
  zones: ProfileZone[];
  verdictNote: string;
}

export interface ProfileInspectorProps {
  profiles: InspectProfile[];
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

export default function ProfileInspector({
  profiles,
  hints,
  introNarration,
  coachLines,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: ProfileInspectorProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [inspected, setInspected] = useState<Set<string>>(new Set());
  const [decided, setDecided] = useState<null | "real" | "fake">(null);
  const [wrongCount, setWrongCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const finished = idx >= profiles.length;
  const profile = profiles[idx];
  const allInspected = profile ? profile.zones.every((z) => inspected.has(z.id)) : false;

  // Reset per profile when advancing.
  useEffect(() => {
    setInspected(new Set());
    setDecided(null);
  }, [idx]);

  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = wrongCount >= 2 ? 2 : wrongCount >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [wrongCount, onHintReached]);

  const inspect = (zone: ProfileZone) => {
    if (inspected.has(zone.id) || decided || showIntro) return;
    setHasInteracted(true);
    audio.tap();
    fx.toast(
      zone.isRedFlag
        ? { text: "SUSPICIOUS!", tone: "danger" }
        : { text: "Checks out", tone: "xp" },
    );
    setInspected((prev) => new Set(prev).add(zone.id));
  };

  const decide = (callFake: boolean) => {
    if (!profile || !allInspected || decided) return;
    const wasCorrect = callFake === profile.isFake;
    onAnswered?.({
      questionKey: `profile-${profile.id}`,
      selectedIndex: callFake ? 1 : 0,
      correctIndex: profile.isFake ? 1 : 0,
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      fx.correct({ xp: 25, text: profile.isFake ? "UNMASKED!" : "REAL FRIEND!" });
      onCorrect?.();
      setCorrectCount((n) => n + 1);
      setDecided(callFake ? "fake" : "real");
      window.setTimeout(() => setIdx((i) => i + 1), reduce ? 700 : 1400);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongCount((n) => n + 1);
      setFeedback({
        title: profile.isFake
          ? "Careful - that profile was a FAKE"
          : "Look again - that one was actually real",
        explanation: profile.verdictNote,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;

  const zoneColour = useMemo(
    () => (zone: ProfileZone) =>
      !inspected.has(zone.id)
        ? { border: "#7df0ff55", text: "#7df0ff", bg: "rgba(0,179,255,0.08)" }
        : zone.isRedFlag
          ? { border: "#ff5fb3aa", text: "#ff9bcb", bg: "rgba(255,95,179,0.1)" }
          : { border: "#34d399aa", text: "#a0ffb0", bg: "rgba(52,211,153,0.1)" },
    [inspected],
  );

  return (
    <ExerciseFrame maxWidth={760} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title="The Profile Detective"
          subtitle="Check every clue, then decide: real friend... or FAKE?"
          icon="🔍"
          narration={introNarration}
          character={introNarration?.speaker}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {profile && (
        <AnimatePresence mode="wait">
          <motion.div
            key={profile.id}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {/* Profile card */}
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "2px solid rgba(122,140,255,0.4)",
                boxShadow: "0 18px 44px -22px rgba(0,0,0,0.8)",
                position: "relative",
              }}
            >
              {/* Cover strip + avatar header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "14px 16px",
                  background: "linear-gradient(135deg, #24509a 0%, #1a2c60 100%)",
                }}
              >
                <span
                  style={{
                    display: "inline-flex",
                    padding: 8,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.12)",
                    border: "2px solid rgba(255,255,255,0.35)",
                  }}
                >
                  <PixIcon emoji={profile.avatar} size={38} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 17, fontWeight: 900, color: "#fff7e6" }}>{profile.handle}</div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "#b9c4f7" }}>{profile.bio}</div>
                </div>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: "0.07em",
                    color: "#9fb1ff",
                    padding: "3px 9px",
                    borderRadius: 999,
                    border: "1px solid rgba(159,177,255,0.4)",
                    whiteSpace: "nowrap",
                  }}
                >
                  FRIEND REQUEST
                </span>
              </div>
              {/* Stat chips */}
              <div
                style={{
                  padding: "12px 14px 14px",
                  background: "linear-gradient(180deg, #f4f6ff 0%, #e6ebff 100%)",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {profile.stats.map((s) => (
                  <div
                    key={s.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "6px 12px",
                      borderRadius: 999,
                      background: "#ffffff",
                      border: "1.5px solid #b9c2e8",
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.05em", color: "#39406b", textTransform: "uppercase" }}>
                      {s.label}
                    </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: "#5a63a0" }}>{s.value}</span>
                  </div>
                ))}
              </div>
              {decided && (
                <motion.div
                  initial={reduce ? false : { scale: 1.6, opacity: 0, rotate: -10 }}
                  animate={{ scale: 1, opacity: 1, rotate: -7 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    pointerEvents: "none",
                  }}
                >
                  <span
                    style={{
                      padding: "8px 22px",
                      borderRadius: 12,
                      fontSize: 26,
                      fontWeight: 900,
                      letterSpacing: "0.06em",
                      background: decided === "fake" ? "rgba(60,8,32,0.88)" : "rgba(8,42,24,0.88)",
                      border: `3px solid ${decided === "fake" ? "#ff5fb3" : "#7eff97"}`,
                      color: decided === "fake" ? "#ff9bcb" : "#7eff97",
                    }}
                  >
                    {decided === "fake" ? "FAKE! 🚫" : "REAL FRIEND ✓"}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Inspect zones */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 8 }}>
              {profile.zones.map((zone) => {
                const c = zoneColour(zone);
                const open = inspected.has(zone.id);
                return (
                  <motion.button
                    key={zone.id}
                    onClick={() => inspect(zone)}
                    disabled={open || !!decided || showIntro}
                    animate={open && !reduce ? { scale: [1, 1.04, 1] } : undefined}
                    style={{
                      textAlign: "left",
                      padding: "10px 12px",
                      borderRadius: 12,
                      cursor: open ? "default" : "pointer",
                      touchAction: "manipulation",
                      background: c.bg,
                      border: `1.5px solid ${c.border}`,
                      color: c.text,
                      fontFamily: "inherit",
                      minHeight: 64,
                    }}
                    aria-label={open ? `${zone.label}: ${zone.note}` : `Inspect: ${zone.label}`}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 900 }}>
                      <PixIcon emoji={open ? (zone.isRedFlag ? "🚫" : "✅") : "🔍"} size={18} />
                      {zone.label}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12.5, fontWeight: 700, lineHeight: 1.35, color: open ? undefined : "#7d8cc9" }}>
                      {open ? zone.note : "Tap to inspect"}
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Verdict buttons — unlocked only after full inspection */}
            <div style={{ display: "flex", gap: 10, justifyContent: "center", opacity: allInspected ? 1 : 0.5 }}>
              <GameButton
                variant="success"
                size="lg"
                disabled={!allInspected || !!decided}
                onClick={() => decide(false)}
              >
                ✅ Real friend
              </GameButton>
              <GameButton
                variant="danger"
                size="lg"
                disabled={!allInspected || !!decided}
                onClick={() => decide(true)}
              >
                🚫 FAKE!
              </GameButton>
            </div>
            {!allInspected && (
              <div style={{ textAlign: "center", fontSize: 12, fontWeight: 700, color: "#7d8cc9" }}>
                Inspect all {profile.zones.length} clues to unlock your verdict · Profile{" "}
                {Math.min(idx + 1, profiles.length)} of {profiles.length}
              </div>
            )}

            <div style={{ padding: wrongCount > 0 ? "2px 4px 0" : 0 }}>
              {wrongCount === 1 && hints && <HintBubble tier={1} speaker="adam" text={hints.tier1} />}
              {wrongCount >= 2 && hints && <HintBubble tier={2} speaker="adam" text={hints.tier2} />}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {coachLines && !showIntro && !hasInteracted && !finished && (
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

      {finished && (
        <ExerciseCompleteBeat
          title="Every profile checked!"
          stars={stars}
          statLines={[
            `${correctCount}/${profiles.length} verdicts right first try`,
            "Fakes unmasked, real friends welcomed.",
          ]}
          onContinue={() => onComplete(correctCount)}
        />
      )}
    </ExerciseFrame>
  );
}
