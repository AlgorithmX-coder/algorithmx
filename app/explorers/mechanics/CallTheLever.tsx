"use client";

/**
 * CALL THE LEVER — Block 2's carnival signature (a SIMULATE-flavoured live-con
 * mechanic). A barker works the child one line at a time; before the pitch
 * lands they tap the pressure lever being pulled. Naming it right snaps it;
 * a wrong tap buzzes and sends them back to read the con (no answer handed
 * over). Deliberately carnival-styled and SELF-CONTAINED — it does not use the
 * Signal Room tokens, so the human-factor block reads as its own world.
 *
 * Safety line: the child reads and names attacks, never authors them.
 */

import { useEffect, useState } from "react";
import { playWren, playWrenNudge, stopWren } from "../engine/audio";
import type { LeverPayload, MechanicProps } from "../engine/types";

const C = {
  night: "#180B27",
  booth: "#2E1848",
  booth2: "#3A1E5C",
  edge: "#6B3FA0",
  cream: "#FFF3E0",
  mauve: "#C7A9D6",
  gold: "#FFC13B",
  goldHot: "#FF8A3D",
  pink: "#FF3D7F",
  mint: "#37E0B8",
  red: "#FF5A5F",
};
const DISPLAY = `"Alfa Slab One", Georgia, serif`;
const BODY = `"Fredoka", ui-rounded, "Segoe UI", system-ui, sans-serif`;

const LEVERS = [
  { id: "hurry", name: "HURRY", tag: "“no time, NOW”", ic: "⏱️" },
  { id: "scarcity", name: "SCARCITY", tag: "“last one, ever”", ic: "🎟️" },
  { id: "authority", name: "AUTHORITY", tag: "“I'm in charge”", ic: "🎩" },
  { id: "liking", name: "LIKING", tag: "“we're pals, right?”", ic: "🤝" },
  { id: "fear", name: "FEAR", tag: "“or something bad…”", ic: "😱" },
  { id: "payback", name: "PAYBACK", tag: "“you owe me”", ic: "🎁" },
] as const;

const CSS = `
.ctl-fonts { }
@import url('https://fonts.googleapis.com/css2?family=Alfa+Slab+One&family=Fredoka:wght@400;500;600;700&display=swap');
.ctl-bulbs { display:flex; flex-wrap:wrap; justify-content:center; gap:0; line-height:0; margin-bottom:6px; }
.ctl-bulbs i { width:9px; height:9px; margin:4px; border-radius:50%;
  background: radial-gradient(circle at 35% 30%, #fff, #FFE9B3 45%, ${C.goldHot} 100%);
  box-shadow: 0 0 7px ${C.gold}; animation: ctl-flick 1.6s infinite ease-in-out; }
.ctl-bulbs i:nth-child(2n){animation-delay:.2s} .ctl-bulbs i:nth-child(3n){animation-delay:.5s}
.ctl-bulbs i:nth-child(4n){animation-delay:.8s} .ctl-bulbs i:nth-child(5n){animation-delay:1.1s}
@keyframes ctl-flick { 0%,100%{opacity:1} 50%{opacity:.45} }
@keyframes ctl-rise { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
@keyframes ctl-buzz { 0%,100%{transform:none} 25%{transform:translateX(-5px)} 75%{transform:translateX(5px)} }
.ctl-lever { transition: transform .12s, box-shadow .2s, background .2s, border-color .2s; }
.ctl-lever:hover:not(:disabled){ transform:translateY(-3px); box-shadow:0 8px 22px rgba(0,0,0,.4); border-color:${C.gold}; }
.ctl-lever:focus-visible{ outline:3px solid ${C.gold}; outline-offset:2px; }
.ctl-lever.buzz{ animation: ctl-buzz .3s; }
.ctl-next:hover{ background:${C.goldHot} !important; }
.ctl-next:focus-visible{ outline:3px solid ${C.cream}; outline-offset:2px; }
@media (prefers-reduced-motion: reduce){ .ctl-bulbs i, .ctl-lever.buzz { animation:none !important; } }
`;

export default function CallTheLever({ payload, reduced, audio, onEvent, voiceOn }: MechanicProps<LeverPayload>) {
  const [round, setRound] = useState(0);
  const [called, setCalled] = useState(false); // this round's lever named
  const [buzzId, setBuzzId] = useState<string | null>(null);
  const [phase, setPhase] = useState<"play" | "done">("play");
  const [wrongOnce, setWrongOnce] = useState(false);
  const [reviewReady, setReviewReady] = useState(false);

  const r = payload.rounds[round];
  const last = round === payload.rounds.length - 1;

  useEffect(() => {
    if (phase !== "done") return;
    if (payload.doneAudio) playWren(payload.doneAudio, !!voiceOn);
    const t = setTimeout(() => setReviewReady(true), reduced ? 400 : 15000);
    return () => { clearTimeout(t); stopWren(); };
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const tap = (id: string) => {
    if (called) return;
    if (id === r.answer) {
      setCalled(true);
      setBuzzId(null);
      audio.stamp();
      onEvent({ kind: "HIT" });
    } else {
      setWrongOnce(true);
      setBuzzId(id);
      audio.thud();
      playWrenNudge(!!voiceOn);
      onEvent({ kind: "MISS" });
      window.setTimeout(() => setBuzzId((b) => (b === id ? null : b)), 320);
    }
  };

  const advance = () => {
    audio.click();
    if (last) { setPhase("done"); } else { setRound((n) => n + 1); setCalled(false); setBuzzId(null); }
  };

  const pulled = called ? LEVERS.find((l) => l.id === r.answer) : null;

  return (
    <section style={{ maxWidth: 640, margin: "0 auto", fontFamily: BODY, color: C.cream }}>
      <style>{CSS}</style>
      <div
        style={{
          background: `radial-gradient(600px 220px at 50% 0, rgba(255,61,127,0.16), transparent 70%), linear-gradient(180deg, ${C.booth}, ${C.night})`,
          border: `1px solid ${C.edge}`,
          borderRadius: 20,
          padding: "20px 20px 24px",
          boxShadow: "0 24px 60px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.06)",
        }}
      >
        <div className="ctl-bulbs" aria-hidden="true">
          {Array.from({ length: 22 }).map((_, i) => <i key={i} />)}
        </div>

        {/* round tickets */}
        <div style={{ display: "flex", gap: 7, justifyContent: "center", margin: "4px 0 14px" }}>
          {payload.rounds.map((_, i) => (
            <span key={i} style={{ width: 10, height: 10, borderRadius: 999, background: i < round || (i === round && called) ? C.mint : C.booth2, boxShadow: i < round || (i === round && called) ? `0 0 8px ${C.mint}` : `inset 0 0 0 1px ${C.edge}` }} />
          ))}
        </div>

        {phase === "play" ? (
          <>
            {/* WREN in your ear */}
            <div style={{ animation: "ctl-rise .35s both", marginBottom: 10, marginLeft: "auto", maxWidth: "86%", background: "rgba(55,224,184,0.12)", border: `1px solid rgba(55,224,184,0.55)`, borderRadius: 14, borderBottomRightRadius: 4, padding: "10px 13px" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.mint, marginBottom: 3 }}>WREN · in your ear</span>
              <span style={{ fontWeight: 500 }}>{round === 0 ? "Read him, don't react. What's he reaching for?" : called ? "Called it. Watch him deflate." : "Next stall, same game. Call it."}</span>
            </div>

            {/* the barker */}
            <div style={{ animation: "ctl-rise .35s both", maxWidth: "88%", background: `linear-gradient(180deg,#4a2170,#3a1a5a)`, border: `1px solid ${C.edge}`, borderRadius: 16, borderBottomLeftRadius: 4, padding: "12px 15px", filter: called ? "grayscale(1) brightness(.6)" : "none", opacity: called ? 0.55 : 1, transition: "filter .5s, opacity .5s", position: "relative" }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, letterSpacing: ".12em", textTransform: "uppercase", color: C.pink, marginBottom: 3 }}>The Barker</span>
              <span style={{ fontWeight: 500 }}>{r.line}</span>
              {called && <span style={{ position: "absolute", right: 10, bottom: 8, fontFamily: DISPLAY, color: C.mint, fontSize: 12, transform: "rotate(-8deg)", border: `2px solid ${C.mint}`, padding: "0 5px", borderRadius: 4 }}>CALLED</span>}
            </div>

            <p style={{ textAlign: "center", fontWeight: 700, color: C.gold, letterSpacing: ".02em", margin: "16px 0 12px" }}>
              {called ? "The lever snaps." : "Which lever is he pulling?"}
            </p>

            {/* the six levers */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
              {LEVERS.map((l) => {
                const isPulled = called && l.id === r.answer;
                return (
                  <button
                    key={l.id}
                    className={`ctl-lever${buzzId === l.id ? " buzz" : ""}`}
                    onClick={() => tap(l.id)}
                    disabled={called}
                    style={{
                      fontFamily: BODY, fontWeight: 700, fontSize: 14, color: C.cream, cursor: called ? "default" : "pointer",
                      background: isPulled ? `linear-gradient(180deg,#0f5f4c,#0c4b3d)` : buzzId === l.id ? `linear-gradient(180deg,#5f1f28,#4a1820)` : `linear-gradient(180deg, ${C.booth2}, ${C.booth})`,
                      border: `1px solid ${isPulled ? C.mint : buzzId === l.id ? C.red : C.edge}`,
                      boxShadow: isPulled ? `0 0 0 2px ${C.mint}, 0 0 22px rgba(55,224,184,.5)` : "none",
                      borderRadius: 13, padding: "13px 8px 11px", textAlign: "center",
                    }}
                  >
                    <span style={{ display: "block", fontSize: 22, marginBottom: 4, lineHeight: 1 }} aria-hidden="true">{l.ic}</span>
                    {l.name}
                    <span style={{ display: "block", fontSize: 11, fontWeight: 500, color: C.mauve, marginTop: 2 }}>{l.tag}</span>
                  </button>
                );
              })}
            </div>

            {/* reveal on correct */}
            {called && pulled && (
              <div role="status" style={{ animation: "ctl-rise .3s both", marginTop: 16, padding: "14px 16px", borderRadius: 14, background: "rgba(55,224,184,0.12)", border: `1px solid ${C.mint}` }}>
                <p style={{ margin: 0, fontWeight: 500, lineHeight: 1.55 }}>{r.why}</p>
                <button className="ctl-next" onClick={advance} style={{ marginTop: 12, fontFamily: BODY, fontWeight: 700, fontSize: 15, color: C.night, background: C.gold, border: 0, borderRadius: 999, padding: "9px 20px", cursor: "pointer" }}>
                  {last ? "Finish the midway ✦" : "Next stall →"}
                </button>
              </div>
            )}
            {buzzId && !called && (
              <p role="status" style={{ marginTop: 14, padding: "12px 15px", borderRadius: 14, background: "rgba(255,90,95,0.12)", border: `1px solid ${C.red}`, fontWeight: 500 }}>
                Not that one. Listen again, what feeling is he trying to force on you? <span style={{ color: C.mauve }}>(No answer given. Read him.)</span>
              </p>
            )}
          </>
        ) : (
          <div style={{ animation: "ctl-rise .3s both", textAlign: "center", padding: "10px 4px" }}>
            <p style={{ fontFamily: DISPLAY, color: C.mint, fontSize: 24, margin: "6px 0 10px" }}>Booth cleared.</p>
            <p style={{ margin: "0 auto", maxWidth: "44ch", fontWeight: 500, lineHeight: 1.6, color: C.cream }}>{payload.doneLine}</p>
            <div style={{ marginTop: 18 }}>
              {reviewReady ? (
                <button className="ctl-next" onClick={() => onEvent({ kind: "COMPLETED", mastery: !wrongOnce })} style={{ fontFamily: BODY, fontWeight: 700, fontSize: 15, color: C.night, background: C.gold, border: 0, borderRadius: 999, padding: "10px 24px", cursor: "pointer" }}>
                  CONTINUE →
                </button>
              ) : (
                <div style={{ display: "inline-flex", flexDirection: "column", gap: 7, minWidth: 220 }} aria-label="review time">
                  <span style={{ fontFamily: BODY, fontSize: 12, fontWeight: 700, letterSpacing: ".08em", color: C.mauve }}>LOOK IT OVER…</span>
                  <span style={{ display: "block", height: 4, borderRadius: 2, background: C.booth2, overflow: "hidden" }}>
                    <span style={{ display: "block", height: "100%", background: C.mint, transformOrigin: "left", transform: "scaleX(0)", animation: `ctl-fill ${reduced ? 400 : 15000}ms linear forwards` }} />
                  </span>
                  <style>{`@keyframes ctl-fill{from{transform:scaleX(0)}to{transform:scaleX(1)}}`}</style>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
