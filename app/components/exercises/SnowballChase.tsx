"use client";

/**
 * SnowballChase — the deliberately-uncatchable ARCADE demo (Week 12).
 *
 * Copies of a post roll onto the snowfield as snowballs; the child sweeps
 * them with taps (satisfying bursts, no lose state) while the ROLLED AWAY
 * counter climbs faster than any broom can work. When the timer runs out
 * the complete beat names the point out loud: nobody can sweep every
 * copy — that's why heroes think BEFORE they roll.
 *
 * There are no wrong answers here; it's a demonstration arcade. The
 * futility IS the lesson, so the child always earns full stars.
 *
 * Learn-Loop wiring: the Raccoon's boast folds into the intro (`threat`);
 * an optional `startCard` shows the post about to be forwarded with ONE big
 * button, Sarah reads it aloud (audio-only, the button held while she
 * speaks) and nothing spawns until the child taps; the how-to (`coachLines`)
 * is spoken as the field starts spawning (taps held while she speaks); the
 * complete beat speaks the "you're protected" payoff (`completeNarration`).
 * No verdicts: there are no wrong answers in this game.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";
import { SPOKEN_GATE_MAX_MS } from "@/app/lib/gameEngine/spokenGate";

// Audio-only narration: Sarah's voice with no visible narration box (the text
// she reads is already on screen), same recipe as ClueStamper.
const AUDIO_ONLY_STYLE = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
} as const;
// SPOKEN_GATE_MAX_MS is shared: see app/lib/gameEngine/spokenGate.ts.

interface Ball {
  id: number;
  /** Position as % of the field. */
  x: number;
  y: number;
  size: number;
}

export interface SnowballChaseProps {
  /** Field skin: W12 snowfield (default) or W5 "embers" (night ground, ember copies). */
  skin?: "snow" | "embers";
  /** Label at the field's edge. Default "OVER THE HILL →". */
  edgeLabel?: string;
  /** Copy overrides (defaults keep the W12 snowfield skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** PixIcon key stamped on each rolling copy. */
  ballIcon?: string;
  sweptLabel?: string;
  rolledLabel?: string;
  /** Mid-game caption beats (shown in order as time passes). */
  captions?: [string, string, string];
  completeTitle?: string;
  completeLine?: string;
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** The how-to, spoken once as the field starts spawning (audio only). */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /**
   * Optional message card shown on the field after the intro: the post about
   * to be forwarded, with ONE big button. Nothing spawns until it is tapped.
   * Sarah reads `readAloud` first (audio only, the button held meanwhile).
   */
  startCard?: { text: string; buttonLabel: string; readAloud?: string };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken "you're protected" payoff on the complete screen. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
}

const DURATION_MS = 34000;
const REDUCED_DURATION_MS = 20000;
const ROLL_AWAY_MS = 2700;
const MAX_ON_FIELD = 8;

export default function SnowballChase({
  skin = "snow",
  edgeLabel,
  introTitle,
  introSubtitle,
  introIcon,
  ballIcon,
  sweptLabel,
  rolledLabel,
  captions,
  completeTitle,
  completeLine,
  introNarration,
  coachLines,
  startCard,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
}: SnowballChaseProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  // Both content voices are Sarah; in-game read-alouds are recorded under
  // "adam", so every manifest lookup here uses that key.
  const voice = "adam" as const;
  // Legacy mode (Week 12): none of the Learn-Loop props are present, so the
  // pre-change behaviour stays intact: `coachLines` shows as the CoachCaption
  // below the field (until the first sweep) and is NOT spoken through the
  // audio-only chain. Learn-Loop mode (any of the three present) speaks the
  // how-to as the field starts spawning instead.
  const legacy = !startCard && !threat && !completeNarration;

  const [showIntro, setShowIntro] = useState(true);
  // The spawn loop runs only once the field has started: at once after the
  // intro (legacy), or after the start card's button is tapped.
  const [started, setStarted] = useState(false);
  const [balls, setBalls] = useState<Ball[]>([]);
  const [swept, setSwept] = useState(0);
  const [rolled, setRolled] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  // Legacy mode only: the CoachCaption hides after the first sweep.
  const [hasInteracted, setHasInteracted] = useState(false);
  // Read-aloud chain: the start card as it appears ("read"), then the how-to
  // as the field starts spawning ("howto"). Taps are held while she speaks.
  // "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");

  const nextId = useRef(1);
  const duration = reduce ? REDUCED_DURATION_MS : DURATION_MS;
  const speaking = narr !== "idle";

  // Safety releases for the spoken gate (never leave the field held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  // Spawn + clock loop. Spawn accelerates over time; untapped balls roll
  // away on their own and feed the futility counter.
  useEffect(() => {
    if (showIntro || !started || finished) return;
    const start = performance.now();
    let spawnAt = 0;
    const tick = window.setInterval(() => {
      const t = performance.now() - start;
      setElapsed(t);
      if (t >= duration) {
        setFinished(true);
        return;
      }
      if (t >= spawnAt) {
        // 1 ball early on, pairs later - always faster than the broom.
        const phase = t / duration;
        const batch = phase > 0.45 ? 2 : 1;
        const gap = Math.max(420, 1100 - t / 40);
        spawnAt = t + gap;
        setBalls((prev) => {
          const room = Math.max(0, MAX_ON_FIELD - prev.length);
          const add: Ball[] = [];
          for (let i = 0; i < Math.min(batch, room); i++) {
            add.push({
              id: nextId.current++,
              x: 6 + ((nextId.current * 37) % 84),
              y: 12 + ((nextId.current * 53) % 72),
              size: 56 + ((nextId.current * 29) % 26),
            });
          }
          if (add.length < batch) setRolled((r) => r + (batch - add.length));
          return [...prev, ...add];
        });
      }
    }, 120);
    return () => window.clearInterval(tick);
  }, [showIntro, started, finished, duration]);

  // Balls that outstay their welcome roll off over the hill.
  useEffect(() => {
    if (showIntro || finished || balls.length === 0) return;
    const oldest = balls[0];
    const timer = window.setTimeout(() => {
      setBalls((prev) => prev.filter((b) => b.id !== oldest.id));
      setRolled((r) => r + 1);
    }, ROLL_AWAY_MS);
    return () => window.clearTimeout(timer);
  }, [balls, showIntro, finished]);

  // The field starts spawning; in Learn-Loop mode the how-to is spoken as it
  // does (legacy mode keeps the caption and never enters the chain).
  const startField = () => {
    setStarted(true);
    setNarr(legacy || isAudioMuted() ? "idle" : coachLines ? "howto" : "idle");
  };

  const dismissIntro = () => {
    setShowIntro(false);
    if (startCard) {
      // The message card first: Sarah reads it, the button is held meanwhile.
      setNarr(isAudioMuted() ? "idle" : startCard.readAloud ? "read" : "idle");
    } else {
      startField();
    }
  };

  const tapStart = () => {
    if (speaking || started) return;
    audio.tap();
    startField();
  };

  const sweep = (ball: Ball) => {
    if (finished || speaking) return;
    setHasInteracted(true);
    audio.correct();
    onCorrect?.();
    setBalls((prev) => prev.filter((b) => b.id !== ball.id));
    setSwept((n) => {
      const v = n + 1;
      if (v === 5) fx.toast({ text: "GREAT SWEEPING!", tone: "bonus" });
      return v;
    });
  };

  const phase = elapsed / duration;
  const caption =
    phase > 0.72
      ? (captions?.[2] ?? "They just keep coming...!")
      : phase > 0.4
        ? (captions?.[1] ?? "They're MULTIPLYING!")
        : (captions?.[0] ?? "Sweep the copies before they roll away!");

  // The hill always wins - the completion owns the honesty.
  const rolledFinal = rolled + Math.max(12, swept * 3);

  return (
    <ExerciseFrame maxWidth={880} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Snowball Chase"}
          subtitle={introSubtitle ?? "Copies of the post are rolling everywhere. Grab the broom - sweep as many as you can!"}
          icon={introIcon ?? "🌀"}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={dismissIntro}
        />
      )}

      {/* Sarah's read-alouds (audio only, Learn-Loop mode): the start card as
          it appears, then the how-to as the field starts spawning. */}
      {!legacy && !showIntro && !finished && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "read" && startCard?.readAloud && (
            <InfoNarration key="sc-read" speaker={voice} lines={[startCard.readAloud]} accent="#7df0ff" recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "howto" && coachLines && (
            <InfoNarration key="sc-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent="#7df0ff" recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {/* HUD */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 720, margin: "0 auto 10px" }}>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: "#7eff97" }}>
          {(sweptLabel ?? "SWEPT")} {swept}
        </span>
        <span style={{ fontSize: 13.5, fontWeight: 800, color: "#dff6ff", textAlign: "center", flex: 1, padding: "0 10px" }}>
          {caption}
        </span>
        <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.08em", color: "#ff9bcb" }}>
          {(rolledLabel ?? "ROLLED AWAY")} {rolled}
        </span>
      </div>

      {/* The snowfield */}
      <div
        style={{
          position: "relative",
          maxWidth: 720,
          margin: "0 auto",
          height: 400,
          borderRadius: 18,
          overflow: "hidden",
          background:
            skin === "embers"
              ? "linear-gradient(180deg, #120a06 0%, #2a1509 55%, #3a1c0e 56%, #1a0d08 100%)"
              : "linear-gradient(180deg, #1c2b52 0%, #33507e 55%, #dfeafc 56%, #f6faff 100%)",
          border: skin === "embers" ? "2px solid rgba(255,157,77,0.4)" : "2px solid rgba(125,240,255,0.35)",
          boxShadow: "0 18px 44px -22px rgba(0,0,0,0.8)",
        }}
      >
        {/* hill line */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "48%",
            left: 0,
            right: 0,
            textAlign: "right",
            paddingRight: 14,
            fontSize: 11,
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: skin === "embers" ? "#ffb347" : "#33507e",
          }}
        >
          {edgeLabel ?? "OVER THE HILL →"}
        </div>

        {/* The post about to be forwarded: ONE button, nothing spawns until it is tapped. */}
        {startCard && !showIntro && !started && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 20,
            }}
          >
            <motion.div
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={reduce ? { duration: 0.2 } : { type: "spring", stiffness: 260, damping: 22 }}
              style={{
                width: "100%",
                maxWidth: 420,
                borderRadius: 18,
                padding: "18px 18px 20px",
                background: "linear-gradient(180deg, rgba(18,24,58,0.94) 0%, rgba(10,14,36,0.96) 100%)",
                border: "1px solid rgba(125,240,255,0.45)",
                boxShadow: "0 18px 40px -22px rgba(0,0,0,0.8)",
                color: "#fff7e6",
                textAlign: "center",
                fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 }}>
                <PixIcon emoji={ballIcon ?? "✉️"} size={30} />
                <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: "#7df0ff" }}>
                  The post
                </span>
              </div>
              <div
                style={{
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.14)",
                  padding: "12px 14px",
                  fontSize: 16,
                  fontWeight: 700,
                  lineHeight: 1.4,
                  marginBottom: 16,
                }}
              >
                <span aria-hidden style={{ marginRight: 6 }}>💬</span>
                {startCard.text}
              </div>
              <GameButton variant="primary" size="lg" clickSound={null} onClick={tapStart} disabled={speaking} style={{ minWidth: 220, cursor: speaking ? "wait" : "pointer" }}>
                {startCard.buttonLabel}
              </GameButton>
            </motion.div>
          </div>
        )}

        <AnimatePresence>
          {balls.map((b) => (
            <motion.button
              key={b.id}
              type="button"
              onClick={() => sweep(b)}
              disabled={speaking}
              initial={reduce ? { opacity: 0 } : { scale: 0.3, opacity: 0 }}
              // Motion owns opacity here, so the held look lives in `animate`.
              animate={{ scale: 1, opacity: speaking ? 0.85 : 1 }}
              exit={reduce ? { opacity: 0 } : { scale: 1.5, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              style={{
                position: "absolute",
                left: `${b.x}%`,
                top: `${b.y}%`,
                width: b.size,
                height: b.size,
                marginLeft: -b.size / 2,
                marginTop: -b.size / 2,
                borderRadius: "50%",
                border: skin === "embers" ? "3px solid #ff9d4d" : "3px solid #c9d8ee",
                background:
                  skin === "embers"
                    ? "radial-gradient(circle at 35% 30%, #ffe0a8, #ff8e3c 70%, #b5471a)"
                    : "radial-gradient(circle at 35% 30%, #ffffff, #dbe7f8 70%, #b9cbe8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: speaking ? "wait" : "pointer",
                boxShadow: "0 10px 22px -10px rgba(20,40,80,0.6)",
                touchAction: "manipulation",
              }}
              aria-label="Sweep this copy"
            >
              <PixIcon emoji={ballIcon ?? "✉️"} size={Math.round(b.size * 0.45)} />
            </motion.button>
          ))}
        </AnimatePresence>

        {/* progress bar */}
        <div aria-hidden style={{ position: "absolute", left: 0, bottom: 0, height: 6, width: `${Math.min(100, phase * 100)}%`, background: "linear-gradient(90deg, #00e5ff, #7eff97)" }} />
      </div>

      {/* Legacy mode (Week 12): the pre-change coach caption, exactly as before. */}
      {legacy && coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? "The broom is out of puff!"}
          stars={3}
          statLines={[
            `You swept ${swept} - but ${rolledFinal} rolled over the hill`,
            completeLine ?? "Nobody can sweep every copy - heroes think BEFORE they roll.",
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(swept)}
        />
      )}
    </ExerciseFrame>
  );
}
