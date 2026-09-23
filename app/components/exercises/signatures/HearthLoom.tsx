"use client";

/**
 * HearthLoom: the IS THAT RULE FAIR drill (Week 19, concept 3).
 *
 * This week's old screen-4 signature, rebuilt to the Learn-Loop standard,
 * CONVERTED TO TAP-ONLY and RE-VERBED. The original had the child drag a glowing
 * thread from a defence charm on the wall down to the family member it fitted.
 * Two problems. It was a drag, on SVG lines, which is the least forgiving input
 * a nine year old has. And the verb underneath it, match the charm to the
 * situation, is the same one Week 1, 6 and 14 spend on Sign Bingo and Weeks 1, 7
 * and 13 spend on the Memory Match, both of which are now at their three-use cap.
 * A fourth would have been the same game in a nicer jumper.
 *
 * The hearth stays, the loom stays, the family quilt stays. What changed is the
 * question. The family is writing its house rules, one square at a time, and the
 * child's job is to decide whether each proposed rule goes into the quilt or
 * gets unpicked. Not whether it is SAFE, which they could do in their sleep by
 * now. Whether it is FAIR.
 *
 * That is the split from Week 13, and it is the whole reason this beat exists.
 * Week 13's Set It Before You Start is MY plan for MY screen time, decided by
 * me. This is a rule the whole house has to live under, which means it has to
 * pass a test a personal plan never faces: does it apply to everybody, and would
 * the person it lands hardest on still agree to it? "Nobody brings a tablet to
 * the table" is a rule. "Sam has to ask before he goes online but nobody else
 * does" is a punishment with a rule's haircut on. Both are perfectly safe. Only
 * one of them will survive contact with a real family.
 *
 * Verb: JUDGE A RULE FOR FAIRNESS. Nothing else in the library judges anything
 * on fairness: every other board asks safe or risky, real or fake, mine or
 * theirs. It is NOT a charm-to-person match (what this game used to be, and what
 * Sign Bingo and the Memory Match already do): nothing is matched to anybody and
 * the family members are not answers. It is NOT a safe-or-risky sort: every rule
 * on the loom is safe, and saying so is not the answer to anything. It is NOT a
 * decide-what-you-would-do card (Track Back, the Drill Run are): the child is not
 * in the scene, they are judging a proposal somebody else made.
 *
 * Nothing races the child: tap-only, untimed, no lose state, and an unfair rule
 * waved through costs nothing beyond Sarah pointing at who it lands on.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and each rule read as its square comes up (audio-only, `recordedOnly`, taps
 * held, released by the shared SPOKEN_GATE_MAX_MS), a one-take spoken verdict on
 * the call ("That's right!" + that rule's `why` via VerdictVoice; a wrong call:
 * WrongAnswerPanel speaks "Not quite." + its `explanation`), hint tiers, and a
 * payoff on the complete beat gated on `!verdict.speaking` so it can never cut
 * Sarah off. The next square arrives from the verdict's own callback. A
 * synchronous ref latch shuts both answers the instant one is pressed (the real
 * Week 12 bug).
 *
 * The RULES are shuffled every play. The two answers are FIXED, weave then
 * unpick, on every square and every play.
 *
 * CRITICAL for the week author: every spoken string arrives through props
 * (`introNarration`, `coachLines`, `threat`, each rule's `readAloud`, its `why`
 * and `explanation`, `hints`, `completeNarration`). The clip generator reads the
 * WEEK FILE, so anything left to a component default is never recorded and plays
 * as silence. `text` and `proposedBy` are READ ON SCREEN, never spoken.
 *
 * Authoring: five or six rules reads best, and at least TWO must be unfair, or
 * the child learns to wave everything through. An unfair rule must be genuinely
 * SAFE and genuinely unfair, singling one person out or binding the children
 * while leaving the grown-ups alone. Never write an unfair rule that is also
 * unsafe: the child would reject it for the wrong reason and learn nothing. A
 * fair rule's `why` should say who it covers ("that one lands on everybody,
 * grown-ups included"), and an unfair one's should name who it lands on. Keep
 * `text` to about 60 characters. Every icon must be in PixIcon's MAP.
 *
 * Layout budget at the owner's 1414x771 window (HUD 64 + stage padding 40, so
 * the stage holds ~627px before it grows): header 29 + marginBottom 10 + board
 * 26 + quilt strip 74 + square 190 + gap 12 + ask row 20 + answers 92 + strip 28
 * + hint gap 8 = ~489px, so the quilt, the square and both answers are on screen
 * without a scroll. At 400px the answers fall to one column.
 */

import { useEffect, useRef, useState, type CSSProperties } from "react";
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

/** The two answers. Fixed in this order on every square and every play. */
export type RuleCall = "weave" | "unpick";
const CALLS: RuleCall[] = ["weave", "unpick"];

export interface HouseRule {
  id: string;
  /** The rule as somebody said it. Read on screen, never spoken. */
  text: string;
  /** Who suggested it. Read on screen, never spoken. */
  proposedBy: string;
  icon: string;
  /** Read aloud as the square comes up. Never says whether it is fair. */
  readAloud: string;
  /**
   * True when the rule is FAIR: it covers everybody, grown-ups included, and
   * the person it lands hardest on would still agree to it. Every rule here is
   * SAFE either way, which is the point: safety is not what is being judged.
   */
  fair: boolean;
  /** SPOKEN on the right call. */
  why: string;
  /** SPOKEN on a wrong call. */
  explanation: string;
}

export interface HearthLoomProps {
  rules: HouseRule[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  quiltLabel?: string;
  weaveLabel?: string;
  unpickLabel?: string;
  askPrompt?: string;
  counterLabel?: string;
  proposedLabel?: string;
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

const CALL_TOAST = "SQUARE SETTLED!";
const WRONG_TITLE = "Have another look at who that lands on";

/**
 * The LEGACY SIGNATURE MOUNT's fallback rules, and nothing else. Week 19 plays
 * this as a regular data-driven exercise. These lines live in the component
 * rather than a week file, so the clip generator never sees them and Sarah never
 * reads them (the Week 11 re-theme trap).
 */
const DEFAULT_RULES: HouseRule[] = [
  {
    id: "legacy-table", text: "No tablets at the dinner table", proposedBy: "Mum", icon: "🏠",
    readAloud: "First square. No tablets at the dinner table.",
    fair: true,
    why: "That one lands on everybody, grown-ups included, so it is a rule rather than a telling-off.",
    explanation: "Check who it covers. Everybody at that table, which is what makes it fair.",
  },
  {
    id: "legacy-sam", text: "Only Sam has to ask before going online", proposedBy: "Sam's brother", icon: "👤",
    readAloud: "Next square. Only Sam has to ask before going online.",
    fair: false,
    why: "It is perfectly safe and it lands on one person, which makes it a punishment with a rule's haircut on.",
    explanation: "Read the first word again. Only Sam. A rule that names one person is not a house rule.",
  },
];

const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";
const SQUARE_MAX_W = 420;
const ANSWER_MIN_H = 88;
const ANSWER_MIN_W = 200;

/** Paints. Firelight on wool. */
const HEARTH = "linear-gradient(180deg, #3a2417 0%, #2b1a11 58%, #1d120b 100%)";
const SQUARE = "linear-gradient(160deg, #fff4df 0%, #f0dcba 100%)";
const WOOL_GOLD = "#d9a441";
const INK = "#33241a";
const WEAVE_GREEN = "#2f8f5b";
const UNPICK_RED = "#c2655a";
const RIGHT_GREEN = "#16a34a";

export default function HearthLoom({
  rules,
  introTitle = "The Family Quilt",
  introSubtitle = "The house is writing its rules. Every one is safe. Only some of them are fair.",
  introIcon = "👪",
  quiltLabel = "THE QUILT SO FAR",
  weaveLabel = "WEAVE IT IN",
  unpickLabel = "UNPICK IT",
  askPrompt = "Is that one fair on everybody?",
  counterLabel = "Square",
  proposedLabel = "SUGGESTED BY",
  completeTitle = "Quilt finished!",
  completeLine = "Safe was never the hard part, Cyber Hero. Fair is what makes a rule stick.",
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
}: HearthLoomProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#2b7fff";
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [called, setCalled] = useState<RuleCall | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [ruleWrongs, setRuleWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  /** Squares actually woven in, for the quilt strip along the top. */
  const [woven, setWoven] = useState<{ id: string; icon: string }[]>([]);

  const deck = useShuffledOnce(rules?.length ? rules : DEFAULT_RULES, { key: "hearth-loom" });
  const finished = deck.length > 0 && idx >= deck.length;
  const rule = deck[idx];
  const settled = called !== null;
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
    setCalled(null);
    setRuleWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  /* ───────── THE CALL: does this square go into the quilt? ───────── */
  const call = (choice: RuleCall) => {
    if (!rule || speaking || settled) return;
    if (handlingRef.current) return;
    handlingRef.current = true;
    const want: RuleCall = rule.fair ? "weave" : "unpick";
    const right = choice === want;
    onAnswered?.({
      questionKey: `hearthloom-${rule.id}`,
      selectedIndex: CALLS.indexOf(choice),
      correctIndex: CALLS.indexOf(want),
      wasCorrect: right,
    });
    if (right) {
      audio.select();
      fx.correct({ xp: 25, text: CALL_TOAST });
      onCorrect?.();
      setCalled(choice);
      if (choice === "weave") setWoven((w) => [...w, { id: rule.id, icon: rule.icon }]);
      verdict.say("right", rule.why, () => {
        window.setTimeout(advance, reduce ? 250 : 1100);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      const rw = ruleWrongs + 1;
      setRuleWrongs(rw);
      setFeedback({ title: WRONG_TITLE, explanation: rule.explanation, tip: rw >= 2 ? hints?.tier2 : hints?.tier1 });
      handlingRef.current = false;
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = ruleWrongs >= 2 ? hints?.tier2 : ruleWrongs === 1 ? hints?.tier1 : undefined;
  const hintTier = (ruleWrongs >= 2 ? 2 : 1) as 1 | 2;
  const guideStyle = (on: boolean): CSSProperties =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "hlGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = settled
    ? called === "weave" ? "Woven in. The next square is coming" : "Unpicked. The next square is coming"
    : ruleWrongs > 0
      ? "It is safe either way. Ask who it actually LANDS on"
      : guided
        ? "Square 1: every rule here is safe. Is this one FAIR?"
        : "Is that one fair on everybody in the house?";

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800,
    letterSpacing: "0.2em", textTransform: "uppercase", color: accent,
  };

  const renderAnswer = (c: RuleCall) => {
    const face = c === "weave"
      ? { label: weaveLabel, icon: "🧩", tint: WEAVE_GREEN, note: "Fair on everybody" }
      : { label: unpickLabel, icon: "🗑️", tint: UNPICK_RED, note: "Lands on one person" };
    const chosen = called === c;
    const glow = guided && !settled && !feedback && narr === "idle";
    return (
      <motion.button
        key={c}
        type="button"
        aria-label={face.label}
        onClick={() => call(c)}
        disabled={speaking}
        initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
        style={{
          position: "relative",
          flex: `1 1 ${ANSWER_MIN_W}px`,
          minWidth: 0,
          minHeight: ANSWER_MIN_H,
          padding: "10px 12px",
          borderRadius: 14,
          background: "#fffaf0",
          border: `3px solid ${chosen ? RIGHT_GREEN : "#ffffff"}`,
          boxShadow: chosen
            ? `0 0 20px ${RIGHT_GREEN}80, inset 0 0 0 2px rgba(51,36,26,0.14)`
            : "0 10px 20px -12px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(51,36,26,0.12)",
          color: INK,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 4, fontFamily: KID_FONT, fontSize: 14.5, fontWeight: 800, lineHeight: 1.2,
          textAlign: "center",
          cursor: speaking ? "wait" : "pointer",
          touchAction: "manipulation",
          transition: "border-color 200ms ease, box-shadow 200ms ease",
          ...guideStyle(glow),
        }}
      >
        <span aria-hidden style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, borderRadius: "11px 11px 0 0", background: face.tint }} />
        <PixIcon emoji={face.icon} size={24} />
        <span style={{ overflowWrap: "anywhere" }}>{face.label}</span>
        <span style={{ fontFamily: LABEL_FONT, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.58 }}>
          {face.note}
        </span>
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
      {!showIntro && !finished && rule && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="hl-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`hl-read-${rule.id}`} speaker={voice} lines={[rule.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && rule && (
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
            {/* THE QUILT, growing a square at a time. Unpicked rules leave no
                hole in it: they simply never went in. */}
            <div style={{ width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, minHeight: 16, ...eyebrowStyle }}>
                <PixIcon emoji="🧩" size={15} />
                <span>{quiltLabel}</span>
                <span style={{ marginLeft: "auto", color: "rgba(255,247,230,0.65)" }}>
                  {woven.length} woven in
                </span>
              </div>
              <div
                style={{
                  marginTop: 6, minHeight: 46, borderRadius: 12,
                  background: "rgba(0,0,0,0.3)", border: `2px dashed ${WOOL_GOLD}66`,
                  display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", flexWrap: "wrap",
                }}
              >
                {woven.length === 0 && (
                  <span style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(255,247,230,0.4)" }}>
                    nothing woven yet
                  </span>
                )}
                {woven.map((sq) => (
                  <motion.span
                    key={sq.id}
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 320, damping: 16 }}
                    style={{
                      width: 34, height: 34, borderRadius: 7, display: "grid", placeItems: "center",
                      background: SQUARE, border: `2px solid ${WOOL_GOLD}`,
                    }}
                  >
                    <PixIcon emoji={sq.icon} size={20} />
                  </motion.span>
                ))}
              </div>
            </div>

            {/* THE HEARTH, with the square being judged held up in front of it. */}
            <div
              style={{
                width: "100%", borderRadius: 16, background: HEARTH,
                border: "1.5px solid rgba(255,247,230,0.18)", padding: "12px 10px",
                display: "flex", justifyContent: "center", overflow: "hidden",
              }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={rule.id}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0, transition: { duration: 0.12 } } : { opacity: 0, y: -14, transition: { duration: 0.16 } }}
                  transition={{ duration: 0.3 }}
                  style={{
                    width: "100%", maxWidth: SQUARE_MAX_W, minHeight: 150, borderRadius: 14,
                    background: SQUARE, border: `4px solid ${WOOL_GOLD}`,
                    boxShadow: "0 14px 28px -16px rgba(0,0,0,0.9)",
                    padding: "14px 16px", display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center", gap: 8,
                    color: INK, fontFamily: KID_FONT, textAlign: "center",
                  }}
                >
                  <PixIcon emoji={rule.icon} size={34} />
                  <span style={{ fontSize: 16, fontWeight: 900, lineHeight: 1.25, overflowWrap: "anywhere" }}>
                    {rule.text}
                  </span>
                  <span style={{ fontFamily: LABEL_FONT, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", opacity: 0.56 }}>
                    {proposedLabel} {rule.proposedBy}
                  </span>
                </motion.div>
              </AnimatePresence>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ ...eyebrowStyle, minHeight: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <PixIcon emoji="❓" size={16} />
                {askPrompt}
              </div>
              <div role="group" aria-label={askPrompt} style={{ width: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
                {CALLS.map(renderAnswer)}
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
            @keyframes hlGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
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
            `${woven.length} squares in the quilt, and the ones that singled somebody out never made it in`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
