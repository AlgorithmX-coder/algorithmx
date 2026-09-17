"use client";

/**
 * GuardCount: the CHECKLIST drill (Week 6, "Neon Arcade"; the "install" skin
 * returns for the app-download weeks).
 *
 * Two neon chat rooms sit side by side. Each has FOUR guard slots, drawn as
 * identical dark buttons (the same shield on every one). The child taps every
 * slot to check it: a guard that is there lights up green with HERE, a guard
 * that is not goes dim red with MISSING, and Sarah reads what that guard does.
 * Only when every slot on BOTH rooms has been checked do the STAY HERE
 * buttons appear (one per room, identical), and the child picks the room with
 * its guards in place. The "install" skin is the same drill on ONE app card
 * with INSTALL / NOT THIS ONE as the decision.
 *
 * Why it is not the inspectors or the Clue Stamper (owner: "we never copy an
 * exercise"): there is no single message to judge, the child COUNTS guards
 * across two places and compares, every tap reveals evidence rather than
 * annotating it, and the decision is "which place" rather than "real / fake".
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the intro (`threat`),
 * Sarah speaks the how-to once as the board appears, reads every round as it
 * arrives and every guard as it is checked (audio-only, `recordedOnly`, taps
 * held), a right choice is spoken as one take ("That's right!" + why) and the
 * next round waits for her, a wrong choice speaks through WrongAnswerPanel and
 * keeps every check so the retry is one tap. Round 1 guides itself: the next
 * unchecked guard breathes, then the right button. Rounds are shuffled per
 * play and the two rooms swap sides at random, so no side, colour, icon, order
 * or count ever encodes the answer before the child has checked the guards.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce, fisherYates } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as the Clue Stamper.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface GuardSlot {
  id: string;
  /** The guard's name on the button, e.g. "A grown-up in charge". */
  label: string;
  /** true = this guard is there (HERE); false = it is not (MISSING). */
  present: boolean;
  /** Sarah's line as the slot is checked (one clip per slot). */
  readAloud: string;
}

export interface GuardPanel {
  id: string;
  title: string;
  /** PixIcon emoji for the room / app tile. Keep it the same across the
   *  panels of a round so it never hints at the answer. */
  icon?: string;
  /** Exactly four. Authored order is the checking order and stays in place. */
  slots: GuardSlot[];
  /** rooms: the room to stay in. install: whether to INSTALL this app. */
  isSafe: boolean;
}

export interface GuardRound {
  id: string;
  /** The speech-bubble prompt above the panels. */
  prompt: string;
  /** Sarah's read-aloud as the round arrives (one clip). */
  readAloud: string;
  /** rooms: two panels. install: one panel. */
  panels: GuardPanel[];
  /** Sarah's reason on a right choice ("That's right!" + why). */
  why: string;
  /** The wrong-answer panel's explanation (spoken by the panel itself). */
  whyWrong: string;
}

export interface GuardCountProps {
  /** "rooms" = two chat rooms, pick one to stay in. "install" = one app card,
   *  INSTALL or NOT THIS ONE. Default "rooms". */
  skin?: "rooms" | "install";
  /** Shuffled per play. */
  rounds: GuardRound[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** On-board strip while guards are still unchecked. */
  slotHint?: string;
  /** On-board strip once every guard is checked. */
  chooseHint?: string;
  /** rooms: the button under each panel. Default "STAY HERE". */
  stayLabel?: string;
  /** install: the two decision buttons. Defaults "INSTALL" / "NOT THIS ONE". */
  installLabel?: string;
  refuseLabel?: string;
  /** Slot state words. Defaults "HERE" / "MISSING". */
  presentWord?: string;
  missingWord?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** The how-to, spoken once as the board appears (audio only). */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken "you're protected" payoff on the complete screen. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

/** The same shield on every slot of every panel: nothing here can hint. */
const SLOT_ICON = "🛡️";
const slotKey = (panel: GuardPanel, slot: GuardSlot) => `${panel.id}/${slot.id}`;

export default function GuardCount({
  skin = "rooms",
  rounds,
  introTitle = "Guard Count",
  introSubtitle,
  introIcon = "🛡️",
  slotHint = "Tap each guard to check it",
  chooseHint,
  stayLabel = "STAY HERE",
  installLabel = "INSTALL",
  refuseLabel = "NOT THIS ONE",
  presentWord = "HERE",
  missingWord = "MISSING",
  wrongTitle = "Count the guards again!",
  completeTitle = "Every guard counted!",
  completeLine,
  hints,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: GuardCountProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#4ff0ff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;
  const isInstall = skin === "install";
  const subtitle = introSubtitle ?? (isInstall ? "Check every guard on the app, then decide." : "Check every guard in both rooms, then pick where to stay.");
  const chooseText = chooseHint ?? (isInstall ? "Now decide" : "Now tap the room to stay in");
  const thing = isInstall ? "App" : "Room";

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  // Read-aloud chain: the how-to once as the board appears, each round as it
  // arrives, then each guard as it is checked. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "slot" | "idle">("idle");
  const [slotLine, setSlotLine] = useState<{ key: string; text: string } | null>(null);
  // "sealed" = a right choice: the seal lands while Sarah says why, then the
  // next round slides in.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  // Which side each room takes this round: the round's panels run through a
  // plain Fisher-Yates as the round arrives (a fair coin flip for two rooms).
  // Not useShuffledOnce: that always SWAPS a two-item list, which would make
  // the side deterministic, the very giveaway we avoid.
  const [panels, setPanels] = useState<GuardPanel[]>([]);

  // Anti-sequence: the rounds come up in a random order every play.
  const shown = useShuffledOnce(rounds);
  const finished = idx >= shown.length;
  const r = shown[idx];
  const totalSlots = panels.reduce((n, p) => n + p.slots.length, 0);
  const allChecked = totalSlots > 0 && panels.every((p) => p.slots.every((s) => checked.has(slotKey(p, s))));
  // The guard round 1 breathes on: the first unchecked slot in display order.
  const firstUnchecked = panels.flatMap((p) => p.slots.map((s) => slotKey(p, s))).find((k) => !checked.has(k)) ?? null;

  // Spoken verdicts (owner 2026-09-12): Sarah says "That's right!" + why and
  // the next round waits for her. Wrong choices speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || phase === "sealed";
  // Round 1 teaches itself: the next guard to check breathes, then the right button.
  const guided = idx === 0 && phase === "play";

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Hint tiers reported once each (for the parent dashboard).
  const reportedTier = useRef(0);
  useEffect(() => {
    const tier = totalWrongs >= 2 ? 2 : totalWrongs >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  }, [totalWrongs, onHintReached]);

  const startBoard = () => {
    setShowIntro(false);
    setPanels(fisherYates(shown[0]?.panels ?? []));
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setIdx(idx + 1);
    setPanels(fisherYates(shown[idx + 1]?.panels ?? []));
    setChecked(new Set());
    setSlotLine(null);
    setRoundWrongs(0);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const checkSlot = (panel: GuardPanel, slot: GuardSlot) => {
    if (!r || speaking) return;
    const key = slotKey(panel, slot);
    if (checked.has(key)) return;
    audio.tap();
    setChecked((prev) => new Set(prev).add(key));
    // Sarah reads what this guard does (audio only, taps held).
    if (slot.readAloud && !isAudioMuted()) {
      setSlotLine({ key, text: slot.readAloud });
      setNarr("slot");
    }
  };

  const commit = (right: boolean, selectedIndex: number, correctIndex: number) => {
    if (!r) return;
    onAnswered?.({ questionKey: `guard-${r.id}`, selectedIndex, correctIndex, wasCorrect: right });
    if (right) {
      audio.correct();
      fx.correct({ xp: 25, text: isInstall ? "GOOD CALL!" : "SAFE ROOM!" });
      onCorrect?.();
      setPhase("sealed");
      // Sarah: "That's right!" + the round's why, one take; the seal lands
      // under her, then the next round slides in.
      verdict.say("right", r.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const rw = roundWrongs + 1;
      setRoundWrongs(rw);
      // WrongAnswerPanel speaks "Not quite." + this explanation itself. Every
      // check stays lit, so the retry is one tap.
      setFeedback({ title: wrongTitle, explanation: r.whyWrong, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  // rooms: tap a panel's STAY HERE.
  const choosePanel = (panel: GuardPanel) => {
    if (!r || speaking || !allChecked) return;
    commit(panel.isSafe, r.panels.indexOf(panel), r.panels.findIndex((p) => p.isSafe));
  };
  // install: INSTALL (0) or NOT THIS ONE (1) on the single panel.
  const decide = (install: boolean) => {
    if (!r || speaking || !allChecked) return;
    const safe = !!panels[0]?.isSafe;
    commit(install === safe, install ? 0 : 1, safe ? 0 : 1);
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean) =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "gcGuide 1.4s ease-in-out infinite" }
      : {};
  const stripText = guided
    ? allChecked
      ? isInstall
        ? "Round 1: every guard is counted. Tap the glowing button to decide"
        : "Round 1: every guard is counted. Tap the glowing button to stay in that room"
      : "Round 1: tap the glowing guard to check it"
    : allChecked
      ? chooseText
      : slotHint;

  const renderPanel = (panel: GuardPanel) => {
    const done = panel.slots.every((s) => checked.has(slotKey(panel, s)));
    const sealed = phase === "sealed";
    const showSeal = sealed && (isInstall || panel.isSafe);
    return (
      <div
        key={panel.id}
        style={{
          position: "relative",
          flex: "1 1 280px",
          minWidth: 250,
          maxWidth: isInstall ? 460 : undefined,
          margin: isInstall ? "0 auto" : undefined,
          borderRadius: 18,
          background: "linear-gradient(180deg, rgba(18,24,58,0.92) 0%, rgba(10,14,36,0.94) 100%)",
          // Every panel the same rim, on every round: nothing here can hint.
          border: `1px solid ${accent}55`,
          boxShadow: `0 18px 40px -22px rgba(0,0,0,0.7), inset 0 0 0 1px ${accent}22`,
          padding: "12px 12px 14px",
          color: "#fff7e6",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {/* Title bar: the room / app name (identical chrome on both) */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
          <span style={{ width: 40, height: 40, borderRadius: isInstall ? 12 : "50%", display: "grid", placeItems: "center", background: `${accent}22`, border: `1px solid ${accent}66`, flexShrink: 0 }}>
            <PixIcon emoji={panel.icon ?? (isInstall ? "📱" : "💬")} size={26} />
          </span>
          <span style={{ minWidth: 0 }}>
            <span style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: accent }}>
              {isInstall ? "App" : "Chat room"}
            </span>
            <span style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 16, lineHeight: 1.2, wordBreak: "break-word" }}>{panel.title}</span>
          </span>
        </div>

        {/* Four identical guard slots: dark until tapped, then HERE or MISSING. */}
        {panel.slots.map((slot) => {
          const key = slotKey(panel, slot);
          const on = checked.has(key);
          const glow = guided && !speaking && !on && firstUnchecked === key;
          return (
            <motion.button
              key={key}
              type="button"
              aria-label={`${slot.label}${on ? `: ${slot.present ? presentWord : missingWord}` : ""}`}
              aria-pressed={on}
              onClick={() => checkSlot(panel, slot)}
              disabled={speaking || on}
              whileTap={speaking || on || reduce ? undefined : { scale: 0.97 }}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                minHeight: 54,
                padding: "8px 12px",
                borderRadius: 12,
                textAlign: "left",
                background: on ? (slot.present ? "rgba(52,211,153,0.16)" : "rgba(239,68,68,0.10)") : "rgba(255,255,255,0.06)",
                border: `2px solid ${on ? (slot.present ? "#34d399" : "rgba(255,95,95,0.55)") : glow ? accent : "rgba(255,255,255,0.16)"}`,
                color: on && !slot.present ? "#ffb4b4" : "#fff7e6",
                opacity: on && !slot.present ? 0.8 : 1,
                cursor: on ? "default" : speaking ? "wait" : "pointer",
                fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                transition: "background 220ms ease-out, border-color 220ms ease-out",
                ...guideStyle(glow),
              }}
            >
              <span style={{ flexShrink: 0, width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(255,255,255,0.07)" }}>
                <PixIcon emoji={SLOT_ICON} size={24} style={on && !slot.present ? { filter: "grayscale(1) opacity(0.45)" } : undefined} />
              </span>
              <span style={{ minWidth: 0, flex: 1, fontSize: 15, fontWeight: 700, lineHeight: 1.25 }}>{slot.label}</span>
              <AnimatePresence>
                {on && (
                  <motion.span
                    key="state"
                    aria-hidden
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 18 }}
                    style={{
                      flexShrink: 0,
                      padding: "3px 9px",
                      borderRadius: 999,
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      background: slot.present ? "#34d399" : "rgba(239,68,68,0.35)",
                      color: slot.present ? "#062019" : "#ffd6d6",
                      border: slot.present ? "none" : "1px solid rgba(255,95,95,0.6)",
                    }}
                  >
                    {slot.present ? presentWord : missingWord}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}

        {/* rooms: one identical STAY HERE per panel, only once EVERY guard everywhere is checked. */}
        {!isInstall && (
          <AnimatePresence>
            {allChecked && (
              <motion.div
                key="stay"
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: "flex", justifyContent: "center", marginTop: 6 }}
              >
                <div style={{ display: "inline-block", borderRadius: 16, ...guideStyle(guided && !speaking && panel.isSafe) }}>
                  <GameButton variant="primary" size="lg" icon="🚪" onClick={() => choosePanel(panel)} disabled={speaking} aria-label={`${stayLabel}: ${panel.title}`}>
                    {stayLabel}
                  </GameButton>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
        {done && !allChecked && !isInstall && (
          <div aria-hidden style={{ textAlign: "center", fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff", marginTop: 4 }}>
            Guards counted · check the other room
          </div>
        )}

        {/* The seal lands only after a right choice (never before). */}
        <AnimatePresence>
          {showSeal && (
            <motion.div
              key="seal"
              initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 1.8, rotate: -20 }}
              animate={{ opacity: 1, x: "-50%", scale: 1, rotate: -6 }}
              exit={{ opacity: 0, x: "-50%" }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
              style={{
                position: "absolute",
                left: "50%",
                top: 52,
                padding: "8px 16px",
                borderRadius: 10,
                border: `4px double ${panel.isSafe ? "#34d399" : "#ff5fb3"}`,
                color: panel.isSafe ? "#a0ffb0" : "#ff9bcb",
                background: "rgba(8,10,22,0.85)",
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 900,
                fontSize: 17,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                boxShadow: `0 0 18px ${panel.isSafe ? "rgba(52,211,153,0.5)" : "rgba(255,95,179,0.5)"}`,
                zIndex: 3,
              }}
            >
              {panel.isSafe ? (isInstall ? "✅ SAFE APP" : "✅ SAFE ROOM") : "🐾 NOT SAFE"}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <ExerciseFrame maxWidth={860} decor>
      {fx.layer()}
      {verdict.element}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={subtitle}
          icon={introIcon}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, each round, each guard. */}
      {!showIntro && !finished && r && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="gc-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`gc-read-${r.id}`} speaker={voice} lines={[r.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "slot" && slotLine && (
            <InfoNarration key={`gc-slot-${r.id}-${slotLine.key}`} speaker={voice} lines={[slotLine.text]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && r && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              🛡️ Guard Count
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              {thing} {Math.min(idx + 1, shown.length)} of {shown.length}
            </span>
          </div>

          {/* The prompt, in a speech bubble above the panels. */}
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, padding: "0 12px" }}>
            <div
              style={{
                position: "relative",
                maxWidth: 620,
                padding: "12px 18px",
                borderRadius: 16,
                background: `${accent}1a`,
                border: `1px solid ${accent}66`,
                color: "#fff7e6",
                fontSize: 16,
                fontWeight: 650,
                lineHeight: 1.4,
                textAlign: "center",
              }}
            >
              <span aria-hidden style={{ marginRight: 8, verticalAlign: "middle" }}>
                <PixIcon emoji="💬" size={20} />
              </span>
              {r.prompt}
            </div>
          </div>

          {/* rooms: two panels side by side (sides random per round). install: one card. */}
          <div style={{ display: "flex", gap: 14, alignItems: "stretch", flexWrap: "wrap", justifyContent: "center", padding: "0 12px" }}>
            {(isInstall ? panels.slice(0, 1) : panels).map(renderPanel)}
          </div>

          {/* install: two identical decision buttons, only once every guard is checked. */}
          {isInstall && (
            <AnimatePresence>
              {allChecked && (
                <motion.div
                  key="decide"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginTop: 14 }}
                >
                  <div style={{ display: "inline-block", borderRadius: 16, ...guideStyle(guided && !speaking && !!panels[0]?.isSafe) }}>
                    <GameButton variant="primary" size="lg" icon="⬇️" onClick={() => decide(true)} disabled={speaking} style={{ minWidth: 190 }}>
                      {installLabel}
                    </GameButton>
                  </div>
                  <div style={{ display: "inline-block", borderRadius: 16, ...guideStyle(guided && !speaking && !panels[0]?.isSafe) }}>
                    <GameButton variant="primary" size="lg" icon="✋" onClick={() => decide(false)} disabled={speaking} style={{ minWidth: 190 }}>
                      {refuseLabel}
                    </GameButton>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* On-board instructions: the current step, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16 }}>
              {stripText}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`@keyframes gcGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }`}</style>
        </div>
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
          title={completeTitle}
          stars={stars}
          statLines={[
            `${shown.length}/${shown.length} ${isInstall ? "apps" : "rooms"} checked, every guard counted`,
            completeLine ?? (isInstall ? "You only let in what has its guards." : "You only stay where the guards are."),
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
