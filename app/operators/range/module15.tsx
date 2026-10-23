"use client";

/* Module 15 - Full Engagement, Part 1 (DEPTH STANDARD, built to the M5 framework).
 *
 * The first capstone: everything chained. Modelled in-browser (zero egress). The
 * learner runs a real attack chain - recon a robots.txt leak, loot an exposed
 * backup, break in with the looted credential, then escalate - seeing how small
 * findings combine into full compromise. Shape mirrors M5: hover glossary,
 * interactive lesson lab, de-biased check, a FOUR-stage capture with a hint
 * ladder, FOUR drills, and a chained capstone. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle, AnswerReveal } from "./Engagement";
import ExplainQuiz from "./ExplainQuiz";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "engagement", definition: "A full, authorised security test of a client - from first recon through exploitation to the report.", example: "A bank hires your team for a two-week engagement to attack its online banking exactly like a real criminal would, then hand over everything you found." },
  { term: "attack chain", definition: "A sequence of small findings combined into a big impact - each harmless alone, devastating together.", example: "A leaked folder path, an old backup file and a reused password together walk you into the admin panel, yet not one of them mattered on its own." },
  { term: "reconnaissance", definition: "Gathering information about a target before touching it - the first step of any chain.", example: "Before touching the site you read its public pages, job adverts and robots.txt to learn what software it runs and where the login hides." },
  { term: "robots.txt", definition: "A file that tells crawlers which paths to skip - which quietly advertises exactly those paths to an attacker.", example: "A line like 'Disallow: /admin-backup/' is meant to hide that folder from Google, but it is the very first place a tester looks." },
  { term: "misconfiguration", definition: "A setting left wrong - like a database backup served with no access control - that opens a door nobody meant to.", example: "Leaving a cloud storage bucket set to 'public' has exposed millions of real records, simply because someone forgot to tick 'private'." },
  { term: "backup exposure", definition: "A database dump left web-reachable. It contains everything, often including credentials in plain sight.", example: "Downloading backup.sql from a forgotten URL can hand you every username and password in one file, with no real hacking required." },
  { term: "credential reuse", definition: "Using a credential found in one place (a leaked backup) to log in somewhere else - a key step in many chains.", example: "The admin password you spotted in the leaked backup also unlocks the live control panel, because staff used the same one twice." },
  { term: "privilege escalation", definition: "Turning limited access into more - here, a looted login into full administrative control.", example: "You log in as an ordinary user, change your own role from 'member' to 'admin', and suddenly you can delete any account on the site." },
  { term: "defence in depth", definition: "Layering controls so that fixing any one link breaks the whole chain - which is why small fixes matter.", example: "Even if the backup leaks, a unique password plus two-factor login would each stop the attacker cold, like a castle with a moat, walls and a locked keep." },
  { term: "crown jewels", definition: "The most valuable data or access an attacker is ultimately after - the goal the chain leads to.", example: "For an online shop the crown jewels are the customer card database; every other step in the attack is just a route to reach it." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

const inp: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 };
const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, margin: "0 0 6px", letterSpacing: ".06em" };

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

/* ── inspect: fetch something and read what it exposes, then answer ── */
type InspectCfg = { host: string; method: string; path: string; lines: { t: string; leak?: boolean }[]; question: string; placeholder: string; accept: (v: string) => boolean; hint: string; reveal: string };
function InspectSurface({ cfg, onSolved }: { cfg: InspectCfg; onSolved: () => void }) {
  const [sent, setSent] = useState(false);
  const [v, setV] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [solved, setSolved] = useState(false);
  function check() { if (cfg.accept(v)) { setSolved(true); setMsg({ ok: true, text: "✓ Got it - that's the thread; follow it to the next link." }); onSolved(); } else setMsg({ ok: false, text: "Not quite - read the response again." }); }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft }}>{cfg.host}</span>
      </div>
      <div style={{ padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 13, color: "#8fa0c8", marginBottom: 12 }}><span style={{ color: C.cyan }}>{cfg.method}</span> {cfg.path}</div>
        {!sent ? <Btn tone="i" onClick={() => setSent(true)}>SEND REQUEST →</Btn> : (
          <pre style={{ margin: 0, padding: "12px 14px", background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 10, fontFamily: MONO, fontSize: 12, lineHeight: 1.7, whiteSpace: "pre-wrap", overflowX: "auto" }}>
            {cfg.lines.map((l, i) => <span key={i} style={{ display: "block", color: l.leak ? C.amber : "#8fa0c8", background: l.leak ? "rgba(232,163,61,.10)" : "transparent", borderRadius: 3, padding: l.leak ? "1px 4px" : 0 }}>{l.t || " "}</span>)}
          </pre>
        )}
        {sent && (
          <div style={{ marginTop: 14 }}>
            <label style={lab}>{cfg.question}</label>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input style={{ ...inp, flex: "1 1 220px", color: C.amber }} value={v} onChange={(e) => { setV(e.target.value); setMsg(null); }} placeholder={cfg.placeholder} />
              <Btn tone="g" onClick={check} disabled={solved}>SUBMIT →</Btn>
            </div>
            {msg && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: msg.ok ? C.green : C.red }}>{msg.text}</div>}
            <Hints hints={[cfg.hint]} revealLabel="stuck? reveal" onReveal={() => setV(cfg.reveal)} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── request: editable fields, SEND, response, win ── */
type Resp = { status: number; title: string; lines: string[]; sensitive?: boolean };
type ReqCfg = { host: string; method: "GET" | "POST"; pathTemplate: string; fields: { key: string; label: string; value: string }[]; respond: (f: Record<string, string>) => Resp; win: (f: Record<string, string>) => boolean; hint: string; reveal: Record<string, string>; recovered?: { label: string; value: string; field?: string }[] };
function ReqSurface({ cfg, onSolved }: { cfg: ReqCfg; onSolved: () => void }) {
  const [fields, setFields] = useState<Record<string, string>>(() => Object.fromEntries(cfg.fields.map((f) => [f.key, f.value])));
  const [resp, setResp] = useState<Resp | null>(null);
  const [solved, setSolved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const pathDisplay = cfg.pathTemplate.replace(/\{(\w+)\}/g, (_, k) => fields[k] ?? "");
  function send() { const r = cfg.respond(fields); setResp(r); if (cfg.win(fields)) { setSolved(true); onSolved(); } }
  function fillRecovered() { if (!cfg.recovered) return; setFields((x) => { const n = { ...x }; cfg.recovered!.forEach((r) => { if (r.field) n[r.field] = r.value; }); return n; }); }
  function copy(v: string) { try { navigator.clipboard?.writeText(v); setCopied(v); setTimeout(() => setCopied((c) => (c === v ? null : c)), 1200); } catch { /* clipboard blocked */ } }
  const ok = resp && resp.status >= 200 && resp.status < 300;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft }}>{cfg.host}</span>
      </div>
      <div style={{ padding: 18 }}>
        {cfg.recovered && cfg.recovered.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", padding: "11px 13px", borderRadius: 11, background: "rgba(85,217,140,0.06)", border: `1px solid ${C.green}44`, marginBottom: 14 }}>
            <div style={{ flex: "1 1 220px", minWidth: 200 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, fontWeight: 700, marginBottom: 7 }}>✓ What you recovered earlier</div>
              <div style={{ display: "grid", gap: 5 }}>
                {cfg.recovered.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontFamily: MONO, fontSize: 12.5 }}>
                    <span style={{ color: C.mute }}>{r.label} ·</span>
                    <span style={{ color: C.green }}>{r.value}</span>
                    <button onClick={() => copy(r.value)} className="co-btn" style={{ background: "transparent", border: `1px solid ${C.lineSoft}`, color: copied === r.value ? C.green : C.mute, borderRadius: 6, padding: "1px 7px", fontFamily: MONO, fontSize: 10.5, cursor: "pointer" }}>{copied === r.value ? "copied ✓" : "copy"}</button>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.mute, marginTop: 6 }}>No need to memorise it, it is right here.</div>
            </div>
            {cfg.recovered.some((r) => r.field) && <Btn tone="g" onClick={fillRecovered}>Fill these in →</Btn>}
          </div>
        )}
        <div style={{ fontFamily: MONO, fontSize: 13, color: "#8fa0c8", marginBottom: 12, wordBreak: "break-all" }}><span style={{ color: cfg.method === "POST" ? C.amber : C.cyan }}>{cfg.method}</span> {pathDisplay}</div>
        <div style={{ display: "grid", gap: 10 }}>
          {cfg.fields.map((f) => <div key={f.key}><label style={lab}>{f.label}</label><input style={{ ...inp, color: C.amber }} value={fields[f.key]} onChange={(e) => setFields((x) => ({ ...x, [f.key]: e.target.value }))} /></div>)}
        </div>
        <div style={{ marginTop: 14 }}><Btn tone="i" onClick={send} disabled={solved}>SEND REQUEST →</Btn></div>
        {resp && (
          <div style={{ marginTop: 14, background: C.carbon, border: `1px solid ${resp.sensitive ? C.red : ok ? C.green : C.lineSoft}`, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: ok ? C.green : C.red, marginBottom: 7 }}>HTTP {resp.status} · {resp.title}</div>
            {resp.lines.map((l, i) => <div key={i} style={{ fontFamily: MONO, fontSize: 12.5, color: resp.sensitive ? C.amber : C.soft, lineHeight: 1.6 }}>{l}</div>)}
          </div>
        )}
        <Hints hints={[cfg.hint]} revealLabel="stuck? reveal" onReveal={() => setFields((f) => ({ ...f, ...cfg.reveal }))} />
      </div>
    </div>
  );
}

type Explain = { q: string; options: { text: string; correct?: boolean; feedback: string }[] };
type Stage = { kind: "inspect"; title: string; goal: string; cfg: InspectCfg; explain?: Explain } | { kind: "req"; title: string; goal: string; cfg: ReqCfg; explain?: Explain };
function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "inspect" ? <InspectSurface cfg={stage.cfg} onSolved={onSolved} /> : <ReqSurface cfg={stage.cfg} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Vantage Mutual chain) ───────────────────────── */

const HOST = "vantage.range";
const ACT_STAGES: Stage[] = [
  { kind: "inspect", title: "Recon", goal: "Stage 1 - Recon. Start where you always do: passively. Read Vantage's robots.txt and find the path it shouldn't be advertising.",
    cfg: { host: `${HOST} · robots.txt`, method: "GET", path: "/robots.txt", lines: [{ t: "User-agent: *" }, { t: "Disallow: /admin" }, { t: "Disallow: /db-backup-2024.sql", leak: true }], question: "the exposed file the site named", placeholder: "/path", accept: (v) => v.trim().toLowerCase().includes("/db-backup-2024.sql"), hint: "'Disallow' doesn't hide a file - it names it. The backup path is /db-backup-2024.sql.", reveal: "/db-backup-2024.sql" } },
  { kind: "inspect", title: "Loot", goal: "Stage 2 - Loot the backup. That backup is served with no access control. Fetch it and lift the admin credential out of the dump.",
    cfg: { host: `${HOST} · /db-backup-2024.sql`, method: "GET", path: "/db-backup-2024.sql", lines: [{ t: "-- Vantage Mutual · nightly dump" }, { t: "INSERT INTO admins (email, pass) VALUES" }, { t: "  ('root@vantage.range','Vantage!Backup#9');", leak: true }], question: "the admin password from the dump", placeholder: "the password", accept: (v) => v.trim() === "Vantage!Backup#9", hint: "The INSERT line holds it: the password is Vantage!Backup#9.", reveal: "Vantage!Backup#9" } },
  { kind: "req", title: "Break in", goal: "Stage 3 - Break in. You looted an admin credential. Log in to the console with it - credential reuse straight from the backup.",
    cfg: { host: `${HOST} · console login`, method: "POST", pathTemplate: "/console/login", fields: [{ key: "email", label: "email", value: "" }, { key: "pass", label: "password", value: "" }],
      respond: (f) => { if (f.email.trim() === "root@vantage.range" && f.pass === "Vantage!Backup#9") return { status: 200, title: "signed in as root (looted credential accepted)", lines: ["Welcome, administrator.", "admin console unlocked"], sensitive: true }; return { status: 401, title: "access denied", lines: ["wrong credentials"] }; },
      win: (f) => f.email.trim() === "root@vantage.range" && f.pass === "Vantage!Backup#9",
      hint: "Use the credential from the dump: root@vantage.range / Vantage!Backup#9.", reveal: { email: "root@vantage.range", pass: "Vantage!Backup#9" },
      recovered: [{ label: "email", value: "root@vantage.range", field: "email" }, { label: "password", value: "Vantage!Backup#9", field: "pass" }] },
    explain: {
      q: "You logged into the live console with a password lifted from an old database backup. What is this, and why did it work?",
      options: [
        { text: "Credential reuse: the backup's password still worked because it was never changed after the leak.", correct: true, feedback: "Right - one leaked password opened a second system. Rotate credentials after any exposure, and never reuse them across systems." },
        { text: "A brute-force attack: the console just accepted the first password you tried from the leaked dump.", feedback: "No guessing was involved - you used the exact real password from the backup. It worked because it was still valid." },
        { text: "The console had no password check at all, so any text in the password box would have let you in.", feedback: "It does check - a wrong password is rejected. It worked because the looted password was the genuine, current one." },
        { text: "The backup file itself contained a live login session that carried straight over into the console.", feedback: "The backup held a password, not a session. You logged in normally with a credential that should have been rotated." },
      ],
    } },
  { kind: "req", title: "Crown jewels", goal: "Stage 4 - Reach the crown jewels. As admin, pull the protected customer export to prove full impact and capture the flag.",
    cfg: { host: `${HOST} · admin console`, method: "GET", pathTemplate: "/console/export?scope={scope}", fields: [{ key: "scope", label: "scope", value: "self" }],
      respond: (f) => { if (f.scope.trim().toLowerCase() === "all") return { status: 200, title: "full customer export (admin access)", lines: ["42,110 customer records", "flag{ch41n3d_t0_adm1n}"], sensitive: true }; return { status: 200, title: "export", lines: ["your own record only"] }; },
      win: (f) => f.scope.trim().toLowerCase() === "all",
      hint: "As admin you can widen the scope. Set scope to 'all' to prove full data access.", reveal: { scope: "all" } } },
];

function EngagementAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STAGES.map(() => false));
  const [explainOk, setExplainOk] = useState(false);
  const stage = ACT_STAGES[si];
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { setExplainOk(false); if (si + 1 < ACT_STAGES.length) setSi(si + 1); else onCapture(); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ACT_STAGES.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? C.indigo : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? C.indigo2 : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{s.title}</span>
          </div>
        ))}
      </div>
      <StageView key={si} stage={stage} onSolved={solved} />
      {cleared[si] && (
        <div className="co-anim co-pop" style={{ display: "grid", gap: 12, padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
            {(!stage.explain || explainOk) && <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STAGES.length ? "Next link in the chain →" : "Capture the engagement →"}</Btn>}
          </div>
          {stage.explain && <ExplainQuiz key={si} q={stage.explain.q} options={stage.explain.options} onCorrect={() => setExplainOk(true)} />}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: the chain in miniature ───────────────────────── */

function ChainLab({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  useEffect(() => { if (step >= 2) onDone(); }, [step, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · watch two small issues become one big one</div>
      <div style={{ display: "grid", gap: 6, marginBottom: 10 }}>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: step >= 1 ? C.amber : C.mute }}>{step >= 1 ? "robots.txt -> names /backup.sql (a minor leak)" : "link 1: a minor info leak"}</div>
        <div style={{ fontFamily: MONO, fontSize: 12.5, color: step >= 2 ? C.amber : C.mute }}>{step >= 2 ? "/backup.sql -> open, contains admin creds (full compromise)" : "link 2: a misconfiguration"}</div>
      </div>
      {step < 2 ? <Btn tone="i" onClick={() => setStep(step + 1)}>{step === 0 ? "follow link 1 →" : "follow link 2 →"}</Btn> : <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5 }}>Each link is dull alone - a named file, an open file. Chained, they're full admin. That is what a real engagement looks for.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: break the chain ───────────────────────── */

function BreakChainLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => shuffle([
    { code: "Only fix Critical-rated bugs and ignore all the small stuff", ok: false, why: "The small stuff is exactly what chains into Criticals - ignoring it is how this breach happened." },
    { code: "Add more paths to robots.txt so crawlers skip them", ok: false, why: "That advertises even more sensitive paths - the opposite of a fix." },
    { code: "Break any one link in the chain, like not web-exposing backups", ok: true, why: "Defence in depth - remove any single link (keep backups off the web, protect them with access control, don't name sensitive paths in robots.txt) and the whole chain collapses. That's why small fixes matter." },
    { code: "Put the whole site behind a stronger firewall and move on", ok: false, why: "A firewall doesn't help when each step uses normal, allowed web requests. You have to break a link in the chain itself." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · how do you stop a chained attack?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
        doShuffle={false}
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; stages: Stage[]; success: string };
const DRILLS: DrillCfg[] = [
  { client: "Brightpost Media", brief: "Recon Brightpost and find the exposed thing. No walkthrough.", stages: [{ kind: "inspect", title: "Recon", goal: "Read robots.txt and name the exposed file.", cfg: { host: "brightpost.range · robots.txt", method: "GET", path: "/robots.txt", lines: [{ t: "Disallow: /.env", leak: true }], question: "the exposed file", placeholder: "/path", accept: (v) => v.trim().toLowerCase().includes("/.env"), hint: "A named .env file is a goldmine. /.env", reveal: "/.env" } }], success: "Recon found an exposed .env - secrets in plain sight. Finding logged." },
  { client: "Tideway Council", brief: "Loot Tideway's exposed config and lift the key.", stages: [{ kind: "inspect", title: "Loot", goal: "Fetch the config and lift the API key.", cfg: { host: "tideway.range · /.env", method: "GET", path: "/.env", lines: [{ t: "DB_HOST=db.tideway.range" }, { t: "API_KEY=tw_live_4b1c9", leak: true }], question: "the API key", placeholder: "the key", accept: (v) => v.trim() === "tw_live_4b1c9", hint: "API_KEY line: tw_live_4b1c9", reveal: "tw_live_4b1c9" } }], success: "Looted a live API key from an exposed config. Finding logged." },
  { client: "Flux Fitness", brief: "Use a looted credential to break in. Trickier.", stages: [{ kind: "req", title: "Break in", goal: "Log into Flux's admin with the looted credential (admin@flux.range / Flux_Backup!7).", cfg: { host: "flux.range · admin", method: "POST", pathTemplate: "/admin/login", fields: [{ key: "email", label: "email", value: "" }, { key: "pass", label: "password", value: "" }], respond: (f) => { if (f.email.trim() === "admin@flux.range" && f.pass === "Flux_Backup!7") return { status: 200, title: "signed in (looted credential)", lines: ["admin unlocked"], sensitive: true }; return { status: 401, title: "denied", lines: ["wrong credentials"] }; }, win: (f) => f.email.trim() === "admin@flux.range" && f.pass === "Flux_Backup!7", hint: "admin@flux.range / Flux_Backup!7", reveal: { email: "admin@flux.range", pass: "Flux_Backup!7" }, recovered: [{ label: "email", value: "admin@flux.range", field: "email" }, { label: "password", value: "Flux_Backup!7", field: "pass" }] } }], success: "Reused a looted credential to take the admin console. Finding logged." },
  { client: "Oakline Store", brief: "The full chain. Recon, loot, break in. Chain it yourself.", stages: [
    { kind: "inspect", title: "Recon", goal: "Step 1: find the exposed backup.", cfg: { host: "oakline.range · robots.txt", method: "GET", path: "/robots.txt", lines: [{ t: "Disallow: /backup.sql", leak: true }], question: "the exposed file", placeholder: "/path", accept: (v) => v.trim().toLowerCase().includes("/backup.sql"), hint: "/backup.sql", reveal: "/backup.sql" } },
    { kind: "inspect", title: "Loot", goal: "Step 2: loot the admin password.", cfg: { host: "oakline.range · /backup.sql", method: "GET", path: "/backup.sql", lines: [{ t: "('admin@oakline.range','Oak_Backup#3')", leak: true }], question: "the admin password", placeholder: "the password", accept: (v) => v.trim() === "Oak_Backup#3", hint: "Oak_Backup#3", reveal: "Oak_Backup#3" } },
  ], success: "Recon to loot to a working credential - the chain, unguided. Finding logged." },
];

function DrillRunner({ stages, success, onSolved }: { stages: Stage[]; success: string; onSolved: () => void }) {
  const [si, setSi] = useState(0);
  const [done, setDone] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (si + 1 < stages.length) { setSi((n) => n + 1); setCleared(false); } else { setDone(true); onSolved(); } }
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {stages.length > 1 && <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo2 }}>Step {si + 1} of {stages.length}</div>}
      {!done && <StageView key={si} stage={stages[si]} onSolved={() => setCleared(true)} />}
      {!done && cleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {si + 1} cleared</span>
          <Btn tone="g" onClick={next} style={{ marginLeft: "auto" }}>{si + 1 < stages.length ? "Next step →" : "Done →"}</Btn>
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
  { kind: "inspect", title: "Recon", goal: "Sableline, full engagement. Recon first: find the exposed file.", cfg: { host: "sableline.range · robots.txt", method: "GET", path: "/robots.txt", lines: [{ t: "Disallow: /dump.sql", leak: true }], question: "the exposed file", placeholder: "/path", accept: (v) => v.trim().toLowerCase().includes("/dump.sql"), hint: "/dump.sql", reveal: "/dump.sql" } },
  { kind: "inspect", title: "Loot", goal: "Loot the admin credential from the dump.", cfg: { host: "sableline.range · /dump.sql", method: "GET", path: "/dump.sql", lines: [{ t: "('root@sableline.range','Sable_Dump!1')", leak: true }], question: "the admin password", placeholder: "the password", accept: (v) => v.trim() === "Sable_Dump!1", hint: "Sable_Dump!1", reveal: "Sable_Dump!1" } },
  { kind: "req", title: "Break in", goal: "Break into the console with the looted credential.", cfg: { host: "sableline.range · console", method: "POST", pathTemplate: "/console/login", fields: [{ key: "email", label: "email", value: "" }, { key: "pass", label: "password", value: "" }], respond: (f) => { if (f.email.trim() === "root@sableline.range" && f.pass === "Sable_Dump!1") return { status: 200, title: "signed in as root", lines: ["admin console unlocked"], sensitive: true }; return { status: 401, title: "denied", lines: ["wrong credentials"] }; }, win: (f) => f.email.trim() === "root@sableline.range" && f.pass === "Sable_Dump!1", hint: "root@sableline.range / Sable_Dump!1", reveal: { email: "root@sableline.range", pass: "Sable_Dump!1" }, recovered: [{ label: "email", value: "root@sableline.range", field: "email" }, { label: "password", value: "Sable_Dump!1", field: "pass" }] } },
  { kind: "req", title: "Impact", goal: "Finish it: as admin, widen the export scope to prove full data access.", cfg: { host: "sableline.range · admin", method: "GET", pathTemplate: "/console/export?scope={scope}", fields: [{ key: "scope", label: "scope", value: "self" }], respond: (f) => { if (f.scope.trim().toLowerCase() === "all") return { status: 200, title: "full export (admin)", lines: ["88,402 records", "full compromise proven"], sensitive: true }; return { status: 200, title: "export", lines: ["your record only"] }; }, win: (f) => f.scope.trim().toLowerCase() === "all", hint: "scope=all", reveal: { scope: "all" } } },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (phase + 1 < CAP_STAGES.length) { setPhase((p) => p + 1); setCleared(false); } else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full engagement · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StageView key={phase} stage={CAP_STAGES[phase]} onSolved={() => setCleared(true)} />}
      {!won && cleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {phase + 1} cleared</span>
          <Btn tone="g" onClick={next} style={{ marginLeft: "auto" }}>{phase + 1 < CAP_STAGES.length ? "Next step →" : "Finish the challenge →"}</Btn>
        </div>
      )}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}full_eng4gement_cha1ned{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Recon, loot, break in, impact - a whole engagement chained end to end, unguided. That's the job.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE15: ModuleDef = {
  code: "M-15",
  moduleNo: 15,
  title: "Full Engagement, Part 1",
  client: "Vantage Mutual",
  brief:
    "The capstone, part one: everything you've learned, chained. A real client, Vantage Mutual, and no training wheels. The full job: recon the public surface, loot an exposed backup, break in with what you loot, and escalate to full data access - seeing how small findings combine into total compromise. Then four field jobs for new clients, and a final challenge you run start to finish, unguided. This is a real engagement in miniature.",
  industry: {
    tag: "Four small, forgettable flaws. Chained together, they hand over everything.",
    motif: { pre: "robots.txt -> backup -> ", hit: "reused admin password", post: " -> full export", note: "four minor flaws, total compromise" },
    primer: {
      term: "The kill chain",
      what: "A real attack is rarely one big exploit; it's a chain of small steps. The attacker does passive recon to find something exposed, loots a credential or secret from it, reuses that to break in, then escalates to the crown jewels, the data that matters. Each link looks minor on its own; chained, they add up to total compromise.",
      example: "recon -> loot a backup -> reuse its admin password -> export all the data",
      returns: "No single step here is a dramatic zero-day; it's an exposed file, a credential left in a backup, a reused password. That's how most real breaches actually happen, and in this capstone you run the whole chain yourself.",
    },
    learn: [
      "Recon the public surface for something exposed.",
      "Loot a credential from an exposed backup.",
      "Break in by reusing what you looted.",
      "Escalate to full data access: the crown jewels.",
    ],
    engines: [
      { name: "Kali Linux", color: "#5fe6ff", blurb: "The operator's platform: a Linux system that bundles every tool a full engagement needs.", here: true, icon: "tool" },
      { name: "Nmap", color: "#4ade80", blurb: "Maps the target: which machines, ports and services are exposed. The classic recon step.", icon: "scan" },
      { name: "Burp Suite", color: "#ff6633", blurb: "Sits between browser and site to inspect and tamper with requests while you find the way in.", icon: "tool" },
      { name: "Metasploit", color: "#d63aff", blurb: "A framework of ready-made exploits and payloads for gaining a foothold.", icon: "tool" },
      { name: "hashcat", color: "#ffb347", blurb: "Cracks looted password hashes back into working credentials.", icon: "key" },
    ],
    headline: {
      masthead: "THE BREACH LEDGER",
      dateline: "2019 · FBI AFFIDAVIT + REGULATOR RECORD",
      title: "Four small cloud mistakes, chained into 100 million records",
      body: "No dramatic single exploit. An attacker found a misconfigured firewall, tricked it into fetching the server's own cloud access key, reused that key against the company's storage, and copied out the data, an export of around 100 million people's records including 140,000 Social Security numbers. Each flaw was minor alone; chained, they were catastrophic. The attacker was arrested and convicted, and Capital One paid an $80 million fine and a $190 million settlement.",
      stat: "100M",
      statLabel: "RECORDS, FROM FOUR MINOR FLAWS CHAINED",
      why: "Real breaches are rarely one big hole; they're small, dull mistakes that line up. Break any single link, the firewall config, the over-powered key, and the whole chain collapses, which is exactly why operators learn to see the whole route.",
    },
    realWorld:
      "Almost no real breach is a single magic exploit. It's a chain: an exposed file leads to a looted credential, which is reused to log in, which is escalated to the data that matters. Each step is individually small and easy to miss, which is exactly why they get missed. Learning to find and chain those steps, and to see where a defender could cut the chain, is the whole job of an engagement.",
    now: {
      stat: "22%",
      statLabel: "of breaches start with stolen credentials (Verizon DBIR 2025)",
      body: "The chain usually starts with a login: Verizon's 2025 report found stolen credentials were the single most common way in, behind 22% of breaches. And it moves fast, security firms measure the average time from first foothold to spreading across a network in under an hour. Attacks are a sequence of chained steps (the 'kill chain'), and speed is what makes them dangerous.",
    },
    recent: {
      year: "2024",
      title: "One missing MFA, a national health crisis",
      body: "In 2024 attackers logged into Change Healthcare through a remote-access portal that had no multi-factor authentication, using a stolen password, then spread, stole data, and launched ransomware. It disrupted pharmacies and hospitals across the US for months. One missing control on one portal, chained with a stolen login, became one of the largest healthcare breaches ever.",
    },
    ahead:
      "AI is starting to run whole chains by itself. In 2025 an autonomous AI pentester, XBOW, reached number one on a US bug-bounty leaderboard, the first machine to top it, and a 2024 study showed AI agents exploiting most of a set of real vulnerabilities from just the public description. The recon-to-exploit work that needed a skilled human is being automated, which makes understanding the whole chain, and how to break it, more valuable, not less.",
    role:
      "This is the real job: penetration testers, red teamers and security consultants run exactly this chain, legally, to find the route before criminals do. Everything in the course so far was training for this.",
    roles: ["Penetration tester", "Red teamer", "Security consultant", "Bug-bounty hunter"],
  },
  lesson: {
    blocks: [
      { h: "Real attacks are chains", body: "A breach is rarely one spectacular flaw. It's usually a chain of small, dull problems - a file that shouldn't be reachable, a credential left where it doesn't belong - each harmless-looking alone, devastating together. The skill of a full engagement is seeing how findings combine, not just collecting them individually." },
      { h: "Recon tells you where to look", body: "You start the way you always do: passively. A file like robots.txt is meant to steer web crawlers, but it does so by listing the paths a site wants left alone - which quietly tells an attacker exactly where the interesting things are. 'Disallow: /db-backup-2024.sql' doesn't hide that backup; it advertises it." },
      { h: "Loot what recon surfaces", body: "A path is only a lead until you follow it. A database backup left reachable with no access control is a catastrophe, because a dump contains everything - table structures, customer data, and often admin credentials sitting in plain sight in an INSERT statement. You fetch it and lift what you need for the next step." },
      { h: "Reuse it to break in", body: "The credential you looted is the key to the next door. Credential reuse - taking something found in one place and using it to authenticate somewhere else - turns a static leak into live access. Logged in as an administrator, you now hold the keys, and limited access becomes privilege escalation toward the crown jewels." },
      { h: "Each link was dull; the chain is critical", body: "Step back and look at what happened: a minor information leak (a named path) plus a misconfiguration (an unprotected backup) plus credential reuse chained into full administrative access and a complete data breach. No single flaw was dramatic. That is how most real breaches actually unfold - and why a full engagement thinks in chains, not isolated bugs." },
    ],
    Interactive: ChainLab,
    summary: [
      "Real breaches are chains of small findings, not one spectacular flaw.",
      "Recon (robots.txt, leaks) points at where the interesting things are.",
      "An exposed, unprotected backup hands over data - often credentials in plain sight.",
      "Credential reuse turns a static leak into live, escalating access.",
      "Minor leak + misconfig + reuse = critical compromise; think in chains.",
    ],
    check: {
      q: "Why is 'Disallow' in robots.txt useful to an attacker?",
      options: [
        { text: "It publicly lists the paths the site wants left alone.", correct: true, feedback: "Right - it advertises exactly what's interesting (the sensitive files), without protecting any of it." },
        { text: "It blocks attackers from ever reaching the listed path.", feedback: "It only asks crawlers to skip it - it enforces nothing, and attackers read it directly." },
        { text: "It automatically encrypts all of the files that it lists.", feedback: "It does nothing to the files themselves; it's just a note to crawlers." },
        { text: "It only matters for search engine ranking, not security.", feedback: "To an attacker it's a map of sensitive paths - very much a security concern." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "Vantage Mutual - full web engagement (recon + exploit)",
    inScope: "public recon, the exposed backup it reveals, and the console the looted credential opens; the consolidation clients in each drill",
    offLimits: "destroying data, acting on real customers, systems out of scope",
    timebox: "the engagement window",
  },
  handler: "This is the real thing now - recon and exploitation across a whole engagement, no training wheels. Start with recon: read what they tell crawlers to avoid. Follow the thread it gives you - loot the backup, reuse the credential, escalate. One clue leads to the next; chain them to full access.",
  hint: "Work the chain in order. Fetch robots.txt and read the named backup path, fetch that backup for the admin credential, log into the console with it, then widen the export scope to 'all' to prove full access.",
  plan: [
    { label: "Recon", goal: "Start passively: read Vantage's robots.txt and find the path it shouldn't be advertising." },
    { label: "Loot the backup", goal: "The exposed backup has no access control. Fetch it and lift the admin credential." },
    { label: "Break in", goal: "Log into the console with the looted credential: credential reuse, straight from the backup." },
    { label: "Crown jewels", goal: "As admin, pull the protected customer export to prove full impact and capture the flag." },
  ],
  Act: EngagementAct,
  flag: "flag{ch41n3d_t0_adm1n}",
  defend: {
    blocks: [
      { h: "Break the chain anywhere", body: "The power of a chain is also its weakness: fix any link and it falls apart. Don't reference sensitive paths in robots.txt. Never leave database backups in a web-reachable location, and protect them with access control and encryption. Don't store credentials in plain text, and don't reuse them. Any one of those, done right, stops this entire attack - which is why defence in depth works even when individual mistakes slip through." },
      { h: "Think in attack paths", body: "Mature defenders don't just patch bugs in isolation; they ask 'what could this connect to?' A low-severity information leak plus a medium misconfiguration can equal a critical breach. Reviewing your own systems the way an attacker chains findings - the way you just did - is how you catch the dangerous combinations before someone else does." },
      { h: "Assume one link will slip", body: "You won't catch every mistake, so build so that no single one is fatal. Least privilege means a looted credential reaches less; monitoring (from the forensics module) means the chain is noticed as it's walked; and the incident-response muscle means it's contained fast when it is. The attacker needs every link; you only need to break one." },
    ],
    Interactive: BreakChainLab,
    check: {
      q: "On its own, each step here was a 'small' issue - a public backup, a reused password. Why did they add up to a full breach?",
      options: [
        { text: "Chained together, each weak step handed the attacker the next, until a low-risk leak became full admin.", correct: true, feedback: "Right - that's why 'low severity' bugs still matter. Alone they're minor; in a chain they are the path to everything." },
        { text: "Each of those issues was really a Critical bug that had simply been mis-scored as low.", feedback: "No - each genuinely was low-risk alone. The danger was the combination, not a hidden Critical." },
        { text: "The attacker also used a powerful zero-day, and the small issues were just a distraction.", feedback: "No zero-day was needed. Ordinary, known weaknesses chained together were enough on their own." },
        { text: "The steps only worked because they were all exploited within the same few minutes.", feedback: "Timing wasn't the point - the chain works whenever each step is still open, fast or slow." },
      ],
    },
  },
  finding: {
    title: "Full compromise via exposed backup, chained from recon",
    where: "Vantage Mutual · /robots.txt -> /db-backup-2024.sql -> console -> full export",
    severity: "Critical",
    cvss: "9.1",
    impact: "robots.txt names a database backup served with no access control; the dump contains plaintext admin credentials, which are reused to log into the console and export the entire customer database - a minor info-leak and a misconfiguration chained into full administrative access and a complete data breach.",
    fix: "Remove backups from web-reachable locations and encrypt them with access control; stop referencing sensitive paths in robots.txt; never store credentials in plaintext; rotate the exposed credentials; apply least privilege so a single leak reaches less.",
  },
  cheatsheet: {
    title: "Full engagement quick reference",
    blurb: "How a real attack chains small flaws into total compromise, and where a defender cuts the chain, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "No single step is dramatic. The danger is the sequence. Here is the chain you run, and the flaw each step abuses.",
      cols: ["the step", "what you do", "the flaw it abuses"],
      rows: [
        ["recon", "read robots.txt / the public surface", "an exposed path nobody hid properly"],
        ["loot", "fetch the exposed backup", "a backup served with no access control"],
        ["break in + escalate", "reuse the looted password", "a password reused from the dump"],
      ],
    },
    groups: [
      {
        heading: "The attack chain",
        entries: [
          { code: "recon", what: "Find something exposed, passively: a path, a file, a service.", example: "robots.txt names a /backup.sql" },
          { code: "loot", what: "Pull a credential or secret out of what you found.", example: "an admin password inside the backup" },
          { code: "break in", what: "Reuse the looted credential to log in for real.", example: "the backup's password still works on the console" },
          { code: "escalate to impact", what: "Reach the crown jewels: the data or control that proves full compromise.", example: "export all customer records" },
        ],
      },
      {
        heading: "Why chains work",
        entries: [
          { code: "each link looks minor", what: "An exposed file, an unprotected backup, a reused password: dull alone, lethal together.", example: "none of them is a dramatic zero-day" },
          { code: "credential reuse", what: "A password found in one place is tried everywhere; people and systems reuse them.", example: "the backup password = the admin password" },
          { code: "least privilege matters", what: "An over-powered account turns a small foothold into total access.", example: "a key with far more permission than it needed" },
          { code: "speed", what: "Attackers move from foothold to full access in minutes, not days.", example: "average breakout time under an hour" },
        ],
      },
      {
        heading: "Breaking the chain (the defence)",
        entries: [
          { code: "cut any one link", what: "Fix a single step and the whole route collapses: hide the backup, or stop the reuse.", example: "access-control the backup = no loot" },
          { code: "no secrets in backups", what: "Never leave credentials in dumps, configs or exports that could be exposed.", example: "scrub and protect every backup" },
          { code: "unique credentials + MFA", what: "Don't reuse passwords, and require a second factor so a looted one isn't enough.", example: "MFA on the console stops the reuse" },
          { code: "least privilege", what: "Give every account and key only the access it needs, so a foothold stays small.", example: "scope the key to one bucket, not all" },
        ],
      },
    ],
  },
  takeaway: "Small flaws chain into total compromise: a leaked path, an exposed backup, a reused password. Break any single link and the whole route collapses.",
  outcome: [
    "Recon a target's public surface and read a robots.txt that advertises the very paths it is meant to hide.",
    "Loot an exposed, unprotected backup and lift the admin credentials sitting in plain sight in the dump.",
    "Chain small findings into full compromise - reuse a looted credential to log in, then escalate to the crown jewels.",
    "Break a chained attack at any single link with defence in depth, knowing why one small fix collapses the whole route.",
  ],
  rep: 80,
  repRank: "Lead Operator",
  repTo: "760 / 1000 to Principal",
  next: "NEXT MODULE · Full Engagement, Part 2 →",
};

export default function Module15() {
  return <Engagement mod={MODULE15} />;
}
