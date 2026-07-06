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

type Stage = "entrance" | "select" | "announce" | "play" | "phaseClear" | "victory";

const RACCOON = {
  idle: "/game/characters/raccoon-idle.png",
  taunt: "/game/characters/raccoon-taunt.png",
  attack: "/game/characters/raccoon-attack.png",
  hurt: "/game/characters/raccoon-hurt.png",
  defeated: "/game/characters/raccoon-defeated.png",
} as const;

/** Playable heroes. Each carries a full arena theme — glows, washes and
 *  title gradients retint to the chosen character. The forge-specific
 *  idle pose (writing behind their shield) exists for both. */
const HEROES = {
  adam: {
    name: "ADAM",
    tagline: "Cool and steady",
    portrait: "/game/characters/adam-head.png",
    sprites: {
      idle: "/game/characters/adam-writing.png",
      attack: "/game/characters/adam-attack.png",
      celebrate: "/game/characters/adam-celebrate.png",
    },
    theme: {
      accent: "#00e5ff",
      glow: "rgba(0,229,255,0.45)",
      washA: "rgba(0,150,255,0.16)",
      washB: "rgba(0,229,255,0.12)",
      title: "linear-gradient(135deg, #00e5ff 0%, #3b82f6 55%, #7c5cff 100%)",
      floor: "rgba(0,229,255,0.4)",
    },
  },
  layla: {
    name: "LAYLA",
    tagline: "Quick and clever",
    portrait: "/game/characters/layla-head.png",
    sprites: {
      idle: "/game/characters/layla-writing.png",
      attack: "/game/characters/layla-attack.png",
      celebrate: "/game/characters/layla-celebrate.png",
    },
    theme: {
      accent: "#ff5fb3",
      glow: "rgba(255,95,179,0.45)",
      washA: "rgba(255,95,179,0.16)",
      washB: "rgba(192,132,252,0.12)",
      title: "linear-gradient(135deg, #ff5fb3 0%, #c084fc 55%, #7c5cff 100%)",
      floor: "rgba(255,95,179,0.45)",
    },
  },
} as const;
type HeroKey = keyof typeof HEROES;

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
        // Clamp: fractional lifetimes can overshoot by one tick, and a
        // negative arc radius throws (which would kill this rAF loop).
        const t = Math.max(0, 1 - p.life / p.max);
        ctx.globalAlpha = t;
        ctx.fillStyle = p.colour;
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.01, p.size * t), 0, Math.PI * 2);
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
  const [hero, setHero] = useState<HeroKey | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scheme, setScheme] = useState(100);
  const [stamped, setStamped] = useState<PhaseKey[]>([]);
  const [raccoonMood, setRaccoonMood] = useState<keyof typeof RACCOON>("taunt");
  const [heroMood, setHeroMood] = useState<"idle" | "attack" | "celebrate">("idle");
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

  /* Entrance cinematic: dark → spotlight roar → title slam → hero select. */
  useEffect(() => {
    if (stage !== "entrance") return;
    const beats = reduce ? [300, 700, 1100] : [900, 2100, 3400];
    const timers = [
      window.setTimeout(() => { setEntranceBeat(1); playSound("bossRoar"); playVillain("intro"); setShakeNonce((n) => n + 1); }, beats[0]),
      window.setTimeout(() => { setEntranceBeat(2); playSound("phaseChange"); }, beats[1]),
      window.setTimeout(() => setStage("select"), beats[2]),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [stage, reduce]);

  const chooseHero = (key: HeroKey) => {
    playSound("select");
    setHero(key);
    phaseWrongs.current = 0;
    playSound("phaseChange");
    setStage("announce");
  };

  // Battle clock starts the first time the announce stage is reached
  // (an effect, to keep impure timing calls out of render-scope fns).
  useEffect(() => {
    if (stage === "announce" && startTs.current === 0) {
      startTs.current = performance.now();
    }
  }, [stage]);

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
      {/* Arena colour washes retint to the chosen hero's theme. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse at 72% 34%, ${hero ? HEROES[hero].theme.washA : "rgba(255,95,179,0.16)"} 0%, transparent 46%), radial-gradient(ellipse at 20% 70%, ${hero ? HEROES[hero].theme.washB : "rgba(0,229,255,0.14)"} 0%, transparent 46%)`,
          transition: "background 700ms ease",
        }}
      />
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
      {hero && (
        <>
          <motion.img
            src={HEROES[hero].sprites[heroMood]}
            alt=""
            aria-hidden
            animate={reduce ? undefined : heroMood === "attack" ? { x: 24, scale: 1.06 } : { x: 0, scale: 1, y: [0, -5, 0] }}
            transition={heroMood === "attack" ? { duration: 0.2 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", left: "3%", bottom: "13%", height: "34%", zIndex: 2, filter: `drop-shadow(0 16px 20px rgba(0,0,0,0.7)) drop-shadow(0 0 22px ${HEROES[hero].theme.glow})` }}
          />
          <div aria-hidden style={{ position: "absolute", left: "3%", bottom: "11%", width: "16%", height: 22, borderRadius: "50%", background: `radial-gradient(ellipse, ${HEROES[hero].theme.floor}, transparent 70%)` }} />
        </>
      )}

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
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: "#9dff87", textShadow: "0 0 12px rgba(120,255,90,0.7)", whiteSpace: "nowrap" }}>
              🦝 {bossName}&apos;S SCHEME
            </span>
            {/* Segmented scheme meter — the Raccoon's matrix-green, so it
                never clashes with either hero's theme. */}
            <div style={{ flex: 1, display: "flex", gap: 4 }} role="progressbar" aria-valuenow={scheme} aria-valuemin={0} aria-valuemax={100}>
              {PHASE_ORDER.map((k, i) => {
                const alive = scheme > i * 20;
                return (
                  <motion.div
                    key={k}
                    animate={alive ? { opacity: 1, scaleY: 1 } : { opacity: 0.25, scaleY: 0.55 }}
                    style={{
                      flex: 1, height: 16, borderRadius: 5,
                      background: alive ? "linear-gradient(180deg, #8dff5a, #2fae4e)" : "#1e3322",
                      border: "1px solid rgba(140,255,120,0.5)",
                      boxShadow: alive ? "0 0 12px rgba(120,255,90,0.45)" : "none",
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
            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: tone.accent, display: "flex", alignItems: "center", gap: 6 }}>
              {hero && (
                <span style={{ color: HEROES[hero].theme.accent, textShadow: `0 0 10px ${HEROES[hero].theme.glow}` }}>
                  ★ {HEROES[hero].name}
                </span>
              )}
              {hero && <span style={{ opacity: 0.5 }}>·</span>}
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

          {stage === "select" && (
            <motion.div key="select" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ margin: "auto", textAlign: "center", maxWidth: 560, width: "100%", zIndex: 15 }}>
              <h2 style={{ margin: "0 0 2px", fontSize: 30, fontWeight: 900, background: "linear-gradient(135deg, #ffd158, #ff8f6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 4px 16px rgba(255,209,88,0.4))" }}>
                CHOOSE YOUR HERO
              </h2>
              <p style={{ margin: "0 0 16px", fontSize: 13.5, fontWeight: 700, fontStyle: "italic", color: "#e3c8ff", textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>
                🦝 “Pick whoever you want. I&apos;ll beat them BOTH!”
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {(Object.keys(HEROES) as HeroKey[]).map((key) => {
                  const h = HEROES[key];
                  return (
                    <motion.button
                      key={key}
                      onClick={() => chooseHero(key)}
                      whileHover={reduce ? undefined : { y: -6, scale: 1.03 }}
                      whileTap={reduce ? undefined : { scale: 0.95 }}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: "16px 12px 14px", borderRadius: 18, cursor: "pointer",
                        touchAction: "manipulation", fontFamily: "inherit",
                        background: "linear-gradient(180deg, rgba(10,14,34,0.85), rgba(6,8,20,0.9))",
                        border: `2.5px solid ${h.theme.accent}`,
                        boxShadow: `0 0 26px ${h.theme.glow}, inset 0 1px 0 rgba(255,255,255,0.1)`,
                        color: "#fff7e6",
                      }}
                      aria-label={`Play as ${h.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={h.sprites.idle} alt="" style={{ height: 132, objectFit: "contain", filter: `drop-shadow(0 10px 14px rgba(0,0,0,0.6)) drop-shadow(0 0 16px ${h.theme.glow})` }} />
                      <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: "0.08em", color: h.theme.accent, textShadow: `0 0 14px ${h.theme.glow}` }}>
                        {h.name}
                      </span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#9fb1ff" }}>{h.tagline}</span>
                      <span
                        style={{
                          marginTop: 2, padding: "7px 26px", borderRadius: 999,
                          background: `linear-gradient(180deg, ${h.theme.accent}, ${h.theme.accent}99)`,
                          color: "#081018", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em",
                          boxShadow: `0 8px 20px -6px ${h.theme.glow}`,
                        }}
                      >
                        SELECT
                      </span>
                    </motion.button>
                  );
                })}
              </div>
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
              <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 900, background: hero ? HEROES[hero].theme.title : "linear-gradient(135deg, #7eff97, #00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 4px 18px ${hero ? HEROES[hero].theme.glow : "rgba(126,255,151,0.4)"})` }}>
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

type FlyerStatus = "waiting" | "flying" | "whacked" | "gone" | "docked" | "leaked";
interface Flyer {
  entry: ForgeData["whack"]["entries"][number];
  wave: number;
  lane: number;         // 0..2 vertical lane
  progress: number;     // 0..1 right → left
  status: FlyerStatus;
  bobSeed: number;
}

/** WHACK, wave-based: the Raccoon hurls entries across the OPEN arena at a
 *  big holographic profile form. Up to three fly at once on bobbing paths;
 *  private ones pulse red as they close in. Whacks explode into a comic
 *  starburst; leaks visibly crack a form field until scrubbed. */
function WhackPhase({ data, paused, judge, done, reduce, accent }: { data: ForgeData["whack"]; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const WAVES: number[][] = useMemo(() => {
    // 8 entries → waves of 3 / 3 / 2, preserving authored order.
    const sizes = [3, 3, 2];
    const out: number[][] = [];
    let i = 0;
    for (const s of sizes) {
      out.push(Array.from({ length: Math.min(s, data.entries.length - i) }, (_, k) => i + k));
      i += s;
      if (i >= data.entries.length) break;
    }
    return out;
  }, [data.entries.length]);

  const [flyers, setFlyers] = useState<Flyer[]>(() =>
    data.entries.map((entry, i) => ({
      entry,
      wave: i < 3 ? 0 : i < 6 ? 1 : 2,
      lane: i % 3,
      progress: 0,
      status: "waiting",
      bobSeed: (entry.id.charCodeAt(0) % 5) + 3,
    })),
  );
  const [wave, setWave] = useState(0);
  const [waveBanner, setWaveBanner] = useState<string | null>(null);
  const [bursts, setBursts] = useState<{ id: string; x: number; y: number; label: string }[]>([]);
  const [leakFlash, setLeakFlash] = useState<string | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const finishedRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  // Launch a wave: banner slam, then stagger its flyers into the air.
  useEffect(() => {
    if (wave >= WAVES.length) return;
    setWaveBanner(wave === WAVES.length - 1 ? "FINAL WAVE!" : `WAVE ${wave + 1} INCOMING!`);
    playSound("phaseChange");
    const bannerMs = reduce ? 600 : 1100;
    const timers: number[] = [
      window.setTimeout(() => setWaveBanner(null), bannerMs),
      ...WAVES[wave].map((entryIdx, k) =>
        window.setTimeout(() => {
          playSound("projectile");
          setFlyers((f) => f.map((fl, i) => (i === entryIdx ? { ...fl, status: "flying" } : fl)));
        }, bannerMs + 150 + k * (reduce ? 1800 : 1250)),
      ),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wave, reduce]);

  // Flight loop: all airborne flyers advance together.
  useEffect(() => {
    // Tuned down after play-testing: young readers need time to READ the
    // card before judging it. Still escalates wave to wave.
    const speeds = [10500, 9000, 7600]; // ms per crossing
    const tick = 40;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setFlyers((f) => {
        // Keep the array identity stable when nothing is airborne —
        // otherwise every 40ms tick re-renders and starves the
        // wave-advance timer below.
        if (!f.some((fl) => fl.status === "flying")) return f;
        return f.map((fl) =>
          fl.status === "flying"
            ? { ...fl, progress: Math.min(1, fl.progress + tick / ((reduce ? 1.7 : 1) * speeds[fl.wave])) }
            : fl,
        );
      });
    }, tick);
    return () => window.clearInterval(id);
  }, [reduce]);

  // Arrivals: safe → dock; private → LEAK (crack the form + teach).
  useEffect(() => {
    const arrived = flyers.find((fl) => fl.status === "flying" && fl.progress >= 1);
    if (!arrived) return;
    if (arrived.entry.isPrivate) {
      setFlyers((f) => f.map((fl) => (fl.entry.id === arrived.entry.id ? { ...fl, status: "leaked" } : fl)));
      setLeakFlash(arrived.entry.id);
      playSound("bossAttack");
      judge(`forge-whack-${arrived.entry.id}`, false, 0, 1, { title: "It hit the form! That one was PRIVATE", explanation: arrived.entry.explanation });
      window.setTimeout(() => setLeakFlash(null), 2400);
    } else {
      playSound("drop");
      setFlyers((f) => f.map((fl) => (fl.entry.id === arrived.entry.id ? { ...fl, status: "docked" } : fl)));
      judge(`forge-whack-${arrived.entry.id}`, true, 0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyers]);

  // Wave / phase completion. The advance timer lives behind a ref so
  // unrelated re-renders can never cancel-and-restarve it.
  const advanceScheduled = useRef(false);
  useEffect(() => {
    if (wave >= WAVES.length || advanceScheduled.current) return;
    const waveDone = WAVES[wave].every((i) => {
      const s = flyers[i].status;
      return s === "whacked" || s === "gone" || s === "docked" || s === "leaked";
    });
    if (!waveDone || waveBanner) return;
    advanceScheduled.current = true;
    if (wave + 1 < WAVES.length) {
      window.setTimeout(() => {
        advanceScheduled.current = false;
        setWave((w) => w + 1);
      }, 650);
    } else if (!finishedRef.current) {
      finishedRef.current = true;
      window.setTimeout(done, 650);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyers, wave, waveBanner]);

  const whack = (fl: Flyer, e: React.MouseEvent) => {
    if (paused || fl.status !== "flying") return;
    const at = { x: e.clientX, y: e.clientY };
    const rect = zoneRef.current?.getBoundingClientRect();
    if (fl.entry.isPrivate) {
      playSound("hitImpact");
      setFlyers((f) => f.map((x) => (x.entry.id === fl.entry.id ? { ...x, status: "whacked" } : x)));
      // Unmount the ghost once its fly-off animation lands.
      window.setTimeout(() => {
        setFlyers((f) => f.map((x) => (x.entry.id === fl.entry.id && x.status === "whacked" ? { ...x, status: "gone" } : x)));
      }, 520);
      if (rect && !reduce) {
        const b = { id: fl.entry.id, x: e.clientX - rect.left, y: e.clientY - rect.top, label: "WHACK!" };
        setBursts((bs) => [...bs.slice(-3), b]);
        window.setTimeout(() => setBursts((bs) => bs.filter((q) => q.id !== b.id)), 600);
      }
      judge(`forge-whack-${fl.entry.id}`, true, 1, 1, undefined, at);
    } else {
      judge(`forge-whack-${fl.entry.id}`, false, 1, 0, { title: "Oops - that one was fine!", explanation: fl.entry.explanation }, at);
      // The safe card survives the mis-whack and keeps flying to dock.
    }
  };

  const dockedList = flyers.filter((f) => f.status === "docked");
  const resolved = flyers.filter((f) => f.status !== "waiting" && f.status !== "flying").length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6, minHeight: 0, justifyContent: "center" }}>
      <PhaseHint accent={accent} text="He's hurling entries at YOUR form! WHACK the private ones — let the safe ones dock." />

      {/* Open combat zone — no box, the arena IS the lane. */}
      <div ref={zoneRef} style={{ position: "relative", height: 300, width: "100%", maxWidth: 940, margin: "0 auto" }}>
        {/* Holo profile form (the thing under siege) */}
        <div
          style={{
            position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 168, zIndex: 6,
            borderRadius: 12, padding: "10px 11px 12px",
            background: "linear-gradient(180deg, rgba(160,240,255,0.16), rgba(90,140,255,0.1))",
            border: "1.5px solid rgba(125,240,255,0.7)",
            boxShadow: "0 0 30px rgba(0,229,255,0.3), inset 0 0 24px rgba(0,229,255,0.12)",
            backdropFilter: "blur(5px)",
            fontFamily: MONO,
          }}
        >
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.12em", color: "#7df0ff", marginBottom: 6, textAlign: "center", textShadow: "0 0 10px rgba(0,229,255,0.8)" }}>
            ⛨ YOUR PROFILE FORM
          </div>
          {dockedList.length === 0 && !leakFlash && (
            <div style={{ fontSize: 9, fontWeight: 700, color: "#9fd8ff", textAlign: "center", padding: "8px 0" }}>defend me!</div>
          )}
          {dockedList.slice(-4).map((f) => (
            <motion.div
              key={f.entry.id}
              initial={reduce ? false : { x: 40, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              style={{ display: "flex", alignItems: "center", gap: 4, padding: "3.5px 6px", marginBottom: 3, borderRadius: 6, background: "rgba(52,211,153,0.2)", border: "1px solid rgba(126,255,151,0.55)", color: "#b8ffcb", fontSize: 8.5, fontWeight: 800 }}
            >
              ✓ {f.entry.text}
            </motion.div>
          ))}
          <AnimatePresence>
            {leakFlash && (
              <motion.div
                key={leakFlash}
                initial={{ opacity: 0, scale: reduce ? 1 : 1.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                style={{ padding: "4px 6px", borderRadius: 6, background: "rgba(255,47,109,0.28)", border: "1.5px solid #ff5fb3", color: "#ffc2d9", fontSize: 8.5, fontWeight: 900 }}
              >
                ⚠ {data.entries.find((x) => x.id === leakFlash)?.text} — SCRUB IT!
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Defence line */}
        <div aria-hidden style={{ position: "absolute", left: 186, top: 8, bottom: 8, width: 3, zIndex: 4, background: "repeating-linear-gradient(180deg, rgba(0,229,255,0.85) 0 12px, transparent 12px 22px)", boxShadow: "0 0 14px rgba(0,229,255,0.6)", borderRadius: 2 }} />

        {/* Flyers */}
        {flyers.map((fl) => {
          if (fl.status !== "flying" && fl.status !== "whacked") return null;
          const laneTop = 14 + fl.lane * 34; // % of zone height
          const bob = reduce ? 0 : Math.sin(fl.progress * Math.PI * fl.bobSeed) * 5;
          const closing = fl.entry.isPrivate && fl.progress > 0.7;
          return (
            <motion.button
              key={fl.entry.id}
              onClick={(e) => whack(fl, e)}
              disabled={paused || fl.status !== "flying"}
              animate={
                fl.status === "whacked" && !reduce
                  ? { opacity: 0, scale: 1.4, rotate: -50, y: -140 }
                  : { opacity: 1, scale: closing && !reduce ? [1, 1.06, 1] : 1 }
              }
              transition={fl.status === "whacked" ? { duration: 0.36 } : closing ? { duration: 0.5, repeat: Infinity } : { duration: 0.2 }}
              whileTap={reduce ? undefined : { scale: 0.85 }}
              aria-label={`Flying entry: ${fl.entry.text}. Tap to whack it away.`}
              style={{
                position: "absolute",
                top: `calc(${laneTop}% + ${bob}px)`,
                left: `${20 + (1 - fl.progress) * 72}%`,
                display: "flex", alignItems: "center", gap: 7, padding: "11px 14px", borderRadius: 12,
                cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit",
                background: closing
                  ? "linear-gradient(180deg, #ffb3c8 0%, #ff7597 100%)"
                  : "linear-gradient(180deg, #ffe9a8 0%, #f5c854 100%)",
                border: closing ? "2px solid #ff5fb3" : "2px solid #ffdf8e",
                boxShadow: closing
                  ? "0 0 26px rgba(255,47,109,0.75), 0 10px 20px -6px rgba(0,0,0,0.7)"
                  : "0 0 20px rgba(255,214,110,0.6), 0 10px 20px -6px rgba(0,0,0,0.7)",
                color: "#4a3208", fontSize: 14, fontWeight: 900, whiteSpace: "nowrap", zIndex: 5,
                // Whacked ghosts finish their fly-off animation but must
                // never intercept another tap.
                pointerEvents: fl.status === "flying" ? undefined : "none",
              }}
            >
              <PixIcon emoji={fl.entry.icon} size={22} /> {fl.entry.text}
            </motion.button>
          );
        })}

        {/* Comic whack bursts */}
        <AnimatePresence>
          {bursts.map((b) => (
            <motion.div
              key={b.id}
              initial={{ opacity: 1, scale: 0.4, rotate: -14 }}
              animate={{ opacity: 0, scale: 1.7, rotate: 6 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              aria-hidden
              style={{
                position: "absolute", left: b.x, top: b.y, transform: "translate(-50%, -50%)", zIndex: 8, pointerEvents: "none",
                fontFamily: MONO, fontSize: 30, fontWeight: 900, letterSpacing: "0.04em",
                color: "#fff35c", WebkitTextStroke: "2px #b91c1c",
                textShadow: "0 0 22px rgba(255,209,88,0.9), 0 4px 0 #b91c1c",
              }}
            >
              💥{b.label}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Wave banner */}
        <AnimatePresence>
          {waveBanner && (
            <motion.div
              key={waveBanner}
              initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 2.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
              transition={{ type: "spring", stiffness: 260, damping: 16 }}
              style={{
                position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)", zIndex: 9,
                fontFamily: MONO, fontSize: 30, fontWeight: 900, letterSpacing: "0.18em", whiteSpace: "nowrap",
                color: "#ffd158", textShadow: "0 0 30px rgba(255,209,88,0.9), 0 3px 8px rgba(0,0,0,0.9)",
              }}
            >
              {waveBanner}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        WAVE {Math.min(wave + 1, WAVES.length)}/{WAVES.length} · {resolved}/{data.entries.length} HANDLED · TAP = WHACK
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
