"use client";

/**
 * ProfileForgeBoss — Week 2's bespoke BUILD-FINAL boss: "The Profile Forge".
 *
 * Not a quiz. The child assembles their Cyber Heroes World profile LIVE
 * while the Hacker Raccoon besieges it — five phases, each a DIFFERENT
 * micro-game, one per concept:
 *
 *   1. WHACK     - his pre-filled entries fly at the form; swat the
 *                  private ones, let the safe ones dock.
 *   2. HAND      - he fans out About-Me cards; pick only the safe ones.
 *   3. GRILL     - his "Security Bot" popup demands your number; mash
 *                  the WHY? button until the excuses collapse. (Breather
 *                  phase - no fail state, pure ritual.)
 *   4. ASSEMBLE  - rebuild your hero name from tiles while planted
 *                  leak-tiles pulse temptingly.
 *   5. RAPID     - mask off: quick-fire demands; NOPE the private ones,
 *                  SHARE the genuinely safe asks.
 *
 * Reporting speaks BossBattle's exact dialects (BossQuestionOutcome per
 * judgment, BossEndStats + phaseResults at the end), so the parent
 * dashboard, analytics and XP flow are untouched. There is no lose
 * state: wrong answers teach (WrongAnswerPanel) and count against
 * accuracy, but the siege always ends with a blank form for the Raccoon.
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

type Stage = "intro" | "announce" | "play" | "victory";

const RACCOON = {
  idle: "/game/characters/raccoon-idle.png",
  taunt: "/game/characters/raccoon-taunt.png",
  hurt: "/game/characters/raccoon-hurt.png",
  defeated: "/game/characters/raccoon-defeated.png",
} as const;

/** Raccoon voice clips baked for the boss (Callum). Raw Audio is capped
 *  and mute-gated per the audio contract — never full-volume. */
function playVillain(file: string) {
  if (typeof window === "undefined" || isAudioMuted()) return;
  const el = new Audio(`/audio/villain/${file}.mp3`);
  el.volume = 0.45;
  void el.play().catch(() => {});
}

const PHASE_ORDER = ["whack", "hand", "grill", "assemble", "rapid"] as const;
type PhaseKey = (typeof PHASE_ORDER)[number];

const MONO = "'JetBrains Mono', ui-monospace, Menlo, monospace";
const ROUNDED = "ui-rounded, 'Fredoka', 'Quicksand', system-ui, sans-serif";

export default function ProfileForgeBoss({
  forge,
  bossName = "HACKER RACCOON",
  onEnd,
  onQuestionAnswered,
}: ProfileForgeBossProps) {
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const [stage, setStage] = useState<Stage>("intro");
  const [phaseIdx, setPhaseIdx] = useState(0);
  const [scheme, setScheme] = useState(100);
  const [stamped, setStamped] = useState<PhaseKey[]>([]);
  const [raccoonMood, setRaccoonMood] = useState<keyof typeof RACCOON>("taunt");
  const [raccoonLine, setRaccoonLine] = useState<string | null>(null);
  const [teach, setTeach] = useState<null | { title: string; explanation: string }>(null);

  const phaseKey = PHASE_ORDER[phaseIdx];
  const phaseMeta = useMemo(
    () =>
      ({
        whack: forge.whack,
        hand: forge.hand,
        grill: forge.grill,
        assemble: forge.assemble,
        rapid: forge.rapid,
      }) as const,
    [forge],
  );

  const startTs = useRef<number>(0);
  const position = useRef(0);
  const statsRef = useRef<Map<string, BossPhaseResult>>(new Map());
  useEffect(() => {
    const m = new Map<string, BossPhaseResult>();
    for (const k of PHASE_ORDER) {
      const p = phaseMeta[k];
      m.set(p.id, { phaseId: p.id, label: p.label, correctCount: 0, wrongCount: 0, totalQuestions: 0 });
    }
    statsRef.current = m;
  }, [phaseMeta]);

  const moodTimer = useRef<number | null>(null);
  const flashMood = useCallback((mood: keyof typeof RACCOON, line: string | null, ms = 1800) => {
    setRaccoonMood(mood);
    setRaccoonLine(line);
    if (moodTimer.current) window.clearTimeout(moodTimer.current);
    moodTimer.current = window.setTimeout(() => {
      setRaccoonMood("idle");
      setRaccoonLine(null);
    }, ms);
  }, []);

  /** Central judgment: tallies, sounds, raccoon reaction, persistence. */
  const judge = useCallback(
    (key: string, wasCorrect: boolean, selectedIndex: number, correctIndex: number, teachOnWrong?: { title: string; explanation: string }) => {
      const p = phaseMeta[PHASE_ORDER[phaseIdx]];
      const stat = statsRef.current.get(p.id);
      if (stat) {
        stat.totalQuestions += 1;
        if (wasCorrect) stat.correctCount += 1;
        else stat.wrongCount += 1;
      }
      position.current += 1;
      onQuestionAnswered?.({
        key,
        selectedIndex,
        correctIndex,
        wasCorrect,
        position: position.current,
        phaseId: p.id,
      });
      if (wasCorrect) {
        playSound("correct");
        flashMood("hurt", null, 900);
      } else {
        playSound("wrong");
        flashMood("taunt", "So CLOSE to a secret!", 1600);
        if (teachOnWrong) setTeach(teachOnWrong);
      }
    },
    [phaseIdx, phaseMeta, onQuestionAnswered, flashMood],
  );

  const beginBattle = () => {
    startTs.current = performance.now();
    playSound("phaseChange");
    playVillain("intro");
    setStage("announce");
  };

  // Announcement auto-advances into play.
  useEffect(() => {
    if (stage !== "announce") return;
    const id = window.setTimeout(() => setStage("play"), reduce ? 1200 : 2600);
    return () => window.clearTimeout(id);
  }, [stage, phaseIdx, reduce]);

  const phaseDone = useCallback(() => {
    const key = PHASE_ORDER[phaseIdx];
    playSound("bossHurt");
    playVillain(`taunt-${Math.min(phaseIdx + 1, 6)}`);
    setStamped((s) => (s.includes(key) ? s : [...s, key]));
    setScheme((v) => Math.max(0, v - 20));
    flashMood("hurt", phaseFoiledLine(key, phaseMeta), 2200);
    window.setTimeout(() => {
      if (phaseIdx + 1 >= PHASE_ORDER.length) {
        playSound("bossDefeated");
        playVillain("defeat");
        setRaccoonMood("defeated");
        setRaccoonLine(null);
        setStage("victory");
        playSound("victory");
      } else {
        playSound("phaseChange");
        setPhaseIdx((i) => i + 1);
        setStage("announce");
      }
    }, reduce ? 900 : 2000);
  }, [phaseIdx, phaseMeta, flashMood, reduce]);

  const finish = () => {
    const phaseResults = PHASE_ORDER.map((k) => statsRef.current.get(phaseMeta[k].id)!).filter(Boolean);
    const totals = phaseResults.reduce(
      (acc, r) => ({ q: acc.q + r.totalQuestions, c: acc.c + r.correctCount, w: acc.w + r.wrongCount }),
      { q: 0, c: 0, w: 0 },
    );
    const stats: BossEndStats = {
      combo: 0,
      accuracy: totals.q > 0 ? Math.round((totals.c / totals.q) * 100) : 100,
      xp: totals.c * 10,
      totalQuestions: totals.q,
      correctCount: totals.c,
      wrongCount: totals.w,
      durationMs: Math.round(performance.now() - startTs.current),
      phaseResults,
    };
    onEnd?.(true, stats);
  };

  const currentPhase = phaseMeta[phaseKey];

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background:
          "radial-gradient(ellipse at 50% 18%, rgba(124,92,255,0.22) 0%, transparent 55%), linear-gradient(180deg, #0b1026 0%, #131a3e 55%, #0a0e24 100%)",
        color: "#e7ecff",
        fontFamily: ROUNDED,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Top chrome: scheme meter + phase dots ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px 8px" }}>
        <span style={{ fontFamily: MONO, fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: "#ff9bcb", whiteSpace: "nowrap" }}>
          {bossName}&apos;S SCHEME
        </span>
        <div
          role="progressbar"
          aria-valuenow={scheme}
          aria-valuemin={0}
          aria-valuemax={100}
          style={{ flex: 1, height: 14, borderRadius: 999, background: "rgba(8,10,22,0.8)", border: "1px solid rgba(255,95,179,0.4)", overflow: "hidden" }}
        >
          <motion.div
            animate={{ width: `${scheme}%` }}
            transition={reduce ? { duration: 0 } : { type: "spring", stiffness: 90, damping: 20 }}
            style={{ height: "100%", background: "linear-gradient(90deg, #ff5fb3, #ff8f6b)", borderRadius: 999 }}
          />
        </div>
        <div style={{ display: "flex", gap: 5 }} aria-label={`Phase ${Math.min(phaseIdx + 1, 5)} of 5`}>
          {PHASE_ORDER.map((k, i) => (
            <span
              key={k}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: stamped.includes(k) ? "#7eff97" : i === phaseIdx && stage !== "intro" ? "#ffd158" : "rgba(255,255,255,0.18)",
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Arena row: raccoon + profile card ── */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "0 16px", minHeight: 118 }}>
        <div style={{ position: "relative", width: 96, flexShrink: 0, textAlign: "center" }}>
          <motion.img
            key={raccoonMood}
            src={RACCOON[raccoonMood]}
            alt="The Hacker Raccoon"
            initial={reduce ? false : { scale: 0.92, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ width: 96, height: "auto", filter: "drop-shadow(0 8px 14px rgba(0,0,0,0.6))" }}
          />
          <AnimatePresence>
            {raccoonLine && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  position: "absolute",
                  left: 86,
                  top: 2,
                  width: 150,
                  padding: "6px 9px",
                  borderRadius: 10,
                  background: "rgba(50,20,64,0.94)",
                  border: "1px solid #c084fc",
                  color: "#ebd6ff",
                  fontSize: 11,
                  fontWeight: 700,
                  fontStyle: "italic",
                  lineHeight: 1.3,
                  textAlign: "left",
                  zIndex: 5,
                }}
              >
                “{raccoonLine}”
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ flex: 1 }} />

        {/* The assembling profile card */}
        <div
          style={{
            width: 210,
            flexShrink: 0,
            borderRadius: 12,
            padding: "8px 12px 10px",
            background: "rgba(10,14,34,0.85)",
            border: "1px solid rgba(122,140,255,0.45)",
            fontFamily: MONO,
          }}
        >
          <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.14em", color: "#7df0ff", marginBottom: 6, textAlign: "center" }}>
            YOUR PROFILE
          </div>
          {PHASE_ORDER.map((k) => {
            const p = phaseMeta[k];
            const done = stamped.includes(k);
            const isCurrent = k === phaseKey && stage !== "intro" && !done;
            return (
              <div key={k} style={{ marginBottom: 4, opacity: done ? 1 : isCurrent ? 0.95 : 0.4 }}>
                <div style={{ fontSize: 8, fontWeight: 800, letterSpacing: "0.1em", color: done ? "#7eff97" : isCurrent ? "#ffd158" : "#5d689e" }}>
                  {p.label.toUpperCase()}
                </div>
                <motion.div
                  initial={false}
                  animate={done && !reduce ? { scale: [1.25, 1] } : undefined}
                  style={{ fontSize: 10.5, fontWeight: 800, color: done ? "#e7ecff" : "#4d578a" }}
                >
                  {done ? `✓ ${p.stamp}` : isCurrent ? "…under attack…" : "· · ·"}
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Stage area ── */}
      <div style={{ flex: 1, position: "relative", padding: "8px 16px 16px", display: "flex", flexDirection: "column" }}>
        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.div
              key="intro"
              initial={reduce ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ margin: "auto", maxWidth: 460, textAlign: "center" }}
            >
              <h2 style={{ margin: "0 0 10px", fontSize: 28, fontWeight: 900, background: "linear-gradient(135deg, #ff5fb3, #7c5cff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                THE PROFILE FORGE
              </h2>
              <p style={{ margin: "0 0 6px", fontSize: 15.5, lineHeight: 1.5, fontWeight: 700 }}>
                Time to build your Cyber Heroes World profile — but the Raccoon wants it FULL of your secrets.
              </p>
              <p style={{ margin: "0 0 18px", fontSize: 14, lineHeight: 1.5, color: "#9fb1ff", fontWeight: 700 }}>
                Survive his five tricks. Give him <strong style={{ color: "#7eff97" }}>NOTHING</strong>.
              </p>
              <GameButton variant="primary" size="lg" onClick={beginBattle}>
                Fire up the Forge →
              </GameButton>
            </motion.div>
          )}

          {stage === "announce" && (
            <motion.div
              key={`announce-${phaseIdx}`}
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: reduce ? 1 : 1.06 }}
              style={{ margin: "auto", textAlign: "center", maxWidth: 480 }}
            >
              <div style={{ fontFamily: MONO, fontSize: 12, fontWeight: 800, letterSpacing: "0.2em", color: "#ffd158", marginBottom: 8 }}>
                PHASE {phaseIdx + 1} OF 5
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, marginBottom: 10, color: "#fff7e6" }}>{currentPhase.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#c9a8e8", fontStyle: "italic" }}>
                🦝 “{currentPhase.intro}”
              </div>
            </motion.div>
          )}

          {stage === "play" && (
            <motion.div
              key={`play-${phaseIdx}`}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              {phaseKey === "whack" && <WhackPhase data={forge.whack} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} />}
              {phaseKey === "hand" && <HandPhase data={forge.hand} judge={judge} done={phaseDone} reduce={reduce} />}
              {phaseKey === "grill" && <GrillPhase data={forge.grill} judge={judge} done={phaseDone} reduce={reduce} />}
              {phaseKey === "assemble" && <AssemblePhase data={forge.assemble} judge={judge} done={phaseDone} reduce={reduce} />}
              {phaseKey === "rapid" && <RapidPhase data={forge.rapid} paused={!!teach} judge={judge} done={phaseDone} reduce={reduce} />}
            </motion.div>
          )}

          {stage === "victory" && (
            <motion.div
              key="victory"
              initial={reduce ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ margin: "auto", textAlign: "center", maxWidth: 460 }}
            >
              {/* The printout gag */}
              <motion.div
                initial={reduce ? false : { y: -60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: reduce ? 0 : 0.4, type: "spring", stiffness: 120, damping: 16 }}
                style={{
                  margin: "0 auto 16px",
                  width: 250,
                  padding: "14px 16px",
                  borderRadius: 4,
                  background: "#f7f4ea",
                  color: "#3b3a33",
                  fontFamily: MONO,
                  boxShadow: "0 14px 30px -12px rgba(0,0,0,0.7)",
                  transform: "rotate(-2deg)",
                }}
              >
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.1em", borderBottom: "1.5px dashed #b9b4a2", paddingBottom: 5, marginBottom: 7 }}>
                  RACCOON INTEL REPORT
                </div>
                {["NAME", "ADDRESS", "SCHOOL", "PHONE"].map((f) => (
                  <div key={f} style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, fontWeight: 700, padding: "2px 0" }}>
                    <span>{f}:</span>
                    <span style={{ color: "#b91c1c", fontWeight: 900 }}>BLANK</span>
                  </div>
                ))}
                <div style={{ marginTop: 7, fontSize: 11, fontWeight: 900, color: "#b91c1c", letterSpacing: "0.06em" }}>
                  SCHEME STATUS: FOILED
                </div>
              </motion.div>

              <h2 style={{ margin: "0 0 8px", fontSize: 26, fontWeight: 900, background: "linear-gradient(135deg, #7eff97, #00e5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                The form came back BLANK!
              </h2>
              <p style={{ margin: "0 0 16px", fontSize: 14.5, fontWeight: 700, color: "#9fe9ff" }}>
                Profile forged. Secrets guarded. Raccoon: rejected.
              </p>
              <GameButton variant="success" size="lg" onClick={finish}>
                Claim the win →
              </GameButton>
            </motion.div>
          )}
        </AnimatePresence>

        {teach && (
          <WrongAnswerPanel
            title={teach.title}
            explanation={teach.explanation}
            onContinue={() => setTeach(null)}
          />
        )}
      </div>
    </div>
  );
}

function phaseFoiledLine(key: PhaseKey, meta: Record<PhaseKey, { label: string }>): string {
  const lines: Record<PhaseKey, string> = {
    whack: "My beautiful pre-filled form! RUINED!",
    hand: "Favourites?! I can't USE favourites!",
    grill: "Stop asking WHY! It's SO unfair!",
    assemble: "CometWizard WHO?! That's not a NAME!",
    rapid: "NOTHING?! I got... NOTHING?!",
  };
  void meta;
  return lines[key];
}

/* ────────────────────────── PHASE 1 · WHACK ────────────────────────── */

function WhackPhase({
  data,
  paused,
  judge,
  done,
  reduce,
}: {
  data: ForgeData["whack"];
  paused: boolean;
  judge: (key: string, wasCorrect: boolean, sel: number, cor: number, teach?: { title: string; explanation: string }) => void;
  done: () => void;
  reduce: boolean;
}) {
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [docked, setDocked] = useState<string[]>([]);
  const entry = data.entries[idx];
  const finishedRef = useRef(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  const advance = useCallback(() => {
    setProgress(0);
    setIdx((i) => {
      if (i + 1 >= data.entries.length && !finishedRef.current) {
        finishedRef.current = true;
        window.setTimeout(done, 400);
      }
      return i + 1;
    });
  }, [data.entries.length, done]);

  // Flight timer: ~4.5s per entry (slower under reduced motion).
  useEffect(() => {
    if (!entry) return;
    const flightMs = reduce ? 7000 : 4500;
    const tick = 50;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setProgress((p) => Math.min(1, p + tick / flightMs));
    }, tick);
    return () => window.clearInterval(id);
  }, [idx, entry, reduce]);

  // Entry docked (timer ran out).
  useEffect(() => {
    if (progress < 1 || !entry) return;
    if (entry.isPrivate) {
      judge(`forge-whack-${entry.id}`, false, 0, 1, {
        title: "It docked! That one was PRIVATE",
        explanation: entry.explanation,
      });
    } else {
      judge(`forge-whack-${entry.id}`, true, 0, 0);
      setDocked((d) => [...d, entry.id]);
    }
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  const whack = () => {
    if (!entry || paused) return;
    if (entry.isPrivate) {
      judge(`forge-whack-${entry.id}`, true, 1, 1);
      playSound("hitImpact");
    } else {
      judge(`forge-whack-${entry.id}`, false, 1, 0, {
        title: "Oops - that one was fine!",
        explanation: entry.explanation,
      });
    }
    advance();
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
      <PhaseHint text="He's pre-filling YOUR form! WHACK the private stuff — let the safe stuff through." />
      <div
        style={{
          position: "relative",
          flex: 1,
          minHeight: 150,
          borderRadius: 16,
          background: "rgba(10,14,34,0.7)",
          border: "1px solid rgba(122,140,255,0.35)",
          overflow: "hidden",
        }}
      >
        {/* The form dock on the left */}
        <div
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            width: 108,
            padding: "8px 9px",
            borderRadius: 10,
            background: "#eef1ff",
            color: "#39406b",
            fontFamily: MONO,
            fontSize: 8.5,
            fontWeight: 800,
          }}
        >
          <div style={{ letterSpacing: "0.08em", marginBottom: 4 }}>PROFILE FORM</div>
          {docked.slice(-3).map((id) => {
            const e = data.entries.find((x) => x.id === id);
            return (
              <div key={id} style={{ padding: "2px 4px", marginBottom: 2, borderRadius: 4, background: "#d9f7e3", color: "#166534", fontSize: 8 }}>
                ✓ {e?.text}
              </div>
            );
          })}
          {docked.length === 0 && <div style={{ color: "#8b93bd" }}>waiting…</div>}
        </div>

        {/* Flying entry */}
        <AnimatePresence>
          {entry && (
            <motion.button
              key={entry.id}
              onClick={whack}
              disabled={paused}
              initial={reduce ? false : { opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduce ? undefined : { opacity: 0, scale: 0.6, rotate: -18 }}
              whileTap={reduce ? undefined : { scale: 0.9, rotate: -6 }}
              aria-label={`Flying entry: ${entry.text}. Tap to whack it away.`}
              style={{
                position: "absolute",
                top: "50%",
                // Flies right → left: spawns at ~86% and docks beside the
                // form at ~14% as progress runs 0 → 1.
                left: `${14 + (1 - progress) * 72}%`,
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: 7,
                padding: "10px 13px",
                borderRadius: 12,
                cursor: "pointer",
                touchAction: "manipulation",
                fontFamily: "inherit",
                background: "linear-gradient(180deg, #ffe9a8 0%, #f5c854 100%)",
                border: "2px solid #ffdf8e",
                boxShadow: "0 0 16px rgba(255,214,110,0.5)",
                color: "#4a3208",
                fontSize: 13.5,
                fontWeight: 900,
                whiteSpace: "nowrap",
              }}
            >
              <PixIcon emoji={entry.icon} size={22} /> {entry.text}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#7d8cc9" }}>
        ENTRY {Math.min(idx + 1, data.entries.length)} / {data.entries.length} · TAP = WHACK
      </div>
    </div>
  );
}

/* ────────────────────────── PHASE 2 · HAND ────────────────────────── */

function HandPhase({
  data,
  judge,
  done,
  reduce,
}: {
  data: ForgeData["hand"];
  judge: (key: string, wasCorrect: boolean, sel: number, cor: number, teach?: { title: string; explanation: string }) => void;
  done: () => void;
  reduce: boolean;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const finishedRef = useRef(false);

  const pick = (card: ForgeData["hand"]["cards"][number]) => {
    if (picked.includes(card.id) || finishedRef.current) return;
    if (card.isSafe) {
      judge(`forge-hand-${card.id}`, true, 0, 0);
      const next = [...picked, card.id];
      setPicked(next);
      if (next.length >= data.picks && !finishedRef.current) {
        finishedRef.current = true;
        window.setTimeout(done, 500);
      }
    } else {
      judge(`forge-hand-${card.id}`, false, 1, 0, {
        title: "He slipped a trap into the hand!",
        explanation: card.explanation,
      });
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
      <PhaseHint text={`He's dealt you a hand. Pick ${data.picks} cards that are SAFE for your About Me.`} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 10, flex: 1, alignContent: "center" }}>
        {data.cards.map((card, i) => {
          const isPicked = picked.includes(card.id);
          return (
            <motion.button
              key={card.id}
              onClick={() => pick(card)}
              disabled={isPicked}
              initial={reduce ? false : { y: 22, opacity: 0, rotate: i % 2 ? 2 : -2 }}
              animate={{ y: 0, opacity: 1, rotate: isPicked ? 0 : i % 2 ? 1.5 : -1.5 }}
              transition={{ delay: reduce ? 0 : i * 0.07 }}
              whileHover={isPicked || reduce ? undefined : { y: -6, scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.95 }}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                padding: "14px 8px",
                borderRadius: 12,
                cursor: isPicked ? "default" : "pointer",
                touchAction: "manipulation",
                fontFamily: "inherit",
                background: isPicked
                  ? "linear-gradient(180deg, rgba(52,211,153,0.22), rgba(52,211,153,0.08))"
                  : "linear-gradient(180deg, #2a3573 0%, #1c2450 100%)",
                border: isPicked ? "2px solid #34d399" : "2px solid rgba(122,140,255,0.5)",
                color: isPicked ? "#7eff97" : "#e7ecff",
                fontSize: 13,
                fontWeight: 900,
                minHeight: 92,
                justifyContent: "center",
              }}
            >
              <PixIcon emoji={card.icon} size={28} />
              <span style={{ lineHeight: 1.25, textAlign: "center" }}>{card.text}</span>
              {isPicked && <span style={{ fontSize: 10, letterSpacing: "0.08em" }}>✓ ON THE PROFILE</span>}
            </motion.button>
          );
        })}
      </div>
      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#7d8cc9" }}>
        {picked.length} / {data.picks} SAFE CARDS PICKED
      </div>
    </div>
  );
}

/* ────────────────────────── PHASE 3 · GRILL ────────────────────────── */

function GrillPhase({
  data,
  judge,
  done,
  reduce,
}: {
  data: ForgeData["grill"];
  judge: (key: string, wasCorrect: boolean, sel: number, cor: number) => void;
  done: () => void;
  reduce: boolean;
}) {
  const [presses, setPresses] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const total = data.excuses.length;

  const why = () => {
    if (collapsed) return;
    playSound("click");
    const next = presses + 1;
    setPresses(next);
    if (next >= total) {
      setCollapsed(true);
      playSound("pop");
      judge(`forge-grill-${data.id}`, true, 0, 0);
      window.setTimeout(done, reduce ? 900 : 1800);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, alignItems: "center", justifyContent: "center" }}>
      <PhaseHint text="A 'Security Bot' wants your number. You know the hero question. ASK IT." />
      <motion.div
        animate={collapsed && !reduce ? { rotate: [0, -3, 3, -8, 0], scale: [1, 1, 0.9, 0.6, 0], opacity: [1, 1, 1, 0.7, 0] } : { rotate: presses * -1.5, scale: 1 - presses * 0.03 }}
        transition={{ duration: collapsed ? 1.1 : 0.3 }}
        style={{
          width: "100%",
          maxWidth: 380,
          borderRadius: 14,
          overflow: "hidden",
          border: "2px solid rgba(122,140,255,0.55)",
          boxShadow: "0 16px 36px -16px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "linear-gradient(135deg, #2a3573, #1c2450)" }}>
          <PixIcon emoji="🎭" size={20} />
          <span style={{ fontSize: 13, fontWeight: 900, color: "#fff7e6" }}>Totally Real Security Bot</span>
          <span style={{ marginLeft: "auto", fontSize: 16 }}>{presses >= 2 ? "😰" : presses >= 1 ? "😅" : "🤖"}</span>
        </div>
        <div style={{ padding: "14px 14px 16px", background: "linear-gradient(180deg, #eef1ff, #dde4ff)", color: "#1e2757", textAlign: "center" }}>
          <div style={{ fontSize: 14.5, fontWeight: 900, marginBottom: 8 }}>{data.demand}</div>
          <AnimatePresence mode="wait">
            <motion.div
              key={presses}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 12.5, fontWeight: 700, fontStyle: "italic", color: "#5b5f8a", minHeight: 34 }}
            >
              {collapsed ? data.collapse : `“${data.excuses[Math.min(presses, total - 1)]}”`}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      {!collapsed ? (
        <motion.button
          onClick={why}
          whileTap={reduce ? undefined : { scale: 0.92 }}
          style={{
            padding: "16px 40px",
            borderRadius: 999,
            cursor: "pointer",
            touchAction: "manipulation",
            fontFamily: "inherit",
            fontSize: 22,
            fontWeight: 900,
            letterSpacing: "0.08em",
            background: "linear-gradient(180deg, #ffd158, #f59e0b)",
            border: "3px solid #ffe9a8",
            boxShadow: "0 10px 26px -8px rgba(245,158,11,0.7)",
            color: "#4a3208",
          }}
        >
          WHY? 🤔
        </motion.button>
      ) : (
        <div style={{ fontSize: 15, fontWeight: 900, color: "#7eff97" }}>
          <PixIcon emoji="✋" size={20} /> REFUSED — a profile doesn&apos;t need your number!
        </div>
      )}
      <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#7d8cc9" }}>
        EXCUSES DEMOLISHED: {Math.min(presses, total)} / {total}
      </div>
    </div>
  );
}

/* ──────────────────────── PHASE 4 · ASSEMBLE ──────────────────────── */

function AssemblePhase({
  data,
  judge,
  done,
  reduce,
}: {
  data: ForgeData["assemble"];
  judge: (key: string, wasCorrect: boolean, sel: number, cor: number, teach?: { title: string; explanation: string }) => void;
  done: () => void;
  reduce: boolean;
}) {
  const safeTiles = useMemo(() => data.tiles.filter((t) => !t.trap), [data.tiles]);
  const [placed, setPlaced] = useState<string[]>([]);
  const finishedRef = useRef(false);

  const tap = (tile: ForgeData["assemble"]["tiles"][number]) => {
    if (placed.includes(tile.id) || finishedRef.current) return;
    if (tile.trap) {
      judge(`forge-assemble-${tile.id}`, false, 1, 0, {
        title: "LEAK! He planted that tile",
        explanation: tile.trap,
      });
      return;
    }
    playSound("pop");
    judge(`forge-assemble-${tile.id}`, true, 0, 0);
    const next = [...placed, tile.id];
    setPlaced(next);
    if (next.length >= safeTiles.length && !finishedRef.current) {
      finishedRef.current = true;
      playSound("lock");
      window.setTimeout(done, reduce ? 700 : 1400);
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
      <PhaseHint text="He scrambled your hero name — rebuild it! (He hid leaky tiles in the pile...)" />

      {/* Name slots */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {safeTiles.map((t) => {
          const isPlaced = placed.includes(t.id);
          return (
            <motion.div
              key={t.id}
              animate={isPlaced && !reduce ? { scale: [1.3, 1] } : undefined}
              style={{
                minWidth: 74,
                padding: "12px 12px",
                borderRadius: 12,
                textAlign: "center",
                fontSize: 17,
                fontWeight: 900,
                background: isPlaced ? "linear-gradient(180deg, rgba(0,229,255,0.2), rgba(0,229,255,0.08))" : "rgba(8,10,22,0.6)",
                border: isPlaced ? "2px solid #00e5ff" : "2px dashed rgba(122,140,255,0.5)",
                color: isPlaced ? "#7df0ff" : "#3d466f",
              }}
            >
              {isPlaced ? t.text : "?"}
            </motion.div>
          );
        })}
      </div>

      {/* Tile pile */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 9, justifyContent: "center" }}>
        {data.tiles.map((tile, i) => {
          const used = placed.includes(tile.id);
          return (
            <motion.button
              key={tile.id}
              onClick={() => tap(tile)}
              disabled={used}
              initial={reduce ? false : { opacity: 0, scale: 0.8 }}
              animate={{
                opacity: used ? 0.28 : 1,
                scale: 1,
                rotate: used ? 0 : (i % 3) - 1,
              }}
              transition={{ delay: reduce ? 0 : i * 0.05 }}
              whileHover={used || reduce ? undefined : { scale: 1.06 }}
              whileTap={reduce ? undefined : { scale: 0.94 }}
              style={{
                padding: "12px 16px",
                borderRadius: 12,
                cursor: used ? "default" : "pointer",
                touchAction: "manipulation",
                fontFamily: "inherit",
                fontSize: 15.5,
                fontWeight: 900,
                background: "linear-gradient(180deg, #2a3573 0%, #1c2450 100%)",
                border: "2px solid rgba(160,140,255,0.5)",
                color: "#e7ecff",
                animation: tile.trap && !used && !reduce ? "forgeTilePulse 1.6s ease-in-out infinite" : undefined,
              }}
            >
              {tile.text}
            </motion.button>
          );
        })}
      </div>

      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#7d8cc9" }}>
        {placed.length === safeTiles.length ? `${data.result} — SEALED!` : `${placed.length} / ${safeTiles.length} PARTS PLACED`}
      </div>
      <style>{`
        @keyframes forgeTilePulse {
          0%, 100% { box-shadow: 0 0 0 rgba(255,95,179,0); }
          50% { box-shadow: 0 0 16px rgba(255,95,179,0.55); }
        }
      `}</style>
    </div>
  );
}

/* ────────────────────────── PHASE 5 · RAPID ────────────────────────── */

function RapidPhase({
  data,
  paused,
  judge,
  done,
  reduce,
}: {
  data: ForgeData["rapid"];
  paused: boolean;
  judge: (key: string, wasCorrect: boolean, sel: number, cor: number, teach?: { title: string; explanation: string }) => void;
  done: () => void;
  reduce: boolean;
}) {
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
        window.setTimeout(done, 400);
      }
      return i + 1;
    });
  }, [data.demands.length, done]);

  useEffect(() => {
    if (!demand) return;
    const totalMs = (reduce ? data.secs * 2 : data.secs) * 1000;
    const tick = 50;
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setTimeLeft((t) => Math.max(0, t - tick / totalMs));
    }, tick);
    return () => window.clearInterval(id);
  }, [idx, demand, data.secs, reduce]);

  useEffect(() => {
    if (timeLeft > 0 || !demand) return;
    judge(`forge-rapid-${demand.id}`, false, -1, demand.isPrivate ? 1 : 0, {
      title: "Too slow - he snatched the moment!",
      explanation: demand.explanation,
    });
    advance();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft]);

  const answer = (nope: boolean) => {
    if (!demand || paused) return;
    const wasCorrect = nope === demand.isPrivate;
    judge(`forge-rapid-${demand.id}`, wasCorrect, nope ? 1 : 0, demand.isPrivate ? 1 : 0, wasCorrect ? undefined : {
      title: demand.isPrivate ? "That one was PRIVATE!" : "That one was actually fine!",
      explanation: demand.explanation,
    });
    advance();
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, justifyContent: "center" }}>
      <PhaseHint text="Mask off! Quick-fire demands: NOPE the private ones, SHARE the safe ones." />

      <AnimatePresence mode="wait">
        {demand && (
          <motion.div
            key={demand.id}
            initial={reduce ? false : { x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={reduce ? undefined : { x: -50, opacity: 0 }}
            style={{
              margin: "0 auto",
              maxWidth: 430,
              width: "100%",
              padding: "18px 18px 14px",
              borderRadius: 14,
              textAlign: "center",
              background: "linear-gradient(180deg, rgba(50,20,64,0.92), rgba(30,12,44,0.94))",
              border: "2px solid #c084fc",
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 900, color: "#ebd6ff", marginBottom: 12, lineHeight: 1.35 }}>
              🦝 “{demand.text}”
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(8,10,22,0.7)", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  width: `${timeLeft * 100}%`,
                  background: timeLeft > 0.4 ? "linear-gradient(90deg, #7eff97, #ffd158)" : "#ff5fb3",
                  borderRadius: 999,
                  transition: "width 60ms linear",
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <motion.button
          onClick={() => answer(true)}
          disabled={!demand || paused}
          whileTap={reduce ? undefined : { scale: 0.93 }}
          style={{
            padding: "16px 30px",
            borderRadius: 14,
            cursor: "pointer",
            touchAction: "manipulation",
            fontFamily: "inherit",
            fontSize: 18,
            fontWeight: 900,
            background: "radial-gradient(circle at 50% 30%, #ff6b6b, #b91c2e)",
            border: "3px solid #ff9d9d",
            color: "#fff",
          }}
        >
          ✋ NOPE!
        </motion.button>
        <motion.button
          onClick={() => answer(false)}
          disabled={!demand || paused}
          whileTap={reduce ? undefined : { scale: 0.93 }}
          style={{
            padding: "16px 30px",
            borderRadius: 14,
            cursor: "pointer",
            touchAction: "manipulation",
            fontFamily: "inherit",
            fontSize: 18,
            fontWeight: 900,
            background: "radial-gradient(circle at 50% 30%, #47e08a, #15803d)",
            border: "3px solid #a0ffb0",
            color: "#fff",
          }}
        >
          💬 SHARE
        </motion.button>
      </div>

      <div style={{ textAlign: "center", fontFamily: MONO, fontSize: 10.5, fontWeight: 800, color: "#7d8cc9" }}>
        DEMAND {Math.min(idx + 1, data.demands.length)} / {data.demands.length}
      </div>
    </div>
  );
}

/* ─────────────────────────── shared bits ─────────────────────────── */

function PhaseHint({ text }: { text: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        fontSize: 13.5,
        fontWeight: 800,
        color: "#9fe9ff",
        padding: "6px 10px",
        borderRadius: 999,
        background: "rgba(0,229,255,0.08)",
        border: "1px solid rgba(0,229,255,0.25)",
        alignSelf: "center",
      }}
    >
      {text}
    </div>
  );
}
