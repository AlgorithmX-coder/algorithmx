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
import { playWren, stopWren, useWrenSpeaking } from "../engine/audio";
import type { WarCase, WarStep, WarTest } from "./case16";

const C = {
  page: "#0a0812", ink: "#ECE8F7", dim: "#A99BD0", faint: "#655a86",
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
.wr-btn:focus-visible{outline:2px solid var(--v);outline-offset:2px}
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
  | { type: "choose"; prompt?: string; options: { label: string; sub?: string; outcome?: "good" | "bad"; then?: WarStep[] }[] }
  | { type: "connect"; prompt?: string; left: { id: string; label: string }[]; right: { id: string; label: string }[]; pairs: [string, string][] }
  | { type: "pin"; prompt?: string; cards: { label: string; good: boolean; sub?: string }[]; need: number }
  | { type: "clear"; text: string }
  | { type: "idle" }
  | null;

export default function WarRoomRuntime({ warCase, onExit, onNextCase }: { warCase: WarCase; onExit?: () => void; onNextCase?: () => void }) {
  const fast = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("fast") === "1";
  const [phase, setPhase] = useState<"boot" | "play" | "test" | "debrief">("boot");
  const [board, setBoard] = useState<string>("CASE BOARD");
  const [items, setItems] = useState<Item[]>([]);
  const [dock, setDock] = useState<Dock>(null);
  const [nudge, setNudge] = useState<string | null>(null);
  const [voiceOn, setVoiceOn] = useState(!fast);
  const voiceRef = useRef(!fast);
  useWrenSpeaking();
  const [, force] = useReducer((n) => n + 1, 0);
  const acc = warCase.accent ?? C.violet;

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

  const runSteps = async (steps: WarStep[]) => {
    for (const step of steps) {
      if (step.t === "wren") { push({ id: nextId(), kind: "wren", text: step.text }); await speak(step.text, step.voice); }
      else if (step.t === "note") { await working(step.text.length > 40 ? 700 : 450); push({ id: nextId(), kind: "note", text: step.text }); await wait(500); }
      else if (step.t === "choose") {
        let done = false;
        while (!done) {
          setNudge(null); setDock({ type: "choose", prompt: step.prompt, options: step.options });
          const picked = await awaitUser(); setDock(null);
          const opt = step.options.find((o) => o.label === picked)!;
          if (opt.then) await runSteps(opt.then);
          if (opt.outcome === "bad") { await wait(250); continue; }
          done = true;
        }
      } else if (step.t === "connect") {
        setNudge(null); setDock({ type: "connect", prompt: step.prompt, left: step.left, right: step.right, pairs: step.pairs });
        await awaitUser(); setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      } else if (step.t === "pin") {
        setNudge(null); setDock({ type: "pin", prompt: step.prompt, cards: step.cards, need: step.need });
        await awaitUser(); setDock(null);
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      }
    }
  };

  const runSkill = async (sk: WarCase["skills"][number], total: number) => {
    setDock(null); setItems([]); setBoard(sk.board ?? "CASE BOARD"); await wait(400);
    push({ id: nextId(), kind: "divider", kicker: `Skill ${sk.n} of ${total}`, title: sk.title, sub: sk.goal }); await wait(600);
    await runSteps(sk.learn);
    await runSteps(sk.practice);
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

  const run = async () => {
    setItems([]); setBoard("CASE BOARD");
    for (let i = 0; i < warCase.open.length; i++) { const line = warCase.open[i]; push({ id: nextId(), kind: "wren", text: line }); await speak(line, warCase.openVoice?.[i]); }
    push({ id: nextId(), kind: "roadmap", title: warCase.title, actor: warCase.actor, skills: warCase.skills.map((s) => ({ n: s.n, title: s.title, goal: s.goal })) });
    await wait(650);
    setDock({ type: "clear", text: "Ready? Skill 1 first." }); await awaitUser();
    const total = warCase.skills.length;
    for (const sk of warCase.skills) await runSkill(sk, total);
    await runBoss();
    setItems([]); setBoard("CASE BOARD"); await wait(400);
    push({ id: nextId(), kind: "wren", text: warCase.test.intro }); await speak(warCase.test.intro, warCase.test.introVoice);
    setDock({ type: "clear", text: "Start the test →" }); await awaitUser(); setDock(null);
    setPhase("test");
  };

  const start = () => { if (startedRef.current) return; startedRef.current = true; setPhase("play"); run(); };

  const nudgeRef = useRef(0);
  const nudgeBad = (text?: string) => { const i = nudgeRef.current++ % NUDGES.length; setNudge(text ?? "Not quite. Look again."); force(); if (voiceRef.current) playWren(NUDGES[i], true); };

  const wrenDot = <span aria-hidden style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 12 }}>{[4, 10, 6].map((h, i) => <i key={i} style={{ width: 2.5, height: h, background: C.wren, borderRadius: 2, display: "block" }} />)}</span>;

  return (
    <main className="wr" style={{ minHeight: "100dvh", background: `radial-gradient(900px 520px at 50% -8%, #241541 0%, rgba(36,21,65,0) 60%), ${C.page}`, color: C.ink, fontFamily: UI, display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 14px", overflow: "hidden", ["--v" as string]: acc }}>
      <style>{CSS}</style>
      <MatrixRain reduced={!!reduce} opacity={0.12} colors={["#B98BFF", "#D4B8FF", "#7A5CFF"]} head="#F0E6FF" />

      <button className="wr-btn" onClick={onExit} style={{ position: "fixed", top: 14, left: 14, zIndex: 20, fontFamily: MONO, fontSize: 11.5, fontWeight: 600, color: C.dim, background: "rgba(255,255,255,0.04)", border: `1px solid ${C.edge}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>← Leave</button>
      <button className="wr-btn" onClick={() => { const v = !voiceOn; setVoiceOn(v); if (!v) stopWren(); }} aria-pressed={voiceOn} style={{ position: "fixed", top: 14, right: 14, zIndex: 20, fontFamily: MONO, fontSize: 11.5, fontWeight: 700, color: voiceOn ? C.wren : C.dim, background: "rgba(255,255,255,0.04)", border: `1px solid ${voiceOn ? "rgba(43,212,180,.5)" : C.edge}`, borderRadius: 6, padding: "6px 12px", cursor: "pointer" }}>{voiceOn ? "🔊 WREN on" : "🔇 WREN off"}</button>

      <div style={{ width: "100%", maxWidth: 660, height: 760, maxHeight: "calc(100dvh - 30px)", background: C.panel, borderRadius: 14, border: `1px solid ${C.edge}`, boxShadow: `0 0 0 1px #000, 0 24px 70px rgba(0,0,0,.6), inset 0 0 60px rgba(185,139,255,.03)`, position: "relative", zIndex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 10, padding: "10px 15px", borderBottom: `1px solid ${C.edge}`, background: "linear-gradient(180deg,#1b1533,#130f22)", fontFamily: MONO }}>
          <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: acc, boxShadow: `0 0 8px ${acc}`, animation: reduce ? "none" : "wr-led 1.6s infinite", display: "block" }} />
          <span style={{ fontSize: 11.5, letterSpacing: ".16em", color: acc, fontWeight: 600 }}>ARC · WAR ROOM</span>
          <span style={{ marginLeft: "auto", fontSize: 10.5, letterSpacing: ".12em", color: C.faint }}>{warCase.caseNumber} · {board}</span>
        </div>

        {phase === "boot" ? (
          <BootScreen title={warCase.title} caseNumber={warCase.caseNumber} open={warCase.open} acc={acc} onBoot={start} />
        ) : phase === "test" ? (
          <TestView test={warCase.test} voiceOn={voiceOn} acc={acc} onPass={() => setPhase("debrief")} />
        ) : phase === "debrief" ? (
          <Debrief data={warCase.debrief} acc={acc} onExit={onExit} onNext={onNextCase} />
        ) : (
          <>
            <div ref={workRef} className="wr-work" style={{ flex: "1 1 auto", overflowY: "auto", padding: "16px 15px 10px", display: "flex", flexDirection: "column", gap: 4, backgroundImage: "radial-gradient(rgba(185,139,255,0.06) 1px, transparent 1px)", backgroundSize: "22px 22px" }}>
              {items.map((it) => <ItemView key={it.id} it={it} acc={acc} wrenDot={wrenDot} />)}
            </div>
            <div style={{ flex: "0 0 auto", borderTop: `1px solid ${C.edge}`, background: "linear-gradient(180deg,#191233,#110d20)", padding: "12px 14px 15px" }}>
              <DockView dock={dock} nudge={nudge} acc={acc} onResolve={(v) => resolveRef.current?.(v)} onBad={nudgeBad} />
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

function DockView({ dock, nudge, acc, onResolve, onBad }: { dock: Dock; nudge: string | null; acc: string; onResolve: (v: string) => void; onBad: (t?: string) => void }) {
  const [sel, setSel] = useState<number[]>([]);        // pin: selected card indices
  const [selLeft, setSelLeft] = useState<string | null>(null); // connect: currently picked left id
  const [matched, setMatched] = useState<string[]>([]);        // connect: solved left ids
  useEffect(() => { setSel([]); setSelLeft(null); setMatched([]); }, [dock]);

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
      } else { setSelLeft(null); onBad("Not a match. Look again at what links to what."); }
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
  // pin
  const need = dock.need;
  const toggle = (i: number) => setSel((a) => (a.includes(i) ? a.filter((x) => x !== i) : a.length < need ? [...a, i] : a));
  const submit = () => { const chosen = sel.map((i) => dock.cards[i]); if (chosen.length === need && chosen.every((c) => c.good)) onResolve("ok"); else onBad("Not quite. Pin only the right cards."); };
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
      <div style={{ fontSize: 14, fontWeight: 700, color: C.ink, marginBottom: 12 }}>{q.ask}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {order.map((oi) => <button key={oi} className="wr-opt" onClick={() => answer(oi)} style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, textAlign: "left", color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 8, padding: "12px 14px", cursor: "pointer" }}>{q.options[oi].label}</button>)}
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
      <button className="wr-btn" onClick={onBoot} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, letterSpacing: ".04em", color: C.page, background: acc, border: 0, borderRadius: 6, padding: "13px 20px", cursor: "pointer" }}>▸ OPEN THE BOARD</button>
    </div>
  );
}

function Debrief({ data, acc, onExit, onNext }: { data: WarCase["debrief"]; acc: string; onExit?: () => void; onNext?: () => void }) {
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
        <button className="wr-btn" onClick={onExit} style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 6, padding: "12px", cursor: "pointer" }}>Back to map</button>
        {onNext && <button className="wr-btn" onClick={onNext} style={{ flex: 1, fontFamily: MONO, fontWeight: 700, fontSize: 13.5, color: C.page, background: acc, border: 0, borderRadius: 6, padding: "12px", cursor: "pointer" }}>Next case →</button>}
      </div>
    </div>
  );
}
