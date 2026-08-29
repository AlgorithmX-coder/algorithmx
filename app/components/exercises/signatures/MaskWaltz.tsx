"use client";

/**
 * MaskWaltz - Week 3 (Stranger Danger) signature exercise.
 *
 * A masquerade street dance. The child first meets their REAL friend Layla
 * unmasked: red scarf, friendly wave. Then masks go on and three identical
 * masked dancers waltz and SLOWLY swap places across a 3-slot stage. When
 * the music stops, the child taps the dancer they tracked. Correct = the
 * mask lifts on Layla, green confetti. Wrong = the mask lifts on raccoon
 * fur, a soft red flash, and the SAME round replays SLOWER (forgiveness by
 * de-escalation, never speed up, never fail out). The final dance adds one
 * flashy distractor who jumps and shouts "I'M your friend! Pick ME!" to
 * teach that loud-and-flashy is the fake's act. Win = 3 successful tracks.
 *
 * Self-contained by design: all copy lives here, deps are react +
 * framer-motion + ExerciseFrame + PixIcon + inline SVG/CSS only.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";

/* ------------------------------------------------------------------ */
/* Tuning + content                                                   */
/* ------------------------------------------------------------------ */

const FRIEND = 0; // dancer index of the real friend
const FLASHY = 99; // sentinel for the shouting distractor

const WATCH_MS = 2400; // friend shown unmasked at her slot
const MASK_MS = 1200; // mask slides on
const BASE_SWAP_MS = 1500; // one slow crossing at normal speed
const GAP_MS = 340; // beat between crossings
const SLOW_STEP = 1.3; // each miss slows the replay by this factor
const SLOW_CAP = 2.1;

const ROUNDS = [
  { swaps: 3, distractor: false },
  { swaps: 4, distractor: false },
  { swaps: 5, distractor: true },
] as const;

const SLOTS_PLAIN = [18, 50, 82]; // stage x positions (%) for the 3 dancers
const SLOTS_WITH_GUEST = [13, 39, 65]; // squeezed left when the shouter shows up
const DISTRACTOR_X = 89;

const GREEN = "#34d399";
const RED = "#ff5d5d";
const CYAN = "#7df0ff";

const TEACH_NORMAL = {
  title: "A raccoon in disguise!",
  body: "That is okay! The swaps are tricky. Watch the replay, it will be slower this time.",
  tip: "Lock your eyes on Layla and never let go, even when dancers cross.",
};

const TEACH_FLASHY = {
  title: "The loud one fooled you!",
  body: "Shouting 'Pick me!' is a trickster move. A real friend never has to beg to be picked.",
  tip: "Ignore loud and flashy. Trust your own eyes, not their words.",
};

const LIGHTS: Array<[number, number]> = [
  [80, 20],
  [160, 27],
  [240, 31],
  [320, 34],
  [400, 35],
  [480, 34],
  [560, 31],
  [640, 27],
  [720, 20],
];
const LIGHT_COLORS = ["#ffd166", CYAN, "#ff9ecb"];

const NOTES = [
  { left: 22, top: 74, size: 22, delay: 0, glyph: "♪" },
  { left: 50, top: 58, size: 26, delay: 0.6, glyph: "♫" },
  { left: 78, top: 78, size: 20, delay: 1.1, glyph: "♪" },
];

const CONFETTI_COLORS = ["#34d399", "#6ee7b7", "#a7f3d0", "#10b981", "#fde68a", CYAN];

const PAIRS: Array<[number, number]> = [
  [0, 1],
  [0, 2],
  [1, 2],
];

type Phase =
  | "meet"
  | "watch"
  | "masking"
  | "dancing"
  | "pick"
  | "correct"
  | "wrong"
  | "celebrate";

type Face = "friend" | "raccoon";

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function MaskWaltz({ onComplete }: { onComplete: () => void }) {
  const reduce = !!useReducedMotion();

  const [phase, setPhase] = useState<Phase>("meet");
  const [round, setRound] = useState(0);
  const [wins, setWins] = useState(0);
  const [slots, setSlots] = useState<number[]>([0, 1, 2]); // dancer -> slot
  const [zLift, setZLift] = useState<number[]>([1, 1, 1]);
  const [slowMult, setSlowMult] = useState(1);
  const [picked, setPicked] = useState<number | null>(null);
  const [teach, setTeach] = useState<{ title: string; body: string; tip: string } | null>(
    null,
  );

  const slotsRef = useRef<number[]>([0, 1, 2]);
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  };
  useEffect(() => clearTimers, []);

  const cfg = ROUNDS[Math.min(round, ROUNDS.length - 1)];
  const slotX = cfg.distractor ? SLOTS_WITH_GUEST : SLOTS_PLAIN;
  const swapSec = (BASE_SWAP_MS * slowMult) / 1000;
  const moveDur = phase === "dancing" ? swapSec : 0.85;

  /* ---------------- round flow ---------------- */

  const startRound = (r: number, mult: number) => {
    clearTimers();
    const perm = shuffledTrio();
    slotsRef.current = perm;
    setSlots(perm);
    setZLift([1, 1, 1]);
    setPicked(null);
    setTeach(null);
    setRound(r);
    setSlowMult(mult);
    setPhase("watch");
    later(() => setPhase("masking"), WATCH_MS);
    later(() => beginDance(r, mult), WATCH_MS + MASK_MS);
  };

  const beginDance = (r: number, mult: number) => {
    setPhase("dancing");
    const dance = ROUNDS[Math.min(r, ROUNDS.length - 1)];
    const step = BASE_SWAP_MS * mult + GAP_MS * mult;
    let lastPair = -1;
    for (let i = 0; i < dance.swaps; i++) {
      later(() => {
        let pi = Math.floor(Math.random() * PAIRS.length);
        if (pi === lastPair) pi = (pi + 1) % PAIRS.length;
        lastPair = pi;
        const [da, db] = PAIRS[pi];
        const next = slotsRef.current.slice();
        const tmp = next[da];
        next[da] = next[db];
        next[db] = tmp;
        slotsRef.current = next;
        setSlots(next);
        // The dancer gliding rightward passes in front for a readable crossing.
        const z = [1, 1, 1];
        z[next[da] > next[db] ? da : db] = 3;
        z[next[da] > next[db] ? db : da] = 2;
        setZLift(z);
      }, i * step + 250);
    }
    later(() => setPhase("pick"), dance.swaps * step + 500);
  };

  const handlePick = (dancer: number) => {
    if (phase !== "pick" || completedRef.current) return;
    setPicked(dancer);
    if (dancer === FRIEND) {
      setWins((w) => w + 1);
      setPhase("correct");
      if (round + 1 >= ROUNDS.length) {
        later(() => setPhase("celebrate"), 2100);
        later(() => {
          if (!completedRef.current) {
            completedRef.current = true;
            onComplete();
          }
        }, 5000);
      } else {
        later(() => startRound(round + 1, 1), 2600);
      }
    } else {
      setTeach(dancer === FLASHY ? TEACH_FLASHY : TEACH_NORMAL);
      setPhase("wrong");
      later(() => startRound(round, Math.min(slowMult * SLOW_STEP, SLOW_CAP)), 4200);
    }
  };

  /* ---------------- copy ---------------- */

  const banner = ((): { icon?: string; text: string } => {
    switch (phase) {
      case "meet":
        return { icon: "\u{1F4AC}", text: "Meet your friend before the masks go on!" };
      case "watch":
        return { icon: "\u{1F440}", text: "There she is! Red scarf, friendly wave. Lock your eyes on Layla..." };
      case "masking":
        return { icon: "\u{1F3AD}", text: "Masks on! Keep watching her spot!" };
      case "dancing":
        return { icon: "\u{1F3AD}", text: "The dancers waltz and swap places. Don't lose her!" };
      case "pick":
        return { icon: "\u{1F446}", text: "The music stopped! Tap the dancer you tracked as Layla." };
      case "correct":
        return { icon: "✅", text: "That's Layla! You tracked her the whole time!" };
      case "wrong":
        return { icon: "\u{1F99D}", text: "Oh no, a raccoon! Let's watch again, nice and slow." };
      case "celebrate":
        return { icon: "\u{1F389}", text: "Waltz Master! You found your real friend every time!" };
    }
  })();

  const bobbing =
    !reduce && (phase === "watch" || phase === "masking" || phase === "dancing");

  /* ---------------- render ---------------- */

  return (
    <ExerciseFrame padding={24}>
      <div style={{ display: "flex", flexDirection: "column", gap: 14, minHeight: 500 }}>
        {/* header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PixIcon emoji={"\u{1F3AD}"} size={34} />
            <div>
              <div style={{ fontSize: 20, fontWeight: 900 }}>The Mask Waltz</div>
              <div style={{ fontSize: 12.5, color: "rgba(231,236,255,0.65)" }}>
                Track your REAL friend through the dance
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 4 }}>
              {[0, 1, 2].map((i) => (
                <PixIcon
                  key={i}
                  emoji={"⭐"}
                  size={26}
                  style={
                    i < wins
                      ? undefined
                      : { filter: "grayscale(1) brightness(0.6)", opacity: 0.5 }
                  }
                />
              ))}
            </div>
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(231,236,255,0.75)",
                background: "rgba(125,240,255,0.08)",
                border: "1px solid rgba(125,240,255,0.18)",
                padding: "4px 10px",
                borderRadius: 999,
                whiteSpace: "nowrap",
              }}
            >
              Dance {Math.min(round + 1, 3)} of 3
            </div>
          </div>
        </div>

        {/* stage */}
        <div
          style={{
            position: "relative",
            flex: 1,
            minHeight: 380,
            borderRadius: 20,
            overflow: "hidden",
            background: "rgba(9,10,30,0.35)",
            border: "1px solid rgba(125,240,255,0.12)",
          }}
        >
          {/* lantern string */}
          <svg
            aria-hidden
            viewBox="0 0 800 60"
            preserveAspectRatio="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: 56,
              pointerEvents: "none",
              opacity: 0.9,
            }}
          >
            <path d="M0 12 Q 400 58 800 12" stroke="rgba(125,240,255,0.28)" strokeWidth={2} fill="none" />
            {LIGHTS.map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y + 6} r={7} fill={LIGHT_COLORS[i % 3]} opacity={0.18} />
                <circle cx={x} cy={y + 6} r={3.2} fill={LIGHT_COLORS[i % 3]} />
              </g>
            ))}
          </svg>

          {/* street floor */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 86,
              background:
                "linear-gradient(180deg, rgba(125,240,255,0.05), rgba(12,10,40,0.55))",
              borderTop: "1px solid rgba(125,240,255,0.10)",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 34px, transparent 34px 68px)",
              }}
            />
          </div>

          {phase === "meet" ? (
            /* ------- meet the friend, unmasked ------- */
            <div
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                padding: 16,
                textAlign: "center",
              }}
            >
              <Bubble>
                Hi! It's me, Layla! See my red scarf and my wave? When my mask goes on,
                keep your eyes on me the whole dance!
              </Bubble>
              <Dancer face="friend" open waving={!reduce} scale={1.05} />
              <motion.button
                onClick={() => startRound(0, 1)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  marginTop: 2,
                  border: "none",
                  cursor: "pointer",
                  padding: "13px 30px",
                  borderRadius: 999,
                  fontSize: 17,
                  fontWeight: 900,
                  color: "#0f1530",
                  background: `linear-gradient(135deg, ${CYAN}, ${GREEN})`,
                  boxShadow: "0 10px 26px rgba(52,211,153,0.35)",
                  fontFamily: "inherit",
                }}
              >
                Start the Mask Waltz
              </motion.button>
              <div style={{ fontSize: 12.5, color: "rgba(231,236,255,0.6)" }}>
                3 dances. Track her every time!
              </div>
            </div>
          ) : (
            <>
              {/* slot spotlights */}
              {slotX.map((x) => (
                <div
                  key={x}
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: `${x}%`,
                    bottom: 8,
                    transform: "translateX(-50%)",
                    width: 150,
                    height: 40,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(ellipse, rgba(125,240,255,0.12), transparent 70%)",
                    pointerEvents: "none",
                  }}
                />
              ))}

              {/* the three swapping dancers */}
              {[0, 1, 2].map((i) => {
                const isFriend = i === FRIEND;
                const revealed =
                  picked === i && (phase === "correct" || phase === "wrong");
                const openNow = revealed || (isFriend && phase === "watch");
                const canPick = phase === "pick";
                return (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{ left: `${slotX[slots[i]]}%` }}
                    transition={{ duration: moveDur, ease: "easeInOut" }}
                    role="button"
                    tabIndex={canPick ? 0 : -1}
                    aria-label={`Masked dancer ${i + 1}`}
                    onClick={() => handlePick(i)}
                    onKeyDown={(e) => {
                      if (canPick && (e.key === "Enter" || e.key === " ")) handlePick(i);
                    }}
                    whileHover={canPick ? { scale: 1.06 } : undefined}
                    whileTap={canPick ? { scale: 0.96 } : undefined}
                    style={{
                      position: "absolute",
                      bottom: 26,
                      x: "-50%",
                      zIndex: revealed ? 6 : zLift[i],
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: 6,
                      cursor: canPick ? "pointer" : "default",
                    }}
                  >
                    <div style={{ position: "relative" }}>
                      {revealed && (
                        <motion.div
                          initial={{ scale: 0.6, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          style={{
                            position: "absolute",
                            inset: -10,
                            borderRadius: 26,
                            border: `4px solid ${isFriend ? GREEN : RED}`,
                            boxShadow: `0 0 28px ${
                              isFriend ? "rgba(52,211,153,0.6)" : "rgba(255,93,93,0.55)"
                            }`,
                            pointerEvents: "none",
                          }}
                        />
                      )}
                      <motion.div
                        animate={
                          bobbing
                            ? { y: [0, -7, 0], rotate: [0, -2.4, 2.4, 0] }
                            : { y: 0, rotate: 0 }
                        }
                        transition={
                          bobbing
                            ? {
                                repeat: Infinity,
                                duration: 1.7,
                                ease: "easeInOut",
                                delay: i * 0.25,
                              }
                            : { duration: 0.4 }
                        }
                      >
                        <Dancer
                          face={isFriend ? "friend" : "raccoon"}
                          open={openNow}
                          waving={
                            isFriend &&
                            !reduce &&
                            (phase === "watch" || phase === "correct")
                          }
                        />
                      </motion.div>
                      {phase === "correct" && revealed && !reduce && (
                        <div style={{ position: "absolute", left: "50%", top: 0 }}>
                          <ConfettiBurst />
                        </div>
                      )}
                      {canPick && (
                        <motion.div
                          aria-hidden
                          animate={
                            reduce
                              ? { opacity: 0.7 }
                              : { scale: [1, 1.12, 1], opacity: [0.55, 1, 0.55] }
                          }
                          transition={
                            reduce ? undefined : { repeat: Infinity, duration: 1.2 }
                          }
                          style={{
                            position: "absolute",
                            left: "50%",
                            bottom: -10,
                            x: "-50%",
                            width: 96,
                            height: 20,
                            borderRadius: "50%",
                            border: "3px dashed rgba(125,240,255,0.55)",
                          }}
                        />
                      )}
                    </div>
                    {revealed && (
                      <NamePill
                        ok={isFriend}
                        text={isFriend ? "Layla!" : "Hacker Raccoon!"}
                      />
                    )}
                  </motion.div>
                );
              })}

              {/* the flashy shouting distractor (final dance only) */}
              {cfg.distractor && (
                <FlashyDancer
                  phase={phase}
                  revealed={picked === FLASHY && phase === "wrong"}
                  onPick={() => handlePick(FLASHY)}
                  reduce={reduce}
                />
              )}

              {/* floating music notes while the waltz plays */}
              {phase === "dancing" &&
                !reduce &&
                NOTES.map((n, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 0 }}
                    animate={{ opacity: [0, 0.9, 0], y: -34 }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.9,
                      delay: n.delay,
                      ease: "easeOut",
                    }}
                    style={{
                      position: "absolute",
                      left: `${n.left}%`,
                      top: n.top,
                      fontSize: n.size,
                      color: "rgba(125,240,255,0.9)",
                      pointerEvents: "none",
                    }}
                  >
                    {n.glyph}
                  </motion.div>
                ))}

              {/* soft red flash on a wrong pick */}
              <AnimatePresence>
                {phase === "wrong" && (
                  <motion.div
                    key="flash"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.3, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1, times: [0, 0.25, 1] }}
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 25,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(ellipse at 50% 60%, rgba(255,93,93,0.5), rgba(255,93,93,0) 70%)",
                    }}
                  />
                )}
              </AnimatePresence>

              {/* forgiving teach card */}
              <AnimatePresence>
                {phase === "wrong" && teach && (
                  <motion.div
                    key="teach"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 12,
                      x: "-50%",
                      zIndex: 30,
                      width: "min(460px, 92%)",
                      background: "rgba(20,16,52,0.94)",
                      border: `2px solid ${RED}`,
                      borderRadius: 16,
                      padding: "12px 16px",
                      display: "flex",
                      gap: 12,
                      alignItems: "center",
                      boxShadow: "0 14px 34px rgba(0,0,0,0.45)",
                    }}
                  >
                    <PixIcon emoji={"\u{1F99D}"} size={44} />
                    <div>
                      <div style={{ fontWeight: 900, fontSize: 15.5, color: "#ffb4b4" }}>
                        {teach.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13.5,
                          color: "rgba(231,236,255,0.9)",
                          marginTop: 2,
                        }}
                      >
                        {teach.body}
                      </div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: CYAN,
                          marginTop: 4,
                          fontWeight: 700,
                        }}
                      >
                        {teach.tip}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* win celebration */}
          <AnimatePresence>
            {phase === "celebrate" && (
              <motion.div
                key="celebrate"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  zIndex: 50,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 12,
                  background: "rgba(10,10,30,0.75)",
                  backdropFilter: "blur(4px)",
                  textAlign: "center",
                  padding: 24,
                }}
              >
                <motion.div
                  initial={{ scale: 0.4 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                >
                  <PixIcon emoji={"\u{1F389}"} size={92} />
                </motion.div>
                <div style={{ fontSize: 30, fontWeight: 900, color: GREEN }}>
                  Waltz Master!
                </div>
                <div
                  style={{
                    maxWidth: 460,
                    fontSize: 16,
                    color: "rgba(231,236,255,0.9)",
                    lineHeight: 1.5,
                  }}
                >
                  Three perfect tracks! Real friends never shout "Pick me!" You know
                  them because you watch closely, even when the masks go on.
                </div>
                {!reduce && (
                  <>
                    <div style={{ position: "absolute", left: "25%", top: 60 }}>
                      <ConfettiBurst count={16} />
                    </div>
                    <div style={{ position: "absolute", left: "50%", top: 40 }}>
                      <ConfettiBurst count={20} />
                    </div>
                    <div style={{ position: "absolute", left: "75%", top: 60 }}>
                      <ConfettiBurst count={16} />
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* status banner */}
        <div
          style={{
            minHeight: 44,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <motion.div
            key={`${phase}-${teach ? teach.title : ""}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 16.5,
              fontWeight: 800,
              textAlign: "center",
            }}
          >
            {banner.icon && <PixIcon emoji={banner.icon} size={26} />}
            <span>{banner.text}</span>
          </motion.div>
        </div>
      </div>
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                             */
/* ------------------------------------------------------------------ */

/** Random permutation of the three dancers across the three slots. */
function shuffledTrio(): number[] {
  const a = [0, 1, 2];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

function Bubble({ children, accent = "#ffffff" }: { children: ReactNode; accent?: string }) {
  return (
    <div
      style={{
        position: "relative",
        background: accent,
        color: "#1f2547",
        borderRadius: 14,
        padding: "10px 16px",
        fontWeight: 700,
        fontSize: 14.5,
        maxWidth: 340,
        textAlign: "center",
        boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
        zIndex: 2,
      }}
    >
      {children}
      <div
        style={{
          position: "absolute",
          bottom: -6,
          left: "50%",
          width: 14,
          height: 14,
          background: accent,
          transform: "translateX(-50%) rotate(45deg)",
        }}
      />
    </div>
  );
}

function NamePill({ ok, text }: { ok: boolean; text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      style={{
        background: ok ? "rgba(52,211,153,0.16)" : "rgba(255,93,93,0.16)",
        border: `2px solid ${ok ? GREEN : RED}`,
        color: ok ? GREEN : RED,
        fontWeight: 800,
        fontSize: 14,
        padding: "4px 12px",
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </motion.div>
  );
}

const SPARKLE_SPOTS: CSSProperties[] = [
  { left: -14, top: 10 },
  { right: -12, top: 34 },
  { left: -6, top: 74 },
];

function FlashyDancer({
  phase,
  revealed,
  onPick,
  reduce,
}: {
  phase: Phase;
  revealed: boolean;
  onPick: () => void;
  reduce: boolean;
}) {
  const canPick = phase === "pick";
  const still = reduce || revealed;
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      role="button"
      tabIndex={canPick ? 0 : -1}
      aria-label="Flashy shouting dancer"
      onClick={() => {
        if (canPick) onPick();
      }}
      onKeyDown={(e) => {
        if (canPick && (e.key === "Enter" || e.key === " ")) onPick();
      }}
      whileHover={canPick ? { scale: 1.05 } : undefined}
      whileTap={canPick ? { scale: 0.96 } : undefined}
      style={{
        position: "absolute",
        left: `${DISTRACTOR_X}%`,
        bottom: 26,
        x: "-50%",
        zIndex: revealed ? 6 : 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        cursor: canPick ? "pointer" : "default",
      }}
    >
      <motion.div
        animate={still ? { scale: 1 } : { scale: [1, 1.1, 1] }}
        transition={still ? { duration: 0.4 } : { repeat: Infinity, duration: 1.1 }}
      >
        <Bubble accent="#fff6bf">
          {revealed ? "Hee hee! Tricked ya!" : "I'M your friend! Pick ME!"}
        </Bubble>
      </motion.div>
      <motion.div
        animate={still ? { y: 0, rotate: 0 } : { y: [0, -18, 0], rotate: [0, -3, 3, 0] }}
        transition={
          still ? { duration: 0.4 } : { repeat: Infinity, duration: 0.95, ease: "easeInOut" }
        }
        style={{ position: "relative" }}
      >
        {!still &&
          SPARKLE_SPOTS.map((pos, i) => (
            <motion.span
              key={i}
              aria-hidden
              animate={{ scale: [0.6, 1.15, 0.6], opacity: [0.4, 1, 0.4] }}
              transition={{ repeat: Infinity, duration: 1.3, delay: i * 0.35 }}
              style={{
                position: "absolute",
                fontSize: 18,
                color: "#fff6bf",
                pointerEvents: "none",
                ...pos,
              }}
            >
              {"✦"}
            </motion.span>
          ))}
        <Dancer face="raccoon" open={revealed} flashy />
      </motion.div>
      {revealed && <NamePill ok={false} text="Hacker Raccoon!" />}
    </motion.div>
  );
}

/**
 * One dancer, drawn entirely in inline SVG. `face` is what hides under the
 * hood; `open` lifts the hood + mask off (or never puts it on). The scarf
 * only shows while the friend is unmasked, so the three masked dancers stay
 * perfectly identical during the waltz.
 */
function Dancer({
  face,
  open,
  flashy = false,
  waving = false,
  scale = 1,
}: {
  face: Face;
  open: boolean;
  flashy?: boolean;
  waving?: boolean;
  scale?: number;
}) {
  const c = flashy
    ? { gown: "#f7b32b", deep: "#c77c14", hood: "#d84fd1", mask: "#fff17a", plume: "#ffffff" }
    : { gown: "#6d6af0", deep: "#4f49c9", hood: "#443dc2", mask: "#ffd166", plume: CYAN };
  const W = 116 * scale;
  const H = 172 * scale;
  return (
    <div style={{ position: "relative", width: W, height: H }}>
      <svg width={W} height={H} viewBox="0 0 120 172" style={{ display: "block" }}>
        {/* ground shadow */}
        <ellipse cx={60} cy={158} rx={36} ry={6} fill="rgba(0,0,0,0.28)" />
        {/* waltz gown */}
        <path
          d="M60 80 C 44 96 30 120 26 152 L 94 152 C 90 120 76 96 60 80 Z"
          fill={c.gown}
        />
        <path
          d="M60 84 C 52 102 46 126 44 148"
          stroke="rgba(255,255,255,0.28)"
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
        />
        {/* feet */}
        <ellipse cx={48} cy={155} rx={5.5} ry={3.4} fill="#241f52" />
        <ellipse cx={72} cy={155} rx={5.5} ry={3.4} fill="#241f52" />
        {/* torso */}
        <ellipse cx={60} cy={72} rx={15} ry={15} fill={c.gown} />
        {/* arms in dance hold */}
        <path
          d="M48 68 C 34 64 24 54 22 42"
          stroke={c.deep}
          strokeWidth={7}
          fill="none"
          strokeLinecap="round"
        />
        <circle cx={22} cy={42} r={4.6} fill={c.deep} />
        {!waving && (
          <>
            <path
              d="M72 68 C 86 64 96 54 98 42"
              stroke={c.deep}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
            />
            <circle cx={98} cy={42} r={4.6} fill={c.deep} />
          </>
        )}

        {/* the face hiding under the hood */}
        {face === "friend" ? (
          <g>
            <circle cx={60} cy={36} r={19} fill="#ffd9b3" />
            <path
              d="M41 38 Q 40 15 60 14 Q 80 15 79 38 Q 74 24 60 24 Q 46 24 41 38 Z"
              fill="#7c4a21"
            />
            <circle cx={83} cy={26} r={6} fill="#7c4a21" />
            <circle cx={53} cy={36} r={2.6} fill="#232946" />
            <circle cx={67} cy={36} r={2.6} fill="#232946" />
            <path
              d="M53 43 Q 60 50 67 43"
              stroke="#a5541f"
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
            />
            <circle cx={48} cy={42} r={3.2} fill="#fb9aa2" opacity={0.8} />
            <circle cx={72} cy={42} r={3.2} fill="#fb9aa2" opacity={0.8} />
            {/* the red scarf: only out when unmasked, so masked dancers match */}
            <g style={{ opacity: open ? 1 : 0, transition: "opacity 0.5s ease" }}>
              <rect x={46} y={54} width={28} height={9} rx={4.5} fill="#ef4444" />
              <path d="M62 60 L 71 82 Q 63 84 57 79 Z" fill="#dc2626" />
            </g>
          </g>
        ) : (
          <g>
            <path d="M42 20 L 51 31 L 34 31 Z" fill="#6b7280" />
            <path d="M78 20 L 86 31 L 69 31 Z" fill="#6b7280" />
            <path d="M43.5 23 L 49 30 L 38.5 30 Z" fill="#374151" />
            <path d="M76.5 23 L 81.5 30 L 71 30 Z" fill="#374151" />
            <circle cx={60} cy={36} r={19} fill="#9ca3af" />
            <ellipse cx={52} cy={34} rx={7.5} ry={5.5} fill="#1f2937" />
            <ellipse cx={68} cy={34} rx={7.5} ry={5.5} fill="#1f2937" />
            <circle cx={52} cy={34} r={2.8} fill="#ffffff" />
            <circle cx={68} cy={34} r={2.8} fill="#ffffff" />
            <circle cx={52.8} cy={34.4} r={1.4} fill="#111827" />
            <circle cx={68.8} cy={34.4} r={1.4} fill="#111827" />
            <ellipse cx={60} cy={45} rx={8} ry={6} fill="#e5e7eb" />
            <circle cx={60} cy={42.5} r={2.6} fill="#111827" />
            <path
              d="M55 48 Q 60 51.5 65 48"
              stroke="#4b5563"
              strokeWidth={2}
              fill="none"
              strokeLinecap="round"
            />
          </g>
        )}

        {/* hood + venetian mask, lifts straight up when open */}
        <motion.g
          initial={false}
          animate={{ y: open ? -60 : 0, opacity: open ? 0 : 1 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        >
          <path d="M32 44 A 28 28 0 1 1 88 44 L 88 56 Q 60 68 32 56 Z" fill={c.hood} />
          <ellipse cx={60} cy={38} rx={17} ry={16} fill="#16123a" />
          <path
            d="M43 32 Q 60 25 77 32 Q 78 43 60 45 Q 42 43 43 32 Z"
            fill={c.mask}
            stroke="rgba(0,0,0,0.25)"
            strokeWidth={1.5}
          />
          <ellipse cx={52.5} cy={35} rx={4} ry={2.8} fill="#16123a" />
          <ellipse cx={67.5} cy={35} rx={4} ry={2.8} fill="#16123a" />
          <path d="M60 17 Q 66 5 75 7 Q 68 12 66 19 Z" fill={c.plume} opacity={0.9} />
          {flashy && (
            <>
              <circle cx={44} cy={26} r={2} fill="#ffffff" opacity={0.9} />
              <circle cx={76} cy={24} r={2} fill="#ffffff" opacity={0.9} />
            </>
          )}
        </motion.g>
      </svg>

      {/* waving hand, an HTML overlay so the rotate origin is dead simple */}
      {waving && (
        <motion.div
          aria-hidden
          animate={{ rotate: [0, 16, -5, 16, 0] }}
          transition={{ repeat: Infinity, duration: 1.9, ease: "easeInOut" }}
          style={{
            position: "absolute",
            right: "-8%",
            top: "20%",
            width: "34%",
            transformOrigin: "18% 88%",
          }}
        >
          <svg viewBox="0 0 40 50" width="100%" style={{ display: "block" }}>
            <path
              d="M8 44 C 12 32 18 20 26 12"
              stroke={c.deep}
              strokeWidth={7}
              fill="none"
              strokeLinecap="round"
            />
            <circle cx={28} cy={10} r={6.5} fill="#ffd9b3" />
          </svg>
        </motion.div>
      )}
    </div>
  );
}

/** A little burst of green-and-gold confetti, anchored at its parent. */
function ConfettiBurst({ count = 20, spread = 240 }: { count?: number; spread?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        dx: (Math.random() - 0.5) * spread,
        rise: 40 + Math.random() * 110,
        fall: 180 + Math.random() * 160,
        rot: (Math.random() - 0.5) * 540,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        dur: 1.2 + Math.random() * 0.8,
        delay: Math.random() * 0.25,
        w: 7 + Math.random() * 7,
        h: 9 + Math.random() * 8,
        round: Math.random() > 0.5,
      })),
    [count, spread],
  );
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        pointerEvents: "none",
        zIndex: 40,
      }}
    >
      {pieces.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{
            x: p.dx,
            y: [0, -p.rise, p.fall],
            opacity: [1, 1, 0],
            rotate: p.rot,
          }}
          transition={{ duration: p.dur, delay: p.delay, ease: "easeOut", times: [0, 0.3, 1] }}
          style={{
            position: "absolute",
            width: p.w,
            height: p.h,
            borderRadius: p.round ? "50%" : 2,
            background: p.color,
          }}
        />
      ))}
    </div>
  );
}
