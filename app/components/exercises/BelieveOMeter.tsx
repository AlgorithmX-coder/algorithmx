"use client";

/**
 * BelieveOMeter — the DIALS drill (Week 4, "The Believe-o-Meter").
 *
 * One offer poster hangs at a time above a fairground dial with three stops:
 * COULD BE REAL, HMM, CHECK FIRST, NO WAY. The needle always starts in the
 * middle. The child taps the arrows to turn the needle, then taps LOCK IT IN.
 * Nothing is judged before the lock. Right, and the stop lights up while a
 * stamp lands on the poster; wrong, and the needle wobbles while Sarah teaches,
 * then the child turns it again (nothing resets).
 *
 * Why it is not a select drill (owner: "we never copy an exercise"): the
 * answer is a POSITION on a scale reached by turning, not a button among
 * buttons; the same control is used for every offer; the middle stop teaches
 * the real skill ("not sure means check with a grown-up") so "always No way"
 * never wins; and the commit is a separate lock. Nothing in the library turns
 * a dial.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * as the board appears and each poster read aloud as it hangs (audio-only,
 * `recordedOnly`, taps held), a one-take spoken verdict on every lock (right:
 * "That's right!" + why; wrong: "Not quite." + whyWrong), round 1 glows the
 * right stop with a one-line strip, hint tiers per offer, spoken payoff on the
 * complete beat. Offers are shuffled per play; every poster wears the same
 * icon (no giveaway).
 *
 * Skins (`skin` prop): "believe" is Week 4's fairground dial (default,
 * unchanged). "doors" is Week 8's "The Smallest Door": a darkroom door dial
 * with FOUR stops (Just me, Friends, School, Everyone) spread over the same
 * arc, the needle starting on Friends so neither end is the default, and the
 * poster drawn as a photo print. Turning, locking, judging, narration,
 * verdicts and aria-labels are identical on both skins.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { useShuffledOnce } from "@/app/lib/gameEngine/useShuffledOnce";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import HintBubble from "@/app/components/lesson/HintBubble";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
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
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

export type MeterStop = "real" | "hmm" | "noway";
/** The "doors" skin's four stops, left (smallest audience) to right (biggest). */
export type DoorStop = "justMe" | "friends" | "school" | "everyone";
export type BelieveOMeterSkin = "believe" | "doors";

export interface MeterOffer {
  id: string;
  text: string;
  from: string;
  readAloud: string;
  /** Where the needle belongs: a MeterStop on the "believe" skin, a DoorStop on "doors". */
  answer: MeterStop | DoorStop;
  why: string;
  whyWrong: string;
}

export interface BelieveOMeterProps {
  offers: MeterOffer[];
  /** Visual skin: "believe" (Week 4 fairground dial, three stops, default) or
   *  "doors" (Week 8 darkroom door dial, four stops). */
  skin?: BelieveOMeterSkin;
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  stopLabels?: Partial<Record<MeterStop | DoorStop, string>>;
  lockLabel?: string;
  /** The header counter's noun ("Offer 2 of 6"). Default "Offer". */
  itemLabel?: string;
  /** Small print before `from` on the card. Default "from:"; "" shows `from` alone. */
  fromLabel?: string;
  /** Complete-beat count line after "6/6". Default "offers measured". */
  doneLabel?: string;
  /** Optional small print under the dial, either skin (e.g. the doors'
   *  "a screenshot can carry it out of any door" warning). Default none. */
  dialNote?: string;
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

type MeterStopDef = { id: MeterStop | DoorStop; angle: number; label: string; stamp: string };

/** The three stops, left to right. Fixed geometry, not content. */
const STOPS: MeterStopDef[] = [
  { id: "real", angle: -58, label: "Could be real", stamp: "COULD BE REAL" },
  { id: "hmm", angle: 0, label: "Hmm, check first", stamp: "CHECK FIRST" },
  { id: "noway", angle: 58, label: "No way!", stamp: "NO WAY!" },
];

/** The doors skin's four stops, evenly spread over the same arc (-58 to 58
 *  degrees), smallest audience on the left. Fixed geometry, not content. */
const DOOR_STOPS: MeterStopDef[] = [
  { id: "justMe", angle: -58, label: "Just me", stamp: "JUST ME" },
  { id: "friends", angle: -58 / 3, label: "Friends", stamp: "FRIENDS" },
  { id: "school", angle: 58 / 3, label: "School", stamp: "SCHOOL" },
  { id: "everyone", angle: 58, label: "Everyone", stamp: "EVERYONE" },
];
/** Door marker [width, height] per stop: the doors grow with the audience. */
const DOOR_SIZES: readonly (readonly [number, number])[] = [[11, 15], [13, 18], [15, 21], [17, 24]];
/** Radius (dial units) the door markers stand on: the middle of the rail. */
const DOOR_R = 77;

/** Where the needle starts on every offer. Believe: the middle stop. Doors:
 *  "friends", the second stop, so neither end is ever the default. */
const START_STOP = 1;

/** A strip of tape over a photo print's corner (doors skin). */
const TAPE_STYLE = {
  position: "absolute",
  top: 8,
  width: 64,
  height: 16,
  background: "rgba(255,226,170,0.78)",
  boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
  zIndex: 2,
  pointerEvents: "none",
} as const;

export default function BelieveOMeter({
  offers,
  skin = "believe",
  introTitle = "The Believe-o-Meter",
  introSubtitle = "Turn the needle to how believable each offer is, then lock it in.",
  introIcon = "🎯",
  stopLabels,
  lockLabel = "LOCK IT IN",
  itemLabel = "Offer",
  fromLabel = "from:",
  doneLabel = "offers measured",
  dialNote,
  completeTitle = "Every offer measured!",
  completeLine = "Your believe-o-meter is tuned.",
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
}: BelieveOMeterProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#e84dff";
  const voice = "adam" as const;
  const doors = skin === "doors";
  const stops = doors ? DOOR_STOPS : STOPS;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [needle, setNeedle] = useState(START_STOP); // believe: the middle stop; doors: "friends"
  const [phase, setPhase] = useState<"play" | "stamped">("play");
  const [wobble, setWobble] = useState(0);
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [offerWrongs, setOfferWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [guidedLocks, setGuidedLocks] = useState(0);

  const shown = useShuffledOnce(offers);
  const finished = idx >= shown.length;
  const o = shown[idx];
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking || phase === "stamped";
  const guided = idx === 0 && guidedLocks === 0;

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
    setIdx((i) => i + 1);
    setNeedle(START_STOP);
    setPhase("play");
    setOfferWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const turn = (dir: -1 | 1) => {
    if (speaking) return;
    setNeedle((n) => {
      const next = Math.max(0, Math.min(stops.length - 1, n + dir));
      if (next !== n) audio.tap();
      return next;
    });
  };

  // The needle's stop (clamped, so a stop list can never be over-read).
  const curIdx = Math.min(needle, stops.length - 1);
  const cur = stops[curIdx];
  // The right stop's position in the active skin's stops (-1 only if content
  // names a stop from the other skin, which can then never lock right).
  const answerIdx = o ? stops.findIndex((s) => s.id === o.answer) : -1;

  const lock = () => {
    if (!o || speaking) return;
    const pick = cur.id;
    const right = pick === o.answer;
    setGuidedLocks((n) => n + 1);
    onAnswered?.({ questionKey: `meter-${o.id}`, selectedIndex: curIdx, correctIndex: answerIdx, wasCorrect: right });
    if (right) {
      audio.correct();
      fx.correct({ xp: 20, text: cur.stamp });
      onCorrect?.();
      setPhase("stamped");
      verdict.say("right", o.why, () => {
        window.setTimeout(advance, reduce ? 200 : 900);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      setOfferWrongs((n) => n + 1);
      setWobble((k) => k + 1);
      verdict.say("wrong", o.whyWrong);
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = offerWrongs >= 2 ? hints?.tier2 : offerWrongs === 1 ? hints?.tier1 : undefined;
  const angle = cur.angle;

  // The stamp that lands on the card after a right lock. Believe keys its ink
  // to the stop (unchanged); doors use one darkroom red for every door, since
  // a door is an audience, not a right or wrong colour.
  const stampBorder = doors ? "#e0502e" : o?.answer === "noway" ? "#ff5fb3" : o?.answer === "hmm" ? "#ffd166" : "#34d399";
  const stampInk = doors ? "#b43412" : o?.answer === "noway" ? "#d5262e" : o?.answer === "hmm" ? "#9a6600" : "#137a45";
  const stampEl = (
    <AnimatePresence>
      {phase === "stamped" && (
        <motion.div
          key="stamp"
          initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.8, rotate: -20 }}
          animate={{ opacity: 1, scale: 1, rotate: -8 }}
          exit={{ opacity: 0, transition: { duration: 0.12 } }}
          transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
          style={{
            position: "absolute",
            bottom: 10,
            left: "50%",
            x: "-50%",
            padding: "6px 14px",
            borderRadius: 8,
            border: `4px double ${stampBorder}`,
            color: stampInk,
            background: doors ? "rgba(255,250,240,0.85)" : "rgba(255,255,255,0.7)",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: 15,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
          }}
        >
          {stops[answerIdx]?.stamp}
        </motion.div>
      )}
    </AnimatePresence>
  );

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

      {!showIntro && !finished && o && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="bm-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`bm-read-${o.id}`} speaker={voice} lines={[o.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && o && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              {doors ? (
                <>
                  <PixIcon emoji="🚪" size={14} style={{ marginRight: 6, verticalAlign: "-2px" }} />
                  {introTitle}
                </>
              ) : (
                "🎯 Believe-o-Meter"
              )}
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: doors ? "#ffc49b" : "#c9b8ff" }}>
              {itemLabel} {Math.min(idx + 1, shown.length)} of {shown.length}
            </span>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
            {doors ? (
            /* The photo print: same white border, same tape, same darkroom photo on every item (no giveaway). */
            <div
              style={{
                position: "relative",
                flex: "1 1 280px",
                minWidth: 240,
                borderRadius: 8,
                background: "linear-gradient(180deg, #fffdf8 0%, #f3eadb 100%)",
                border: "1px solid rgba(120,70,30,0.3)",
                boxShadow: "0 18px 40px -22px rgba(0,0,0,0.8), 0 0 46px -14px rgba(255,107,61,0.55)",
                padding: "16px 14px 22px",
                color: "#2a130b",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "center",
                gap: 10,
                textAlign: "center",
                fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                overflow: "hidden",
              }}
            >
              <span aria-hidden style={{ ...TAPE_STYLE, left: -18, transform: "rotate(-38deg)" }} />
              <span aria-hidden style={{ ...TAPE_STYLE, right: -18, transform: "rotate(38deg)" }} />
              <div
                aria-hidden
                style={{
                  position: "relative",
                  flex: "1 1 auto",
                  minHeight: 104,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  background: "radial-gradient(circle at 50% 38%, #8a5230 0%, #4a2412 58%, #1f0d06 100%)",
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.4), inset 0 0 30px rgba(255,107,61,0.32)",
                }}
              >
                <PixIcon emoji="📸" size={44} />
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 900, lineHeight: 1.2 }}>{o.text}</div>
              {o.from && (
                <div style={{ fontSize: 12, fontWeight: 700, color: "#8a4a22", letterSpacing: "0.04em" }}>
                  {fromLabel ? `${fromLabel} ` : ""}{o.from}
                </div>
              )}
              {stampEl}
            </div>
            ) : (
            /* The poster: same paper, same icon, same pins on every offer. */
            <div
              style={{
                position: "relative",
                flex: "1 1 280px",
                minWidth: 240,
                borderRadius: 14,
                background: "linear-gradient(180deg, #fff3d6 0%, #f3ddb0 100%)",
                border: "2px solid #c99a4a",
                boxShadow: "0 18px 40px -22px rgba(0,0,0,0.7), inset 0 0 0 5px rgba(201,154,74,0.18)",
                padding: "18px 18px 22px",
                color: "#3a1a34",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                textAlign: "center",
                fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                overflow: "hidden",
              }}
            >
              <span aria-hidden style={{ position: "absolute", top: 8, left: 12, fontSize: 12 }}>📌</span>
              <span aria-hidden style={{ position: "absolute", top: 8, right: 12, fontSize: 12 }}>📌</span>
              <PixIcon emoji="📣" size={38} />
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 19, fontWeight: 900, lineHeight: 1.2 }}>{o.text}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#7a4a6a", letterSpacing: "0.04em" }}>{fromLabel ? `${fromLabel} ` : ""}{o.from}</div>
              {stampEl}
            </div>
            )}

            {/* The dial */}
            <div
              style={{
                flex: "1 1 300px",
                minWidth: 260,
                borderRadius: 18,
                background: doors
                  ? "radial-gradient(ellipse at 50% 32%, rgba(255,107,61,0.22) 0%, rgba(255,107,61,0) 62%), linear-gradient(180deg, rgba(42,19,11,0.94) 0%, rgba(20,8,5,0.97) 100%)"
                  : "linear-gradient(180deg, rgba(60,10,51,0.9) 0%, rgba(30,5,25,0.95) 100%)",
                border: doors ? "1px solid rgba(255,157,46,0.4)" : `1px solid ${accent}55`,
                boxShadow: doors ? "0 18px 40px -22px rgba(0,0,0,0.7), 0 0 36px -16px rgba(255,107,61,0.55)" : "0 18px 40px -22px rgba(0,0,0,0.7)",
                padding: "12px 12px 14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ position: "relative", width: "100%", maxWidth: 320, aspectRatio: "2 / 1.25" }}>
                <svg viewBox="0 0 200 125" style={{ width: "100%", height: "100%", overflow: "visible" }} aria-hidden>
                  {doors ? (
                    <>
                      <defs>
                        <linearGradient id="bmDoorRail" x1="0" x2="1">
                          <stop offset="0" stopColor="#8a3a14" />
                          <stop offset="1" stopColor="#ffb347" />
                        </linearGradient>
                        <radialGradient id="bmSafelight" cx="100" cy="105" r="96" gradientUnits="userSpaceOnUse">
                          <stop offset="0" stopColor="#ff6b3d" stopOpacity={0.34} />
                          <stop offset="1" stopColor="#ff6b3d" stopOpacity={0} />
                        </radialGradient>
                      </defs>
                      {/* The safelight: a warm half-disc glow behind the doors (stays inside the dial box). */}
                      <path d="M 4 105 A 96 96 0 0 1 196 105 Z" fill="url(#bmSafelight)" />
                      {/* The rail the doors stand on, one paint from left to right (a scale, not four buttons). */}
                      <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="rgba(255,196,155,0.1)" strokeWidth={22} strokeLinecap="round" />
                      <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="url(#bmDoorRail)" strokeWidth={10} strokeLinecap="round" opacity={0.6} />
                      {/* Door markers: they grow with the audience. The needle's door is outlined,
                          the round-1 ring and the post-lock glow follow the answer. */}
                      {stops.map((s, i) => {
                        const rad = (s.angle * Math.PI) / 180;
                        const cx = 100 + Math.sin(rad) * DOOR_R;
                        const cy = 105 - Math.cos(rad) * DOOR_R;
                        const [w, h] = DOOR_SIZES[Math.min(i, DOOR_SIZES.length - 1)];
                        const l = cx - w / 2, r = cx + w / 2, top = cy - h / 2, bot = cy + h / 2;
                        const lit = phase === "stamped" && s.id === o.answer;
                        const guide = guided && s.id === o.answer;
                        const pointed = i === curIdx;
                        const end = i === 0 || i === stops.length - 1;
                        return (
                          <g key={s.id}>
                            {guide && (
                              <circle cx={cx} cy={cy} r={16} fill="none" stroke={accent} strokeWidth={3} style={reduce ? undefined : { animation: "bmGuideDoor 1.2s ease-in-out infinite" }} />
                            )}
                            {/* Safelight spilling under the door */}
                            <line x1={l + 1} y1={bot + 1.8} x2={r - 1} y2={bot + 1.8} stroke="#ff9d2e" strokeWidth={1.4} strokeLinecap="round" opacity={lit ? 1 : 0.7} />
                            <path
                              d={`M ${l} ${bot} L ${l} ${top + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${r} ${top + w / 2} L ${r} ${bot} Z`}
                              fill={lit ? "#ffd9a0" : pointed ? "#5a2a14" : "#2a130b"}
                              stroke={lit ? "#ffffff" : pointed ? "#ffe2b8" : "#ffb347"}
                              strokeWidth={lit ? 2.2 : 1.4}
                              style={lit ? { filter: "drop-shadow(0 0 6px rgba(255,196,120,0.9))" } : undefined}
                            />
                            <circle cx={cx + w * 0.24} cy={cy + h * 0.12} r={1.2} fill={lit ? "#8a3a14" : "#ffb347"} />
                            {/* Labels sit clear of the rail: the two ends under its feet, the middle two above their doors. */}
                            <text x={end ? (i === 0 ? 30 : 170) : cx} y={end ? 122 : 6} textAnchor="middle" fontSize={10} fontWeight={800} fill="#ffe9d0" fontFamily="'Space Grotesk', sans-serif">
                              {stopLabels?.[s.id] ?? s.label}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  ) : (
                    <>
                      <defs>
                        <linearGradient id="bmArc" x1="0" x2="1">
                          <stop offset="0" stopColor="#7eff97" />
                          <stop offset="0.5" stopColor="#ffd166" />
                          <stop offset="1" stopColor="#ff5fb3" />
                        </linearGradient>
                      </defs>
                      {/* The arc, one paint from left to right (a gauge, not three buttons) */}
                      <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={22} strokeLinecap="round" />
                      <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="url(#bmArc)" strokeWidth={14} strokeLinecap="round" opacity={0.85} />
                      {/* Stop ticks */}
                      {stops.map((s, i) => {
                        const a = ((s.angle - 90) * Math.PI) / 180;
                        const x1 = 100 + Math.cos(a) * 62, y1 = 105 + Math.sin(a) * 62;
                        const x2 = 100 + Math.cos(a) * 92, y2 = 105 + Math.sin(a) * 92;
                        const lit = phase === "stamped" && s.id === o.answer;
                        const guide = guided && s.id === o.answer;
                        return (
                          <g key={s.id}>
                            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={lit ? "#ffffff" : "rgba(255,255,255,0.75)"} strokeWidth={lit ? 4 : 2.5} strokeLinecap="round" />
                            {guide && !reduce && (
                              <circle cx={100 + Math.cos(a) * 77} cy={105 + Math.sin(a) * 77} r={12} fill="none" stroke={accent} strokeWidth={3} style={{ animation: "bmGuide 1.2s ease-in-out infinite" }} />
                            )}
                            {guide && reduce && <circle cx={100 + Math.cos(a) * 77} cy={105 + Math.sin(a) * 77} r={12} fill="none" stroke={accent} strokeWidth={3} />}
                            {/* Labels sit clear of the arc: the two ends under the arc's feet, the middle above the top tick. */}
                            <text x={i === 0 ? 30 : i === 2 ? 170 : 100} y={i === 1 ? 6 : 122} textAnchor="middle" fontSize={10} fontWeight={800} fill="#fff7e6" fontFamily="'Space Grotesk', sans-serif">
                              {stopLabels?.[s.id] ?? s.label}
                            </text>
                          </g>
                        );
                      })}
                    </>
                  )}
                  {/* The needle: motion owns the rotation; a wobble on a wrong lock */}
                  <motion.g
                    key={`needle-${wobble}`}
                    animate={reduce ? { rotate: angle } : wobble ? { rotate: [angle, angle - 7, angle + 7, angle - 4, angle + 4, angle] } : { rotate: angle }}
                    // A keyframe array must tween: a spring on more than two keyframes crashes Motion (Build Standard gotcha).
                    transition={reduce ? { duration: 0 } : wobble ? { duration: 0.45, ease: "easeInOut" } : { type: "spring", stiffness: 160, damping: 14 }}
                    style={{ originX: "100px", originY: "105px" } as never}
                  >
                    {doors ? (
                      // Shorter on the doors dial, so its tip points at a door instead of covering it.
                      <polygon points="100,47 95,105 105,105" fill="#ffe2b8" style={{ filter: "drop-shadow(0 0 6px rgba(255,157,46,0.8))" }} />
                    ) : (
                      <polygon points="100,30 94,105 106,105" fill="#fff7e6" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }} />
                    )}
                  </motion.g>
                  <circle cx={100} cy={105} r={11} fill={doors ? "#1c0c07" : "#2a0a24"} stroke={accent} strokeWidth={3} />
                </svg>
              </div>

              {/* Arrows: tap to turn (the child taps; the needle turns). Left turns left. */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                <GameButton variant="secondary" size="lg" onClick={() => turn(-1)} disabled={speaking || curIdx === 0} aria-label="Turn the needle left">
                  ◀ Turn
                </GameButton>
                <GameButton variant="secondary" size="lg" onClick={() => turn(1)} disabled={speaking || curIdx === stops.length - 1} aria-label="Turn the needle right">
                  Turn ▶
                </GameButton>
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: doors ? "#ffe9d0" : "#fff7e6", minHeight: 16 }}>
                {doors ? "Door: " : "Needle: "}{stopLabels?.[cur.id] ?? cur.label}
              </div>
              {dialNote && (
                <div style={{ maxWidth: 300, textAlign: "center", fontSize: 12, fontWeight: 700, lineHeight: 1.35, color: doors ? "#ffc49b" : "#e9d5ff" }}>
                  {dialNote}
                </div>
              )}
              <GameButton variant="primary" size="lg" icon="🔒" onClick={lock} disabled={speaking}>
                {lockLabel}
              </GameButton>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
              {guided
                ? doors
                  ? "Round 1: the glowing door is where this one belongs. Turn the needle there, then lock it in"
                  : "Round 1: the glowing stop is where this one belongs. Tap the arrows until the needle points there, then lock it in"
                : doors
                  ? "Listen · turn the needle to the door that fits · then lock it in"
                  : "Listen to the offer · tap the arrows to turn the needle · then lock it in"}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={offerWrongs >= 2 ? 2 : 1} speaker={voice} text={hintText} />}
          </div>
          <style>{`@keyframes bmGuide { 0%,100% { opacity: .35; r: 12 } 50% { opacity: 1; r: 16 } }`}</style>
          {doors && <style>{`@keyframes bmGuideDoor { 0%,100% { opacity: .35; r: 16 } 50% { opacity: 1; r: 20 } }`}</style>}
        </div>
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[`${shown.length}/${shown.length} ${doneLabel}`, completeLine]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
