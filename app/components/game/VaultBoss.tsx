"use client";

/**
 * VaultBoss — Week 1's bespoke COMBAT boss: "The Cracking Machine".
 *
 * The Raccoon wheels his CRACK-O-MATIC 3000 up to the class vault and
 * tries to crack YOUR password. Five phases, one per password rule,
 * each a different micro-game — and the star pedagogy piece: a
 * TIME-TO-CRACK meter on the vault that leaps from seconds to centuries
 * as each rule is applied.
 *
 *   1. WALL      - stack word-bricks while his battering ram pounds
 *                  (longer = stronger).
 *   2. SCRAMBLER - inject CAPS / numbers / symbols / extra letters
 *                  before his decoder cracks the plain word.
 *   3. COVER     - press-and-hold to shield the keypad whenever his spy
 *                  periscopes open. (The real-world gesture, rehearsed.)
 *   4. REEL      - stop the password reel on the un-guessable options;
 *                  his Guess-o-Tron devours anything obvious.
 *   5. FINAL     - forge the 400-year password, refuse his sweet talk,
 *                  and watch the machine detonate against it.
 *
 * Reporting speaks BossBattle's exact dialects with the SAME phase ids
 * the shipped Week 1 quiz boss used, so family dashboards stay
 * continuous. No lose state: wrong answers teach and cost combo only.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound } from "@/app/lib/sounds";
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
  ParticleLayer,
  type ParticleAPI,
  DataRain,
  PhaseHint,
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

const HEROES = makeHeroes(); // shield-bearing arena idles fit vault guarding

const PHASE_ORDER = ["wall", "scrambler", "cover", "reel", "final"] as const;
type PhaseKey = (typeof PHASE_ORDER)[number];

const PHASE_TONE: Record<PhaseKey, { accent: string; glow: string }> = {
  wall: { accent: "#7eff97", glow: "rgba(126,255,151,0.5)" },
  scrambler: { accent: "#7df0ff", glow: "rgba(0,229,255,0.5)" },
  cover: { accent: "#ffd158", glow: "rgba(255,209,88,0.5)" },
  reel: { accent: "#c084fc", glow: "rgba(192,132,252,0.5)" },
  final: { accent: "#ff5fb3", glow: "rgba(255,95,179,0.5)" },
};

const FOILED_LINES: Record<PhaseKey, string> = {
  wall: "My ram! You built it TOO LONG!",
  scrambler: "Capitals AND symbols?! My decoder is crying!",
  cover: "I saw NOTHING! Not one letter!",
  reel: "Stop picking the un-guessable ones!",
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
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [shakeNonce, setShakeNonce] = useState(0);
  const [flash, setFlash] = useState<null | "hit" | "phase" | "wrong">(null);
  const [popups, setPopups] = useState<{ id: number; text: string; colour: string; x: number; y: number }[]>([]);
  const [clearBonus, setClearBonus] = useState<{ label: string; noLeaks: boolean; crackTime: string } | null>(null);

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
    () => ({ wall: vault.wall, scrambler: vault.scrambler, cover: vault.cover, reel: vault.reel, final: vault.final }) as const,
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
    phaseWrongs.current = 0;
    playSound("phaseChange");
    setStage("announce");
  };

  useEffect(() => {
    if (stage === "announce" && startTs.current === 0) startTs.current = performance.now();
  }, [stage]);

  useEffect(() => {
    if (stage !== "announce") return;
    playVillain(`taunt-${Math.min(phaseIdx + 1, 6)}`);
    const id = window.setTimeout(() => setStage("play"), reduce ? 1200 : 2500);
    return () => window.clearTimeout(id);
  }, [stage, phaseIdx, reduce]);

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
        flashMood("attack", "The machine likes that!", 1500);
        if (teachOnWrong) setTeach(teachOnWrong);
      }
    },
    [phaseIdx, phaseMeta, onQuestionAnswered, combo, reduce, addPopup, doFlash, flashMood, shake],
  );

  const phaseDone = useCallback(() => {
    const key = PHASE_ORDER[phaseIdx];
    const noLeaks = phaseWrongs.current === 0;
    playSound("bossHurt");
    playSound("screenShake");
    shake();
    doFlash("phase");
    setStamped((s) => (s.includes(key) ? s : [...s, key]));
    setPower((v) => Math.max(0, v - 20));
    setScore((s) => s + 250 + (noLeaks ? 150 : 0));
    setRaccoonMood("hurt");
    setRaccoonLine(FOILED_LINES[key]);
    setClearBonus({ label: phaseMeta[key].label, noLeaks, crackTime: phaseMeta[key].crackTime });
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
    }, reduce ? 1400 : 2800);
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
      {/* Arena backdrop */}
      <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "url(/game/backgrounds/cyber-classroom.png)", backgroundSize: "cover", backgroundPosition: "center", filter: "brightness(0.5) saturate(1.15)" }} />
      <DataRain disabled={reduce} />
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse at 72% 34%, ${hero ? HEROES[hero].theme.washA : "rgba(126,255,151,0.14)"} 0%, transparent 46%), radial-gradient(ellipse at 20% 70%, ${hero ? HEROES[hero].theme.washB : "rgba(0,229,255,0.12)"} 0%, transparent 46%)`,
          transition: "background 700ms ease",
        }}
      />
      <div aria-hidden style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 160px 50px rgba(3,4,12,0.9)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, opacity: 0.07, background: "repeating-linear-gradient(0deg, transparent 0 3px, rgba(255,255,255,0.5) 3px 4px)" }} />

      <AnimatePresence>
        {flash && !reduce && (
          <motion.div
            key={`${flash}-${shakeNonce}-${score}`}
            initial={{ opacity: 0.55 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: flash === "phase" ? 0.24 : 0.13 }}
            aria-hidden
            style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none", background: flash === "wrong" ? "#ff2f6d" : flash === "phase" ? "#ffffff" : tone.accent, mixBlendMode: "screen" }}
          />
        )}
      </AnimatePresence>

      {/* Characters + the machine */}
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

      {/* The CRACK-O-MATIC + its operator */}
      <motion.img
        key={machineImg}
        src={machineImg}
        alt="The CRACK-O-MATIC cracking machine"
        initial={reduce ? false : { scale: 0.94, opacity: 0.7 }}
        animate={reduce ? { scale: 1, opacity: 1 } : stage === "victory" ? { scale: 0.96, opacity: 0.95, rotate: 2 } : { scale: 1, opacity: 1, y: [0, -4, 0] }}
        transition={stage === "victory" ? { duration: 0.4 } : { duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ position: "absolute", right: "3%", bottom: "10%", height: stage === "entrance" ? "46%" : "38%", zIndex: 2, filter: `drop-shadow(0 20px 26px rgba(0,0,0,0.75)) drop-shadow(0 0 30px ${tone.glow})`, transition: "height 600ms ease" }}
      />
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
        style={{ position: "absolute", right: "23%", bottom: "12%", height: "24%", zIndex: 3, filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.7))" }}
      />
      <div aria-hidden style={{ position: "absolute", right: "2%", bottom: "8%", width: "26%", height: 26, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(126,255,151,0.35), transparent 70%)" }} />

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

      {/* HUD */}
      {stage !== "entrance" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: "0.14em", color: "#9dff87", textShadow: "0 0 12px rgba(120,255,90,0.7)", whiteSpace: "nowrap" }}>
              ⚙ CRACK-O-MATIC POWER
            </span>
            <div style={{ flex: 1, display: "flex", gap: 4 }} role="progressbar" aria-valuenow={power} aria-valuemin={0} aria-valuemax={100}>
              {PHASE_ORDER.map((k, i) => {
                const alive = power > i * 20;
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
                  style={{ fontFamily: MONO, fontSize: combo >= 6 ? 15 : 12.5, fontWeight: 900, letterSpacing: "0.1em", color: combo >= 6 ? "#ffd158" : "#7eff97", textShadow: `0 0 14px ${combo >= 6 ? "rgba(255,209,88,0.8)" : "rgba(126,255,151,0.7)"}` }}
                >
                  COMBO ×{combo}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Vault rail: TIME TO CRACK */}
      {inBattle && (
        <div className="vb-vault-rail" style={{ position: "absolute", top: 76, right: 12, zIndex: 20, width: 196, borderRadius: 12, padding: "8px 12px 10px", background: "rgba(6,8,20,0.82)", border: `1px solid ${tone.accent}55`, backdropFilter: "blur(6px)", fontFamily: MONO }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: "0.16em", color: "#7df0ff", marginBottom: 4, textAlign: "center" }}>⛨ TIME TO CRACK</div>
          <motion.div
            key={crackNow}
            initial={reduce ? false : { scale: 1.35 }}
            animate={{ scale: 1 }}
            style={{ textAlign: "center", fontSize: 15, fontWeight: 900, color: stamped.length === 0 ? "#ff9bcb" : "#7eff97", textShadow: stamped.length === 0 ? "0 0 12px rgba(255,95,179,0.7)" : "0 0 12px rgba(126,255,151,0.7)", marginBottom: 7 }}
          >
            {crackNow}
          </motion.div>
          {PHASE_ORDER.map((k) => {
            const p = phaseMeta[k];
            const done = stamped.includes(k);
            const isCurrent = k === phaseKey && !done;
            return (
              <div key={k} style={{ marginBottom: 3, opacity: done ? 1 : isCurrent ? 0.95 : 0.4 }}>
                <div style={{ fontSize: 7.5, fontWeight: 800, letterSpacing: "0.1em", color: done ? "#7eff97" : isCurrent ? "#ffd158" : "#5d689e" }}>{p.label.toUpperCase()}</div>
                <div style={{ fontSize: 10, fontWeight: 800, color: done ? "#e7ecff" : "#4d578a" }}>
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
              style={{ position: "absolute", left: p.x, top: p.y, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 17, fontWeight: 900, color: p.colour, textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main stage */}
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
                  style={{ fontFamily: MONO, fontSize: 13, fontWeight: 900, letterSpacing: "0.3em", color: "#9dff87", textShadow: "0 0 18px rgba(120,255,90,0.9)", marginBottom: 10 }}
                >
                  ⚠ CRACKING MACHINE DETECTED ⚠
                </motion.div>
              )}
              {entranceBeat >= 2 && (
                <motion.h1
                  initial={reduce ? false : { scale: 3, opacity: 0, rotate: -4 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 190, damping: 14 }}
                  style={{ margin: 0, fontSize: 50, fontWeight: 900, lineHeight: 1, background: "linear-gradient(135deg, #7eff97 0%, #00e5ff 50%, #7c5cff 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 6px 24px rgba(0,229,255,0.55))" }}
                >
                  THE CRACKING MACHINE
                </motion.h1>
              )}
            </motion.div>
          )}

          {stage === "select" && (
            <motion.div key="select" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ margin: "auto", textAlign: "center", maxWidth: 560, width: "100%", zIndex: 15 }}>
              <h2 style={{ margin: "0 0 2px", fontSize: 30, fontWeight: 900, background: "linear-gradient(135deg, #ffd158, #ff8f6b)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 4px 16px rgba(255,209,88,0.4))" }}>
                CHOOSE YOUR HERO
              </h2>
              <p style={{ margin: "0 0 16px", fontSize: 13.5, fontWeight: 700, fontStyle: "italic", color: "#c8f5d3", textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>
                🦝 “My machine cracks ANY password. Guard yours if you dare!”
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
                      <span style={{ fontSize: 19, fontWeight: 900, letterSpacing: "0.08em", color: h.theme.accent, textShadow: `0 0 14px ${h.theme.glow}` }}>{h.name}</span>
                      <span style={{ fontSize: 11.5, fontWeight: 700, color: "#9fb1ff" }}>{h.tagline}</span>
                      <span style={{ marginTop: 2, padding: "7px 26px", borderRadius: 999, background: `linear-gradient(180deg, ${h.theme.accent}, ${h.theme.accent}99)`, color: "#081018", fontSize: 13, fontWeight: 900, letterSpacing: "0.1em", boxShadow: `0 8px 20px -6px ${h.theme.glow}` }}>
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
              <div style={{ fontSize: 15.5, fontWeight: 700, color: "#c8f5d3", fontStyle: "italic", textShadow: "0 2px 6px rgba(0,0,0,0.9)" }}>
                🦝 “{currentPhase.intro}”
              </div>
            </motion.div>
          )}

          {stage === "play" && (
            <motion.div key={`play-${phaseIdx}`} initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ flex: 1, display: "flex", flexDirection: "column", zIndex: 15, minHeight: 0 }}>
              {phaseKey === "wall" && <WallPhase data={vault.wall} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} />}
              {phaseKey === "scrambler" && <ScramblerPhase data={vault.scrambler} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} />}
              {phaseKey === "cover" && <CoverPhase data={vault.cover} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} />}
              {phaseKey === "reel" && <ReelPhase data={vault.reel} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} />}
              {phaseKey === "final" && <FinalPhase data={vault.final} judge={judge} done={phaseDone} reduce={reduce} accent={tone.accent} />}
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
              <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 900, color: "#7df0ff", textShadow: "0 0 16px rgba(0,229,255,0.7)", marginBottom: 4 }}>
                TIME TO CRACK: {clearBonus.crackTime}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: "#fff7e6", marginBottom: 4 }}>+250 pts</div>
              {clearBonus.noLeaks && (
                <motion.div initial={reduce ? false : { scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.25 }} style={{ fontFamily: MONO, fontSize: 14, fontWeight: 900, color: "#ffd158", textShadow: "0 0 16px rgba(255,209,88,0.8)" }}>
                  ★ PERFECT DEFENCE +150 ★
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
                style={{ margin: "0 auto 14px", width: 250, padding: "13px 15px", borderRadius: 4, background: "#f7f4ea", color: "#3b3a33", fontFamily: MONO, boxShadow: "0 18px 40px -12px rgba(0,0,0,0.85)" }}
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
              <h2 style={{ margin: "0 0 6px", fontSize: 30, fontWeight: 900, background: hero ? HEROES[hero].theme.title : "linear-gradient(135deg, #7eff97, #00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 4px 18px ${hero ? HEROES[hero].theme.glow : "rgba(126,255,151,0.4)"})` }}>
                The vault held. The machine didn&apos;t.
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

/* ────────────────────────── PHASE 1 · WALL ────────────────────────── */

function WallPhase({ data, paused, judge, done, reduce, accent }: { data: VaultData["wall"]; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [stackedIds, setStackedIds] = useState<string[]>([]);
  const [crumbled, setCrumbled] = useState<string[]>([]);
  const [ramHit, setRamHit] = useState(0);
  const finishedRef = useRef(false);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  // The ram pounds on a beat; the taller the wall, the weaker the thud.
  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current || finishedRef.current) return;
      playSound("hitImpact");
      setRamHit((n) => n + 1);
    }, reduce ? 4200 : 2600);
    return () => window.clearInterval(id);
  }, [reduce]);

  const stacked = stackedIds.map((id) => data.bricks.find((b) => b.id === id)!).filter(Boolean);
  const password = stacked.map((b) => b.text).join("-");

  const tap = (brick: VaultData["wall"]["bricks"][number], e: React.MouseEvent) => {
    if (paused || finishedRef.current || stackedIds.includes(brick.id) || crumbled.includes(brick.id)) return;
    const at = { x: e.clientX, y: e.clientY };
    if (brick.weak) {
      setCrumbled((c) => [...c, brick.id]);
      judge(`vault-wall-${brick.id}`, false, 1, 0, { title: "That brick crumbled!", explanation: brick.weak }, at);
      return;
    }
    playSound("drop");
    judge(`vault-wall-${brick.id}`, true, 0, 0, undefined, at);
    const next = [...stackedIds, brick.id];
    setStackedIds(next);
    if (next.length >= data.target && !finishedRef.current) {
      finishedRef.current = true;
      window.setTimeout(done, 700);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0, justifyContent: "center" }}>
      <PhaseHint accent={accent} text="His ram is pounding the vault! Stack STRONG word-bricks — longer is stronger." />

      {/* The wall + password banner */}
      <motion.div
        key={ramHit}
        animate={reduce || ramHit === 0 ? undefined : { x: [0, -6 + stackedIds.length, 6 - stackedIds.length, 0] }}
        transition={{ duration: 0.3 }}
        style={{ margin: "0 auto", width: "100%", maxWidth: 560, textAlign: "center" }}
      >
        <div style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", color: "#9fb1ff", marginBottom: 5 }}>
          VAULT PASSWORD ({password.length} letters long)
        </div>
        <div
          style={{
            minHeight: 46, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "8px 14px", borderRadius: 12,
            background: "rgba(6,8,20,0.8)", border: `2px solid ${accent}66`,
            boxShadow: `0 0 22px ${accent}33`,
            fontFamily: MONO, fontSize: password.length > 22 ? 15 : 19, fontWeight: 900, color: "#7eff97",
            wordBreak: "break-all",
          }}
        >
          {password || "…"}
        </div>
        {/* Wall rows */}
        <div style={{ display: "flex", flexDirection: "column-reverse", alignItems: "center", gap: 4, marginTop: 8, minHeight: 90 }}>
          <AnimatePresence>
            {stacked.map((b, i) => (
              <motion.div
                key={b.id}
                initial={reduce ? false : { y: -30, opacity: 0, scale: 0.85 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 18 }}
                style={{
                  padding: "7px 22px", borderRadius: 8,
                  background: "linear-gradient(180deg, #8a6a3f, #6b4d28)",
                  border: "2px solid #b28c55", color: "#ffedc9",
                  fontFamily: MONO, fontSize: 13.5, fontWeight: 900,
                  boxShadow: "0 6px 14px -6px rgba(0,0,0,0.7)",
                  transform: `rotate(${(i % 2 === 0 ? -1 : 1) * 0.8}deg)`,
                }}
              >
                🧱 {b.text}
              </motion.div>
            ))}
          </AnimatePresence>
          {stacked.length === 0 && (
            <div style={{ fontSize: 12, fontWeight: 700, color: "#7d8cc9" }}>the wall is EMPTY — quick, stack it!</div>
          )}
        </div>
      </motion.div>

      {/* Brick tray */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "center", maxWidth: 640, margin: "0 auto" }}>
        {data.bricks.map((brick) => {
          const used = stackedIds.includes(brick.id) || crumbled.includes(brick.id);
          return (
            <motion.button
              key={brick.id}
              onClick={(e) => tap(brick, e)}
              disabled={used || paused}
              whileHover={used || reduce ? undefined : { scale: 1.06, y: -3 }}
              whileTap={reduce ? undefined : { scale: 0.93 }}
              animate={crumbled.includes(brick.id) && !reduce ? { rotate: 8, y: 14, opacity: 0.25 } : { opacity: used ? 0.25 : 1 }}
              style={{
                padding: "11px 16px", borderRadius: 10, cursor: used ? "default" : "pointer",
                touchAction: "manipulation", fontFamily: MONO, fontSize: 14, fontWeight: 900,
                background: "linear-gradient(180deg, #a8814f, #7d5c33)",
                border: "2px solid #caa26a", color: "#fff2d9",
                boxShadow: "0 8px 18px -8px rgba(0,0,0,0.7)",
              }}
            >
              {brick.text}
            </motion.button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        {stackedIds.length} / {data.target} STRONG BRICKS · WATCH FOR CRUMBLY ONES
      </div>
    </div>
  );
}

/* ──────────────────────── PHASE 2 · SCRAMBLER ──────────────────────── */

function ScramblerPhase({ data, paused, judge, done, reduce, accent }: { data: VaultData["scrambler"]; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [applied, setApplied] = useState<string[]>([]);
  const [decode, setDecode] = useState(0); // 0..1
  const finishedRef = useRef(false);
  const pausedRef = useRef(paused);
  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const buttons = useMemo(() => {
    // Interleave the real injectors with the traps, deterministically.
    const all: Array<{ id: string; label: string; icon: string; kind?: string; explanation?: string }> = [];
    const t = [...data.traps];
    data.injectors.forEach((inj, i) => {
      all.push(inj);
      if (t[i]) all.push(t[i]);
    });
    return all.concat(t.slice(data.injectors.length));
  }, [data]);

  // His decoder creeps toward the plain word.
  useEffect(() => {
    const totalMs = (reduce ? data.decodeSecs * 2 : data.decodeSecs) * 1000;
    const tick = 60;
    const id = window.setInterval(() => {
      if (pausedRef.current || finishedRef.current) return;
      setDecode((d) => Math.min(1, d + tick / totalMs));
    }, tick);
    return () => window.clearInterval(id);
  }, [data.decodeSecs, reduce]);

  // Decoder filled → he cracks the (still too plain) word: teach + reset.
  useEffect(() => {
    if (decode < 1 || finishedRef.current) return;
    judge(`vault-scrambler-decoded`, false, 0, 1, {
      title: "His decoder caught up!",
      explanation: "A plain word gets cracked fast. Quick - inject capitals, numbers and symbols to scramble it!",
    });
    setDecode(0.35);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decode]);

  const display = useMemo(() => {
    let s = data.baseWord;
    if (applied.some((k) => k === "caps")) s = s.charAt(0).toUpperCase() + s.slice(1, 3) + (s.charAt(3) || "").toUpperCase() + s.slice(4);
    if (applied.some((k) => k === "lower")) s = `${s}-fox`;
    if (applied.some((k) => k === "number")) s = `${s}7`;
    if (applied.some((k) => k === "symbol")) s = `${s}!`;
    return s;
  }, [applied, data.baseWord]);

  const press = (b: (typeof buttons)[number], e: React.MouseEvent) => {
    if (paused || finishedRef.current) return;
    const at = { x: e.clientX, y: e.clientY };
    if (!b.kind) {
      judge(`vault-scrambler-${b.id}`, false, 1, 0, { title: "That would make it WEAKER!", explanation: b.explanation ?? "" }, at);
      return;
    }
    if (applied.includes(b.kind)) return;
    playSound("pop");
    judge(`vault-scrambler-${b.id}`, true, 0, 0, undefined, at);
    setDecode((d) => Math.max(0, d - 0.3));
    const next = [...applied, b.kind];
    setApplied(next);
    if (next.length >= data.injectors.length && !finishedRef.current) {
      finishedRef.current = true;
      playSound("lock");
      window.setTimeout(done, 800);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0, justifyContent: "center" }}>
      <PhaseHint accent={accent} text="His decoder is chewing the plain word! Inject ALL FOUR mixers before it finishes." />

      <div style={{ margin: "0 auto", width: "100%", maxWidth: 520, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 26, fontWeight: 900, color: "#7eff97", textShadow: "0 0 18px rgba(126,255,151,0.6)", marginBottom: 8 }}>
          {display}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#ff9bcb", marginBottom: 3 }}>
          DECODER PROGRESS
        </div>
        <div style={{ height: 12, borderRadius: 999, background: "rgba(8,10,22,0.8)", border: "1px solid rgba(255,95,179,0.45)", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${decode * 100}%`, background: decode > 0.75 ? "#ff2f6d" : "linear-gradient(90deg, #ff7ac2, #d12a72)", transition: "width 80ms linear" }} />
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", maxWidth: 620, margin: "0 auto" }}>
        {buttons.map((b) => {
          const used = !!b.kind && applied.includes(b.kind);
          return (
            <motion.button
              key={b.id}
              onClick={(e) => press(b, e)}
              disabled={used || paused}
              whileHover={used || reduce ? undefined : { scale: 1.06 }}
              whileTap={reduce ? undefined : { scale: 0.92 }}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 12,
                cursor: used ? "default" : "pointer", touchAction: "manipulation", fontFamily: "inherit",
                fontSize: 14.5, fontWeight: 900,
                background: used ? "rgba(52,211,153,0.2)" : "linear-gradient(180deg, #2e3a7e 0%, #1d2557 100%)",
                border: used ? "2px solid #34d399" : "2px solid rgba(140,155,255,0.6)",
                color: used ? "#7eff97" : "#eef1ff",
                boxShadow: used ? "0 0 16px rgba(52,211,153,0.4)" : "0 10px 22px -8px rgba(0,0,0,0.7)",
              }}
            >
              <PixIcon emoji={b.icon} size={24} /> {b.label} {used && "✓"}
            </motion.button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        {applied.length} / {data.injectors.length} MIXERS INJECTED
      </div>
    </div>
  );
}

/* ────────────────────────── PHASE 3 · COVER ────────────────────────── */

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

  // Snoop cycle: closed gap → opening telegraph → open window → judge.
  useEffect(() => {
    if (snoopIdx >= data.snoops || finishedRef.current) return;
    let cancelled = false;
    const gapMs = reduce ? 2600 : 1800;
    const telegraphMs = reduce ? 1600 : 1100;
    const openMs = (reduce ? data.openSecs * 1.6 : data.openSecs) * 1000;

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
          const ok = uncoveredMs.current <= openMs * 0.25;
          if (ok) {
            judge(`vault-cover-${snoopIdx}`, true, 0, 0);
          } else {
            judge(`vault-cover-${snoopIdx}`, false, 1, 0, { title: "He peeked!", explanation: data.explanation });
          }
          const nextIdx = snoopIdx + 1;
          if (nextIdx >= data.snoops && !finishedRef.current) {
            finishedRef.current = true;
            window.setTimeout(done, 700);
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
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minHeight: 0, justifyContent: "center", alignItems: "center" }}>
      <PhaseHint accent={accent} text="His spy periscopes want a peek at your typing! HOLD the cover when the eye opens." />

      {/* The keypad + eye */}
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 26 }}>
        <div
          style={{
            width: 170, padding: "12px 14px", borderRadius: 14, textAlign: "center",
            background: "rgba(6,8,20,0.85)", border: `2px solid ${accent}66`,
            boxShadow: covering ? `0 0 26px ${accent}66` : "0 10px 24px -10px rgba(0,0,0,0.7)",
            fontFamily: MONO,
          }}
        >
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: "#9fb1ff", marginBottom: 6 }}>VAULT KEYPAD</div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: 4, color: covering ? "#39406b" : "#7eff97", filter: covering ? "blur(5px)" : "none", transition: "filter 120ms ease" }}>
            ●●●●●●
          </div>
          {covering && <div style={{ marginTop: 4, fontSize: 10.5, fontWeight: 900, color: "#7eff97" }}>🖐 COVERED!</div>}
        </div>

        <motion.div
          animate={
            eyeState === "open" && !reduce
              ? { y: [0, -4, 0], scale: 1.06 }
              : { scale: eyeState === "closed" ? 0.85 : 1 }
          }
          transition={eyeState === "open" ? { duration: 0.6, repeat: Infinity } : { duration: 0.25 }}
          style={{ textAlign: "center", opacity: eyeState === "closed" ? 0.35 : 1, transition: "opacity 250ms ease" }}
        >
          <div style={{ fontSize: 52, filter: eyeState === "open" ? "drop-shadow(0 0 18px rgba(255,95,179,0.8))" : "none" }}>
            {eyeState === "open" ? "👀" : "🦝"}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 900, letterSpacing: "0.1em", color: eyeState === "open" ? "#ff9bcb" : eyeState === "opening" ? "#ffd158" : "#5d689e" }}>
            {eyeState === "open" ? "PEEKING!" : eyeState === "opening" ? "PERISCOPE RISING…" : "…lurking…"}
          </div>
        </motion.div>
      </div>

      {/* The cover control */}
      <motion.button
        onPointerDown={() => { setCovering(true); playSound("click"); }}
        onPointerUp={() => setCovering(false)}
        onPointerLeave={() => setCovering(false)}
        whileTap={reduce ? undefined : { scale: 0.94 }}
        style={{
          padding: "20px 48px", borderRadius: 999, cursor: "pointer", touchAction: "none",
          fontFamily: "inherit", fontSize: 21, fontWeight: 900, letterSpacing: "0.06em",
          background: covering ? "linear-gradient(180deg, #5eeaa5, #178a56)" : "linear-gradient(180deg, #ffd158, #f59e0b)",
          border: covering ? "4px solid #a4f5cd" : "4px solid #ffe9a8",
          boxShadow: covering ? "0 0 34px rgba(94,234,165,0.6)" : "0 14px 34px -8px rgba(245,158,11,0.85)",
          color: covering ? "#06281a" : "#4a3208",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        🖐 {covering ? "COVERING…" : "HOLD TO COVER"}
      </motion.button>

      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        SNOOP {Math.min(snoopIdx + 1, data.snoops)} / {data.snoops} · {survived} BLOCKED
      </div>
    </div>
  );
}

/* ────────────────────────── PHASE 4 · REEL ────────────────────────── */

function ReelPhase({ data, paused, judge, done, reduce, accent }: { data: VaultData["reel"]; paused: boolean; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [pos, setPos] = useState(0);
  const [spinning, setSpinning] = useState(true);
  const [strong, setStrong] = useState(0);
  const finishedRef = useRef(false);
  const pausedRef = useRef(paused);
  const spinningRef = useRef(true);
  useEffect(() => {
    pausedRef.current = paused;
    spinningRef.current = spinning;
  }, [paused, spinning]);

  useEffect(() => {
    const step = reduce ? data.stepMs * 1.8 : data.stepMs;
    const id = window.setInterval(() => {
      if (pausedRef.current || !spinningRef.current || finishedRef.current) return;
      setPos((p) => (p + 1) % data.entries.length);
    }, step);
    return () => window.clearInterval(id);
  }, [data.entries.length, data.stepMs, reduce]);

  const stop = (e: React.MouseEvent) => {
    if (paused || !spinning || finishedRef.current) return;
    setSpinning(false);
    playSound("click");
    const entry = data.entries[pos];
    const at = { x: e.clientX, y: e.clientY };
    window.setTimeout(() => {
      if (entry.obvious) {
        judge(`vault-reel-${entry.id}`, false, 1, 0, { title: "The Guess-o-Tron ATE it!", explanation: entry.obvious }, at);
        setSpinning(true);
      } else {
        judge(`vault-reel-${entry.id}`, true, 0, 0, undefined, at);
        const next = strong + 1;
        setStrong(next);
        if (next >= data.target && !finishedRef.current) {
          finishedRef.current = true;
          playSound("lock");
          window.setTimeout(done, 700);
        } else {
          window.setTimeout(() => setSpinning(true), reduce ? 350 : 650);
        }
      }
    }, 250);
  };

  const entry = data.entries[pos];

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, minHeight: 0, justifyContent: "center", alignItems: "center" }}>
      <PhaseHint accent={accent} text="The reel is spinning passwords. STOP it on the un-guessable ones — his Guess-o-Tron eats anything obvious!" />

      {/* Reel window */}
      <div
        style={{
          width: "100%", maxWidth: 420, borderRadius: 16, overflow: "hidden",
          border: `3px solid ${accent}88`, boxShadow: `0 0 30px ${accent}33, 0 16px 36px -14px rgba(0,0,0,0.8)`,
          background: "rgba(6,8,20,0.85)",
        }}
      >
        <div style={{ padding: "6px 0", textAlign: "center", fontFamily: MONO, fontSize: 9.5, fontWeight: 800, letterSpacing: "0.16em", color: "#9fb1ff", borderBottom: "1px solid rgba(122,140,255,0.3)" }}>
          PASSWORD REEL
        </div>
        <div style={{ height: 78, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
          <AnimatePresence mode="popLayout">
            <motion.div
              key={`${entry.id}-${pos}`}
              initial={reduce ? false : { y: -34, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={reduce ? undefined : { y: 34, opacity: 0 }}
              transition={{ duration: 0.16 }}
              style={{ fontFamily: MONO, fontSize: 24, fontWeight: 900, color: spinning ? "#e7ecff" : entry.obvious ? "#ff9bcb" : "#7eff97" }}
            >
              {entry.text}
            </motion.div>
          </AnimatePresence>
          <span aria-hidden style={{ position: "absolute", left: 10, color: accent, fontSize: 18 }}>▶</span>
          <span aria-hidden style={{ position: "absolute", right: 10, color: accent, fontSize: 18 }}>◀</span>
        </div>
      </div>

      <motion.button
        onClick={stop}
        disabled={paused || !spinning}
        whileTap={reduce ? undefined : { scale: 0.9 }}
        style={{
          padding: "18px 52px", borderRadius: 999, cursor: "pointer", touchAction: "manipulation",
          fontFamily: "inherit", fontSize: 24, fontWeight: 900, letterSpacing: "0.1em",
          background: "radial-gradient(circle at 50% 28%, #ff6b6b, #b91c2e)",
          border: "4px solid #ff9d9d", color: "#fff",
          boxShadow: "0 14px 34px -8px rgba(217,47,62,0.85)",
          opacity: spinning ? 1 : 0.55,
        }}
      >
        STOP!
      </motion.button>

      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        {strong} / {data.target} UN-GUESSABLE PASSWORDS BANKED
      </div>
    </div>
  );
}

/* ────────────────────────── PHASE 5 · FINAL ────────────────────────── */

function FinalPhase({ data, judge, done, reduce, accent }: { data: VaultData["final"]; judge: JudgeFn; done: () => void; reduce: boolean; accent: string }) {
  const [picked, setPicked] = useState<string[]>([]);
  const [boosted, setBoosted] = useState<string[]>([]);
  const [step, setStep] = useState<"words" | "boost" | "sweet">("words");
  const finishedRef = useRef(false);

  const base = picked.map((id) => data.words.find((w) => w.id === id)!.text).join("-");
  const display = useMemo(() => {
    let s = base;
    if (boosted.length > 0) s = s.charAt(0).toUpperCase() + s.slice(1);
    if (boosted.length > 1) s = `${s}7`;
    if (boosted.length > 2) s = `${s}!`;
    return s;
  }, [base, boosted]);

  const pickWord = (w: VaultData["final"]["words"][number], e: React.MouseEvent) => {
    if (step !== "words" || picked.includes(w.id)) return;
    const at = { x: e.clientX, y: e.clientY };
    if (w.trap) {
      judge(`vault-final-${w.id}`, false, 1, 0, { title: "The machine would guess that instantly!", explanation: w.trap }, at);
      return;
    }
    playSound("pop");
    judge(`vault-final-${w.id}`, true, 0, 0, undefined, at);
    const next = [...picked, w.id];
    setPicked(next);
    if (next.length >= 3) window.setTimeout(() => setStep("boost"), 500);
  };

  const boost = (b: VaultData["final"]["boosters"][number], e: React.MouseEvent) => {
    if (step !== "boost" || boosted.includes(b.id)) return;
    playSound("pop");
    judge(`vault-final-${b.id}`, true, 0, 0, undefined, { x: e.clientX, y: e.clientY });
    const next = [...boosted, b.id];
    setBoosted(next);
    if (next.length >= data.boosters.length) window.setTimeout(() => setStep("sweet"), 500);
  };

  const sweet = (tell: boolean, e: React.MouseEvent) => {
    if (step !== "sweet" || finishedRef.current) return;
    const at = { x: e.clientX, y: e.clientY };
    if (tell) {
      judge(`vault-final-tell`, false, 1, 0, { title: "Nice try, Raccoon!", explanation: data.tellExplanation }, at);
      return;
    }
    judge(`vault-final-refuse`, true, 0, 0, undefined, at);
    finishedRef.current = true;
    playSound("lock");
    window.setTimeout(done, 700);
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minHeight: 0, justifyContent: "center" }}>
      <PhaseHint
        accent={accent}
        text={
          step === "words"
            ? "The final lock! Pick THREE random words he could never guess."
            : step === "boost"
              ? "Now MIX it - hit all three boosters!"
              : "One last trick up his sleeve…"
        }
      />

      {/* The forged password */}
      <div style={{ margin: "0 auto", width: "100%", maxWidth: 560, textAlign: "center" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: "0.14em", color: "#9fb1ff", marginBottom: 4 }}>THE 400-YEAR PASSWORD</div>
        <div
          style={{
            minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center",
            padding: "8px 14px", borderRadius: 12,
            background: "rgba(6,8,20,0.8)", border: `2px solid ${accent}66`, boxShadow: `0 0 22px ${accent}33`,
            fontFamily: MONO, fontSize: display.length > 24 ? 15 : 19, fontWeight: 900, color: "#7eff97", wordBreak: "break-all",
          }}
        >
          {display || "· · ·"}
        </div>
      </div>

      {step === "words" && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "center", maxWidth: 600, margin: "0 auto" }}>
          {data.words.map((w) => {
            const used = picked.includes(w.id);
            return (
              <motion.button
                key={w.id}
                onClick={(e) => pickWord(w, e)}
                disabled={used}
                whileHover={used || reduce ? undefined : { scale: 1.06 }}
                whileTap={reduce ? undefined : { scale: 0.93 }}
                style={{
                  padding: "12px 17px", borderRadius: 11, cursor: used ? "default" : "pointer",
                  touchAction: "manipulation", fontFamily: MONO, fontSize: 15, fontWeight: 900,
                  background: used ? "rgba(52,211,153,0.2)" : "linear-gradient(180deg, #2e3a7e, #1d2557)",
                  border: used ? "2px solid #34d399" : "2px solid rgba(140,155,255,0.6)",
                  color: used ? "#7eff97" : "#eef1ff",
                  opacity: used ? 0.6 : 1,
                }}
              >
                {w.text}
              </motion.button>
            );
          })}
        </div>
      )}

      {step === "boost" && (
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          {data.boosters.map((b) => {
            const used = boosted.includes(b.id);
            return (
              <motion.button
                key={b.id}
                onClick={(e) => boost(b, e)}
                disabled={used}
                whileHover={used || reduce ? undefined : { scale: 1.07 }}
                whileTap={reduce ? undefined : { scale: 0.9 }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 5,
                  padding: "16px 22px", borderRadius: 14, cursor: used ? "default" : "pointer",
                  touchAction: "manipulation", fontFamily: "inherit", fontSize: 14.5, fontWeight: 900,
                  background: used ? "rgba(52,211,153,0.2)" : "linear-gradient(180deg, #ffcf5e, #d97706)",
                  border: used ? "2px solid #34d399" : "2.5px solid #ffe1a1",
                  color: used ? "#7eff97" : "#fff",
                  boxShadow: used ? "none" : "0 12px 26px -10px rgba(245,158,11,0.8)",
                }}
              >
                <PixIcon emoji={b.icon} size={28} />
                {b.label} {used && "✓"}
              </motion.button>
            );
          })}
        </div>
      )}

      {step === "sweet" && (
        <div style={{ margin: "0 auto", maxWidth: 460, width: "100%", textAlign: "center" }}>
          <div
            style={{
              padding: "16px 18px", borderRadius: 14, marginBottom: 12,
              background: "linear-gradient(180deg, rgba(56,22,72,0.95), rgba(34,13,48,0.96))",
              border: "2px solid #c084fc", color: "#f1e4ff", fontSize: 16.5, fontWeight: 800, fontStyle: "italic", lineHeight: 1.4,
            }}
          >
            🦝 “{data.sweetTalk}”
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <motion.button
              onClick={(e) => sweet(false, e)}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              style={{ padding: "16px 30px", borderRadius: 14, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit", fontSize: 18, fontWeight: 900, background: "radial-gradient(circle at 50% 28%, #47e08a, #15803d)", border: "3px solid #a0ffb0", color: "#fff" }}
            >
              🤐 {data.refuse}
            </motion.button>
            <motion.button
              onClick={(e) => sweet(true, e)}
              whileTap={reduce ? undefined : { scale: 0.9 }}
              style={{ padding: "16px 30px", borderRadius: 14, cursor: "pointer", touchAction: "manipulation", fontFamily: "inherit", fontSize: 15, fontWeight: 900, background: "linear-gradient(180deg, #ffe9a8, #f5c854)", border: "2px solid #ffdf8e", color: "#4a3208" }}
            >
              ✨ Tell him… just this once
            </motion.button>
          </div>
        </div>
      )}

      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#9fb1ff", textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
        {step === "words" ? `${picked.length} / 3 WORDS` : step === "boost" ? `${boosted.length} / ${data.boosters.length} BOOSTERS` : "FINAL ANSWER…"}
      </div>
    </div>
  );
}
