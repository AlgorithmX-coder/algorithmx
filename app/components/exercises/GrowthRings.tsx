"use client";

/**
 * GrowthRings — the tree-ring REVEAL drill (Week 17).
 *
 * A big tree slice with concentric rings, youngest at the centre. Rings
 * light up ONE AT A TIME from the middle outward: tap the glowing ring
 * and its story card slides in below (what grows in that ring, and why
 * the 13+ sign waits at the edge). Rings ahead of the glow just wobble —
 * no wrong answers by design, like every REVEAL beat.
 *
 * The enforced centre-outward order is the point (you grow through the
 * rings in order — no skipping), and is what separates this from
 * RevealBoard's any-order card flips.
 *
 * Learn-Loop wiring (every new prop optional; a week that passes none of
 * them renders exactly as before): the Raccoon's boast folds into the intro
 * (`threat`), Sarah speaks the how-to once as the board appears, and each
 * ring's `readAloud` plays as that ring is revealed (audio-only,
 * `recordedOnly`, taps held). The reveal IS the payoff, so there is no
 * verdict; the complete beat waits for the last ring's line and can speak
 * the "you're protected" payoff. The "campfire" skin swaps the ring
 * colours to ember tones and the heartwood to an ember glow, nothing else.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useExerciseFeedback } from "@/app/lib/gameEngine/useExerciseFeedback";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useLessonTheme } from "@/app/components/lesson/LessonThemeContext";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import ExerciseIntroBeat, { ExerciseCompleteBeat } from "@/app/components/lesson/ExerciseBeats";
import CoachCaption from "@/app/components/lesson/CoachCaption";
import InfoNarration from "@/app/components/lesson/InfoNarration";
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

export interface GrowthRing {
  id: string;
  /** Short ring label, e.g. "NOW · 6-9". */
  label: string;
  /** Emoji rendered via PixIcon on the ring's story card. */
  icon: string;
  /** Story card headline. */
  title: string;
  /** Story card body — what grows in this ring. */
  text: string;
  /** Sarah's read-aloud as this ring is revealed (audio only, taps held).
   *  Optional: no read when absent. */
  readAloud?: string;
}

export interface GrowthRingsProps {
  /** Rings in centre-outward order (4 recommended). */
  rings: GrowthRing[];
  /** Copy overrides (defaults keep the W17 tree skin). */
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  /** Label at the very centre of the slice. */
  centerLabel?: string;
  revealToast?: string;
  /** Line shown once every ring is lit. */
  finale?: string;
  completeTitle?: string;
  completeLine?: string;
  /** Visual skin. "tree" (default) = the W17 slice; "campfire" = warm ember
   *  ring colours and an ember-glow heartwood. Everything else identical. */
  skin?: "tree" | "campfire";
  /** What one ring is called in the board copy ("RING 2 OF 4"). Default "ring". */
  ringNoun?: string;
  /** Placeholder shown before the first tap. Default: the tree wording. */
  placeholder?: string;
  /** First stat line on the complete beat. Default "n/n rings grown". */
  completeStat?: string;
  introNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  /** The how-to, spoken once as the board appears (audio only). */
  coachLines?: { speaker?: "adam" | "layla"; lines: string[] };
  /** Optional "Spot the Danger" Raccoon preamble folded into the intro. */
  threat?: { raccoonLine: string };
  /** Optional spoken "you're protected" payoff on the complete screen. */
  completeNarration?: { speaker?: "adam" | "layla"; lines: string[] };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

const RING_COLOURS = ["#ffd158", "#7eff97", "#7df0ff", "#c084fc", "#ff5fb3"];
/** "campfire" skin: the same five slots in warm ember tones. */
const EMBER_COLOURS = ["#ffb347", "#ff8e6e", "#ffd27a", "#f5a623", "#ff6b3d"];

export default function GrowthRings({
  rings,
  introTitle,
  introSubtitle,
  introIcon,
  centerLabel,
  revealToast,
  finale,
  completeTitle,
  completeLine,
  skin = "tree",
  ringNoun = "ring",
  placeholder,
  completeStat,
  introNarration,
  coachLines,
  threat,
  completeNarration,
  onComplete,
  onCorrect,
  onAnswered,
}: GrowthRingsProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#7df0ff";
  // Both content voices are Sarah; in-game read-alouds are recorded under
  // "adam", so every manifest lookup here uses that key (the intro / how-to /
  // complete blocks keep their own authored speaker).
  const voice = "adam" as const;
  const colours = skin === "campfire" ? EMBER_COLOURS : RING_COLOURS;
  // Legacy mode (W17-style data: default skin and no read-aloud on any ring):
  // the how-to is the on-screen CoachCaption exactly as before the Learn-Loop
  // wiring, and is NOT also spoken through the audio-only chain.
  const legacy = skin === "tree" && !rings.some((r) => !!r.readAloud);

  const [showIntro, setShowIntro] = useState(true);
  const [litCount, setLitCount] = useState(0);
  const [wobbleId, setWobbleId] = useState<string | null>(null);
  // Legacy mode only: the CoachCaption leaves on the child's first tap.
  const [hasInteracted, setHasInteracted] = useState(false);
  // Read-aloud chain: the how-to once as the board appears, then each ring's
  // story as it is revealed. Taps are held while she speaks. "idle" = nothing playing.
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");

  const allLit = litCount >= rings.length;
  // The complete beat waits for the last ring's read-aloud (the reveal is the
  // payoff); with no read-alouds this is the old "finished" exactly.
  const finished = allLit && narr === "idle";
  const current = rings[litCount];
  const lastLit = litCount > 0 ? rings[litCount - 1] : undefined;
  const speaking = narr !== "idle";

  // Safety releases for the spoken gate (never leave the board held).
  useEffect(() => {
    if (narr === "idle") return;
    const id = window.setTimeout(() => setNarr("idle"), SPOKEN_GATE_MAX_MS);
    return () => window.clearTimeout(id);
  }, [narr]);
  useEffect(() => subscribeAudioMute((muted) => { if (muted) setNarr("idle"); }), []);

  const startBoard = () => {
    setShowIntro(false);
    // Nothing is revealed yet, so there is no ring to read: the how-to (if
    // any), then idle. The first read-aloud plays on the first reveal.
    setNarr(legacy || isAudioMuted() ? "idle" : coachLines ? "howto" : "idle");
  };

  const tap = (idx: number) => {
    if (showIntro || allLit || speaking) return;
    setHasInteracted(true);
    const ring = rings[idx];
    if (idx !== litCount) {
      // Rings ahead (or already lit) just wobble — growth goes in order.
      audio.hover();
      setWobbleId(ring.id);
      window.setTimeout(() => setWobbleId(null), 450);
      return;
    }
    audio.correct();
    fx.correct({ xp: 25, text: revealToast ?? "RING GROWN!" });
    onCorrect?.();
    onAnswered?.({
      questionKey: `ring-${ring.id}`,
      selectedIndex: idx,
      correctIndex: idx,
      wasCorrect: true,
    });
    setLitCount((n) => n + 1);
    // The reveal is the payoff: Sarah reads the ring's story as it lights (no verdict).
    setNarr(!isAudioMuted() && ring.readAloud ? "read" : "idle");
  };

  // Concentric slice geometry: outermost ring drawn first, centre on top.
  const SIZE = 320;
  const step = SIZE / (rings.length * 2 + 1.6);

  return (
    <ExerciseFrame maxWidth={820} decor>
      {fx.layer()}

      {showIntro && (
        <ExerciseIntroBeat
          title={introTitle ?? "The Growth Rings"}
          subtitle={introSubtitle ?? "A tree slice of YOU. Tap the glowing ring, middle first, and watch what grows before you reach the 13+ sign."}
          icon={introIcon ?? "🔰"}
          narration={introNarration}
          threat={threat}
          character={introNarration?.speaker}
          onDismiss={startBoard}
        />
      )}

      {/* Sarah's read-alouds (audio only): the how-to once, then each revealed ring. */}
      {!showIntro && !finished && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="gr-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
          {narr === "read" && lastLit?.readAloud && (
            <InfoNarration key={`gr-read-${lastLit.id}`} speaker={voice} lines={[lastLit.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, justifyContent: "center", alignItems: "center" }}>
        {/* The tree slice */}
        <div style={{ position: "relative", width: SIZE, height: SIZE, flex: "0 0 auto" }}>
          {rings.map((ring, i) => {
            // ring i occupies the (i+1)-th band from the centre
            const diameter = SIZE - (rings.length - 1 - i) * step * 2;
            const lit = i < litCount;
            const isNext = i === litCount;
            return (
              <motion.button
                key={ring.id}
                type="button"
                onClick={() => tap(i)}
                onPointerEnter={() => audio.hover()}
                disabled={speaking}
                animate={
                  wobbleId === ring.id
                    ? { rotate: [0, -2.5, 2.5, 0] }
                    : isNext && !reduce
                      ? { scale: [1, 1.015, 1] }
                      : {}
                }
                transition={
                  wobbleId === ring.id
                    ? { duration: 0.4 }
                    : isNext && !reduce
                      ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                      : undefined
                }
                style={{
                  position: "absolute",
                  // computed offsets, NOT translate(-50%,-50%): framer-motion's
                  // scale/rotate animations replace the transform wholesale,
                  // which would drop the centering mid-pulse
                  left: (SIZE - diameter) / 2,
                  top: (SIZE - diameter) / 2,
                  width: diameter,
                  height: diameter,
                  // innermost ring must paint (and receive taps) on top
                  zIndex: rings.length - i,
                  borderRadius: "50%",
                  border: lit
                    ? `3px solid ${colours[i % colours.length]}`
                    : isNext
                      ? "3px dashed #7df0ff"
                      : "2.5px dashed rgba(125,140,201,0.4)",
                  background: lit
                    ? `radial-gradient(circle, transparent 55%, ${colours[i % colours.length]}26 100%)`
                    : "rgba(46,32,72,0.35)",
                  boxShadow: lit ? `0 0 24px -6px ${colours[i % colours.length]}` : "none",
                  cursor: speaking ? "wait" : "pointer",
                  opacity: speaking ? 0.85 : 1,
                  fontFamily: "inherit",
                  padding: 0,
                  touchAction: "manipulation",
                }}
                aria-label={ring.label}
              >
                {/* ring label pinned to the top band of its circle */}
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    left: "50%",
                    transform: "translateX(-50%)",
                    fontSize: 10.5,
                    fontWeight: 900,
                    letterSpacing: "0.08em",
                    whiteSpace: "nowrap",
                    color: lit ? colours[i % colours.length] : isNext ? "#7df0ff" : "rgba(125,140,201,0.75)",
                    textShadow: "0 2px 6px rgba(0,0,0,0.8)",
                  }}
                >
                  {ring.label}
                </span>
              </motion.button>
            );
          })}
          {/* Centre heartwood */}
          <div
            style={{
              position: "absolute",
              left: (SIZE - step * 1.6) / 2,
              top: (SIZE - step * 1.6) / 2,
              width: step * 1.6,
              height: step * 1.6,
              zIndex: rings.length + 1,
              borderRadius: "50%",
              background:
                skin === "campfire"
                  ? "radial-gradient(circle at 50% 40%, #fff1c2 0%, #ffb347 45%, #ff6b3d 100%)"
                  : "linear-gradient(145deg, #ffe9ad, #e8a413)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 10,
              fontWeight: 900,
              color: "#3a2a08",
              letterSpacing: "0.06em",
              boxShadow: skin === "campfire" ? "0 0 22px rgba(255,140,61,0.8)" : "0 0 18px rgba(255,209,88,0.65)",
              pointerEvents: "none",
              textAlign: "center",
            }}
          >
            {centerLabel ?? "YOU"}
          </div>
        </div>

        {/* Story card for the last-lit ring */}
        <div style={{ flex: "1 1 280px", maxWidth: 400, minHeight: 170 }}>
          <AnimatePresence mode="wait">
            {litCount > 0 && (
              <motion.div
                key={rings[litCount - 1].id}
                initial={reduce ? false : { y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={reduce ? undefined : { y: -24, opacity: 0 }}
                style={{
                  padding: "16px 18px",
                  borderRadius: 16,
                  background: "linear-gradient(165deg, rgba(0,229,255,0.1), rgba(12,18,48,0.92))",
                  border: `2px solid ${colours[(litCount - 1) % colours.length]}66`,
                  color: "#eaf9ff",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <PixIcon emoji={rings[litCount - 1].icon} size={30} />
                  <span style={{ fontSize: 15.5, fontWeight: 900, color: colours[(litCount - 1) % colours.length] }}>
                    {rings[litCount - 1].title}
                  </span>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.45, color: "#dff6ff" }}>
                  {rings[litCount - 1].text}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {litCount === 0 && (
            <div
              style={{
                padding: "16px 18px",
                borderRadius: 16,
                border: "2px dashed rgba(125,140,201,0.4)",
                color: "#7d8cc9",
                fontSize: 13.5,
                fontWeight: 800,
                textAlign: "center",
              }}
            >
              {placeholder ?? "Tap the glowing middle ring to start growing…"}
            </div>
          )}
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 14, fontSize: 12, fontWeight: 800, color: "#7d8cc9", letterSpacing: "0.1em" }}>
        {current ? `${ringNoun.toUpperCase()} ${litCount + 1} OF ${rings.length}` : (finale ?? "EVERY RING GROWN!")}
      </div>

      {legacy && coachLines && !showIntro && !hasInteracted && !finished && (
        <CoachCaption lines={coachLines.lines} speaker={coachLines.speaker} />
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle ?? "Every ring is glowing!"}
          stars={3}
          statLines={[
            completeStat ?? `${rings.length}/${rings.length} rings grown`,
            completeLine ?? (finale ?? "The 13+ sign isn't a wall - it's a promise you grow towards."),
          ]}
          narration={completeNarration}
          onContinue={() => onComplete(rings.length)}
        />
      )}
    </ExerciseFrame>
  );
}
