"use client";

/**
 * ProfileForgeBoss — Week 2's bespoke BUILD-FINAL boss: "The Profile Forge".
 *
 * A full arena set-piece, not a quiz. The child assembles their profile
 * LIVE while the Hacker Raccoon besieges it across five phases, each a
 * different micro-game: WHACK / HAND / GRILL / ASSEMBLE / RAPID.
 *
 * Presentation layer (the "PlayStation pass"):
 *   - living arena: data-rain canvas, spotlight glows, vignette, floor
 *     rings under a BIG animated boss sprite + hero sprite
 *   - cinematic entrance (spotlight → roar → title slam), phase-clear
 *     interstitials with bonuses, victory printout ceremony
 *   - juice on every input: hit particles at the tap point, screen
 *     shake, impact flashes, combo multiplier, floating score popups,
 *     a segmented scheme meter that shatters chunk by chunk
 *
 * Reporting still speaks BossBattle's exact dialects (BossQuestionOutcome
 * per judgment, BossEndStats + phaseResults at the end) so the parent
 * dashboard, analytics and XP flow are untouched. No lose state: wrong
 * answers teach and reset the combo, but the siege always ends with a
 * blank form for the Raccoon.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "@/app/lib/sounds";
import { isAudioMuted } from "@/app/lib/audioMute";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";
import type { WeekContent } from "@/app/lesson/weekContent";
import type { BossEndStats, BossPhaseResult } from "@/app/components/game/BossBattle";

export type ForgeData = NonNullable<WeekContent["bossForge"]>;

export interface ProfileForgeBossProps {
  forge: ForgeData;
  bossName?: string;
  onEnd?: (won: boolean, stats: BossEndStats) => void;
  onQuestionAnswered?: (outcome: {
    key: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
    position: number;
    phaseId?: string;
  }) => void;
}

type Stage = "entrance" | "ready" | "announce" | "play" | "phaseClear" | "victory";

const RACCOON = {
  idle: "/game/characters/raccoon-idle.png",
  taunt: "/game/characters/raccoon-taunt.png",
  attack: "/game/characters/raccoon-attack.png",
  hurt: "/game/characters/raccoon-hurt.png",
  defeated: "/game/characters/raccoon-defeated.png",
} as const;
const HERO = {
  idle: "/game/characters/adam-idle.png",
  attack: "/game/characters/adam-attack.png",
  celebrate: "/game/characters/adam-celebrate.png",
} as const;

const PHASE_ORDER = ["whack", "hand", "grill", "assemble", "rapid"] as const;
type PhaseKey = (typeof PHASE_ORDER)[number];

const PHASE_TONE: Record<PhaseKey, { accent: string; glow: string }> = {
  whack: { accent: "#7df0ff", glow: "rgba(0,229,255,0.5)" },
  hand: { accent: "#7eff97", glow: "rgba(126,255,151,0.5)" },
  grill: { accent: "#ffd158", glow: "rgba(255,209,88,0.5)" },
  assemble: { accent: "#c084fc", glow: "rgba(192,132,252,0.5)" },
  rapid: { accent: "#ff5fb3", glow: "rgba(255,95,179,0.5)" },
};

const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
const ROUNDED = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif";

/** Raccoon voice clips (Callum) — capped + mute-gated raw Audio. */
function playVillain(file: string) {
  if (typeof window === "undefined" || isAudioMuted()) return;
  const el = new Audio(`/audio/villain/${file}.mp3`);
  el.volume = 0.45;
  void el.play().catch(() => {});
}

/* ─────────────────────── particle + rain layers ─────────────────────── */

interface Particle {
  x: number; y: number; vx: number; vy: number; life: number; max: number;
  size: number; colour: string; gravity: number;
}

export interface ParticleAPI {
  burst: (x: number, y: number, colour: string, count?: number) => void;
}

/** Imperative canvas particle layer. Coordinates are in container px. */
function ParticleLayer({ apiRef, disabled }: { apiRef: React.MutableRefObject<ParticleAPI | null>; disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    apiRef.current = {
      burst: (x, y, colour, count = 14) => {
        if (disabled) return;
        for (let i = 0; i < count; i++) {
          const a = Math.random() * Math.PI * 2;
          const sp = 2 + Math.random() * 5;
          particles.current.push({
            x, y,
            vx: Math.cos(a) * sp,
            vy: Math.sin(a) * sp - 2,
            life: 0, max: 34 + Math.random() * 22,
            size: 2.5 + Math.random() * 3.5,
            colour, gravity: 0.14,
          });
        }
      },
    };
    return () => { apiRef.current = null; };
  }, [apiRef, disabled]);

  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const loop = () => {
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter((p) => p.life < p.max);
      for (const p of particles.current) {
        p.life += 1;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        const t = 1 - p.life / p.max;
        ctx.globalAlpha = Math.max(0, t);
        ctx.fillStyle = p.colour;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * t, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [disabled]);

  if (disabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 30 }}
    />
  );
}

/** Falling data-rain backdrop (cheap canvas, arena ambience). */
function DataRain({ disabled }: { disabled: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    if (disabled) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const glyphs = "01<>{}#$%&?!";
    let cols: { y: number; speed: number }[] = [];
    let raf = 0;
    let frame = 0;
    const loop = () => {
      const parent = canvas.parentElement;
      if (parent && (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight)) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
        const n = Math.floor(canvas.width / 26);
        cols = Array.from({ length: n }, () => ({ y: Math.random() * canvas.height, speed: 0.6 + Math.random() * 1.4 }));
      }
      frame += 1;
      if (frame % 2 === 0) {
        ctx.fillStyle = "rgba(8, 10, 26, 0.14)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.font = "13px monospace";
        cols.forEach((c, i) => {
          const ch = glyphs[(i * 7 + Math.floor(c.y / 13)) % glyphs.length];
          ctx.fillStyle = i % 5 === 0 ? "rgba(192,132,252,0.5)" : "rgba(0,229,255,0.38)";
          ctx.fillText(ch, i * 26 + 6, c.y);
          c.y += c.speed * 4;
          if (c.y > canvas.height + 20) c.y = -10;
        });
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [disabled]);
  if (disabled) return null;
  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", opacity: 0.5 }}
    />
  );
}

/* ─────────────────────────────── shell ─────────────────────────────── */

export default function ProfileForgeBoss({
  forge,
  bossName = "HACKER RACCOON",
  onEnd,
  onQuestionAnswered,
}: ProfileForgeBossProps) {
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [stage, setStage] = useState<Stage>("entrance");
  const [entranceBeat, setEntranceBeat] = useState(0);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scheme, setScheme] = useState(100);
  const [stamped, setStamped] = useState<PhaseKey[]>([]);
  const [raccoonMood, setRaccoonMood] = useState<keyof typeof RACCOON>("taunt");
  const [heroMood, setHeroMood] = useState<keyof typeof HERO>("idle");
  const [raccoonLine, setRaccoonLine] = useState<string | null>(null);
  const [teach, setTeach] = useState<null | { title: string; explanation: string }>(null);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [shakeNonce, setShakeNonce] = useState(0);
  const [flash, setFlash] = useState<null | "hit" | "phase" | "wrong">(null);
  const [popups, setPopups] = useState<{ id: number; text: string; colour: string; x: number; y: number }[]>([]);
  const [clearBonus, setClearBonus] = useState<{ label: string; noLeaks: boolean } | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ParticleAPI | null>(null);
  const popupSeq = useRef(0);
  const startTs = useRef(0);
  const position = useRef(0);
  const phaseWrongs = useRef(0);
  const statsRef = useRef<Map<string, BossPhaseResult>>(new Map());

  const phaseKey = PHASE_ORDER[Math.min(phaseIdx, PHASE_ORDER.length - 1)];
  const tone = PHASE_TONE[phaseKey];
  const phaseMeta = useMemo(
    () => ({ whack: forge.whack, hand: forge.hand, grill: forge.grill, assemble: forge.assemble, rapid: forge.rapid }) as const,
    [forge],
  );
  const currentPhase = phaseMeta[phaseKey];

  useEffect(() => {
    const m = new Map<string, BossPhaseResult>();
    for (const k of PHASE_ORDER) {
      const p = phaseMeta[k];
      m.set(p.id, { phaseId: p.id, label: p.label, correctCount: 0, wrongCount: 0, totalQuestions: 0 });
    }
    statsRef.current = m;
  }, [phaseMeta]);

  /* Entrance cinematic: dark → spotlight roar → title slam → ready. */
  useEffect(() => {
    if (stage !== "entrance") return;
    const beats = reduce ? [300, 700, 1100] : [900, 2100, 3400];
    const timers = [
      window.setTimeout(() => { setEntranceBeat(1); playSound("bossRoar"); playVillain("intro"); setShakeNonce((n) => n + 1); }, beats[0]),
      window.setTimeout(() => { setEntranceBeat(2); playSound("phaseChange"); }, beats[1]),
      window.setTimeout(() => setStage("ready"), beats[2]),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [stage, reduce]);

  const shake = useCallback(() => setShakeNonce((n) => n + 1), []);
  const doFlash = useCallback((kind: "hit" | "phase" | "wrong") => {
    setFlash(kind);
    window.setTimeout(() => setFlash(null), kind === "phase" ? 220 : 110);
  }, []);

  const addPopup = useCallback((text: string, colour: string, x: number, y: number) => {
    const id = ++popupSeq.current;
    setPopups((p) => [...p.slice(-5), { id, text, colour, x, y }]);
    window.setTimeout(() => setPopups((p) => p.filter((q) => q.id !== id)), 950);
  }, []);

  const moodTimer = useRef<number | null>(null);
  const flashMood = useCallback((mood: keyof typeof RACCOON, line: string | null, ms = 1700) => {
    setRaccoonMood(mood);
    setRaccoonLine(line);
    if (moodTimer.current) window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => {
      setRaccoonMood("idle");
      setRaccoonLine(null);
    }, ms);
  }, []);

  /** Central judgment. `at` = container-relative tap point for particles. */
  const judge = useCallback(
    (
      key: string,
      wasCorrect: boolean,
      selectedIndex: number,
      correctIndex: number,
      teachOnWrong?: { title: string; explanation: string },
      at?: { x: number; y: number },
    ) => {
      const p = phaseMeta[PHASE_ORDER[phaseIdx]];
      const stat = statsRef.current.get(p.id);
      if (stat) {
        stat.totalQuestions += 1;
        if (wasCorrect) stat.correctCount += 1;
        else stat.wrongCount += 1;
      }
      position.current += 1;
      onQuestionAnswered?.({ key, selectedIndex, correctIndex, wasCorrect, position: position.current, phaseId: p.id });

      const rect = arenaRef.current?.getBoundingClientRect();
      const px = at && rect ? at.x - rect.left : (rect?.width ?? 600) / 2;
      const py = at && rect ? at.y - rect.top : (rect?.height ?? 400) / 2;

      if (wasCorrect) {
        const newCombo = combo + 1;
        const mult = Math.min(4, 1 + Math.floor(newCombo / 3));
        const pts = 50 * mult;
        setCombo(newCombo);
        setMaxCombo((m) => Math.max(m, newCombo));
        setScore((s) => s + pts);
        playSound("correct");
        if (newCombo > 0 && newCombo % 3 === 0) playSound(newCombo >= 7 ? "streak7" : newCombo >= 5 ? "streak5" : "streak3");
        particlesRef.current?.burst(px, py, PHASE_TONE[PHASE_ORDER[phaseIdx]].accent, reduce ? 0 : 16);
        addPopup(`+${pts}${mult > 1 ? ` ×${mult}` : ""}`, "#7eff97", px, py);
        doFlash("hit");
        setHeroMood("attack");
        window.setTimeout(() => setHeroMood("idle"), 450);
        flashMood("hurt", null, 750);
      } else {
        setCombo(0);
        phaseWrongs.current += 1;
        playSound("wrong");
        shake();
        doFlash("wrong");
        addPopup("COMBO LOST", "#ff9bcb", px, py);
        flashMood("attack", "SO close to a secret!", 1500);
        if (teachOnWrong) setTeach(teachOnWrong);
      }
    },
    [phaseIdx, phaseMeta, onQuestionAnswered, combo, reduce, addPopup, doFlash, flashMood, shake],
  );

  const beginBattle = () => {
    startTs.current = performance.now();
    phaseWrongs.current = 0;
    playSound("phaseChange");
    setStage("announce");
  };

  useEffect(() => {
    if (stage !== "announce") return;
    playVillain(`taunt-${Math.min(phaseIdx + 1, 6)}`);
    const id = window.setTimeout(() => setStage("play"), reduce ? 1200 : 2500);
    return () => window.clearTimeout(id);
  }, [stage, phaseIdx, reduce]);

  const phaseDone = useCallback(() => {
    const key = PHASE_ORDER[phaseIdx];
    const noLeaks = phaseWrongs.current === 0;
    playSound("bossHurt");
    playSound("screenShake");
    shake();
    doFlash("phase");
    setStamped((s) => (s.includes(key) ? s : [...s, key]));
    setScheme((v) => Math.max(0, v - 20));
    setScore((s) => s + 250 + (noLeaks ? 150 : 0));
    setRaccoonMood("hurt");
    setRaccoonLine(FOILED_LINES[key]);
    setClearBonus({ label: phaseMeta[key].label, noLeaks });
    setStage("phaseClear");
    window.setTimeout(() => {
      setClearBonus(null);
      setRaccoonLine(null);
      phaseWrongs.current = 0;
      if (phaseIdx + 1 >= PHASE_ORDER.length) {
        playSound("bossDefeated");
        playVillain("defeat");
        setRaccoonMood("defeated");
        setStage("victory");
        window.setTimeout(() => playSound("victory"), 600);
        setHeroMood("celebrate");
      } else {
        playSound("phaseChange");
        setRaccoonMood("taunt");
        setPhaseIdx((i) => i + 1);
        setStage("announce");
      }
    }, reduce ? 1300 : 2600);
  }, [phaseIdx, phaseMeta, reduce, shake, doFlash]);

  const finish = () => {
    const phaseResults = PHASE_ORDER.map((k) => statsRef.current.get(phaseMeta[k].id)!).filter(Boolean);
    const totals = phaseResults.reduce(
      (acc, r) => ({ q: acc.q + r.totalQuestions, c: acc.c + r.correctCount, w: acc.w + r.wrongCount }),
      { q: 0, c: 0, w: 0 },
    );
    onEnd?.(true, {
      combo: maxCombo,
      accuracy: totals.q > 0 ? Math.round((totals.c / totals.q) * 100) : 100,
      xp: Math.round(score / 10),
      totalQuestions: totals.q,
      correctCount: totals.c,
      wrongCount: totals.w,
      durationMs: Math.round(performance.now() - startTs.current),
      phaseResults,
    });
  };

  const inBattle = stage === "announce" || stage === "play" || stage === "phaseClear";

  return (
    <motion.div
      key={shakeNonce > 0 ? `shake-${shakeNonce}` : "still"}
      animate={reduce || shakeNonce === 0 ? undefined : { x: [0, -9, 8, -5, 3, 0], y: [0, 4, -3, 2, 0, 0] }}
      transition={{ duration: 0.4 }}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#070a1c", color: "#e7ecff", fontFamily: ROUNDED }}
    >
      {/* ── Arena backdrop ── */}
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          backgroundImage: "url(/game/backgrounds/cyber-classroom.png)",
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.5) saturate(1.15)",
        }}
      />
      <DataRain disabled={reduce} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 72% 34%, rgba(255,95,179,0.16) 0%, transparent 46%), radial-gradient(ellipse at 20% 70%, rgba(0,229,255,0.14) 0%, transparent 46%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 160px 50px rgba(3,4,12,0.9)" }} />
      {/* scanlines */}
      <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.07, background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,0.5) 3px 4px)" }} />

      {/* ── Impact flash ── */}
      <AnimatePresence>
        {flash && !reduce && (
          <motion.div
            key={`${flash}-${shakeNonce}-${score}`}
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: flash === "phase" ? 0.24 : 0.13 }}
            aria-hidden
            style={{
              position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none",
              background: flash === "wrong" ? "#ff2f6d" : flash === "phase" ? "#ffffff" : tone.accent,
              mixBlendMode: "screen",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Characters ── */}
      <motion.img
        src={HERO[heroMood]}
        alt=""
        aria-hidden
        animate={reduce ? undefined : heroMood === "attack" ? { x: 24, scale: 1.06 } : { x: 0, scale: 1, y: [0, -5, 0] }}
        transition={heroMood === "attack" ? { duration: 0.2 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", left: "3%", bottom: "13%", height: "34%", zIndex: 2, filter: "drop-shadow(0 16px 20px rgba(0,0,0,0.7))" }}
      />
      <div aria-hidden style={{ position: "absolute", left: "3%", bottom: "11%", width: "16%", height: 22, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,229,255,0.4), transparent 70%)" }} />

      <motion.img
        key={raccoonMood}
        src={RACCOON[raccoonMood]}
        alt={bossName}
        initial={reduce ? false : { scale: 0.94, opacity: 0.7 }}
        animate={
          reduce
            ? { scale: 1, opacity: 1 }
            : raccoonMood === "hurt"
              ? { scale: 0.96, opacity: 1, x: 26, rotate: 3 }
              : raccoonMood === "defeated"
                ? { scale: 0.9, opacity: 0.92, y: 26, rotate: 6 }
                : { scale: 1, opacity: 1, y: [0, -8, 0] }
        }
        transition={raccoonMood === "idle" || raccoonMood === "taunt" ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.28 }}
        style={{ position: "absolute", right: "4%", bottom: "12%", height: stage === "entrance" ? "52%" : "42%", zIndex: 2, filter: `drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 0 30px ${tone.glow})`, transition: "height 600ms ease" }}
      />
      <div aria-hidden style={{ position: "absolute", right: "3%", bottom: "10%", width: "22%", height: 26, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,95,179,0.45), transparent 70%)" }} />

      {/* Raccoon speech */}
      <AnimatePresence>
        {raccoonLine && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", right: "6%", top: "17%", zIndex: 25, maxWidth: 250,
              padding: "10px 14px", borderRadius: 14, borderBottomRightRadius: 3,
              background: "rgba(46,16,60,0.95)", border: "2px solid #c084fc", color: "#f1e4ff",
              fontSize: 14.5, fontWeight: 800, fontStyle: "italic", lineHeight: 1.35,
              boxShadow: "0 12px 30px -10px rgba(0,0,0,0.8)",
            }}
          >
            “{raccoonLine}”
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HUD ── */}
      {stage !== "entrance" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: "#ff9bcb", textShadow: "0 0 12px rgba(255,95,179,0.7)", whiteSpace: "nowrap" }}>
              🦝 {bossName}&apos;S SCHEME
            </span>
            {/* Segmented scheme meter */}
            <div style={{ flex: 1, display: "flex", gap: 4 }} role="progressbar" aria-valuenow={scheme} aria-valuemin={0} aria-valuemax={100}>
              {PHASE_ORDER.map((k, i) => {
                const alive = scheme > i * 20;
                return (
                  <motion.div
                    key={k}
                    animate={alive ? { opacity: 1, scaleY: 1 } : { opacity: 0.25, scaleY: 0.55 }}
                    style={{
                      flex: 1, height: 16, borderRadius: 5,
                      background: alive ? "linear-gradient(180deg, #ff7ac2, #d12a72)" : "#3a1f33",
                      border: "1px solid rgba(255,155,203,0.5)",
                      boxShadow: alive ? "0 0 12px rgba(255,95,179,0.5)" : "none",
                    }}
                  />
                );
              })}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: "#ffd158", textShadow: "0 0 10px rgba(255,209,88,0.6)", minWidth: 92, textAlign: "right" }}>
              SCORE {score}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: tone.accent }}>
              PHASE {Math.min(phaseIdx + 1, 5)}/5 · {currentPhase.label.toUpperCase()}
            </div>
            <AnimatePresence>
              {combo >= 2 && (
                <motion.div
                  key={combo}
                  initial={reduce ? false : { scale: 1.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    fontFamily: MONO, fontSize: combo >= 6 ? 15 : 12.5, fontWeight: 900, letterSpacing: "0.1em",
                    color: combo >= 6 ? "#ffd158" : "#7eff97",
                    textShadow: `0 0 14px ${combo >= 6 ? "rgba(255,209,88,0.8)" : "rgba(126,255,151,0.7)"}`,
                  }}
                >
                  COMBO ×{combo}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Profile card (right rail) */}
      {inBattle && (
        <div className="pf-profile-rail" style={{ position: "absolute", top: 76, right: 12, zIndex: 20, width: 196, borderRadius: 12, padding: "8px 12px 10px", background: "rgba(6,8,20,0.82)", border: `1px solid ${tone.accent}55`, backdropFilter: "blur(6px)", fontFamily: MONO }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "#7df0ff", marginBottom: 6, textAlign: "center" }}>YOUR PROFILE</div>
          {PHASE_ORDER.map((k) => {
            const p = phaseMeta[k];
            const done = stamped.includes(k);
            const isCurrent = k === phaseKey && !done;
            return (
              <div key={k} style={{ marginBottom: 4, opacity: done ? 1 : isCurrent ? 0.95 : 0.4 }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: "0.1em", color: done ? "#7eff97" : isCurrent ? "#ffd158" : "#5d689e" }}>{p.label.toUpperCase()}</div>
                <motion.div initial={false} animate={done && !reduce ? { scale: [1.3, 1] } : undefined} style={{ fontSize: 10, fontWeight: 800, color: done ? "#e7ecff" : "#4d578a" }}>
                  {done ? `✓ ${p.stamp}` : isCurrent ? "…under attack…" : "· · ·"}
                </motion.div>
              </div>
            );
          })}
        </div>
      )}

      {/* Score popups */}
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 35, pointerEvents: "none" }}>
        <AnimatePresence>
          {popups.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 1, y: 0, scale: reduce ? 1 : 0.7 }}
              animate={{ opacity: 0, y: -56, scale: 1.15 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "easeOut" }}
              style={{ position: "absolute", left: p.x, top: p.y, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 17, fontWeight: 900, color: p.colour, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Main stage ── */}
      <div ref={arenaRef} style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", padding: "72px 16px 14px" }}>
        <ParticleLayer apiRef={particlesRef} disabled={reduce} />

        <AnimatePresence mode="wait">
          {stage === "entrance" && (
            <motion.div key="entrance" exit={{ opacity: 0 }} style={{ margin: "auto", textAlign: "center", zIndex: 15 }}>
              {entranceBeat >= 1 && (
                <motion.div
                  initial={reduce ? false : { scale: 2.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 210, damping: 15 }}
                  style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, letterSpacing: "0.3em", color: "#ff9bcb", textShadow: "0 0 18px rgba(255,95,179,0.9)", marginBottom: 10 }}
                >
                  ⚠ INTRUDER IN THE FORGE ⚠
                </motion.div>
              )}
              {entranceBeat >= 2 && (
                <motion.h1
                  initial={reduce ? false : { scale: 3, opacity: 0, rotate: -4 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 190, damping: 14 }}
                  style={{
                    margin: 0, fontSize: 52, fontWeight: 900, lineHeight: 1,
                    background: "linear-gradient(135deg, #ff5fb3 0%, #c084fc 50%, #00e5ff 100%)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    filter: "drop-shadow(0 6px 24px rgba(192,132,252,0.55))",
                  }}
                >
                  THE PROFILE FORGE
                </motion.h1>
              )}
            </motion.div>
          )}

          {stage === "ready" && (
            <motion.div key="ready" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ margin: "auto", textAlign: "center", maxWidth: 470, zIndex: 15 }}>
              <h2 style={{ margin: "0 0 8px", fontSize: 34, fontWeight: 900, background: "linear-gradient(135deg, #ff5fb3, #c084fc, #00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                THE PROFILE FORGE
              </h2>
              <p style={{ margin: "0 0 4px", fontSize: 16, lineHeight: 1.5, fontWeight: 800, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
                Build your profile. Survive his five tricks.
              </p>
              <p style={{ margin: "0 0 18px", fontSize: 15, fontWeight: 900, color: "#7eff97", textShadow: "0 0 14px rgba(126,255,151,0.5)" }}>
                GIVE HIM NOTHING.
              </p>
              <GameButton variant="primary" size="lg" onClick={beginBattle}>
                ⚔ Begin the Siege
              </GameButton>
            </motion.div>
          )}

          {stage === "announce" && (
            <motion.div
              key={`announce-${phaseIdx}`}
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 1.08 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              style={{ margin: "auto", textAlign: "center", maxWidth: 500, zIndex: 15 }}
            >
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, letterSpacing: "0.28em", color: tone.accent, textShadow: `0 0 16px ${tone.glow}`, marginBottom: 8 }}>
                — PHASE {phaseIdx + 1} OF 5 —
              </div>
              <div style={{ fontSize: 40, fontWeight: 900, marginBottom: 10, color: "#fff7e6", textShadow: `0 4px 30px ${tone.glow}, 0 2px 6px rgba(0,0,0,0.9)` }}>
                {currentPhase.label}
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "#e3c8ff", fontStyle: "italic", textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>
                🦝 “{currentPhase.intro}”
              </div>
            </motion.div>
          )}

          {stage === "play" && (
            <motion.div key={`play-${phaseIdx}`} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column", zIndex: 15, minHeight: 0 }}>
              {phaseKey === "whack" && <WhackPhase data={forge.whack} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} />}
              {phaseKey === "hand" && <HandPhase data={forge.hand} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} />}
              {phaseKey === "grill" && <GrillPhase data={forge.grill} judge={judge} done={phaseDone} reduce={reduce} />}
              {phaseKey === "assemble" && <AssemblePhase data={forge.assemble} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} />}
              {phaseKey === "rapid" && <RapidPhase data={forge.rapid} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} />}
            </motion.div>
          )}

          {stage === "phaseClear" && clearBonus && (
            <motion.div
              key={`clear-${phaseIdx}`}
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 1.1 }}
              transition={{ type: "spring", stiffness: 230, damping: 15 }}
              style={{ margin: "auto", textAlign: "center", zIndex: 15 }}
            >
              <div style={{ fontSize: 44, fontWeight: 900, color: "#7eff97", textShadow: "0 0 34px rgba(126,255,151,0.8), 0 3px 8px rgba(0,0,0,0.9)", marginBottom: 6 }}>
                PHASE CLEAR!
              </div>
              <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: "#fff7e6", marginBottom: 4 }}>+250 pts</div>
              {clearBonus.noLeaks && (
                <motion.div initial={reduce ? false : { scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25 }} style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: "#ffd158", textShadow: "0 0 16px rgba(255,209,88,0.8)" }}>
                  ★ NO-LEAKS BONUS +150 ★
                </motion.div>
              )}
            </motion.div>
          )}

          {stage === "victory" && (
            <motion.div key="victory" initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ margin: "auto", textAlign: "center", maxWidth: 470, zIndex: 15 }}>
              <motion.div
                initial={reduce ? false : { y: -70, opacity: 0, rotate: -8 }}
                animate={{ y: 0, opacity: 1, rotate: -2 }}
                transition={{ delay: reduce ? 0 : 0.5, type: "spring", stiffness: 110, damping: 13 }}
                style={{ margin: "0 auto 14px", width: 244, padding: "13px 15px", borderRadius: 4, background: "#f7f4ea", color: "#3b3a33", fontFamily: MONO, boxShadow: "0 18px 40px -12px rgba(0,0,0,0.85)" }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", borderBottom: "1.5px dashed #b9b4a2", paddingBottom: 5, marginBottom: 7 }}>RACCOON INTEL REPORT</div>
                {["NAME", "ADDRESS", "SCHOOL", "PHONE"].map((f) => (
                  <div key={f} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, padding: "2px 0" }}>
                    <span>{f}:</span><span style={{ color: "#b91c1c", fontWeight: 900 }}>BLANK</span>
                  </div>
                ))}
                <div style={{ marginTop: 7, fontSize: 11, fontWeight: 900, color: "#b91c1c", letterSpacing: "0.06em" }}>SCHEME STATUS: FOILED</div>
              </motion.div>
              <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 900, background: "linear-gradient(135deg, #7eff97, #00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 4px 18px rgba(126,255,151,0.4))" }}>
                The form came back BLANK!
              </h2>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: "#ffd158", marginBottom: 14, textShadow: "0 0 12px rgba(255,209,88,0.6)" }}>
                FINAL SCORE {score} · BEST COMBO ×{maxCombo}
              </div>
              <GameButton variant="success" size="lg" onClick={finish}>
                Claim the win →
              </GameButton>
            </motion.div>
          )}
        </AnimatePresence>

        {teach && <WrongAnswerPanel title={teach.title} explanation={teach.explanation} onContinue={() => setTeach(null)} />}
      </div>

      <style>{`
        @media (max-width: 860px) { .pf-profile-rail { display: none !important; } }
        @keyframes forgeTilePulse {
          0%, 100% { box-shadow: 0 0 0 rgba(255,95,179,0); }
          50% { box-shadow: 0 0 18px rgba(255,95,179,0.6); }
        }
      `}</style>
    </motion.div>
  );
}

const FOILED_LINES: Record<PhaseKey, string> = {
  whack: "My beautiful pre-filled form! RUINED!",
  hand: "Favourites?! I can't USE favourites!",
  grill: "Stop asking WHY! It's SO unfair!",
  assemble: "CometWizard WHO?! That's not a NAME!",
  rapid: "NOTHING?! I got... NOTHING?!",
};

/* ────────────────────────── PHASE 1 · WHACK ────────────────────────── */

type JudgeFn = (
  key: string,
  wasCorrect: boolean,
  sel: number,
  cor: number,
  teach?: { title: string; explanation: string },
  at?: { x: number; y: number },
) => void;

function WhackPhase({ data, paused, judge, done, reduce, accent }: { data: ForgeData["whack"]; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [docked, setDocked] = useState<string[]>([]);
  const [whacked, setWhacked] = useState<null | string>(null);
  const entry = data.entries[idx];
  const finishedRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const advance = useCallback(() => {
    setProgress(0);
    setWhacked(null);
    setIdx((i) => {
      if (i + 1 >= data.entries.length && !finishedRef.current) {
        finishedRef.current = true;
        window.setTimeout(done, 420);
      }
      return i + 1;
    });
  }, [data.entries.length, done]);

  useEffect(() => {
    if (!entry) return;
    const flightMs = reduce ? 7200 : 4600;
    const tick = 40;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setProgress((p) => Math.min(1, p + tick / flightMs));
    }, tick);
    return () => window.clearInterval(id);
  }, [idx, entry, reduce]);

  useEffect(() => {
    if (progress < 1 || !entry || whacked) return;
    if (entry.isPrivate) {
      judge(`forge-whack-${entry.id}`, false, 0, 1, { title: "It docked! That one was PRIVATE", explanation: entry.explanation });
      advance();
    } else {
      judge(`forge-whack-${entry.id}`, true, 0, 0);
      setDocked((d) => [...d, entry.id]);
      advance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const whack = (e: React.MouseEvent) => {
    if (!entry || paused || whacked) return;
    const at = { x: e.clientX, y: e.clientY };
    if (entry.isPrivate) {
      playSound("hitImpact");
      setWhacked(entry.id);
      judge(`forge-whack-${entry.id}`, true, 1, 1, undefined, at);
      window.setTimeout(advance, reduce ? 120 : 340);
    } else {
      judge(`forge-whack-${entry.id}`, false, 1, 0, { title: "Oops - that one was fine!", explanation: entry.explanation }, at);
      advance();
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0, justifyContent: "center" }}>
      <PhaseHint accent={accent} text="He's pre-filling YOUR form! WHACK the private stuff — let the safe stuff dock." />
      {/* A contained flight lane, not a full-stage blackout — the arena and
          both characters stay lit around it. */}
      <div style={{ position: "relative", height: 200, width: "100%", maxWidth: 780, margin: "0 auto", borderRadius: 16, background: "rgba(5,7,18,0.35)", border: `1px solid ${accent}55`, overflow: "hidden", boxShadow: `inset 0 0 40px rgba(0,0,0,0.5), 0 0 24px ${accent}22` }}>
        {/* form dock */}
        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 116, padding: "8px 9px", borderRadius: 10, background: "#eef1ff", color: "#39406b", fontFamily: MONO, fontSize: 8.5, fontWeight: 800, boxShadow: "0 8px 24px rgba(0,0,0,0.5)" }}>
          <div style={{ letterSpacing: "0.08em", marginBottom: 4 }}>PROFILE FORM</div>
          {docked.slice(-3).map((id) => {
            const e = data.entries.find((x) => x.id === id);
            return <div key={id} style={{ padding: "2px 4px", marginBottom: 2, borderRadius: 4, background: "#d9f7e3", color: "#166534", fontSize: 8 }}>✓ {e?.text}</div>;
          })}
          {docked.length === 0 && <div style={{ color: "#8b93bd" }}>waiting…</div>}
        </div>

        <AnimatePresence>
          {entry && idx < data.entries.length && (
            <motion.button
              key={entry.id}
              onClick={whack}
              disabled={paused}
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={whacked === entry.id && !reduce
                ? { opacity: 0, scale: 1.25, rotate: -35, y: -120 }
                : { opacity: 1, scale: 1, rotate: [0, -2, 2, 0] }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.65 }}
              transition={whacked === entry.id ? { duration: 0.34 } : { rotate: { duration: 0.9, repeat: Infinity }, default: { duration: 0.25 } }}
              whileTap={reduce ? undefined : { scale: 0.88 }}
              aria-label={`Flying entry: ${entry.text}. Tap to whack it away.`}
              style={{
                position: "absolute", top: "50%",
                left: `${16 + (1 - progress) * 68}%`,
                transform: "translateY(-50%)",
                display: "flex", alignItems: "center", gap: 7, padding: "12px 15px", borderRadius: 12,
                cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit",
                background: "linear-gradient(180deg, #ffe9a8 0%, #f5c854 100%)",
                border: "2px solid #ffdf8e",
                boxShadow: `0 0 22px rgba(255,214,110,0.65), 0 10px 20px -6px rgba(0,0,0,0.7)`,
                color: "#4a3208", fontSize: 14.5, fontWeight: 900, whiteSpace: "nowrap", zIndex: 5,
              }}
            >
              <PixIcon emoji={entry.icon} size={24} /> {entry.text}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        ENTRY {Math.min(idx + 1, data.entries.length)} / {data.entries.length} · TAP = WHACK
      </div>
    </div>
  );
}

/* ────────────────────────── PHASE 2 · HAND ────────────────────────── */

function HandPhase({ data, judge, done, reduce, accent }: { data: ForgeData["hand"]; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [picked, setPicked] = useState<string[]>([]);
  const finishedRef = useRef(false);

  const pick = (card: ForgeData["hand"]["cards"][number], e: React.MouseEvent) => {
    if (picked.includes(card.id) || finishedRef.current) return;
    const at = { x: e.clientX, y: e.clientY };
    if (card.isSafe) {
      playSound("pop");
      judge(`forge-hand-${card.id}`, true, 0, 0, undefined, at);
      const next = [...picked, card.id];
      setPicked(next);
      if (next.length >= data.picks && !finishedRef.current) {
        finishedRef.current = true;
        window.setTimeout(done, 520);
      }
    } else {
      judge(`forge-hand-${card.id}`, false, 1, 0, { title: "He slipped a trap into the hand!", explanation: card.explanation }, at);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8, minHeight: 0 }}>
      <PhaseHint accent={accent} text={`He's dealt you a hand. Pick ${data.picks} cards that are SAFE for your About Me.`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, flex: 1, alignContent: "center", maxWidth: 620, margin: "0 auto", width: "100%" }}>
        {data.cards.map((card, i) => {
          const isPicked = picked.includes(card.id);
          return (
            <motion.button
              key={card.id}
              onClick={(e) => pick(card, e)}
              disabled={isPicked}
              initial={reduce ? false : { y: 60, opacity: 0, rotate: (i - 2.5) * 4 }}
              animate={{ y: 0, opacity: 1, rotate: isPicked ? 0 : (i - 2.5) * 1.6 }}
              transition={{ delay: reduce ? 0 : i * 0.08, type: "spring", stiffness: 200, damping: 18 }}
              whileHover={isPicked || reduce ? undefined : { y: -8, scale: 1.05, rotate: 0 }}
              whileTap={reduce ? undefined : { scale: 0.93 }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 8px",
                borderRadius: 13, cursor: isPicked ? "default" : "pointer", touchAction: "manipulation", fontFamily: "inherit",
                background: isPicked ? "linear-gradient(180deg, rgba(52,211,153,0.28), rgba(52,211,153,0.1))" : "linear-gradient(180deg, #2e3a7e 0%, #1d2557 100%)",
                border: isPicked ? "2px solid #34d399" : "2px solid rgba(140,155,255,0.6)",
                boxShadow: isPicked ? "0 0 18px rgba(52,211,153,0.4)" : "0 10px 24px -8px rgba(0,0,0,0.7)",
                color: isPicked ? "#7eff97" : "#eef1ff", fontSize: 13.5, fontWeight: 900, minHeight: 96, justifyContent: "center",
              }}
            >
              <PixIcon emoji={card.icon} size={30} />
              <span style={{ lineHeight: 1.25, textAlign: "center" }}>{card.text}</span>
              {isPicked && <span style={{ fontSize: 10, letterSpacing: "0.08em" }}>✓ ON THE PROFILE</span>}
            </motion.button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        {picked.length} / {data.picks} SAFE CARDS PICKED
      </div>
    </div>
  );
}

/* ────────────────────────── PHASE 3 · GRILL ────────────────────────── */

function GrillPhase({ data, judge, done, reduce }: { data: ForgeData["grill"]; judge: JudgeFn; done: () => void; reduce: boolean }) {
  const [presses, setPresses] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const total = data.excuses.length;

  const why = (e: React.MouseEvent) => {
    if (collapsed) return;
    playSound("click");
    const next = presses + 1;
    setPresses(next);
    if (next >= total) {
      setCollapsed(true);
      playSound("pop");
      judge(`forge-grill-${data.id}`, true, 0, 0, undefined, { x: e.clientX, y: e.clientY });
      window.setTimeout(done, reduce ? 900 : 1700);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", justifyContent: "center", minHeight: 0 }}>
      <PhaseHint accent="#ffd158" text="A 'Security Bot' wants your number. You know the hero question. ASK IT." />
      <motion.div
        animate={collapsed && !reduce ? { rotate: [0, -4, 4, -10, 0], scale: [1, 1, 0.9, 0.55, 0], opacity: [1, 1, 1, 0.6, 0] } : { rotate: presses * -2, scale: 1 - presses * 0.035, x: presses > 0 && !reduce ? [0, -4, 4, 0] : 0 }}
        transition={{ duration: collapsed ? 1.1 : 0.32 }}
        style={{ width: "100%", maxWidth: 390, borderRadius: 14, overflow: "hidden", border: "2px solid rgba(140,155,255,0.65)", boxShadow: "0 20px 44px -16px rgba(0,0,0,0.85)" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "linear-gradient(135deg, #2e3a7e, #1d2557)" }}>
          <PixIcon emoji="🎭" size={20} />
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff7e6" }}>Totally Real Security Bot</span>
          <span style={{ marginLeft: "auto", fontSize: 17 }}>{presses >= 2 ? "😰" : presses >= 1 ? "😅" : "🤖"}</span>
        </div>
        <div style={{ padding: "14px 14px 16px", background: "linear-gradient(180deg, #eef1ff, #dde4ff)", color: "#1e2757", textAlign: "center" }}>
          <div style={{ fontSize: 15, fontWeight: 900, marginBottom: 8 }}>{data.demand}</div>
          <AnimatePresence mode="wait">
            <motion.div key={presses} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ fontSize: 12.5, fontWeight: 700, fontStyle: "italic", color: "#5b5f8a", minHeight: 34 }}>
              {collapsed ? data.collapse : `“${data.excuses[Math.min(presses, total - 1)]}”`}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {!collapsed ? (
        <motion.button
          onClick={why}
          whileTap={reduce ? undefined : { scale: 0.88 }}
          animate={reduce ? undefined : { scale: [1, 1.04, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          style={{
            padding: "18px 46px", borderRadius: 999, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit",
            fontSize: 26, fontWeight: 900, letterSpacing: "0.08em",
            background: "linear-gradient(180deg, #ffd158, #f59e0b)", border: "4px solid #ffe9a8",
            boxShadow: "0 14px 34px -8px rgba(245,158,11,0.85), 0 0 30px rgba(255,209,88,0.4)", color: "#4a3208",
          }}
        >
          WHY? 🤔
        </motion.button>
      ) : (
        <div style={{ fontSize: 16, fontWeight: 900, color: "#7eff97", textShadow: "0 0 16px rgba(126,255,151,0.6)" }}>
          ✋ REFUSED — a profile doesn&apos;t need your number!
        </div>
      )}
      <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        EXCUSES DEMOLISHED: {Math.min(presses, total)} / {total}
      </div>
    </div>
  );
}

/* ──────────────────────── PHASE 4 · ASSEMBLE ──────────────────────── */

function AssemblePhase({ data, judge, done, reduce, accent }: { data: ForgeData["assemble"]; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const safeTiles = useMemo(() => data.tiles.filter((t) => !t.trap), [data.tiles]);
  const [placed, setPlaced] = useState<string[]>([]);
  const finishedRef = useRef(false);

  const tap = (tile: ForgeData["assemble"]["tiles"][number], e: React.MouseEvent) => {
    if (placed.includes(tile.id) || finishedRef.current) return;
    const at = { x: e.clientX, y: e.clientY };
    if (tile.trap) {
      judge(`forge-assemble-${tile.id}`, false, 1, 0, { title: "LEAK! He planted that tile", explanation: tile.trap }, at);
      return;
    }
    playSound("pop");
    judge(`forge-assemble-${tile.id}`, true, 0, 0, undefined, at);
    const next = [...placed, tile.id];
    setPlaced(next);
    if (next.length >= safeTiles.length && !finishedRef.current) {
      finishedRef.current = true;
      playSound("lock");
      window.setTimeout(done, reduce ? 700 : 1300);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center", minHeight: 0 }}>
      <PhaseHint accent={accent} text="He scrambled your hero name — rebuild it! (He hid leaky tiles in the pile...)" />
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {safeTiles.map((t) => {
          const isPlaced = placed.includes(t.id);
          return (
            <motion.div
              key={t.id}
              animate={isPlaced && !reduce ? { scale: [1.35, 1] } : undefined}
              style={{
                minWidth: 78, padding: "13px 13px", borderRadius: 12, textAlign: "center", fontSize: 18, fontWeight: 900,
                background: isPlaced ? "linear-gradient(180deg, rgba(0,229,255,0.26), rgba(0,229,255,0.1))" : "rgba(5,7,18,0.65)",
                border: isPlaced ? "2px solid #00e5ff" : "2px dashed rgba(140,155,255,0.6)",
                color: isPlaced ? "#7df0ff" : "#4d578a",
                boxShadow: isPlaced ? "0 0 20px rgba(0,229,255,0.4)" : "none",
              }}
            >
              {isPlaced ? t.text : "?"}
            </motion.div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 560, margin: "0 auto" }}>
        {data.tiles.map((tile, i) => {
          const used = placed.includes(tile.id);
          return (
            <motion.button
              key={tile.id}
              onClick={(e) => tap(tile, e)}
              disabled={used}
              initial={reduce ? false : { opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: used ? 0.25 : 1, scale: 1, y: 0, rotate: used ? 0 : (i % 3) - 1 }}
              transition={{ delay: reduce ? 0 : i * 0.06, type: "spring", stiffness: 240, damping: 18 }}
              whileHover={used || reduce ? undefined : { scale: 1.08, rotate: 0 }}
              whileTap={reduce ? undefined : { scale: 0.92 }}
              style={{
                padding: "13px 18px", borderRadius: 12, cursor: used ? "default" : "pointer", touchAction: "manipulation",
                fontFamily: "inherit", fontSize: 16.5, fontWeight: 900,
                background: "linear-gradient(180deg, #2e3a7e 0%, #1d2557 100%)",
                border: "2px solid rgba(170,150,255,0.6)", color: "#eef1ff",
                boxShadow: "0 10px 22px -8px rgba(0,0,0,0.7)",
                animation: tile.trap && !used && !reduce ? "forgeTilePulse 1.6s ease-in-out infinite" : undefined,
              }}
            >
              {tile.text}
            </motion.button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        {placed.length === safeTiles.length ? `${data.result} — SEALED!` : `${placed.length} / ${safeTiles.length} PARTS PLACED`}
      </div>
    </div>
  );
}

/* ────────────────────────── PHASE 5 · RAPID ────────────────────────── */

function RapidPhase({ data, paused, judge, done, reduce }: { data: ForgeData["rapid"]; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean }) {
  const [idx, setIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(1);
  const demand = data.demands[idx];
  const finishedRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const advance = useCallback(() => {
    setTimeLeft(1);
    setIdx((i) => {
      if (i + 1 >= data.demands.length && !finishedRef.current) {
        finishedRef.current = true;
        window.setTimeout(done, 420);
      }
      return i + 1;
    });
  }, [data.demands.length, done]);

  useEffect(() => {
    if (!demand) return;
    const totalMs = (reduce ? data.secs * 2 : data.secs) * 1000;
    const tick = 40;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setTimeLeft((t) => Math.max(0, t - tick / totalMs));
    }, tick);
    return () => window.clearInterval(id);
  }, [idx, demand, data.secs, reduce]);

  useEffect(() => {
    if (timeLeft > 0 || !demand) return;
    judge(`forge-rapid-${demand.id}`, false, -1, demand.isPrivate ? 1 : 0, { title: "Too slow - he snatched the moment!", explanation: demand.explanation });
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const answer = (nope: boolean, e: React.MouseEvent) => {
    if (!demand || paused) return;
    const wasCorrect = nope === demand.isPrivate;
    judge(
      `forge-rapid-${demand.id}`,
      wasCorrect,
      nope ? 1 : 0,
      demand.isPrivate ? 1 : 0,
      wasCorrect ? undefined : { title: demand.isPrivate ? "That one was PRIVATE!" : "That one was actually fine!", explanation: demand.explanation },
      { x: e.clientX, y: e.clientY },
    );
    advance();
  };

  const urgent = timeLeft <= 0.4;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center", minHeight: 0 }}>
      <PhaseHint accent="#ff5fb3" text="Mask off! Quick-fire demands: NOPE the private ones, SHARE the safe ones." />
      <AnimatePresence mode="wait">
        {demand && (
          <motion.div
            key={demand.id}
            initial={reduce ? false : { x: 70, opacity: 0, rotate: 1.5 }}
            animate={{ x: 0, opacity: 1, rotate: 0 }}
            exit={reduce ? undefined : { x: -70, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{
              margin: "0 auto", maxWidth: 440, width: "100%", padding: "18px 18px 14px", borderRadius: 14, textAlign: "center",
              background: "linear-gradient(180deg, rgba(56,22,72,0.95), rgba(34,13,48,0.96))",
              border: urgent && !reduce ? "2px solid #ff2f6d" : "2px solid #c084fc",
              boxShadow: urgent ? "0 0 30px rgba(255,47,109,0.5)" : "0 16px 36px -14px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ fontSize: 18, fontWeight: 900, color: "#f1e4ff", marginBottom: 12, lineHeight: 1.35 }}>🦝 “{demand.text}”</div>
            <div style={{ height: 9, borderRadius: 999, background: "rgba(8,10,22,0.75)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${timeLeft * 100}%`, background: urgent ? "#ff2f6d" : "linear-gradient(90deg, #7eff97, #ffd158)", borderRadius: 999, transition: "width 50ms linear" }} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
        <motion.button
          onClick={(e) => answer(true, e)}
          disabled={!demand || paused}
          whileTap={reduce ? undefined : { scale: 0.9 }}
          style={{ padding: "18px 34px", borderRadius: 16, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit", fontSize: 20, fontWeight: 900, background: "radial-gradient(circle at 50% 28%, #ff6b6b, #b91c2e)", border: "3px solid #ff9d9d", color: "#fff", boxShadow: "0 12px 30px -8px rgba(217,47,62,0.8)" }}
        >
          ✋ NOPE!
        </motion.button>
        <motion.button
          onClick={(e) => answer(false, e)}
          disabled={!demand || paused}
          whileTap={reduce ? undefined : { scale: 0.9 }}
          style={{ padding: "18px 34px", borderRadius: 16, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit", fontSize: 20, fontWeight: 900, background: "radial-gradient(circle at 50% 28%, #47e08a, #15803d)", border: "3px solid #a0ffb0", color: "#fff", boxShadow: "0 12px 30px -8px rgba(21,128,61,0.8)" }}
        >
          💬 SHARE
        </motion.button>
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        DEMAND {Math.min(idx + 1, data.demands.length)} / {data.demands.length}
      </div>
    </div>
  );
}

/* ─────────────────────────── shared bits ─────────────────────────── */

function PhaseHint({ text, accent }: { text: string; accent: string }) {
  return (
    <div
      style={{
        textAlign: "center", fontSize: 13.5, fontWeight: 800, color: "#fff7e6",
        padding: "7px 14px", borderRadius: 999, alignSelf: "center",
        background: "rgba(6,8,20,0.75)", border: `1px solid ${accent}66`,
        boxShadow: `0 0 18px ${accent}33`, backdropFilter: "blur(4px)",
        textShadow: "0 2px 4px rgba(0,0,0,0.8)", maxWidth: 640,
      }}
    >
      {text}
    </div>
  );
}
