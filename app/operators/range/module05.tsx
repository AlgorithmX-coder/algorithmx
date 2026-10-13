"use client";

/* Module 5 - Injection (DEPTH STANDARD v2).
 *
 * The full engagement, roughly doubled, built to the standard the owner set
 * from UAT: hover/tap glossary on every technical term, de-biased + tougher
 * checks (shuffled in the shell), a deeper taught lesson with a recap, a
 * five-stage capture (probe -> bypass -> extract staff -> enumerate the schema
 * -> crack the vault), and TWO scenario-based consolidation drills on fresh
 * clients. All injection runs for real against wasm SQLite, zero egress. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary } from "./Engagement";
import {
  bootNorthwindRange, bootScenario,
  type NorthwindRange, type ScenarioRange, type ScenarioSpec, type RangeRunResult,
} from "./engine";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "database", definition: "A giant, organised store of information - picture a stack of spreadsheets the website reads from and writes to." },
  { term: "query", definition: "A question the app asks the database, written in SQL - like 'give me the user whose email is this'." },
  { term: "SQL", definition: "Structured Query Language - the language websites use to talk to their database." },
  { term: "injection", definition: "Sneaking your own commands into an app's input so they run as code instead of being treated as plain text." },
  { term: "payload", definition: "The crafted input you send to pull off an attack - your 'ammo'." },
  { term: "parameterised query", definition: "The safe way to talk to a database: the query has blanks, and your input is slotted in as pure data that can never run as commands." },
  { term: "UNION", definition: "A SQL move that staples a second query's results onto the first - letting you pull data from a whole different table." },
  { term: "column", definition: "One field in a table - like a single column in a spreadsheet, e.g. 'email'." },
  { term: "table", definition: "A set of same-shaped rows in a database - like one sheet in a spreadsheet, e.g. the 'users' table." },
  { term: "schema", definition: "The blueprint of a database: the list of its tables and what columns each one has." },
  { term: "hash", definition: "A scrambled fingerprint of a password. One-way by design: easy to make, meant to be impossible to reverse." },
  { term: "authentication", definition: "Proving you are who you say you are - usually with a password. The front door of an app." },
  { term: "enumerate", definition: "To list things out one by one - here, discovering what tables and columns a database has." },
  { term: "syntax error", definition: "The database complaining that your query is written wrong - often a clue that it's taking your input literally." },
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

function ResultView({ r }: { r: RangeRunResult }) {
  return (
    <div style={{ marginTop: 14, background: C.carbon, border: `1px solid ${r.error ? C.red : C.line}`, borderRadius: 10, padding: "12px 14px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".12em", color: C.mute, marginBottom: 6 }}>QUERY THAT RAN</div>
      <pre style={{ margin: 0, fontFamily: MONO, fontSize: 11.5, color: "#8fa0c8", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{r.sql}</pre>
      {r.error ? (
        <div style={{ marginTop: 9, fontFamily: MONO, fontSize: 12.5, color: C.red }}>⚠ SQL error · {r.error}</div>
      ) : r.rows.length === 0 ? (
        <div style={{ marginTop: 9, fontFamily: MONO, fontSize: 12.5, color: C.mute }}>0 rows returned</div>
      ) : (
        <div style={{ marginTop: 10, overflowX: "auto" }}>
          <table style={{ borderCollapse: "collapse", fontFamily: MONO, fontSize: 12 }}>
            <thead><tr>{r.columns.map((c, i) => <th key={i} style={{ textAlign: "left", padding: "4px 12px 6px 0", color: C.indigo2, borderBottom: `1px solid ${C.lineSoft}` }}>{c}</th>)}</tr></thead>
            <tbody>
              {r.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j} style={{ padding: "4px 12px 4px 0", color: String(cell).startsWith("flag{") ? C.green : C.soft, whiteSpace: "nowrap" }}>{String(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Palette({ tokens, onInsert }: { tokens: string[]; onInsert: (t: string) => void }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.mute, marginBottom: 7 }}>PAYLOAD PIECES · tap to add</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {tokens.map((t) => (
          <button key={t} onClick={() => onInsert(t)} className="co-opt" style={{ padding: "5px 9px", borderRadius: 7, border: `1px solid ${C.line}`, background: C.panel, color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", whiteSpace: "pre" }}>{t.trim()}</button>
        ))}
      </div>
    </div>
  );
}

function HintLadder({ hints, onReveal }: { hints: string[]; onReveal: () => void }) {
  const [shown, setShown] = useState(0);
  return (
    <div style={{ marginTop: 12 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <div key={i} style={{ marginBottom: 6, padding: "9px 12px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13, color: C.soft, lineHeight: 1.5 }}>{hints[i]}</div>
      ))}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        {shown < hints.length && <button onClick={() => setShown(shown + 1)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{shown === 0 ? "hint" : "another hint"}</button>}
        {shown >= hints.length && <button onClick={onReveal} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>stuck? reveal the payload</button>}
      </div>
    </div>
  );
}

/* ───────────────────────── lesson lab ───────────────────────── */

function InputBecomesCodeLab({ onDone }: { onDone: () => void }) {
  const [val, setVal] = useState("");
  const broke = val.includes("'");
  useEffect(() => { if (broke) onDone(); }, [broke, onDone]);
  const before = `SELECT * FROM users WHERE email = '`;
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · watch your input land inside the query</div>
      <label style={lab}>type an email… then try typing a single quote &apos;</label>
      <input style={inp} value={val} onChange={(e) => setVal(e.target.value)} placeholder="you@example.com" />
      <pre style={{ marginTop: 12, marginBottom: 0, fontFamily: MONO, fontSize: 12.5, whiteSpace: "pre-wrap", lineHeight: 1.7, color: "#8fa0c8" }}>
        {before}
        <span style={{ color: broke ? C.red : C.amber, background: broke ? "rgba(242,109,114,.12)" : "rgba(232,163,61,.12)", borderRadius: 3, padding: "0 2px" }}>{val || " "}</span>
        {`' AND pass = '…'`}
      </pre>
      {broke && (
        <div style={{ marginTop: 11, padding: "10px 13px", borderRadius: 9, background: "rgba(242,109,114,.08)", border: `1px solid ${C.red}55`, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>
          See it? Your <b style={{ fontFamily: MONO }}>&apos;</b> closed the string early. Everything after it is now read as <b>commands, not data</b>. That&rsquo;s the whole of injection - and you just did it.
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── defend lab ───────────────────────── */

function PickSafeQueryLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opts = [
    { code: `"… WHERE email = '" + email + "'"`, ok: false, why: "This is the bug itself - gluing input into the string. Exactly what you just exploited." },
    { code: `"… WHERE email = '" + email.replace("'", "") + "'"`, ok: false, why: "Stripping quotes is a blocklist - bypassable, and it still builds the query by hand. Not the real fix." },
    { code: `"… WHERE email = ?"  +  bind([email])`, ok: true, why: "Parameterised: the ? is a placeholder and the value is sent separately, so the database treats it as data - never as SQL. This is the fix." },
  ];
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · which login query is safe?</div>
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

/* ───────────────────────── the 5-stage capture ───────────────────────── */

type Stage = {
  key: string; title: string; surface: "login" | "search"; goal: string;
  tokens: string[]; hints: string[]; reveal: string;
  done: (r: RangeRunResult & { authed?: boolean }, range: NorthwindRange) => boolean;
};

const STAGES: Stage[] = [
  {
    key: "probe", title: "Probe", surface: "login",
    goal: "Confirm the login is injectable. Make it error by breaking the query - put a single quote in the email and log in. A syntax error means it's taking your input literally.",
    tokens: ["'"],
    hints: ["A valid query won't error. Feed it something that breaks the SQL syntax.", "Put a single quote ' in the email field and submit. The extra quote makes the query invalid and it throws."],
    reveal: "'", done: (r) => r.error != null,
  },
  {
    key: "bypass", title: "Bypass", surface: "login",
    goal: "Log in with no password. Close the string, add an always-true condition, and comment out the password check.",
    tokens: ["'", " OR 1=1", "--"],
    hints: ["Start by closing the string with a quote, like the probe.", "After the quote, add a condition that's always true: OR 1=1", "Finish with -- to comment out the rest of the line. Put it in the EMAIL field; leave the password blank."],
    reveal: "' OR 1=1--", done: (r) => !!r.authed,
  },
  {
    key: "staff", title: "Extract staff", surface: "search",
    goal: "The product search is injectable too. Use a UNION to pull the whole staff table (email, pass, role) out through it.",
    tokens: ["'", " UNION SELECT ", "email", "pass", "role", ",", " FROM users", "--", " ORDER BY 3", " ORDER BY 4"],
    hints: ["Your UNION must return the SAME number of columns as the search. Try ' ORDER BY 4-- then ' ORDER BY 3-- to find how many.", "The search returns 3 columns. So: ' UNION SELECT (three things) FROM users--", "Pull the useful three: ' UNION SELECT email, pass, role FROM users--"],
    reveal: "' UNION SELECT email, pass, role FROM users--",
    done: (r) => r.rows.some((row) => row.some((c) => typeof c === "string" && c.endsWith("@northwind.range"))),
  },
  {
    key: "enumerate", title: "Map the schema", surface: "search",
    goal: "You don't know what else is in the database yet. Every SQLite database lists its own tables in a built-in table called sqlite_master - UNION it out to enumerate the schema and find what's hidden.",
    tokens: ["'", " UNION SELECT ", "name", "sql", "type", ",", " FROM sqlite_master", "--"],
    hints: ["Same UNION, 3 columns again - but this time SELECT from sqlite_master.", "Try: ' UNION SELECT name, sql, type FROM sqlite_master-- and read the table names that come back. One of them is interesting."],
    reveal: "' UNION SELECT name, sql, type FROM sqlite_master--",
    done: (r) => r.rows.some((row) => row.some((c) => c === "secrets")),
  },
  {
    key: "vault", title: "Crack the vault", surface: "search",
    goal: "You found a secrets table. UNION it out the same way to capture the flag.",
    tokens: ["'", " UNION SELECT ", "label", "value", "NULL", ",", " FROM secrets", "--"],
    hints: ["Same trick, the secrets table. Still three columns.", "secrets has label and value. Pad the third with NULL: ' UNION SELECT label, value, NULL FROM secrets--"],
    reveal: "' UNION SELECT label, value, NULL FROM secrets--",
    done: (r, range) => r.rows.some((row) => row.some((c) => c === range.vaultFlag)),
  },
];

function InjectionAct({ onCapture }: { onCapture: () => void }) {
  const [range, setRange] = useState<NorthwindRange | null>(null);
  const [bootErr, setBootErr] = useState("");
  const [si, setSi] = useState(0);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [term, setTerm] = useState("");
  const [res, setRes] = useState<(RangeRunResult & { authed?: boolean }) | null>(null);
  const [cleared, setCleared] = useState<boolean[]>(STAGES.map(() => false));

  useEffect(() => {
    let live = true;
    bootNorthwindRange().then((r) => live && setRange(r)).catch((e) => live && setBootErr((e as Error).message));
    return () => { live = false; };
  }, []);

  if (bootErr) return <div style={{ fontFamily: MONO, fontSize: 13, color: C.red }}>Range failed to boot: {bootErr}</div>;
  if (!range) return <div style={{ fontFamily: MONO, fontSize: 13, color: C.mute }}>// booting range target… (real SQLite, in-browser)</div>;

  const stage = STAGES[si];
  const field = stage.surface === "login" ? email : term;
  const setField = stage.surface === "login" ? setEmail : setTerm;

  function run() {
    if (!range) return;
    const r = stage.surface === "login" ? range.attemptLogin(email, pass) : range.search(term);
    setRes(r);
    if (stage.done(r, range)) { const n = [...cleared]; n[si] = true; setCleared(n); }
  }
  function advance() {
    setRes(null);
    if (si + 1 < STAGES.length) setSi(si + 1);
    else onCapture();
  }

  const stageCleared = cleared[si];
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STAGES.map((s, i) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? C.indigo : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? C.indigo2 : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{s.title}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>
        <b style={{ color: C.indigo2, fontFamily: DISP }}>Stage {si + 1} · {stage.title}. </b>{G(stage.goal, `stage-${stage.key}`)}
      </div>

      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        <WinBar host={stage.surface === "login" ? "portal.northwind.range · staff login" : "shop.northwind.range · product search"} />
        <div style={{ padding: 18 }}>
          {stage.surface === "login" ? (
            <>
              <div style={{ marginBottom: 12 }}><label style={lab}>email</label><input style={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@northwind.range" /></div>
              <div style={{ marginBottom: 14 }}><label style={lab}>password</label><input style={inp} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="(leave blank - go around it)" /></div>
            </>
          ) : (
            <div style={{ marginBottom: 14 }}><label style={lab}>search products</label><input style={inp} value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. oil" /></div>
          )}
          <Palette tokens={stage.tokens} onInsert={(t) => setField(field + t)} />
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
            <Btn tone="i" onClick={run}>{stage.surface === "login" ? "RUN LOGIN →" : "RUN SEARCH →"}</Btn>
            <button onClick={() => setField("")} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>clear</button>
          </div>
          {res && <ResultView r={res} />}
          {!stageCleared && <HintLadder key={stage.key} hints={stage.hints} onReveal={() => setField(stage.reveal)} />}
        </div>
      </div>

      {stageCleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < STAGES.length ? "Next stage →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = {
  client: string; brief: string; surface: "login" | "search"; host: string;
  spec: ScenarioSpec; goal: string; palette: string[]; hint: string; reveal: string;
  done: (r: RangeRunResult & { authed?: boolean }) => boolean; success: string;
};

const DRILLS: DrillCfg[] = [
  {
    client: "Harborlight - children's charity",
    brief: "Harborlight's donor portal goes live Monday. They've asked Redoubt for a quick smoke test of the login first. No step-by-step this time - you've done this move on Northwind. Prove a stranger can't walk in without a password.",
    surface: "login", host: "give.harborlight.range · donor login",
    spec: {
      setup: `CREATE TABLE donors (id INTEGER PRIMARY KEY, email TEXT, pass TEXT, role TEXT);
              INSERT INTO donors (email,pass,role) VALUES
                ('t.ellis@harborlight.range','G1ving!24','admin'),
                ('p.rao@harborlight.range','welcome1','staff');`,
      login: { table: "donors", select: "id, email, role", emailCol: "email", passCol: "pass", adminRole: "admin", roleIdx: 2 },
    },
    goal: "Log into the donor portal with no valid password.",
    palette: ["'", " OR 1=1", "--"],
    hint: "Same front-door move as Northwind: close the string, force it true, comment out the rest. Email field; password blank. ' OR 1=1--",
    reveal: "' OR 1=1--",
    done: (r) => !!r.authed,
    success: "Signed in with no password - Harborlight's login trusts user input exactly like Northwind's did. Finding logged for them.",
  },
  {
    client: "Meridian Library",
    brief: "Meridian Library's public catalogue search sits on the same database as its member records. The library thinks the search box is harmless because 'it only searches books'. Show them a search box is a window onto the whole database.",
    surface: "search", host: "catalogue.meridian.range · book search",
    spec: {
      setup: `CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT);
              INSERT INTO books (title,author) VALUES ('Coding for Teens','A. Price'),('The Web Book','R. Shah');
              CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT, cardno TEXT);
              INSERT INTO members (name,cardno) VALUES ('Jamie Fox','MEM-4471'),('Sara Khan','MEM-8820');`,
      search: { table: "books", select: "id, title, author", searchCol: "title" },
    },
    goal: "UNION the members table out through the book search to read a member's card number.",
    palette: ["'", " UNION SELECT ", "id", "name", "cardno", ",", " FROM members", "--"],
    hint: "The book search returns 3 columns (id, title, author). Match it: ' UNION SELECT id, name, cardno FROM members--",
    reveal: "' UNION SELECT id, name, cardno FROM members--",
    done: (r) => r.rows.some((row) => row.some((c) => typeof c === "string" && c.startsWith("MEM-"))),
    success: "Member records pulled straight out of a 'book' search. Same UNION skill, brand-new target. Finding logged.",
  },
];

function DrillSurface({ cfg, onSolved }: { cfg: DrillCfg; onSolved: () => void }) {
  const [sc, setSc] = useState<ScenarioRange | null>(null);
  const [val, setVal] = useState("");
  const [pass, setPass] = useState("");
  const [res, setRes] = useState<(RangeRunResult & { authed?: boolean }) | null>(null);
  const [solved, setSolved] = useState(false);
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    let live = true;
    bootScenario(cfg.spec).then((s) => live && setSc(s)).catch(() => {});
    return () => { live = false; };
  }, [cfg]);

  function run() {
    if (!sc) return;
    const r = cfg.surface === "login" ? sc.attemptLogin(val, pass) : sc.search(val);
    setRes(r);
    if (cfg.done(r)) { setSolved(true); onSolved(); }
  }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.lineSoft}` }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>{cfg.client}</div>
        <p style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0" }}>{cfg.brief}</p>
        <div style={{ fontSize: 13.5, color: C.indigo2, marginTop: 8 }}>▸ {G(cfg.goal, `drill-${cfg.host}`)}</div>
      </div>
      <WinBar host={cfg.host} />
      <div style={{ padding: 18 }}>
        {cfg.surface === "login" ? (
          <>
            <div style={{ marginBottom: 12 }}><label style={lab}>email</label><input style={inp} value={val} onChange={(e) => setVal(e.target.value)} placeholder="name@…" /></div>
            <div style={{ marginBottom: 14 }}><label style={lab}>password</label><input style={inp} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="(leave blank)" /></div>
          </>
        ) : (
          <div style={{ marginBottom: 14 }}><label style={lab}>search</label><input style={inp} value={val} onChange={(e) => setVal(e.target.value)} placeholder="search…" /></div>
        )}
        <Palette tokens={cfg.palette} onInsert={(t) => setVal(val + t)} />
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Btn tone="i" onClick={run} disabled={!sc}>{cfg.surface === "login" ? "RUN LOGIN →" : "RUN SEARCH →"}</Btn>
          <button onClick={() => setVal("")} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>clear</button>
        </div>
        {res && <ResultView r={res} />}
        {!solved && (
          <div style={{ marginTop: 12, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            {!showReveal ? (
              <button onClick={() => setShowReveal(true)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>hint</button>
            ) : (
              <div style={{ padding: "9px 12px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13, color: C.soft, lineHeight: 1.5 }}>
                {cfg.hint} <button onClick={() => setVal(cfg.reveal)} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>- fill it</button>
              </div>
            )}
          </div>
        )}
        {solved && <div className="co-anim co-pop" style={{ marginTop: 13, padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55`, fontSize: 13, color: "#bff3d3", lineHeight: 1.5 }}>✓ {cfg.success}</div>}
      </div>
    </div>
  );
}

function ConsolidationDrills({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(DRILLS.map(() => false));
  const cfg = DRILLS[i];
  function onSolved() { const n = [...solved]; n[i] = true; setSolved(n); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {DRILLS.map((d, k) => (
          <div key={d.client} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${k === i ? C.indigo : C.lineSoft}`, background: solved[k] ? "rgba(85,217,140,.08)" : k === i ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: solved[k] ? C.green : k === i ? C.indigo2 : C.mute, fontWeight: 700 }}>{solved[k] ? "✓" : `drill ${k + 1}`}</span>
          </div>
        ))}
      </div>
      <DrillSurface key={cfg.client} cfg={cfg} onSolved={onSolved} />
      {solved[i] && (
        <div style={{ display: "flex" }}>
          <Btn tone="g" onClick={() => { if (i + 1 < DRILLS.length) setI(i + 1); else onDone(); }} style={{ marginLeft: "auto" }}>{i + 1 < DRILLS.length ? "Next drill →" : "On to the debrief →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE5: ModuleDef = {
  code: "M-05",
  moduleNo: 5,
  title: "Injection",
  client: "Northwind Foods",
  brief:
    "A deep engagement. Northwind Foods' staff portal and product shop both build their database queries straight from whatever you type. Your job is the full job: prove the weakness, break in, read out the staff records, map what else is in there, and reach the one secret they really didn't want found. Then two field jobs for new clients. All for real.",
  lesson: {
    blocks: [
      { h: "First - what's a database?", body: "Almost every app stores its information in a database: an organised store you can picture as a stack of spreadsheets. Each table is one sheet (a 'users' table, a 'products' table), and each row is one record. The app reads and writes it constantly - your login, your messages, your scores all live there. The app talks to the database in a language called SQL, by sending it a query." },
      { h: "How a login actually checks you", body: "When you log in, the app builds a query that means 'find the user whose email is X and whose password is Y'. If a row comes back, you're let in. Simple - but everything depends on HOW the app builds that query. If it glues your typed-in email straight into the SQL text, you're about to see what goes wrong." },
      { h: "Injection: when your words become commands", body: "Injection happens when your input is mixed into a command the app runs. If the app doesn't keep your input strictly as data, you can add characters that end the data and start new commands - so your input runs as code. SQL injection aims this at the database, and it's been one of the most damaging web weaknesses for twenty years." },
      { h: "Breaking out of the string", body: "Your email sits inside quotes in the query: …WHERE email = '<your input>'. Type a quote and you close that string early. Add OR 1=1 and you've bolted on a condition that is always true. Finish with -- and the database ignores the rest of the line, including the password check. The query returns rows it never should, and the app lets you in." },
      { h: "Reading other tables with UNION", body: "Breaking in is only stage one. The deeper move is UNION, which staples a second query onto the first and returns its results through the same page - so an injectable search box can be made to hand you entirely different tables: staff accounts, password hashes, secrets. The one rule: your UNION must select the same number of columns as the original query, which is why you count columns first." },
    ],
    Interactive: InputBecomesCodeLab,
    summary: [
      "A database is tables of rows; the app talks to it in SQL by sending a query.",
      "Injection = your input gets run as code because it's glued into the query.",
      "The break-in combo: a quote to close the string, OR 1=1 to force it true, -- to comment out the rest.",
      "UNION staples a second query on to read other tables - the column counts must match.",
      "The cure is always the same: keep input as data, never code.",
    ],
    check: {
      q: "An app builds its login query by joining your typed email straight into the SQL text. Why is that the dangerous part?",
      options: [
        { text: "Characters in your input (like a quote) can end the 'data' and let the rest run as commands.", correct: true, feedback: "Exactly. Once your input can change the query's structure, it's no longer just data - it's code." },
        { text: "Joining lots of text together is slow, so the login times out and lets anyone through.", feedback: "Performance isn't the issue - a fast query is just as injectable. The problem is input becoming code." },
        { text: "The email gets stored in plain text, so an attacker can read it from the database later.", feedback: "Storing data in the clear is a different weakness. Here the danger is the query being built from your input." },
        { text: "A very long email overflows the database and corrupts the rows next to it.", feedback: "That's mixing up a different class of bug. SQL injection is about your input changing what the query does." },
      ],
    },
  },
  glossary: GLOSSARY,
  scope: {
    target: "portal.northwind.range (login) + shop.northwind.range (search)",
    inScope: "both input fields; reading data via injection; the consolidation clients named in each drill",
    offLimits: "DROP/DELETE/UPDATE, other Northwind hosts, real data",
    timebox: "this session",
  },
  handler: "Five stages, then two field jobs. Confirm it's injectable, walk in the front door, turn the search box into a window onto the whole database, map what's in there, then take the prize. Try each yourself before the hints - that's how it sticks. Password field stays empty throughout; you're going around it.",
  hint: "This is a multi-stage engagement - work the stages in order. Each has its own hint ladder and a last-resort reveal. The password field can stay empty; you're going around it, not guessing it.",
  Act: InjectionAct,
  Consolidation: ConsolidationDrills,
  flag: "flag{un10n_t0_the_v4ult}",
  defend: {
    blocks: [
      { h: "The fix: parameterised queries", body: "Never build a query by gluing strings together. Use a parameterised query: write the query with placeholders, then hand the database your input separately. The database treats that input strictly as a value - never as part of the command - so ' OR 1=1-- becomes a (failed) login with a very odd email, and UNION payloads are just strange search terms." },
      { h: "Why 'just block bad words' fails", body: "A tempting shortcut is to strip quotes or ban the word UNION. It doesn't hold: attackers slip past blocklists with different encodings, odd capitalisation, or by splitting words - and meanwhile you've broken real input like the name O'Brien. Blocklists are a game of whack-a-mole. Parameterisation removes the whole category at once, which is why it's the real fix." },
      { h: "Defence in depth", body: "Parameterisation is the cure; these are the seatbelts. Give the app's database account only the permissions it needs, so even a successful injection can't read tables it shouldn't or delete anything. Validate input where it genuinely makes sense. And never show raw database errors to users - that error you triggered in stage one is exactly what tells an attacker the door is open." },
    ],
    Interactive: PickSafeQueryLab,
    check: {
      q: "A developer 'fixes' the login by deleting any single quotes from the input before building the query the same old way. Is that enough?",
      options: [
        { text: "No - it's a blocklist. Attackers bypass it, it breaks real names like O'Brien, and the query is still built by hand. Use parameterised queries.", correct: true, feedback: "Right. Stripping characters is whack-a-mole; parameterisation removes the whole class of bug." },
        { text: "Yes - with no quotes in the input, the string can't be closed, so injection is impossible.", feedback: "Not quite. Quotes aren't the only way in (numeric fields, encodings), and the query is still built by concatenation." },
        { text: "Yes, as long as they also hide the database error messages from users.", feedback: "Hiding errors removes a clue, but the injection still works. The build-by-gluing approach is the real problem." },
        { text: "No, but only because it breaks names like O'Brien - add an exception for apostrophes and it's then safe.", feedback: "The broken-names point is real, but 'add an exception' keeps the blocklist and its bypasses. Parameterise instead." },
      ],
    },
  },
  finding: {
    title: "SQL injection: auth bypass and full database read",
    where: "portal.northwind.range /login + shop.northwind.range /search",
    severity: "Critical",
    cvss: "9.8",
    impact: "Both the login and the product search build SQL from raw input. An attacker can log in with no password, read every staff record (emails and password hashes), enumerate the whole schema, and extract secrets from other tables via UNION - a complete compromise of the database.",
    fix: "Use parameterised queries everywhere; never concatenate input into SQL. Add least-privilege database accounts and suppress raw error output as defence in depth.",
  },
  rep: 70,
  repRank: "Junior Operator",
  repTo: "205 / 300 to Operator",
  next: "NEXT MODULE · Cross-Site Scripting →",
};

export default function Module5() {
  return <Engagement mod={MODULE5} />;
}
