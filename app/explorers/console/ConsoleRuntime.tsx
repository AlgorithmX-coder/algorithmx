"use client";

/**
 * THE CONSOLE — Block 3's runtime (Systems). Not the Signal Room, not the Phone.
 * An amber operator control-panel where you OPERATE the machine: flip switches,
 * build a vault, read system readouts. Same framework as the phone (7 skills
 * LEARN -> PRACTICE, roadmap, blind boss, must-pass test, anti-skip, ?fast=1),
 * a genuinely different game. Data-driven by a ConsoleCase (see console/case11.ts).
 */

import { useEffect, useReducer, useRef, useState } from "react";
import { MatrixRain } from "../MatrixRain";
import { playWren, stopWren, useWrenSpeaking } from "../engine/audio";
import { playBGM, stopBGM } from "@/app/lib/sounds";
import { type CaseStage, readProgress, saveProgress, clearProgress, isResumable, stageLabel } from "../engine/caseProgress";
import { ResumePrompt } from "../engine/ResumePrompt";
import type { ConsoleCase, ConsoleStep, ConsoleTest } from "./case11";

const C = {
  page: "#0b0a06", ink: "#F4ECD8", dim: "#B39B6E", faint: "#6b5f45",
  panel: "#141009", panel2: "#1c160c", edge: "#3a2f16", chip: "#221a0d", chipedge: "#43371c",
  amber: "#FFB23E", amberHi: "#FFD27A", amberbg: "#2a2110",
  wren: "#2BD4B4", wrenbg: "#0f2622",
  red: "#FF6A4D", mint: "#4FD98A",
};
const MONO = `"IBM Plex Mono", ui-monospace, Consolas, monospace`;
const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;
const NUDGES = ["/audio/wren/nudge-1.mp3", "/audio/wren/nudge-2.mp3", "/audio/wren/nudge-3.mp3"];

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap');
.cn *{box-sizing:border-box}
.cn-work::-webkit-scrollbar{width:0}
@keyframes cn-pop{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes cn-led{0%,100%{opacity:.4}50%{opacity:1}}
@keyframes cn-scan{0%{background-position:0 0}100%{background-position:0 6px}}
.cn-row{animation:cn-pop .26s ease both}
.cn-opt{transition:transform .1s,border-color .15s,background .15s}
.cn-opt:hover:not(:disabled){border-color:var(--amber);transform:translateY(-1px)}
.cn-opt:focus-visible{outline:2px solid var(--amber);outline-offset:2px}
.cn-sw{transition:background .15s,border-color .15s}
.cn-btn:focus-visible{outline:2px solid var(--amber);outline-offset:2px}
@media (prefers-reduced-motion: reduce){.cn *{animation-duration:.001ms !important}}
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
  | { type: "toggle"; prompt?: string; switches: { label: string; sub?: string; want: boolean }[] }
  | { type: "build"; prompt?: string; parts: { label: string; good: boolean; sub?: string }[]; need: number }
  | { type: "clear"; text: string }
  | { type: "idle" }
  | null;

type Header = { who: string; sub: string };
const WREN_HEADER: Header = { who: "WREN", sub: "in your ear" };

export default function ConsoleRuntime({ consoleCase, onExit, onNextCase }: { consoleCase: ConsoleCase; onExit?: () => void; onNextCase?: () => void }) {
  const fast = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fast") === "1";
  const [phase, setPhase] = useState<"boot" | "play" | "test" | "debrief">("boot");
  const [panel, setPanel] = useState<string>("ARC SYSTEMS");
  const [items, setItems] = useState<Item[]>([]);
  const [dock, setDock] = useState<Dock>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(!fast);
  const voiceRef = useRef(!fast);
  useWrenSpeaking();
  const [, force] = useReducer((n) => n + 1, 0);
  const acc = consoleCase.accent ?? C.amber;
  const [resumeStage] = useState<CaseStage | null>(() => readProgress(consoleCase.id));

  const reduce = fast || (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
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

  const speak = (text: string, voice?: string) =>
    new Promise<void>((res) => {
      let done = false;
      const fin = () => { if (!done) { done = true; res(); } };
      if (voice && voiceRef.current && !reduce) { playWren(voice, true, fin); setTimeout(fin, 16000); }
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
        while (!done) {
          setNudge(null);
          setDock({ type: "choose", prompt: step.prompt, options: step.options });
          const picked = await awaitUser(); setDock(null);
          const opt = step.options.find((o) => o.label === picked)!;
          if (opt.then) await runSteps(opt.then);
          if (opt.outcome === "bad") { await wait(250); continue; }
          done = true;
        }
      } else if (step.t === "toggle") {
        setNudge(null);
        setDock({ type: "toggle", prompt: step.prompt, switches: step.switches });
        await awaitUser(); // resolves only when the switches match
        setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      } else if (step.t === "build") {
        setNudge(null);
        setDock({ type: "build", prompt: step.prompt, parts: step.parts, need: step.need });
        await awaitUser(); // resolves only when the right parts are chosen
        setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      }
    }
  };

  const runSkill = async (sk: ConsoleCase["skills"][number], total: number) => {
    setDock(null); setItems([]); setPanel(sk.panel ?? "ARC SYSTEMS"); await wait(400);
    push({ id: nextId(), kind: "divider", kicker: `Skill ${sk.n} of ${total}`, title: sk.title, sub: sk.goal }); await wait(600);
    await runSteps(sk.learn);
    await runSteps(sk.practice);
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
      for (let i = from.index; i < total; i++) { saveProgress(consoleCase.id, { kind: "skill", index: i }); await runSkill(consoleCase.skills[i], total); }
    }
    if (from.kind === "skill" || from.kind === "boss") { saveProgress(consoleCase.id, { kind: "boss" }); await runBoss(); }
    saveProgress(consoleCase.id, { kind: "test" });
    setItems([]); setPanel("ARC SYSTEMS"); await wait(400);
    push({ id: nextId(), kind: "wren", text: consoleCase.test.intro }); await speak(consoleCase.test.intro, consoleCase.test.introVoice);
    setDock({ type: "clear", text: "Start the test →" }); await awaitUser(); setDock(null);
    setPhase("test");
  };

  const start = (from: CaseStage = { kind: "skill", index: 0 }) => { if (startedRef.current) return; startedRef.current = true; setPhase("play"); run(from); };
  const beginFresh = () => { clearProgress(consoleCase.id); start({ kind: "skill", index: 0 }); };
  const beginResume = () => start(resumeStage ?? { kind: "skill", index: 0 });

  const nudgeRef = useRef(0);
  const nudgeBad = (text?: string) => {
    const i = nudgeRef.current++ % NUDGES.length;
    setNudge(text ?? "Not quite. Check it again."); force();
    if (voiceRef.current) playWren(NUDGES[i], true);
  };

  /* ------------------------------------------------------------ render */
  const wrenDot = <span aria-hidden style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 12 }}>{[4, 10, 6].map((h, i) => <i key={i} style={{ width: 2.5, height: h, background: C.wren, borderRadius: 2, display: "block" }} />)}</span>;

  return (
    <main className="cn" style={{ minHeight: "100dvh", background: `radial-gradient(900px 520px at 50% -8%, #2a1e08 0%, rgba(42,30,8,0) 60%), ${C.page}`, color: C.ink, fontFamily: UI, display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 14px", overflow: "hidden", ["--amber" as string]: acc }}>
      <style>{CSS}</style>
      <MatrixRain reduced={!!reduce} opacity={0.12} colors={["#FFB23E", "#FFD27A", "#FF7A3E"]} head="#FFF0D6" />

      <button className="cn-btn" onClick={onExit} style={{ position: "fixed", top: 14, left: 14, zIndex: 20, fontFamily: MONO, fontSize: 11.5, fontWeight: 600, color: C.dim, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.edge}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>← Leave</button>
      <button className="cn-btn" onClick={() => { const v = !voiceOn; setVoiceOn(v); if (!v) stopWren(); }} aria-pressed={voiceOn} style={{ position: "fixed", top: 14, right: 14, zIndex: 20, fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: voiceOn ? C.wren : C.dim, background: "rgba(255,255,255,0.04)", border: `1px solid ${voiceOn ? "rgba(43,212,180,.5)" : C.edge}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>{voiceOn ? "🔊 WREN on" : "🔇 WREN off"}</button>

      <div style={{ width: "100%", maxWidth: 640, height: 760, maxHeight: "calc(100dvh - 30px)", background: C.panel, borderRadius: 14, border: `1px solid ${C.edge}`, boxShadow: `0 0 0 1px #000, 0 24px 70px rgba(0,0,0,.6), inset 0 0 60px rgba(255,178,62,.03)`, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* console readout bar */}
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 15px", borderBottom: `1px solid ${C.edge}`, background: "linear-gradient(180deg,#1c160c,#141009)", fontFamily: MONO }}>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: acc, boxShadow: `0 0 8px ${acc}`, animation: reduce ? "none" : "cn-led 1.6s infinite", display: "block" }} />
          <span style={{ fontSize: 11.5, letterSpacing: ".16em", color: acc, fontWeight: 600 }}>ARC · SYSTEMS CONSOLE</span>
          <span style={{ marginLeft: "auto", fontSize: 10.5, letterSpacing: ".12em", color: C.faint }}>{consoleCase.caseNumber} · {panel}</span>
        </div>

        {phase === "boot" ? (
          isResumable(resumeStage) ? (
            <ResumePrompt caseNumber={consoleCase.caseNumber} title={consoleCase.title} acc={acc} atLabel={stageLabel(resumeStage, consoleCase.skills)} onContinue={beginResume} onRestart={beginFresh} />
          ) : (
            <BootScreen title={consoleCase.title} caseNumber={consoleCase.caseNumber} open={consoleCase.open} acc={acc} onBoot={beginFresh} />
          )
        ) : phase === "test" ? (
          <TestView test={consoleCase.test} voiceOn={voiceOn} acc={acc} onPass={() => { clearProgress(consoleCase.id); setPhase("debrief"); }} />
        ) : phase === "debrief" ? (
          <Debrief data={consoleCase.debrief} acc={acc} onExit={onExit} onNext={onNextCase} />
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
      <div className="cn-row" style={{ fontFamily: MONO, fontSize: 12.5, lineHeight: 1.5, color: C.amberHi, background: "#0c0a05", border: `1px solid ${C.edge}`, borderLeft: `3px solid ${acc}`, borderRadius: 6, padding: "9px 12px", margin: "3px 0", whiteSpace: "pre-wrap" }}>
        <span style={{ color: C.faint }}>&gt; </span>{it.text}
      </div>
    );
  }
  if (it.kind === "divider") {
    return (
      <div className="cn-row" style={{ margin: "6px 0 8px", textAlign: "center", padding: "13px 12px", background: it.boss ? "rgba(255,106,77,.08)" : "rgba(255,178,62,.07)", border: `1px solid ${it.boss ? "rgba(255,106,77,.4)" : "rgba(255,178,62,.4)"}`, borderRadius: 10 }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: it.boss ? C.red : acc, fontWeight: 700 }}>{it.kicker}</div>
        <div style={{ fontSize: 19, fontWeight: 800, color: C.ink, margin: "3px 0 2px" }}>{it.title}</div>
        {it.sub && <div style={{ fontSize: 12.5, color: C.dim, lineHeight: 1.35 }}>{it.sub}</div>}
      </div>
    );
  }
  if (it.kind === "phase") {
    return <div className="cn-row" style={{ textAlign: "center", margin: "9px 0 4px" }}><span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.red, fontWeight: 700, background: "rgba(255,106,77,.1)", border: "1px solid rgba(255,106,77,.35)", borderRadius: 6, padding: "3px 12px" }}>{it.label}</span></div>;
  }
  if (it.kind === "roadmap") {
    return (
      <div className="cn-row" style={{ margin: "8px 0 4px", background: "linear-gradient(180deg, rgba(255,178,62,.10), rgba(255,178,62,.03))", border: `1px solid rgba(255,178,62,.45)`, borderRadius: 10, padding: "14px 15px" }}>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase", color: C.amberHi, fontWeight: 700, marginBottom: 2 }}>Build plan · vs {it.actor}</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: C.ink, marginBottom: 11 }}>{it.skills.length} systems to master</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {it.skills.map((s) => (
            <div key={s.n} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span aria-hidden style={{ flex: "0 0 auto", width: 22, height: 22, borderRadius: 5, background: "rgba(255,178,62,.16)", border: `1px solid rgba(255,178,62,.5)`, color: C.amberHi, fontFamily: MONO, fontSize: 11, fontWeight: 700, display: "grid", placeItems: "center" }}>{s.n}</span>
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
    <div className="cn-row" style={{ margin: "8px 2px 3px", background: C.wrenbg, border: `1px solid rgba(43,212,180,.5)`, borderRadius: 12, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
      <span style={{ flex: "0 0 auto", width: 28, height: 28, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%,#1c5248,#0c2f29)", border: `1.5px solid ${C.wren}`, display: "grid", placeItems: "center" }}>{wrenDot}</span>
      <div style={{ fontSize: 13.5, lineHeight: 1.42 }}>
        <b style={{ color: C.wren, fontWeight: 700, display: "block", fontSize: 10, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 2 }}>WREN · in your ear</b>
        {it.text}
      </div>
    </div>
  );
}

function DockView({ dock, nudge, acc, onResolve, onBad }: { dock: Dock; nudge: string | null; acc: string; onResolve: (v: string) => void; onBad: (t?: string) => void }) {
  const [sw, setSw] = useState<boolean[]>([]);
  const [sel, setSel] = useState<number[]>([]);
  // reset local control state whenever a new interactive dock appears
  useEffect(() => {
    if (dock?.type === "toggle") setSw(dock.switches.map(() => false));
    if (dock?.type === "build") setSel([]);
  }, [dock]);

  if (!dock || dock.type === "idle") {
    return <div style={{ fontFamily: MONO, fontSize: 12, color: C.faint, opacity: 0.6, textAlign: "center", padding: "6px 0" }}>console idle…</div>;
  }
  if (dock.type === "clear") {
    return (
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 13.5, color: C.mint, margin: "2px 0 11px", fontWeight: 600, fontFamily: MONO }}>{dock.text}</p>
        <button className="cn-btn" onClick={() => onResolve("go")} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: acc, border: 0, borderRadius: 6, padding: "10px 24px", cursor: "pointer" }}>CONTINUE →</button>
      </div>
    );
  }
  if (dock.type === "choose") {
    return (
      <>
        <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "Choose:"}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dock.options.map((o, i) => (
            <button key={i} className="cn-opt" onClick={() => onResolve(o.label)} style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, textAlign: "left", color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 8, padding: "11px 14px", cursor: "pointer" }}>
              {o.label}{o.sub && <span style={{ display: "block", fontSize: 11.5, color: C.dim, fontWeight: 500, marginTop: 2 }}>{o.sub}</span>}
            </button>
          ))}
        </div>
      </>
    );
  }
  if (dock.type === "toggle") {
    const submit = () => { if (dock.switches.every((s, i) => sw[i] === s.want)) onResolve("ok"); else onBad("Not quite. Set all the switches right and confirm."); };
    return (
      <>
        {nudge ? <p style={{ fontSize: 12.5, color: C.red, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{nudge}</p>
          : <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "Set the switches:"}</p>}
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
          {dock.switches.map((s, i) => (
            <button key={i} className="cn-sw" onClick={() => setSw((a) => a.map((v, j) => (j === i ? !v : v)))}
              style={{ display: "flex", alignItems: "center", gap: 11, textAlign: "left", background: sw[i] ? "rgba(79,217,138,.12)" : C.chip, border: `1px solid ${sw[i] ? "rgba(79,217,138,.5)" : C.chipedge}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer", fontFamily: UI }}>
              <span aria-hidden style={{ flex: "0 0 auto", width: 40, height: 22, borderRadius: 999, background: sw[i] ? C.mint : "#2a2416", position: "relative", transition: "background .15s" }}>
                <span style={{ position: "absolute", top: 2, left: sw[i] ? 20 : 2, width: 18, height: 18, borderRadius: "50%", background: "#0c0a05", transition: "left .15s", display: "block" }} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.ink }}>{s.label}</span>
                {s.sub && <span style={{ display: "block", fontSize: 11, color: C.dim }}>{s.sub}</span>}
              </span>
              <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 10.5, fontWeight: 700, color: sw[i] ? C.mint : C.faint }}>{sw[i] ? "ON" : "OFF"}</span>
            </button>
          ))}
        </div>
        <button className="cn-btn" onClick={submit} style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: acc, border: 0, borderRadius: 6, padding: "11px", cursor: "pointer" }}>CONFIRM</button>
      </>
    );
  }
  // build
  const need = dock.need;
  const toggleSel = (i: number) => setSel((a) => (a.includes(i) ? a.filter((x) => x !== i) : a.length < need ? [...a, i] : a));
  const submit = () => { const chosen = sel.map((i) => dock.parts[i]); if (chosen.length === need && chosen.every((p) => p.good)) onResolve("ok"); else onBad("Not quite. Pick only the strong, unguessable parts."); };
  return (
    <>
      {nudge ? <p style={{ fontSize: 12.5, color: C.red, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{nudge}</p>
        : <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "Build it:"} <span style={{ color: acc }}>({sel.length}/{need})</span></p>}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 10 }}>
        {dock.parts.map((p, i) => {
          const on = sel.includes(i);
          return (
            <button key={i} className="cn-opt" onClick={() => toggleSel(i)}
              style={{ fontFamily: UI, fontSize: 13.5, fontWeight: 700, color: on ? C.page : C.ink, background: on ? acc : C.chip, border: `1px solid ${on ? acc : C.chipedge}`, borderRadius: 8, padding: "8px 12px", cursor: "pointer", textAlign: "left" }}>
              {p.label}{p.sub && <span style={{ display: "block", fontSize: 10.5, fontWeight: 500, color: on ? "#5c4406" : C.dim, marginTop: 1 }}>{p.sub}</span>}
            </button>
          );
        })}
      </div>
      <button className="cn-btn" onClick={submit} disabled={sel.length !== need} style={{ width: "100%", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".04em", color: C.page, background: sel.length === need ? acc : "#4a3d20", border: 0, borderRadius: 6, padding: "11px", cursor: sel.length === need ? "pointer" : "not-allowed" }}>BUILD IT</button>
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
        <button className="cn-btn" onClick={passed ? onPass : restart} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.page, background: passed ? C.mint : acc, border: 0, borderRadius: 6, padding: "13px 20px", cursor: "pointer" }}>{passed ? "FINISH →" : "RUN THE TEST AGAIN"}</button>
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
      <div style={{ background: "#0c0a05", border: `1px solid ${C.edge}`, borderLeft: `3px solid ${acc}`, borderRadius: 8, padding: "12px 14px", fontSize: 14.5, lineHeight: 1.45, color: C.ink, marginBottom: 16 }}>{q.scenario}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{q.ask}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {order.map((oi) => <button key={oi} className="cn-opt" onClick={() => answer(oi)} style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, textAlign: "left", color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>{q.options[oi].label}</button>)}
      </div>
    </div>
  );
}

function BootScreen({ title, caseNumber, open, acc, onBoot }: { title: string; caseNumber: string; open: string[]; acc: string; onBoot: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 30px 30px", textAlign: "center" }}>
      <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".28em", textTransform: "uppercase", color: acc, fontWeight: 700, marginBottom: 6 }}>{caseNumber}</div>
      <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-.01em", marginBottom: 20 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, textAlign: "left", marginBottom: 26 }}>
        {open.slice(0, 2).map((l, i) => <div key={i} style={{ background: C.wrenbg, border: `1px solid rgba(43,212,180,.4)`, borderRadius: 10, padding: "10px 13px", fontSize: 13.5, lineHeight: 1.42, color: C.ink }}>{l}</div>)}
      </div>
      <button className="cn-btn" onClick={onBoot} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: ".04em", color: C.page, background: acc, border: 0, borderRadius: 6, padding: "13px 20px", cursor: "pointer" }}>▸ BOOT THE CONSOLE</button>
    </div>
  );
}

function Debrief({ data, acc, onExit, onNext }: { data: ConsoleCase["debrief"]; acc: string; onExit?: () => void; onNext?: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px 26px" }}>
      <div style={{ fontSize: 24, fontWeight: 800, color: C.mint, marginBottom: 14, textAlign: "center", lineHeight: 1.2, fontFamily: MONO }}>{data.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {data.lines.map((l, i) => <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.45, color: C.ink }}><span style={{ color: C.mint, flex: "0 0 auto" }}>✓</span><span>{l}</span></div>)}
      </div>
      <div style={{ background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 10, padding: "13px 15px", fontSize: 13.5, lineHeight: 1.5, color: C.dim, marginBottom: 20 }}>
        <b style={{ color: acc, display: "block", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5, fontFamily: MONO }}>Your move this week</b>{data.move}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="cn-btn" onClick={onExit} style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 6, padding: "12px", cursor: "pointer" }}>Back to map</button>
        {onNext && <button className="cn-btn" onClick={onNext} style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: C.page, background: acc, border: 0, borderRadius: 6, padding: "12px", cursor: "pointer" }}>Next case →</button>}
      </div>
    </div>
  );
}
