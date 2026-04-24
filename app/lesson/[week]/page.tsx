"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { playSound as playSFX, playBGM, stopBGM } from "@/app/lib/sounds";
import { addXP, type RankInfo } from "@/app/lib/progression";
import {
  correctAnswerBurst,
  badgeEarnedCelebration,
  wrongAnswerShake,
} from "@/app/lib/celebrations";
import LessonHUD from "@/app/components/LessonHUD";
import CharacterGuide, { type CharacterMood } from "@/app/components/CharacterGuide";

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
import StoryCutscene from "@/app/components/StoryCutscene";
import ScreenTransition, {
  type TransitionType,
} from "@/app/components/ScreenTransition";
import ScreenShake from "@/app/components/ScreenShake";
import ExerciseErrorBoundary from "@/app/components/ExerciseErrorBoundary";
import LessonAmbience from "@/app/components/LessonAmbience";

// Exercise components
import CyberScanner from "@/app/components/exercises/CyberScanner";
import ProtectTheData from "@/app/components/exercises/ProtectTheData";
import PasswordLab from "@/app/components/exercises/PasswordLab";
import CrackTheCode from "@/app/components/exercises/CrackTheCode";
import ConveyorBelt from "@/app/components/exercises/ConveyorBelt";
import ChooseYourPath from "@/app/components/exercises/ChooseYourPath";
import MemoryMatch from "@/app/components/exercises/MemoryMatch";
import FirewallBuilder from "@/app/components/exercises/FirewallBuilder";
import SpamBlaster from "@/app/components/exercises/SpamBlaster";
import CyberMaze from "@/app/components/exercises/CyberMaze";

import {
  getWeekContent,
  type ScreenDef,
  type WeekContent,
} from "@/app/lesson/weekContent";

const LessonArena3D = dynamic(
  () => import("@/app/components/game/LessonArena3D"),
  { ssr: false }
);
const BossBattle = dynamic(
  () => import("@/app/components/game/BossBattle"),
  { ssr: false }
);

/**
 * Choose a transition style per screen type — exercise screens get a
 * fade-scale lens-change feel; boss battle is a dramatic wipe.
 */
function transitionForScreen(def: ScreenDef | undefined, dir: "forward" | "back"): TransitionType {
  if (!def) return dir === "back" ? "slideLeft" : "slideRight";
  if (def.type === "bossBattle") return "wipeDown";
  const exerciseTypes: ScreenDef["type"][] = [
    "cyberScanner",
    "protectTheData",
    "passwordLab",
    "crackTheCode",
    "conveyorBelt",
    "chooseYourPath",
    "memoryMatch",
    "firewallBuilder",
    "spamBlaster",
    "cyberMaze",
  ];
  if (exerciseTypes.includes(def.type)) return "fadeScale";
  return dir === "back" ? "slideLeft" : "slideRight";
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
        This week&apos;s mission hasn&apos;t landed yet. Check back soon —
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
  return (
    <div
      style={{
        minHeight: "calc(100vh - 120px)",
        background: bg ?? "linear-gradient(180deg, #0a0a1a 0%, #1a1033 100%)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 24px",
        overflow: "hidden",
      }}
    >
      {glow && (
        <div
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: glow,
            filter: "blur(120px)",
            opacity: 0.3,
            pointerEvents: "none",
          }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 900 }}>
        {children}
      </div>
    </div>
  );
}

function OrangeButton({ onClick, children, sound = "click" }: { onClick: () => void; children: React.ReactNode; sound?: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        playSFX(sound);
        onClick();
      }}
      style={{
        background: "linear-gradient(135deg, #f97316, #f59e0b)",
        color: "#fff",
        fontWeight: 800,
        borderRadius: 14,
        padding: "14px 36px",
        fontSize: 16,
        border: "none",
        cursor: "pointer",
        boxShadow: "0 0 18px rgba(249,115,22,0.5)",
      }}
    >
      {children}
    </button>
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

export default function DynamicLesson() {
  const params = useParams<{ week: string }>();
  const router = useRouter();
  const weekNum = Number(params?.week);
  const content = useMemo(() => (Number.isFinite(weekNum) ? getWeekContent(weekNum) : null), [weekNum]);

  // All hooks run unconditionally — we short-circuit with a fallback render below.
  const [cutsceneDone, setCutsceneDone] = useState(false);
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

  // Window dims for the 3D arena
  const [winDim, setWinDim] = useState<{ w: number; h: number }>(() =>
    typeof window === "undefined" ? { w: 1280, h: 720 } : { w: window.innerWidth, h: window.innerHeight }
  );
  useEffect(() => {
    const onResize = () => setWinDim({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // BGM: lesson for content screens, battle for exercise/boss.
  useEffect(() => {
    if (!content || !cutsceneDone) return;
    const def = content.screens[screen];
    const isBattle =
      def?.type === "bossBattle" ||
      (def && ["cyberScanner", "protectTheData", "conveyorBelt", "spamBlaster", "firewallBuilder", "cyberMaze"].includes(def.type));
    try {
      playBGM(isBattle ? "bgmBattle" : "bgmLesson");
    } catch {
      /* BGM optional */
    }
  }, [screen, content, cutsceneDone]);

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
        return Math.max(0, Math.min(totalScreens - 1, to));
      });
    },
    [content, totalScreens]
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

  // No content → show fallback BEFORE doing anything else in the main render.
  if (!content) {
    return <WeekNotReady week={weekNum} />;
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
            />
          </FullScene>
        );

      case "bossBattle":
        if (bossDone) {
          return (
            <FullScene bg="linear-gradient(180deg, #0a0505 0%, #1a1033 100%)" glow="radial-gradient(circle, rgba(245,158,11,0.3), transparent)">
              <Card>
                <div style={{ textAlign: "center" }}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                    style={{ fontSize: 72, marginBottom: 10 }}
                  >
                    🏆
                  </motion.div>
                  <h2
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      background: "linear-gradient(135deg, #f59e0b, #ef4444, #3b82f6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      marginBottom: 12,
                    }}
                  >
                    Hacker Raccoon DEFEATED!
                  </h2>
                  {bossStats && (
                    <p style={{ color: "#d1d5db", marginBottom: 20 }}>
                      Accuracy {bossStats.accuracy}% · Best combo {bossStats.combo} · +{bossStats.xp} XP
                    </p>
                  )}
                  <OrangeButton onClick={() => navigate(screen + 1)}>Claim Badge →</OrangeButton>
                </div>
              </Card>
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
                <OrangeButton sound="transition" onClick={() => setShowBoss(true)}>
                  START BATTLE →
                </OrangeButton>
              </div>
            </motion.div>
          </FullScene>
        );

      case "completion":
        return (
          <FullScene bg="linear-gradient(180deg, #1a1508 0%, #0a0a1a 100%)" glow="radial-gradient(circle, rgba(245,158,11,0.3), transparent)">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
              <Card>
                <div style={{ textAlign: "center" }}>
                  <motion.div
                    animate={{ rotate: [0, -6, 6, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    style={{ fontSize: 84, marginBottom: 10 }}
                  >
                    {content.badgeIcon}
                  </motion.div>
                  <h2
                    style={{
                      fontSize: 32,
                      fontWeight: 900,
                      background: "linear-gradient(135deg, #f59e0b, #fbbf24, #3b82f6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      marginBottom: 10,
                    }}
                  >
                    Mission Complete!
                  </h2>
                  <p style={{ color: "#d1d5db", fontSize: 16, marginBottom: 14 }}>
                    You earned the <strong style={{ color: "#fbbf24" }}>{content.badgeName}</strong> badge.
                  </p>
                  <p style={{ color: "#9ca3af", fontSize: 14, marginBottom: 24 }}>
                    XP earned: {lessonXp}
                  </p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <OrangeButton onClick={() => router.push("/cyberheroes")}>
                      Back to Cyber Heroes
                    </OrangeButton>
                    <button
                      type="button"
                      onClick={() => router.push(`/lesson/${content.weekNumber + 1}`)}
                      style={{
                        background: "transparent",
                        color: "#93c5fd",
                        fontWeight: 700,
                        borderRadius: 14,
                        padding: "12px 28px",
                        fontSize: 14,
                        border: "2px solid rgba(96,165,250,0.55)",
                        cursor: "pointer",
                      }}
                    >
                      Next Week →
                    </button>
                  </div>
                </div>
              </Card>
            </motion.div>
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

      <LessonHUD
        characterName="ADAM"
        characterImage="/game/characters/adam-idle.png"
        weekNumber={content.weekNumber}
        weekTitle={content.title}
        currentScreen={screen}
        totalScreens={totalScreens}
        xpEarned={lessonXp}
      />

      <CharacterGuide
        character="adam"
        position="left"
        mood={toMood(reaction.adam?.mood)}
        message={reaction.adam?.message ?? ""}
      />
      <CharacterGuide
        character="layla"
        position="right"
        mood={toMood(reaction.layla?.mood)}
        message={reaction.layla?.message ?? ""}
      />

      <main style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto", padding: "0 0 80px" }}>
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
            questions={[
              ...content.bossQuestions.easy,
              ...content.bossQuestions.medium,
              ...content.bossQuestions.hard,
            ].map((q) => ({
              question: q.question,
              answers: q.answers,
              correctIndex: q.correctIndex,
            }))}
            onEnd={(won, stats) => {
              setShowBoss(false);
              setBossDone(true);
              setBossStats({
                combo: stats.combo ?? 0,
                accuracy: stats.accuracy ?? 0,
                xp: stats.xp ?? 0,
              });
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
