"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { playSound as playSFX, playBGM, stopBGM } from "@/app/lib/sounds";
import { useGameAudio } from "@/app/lib/gameEngine";
import { addXP, type RankInfo } from "@/app/lib/progression";
import {
  correctAnswerBurst,
  badgeEarnedCelebration,
  wrongAnswerShake,
} from "@/app/lib/celebrations";
import LessonHUD from "@/app/components/LessonHUD";
// CharacterGuide swap: the legacy PNG-only component is replaced with
// RiveCharacterGuide, which has the same prop API but adds a Rive
// runtime branch (currently dormant - PNG fallback active until a
// .riv asset is committed). Strict reduced-motion users always get
// the PNG fallback.
import RiveCharacterGuide, {
  type CharacterMood,
} from "@/app/components/lesson/RiveCharacterGuide";
import StoryCutscene from "@/app/components/StoryCutscene";
import ScreenTransition, {
  type TransitionType,
} from "@/app/components/ScreenTransition";
import ScreenShake from "@/app/components/ScreenShake";
import ExerciseErrorBoundary from "@/app/components/ExerciseErrorBoundary";
import LessonAmbience from "@/app/components/LessonAmbience";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import GameButton from "@/app/components/lesson/GameButton";
import LessonStage, {
  LESSON_HUD_HEIGHT,
} from "@/app/components/lesson/LessonStage";
import { ComfortModeProvider, useComfortMode } from "@/app/lib/comfortMode";
import { useLessonProgress } from "@/app/lib/useLessonProgress";
import { analytics } from "@/app/lib/analytics";

// Exercise components
import CyberScanner from "@/app/components/exercises/CyberScanner";
import ProtectTheData from "@/app/components/exercises/ProtectTheData";
import PasswordLab from "@/app/components/exercises/PasswordLab";
import CrackTheCode from "@/app/components/exercises/CrackTheCode";
import ConveyorBelt from "@/app/components/exercises/ConveyorBelt";
import WeakSorter from "@/app/components/exercises/WeakSorter";
import PasswordHospital from "@/app/components/exercises/PasswordHospital";
import PopupPanic from "@/app/components/exercises/PopupPanic";
import ThreeRandomWords from "@/app/components/exercises/ThreeRandomWords";
import AccountRescue from "@/app/components/exercises/AccountRescue";
import ChooseYourPath from "@/app/components/exercises/ChooseYourPath";
import MemoryMatch from "@/app/components/exercises/MemoryMatch";
import FirewallBuilder from "@/app/components/exercises/FirewallBuilder";
import SpamBlaster from "@/app/components/exercises/SpamBlaster";
import CyberMaze from "@/app/components/exercises/CyberMaze";
import PhishInspector from "@/app/components/exercises/PhishInspector";
import PasswordVault from "@/app/components/exercises/PasswordVault";
import MissionDebrief from "@/app/components/lesson/MissionDebrief";
import StickerUnlock from "@/app/components/lesson/StickerUnlock";
import BossVictoryScene from "@/app/components/lesson/BossVictoryScene";
import { awardStickers } from "@/app/lib/stickers.actions";

import {
  getWeekContent,
  type ScreenDef,
  type WeekContent,
} from "@/app/lesson/weekContent";

const VALID_MOODS: ReadonlySet<CharacterMood> = new Set([
  "idle",
  "curious",
  "excited",
  "worried",
  "thinking",
  "thumbsup",
]);
function toMood(raw: string | undefined): CharacterMood {
  return raw && VALID_MOODS.has(raw as CharacterMood) ? (raw as CharacterMood) : "idle";
}

const LessonArena3D = dynamic(
  () => import("@/app/components/game/LessonArena3D"),
  { ssr: false }
);
const BossBattle = dynamic(
  () => import("@/app/components/game/BossBattle"),
  { ssr: false }
);

/**
 * Set of screen types treated as "interactive exercise" for chrome
 * decisions: which transition fires, which BGM plays, and whether
 * Adam/Layla's floating character guides are mounted.
 *
 * Exercise screens want a clean, undistracted playable area - the
 * persistent character cards on either side fight for attention with
 * the gameplay, so we hide them on these screens. Info / mission /
 * completion / cutscene screens still get them since those screens
 * ARE the narration.
 */
const EXERCISE_SCREEN_TYPES = new Set<ScreenDef["type"]>([
  "cyberScanner",
  "protectTheData",
  "passwordLab",
  "crackTheCode",
  "conveyorBelt",
  "weakSorter",
  "passwordHospital",
  "popupPanic",
  "threeRandomWords",
  "accountRescue",
  "chooseYourPath",
  "memoryMatch",
  "firewallBuilder",
  "spamBlaster",
  "cyberMaze",
  "phishInspector",
  "missionDebrief",
  "stickerUnlock",
  "passwordVault",
]);

/**
 * Choose a transition style per screen type - exercise screens get a
 * fade-scale lens-change feel; boss battle is a dramatic wipe.
 */
function transitionForScreen(def: ScreenDef | undefined, dir: "forward" | "back"): TransitionType {
  if (!def) return dir === "back" ? "slideLeft" : "slideRight";
  if (def.type === "bossBattle") return "wipeDown";
  if (EXERCISE_SCREEN_TYPES.has(def.type)) return "fadeScale";
  return dir === "back" ? "slideLeft" : "slideRight";
}

/* ─────────────── RESUME BANNER ───────────────
 * Small top-of-page overlay that appears when the lesson page mounts
 * and finds an unfinished LessonAttempt. The child picks Continue
 * (jump back to last screen) or Restart from beginning (fresh
 * attempt). No auto-jump - we always wait for an explicit choice.
 */
function ResumeBanner({
  resumeIndex,
  totalScreens,
  onContinue,
  onRestart,
}: {
  resumeIndex: number;
  totalScreens: number;
  onContinue: () => void;
  onRestart: () => void;
}) {
  return (
    <div
      role="dialog"
      aria-label="Resume lesson"
      style={{
        position: "fixed",
        top: 80,
        left: 16,
        right: 16,
        zIndex: 70,
        margin: "0 auto",
        maxWidth: 520,
        background: "rgba(15, 21, 48, 0.95)",
        border: "1px solid rgba(0, 229, 255, 0.5)",
        borderRadius: 16,
        padding: "16px 18px",
        boxShadow: "0 18px 40px rgba(0, 0, 0, 0.45), 0 0 24px rgba(0, 229, 255, 0.18)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        fontFamily: "'DM Sans', system-ui, sans-serif",
        color: "#e7ecff",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 4, color: "#7df0ff" }}>
        Welcome back!
      </div>
      <div style={{ fontSize: 13, color: "#cbd5e1", marginBottom: 12 }}>
        You stopped at screen {resumeIndex + 1} of {totalScreens}. Pick up where
        you left off, or start fresh.
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={onContinue}
          autoFocus
          style={{
            background: "linear-gradient(135deg, #00e5ff, #7c5cff)",
            color: "#0f1530",
            fontWeight: 800,
            borderRadius: 12,
            padding: "10px 18px",
            fontSize: 14,
            border: "none",
            cursor: "pointer",
          }}
        >
          Continue →
        </button>
        <button
          type="button"
          onClick={onRestart}
          style={{
            background: "transparent",
            color: "#93c5fd",
            fontWeight: 700,
            borderRadius: 12,
            padding: "10px 18px",
            fontSize: 14,
            border: "1.5px solid rgba(96,165,250,0.55)",
            cursor: "pointer",
          }}
        >
          Restart from beginning
        </button>
      </div>
    </div>
  );
}

/* ─────────────── NOT FOUND / COMING SOON FALLBACKS ─────────────── */

function WeekNotReady({ week }: { week: number }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a1a 0%, #1a1033 100%)",
        color: "#e2e8f0",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 72, marginBottom: 16 }}>🚧</div>
      <h1 style={{ fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
        Week {week} is on the way!
      </h1>
      <p style={{ color: "#94a3b8", maxWidth: 420, marginBottom: 24 }}>
        This week&apos;s mission hasn&apos;t landed yet. Check back soon -
        we&apos;re adding new content all the time.
      </p>
      <Link
        href="/cyberheroes"
        style={{
          background: "linear-gradient(135deg, #f97316, #f59e0b)",
          color: "#fff",
          fontWeight: 800,
          padding: "14px 32px",
          borderRadius: 12,
          textDecoration: "none",
          boxShadow: "0 0 20px rgba(249,115,22,0.4)",
        }}
      >
        Back to Cyber Heroes
      </Link>
    </div>
  );
}

/* ─────────────── FULL-SCREEN CONTENT SCREEN WRAPPERS ─────────────── */

function FullScene({ children, bg, glow }: { children: React.ReactNode; bg?: string; glow?: string }) {
  // Thin wrapper around the shared LessonStage. Existing call sites
  // keep their <FullScene bg=… glow=…> usage and inherit the new
  // viewport-safe sizing (100dvh - HUD - safe-area). The glow
  // cross-fade keyframe lives at the document level so every stage
  // can reference it without duplicating the @keyframes block.
  return (
    <LessonStage bg={bg} glow={glow}>
      {children}
    </LessonStage>
  );
}

// Document-level keyframe for the FullScene/LessonStage glow cross-fade.
// Injected once at module load instead of per-render.
if (typeof document !== "undefined") {
  const KEY = "ax-fullscene-glow-keyframes";
  if (!document.getElementById(KEY)) {
    const style = document.createElement("style");
    style.id = KEY;
    style.textContent = `@keyframes fullSceneGlowIn { from { opacity: 0 } to { opacity: 0.3 } }`;
    document.head.appendChild(style);
  }
}

function OrangeButton({ onClick, children, sound = "click" }: { onClick: () => void; children: React.ReactNode; sound?: string }) {
  // Thin compat wrapper over <GameButton>. Existing callers pass
  // `sound` to override the click SFX; everything else (hover lift,
  // press scale, disabled, comfort-mode awareness) comes from
  // GameButton.
  return (
    <GameButton variant="primary" size="lg" clickSound={sound} onClick={onClick}>
      {children}
    </GameButton>
  );
}

function Card({ children, extra }: { children: React.ReactNode; extra?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: "rgba(17,24,39,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 24,
        padding: 28,
        maxWidth: 640,
        margin: "0 auto",
        ...extra,
      }}
    >
      {children}
    </div>
  );
}

/* ─────────────── MAIN ─────────────── */

function LessonLoading() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a1a 0%, #1a1033 100%)",
        color: "#e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Space Grotesk', system-ui, sans-serif",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>⚡</div>
        <div style={{ fontSize: 14, color: "#94a3b8", letterSpacing: 1 }}>
          Loading lesson…
        </div>
      </div>
    </div>
  );
}

export default function DynamicLesson() {
  return (
    <ComfortModeProvider>
      <DynamicLessonInner />
    </ComfortModeProvider>
  );
}

function DynamicLessonInner() {
  const rawParams = useParams<{ week: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const comfort = useComfortMode();
  const audio = useGameAudio();

  // QA deep-link: ?screen=N jumps straight to that screen on mount.
  // Bypasses the resume banner. Out-of-range values are clamped.
  const deepLinkScreen = (() => {
    const raw = searchParams?.get("screen");
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.floor(n) : null;
  })();

  // `useParams` in App Router is synchronous, but we still guard for the
  // edge case where a value comes through as `undefined` (empty routing state)
  // and for non-numeric segments like `/lesson/abc`.
  const rawWeek = rawParams?.week;
  const weekNum =
    typeof rawWeek === "string" && rawWeek.length > 0 ? Number(rawWeek) : NaN;
  const content = useMemo(
    () => (Number.isFinite(weekNum) ? getWeekContent(weekNum) : null),
    [weekNum]
  );

  // One-time debug trace on mount / when params change - visible in the
  // browser console so the user can paste it back if something is off.
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log("[DynamicLesson] rawParams:", rawParams, "weekNum:", weekNum, "content:", content ? `Week ${content.weekNumber}: ${content.title}` : null);
  }, [rawParams, weekNum, content]);

  // All hooks run unconditionally - we short-circuit with a fallback render below.
  // Intro cutscene disabled - lesson lands directly on screen 0. Default the
  // flag to true so the StoryCutscene early return is bypassed.
  const [cutsceneDone, setCutsceneDone] = useState(true);
  const [screen, setScreen] = useState(0);
  const [lessonXp, setLessonXp] = useState(0);
  const [wrongCounts, setWrongCounts] = useState<Record<number, number>>({});
  const [shakeTrigger, setShakeTrigger] = useState(0);
  const [showBoss, setShowBoss] = useState(false);
  const [bossDone, setBossDone] = useState(false);
  const [bossStats, setBossStats] = useState<{ combo: number; accuracy: number; xp: number } | null>(null);
  const [arena3DMood, setArena3DMood] = useState<"normal" | "correct" | "wrong" | "celebration">("normal");
  const [arena3DPulse, setArena3DPulse] = useState(0);
  const [pendingLevelUp, setPendingLevelUp] = useState<null | {
    oldRank: RankInfo;
    newRank: RankInfo;
    totalXP: number;
  }>(null);

  const navDirRef = useRef<"forward" | "back">("forward");
  const arenaMoodTimerRef = useRef<number | null>(null);

  const totalScreens = content?.screens.length ?? 0;

  /* ─────────── Persistence + analytics ───────────
   * useLessonProgress starts/resumes a LessonAttempt on mount, then
   * exposes save callbacks the lesson wires into its navigate + boss
   * end paths. All server calls are best-effort - failures are
   * logged but don't crash gameplay. */
  const screenTypes = useMemo<readonly string[]>(
    () => (content?.screens ?? []).map((s) => s.type),
    [content]
  );
  const progress = useLessonProgress({
    weekNumber: Number.isFinite(weekNum) ? weekNum : 0,
    screenTypes,
  });
  // Track XP at the start of each screen so we can compute per-screen
  // XP earned (lessonXp delta) when saving the screen result.
  const screenXpBaselineRef = useRef<number>(0);
  // Avoid double-completing or double-quitting on unmount.
  const lessonCompletedRef = useRef<boolean>(false);
  // Guard so the sticker server action only fires once per lesson
  // life, even if the child bounces forward/back across the unlock
  // screen. The action is idempotent server-side too, but skipping
  // the round-trip is cheaper and keeps logs clean.
  const stickersAwardedRef = useRef<boolean>(false);
  // Resume - we no longer auto-jump. The hook surfaces a
  // `pendingResume` flag when an unfinished attempt is found; we
  // render a small banner with Continue / Restart and only change
  // `screen` once the child picks. For brand-new attempts the banner
  // never appears so the lesson starts on screen 0 immediately.
  const resumedRef = useRef<boolean>(false);
  useEffect(() => {
    if (resumedRef.current) return;
    if (progress.resumeIndex === null) return;

    // QA deep-link wins over both first-visit and pending-resume.
    // We clamp to valid range, jump, mark the clock, dismiss the
    // resume banner if it was about to show, and flag done.
    if (deepLinkScreen !== null && content) {
      const target = Math.max(
        0,
        Math.min(content.screens.length - 1, deepLinkScreen)
      );
      setScreen(target);
      progress.markScreenStart(target);
      screenXpBaselineRef.current = lessonXp;
      if (progress.pendingResume) progress.acknowledgeResume();
      resumedRef.current = true;
      return;
    }

    // First-visit case: no progress to resume, just mark the
    // starting stopwatch and move on.
    if (!progress.pendingResume) {
      progress.markScreenStart(screen);
      screenXpBaselineRef.current = lessonXp;
      resumedRef.current = true;
    }
  }, [progress, screen, lessonXp, deepLinkScreen, content]);

  const onResumeContinue = useCallback(() => {
    const target = Math.max(
      0,
      Math.min((content?.screens.length ?? 1) - 1, progress.resumeIndex ?? 0)
    );
    setScreen(target);
    progress.markScreenStart(target);
    screenXpBaselineRef.current = lessonXp;
    progress.acknowledgeResume();
    resumedRef.current = true;

    // Edge case: the previous session reached the completion screen
    // but reloaded before completeAttempt committed (e.g. tab
    // refresh, navigation, transient network drop). The stored row
    // is unfinished AT the completion screen. Re-fire complete() to
    // close it off. Safe to pass totalXp = lessonXp here (0 on
    // fresh mount) because completeAttempt is raise-only on totalXp
    // and finalScreenIndex - it can't lower previously stored
    // values.
    const arrivingType = content?.screens[target]?.type;
    if (arrivingType === "completion" && !lessonCompletedRef.current) {
      lessonCompletedRef.current = true;
      progress.complete({
        totalXp: lessonXp,
        finalScreenIndex: target,
      });
    }
  }, [content?.screens, progress, lessonXp]);

  const onResumeRestart = useCallback(async () => {
    setScreen(0);
    setLessonXp(0);
    setWrongCounts({});
    setBossDone(false);
    setBossStats(null);
    screenXpBaselineRef.current = 0;
    await progress.restart();
    progress.markScreenStart(0);
    resumedRef.current = true;
  }, [progress]);

  // Mirror `screen` into a ref so the unmount cleanup can read the
  // latest value (the cleanup callback captures the initial closure).
  const screenRef = useRef<number>(0);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // exercise_quit on unmount if the lesson isn't completed.
  useEffect(() => {
    return () => {
      if (lessonCompletedRef.current) return;
      progress.reportExerciseQuit(screenRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Window dims for the 3D arena
  const [winDim, setWinDim] = useState<{ w: number; h: number }>(() =>
    typeof window === "undefined" ? { w: 1280, h: 720 } : { w: window.innerWidth, h: window.innerHeight }
  );
  useEffect(() => {
    const onResize = () => setWinDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Sticker award - fired the first time a stickerUnlock screen is
  // mounted in this lesson run. We pull the catalogue ids from the
  // screen def itself so the data file stays the source of truth,
  // and we swallow auth failures (unauthed preview = silent no-op).
  useEffect(() => {
    if (!content || stickersAwardedRef.current) return;
    const def = content.screens[screen];
    if (def?.type !== "stickerUnlock") return;
    const ids = def.stickers.map((s) => s.id);
    if (ids.length === 0) return;
    stickersAwardedRef.current = true;
    awardStickers(ids).catch((err) => {
      // eslint-disable-next-line no-console
      console.warn("[DynamicLesson] awardStickers failed:", err);
    });
  }, [screen, content]);

  // BGM: lesson for content screens, battle for exercise/boss.
  useEffect(() => {
    if (!content || !cutsceneDone) return;
    const def = content.screens[screen];
    // bgmBattle is RESERVED for the final boss fight only - the
    // urgent track was bleeding into exercise screens like
    // CyberScanner and undermining the calm "learning" tone. Every
    // non-boss screen now plays bgmLesson (faint, ambient bed).
    const isBoss = def?.type === "bossBattle";
    try {
      playBGM(isBoss ? "bgmBattle" : "bgmLesson");
    } catch {
      /* BGM optional */
    }
  }, [screen, content, cutsceneDone]);

  // Signature SFX on key screen entries. One-shot per screen change
  // - fires when the screen index lands on a mission brief or final
  // completion. Boss victory has its own SFX wired inside
  // BossVictoryScene; vault open/reveal inside PasswordVault.
  useEffect(() => {
    if (!content || !cutsceneDone) return;
    const def = content.screens[screen];
    if (!def) return;
    if (def.type === "mission") {
      // Small delay so the screen-transition cue doesn't clash with
      // the heroic mission-start sting.
      const id = window.setTimeout(() => audio.signature("mission-start"), 320);
      return () => window.clearTimeout(id);
    }
    if (def.type === "completion") {
      // Big fanfare first, then the warmer badge-bloom shimmer.
      // Staggered so they read as a phrase, not a clash.
      const t1 = window.setTimeout(() => audio.signature("mission-complete"), 240);
      const t2 = window.setTimeout(() => audio.signature("badge-bloom"), 1100);
      return () => {
        window.clearTimeout(t1);
        window.clearTimeout(t2);
      };
    }
  }, [screen, content, cutsceneDone, audio]);

  useEffect(
    () => () => {
      try {
        stopBGM();
      } catch {
        /* noop */
      }
      if (arenaMoodTimerRef.current) window.clearTimeout(arenaMoodTimerRef.current);
    },
    []
  );

  const setArenaMoodBrief = useCallback((m: "correct" | "wrong" | "celebration") => {
    const duration = m === "celebration" ? 2000 : m === "correct" ? 500 : 400;
    setArena3DMood(m);
    if (arenaMoodTimerRef.current) window.clearTimeout(arenaMoodTimerRef.current);
    arenaMoodTimerRef.current = window.setTimeout(() => setArena3DMood("normal"), duration);
  }, []);

  const navigate = useCallback(
    (to: number) => {
      if (!content) return;
      playSFX("transition");
      setScreen((prev) => {
        navDirRef.current = to < prev ? "back" : "forward";
        const next = Math.max(0, Math.min(totalScreens - 1, to));

        // Persistence: save the screen we're LEAVING (only when moving
        // forward past the leaving screen and only when it's a real
        // advance, not a back-navigation).
        if (next > prev) {
          const w = wrongCounts[prev] ?? 0;
          const stars = w === 0 ? 3 : w <= 1 ? 2 : 1;
          const xpEarned = Math.max(0, lessonXp - screenXpBaselineRef.current);
          const leavingType = content.screens[prev]?.type ?? "unknown";
          progress.saveScreen({
            screenIndex: prev,
            wrongCount: w,
            xpEarned,
            starsEarned: stars,
          });
          // Baseline + clock reset for the screen we're entering.
          screenXpBaselineRef.current = lessonXp;
          progress.markScreenStart(next);

          // Lesson completion - when the child reaches the `completion`
          // screen the lesson is effectively over (even if they stay
          // on the screen). Mark complete + emit analytics here so
          // the row gets a `completedAt` even if they close the tab
          // before clicking the final CTA.
          const arrivingType = content.screens[next]?.type;
          if (arrivingType === "completion" && !lessonCompletedRef.current) {
            lessonCompletedRef.current = true;
            progress.complete({
              totalXp: lessonXp,
              finalScreenIndex: next,
            });
          }
        }
        return next;
      });
    },
    [content, totalScreens, wrongCounts, lessonXp, progress]
  );

  // Arrow-key navigation (disabled during boss overlay)
  useEffect(() => {
    if (!content) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (!cutsceneDone) return;
      if (showBoss) return;
      if (e.key === "ArrowRight" && screen < totalScreens - 1) {
        e.preventDefault();
        navigate(screen + 1);
      } else if (e.key === "ArrowLeft" && screen > 0) {
        e.preventDefault();
        navigate(screen - 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, totalScreens, content, navigate, cutsceneDone, showBoss]);

  const awardXp = useCallback((amount: number) => {
    if (!content) return;
    const result = addXP(amount, `week-${content.weekNumber}`);
    setLessonXp((v) => v + amount);
    setArenaMoodBrief("correct");
    setArena3DPulse((k) => k + 1);
    if (result.leveledUp) {
      setPendingLevelUp({
        oldRank: result.oldRank,
        newRank: result.newRank,
        totalXP: result.newTotal,
      });
    }
  }, [content, setArenaMoodBrief]);

  const addWrong = useCallback((scr: number) => {
    setWrongCounts((prev) => ({ ...prev, [scr]: (prev[scr] ?? 0) + 1 }));
    setArenaMoodBrief("wrong");
    setShakeTrigger((n) => n + 1);
    wrongAnswerShake();
  }, [setArenaMoodBrief]);

  // Param hasn't resolved yet (very brief moment in some hydration paths) -
  // render a simple loading state so the page never appears "blank."
  if (rawWeek === undefined) {
    return <LessonLoading />;
  }
  // Week exists in the URL but we have no content for it (or it's not a
  // valid number). Show the "coming soon" fallback.
  if (!content) {
    return <WeekNotReady week={Number.isFinite(weekNum) ? weekNum : 0} />;
  }

  const def = content.screens[screen];
  const reaction = content.reactions[screen] ?? { adam: null, layla: null };
  const stars = (wrongCounts[screen] ?? 0) === 0 ? 3 : (wrongCounts[screen] ?? 0) <= 1 ? 2 : 1;

  const renderScreen = (): React.ReactNode => {
    if (!def) return null;

    switch (def.type) {
      case "video":
        return (
          <FullScene bg="linear-gradient(180deg, #0a0a1a 0%, #1a1033 100%)">
            <Card>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    position: "relative",
                    borderRadius: 20,
                    overflow: "hidden",
                    border: "2px solid rgba(59,130,246,0.4)",
                    aspectRatio: "16 / 9",
                    background: "radial-gradient(ellipse at center, rgba(139,92,246,0.2), rgba(10,14,26,0.9))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 22,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => navigate(screen + 1)}
                    aria-label="Play"
                    style={{
                      width: 96,
                      height: 96,
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                      border: "none",
                      cursor: "pointer",
                      fontSize: 42,
                      color: "#fff",
                      boxShadow: "0 0 36px rgba(59,130,246,0.6)",
                    }}
                  >
                    ▶
                  </button>
                </div>
                <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 18 }}>
                  {def.videoPlaceholder}
                </p>
                <OrangeButton onClick={() => navigate(screen + 1)}>Skip video →</OrangeButton>
              </div>
            </Card>
          </FullScene>
        );

      case "mission":
        return (
          <FullScene bg="linear-gradient(180deg, #0a0e2a 0%, #1a1033 100%)" glow="radial-gradient(circle, rgba(59,130,246,0.2), transparent)">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>{content.badgeIcon}</div>
                  <h2 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 8px" }}>
                    Week {content.weekNumber}: {content.title}
                  </h2>
                  <p style={{ color: "#9ca3af", fontSize: 15, marginBottom: 24 }}>
                    Your mission objectives:
                  </p>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", textAlign: "left", maxWidth: 480, marginInline: "auto" }}>
                    {def.objectives.map((obj, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.12 }}
                        style={{
                          display: "flex",
                          gap: 12,
                          alignItems: "flex-start",
                          padding: "10px 14px",
                          marginBottom: 10,
                          background: "rgba(59,130,246,0.08)",
                          border: "1px solid rgba(59,130,246,0.3)",
                          borderRadius: 10,
                        }}
                      >
                        <span
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: "50%",
                            background: "#3b82f6",
                            color: "#fff",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 12,
                            fontWeight: 900,
                            flexShrink: 0,
                          }}
                        >
                          {i + 1}
                        </span>
                        <span style={{ color: "#e2e8f0", fontSize: 15 }}>{obj}</span>
                      </motion.li>
                    ))}
                  </ul>
                  <OrangeButton onClick={() => navigate(screen + 1)}>Accept Mission →</OrangeButton>
                </div>
              </Card>
            </motion.div>
          </FullScene>
        );

      case "info":
        return (
          <FullScene bg="linear-gradient(180deg, #0a1020 0%, #1a1033 100%)" glow="radial-gradient(circle, rgba(59,130,246,0.15), transparent)">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#fff", margin: "0 0 12px", textAlign: "center" }}>
                  {def.title}
                </h2>
                {def.narration && (
                  <InfoNarration
                    lines={def.narration.lines}
                    speaker={def.narration.speaker ?? "adam"}
                  />
                )}
                <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.6, marginBottom: 18 }}>{def.content}</p>
                {def.bullets && (
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
                    {def.bullets.map((b, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.08 + i * 0.1 }}
                        style={{
                          display: "flex",
                          gap: 10,
                          padding: "10px 14px",
                          marginBottom: 8,
                          background: "rgba(52,211,153,0.06)",
                          borderLeft: "3px solid #34d399",
                          borderRadius: "0 8px 8px 0",
                          color: "#e2e8f0",
                          fontSize: 14,
                          lineHeight: 1.5,
                        }}
                      >
                        <span style={{ color: "#34d399", flexShrink: 0 }}>✓</span>
                        <span>{b}</span>
                      </motion.li>
                    ))}
                  </ul>
                )}
                <div style={{ textAlign: "center" }}>
                  <OrangeButton onClick={() => navigate(screen + 1)}>Next →</OrangeButton>
                </div>
              </Card>
            </motion.div>
          </FullScene>
        );

      case "cyberScanner":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1033 100%)">
            <CyberScanner
              passwords={def.items}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
            />
          </FullScene>
        );

      case "protectTheData":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1033 100%)">
            <ProtectTheData
              items={def.items}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
            />
          </FullScene>
        );

      case "passwordLab":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1033 100%)">
            <PasswordLab
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
            />
          </FullScene>
        );

      case "crackTheCode":
        return (
          <FullScene bg="linear-gradient(180deg, #0a0a2a 0%, #1a1033 100%)">
            <CrackTheCode
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
            />
          </FullScene>
        );

      case "conveyorBelt":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1033 100%)">
            <ConveyorBelt
              items={def.items}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
            />
          </FullScene>
        );

      case "weakSorter":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1033 100%)">
            <WeakSorter
              reasons={def.reasons}
              items={def.items}
              hints={def.hints}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
            />
          </FullScene>
        );

      case "passwordHospital":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #122318 100%)">
            <PasswordHospital
              reasons={def.reasons}
              patients={def.patients}
              hints={def.hints}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
              onAnswered={(o) => {
                // Persist per-patient diagnosis + healed events.
                // questionKey is "hospital-{patientId}-{diagnosis|healed}";
                // the working password text is never sent.
                progress.saveQuestion({
                  screenIndex: screen,
                  questionKey: o.questionKey,
                  selectedIndex: o.selectedIndex,
                  correctIndex: o.correctIndex,
                  wasCorrect: o.wasCorrect,
                });
                if (!o.wasCorrect) {
                  progress.reportWrong(screen, o.questionKey);
                }
              }}
            />
          </FullScene>
        );

      case "popupPanic":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a0f2a 100%)">
            <PopupPanic
              popups={def.popups}
              hints={def.hints}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
              onAnswered={(o) => {
                progress.saveQuestion({
                  screenIndex: screen,
                  questionKey: o.questionKey,
                  selectedIndex: o.selectedIndex,
                  correctIndex: o.correctIndex,
                  wasCorrect: o.wasCorrect,
                });
                if (!o.wasCorrect) {
                  progress.reportWrong(screen, o.questionKey);
                }
              }}
            />
          </FullScene>
        );

      case "threeRandomWords":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1f4d 100%)">
            <ThreeRandomWords
              words={def.words}
              slots={def.slots}
              hints={def.hints}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
              onAnswered={(o) => {
                // questionKey embeds the chosen word ids as a suffix
                // ("trw-build@w-tiger+w-mountain+w-cookie"); enough
                // for parent-dashboard aggregation without storing
                // the assembled passphrase text.
                progress.saveQuestion({
                  screenIndex: screen,
                  questionKey: o.questionKey,
                  selectedIndex: o.selectedIndex,
                  correctIndex: o.correctIndex,
                  wasCorrect: o.wasCorrect,
                });
              }}
            />
          </FullScene>
        );

      case "accountRescue":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1f4d 100%)">
            <AccountRescue
              sharedPassword={def.sharedPassword}
              leakedAccountId={def.leakedAccountId}
              accounts={def.accounts}
              passwordBank={def.passwordBank}
              hints={def.hints}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
              onAnswered={(o) => {
                progress.saveQuestion({
                  screenIndex: screen,
                  questionKey: o.questionKey,
                  selectedIndex: o.selectedIndex,
                  correctIndex: o.correctIndex,
                  wasCorrect: o.wasCorrect,
                });
                if (!o.wasCorrect) {
                  progress.reportWrong(screen, o.questionKey);
                }
              }}
            />
          </FullScene>
        );

      case "chooseYourPath":
        return (
          <FullScene bg="linear-gradient(180deg, #0a0a2a 0%, #1a1033 100%)">
            <ChooseYourPath
              scenarios={def.scenarios}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
            />
          </FullScene>
        );

      case "memoryMatch":
        return (
          <FullScene bg="linear-gradient(180deg, #0a0a2a 0%, #1a1033 100%)">
            <MemoryMatch
              pairs={def.pairs}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
            />
          </FullScene>
        );

      case "firewallBuilder":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1033 100%)">
            <FirewallBuilder
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
            />
          </FullScene>
        );

      case "spamBlaster":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1033 100%)">
            <SpamBlaster
              emails={def.emails}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
            />
          </FullScene>
        );

      case "cyberMaze":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1033 100%)">
            <CyberMaze
              questions={def.questions}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(25)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
              onAnswered={(o) => {
                progress.saveQuestion({
                  screenIndex: screen,
                  questionKey: `maze-${o.questionIndex}`,
                  selectedIndex: o.selectedIndex,
                  correctIndex: o.correctIndex,
                  wasCorrect: o.wasCorrect,
                });
                if (!o.wasCorrect) {
                  progress.reportWrong(screen, `maze-${o.questionIndex}`);
                }
              }}
            />
          </FullScene>
        );

      case "passwordVault":
        return (
          <FullScene bg="radial-gradient(ellipse at center, #1a1f4d 0%, #0a0e25 50%, #050714 100%)">
            <PasswordVault
              locks={def.locks}
              guidance={def.guidance}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(30)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
              onAnswered={(o) => {
                progress.saveQuestion({
                  screenIndex: screen,
                  questionKey: o.questionKey,
                  selectedIndex: o.selectedIndex,
                  correctIndex: o.correctIndex,
                  wasCorrect: o.wasCorrect,
                });
                if (!o.wasCorrect) {
                  progress.reportWrong(screen, o.questionKey);
                }
              }}
            />
          </FullScene>
        );

      case "phishInspector":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1033 100%)">
            <PhishInspector
              emails={def.emails}
              hints={def.hints}
              onComplete={() => navigate(screen + 1)}
              onCorrect={() => awardXp(30)}
              onWrong={() => addWrong(screen)}
              onHintReached={(tier) => progress.reportHint(screen, tier)}
              onAnswered={(o) => {
                progress.saveQuestion({
                  screenIndex: screen,
                  questionKey: o.questionKey,
                  selectedIndex: o.selectedIndex,
                  correctIndex: o.correctIndex,
                  wasCorrect: o.wasCorrect,
                });
                if (!o.wasCorrect) {
                  progress.reportWrong(screen, o.questionKey);
                }
              }}
            />
          </FullScene>
        );

      case "missionDebrief":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1a1f4d 100%)">
            <MissionDebrief
              title={def.title}
              subtitle={def.subtitle}
              concepts={def.concepts}
              narration={def.narration}
              onComplete={() => navigate(screen + 1)}
            />
          </FullScene>
        );

      case "stickerUnlock":
        return (
          <FullScene bg="linear-gradient(180deg, #050a1a 0%, #1f1240 100%)">
            <StickerUnlock
              title={def.title}
              stickers={def.stickers}
              onComplete={() => navigate(screen + 1)}
            />
          </FullScene>
        );

      case "bossBattle":
        if (bossDone) {
          return (
            <FullScene
              bg="radial-gradient(ellipse at 50% 30%, #2a0a14 0%, #160a2e 50%, #04050d 100%)"
              glow="radial-gradient(circle, rgba(245,158,11,0.35), transparent)"
            >
              <BossVictoryScene
                badgeIcon={content.badgeIcon}
                badgeName={content.badgeName}
                weekNumber={content.weekNumber}
                stats={bossStats}
                onClaim={() => navigate(screen + 1)}
              />
            </FullScene>
          );
        }
        return (
          <FullScene bg="linear-gradient(180deg, #1a0505 0%, #0a0a1a 100%)" glow="radial-gradient(circle, rgba(239,68,68,0.35), transparent)">
            <motion.div initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring", stiffness: 220 }}>
              <div style={{ textAlign: "center" }}>
                <motion.h1
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    fontSize: 72,
                    fontWeight: 900,
                    background: "linear-gradient(135deg, #ef4444, #f97316, #fbbf24)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: 2,
                    marginBottom: 10,
                    textShadow: "0 0 40px rgba(239,68,68,0.35)",
                  }}
                >
                  BOSS BATTLE
                </motion.h1>
                <p style={{ color: "#fca5a5", fontSize: 20, fontWeight: 600, marginBottom: 32 }}>
                  Hacker Raccoon is waiting...
                </p>
                <OrangeButton
                  sound="transition"
                  onClick={() => {
                    progress.reportBossStarted();
                    setShowBoss(true);
                  }}
                >
                  START BATTLE →
                </OrangeButton>
              </div>
            </motion.div>
          </FullScene>
        );

      case "completion":
        return (
          <FullScene
            bg="radial-gradient(ellipse at 50% 30%, #2a1a08 0%, #1a1033 50%, #04050d 100%)"
            glow="radial-gradient(circle, rgba(253,224,71,0.4), transparent)"
          >
            <div
              style={{
                position: "relative",
                width: "100%",
                maxWidth: 720,
                margin: "0 auto",
                padding: "12px 20px 24px",
                color: "#fff7e6",
                fontFamily:
                  "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
                textAlign: "center",
              }}
            >
              {/* Rotating laurels / rays behind the badge */}
              <div
                aria-hidden
                style={{
                  position: "absolute",
                  top: 10,
                  left: "50%",
                  width: 360,
                  height: 360,
                  transform: "translateX(-50%)",
                  background:
                    "conic-gradient(from 0deg, rgba(253,224,71,0.32) 0deg, transparent 12deg, rgba(253,224,71,0.32) 30deg, transparent 42deg, rgba(253,224,71,0.32) 60deg, transparent 72deg, rgba(253,224,71,0.32) 90deg, transparent 102deg, rgba(253,224,71,0.32) 120deg, transparent 132deg, rgba(253,224,71,0.32) 150deg, transparent 162deg, rgba(253,224,71,0.32) 180deg, transparent 192deg, rgba(253,224,71,0.32) 210deg, transparent 222deg, rgba(253,224,71,0.32) 240deg, transparent 252deg, rgba(253,224,71,0.32) 270deg, transparent 282deg, rgba(253,224,71,0.32) 300deg, transparent 312deg, rgba(253,224,71,0.32) 330deg, transparent 342deg)",
                  filter: "blur(2px)",
                  opacity: 0.5,
                  mixBlendMode: "screen",
                  borderRadius: "50%",
                  animation: comfort.prefersReducedMotion
                    ? undefined
                    : "completionRaysSpin 26s linear infinite",
                  pointerEvents: "none",
                }}
              />
              {/* Badge bloom */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 13 }}
                style={{
                  position: "relative",
                  width: 140,
                  height: 140,
                  margin: "8px auto 14px",
                  borderRadius: "50%",
                  display: "grid",
                  placeItems: "center",
                  background:
                    "radial-gradient(circle at 30% 28%, #fff8dc 0%, #fde047 40%, #ff7a59 80%, #b8862a 100%)",
                  border: "4px solid #fff8dc",
                  boxShadow:
                    "0 18px 38px rgba(253, 224, 71, 0.55), inset 0 0 0 5px rgba(255,255,255,0.18), 0 0 60px rgba(253, 224, 71, 0.35)",
                  fontSize: 72,
                }}
              >
                {content.badgeIcon}
              </motion.div>
              {/* "Week N badge unlocked" tag */}
              <div
                style={{
                  display: "inline-block",
                  padding: "5px 14px",
                  borderRadius: 999,
                  background: "rgba(253,224,71,0.12)",
                  border: "1px solid rgba(253,224,71,0.45)",
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.22em",
                  fontWeight: 800,
                  color: "#fde047",
                  textTransform: "uppercase",
                  marginBottom: 8,
                  textShadow: "0 0 8px rgba(253,224,71,0.45)",
                }}
              >
                Week {content.weekNumber} complete
              </div>
              {/* Headline */}
              <h2
                style={{
                  margin: "0 0 6px",
                  fontSize: "clamp(28px, 5vw, 38px)",
                  fontWeight: 900,
                  background:
                    "linear-gradient(135deg, #fde047 0%, #ff7a59 60%, #ff5fb3 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: "0.02em",
                  textShadow: "0 0 22px rgba(253,224,71,0.45)",
                }}
              >
                {content.badgeName}
              </h2>
              <p
                style={{
                  margin: "0 0 18px",
                  fontSize: 15,
                  color: "#cbd5e1",
                  lineHeight: 1.45,
                }}
              >
                You completed Week {content.weekNumber}. Your badge is on its way to{" "}
                <strong style={{ color: "#fde047" }}>Cyber HQ</strong>.
              </p>
              {/* Stat tile row - XP earned */}
              <div
                style={{
                  display: "inline-flex",
                  gap: 12,
                  marginBottom: 22,
                  padding: "10px 20px",
                  borderRadius: 14,
                  background: "rgba(10, 16, 36, 0.78)",
                  border: "1.5px solid rgba(253,224,71,0.55)",
                  boxShadow: "0 10px 20px rgba(0,0,0,0.45), 0 0 18px rgba(253,224,71,0.18)",
                }}
              >
                <div style={{ textAlign: "left" }}>
                  <div
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      letterSpacing: "0.2em",
                      fontWeight: 800,
                      color: "#fde047",
                      textTransform: "uppercase",
                      marginBottom: 2,
                    }}
                  >
                    XP earned
                  </div>
                  <div
                    style={{
                      fontFamily: "'Space Grotesk', sans-serif",
                      fontSize: 22,
                      fontWeight: 900,
                      color: "#fff7e6",
                      lineHeight: 1,
                    }}
                  >
                    +{lessonXp}
                  </div>
                </div>
              </div>
              {/* CTAs */}
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <GameButton
                  variant="secondary"
                  size="lg"
                  icon="🏠"
                  onClick={() => router.push("/cyberhq")}
                >
                  Cyber HQ
                </GameButton>
                <GameButton
                  variant="primary"
                  size="lg"
                  icon="→"
                  onClick={() => router.push(`/lesson/${content.weekNumber + 1}`)}
                >
                  Next Week
                </GameButton>
              </div>
              <style jsx global>{`
                @keyframes completionRaysSpin {
                  from { transform: translateX(-50%) rotate(0deg); }
                  to   { transform: translateX(-50%) rotate(360deg); }
                }
              `}</style>
            </div>
          </FullScene>
        );

      default:
        return null;
    }
  };

  // Intro cutscene plays once per lesson load
  if (!cutsceneDone) {
    return (
      <StoryCutscene
        slides={content.introCutscene}
        title={`Week ${content.weekNumber}`}
        onComplete={() => setCutsceneDone(true)}
      />
    );
  }

  return (
    <div style={{ position: "relative", minHeight: "100vh", background: "#05061a", color: "#e2e8f0" }}>
      {/* 3D arena backdrop */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        <LessonArena3D
          width={winDim.w}
          height={winDim.h}
          mood={arena3DMood}
          pulseKey={arena3DPulse}
        />
      </div>

      <LessonAmbience />

      {/* Resume banner - only renders when the server returned an
          unfinished attempt with progress > 0 AND the child hasn't
          chosen continue or restart yet. */}
      {progress.pendingResume && progress.resumeIndex !== null && (
        <ResumeBanner
          resumeIndex={progress.resumeIndex}
          totalScreens={totalScreens}
          onContinue={onResumeContinue}
          onRestart={onResumeRestart}
        />
      )}

      <LessonHUD
        characterName="ADAM"
        characterImage="/game/characters/adam-idle.png"
        weekNumber={content.weekNumber}
        weekTitle={content.title}
        currentScreen={screen}
        totalScreens={totalScreens}
        xpEarned={lessonXp}
      />

      {/* Character guides are mounted ONLY on the boss battle screen.
          Adam/Layla flank the Hacker Raccoon fight; every other
          lesson surface stays character-free. */}
      {def?.type === "bossBattle" && (
        <>
          <RiveCharacterGuide
            character="adam"
            position="left"
            mood={toMood(reaction.adam?.mood)}
            message={reaction.adam?.message ?? ""}
          />
          <RiveCharacterGuide
            character="layla"
            position="right"
            mood={toMood(reaction.layla?.mood)}
            message={reaction.layla?.message ?? ""}
          />
        </>
      )}

      <main
        style={{
          position: "relative",
          zIndex: 1,
          // No max-width here. The per-screen LessonStage background
          // gradient fills the whole viewport edge-to-edge so the
          // Three.js arena doesn't show through as a two-tone strip
          // on wide monitors. The exercise content inside LessonStage
          // still caps at 900px and stays centred, so the playable
          // area is unchanged.
          width: "100%",
          paddingTop: LESSON_HUD_HEIGHT,
          paddingLeft: 0,
          paddingRight: 0,
          paddingBottom: "max(20px, env(safe-area-inset-bottom, 0px))",
        }}
      >
        <ScreenTransition
          transitionKey={screen}
          type={transitionForScreen(def, navDirRef.current)}
          duration={500}
          onTransitionStart={() => playSFX("transition")}
        >
          <ScreenShake trigger={shakeTrigger}>
            <ExerciseErrorBoundary
              key={screen}
              onSkip={() => navigate(Math.min(totalScreens - 1, screen + 1))}
            >
              {renderScreen()}
            </ExerciseErrorBoundary>
          </ScreenShake>
        </ScreenTransition>
      </main>

      {/* Boss battle fullscreen overlay */}
      {showBoss && (
        <div style={{ position: "fixed", inset: 0, zIndex: 80 }}>
          <BossBattle
            bossName="HACKER RACCOON"
            // Prefer the new phased boss (5 acts: Strength / Secrecy /
            // Uniqueness / Phishing / Final Showdown). BossBattle
            // internally flattens phases into a serial question list
            // while tagging each question with phase metadata, so
            // combat behaviour is unchanged. Fall back to the flat
            // legacy questions list if a week hasn't been migrated to
            // phases yet.
            phases={content.bossPhases}
            questions={
              content.bossPhases && content.bossPhases.length > 0
                ? undefined
                : [
                    ...content.bossQuestions.easy.map((q, i) => ({
                      question: q.question,
                      answers: q.answers,
                      correctIndex: q.correctIndex,
                      key: `boss-easy-${i}`,
                    })),
                    ...content.bossQuestions.medium.map((q, i) => ({
                      question: q.question,
                      answers: q.answers,
                      correctIndex: q.correctIndex,
                      key: `boss-medium-${i}`,
                    })),
                    ...content.bossQuestions.hard.map((q, i) => ({
                      question: q.question,
                      answers: q.answers,
                      correctIndex: q.correctIndex,
                      key: `boss-hard-${i}`,
                    })),
                  ]
            }
            onQuestionAnswered={(o) => {
              // Persist per-question. The phaseId travels with the
              // outcome (when phased) so the parent dashboard can
              // attribute wrong-answer clusters to specific acts.
              // We embed phaseId into the questionKey when present
              // so QuestionResponse rows are act-queryable without a
              // schema migration.
              const keyWithPhase =
                o.phaseId ? `${o.key}@${o.phaseId}` : o.key;
              progress.saveQuestion({
                screenIndex: screen,
                questionKey: keyWithPhase,
                selectedIndex: o.selectedIndex,
                correctIndex: o.correctIndex,
                wasCorrect: o.wasCorrect,
              });
              if (!o.wasCorrect) {
                progress.reportWrong(screen, keyWithPhase);
              }
            }}
            onEnd={(won, stats) => {
              setShowBoss(false);
              setBossDone(true);
              setBossStats({
                combo: stats.combo ?? 0,
                accuracy: stats.accuracy ?? 0,
                xp: stats.xp ?? 0,
              });
              // Persist boss result.
              progress.saveBoss({
                won,
                accuracy: stats.accuracy ?? 0,
                totalQuestions: stats.totalQuestions ?? 0,
                correctCount: stats.correctCount ?? 0,
                wrongCount: stats.wrongCount ?? 0,
                bestCombo: stats.combo ?? 0,
                durationMs: stats.durationMs ?? 0,
                badgeEarned: won,
                badgeId: won ? `week-${content.weekNumber}` : undefined,
              });
              // Per-phase analytics roll-up. Each phase emits its own
              // boss_completed-like event so the dashboard can show
              // "strongest skill" / "weakest skill" without a Prisma
              // migration. The aggregate boss_completed still fires
              // via progress.saveBoss().
              for (const pr of stats.phaseResults ?? []) {
                analytics.bossCompleted({
                  weekNumber: content.weekNumber,
                  won: pr.wrongCount === 0,
                  accuracy:
                    pr.totalQuestions > 0
                      ? Math.round((pr.correctCount / pr.totalQuestions) * 100)
                      : 0,
                  bestCombo: 0,
                  durationMs: 0,
                });
              }
              if (won) {
                awardXp(150);
                void correctAnswerBurst();
                void badgeEarnedCelebration();
              }
            }}
          />
        </div>
      )}

      {/* Level-up toast */}
      {pendingLevelUp && (
        <div
          role="alert"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 32,
            transform: "translateX(-50%)",
            zIndex: 90,
            background: "rgba(10,14,26,0.95)",
            border: "1px solid #fbbf24",
            borderRadius: 12,
            padding: "12px 20px",
            boxShadow: "0 0 24px rgba(251,191,36,0.5)",
            color: "#fbbf24",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>⭐</span>
          <div>
            <div style={{ fontWeight: 800 }}>RANK UP!</div>
            <div style={{ color: "#94a3b8", fontSize: 12 }}>
              {pendingLevelUp.oldRank.name} → {pendingLevelUp.newRank.name}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPendingLevelUp(null)}
            style={{
              background: "transparent",
              border: "1px solid rgba(251,191,36,0.4)",
              color: "#fbbf24",
              padding: "4px 10px",
              borderRadius: 6,
              cursor: "pointer",
              marginLeft: 8,
            }}
          >
            dismiss
          </button>
        </div>
      )}
    </div>
  );
}
