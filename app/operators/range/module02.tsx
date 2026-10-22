"use client";

/* Module 2 - Reconnaissance & OSINT (DEPTH STANDARD, built to the M5 framework).
 *
 * Pure passive recon: the learner reads only already-public sources (modelled
 * in-browser, zero egress) and pieces them together. The full footprint:
 * derive a target's login from people-intel, find the internal portal from a
 * certificate-transparency list, lift a username from a leaked document's
 * metadata, then dork out a pasted secret. Shape mirrors M5: hover glossary,
 * interactive lesson lab, de-biased check, a FOUR-stage capture with a hint
 * ladder, FOUR drills, and a chained capstone. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "reconnaissance", definition: "Gathering information about a target before touching it. The first phase of any real engagement.", example: "Before a tester even loads the target site, they map its staff, email format and public systems - like studying a shop's layout and opening hours before you ever walk in." },
  { term: "OSINT", definition: "Open-source intelligence: intelligence built entirely from publicly available sources - websites, social posts, job ads, documents.", example: "You work out someone's gym, school and hometown just from the cafes and landmarks tagged in their holiday photos - no hacking, only what they posted themselves." },
  { term: "footprint", definition: "Everything an organisation exposes publicly - its people, addresses, systems and leaks. Mapping it is 'footprinting'.", example: "Acme Ltd's footprint is its staff on LinkedIn, its office on Google Maps, its portal.acme.range login and an old file leaked online - add them up and you see the whole organisation." },
  { term: "passive", definition: "Recon that only reads already-public information and never interacts with the target's systems - invisible and in-scope.", example: "Reading a company's job ads to learn it runs Windows servers is passive - the firm can never tell you looked, because you only read what was already public." },
  { term: "active", definition: "Recon that touches the target directly (scanning, probing a login). Louder, and needs explicit authorisation.", example: "Typing names into the login page to see which ones say 'wrong password' is active recon - it touches their server and lands in their logs, so you need written permission first." },
  { term: "subdomain", definition: "A named part of a domain, like portal.acme.range - often where internal tools hide.", example: "shop.acme.range is the public store, but vpn.acme.range is the staff login sitting on the same domain - subdomains are where the interesting tools often hide." },
  { term: "DNS", definition: "The system that maps names like acme.range to servers. Its records reveal which subdomains exist.", example: "DNS is the internet's phone book: you type acme.range and it looks up the number (the server's address) so your browser knows where to knock." },
  { term: "certificate transparency", definition: "Public logs of every HTTPS certificate ever issued. Searching them lists a company's subdomains - including ones never linked anywhere.", example: "A company never links to test.acme.range anywhere, but because it bought an HTTPS certificate for it, the name turns up in the public certificate logs for anyone to find." },
  { term: "metadata", definition: "Hidden data saved inside a file - who made it, with what software, and sometimes the internal path it came from.", example: "A PDF the school published still lists 'Author: j.smith' and the software it was made with inside it - the file has quietly handed you a real username." },
  { term: "Google dork", definition: "A precise search using operators (site:, filetype:) to surface things that were published by accident, like leaked files.", example: "Searching 'site:acme.range filetype:pdf password' can surface a spreadsheet of logins that someone uploaded by accident and forgot was public." },
  { term: "attack surface", definition: "Everything an attacker could reach - every person, subdomain, document and leak the organisation exposes.", example: "Acme's attack surface is everything you could aim at: 40 staff emails, three subdomains, a leaked document and an old password paste - the longer that list, the more ways in." },
  { term: "enumeration", definition: "Listing things out one by one - here, the accounts, subdomains and systems a target exposes.", example: "Noting that admin@acme.range and ceo@acme.range are real accounts but test@acme.range isn't is enumeration - building the list one confirmed item at a time." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 };
const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, margin: "0 0 7px", letterSpacing: ".06em" };
const para: React.CSSProperties = { fontSize: 13.5, lineHeight: 1.55, margin: "0 0 8px", color: C.soft };

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

function AnswerBox({ question, placeholder, accept, hint, reveal, onSolved }: { question: string; placeholder: string; accept: (v: string) => boolean; hint: string; reveal: string; onSolved: () => void }) {
  const [v, setV] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [solved, setSolved] = useState(false);
  function check() { if (accept(v)) { setSolved(true); setMsg({ ok: true, text: "✓ That's it - pieced straight from public sources." }); onSolved(); } else setMsg({ ok: false, text: "Not quite. Read the source again and combine the clues." }); }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "16px 18px" }}>
      <label style={lab}>{question}</label>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <input value={v} onChange={(e) => { setV(e.target.value); setMsg(null); }} placeholder={placeholder} style={{ ...inp, flex: "1 1 240px" }} />
        <Btn tone="g" onClick={check} disabled={solved}>SUBMIT →</Btn>
      </div>
      {msg && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: msg.ok ? C.green : C.red }}>{msg.text}</div>}
      <Hints hints={[hint]} revealLabel="stuck? reveal" onReveal={() => setV(reveal)} />
    </div>
  );
}

/* ── source board (multiple public sources to read and combine) ── */
type Source = { tag: string; via: string; title: string; body: React.ReactNode; clue: string };

function SourceBoard({ sources, question, placeholder, accept, hint, reveal, onSolved }: { sources: Source[]; question: string; placeholder: string; accept: (v: string) => boolean; hint: string; reveal: string; onSolved: () => void }) {
  const [open, setOpen] = useState(0);
  const [seen, setSeen] = useState<Set<number>>(new Set([0]));
  function view(i: number) { setOpen(i); setSeen((s) => new Set(s).add(i)); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>// intel board · {seen.size}/{sources.length} sources read - open each, then piece it together</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 8 }}>
        {sources.map((s, i) => (
          <button key={i} onClick={() => view(i)} className="co-opt" style={{ textAlign: "left", padding: "11px 13px", borderRadius: 10, border: `1px solid ${open === i ? C.indigo : C.line}`, background: open === i ? "rgba(139,123,255,0.08)" : C.carbon, cursor: "pointer" }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: seen.has(i) ? C.green : C.indigo, fontWeight: 700 }}>{seen.has(i) ? "✓ " : ""}{s.tag}</div>
            <div style={{ fontSize: 13, color: C.ink, marginTop: 4, fontWeight: 600 }}>{s.title}</div>
          </button>
        ))}
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
          <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.indigo, fontWeight: 700, letterSpacing: ".1em" }}>{sources[open].tag}</span>
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>{sources[open].via}</span>
        </div>
        <div style={{ padding: "14px 16px" }}>
          <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15, marginBottom: 6 }}>{sources[open].title}</div>
          {sources[open].body}
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 11.5, color: C.green, borderLeft: `2px solid ${C.green}`, paddingLeft: 10 }}>↳ {sources[open].clue}</div>
        </div>
      </div>
      <AnswerBox question={question} placeholder={placeholder} accept={accept} hint={hint} reveal={reveal} onSolved={onSolved} />
    </div>
  );
}

/* ── intel panel (a single public source: a list, a metadata table, or a
 *    search-gated result) + an answer box ── */
type IntelLine = { t: string; leak?: boolean };
type IntelCfg = {
  sourceTag: string; via: string; lines: IntelLine[];
  search?: { placeholder: string; match: (q: string) => boolean; dork: string };
  question: string; placeholder: string; accept: (v: string) => boolean; hint: string; reveal: string;
};

function IntelSurface({ cfg, onSolved }: { cfg: IntelCfg; onSolved: () => void }) {
  const [revealed, setRevealed] = useState(!cfg.search);
  const [q, setQ] = useState("");
  const [smsg, setSmsg] = useState<string | null>(null);
  function runSearch() { if (cfg.search && cfg.search.match(q)) { setRevealed(true); setSmsg(null); } else setSmsg("No useful results. Try a search operator (site:, filetype:) or the company name plus what you want."); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {cfg.search && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "14px 16px" }}>
          <label style={lab}>search the open web</label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={cfg.search.placeholder} style={{ ...inp, flex: "1 1 240px" }} />
            <Btn tone="i" onClick={runSearch}>SEARCH →</Btn>
          </div>
          {smsg && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.mute }}>{smsg}</div>}
          {!revealed && <Hints hints={[`Precise operators surface accidental leaks. Try something like: ${cfg.search.dork}`]} revealLabel="stuck? reveal a search" onReveal={() => { setQ(cfg.search!.dork); setRevealed(true); }} />}
        </div>
      )}
      {revealed && (
        <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 14px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.indigo, fontWeight: 700, letterSpacing: ".1em" }}>{cfg.sourceTag}</span>
            <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>{cfg.via}</span>
          </div>
          <div style={{ padding: "12px 14px" }}>
            {cfg.lines.map((l, i) => <div key={i} style={{ fontFamily: MONO, fontSize: 12.5, color: l.leak ? C.amber : C.soft, background: l.leak ? "rgba(232,163,61,.08)" : "transparent", borderRadius: 3, padding: l.leak ? "1px 4px" : 0, lineHeight: 1.7, wordBreak: "break-word" }}>{l.t || " "}</div>)}
          </div>
        </div>
      )}
      {revealed && <AnswerBox question={cfg.question} placeholder={cfg.placeholder} accept={cfg.accept} hint={cfg.hint} reveal={cfg.reveal} onSolved={onSolved} />}
    </div>
  );
}

/* ───────────────────────── the main capture (Caldera footprint) ───────────────────────── */

const SOURCES: Source[] = [
  { tag: "WEBSITE", via: "calderafreight.range/about", title: "Meet the team", body: (<><p style={para}>Our people make Caldera Freight move. Reach the leadership team directly:</p><p style={{ ...para, fontFamily: MONO, color: C.indigo2 }}>Dana Okafor, CEO - dana.okafor@calderafreight.range</p><p style={{ ...para, fontFamily: MONO, color: C.indigo2 }}>Priya Shah, CFO - priya.shah@calderafreight.range</p></>), clue: "Email scheme = first.last@calderafreight.range" },
  { tag: "JOB AD", via: "jobsboard.range · 3 weeks ago", title: "Systems Administrator - Caldera Freight", body: (<><p style={para}>You&apos;ll own our internal staff portal and keep the fleet systems running.</p><p style={para}>Day to day you&apos;ll administer <b style={{ color: C.ink }}>portal.calderafreight.range</b>, manage accounts, and support 200+ drivers.</p></>), clue: "Staff login lives at portal.calderafreight.range" },
  { tag: "SOCIAL", via: "profile feed · public post", title: "Marcus Bell", body: (<p style={para}>Thrilled to share I&apos;ve started as <b style={{ color: C.ink }}>Systems Administrator at Caldera Freight</b>. First job: finally sort out that portal. #newrole #sysadmin</p>), clue: "Marcus Bell is the new systems admin" },
  { tag: "PHOTO", via: "team post · image caption", title: "Welcome drinks", body: (<><p style={para}>A whiteboard in the background reads: <span style={{ fontFamily: MONO, color: C.amber }}>Portal pw reset - ask Marcus</span></p><p style={{ ...para, color: C.mute }}>Nothing here is secret on its own. Together, it&apos;s a map.</p></>), clue: "Marcus is the go-to for the portal" },
];

type Stage =
  | { kind: "board"; title: string; goal: string; sources: Source[]; question: string; placeholder: string; accept: (v: string) => boolean; hint: string; reveal: string }
  | { kind: "intel"; title: string; goal: string; cfg: IntelCfg };

const ACT_STAGES: Stage[] = [
  {
    kind: "board", title: "People", goal: "Stage 1 - Footprint the people. Open each public source, then piece together the new systems admin's most likely login email.",
    sources: SOURCES, question: "What is the new systems admin's most likely login email?", placeholder: "name@calderafreight.range",
    accept: (v) => v.trim().toLowerCase() === "marcus.bell@calderafreight.range",
    hint: "One source gives the email format (first.last@...), another names the admin (Marcus Bell). Combine them.", reveal: "marcus.bell@calderafreight.range",
  },
  {
    kind: "intel", title: "Subdomains", goal: "Stage 2 - Map the infrastructure. Certificate transparency logs list every HTTPS certificate a company ever issued - including subdomains never linked anywhere. Find the internal staff portal.",
    cfg: {
      sourceTag: "CERT TRANSPARENCY", via: "crt.sh · calderafreight.range",
      lines: [{ t: "www.calderafreight.range" }, { t: "mail.calderafreight.range" }, { t: "shop.calderafreight.range" }, { t: "portal.calderafreight.range", leak: true }, { t: "vpn-test.calderafreight.range", leak: true }],
      question: "Which subdomain is the internal staff portal (the sysadmin's target)?", placeholder: "something.calderafreight.range",
      accept: (v) => v.trim().toLowerCase() === "portal.calderafreight.range",
      hint: "Internal tools are usually named portal / admin / vpn. The job ad already named this one.", reveal: "portal.calderafreight.range",
    },
  },
  {
    kind: "intel", title: "Document metadata", goal: "Stage 3 - Mine a document. Caldera published a PDF policy. Files carry hidden metadata - who made them, and sometimes an internal path. Read it and lift the author's username.",
    cfg: {
      sourceTag: "FILE METADATA", via: "Caldera_Fleet_Policy_v3.pdf · properties",
      lines: [{ t: "Title:    Caldera Fleet Policy" }, { t: "Author:   m.bell", leak: true }, { t: "Producer: Microsoft Word 2019" }, { t: "Created:  2026-02-11" }, { t: "Path:     \\\\caldera-fs01\\hr\\drafts\\", leak: true }],
      question: "What is the author's username from the document metadata?", placeholder: "username",
      accept: (v) => v.trim().toLowerCase() === "m.bell",
      hint: "The Author field holds it: m.bell (and note it matches Marcus Bell - a second login format to try).", reveal: "m.bell",
    },
  },
  {
    kind: "intel", title: "Leaked secret", goal: "Stage 4 - Dork out a leak. Developers paste things they shouldn't. Use a precise search to surface a leaked config file, and read the password it exposes.",
    cfg: {
      sourceTag: "SEARCH RESULT", via: "paste.range/x8f2 · 'caldera test creds'",
      search: { placeholder: "try a search operator, e.g. filetype:env calderafreight", match: (q) => /filetype:|\.env|password|cred|calderafreight/i.test(q), dork: "calderafreight filetype:env password" },
      lines: [{ t: "# caldera test environment" }, { t: "DB_HOST=portal.calderafreight.range" }, { t: "SMTP_USER=m.bell" }, { t: "SMTP_PASS=Caldera_Test!23", leak: true }],
      question: "What password did the leaked paste expose?", placeholder: "the leaked password",
      accept: (v) => v.trim() === "Caldera_Test!23",
      hint: "The SMTP_PASS line holds it: Caldera_Test!23 - a real credential, pasted in public.", reveal: "Caldera_Test!23",
    },
  },
];

function StageView({ stage, onSolved }: { stage: Stage; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(stage.goal, `stage-${stage.title}`)}</div>
      {stage.kind === "board"
        ? <SourceBoard sources={stage.sources} question={stage.question} placeholder={stage.placeholder} accept={stage.accept} hint={stage.hint} reveal={stage.reveal} onSolved={onSolved} />
        : <IntelSurface cfg={stage.cfg} onSolved={onSolved} />}
    </div>
  );
}

function ReconAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STAGES.map(() => false));
  const stage = ACT_STAGES[si];
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { if (si + 1 < ACT_STAGES.length) setSi(si + 1); else onCapture(); }
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
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STAGES.length ? "Next source →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: combine the clues ───────────────────────── */

function CombineLab({ onDone }: { onDone: () => void }) {
  const [v, setV] = useState("");
  const ok = v.trim().toLowerCase() === "jordan.vale@acme.range";
  useEffect(() => { if (ok) onDone(); }, [ok, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · two harmless posts, one real login</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.6, marginBottom: 10 }}>Neither post is a secret on its own. Combine them to derive the new hire&apos;s login email.</div>
      <div style={{ fontFamily: MONO, fontSize: 12.5, color: "#8fa0c8", background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "10px 12px", lineHeight: 1.7, marginBottom: 10 }}>
        about page: emails look like first.last@acme.range<br />new starter: &quot;excited to be Acme&apos;s new analyst!&quot; - Jordan Vale
      </div>
      <input style={inp} value={v} onChange={(e) => setV(e.target.value)} placeholder="derive the email: name@acme.range" />
      {ok && <div style={{ marginTop: 11, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>That&apos;s it. No system was touched - you built a valid login out of two public posts. That is <b>OSINT</b>.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: pick what reduces exposure ───────────────────────── */

function PickExposureFixLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [opts] = useState(() => shuffle([
    { code: "Publish a 'meet the team' page listing everyone's personal emails", ok: false, why: "This hands an attacker the email scheme and named targets - exactly the start of what you just did." },
    { code: "Name the internal staff-portal URL in a public job advert", ok: false, why: "That advertises your attack surface. Keep internal hostnames out of anything public." },
    { code: "Use role-based addresses, keep internal URLs private, and scrub metadata", ok: true, why: "Remove the email pattern (so no it@/careers@ leaks a format), the named URL and the leaked metadata, and the attacker's easy derivation stops working. This is the fix." },
    { code: "Ask staff to set their personal LinkedIn profiles to private", ok: false, why: "Helps a little, but it doesn't touch the guessable email scheme, the exposed portal URL or the document metadata an attacker actually used." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · which choice shrinks the footprint?</div>
      <div style={{ display: "grid", gap: 8 }}>
        {opts.map((o, i) => {
          const isP = picked === i;
          return (
            <div key={i}>
              <button onClick={() => { setPicked(i); if (o.ok) onDone(); }} className="co-opt" style={{ width: "100%", textAlign: "left", padding: "10px 12px", borderRadius: 9, border: `1px solid ${isP ? (o.ok ? C.green : C.red) : C.line}`, background: isP ? (o.ok ? "rgba(85,217,140,.08)" : "rgba(242,109,114,.06)") : C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: "pointer", lineHeight: 1.4 }}>
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
    client: "Brightpost Media",
    brief: "Brightpost's site names its people and its email format. Derive the editor's login. No walkthrough.",
    stages: [{ kind: "board", title: "People", goal: "Derive the editor's login email.", sources: [
      { tag: "WEBSITE", via: "brightpost.range/team", title: "Our team", body: (<p style={{ ...para, fontFamily: MONO, color: C.indigo2 }}>Reach us: j.doe@brightpost.range (initial.last)</p>), clue: "Scheme = initial.last@brightpost.range" },
      { tag: "SOCIAL", via: "public post", title: "Aisha Rahman", body: (<p style={para}>Proud to be Brightpost&apos;s new <b style={{ color: C.ink }}>Editor</b>.</p>), clue: "Aisha Rahman is the new editor" },
    ], question: "The editor's login email?", placeholder: "x@brightpost.range", accept: (v) => v.trim().toLowerCase() === "a.rahman@brightpost.range", hint: "initial.last: a.rahman@brightpost.range", reveal: "a.rahman@brightpost.range" }],
    success: "Derived a valid login from two public pages - no system touched. Finding logged.",
  },
  {
    client: "Tideway Council",
    brief: "Tideway's certificate transparency log lists a subdomain they forgot about. Find the test/admin one.",
    stages: [{ kind: "intel", title: "Subdomains", goal: "Find the exposed non-production subdomain.", cfg: { sourceTag: "CERT TRANSPARENCY", via: "crt.sh · tideway.range", lines: [{ t: "www.tideway.range" }, { t: "pay.tideway.range" }, { t: "staging-admin.tideway.range", leak: true }], question: "Which subdomain shouldn't be public?", placeholder: "x.tideway.range", accept: (v) => v.trim().toLowerCase() === "staging-admin.tideway.range", hint: "staging / admin names leak internal tools: staging-admin.tideway.range", reveal: "staging-admin.tideway.range" } }],
    success: "Found a staging admin host in the public certificate logs - never linked, still exposed. Finding logged.",
  },
  {
    client: "Flux Fitness",
    brief: "A Flux PDF leaks more than its contents. Pull the author's username from its metadata. Trickier.",
    stages: [{ kind: "intel", title: "Metadata", goal: "Lift the author's username from the file metadata.", cfg: { sourceTag: "FILE METADATA", via: "Flux_Pricing.pdf · properties", lines: [{ t: "Title:   Pricing 2026" }, { t: "Author:  k.obrien", leak: true }, { t: "Company: Flux Fitness" }], question: "The author's username?", placeholder: "username", accept: (v) => v.trim().toLowerCase() === "k.obrien", hint: "The Author field: k.obrien", reveal: "k.obrien" } }],
    success: "Recovered a staff username straight from a public document's metadata. Finding logged.",
  },
  {
    client: "Oakline Store",
    brief: "The full field job to finish on. Oakline exposes a subdomain AND a dev pasted a secret. Find the subdomain, then dork out the leaked key. Chain it yourself.",
    stages: [
      { kind: "intel", title: "Subdomain", goal: "Step 1: find the internal subdomain in the cert logs.", cfg: { sourceTag: "CERT TRANSPARENCY", via: "crt.sh · oakline.range", lines: [{ t: "shop.oakline.range" }, { t: "internal-api.oakline.range", leak: true }], question: "Which subdomain is internal?", placeholder: "x.oakline.range", accept: (v) => v.trim().toLowerCase() === "internal-api.oakline.range", hint: "internal-api.oakline.range", reveal: "internal-api.oakline.range" } },
      { kind: "intel", title: "Leaked key", goal: "Step 2: dork out the pasted config and read the API key.", cfg: { sourceTag: "SEARCH RESULT", via: "paste.range/k2a · 'oakline test'", search: { placeholder: "filetype:env oakline", match: (q) => /filetype:|\.env|oakline|key|cred/i.test(q), dork: "oakline filetype:env" }, lines: [{ t: "API_HOST=internal-api.oakline.range" }, { t: "API_KEY=ok_live_9fA2bC7dE1", leak: true }], question: "The leaked API key?", placeholder: "the key", accept: (v) => v.trim() === "ok_live_9fA2bC7dE1", hint: "API_KEY line: ok_live_9fA2bC7dE1", reveal: "ok_live_9fA2bC7dE1" } },
    ],
    success: "Mapped a hidden subdomain then dorked out a live API key - the full recon chain, unguided. Finding logged.",
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
  { kind: "board", title: "People", goal: "Sableline Group is your target. Read the public sources and derive the IT lead's login email.", sources: [
    { tag: "WEBSITE", via: "sableline.range/about", title: "Leadership", body: (<p style={{ ...para, fontFamily: MONO, color: C.indigo2 }}>press@sableline.range · format: first.last@sableline.range</p>), clue: "Scheme = first.last@sableline.range" },
    { tag: "SOCIAL", via: "public post", title: "Elena Ruiz", body: (<p style={para}>Excited to lead IT at <b style={{ color: C.ink }}>Sableline Group</b>.</p>), clue: "Elena Ruiz leads IT" },
  ], question: "The IT lead's login email?", placeholder: "x@sableline.range", accept: (v) => v.trim().toLowerCase() === "elena.ruiz@sableline.range", hint: "first.last: elena.ruiz@sableline.range", reveal: "elena.ruiz@sableline.range" },
  { kind: "intel", title: "Subdomain", goal: "Find Sableline's internal console in the cert logs.", cfg: { sourceTag: "CERT TRANSPARENCY", via: "crt.sh · sableline.range", lines: [{ t: "www.sableline.range" }, { t: "console.sableline.range", leak: true }], question: "The internal subdomain?", placeholder: "x.sableline.range", accept: (v) => v.trim().toLowerCase() === "console.sableline.range", hint: "console.sableline.range", reveal: "console.sableline.range" } },
  { kind: "intel", title: "Leaked secret", goal: "Finish it: dork out the pasted secret and read the password.", cfg: { sourceTag: "SEARCH RESULT", via: "paste.range/s9 · 'sableline test'", search: { placeholder: "filetype:env sableline", match: (q) => /filetype:|\.env|sableline|password|cred/i.test(q), dork: "sableline filetype:env" }, lines: [{ t: "HOST=console.sableline.range" }, { t: "USER=elena.ruiz" }, { t: "PASS=Sab1eline_Dev!", leak: true }], question: "The leaked password?", placeholder: "the password", accept: (v) => v.trim() === "Sab1eline_Dev!", hint: "PASS line: Sab1eline_Dev!", reveal: "Sab1eline_Dev!" } },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  function solved() { if (phase + 1 < CAP_STAGES.length) setTimeout(() => setPhase((p) => p + 1), 650); else setWon(true); }
  const pct = (phase / CAP_STAGES.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full recon · step {Math.min(phase + 1, CAP_STAGES.length)} of {CAP_STAGES.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StageView key={phase} stage={CAP_STAGES[phase]} onSolved={solved} />}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}recon_full_f00tpr1nt{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>People, infrastructure, then a leaked secret - a full footprint built from public sources alone, nothing touched.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE2: ModuleDef = {
  code: "M-02",
  moduleNo: 2,
  title: "Reconnaissance & OSINT",
  client: "Caldera Freight",
  brief:
    "A deep engagement in pure reconnaissance - don't touch their systems at all. Caldera Freight wants to know how exposed they are before a new portal goes live. The full job, all from public sources: piece together the admin's login from people-intel, find the internal portal in the certificate-transparency logs, lift a username from a leaked document's metadata, then dork out a password a developer pasted in public. Then four field jobs for new clients, and a final challenge you run start to finish. Everything is modelled in your browser; nothing leaves your machine, and you never touch the target.",
  industry: {
    tag: "Before a single exploit, the attacker does their homework, and most of it is just public.",
    motif: { pre: "crt.sh -> ", hit: "staging-admin.caldera.range", note: "an internal portal nobody linked, found in public cert logs" },
    primer: {
      term: "OSINT",
      what: "OSINT is open-source intelligence: everything you can learn about a target from public sources, with no break-in at all. Company sites, social media, job ads, certificate logs, leaked files, document metadata. Attackers do this homework first, because the more they know, the easier everything after it becomes.",
      example: 'filetype:env "API_KEY"',
      returns: "That single search hunts for config files people accidentally left public, passwords and all. Recon turns scattered public clues into a map of who works there, what systems they run, and where the soft spots are, which is exactly what you will do here.",
    },
    learn: [
      "Footprint the people and piece together an admin's likely login email.",
      "Map infrastructure through certificate-transparency logs to find an unlinked internal portal.",
      "Mine a published document's hidden metadata for an internal username.",
      "Dork out a config file a developer pasted in public, and read the password.",
    ],
    engines: [
      { name: "Google dorking", color: "#4285F4", blurb: "Precise search operators (site:, filetype:, intitle:) that surface files nobody meant to leave public.", here: true, icon: "scan" },
      { name: "Shodan", color: "#e5392f", blurb: "A search engine for internet-connected devices: cameras, servers and databases exposed online.", icon: "server" },
      { name: "theHarvester", color: "#4ade80", blurb: "Gathers emails, subdomains and employee names about a target from public sources.", icon: "mail" },
      { name: "Maltego", color: "#5fe6ff", blurb: "Maps the links between people, emails, domains and companies on a visual graph.", icon: "scan" },
      { name: "Have I Been Pwned", color: "#ffb347", blurb: "Checks whether an email or password has already appeared in a known breach.", icon: "key" },
    ],
    headline: {
      masthead: "THE OPEN LEDGER",
      dateline: "2020 · US REGULATOR (NY DFS) REPORT + COURT RECORD",
      title: "A 17-year-old talked his way into the world's biggest Twitter accounts",
      body: "The attackers didn't break any code. They researched Twitter's staff, phoned them pretending to be IT support, and talked employees into handing over logins, then used that access to seize verified accounts, Obama, Musk, Apple and more, and post a Bitcoin scam. 130 accounts were targeted and victims sent over $118,000. The ringleader was 17.",
      stat: "130",
      statLabel: "TOP ACCOUNTS HIJACKED, NO MALWARE USED",
      why: "No exploit and no virus, just research and a phone call. Most attacks start exactly here, with public homework on people, which is why learning what you leak is worth your time.",
    },
    realWorld:
      "Reconnaissance is the quiet first phase of almost every attack: before touching a system, an attacker gathers everything public about it, staff names and emails, subdomains, exposed services, files and their metadata, leaked secrets. None of it is illegal to collect, and together it hands them the map for everything that follows. Knowing what your own side leaks is the first defence.",
    now: {
      stat: "68%",
      statLabel: "of breaches involve a human element (Verizon DBIR)",
      body: "Reconnaissance is the opening phase on the industry's attack map, MITRE ATT&CK (tactic TA0043). And it feeds the human side of attacks: Verizon's 2024 report found 68% of breaches involved a non-malicious human element, exactly the staff, mistakes and stolen logins that public recon targets first.",
    },
    recent: {
      year: "2024",
      title: "Billions of records, scraped into one file",
      body: "In 2024 a background-check broker called National Public Data was found to have built its database by scraping personal information, and it leaked: around 2.9 billion records including names, addresses and Social Security numbers. (That record count overstates the people affected, a useful reminder to check claimed numbers.) It shows how scattered public data gets aggregated into a ready-made profile of almost everyone.",
    },
    ahead:
      "AI collapses the slowest part of an attack: the research. Security teams have shown tools that read a person's public profile and auto-write a convincing, tailored phishing message in minutes, and language models can profile a target's whole public footprint at a scale no human could match. Add voice and face matching from scraped photos, and an attacker can impersonate someone from public data alone. Knowing, and limiting, what you expose matters more every year.",
    role:
      "This is day-one knowledge for penetration testers, OSINT analysts and threat-intelligence analysts. The best operators win the engagement in recon, before they touch a thing.",
    roles: ["Penetration tester", "OSINT analyst", "Threat intelligence analyst", "SOC analyst"],
  },
  lesson: {
    blocks: [
      { h: "Recon comes first, always", body: "Before any real test, an operator maps the target. Reconnaissance is gathering information about a system or organisation. The more you know going in, the less you have to touch, and the less you touch, the quieter and safer you are. Every professional engagement starts here, building a footprint of everything the target exposes." },
      { h: "Passive vs active", body: "Passive recon means reading information that is already public - a website, a job advert, a social post, a document - without ever interacting with the target's systems. Active recon means poking the target directly, like scanning ports or probing a login. Passive is invisible and, because you only read what is public, it stays firmly in bounds. This whole module is passive." },
      { h: "OSINT on people", body: "Open-source intelligence is built from publicly available sources. Start with people: an About page reveals the email format, a job ad names roles, and a proud new-starter post names a specific admin. No single post is a secret, but together they let a stranger derive a real login without touching a thing. The leak is the pattern, not any one piece." },
      { h: "OSINT on infrastructure", body: "Next, the systems. DNS records and certificate transparency logs - public records of every HTTPS certificate ever issued - list a company's subdomains, including internal tools like portal or admin that were never linked anywhere. An unlinked subdomain is not hidden; it is one public log away from being found, mapping the attack surface before you ever connect." },
      { h: "OSINT in documents and leaks", body: "Finally, the accidents. Published files carry hidden metadata - the author's username, the software, sometimes an internal file path. And developers paste secrets to public sites; a precise search (a Google dork using operators like filetype:) surfaces leaked config files and the passwords and keys inside them. Put people, infrastructure and leaks together and you have a complete way in - all before a single packet is aimed at the target." },
    ],
    Interactive: CombineLab,
    summary: [
      "Reconnaissance comes first; the more you learn passively, the less you have to touch.",
      "Passive recon reads only public info and never touches the target, so it's invisible and in-scope.",
      "People-OSINT: an email format plus a named new hire derives a valid login.",
      "Infrastructure-OSINT: certificate transparency logs expose internal subdomains that were never linked.",
      "Documents and dorks leak usernames (metadata) and secrets (pasted config); the whole picture is the risk.",
    ],
    check: {
      q: "Why is passive recon considered low-risk and in-scope?",
      options: [
        { text: "You only read information that's already public and never interact with the target's systems.", correct: true, feedback: "Right. Reading public sources touches nobody's systems, so it's invisible and stays in bounds." },
        { text: "It runs too slowly for the target's monitoring to ever notice you doing it.", feedback: "Speed isn't the point - it's that you never touch the target at all." },
        { text: "The company quietly handed over their account passwords to you in advance.", feedback: "No passwords are involved - OSINT is built entirely from what's already public." },
        { text: "It only turns into active recon once you've read more than one public source.", feedback: "Reading any number of public sources is still passive; it's touching the target's systems that makes it active." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "Caldera Freight - public footprint only",
    inScope: "anything publicly published: site, job ads, social, certificate logs, documents, paste sites; the consolidation clients named in each drill",
    offLimits: "their portal and any system - do not log in or probe; nothing active",
    timebox: "this session",
  },
  handler: "Four sources, four field jobs, then one full challenge, all hands-off. Derive the admin's login from the people-intel board, find the internal portal in the certificate-transparency log, lift the author's username from the leaked PDF's metadata, then dork out the password a developer pasted. Try each yourself before the hints. You never touch their systems - you only read what's already public.",
  hint: "Work the sources in order. On the board, combine the email format with the admin's name. For the subdomain, the job ad already named it. For metadata, read the Author field. For the leak, search with an operator like filetype:env plus the company name.",
  plan: [
    { label: "Footprint people", goal: "Read the public sources and piece together the new admin's most likely login email." },
    { label: "Map infrastructure", goal: "Search certificate-transparency logs for a staff portal subdomain nobody ever linked." },
    { label: "Mine a document", goal: "Read a published PDF's hidden metadata and lift the author's internal username." },
    { label: "Dork out a leak", goal: "Use a precise search to surface a pasted config file and read the password it exposes." },
  ],
  Act: ReconAct,
  flag: "flag{0s1nt_full_f00tpr1nt}",
  defend: {
    blocks: [
      { h: "Shrink the public footprint", body: "You cannot un-publish the internet, but you can give it less. Use role-based addresses (careers@, it@) instead of exposing a guessable personal-email format. Keep internal URLs like admin portals out of public job ads. Scrub metadata from documents before publishing them, so they stop leaking usernames and internal paths. And brief staff that a cheerful 'new sysadmin!' post is genuinely useful to an attacker." },
      { h: "Watch the places you leak", body: "Much of this hides in records you don't control directly. Monitor certificate transparency logs for subdomains you forgot were public, and scan paste sites and code repositories for your own company name, hostnames and keys. Rotate any secret the moment it appears somewhere public - assume a pasted credential is already compromised." },
      { h: "Assume you're being mapped", body: "Every organisation worth attacking is footprinted this way first. Defenders do the same recon on themselves - searching for what leaks - so they can close it before someone hostile finds it. What you did for Caldera is exactly what a blue team does on day one: find the exposure, then reduce it." },
    ],
    Interactive: PickExposureFixLab,
    check: {
      q: "What most directly stops an attacker deriving a valid login and target from public info?",
      options: [
        { text: "Use role-based email addresses, keep internal portal URLs out of public ads, and scrub document metadata.", correct: true, feedback: "Right - remove the pattern, the named URL and the leaked metadata, and the easy derivation stops working." },
        { text: "Make the public website load faster and compress its images to save bandwidth.", feedback: "Performance has nothing to do with what the site reveals." },
        { text: "Ask all employees to choose much longer and more complex account passwords.", feedback: "Good hygiene, but it doesn't stop an attacker learning a valid username and where to use it." },
        { text: "Add a cookie-consent banner and a privacy policy link to the public site.", feedback: "That's a privacy notice, not a change to what you expose; the email scheme and subdomains still leak." },
      ],
    },
  },
  finding: {
    title: "Excessive exposure via public sources (OSINT)",
    where: "Caldera Freight · website, job ads, social posts, certificate logs, document metadata, paste sites",
    severity: "Medium",
    cvss: "6.5",
    impact: "The email scheme, the internal portal URL, the admin's identity and username, and a live test password are all derivable from public sources alone. An attacker can build a complete footprint - a valid login at a named portal, with a working credential - without ever touching a Caldera system.",
    fix: "Use role-based email addresses; keep internal URLs out of public ads; scrub document metadata; monitor certificate-transparency and paste sites for leaks and rotate any exposed secret; footprint yourself regularly.",
  },
  cheatsheet: {
    title: "Recon & OSINT quick reference",
    blurb: "Where an attacker's clues live, what they build from them, and how to shrink your own footprint, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "None of this is a break-in. It is all public, and it all adds up. Here are three everyday sources and what each one quietly hands over.",
      cols: ["public source", "what you pull from it", "why it helps an attacker"],
      rows: [
        ["staff on LinkedIn", "names + the email pattern", "guess anyone's login: first.last@"],
        ["crt.sh (cert logs)", "every subdomain ever certified", "finds staging/admin sites linked nowhere"],
        ["a published PDF", "author, software, internal paths", "usernames the company never meant to share"],
      ],
    },
    groups: [
      {
        heading: "Where the clues live",
        entries: [
          { code: "search dorks", what: "Precise operators (site:, filetype:, intitle:) surface files and pages nobody meant to leave public.", example: 'filetype:env "API_KEY" -> leaked configs' },
          { code: "certificate transparency", what: "Public logs of every HTTPS certificate a company issues, so every subdomain is discoverable.", example: "crt.sh lists staging-admin.target.range" },
          { code: "document metadata", what: "Files carry hidden info: author, software, sometimes internal file paths.", example: "a PDF's Author field = an internal username" },
          { code: "breach data", what: "Past breaches are searchable, so an email or password may already be public.", example: "Have I Been Pwned shows which breaches hit an address" },
        ],
      },
      {
        heading: "What it builds",
        entries: [
          { code: "email pattern", what: "One known email reveals the format, so you can guess everyone's.", example: "j.smith@ -> every staff login" },
          { code: "attack surface", what: "The full list of a target's domains, subdomains and exposed services.", example: "the forgotten staging site with weaker security" },
          { code: "the human map", what: "Who works there, their roles, and who to impersonate or phish.", example: "the new IT admin, still finding their feet" },
          { code: "a leaked secret", what: "A pasted key, password or config found in public is an instant way in.", example: "a .env file with a live password" },
        ],
      },
      {
        heading: "Shrinking your footprint (the defence)",
        entries: [
          { code: "publish less", what: "Don't put internal hostnames, emails or org charts in public where you don't have to.", example: "keep staging-admin.* out of public certs where you can" },
          { code: "scrub metadata", what: "Strip author and path metadata from files before you publish them.", example: "clear document properties on export" },
          { code: "scan yourself", what: "Run the same recon on your own org to find what leaks, before an attacker does.", example: "dork your own domain for exposed .env files" },
          { code: "rotate leaked secrets", what: "Treat any key that has touched public code as compromised, and rotate it.", example: "a key seen in a paste -> revoke and reissue" },
        ],
      },
    ],
  },
  takeaway: "Anything a company puts in public can be stitched into a way in. If it is out there, assume an attacker already has it.",
  outcome: [
    "Build a valid staff login from public sources alone - pairing an email format on an About page with a name from a new-starter post, without touching a thing.",
    "Surface internal subdomains that were never linked anywhere by reading a company's certificate-transparency logs.",
    "Lift an author's username from a published document's metadata, and dork out a pasted secret with a precise operator like 'filetype:env'.",
    "Tell passive recon apart from active - and explain why reading only already-public sources stays invisible and in scope.",
  ],
  rep: 30,
  repRank: "Recruit",
  repTo: "55 / 100 to Junior Operator",
  next: "NEXT MODULE · The Web Surface →",
};

export default function Module2() {
  return <Engagement mod={MODULE2} />;
}
