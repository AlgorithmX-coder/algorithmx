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

export interface MeterOffer {
  id: string;
  text: string;
  from: string;
  readAloud: string;
  answer: MeterStop;
  why: string;
  whyWrong: string;
}

export interface BelieveOMeterProps {
  offers: MeterOffer[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  stopLabels?: Partial<Record<MeterStop, string>>;
  lockLabel?: string;
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

/** The three stops, left to right. Fixed geometry, not content. */
const STOPS: { id: MeterStop; angle: number; label: string; stamp: string }[] = [
  { id: "real", angle: -58, label: "Could be real", stamp: "COULD BE REAL" },
  { id: "hmm", angle: 0, label: "Hmm, check first", stamp: "CHECK FIRST" },
  { id: "noway", angle: 58, label: "No way!", stamp: "NO WAY!" },
];
const STOP_INDEX: Record<MeterStop, number> = { real: 0, hmm: 1, noway: 2 };

export default function BelieveOMeter({
  offers,
  introTitle = "The Believe-o-Meter",
  introSubtitle = "Turn the needle to how believable each offer is, then lock it in.",
  introIcon = "🎯",
  stopLabels,
  lockLabel = "LOCK IT IN",
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

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  const [needle, setNeedle] = useState(1); // always starts on the middle stop
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
    setNeedle(1);
    setPhase("play");
    setOfferWrongs(0);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const turn = (dir: -1 | 1) => {
    if (speaking) return;
    setNeedle((n) => {
      const next = Math.max(0, Math.min(STOPS.length - 1, n + dir));
      if (next !== n) audio.tap();
      return next;
    });
  };

  const lock = () => {
    if (!o || speaking) return;
    const pick = STOPS[needle].id;
    const right = pick === o.answer;
    setGuidedLocks((n) => n + 1);
    onAnswered?.({ questionKey: `meter-${o.id}`, selectedIndex: STOP_INDEX[pick], correctIndex: STOP_INDEX[o.answer], wasCorrect: right });
    if (right) {
      audio.correct();
      fx.correct({ xp: 20, text: STOPS[needle].stamp });
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
  const angle = STOPS[needle].angle;

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
              🎯 Believe-o-Meter
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Offer {Math.min(idx + 1, shown.length)} of {shown.length}
            </span>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
            {/* The poster: same paper, same icon, same pins on every offer. */}
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
              <div style={{ fontSize: 12, fontWeight: 700, color: "#7a4a6a", letterSpacing: "0.04em" }}>from: {o.from}</div>
              <AnimatePresence>
                {phase === "stamped" && (
                  <motion.div
                    key="stamp"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 1.8, rotate: -20 }}
                    animate={{ opacity: 1, scale: 1, rotate: -8 }}
                    exit={{ opacity: 0 }}
                    transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 380, damping: 14 }}
                    style={{
                      position: "absolute",
                      bottom: 10,
                      left: "50%",
                      x: "-50%",
                      padding: "6px 14px",
                      borderRadius: 8,
                      border: `4px double ${o.answer === "noway" ? "#ff5fb3" : o.answer === "hmm" ? "#ffd166" : "#34d399"}`,
                      color: o.answer === "noway" ? "#d5262e" : o.answer === "hmm" ? "#9a6600" : "#137a45",
                      background: "rgba(255,255,255,0.7)",
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontWeight: 900,
                      fontSize: 15,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {STOPS[STOP_INDEX[o.answer]].stamp}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* The dial */}
            <div
              style={{
                flex: "1 1 300px",
                minWidth: 260,
                borderRadius: 18,
                background: "linear-gradient(180deg, rgba(60,10,51,0.9) 0%, rgba(30,5,25,0.95) 100%)",
                border: `1px solid ${accent}55`,
                boxShadow: "0 18px 40px -22px rgba(0,0,0,0.7)",
                padding: "12px 12px 14px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{ position: "relative", width: "100%", maxWidth: 320, aspectRatio: "2 / 1.25" }}>
                <svg viewBox="0 0 200 125" style={{ width: "100%", height: "100%", overflow: "visible" }} aria-hidden>
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
                  {STOPS.map((s, i) => {
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
                  {/* The needle: motion owns the rotation; a wobble on a wrong lock */}
                  <motion.g
                    key={`needle-${wobble}`}
                    animate={reduce ? { rotate: angle } : wobble ? { rotate: [angle, angle - 7, angle + 7, angle - 4, angle + 4, angle] } : { rotate: angle }}
                    // A keyframe array must tween: a spring on more than two keyframes crashes Motion (Build Standard gotcha).
                    transition={reduce ? { duration: 0 } : wobble ? { duration: 0.45, ease: "easeInOut" } : { type: "spring", stiffness: 160, damping: 14 }}
                    style={{ originX: "100px", originY: "105px" } as never}
                  >
                    <polygon points="100,30 94,105 106,105" fill="#fff7e6" style={{ filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))" }} />
                  </motion.g>
                  <circle cx={100} cy={105} r={11} fill="#2a0a24" stroke={accent} strokeWidth={3} />
                </svg>
              </div>

              {/* Arrows: tap to turn (the child taps; the needle turns). Left turns left. */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center", flexWrap: "wrap" }}>
                <GameButton variant="secondary" size="lg" onClick={() => turn(-1)} disabled={speaking || needle === 0} aria-label="Turn the needle left">
                  ◀ Turn
                </GameButton>
                <GameButton variant="secondary" size="lg" onClick={() => turn(1)} disabled={speaking || needle === STOPS.length - 1} aria-label="Turn the needle right">
                  Turn ▶
                </GameButton>
              </div>
              <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#fff7e6", minHeight: 16 }}>
                Needle: {stopLabels?.[STOPS[needle].id] ?? STOPS[needle].label}
              </div>
              <GameButton variant="primary" size="lg" icon="🔒" onClick={lock} disabled={speaking}>
                {lockLabel}
              </GameButton>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
              {guided
                ? "Round 1: the glowing stop is where this one belongs. Tap the arrows until the needle points there, then lock it in"
                : "Listen to the offer · tap the arrows to turn the needle · then lock it in"}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={offerWrongs >= 2 ? 2 : 1} speaker={voice} text={hintText} />}
          </div>
          <style>{`@keyframes bmGuide { 0%,100% { opacity: .35; r: 12 } 50% { opacity: 1; r: 16 } }`}</style>
        </div>
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[`${shown.length}/${shown.length} offers measured`, completeLine]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
