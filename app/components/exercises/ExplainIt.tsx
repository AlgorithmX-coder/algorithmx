"use client";

/**
 * ExplainIt: the SAY IT SO THEY GET IT drill (Week 19, "You're the Expert Now").
 *
 * Week 19 is the role-flip week: after eighteen weeks the child genuinely knows
 * more about this than most of the grown-ups in their house, and the first thing
 * they have to learn is what to DO with that. Knowing a thing and being able to
 * hand it to somebody else are not the same skill, and the second one is the
 * whole job here.
 *
 * So a grown-up asks a real question, in their own words, and the child gets
 * three answers. Every one of them is TRUE. That is the entire design. One is
 * so technical it helps nobody, one is right but lands like a telling-off, and
 * one is plain and kind and would actually change what that person does next.
 * Being correct is not on the table, because being correct was never the hard
 * part. Being USEFUL is.
 *
 * The kindness is not decoration. A child who explains something to their
 * grandmother by making her feel stupid has not protected her, they have taught
 * her not to ask them again, and the next fake text will arrive with nobody left
 * to ask. That is the actual risk this beat guards against, and it is why the
 * unkind option is always genuinely correct on the facts. A game where the wrong
 * answers were wrong would teach nothing at all about tone.
 *
 * Verb: CHOOSE HOW TO SAY IT. Nothing else in the library judges an answer on
 * anything but whether it is right. It is NOT a what-would-you-do card game
 * (Track Back, the Drill Run, the Trail Planner are): the child is not deciding
 * an action, they are choosing words, and all three actions would be identical.
 * It is NOT a spot-the-scam drill (Week 4's, and this same week's beat 2 are):
 * nothing here is a trick and nobody is lying. It is NOT a reply picker (Week
 * 14's and Week 18's are): those choose what to say to a STRANGER who is working
 * on you, and this chooses what to say to somebody you love who asked for help.
 *
 * Nothing races the child: tap-only, untimed, no lose state, and a clumsy answer
 * costs nothing beyond Sarah saying how it would have landed.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and each question spoken as the person asks it (audio-only, `recordedOnly`,
 * taps held, released by the shared SPOKEN_GATE_MAX_MS), a one-take spoken
 * verdict on the pick ("That's right!" + that answer's `why` via VerdictVoice; a
 * clumsy pick: WrongAnswerPanel speaks "Not quite." + its `explanation`), hint
 * tiers per question, and a payoff on the complete beat gated on
 * `!verdict.speaking` so it can never cut Sarah off. The next question arrives
 * from the verdict's own callback. A synchronous ref latch shuts the answers the
 * instant one is pressed, because `canTap` only closes once React re-renders on
 * `verdict.speaking` and a quick second tap would otherwise restart the verdict
 * and cut Sarah off (the real Week 12 bug).
 *
 * The QUESTIONS are shuffled every play, and so are the three ANSWERS inside
 * each one, so the kind answer is never in the same place twice.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each question's `readAloud`, every
 * answer's `why` and `explanation`, `hints`, `completeNarration`). The clip
 * generator reads the WEEK FILE, so anything left to a component default is
 * never recorded and plays as silence, with no error anywhere. `asks` and each
 * answer's `text` are READ ON SCREEN, never spoken. An answer speaks exactly
 * ONE side: the good one speaks `why` after "That's right!", and the other two
 * speak `explanation` after "Not quite.", so a line in the wrong field is silent
 * even though the field is full.
 *
 * Authoring: four or five questions reads best, three answers each, exactly one
 * marked `good`. EVERY answer must be factually true: an answer that is simply
 * wrong turns this back into a quiz and the beat stops teaching anything about
 * how to talk to people. Give the two clumsy ones different faults, one too
 * technical and one unkind, never two of a kind. A good answer's `why` should
 * say what it does for the PERSON ("Gran can do that on her own next time"),
 * and a clumsy one's `explanation` should say how it would land, never that it
 * was incorrect. Keep `asks` to about two short lines and each `text` to about
 * 90 characters. Every icon must be in PixIcon's MAP or it renders as a flat
 * system emoji.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 + eyebrow 22 + asker card 132 + gap 12 + ask row 20 + three answers 258 +
 * strip 28 + hint gap 8 = ~545px, so the question and all three answers are on
 * screen without a scroll. At 400px the answers keep their column and nothing
 * scrolls sideways.
 */

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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
// she reads is already on screen), same recipe as GlassCheck / FrostMirror.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface ExplainAnswer {
  id: string;
  /** What the child would say. Read on screen, never spoken. MUST be true. */
  text: string;
  /** Exactly one per question. */
  good?: boolean;
  /** SPOKEN when this is the good one and it is picked. Says what it does for
   *  the PERSON, not that it was correct. */
  why?: string;
  /** SPOKEN when a clumsy one is picked. Says how it would LAND, never that it
   *  was wrong: every answer here is true. */
  explanation?: string;
}

export interface ExplainQuestion {
  id: string;
  /** Who is asking. Read on screen, never spoken. */
  who: string;
  icon: string;
  /** Their question, in their own words. Read on screen, never spoken. */
  asks: string;
  /** Spoken as they ask. Never hints at which answer is the kind one. */
  readAloud: string;
  answers: ExplainAnswer[];
}

export interface ExplainItProps {
  questions: ExplainQuestion[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Chrome, never spoken. */
  askerLabel?: string;
  askPrompt?: string;
  answersLabel?: string;
  counterLabel?: string;
  completeTitle?: string;
  completeLine?: string;
  hints?: { tier1: string; tier2: string };
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  threat?: { raccoonLine: string };
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (o: { questionKey: string; selectedIndex: number; correctIndex: number; wasCorrect: boolean }) => void;
}

/** Fixed chrome copy the props do not cover (never spoken). */
const PICK_TOAST = "WELL PUT!";
const WRONG_TITLE = "True, but think how that would land";
const EMPTY_QUESTIONS: ExplainQuestion[] = [];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";

/** Geometry (px). */
const ANSWER_MIN_H = 76;

/** Paints. A warm kitchen at the hearth end of the day: this is the one week
 *  where the danger is not in the room, so nothing here is cold. */
const ROOM = "linear-gradient(180deg, #3a2417 0%, #2b1a11 58%, #1e120b 100%)";
const ASKER_CARD = "linear-gradient(160deg, #fff6e6 0%, #f3e0c2 100%)";
const ANSWER_PAPER = "#fffaf0";
const INK = "#33241a";
const RIGHT_GREEN = "#16a34a";
const WARM = "#e0a13a";

export default function ExplainIt({
  questions,
  introTitle = "You're the Expert Now",
  introSubtitle = "They asked YOU. Every answer here is true, so pick the one that actually helps.",
  introIcon = "🎓",
  askerLabel = "SOMEBODY IS ASKING YOU",
  askPrompt = "What do you say?",
  answersLabel = "ALL THREE ARE TRUE",
  counterLabel = "Question",
  completeTitle = "Explained it!",
  completeLine = "Being right was the easy bit, Cyber Hero. You made it land.",
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
}: ExplainItProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [qWrongs, setQWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  const deck = useShuffledOnce(questions ?? EMPTY_QUESTIONS, { key: "explain-it" });
  const finished = deck.length > 0 && idx >= deck.length;
  const q = deck[idx];
  // The three answers shuffle too, so the kind one is never in the same place.
  const answers = useShuffledOnce(q?.answers ?? [], { key: `explain-it-${q?.id ?? "none"}` });
  const settled = picked !== null;
  const guided = idx === 0;

  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || settled;
  const handlingRef = useRef(false);

  // Safety releases for the spoken gate (never leave the kitchen held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

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
    handlingRef.current = false;
    setIdx((i) => i + 1);
    setPicked(null);
    setQWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const goodIdx = useMemo(() => answers.findIndex((a) => a.good), [answers]);

  /* ───────── THE PICK: choosing how to say it ───────── */
  const pick = (a: ExplainAnswer) => {
    if (!q || speaking || settled) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const right = !!a.good;
    onAnswered?.({
      questionKey: `explainit-${q.id}`,
      selectedIndex: answers.findIndex((x) => x.id === a.id),
      correctIndex: goodIdx,
      wasCorrect: right,
    });
    if (right) {
      audio.select();
      fx.correct({ xp: 25, text: PICK_TOAST });
      onCorrect?.();
      setPicked(a.id);
      verdict.say("right", a.why ?? "", () => {
        window.setTimeout(advance, reduce ? 250 : 1100);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const w = qWrongs + 1;
      setQWrongs(w);
      // "True, but think how that would land" - never "wrong", because it is not.
      setFeedback({ title: WRONG_TITLE, explanation: a.explanation ?? "", tip: w >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = qWrongs >= 2 ? hints?.tier2 : qWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (qWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "eiGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = settled
    ? "Nicely said. The next one is coming"
    : qWrongs > 0
      ? "All three are true. Which one would actually HELP them?"
      : guided
        ? "Question 1: every answer is true, so pick the one that helps"
        : "Pick the one that would actually help them";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800,
    letterSpacing: "0.2em", textTransform: "uppercase", color: accent,
  };

  const renderAnswer = (a: ExplainAnswer) => {
    const chosen = picked === a.id;
    const glow = guided && !settled && !feedback && narr === "idle";
    return (
      <motion.button
        key={a.id}
        type="button"
        onClick={() => pick(a)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.99 }}
        style={{
          position: "relative",
          width: "100%",
          minHeight: ANSWER_MIN_H,
          padding: "12px 14px",
          borderRadius: 14,
          // Every answer wears the same paper and ink. Nothing about how one
          // LOOKS may hint that it is the kind one.
          background: ANSWER_PAPER,
          border: `3px solid ${chosen ? RIGHT_GREEN : "#ffffff"}`,
          boxShadow: chosen
            ? `0 0 20px ${RIGHT_GREEN}80, inset 0 0 0 2px rgba(51,36,26,0.14)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(51,36,26,0.12)",
          color: INK,
          display: "flex",
          alignItems: "center",
          gap: 10,
          textAlign: "left",
          fontFamily: KID_FONT,
          fontSize: 14.5,
          fontWeight: 700,
          lineHeight: 1.3,
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        <PixIcon emoji="💬" size={22} />
        <span style={{ flex: 1, overflowWrap: "anywhere" }}>{a.text}</span>
        {chosen && <PixIcon emoji="✅" size={22} />}
      </motion.button>
    );
  };

  return (
    <ExerciseFrame maxWidth={880} decor>
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

      {/* Sarah's read-alouds (audio only). Gated on !showIntro, always: a board
          line that starts while the intro card is still open clobbers the
          intro's own clip and the "I'm ready" button never appears (the
          SignBingo / SenderLineup bug). Every line comes from the week file. */}
      {!showIntro && !finished && q && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="ei-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`ei-read-${q.id}`} speaker={voice} lines={[q.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && q && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#ffd9a0" }}>
              {counterLabel} {Math.min(idx + 1, deck.length)} of {deck.length}
            </span>
          </div>

          <div
            style={{
              margin: "0 22px", padding: "12px", borderRadius: 18,
              background: "linear-gradient(180deg, rgba(0,0,0,0.26) 0%, rgba(0,0,0,0.4) 100%)",
              border: `1px solid ${accent}44`,
              boxShadow: `0 18px 40px -22px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent}14`,
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}
          >
            <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 6, minHeight: 18, ...eyebrowStyle }}>
              <PixIcon emoji="👪" size={16} />
              <span>{askerLabel}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                {Math.min(idx + (settled ? 1 : 0), deck.length)} of {deck.length} answered
              </span>
            </div>

            {/* THE KITCHEN, with whoever is asking sitting in it. */}
            <div
              style={{
                width: "100%", borderRadius: 16, background: ROOM,
                border: "1.5px solid rgba(255,247,230,0.18)", padding: "12px 10px",
                display: "flex", justifyContent: "center", overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={q.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, y: -12, transition: { duration: 0.16 } }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: "100%", maxWidth: 560, borderRadius: 14,
                    background: ASKER_CARD, border: `3px solid ${WARM}`,
                    boxShadow: "0 14px 28px -16px rgba(0,0,0,0.9)",
                    padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 11,
                    color: INK, fontFamily: KID_FONT,
                  }}
                >
                  <PixIcon emoji={q.icon} size={36} />
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.6 }}>
                      {q.who}
                    </span>
                    <span style={{ display: "block", marginTop: 3, fontSize: 15.5, fontWeight: 800, lineHeight: 1.3, overflowWrap: "anywhere" }}>
                      {q.asks}
                    </span>
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
                <span style={{ marginLeft: 8, color: "rgba(255,247,230,0.55)", letterSpacing: "0.12em" }}>
                  {answersLabel}
                </span>
              </div>
              <div
                role="group"
                aria-label={answersLabel}
                style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}
              >
                {answers.map(renderAnswer)}
              </div>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes eiGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
            `${deck.length} questions, and every answer you gave was one they could actually use`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
