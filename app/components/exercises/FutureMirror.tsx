"use client";

/**
 * FutureMirror: the FUTURE-SELF TEST drill (Week 12, "The Future Mirror").
 *
 * A tall mirror stands in the snow at the end of the trail. In it the child
 * sees themselves grown up, and beside the glass waits the face of somebody who
 * might look them up one day: a coach picking a team, a teacher, someone
 * offering a first job. One post from the trail is lifted up to the glass and
 * Sarah reads it out. Then the whole game, one decision: PROUD OF IT, or RUB IT
 * OUT. The mirror answers, warm either way, and Sarah says why.
 *
 * The two buttons never move. That is deliberate: the child is learning a TEST
 * they can run on their own posts for the rest of their life, and a test you
 * have to hunt for is not a test you will use. What is shuffled is the POSTS,
 * so the order of the answers is never learnable even though the buttons are.
 * (`useShuffledOnce` is not used on the pair either, since a two-item list
 * always comes back simply reversed.)
 *
 * Why it is not the Believe-o-Meter, the Undo Test or the Pause Power drill
 * (owner: "we never copy an exercise"): the Believe-o-Meter turns a needle to a
 * position on a scale of how true something is, the Undo Test asks whether a
 * thing can be taken back, and Pause Power is about stopping before you send.
 * Here the post has already been sent and cannot be unsent; the only question
 * is how it looks to a PERSON IN THE FUTURE, and that person is different every
 * round, which is what makes it a mirror and not a rule.
 *
 * Nothing here shames the child. A post that should be rubbed out is a normal
 * thing a kid might post on a grumpy day, never something wicked, and the teach
 * line is warm: future-you would rather you had not, and that is all.
 *
 * Nothing races the child either: tap-only, untimed, no lose state, no penalty
 * for a wrong call beyond Sarah explaining it.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every post's `readAloud` spoken as it is lifted to the glass (audio-only,
 * `recordedOnly`, taps held, released by the shared SPOKEN_GATE_MAX_MS), a
 * one-take spoken verdict on the call ("That's right!" + that post's `why` via
 * VerdictVoice; wrong: WrongAnswerPanel speaks "Not quite." + that post's
 * `explanation`), hint tiers per post, and a payoff on the complete beat gated
 * on `!verdict.speaking` so it can never cut Sarah off. The next post is lifted
 * from the verdict's own callback, so no payoff can cut her off either. Round 1
 * guides the MECHANIC only: both buttons breathe together, which shows what to
 * do and hides which one is right.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each post's `readAloud`, `why` and
 * `explanation`, `hints`, `completeNarration`). The clip generator reads the
 * WEEK FILE, so anything left to a component default is never recorded and
 * plays as silence, with no error anywhere.
 *
 * Authoring: `proud: true` means PROUD OF IT is the right call. Keep `text` to
 * about 70 characters (it is the post in the glass), `viewer` to about 30 ("a
 * coach picking a team"), `readAloud` to one sentence, and `why` and
 * `explanation` to one kid-sized sentence each. `why` is what Sarah says on the
 * right call; `explanation` is the warm teach line for a wrong one, so every
 * post needs both. Mix proud and rub-it-out posts, and never end on a
 * rub-it-out one. Every icon must be in PixIcon's MAP or it renders as a flat
 * system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 (padding and border) + eyebrow 22 + mirror 258 (faces row 66, post card
 * 128, padding and border 64) + gap 12 + prompt 20 + gap 8 + buttons 96 + strip
 * 28 + hint gap 8 = ~517px, so the mirror, both buttons and the strip are on
 * screen without a scroll. At 400px the two buttons stack into one column (in
 * the same order, so the test stays learnable) and nothing scrolls sideways.
 */

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as DrillRun / TrackBack.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface MirrorPost { id: string; text: string; icon: string; readAloud: string; viewer: string; proud: boolean; why: string; explanation: string; }
export interface FutureMirrorProps {
  posts: MirrorPost[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  mirrorLabel?: string;       // default "THE FUTURE MIRROR"
  proudLabel?: string;        // default "PROUD OF IT"
  rubLabel?: string;          // default "RUB IT OUT"
  viewerPrefix?: string;      // default "Looking you up:"
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

/** The child's call. PROUD is always the left button, RUB always the right. */
type Call = "proud" | "rub";

/** Fixed chrome copy the props above do not cover (never spoken, so it can
 *  safely live here). Warm on purpose: nothing in this game shames the child. */
const RIGHT_TOAST = "GOOD CALL!";
const WRONG_TITLE = "Have another look in the mirror";
const ASK_PROMPT = "Happy for them to see this one?";
const GROWN_UP_LABEL = "YOU, GROWN UP";
const RUBBED_STAMP = "RUBBED OUT";

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Geometry (px). */
const FACE = 56;
const POST_MIN_H = 128;
const BUTTON_MIN_H = 92;
const BUTTON_MIN_W = 210;
/** Paints. Cold glass, warm lamp behind it: the mirror is kind, not scary. */
const GLASS_BG = "linear-gradient(180deg, rgba(226,240,255,0.2) 0%, rgba(140,180,230,0.08) 55%, rgba(226,240,255,0.14) 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";
const PROUD_GREEN = "#7ee2a8";
const RUB_AMBER = "#ffd158";

export default function FutureMirror({
  posts,
  introTitle = "The Future Mirror",
  introSubtitle = "Hold each post up to the mirror. Would grown-up you be happy for them to see it?",
  introIcon = "👀",
  mirrorLabel = "THE FUTURE MIRROR",
  proudLabel = "PROUD OF IT",
  rubLabel = "RUB IT OUT",
  viewerPrefix = "Looking you up:",
  completeTitle = "Mirror test passed!",
  completeLine = "Before you post, hold it up to the mirror, Cyber Hero. Would future-you be glad it is there?",
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
}: FutureMirrorProps) {
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
  // Read-aloud chain: the how-to once as the mirror appears, then each post as
  // it is lifted to the glass. Taps are held while she speaks.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // The call just made, once it was the right one: the mirror reacts while
  // Sarah says why, then the next post is lifted.
  const [settled, setSettled] = useState<Call | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [postWrongs, setPostWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  // The POSTS are shuffled (the two buttons never move, so the muddle has to
  // live in the order the posts arrive), once per mount.
  const deck = useShuffledOnce(posts, { key: "future-mirror" });
  const finished = idx >= deck.length;
  const post = deck[idx];
  const sealed = settled !== null;
  // Round 1 teaches the mechanic only: both buttons breathe together, so the
  // glow says "tap one of these", never which one.
  const guided = idx === 0;

  // Spoken verdicts: Sarah says "That's right!" + why, and the next post waits
  // for her. Wrong calls speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || sealed;

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
    setSettled(null);
    setPostWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── THE CALL: the only judged tap of the round ───────── */
  const call = (choice: Call) => {
    if (!post || speaking || sealed) return;
    const right = (choice === "proud") === post.proud;
    onAnswered?.({
      questionKey: `futuremirror-${post.id}`,
      // 0 = PROUD, 1 = RUB IT OUT, whatever order the posts arrived in, so the
      // dashboard always reads the same two numbers.
      selectedIndex: choice === "proud" ? 0 : 1,
      correctIndex: post.proud ? 0 : 1,
      wasCorrect: right,
    });
    if (right) {
      fx.correct({ xp: 25, text: RIGHT_TOAST });
      onCorrect?.();
      setSettled(choice);
      // Sarah: "That's right!" + this post's why, then the next post is lifted.
      // Advancing from her callback is what keeps a payoff from cutting her off.
      verdict.say("right", post.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const pw = postWrongs + 1;
      setPostWrongs(pw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; both
      // buttons stay where they are, so the retry is one tap in the same place.
      setFeedback({ title: WRONG_TITLE, explanation: post.explanation, tip: pw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = postWrongs >= 2 ? hints?.tier2 : postWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (postWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "fmGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = sealed
    ? settled === "proud"
      ? "Future-you is glad that one is there"
      : "Rubbed out. Future-you says thank you"
    : guided
      ? "Round 1: tap PROUD OF IT or RUB IT OUT"
      : postWrongs > 0
        ? "Picture them reading it. Would you still want it up?"
        : "Would grown-up you be happy for them to see it?";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The mirror: grown-up you, the viewer, and the post in the glass ───────── */
  const mirror: ReactNode = post ? (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
        <PixIcon emoji="✨" size={16} />
        <span>{mirrorLabel}</span>
        <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
          {Math.min(idx + (sealed ? 1 : 0), deck.length)} of {deck.length}
        </span>
      </div>
      <div
        style={{
          position: "relative",
          width: "100%",
          borderRadius: "120px 120px 22px 22px",
          background: GLASS_BG,
          border: `2px solid ${sealed ? (settled === "proud" ? PROUD_GREEN : RUB_AMBER) : "rgba(226,240,255,0.5)"}`,
          boxShadow: sealed
            ? `0 0 26px ${settled === "proud" ? "rgba(126,226,168,0.4)" : "rgba(255,209,88,0.34)"}, inset 0 1px 0 rgba(255,255,255,0.2)`
            : "0 18px 40px -24px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.2)",
          padding: "16px 16px 18px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
          color: "#fff7e6",
          overflow: "hidden",
          transition: "border-color 260ms ease, box-shadow 260ms ease",
        }}
      >
        {/* Grown-up you on one side of the glass, the person looking you up on
            the other. Both are the same size: neither is the answer. */}
        <div style={{ width: "100%", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                width: FACE,
                height: FACE,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "rgba(8,10,22,0.45)",
                border: "2px solid rgba(226,240,255,0.6)",
              }}
            >
              <PixIcon emoji="🎓" size={34} />
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,247,230,0.8)", overflowWrap: "anywhere" }}>
              {GROWN_UP_LABEL}
            </span>
          </span>

          <AnimatePresence mode="wait">
            <motion.span
              key={`viewer-${post.id}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.12 } }}
              transition={{ duration: 0.26 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                minWidth: 0,
                maxWidth: "100%",
                padding: "6px 12px 6px 6px",
                borderRadius: 999,
                background: "rgba(8,10,22,0.55)",
                border: `1.5px solid ${accent}`,
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
                  background: "rgba(8,10,22,0.5)",
                  border: `1.5px solid ${accent}`,
                }}
              >
                <PixIcon emoji="👀" size={22} />
              </span>
              <span style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontFamily: LABEL_FONT, fontSize: 9.5, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, overflowWrap: "anywhere" }}>
                  {viewerPrefix}
                </span>
                <span style={{ fontFamily: KID_FONT, fontSize: 14, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}>
                  {post.viewer}
                </span>
              </span>
            </motion.span>
          </AnimatePresence>
        </div>

        {/* The post, held up to the glass. */}
        <div style={{ position: "relative", width: "100%", minHeight: POST_MIN_H, display: "grid", placeItems: "center" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={`post-${post.id}`}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, rotate: -2 }}
              animate={{
                opacity: sealed && settled === "rub" ? 0.4 : 1,
                y: 0,
                rotate: sealed && settled === "rub" ? -3 : 0,
              }}
              exit={{ opacity: 0, transition: { duration: 0.14 } }}
              transition={reduce ? { duration: 0.22 } : { type: "spring", stiffness: 240, damping: 24 }}
              style={{
                width: "100%",
                maxWidth: 460,
                minHeight: POST_MIN_H,
                padding: "12px 14px",
                borderRadius: 18,
                background: PAPER,
                border: `3px solid ${sealed ? (settled === "proud" ? "#16a34a" : "rgba(42,31,24,0.35)") : "#ffffff"}`,
                boxShadow: "0 12px 24px -14px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
                color: INK,
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: KID_FONT,
                transition: "border-color 240ms ease",
              }}
            >
              <span
                aria-hidden
                style={{
                  flexShrink: 0,
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(42,31,24,0.08)",
                  border: "2px solid rgba(42,31,24,0.18)",
                }}
              >
                <PixIcon emoji={post.icon} size={32} />
              </span>
              <span style={{ flex: 1, minWidth: 0, fontSize: 16.5, fontWeight: 800, lineHeight: 1.3, overflowWrap: "anywhere" }}>
                &ldquo;{post.text}&rdquo;
              </span>
            </motion.div>
          </AnimatePresence>

          {/* The mirror's reaction. Centred with x/y so the spring never fights
              a static translate. */}
          <AnimatePresence>
            {sealed && (
              <motion.div
                key={`react-${post.id}`}
                role="status"
                initial={reduce ? { opacity: 0, x: "-50%", y: "-50%" } : { opacity: 0, x: "-50%", y: "-50%", scale: 1.7, rotate: -14 }}
                animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1, rotate: -5 }}
                exit={{ opacity: 0, x: "-50%", y: "-50%", transition: { duration: 0.12 } }}
                transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.12 }}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  zIndex: 3,
                  maxWidth: "94%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "9px 16px",
                  borderRadius: 12,
                  border: `4px double ${settled === "proud" ? PROUD_GREEN : RUB_AMBER}`,
                  color: settled === "proud" ? "#a0ffb0" : "#ffe6a8",
                  background: "rgba(8,10,22,0.92)",
                  fontFamily: LABEL_FONT,
                  fontWeight: 900,
                  fontSize: 15,
                  letterSpacing: "0.1em",
                  lineHeight: 1.2,
                  textTransform: "uppercase",
                  textAlign: "center",
                  boxShadow: `0 0 22px ${settled === "proud" ? "rgba(126,226,168,0.5)" : "rgba(255,209,88,0.45)"}`,
                  pointerEvents: "none",
                }}
              >
                <PixIcon emoji={settled === "proud" ? "👍" : "🗑️"} size={22} />
                <span>{settled === "proud" ? proudLabel : RUBBED_STAMP}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  ) : null;

  /* ───────── The two calls. Same size, same place, every single round ───────── */
  const renderCall = (choice: Call): ReactNode => {
    const isProud = choice === "proud";
    const tone = isProud ? PROUD_GREEN : RUB_AMBER;
    const chosen = settled === choice;
    const glow = guided && !sealed && !speaking;
    return (
      <motion.button
        key={choice}
        type="button"
        aria-label={isProud ? proudLabel : rubLabel}
        onClick={() => call(choice)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.24, delay: reduce ? 0 : isProud ? 0.1 : 0.18 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${BUTTON_MIN_W}px`,
          minWidth: 0,
          minHeight: BUTTON_MIN_H,
          padding: "10px 14px",
          borderRadius: 18,
          // Both calls wear the same paper and the same size; only the meaning
          // differs, and the pair never swaps sides, so the test is learnable.
          background: PAPER,
          border: `3px solid ${chosen ? tone : "#ffffff"}`,
          boxShadow: chosen
            ? `0 0 22px ${isProud ? "rgba(126,226,168,0.55)" : "rgba(255,209,88,0.5)"}, inset 0 0 0 1.5px rgba(42,31,24,0.14)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
          color: INK,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          fontFamily: KID_FONT,
          fontSize: 17,
          fontWeight: 900,
          lineHeight: 1.2,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        <PixIcon emoji={isProud ? "👍" : "🗑️"} size={34} />
        <span style={{ overflowWrap: "anywhere" }}>{isProud ? proudLabel : rubLabel}</span>
      </motion.button>
    );
  };

  // Complete-beat story: how many of the trail's posts future-you was happy to
  // keep, out of everything held up to the glass.
  const proudCount = deck.filter((x) => x.proud).length;

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

      {/* Sarah's read-alouds (audio only): the how-to once, then each post as it
          reaches the glass. Every line comes from the week file. */}
      {!showIntro && !finished && post && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="fm-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`fm-read-${post.id}`} speaker={voice} lines={[post.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && post && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Post {Math.min(idx + 1, deck.length)} of {deck.length}
            </span>
          </div>

          {/* The board: the mirror and the two calls. Inset 22px so it never
              collides with the frame's rounded corners. */}
          <div
            style={{
              margin: "0 22px",
              padding: "12px 12px 12px",
              borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 12,
            }}
          >
            {mirror}

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6, textAlign: "center" }}>
                <PixIcon emoji="❓" size={16} />
                {ASK_PROMPT}
              </div>
              <div
                role="group"
                aria-label={ASK_PROMPT}
                style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}
              >
                {/* Fixed order, every round: PROUD left, RUB IT OUT right. */}
                {renderCall("proud")}
                {renderCall("rub")}
              </div>
            </div>
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
            @keyframes fmGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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

      {/* The payoff waits for Sarah: a complete beat that mounts while the last
          verdict is still speaking would cut her off (the Week 9 bug). */}
      {finished && !verdict.speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${deck.length} post${deck.length === 1 ? "" : "s"} held up to the mirror, ${proudCount} worth keeping`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
