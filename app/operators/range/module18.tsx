"use client";

/* Module 18 - Cloud & API Security (AI Frontier track).
 *
 * The hands-on surface is a SCRIPTED, in-browser fake REST API + cloud bucket -
 * no real backend, no network, nothing leaves the machine. The learner builds
 * real HTTP requests (method + path + optional auth) and a deterministic router
 * answers exactly the way a misconfigured cloud app would, so the real techniques
 * (BOLA, exposed storage, leaked keys, broken function-level auth) actually work.
 *
 * Shape mirrors M17: hover glossary, interactive lesson lab, four-stage capture
 * (BOLA -> public bucket -> leaked key reuse -> privilege escalation), a hint
 * ladder, four drills on fresh clients, a chained capstone, defend lab, report.
 *
 * industry{} (the sourced editorial intro) is authored from the research brief. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary, shuffle, AnswerReveal } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "API", definition: "An Application Programming Interface: the doorway apps use to talk to a server. Your phone app asks the API for data and the API answers, usually in JSON.", example: "Opening your profile fires GET /api/users/42 to the server." },
  { term: "endpoint", definition: "One specific API address you can call, like a single door in the building. Each does one job.", example: "/api/users/42 is the 'get user 42' endpoint." },
  { term: "JSON", definition: "The simple text format APIs answer in: labelled fields and values in curly braces. Easy for apps (and people) to read.", example: `{ "name": "Priya", "plan": "Business" }` },
  { term: "HTTP method", definition: "The verb on a request: GET reads, POST creates, PUT/PATCH changes, DELETE removes. The method says what you want to do.", example: "GET /api/users/42 reads user 42; DELETE removes them." },
  { term: "status code", definition: "The three-digit result of a request: 200 OK, 401 unauthorised (not logged in), 403 forbidden (not allowed), 404 not found.", example: "A 200 with someone else's data means the check failed." },
  { term: "BOLA", definition: "Broken Object Level Authorization: the server returns an object (a user, an order) without checking it belongs to YOU. The #1 API flaw. Also called IDOR.", example: "Change /api/users/1007 to /api/users/1008 and read a stranger's record." },
  { term: "IDOR", definition: "Insecure Direct Object Reference: the everyday name for BOLA. A reference you control (an id in the URL) points straight at data the server should have gated.", example: "Incrementing an invoice id to read other people's invoices." },
  { term: "BFLA", definition: "Broken Function Level Authorization: an action or admin endpoint that never checks your ROLE, so a normal user can do admin things.", example: "A normal user POSTing their own role to 'admin' and it works." },
  { term: "bucket", definition: "A cloud storage container (AWS S3, Azure Blob, Google Cloud Storage): an online folder of files, each reachable by a URL. If set public, anyone can list and read it.", example: "A public bucket leaking a database backup or a .env file." },
  { term: "API key", definition: "A secret string that proves a request is allowed, like a password for software. Leaked keys let an attacker act as the app.", example: "An AWS-style key id 'AKIA...' or a token 'sk_live_...' found in a file." },
  { term: "bearer token", definition: "A secret you put in the Authorization header to prove who you are. 'Bearer' means whoever holds it is trusted, so a stolen one is as good as the real user.", example: "Authorization: Bearer sk_live_9xQ..." },
  { term: "least privilege", definition: "Give every account, key and service the least access it needs and no more, so a leak or a bug reaches as little as possible.", example: "A read-only app key can't delete the database even if stolen." },
  { term: "env file", definition: "A '.env' file holds an app's secrets (keys, passwords, database URLs). It should never be public; leaving one in a public bucket or repo is a classic breach.", example: "config/.env with SKYVAULT_ADMIN_KEY inside." },
];
const G = (text: string, keyPrefix: string) => withGlossary(text, GLOSSARY, new Set<string>(), keyPrefix);

/* ───────────────────────── shared surface bits ───────────────────────── */

const AI = "#B15BFF";
const API = "#5FE6FF";
const inp: React.CSSProperties = { width: "100%", padding: "9px 11px", borderRadius: 8, background: C.carbon, color: C.ink, border: `1px solid ${C.line}`, fontFamily: MONO, fontSize: 13 };
const lab: React.CSSProperties = { display: "block", fontFamily: MONO, fontSize: 10.5, color: C.mute, margin: "0 0 5px", letterSpacing: ".08em" };
function dot(c: string): React.CSSProperties { return { width: 9, height: 9, borderRadius: "50%", background: c, display: "inline-block" }; }

function Hints({ hint, reveal, onReveal }: { hint: string; reveal?: string; onReveal?: () => void }) {
  const [shown, setShown] = useState(false);
  return (
    <div style={{ marginTop: 12 }}>
      {shown && <div style={{ marginBottom: 8, padding: "9px 12px", borderLeft: `2px solid ${AI}`, background: "rgba(177,91,255,0.06)", fontSize: 13, color: C.soft, lineHeight: 1.5 }}>{hint}</div>}
      <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        {!shown && <button onClick={() => setShown(true)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>hint</button>}
        {shown && reveal && onReveal && <button onClick={onReveal} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>stuck? fill the answer</button>}
      </div>
    </div>
  );
}

/* ───────────────────────── the scripted REST API ───────────────────────── */

type ApiResp = { status: number; note?: string; body: unknown };
type Router = (method: string, path: string, auth: string | null, body: string) => ApiResp;

const ADMIN_KEY = "sk_live_9xQZ4ADMIN_do_not_share";

/* The deliberately-broken Skyvault API. Every flaw here is a real OWASP API Top
 * 10 item, reproduced faithfully: no object-level check (BOLA), a public bucket,
 * a leaked key that actually works, and an action with no role check (BFLA). */
const USERS: Record<string, Record<string, unknown>> = {
  "1007": { id: 1007, name: "you (recruit)", email: "you@skyvault.range", plan: "Free", role: "user" },
  "1008": { id: 1008, name: "Priya Shah", email: "priya.shah@skyvault.range", plan: "Business", role: "user", billing: "card ****4417", note: "private record - not yours" },
  "1009": { id: 1009, name: "Marcus Bell", email: "m.bell@skyvault.range", plan: "Business", role: "user", billing: "card ****9920", note: "private record - not yours" },
  "1": { id: 1, name: "root", email: "root@skyvault.range", plan: "Internal", role: "admin", note: "the administrator account" },
};
const BUCKET: Record<string, string> = {
  "public/logo.png": "(binary image data)",
  "public/brochure.pdf": "(marketing pdf)",
  "backups/users-2026.csv": "id,email,plan\n1007,you@skyvault.range,Free\n1008,priya.shah@skyvault.range,Business\n...",
  "config/.env": `# Skyvault app secrets - DO NOT COMMIT\nDATABASE_URL=postgres://skyvault.range:5432/app\nSKYVAULT_ADMIN_KEY=${ADMIN_KEY}\nSESSION_SECRET=4f9a...`,
};

function skyvault(method: string, path: string, auth: string | null, body: string): ApiResp {
  const p = path.replace(/^https?:\/\/[^/]+/, "").replace(/\/+$/, "") || "/";
  // --- cloud bucket (public, no auth ever checked) ---
  if (/skyvault-uploads/.test(path) || p.startsWith("/uploads")) {
    const key = path.split("skyvault-uploads.s3.range/")[1] || p.replace(/^\/uploads\/?/, "");
    if (!key) return { status: 200, note: "public bucket listing - anyone can read this", body: { bucket: "skyvault-uploads", public: true, objects: Object.keys(BUCKET) } };
    if (BUCKET[key] !== undefined) return { status: 200, note: "object read from a PUBLIC bucket", body: BUCKET[key] };
    return { status: 404, body: { error: "NoSuchKey" } };
  }
  // --- user records: BOLA, no ownership check ---
  const mUser = p.match(/^\/api\/users\/(\d+)$/);
  if (mUser) {
    const id = mUser[1];
    if (method === "GET") {
      if (!USERS[id]) return { status: 404, body: { error: "user not found" } };
      return { status: 200, note: id === "1007" ? "your own record" : "another user's record - the server never checked it is yours (BOLA)", body: USERS[id] };
    }
  }
  // --- role change: BFLA, no role check on the action ---
  const mRole = p.match(/^\/api\/users\/(\d+)\/role$/);
  if (mRole && (method === "POST" || method === "PUT" || method === "PATCH")) {
    let want = "";
    try { want = String(JSON.parse(body || "{}").role ?? ""); } catch { want = ""; }
    if (!want) return { status: 400, body: { error: "send a JSON body like { \"role\": \"admin\" }" } };
    const id = mRole[1];
    if (!USERS[id]) return { status: 404, body: { error: "user not found" } };
    USERS[id] = { ...USERS[id], role: want };
    return { status: 200, note: "role changed - the endpoint never checked you are allowed to (BFLA)", body: { id: Number(id), role: want, changed: true } };
  }
  // --- admin customers: needs the key; the leaked key works ---
  if (p === "/api/admin/customers" && method === "GET") {
    const token = (auth || "").replace(/^Bearer\s+/i, "").trim();
    if (token !== ADMIN_KEY) return { status: 401, body: { error: "missing or invalid admin key" } };
    return { status: 200, note: "privileged data - unlocked by the leaked key", body: { customers: Object.values(USERS) } };
  }
  if (p === "/" || p === "/api") return { status: 200, body: { service: "Skyvault API", endpoints: ["/api/users/{id}", "/api/users/{id}/role", "/api/admin/customers", "https://skyvault-uploads.s3.range/"] } };
  return { status: 404, body: { error: `no route for ${method} ${p}` } };
}

function pretty(body: unknown): string {
  if (typeof body === "string") return body;
  try { return JSON.stringify(body, null, 2); } catch { return String(body); }
}

function ApiSurface({ host, start, win, hint, reveal, withAuth, withBody, recovered, onSolved }:
  { host: string; start: { method: string; path: string }; win: (m: string, p: string, r: ApiResp) => boolean; hint: string; reveal: { method?: string; path?: string; auth?: string; body?: string }; withAuth?: boolean; withBody?: boolean; recovered?: { label: string; value: string }[]; onSolved: () => void }) {
  const [method, setMethod] = useState(start.method);
  const [path, setPath] = useState(start.path);
  const [auth, setAuth] = useState("");
  const [body, setBody] = useState("");
  const [resp, setResp] = useState<ApiResp | null>(null);
  const [solved, setSolved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  function send() {
    if (solved) return;
    const r = skyvault(method, path.trim(), auth.trim() || null, body);
    setResp(r);
    if (win(method, path.trim(), r) && !solved) { setSolved(true); onSolved(); }
  }
  function copy(v: string) { try { navigator.clipboard?.writeText(v); setCopied(v); setTimeout(() => setCopied((c) => (c === v ? null : c)), 1200); } catch { /* clipboard blocked */ } }
  const sColor = resp ? (resp.status < 300 ? C.green : resp.status < 500 ? C.amber : C.red) : C.mute;

  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.lineSoft}`, background: C.raise }}>
        <i style={dot(C.red)} /><i style={dot(C.amber)} /><i style={dot(C.green)} />
        <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.soft, marginLeft: 6 }}>{host}</span>
      </div>
      <div style={{ padding: 18 }}>
        {recovered && recovered.length > 0 && (
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", padding: "11px 13px", borderRadius: 11, background: "rgba(85,217,140,0.06)", border: `1px solid ${C.green}44`, marginBottom: 14 }}>
            <div style={{ flex: "1 1 240px", minWidth: 220 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase", color: C.green, fontWeight: 700, marginBottom: 7 }}>✓ What you recovered earlier</div>
              <div style={{ display: "grid", gap: 5 }}>
                {recovered.map((r, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", fontFamily: MONO, fontSize: 12.5 }}>
                    <span style={{ color: C.mute }}>{r.label} ·</span>
                    <span style={{ color: C.green, wordBreak: "break-all" }}>{r.value}</span>
                    <button onClick={() => copy(r.value)} className="co-btn" style={{ background: "transparent", border: `1px solid ${C.lineSoft}`, color: copied === r.value ? C.green : C.mute, borderRadius: 6, padding: "1px 7px", fontFamily: MONO, fontSize: 10.5, cursor: "pointer" }}>{copied === r.value ? "copied ✓" : "copy"}</button>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: 11, color: C.mute, marginTop: 6 }}>No need to memorise it, it is right here.</div>
            </div>
            {withAuth && <Btn tone="g" onClick={() => setAuth(`Bearer ${recovered[0].value}`)}>Put it in the header →</Btn>}
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          <select value={method} onChange={(e) => setMethod(e.target.value)} style={{ ...inp, width: 96, cursor: "pointer" }}>
            {["GET", "POST", "PUT", "DELETE"].map((m) => <option key={m}>{m}</option>)}
          </select>
          <input style={{ ...inp, flex: 1, minWidth: 220 }} value={path} onChange={(e) => setPath(e.target.value)} placeholder="/api/users/1007" spellCheck={false} />
        </div>
        {withAuth && <div style={{ marginBottom: 10 }}><label style={lab}>Authorization header (optional)</label><input style={inp} value={auth} onChange={(e) => setAuth(e.target.value)} placeholder="Bearer sk_live_..." spellCheck={false} /></div>}
        {withBody && <div style={{ marginBottom: 10 }}><label style={lab}>request body (JSON)</label><input style={inp} value={body} onChange={(e) => setBody(e.target.value)} placeholder={`{ "role": "admin" }`} spellCheck={false} /></div>}
        <Btn tone="i" onClick={send} disabled={solved}>SEND REQUEST →</Btn>
        {resp && (
          <div style={{ marginTop: 13, borderRadius: 10, overflow: "hidden", border: `1px solid ${C.lineSoft}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: C.carbon, borderBottom: `1px solid ${C.lineSoft}` }}>
              <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, color: sColor }}>{resp.status}</span>
              {resp.note && <span style={{ fontFamily: MONO, fontSize: 11, color: resp.status < 300 ? "#bff3d3" : C.soft }}>{resp.note}</span>}
            </div>
            <pre style={{ margin: 0, padding: "11px 13px", background: "rgba(0,0,0,0.28)", color: "#c6d2f0", fontFamily: MONO, fontSize: 12.5, lineHeight: 1.5, whiteSpace: "pre-wrap", overflowX: "auto" }}>{pretty(resp.body)}</pre>
          </div>
        )}
        {solved && <div className="co-anim co-pop" style={{ marginTop: 11, fontFamily: MONO, fontSize: 12.5, color: C.green }}>✓ that is the flaw - you reached data the server should have gated.</div>}
        <Hints hint={hint} reveal="fill" onReveal={() => { if (reveal.method) setMethod(reveal.method); if (reveal.path) setPath(reveal.path); if (reveal.auth !== undefined) setAuth(reveal.auth); if (reveal.body !== undefined) setBody(reveal.body); }} />
      </div>
    </div>
  );
}

/* ───────────────────────── a single step ───────────────────────── */

type Step = { title: string; goal: string; start: { method: string; path: string }; win: (m: string, p: string, r: ApiResp) => boolean; hint: string; reveal: { method?: string; path?: string; auth?: string; body?: string }; withAuth?: boolean; withBody?: boolean; recovered?: { label: string; value: string }[] };

const HOST = "api.skyvault.range";

function StepView({ step, onSolved }: { step: Step; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(95,230,255,0.05)", border: `1px solid ${C.line}` }}>{G(step.goal, `step-${step.title}`)}</div>
      <ApiSurface host={HOST} start={step.start} win={step.win} hint={step.hint} reveal={step.reveal} withAuth={step.withAuth} withBody={step.withBody} recovered={step.recovered} onSolved={onSolved} />
    </div>
  );
}

/* ───────────────────────── the main capture (Skyvault) ───────────────────────── */

const ACT_STEPS: Step[] = [
  {
    title: "BOLA", goal: "Stage 1 - Read a stranger's record. The Skyvault app loads YOUR profile at GET /api/users/1007. The server never checks the record is yours. Change the id and read another customer.",
    start: { method: "GET", path: "/api/users/1007" },
    win: (m, p, r) => m === "GET" && /\/api\/users\/\d+$/.test(p.replace(/^https?:\/\/[^/]+/, "")) && r.status === 200 && !/\/1007$/.test(p),
    hint: "Just change the number. Try /api/users/1008 or /api/users/1009. You will get their full private record back with a 200.",
    reveal: { method: "GET", path: "/api/users/1008" },
  },
  {
    title: "Public bucket", goal: "Stage 2 - Raid the cloud storage. Skyvault keeps files in a PUBLIC bucket. List it, then read the file that should never be public, the one holding the app's secrets.",
    start: { method: "GET", path: "https://skyvault-uploads.s3.range/" },
    win: (m, p, r) => r.status === 200 && typeof r.body === "string" && /SKYVAULT_ADMIN_KEY/.test(r.body as string),
    hint: "Send the bucket URL to LIST the objects. You will see a config/.env file. Then read it: https://skyvault-uploads.s3.range/config/.env",
    reveal: { method: "GET", path: "https://skyvault-uploads.s3.range/config/.env" },
  },
  {
    title: "Use the key", goal: "Stage 3 - That .env leaked an admin key. Use it. Call the admin endpoint GET /api/admin/customers, and put the key in the Authorization header as a bearer token.",
    start: { method: "GET", path: "/api/admin/customers" }, withAuth: true,
    win: (m, p, r) => p.replace(/^https?:\/\/[^/]+/, "") === "/api/admin/customers" && r.status === 200,
    hint: `Send GET /api/admin/customers with Authorization: Bearer ${ADMIN_KEY}. Without the key you get 401; with it, the whole customer list.`,
    reveal: { method: "GET", path: "/api/admin/customers", auth: `Bearer ${ADMIN_KEY}` },
    recovered: [{ label: "admin key (from config/.env)", value: ADMIN_KEY }],
  },
  {
    title: "Escalate", goal: "Stage 4 - Make yourself an admin. The role-change endpoint never checks you are ALLOWED to set a role (BFLA). POST your own id (1007) a new role of admin.",
    start: { method: "POST", path: "/api/users/1007/role" }, withBody: true,
    win: (m, p, r) => /\/api\/users\/1007\/role$/.test(p.replace(/^https?:\/\/[^/]+/, "")) && (m === "POST" || m === "PUT" || m === "PATCH") && r.status === 200,
    hint: `Set the method to POST, path /api/users/1007/role, and body { "role": "admin" }. The server applies it with no permission check.`,
    reveal: { method: "POST", path: "/api/users/1007/role", body: `{ "role": "admin" }` },
  },
];

function ApiAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(ACT_STEPS.map(() => false));
  const step = ACT_STEPS[si];
  function solved() { setCleared((c) => { const n = [...c]; n[si] = true; return n; }); }
  function advance() { if (si + 1 < ACT_STEPS.length) setSi(si + 1); else onCapture(); }
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {ACT_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? API : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(95,230,255,.08)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? API : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{s.title}</span>
          </div>
        ))}
      </div>
      <StepView key={si} step={step} onSolved={solved} />
      {cleared[si] && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < ACT_STEPS.length ? "Next stage →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: change-the-id ───────────────────────── */

function IdorLab({ onDone }: { onDone: () => void }) {
  const [id, setId] = useState("1007");
  const mine = id.trim() === "1007";
  const known = USERS[id.trim()];
  const fired = !!known && !mine;
  useEffect(() => { if (fired) onDone(); }, [fired, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: API, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · whose data comes back?</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>This app fetches a profile by the id in the URL and never checks it is yours. Yours is 1007. Change the number and see whose record you get.</div>
      <div style={{ display: "flex", alignItems: "center", gap: 2, fontFamily: MONO, fontSize: 13.5, color: C.ink, marginBottom: 10 }}>
        <span style={{ color: C.mute }}>GET /api/users/</span>
        <input value={id} onChange={(e) => setId(e.target.value.replace(/[^0-9]/g, ""))} style={{ width: 70, padding: "5px 8px", borderRadius: 7, background: C.carbon, color: fired ? API : C.ink, border: `1px solid ${fired ? API : C.line}`, fontFamily: MONO, fontSize: 13.5, textAlign: "center" }} />
      </div>
      <div style={{ padding: "10px 12px", borderRadius: 9, background: "rgba(0,0,0,0.3)", border: `1px solid ${C.lineSoft}`, fontFamily: MONO, fontSize: 12.5, color: known ? "#c6d2f0" : C.mute, whiteSpace: "pre-wrap" }}>
        {known ? pretty(known) : "404 user not found"}
      </div>
      {fired && <div style={{ marginTop: 11, fontSize: 13, color: C.ink, lineHeight: 1.5 }}>That is <b>not your record</b>, and the server handed it over anyway. You changed one number and read a stranger. That is BOLA, the number-one API flaw.</div>}
    </div>
  );
}

/* ───────────────────────── defend lab: pick the real fix ───────────────────────── */

function PickDefenceLab({ onDone }: { onDone: () => void }) {
  const [opts] = useState(() => shuffle([
    { code: `use a random-looking id (UUID) instead of a guessable number`, ok: false, why: "Harder to guess, but not a fix: anyone who ever sees a valid id (shared link, logs, the app itself) can still read it. Obscurity is not authorisation." },
    { code: `on every request, check the object belongs to the caller`, ok: true, why: "The real fix: authorise the OBJECT, not just the login. The server must confirm 'does user 1007 own this record?' before returning it, on every endpoint. Pair it with least privilege and private buckets." },
    { code: `send the id in a request header instead of in the URL`, ok: false, why: "Same data, different place. The attacker just changes the header. Moving the id does not add a permission check." },
    { code: `rate-limit the endpoint so ids can't be enumerated quickly`, ok: false, why: "Slows down mass scraping, but one direct request to a known id still returns the record. Rate limiting is not an ownership check." },
  ]));
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: API, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · what actually stops BOLA?</div>
      <AnswerReveal
        options={opts.map((o) => ({ text: o.code, correct: o.ok, reason: o.why }))}
        onAnswered={() => onDone()}
        doShuffle={false}
        mono
      />
    </div>
  );
}

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; step: Step; success: string };

const DRILLS: DrillCfg[] = [
  {
    client: "Loopcart", brief: "Loopcart's shop loads your order at GET /api/users/1008 style ids. Read another customer. No walkthrough.",
    step: { title: "BOLA", goal: "Read a record that is not yours.", start: { method: "GET", path: "/api/users/1007" }, win: (m, p, r) => m === "GET" && /\/api\/users\/\d+$/.test(p.replace(/^https?:\/\/[^/]+/, "")) && r.status === 200 && !/\/1007$/.test(p), hint: "Change the id to 1008 or 1009.", reveal: { path: "/api/users/1009" } },
    success: "BOLA again - one changed id, a stranger's record. The server never checked ownership. Finding logged.",
  },
  {
    client: "Nimbus Files", brief: "Nimbus left a storage bucket public. Find and read the secrets file.",
    step: { title: "Bucket", goal: "List the public bucket and read its secret file.", start: { method: "GET", path: "https://skyvault-uploads.s3.range/" }, win: (m, p, r) => r.status === 200 && typeof r.body === "string" && /SKYVAULT_ADMIN_KEY/.test(r.body as string), hint: "List the bucket URL, then GET config/.env from it.", reveal: { path: "https://skyvault-uploads.s3.range/config/.env" } },
    success: "A public bucket handed over the .env with a live key. Private-by-default would have stopped this. Finding logged.",
  },
  {
    client: "Vantage", brief: "Vantage's admin data sits behind a key, and the key leaked. Use it to pull the customer list.",
    step: { title: "Leaked key", goal: "Use the leaked admin key on the protected endpoint.", start: { method: "GET", path: "/api/admin/customers" }, withAuth: true, win: (m, p, r) => p.replace(/^https?:\/\/[^/]+/, "") === "/api/admin/customers" && r.status === 200, hint: `Authorization: Bearer ${ADMIN_KEY}`, reveal: { auth: `Bearer ${ADMIN_KEY}` }, recovered: [{ label: "admin key (leaked earlier)", value: ADMIN_KEY }] },
    success: "A leaked bearer token is as good as the real app. Rotate and scope keys; never ship them in files. Finding logged.",
  },
  {
    client: "Orbit HR", brief: "The full job. Orbit's role endpoint never checks permissions. Make yourself an admin. Chain it yourself.",
    step: { title: "BFLA", goal: "Escalate your own account to admin.", start: { method: "POST", path: "/api/users/1007/role" }, withBody: true, win: (m, p, r) => /\/api\/users\/1007\/role$/.test(p.replace(/^https?:\/\/[^/]+/, "")) && (m === "POST" || m === "PUT" || m === "PATCH") && r.status === 200, hint: `POST /api/users/1007/role with body { "role": "admin" }.`, reveal: { method: "POST", path: "/api/users/1007/role", body: `{ "role": "admin" }` } },
    success: "BFLA - a normal user set their own role to admin because the action never checked who you are. Finding logged.",
  },
];

function DrillRunner({ cfg, onSolved }: { cfg: DrillCfg; onSolved: () => void }) {
  const [done, setDone] = useState(false);
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {!done && <StepView key={cfg.client} step={cfg.step} onSolved={() => { setDone(true); onSolved(); }} />}
      {done && <div className="co-anim co-pop" style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55`, fontSize: 13, color: "#bff3d3", lineHeight: 1.5 }}>✓ {cfg.success}</div>}
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
          <div key={dr.client} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${k === i ? API : C.lineSoft}`, background: solved[k] ? "rgba(85,217,140,.08)" : k === i ? "rgba(95,230,255,.08)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: solved[k] ? C.green : k === i ? API : C.mute, fontWeight: 700 }}>{solved[k] ? "✓" : `drill ${k + 1}`}</span>
          </div>
        ))}
      </div>
      <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px" }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15.5, color: C.ink }}>{d.client}</div>
        <p style={{ color: C.soft, fontSize: 13.5, lineHeight: 1.55, margin: "6px 0 0" }}>{d.brief}</p>
      </div>
      <DrillRunner key={d.client} cfg={d} onSolved={onSolved} />
      {solved[i] && (
        <div style={{ display: "flex" }}>
          <Btn tone="g" onClick={() => { if (i + 1 < DRILLS.length) setI(i + 1); else onDone(); }} style={{ marginLeft: "auto" }}>{i + 1 < DRILLS.length ? "Next drill →" : "On to the debrief →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── capstone ───────────────────────── */

const CAP_STEPS: Step[] = [
  { title: "Enumerate", goal: "Sableline's cloud app. Start by reading a customer that is not you (BOLA) to prove the object check is missing.", start: { method: "GET", path: "/api/users/1007" }, win: (m, p, r) => m === "GET" && /\/api\/users\/\d+$/.test(p.replace(/^https?:\/\/[^/]+/, "")) && r.status === 200 && !/\/1007$/.test(p), hint: "GET /api/users/1008.", reveal: { path: "/api/users/1008" } },
  { title: "Loot the bucket", goal: "Their uploads bucket is public. Read the secrets file and grab the admin key.", start: { method: "GET", path: "https://skyvault-uploads.s3.range/" }, win: (m, p, r) => r.status === 200 && typeof r.body === "string" && /SKYVAULT_ADMIN_KEY/.test(r.body as string), hint: "List the bucket, then GET config/.env.", reveal: { path: "https://skyvault-uploads.s3.range/config/.env" } },
  { title: "Own it", goal: "Finish it: use the leaked key to pull the full customer list from the admin endpoint.", start: { method: "GET", path: "/api/admin/customers" }, withAuth: true, win: (m, p, r) => p.replace(/^https?:\/\/[^/]+/, "") === "/api/admin/customers" && r.status === 200, hint: `Authorization: Bearer ${ADMIN_KEY}`, reveal: { auth: `Bearer ${ADMIN_KEY}` }, recovered: [{ label: "admin key (from the .env)", value: ADMIN_KEY }] },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  const [cleared, setCleared] = useState(false);
  function next() { if (phase + 1 < CAP_STEPS.length) { setPhase((p) => p + 1); setCleared(false); } else setWon(true); }
  const pct = (phase / CAP_STEPS.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full engagement · step {Math.min(phase + 1, CAP_STEPS.length)} of {CAP_STEPS.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${API}, ${AI})`, transition: "width .4s" }} /></div>
      {!won && <StepView key={phase} step={CAP_STEPS[phase]} onSolved={() => setCleared(true)} />}
      {!won && cleared && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Step {phase + 1} cleared</span>
          <Btn tone="g" onClick={next} style={{ marginLeft: "auto" }}>{phase + 1 < CAP_STEPS.length ? "Next step →" : "Finish the challenge →"}</Btn>
        </div>
      )}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}cl0ud_k3ys_in_the_0pen{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Broken object checks, a public bucket, a leaked key, chained into a full account takeover, the way most cloud breaches actually happen.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE18: ModuleDef = {
  code: "M-18",
  moduleNo: 18,
  title: "Cloud & API Security",
  client: "Skyvault",
  brief:
    "A deep engagement on where modern apps actually live: the cloud, and the APIs that feed them. Skyvault is a cloud storage startup, and like most fast-moving startups it has cut corners. All in your browser against a safe scripted copy of their API: read a stranger's record by changing one number (BOLA), raid a public storage bucket for the file that leaks the admin key, use that key to pull the whole customer list, then make yourself an admin on an endpoint that forgot to check who you are. Then four field jobs for new clients, and a final challenge you run start to finish. Nothing here touches a real server; every response is computed in your browser.",
  industry: {
    tag: "Most cloud breaches are not clever hacks. They are a missing 'are you allowed?' check.",
    motif: { pre: "GET /api/users/", hit: "1007 → 1008", post: "", note: "and a stranger's private record comes back" },
    primer: {
      term: "APIs and buckets",
      what: "Almost every app is two parts: the screen in your hand, and a server somewhere holding the data. They talk over an API, a set of web addresses (endpoints) the app calls, usually answered in JSON. Files like uploads and backups live in cloud 'buckets', online folders on services such as AWS S3. The whole modern internet runs this way, and the flaws nearly all come down to one question the server forgets to ask: are you allowed to see this?",
      example: "Opening your profile fires GET /api/users/42; a stored file sits at a URL like https://acme.s3.range/invoice.pdf.",
      returns: "No exploit kit, no cracked password. You change a number, read a file left public, or find a key someone leaked. If the server trusts the request instead of checking permission, the data is yours, which is exactly what you will do here against a safe scripted copy.",
    },
    learn: [
      "Read a stranger's data by changing one id (BOLA, the #1 API flaw).",
      "Raid a public cloud bucket for files that should never be public.",
      "Find and reuse a leaked API key to reach privileged data.",
      "Exploit an admin action that never checks your role (BFLA).",
    ],
    enginesTitle: "The cloud you'll be breaking into (safely)",
    engines: [
      { name: "AWS S3 / Azure Blob / Google Cloud Storage", color: "#5FE6FF", blurb: "The big three cloud storage services: the buckets where apps keep their files. Set one public by mistake and every file inside is readable by anyone who finds the URL. The battleground.", here: true, icon: "server" },
      { name: "Postman & Burp Suite", color: "#B15BFF", blurb: "How testers, and attackers, send and tamper with API requests: change an id, drop a header, and watch what comes back.", icon: "tool" },
      { name: "trufflehog / gitleaks", color: "#ffb347", blurb: "Scanners that hunt through code and files for secrets people committed by accident, like a live AWS key sitting in a repo.", icon: "scan" },
      { name: "ScoutSuite / Prowler", color: "#4ade80", blurb: "Open-source auditors that check a whole cloud account for misconfigurations, like a bucket that is quietly public.", icon: "shield" },
    ],
    headline: {
      masthead: "THE CLOUD LEDGER",
      dateline: "AUSTRALIA · 2022 · UPGUARD + PUBLIC REPORTING",
      title: "A phone giant leaked 9.8 million people through one open door",
      body: "Optus, Australia's second-largest telecoms company, had a customer-data API facing the public internet that asked for no login at all. Worse, each record was addressed by a simple number that counted upwards. An attacker wrote a short script to count through the ids and pulled back one customer after another: names, dates of birth, and for millions, passport, licence and Medicare numbers. No password was ever cracked; the door was simply unlocked. The country's cyber security minister publicly rejected Optus's claim that the attack had been 'sophisticated'.",
      stat: "9.8M",
      statLabel: "CUSTOMERS EXPOSED THROUGH ONE UNLOCKED API",
      why: "The most damaging breaches are usually the most boring misconfigurations, a forgotten check or a public bucket, not genius hacking. Learn to spot that missing check and you can stop the next one.",
    },
    realWorld:
      "Cloud and API flaws are the defining breach of the 2020s, because this is where data now lives. The pattern is almost always the same: the server checks that you are logged in, but forgets to check that you are allowed to see the specific thing you asked for. So an attacker reads other people's records by changing an id, raids a bucket left public, or reuses a key someone committed to code. No exotic exploit, just a door nobody locked.",
    now: {
      stat: "#1",
      statLabel: "BOLA = API1 on the OWASP API Security Top 10 (2023)",
      body: "Broken Object Level Authorization (BOLA), reading an object the server never checked is yours, is ranked the number-one API risk in the world by OWASP. The scale is enormous: Akamai recorded 108 billion API attacks between January 2023 and June 2024 as attackers followed the data into the cloud.",
    },
    recent: {
      year: "2024",
      title: "Dell's partner API scraped for 49 million records",
      body: "An attacker signed up fake 'partner' accounts, approved within a day with no real checks, then hammered a Dell API that looked up orders by a 7-digit tag, with no rate limit and no ownership check. By counting through the tags they harvested around 49 million order records. The same root cause as Optus, two years later: the problem is not fixed.",
    },
    ahead:
      "Two forces are colliding. The number of APIs is exploding as everything moves to cloud microservices and, now, as AI agents call APIs automatically on your behalf, multiplying the unlocked-door opportunities. At the same time developers increasingly generate code with AI assistants, and that code is often insecure: Veracode's 2025 study found AI models produced vulnerable code in around 45% of tasks. The near future is more APIs, written faster, by tools that are good at working code but not yet good at secure code.",
    role:
      "This is day-one knowledge for cloud security engineers, API security engineers and cloud penetration testers. As companies race into the cloud, the people who can find the missing authorisation check before an attacker does are in sharp demand.",
    roles: ["Cloud security engineer", "API security engineer", "Cloud penetration tester", "DevSecOps engineer"],
  },
  lesson: {
    blocks: [
      { h: "What an API actually is", body: "Almost every app you use is really two parts: the app on your screen, and a server somewhere holding the data. They talk over an API, a set of web addresses (endpoints) the app calls. Open your profile and the app quietly sends GET /api/users/42 to the server, which replies with your data as JSON. APIs are the plumbing of the modern internet, and the cloud is where that plumbing runs." },
      { h: "Why changing one number is an attack", body: "Here is the catch. When the app asks for /api/users/42, a lazy server just looks up record 42 and sends it back, without checking that record 42 belongs to YOU. So you change 42 to 43 and read someone else's data. That is Broken Object Level Authorization (BOLA), also called IDOR, and it is the number-one API security flaw in the world. The id is right there in the URL, under your control." },
      { h: "Buckets: folders anyone can open", body: "Cloud apps store files (uploads, backups, logs) in 'buckets', online folders on services like AWS S3. A bucket can be private or public. Set one public by mistake and every file in it is readable by anyone who finds the URL, including things that were never meant to be seen: database backups, and the dreaded .env file that holds the app's secret keys." },
      { h: "Secrets and keys", body: "Software proves who it is with API keys and tokens, long secret strings that act like passwords for programs. If one leaks, in a public bucket, a screenshot, a public code repo, an attacker holds the keys to the kingdom. A 'bearer' token means exactly that: whoever bears it is trusted, no questions asked. So a stolen key is as good as the real app." },
      { h: "When the door has no lock", body: "The last flaw is the simplest: an action that never checks your ROLE. A 'change my role' or admin endpoint that any logged-in user can call lets a normal account turn itself into an admin. That is Broken Function Level Authorization (BFLA). Across all of these, the pattern is the same: the server trusts the request instead of checking permission." },
    ],
    Interactive: IdorLab,
    summary: [
      "APIs are endpoints (web addresses) apps call for data, usually answered in JSON; the cloud is where they run.",
      "BOLA / IDOR: the server returns an object without checking it is yours, so changing an id reads a stranger's data. The #1 API flaw.",
      "A public cloud bucket leaks every file in it, including backups and the .env secrets file.",
      "A leaked API key or bearer token is as good as the real app; keys must be scoped, rotated, and never shipped in files.",
      "BFLA: an action that never checks your role lets a normal user do admin things. The theme is: check permission, don't trust the request.",
    ],
    check: {
      q: "An app loads your invoice at GET /api/invoices/5531 and shows it fine. You change it to /api/invoices/5532 and get back someone else's invoice with a 200 OK. What is this flaw called?",
      options: [
        { text: "BOLA: the server returns a record by its id without ever checking it belongs to you.", correct: true, feedback: "Right. The id is under your control, so the server has to authorise the object - confirm it's yours - not just that you're logged in." },
        { text: "Nothing is wrong here: you are logged in, so you're allowed to open any invoice the app shows.", feedback: "Being logged in is authentication, not authorisation. You still must not be able to read other people's invoices." },
        { text: "The data is weakly encrypted in transit, so moving the whole API over to HTTPS would fix it.", feedback: "HTTPS protects data in transit but wouldn't stop this; the server itself handed over the wrong record." },
        { text: "The invoice ids are too easy to guess, so switching to long random ids would close the hole.", feedback: "Obscurity isn't authorisation: any leaked or shared id still works. You must check ownership." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "api.skyvault.range + skyvault-uploads.s3.range (a sandboxed, scripted copy of the API and bucket)",
    inScope: "sending requests to the Skyvault API and bucket on the range; the consolidation clients named in each drill",
    offLimits: "real cloud providers, real APIs and real accounts, sending data off the range, other hosts",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge. Change an id to read a stranger (BOLA), raid the public bucket for the .env that leaks the admin key, use the key on the admin endpoint, then POST yourself an admin role (BFLA). Try each yourself first. The API is scripted: a real request gets the real (broken) response. Nothing leaves your machine.",
  hint: "Work the stages in order. BOLA: change the id in /api/users/1007. Bucket: send the bucket URL to list it, then GET config/.env. Key: put it in Authorization as 'Bearer <key>'. Escalate: POST /api/users/1007/role with body { \"role\": \"admin\" }.",
  plan: [
    { label: "BOLA", goal: "Change the id in the URL to read another customer's private record." },
    { label: "Public bucket", goal: "List the public storage bucket and read the .env file that leaks the admin key." },
    { label: "Use the key", goal: "Send the leaked admin key as a bearer token to pull the full customer list." },
    { label: "Escalate (BFLA)", goal: "POST a new role to your own account on an endpoint that never checks permission." },
  ],
  Act: ApiAct,
  flag: "flag{cl0ud_k3ys_in_the_0pen}",
  defend: {
    blocks: [
      { h: "Authorise the object, not just the login", body: "The fix for BOLA is the opposite of trusting the request: on every endpoint, the server must check that the specific object belongs to the user asking. 'Is user 1007 the owner of this record?' before it returns a single byte. Logging in (authentication) is not the same as being allowed (authorisation), and the id in the URL is attacker-controlled, so ownership has to be verified server-side, every time. The same goes for actions: check the user's ROLE before an admin function runs (that closes BFLA)." },
      { h: "Private by default, least privilege everywhere", body: "Buckets should be private by default and only opened deliberately, file by file, never 'public to the whole internet'. Keys and tokens should be scoped to the least they need (a read-only key can't delete anything) and rotated regularly, so a leak is small and short-lived. Never put secrets in a bucket, a repo, or client-side code; use a secrets manager, and scan for leaked keys with tools like trufflehog or gitleaks." },
      { h: "Assume the request is hostile", body: "Treat every incoming request as potentially malicious: validate inputs, rate-limit so an attacker can't enumerate ids quickly, log and alert on odd patterns (one account reading thousands of records), and monitor your cloud config so a bucket never silently goes public. Defence in depth: even if one check is missed, the next one limits the damage." },
    ],
    Interactive: PickDefenceLab,
    check: {
      q: "You were properly logged in the whole time, yet you still read another customer's invoice. What does that tell you?",
      options: [
        { text: "Being logged in (authentication) isn't the same as being allowed (authorisation); the server must check both.", correct: true, feedback: "Right. Authentication proves who you are; authorisation decides what you may touch. BOLA is the second check missing." },
        { text: "Your login token must have been forged, or it could never have reached another account's data.", feedback: "Nothing was forged - you stayed logged in as yourself. The server just never checked the record was yours." },
        { text: "The other customer must at some point have shared their invoice link with your account.", feedback: "Nothing was shared. The endpoint returns any id to anyone logged in, because it never checks ownership." },
        { text: "Logging in should open every record, so the real bug was the server blocking some of them.", feedback: "The opposite - being logged in should NOT open everyone's records. The server needed an ownership check it didn't have." },
      ],
    },
  },
  finding: {
    title: "Cloud & API: BOLA, public storage bucket, leaked admin key, and BFLA privilege escalation",
    where: "api.skyvault.range (object-level + function-level auth missing) · skyvault-uploads.s3.range (public bucket leaking secrets)",
    severity: "Critical",
    cvss: "9.1",
    impact: "Any user can read every other customer's private record by changing an id (BOLA), a public bucket exposes the app's .env and a live admin key, that key unlocks the full customer list, and an unprotected endpoint lets a normal account escalate itself to admin (BFLA). Chained, this is a complete breach of customer data and total account takeover.",
    fix: "Authorise the object and the function on every request (verify ownership and role server-side); make buckets private by default; never store secrets in buckets or code, and scope + rotate keys; validate input, rate-limit, and monitor cloud config and access patterns.",
  },
  takeaway: "Authentication is 'who are you'; authorisation is 'are you allowed'. Most cloud and API breaches are a missing authorisation check, not clever hacking.",
  outcome: [
    "Exploit BOLA/IDOR by changing an id in a request to read data that isn't yours.",
    "Find and read sensitive files in a misconfigured public cloud bucket, including leaked secrets.",
    "Reuse a leaked API key or bearer token to reach privileged endpoints.",
    "Spot and exploit BFLA, and explain why authorising the object and function on every request is the real fix.",
  ],
  cheatsheet: {
    title: "Cloud & API security quick reference",
    blurb: "APIs and cloud storage in plain words: how apps really talk to servers, the flaws you exploited, and the checks that stop them. You do not need to memorise any of it: it lives here, open it whenever you like.",
    sample: {
      caption: "A request and its answer. Change the id and watch the server hand over a record that is not yours, because it only checked you were logged in, not that you were allowed.",
      cols: ["request", "what comes back", "the problem"],
      rows: [
        ["GET /api/users/1007", "your own record (200)", "fine - it's yours"],
        ["GET /api/users/1008", "a stranger's record (200)", "BOLA - no ownership check"],
        ["GET bucket/config/.env", "the app's secret keys (200)", "public bucket - private by default would stop it"],
      ],
    },
    groups: [
      {
        heading: "How an API works",
        entries: [
          { code: "GET", what: "Read data. The most common request; it should never change anything.", example: "GET /api/users/42 reads user 42" },
          { code: "POST / PUT / PATCH", what: "Create or change data. POST makes new; PUT/PATCH update.", example: `POST /api/users/42/role { "role": "admin" }` },
          { code: "DELETE", what: "Remove data. High impact, so it must be tightly authorised.", example: "DELETE /api/users/42" },
          { code: "status codes", what: "200 OK, 401 not logged in, 403 not allowed, 404 not found. A 200 with someone else's data is a flaw.", example: "401 = give me a key; 200 = here it is" },
          { code: "Authorization header", what: "Where you put your key/token to prove who you are. 'Bearer' = whoever holds it is trusted.", example: "Authorization: Bearer sk_live_..." },
        ],
      },
      {
        heading: "The flaws you exploited",
        entries: [
          { code: "BOLA / IDOR", what: "Server returns an object without checking it's yours. Change the id, read a stranger. The #1 API flaw.", example: "/api/users/1007 -> 1008" },
          { code: "BFLA", what: "An action/admin endpoint never checks your role, so a normal user does admin things.", example: "POST your own role -> admin" },
          { code: "public bucket", what: "A cloud storage folder set readable by anyone; leaks every file, backups and .env included.", example: "GET bucket/config/.env" },
          { code: "leaked key", what: "A secret found in a file/repo/screenshot. A bearer token is as good as the real app.", example: "SKYVAULT_ADMIN_KEY=sk_live_..." },
        ],
      },
      {
        heading: "The defences that hold",
        entries: [
          { code: "authorise the object", what: "On every request, verify the object belongs to the user before returning it. This is THE BOLA fix.", example: "'does 1007 own this record?' first" },
          { code: "authorise the function", what: "Check the user's role before an admin action runs. Closes BFLA.", example: "only admins may change roles" },
          { code: "private by default", what: "Buckets private unless deliberately opened; never 'public to the internet'. Secrets go in a secrets manager, not files.", example: "no .env in a bucket or repo" },
          { code: "scope + rotate keys", what: "Least-privilege keys (read-only can't delete), rotated often, scanned for leaks.", example: "trufflehog / gitleaks in CI" },
        ],
      },
    ],
  },
  rep: 75,
  repRank: "Operator",
  repTo: "to Lead Operator",
  next: "NEXT MODULE · Agentic AI Under Attack →",
};

export default function Module18() {
  return <Engagement mod={MODULE18} />;
}
