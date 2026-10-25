"use client";

/* Module 7 - Broken Access Control (DEPTH STANDARD, built to the Module 5
 * framework).
 *
 * Access control is about REQUESTS, not SQL, so the target is a small in-browser
 * API model (pure client JS, zero egress). The learner sends real requests and
 * the model answers exactly as a vulnerable server would - no ownership check on
 * records (IDOR), an unlinked admin area that is reachable anyway (forced
 * browsing), and a profile update that trusts a role field from the client
 * (privilege escalation / mass assignment).
 *
 * Shape mirrors M5: hover glossary, interactive lesson lab, de-biased check, a
 * FOUR-stage capture with a hint ladder, FOUR drills on fresh clients, and a
 * chained capstone. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, AnswerReveal } from "./Engagement";
import ExplainQuiz from "./ExplainQuiz";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "authentication", definition: "Proving who you are - usually with a password. The login. It answers 'who are you?'.", example: "Typing your password to unlock Instagram is authentication: the app is checking you really are the account owner." },
  { term: "authorization", definition: "Deciding what you're ALLOWED to do once you're logged in. It answers 'are you permitted to do this?' - and must be checked on every action.", example: "You are logged into a school portal, but when you try to open the teacher's gradebook it blocks you, because authorisation decides a pupil isn't allowed in." },
  { term: "access control", definition: "The rules and checks that decide who can see or do what. 'Broken' access control means those checks are missing or wrong.", example: "A cinema worker can scan tickets but can't open the safe; broken access control is like the ticket scanner somehow unlocking the safe too." },
  { term: "IDOR", definition: "Insecure Direct Object Reference: the app looks up whatever id you ask for without checking it belongs to you, so changing the number hands you someone else's data.", example: "Your e-receipt link ends in invoice?id=3007, so you try id=3008 and up pops a total stranger's order, because the site never checked it was yours." },
  { term: "object reference", definition: "How an app points at one thing - usually an id in the request, like record?id=1042.", example: "The number 1042 in profile?id=1042 is the object reference: it tells the app exactly which profile to fetch." },
  { term: "endpoint", definition: "A single address the app answers requests on, like /api/record or /admin/users.", example: "When a chat app loads your messages it calls an endpoint like /api/messages, one specific address the server listens on." },
  { term: "parameter", definition: "A value you send with a request - an id, a role, a flag. The server reads it to decide what to do.", example: "In a search link like shop?category=shoes, the 'category=shoes' part is a parameter telling the server what to show you." },
  { term: "forced browsing", definition: "Reaching a page or endpoint directly (by typing its address) that was only ever hidden from the menu, not actually protected.", example: "An admin page isn't linked anywhere in the menu, but you guess the address /admin, type it in, and it opens anyway because nobody locked the door." },
  { term: "privilege escalation", definition: "Ending up with more access than intended - reaching another user's data (horizontal) or gaining admin powers (vertical).", example: "A normal player edits a request to flip their account to 'moderator' and can suddenly ban other players, and that jump in power is privilege escalation." },
  { term: "mass assignment", definition: "When a request is allowed to set fields it shouldn't - like including role=admin in a profile update the server blindly trusts.", example: "A profile form is only meant to change your nickname, but you sneak role=admin into the request and the server saves that extra field too." },
  { term: "deny by default", definition: "Start by refusing everything, and only allow an action when a check explicitly says the user is permitted. The safe default.", example: "A nightclub where the bouncer turns everyone away unless their name is on the guest list, rather than letting people in unless they're on a banned list." },
  { term: "least privilege", definition: "Give each user and system only the access they actually need - nothing spare to abuse.", example: "A new shop assistant gets a till login but not the manager's refund keys, because they only need what the job requires." },
  { term: "role", definition: "What kind of user you are (driver, manager, admin), which decides what you're allowed to do.", example: "On a Discord server you might be a 'member', a 'mod' or the 'owner', and your role decides whether you can delete other people's messages." },
  { term: "server-side", definition: "Done on the server, where the user can't tamper with it - the only place an access check can be trusted.", example: "A game checks your score on its own servers, so editing the number in your browser does nothing, because only the server's copy counts." },
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

/* ───────────────────────── the request console (real in-browser API) ───────────────────────── */

type Resp = { status: number; title: string; lines: string[]; sensitive?: boolean };
type Field = { key: string; label: string };
type ReqStep = {
  title: string; goal: string;
  method: "GET" | "POST";
  pathTemplate: string;
  fields: { key: string; label: string; value: string }[];
  palette?: string[]; // suggested values for the first field
  respond: (f: Record<string, string>) => Resp;
  win: (f: Record<string, string>) => boolean;
  hint: string;
  reveal: Record<string, string>;
  explain?: { q: string; options: { text: string; correct?: boolean; feedback: string }[] };
};

function ReqSurface({ host, step, onSolved }: { host: string; step: ReqStep; onSolved: () => void }) {
  const [fields, setFields] = useState<Record<string, string>>(() => Object.fromEntries(step.fields.map((f) => [f.key, f.value])));
  const [resp, setResp] = useState<Resp | null>(null);
  const [solved, setSolved] = useState(false);
  const firstKey = step.fields[0]?.key;
  const pathDisplay = step.pathTemplate.replace(/\{(\w+)\}/g, (_, k) => fields[k] ?? "");

  function send() {
    const r = step.respond(fields);
    setResp(r);
    if (step.win(fields)) { setSolved(true); onSolved(); }
  }
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
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Btn tone="i" onClick={send} disabled={solved}>SEND REQUEST →</Btn>
        </div>
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

function StepView({ host, step, onSolved }: { host: string; step: ReqStep; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(step.goal, `step-${step.title}`)}</div>
      <ReqSurface host={host} step={step} onSolved={onSolved} />
    </div>
  );
}

/* ───────────────────────── the main capture (Northwind portal API) ───────────────────────── */

type Rec = { id: number; name: string; role: string; detail: string; sensitive?: boolean };
const RECORDS: Record<string, Rec> = {
  "1042": { id: 1042, name: "You (driver)", role: "driver", detail: "Route: North depot · licence valid" },
  "1041": { id: 1041, name: "Sam Okoro", role: "driver", detail: "Route: East depot · licence valid" },
  "1000": { id: 1000, name: "R. Fenwick", role: "manager", detail: "Salary GBP 58,400 · admin portal key MGR-9F2A · home address on file", sensitive: true },
};
function recordResp(f: Record<string, string>): Resp {
  const r = RECORDS[String(f.id).trim()];
  if (!r) return { status: 404, title: "not found", lines: ["no record with that id"] };
  return { status: 200, title: "record returned (no ownership check)", lines: [`${r.name} · #${r.id} · ${r.role}`, r.detail], sensitive: r.sensitive };
}

const HOST = "portal.northwind.range";
const ACT_STEPS: ReqStep[] = [
  {
    title: "IDOR", goal: "Stage 1 - IDOR. You're logged in as driver #1042 and the app fetches records by id with no ownership check. Change the id and read another driver's record.",
    method: "GET", pathTemplate: "/api/record?id={id}", fields: [{ key: "id", label: "id", value: "1042" }], palette: ["1041", "1000"],
    respond: recordResp, win: (f) => { const r = RECORDS[String(f.id).trim()]; return !!r && String(f.id).trim() !== "1042"; },
    hint: "The id is right there in the request. Try 1041 - another driver - and the server won't check it isn't yours.", reveal: { id: "1041" },
    explain: {
      q: "You walked from id 1042 to 1041 to read another record. If the app had used long random ids instead, would that have fixed the flaw?",
      options: [
        { text: "No - a random id still works once seen, shared or logged; ownership is unchecked.", correct: true, feedback: "Right - random ids are harder to guess but aren't a permission check; the missing ownership check is the real bug. The server still has to confirm the record is yours." },
        { text: "Yes - random ids can't be guessed, so no one could ever reach another person's record.", feedback: "No - an attacker who sees a valid random id (a shared link, a log, the app itself) still reads it with no ownership check." },
        { text: "Yes, as long as the random ids are also kept out of the page's HTML source.", feedback: "Hiding the id doesn't add a check; wherever it comes from, the server still hands the record over." },
        { text: "No, but only because the attacker could still brute-force the random ids given enough time.", feedback: "Brute-forcing isn't the point - even one leaked id works, because the server never checks ownership." },
      ],
    },
  },
  {
    title: "Sensitive record", goal: "Stage 2 - Escalate the target. The same flaw reaches far more than peers. Pull the manager's record (id 1000) - salary, home address, and an admin portal key.",
    method: "GET", pathTemplate: "/api/record?id={id}", fields: [{ key: "id", label: "id", value: "1041" }], palette: ["1000", "1042"],
    respond: recordResp, win: (f) => String(f.id).trim() === "1000",
    hint: "Manager records sit in the same list. Try id 1000.", reveal: { id: "1000" },
  },
  {
    title: "Forced browsing", goal: "Stage 3 - Forced browsing. There's no admin link in your menu, but the admin pages were only HIDDEN, not protected. Reach the admin user list directly by changing the path.",
    method: "GET", pathTemplate: "{path}", fields: [{ key: "path", label: "path", value: "/portal/home" }], palette: ["/admin", "/admin/users", "/portal/home"],
    respond: (f) => {
      const p = String(f.path).trim();
      if (p.startsWith("/admin")) return { status: 200, title: "admin area (never checked your role)", lines: ["ALL STAFF:", "#1042 You · driver", "#1041 Sam Okoro · driver", "#1000 R. Fenwick · manager", "#1001 admin · ADMINISTRATOR"], sensitive: true };
      return { status: 200, title: "your dashboard", lines: ["Welcome back, driver #1042."] };
    },
    win: (f) => String(f.path).trim().startsWith("/admin"),
    hint: "The link is hidden, but the address still works. Try browsing straight to /admin/users.", reveal: { path: "/admin/users" },
  },
  {
    title: "Privilege escalation", goal: "Stage 4 - Privilege escalation. The 'update profile' request includes a role field, and the server trusts whatever you send (mass assignment). Change your own role and unlock the admin vault.",
    method: "POST", pathTemplate: "/api/profile", fields: [{ key: "role", label: "role", value: "driver" }], palette: ["manager", "admin", "driver"],
    respond: (f) => {
      const role = String(f.role).trim().toLowerCase();
      if (role === "admin" || role === "manager") return { status: 200, title: "profile updated (role trusted from request!)", lines: [`you are now: ${role}`, "admin vault unlocked:", "flag{acc3ss_c0ntrol_f0rc3d}"], sensitive: true };
      return { status: 200, title: "profile updated", lines: ["role: driver (unchanged)"] };
    },
    win: (f) => { const r = String(f.role).trim().toLowerCase(); return r === "admin" || r === "manager"; },
    hint: "The request carries your role and the server doesn't re-check it. Set role to admin and send.", reveal: { role: "admin" },
  },
];

function AccessAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STEPS.map(() => false));
  const [explainOk, setExplainOk] = useState(false);
  const step = ACT_STEPS[si];
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { setExplainOk(false); if (si + 1 < ACT_STEPS.length) setSi(si + 1); else onCapture(); }
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
        <div className="co-anim co-pop" style={{ display: "grid", gap: 12, padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
            {(!step.explain || explainOk) && <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STEPS.length ? "Next stage →" : "Capture the engagement →"}</Btn>}
          </div>
          {step.explain && <ExplainQuiz key={si} q={step.explain.q} options={step.explain.options} onCorrect={() => setExplainOk(true)} />}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: change the number ───────────────────────── */

function IdorLab({ onDone }: { onDone: () => void }) {
  const [id, setId] = useState("1042");
  const other = id.trim() !== "" && id.trim() !== "1042";
  useEffect(() => { if (other) onDone(); }, [other, onDone]);
  const MINI: Record<string, string> = { "1042": "You (driver) · Route: North depot", "1043": "Priya Nair (driver) · Route: South depot", "1044": "T. Beck (driver) · Route: West depot" };
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · change the number</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>Here is a request that fetches your record by id. Change the id - try 1043 or 1044 - and see whose record comes back; the server never checks it&apos;s yours.</div>
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: MONO, fontSize: 13, color: "#8fa0c8" }}>GET /record?id=</span>
        <input style={{ ...inp, width: 90, color: C.amber }} value={id} onChange={(e) => setId(e.target.value)} />
      </div>
      <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 12.5, color: other ? C.amber : C.soft, background: C.carbon, border: `1px solid ${other ? C.amber : C.lineSoft}55`, borderRadius: 8, padding: "9px 11px" }}>
        {MINI[id.trim()] ? `200 · ${MINI[id.trim()]}` : "404 · no record with that id (try 1043 or 1044)"}
      </div>
      {other && MINI[id.trim()] && <div style={{ marginTop: 10, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>That isn&apos;t your record - and nothing stopped you. That one changed digit is the whole of <b>IDOR</b>.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: pick the real access check ───────────────────────── */

function PickAccessCheckLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => ([
    { code: `Return whatever record the id in the request asks for`, ok: false, why: "The bug itself: it returns whatever id is asked for, with no ownership check. Exactly what you exploited." },
    { code: `Scramble the id so it is hard to guess, then return that record`, ok: false, why: "Obscurity, not access control. The id still leaks (logs, sharing) and the access is still never checked." },
    { code: `On every request, check the logged-in user owns that record before returning it`, ok: true, why: "A server-side authorisation check on every access (canAccess(user, id)), deny by default. This is the fix - it doesn't matter if the id is guessed." },
    { code: `Check the person is logged in, then return the record they asked for`, ok: false, why: "That only checks they are logged in (authentication), not that this record is theirs (authorisation). Any logged-in user still reads any id." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · which actually stops the IDOR?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; host: string; steps: ReqStep[]; success: string };

const DRILLS: DrillCfg[] = [
  {
    client: "Meridian Billing",
    brief: "Meridian lets customers view their invoice by number. See if you can read a different customer's. No walkthrough.",
    host: "pay.meridian.range",
    steps: [{
      title: "IDOR", goal: "Read an invoice that isn't yours.",
      method: "GET", pathTemplate: "/invoice?no={no}", fields: [{ key: "no", label: "invoice no", value: "INV-5000" }], palette: ["INV-4999", "INV-5001"],
      respond: (f) => { const n = String(f.no).trim(); if (n === "INV-5000") return { status: 200, title: "your invoice", lines: ["INV-5000 · you · GBP 40.00"] }; if (/^INV-\d+$/.test(n)) return { status: 200, title: "invoice returned (no ownership check)", lines: [`${n} · another customer · GBP ${100 + (Number(n.slice(4)) % 900)}.00`], sensitive: true }; return { status: 404, title: "not found", lines: ["no such invoice"] }; },
      win: (f) => /^INV-\d+$/.test(String(f.no).trim()) && String(f.no).trim() !== "INV-5000",
      hint: "Invoice numbers run in sequence. Try INV-4999 or INV-5001.", reveal: { no: "INV-4999" },
    }],
    success: "Read another customer's invoice by changing the number - classic IDOR. Finding logged.",
  },
  {
    client: "Tideway Council",
    brief: "Tideway's staff portal has an unlinked reports page. Reach it without a link.",
    host: "portal.tideway.range",
    steps: [{
      title: "Forced browsing", goal: "Reach the hidden reports export directly.",
      method: "GET", pathTemplate: "{path}", fields: [{ key: "path", label: "path", value: "/home" }], palette: ["/reports", "/reports/export", "/home"],
      respond: (f) => { const p = String(f.path).trim(); if (p.startsWith("/reports")) return { status: 200, title: "reports (no role check)", lines: ["Q1 budget · CONFIDENTIAL", "staff salary export.csv"], sensitive: true }; return { status: 200, title: "home", lines: ["Welcome."] }; },
      win: (f) => String(f.path).trim().startsWith("/reports"),
      hint: "The page exists, it's just not linked. Browse to /reports/export.", reveal: { path: "/reports/export" },
    }],
    success: "Walked straight into an unlinked reports page - hiding a link is not access control. Finding logged.",
  },
  {
    client: "Flux Fitness",
    brief: "Flux's app sends your membership tier in the request when you save settings. See if the server trusts it. Trickier.",
    host: "app.flux.range",
    steps: [{
      title: "Mass assignment", goal: "Upgrade yourself by tampering the request.",
      method: "POST", pathTemplate: "/api/settings", fields: [{ key: "tier", label: "tier", value: "basic" }], palette: ["premium", "vip", "basic"],
      respond: (f) => { const t = String(f.tier).trim().toLowerCase(); if (t === "premium" || t === "vip") return { status: 200, title: "settings saved (tier trusted from request!)", lines: [`you are now: ${t}`, "all premium classes unlocked"], sensitive: true }; return { status: 200, title: "settings saved", lines: ["tier: basic"] }; },
      win: (f) => { const t = String(f.tier).trim().toLowerCase(); return t === "premium" || t === "vip"; },
      hint: "The request carries your tier and the server doesn't re-check it. Set it to premium.", reveal: { tier: "premium" },
    }],
    success: "Upgraded your own account by editing a field the server should never have trusted (mass assignment). Finding logged.",
  },
  {
    client: "Harlow Health",
    brief: "The full field job to finish on. Harlow's patient portal has IDOR on records AND an unlinked admin area. Find a patient record, then reach the admin area and escalate. Chain it yourself.",
    host: "portal.harlow.range",
    steps: [
      { title: "IDOR", goal: "Step 1: read another patient's record.", method: "GET", pathTemplate: "/patient?id={id}", fields: [{ key: "id", label: "id", value: "P-200" }], palette: ["P-199", "P-201"], respond: (f) => { const n = String(f.id).trim(); if (n === "P-200") return { status: 200, title: "your record", lines: ["P-200 · you"] }; if (/^P-\d+$/.test(n)) return { status: 200, title: "record (no ownership check)", lines: [`${n} · another patient · notes on file`], sensitive: true }; return { status: 404, title: "not found", lines: ["no such patient"] }; }, win: (f) => /^P-\d+$/.test(String(f.id).trim()) && String(f.id).trim() !== "P-200", hint: "IDs run in sequence - try P-199.", reveal: { id: "P-199" } },
      { title: "Forced browse", goal: "Step 2: reach the unlinked admin area.", method: "GET", pathTemplate: "{path}", fields: [{ key: "path", label: "path", value: "/home" }], palette: ["/admin", "/admin/users"], respond: (f) => { const p = String(f.path).trim(); if (p.startsWith("/admin")) return { status: 200, title: "admin (no role check)", lines: ["full patient index", "role controls"], sensitive: true }; return { status: 200, title: "home", lines: ["Welcome."] }; }, win: (f) => String(f.path).trim().startsWith("/admin"), hint: "Browse directly to /admin.", reveal: { path: "/admin" } },
      { title: "Escalate", goal: "Step 3: tamper your role to admin.", method: "POST", pathTemplate: "/api/profile", fields: [{ key: "role", label: "role", value: "patient" }], palette: ["admin", "staff"], respond: (f) => { const r = String(f.role).trim().toLowerCase(); if (r === "admin" || r === "staff") return { status: 200, title: "role trusted from request!", lines: [`you are now: ${r}`], sensitive: true }; return { status: 200, title: "saved", lines: ["role: patient"] }; }, win: (f) => { const r = String(f.role).trim().toLowerCase(); return r === "admin" || r === "staff"; }, hint: "Set role to admin.", reveal: { role: "admin" } },
    ],
    success: "IDOR, forced browsing, then privilege escalation - the full broken-access-control chain, unguided. Finding logged.",
  },
];

function DrillRunner({ host, steps, success, onSolved }: { host: string; steps: ReqStep[]; success: string; onSolved: () => void }) {
  const [si, setSi] = useState(0);
  const [done, setDone] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (si + 1 < steps.length) { setSi((n) => n + 1); setCleared(false); } else { setDone(true); onSolved(); } }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {steps.length > 1 && <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo2 }}>Step {si + 1} of {steps.length}</div>}
      {!done && <StepView key={si} host={host} step={steps[si]} onSolved={() => setCleared(true)} />}
      {!done && cleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {si + 1} cleared</span>
          <Btn tone="g" onClick={next} style={{ marginLeft: "auto" }}>{si + 1 < steps.length ? "Next step →" : "Done →"}</Btn>
        </div>
      )}
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

const CAP_HOST = "console.sableline.range";
const CAP_STEPS: ReqStep[] = [
  { title: "IDOR", goal: "Sableline's staff console fetches tickets by id with no owner check. Read a ticket that isn't yours.", method: "GET", pathTemplate: "/ticket?id={id}", fields: [{ key: "id", label: "id", value: "T-900" }], palette: ["T-899", "T-901"], respond: (f) => { const n = String(f.id).trim(); if (n === "T-900") return { status: 200, title: "your ticket", lines: ["T-900 · you"] }; if (/^T-\d+$/.test(n)) return { status: 200, title: "ticket (no owner check)", lines: [`${n} · another agent · customer PII attached`], sensitive: true }; return { status: 404, title: "not found", lines: ["no such ticket"] }; }, win: (f) => /^T-\d+$/.test(String(f.id).trim()) && String(f.id).trim() !== "T-900", hint: "Try T-899.", reveal: { id: "T-899" } },
  { title: "Forced browse", goal: "Reach the unlinked admin console directly.", method: "GET", pathTemplate: "{path}", fields: [{ key: "path", label: "path", value: "/home" }], palette: ["/admin", "/admin/console"], respond: (f) => { const p = String(f.path).trim(); if (p.startsWith("/admin")) return { status: 200, title: "admin console (no role check)", lines: ["user management", "role controls"], sensitive: true }; return { status: 200, title: "home", lines: ["Welcome."] }; }, win: (f) => String(f.path).trim().startsWith("/admin"), hint: "Browse to /admin/console.", reveal: { path: "/admin/console" } },
  { title: "Escalate", goal: "Finish it: the profile update trusts a role field. Make yourself an admin and open the vault.", method: "POST", pathTemplate: "/api/profile", fields: [{ key: "role", label: "role", value: "agent" }], palette: ["admin", "owner"], respond: (f) => { const r = String(f.role).trim().toLowerCase(); if (r === "admin" || r === "owner") return { status: 200, title: "role trusted from request!", lines: [`you are now: ${r}`, "vault unlocked"], sensitive: true }; return { status: 200, title: "saved", lines: ["role: agent"] }; }, win: (f) => { const r = String(f.role).trim().toLowerCase(); return r === "admin" || r === "owner"; }, hint: "Set role to admin.", reveal: { role: "admin" } },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (phase + 1 < CAP_STEPS.length) { setPhase((p) => p + 1); setCleared(false); } else setWon(true); }
  const pct = (phase / CAP_STEPS.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full engagement · step {Math.min(phase + 1, CAP_STEPS.length)} of {CAP_STEPS.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StepView key={phase} host={CAP_HOST} step={CAP_STEPS[phase]} onSolved={() => setCleared(true)} />}
      {!won && cleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {phase + 1} cleared</span>
          <Btn tone="g" onClick={next} style={{ marginLeft: "auto" }}>{phase + 1 < CAP_STEPS.length ? "Next step →" : "Finish the challenge →"}</Btn>
        </div>
      )}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}access_idor_t0_adm1n{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>IDOR, forced browsing, then escalation - a full access-control chain run start to finish, in your own hands.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE7: ModuleDef = {
  code: "M-07",
  moduleNo: 7,
  title: "Broken Access Control",
  client: "Northwind Foods",
  brief:
    "A deep engagement on what the app LETS you reach. Logging in proved who you are; now test whether Northwind's portal actually checks what you're allowed to do. The full job: read another driver's record by changing a number, pull the manager's sensitive record the same way, walk into an admin area that was only hidden, and finally make yourself an admin by tampering a field the server trusts. Then four field jobs for new clients, and a final challenge you run start to finish. All against a real in-browser API, nothing leaves your machine.",
  industry: {
    tag: "Logged in as yourself, but the app never checks that what you ask for is actually yours.",
    motif: { pre: "GET /record?id=", hit: "1000", note: "not your id, but the server hands over the manager's record" },
    primer: {
      term: "Access control",
      what: "Authentication proves who you are; access control decides what you are allowed to see and do once you are in. Every time you open a record or a page, the server should check 'is this person allowed THIS one?'. Broken access control is when it checks that you are logged in, but forgets to check that the thing you asked for is actually yours.",
      example: "GET /account?id=1042   ->   GET /account?id=1000",
      returns: "Change the id and the server hands back someone else's account, because it never checked that you own it. That one missing check is the most common serious flaw on the web, and the whole of this module.",
    },
    learn: [
      "Change an id in a request to read another user's record (IDOR), with no ownership check.",
      "Walk the ids up to a sensitive record: salary, home address, an admin key.",
      "Reach an admin area that was only hidden from the menu, not actually protected.",
      "Tamper a field the server trusts to promote yourself to admin (mass assignment).",
    ],
    engines: [
      { name: "REST / GraphQL APIs", color: "#e535ab", blurb: "The request layer where IDOR lives: changing an id in an API call is the core attack.", here: true, icon: "server" },
      { name: "Burp Suite", color: "#ff6633", blurb: "The industry-standard proxy for intercepting and tampering with requests to test access.", icon: "tool" },
      { name: "Postman", color: "#ff6c37", blurb: "An API client used to craft, replay and tweak requests while probing endpoints.", icon: "tool" },
      { name: "JWT role claims", color: "#d63aff", blurb: "Tokens carry your identity and role; weak checks on them let you escalate privilege.", icon: "key" },
      { name: "RBAC", color: "#5fe6ff", blurb: "Role-based access control: the model that, enforced server-side, keeps admin pages admin-only.", icon: "shield" },
    ],
    headline: {
      masthead: "THE CITADEL POST",
      dateline: "NEW YORK · 2019 · RESEARCHER DISCLOSURE + SEC ACTION",
      title: "Change one number in the web address, read anyone's mortgage file",
      body: "First American, a giant US title-insurance company, put customers' documents online with web addresses that simply ran in number order. Logged in or not, you could change a single digit in the address and read someone else's file. About 885 million records going back years, bank statements, mortgage paperwork, tax records, Social Security numbers and driving licences, sat exposed. US regulators brought an enforcement action.",
      stat: "885M",
      statLabel: "RECORDS, ONE DIGIT AWAY",
      why: "No hacking tools and no password, just editing a number in the address bar. This same simple flaw, broken access control, is the single most common serious weakness on the web, which is exactly why it is worth learning to spot.",
    },
    realWorld:
      "Access control is who-can-do-what, and it is the hardest thing to get right because every single request has to be checked. Miss the check on one record, one page or one button, and anyone logged in can reach data and powers never meant for them, usually just by editing an id, a path or a field. It is the number one web risk, and it turns up in almost every app that gets tested.",
    now: {
      stat: "#1",
      body: "Broken Access Control is ranked number one (A01) on the 2025 OWASP Top 10, the top risk for a second edition running. In OWASP's own 2025 testing data, every single application checked had some form of broken access control, which is exactly why it sits at the top of the list.",
    },
    recent: {
      year: "2025",
      title: "Subscriber records scraped a number at a time",
      body: "In late 2025, attackers pulled around 2.3 million subscriber email addresses (plus names, addresses and phone numbers) from Conde Nast titles such as Vogue and GQ. The cause was textbook broken access control: profiles used predictable, sequential ids, and some endpoints never properly checked who was asking, so records could be enumerated one after another.",
    },
    ahead:
      "AI makes this worse before it makes it better. Modern apps are built from many APIs, and AI assistants and agents call them constantly, so a single missing ownership check (what the industry calls Broken Object Level Authorization, the number one API risk) is now reachable at huge scale. AI agents are also often handed more access than their task needs, so a cleverly worded prompt can push them to act beyond their authority. The fix is the same discipline at a bigger scale: check, on every request, that this user may touch this exact thing.",
    role:
      "This is day-one knowledge for web and API penetration testers, bug-bounty hunters and application-security engineers. A missing authorization check is one of the highest-paid bug classes in the industry.",
    roles: ["Web & API pentester", "Bug-bounty hunter", "Application security engineer", "SOC analyst"],
  },
  lesson: {
    blocks: [
      { h: "Authentication vs authorization", body: "Two different checks, and the gap between them is where this whole module lives. Authentication answers 'who are you?' - the login you broke in module 4. Authorization answers 'are you allowed to do this?' - and it has to happen on every single action, not just at the door. Broken access control is when that second check is missing, weak, or trusts something it shouldn't." },
      { h: "IDOR: just change the number", body: "Apps point at things with an id, like /api/record?id=1042. If the server fetches whatever id you ask for without checking that record belongs to you, you can simply change 1042 to 1000 and read someone else's data. That is an Insecure Direct Object Reference, and it is everywhere because the id is sitting right there in the request for you to edit." },
      { h: "Forced browsing: the hidden door still opens", body: "Developers often 'protect' an admin page by leaving it out of the menu. But hiding a link is not access control. If /admin still answers when you type it, anyone can forced-browse straight to it. The only thing that protects a page is a check on the server that runs when the page is requested." },
      { h: "Privilege escalation and trusting the request", body: "Sometimes the request itself carries fields it shouldn't - your role, your account tier, an is_admin flag. If the server saves whatever you send (that is 'mass assignment'), you can set role=admin in an ordinary profile update and promote yourself. Reaching another user's data is horizontal escalation; gaining admin powers is vertical. Never trust the client to tell the server what it's allowed to be." },
      { h: "Why it's so common, and the one fix", body: "Broken access control is consistently one of the most common serious web flaws, because every action needs a check and it only takes one missing one. The cure is always the same shape: the server, on every access, verifies the logged-in user is permitted for that specific object or action, and denies by default. Unguessable ids and hidden links are not access control; a server-side check is." },
    ],
    Interactive: IdorLab,
    summary: [
      "Authentication is who you are; authorization is what you're allowed - and authz must be checked on every action.",
      "IDOR: change the id in the request and read data that isn't yours, because the server never checks ownership.",
      "Forced browsing: an unlinked admin page is still reachable; hiding a link is not protection.",
      "Privilege escalation: if the server trusts a role/tier field from the request, you can promote yourself (mass assignment).",
      "The one fix: a server-side authorization check on every access, deny by default - not secret ids or hidden links.",
    ],
    check: {
      q: "A logged-in user changes id=1042 to id=1000 and reads a manager's record. What went wrong?",
      options: [
        { text: "The server returned the record by id without checking it belongs to the requester.", correct: true, feedback: "Right. Authentication happened; the per-object authorization check did not." },
        { text: "The user guessed the manager's password and used it to open the record.", feedback: "No password was involved - they're logged in as themselves and only changed an id." },
        { text: "The record ids were encrypted and the user managed to break the encryption.", feedback: "The id is plain in the request; the flaw is the missing ownership check, not cryptography." },
        { text: "The record was only unsafe because its link appeared in the menu.", feedback: "Whether or not it's linked is irrelevant - the endpoint answers any id because there's no check." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "portal.northwind.range (record API, admin pages, profile update)",
    inScope: "reading records via the id parameter; reaching admin pages; the profile role field; the consolidation clients named in each drill",
    offLimits: "deleting or altering other people's data, acting on what you find, other hosts",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge. Change the id to read a record that isn't yours, push it to the manager's sensitive record, browse straight to the hidden admin area, then tamper the role field to make yourself admin. Try each yourself before the hints. Read-only on anything you reach; you're proving the access is open, not abusing it.",
  hint: "Work the stages in order. Edit the id in the request and SEND (try 1041, then 1000). For the admin area, change the path to /admin/users. For escalation, set the role field to admin and send.",
  plan: [
    { label: "IDOR", goal: "Change the record id in the request to read another driver's record the app never checks you own." },
    { label: "Sensitive record", goal: "Walk the ids up to the manager's record: salary, home address, and an admin key." },
    { label: "Forced browsing", goal: "The admin pages are hidden, not protected. Reach the admin user list by typing the path directly." },
    { label: "Privilege escalation", goal: "The profile-update request trusts a role field. Set your own role to admin and open the vault." },
  ],
  Act: AccessAct,
  flag: "flag{acc3ss_c0ntrol_f0rc3d}",
  defend: {
    blocks: [
      { h: "The fix: check every access, deny by default", body: "On every request, the server must verify the logged-in user is allowed to touch that specific object or perform that action, and refuse if not. Does record 1000 belong to this user, or is this user a manager? Is this user permitted to open /admin? The check belongs on the server, on every access, and it can never be the client's job or something skipped because an id is hard to guess." },
      { h: "Never trust the request to grant power", body: "Decide a user's role and permissions on the server from their session, never from a field they sent. Do not blindly save every field a request contains (mass assignment) - whitelist exactly which fields a user may change, and role is never one of them. That closes the privilege-escalation door you walked through in stage four." },
      { h: "Obscurity is not access control", body: "Two tempting non-fixes: making ids long and random, and hiding privileged links from the menu. Both are security by obscurity. The id still leaks through logs, referrers and sharing, and the hidden URL is still reachable by typing it. Only an actual authorization check stops the access. Back it up with least privilege, so even a missed check reaches as little as possible." },
    ],
    Interactive: PickAccessCheckLab,
    check: {
      q: "The admin page wasn't linked anywhere, yet you opened it just by typing its address. What does that prove?",
      options: [
        { text: "Hiding a page isn't protecting it - access must be enforced on the server, not left off the menu.", correct: true, feedback: "Right - that's forced browsing. If a URL exists, assume someone reaches it; the control is a permission check, not obscurity." },
        { text: "The page was accidentally made public; normally a link is required before a browser can reach it.", feedback: "No link is ever required - any URL can be typed directly. The page needed a permission check, not a hidden link." },
        { text: "Your browser must have cached the admin URL from an earlier authorised visit and reopened it for you.", feedback: "No cache was involved - you reached it by typing the path. Unlinked doesn't mean unreachable." },
        { text: "A search engine had indexed the admin page and leaked its address to you.", feedback: "You found it by guessing the path, not via a search engine. Hidden pages are still reachable." },
      ],
    },
  },
  finding: {
    title: "Broken access control: IDOR, forced browsing, and privilege escalation",
    where: "portal.northwind.range · GET /api/record, /admin/*, POST /api/profile",
    severity: "High",
    cvss: "8.6",
    impact: "The record endpoint returns any id with no ownership check, exposing other staff records including a manager's salary, home address and admin key. Admin pages are only hidden, not protected, so they are reachable by forced browsing. The profile update trusts a role field from the request, letting any user escalate to admin. Together these allow full data exposure and account takeover.",
    fix: "Enforce authorization server-side on every object and action, deny by default; derive role and permissions from the session, never from request fields (no mass assignment); and never rely on unguessable ids or hidden links.",
  },
  cheatsheet: {
    title: "Access control quick reference",
    blurb: "Everything an app should check before it hands you a record or a page, and the ways it forgets, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "It is all about one missing check. Every example below is a request the server answers without asking 'is this actually yours?'.",
      cols: ["you send", "the server returns", "the missing check"],
      rows: [
        ["GET /record?id=1042 (yours)", "your own record", "fine - it's yours"],
        ["GET /record?id=1000", "the manager's record", "it never checked you own id 1000"],
        ["GET /admin (no menu link)", "the admin page", "hidden, but never role-checked"],
      ],
    },
    groups: [
      {
        heading: "How access control should work",
        entries: [
          { code: "authentication vs authorization", what: "Authentication is WHO you are; authorization is WHAT you may do. You need both, checked separately.", example: "logged in (authN) but still not allowed id 1000 (authZ)" },
          { code: "ownership check", what: "For every record, the server must confirm it belongs to this user before returning it.", example: "return row WHERE id = 1000 AND owner = you" },
          { code: "role check (RBAC)", what: "Admin-only pages and actions must verify the user's role on the server, every time.", example: "/admin -> require role == admin" },
          { code: "deny by default", what: "Everything is forbidden unless a rule explicitly allows it, so a forgotten page stays locked.", example: "new endpoint -> locked until a rule opens it" },
        ],
      },
      {
        heading: "The weak spots you'll hit",
        entries: [
          { code: "IDOR", what: "An id in the request points straight at a record with no ownership check, so changing it reads others' data.", example: "id=1042 -> id=1000 returns the manager" },
          { code: "forced browsing", what: "Admin pages only hidden from the menu, not protected, are reachable by typing the path.", example: "no admin link, but /admin loads anyway" },
          { code: "mass assignment", what: "The server trusts fields you send it, including ones you should never control, like role.", example: 'update profile with {"role":"admin"} and it believes you' },
          { code: "missing function checks", what: "An action (export, delete, promote) that checks you're logged in but not that you're allowed.", example: "any user can call /export, not just admins" },
        ],
      },
      {
        heading: "The fix",
        entries: [
          { code: "check ownership server-side", what: "On every request, confirm the logged-in user owns or may access the exact object asked for.", example: "reject id=1000 unless it belongs to you" },
          { code: "enforce roles server-side", what: "Never rely on hiding a link; check the role on the server for every admin page and action.", example: "/admin returns 403 unless role == admin" },
          { code: "allow-list fields", what: "Only accept the fields a user may change; never let 'role' or 'price' come from the request.", example: "ignore any role field the client sends" },
          { code: "deny by default + log", what: "Default to forbidden, open access with explicit rules, and log access-control failures.", example: "403 unless allowed; alert on repeated denials" },
        ],
      },
    ],
  },
  takeaway: "Hiding a link or an id is not access control. Check ownership and permission on the server for every object and action.",
  outcome: [
    "Spot and exploit an IDOR by changing an object id in a request to read records that were never yours, because the server never checks ownership.",
    "Reach an unlinked admin page by forced-browsing straight to its address, proving that hiding a link is not access control.",
    "Escalate your own role by tampering a field the server blindly trusts (mass assignment), turning a profile update into an admin takeover.",
    "Explain the single real fix, a server-side authorisation check on every object and action that denies by default, rather than relying on secret ids or hidden links.",
  ],
  rep: 60,
  repRank: "Operator",
  repTo: "300 / 600 to Lead Operator",
  next: "NEXT MODULE · Cryptography →",
};

export default function Module7() {
  return <Engagement mod={MODULE7} />;
}
