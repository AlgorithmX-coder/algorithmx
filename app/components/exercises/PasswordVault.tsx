"use client";

/**
 * Password Vault - flagship first-person guided scene.
 *
 * Cinematic vault door with 5 glowing locks. Each lock teaches one of
 * the 5 password rules. Tapping a lock pans the camera to it and
 * pops a 2D challenge panel overlaid on the scene. Wrong answers
 * pause and teach via WrongAnswerPanel. Correct answers activate
 * the lock with a juicy clunk + spark animation.
 *
 * When all 5 locks are active, the vault enters a multi-stage open
 * sequence:
 *
 *   armed (300ms)         - door pulses gold, rumble starts
 *   anticipation (900ms)  - small shake, beams shoot from each lock to centre
 *   unlocking (600ms)     - bigger shake, white seam crack, metallic CLANG
 *   opening (1000ms)      - door halves swing outward, multi-burst confetti
 *   revealed              - camera pushes into the vault interior, the floating
 *                           PASSWORD MASTER shield appears with 5 rule glyphs
 *                           orbiting it, "VAULT MASTER!" headline and Continue
 *
 * Reusable scene template: hotspot + 2D-overlay-panel + camera-pan
 * is the pattern Phish Inspector v2, Account Rescue v2 and BossBattle
 * scene work can all adopt. The state machine here is the cleanest
 * example of how to drive a multi-stage cinematic with comfort-mode
 * safety.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import confetti from "canvas-confetti";
import {
  useExerciseFeedback,
  useGameAudio,
  useMotionIntensity,
} from "@/app/lib/gameEngine";
import ExerciseFrame from "@/app/components/lesson/ExerciseFrame";
import GameButton from "@/app/components/lesson/GameButton";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";

export interface PasswordVaultLock {
  id: string;
  ruleLabel: string;
  icon: string;
  prompt: string;
  choices: {
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
  speaker?: "adam" | "layla";
}

export interface PasswordVaultProps {
  locks: PasswordVaultLock[];
  guidance?: {
    intro?: string;
    progress?: string;
    complete?: string;
  };
  onComplete: (score: number) => void;
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;
}

/* ────────────────────────────────────────────────────────────── */
/* Geometry                                                       */
/* ────────────────────────────────────────────────────────────── */

const LOCK_POSITIONS: Record<string, { x: number; y: number }> = {
  length:   { x: -28, y: -22 },
  mix:      { x:  28, y: -22 },
  personal: { x:   0, y:   0 },
  common:   { x: -28, y:  22 },
  secret:   { x:  28, y:  22 },
};

type LockState = "idle" | "active";
type CameraMode = { kind: "overview" } | { kind: "focus"; lockId: string };

/** Multi-stage open sequence. Driving state for the whole climax. */
type OpenStage =
  | "closed"
  | "armed"
  | "anticipation"
  | "unlocking"
  | "opening"
  | "revealed";

const DOOR_SIZE = 520;
const ZOOM_FACTOR = 1.75;

/* Stage durations (ms) at intensity 1. Scaled down by motion intensity. */
const STAGE_MS = {
  armed: 360,
  anticipation: 900,
  unlocking: 620,
  opening: 1050,
} as const;

/* ────────────────────────────────────────────────────────────── */
/* Component                                                      */
/* ────────────────────────────────────────────────────────────── */

export default function PasswordVault({
  locks,
  guidance,
  onComplete,
  onCorrect,
  onWrong,
  onHintReached,
  onAnswered,
}: PasswordVaultProps) {
  const audio = useGameAudio();
  const fx = useExerciseFeedback();
  const intensity = useMotionIntensity();

  const [lockStates, setLockStates] = useState<Record<string, LockState>>(() =>
    Object.fromEntries(locks.map((l) => [l.id, "idle"])) as Record<
      string,
      LockState
    >
  );
  const [camera, setCamera] = useState<CameraMode>({ kind: "overview" });
  const [wrong, setWrong] = useState<null | {
    lockId: string;
    explanation: string;
    speaker?: "adam" | "layla";
  }>(null);
  const [doorReject, setDoorReject] = useState(0); // increments to trigger red-pulse animation
  const [openStage, setOpenStage] = useState<OpenStage>("closed");
  const [showRevealUI, setShowRevealUI] = useState(false);
  const [wrongCountByLock, setWrongCountByLock] = useState<
    Record<string, number>
  >({});
  const [recentlyActivated, setRecentlyActivated] = useState<string | null>(
    null
  );

  const activeCount = useMemo(
    () => Object.values(lockStates).filter((s) => s === "active").length,
    [lockStates]
  );
  const allActive = activeCount === locks.length;
  const hintFiredRef = useRef<Set<number>>(new Set());
  const vaultLocked = openStage !== "closed";

  // Narrow viewport → bottom-sheet challenge panel; wide → side card.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 760);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  /* ───────── Camera transform ───────── */
  const transitionMs = intensity === 0 ? 0 : intensity < 1 ? 280 : 620;
  const cameraStyle: CSSProperties = useMemo(() => {
    // Open-sequence camera path: progressively push in toward the centre
    // of the door, then "through" it on reveal. Overrides any focused
    // lock once the climax starts.
    if (openStage !== "closed") {
      const stageScale: Record<OpenStage, number> = {
        closed: 1,
        armed: 1.12,
        anticipation: 1.22,
        unlocking: 1.32,
        opening: 1.4,
        revealed: 1.78,
      };
      const dur = intensity === 0 ? 0 : 720;
      return {
        transform: `scale(${stageScale[openStage]}) translate(0px, 0px)`,
        transition: `transform ${dur}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }
    if (camera.kind === "overview") {
      return {
        transform: "scale(1) translate(0px, 0px)",
        transition: `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      };
    }
    const pos = LOCK_POSITIONS[camera.lockId] ?? { x: 0, y: 0 };
    const tx = (-pos.x / 100) * DOOR_SIZE * ZOOM_FACTOR;
    const ty = (-pos.y / 100) * DOOR_SIZE * ZOOM_FACTOR;
    return {
      transform: `scale(${ZOOM_FACTOR}) translate(${tx}px, ${ty}px)`,
      transition: `transform ${transitionMs}ms cubic-bezier(0.22, 1, 0.36, 1)`,
    };
  }, [camera, transitionMs, openStage, intensity]);

  /* ───────── Lock interaction ───────── */
  const handleLockTap = useCallback(
    (lockId: string) => {
      if (vaultLocked) return;
      if (lockStates[lockId] === "active") {
        audio.tap();
        setCamera({ kind: "focus", lockId });
        return;
      }
      audio.select();
      setCamera({ kind: "focus", lockId });
    },
    [audio, lockStates, vaultLocked]
  );

  const handleClosePanel = useCallback(() => {
    audio.back();
    setCamera({ kind: "overview" });
  }, [audio]);

  const handleChoice = useCallback(
    (lockId: string, choiceIdx: number) => {
      const lock = locks.find((l) => l.id === lockId);
      if (!lock) return;
      const choice = lock.choices[choiceIdx];
      if (!choice) return;
      const correctIdx = lock.choices.findIndex((c) => c.isCorrect);
      const wasCorrect = choice.isCorrect;

      onAnswered?.({
        questionKey: `vault-${lock.id}`,
        selectedIndex: choiceIdx,
        correctIndex: correctIdx,
        wasCorrect,
      });

      if (wasCorrect) {
        onCorrect?.();
        fx.correct({ xp: 30, text: `${lock.ruleLabel} ✓` });
        audio.unlock();
        setLockStates((prev) => ({ ...prev, [lockId]: "active" }));
        setRecentlyActivated(lockId);
        window.setTimeout(() => setRecentlyActivated(null), 900);
        window.setTimeout(() => setCamera({ kind: "overview" }), 650);
      } else {
        onWrong?.();
        const newCount = (wrongCountByLock[lockId] ?? 0) + 1;
        setWrongCountByLock((prev) => ({ ...prev, [lockId]: newCount }));
        setDoorReject((n) => n + 1);
        if (newCount === 2 && !hintFiredRef.current.has(1)) {
          hintFiredRef.current.add(1);
          onHintReached?.(1);
        } else if (newCount === 4 && !hintFiredRef.current.has(2)) {
          hintFiredRef.current.add(2);
          onHintReached?.(2);
        }
        setWrong({
          lockId,
          explanation: choice.explanation,
          speaker: lock.speaker ?? "layla",
        });
      }
    },
    [
      locks,
      onAnswered,
      onCorrect,
      onWrong,
      onHintReached,
      fx,
      audio,
      wrongCountByLock,
    ]
  );

  /* ───────── Open-sequence state machine ───────── */
  useEffect(() => {
    if (!allActive || openStage !== "closed") return;

    // Cinematic scaling under comfort mode: keep the same beats but
    // tighter so the moment isn't dragged out for reduced-motion users.
    const scale = intensity === 0 ? 0.2 : intensity < 1 ? 0.55 : 1;
    const t = (ms: number) => Math.max(60, Math.round(ms * scale));

    audio.bossPhaseChange();
    setCamera({ kind: "overview" });
    setOpenStage("armed");

    const timers: number[] = [];
    timers.push(
      window.setTimeout(() => {
        setOpenStage("anticipation");
        // Five lock chimes shoot in sequence as the beams reach centre.
        for (let i = 0; i < locks.length; i++) {
          timers.push(
            window.setTimeout(() => {
              audio.starEarned();
            }, i * t(120))
          );
        }
      }, t(STAGE_MS.armed))
    );
    timers.push(
      window.setTimeout(
        () => {
          setOpenStage("unlocking");
          audio.bossHit();
        },
        t(STAGE_MS.armed) + t(STAGE_MS.anticipation)
      )
    );
    timers.push(
      window.setTimeout(
        () => {
          setOpenStage("opening");
          audio.victory();
          // Multi-burst confetti during the door swing.
          fireBurst(0.5, 0.55, 90 * intensity, 110);
          window.setTimeout(
            () => fireBurst(0.25, 0.5, 60 * intensity, 90),
            220
          );
          window.setTimeout(
            () => fireBurst(0.75, 0.5, 60 * intensity, 90),
            260
          );
          window.setTimeout(
            () => fireBurst(0.5, 0.4, 70 * intensity, 100),
            520
          );
        },
        t(STAGE_MS.armed) + t(STAGE_MS.anticipation) + t(STAGE_MS.unlocking)
      )
    );
    timers.push(
      window.setTimeout(
        () => {
          setOpenStage("revealed");
          audio.badgeEarned();
          onAnswered?.({
            questionKey: "vault-opened",
            selectedIndex: 0,
            correctIndex: 0,
            wasCorrect: true,
          });
        },
        t(STAGE_MS.armed) +
          t(STAGE_MS.anticipation) +
          t(STAGE_MS.unlocking) +
          t(STAGE_MS.opening)
      )
    );
    timers.push(
      window.setTimeout(
        () => {
          setShowRevealUI(true);
          fx.unlock({ xp: 100, text: "VAULT MASTER!" });
        },
        t(STAGE_MS.armed) +
          t(STAGE_MS.anticipation) +
          t(STAGE_MS.unlocking) +
          t(STAGE_MS.opening) +
          t(420)
      )
    );

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allActive]);

  const focusedLock = useMemo(() => {
    if (camera.kind !== "focus") return null;
    return locks.find((l) => l.id === camera.lockId) ?? null;
  }, [camera, locks]);

  const guidanceMessage = vaultLocked
    ? openStage === "revealed"
      ? guidance?.complete ?? "VAULT OPEN - the Raccoon can't get in!"
      : openStage === "unlocking"
        ? "ACCESS GRANTED"
        : "Opening..."
    : activeCount === 0
      ? guidance?.intro ?? "Tap a glowing lock to begin."
      : activeCount === locks.length - 1
        ? "One lock left!"
        : guidance?.progress ??
          `${activeCount} of ${locks.length} locks unlocked.`;

  // Shake intensity by stage (matches CSS keyframes below).
  const shakeClass =
    openStage === "anticipation"
      ? "vault-shake-md"
      : openStage === "unlocking"
        ? "vault-shake-lg"
        : "";

  return (
    <ExerciseFrame
      maxWidth={1100}
      aspectRatio={{ w: 16, h: 9 }}
      reserve={210}
      background="radial-gradient(ellipse at 50% 30%, #1f2451 0%, #0c1230 45%, #04050d 100%)"
      padding={0}
      touchActionNone
    >
      <SceneStyles />

      {/* Guidance ribbon */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
          padding: "8px 18px",
          borderRadius: 999,
          background: vaultLocked
            ? "rgba(35, 24, 9, 0.85)"
            : "rgba(15, 21, 48, 0.78)",
          border: vaultLocked
            ? "1px solid rgba(253, 224, 71, 0.55)"
            : "1px solid rgba(125, 240, 255, 0.32)",
          backdropFilter: "blur(8px)",
          fontFamily: "'Space Grotesk', sans-serif",
          fontSize: 13,
          fontWeight: 700,
          letterSpacing: "0.02em",
          color: vaultLocked ? "#fde047" : "#bfeaff",
          textShadow: vaultLocked
            ? "0 0 14px rgba(253,224,71,0.65)"
            : undefined,
          maxWidth: "92%",
          textAlign: "center",
          transition: "background 240ms ease, border-color 240ms ease",
        }}
        aria-live="polite"
      >
        {guidanceMessage}
      </div>

      {/* Progress pips */}
      <div
        style={{
          position: "absolute",
          top: 56,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 30,
          display: "flex",
          gap: 6,
        }}
        aria-label={`${activeCount} of ${locks.length} locks open`}
      >
        {locks.map((l) => {
          const on = lockStates[l.id] === "active";
          return (
            <span
              key={l.id}
              style={{
                width: 22,
                height: 6,
                borderRadius: 3,
                background: on
                  ? "linear-gradient(90deg, #7eff97, #00e5ff)"
                  : "rgba(255,255,255,0.15)",
                boxShadow: on ? "0 0 8px rgba(126,255,151,0.55)" : "none",
                transition: "background 240ms ease",
              }}
            />
          );
        })}
      </div>

      {/* Scene viewport */}
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "16 / 9",
          overflow: "hidden",
          perspective: 1400,
        }}
      >
        {/* Camera shake wrapper - CSS animation, no React updates */}
        <div
          className={shakeClass}
          style={{ position: "absolute", inset: 0 }}
        >
          {/* Camera zoom wrapper */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "50% 50%",
              willChange: "transform",
              ...cameraStyle,
            }}
          >
            <ChamberDecor />
            {/* Data streams behind the door (matrix feel) */}
            <DataStreams intensity={intensity} muted={vaultLocked} />

            {/* The vault door (and the interior beneath, only revealed
                once the door opens) */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: DOOR_SIZE,
                height: DOOR_SIZE,
                transform: "translate(-50%, -50%)",
              }}
            >
              <VaultInteriorReveal
                visible={openStage === "opening" || openStage === "revealed"}
                pushedIn={openStage === "revealed"}
                intensity={intensity}
              />
              <VaultDoor
                openStage={openStage}
                doorReject={doorReject}
                activeCount={activeCount}
                totalLocks={locks.length}
                intensity={intensity}
              >
                {/* Chain-of-light beams during anticipation */}
                {openStage === "anticipation" || openStage === "unlocking" ? (
                  <LockBeams locks={locks} intensity={intensity} />
                ) : null}

                {locks.map((lock) => (
                  <LockHotspot
                    key={lock.id}
                    lock={lock}
                    state={lockStates[lock.id] ?? "idle"}
                    focused={
                      camera.kind === "focus" && camera.lockId === lock.id
                    }
                    activatedJustNow={recentlyActivated === lock.id}
                    disabled={!!wrong || vaultLocked}
                    intensity={intensity}
                    onTap={() => handleLockTap(lock.id)}
                  />
                ))}
              </VaultDoor>
            </div>
          </div>
        </div>

        {/* White flash on the big CLANG (stage = unlocking) */}
        <AnimatePresence>
          {openStage === "unlocking" && (
            <motion.div
              key="vault-flash"
              initial={{ opacity: 0 }}
              animate={{ opacity: intensity === 0 ? 0.3 : 0.85 }}
              exit={{ opacity: 0 }}
              transition={{
                duration: intensity === 0 ? 0.12 : 0.24,
                ease: "easeOut",
              }}
              aria-hidden
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "radial-gradient(circle at center, #fff 0%, #fde047 30%, transparent 70%)",
                pointerEvents: "none",
                zIndex: 25,
                mixBlendMode: "screen",
              }}
            />
          )}
        </AnimatePresence>

        {/* Light burst on opening */}
        <AnimatePresence>
          {(openStage === "opening" || openStage === "revealed") && (
            <motion.div
              key="vault-burst"
              initial={{ opacity: 0, scale: 0.3 }}
              animate={{
                opacity: openStage === "revealed" ? 0.55 : 0.95,
                scale: 1.7,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: intensity === 0 ? 0.2 : 1.0 }}
              aria-hidden
              style={{
                position: "absolute",
                top: "48%",
                left: "50%",
                width: 760,
                height: 760,
                transform: "translate(-50%, -50%)",
                background:
                  "radial-gradient(circle at center, #fff8dc 0%, rgba(253,224,71,0.65) 22%, rgba(0,229,255,0.35) 50%, transparent 75%)",
                filter: "blur(32px)",
                pointerEvents: "none",
                zIndex: 15,
              }}
            />
          )}
        </AnimatePresence>

        {/* Challenge panel */}
        <AnimatePresence>
          {focusedLock && !vaultLocked && !wrong && (
            <ChallengePanel
              key={focusedLock.id}
              lock={focusedLock}
              alreadyActive={lockStates[focusedLock.id] === "active"}
              isNarrow={isNarrow}
              intensity={intensity}
              onChoose={(idx) => handleChoice(focusedLock.id, idx)}
              onClose={handleClosePanel}
            />
          )}
        </AnimatePresence>

        {/* Wrong panel */}
        <AnimatePresence>
          {wrong && (
            <motion.div
              key="wrong-bg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(5, 8, 22, 0.7)",
                backdropFilter: "blur(4px)",
                zIndex: 60,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
              }}
            >
              <WrongAnswerPanel
                title="Not quite!"
                explanation={wrong.explanation}
                speaker={wrong.speaker}
                onContinue={() => setWrong(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reveal UI (headline + continue) */}
        <AnimatePresence>
          {showRevealUI && (
            <motion.div
              key="reveal-ui"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 70,
                pointerEvents: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "flex-end",
                padding: "0 16px 22px",
              }}
            >
              <motion.div
                initial={
                  intensity === 0
                    ? { opacity: 0 }
                    : { opacity: 0, scale: 0.7, y: -12 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 240,
                  damping: 16,
                  delay: 0.05,
                }}
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontWeight: 900,
                  fontSize: "clamp(28px, 5vw, 46px)",
                  letterSpacing: "0.04em",
                  background:
                    "linear-gradient(135deg, #fde047 0%, #ff7a59 50%, #ff5fb3 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow: "0 0 32px rgba(253, 224, 71, 0.5)",
                  marginBottom: 12,
                  textAlign: "center",
                  filter: "drop-shadow(0 6px 24px rgba(253,224,71,0.4))",
                }}
              >
                VAULT MASTER!
              </motion.div>
              <div style={{ pointerEvents: "auto" }}>
                <GameButton
                  variant="primary"
                  size="lg"
                  icon="→"
                  onClick={() => onComplete(activeCount)}
                >
                  Claim your secrets
                </GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {fx.layer()}
      </div>
    </ExerciseFrame>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Helpers - confetti                                             */
/* ────────────────────────────────────────────────────────────── */

function fireBurst(originX: number, originY: number, count: number, vel: number) {
  try {
    confetti({
      particleCount: Math.max(8, Math.round(count)),
      spread: 100,
      startVelocity: vel,
      ticks: 130,
      gravity: 0.85,
      origin: { x: originX, y: originY },
      scalar: 1.05,
      colors: ["#fde047", "#7eff97", "#7df0ff", "#ff5fb3", "#ff7a59", "#a855f7"],
    });
  } catch {
    /* noop */
  }
}

/* ────────────────────────────────────────────────────────────── */
/* Scene atmosphere                                               */
/* ────────────────────────────────────────────────────────────── */

function ChamberDecor() {
  return (
    <>
      <div
        aria-hidden
        style={{
          position: "absolute",
          left: "-10%",
          right: "-10%",
          bottom: "-12%",
          height: "55%",
          background:
            "linear-gradient(180deg, rgba(15,21,48,0) 0%, rgba(15,21,48,0.85) 60%, rgba(0,0,0,0.95) 100%)",
          transform: "perspective(800px) rotateX(58deg) translateZ(-100px)",
          transformOrigin: "50% 100%",
          borderTop: "1px solid rgba(125,240,255,0.18)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "8%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "70%",
          height: "60%",
          background:
            "radial-gradient(ellipse at center, rgba(124,92,255,0.32) 0%, transparent 70%)",
          filter: "blur(10px)",
        }}
      />
      {(["left", "right"] as const).map((side) => (
        <div
          key={side}
          aria-hidden
          style={{
            position: "absolute",
            top: "10%",
            [side]: "3%",
            width: "5%",
            height: "78%",
            background:
              "linear-gradient(180deg, #1a2147 0%, #0a0e1f 50%, #1a2147 100%)",
            borderRadius: 6,
            boxShadow:
              "inset 0 0 0 1px rgba(125,240,255,0.18), 0 0 30px rgba(0,229,255,0.08)",
          }}
        />
      ))}
    </>
  );
}

function DataStreams({ intensity, muted }: { intensity: number; muted: boolean }) {
  if (intensity === 0) return null;
  // 6 thin vertical bands of falling characters behind the door for
  // ambient "data flowing" texture. Skipped at reduced-motion.
  const cols = [10, 22, 36, 64, 78, 90];
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        opacity: muted ? 0.08 : 0.18,
        transition: "opacity 360ms ease",
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {cols.map((leftPct, i) => (
        <div
          key={leftPct}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${leftPct}%`,
            width: 1,
            background:
              "linear-gradient(180deg, transparent, rgba(125,240,255,0.65) 30%, rgba(125,240,255,0.85) 50%, rgba(125,240,255,0.65) 70%, transparent)",
            filter: "blur(0.6px)",
            animation: `vaultStream ${4 + i * 0.6}s linear infinite`,
            animationDelay: `-${(i * 0.7) % 3}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* The door                                                       */
/* ────────────────────────────────────────────────────────────── */

function VaultDoor({
  openStage,
  doorReject,
  activeCount,
  totalLocks,
  intensity,
  children,
}: {
  openStage: OpenStage;
  doorReject: number;
  activeCount: number;
  totalLocks: number;
  intensity: number;
  children: React.ReactNode;
}) {
  const open = openStage === "opening" || openStage === "revealed";
  const armed = openStage === "armed";
  const swingDur = intensity === 0 ? 0.18 : 1.05;

  return (
    <>
      {/* Door frame (outer rim with caution stripes) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -28,
          borderRadius: 28,
          background:
            "linear-gradient(135deg, #3a4470 0%, #1a2147 40%, #2a3460 100%)",
          boxShadow:
            "0 30px 80px rgba(0,0,0,0.6), 0 0 0 2px rgba(125,240,255,0.22) inset",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -16,
          borderRadius: 22,
          background:
            "repeating-linear-gradient(45deg, rgba(253,224,71,0.5) 0 14px, rgba(15,21,48,0.85) 14px 28px)",
          opacity: 0.45,
          pointerEvents: "none",
        }}
      />

      {/* Wrong-answer reject pulse (red flash over the door area) */}
      {doorReject > 0 && (
        <span
          key={doorReject}
          aria-hidden
          style={{
            position: "absolute",
            inset: -28,
            borderRadius: 28,
            background:
              "radial-gradient(circle at center, rgba(239,68,68,0.6), transparent 70%)",
            pointerEvents: "none",
            mixBlendMode: "screen",
            animation: "vaultReject 480ms ease-out",
            zIndex: 4,
          }}
        />
      )}

      {/* Stencil label "VAULT 7 / TOP SECRET" along the top */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 9,
          letterSpacing: "0.32em",
          fontWeight: 800,
          color: "rgba(253,224,71,0.7)",
          background: "rgba(8,12,30,0.85)",
          padding: "2px 12px",
          borderRadius: 4,
          textTransform: "uppercase",
          zIndex: 2,
        }}
      >
        Vault 07 · Top Secret
      </div>

      {/* LED status panel (top centre) */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 18,
          left: "50%",
          transform: "translateX(-50%)",
          width: 180,
          padding: "6px 12px",
          borderRadius: 8,
          background: "rgba(5,8,20,0.92)",
          border: "1px solid rgba(125,240,255,0.4)",
          boxShadow:
            "0 0 0 1px rgba(0,0,0,0.6) inset, 0 0 18px rgba(0,229,255,0.18)",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          letterSpacing: "0.18em",
          textAlign: "center",
          zIndex: 5,
          color:
            openStage === "revealed"
              ? "#7eff97"
              : openStage === "unlocking" || openStage === "opening"
                ? "#fde047"
                : "#7df0ff",
          textShadow: "0 0 8px currentColor",
          transition: "color 260ms ease",
        }}
      >
        {openStage === "revealed"
          ? "VAULT OPEN"
          : openStage === "opening"
            ? "UNSEALING"
            : openStage === "unlocking"
              ? "ACCESS GRANTED"
              : openStage === "anticipation"
                ? "VERIFYING..."
                : `${activeCount.toString().padStart(2, "0")}/${totalLocks
                    .toString()
                    .padStart(2, "0")} LOCKS`}
      </div>

      {/* Door halves */}
      <motion.div
        animate={{
          x: open ? -DOOR_SIZE / 2 - 80 : 0,
          rotateY: open ? -22 : 0,
        }}
        transition={{
          duration: swingDur,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
          background:
            "linear-gradient(135deg, #2a3050 0%, #181d36 50%, #2a3050 100%)",
          borderTopLeftRadius: 20,
          borderBottomLeftRadius: 20,
          boxShadow:
            "inset -10px 0 18px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(125,240,255,0.18)",
          transformOrigin: "left center",
          backfaceVisibility: "hidden",
          filter: armed
            ? "drop-shadow(0 0 18px rgba(253,224,71,0.45))"
            : undefined,
          transition: "filter 320ms ease",
        }}
      >
        <BoltsColumn side="left" />
        <DoorScratches />
      </motion.div>
      <motion.div
        animate={{
          x: open ? DOOR_SIZE / 2 + 80 : 0,
          rotateY: open ? 22 : 0,
        }}
        transition={{
          duration: swingDur,
          ease: [0.22, 1, 0.36, 1],
        }}
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "50%",
          height: "100%",
          background:
            "linear-gradient(225deg, #2a3050 0%, #181d36 50%, #2a3050 100%)",
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          boxShadow:
            "inset 10px 0 18px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(125,240,255,0.18)",
          transformOrigin: "right center",
          backfaceVisibility: "hidden",
          filter: armed
            ? "drop-shadow(0 0 18px rgba(253,224,71,0.45))"
            : undefined,
          transition: "filter 320ms ease",
        }}
      >
        <BoltsColumn side="right" />
        <DoorScratches mirrored />
      </motion.div>

      {/* Central dial - sits on the seam, spins on open */}
      {!open && <VaultDial openStage={openStage} intensity={intensity} />}

      {/* Hotspot layer (above door halves, hidden after open) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: open ? "none" : "auto",
          opacity: open ? 0 : 1,
          transition: "opacity 320ms ease",
        }}
      >
        {children}
      </div>
    </>
  );
}

function VaultDial({
  openStage,
  intensity,
}: {
  openStage: OpenStage;
  intensity: number;
}) {
  // Spins faster as the open-sequence progresses, then disappears.
  const spinSec =
    openStage === "anticipation" ? 1.4 : openStage === "unlocking" ? 0.7 : 12;
  const showSpin = intensity > 0;
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: 78,
        height: 78,
        transform: "translate(-50%, -50%)",
        borderRadius: "50%",
        background:
          "radial-gradient(circle at 30% 30%, #6e7896 0%, #2a3260 60%, #10142b 100%)",
        boxShadow:
          "0 0 0 4px #181d36, 0 0 0 5px rgba(125,240,255,0.25), inset 0 -4px 8px rgba(0,0,0,0.5), inset 0 4px 8px rgba(255,255,255,0.12)",
        zIndex: 6,
      }}
    >
      {/* Hash marks */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: showSpin
            ? `vaultDialSpin ${spinSec}s linear infinite`
            : undefined,
        }}
      >
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <span
            key={deg}
            style={{
              position: "absolute",
              top: 6,
              left: "50%",
              width: 2,
              height: 10,
              background: "rgba(255,255,255,0.8)",
              transform: `translateX(-50%) rotate(${deg}deg)`,
              transformOrigin: "1px 33px",
            }}
          />
        ))}
        {/* Indicator notch */}
        <span
          style={{
            position: "absolute",
            top: 3,
            left: "50%",
            width: 4,
            height: 14,
            background: "#fde047",
            transform: "translateX(-50%)",
            borderRadius: 1,
            boxShadow: "0 0 6px rgba(253,224,71,0.85)",
          }}
        />
      </div>
      {/* Centre cap */}
      <span
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 18,
          height: 18,
          transform: "translate(-50%, -50%)",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 30% 30%, #fff 0%, #cbd5e1 50%, #475569 100%)",
          boxShadow: "0 0 0 1px rgba(0,0,0,0.45) inset",
        }}
      />
    </div>
  );
}

function BoltsColumn({ side }: { side: "left" | "right" }) {
  const positions = [12, 32, 52, 72, 92];
  return (
    <>
      {positions.map((top) => (
        <span
          key={top}
          aria-hidden
          style={{
            position: "absolute",
            top: `${top}%`,
            [side === "left" ? "left" : "right"]: 10,
            width: 7,
            height: 7,
            borderRadius: "50%",
            background:
              "radial-gradient(circle at 30% 30%, #6e7896 0%, #2a3260 70%, #10142b 100%)",
            boxShadow: "0 0 0 1px rgba(255,255,255,0.06) inset",
          }}
        />
      ))}
    </>
  );
}

function DoorScratches({ mirrored }: { mirrored?: boolean }) {
  // Subtle decorative scratches/scuffs to break the flat metal.
  const lines = [
    { x: 22, y: 18, w: 28, r: 12 },
    { x: 65, y: 64, w: 18, r: -8 },
    { x: 38, y: 88, w: 12, r: 4 },
  ];
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.18 }}>
      {lines.map((l, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            top: `${l.y}%`,
            [mirrored ? "right" : "left"]: `${l.x}%`,
            width: l.w,
            height: 1,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)",
            transform: `rotate(${mirrored ? -l.r : l.r}deg)`,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Lock hotspot                                                   */
/* ────────────────────────────────────────────────────────────── */

function LockHotspot({
  lock,
  state,
  focused,
  activatedJustNow,
  disabled,
  intensity,
  onTap,
}: {
  lock: PasswordVaultLock;
  state: LockState;
  focused: boolean;
  activatedJustNow: boolean;
  disabled: boolean;
  intensity: number;
  onTap: () => void;
}) {
  const pos = LOCK_POSITIONS[lock.id] ?? { x: 0, y: 0 };
  const isActive = state === "active";

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      aria-label={`${lock.ruleLabel} lock - ${isActive ? "unlocked" : "tap to try"}`}
      style={{
        position: "absolute",
        top: `${50 + pos.y}%`,
        left: `${50 + pos.x}%`,
        transform: "translate(-50%, -50%)",
        width: 88,
        height: 88,
        minWidth: 44,
        minHeight: 44,
        borderRadius: "50%",
        border: "none",
        cursor: disabled ? "default" : "pointer",
        background: "transparent",
        padding: 0,
        outline: focused ? "3px solid #00e5ff" : "none",
        outlineOffset: 4,
        WebkitTapHighlightColor: "transparent",
      }}
    >
      {/* Outer glow ring */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -10,
          borderRadius: "50%",
          background: isActive
            ? "radial-gradient(circle, rgba(126,255,151,0.6) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0,229,255,0.5) 0%, transparent 70%)",
          filter: "blur(8px)",
          animation:
            !isActive && !focused && intensity > 0
              ? "vaultLockPulse 2.4s ease-in-out infinite"
              : undefined,
        }}
      />
      {/* Lock body - rotates on activate */}
      <motion.span
        aria-hidden
        animate={
          activatedJustNow && intensity > 0
            ? { rotate: [0, -8, 14, 0], scale: [1, 1.18, 1.05, 1] }
            : { rotate: 0, scale: 1 }
        }
        transition={{ duration: activatedJustNow ? 0.55 : 0.2 }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: isActive
            ? "radial-gradient(circle at 30% 30%, #b6ffce 0%, #34d399 45%, #0d553a 100%)"
            : "radial-gradient(circle at 30% 30%, #7ad3ff 0%, #1f6ea3 45%, #0a1e30 100%)",
          boxShadow: isActive
            ? "0 0 28px rgba(126,255,151,0.7), inset 0 0 0 2px rgba(255,255,255,0.3), inset 0 -8px 12px rgba(0,0,0,0.45)"
            : "0 0 18px rgba(0,229,255,0.55), inset 0 0 0 2px rgba(255,255,255,0.25), inset 0 -8px 12px rgba(0,0,0,0.4)",
        }}
      />
      {/* Spark burst when activated */}
      {activatedJustNow && intensity > 0 && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -22,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(253,224,71,0.85) 0%, transparent 60%)",
            animation: "vaultSpark 700ms ease-out forwards",
            pointerEvents: "none",
          }}
        />
      )}
      {/* Icon */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontSize: 30,
          filter: isActive
            ? "drop-shadow(0 0 8px rgba(126,255,151,0.85))"
            : "drop-shadow(0 0 6px rgba(0,229,255,0.6))",
        }}
      >
        {isActive ? "✓" : lock.icon}
      </span>
      {/* Label chip */}
      <span
        style={{
          position: "absolute",
          left: "50%",
          bottom: -22,
          transform: "translateX(-50%)",
          fontSize: 9,
          letterSpacing: "0.18em",
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          color: isActive ? "#7eff97" : "#7df0ff",
          textShadow: isActive
            ? "0 0 8px rgba(126,255,151,0.6)"
            : "0 0 8px rgba(0,229,255,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        {lock.ruleLabel}
      </span>
    </button>
  );
}

/* Beams of light shooting from every lock toward the door centre. */
function LockBeams({
  locks,
  intensity,
}: {
  locks: PasswordVaultLock[];
  intensity: number;
}) {
  if (intensity === 0) return null;
  return (
    <>
      {locks.map((lock) => {
        const pos = LOCK_POSITIONS[lock.id] ?? { x: 0, y: 0 };
        const length = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
        const angle =
          (Math.atan2(-pos.y, -pos.x) * 180) / Math.PI; // angle FROM lock toward centre
        if (length < 1) return null;
        return (
          <span
            key={lock.id}
            aria-hidden
            style={{
              position: "absolute",
              top: `${50 + pos.y}%`,
              left: `${50 + pos.x}%`,
              width: `${length}%`,
              height: 2,
              transformOrigin: "0% 50%",
              transform: `rotate(${angle}deg)`,
              background:
                "linear-gradient(90deg, rgba(125,240,255,0) 0%, rgba(125,240,255,0.9) 40%, #fff 100%)",
              filter: "blur(0.6px) drop-shadow(0 0 6px #7df0ff)",
              animation: "vaultBeamIn 540ms ease-out both",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
        );
      })}
    </>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Vault interior reveal                                          */
/* ────────────────────────────────────────────────────────────── */

function VaultInteriorReveal({
  visible,
  pushedIn,
  intensity,
}: {
  visible: boolean;
  pushedIn: boolean;
  intensity: number;
}) {
  // Renders BEHIND the door halves. Becomes visible the instant the
  // halves start to swing - the door is what hides it until then.
  // Push-in scaling kicks in at "revealed" so the centrepiece grows.
  return (
    <div
      aria-hidden={!visible}
      style={{
        position: "absolute",
        inset: 0,
        opacity: visible ? 1 : 0,
        transition: `opacity ${intensity === 0 ? 80 : 300}ms ease`,
        zIndex: 0,
        pointerEvents: "none",
      }}
    >
      {/* Interior chamber walls (radial dark) */}
      <div
        style={{
          position: "absolute",
          inset: 4,
          borderRadius: 18,
          background:
            "radial-gradient(circle at center, #2b1a4a 0%, #150a2e 50%, #060214 100%)",
          boxShadow:
            "inset 0 0 60px rgba(0,0,0,0.85), inset 0 0 0 2px rgba(253,224,71,0.18)",
        }}
      />
      {/* Sun-burst rays */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "conic-gradient(from 0deg, rgba(253,224,71,0.55) 0deg, transparent 8deg, rgba(253,224,71,0.55) 30deg, transparent 38deg, rgba(253,224,71,0.55) 60deg, transparent 68deg, rgba(253,224,71,0.55) 90deg, transparent 98deg, rgba(253,224,71,0.55) 120deg, transparent 128deg, rgba(253,224,71,0.55) 150deg, transparent 158deg, rgba(253,224,71,0.55) 180deg, transparent 188deg, rgba(253,224,71,0.55) 210deg, transparent 218deg, rgba(253,224,71,0.55) 240deg, transparent 248deg, rgba(253,224,71,0.55) 270deg, transparent 278deg, rgba(253,224,71,0.55) 300deg, transparent 308deg, rgba(253,224,71,0.55) 330deg, transparent 338deg)",
          filter: "blur(2px)",
          opacity: 0.45,
          mixBlendMode: "screen",
          animation:
            intensity > 0
              ? "vaultRaysSpin 16s linear infinite"
              : undefined,
        }}
      />
      {/* Centre shield + orbiting rule glyphs */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          transform: pushedIn ? "scale(1.08)" : "scale(0.85)",
          transition: `transform ${intensity === 0 ? 80 : 720}ms cubic-bezier(0.22, 1, 0.36, 1)`,
        }}
      >
        <ShieldCentrepiece intensity={intensity} />
        <OrbitingGlyphs intensity={intensity} />
      </div>
      {/* Sparkle particles drifting upward */}
      {intensity > 0 && <SparkleField />}
    </div>
  );
}

function ShieldCentrepiece({ intensity }: { intensity: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: 200,
        height: 230,
        animation:
          intensity > 0 ? "vaultShieldFloat 4.5s ease-in-out infinite" : undefined,
        filter:
          "drop-shadow(0 14px 28px rgba(253,224,71,0.35)) drop-shadow(0 0 22px rgba(0,229,255,0.4))",
      }}
    >
      {/* Shield body */}
      <svg
        viewBox="0 0 200 230"
        width="200"
        height="230"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="vaultShieldFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#ff7a59" />
            <stop offset="100%" stopColor="#ff5fb3" />
          </linearGradient>
          <linearGradient id="vaultShieldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8dc" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ff7a59" />
          </linearGradient>
        </defs>
        <path
          d="M100 8 L184 38 V120 C184 168 148 200 100 220 C52 200 16 168 16 120 V38 Z"
          fill="url(#vaultShieldFill)"
          stroke="url(#vaultShieldRim)"
          strokeWidth="5"
        />
        <path
          d="M100 30 L162 53 V118 C162 156 134 184 100 200 C66 184 38 156 38 118 V53 Z"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
        />
        <text
          x="100"
          y="108"
          textAnchor="middle"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="900"
          fontSize="34"
          fill="#1a1033"
        >
          🔐
        </text>
        <text
          x="100"
          y="148"
          textAnchor="middle"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="900"
          fontSize="11"
          fill="#1a1033"
          letterSpacing="2"
        >
          PASSWORD
        </text>
        <text
          x="100"
          y="166"
          textAnchor="middle"
          fontFamily="'Space Grotesk', sans-serif"
          fontWeight="900"
          fontSize="13"
          fill="#1a1033"
          letterSpacing="2.5"
        >
          MASTER
        </text>
      </svg>
    </div>
  );
}

function OrbitingGlyphs({ intensity }: { intensity: number }) {
  const glyphs = ["📏", "🎨", "🪪", "📕", "🤐"];
  // 5 emoji glyphs orbit the shield. Anchored at centre via absolute
  // position and rotated by index*72deg; each glyph is then offset
  // outward and counter-rotated to stay upright while the parent spins.
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        display: "grid",
        placeItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          width: 320,
          height: 320,
          animation:
            intensity > 0
              ? "vaultOrbitSpin 14s linear infinite"
              : undefined,
        }}
      >
        {glyphs.map((g, i) => (
          <span
            key={g + i}
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `rotate(${i * 72}deg) translate(0, -150px) rotate(${-i * 72}deg)`,
              fontSize: 30,
              filter:
                "drop-shadow(0 0 12px rgba(253,224,71,0.8)) drop-shadow(0 0 4px rgba(255,255,255,0.6))",
              animation:
                intensity > 0
                  ? `vaultGlyphBob 3s ease-in-out infinite ${i * 0.3}s`
                  : undefined,
            }}
          >
            {g}
          </span>
        ))}
      </div>
    </div>
  );
}

function SparkleField() {
  // 14 sparkles at varied positions, animating from bottom to top of
  // the interior. CSS only - no JS per-frame work.
  const sparkles = [
    { x: 18, delay: 0 },
    { x: 34, delay: 0.6 },
    { x: 50, delay: 1.2 },
    { x: 66, delay: 0.3 },
    { x: 82, delay: 1.6 },
    { x: 12, delay: 2.0 },
    { x: 28, delay: 0.9 },
    { x: 44, delay: 1.8 },
    { x: 60, delay: 0.5 },
    { x: 76, delay: 2.3 },
    { x: 92, delay: 1.1 },
    { x: 22, delay: 1.4 },
    { x: 70, delay: 0.2 },
    { x: 88, delay: 2.6 },
  ];
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {sparkles.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${s.x}%`,
            bottom: -10,
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: "#fff8dc",
            boxShadow: "0 0 8px rgba(253,224,71,0.85)",
            animation: `vaultSparkleRise 4.6s linear infinite`,
            animationDelay: `${s.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Challenge panel                                                */
/* ────────────────────────────────────────────────────────────── */

function ChallengePanel({
  lock,
  alreadyActive,
  isNarrow,
  intensity,
  onChoose,
  onClose,
}: {
  lock: PasswordVaultLock;
  alreadyActive: boolean;
  isNarrow: boolean;
  intensity: number;
  onChoose: (idx: number) => void;
  onClose: () => void;
}) {
  const audio = useGameAudio();

  const sheetStyle: CSSProperties = isNarrow
    ? { position: "absolute", left: 8, right: 8, bottom: 8 }
    : { position: "absolute", right: 16, top: 80, bottom: 16, width: 360 };

  return (
    <motion.div
      key={lock.id}
      initial={
        intensity === 0
          ? { opacity: 0 }
          : { opacity: 0, y: isNarrow ? 30 : 0, x: isNarrow ? 0 : 30 }
      }
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={
        intensity === 0
          ? { opacity: 0 }
          : { opacity: 0, y: isNarrow ? 30 : 0, x: isNarrow ? 0 : 30 }
      }
      transition={{ duration: intensity === 0 ? 0.12 : 0.28 }}
      style={{
        ...sheetStyle,
        zIndex: 50,
        padding: 18,
        borderRadius: 20,
        background: "rgba(10, 16, 36, 0.93)",
        border: "1.5px solid rgba(0, 229, 255, 0.38)",
        backdropFilter: "blur(14px)",
        boxShadow:
          "0 24px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(125,240,255,0.18) inset",
        color: "#e7ecff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
      role="dialog"
      aria-label={`${lock.ruleLabel} challenge`}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span
            style={{
              fontSize: 26,
              filter: "drop-shadow(0 0 6px rgba(0,229,255,0.6))",
            }}
          >
            {lock.icon}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              fontWeight: 800,
              color: "#7df0ff",
              textTransform: "uppercase",
            }}
          >
            {lock.ruleLabel}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lock"
          style={{
            width: 32,
            height: 32,
            minWidth: 32,
            minHeight: 32,
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.18)",
            background: "rgba(255,255,255,0.06)",
            color: "#cbd5e1",
            cursor: "pointer",
            fontSize: 16,
            fontWeight: 700,
          }}
        >
          ×
        </button>
      </div>

      {alreadyActive && (
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            background: "rgba(126,255,151,0.12)",
            border: "1px solid rgba(126,255,151,0.32)",
            color: "#86efac",
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 10,
          }}
        >
          ✓ Already unlocked
        </div>
      )}

      <h3
        style={{
          margin: "0 0 14px",
          fontSize: 17,
          fontWeight: 800,
          color: "#fff",
          lineHeight: 1.3,
        }}
      >
        {lock.prompt}
      </h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 8,
          overflowY: "auto",
          paddingRight: 2,
        }}
      >
        {lock.choices.map((c, i) => (
          <button
            key={i}
            type="button"
            disabled={alreadyActive}
            onClick={() => {
              if (alreadyActive) return;
              audio.tap();
              onChoose(i);
            }}
            style={{
              padding: "12px 14px",
              borderRadius: 12,
              border: "1.5px solid rgba(125,240,255,0.32)",
              background:
                "linear-gradient(180deg, rgba(15,21,48,0.95), rgba(28,38,80,0.95))",
              color: "#e7ecff",
              fontSize: 14,
              fontWeight: 600,
              textAlign: "left",
              cursor: alreadyActive ? "default" : "pointer",
              opacity: alreadyActive ? 0.6 : 1,
              minHeight: 44,
              transition: "transform 120ms ease, box-shadow 120ms ease",
            }}
            onMouseEnter={(e) => {
              if (alreadyActive) return;
              e.currentTarget.style.boxShadow =
                "0 0 0 1px rgba(125,240,255,0.5) inset, 0 6px 14px rgba(0,229,255,0.18)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {c.text}
          </button>
        ))}
      </div>
    </motion.div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Keyframes (scoped via styled-jsx)                              */
/* ────────────────────────────────────────────────────────────── */

function SceneStyles() {
  return (
    <style jsx global>{`
      @keyframes vaultLockPulse {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50%      { opacity: 0.95; transform: scale(1.08); }
      }
      @keyframes vaultSpark {
        0%   { opacity: 1; transform: scale(0.6); }
        100% { opacity: 0; transform: scale(2.2); }
      }
      @keyframes vaultBeamIn {
        0%   { opacity: 0; transform: rotate(var(--ang, 0deg)) scaleX(0); }
        60%  { opacity: 1; transform: rotate(var(--ang, 0deg)) scaleX(1); }
        100% { opacity: 0.85; transform: rotate(var(--ang, 0deg)) scaleX(1); }
      }
      @keyframes vaultReject {
        0%   { opacity: 0; transform: scale(0.9); }
        30%  { opacity: 0.95; transform: scale(1.02); }
        100% { opacity: 0; transform: scale(1); }
      }
      @keyframes vaultShakeMd {
        0%, 100% { transform: translate(0, 0); }
        20%  { transform: translate(-2px, 1px); }
        40%  { transform: translate(2px, -1px); }
        60%  { transform: translate(-1px, 2px); }
        80%  { transform: translate(1px, -2px); }
      }
      @keyframes vaultShakeLg {
        0%, 100% { transform: translate(0, 0); }
        15%  { transform: translate(-5px, 3px); }
        30%  { transform: translate(5px, -3px); }
        45%  { transform: translate(-3px, 5px); }
        60%  { transform: translate(4px, -4px); }
        75%  { transform: translate(-4px, -2px); }
      }
      .vault-shake-md { animation: vaultShakeMd 180ms ease-in-out infinite; }
      .vault-shake-lg { animation: vaultShakeLg 90ms ease-in-out infinite; }

      @keyframes vaultStream {
        0%   { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      @keyframes vaultDialSpin {
        from { transform: rotate(0); }
        to   { transform: rotate(360deg); }
      }
      @keyframes vaultRaysSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes vaultOrbitSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes vaultShieldFloat {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-10px); }
      }
      @keyframes vaultGlyphBob {
        0%, 100% { translate: 0 0; }
        50%      { translate: 0 -6px; }
      }
      @keyframes vaultSparkleRise {
        0%   { opacity: 0; transform: translateY(0) scale(0.6); }
        15%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { opacity: 0; transform: translateY(-340px) scale(1.1); }
      }
    `}</style>
  );
}
