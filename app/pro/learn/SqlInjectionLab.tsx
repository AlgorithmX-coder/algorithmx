"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { T } from "./tokens";
import type { LabProps } from "./types";

/* Week 8 play area: a REAL SQL injection, run against a REAL in-browser
 * SQLite database (sql.js, wasm). This is the "find the decision point"
 * method: the learner attacks a deliberately vulnerable login, watches
 * the whole customer table leak, sees the exact query that allowed it,
 * then flips to the parameterised fix and watches the same attack fail.
 *
 * Safety + authenticity are the same fact: the database lives entirely
 * in the browser tab, nothing leaves the page, and the payload really
 * executes. sql.js's own wasm fetch (locateFile) 404s under Turbopack,
 * so we hand it the bytes via wasmBinary (pattern proven in the Ops
 * range engine). */

type Row = Record<string, unknown>;
type SqlStmt = { bind: (p: unknown[]) => void; step: () => boolean; getAsObject: () => Row; free: () => void };
type SqlDb = {
  run: (sql: string) => void;
  exec: (sql: string) => { columns: string[]; values: unknown[][] }[];
  prepare: (sql: string) => SqlStmt;
};

const CLASSIC = "' OR '1'='1";

type Attempt = {
  username: string;
  password: string;
  mode: "vulnerable" | "fixed";
  rows: Row[];
  outcome: "denied" | "single" | "bypassed";
};

async function boot(): Promise<SqlDb> {
  const initSqlJs = (await import("sql.js")).default;
  const wasmBinary = await fetch("/operators/sql-wasm.wasm").then((r) => {
    if (!r.ok) throw new Error(`sql wasm failed (${r.status})`);
    return r.arrayBuffer();
  });
  const SQL = await initSqlJs({ wasmBinary });
  const db = new SQL.Database() as unknown as SqlDb;
  db.run(`CREATE TABLE customers (id INTEGER PRIMARY KEY, username TEXT, password TEXT, email TEXT, plan TEXT);`);
  db.run(
    `INSERT INTO customers (username, password, email, plan) VALUES
       ('sarah.k',  'Summer2015',    'sarah.k@email.co.uk',  'Fibre 65'),
       ('j.okafor', 'Liverpool99',   'j.okafor@email.co.uk', 'Broadband'),
       ('admin',    'Talk!Admin#15', 'ops@portal.internal',  'STAFF ADMIN'),
       ('m.davies', 'password1',     'm.davies@email.co.uk', 'Fibre 150'),
       ('r.singh',  'Chelsea!2014',  'r.singh@email.co.uk',  'Broadband');`
  );
  return db;
}

export default function SqlInjectionLab({ onDidTry }: LabProps) {
  const [db, setDb] = useState<SqlDb | null>(null);
  const [bootError, setBootError] = useState<string | null>(null);
  const [mode, setMode] = useState<"vulnerable" | "fixed">("vulnerable");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const firedTry = useRef(false);

  useEffect(() => {
    let live = true;
    boot().then((d) => { if (live) setDb(d); }).catch((e) => { if (live) setBootError(String(e?.message ?? e)); });
    return () => { live = false; };
  }, []);

  const login = () => {
    if (!db) return;
    let rows: Row[] = [];
    if (mode === "vulnerable") {
      // DELIBERATELY vulnerable: the payload executes verbatim.
      const sql = `SELECT username, password, email, plan FROM customers WHERE username = '${username}' AND password = '${password}'`;
      try {
        const res = db.exec(sql);
        if (res.length) rows = res[0].values.map((v) => Object.fromEntries(res[0].columns.map((c, i) => [c, v[i]])));
      } catch { /* a malformed injection throws a real SQL error, not a crash */ }
    } else {
      // FIXED: parameterised. The input is bound as data, never parsed as SQL.
      const stmt = db.prepare(`SELECT username, password, email, plan FROM customers WHERE username = ? AND password = ?`);
      try {
        stmt.bind([username, password]);
        while (stmt.step()) rows.push(stmt.getAsObject());
      } finally { stmt.free(); }
    }
    const outcome: Attempt["outcome"] = rows.length === 0 ? "denied" : rows.length === 1 ? "single" : "bypassed";
    setAttempt({ username, password, mode, rows, outcome });
    if (!firedTry.current) { firedTry.current = true; onDidTry(); }
  };

  const injected = password.includes("'") || password.includes("--") || password.toUpperCase().includes(" OR ");

  const banner = useMemo(() => {
    if (!attempt) return null;
    if (attempt.outcome === "denied") return { c: T.amber, bg: T.amberSoft, text: "Access denied. No account matched." };
    if (attempt.outcome === "single") return { c: T.green, bg: T.greenSoft, text: `Logged in as ${attempt.rows[0].username} (${attempt.rows[0].plan}).` };
    return { c: T.red, bg: T.redSoft, text: `BYPASSED. The login returned ${attempt.rows.length} accounts. You just dumped the entire customer table.` };
  }, [attempt]);

  if (bootError) {
    return <div style={{ fontFamily: T.mono, fontSize: 13, color: T.amber }}>The practice database could not load ({bootError}). Refresh to try again.</div>;
  }
  if (!db) {
    return <div style={{ fontFamily: T.mono, fontSize: 13, color: T.faint }}>Booting a real SQL database in your browser...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* mode toggle */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: T.mono, fontSize: 10.5, letterSpacing: "0.14em", textTransform: "uppercase", color: T.faint }}>Portal version</span>
        {(["vulnerable", "fixed"] as const).map((m) => (
          <button key={m} onClick={() => { setMode(m); setAttempt(null); }}
            style={{
              fontFamily: T.mono, fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase",
              padding: "6px 12px", borderRadius: 7, cursor: "pointer",
              background: mode === m ? (m === "fixed" ? T.greenSoft : T.redSoft) : "transparent",
              border: `1px solid ${mode === m ? (m === "fixed" ? T.green : T.red) : T.edge}`,
              color: mode === m ? T.ink : T.muted,
            }}>
            {m === "vulnerable" ? "the old code (vulnerable)" : "the fix (parameterised)"}
          </button>
        ))}
      </div>

      {/* the fake portal */}
      <div style={{ background: T.bgRaise, border: `1px solid ${T.edge}`, borderRadius: 12, padding: "18px 20px" }}>
        <div style={{ fontFamily: T.display, fontWeight: 700, fontSize: 15, color: T.ink, marginBottom: 2 }}>MyAccount portal</div>
        <div style={{ fontSize: 12.5, color: T.faint, marginBottom: 14 }}>Sign in to manage your broadband</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 360 }}>
          <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" autoComplete="off" spellCheck={false}
            style={{ boxSizing: "border-box", padding: "10px 13px", background: T.bg, color: T.ink, border: `1px solid ${T.edge}`, borderRadius: 8, fontFamily: T.mono, fontSize: 13.5 }} />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" autoComplete="off" spellCheck={false}
            style={{ boxSizing: "border-box", padding: "10px 13px", background: T.bg, color: T.ink, border: `1px solid ${injected ? T.red : T.edge}`, borderRadius: 8, fontFamily: T.mono, fontSize: 13.5 }} />
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={login} disabled={!username && !password}
              style={{ fontFamily: T.display, fontSize: 13, fontWeight: 700, color: "#fff", background: `linear-gradient(135deg, ${T.primary}, ${T.cyan})`, border: "none", borderRadius: 8, padding: "10px 20px", cursor: "pointer" }}>
              Sign in
            </button>
            <button onClick={() => { setUsername("sarah.k"); setPassword(CLASSIC); }}
              style={{ fontFamily: T.mono, fontSize: 11, fontWeight: 600, color: T.cyan, background: "transparent", border: `1px solid ${T.edge}`, borderRadius: 8, padding: "9px 12px", cursor: "pointer" }}>
              fill the classic injection
            </button>
          </div>
        </div>
      </div>

      {/* the query the DB actually ran */}
      {attempt && (
        <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 10, padding: "13px 15px" }}>
          <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: "0.14em", color: T.faint, marginBottom: 8 }}>THE QUERY THE DATABASE RAN</div>
          {attempt.mode === "vulnerable" ? (
            <div style={{ fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.7, wordBreak: "break-word", color: T.body }}>
              SELECT * FROM customers WHERE username = '<span style={{ color: T.cyan }}>{attempt.username}</span>' AND password = '<span style={{ color: T.red, fontWeight: 700 }}>{attempt.password}</span>'
              {attempt.outcome === "bypassed" && (
                <div style={{ color: T.red, marginTop: 8, fontSize: 11.5 }}>
                  Your <b>{"' OR '1'='1"}</b> closed the password string and added a condition that is always true, so the WHERE matched every row.
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontFamily: T.mono, fontSize: 12.5, lineHeight: 1.7, color: T.body }}>
              SELECT * FROM customers WHERE username = <span style={{ color: T.green }}>?</span> AND password = <span style={{ color: T.green }}>?</span>
              <div style={{ color: T.green, marginTop: 8, fontSize: 11.5 }}>
                Your input <b style={{ color: T.ink }}>[{attempt.username || "(empty)"}, {attempt.password || "(empty)"}]</b> is sent to the database separately, as data. It is never read as part of the query, so the injection is just a (wrong) password.
              </div>
            </div>
          )}
        </div>
      )}

      {/* result */}
      {banner && (
        <div style={{ background: banner.bg, border: `1px solid ${banner.c}66`, borderRadius: 10, padding: "12px 15px", color: T.ink, fontSize: 14, fontWeight: 600 }}>
          <span style={{ color: banner.c }}>{banner.text}</span>
        </div>
      )}

      {/* leaked table on bypass */}
      {attempt && attempt.outcome === "bypassed" && (
        <div style={{ overflowX: "auto", border: `1px solid ${T.red}44`, borderRadius: 10 }}>
          <table style={{ borderCollapse: "collapse", width: "100%", fontFamily: T.mono, fontSize: 12 }}>
            <thead>
              <tr>{["username", "password", "email", "plan"].map((h) => (
                <th key={h} style={{ textAlign: "left", padding: "8px 12px", color: T.faint, borderBottom: `1px solid ${T.edge}`, textTransform: "uppercase", fontSize: 10, letterSpacing: "0.1em" }}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {attempt.rows.map((r, i) => (
                <tr key={i}>
                  {["username", "password", "email", "plan"].map((c) => (
                    <td key={c} style={{ padding: "7px 12px", color: c === "password" ? T.red : T.body, borderBottom: `1px solid ${T.edgeSoft}`, whiteSpace: "nowrap" }}>{String(r[c])}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: "9px 12px", fontFamily: T.sans, fontSize: 12.5, color: T.muted }}>
            Every customer's details, and their passwords in plain text, from one line typed into a login box.
          </div>
        </div>
      )}
    </div>
  );
}
