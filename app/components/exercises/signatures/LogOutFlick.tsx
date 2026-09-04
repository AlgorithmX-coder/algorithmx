"use client";

/**
 * LogOutFlick - Week 18 (Sharing Devices) signature exercise.
 *
 * Locker room, end of break. A SHARED tablet on the bench is covered in
 * the child's open cards: a game still logged in, a half-written message,
 * a photo gallery. The child FLICKS each card downward off the screen
 * (framer-motion drag, swipe-to-dismiss with a slam-and-lock stamp) to
 * log out. When the stack looks empty and they head for the locker door,
 * a goblin paw sneaks ONE card back open behind them and the door light
 * snaps to AMBER until they turn back and flick that one too. Zero open
 * cards = shut the locker and tap the big lock (it goes GREEN). WIN =
 * "LOCKED AND SAFE!" banner, and onComplete() fires once from Finish.
 *
 * Teaches: leaving a shared device is a sweep ritual. Close everything,
 * log out, lock, then LOOK BACK and check again.
 *
 * Forgiving by design: no timer, no red hard-fail. The amber light and
 * the goblin re-open ARE the lesson, never a punishment. Wrong flicks
 * just spring back with a friendly hint.
 *
 * Self-contained by design: all copy lives here, deps are react +
 * framer-motion + ExerciseFrame + PixIcon + inline SVG/CSS only.
 */

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { PanInfo } from "framer-motion";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";

/* ------------------------------------------------------------------ */
/* Constants + content                                                */
/* ------------------------------------------------------------------ */

const STAGE_W = 920;
const STAGE_H = 520;

/* Flick thresholds (pointer px, deliberately forgiving) */
const DISMISS_OFFSET = 70;
const DISMISS_VELOCITY = 400;

type CardId = "game" | "message" | "photos";
type Phase = "intro" | "sweep" | "ready" | "leaving" | "lookback" | "lock" | "won";
type ToastTone = "green" | "amber" | "hint" | "soft";

interface Toast {
  key: number;
  tone: ToastTone;
  title: string;
  body?: string;
}

/* Bottom of the stack first, top of the stack last. */
const STACK: CardId[] = ["photos", "message", "game"];

const ROT: Record<CardId, number> = { photos: -5, message: 4, game: 0 };

const CARD_META: Record<CardId, { label: string; hudColor: string }> = {
  game: { label: "Game", hudColor: "#b79cff" },
  message: { label: "Message", hudColor: "#7df0ff" },
  photos: { label: "Photos", hudColor: "#ff9fce" },
};

const FLICK_TOAST: Record<CardId, { title: string; body: string }> = {
  game: { title: "Game logged out!", body: "Now nobody can play as you." },
  message: { title: "Message closed!", body: "Your words stay yours." },
  photos: { title: "Gallery closed!", body: "Your pictures are private again." },
};

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */

export default function LogOutFlick({
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
  const [openCards, setOpenCards] = useState<CardId[]>(STACK);
  const [loggedOut, setLoggedOut] = useState<Record<CardId, boolean>>({
    game: false,
    message: false,
    photos: false,
  });
  const [stamp, setStamp] = useState<{ key: number } | null>(null);
  const [doorFlash, setDoorFlash] = useState(false);
  const [pawIn, setPawIn] = useState(false);
  const [giggle, setGiggle] = useState(false);
  const [lockShut, setLockShut] = useState(false);
  const [lockBurst, setLockBurst] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);

  const interactive = phase === "sweep" || phase === "lookback";

  /* -------- responsive scale (design px -> screen px) -------- */

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const apply = () => setScale(Math.max(0.2, el.clientWidth / STAGE_W));
    apply();
    const ro = new ResizeObserver(apply);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* -------- timers (all cleared on unmount) -------- */

  const timersRef = useRef<number[]>([]);
  const later = (fn: () => void, ms: number) => {
    timersRef.current.push(window.setTimeout(fn, ms));
  };
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  /* -------- toast -------- */

  const toastTimerRef = useRef<number | null>(null);
  const showToast = (tone: ToastTone, title: string, body?: string) => {
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    setToast({ key: Date.now(), tone, title, body });
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3200);
  };
  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  /* -------- the flick -------- */

  const flickOff = (id: CardId) => {
    audio.correct();
    setOpenCards((prev) => prev.filter((c) => c !== id));
    setLoggedOut((prev) => ({ ...prev, [id]: true }));
    setStamp({ key: Date.now() });
    later(() => setStamp(null), 950);
    const t = FLICK_TOAST[id];
    showToast("green", t.title, t.body);
  };

  const onCardDragEnd = (id: CardId) => (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!interactive) return;
    if (info.offset.y > DISMISS_OFFSET || info.velocity.y > DISMISS_VELOCITY) {
      flickOff(id);
    } else if (info.offset.y < -50 || Math.abs(info.offset.x) > 60) {
      audio.wrong();
      showToast("hint", "Almost!", "Flick the card DOWN, all the way off the screen.");
    }
  };

  const onCardTap = () => {
    if (!interactive) return;
    audio.tap();
    showToast("hint", "Give it a flick!", "Press the card and swipe it down fast.");
  };

  /* -------- phase transitions when the stack empties -------- */

  useEffect(() => {
    if (phase === "sweep" && openCards.length === 0) {
      const t = window.setTimeout(() => {
        setPhase("ready");
        showToast("green", "Looking clear!", "The light is green. Tap the locker door to head out.");
      }, 650);
      timersRef.current.push(t);
    } else if (phase === "lookback" && openCards.length === 0) {
      const t = window.setTimeout(() => {
        setPhase("lock");
        showToast("green", "Really clear this time!", "You checked again like a pro. Now tap the big lock!");
      }, 550);
      timersRef.current.push(t);
    }
    // showToast is stable enough for this scripted beat; deps kept minimal on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openCards.length, phase]);

  /* -------- the goblin beat -------- */

  const startLeaving = () => {
    setPhase("leaving");
    showToast("soft", "Heading out...", "Wait. Did you check one last time?");
    later(() => setPawIn(true), 250);
    later(() => {
      setOpenCards(["game"]);
      setLoggedOut((prev) => ({ ...prev, game: false }));
      setGiggle(true);
    }, 850);
    later(() => setPawIn(false), 1700);
    later(() => setGiggle(false), 2100);
    later(() => {
      setPhase("lookback");
      showToast("amber", "AMBER LIGHT! Look back!", "A sneaky goblin paw popped your game open again. Flick it off!");
    }, 2000);
  };

  /* -------- door + lock -------- */

  const flashAmber = () => {
    setDoorFlash(true);
    later(() => setDoorFlash(false), 1500);
  };

  const lockUp = () => {
    if (lockShut) return;
    audio.unlock();
    setLockShut(true);
    setLockBurst(true);
    later(() => setLockBurst(false), 800);
    later(() => setPhase("won"), 750);
  };

  const onDoorTap = () => {
    if (phase === "sweep") {
      audio.wrong();
      flashAmber();
      showToast("amber", "Amber light!", "Amber means something is still open. Flick every card off the tablet first!");
    } else if (phase === "ready") {
      audio.tap();
      startLeaving();
    } else if (phase === "lookback") {
      audio.wrong();
      flashAmber();
      showToast("amber", "Still amber!", "The goblin opened a card behind you. Flick it off, then come back!");
    } else if (phase === "lock") {
      lockUp();
    }
  };

  /* -------- win -------- */

  const completedRef = useRef(false);
  const finish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  /* -------- derived -------- */

  const count = STACK.filter((id) => loggedOut[id]).length;

  const goblinStruck = phase === "leaving" && openCards.length > 0;
  const light: "off" | "amber" | "green" =
    phase === "ready" || phase === "lock" || phase === "won"
      ? "green"
      : phase === "lookback" || goblinStruck
        ? "amber"
        : phase === "leaving"
          ? "green"
          : doorFlash
            ? "amber"
            : "off";

  /* ---------------------------------------------------------------- */

  return (
    <ExerciseFrame padding={24} maxWidth={1060} touchActionNone>
      {/* header row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 900,
              letterSpacing: 2.5,
              color: "#9fe8ff",
              textTransform: "uppercase",
            }}
          >
            The Log-Out Flick
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 12px",
              borderRadius: 999,
              background: "rgba(10,18,44,0.7)",
              border: "1px solid rgba(125,240,255,0.35)",
              fontSize: 12.5,
              fontWeight: 700,
              color: "#cfe6ff",
            }}
          >
            <PixIcon emoji="👀" size={16} />
            <span>Sweep it: close, log out, lock, CHECK!</span>
          </div>
        </div>
        <ProgressHud loggedOut={loggedOut} count={count} />
      </div>

      {/* stage (fixed design coordinates, scaled to fit) */}
      <div
        ref={wrapRef}
        style={{ position: "relative", width: "100%", height: Math.round(STAGE_H * scale) }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: STAGE_W,
            height: STAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {/* -------------------- the locker room -------------------- */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid rgba(125,240,255,0.18)",
              background: "linear-gradient(180deg, #2e3560 0%, #293056 55%, #232a4e 100%)",
            }}
          >
            {/* floor */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: 440,
                bottom: 0,
                background: "linear-gradient(180deg, #262046 0%, #1f1a3c 100%)",
                borderTop: "3px solid rgba(140,150,220,0.35)",
              }}
            />

            {/* background lockers */}
            {[0, 1, 2, 3].map((i) => (
              <BgLocker key={i} x={16 + i * 124} even={i % 2 === 0} />
            ))}

            {/* team pennant, just for charm */}
            <div
              style={{
                position: "absolute",
                left: 522,
                top: 46,
                width: 0,
                height: 0,
                borderTop: "22px solid transparent",
                borderBottom: "22px solid transparent",
                borderLeft: "66px solid #ff9f68",
                filter: "drop-shadow(0 3px 4px rgba(0,0,0,0.3))",
              }}
            />

            {/* bench */}
            <div
              style={{
                position: "absolute",
                left: 24,
                top: 458,
                width: 476,
                height: 15,
                borderRadius: 7,
                background: "linear-gradient(180deg, #6d5a9e, #55437f)",
                boxShadow: "0 6px 10px rgba(0,0,0,0.25)",
              }}
            />
            {[60, 420].map((x) => (
              <div
                key={x}
                style={{
                  position: "absolute",
                  left: x,
                  top: 473,
                  width: 12,
                  height: 40,
                  borderRadius: 4,
                  background: "#4a3a78",
                }}
              />
            ))}

            {/* sneaker on the floor, charm */}
            <svg
              width={70}
              height={38}
              viewBox="0 0 70 38"
              style={{ position: "absolute", left: 512, top: 470 }}
            >
              <path
                d="M6 28 C6 16, 16 10, 26 12 L40 16 C54 20, 64 22, 64 28 L64 32 L6 32 Z"
                fill="#e85d75"
                stroke="#b23a52"
                strokeWidth={2}
              />
              <path d="M6 30 L64 30 L64 34 A4 4 0 0 1 60 36 L10 36 A4 4 0 0 1 6 32 Z" fill="#f4f7ff" />
              <path d="M26 13 L30 22 M34 15 L37 23" stroke="#f4f7ff" strokeWidth={2.5} strokeLinecap="round" />
            </svg>

            {/* -------------------- the shared tablet -------------------- */}
            <div
              style={{
                position: "absolute",
                left: 96,
                top: 66,
                width: 360,
                height: 392,
                borderRadius: 22,
                background: "#1c2247",
                border: "4px solid #59639a",
                boxShadow: "0 18px 40px rgba(0,0,0,0.4)",
                zIndex: 4,
              }}
            >
              {/* camera dot on the bezel */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 5,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  transform: "translateX(-50%)",
                  background: "#0b0f24",
                  border: "1px solid #39406e",
                }}
              />
              {/* "SHARED TABLET" etched label */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  bottom: -1,
                  textAlign: "center",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: 2.5,
                  color: "rgba(207,230,255,0.55)",
                }}
              >
                SHARED TABLET
              </div>

              {/* screen */}
              <div
                style={{
                  position: "absolute",
                  left: 12,
                  top: 14,
                  width: 336,
                  height: 362,
                  borderRadius: 14,
                  overflow: "hidden",
                  background: "linear-gradient(160deg, #2c3a80 0%, #222c5c 100%)",
                }}
              >
                {/* wallpaper dots */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage: "radial-gradient(rgba(160,190,255,0.14) 2px, transparent 2.4px)",
                    backgroundSize: "34px 34px",
                  }}
                />

                {/* the card stack */}
                <AnimatePresence initial={false}>
                  {openCards.map((id, i) => {
                    const depth = openCards.length - 1 - i;
                    const isTop = i === openCards.length - 1;
                    return (
                      <motion.div
                        key={id}
                        initial={{ y: 480, rotate: -16, opacity: 0.85 }}
                        animate={{
                          y: depth * 10,
                          x: 0,
                          rotate: ROT[id],
                          scale: 1 - depth * 0.045,
                          opacity: 1,
                        }}
                        exit={{
                          y: 520,
                          rotate: 16,
                          opacity: 0.9,
                          transition: { duration: 0.42, ease: "easeIn" },
                        }}
                        transition={{ type: "spring", stiffness: 260, damping: 24 }}
                        drag={isTop && interactive}
                        dragSnapToOrigin
                        dragMomentum={false}
                        dragElastic={0.85}
                        onDragEnd={onCardDragEnd(id)}
                        onTap={isTop ? onCardTap : undefined}
                        role="button"
                        aria-label={`Open ${CARD_META[id].label.toLowerCase()} card. Flick it down to log out.`}
                        style={{
                          position: "absolute",
                          left: 38,
                          top: 40,
                          width: 260,
                          height: 280,
                          borderRadius: 18,
                          overflow: "hidden",
                          background: "#f4f7ff",
                          border: "3px solid #ccd6f6",
                          boxShadow: "0 14px 30px rgba(0,0,0,0.35)",
                          cursor: isTop && interactive ? "grab" : "default",
                          touchAction: "none",
                          zIndex: 5 + i,
                        }}
                      >
                        <CardFace id={id} reduce={reduce} />
                        {isTop && interactive && <FlickHint reduce={reduce} />}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>

                {/* empty-screen padlock watermark once swept */}
                {openCards.length === 0 && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      opacity: 0.55,
                      pointerEvents: "none",
                    }}
                  >
                    <PixIcon emoji="🔒" size={54} />
                    <div style={{ fontSize: 13, fontWeight: 800, color: "#cfe6ff", letterSpacing: 1.5 }}>
                      ALL LOGGED OUT
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* slam-and-lock stamp over the tablet */}
            <div
              style={{
                position: "absolute",
                left: 96,
                top: 66,
                width: 360,
                height: 392,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                pointerEvents: "none",
                zIndex: 25,
              }}
            >
              <AnimatePresence>
                {stamp && (
                  <motion.div
                    key={stamp.key}
                    initial={{ scale: 2.1, opacity: 0, rotate: -8 }}
                    animate={{ scale: 1, opacity: 1, rotate: -4 }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "12px 22px",
                      borderRadius: 16,
                      background: "linear-gradient(180deg, #10402c, #0c3323)",
                      border: "3px solid rgba(52,211,153,0.9)",
                      boxShadow: "0 0 30px rgba(52,211,153,0.45), 0 14px 30px rgba(0,0,0,0.4)",
                    }}
                  >
                    <PixIcon emoji="🔒" size={30} />
                    <span style={{ fontSize: 22, fontWeight: 900, letterSpacing: 2, color: "#8ff5c0" }}>
                      LOGGED OUT!
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* -------------------- the goblin paw -------------------- */}
            <AnimatePresence>
              {pawIn && (
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: 300 }}
                  exit={{ x: 0, transition: { duration: 0.4, ease: "easeIn" } }}
                  transition={{ type: "spring", stiffness: 120, damping: 16 }}
                  style={{ position: "absolute", left: -290, top: 316, zIndex: 20 }}
                >
                  <GoblinPaw />
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {giggle && (
                <motion.div
                  initial={{ scale: 0.5, opacity: 0, y: 8 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.25 } }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  style={{
                    position: "absolute",
                    left: 30,
                    top: 268,
                    padding: "6px 14px",
                    borderRadius: 14,
                    background: "#f4f7ff",
                    border: "2px solid #68c94f",
                    fontSize: 15,
                    fontWeight: 900,
                    color: "#3d8f2c",
                    boxShadow: "0 8px 20px rgba(0,0,0,0.35)",
                    zIndex: 21,
                  }}
                >
                  hee hee!
                </motion.div>
              )}
            </AnimatePresence>

            {/* -------------------- the locker door -------------------- */}
            <motion.div
              role="button"
              aria-label="Your locker door"
              onClick={onDoorTap}
              animate={
                phase === "ready" && !reduce
                  ? {
                      boxShadow: [
                        "0 0 0px rgba(52,211,153,0.0)",
                        "0 0 26px rgba(52,211,153,0.55)",
                        "0 0 0px rgba(52,211,153,0.0)",
                      ],
                    }
                  : { boxShadow: "0 14px 34px rgba(0,0,0,0.35)" }
              }
              transition={phase === "ready" && !reduce ? { duration: 1.6, repeat: Infinity } : undefined}
              style={{
                position: "absolute",
                left: 608,
                top: 44,
                width: 240,
                height: 436,
                borderRadius: 14,
                background: "linear-gradient(180deg, #3b4a8f, #2d3a75)",
                border: "3px solid #59639a",
                cursor: phase === "ready" || phase === "lock" ? "pointer" : "default",
                zIndex: 6,
              }}
            >
              {/* the sweep light */}
              <DoorLight light={light} reduce={reduce} />
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 52,
                  textAlign: "center",
                  fontSize: 9,
                  fontWeight: 900,
                  letterSpacing: 2,
                  color: "rgba(207,230,255,0.6)",
                }}
              >
                SWEEP LIGHT
              </div>

              {/* number plate */}
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: 72,
                  transform: "translateX(-50%)",
                  width: 46,
                  height: 27,
                  borderRadius: 6,
                  background: "#c9d1f2",
                  border: "2px solid #7a86bb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 15,
                  fontWeight: 900,
                  color: "#2b2f55",
                }}
              >
                18
              </div>

              {/* vents */}
              {[122, 140, 158].map((y) => (
                <div
                  key={y}
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: y,
                    transform: "translateX(-50%)",
                    width: 150,
                    height: 9,
                    borderRadius: 5,
                    background: "rgba(15,18,40,0.55)",
                  }}
                />
              ))}

              {/* handle */}
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: 226,
                  width: 15,
                  height: 74,
                  borderRadius: 8,
                  background: "linear-gradient(180deg, #dbe2fb, #a9b3dd)",
                  border: "2px solid #7a86bb",
                }}
              />

              {/* hasp plate + the big padlock */}
              <div
                style={{
                  position: "absolute",
                  left: 20,
                  top: 322,
                  width: 40,
                  height: 20,
                  borderRadius: 5,
                  background: "#9aa3cf",
                  border: "2px solid #6a749f",
                }}
              />
              <div
                role="button"
                aria-label={lockShut ? "Locker is locked" : "The lock. Tap it to lock up."}
                onClick={(e) => {
                  if (phase === "lock") {
                    e.stopPropagation();
                    lockUp();
                  }
                }}
                style={{
                  position: "absolute",
                  left: -6,
                  top: 318,
                  width: 96,
                  height: 100,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: phase === "lock" ? "pointer" : "default",
                }}
              >
                <motion.div
                  animate={
                    phase === "lock" && !lockShut && !reduce
                      ? { scale: [1, 1.14, 1] }
                      : { scale: 1 }
                  }
                  transition={
                    phase === "lock" && !lockShut && !reduce
                      ? { duration: 1.1, repeat: Infinity }
                      : undefined
                  }
                >
                  <Padlock shut={lockShut} armed={phase === "lock" || phase === "won"} />
                </motion.div>
                {/* green burst on lock */}
                {lockBurst && (
                  <motion.svg
                    width={120}
                    height={120}
                    viewBox="0 0 120 120"
                    initial={{ scale: 0.4, opacity: 1 }}
                    animate={{ scale: 1.6, opacity: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ position: "absolute", pointerEvents: "none" }}
                  >
                    {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                      <line
                        key={a}
                        x1={60 + 22 * Math.cos((a * Math.PI) / 180)}
                        y1={60 + 22 * Math.sin((a * Math.PI) / 180)}
                        x2={60 + 42 * Math.cos((a * Math.PI) / 180)}
                        y2={60 + 42 * Math.sin((a * Math.PI) / 180)}
                        stroke="#6fe89b"
                        strokeWidth={5}
                        strokeLinecap="round"
                      />
                    ))}
                  </motion.svg>
                )}
              </div>
            </motion.div>

            {/* "Tap the door!" bubble */}
            <AnimatePresence>
              {phase === "ready" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -8, 0] }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={reduce ? undefined : { y: { duration: 1.2, repeat: Infinity }, opacity: { duration: 0.3 } }}
                  style={{
                    position: "absolute",
                    left: 618,
                    top: 6,
                    padding: "7px 16px",
                    borderRadius: 999,
                    background: "linear-gradient(180deg, #6fe89b, #34d399)",
                    color: "#07130c",
                    fontSize: 14,
                    fontWeight: 900,
                    boxShadow: "0 8px 20px rgba(52,211,153,0.4)",
                    pointerEvents: "none",
                    zIndex: 12,
                  }}
                >
                  Tap the door to head out!
                </motion.div>
              )}
            </AnimatePresence>

            {/* "Tap the lock!" bubble */}
            <AnimatePresence>
              {phase === "lock" && !lockShut && (
                <motion.div
                  initial={{ opacity: 0, x: -12 }}
                  animate={reduce ? { opacity: 1, x: 0 } : { opacity: 1, x: [0, 8, 0] }}
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                  transition={reduce ? undefined : { x: { duration: 1.1, repeat: Infinity }, opacity: { duration: 0.3 } }}
                  style={{
                    position: "absolute",
                    left: 468,
                    top: 372,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "7px 16px",
                    borderRadius: 999,
                    background: "linear-gradient(180deg, #6fe89b, #34d399)",
                    color: "#07130c",
                    fontSize: 14,
                    fontWeight: 900,
                    boxShadow: "0 8px 20px rgba(52,211,153,0.4)",
                    pointerEvents: "none",
                    zIndex: 12,
                  }}
                >
                  <span>Tap the lock!</span>
                  <svg width={20} height={14} viewBox="0 0 20 14">
                    <path
                      d="M2 7 h12 M9 2 l6 5 -6 5"
                      stroke="#07130c"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* soft green wash once locked */}
            <AnimatePresence>
              {phase === "won" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2 }}
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "radial-gradient(circle at 78% 40%, rgba(52,211,153,0.22) 0%, transparent 60%)",
                    pointerEvents: "none",
                    zIndex: 8,
                  }}
                />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* toast */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 14,
          display: "flex",
          justifyContent: "center",
          pointerEvents: "none",
          zIndex: 35,
        }}
      >
        <AnimatePresence mode="wait">
          {toast && (
            <motion.div
              key={toast.key}
              initial={{ y: 24, opacity: 0, scale: 0.94 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 26 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                maxWidth: "min(92%, 560px)",
                padding: "10px 18px",
                borderRadius: 16,
                background:
                  toast.tone === "green"
                    ? "linear-gradient(180deg, #10402c, #0c3323)"
                    : toast.tone === "amber"
                      ? "linear-gradient(180deg, #45300e, #38260a)"
                      : toast.tone === "soft"
                        ? "linear-gradient(180deg, #1d2a55, #172246)"
                        : "linear-gradient(180deg, #10314a, #0c2739)",
                border:
                  toast.tone === "green"
                    ? "2px solid rgba(52,211,153,0.8)"
                    : toast.tone === "amber"
                      ? "2px solid rgba(255,179,71,0.85)"
                      : toast.tone === "soft"
                        ? "2px solid rgba(140,170,255,0.7)"
                        : "2px solid rgba(34,211,238,0.7)",
                boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
              }}
            >
              <PixIcon
                emoji={
                  toast.tone === "green" ? "✅" : toast.tone === "amber" ? "👀" : toast.tone === "soft" ? "✨" : "👆"
                }
                size={26}
              />
              <div>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color:
                      toast.tone === "green"
                        ? "#8ff5c0"
                        : toast.tone === "amber"
                          ? "#ffd9a1"
                          : toast.tone === "soft"
                            ? "#cdd9ff"
                            : "#9fe8ff",
                  }}
                >
                  {toast.title}
                </div>
                {toast.body && (
                  <div style={{ fontSize: 13, color: "#dfe7ff", marginTop: 1 }}>{toast.body}</div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* intro */}
      {phase === "intro" && (
        <IntroOverlay
          narration={narration}
          accent={accent}
          onStart={() => {
            setPhase("sweep");
            showToast("hint", "Flick it down!", "Press the top card and swipe it down fast.");
          }}
        />
      )}

      {/* win banner */}
      {phase === "won" && <WinBanner onFinish={finish} />}
    </ExerciseFrame>
  );
}

/* ------------------------------------------------------------------ */
/* Pieces                                                             */
/* ------------------------------------------------------------------ */

/** One chip per card + count. A chip flips back open when the goblin strikes. */
function ProgressHud({
  loggedOut,
  count,
}: {
  loggedOut: Record<CardId, boolean>;
  count: number;
}) {
  const order: CardId[] = ["game", "message", "photos"];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 6 }}>
        {order.map((id) => {
          const done = loggedOut[id];
          return (
            <div
              key={id}
              title={CARD_META[id].label}
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 13,
                fontWeight: 900,
                color: done ? "#0c2b1c" : "rgba(207,230,255,0.55)",
                background: done
                  ? "linear-gradient(180deg, #6fe89b, #34d399)"
                  : "rgba(10,18,44,0.7)",
                border: done ? "2px solid #a7f6c8" : `2px solid ${CARD_META[id].hudColor}66`,
                boxShadow: done ? "0 0 10px rgba(110,255,170,0.5)" : undefined,
                transition: "all 0.3s ease",
              }}
            >
              {done ? "✓" : "!"}
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 13, fontWeight: 800, color: "#cfe6ff" }}>{count} of 3 logged out</div>
    </div>
  );
}

/** One muted background locker, scenery only. */
function BgLocker({ x, even }: { x: number; even: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 30,
        width: 112,
        height: 400,
        borderRadius: 10,
        background: even
          ? "linear-gradient(180deg, #3a4173, #313763)"
          : "linear-gradient(180deg, #363c6d, #2d335e)",
        border: "2px solid rgba(20,24,52,0.5)",
      }}
    >
      {[24, 40].map((y) => (
        <div
          key={y}
          style={{
            position: "absolute",
            left: "50%",
            top: y,
            transform: "translateX(-50%)",
            width: 64,
            height: 7,
            borderRadius: 4,
            background: "rgba(15,18,40,0.55)",
          }}
        />
      ))}
      {/* dial */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: 200,
          transform: "translateX(-50%)",
          width: 26,
          height: 26,
          borderRadius: "50%",
          background: "#252a52",
          border: "3px solid rgba(140,150,220,0.4)",
        }}
      />
    </div>
  );
}

/** The visual face of an open app card. */
function CardFace({ id, reduce }: { id: CardId; reduce: boolean }) {
  if (id === "game") {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            padding: "9px 14px",
            background: "linear-gradient(90deg, #7c5cff, #5b3fd6)",
            color: "#f2edff",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 1.5,
          }}
        >
          BLASTO BOTS
        </div>
        <div
          style={{
            flex: 1,
            position: "relative",
            background: "linear-gradient(180deg, #1b1440 0%, #241a58 100%)",
            overflow: "hidden",
          }}
        >
          {[
            { x: 30, y: 24 },
            { x: 200, y: 40 },
            { x: 120, y: 90 },
            { x: 218, y: 130 },
            { x: 44, y: 128 },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: s.x,
                top: s.y,
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: "#dfe9ff",
                opacity: 0.8,
              }}
            />
          ))}
          {/* rocket */}
          <svg width={70} height={90} viewBox="0 0 70 90" style={{ position: "absolute", left: 92, top: 36 }}>
            <path d="M35 4 C48 20, 50 44, 44 62 L26 62 C20 44, 22 20, 35 4 Z" fill="#e8ecff" stroke="#8b96d6" strokeWidth={2.5} />
            <circle cx={35} cy={32} r={8} fill="#41e6ff" stroke="#2b6f8f" strokeWidth={2} />
            <path d="M26 56 L12 74 L26 68 Z" fill="#ff5f6b" />
            <path d="M44 56 L58 74 L44 68 Z" fill="#ff5f6b" />
            <path d="M30 64 L35 84 L40 64 Z" fill="#ffb347" />
          </svg>
          <div
            style={{
              position: "absolute",
              left: 14,
              top: 12,
              fontSize: 12,
              fontWeight: 900,
              color: "#ffd166",
              letterSpacing: 1,
            }}
          >
            SCORE 4200
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 14px",
            background: "#eef1ff",
            borderTop: "2px solid #ccd6f6",
          }}
        >
          <motion.span
            animate={reduce ? undefined : { opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.4, repeat: Infinity }}
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#34d399",
              boxShadow: "0 0 6px rgba(52,211,153,0.8)",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12.5, fontWeight: 900, color: "#2b2f55", letterSpacing: 0.5 }}>
            LOGGED IN AS: YOU
          </span>
        </div>
      </div>
    );
  }

  if (id === "message") {
    return (
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "9px 14px",
            background: "linear-gradient(90deg, #22b8c9, #1690a0)",
            color: "#eafcff",
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: 1.5,
          }}
        >
          <PixIcon emoji="💬" size={18} />
          <span>MESSAGE</span>
        </div>
        <div style={{ flex: 1, padding: "12px 16px", background: "#fdfefe" }}>
          <div style={{ fontSize: 13.5, fontWeight: 900, color: "#2b2f55", marginBottom: 12 }}>
            To: Grandma
          </div>
          {[190, 160, 120].map((w, i) => (
            <div
              key={i}
              style={{
                width: w,
                height: 11,
                borderRadius: 6,
                background: "#c8d2e8",
                marginBottom: 10,
              }}
            />
          ))}
          <div style={{ display: "flex", alignItems: "center" }}>
            <div style={{ width: 64, height: 11, borderRadius: 6, background: "#c8d2e8" }} />
            <motion.div
              animate={reduce ? undefined : { opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ width: 3, height: 16, background: "#22b8c9", marginLeft: 4, borderRadius: 2 }}
            />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "8px 14px",
            background: "#eef1ff",
            borderTop: "2px solid #ccd6f6",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ffb347",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 12.5, fontWeight: 900, color: "#2b2f55", letterSpacing: 0.5 }}>
            HALF-WRITTEN
          </span>
        </div>
      </div>
    );
  }

  /* photos */
  return (
    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column" }}>
      <div
        style={{
          padding: "9px 14px",
          background: "linear-gradient(90deg, #ff5f9e, #e0407e)",
          color: "#fff0f6",
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: 1.5,
        }}
      >
        MY PHOTOS
      </div>
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 8,
          padding: 12,
          background: "#fdfefe",
        }}
      >
        {/* sunny hill photo */}
        <div style={{ borderRadius: 10, overflow: "hidden", position: "relative", background: "#9fd8ff" }}>
          <svg viewBox="0 0 70 70" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
            <circle cx={50} cy={18} r={10} fill="#ffd166" />
            <path d="M0 70 L26 34 L46 70 Z" fill="#5cb85c" />
            <path d="M28 70 L52 44 L70 70 Z" fill="#4a9e4a" />
          </svg>
        </div>
        {/* smiley selfie */}
        <div
          style={{
            borderRadius: 10,
            background: "linear-gradient(135deg, #ffd9a1, #ff9f68)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={34} height={34} viewBox="0 0 34 34">
            <circle cx={17} cy={17} r={13} fill="#fff5e6" />
            <circle cx={12.5} cy={14} r={2} fill="#2b2f55" />
            <circle cx={21.5} cy={14} r={2} fill="#2b2f55" />
            <path d="M11 20 q6 6 12 0" stroke="#2b2f55" strokeWidth={2.4} fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ borderRadius: 10, background: "linear-gradient(135deg, #b79cff, #7c5cff)" }} />
        <div style={{ borderRadius: 10, background: "linear-gradient(135deg, #7df0ff, #41c8e6)" }} />
        {/* cat photo */}
        <div
          style={{
            borderRadius: 10,
            background: "linear-gradient(135deg, #d3ddff, #aab8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width={36} height={32} viewBox="0 0 36 32">
            <path d="M6 12 L4 2 L12 8 Z" fill="#8a6bb8" />
            <path d="M30 12 L32 2 L24 8 Z" fill="#8a6bb8" />
            <circle cx={18} cy={18} r={12} fill="#9d7fd0" />
            <circle cx={13} cy={16} r={2} fill="#241a40" />
            <circle cx={23} cy={16} r={2} fill="#241a40" />
            <path d="M15 22 q3 3 6 0" stroke="#241a40" strokeWidth={2} fill="none" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ borderRadius: 10, background: "linear-gradient(135deg, #ff9fce, #ff5f9e)" }} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          padding: "8px 14px",
          background: "#eef1ff",
          borderTop: "2px solid #ccd6f6",
        }}
      >
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "#ff5f9e",
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 12.5, fontWeight: 900, color: "#2b2f55", letterSpacing: 0.5 }}>
          YOUR PICTURES
        </span>
      </div>
    </div>
  );
}

/** Bouncing "flick down" affordance on the top card. */
function FlickHint({ reduce }: { reduce: boolean }) {
  return (
    <motion.div
      animate={reduce ? undefined : { y: [0, 12, 0], opacity: [0.95, 0.5, 0.95] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      style={{
        position: "absolute",
        left: "50%",
        top: 96,
        transform: "translateX(-50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          padding: "5px 13px",
          borderRadius: 999,
          background: "rgba(16,22,54,0.85)",
          border: "2px solid rgba(125,240,255,0.7)",
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: 1.5,
          color: "#9fe8ff",
        }}
      >
        FLICK DOWN
      </div>
      <svg width={30} height={34} viewBox="0 0 30 34">
        <path
          d="M15 3 v20 M6 15 l9 11 9-11"
          stroke="#9fe8ff"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
}

/** Sneaky green goblin arm, reaching in from the left. */
function GoblinPaw() {
  return (
    <svg width={300} height={96} viewBox="0 0 300 96" style={{ display: "block", filter: "drop-shadow(0 6px 10px rgba(0,0,0,0.4))" }}>
      {/* arm */}
      <rect x={0} y={34} width={228} height={30} rx={15} fill="#68c94f" stroke="#3d8f2c" strokeWidth={3} />
      {/* sleeve cuff */}
      <rect x={40} y={28} width={20} height={42} rx={8} fill="#3d2a63" stroke="#241a40" strokeWidth={2.5} />
      {/* palm */}
      <circle cx={236} cy={49} r={26} fill="#68c94f" stroke="#3d8f2c" strokeWidth={3} />
      {/* fingers with little claws */}
      <g fill="#68c94f" stroke="#3d8f2c" strokeWidth={2.5}>
        <rect x={248} y={18} width={38} height={15} rx={7.5} transform="rotate(-18 248 18)" />
        <rect x={254} y={42} width={42} height={15} rx={7.5} />
        <rect x={248} y={66} width={36} height={15} rx={7.5} transform="rotate(16 248 66)" />
      </g>
      <g fill="#e8ecff">
        <path d="M288 6 l9 3 -7 6 Z" />
        <path d="M296 46 l9 4 -8 6 Z" />
        <path d="M286 82 l9 1 -6 7 Z" />
      </g>
      {/* warts, because goblin */}
      <circle cx={120} cy={42} r={3.5} fill="#3d8f2c" />
      <circle cx={170} cy={56} r={3} fill="#3d8f2c" />
    </svg>
  );
}

/** The door's status light. */
function DoorLight({ light, reduce }: { light: "off" | "amber" | "green"; reduce: boolean }) {
  const color = light === "green" ? "#34d399" : light === "amber" ? "#ffb347" : "#39406e";
  const glow =
    light === "green"
      ? "rgba(52,211,153,0.9)"
      : light === "amber"
        ? "rgba(255,179,71,0.9)"
        : "rgba(0,0,0,0)";
  return (
    <motion.div
      animate={
        light !== "off" && !reduce
          ? { boxShadow: [`0 0 6px ${glow}`, `0 0 22px ${glow}`, `0 0 6px ${glow}`] }
          : { boxShadow: light !== "off" ? `0 0 12px ${glow}` : "none" }
      }
      transition={light !== "off" && !reduce ? { duration: 1.2, repeat: Infinity } : undefined}
      style={{
        position: "absolute",
        left: "50%",
        top: 16,
        transform: "translateX(-50%)",
        width: 32,
        height: 32,
        borderRadius: "50%",
        background: color,
        border: "3px solid rgba(20,24,52,0.6)",
      }}
    />
  );
}

/** The big padlock on the locker hasp. */
function Padlock({ shut, armed }: { shut: boolean; armed: boolean }) {
  const body = shut ? "#34d399" : armed ? "#dbe2fb" : "#9aa3cf";
  const stroke = shut ? "#0f7a52" : "#6a749f";
  return (
    <svg width={72} height={80} viewBox="0 0 72 80" style={{ display: "block" }}>
      {/* shackle: raised while open, seated when shut */}
      <motion.g animate={{ y: shut ? 7 : 0 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
        <path
          d="M22 34 v-9 a14 14 0 0 1 28 0 v9"
          fill="none"
          stroke={shut ? "#0f7a52" : "#7a86bb"}
          strokeWidth={9}
          strokeLinecap="round"
        />
      </motion.g>
      <rect x={11} y={36} width={50} height={38} rx={11} fill={body} stroke={stroke} strokeWidth={3.5} />
      {shut ? (
        <path
          d="M26 55 l7 7 13 -14"
          stroke="#0c3323"
          strokeWidth={5}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      ) : (
        <>
          <circle cx={36} cy={52} r={5.5} fill="#39406e" />
          <rect x={33.2} y={54} width={5.6} height={11} rx={2.5} fill="#39406e" />
        </>
      )}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Overlays                                                           */
/* ------------------------------------------------------------------ */

function IntroOverlay({
  onStart,
  narration,
  accent,
}: {
  onStart: () => void;
  narration?: { speaker?: "adam" | "layla"; lines: string[] };
  accent?: string;
}) {
  const rows: { color: string; text: string }[] = [
    { color: "#7df0ff", text: "FLICK every open card down to log it out" },
    { color: "#ffb347", text: "AMBER locker light means something is still open" },
    { color: "#8ff5c0", text: "GREEN means safe: shut the locker and tap the lock" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        background: "rgba(9,12,30,0.82)",
      }}
    >
      <motion.div
        initial={{ y: 24, scale: 0.96 }}
        animate={{ y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        style={{
          width: "min(100%, 500px)",
          borderRadius: 24,
          padding: "26px 28px",
          background: "linear-gradient(180deg, #171d44, #121737)",
          border: "1px solid rgba(125,240,255,0.35)",
          boxShadow: "0 30px 60px rgba(0,0,0,0.45)",
          textAlign: "center",
          // The spoken-instruction block makes the intro taller; on short
          // viewports the card scrolls internally so the start button is
          // always reachable (never clipped by the centered overlay).
          maxHeight: "100%",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10 }}>
          <PixIcon emoji="🎮" size={34} />
          <PixIcon emoji="🔒" size={34} />
        </div>
        <div style={{ fontSize: 27, fontWeight: 900, color: "#eaf2ff", marginBottom: 8 }}>
          The Log-Out Flick
        </div>
        <div style={{ fontSize: 15, lineHeight: 1.5, color: "#c6d3f7", marginBottom: 16 }}>
          Break is over, hero! This <b style={{ color: "#9fe8ff" }}>shared tablet</b> is covered in
          YOUR open cards, and anyone could pick it up next. Time for the sweep:
        </div>
        <div style={{ display: "grid", gap: 8, marginBottom: 16, textAlign: "left" }}>
          {rows.map((r) => (
            <div
              key={r.text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "8px 12px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                fontSize: 14,
                fontWeight: 700,
                color: "#dfe7ff",
              }}
            >
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: r.color,
                  boxShadow: `0 0 8px ${r.color}`,
                  flexShrink: 0,
                }}
              />
              {r.text}
            </div>
          ))}
        </div>
        <div style={{ fontSize: 14, color: "#aebadf", marginBottom: 18 }}>
          Hero rule: before you walk away, always look back and check one more time.
        </div>
        {narration && narration.lines.length > 0 && (
          <div style={{ textAlign: "left" }}>
            <InfoNarration lines={narration.lines} accent={accent ?? "#62b6cb"} />
          </div>
        )}
        <button
          onClick={onStart}
          style={{
            fontSize: 19,
            fontWeight: 900,
            padding: "14px 40px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            color: "#07130c",
            background: "linear-gradient(180deg, #6fe89b, #34d399)",
            boxShadow: "0 10px 26px rgba(52,211,153,0.4)",
            fontFamily: "inherit",
          }}
        >
          Start the sweep
        </button>
      </motion.div>
    </motion.div>
  );
}

function WinBanner({ onFinish }: { onFinish: () => void }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 22,
        display: "flex",
        justifyContent: "center",
        zIndex: 45,
        pointerEvents: "none",
      }}
    >
      <motion.div
        initial={{ y: 46, opacity: 0, scale: 0.95 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 220, damping: 22 }}
        style={{
          pointerEvents: "auto",
          width: "min(92%, 520px)",
          borderRadius: 22,
          padding: "20px 26px",
          textAlign: "center",
          background: "linear-gradient(180deg, #0d3a2a, #0a2e21)",
          border: "2px solid rgba(52,211,153,0.75)",
          boxShadow: "0 24px 60px rgba(0,0,0,0.5), 0 0 30px rgba(52,211,153,0.25)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 6 }}>
          <PixIcon emoji="⭐" size={26} />
          <PixIcon emoji="🔒" size={26} />
          <PixIcon emoji="⭐" size={26} />
        </div>
        <div style={{ fontSize: 24, fontWeight: 900, color: "#8ff5c0", letterSpacing: 1 }}>
          LOCKED AND SAFE!
        </div>
        <div style={{ fontSize: 14.5, color: "#d9f5e6", margin: "8px 0 16px", lineHeight: 1.5 }}>
          You closed every card, logged out, locked up, and <b>checked again</b> when the goblin got
          sneaky. That is the shared-device sweep. Do it every single time you hand a device back!
        </div>
        <button
          onClick={onFinish}
          style={{
            fontSize: 18,
            fontWeight: 900,
            padding: "12px 44px",
            borderRadius: 999,
            border: "none",
            cursor: "pointer",
            color: "#07130c",
            background: "linear-gradient(180deg, #6fe89b, #34d399)",
            boxShadow: "0 10px 26px rgba(52,211,153,0.45)",
            fontFamily: "inherit",
          }}
        >
          Finish
        </button>
      </motion.div>
    </div>
  );
}
