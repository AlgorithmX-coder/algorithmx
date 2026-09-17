"use client";

/**
 * WhoKnows: the WEIGH IT AGAINST A REAL SOURCE drill (Week 10, "Who Would Know?").
 *
 * Every round is one shouty video. It plays at the top of the board with a wild
 * claim across it ("Carrots let you see in the dark like a cat!"), the poster's
 * handle on the bar above and a giant view count beside it, because loud and
 * popular is exactly what makes a claim feel true. Under the video stand three
 * source cards in the same paper, the same size and the same ink: a science
 * book, a vet, a random comment. The child taps the one that would REALLY know.
 * Right, and that source answers in its own words in the answer slot while a
 * CHECKED stamp lands across the video, so the claim has now been weighed
 * against something that can actually check it. Wrong, and Sarah teaches why
 * that source cannot check it at all; the card stays on the table wearing
 * "asked already" and the round waits for the next tap, so the retry is one
 * tap. The view count never moves and the video is never a source.
 *
 * Why it is not the Ask Ring, the Believe-o-Meter or the Mask Peek (owner: "we
 * never copy an exercise"): the Ask Ring asks EVERY friend in a photo and
 * respects each answer, and no ask there is ever judged; the Believe-o-Meter
 * turns a needle to a position on a scale; the Mask Peek lifts one claim to see
 * what it proves. Here there is one judged tap a round, the thing being judged
 * is not the claim but WHO COULD CHECK IT, and the answer arrives as that
 * source speaking. The child never rates the claim true or false, which is the
 * point: a wild claim is not settled by how it feels or how many views it has,
 * it is settled by someone who can go and look.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to
 * once, every claim read aloud as its video arrives (audio-only, `recordedOnly`,
 * taps held), a one-take spoken verdict on the right source ("That's right!" +
 * the source's `why` via VerdictVoice, which is the same sentence printed on
 * the answer card, so there is never a second voice over the first; wrong:
 * WrongAnswerPanel speaks "Not quite." + that option's `explanation`), hint
 * tiers per round, a spoken payoff on the complete beat. The next round is
 * started from the verdict's own callback, so no payoff can ever cut Sarah off.
 * Rounds play in authored order; the source cards are shuffled per round. Round
 * 1 guides the MECHANIC only: every source card breathes together until one is
 * tapped, which shows what to do and hides which one is right. Tap-only, no
 * timer, no lose state, no score pressure.
 *
 * Authoring: exactly one option per round has `isRight: true`. Three options a
 * round (the shuffle needs three or more to be a real muddle: a two-item list
 * always comes back reversed). Keep a label to about 24 characters, a claim to
 * about 60, `why` and `explanation` to one kid-sized sentence each. `why` is
 * the right source's spoken answer; `explanation` is the teach line for a wrong
 * tap, so every option needs one. Every icon must be in PixIcon's MAP or it
 * renders as a flat system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + board 26 (padding and
 * border) + video 202 (eyebrow 22, poster bar 30, screen 96, seek row 14,
 * padding and border 24) + 12 + ask row 30 + sources 104 + 12 + answer slot 78
 * = 464, then strip 28 + hint gap 8, so about 539px. The video, all three
 * sources, the answer and the strip are on screen without a scroll, and the
 * sources stack into one full-width column on a narrow board so no card is ever
 * wider than another.
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

export interface WhoKnowsOption { id: string; label: string; icon: string; isRight: boolean; why: string; explanation: string; }
export interface WhoKnowsRound { id: string; claim: string; poster: string; views: string; options: WhoKnowsOption[]; }
export interface WhoKnowsProps {
  rounds: WhoKnowsRound[];
  introTitle?: string; introSubtitle?: string; introIcon?: string;
  claimLabel?: string;   // default "THE CLAIM"
  askPrompt?: string;    // default "Who would REALLY know?"
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

const EMPTY_OPTIONS: WhoKnowsOption[] = [];
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
/** Board copy that is the same every week (no prop, so no week can drift). */
const RIGHT_TOAST = "REAL SOURCE FOUND!";
const STAMP_TEXT = "CHECKED WITH A REAL SOURCE";
const WRONG_TITLE = "Who could really check it?";
const ANSWER_LABEL = "THE ANSWER";
const ANSWER_EMPTY = "Tap a source to hear the answer";
/** Geometry (px). */
const SOURCE_MIN_W = 168;
const CARD_GAP = 12;
/** Board padding (12 + 12) the wide test adds to the row of sources. */
const BOARD_PAD = 24;
const SCREEN_MIN_H = 96;
const SOURCE_MIN_H = 104;
const SOURCE_MIN_H_NARROW = 62;
const ANSWER_MIN_H = 78;
/** Paints. The video is the loud thing; every source wears the same paper. */
const VIDEO_BG = "linear-gradient(180deg, rgba(24,16,48,0.95) 0%, rgba(10,8,26,0.97) 100%)";
const SCREEN_BG = "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.34) 100%)";
const PAPER = "#fff6e8";
const INK = "#2a1f18";

export default function WhoKnows({
  rounds,
  introTitle = "Who Would Know?",
  introSubtitle = "A video shouts a wild claim. Tap the one who would REALLY know.",
  introIcon = "🔍",
  claimLabel = "THE CLAIM",
  askPrompt = "Who would REALLY know?",
  completeTitle = "Every claim weighed!",
  completeLine = "A video saying it is not proof. Ask someone who can really go and check.",
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
}: WhoKnowsProps) {
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
  // Read-aloud chain: the how-to once as the board appears, then each claim as
  // its video arrives. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "weighed" = the right source answered: the stamp lands on the video while
  // Sarah says why, then the next video arrives.
  const [phase, setPhase] = useState<"play" | "weighed">("play");
  // The source that answered this round (null until the right tap).
  const [answer, setAnswer] = useState<WhoKnowsOption | null>(null);
  // Sources already asked and ruled out this round (by option id).
  const [triedIds, setTriedIds] = useState<Set<string>>(() => new Set());
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  // The board element and its width: three source cards need room side by side,
  // and a narrow frame stacks them into one full-width column (so no card is
  // ever a different size from its neighbours, which would be a hint).
  const [boardEl, setBoardEl] = useState<HTMLDivElement | null>(null);
  const [boardW, setBoardW] = useState(0);

  // Authored order for the videos; the sources are shuffled per round so the
  // one that really knows is never in the same place twice.
  const finished = idx >= rounds.length;
  const r = rounds[idx];
  const options = r?.options ?? EMPTY_OPTIONS;
  const sources = useShuffledOnce(options, { key: r?.id ?? "done" });
  const weighed = phase === "weighed";
  // Round 1 teaches the mechanic only: every card breathes, so the glow says
  // "tap one of these", never which one.
  const guided = idx === 0;
  const wideMin = options.length * SOURCE_MIN_W + Math.max(0, options.length - 1) * CARD_GAP + BOARD_PAD;
  const wide = boardW === 0 || boardW >= wideMin;

  // Spoken verdicts: Sarah says "That's right!" + the source's answer, and the
  // next video waits for her. Wrong taps speak through WrongAnswerPanel.
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || weighed;

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
    setAnswer(null);
    setTriedIds(new Set());
    setRoundWrongs(0);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  // ASK: the only judged tap of the round.
  const ask = (o: WhoKnowsOption) => {
    if (!r || speaking || phase !== "play") return;
    onAnswered?.({
      questionKey: `whoknows-${r.id}`,
      // Indexes are into the AUTHORED option list, whatever slot the shuffle
      // put a card in, so the dashboard always reads the same numbers.
      selectedIndex: r.options.indexOf(o),
      correctIndex: r.options.findIndex((x) => x.isRight),
      wasCorrect: o.isRight,
    });
    if (o.isRight) {
      fx.correct({ xp: 25, text: RIGHT_TOAST });
      onCorrect?.();
      setAnswer(o);
      setPhase("weighed");
      // Sarah: "That's right!" + this source's answer (the same sentence the
      // answer card prints), then the next video. Advancing from her callback
      // is what keeps a payoff from ever cutting her off.
      verdict.say("right", o.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTriedIds((prev) => new Set(prev).add(o.id));
      setTotalWrongs((n) => n + 1);
      const rw = roundWrongs + 1;
      setRoundWrongs(rw);
      // WrongAnswerPanel speaks "Not quite." + this teach line itself; every
      // card stays on the table, so the retry is one tap.
      setFeedback({ title: WRONG_TITLE, explanation: o.explanation, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = roundWrongs >= 2 ? hints?.tier2 : roundWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (roundWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "wkGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = weighed
    ? "Weighed against a real source"
    : guided
      ? "Round 1: tap the one who could really check it"
      : roundWrongs > 0
        ? "Who could go and check it for real? Tap them"
        : "A video said it. Now tap who would REALLY know";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 11,
    fontWeight: 800,
    letterSpacing: "0.16em",
    textTransform: "uppercase",
    color: accent,
  };

  /* ───────── The shouty video: poster, claim, views ───────── */
  const video: ReactNode = r ? (
    <section aria-label={claimLabel} style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, padding: "0 2px", ...eyebrowStyle }}>
        <PixIcon emoji="📣" size={16} />
        <span>{claimLabel}</span>
      </div>
      <div
        style={{
          position: "relative",
          borderRadius: 18,
          background: VIDEO_BG,
          border: `2px solid ${accent}88`,
          boxShadow: `0 18px 40px -22px rgba(0,0,0,0.85), inset 0 0 0 1px ${accent}22`,
          padding: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          color: "#fff7e6",
          fontFamily: KID_FONT,
          animation: reduce || weighed ? undefined : "wkShout 3.2s ease-in-out infinite",
        }}
      >
        {/* Poster bar: the handle that posted it, and how many have watched. */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 30 }}>
          <span
            aria-hidden
            style={{
              flexShrink: 0,
              width: 30,
              height: 30,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              background: "rgba(8,10,22,0.6)",
              border: `1.5px solid ${accent}88`,
            }}
          >
            <PixIcon emoji="👤" size={20} />
          </span>
          <span style={{ flex: 1, minWidth: 0, fontFamily: LABEL_FONT, fontSize: 13, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}>
            {r.poster}
          </span>
          <span
            style={{
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 9px 3px 5px",
              borderRadius: 999,
              background: "rgba(8,10,22,0.6)",
              border: "1px solid rgba(255,255,255,0.18)",
              fontFamily: LABEL_FONT,
              fontSize: 12,
              fontWeight: 900,
              lineHeight: 1,
              color: "#ffd68a",
            }}
          >
            <PixIcon emoji="👀" size={16} />
            {r.views}
          </span>
        </div>

        {/* The screen: the claim, shouted. */}
        <div
          style={{
            minHeight: SCREEN_MIN_H,
            borderRadius: 14,
            background: SCREEN_BG,
            border: "1px solid rgba(255,255,255,0.1)",
            padding: "12px 14px",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 21, fontWeight: 900, lineHeight: 1.25, overflowWrap: "anywhere", textShadow: "0 2px 10px rgba(0,0,0,0.7)" }}>
            &ldquo;{r.claim}&rdquo;
          </span>
        </div>

        {/* Seek row: a play mark and a part-watched bar, so it reads as a video
            without borrowing an emoji that PixIcon has no icon for. */}
        <div aria-hidden style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 14, padding: "0 2px" }}>
          <span
            style={{
              flexShrink: 0,
              width: 0,
              height: 0,
              borderTop: "7px solid transparent",
              borderBottom: "7px solid transparent",
              borderLeft: `11px solid ${accent}`,
            }}
          />
          <span style={{ position: "relative", flex: 1, height: 4, borderRadius: 3, background: "rgba(255,255,255,0.16)" }}>
            <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "38%", borderRadius: 3, background: accent }} />
            <span style={{ position: "absolute", left: "38%", top: -3, width: 10, height: 10, marginLeft: -5, borderRadius: "50%", background: "#fff7e6" }} />
          </span>
        </div>

        {/* The stamp lands only once a real source has answered. */}
        <AnimatePresence>
          {weighed && (
            <motion.div
              key={`stamp-${r.id}`}
              role="status"
              initial={reduce ? { opacity: 0, x: "-50%", y: "-50%" } : { opacity: 0, x: "-50%", y: "-50%", scale: 1.8, rotate: -18 }}
              animate={{ opacity: 1, x: "-50%", y: "-50%", scale: 1, rotate: -6 }}
              exit={{ opacity: 0, x: "-50%", y: "-50%", transition: { duration: 0.12 } }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14, delay: 0.12 }}
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                zIndex: 4,
                maxWidth: "92%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "9px 16px",
                borderRadius: 12,
                border: "4px double #34d399",
                color: "#a0ffb0",
                background: "rgba(8,10,22,0.92)",
                fontFamily: LABEL_FONT,
                fontWeight: 900,
                fontSize: 15,
                letterSpacing: "0.1em",
                lineHeight: 1.2,
                textTransform: "uppercase",
                textAlign: "center",
                boxShadow: "0 0 22px rgba(52,211,153,0.5)",
                pointerEvents: "none",
              }}
            >
              <PixIcon emoji="✅" size={22} />
              <span>{STAMP_TEXT}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  ) : null;

  /* ───────── One source card. Same paper, size and ink for every source ───────── */
  const renderSource = (o: WhoKnowsOption, order: number): ReactNode => {
    if (!r) return null;
    const answered = weighed && answer?.id === o.id;
    const ruledOut = triedIds.has(o.id);
    const glow = guided && phase === "play" && !speaking;
    return (
      <motion.button
        key={`${r.id}-${o.id}`}
        type="button"
        aria-label={ruledOut ? `${o.label}, asked already` : o.label}
        onClick={() => ask(o)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
        animate={{ opacity: ruledOut && !answered ? 0.55 : 1, y: 0 }}
        transition={{ duration: 0.26, delay: reduce ? 0 : 0.12 + order * 0.08 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          width: "100%",
          minHeight: wide ? SOURCE_MIN_H : SOURCE_MIN_H_NARROW,
          padding: wide ? "12px 10px" : "10px 12px",
          borderRadius: 16,
          // Every source wears the same paper, the same size and the same ink
          // until it is tapped: nothing here can hint at who really knows.
          background: PAPER,
          border: `3px solid ${answered ? "#16a34a" : "#ffffff"}`,
          boxShadow: answered
            ? "0 0 20px rgba(22,163,74,0.5), inset 0 0 0 1.5px rgba(42,31,24,0.14)"
            : "0 8px 16px -10px rgba(0,0,0,0.85), inset 0 0 0 1.5px rgba(42,31,24,0.14)",
          color: INK,
          display: "flex",
          flexDirection: wide ? "column" : "row",
          alignItems: "center",
          justifyContent: wide ? "center" : "flex-start",
          gap: wide ? 6 : 10,
          textAlign: wide ? "center" : "left",
          fontFamily: KID_FONT,
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        <span aria-hidden style={{ flexShrink: 0, display: "grid", placeItems: "center" }}>
          <PixIcon emoji={o.icon} size={wide ? 38 : 30} />
        </span>
        <span style={{ flex: wide ? undefined : 1, minWidth: 0, fontSize: 14.5, fontWeight: 800, lineHeight: 1.2, overflowWrap: "anywhere" }}>
          {o.label}
        </span>
        {answered && (
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

  /* ───────── The answer slot: kept open all round so nothing jumps ───────── */
  const answerSlot: ReactNode = r ? (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, padding: "0 2px", ...eyebrowStyle }}>
        <PixIcon emoji="💬" size={16} />
        <span>{ANSWER_LABEL}</span>
      </div>
      <div
        role="status"
        style={{
          minHeight: ANSWER_MIN_H,
          borderRadius: 16,
          border: answer ? `2px solid ${accent}aa` : "2px dashed rgba(255,255,255,0.18)",
          background: answer ? `${accent}1c` : "rgba(0,0,0,0.18)",
          padding: "10px 12px",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#fff7e6",
          fontFamily: KID_FONT,
          transition: "border-color 220ms ease, background 220ms ease",
        }}
      >
        {answer ? (
          <motion.div
            key={`ans-${r.id}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%" }}
          >
            <span
              aria-hidden
              style={{
                flexShrink: 0,
                width: 44,
                height: 44,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                background: "rgba(8,10,22,0.55)",
                border: `2px solid ${accent}`,
              }}
            >
              <PixIcon emoji={answer.icon} size={28} />
            </span>
            <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontFamily: LABEL_FONT, fontSize: 10.5, fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, overflowWrap: "anywhere" }}>
                {answer.label}
              </span>
              <span style={{ fontSize: 14.5, fontWeight: 700, lineHeight: 1.3, overflowWrap: "anywhere" }}>
                &ldquo;{answer.why}&rdquo;
              </span>
            </span>
          </motion.div>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, opacity: 0.6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase" }}>
            <PixIcon emoji="❓" size={20} />
            {ANSWER_EMPTY}
          </span>
        )}
      </div>
    </div>
  ) : null;

  // Complete-beat story: how many wild claims were weighed, and by how many
  // different kinds of source.
  const sourceKinds = new Set(rounds.map((x) => x.options.find((o) => o.isRight)?.label ?? "")).size;

  return (
    <ExerciseFrame maxWidth={760} decor>
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

      {/* Sarah's read-alouds (audio only): the how-to once, then every claim. */}
      {!showIntro && !finished && r && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="wk-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`wk-read-${r.id}`} speaker={voice} lines={[r.claim]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
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

          {/* The board: the video, the question, the sources, the answer. */}
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
              gap: 12,
            }}
          >
            {video}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, minHeight: 20 }}>
              <PixIcon emoji="🔍" size={18} />
              <span style={{ fontFamily: LABEL_FONT, fontSize: 13.5, fontWeight: 900, letterSpacing: "0.04em", color: "#fff7e6", textAlign: "center", overflowWrap: "anywhere" }}>
                {askPrompt}
              </span>
            </div>

            <div
              role="group"
              aria-label={askPrompt}
              style={{
                display: "grid",
                gridTemplateColumns: wide ? `repeat(${Math.max(1, sources.length)}, minmax(0, 1fr))` : "minmax(0, 1fr)",
                gap: CARD_GAP,
              }}
            >
              {sources.map(renderSource)}
            </div>

            {answerSlot}
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
            @keyframes wkGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
            @keyframes wkShout { 0%,100% { box-shadow: 0 18px 40px -22px rgba(0,0,0,0.85), inset 0 0 0 1px ${accent}22 } 50% { box-shadow: 0 18px 40px -22px rgba(0,0,0,0.85), 0 0 26px ${accent}55, inset 0 0 0 1px ${accent}55 } }
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
            `${rounds.length} wild claim${rounds.length === 1 ? "" : "s"} weighed against ${sourceKinds} real source${sourceKinds === 1 ? "" : "s"}`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
