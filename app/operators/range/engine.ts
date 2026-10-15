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
  recon: "The staff portal login reflects raw database errors - a sign it may be trusting its inputs.",
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
  // sql.js's Database type surfaces the full SqlValue union (incl. Uint8Array |
  // null); our tables only hold text/ints, so we narrow to the local SqlDb shape.
  const db = new SQL.Database() as unknown as SqlDb;

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

/* ============================================================
 * Northwind RANGE — the richer, multi-stage injection target.
 *
 * Module 5 (depth standard) runs a full engagement against this: probe the
 * vuln, bypass auth, pull the staff table out through a UNION, then crack the
 * vault (a secrets table). Two genuinely-injectable surfaces (a login and a
 * product search), three tables, and errors are surfaced (not swallowed) so
 * the learner can do real error-based recon. Everything is still wasm SQLite,
 * client-side, zero egress — the learner's own payloads execute verbatim.
 * ============================================================ */

/** Result of running one (deliberately vulnerable) query for real. */
export type RangeRunResult = {
  /** The exact SQL string that was built from the learner's input. */
  sql: string;
  /** Column names of the result set (from the leading SELECT). */
  columns: string[];
  rows: (string | number)[][];
  /** Non-null when the query threw — real SQL error text (error-based recon). */
  error: string | null;
};

export type NorthwindRange = {
  loginFlag: string;
  vaultFlag: string;
  /** The vulnerable login: SELECT … WHERE email = '<input>' AND pass = '<input>'. */
  attemptLogin: (email: string, password: string) => RangeRunResult & { authed: boolean; asAdmin: boolean };
  /** The vulnerable product search: … WHERE name LIKE '%<input>%'. The UNION surface. */
  search: (term: string) => RangeRunResult;
};

export async function bootNorthwindRange(): Promise<NorthwindRange> {
  const initSqlJs = (await import("sql.js")).default;
  const wasmBinary = await fetch("/operators/sql-wasm.wasm").then((r) => {
    if (!r.ok) throw new Error(`range wasm failed to load (${r.status})`);
    return r.arrayBuffer();
  });
  const SQL = await initSqlJs({ wasmBinary });
  const db = new SQL.Database() as unknown as SqlDb;

  db.run(`CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price TEXT);`);
  db.run(
    `INSERT INTO products (name, price) VALUES
       ('Olive Oil 1L','6.50'), ('Sea Salt 500g','2.20'),
       ('Basmati Rice 5kg','9.99'), ('Smoked Paprika','3.40');`,
  );
  db.run(`CREATE TABLE users (id INTEGER PRIMARY KEY, email TEXT, pass TEXT, role TEXT);`);
  db.run(
    `INSERT INTO users (email, pass, role) VALUES
       ('a.morgan@northwind.range','W1nter!Aud1t','admin'),
       ('d.brooks@northwind.range','hunter2','staff'),
       ('sec@northwind.range','p@ssw0rd','staff');`,
  );
  db.run(`CREATE TABLE orders (id INTEGER PRIMARY KEY, customer TEXT, card_last4 TEXT);`);
  db.run(
    `INSERT INTO orders (customer, card_last4) VALUES
       ('Rowan Webb','4417'), ('Nadia Khan','9032'), ('Tom Fielding','7781');`,
  );
  db.run(`CREATE TABLE secrets (id INTEGER PRIMARY KEY, label TEXT, value TEXT);`);
  db.run(
    `INSERT INTO secrets (label, value) VALUES
       ('master_reset_key','flag{un10n_t0_the_v4ult}');`,
  );

  function run(sql: string): RangeRunResult {
    try {
      const res = db.exec(sql);
      if (!res.length) return { sql, columns: [], rows: [], error: null };
      return { sql, columns: res[0].columns, rows: res[0].values, error: null };
    } catch (e) {
      return { sql, columns: [], rows: [], error: (e as Error).message };
    }
  }

  return {
    loginFlag: "flag{n0rthwind_p0rtal_0wn3d}",
    vaultFlag: "flag{un10n_t0_the_v4ult}",
    attemptLogin(email, password) {
      // DELIBERATELY vulnerable: the learner's input is concatenated verbatim.
      const sql = `SELECT id, email, role FROM users WHERE email = '${email}' AND pass = '${password}'`;
      const r = run(sql);
      return {
        ...r,
        authed: r.rows.length > 0,
        asAdmin: r.rows.some((row) => row[2] === "admin"),
      };
    },
    search(term) {
      // DELIBERATELY vulnerable: the UNION surface. 3 columns: id, name, price.
      return run(`SELECT id, name, price FROM products WHERE name LIKE '%${term}%'`);
    },
  };
}

/* ============================================================
 * Generic scenario range — powers the Module 5 consolidation DRILLS.
 *
 * Each drill is a fresh client with its own tables and ONE vulnerable surface
 * (a login or a search), seeded from a spec so new scenarios cost a few lines,
 * not a new boot. Same wasm SQLite, same real injection, zero egress.
 * ============================================================ */

export type ScenarioSpec = {
  /** Raw CREATE/INSERT SQL that seeds this scenario's tables. */
  setup: string;
  /** A vulnerable login: SELECT <select> FROM <table> WHERE <emailCol> = '<input>' AND <passCol> = '<input>'. */
  login?: { table: string; select: string; emailCol: string; passCol: string; adminRole?: string; roleIdx?: number };
  /** A vulnerable search: SELECT <select> FROM <table> WHERE <searchCol> LIKE '%<input>%'. */
  search?: { table: string; select: string; searchCol: string };
};

export type ScenarioRange = {
  attemptLogin: (email: string, password: string) => RangeRunResult & { authed: boolean; asAdmin: boolean };
  search: (term: string) => RangeRunResult;
};

export async function bootScenario(spec: ScenarioSpec): Promise<ScenarioRange> {
  const initSqlJs = (await import("sql.js")).default;
  const wasmBinary = await fetch("/operators/sql-wasm.wasm").then((r) => {
    if (!r.ok) throw new Error(`range wasm failed to load (${r.status})`);
    return r.arrayBuffer();
  });
  const SQL = await initSqlJs({ wasmBinary });
  const db = new SQL.Database() as unknown as SqlDb;
  db.run(spec.setup);

  const run = (sql: string): RangeRunResult => {
    try {
      const res = db.exec(sql);
      if (!res.length) return { sql, columns: [], rows: [], error: null };
      return { sql, columns: res[0].columns, rows: res[0].values, error: null };
    } catch (e) {
      return { sql, columns: [], rows: [], error: (e as Error).message };
    }
  };

  return {
    attemptLogin(email, password) {
      const l = spec.login;
      if (!l) return { sql: "", columns: [], rows: [], error: "no login surface", authed: false, asAdmin: false };
      const sql = `SELECT ${l.select} FROM ${l.table} WHERE ${l.emailCol} = '${email}' AND ${l.passCol} = '${password}'`;
      const r = run(sql);
      const ri = l.roleIdx ?? -1;
      return { ...r, authed: r.rows.length > 0, asAdmin: l.adminRole != null && ri >= 0 ? r.rows.some((row) => row[ri] === l.adminRole) : false };
    },
    search(term) {
      const s = spec.search;
      if (!s) return { sql: "", columns: [], rows: [], error: "no search surface" };
      return run(`SELECT ${s.select} FROM ${s.table} WHERE ${s.searchCol} LIKE '%${term}%'`);
    },
  };
}
