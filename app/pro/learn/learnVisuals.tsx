"use client";

import { useState } from "react";
import { T } from "./tokens";
import type { LearnVisual } from "./types";

/* Interactive and diagram visuals the Learn phase renders inline, so a
 * non-technical learner SEES and DOES each idea while they read it, not
 * just reads about it. Each is self-contained and theme-driven; the
 * manifest only names which one (card.visual = { id }). All are
 * click/step-driven (no autoplay), so they respect reduced motion by
 * default; CSS transitions are disabled under prefers-reduced-motion. */

export default function InlineVisual({ spec }: { spec: LearnVisual }) {
  return (
    <div style={{ background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "16px 18px", margin: "18px 0", maxWidth: "min(100%, 560px)" }}>
      <style>{`@media (prefers-reduced-motion: reduce){ .lv-anim{ transition:none !important; } }`}</style>
      {render(spec)}
    </div>
  );
}

function render(spec: LearnVisual) {
  switch (spec.id) {
    case "hash-oneway": return <HashOneWay />;
    case "avalanche": return <Avalanche />;
    case "cia-breaker": return <CiaBreaker />;
    case "risk-equation": return <RiskEquation />;
    case "control-timeline": return <ControlTimeline />;
    case "defence-layers": return <DefenceLayers />;
    case "mindset-flip": return <MindsetFlip />;
  }
}

/* ---------- shared bits ---------- */

function Try({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: T.cyan, marginBottom: 12 }}>{children}</div>;
}
function Takeaway({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.edge}`, fontSize: 13.5, color: T.muted, lineHeight: 1.5 }}><b style={{ color: T.body }}>The point:</b> {children}</div>;
}
function chipStyle(active: boolean, colour: string): React.CSSProperties {
  return { fontFamily: T.sans, fontSize: 13.5, fontWeight: 700, color: active ? "#06121a" : T.body, background: active ? colour : T.panel, border: `1px solid ${active ? colour : T.edge}`, borderRadius: 9, padding: "9px 13px", cursor: "pointer", textAlign: "left", transition: "background 160ms ease, color 160ms ease, border-color 160ms ease" };
}

/* ---------- 1. CIA breaker (Module 1 t1) ---------- */

const CIA = [
  { k: "C", word: "Confidentiality", note: "kept secret" },
  { k: "I", word: "Integrity", note: "kept correct" },
  { k: "A", word: "Availability", note: "kept reachable" },
];
const CIA_ATTACKS = [
  { label: "Ransomware locks all the files", breaks: ["A"], why: "The files still exist and are unchanged, but nobody can reach them. That is availability." },
  { label: "Customer records are copied out", breaks: ["C"], why: "The data is unchanged and still reachable, but it is no longer secret. That is confidentiality." },
  { label: "A bank transfer amount is altered", breaks: ["I"], why: "Still secret, still reachable, but no longer correct. That is integrity." },
  { label: "The website is knocked offline", breaks: ["A"], why: "Nothing was stolen or changed, but the service cannot be reached. That is availability." },
];

function CiaBreaker() {
  const [sel, setSel] = useState<number | null>(null);
  const broken = sel === null ? [] : CIA_ATTACKS[sel].breaks;
  return (
    <div>
      <Try>Tap an attack</Try>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        {CIA.map((p) => {
          const on = broken.includes(p.k);
          return (
            <div key={p.k} className="lv-anim" style={{ flex: 1, textAlign: "center", borderRadius: 10, padding: "10px 6px", background: on ? T.redSoft : T.panel, border: `1px solid ${on ? T.red : T.edge}`, transition: "background 180ms ease, border-color 180ms ease" }}>
              <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 800, color: on ? T.red : T.ink }}>{p.k}</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: on ? T.red : T.body }}>{p.word}</div>
              <div style={{ fontSize: 10.5, color: T.faint }}>{p.note}</div>
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {CIA_ATTACKS.map((a, i) => (
          <button key={i} onClick={() => setSel(i)} style={chipStyle(sel === i, T.cyan)}>{a.label}</button>
        ))}
      </div>
      {sel !== null && <div style={{ marginTop: 12, fontSize: 14, color: T.body, lineHeight: 1.6 }}>{CIA_ATTACKS[sel].why}</div>}
      <Takeaway>Security protects all three, not just secrets. An attack can break any one of them.</Takeaway>
    </div>
  );
}

/* ---------- 2. Risk equation (Module 1 t2) ---------- */

const THREAT = ["Unlikely", "Possible", "Likely"];
const WEAK = ["Patched", "A small gap", "Wide open"];

function RiskEquation() {
  const [t, setT] = useState(1);
  const [w, setW] = useState(1);
  const score = (t + 1) * (w + 1); // 1..9
  const band = score <= 2 ? { label: "Low", c: T.green } : score <= 4 ? { label: "Medium", c: T.amber } : score <= 6 ? { label: "High", c: "#ff9838" } : { label: "Critical", c: T.red };
  const line = (t === 0 || w === 0)
    ? "With no real threat, or no weakness to exploit, the risk stays low even if the other side is high."
    : "A real threat meeting a real weakness is where risk climbs. Close the weakness and the risk drops.";
  const Row = ({ label, opts, val, set }: { label: string; opts: string[]; val: number; set: (n: number) => void }) => (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 12.5, fontWeight: 700, color: T.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ display: "flex", gap: 7 }}>
        {opts.map((o, i) => <button key={i} onClick={() => set(i)} style={{ ...chipStyle(val === i, T.primary), flex: 1, textAlign: "center", fontSize: 12.5 }}>{o}</button>)}
      </div>
    </div>
  );
  return (
    <div>
      <Try>Dial each one and watch the risk</Try>
      <Row label="How likely is the threat?" opts={THREAT} val={t} set={setT} />
      <Row label="How exposed is the weakness?" opts={WEAK} val={w} set={setW} />
      <div className="lv-anim" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, background: T.panel, border: `1px solid ${band.c}66`, borderRadius: 10, padding: "12px 15px", marginTop: 4, transition: "border-color 200ms ease" }}>
        <span style={{ fontSize: 13, color: T.muted }}>Risk</span>
        <span className="lv-anim" style={{ fontFamily: T.display, fontSize: 20, fontWeight: 800, color: band.c, transition: "color 200ms ease" }}>{band.label}</span>
      </div>
      <div style={{ marginTop: 12, fontSize: 14, color: T.body, lineHeight: 1.6 }}>{line}</div>
      <Takeaway>Risk is threat and weakness together. Remove either one and the risk falls, which is usually the cheapest move.</Takeaway>
    </div>
  );
}

/* ---------- 3. Control timeline (Module 1 t3) ---------- */

const CONTROLS = [
  { type: "Preventive", ex: "Make everyone use a password manager and MFA", when: 0, why: "A preventive control works BEFORE the attack, to stop it starting." },
  { type: "Detective", ex: "Alert on a burst of failed logins", when: 1, why: "A detective control works DURING, to notice the attack while it happens." },
  { type: "Corrective", ex: "Force a password reset and restore from backup", when: 2, why: "A corrective control works AFTER, to limit the damage and recover." },
];
const PHASES = ["Before", "During", "After"];

function ControlTimeline() {
  const [sel, setSel] = useState<number | null>(null);
  const active = sel === null ? null : CONTROLS[sel].when;
  return (
    <div>
      <Try>An attacker is trying your staff's passwords. Tap a control.</Try>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {PHASES.map((p, i) => {
          const on = active === i;
          return (
            <div key={p} className="lv-anim" style={{ flex: 1, textAlign: "center", fontFamily: T.mono, fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: on ? "#06121a" : T.faint, background: on ? T.cyan : T.panel, border: `1px solid ${on ? T.cyan : T.edge}`, borderRadius: 8, padding: "8px 4px", transition: "background 180ms ease, color 180ms ease" }}>{p}</div>
          );
        })}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {CONTROLS.map((c, i) => (
          <button key={i} onClick={() => setSel(i)} style={{ ...chipStyle(sel === i, T.primary) }}>
            <span style={{ fontWeight: 800 }}>{c.type}:</span> {c.ex}
          </button>
        ))}
      </div>
      {sel !== null && <div style={{ marginTop: 12, fontSize: 14, color: T.body, lineHeight: 1.6 }}>{CONTROLS[sel].why}</div>}
      <Takeaway>Strong security does all three: stop it, spot it, and recover from it.</Takeaway>
    </div>
  );
}

/* ---------- 4. Defence in depth (Module 1 t4) ---------- */

const LAYERS = [
  { name: "Firewall", hold: "The firewall blocks the obvious ways in." },
  { name: "Network", hold: "Splitting the network means one foothold is not the whole building." },
  { name: "The device", hold: "A patched, locked-down machine resists the next step." },
  { name: "The login", hold: "MFA on the account stops a stolen password alone." },
  { name: "The data", hold: "Even here, the data is encrypted and access is limited." },
];

function DefenceLayers() {
  const [depth, setDepth] = useState(0); // how many layers the attacker has reached
  const atData = depth >= LAYERS.length;
  return (
    <div>
      <Try>Try to break in, one layer at a time</Try>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {LAYERS.map((l, i) => {
          const passed = i < depth;
          const current = i === depth;
          return (
            <div key={l.name} className="lv-anim" style={{ display: "flex", alignItems: "center", gap: 10, background: passed ? T.redSoft : current ? T.cyanSoft : T.panel, border: `1px solid ${passed ? `${T.red}66` : current ? T.cyan : T.edge}`, borderRadius: 9, padding: "9px 12px", transition: "background 180ms ease, border-color 180ms ease" }}>
              <span aria-hidden style={{ fontSize: 14 }}>{passed ? "✗" : "🛡"}</span>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: passed ? T.muted : T.ink, textDecoration: passed ? "line-through" : "none" }}>{l.name}</span>
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 12, fontSize: 14, color: T.body, lineHeight: 1.6, minHeight: 44 }}>
        {atData ? "Every layer fell, which almost never happens at once. That is the whole point: each one is another chance to stop or catch the attacker." : LAYERS[depth].hold}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={() => setDepth((d) => Math.min(LAYERS.length, d + 1))} disabled={atData} style={{ ...chipStyle(false, T.primary), opacity: atData ? 0.5 : 1, cursor: atData ? "not-allowed" : "pointer", fontWeight: 700 }}>{depth === 0 ? "Attack the first layer" : "Break the next layer"}</button>
        {depth > 0 && <button onClick={() => setDepth(0)} style={{ ...chipStyle(false, T.edge), color: T.faint }}>Reset</button>}
      </div>
      <Takeaway>No single wall is enough. Layered defence means an attacker has to beat all of them, and you have many chances to stop them.</Takeaway>
    </div>
  );
}

/* ---------- 5. Mindset flip (Module 1 t5) ---------- */

const SPOTS = [
  { name: "The login page", attacker: "I'd try common and leaked passwords here, fast, until one works.", defender: "I add MFA and lock the account after a few failed tries." },
  { name: "An old plugin", attacker: "I'd look for a known flaw in out-of-date software to slip through.", defender: "I keep everything patched and remove what we do not use." },
  { name: "The admin page", attacker: "I'd hunt for the admin URL left open to the whole internet.", defender: "I hide it behind a login and limit it to known people." },
];

function MindsetFlip() {
  const [attacker, setAttacker] = useState(true);
  const [sel, setSel] = useState(0);
  return (
    <div>
      <Try>Same shop, two sets of eyes. Flip the view, tap a spot.</Try>
      <div style={{ display: "inline-flex", background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 9, padding: 3, marginBottom: 12 }}>
        {[["Attacker", true], ["Defender", false]].map(([label, isAtk]) => {
          const on = attacker === isAtk;
          const colour = isAtk ? T.red : T.green;
          return (
            <button key={label as string} onClick={() => setAttacker(isAtk as boolean)} className="lv-anim" style={{ fontFamily: T.display, fontWeight: 700, fontSize: 13, color: on ? "#06121a" : T.body, background: on ? colour : "transparent", border: "none", borderRadius: 7, padding: "7px 15px", cursor: "pointer", transition: "background 160ms ease, color 160ms ease" }}>{label as string} view</button>
          );
        })}
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 12 }}>
        {SPOTS.map((s, i) => <button key={i} onClick={() => setSel(i)} style={chipStyle(sel === i, attacker ? T.red : T.green)}>{s.name}</button>)}
      </div>
      <div className="lv-anim" style={{ background: attacker ? T.redSoft : T.greenSoft, border: `1px solid ${(attacker ? T.red : T.green)}55`, borderRadius: 10, padding: "12px 15px", fontSize: 14, color: T.body, lineHeight: 1.6, transition: "background 180ms ease, border-color 180ms ease" }}>
        <span style={{ fontWeight: 800, color: attacker ? T.red : T.green }}>{attacker ? "Attacker: " : "Defender: "}</span>
        {attacker ? SPOTS[sel].attacker : SPOTS[sel].defender}
      </div>
      <Takeaway>The best defenders think like an attacker first, then close the ways in they just imagined.</Takeaway>
    </div>
  );
}

/* ---------- diagrams re-homed (Module 3) ---------- */

function HashOneWay() {
  return (
    <svg viewBox="0 0 480 186" role="img" aria-label="Your password runs one way through a hash function into the value the website stores; there is no way back to the password" style={{ width: "100%", maxWidth: 480, height: "auto" }}>
      <rect x="8" y="26" width="134" height="46" rx="9" fill={T.primarySoft} stroke={T.primary} />
      <text x="75" y="55" fill={T.ink} fontFamily="monospace" fontSize="15" textAnchor="middle">hunter2</text>
      <rect x="173" y="26" width="134" height="46" rx="9" fill={T.panel} stroke={T.edge} />
      <text x="240" y="49" fill={T.body} fontFamily="monospace" fontSize="14" textAnchor="middle">hash( )</text>
      <text x="240" y="64" fill={T.faint} fontFamily="monospace" fontSize="10" textAnchor="middle">one-way</text>
      <rect x="338" y="26" width="134" height="46" rx="9" fill={T.cyanSoft} stroke={T.cyan} />
      <text x="405" y="55" fill={T.ink} fontFamily="monospace" fontSize="15" textAnchor="middle">f52e9a&hellip;</text>
      <path d="M142 49 H171" stroke={T.green} strokeWidth="2.5" markerEnd="url(#fg)" />
      <path d="M307 49 H336" stroke={T.green} strokeWidth="2.5" markerEnd="url(#fg)" />
      <g fontFamily={T.sans} textAnchor="middle" fontSize="11.5">
        <text x="75" y="92" fill={T.muted}>The password</text>
        <text x="75" y="107" fill={T.muted}>you type</text>
        <text x="240" y="92" fill={T.muted}>A one-way</text>
        <text x="240" y="107" fill={T.muted}>scrambler</text>
        <text x="405" y="92" fill={T.muted}>What the website</text>
        <text x="405" y="107" fill={T.muted}>actually stores</text>
      </g>
      <path d="M405 146 H91" stroke={T.red} strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#rd)" />
      <g stroke={T.red} strokeWidth="2.4"><line x1="234" y1="140" x2="246" y2="152" /><line x1="246" y1="140" x2="234" y2="152" /></g>
      <text x="240" y="176" fill={T.red} fontFamily={T.sans} fontSize="12" fontWeight="700" textAnchor="middle">No way back to your password</text>
      <defs>
        <marker id="fg" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill={T.green} /></marker>
        <marker id="rd" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill={T.red} /></marker>
      </defs>
    </svg>
  );
}

function Avalanche() {
  return (
    <svg viewBox="0 0 480 150" role="img" aria-label="Changing one character of the password completely changes the fingerprint it produces" style={{ width: "100%", maxWidth: 480, height: "auto" }}>
      <text x="90" y="16" fill={T.faint} fontFamily={T.mono} fontSize="10" textAnchor="middle">THE PASSWORD</text>
      <text x="336" y="16" fill={T.faint} fontFamily={T.mono} fontSize="10" textAnchor="middle">THE FINGERPRINT IT PRODUCES</text>
      <rect x="20" y="28" width="140" height="36" rx="8" fill={T.primarySoft} stroke={T.primary} />
      <text x="90" y="51" fill={T.ink} fontFamily="monospace" fontSize="15" textAnchor="middle">hunter2</text>
      <path d="M166 46 H196" stroke={T.green} strokeWidth="2.5" markerEnd="url(#av)" />
      <text x="336" y="51" fill={T.body} fontFamily="monospace" fontSize="15" textAnchor="middle">f52e9a1c 4b7d&hellip;</text>
      <rect x="20" y="82" width="140" height="36" rx="8" fill={T.primarySoft} stroke={T.primary} />
      <text x="90" y="105" fontFamily="monospace" fontSize="15" textAnchor="middle"><tspan fill={T.ink}>hunter</tspan><tspan fill={T.amber} fontWeight="700">3</tspan></text>
      <path d="M166 100 H196" stroke={T.green} strokeWidth="2.5" markerEnd="url(#av)" />
      <text x="336" y="105" fill={T.cyan} fontFamily="monospace" fontSize="15" fontWeight="700" textAnchor="middle">9b0c74ef a1c2&hellip;</text>
      <text x="240" y="142" fill={T.muted} fontFamily={T.sans} fontSize="12" textAnchor="middle">Change one character, and the whole fingerprint changes.</text>
      <defs><marker id="av" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0 L6 3 L0 6 Z" fill={T.green} /></marker></defs>
    </svg>
  );
}
