"use client";

/**
 * EncoreOfTwenty - Week 20 (Graduation) signature exercise.
 *
 * The graduation stage floor is a ring of six glowing tiles, each carrying an
 * emblem from the journey (key, mask, diamond, gamepad, globe, shield). The
 * stage PERFORMS: tiles light up in a sequence with a little visual sting on
 * each, and the child ECHOES it back by tapping the same tiles in the same
 * order (watch-then-repeat). The sequence grows 2 -> 4 -> 6 across three
 * rounds, and every landed echo makes the crowd of characters cheer louder.
 *
 * A miss is NEVER a fail: the stage replays the SAME sequence slower, and on
 * the retry the next expected tile is ghost-hinted so every child gets there.
 * WIN = the final sequence echoed back -> full stage ignition, fireworks, cap
 * toss and a badge shower -> onComplete().
 *
 * Teaches: graduation means performing your powers from memory in front of
 * everyone. Recalling the emblems is a celebration-shaped rehearsal of the
 * whole 20-week journey.
 *
 * Self-contained by design: all copy lives here, deps are react +
 * framer-motion + ExerciseFrame + PixIcon + inline SVG only.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import PixIcon from "@/app/components/lesson/PixIcon";
import { playSound } from "@/app/lib/sounds";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

interface TileDef {
  emoji: string;
  label: string;
  color: string;
  rgb: string;
}

/** Six week emblems around the stage. All emojis are PixIcon-mapped. */
const TILES: readonly TileDef[] = [
  { emoji: "🔑", label: "Passwords", color: "#ffd166", rgb: "255,209,102" },
  { emoji: "🎭", label: "Strangers", color: "#c084fc", rgb: "192,132,252" },
  { emoji: "💎", label: "Private Info", color: "#7df0ff", rgb: "125,240,255" },
  { emoji: "🎮", label: "Game Smarts", color: "#34d399", rgb: "52,211,153" },
  { emoji: "🌍", label: "Footprint", color: "#60a5fa", rgb: "96,165,250" },
  { emoji: "🛡️", label: "Shield Up", color: "#fb7185", rgb: "251,113,133" },
] as const;

/** Sequence length per round: grows 2 -> 4 -> 6. */
const ROUND_LENGTHS = [2, 4, 6] as const;
const ROUNDS = ROUND_LENGTHS.length;

const CHEERS = [
  "The crowd claps along!",
  "The crowd is on its feet!",
  "THE CROWD GOES WILD!",
] as const;

const CROWD_LABELS = [
  "The crowd is watching...",
  "The crowd claps along!",
  "The crowd is on its feet!",
  "THE CROWD GOES WILD!",
] as const;

/** Little audience of familiar faces (all PixIcon-mapped glyphs). */
const CROWD = ["🦸", "🕵️", "👪", "🦝", "🦸‍♀️", "💪", "🦸‍♂️"] as const;

/* Timing (ms) */
const WATCH_LEAD_MS = 750;
const STEP_MS = 950;
const LIT_MS = 580;
const SLOW_STEP_MS = 1350;
const SLOW_LIT_MS = 900;
const MISS_PAUSE_MS = 1400;
const LANDED_PAUSE_MS = 2000;
const CELEBRATE_MS = 4200;

/* Palette */
const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const GOLD = "#ffd166";
const SOFT_INK = "#e7ecff";

type Phase = "intro" | "watch" | "echo" | "miss" | "landed" | "celebrate";

/** Random sequence with no immediate repeats (clearer for small eyes). */
function makeSequence(len: number): number[] {
  const seq: number[] = [];
  for (let i = 0; i < len; i++) {
    let t = Math.floor(Math.random() * TILES.length);
    while (i > 0 && t === seq[i - 1]) {
      t = Math.floor(Math.random() * TILES.length);
    }
    seq.push(t);
  }
  return seq;
}

/** Position of tile i on the ring (percent of the stage box). */
function tilePos(i: number): { left: string; top: string } {
  const a = ((-90 + i * 60) * Math.PI) / 180;
  return {
    left: `${50 + 38 * Math.cos(a)}%`,
    top: `${50 + 38 * Math.sin(a)}%`,
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function EncoreOfTwenty({ onComplete, narration, accent }: { onComplete: () => void; narration?: { speaker?: "adam" | "layla"; lines: string[] }; accent?: string }) {
  const reduce = !!useReducedMotion();

  const [phase, setPhase] = useState<Phase>("intro");
  const [round, setRound] = useState(0);
  const [seq, setSeq] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);
  const [slowMode, setSlowMode] = useState(false);
  const [litTile, setLitTile] = useState<number | null>(null);
  const [cheer, setCheer] = useState(0);
  const [flash, setFlash] = useState<{ tile: number; kind: "good" | "bad"; id: number } | null>(null);
  const [sting, setSting] = useState<{ tile: number; id: number } | null>(null);
  const [cheerBurst, setCheerBurst] = useState<number | null>(null);

  const progressRef = useRef(0);
  const missLockRef = useRef(false);
  const completedRef = useRef(false);
  const idRef = useRef(0);

  const nextId = () => ++idRef.current;

  /* ------------------------- round control ------------------------- */

  const beginRound = (r: number, slow: boolean, existing?: number[]) => {
    progressRef.current = 0;
    missLockRef.current = false;
    setRound(r);
    setSeq(existing ?? makeSequence(ROUND_LENGTHS[r]));
    setSlowMode(slow);
    setProgress(0);
    setFlash(null);
    setPhase("watch");
  };

  const handleStart = () => {
    playSound("reveal");
    beginRound(0, false);
  };

  /* ----------------------- watch: stage performs ------------------- */

  useEffect(() => {
    if (phase !== "watch") return;
    const step = slowMode ? SLOW_STEP_MS : STEP_MS;
    const lit = slowMode ? SLOW_LIT_MS : LIT_MS;
    const timers: ReturnType<typeof setTimeout>[] = [];

    seq.forEach((tile, i) => {
      timers.push(
        setTimeout(() => {
          setLitTile(tile);
          setSting({ tile, id: nextId() });
          playSound("pop");
        }, WATCH_LEAD_MS + i * step),
      );
      timers.push(
        setTimeout(() => {
          setLitTile(null);
          setSting(null);
        }, WATCH_LEAD_MS + i * step + lit),
      );
    });

    timers.push(
      setTimeout(() => {
        progressRef.current = 0;
        setProgress(0);
        missLockRef.current = false;
        setPhase("echo");
      }, WATCH_LEAD_MS + seq.length * step + 350),
    );

    return () => timers.forEach(clearTimeout);
  }, [phase, seq, slowMode]);

  /* -------------------------- echo: taps --------------------------- */

  const tapTile = (i: number) => {
    if (phase !== "echo" || missLockRef.current || completedRef.current) return;

    if (i === seq[progressRef.current]) {
      playSound("select");
      setFlash({ tile: i, kind: "good", id: nextId() });
      progressRef.current += 1;
      setProgress(progressRef.current);

      if (progressRef.current >= seq.length) {
        // Echo landed! The crowd gets louder.
        missLockRef.current = true;
        playSound("correct");
        setCheer((c) => Math.min(ROUNDS, c + 1));
        setCheerBurst(nextId());
        setPhase("landed");
      }
    } else {
      // A miss is never a fail: gentle red flash, then the stage replays
      // the SAME sequence slower with the next tile ghost-hinted.
      missLockRef.current = true;
      playSound("wrong");
      setFlash({ tile: i, kind: "bad", id: nextId() });
      setPhase("miss");
    }
  };

  /* ------------------- miss: replay, never a fail ------------------ */

  useEffect(() => {
    if (phase !== "miss") return;
    const t = setTimeout(() => {
      beginRound(round, true, seq);
    }, MISS_PAUSE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* --------------------- landed: next or finale -------------------- */

  useEffect(() => {
    if (phase !== "landed") return;
    const t = setTimeout(() => {
      if (round < ROUNDS - 1) {
        beginRound(round + 1, false);
      } else {
        setPhase("celebrate");
      }
    }, LANDED_PAUSE_MS);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ------------------------- celebrate + win ----------------------- */

  useEffect(() => {
    if (phase !== "celebrate") return;
    playSound("victory");
    const confettiT = setTimeout(() => playSound("confetti"), 500);
    const badgeT = setTimeout(() => playSound("badgeEarned"), 1400);
    const doneT = setTimeout(() => {
      if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    }, CELEBRATE_MS);
    return () => {
      clearTimeout(confettiT);
      clearTimeout(badgeT);
      clearTimeout(doneT);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* --------------------------- messaging --------------------------- */

  let message: string;
  switch (phase) {
    case "intro":
      message = "";
      break;
    case "watch":
      message = slowMode
        ? "Watch again, nice and slow. The glowing hint will help you!"
        : "Watch the stage light up your power emblems...";
      break;
    case "echo":
      message = slowMode
        ? "Your turn! Follow the glowing hint."
        : "Your turn! Tap the emblems in the same order.";
      break;
    case "miss":
      message = "No worries, hero! Every star rehearses. Watch once more...";
      break;
    case "landed":
      message = round < ROUNDS - 1 ? CHEERS[round] : "PERFECT ENCORE!";
      break;
    case "celebrate":
      message = "You performed every power from memory!";
      break;
  }

  const ghostTile = phase === "echo" && slowMode ? seq[progress] ?? null : null;
  const crowdLevel = phase === "celebrate" ? 3 : Math.min(3, cheer);
  const ignited = phase === "celebrate";

  /* ---------------------------- render ----------------------------- */

  return (
    <ExerciseFrame padding={24}>
      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          width: "100%",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "clamp(18px, 2.6vw, 26px)",
              fontWeight: 800,
              letterSpacing: 1.5,
              color: GOLD,
              textShadow: "0 2px 14px rgba(255,209,102,0.35)",
            }}
          >
            THE ENCORE OF TWENTY
          </div>
          {phase !== "intro" && (
            <div
              style={{
                padding: "4px 14px",
                borderRadius: 999,
                background: "rgba(125,240,255,0.12)",
                border: "1px solid rgba(125,240,255,0.35)",
                fontSize: 13,
                fontWeight: 700,
                color: "#7df0ff",
                letterSpacing: 1,
              }}
            >
              ENCORE {Math.min(round + 1, ROUNDS)} OF {ROUNDS}
            </div>
          )}
        </div>

        {/* Message bar */}
        <div style={{ minHeight: 30, display: "flex", alignItems: "center" }}>
          <AnimatePresence mode="wait">
            {message && (
              <motion.div
                key={`${phase}-${message}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontSize: "clamp(14px, 2vw, 18px)",
                  fontWeight: 700,
                  color:
                    phase === "miss"
                      ? "#ffc9c9"
                      : phase === "landed" || phase === "celebrate"
                        ? GOOD_GREEN
                        : SOFT_INK,
                  textAlign: "center",
                }}
              >
                {message}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Progress dots for the current sequence */}
        <div style={{ minHeight: 18, display: "flex", gap: 8, alignItems: "center" }}>
          {phase !== "intro" &&
            seq.map((_, i) => {
              const filled = phase === "landed" || phase === "celebrate" || i < progress;
              return (
                <motion.span
                  key={i}
                  animate={{ scale: filled ? 1 : 0.85 }}
                  style={{
                    width: 13,
                    height: 13,
                    borderRadius: "50%",
                    background: filled ? GOOD_GREEN : "rgba(231,236,255,0.18)",
                    border: `2px solid ${filled ? GOOD_GREEN : "rgba(231,236,255,0.35)"}`,
                    boxShadow: filled ? "0 0 10px rgba(52,211,153,0.6)" : "none",
                  }}
                />
              );
            })}
        </div>

        {/* Stage: ring of emblem tiles around a center spotlight */}
        <div
          style={{
            position: "relative",
            width: "min(100%, 480px)",
            aspectRatio: "1 / 1",
            margin: "0 auto",
          }}
        >
          {/* Stage floor glow */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: "6%",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,209,102,0.10) 0%, rgba(124,92,255,0.08) 55%, transparent 75%)",
              border: "2px dashed rgba(255,209,102,0.18)",
            }}
          />

          {/* Center spotlight: tells the child which mode we are in */}
          <CenterBadge phase={phase} reduce={reduce} />

          {/* Tiles */}
          {TILES.map((tile, i) => {
            const pos = tilePos(i);
            const isLit = litTile === i;
            const isGhost = ghostTile === i;
            const tileFlash = flash && flash.tile === i ? flash : null;
            return (
              <StageTile
                key={i}
                index={i}
                tile={tile}
                pos={pos}
                lit={isLit}
                ghost={isGhost}
                flash={tileFlash}
                ignited={ignited}
                clickable={phase === "echo"}
                reduce={reduce}
                onTap={() => tapTile(i)}
              />
            );
          })}

          {/* Visual sting on each performed light-up */}
          <AnimatePresence>
            {sting && (
              <StingBurst
                key={sting.id}
                pos={tilePos(sting.tile)}
                color={TILES[sting.tile].color}
              />
            )}
          </AnimatePresence>

          {/* Cheer burst when an echo lands */}
          <AnimatePresence>
            {cheerBurst !== null && phase === "landed" && (
              <CheerBurst key={cheerBurst} />
            )}
          </AnimatePresence>

          {/* Finale layers */}
          {ignited && <Fireworks reduce={reduce} />}
          {ignited && <CapToss reduce={reduce} />}
        </div>

        {/* Crowd */}
        <CrowdRow level={crowdLevel} reduce={reduce} landed={phase === "landed" || ignited} />
      </div>

      {/* Badge shower falls over the whole frame in the finale */}
      {ignited && <BadgeShower reduce={reduce} />}

      {/* Finale banner */}
      <AnimatePresence>
        {ignited && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: 0.9, type: "spring", stiffness: 220, damping: 18 }}
            style={{
              position: "absolute",
              left: "50%",
              top: "44%",
              transform: "translate(-50%, -50%)",
              zIndex: 30,
              padding: "18px 34px",
              borderRadius: 22,
              background: "linear-gradient(180deg, rgba(15,21,48,0.92), rgba(37,45,94,0.92))",
              border: `2px solid ${GOLD}`,
              boxShadow: "0 0 40px rgba(255,209,102,0.4), 0 20px 60px rgba(0,0,0,0.5)",
              textAlign: "center",
              pointerEvents: "none",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
              <PixIcon emoji="🏆" size={54} />
            </div>
            <div
              style={{
                fontSize: "clamp(20px, 3vw, 30px)",
                fontWeight: 900,
                letterSpacing: 2,
                color: GOLD,
                textShadow: "0 2px 18px rgba(255,209,102,0.5)",
              }}
            >
              GRADUATION COMPLETE!
            </div>
            <div style={{ fontSize: 15, fontWeight: 700, color: SOFT_INK, marginTop: 4 }}>
              A Cyber Hero performs their powers from memory.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Intro overlay */}
      <AnimatePresence>
        {phase === "intro" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(10, 14, 32, 0.78)",
              backdropFilter: "blur(4px)",
              padding: 24,
              // Scroll (never clip) when the intro is taller than a short
              // viewport, so the start button always stays reachable.
              overflowY: "auto",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 22 }}
              style={{
                // `auto` margins keep the card centered when it fits but stop
                // the flex-centering from clipping its top edge on overflow.
                margin: "auto",
                maxWidth: 460,
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div style={{ display: "flex", gap: 10 }}>
                <PixIcon emoji="🔑" size={40} />
                <PixIcon emoji="🎭" size={40} />
                <PixIcon emoji="🛡️" size={40} />
              </div>
              <div
                style={{
                  fontSize: "clamp(24px, 4vw, 34px)",
                  fontWeight: 900,
                  letterSpacing: 2,
                  color: GOLD,
                  textShadow: "0 2px 18px rgba(255,209,102,0.4)",
                }}
              >
                THE ENCORE OF TWENTY
              </div>
              <div style={{ fontSize: 16, fontWeight: 600, color: SOFT_INK, lineHeight: 1.5 }}>
                It is graduation night, and the whole crowd is here to see YOU.
                The stage will light up your power emblems in order. Watch
                carefully, then tap them back in the same order. Three encores
                and the stage is yours!
              </div>
              {narration && narration.lines.length > 0 && (
                <InfoNarration lines={narration.lines} accent={accent ?? "#5b76ff"} />
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleStart}
                style={{
                  marginTop: 6,
                  padding: "16px 40px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 20,
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  color: "#1a2147",
                  background: `linear-gradient(180deg, #ffe29a, ${GOLD})`,
                  boxShadow: "0 8px 30px rgba(255,209,102,0.45)",
                  fontFamily: "inherit",
                }}
              >
                TAKE THE STAGE!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Stage tile                                                         */
/* ------------------------------------------------------------------ */

function StageTile({
  index,
  tile,
  pos,
  lit,
  ghost,
  flash,
  ignited,
  clickable,
  reduce,
  onTap,
}: {
  index: number;
  tile: TileDef;
  pos: { left: string; top: string };
  lit: boolean;
  ghost: boolean;
  flash: { kind: "good" | "bad"; id: number } | null;
  ignited: boolean;
  clickable: boolean;
  reduce: boolean;
  onTap: () => void;
}) {
  const flashColor = flash ? (flash.kind === "good" ? GOOD_GREEN : BAD_RED) : null;

  const baseShadow = `0 6px 20px rgba(0,0,0,0.35), 0 0 0 2px rgba(${tile.rgb},0.35) inset`;
  const litShadow = `0 0 34px rgba(${tile.rgb},0.85), 0 0 0 3px rgba(${tile.rgb},0.9) inset`;
  const flashShadow = flashColor
    ? `0 0 30px ${flashColor}, 0 0 0 4px ${flashColor} inset`
    : null;

  const active = lit || !!flash;

  return (
    <motion.button
      type="button"
      aria-label={`${tile.label} emblem`}
      onClick={onTap}
      disabled={!clickable}
      animate={
        ignited
          ? reduce
            ? { scale: 1.06 }
            : {
                scale: [1, 1.16, 1.05],
                rotate: [0, -4, 4, 0],
                transition: {
                  delay: index * 0.12,
                  duration: 0.9,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                },
              }
          : flash && flash.kind === "bad" && !reduce
            ? { scale: 1, x: [0, -7, 7, -5, 5, 0], transition: { duration: 0.45 } }
            : { scale: lit ? 1.14 : 1, x: 0 }
      }
      whileTap={clickable ? { scale: 0.92 } : undefined}
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        transform: "translate(-50%, -50%)",
        width: "23%",
        aspectRatio: "1 / 1",
        minWidth: 64,
        borderRadius: "50%",
        border: "none",
        cursor: clickable ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        background: active
          ? `radial-gradient(circle at 50% 35%, rgba(${tile.rgb},0.55), rgba(26,33,71,0.95) 75%)`
          : "radial-gradient(circle at 50% 35%, rgba(60,70,130,0.9), rgba(20,26,56,0.95) 75%)",
        boxShadow: flashShadow ?? (lit || ignited ? litShadow : baseShadow),
        transition: "background 0.2s ease, box-shadow 0.2s ease",
        fontFamily: "inherit",
        padding: 0,
        zIndex: 2,
      }}
    >
      {/* Ghost hint ring: shows the next tile to tap after a miss */}
      {ghost && (
        <motion.span
          aria-hidden
          animate={
            reduce
              ? { opacity: 0.85, scale: 1.1 }
              : { opacity: [0.4, 0.95, 0.4], scale: [1.05, 1.22, 1.05] }
          }
          transition={reduce ? undefined : { duration: 1.1, repeat: Infinity }}
          style={{
            position: "absolute",
            inset: -6,
            borderRadius: "50%",
            border: `4px solid ${GOOD_GREEN}`,
            boxShadow: `0 0 22px rgba(52,211,153,0.7)`,
            pointerEvents: "none",
          }}
        />
      )}
      <PixIcon
        emoji={tile.emoji}
        size={44}
        style={{
          width: "44%",
          height: "44%",
          filter: active || ignited ? "none" : "saturate(0.85) brightness(0.92)",
        }}
      />
      <span
        style={{
          fontSize: "clamp(8px, 1.3vw, 11px)",
          fontWeight: 800,
          letterSpacing: 0.6,
          textTransform: "uppercase",
          color: active || ignited ? "#ffffff" : "rgba(231,236,255,0.75)",
          textShadow: active ? `0 0 8px rgba(${tile.rgb},0.9)` : "none",
          pointerEvents: "none",
        }}
      >
        {tile.label}
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Center spotlight badge                                             */
/* ------------------------------------------------------------------ */

function CenterBadge({ phase, reduce }: { phase: Phase; reduce: boolean }) {
  let emoji = "⭐";
  let label = "READY?";
  let color = GOLD;
  if (phase === "watch") {
    emoji = "👀";
    label = "WATCH...";
    color = "#7df0ff";
  } else if (phase === "echo") {
    emoji = "👆";
    label = "YOUR TURN!";
    color = GOOD_GREEN;
  } else if (phase === "miss") {
    emoji = "💪";
    label = "TRY AGAIN!";
    color = "#ffc9c9";
  } else if (phase === "landed") {
    emoji = "🎉";
    label = "NAILED IT!";
    color = GOOD_GREEN;
  } else if (phase === "celebrate") {
    emoji = "🏆";
    label = "ENCORE!";
    color = GOLD;
  }

  return (
    <motion.div
      animate={
        reduce || phase === "celebrate"
          ? { scale: 1 }
          : { scale: [1, 1.04, 1], transition: { duration: 2.2, repeat: Infinity } }
      }
      style={{
        position: "absolute",
        left: "50%",
        top: "50%",
        transform: "translate(-50%, -50%)",
        width: "30%",
        aspectRatio: "1 / 1",
        borderRadius: "50%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        background: "radial-gradient(circle at 50% 30%, rgba(37,45,94,0.95), rgba(15,21,48,0.98))",
        border: `2px solid ${color}`,
        boxShadow: `0 0 24px ${color}55`,
        zIndex: 1,
        pointerEvents: "none",
        transition: "border-color 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={label}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.2 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <PixIcon emoji={emoji} size={36} style={{ width: "clamp(26px, 5vw, 40px)", height: "clamp(26px, 5vw, 40px)" }} />
          <span
            style={{
              fontSize: "clamp(10px, 1.6vw, 14px)",
              fontWeight: 900,
              letterSpacing: 1,
              color,
              textAlign: "center",
            }}
          >
            {label}
          </span>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Visual sting when a tile performs                                  */
/* ------------------------------------------------------------------ */

function StingBurst({ pos, color }: { pos: { left: string; top: string }; color: string }) {
  const spokes = [0, 60, 120, 180, 240, 300];
  return (
    <motion.div
      initial={{ opacity: 1, scale: 0.4 }}
      animate={{ opacity: 0, scale: 1.5 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      style={{
        position: "absolute",
        left: pos.left,
        top: pos.top,
        transform: "translate(-50%, -50%)",
        width: "30%",
        aspectRatio: "1 / 1",
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      <svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden>
        {spokes.map((deg) => (
          <line
            key={deg}
            x1="50"
            y1="50"
            x2={50 + 44 * Math.cos((deg * Math.PI) / 180)}
            y2={50 + 44 * Math.sin((deg * Math.PI) / 180)}
            stroke={color}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={0.9}
          />
        ))}
        <circle cx="50" cy="50" r="10" fill="none" stroke={color} strokeWidth={3} opacity={0.8} />
      </svg>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Cheer burst when an echo lands                                     */
/* ------------------------------------------------------------------ */

function CheerBurst() {
  const items = ["🎉", "⭐", "✨", "🎉", "⭐"] as const;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 4,
      }}
    >
      {items.map((emoji, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 30, scale: 0.5 }}
          animate={{ opacity: [0, 1, 1, 0], y: -90 - i * 14, scale: 1 }}
          transition={{ duration: 1.4, delay: i * 0.12, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: `${18 + i * 16}%`,
            bottom: "8%",
          }}
        >
          <PixIcon emoji={emoji} size={30} />
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Crowd of characters                                                */
/* ------------------------------------------------------------------ */

function CrowdRow({
  level,
  reduce,
  landed,
}: {
  level: number;
  reduce: boolean;
  landed: boolean;
}) {
  const amp = reduce ? 0 : [2, 5, 9, 14][Math.max(0, Math.min(3, level))];
  const speed = [1.6, 1.1, 0.8, 0.55][Math.max(0, Math.min(3, level))];
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        minHeight: 74,
      }}
    >
      <div style={{ display: "flex", gap: "clamp(6px, 1.6vw, 16px)", alignItems: "flex-end" }}>
        {CROWD.map((emoji, i) => (
          <motion.div
            key={i}
            animate={
              amp === 0
                ? { y: 0 }
                : {
                    y: [0, -amp, 0],
                    transition: {
                      duration: speed,
                      repeat: Infinity,
                      delay: i * 0.09,
                      ease: "easeInOut",
                    },
                  }
            }
          >
            <PixIcon emoji={emoji} size={34} />
          </motion.div>
        ))}
      </div>
      <motion.div
        key={level}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 1,
          color: landed ? GOOD_GREEN : "rgba(231,236,255,0.7)",
        }}
      >
        {CROWD_LABELS[Math.max(0, Math.min(3, level))]}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Finale: fireworks                                                  */
/* ------------------------------------------------------------------ */

interface FireworkSpec {
  left: number;
  top: number;
  color: string;
  delay: number;
  size: number;
}

function Fireworks({ reduce }: { reduce: boolean }) {
  const bursts = useMemo<FireworkSpec[]>(() => {
    const colors = TILES.map((t) => t.color);
    return Array.from({ length: reduce ? 4 : 9 }, (_, i) => ({
      left: 8 + Math.random() * 84,
      top: 5 + Math.random() * 55,
      color: colors[i % colors.length],
      delay: 0.15 + Math.random() * 2.2,
      size: 70 + Math.random() * 70,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 5 }}>
      {bursts.map((b, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.15 }}
          animate={{ opacity: [0, 1, 0], scale: [0.15, 1, 1.25] }}
          transition={{ duration: 1.1, delay: b.delay, ease: "easeOut" }}
          style={{
            position: "absolute",
            left: `${b.left}%`,
            top: `${b.top}%`,
            width: b.size,
            height: b.size,
            transform: "translate(-50%, -50%)",
          }}
        >
          <svg viewBox="0 0 100 100" width="100%" height="100%">
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <line
                key={deg}
                x1={50 + 12 * Math.cos((deg * Math.PI) / 180)}
                y1={50 + 12 * Math.sin((deg * Math.PI) / 180)}
                x2={50 + 46 * Math.cos((deg * Math.PI) / 180)}
                y2={50 + 46 * Math.sin((deg * Math.PI) / 180)}
                stroke={b.color}
                strokeWidth={3}
                strokeLinecap="round"
              />
            ))}
            <circle cx="50" cy="50" r="6" fill={b.color} />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Finale: graduation cap toss (inline SVG mortarboard)               */
/* ------------------------------------------------------------------ */

function CapToss({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={{ y: 40, opacity: 0, rotate: 0 }}
      animate={
        reduce
          ? { y: -120, opacity: [0, 1, 1], rotate: 0 }
          : { y: [40, -190, -40], opacity: [0, 1, 1], rotate: [0, 380, 720] }
      }
      transition={{ duration: 1.6, delay: 0.4, ease: "easeOut" }}
      style={{
        position: "absolute",
        left: "50%",
        bottom: "6%",
        marginLeft: -34,
        width: 68,
        height: 52,
        pointerEvents: "none",
        zIndex: 6,
      }}
    >
      <svg viewBox="0 0 100 76" width="100%" height="100%">
        {/* mortarboard top */}
        <polygon points="50,4 98,26 50,48 2,26" fill="#1f2547" stroke={GOLD} strokeWidth={3} />
        {/* cap base */}
        <path d="M30 38 L30 56 Q50 68 70 56 L70 38" fill="#2b3260" stroke={GOLD} strokeWidth={2.5} />
        {/* button + tassel */}
        <circle cx="50" cy="26" r="4" fill={GOLD} />
        <path d="M50 26 Q72 34 74 58" fill="none" stroke={GOLD} strokeWidth={3} strokeLinecap="round" />
        <circle cx="74" cy="62" r="5" fill={GOLD} />
      </svg>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Finale: badge shower over the whole frame                          */
/* ------------------------------------------------------------------ */

interface BadgeDrop {
  emoji: string;
  left: number;
  delay: number;
  duration: number;
  size: number;
  drift: number;
  spin: number;
}

function BadgeShower({ reduce }: { reduce: boolean }) {
  const drops = useMemo<BadgeDrop[]>(() => {
    const pool = ["🏅", "⭐", "🏆", "🎉", "✨", "👑", "💎"];
    return Array.from({ length: reduce ? 6 : 16 }, (_, i) => ({
      emoji: pool[i % pool.length],
      left: 4 + Math.random() * 90,
      delay: 0.3 + Math.random() * 1.8,
      duration: 2.2 + Math.random() * 1.4,
      size: 26 + Math.random() * 18,
      drift: (Math.random() - 0.5) * 70,
      spin: (Math.random() - 0.5) * 260,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 20,
      }}
    >
      {drops.map((d, i) => (
        <motion.div
          key={i}
          initial={{ y: -60, x: 0, opacity: 0, rotate: 0 }}
          animate={{
            y: 1000,
            x: d.drift,
            opacity: [0, 1, 1, 0.8],
            rotate: d.spin,
          }}
          transition={{ duration: d.duration, delay: d.delay, ease: "easeIn" }}
          style={{ position: "absolute", left: `${d.left}%`, top: 0 }}
        >
          <PixIcon emoji={d.emoji} size={d.size} />
        </motion.div>
      ))}
    </div>
  );
}
