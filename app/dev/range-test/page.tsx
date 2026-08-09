"use client";

/* DEV harness — de-risks the load-bearing dependency for the Cyber Ops range:
 * can a real, learner-typed SQL-injection payload run against a genuine
 * in-browser SQLite (sql.js/wasm) and actually bypass auth? If yes, the tier's
 * core promise ("perform the real technique in a walled range") is real.
 *
 * /dev/* is 404 in production (middleware); this is a throwaway proving ground,
 * not the shipped console. Nothing here touches a network — the wasm SQLite
 * runs entirely client-side. */

import { useEffect, useState } from "react";

type Attempt = {
  sql: string;
  rows: (string | number)[][];
  error: string;
  authed: boolean;
  asAdmin: boolean;
};

export default function RangeTestPage() {
  const [status, setStatus] = useState("booting wasm SQLite…");
  // sql.js Database instance; typed loosely to avoid pulling its types into the app surface.
  const [db, setDb] = useState<{ run: (s: string) => void; exec: (s: string) => { values: (string | number)[][] }[] } | null>(null);
  const [email, setEmail] = useState("admin@northwind.range");
  const [pass, setPass] = useState("wrong-password");
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const initSqlJs = (await import("sql.js")).default;
        // Turbopack rewrites sql.js's internal wasm path, so its own fetch
        // (locateFile) 404s. Fetch the wasm ourselves and hand Emscripten the
        // bytes via `wasmBinary` — served ungated at /operators/sql-wasm.wasm.
        const wasmBinary = await fetch("/operators/sql-wasm.wasm").then((r) => {
          if (!r.ok) throw new Error(`wasm fetch ${r.status}`);
          return r.arrayBuffer();
        });
        const SQL = await initSqlJs({ wasmBinary });
        const database = new SQL.Database();
        database.run(
          `CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, pass TEXT, role TEXT);`
        );
        database.run(
          `INSERT INTO users (email, pass, role) VALUES
             ('admin@northwind.range', 'W1nter!Aud1t', 'admin'),
             ('dbrooks@northwind.range', 'hunter2', 'staff'),
             ('sec@northwind.range',    'p@ssw0rd',  'staff');`
        );
        if (!cancelled) {
          setDb(database as unknown as typeof db);
          setStatus("range online · wasm SQLite ready · target: Northwind portal");
        }
      } catch (e) {
        if (!cancelled) setStatus("FAILED to init sql.js: " + (e as Error).message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  function authenticate() {
    if (!db) return;
    // DELIBERATELY vulnerable: string-concatenated query. This is exactly the
    // bug the learner will exploit — the payload they type executes for real.
    const sql = `SELECT id, email, role FROM users WHERE email = '${email}' AND pass = '${pass}'`;
    let rows: (string | number)[][] = [];
    let error = "";
    try {
      const res = db.exec(sql);
      if (res.length) rows = res[0].values;
    } catch (e) {
      error = (e as Error).message;
    }
    setAttempt({
      sql,
      rows,
      error,
      authed: rows.length > 0,
      asAdmin: rows.some((r) => r[2] === "admin"),
    });
  }

  const mono = "ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace";

  return (
    <div style={{ minHeight: "100vh", background: "#0a0b12", color: "#dbe4ff", fontFamily: mono, padding: 40 }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>
        <div style={{ fontSize: 12, letterSpacing: 3, textTransform: "uppercase", color: "#8b7bff", fontWeight: 700 }}>
          Cyber Ops · range engine · dependency proof
        </div>
        <h1 style={{ fontSize: 22, margin: "10px 0 4px", fontWeight: 700 }}>Northwind portal — auth target</h1>
        <div style={{ fontSize: 13, color: attempt?.authed ? "#66f0a6" : "#8b9bc4" }}>{status}</div>

        <div style={{ marginTop: 24, padding: 18, borderRadius: 12, background: "#12131c", border: "1px solid rgba(139,123,255,0.25)" }}>
          <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8b9bc4", marginBottom: 10 }}>
            POST /login · try to authenticate
          </div>
          <label style={{ display: "block", fontSize: 12, marginBottom: 4, color: "#9fb0d8" }}>email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)}
            style={{ width: "100%", padding: "9px 11px", marginBottom: 12, borderRadius: 8, background: "#0a0b12", color: "#dbe4ff", border: "1px solid rgba(139,123,255,0.35)", fontFamily: mono, fontSize: 13 }} />
          <label style={{ display: "block", fontSize: 12, marginBottom: 4, color: "#9fb0d8" }}>password</label>
          <input value={pass} onChange={(e) => setPass(e.target.value)}
            style={{ width: "100%", padding: "9px 11px", marginBottom: 14, borderRadius: 8, background: "#0a0b12", color: "#dbe4ff", border: "1px solid rgba(139,123,255,0.35)", fontFamily: mono, fontSize: 13 }} />
          <button onClick={authenticate} disabled={!db}
            style={{ padding: "10px 20px", borderRadius: 8, background: db ? "#8b7bff" : "#3a3a52", color: "#0a0b12", border: "none", fontFamily: mono, fontWeight: 700, fontSize: 13, cursor: db ? "pointer" : "default" }}>
            authenticate →
          </button>
          <div style={{ marginTop: 12, fontSize: 11.5, color: "#6a7396" }}>
            hint: leave the password, set email to <code style={{ color: "#ffcf6b" }}>{`' OR 1=1--`}</code> and watch it bypass.
          </div>
        </div>

        {attempt && (
          <div style={{ marginTop: 20, padding: 18, borderRadius: 12, background: "#0d0f18", border: `1px solid ${attempt.asAdmin ? "#66f0a6" : attempt.authed ? "#ffcf6b" : "rgba(255,91,98,0.5)"}` }}>
            <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: "#8b9bc4", marginBottom: 8 }}>query executed (real sqlite)</div>
            <pre style={{ whiteSpace: "pre-wrap", fontSize: 12.5, color: "#c4b5ff", margin: "0 0 12px" }}>{attempt.sql}</pre>
            {attempt.error ? (
              <div style={{ color: "#ff8fb0", fontSize: 13 }}>SQL error: {attempt.error}</div>
            ) : (
              <>
                <div style={{ fontSize: 14, fontWeight: 700, color: attempt.asAdmin ? "#66f0a6" : attempt.authed ? "#ffcf6b" : "#ff8fb0" }}>
                  {attempt.asAdmin ? "✓ AUTH BYPASS · logged in as ADMIN" : attempt.authed ? "✓ authenticated" : "✗ access denied"}
                </div>
                <div style={{ marginTop: 10, fontSize: 12.5, color: "#9fb0d8" }}>
                  rows returned: {attempt.rows.length}
                  {attempt.rows.map((r, i) => (
                    <div key={i} style={{ color: "#dbe4ff" }}>· id={r[0]} · {r[1]} · <span style={{ color: r[2] === "admin" ? "#66f0a6" : "#c4b5ff" }}>{r[2]}</span></div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
