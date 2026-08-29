"use client";

/**
 * FlipTheBox - Week 9 (Apps & Downloads) signature exercise.
 *
 * An app arrives as a 3D cardboard box on a paused conveyor belt. The
 * front face always looks perfect ("FREE! Torch Pro, 5 stars") but the
 * other three faces carry the truth: who made it, what the reviews
 * really look like, and what it asks to use. The child SWIPES (or taps
 * the big arrows) to flip the box through four satisfying 90-degree
 * turns. INSTALL and BIN stay locked until all four faces have been
 * seen. Fakes go in the crusher (green, crunch); a genuine app should
 * be installed. Choosing wrong costs nothing: a red stamp, then a
 * teach panel that spins the box to the exact face that gave it away,
 * then the child makes the right call. Win = all 3 boxes judged.
 *
 * Self-contained by design: all copy lives here, deps are react +
 * framer-motion + ExerciseFrame + PixIcon + inline SVG/CSS only.
 */

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";

/* ------------------------------------------------------------------ */
/* Content                                                            */
/* ------------------------------------------------------------------ */

type FaceKey = "front" | "maker" | "reviews" | "asks";

const FACE_ORDER: FaceKey[] = ["front", "maker", "reviews", "asks"];

const FACE_LABEL: Record<FaceKey, string> = {
  front: "FRONT",
  maker: "MAKER",
  reviews: "REVIEWS",
  asks: "ASKS",
};

interface AppBox {
  id: string;
  name: string;
  emoji: string;
  tagline: string;
  stars: number;
  maker: { name: string; note: string; fishy: boolean };
  reviews: { headline: string; note: string; fishy: boolean };
  asks: {
    items: { emoji: string; label: string }[];
    note: string;
    fishy: boolean;
  };
  verdict: "install" | "bin";
  /** The face that gives the game away (or proves the app is safe). */
  tellFace: FaceKey;
  teach: { title: string; body: string; tip: string };
  wrongSub: string;
}

const BOXES: AppBox[] = [
  {
    id: "torch-pro",
    name: "Torch Pro",
    emoji: "💡",
    tagline: "FREE!",
    stars: 5,
    maker: {
      name: "Mojan9 Studios",
      note: "Never heard of them. Zero other apps!",
      fishy: true,
    },
    reviews: {
      headline: "3 reviews",
      note: "All posted yesterday. Hmm!",
      fishy: true,
    },
    asks: {
      items: [
        { emoji: "👪", label: "Your CONTACTS" },
        { emoji: "📷", label: "Your PHOTOS" },
      ],
      note: "All that... for a torch app?",
      fishy: true,
    },
    verdict: "bin",
    tellFace: "asks",
    teach: {
      title: "The ASKS side gave it away!",
      body: "A torch just needs to shine. It never needs your contacts or your photos.",
      tip: "When a tiny app asks for BIG things, that is a sneaky grab. BIN it!",
    },
    wrongSub: "The shiny front fooled you!",
  },
  {
    id: "puzzle-planets",
    name: "Puzzle Planets",
    emoji: "🌍",
    tagline: "FREE!",
    stars: 4,
    maker: {
      name: "Bright Owl Games",
      note: "They made 12 apps kids love.",
      fishy: false,
    },
    reviews: {
      headline: "48,204 reviews",
      note: "People have played it for years.",
      fishy: false,
    },
    asks: {
      items: [{ emoji: "🎮", label: "Just taps to play" }],
      note: "No camera. No contacts. Nothing sneaky.",
      fishy: false,
    },
    verdict: "install",
    tellFace: "asks",
    teach: {
      title: "Whoa, this one was safe!",
      body: "A real maker, years of happy reviews, and it asks for nothing sneaky.",
      tip: "When an app passes every side, it earns its spot. INSTALL it!",
    },
    wrongSub: "This one was actually safe!",
  },
  {
    id: "mega-pet-gems",
    name: "Mega Pet Gems",
    emoji: "💎",
    tagline: "FREE GEMS!",
    stars: 5,
    maker: {
      name: "TotallyRealApps4U",
      note: "That name is trying way too hard!",
      fishy: true,
    },
    reviews: {
      headline: "2 reviews",
      note: "Both say the exact same words!",
      fishy: true,
    },
    asks: {
      items: [
        { emoji: "💬", label: "Your MESSAGES" },
        { emoji: "🎤", label: "Your MICROPHONE" },
      ],
      note: "For a pet game? No way!",
      fishy: true,
    },
    verdict: "bin",
    tellFace: "reviews",
    teach: {
      title: "The REVIEWS side gave it away!",
      body: "Two copy-paste reviews means the maker wrote them. Real apps have lots of different voices.",
      tip: "Copy-paste reviews are a trick. BIN it!",
    },
    wrongSub: "Free gems are the oldest trick!",
  },
];

const INTRO = {
  title: "Flip the Box",
  body: "New apps roll in looking shiny. But the front is never the whole story!",
  tip: "Swipe the box (or tap the arrows) to spin all 4 sides. Then choose INSTALL or BIN.",
  button: "Start the belt!",
};

const WIN = {
  title: "You caught the fakes!",
  line1: "2 sneaky apps went in the crusher.",
  line2: "1 real app earned its install.",
  tip: "The front of an app always looks shiny. Heroes flip it over and check the maker, the reviews, and what it asks to use.",
  button: "Continue",
};

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */

const CUBE_W = 248;
const CUBE_H = 288;
const SCENE_H = CUBE_H + 92;

const GOOD_GREEN = "#34d399";
const BAD_RED = "#ff5d5d";
const CYAN = "#38bdf8";
const AMBER = "#ffb347";

const SWIPE_PX = 32; // release distance that flips a face (forgiving)
const DRAG_MAX = 90;

type Phase = "intro" | "play" | "celebrate";
type Status = "inspect" | "wrong" | "teach" | "fix" | "crush" | "installed";

const mod4 = (n: number) => ((n % 4) + 4) % 4;
const clamp = (n: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, n));

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function FlipTheBox({
  onComplete,
  narration,
  accent,
}: {
  onComplete: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const reduce = !!useReducedMotion();

  const [phase, setPhase] = useState<Phase>("intro");
  const [boxIdx, setBoxIdx] = useState(0);
  const [rot, setRot] = useState(0);
  const [drag, setDrag] = useState(0);
  const [seen, setSeen] = useState<FaceKey[]>(["front"]);
  const [status, setStatus] = useState<Status>("inspect");
  const [hintPulse, setHintPulse] = useState(0);

  const dragRef = useRef<{ startX: number; active: boolean }>({
    startX: 0,
    active: false,
  });
  const completedRef = useRef(false);
  const timersRef = useRef<number[]>([]);

  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  const box = BOXES[Math.min(boxIdx, BOXES.length - 1)];
  const allSeen = seen.length === 4;
  const canSpin =
    phase === "play" && (status === "inspect" || status === "fix");

  /* Rotation only ever changes in discrete events, so marking the newly
   * visible face at the call site (rather than an effect) is safe. */
  const rotateBy = (delta: number) => {
    const next = rot + delta;
    setSeen((prev) => {
      const face = FACE_ORDER[mod4(next)];
      return prev.includes(face) ? prev : [...prev, face];
    });
    setRot(next);
  };

  /* ---------------- swipe ---------------- */

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!canSpin) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* pointer capture is a nicety, not a requirement */
    }
    dragRef.current = { startX: e.clientX, active: true };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    setDrag(clamp(e.clientX - dragRef.current.startX, -DRAG_MAX, DRAG_MAX));
  };
  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.startX;
    dragRef.current.active = false;
    setDrag(0);
    if (Math.abs(dx) > SWIPE_PX) rotateBy(dx < 0 ? 1 : -1);
  };

  const spin = (dir: 1 | -1) => {
    if (!canSpin) return;
    rotateBy(dir);
  };

  /* ---------------- judging ---------------- */

  const advance = () => {
    if (boxIdx + 1 >= BOXES.length) {
      setPhase("celebrate");
      return;
    }
    setBoxIdx((i) => i + 1);
    setRot(0);
    setDrag(0);
    setSeen(["front"]);
    setStatus("inspect");
  };

  const judge = (choice: "install" | "bin") => {
    if (choice === box.verdict) {
      if (choice === "bin") {
        setStatus("crush");
        later(advance, reduce ? 1000 : 1900);
      } else {
        setStatus("installed");
        later(advance, reduce ? 900 : 1500);
      }
    } else {
      setStatus("wrong");
      later(
        () => {
          // Spin the box to the exact face that gives it away.
          setRot((r) => {
            const cur = mod4(r);
            const target = FACE_ORDER.indexOf(box.tellFace);
            let d = (target - cur + 4) % 4;
            if (d === 3) d = -1;
            return r + d;
          });
          setStatus("teach");
        },
        reduce ? 500 : 1050
      );
    }
  };

  const choose = (choice: "install" | "bin") => {
    if (phase !== "play") return;
    if (status === "inspect") {
      if (!allSeen) {
        setHintPulse((n) => n + 1);
        return;
      }
      judge(choice);
    } else if (status === "fix" && choice === box.verdict) {
      judge(choice);
    }
  };

  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  /* ---------------- derived ---------------- */

  const beltRolling =
    !reduce && (status === "crush" || status === "installed");
  const currentFace = FACE_ORDER[mod4(rot)];

  return (
    <ExerciseFrame padding={24} maxWidth={880} touchActionNone>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 10,
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        {/* -------- header -------- */}
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <PixIcon emoji="🔍" size={30} />
            <div>
              <div style={{ fontSize: 21, fontWeight: 900, color: "#eaf6ff" }}>
                Flip the Box
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#9fb4e8" }}>
                Spin every side. Then decide!
              </div>
            </div>
          </div>
          <div
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: "2px solid rgba(125,240,255,0.35)",
              background: "rgba(12,20,44,0.55)",
              fontSize: 13.5,
              fontWeight: 900,
              letterSpacing: "0.06em",
              color: "#bfe8ff",
              whiteSpace: "nowrap",
            }}
          >
            BOX {Math.min(boxIdx + 1, BOXES.length)} OF {BOXES.length}
          </div>
        </div>

        {/* -------- conveyor scene -------- */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: SCENE_H,
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* belt */}
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              bottom: 0,
              height: 54,
              borderRadius: 14,
              background: "linear-gradient(180deg, #1b2344 0%, #131a35 100%)",
              border: "1.5px solid rgba(125,240,255,0.18)",
              overflow: "hidden",
            }}
          >
            <motion.div
              aria-hidden
              animate={
                beltRolling
                  ? { backgroundPositionX: ["0px", "-64px"] }
                  : { backgroundPositionX: "0px" }
              }
              transition={
                beltRolling
                  ? { repeat: Infinity, duration: 0.4, ease: "linear" }
                  : { duration: 0.2 }
              }
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "repeating-linear-gradient(90deg, rgba(125,240,255,0.14) 0 22px, transparent 22px 64px)",
              }}
            />
            <div
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 6,
                display: "flex",
                justifyContent: "space-around",
              }}
            >
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <span
                  key={i}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: "rgba(159,180,232,0.35)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* the box (keyed per app so entrances/exits ride the belt) */}
          <AnimatePresence mode="wait">
            {phase !== "celebrate" && (
              <motion.div
                key={box.id}
                initial={
                  reduce ? { opacity: 0 } : { x: 480, opacity: 0 }
                }
                animate={{ x: 0, opacity: 1 }}
                exit={reduce ? { opacity: 0 } : { x: -480, opacity: 0 }}
                transition={
                  reduce
                    ? { duration: 0.2 }
                    : { type: "spring", stiffness: 150, damping: 20 }
                }
                style={{
                  position: "relative",
                  marginBottom: 44,
                  width: CUBE_W,
                  height: CUBE_H,
                }}
              >
                {/* soft shadow on the belt */}
                <div
                  aria-hidden
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: -22,
                    transform: "translateX(-50%)",
                    width: CUBE_W * 1.1,
                    height: 26,
                    borderRadius: "50%",
                    background:
                      "radial-gradient(ellipse, rgba(0,0,0,0.45) 0%, transparent 70%)",
                  }}
                />

                {/* crusher piston */}
                {status === "crush" && (
                  <Piston reduce={reduce} />
                )}

                {/* squash shell */}
                <motion.div
                  animate={
                    status === "crush"
                      ? reduce
                        ? { scaleY: 0.07, y: CUBE_H * 0.47 }
                        : { scaleY: 0.07, y: CUBE_H * 0.47 }
                      : status === "installed"
                        ? { y: -20, scale: 1.05 }
                        : { scaleY: 1, y: 0, scale: 1 }
                  }
                  transition={
                    status === "crush"
                      ? reduce
                        ? { duration: 0.2 }
                        : { delay: 0.3, duration: 0.26, ease: "easeIn" }
                      : { type: "spring", stiffness: 260, damping: 18 }
                  }
                  style={{
                    width: "100%",
                    height: "100%",
                    transformOrigin: "50% 100%",
                  }}
                >
                  {/* 3D stage */}
                  <div
                    onPointerDown={onPointerDown}
                    onPointerMove={onPointerMove}
                    onPointerUp={endDrag}
                    onPointerCancel={endDrag}
                    style={{
                      width: "100%",
                      height: "100%",
                      perspective: 900,
                      cursor: canSpin ? "grab" : "default",
                      touchAction: "none",
                    }}
                  >
                    <motion.div
                      animate={{ rotateY: -rot * 90 + drag * 0.3 }}
                      transition={
                        reduce
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 170, damping: 19 }
                      }
                      style={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        transformStyle: "preserve-3d",
                      }}
                    >
                      {FACE_ORDER.map((face, i) => (
                        <div
                          key={face}
                          style={{
                            position: "absolute",
                            inset: 0,
                            transform: `rotateY(${i * 90}deg) translateZ(${CUBE_W / 2}px)`,
                            backfaceVisibility: "hidden",
                            WebkitBackfaceVisibility: "hidden",
                          }}
                        >
                          <Face box={box} face={face} />
                        </div>
                      ))}
                    </motion.div>
                  </div>
                </motion.div>

                {/* teach highlight ring around the telling face */}
                {status === "teach" && (
                  <motion.div
                    aria-hidden
                    animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
                    transition={
                      reduce
                        ? undefined
                        : { repeat: Infinity, duration: 1.1 }
                    }
                    style={{
                      position: "absolute",
                      inset: -12,
                      borderRadius: 24,
                      border: `4px dashed ${AMBER}`,
                      pointerEvents: "none",
                    }}
                  />
                )}

                {/* stamps */}
                <AnimatePresence>
                  {status === "wrong" && (
                    <Stamp
                      key="stamp-wrong"
                      color={BAD_RED}
                      text={box.verdict === "bin" ? "RISKY!" : "WAIT!"}
                      sub={box.wrongSub}
                      reduce={reduce}
                    />
                  )}
                  {status === "crush" && (
                    <Stamp
                      key="stamp-bin"
                      color={GOOD_GREEN}
                      text="BINNED!"
                      sub="Crunch! Fake app flattened."
                      delay={reduce ? 0.1 : 0.7}
                      reduce={reduce}
                    />
                  )}
                  {status === "installed" && (
                    <Stamp
                      key="stamp-install"
                      color={GOOD_GREEN}
                      text="INSTALLED!"
                      sub="A real app, checked and safe."
                      reduce={reduce}
                    />
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>

          {/* spin arrows */}
          <SpinArrow side="left" onSpin={() => spin(-1)} enabled={canSpin} />
          <SpinArrow side="right" onSpin={() => spin(1)} enabled={canSpin} />
        </div>

        {/* -------- face pips -------- */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {FACE_ORDER.map((face) => {
            const isSeen = seen.includes(face);
            const isCurrent = face === currentFace;
            return (
              <div
                key={face}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: `2px solid ${
                    isCurrent
                      ? "rgba(125,240,255,0.8)"
                      : isSeen
                        ? "rgba(52,211,153,0.55)"
                        : "rgba(159,180,232,0.3)"
                  }`,
                  background: isSeen
                    ? "rgba(52,211,153,0.12)"
                    : "rgba(12,20,44,0.5)",
                  fontSize: 12.5,
                  fontWeight: 900,
                  letterSpacing: "0.06em",
                  color: isSeen ? "#a7f3d0" : "#8fa3d6",
                }}
              >
                {isSeen ? <PixIcon emoji="✅" size={15} /> : null}
                {FACE_LABEL[face]}
              </div>
            );
          })}
        </div>
        <div
          style={{
            fontSize: 13.5,
            fontWeight: 800,
            color: allSeen ? "#a7f3d0" : "#9fb4e8",
            minHeight: 20,
          }}
        >
          {allSeen
            ? "All 4 sides checked! Your call, hero."
            : `Seen ${seen.length} of 4 sides...`}
        </div>

        {/* -------- actions / teach -------- */}
        <div
          style={{
            width: "100%",
            minHeight: 128,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 8,
          }}
        >
          <AnimatePresence mode="wait">
            {status === "teach" ? (
              <TeachCard
                key="teach"
                box={box}
                onGotIt={() => setStatus("fix")}
                reduce={reduce}
              />
            ) : (
              <motion.div
                key="buttons"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", gap: 18 }}>
                  <ActionButton
                    label="INSTALL"
                    emoji="✅"
                    tone="cyan"
                    locked={status === "inspect" && !allSeen}
                    disabled={
                      status === "crush" ||
                      status === "installed" ||
                      status === "wrong" ||
                      (status === "fix" && box.verdict !== "install")
                    }
                    pulsing={status === "fix" && box.verdict === "install"}
                    onPress={() => choose("install")}
                    reduce={reduce}
                  />
                  <ActionButton
                    label="BIN IT"
                    emoji="🗑️"
                    tone="amber"
                    locked={status === "inspect" && !allSeen}
                    disabled={
                      status === "crush" ||
                      status === "installed" ||
                      status === "wrong" ||
                      (status === "fix" && box.verdict !== "bin")
                    }
                    pulsing={status === "fix" && box.verdict === "bin"}
                    onPress={() => choose("bin")}
                    reduce={reduce}
                  />
                </div>
                {status === "inspect" && !allSeen && (
                  <motion.div
                    key={hintPulse}
                    initial={
                      hintPulse === 0
                        ? false
                        : { scale: 0.9, opacity: 0.4 }
                    }
                    animate={{ scale: 1, opacity: 1 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: AMBER,
                    }}
                  >
                    <PixIcon emoji="🔒" size={17} />
                    Flip the box to see all 4 sides first!
                  </motion.div>
                )}
                {status === "fix" && (
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 800,
                      color: "#bfe8ff",
                    }}
                  >
                    {box.verdict === "bin"
                      ? "Now press BIN IT!"
                      : "Now press INSTALL!"}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* -------- overlays -------- */}
      {phase === "intro" && (
        <IntroOverlay
          onStart={() => setPhase("play")}
          reduce={reduce}
          narration={narration}
          accent={accent}
        />
      )}
      {phase === "celebrate" && (
        <WinOverlay onContinue={finish} reduce={reduce} />
      )}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Box faces                                                          */
/* ------------------------------------------------------------------ */

const faceBase: CSSProperties = {
  width: "100%",
  height: "100%",
  borderRadius: 16,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "18px 16px",
  textAlign: "center",
  background: "linear-gradient(180deg, #c9955c 0%, #a9763f 100%)",
  border: "2px solid rgba(74,46,18,0.7)",
  boxShadow: "inset 0 0 34px rgba(74,46,18,0.35)",
  overflow: "hidden",
};

function Tape() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "58%",
        height: 22,
        background: "rgba(240,225,200,0.5)",
        borderBottom: "1.5px dashed rgba(120,90,50,0.5)",
      }}
    />
  );
}

function FaceTag({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: "4px 12px",
        borderRadius: 999,
        background: "rgba(58,36,8,0.75)",
        color: "#ffd9ad",
        fontSize: 12,
        fontWeight: 900,
        letterSpacing: "0.1em",
      }}
    >
      {text}
    </div>
  );
}

function Note({ text, fishy }: { text: string; fishy: boolean }) {
  return (
    <div
      style={{
        fontSize: 14,
        fontWeight: 800,
        lineHeight: 1.4,
        color: fishy ? "#ffe0d6" : "#dcfce7",
        background: fishy ? "rgba(160,40,20,0.55)" : "rgba(10,90,60,0.55)",
        border: `1.5px solid ${fishy ? "rgba(255,120,90,0.6)" : "rgba(52,211,153,0.55)"}`,
        borderRadius: 12,
        padding: "8px 10px",
      }}
    >
      {text}
    </div>
  );
}

function Face({ box, face }: { box: AppBox; face: FaceKey }) {
  if (face === "front") {
    return (
      <div style={{ ...faceBase, position: "relative" }}>
        <Tape />
        {/* glossy store sticker: the too-good-to-be-true listing */}
        <div
          style={{
            width: "100%",
            borderRadius: 14,
            padding: "16px 12px",
            background: "linear-gradient(180deg, #223058 0%, #16203f 100%)",
            border: "2px solid rgba(125,240,255,0.5)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
          }}
        >
          <PixIcon emoji={box.emoji} size={54} />
          <div style={{ fontSize: 20, fontWeight: 900, color: "#eaf6ff" }}>
            {box.name}
          </div>
          <div
            style={{
              padding: "3px 12px",
              borderRadius: 999,
              background: "linear-gradient(180deg, #ffd158, #f08c1a)",
              color: "#3a2408",
              fontSize: 13.5,
              fontWeight: 900,
              letterSpacing: "0.06em",
            }}
          >
            {box.tagline}
          </div>
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                style={{ opacity: i < box.stars ? 1 : 0.22, display: "inline-flex" }}
              >
                <PixIcon emoji="⭐" size={19} />
              </span>
            ))}
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 800, color: "#5c3a14" }}>
          Looks perfect... or does it?
        </div>
      </div>
    );
  }
  if (face === "maker") {
    return (
      <div style={{ ...faceBase, position: "relative" }}>
        <Tape />
        <FaceTag text="MADE BY" />
        <PixIcon emoji="🕵️" size={40} />
        <div style={{ fontSize: 19, fontWeight: 900, color: "#3a2408" }}>
          {box.maker.name}
        </div>
        <Note text={box.maker.note} fishy={box.maker.fishy} />
      </div>
    );
  }
  if (face === "reviews") {
    return (
      <div style={{ ...faceBase, position: "relative" }}>
        <Tape />
        <FaceTag text="REVIEWS" />
        <PixIcon emoji="💬" size={40} />
        <div style={{ fontSize: 21, fontWeight: 900, color: "#3a2408" }}>
          {box.reviews.headline}
        </div>
        <Note text={box.reviews.note} fishy={box.reviews.fishy} />
      </div>
    );
  }
  return (
    <div style={{ ...faceBase, position: "relative" }}>
      <Tape />
      <FaceTag text="WANTS TO USE" />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          width: "100%",
        }}
      >
        {box.asks.items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "6px 10px",
              borderRadius: 12,
              background: "rgba(58,36,8,0.55)",
              color: "#ffe9cf",
              fontSize: 14.5,
              fontWeight: 900,
            }}
          >
            <PixIcon emoji={item.emoji} size={22} />
            {item.label}
          </div>
        ))}
      </div>
      <Note text={box.asks.note} fishy={box.asks.fishy} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scene pieces                                                       */
/* ------------------------------------------------------------------ */

function Piston({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      aria-hidden
      initial={{ y: reduce ? -40 : -210 }}
      animate={
        reduce
          ? { y: -6 }
          : { y: [-210, -6, -6, -150] }
      }
      transition={
        reduce
          ? { duration: 0.2 }
          : { duration: 1.3, times: [0, 0.24, 0.55, 1], ease: "easeInOut" }
      }
      style={{
        position: "absolute",
        left: "50%",
        top: 0,
        marginLeft: -80,
        width: 160,
        zIndex: 3,
        pointerEvents: "none",
      }}
    >
      {/* rod */}
      <div
        style={{
          width: 26,
          height: 130,
          margin: "0 auto",
          background: "linear-gradient(90deg, #6b7699, #aab4d4, #6b7699)",
          borderRadius: 6,
        }}
      />
      {/* hazard-striped press head */}
      <div
        style={{
          width: 160,
          height: 40,
          borderRadius: 10,
          border: "2px solid #2a2f4a",
          background:
            "repeating-linear-gradient(45deg, #ffd158 0 16px, #2a2f4a 16px 32px)",
          boxShadow: "0 10px 24px -8px rgba(0,0,0,0.6)",
        }}
      />
    </motion.div>
  );
}

function Stamp({
  color,
  text,
  sub,
  delay = 0,
  reduce,
}: {
  color: string;
  text: string;
  sub: string;
  delay?: number;
  reduce: boolean;
}) {
  return (
    /* Outer div owns the centering transform; framer would overwrite it on
     * the animated element, so the spring lives on the inner motion.div. */
    <div
      style={{
        position: "absolute",
        top: "34%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={
          reduce ? { opacity: 0 } : { scale: 2.4, opacity: 0, rotate: -18 }
        }
        animate={reduce ? { opacity: 1 } : { scale: 1, opacity: 1, rotate: -10 }}
        exit={{ opacity: 0 }}
        transition={
          reduce
            ? { delay, duration: 0.15 }
            : { delay, type: "spring", stiffness: 420, damping: 16 }
        }
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
        }}
      >
      <div
        style={{
          padding: "10px 22px",
          borderRadius: 14,
          border: `5px solid ${color}`,
          color,
          background: "rgba(8,10,22,0.78)",
          fontSize: 30,
          fontWeight: 900,
          letterSpacing: "0.1em",
          whiteSpace: "nowrap",
          boxShadow: `0 0 34px -6px ${color}`,
        }}
      >
        {text}
      </div>
      <div
        style={{
          padding: "4px 12px",
          borderRadius: 999,
          background: "rgba(8,10,22,0.85)",
          color: "#eaf6ff",
          fontSize: 13.5,
          fontWeight: 800,
            whiteSpace: "nowrap",
          }}
        >
          {sub}
        </div>
      </motion.div>
    </div>
  );
}

function SpinArrow({
  side,
  onSpin,
  enabled,
}: {
  side: "left" | "right";
  onSpin: () => void;
  enabled: boolean;
}) {
  return (
    <motion.button
      type="button"
      aria-label={side === "left" ? "Spin box left" : "Spin box right"}
      onClick={onSpin}
      whileTap={enabled ? { scale: 0.88 } : undefined}
      style={{
        position: "absolute",
        [side]: 6,
        top: "40%",
        width: 58,
        height: 58,
        borderRadius: "50%",
        border: "2.5px solid rgba(125,240,255,0.55)",
        background: "rgba(12,20,44,0.72)",
        color: "#bfe8ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: enabled ? "pointer" : "default",
        opacity: enabled ? 1 : 0.28,
        touchAction: "manipulation",
        zIndex: 2,
      }}
    >
      <svg viewBox="0 0 24 24" width={26} height={26} aria-hidden>
        <path
          d={side === "left" ? "M15 5 8 12l7 7" : "M9 5l7 7-7 7"}
          stroke="currentColor"
          strokeWidth={3.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.button>
  );
}

function ActionButton({
  label,
  emoji,
  tone,
  locked,
  disabled,
  pulsing,
  onPress,
  reduce,
}: {
  label: string;
  emoji: string;
  tone: "cyan" | "amber";
  locked: boolean;
  disabled: boolean;
  pulsing: boolean;
  onPress: () => void;
  reduce: boolean;
}) {
  const inert = disabled;
  const colors =
    tone === "cyan"
      ? {
          border: CYAN,
          bg: "linear-gradient(180deg, #38bdf8 0%, #1d7fc4 100%)",
          text: "#06263c",
          glow: "rgba(56,189,248,0.8)",
        }
      : {
          border: "#ffd158",
          bg: "linear-gradient(180deg, #ffb347 0%, #f08c1a 100%)",
          text: "#3a2408",
          glow: "rgba(255,179,71,0.8)",
        };
  return (
    <motion.button
      type="button"
      onClick={onPress}
      disabled={inert}
      whileTap={!inert && !locked ? { scale: 0.94 } : undefined}
      animate={
        pulsing && !reduce
          ? { scale: [1, 1.07, 1] }
          : { scale: 1 }
      }
      transition={
        pulsing && !reduce
          ? { repeat: Infinity, duration: 0.9 }
          : undefined
      }
      style={{
        minWidth: 158,
        minHeight: 62,
        padding: "12px 24px",
        borderRadius: 18,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        border: `3px solid ${locked || inert ? "rgba(159,180,232,0.4)" : colors.border}`,
        background:
          locked || inert
            ? "linear-gradient(180deg, #2b3358 0%, #1e2544 100%)"
            : colors.bg,
        color: locked || inert ? "#8fa3d6" : colors.text,
        fontSize: 18,
        fontWeight: 900,
        letterSpacing: "0.06em",
        cursor: inert ? "default" : "pointer",
        fontFamily: "inherit",
        boxShadow:
          locked || inert ? "none" : `0 12px 30px -10px ${colors.glow}`,
        touchAction: "manipulation",
      }}
    >
      <PixIcon emoji={locked ? "🔒" : emoji} size={24} />
      {label}
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/* Teach + overlays                                                   */
/* ------------------------------------------------------------------ */

function TeachCard({
  box,
  onGotIt,
  reduce,
}: {
  box: AppBox;
  onGotIt: () => void;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { y: 20, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      exit={reduce ? { opacity: 0 } : { y: 12, opacity: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      style={{
        maxWidth: 460,
        width: "100%",
        textAlign: "center",
        padding: "14px 18px 16px",
        borderRadius: 18,
        border: "2.5px solid rgba(255,93,93,0.6)",
        background:
          "linear-gradient(180deg, rgba(58,16,24,0.96) 0%, rgba(30,10,18,0.98) 100%)",
        boxShadow: "0 20px 50px -16px rgba(0,0,0,0.8)",
      }}
    >
      <div
        style={{
          fontSize: 15,
          fontWeight: 900,
          color: AMBER,
          marginBottom: 4,
        }}
      >
        Look up! That side of the box is glowing.
      </div>
      <div style={{ fontSize: 18, fontWeight: 900, color: "#ffc9a1", marginBottom: 6 }}>
        {box.teach.title}
      </div>
      <div
        style={{
          fontSize: 14.5,
          fontWeight: 700,
          lineHeight: 1.5,
          color: "#f3e2d2",
          marginBottom: 4,
        }}
      >
        {box.teach.body}
      </div>
      <div
        style={{
          fontSize: 13.5,
          fontWeight: 800,
          lineHeight: 1.5,
          color: "#bfe8ff",
          marginBottom: 12,
        }}
      >
        {box.teach.tip}
      </div>
      <motion.button
        type="button"
        onClick={onGotIt}
        whileTap={{ scale: 0.95 }}
        style={{
          minWidth: 140,
          minHeight: 50,
          padding: "10px 26px",
          borderRadius: 14,
          border: `3px solid ${GOOD_GREEN}`,
          background: "rgba(52,211,153,0.16)",
          color: "#a7f3d0",
          fontSize: 16,
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
  );
}

const overlayBase: CSSProperties = {
  position: "absolute",
  inset: 0,
  zIndex: 6,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
  background: "rgba(8, 10, 22, 0.8)",
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={overlayBase}>
      <motion.div
        initial={reduce ? { opacity: 0 } : { y: 24, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        style={{
          maxWidth: 440,
          textAlign: "center",
          padding: "28px 26px",
          borderRadius: 24,
          border: "2px solid rgba(125,240,255,0.5)",
          background:
            "linear-gradient(180deg, rgba(18,28,60,0.97) 0%, rgba(10,16,36,0.98) 100%)",
          boxShadow: "0 30px 70px -20px rgba(0,0,0,0.8)",
          // The spoken-instruction block makes the card taller; on short
          // viewports the card scrolls internally so the start button is
          // always reachable (never clipped by the centered overlay).
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        {/* tiny box-on-belt illustration */}
        <svg
          viewBox="0 0 140 64"
          width={130}
          aria-hidden
          style={{ display: "block", margin: "0 auto 10px" }}
        >
          <rect x={6} y={48} width={128} height={10} rx={5} fill="#1b2344" stroke="rgba(125,240,255,0.35)" />
          <circle cx={26} cy={53} r={3} fill="#8fa3d6" />
          <circle cx={70} cy={53} r={3} fill="#8fa3d6" />
          <circle cx={114} cy={53} r={3} fill="#8fa3d6" />
          <g transform="rotate(-4 70 30)">
            <rect x={46} y={12} width={48} height={36} rx={6} fill="#c9955c" stroke="#4a2e12" strokeWidth={2} />
            <rect x={62} y={12} width={16} height={36} fill="rgba(240,225,200,0.5)" />
          </g>
          <path d="M104 26c8-2 14 2 16 8" stroke="#7df0ff" strokeWidth={3} fill="none" strokeLinecap="round" />
          <path d="M120 34l2-8-8 2" fill="#7df0ff" />
        </svg>
        <div style={{ fontSize: 26, fontWeight: 900, color: "#bfe8ff", marginBottom: 12 }}>
          {INTRO.title}
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 700,
            lineHeight: 1.55,
            color: "#dbe6ff",
            marginBottom: 6,
          }}
        >
          {INTRO.body}
        </div>
        <div
          style={{
            fontSize: 15.5,
            fontWeight: 800,
            lineHeight: 1.55,
            color: "#7df0ff",
            marginBottom: 20,
          }}
        >
          {INTRO.tip}
        </div>
        {narration && narration.lines.length > 0 && (
          <div style={{ textAlign: "left" }}>
            <InfoNarration lines={narration.lines} accent={accent ?? "#2b7fff"} />
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
            border: "3px solid #7df0ff",
            background: "linear-gradient(180deg, #38bdf8 0%, #1d7fc4 100%)",
            color: "#06263c",
            fontSize: 18,
            fontWeight: 900,
            letterSpacing: "0.05em",
            cursor: "pointer",
            fontFamily: "inherit",
            boxShadow: "0 12px 30px -10px rgba(56,189,248,0.9)",
            touchAction: "manipulation",
          }}
        >
          {INTRO.button}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

function WinOverlay({
  onContinue,
  reduce,
}: {
  onContinue: () => void;
  reduce: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: reduce ? 0 : 0.15 }}
      style={{ ...overlayBase, background: "rgba(6, 20, 14, 0.82)" }}
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
          background:
            "linear-gradient(180deg, rgba(10,46,32,0.97) 0%, rgba(6,26,18,0.98) 100%)",
          boxShadow:
            "0 30px 70px -20px rgba(0,0,0,0.85), 0 0 50px -8px rgba(52,211,153,0.55)",
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
                  : {
                      delay: 0.25 + 0.18 * i,
                      type: "spring",
                      stiffness: 300,
                      damping: 14,
                    }
              }
              style={{ display: "inline-flex" }}
            >
              <PixIcon emoji="⭐" size={44} />
            </motion.span>
          ))}
        </div>
        <div style={{ fontSize: 25, fontWeight: 900, color: "#a7f3d0", marginBottom: 12 }}>
          {WIN.title}
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
          {WIN.line1}
          <br />
          {WIN.line2}
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
          {WIN.tip}
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
          {WIN.button}
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
