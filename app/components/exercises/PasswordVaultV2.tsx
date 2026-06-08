"use client";

/**
 * Password Vault — engine rebuild (Phase 0 Batch 6, Step A: PARITY).
 *
 * Functionally identical to the legacy `PasswordVault.tsx`, but composed
 * from the shared cinematic engine in `app/lib/cinematic/` instead of
 * 2,395 lines of bespoke machinery:
 *   - SceneShell       → camera rig + ExerciseFrame
 *   - useHotspotPanel  → tap → focus → answer + wrong panel + hints
 *   - ChallengePanel   → the responsive choice overlay
 *   - useClimaxSequence→ the five-stage open sequence
 *   - useTimingScaler  → reduced-motion timing
 *   - RevealStage      → the treasure-chamber cascade
 *   - juice            → confetti / beams / flash / sparkle / shake
 *
 * Vault-specific art (the door, the dial, the lock hotspots, the shield)
 * stays local — but it now USES the engine for all cinematic behaviour.
 *
 * The props interface, callback contract, and questionKey values
 * (`vault-{lockId}`, `vault-opened`) are unchanged from the legacy vault.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import GameButton from "@/app/components/lesson/GameButton";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import { useGameAudio, useExerciseFeedback } from "@/app/lib/gameEngine";
import {
  SceneShell,
  type SceneCamera,
  ChallengePanel,
  useHotspotPanel,
  type HotspotDef,
  useClimaxSequence,
  useTimingScaler,
  RevealStage,
  StickerTeaser,
  type RevealArtifact,
  JuiceKeyframes,
  fireBurst,
  FlashOverlay,
  Beams,
  SparkleField,
  SHAKE_MD,
  SHAKE_LG,
  SURFACE,
  TYPE,
} from "@/app/lib/cinematic";

/* ────────────────────────────────────────────────────────────── */
/* Props (unchanged from legacy PasswordVault)                    */
/* ────────────────────────────────────────────────────────────── */

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
/* Vault geometry + reveal data                                   */
/* ────────────────────────────────────────────────────────────── */

const LOCK_POSITIONS: Record<string, { x: number; y: number }> = {
  length:   { x: -28, y: -22 },
  mix:      { x:  28, y: -22 },
  personal: { x:   0, y:   0 },
  common:   { x: -28, y:  22 },
  secret:   { x:  28, y:  22 },
};

const DOOR_SIZE = 520;
const ZOOM_FACTOR = 1.75;

/* Stage durations (ms) at intensity 1. Scaled by the timing scaler. */
const STAGE_MS = {
  armed: 360,
  anticipation: 900,
  unlocking: 620,
  opening: 1050,
  revealed: 420,
} as const;

/* Per-stage camera zoom for the climax push-in (was the vault's stageScale). */
const STAGE_ZOOM: Record<string, number> = {
  armed: 1.12,
  anticipation: 1.22,
  unlocking: 1.32,
  opening: 1.4,
  revealed: 1.78,
  master: 1.78,
};

/** Recap line per rule. Single short sentence, child-readable. */
const ARTIFACT_RECAP: Record<string, string> = {
  length:   "Long is strong",
  mix:      "Mix all the types",
  personal: "Never your name",
  common:   "Not a common word",
  secret:   "Only you and a parent",
};

/** Pedestal positions + accents arc'd around the core. */
const ARTIFACT_LAYOUT: { x: number; y: number; accent: string }[] = [
  { x: -32, y: -16, accent: "#00e5ff" },
  { x: -18, y: -36, accent: "#7eff97" },
  { x:   0, y: -42, accent: "#fde047" },
  { x:  18, y: -36, accent: "#ff5fb3" },
  { x:  32, y: -16, accent: "#a855f7" },
];

/* ────────────────────────────────────────────────────────────── */
/* Component                                                      */
/* ────────────────────────────────────────────────────────────── */

export default function PasswordVaultV2({
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
  const { intensity, t, reduced } = useTimingScaler();

  const [doorReject, setDoorReject] = useState(0);
  const [showRevealUI, setShowRevealUI] = useState(false);
  const climaxStartedRef = useRef(false);
  const extraTimersRef = useRef<number[]>([]);

  // Establishing shot: on mount the camera holds a tight push-in on the
  // sealed door, then pulls back to reveal the full vault + locks. Until
  // it settles, the locks are non-interactive and fade in.
  const [established, setEstablished] = useState(false);
  useEffect(() => {
    // setState only inside the async callback (never synchronously in the
    // effect body). Reduced motion collapses the hold to ~0.
    const id = window.setTimeout(() => setEstablished(true), reduced ? 0 : 1150);
    return () => window.clearTimeout(id);
  }, [reduced]);

  // Narrow viewport → bottom-sheet challenge panel; wide → side card.
  const [isNarrow, setIsNarrow] = useState(false);
  useEffect(() => {
    const onResize = () => setIsNarrow(window.innerWidth < 760);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(
    () => () => {
      extraTimersRef.current.forEach((id) => window.clearTimeout(id));
    },
    [],
  );

  /* ───────── Hotspot interaction (engine) ───────── */
  const hotspotDefs: HotspotDef[] = useMemo(
    () =>
      locks.map((l) => {
        const pos = LOCK_POSITIONS[l.id] ?? { x: 0, y: 0 };
        return {
          id: l.id,
          x: pos.x,
          y: pos.y,
          choices: l.choices.map((c) => ({
            isCorrect: c.isCorrect,
            explanation: c.explanation,
          })),
          speaker: l.speaker,
        };
      }),
    [locks],
  );

  /* ───────── Climax open-sequence (engine) ───────── */
  const climax = useClimaxSequence([
    {
      id: "armed",
      durationMs: STAGE_MS.armed,
      onEnter: () => audio.bossPhaseChange(),
    },
    {
      id: "anticipation",
      durationMs: STAGE_MS.anticipation,
      onEnter: () => {
        // Five lock chimes shoot in sequence as the beams reach centre.
        for (let i = 0; i < locks.length; i++) {
          extraTimersRef.current.push(
            window.setTimeout(() => audio.starEarned(), i * t(120)),
          );
        }
      },
    },
    {
      id: "unlocking",
      durationMs: STAGE_MS.unlocking,
      onEnter: () => audio.bossHit(),
    },
    {
      id: "opening",
      durationMs: STAGE_MS.opening,
      onEnter: () => {
        audio.victory();
        audio.signature("vault-open");
        fireBurst(0.5, 0.55, 90 * intensity, 110);
        extraTimersRef.current.push(
          window.setTimeout(() => fireBurst(0.25, 0.5, 60 * intensity, 90), 220),
          window.setTimeout(() => fireBurst(0.75, 0.5, 60 * intensity, 90), 260),
          window.setTimeout(() => fireBurst(0.5, 0.4, 70 * intensity, 100), 520),
        );
      },
    },
    {
      id: "revealed",
      durationMs: STAGE_MS.revealed,
      onEnter: () => {
        audio.badgeEarned();
        audio.signature("vault-reveal");
        onAnswered?.({
          questionKey: "vault-opened",
          selectedIndex: 0,
          correctIndex: 0,
          wasCorrect: true,
        });
      },
    },
    {
      id: "master",
      durationMs: 0,
      onEnter: () => {
        setShowRevealUI(true);
        fx.unlock({ xp: 100, text: "VAULT MASTER!" });
      },
    },
  ]);

  /* ───────── Hotspot interaction (engine) ───────── */
  const hotspot = useHotspotPanel({
    hotspots: hotspotDefs,
    questionKey: (id) => `vault-${id}`,
    hintThresholds: [2, 4],
    onCorrect,
    onWrong: () => {
      onWrong?.();
      setDoorReject((n) => n + 1);
    },
    onHintReached,
    onAnswered,
    onFocus: (_id, already) => (already ? audio.tap() : audio.select()),
    onClosePanel: () => audio.back(),
    onActivated: (id) => {
      const lock = locks.find((l) => l.id === id);
      fx.correct({ xp: 30, text: `${lock?.ruleLabel ?? ""} ✓` });
      audio.unlock();
    },
    locked: climax.stage !== null || !established,
  });

  // Kick off the climax the moment every lock is active.
  useEffect(() => {
    if (hotspot.allActive && !climaxStartedRef.current) {
      climaxStartedRef.current = true;
      climax.start();
    }
  }, [hotspot.allActive, climax]);

  /* ───────── Derived stage flags ───────── */
  const stage = climax.stage;
  const vaultLocked = stage !== null;
  const doorOpen = stage === "opening" || stage === "revealed" || stage === "master";
  const armed = stage === "armed";
  const shakeClass =
    stage === "anticipation" ? SHAKE_MD : stage === "unlocking" ? SHAKE_LG : "";
  const revealVisible = doorOpen;
  const revealActive = stage === "revealed" || stage === "master";

  /* ───────── Camera (engine SceneShell) ───────── */
  // Priority: climax push-in > establishing hold > hotspot focus/overview.
  const establishing = !established && !vaultLocked;
  const camera: SceneCamera = vaultLocked
    ? { kind: "focus", x: 0, y: 0, zoom: STAGE_ZOOM[stage] ?? 1.4 }
    : establishing
      ? { kind: "focus", x: 0, y: -4, zoom: 1.22 }
      : hotspot.camera;
  // 0ms while holding the establishing frame (it's the mount pose); the
  // pull-back to overview then rides the default 620ms ease.
  const cameraTransitionMs = vaultLocked ? 720 : establishing ? 0 : 900;

  /* ───────── Guidance ribbon copy ───────── */
  const activeCount = hotspot.activeCount;
  const guidanceMessage = vaultLocked
    ? stage === "revealed" || stage === "master"
      ? guidance?.complete ?? "VAULT OPEN - the Raccoon can't get in!"
      : stage === "unlocking"
        ? "ACCESS GRANTED"
        : "Opening..."
    : activeCount === 0
      ? guidance?.intro ?? "Tap a glowing lock to begin."
      : activeCount === locks.length - 1
        ? "One lock left!"
        : guidance?.progress ?? `${activeCount} of ${locks.length} locks unlocked.`;

  /* ───────── Reveal artifacts ───────── */
  const artifacts: RevealArtifact[] = useMemo(
    () =>
      locks.map((l, i) => {
        const slot = ARTIFACT_LAYOUT[i] ?? { x: 0, y: -20, accent: "#00e5ff" };
        return {
          icon: l.icon,
          label: l.ruleLabel,
          recap: ARTIFACT_RECAP[l.id] ?? "",
          accent: slot.accent,
          x: slot.x,
          y: slot.y,
        };
      }),
    [locks],
  );

  const focusedLock =
    hotspot.focusedId != null
      ? locks.find((l) => l.id === hotspot.focusedId) ?? null
      : null;
  const beamPositions = useMemo(
    () => locks.map((l) => LOCK_POSITIONS[l.id] ?? { x: 0, y: 0 }),
    [locks],
  );

  return (
    <SceneShell
      aspectRatio={{ w: 16, h: 9 }}
      background={SURFACE.pageGradient}
      camera={camera}
      cameraTransitionMs={cameraTransitionMs}
      focusBasis={DOOR_SIZE}
      defaultZoom={ZOOM_FACTOR}
      shakeClass={shakeClass}
      maxWidth={1100}
      reserve={210}
      overlay={
        <>
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
              fontFamily: TYPE.display,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.02em",
              color: vaultLocked ? "#fde047" : "#bfeaff",
              textShadow: vaultLocked ? "0 0 14px rgba(253,224,71,0.65)" : undefined,
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
              const on = hotspot.isActive(l.id);
              const justOn = hotspot.recentlyActivated === l.id;
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
                    boxShadow: on ? "0 0 10px rgba(126,255,151,0.6)" : "none",
                    transition: "background 240ms ease",
                    animation: justOn && intensity > 0 ? "v2PipPop 520ms ease-out" : undefined,
                  }}
                />
              );
            })}
          </div>

          {/* Scene vignette — depth + focus toward the centre (static, RM-safe) */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 8,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at 50% 46%, transparent 38%, rgba(4,5,13,0.26) 78%, rgba(4,5,13,0.58) 100%)",
            }}
          />

          {/* CLANG flash + expanding shockwave ring */}
          <FlashOverlay show={stage === "unlocking"} intensity={intensity} />
          {stage === "unlocking" && intensity > 0 && (
            <span
              aria-hidden
              style={{
                position: "absolute",
                top: "48%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                zIndex: 22,
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  display: "block",
                  width: 220,
                  height: 220,
                  borderRadius: "50%",
                  border: "4px solid rgba(253,224,71,0.9)",
                  boxShadow:
                    "0 0 30px rgba(253,224,71,0.7), inset 0 0 24px rgba(253,224,71,0.4)",
                  animation: "v2Ring 640ms cubic-bezier(0.2,0.8,0.2,1) forwards",
                }}
              />
            </span>
          )}

          {/* Light burst on opening */}
          <AnimatePresence>
            {(stage === "opening" || stage === "revealed" || stage === "master") && (
              <motion.div
                key="vault-burst"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{
                  opacity: revealActive ? 0.55 : 0.95,
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
            {focusedLock && !vaultLocked && !hotspot.wrong && (
              <ChallengePanel
                key={focusedLock.id}
                prompt={focusedLock.prompt}
                choices={focusedLock.choices.map((c) => ({ text: c.text }))}
                icon={focusedLock.icon}
                label={focusedLock.ruleLabel}
                alreadyActive={hotspot.isActive(focusedLock.id)}
                isNarrow={isNarrow}
                intensity={intensity}
                onChoose={(idx) => hotspot.answer(focusedLock.id, idx)}
                onClose={hotspot.closePanel}
                onChoiceSound={() => audio.tap()}
              />
            )}
          </AnimatePresence>

          {/* Wrong panel */}
          <AnimatePresence>
            {hotspot.wrong && (
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
                  explanation={hotspot.wrong.explanation}
                  speaker={hotspot.wrong.speaker}
                  onContinue={hotspot.clearWrong}
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
                    fontFamily: TYPE.display,
                    fontWeight: 900,
                    fontSize: "clamp(28px, 5vw, 46px)",
                    letterSpacing: "0.04em",
                    background:
                      "linear-gradient(110deg, #fde047 0%, #fff8dc 25%, #ff7a59 50%, #ff5fb3 75%, #fde047 100%)",
                    backgroundSize: "220% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    textShadow: "0 0 32px rgba(253, 224, 71, 0.5)",
                    marginBottom: 12,
                    textAlign: "center",
                    filter: "drop-shadow(0 6px 24px rgba(253,224,71,0.4))",
                    animation: intensity > 0 ? "v2TextSheen 2.6s ease-in-out infinite" : undefined,
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
        </>
      }
    >
      {/* Engine + vault keyframe libraries (mounted once) */}
      <JuiceKeyframes />
      <VaultV2FX />

      {/* Camera-transformed world */}
      <ChamberDecor />
      <DataStreams intensity={intensity} muted={vaultLocked} />

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
        {/* Treasure-chamber reveal (engine) */}
        <RevealStage
          visible={revealVisible}
          active={revealActive}
          centrepiece={<ShieldCentrepiece intensity={intensity} />}
          artifacts={artifacts}
          ribbonText="You protected the secrets!"
          teaser={<StickerTeaser icons={["🔐", "🤐", "🔍"]} />}
          onCentrepieceReveal={() => audio.starEarned()}
          onArtifactReveal={() => audio.starEarned()}
        />
        {revealActive && <SparkleField intensity={intensity} />}
        {revealActive && <ChamberDust intensity={intensity} />}

        <VaultDoor
          open={doorOpen}
          armed={armed}
          doorReject={doorReject}
          activeCount={activeCount}
          totalLocks={locks.length}
          intensity={intensity}
          statusStage={stage}
        >
          {(stage === "anticipation" || stage === "unlocking") && (
            <Beams positions={beamPositions} intensity={intensity} />
          )}
          {locks.map((lock, i) => (
            <LockHotspot
              key={lock.id}
              lock={lock}
              index={i}
              entered={established}
              active={hotspot.isActive(lock.id)}
              focused={hotspot.focusedId === lock.id}
              activatedJustNow={hotspot.recentlyActivated === lock.id}
              disabled={!!hotspot.wrong || vaultLocked || !established}
              intensity={intensity}
              onTap={() => hotspot.focusHotspot(lock.id)}
            />
          ))}
        </VaultDoor>
      </div>
    </SceneShell>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Vault-specific art (local — uses engine keyframes)             */
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
            animation: `cineStream ${4 + i * 0.6}s linear infinite`,
            animationDelay: `-${(i * 0.7) % 3}s`,
          }}
        />
      ))}
    </div>
  );
}

function VaultDoor({
  open,
  armed,
  doorReject,
  activeCount,
  totalLocks,
  intensity,
  statusStage,
  children,
}: {
  open: boolean;
  armed: boolean;
  doorReject: number;
  activeCount: number;
  totalLocks: number;
  intensity: number;
  statusStage: string | null;
  children: React.ReactNode;
}) {
  const swingDur = intensity === 0 ? 0.18 : 1.05;
  const statusText =
    statusStage === "revealed" || statusStage === "master"
      ? "VAULT OPEN"
      : statusStage === "opening"
        ? "UNSEALING"
        : statusStage === "unlocking"
          ? "ACCESS GRANTED"
          : statusStage === "anticipation"
            ? "VERIFYING..."
            : `${activeCount.toString().padStart(2, "0")}/${totalLocks
                .toString()
                .padStart(2, "0")} LOCKS`;
  const statusColor =
    statusStage === "revealed" || statusStage === "master"
      ? "#7eff97"
      : statusStage === "unlocking" || statusStage === "opening"
        ? "#fde047"
        : "#7df0ff";

  return (
    <>
      {/* Solid rim — recedes once the vault opens so the treasure chamber
          reads as the hero (the legacy vault left it covering the reveal). */}
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
          opacity: open ? 0.16 : 1,
          transition: "opacity 760ms ease",
        }}
      />
      {/* Caution stripes — fully fade on open so they stop masking the chamber. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: -16,
          borderRadius: 22,
          background:
            "repeating-linear-gradient(45deg, rgba(253,224,71,0.5) 0 14px, rgba(15,21,48,0.85) 14px 28px)",
          opacity: open ? 0 : 0.45,
          transition: "opacity 600ms ease",
          pointerEvents: "none",
        }}
      />

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
            animation: "cineReject 480ms ease-out",
            zIndex: 4,
          }}
        />
      )}

      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -10,
          left: "50%",
          transform: "translateX(-50%)",
          fontFamily: TYPE.mono,
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
          fontFamily: TYPE.mono,
          fontSize: 11,
          letterSpacing: "0.18em",
          textAlign: "center",
          zIndex: 5,
          color: statusColor,
          textShadow: "0 0 8px currentColor",
          transition: "color 260ms ease",
        }}
      >
        {statusText}
      </div>

      {/* Door halves */}
      <motion.div
        animate={{ x: open ? -DOOR_SIZE / 2 - 80 : 0, rotateY: open ? -22 : 0 }}
        transition={{ duration: swingDur, ease: [0.22, 1, 0.36, 1] }}
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
          filter: armed ? "drop-shadow(0 0 18px rgba(253,224,71,0.45))" : undefined,
          transition: "filter 320ms ease",
        }}
      >
        <BoltsColumn side="left" />
        <DoorScratches />
      </motion.div>
      <motion.div
        animate={{ x: open ? DOOR_SIZE / 2 + 80 : 0, rotateY: open ? 22 : 0 }}
        transition={{ duration: swingDur, ease: [0.22, 1, 0.36, 1] }}
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
          filter: armed ? "drop-shadow(0 0 18px rgba(253,224,71,0.45))" : undefined,
          transition: "filter 320ms ease",
        }}
      >
        <BoltsColumn side="right" />
        <DoorScratches mirrored />
      </motion.div>

      {!open && (
        <VaultDial statusStage={statusStage} activeCount={activeCount} intensity={intensity} />
      )}

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
  statusStage,
  activeCount = 0,
  intensity,
}: {
  statusStage: string | null;
  activeCount?: number;
  intensity: number;
}) {
  // Idle spin accelerates as locks are solved — the vault "charging up".
  const progressSpin = Math.max(3.2, 12 - activeCount * 1.7);
  const spinSec =
    statusStage === "anticipation" ? 1.4 : statusStage === "unlocking" ? 0.7 : progressSpin;
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
      <div
        style={{
          position: "absolute",
          inset: 0,
          animation: showSpin ? `cineDialSpin ${spinSec}s linear infinite` : undefined,
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

function LockHotspot({
  lock,
  index,
  entered,
  active,
  focused,
  activatedJustNow,
  disabled,
  intensity,
  onTap,
}: {
  lock: PasswordVaultLock;
  index: number;
  entered: boolean;
  active: boolean;
  focused: boolean;
  activatedJustNow: boolean;
  disabled: boolean;
  intensity: number;
  onTap: () => void;
}) {
  const pos = LOCK_POSITIONS[lock.id] ?? { x: 0, y: 0 };
  const [hover, setHover] = useState(false);
  const lifted = hover && !active && !disabled && intensity > 0;

  return (
    <button
      type="button"
      onClick={onTap}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={`${lock.ruleLabel} lock - ${active ? "unlocked" : "tap to try"}`}
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
        // Staggered fade-in entrance after the establishing pull-back.
        opacity: entered || intensity === 0 ? 1 : 0,
        transition: `opacity 460ms ease ${index * 90}ms`,
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -10,
          borderRadius: "50%",
          background: active
            ? "radial-gradient(circle, rgba(126,255,151,0.6) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0,229,255,0.5) 0%, transparent 70%)",
          filter: lifted ? "blur(10px) brightness(1.35)" : "blur(8px)",
          transition: "filter 180ms ease",
          animation:
            !active && !focused && !hover && intensity > 0
              ? "cineLockPulse 2.4s ease-in-out infinite"
              : undefined,
        }}
      />
      <motion.span
        aria-hidden
        animate={
          activatedJustNow && intensity > 0
            ? { rotate: [0, -8, 14, 0], scale: [1, 1.22, 1.06, 1] }
            : { rotate: 0, scale: lifted ? 1.09 : 1 }
        }
        transition={
          activatedJustNow
            ? { duration: 0.55 }
            : { type: "spring", stiffness: 360, damping: 22 }
        }
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          background: active
            ? "radial-gradient(circle at 30% 30%, #b6ffce 0%, #34d399 45%, #0d553a 100%)"
            : "radial-gradient(circle at 30% 30%, #7ad3ff 0%, #1f6ea3 45%, #0a1e30 100%)",
          boxShadow: active
            ? "0 0 28px rgba(126,255,151,0.7), inset 0 0 0 2px rgba(255,255,255,0.3), inset 0 -8px 12px rgba(0,0,0,0.45)"
            : lifted
              ? "0 0 30px rgba(0,229,255,0.85), inset 0 0 0 2px rgba(255,255,255,0.4), inset 0 -8px 12px rgba(0,0,0,0.4)"
              : "0 0 18px rgba(0,229,255,0.55), inset 0 0 0 2px rgba(255,255,255,0.25), inset 0 -8px 12px rgba(0,0,0,0.4)",
        }}
      />
      {/* Soft spark + hard shockwave ring on activation */}
      {activatedJustNow && intensity > 0 && (
        <>
          <span
            aria-hidden
            style={{
              position: "absolute",
              inset: -22,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(253,224,71,0.85) 0%, transparent 60%)",
              animation: "cineSpark 700ms ease-out forwards",
              pointerEvents: "none",
            }}
          />
          <span
            aria-hidden
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <span
              style={{
                display: "block",
                width: 104,
                height: 104,
                borderRadius: "50%",
                border: "3px solid rgba(126,255,151,0.9)",
                boxShadow: "0 0 16px rgba(126,255,151,0.6)",
                animation: "v2Ring 680ms cubic-bezier(0.2,0.8,0.2,1) forwards",
              }}
            />
          </span>
        </>
      )}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontSize: 30,
          filter: active
            ? "drop-shadow(0 0 8px rgba(126,255,151,0.85))"
            : "drop-shadow(0 0 6px rgba(0,229,255,0.6))",
        }}
      >
        {active ? "✓" : lock.icon}
      </span>
      <span
        style={{
          position: "absolute",
          left: "50%",
          bottom: -22,
          transform: "translateX(-50%)",
          fontSize: 9,
          letterSpacing: "0.18em",
          fontWeight: 800,
          fontFamily: TYPE.mono,
          color: active ? "#7eff97" : "#7df0ff",
          textShadow: active
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

function ShieldCentrepiece({ intensity }: { intensity: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: 200,
        height: 230,
        animation:
          intensity > 0 ? "cineShieldFloat 4.5s ease-in-out infinite" : undefined,
        filter:
          "drop-shadow(0 14px 28px rgba(253,224,71,0.35)) drop-shadow(0 0 22px rgba(0,229,255,0.4))",
      }}
    >
      {/* Rotating ray halo behind the relic */}
      {intensity > 0 && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: -46,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, rgba(253,224,71,0.55) 0deg, transparent 16deg, rgba(0,229,255,0.4) 60deg, transparent 78deg, rgba(253,224,71,0.55) 120deg, transparent 138deg, rgba(255,95,179,0.4) 200deg, transparent 220deg, rgba(253,224,71,0.55) 280deg, transparent 300deg)",
            filter: "blur(7px)",
            opacity: 0.5,
            mixBlendMode: "screen",
            animation: "v2HaloSpin 16s linear infinite",
          }}
        />
      )}
      {/* Pulsing aura */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -12,
          borderRadius: "50%",
          background:
            "radial-gradient(circle, rgba(253,224,71,0.45) 0%, rgba(124,92,255,0.2) 45%, transparent 68%)",
          filter: "blur(10px)",
          animation: intensity > 0 ? "cineCoreAura 4s ease-in-out infinite" : undefined,
        }}
      />
      <svg viewBox="0 0 200 230" width="200" height="230" style={{ display: "block", position: "relative" }}>
        <defs>
          <linearGradient id="v2ShieldFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#ff7a59" />
            <stop offset="100%" stopColor="#ff5fb3" />
          </linearGradient>
          <linearGradient id="v2ShieldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8dc" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ff7a59" />
          </linearGradient>
        </defs>
        <path
          d="M100 8 L184 38 V120 C184 168 148 200 100 220 C52 200 16 168 16 120 V38 Z"
          fill="url(#v2ShieldFill)"
          stroke="url(#v2ShieldRim)"
          strokeWidth="5"
        />
        <path
          d="M100 30 L162 53 V118 C162 156 134 184 100 200 C66 184 38 156 38 118 V53 Z"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
        />
        <text x="100" y="108" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="34" fill="#1a1033">
          🔐
        </text>
        <text x="100" y="148" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="11" fill="#1a1033" letterSpacing="2">
          PASSWORD
        </text>
        <text x="100" y="166" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="13" fill="#1a1033" letterSpacing="2.5">
          MASTER
        </text>
      </svg>
      {/* Metallic glint sweeping across the shield (clipped to its silhouette) */}
      {intensity > 0 && (
        <span
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            overflow: "hidden",
            clipPath: "polygon(50% 3%, 92% 17%, 92% 52%, 50% 96%, 8% 52%, 8% 17%)",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: "45%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              mixBlendMode: "screen",
              animation: "v2Shine 3.4s ease-in-out infinite",
            }}
          />
        </span>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Step B FX — chamber dust + vault-specific keyframes            */
/* ────────────────────────────────────────────────────────────── */

/** Warm golden motes drifting up through the open treasure chamber. */
function ChamberDust({ intensity }: { intensity: number }) {
  if (intensity === 0) return null;
  const motes = [
    { x: 26, s: 5, d: 0, dur: 6.0 },
    { x: 40, s: 3, d: 1.2, dur: 7.5 },
    { x: 52, s: 6, d: 2.1, dur: 6.8 },
    { x: 63, s: 4, d: 0.6, dur: 8.0 },
    { x: 74, s: 5, d: 1.8, dur: 7.0 },
    { x: 34, s: 3, d: 3.0, dur: 8.5 },
    { x: 58, s: 4, d: 2.6, dur: 6.2 },
    { x: 46, s: 5, d: 1.4, dur: 7.8 },
  ];
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {motes.map((m, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${m.x}%`,
            bottom: "8%",
            width: m.s,
            height: m.s,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, #fff8dc 0%, rgba(253,224,71,0.6) 60%, transparent 100%)",
            boxShadow: "0 0 8px rgba(253,224,71,0.7)",
            animation: `v2Dust ${m.dur}s ease-in-out ${m.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Vault-specific keyframes (Step B). Engine keyframes come from
 *  <JuiceKeyframes/>; these are the vault's bespoke flourishes. */
function VaultV2FX() {
  return (
    <style jsx global>{`
      @keyframes v2Ring {
        0%   { opacity: 0.9; transform: scale(0.35); }
        100% { opacity: 0;   transform: scale(2.6); }
      }
      @keyframes v2HaloSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes v2Shine {
        0%   { transform: translateX(-180%) skewX(-20deg); }
        60%  { transform: translateX(230%) skewX(-20deg); }
        100% { transform: translateX(230%) skewX(-20deg); }
      }
      @keyframes v2Dust {
        0%   { opacity: 0;    transform: translateY(0) scale(0.5); }
        15%  { opacity: 0.85; }
        85%  { opacity: 0.7;  }
        100% { opacity: 0;    transform: translateY(-210px) scale(1.15); }
      }
      @keyframes v2TextSheen {
        0%, 100% { background-position: 0% 50%; }
        50%      { background-position: 100% 50%; }
      }
      @keyframes v2PipPop {
        0%   { transform: scale(1); }
        45%  { transform: scale(1.6); }
        100% { transform: scale(1); }
      }
    `}</style>
  );
}
