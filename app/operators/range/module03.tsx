"use client";

/* Module 3 - The Web Surface (DEPTH STANDARD, built to the Module 5 framework).
 *
 * The foundation the web-exploit modules build on: HTTP is just requests and
 * responses, the client controls every byte it sends, and the server must never
 * trust it. Everything runs against a small in-browser model (pure client JS,
 * zero egress): read a response and find what the dev leaked, discover a hidden
 * endpoint from robots.txt, tamper a price the server trusts, then forge a role
 * header. Shape mirrors M5: hover glossary, interactive lesson lab, de-biased
 * check, a FOUR-stage capture with a hint ladder, FOUR drills, and a capstone. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "HTTP", definition: "The language browsers and servers talk in. Every web action is an HTTP request going out and a response coming back.", example: "Every time you tap a video, your browser sends an HTTP request saying 'give me this clip' and the server sends a response with the video back - like ordering at a counter and getting your food." },
  { term: "request", definition: "The message your browser sends to a server: a method, a path, some headers, and often a body of data.", example: "Tapping 'add to basket' fires off a request: the method (POST), the path (/basket), a cookie header, and a body saying 'item 55, quantity 1'." },
  { term: "response", definition: "What the server sends back: a status code, headers, and usually a body (the page or data).", example: "Ask for a page that doesn't exist and the response comes back with status 404 and a 'not found' message instead of the page you wanted." },
  { term: "method", definition: "The kind of request: GET to fetch something, POST to send something, and a few others.", example: "GET is 'show me my messages'; POST is 'send this message' - same app, different method depending on whether you're reading or changing something." },
  { term: "header", definition: "A line of extra info attached to a request or response - things like the content type, cookies, or server version.", example: "The Cookie header is how your browser proves it's still you on every request, so you don't retype your password on each page - like showing a wristband at a festival." },
  { term: "status code", definition: "A number the response leads with: 200 means OK, 404 not found, 403 forbidden, 500 server error.", example: "You've met 404 as 'page not found'; a tester gets excited by a 200 on a page that was meant to be 403 forbidden, because it means a locked door just opened." },
  { term: "cookie", definition: "A small piece of data the server asks your browser to store and send back on every request - often your session.", example: "After you log into a game site, it drops a cookie in your browser; every later request carries it back so the site remembers you're signed in." },
  { term: "endpoint", definition: "A single address the app answers on, like /api/order or /admin.", example: "The app shows one tidy page, but behind it /api/order and /admin are separate endpoints you can call directly - including ones no button links to." },
  { term: "parameter", definition: "A value you send with a request - a price, a quantity, an id. The server reads it to decide what to do.", example: "A checkout request might carry price=4999; that parameter is just a value in the message, and if the server trusts it you could try sending price=1 instead." },
  { term: "hidden field", definition: "A form value that isn't drawn on screen. 'Hidden' means not shown - not secret, and not protected; it's ordinary data in the request.", example: "View the source of an order form and you find a hidden input holding price=50 - not drawn on screen, but sitting right there in the request for anyone to change." },
  { term: "developer tools", definition: "The panel built into every browser that lets you watch, read and change the requests your browser sends.", example: "Press F12 in any browser and the Network tab shows every request your last tap just sent - testers live in that panel to watch and edit what goes out." },
  { term: "proxy", definition: "A tool that sits between your browser and the server so you can pause and edit a request before it's sent.", example: "A proxy catches your 'buy for £50' request mid-flight and lets you change it to '£5' before it ever reaches the server - like intercepting a letter to edit it before posting." },
  { term: "robots.txt", definition: "A file sites publish to tell search engines which paths to skip. Attackers read it precisely to find those paths.", example: "A site's robots.txt says 'Disallow: /admin-backup' to hide that page from Google - but a tester reads that exact file first, because it's a signposted list of what they most wanted hidden." },
  { term: "parameter tampering", definition: "Editing a value in the request (a price, a role, a flag) that the server trusts when it shouldn't.", example: "An order sends role=user in the request; you change it to role=admin and hit send, betting the server just believes whatever value you tell it." },
  { term: "client-side", definition: "Happening in the browser, on the user's machine - where the user can see and change everything.", example: "A 'you must be 18' check written into the page runs client-side, so you can switch it off in your own browser - anything on your machine is yours to change." },
  { term: "server-side", definition: "Happening on the server, out of the user's reach - the only place a security decision can be trusted.", example: "The real price should be worked out server-side, on the shop's own computer you can't reach, so editing the number in your browser does nothing." },
  { term: "attack surface", definition: "Everything an attacker could reach or poke at - every endpoint, field, header and file the app exposes.", example: "The app's attack surface is every endpoint, form field, header and file it exposes - every one of those is a door a tester will try the handle on." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

const inp: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 };
const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, margin: "0 0 5px", letterSpacing: ".08em" };
function dot(c: string): React.CSSProperties { return { width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }; }

function WinBar({ host }: { host: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
      <i style={dot(C.red)} /><i style={dot(C.amber)} /><i style={dot(C.green)} />
      <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6 }}>{host}</span>
    </div>
  );
}

function Hints({ hints, revealLabel, onReveal }: { hints: string[]; revealLabel?: string; onReveal?: () => void }) {
  const [shown, setShown] = useState(0);
  return (
    <div style={{ marginTop: 12 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <div key={i} style={{ marginBottom: 6, padding: "9px 12px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13, color: C.soft, lineHeight: 1.5 }}>{hints[i]}</div>
      ))}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        {shown < hints.length && <button onClick={() => setShown(shown + 1)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{shown === 0 ? "hint" : "another hint"}</button>}
        {shown >= hints.length && revealLabel && onReveal && <button onClick={onReveal} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{revealLabel}</button>}
      </div>
    </div>
  );
}

/* ───────────────────────── the request console (reused for stages 2-4) ───────────────────────── */

type Resp = { status: number; title: string; lines: string[]; sensitive?: boolean };
type ReqStep = {
  title: string; goal: string;
  method: "GET" | "POST";
  pathTemplate: string;
  fieldLabelOverride?: string;
  fields: { key: string; label: string; value: string }[];
  palette?: string[];
  respond: (f: Record<string, string>) => Resp;
  win: (f: Record<string, string>) => boolean;
  hint: string;
  reveal: Record<string, string>;
};

function ReqSurface({ host, step, onSolved }: { host: string; step: ReqStep; onSolved: () => void }) {
  const [fields, setFields] = useState<Record<string, string>>(() => Object.fromEntries(step.fields.map((f) => [f.key, f.value])));
  const [resp, setResp] = useState<Resp | null>(null);
  const [solved, setSolved] = useState(false);
  const firstKey = step.fields[0]?.key;
  const pathDisplay = step.pathTemplate.replace(/\{(\w+)\}/g, (_, k) => fields[k] ?? "");
  function send() { const r = step.respond(fields); setResp(r); if (step.win(fields)) { setSolved(true); onSolved(); } }
  function set(k: string, v: string) { setFields((f) => ({ ...f, [k]: v })); }
  const ok = resp && resp.status >= 200 && resp.status < 300;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <WinBar host={host} />
      <div style={{ padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 13, color: "#8fa0c8", marginBottom: 12, wordBreak: "break-all" }}>
          <span style={{ color: step.method === "POST" ? C.amber : C.cyan }}>{step.method}</span> {pathDisplay}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          {step.fields.map((f) => (
            <div key={f.key}>
              <label style={lab}>{f.label}</label>
              <input style={{ ...inp, color: C.amber }} value={fields[f.key]} onChange={(e) => set(f.key, e.target.value)} />
            </div>
          ))}
        </div>
        {step.palette && firstKey && (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.mute, marginBottom: 7 }}>TRY · tap to set {step.fields[0].label}</div>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {step.palette.map((t) => <button key={t} onClick={() => set(firstKey, t)} className="co-opt" style={{ padding: "5px 9px", borderRadius: 7, border: `1px solid ${C.line}`, background: C.carbon, color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{t}</button>)}
            </div>
          </div>
        )}
        <div style={{ marginTop: 14 }}><Btn tone="i" onClick={send} disabled={solved}>SEND REQUEST →</Btn></div>
        {resp && (
          <div style={{ marginTop: 14, background: C.carbon, border: `1px solid ${resp.sensitive ? C.red : ok ? C.green : C.lineSoft}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: ok ? C.green : C.red, marginBottom: 7 }}>HTTP {resp.status} · {resp.title}</div>
            {resp.lines.map((l, i) => <div key={i} style={{ fontFamily: MONO, fontSize: 12.5, color: resp.sensitive ? C.amber : C.soft, lineHeight: 1.6 }}>{l}</div>)}
          </div>
        )}
        <Hints hints={[step.hint]} revealLabel="stuck? reveal" onReveal={() => setFields((f) => ({ ...f, ...step.reveal }))} />
      </div>
    </div>
  );
}

/* ───────────────────────── inspect surface (stage 1: read a response) ───────────────────────── */

type InspectStep = {
  title: string; goal: string; host: string;
  method: string; path: string;
  responseLines: { t: string; leak?: boolean }[];
  answerLabel: string; accept: (v: string) => boolean;
  hint: string; reveal: string;
};

function InspectSurface({ step, onSolved }: { step: InspectStep; onSolved: () => void }) {
  const [sent, setSent] = useState(false);
  const [answer, setAnswer] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [solved, setSolved] = useState(false);
  function check() {
    if (step.accept(answer)) { setSolved(true); setMsg({ ok: true, text: "✓ That's it - the dev left it right there in the response." }); onSolved(); }
    else setMsg({ ok: false, text: "Not quite. Read the response above carefully - the clue is in it." });
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <WinBar host={step.host} />
      <div style={{ padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 13, color: "#8fa0c8", marginBottom: 12 }}><span style={{ color: C.cyan }}>{step.method}</span> {step.path}</div>
        {!sent ? (
          <Btn tone="i" onClick={() => setSent(true)}>SEND REQUEST →</Btn>
        ) : (
          <div style={{ background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 10, padding: "12px 14px" }}>
            {step.responseLines.map((l, i) => <div key={i} style={{ fontFamily: MONO, fontSize: 12, color: l.leak ? C.amber : "#8fa0c8", background: l.leak ? "rgba(232,163,61,.08)" : "transparent", borderRadius: 3, padding: l.leak ? "1px 4px" : 0, lineHeight: 1.6, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{l.t || " "}</div>)}
          </div>
        )}
        {sent && (
          <div style={{ marginTop: 14 }}>
            <label style={lab}>{step.answerLabel}</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input style={{ ...inp, flex: "1 1 220px", color: C.amber }} value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="read it from the response" />
              <Btn tone="g" onClick={check} disabled={solved}>CHECK →</Btn>
            </div>
            {msg && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: msg.ok ? C.green : C.soft }}>{msg.text}</div>}
            <Hints hints={[step.hint]} revealLabel="stuck? reveal" onReveal={() => setAnswer(step.reveal)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* a stage is either an inspect step or a request step */
type Stage = { kind: "inspect"; step: InspectStep } | { kind: "req"; host: string; step: ReqStep };

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  const goal = stage.kind === "inspect" ? stage.step.goal : stage.step.goal;
  const keyp = stage.kind === "inspect" ? stage.step.title : stage.step.title;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(goal, `stage-${keyp}`)}</div>
      {stage.kind === "inspect" ? <InspectSurface step={stage.step} onSolved={onSolved} /> : <ReqSurface host={stage.host} step={stage.step} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Caldera parts store) ───────────────────────── */

const HOST = "shop.calderafreight.range";
const LIST = 149;

const ACT_STAGES: Stage[] = [
  {
    kind: "inspect", step: {
      title: "Inspect", goal: "Stage 1 - Inspect the response. Every response carries more than the page. Send a request to the home page and read what the dev left behind in it.",
      host: HOST, method: "GET", path: "/",
      responseLines: [
        { t: "HTTP/1.1 200 OK" },
        { t: "Server: nginx/1.24 (Caldera build 7)" },
        { t: "Set-Cookie: session=abc123; Path=/" },
        { t: "Content-Type: text/html" },
        { t: "" },
        { t: "<html><body>" },
        { t: "  <h1>Caldera Parts Store</h1>" },
        { t: "  <!-- TODO: remove before launch - staff checkout at /depot-admin -->", leak: true },
        { t: "</body></html>" },
      ],
      answerLabel: "the hidden endpoint the dev left in a comment",
      accept: (v) => v.trim().toLowerCase().includes("/depot-admin"),
      hint: "Developers leave notes in HTML comments (the <!-- ... --> line). Read it - it names a staff path.",
      reveal: "/depot-admin",
    },
  },
  {
    kind: "req", host: HOST, step: {
      title: "Discover", goal: "Stage 2 - Map the surface. Sites publish a robots.txt to tell search engines what to skip - which is exactly where the interesting paths hide. Read it, then reach the staff area it names.",
      method: "GET", pathTemplate: "{path}", fields: [{ key: "path", label: "path", value: "/" }], palette: ["/robots.txt", "/depot-admin"],
      respond: (f) => { const p = String(f.path).trim(); if (p === "/robots.txt") return { status: 200, title: "robots.txt", lines: ["User-agent: *", "Disallow: /depot-admin", "Disallow: /internal"], sensitive: true }; if (p.startsWith("/depot-admin")) return { status: 200, title: "staff checkout (no link anywhere, still open)", lines: ["Depot staff tools", "bulk order · price overrides"], sensitive: true }; return { status: 200, title: "home", lines: ["Caldera Parts Store"] }; },
      win: (f) => String(f.path).trim().startsWith("/depot-admin"),
      hint: "First GET /robots.txt and read the Disallow lines. Then browse to the path it told you to avoid: /depot-admin.",
      reveal: { path: "/depot-admin" },
    },
  },
  {
    kind: "req", host: HOST, step: {
      title: "Tamper price", goal: "Stage 3 - Never trust the client. The checkout sends the PRICE from the browser. Edit it before it goes and buy a GBP 149 unit for whatever you like.",
      method: "POST", pathTemplate: "/api/order", fields: [{ key: "unitPrice", label: "unitPrice (GBP)", value: "149.00" }], palette: ["0.00", "1.00"],
      respond: (f) => { const n = Number(f.unitPrice); if (!Number.isFinite(n)) return { status: 400, title: "bad request", lines: ["unitPrice must be a number"] }; if (n < LIST) return { status: 200, title: "order confirmed (server trusted your price!)", lines: [`Fleet GPS unit x1 = GBP ${n.toFixed(2)}`, "the server never re-checked the real price"], sensitive: true }; return { status: 200, title: "order confirmed", lines: [`Fleet GPS unit x1 = GBP ${n.toFixed(2)} (the real price)`] }; },
      win: (f) => { const n = Number(f.unitPrice); return Number.isFinite(n) && n < LIST; },
      hint: "Change unitPrice to something lower - 0.00 works - and send. If it still confirms, the server trusted the client.",
      reveal: { unitPrice: "0.00" },
    },
  },
  {
    kind: "req", host: HOST, step: {
      title: "Forge a header", goal: "Stage 4 - The client controls headers too. The staff tools decide your access from an X-Role header your own browser sends. Change it and open the admin tools.",
      method: "GET", pathTemplate: "/depot-admin/tools", fields: [{ key: "role", label: "X-Role (header)", value: "driver" }], palette: ["admin", "manager"],
      respond: (f) => { const r = String(f.role).trim().toLowerCase(); if (r === "admin" || r === "manager") return { status: 200, title: "admin tools (role trusted from a header!)", lines: [`X-Role: ${r} accepted`, "price-override console unlocked:", "flag{the_cl1ent_c0ntr0ls_the_r3quest}"], sensitive: true }; return { status: 403, title: "forbidden", lines: ["drivers can't open the admin tools"] }; },
      win: (f) => { const r = String(f.role).trim().toLowerCase(); return r === "admin" || r === "manager"; },
      hint: "The header is just data your browser sends. Set X-Role to admin and send.",
      reveal: { role: "admin" },
    },
  },
];

function WebSurfaceAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STAGES.map(() => false));
  const stage = ACT_STAGES[si];
  const titles = ACT_STAGES.map((s) => s.kind === "inspect" ? s.step.title : s.step.title);
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { if (si + 1 < ACT_STAGES.length) setSi(si + 1); else onCapture(); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {titles.map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? C.indigo : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? C.indigo2 : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{t}</span>
          </div>
        ))}
      </div>
      <StageView key={si} stage={stage} onSolved={solved} />
      {cleared[si] && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STAGES.length ? "Next stage →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: the hidden field isn't locked ───────────────────────── */

function HiddenFieldLab({ onDone }: { onDone: () => void }) {
  const [price, setPrice] = useState("149.00");
  const changed = price.trim() !== "149.00";
  useEffect(() => { if (changed) onDone(); }, [changed, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · a hidden field is just data</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>The page shows this price as fixed. But it&apos;s just a value in the request your browser sends - and your browser is yours. Change it.</div>
      <div style={{ fontFamily: MONO, fontSize: 12, color: "#8fa0c8", background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "9px 11px", marginBottom: 10 }}>&lt;input type=&quot;hidden&quot; name=&quot;price&quot; value=&quot;...&quot;&gt;</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: C.mute }}>price =</span>
        <input style={{ ...inp, width: 110, color: C.amber }} value={price} onChange={(e) => setPrice(e.target.value)} />
      </div>
      {changed && <div style={{ marginTop: 11, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>Done - and nothing stopped you. &apos;Hidden&apos; only meant not drawn on screen. Whatever your browser sends, you can rewrite.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: pick the safe handling ───────────────────────── */

function PickServerTruthLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opts = [
    { code: `total = request.price * qty`, ok: false, why: "The bug: it uses the price the client sent. That's exactly what you tampered." },
    { code: `<input readonly>  // lock the field on the page`, ok: false, why: "The attacker edits the request, not the page. A read-only field changes nothing." },
    { code: `price = db.priceOf(itemId);  total = price * qty`, ok: true, why: "The server looks up the real price itself and ignores anything the client sent. This is the fix - the server owns the truth." },
  ];
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · which checkout can&apos;t be tampered?</div>
      <div style={{ display: "grid", gap: 8 }}>
        {opts.map((o, i) => {
          const isP = picked === i;
          return (
            <div key={i}>
              <button onClick={() => { setPicked(i); if (o.ok) onDone(); }} className="co-opt" style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${isP ? (o.ok ? C.green : C.red) : C.line}`, background: isP ? (o.ok ? "rgba(85,217,140,.08)" : "rgba(242,109,114,.06)") : C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer" }}>
                <span style={{ color: isP ? (o.ok ? C.green : C.red) : C.mute, marginRight: 8 }}>{isP ? (o.ok ? "✓" : "✗") : String.fromCharCode(65 + i)}</span>{o.code}
              </button>
              {isP && <div style={{ padding: "7px 12px 2px", fontSize: 12.5, color: o.ok ? "#bff3d3" : C.soft, lineHeight: 1.5 }}>{o.why}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; stages: Stage[]; success: string };

const DRILLS: DrillCfg[] = [
  {
    client: "Brightpost Blog",
    brief: "Brightpost's response headers say more than they should. Read one and tell us the backend software and version. No walkthrough.",
    stages: [{ kind: "inspect", step: { title: "Read headers", goal: "Find the exact server software and version from the response headers.", host: "brightpost.range", method: "GET", path: "/", responseLines: [{ t: "HTTP/1.1 200 OK" }, { t: "Server: Apache/2.4.49", leak: true }, { t: "X-Powered-By: PHP/7.2.1", leak: true }, { t: "Content-Type: text/html" }], answerLabel: "the Server header value", accept: (v) => /apache\/2\.4\.49/i.test(v), hint: "The Server header names it: Apache/2.4.49 (a version with known holes).", reveal: "Apache/2.4.49" } }],
    success: "Read the version straight off the Server header - that alone tells an attacker which exploits to try. Finding logged.",
  },
  {
    client: "Tideway Council",
    brief: "Tideway's robots.txt hides more than it protects. Find a disallowed path and reach it.",
    stages: [{ kind: "req", host: "tideway.range", step: { title: "robots.txt", goal: "Read robots.txt and reach the path it tries to hide.", method: "GET", pathTemplate: "{path}", fields: [{ key: "path", label: "path", value: "/" }], palette: ["/robots.txt", "/staff-portal"], respond: (f) => { const p = String(f.path).trim(); if (p === "/robots.txt") return { status: 200, title: "robots.txt", lines: ["Disallow: /staff-portal"], sensitive: true }; if (p.startsWith("/staff-portal")) return { status: 200, title: "staff portal (unlinked, still open)", lines: ["internal notices"], sensitive: true }; return { status: 200, title: "home", lines: ["Welcome."] }; }, win: (f) => String(f.path).trim().startsWith("/staff-portal"), hint: "GET /robots.txt, read the Disallow, then browse to /staff-portal.", reveal: { path: "/staff-portal" } } }],
    success: "robots.txt pointed you straight at the hidden portal - it lists secrets, it doesn't protect them. Finding logged.",
  },
  {
    client: "Flux Fitness",
    brief: "Flux's booking sends a discount code AND the discount amount. See if the server trusts the amount. Trickier.",
    stages: [{ kind: "req", host: "flux.range", step: { title: "Tamper discount", goal: "Set your own discount by editing the request.", method: "POST", pathTemplate: "/api/book", fields: [{ key: "discountPct", label: "discountPct", value: "0" }], palette: ["100", "90"], respond: (f) => { const n = Number(f.discountPct); if (n >= 90) return { status: 200, title: "booked (discount trusted from request!)", lines: [`${n}% off applied`, "near-free booking"], sensitive: true }; return { status: 200, title: "booked", lines: [`${n}% off`] }; }, win: (f) => Number(f.discountPct) >= 90, hint: "The request carries the discount percentage. Set it to 100.", reveal: { discountPct: "100" } } }],
    success: "Set your own discount by editing a field the server should have decided itself. Finding logged.",
  },
  {
    client: "Oakline Store",
    brief: "The full field job to finish on. Oakline leaks an endpoint in a comment, hides it in robots.txt, and trusts a role header. Read, discover, then forge your way in. Chain it yourself.",
    stages: [
      { kind: "inspect", step: { title: "Inspect", goal: "Step 1: find the endpoint the dev left in a comment.", host: "oakline.range", method: "GET", path: "/", responseLines: [{ t: "HTTP/1.1 200 OK" }, { t: "<!-- staff: /ops-console -->", leak: true }], answerLabel: "the endpoint", accept: (v) => v.trim().toLowerCase().includes("/ops-console"), hint: "Read the HTML comment: /ops-console.", reveal: "/ops-console" } },
      { kind: "req", host: "oakline.range", step: { title: "Forge role", goal: "Step 2: the console trusts an X-Role header. Forge it to admin.", method: "GET", pathTemplate: "/ops-console", fields: [{ key: "role", label: "X-Role (header)", value: "staff" }], palette: ["admin"], respond: (f) => { const r = String(f.role).trim().toLowerCase(); if (r === "admin") return { status: 200, title: "console open (header trusted!)", lines: ["full control"], sensitive: true }; return { status: 403, title: "forbidden", lines: ["staff can't open this"] }; }, win: (f) => String(f.role).trim().toLowerCase() === "admin", hint: "Set X-Role to admin.", reveal: { role: "admin" } } },
    ],
    success: "Read a leak, discovered the endpoint, then forged a header - the whole web-surface chain, unguided. Finding logged.",
  },
];

function DrillRunner({ stages, success, onSolved }: { stages: Stage[]; success: string; onSolved: () => void }) {
  const [si, setSi] = useState(0);
  const [done, setDone] = useState(false);
  function stepSolved() { if (si + 1 < stages.length) setTimeout(() => setSi((n) => n + 1), 650); else { setDone(true); onSolved(); } }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {stages.length > 1 && <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo2 }}>Step {si + 1} of {stages.length}</div>}
      {!done && <StageView key={si} stage={stages[si]} onSolved={stepSolved} />}
      {done && <div className="co-anim co-pop" style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55`, fontSize: 13, color: "#bff3d3", lineHeight: 1.5 }}>✓ {success}</div>}
    </div>
  );
}

function ConsolidationDrills({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(DRILLS.map(() => false));
  const d = DRILLS[i];
  function onSolved() { setSolved((s) => { const n = [...s]; n[i] = true; return n; }); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DRILLS.map((dr, k) => (
          <div key={dr.client} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${k === i ? C.indigo : C.lineSoft}`, background: solved[k] ? "rgba(85,217,140,.08)" : k === i ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: solved[k] ? C.green : k === i ? C.indigo2 : C.mute, fontWeight: 700 }}>{solved[k] ? "✓" : `drill ${k + 1}`}</span>
          </div>
        ))}
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>{d.client}</div>
        <p style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0" }}>{d.brief}</p>
      </div>
      <DrillRunner key={d.client} stages={d.stages} success={d.success} onSolved={onSolved} />
      {solved[i] && (
        <div style={{ display: "flex" }}>
          <Btn tone="g" onClick={() => { if (i + 1 < DRILLS.length) setI(i + 1); else onDone(); }} style={{ marginLeft: "auto" }}>{i + 1 < DRILLS.length ? "Next drill →" : "On to the debrief →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── capstone ───────────────────────── */

const CAP_STAGES: Stage[] = [
  { kind: "inspect", step: { title: "Inspect", goal: "Sableline's shop leaks an endpoint in its response. Find it.", host: "shop.sableline.range", method: "GET", path: "/", responseLines: [{ t: "HTTP/1.1 200 OK" }, { t: "Server: nginx" }, { t: "<!-- internal pricing tool: /price-admin -->", leak: true }], answerLabel: "the hidden endpoint", accept: (v) => v.trim().toLowerCase().includes("/price-admin"), hint: "Read the comment: /price-admin.", reveal: "/price-admin" } },
  { kind: "req", host: "shop.sableline.range", step: { title: "Tamper", goal: "The checkout trusts the price. Buy the item for next to nothing.", method: "POST", pathTemplate: "/api/order", fields: [{ key: "unitPrice", label: "unitPrice (GBP)", value: "299.00" }], palette: ["0.00"], respond: (f) => { const n = Number(f.unitPrice); if (Number.isFinite(n) && n < 299) return { status: 200, title: "order confirmed (price trusted!)", lines: [`total GBP ${n.toFixed(2)}`], sensitive: true }; return { status: 200, title: "order confirmed", lines: ["GBP 299.00 (real price)"] }; }, win: (f) => { const n = Number(f.unitPrice); return Number.isFinite(n) && n < 299; }, hint: "Set unitPrice to 0.00.", reveal: { unitPrice: "0.00" } } },
  { kind: "req", host: "shop.sableline.range", step: { title: "Forge", goal: "Finish it: the pricing tool trusts an X-Role header. Forge admin and open it.", method: "GET", pathTemplate: "/price-admin", fields: [{ key: "role", label: "X-Role (header)", value: "customer" }], palette: ["admin"], respond: (f) => { const r = String(f.role).trim().toLowerCase(); if (r === "admin") return { status: 200, title: "pricing tool open (header trusted!)", lines: ["global price overrides unlocked"], sensitive: true }; return { status: 403, title: "forbidden", lines: ["customers can't open this"] }; }, win: (f) => String(f.role).trim().toLowerCase() === "admin", hint: "Set X-Role to admin.", reveal: { role: "admin" } } },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  function solved() { if (phase + 1 < CAP_STAGES.length) setTimeout(() => setPhase((p) => p + 1), 650); else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full engagement · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StageView key={phase} stage={CAP_STAGES[phase]} onSolved={solved} />}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}web_surface_mapped{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Inspect, discover, tamper, forge - the full web surface read and bent to your will, start to finish.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE3: ModuleDef = {
  code: "M-03",
  moduleNo: 3,
  title: "The Web Surface",
  client: "Caldera Freight",
  brief:
    "A deep engagement on how the web actually works - the foundation everything else stands on. Caldera's parts store is about to open. The full job: read a response and find what the dev left in it, map the hidden surface through robots.txt, tamper the price the checkout trusts, and forge a role header to open the staff tools. Then four field jobs for new clients, and a final challenge you run start to finish. Every request and response is real, modelled in your browser, nothing leaves your machine.",
  lesson: {
    blocks: [
      { h: "The web is requests and responses", body: "Every web action is a message. Your browser sends an HTTP request - a method (GET to fetch, POST to send), a path like /api/order, some headers, and often a body of data - and the server sends a response back with a status code, headers, and a body. That is the whole conversation; a web app is just a long series of these." },
      { h: "You can see and change the request", body: "Your browser's developer tools, and tools called proxies, let you watch every request leave, and pause and edit one before it is sent. The browser runs on your computer, under your control, so anything it sends you can change: form fields, hidden values, prices, cookies, even headers. The request is never really the app's to trust." },
      { h: "The response says more than the page", body: "A response is not just the page you see. Its status code tells you what happened; its headers can leak the exact server software and version, set cookies, or expose debug info; and the HTML body often hides developer comments naming internal endpoints. Reading responses carefully is half of finding a way in." },
      { h: "Mapping the attack surface", body: "Before attacking, you map what is there. Files like robots.txt list the very paths a site wants hidden from search engines - a gift to an attacker. Sitemaps, JavaScript files and HTML comments reveal more endpoints. An unlinked admin page is not hidden; it is one guessed or leaked path away. The attack surface is everything the app exposes, linked or not." },
      { h: "The golden rule: never trust the client", body: "Because the user controls the browser, the server can never assume the request is honest. If the checkout believes a price the browser sent, a customer can send any price. If access is decided by a header the browser sets, anyone can set it. Every security decision - what something costs, who you are, what you are allowed to do - must be made and checked on the server." },
    ],
    Interactive: HiddenFieldLab,
    summary: [
      "HTTP is just requests (method, path, headers, body) and responses (status, headers, body).",
      "The client controls everything it sends - fields, hidden values, cookies and headers can all be edited.",
      "Responses leak information: server versions in headers, endpoints in HTML comments, secrets in debug output.",
      "robots.txt, sitemaps, JS and comments map the hidden attack surface; an unlinked page is not protected.",
      "The golden rule: never trust the client - the server must re-decide prices, identity and access itself.",
    ],
    check: {
      q: "A checkout reads the price from a hidden form field in the request. Why can't the server trust it?",
      options: [
        { text: "The client controls the whole request, so any field - hidden or not - can be edited before it's sent.", correct: true, feedback: "Right. 'Hidden' only means not drawn on screen; the value is ordinary data the browser can rewrite." },
        { text: "Hidden fields are encrypted, so they're actually safe to trust.", feedback: "No - 'hidden' isn't encryption or protection; it's just not displayed." },
        { text: "Hidden fields aren't sent to the server at all.", feedback: "They are sent - that's their whole purpose; they're just not shown on the page." },
        { text: "It's fine as long as the field is also marked read-only on the page.", feedback: "The attacker edits the request, not the page, so read-only changes nothing." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "shop.calderafreight.range (home, robots.txt, checkout, staff tools)",
    inScope: "reading responses; the order request and its fields; the X-Role header; the consolidation clients named in each drill",
    offLimits: "other customers' orders, payment processors, real money, other hosts",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge. Read the home page response and find the endpoint in a comment, read robots.txt and reach the staff path, tamper the price the checkout trusts, then forge the X-Role header to open the admin tools. Try each yourself before the hints. You're proving the surface is open, not taking anything real.",
  hint: "Work the stages in order. Send GET / and read the HTML comment for a path. Then GET /robots.txt and browse to what it disallows. For the price, edit unitPrice to 0.00 and send. For the header, set X-Role to admin.",
  Act: WebSurfaceAct,
  flag: "flag{the_cl1ent_c0ntr0ls_the_r3quest}",
  defend: {
    blocks: [
      { h: "The fix: decide on the server", body: "The server must never accept a security-relevant value from the browser. When an order arrives, look up the real price for that item in your own database and use that, ignoring any price the client sent. Decide the user's role from their authenticated session, never from a header or field they supplied. The same goes for discounts, quantities, totals and permissions: the server owns the truth and re-derives it every time." },
      { h: "Don't leak the map", body: "Reduce what the surface gives away. Strip server version banners and debug headers; never ship developer comments or internal endpoints in responses; and remember robots.txt is public - it hides nothing, it only advertises. None of this is a security control on its own, but leaking less means an attacker has to work harder to find the real door." },
      { h: "A whole class of bugs", body: "This is parameter tampering, and it generalises: identity, permissions, prices, feature flags - if the client sends it and the server trusts it, it can be forged. Real breaches have handed attackers free goods, other people's data and admin rights this exact way. Add security headers and least privilege as backup, but the one defence that always holds is: validate and decide server-side." },
    ],
    Interactive: PickServerTruthLab,
    check: {
      q: "What correctly fixes the tampered checkout?",
      options: [
        { text: "The server looks up the real price by item id and ignores any price the client sends.", correct: true, feedback: "Right. The server owns the price; the client's value is never trusted." },
        { text: "Make the price field read-only on the page.", feedback: "The attacker edits the request, not the page - a read-only field changes nothing." },
        { text: "Encrypt the price field in the form before sending.", feedback: "The client still controls the plaintext before it's sent; the server must re-derive the price itself." },
        { text: "Move the price into a hidden field instead of a visible one.", feedback: "Hidden fields are just as editable - that's the whole lesson. The server must decide the price." },
      ],
    },
  },
  finding: {
    title: "Web surface: information leakage and client-trusted values",
    where: "shop.calderafreight.range · responses, robots.txt, POST /api/order, X-Role header",
    severity: "High",
    cvss: "8.1",
    impact: "Responses leak internal endpoints in HTML comments and server versions in headers; robots.txt advertises hidden staff paths that are reachable directly; the checkout trusts a client-supplied price (buy for GBP 0); and staff tools grant access from a client-supplied X-Role header. Together these allow free purchases and unauthorised access to staff functionality.",
    fix: "Decide all security-relevant values server-side: look up prices by item id, derive roles from the session, and validate every field. Strip version banners, debug headers and developer comments from responses, and treat robots.txt as public.",
  },
  rep: 35,
  repRank: "Recruit",
  repTo: "90 / 100 to Junior Operator",
  next: "NEXT MODULE · Broken Authentication →",
};

export default function Module3() {
  return <Engagement mod={MODULE3} />;
}
