"use client";

/**
 * QuizBoss, THE STANDARD WEEK-ENDING TEST for all 20 weeks.
 *
 * The villain hosts a short set of apply-the-skill questions with light
 * boss-fight spectacle (a segmented health bar, comic hits, a beat-him
 * payoff) and ZERO bespoke game mechanics. ONE identical format every
 * week; a week authors only data (WeekContent.bossQuiz): one spoken
 * intro taunt, one question per taught concept (5 on the template), a
 * distinct villain reaction per right/wrong answer, and one spoken
 * victory payoff.
 *
 * THE FIGHT (one screen): intro -> ask (x5) -> victory.
 *   - CORRECT: the villain takes a comic hit (hurt pose + particle
 *     burst + cheerful sting), one health segment drains, +100 score,
 *     his distinct "ow" line plays, then the next question.
 *   - WRONG: a comic gloat (distinct line), then ONE kind teach line in
 *     WrongAnswerPanel, then the SAME question re-asks with the options
 *     reshuffled (mastery-gated: no fail-out, no score loss, ever).
 *
 * KID-FIRST CONTRACT (ages 6-9): one verb, TAP. Big targets (>=64px),
 * nothing timed, comic never scary. Every spoken line is authored
 * slug + text; until the clip is recorded, bossArena's TTS stand-in
 * speaks the text, and the text is ALWAYS mirrored on screen so the
 * quiz plays fully muted. Reduced motion drops shake/particles and
 * shortens every beat.
 *
 * Reporting speaks BossBattle's exact dialect: every judged attempt is
 * reported as `{key}-a{n}` with its authored phaseId (persisted
 * upstream as key@phaseId); the lowest-numbered attempt per concept is
 * the first-try-correct mastery signal for the parent report.
 * BossEndStats matches VaultBoss: +100 per correct, xp = score/10
 * (the lesson wrapper awards its flat 150 XP on top). No lose state.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { playSound, playBGM, stopBGM } from "@/app/lib/sounds";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";
import { useMotionIntensity } from "@/app/lib/gameEngine/useMotionIntensity";
import GameButton from "@/app/components/lesson/GameButton";
import PixIcon from "@/app/components/lesson/PixIcon";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import CodeRainBackground from "@/app/components/CodeRainBackground";
import type { WeekContent, BossQuizQuestion } from "@/app/lesson/weekContent/types";
import type { BossEndStats, BossPhaseResult } from "@/app/components/game/BossBattle";
import {
  MONO,
  ROUNDED,
  RACCOON,
  type RaccoonMood,
  playVillain,
  whenVillainQuiet,
  ParticleLayer,
  type ParticleAPI,
} from "@/app/components/game/bossArena";

export type QuizData = NonNullable<WeekContent["bossQuiz"]>;

/* Owner (2026-09-03): the narrator voice is OFF in the quiz-boss. Every
   line still shows as text on screen (read by the kid or a grown-up); we
   simply don't speak it. Flip QUIZ_VOICE to true, once real recorded clips
   exist, to bring the Raccoon's voice back. */
const QUIZ_VOICE: boolean = false;
function speakVillain(slug: string, text: string): void {
  // Voice OFF: the line is shown as text on screen (read by the kid or a
  // grown-up) and not spoken. `text` is kept in the signature for when
  // QUIZ_VOICE and real recorded clips return.
  void text;
  if (QUIZ_VOICE) playVillain(slug);
}

export interface QuizBossProps {
  quiz: QuizData;
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

type Stage = "intro" | "ask" | "victory" | "failed";

/** Same-every-week how-to line (the whole format IS the instruction). */
const HOW_TO_PLAY = "Tap the right answer to beat him!";

/** Spoken + on-screen option labels. Sarah reads "Is it option A… / Option B…
 *  / Or is it option C…" and each answer card wears the matching badge, so a
 *  6-9yo can follow by ear and by eye. Read order == display order (both seed
 *  qIdx*47+5), so the letters always line up. */
const OPTION_LETTERS = ["A", "B", "C", "D", "E"];

// "#e3b341" -> "227,179,65" so the canvas rain can be tinted to the week accent.
function hexRgb(hex: string): string {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const r = parseInt(n.slice(0, 2), 16), g = parseInt(n.slice(2, 4), 16), b = parseInt(n.slice(4, 6), 16);
  return [r, g, b].some(Number.isNaN) ? "227,179,65" : `${r},${g},${b}`;
}

// Faint drifting topic icons behind the intro (edge-placed as % of the
// arena, so they never crowd the centered content). Per-week `theme.motifs`
// fill these, so every week's intro reads as its own subject.
const MOTIF_SPOTS = [
  { x: 9, y: 15, s: 62, r: -12, drift: -10 },
  { x: 89, y: 13, s: 52, r: 13, drift: 12 },
  { x: 17, y: 41, s: 42, r: 8, drift: 9 },
  { x: 85, y: 45, s: 58, r: -9, drift: -8 },
  { x: 6, y: 71, s: 50, r: 15, drift: 11 },
  { x: 91, y: 73, s: 46, r: -14, drift: -12 },
  { x: 24, y: 87, s: 38, r: -6, drift: 8 },
  { x: 77, y: 88, s: 48, r: 10, drift: -9 },
  { x: 50, y: 7, s: 34, r: 0, drift: 7 },
  { x: 13, y: 57, s: 32, r: 20, drift: -7 },
] as const;

/** Default accent when a week forgets to author one (W1 gold). */
const DEFAULT_ACCENT = "#e3b341";

/** Deterministic display shuffle: answers are shuffled per question (seeded by
 *  qIdx), so the correct one isn't always in the same slot, but a given
 *  question always lays out the SAME way — including on a redo — so the spoken
 *  "option A/B/C" read-out stays lined up with the on-screen badges. */
function seededShuffle<T>(arr: readonly T[], seed: number): T[] {
  const out = [...arr];
  let s = (seed * 9301 + 49297) % 233280;
  for (let i = out.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export default function QuizBoss({ quiz, onEnd, onQuestionAnswered }: QuizBossProps) {
  const intensity = useMotionIntensity();
  const reduce = intensity < 1;

  const accent = quiz.accent ?? DEFAULT_ACCENT;
  const questions = quiz.questions;
  const total = questions.length;
  const passMark = quiz.passMark ?? 10;

  const [stage, setStage] = useState<Stage>("intro");
  const [qIdx, setQIdx] = useState(0);
  /** Bumps on a full-set redo: re-speaks each scenario. (It does NOT reshuffle
   *  the options — the layout is pinned to qIdx so the spoken A/B/C order keeps
   *  matching the badges; see seededShuffle + displayOptions.) */
  const [attemptNonce, setAttemptNonce] = useState(0);
  /** Questions beaten so far = health segments drained. */
  const [beaten, setBeaten] = useState(0);
  const [score, setScore] = useState(0);
  // How many times the child has fallen short of the pass mark. After a couple
  // of misses we offer a gentle "Keep going" escape (via onEnd(false)) so a
  // struggling kid is never hard-stuck on the boss with no way forward.
  const [failedTries, setFailedTries] = useState(0);
  const [judging, setJudging] = useState(false);
  // The answer options stay LOCKED until Sarah finishes reading the question,
  // so the child can't tap before/over the voice (which cut her off mid-read).
  // Set true by the ask-narration onDone (fires on end/block/error/safety),
  // reset per question below.
  const [askDone, setAskDone] = useState(false);
  const [raccoonMood, setRaccoonMood] = useState<RaccoonMood>("taunt");
  const [raccoonLine, setRaccoonLine] = useState<string | null>(null);
  /** The tapped answer during the brief reveal beat: highlights the picked
   *  option and flashes the correct one, then the fight advances. */
  const [picked, setPicked] = useState<null | { index: number; correctIndex: number; correct: boolean }>(null);
  /** Per-concept correct/total, snapshotted when the test ends (so the report
   *  screens never read the stats ref during render). */
  const [report, setReport] = useState<{ phaseId: string; label: string; correct: number; total: number }[]>([]);
  const [shakeNonce, setShakeNonce] = useState(0);
  const [popups, setPopups] = useState<{ id: number; text: string; colour: string; x: number; y: number }[]>([]);
  // The teach Sarah reads on the reveal (right AND wrong), mirrored on screen.
  // Null except during the brief reveal beat between a tap and the next
  // question — the fight waits for her to finish before advancing.
  const [explain, setExplain] = useState<null | { lines: string[]; correct: boolean }>(null);

  const arenaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ParticleAPI | null>(null);
  const popupSeq = useRef(0);
  const startTs = useRef(0);
  const position = useRef(0);
  const statsRef = useRef<Map<string, BossPhaseResult>>(new Map());
  /** Attempt counter per phase id, for the -a{n} key numbering. */
  const attemptsRef = useRef<Map<string, number>>(new Map());
  const timersRef = useRef<number[]>([]);
  // Reveal → explanation gating. Sarah explains EVERY answer and the fight
  // waits for her to finish (or a safety cap) before moving on, so she is
  // never cut off. `advancedRef` guards a single advance per reveal;
  // `pendingAdvanceRef` holds the step to run; `revealStart` enforces a short
  // minimum so the teach is seen even when audio is muted/blocked.
  const advancedRef = useRef(false);
  const pendingAdvanceRef = useRef<null | (() => void)>(null);
  const revealStart = useRef(0);
  // The reveal's advance-safety timer id, tracked so it's cleared the instant
  // the reveal advances — otherwise a stale timer from an earlier question
  // could fire during a later one and skip it forward.
  const revealSafetyRef = useRef<number | null>(null);

  // Advance / grade — runs ONCE per reveal, only after both Sarah's
  // explanation has finished (onDone) and a short minimum has elapsed.
  const runAdvance = useCallback(() => {
    if (advancedRef.current) return;
    const MIN = reduce ? 1100 : 2000;
    const elapsed = performance.now() - revealStart.current;
    if (elapsed < MIN) {
      timersRef.current.push(window.setTimeout(() => runAdvance(), MIN - elapsed));
      return;
    }
    advancedRef.current = true;
    if (revealSafetyRef.current !== null) {
      window.clearTimeout(revealSafetyRef.current);
      revealSafetyRef.current = null;
    }
    const step = pendingAdvanceRef.current;
    pendingAdvanceRef.current = null;
    step?.();
  }, [reduce]);

  const question: BossQuizQuestion | undefined = questions[qIdx];
  // Sarah reads the whole question aloud on the boss (accessibility for 6-9yo
  // non-readers) as a clear, playful multiple-choice: the scenario, then
  // "Is it option A… <answer>, Option B… <answer>, Or is it option C… <answer>",
  // then "So, what do you think?". The choices are read in the SAME shuffled
  // order they're shown (both seed qIdx*47+5), so the spoken A/B/C always line
  // up with the on-screen badges AND she never reads the correct one first.
  // Keep in lock-step with the generator's bossAsk read-out builder so the
  // recorded clip matches the manifest.
  const askLines = useMemo(() => {
    if (!question) return [];
    const ordered = seededShuffle(question.options, qIdx * 47 + 5);
    const lines: string[] = [question.ask.text];
    ordered.forEach((o, i) => {
      const last = i === ordered.length - 1;
      const lead = i === 0
        ? `Is it option ${OPTION_LETTERS[i]}...`
        : last
          ? `Or is it option ${OPTION_LETTERS[i]}...`
          : `Option ${OPTION_LETTERS[i]}...`;
      lines.push(lead, o.text);
    });
    lines.push("So, what do you think?");
    return lines;
  }, [question, qIdx]);
  const themeMotifs = quiz.theme?.motifs ?? [];
  /** The distinct taught concepts, in order, for the end-of-test report. */
  const conceptList = useMemo(() => {
    const seen = new Set<string>();
    const rows: { phaseId: string; label: string }[] = [];
    for (const q of quiz.questions) if (!seen.has(q.phaseId)) { seen.add(q.phaseId); rows.push({ phaseId: q.phaseId, label: q.label }); }
    return rows;
  }, [quiz]);

  useEffect(() => {
    const m = new Map<string, BossPhaseResult>();
    for (const q of quiz.questions) {
      m.set(q.phaseId, { phaseId: q.phaseId, label: q.label, correctCount: 0, wrongCount: 0, totalQuestions: 0 });
    }
    statsRef.current = m;
  }, [quiz]);

  /* Battle bed for the whole fight; every pending timer dies with the
     component. */
  useEffect(() => {
    // Epic-but-kid-friendly entrance sting as the showdown screen appears, then
    // the calm focus bed for the fight. The villain taunt follows ~700ms later.
    playSound("bossShowdown");
    playBGM("bgmQuizFocus");
    const timers = timersRef.current;
    return () => {
      stopBGM(400);
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  /* INTRO: the villain appears and speaks his one taunt (mirrored as
     text on the card, so it plays fine muted). */
  useEffect(() => {
    if (stage !== "intro") return;
    const id = window.setTimeout(() => {
      // (No roar — it startled young players; the intro opens calmly.)
      speakVillain(quiz.intro.slug, quiz.intro.text);
    }, reduce ? 250 : 700);
    return () => window.clearTimeout(id);
  }, [stage, quiz, reduce]);

  /* Lock the answer options while Sarah reads a NEW question (or retry); they
     re-open when she finishes (askDone via onDone). TWO safety nets so the
     child is NEVER stranded behind a lock that can't lift:
       - muted: there's no voice to wait for and the recorded onDone never
         fires, so unlock at once (the whole question is on screen as text);
       - otherwise: a generous read-time cap unlocks even if onDone never fires
         (captions-only, or a flaky audio engine), like the exercise intros. */
  useEffect(() => {
    if (stage !== "ask") { setAskDone(false); return; }
    if (isAudioMuted()) { setAskDone(true); return; }
    setAskDone(false);
    const maxMs = 6000 + askLines.length * 4500;
    const id = window.setTimeout(() => setAskDone(true), maxMs);
    return () => window.clearTimeout(id);
  }, [qIdx, attemptNonce, stage, askLines.length]);

  /* If the child mutes mid-question, the recorded voice stops and its onDone
     never comes — unlock the options right away rather than trapping them. */
  useEffect(() => subscribeAudioMute((muted) => {
    if (muted) setAskDone(true);
  }), []);

  /* Each ASK (and each retry): the villain speaks the scenario, queued
     behind whatever line he is finishing so audio never overlaps. */
  useEffect(() => {
    if (stage !== "ask") return;
    const q = questions[qIdx];
    if (!q) return;
    const cancel = whenVillainQuiet(() => speakVillain(q.ask.slug, q.ask.text));
    return cancel;
    // attemptNonce is a deliberate dep: a retry re-speaks the scenario.
  }, [stage, qIdx, attemptNonce, questions]);

  /* VICTORY: comic defeat, then the strict no-overlap sequence: his
     last "ow" line finishes, the victory sting plays, THEN his spoken
     payoff (the text is on the board the whole time for mute play). */
  useEffect(() => {
    if (stage !== "victory") return;
    playSound("bossDefeated");
    stopBGM(900);
    const rect = arenaRef.current?.getBoundingClientRect();
    particlesRef.current?.burst((rect?.width ?? 600) / 2, (rect?.height ?? 400) / 2.4, accent, reduce ? 0 : 44);
    const timers: number[] = [];
    const cancel = whenVillainQuiet(() => {
      playSound("victory");
      timers.push(window.setTimeout(() => speakVillain(quiz.victory.slug, quiz.victory.text), 2200));
    });
    return () => {
      cancel();
      timers.forEach((t) => window.clearTimeout(t));
    };
  }, [stage, quiz, accent, reduce]);

  const shake = useCallback(() => setShakeNonce((n) => n + 1), []);

  const addPopup = useCallback((text: string, colour: string, x: number, y: number) => {
    const id = ++popupSeq.current;
    setPopups((p) => [...p.slice(-5), { id, text, colour, x, y }]);
    window.setTimeout(() => setPopups((p) => p.filter((q) => q.id !== id)), 950);
  }, []);

  const start = () => {
    playSound("select");
    playSound("phaseChange");
    startTs.current = performance.now();
    setStage("ask");
  };

  /** Options in display order. Seeded by qIdx only (NOT attemptNonce) so the
   *  layout matches the recorded read-out's A/B/C order every time — a redo
   *  keeps the same letters rather than desyncing the voice from the badges. */
  const displayOptions = useMemo(() => {
    if (!question) return [];
    const tagged = question.options.map((opt, origIdx) => ({ opt, origIdx }));
    return seededShuffle(tagged, qIdx * 47 + 5);
  }, [question, qIdx]);

  const pick = (displayIndex: number, e: React.MouseEvent) => {
    if (!question || judging || stage !== "ask") return;
    const entry = displayOptions[displayIndex];
    if (!entry) return;
    const wasCorrect = entry.origIdx === question.correctIndex;
    const correctDisplayIndex = displayOptions.findIndex((t) => t.origIdx === question.correctIndex);
    setJudging(true);
    setPicked({ index: displayIndex, correctIndex: correctDisplayIndex, correct: wasCorrect });

    const n = (attemptsRef.current.get(question.phaseId) ?? 0) + 1;
    attemptsRef.current.set(question.phaseId, n);
    const stat = statsRef.current.get(question.phaseId);
    if (stat) {
      stat.totalQuestions += 1;
      if (wasCorrect) stat.correctCount += 1;
      else stat.wrongCount += 1;
    }
    position.current += 1;
    onQuestionAnswered?.({
      key: `${question.key}-a${n}`,
      selectedIndex: displayIndex,
      correctIndex: correctDisplayIndex,
      wasCorrect,
      position: position.current,
      phaseId: question.phaseId,
    });

    // Graded test: ONE attempt per question, no retry. Tally the score and
    // grade at the very end (passMark correct to win, else redo the whole set).
    const nextCorrect = beaten + (wasCorrect ? 1 : 0);
    const rect = arenaRef.current?.getBoundingClientRect();
    const tapX = rect ? e.clientX - rect.left : 300;
    const tapY = rect ? e.clientY - rect.top : 200;

    if (wasCorrect) {
      setScore((s) => s + 100);
      setBeaten((b) => b + 1);
      playSound("correct");
      playSound("bossHurt");
      shake();
      addPopup("CORRECT!", "#2fae4e", tapX, tapY);
      if (rect) particlesRef.current?.burst(rect.width * 0.82, rect.height * 0.55, accent, reduce ? 0 : 20);
      setRaccoonMood("hurt");
      if (question.villainRight) {
        setRaccoonLine(question.villainRight.text);
        speakVillain(question.villainRight.slug, question.villainRight.text);
      }
    } else {
      playSound("wrong");
      addPopup("NOT QUITE", "#e0447d", tapX, tapY);
      setRaccoonMood("attack");
      if (question.villainWrong) {
        setRaccoonLine(question.villainWrong.text);
        speakVillain(question.villainWrong.slug, question.villainWrong.text);
      }
    }

    // Reveal beat: the correct answer flashes green, and Sarah explains WHY
    // it's the safe answer (right = affirm + why; wrong = "not quite" + the
    // same teach). The fight advances only when she finishes — never cut off.
    revealStart.current = performance.now();
    advancedRef.current = false;
    pendingAdvanceRef.current = () => {
      setExplain(null);
      setRaccoonLine(null);
      setPicked(null);
      setJudging(false);
      if (qIdx + 1 >= total) {
        setReport(
          conceptList.map((c) => {
            const s = statsRef.current.get(c.phaseId);
            return { phaseId: c.phaseId, label: c.label, correct: s?.correctCount ?? 0, total: s?.totalQuestions ?? 0 };
          }),
        );
        if (nextCorrect >= passMark) {
          setRaccoonMood("defeated");
          setStage("victory");
        } else {
          setRaccoonMood("taunt");
          setFailedTries((n) => n + 1);
          setStage("failed");
        }
      } else {
        playSound("phaseChange");
        setRaccoonMood("taunt");
        setQIdx((i) => i + 1);
      }
    };
    setExplain({
      lines: [wasCorrect ? "That's right!" : "Not quite.", question.teachOnWrong.explanation],
      correct: wasCorrect,
    });
    // Safety net: advance even if the explanation's onDone never fires. Muted =
    // no voice, so a short readable pause (the caption is on screen); otherwise
    // a GENEROUS backstop that must sit comfortably above the longest recorded
    // explanation, because the recorded onDone normally advances first and this
    // only exists for the rare case where `ended` never fires. (A tighter cap
    // here was clipping Sarah mid-sentence on the longer explanations — the
    // audio ran past it, so the backstop advanced the question before she was
    // done.) Reduced-motion must NOT shorten it: motion≠audio length. Tracked in
    // revealSafetyRef and cleared the instant the reveal advances (runAdvance),
    // so a stale timer can't reach into the next question.
    if (revealSafetyRef.current !== null) window.clearTimeout(revealSafetyRef.current);
    const revealSafetyMs = isAudioMuted() ? (reduce ? 2600 : 3600) : 45000;
    revealSafetyRef.current = window.setTimeout(runAdvance, revealSafetyMs);
    timersRef.current.push(revealSafetyRef.current);
  };

  /** Under the pass mark: wipe the score and run the whole set again
   *  (same layout, re-read from the top via attemptNonce). */
  const redo = () => {
    playSound("select");
    const m = new Map<string, BossPhaseResult>();
    for (const q of quiz.questions) {
      m.set(q.phaseId, { phaseId: q.phaseId, label: q.label, correctCount: 0, wrongCount: 0, totalQuestions: 0 });
    }
    statsRef.current = m;
    attemptsRef.current = new Map();
    position.current = 0;
    setBeaten(0);
    setScore(0);
    setQIdx(0);
    setPicked(null);
    setReport([]);
    setRaccoonLine(null);
    setRaccoonMood("taunt");
    setAttemptNonce((a) => a + 1);
    setStage("ask");
  };

  const endBoss = (won: boolean) => {
    const phaseResults = quiz.questions
      .map((q) => statsRef.current.get(q.phaseId))
      .filter((r): r is BossPhaseResult => !!r);
    const totals = phaseResults.reduce(
      (acc, r) => ({ q: acc.q + r.totalQuestions, c: acc.c + r.correctCount, w: acc.w + r.wrongCount }),
      { q: 0, c: 0, w: 0 },
    );
    onEnd?.(won, {
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
  // Beating the boss (victory "Claim the win") ends won; the failed-screen
  // "Keep going" escape ends not-won, so DynamicLesson shows its gentle
  // "So close ... Keep going" card instead of hard-blocking a struggling kid.
  const finish = () => endBoss(true);

  return (
    <motion.div
      key={shakeNonce > 0 ? `shake-${shakeNonce}` : "still"}
      animate={reduce || shakeNonce === 0 ? undefined : { x: [0, -7, 6, -4, 2, 0], y: [0, 3, -2, 1, 0, 0] }}
      transition={{ duration: 0.35 }}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: "#101736", color: "#f6f9ff", fontFamily: ROUNDED }}
    >
      {/* Friendly quiz-show backdrop: navy stage + accent spotlight. No
          week art needed, so the component stays 100% data-driven. */}
      {/* Live techy backdrop: accent-tinted digital rain (canvas, reduced-motion
          safe, pauses when hidden) under a dimming veil so content always wins. */}
      <CodeRainBackground
        fixed={false}
        bg="#0b1024"
        head={`rgba(${hexRgb(accent)},0.58)`}
        accentA="rgba(255,247,224,0.5)"
        accentB={`rgba(${hexRgb(accent)},0.32)`}
      />
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: "linear-gradient(180deg, rgba(10,14,30,0.70) 0%, rgba(9,12,26,0.80) 62%, rgba(6,8,16,0.90) 100%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, pointerEvents: "none", background: `radial-gradient(120% 80% at 50% 4%, ${accent}1f, transparent 55%)` }} />
      {/* Console keyframes, always mounted so animations run on every stage. */}
      <style>{`@keyframes qbFloor{to{background-position:0 44px}}@keyframes qbSweep{0%{top:-3%}100%{top:103%}}@keyframes qbSpin{to{transform:rotate(360deg)}}@keyframes qbSpinRev{to{transform:rotate(-360deg)}}@keyframes qbBlink{50%{opacity:.25}}`}</style>
      {/* Faint perspective grid under the question/victory stages (the intro has its own brighter one). */}
      {stage !== "intro" && (
        <div aria-hidden style={{ position: "absolute", left: "-25%", right: "-25%", bottom: "-2%", height: "50%", zIndex: 1, pointerEvents: "none", opacity: 0.16, backgroundImage: `linear-gradient(${accent}8c 1px, transparent 1px), linear-gradient(90deg, ${accent}8c 1px, transparent 1px)`, backgroundSize: "44px 44px", transform: "perspective(340px) rotateX(66deg)", transformOrigin: "bottom center", WebkitMaskImage: "linear-gradient(180deg, transparent, #000 60%)", maskImage: "linear-gradient(180deg, transparent, #000 60%)" }} />
      )}

      {/* FUTURISTIC CONSOLE CHROME (intro only): perspective grid, scanline
          sweep, HUD corner brackets, and a system readout bar. All themed to
          the week accent, so every week wears its own skin. */}
      {stage === "intro" && (
        <>
          <div aria-hidden style={{ position: "absolute", left: "-25%", right: "-25%", bottom: "-2%", height: "52%", zIndex: 1, pointerEvents: "none", opacity: 0.5, backgroundImage: `linear-gradient(${accent}8c 1px, transparent 1px), linear-gradient(90deg, ${accent}8c 1px, transparent 1px)`, backgroundSize: "44px 44px", transform: "perspective(340px) rotateX(66deg)", transformOrigin: "bottom center", WebkitMaskImage: "linear-gradient(180deg, transparent, #000 55%)", maskImage: "linear-gradient(180deg, transparent, #000 55%)", animation: reduce ? undefined : "qbFloor 5.5s linear infinite" }} />
          <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: 0, height: 2, zIndex: 4, pointerEvents: "none", opacity: 0.5, background: `linear-gradient(90deg, transparent, ${accent}cc, transparent)`, animation: reduce ? undefined : "qbSweep 6s linear infinite" }} />
          <div aria-hidden style={{ position: "absolute", top: 12, left: 12, width: 24, height: 24, zIndex: 5, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, opacity: 0.85, filter: `drop-shadow(0 0 6px ${accent}99)` }} />
          <div aria-hidden style={{ position: "absolute", top: 12, right: 12, width: 24, height: 24, zIndex: 5, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}`, opacity: 0.85, filter: `drop-shadow(0 0 6px ${accent}99)` }} />
          <div aria-hidden style={{ position: "absolute", bottom: 12, left: 12, width: 24, height: 24, zIndex: 5, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}`, opacity: 0.85, filter: `drop-shadow(0 0 6px ${accent}99)` }} />
          <div aria-hidden style={{ position: "absolute", bottom: 12, right: 12, width: 24, height: 24, zIndex: 5, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}`, opacity: 0.85, filter: `drop-shadow(0 0 6px ${accent}99)` }} />
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 6, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, padding: "13px 20px", fontFamily: MONO, fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase", color: accent }}>
            <span style={{ whiteSpace: "nowrap" }}><span style={{ animation: reduce ? undefined : "qbBlink 1.4s steps(1) infinite" }}>◉</span> Final Test</span>
            {quiz.theme?.topic && <span style={{ color: "#c7d2f5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Subject: <b style={{ color: "#fff", fontWeight: 700 }}>{quiz.theme.topic}</b></span>}
            <span style={{ whiteSpace: "nowrap", opacity: 0.85 }}>Threat ▮▮▮▮▯</span>
          </div>
        </>
      )}

      {/* Faint drifting topic icons behind the intro (per-week theme.motifs),
          so each week reads as its own subject. Intro only, keeps the
          question screens clean. */}
      {stage === "intro" && themeMotifs.length > 0 && (
        <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 2, pointerEvents: "none", overflow: "hidden" }}>
          {MOTIF_SPOTS.map((sp, i) => (
            <div key={i} style={{ position: "absolute", left: `${sp.x}%`, top: `${sp.y}%`, transform: `translate(-50%, -50%) rotate(${sp.r}deg)`, opacity: 0.13 }}>
              <motion.div
                animate={reduce ? undefined : { y: [0, sp.drift, 0] }}
                transition={reduce ? undefined : { duration: 5 + (i % 4), repeat: Infinity, ease: "easeInOut", delay: i * 0.35 }}
              >
                <PixIcon emoji={themeMotifs[i % themeMotifs.length]} size={sp.s} />
              </motion.div>
            </div>
          ))}
        </div>
      )}

      {stage === "ask" && (
        <div aria-hidden style={{ position: "absolute", right: "-6%", bottom: "-8%", width: "56%", height: "70%", background: `radial-gradient(ellipse, ${accent}33, transparent 65%)`, pointerEvents: "none" }} />
      )}

      {/* The villain host during the QUESTIONS only; the intro and victory
          screens render their own centered hero, so this shows just on ask. */}
      {stage === "ask" && (
        <>
          <motion.img
            key={raccoonMood}
            src={RACCOON[raccoonMood]}
            alt={quiz.villain.name}
            initial={reduce ? false : { scale: 0.94, opacity: 0.7 }}
            animate={
              reduce
                ? { scale: 1, opacity: 1 }
                : raccoonMood === "hurt"
                  ? { scale: 0.96, opacity: 1, x: 16, rotate: 4 }
                  : raccoonMood === "defeated"
                    ? { scale: 0.9, opacity: 0.92, y: 20, rotate: 7 }
                    : { scale: 1, opacity: 1, y: [0, -7, 0] }
            }
            transition={raccoonMood === "idle" || raccoonMood === "taunt" ? { duration: 3, repeat: Infinity, ease: "easeInOut" } : { duration: 0.28 }}
            style={{
              position: "absolute",
              right: "6%",
              bottom: "11%",
              height: "26%",
              zIndex: 3,
              filter: "drop-shadow(0 12px 16px rgba(5,10,30,0.6))",
            }}
          />
          <div aria-hidden style={{ position: "absolute", right: "6%", bottom: "9.5%", width: "16%", height: 20, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.4), transparent 70%)" }} />
        </>
      )}

      {/* His live line (ow / gloat), mirrored as text for mute play */}
      <AnimatePresence>
        {raccoonLine && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", right: "5%", top: "17%", zIndex: 25, maxWidth: 260,
              padding: "10px 14px", borderRadius: 14, borderBottomRightRadius: 3,
              background: "linear-gradient(180deg, rgba(20,27,52,0.96), rgba(10,14,30,0.97))", border: `1.5px solid ${accent}b0`, color: "#eef4ff",
              fontSize: 14.5, fontWeight: 800, fontStyle: "italic", lineHeight: 1.35,
              boxShadow: "0 12px 30px -10px rgba(5,10,30,0.6)",
            }}
          >
            “{raccoonLine}”
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sarah's reveal teach, mirrored on screen (she reads it aloud). Shown
          for both right and wrong so a child always hears WHY — bottom-centre
          so it never collides with the villain bubble (top-right). */}
      <AnimatePresence>
        {explain && (
          <motion.div
            key={`explain-${qIdx}-${attemptNonce}`}
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              position: "absolute", left: "50%", bottom: "3.5%", transform: "translateX(-50%)",
              zIndex: 30, width: "min(560px, 92%)",
              padding: "13px 18px", borderRadius: 14,
              background: "linear-gradient(180deg, rgba(20,27,52,0.97), rgba(9,13,28,0.98))",
              border: `1.5px solid ${explain.correct ? "#57e08a" : `${accent}c0`}`,
              boxShadow: "0 18px 40px -16px #000",
              display: "flex", alignItems: "flex-start", gap: 12,
            }}
          >
            <span style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: "50%", background: explain.correct ? "rgba(87,224,138,0.16)" : `${accent}22`, border: `1.5px solid ${explain.correct ? "#57e08a" : `${accent}c0`}` }}>
              <PixIcon emoji={explain.correct ? "✅" : "💡"} size={20} />
            </span>
            <span style={{ textAlign: "left", lineHeight: 1.4 }}>
              <b style={{ display: "block", fontSize: 14, fontWeight: 900, letterSpacing: "0.02em", color: explain.correct ? "#7eff97" : accent, marginBottom: 2 }}>
                {explain.lines[0]}
              </b>
              <span style={{ fontSize: 14.5, fontWeight: 600, color: "#eef4ff" }}>{explain.lines[1]}</span>
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* HUD: the boss health bar (one segment per concept) + score */}
      {stage !== "intro" && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, padding: "12px 16px 8px", display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 800, letterSpacing: "0.14em", color: accent, textShadow: "0 1px 6px rgba(5,10,30,0.8)", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 6 }}>
              <PixIcon emoji="🦝" size={16} /> BOSS INTEGRITY
            </span>
            <div
              style={{ flex: 1, display: "flex", gap: 4 }}
              role="progressbar"
              aria-label="Boss health"
              aria-valuenow={total - beaten}
              aria-valuemin={0}
              aria-valuemax={total}
            >
              {questions.map((q, i) => {
                const alive = i >= beaten;
                return (
                  <motion.div
                    key={q.key ?? `${q.phaseId}-${i}`}
                    animate={alive ? { opacity: 1, scaleY: 1 } : { opacity: 0.3, scaleY: 0.55 }}
                    style={{
                      flex: 1, height: 13, borderRadius: 3,
                      background: alive ? `linear-gradient(180deg, ${accent}, ${accent}b0)` : "rgba(255,255,255,0.10)",
                      border: `1px solid ${alive ? `${accent}80` : "rgba(255,255,255,0.22)"}`,
                      boxShadow: alive ? `0 0 9px ${accent}90` : "none",
                    }}
                  />
                );
              })}
            </div>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 900, color: "#fff7e6", textShadow: "0 1px 6px rgba(5,10,30,0.8)", minWidth: 92, textAlign: "right" }}>
              SCORE {score}
            </span>
          </div>
          {stage === "ask" && (
            <div style={{ fontFamily: MONO, fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", color: "#cfe3ff", textShadow: "0 1px 6px rgba(5,10,30,0.8)" }}>
              QUESTION {Math.min(qIdx + 1, total)}/{total} · {question?.label.toUpperCase()} · CORRECT {Math.min(beaten, passMark)}/{passMark} TO PASS
            </div>
          )}
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
              style={{ position: "absolute", left: p.x, top: p.y, transform: "translateX(-50%)", fontFamily: MONO, fontSize: 17, fontWeight: 900, color: p.colour, textShadow: "0 1px 4px rgba(0,0,0,0.6)" }}
            >
              {p.text}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Main stage */}
      <div ref={arenaRef} style={{ position: "absolute", inset: 0, zIndex: 10, display: "flex", flexDirection: "column", padding: "68px 16px 14px" }}>
        <ParticleLayer apiRef={particlesRef} disabled={reduce} />

        <AnimatePresence mode="wait">
          {stage === "intro" && (
            <motion.div key="intro" initial={reduce ? false : { opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 600, width: "100%", zIndex: 15 }}>

              {/* The villain as a LOCKED TARGET inside a scanning reticle */}
              <div style={{ position: "relative", width: 200, height: 200, display: "grid", placeItems: "center", marginBottom: 2 }}>
                <div aria-hidden style={{ position: "absolute", inset: "8%", borderRadius: "50%", background: `radial-gradient(circle, ${accent}42, transparent 62%)` }} />
                <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", border: `2px dashed ${accent}b3`, animation: reduce ? undefined : "qbSpin 15s linear infinite" }} />
                <div aria-hidden style={{ position: "absolute", inset: "16%", borderRadius: "50%", border: `2px solid ${accent}4d`, borderTopColor: accent, animation: reduce ? undefined : "qbSpinRev 6s linear infinite" }} />
                <div aria-hidden style={{ position: "absolute", top: -4, left: "50%", transform: "translateX(-50%)", width: 2, height: 12, background: accent }} />
                <div aria-hidden style={{ position: "absolute", bottom: -4, left: "50%", transform: "translateX(-50%)", width: 2, height: 12, background: accent }} />
                <div aria-hidden style={{ position: "absolute", left: -4, top: "50%", transform: "translateY(-50%)", width: 12, height: 2, background: accent }} />
                <div aria-hidden style={{ position: "absolute", right: -4, top: "50%", transform: "translateY(-50%)", width: 12, height: 2, background: accent }} />
                <motion.img
                  src={RACCOON.taunt}
                  alt={quiz.villain.name}
                  initial={reduce ? false : { scale: 0.9, opacity: 0, y: -8 }}
                  animate={reduce ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1, y: [0, -8, 0] }}
                  transition={reduce ? { duration: 0.3 } : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  style={{ position: "relative", zIndex: 2, height: 150, filter: `drop-shadow(0 10px 16px rgba(0,0,0,0.55)) drop-shadow(0 0 20px ${accent}73)` }}
                />
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase", color: accent, marginTop: 2 }}>
                Target Locked &middot; <span style={{ color: "#fff" }}>{quiz.villain.name}</span>
              </div>

              <motion.h1
                initial={reduce ? false : { scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 16 }}
                style={{ margin: "12px 0 0", fontSize: "clamp(30px, 5.2vw, 46px)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "0.01em", textTransform: "uppercase", background: `linear-gradient(180deg, #fffbe9 0%, ${accent} 60%, ${accent}88 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 0 18px ${accent}66)` }}
              >
                {quiz.villain.name}&rsquo;S QUIZ SHOWDOWN
              </motion.h1>

              {/* His taunt as an INCOMING TRANSMISSION panel */}
              <div style={{ position: "relative", marginTop: 18, maxWidth: 500, width: "100%", borderRadius: 12, overflow: "hidden", background: `linear-gradient(180deg, ${accent}1a, #0a0e1f)`, border: `1px solid ${accent}73`, boxShadow: `0 18px 40px -18px #000, inset 0 0 40px -20px ${accent}80` }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: accent, padding: "7px 14px", borderBottom: `1px solid ${accent}42`, textAlign: "left", background: `${accent}14`, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}`, animation: reduce ? undefined : "qbBlink 1.4s steps(1) infinite" }} /> Incoming Transmission
                </div>
                <p style={{ margin: 0, padding: "13px 18px", fontSize: 15.5, fontWeight: 600, fontStyle: "italic", lineHeight: 1.4, color: "#eef2ff" }}>
                  &ldquo;{quiz.intro.text}&rdquo;
                </p>
              </div>

              <button
                onClick={() => { playSound("select"); start(); }}
                style={{ marginTop: 22, fontFamily: ROUNDED, fontWeight: 900, fontSize: 17, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", color: "#12101f", padding: "15px 42px", border: "none", touchAction: "manipulation", clipPath: "polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)", background: `linear-gradient(180deg, ${accent}, ${accent}cc)`, boxShadow: `0 0 26px -4px ${accent}bf, 0 10px 22px -10px #000` }}
              >
                Initiate Test ▸
              </button>
              <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", color: `${accent}cc` }}>{HOW_TO_PLAY}</div>
            </motion.div>
          )}

          {stage === "ask" && question && (
            <motion.div
              key={`ask-${qIdx}`}
              initial={reduce ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16, zIndex: 15, minHeight: 0, justifyContent: "center", alignItems: "center", paddingRight: "min(18%, 190px)" }}
            >
              {/* The scenario, shown big; the text carries it (the villain
                  only reads it aloud if the voice is ever switched back on). */}
              <div style={{ width: "100%", maxWidth: 640, textAlign: "center" }}>
                <div style={{ position: "relative", padding: "18px 24px", borderRadius: 14, background: `linear-gradient(180deg, ${accent}1c, rgba(9,13,28,0.95))`, border: `1px solid ${accent}80`, boxShadow: `0 20px 44px -18px #000, inset 0 0 46px -22px ${accent}80`, color: "#eef4ff", fontSize: 19, fontWeight: 800, lineHeight: 1.4 }}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: accent, marginBottom: 10, textTransform: "uppercase" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}`, animation: reduce ? undefined : "qbBlink 1.4s steps(1) infinite" }} /> {quiz.villain.name} {"//"} Incoming Query
                  </span>
                  {question.ask.text}
                </div>
              </div>

              {/* Sarah reads the question aloud (audio-only, visually hidden;
                  the text above carries it on screen). Keyed to the question +
                  retry so she re-reads on a reshuffled retry. speaker="adam" =
                  Sarah, matching the recorded boss-ask in the manifest. */}
              <div aria-hidden style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)", pointerEvents: "none" }}>
                {/* MUTUALLY EXCLUSIVE: exactly one narration is ever mounted, so
                    the two Sarahs can never overlap. InfoNarration instances do
                    NOT coordinate audio, and mounting the reveal narration used
                    to remount the ask one and re-fire its autoplay on top. */}
                {!explain ? (
                  <InfoNarration key={`boss-ask-${qIdx}-${attemptNonce}`} speaker="adam" lines={askLines} accent={accent} onDone={() => setAskDone(true)} recordedOnly />
                ) : (
                  // Sarah's reveal explanation (why the safe answer is right).
                  // Audio-only; the caption below mirrors it. onDone advances
                  // the fight, so she is never cut off mid-sentence.
                  <InfoNarration key={`boss-explain-${qIdx}-${attemptNonce}`} speaker="adam" lines={explain.lines} accent={accent} onDone={runAdvance} recordedOnly />
                )}
              </div>

              {/* 2-4 big option cards. One verb: TAP. */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center", width: "100%", maxWidth: 680 }}>
                {displayOptions.map((entry, i) => {
                  // During the reveal beat: flash the correct answer green and
                  // the wrong pick red (learning), dim the rest. Options are
                  // uniform text on purpose, so the answer never stands out.
                  const revealCorrect = !!picked && i === picked.correctIndex;
                  const revealWrong = !!picked && picked.index === i && !picked.correct;
                  const bg = revealCorrect
                    ? "linear-gradient(180deg, rgba(51,163,94,0.96), rgba(26,110,60,0.97))"
                    : revealWrong
                      ? "linear-gradient(180deg, rgba(190,60,60,0.96), rgba(130,30,30,0.97))"
                      : "linear-gradient(180deg, rgba(20,27,52,0.94), rgba(10,14,30,0.96))";
                  const bd = revealCorrect ? "#57e08a" : revealWrong ? "#ff8f8b" : `${accent}80`;
                  // Locked until Sarah has finished reading the question, so a
                  // tap can't fire before/over her voice and cut it off.
                  const inert = judging || !askDone;
                  const dim = (judging && !revealCorrect && !revealWrong) || !askDone;
                  return (
                    <motion.button
                      key={`${qIdx}-${attemptNonce}-${entry.origIdx}`}
                      onClick={(e) => pick(i, e)}
                      disabled={inert}
                      animate={inert || reduce ? { scale: revealCorrect ? 1.05 : 1 } : { scale: [1, 1.04, 1] }}
                      transition={inert || reduce ? { duration: 0.2 } : { duration: 1.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
                      whileTap={reduce || inert ? undefined : { scale: 0.92 }}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "flex-start", gap: 12,
                        minHeight: 64, minWidth: 240, maxWidth: 340,
                        padding: "14px 18px", borderRadius: 12,
                        cursor: inert ? "default" : "pointer",
                        touchAction: "manipulation", fontFamily: "inherit", fontSize: 17, fontWeight: 800,
                        textAlign: "left", lineHeight: 1.25,
                        background: bg,
                        border: `1px solid ${bd}`,
                        color: "#eef4ff",
                        boxShadow: revealCorrect
                          ? "0 0 22px -4px rgba(87,224,138,0.7), 0 12px 26px -12px #000"
                          : `0 12px 26px -12px #000, 0 0 18px -6px ${accent}5c, inset 0 1px 0 ${accent}33`,
                        opacity: dim ? 0.5 : 1,
                      }}
                    >
                      {/* The A/B/C badge matches what Sarah says ("option B…") */}
                      <span
                        aria-hidden
                        style={{
                          flexShrink: 0, width: 32, height: 32, borderRadius: 9,
                          display: "grid", placeItems: "center",
                          fontFamily: MONO, fontSize: 16, fontWeight: 900,
                          color: revealCorrect ? "#0b2417" : revealWrong ? "#2a0d0d" : accent,
                          background: revealCorrect || revealWrong ? "rgba(255,255,255,0.85)" : `${accent}22`,
                          border: `1.5px solid ${revealCorrect ? "#bff5d2" : revealWrong ? "#ffc9c6" : `${accent}70`}`,
                        }}
                      >
                        {OPTION_LETTERS[i]}
                      </span>
                      <span style={{ flex: 1 }}>{entry.opt.text}</span>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {stage === "victory" && (
            <motion.div key="victory" initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 540, maxHeight: "100%", overflowY: "auto", zIndex: 15 }}>
              <div style={{ position: "relative", marginBottom: 2, display: "flex", justifyContent: "center" }}>
                <div aria-hidden style={{ position: "absolute", left: "50%", top: "8%", transform: "translateX(-50%)", width: 230, height: 230, background: `radial-gradient(circle, ${accent}33, transparent 60%)`, filter: "blur(4px)", pointerEvents: "none" }} />
                <motion.img src={RACCOON.defeated} alt={quiz.villain.name} initial={reduce ? false : { scale: 0.8, opacity: 0, y: -6, rotate: -8 }} animate={{ scale: 1, opacity: 1, y: 0, rotate: -8 }} transition={{ type: "spring", stiffness: 180, damping: 14 }} style={{ position: "relative", height: 122, filter: "drop-shadow(0 12px 16px rgba(5,10,30,0.5))" }} />
                {/* Comic KO: dizzy stars orbit his head so the defeat reads funny, not sad. */}
                <div aria-hidden style={{ position: "absolute", top: 6, left: "50%", width: 108, height: 108, marginLeft: -54, animation: reduce ? undefined : "qbSpin 3.2s linear infinite", pointerEvents: "none", zIndex: 3 }}>
                  {[0, 120, 240].map((deg) => (
                    <span key={deg} style={{ position: "absolute", left: "50%", top: "50%", marginLeft: -11, marginTop: -11, transform: `rotate(${deg}deg) translateY(-48px)` }}>
                      <PixIcon emoji="⭐" size={22} />
                    </span>
                  ))}
                </div>
                <div aria-hidden style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", width: 100, height: 12, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(0,0,0,0.4), transparent 70%)" }} />
              </div>
              <motion.div initial={reduce ? false : { scale: 2.0, opacity: 0, rotate: -4 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 190, damping: 14 }} style={{ margin: "4px 0 0", fontSize: "clamp(34px, 5.6vw, 50px)", fontWeight: 900, lineHeight: 1, background: "linear-gradient(180deg, #d6ffe0 0%, #7eff97 50%, #2fae4e 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", filter: "drop-shadow(0 3px 0 rgba(0,0,0,0.35))" }}>
                YOU WIN!
              </motion.div>
              <div style={{ marginTop: 8, fontFamily: MONO, fontSize: 14, fontWeight: 900, letterSpacing: "0.08em", color: "#eef4ff" }}>
                YOU SCORED <span style={{ color: "#7eff97" }}>{beaten}</span> / {total}
              </div>
              <div style={{ marginTop: 13, width: "100%", maxWidth: 420, borderRadius: 12, overflow: "hidden", background: `linear-gradient(180deg, ${accent}14, rgba(9,13,28,0.95))`, border: `1px solid ${accent}66`, boxShadow: "0 18px 40px -18px #000" }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.2em", color: accent, padding: "7px 14px", borderBottom: `1px solid ${accent}42`, textAlign: "left", background: `${accent}12`, textTransform: "uppercase" }}>Mission Report</div>
                <div style={{ padding: "9px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                  {report.map((r) => {
                    const good = r.total > 0 && r.correct === r.total;
                    return (
                      <div key={r.phaseId} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>
                        <span style={{ color: good ? "#57e08a" : "#ffcf5c", width: 14, textAlign: "center" }}>{good ? "✓" : "!"}</span>
                        <span style={{ flex: 1, textAlign: "left", color: "#dfe7ff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.label}</span>
                        <span style={{ color: good ? "#57e08a" : "#ffcf5c" }}>{r.correct}/{r.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <GameButton variant="success" size="lg" onClick={finish}>
                  Claim the win →
                </GameButton>
              </div>
            </motion.div>
          )}

          {stage === "failed" && (
            <motion.div key="failed" initial={reduce ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} style={{ margin: "auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", maxWidth: 540, maxHeight: "100%", overflowY: "auto", zIndex: 15 }}>
              <div style={{ position: "relative", marginBottom: 2, display: "flex", justifyContent: "center" }}>
                <div aria-hidden style={{ position: "absolute", left: "50%", top: "6%", transform: "translateX(-50%)", width: 230, height: 230, background: `radial-gradient(circle, ${accent}33, transparent 60%)`, filter: "blur(4px)", pointerEvents: "none" }} />
                <motion.img src={RACCOON.taunt} alt={quiz.villain.name} initial={reduce ? false : { scale: 0.85, opacity: 0 }} animate={reduce ? { scale: 1, opacity: 1 } : { scale: 1, opacity: 1, y: [0, -7, 0] }} transition={reduce ? { duration: 0.3 } : { duration: 2.6, repeat: Infinity, ease: "easeInOut" }} style={{ position: "relative", height: 128, filter: `drop-shadow(0 12px 16px rgba(5,10,30,0.5)) drop-shadow(0 0 18px ${accent}66)` }} />
              </div>
              <motion.div initial={reduce ? false : { scale: 1.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 16 }} style={{ margin: "4px 0 0", fontSize: "clamp(30px, 5.2vw, 46px)", fontWeight: 900, lineHeight: 1, textTransform: "uppercase", background: `linear-gradient(180deg, #fffbe9 0%, ${accent} 60%, ${accent}88 100%)`, WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent", filter: `drop-shadow(0 0 18px ${accent}66)` }}>
                So Close!
              </motion.div>
              <div style={{ marginTop: 8, maxWidth: 440, fontSize: 15, fontWeight: 700, color: "#eef4ff", lineHeight: 1.42 }}>
                You got <b style={{ color: accent }}>{beaten}</b> out of {total}. You need <b style={{ color: accent }}>{passMark}</b> right to beat the {quiz.villain.name}. Check the skills below, then try again!
              </div>
              <div style={{ marginTop: 13, width: "100%", maxWidth: 420, borderRadius: 12, overflow: "hidden", background: `linear-gradient(180deg, ${accent}14, rgba(9,13,28,0.95))`, border: `1px solid ${accent}66`, boxShadow: "0 18px 40px -18px #000" }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, fontWeight: 700, letterSpacing: "0.2em", color: accent, padding: "7px 14px", borderBottom: `1px solid ${accent}42`, textAlign: "left", background: `${accent}12`, textTransform: "uppercase" }}>Skills To Review</div>
                <div style={{ padding: "9px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                  {report.map((r) => {
                    const good = r.total > 0 && r.correct === r.total;
                    return (
                      <div key={r.phaseId} style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: MONO, fontSize: 12, fontWeight: 700 }}>
                        <span style={{ color: good ? "#57e08a" : "#ffcf5c", width: 14, textAlign: "center" }}>{good ? "✓" : "!"}</span>
                        <span style={{ flex: 1, textAlign: "left", color: "#dfe7ff", textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.label}</span>
                        <span style={{ color: good ? "#57e08a" : "#ffcf5c" }}>{r.correct}/{r.total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <button onClick={redo} style={{ marginTop: 20, fontFamily: ROUNDED, fontWeight: 900, fontSize: 17, letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer", color: "#12101f", padding: "15px 42px", border: "none", touchAction: "manipulation", clipPath: "polygon(14px 0, 100% 0, calc(100% - 14px) 100%, 0 100%)", background: `linear-gradient(180deg, ${accent}, ${accent}cc)`, boxShadow: `0 0 26px -4px ${accent}bf, 0 10px 22px -10px #000` }}>
                Try Again ▸
              </button>
              {failedTries >= 2 && (
                <button
                  onClick={() => endBoss(false)}
                  style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer", fontFamily: ROUNDED, fontWeight: 800, fontSize: 14, letterSpacing: "0.04em", color: "#aeb8e8", textDecoration: "underline", textUnderlineOffset: 3, touchAction: "manipulation" }}
                >
                  Keep going for now →
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
