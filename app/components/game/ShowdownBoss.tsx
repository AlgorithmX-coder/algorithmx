"use client";

/**
 * ShowdownBoss — the config-driven boss engine for Weeks 3-20.
 *
 * THE LOCKED GRAMMAR (docs/cyberheroes/content-plans/boss-battles-design.md):
 * every boss is a machine the Raccoon wheels in, themed to the week.
 * Arrival (nameplate + one taunt) → THREE phases, each one of the week's
 * authored bossAttacks (telegraph → counter → gear pops) → a weak-point
 * question per popped gear → CHARGE-RELEASE finisher → unique escape
 * line. The Raccoon escapes every week until Week 20's real defeat.
 *
 * KID-FIRST CONTRACT (ages 6-9), inherited from VaultBoss: exactly two
 * verbs — TAP a big stationary thing, press-and-HOLD one button. Nothing
 * races the child, wrong answers teach and retry, there is no lose
 * state. Comfort mode is honoured by construction (all interactions are
 * turn-based or deadline-free holds).
 *
 * The five counter primitives are generic and dressed per week from
 * `ShowdownDef` (see weekContent/types.ts). Villain lines are authored
 * per week — NEVER repeated across weeks — and voiced (Callum) when
 * `voiceSlug` is set. Reporting speaks BossBattle's exact dialects so
 * family dashboards stay continuous.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound, playBGM, stopBGM } from "@/app/lib/sounds";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";
import type { WeekContent } from "@/app/lesson/weekContent";
import type {
  ShowdownDef,
  ShowdownPhaseDef,
  ShowdownTapTell,
  ShowdownShieldHold,
  ShowdownCounterCard,
  ShowdownOrderStrike,
  ShowdownDeflectSort,
} from "@/app/lesson/weekContent/types";
import type { BossEndStats, BossPhaseResult } from "@/app/components/game/BossBattle";
import {
  MONO,
  ROUNDED,
  RACCOON,
  type RaccoonMood,
  type HeroKey,
  makeHeroes,
  playVillain,
  playCoach,
  stopCoach,
  ParticleLayer,
  type ParticleAPI,
} from "@/app/components/game/bossArena";

type AttackMeta = NonNullable<WeekContent["bossAttacks"]>[number];

export interface ShowdownBossProps {
  showdown: ShowdownDef;
  attacks?: AttackMeta[];
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

type Stage =
  | "entrance"
  | "select"
  | "announce"
  | "play"
  | "weakPoint"
  | "phaseClear"
  | "finisherIntro"
  | "finisher"
  | "victory";

const FALLBACK_ATTACK: AttackMeta = {
  name: "SNEAKY TRICK",
  icon: "🪤",
  color: "#c084fc",
  glow: "rgba(192,132,252,0.55)",
  tag: "You know this one",
  emblemColor: 0xc084fc,
};

/** Deterministic shuffle (mulberry32, fixed seed) — resume-safe, and
 *  Date/Math.random stay out of render paths. */
function seededOrder(n: number, seed: number): number[] {
  let a = seed >>> 0;
  const rand = () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const idx = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

export default function ShowdownBoss({
  showdown,
  attacks,
  bossName = "HACKER RACCOON",
  onEnd,
  onQuestionAnswered,
}: ShowdownBossProps) {
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [stage, setStage] = useState<Stage>("entrance");
  const [entranceBeat, setEntranceBeat] = useState(0);
  const [hero, setHero] = useState<HeroKey | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [gears, setGears] = useState(0); // popped gears (0-3)
  const [raccoonMood, setRaccoonMood] = useState<RaccoonMood>("taunt");
  const [heroMood, setHeroMood] = useState<"idle" | "attack" | "celebrate">("idle");
  const [raccoonLine, setRaccoonLine] = useState<string | null>(null);
  const [teach, setTeach] = useState<null | { title: string; explanation: string }>(null);
  const [score, setScore] = useState(0);
  const [shakeNonce, setShakeNonce] = useState(0);
  const [popups, setPopups] = useState<{ id: number; text: string; colour: string; x: number; y: number }[]>([]);
  const [payoffStamp, setPayoffStamp] = useState(false);

  const arenaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ParticleAPI | null>(null);
  const popupSeq = useRef(0);
  const startTs = useRef(0);
  const position = useRef(0);
  const statsRef = useRef<Map<string, BossPhaseResult>>(new Map());

  const heroes = useMemo(() => makeHeroes(showdown.heroSprites), [showdown.heroSprites]);
  const slug = showdown.voiceSlug;

  const phases = showdown.phases;
  const phase: ShowdownPhaseDef | undefined = phases[phaseIdx];
  const attackSet = attacks && attacks.length > 0 ? attacks : [FALLBACK_ATTACK];
  const attack = attackSet[Math.min(phase?.attack ?? 0, attackSet.length - 1)] ?? FALLBACK_ATTACK;
  const accent = showdown.machine.accent;

  const inFinisher = stage === "finisherIntro" || stage === "finisher";
  // PILOT FEEDBACK (global): characters must NEVER stand behind the
  // gameplay boards. Boards are a centered fixed-width column while the
  // cast is viewport-positioned, so on wide screens they collide. During
  // board stages the cast tucks to the screen edges and shrinks
  // (sideline spectators), then springs back for the theatre beats.
  const boardStage = stage === "play" || stage === "weakPoint" || stage === "finisher";
  const machineImg =
    stage === "victory"
      ? showdown.machine.art.defeated
      : gears >= 2
        ? showdown.machine.art.damaged
        : showdown.machine.art.intact;

  const phaseId = (i: number) => `showdown-phase-${i + 1}`;

  useEffect(() => {
    const m = new Map<string, BossPhaseResult>();
    phases.forEach((p, i) => {
      m.set(phaseId(i), {
        phaseId: phaseId(i),
        label: attackSet[Math.min(p.attack, attackSet.length - 1)]?.name ?? `PHASE ${i + 1}`,
        correctCount: 0,
        wrongCount: 0,
        totalQuestions: 0,
      });
    });
    m.set("showdown-finisher", {
      phaseId: "showdown-finisher",
      label: "FINISHER",
      correctCount: 0,
      wrongCount: 0,
      totalQuestions: 0,
    });
    statsRef.current = m;
    // attackSet identity churns per render when the fallback kicks in; the
    // labels only depend on the authored content, so key off lengths.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phases]);

  /* Battle bed: on for the whole fight, killed with the component. */
  useEffect(() => {
    playBGM("bgmBoss");
    return () => {
      stopBGM(400);
      stopCoach();
    };
  }, []);

  /* Entrance: the machine rolls in, nameplate reveal, arrival taunt. */
  useEffect(() => {
    if (stage !== "entrance") return;
    const beats = reduce ? [300, 700, 1400] : [900, 2100, 3800];
    const timers = [
      window.setTimeout(() => {
        setEntranceBeat(1);
        playSound("bossRoar");
        if (slug) playVillain(`${slug}-arrival`);
        setShakeNonce((n) => n + 1);
      }, beats[0]),
      window.setTimeout(() => {
        setEntranceBeat(2);
        playSound("phaseChange");
      }, beats[1]),
      window.setTimeout(() => setStage("select"), beats[2]),
    ];
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [stage, reduce, slug]);

  const chooseHero = (key: HeroKey) => {
    playSound("select");
    setHero(key);
    playSound("phaseChange");
    setStage("announce");
  };

  useEffect(() => {
    if (stage === "announce" && startTs.current === 0) startTs.current = performance.now();
  }, [stage]);

  /* Telegraph: villain announce line per phase, then play. */
  useEffect(() => {
    if (stage !== "announce") return;
    if (slug) playVillain(`${slug}-phase-${phaseIdx + 1}`);
    const id = window.setTimeout(() => setStage("play"), reduce ? 1300 : 2600);
    return () => window.clearTimeout(id);
  }, [stage, phaseIdx, reduce, slug]);

  /* PILOT FEEDBACK (global): NO narrator voice during the fight — the
     coach banner is text-only. The one narrator moment is the excited
     "well done" line on the victory screen. */

  const shake = useCallback(() => setShakeNonce((n) => n + 1), []);
  const addPopup = useCallback((text: string, colour: string, x: number, y: number) => {
    const id = ++popupSeq.current;
    setPopups((p) => [...p.slice(-5), { id, text, colour, x, y }]);
    window.setTimeout(() => setPopups((p) => p.filter((q) => q.id !== id)), 950);
  }, []);

  const moodTimer = useRef<number | null>(null);
  const flashMood = useCallback((mood: RaccoonMood, line: string | null, ms = 1700) => {
    setRaccoonMood(mood);
    setRaccoonLine(line);
    if (moodTimer.current) window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => {
      setRaccoonMood("idle");
      setRaccoonLine(null);
    }, ms);
  }, []);

  const judge = useCallback(
    (
      key: string,
      wasCorrect: boolean,
      selectedIndex: number,
      correctIndex: number,
      teachOnWrong?: { title: string; explanation: string },
      at?: { x: number; y: number },
    ) => {
      const pid = inFinisher ? "showdown-finisher" : phaseId(phaseIdx);
      const stat = statsRef.current.get(pid);
      if (stat) {
        stat.totalQuestions += 1;
        if (wasCorrect) stat.correctCount += 1;
        else stat.wrongCount += 1;
      }
      position.current += 1;
      onQuestionAnswered?.({ key, selectedIndex, correctIndex, wasCorrect, position: position.current, phaseId: pid });

      const rect = arenaRef.current?.getBoundingClientRect();
      const px = at && rect ? at.x - rect.left : (rect?.width ?? 600) / 2;
      const py = at && rect ? at.y - rect.top : (rect?.height ?? 400) / 2;

      if (wasCorrect) {
        setScore((s) => s + 100);
        playSound("correct");
        particlesRef.current?.burst(px, py, accent, reduce ? 0 : 16);
        addPopup("+100", "#2fae4e", px, py);
        setHeroMood("attack");
        window.setTimeout(() => setHeroMood("idle"), 450);
        flashMood("hurt", null, 750);
      } else {
        playSound("wrong");
        shake();
        addPopup("TRY AGAIN!", "#e0447d", px, py);
        flashMood("attack", null, 1200);
        if (teachOnWrong) setTeach(teachOnWrong);
      }
    },
    [inFinisher, phaseIdx, onQuestionAnswered, accent, reduce, addPopup, flashMood, shake],
  );

  /* Counter beaten → the core glows: weak-point question. */
  const playDone = useCallback(() => {
    playSound("bossHurt");
    shake();
    setRaccoonMood("hurt");
    setStage("weakPoint");
  }, [shake]);

  /* Weak point answered → the gear pops. */
  const weakPointDone = useCallback(() => {
    playSound("screenShake");
    shake();
    setGears((g) => g + 1);
    setScore((s) => s + 250);
    setRaccoonMood("hurt");
    setStage("phaseClear");
    window.setTimeout(() => {
      if (phaseIdx + 1 >= phases.length) {
        playSound("phaseChange");
        setRaccoonMood("taunt");
        setStage("finisherIntro");
        window.setTimeout(() => setStage("finisher"), reduce ? 900 : 1800);
      } else {
        playSound("phaseChange");
        setRaccoonMood("taunt");
        setPhaseIdx((i) => i + 1);
        setStage("announce");
      }
    }, reduce ? 1400 : 2400);
  }, [phaseIdx, phases.length, reduce, shake]);

  /* Finisher released at full charge → victory theatre. */
  const finisherDone = useCallback(() => {
    setPayoffStamp(true);
    playSound("bossDefeated");
    if (slug) playVillain(`${slug}-escape`);
    setRaccoonMood("defeated");
    setHeroMood("celebrate");
    setScore((s) => s + 500);
    shake();
    window.setTimeout(() => setStage("victory"), reduce ? 1100 : 2000);
  }, [reduce, shake, slug]);

  /* Victory: bed out, coach celebration. */
  useEffect(() => {
    if (stage !== "victory") return;
    stopBGM(900);
    const t1 = window.setTimeout(() => playSound("victory"), 500);
    const t2 = window.setTimeout(() => {
      if (slug) playCoach(`${slug}-victory`);
    }, 1400);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [stage, slug]);

  const finish = () => {
    const phaseResults = Array.from(statsRef.current.values());
    const totals = phaseResults.reduce(
      (acc, r) => ({ q: acc.q + r.totalQuestions, c: acc.c + r.correctCount, w: acc.w + r.wrongCount }),
      { q: 0, c: 0, w: 0 },
    );
    onEnd?.(true, {
      combo: totals.c,
      accuracy: totals.q > 0 ? Math.round((totals.c / totals.q) * 100) : 100,
      xp: Math.round(score / 10),
      totalQuestions: totals.q,
      correctCount: totals.c,
      wrongCount: totals.w,
      durationMs: Math.round(performance.now() - startTs.current),
      phaseResults,
    });
  };

  const inBattle =
    stage === "announce" || stage === "play" || stage === "weakPoint" || stage === "phaseClear" || inFinisher;

  return (
    <motion.div
      key={shakeNonce > 0 ? `shake-${shakeNonce}` : "still"}
      animate={reduce || shakeNonce === 0 ? undefined : { x: [0, -7, 6, -4, 2, 0], y: [0, 3, -2, 1, 0, 0] }}
      transition={{ duration: 0.35 }}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#101430", color: "#1d2b4f", fontFamily: ROUNDED }}
    >
      {/* Week arena plate — one soft dim layer keeps cards readable. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: `url(${showdown.machine.arena})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,24,58,0.5) 0%, rgba(13,24,58,0.12) 26%, rgba(13,24,58,0.08) 62%, rgba(13,24,58,0.38) 100%)" }} />

      {/* Characters + the machine */}
      {hero && (
        <>
          <motion.img
            src={heroes[hero].sprites[heroMood]}
            alt=""
            aria-hidden
            animate={reduce ? undefined : heroMood === "attack" ? { x: 24, scale: 1.06 } : { x: 0, scale: 1, y: [0, -5, 0] }}
            transition={heroMood === "attack" ? { duration: 0.2 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", left: boardStage ? "1%" : "3%", bottom: "13%", height: boardStage ? "22%" : "32%", zIndex: 2, filter: "drop-shadow(0 14px 18px rgba(10,14,34,0.55))", transition: "height 600ms ease, left 600ms ease" }}
          />
          <div aria-hidden style={{ position: "absolute", left: "3%", bottom: "11%", width: "15%", height: 20, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(10,14,34,0.3), transparent 70%)" }} />
        </>
      )}

      <motion.img
        key={machineImg}
        src={machineImg}
        alt={showdown.machine.name}
        initial={reduce ? false : { scale: 0.94, opacity: 0.7 }}
        animate={
          reduce
            ? { scale: 1, opacity: 1 }
            : stage === "victory"
              ? { scale: 0.96, opacity: 0.95, rotate: 2 }
              : { scale: 1, opacity: 1, y: [0, -4, 0] }
        }
        transition={stage === "victory" ? { duration: 0.4 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", right: "3%", bottom: "10%", height: stage === "entrance" ? "46%" : boardStage ? "24%" : "34%", zIndex: 2, filter: "drop-shadow(0 18px 22px rgba(10,14,34,0.6))", transition: "height 600ms ease" }}
      />
      {/* Machine strain glow once it's damaged. */}
      {gears >= 2 && stage !== "victory" && !reduce && (
        <motion.div
          aria-hidden
          animate={{ opacity: [0.1, 0.32, 0.1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", right: "0%", bottom: "6%", width: "32%", height: "44%", zIndex: 1, borderRadius: "50%", background: `radial-gradient(ellipse, ${showdown.machine.glow}, transparent 65%)`, pointerEvents: "none" }}
        />
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
              ? { scale: 0.96, opacity: 1, x: 16, rotate: 3 }
              : raccoonMood === "defeated"
                ? { scale: 0.9, opacity: 0.92, y: 20, rotate: 6 }
                : { scale: 1, opacity: 1, y: [0, -7, 0] }
        }
        transition={raccoonMood === "idle" || raccoonMood === "taunt" ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.28 }}
        // PILOT FEEDBACK (global): the Raccoon stands as tall as the hero —
        // and during board stages he tucks beside his machine at the screen
        // edge so he can never hide behind the gameplay cards.
        style={{ position: "absolute", right: boardStage ? "9%" : "22%", bottom: "12%", height: boardStage ? "20%" : "32%", zIndex: 3, filter: "drop-shadow(0 12px 16px rgba(10,14,34,0.6))", transition: "height 600ms ease, right 600ms ease" }}
      />

      <AnimatePresence>
        {raccoonLine && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", right: "6%", top: "17%", zIndex: 25, maxWidth: 260,
              padding: "10px 14px", borderRadius: 14, borderBottomRightRadius: 3,
              background: "#fff", border: "2.5px solid #8b5cf6", color: "#4c1d95",
              fontSize: 14.5, fontWeight: 800, fontStyle: "italic", lineHeight: 1.35,
              boxShadow: "0 12px 30px -10px rgba(10,14,34,0.55)",
            }}
          >
            “{raccoonLine}”
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD: gear row + score. Deliberately minimal. */}
      {stage !== "entrance" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#eafff0", textShadow: "0 1px 6px rgba(13,24,58,0.8)", whiteSpace: "nowrap" }}>
              ⚙ MACHINE GEARS
            </span>
            <div style={{ flex: 1, display: "flex", gap: 4 }} role="progressbar" aria-valuenow={phases.length - gears} aria-valuemin={0} aria-valuemax={phases.length}>
              {phases.map((_, i) => {
                const alive = gears <= i;
                return (
                  <motion.div
                    key={i}
                    animate={alive ? { opacity: 1, scaleY: 1 } : { opacity: 0.3, scaleY: 0.55 }}
                    style={{
                      flex: 1, height: 16, borderRadius: 5,
                      background: alive ? `linear-gradient(180deg, ${accent}, ${accent}aa)` : "rgba(13,24,58,0.35)",
                      border: "1px solid rgba(255,255,255,0.55)",
                      boxShadow: alive ? `0 0 10px ${showdown.machine.glow}` : "none",
                    }}
                  />
                );
              })}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: "#fff7e6", textShadow: "0 1px 6px rgba(13,24,58,0.8)", minWidth: 92, textAlign: "right" }}>
              SCORE {score}
            </span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#eafff0", textShadow: "0 1px 6px rgba(13,24,58,0.8)", display: "flex", alignItems: "center", gap: 6 }}>
            {hero && <span>★ {heroes[hero].name}</span>}
            {hero && <span style={{ opacity: 0.6 }}>·</span>}
            {inFinisher || stage === "victory"
              ? "FINISHER"
              : `TRICK ${Math.min(phaseIdx + 1, phases.length)}/${phases.length} · ${attack.name}`}
          </div>
        </div>
      )}

      {/* Trick rail: his three tricks, foiled one by one. */}
      {inBattle && (
        <div className="sd-trick-rail" style={{ position: "absolute", top: 76, right: 12, zIndex: 20, width: 196, borderRadius: 14, padding: "8px 12px 10px", background: "rgba(255,255,255,0.92)", border: `2px solid ${accent}`, boxShadow: "0 10px 26px -12px rgba(10,14,34,0.5)", fontFamily: MONO }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "#0ea5c6", marginBottom: 6, textAlign: "center" }}>🦝 HIS TRICKS</div>
          {phases.map((p, i) => {
            const meta = attackSet[Math.min(p.attack, attackSet.length - 1)] ?? FALLBACK_ATTACK;
            const done = gears > i;
            const isCurrent = i === phaseIdx && !done && !inFinisher;
            return (
              <div key={i} style={{ marginBottom: 4, opacity: done ? 1 : isCurrent ? 0.95 : 0.45 }}>
                <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", color: done ? "#15803d" : isCurrent ? "#d98a06" : "#64748b" }}>
                  {meta.icon} {meta.name}
                </div>
                <div style={{ fontSize: 10, fontWeight: 800, color: done ? "#1d2b4f" : "#94a3b8" }}>
                  {done ? "✓ FOILED!" : isCurrent ? "…countering…" : "· · ·"}
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: 2, opacity: inFinisher ? 0.95 : 0.45 }}>
            <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.08em", color: inFinisher ? "#d98a06" : "#64748b" }}>
              {showdown.finisher.chargeIcon} FINISHER
            </div>
            <div style={{ fontSize: 10, fontWeight: 800, color: "#94a3b8" }}>{inFinisher ? "…charging…" : "· · ·"}</div>
          </div>
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
              style={{ position: "absolute", left: p.x, top: p.y, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 17, fontWeight: 900, color: p.colour, textShadow: "0 1px 4px rgba(255,255,255,0.8)" }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main stage */}
      <div ref={arenaRef} style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", padding: "76px 16px 14px" }}>
        <ParticleLayer apiRef={particlesRef} disabled={reduce} />

        <AnimatePresence mode="wait">
          {stage === "entrance" && (
            <motion.div key="entrance" exit={{ opacity: 0 }} style={{ margin: "auto", textAlign: "center", zIndex: 15 }}>
              {entranceBeat >= 1 && (
                <motion.div
                  initial={reduce ? false : { scale: 2.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 210, damping: 15 }}
                  style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, letterSpacing: "0.3em", color: "#ffb4c8", textShadow: "0 1px 8px rgba(13,24,58,0.9)", marginBottom: 10 }}
                >
                  ⚠ HIS NEW MACHINE ROLLS IN ⚠
                </motion.div>
              )}
              {entranceBeat >= 2 && (
                <>
                  <motion.h1
                    initial={reduce ? false : { scale: 3, opacity: 0, rotate: -4 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 190, damping: 14 }}
                    style={{ margin: 0, fontSize: 48, fontWeight: 900, lineHeight: 1.05, background: `linear-gradient(135deg, ${accent} 0%, #ffd158 55%, #ff5fb3 100%)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 3px 8px rgba(13,24,58,0.9))" }}
                  >
                    {showdown.machine.name}
                  </motion.h1>
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: reduce ? 0 : 0.3 }}
                    style={{ marginTop: 8, fontSize: 15, fontWeight: 800, color: "#f6f9ff", textShadow: "0 1px 8px rgba(13,24,58,0.9)" }}
                  >
                    {showdown.machine.tagline}
                  </motion.div>
                </>
              )}
            </motion.div>
          )}

          {stage === "select" && (
            <motion.div key="select" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ margin: "auto", textAlign: "center", maxWidth: 560, width: "100%", zIndex: 15 }}>
              <h2 style={{ margin: "0 0 2px", fontSize: 30, fontWeight: 900, color: "#fff", textShadow: "0 2px 10px rgba(13,24,58,0.9)" }}>
                CHOOSE YOUR HERO
              </h2>
              <p style={{ margin: "0 0 16px", fontSize: 13.5, fontWeight: 700, fontStyle: "italic", color: "#f6f9ff", textShadow: "0 1px 6px rgba(13,24,58,0.8)" }}>
                🦝 “{showdown.villain.arrival}”
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {(Object.keys(heroes) as HeroKey[]).map((key) => {
                  const h = heroes[key];
                  return (
                    <motion.button
                      key={key}
                      onClick={() => chooseHero(key)}
                      whileHover={reduce ? undefined : { y: -6, scale: 1.03 }}
                      whileTap={reduce ? undefined : { scale: 0.95 }}
                      // PILOT FEEDBACK (global): the select cards blend into
                      // the arena — glassy night panels, not flat white.
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        padding: "16px 12px 14px", borderRadius: 18, cursor: "pointer",
                        touchAction: "manipulation", fontFamily: "inherit",
                        background: "rgba(13,18,44,0.52)",
                        backdropFilter: "blur(7px)",
                        WebkitBackdropFilter: "blur(7px)",
                        border: `2.5px solid ${h.theme.accent}aa`,
                        boxShadow: `0 14px 30px -14px rgba(4,6,16,0.8), 0 0 26px ${h.theme.glow} inset`,
                        color: "#f6f9ff",
                      }}
                      aria-label={`Play as ${h.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={h.sprites.idle} alt="" style={{ height: 132, objectFit: "contain", filter: "drop-shadow(0 10px 14px rgba(4,6,16,0.6))" }} />
                      <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: "0.08em", color: h.theme.accent, textShadow: "0 1px 8px rgba(4,6,16,0.8)" }}>{h.name}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#cbd5ec" }}>{h.tagline}</span>
                      <span style={{ marginTop: 2, padding: "7px 26px", borderRadius: 999, background: h.theme.accent, color: "#fff", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em" }}>
                        SELECT
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {stage === "announce" && phase && (
            <motion.div
              key={`announce-${phaseIdx}`}
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 1.08 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              style={{ margin: "auto", textAlign: "center", maxWidth: 540, zIndex: 15 }}
            >
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, letterSpacing: "0.28em", color: "#f6f9ff", textShadow: "0 1px 8px rgba(13,24,58,0.9)", marginBottom: 8 }}>
                — TRICK {phaseIdx + 1} OF {phases.length} —
              </div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 26px", borderRadius: 18, background: "rgba(255,255,255,0.94)", border: `3px solid ${attack.color}`, boxShadow: `0 14px 34px -14px ${attack.glow}`, fontSize: 32, fontWeight: 900, marginBottom: 10, color: "#1d2b4f" }}>
                <PixIcon emoji={attack.icon} size={40} />
                {attack.name}
              </div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "#f6f9ff", fontStyle: "italic", textShadow: "0 1px 8px rgba(13,24,58,0.9)" }}>
                🦝 “{showdown.villain.phases[phaseIdx] ?? "Try THIS one!"}”
              </div>
            </motion.div>
          )}

          {stage === "play" && phase && (
            <motion.div key={`play-${phaseIdx}`} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column", zIndex: 15, minHeight: 0 }}>
              <CoachBanner text={phase.coach} accent={attack.color} reduce={reduce} />
              {phase.kind === "tapTell" && <TapTellPhase data={phase} pkey={`p${phaseIdx}`} judge={judge} done={playDone} reduce={reduce} accent={attack.color} />}
              {phase.kind === "shieldHold" && <ShieldHoldPhase data={phase} pkey={`p${phaseIdx}`} paused={!!teach} judge={judge} done={playDone} reduce={reduce} accent={attack.color} />}
              {phase.kind === "counterCard" && <CounterCardPhase data={phase} pkey={`p${phaseIdx}`} judge={judge} done={playDone} reduce={reduce} accent={attack.color} />}
              {phase.kind === "orderStrike" && <OrderStrikePhase data={phase} pkey={`p${phaseIdx}`} judge={judge} done={playDone} reduce={reduce} accent={attack.color} />}
              {phase.kind === "deflectSort" && <DeflectSortPhase data={phase} pkey={`p${phaseIdx}`} judge={judge} done={playDone} reduce={reduce} accent={attack.color} />}
            </motion.div>
          )}

          {stage === "weakPoint" && (
            <WeakPointPanel
              key={`wp-${phaseIdx}`}
              question={showdown.weakPoints[Math.min(phaseIdx, showdown.weakPoints.length - 1)]}
              pkey={`wp-${phaseIdx}`}
              judge={judge}
              done={weakPointDone}
              reduce={reduce}
              accent={accent}
            />
          )}

          {stage === "phaseClear" && (
            <motion.div
              key={`clear-${phaseIdx}`}
              initial={reduce ? false : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 1.1 }}
              transition={{ type: "spring", stiffness: 230, damping: 15 }}
              style={{ margin: "auto", textAlign: "center", zIndex: 15 }}
            >
              <div style={{ display: "inline-block", padding: "18px 34px", borderRadius: 22, background: "rgba(255,255,255,0.95)", border: "3px solid #2fae4e", boxShadow: "0 18px 44px -16px rgba(10,14,34,0.6)" }}>
                <motion.div
                  initial={reduce ? false : { rotate: 0, y: 0, opacity: 1 }}
                  animate={reduce ? undefined : { rotate: 80, y: 26, opacity: 0.9 }}
                  transition={{ delay: 0.35, duration: 0.7, ease: "easeIn" }}
                  style={{ fontSize: 42, lineHeight: 1 }}
                >
                  ⚙
                </motion.div>
                <div style={{ fontSize: 38, fontWeight: 900, color: "#15803d", margin: "2px 0 4px" }}>
                  GEAR POPPED!
                </div>
                <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: "#0ea5c6", marginBottom: 4 }}>
                  {attack.name} — FOILED
                </div>
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: "#1d2b4f" }}>+250 pts</div>
              </div>
            </motion.div>
          )}

          {stage === "finisherIntro" && (
            <motion.div
              key="finisher-intro"
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 1.08 }}
              transition={{ type: "spring", stiffness: 220, damping: 18 }}
              style={{ margin: "auto", textAlign: "center", zIndex: 15 }}
            >
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, letterSpacing: "0.28em", color: "#ffd158", textShadow: "0 1px 8px rgba(13,24,58,0.9)", marginBottom: 8 }}>
                — EVERY GEAR POPPED —
              </div>
              <div style={{ fontSize: 36, fontWeight: 900, color: "#fff", textShadow: "0 2px 10px rgba(13,24,58,0.9)" }}>
                THE MACHINE IS WOBBLING!
              </div>
            </motion.div>
          )}

          {stage === "finisher" && (
            <FinisherStage
              key="finisher"
              data={showdown.finisher}
              paused={!!teach}
              judge={judge}
              done={finisherDone}
              reduce={reduce}
              accent={accent}
              stamp={payoffStamp}
            />
          )}

          {stage === "victory" && (
            <motion.div key="victory" initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ margin: "auto", textAlign: "center", maxWidth: 480, zIndex: 15 }}>
              <motion.div
                initial={reduce ? false : { y: -70, opacity: 0, rotate: -8 }}
                animate={{ y: 0, opacity: 1, rotate: -2 }}
                transition={{ delay: reduce ? 0 : 0.5, type: "spring", stiffness: 110, damping: 13 }}
                style={{ margin: "0 auto 14px", width: 260, padding: "13px 15px", borderRadius: 4, background: "#f7f4ea", color: "#3b3a33", fontFamily: MONO, boxShadow: "0 18px 40px -12px rgba(10,14,34,0.6)" }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", borderBottom: "1.5px dashed #b9b4a2", paddingBottom: 5, marginBottom: 7 }}>
                  {showdown.machine.name} REPORT
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, padding: "2px 0" }}>
                  <span>TRICKS THAT WORKED:</span><span style={{ color: "#b91c1c", fontWeight: 900 }}>ZERO</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, padding: "2px 0" }}>
                  <span>GEARS LEFT:</span><span style={{ color: "#b91c1c", fontWeight: 900 }}>NONE</span>
                </div>
                <div style={{ marginTop: 7, fontSize: 11, fontWeight: 900, color: "#b91c1c", letterSpacing: "0.06em" }}>
                  STATUS: {showdown.finisher.payoffTitle}
                </div>
              </motion.div>
              <div style={{ margin: "0 auto 10px", maxWidth: 340, padding: "10px 14px", borderRadius: 14, borderBottomLeftRadius: 3, background: "#fff", border: "2.5px solid #8b5cf6", color: "#4c1d95", fontSize: 14, fontWeight: 800, fontStyle: "italic", lineHeight: 1.35, boxShadow: "0 12px 30px -10px rgba(10,14,34,0.55)" }}>
                🦝 “{showdown.villain.escape}”
              </div>
              <h2 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 900, color: "#f6f9ff", textShadow: "0 2px 10px rgba(13,24,58,0.9)" }}>
                {showdown.finisher.payoffLine}
              </h2>
              <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 999, background: "rgba(255,255,255,0.95)", border: "2.5px solid #d98a06", fontFamily: MONO, fontSize: 13, fontWeight: 900, color: "#b45309", marginBottom: 14, boxShadow: "0 8px 20px -10px rgba(10,14,34,0.6)" }}>
                FINAL SCORE {score}
              </div>
              <div>
                <GameButton variant="success" size="lg" onClick={finish}>
                  Claim the win →
                </GameButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {teach && <WrongAnswerPanel title={teach.title} explanation={teach.explanation} onContinue={() => setTeach(null)} />}
      </div>

      <style>{`
        @media (max-width: 860px) { .sd-trick-rail { display: none !important; } }
      `}</style>
    </motion.div>
  );
}

type JudgeFn = (
  key: string,
  wasCorrect: boolean,
  sel: number,
  cor: number,
  teach?: { title: string; explanation: string },
  at?: { x: number; y: number },
) => void;

/* ───────────────────────── COACH BANNER ───────────────────────── */

function CoachBanner({ text, accent, reduce }: { text: string; accent: string; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        margin: "0 auto 10px", display: "flex", alignItems: "center", gap: 10,
        padding: "9px 18px", borderRadius: 999, width: "max-content", maxWidth: "94%",
        background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`,
        boxShadow: "0 12px 28px -14px rgba(10,14,34,0.6)",
      }}
    >
      <motion.span
        animate={reduce ? undefined : { scale: [1, 1.25, 1] }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
        style={{ display: "flex" }}
      >
        <PixIcon emoji="👆" size={26} />
      </motion.span>
      <span style={{ fontSize: 16, fontWeight: 900, color: "#1d2b4f", lineHeight: 1.25 }}>{text}</span>
    </motion.div>
  );
}

/* ─────────────────────── TAP-THE-TELL ───────────────────────
   A trick object per round; tap the red flag on it. Wrong taps teach
   and retry. Nothing moves, nothing is timed. */

function TapTellPhase({ data, pkey, judge, done, reduce, accent }: { data: ShowdownTapTell; pkey: string; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [roundIdx, setRoundIdx] = useState(0);
  const [found, setFound] = useState(false);
  const finishedRef = useRef(false);
  const rawRound = data.rounds[Math.min(roundIdx, data.rounds.length - 1)];
  // Shuffle option positions per round — the tell drifts, never fixed.
  const round = useMemo(
    () => ({
      ...rawRound,
      options: seededOrder(rawRound.options.length, 911 + rawRound.id.length * 31 + roundIdx * 97).map(
        (i) => rawRound.options[i],
      ),
    }),
    [rawRound, roundIdx],
  );

  const tap = (opt: ShowdownTapTell["rounds"][number]["options"][number], i: number, e: React.MouseEvent) => {
    if (found || finishedRef.current) return;
    if (opt.isTell) {
      judge(`${pkey}-${round.id}`, true, i, i, undefined, { x: e.clientX, y: e.clientY });
      setFound(true);
      window.setTimeout(() => {
        if (roundIdx + 1 >= data.rounds.length) {
          finishedRef.current = true;
          done();
        } else {
          setFound(false);
          setRoundIdx((r) => r + 1);
        }
      }, 1100);
    } else {
      const tell = round.options.findIndex((o) => o.isTell);
      judge(`${pkey}-${round.id}`, false, i, tell, { title: "Not that one!", explanation: opt.note }, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minHeight: 0, justifyContent: "center" }}>
      <motion.div
        key={round.id}
        initial={reduce ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ margin: "0 auto", width: "100%", maxWidth: 560, textAlign: "center", padding: "14px 18px", borderRadius: 16, background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`, boxShadow: "0 12px 30px -14px rgba(10,14,34,0.55)" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 4 }}>
          <PixIcon emoji={round.promptIcon} size={34} />
          <span style={{ fontSize: 17, fontWeight: 900, color: "#1d2b4f", lineHeight: 1.3 }}>{round.prompt}</span>
        </div>
        {found && (
          <motion.div initial={reduce ? false : { scale: 1.3 }} animate={{ scale: 1 }} style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: "#15803d" }}>
            ✓ TELL SPOTTED!
          </motion.div>
        )}
      </motion.div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        {round.options.map((opt, i) => (
          <motion.button
            key={opt.id}
            onClick={(e) => tap(opt, i, e)}
            disabled={found}
            animate={found || reduce ? { scale: 1 } : { scale: [1, 1.05, 1] }}
            transition={found || reduce ? undefined : { duration: 1.4, repeat: Infinity, ease: "easeInOut", delay: i * 0.22 }}
            whileTap={reduce ? undefined : { scale: 0.92 }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
              width: 168, padding: "16px 12px", borderRadius: 16,
              cursor: found ? "default" : "pointer", touchAction: "manipulation", fontFamily: "inherit",
              background: found && opt.isTell ? "linear-gradient(180deg, #5eeaa5, #178a56)" : "rgba(255,255,255,0.94)",
              border: found && opt.isTell ? "3px solid #a4f5cd" : `3px solid ${accent}55`,
              color: found && opt.isTell ? "#06281a" : "#1d2b4f",
              boxShadow: "0 14px 30px -14px rgba(10,14,34,0.55)",
              fontSize: 13.5, fontWeight: 800, lineHeight: 1.25,
            }}
          >
            <PixIcon emoji={opt.icon} size={34} />
            {opt.label}
          </motion.button>
        ))}
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 11, fontWeight: 800, color: "#f6f9ff", textShadow: "0 1px 6px rgba(13,24,58,0.8)" }}>
        CLUE {Math.min(roundIdx + 1, data.rounds.length)} / {data.rounds.length}
      </div>
    </div>
  );
}

/* ─────────────────────── SHIELD-HOLD ───────────────────────
   The pressure barrage rages until the shield has been held for
   holdSecs total. Release pauses, never resets. No deadline. */

function ShieldHoldPhase({ data, pkey, paused, judge, done, reduce, accent }: { data: ShowdownShieldHold; pkey: string; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [heldMs, setHeldMs] = useState(0);
  const [holding, setHolding] = useState(false);
  const [burnout, setBurnout] = useState(false);
  const [barrageIdx, setBarrageIdx] = useState(0);
  const holdingRef = useRef(false);
  const pausedRef = useRef(paused);
  const finishedRef = useRef(false);
  const needMs = data.holdSecs * 1000;

  useEffect(() => {
    holdingRef.current = holding;
    pausedRef.current = paused;
  }, [holding, paused]);

  /* Barrage lines cycle while the attack rages. */
  useEffect(() => {
    if (burnout) return;
    const id = window.setInterval(() => setBarrageIdx((i) => i + 1), reduce ? 2400 : 1700);
    return () => window.clearInterval(id);
  }, [burnout, reduce]);

  /* Held-time accumulator. */
  useEffect(() => {
    const tick = 100;
    const id = window.setInterval(() => {
      if (!holdingRef.current || pausedRef.current || finishedRef.current) return;
      setHeldMs((ms) => {
        const next = ms + tick;
        if (next >= needMs && !finishedRef.current) {
          finishedRef.current = true;
          window.setTimeout(() => {
            setBurnout(true);
            playSound("lock");
            judge(`${pkey}-hold`, true, 0, 0);
            window.setTimeout(done, 1900);
          }, 0);
        }
        return next;
      });
    }, tick);
    return () => window.clearInterval(id);
  }, [needMs, judge, done, pkey]);

  const pct = Math.min(100, Math.round((heldMs / needMs) * 100));
  const line = data.barrage[barrageIdx % data.barrage.length];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minHeight: 0, justifyContent: "center", alignItems: "center" }}>
      {/* The raging attack panel */}
      <motion.div
        animate={burnout || reduce ? { rotate: 0 } : { rotate: [0, -1.5, 1.5, 0] }}
        transition={burnout ? undefined : { duration: 0.5, repeat: Infinity }}
        style={{
          width: "100%", maxWidth: 480, textAlign: "center", padding: "18px 20px", borderRadius: 18,
          background: burnout ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.95)",
          border: burnout ? "3px solid #94a3b8" : "3px solid #e0447d",
          boxShadow: burnout ? "none" : "0 14px 34px -14px rgba(224,68,125,0.7)",
          opacity: burnout ? 0.75 : 1,
        }}
      >
        {burnout ? (
          <>
            <div style={{ fontSize: 30, fontWeight: 900, color: "#15803d", marginBottom: 2 }}>…it burned out!</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#1d2b4f" }}>{data.burnoutLine}</div>
          </>
        ) : (
          <motion.div key={line} initial={reduce ? false : { scale: 1.15, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} style={{ fontSize: 22, fontWeight: 900, color: "#b91c2e", lineHeight: 1.25 }}>
            {line}
          </motion.div>
        )}
      </motion.div>

      {/* Shield progress ring (flex-centred — no transform centering). */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        <div style={{ position: "relative", width: 110, height: 110, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="110" height="110" viewBox="0 0 110 110" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
            <circle cx="55" cy="55" r="48" fill="rgba(255,255,255,0.85)" stroke="rgba(13,24,58,0.2)" strokeWidth="9" />
            <circle
              cx="55" cy="55" r="48" fill="none" stroke={accent} strokeWidth="9" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 48}
              strokeDashoffset={(1 - pct / 100) * 2 * Math.PI * 48}
              style={{ transition: "stroke-dashoffset 120ms linear" }}
            />
          </svg>
          <div style={{ zIndex: 1, textAlign: "center" }}>
            <PixIcon emoji={data.holdIcon} size={34} />
            <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, color: "#1d2b4f" }}>{pct}%</div>
          </div>
        </div>

        <motion.button
          onPointerDown={() => { if (!burnout) { setHolding(true); playSound("click"); } }}
          onPointerUp={() => setHolding(false)}
          onPointerLeave={() => setHolding(false)}
          animate={!holding && !burnout && !reduce ? { scale: [1, 1.06, 1] } : { scale: 1 }}
          transition={{ duration: 0.8, repeat: Infinity }}
          whileTap={reduce ? undefined : { scale: 0.94 }}
          disabled={burnout}
          style={{
            padding: "24px 52px", borderRadius: 999, cursor: burnout ? "default" : "pointer", touchAction: "none",
            fontFamily: "inherit", fontSize: 21, fontWeight: 900, letterSpacing: "0.05em",
            background: holding ? "linear-gradient(180deg, #5eeaa5, #178a56)" : "linear-gradient(180deg, #ffd158, #f59e0b)",
            border: holding ? "5px solid #a4f5cd" : "5px solid #fff",
            boxShadow: holding ? "0 0 34px rgba(94,234,165,0.7)" : "0 16px 38px -10px rgba(245,158,11,0.8)",
            color: holding ? "#06281a" : "#4a3208",
            userSelect: "none", WebkitUserSelect: "none",
            opacity: burnout ? 0.6 : 1,
          }}
        >
          {data.holdIcon} {holding ? "HOLDING…" : data.holdLabel}
        </motion.button>
      </div>
    </div>
  );
}

/* ─────────────────────── COUNTER-CARD ───────────────────────
   The situation lands; pick the right defence from three big cards. */

function CounterCardPhase({ data, pkey, judge, done, reduce, accent }: { data: ShowdownCounterCard; pkey: string; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [picked, setPicked] = useState(false);
  const finishedRef = useRef(false);
  // Shuffle card positions — the hero move is never predictably first.
  const cards = useMemo(
    () => seededOrder(data.cards.length, 4177 + data.situation.length * 7).map((i) => data.cards[i]),
    [data],
  );

  const tap = (card: ShowdownCounterCard["cards"][number], i: number, e: React.MouseEvent) => {
    if (picked || finishedRef.current) return;
    if (card.isRight) {
      judge(`${pkey}-card`, true, i, i, undefined, { x: e.clientX, y: e.clientY });
      setPicked(true);
      finishedRef.current = true;
      window.setTimeout(done, 1200);
    } else {
      const right = cards.findIndex((c) => c.isRight);
      judge(`${pkey}-card`, false, i, right, { title: "Not that move!", explanation: card.note }, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minHeight: 0, justifyContent: "center" }}>
      <div style={{ margin: "0 auto", width: "100%", maxWidth: 540, textAlign: "center", padding: "16px 20px", borderRadius: 16, background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`, boxShadow: "0 12px 30px -14px rgba(10,14,34,0.55)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
          <PixIcon emoji={data.situationIcon} size={36} />
          <span style={{ fontSize: 17.5, fontWeight: 900, color: "#1d2b4f", lineHeight: 1.3 }}>{data.situation}</span>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        {cards.map((card, i) => (
          <motion.button
            key={card.id}
            onClick={(e) => tap(card, i, e)}
            disabled={picked}
            whileHover={reduce || picked ? undefined : { y: -5, scale: 1.02 }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
              width: 190, padding: "18px 14px", borderRadius: 18,
              cursor: picked ? "default" : "pointer", touchAction: "manipulation", fontFamily: "inherit",
              background: picked && card.isRight ? "linear-gradient(180deg, #5eeaa5, #178a56)" : "rgba(255,255,255,0.94)",
              border: picked && card.isRight ? "3px solid #a4f5cd" : `3px solid ${accent}66`,
              color: picked && card.isRight ? "#06281a" : "#1d2b4f",
              boxShadow: "0 16px 34px -14px rgba(10,14,34,0.6)",
              fontSize: 14.5, fontWeight: 900, lineHeight: 1.3,
            }}
          >
            <PixIcon emoji={card.icon} size={42} />
            {card.label}
            {picked && card.isRight && <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 900 }}>✓ COUNTERED!</span>}
          </motion.button>
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────── ORDER-STRIKE ───────────────────────
   Tap the counter-steps in order; each correct step lands a hit. */

function OrderStrikePhase({ data, pkey, judge, done, reduce, accent }: { data: ShowdownOrderStrike; pkey: string; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [placedCount, setPlacedCount] = useState(0);
  const finishedRef = useRef(false);
  const display = useMemo(
    () => seededOrder(data.steps.length, 1337 + data.steps.length).map((i) => data.steps[i]),
    [data.steps],
  );

  const tap = (step: ShowdownOrderStrike["steps"][number], e: React.MouseEvent) => {
    if (finishedRef.current) return;
    const expected = data.steps[placedCount];
    const displayIdx = display.findIndex((s) => s.id === step.id);
    const expectedDisplayIdx = display.findIndex((s) => s.id === expected.id);
    if (step.id === expected.id) {
      judge(`${pkey}-step-${step.id}`, true, displayIdx, expectedDisplayIdx, undefined, { x: e.clientX, y: e.clientY });
      const next = placedCount + 1;
      setPlacedCount(next);
      if (next >= data.steps.length) {
        finishedRef.current = true;
        playSound("lock");
        window.setTimeout(done, 1000);
      }
    } else {
      judge(
        `${pkey}-step-${step.id}`,
        false,
        displayIdx,
        expectedDisplayIdx,
        { title: "Not yet!", explanation: `“${expected.label}” comes ${placedCount === 0 ? "first" : "next"} — the order is the power.` },
        { x: e.clientX, y: e.clientY },
      );
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minHeight: 0, justifyContent: "center" }}>
      <div style={{ margin: "0 auto", textAlign: "center", maxWidth: 540, fontSize: 15.5, fontWeight: 800, color: "#f6f9ff", textShadow: "0 1px 8px rgba(13,24,58,0.9)" }}>
        {data.intro}
      </div>

      {/* Slot row */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        {data.steps.map((step, i) => {
          const filled = i < placedCount;
          return (
            <div
              key={step.id}
              style={{
                width: 108, minHeight: 64, borderRadius: 14, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", gap: 3, padding: "8px 6px",
                background: filled ? "rgba(255,255,255,0.95)" : "rgba(255,255,255,0.35)",
                border: filled ? "3px solid #2fae4e" : "3px dashed rgba(255,255,255,0.8)",
                boxShadow: filled ? "0 10px 24px -12px rgba(10,14,34,0.5)" : "none",
              }}
            >
              {filled ? (
                <>
                  <PixIcon emoji={step.icon} size={24} />
                  <span style={{ fontSize: 10.5, fontWeight: 900, color: "#15803d", textAlign: "center", lineHeight: 1.15 }}>{step.label}</span>
                </>
              ) : (
                <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 900, color: "rgba(255,255,255,0.9)" }}>{i + 1}</span>
              )}
            </div>
          );
        })}
      </div>

      {/* Shuffled step buttons */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
        {display.map((step) => {
          const used = data.steps.findIndex((s) => s.id === step.id) < placedCount;
          return (
            <motion.button
              key={step.id}
              onClick={(e) => tap(step, e)}
              disabled={used}
              whileTap={reduce || used ? undefined : { scale: 0.92 }}
              animate={used || reduce ? { scale: 1 } : { scale: [1, 1.04, 1] }}
              transition={used || reduce ? undefined : { duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                width: 132, padding: "14px 10px", borderRadius: 16,
                cursor: used ? "default" : "pointer", touchAction: "manipulation", fontFamily: "inherit",
                background: used ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.94)",
                border: used ? "3px solid #94a3b8" : `3px solid ${accent}`,
                color: used ? "#94a3b8" : "#1d2b4f",
                boxShadow: used ? "none" : "0 14px 30px -14px rgba(10,14,34,0.55)",
                fontSize: 13, fontWeight: 900, lineHeight: 1.2,
                opacity: used ? 0.55 : 1,
              }}
            >
              <PixIcon emoji={step.icon} size={30} />
              {step.label} {used && "✓"}
            </motion.button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 11, fontWeight: 800, color: "#f6f9ff", textShadow: "0 1px 6px rgba(13,24,58,0.8)" }}>
        {placedCount} / {data.steps.length} STEPS LANDED
      </div>
    </div>
  );
}

/* ─────────────────────── DEFLECT-SORT ───────────────────────
   His things slide in one at a time; hit the primary verb on the right
   ones, wave the rest through. Turn-based — nothing to chase. */

function DeflectSortPhase({ data, pkey, judge, done, reduce, accent }: { data: ShowdownDeflectSort; pkey: string; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [idx, setIdx] = useState(0);
  const [verdict, setVerdict] = useState<null | "act" | "pass">(null);
  const finishedRef = useRef(false);
  const item = data.items[Math.min(idx, data.items.length - 1)];

  const answer = (chosenAct: boolean, e: React.MouseEvent) => {
    if (verdict || finishedRef.current) return;
    const correct = chosenAct === item.act;
    if (correct) {
      judge(`${pkey}-${item.id}`, true, chosenAct ? 0 : 1, item.act ? 0 : 1, undefined, { x: e.clientX, y: e.clientY });
      setVerdict(chosenAct ? "act" : "pass");
      window.setTimeout(() => {
        if (idx + 1 >= data.items.length) {
          finishedRef.current = true;
          done();
        } else {
          setVerdict(null);
          setIdx((i) => i + 1);
        }
      }, 950);
    } else {
      judge(`${pkey}-${item.id}`, false, chosenAct ? 0 : 1, item.act ? 0 : 1, { title: chosenAct ? "Wave that one through!" : "Don't let that one past!", explanation: item.note }, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minHeight: 0, justifyContent: "center", alignItems: "center" }}>
      {/* The incoming thing */}
      <motion.div
        key={item.id}
        initial={reduce ? false : { x: 120, opacity: 0 }}
        animate={
          verdict === "act"
            ? { x: 0, opacity: 0, scale: 0.4, rotate: 20 }
            : verdict === "pass"
              ? { x: -160, opacity: 0 }
              : { x: 0, opacity: 1, scale: 1 }
        }
        transition={{ duration: verdict ? 0.45 : 0.35 }}
        style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
          width: 260, padding: "22px 18px", borderRadius: 18, textAlign: "center",
          background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`,
          boxShadow: "0 16px 38px -14px rgba(10,14,34,0.6)",
        }}
      >
        <PixIcon emoji={item.icon} size={46} />
        <span style={{ fontSize: 15.5, fontWeight: 900, color: "#1d2b4f", lineHeight: 1.3 }}>{item.label}</span>
      </motion.div>

      {/* The two verbs */}
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
        <motion.button
          onClick={(e) => answer(true, e)}
          disabled={!!verdict}
          whileTap={reduce ? undefined : { scale: 0.93 }}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "18px 34px", borderRadius: 999,
            cursor: verdict ? "default" : "pointer", touchAction: "manipulation", fontFamily: "inherit",
            fontSize: 18, fontWeight: 900, letterSpacing: "0.04em",
            background: "linear-gradient(180deg, #ff8fb8, #e0447d)", border: "4px solid #ffd7e6", color: "#fff",
            boxShadow: "0 14px 32px -10px rgba(224,68,125,0.8)",
          }}
        >
          <PixIcon emoji={data.actIcon} size={26} /> {data.actLabel}
        </motion.button>
        <motion.button
          onClick={(e) => answer(false, e)}
          disabled={!!verdict}
          whileTap={reduce ? undefined : { scale: 0.93 }}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "18px 34px", borderRadius: 999,
            cursor: verdict ? "default" : "pointer", touchAction: "manipulation", fontFamily: "inherit",
            fontSize: 18, fontWeight: 900, letterSpacing: "0.04em",
            background: "linear-gradient(180deg, #7de8a9, #178a56)", border: "4px solid #c9f7db", color: "#fff",
            boxShadow: "0 14px 32px -10px rgba(23,138,86,0.8)",
          }}
        >
          <PixIcon emoji="👍" size={26} /> {data.passLabel}
        </motion.button>
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 11, fontWeight: 800, color: "#f6f9ff", textShadow: "0 1px 6px rgba(13,24,58,0.8)" }}>
        {idx + (verdict ? 1 : 0)} / {data.items.length} SORTED
      </div>
    </div>
  );
}

/* ─────────────────────── WEAK POINT ───────────────────────
   The core glows after a counter lands: one question, answered right,
   pops the gear. Wrong answers teach and retry. */

function WeakPointPanel({ question, pkey, judge, done, reduce, accent }: { question: { question: string; answers: string[]; correctIndex: number; explanation: string }; pkey: string; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [answered, setAnswered] = useState(false);
  const finishedRef = useRef(false);

  // PILOT FEEDBACK (global): authored questions put the right answer
  // first — shuffle display positions so the correct card is never
  // predictably top-left. Deterministic (resume-safe).
  const order = useMemo(
    () => seededOrder(question.answers.length, 7331 + question.question.length * 13),
    [question],
  );
  const correctDisplayIdx = order.indexOf(question.correctIndex);

  const tap = (displayIdx: number, e: React.MouseEvent) => {
    if (answered || finishedRef.current) return;
    if (order[displayIdx] === question.correctIndex) {
      judge(pkey, true, displayIdx, correctDisplayIdx, undefined, { x: e.clientX, y: e.clientY });
      setAnswered(true);
      finishedRef.current = true;
      window.setTimeout(done, 900);
    } else {
      judge(pkey, false, displayIdx, correctDisplayIdx, { title: "The core holds…", explanation: question.explanation }, { x: e.clientX, y: e.clientY });
    }
  };

  return (
    <motion.div
      key="weak-point"
      initial={reduce ? false : { opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      style={{ margin: "auto", width: "100%", maxWidth: 560, zIndex: 15 }}
    >
      <div style={{ textAlign: "center", marginBottom: 10 }}>
        <motion.div
          animate={reduce ? undefined : { scale: [1, 1.12, 1] }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
          style={{ display: "inline-block", fontFamily: MONO, fontSize: 13, fontWeight: 900, letterSpacing: "0.24em", color: "#ffd158", textShadow: "0 1px 8px rgba(13,24,58,0.95)" }}
        >
          ⚡ CORE EXPOSED — STRIKE! ⚡
        </motion.div>
      </div>
      <div style={{ padding: "18px 20px", borderRadius: 18, background: "rgba(255,255,255,0.96)", border: `3px solid ${accent}`, boxShadow: `0 18px 44px -16px rgba(10,14,34,0.65)` }}>
        <div style={{ fontSize: 17.5, fontWeight: 900, color: "#1d2b4f", textAlign: "center", lineHeight: 1.35, marginBottom: 14 }}>
          {question.question}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {order.map((origIdx, i) => (
            <motion.button
              key={origIdx}
              onClick={(e) => tap(i, e)}
              disabled={answered}
              whileTap={reduce ? undefined : { scale: 0.95 }}
              style={{
                padding: "13px 12px", borderRadius: 14, cursor: answered ? "default" : "pointer",
                touchAction: "manipulation", fontFamily: "inherit", fontSize: 13.5, fontWeight: 800, lineHeight: 1.3,
                background: answered && origIdx === question.correctIndex ? "linear-gradient(180deg, #5eeaa5, #178a56)" : "#f4f7ff",
                border: answered && origIdx === question.correctIndex ? "2.5px solid #a4f5cd" : "2.5px solid #c7d4f0",
                color: answered && origIdx === question.correctIndex ? "#06281a" : "#1d2b4f",
              }}
            >
              {question.answers[origIdx]}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─────────────────────── FINISHER ───────────────────────
   Press-and-HOLD the badge power to full charge, then the release
   lands the week's signature move. Release pauses, never resets. */

function FinisherStage({ data, paused, judge, done, reduce, accent, stamp }: { data: ShowdownDef["finisher"]; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean; accent: string; stamp: boolean }) {
  const [heldMs, setHeldMs] = useState(0);
  const [holding, setHolding] = useState(false);
  const [full, setFull] = useState(false);
  const holdingRef = useRef(false);
  const pausedRef = useRef(paused);
  const firedRef = useRef(false);
  const needMs = data.chargeSecs * 1000;

  useEffect(() => {
    holdingRef.current = holding;
    pausedRef.current = paused;
  }, [holding, paused]);

  useEffect(() => {
    const tick = 100;
    const id = window.setInterval(() => {
      if (!holdingRef.current || pausedRef.current || firedRef.current) return;
      setHeldMs((ms) => {
        const next = Math.min(ms + tick, needMs);
        if (next >= needMs) setFull(true);
        return next;
      });
    }, tick);
    return () => window.clearInterval(id);
  }, [needMs]);

  const release = () => {
    setHolding(false);
    if (full && !firedRef.current) {
      firedRef.current = true;
      judge("showdown-finisher", true, 0, 0);
      done();
    }
  };

  const pct = Math.min(100, Math.round((heldMs / needMs) * 100));
  const milestone = pct >= 100 ? data.milestones[2] : pct >= 66 ? data.milestones[2] : pct >= 33 ? data.milestones[1] : data.milestones[0];

  return (
    <motion.div
      key="finisher-stage"
      initial={reduce ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ margin: "auto", textAlign: "center", zIndex: 15, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}
    >
      {stamp ? (
        <motion.div
          initial={reduce ? false : { scale: 2.2, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: -3 }}
          transition={{ type: "spring", stiffness: 200, damping: 14 }}
          style={{ padding: "16px 34px", borderRadius: 16, background: "#fffbe8", border: "4px solid #d98a06", fontFamily: MONO, fontSize: 30, fontWeight: 900, color: "#b45309", boxShadow: "0 18px 44px -16px rgba(10,14,34,0.65)" }}
        >
          {data.payoffTitle}
        </motion.div>
      ) : (
        <>
          <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, letterSpacing: "0.2em", color: "#ffd158", textShadow: "0 1px 8px rgba(13,24,58,0.95)" }}>
            {full ? "FULL POWER — LET GO!" : "CHARGE YOUR BADGE POWER"}
          </div>

          {/* Charge ring */}
          <div style={{ position: "relative", width: 150, height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="150" height="150" viewBox="0 0 150 150" style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
              <circle cx="75" cy="75" r="64" fill="rgba(255,255,255,0.9)" stroke="rgba(13,24,58,0.2)" strokeWidth="11" />
              <circle
                cx="75" cy="75" r="64" fill="none" stroke={full ? "#ffd158" : accent} strokeWidth="11" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 64}
                strokeDashoffset={(1 - pct / 100) * 2 * Math.PI * 64}
                style={{ transition: "stroke-dashoffset 120ms linear" }}
              />
            </svg>
            <motion.div
              animate={full && !reduce ? { scale: [1, 1.18, 1] } : undefined}
              transition={{ duration: 0.6, repeat: Infinity }}
              style={{ zIndex: 1, textAlign: "center" }}
            >
              <PixIcon emoji={data.chargeIcon} size={52} />
              <div style={{ fontFamily: MONO, fontSize: 15, fontWeight: 900, color: "#1d2b4f" }}>{pct}%</div>
            </motion.div>
          </div>

          <div style={{ minHeight: 22, fontSize: 15, fontWeight: 800, color: "#f6f9ff", textShadow: "0 1px 8px rgba(13,24,58,0.9)" }}>{milestone}</div>

          <motion.button
            onPointerDown={() => { setHolding(true); playSound("click"); }}
            onPointerUp={release}
            onPointerLeave={release}
            animate={!holding && !reduce ? { scale: [1, 1.07, 1] } : { scale: 1 }}
            transition={{ duration: 0.8, repeat: Infinity }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            style={{
              padding: "26px 56px", borderRadius: 999, cursor: "pointer", touchAction: "none",
              fontFamily: "inherit", fontSize: 22, fontWeight: 900, letterSpacing: "0.05em",
              background: full
                ? "linear-gradient(180deg, #ffe37d, #d98a06)"
                : holding
                  ? "linear-gradient(180deg, #5eeaa5, #178a56)"
                  : "linear-gradient(180deg, #ffd158, #f59e0b)",
              border: full ? "5px solid #fff2c4" : holding ? "5px solid #a4f5cd" : "5px solid #fff",
              boxShadow: full ? "0 0 44px rgba(255,209,88,0.85)" : holding ? "0 0 34px rgba(94,234,165,0.7)" : "0 16px 38px -10px rgba(245,158,11,0.8)",
              color: full ? "#4a3208" : holding ? "#06281a" : "#4a3208",
              userSelect: "none", WebkitUserSelect: "none",
            }}
          >
            {data.chargeIcon} {full ? "RELEASE!" : holding ? "CHARGING…" : data.chargeLabel}
          </motion.button>
        </>
      )}
    </motion.div>
  );
}
