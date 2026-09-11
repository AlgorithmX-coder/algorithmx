"use client";

/**
 * PlaquePeek — the lift-then-judge INSPECT drill.
 *
 * Skin "door" (Week 16): one link-door at a time floats in wearing a shiny
 * plaque that CLAIMS a destination. The child lifts the plaque (a mandatory,
 * penalty-free peek) to reveal the real address underneath, then makes the
 * call: does the door go where it says, or is it a sneaky door?
 *
 * Skin "mask" (Week 3, "The Mask Peek"): a new online "friend" arrives
 * wearing a claim ("I'm 9 too!", "Here's my photo!"). The child peeks behind
 * the mask to see what that claim actually PROVES about who is typing, then
 * calls it: real proof, or proves nothing. The forced peek is the lesson -
 * you can't see who's typing, so you judge the proof, never the mask.
 *
 * Wrong calls teach gently and allow another go. Distinct from clueBoard
 * (many clues, one verdict) and the zone inspectors (zones on one artefact):
 * this is a two-step lift-then-judge rhythm repeated per card.
 *
 * Learn-Loop wiring (owner standards, 2026-09-11): the Raccoon's boast folds
 * into the intro (`threat`), Sarah reads every beat aloud - the how-to once as
 * the board appears, each claim as it arrives, each reveal as it lifts
 * (audio-only, `recordedOnly` so un-recorded weeks stay silent) - taps are
 * held while she speaks, the board carries a visible action strip, and the
 * complete beat speaks the "you're protected" payoff (`completeNarration`).
 * Cards are shuffled per play (never the authored order).
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as RequestInspector / SignBingo.
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
const SPOKEN_GATE_MAX_MS = 15000;

export type PlaquePeekSkin = "door" | "mask";

export interface PeekDoor {
  id: string;
  /** The shiny plaque's claim, e.g. "FREE GAME COINS!" / "I'm 9 too!" */
  claim: string;
  /** Emoji rendered via PixIcon on the plaque (mask skin: the friend's avatar). */
  icon: string;
  /** The real address revealed under the plaque (mask skin: what the claim proves). */
  address: string;
  /** True = the address matches the claim (an honest door / real proof). */
  matches: boolean;
  /** Teach copy shown on a wrong verdict for this door. */
  note: string;
  /** Mask skin: the "friend's" display name shown on the card. */
  name?: string;
}

export interface PlaquePeekProps {
  doors: PeekDoor[];
  /** Visual skin: W16 link doors (default) or W3 masked friends. */
  skin?: PlaquePeekSkin;
  /** Copy overrides (defaults keep the W16 doorway skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Pulsing label on the unlifted plaque. */
  peekPrompt?: string;
  /** Eyebrow above the revealed text ("THE REAL ADDRESS"). */
  revealLabel?: string;
  matchLabel?: string;
  sneakyLabel?: string;
  matchToast?: string;
  sneakyToast?: string;
  wrongTitle?: string;
  completeTitle?: string;
  completeLine?: string;
  /** Noun for the progress line ("DOOR 2 OF 6"). */
  cardNoun?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken "you're protected" payoff on the complete screen. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
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

const SKINS = {
  door: {
    accent: "#c084fc",
    frameMax: 820,
    cardBg: "linear-gradient(180deg, #2b1d55 0%, #3d2a6e 55%, #2b1d55 100%)",
    cardBorder: "rgba(192,132,252,0.55)",
    cardShadow: "0 22px 48px -20px rgba(192,132,252,0.65)",
    cardRadius: "26px 26px 14px 14px",
    claimBg: "linear-gradient(165deg, rgba(255,209,88,0.2), rgba(255,209,88,0.08))",
    claimBorder: "rgba(255,209,88,0.5)",
    claimColor: "#ffe9ad",
    peekPrompt: "LIFT THE PLAQUE - READ THE REAL ADDRESS",
    revealLabel: "THE REAL ADDRESS",
    matchLabel: "GOES WHERE IT SAYS",
    sneakyLabel: "SNEAKY DOOR!",
    matchToast: "HONEST DOOR!",
    sneakyToast: "SNEAKY DOOR CAUGHT!",
    wrongTitle: "Read the plaque again!",
    completeTitle: "Every plaque peeked!",
    completeLine: "You never judged a door by its paint - only by its address.",
    cardNoun: "DOOR",
    introTitle: "The Address Peephole",
    introSubtitle: "Every door wears a shiny sign - but the truth lives on the little plaque underneath. Lift it, read it, make the call.",
    introIcon: "🚪",
    matchIcon: "✅",
    sneakyIcon: "🚫",
  },
  mask: {
    accent: "#f5a623",
    frameMax: 820,
    cardBg: "linear-gradient(180deg, #1d1a3a 0%, #2a2452 60%, #1d1a3a 100%)",
    cardBorder: "rgba(245,166,35,0.6)",
    cardShadow: "0 22px 48px -20px rgba(245,166,35,0.55)",
    cardRadius: 22,
    claimBg: "linear-gradient(165deg, rgba(255,255,255,0.14), rgba(255,255,255,0.06))",
    claimBorder: "rgba(255,255,255,0.35)",
    claimColor: "#fff7e6",
    peekPrompt: "PEEK BEHIND THE MASK",
    revealLabel: "WHAT IT REALLY PROVES",
    matchLabel: "REAL PROOF",
    sneakyLabel: "PROVES NOTHING",
    matchToast: "REAL PROOF!",
    sneakyToast: "MASK SPOTTED!",
    wrongTitle: "Look behind the mask again!",
    completeTitle: "Every mask peeked!",
    completeLine: "You judged the proof, never the mask.",
    cardNoun: "FRIEND",
    introTitle: "The Mask Peek",
    introSubtitle: "New friends are arriving, each one wearing a claim. Peek behind the mask, then decide: real proof, or proves nothing?",
    introIcon: "🎭",
    matchIcon: "🔍",
    sneakyIcon: "🎭",
  },
} as const;

export default function PlaquePeek({
  doors,
  skin = "door",
  introTitle,
  introSubtitle,
  introIcon,
  peekPrompt,
  revealLabel,
  matchLabel,
  sneakyLabel,
  matchToast,
  sneakyToast,
  wrongTitle,
  completeTitle,
  completeLine,
  cardNoun,
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
}: PlaquePeekProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const sk = SKINS[skin];
  const mask = skin === "mask";
  const voice = introNarration?.speaker ?? "adam";

  const [showIntro, setShowIntro] = useState(true);
  const [doorIdx, setDoorIdx] = useState(0);
  const [peeked, setPeeked] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [wrongOnCurrent, setWrongOnCurrent] = useState(false);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [hasInteracted, setHasInteracted] = useState(false);
  // Read-aloud chain (mask skin): Sarah's how-to once as the board appears,
  // then each card's claim as it arrives, then the reveal as it lifts. Taps
  // are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "claim" | "reveal" | "idle">("idle");

  // Anti-sequence: the doors come up in a random order every play (authored
  // lists alternate honest/sneaky). The two verdict buttons keep their sides.
  const shownDoors = useShuffledOnce(doors);
  const finished = doorIdx >= shownDoors.length;
  const door = shownDoors[doorIdx];
  const chain = mask;
  const speaking = chain && narr !== "idle";

  // Kick the chain when the board appears / a new card arrives.
  useEffect(() => {
    if (!chain || showIntro || finished || !door) return;
    if (isAudioMuted()) { setNarr("idle"); return; }
    setNarr(doorIdx === 0 && coachLines ? "howto" : "claim");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain, showIntro, doorIdx, finished]);

  // Safety releases for the spoken gate (see SPOKEN_GATE_MAX_MS).
  useEffect(() => {
    if (!speaking) return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [speaking, narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  const reportedTier = useRef(0);
  const reportTier = (n: number) => {
    const tier = n >= 2 ? 2 : n >= 1 ? 1 : 0;
    if (tier > reportedTier.current) {
      reportedTier.current = tier;
      onHintReached?.(tier as 1 | 2);
    }
  };

  const lift = () => {
    if (!door || showIntro || peeked || finished || speaking) return;
    setHasInteracted(true);
    audio.hover();
    setPeeked(true);
    if (chain && !isAudioMuted()) setNarr("reveal");
  };

  // verdictIdx: 0 = "goes where it says" / real proof, 1 = sneaky / proves nothing
  const call = (verdictIdx: number) => {
    if (!door || !peeked || feedback || finished || speaking) return;
    const wasCorrect = (verdictIdx === 0) === door.matches;
    onAnswered?.({
      questionKey: `door-${door.id}`,
      selectedIndex: verdictIdx,
      correctIndex: door.matches ? 0 : 1,
      wasCorrect,
    });
    if (wasCorrect) {
      audio.correct();
      fx.correct({
        xp: 25,
        text: door.matches ? (matchToast ?? sk.matchToast) : (sneakyToast ?? sk.sneakyToast),
      });
      onCorrect?.();
      if (!wrongOnCurrent) setFirstTryCount((n) => n + 1);
      setWrongOnCurrent(false);
      // Let the toast land before the next card slides in.
      window.setTimeout(() => {
        setPeeked(false);
        setDoorIdx((i) => i + 1);
      }, reduce ? 300 : 900);
    } else {
      audio.wrong();
      onWrong?.();
      setWrongOnCurrent(true);
      setWrongCount((c) => {
        const v = c + 1;
        reportTier(v);
        return v;
      });
      setFeedback({
        title: wrongTitle ?? sk.wrongTitle,
        explanation: door.note,
        tip: hints?.tier1,
      });
    }
  };

  const stars = wrongCount === 0 ? 3 : wrongCount <= 2 ? 2 : 1;
  const noun = cardNoun ?? sk.cardNoun;

  return (
    <ExerciseFrame maxWidth={sk.frameMax} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? sk.introTitle}
          subtitle={introSubtitle ?? sk.introSubtitle}
          icon={introIcon ?? sk.introIcon}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          // Wide frame: a threat-less intro would render as an empty box.
          overlay={mask}
          onDismiss={() => setShowIntro(false)}
        />
      )}

      {/* Sarah's read-aloud chain (audio only; taps held while she speaks). */}
      {chain && !showIntro && door && !finished && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="pp-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={sk.accent} recordedOnly onDone={() => setNarr("claim")} />
          )}
          {narr === "claim" && (
            <InfoNarration key={`pp-claim-${door.id}`} speaker={voice} lines={[door.claim]} accent={sk.accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "reveal" && (
            <InfoNarration key={`pp-reveal-${door.id}`} speaker={voice} lines={[door.address]} accent={sk.accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {/* Progress row */}
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 14 }}>
        {shownDoors.map((d, i) => (
          <div
            key={d.id}
            style={{
              width: mask ? 30 : 26,
              height: mask ? 30 : 34,
              borderRadius: mask ? "50%" : "10px 10px 4px 4px",
              border: i < doorIdx ? `2px solid ${mask ? sk.accent : "#ffd158"}` : i === doorIdx ? `2px dashed ${sk.accent}` : "2px dashed rgba(125,140,201,0.4)",
              background: i < doorIdx ? (mask ? "linear-gradient(180deg, #ffe0a3, #f5a623)" : "linear-gradient(180deg, #ffe9ad, #e8a413)") : "rgba(255,255,255,0.05)",
              boxShadow: i < doorIdx ? `0 0 14px -2px ${mask ? "rgba(245,166,35,0.8)" : "rgba(255,209,88,0.8)"}` : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 900,
              color: i < doorIdx ? "#3a2a08" : i === doorIdx ? sk.accent : "rgba(125,140,201,0.7)",
            }}
          >
            {i < doorIdx ? "✓" : i + 1}
          </div>
        ))}
      </div>

      {door && !finished && (
        <AnimatePresence mode="wait">
          <motion.div
            key={door.id}
            initial={reduce ? false : { x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -40, opacity: 0 }}
          >
            {/* The door / friend card */}
            <div
              style={{
                maxWidth: mask ? 520 : 460,
                margin: "0 auto",
                padding: mask ? "18px 20px 18px" : "22px 20px 18px",
                borderRadius: sk.cardRadius,
                background: sk.cardBg,
                border: `2.5px solid ${sk.cardBorder}`,
                boxShadow: sk.cardShadow,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
                position: "relative",
              }}
            >
              {!mask && (
                /* doorknob */
                <span
                  aria-hidden
                  style={{
                    position: "absolute",
                    right: 16,
                    top: "48%",
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: "linear-gradient(145deg, #ffe9ad, #e8a413)",
                    boxShadow: "0 0 10px rgba(255,209,88,0.7)",
                  }}
                />
              )}

              {mask && (
                /* friend header: masked avatar + name + FRIEND REQUEST chip */
                <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ position: "relative", display: "inline-flex", padding: 8, borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: `2px solid ${peeked ? sk.accent : "rgba(255,255,255,0.35)"}`, transition: "border-color 0.4s" }}>
                    <PixIcon emoji={door.icon} size={40} />
                    <motion.span
                      aria-hidden
                      animate={peeked ? { y: -14, rotate: -18, opacity: 0.35 } : { y: 0, rotate: 0, opacity: 1 }}
                      transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 200, damping: 16 }}
                      style={{ position: "absolute", right: -8, bottom: -8, display: "inline-flex", padding: 3, borderRadius: "50%", background: "#1d1a3a", border: `1.5px solid ${sk.accent}` }}
                    >
                      <PixIcon emoji="🎭" size={20} />
                    </motion.span>
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 17, fontWeight: 900, color: "#fff7e6" }}>{door.name ?? "New friend"}</div>
                    <div style={{ fontSize: 12, fontWeight: 800, color: "#c9b8ff", letterSpacing: "0.04em" }}>wants to be your friend</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: "0.07em", color: sk.accent, padding: "3px 9px", borderRadius: 999, border: `1px solid ${sk.accent}66`, whiteSpace: "nowrap" }}>
                    FRIEND REQUEST
                  </span>
                </div>
              )}

              {/* The shiny sign (the claim) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: mask ? "12px 18px" : "10px 18px",
                  borderRadius: mask ? "16px 16px 16px 4px" : 12,
                  alignSelf: mask ? "stretch" : "auto",
                  background: sk.claimBg,
                  border: `1.5px solid ${sk.claimBorder}`,
                  color: sk.claimColor,
                  fontSize: 16.5,
                  fontWeight: 900,
                  textAlign: mask ? "left" : "center",
                  lineHeight: 1.35,
                }}
              >
                {!mask && <PixIcon emoji={door.icon} size={30} />}
                {mask && <PixIcon emoji="💬" size={24} />}
                <span style={{ flex: 1 }}>{door.claim}</span>
              </div>

              {/* The plaque / peephole */}
              {!peeked ? (
                <motion.button
                  type="button"
                  onClick={lift}
                  onPointerEnter={() => audio.hover()}
                  disabled={speaking}
                  animate={reduce || speaking ? undefined : { y: [0, -3, 0] }}
                  transition={reduce ? undefined : { duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    borderRadius: 12,
                    border: `2px dashed ${mask ? sk.accent : "rgba(125,240,255,0.55)"}`,
                    background: mask ? "rgba(245,166,35,0.1)" : "rgba(0,229,255,0.08)",
                    color: mask ? "#ffd58a" : "#7df0ff",
                    fontSize: 13.5,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    fontFamily: "inherit",
                    cursor: speaking ? "wait" : "pointer",
                    opacity: speaking ? 0.7 : 1,
                    touchAction: "manipulation",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {mask ? <PixIcon emoji="🎭" size={20} /> : <span aria-hidden>👆</span>}
                  {peekPrompt ?? sk.peekPrompt}
                </motion.button>
              ) : (
                <motion.div
                  initial={reduce ? false : { rotateX: -80, opacity: 0 }}
                  animate={{ rotateX: 0, opacity: 1 }}
                  transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 160, damping: 18 }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    borderRadius: 12,
                    background: mask ? "linear-gradient(180deg, #fff7e6, #ffe6b8)" : "linear-gradient(180deg, #f5f9ff, #dde9fb)",
                    border: `2px solid ${mask ? sk.accent : "rgba(125,240,255,0.6)"}`,
                    color: mask ? "#3a2a08" : "#1e2a52",
                    textAlign: "center",
                  }}
                >
                  <div style={{ fontSize: 10.5, fontWeight: 900, letterSpacing: "0.14em", color: mask ? "#9a6410" : "#5a6da8", marginBottom: 4 }}>
                    {revealLabel ?? sk.revealLabel}
                  </div>
                  <div style={{ fontSize: 15.5, fontWeight: 900, lineHeight: 1.35, overflowWrap: "anywhere" }}>
                    {door.address}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Verdict buttons */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12, maxWidth: 560, margin: "16px auto 0" }}>
              <motion.button
                type="button"
                onClick={() => call(0)}
                onPointerEnter={() => audio.hover()}
                disabled={!peeked || !!feedback || speaking}
                whileHover={reduce || !peeked ? undefined : { y: -3 }}
                whileTap={peeked ? { scale: 0.96 } : undefined}
                style={{
                  padding: "16px 12px",
                  borderRadius: 14,
                  border: "2px solid rgba(126,255,151,0.55)",
                  background: peeked ? "linear-gradient(165deg, rgba(126,255,151,0.14), rgba(12,18,48,0.92))" : "rgba(255,255,255,0.04)",
                  color: peeked ? "#b9ffc9" : "rgba(185,255,201,0.35)",
                  fontSize: 14.5,
                  fontWeight: 900,
                  fontFamily: "inherit",
                  cursor: peeked && !speaking ? "pointer" : "not-allowed",
                  touchAction: "manipulation",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {mask ? <PixIcon emoji={sk.matchIcon} size={20} /> : <span aria-hidden>✅</span>} {matchLabel ?? sk.matchLabel}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => call(1)}
                onPointerEnter={() => audio.hover()}
                disabled={!peeked || !!feedback || speaking}
                whileHover={reduce || !peeked ? undefined : { y: -3 }}
                whileTap={peeked ? { scale: 0.96 } : undefined}
                style={{
                  padding: "16px 12px",
                  borderRadius: 14,
                  border: "2px solid rgba(255,95,179,0.55)",
                  background: peeked ? "linear-gradient(165deg, rgba(255,95,179,0.14), rgba(12,18,48,0.92))" : "rgba(255,255,255,0.04)",
                  color: peeked ? "#ffc9e3" : "rgba(255,201,227,0.35)",
                  fontSize: 14.5,
                  fontWeight: 900,
                  fontFamily: "inherit",
                  cursor: peeked && !speaking ? "pointer" : "not-allowed",
                  touchAction: "manipulation",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {mask ? <PixIcon emoji={sk.sneakyIcon} size={20} /> : <span aria-hidden>🚫</span>} {sneakyLabel ?? sk.sneakyLabel}
              </motion.button>
            </div>

            {/* On-board action strip (mask skin): says what to do right now. */}
            {mask && (
              <div
                role="status"
                style={{
                  maxWidth: 560,
                  margin: "12px auto 0",
                  display: "flex",
                  justifyContent: "center",
                  gap: 8,
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                <span style={{ padding: "6px 12px", borderRadius: 999, border: `1.5px solid ${!peeked ? sk.accent : "rgba(125,140,201,0.35)"}`, background: !peeked ? "rgba(245,166,35,0.14)" : "transparent", color: !peeked ? "#ffd58a" : "rgba(125,140,201,0.8)" }}>
                  1 · Peek behind the mask
                </span>
                <span style={{ padding: "6px 12px", borderRadius: 999, border: `1.5px solid ${peeked ? sk.accent : "rgba(125,140,201,0.35)"}`, background: peeked ? "rgba(245,166,35,0.14)" : "transparent", color: peeked ? "#ffd58a" : "rgba(125,140,201,0.8)" }}>
                  2 · Real proof, or proves nothing?
                </span>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 12, fontSize: 12, fontWeight: 800, color: "#7d8cc9", letterSpacing: "0.1em" }}>
              {noun} {Math.min(doorIdx + 1, shownDoors.length)} OF {shownDoors.length}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
        {wrongCount === 1 && hints && <HintBubble tier={1} speaker={voice} text={hints.tier1} />}
        {wrongCount >= 2 && hints && <HintBubble tier={2} speaker={voice} text={hints.tier2} />}
      </div>

      {/* Door skin keeps the legacy caption coach; the mask skin speaks its
          how-to inside the read-aloud chain above (one voice at a time). */}
      {!chain && coachLines && !showIntro && !hasInteracted && !finished && (
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
          title={completeTitle ?? sk.completeTitle}
          stars={stars}
          statLines={[
            `${firstTryCount}/${shownDoors.length} ${noun.toLowerCase()}s called right first try`,
            completeLine ?? sk.completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(firstTryCount)}
        />
      )}
    </ExerciseFrame>
  );
}
