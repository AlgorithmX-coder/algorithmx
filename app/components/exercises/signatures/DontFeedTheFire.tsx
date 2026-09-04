"use client";

/**
 * DontFeedTheFire — Week 5 (Cyberbullying) signature exercise.
 *
 * A cozy campfire scene. Mean-message "sparks" land beside the fire one at
 * a time, each with a big jiggling red REPLY button begging to be tapped.
 * The hero move is RESTRAINT: press and HOLD the cool blue river stone and
 * the spark visibly starves (shrinks + dims over ~2.2s) and fizzles to ash.
 * Releasing early lets it re-inflate a little, never fully reset, so the
 * drill is forgiving. Tapping REPLY flares the flame and teaches ("your
 * reply is firewood") with no score loss. The final beat INVERTS the verb:
 * a friend is being picked on, and the right move is to TAP the green
 * STAND UP button. Win = 3 sparks starved + 1 friend supported.
 *
 * Self-contained by design: all copy lives here, deps are react +
 * framer-motion + ExerciseFrame + PixIcon + inline SVG only.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import {
  motion,
  AnimatePresence,
  useAnimationControls,
  useReducedMotion,
} from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

const SPARKS = [
  {
    id: "spark-1",
    from: "grumbler_77",
    text: "You're the WORST at this game!",
  },
  {
    id: "spark-2",
    from: "anon_kid",
    text: "Nobody wants you on this team.",
  },
  {
    id: "spark-3",
    from: "mega_meanie",
    text: "That was SO silly. Just log off!",
  },
] as const;

const FRIEND_ROUND = {
  id: "friend-1",
  from: "loud_larry",
  text: "Look at Maya's drawing. It's SO bad! Everyone laugh at her!",
} as const;

const TEACH_SPARK = {
  title: "Whoa! That's firewood!",
  body: "Your reply is firewood. It makes the fire bigger. A hero starves it.",
  tip: "Press and HOLD the blue river stone instead. No firewood, no fire.",
};

const TEACH_FRIEND = {
  title: "Mean words back are still firewood!",
  body: "Firing back at the bully feeds the fire, even for a friend.",
  tip: "Stand up the kind way. Tap the green STAND UP button.",
};

const TEACH_STONE_ON_FRIEND = {
  title: "This spark isn't aimed at you!",
  body: "Maya needs you. Staying quiet leaves a friend all alone.",
  tip: "Tap the green STAND UP button to help her and tell a grown-up.",
};

/* Timing (ms) */
const HOLD_MS = 2200; // full hold to starve a spark
const DECAY_MS = 2600; // re-inflate speed after releasing early
const REINFLATE = 0.16; // how much progress a release can give back, max

/* Palette */
const EMBER = "#ff9d4d";
const EMBER_DEEP = "#ff7a2e";
const STONE_BLUE = "#7dd3fc";
const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";

type Phase = "intro" | "play" | "friend" | "celebrate";
type SparkState = "burning" | "ash";

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function DontFeedTheFire({
  onComplete,
  narration,
  accent,
}: {
  onComplete: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const reduce = !!useReducedMotion();
  const audio = useGameAudio();

  const [phase, setPhase] = useState<Phase>("intro");
  const [sparkIdx, setSparkIdx] = useState(0);
  const [sparkState, setSparkState] = useState<SparkState>("burning");
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [teach, setTeach] = useState<null | {
    title: string;
    body: string;
    tip: string;
  }>(null);
  const [stood, setStood] = useState(false);
  const [starvedCount, setStarvedCount] = useState(0);

  const holdingRef = useRef(false);
  const teachOpenRef = useRef(false);
  const progressRef = useRef(0);
  const floorRef = useRef(0); // decay never drops below this
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const flameControls = useAnimationControls();
  const sceneControls = useAnimationControls();

  teachOpenRef.current = teach !== null;

  /* ---------------- hold-to-starve loop ---------------- */

  useEffect(() => {
    if (phase !== "play" || sparkState !== "burning") return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      let p = progressRef.current;
      if (holdingRef.current && !teachOpenRef.current) {
        p = Math.min(1, p + dt / HOLD_MS);
        // A release may re-inflate the spark a little, but never past this floor.
        floorRef.current = Math.max(floorRef.current, Math.max(0, p - REINFLATE));
      } else if (p > floorRef.current) {
        p = Math.max(floorRef.current, p - dt / DECAY_MS);
      }
      if (p !== progressRef.current) {
        progressRef.current = p;
        setProgress(p);
      }
      if (p >= 1) {
        // Spark starved: fizzle to ash, then bring on the next beat.
        holdingRef.current = false;
        setHolding(false);
        audio.correct();
        setSparkState("ash");
        setStarvedCount((n) => n + 1);
        later(() => {
          progressRef.current = 0;
          floorRef.current = 0;
          setProgress(0);
          if (sparkIdx >= SPARKS.length - 1) {
            setPhase("friend");
          } else {
            setSparkIdx((i) => i + 1);
            setSparkState("burning");
          }
        }, 1350);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, sparkState, sparkIdx]);

  /* ---------------- interactions ---------------- */

  const startHold = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== "play" || sparkState !== "burning" || teach) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is best-effort */
    }
    audio.tap();
    holdingRef.current = true;
    setHolding(true);
  };

  const endHold = () => {
    holdingRef.current = false;
    setHolding(false);
  };

  const flareAndTeach = (lesson: typeof TEACH_SPARK) => {
    endHold();
    if (!reduce) {
      flameControls.start({
        scale: [1, 1.32, 1.08, 1],
        transition: { duration: 0.7, times: [0, 0.25, 0.65, 1] },
      });
      sceneControls.start({
        x: [0, -7, 7, -4, 4, 0],
        transition: { duration: 0.45 },
      });
    }
    later(() => setTeach(lesson), reduce ? 60 : 430);
  };

  const tapReply = () => {
    if (teach) return;
    audio.wrong();
    flareAndTeach(phase === "friend" ? TEACH_FRIEND : TEACH_SPARK);
  };

  const tapStoneOnFriend = () => {
    if (teach) return;
    audio.wrong();
    setTeach(TEACH_STONE_ON_FRIEND);
  };

  const tapStandUp = () => {
    if (stood || teach) return;
    audio.correct();
    setStood(true);
    later(() => {
      audio.unlock();
      setPhase("celebrate");
    }, reduce ? 900 : 2000);
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  /* ---------------- derived ---------------- */

  const calm = stood || phase === "celebrate";
  const spark = SPARKS[Math.min(sparkIdx, SPARKS.length - 1)];
  const flameSettle = 1 - starvedCount * 0.07; // fire calms as sparks starve

  return (
    <ExerciseFrame maxWidth={780} padding={24}>
      <motion.div
        animate={sceneControls}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* ---------- header ---------- */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 12,
              fontWeight: 900,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "#ffc38a",
            }}
          >
            Don&apos;t Feed the Fire
          </div>
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "#cfd6f6",
              marginTop: 4,
            }}
          >
            {phase === "friend"
              ? stood
                ? "You stood up for Maya!"
                : "A friend needs you. This one is different!"
              : "Mean messages are sparks. Don't give them firewood."}
          </div>
          <ProgressChips
            starved={starvedCount}
            current={phase === "play" ? sparkIdx : -1}
            friendActive={phase === "friend" || phase === "celebrate"}
            friendDone={stood}
          />
        </div>

        {/* ---------- scene ---------- */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 26,
            minHeight: 230,
          }}
        >
          <Campfire
            calm={calm}
            settle={flameSettle}
            reduce={reduce}
            flameControls={flameControls}
          />

          <div style={{ width: 300, maxWidth: "100%" }}>
            <AnimatePresence mode="wait">
              {phase === "play" && sparkState === "burning" && (
                <SparkCard
                  key={spark.id}
                  from={spark.from}
                  text={spark.text}
                  progress={progress}
                  holding={holding}
                  reduce={reduce}
                />
              )}
              {phase === "play" && sparkState === "ash" && (
                <AshPuff key={`${spark.id}-ash`} reduce={reduce} />
              )}
              {(phase === "friend" || phase === "celebrate") && (
                <FriendScene
                  key="friend"
                  stood={stood}
                  reduce={reduce}
                />
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ---------- controls ---------- */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            gap: 30,
            minHeight: 150,
          }}
        >
          {(phase === "play" || (phase === "friend" && !stood)) && (
            <ReplyButton onTap={tapReply} reduce={reduce} />
          )}

          {phase === "play" && (
            <RiverStone
              progress={progress}
              holding={holding}
              disabled={sparkState !== "burning"}
              onDown={startHold}
              onUp={endHold}
            />
          )}

          {phase === "friend" && !stood && (
            <>
              <StandUpButton onTap={tapStandUp} reduce={reduce} />
              <SmallStone onTap={tapStoneOnFriend} />
            </>
          )}
        </div>

        {/* ---------- caption ---------- */}
        <div
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 800,
            color: "#9fb1d8",
            minHeight: 18,
          }}
        >
          {phase === "play" &&
            sparkState === "burning" &&
            (holding
              ? "Keep holding... the spark is starving!"
              : "Press and HOLD the river stone. Starve the spark.")}
          {phase === "play" && sparkState === "ash" && "The spark fizzled out. No firewood, no fire!"}
          {phase === "friend" && !stood && "Maya is being picked on. What does a hero do?"}
          {phase === "friend" && stood && "Kind words + telling a grown-up. That's hero strength!"}
        </div>
      </motion.div>

      {/* ---------- overlays ---------- */}
      {phase === "intro" && (
        <IntroOverlay
          onStart={() => setPhase("play")}
          reduce={reduce}
          narration={narration}
          accent={accent}
        />
      )}

      <AnimatePresence>
        {teach && (
          <TeachOverlay
            key="teach"
            title={teach.title}
            body={teach.body}
            tip={teach.tip}
            onClose={() => setTeach(null)}
            reduce={reduce}
          />
        )}
      </AnimatePresence>

      {phase === "celebrate" && <WinOverlay onContinue={finish} reduce={reduce} />}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Header progress chips: 3 spark slots + 1 friend heart              */
/* ------------------------------------------------------------------ */

function ProgressChips({
  starved,
  current,
  friendActive,
  friendDone,
}: {
  starved: number;
  current: number;
  friendActive: boolean;
  friendDone: boolean;
}) {
  const chip = (active: boolean, done: boolean, key: string, kind: "flame" | "heart") => (
    <span
      key={key}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: 34,
        height: 34,
        borderRadius: 12,
        background: done
          ? kind === "heart"
            ? "rgba(52,211,153,0.2)"
            : "rgba(255,255,255,0.08)"
          : active
          ? kind === "heart"
            ? "rgba(52,211,153,0.16)"
            : "rgba(255,157,77,0.18)"
          : "rgba(255,255,255,0.05)",
        border: `2px solid ${
          done
            ? kind === "heart"
              ? GOOD_GREEN
              : "rgba(255,255,255,0.3)"
            : active
            ? kind === "heart"
              ? GOOD_GREEN
              : EMBER
            : "rgba(255,255,255,0.14)"
        }`,
        boxShadow: active
          ? `0 0 14px ${kind === "heart" ? "rgba(52,211,153,0.5)" : "rgba(255,157,77,0.5)"}`
          : undefined,
        opacity: active || done ? 1 : 0.55,
      }}
    >
      {kind === "flame" ? (
        done ? (
          <CheckIcon size={16} color="#a7f3d0" />
        ) : (
          <FlameGlyph size={18} dim={!active} />
        )
      ) : done ? (
        <CheckIcon size={16} color="#a7f3d0" />
      ) : (
        <HeartGlyph size={16} active={active} />
      )}
    </span>
  );

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 8,
        marginTop: 10,
      }}
    >
      {SPARKS.map((s, i) => chip(i === current, i < starved, s.id, "flame"))}
      {chip(friendActive && !friendDone, friendDone, "friend-chip", "heart")}
    </div>
  );
}

function FlameGlyph({ size, dim }: { size: number; dim?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 2 C15 7 19 10 19 15 A7 7 0 0 1 5 15 C5 10 9 7 12 2 Z"
        fill={dim ? "rgba(255,157,77,0.4)" : EMBER}
      />
      <path
        d="M12 9 C13.6 11.5 15.5 13 15.5 15.6 A3.5 3.5 0 0 1 8.5 15.6 C8.5 13 10.4 11.5 12 9 Z"
        fill={dim ? "rgba(255,226,122,0.4)" : "#ffe27a"}
      />
    </svg>
  );
}

function HeartGlyph({ size, active }: { size: number; active?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 21 C7 16.5 3 13.4 3 9.2 A4.6 4.6 0 0 1 12 7.6 A4.6 4.6 0 0 1 21 9.2 C21 13.4 17 16.5 12 21 Z"
        fill={active ? GOOD_GREEN : "rgba(52,211,153,0.45)"}
      />
    </svg>
  );
}

function CheckIcon({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M4 12.5 L9.5 18 L20 6.5"
        fill="none"
        stroke={color}
        strokeWidth={3.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Campfire (inline SVG, warm flicker, green when calm)               */
/* ------------------------------------------------------------------ */

function Campfire({
  calm,
  settle,
  reduce,
  flameControls,
}: {
  calm: boolean;
  settle: number;
  reduce: boolean;
  flameControls: ReturnType<typeof useAnimationControls>;
}) {
  const flicker = (dur: number, amt: number) =>
    reduce
      ? {}
      : {
          animate: {
            scaleY: [1, 1 + amt, 1 - amt * 0.6, 1 + amt * 0.5, 1],
            scaleX: [1, 1 - amt * 0.5, 1 + amt * 0.4, 1, 1],
          },
          transition: { repeat: Infinity, duration: dur, ease: "easeInOut" as const },
        };

  const originBottom: CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "50% 100%",
  };

  return (
    <div style={{ position: "relative", width: 230, height: 220 }}>
      {/* warm ground glow */}
      <motion.div
        animate={
          reduce
            ? { opacity: calm ? 0.85 : 0.7 }
            : { opacity: calm ? [0.8, 0.95, 0.8] : [0.55, 0.8, 0.55] }
        }
        transition={reduce ? undefined : { repeat: Infinity, duration: 2.6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          left: "50%",
          bottom: 0,
          transform: "translateX(-50%)",
          width: 260,
          height: 170,
          borderRadius: "50%",
          background: calm
            ? "radial-gradient(ellipse at 50% 80%, rgba(52,211,153,0.4) 0%, transparent 68%)"
            : "radial-gradient(ellipse at 50% 80%, rgba(255,157,77,0.42) 0%, transparent 68%)",
          filter: "blur(10px)",
          transition: "background 900ms ease",
          pointerEvents: "none",
        }}
      />

      {/* rising ember dots */}
      {!reduce &&
        [0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [-4, -78], opacity: [0, 1, 0], x: [0, i % 2 === 0 ? 10 : -12] }}
            transition={{
              repeat: Infinity,
              duration: 2.4 + i * 0.5,
              delay: i * 0.7,
              ease: "easeOut",
            }}
            style={{
              position: "absolute",
              left: `${44 + i * 6}%`,
              bottom: 120,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: calm ? "#7dffb0" : "#ffcf7a",
              transition: "background 900ms ease",
              pointerEvents: "none",
            }}
          />
        ))}

      <svg viewBox="0 0 200 200" width="100%" height="100%" aria-hidden>
        {/* base scale settles as sparks starve; inner group takes the flare */}
        <motion.g animate={{ scale: settle }} style={originBottom}>
          <motion.g animate={flameControls} style={originBottom}>
            {/* warm flames */}
            <motion.g
              animate={{ opacity: calm ? 0 : 1 }}
              transition={{ duration: 0.9 }}
              style={originBottom}
            >
              <motion.path
                d="M100 34 C126 72 148 98 148 128 C148 158 127 176 100 176 C73 176 52 158 52 128 C52 98 74 72 100 34 Z"
                fill={EMBER_DEEP}
                style={originBottom}
                {...flicker(2.1, 0.05)}
              />
              <motion.path
                d="M100 66 C118 92 132 108 132 130 C132 152 118 165 100 165 C82 165 68 152 68 130 C68 108 82 92 100 66 Z"
                fill="#ffb13d"
                style={originBottom}
                {...flicker(1.7, 0.07)}
              />
              <motion.path
                d="M100 96 C110 112 118 122 118 136 C118 150 110 158 100 158 C90 158 82 150 82 136 C82 122 90 112 100 96 Z"
                fill="#ffe27a"
                style={originBottom}
                {...flicker(1.3, 0.09)}
              />
            </motion.g>
            {/* calm green flames (crossfade in on the win beat) */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: calm ? 1 : 0 }}
              transition={{ duration: 0.9 }}
              style={originBottom}
            >
              <motion.path
                d="M100 34 C126 72 148 98 148 128 C148 158 127 176 100 176 C73 176 52 158 52 128 C52 98 74 72 100 34 Z"
                fill="#2fbf7f"
                style={originBottom}
                {...flicker(2.3, 0.04)}
              />
              <motion.path
                d="M100 66 C118 92 132 108 132 130 C132 152 118 165 100 165 C82 165 68 152 68 130 C68 108 82 92 100 66 Z"
                fill="#7dffb0"
                style={originBottom}
                {...flicker(1.9, 0.05)}
              />
              <motion.path
                d="M100 96 C110 112 118 122 118 136 C118 150 110 158 100 158 C90 158 82 150 82 136 C82 122 90 112 100 96 Z"
                fill="#d9ffe8"
                style={originBottom}
                {...flicker(1.5, 0.06)}
              />
            </motion.g>
          </motion.g>
        </motion.g>

        {/* logs */}
        <g>
          <rect
            x={38}
            y={158}
            width={124}
            height={17}
            rx={8.5}
            fill="#7a4a21"
            transform="rotate(-9 100 166)"
          />
          <rect
            x={38}
            y={158}
            width={124}
            height={17}
            rx={8.5}
            fill="#8f5827"
            transform="rotate(9 100 166)"
          />
          <rect
            x={30}
            y={170}
            width={140}
            height={15}
            rx={7.5}
            fill="#6b3f1c"
          />
        </g>
        {/* ring of stones */}
        {[22, 52, 148, 178].map((x, i) => (
          <ellipse
            key={i}
            cx={x}
            cy={188}
            rx={13}
            ry={8}
            fill={i % 2 === 0 ? "#5b6478" : "#6d7790"}
          />
        ))}
        <ellipse cx={86} cy={193} rx={14} ry={7} fill="#525b6e" />
        <ellipse cx={118} cy={193} rx={13} ry={7} fill="#67718a" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Spark card: the mean message that starves while the stone is held  */
/* ------------------------------------------------------------------ */

function SparkCard({
  from,
  text,
  progress,
  holding,
  reduce,
}: {
  from: string;
  text: string;
  progress: number;
  holding: boolean;
  reduce: boolean;
}) {
  const shrink = 1 - progress * 0.42;
  const fade = 1 - progress * 0.58;

  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { x: 70, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.25 } }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      <div
        style={{
          transform: `scale(${shrink})`,
          opacity: fade,
          filter: `saturate(${1 - progress * 0.75})`,
          transformOrigin: "50% 50%",
          transition: "transform 90ms linear, opacity 90ms linear",
        }}
      >
        <div
          style={{
            position: "relative",
            padding: "14px 16px 16px",
            borderRadius: 18,
            border: `2.5px solid rgba(255,125,60,${0.75 * fade + 0.2})`,
            background:
              "linear-gradient(180deg, rgba(90,36,10,0.92) 0%, rgba(46,18,8,0.95) 100%)",
            boxShadow: holding
              ? "0 0 18px -4px rgba(255,157,77,0.4)"
              : "0 0 30px -6px rgba(255,120,50,0.75)",
            color: "#ffe9d6",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 8,
            }}
          >
            <PixIcon emoji="💬" size={22} />
            <span
              style={{
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: "0.06em",
                color: "#ffb98a",
              }}
            >
              {from}
            </span>
            <motion.span
              animate={
                reduce || holding
                  ? { scale: 1 }
                  : { scale: [1, 1.18, 1], rotate: [0, -6, 6, 0] }
              }
              transition={
                reduce || holding
                  ? undefined
                  : { repeat: Infinity, duration: 1.1, ease: "easeInOut" }
              }
              style={{ marginLeft: "auto", display: "inline-flex" }}
            >
              <FlameGlyph size={22 - progress * 8} />
            </motion.span>
          </div>
          <div style={{ fontSize: 16.5, fontWeight: 800, lineHeight: 1.4 }}>
            {text}
          </div>
        </div>
      </div>

      {/* starving status under the card */}
      <div
        style={{
          textAlign: "center",
          marginTop: 10,
          fontSize: 12.5,
          fontWeight: 900,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: holding ? STONE_BLUE : "rgba(255,185,138,0.75)",
          minHeight: 16,
        }}
      >
        {progress > 0.03
          ? holding
            ? "Starving the spark..."
            : "It's coming back a little! Hold again!"
          : "A mean spark landed!"}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Ash puff shown after a spark starves                               */
/* ------------------------------------------------------------------ */

function AshPuff({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 240, damping: 18 }}
      style={{ textAlign: "center" }}
    >
      <svg viewBox="0 0 120 80" width={140} aria-hidden style={{ display: "block", margin: "0 auto" }}>
        {[
          { cx: 46, cy: 52, r: 16, o: 0.8 },
          { cx: 66, cy: 44, r: 13, o: 0.65 },
          { cx: 80, cy: 56, r: 11, o: 0.55 },
          { cx: 56, cy: 62, r: 12, o: 0.7 },
        ].map((c, i) => (
          <motion.circle
            key={i}
            cx={c.cx}
            cy={c.cy}
            r={c.r}
            fill={`rgba(148,163,184,${c.o})`}
            animate={reduce ? undefined : { cy: [c.cy, c.cy - 6, c.cy] }}
            transition={
              reduce
                ? undefined
                : { repeat: Infinity, duration: 2 + i * 0.3, ease: "easeInOut" }
            }
          />
        ))}
      </svg>
      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          color: "#a7f3d0",
          marginTop: 4,
        }}
      >
        Fzzz... spark starved!
      </div>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: "#9fb1d8", marginTop: 4 }}>
        No reply, no firewood, no fire.
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Friend beat: Maya is picked on; STAND UP is the hero move          */
/* ------------------------------------------------------------------ */

function FriendScene({ stood, reduce }: { stood: boolean; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { x: 70, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ type: "spring", stiffness: 240, damping: 20 }}
      style={{ display: "flex", flexDirection: "column", gap: 12 }}
    >
      {/* the bully's message */}
      <div
        style={{
          padding: "12px 14px",
          borderRadius: 16,
          border: "2.5px solid rgba(255,93,93,0.65)",
          background:
            "linear-gradient(180deg, rgba(84,18,26,0.92) 0%, rgba(44,10,16,0.95) 100%)",
          color: "#ffdede",
          opacity: stood ? 0.45 : 1,
          transition: "opacity 700ms ease",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 6,
          }}
        >
          <PixIcon emoji="💬" size={20} />
          <span style={{ fontSize: 12, fontWeight: 900, color: "#ff9d9d" }}>
            {FRIEND_ROUND.from}
          </span>
        </div>
        <div style={{ fontSize: 15.5, fontWeight: 800, lineHeight: 1.4 }}>
          {FRIEND_ROUND.text}
        </div>
      </div>

      {/* Maya */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "10px 12px",
          borderRadius: 16,
          border: `2.5px solid ${stood ? GOOD_GREEN : "rgba(255,255,255,0.18)"}`,
          background: stood
            ? "rgba(52,211,153,0.14)"
            : "rgba(255,255,255,0.05)",
          boxShadow: stood ? "0 0 28px -6px rgba(52,211,153,0.8)" : undefined,
          transition: "all 700ms ease",
        }}
      >
        <motion.div
          animate={
            stood && !reduce
              ? { scale: [1, 1.14, 1], rotate: [0, -4, 4, 0] }
              : { scale: 1 }
          }
          transition={{ duration: 0.7 }}
          style={{ display: "inline-flex", flexShrink: 0 }}
        >
          <FriendFace beaming={stood} />
        </motion.div>
        <div>
          <div
            style={{
              fontSize: 13,
              fontWeight: 900,
              color: stood ? "#a7f3d0" : "#cfd6f6",
            }}
          >
            Maya
          </div>
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "#9fb1d8" }}>
            {stood ? "is beaming. You've got her back!" : "feels very small right now..."}
          </div>
        </div>
      </div>

      {/* your supportive message slots in */}
      <AnimatePresence>
        {stood && (
          <motion.div
            initial={reduce ? { opacity: 0 } : { y: 22, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 280, damping: 20 }}
            style={{
              alignSelf: "flex-end",
              maxWidth: 270,
              padding: "10px 14px",
              borderRadius: "16px 4px 16px 16px",
              background: "rgba(52,211,153,0.18)",
              border: `2px solid ${GOOD_GREEN}`,
              boxShadow: "0 0 24px -4px rgba(52,211,153,0.6)",
              color: "#c9ffd9",
              fontSize: 14.5,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            Maya's drawing is awesome! Be kind. I'm telling a grown-up too.
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function FriendFace({ beaming }: { beaming: boolean }) {
  return (
    <svg viewBox="0 0 80 80" width={58} height={58} aria-hidden>
      <circle cx={40} cy={42} r={30} fill="#ffd9a8" />
      {/* hair */}
      <path
        d="M12 40 C12 18 26 8 40 8 C54 8 68 18 68 40 C68 30 58 24 40 24 C22 24 12 30 12 40 Z"
        fill="#5b3a1e"
      />
      {/* eyes */}
      {beaming ? (
        <>
          <path d="M27 40 Q31 35 35 40" fill="none" stroke="#3a2a16" strokeWidth={3} strokeLinecap="round" />
          <path d="M45 40 Q49 35 53 40" fill="none" stroke="#3a2a16" strokeWidth={3} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={31} cy={40} r={3.2} fill="#3a2a16" />
          <circle cx={49} cy={40} r={3.2} fill="#3a2a16" />
          {/* a little tear */}
          <circle cx={31} cy={49} r={2.1} fill="#7dd3fc" />
        </>
      )}
      {/* mouth */}
      {beaming ? (
        <path
          d="M28 50 Q40 62 52 50"
          fill="none"
          stroke="#3a2a16"
          strokeWidth={3.4}
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M30 57 Q40 50 50 57"
          fill="none"
          stroke="#3a2a16"
          strokeWidth={3.2}
          strokeLinecap="round"
        />
      )}
      {/* blush */}
      <circle cx={24} cy={48} r={4} fill="rgba(255,138,120,0.45)" />
      <circle cx={56} cy={48} r={4} fill="rgba(255,138,120,0.45)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Buttons                                                            */
/* ------------------------------------------------------------------ */

function ReplyButton({ onTap, reduce }: { onTap: () => void; reduce: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onTap}
      aria-label="Reply to the mean message"
      animate={reduce ? undefined : { rotate: [-2.5, 2.5, -2.5], scale: [1, 1.06, 1] }}
      transition={reduce ? undefined : { repeat: Infinity, duration: 0.85, ease: "easeInOut" }}
      whileTap={{ scale: 0.93 }}
      style={{
        minWidth: 156,
        minHeight: 68,
        padding: "14px 26px",
        borderRadius: 18,
        border: "3px solid #ff8a8a",
        background: `linear-gradient(180deg, ${BAD_RED} 0%, #d63031 100%)`,
        color: "#fff",
        fontSize: 21,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 12px 30px -10px rgba(255,93,93,0.9), 0 0 22px rgba(255,93,93,0.35)",
        touchAction: "manipulation",
      }}
    >
      REPLY!
      <span
        style={{
          display: "block",
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.12em",
          opacity: 0.85,
        }}
      >
        SAY IT BACK!
      </span>
    </motion.button>
  );
}

function RiverStone({
  progress,
  holding,
  disabled,
  onDown,
  onUp,
}: {
  progress: number;
  holding: boolean;
  disabled: boolean;
  onDown: (e: ReactPointerEvent<HTMLButtonElement>) => void;
  onUp: () => void;
}) {
  const R = 62;
  const C = 2 * Math.PI * R;
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto" }}>
        {/* progress ring */}
        <svg
          width={140}
          height={140}
          viewBox="0 0 140 140"
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            transform: "rotate(-90deg)",
            pointerEvents: "none",
          }}
        >
          <circle
            cx={70}
            cy={70}
            r={R}
            fill="none"
            stroke="rgba(125,211,252,0.2)"
            strokeWidth={9}
          />
          <circle
            cx={70}
            cy={70}
            r={R}
            fill="none"
            stroke={STONE_BLUE}
            strokeWidth={9}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            style={{ transition: "stroke-dashoffset 80ms linear" }}
          />
        </svg>

        {/* the stone */}
        <motion.button
          type="button"
          aria-label="Hold the river stone to starve the spark"
          onPointerDown={onDown}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          onLostPointerCapture={onUp}
          onContextMenu={(e) => e.preventDefault()}
          disabled={disabled}
          animate={{ scale: holding ? 0.94 : 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: 106,
            height: 106,
            borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%",
            border: `3px solid ${holding ? STONE_BLUE : "rgba(125,211,252,0.55)"}`,
            background:
              "radial-gradient(circle at 34% 28%, #b6e3fa 0%, #5f8fb4 45%, #34506e 100%)",
            color: "#eaf6ff",
            fontSize: 17,
            fontWeight: 900,
            letterSpacing: "0.08em",
            cursor: disabled ? "default" : "pointer",
            fontFamily: "inherit",
            boxShadow: holding
              ? `0 0 34px rgba(125,211,252,${0.35 + progress * 0.45}), 0 10px 24px -10px rgba(0,0,0,0.6)`
              : "0 10px 24px -10px rgba(0,0,0,0.6), 0 0 16px rgba(125,211,252,0.25)",
            touchAction: "none",
            userSelect: "none",
            WebkitUserSelect: "none",
            WebkitTouchCallout: "none",
            opacity: disabled ? 0.5 : 1,
          }}
        >
          HOLD
          <span
            style={{
              display: "block",
              fontSize: 10.5,
              fontWeight: 800,
              letterSpacing: "0.1em",
              opacity: 0.85,
            }}
          >
            RIVER STONE
          </span>
        </motion.button>
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 11.5,
          fontWeight: 900,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: STONE_BLUE,
        }}
      >
        Stay cool
      </div>
    </div>
  );
}

/** The stone in the friend round: pressing it teaches gently. */
function SmallStone({ onTap }: { onTap: () => void }) {
  return (
    <motion.button
      type="button"
      aria-label="Hold the river stone"
      onPointerDown={onTap}
      onContextMenu={(e) => e.preventDefault()}
      whileTap={{ scale: 0.94 }}
      style={{
        width: 86,
        height: 86,
        borderRadius: "48% 52% 50% 50% / 52% 48% 52% 48%",
        border: "3px solid rgba(125,211,252,0.4)",
        background:
          "radial-gradient(circle at 34% 28%, #9cc9e4 0%, #52799c 45%, #2d445e 100%)",
        color: "#d9eefc",
        fontSize: 13,
        fontWeight: 900,
        letterSpacing: "0.08em",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 8px 20px -10px rgba(0,0,0,0.6)",
        touchAction: "none",
        userSelect: "none",
        WebkitUserSelect: "none",
        opacity: 0.85,
      }}
    >
      HOLD
    </motion.button>
  );
}

function StandUpButton({ onTap, reduce }: { onTap: () => void; reduce: boolean }) {
  return (
    <motion.button
      type="button"
      onClick={onTap}
      aria-label="Stand up for your friend"
      initial={reduce ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
      animate={
        reduce
          ? { opacity: 1 }
          : { scale: [1, 1.06, 1], opacity: 1 }
      }
      transition={
        reduce
          ? { duration: 0.2 }
          : { scale: { repeat: Infinity, duration: 1.4, ease: "easeInOut" }, opacity: { duration: 0.3 } }
      }
      whileTap={{ scale: 0.93 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        minWidth: 190,
        minHeight: 74,
        padding: "14px 26px",
        borderRadius: 20,
        border: "3px solid #7dffb0",
        background: `linear-gradient(180deg, ${GOOD_GREEN} 0%, #0e9f6e 100%)`,
        color: "#053b2a",
        fontSize: 20,
        fontWeight: 900,
        letterSpacing: "0.05em",
        cursor: "pointer",
        fontFamily: "inherit",
        boxShadow: "0 14px 34px -10px rgba(52,211,153,0.95), 0 0 26px rgba(52,211,153,0.4)",
        touchAction: "manipulation",
      }}
    >
      <PixIcon emoji="💪" size={34} />
      <span style={{ textAlign: "left" }}>
        STAND UP
        <span
          style={{
            display: "block",
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: "0.1em",
          }}
        >
          HELP MAYA + TELL A GROWN-UP
        </span>
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Overlays                                                           */
/* ------------------------------------------------------------------ */

const overlayBase: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "rgba(10, 8, 6, 0.78)",
  backdropFilter: "blur(4px)",
  WebkitBackdropFilter: "blur(4px)",
};

function IntroOverlay({
  onStart,
  reduce,
  narration,
  accent,
}: {
  onStart: () => void;
  reduce: boolean;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={overlayBase}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        style={{
          maxWidth: 440,
          textAlign: "center",
          padding: "28px 26px",
          borderRadius: 24,
          border: "2px solid rgba(255,157,77,0.5)",
          background: "linear-gradient(180deg, rgba(56,28,12,0.96) 0%, rgba(30,16,8,0.98) 100%)",
          boxShadow: "0 30px 70px -20px rgba(0,0,0,0.8)",
          // The spoken-instruction block makes the card taller; on short
          // viewports the card scrolls internally so the start button is
          // always reachable (never clipped by the centered overlay).
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
          <FlameGlyph size={54} />
        </div>
        <div
          style={{
            fontSize: 26,
            fontWeight: 900,
            color: "#ffd9ad",
            marginBottom: 12,
          }}
        >
          Don&apos;t Feed the Fire
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 700,
            lineHeight: 1.55,
            color: "#e8d8c6",
            marginBottom: 6,
          }}
        >
          Mean messages are sparks. A reply is firewood, it makes the fire bigger.
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 800,
            lineHeight: 1.55,
            color: "#bfe8ff",
            marginBottom: 20,
          }}
        >
          Press and HOLD the cool river stone to starve each spark until it fizzles out.
        </div>
        {narration && narration.lines.length > 0 && (
          <div style={{ textAlign: "left" }}>
            <InfoNarration lines={narration.lines} accent={accent ?? "#ff8e6e"} />
          </div>
        )}
        <motion.button
          type="button"
          onClick={onStart}
          whileTap={{ scale: 0.95 }}
          whileHover={reduce ? undefined : { scale: 1.04 }}
          style={{
            minWidth: 180,
            minHeight: 58,
            padding: "14px 32px",
            borderRadius: 16,
            border: "3px solid #ffd158",
            background: "linear-gradient(180deg, #ffb347 0%, #f08c1a 100%)",
            color: "#3a2408",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "0.05em",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 12px 30px -10px rgba(255,179,71,0.9)",
            touchAction: "manipulation",
          }}
        >
          I&apos;m ready!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function TeachOverlay({
  title,
  body,
  tip,
  onClose,
  reduce,
}: {
  title: string;
  body: string;
  tip: string;
  onClose: () => void;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={overlayBase}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: 28, opacity: 0, scale: 0.94 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={reduce ? { opacity: 0 } : { y: 16, opacity: 0, scale: 0.96 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{
          maxWidth: 420,
          textAlign: "center",
          padding: "24px 24px 26px",
          borderRadius: 22,
          border: "2.5px solid rgba(255,125,60,0.65)",
          background: "linear-gradient(180deg, rgba(66,26,10,0.97) 0%, rgba(34,14,8,0.98) 100%)",
          boxShadow: "0 30px 70px -20px rgba(0,0,0,0.85), 0 0 40px -10px rgba(255,120,50,0.5)",
          // Scrolls internally on short viewports so the "Got it!" button
          // is always reachable (same pattern as the intro card).
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        {/* firewood illustration */}
        <svg viewBox="0 0 120 44" width={110} aria-hidden style={{ display: "block", margin: "0 auto 8px" }}>
          <rect x={12} y={16} width={96} height={13} rx={6.5} fill="#8f5827" transform="rotate(-7 60 22)" />
          <rect x={12} y={16} width={96} height={13} rx={6.5} fill="#7a4a21" transform="rotate(7 60 22)" />
          <circle cx={60} cy={9} r={6} fill={EMBER} />
          <circle cx={46} cy={13} r={4} fill="#ffe27a" />
          <circle cx={74} cy={12} r={4} fill={EMBER_DEEP} />
        </svg>
        <div style={{ fontSize: 21, fontWeight: 900, color: "#ffc9a1", marginBottom: 10 }}>
          {title}
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 700,
            lineHeight: 1.55,
            color: "#f3e2d2",
            marginBottom: 8,
          }}
        >
          {body}
        </div>
        <div
          style={{
            fontSize: 14.5,
            fontWeight: 800,
            lineHeight: 1.5,
            color: "#bfe8ff",
            marginBottom: 18,
          }}
        >
          {tip}
        </div>
        <motion.button
          type="button"
          onClick={onClose}
          whileTap={{ scale: 0.95 }}
          style={{
            minWidth: 150,
            minHeight: 54,
            padding: "12px 30px",
            borderRadius: 15,
            border: `3px solid ${GOOD_GREEN}`,
            background: "rgba(52,211,153,0.16)",
            color: "#a7f3d0",
            fontSize: 17,
            fontWeight: 900,
            letterSpacing: "0.05em",
            cursor: "pointer",
            fontFamily: "inherit",
            touchAction: "manipulation",
          }}
        >
          Got it!
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function WinOverlay({ onContinue, reduce }: { onContinue: () => void; reduce: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0 : 0.15 }}
      style={{
        ...overlayBase,
        background: "rgba(6, 20, 14, 0.82)",
      }}
    >
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: 30, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 230, damping: 20 }}
        style={{
          maxWidth: 440,
          textAlign: "center",
          padding: "28px 26px",
          borderRadius: 24,
          border: `2.5px solid ${GOOD_GREEN}`,
          background: "linear-gradient(180deg, rgba(10,46,32,0.97) 0%, rgba(6,26,18,0.98) 100%)",
          boxShadow: "0 30px 70px -20px rgba(0,0,0,0.85), 0 0 50px -8px rgba(52,211,153,0.55)",
          // Scrolls internally on short viewports so the Continue button
          // is always reachable (same pattern as the intro card).
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 12 }}>
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={reduce ? { opacity: 0 } : { scale: 0, rotate: -30 }}
              animate={reduce ? { opacity: 1 } : { scale: 1, rotate: 0 }}
              transition={
                reduce
                  ? { delay: 0.1 * i }
                  : { delay: 0.25 + 0.18 * i, type: "spring", stiffness: 300, damping: 14 }
              }
              style={{ display: "inline-flex" }}
            >
              <PixIcon emoji="⭐" size={44} />
            </motion.span>
          ))}
        </div>
        <div style={{ fontSize: 25, fontWeight: 900, color: "#a7f3d0", marginBottom: 12 }}>
          You starved the fire!
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 800,
            lineHeight: 1.7,
            color: "#d3f5e6",
            marginBottom: 6,
          }}
        >
          3 mean sparks fizzled to ash.
          <br />
          1 friend feels brave again.
        </div>
        <div
          style={{
            fontSize: 14.5,
            fontWeight: 700,
            lineHeight: 1.55,
            color: "#9ad9bd",
            marginBottom: 20,
          }}
        >
          Mean sparks die when you don&apos;t feed them. And when a friend is picked on, heroes stand up and tell a grown-up.
        </div>
        <motion.button
          type="button"
          onClick={onContinue}
          whileTap={{ scale: 0.95 }}
          whileHover={reduce ? undefined : { scale: 1.04 }}
          style={{
            minWidth: 190,
            minHeight: 58,
            padding: "14px 34px",
            borderRadius: 16,
            border: "3px solid #7dffb0",
            background: `linear-gradient(180deg, ${GOOD_GREEN} 0%, #0e9f6e 100%)`,
            color: "#053b2a",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "0.05em",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 12px 30px -10px rgba(52,211,153,0.95)",
            touchAction: "manipulation",
          }}
        >
          Continue
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
