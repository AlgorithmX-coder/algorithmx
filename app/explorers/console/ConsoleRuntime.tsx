"use client";

/**
 * THE CONSOLE — Block 3's runtime (Systems). Not the Signal Room, not the Phone.
 * An amber operator control-panel where you OPERATE the machine: flip switches,
 * build a vault, read system readouts. Same framework as the phone (7 skills
 * LEARN -> PRACTICE, roadmap, blind boss, must-pass test, anti-skip, ?fast=1),
 * a genuinely different game. Data-driven by a ConsoleCase (see console/case11.ts).
 */

import { useEffect, useReducer, useRef, useState } from "react";
import { HubStarfield, HubEnergy } from "./HubField";
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
import type { ConsoleCase, ConsoleStep, ConsoleTest } from "./case11";

const C = {
  page: "#050402", ink: "#F4ECD8", dim: "#B39B6E", faint: "#877857",
  panel: "#0e0b05", panel2: "#1c160c", edge: "#3a2f16", chip: "#1a1409", chipedge: "#43371c",
  amber: "#FFB23E", amberHi: "#FFD27A", amberbg: "#2a2110",
  wren: "#2BD4B4", wrenbg: "#0f2622",
  red: "#FF6A4D", mint: "#4FD98A",
};
/** Sharp, rectangular — a terminal window, not a soft modern card. Every
 *  borderRadius in this file was hand-tuned from the pre-reskin softer
 *  values (6-14px) down to this one shared scale, so the whole console
 *  reads as one consistent "hacker UI" rather than a patchwork. */
const R = { panel: 3, card: 2, btn: 2 };
const MONO = `"IBM Plex Mono", ui-monospace, Consolas, monospace`;
/** Shift letters by n (mod 26), preserving everything else — the "decode" dial. */
const CIPHER_A = "A".charCodeAt(0);
function caesar(text: string, n: number): string {
  return text
    .toUpperCase()
    .split("")
    .map((ch) => {
      const c = ch.charCodeAt(0);
      if (c < CIPHER_A || c > CIPHER_A + 25) return ch;
      return String.fromCharCode(((c - CIPHER_A + n + 26) % 26) + CIPHER_A);
    })
    .join("");
}
const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;
const NUDGES = ["/audio/wren/nudge-1.mp3", "/audio/wren/nudge-2.mp3", "/audio/wren/nudge-3.mp3"];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
.cn *{box-sizing:border-box}
.cn-work::-webkit-scrollbar{width:0}
@keyframes cn-pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes cn-led{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes cn-scan{0%{background-position:0 0}100%{background-position:0 7px}}
@keyframes cn-blink{0%,49%{opacity:1}50%,100%{opacity:0}}
@keyframes cn-flicker{0%{opacity:.3}4%{opacity:.9}8%{opacity:.4}12%{opacity:1}100%{opacity:1}}
@keyframes cn-sweep{0%{transform:translateY(-100%)}100%{transform:translateY(100%)}}
.cn-row{animation:cn-pop .26s ease both}
.cn-opt{transition:border-color .15s,background .15s,box-shadow .15s}
.cn-opt:hover:not(:disabled){border-color:var(--amber);box-shadow:0 0 0 1px var(--amber) inset}
.cn-opt:focus-visible{outline:2px solid var(--amber);outline-offset:2px}
.cn-sw{transition:background .15s,border-color .15s}
.cn-btn:focus-visible{outline:2px solid var(--amber);outline-offset:2px}
.cn-cursor{display:inline-block;width:7px;height:1em;background:currentColor;vertical-align:text-bottom;animation:cn-blink 1s step-end infinite;margin-left:1px}
.cn-crt{animation:cn-flicker .6s ease both}
.cn-scanlines{position:absolute;inset:0;z-index:5;pointer-events:none;background-image:repeating-linear-gradient(0deg,rgba(0,0,0,0.18) 0 1px,transparent 1px 3px);mix-blend-mode:multiply}
.cn-sweepbar{position:absolute;left:0;right:0;height:120px;background:linear-gradient(180deg,transparent,rgba(255,178,62,0.05) 45%,transparent);animation:cn-sweep 7s linear infinite;pointer-events:none}
.sr-stamp-in{animation:srStamp .3s cubic-bezier(.2,0,0,1)}
@keyframes srStamp{0%{transform:rotate(-3deg) scale(1.15);opacity:0}30%{transform:rotate(-3deg) scale(1);opacity:1}38%{transform:rotate(-3deg) scale(1) translate(2px,0)}46%{transform:rotate(-3deg) scale(1) translate(0,0)}100%{transform:rotate(-3deg) scale(1);opacity:.9}}
.sr-xpnum{display:inline-block;animation:srXpNum .5s cubic-bezier(.2,0,0,1)}
@keyframes srXpNum{0%{transform:scale(1.35)}100%{transform:scale(1)}}
@media (prefers-reduced-motion: reduce){.cn *{animation-duration:.001ms !important}.cn-sweepbar{display:none}}
`;

type Item =
  | { id: number; kind: "wren"; text: string }
  | { id: number; kind: "sys"; text: string }
  | { id: number; kind: "divider"; kicker: string; title: string; sub?: string; boss?: boolean }
  | { id: number; kind: "phase"; label: string }
  | { id: number; kind: "roadmap"; title: string; actor: string; skills: { n: number; title: string; goal: string }[] }
  | { id: number; kind: "working" };

type Dock =
  | { type: "choose"; prompt?: string; options: { label: string; sub?: string; outcome?: "good" | "bad"; then?: ConsoleStep[] }[] }
  | { type: "toggle"; prompt?: string; switches: { label: string; sub?: string; want: boolean }[]; bad?: string; badVoice?: string }
  | { type: "build"; prompt?: string; parts: { label: string; good: boolean; sub?: string }[]; need: number; bad?: string; badVoice?: string }
  | { type: "decode"; ciphertext: string; shift: number; prompt?: string }
  | { type: "spot"; segments: { text: string; tellId?: string }[]; prompt?: string }
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

type Header = { who: string; sub: string };
const WREN_HEADER: Header = { who: "WREN", sub: "in your ear" };

export default function ConsoleRuntime({ consoleCase, onExit, onNextCase, autostart }: { consoleCase: ConsoleCase; onExit?: () => void; onNextCase?: () => void; autostart?: boolean }) {
  useArrowAdvance(); // ArrowRight: fast-forward through narration for UAT
  const fast = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fast") === "1";
  const [phase, setPhase] = useState<"boot" | "play" | "test" | "debrief">("boot");
  const [panel, setPanel] = useState<string>("ARC SYSTEMS");
  const [items, setItems] = useState<Item[]>([]);
  const [dock, setDock] = useState<Dock>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(!fast);
  const voiceRef = useRef(!fast);
  const voiceRate = useVoiceRate();
  const cycleVoiceRate = () => setVoiceRate(VOICE_RATES[(VOICE_RATES.indexOf(voiceRate) + 1) % VOICE_RATES.length]);
  useWrenSpeaking();
  const [, force] = useReducer((n) => n + 1, 0);
  const acc = consoleCase.accent ?? C.amber;
  const [journal, setJournal] = useState<JournalEntry[]>([]);
  useEffect(() => { setJournal(loadJournal(consoleCase.id)); }, [consoleCase.id]);
  const [resumeStage] = useState<CaseStage | null>(() => readProgress(consoleCase.id));
  // UAT skip: one click fast-forwards through whatever's left of the CURRENT
  // skill only (narration + any dock waiting on input), then clears itself —
  // same one-click-per-skill contract as Phone's "Skip this whole skill".
  const [skipRequested, setSkipRequested] = useState(false);

  const reduce = fast || skipRequested || (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  const idRef = useRef(0);
  const resolveRef = useRef<((v: string) => void) | null>(null);
  const startedRef = useRef(false);
  const workRef = useRef<HTMLDivElement>(null);

  const nextId = () => ++idRef.current;
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, reduce ? Math.min(ms, 120) : ms));
  useEffect(() => { const t = workRef.current; if (t) t.scrollTop = t.scrollHeight; }, [items, dock]);
  const push = (it: Item) => setItems((a) => [...a, it]);

  const working = async (ms: number) => { const id = nextId(); push({ id, kind: "working" }); await wait(ms); setItems((a) => a.filter((x) => x.id !== id)); };
  const awaitUser = () => new Promise<string>((res) => { resolveRef.current = res; });

  // While a skip is in flight, immediately resolve whatever dock is currently
  // blocking, as if the right input had just been given, instead of waiting
  // for a real tap — same approach as Phone's identical effect. toggle/build/
  // decode/spot all gate correctness inside DockView's own local submit
  // handlers (the parent only ever awaits an "ok" string, never checks it),
  // so resolving "ok" directly here is exactly what a correct submit sends.
  useEffect(() => {
    if (!skipRequested || !dock) return;
    if (dock.type === "choose") {
      const safe = dock.options.find((o) => o.outcome !== "bad") ?? dock.options[0];
      resolveRef.current?.(safe.label);
      return;
    }
    if (dock.type === "clear") { resolveRef.current?.("go"); return; }
    if (dock.type === "toggle" || dock.type === "build" || dock.type === "decode" || dock.type === "spot" || dock.type === "flip") {
      resolveRef.current?.("ok");
      return;
    }
  }, [dock, skipRequested]);

  const speak = (text: string, voice?: string) =>
    new Promise<void>((res) => {
      let done = false;
      const fin = () => { if (!done) { done = true; res(); } };
      // 16000 was too short for this block's longer skill-intro lines
      // (some run 300+ characters) — the dock could appear, and a tap
      // skip the rest of the narration, while the real clip was still
      // playing (UAT: "Module 3... the task often pops up before WREN
      // has finished"). This backstop only exists for the case the
      // native `ended` event never fires at all; playWren's own
      // duration-aware safety timer doesn't call this callback, so it's
      // not redundant with that. 30000 matches the value Phone's
      // identical `speak()` already uses.
      if (voice && voiceRef.current && !reduce) { playWren(voice, true, fin); setTimeout(fin, 30000); }
      else { if (voice && voiceRef.current) playWren(voice, true); setTimeout(fin, reduce ? 250 : Math.max(2400, text.length * 42)); }
    });

  useEffect(() => { voiceRef.current = voiceOn; }, [voiceOn]);
  useEffect(() => () => stopWren(), []);

  const runSteps = async (steps: ConsoleStep[]) => {
    for (const step of steps) {
      if (step.t === "wren") {
        push({ id: nextId(), kind: "wren", text: step.text }); await speak(step.text, step.voice);
      } else if (step.t === "sys") {
        await working(step.text.length > 40 ? 700 : 450);
        push({ id: nextId(), kind: "sys", text: step.text }); await wait(500);
      } else if (step.t === "choose") {
        let done = false;
        // Shuffled once per presentation, not per render — matched by label,
        // not index, so reordering is always safe. Without this the correct
        // option sat in the same authored slot (almost always first) every
        // single time.
        const choiceOptions = shuffled(step.options.length).map((i) => step.options[i]);
        while (!done) {
          setNudge(null);
          setDock({ type: "choose", prompt: step.prompt, options: choiceOptions });
          const picked = await awaitUser(); setDock(null);
          const opt = step.options.find((o) => o.label === picked)!;
          if (opt.then) await runSteps(opt.then);
          if (opt.outcome === "bad") { await wait(250); continue; }
          done = true;
        }
      } else if (step.t === "toggle") {
        setNudge(null);
        // Checked by each switch's own `want` flag, never by position, so
        // shuffling render order is safe — without it the correct switches
        // sat in the same first slots every time (UAT: Week 11).
        const switches = shuffled(step.switches.length).map((i) => step.switches[i]);
        setDock({ type: "toggle", prompt: step.prompt, switches, bad: step.bad, badVoice: step.badVoice });
        await awaitUser(); // resolves only when the switches match
        setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      } else if (step.t === "build") {
        setNudge(null);
        // Checked by each part's own `good` flag, never by position — same
        // fix as "toggle" above.
        const parts = shuffled(step.parts.length).map((i) => step.parts[i]);
        setDock({ type: "build", prompt: step.prompt, parts, need: step.need, bad: step.bad, badVoice: step.badVoice });
        await awaitUser(); // resolves only when the right parts are chosen
        setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      } else if (step.t === "decode") {
        setNudge(null);
        setDock({ type: "decode", ciphertext: step.ciphertext, shift: step.shift, prompt: step.prompt });
        await awaitUser(); // resolves the instant the dial lands on the right shift
        setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      } else if (step.t === "spot") {
        setNudge(null);
        setDock({ type: "spot", segments: step.segments, prompt: step.prompt });
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

  const runSkill = async (sk: ConsoleCase["skills"][number], total: number) => {
    setDock(null); setItems([]); setPanel(sk.panel ?? "ARC SYSTEMS"); await wait(400);
    push({ id: nextId(), kind: "divider", kicker: `Skill ${sk.n} of ${total}`, title: sk.title, sub: sk.goal }); await wait(600);
    await runSteps(sk.learn);
    await runSteps(sk.practice);
    push({ id: nextId(), kind: "wren", text: ETHICS_LINE }); await speak(ETHICS_LINE, ETHICS_VOICE);
    setJournal(addJournalEntry(consoleCase.id, { skillN: sk.n, title: sk.title, note: sk.journalNote }));
    setDock({ type: "clear", text: `Skill ${sk.n} complete ✓` });
    await awaitUser();
  };

  const runBoss = async () => {
    const b = consoleCase.boss;
    setDock(null); setItems([]); setPanel(b.panel); await wait(400);
    push({ id: nextId(), kind: "divider", kicker: "The Boss", title: "Live Attack", sub: "No coaching. Hold the line.", boss: true }); await wait(600);
    push({ id: nextId(), kind: "wren", text: b.intro }); await speak(b.intro, b.introVoice);
    for (let i = 0; i < b.phases.length; i++) {
      push({ id: nextId(), kind: "phase", label: `Phase ${i + 1} · ${b.phases[i].name}` }); await wait(320);
      await runSteps(b.phases[i].steps);
    }
    push({ id: nextId(), kind: "wren", text: b.win }); await speak(b.win, b.winVoice);
    setDock({ type: "clear", text: "Attack repelled ✓" }); await awaitUser();
  };

  const run = async (from: CaseStage = { kind: "skill", index: 0 }) => {
    setItems([]); setPanel("ARC SYSTEMS");
    const total = consoleCase.skills.length;
    if (from.kind === "skill") {
      if (from.index === 0) { // fresh run: play the opening + roadmap
        for (let i = 0; i < consoleCase.open.length; i++) { const line = consoleCase.open[i]; push({ id: nextId(), kind: "wren", text: line }); await speak(line, consoleCase.openVoice?.[i]); }
        push({ id: nextId(), kind: "roadmap", title: consoleCase.title, actor: consoleCase.actor, skills: consoleCase.skills.map((s) => ({ n: s.n, title: s.title, goal: s.goal })) });
        await wait(650);
        setDock({ type: "clear", text: "Ready? Skill 1 first." }); await awaitUser();
      }
      for (let i = from.index; i < total; i++) { saveProgress(consoleCase.id, { kind: "skill", index: i }); await runSkill(consoleCase.skills[i], total); setSkipRequested(false); /* one skip = exactly one skill */ }
    }
    if (from.kind === "skill" || from.kind === "boss") { saveProgress(consoleCase.id, { kind: "boss" }); await runBoss(); }
    saveProgress(consoleCase.id, { kind: "test" });
    setItems([]); setPanel("ARC SYSTEMS"); await wait(400);
    push({ id: nextId(), kind: "wren", text: consoleCase.test.intro }); await speak(consoleCase.test.intro, consoleCase.test.introVoice);
    setDock({ type: "clear", text: "Start the test →" }); await awaitUser(); setDock(null);
    setPhase("test");
  };

  // Synchronous, inside this exact tap — same fix as Phone's cold-open audio
  // (PR #572): the real narration starts moments later inside run()'s async
  // chain, which is one tick too late for some mobile browsers' autoplay
  // unlock to still count as "the same gesture".
  const start = (from: CaseStage = { kind: "skill", index: 0 }) => { if (startedRef.current) return; startedRef.current = true; primeAudio(); setPhase("play"); run(from); };
  const beginFresh = () => { clearProgress(consoleCase.id); start({ kind: "skill", index: 0 }); };
  const beginResume = () => start(resumeStage ?? { kind: "skill", index: 0 });
  // `autostart`: the new per-mission ATLAS briefing (MissionIntro) already
  // did the job BootScreen's own "press to begin" screen exists for, so a
  // fresh arrival from that card skips straight into WREN's own open[]
  // narration instead of showing a second, redundant "press to start" beat.
  // Never skips a RESUMABLE case though — that prompt is a real choice
  // (continue vs. start over), not a redundant gate, so it always shows.
  useEffect(() => {
    if (autostart && !isResumable(resumeStage)) beginFresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const nudgeRef = useRef(0);
  // `voice`, when given, is the step's own authored badVoice (case-specific
  // correction — previously dropped on the floor in favour of this generic
  // rotation even when one existed). Falls back to the generic nudge clips
  // for docks that don't carry a case-specific line (choose/decode/spot).
  const nudgeBad = (text?: string, voice?: string) => {
    setNudge(text ?? "Not quite. Check it again."); force();
    if (!voiceRef.current) return;
    if (voice) { playWren(voice, true); return; }
    const i = nudgeRef.current++ % NUDGES.length;
    playWren(NUDGES[i], true);
  };

  /* ------------------------------------------------------------ render */
  const wrenDot = <span aria-hidden style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 12 }}>{[4, 10, 6].map((h, i) => <i key={i} style={{ width: 2.5, height: h, background: C.wren, borderRadius: 2, display: "block" }} />)}</span>;

  return (
    <main className="cn" style={{ minHeight: "100dvh", background: `radial-gradient(900px 520px at 50% -8%, ${acc}14 0%, transparent 62%), ${C.page}`, color: C.ink, fontFamily: UI, display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 14px", overflow: "hidden", ["--amber" as string]: acc }}>
      <style>{CSS}</style>
      {/* Block 3's own backdrop: a galaxy field with energy rings/beams
          radiating from the console's center — structurally different from
          every other block's living-world device (owner: "it needs to look
          so futuristic... completely different to the other blocks"), not
          just a recolour of the matrix-rain device they use. The energy
          layer (rings/beams/core glow) deliberately renders ABOVE the
          readability scrim below — it's the dramatic foreground effect, the
          scrim is only there to calm the *starfield* for text contrast, and
          muting the energy layer by the same amount made it nearly invisible. */}
      <HubStarfield accent={acc} reduced={!!reduce} />
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: "radial-gradient(760px 880px at 50% 50%, rgba(5,4,2,0.4), rgba(5,4,2,0.12) 68%, rgba(5,4,2,0.32))" }} />
      <HubEnergy accent={acc} reduced={!!reduce} />

      <SkipButton />
      <BackButton target=".cn-work" />
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
      <CaseJournal entries={journal} accent={acc} caseTitle={consoleCase.title} />
      <button className="cn-btn" onClick={onExit} style={{ position: "fixed", top: 14, left: 14, zIndex: 20, fontFamily: MONO, fontSize: 11.5, fontWeight: 600, color: C.dim, background: "rgba(0,0,0,0.5)", border: `1px solid ${C.edge}`, borderRadius: R.btn, padding: "6px 12px", cursor: "pointer" }}>&lt; Leave</button>
      <button className="cn-btn" onClick={() => { const v = !voiceOn; setVoiceOn(v); if (!v) stopWren(); }} aria-pressed={voiceOn} style={{ position: "fixed", top: 14, right: 14, zIndex: 20, fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: voiceOn ? C.wren : C.dim, background: "rgba(0,0,0,0.5)", border: `1px solid ${voiceOn ? "rgba(43,212,180,.5)" : C.edge}`, borderRadius: R.btn, padding: "6px 12px", cursor: "pointer" }}>{voiceOn ? "🔊 WREN on" : "🔇 WREN off"}</button>
      <button className="cn-btn" onClick={cycleVoiceRate} aria-label={`WREN's talking speed: ${voiceRate}×. Tap to change.`} style={{ position: "fixed", top: 54, right: 14, zIndex: 20, fontFamily: MONO, fontSize: 11, fontWeight: 700, color: voiceRate !== 1 ? C.wren : C.dim, background: "rgba(0,0,0,0.5)", border: `1px solid ${voiceRate !== 1 ? "rgba(43,212,180,.5)" : C.edge}`, borderRadius: R.btn, padding: "6px 12px", cursor: "pointer" }}>{voiceRate}×</button>

      <div className={reduce ? "" : "cn-crt"} style={{ width: "100%", maxWidth: 640, height: 760, maxHeight: "calc(100dvh - 30px)", background: "rgba(10,8,4,0.74)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", borderRadius: R.panel, border: `1px solid ${acc}70`, boxShadow: `0 0 0 1px #000, 0 24px 70px rgba(0,0,0,.7), inset 0 0 60px ${acc}0c, inset 0 0 0 1px rgba(255,255,255,0.03)`, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div aria-hidden className="cn-scanlines" />
        {!reduce && <div aria-hidden className="cn-sweepbar" />}
        {/* console readout bar — a terminal window's own titlebar, not just a label */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 15px", borderBottom: `1px solid ${C.edge}`, background: "linear-gradient(180deg,rgba(28,22,12,0.85),rgba(14,11,5,0.7))", fontFamily: MONO }}>
          <span aria-hidden style={{ display: "flex", gap: 5, marginRight: 2 }}>
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: "#FF6A4D99", display: "block" }} />
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFB23E99", display: "block" }} />
            <i style={{ width: 7, height: 7, borderRadius: "50%", background: "#4FD98A99", display: "block" }} />
          </span>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: acc, boxShadow: `0 0 8px ${acc}`, animation: reduce ? "none" : "cn-led 1.6s infinite", display: "block" }} />
          <span style={{ fontSize: 11.5, letterSpacing: ".16em", color: acc, fontWeight: 600 }}>ARC · SYSTEMS CONSOLE<span className="cn-cursor" aria-hidden /></span>
          <span style={{ marginLeft: "auto", fontSize: 10.5, letterSpacing: ".12em", color: C.faint }}>{consoleCase.caseNumber} · {panel}</span>
        </div>
        {/* persistent case identity — shown through every phase of play so a
            case reads as itself, not just a recolour of the last one (owner:
            every case should look unmistakably different, not just at boot) */}
        {phase === "play" && (
          <div style={{ flex: "0 0 auto", padding: "10px 15px 8px", borderBottom: `1px solid ${C.edge}`, display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: UI, fontWeight: 800, fontSize: 19, letterSpacing: "-.01em", color: acc, textShadow: `0 2px 18px ${acc}40` }}>{consoleCase.title}</span>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.faint, letterSpacing: ".04em" }}>vs {consoleCase.actor}</span>
          </div>
        )}

        {phase === "boot" ? (
          isResumable(resumeStage) ? (
            <ResumePrompt caseNumber={consoleCase.caseNumber} title={consoleCase.title} acc={acc} atLabel={stageLabel(resumeStage, consoleCase.skills)} onContinue={beginResume} onRestart={beginFresh} />
          ) : (
            <BootScreen title={consoleCase.title} caseNumber={consoleCase.caseNumber} open={consoleCase.open} acc={acc} onBoot={beginFresh} />
          )
        ) : phase === "test" ? (
          <TestView test={consoleCase.test} voiceOn={voiceOn} acc={acc} onPass={() => { markCaseComplete(consoleCase.id); clearProgress(consoleCase.id); void saveExplorersProgress(parseInt(consoleCase.caseNumber.replace(/\D/g, ""), 10) || 0, { completed: true, xp: 100, screen: 99 }); setPhase("debrief"); }} />
        ) : phase === "debrief" ? (
          <Debrief data={consoleCase.debrief} acc={acc} caseId={consoleCase.id} xp={100} reduced={!!reduce} onExit={onExit} onNext={onNextCase} />
        ) : (
          <>
            <div ref={workRef} className="cn-work" style={{ flex: "1 1 auto", overflowY: "auto", padding: "16px 15px 10px", display: "flex", flexDirection: "column", gap: 4, backgroundImage: "repeating-linear-gradient(0deg, rgba(255,178,62,0.02) 0 1px, transparent 1px 6px)" }}>
              {items.map((it) => <ItemView key={it.id} it={it} acc={acc} wrenDot={wrenDot} />)}
            </div>
            <div style={{ flex: "0 0 auto", borderTop: `1px solid ${C.edge}`, background: "linear-gradient(180deg,#1a140b,#120e07)", padding: "12px 14px 15px" }}>
              <DockView dock={dock} nudge={nudge} acc={acc} onResolve={(v) => resolveRef.current?.(v)} onBad={nudgeBad} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function ItemView({ it, acc, wrenDot }: { it: Item; acc: string; wrenDot: React.ReactNode }) {
  if (it.kind === "working") {
    return <div className="cn-row" style={{ fontFamily: MONO, fontSize: 12, color: C.faint, padding: "4px 2px" }}>▚ working…</div>;
  }
  if (it.kind === "sys") {
    return (
      <div className="cn-row" style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.5, color: C.amberHi, background: "#0c0a05", border: `1px solid ${C.edge}`, borderLeft: `3px solid ${acc}`, borderRadius: R.card, padding: "9px 12px", margin: "3px 0", whiteSpace: "pre-wrap" }}>
        <span style={{ color: C.faint }}>&gt; </span>{it.text}
      </div>
    );
  }
  if (it.kind === "divider") {
    return (
      <div className="cn-row" style={{ margin: "6px 0 8px", textAlign: "center", padding: "13px 12px", background: it.boss ? "rgba(255,106,77,.08)" : "rgba(255,178,62,.07)", border: `1px solid ${it.boss ? "rgba(255,106,77,.4)" : "rgba(255,178,62,.4)"}`, borderRadius: R.card }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: it.boss ? C.red : acc, fontWeight: 700 }}>// {it.kicker}</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, margin: "3px 0 2px" }}>{it.title}</div>
        {it.sub && <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.35 }}>{it.sub}</div>}
      </div>
    );
  }
  if (it.kind === "phase") {
    return <div className="cn-row" style={{ textAlign: "center", margin: "9px 0 4px" }}><span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.red, fontWeight: 700, background: "rgba(255,106,77,.1)", border: "1px solid rgba(255,106,77,.35)", borderRadius: R.card, padding: "3px 12px" }}>[ {it.label} ]</span></div>;
  }
  if (it.kind === "roadmap") {
    return (
      <div className="cn-row" style={{ margin: "8px 0 4px", background: "linear-gradient(180deg, rgba(255,178,62,.10), rgba(255,178,62,.03))", border: `1px solid rgba(255,178,62,.45)`, borderRadius: R.card, padding: "14px 15px" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: C.amberHi, fontWeight: 700, marginBottom: 2 }}>// build plan · vs {it.actor}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 11 }}>{it.skills.length} systems to master</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {it.skills.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span aria-hidden style={{ flex: "0 0 auto", width: 22, height: 22, borderRadius: R.card, background: "rgba(255,178,62,.16)", border: `1px solid rgba(255,178,62,.5)`, color: C.amberHi, fontFamily: MONO, fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center" }}>{s.n}</span>
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
  // wren
  return (
    <div className="cn-row" style={{ margin: "8px 2px 3px", background: C.wrenbg, border: `1px solid rgba(43,212,180,.5)`, borderLeft: "3px solid #2BD4B4", borderRadius: R.card, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ flex: "0 0 auto", width: 24, height: 24, borderRadius: R.card, background: "radial-gradient(circle at 40% 35%,#1c5248,#0c2f29)", border: `1.5px solid ${C.wren}`, display: "grid", placeItems: "center" }}>{wrenDot}</span>
      <div style={{ fontSize: 13.5, lineHeight: 1.42 }}>
        <b style={{ color: C.wren, fontWeight: 700, display: "block", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 2, fontFamily: MONO }}>[WREN] in your ear</b>
        {it.text}
      </div>
    </div>
  );
}

function DockView({ dock, nudge, acc, onResolve, onBad }: { dock: Dock; nudge: string | null; acc: string; onResolve: (v: string) => void; onBad: (t?: string, voice?: string) => void }) {
  const [sw, setSw] = useState<boolean[]>([]);
  const [sel, setSel] = useState<number[]>([]);
  const [dial, setDial] = useState(0);
  const [solved, setSolved] = useState(false);
  const [spotSel, setSpotSel] = useState<Set<number>>(new Set());
  const [flipSide, setFlipSide] = useState<"you" | "them">("you");
  const [flipToggleOn, setFlipToggleOn] = useState(false);
  const [flipChoiceIdx, setFlipChoiceIdx] = useState<number | null>(null);
  const flipFiredRef = useRef(false);
  // reset local control state whenever a new interactive dock appears
  useEffect(() => {
    if (dock?.type === "toggle") setSw(dock.switches.map(() => false));
    if (dock?.type === "build") setSel([]);
    if (dock?.type === "decode") { setDial(0); setSolved(false); }
    if (dock?.type === "spot") setSpotSel(new Set());
    if (dock?.type === "flip") { setFlipSide("you"); setFlipToggleOn(false); setFlipChoiceIdx(null); flipFiredRef.current = false; }
  }, [dock]);
  // auto-resolves the instant the GOOD state has been viewed on THEIR face —
  // same "latches, no submit button" feel as the decode dial above.
  useEffect(() => {
    if (dock?.type !== "flip" || flipFiredRef.current) return;
    const good = dock.you.kind === "toggle" ? flipToggleOn : dock.you.options[flipChoiceIdx ?? -1]?.outcome === "good";
    if (flipSide === "them" && good) { flipFiredRef.current = true; onResolve("ok"); }
  }, [dock, flipSide, flipToggleOn, flipChoiceIdx, onResolve]);

  if (!dock || dock.type === "idle") {
    return <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, opacity: 0.6, textAlign: "center", padding: "6px 0" }}>console idle…</div>;
  }
  if (dock.type === "clear") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13.5, color: C.mint, margin: "2px 0 11px", fontWeight: 600, fontFamily: MONO }}>{dock.text}</p>
        <button className="cn-btn" onClick={() => onResolve("go")} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: acc, border: 0, borderRadius: R.btn, padding: "10px 24px", cursor: "pointer" }}>[ CONTINUE → ]</button>
      </div>
    );
  }
  if (dock.type === "choose") {
    return (
      <>
        <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600, fontFamily: MONO }}>{dock.prompt ?? "Choose:"}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dock.options.map((o, i) => (
            <button key={i} className="cn-opt" onClick={() => onResolve(o.label)} style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, textAlign: "left", color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: R.card, padding: "11px 14px", cursor: "pointer" }}>
              <span style={{ color: acc, fontFamily: MONO, marginRight: 6 }}>&gt;</span>{o.label}{o.sub && <span style={{ display: "block", fontSize: 11.5, color: C.dim, fontWeight: 500, marginTop: 2, marginLeft: 16 }}>{o.sub}</span>}
            </button>
          ))}
        </div>
      </>
    );
  }
  if (dock.type === "toggle") {
    const submit = () => { if (dock.switches.every((s, i) => sw[i] === s.want)) onResolve("ok"); else onBad(dock.bad ?? "Not quite. Set all the switches right and confirm.", dock.badVoice); };
    return (
      <>
        {nudge ? <p style={{ fontSize: 12.5, color: C.red, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{nudge}</p>
          : <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "Set the switches:"}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
          {dock.switches.map((s, i) => (
            <button key={i} className="cn-sw" role="switch" aria-checked={sw[i]} onClick={() => setSw((a) => a.map((v, j) => (j === i ? !v : v)))}
              style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: sw[i] ? "rgba(79,217,138,.12)" : C.chip, border: `1px solid ${sw[i] ? "rgba(79,217,138,.5)" : C.chipedge}`, borderRadius: R.card, padding: "9px 12px", cursor: "pointer", fontFamily: UI }}>
              <span aria-hidden style={{ flex: "0 0 auto", width: 40, height: 22, borderRadius: 3, background: sw[i] ? C.mint : "#2a2416", position: "relative", transition: "background .15s" }}>
                <span style={{ position: "absolute", top: 2, left: sw[i] ? 20 : 2, width: 18, height: 18, borderRadius: 2, background: "#0c0a05", transition: "left .15s", display: "block" }} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{s.label}</span>
                {s.sub && <span style={{ display: "block", fontSize: 11, color: C.dim }}>{s.sub}</span>}
              </span>
              <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: sw[i] ? C.mint : C.faint }}>{sw[i] ? "ON" : "OFF"}</span>
            </button>
          ))}
        </div>
        <button className="cn-btn" onClick={submit} style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: acc, border: 0, borderRadius: R.btn, padding: "11px", cursor: "pointer" }}>[ CONFIRM ]</button>
      </>
    );
  }
  if (dock.type === "decode") {
    const preview = caesar(dock.ciphertext, -dial);
    const spin = (n: number) => {
      if (solved) return;
      setDial(n);
      if (n === dock.shift) { setSolved(true); onResolve("ok"); }
    };
    return (
      <>
        <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600, fontFamily: MONO }}>{dock.prompt ?? "Turn the dial until it reads."}</p>
        <div style={{ background: C.chip, border: `1px solid ${solved ? "rgba(79,217,138,.5)" : C.chipedge}`, borderRadius: R.card, padding: "12px 14px" }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".12em", color: C.faint, marginBottom: 5 }}>SEALED NOTE</div>
          <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: ".1em", lineHeight: 1.6, color: C.dim }}>{dock.ciphertext}</div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", margin: "11px 0 4px" }}>
            <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", color: C.faint }}>SHIFT DIAL</span>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: solved ? C.mint : acc }}>{dial} / 25</span>
          </div>
          <input
            type="range" min={0} max={25} step={1} value={dial} disabled={solved}
            aria-label="Shift dial: turn from 0 to 25 until the note reads"
            onChange={(e) => spin(Number(e.target.value))}
            style={{ width: "100%", accentColor: solved ? C.mint : acc, cursor: solved ? "default" : "pointer" }}
          />
          <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: ".1em", lineHeight: 1.6, color: solved ? C.mint : C.ink, marginTop: 10 }}>→ {preview}</div>
        </div>
      </>
    );
  }
  if (dock.type === "spot") {
    const need = dock.segments.filter((s) => s.tellId).length;
    const toggleSeg = (i: number) => {
      if (!dock.segments[i].tellId) return;
      setSpotSel((s) => { const n = new Set(s); n.has(i) ? n.delete(i) : n.add(i); return n; });
    };
    const submit = () => {
      const correctIdx = dock.segments.map((s, i) => (s.tellId ? i : -1)).filter((i) => i >= 0);
      const ok = spotSel.size === correctIdx.length && correctIdx.every((i) => spotSel.has(i));
      if (ok) onResolve("ok"); else onBad("Not quite the full set. Read it again, slowly.");
    };
    return (
      <>
        {nudge ? <p style={{ fontSize: 12.5, color: C.red, textAlign: "center", margin: "0 0 9px", fontWeight: 600, fontFamily: MONO }}>{nudge}</p>
          : <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600, fontFamily: MONO }}>{dock.prompt ?? "Tap every risky part of the readout above."} <span style={{ color: acc }}>({spotSel.size}/{need})</span></p>}
        <div style={{ background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: R.card, padding: "12px 14px", marginBottom: 10, fontFamily: MONO, fontSize: 13, letterSpacing: ".04em", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
          {dock.segments.map((seg, i) => {
            if (!seg.tellId) return <span key={i} style={{ color: C.ink }}>{seg.text}</span>;
            const on = spotSel.has(i);
            return (
              <span key={i} onClick={() => toggleSeg(i)} role="button" tabIndex={0}
                style={{ cursor: "pointer", color: on ? C.page : acc, background: on ? acc : "rgba(255,178,62,.1)", outline: on ? "none" : `1.5px dashed ${acc}55`, borderRadius: 2, padding: "0 2px", fontWeight: 700 }}>
                {seg.text}
              </span>
            );
          })}
        </div>
        <button className="cn-btn" onClick={submit} disabled={spotSel.size === 0} style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: spotSel.size === 0 ? "#4a3d20" : acc, border: 0, borderRadius: R.btn, padding: "11px", cursor: spotSel.size === 0 ? "not-allowed" : "pointer" }}>{spotSel.size === 0 ? "[ TAP ABOVE TO START ]" : `[ ${spotSel.size} FLAGGED · SUBMIT ]`}</button>
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
        <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600, fontFamily: MONO }}>{dock.prompt ?? "Flip between both sides."}</p>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 9 }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".16em", fontWeight: 700, color: flipSide === "you" ? acc : C.faint, padding: "3px 9px", borderRadius: 2, border: `1px solid ${flipSide === "you" ? acc : C.chipedge}`, background: flipSide === "you" ? `${acc}1a` : "transparent" }}>YOUR SIDE</span>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".16em", fontWeight: 700, color: flipSide === "them" ? C.red : C.faint, padding: "3px 9px", borderRadius: 2, border: `1px solid ${flipSide === "them" ? C.red : C.chipedge}`, background: flipSide === "them" ? "rgba(255,106,77,.12)" : "transparent" }}>THEIR SIDE</span>
        </div>
        <div key={flipSide} className="cn-row" style={{ background: C.chip, border: `1px solid ${flipSide === "them" ? "rgba(255,106,77,.4)" : C.chipedge}`, borderRadius: R.card, padding: "13px 14px", marginBottom: 11, minHeight: 96 }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", color: C.faint, marginBottom: 6 }}>{pageLabel.toUpperCase()}</div>
          {pageSub && <div style={{ fontSize: 11, color: C.dim, marginBottom: 8 }}>{pageSub}</div>}
          {flipSide === "you" && dock.you.kind === "toggle" && (
            <button className="cn-sw" role="switch" aria-checked={flipToggleOn} onClick={() => setFlipToggleOn((v) => !v)}
              style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: flipToggleOn ? "rgba(79,217,138,.12)" : C.chip, border: `1px solid ${flipToggleOn ? "rgba(79,217,138,.5)" : C.chipedge}`, borderRadius: R.card, padding: "9px 12px", cursor: "pointer", fontFamily: UI, width: "100%" }}>
              <span aria-hidden style={{ flex: "0 0 auto", width: 40, height: 22, borderRadius: 3, background: flipToggleOn ? C.mint : "#2a2416", position: "relative" }}>
                <span style={{ position: "absolute", top: 2, left: flipToggleOn ? 20 : 2, width: 18, height: 18, borderRadius: 2, background: "#0c0a05" }} />
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
                    <button key={i} className="cn-opt" onClick={() => setFlipChoiceIdx(i)}
                      style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 600, textAlign: "left", color: C.ink, background: isPicked ? (o.outcome === "good" ? "rgba(79,217,138,.14)" : "rgba(255,106,77,.14)") : C.chip, border: `1px solid ${isPicked ? (o.outcome === "good" ? "rgba(79,217,138,.5)" : "rgba(255,106,77,.5)") : C.chipedge}`, borderRadius: R.card, padding: "9px 12px", cursor: "pointer" }}>
                      {o.label}
                    </button>
                  );
                })}
              </div>
            </>
          )}
          {flipSide === "them" && (
            <div style={{ fontFamily: MONO, fontSize: 13, letterSpacing: ".03em", lineHeight: 1.6, color: themText ? (themGood ? C.mint : C.red) : C.faint }}>
              {themText || "Nothing to show yet, flip back and decide."}
            </div>
          )}
        </div>
        <button className="cn-btn" disabled={!canFlip} onClick={() => setFlipSide((s) => (s === "you" ? "them" : "you"))}
          style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: !canFlip ? "#4a3d20" : acc, border: 0, borderRadius: R.btn, padding: "11px", cursor: !canFlip ? "not-allowed" : "pointer" }}>
          {flipSide === "you" ? `[ FLIP → SEE ${dock.them.label.toUpperCase()} ]` : "[ FLIP BACK ]"}
        </button>
      </>
    );
  }
  // build
  const need = dock.need;
  const toggleSel = (i: number) => setSel((a) => (a.includes(i) ? a.filter((x) => x !== i) : a.length < need ? [...a, i] : a));
  const submit = () => { const chosen = sel.map((i) => dock.parts[i]); if (chosen.length === need && chosen.every((p) => p.good)) onResolve("ok"); else onBad(dock.bad ?? "Not quite. Pick only the strong, unguessable parts.", dock.badVoice); };
  return (
    <>
      {nudge ? <p style={{ fontSize: 12.5, color: C.red, textAlign: "center", margin: "0 0 9px", fontWeight: 600, fontFamily: MONO }}>{nudge}</p>
        : <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600, fontFamily: MONO }}>{dock.prompt ?? "Build it:"} <span style={{ color: acc }}>({sel.length}/{need})</span></p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
        {dock.parts.map((p, i) => {
          const on = sel.includes(i);
          return (
            <button key={i} className="cn-opt" onClick={() => toggleSel(i)}
              style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: on ? C.page : C.ink, background: on ? acc : C.chip, border: `1px solid ${on ? acc : C.chipedge}`, borderRadius: R.card, padding: "8px 12px", cursor: "pointer", textAlign: "left" }}>
              {p.label}{p.sub && <span style={{ display: "block", fontSize: 10.5, fontWeight: 500, color: on ? "#5c4406" : C.dim, marginTop: 1 }}>{p.sub}</span>}
            </button>
          );
        })}
      </div>
      <button className="cn-btn" onClick={submit} disabled={sel.length !== need} style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: sel.length === need ? acc : "#4a3d20", border: 0, borderRadius: R.btn, padding: "11px", cursor: sel.length === need ? "pointer" : "not-allowed" }}>[ BUILD IT ]</button>
    </>
  );
}

function shuffled(n: number): number[] { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function TestView({ test, voiceOn, acc, onPass }: { test: ConsoleTest; voiceOn: boolean; acc: string; onPass: () => void }) {
  const [qi, setQi] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [result, setResult] = useState<null | "pass" | "fail">(null);
  const [orders, setOrders] = useState<number[][]>(() => test.questions.map((q) => shuffled(q.options.length)));
  useEffect(() => { // focus/study music bed under the exam (Guardian Calm, same as Cyber Heroes)
    if (!voiceOn) return;
    playBGM("bgmFocus");
    return () => stopBGM(700);
  }, [voiceOn]);
  const restart = () => { setQi(0); setCorrect(0); setResult(null); setOrders(test.questions.map((q) => shuffled(q.options.length))); };
  const answer = (oi: number) => {
    const right = !!test.questions[qi].options[oi].correct;
    const nc = correct + (right ? 1 : 0);
    if (qi + 1 < test.questions.length) { setCorrect(nc); setQi(qi + 1); }
    else { setCorrect(nc); const passed = nc >= test.pass; setResult(passed ? "pass" : "fail"); const v = passed ? test.passVoice : test.failVoice; if (voiceOn && v) playWren(v, true); }
  };
  if (result) {
    const passed = result === "pass";
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 28px 30px", textAlign: "center" }}>
        <div style={{ fontSize: 42, marginBottom: 8 }}>{passed ? "🛡️" : "🔁"}</div>
        <div style={{ fontSize: 23, fontWeight: 800, color: passed ? C.mint : acc, marginBottom: 8, fontFamily: MONO }}>{passed ? "SYSTEMS SECURE" : "NOT YET"}</div>
        <div style={{ fontSize: 15, color: C.ink, marginBottom: 8 }}>You got <b style={{ color: passed ? C.mint : acc }}>{correct} of {test.questions.length}</b> right.</div>
        <div style={{ fontSize: 13.5, color: C.dim, lineHeight: 1.5, marginBottom: 24 }}>{passed ? "Every defence held. That's a pass." : `You need ${test.pass} to sign off the build. Run it again, you've got this.`}</div>
        <button className="cn-btn" onClick={passed ? onPass : restart} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.page, background: passed ? C.mint : acc, border: 0, borderRadius: R.btn, padding: "13px 20px", cursor: "pointer" }}>{passed ? "[ FINISH → ]" : "[ RUN THE TEST AGAIN ]"}</button>
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
      <div style={{ height: 4, background: C.chip, borderRadius: 2, marginBottom: 18, overflow: "hidden" }}><div style={{ height: "100%", width: `${(qi / test.questions.length) * 100}%`, background: acc, transition: "width .3s" }} /></div>
      <div style={{ background: "#0c0a05", border: `1px solid ${C.edge}`, borderLeft: `3px solid ${acc}`, borderRadius: R.card, padding: "12px 14px", fontSize: 14.5, lineHeight: 1.45, color: C.ink, marginBottom: 16 }}>{q.scenario}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{q.ask}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {order.map((oi) => <button key={oi} className="cn-opt" onClick={() => answer(oi)} style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, textAlign: "left", color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: R.card, padding: "12px 14px", cursor: "pointer" }}><span style={{ color: acc, fontFamily: MONO, marginRight: 6 }}>&gt;</span>{q.options[oi].label}</button>)}
      </div>
    </div>
  );
}

function BootScreen({ title, caseNumber, open, acc, onBoot }: { title: string; caseNumber: string; open: string[]; acc: string; onBoot: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px 30px", textAlign: "left", fontFamily: MONO }}>
      <div style={{ color: C.faint, fontSize: 11, lineHeight: 1.8, marginBottom: 14 }}>
        <div>&gt; loading case file <span style={{ color: acc }}>{caseNumber}</span>...</div>
        <div>&gt; decrypting ARC archive... <span style={{ color: C.mint }}>ok</span></div>
        <div>&gt; identity check... <span style={{ color: C.mint }}>ok</span></div>
      </div>
      <div style={{ fontSize: 10.5, letterSpacing: ".3em", textTransform: "uppercase", color: acc, fontWeight: 700, marginBottom: 8 }}>[ {caseNumber} ]</div>
      <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-.01em", marginBottom: 22, color: C.ink, fontFamily: UI, textShadow: `0 2px 20px ${acc}40` }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
        {open.slice(0, 2).map((l, i) => (
          <div key={i} style={{ background: C.wrenbg, border: `1px solid rgba(43,212,180,.4)`, borderLeft: "3px solid #2BD4B4", borderRadius: R.card, padding: "14px 13px", fontSize: 13.5, lineHeight: 1.42, color: C.ink, fontFamily: UI }}>{l}</div>
        ))}
      </div>
      <button className="cn-btn" onClick={onBoot} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: ".04em", color: C.page, background: acc, border: 0, borderRadius: R.btn, padding: "13px 20px", cursor: "pointer", alignSelf: "flex-start" }}>[ ▸ BOOT THE CONSOLE ]<span className="cn-cursor" aria-hidden style={{ background: C.page }} /></button>
    </div>
  );
}

function Debrief({ data, acc, caseId, xp, reduced, onExit, onNext }: { data: ConsoleCase["debrief"]; acc: string; caseId: string; xp: number; reduced: boolean; onExit?: () => void; onNext?: () => void }) {
  const [revealed, setRevealed] = useState(false);
  return (
    // justifyContent:"center" only works while content is shorter than the
    // viewport; the closing ceremony pushes it past that on short windows,
    // so this needs to scroll (same fix as Phone's Debrief) or the bottom
    // (incl. "Next case") is unreachable with no scrollbar shown (UAT:
    // Week 11, "squashed at the end, make it bigger and add a scroll").
    // minHeight:0 added defensively: this div is a flex child of the panel
    // above (flex:1 there too), and a flex item's default min-height is
    // `auto` ("never shrink below my own content"), which can silently
    // override overflowY:auto. Re-tested this screen at real laptop window
    // sizes down to 1414x560 after a UAT report that it was still squashed
    // there — scrolling actually already worked correctly at every size
    // tried (confirmed by scrolling the container and checking the "Next
    // case" button's real on-screen position, not just element visibility),
    // so that report most likely predates this fix's original deploy. This
    // min-height addition is a genuine robustness fix regardless — it just
    // isn't the thing that was reproduced broken here.
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", justifyContent: "center", overflowY: "auto", padding: "0 26px 26px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.mint, marginBottom: 14, textAlign: "center", lineHeight: 1.2, fontFamily: MONO }}>{data.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {data.lines.map((l, i) => <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.45, color: C.ink }}><span style={{ color: C.mint, flex: "0 0 auto" }}>✓</span><span>{l}</span></div>)}
      </div>
      <div style={{ background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: R.card, padding: "13px 15px", fontSize: 13.5, lineHeight: 1.5, color: C.dim, marginBottom: 20 }}>
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
        signoff="Case logged, systems secure. ARC out."
        onStamp={() => setRevealed(true)}
      />
      {revealed && (
        <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
          <button className="cn-btn" onClick={onExit} style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: R.btn, padding: "12px", cursor: "pointer" }}>[ Back to map ]</button>
          {onNext && <button className="cn-btn" onClick={onNext} style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: C.page, background: acc, border: 0, borderRadius: R.btn, padding: "12px", cursor: "pointer" }}>[ Next case → ]</button>}
        </div>
      )}
    </div>
  );
}
