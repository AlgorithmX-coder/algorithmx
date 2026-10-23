"use client";

/* Module 6 - Cross-Site Scripting (DEPTH STANDARD, built to the Module 5
 * framework).
 *
 * XSS runs FOR REAL, but safely: every payload executes inside a
 * sandbox="allow-scripts" iframe (an opaque origin, fully isolated from our app
 * and its cookies, with no network egress). The "victim session" is a stand-in
 * string exposed to the payload as COOKIE, and the attacker's collector is a
 * report() function that postMessages back to us - so the learner's code genuinely
 * executes and they see it fire, while nothing real is ever touched.
 *
 * Shape mirrors M5: hover glossary, interactive lesson lab, de-biased check, a
 * FOUR-stage capture (reflected -> steal cookie -> filter bypass -> stored to
 * admin) with a hint ladder, FOUR drills on fresh clients, and a chained capstone. */

import { useCallback, useEffect, useRef, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle, AnswerReveal } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "cross-site scripting", definition: "Getting your own JavaScript to run inside a web page that other people view, so it runs with their access.", example: "On an old-style profile page, someone pastes a bit of script into their 'About me' box, and it then runs in the browser of everyone who views their profile." },
  { term: "XSS", definition: "Short for cross-site scripting - injecting your script into someone else's page.", example: "A comment box doesn't clean what you type, so instead of words you post a <script> tag and it runs for the next person who reads the thread." },
  { term: "payload", definition: "The crafted input you send to pull off an attack - here, the bit of HTML/JavaScript you want the page to run.", example: "Instead of typing your name into a form, you type '<img src=x onerror=alert(1)>', and that crafted input is the payload." },
  { term: "HTML", definition: "The language that describes a web page - its text, images, buttons and tags. The browser builds the page from it.", example: "The 'Bold' and 'Link' buttons in a messaging app wrap your text in HTML tags like <b> and <a> so the browser knows to show it bold or as a link." },
  { term: "DOM", definition: "The live, in-memory version of the page the browser builds from the HTML, and that scripts can read and change.", example: "When you like a post and the counter jumps from 42 to 43 without the page reloading, a script just changed the DOM." },
  { term: "element", definition: "One piece of a page written as a tag, like an image or a paragraph, e.g. <img> or <p>.", example: "The little heart button under a photo is one element on the page, written as a tag the browser draws." },
  { term: "attribute", definition: "A setting inside a tag, like src on an image. Some attributes (onerror, onload) hold code the browser runs on an event.", example: "An image tag carries a src attribute pointing at the photo file, like <img src='cat.jpg'>; an onerror attribute would hold code to run if that photo failed to load." },
  { term: "event handler", definition: "An attribute like onerror or onload that holds JavaScript the browser runs when that event happens - a way to run code without a <script> tag.", example: "You add onclick='sendMessage()' to a button so your code runs the instant someone taps it, with no <script> tag needed." },
  { term: "cookie", definition: "A little bit of data the website stores in your browser and sends back each visit - often where the session lives.", example: "After you tick 'remember me' on a login, the site drops a cookie in your browser so you stay logged in next time you visit." },
  { term: "session", definition: "Your logged-in state, carried by a token (often in a cookie). Steal it and you are logged in as that person.", example: "Copy someone's session token into your own browser and the site treats you as them with no password, like walking in wearing their staff badge." },
  { term: "exfiltrate", definition: "To quietly send stolen data out to the attacker - e.g. shipping a session cookie to a server they control.", example: "The injected script silently sends the victim's session cookie off to the attacker's own server, like texting a copy of someone's house keys to a thief." },
  { term: "reflected", definition: "XSS where your payload bounces straight back in the page's response, usually via a crafted link someone clicks.", example: "A scammer DMs you a link with a payload hidden in it; you click, and the site reflects that payload straight back into the page where it runs." },
  { term: "stored", definition: "XSS where your payload is SAVED by the app (a comment, a post) and then runs for everyone who later views that page.", example: "An attacker leaves one booby-trapped comment on a popular video, and it then runs in the browser of every person who later scrolls down to read the comments." },
  { term: "output encoding", definition: "Turning characters like < and > into harmless display versions when putting data on a page, so it shows as text instead of running.", example: "If a user's name is '<b>Sam</b>', output encoding makes the page show the literal text '<b>Sam</b>' instead of turning the name bold." },
  { term: "escaping", definition: "The same idea as output encoding: making special characters safe so the browser prints them instead of acting on them.", example: "Typing '2 < 3' into a chat should just appear as '2 < 3', so escaping converts the '<' into a harmless code the browser simply prints." },
  { term: "Content-Security-Policy", definition: "A rule the server sends telling the browser which scripts are allowed to run, so injected ones are blocked.", example: "A site's CSP says 'only run scripts from our own domain', so even if an attacker injects a <script> pointing at evil.com, the browser refuses to load it." },
  { term: "HttpOnly", definition: "A flag on a cookie that stops JavaScript from reading it, so even a working XSS can't steal it through script.", example: "A bank marks its session cookie HttpOnly, so an injected script calling document.cookie comes back empty-handed." },
  { term: "sanitise", definition: "To clean user-supplied HTML with a trusted library, stripping anything that could run, before showing it.", example: "A blog lets you post formatted comments but runs them through a library like DOMPurify first, which keeps the <b> tags and deletes any <script>." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 };
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

function Palette({ tokens, onInsert }: { tokens: string[]; onInsert: (t: string) => void }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.mute, marginBottom: 7 }}>PAYLOAD PIECES · tap to add</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {tokens.map((t, i) => (
          <button key={i} onClick={() => onInsert(t)} className="co-opt" style={{ padding: "5px 9px", borderRadius: 7, border: `1px solid ${C.line}`, background: C.panel, color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", whiteSpace: "pre" }}>{t}</button>
        ))}
      </div>
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

/* ───────────────────────── the XSS engine (real, sandboxed) ─────────────────────────
 * Executes the payload inside an isolated iframe. COOKIE is a stand-in victim
 * session; report() is the attacker's collector, which postMessages to us. */

function XssFrame({ payload, cookie, filter, onFire }: { payload: string; cookie: string; filter?: (s: string) => string; onFire: (data: string) => void }) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const body = filter ? filter(payload) : payload;
  const srcDoc = `<!doctype html><html><head><meta charset="utf-8">
<style>body{font-family:ui-monospace,Menlo,monospace;background:#0f1117;color:#aeb8d2;margin:0;padding:12px;font-size:12.5px}.c{border:1px solid #2a2f3e;border-radius:8px;padding:10px;background:#161922}.h{color:#79839f;font-size:11px;margin-bottom:6px}</style>
<script>var COOKIE=${JSON.stringify(cookie)};function report(d){try{parent.postMessage({__xss:true,data:String(d)},"*")}catch(e){}}window.onerror=function(){return true};<\/script>
</head><body><div class="c"><div class="h">// the page rendered your input as HTML:</div>${body}</div></body></html>`;

  const fire = useRef(onFire);
  fire.current = onFire;
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      const d = e.data as { __xss?: boolean; data?: string } | null;
      if (d && d.__xss && e.source === ref.current?.contentWindow) fire.current(String(d.data ?? ""));
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  return <iframe ref={ref} sandbox="allow-scripts" srcDoc={srcDoc} title="xss sandbox" style={{ width: "100%", height: 120, border: `1px solid ${C.lineSoft}`, borderRadius: 10, background: "#0f1117", marginTop: 12 }} />;
}

/* ── reflected surface: type a payload, RUN it, it executes in the sandbox ── */
function ReflectSurface({ host, cookie, filter, palette, win, hint, reveal, onSolved }: { host: string; cookie: string; filter?: (s: string) => string; palette: string[]; win: (d: string) => boolean; hint: string; reveal: string; onSolved: () => void }) {
  const [draft, setDraft] = useState("");
  const [committed, setCommitted] = useState<string | null>(null);
  const [fired, setFired] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const onFire = useCallback((d: string) => { setFired(d); if (win(d)) { setSolved(true); onSolved(); } }, [win, onSolved]);

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <WinBar host={host} />
      <div style={{ padding: 18 }}>
        <label style={lab}>your input</label>
        <input style={inp} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="type a payload, or build one from the pieces" />
        <Palette tokens={palette} onInsert={(t) => setDraft((d) => d + t)} />
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Btn tone="i" onClick={() => { setFired(null); setCommitted(draft); }} disabled={solved}>INJECT &amp; RUN →</Btn>
          <button onClick={() => setDraft("")} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>clear</button>
        </div>
        {committed !== null && <XssFrame key={committed + (solved ? "s" : "")} payload={committed} cookie={cookie} filter={filter} onFire={onFire} />}
        {fired !== null && (
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: solved ? C.green : C.amber, lineHeight: 1.5 }}>
            {solved ? "✓ your code ran. " : "▶ code ran. "}collector report() received: <span style={{ color: C.green }}>{fired || "(empty)"}</span>
          </div>
        )}
        {committed !== null && fired === null && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12, color: C.mute }}>rendered, but nothing called report() - your code didn&apos;t run. Try a vector the browser will execute.</div>}
        <Hints hints={[hint]} revealLabel="stuck? reveal a payload" onReveal={() => setDraft(reveal)} />
      </div>
    </div>
  );
}

/* ── stored surface: plant a payload, then the admin opens the page ── */
function StoredSurface({ host, adminCookie, palette, win, hint, reveal, onSolved }: { host: string; adminCookie: string; palette: string[]; win: (d: string) => boolean; hint: string; reveal: string; onSolved: () => void }) {
  const [draft, setDraft] = useState("");
  const [saved, setSaved] = useState<string | null>(null);
  const [opened, setOpened] = useState(false);
  const [fired, setFired] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const onFire = useCallback((d: string) => { setFired(d); if (win(d)) { setSolved(true); onSolved(); } }, [win, onSolved]);

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <WinBar host={host} />
      <div style={{ padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 10 }}>// posts are SAVED and shown to everyone who opens the board - including the admin.</div>
        <label style={lab}>new post</label>
        <input style={inp} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="plant your payload here" />
        <Palette tokens={palette} onInsert={(t) => setDraft((d) => d + t)} />
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Btn tone="i" onClick={() => { setSaved(draft); setOpened(false); setFired(null); }} disabled={solved}>POST TO BOARD →</Btn>
          {saved !== null && !solved && <Btn tone="g" onClick={() => { setFired(null); setOpened(true); }}>▶ THE ADMIN OPENS THE BOARD</Btn>}
          <button onClick={() => setDraft("")} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>clear</button>
        </div>
        {saved !== null && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 11.5, color: C.soft }}>saved post: <span style={{ color: C.amber }}>{saved || "(empty)"}</span></div>}
        {opened && saved !== null && (
          <>
            <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.red, fontWeight: 700 }}>▶ ADMIN&apos;S BROWSER · loading the board (their session is live here)</div>
            <XssFrame key={saved + (solved ? "s" : "")} payload={saved} cookie={adminCookie} onFire={onFire} />
          </>
        )}
        {fired !== null && (
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: solved ? C.green : C.amber, lineHeight: 1.5 }}>
            {solved ? "✓ your stored payload ran in the ADMIN's browser. " : "▶ ran. "}collector got: <span style={{ color: C.green }}>{fired || "(empty)"}</span>
          </div>
        )}
        <Hints hints={[hint]} revealLabel="stuck? reveal a payload" onReveal={() => setDraft(reveal)} />
      </div>
    </div>
  );
}

/* ───────────────────────── a single step ───────────────────────── */

type Step =
  | { kind: "reflect"; title: string; goal: string; cookie: string; filter?: (s: string) => string; palette: string[]; win: (d: string) => boolean; hint: string; reveal: string }
  | { kind: "stored"; title: string; goal: string; adminCookie: string; palette: string[]; win: (d: string) => boolean; hint: string; reveal: string };

function StepView({ host, step, onSolved }: { host: string; step: Step; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(step.goal, `step-${step.title}`)}</div>
      {step.kind === "reflect"
        ? <ReflectSurface host={host} cookie={step.cookie} filter={step.filter} palette={step.palette} win={step.win} hint={step.hint} reveal={step.reveal} onSolved={onSolved} />
        : <StoredSurface host={host} adminCookie={step.adminCookie} palette={step.palette} win={step.win} hint={step.hint} reveal={step.reveal} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Northwind noticeboard) ───────────────────────── */

const VICTIM = "session=usr-7f2a9c1e";
const ADMIN = "session=ADMIN-3c8e1b40";
const stripScript = (s: string) => s.replace(/<script\b[^>]*>/gi, "").replace(/<\/script>/gi, "").replace(/onerror/gi, "").replace(/javascript:/gi, "");

const HOST = "board.northwind.range · driver noticeboard";
const ACT_STEPS: Step[] = [
  { kind: "reflect", title: "Reflected", goal: "Stage 1 - Reflected. The search box prints whatever you type straight into the page as HTML. Make the page RUN your code (get it to call report()).", cookie: VICTIM, palette: ["<img src=x onerror=", "report(", "'pwned'", ")", ">"], win: (d) => d.length > 0, hint: "A plain <script> often won't run when it's injected this way, but an image that fails to load will fire its onerror. Try: <img src=x onerror=report('pwned')>", reveal: "<img src=x onerror=report('pwned')>" },
  { kind: "reflect", title: "Steal cookie", goal: "Stage 2 - Steal the session. Same box. The victim's session is exposed to your code as COOKIE. Make your payload send it to your collector, report().", cookie: VICTIM, palette: ["<img src=x onerror=", "report(", "COOKIE", ")", ">"], win: (d) => d.includes("session="), hint: "Reuse the onerror vector, but pass COOKIE into report instead of a word.", reveal: "<img src=x onerror=report(COOKIE)>" },
  { kind: "reflect", title: "Bypass the filter", goal: "Stage 3 - Beat the filter. The dev added a filter that strips <script> and the word onerror. Find another element whose event handler still runs, and steal the cookie anyway.", cookie: VICTIM, filter: stripScript, palette: ["<svg onload=", "report(", "COOKIE", ")", ">", "<img src=x onerror="], win: (d) => d.includes("session="), hint: "onerror is blocked, but other tags have other events. An <svg> fires onload. Try: <svg onload=report(COOKIE)>", reveal: "<svg onload=report(COOKIE)>" },
  { kind: "stored", title: "Stored to admin", goal: "Stage 4 - Stored, aimed at the admin. Posts are saved and shown to everyone. Plant a payload, then watch it fire in the ADMIN's browser and steal THEIR session.", adminCookie: ADMIN, palette: ["<img src=x onerror=", "report(", "COOKIE", ")", ">", "<svg onload="], win: (d) => d.includes("ADMIN"), hint: "Any working vector will do - once saved, it runs in whoever opens the board. Post <img src=x onerror=report(COOKIE)>, then open it as the admin.", reveal: "<img src=x onerror=report(COOKIE)>" },
];

function XssAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STEPS.map(() => false));
  const step = ACT_STEPS[si];
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { if (si + 1 < ACT_STEPS.length) setSi(si + 1); else onCapture(); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ACT_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? C.indigo : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? C.indigo2 : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{s.title}</span>
          </div>
        ))}
      </div>
      <StepView key={si} host={HOST} step={step} onSolved={solved} />
      {cleared[si] && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STEPS.length ? "Next stage →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: HTML vs text ───────────────────────── */

function HtmlVsTextLab({ onDone }: { onDone: () => void }) {
  const [val, setVal] = useState("");
  const typedTag = /<\w+/.test(val);
  useEffect(() => { if (typedTag) onDone(); }, [typedTag, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · HTML rendered vs escaped</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>Type something with a tag in it, like <span style={{ fontFamily: MONO, color: C.indigo2 }}>&lt;b&gt;hello&lt;/b&gt;</span>, and watch the difference between a page that RENDERS your HTML and one that ESCAPES it.</div>
      <input style={inp} value={val} onChange={(e) => setVal(e.target.value)} placeholder="<b>hello</b>" />
      {val && (
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr 1fr", marginTop: 12 }}>
          <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(242,109,114,.06)", border: `1px solid ${C.red}55` }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.red, marginBottom: 6 }}>RENDERED AS HTML (vulnerable)</div>
            <div style={{ fontSize: 14, color: C.ink }} dangerouslySetInnerHTML={{ __html: val.replace(/<script/gi, "&lt;script") }} />
          </div>
          <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(85,217,140,.06)", border: `1px solid ${C.green}55` }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.green, marginBottom: 6 }}>ESCAPED AS TEXT (safe)</div>
            <div style={{ fontSize: 14, color: C.ink, fontFamily: MONO, wordBreak: "break-word" }}>{val}</div>
          </div>
        </div>
      )}
      {typedTag && <div style={{ marginTop: 11, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>On the left the browser <b>acted on</b> your tag; on the right it just <b>printed</b> it. XSS lives entirely in that difference.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: pick the safe render ───────────────────────── */

function PickSafeRenderLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => shuffle([
    { code: `page.innerHTML = userComment`, ok: false, why: "This is the bug: it drops raw user input into the page as HTML, so any tag runs. Exactly what you exploited." },
    { code: `page.innerHTML = userComment.replace("<script>", "")`, ok: false, why: "A blocklist - trivially bypassed with onerror, <svg onload>, odd casing or encodings, as you saw in stage three." },
    { code: `page.textContent = userComment`, ok: true, why: "textContent writes the input as TEXT, never HTML - the browser prints <img onerror=...> instead of running it. This is output encoding, the real fix." },
    { code: `page.innerHTML = userComment.replace("onerror", "")`, ok: false, why: "Another blocklist, exactly the stage-three 'fix': switch to <svg onload> or odd casing and it runs again. Encode on output instead." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · which render is safe?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
        doShuffle={false}
        mono
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; host: string; steps: Step[]; success: string };
const DV = "session=mem-5a1c7e";
const DA = "session=ADMIN-9d2f4a";

const DRILLS: DrillCfg[] = [
  {
    client: "Brightpost",
    brief: "Brightpost's blog echoes your search term back onto the results page. Prove it will run your code. No walkthrough.",
    host: "brightpost.range · search results",
    steps: [{ kind: "reflect", title: "Reflected", goal: "Make the search page run your code.", cookie: DV, palette: ["<img src=x onerror=", "report(", "'xss'", ")", ">"], win: (d) => d.length > 0, hint: "An image that fails to load fires onerror.", reveal: "<img src=x onerror=report('xss')>" }],
    success: "Reflected XSS confirmed - your code ran straight out of the search box. Finding logged.",
  },
  {
    client: "Kudos",
    brief: "Kudos saves team shout-outs and shows them to everyone, managers included. Plant one that steals the manager's session when they open the wall.",
    host: "kudos.range · shout-out wall",
    steps: [{ kind: "stored", title: "Stored", goal: "Plant a stored payload and fire it in the manager's browser.", adminCookie: DA, palette: ["<img src=x onerror=", "report(", "COOKIE", ")", ">"], win: (d) => d.includes("ADMIN"), hint: "Post the onerror payload, then open the wall as the manager.", reveal: "<img src=x onerror=report(COOKIE)>" }],
    success: "Stored XSS landed in the manager's browser and lifted their session. Finding logged.",
  },
  {
    client: "Verge Reviews",
    brief: "Verge filters out <script> and onerror from reviews. Get code running anyway and steal the cookie. Trickier.",
    host: "verge.range · product reviews",
    steps: [{ kind: "reflect", title: "Filter bypass", goal: "Beat the filter and steal the session.", cookie: DV, filter: stripScript, palette: ["<svg onload=", "report(", "COOKIE", ")", ">"], win: (d) => d.includes("session="), hint: "onerror is stripped, but <svg onload=...> isn't.", reveal: "<svg onload=report(COOKIE)>" }],
    success: "Beat the blocklist with a different event handler and stole the cookie - blocklists don't hold. Finding logged.",
  },
  {
    client: "Oakline Support",
    brief: "The full field job to finish on. Oakline's helpdesk reflects your ticket title AND saves tickets for agents to read. Confirm it runs, then plant a stored one that hits an agent. Chain it yourself.",
    host: "oakline.range · helpdesk",
    steps: [
      { kind: "reflect", title: "Confirm", goal: "Step 1: confirm the ticket title runs your code.", cookie: DV, palette: ["<img src=x onerror=", "report(", "'x'", ")", ">"], win: (d) => d.length > 0, hint: "onerror on a broken image.", reveal: "<img src=x onerror=report('x')>" },
      { kind: "stored", title: "Stored to agent", goal: "Step 2: plant a stored payload that steals an agent's session.", adminCookie: DA, palette: ["<img src=x onerror=", "report(", "COOKIE", ")", ">"], win: (d) => d.includes("ADMIN"), hint: "Save the onerror payload, then open as the agent.", reveal: "<img src=x onerror=report(COOKIE)>" },
    ],
    success: "Confirmed reflected, then went stored to hit an agent - the full XSS kill chain, unguided. Finding logged.",
  },
];

function DrillRunner({ host, steps, success, onSolved }: { host: string; steps: Step[]; success: string; onSolved: () => void }) {
  const [si, setSi] = useState(0);
  const [done, setDone] = useState(false);
  function stepSolved() { if (si + 1 < steps.length) setTimeout(() => setSi((n) => n + 1), 650); else { setDone(true); onSolved(); } }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {steps.length > 1 && <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo2 }}>Step {si + 1} of {steps.length}</div>}
      {!done && <StepView key={si} host={host} step={steps[si]} onSolved={stepSolved} />}
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
      <DrillRunner key={d.client} host={d.host} steps={d.steps} success={d.success} onSolved={onSolved} />
      {solved[i] && (
        <div style={{ display: "flex" }}>
          <Btn tone="g" onClick={() => { if (i + 1 < DRILLS.length) setI(i + 1); else onDone(); }} style={{ marginLeft: "auto" }}>{i + 1 < DRILLS.length ? "Next drill →" : "On to the debrief →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── capstone ───────────────────────── */

const CAP_HOST = "portal.sableline.range · customer portal";
const CAP_V = "session=cust-1a9f3c";
const CAP_A = "session=ADMIN-7e4b20";
const CAP_STEPS: Step[] = [
  { kind: "reflect", title: "Probe", goal: "Sableline's customer portal reflects your profile name onto the page. Confirm it runs your code.", cookie: CAP_V, palette: ["<img src=x onerror=", "report(", "'x'", ")", ">"], win: (d) => d.length > 0, hint: "Broken image, onerror." , reveal: "<img src=x onerror=report('x')>" },
  { kind: "reflect", title: "Steal", goal: "Now lift the session through the same field.", cookie: CAP_V, palette: ["<img src=x onerror=", "report(", "COOKIE", ")", ">"], win: (d) => d.includes("session="), hint: "Pass COOKIE to report." , reveal: "<img src=x onerror=report(COOKIE)>" },
  { kind: "stored", title: "Hit the admin", goal: "Finish it: your profile name is also shown to staff in the admin panel. Make it steal an admin's session.", adminCookie: CAP_A, palette: ["<img src=x onerror=", "report(", "COOKIE", ")", ">"], win: (d) => d.includes("ADMIN"), hint: "Save the payload, then open as admin." , reveal: "<img src=x onerror=report(COOKIE)>" },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  function solved() { if (phase + 1 < CAP_STEPS.length) setTimeout(() => setPhase((p) => p + 1), 650); else setWon(true); }
  const pct = (phase / CAP_STEPS.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full engagement · step {Math.min(phase + 1, CAP_STEPS.length)} of {CAP_STEPS.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StepView key={phase} host={CAP_HOST} step={CAP_STEPS[phase]} onSolved={solved} />}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}xss_refl_t0_st0red_adm1n{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Probe, steal, then store it to an admin - a full XSS chain run start to finish, in your own hands.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE6: ModuleDef = {
  code: "M-06",
  moduleNo: 6,
  title: "Cross-Site Scripting",
  client: "Northwind Foods",
  brief:
    "A deep engagement on the browser itself. Northwind's driver noticeboard, search and support desk all put what you type onto the page as HTML, so your code can run in other people's browsers. Your job is the full range: run code from a search box, steal a session with it, beat a filter the dev bolted on, then plant a saved payload that fires in the ADMIN's browser. Then four field jobs for new clients, and a final challenge you run start to finish. Every payload really executes - safely, in an isolated sandbox.",
  industry: {
    tag: "One booby-trapped comment can run an attacker's code in every visitor's browser, the admin's included.",
    motif: { pre: "comment: ", hit: "<img src=x onerror=report(COOKIE)>", note: "runs in every viewer's browser, steals the session" },
    primer: {
      term: "HTML",
      what: "Every web page is just HTML: the text, images and buttons the browser draws, plus any script tucked inside. The browser runs whatever script it finds in that HTML, because normally all of it came from the website itself. It has no way to tell the site's own code from something a visitor slipped in.",
      example: "<img src=x onerror=alert('hacked')>",
      returns: "If a site drops what you type onto the page as HTML, the browser treats it like its own code and runs it. That broken image fails to load, fires its onerror, and runs the script. That is cross-site scripting: your words, executed as code in someone else's browser.",
    },
    learn: [
      "Spot a field that drops what you type onto the page as live HTML, not text.",
      "Run your own code from a search box, then steal a logged-in session with it.",
      "Slip past a filter a developer bolted on, using a different event handler.",
      "Plant a saved payload that fires in an admin's browser, and the one fix that actually works.",
    ],
    engines: [
      { name: "Chrome", color: "#4285F4", blurb: "Runs Google's V8 engine. A Chromium sandbox like it powers this range.", here: true, icon: "browser" },
      { name: "Firefox", color: "#FF7139", blurb: "Mozilla's browser, on the SpiderMonkey JavaScript engine.", icon: "browser" },
      { name: "Safari", color: "#1E90FF", blurb: "Apple's browser on every iPhone and Mac, engine JavaScriptCore.", icon: "browser" },
      { name: "Edge", color: "#33B1E1", blurb: "Microsoft's browser, built on Chromium and V8.", icon: "browser" },
    ],
    headline: {
      masthead: "THE WIRE DISPATCH",
      dateline: "LOS ANGELES · 2005 · COURT RECORD + CONTEMPORARY REPORTS",
      title: "A teenager's profile trick spread to a million accounts in under a day",
      body: "Samy Kamkar, 19, hid a few lines of cross-site scripting in his own MySpace profile. Anyone who merely viewed it silently ran his code, which added him as a friend and copied the payload onto their profile, so the next visitor spread it too. Over a million accounts were hit in under 20 hours, the fastest-spreading worm seen to that point, and MySpace was taken offline to purge it. Kamkar was raided by the Secret Service, pleaded guilty, and was sentenced to three years' probation and community service.",
      stat: "1,000,000+",
      statLabel: "ACCOUNTS IN UNDER A DAY",
      why: "Not a stunt that stayed in 2005: the same flaw has since hit forums, webmail, social networks and admin dashboards for twenty years, which is exactly why learning to find and stop it is worth your time.",
    },
    realWorld:
      "Cross-site scripting turns a trusted site into a delivery system for the attacker's code. A single field that puts user input on the page as HTML can run script in every visitor's browser, reading their session, acting as them, even spreading on its own. It has sat among the most-reported web weaknesses for twenty years, and it is cheap to prevent and easy to miss.",
    now: {
      stat: "#5",
      body: "Cross-site scripting sits inside OWASP's Injection category, which ranks fifth on the 2025 OWASP Top 10, the industry's standard list of the most critical web risks. It is also the single most-reported bug class in HackerOne's bug-bounty data, year after year, the first flaw many professional hunters reach for.",
    },
    recent: {
      year: "2026",
      title: "The same flaw, now turning up in AI apps",
      body: "A stored cross-site scripting hole in AnythingLLM (CVE-2026-41318) let anyone who could influence an AI assistant's output run code in every other user's browser, because the app rendered the model's reply as HTML without cleaning it first. A twenty-year-old bug, in brand-new software.",
    },
    ahead:
      "AI is giving XSS a second life. Chat apps increasingly render a model's reply as formatted HTML, and when they skip sanitising it, a cleverly phrased prompt can make the AI emit a payload that runs in the next user's browser, an attack researchers now call prompt-to-XSS. Studies also find a large share of AI-generated front-end code ships without proper output encoding. As more of the web is written and rendered by AI, knowing how XSS works, and how to stop it, is becoming more valuable, not less.",
    role:
      "This is day-one knowledge for web-application penetration testers, bug-bounty hunters and secure-code reviewers. Find and fix XSS and you protect the data of everyone who uses the app.",
    roles: ["Web app pentester", "Bug-bounty hunter", "Secure-code reviewer", "Application security engineer"],
  },
  lesson: {
    blocks: [
      { h: "The browser trusts the page's HTML", body: "A web page is just HTML the server sends, and the browser builds the page from it - text, images, buttons, and any scripts. Crucially, the browser runs whatever script is in that HTML, because normally it all came from the website. It has no way to tell the site's own code from something an attacker slipped in." },
      { h: "XSS: your script in someone else's page", body: "Cross-site scripting is getting your own code onto a page other people view. If an app takes what you type and puts it on the page as HTML without neutralising it, the browser can't tell your tags from the site's own - so it runs them, inside the victim's session, with all their access." },
      { h: "How your code actually runs", body: "A plain <script> you inject often won't run (browsers skip script tags added this way), so attackers use event handler attributes instead. An image with a broken source, <img src=x onerror=...>, fails to load and the browser runs its onerror code. An <svg onload=...> runs on load. These are ordinary HTML, and they execute - which is why just banning the word 'script' never works." },
      { h: "What a script can steal", body: "Running as the victim, your code can read their session cookie and exfiltrate it to you - and now you are logged in as them. It can click things on their behalf, read what's on their screen, or log their keys. The deeper point: once your input reaches the page as HTML, you are running inside their session." },
      { h: "Reflected vs stored", body: "Reflected XSS bounces your payload back in one response, usually through a link you trick someone into clicking. Stored XSS is worse: the app SAVES your payload - in a comment, a post, a profile - and then runs it automatically for everyone who later views that page, including staff and admins. Same bug, far bigger blast radius." },
    ],
    Interactive: HtmlVsTextLab,
    summary: [
      "The browser runs whatever script is in the page's HTML; it can't tell injected code from the site's own.",
      "XSS = your input reaches the page as HTML, so your code runs in the victim's session.",
      "Injected <script> often won't run, but event handlers (onerror, onload) do - banning 'script' isn't enough.",
      "A running script can steal the session cookie and impersonate the victim.",
      "Stored XSS is saved and runs for every viewer (including admins); the fix is to encode output as text.",
    ],
    check: {
      q: "An app puts your comment onto the page with innerHTML, and a developer 'fixes' XSS by deleting any <script> tags from comments. Why does that fail?",
      options: [
        { text: "Event-handler attributes like <img onerror> and <svg onload> run without any <script> tag.", correct: true, feedback: "Right. Script tags aren't the only way to run code; the real fix is to render input as text, not HTML." },
        { text: "It works fine, because a <script> tag is the only HTML that can run JavaScript.", feedback: "No - onerror, onload and other handlers run JavaScript without any <script> tag." },
        { text: "It fails only because the attacker can host the script on another site.", feedback: "The payload runs inline via event handlers; no external hosting is needed to defeat the filter." },
        { text: "It works, as long as the developer also deletes the word 'javascript' too.", feedback: "Still a blocklist - different tags, casing and encodings slip past. Encode on output instead of chasing words." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "board.northwind.range (noticeboard, search, support desk)",
    inScope: "posting and searching as yourself; the consolidation clients named in each drill",
    offLimits: "real staff accounts, sending data off the range, other hosts",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge. Get a search box to run your code, then steal the session with it, then beat the filter the dev added, and finish by planting a saved payload that fires in the admin's browser. Try each yourself first. Your victim's session is exposed to your code as COOKIE, and your collector is report() - call it with what you steal. Every payload runs for real in an isolated sandbox.",
  hint: "Work the stages in order. A broken image runs code: <img src=x onerror=report('x')>. Swap the word for COOKIE to steal the session. If onerror is filtered, <svg onload=...> still fires. For stored, post it, then open the board as the admin.",
  plan: [
    { label: "Reflected", goal: "Get the search box to run your code: inject an image whose broken load fires your script." },
    { label: "Steal the session", goal: "Reuse the same vector, but send the victim's session cookie to your collector instead of a word." },
    { label: "Beat the filter", goal: "The dev strips <script> and the word onerror. Switch to an <svg onload> handler and steal the session anyway." },
    { label: "Stored to admin", goal: "Plant a saved post on the board that fires in the ADMIN's browser when they open it, and lift THEIR session." },
  ],
  Act: XssAct,
  flag: "flag{st0red_xss_t0_the_adm1n}",
  defend: {
    blocks: [
      { h: "The fix: encode on output", body: "Treat user input as data when you put it on a page, never as HTML. Output encoding (escaping) turns characters like < and > into harmless display versions, so <img onerror=...> shows up as literal text instead of running. In practice this means using your framework's safe rendering (textContent, or React's default escaping) and never dropping raw input into innerHTML. Modern frameworks encode by default; the bugs appear when a developer deliberately renders raw HTML." },
      { h: "Why blocklists lose", body: "Stripping <script> or the word onerror feels like a fix but never holds: attackers switch to <svg onload>, <body onbg>, odd casing, or HTML-encoded characters, and meanwhile you break legitimate input. You saw this in stage three - one blocked handler, another one through. Encoding removes the whole category at once, which is why it is the real fix, not a word filter." },
      { h: "Seatbelts: CSP, HttpOnly, sanitisers", body: "Back encoding up with layers. A Content-Security-Policy tells the browser which scripts may run, blocking injected ones even if some slip through. Marking session cookies HttpOnly means JavaScript cannot read them, so a working XSS cannot steal the session that way. And where you genuinely must allow some HTML (a rich-text comment), run it through a trusted sanitiser library rather than writing your own filter." },
    ],
    Interactive: PickSafeRenderLab,
    check: {
      q: "You already encode output. What does also marking the session cookie HttpOnly add on top?",
      options: [
        { text: "If an XSS ever slips through, the injected script can't read the cookie, so it can't steal the session that way.", correct: true, feedback: "Right - HttpOnly is a seatbelt behind the real fix: it removes one big impact (session theft) if encoding ever fails." },
        { text: "It replaces output encoding, so once a cookie is HttpOnly you no longer need to escape user input at all.", feedback: "No - it's a backup layer, not a substitute. An injected script can still deface the page or act as the logged-in user." },
        { text: "It encrypts the cookie so the server can detect whether an attacker has tampered with its value.", feedback: "HttpOnly is neither encryption nor an integrity check - it only hides the cookie from JavaScript." },
        { text: "It blocks every script on the page, which is why it counts as the main defence against XSS.", feedback: "That's closer to a Content-Security-Policy, and even CSP isn't the primary fix - encoding the output is." },
      ],
    },
  },
  finding: {
    title: "Cross-site scripting: reflected, filter-bypassable, and stored to admin",
    where: "board.northwind.range · noticeboard, search, support desk (input rendered as HTML)",
    severity: "High",
    cvss: "8.2",
    impact: "Multiple fields render user input as raw HTML, so attacker JavaScript runs in victims' browsers. A reflected payload executes from the search box and steals the session; a naive filter is bypassed with alternative event handlers; and a stored payload runs in staff and admin browsers, allowing session theft and full account impersonation.",
    fix: "Output-encode all user content so it renders as text, not HTML; never use innerHTML with raw input. Add a Content-Security-Policy, mark session cookies HttpOnly, and use a trusted sanitiser where some HTML must be allowed.",
  },
  cheatsheet: {
    title: "XSS quick reference",
    blurb: "Everything cross-site scripting uses to turn your input into running code, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "One comment, rendered two ways. Every example below is about this one difference: does the page treat your input as HTML (it runs) or as text (it is only shown)?",
      cols: ["you post this", "page renders it as HTML (vulnerable)", "page encodes it as text (safe)"],
      rows: [
        ["<b>Sam</b>", "Sam  (shown in bold)", "<b>Sam</b>  (shown literally)"],
        ["<img src=x onerror=report(COOKIE)>", "runs - steals the session", "printed as plain text, nothing runs"],
        ["hello there", "hello there", "hello there"],
      ],
    },
    groups: [
      {
        heading: "Reading a page (the everyday stuff)",
        entries: [
          { code: "HTML", what: "The tags a browser builds the page from: text, images, buttons, and any script.", example: "<b>hi</b> -> the browser shows hi in bold" },
          { code: "DOM", what: "The live, in-memory page the browser builds from the HTML; scripts read and change it.", example: "liking a post bumps 42 -> 43 by changing the DOM, no reload" },
          { code: "attribute", what: "A setting inside a tag, like src on an image. Some attributes hold code.", example: "<img src='cat.jpg'> -> src points at the photo file" },
          { code: "event handler", what: "An attribute like onerror or onload that runs JavaScript when that event happens, with no <script> tag needed.", example: "onclick='run()' fires your code when the button is tapped" },
        ],
      },
      {
        heading: "The pieces an XSS uses",
        entries: [
          { code: "<script>...</script>", what: "The obvious way to run code, but browsers often ignore a script tag injected into a page after it loads, which is why attackers reach for handlers instead.", example: "<script>report(COOKIE)</script>" },
          { code: "<img src=x onerror=...>", what: "An image with a broken source fails to load and runs its onerror code. The workhorse XSS vector.", example: "<img src=x onerror=report(COOKIE)> -> steals the session" },
          { code: "<svg onload=...>", what: "An SVG runs its onload code the moment it renders: a handler that survives filters which only strip onerror.", example: "<svg onload=report(COOKIE)>" },
          { code: "document.cookie", what: "Reads the page's cookies, where the login session often lives. Running as the victim, your script can read it.", example: "report(document.cookie) -> ships the session to the attacker" },
          { code: "reflected vs stored", what: "Reflected bounces back from a link someone clicks; stored is saved by the app and runs for everyone who later views the page.", example: "a booby-trapped comment (stored) fires for every reader, admins included" },
        ],
      },
      {
        heading: "Shutting it down (the fix)",
        entries: [
          { code: "output encoding", what: "Put user input on the page as TEXT, not HTML, so < and > are shown, not run. The real fix.", example: "textContent = input (or a framework's default escaping) -> the tag is printed, not executed" },
          { code: "Content-Security-Policy", what: "A server rule telling the browser which scripts may run, so injected ones are blocked.", example: "CSP 'scripts from our domain only' -> an injected evil.com script is refused" },
          { code: "HttpOnly", what: "A cookie flag that stops JavaScript reading it, so even a working XSS cannot steal the session that way.", example: "session cookie marked HttpOnly -> document.cookie comes back empty" },
          { code: "DOMPurify / sanitiser", what: "Where you must allow some HTML, clean it with a trusted library instead of writing your own filter.", example: "DOMPurify keeps <b>, strips <script> and onerror" },
        ],
      },
    ],
  },
  takeaway: "If a page renders your input as HTML, your input can run as code. Encode output as text; never rely on a blocklist.",
  outcome: [
    "Get your own JavaScript to run in a page by injecting an event handler like '<img src=x onerror=...>' where a plain script tag is ignored.",
    "Steal a victim's session cookie with a reflected payload and exfiltrate it to a collector you control.",
    "Beat a naive filter that strips 'onerror' by switching to another handler such as '<svg onload=...>'.",
    "Plant a stored payload that fires in an admin's browser when they open the page - and explain why encoding output as text, not blocklists, is the fix.",
  ],
  rep: 55,
  repRank: "Junior Operator",
  repTo: "240 / 300 to Operator",
  next: "NEXT MODULE · Broken Access Control →",
};

export default function Module6() {
  return <Engagement mod={MODULE6} />;
}
