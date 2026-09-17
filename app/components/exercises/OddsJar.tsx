"use client";

/**
 * OddsJar: the OPEN-AND-TALLY drill (Week 7, "The Odds Jar").
 *
 * A glass jar holds a hundred marbles: ninety-nine grey and ONE gold, always
 * in plain sight. Under its spout sits a loot box, beside it a Spent counter
 * and one big OPEN button. Each round names a prize and its odds; the child
 * taps OPEN the authored number of times and watches a grey marble roll out
 * into the box every time while the coins spent tick up and the gold marble
 * never moves. Only after the last open do three identical cards appear
 * under "So what is true?", and the child picks the one true sentence about
 * what just happened.
 *
 * Why it is not the inspectors, the stampers or the Coin Counter (owner: "we
 * never copy an exercise"): nothing is judged real or fake and no money is
 * counted into a till; the verb is OPEN AND TALLY. The child performs the
 * gamble with their own finger, sees the tally, and the decision is a
 * reflection on the odds, not a spot-the-trick. The jar is built to show the
 * fix is in: the gold marble is always visible and never comes out.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to
 * once and every round read aloud as it arrives (audio-only, `recordedOnly`,
 * taps held), a spoken verdict on every card ("That's right!" + why via
 * VerdictVoice; wrong: WrongAnswerPanel speaks "Not quite." + the card's teach
 * line and the cards stay for the retry), hint tiers per round, a spoken
 * payoff on the complete beat. Rounds play in authored order; the cards are
 * shuffled per round. Round 1 guides the MECHANIC only (OPEN breathes until
 * the first tap); the decision is always the child's. Tap-only, no timer, no
 * lose state. Every card wears the same paint.
 */

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
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

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as ClueStamper / ChatFixer.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export interface OddsCard {
  text: string;
  isTrue: boolean;
  /** Sarah's teach line when this card is picked (fibs only). */
  whyWrong: string;
}

export interface OddsRound {
  id: string;
  /** The prize the box promises, e.g. "Golden Dragon skin". */
  prize: string;
  /** The odds in the child's words, e.g. "1 in 100". */
  oddsLine: string;
  /** Sarah's read-aloud as the round arrives (one clip). */
  readAloud: string;
  /** How many times the child opens the box before the cards appear. */
  opens: number;
  /** Three cards, exactly one `isTrue`. Shuffled per round. */
  cards: OddsCard[];
  /** Sarah's reason on the true card ("That's right!" + why). */
  why: string;
  /** The prompt above the cards. Default "So what is true?". */
  cardPrompt?: string;
}

export interface OddsJarProps {
  /** Played in authored order. */
  rounds: OddsRound[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Text on the one big button. Default "OPEN". */
  openLabel?: string;
  /** Eyebrow on the running-total counter. Default "Spent". */
  spentLabel?: string;
  /** Coins each open costs. Default 1. */
  costPerOpen?: number;
  /** The unit word after the total. Default "coins". */
  coinWord?: string;
  /** Marbles drawn in the jar (one of them gold). Default 100. */
  marbleTotal?: number;
  /** The caption under the jar. Default "100 marbles. 1 gold.". */
  jarNote?: string;
  /** fx.correct toast. */
  trueToast?: string;
  /** WrongAnswerPanel title. */
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

const EMPTY_CARDS: OddsCard[] = [];
const DEFAULT_CARD_PROMPT = "So what is true?";
const KID_FONT = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif";
const LABEL_FONT = "'Space Grotesk', sans-serif";

/* ────── The jar, in SVG user units (drawn at 1:1, 200 x 330) ────── */
const SVG_W = 200;
const SVG_H = 330;
const MARBLE_R = 5;
/** Where a marble sits once it has landed in the loot box (8 per row, from
 *  the bottom-left; the box shows at most three rows). */
const BOX_SLOTS = 24;
const boxSlot = (i: number) => ({ x: 63 + (i % 8) * 10.6, y: 311 - Math.floor(i / 8) * 10.4 });

/** Pack `total` marbles into the jar bottom-up in staggered rows, with a
 *  deterministic wobble so the pile reads as marbles rather than a grid. No
 *  randomness: the same jar every render, every play. */
function packMarbles(total: number): { x: number; y: number }[] {
  const dx = 11.4;
  const dy = 10;
  const left = 44;
  const right = 156;
  const bottom = 180;
  const cols = Math.floor((right - left) / dx) + 1;
  const out: { x: number; y: number }[] = [];
  let row = 0;
  while (out.length < total && row < 40) {
    const odd = row % 2 === 1;
    const n = odd ? cols - 1 : cols;
    for (let k = 0; k < n && out.length < total; k++) {
      const jx = Math.sin((row * 7 + k) * 1.7) * 1.3;
      const jy = Math.cos((row * 3 + k) * 2.3) * 0.8;
      out.push({ x: left + (odd ? dx / 2 : 0) + k * dx + jx, y: bottom - row * dy + jy });
    }
    row += 1;
  }
  return out;
}

export default function OddsJar({
  rounds,
  introTitle = "The Odds Jar",
  introSubtitle = "Open the box, count what you spent, then say what is true.",
  introIcon = "🎁",
  openLabel = "OPEN",
  spentLabel = "Spent",
  costPerOpen = 1,
  coinWord = "coins",
  marbleTotal = 100,
  jarNote,
  trueToast = "TRUE!",
  wrongTitle = "That's the fib",
  completeTitle = "The odds never moved!",
  completeLine = "Opening more never makes the next one due.",
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
}: OddsJarProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#ffd158";
  // Both content voices are Sarah; in-game read-alouds and verdict reasons are
  // recorded under "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;
  const uid = useId();

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Read-aloud chain: the how-to once as the board appears, then each round as
  // it arrives. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  // "sealed" = the true card: the seal lands while Sarah says why, then the
  // next round arrives.
  const [phase, setPhase] = useState<"play" | "sealed">("play");
  // Opens this round; coins spent over the whole game (the running bill).
  const [opens, setOpens] = useState(0);
  const [spent, setSpent] = useState(0);
  const [totalOpens, setTotalOpens] = useState(0);
  // The grey marble rolling from the spout into the box (a one-shot per open).
  const [rolling, setRolling] = useState<{ n: number } | null>(null);
  const [feedback, setFeedback] = useState<null | { title: string; explanation: string; tip?: string }>(null);
  const [roundWrongs, setRoundWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [guidedTaps, setGuidedTaps] = useState(0);
  const rollSeq = useRef(0);

  // Authored order: each round's prize and odds are written to build on the
  // last. The cards are shuffled per round so the truth is never in one slot.
  const finished = idx >= rounds.length;
  const r = rounds[idx];
  const cards = useShuffledOnce(r?.cards ?? EMPTY_CARDS, { key: r?.id ?? "done" });
  const opensWanted = Math.max(1, r?.opens ?? 1);
  // After the authored opens the button stops and the cards appear.
  const decide = !!r && opens >= opensWanted;
  // Round 1 teaches the mechanic only: OPEN breathes until the first tap.
  const guided = idx === 0 && guidedTaps === 0;

  // The jar's marbles: a fixed pile with ONE gold marble that never leaves.
  const total = Math.max(1, Math.floor(marbleTotal));
  const marbles = useMemo(() => packMarbles(total), [total]);
  const goldIndex = Math.min(marbles.length - 1, Math.floor(marbles.length * 0.41));
  const gold = marbles[goldIndex];
  const jarNoteText = jarNote ?? `${total} marbles. 1 gold.`;

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

  // A roll is a one-shot: clear it once the marble has landed so the next
  // open re-triggers and the landed dot takes its place.
  useEffect(() => {
    if (!rolling) return;
    const id = window.setTimeout(() => setRolling(null), 640);
    return () => window.clearTimeout(id);
  }, [rolling]);

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
    setOpens(0);
    setRolling(null);
    setRoundWrongs(0);
    setPhase("play");
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const open = () => {
    if (!r || speaking || rolling || decide) return;
    audio.drop();
    setGuidedTaps((n) => (n === 0 ? 1 : n));
    setOpens((n) => n + 1);
    setTotalOpens((n) => n + 1);
    setSpent((n) => n + costPerOpen);
    if (!reduce) {
      rollSeq.current += 1;
      setRolling({ n: rollSeq.current });
    }
  };

  const pickCard = (card: OddsCard) => {
    if (!r || speaking || !decide) return;
    onAnswered?.({
      questionKey: `odds-${r.id}`,
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
  const openGlow = guided && !speaking && !rolling && !decide;
  const guideStyle = (on: boolean) =>
    on
      ? { boxShadow: `0 0 0 3px ${accent}66, 0 0 22px ${accent}88`, animation: reduce ? undefined : "ojGuide 1.4s ease-in-out infinite" }
      : {};
  const strip = guided
    ? `Round 1: tap ${openLabel} and watch the marble`
    : decide
      ? "Tap the card that is true"
      : `Tap ${openLabel}. ${opensWanted - opens} more to go`;

  // Marbles already resting in the box (the rolling one lands last).
  const landed = Math.max(0, opens - (rolling ? 1 : 0));
  const landing = boxSlot(Math.min(BOX_SLOTS - 1, Math.max(0, opens - 1)));
  const greyFill = `url(#${uid}-grey)`;
  const goldFill = `url(#${uid}-gold)`;

  const eyebrowStyle: CSSProperties = {
    fontFamily: LABEL_FONT,
    fontSize: 10,
    fontWeight: 800,
    letterSpacing: "0.2em",
    textTransform: "uppercase",
    color: accent,
  };

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
            <InfoNarration key="oj-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`oj-read-${r.id}`} speaker={voice} lines={[r.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && r && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              🎁 {introTitle}
            </span>
            <span style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Round {Math.min(idx + 1, rounds.length)} of {rounds.length}
            </span>
          </div>

          {/* This round's prize and odds. */}
          <motion.div
            key={`prize-${r.id}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            style={{ display: "flex", justifyContent: "center", marginBottom: 12, padding: "0 12px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                maxWidth: 620,
                padding: "10px 18px",
                borderRadius: 16,
                background: `${accent}1a`,
                border: `1px solid ${accent}66`,
                color: "#fff7e6",
              }}
            >
              <span aria-hidden style={{ flexShrink: 0 }}>
                <PixIcon emoji="🎁" size={30} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: "block", ...eyebrowStyle }}>Prize</span>
                <span style={{ display: "block", fontFamily: LABEL_FONT, fontWeight: 900, fontSize: 17, lineHeight: 1.2, wordBreak: "break-word" }}>{r.prize}</span>
                <span style={{ display: "block", fontFamily: KID_FONT, fontSize: 14, fontWeight: 800, color: accent, marginTop: 2 }}>{r.oddsLine}</span>
              </span>
            </div>
          </motion.div>

          {/* The jar and box | the counter and the one button */}
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", justifyContent: "center", padding: "0 12px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <svg
                width={SVG_W}
                height={SVG_H}
                viewBox={`0 0 ${SVG_W} ${SVG_H}`}
                role="img"
                aria-label={`${jarNoteText} ${landed} in the box.`}
                style={{ display: "block", overflow: "visible" }}
              >
                <defs>
                  <radialGradient id={`${uid}-grey`} cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#e9edf7" />
                    <stop offset="55%" stopColor="#9aa3b8" />
                    <stop offset="100%" stopColor="#525a70" />
                  </radialGradient>
                  <radialGradient id={`${uid}-gold`} cx="35%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fff8d6" />
                    <stop offset="50%" stopColor="#ffd158" />
                    <stop offset="100%" stopColor="#a86d14" />
                  </radialGradient>
                  <linearGradient id={`${uid}-glass`} x1="0" x2="1">
                    <stop offset="0%" stopColor="rgba(255,255,255,0.17)" />
                    <stop offset="45%" stopColor="rgba(255,255,255,0.04)" />
                    <stop offset="100%" stopColor="rgba(255,255,255,0.13)" />
                  </linearGradient>
                </defs>

                {/* Lid and neck */}
                <rect x="60" y="8" width="80" height="20" rx="6" fill="#3b4368" stroke="rgba(255,255,255,0.25)" />
                <rect x="70" y="26" width="60" height="14" fill="#2b3255" />

                {/* Glass body with a funnel down to the spout */}
                <path
                  d="M 30 66 Q 30 38 58 38 L 142 38 Q 170 38 170 66 L 170 188 L 112 216 L 112 238 L 88 238 L 88 216 L 30 188 Z"
                  fill={`url(#${uid}-glass)`}
                  stroke="rgba(255,255,255,0.42)"
                  strokeWidth="2"
                />

                {/* The marbles: a fixed pile, one gold, always in view */}
                {marbles.map((m, i) =>
                  i === goldIndex ? null : <circle key={i} cx={m.x} cy={m.y} r={MARBLE_R} fill={greyFill} />,
                )}
                {gold && (
                  <>
                    <circle
                      cx={gold.x}
                      cy={gold.y}
                      r={MARBLE_R + 4.5}
                      fill="none"
                      stroke="#ffd158"
                      strokeWidth="1.5"
                      style={{ animation: reduce ? undefined : "ojGold 1.8s ease-in-out infinite" }}
                    />
                    <circle cx={gold.x} cy={gold.y} r={MARBLE_R + 0.6} fill={goldFill} stroke="#fff3b0" strokeWidth="0.8" />
                  </>
                )}

                {/* The gate the pile rests on, and a glass shine */}
                <rect x="34" y="187" width="132" height="5" rx="2" fill="#3b4368" />
                <ellipse cx="52" cy="112" rx="7" ry="44" fill="rgba(255,255,255,0.16)" />

                {/* The loot box under the spout */}
                <rect x="52" y="270" width="96" height="54" rx="10" fill="#1c2247" stroke={`${accent}88`} strokeWidth="2" />
                <rect x="47" y="258" width="106" height="16" rx="6" fill="#2b3255" stroke={`${accent}66`} strokeWidth="1.5" />
                <rect x="94" y="258" width="12" height="16" rx="3" fill={accent} opacity="0.85" />

                {/* Marbles that have rolled into the box this round */}
                {Array.from({ length: Math.min(landed, BOX_SLOTS) }, (_, i) => {
                  const p = boxSlot(i);
                  return <circle key={`landed-${i}`} cx={p.x} cy={p.y} r={MARBLE_R} fill={greyFill} />;
                })}
                {landed > BOX_SLOTS && (
                  <text x="100" y="286" textAnchor="middle" fontFamily={LABEL_FONT} fontSize="11" fontWeight="900" fill="#fff7e6">
                    +{landed - BOX_SLOTS}
                  </text>
                )}

                {/* The marble on its way: out of the spout, into the box */}
                <AnimatePresence>
                  {rolling && (
                    <motion.circle
                      key={rolling.n}
                      r={MARBLE_R}
                      fill={greyFill}
                      initial={{ cx: 100, cy: 194, opacity: 1 }}
                      animate={{ cx: [100, 100, 103, landing.x], cy: [194, 236, 268, landing.y], opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.08 } }}
                      transition={{ duration: 0.6, ease: "easeIn", times: [0, 0.42, 0.72, 1] }}
                    />
                  )}
                </AnimatePresence>
              </svg>
              <div style={{ fontFamily: LABEL_FONT, fontSize: 10, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#c9b8ff" }}>
                {jarNoteText}
              </div>
            </div>

            <div style={{ flex: "1 1 200px", minWidth: 190, maxWidth: 320, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              {/* The Spent counter */}
              <div
                style={{
                  width: "100%",
                  borderRadius: 18,
                  background: "linear-gradient(180deg, rgba(18,24,58,0.92) 0%, rgba(10,14,36,0.94) 100%)",
                  border: `1px solid ${accent}55`,
                  boxShadow: `0 18px 40px -22px rgba(0,0,0,0.7), inset 0 0 0 1px ${accent}22`,
                  padding: "12px 12px 14px",
                  color: "#fff7e6",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <div style={eyebrowStyle}>{spentLabel}</div>
                <motion.div
                  key={`spent-${spent}`}
                  initial={reduce || spent === 0 ? false : { scale: 1.22 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 420, damping: 18 }}
                  aria-live="polite"
                  aria-label={`${spentLabel}: ${spent} ${coinWord}`}
                  style={{ fontFamily: LABEL_FONT, fontWeight: 900, fontSize: 48, lineHeight: 1, color: accent, textShadow: `0 0 18px ${accent}66`, fontVariantNumeric: "tabular-nums" }}
                >
                  {spent}
                </motion.div>
                <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
                  {coinWord}
                </div>
              </div>

              <div aria-live="polite" style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
                Opened {opens} of {opensWanted}
              </div>

              {/* The one big button */}
              <div style={{ display: "inline-block", borderRadius: 16, ...guideStyle(openGlow) }}>
                <GameButton variant="primary" size="lg" icon="🎁" onClick={open} disabled={speaking || !!rolling || decide} aria-label={openLabel} style={{ minWidth: 170 }}>
                  {openLabel}
                </GameButton>
              </div>
            </div>
          </div>

          {/* After the opens: the prompt and three identical cards. */}
          <AnimatePresence>
            {decide && (
              <motion.div
                key={`cards-${r.id}`}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, transition: { duration: 0.12 } }}
                transition={{ duration: 0.25 }}
                style={{ marginTop: 14, padding: "0 12px" }}
              >
                <div style={{ textAlign: "center", fontFamily: KID_FONT, fontSize: 17, fontWeight: 800, color: "#fff7e6", marginBottom: 10 }}>
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
                              ✅ True
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

          {/* On-board instructions: the current step, in the child's words. */}
          <div style={{ textAlign: "center", marginTop: 14 }}>
            <div style={{ fontFamily: LABEL_FONT, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent, minHeight: 16, padding: "0 16px" }}>
              {strip}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={hintTier} speaker={voice} text={hintText} />}
          </div>

          <style>{`
            @keyframes ojGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }
            @keyframes ojGold { 0%,100% { opacity: 0.3 } 50% { opacity: 0.95 } }
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
            `${rounds.length} jar${rounds.length === 1 ? "" : "s"} opened ${totalOpens} time${totalOpens === 1 ? "" : "s"}, gold marble still inside`,
            completeLine,
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
