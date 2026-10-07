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
    case "packet-path": return <PacketPath mode={spec.mode ?? "journey"} />;
    case "network-spread": return <NetworkSpread mode={spec.mode ?? "worm"} />;
    case "injection": return <Injection mode={spec.mode ?? "sql"} />;
    case "phishing-redflags": return <PhishingRedflags />;
    case "public-key": return <PublicKey mode={spec.mode ?? "exchange"} />;
    case "timeline-builder": return <TimelineBuilder />;
    case "ports-doors": return <PortsDoors />;
    case "attack-steps": return <AttackSteps />;
    case "alert-funnel": return <AlertFunnel />;
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

/* ---------- 6. Packet path (Module 2, 10) ---------- */

function PacketPath({ mode }: { mode: "journey" | "eavesdrop" | "flood" }) {
  if (mode === "flood") return <PacketFlood />;
  if (mode === "eavesdrop") return <Eavesdrop />;
  return <PacketJourney />;
}

const HOPS = [
  { label: "You", sub: "your device" },
  { label: "Router", sub: "your home" },
  { label: "ISP", sub: "your provider" },
  { label: "Internet", sub: "many hops" },
  { label: "Server", sub: "the website" },
];

function PacketJourney() {
  const [sent, setSent] = useState(false);
  return (
    <div>
      <Try>Send a message and watch it travel</Try>
      <div style={{ position: "relative", margin: "8px 0 2px" }}>
        <div style={{ position: "absolute", left: "8%", right: "8%", top: 13, height: 2, background: T.edge }} />
        <div className="lv-anim" aria-hidden style={{ position: "absolute", top: 7, left: sent ? "92%" : "8%", transform: "translateX(-50%)", width: 14, height: 14, borderRadius: "50%", background: T.cyan, boxShadow: `0 0 10px ${T.cyan}`, transition: "left 1.4s ease" }} />
        <div style={{ display: "flex", justifyContent: "space-between", position: "relative" }}>
          {HOPS.map((h) => (
            <div key={h.label} style={{ textAlign: "center", width: "19%" }}>
              <div style={{ width: 14, height: 14, borderRadius: 4, background: T.panel, border: `1px solid ${T.edge}`, margin: "0 auto 8px" }} />
              <div style={{ fontSize: 12, fontWeight: 700, color: T.ink }}>{h.label}</div>
              <div style={{ fontSize: 10, color: T.faint }}>{h.sub}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginTop: 14, fontSize: 14, color: T.body, lineHeight: 1.6 }}>
        {sent ? "Your message was split into small packets, each hopping node to node until they reached the server and were reassembled. No single wire carried the whole thing." : "Press send. Your request does not travel in one piece down one wire."}
      </div>
      <button onClick={() => setSent((s) => !s)} style={{ ...chipStyle(false, T.primary), marginTop: 10, fontWeight: 700 }}>{sent ? "Send again" : "Send the message"}</button>
      <Takeaway>A message is broken into packets that each find their own way across many machines. That is what makes the internet robust, and what attackers try to listen in on.</Takeaway>
    </div>
  );
}

function Eavesdrop() {
  const [https, setHttps] = useState(false);
  return (
    <div>
      <Try>You are on cafe Wi-Fi. Flip the padlock.</Try>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12.5, color: T.muted }}>
        <span style={{ fontWeight: 700, color: T.ink }}>You</span>
        <span style={{ flex: 1, height: 2, background: T.edge }} />
        <span style={{ fontFamily: T.mono, fontSize: 10.5, color: T.red, border: `1px solid ${T.red}55`, borderRadius: 6, padding: "3px 7px" }}>attacker listening</span>
        <span style={{ flex: 1, height: 2, background: T.edge }} />
        <span style={{ fontWeight: 700, color: T.ink }}>Website</span>
      </div>
      <div style={{ display: "inline-flex", background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 9, padding: 3, marginBottom: 12 }}>
        {[["HTTP", false], ["HTTPS", true]].map(([label, val]) => {
          const on = https === val;
          return <button key={label as string} onClick={() => setHttps(val as boolean)} className="lv-anim" style={{ fontFamily: T.display, fontWeight: 700, fontSize: 13, color: on ? "#06121a" : T.body, background: on ? (val ? T.green : T.red) : "transparent", border: "none", borderRadius: 7, padding: "7px 16px", cursor: "pointer", transition: "background 160ms ease, color 160ms ease" }}>{label as string}</button>;
        })}
      </div>
      <div className="lv-anim" style={{ background: https ? T.greenSoft : T.redSoft, border: `1px solid ${(https ? T.green : T.red)}55`, borderRadius: 10, padding: "12px 15px", transition: "background 180ms ease" }}>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.1em", color: https ? T.green : T.red, marginBottom: 6, textTransform: "uppercase" }}>What the attacker sees</div>
        <div style={{ fontFamily: T.mono, fontSize: 14, color: T.body }}>{https ? "a8 f3 1c 9d 4b e2 … (scrambled)" : "login: you@email.com  password: hunter2"}</div>
      </div>
      <Takeaway>On plain HTTP, anyone on the same Wi-Fi can read what you send. HTTPS (the padlock) scrambles it so they see only noise.</Takeaway>
    </div>
  );
}

function PacketFlood() {
  const [load, setLoad] = useState(1);
  const [filtered, setFiltered] = useState(false);
  const effective = filtered ? Math.min(load, 4) : load;
  const down = effective > 6;
  return (
    <div>
      <Try>Pile on the traffic</Try>
      <div style={{ marginBottom: 8, fontSize: 12.5, color: T.muted }}>Requests hitting the server {filtered && <span style={{ color: T.green }}>(junk filtered first)</span>}</div>
      <div style={{ height: 22, borderRadius: 7, background: T.panel, border: `1px solid ${T.edge}`, overflow: "hidden", position: "relative" }}>
        <div className="lv-anim" style={{ height: "100%", width: `${Math.min(100, effective / 10 * 100)}%`, background: down ? T.red : T.cyan, transition: "width 220ms ease, background 220ms ease" }} />
        <div style={{ position: "absolute", left: "60%", top: 0, bottom: 0, width: 2, background: T.amber }} />
      </div>
      <div style={{ marginTop: 10, fontFamily: T.display, fontWeight: 800, fontSize: 16, color: down ? T.red : T.green }}>{down ? "Server overwhelmed, site is down" : "Server coping"}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        <button onClick={() => setLoad((l) => Math.min(10, l + 2))} style={{ ...chipStyle(false, T.red), fontWeight: 700 }}>Send a flood of traffic</button>
        <button onClick={() => setFiltered((f) => !f)} style={{ ...chipStyle(filtered, T.green), fontWeight: 700 }}>{filtered ? "Filtering on" : "Add filtering"}</button>
        <button onClick={() => { setLoad(1); setFiltered(false); }} style={{ ...chipStyle(false, T.edge), color: T.faint }}>Reset</button>
      </div>
      <Takeaway>A denial-of-service attack floods a service from many machines at once until real users cannot get through. Defences filter the junk before it reaches the server.</Takeaway>
    </div>
  );
}

/* ---------- 7. Network spread (Module 8, 10, 12, 17) ---------- */

function NetworkSpread({ mode }: { mode: "worm" | "lateral" }) {
  const GRID = 9; // 3x3
  const neighbours = (i: number) => {
    const r = Math.floor(i / 3), c = i % 3;
    return [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([rr, cc]) => rr >= 0 && rr < 3 && cc >= 0 && cc < 3).map(([rr, cc]) => rr * 3 + cc);
  };
  const [infected, setInfected] = useState<Set<number>>(new Set([0]));
  const [wall, setWall] = useState(false); // lateral: segmentation isolates the bottom row (6,7,8)
  const step = () => {
    setInfected((prev) => {
      const next = new Set(prev);
      for (const i of prev) for (const n of neighbours(i)) {
        if (wall && ((i < 6) !== (n < 6))) continue; // segmentation blocks crossing into the isolated zone
        next.add(n);
      }
      return next;
    });
  };
  const allHit = infected.size >= GRID;
  return (
    <div>
      <Try>{mode === "lateral" ? "One machine is compromised. Watch it spread, then wall it off." : "One machine is infected. Spread it."}</Try>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 48px)", gap: 8, justifyContent: "center", margin: "6px 0 12px" }}>
        {Array.from({ length: GRID }, (_, i) => {
          const on = infected.has(i);
          const isolated = wall && i >= 6;
          return (
            <div key={i} className="lv-anim" style={{ width: 48, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, background: on ? T.redSoft : isolated ? T.greenSoft : T.panel, border: `1px solid ${on ? T.red : isolated ? `${T.green}66` : T.edge}`, transition: "background 180ms ease, border-color 180ms ease" }}>
              <span aria-hidden>{on ? "🔴" : "💻"}</span>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6, minHeight: 44 }}>
        {allHit ? "Every machine fell. On a flat network, one foothold becomes the whole building." : `${infected.size} of ${GRID} machines hit.${wall ? " The segmented zone (green) is holding." : ""}`}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
        <button onClick={step} disabled={allHit} style={{ ...chipStyle(false, T.red), fontWeight: 700, opacity: allHit ? 0.5 : 1, cursor: allHit ? "not-allowed" : "pointer" }}>Spread one step</button>
        {mode === "lateral" && <button onClick={() => setWall((w) => !w)} style={{ ...chipStyle(wall, T.green), fontWeight: 700 }}>{wall ? "Segmentation on" : "Add segmentation"}</button>}
        <button onClick={() => { setInfected(new Set([0])); }} style={{ ...chipStyle(false, T.edge), color: T.faint }}>Reset</button>
      </div>
      <Takeaway>{mode === "lateral" ? "Flat networks let an attacker roam from one machine to everything. Splitting the network into zones traps them where they land." : "A worm copies itself from machine to machine with no clicks needed. One infection becomes hundreds within minutes."}</Takeaway>
    </div>
  );
}

/* ---------- 8. Injection (Module 9) ---------- */

function Injection({ mode }: { mode: "sql" | "xss" }) {
  const [evil, setEvil] = useState(false);
  const [fixed, setFixed] = useState(false);
  if (mode === "xss") {
    const brokeOut = evil && !fixed;
    return (
      <div>
        <Try>Type a comment on a web page</Try>
        <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
          <button onClick={() => setEvil(false)} style={chipStyle(!evil, T.cyan)}>Great article, thanks!</button>
          <button onClick={() => setEvil(true)} style={chipStyle(evil, T.cyan)}>&lt;script&gt;steal cookies&lt;/script&gt;</button>
        </div>
        <button onClick={() => setFixed((f) => !f)} style={{ ...chipStyle(fixed, T.green), marginBottom: 12, fontWeight: 700 }}>{fixed ? "Fix on: treat input as text" : "Apply the fix"}</button>
        <div className="lv-anim" style={{ background: brokeOut ? T.redSoft : T.greenSoft, border: `1px solid ${(brokeOut ? T.red : T.green)}55`, borderRadius: 10, padding: "12px 15px", fontSize: 14, color: T.body, lineHeight: 1.6, transition: "background 180ms ease" }}>
          {brokeOut ? "The page RAN your script as code. It could steal every visitor's login. That is cross-site scripting." : evil ? "With the fix, your script is shown as plain text on the page. It does nothing." : "A normal comment just shows as text, as expected."}
        </div>
        <Takeaway>The bug is the page treating what a visitor typed as code to run. The fix is always treating it as plain data to display.</Takeaway>
      </div>
    );
  }
  const brokeOut = evil && !fixed;
  const input = evil ? "' OR '1'='1" : "alice";
  return (
    <div>
      <Try>Pick what gets typed into the login box</Try>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
        <button onClick={() => setEvil(false)} style={chipStyle(!evil, T.cyan)}>alice (a normal name)</button>
        <button onClick={() => setEvil(true)} style={chipStyle(evil, T.cyan)}>&apos; OR &apos;1&apos;=&apos;1 (an attacker&apos;s trick)</button>
      </div>
      <button onClick={() => setFixed((f) => !f)} style={{ ...chipStyle(fixed, T.green), marginBottom: 12, fontWeight: 700 }}>{fixed ? "Fix on: input is kept as data" : "Apply the fix (parameterised query)"}</button>
      <div style={{ background: "rgba(4,6,14,0.7)", border: `1px solid ${T.edge}`, borderRadius: 10, padding: "11px 13px", fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.7, marginBottom: 10 }}>
        <span style={{ color: T.muted }}>SELECT * FROM users WHERE name = &apos;</span>
        <span style={{ color: brokeOut ? T.red : T.cyan, fontWeight: 700 }}>{input}</span>
        <span style={{ color: T.muted }}>&apos;</span>
      </div>
      <div className="lv-anim" style={{ background: brokeOut ? T.redSoft : T.greenSoft, border: `1px solid ${(brokeOut ? T.red : T.green)}55`, borderRadius: 10, padding: "12px 15px", fontSize: 14, color: T.body, lineHeight: 1.6, transition: "background 180ms ease" }}>
        {brokeOut ? "The trick broke out of the quotes and became part of the command. The query now returns EVERY user. That is SQL injection." : evil ? "With the fix, the whole trick is treated as one harmless name to look up. It matches nobody. The attack is dead." : "The query looks up one user, alice, exactly as intended."}
      </div>
      <Takeaway>Injection happens when input is pasted straight into a command. The fix keeps input as data the command can never be confused by.</Takeaway>
    </div>
  );
}

/* ---------- 9. Phishing red flags (Module 7) ---------- */

const FLAGS = [
  { key: "sender", why: "The display name says 'IT Support' but the real address is a random free-mail account. Always check the actual address, not the name." },
  { key: "link", why: "The link text says the real company, but it actually points to a lookalike domain (paypaI-secure.com, with a capital I). Hover before you click." },
  { key: "urgency", why: "Threats and deadlines ('within 24 hours or your account is closed') are designed to make you act before you think." },
  { key: "attach", why: "An unexpected attachment, especially one asking you to 'enable content', is a classic way to deliver malware." },
];

function PhishingRedflags() {
  const [found, setFound] = useState<Set<string>>(new Set());
  const [last, setLast] = useState<string | null>(null);
  const hit = (k: string) => { setFound((f) => new Set(f).add(k)); setLast(k); };
  const spot = (k: string): React.CSSProperties => ({ cursor: "pointer", borderRadius: 4, padding: "0 3px", background: found.has(k) ? T.amberSoft : "transparent", boxShadow: found.has(k) ? `inset 0 0 0 1px ${T.amber}88` : `inset 0 0 0 1px ${T.edge}`, transition: "background 160ms ease" });
  return (
    <div>
      <Try>Tap the parts that give this email away ({found.size} of {FLAGS.length})</Try>
      <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, padding: "14px 16px", fontSize: 13.5, lineHeight: 1.9, color: T.body }}>
        <div>From: <button onClick={() => hit("sender")} style={{ ...spot("sender"), border: "none", font: "inherit", color: "inherit" }}>IT Support &lt;helpdesk@secure-mail-447.com&gt;</button></div>
        <div style={{ margin: "6px 0", height: 1, background: T.edge }} />
        <div><button onClick={() => hit("urgency")} style={{ ...spot("urgency"), border: "none", font: "inherit", color: "inherit" }}>URGENT: your account will be closed in 24 hours.</button></div>
        <div style={{ marginTop: 6 }}>Please confirm your password at <button onClick={() => hit("link")} style={{ ...spot("link"), border: "none", font: "inherit", color: T.cyan }}>company-portal.com</button>.</div>
        <div style={{ marginTop: 6 }}>See the attached <button onClick={() => hit("attach")} style={{ ...spot("attach"), border: "none", font: "inherit", color: "inherit" }}>invoice.html</button> for details.</div>
      </div>
      {last && <div style={{ marginTop: 12, fontSize: 14, color: T.body, lineHeight: 1.6 }}>{FLAGS.find((f) => f.key === last)!.why}</div>}
      {found.size === FLAGS.length && <div style={{ marginTop: 10, fontSize: 13.5, fontWeight: 700, color: T.green }}>You found all four. You would not have fallen for this one.</div>}
      <Takeaway>The tells are in the details: who really sent it, where the link really goes, the pressure to act fast, and the unexpected attachment.</Takeaway>
    </div>
  );
}

/* ---------- 10. Public key (Module 4) ---------- */

function PublicKey({ mode }: { mode: "exchange" | "sign" }) {
  const [step, setStep] = useState(0); // 0 start, 1 locked/signed, 2 opened/verified
  const [tampered, setTampered] = useState(false);
  if (mode === "sign") {
    return (
      <div>
        <Try>Prove a message is really from you, and unchanged</Try>
        <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, padding: "12px 15px", marginBottom: 12, fontSize: 14, color: T.body }}>
          Message: &ldquo;Pay the invoice.&rdquo;{tampered && <span style={{ color: T.red }}> (someone changed it to &ldquo;Pay me instead.&rdquo;)</span>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
          <button onClick={() => setStep(1)} style={{ ...chipStyle(step >= 1, T.primary), fontWeight: 700 }}>1. Sign with my PRIVATE key</button>
          <button onClick={() => setStep(2)} disabled={step < 1} style={{ ...chipStyle(step >= 2, T.cyan), fontWeight: 700, opacity: step < 1 ? 0.5 : 1 }}>2. Anyone verifies with my PUBLIC key</button>
          <button onClick={() => setTampered((t) => !t)} style={{ ...chipStyle(tampered, T.red) }}>{tampered ? "Tampering on" : "Tamper with it"}</button>
        </div>
        {step >= 2 && (
          <div className="lv-anim" style={{ background: tampered ? T.redSoft : T.greenSoft, border: `1px solid ${(tampered ? T.red : T.green)}55`, borderRadius: 10, padding: "12px 15px", fontSize: 14, color: T.body, lineHeight: 1.6 }}>
            {tampered ? "Verification FAILS. The signature no longer matches the changed message, so you know it was altered." : "Verification passes. The signature matches, proving it was you and that nothing changed."}
          </div>
        )}
        <Takeaway>Signing with your private key proves it was you and that the message is unchanged. Anyone can check it with your public key, but nobody can forge it.</Takeaway>
      </div>
    );
  }
  const wrongKey = false;
  return (
    <div>
      <Try>Send a secret to someone you have never met</Try>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        <button onClick={() => setStep(1)} style={{ ...chipStyle(step >= 1, T.primary), fontWeight: 700 }}>1. Lock it with their PUBLIC key</button>
        <button onClick={() => setStep(2)} disabled={step < 1} style={{ ...chipStyle(step >= 2, T.green), fontWeight: 700, opacity: step < 1 ? 0.5 : 1 }}>2. They open it with their PRIVATE key</button>
        <button onClick={() => setStep(0)} style={{ ...chipStyle(false, T.edge), color: T.faint }}>Reset</button>
      </div>
      <div className="lv-anim" style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, padding: "14px 16px", fontFamily: T.mono, fontSize: 14, color: step === 1 ? T.amber : T.body, textAlign: "center", transition: "color 180ms ease" }}>
        {step === 0 ? "“Meet me at noon”" : step === 1 ? "7f a2 9c 1d 4e … (locked, unreadable to anyone listening)" : "“Meet me at noon” (opened)"}
      </div>
      {step >= 1 && !wrongKey && <div style={{ marginTop: 12, fontSize: 14, color: T.body, lineHeight: 1.6 }}>{step === 1 ? "Locked with their PUBLIC key, which everyone can know. Now only their matching PRIVATE key can open it, not even you can." : "Their PRIVATE key, which only they hold, opens it. The secret crossed the open internet safely."}</div>}
      <Takeaway>The two keys are a pair: what one locks, only the other opens. You can share your public key with the world, which is how total strangers exchange secrets safely.</Takeaway>
    </div>
  );
}

/* ---------- 11. Timeline builder (Module 14, 16) ---------- */

const STORY = [
  { t: "Failed logins from a new country", note: "the attacker is guessing passwords" },
  { t: "One successful admin login", note: "a guess worked" },
  { t: "A new hidden user is created", note: "they make a way back in" },
  { t: "A large upload out at 3am", note: "the data leaves" },
];

function TimelineBuilder() {
  const [order, setOrder] = useState<number[]>([2, 0, 3, 1]); // shuffled
  const [checked, setChecked] = useState(false);
  const correct = order.every((v, i) => v === i);
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    setChecked(false);
    setOrder((o) => { const c = [...o]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  };
  return (
    <div>
      <Try>These log lines are out of order. Put them into the story.</Try>
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {order.map((idx, i) => (
          <div key={idx} className="lv-anim" style={{ display: "flex", alignItems: "center", gap: 10, background: checked ? (order[i] === i ? T.greenSoft : T.redSoft) : T.panel, border: `1px solid ${checked ? (order[i] === i ? T.green : T.red) + "66" : T.edge}`, borderRadius: 9, padding: "9px 12px", transition: "background 160ms ease" }}>
            <span className="mono" style={{ color: T.faint, fontSize: 12, width: 18, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ flex: 1, fontSize: 13.5, color: T.body }}>{STORY[idx].t}</span>
            <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <button onClick={() => move(i, -1)} aria-label="move up" style={{ background: "transparent", border: "none", color: T.faint, cursor: "pointer", fontSize: 11, lineHeight: 1 }}>&#9650;</button>
              <button onClick={() => move(i, 1)} aria-label="move down" style={{ background: "transparent", border: "none", color: T.faint, cursor: "pointer", fontSize: 11, lineHeight: 1 }}>&#9660;</button>
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center" }}>
        <button onClick={() => setChecked(true)} style={{ ...chipStyle(false, T.primary), fontWeight: 700 }}>Check the story</button>
        {checked && correct && <span style={{ fontSize: 13.5, fontWeight: 700, color: T.green }}>That is the attack, start to finish.</span>}
        {checked && !correct && <span style={{ fontSize: 13.5, color: T.muted }}>Not quite. Guessing comes before the break-in.</span>}
      </div>
      {checked && correct && <div style={{ marginTop: 10, fontSize: 13.5, color: T.body, lineHeight: 1.6 }}>Scattered log lines mean nothing alone. In order, they tell the whole story: guess, get in, dig in, steal.</div>}
      <Takeaway>Correlation is the analyst's craft: joining separate events into one timeline that reveals what actually happened.</Takeaway>
    </div>
  );
}

/* ---------- 12. Ports and doors / attack surface (Module 2, 8, 12) ---------- */

const DOORS = [
  { name: "HTTPS (443)", need: true, risk: false },
  { name: "SSH (22)", need: true, risk: false },
  { name: "Remote Desktop (3389)", need: false, risk: true },
  { name: "Old file sharing (FTP)", need: false, risk: true },
  { name: "Telnet (23)", need: false, risk: true },
];

function PortsDoors() {
  const [open, setOpen] = useState<boolean[]>([true, true, true, true, true]);
  const openRisky = open.filter((o, i) => o && DOORS[i].risk).length;
  const surface = open.filter(Boolean).length;
  return (
    <div>
      <Try>Close the doors you do not need</Try>
      <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 12 }}>
        {DOORS.map((d, i) => {
          const isOpen = open[i];
          const risky = d.risk && isOpen;
          return (
            <button key={d.name} onClick={() => setOpen((o) => o.map((v, j) => j === i ? !v : v))} className="lv-anim"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, textAlign: "left", background: risky ? T.redSoft : isOpen ? T.panel : T.bgRaise, border: `1px solid ${risky ? T.red : isOpen ? T.edge : T.green + "55"}`, borderRadius: 9, padding: "10px 13px", cursor: "pointer", transition: "background 160ms ease, border-color 160ms ease" }}>
              <span style={{ fontSize: 13.5, fontWeight: 700, color: isOpen ? T.ink : T.muted }}>{d.name} {!d.need && <span className="mono" style={{ fontSize: 10, color: T.faint }}>(rarely needed)</span>}</span>
              <span className="mono" style={{ fontSize: 11, fontWeight: 700, color: isOpen ? (risky ? T.red : T.cyan) : T.green }}>{isOpen ? "OPEN" : "closed"}</span>
            </button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 16, fontSize: 13.5 }}>
        <span style={{ color: T.muted }}>Doors open: <b style={{ color: T.ink }}>{surface}</b></span>
        <span style={{ color: openRisky ? T.red : T.green, fontWeight: 700 }}>{openRisky ? `${openRisky} risky door${openRisky > 1 ? "s" : ""} exposed` : "No risky doors open"}</span>
      </div>
      <Takeaway>Every open door is a possible way in. Turning off services you do not use shrinks the attack surface, the cheapest security win there is.</Takeaway>
    </div>
  );
}

/* ---------- 13. Attack steps / kill chain (Module 6, 15) ---------- */

const CHAIN = [
  { stage: "Recon", attacker: "Scours public sources for names, emails and weak spots.", defender: "Limit what you publish; train staff on what attackers look for." },
  { stage: "Intrude", attacker: "Phishes a password or exploits an unpatched flaw to get in.", defender: "MFA and patching stop most intrusions dead." },
  { stage: "Expand", attacker: "Moves from the first machine toward the valuable systems.", defender: "Segmented networks and least privilege trap them." },
  { stage: "Act", attacker: "Steals or encrypts the data, the actual goal.", defender: "Backups, encryption and alerts limit the damage." },
];

function AttackSteps() {
  const [step, setStep] = useState(0);
  const [broken, setBroken] = useState<number | null>(null);
  const c = CHAIN[step];
  return (
    <div>
      <Try>Walk the attack. Break the chain whenever you can.</Try>
      <div style={{ display: "flex", gap: 4, marginBottom: 12 }}>
        {CHAIN.map((s, i) => (
          <div key={s.stage} className="lv-anim" style={{ flex: 1, textAlign: "center", fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: broken !== null && i >= broken ? T.faint : i <= step ? "#06121a" : T.faint, background: broken !== null && i === broken ? T.greenSoft : i <= step && (broken === null || i < broken) ? T.red : T.panel, border: `1px solid ${broken === i ? T.green : i <= step && (broken === null || i < broken) ? T.red : T.edge}`, borderRadius: 7, padding: "7px 3px", transition: "background 180ms ease" }}>{s.stage}</div>
        ))}
      </div>
      {broken !== null ? (
        <div className="lv-anim" style={{ background: T.greenSoft, border: `1px solid ${T.green}55`, borderRadius: 10, padding: "12px 15px", fontSize: 14, color: T.body, lineHeight: 1.6 }}>
          You broke the chain at <b style={{ color: T.green }}>{CHAIN[broken].stage}</b>. {CHAIN[broken].defender} The attack never reached its goal.
        </div>
      ) : (
        <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, padding: "12px 15px" }}>
          <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6, marginBottom: 6 }}><b style={{ color: T.red }}>Attacker:</b> {c.attacker}</div>
          <div style={{ fontSize: 13.5, color: T.muted, lineHeight: 1.6 }}><b style={{ color: T.cyan }}>Your move:</b> {c.defender}</div>
        </div>
      )}
      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
        {broken === null && <button onClick={() => setBroken(step)} style={{ ...chipStyle(false, T.green), fontWeight: 700 }}>Break the chain here</button>}
        {broken === null && step < CHAIN.length - 1 && <button onClick={() => setStep((s) => s + 1)} style={{ ...chipStyle(false, T.red), fontWeight: 700 }}>Let it continue</button>}
        {(broken !== null || step > 0) && <button onClick={() => { setStep(0); setBroken(null); }} style={{ ...chipStyle(false, T.edge), color: T.faint }}>Reset</button>}
      </div>
      <Takeaway>An attack is a chain of steps. You do not have to be perfect, you just have to break any one link before the final one.</Takeaway>
    </div>
  );
}

/* ---------- 14. Alert funnel (Module 13, 15) ---------- */

function AlertFunnel() {
  const [tuned, setTuned] = useState(false);
  const alerts = tuned ? 40 : 600;
  const rows = [
    { label: "Events logged today", n: "2,000,000", c: T.faint },
    { label: "Turned into alerts", n: tuned ? "40" : "600", c: tuned ? T.green : T.amber },
    { label: "Real incidents", n: "3", c: T.red },
  ];
  return (
    <div>
      <Try>A SOC is drowning. Tune the rules.</Try>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, marginBottom: 12 }}>
        {rows.map((r, i) => (
          <div key={r.label} className="lv-anim" style={{ width: `${100 - i * 26}%`, background: T.panel, border: `1px solid ${r.c}55`, borderRadius: 9, padding: "9px 13px", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "width 200ms ease" }}>
            <span style={{ fontSize: 12.5, color: T.muted }}>{r.label}</span>
            <span className="mono lv-anim" style={{ fontSize: 15, fontWeight: 700, color: r.c, transition: "color 200ms ease" }}>{r.n}</span>
          </div>
        ))}
      </div>
      <div style={{ fontSize: 14, color: T.body, lineHeight: 1.6, marginBottom: 10 }}>
        {tuned ? "With tuned rules, the analyst sees 40 alerts instead of 600, and can actually get to the 3 that matter." : "600 alerts a day is more than an analyst can read. The 3 real incidents are buried in the noise."}
      </div>
      <button onClick={() => setTuned((t) => !t)} style={{ ...chipStyle(tuned, T.green), fontWeight: 700 }}>{tuned ? "Rules tuned" : "Tune the detection rules"}</button>
      <Takeaway>Detection is not about catching everything, it is about cutting the noise so the few alerts that matter are not missed.</Takeaway>
    </div>
  );
}
