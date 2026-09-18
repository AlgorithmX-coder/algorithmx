"use client";

/**
 * CommentPond: the NAME WHAT IT WANTS drill (Week 10, "The Comment Pond").
 *
 * Comments rise out of a dark pond one at a time, each on the same card in the
 * same paint: a handle, the comment, and the same blank face beside it, because
 * a friendly comment and a fishing comment look exactly alike. Along the bottom
 * sits a tray of tokens that never changes from comment to comment: MY NAME, MY
 * SCHOOL, MY AGE, A PHOTO, A TAP ON A LINK, and NOTHING, IT IS JUST BEING NICE.
 * The child taps the token naming what THAT comment is fishing for. Right and
 * the thing is private: a lid snaps over the comment, it sinks out of the pond,
 * and Sarah says why that thing stays with the child. Right and the token is
 * NOTHING: the comment swims past with a thumbs up, because a kind comment is
 * still allowed to be kind. Wrong and Sarah teaches what that comment was
 * really reaching for, and the comment waits in the pond for the next tap.
 *
 * The child NEVER replies, so this board has no reply affordance anywhere: no
 * reply button, no text box, no keyboard, nothing that could be mistaken for
 * one. The only thing to do with a comment from a stranger is to name what it
 * wants and close the lid. That absence is the lesson, so please keep it.
 *
 * Why it is not Strings Attached, the inspectors or a sort (owner: "we never
 * copy an exercise"): Strings Attached is two taps, three balloons in the air
 * at once, the child choosing which offer to work on and strings piling up
 * across the counter; the inspectors open zones on one artefact and then ask
 * for a verdict; a sort drops items into bins. Here exactly one comment exists
 * at a time, one tap answers it, nothing links, nothing accumulates and no bin
 * fills. The tray is a fixed vocabulary of things that are MINE, reused by
 * every comment, and the outcome is a lid, not a score.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to
 * once, every comment read aloud as it surfaces (audio-only, `recordedOnly`,
 * taps held), a one-take spoken verdict on the right token ("That's right!" +
 * the comment's `why` via VerdictVoice; wrong: WrongAnswerPanel speaks "Not
 * quite." + the comment's `explanation` and every token stays put, so the retry
 * is one tap), hint tiers per comment, a spoken payoff on the complete beat.
 * The next comment is started from the verdict's own callback, so no payoff can
 * ever cut Sarah off. Comments surface in authored order; the tray is shuffled
 * ONCE per play, never per comment, because a tray that moves under a child's
 * finger is not a tray. Round 1 guides the MECHANIC only: every token breathes
 * together until one is tapped, which shows what to do and hides which one is
 * right. Tap-only, no timer, no lose state.
 *
 * Authoring: `comment.wantId` must match one `wants[].id`, or that comment has
 * no right answer. Five or six tokens in the tray, exactly one of them the
 * not-private one. Keep a token label to about 22 characters, a comment to
 * about 90, `why` and `explanation` to one kid-sized sentence each. Every icon
 * must be in PixIcon's MAP or it renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + board 26 (padding and
 * border) + pond 208 (eyebrow 22, water 186) + 14 + tray 152 (eyebrow 22, two
 * rows of 60 with a 10 gap) = 400, then strip 28 + hint gap 8, so about 475px.
 * The pond, all six tokens and the strip are on screen without a scroll; the
 * tray drops to two columns, then one, on a narrow board so every token stays
 * the same size as its neighbours.
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
import { useVerdictVoice } from "@/app/components/lesson/VerdictVoice";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as FourEyes / TestDrive.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface PondWant { id: string; label: string; icon: string; isPrivate: boolean; }
export interface PondComment { id: string; author: string; text: string; wantId: string; why: string; explanation: string; }
export interface CommentPondProps {
  comments: PondComment[];
  wants: PondWant[];             // the fixed tray, same for every comment
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  trayLabel?: string;            // default "WHAT DOES IT WANT?"
  pondLabel?: string;            // default "THE COMMENT POND"
  completeTitle?: string; completeLine?: string;
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

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Board copy that is the same every week (no prop, so no week can drift). */
const LID_TOAST = "LID ON!";
const PASS_TOAST = "JUST BEING NICE!";
const LID_STATUS = "Lid on. That stays with you";
const PASS_STATUS = "Just being nice. Let it swim by";
const WRONG_TITLE = "Read the comment again";
/** Geometry (px). */
const POND_MIN_H = 186;
const CARD_MAX_W = 460;
const CARD_MIN_H = 108;
const TOKEN_MIN_H = 58;
const TOKEN_GAP = 10;
const TOKEN_MIN_W = 150;
/** Board padding (12 + 12) the column tests add to a tray row. */
const BOARD_PAD = 24;
const COLS_3 = TOKEN_MIN_W * 3 + TOKEN_GAP * 2 + BOARD_PAD;
const COLS_2 = TOKEN_MIN_W * 2 + TOKEN_GAP + BOARD_PAD;
/** Paints. The pond is the dark water; every token wears the same paper. */
const POND_BG =
  "radial-gradient(120% 90% at 50% 0%, rgba(120,190,255,0.12) 0%, rgba(4,10,26,0) 62%), linear-gradient(180deg, rgba(8,20,44,0.8) 0%, rgba(3,8,22,0.96) 100%)";
const CARD_BG = "linear-gradient(180deg, rgba(20,30,64,0.96) 0%, rgba(12,18,42,0.98) 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";
const LID_BG = "linear-gradient(180deg, #8fb2ff 0%, #4c6fd6 55%, #2c3f8f 100%)";

export default function CommentPond({
  comments,
  wants,
  introTitle = "The Comment Pond",
  introSubtitle = "Comments come from strangers. Tap what each one is fishing for.",
  introIcon = "💬",
  trayLabel = "WHAT DOES IT WANT?",
  pondLabel = "THE COMMENT POND",
  completeTitle = "A lid on every fishing comment!",
  completeLine = "Comments come from strangers. Your name, your school, your age and your photos stay with you.",
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
}: CommentPondProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key. Never
  // derive it from the intro narration's speaker.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Read-aloud chain: the how-to once as the board appears, then each comment
  // as it surfaces. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "sealed" = the right token: the lid snaps on (or the comment swims past)
  // while Sarah says why, then the next comment surfaces.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  const [sealMode, setSealMode] = useState<"lid" | "pass">("lid");
  // Tokens already tried on THIS comment (cleared as the next one surfaces).
  const [triedIds, setTriedIds] = useState<Set<string>>(() => new Set());
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  // The board element and its width: the tray drops from three columns to two,
  // then one, so every token always matches its neighbours.
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);
  const [boardW, setBoardW] = useState(0);

  // Comments surface in authored order (each one builds on the last). The tray
  // is shuffled ONCE per play (no key), never per comment: it is furniture the
  // child learns the shape of, so it must not move under their finger.
  const finished = idx >= comments.length;
  const c = comments[idx];
  const tray = useShuffledOnce(wants, { key: "pond-tray" });
  const sealed = phase === "sealed";
  // Round 1 teaches the mechanic only: every token breathes, so the glow says
  // "tap one of these", never which one.
  const guided = idx === 0;
  const cols = boardW === 0 || boardW >= COLS_3 ? 3 : boardW >= COLS_2 ? 2 : 1;

  // Spoken verdicts: Sarah says "That's right!" + why and the next comment
  // waits for her. Wrong tokens speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || sealed;

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Authoring guard (dev only): a comment whose wantId is not in the tray has
  // no right answer, which would strand the child on that comment.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    const orphans = comments.filter((x) => !wants.some((w) => w.id === x.wantId)).map((x) => `${x.id} -> ${x.wantId}`);
    if (orphans.length > 0) console.warn(`[CommentPond] no tray token for: ${orphans.join(", ")}`);
  }, [comments, wants]);

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
    setTriedIds(new Set());
    setPickedId(null);
    setRoundWrongs(0);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  // NAME IT: the only judged tap of the round.
  const nameWant = (w: PondWant) => {
    if (!c || speaking || phase !== "play") return;
    const right = w.id === c.wantId;
    onAnswered?.({
      questionKey: `commentpond-${c.id}`,
      // Indexes are into the AUTHORED tray, whatever slot the shuffle put a
      // token in, so the dashboard always reads the same numbers.
      selectedIndex: wants.indexOf(w),
      correctIndex: wants.findIndex((x) => x.id === c.wantId),
      wasCorrect: right,
    });
    if (right) {
      const mode = w.isPrivate ? "lid" : "pass";
      if (mode === "lid") audio.drop();
      else audio.select();
      fx.correct({ xp: 25, text: mode === "lid" ? LID_TOAST : PASS_TOAST });
      onCorrect?.();
      setPickedId(w.id);
      setSealMode(mode);
      setPhase("sealed");
      // Sarah: "That's right!" + why this stays with the child (or why a kind
      // comment may swim by), then the next comment. Advancing from her
      // callback is what keeps a payoff from ever cutting her off.
      verdict.say("right", c.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTriedIds((prev) => new Set(prev).add(w.id));
      setTotalWrongs((n) => n + 1);
      const rw = roundWrongs + 1;
      setRoundWrongs(rw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; the
      // comment stays in the pond, so the retry is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: c.explanation, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "cpGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = sealed
    ? sealMode === "lid"
      ? LID_STATUS
      : PASS_STATUS
    : guided
      ? "Round 1: tap what this comment is fishing for"
      : roundWrongs > 0
        ? "Read it again. What is it reaching for?"
        : "A new comment. Tap what it wants from you";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The pond: dark water, one comment up at a time ───────── */
  const ripples: ReactNode = reduce ? null : (
    <span aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${18 + i * 30}%`,
            bottom: 10 + i * 8,
            width: 120,
            height: 26,
            marginLeft: -60,
            borderRadius: "50%",
            border: `1px solid ${accent}33`,
            animation: `cpRipple 5.4s ease-in-out ${i * 1.3}s infinite`,
          }}
        />
      ))}
    </span>
  );

  const commentCard: ReactNode = c ? (
    <motion.div
      key={`card-${c.id}`}
      role="group"
      aria-label={`Comment from ${c.author}`}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 44, scale: 0.96 }}
      animate={
        !sealed
          ? { opacity: 1, y: 0, x: 0, scale: 1, rotate: 0 }
          : sealMode === "lid"
            ? reduce
              ? { opacity: 0.35, y: 0, x: 0, scale: 1, rotate: 0 }
              : { opacity: 0.3, y: 30, x: 0, scale: 0.95, rotate: 0 }
            : reduce
              ? { opacity: 0.35, y: 0, x: 0, scale: 1, rotate: 0 }
              : { opacity: 0, y: -4, x: 340, scale: 0.96, rotate: 5 }
      }
      transition={
        reduce
          ? { duration: 0.2 }
          : sealed
            ? { duration: 0.5, delay: sealMode === "lid" ? 0.3 : 0.18, ease: "easeIn" }
            : { type: "spring", stiffness: 260, damping: 22 }
      }
      style={{
        position: "relative",
        zIndex: 2,
        width: "100%",
        maxWidth: CARD_MAX_W,
        minHeight: CARD_MIN_H,
        borderRadius: 18,
        // Every comment wears the same card, the same face and the same ink: a
        // fishing comment must never look different from a kind one.
        background: CARD_BG,
        border: `2px solid ${accent}77`,
        boxShadow: `0 18px 34px -20px rgba(0,0,0,0.9), inset 0 0 0 1px ${accent}1f`,
        padding: "12px 14px",
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        color: "#fff7e6",
        fontFamily: KID_FONT,
      }}
    >
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          width: 34,
          height: 34,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          background: "rgba(8,10,22,0.6)",
          border: `1.5px solid ${accent}88`,
        }}
      >
        <PixIcon emoji="👤" size={22} />
      </span>
      <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
        <span style={{ fontFamily: LABEL_FONT, fontSize: 12, fontWeight: 900, letterSpacing: "0.08em", color: "#c9b8ff", overflowWrap: "anywhere" }}>
          {c.author}
        </span>
        <span style={{ fontSize: 15.5, fontWeight: 700, lineHeight: 1.3, overflowWrap: "anywhere" }}>{c.text}</span>
      </span>

      {/* The lid: it snaps over the whole comment, so it can no longer be read. */}
      <AnimatePresence>
        {sealed && sealMode === "lid" && (
          <motion.span
            key={`lid-${c.id}`}
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -74 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 420, damping: 22 }}
            style={{
              position: "absolute",
              left: -4,
              right: -4,
              top: -6,
              bottom: -4,
              zIndex: 3,
              borderRadius: 18,
              background: LID_BG,
              border: "3px solid #e8f0ff",
              boxShadow: "0 14px 26px -14px rgba(0,0,0,0.9), inset 0 2px 0 rgba(255,255,255,0.4)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <span style={{ display: "grid", placeItems: "center", width: 46, height: 46, borderRadius: "50%", background: "rgba(8,12,30,0.4)", border: "2px solid rgba(255,255,255,0.5)" }}>
              <PixIcon emoji="🔒" size={30} />
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  ) : null;

  const pond: ReactNode = c ? (
    <section aria-label={pondLabel} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, padding: "0 2px", ...eyebrowStyle }}>
        <PixIcon emoji="💬" size={16} />
        <span>{pondLabel}</span>
      </div>
      <div
        style={{
          position: "relative",
          minHeight: POND_MIN_H,
          overflow: "hidden",
          borderRadius: 18,
          background: POND_BG,
          border: `1px solid ${accent}55`,
          boxShadow: `inset 0 12px 28px -18px rgba(0,0,0,0.95), inset 0 0 0 1px ${accent}1a`,
          padding: "14px 14px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {ripples}
        {commentCard}

        {/* What just happened to that comment, in one line. */}
        <AnimatePresence>
          {sealed && (
            <motion.div
              key={`status-${c.id}`}
              role="status"
              initial={reduce ? { opacity: 0, x: "-50%" } : { opacity: 0, x: "-50%", y: 10 }}
              animate={{ opacity: 1, x: "-50%", y: 0 }}
              exit={{ opacity: 0, x: "-50%", transition: { duration: 0.12 } }}
              transition={{ duration: 0.25, delay: reduce ? 0 : 0.35 }}
              style={{
                position: "absolute",
                left: "50%",
                bottom: 8,
                zIndex: 4,
                maxWidth: "94%",
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 14px",
                borderRadius: 999,
                background: "rgba(8,10,22,0.92)",
                border: `2px solid ${sealMode === "lid" ? "#34d399" : "#ffd24a"}`,
                color: sealMode === "lid" ? "#a0ffb0" : "#ffe6a8",
                fontFamily: LABEL_FONT,
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.1em",
                lineHeight: 1.2,
                textTransform: "uppercase",
                textAlign: "center",
                pointerEvents: "none",
              }}
            >
              <PixIcon emoji={sealMode === "lid" ? "🔒" : "👍"} size={20} />
              <span>{sealMode === "lid" ? LID_STATUS : PASS_STATUS}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  ) : null;

  /* ───────── The tray: the same tokens under every comment ───────── */
  const renderToken = (w: PondWant, order: number): ReactNode => {
    if (!c) return null;
    const chosen = sealed && pickedId === w.id;
    const ruledOut = triedIds.has(w.id);
    const glow = guided && phase === "play" && !speaking;
    return (
      <motion.button
        key={w.id}
        type="button"
        aria-label={ruledOut ? `${w.label}, tried already` : w.label}
        onClick={() => nameWant(w)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
        animate={{ opacity: ruledOut && !chosen ? 0.55 : 1, y: 0 }}
        transition={{ duration: 0.24, delay: reduce ? 0 : 0.06 + order * 0.05 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.96 }}
        style={{
          position: "relative",
          width: "100%",
          minHeight: TOKEN_MIN_H,
          padding: "8px 10px",
          borderRadius: 14,
          // Every token the same paper, size and ink, under every comment:
          // nothing here can hint at what this one is fishing for.
          background: PAPER,
          border: `3px solid ${chosen ? "#16a34a" : "#ffffff"}`,
          boxShadow: chosen
            ? "0 0 20px rgba(22,163,74,0.5), inset 0 0 0 1.5px rgba(42,31,24,0.14)"
            : "0 8px 16px -10px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
          color: INK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: KID_FONT,
          fontSize: 14.5,
          fontWeight: 800,
          lineHeight: 1.2,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        <PixIcon emoji={w.icon} size={24} />
        <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{w.label}</span>
        {chosen && (
          <motion.span
            aria-hidden
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
            style={{ position: "absolute", top: -10, right: -8, display: "grid", placeItems: "center" }}
          >
            <PixIcon emoji="✅" size={24} />
          </motion.span>
        )}
      </motion.button>
    );
  };

  // Complete-beat story: how many comments were fishing, and how many were kind.
  const fishing = comments.filter((x) => wants.find((w) => w.id === x.wantId)?.isPrivate).length;
  const kind = comments.length - fishing;

  return (
    <ExerciseFrame maxWidth={780} decor>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then every comment. */}
      {!showIntro && !finished && c && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="cp-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`cp-read-${c.id}`} speaker={voice} lines={[c.text]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && c && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Comment {Math.min(idx + 1, comments.length)} of {comments.length}
            </span>
          </div>

          {/* The board: the pond over the tray. There is no reply control here
              and there must never be one. */}
          <div
            ref={setBoardEl}
            style={{
              margin: "0 14px",
              padding: "12px 12px 12px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
              display: "flex",
              flexDirection: "column",
              gap: 14,
            }}
          >
            {pond}

            <section aria-label={trayLabel} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, padding: "0 2px", ...eyebrowStyle }}>
                <PixIcon emoji="🔍" size={16} />
                <span>{trayLabel}</span>
              </div>
              <div
                role="group"
                aria-label={trayLabel}
                style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: TOKEN_GAP }}
              >
                {tray.map(renderToken)}
              </div>
            </section>
          </div>

          {/* On-board instructions: the current beat, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes cpGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
            @keyframes cpRipple { 0% { opacity: 0; transform: scale(0.6) } 40% { opacity: 0.7 } 100% { opacity: 0; transform: scale(1.35) } }
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
            `${comments.length} comment${comments.length === 1 ? "" : "s"} read: ${fishing} fishing for something of yours, ${kind} just being kind`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
