/* Cyber Ops range engine — the reusable core the operator's console mounts.
 *
 * A target module owns a small, genuinely-vulnerable app that runs entirely
 * client-side (real wasm SQLite via sql.js — no network egress at all). The
 * learner's own payloads execute for real against it. This is both the
 * authenticity and the safety architecture: "nothing leaves the app" is a
 * structural fact, not a policy.
 *
 * This first cut ships one target (Northwind, the flagship SQL-injection
 * engagement). The RangeTarget shape is the seam every future week plugs into.
 */

/** Minimal shape of the sql.js Database we use (kept local so sql.js types
 *  never leak into the wider app surface). */
type SqlDb = {
  run: (sql: string) => void;
  exec: (sql: string) => { columns: string[]; values: (string | number)[][] }[];
};

export type LoginResult = {
  /** The exact SQL that executed — surfaced to the learner so the vuln is legible. */
  sql: string;
  rows: (string | number)[][];
  authed: boolean;
  asAdmin: boolean;
};

export type RangeTarget = {
  id: string;
  client: string;
  host: string;
  endpoint: string;
  /** One-line recon the console shows before the learner acts. */
  recon: string;
  /** The dry handler nudge — guides without hand-holding. */
  handlerHint: string;
  /** Deeper hint, revealed on request. */
  conceptHint: string;
  /** The "everyone gets the win" fallback payload. */
  classicPayload: string;
  flag: string;
  finding: {
    title: string;
    where: string;
    severity: "Critical" | "High" | "Medium" | "Low";
    cvss: string;
    impact: string;
    fix: string;
  };
  /** +reputation awarded on capture. */
  rep: number;
};

export type NorthwindSession = {
  target: RangeTarget;
  /** Runs the (deliberately vulnerable) login query for real against wasm SQLite. */
  attemptLogin: (email: string, password: string) => LoginResult;
};

export const NORTHWIND: RangeTarget = {
  id: "northwind-login",
  client: "Northwind Foods",
  host: "portal.northwind.range",
  endpoint: "POST /login",
  recon: "The staff portal login reflects raw database errors — a sign it may be trusting its inputs.",
  handlerHint: "The login builds its query straight from what you type. See if it trusts you more than it should.",
  conceptHint:
    "The query is: …WHERE email = '<your input>'. Close the quote yourself, then add a condition that's always true, and comment out the rest with -- .",
  classicPayload: "' OR 1=1--",
  flag: "flag{n0rthwind_p0rtal_0wn3d}",
  finding: {
    title: "Authentication bypass via SQL injection",
    where: "POST /login · email parameter",
    severity: "Critical",
    cvss: "9.8",
    impact: "Any user can sign in as an administrator without credentials, exposing all staff records.",
    fix: "Use parameterised queries (prepared statements); never build SQL by concatenating user input.",
  },
  rep: 40,
};

/** Boots the Northwind target in-browser. Client-side only.
 *  sql.js's own wasm fetch (locateFile) 404s under Turbopack, so we fetch the
 *  wasm ourselves and hand Emscripten the bytes via `wasmBinary`. */
export async function bootNorthwind(): Promise<NorthwindSession> {
  const initSqlJs = (await import("sql.js")).default;
  const wasmBinary = await fetch("/operators/sql-wasm.wasm").then((r) => {
    if (!r.ok) throw new Error(`range wasm failed to load (${r.status})`);
    return r.arrayBuffer();
  });
  const SQL = await initSqlJs({ wasmBinary });
  const db: SqlDb = new SQL.Database();

  db.run(
    `CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, pass TEXT, role TEXT);`
  );
  db.run(
    `INSERT INTO users (email, pass, role) VALUES
       ('a.morgan@northwind.range', 'W1nter!Aud1t', 'admin'),
       ('d.brooks@northwind.range', 'hunter2',      'staff'),
       ('sec@northwind.range',      'p@ssw0rd',      'staff');`
  );

  return {
    target: NORTHWIND,
    attemptLogin(email, password) {
      // DELIBERATELY vulnerable: string-concatenated query. This is the bug the
      // learner exploits — their payload executes verbatim.
      const sql = `SELECT id, email, role FROM users WHERE email = '${email}' AND pass = '${password}'`;
      let rows: (string | number)[][] = [];
      try {
        const res = db.exec(sql);
        if (res.length) rows = res[0].values;
      } catch {
        // A malformed injection throws a SQL error — that's real feedback, not a crash.
      }
      return {
        sql,
        rows,
        authed: rows.length > 0,
        asAdmin: rows.some((r) => r[2] === "admin"),
      };
    },
  };
}
