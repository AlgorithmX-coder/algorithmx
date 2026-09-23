"use client";

/**
 * SpeakUp: the SAY IT BEFORE IT HAPPENS drill (Week 19, "Freeze the Moment").
 *
 * Everything the child has learned across nineteen weeks is worth nothing in
 * the one scene this game is about: somebody they love, thumb already moving,
 * about to do the thing. Knowing it is a scam is not the skill here. Saying so,
 * out loud, in the two seconds before the tap, to a grown-up who is in a hurry
 * and quite possibly annoyed, is the skill. It is the hardest thing this course
 * ever asks of a child and it gets its own beat.
 *
 * So each round is a scene caught mid-motion, and the child picks what they say
 * RIGHT NOW. The answers are not right and wrong facts, they are what actually
 * comes out of a nine year old's mouth in that moment: saying nothing because
 * it feels rude to interrupt a grown-up, waiting for a better time that never
 * arrives, and the one short sentence that stops a thumb.
 *
 * The one that works is always SHORT, always about the THING rather than the
 * person, and always asks rather than accuses: "Wait, can I look at that with
 * you first?" A child who has a sentence ready will use it; a child who only
 * has a feeling will stand there. Handing them the actual words is the whole
 * point of the beat.
 *
 * SAYING NOTHING IS NEVER PUNISHED. It is offered every round, it is the most
 * honest answer a shy child can give, and when it is picked Sarah says plainly
 * that it is the thing almost everybody does and then gives them the sentence
 * to use instead. No scolding lives in this game anywhere. A child made to feel
 * bad for freezing is a child who will freeze harder next time.
 *
 * Verb: SAY THE THING, NOW. It is NOT choosing an action (Track Back, the Drill
 * Run, the Trail Planner are): nothing is done here, only said, and the scene is
 * frozen mid-motion rather than waiting politely for a decision. It is NOT
 * beat 1's Explain It (this same week): that is a calm kitchen and somebody ASKED
 * for help, and this is an interruption nobody asked for, which is exactly what
 * makes it hard. It is NOT a spot-the-scam drill: the child already knows, and
 * the game says so out loud in every scene.
 *
 * Nothing races the child despite the fiction: the scene is frozen, there is no
 * timer, tap-only, no lose state.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and each scene spoken as it freezes (audio-only, `recordedOnly`, taps held,
 * released by the shared SPOKEN_GATE_MAX_MS), a one-take spoken verdict on the
 * pick ("That's right!" + that line's `why` via VerdictVoice; anything else:
 * WrongAnswerPanel speaks "Not quite." + its `explanation`), hint tiers, and a
 * payoff on the complete beat gated on `!verdict.speaking` so it can never cut
 * Sarah off. A synchronous ref latch shuts the answers the instant one is
 * pressed (the real Week 12 bug).
 *
 * The SCENES are shuffled every play, and so are the three LINES inside each,
 * so the sentence that works is never in the same place twice.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each scene's `readAloud`, every
 * line's `why` and `explanation`, `hints`, `completeNarration`). The clip
 * generator reads the WEEK FILE, so anything left to a component default is
 * never recorded and plays as silence. `scene`, `doing` and each line's `says`
 * are READ ON SCREEN, never spoken. A line speaks exactly ONE side.
 *
 * Authoring: four scenes reads best, three lines each, exactly one `works`. One
 * of the other two must ALWAYS be the say-nothing option, phrased without
 * shame ("Say nothing. They are busy and it feels rude to butt in."). The line
 * that works must be under about twelve words, because a long sentence is one
 * a frightened child will not get out. Its `why` should say what the sentence
 * DID ("that gave Dad a reason to stop, and no reason to be cross"). Keep
 * `scene` to about two short lines. Every icon must be in PixIcon's MAP.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 + eyebrow 22 + frozen scene 150 + gap 12 + ask row 20 + three lines 258 +
 * strip 28 + hint gap 8 = ~563px, so the scene and all three lines are on
 * screen without a scroll.
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

const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;

export interface SpeakLine {
  id: string;
  /** What the child says, or does not. Read on screen, never spoken. */
  says: string;
  /** Exactly one per scene. Must be under about twelve words. */
  works?: boolean;
  /** SPOKEN when the working line is picked. Says what the sentence DID. */
  why?: string;
  /** SPOKEN otherwise. Never scolds, especially not the say-nothing option. */
  explanation?: string;
}

export interface SpeakScene {
  id: string;
  /** Where this is happening. Read on screen, never spoken. */
  scene: string;
  icon: string;
  /** What the grown-up is doing THIS SECOND. Read on screen, never spoken. */
  doing: string;
  /** Spoken as the scene freezes. */
  readAloud: string;
  lines: SpeakLine[];
}

export interface SpeakUpProps {
  scenes: SpeakScene[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  frozenLabel?: string;
  askPrompt?: string;
  linesLabel?: string;
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

const SAID_TOAST = "YOU SAID IT!";
/** Never the word "wrong": freezing is not a failure, it is the normal thing. */
const WRONG_TITLE = "That is what most people do";
const EMPTY_SCENES: SpeakScene[] = [];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
const LINE_MIN_H = 76;

/** Paints. A scene held still: cool blue-white, like a paused frame. */
const FROZEN = "linear-gradient(180deg, #1d2a3d 0%, #16212f 58%, #101923 100%)";
const SCENE_CARD = "linear-gradient(160deg, #eef7ff 0%, #d6e7f6 100%)";
const LINE_PAPER = "#fffaf0";
const INK = "#1e2c3b";
const RIGHT_GREEN = "#16a34a";
const ICE = "#8fc4ee";

export default function SpeakUp({
  scenes,
  introTitle = "Freeze the Moment",
  introSubtitle = "Their thumb is already moving. You have two seconds. What do you say?",
  introIcon = "✋",
  frozenLabel = "FROZEN, RIGHT NOW",
  askPrompt = "What do you say?",
  linesLabel = "PICK YOUR WORDS",
  counterLabel = "Moment",
  completeTitle = "You said it!",
  completeLine = "Short, about the thing, and asked rather than told. That sentence is yours now.",
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
}: SpeakUpProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [picked, setPicked] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [sceneWrongs, setSceneWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);

  const deck = useShuffledOnce(scenes ?? EMPTY_SCENES, { key: "speak-up" });
  const finished = deck.length > 0 && idx >= deck.length;
  const sc = deck[idx];
  const lines = useShuffledOnce(sc?.lines ?? [], { key: `speak-up-${sc?.id ?? "none"}` });
  const settled = picked !== null;
  const guided = idx === 0;

  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || !!feedback || settled;
  const handlingRef = useRef(false);

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
    setSceneWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const worksIdx = useMemo(() => lines.findIndex((l) => l.works), [lines]);

  const say = (l: SpeakLine) => {
    if (!sc || speaking || settled) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const right = !!l.works;
    onAnswered?.({
      questionKey: `speakup-${sc.id}`,
      selectedIndex: lines.findIndex((x) => x.id === l.id),
      correctIndex: worksIdx,
      wasCorrect: right,
    });
    if (right) {
      audio.select();
      fx.correct({ xp: 25, text: SAID_TOAST });
      onCorrect?.();
      setPicked(l.id);
      verdict.say("right", l.why ?? "", () => {
        window.setTimeout(advance, reduce ? 250 : 1100);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const w = sceneWrongs + 1;
      setSceneWrongs(w);
      // "That is what most people do" - never a telling-off, and never the word
      // wrong. A child made to feel bad for freezing freezes harder next time.
      setFeedback({ title: WRONG_TITLE, explanation: l.explanation ?? "", tip: w >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = sceneWrongs >= 2 ? hints?.tier2 : sceneWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (sceneWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "suGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = settled
    ? "Said it. The next moment is coming"
    : sceneWrongs > 0
      ? "Short, about the THING, and asked rather than told"
      : guided
        ? "Moment 1: their thumb is moving. Pick what you say"
        : "Pick what you say, right now";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800,
    letterSpacing: "0.2em", textTransform: "uppercase", color: accent,
  };

  const renderLine = (l: SpeakLine) => {
    const chosen = picked === l.id;
    const glow = guided && !settled && !feedback && narr === "idle";
    return (
      <motion.button
        key={l.id}
        type="button"
        onClick={() => say(l)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.99 }}
        style={{
          position: "relative",
          width: "100%",
          minHeight: LINE_MIN_H,
          padding: "12px 14px",
          borderRadius: 14,
          background: LINE_PAPER,
          border: `3px solid ${chosen ? RIGHT_GREEN : "#ffffff"}`,
          boxShadow: chosen
            ? `0 0 20px ${RIGHT_GREEN}80, inset 0 0 0 2px rgba(30,44,59,0.14)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(30,44,59,0.12)",
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
        <span style={{ flex: 1, overflowWrap: "anywhere" }}>{l.says}</span>
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

      {/* Gated on !showIntro, always (the SignBingo / SenderLineup bug). */}
      {!showIntro && !finished && sc && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="su-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`su-read-${sc.id}`} speaker={voice} lines={[sc.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && sc && (
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              <PixIcon emoji={introIcon} size={16} />
              {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9e3ff" }}>
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
              <PixIcon emoji="⏸️" size={16} />
              <span>{frozenLabel}</span>
              <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                {Math.min(idx + (settled ? 1 : 0), deck.length)} of {deck.length} caught
              </span>
            </div>

            {/* THE FROZEN FRAME. Held still on purpose: the fiction is urgent,
                the game is not. Nothing here is on a clock. */}
            <div
              style={{
                width: "100%", borderRadius: 16, background: FROZEN,
                border: `1.5px solid ${ICE}44`, padding: "12px 10px",
                display: "flex", justifyContent: "center", overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={sc.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, scale: 0.98, transition: { duration: 0.16 } }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: "100%", maxWidth: 560, borderRadius: 14,
                    background: SCENE_CARD, border: `3px solid ${ICE}`,
                    boxShadow: `0 14px 28px -16px rgba(0,0,0,0.9), 0 0 24px ${ICE}33`,
                    padding: "12px 14px", display: "flex", alignItems: "flex-start", gap: 11,
                    color: INK, fontFamily: KID_FONT,
                  }}
                >
                  <PixIcon emoji={sc.icon} size={36} />
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.58 }}>
                      {sc.scene}
                    </span>
                    <span style={{ display: "block", marginTop: 3, fontSize: 15.5, fontWeight: 800, lineHeight: 1.3, overflowWrap: "anywhere" }}>
                      {sc.doing}
                    </span>
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              <div role="group" aria-label={linesLabel} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
                {lines.map(renderLine)}
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
            @keyframes suGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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

      {finished && !verdict.speaking && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[
            `${deck.length} moments caught, and you had a sentence ready for every one`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
