"use client";

/**
 * ClueStamper — the MARK-A-SET-THEN-LOCK drill (Week 3, "The Clue Stamper").
 *
 * A friend request lands beside an open detective notebook that shows the
 * profile's FOUR clues in the fixed checking order every Learn screen teaches:
 * WHEN did it join, WHO are its friends, HOW does it talk, WHAT does it ask
 * for. Every clue is visible from the first frame; nothing is hidden. The
 * child taps a clue to slam a SNEAKY! stamp on it (tap again to lift it), then
 * taps CLOSE THE CASE to commit the whole set at once. Zero stamps is a legal,
 * sometimes correct, answer. The verdict (real friend / fake) is never picked
 * by the child: it is DERIVED from the clue set and lands on the card as a
 * seal, so the child sees that the clues decide the verdict.
 *
 * Why it is not the inspectors (owner 2026-09-12, "we never copy an
 * exercise"): no reveal-then-judge, no Real/Fake buttons, no single tap ever
 * commits an answer; a tap only annotates, is reversible, and the answer is a
 * SET locked once by a separate button.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the intro (`threat`),
 * Sarah speaks the how-to once as the board appears and reads every case
 * aloud (audio-only, `recordedOnly`, taps held), every lock gets a spoken
 * verdict with its reason (right: "That's right!" + rightWhy via the shared
 * VerdictVoice; wrong: "Not quite." + the first mismatched clue's teach line
 * via WrongAnswerPanel, which speaks itself), a wrong lock keeps every stamp
 * so the retry is a one-row fix, hint tiers escalate per case (tier 3 flips
 * the named row for the child), and the complete beat speaks the "you're
 * protected" payoff. Cases are shuffled per play; the four rows are the fixed
 * checking procedure and stay in place (same precedent as the inspectors'
 * zones). No colour, icon, side, order or count reveals anything before the
 * lock.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonWeek } from "@/app/components/lesson/LessonWeekContext";
import { weekCharacterSrc, fallbackToShared } from "@/app/lib/weekCharacters";
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
// she reads is already on screen), same recipe as PlaquePeek / ProfileInspector.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;

// A held gate can never stick: InfoNarration fires onDone on end / error /
// blocked / no-recording, but not when the master mute stops it, so every hold
// also releases on mute and after this max.
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export type ClueId = "when" | "who" | "how" | "what";

export interface ClueStamperClue {
  id: ClueId;
  /** The visible evidence, five words or fewer, e.g. "Joined: yesterday". */
  evidence: string;
  isRedFlag: boolean;
  /** Sarah's teach line when this row is mismatched at the lock. A red clue
   *  can only be MISSED (left clean); a clean clue can only be OVER-STAMPED,
   *  so one line per clue is exact in its only possible direction. */
  teach: string;
}

export interface ClueStamperCase {
  id: string;
  handle: string;
  /** PixIcon emoji for the avatar. */
  avatar: string;
  /** The one-line bio in the speech bubble. */
  pitch: string;
  /** Sarah's read-aloud as the case arrives: the pitch, then each row as
   *  "question? evidence." in WHEN/WHO/HOW/WHAT order. One clip per case. */
  readAloud: string;
  /** Exactly four, one per ClueId. Authored order does not matter. */
  clues: ClueStamperClue[];
  /** Sarah's reason on a correct lock ("That's right!" + rightWhy). */
  rightWhy: string;
}

export interface ClueStamperProps {
  cases: ClueStamperCase[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Text on the red rubber stamp. Default "SNEAKY!". */
  stampLabel?: string;
  /** Text on the commit button. Default "CLOSE THE CASE". */
  closeLabel?: string;
  /** Verdict seals landed on the card after a correct lock. */
  realSeal?: string;
  fakeSeal?: string;
  /** fx.correct toasts. */
  realToast?: string;
  fakeToast?: string;
  /** WrongAnswerPanel title. */
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier1: string; tier2: string; tier3?: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** The how-to, spoken once as the board appears (audio only; its gist is
   *  also printed in the board's action strip). */
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

/** The fixed checking procedure: the same four questions, icons and order on
 *  every case (and every week that reuses the engine). Not content. */
const CLUE_ROWS: { id: ClueId; icon: string; label: string }[] = [
  { id: "when", icon: "🆔", label: "WHEN did it join?" },
  { id: "who", icon: "👪", label: "WHO are its friends?" },
  { id: "how", icon: "💬", label: "HOW does it talk?" },
  { id: "what", icon: "❓", label: "WHAT does it ask for?" },
];
const BIT: Record<ClueId, number> = { when: 1, who: 2, how: 4, what: 8 };
const mask = (ids: Iterable<ClueId>) => { let m = 0; for (const id of ids) m |= BIT[id]; return m; };

const DEFAULT_TIER3 = "Let me help. I fixed that one clue for you. Now close the case.";

export default function ClueStamper({
  cases,
  introTitle = "The Clue Stamper",
  introSubtitle = "Stamp the sneaky clues, then close the case.",
  introIcon = "🔍",
  stampLabel = "SNEAKY!",
  closeLabel = "CLOSE THE CASE",
  realSeal = "REAL FRIEND",
  fakeSeal = "FAKE!",
  realToast = "CASE CLOSED: REAL FRIEND!",
  fakeToast = "CASE CLOSED: FAKE!",
  wrongTitle = "Check your stamps again!",
  completeTitle = "Every case closed!",
  completeLine = "Fakes unmasked, real friends welcomed.",
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
}: ClueStamperProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const week = useLessonWeek();
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key (the
  // intro / how-to / complete blocks keep their own authored speaker).
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [stamped, setStamped] = useState<Set<ClueId>>(() => new Set());
  // Read-aloud chain: the how-to once as the board appears, then each case as
  // it arrives. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "sealed" = a correct lock: the seal and the mask-off reveal are playing
  // while Sarah says why, then the next case slides in.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [caseWrongs, setCaseWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [fakesCaught, setFakesCaught] = useState(0);
  // The row Sarah named on the last wrong lock: tier 2 wobbles it after the
  // panel closes, tier 3 flips it for the child.
  const [pendingFix, setPendingFix] = useState<ClueId | null>(null);
  const [wobble, setWobble] = useState<{ id: ClueId; key: number } | null>(null);

  // Anti-sequence: the cases come up in a random order every play (the
  // authored list is 4 / 0 / 3 / 1 sneaky clues, a giveaway in order). The
  // four rows are the fixed checking procedure and stay in place.
  const shownCases = useShuffledOnce(cases);
  const finished = idx >= shownCases.length;
  const c = shownCases[idx];
  const rows = useMemo(
    () => CLUE_ROWS.map((r) => ({ ...r, clue: c?.clues.find((x) => x.id === r.id) })),
    [c],
  );
  const wantIds = useMemo(() => new Set((c?.clues ?? []).filter((x) => x.isRedFlag).map((x) => x.id)), [c]);
  const isFake = wantIds.size > 0;

  // Spoken verdicts (owner 2026-09-12): Sarah says "That's right!" + why and
  // the next case waits for her. Wrong locks speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || phase === "sealed";

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
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setIdx((i) => i + 1);
    setStamped(new Set());
    setCaseWrongs(0);
    setPendingFix(null);
    setWobble(null);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const toggleStamp = (id: ClueId) => {
    if (!c || speaking) return;
    audio.tap();
    setStamped((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (id === pendingFix) setPendingFix(null);
  };

  const closeCase = () => {
    if (!c || speaking) return;
    const match = stamped.size === wantIds.size && [...stamped].every((id) => wantIds.has(id));
    onAnswered?.({
      questionKey: `case-${c.id}`,
      selectedIndex: mask(stamped),
      correctIndex: mask(wantIds),
      wasCorrect: match,
    });
    if (match) {
      audio.correct();
      fx.correct({ xp: 25, text: isFake ? fakeToast : realToast });
      onCorrect?.();
      if (isFake) setFakesCaught((n) => n + 1);
      setPhase("sealed");
      // Sarah: "That's right!" + the case's why; the seal and the mask-off
      // reveal play under her, then the next case slides in.
      verdict.say("right", c.rightWhy, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const cw = caseWrongs + 1;
      setCaseWrongs(cw);
      // The first mismatched row in the fixed WHEN/WHO/HOW/WHAT order is the
      // one Sarah teaches: a red clue left clean, or a clean clue stamped.
      const mis = rows.find((r) => stamped.has(r.id) !== !!r.clue?.isRedFlag);
      setPendingFix(mis?.id ?? null);
      const tip = cw >= 3 ? (hints?.tier3 ?? DEFAULT_TIER3) : cw === 2 ? hints?.tier2 : hints?.tier1;
      // WrongAnswerPanel speaks "Not quite." + this teach line itself.
      setFeedback({ title: wrongTitle, explanation: mis?.clue?.teach ?? "", tip });
    }
  };

  // After the teach panel closes: tier 2 wobbles the named row so the child
  // can find it; tier 3 flips it for them (Layla's assist) so nobody is stuck.
  const closePanel = () => {
    setFeedback(null);
    if (!pendingFix) return;
    if (caseWrongs >= 3) {
      const fix = pendingFix;
      setStamped((prev) => {
        const next = new Set(prev);
        if (next.has(fix)) next.delete(fix);
        else next.add(fix);
        return next;
      });
      setPendingFix(null);
      onHintReached?.(3);
    } else if (caseWrongs >= 2) {
      setWobble({ id: pendingFix, key: Date.now() });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = caseWrongs >= 3 ? (hints?.tier3 ?? DEFAULT_TIER3) : caseWrongs === 2 ? hints?.tier2 : caseWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (caseWrongs >= 3 ? 3 : caseWrongs === 2 ? 2 : 1) as 1 | 2 | 3;

  return (
    <ExerciseFrame maxWidth={820} decor>
      {fx.layer()}
      {verdict.element}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle}
          subtitle={introSubtitle}
          icon={introIcon}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then each case. */}
      {!showIntro && !finished && c && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="cs-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent="#e3b341" recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`cs-read-${c.id}`} speaker={voice} lines={[c.readAloud]} accent="#e3b341" recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && c && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Case folder tabs: plain while open; a seal only after a correct lock. */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12, flexWrap: "wrap" }}>
            {shownCases.map((k, i) => {
              const closed = i < idx;
              const open = i === idx;
              const kFake = k.clues.some((x) => x.isRedFlag);
              return (
                <div
                  key={k.id}
                  aria-hidden
                  style={{
                    padding: "6px 12px",
                    borderRadius: "10px 10px 4px 4px",
                    fontFamily: "'Space Grotesk', sans-serif",
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    background: open ? "linear-gradient(180deg, #f0dcae, #d7bc84)" : "linear-gradient(180deg, #b89a64, #96793f)",
                    color: open ? "#3a2a08" : "#f6ecd2",
                    border: `1px solid ${open ? "#b8945a" : "#7a6130"}`,
                    boxShadow: open ? "0 4px 12px rgba(0,0,0,0.35)" : "none",
                    opacity: closed || open ? 1 : 0.7,
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  Case {i + 1}
                  {closed && <span style={{ fontSize: 13 }}>{kFake ? "🐾" : "✅"}</span>}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
            {/* The friend-request card */}
            <div
              style={{
                position: "relative",
                flex: "1 1 260px",
                minWidth: 240,
                borderRadius: 18,
                background: "linear-gradient(180deg, rgba(18,24,58,0.92) 0%, rgba(10,14,36,0.94) 100%)",
                border: "1px solid rgba(227,179,65,0.45)",
                boxShadow: "0 18px 40px -22px rgba(0,0,0,0.7)",
                padding: "16px 16px 18px",
                color: "#fff7e6",
                overflow: "hidden",
              }}
            >
              {/* A chip in its own row (was a rotated corner ribbon, which the
                  card's overflow clipped and which ran over long handles such
                  as SkaterKid_Max: UAT round 2, W3 item 3b). */}
              <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 8 }}>
                <span style={{ background: "#e3b341", color: "#2a1a08", fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", padding: "4px 10px", borderRadius: 999, textTransform: "uppercase" }}>
                  Friend request
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
                  <motion.div
                    animate={phase === "sealed" && isFake && !reduce ? { scale: 0.55, opacity: 0.25, rotate: -18 } : { scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 220, damping: 18 }}
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: "50%",
                      display: "grid",
                      placeItems: "center",
                      background: "radial-gradient(circle at 50% 32%, #46508a 0%, #1a2150 70%)",
                      border: "2px solid rgba(227,179,65,0.6)",
                    }}
                  >
                    <PixIcon emoji={c.avatar} size={46} />
                  </motion.div>
                  {/* Mask-off reward: the Raccoon pops out from behind a fake's avatar after a correct lock. */}
                  <AnimatePresence>
                    {phase === "sealed" && isFake && (
                      <motion.img
                        key="raccoon"
                        src={weekCharacterSrc(week ?? undefined, "raccoon", "taunt")}
                        onError={fallbackToShared("raccoon", "taunt")}
                        alt=""
                        aria-hidden
                        initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.4, y: 24 }}
                        animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 16 }}
                        style={{ position: "absolute", left: -18, top: -30, height: 118, objectFit: "contain", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.6))", pointerEvents: "none" }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: "0.01em", wordBreak: "break-word" }}>{c.handle}</div>
                  <div style={{ fontSize: 12, color: "#c9b8ff", marginTop: 2 }}>wants to be your friend</div>
                </div>
              </div>
              <div
                style={{
                  position: "relative",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "10px 12px",
                  fontSize: 15,
                  fontWeight: 650,
                  lineHeight: 1.35,
                  color: "#fff7e6",
                }}
              >
                <span aria-hidden style={{ marginRight: 6 }}>💬</span>
                {c.pitch}
              </div>
              {/* The verdict seal lands only after a correct lock (never before). */}
              <AnimatePresence>
                {phase === "sealed" && (
                  <motion.div
                    key="seal"
                    // Centring lives in the motion values (x), not a CSS transform:
                    // motion owns `transform`, so a CSS translateX would be dropped
                    // and the seal would hang off the card's right edge.
                    initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 1.8, rotate: -20 }}
                    animate={{ opacity: 1, x: "-50%", scale: 1, rotate: -8 }}
                    exit={{ opacity: 0, x: "-50%" }}
                    transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 14,
                      padding: "8px 16px",
                      borderRadius: 10,
                      border: `4px double ${isFake ? "#ff5fb3" : "#34d399"}`,
                      color: isFake ? "#ff9bcb" : "#a0ffb0",
                      background: "rgba(8,10,22,0.78)",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 900,
                      fontSize: 18,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                      boxShadow: `0 0 18px ${isFake ? "rgba(255,95,179,0.5)" : "rgba(52,211,153,0.5)"}`,
                    }}
                  >
                    {isFake ? "🐾 " : "✅ "}
                    {isFake ? fakeSeal : realSeal}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The detective notebook: four identical rows, fixed order, nothing hidden. */}
            <div
              style={{
                flex: "2 1 380px",
                minWidth: 280,
                borderRadius: 18,
                background: "linear-gradient(180deg, #f7efd8 0%, #ecdfbd 100%)",
                border: "1px solid #b8945a",
                boxShadow: "inset 0 0 0 6px rgba(184,148,90,0.18), 0 18px 40px -22px rgba(0,0,0,0.7)",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8a5a12", textAlign: "center", marginBottom: 2 }}>
                Detective notebook
              </div>
              {rows.map((r) => {
                const on = stamped.has(r.id);
                const sealed = phase === "sealed";
                const red = !!r.clue?.isRedFlag;
                const isWobbling = wobble?.id === r.id;
                return (
                  <motion.button
                    key={r.id}
                    type="button"
                    aria-label={`${r.label} ${r.clue?.evidence ?? ""}${on ? `, stamped ${stampLabel}` : ""}`}
                    aria-pressed={on}
                    onClick={() => toggleStamp(r.id)}
                    disabled={speaking}
                    animate={isWobbling && !reduce ? { x: [0, -8, 8, -6, 6, 0] } : { x: 0 }}
                    transition={{ duration: 0.4 }}
                    whileTap={speaking || reduce ? undefined : { scale: 0.98 }}
                    style={{
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      minHeight: 56,
                      width: "100%",
                      textAlign: "left",
                      padding: "8px 12px",
                      borderRadius: 12,
                      // Every row the same paper, the same border, the same ink, on
                      // every case: nothing here can hint at the answer.
                      background: "#fffaf0",
                      border: "2px solid rgba(138,90,18,0.35)",
                      color: "#2a1a08",
                      cursor: speaking ? "wait" : "pointer",
                      opacity: speaking && !sealed ? 0.85 : 1,
                      fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                    }}
                  >
                    <span style={{ flexShrink: 0, width: 40, height: 40, borderRadius: 10, display: "grid", placeItems: "center", background: "rgba(184,148,90,0.18)" }}>
                      <PixIcon emoji={r.icon} size={28} />
                    </span>
                    <span style={{ minWidth: 0, flex: 1 }}>
                      <span style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 900, letterSpacing: "0.06em", color: "#8a5a12" }}>{r.label}</span>
                      <span style={{ display: "block", fontSize: 16, fontWeight: 700, lineHeight: 1.25 }}>{r.clue?.evidence ?? ""}</span>
                    </span>
                    {/* Post-commit only: the per-clue why (paw on a sneaky row, tick on a clean one). */}
                    {sealed && (
                      <span aria-hidden style={{ fontSize: 20, flexShrink: 0 }}>{red ? "🐾" : "✅"}</span>
                    )}
                    {/* The child's own stamp: identical red on whichever row they tap. */}
                    <AnimatePresence>
                      {on && (
                        <motion.span
                          key="stamp"
                          aria-hidden
                          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.6, rotate: -14 }}
                          animate={{ opacity: 1, scale: 1, rotate: -8 }}
                          exit={{ opacity: 0, transition: { duration: 0.12 } }}
                          transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 420, damping: 16 }}
                          style={{
                            position: "absolute",
                            right: sealed ? 44 : 14,
                            top: "50%",
                            marginTop: -16,
                            padding: "4px 10px",
                            border: "3px solid #d5262e",
                            borderRadius: 6,
                            color: "#d5262e",
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: 900,
                            fontSize: 15,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            background: "rgba(255,255,255,0.55)",
                            mixBlendMode: "multiply",
                            pointerEvents: "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {stampLabel}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* On-board instructions + the one commit button (always enabled once Sarah is done, even with zero stamps). */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#e3b341", marginBottom: 10 }}>
              Read all four · tap a sneaky clue to stamp it · tap again to lift it · then close the case
            </div>
            <GameButton variant="primary" size="lg" icon="📌" onClick={closeCase} disabled={speaking}>
              {closeLabel}
            </GameButton>
            <div style={{ marginTop: 8, fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Case {Math.min(idx + 1, shownCases.length)} of {shownCases.length}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>
        </div>
      )}

      {feedback && (
        <WrongAnswerPanel
          title={feedback.title}
          explanation={feedback.explanation}
          tip={feedback.tip}
          onContinue={closePanel}
        />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[`${shownCases.length}/${shownCases.length} cases closed`, `${fakesCaught} fake${fakesCaught === 1 ? "" : "s"} unmasked`, completeLine]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
