"use client";

/* Module 5 — Injection. Reuses the proven wasm SQLite engine (engine.ts): the
 * learner's own `' OR 1=1--` payload executes for real against in-browser SQLite
 * and bypasses the login, entirely client-side. This is the tier's flagship
 * capture, now inside the full taught module chassis. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, C, MONO, Btn } from "./Engagement";
import { bootNorthwind, type NorthwindSession, type LoginResult } from "./engine";

function SqliAct({ onCapture }: { onCapture: () => void }) {
  const [session, setSession] = useState<NorthwindSession | null>(null);
  const [bootErr, setBootErr] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [result, setResult] = useState<LoginResult | null>(null);

  useEffect(() => {
    let live = true;
    bootNorthwind()
      .then((s) => live && setSession(s))
      .catch((e) => live && setBootErr((e as Error).message));
    return () => { live = false; };
  }, []);

  function attempt() {
    if (!session) return;
    const r = session.attemptLogin(email, password);
    setResult(r);
    if (r.authed) onCapture();
  }

  const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13.5 };
  const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 11, color: C.mute, margin: "0 0 5px", letterSpacing: ".08em" };

  if (bootErr) return <div style={{ fontFamily: MONO, fontSize: 13, color: C.red }}>Range failed to boot: {bootErr}</div>;
  if (!session) return <div style={{ fontFamily: MONO, fontSize: 13, color: C.mute }}>// booting range target… (real SQLite, in-browser)</div>;

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
          <i style={dot(C.red)} /><i style={dot(C.amber)} /><i style={dot(C.green)} />
          <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6 }}>{session.target.host} · staff login</span>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 14 }}>// {session.target.recon}</div>
          <div style={{ marginBottom: 12 }}><label style={lab}>email</label><input style={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@northwind.range" /></div>
          <div style={{ marginBottom: 16 }}><label style={lab}>password</label><input style={inp} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="leave blank — break the query instead" /></div>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Btn tone="i" onClick={attempt}>RUN LOGIN →</Btn>
            <button onClick={() => { setEmail(session.target.classicPayload); setPassword(""); }} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>stuck? use a classic</button>
          </div>
        </div>
      </div>

      {result && (
        <div style={{ background: C.carbon, border: `1px solid ${result.authed ? C.green : C.line}`, borderRadius: 12, padding: "14px 16px" }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.mute, marginBottom: 7 }}>QUERY THAT RAN</div>
          <pre style={{ margin: 0, fontFamily: MONO, fontSize: 12, color: "#8fa0c8", whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{result.sql}</pre>
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 13, color: result.authed ? C.green : C.red }}>
            {result.authed ? `✓ 200 · signed in${result.asAdmin ? " as ADMIN" : ""} — ${result.rows.length} row(s) returned` : "✗ 401 · no rows — the query held. Break out of the string."}
          </div>
        </div>
      )}
    </div>
  );
}

function dot(c: string): React.CSSProperties { return { width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }; }

export const MODULE5: ModuleDef = {
  code: "M-05",
  moduleNo: 5,
  title: "Injection",
  client: "Northwind Foods",
  brief:
    "A new client: Northwind Foods. Their staff portal login spits out raw database errors when it’s poked — a tell-tale sign it’s building its database queries straight from whatever you type. Your job: prove you can sign in without a valid password.",
  lesson: {
    blocks: [
      { h: "Injection: when data becomes code", body: "Injection happens when the input you give an app gets mixed into a command the app then runs. If the app doesn’t keep your input strictly as data, you can sneak in characters that end the data and start new commands — so your input is executed as code. SQL injection is this, aimed at the database." },
      { h: "Breaking out of the query", body: "A login often runs: SELECT … WHERE email = '<your input>' AND pass = '<your input>'. Your text sits inside those quotes. Type a quote yourself and you close the string early; add OR 1=1 and you’ve bolted on a condition that’s always true; finish with -- and the rest of the line (the password check) becomes a comment. The database happily returns every row, and the app logs you in." },
      { h: "Why it’s so dangerous", body: "A database usually holds everything: accounts, orders, personal records. Injection can read all of it, change it, or delete it — and here it walks straight past the login. It’s been one of the most damaging and most common web vulnerabilities for two decades, which is exactly why you learn to both perform and prevent it." },
    ],
    example: {
      caption: "The payload closes the string, adds an always-true test, and comments out the password check. The query returns everyone — so the app lets you in as the first user.",
      lines: [
        { t: "input:  ' OR 1=1--", leak: true },
        { t: "" },
        { t: "query:  SELECT * FROM users" },
        { t: "        WHERE email = '' OR 1=1--' AND pass = '...'", leak: true },
        { t: "result: every row -> authenticated", leak: true },
      ],
    },
    check: {
      q: "Why does ' OR 1=1-- let you log in?",
      options: [
        { text: "It guesses the admin’s real password very fast.", feedback: "No guessing — it never checks a real password; it rewrites the query itself." },
        { text: "It turns your input into SQL code: closes the string, adds an always-true test, comments out the rest.", correct: true, feedback: "Exactly. The input stops being data and becomes part of the query’s logic." },
        { text: "It crashes the database so the login gives up and lets you in.", feedback: "It doesn’t crash anything — it makes the query return rows, which the app treats as a valid login." },
      ],
    },
  },
  scope: {
    target: "portal.northwind.range · the staff login (POST /login)",
    inScope: "the login’s email and password fields",
    offLimits: "dropping/altering tables, other Northwind hosts, real data",
    timebox: "this session",
  },
  handler: "The login builds its query straight from what you type. Close the quote, make it always true, comment out the rest. Password field can stay empty — you’re not guessing it, you’re going around it.",
  hint: "Put ' OR 1=1-- in the EMAIL field and leave the password blank, then run the login. Watch the query that executes.",
  Act: SqliAct,
  flag: "flag{n0rthwind_p0rtal_0wn3d}",
  defend: {
    blocks: [
      { h: "The fix: parameterised queries", body: "The real fix is to never build a query by gluing strings together. Use parameterised queries (also called prepared statements): you write the query with placeholders, then hand the database your input separately. The database treats that input strictly as a value — never as part of the command — so ' OR 1=1-- is just a (failed) login attempt with a very strange email." },
      { h: "Defence in depth", body: "Parameterisation is the cure; the rest are seatbelts. Validate input where you can, give the app’s database account only the permissions it actually needs (so a leak can’t drop tables), and don’t leak raw database errors to users — those errors are what told you this login was vulnerable in the first place." },
    ],
    check: {
      q: "What actually prevents SQL injection?",
      options: [
        { text: "Blocking the words OR and SELECT in user input.", feedback: "Blocklists are trivially bypassed and break legitimate input; they don’t address the root cause." },
        { text: "Parameterised queries, so input is always treated as data, never as SQL.", correct: true, feedback: "Right. Placeholders keep input as a value the database never executes." },
        { text: "Hiding database errors from the user.", feedback: "Good hygiene, and it removes a clue — but the injection still works. Parameterise the query." },
      ],
    },
  },
  finding: {
    title: "Authentication bypass via SQL injection",
    where: "portal.northwind.range · POST /login · email parameter",
    severity: "Critical",
    cvss: "9.8",
    impact: "The login builds its SQL from raw input, so a crafted email signs in as an administrator with no valid password and exposes every staff record.",
    fix: "Use parameterised queries (prepared statements) everywhere; never concatenate user input into SQL. Add least-privilege DB accounts and suppress raw error output.",
  },
  rep: 50,
  repRank: "Junior Operator",
  repTo: "185 / 300 to Operator",
  next: "NEXT MODULE · Cross-Site Scripting →",
};

export default function Module5() {
  return <Engagement mod={MODULE5} />;
}
