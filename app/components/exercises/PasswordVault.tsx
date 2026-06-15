"use client";

/**
 * Password Vault — HOLOGRAPHIC ENERGY GATEWAY.
 *
 * A floating holographic gateway: a neon hex frame, concentric rotating
 * energy rings, a central plasma core, and five glowing hex-sigil locks
 * arranged in a clean pentagon. Solving a sigil ignites it and arcs energy
 * to the core; all five dilate the rings and bloom the core into the
 * PASSWORD MASTER relic.
 *
 * Composed from the shared cinematic engine (SceneShell / useHotspotPanel
 * / ChallengePanel / useClimaxSequence / useTimingScaler / RevealStage /
 * juice). Callback contract and questionKeys are `vault-{id}` +
 * `vault-opened`. Every flourish has a reduced-motion path.
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
  type RevealArtifact,
  JuiceKeyframes,
  fireBurst,
  FlashOverlay,
  Beams,
  SparkleField,
  SHAKE_MD,
  SHAKE_LG,
  TYPE,
} from "@/app/lib/cinematic";

/* ────────────────────────────────────────────────────────────── */
/* Props (unchanged)                                              */
/* ────────────────────────────────────────────────────────────── */

export interface PasswordVaultLock {
  id: string;
  ruleLabel: string;
  icon: string;
  prompt: string;
  choices: { text: string; isCorrect: boolean; explanation: string }[];
  speaker?: "adam" | "layla";
}

export interface PasswordVaultProps {
  locks: PasswordVaultLock[];
  guidance?: { intro?: string; progress?: string; complete?: string };
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
/* Geometry + reveal data                                         */
/* ────────────────────────────────────────────────────────────── */

/**
 * Five sigils on a pentagon ring (% offsets from the gateway centre),
 * leaving the centre free for the plasma core — fixes the legacy vault's
 * dial-over-PERSONAL overlap. Order follows the lock array.
 */
const LOCK_POSITIONS: Record<string, { x: number; y: number }> = {
  length:   { x:   0, y: -27 },
  mix:      { x:  26, y: -8 },
  personal: { x:  16, y:  22 },
  common:   { x: -16, y:  22 },
  secret:   { x: -26, y: -8 },
};

const DOOR_SIZE = 660; // gateway diameter (also the camera focus basis)
const ZOOM_FACTOR = 1.75;

const STAGE_MS = {
  armed: 360,
  anticipation: 900,
  unlocking: 620,
  opening: 1050,
  revealed: 420,
} as const;

const STAGE_ZOOM: Record<string, number> = {
  armed: 1.12,
  anticipation: 1.22,
  unlocking: 1.32,
  opening: 1.4,
  // The door blooms at 1.4×, then the camera PULLS BACK to 1.0 to frame the
  // whole treasure chamber — otherwise the artifacts crowd the shield.
  revealed: 1.0,
  master: 1.0,
};

const ARTIFACT_RECAP: Record<string, string> = {
  length:   "Long is strong",
  mix:      "Mix all the types",
  personal: "Never your name",
  common:   "Not a common word",
  secret:   "Only you and a parent",
};

// Crown arc ABOVE the shield, spread wide so no tile touches the relic.
const ARTIFACT_LAYOUT: { x: number; y: number; accent: string }[] = [
  { x: -42, y: -28, accent: "#00e5ff" }, // length (left)
  { x: -23, y: -46, accent: "#7eff97" }, // mix (upper-left)
  { x:   0, y: -52, accent: "#fde047" }, // personal (top)
  { x:  23, y: -46, accent: "#ff5fb3" }, // common (upper-right)
  { x:  42, y: -28, accent: "#a855f7" }, // secret (right)
];

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
  const { intensity, t, reduced } = useTimingScaler();

  const [doorReject, setDoorReject] = useState(0);
  const [showRevealUI, setShowRevealUI] = useState(false);
  const climaxStartedRef = useRef(false);
  const extraTimersRef = useRef<number[]>([]);

  // Establishing shot: hold a tight push-in on the sealed gateway, then
  // pull back to reveal the full ring + sigils.
  const [established, setEstablished] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setEstablished(true), reduced ? 0 : 1150);
    return () => window.clearTimeout(id);
  }, [reduced]);

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

  /* ───────── Climax (engine) ───────── */
  const climax = useClimaxSequence([
    { id: "armed", durationMs: STAGE_MS.armed, onEnter: () => audio.bossPhaseChange() },
    {
      id: "anticipation",
      durationMs: STAGE_MS.anticipation,
      onEnter: () => {
        for (let i = 0; i < locks.length; i++) {
          extraTimersRef.current.push(
            window.setTimeout(() => audio.starEarned(), i * t(120)),
          );
        }
      },
    },
    { id: "unlocking", durationMs: STAGE_MS.unlocking, onEnter: () => audio.bossHit() },
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
        onAnswered?.({ questionKey: "vault-opened", selectedIndex: 0, correctIndex: 0, wasCorrect: true });
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

  useEffect(() => {
    if (hotspot.allActive && !climaxStartedRef.current) {
      climaxStartedRef.current = true;
      climax.start();
    }
  }, [hotspot.allActive, climax]);

  /* ───────── Derived stage flags ───────── */
  const stage = climax.stage;
  const vaultLocked = stage !== null;
  const gatewayOpen = stage === "opening" || stage === "revealed" || stage === "master";
  const armed = stage === "armed";
  const shakeClass =
    stage === "anticipation" ? SHAKE_MD : stage === "unlocking" ? SHAKE_LG : "";
  const revealVisible = gatewayOpen;
  const revealActive = stage === "revealed" || stage === "master";

  /* ───────── Camera ───────── */
  const establishing = !established && !vaultLocked;
  const camera: SceneCamera = vaultLocked
    ? { kind: "focus", x: 0, y: 0, zoom: STAGE_ZOOM[stage] ?? 1.4 }
    : establishing
      ? { kind: "focus", x: 0, y: -4, zoom: 1.22 }
      : hotspot.camera;
  const cameraTransitionMs = vaultLocked ? 720 : establishing ? 0 : 900;

  /* ───────── Guidance ───────── */
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
  const charge = locks.length ? activeCount / locks.length : 0;

  return (
    <SceneShell
      aspectRatio={{ w: 16, h: 9 }}
      background="radial-gradient(ellipse at 50% 36%, #141a44 0%, #0a0e28 45%, #04050f 100%)"
      camera={camera}
      cameraTransitionMs={cameraTransitionMs}
      focusBasis={DOOR_SIZE}
      defaultZoom={ZOOM_FACTOR}
      shakeClass={shakeClass}
      maxWidth={1480}
      reserve={140}
      overlay={
        <>
          {/* Guidance ribbon (hidden during the final reveal) */}
          {!revealActive && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 30,
              padding: "8px 18px",
              borderRadius: 999,
              background: vaultLocked ? "rgba(35, 24, 9, 0.8)" : "rgba(12, 17, 42, 0.72)",
              border: vaultLocked
                ? "1px solid rgba(253, 224, 71, 0.55)"
                : "1px solid rgba(125, 240, 255, 0.3)",
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
          )}

          {/* Progress pips (hidden once the chamber reveals) */}
          {!revealActive && (
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
          )}

          {/* Scene vignette */}
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 8,
              pointerEvents: "none",
              background:
                "radial-gradient(ellipse at 50% 46%, transparent 38%, rgba(3,4,12,0.28) 78%, rgba(3,4,12,0.62) 100%)",
            }}
          />

          {/* CLANG flash + shockwave ring */}
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
                  width: 240,
                  height: 240,
                  borderRadius: "50%",
                  border: "4px solid rgba(125,240,255,0.95)",
                  boxShadow: "0 0 34px rgba(0,229,255,0.7), inset 0 0 24px rgba(0,229,255,0.4)",
                  animation: "v2Ring 640ms cubic-bezier(0.2,0.8,0.2,1) forwards",
                }}
              />
            </span>
          )}

          {/* Light bloom on opening */}
          <AnimatePresence>
            {(stage === "opening" || stage === "revealed" || stage === "master") && (
              <motion.div
                key="vault-burst"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: revealActive ? 0.5 : 0.95, scale: 1.7 }}
                exit={{ opacity: 0 }}
                transition={{ duration: intensity === 0 ? 0.2 : 1.0 }}
                aria-hidden
                style={{
                  position: "absolute",
                  top: "48%",
                  left: "50%",
                  width: 780,
                  height: 780,
                  transform: "translate(-50%, -50%)",
                  background:
                    "radial-gradient(circle at center, #ffffff 0%, rgba(125,240,255,0.7) 20%, rgba(124,92,255,0.4) 48%, transparent 74%)",
                  filter: "blur(34px)",
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
                  background: "rgba(4, 6, 18, 0.72)",
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

          {/* Reveal UI */}
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
                  initial={intensity === 0 ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: -12 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 240, damping: 16, delay: 0.05 }}
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
                  <GameButton variant="primary" size="lg" icon="→" onClick={() => onComplete(activeCount)}>
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
      {/* Keyframe libraries (mounted once) */}
      <JuiceKeyframes />
      <VaultV2FX />

      {/* Camera-transformed world */}
      <SpaceField intensity={intensity} />
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
        {/* Treasure chamber (engine) — revealed once the gateway dilates */}
        <RevealStage
          visible={revealVisible}
          active={revealActive}
          centrepiece={<RelicCore intensity={intensity} />}
          artifacts={artifacts}
          onCentrepieceReveal={() => audio.starEarned()}
          onArtifactReveal={() => audio.starEarned()}
        />
        {revealActive && <SparkleField intensity={intensity} />}
        {revealActive && <ChamberDust intensity={intensity} />}

        <EnergyGateway
          open={gatewayOpen}
          armed={armed}
          statusStage={stage}
          activeCount={activeCount}
          totalLocks={locks.length}
          charge={charge}
          doorReject={doorReject}
          intensity={intensity}
        >
          {(stage === "anticipation" || stage === "unlocking") && (
            <Beams positions={beamPositions} intensity={intensity} />
          )}
          {locks.map((lock, i) => (
            <HexSigil
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
        </EnergyGateway>
      </div>
    </SceneShell>
  );
}

/* ────────────────────────────────────────────────────────────── */
/* Holographic art                                                */
/* ────────────────────────────────────────────────────────────── */

/** Deep-space backdrop: nebula glow + drifting stars + a faint holo floor. */
function SpaceField({ intensity }: { intensity: number }) {
  const stars = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: (i * 53 + 11) % 100,
        top: (i * 31 + 7) % 86,
        size: 1 + (i % 3) * 0.6,
        delay: (i * 0.27) % 5,
        hue: i % 4 === 0 ? "#00e5ff" : i % 4 === 1 ? "#7c5cff" : i % 4 === 2 ? "#ff5fb3" : "#bfeaff",
      })),
    [],
  );
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {/* nebula blobs */}
      <div
        style={{
          position: "absolute",
          left: "-8%",
          top: "-6%",
          width: "62%",
          height: "62%",
          background: "radial-gradient(ellipse, rgba(0,229,255,0.16) 0%, transparent 64%)",
          filter: "blur(40px)",
          animation: intensity > 0 ? "v2Spin 90s linear infinite" : undefined,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: "-10%",
          bottom: "0%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(ellipse, rgba(124,92,255,0.2) 0%, transparent 66%)",
          filter: "blur(46px)",
        }}
      />
      {/* stars */}
      {stars.map((s, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: s.hue,
            boxShadow: `0 0 ${s.size * 4}px ${s.hue}`,
            opacity: 0.5,
            animation: intensity > 0 ? `cineLockPulse ${3 + (i % 3)}s ease-in-out ${s.delay}s infinite` : undefined,
          }}
        />
      ))}
      {/* holographic floor grid */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "34%",
          background:
            "linear-gradient(180deg, transparent 0%, rgba(0,229,255,0.05) 60%, rgba(0,229,255,0.1) 100%), repeating-linear-gradient(90deg, transparent 0 48px, rgba(125,240,255,0.08) 48px 49px)",
          transform: "perspective(620px) rotateX(64deg)",
          transformOrigin: "50% 100%",
          maskImage: "linear-gradient(180deg, transparent, #000 60%)",
          WebkitMaskImage: "linear-gradient(180deg, transparent, #000 60%)",
        }}
      />
    </div>
  );
}

/** Faint vertical data streams behind the gateway. */
function DataStreams({ intensity, muted }: { intensity: number; muted: boolean }) {
  if (intensity === 0) return null;
  const cols = [12, 26, 40, 60, 74, 88];
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        opacity: muted ? 0.06 : 0.14,
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
              "linear-gradient(180deg, transparent, rgba(125,240,255,0.6) 35%, rgba(125,240,255,0.85) 50%, rgba(125,240,255,0.6) 65%, transparent)",
            filter: "blur(0.6px)",
            animation: `cineStream ${5 + i * 0.6}s linear infinite`,
            animationDelay: `-${(i * 0.7) % 3}s`,
          }}
        />
      ))}
    </div>
  );
}

/** The holographic gateway: hex frame + rotating rings + plasma core + HUD. */
function EnergyGateway({
  open,
  armed,
  statusStage,
  activeCount,
  totalLocks,
  charge,
  doorReject,
  intensity,
  children,
}: {
  open: boolean;
  armed: boolean;
  statusStage: string | null;
  activeCount: number;
  totalLocks: number;
  charge: number;
  doorReject: number;
  intensity: number;
  children: React.ReactNode;
}) {
  const accent = armed ? "#fde047" : "#00e5ff";
  return (
    <>
      {/* Outer hex frame */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 8,
          opacity: open ? 0 : 1,
          transform: open ? "scale(1.35)" : "scale(1)",
          transition: "opacity 620ms ease, transform 760ms cubic-bezier(0.22,1,0.36,1)",
        }}
      >
        <svg viewBox="0 0 100 100" width="100%" height="100%" style={{ display: "block", filter: `drop-shadow(0 0 16px ${accent}aa)` }}>
          <defs>
            <linearGradient id="gwStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={armed ? "#fff3b0" : "#7df0ff"} />
              <stop offset="55%" stopColor={accent} />
              <stop offset="100%" stopColor={armed ? "#ff7a59" : "#7c5cff"} />
            </linearGradient>
            <radialGradient id="gwFill" cx="50%" cy="44%" r="60%">
              <stop offset="0%" stopColor="rgba(20,28,70,0.0)" />
              <stop offset="74%" stopColor="rgba(10,16,42,0.45)" />
              <stop offset="100%" stopColor="rgba(6,9,26,0.7)" />
            </radialGradient>
          </defs>
          <polygon points="50,2.5 95,27 95,73 50,97.5 5,73 5,27" fill="url(#gwFill)" stroke="url(#gwStroke)" strokeWidth="1.4" strokeLinejoin="round" />
          <polygon points="50,9 88,30.5 88,69.5 50,91 12,69.5 12,30.5" fill="none" stroke={accent} strokeOpacity="0.3" strokeWidth="0.5" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Rotating energy rings */}
      <EnergyRings open={open} statusStage={statusStage} charge={charge} intensity={intensity} />

      {/* Central plasma core */}
      <EnergyCore open={open} statusStage={statusStage} charge={charge} intensity={intensity} />

      {/* Wrong-answer reject pulse */}
      {doorReject > 0 && (
        <span
          key={doorReject}
          aria-hidden
          style={{
            position: "absolute",
            inset: -10,
            borderRadius: "50%",
            background: "radial-gradient(circle at center, rgba(239,68,68,0.5), transparent 68%)",
            pointerEvents: "none",
            mixBlendMode: "screen",
            animation: "cineReject 480ms ease-out",
            zIndex: 4,
          }}
        />
      )}

      {/* HUD status readout */}
      <GatewayStatus statusStage={statusStage} activeCount={activeCount} totalLocks={totalLocks} />

      {/* Sigils + beams — fade out as the gateway opens */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: open ? 0 : 1,
          pointerEvents: open ? "none" : "auto",
          transition: "opacity 420ms ease",
        }}
      >
        {children}
      </div>
    </>
  );
}

function EnergyRings({
  open,
  statusStage,
  charge,
  intensity,
}: {
  open: boolean;
  statusStage: string | null;
  charge: number;
  intensity: number;
}) {
  const spinMul =
    statusStage === "anticipation" ? 3.2 : statusStage === "unlocking" ? 6 : 1 + charge * 1.6;
  const rings = [
    { d: 590, dur: 30, rev: false },
    { d: 474, dur: 22, rev: true },
    { d: 372, dur: 38, rev: false },
  ];
  return (
    <>
      {rings.map((r, i) => (
        <div
          key={i}
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: r.d,
            height: r.d,
            marginLeft: -r.d / 2,
            marginTop: -r.d / 2,
            opacity: open ? 0 : 1,
            transform: open ? "scale(1.5)" : "scale(1)",
            transition: "opacity 560ms ease, transform 720ms cubic-bezier(0.22,1,0.36,1)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: `1.5px dashed rgba(125,240,255,${0.22 + charge * 0.4})`,
              boxShadow: `0 0 16px rgba(0,229,255,${0.12 + charge * 0.3})`,
              animation:
                intensity > 0 && !open
                  ? `${r.rev ? "v2SpinRev" : "v2Spin"} ${Math.max(2, r.dur / spinMul)}s linear infinite`
                  : undefined,
            }}
          />
          {/* one bright orbiting node per ring */}
          {intensity > 0 && !open && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                animation: `${r.rev ? "v2SpinRev" : "v2Spin"} ${Math.max(2, r.dur / spinMul)}s linear infinite`,
              }}
            >
              <span
                style={{
                  position: "absolute",
                  top: -3,
                  left: "50%",
                  width: 6,
                  height: 6,
                  marginLeft: -3,
                  borderRadius: "50%",
                  background: "#bfeaff",
                  boxShadow: "0 0 10px #00e5ff, 0 0 18px #00e5ff",
                }}
              />
            </div>
          )}
        </div>
      ))}
    </>
  );
}

function EnergyCore({
  open,
  statusStage,
  charge,
  intensity,
}: {
  open: boolean;
  statusStage: string | null;
  charge: number;
  intensity: number;
}) {
  const hot = statusStage === "armed" || statusStage === "anticipation" || statusStage === "unlocking";
  const size = 150;
  const inner = hot ? "#fff3b0" : "#7df0ff";
  const mid = hot ? "#ff9a4d" : "#1f6ea3";
  const glow = hot ? "rgba(253,224,71,0.85)" : "rgba(0,229,255,0.7)";
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        width: size,
        height: size,
        marginLeft: -size / 2,
        marginTop: -size / 2,
        opacity: open ? 0 : 1,
        transition: "opacity 280ms ease",
      }}
    >
      {/* soft outer aura, brightens with charge */}
      <span
        style={{
          position: "absolute",
          inset: -34,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${glow} 0%, transparent 66%)`,
          filter: "blur(14px)",
          opacity: 0.35 + charge * 0.5,
          animation: intensity > 0 ? "cineCoreAura 3.4s ease-in-out infinite" : undefined,
        }}
      />
      {/* swirling plasma */}
      {intensity > 0 && (
        <span
          style={{
            position: "absolute",
            inset: 4,
            borderRadius: "50%",
            background:
              "conic-gradient(from 0deg, transparent, rgba(0,229,255,0.55), rgba(124,92,255,0.5), transparent, rgba(0,229,255,0.55), transparent)",
            filter: "blur(3px)",
            opacity: 0.4 + charge * 0.45,
            mixBlendMode: "screen",
            animation: "v2Spin 7s linear infinite",
          }}
        />
      )}
      {/* core orb */}
      <span
        style={{
          position: "absolute",
          inset: 22,
          borderRadius: "50%",
          background: `radial-gradient(circle at 38% 32%, #ffffff 0%, ${inner} 32%, ${mid} 70%, #08172b 100%)`,
          boxShadow: `0 0 30px ${glow}, inset 0 0 14px rgba(255,255,255,0.55), inset 0 -8px 14px rgba(0,0,0,0.4)`,
          animation: intensity > 0 ? "cineArtifactBob 4.2s ease-in-out infinite" : undefined,
        }}
      />
      {/* tiny core sparkle */}
      <span
        style={{
          position: "absolute",
          top: "40%",
          left: "42%",
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#fff",
          filter: "blur(1px)",
          opacity: 0.85,
        }}
      />
    </div>
  );
}

function GatewayStatus({
  statusStage,
  activeCount,
  totalLocks,
}: {
  statusStage: string | null;
  activeCount: number;
  totalLocks: number;
}) {
  const text =
    statusStage === "revealed" || statusStage === "master"
      ? "VAULT OPEN"
      : statusStage === "opening"
        ? "UNSEALING"
        : statusStage === "unlocking"
          ? "ACCESS GRANTED"
          : statusStage === "anticipation"
            ? "VERIFYING"
            : statusStage === "armed"
              ? "CHARGING"
              : `SECURED ${activeCount.toString().padStart(2, "0")}/${totalLocks.toString().padStart(2, "0")}`;
  const color =
    statusStage === "revealed" || statusStage === "master"
      ? "#7eff97"
      : statusStage && statusStage !== "armed"
        ? "#fde047"
        : "#7df0ff";
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: "13%",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 3,
        fontFamily: TYPE.mono,
        fontSize: 10,
        letterSpacing: "0.34em",
        fontWeight: 800,
        color,
        textShadow: "0 0 10px currentColor",
        transition: "color 260ms ease",
      }}
    >
      {text}
      <span
        style={{
          width: 54,
          height: 1,
          background: "currentColor",
          opacity: 0.5,
          boxShadow: "0 0 6px currentColor",
        }}
      />
    </div>
  );
}

/** A hexagonal sigil lock. */
function HexSigil({
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
  const stroke = active ? "#7eff97" : "#00e5ff";
  const SIZE = 104;
  const HEX = "50,4 92,27 92,73 50,96 8,73 8,27";

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
        width: SIZE,
        height: SIZE,
        minWidth: 44,
        minHeight: 44,
        border: "none",
        background: "transparent",
        padding: 0,
        cursor: disabled ? "default" : "pointer",
        WebkitTapHighlightColor: "transparent",
        opacity: entered || intensity === 0 ? 1 : 0,
        transition: `opacity 460ms ease ${index * 90}ms`,
        outline: "none",
      }}
    >
      {/* glow halo */}
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: -12,
          borderRadius: "50%",
          background: active
            ? "radial-gradient(circle, rgba(126,255,151,0.55) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(0,229,255,0.5) 0%, transparent 70%)",
          filter: lifted ? "blur(11px) brightness(1.4)" : "blur(9px)",
          transition: "filter 180ms ease",
          animation:
            !active && !focused && !hover && intensity > 0
              ? "cineLockPulse 2.4s ease-in-out infinite"
              : undefined,
        }}
      />
      {/* hex body */}
      <motion.span
        aria-hidden
        animate={
          activatedJustNow && intensity > 0
            ? { scale: [1, 1.24, 1.06, 1], rotate: [0, 8, -4, 0] }
            : { scale: lifted ? 1.09 : 1, rotate: 0 }
        }
        transition={
          activatedJustNow
            ? { duration: 0.6 }
            : { type: "spring", stiffness: 360, damping: 22 }
        }
        style={{ position: "absolute", inset: 0, display: "block" }}
      >
        <svg
          viewBox="0 0 100 100"
          width={SIZE}
          height={SIZE}
          style={{ display: "block", filter: `drop-shadow(0 0 10px ${stroke})` }}
        >
          <defs>
            <radialGradient id={`hex-${lock.id}`} cx="38%" cy="32%" r="72%">
              <stop offset="0%" stopColor={active ? "rgba(126,255,151,0.5)" : "rgba(0,229,255,0.4)"} />
              <stop offset="60%" stopColor={active ? "rgba(52,211,153,0.22)" : "rgba(31,110,163,0.22)"} />
              <stop offset="100%" stopColor="rgba(8,18,40,0.85)" />
            </radialGradient>
          </defs>
          <polygon points={HEX} fill={`url(#hex-${lock.id})`} stroke={stroke} strokeWidth={focused ? 4.5 : 2.5} strokeLinejoin="round" />
          <polygon points="50,17 80,33.5 80,66.5 50,83 20,66.5 20,33.5" fill="none" stroke={stroke} strokeOpacity="0.4" strokeWidth="1" strokeLinejoin="round" />
        </svg>
      </motion.span>

      {/* icon / check */}
      <span
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          fontSize: 27,
          filter: active
            ? "drop-shadow(0 0 8px rgba(126,255,151,0.9))"
            : "drop-shadow(0 0 6px rgba(0,229,255,0.7))",
        }}
      >
        {active ? "✓" : lock.icon}
      </span>

      {/* activation shockwave */}
      {activatedJustNow && intensity > 0 && (
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
              width: 100,
              height: 100,
              borderRadius: "50%",
              border: "3px solid rgba(126,255,151,0.9)",
              boxShadow: "0 0 16px rgba(126,255,151,0.6)",
              animation: "v2Ring 680ms cubic-bezier(0.2,0.8,0.2,1) forwards",
            }}
          />
        </span>
      )}

      {/* label */}
      <span
        style={{
          position: "absolute",
          left: "50%",
          bottom: -19,
          transform: "translateX(-50%)",
          fontSize: 9,
          letterSpacing: "0.18em",
          fontWeight: 800,
          fontFamily: TYPE.mono,
          color: active ? "#7eff97" : "#7df0ff",
          textShadow: active ? "0 0 8px rgba(126,255,151,0.6)" : "0 0 8px rgba(0,229,255,0.5)",
          whiteSpace: "nowrap",
        }}
      >
        {lock.ruleLabel}
      </span>
    </button>
  );
}

/**
 * The reward relic shown in the treasure chamber — the PASSWORD MASTER
 * shield, now a holographic emblem with a rotating ray halo, pulsing aura
 * and a metallic glint.
 */
function RelicCore({ intensity }: { intensity: number }) {
  return (
    <div
      style={{
        position: "relative",
        width: 168,
        height: 193,
        animation: intensity > 0 ? "cineShieldFloat 4.5s ease-in-out infinite" : undefined,
        filter:
          "drop-shadow(0 14px 28px rgba(253,224,71,0.35)) drop-shadow(0 0 22px rgba(0,229,255,0.45))",
      }}
    >
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
      <svg viewBox="0 0 200 230" width="168" height="193" style={{ display: "block", position: "relative" }}>
        <defs>
          <linearGradient id="relicFill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#ff7a59" />
            <stop offset="100%" stopColor="#ff5fb3" />
          </linearGradient>
          <linearGradient id="relicRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fff8dc" />
            <stop offset="50%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#ff7a59" />
          </linearGradient>
        </defs>
        <path d="M100 8 L184 38 V120 C184 168 148 200 100 220 C52 200 16 168 16 120 V38 Z" fill="url(#relicFill)" stroke="url(#relicRim)" strokeWidth="5" />
        <path d="M100 30 L162 53 V118 C162 156 134 184 100 200 C66 184 38 156 38 118 V53 Z" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <text x="100" y="108" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="34" fill="#1a1033">🔐</text>
        <text x="100" y="148" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="11" fill="#1a1033" letterSpacing="2">PASSWORD</text>
        <text x="100" y="166" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="900" fontSize="13" fill="#1a1033" letterSpacing="2.5">MASTER</text>
      </svg>
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
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
              mixBlendMode: "screen",
              animation: "v2Shine 3.4s ease-in-out infinite",
            }}
          />
        </span>
      )}
    </div>
  );
}

/** Warm golden motes drifting up through the open chamber. */
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
            background: "radial-gradient(circle, #fff8dc 0%, rgba(253,224,71,0.6) 60%, transparent 100%)",
            boxShadow: "0 0 8px rgba(253,224,71,0.7)",
            animation: `v2Dust ${m.dur}s ease-in-out ${m.d}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

/** Vault-specific keyframes. Engine keyframes come from <JuiceKeyframes/>. */
function VaultV2FX() {
  return (
    <style jsx global>{`
      @keyframes v2Ring {
        0%   { opacity: 0.9; transform: scale(0.35); }
        100% { opacity: 0;   transform: scale(2.6); }
      }
      @keyframes v2Spin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes v2SpinRev {
        from { transform: rotate(0deg); }
        to   { transform: rotate(-360deg); }
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
