"use client";

/**
 * VaultBoss — Week 1's bespoke COMBAT boss: "The Cracking Machine".
 *
 * KID-FIRST DESIGN (ages 6-9). The whole fight uses exactly two verbs:
 * TAP a big stationary thing, and press-and-HOLD one button. Nothing is
 * timed, nothing moves that must be caught, and there are no trap
 * options — the child wins by doing the right thing BIG, and the
 * villain theatre provides the variety. One password is built across
 * the whole fight, and the star pedagogy piece — the TIME-TO-CRACK
 * meter — leaps from seconds to centuries as each rule lands:
 *
 *   1. WALL      - tap the giant word blocks; each SLAMS onto the vault
 *                  door. All good words, guaranteed win. (LENGTH)
 *   2. SCRAMBLER - tap each mixer once; the password transforms and his
 *                  decoder screen cracks until it explodes. (MIX)
 *   3. COVER     - press-and-hold to shield the keypad when his spy
 *                  periscope peeks. The real-world gesture. (SECRET)
 *   4. FEED      - tap the junk passwords to feed his Guess-o-Tron until
 *                  it overloads; YOUR golden one isn't on his list.
 *                  (OBVIOUS)
 *   5. FINAL     - press-and-HOLD the golden forge button, charge the
 *                  counter to 400 YEARS, refuse his sweet talk, and
 *                  watch the machine detonate. (everything)
 *
 * Explanation without reading: each phase opens with ONE spoken coach
 * line (Will) in a banner while the target pulses, and the phase waits
 * for the child indefinitely. Audio contract: SFX via SoundManager /
 * signature cues, coach + villain voice capped & mute-gated
 * (bossArena), faint industrial bed (bgmBoss) under everything.
 *
 * Reporting speaks BossBattle's exact dialects with the SAME phase ids
 * the shipped Week 1 quiz boss used, so family dashboards stay
 * continuous. No lose state.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound, playBGM, stopBGM } from "@/app/lib/sounds";
import { useGameAudio } from "@/app/lib/gameEngine/useGameAudio";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import WrongAnswerPanel from "@/app/components/lesson/WrongAnswerPanel";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";
import type { WeekContent } from "@/app/lesson/weekContent";
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
  whenVillainQuiet,
  CaptionChip,
  ParticleLayer,
  type ParticleAPI,
} from "@/app/components/game/bossArena";

export type VaultData = NonNullable<WeekContent["bossVault"]>;

export interface VaultBossProps {
  vault: VaultData;
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

const MACHINE = {
  intact: "/game/bosses/crackomatic-intact.png",
  damaged: "/game/bosses/crackomatic-damaged.png",
  defeated: "/game/bosses/crackomatic-defeated.png",
} as const;

/** W1 rewrap: the heroes dress for the job — locksmith gear (every
 *  boss week wears a different outfit; this was the last base-wardrobe
 *  fight). */
const HEROES = makeHeroes({
  adam: {
    idle: "/game/characters/w01/adam-locksmith-idle.png",
    attack: "/game/characters/w01/adam-locksmith-attack.png",
    celebrate: "/game/characters/w01/adam-locksmith-celebrate.png",
  },
  layla: {
    idle: "/game/characters/w01/layla-locksmith-idle.png",
    attack: "/game/characters/w01/layla-locksmith-attack.png",
    celebrate: "/game/characters/w01/layla-locksmith-celebrate.png",
  },
});

const PHASE_ORDER = ["wall", "scrambler", "cover", "feed", "final"] as const;
type PhaseKey = (typeof PHASE_ORDER)[number];

const PHASE_TONE: Record<PhaseKey, { accent: string; glow: string }> = {
  wall: { accent: "#2fae4e", glow: "rgba(47,174,78,0.45)" },
  scrambler: { accent: "#0ea5c6", glow: "rgba(14,165,198,0.45)" },
  cover: { accent: "#d98a06", glow: "rgba(217,138,6,0.45)" },
  feed: { accent: "#8b5cf6", glow: "rgba(139,92,246,0.45)" },
  final: { accent: "#e0447d", glow: "rgba(224,68,125,0.45)" },
};

const FOILED_LINES: Record<PhaseKey, string> = {
  wall: "My ram! You built it TOO LONG!",
  scrambler: "Capitals AND symbols?! My decoder is crying!",
  cover: "I saw NOTHING! Not one letter!",
  feed: "My Guess-o-Tron is FULL! It only knows the obvious ones!",
  final: "FOUR HUNDRED YEARS?! I don't HAVE that long!",
};

export default function VaultBoss({
  vault,
  bossName = "HACKER RACCOON",
  onEnd,
  onQuestionAnswered,
}: VaultBossProps) {
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;
  const audio = useGameAudio();

  const [stage, setStage] = useState<Stage>("entrance");
  const [entranceBeat, setEntranceBeat] = useState(0);
  const [hero, setHero] = useState<HeroKey | null>(null);
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [power, setPower] = useState(100);
  const [stamped, setStamped] = useState<PhaseKey[]>([]);
  const [raccoonMood, setRaccoonMood] = useState<RaccoonMood>("taunt");
  const [heroMood, setHeroMood] = useState<"idle" | "attack" | "celebrate">("idle");
  const [raccoonLine, setRaccoonLine] = useState<string | null>(null);
  const [teach, setTeach] = useState<null | { title: string; explanation: string }>(null);
  const [score, setScore] = useState(0);
  const [shakeNonce, setShakeNonce] = useState(0);
  const [popups, setPopups] = useState<{ id: number; text: string; colour: string; x: number; y: number }[]>([]);
  const [clearBonus, setClearBonus] = useState<{ label: string; crackTime: string } | null>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ParticleAPI | null>(null);
  const popupSeq = useRef(0);
  const startTs = useRef(0);
  const position = useRef(0);
  const statsRef = useRef<Map<string, BossPhaseResult>>(new Map());

  const phaseKey = PHASE_ORDER[Math.min(phaseIdx, PHASE_ORDER.length - 1)];
  const tone = PHASE_TONE[phaseKey];
  const phaseMeta = useMemo(
    () => ({ wall: vault.wall, scrambler: vault.scrambler, cover: vault.cover, feed: vault.feed, final: vault.final }) as const,
    [vault],
  );
  const currentPhase = phaseMeta[phaseKey];
  const machineImg = stage === "victory" ? MACHINE.defeated : stamped.length >= 2 ? MACHINE.damaged : MACHINE.intact;
  const crackNow = stamped.length === 0 ? "2 SECONDS" : phaseMeta[stamped[stamped.length - 1]].crackTime;

  useEffect(() => {
    const m = new Map<string, BossPhaseResult>();
    for (const k of PHASE_ORDER) {
      const p = phaseMeta[k];
      m.set(p.id, { phaseId: p.id, label: p.label, correctCount: 0, wrongCount: 0, totalQuestions: 0 });
    }
    statsRef.current = m;
  }, [phaseMeta]);

  /* Battle bed: on for the whole fight, killed with the component. */
  useEffect(() => {
    playBGM("bgmBoss");
    return () => {
      stopBGM(400);
      stopCoach();
    };
  }, []);

  /* Entrance: the machine rolls in. */
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
    playSound("phaseChange");
    setStage("announce");
  };

  useEffect(() => {
    if (stage === "announce" && startTs.current === 0) startTs.current = performance.now();
  }, [stage]);

  useEffect(() => {
    if (stage !== "announce") return;
    playVillain(`taunt-${Math.min(phaseIdx + 1, 6)}`);
    const id = window.setTimeout(() => setStage("play"), reduce ? 1200 : 2300);
    return () => window.clearTimeout(id);
  }, [stage, phaseIdx, reduce]);

  /* PILOT FEEDBACK (global, W1 rewrap): NO narrator voice during the
     fight — the coach banner is text-only. The one narrator moment is
     the excited victory line (vault-victory, Sarah). */

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
        setScore((s) => s + 100);
        playSound("correct");
        particlesRef.current?.burst(px, py, PHASE_TONE[PHASE_ORDER[phaseIdx]].accent, reduce ? 0 : 16);
        addPopup("+100", "#2fae4e", px, py);
        setHeroMood("attack");
        window.setTimeout(() => setHeroMood("idle"), 450);
        flashMood("hurt", null, 750);
      } else {
        playSound("wrong");
        shake();
        addPopup("TRY AGAIN!", "#e0447d", px, py);
        flashMood("attack", "The machine likes that!", 1500);
        if (teachOnWrong) setTeach(teachOnWrong);
      }
    },
    [phaseIdx, phaseMeta, onQuestionAnswered, reduce, addPopup, flashMood, shake],
  );

  const phaseDone = useCallback(() => {
    const key = PHASE_ORDER[phaseIdx];
    playSound("bossHurt");
    playSound("screenShake");
    playVillain(`foiled-${key}`);
    shake();
    setStamped((s) => (s.includes(key) ? s : [...s, key]));
    setPower((v) => Math.max(0, v - 20));
    setScore((s) => s + 250);
    setRaccoonMood("hurt");
    setRaccoonLine(FOILED_LINES[key]);
    setClearBonus({ label: phaseMeta[key].label, crackTime: phaseMeta[key].crackTime });
    setStage("phaseClear");
    window.setTimeout(() => {
      setClearBonus(null);
      setRaccoonLine(null);
      if (phaseIdx + 1 >= PHASE_ORDER.length) {
        playSound("bossDefeated");
        playVillain("defeat");
        setRaccoonMood("defeated");
        setStage("victory");
        setHeroMood("celebrate");
      } else {
        playSound("phaseChange");
        setRaccoonMood("taunt");
        setPhaseIdx((i) => i + 1);
        setStage("announce");
      }
    }, reduce ? 1400 : 2600);
  }, [phaseIdx, phaseMeta, reduce, shake]);

  /* Victory theatrics: detonation, bed out — then the strict no-overlap
     sequence: the Raccoon's defeat line finishes, the "Cyber Heroes"
     victory sting (~2s) plays, THEN Sarah celebrates. Nothing crosses. */
  useEffect(() => {
    if (stage !== "victory") return;
    audio.signature("vault-detonate");
    stopBGM(900);
    const timers: number[] = [];
    const cancel = whenVillainQuiet(() => {
      playSound("victory");
      timers.push(window.setTimeout(() => playCoach("vault-victory"), 2200));
    });
    return () => {
      cancel();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [stage, audio]);

  const finish = () => {
    const phaseResults = PHASE_ORDER.map((k) => statsRef.current.get(phaseMeta[k].id)!).filter(Boolean);
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

  const inBattle = stage === "announce" || stage === "play" || stage === "phaseClear";

  return (
    <motion.div
      key={shakeNonce > 0 ? `shake-${shakeNonce}` : "still"}
      animate={reduce || shakeNonce === 0 ? undefined : { x: [0, -7, 6, -4, 2, 0], y: [0, 3, -2, 1, 0, 0] }}
      transition={{ duration: 0.35 }}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#dff0f7", color: "#1d2b4f", fontFamily: ROUNDED }}
    >
      {/* Bright stage backdrop — one soft dim layer, no rain / scanlines. */}
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "url(/game/backgrounds/vault-stage-bright.png)", backgroundSize: "cover", backgroundPosition: "center" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(13,24,58,0.42) 0%, rgba(13,24,58,0.08) 26%, rgba(13,24,58,0.05) 62%, rgba(13,24,58,0.3) 100%)" }} />

      {/* Characters + the machine */}
      {hero && (
        <>
          <motion.img
            src={HEROES[hero].sprites[heroMood]}
            alt=""
            aria-hidden
            animate={reduce ? undefined : heroMood === "attack" ? { x: 24, scale: 1.06 } : { x: 0, scale: 1, y: [0, -5, 0] }}
            transition={heroMood === "attack" ? { duration: 0.2 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            style={{ position: "absolute", left: "3%", bottom: "13%", height: "24%", zIndex: 2, filter: "drop-shadow(0 14px 18px rgba(20,30,60,0.45))" }}
          />
          <div aria-hidden style={{ position: "absolute", left: "3%", bottom: "11%", width: "12%", height: 20, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(20,30,60,0.25), transparent 70%)" }} />
        </>
      )}

      <motion.img
        key={machineImg}
        src={machineImg}
        alt="The CRACK-O-MATIC cracking machine"
        initial={reduce ? false : { scale: 0.94, opacity: 0.7 }}
        animate={reduce ? { scale: 1, opacity: 1 } : stage === "victory" ? { scale: 0.96, opacity: 0.95, rotate: 2 } : { scale: 1, opacity: 1, y: [0, -4, 0] }}
        transition={stage === "victory" ? { duration: 0.4 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", right: "3%", bottom: "10%", height: stage === "entrance" ? "44%" : "34%", zIndex: 2, filter: "drop-shadow(0 18px 22px rgba(20,30,60,0.5))", transition: "height 600ms ease" }}
      />
      {/* Overload glow during the final phase. */}
      {phaseKey === "final" && stage !== "victory" && !reduce && (
        <motion.div
          aria-hidden
          animate={{ opacity: [0.1, 0.35, 0.1] }}
          transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", right: "0%", bottom: "6%", width: "32%", height: "44%", zIndex: 1, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(224,68,125,0.5), transparent 65%)", pointerEvents: "none" }}
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
        // PILOT FEEDBACK (global): the Raccoon stands EXACTLY as tall as
        // the hero, parked beside his machine at the screen edge for the
        // whole fight — visible through hero select, never behind the
        // select cards / gameplay boards / victory text, never sliding
        // between beats. Only the entrance roar shows him big.
        style={{ position: "absolute", right: stage === "entrance" ? "22%" : "7%", bottom: "12%", height: stage === "entrance" ? "26%" : "24%", zIndex: 3, filter: "drop-shadow(0 12px 16px rgba(20,30,60,0.5))", transition: "height 600ms ease, right 600ms ease" }}
      />

      <AnimatePresence>
        {raccoonLine && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", right: "6%", top: "17%", zIndex: 25, maxWidth: 250,
              padding: "10px 14px", borderRadius: 14, borderBottomRightRadius: 3,
              background: "#fff", border: "2.5px solid #8b5cf6", color: "#4c1d95",
              fontSize: 14.5, fontWeight: 800, fontStyle: "italic", lineHeight: 1.35,
              boxShadow: "0 12px 30px -10px rgba(20,30,60,0.45)",
            }}
          >
            “{raccoonLine}”
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD: power bar + score. Deliberately minimal for young players. */}
      {stage !== "entrance" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#eafff0", textShadow: "0 1px 6px rgba(13,24,58,0.8)", whiteSpace: "nowrap" }}>
              ⚙ MACHINE POWER
            </span>
            <div style={{ flex: 1, display: "flex", gap: 4 }} role="progressbar" aria-valuenow={power} aria-valuemin={0} aria-valuemax={100}>
              {PHASE_ORDER.map((k, i) => {
                const alive = power > i * 20;
                return (
                  <motion.div
                    key={k}
                    animate={alive ? { opacity: 1, scaleY: 1 } : { opacity: 0.3, scaleY: 0.55 }}
                    style={{
                      flex: 1, height: 16, borderRadius: 5,
                      background: alive ? "linear-gradient(180deg, #8dff5a, #2fae4e)" : "rgba(13,24,58,0.35)",
                      border: "1px solid rgba(255,255,255,0.55)",
                      boxShadow: alive ? "0 0 10px rgba(120,255,90,0.5)" : "none",
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
            {hero && <span>★ {HEROES[hero].name}</span>}
            {hero && <span style={{ opacity: 0.6 }}>·</span>}
            PHASE {Math.min(phaseIdx + 1, 5)}/5 · {currentPhase.label.toUpperCase()}
          </div>
        </div>
      )}

      {/* Vault rail: TIME TO CRACK */}
      {inBattle && (
        <div className="vb-vault-rail" style={{ position: "absolute", top: 76, right: 12, zIndex: 20, width: 196, borderRadius: 14, padding: "8px 12px 10px", background: "rgba(255,255,255,0.92)", border: `2px solid ${tone.accent}`, boxShadow: "0 10px 26px -12px rgba(20,30,60,0.4)", fontFamily: MONO }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "#0ea5c6", marginBottom: 4, textAlign: "center" }}>⛨ TIME TO CRACK</div>
          <motion.div
            key={crackNow}
            initial={reduce ? false : { scale: 1.35 }}
            animate={{ scale: 1 }}
            style={{ textAlign: "center", fontSize: 15, fontWeight: 900, color: stamped.length === 0 ? "#e0447d" : "#15803d", marginBottom: 7 }}
          >
            {crackNow}
          </motion.div>
          {PHASE_ORDER.map((k) => {
            const p = phaseMeta[k];
            const done = stamped.includes(k);
            const isCurrent = k === phaseKey && !done;
            return (
              <div key={k} style={{ marginBottom: 3, opacity: done ? 1 : isCurrent ? 0.95 : 0.45 }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: "0.1em", color: done ? "#15803d" : isCurrent ? "#d98a06" : "#64748b" }}>{p.label.toUpperCase()}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: done ? "#1d2b4f" : "#94a3b8" }}>
                  {done ? `✓ ${p.crackTime}` : isCurrent ? "…defending…" : "· · ·"}
                </div>
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
                  style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, letterSpacing: "0.3em", color: "#b91c2e", textShadow: "0 1px 0 #fff", marginBottom: 10 }}
                >
                  ⚠ CRACKING MACHINE DETECTED ⚠
                </motion.div>
              )}
              {entranceBeat >= 2 && (
                <motion.h1
                  initial={reduce ? false : { scale: 3, opacity: 0, rotate: -4 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 190, damping: 14 }}
                  style={{ margin: 0, fontSize: 50, fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #15803d 0%, #0ea5c6 50%, #7c5cff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 3px 0 rgba(255,255,255,0.7))" }}
                >
                  THE CRACKING MACHINE
                </motion.h1>
              )}
            </motion.div>
          )}

          {stage === "select" && (
            <motion.div key="select" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ margin: "auto", textAlign: "center", maxWidth: 560, width: "100%", zIndex: 15 }}>
              <h2 style={{ margin: "0 0 2px", fontSize: 30, fontWeight: 900, color: "#1d2b4f", textShadow: "0 2px 0 rgba(255,255,255,0.7)" }}>
                CHOOSE YOUR HERO
              </h2>
              {/* Dark chip behind the quote — white-on-pastel was unreadable
                  on this bright stage (screen-audit W1 s24). */}
              <p style={{ display: "inline-block", margin: "0 0 16px", padding: "7px 16px", borderRadius: 999, fontSize: 13.5, fontWeight: 700, fontStyle: "italic", color: "#f6f9ff", background: "rgba(20,16,44,0.78)", boxShadow: "0 6px 16px -8px rgba(20,16,44,0.6)" }}>
                <PixIcon emoji="🦝" size={17} style={{ verticalAlign: "-3px", marginRight: 5 }} />“My machine cracks ANY password. Guard yours if you dare!”
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
                        background: "rgba(255,255,255,0.94)",
                        border: `3px solid ${h.theme.accent}`,
                        boxShadow: "0 14px 30px -14px rgba(20,30,60,0.5)",
                        color: "#1d2b4f",
                      }}
                      aria-label={`Play as ${h.name}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={h.sprites.idle} alt="" style={{ height: 132, objectFit: "contain", filter: "drop-shadow(0 10px 14px rgba(20,30,60,0.35))" }} />
                      <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: "0.08em", color: h.theme.accent }}>{h.name}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#64748b" }}>{h.tagline}</span>
                      <span style={{ marginTop: 2, padding: "7px 26px", borderRadius: 999, background: h.theme.accent, color: "#fff", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em" }}>
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
              style={{ margin: "auto", textAlign: "center", maxWidth: 520, zIndex: 15 }}
            >
              <div style={{ marginBottom: 8 }}>
                <CaptionChip style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.28em" }}>
                  — PHASE {phaseIdx + 1} OF 5 —
                </CaptionChip>
              </div>
              <div style={{ display: "inline-block", padding: "10px 26px", borderRadius: 18, background: "rgba(255,255,255,0.94)", border: `3px solid ${tone.accent}`, boxShadow: "0 14px 34px -14px rgba(20,30,60,0.5)", fontSize: 36, fontWeight: 900, marginBottom: 10, color: "#1d2b4f" }}>
                {currentPhase.label}
              </div>
              <div style={{ display: "inline-block", padding: "6px 15px", borderRadius: 999, fontSize: 15.5, fontWeight: 700, color: "#f6f9ff", fontStyle: "italic", background: "rgba(20,16,44,0.78)", boxShadow: "0 6px 16px -8px rgba(20,16,44,0.6)" }}>
                <PixIcon emoji="🦝" size={18} style={{ verticalAlign: "-3px", marginRight: 5 }} />“{currentPhase.intro}”
              </div>
            </motion.div>
          )}

          {stage === "play" && (
            <motion.div key={`play-${phaseIdx}`} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column", zIndex: 15, minHeight: 0 }}>
              <CoachBanner text={currentPhase.coach} accent={tone.accent} reduce={reduce} />
              {phaseKey === "wall" && <WallPhase data={vault.wall} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} signature={audio.signature} />}
              {phaseKey === "scrambler" && <ScramblerPhase data={vault.scrambler} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} signature={audio.signature} />}
              {phaseKey === "cover" && <CoverPhase data={vault.cover} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} />}
              {phaseKey === "feed" && <FeedPhase data={vault.feed} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} signature={audio.signature} />}
              {phaseKey === "final" && <FinalPhase data={vault.final} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} signature={audio.signature} />}
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
              <div style={{ display: "inline-block", padding: "18px 34px", borderRadius: 22, background: "rgba(255,255,255,0.95)", border: "3px solid #2fae4e", boxShadow: "0 18px 44px -16px rgba(20,30,60,0.5)" }}>
                <div style={{ fontSize: 40, fontWeight: 900, color: "#15803d", marginBottom: 4 }}>
                  PHASE CLEAR!
                </div>
                <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: "#0ea5c6", marginBottom: 4 }}>
                  TIME TO CRACK: {clearBonus.crackTime}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: "#1d2b4f" }}>+250 pts</div>
              </div>
            </motion.div>
          )}

          {stage === "victory" && (
            <motion.div key="victory" initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ margin: "auto", textAlign: "center", maxWidth: 470, zIndex: 15 }}>
              <motion.div
                initial={reduce ? false : { y: -70, opacity: 0, rotate: -8 }}
                animate={{ y: 0, opacity: 1, rotate: -2 }}
                transition={{ delay: reduce ? 0 : 0.5, type: "spring", stiffness: 110, damping: 13 }}
                style={{ margin: "0 auto 14px", width: 250, padding: "13px 15px", borderRadius: 4, background: "#f7f4ea", color: "#3b3a33", fontFamily: MONO, boxShadow: "0 18px 40px -12px rgba(20,30,60,0.55)" }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", borderBottom: "1.5px dashed #b9b4a2", paddingBottom: 5, marginBottom: 7 }}>CRACK-O-MATIC REPORT</div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, padding: "2px 0" }}>
                  <span>TIME NEEDED:</span><span style={{ color: "#b91c1c", fontWeight: 900 }}>{vault.final.crackTime}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, padding: "2px 0" }}>
                  <span>PASSWORDS CRACKED:</span><span style={{ color: "#b91c1c", fontWeight: 900 }}>ZERO</span>
                </div>
                <div style={{ marginTop: 7, fontSize: 11, fontWeight: 900, color: "#b91c1c", letterSpacing: "0.06em" }}>STATUS: KABOOM</div>
              </motion.div>
              {/* Navy on the bright stage (white-on-pastel washed out). */}
              <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 900, color: "#1d2b4f", textShadow: "0 2px 0 rgba(255,255,255,0.7)" }}>
                The vault held. The machine didn&apos;t.
              </h2>
              <div style={{ display: "inline-block", padding: "6px 18px", borderRadius: 999, background: "rgba(255,255,255,0.95)", border: "2.5px solid #d98a06", fontFamily: MONO, fontSize: 13, fontWeight: 900, color: "#b45309", marginBottom: 14, boxShadow: "0 8px 20px -10px rgba(20,30,60,0.5)" }}>
                FINAL SCORE {score}
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
        @media (max-width: 860px) { .vb-vault-rail { display: none !important; } }
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

type SignatureFn = (id: string) => void;

/* ───────────────────────── COACH BANNER ─────────────────────────
   One spoken line (played by the parent when the phase starts) shown
   with a pulsing pointing hand. No reading required — the banner just
   mirrors what Will says. */

function CoachBanner({ text, accent, reduce }: { text: string; accent: string; reduce: boolean }) {
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        margin: "0 auto 10px", display: "flex", alignItems: "center", gap: 10,
        padding: "9px 18px", borderRadius: 999, width: "max-content", maxWidth: "94%",
        background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`,
        boxShadow: "0 12px 28px -14px rgba(20,30,60,0.5)",
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

/* ────────────────────────── PHASE 1 · WALL ──────────────────────────
   Tap the giant word blocks; each SLAMS onto the vault door. All good
   words — a guaranteed confidence win. */

function WallPhase({ data, judge, done, reduce, accent, signature }: { data: VaultData["wall"]; judge: JudgeFn; done: () => void; reduce: boolean; accent: string; signature: SignatureFn }) {
  const [placed, setPlaced] = useState<string[]>([]);
  const finishedRef = useRef(false);

  const password = placed.join("-");

  const tap = (word: string, i: number, e: React.MouseEvent) => {
    if (placed.includes(word) || finishedRef.current) return;
    signature("vault-word-slam");
    judge(`vault-wall-${i}`, true, 0, 0, undefined, { x: e.clientX, y: e.clientY });
    const next = [...placed, word];
    setPlaced(next);
    if (next.length >= data.blocks.length) {
      finishedRef.current = true;
      window.setTimeout(done, 1000);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, minHeight: 0, justifyContent: "center" }}>
      {/* The vault door password */}
      <div style={{ margin: "0 auto", width: "100%", maxWidth: 560, textAlign: "center" }}>
        <div style={{ marginBottom: 5 }}>
          <CaptionChip style={{ letterSpacing: "0.1em" }}>
            YOUR PASSWORD ({password.length} letters long)
          </CaptionChip>
        </div>
        <motion.div
          key={password}
          initial={reduce || !password ? false : { scale: 1.06 }}
          animate={{ scale: 1 }}
          style={{
            minHeight: 56, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "10px 16px", borderRadius: 14,
            background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`,
            boxShadow: "0 12px 30px -14px rgba(20,30,60,0.5)",
            fontFamily: MONO, fontSize: password.length > 15 ? 21 : 26, fontWeight: 900, color: "#15803d",
            wordBreak: "break-all",
          }}
        >
          {password || "…"}
        </motion.div>
      </div>

      {/* The word blocks — huge, pulsing until tapped. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
        {data.blocks.map((word, i) => {
          const used = placed.includes(word);
          return (
            <motion.button
              key={word}
              onClick={(e) => tap(word, i, e)}
              disabled={used}
              animate={used || reduce ? { scale: 1 } : { scale: [1, 1.06, 1] }}
              transition={used || reduce ? undefined : { duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              style={{
                padding: "22px 34px", borderRadius: 18, cursor: used ? "default" : "pointer",
                touchAction: "manipulation", fontFamily: MONO, fontSize: 24, fontWeight: 900,
                background: used ? "rgba(255,255,255,0.5)" : "linear-gradient(180deg, #a8814f, #7d5c33)",
                border: used ? "3px solid #94a3b8" : "3px solid #ffe1a1",
                color: used ? "#94a3b8" : "#fff2d9",
                boxShadow: used ? "none" : "0 16px 34px -12px rgba(125,92,51,0.8)",
                opacity: used ? 0.55 : 1,
              }}
            >
              🧱 {word} {used && "✓"}
            </motion.button>
          );
        })}
      </div>
      <CaptionChip>
        {placed.length} / {data.blocks.length} WORDS — LONGER IS STRONGER
      </CaptionChip>
    </div>
  );
}

/* ──────────────────────── PHASE 2 · SCRAMBLER ────────────────────────
   Tap each mixer once; the password transforms and the decoder screen
   cracks tap by tap until it explodes. No timer, no decoys. */

function ScramblerPhase({ data, judge, done, reduce, accent, signature }: { data: VaultData["scrambler"]; judge: JudgeFn; done: () => void; reduce: boolean; accent: string; signature: SignatureFn }) {
  const [applied, setApplied] = useState<string[]>([]);
  const finishedRef = useRef(false);

  const display = useMemo(() => {
    let s = data.baseWord;
    if (applied.includes("caps")) s = s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("-");
    if (applied.includes("number")) s = `${s}7`;
    if (applied.includes("symbol")) s = `${s}!`;
    return s;
  }, [applied, data.baseWord]);

  const cracks = applied.length;

  const tap = (mixer: VaultData["scrambler"]["mixers"][number], e: React.MouseEvent) => {
    if (applied.includes(mixer.kind) || finishedRef.current) return;
    signature("vault-mixer-pop");
    judge(`vault-scrambler-${mixer.id}`, true, 0, 0, undefined, { x: e.clientX, y: e.clientY });
    const next = [...applied, mixer.kind];
    setApplied(next);
    if (next.length >= data.mixers.length) {
      finishedRef.current = true;
      playSound("lock");
      window.setTimeout(done, 1000);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minHeight: 0, justifyContent: "center" }}>
      {/* The password + his decoder screen */}
      <div style={{ margin: "0 auto", width: "100%", maxWidth: 560, textAlign: "center" }}>
        <motion.div
          key={display}
          initial={reduce ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          style={{
            minHeight: 52, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "9px 16px", borderRadius: 14, marginBottom: 10,
            background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`,
            boxShadow: "0 12px 30px -14px rgba(20,30,60,0.5)",
            fontFamily: MONO, fontSize: display.length > 20 ? 19 : 23, fontWeight: 900, color: "#15803d",
            wordBreak: "break-all",
          }}
        >
          {display}
        </motion.div>
        {/* Decoder screen: cracks as mixers land. */}
        <motion.div
          key={cracks}
          animate={reduce || cracks === 0 ? undefined : { rotate: [0, -2, 2, 0] }}
          transition={{ duration: 0.35 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10,
            background: "#1d2b4f", border: "3px solid #64748b",
            fontFamily: MONO, fontSize: 12, fontWeight: 900,
            color: cracks >= data.mixers.length ? "#ff9bcb" : "#7df0ff",
            position: "relative", overflow: "hidden",
          }}
        >
          <PixIcon emoji="🤖" size={22} />
          {cracks >= data.mixers.length ? "DECODER: 💥 KABOOM" : cracks > 0 ? `DECODER: C-CAN'T READ IT… ${"✱".repeat(cracks)}` : "DECODER: reading your password…"}
        </motion.div>
      </div>

      {/* The mixer buttons — huge, pulsing until tapped. */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
        {data.mixers.map((mixer, i) => {
          const used = applied.includes(mixer.kind);
          return (
            <motion.button
              key={mixer.id}
              onClick={(e) => tap(mixer, e)}
              disabled={used}
              animate={used || reduce ? { scale: 1 } : { scale: [1, 1.07, 1] }}
              transition={used || reduce ? undefined : { duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6,
                padding: "18px 26px", borderRadius: 18, cursor: used ? "default" : "pointer",
                touchAction: "manipulation", fontFamily: "inherit", fontSize: 16, fontWeight: 900,
                background: used ? "rgba(255,255,255,0.5)" : "linear-gradient(180deg, #ffcf5e, #d97706)",
                border: used ? "3px solid #94a3b8" : "3px solid #ffe1a1",
                color: used ? "#94a3b8" : "#fff",
                boxShadow: used ? "none" : "0 16px 34px -12px rgba(217,119,6,0.8)",
                opacity: used ? 0.55 : 1,
              }}
            >
              <PixIcon emoji={mixer.icon} size={34} />
              {mixer.label} {used && "✓"}
            </motion.button>
          );
        })}
      </div>
      <CaptionChip>
        {applied.length} / {data.mixers.length} MIXERS IN
      </CaptionChip>
    </div>
  );
}

/* ────────────────────────── PHASE 3 · COVER ──────────────────────────
   Press-and-hold to shield the keypad when the periscope peeks. Slow
   telegraph, long windows, generous forgiveness. */

function CoverPhase({ data, paused, judge, done, reduce, accent }: { data: VaultData["cover"]; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [snoopIdx, setSnoopIdx] = useState(0);
  const [eyeState, setEyeState] = useState<"closed" | "opening" | "open">("closed");
  const [covering, setCovering] = useState(false);
  const [survived, setSurvived] = useState(0);
  const coveringRef = useRef(false);
  const uncoveredMs = useRef(0);
  const finishedRef = useRef(false);
  const pausedRef = useRef(paused);
  useEffect(() => {
    coveringRef.current = covering;
    pausedRef.current = paused;
  }, [covering, paused]);

  // Snoop cycle: closed gap → LONG telegraph → open window → judge.
  useEffect(() => {
    if (snoopIdx >= data.snoops || finishedRef.current) return;
    let cancelled = false;
    const gapMs = 2600;
    const telegraphMs = 1800;
    const openMs = (reduce ? data.openSecs * 1.4 : data.openSecs) * 1000;

    const t1 = window.setTimeout(() => {
      if (cancelled) return;
      playSound("pop");
      setEyeState("opening");
      const t2 = window.setTimeout(() => {
        if (cancelled) return;
        setEyeState("open");
        uncoveredMs.current = 0;
        const tick = 50;
        const sampler = window.setInterval(() => {
          if (pausedRef.current) return;
          if (!coveringRef.current) uncoveredMs.current += tick;
        }, tick);
        const t3 = window.setTimeout(() => {
          if (cancelled) return;
          window.clearInterval(sampler);
          setEyeState("closed");
          const ok = uncoveredMs.current <= openMs * 0.4; // generous
          if (ok) {
            judge(`vault-cover-${snoopIdx}`, true, 0, 0);
          } else {
            judge(`vault-cover-${snoopIdx}`, false, 1, 0, { title: "He peeked!", explanation: data.explanation });
          }
          const nextIdx = snoopIdx + 1;
          if (nextIdx >= data.snoops && !finishedRef.current) {
            finishedRef.current = true;
            window.setTimeout(done, 800);
          } else {
            setSurvived((s) => s + (ok ? 1 : 0));
            setSnoopIdx(nextIdx);
          }
        }, openMs);
        return () => window.clearTimeout(t3);
      }, telegraphMs);
      return () => window.clearTimeout(t2);
    }, gapMs);
    return () => {
      cancelled = true;
      window.clearTimeout(t1);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [snoopIdx, reduce]);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14, minHeight: 0, justifyContent: "center", alignItems: "center" }}>
      {/* The keypad + eye */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 30 }}>
        <div
          style={{
            width: 180, padding: "14px", borderRadius: 16, textAlign: "center",
            background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`,
            boxShadow: "0 12px 30px -14px rgba(20,30,60,0.5)",
            fontFamily: MONO,
          }}
        >
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: "#64748b", marginBottom: 6 }}>VAULT KEYPAD</div>
          <div style={{ fontSize: 24, fontWeight: 900, letterSpacing: 4, color: covering ? "#cbd5e1" : "#15803d", filter: covering ? "blur(6px)" : "none", transition: "filter 120ms ease" }}>
            ●●●●●●
          </div>
          {covering && <div style={{ marginTop: 4, fontSize: 11, fontWeight: 900, color: "#15803d" }}>🖐 COVERED!</div>}
        </div>

        <motion.div
          animate={
            eyeState === "open" && !reduce
              ? { y: [0, -4, 0], scale: 1.08 }
              : { scale: eyeState === "closed" ? 0.85 : 1 }
          }
          transition={eyeState === "open" ? { duration: 0.6, repeat: Infinity } : { duration: 0.25 }}
          style={{ textAlign: "center", opacity: eyeState === "closed" ? 0.4 : 1, transition: "opacity 250ms ease" }}
        >
          <PixIcon emoji={eyeState === "open" ? "👀" : "🦝"} size={58} />
          <CaptionChip style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", padding: "4px 10px", color: eyeState === "open" ? "#ff9bcb" : eyeState === "opening" ? "#ffd158" : "#cbd5e1" }}>
            {eyeState === "open" ? "PEEKING!" : eyeState === "opening" ? "EYE COMING UP…" : "…lurking…"}
          </CaptionChip>
        </motion.div>
      </div>

      {/* The one big control */}
      <motion.button
        onPointerDown={(e) => {
          // Pointer capture: a mid-hold wobble off the button edge (kid
          // finger, layout nudge) must never silently drop the shield —
          // covering ends only on physical release.
          e.currentTarget.setPointerCapture(e.pointerId);
          setCovering(true);
          playSound("click");
        }}
        onPointerUp={() => setCovering(false)}
        onPointerCancel={() => setCovering(false)}
        animate={!covering && eyeState !== "closed" && !reduce ? { scale: [1, 1.07, 1] } : { scale: 1 }}
        transition={{ duration: 0.7, repeat: Infinity }}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        style={{
          padding: "24px 54px", borderRadius: 999, cursor: "pointer", touchAction: "none",
          fontFamily: "inherit", fontSize: 23, fontWeight: 900, letterSpacing: "0.06em",
          background: covering ? "linear-gradient(180deg, #5eeaa5, #178a56)" : "linear-gradient(180deg, #ffd158, #f59e0b)",
          border: covering ? "5px solid #a4f5cd" : "5px solid #fff",
          boxShadow: covering ? "0 0 34px rgba(94,234,165,0.7)" : "0 16px 38px -10px rgba(245,158,11,0.8)",
          color: covering ? "#06281a" : "#4a3208",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        🖐 {covering ? "COVERING…" : "HOLD TO COVER"}
      </motion.button>

      <CaptionChip>
        SPY EYE {Math.min(snoopIdx + 1, data.snoops)} / {data.snoops} · {survived} BLOCKED
      </CaptionChip>
    </div>
  );
}

/* ────────────────────────── PHASE 4 · FEED ──────────────────────────
   Tap the junk passwords to feed his Guess-o-Tron until it overloads.
   YOUR golden password just sits there — not on his list. */

function FeedPhase({ data, judge, done, reduce, accent, signature }: { data: VaultData["feed"]; judge: JudgeFn; done: () => void; reduce: boolean; accent: string; signature: SignatureFn }) {
  const [fed, setFed] = useState<string[]>([]);
  const [chompNonce, setChompNonce] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [goldWiggle, setGoldWiggle] = useState(0);
  const finishedRef = useRef(false);
  const noteTimer = useRef<number | null>(null);

  const showNote = (text: string) => {
    setNote(text);
    if (noteTimer.current) window.clearTimeout(noteTimer.current);
    noteTimer.current = window.setTimeout(() => setNote(null), 2400);
  };

  const feed = (junk: VaultData["feed"]["junk"][number], e: React.MouseEvent) => {
    if (fed.includes(junk.id) || finishedRef.current) return;
    signature("vault-chomp");
    setChompNonce((c) => c + 1);
    judge(`vault-feed-${junk.id}`, true, 0, 0, undefined, { x: e.clientX, y: e.clientY });
    showNote(junk.note);
    const next = [...fed, junk.id];
    setFed(next);
    if (next.length >= data.junk.length) {
      finishedRef.current = true;
      window.setTimeout(() => signature("vault-overload"), 500);
      window.setTimeout(done, 1500);
    }
  };

  const full = fed.length >= data.junk.length;

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minHeight: 0, justifyContent: "center", alignItems: "center" }}>
      {/* The Guess-o-Tron */}
      <motion.div
        key={chompNonce}
        animate={reduce || chompNonce === 0 ? undefined : { rotate: [0, -10, 8, 0], scale: [1, 1.18, 1] }}
        transition={{ duration: 0.5 }}
        style={{ textAlign: "center" }}
      >
        <PixIcon emoji="🤖" size={86} />
        {/* "guesses", not "passwords" — the junk card literally says
            "password" and click-target labels must be unique on screen. */}
        <CaptionChip style={{ fontSize: 10, fontWeight: 900, letterSpacing: "0.1em", padding: "4px 10px" }}>
          THE GUESS-O-TRON {full ? "· 💥 FULL!" : "· feed me obvious guesses!"}
        </CaptionChip>
        {/* Belly meter */}
        <div style={{ width: 180, height: 14, margin: "6px auto 0", borderRadius: 999, background: "rgba(255,255,255,0.85)", border: "2px solid #8b5cf6", overflow: "hidden" }}>
          <motion.div
            animate={{ width: `${(fed.length / data.junk.length) * 100}%` }}
            style={{ height: "100%", background: full ? "#e0447d" : "linear-gradient(90deg, #a78bfa, #8b5cf6)" }}
          />
        </div>
      </motion.div>

      {/* Fun-fact bubble as each junk password is eaten */}
      <div style={{ minHeight: 40 }}>
        <AnimatePresence>
          {note && (
            <motion.div
              key={note}
              initial={reduce ? false : { opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              style={{
                padding: "8px 18px", borderRadius: 999,
                background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`,
                fontSize: 14.5, fontWeight: 800, color: "#4c1d95",
                boxShadow: "0 10px 26px -12px rgba(20,30,60,0.5)",
              }}
            >
              {note}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Junk passwords to feed + YOUR golden one */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", alignItems: "center" }}>
        {data.junk.map((junk, i) => {
          const eaten = fed.includes(junk.id);
          return (
            <motion.button
              key={junk.id}
              onClick={(e) => feed(junk, e)}
              disabled={eaten}
              animate={eaten ? { scale: 0.6, opacity: 0 } : reduce ? { scale: 1 } : { scale: [1, 1.06, 1] }}
              transition={eaten ? { duration: 0.35 } : reduce ? undefined : { duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
              whileTap={reduce || eaten ? undefined : { scale: 0.9 }}
              style={{
                padding: "16px 24px", borderRadius: 14, cursor: eaten ? "default" : "pointer",
                touchAction: "manipulation", fontFamily: MONO, fontSize: 19, fontWeight: 900,
                background: "linear-gradient(180deg, #94a3b8, #64748b)",
                border: "3px dashed #cbd5e1", color: "#f1f5f9",
                boxShadow: eaten ? "none" : "0 14px 30px -12px rgba(71,85,105,0.7)",
              }}
            >
              {junk.text}
            </motion.button>
          );
        })}

        {/* The golden un-guessable card — can't be fed. */}
        <motion.button
          key={`gold-${goldWiggle}`}
          onClick={() => {
            setGoldWiggle((w) => w + 1);
            playSound("pop");
            showNote("That one's YOURS — it's not on his list!");
          }}
          animate={reduce || goldWiggle === 0 ? undefined : { rotate: [0, -4, 4, -2, 0] }}
          transition={{ duration: 0.4 }}
          style={{
            padding: "16px 24px", borderRadius: 14, cursor: "pointer",
            touchAction: "manipulation", fontFamily: MONO, fontSize: 16, fontWeight: 900,
            background: "linear-gradient(180deg, #ffd158, #b8860b)",
            border: "3px solid #fff", color: "#3b2a05",
            boxShadow: "0 14px 34px -10px rgba(184,134,11,0.8)",
            display: "flex", alignItems: "center", gap: 8,
          }}
        >
          <PixIcon emoji="🔒" size={22} /> {data.yours}
        </motion.button>
      </div>

      <CaptionChip>
        {fed.length} / {data.junk.length} OBVIOUS ONES FED · HE CAN&apos;T GUESS YOURS
      </CaptionChip>
    </div>
  );
}

/* ────────────────────────── PHASE 5 · FINAL ──────────────────────────
   Press-and-HOLD the golden forge button: the counter charges 3 DAYS →
   87 YEARS → 400 YEARS (release just pauses). Then refuse the sweet
   talk and the machine detonates. */

function FinalPhase({ data, paused, judge, done, reduce, accent, signature }: { data: VaultData["final"]; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean; accent: string; signature: SignatureFn }) {
  const [charge, setCharge] = useState(0); // 0..1
  const [holding, setHolding] = useState(false);
  const [beat, setBeat] = useState<"forge" | "sweet">("forge");
  const holdingRef = useRef(false);
  const pausedRef = useRef(paused);
  const chargeRef = useRef(0);
  const milestoneRef = useRef(0);
  const forgedRef = useRef(false);
  const finishedRef = useRef(false);
  useEffect(() => {
    holdingRef.current = holding;
    pausedRef.current = paused;
  }, [holding, paused]);

  // Overload theatrics on entry.
  useEffect(() => {
    signature("vault-overload");
    const id = window.setTimeout(() => playVillain("overload"), 900);
    return () => window.clearTimeout(id);
  }, [signature]);

  // Charge clock: only advances while held (and not paused).
  useEffect(() => {
    if (beat !== "forge") return;
    let raf = 0;
    let last = performance.now();
    const total = data.chargeSecs * 1000;
    const loop = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      if (holdingRef.current && !pausedRef.current && !forgedRef.current) {
        chargeRef.current = Math.min(1, chargeRef.current + dt / total);
        setCharge(chargeRef.current);
        const m = chargeRef.current >= 1 ? 3 : chargeRef.current >= 2 / 3 ? 2 : chargeRef.current >= 1 / 3 ? 1 : 0;
        if (m > milestoneRef.current) {
          milestoneRef.current = m;
          playSound("phaseChange");
        }
        if (chargeRef.current >= 1 && !forgedRef.current) {
          forgedRef.current = true;
          playSound("lock");
          judge("vault-final-forge", true, 0, 0);
          window.setTimeout(() => setBeat("sweet"), 900);
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [beat, data.chargeSecs, judge]);

  // Sweet-talk bark when the last trick starts.
  useEffect(() => {
    if (beat === "sweet") playVillain("sweettalk");
  }, [beat]);

  const counter =
    charge >= 1 ? data.milestones[2] : charge >= 2 / 3 ? data.milestones[1] : charge >= 1 / 3 ? data.milestones[0] : "2 SECONDS";

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minHeight: 0, justifyContent: "center", alignItems: "center" }}>
      {/* The forged password + counter */}
      <div style={{ width: "100%", maxWidth: 560, textAlign: "center" }}>
        <div
          style={{
            minHeight: 50, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "9px 16px", borderRadius: 14, marginBottom: 8,
            background: "rgba(255,255,255,0.95)", border: `3px solid ${accent}`,
            boxShadow: charge > 0 ? `0 0 ${12 + charge * 26}px rgba(224,68,125,${0.25 + charge * 0.4})` : "0 12px 30px -14px rgba(20,30,60,0.5)",
            fontFamily: MONO, fontSize: 21, fontWeight: 900, color: "#15803d", wordBreak: "break-all",
          }}
        >
          {data.forged}
        </div>
        <motion.div
          key={counter}
          initial={reduce ? false : { scale: 1.35 }}
          animate={{ scale: 1 }}
          style={{ fontFamily: MONO, fontSize: 24, fontWeight: 900, color: charge >= 1 ? "#15803d" : "#e0447d", textShadow: "0 1px 0 #fff" }}
        >
          ⛨ {counter}
        </motion.div>
        {/* Charge bar */}
        <div style={{ width: "80%", maxWidth: 380, height: 18, margin: "8px auto 0", borderRadius: 999, background: "rgba(255,255,255,0.85)", border: "2.5px solid #e0447d", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${charge * 100}%`, background: "linear-gradient(90deg, #ffd158, #e0447d)", transition: "width 80ms linear" }} />
        </div>
      </div>

      {beat === "forge" && (
        <>
          <motion.button
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId); // hold survives edge wobble
              setHolding(true);
              playSound("click");
              signature("vault-forge-charge");
            }}
            onPointerUp={() => setHolding(false)}
            onPointerCancel={() => setHolding(false)}
            animate={!holding && !reduce ? { scale: [1, 1.08, 1] } : { scale: holding ? 1.05 : 1 }}
            transition={!holding ? { duration: 1.1, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
            style={{
              width: 170, height: 170, borderRadius: "50%", cursor: "pointer", touchAction: "none",
              fontFamily: "inherit", fontSize: 21, fontWeight: 900, letterSpacing: "0.04em",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
              background: holding
                ? "radial-gradient(circle at 50% 30%, #ffe9a8, #d98a06)"
                : "radial-gradient(circle at 50% 30%, #ffd158, #b8860b)",
              border: "6px solid #fff",
              boxShadow: holding ? "0 0 44px rgba(255,209,88,0.9)" : "0 18px 40px -12px rgba(184,134,11,0.8)",
              color: "#3b2a05",
              userSelect: "none", WebkitUserSelect: "none",
            }}
          >
            <PixIcon emoji="🔨" size={40} />
            {holding ? "FORGING…" : "HOLD TO FORGE"}
          </motion.button>
          <CaptionChip>
            KEEP HOLDING — CHARGE IT TO 400 YEARS!
          </CaptionChip>
        </>
      )}

      {beat === "sweet" && (
        <div style={{ maxWidth: 460, width: "100%", textAlign: "center" }}>
          <div
            style={{
              padding: "16px 18px", borderRadius: 16, marginBottom: 12,
              background: "rgba(255,255,255,0.96)",
              border: "3px solid #8b5cf6", color: "#4c1d95", fontSize: 16.5, fontWeight: 800, fontStyle: "italic", lineHeight: 1.4,
              boxShadow: "0 14px 34px -14px rgba(20,30,60,0.5)",
            }}
          >
            <PixIcon emoji="🦝" size={18} style={{ verticalAlign: "-3px", marginRight: 5 }} />“{data.sweetTalk}”
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <motion.button
              onClick={(e) => {
                if (finishedRef.current) return;
                judge("vault-final-refuse", true, 0, 0, undefined, { x: e.clientX, y: e.clientY });
                finishedRef.current = true;
                playSound("lock");
                window.setTimeout(done, 800);
              }}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              animate={reduce ? undefined : { scale: [1, 1.05, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
              style={{ padding: "18px 32px", borderRadius: 16, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit", fontSize: 19, fontWeight: 900, background: "radial-gradient(circle at 50% 28%, #47e08a, #15803d)", border: "4px solid #fff", color: "#fff", boxShadow: "0 16px 36px -12px rgba(21,128,61,0.8)" }}
            >
              🤐 {data.refuse}
            </motion.button>
            <motion.button
              onClick={(e) => {
                if (finishedRef.current) return;
                judge("vault-final-tell", false, 1, 0, { title: "Nice try, Raccoon!", explanation: data.tellExplanation }, { x: e.clientX, y: e.clientY });
              }}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              style={{ padding: "18px 32px", borderRadius: 16, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit", fontSize: 15, fontWeight: 900, background: "linear-gradient(180deg, #ffe9a8, #f5c854)", border: "3px solid #fff", color: "#4a3208" }}
            >
              ✨ Tell him… just this once
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
