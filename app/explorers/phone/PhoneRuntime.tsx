"use client";

/**
 * THE PHONE — Block 2's runtime. Not the Signal Room. A full-screen fake phone
 * where a con plays out in the child's DMs and WREN coaches from inside the
 * thread. Data-driven by a PhoneCase (see phone/case06.ts): threads play in
 * order, the con pulls levers, the child names them and chooses how it ends.
 *
 * Self-contained styling (its own palette + system font) so it reads as a real
 * phone, a completely different world from the analyst desk. Text-first, so
 * there's no narrator to sound robotic.
 */

import { useEffect, useReducer, useRef, useState } from "react";
import { MatrixRain } from "../MatrixRain";
import { playWren, stopWren, useWrenSpeaking } from "../engine/audio";
import { LEVERS, type LeverId, type PhoneCase, type PhoneStep } from "./case06";
import BlockIntro from "./BlockIntro";
import { block2Intro } from "./blockIntroData";

const C = {
  page: "#0d0d12", ink: "#F3F4F7", dim: "#9A9AA6", faint: "#6b6b78",
  phone: "#0A0A0C", chat: "#101017", chrome: "#17171f",
  inc: "#26262f", out: "#FF3D8A", wren: "#2BD4B4", wrenbg: "#0f2622",
  // Block 2 identity = PINK (matrix, brand actions, your own bubbles). WREN stays teal.
  pink: "#FF3D8A", pinkHi: "#FF74AE", pinkbg: "#2a0f1e",
  warn: "#F5A623", red: "#FF5A63", mint: "#31D9A0", line: "#232330", chip: "#1c1c26", chipedge: "#33333f",
};
const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;
// WREN's spoken "not that one, look again" on a wrong lever — rotates so it's not
// the same line twice, and never reveals the answer (the Block-1 nudge, restored).
const NUDGES = ["/audio/wren/m06p-nudge-1.mp3", "/audio/wren/m06p-nudge-2.mp3", "/audio/wren/m06p-nudge-3.mp3"];

const CSS = `
.ph *{box-sizing:border-box}
.ph-thread::-webkit-scrollbar{width:0}
@keyframes ph-pop{from{opacity:0;transform:translateY(9px) scale(.98)}to{opacity:1;transform:none}}
@keyframes ph-blink{0%,80%,100%{opacity:.3;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
@keyframes ph-eq{0%,100%{transform:scaleY(.5)}50%{transform:scaleY(1)}}
@keyframes ph-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.ph-row{animation:ph-pop .28s cubic-bezier(.2,.8,.2,1) both}
.ph-lever{transition:transform .1s,border-color .15s,background .15s}
.ph-lever:hover:not(:disabled){border-color:${C.wren};transform:translateY(-2px)}
.ph-lever:focus-visible{outline:2px solid ${C.wren};outline-offset:2px}
.ph-lever.no{animation:ph-shake .3s}
.ph-reply:hover{border-color:${C.out};transform:translateY(-1px)}
.ph-reply{transition:transform .1s,border-color .15s}
.ph-reply:focus-visible{outline:2px solid ${C.out};outline-offset:2px}
.ph-btn:focus-visible{outline:2px solid ${C.wren};outline-offset:2px}
@media (prefers-reduced-motion: reduce){.ph *{animation-duration:.001ms !important}}
`;

type Item =
  | { id: number; kind: "con"; text: string; ask?: boolean; tag?: string }
  | { id: number; kind: "you"; text: string }
  | { id: number; kind: "wren"; text: string }
  | { id: number; kind: "typing" };

type Dock =
  | { type: "call"; answer: LeverId }
  | { type: "choose"; prompt?: string; options: { label: string; outcome?: "good" | "bad"; then?: PhoneStep[] }[] }
  | { type: "clear"; text: string }
  | { type: "composer" }
  | null;

export default function PhoneRuntime({ phoneCase, onExit, onNextCase }: { phoneCase: PhoneCase; onExit?: () => void; onNextCase?: () => void }) {
  const [phase, setPhase] = useState<"brief" | "lock" | "play" | "debrief">("brief");
  const [header, setHeader] = useState(phoneCase.threads[0]);
  const [items, setItems] = useState<Item[]>([]);
  const [dock, setDock] = useState<Dock>(null);
  const [wrongId, setWrongId] = useState<LeverId | null>(null);
  const [voiceOn, setVoiceOn] = useState(true);
  const voiceRef = useRef(true);
  const speaking = useWrenSpeaking();
  const [, force] = useReducer((n) => n + 1, 0);

  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const idRef = useRef(0);
  const lastConRef = useRef<number | null>(null);
  const resolveRef = useRef<((v: string) => void) | null>(null);
  const startedRef = useRef(false);
  const threadRef = useRef<HTMLDivElement>(null);

  const nextId = () => ++idRef.current;
  const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, reduce ? Math.min(ms, 120) : ms));
  const scroll = () => { const t = threadRef.current; if (t) t.scrollTop = t.scrollHeight; };
  useEffect(scroll, [items, dock]);

  const push = (it: Item) => { setItems((a) => [...a, it]); if (it.kind === "con") lastConRef.current = it.id; };
  const removeItem = (id: number) => setItems((a) => a.filter((x) => x.id !== id));

  const typing = async (ms: number) => {
    const id = nextId();
    push({ id, kind: "typing" });
    await wait(ms);
    removeItem(id);
  };
  const awaitUser = () => new Promise<string>((res) => { resolveRef.current = res; });

  // WREN speaks a coaching line and the thread WAITS for her to finish before
  // anything advances — that's the anti-whizz. Voice off = a read-timer instead.
  const speak = (text: string, voice?: string) =>
    new Promise<void>((res) => {
      let done = false;
      const fin = () => { if (!done) { done = true; res(); } };
      if (voice && voiceRef.current) { playWren(voice, true, fin); setTimeout(fin, 16000); }
      else setTimeout(fin, reduce ? 300 : Math.max(2400, text.length * 42));
    });

  useEffect(() => { voiceRef.current = voiceOn; }, [voiceOn]);
  useEffect(() => () => stopWren(), []);

  // process a flat list of steps; choose loops on a "bad" outcome (rewind)
  const runSteps = async (steps: PhoneStep[]) => {
    for (const step of steps) {
      if (step.t === "con") {
        await typing(step.delay ?? 1100);
        push({ id: nextId(), kind: "con", text: step.text, ask: step.ask });
      } else if (step.t === "you") {
        push({ id: nextId(), kind: "you", text: step.text });
        await wait(500);
      } else if (step.t === "wren") {
        push({ id: nextId(), kind: "wren", text: step.text });
        await speak(step.text, step.voice);
      } else if (step.t === "call") {
        setDock({ type: "call", answer: step.answer });
        await awaitUser(); // resolves only on the correct lever
        setDock(null);
        const cid = lastConRef.current;
        const nm = LEVERS.find((l) => l.id === step.answer)!.name;
        setItems((a) => a.map((x) => (x.id === cid && x.kind === "con" ? { ...x, tag: nm } : x)));
        if (step.ok) { push({ id: nextId(), kind: "wren", text: step.ok }); await speak(step.ok, step.okVoice); }
      } else if (step.t === "choose") {
        let done = false;
        while (!done) {
          setDock({ type: "choose", prompt: step.prompt, options: step.options });
          const picked = await awaitUser();
          setDock(null);
          const opt = step.options.find((o) => o.label === picked)!;
          push({ id: nextId(), kind: "you", text: opt.label });
          await wait(500);
          if (opt.then) await runSteps(opt.then);
          if (opt.outcome === "bad") { await wait(300); continue; } // rewind: re-present the choice
          done = true;
        }
      }
    }
  };

  const runThread = async (t: PhoneCase["threads"][number], last: boolean) => {
    setHeader(t);
    setItems([]);
    lastConRef.current = null;
    await wait(500);
    if (t.intro) { push({ id: nextId(), kind: "wren", text: t.intro }); await speak(t.intro, t.introVoice); }
    await runSteps(t.steps);
    // thread cleared
    setDock({ type: "clear", text: t.clear });
    if (!last) await awaitUser();
  };

  const run = async () => {
    // WREN's opening lines land as messages before the first thread
    setHeader({ ...phoneCase.threads[0], who: "WREN", avatar: "◈", tag: undefined, sub: "in your ear" });
    setItems([]);
    for (let i = 0; i < phoneCase.open.length; i++) { const line = phoneCase.open[i]; push({ id: nextId(), kind: "wren", text: line }); await speak(line, phoneCase.openVoice?.[i]); }
    setDock({ type: "clear", text: "Ready when you are." });
    await awaitUser();
    for (let i = 0; i < phoneCase.threads.length; i++) {
      await runThread(phoneCase.threads[i], i === phoneCase.threads.length - 1);
    }
    setDock(null);
    setPhase("debrief");
  };

  const start = () => { if (startedRef.current) return; startedRef.current = true; setPhase("play"); run(); };

  // ---- interaction handlers ----
  const nudgeRef = useRef(0);
  const tapLever = (id: LeverId) => {
    if (dock?.type !== "call") return;
    if (id === dock.answer) { setWrongId(null); resolveRef.current?.("ok"); }
    else {
      setWrongId(id); force(); setTimeout(() => setWrongId(null), 350);
      // WREN speaks up when you get it wrong (rotating, no answer given).
      if (voiceRef.current) playWren(NUDGES[nudgeRef.current++ % NUDGES.length], true);
    }
  };
  const tapReply = (label: string) => { if (dock?.type === "choose") resolveRef.current?.(label); };
  const tapContinue = () => resolveRef.current?.("go");

  /* ------------------------------------------------------------ render */
  const wrenAvatar = (
    <span aria-hidden style={{ display: "flex", gap: 2, alignItems: "flex-end", height: 13 }}>
      {[5, 11, 7].map((h, i) => <i key={i} style={{ width: 2.5, height: h, background: C.wren, borderRadius: 2, display: "block", animation: reduce ? "none" : `ph-eq .9s ${i * 0.15}s infinite ease-in-out` }} />)}
    </span>
  );

  // The block briefing (ATLAS) plays first, then the phone opens.
  if (phase === "brief") return <BlockIntro data={block2Intro} onBegin={() => setPhase("lock")} />;

  return (
    <main className="ph" style={{ minHeight: "100vh", background: `radial-gradient(900px 500px at 50% -10%, #241033 0%, rgba(36,16,51,0) 60%), ${C.page}`, color: C.ink, fontFamily: UI, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "18px 14px", overflow: "hidden" }}>
      <style>{CSS}</style>
      <MatrixRain reduced={!!reduce} opacity={0.13} colors={["#FF3D8A", "#FF74AE", "#C355FF"]} head="#FFE3EE" />

      <button className="ph-btn" onClick={onExit} style={{ position: "fixed", top: 14, left: 14, zIndex: 20, fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: C.dim, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 13px", cursor: "pointer" }}>← Leave</button>
      <button className="ph-btn" onClick={() => { const v = !voiceOn; setVoiceOn(v); if (!v) stopWren(); }} aria-pressed={voiceOn} style={{ position: "fixed", top: 14, right: 14, zIndex: 20, fontFamily: UI, fontSize: 12.5, fontWeight: 700, color: voiceOn ? C.wren : C.dim, background: "rgba(255,255,255,0.05)", border: `1px solid ${voiceOn ? "rgba(43,212,180,.5)" : C.line}`, borderRadius: 999, padding: "6px 13px", cursor: "pointer" }}>{voiceOn ? "🔊 WREN on" : "🔇 WREN off"}</button>

      <div style={{ width: "100%", maxWidth: 384, height: 780, maxHeight: "calc(100vh - 30px)", background: C.phone, borderRadius: 42, padding: 10, boxShadow: `0 0 0 2px #2a2a34, 0 30px 80px rgba(0,0,0,.6)`, position: "relative", zIndex: 1 }}>
        <div style={{ position: "relative", height: "100%", background: C.chat, borderRadius: 33, overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div aria-hidden style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 148, height: 25, background: C.phone, borderRadius: "0 0 17px 17px", zIndex: 6 }} />
          {/* status bar */}
          <div style={{ height: 42, flex: "0 0 42px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 22px", fontSize: 13.5, fontWeight: 600, zIndex: 5 }}>
            <span>9:41</span>
            <span style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 11 }}>
              <span aria-hidden>●●●</span><span aria-hidden>Wi‑Fi</span>
              <span aria-hidden style={{ width: 22, height: 11, border: `1.4px solid ${C.ink}`, borderRadius: 3, position: "relative", opacity: 0.9 }}><i style={{ position: "absolute", left: 1.5, top: 1.5, bottom: 1.5, width: "70%", background: C.mint, borderRadius: 1, display: "block" }} /></span>
            </span>
          </div>

          {phase === "lock" ? (
            <LockScreen open={phoneCase.open} title={phoneCase.title} onOpen={start} />
          ) : phase === "debrief" ? (
            <Debrief data={phoneCase.debrief} onExit={onExit} onNext={onNextCase} />
          ) : (
            <>
              {/* chat header */}
              <div style={{ flex: "0 0 auto", padding: "4px 13px 11px", borderBottom: `1px solid ${C.line}`, display: "flex", alignItems: "center", gap: 10, background: C.chrome }}>
                <span aria-hidden style={{ color: C.out, fontSize: 25, lineHeight: 1, marginRight: -2 }}>‹</span>
                <span aria-hidden style={{ width: 37, height: 37, borderRadius: "50%", background: header.who === "WREN" ? "radial-gradient(circle at 40% 35%,#1c5248,#0c2f29)" : "linear-gradient(135deg,#7a49c9,#c9497f)", border: header.who === "WREN" ? `1.5px solid ${C.wren}` : "none", display: "grid", placeItems: "center", fontWeight: 700, fontSize: 14, color: "#fff" }}>{header.avatar}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15.5, lineHeight: 1.15, color: header.who === "WREN" ? C.wren : C.ink }}>{header.who}</div>
                  <div style={{ fontSize: 11.5, color: header.tag ? C.warn : C.dim, display: "flex", alignItems: "center", gap: 5 }}>
                    {header.tag && <b style={{ fontSize: 9.5, background: "rgba(245,166,35,.16)", border: `1px solid rgba(245,166,35,.5)`, color: C.warn, padding: "1px 6px", borderRadius: 999, fontWeight: 700, letterSpacing: ".03em" }}>{header.tag}</b>}
                    {header.sub}
                  </div>
                </div>
              </div>

              {/* thread */}
              <div ref={threadRef} className="ph-thread" style={{ flex: "1 1 auto", overflowY: "auto", padding: "14px 13px 8px", display: "flex", flexDirection: "column", gap: 3 }}>
                <div style={{ textAlign: "center", color: C.faint, fontSize: 11, margin: "2px 0 8px" }}>Today 9:41</div>
                {items.map((it) => <ItemView key={it.id} it={it} wrenAvatar={wrenAvatar} />)}
              </div>

              {/* dock */}
              <div style={{ flex: "0 0 auto", borderTop: `1px solid ${C.line}`, background: C.chrome, padding: "11px 12px 14px" }}>
                <DockView dock={dock} wrongId={wrongId} onLever={tapLever} onReply={tapReply} onContinue={tapContinue} />
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function ItemView({ it, wrenAvatar }: { it: Item; wrenAvatar: React.ReactNode }) {
  if (it.kind === "typing") {
    return (
      <div className="ph-row" style={{ display: "flex", marginTop: 7 }}>
        <div style={{ display: "inline-flex", gap: 4, alignItems: "center", padding: "13px 15px", background: C.inc, borderRadius: 19, borderBottomLeftRadius: 6 }}>
          {[0, 1, 2].map((i) => <i key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: C.dim, display: "block", animation: `ph-blink 1.2s ${i * 0.18}s infinite ease-in-out` }} />)}
        </div>
      </div>
    );
  }
  if (it.kind === "wren") {
    return (
      <div className="ph-row" style={{ margin: "8px 4px 2px", background: C.wrenbg, border: `1px solid rgba(43,212,180,.5)`, borderRadius: 16, padding: "10px 12px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <span style={{ flex: "0 0 auto", width: 29, height: 29, borderRadius: "50%", background: "radial-gradient(circle at 40% 35%,#1c5248,#0c2f29)", border: `1.5px solid ${C.wren}`, display: "grid", placeItems: "center" }}>{wrenAvatar}</span>
        <div style={{ fontSize: 13.5, lineHeight: 1.42 }}>
          <b style={{ color: C.wren, fontWeight: 700, display: "block", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 2 }}>WREN · in your ear</b>
          {it.text}
        </div>
      </div>
    );
  }
  const me = it.kind === "you";
  return (
    <div className="ph-row" style={{ display: "flex", marginTop: 7, justifyContent: me ? "flex-end" : "flex-start" }}>
      <div style={{ maxWidth: "80%", padding: "9px 13px", borderRadius: 19, fontSize: 15, lineHeight: 1.34, background: me ? C.out : C.inc, color: me ? "#fff" : C.ink, borderBottomRightRadius: me ? 6 : 19, borderBottomLeftRadius: me ? 19 : 6, boxShadow: (it as { ask?: boolean }).ask ? `0 0 0 1.5px ${C.red}` : "none" }}>
        {it.text}
        {"tag" in it && it.tag && (
          <span style={{ display: "flex", width: "fit-content", alignItems: "center", gap: 4, marginTop: 6, fontSize: 10.5, fontWeight: 700, letterSpacing: ".05em", color: C.mint, background: "rgba(49,217,160,.12)", border: `1px solid rgba(49,217,160,.4)`, padding: "1px 7px", borderRadius: 999 }}>⚑ {it.tag} · called</span>
        )}
      </div>
    </div>
  );
}

function DockView({ dock, wrongId, onLever, onReply, onContinue }: { dock: Dock; wrongId: LeverId | null; onLever: (id: LeverId) => void; onReply: (l: string) => void; onContinue: () => void }) {
  if (!dock || dock.type === "composer") {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 9, opacity: 0.55 }}>
        <div style={{ flex: 1, height: 36, borderRadius: 18, border: `1px solid ${C.chipedge}`, background: "#15151d", display: "flex", alignItems: "center", padding: "0 14px", color: C.faint, fontSize: 14 }}>Message…</div>
        <div aria-hidden style={{ width: 34, height: 34, borderRadius: "50%", background: "#26263050", display: "grid", placeItems: "center", color: C.faint }}>➤</div>
      </div>
    );
  }
  if (dock.type === "call") {
    return (
      <>
        <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>Which lever is he pulling <b style={{ color: C.pink }}>now</b>? Tap it.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7 }}>
          {LEVERS.map((l) => (
            <button key={l.id} className={`ph-lever${wrongId === l.id ? " no" : ""}`} onClick={() => onLever(l.id)}
              style={{ fontFamily: UI, fontWeight: 700, fontSize: 12.5, color: wrongId === l.id ? C.red : C.ink, background: wrongId === l.id ? "rgba(255,90,99,.14)" : C.chip, border: `1px solid ${wrongId === l.id ? C.red : C.chipedge}`, borderRadius: 12, padding: "9px 4px", cursor: "pointer" }}>
              <span aria-hidden style={{ display: "block", fontSize: 16, marginBottom: 1 }}>{l.emoji}</span>{l.name}
            </button>
          ))}
        </div>
      </>
    );
  }
  if (dock.type === "choose") {
    return (
      <>
        <p style={{ fontSize: 12, color: C.dim, textAlign: "center", margin: "0 0 9px", fontWeight: 600 }}>{dock.prompt ?? "How do you reply?"}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dock.options.map((o, i) => (
            <button key={i} className="ph-reply" onClick={() => onReply(o.label)} style={{ fontFamily: UI, fontSize: 14.5, fontWeight: 600, textAlign: "left", color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 14, padding: "11px 14px", cursor: "pointer" }}>{o.label}</button>
          ))}
        </div>
      </>
    );
  }
  // clear
  return (
    <div style={{ textAlign: "center" }}>
      <p style={{ fontSize: 13.5, color: C.mint, margin: "2px 0 11px", fontWeight: 600 }}>{dock.text}</p>
      <button className="ph-btn" onClick={onContinue} style={{ fontFamily: UI, fontWeight: 700, fontSize: 13.5, color: C.page, background: C.pink, border: 0, borderRadius: 999, padding: "10px 24px", cursor: "pointer" }}>Continue →</button>
    </div>
  );
}

function LockScreen({ open, title, onOpen }: { open: string[]; title: string; onOpen: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px 30px", textAlign: "center" }}>
      <div style={{ fontSize: 12, letterSpacing: ".28em", textTransform: "uppercase", color: C.pink, fontWeight: 700, marginBottom: 6 }}>Case 006</div>
      <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: "-.01em", marginBottom: 20 }}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9, textAlign: "left", marginBottom: 26 }}>
        {open.slice(0, 2).map((l, i) => (
          <div key={i} style={{ background: C.wrenbg, border: `1px solid rgba(43,212,180,.4)`, borderRadius: 14, padding: "10px 13px", fontSize: 13.5, lineHeight: 1.42, color: C.ink }}>{l}</div>
        ))}
      </div>
      <button className="ph-btn" onClick={onOpen} style={{ fontFamily: UI, fontWeight: 700, fontSize: 15, color: C.page, background: C.pink, border: 0, borderRadius: 999, padding: "13px 20px", cursor: "pointer" }}>Open your messages →</button>
    </div>
  );
}

function Debrief({ data, onExit, onNext }: { data: PhoneCase["debrief"]; onExit?: () => void; onNext?: () => void }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 24px 26px" }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: C.mint, marginBottom: 14, textAlign: "center", lineHeight: 1.2 }}>{data.title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {data.lines.map((l, i) => (
          <div key={i} style={{ display: "flex", gap: 10, fontSize: 14, lineHeight: 1.45, color: C.ink }}>
            <span style={{ color: C.mint, flex: "0 0 auto" }}>✓</span><span>{l}</span>
          </div>
        ))}
      </div>
      <div style={{ background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 14, padding: "13px 15px", fontSize: 13.5, lineHeight: 1.5, color: C.dim, marginBottom: 20 }}>
        <b style={{ color: C.pink, display: "block", fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 5 }}>Your move this week</b>{data.move}
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <button className="ph-btn" onClick={onExit} style={{ flex: 1, fontFamily: UI, fontWeight: 700, fontSize: 14, color: C.ink, background: C.chip, border: `1px solid ${C.chipedge}`, borderRadius: 999, padding: "12px", cursor: "pointer" }}>Back to map</button>
        {onNext && <button className="ph-btn" onClick={onNext} style={{ flex: 1, fontFamily: UI, fontWeight: 700, fontSize: 14, color: C.page, background: C.pink, border: 0, borderRadius: 999, padding: "12px", cursor: "pointer" }}>Next case →</button>}
      </div>
    </div>
  );
}
