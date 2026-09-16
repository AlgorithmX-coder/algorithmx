"use client";

/**
 * FirewallBuilder — the BUILD drill, rebuilt for Week 4 as "The No-Bite Wall".
 *
 * The original was an orphaned canvas arcade (falling blocks, a timer, power-ups
 * and a lose state at five bad catches) with its bricks hard-coded and no week
 * using it. It now takes content and follows the Learn-Loop contract: no timer,
 * no lose state, tap-only.
 *
 * Bricks arrive one at a time in a tray and Sarah reads each one. The child
 * taps a COLUMN of the wall to lay a safe habit into it (the brick slides down
 * to the lowest free slot) or taps the BIN to throw a bad habit out. A wrong
 * move teaches (a bad brick laid in the wall cracks and falls back to the tray;
 * a good brick binned bounces back) and the same brick waits for the retry. The
 * wall is complete when every good brick is laid, and the NO BITE banner lights.
 *
 * Learn-Loop wiring: Raccoon boast in the intro (`threat`), Sarah's how-to once
 * and every brick read aloud as it arrives (audio-only, `recordedOnly`, taps
 * held), a one-take spoken verdict on every move (right: "That's right!" +
 * why; wrong: "Not quite." + whyWrong), round 1 glows the right target (the
 * columns for a good brick, the bin for a bad one) with a one-line strip, hint
 * tiers, spoken payoff on the complete beat, bricks shuffled per play, and the
 * tray brick always wears the same paint (no giveaway).
 */

import { useEffect, useMemo, useRef, useState } from "react";
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
const COLS = 3;

export interface WallBrick {
  id: string;
  text: string;
  good: boolean;
  readAloud: string;
  why: string;
  whyWrong: string;
}

/** The original wall's habits, kept as the default set for the legacy
 *  previews that mount the engine with no content (LessonPlayer, dev preview,
 *  the Explorers week-1 page). Week content always passes its own bricks. */
const DEFAULT_BRICKS: WallBrick[] = [
  { id: "strong", text: "Strong passwords", good: true, readAloud: "Strong passwords.", why: "A strong password is a wall brick. It keeps your accounts yours.", whyWrong: "Strong passwords protect you. That brick belongs in the wall." },
  { id: "updates", text: "Keep apps updated", good: true, readAloud: "Keep apps updated.", why: "Updates fix the holes tricksters climb through. Safe habit.", whyWrong: "Keeping apps updated is a safe habit. Lay it in the wall." },
  { id: "logout", text: "Log out when done", good: true, readAloud: "Log out when done.", why: "Logging out shuts the door behind you. Safe habit.", whyWrong: "Logging out when you're done is a safe habit. It belongs in the wall." },
  { id: "share", text: "Share your password", good: false, readAloud: "Share your password.", why: "A shared password is not a secret any more. Into the bin!", whyWrong: "Sharing your password gives your key away. That brick goes in the bin." },
  { id: "every-link", text: "Tap every link", good: false, readAloud: "Tap every link.", why: "Tapping every link is how tricks get in. Bin it.", whyWrong: "Tapping every link is a bad habit. It goes in the bin." },
  { id: "p123", text: "Use password123", good: false, readAloud: "Use password one two three.", why: "Password one two three is the first guess anyone tries. Bin it.", whyWrong: "Password one two three is the easiest guess in the world. That brick goes in the bin." },
];

export interface FirewallBuilderProps {
  /** Optional only for the legacy previews; week content always sets it. */
  bricks?: WallBrick[];
  introTitle?: string;
  introSubtitle?: string;
  introIcon?: string;
  wallLabel?: string;
  binLabel?: string;
  layToast?: string;
  binToast?: string;
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

export default function FirewallBuilder({
  bricks = DEFAULT_BRICKS,
  introTitle = "The No-Bite Wall",
  introSubtitle = "Lay every safe habit into the wall. Throw the bad ones in the bin.",
  introIcon = "🧱",
  wallLabel = "THE NO-BITE WALL",
  binLabel = "THROW IT OUT",
  layToast = "BRICK LAID!",
  binToast = "BINNED!",
  completeTitle = "The wall is built!",
  completeLine = "Nothing bites through a wall like that.",
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
}: FirewallBuilderProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const accent = useLessonTheme()?.accent ?? "#e84dff";
  const voice = "adam" as const;

  const [showIntro, setShowIntro] = useState(true);
  const [idx, setIdx] = useState(0);
  // Laid bricks per column, bottom first.
  const [wall, setWall] = useState<WallBrick[][]>(() => Array.from({ length: COLS }, () => []));
  const [binned, setBinned] = useState<WallBrick[]>([]);
  const [fx2, setFx2] = useState<null | { kind: "crack" | "bounce"; key: number; col?: number }>(null);
  const [narr, setNarr] = useState<"howto" | "read" | "idle">("idle");
  const [brickWrongs, setBrickWrongs] = useState(0);
  const [totalWrongs, setTotalWrongs] = useState(0);
  const [moves, setMoves] = useState(0);

  const order = useShuffledOnce(bricks);
  const goodCount = useMemo(() => bricks.filter((b) => b.good).length, [bricks]);
  // Three rows minimum so the wall reads as a wall (and fills its frame) even
  // when every good brick fits in two.
  const rows = Math.max(3, Math.ceil(goodCount / COLS));
  const finished = idx >= order.length;
  const brick = order[idx];
  const verdict = useVerdictVoice(voice);
  const speaking = narr !== "idle" || verdict.speaking;
  const guided = moves === 0;
  const laid = wall.reduce((n, col) => n + col.length, 0);

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
    setBrickWrongs(0);
    setFx2(null);
    setNarr(isAudioMuted() ? "idle" : "read");
  };

  const move = (target: "bin" | number) => {
    if (!brick || speaking) return;
    if (typeof target === "number" && wall[target].length >= rows) return;
    setMoves((n) => n + 1);
    const right = target === "bin" ? !brick.good : brick.good;
    onAnswered?.({ questionKey: `wall-${brick.id}`, selectedIndex: target === "bin" ? 1 : 0, correctIndex: brick.good ? 0 : 1, wasCorrect: right });
    if (right) {
      audio.correct();
      onCorrect?.();
      if (target === "bin") {
        setBinned((b) => [...b, brick]);
        fx.correct({ xp: 15, text: binToast });
      } else {
        setWall((w) => w.map((col, i) => (i === target ? [...col, brick] : col)));
        fx.correct({ xp: 20, text: layToast });
      }
      // Let the brick land before the next one arrives.
      verdict.say("right", brick.why, () => {
        window.setTimeout(advance, reduce ? 200 : 700);
      });
    } else {
      audio.wrong();
      onWrong?.();
      setTotalWrongs((n) => n + 1);
      setBrickWrongs((n) => n + 1);
      setFx2((prev) => ({ kind: target === "bin" ? "bounce" : "crack", key: (prev?.key ?? 0) + 1, col: typeof target === "number" ? target : undefined }));
      verdict.say("wrong", brick.whyWrong);
    }
  };

  const stars = totalWrongs === 0 ? 3 : totalWrongs <= 2 ? 2 : 1;
  const hintText = brickWrongs >= 2 ? hints?.tier2 : brickWrongs === 1 ? hints?.tier1 : undefined;
  const wallDone = laid >= goodCount;

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

      {!showIntro && !finished && brick && (
        <div aria-hidden style={AUDIO_ONLY_STYLE}>
          {narr === "howto" && coachLines && (
            <InfoNarration key="fw-howto" speaker={coachLines.speaker ?? voice} lines={coachLines.lines} accent={accent} recordedOnly onDone={() => setNarr("read")} />
          )}
          {narr === "read" && (
            <InfoNarration key={`fw-read-${brick.id}`} speaker={voice} lines={[brick.readAloud]} accent={accent} recordedOnly onDone={() => setNarr("idle")} />
          )}
        </div>
      )}

      {!showIntro && !finished && brick && (
        <div style={{ position: "relative", zIndex: 1 }}>
          {/* Side padding keeps the header clear of the frame's corner ornaments. */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "2px 22px 0" }}>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
              🧱 {wallLabel}
            </span>
            <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: "#c9b8ff" }}>
              Brick {Math.min(idx + 1, order.length)} of {order.length}
            </span>
          </div>

          <div style={{ display: "flex", gap: 16, alignItems: "stretch", flexWrap: "wrap" }}>
            {/* The wall: three tappable columns, bricks stack from the ground up. */}
            <div
              style={{
                flex: "2 1 400px",
                minWidth: 300,
                borderRadius: 18,
                background: "linear-gradient(180deg, rgba(60,10,51,0.85) 0%, rgba(30,5,25,0.95) 100%)",
                border: `1px solid ${accent}55`,
                boxShadow: "0 18px 40px -22px rgba(0,0,0,0.7)",
                padding: 12,
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <AnimatePresence>
                {wallDone && (
                  <motion.div
                    key="banner"
                    initial={reduce ? { opacity: 0 } : { opacity: 0, y: -10, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    style={{ textAlign: "center", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: "0.14em", color: "#7eff97", textShadow: "0 0 18px rgba(126,255,151,0.6)" }}
                  >
                    ✋ NO BITE!
                  </motion.div>
                )}
              </AnimatePresence>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gap: 8, flex: 1 }}>
                {wall.map((col, ci) => {
                  const full = col.length >= rows;
                  const armed = !speaking && !full;
                  const glow = guided && brick.good && armed;
                  return (
                    <motion.button
                      key={ci}
                      type="button"
                      aria-label={`Lay the brick in column ${ci + 1}${full ? " (full)" : ""}`}
                      onClick={() => move(ci)}
                      disabled={!armed}
                      animate={fx2?.kind === "crack" && fx2.col === ci && !reduce ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        position: "relative",
                        display: "flex",
                        flexDirection: "column-reverse",
                        gap: 6,
                        minHeight: rows * 74 + 12,
                        padding: 6,
                        borderRadius: 12,
                        background: "rgba(255,255,255,0.05)",
                        border: `2px dashed ${glow ? accent : armed ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.12)"}`,
                        boxShadow: glow ? `0 0 0 3px ${accent}66, 0 0 22px ${accent}88` : "none",
                        cursor: armed ? "pointer" : "default",
                        animation: glow && !reduce ? "fwGuide 1.4s ease-in-out infinite" : undefined,
                      }}
                    >
                      {col.map((b, ri) => (
                        <motion.div
                          key={b.id}
                          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -220 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={reduce ? { duration: 0.15 } : { type: "spring", stiffness: 200, damping: 16 }}
                          style={{
                            borderRadius: 8,
                            background: ri % 2 ? "linear-gradient(180deg, #d9905a 0%, #b56a3a 100%)" : "linear-gradient(180deg, #e0a06a 0%, #bf7645 100%)",
                            border: "2px solid #7a3f1c",
                            boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.18)",
                            color: "#fff7e6",
                            fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                            fontSize: 12.5,
                            fontWeight: 800,
                            lineHeight: 1.2,
                            padding: "9px 8px",
                            minHeight: 68,
                            display: "grid",
                            placeItems: "center",
                            textAlign: "center",
                            textShadow: "0 1px 0 rgba(0,0,0,0.35)",
                          }}
                        >
                          {b.text}
                        </motion.div>
                      ))}
                      {/* A cracked brick falls out of the wall (a bad habit laid) */}
                      <AnimatePresence>
                        {fx2?.kind === "crack" && fx2.col === ci && (
                          <motion.div
                            key={fx2.key}
                            initial={{ opacity: 1, y: -40, rotate: 0 }}
                            animate={{ opacity: 0, y: 60, rotate: 18 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: reduce ? 0.2 : 0.7 }}
                            style={{ position: "absolute", left: 8, right: 8, top: 10, borderRadius: 8, background: "linear-gradient(180deg, #7a7a7a, #4b4b4b)", border: "2px solid #2a2a2a", color: "#fff", fontSize: 12, fontWeight: 800, padding: "8px 6px", textAlign: "center", pointerEvents: "none" }}
                          >
                            ✖ {brick.text}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  );
                })}
              </div>
              <div aria-hidden style={{ height: 8, borderRadius: 4, background: "linear-gradient(90deg, #5c3a1e, #8a5a32, #5c3a1e)" }} />
            </div>

            {/* The tray with the current brick, and the bin */}
            <div style={{ flex: "1 1 220px", minWidth: 200, display: "flex", flexDirection: "column", gap: 10 }}>
              <div
                style={{
                  borderRadius: 16,
                  background: "linear-gradient(180deg, #fff6e6 0%, #f1dfc2 100%)",
                  border: "2px solid rgba(138,90,18,0.4)",
                  boxShadow: "0 14px 30px -18px rgba(0,0,0,0.7)",
                  padding: 12,
                  textAlign: "center",
                  fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                  color: "#2a1a08",
                }}
              >
                <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 10, fontWeight: 800, letterSpacing: "0.22em", textTransform: "uppercase", color: "#8a5a12", marginBottom: 8 }}>The tray</div>
                <motion.div
                  key={brick.id + (fx2?.kind === "bounce" ? fx2.key : "")}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
                  animate={fx2?.kind === "bounce" && !reduce ? { opacity: 1, y: [0, -18, 0, -8, 0] } : { opacity: 1, y: 0 }}
                  transition={{ duration: reduce ? 0.15 : 0.5 }}
                  style={{
                    // The tray brick wears one paint for good and bad alike: nothing hints at the answer.
                    borderRadius: 10,
                    background: "linear-gradient(180deg, #e0a06a 0%, #bf7645 100%)",
                    border: "2px solid #7a3f1c",
                    boxShadow: "inset 0 -4px 0 rgba(0,0,0,0.18), 0 8px 16px -10px rgba(0,0,0,0.7)",
                    color: "#fff7e6",
                    fontSize: 15,
                    fontWeight: 800,
                    lineHeight: 1.25,
                    padding: "14px 10px",
                    minHeight: 64,
                    display: "grid",
                    placeItems: "center",
                    textShadow: "0 1px 0 rgba(0,0,0,0.35)",
                  }}
                >
                  <span><PixIcon emoji="🧱" size={18} /> {brick.text}</span>
                </motion.div>
              </div>

              <motion.button
                type="button"
                aria-label={binLabel}
                onClick={() => move("bin")}
                disabled={speaking}
                whileTap={speaking || reduce ? undefined : { scale: 0.97 }}
                style={{
                  borderRadius: 16,
                  background: "linear-gradient(180deg, #3b4252 0%, #232a38 100%)",
                  border: `2px solid ${guided && !brick.good && !speaking ? accent : "rgba(255,255,255,0.25)"}`,
                  boxShadow: guided && !brick.good && !speaking ? `0 0 0 3px ${accent}66, 0 0 22px ${accent}88` : "0 14px 30px -18px rgba(0,0,0,0.7)",
                  color: "#fff7e6",
                  padding: "14px 12px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: speaking ? "wait" : "pointer",
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: 13,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  flex: 1,
                  animation: guided && !brick.good && !speaking && !reduce ? "fwGuide 1.4s ease-in-out infinite" : undefined,
                }}
              >
                <span aria-hidden style={{ fontSize: 34 }}>🗑️</span>
                {binLabel}
                {binned.length > 0 && <span style={{ fontSize: 11, opacity: 0.8, letterSpacing: "0.06em" }}>{binned.length} thrown out</span>}
              </motion.button>
            </div>
          </div>

          <div style={{ textAlign: "center", marginTop: 12 }}>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", textTransform: "uppercase", color: accent }}>
              {guided
                ? brick.good
                  ? "Round 1: this brick is a safe habit. Tap a glowing column to lay it in the wall"
                  : "Round 1: this brick is a bad habit. Tap the glowing bin to throw it out"
                : "Listen to the brick · safe habit? tap a column · bad habit? tap the bin"}
            </div>
          </div>

          <div style={{ maxWidth: 560, margin: "8px auto 0" }}>
            {hintText && <HintBubble tier={brickWrongs >= 2 ? 2 : 1} speaker={voice} text={hintText} />}
          </div>
          <style>{`@keyframes fwGuide { 0%,100% { box-shadow: 0 0 0 3px ${accent}55, 0 0 16px ${accent}77 } 50% { box-shadow: 0 0 0 6px ${accent}22, 0 0 28px ${accent} } }`}</style>
        </div>
      )}

      {finished && (
        <ExerciseCompleteBeat
          title={completeTitle}
          stars={stars}
          statLines={[`${laid} safe habit${laid === 1 ? "" : "s"} in the wall`, `${binned.length} bad habit${binned.length === 1 ? "" : "s"} thrown out`, completeLine]}
          narration={completeNarration}
          onContinue={() => onComplete(stars === 3 ? 100 : stars === 2 ? 70 : 40)}
        />
      )}
    </ExerciseFrame>
  );
}
