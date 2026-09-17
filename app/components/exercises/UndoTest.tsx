"use client";

/**
 * UndoTest: the ACT AND SEE drill (Week 8, "The Undo Test").
 *
 * The child's phone sits in the middle of the board holding one photo, and the
 * friends' phones sit around it (the same device for everyone, a name on
 * each). Every round is the same four beats, and each control is live only on
 * its own turn:
 *   1. SHARE (under the child's phone): the photo hops onto every friend's
 *      phone and each friend reacts under their copy.
 *   2. DELETE (on the child's phone): the child's screen empties and says so.
 *      The copies do not move.
 *   3. Check: the child taps each friend's phone, in any order, and each one is
 *      marked "their copy, their phone".
 *   4. Three identical rule cards appear and the child taps the true one.
 * Beats 1 to 3 are a demonstration the child performs with their own finger,
 * so they cannot be wrong; only the rule card is judged.
 *
 * Why it is not the inspectors, the stampers, the Odds Jar or the Chat Fixer
 * (owner: "we never copy an exercise"): nothing is judged real or fake and no
 * word is swapped; the verb is ACT AND SEE. The child causes the spread, then
 * goes looking for the copies, so "delete only deletes your copy" is something
 * they watched happen, not something they were told.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every round read aloud as it arrives (audio-only, `recordedOnly`, taps
 * held), a spoken verdict on the rule card ("That's right!" + why via
 * VerdictVoice; wrong: WrongAnswerPanel speaks "Not quite." + the card's teach
 * line and the cards stay for the retry), hint tiers per round, a spoken payoff
 * on the complete beat. Rounds play in authored order; the cards are shuffled
 * per round. Round 1 guides the MECHANIC only: the control for the current beat
 * breathes until it is used, and the cards never glow. Tap-only, no timer, no
 * lose state. Every card wears the same paint.
 */

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
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

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as OddsJar / ChatFixer.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface UndoRuleCard { text: string; isTrue: boolean; whyWrong: string }
export interface UndoFriend { id: string; name: string; reaction: string }
export interface UndoRound { id: string; caption: string; photoIcon: string; readAloud: string; friends: UndoFriend[]; cards: UndoRuleCard[]; why: string; cardPrompt?: string }
export interface UndoTestProps {
  rounds: UndoRound[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  shareLabel?: string; deleteLabel?: string; goneChip?: string; theirCopyChip?: string; youLabel?: string; trueToast?: string;
  wrongTitle?: string; completeTitle?: string; completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void; onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

/** A round's four beats, in order. Only "rule" can be answered wrong. */
type Step = "share" | "delete" | "check" | "rule";

const EMPTY_CARDS: UndoRuleCard[] = [];
const EMPTY_FRIENDS: UndoFriend[] = [];
const DEFAULT_CARD_PROMPT = "So what is true?";
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
const PLATE_FONT = "'JetBrains Mono', 'Cascadia Mono', ui-monospace, Menlo, monospace";
/** Device widths (px): every friend's phone, and the child's own. */
const PHONE_W = 142;
const YOU_W = 172;
/** Photo paper and the print on it: the same stock on every phone. */
const PAPER = "#fff6e8";
const PRINT = "linear-gradient(160deg, #3d3550 0%, #1b1726 100%)";
/** Every phone is the same graphite device with the same dark screen. */
const DEVICE = "linear-gradient(180deg, #282d40 0%, #161a27 100%)";
const SCREEN = "#0b0e18";

export default function UndoTest({
  rounds,
  introTitle = "The Undo Test",
  introSubtitle = "Share a photo, delete it, then look at your friends' phones.",
  introIcon = "📱",
  shareLabel = "SHARE",
  deleteLabel = "DELETE",
  goneChip = "Gone from YOUR phone",
  theirCopyChip = "Their copy, their phone",
  youLabel = "You",
  trueToast = "TRUE!",
  wrongTitle = "Not quite",
  completeTitle = "The Undo Test, passed!",
  completeLine = "Delete deletes yours. The thinking happens before SHARE.",
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
}: UndoTestProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#ffb347";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Read-aloud chain: the how-to once as the board appears, then each round as
  // it arrives. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // Which beat of the round is live (see Step).
  const [step, setStep] = useState<Step>("share");
  // "sealed" = the true card: the seal lands while Sarah says why, then the
  // next round arrives.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  // Friends' phones the child has looked at this round (by friend id).
  const [checked, setChecked] = useState<Set<string>>(() => new Set());
  // Where each friend's copy hops in from: the offset (px) from its resting
  // spot back to the child's photo, measured in the SHARE tap.
  const [hopFrom, setHopFrom] = useState<Record<string, { x: number; y: number }>>({});
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  // The running story for the complete beat: photos deleted, copies still out.
  const [deletedCount, setDeletedCount] = useState(0);
  const [copiesOut, setCopiesOut] = useState(0);
  // The board element and its width: the ring of phones needs room, and a
  // narrow frame stacks the friends above the child's phone instead.
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);
  const [boardW, setBoardW] = useState(0);

  // Authored order: each round's photo builds on the last. The cards are
  // shuffled per round so the truth is never in one slot.
  const finished = idx >= rounds.length;
  const r = rounds[idx];
  const friends = r?.friends ?? EMPTY_FRIENDS;
  const cards = useShuffledOnce(r?.cards ?? EMPTY_CARDS, { key: r?.id ?? "done" });
  const shared = step !== "share";
  const deleted = step === "check" || step === "rule";
  const decide = step === "rule";
  // Round 1 teaches the mechanic only: the live control breathes until used.
  const guided = idx === 0;

  // Spoken verdicts: Sarah says "That's right!" + why and the next round waits
  // for her. Wrong cards speak through WrongAnswerPanel.
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

  // Track the board's width (before paint, so the layout never flashes).
  useIsoLayoutEffect(() => {
    if (!boardEl) return;
    const measure = () => setBoardW(boardEl.clientWidth);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(boardEl);
    return () => ro.disconnect();
  }, [boardEl]);

  const startBoard = () => {
    setShowIntro(false);
    setNarr(isAudioMuted() ? "idle" : coachLines ? "howto" : "read");
  };

  const advance = () => {
    setIdx((i) => i + 1);
    setStep("share");
    setChecked(new Set());
    setHopFrom({});
    setRoundWrongs(0);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  // Beat 1: the photo leaves. Measure where each copy starts (the child's
  // photo) relative to where it lands (that friend's empty photo slot).
  const share = () => {
    if (!r || speaking || step !== "share") return;
    audio.drop();
    const from: Record<string, { x: number; y: number }> = {};
    const src = boardEl?.querySelector<HTMLElement>("[data-ut-you-photo]")?.getBoundingClientRect();
    if (boardEl && src) {
      const sx = src.left + src.width / 2;
      const sy = src.top + src.height / 2;
      boardEl.querySelectorAll<HTMLElement>("[data-ut-slot]").forEach((el) => {
        const id = el.dataset.utSlot;
        if (!id) return;
        const dst = el.getBoundingClientRect();
        from[id] = { x: sx - (dst.left + dst.width / 2), y: sy - (dst.top + dst.height / 2) };
      });
    }
    setHopFrom(from);
    setCopiesOut((n) => n + r.friends.length);
    setStep("delete");
  };

  // Beat 2: delete only empties the child's own phone.
  const removeMine = () => {
    if (!r || speaking || step !== "delete") return;
    audio.back();
    setDeletedCount((n) => n + 1);
    setStep(r.friends.length > 0 ? "check" : "rule");
  };

  // Beat 3: look at each friend's phone, any order. All of them opens the cards.
  const checkPhone = (f: UndoFriend) => {
    if (!r || speaking || step !== "check" || checked.has(f.id)) return;
    audio.select();
    const next = new Set(checked);
    next.add(f.id);
    setChecked(next);
    if (r.friends.every((x) => next.has(x.id))) setStep("rule");
  };

  // Beat 4: the only judged tap.
  const pickCard = (card: UndoRuleCard) => {
    if (!r || speaking || !decide) return;
    onAnswered?.({
      questionKey: `undo-${r.id}`,
      selectedIndex: cards.indexOf(card),
      correctIndex: cards.findIndex((k) => k.isTrue),
      wasCorrect: card.isTrue,
    });
    if (card.isTrue) {
      fx.correct({ xp: 25, text: trueToast });
      onCorrect?.();
      setPhase("sealed");
      // Sarah: "That's right!" + the round's why; the seal lands under her,
      // then the next round arrives.
      verdict.say("right", r.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const rw = roundWrongs + 1;
      setRoundWrongs(rw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the
      // cards stay so the retry is one tap.
      setFeedback({ title: wrongTitle, explanation: card.whyWrong, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const shareGlow = guided && step === "share" && !speaking;
  const deleteGlow = guided && step === "delete" && !speaking;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "utGuide 1.4s ease-in-out infinite" }
      : {};
  const toCheck = friends.filter((f) => !checked.has(f.id)).length;
  const strip =
    step === "share"
      ? guided
        ? `Round 1: tap ${shareLabel} and watch`
        : `Tap ${shareLabel} and watch where the photo goes`
      : step === "delete"
        ? `Now tap ${deleteLabel} on your phone`
        : step === "check"
          ? guided
            ? "Tap each friend's phone"
            : `Tap each friend's phone. ${toCheck} more to go`
          : "Tap the card that is true";

  // The ring: one friend on the left, one on the right, the rest across the top
  // (over the child's phone). A narrow board stacks every friend above instead.
  const n = friends.length;
  const leftFriend = n >= 2 ? friends[0] : null;
  const rightFriend = n >= 2 ? friends[n - 1] : null;
  const topFriends = n >= 2 ? friends.slice(1, n - 1) : friends;
  const centerW = Math.max(YOU_W + 24, topFriends.length * (PHONE_W + 12));
  const wideMin = (leftFriend ? PHONE_W + 18 : 0) + (rightFriend ? PHONE_W + 18 : 0) + centerW + 28;
  const wide = boardW === 0 || boardW >= wideMin;

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /** One friend's phone: the same device for everyone, tappable on beat 3. */
  const renderFriend = (f: UndoFriend, order: number): ReactNode => {
    if (!r) return null;
    const isChecked = checked.has(f.id);
    const canCheck = step === "check" && !isChecked;
    const glow = guided && canCheck && !speaking;
    const from = hopFrom[f.id];
    const hop = !reduce && !!from;
    return (
      <button
        key={`${r.id}-${f.id}`}
        type="button"
        aria-label={`Check ${f.name}'s phone`}
        aria-pressed={isChecked}
        onClick={() => checkPhone(f)}
        disabled={speaking || !canCheck}
        style={{
          position: "relative",
          width: PHONE_W,
          padding: "7px 7px 6px",
          borderRadius: 22,
          // Every friend's phone is the same device: only the child's own look
          // marks one.
          background: DEVICE,
          border: `2px solid ${isChecked ? accent : "rgba(255,255,255,0.2)"}`,
          boxShadow: isChecked ? `0 0 16px ${accent}55` : "0 14px 28px -18px rgba(0,0,0,0.85)",
          color: "#fff7e6",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 5,
          cursor: canCheck && !speaking ? "pointer" : "default",
          fontFamily: KID_FONT,
          touchAction: "manipulation",
          transition: "border-color 220ms ease",
          ...guideStyle(glow),
        }}
      >
        <span aria-hidden style={{ width: 34, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.18)" }} />
        <span
          style={{
            maxWidth: "100%",
            padding: "2px 9px",
            borderRadius: 8,
            background: "rgba(8,10,22,0.7)",
            border: "1px solid rgba(255,255,255,0.16)",
            fontFamily: PLATE_FONT,
            fontSize: 12.5,
            fontWeight: 700,
            lineHeight: 1.3,
            overflowWrap: "anywhere",
          }}
        >
          {f.name}
        </span>

        {/* The screen: an empty photo slot until SHARE, then their copy and
            their reaction. Top-aligned, so a long reaction grows the screen
            downward and never moves the slot the copy lands in. */}
        <span
          style={{
            width: "100%",
            minHeight: 106,
            borderRadius: 13,
            background: SCREEN,
            border: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 5,
            padding: "8px 6px",
          }}
        >
          <span
            data-ut-slot={f.id}
            style={{
              width: 54,
              height: 54,
              display: "grid",
              placeItems: "center",
              borderRadius: 6,
              border: shared ? "1.5px solid transparent" : "1.5px dashed rgba(255,255,255,0.18)",
            }}
          >
            {shared && (
              <motion.span
                key={`copy-${r.id}-${f.id}`}
                aria-hidden
                initial={hop ? { opacity: 1, x: from.x, y: from.y, scale: 0.6 } : { opacity: 0, scale: 0.8 }}
                animate={
                  hop
                    ? { opacity: 1, x: [from.x, from.x * 0.5, 0], y: [from.y, from.y * 0.5 - 46, 0], scale: [0.6, 1.08, 1] }
                    : { opacity: 1, scale: 1 }
                }
                transition={hop ? { duration: 0.62, ease: "easeOut", times: [0, 0.5, 1], delay: order * 0.12 } : { duration: 0.25 }}
                style={{
                  position: "relative",
                  zIndex: 20,
                  display: "grid",
                  placeItems: "center",
                  width: 52,
                  height: 52,
                  padding: 4,
                  borderRadius: 4,
                  background: PAPER,
                  boxShadow: "0 6px 14px rgba(0,0,0,0.55)",
                }}
              >
                <span style={{ display: "grid", placeItems: "center", width: "100%", height: "100%", borderRadius: 2, background: PRINT }}>
                  <PixIcon emoji={r.photoIcon} size={30} />
                </span>
              </motion.span>
            )}
          </span>
          <span style={{ minHeight: 30, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {shared && (
              <motion.span
                key={`react-${r.id}-${f.id}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: reduce ? 0.1 : 0.55 + order * 0.12 }}
                style={{
                  maxWidth: "100%",
                  padding: "3px 8px",
                  borderRadius: "10px 10px 10px 3px",
                  background: "rgba(255,255,255,0.12)",
                  color: "#fff7e6",
                  fontSize: 11.5,
                  fontWeight: 700,
                  lineHeight: 1.25,
                  textAlign: "center",
                  overflowWrap: "anywhere",
                }}
              >
                {f.reaction}
              </motion.span>
            )}
          </span>
        </span>

        {/* The look-mark row keeps its height, so the phone never jumps. */}
        <span style={{ minHeight: 34, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {isChecked && (
            <motion.span
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 18 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "3px 8px",
                borderRadius: 999,
                background: `${accent}26`,
                border: `1px solid ${accent}88`,
                color: "#fff7e6",
                fontSize: 10.5,
                fontWeight: 800,
                lineHeight: 1.15,
                textAlign: "center",
              }}
            >
              <PixIcon emoji="👀" size={14} />
              <span>{theirCopyChip}</span>
            </motion.span>
          )}
        </span>
      </button>
    );
  };

  const you: ReactNode = r ? (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      {/* The child's phone: the photo, then DELETE on its own screen edge. */}
      <div
        style={{
          position: "relative",
          width: YOU_W,
          padding: "8px 8px 10px",
          borderRadius: 26,
          background: DEVICE,
          border: `2px solid ${accent}`,
          boxShadow: `0 0 0 3px ${accent}22, 0 18px 36px -20px rgba(0,0,0,0.9)`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          color: "#fff7e6",
        }}
      >
        <span aria-hidden style={{ width: 40, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.2)" }} />
        <span style={eyebrowStyle}>{youLabel}</span>
        <div
          style={{
            width: "100%",
            minHeight: 140,
            borderRadius: 15,
            background: SCREEN,
            border: "1px solid rgba(255,255,255,0.08)",
            display: "grid",
            placeItems: "center",
            padding: 8,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!deleted ? (
              <motion.div
                key={`photo-${r.id}`}
                data-ut-you-photo
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 1 }}
                animate={shared && !reduce ? { opacity: 1, y: 0, scale: [1, 1.07, 1] } : { opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.2, rotate: -24, y: 18, transition: { duration: 0.28 } }}
                transition={{ duration: 0.35 }}
                style={{
                  width: 128,
                  padding: "6px 6px 5px",
                  borderRadius: 4,
                  background: PAPER,
                  boxShadow: "0 8px 18px rgba(0,0,0,0.55)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ width: "100%", height: 72, borderRadius: 2, background: PRINT, display: "grid", placeItems: "center" }}>
                  <PixIcon emoji={r.photoIcon} size={48} />
                </span>
                <span
                  style={{
                    color: "#2a1f18",
                    fontFamily: KID_FONT,
                    fontSize: 12,
                    fontWeight: 800,
                    lineHeight: 1.2,
                    textAlign: "center",
                    overflowWrap: "anywhere",
                  }}
                >
                  {r.caption}
                </span>
              </motion.div>
            ) : (
              <motion.div
                key={`gone-${r.id}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                transition={{ duration: 0.3 }}
                role="status"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 10px",
                  borderRadius: 12,
                  border: "1.5px dashed rgba(255,255,255,0.28)",
                  color: "rgba(255,247,230,0.85)",
                  fontFamily: KID_FONT,
                  fontSize: 13,
                  fontWeight: 800,
                  lineHeight: 1.25,
                  textAlign: "center",
                }}
              >
                <PixIcon emoji="🗑️" size={30} />
                <span>{goneChip}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span style={{ display: "inline-block", borderRadius: 14, ...guideStyle(deleteGlow) }}>
          <GameButton
            variant="danger"
            size="md"
            icon="🗑️"
            onClick={removeMine}
            disabled={speaking || step !== "delete"}
            aria-label={deleteLabel}
            style={{ padding: "8px 16px", minHeight: 40, fontSize: 13 }}
          >
            {deleteLabel}
          </GameButton>
        </span>
      </div>

      {/* SHARE, under the child's phone. It steps aside for the rule cards
          (its job is done by then), so the cards fit a 771px-tall window. */}
      {!decide && (
        <span style={{ display: "inline-block", borderRadius: 16, ...guideStyle(shareGlow) }}>
          <GameButton variant="primary" size="lg" icon="🚀" onClick={share} disabled={speaking || step !== "share"} aria-label={shareLabel} style={{ minWidth: 160 }}>
            {shareLabel}
          </GameButton>
        </span>
      )}
    </div>
  ) : null;

  return (
    <ExerciseFrame maxWidth={860} decor>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then each round. */}
      {!showIntro && !finished && r && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="ut-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`ut-read-${r.id}`} speaker={voice} lines={[r.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && r && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Round {Math.min(idx + 1, rounds.length)} of {rounds.length}
            </span>
          </div>

          {/* The board: the child's phone in the middle, the friends' phones around it. */}
          <div
            ref={setBoardEl}
            style={{
              margin: "0 14px",
              padding: "12px 12px 14px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
            }}
          >
            {wide ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr) auto minmax(0, 1fr)",
                  gridTemplateRows: topFriends.length > 0 ? "auto auto" : "auto",
                  columnGap: 18,
                  rowGap: 12,
                  alignItems: "center",
                }}
              >
                {leftFriend && <div style={{ gridColumn: 1, gridRow: "1 / -1", justifySelf: "end" }}>{renderFriend(leftFriend, 0)}</div>}
                {topFriends.length > 0 && (
                  <div style={{ gridColumn: 2, gridRow: 1, display: "flex", gap: 12, justifyContent: "center" }}>
                    {topFriends.map((f, i) => renderFriend(f, i + (leftFriend ? 1 : 0)))}
                  </div>
                )}
                <div style={{ gridColumn: 2, gridRow: topFriends.length > 0 ? 2 : 1, justifySelf: "center" }}>{you}</div>
                {rightFriend && <div style={{ gridColumn: 3, gridRow: "1 / -1", justifySelf: "start" }}>{renderFriend(rightFriend, n - 1)}</div>}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>{friends.map((f, i) => renderFriend(f, i))}</div>
                {you}
              </div>
            )}
          </div>

          {/* After every phone is checked: the prompt and three identical cards. */}
          <AnimatePresence>
            {decide && (
              <motion.div
                key={`cards-${r.id}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.25 }}
                style={{ marginTop: 8, padding: "0 12px" }}
              >
                <div style={{ textAlign: "center", fontFamily: KID_FONT, fontSize: 17, fontWeight: 800, color: "#fff7e6", marginBottom: 6 }}>
                  <span aria-hidden style={{ marginRight: 8, verticalAlign: "middle" }}>
                    <PixIcon emoji="💬" size={20} />
                  </span>
                  {r.cardPrompt ?? DEFAULT_CARD_PROMPT}
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
                  {cards.map((k) => {
                    const sealed = phase === "sealed" && k.isTrue;
                    return (
                      <motion.button
                        key={k.text}
                        type="button"
                        aria-label={`Card: ${k.text}`}
                        onClick={() => pickCard(k)}
                        disabled={speaking}
                        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
                        style={{
                          position: "relative",
                          flex: "1 1 200px",
                          maxWidth: 260,
                          minHeight: 68,
                          padding: "12px 14px",
                          borderRadius: 14,
                          // Every card the same paint, every round: nothing here
                          // can hint at the answer. Only a right pick seals one.
                          background: "rgba(255,255,255,0.08)",
                          border: "2px solid rgba(255,255,255,0.22)",
                          color: "#fff7e6",
                          fontFamily: KID_FONT,
                          fontSize: 15,
                          fontWeight: 700,
                          lineHeight: 1.3,
                          textAlign: "center",
                          cursor: speaking ? "wait" : "pointer",
                        }}
                      >
                        {k.text}
                        <AnimatePresence>
                          {sealed && (
                            <motion.span
                              key="seal"
                              aria-hidden
                              initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", scale: 1.8, rotate: -20 }}
                              animate={{ opacity: 1, x: "-50%", scale: 1, rotate: -6 }}
                              exit={{ opacity: 0, x: "-50%" }}
                              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.15 }}
                              style={{
                                position: "absolute",
                                left: "50%",
                                top: "50%",
                                marginTop: -20,
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                padding: "6px 14px",
                                borderRadius: 10,
                                border: "4px double #34d399",
                                color: "#a0ffb0",
                                background: "rgba(8,10,22,0.88)",
                                fontFamily: LABEL_FONT,
                                fontWeight: 900,
                                fontSize: 16,
                                letterSpacing: "0.12em",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                                boxShadow: "0 0 18px rgba(52,211,153,0.5)",
                                zIndex: 3,
                              }}
                            >
                              <PixIcon emoji="✅" size={18} />
                              True
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* On-board instructions: the current beat, in the child's words. On
              the card beat the prompt above the cards says it instead. */}
          {!decide && (
            <div style={{ textAlign: "center", marginTop: 14 }}>
              <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
                {strip}
              </div>
            </div>
          )}

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes utGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
          `}</style>
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
            `${deletedCount} photo${deletedCount === 1 ? "" : "s"} shared and deleted, ${copiesOut} ${copiesOut === 1 ? "copy" : "copies"} still out`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
