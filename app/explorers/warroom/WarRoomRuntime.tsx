"use client";

/**
 * THE WAR ROOM — Block 4's runtime (The Long Game). A violet operations board
 * where you're the lead analyst: you CONNECT clues across the whole case, pin
 * evidence, and unmask the coordinator. Different from reading one artifact (B1),
 * a phone (B2), or a control panel (B3). Same framework (7 skills LEARN ->
 * PRACTICE, roadmap, blind boss, must-pass test, anti-skip, ?fast=1). Signature
 * mechanic = CONNECT (link the board) + PIN. Data-driven by a WarCase.
 */

import { useEffect, useReducer, useRef, useState } from "react";
import { MatrixRain } from "../MatrixRain";
import { BlockBackdrop } from "../BlockBackdrop";
import { playWren, primeAudio, setVoiceRate, stopWren, useVoiceRate, useWrenSpeaking, VOICE_RATES } from "../engine/audio";
import { useArrowAdvance, SkipButton, BackButton } from "../engine/arrowAdvance";
import { playBGM, stopBGM } from "@/app/lib/sounds";
import { type CaseStage, readProgress, saveProgress, clearProgress, markCaseComplete, isResumable, stageLabel } from "../engine/caseProgress";
import { saveExplorersProgress } from "@/app/lib/explorersProgress.actions";
import { ResumePrompt } from "../engine/ResumePrompt";
import { ClosingCeremony } from "../engine/closingCeremony";
import { addJournalEntry, loadJournal, type JournalEntry } from "../engine/journal";
import { CaseJournal } from "../engine/CaseJournal";
import { ETHICS_LINE, ETHICS_VOICE } from "../engine/ethicsLine";
import { CaseBoard } from "../engine/CaseBoard";
import { CaseBoardFileExplorer } from "../engine/CaseBoardFileExplorer";
import { ZeroFile } from "../engine/ZeroFilePanel";
import { addZeroClue, loadZeroFile, ZERO_CLUES, type ZeroClue } from "../engine/zeroFile";
import type { WarCase, WarStep, WarTest } from "./case16";

const C = {
  page: "#0a0812", ink: "#ECE8F7", dim: "#A99BD0", faint: "#7e72a1",
  panel: "#130f22", edge: "#332a52", chip: "#1e1836", chipedge: "#3a2f5e",
  violet: "#B98BFF", violetHi: "#D4B8FF", violetbg: "#221a3a",
  wren: "#2BD4B4", wrenbg: "#0f2622",
  red: "#FF6A8A", mint: "#4FD9A8",
};
const MONO = `"IBM Plex Mono", ui-monospace, Consolas, monospace`;
const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;
const NUDGES = ["/audio/wren/nudge-1.mp3", "/audio/wren/nudge-2.mp3", "/audio/wren/nudge-3.mp3"];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.wr *{box-sizing:border-box}
.wr-work::-webkit-scrollbar{width:0}
@keyframes wr-pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes wr-led{0%,100%{opacity:.4}50%{opacity:1}}
.wr-row{animation:wr-pop .26s ease both}
.wr-opt{transition:transform .1s,border-color .15s,background .15s}
.wr-opt:hover:not(:disabled){border-color:var(--v);transform:translateY(-1px)}
.wr-opt:focus-visible{outline:2px solid var(--v);outline-offset:2px}
.wr-sw{transition:background .15s,border-color .15s}
.wr-btn:focus-visible{outline:2px solid var(--v);outline-offset:2px}
.sr-stamp-in{animation:srStamp .3s cubic-bezier(.2,0,0,1)}
@keyframes srStamp{0%{transform:rotate(-3deg) scale(1.15);opacity:0}30%{transform:rotate(-3deg) scale(1);opacity:1}38%{transform:rotate(-3deg) scale(1) translate(2px,0)}46%{transform:rotate(-3deg) scale(1) translate(0,0)}100%{transform:rotate(-3deg) scale(1);opacity:.9}}
.sr-xpnum{display:inline-block;animation:srXpNum .5s cubic-bezier(.2,0,0,1)}
@keyframes srXpNum{0%{transform:scale(1.35)}100%{transform:scale(1)}}
@keyframes wr-clue-in{0%{opacity:0;transform:translateX(16px) scale(.96)}60%{opacity:1;transform:translateX(0) scale(1.02)}100%{opacity:1;transform:translateX(0) scale(1)}}
.wr-clue-toast{animation:wr-clue-in .35s cubic-bezier(.2,0,0,1) both}
@media (prefers-reduced-motion: reduce){.wr *{animation-duration:.001ms !important}}
`;

type Item =
  | { id: number; kind: "wren"; text: string }
  | { id: number; kind: "note"; text: string }
  | { id: number; kind: "divider"; kicker: string; title: string; sub?: string; boss?: boolean }
  | { id: number; kind: "phase"; label: string }
  | { id: number; kind: "roadmap"; title: string; actor: string; skills: { n: number; title: string; goal: string }[] }
  | { id: number; kind: "working" };

type Dock =
  | { type: "choose"; prompt?: string; options: { label: string; sub?: string; outcome?: "good" | "bad"; then?: WarStep[] }[]; showGallery?: boolean }
  | { type: "connect"; prompt?: string; left: { id: string; label: string }[]; right: { id: string; label: string }[]; pairs: [string, string][]; bad?: string; badVoice?: string }
  | { type: "pin"; prompt?: string; cards: { label: string; good: boolean; sub?: string }[]; need: number; bad?: string; badVoice?: string }
  | { type: "sequence"; prompt?: string; cards: { id: string; label: string; sub?: string }[]; bad?: string; badVoice?: string }
  | {
      type: "flip";
      prompt?: string;
      you:
        | { kind: "toggle"; label: string; sub?: string; off: string; on: string }
        | { kind: "choice"; label: string; sub?: string; prompt: string; options: { label: string; outcome: "good" | "bad" }[] };
      them: { label: string; whenGood: string; whenBad: string };
    }
  | { type: "clear"; text: string }
  | { type: "idle" }
  | null;

export default function WarRoomRuntime({ warCase, onExit, onNextCase, autostart, onOpenWatchlist }: { warCase: WarCase; onExit?: () => void; onNextCase?: () => void; autostart?: boolean; onOpenWatchlist?: () => void }) {
  useArrowAdvance(); // ArrowRight: fast-forward through narration for UAT
  const fast = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fast") === "1";
  const [phase, setPhase] = useState<"boot" | "play" | "test" | "debrief">("boot");
  const [board, setBoard] = useState<string>("CASE BOARD");
  const [items, setItems] = useState<Item[]>([]);
  const [dock, setDock] = useState<Dock>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(!fast);
  const voiceRef = useRef(!fast);
  const voiceRate = useVoiceRate();
  const cycleVoiceRate = () => setVoiceRate(VOICE_RATES[(VOICE_RATES.indexOf(voiceRate) + 1) % VOICE_RATES.length]);
  useWrenSpeaking();
  const [, force] = useReducer((n) => n + 1, 0);
  const acc = warCase.accent ?? C.violet;
  const THEME = warCase.theme;
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  useEffect(() => { setJournal(loadJournal(warCase.id)); }, [warCase.id]);
  // Block-wide, not per-case: reload whenever this case's id changes too, so
  // arriving at a later case shows every clue collected so far this block.
  const [zeroClues, setZeroClues] = useState<ReturnType<typeof loadZeroFile>>([]);
  useEffect(() => { setZeroClues(loadZeroFile()); }, [warCase.id]);
  // UAT (Abdullah): every Zero File clue needs its own on-screen moment —
  // it was being added to localStorage completely silently. One small
  // helper, used everywhere a clue is earned, so none of them stay silent.
  const [clueToast, setClueToast] = useState<ZeroClue | null>(null);
  const awardClue = (caseId: string) => {
    const isNew = addZeroClue(caseId);
    setZeroClues(loadZeroFile());
    if (isNew) {
      const clue = ZERO_CLUES.find((c) => c.caseId === caseId) ?? null;
      setClueToast(clue);
    }
  };
  useEffect(() => {
    if (!clueToast) return;
    const t = setTimeout(() => setClueToast(null), 6000);
    return () => clearTimeout(t);
  }, [clueToast]);
  // UAT skip: one click fast-forwards through whatever's left of the CURRENT
  // skill only (narration + any dock waiting on input), then clears itself —
  // same one-click-per-skill contract as Phone's "Skip this whole skill".
  const [skipRequested, setSkipRequested] = useState(false);

  const reduce = fast || skipRequested || (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const idRef = useRef(0);
  const resolveRef = useRef<((v: string) => void) | null>(null);
  const startedRef = useRef(false);
  const workRef = useRef<HTMLDivElement>(null);
  const [resumeStage] = useState<CaseStage | null>(() => readProgress(warCase.id));

  const nextId = () => ++idRef.current;
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, reduce ? Math.min(ms, 120) : ms));
  useEffect(() => { const t = workRef.current; if (t) t.scrollTop = t.scrollHeight; }, [items, dock]);
  const push = (it: Item) => setItems((a) => [...a, it]);

  const working = async (ms: number) => { const id = nextId(); push({ id, kind: "working" }); await wait(ms); setItems((a) => a.filter((x) => x.id !== id)); };
  const awaitUser = () => new Promise<string>((res) => { resolveRef.current = res; });

  // While a skip is in flight, immediately resolve whatever dock is currently
  // blocking, as if the right input had just been given — same approach as
  // Phone/Console's identical effect. connect/pin/sequence all gate
  // correctness inside DockView's own local handlers (the parent only ever
  // awaits an "ok" string, never checks it), so resolving "ok" directly here
  // is exactly what a correct submit sends.
  useEffect(() => {
    if (!skipRequested || !dock) return;
    if (dock.type === "choose") {
      const safe = dock.options.find((o) => o.outcome !== "bad") ?? dock.options[0];
      resolveRef.current?.(safe.label);
      return;
    }
    if (dock.type === "clear") { resolveRef.current?.("go"); return; }
    if (dock.type === "connect" || dock.type === "pin" || dock.type === "sequence" || dock.type === "flip") {
      resolveRef.current?.("ok");
      return;
    }
  }, [dock, skipRequested]);

  const speak = (text: string, voice?: string) =>
    new Promise<void>((res) => {
      let done = false;
      const fin = () => { if (!done) { done = true; res(); } };
      // Same fix as Console's identical speak() (UAT: "Module 3... the
      // task often pops up before WREN has finished") — 16000 was too
      // short for longer narration lines, letting the dock appear and a
      // tap skip the rest of the audio while it was still playing. Not
      // reported for this block specifically, but it's the exact same
      // code, so swept it too rather than wait for a separate report.
      // 30000 matches the value Phone's identical speak() already uses.
      if (voice && voiceRef.current && !reduce) { playWren(voice, true, fin); setTimeout(fin, 30000); }
      else { if (voice && voiceRef.current) playWren(voice, true); setTimeout(fin, reduce ? 250 : Math.max(2400, text.length * 42)); }
    });

  useEffect(() => { voiceRef.current = voiceOn; }, [voiceOn]);
  useEffect(() => () => stopWren(), []);

  const runSteps = async (steps: WarStep[]) => {
    for (const step of steps) {
      if (step.t === "wren") { push({ id: nextId(), kind: "wren", text: step.text }); await speak(step.text, step.voice); }
      else if (step.t === "note") { await working(step.text.length > 40 ? 700 : 450); push({ id: nextId(), kind: "note", text: step.text }); await wait(500); }
      else if (step.t === "choose") {
        let done = false;
        // Shuffled once per presentation, not per render — matched by label,
        // not index, so reordering is always safe. Without this the correct
        // option sat in the same authored slot (almost always first) every
        // single time.
        const choiceOptions = shuffled(step.options.length).map((i) => step.options[i]);
        while (!done) {
          setNudge(null); setDock({ type: "choose", prompt: step.prompt, options: choiceOptions, showGallery: step.showGallery });
          const picked = await awaitUser(); setDock(null);
          const opt = step.options.find((o) => o.label === picked)!;
          if (opt.then) await runSteps(opt.then);
          if (opt.outcome === "bad") { await wait(250); continue; }
          done = true;
        }
      } else if (step.t === "connect") {
        setNudge(null);
        // Matched by id via step.pairs, never by position, so shuffling
        // left/right independently is safe (UAT: Week 11, same bug class
        // as Console's toggle/build).
        const left = shuffled(step.left.length).map((i) => step.left[i]);
        const right = shuffled(step.right.length).map((i) => step.right[i]);
        setDock({ type: "connect", prompt: step.prompt, left, right, pairs: step.pairs, bad: step.bad, badVoice: step.badVoice });
        await awaitUser(); setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      } else if (step.t === "pin") {
        setNudge(null);
        // Checked by each card's own `good` flag, never by position.
        const cards = shuffled(step.cards.length).map((i) => step.cards[i]);
        setDock({ type: "pin", prompt: step.prompt, cards, need: step.need, bad: step.bad, badVoice: step.badVoice });
        await awaitUser(); setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      } else if (step.t === "sequence") {
        setNudge(null); setDock({ type: "sequence", prompt: step.prompt, cards: step.cards, bad: step.bad, badVoice: step.badVoice });
        await awaitUser(); setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      } else if (step.t === "flip") {
        setNudge(null);
        setDock({ type: "flip", prompt: step.prompt, you: step.you, them: step.them });
        await awaitUser(); // resolves once the "good" side has been viewed on THEIR face
        setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
        if (step.ask) await runSteps([{ t: "choose", prompt: step.ask.prompt, options: step.ask.options }]);
      }
    }
  };

  const runSkill = async (sk: WarCase["skills"][number], total: number) => {
    setDock(null); setItems([]); setBoard(sk.board ?? "CASE BOARD"); await wait(400);
    push({ id: nextId(), kind: "divider", kicker: `Skill ${sk.n} of ${total}`, title: sk.title, sub: sk.goal }); await wait(600);
    await runSteps(sk.learn);
    await runSteps(sk.practice);
    push({ id: nextId(), kind: "wren", text: ETHICS_LINE }); await speak(ETHICS_LINE, ETHICS_VOICE);
    setJournal(addJournalEntry(warCase.id, { skillN: sk.n, title: sk.title, note: sk.journalNote }));
    setDock({ type: "clear", text: `Skill ${sk.n} complete ✓` }); await awaitUser();
  };

  const runBoss = async () => {
    const b = warCase.boss;
    setDock(null); setItems([]); setBoard(b.board); await wait(400);
    push({ id: nextId(), kind: "divider", kicker: "The Boss", title: "The Board", sub: "No coaching. Work it.", boss: true }); await wait(600);
    push({ id: nextId(), kind: "wren", text: b.intro }); await speak(b.intro, b.introVoice);
    for (let i = 0; i < b.phases.length; i++) { push({ id: nextId(), kind: "phase", label: `Phase ${i + 1} · ${b.phases[i].name}` }); await wait(320); await runSteps(b.phases[i].steps); }
    push({ id: nextId(), kind: "wren", text: b.win }); await speak(b.win, b.winVoice);
    setDock({ type: "clear", text: "Case cracked ✓" }); await awaitUser();
  };

  const run = async (from: CaseStage = { kind: "skill", index: 0 }) => {
    setItems([]); setBoard("CASE BOARD");
    const total = warCase.skills.length;
    if (from.kind === "skill") {
      if (from.index === 0) { // fresh run: play the opening + roadmap
        for (let i = 0; i < warCase.open.length; i++) { const line = warCase.open[i]; push({ id: nextId(), kind: "wren", text: line }); await speak(line, warCase.openVoice?.[i]); }
        push({ id: nextId(), kind: "roadmap", title: warCase.title, actor: warCase.actor, skills: warCase.skills.map((s) => ({ n: s.n, title: s.title, goal: s.goal })) });
        await wait(650);
        setDock({ type: "clear", text: "Ready? Skill 1 first." }); await awaitUser();
      }
      for (let i = from.index; i < total; i++) {
        saveProgress(warCase.id, { kind: "skill", index: i });
        await runSkill(warCase.skills[i], total);
        setSkipRequested(false); // one skip = exactly one skill
        // Case 20 only: it contributes its OWN Zero File clue, like every
        // other case, but it has to land BEFORE the boss's "who is it"
        // deduction rather than at the usual test-pass moment (too late to
        // be useful as evidence) — right after Skill 6, "The turncoat",
        // the one skill that's actually about the coordinator being a
        // trained insider.
        if (warCase.id === "explorers-m20" && warCase.skills[i].n === 6) awardClue(warCase.id);
      }
    }
    if (from.kind === "skill" || from.kind === "boss") { saveProgress(warCase.id, { kind: "boss" }); await runBoss(); }
    saveProgress(warCase.id, { kind: "test" });
    setItems([]); setBoard("CASE BOARD"); await wait(400);
    push({ id: nextId(), kind: "wren", text: warCase.test.intro }); await speak(warCase.test.intro, warCase.test.introVoice);
    setDock({ type: "clear", text: "Start the test →" }); await awaitUser(); setDock(null);
    setPhase("test");
  };

  // Synchronous, inside this exact tap — same fix as Phone's cold-open audio
  // (PR #572): the real narration starts moments later inside run()'s async
  // chain, which is one tick too late for some mobile browsers' autoplay
  // unlock to still count as "the same gesture".
  const start = (from: CaseStage = { kind: "skill", index: 0 }) => { if (startedRef.current) return; startedRef.current = true; primeAudio(); setPhase("play"); run(from); };
  const beginFresh = () => { clearProgress(warCase.id); start({ kind: "skill", index: 0 }); };
  const beginResume = () => start(resumeStage ?? { kind: "skill", index: 0 });
  // `autostart`: the per-mission ATLAS briefing (WarRoomMissionIntro) already
  // did the job BootScreen's own "press to begin" screen exists for, so a
  // fresh arrival from that card skips straight into the case. Never skips
  // a RESUMABLE case — that prompt is a real choice, not a redundant gate.
  useEffect(() => {
    if (autostart && !isResumable(resumeStage)) beginFresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nudgeRef = useRef(0);
  // `voice`, when given, is the step's own authored badVoice (case-specific
  // correction — previously dropped in favour of this generic rotation even
  // when one existed). Falls back to the generic nudge clips for docks that
  // don't carry a case-specific line (choose).
  const nudgeBad = (text?: string, voice?: string) => {
    setNudge(text ?? "Not quite. Look again."); force();
    if (!voiceRef.current) return;
    if (voice) { playWren(voice, true); return; }
    const i = nudgeRef.current++ % NUDGES.length;
    playWren(NUDGES[i], true);
  };

  const wrenDot = <span aria-hidden style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 12 }}>{[4, 10, 6].map((h, i) => <i key={i} style={{ width: 2.5, height: h, background: C.wren, borderRadius: 2, display: "block" }} />)}</span>;

  return (
    <main className="wr" style={{ minHeight: "100dvh", background: `radial-gradient(900px 520px at 50% -8%, #241541 0%, rgba(36,21,65,0) 60%), ${C.page}`, color: C.ink, fontFamily: UI, display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 14px", overflow: "hidden", ["--v" as string]: acc }}>
      <style>{CSS}</style>
      {/* Per-case living world behind the dossier board (owner standard). Falls
          back to the block's plain violet matrix if a case hasn't set a theme. */}
      {THEME ? (
        <BlockBackdrop variant={THEME.backdrop} colors={THEME.matrix} accent={acc} accentHi={THEME.accentHi} reduced={!!reduce} opacity={0.5} />
      ) : (
        <MatrixRain reduced={!!reduce} opacity={0.12} colors={["#B98BFF", "#D4B8FF", "#7A5CFF"]} head="#F0E6FF" />
      )}

      <SkipButton />
      <BackButton target=".wr-work" />
      {/* UAT skip: fast-forwards the rest of the current skill in one click
          (narration + any dock resolved as if answered correctly), same
          one-click-per-skill contract as Phone's "Skip this whole skill". */}
      <button
        onClick={() => setSkipRequested(true)}
        disabled={phase !== "play"}
        aria-label="Skip this whole skill (testing)"
        style={{
          position: "fixed",
          bottom: 60,
          right: 14,
          zIndex: 70,
          fontFamily: MONO,
          fontSize: 11.5,
          fontWeight: 700,
          letterSpacing: "0.03em",
          color: phase === "play" ? "#7CFFC4" : "rgba(124,255,196,0.35)",
          background: "rgba(0,0,0,0.6)",
          border: `1px solid ${phase === "play" ? "rgba(124,255,196,0.55)" : "rgba(124,255,196,0.2)"}`,
          borderRadius: 999,
          padding: "8px 14px",
          cursor: phase === "play" ? "pointer" : "default",
          boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
        }}
      >
        Skip skill ⏭
      </button>
      <CaseJournal entries={journal} accent={acc} caseTitle={warCase.title} />
      {warCase.id === "explorers-m16" ? (
        <CaseBoardFileExplorer leads={warCase.skills} clearedCount={journal.length} accent={acc} caseTitle={warCase.title} actor={warCase.actor} />
      ) : (
        <CaseBoard leads={warCase.skills} clearedCount={journal.length} accent={acc} caseTitle={warCase.title} actor={warCase.actor} />
      )}
      <ZeroFile clues={zeroClues} total={ZERO_CLUES.length} />
      {clueToast && (
        <button
          className="wr-clue-toast"
          onClick={() => setClueToast(null)}
          aria-label="New Zero File clue added, dismiss"
          style={{
            position: "fixed",
            right: 14,
            bottom: 108,
            zIndex: 80,
            width: "min(300px, calc(100vw - 28px))",
            textAlign: "left",
            background: "linear-gradient(180deg,#1c0f10,#120a0b)",
            border: "1px solid rgba(255,77,77,0.5)",
            borderLeft: "3px solid #FF4D4D",
            borderRadius: 10,
            padding: "11px 13px",
            boxShadow: "0 10px 26px rgba(0,0,0,0.5)",
            cursor: "pointer",
          }}
        >
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", color: "#FF8080", fontWeight: 700, marginBottom: 4 }}>
            🔴 NEW ZERO FILE CLUE · {clueToast.caseNumber}
          </div>
          <div style={{ fontSize: 12.5, lineHeight: 1.4, color: C.ink }}>{clueToast.text}</div>
        </button>
      )}
      <button className="wr-btn" onClick={onExit} style={{ position: "fixed", top: 14, left: 14, zIndex: 20, fontFamily: MONO, fontSize: 11.5, fontWeight: 600, color: C.dim, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.edge}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>← Leave</button>
      <button className="wr-btn" onClick={() => { const v = !voiceOn; setVoiceOn(v); if (!v) stopWren(); }} aria-pressed={voiceOn} style={{ position: "fixed", top: 14, right: 14, zIndex: 20, fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: voiceOn ? C.wren : C.dim, background: "rgba(255,255,255,0.04)", border: `1px solid ${voiceOn ? "rgba(43,212,180,.5)" : C.edge}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>{voiceOn ? "🔊 WREN on" : "🔇 WREN off"}</button>
      <button className="wr-btn" onClick={cycleVoiceRate} aria-label={`WREN's talking speed: ${voiceRate}×. Tap to change.`} style={{ position: "fixed", top: 54, right: 14, zIndex: 20, fontFamily: MONO, fontSize: 11, fontWeight: 700, color: voiceRate !== 1 ? C.wren : C.dim, background: "rgba(255,255,255,0.04)", border: `1px solid ${voiceRate !== 1 ? "rgba(43,212,180,.5)" : C.edge}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>{voiceRate}×</button>

      <div style={{ width: "100%", maxWidth: 660, height: 760, maxHeight: "calc(100dvh - 30px)", background: "rgba(19,15,34,0.58)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: 14, border: `1px solid ${acc}55`, boxShadow: `0 0 0 1px #000, 0 24px 70px rgba(0,0,0,.6), inset 0 0 60px ${acc}08`, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 15px", borderBottom: `1px solid ${C.edge}`, background: "linear-gradient(180deg,rgba(27,21,51,0.75),rgba(19,15,34,0.55))", fontFamily: MONO }}>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: acc, boxShadow: `0 0 8px ${acc}`, animation: reduce ? "none" : "wr-led 1.6s infinite", display: "block" }} />
          <span style={{ fontSize: 11.5, letterSpacing: ".16em", color: acc, fontWeight: 600 }}>ARC · WAR ROOM</span>
          <span style={{ marginLeft: "auto", fontSize: 10.5, letterSpacing: ".12em", color: C.faint }}>{warCase.caseNumber} · {board}</span>
        </div>
        {/* persistent case identity — shown through every phase of play so a
            case reads as itself, not just a recolour of the last one (owner:
            every case should look unmistakably different, not just at boot) */}
        {phase === "play" && (
          <div style={{ flex: "0 0 auto", padding: "10px 15px 8px", borderBottom: `1px solid ${C.edge}`, display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 19, letterSpacing: "-.01em", color: acc, textShadow: `0 2px 18px ${acc}40` }}>{warCase.title}</span>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint, letterSpacing: ".04em" }}>vs {warCase.actor}</span>
          </div>
        )}

        {phase === "boot" ? (
          isResumable(resumeStage) ? (
            <ResumePrompt caseNumber={warCase.caseNumber} title={warCase.title} acc={acc} atLabel={stageLabel(resumeStage, warCase.skills)} onContinue={beginResume} onRestart={beginFresh} />
          ) : (
            <BootScreen title={warCase.title} caseNumber={warCase.caseNumber} open={warCase.open} acc={acc} onBoot={beginFresh} />
          )
        ) : phase === "test" ? (
          <TestView test={warCase.test} voiceOn={voiceOn} acc={acc} onPass={() => { markCaseComplete(warCase.id); clearProgress(warCase.id); awardClue(warCase.id); void saveExplorersProgress(parseInt(warCase.caseNumber.replace(/\D/g, ""), 10) || 0, { completed: true, xp: 100, screen: 99 }); setPhase("debrief"); }} />
        ) : phase === "debrief" ? (
          <Debrief data={warCase.debrief} acc={acc} caseId={warCase.id} xp={100} reduced={!!reduce} onExit={onExit} onNext={onNextCase} />
        ) : (
          <>
            <div ref={workRef} className="wr-work" style={{ flex: "1 1 auto", overflowY: "auto", padding: "16px 15px 10px", display: "flex", flexDirection: "column", gap: 4, backgroundImage: "radial-gradient(rgba(185,139,255,0.06) 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
              {items.map((it) => <ItemView key={it.id} it={it} acc={acc} wrenDot={wrenDot} />)}
            </div>
            <div style={{ flex: "0 0 auto", borderTop: `1px solid ${C.edge}`, background: "linear-gradient(180deg,#191233,#110d20)", padding: "12px 14px 15px" }}>
              <DockView dock={dock} nudge={nudge} acc={acc} onResolve={(v) => resolveRef.current?.(v)} onBad={nudgeBad} onOpenWatchlist={onOpenWatchlist} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ItemView({ it, acc, wrenDot }: { it: Item; acc: string; wrenDot: React.ReactNode }) {
  if (it.kind === "working") return <div className="wr-row" style={{ fontFamily: MONO, fontSize: 12, color: C.faint, padding: "4px 2px" }}>▚ pinning to board…</div>;
  if (it.kind === "note") {
    return (
      <div className="wr-row" style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.5, color: C.violetHi, background: "#0d0a17", border: `1px solid ${C.edge}`, borderLeft: `3px solid ${acc}`, borderRadius: 6, padding: "9px 12px", margin: "3px 0", whiteSpace: "pre-wrap" }}>
        <span style={{ color: C.faint }}>📌 </span>{it.text}
      </div>
    );
  }
  if (it.kind === "divider") {
    return (
      <div className="wr-row" style={{ margin: "6px 0 8px", textAlign: "center", padding: "13px 12px", background: it.boss ? "rgba(255,106,138,.08)" : "rgba(185,139,255,.08)", border: `1px solid ${it.boss ? "rgba(255,106,138,.4)" : "rgba(185,139,255,.4)"}`, borderRadius: 10 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: it.boss ? C.red : acc, fontWeight: 700 }}>{it.kicker}</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, margin: "3px 0 2px" }}>{it.title}</div>
        {it.sub && <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.35 }}>{it.sub}</div>}
      </div>
    );
  }
  if (it.kind === "phase") return <div className="wr-row" style={{ textAlign: "center", margin: "9px 0 4px" }}><span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.red, fontWeight: 700, background: "rgba(255,106,138,.1)", border: "1px solid rgba(255,106,138,.35)", borderRadius: 6, padding: "3px 12px" }}>{it.label}</span></div>;
  if (it.kind === "roadmap") {
    return (
      <div className="wr-row" style={{ margin: "8px 0 4px", background: "linear-gradient(180deg, rgba(185,139,255,.10), rgba(185,139,255,.03))", border: `1px solid rgba(185,139,255,.45)`, borderRadius: 10, padding: "14px 15px" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: C.violetHi, fontWeight: 700, marginBottom: 2 }}>Case board · vs {it.actor}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 11 }}>{it.skills.length} leads to work</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {it.skills.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span aria-hidden style={{ flex: "0 0 auto", width: 22, height: 22, borderRadius: 5, background: "rgba(185,139,255,.16)", border: `1px solid rgba(185,139,255,.5)`, color: C.violetHi, fontFamily: MONO, fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center" }}>{s.n}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700, color: C.ink, lineHeight: 1.2 }}>{s.title}</div>
                <div style={{ fontSize: 11.5, color: C.dim, lineHeight: 1.3 }}>{s.goal}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="wr-row" style={{ margin: "8px 2px 3px", background: C.wrenbg, border: `1px solid rgba(43,212,180,.5)`, borderRadius: 12, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ flex: "0 0 auto", width: 28, height: 28, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%,#1c5248,#0c2f29)", border: `1.5px solid ${C.wren}`, display: "grid", placeItems: "center" }}>{wrenDot}</span>
      <div style={{ fontSize: 13.5, lineHeight: 1.42 }}>
        <b style={{ color: C.wren, fontWeight: 700, display: "block", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 2 }}>WREN · in your ear</b>
        {it.text}
      </div>
    </div>
  );
}

function DockView({ dock, nudge, acc, onResolve, onBad, onOpenWatchlist }: { dock: Dock; nudge: string | null; acc: string; onResolve: (v: string) => void; onBad: (t?: string, voice?: string) => void; onOpenWatchlist?: () => void }) {
  const [sel, setSel] = useState<number[]>([]);        // pin: selected card indices
  const [selLeft, setSelLeft] = useState<string | null>(null); // connect: currently picked left id
  const [matched, setMatched] = useState<string[]>([]);        // connect: solved left ids
  const [pool, setPool] = useState<number[]>([]);       // sequence: shuffled indices still unplaced
  const [placed, setPlaced] = useState<number[]>([]);   // sequence: indices tapped, in order
  const [flipSide, setFlipSide] = useState<"you" | "them">("you");
  const [flipToggleOn, setFlipToggleOn] = useState(false);
  const [flipChoiceIdx, setFlipChoiceIdx] = useState<number | null>(null);
  const flipFiredRef = useRef(false);
  useEffect(() => {
    setSel([]); setSelLeft(null); setMatched([]); setPlaced([]);
    setPool(dock?.type === "sequence" ? shuffled(dock.cards.length) : []);
    if (dock?.type === "flip") { setFlipSide("you"); setFlipToggleOn(false); setFlipChoiceIdx(null); flipFiredRef.current = false; }
  }, [dock]);
  // auto-resolves the instant the GOOD state has been viewed on THEIR face.
  useEffect(() => {
    if (dock?.type !== "flip" || flipFiredRef.current) return;
    const good = dock.you.kind === "toggle" ? flipToggleOn : dock.you.options[flipChoiceIdx ?? -1]?.outcome === "good";
    if (flipSide === "them" && good) { flipFiredRef.current = true; onResolve("ok"); }
  }, [dock, flipSide, flipToggleOn, flipChoiceIdx, onResolve]);

  if (!dock || dock.type === "idle") return <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, opacity: 0.6, textAlign: "center", padding: "6px 0" }}>board idle…</div>;
  if (dock.type === "clear") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13.5, color: C.mint, margin: "2px 0 11px", fontWeight: 600, fontFamily: MONO }}>{dock.text}</p>
        <button className="wr-btn" onClick={() => onResolve("go")} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: acc, border: 0, borderRadius: 6, padding: "10px 24px", cursor: "pointer" }}>CONTINUE →</button>
      </div>
    );
  }
  if (dock.type === "choose") {
    return (
      <>
        <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "Choose:"}</p>
        {dock.showGallery && onOpenWatchlist && (
          <button
            onClick={onOpenWatchlist}
            style={{ display: "block", margin: "0 auto 10px", fontFamily: MONO, fontSize: 11.5, fontWeight: 700, letterSpacing: ".04em", color: acc, background: "transparent", border: `1px solid ${acc}55`, borderRadius: 999, padding: "7px 14px", cursor: "pointer" }}
          >
            📁 Check the Watchlist first
          </button>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dock.options.map((o, i) => (
            <button key={i} className="wr-opt" onClick={() => onResolve(o.label)} style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, textAlign: "left", color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 8, padding: "11px 14px", cursor: "pointer" }}>
              {o.label}{o.sub && <span style={{ display: "block", fontSize: 11.5, color: C.dim, fontWeight: 500, marginTop: 2 }}>{o.sub}</span>}
            </button>
          ))}
        </div>
      </>
    );
  }
  if (dock.type === "connect") {
    const total = dock.pairs.length;
    const rightIdForLeft = (lid: string) => dock.pairs.find((p) => p[0] === lid)?.[1];
    const matchedRight = matched.map((lid) => rightIdForLeft(lid));
    const tapLeft = (lid: string) => { if (matched.includes(lid)) return; setSelLeft(lid === selLeft ? null : lid); };
    const tapRight = (rid: string) => {
      if (matchedRight.includes(rid)) return;
      if (!selLeft) { onBad("Pick a card on the left first, then its match on the right."); return; }
      if (rightIdForLeft(selLeft) === rid) {
        const nm = [...matched, selLeft]; setMatched(nm); setSelLeft(null);
        if (nm.length === total) setTimeout(() => onResolve("ok"), 350);
      } else { setSelLeft(null); onBad(dock.bad ?? "Not a match. Look again at what links to what.", dock.badVoice); }
    };
    return (
      <>
        {nudge ? <p style={{ fontSize: 12.5, color: C.red, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{nudge}</p>
          : <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "Link the board:"} <span style={{ color: acc }}>({matched.length}/{total})</span></p>}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            {dock.left.map((l) => {
              const done = matched.includes(l.id); const on = selLeft === l.id;
              return <button key={l.id} className="wr-opt" disabled={done} onClick={() => tapLeft(l.id)}
                style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, textAlign: "left", color: done ? C.mint : C.ink, background: done ? "rgba(79,217,168,.12)" : on ? "rgba(185,139,255,.18)" : C.chip, border: `1px solid ${done ? "rgba(79,217,168,.5)" : on ? acc : C.chipedge}`, borderRadius: 8, padding: "10px 11px", cursor: done ? "default" : "pointer" }}>{done ? "✓ " : ""}{l.label}</button>;
            })}
          </div>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
            {dock.right.map((r) => {
              const done = matchedRight.includes(r.id);
              return <button key={r.id} className="wr-opt" disabled={done} onClick={() => tapRight(r.id)}
                style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, textAlign: "left", color: done ? C.mint : C.ink, background: done ? "rgba(79,217,168,.12)" : C.chip, border: `1px solid ${done ? "rgba(79,217,168,.5)" : C.chipedge}`, borderRadius: 8, padding: "10px 11px", cursor: done ? "default" : "pointer" }}>{done ? "✓ " : ""}{r.label}</button>;
            })}
          </div>
        </div>
      </>
    );
  }
  if (dock.type === "sequence") {
    const total = dock.cards.length;
    const tapPool = (idx: number) => { setPool((p) => p.filter((i) => i !== idx)); setPlaced((p) => [...p, idx]); };
    const tapPlaced = (pos: number) => { // undo: pull a placed card back to the pool
      const idx = placed[pos];
      setPlaced((p) => p.filter((_, i) => i !== pos));
      setPool((p) => [...p, idx]);
    };
    const submit = () => {
      const ok = placed.every((idx, i) => dock.cards[idx].id === dock.cards[i]?.id) && placed.length === total;
      if (ok) onResolve("ok");
      else { onBad(dock.bad ?? "Not quite the right order. Have another look, then rebuild it.", dock.badVoice); setPlaced([]); setPool(shuffled(total)); }
    };
    return (
      <>
        {nudge ? <p style={{ fontSize: 12.5, color: C.red, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{nudge}</p>
          : <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "Tap the cards into order:"} <span style={{ color: acc }}>({placed.length}/{total})</span></p>}
        {/* the chain being built, left to right, one numbered slot per card */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10, flexWrap: "wrap" }}>
          {Array.from({ length: total }).map((_, pos) => {
            const idx = placed[pos];
            const filled = idx !== undefined;
            return (
              <button key={pos} className="wr-opt" disabled={!filled} onClick={() => tapPlaced(pos)}
                style={{ flex: "1 1 0", minWidth: 0, fontFamily: UI, fontSize: 12, fontWeight: 700, textAlign: "center", color: filled ? C.page : C.faint, background: filled ? acc : C.chip, border: `1px solid ${filled ? acc : C.chipedge}`, borderRadius: 8, padding: "9px 4px", cursor: filled ? "pointer" : "default" }}>
                <span style={{ display: "block", fontSize: 9, opacity: 0.75, marginBottom: 2 }}>{pos + 1}</span>
                {filled ? dock.cards[idx].label : "—"}
              </button>
            );
          })}
        </div>
        {/* the shuffled pool: tap to append to the chain */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
          {pool.map((idx) => (
            <button key={idx} className="wr-opt" onClick={() => tapPool(idx)}
              style={{ fontFamily: UI, fontSize: 13, fontWeight: 600, color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", textAlign: "left" }}>
              {dock.cards[idx].label}{dock.cards[idx].sub && <span style={{ display: "block", fontSize: 10.5, fontWeight: 500, color: C.dim, marginTop: 1 }}>{dock.cards[idx].sub}</span>}
            </button>
          ))}
        </div>
        <button className="wr-btn" onClick={submit} disabled={placed.length !== total} style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: placed.length === total ? acc : "#3a2f5e", border: 0, borderRadius: 6, padding: "11px", cursor: placed.length === total ? "pointer" : "not-allowed" }}>LOCK THE CHAIN</button>
      </>
    );
  }
  if (dock.type === "flip") {
    const isToggle = dock.you.kind === "toggle";
    const pickedOutcome = !isToggle && dock.you.kind === "choice" && flipChoiceIdx !== null ? dock.you.options[flipChoiceIdx].outcome : null;
    const canFlip = isToggle || pickedOutcome !== null;
    const pageLabel = flipSide === "you" ? dock.you.label : dock.them.label;
    const pageSub = flipSide === "you" ? dock.you.sub : undefined;
    const themText = isToggle
      ? (flipToggleOn ? dock.them.whenGood : dock.them.whenBad)
      : pickedOutcome === "good" ? dock.them.whenGood : pickedOutcome === "bad" ? dock.them.whenBad : "";
    const themGood = isToggle ? flipToggleOn : pickedOutcome === "good";
    return (
      <>
        <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "Flip between both sides."}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 9 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".16em", fontWeight: 700, color: flipSide === "you" ? acc : C.faint, padding: "3px 9px", borderRadius: 999, border: `1px solid ${flipSide === "you" ? acc : C.chipedge}`, background: flipSide === "you" ? `${acc}1a` : "transparent" }}>YOUR SIDE</span>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".16em", fontWeight: 700, color: flipSide === "them" ? C.red : C.faint, padding: "3px 9px", borderRadius: 999, border: `1px solid ${flipSide === "them" ? C.red : C.chipedge}`, background: flipSide === "them" ? "rgba(255,106,138,.12)" : "transparent" }}>THEIR SIDE</span>
        </div>
        <div key={flipSide} className="wr-row" style={{ background: C.chip, border: `1px solid ${flipSide === "them" ? "rgba(255,106,138,.4)" : C.chipedge}`, borderRadius: 10, padding: "13px 14px", marginBottom: 11, minHeight: 96 }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", color: C.faint, marginBottom: 6 }}>{pageLabel.toUpperCase()}</div>
          {pageSub && <div style={{ fontSize: 11, color: C.dim, marginBottom: 8 }}>{pageSub}</div>}
          {flipSide === "you" && dock.you.kind === "toggle" && (
            <button className="wr-sw" role="switch" aria-checked={flipToggleOn} onClick={() => setFlipToggleOn((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: flipToggleOn ? "rgba(79,217,168,.12)" : C.chip, border: `1px solid ${flipToggleOn ? "rgba(79,217,168,.5)" : C.chipedge}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontFamily: UI, width: "100%" }}>
              <span aria-hidden style={{ flex: "0 0 auto", width: 40, height: 22, borderRadius: 999, background: flipToggleOn ? C.mint : "#2a2447", position: "relative" }}>
                <span style={{ position: "absolute", top: 2, left: flipToggleOn ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#0c0a17" }} />
              </span>
              <span style={{ fontSize: 13, color: C.ink, fontWeight: 700 }}>{flipToggleOn ? dock.you.on : dock.you.off}</span>
              <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: flipToggleOn ? C.mint : C.faint }}>{flipToggleOn ? "ON" : "OFF"}</span>
            </button>
          )}
          {flipSide === "you" && dock.you.kind === "choice" && (
            <>
              <p style={{ fontSize: 12.5, color: C.dim, margin: "0 0 8px", fontWeight: 600 }}>{dock.you.prompt}</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {dock.you.options.map((o, i) => {
                  const isPicked = flipChoiceIdx === i;
                  return (
                    <button key={i} className="wr-opt" onClick={() => setFlipChoiceIdx(i)}
                      style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 600, textAlign: "left", color: C.ink, background: isPicked ? (o.outcome === "good" ? "rgba(79,217,168,.14)" : "rgba(255,106,138,.14)") : C.chip, border: `1px solid ${isPicked ? (o.outcome === "good" ? "rgba(79,217,168,.5)" : "rgba(255,106,138,.5)") : C.chipedge}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer" }}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {flipSide === "them" && (
            <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: ".03em", lineHeight: 1.6, color: themText ? (themGood ? C.mint : C.red) : C.faint }}>
              {themText || "— nothing to show yet, flip back and decide —"}
            </div>
          )}
        </div>
        <button className="wr-btn" disabled={!canFlip} onClick={() => setFlipSide((s) => (s === "you" ? "them" : "you"))}
          style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: !canFlip ? "#3a2f5e" : acc, border: 0, borderRadius: 6, padding: "11px", cursor: !canFlip ? "not-allowed" : "pointer" }}>
          {flipSide === "you" ? `FLIP → SEE ${dock.them.label.toUpperCase()}` : "FLIP BACK"}
        </button>
      </>
    );
  }
  // pin
  const need = dock.need;
  const toggle = (i: number) => setSel((a) => (a.includes(i) ? a.filter((x) => x !== i) : a.length < need ? [...a, i] : a));
  const submit = () => { const chosen = sel.map((i) => dock.cards[i]); if (chosen.length === need && chosen.every((c) => c.good)) onResolve("ok"); else onBad(dock.bad ?? "Not quite. Pin only the right cards.", dock.badVoice); };
  return (
    <>
      {nudge ? <p style={{ fontSize: 12.5, color: C.red, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{nudge}</p>
        : <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "Pin the board:"} <span style={{ color: acc }}>({sel.length}/{need})</span></p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
        {dock.cards.map((c, i) => {
          const on = sel.includes(i);
          return <button key={i} className="wr-opt" onClick={() => toggle(i)} style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: on ? C.page : C.ink, background: on ? acc : C.chip, border: `1px solid ${on ? acc : C.chipedge}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer", textAlign: "left" }}>{c.label}{c.sub && <span style={{ display: "block", fontSize: 10.5, fontWeight: 500, color: on ? "#3a2560" : C.dim, marginTop: 1 }}>{c.sub}</span>}</button>;
        })}
      </div>
      <button className="wr-btn" onClick={submit} disabled={sel.length !== need} style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: sel.length === need ? acc : "#3a2f5e", border: 0, borderRadius: 6, padding: "11px", cursor: sel.length === need ? "pointer" : "not-allowed" }}>PIN TO BOARD</button>
    </>
  );
}

function shuffled(n: number): number[] { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function TestView({ test, voiceOn, acc, onPass }: { test: WarTest; voiceOn: boolean; acc: string; onPass: () => void }) {
  const [qi, setQi] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState<null | "pass" | "fail">(null);
  const [orders, setOrders] = useState<number[][]>(() => test.questions.map((q) => shuffled(q.options.length)));
  const [whyOrders, setWhyOrders] = useState<number[][]>(() => test.questions.map((q) => shuffled(q.why?.options.length ?? 0)));
  // A two-staged question (cases 18-20): "why" holds the picked answer's
  // rightness until the follow-up resolves, so both have to land for the
  // question to count — see WarTestQ.why above.
  const [stage, setStage] = useState<"main" | "why">("main");
  const [mainRight, setMainRight] = useState(false);
  const [pickedIdx, setPickedIdx] = useState<number | null>(null);
  useEffect(() => { // focus/study music bed under the exam (Guardian Calm, same as Cyber Heroes)
    if (!voiceOn) return;
    playBGM("bgmFocus");
    return () => stopBGM(700);
  }, [voiceOn]);
  const restart = () => {
    setQi(0); setCorrect(0); setResult(null); setStage("main"); setMainRight(false); setPickedIdx(null);
    setOrders(test.questions.map((q) => shuffled(q.options.length)));
    setWhyOrders(test.questions.map((q) => shuffled(q.why?.options.length ?? 0)));
  };
  const advance = (right: boolean) => {
    const nc = correct + (right ? 1 : 0);
    setStage("main"); setMainRight(false); setPickedIdx(null);
    if (qi + 1 < test.questions.length) { setCorrect(nc); setQi(qi + 1); }
    else { setCorrect(nc); const passed = nc >= test.pass; setResult(passed ? "pass" : "fail"); const v = passed ? test.passVoice : test.failVoice; if (voiceOn && v) playWren(v, true); }
  };
  const answer = (oi: number) => {
    const q = test.questions[qi];
    const right = !!q.options[oi].correct;
    if (q.why) { setMainRight(right); setPickedIdx(oi); setStage("why"); return; }
    advance(right);
  };
  const answerWhy = (oi: number) => {
    const right = mainRight && !!test.questions[qi].why!.options[oi].correct;
    advance(right);
  };
  if (result) {
    const passed = result === "pass";
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px 30px", textAlign: "center" }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>{passed ? "🎖️" : "🔁"}</div>
        <div style={{ fontSize: 23, fontWeight: 800, color: passed ? C.mint : acc, marginBottom: 8, fontFamily: MONO }}>{passed ? "CASE CLOSED" : "NOT YET"}</div>
        <div style={{ fontSize: 15, color: C.ink, marginBottom: 8 }}>You got <b style={{ color: passed ? C.mint : acc }}>{correct} of {test.questions.length}</b> right.</div>
        <div style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.5, marginBottom: 24 }}>{passed ? "Every lead connected. That's a pass." : `You need ${test.pass} to close the case. Run it again, you've got this.`}</div>
        <button className="wr-btn" onClick={passed ? onPass : restart} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.page, background: passed ? C.mint : acc, border: 0, borderRadius: 6, padding: "13px 20px", cursor: "pointer" }}>{passed ? "FINISH →" : "RUN THE TEST AGAIN"}</button>
      </div>
    );
  }
  const q = test.questions[qi]; const order = orders[qi];
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflowY: "auto", padding: "18px 20px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, fontFamily: MONO }}>
        <span style={{ fontSize: 10.5, letterSpacing: ".18em", textTransform: "uppercase", color: acc, fontWeight: 700 }}>The Test · Prove it</span>
        <span style={{ fontSize: 12, color: C.dim, fontWeight: 600 }}>{qi + 1} / {test.questions.length}</span>
      </div>
      <div style={{ height: 4, background: C.chip, borderRadius: 4, marginBottom: 18, overflow: "hidden" }}><div style={{ height: "100%", width: `${(qi / test.questions.length) * 100}%`, background: acc, transition: "width .3s" }} /></div>
      <div style={{ background: "#0d0a17", border: `1px solid ${C.edge}`, borderLeft: `3px solid ${acc}`, borderRadius: 8, padding: "12px 14px", fontSize: 14.5, lineHeight: 1.45, color: C.ink, marginBottom: 16 }}>{q.scenario}</div>
      {stage === "why" && q.why ? (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14, opacity: 0.7 }}>
            <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: acc, fontWeight: 700, flex: "0 0 auto" }}>YOUR PICK</span>
            <span style={{ fontSize: 13, color: C.dim, textDecoration: "line-through" }}>{q.options[pickedIdx!].label}</span>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{q.why.ask}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {whyOrders[qi].map((oi) => <button key={oi} className="wr-opt" onClick={() => answerWhy(oi)} style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, textAlign: "left", color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>{q.why!.options[oi].label}</button>)}
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{q.ask}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {order.map((oi) => <button key={oi} className="wr-opt" onClick={() => answer(oi)} style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, textAlign: "left", color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>{q.options[oi].label}</button>)}
          </div>
        </>
      )}
    </div>
  );
}

function BootScreen({ title, caseNumber, open, acc, onBoot }: { title: string; caseNumber: string; open: string[]; acc: string; onBoot: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 30px 30px", textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".28em", textTransform: "uppercase", color: acc, fontWeight: 700, marginBottom: 6 }}>{caseNumber}</div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-.01em", marginBottom: 28 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, textAlign: "left", marginBottom: 26 }}>
        {open.slice(0, 2).map((l, i) => <div key={i} style={{ background: C.wrenbg, border: `1px solid rgba(43,212,180,.4)`, borderRadius: 10, padding: "16px 13px", fontSize: 13.5, lineHeight: 1.42, color: C.ink }}>{l}</div>)}
      </div>
      <button className="wr-btn" onClick={onBoot} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: ".04em", color: C.page, background: acc, border: 0, borderRadius: 6, padding: "13px 20px", cursor: "pointer" }}>▸ OPEN THE BOARD</button>
    </div>
  );
}

function Debrief({ data, acc, caseId, xp, reduced, onExit, onNext }: { data: WarCase["debrief"]; acc: string; caseId: string; xp: number; reduced: boolean; onExit?: () => void; onNext?: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    // Same fix as Phone/Console's Debrief: without overflowY the closing
    // ceremony can push past a short window with no way to scroll down to
    // "Next case".
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto", padding: "0 26px 26px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.mint, marginBottom: 14, textAlign: "center", lineHeight: 1.2, fontFamily: MONO }}>{data.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {data.lines.map((l, i) => <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.45, color: C.ink }}><span style={{ color: C.mint, flex: "0 0 auto" }}>✓</span><span>{l}</span></div>)}
      </div>
      <div style={{ background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 10, padding: "13px 15px", fontSize: 13.5, lineHeight: 1.5, color: C.dim, marginBottom: 20 }}>
        <b style={{ color: acc, display: "block", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5, fontFamily: MONO }}>Your move this week</b>{data.move}
      </div>
      <ClosingCeremony
        caseId={caseId}
        xp={xp}
        accent={acc}
        reduced={reduced}
        font={MONO}
        ink={C.ink}
        dim={C.dim}
        signoff="Board cleared, Agent. Until the next case."
        onStamp={() => setRevealed(true)}
      />
      {revealed && (
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="wr-btn" onClick={onExit} style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 6, padding: "12px", cursor: "pointer" }}>Back to map</button>
          {onNext && <button className="wr-btn" onClick={onNext} style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: C.page, background: acc, border: 0, borderRadius: 6, padding: "12px", cursor: "pointer" }}>Next case →</button>}
        </div>
      )}
    </div>
  );
}
