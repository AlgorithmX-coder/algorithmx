"use client";

/* Module 4 - Broken Authentication (DEPTH STANDARD, built to the Module 5
 * framework).
 *
 * Broken-auth logic is pure client-side JavaScript - no server, no network, zero
 * egress - so every attack runs FOR REAL against an in-browser model of the app:
 *   - username enumeration (the login leaks which emails exist),
 *   - no-lockout brute force (a weak password falls to a short spray),
 *   - unsigned session-token forgery (rewrite role=staff -> role=admin),
 *   - sequential password-reset-code takeover (guess the next code).
 *
 * Shape mirrors M5: hover glossary, interactive lesson lab, de-biased check,
 * a FOUR-stage capture with a hint ladder, FOUR consolidation drills on fresh
 * clients, and a chained capstone - all hands-on. */

import { useEffect, useState } from "react";
import Engagement, { type ModuleDef, type GlossaryEntry, C, MONO, DISP, Btn, withGlossary } from "./Engagement";

/* ───────────────────────── glossary ───────────────────────── */

const GLOSSARY: GlossaryEntry[] = [
  { term: "authentication", definition: "Proving you are who you say you are - usually with a password. The front door of an app." },
  { term: "session", definition: "Your logged-in state. After you sign in, the app gives you a token so you don't have to send your password on every click." },
  { term: "session token", definition: "A small piece of data the app hands you at login that says 'this is who I am'. Your browser sends it back on every request." },
  { term: "cookie", definition: "A little bit of data the website stores in your browser and sends back each visit - often where the session token lives." },
  { term: "role", definition: "What you're allowed to do - e.g. 'staff' or 'admin'. Apps decide what you can see from your role." },
  { term: "brute force", definition: "Trying password after password until one works. Cheap and automatic when nothing stops the guessing." },
  { term: "password spraying", definition: "Trying a few likely passwords (company name + year, 'password1') against many accounts - quiet, and effective when passwords are weak." },
  { term: "credential stuffing", definition: "Reusing email/password pairs leaked from other sites' breaches, betting people reused the same password here." },
  { term: "enumerate", definition: "To discover a list one item at a time - here, working out which email addresses are real accounts from how the app replies." },
  { term: "lockout", definition: "Temporarily blocking an account (or slowing it) after too many wrong passwords, so guessing can't run forever." },
  { term: "rate limiting", definition: "Capping how many attempts someone can make in a window of time - the brake on brute force." },
  { term: "multi-factor authentication", definition: "A second proof on top of your password (a code, an app, a key), so a stolen password alone isn't enough." },
  { term: "base64", definition: "A way of writing data as plain letters and numbers. It LOOKS scrambled but it isn't secret - anyone can decode it." },
  { term: "signed", definition: "Stamped with a secret the server alone holds, so any tampering is detected. An unsigned token can be rewritten freely." },
  { term: "privilege escalation", definition: "Turning limited access into more access - e.g. going from a normal user to an admin." },
  { term: "reset token", definition: "The short code or link a 'forgot password' flow sends you to prove it's really you before you set a new password." },
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

function Resp({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 12.5, color: ok ? C.green : C.red, lineHeight: 1.5 }}>{children}</div>;
}

/* A progressive hint ladder: hints one at a time, then a last-resort assist that
 * does the fiddly bit for you (fills the field / reveals the answer). */
function Hints({ hints, assistLabel, onAssist }: { hints: string[]; assistLabel?: string; onAssist?: () => void }) {
  const [shown, setShown] = useState(0);
  return (
    <div style={{ marginTop: 12 }}>
      {Array.from({ length: shown }).map((_, i) => (
        <div key={i} style={{ marginBottom: 6, padding: "9px 12px", borderLeft: `2px solid ${C.indigo}`, background: "rgba(139,123,255,0.05)", fontSize: 13, color: C.soft, lineHeight: 1.5 }}>{hints[i]}</div>
      ))}
      <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
        {shown < hints.length && <button onClick={() => setShown(shown + 1)} style={{ background: "none", border: "none", color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>{shown === 0 ? "hint" : "another hint"}</button>}
        {shown >= hints.length && assistLabel && onAssist && <button onClick={onAssist} style={{ background: "none", border: "none", color: C.mute, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{assistLabel}</button>}
      </div>
    </div>
  );
}

/* ───────────────────────── the auth model (real, in-browser) ───────────────────────── */

type Account = { email: string; password: string; role: "staff" | "admin" | "owner" };
type AuthConfig = {
  host: string;
  accounts: Account[];
  /** Emails that return "no such account" - decoys to make enumeration real. */
  decoys: string[];
  /** The sequential reset-code scheme: your own code, and the target's next one. */
  reset?: { yourCode: string; targetEmail: string; nextCode: string };
};

function b64(obj: unknown): string { try { return btoa(JSON.stringify(obj)); } catch { return ""; } }
function unb64(token: string): { user?: string; role?: string } | null { try { return JSON.parse(atob(token.trim())); } catch { return null; } }

/* ── Surface 1: username enumeration ── */
function EnumerateSurface({ cfg, onSolved }: { cfg: AuthConfig; onSolved: () => void }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const valid = new Set(cfg.accounts.map((a) => a.email));
  const suggestions = [...cfg.decoys.slice(0, 2), cfg.accounts[0].email, ...cfg.decoys.slice(2, 3)];

  function check(e: string) {
    setEmail(e);
    if (valid.has(e.trim())) { setMsg({ ok: true, text: `✗ Wrong password. (The app ADMITTED this account exists - that's the leak.)` }); onSolved(); }
    else setMsg({ ok: false, text: `✗ No account found with that email.` });
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <WinBar host={cfg.host} />
      <div style={{ padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 12 }}>// the login tells you different things for real vs fake emails. Find a REAL account.</div>
        <label style={lab}>email</label>
        <input style={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@..." />
        <div style={{ marginTop: 10 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.mute, marginBottom: 7 }}>EMAILS TO TRY · tap one</div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {suggestions.map((s) => (
              <button key={s} onClick={() => check(s)} className="co-opt" style={{ padding: "5px 9px", borderRadius: 7, border: `1px solid ${C.line}`, background: C.carbon, color: C.indigo2, fontFamily: MONO, fontSize: 12, cursor: "pointer" }}>{s}</button>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 14 }}><Btn tone="i" onClick={() => check(email)}>CHECK EMAIL →</Btn></div>
        {msg && <Resp ok={msg.ok}>{msg.text}</Resp>}
      </div>
    </div>
  );
}

/* ── Surface 2: no-lockout brute force ── */
function BruteSurface({ cfg, email, candidates, onSolved }: { cfg: AuthConfig; email: string; candidates: string[]; onSolved: () => void }) {
  const [pw, setPw] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [tried, setTried] = useState<string[]>([]);
  const [status, setStatus] = useState<null | "fail" | "ok">(null);
  const acct = cfg.accounts.find((a) => a.email === email);

  function attempt(c: string) {
    setAttempts((n) => n + 1);
    setTried((t) => (t.includes(c) ? t : [...t, c]));
    if (acct && c === acct.password) { setStatus("ok"); onSolved(); } else setStatus("fail");
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <WinBar host={cfg.host} />
      <div style={{ padding: 18 }}>
        <div style={{ marginBottom: 12 }}><label style={lab}>email (confirmed real)</label><input style={{ ...inp, opacity: 0.85 }} value={email} readOnly /></div>
        <div style={{ marginBottom: 14 }}><label style={lab}>password</label><input style={inp} value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" /></div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 8 }}>⌦ COMMON-PASSWORD LIST · tap to try</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {candidates.map((c) => (
            <button key={c} onClick={() => { setPw(c); attempt(c); }} disabled={status === "ok"} className="co-opt"
              style={{ padding: "6px 10px", borderRadius: 7, border: `1px solid ${tried.includes(c) ? (acct && c === acct.password ? C.green : C.red) : C.line}`, background: C.carbon, color: C.ink, fontFamily: MONO, fontSize: 12.5, cursor: status === "ok" ? "default" : "pointer" }}>
              {tried.includes(c) ? (acct && c === acct.password ? "✓ " : "✗ ") : ""}{c}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap", marginTop: 14 }}>
          <Btn tone="i" onClick={() => attempt(pw)} disabled={status === "ok"}>LOG IN →</Btn>
          <span style={{ fontFamily: MONO, fontSize: 12, color: attempts > 0 ? C.amber : C.mute }}>attempts: {attempts} · {attempts >= 3 ? "still no lockout ⚠" : "no lockout"}</span>
        </div>
        {status === "fail" && <Resp ok={false}>✗ 401 wrong password - and it let you try again instantly.</Resp>}
        {status === "ok" && <Resp ok>✓ 200 signed in as {acct?.role}. A weak password, and nothing slowed the guessing.</Resp>}
      </div>
    </div>
  );
}

/* ── Surface 3: unsigned session-token forgery ── */
function ForgeSurface({ host, user, startRole, targetRole, onSolved }: { host: string; user: string; startRole: string; targetRole: string; onSolved: () => void }) {
  const [decoded, setDecoded] = useState(false);
  const [role, setRole] = useState(startRole);
  const [resp, setResp] = useState<{ ok: boolean; text: string } | null>(null);
  const token = b64({ user, role });
  const startToken = b64({ user, role: startRole });

  function submit() {
    const parsed = unb64(b64({ user, role }));
    if (parsed?.role === targetRole) { setResp({ ok: true, text: `✓ Server accepted the cookie. You are now ${targetRole}. It never checked the token was genuine.` }); onSolved(); }
    else setResp({ ok: false, text: `✗ Role "${role}" has no admin access. Change the role inside the token.` });
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <WinBar host={host} />
      <div style={{ padding: 18 }}>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 10 }}>// your browser was handed this session cookie at login:</div>
        <div style={{ fontFamily: MONO, fontSize: 12, color: C.soft, background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "10px 12px", wordBreak: "break-all" }}>session={startToken}</div>
        {!decoded ? (
          <div style={{ marginTop: 12 }}><Btn tone="i" onClick={() => setDecoded(true)}>DECODE IT →</Btn></div>
        ) : (
          <>
            <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 11.5, color: C.cyan }}>decoded (just base64 - not secret):</div>
            <pre style={{ margin: "6px 0 0", fontFamily: MONO, fontSize: 12.5, color: "#8fa0c8", whiteSpace: "pre-wrap" }}>{JSON.stringify({ user, role }, null, 2)}</pre>
            <div style={{ marginTop: 14, display: "grid", gap: 10 }}>
              <div><label style={lab}>user (leave as is)</label><input style={{ ...inp, opacity: 0.85 }} value={user} readOnly /></div>
              <div><label style={lab}>role (edit this)</label><input style={inp} value={role} onChange={(e) => setRole(e.target.value)} /></div>
            </div>
            <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 11.5, color: C.mute }}>re-encoded cookie you'll send:</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: C.indigo2, background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "10px 12px", wordBreak: "break-all", marginTop: 4 }}>session={token}</div>
            <div style={{ marginTop: 14 }}><Btn tone="g" onClick={submit}>SUBMIT COOKIE →</Btn></div>
          </>
        )}
        {resp && <Resp ok={resp.ok}>{resp.text}</Resp>}
      </div>
    </div>
  );
}

/* ── Surface 4: sequential reset-code takeover ── */
function ResetSurface({ host, reset, onSolved }: { host: string; reset: NonNullable<AuthConfig["reset"]>; onSolved: () => void }) {
  const [gotYours, setGotYours] = useState(false);
  const [sentTarget, setSentTarget] = useState(false);
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [resp, setResp] = useState<{ ok: boolean; text: string } | null>(null);

  function takeover() {
    if (code.trim() === reset.nextCode) { setResp({ ok: true, text: `✓ Accepted. You set a new password for ${reset.targetEmail}. The account is yours - the reset code was guessable.` }); onSolved(); }
    else setResp({ ok: false, text: `✗ Code rejected. Think about how ${reset.yourCode} relates to the one just issued.` });
  }
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, overflow: "hidden" }}>
      <WinBar host={host} />
      <div style={{ padding: 18, display: "grid", gap: 12 }}>
        <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.mute }}>// 'forgot password' emails a short reset code. Watch how the codes are made.</div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Btn tone="i" onClick={() => setGotYours(true)}>REQUEST A CODE FOR YOUR ACCOUNT</Btn>
          {gotYours && <Btn tone="i" onClick={() => setSentTarget(true)}>NOW REQUEST ONE FOR {reset.targetEmail}</Btn>}
        </div>
        {gotYours && <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.amber }}>→ Your reset code (emailed to you): <b>{reset.yourCode}</b></div>}
        {sentTarget && <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.soft }}>→ A code was sent to {reset.targetEmail}&apos;s inbox. You can&apos;t see it... or can you work it out?</div>}
        {sentTarget && (
          <div style={{ display: "grid", gap: 10, borderTop: `1px solid ${C.lineSoft}`, paddingTop: 12 }}>
            <div><label style={lab}>their reset code (guess it)</label><input style={inp} value={code} onChange={(e) => setCode(e.target.value)} placeholder="RST-...." /></div>
            <div><label style={lab}>new password to set</label><input style={inp} value={newPw} onChange={(e) => setNewPw(e.target.value)} placeholder="anything you like" /></div>
            <div><Btn tone="g" onClick={takeover}>RESET &amp; TAKE OVER →</Btn></div>
          </div>
        )}
        {resp && <Resp ok={resp.ok}>{resp.text}</Resp>}
      </div>
    </div>
  );
}

/* ───────────────────────── a single step (surface + goal + hints) ─────────────────────────
 * The act, the drills and the capstone are all sequences of these. */

type Step =
  | { kind: "enumerate"; goal: string; hints: string[] }
  | { kind: "brute"; goal: string; email: string; candidates: string[]; hints: string[] }
  | { kind: "forge"; goal: string; user: string; startRole: string; targetRole: string; hints: string[] }
  | { kind: "reset"; goal: string; hints: string[] };

function StepView({ cfg, step, onSolved }: { cfg: AuthConfig; step: Step; onSolved: () => void }) {
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ fontSize: 14, color: C.soft, lineHeight: 1.55, padding: "11px 14px", borderRadius: 10, background: "rgba(139,123,255,0.05)", border: `1px solid ${C.line}` }}>{G(step.goal, `step-${step.kind}`)}</div>
      {step.kind === "enumerate" && <EnumerateSurface cfg={cfg} onSolved={onSolved} />}
      {step.kind === "brute" && <BruteSurface cfg={cfg} email={step.email} candidates={step.candidates} onSolved={onSolved} />}
      {step.kind === "forge" && <ForgeSurface host={cfg.host} user={step.user} startRole={step.startRole} targetRole={step.targetRole} onSolved={onSolved} />}
      {step.kind === "reset" && cfg.reset && <ResetSurface host={cfg.host} reset={cfg.reset} onSolved={onSolved} />}
      <Hints hints={step.hints} />
    </div>
  );
}

/* ───────────────────────── the main capture (Caldera Freight) ───────────────────────── */

const CALDERA: AuthConfig = {
  host: "portal.calderafreight.range · driver dispatch",
  accounts: [
    { email: "dispatch@calderafreight.range", password: "Caldera2024!", role: "staff" },
    { email: "a.reyes@calderafreight.range", password: "x", role: "admin" },
    { email: "owner@calderafreight.range", password: "x", role: "owner" },
  ],
  decoys: ["admin@caldera.com", "test@calderafreight.range", "info@calderafreight.range", "root@calderafreight.range"],
  reset: { yourCode: "RST-4417", targetEmail: "owner@calderafreight.range", nextCode: "RST-4418" },
};

const CALDERA_STEPS: Step[] = [
  { kind: "enumerate", goal: "Stage 1 - Enumerate. The login replies differently for real and fake emails. Find a REAL staff account from the responses.", hints: ["Try the tap list. Watch for a reply that talks about the PASSWORD rather than the account not existing.", "dispatch@calderafreight.range is real - the app says 'wrong password', which confirms the account exists."] },
  { kind: "brute", goal: "Stage 2 - Brute force. You have a real account and the login never locks. Spray the common-password list until one lands.", email: "dispatch@calderafreight.range", candidates: ["password1", "dispatch", "Caldera123", "Caldera2024!", "letmein", "Winter2024", "Spring2025"], hints: ["Dispatch teams pick easy ones: company name, a year, a season.", "'Caldera2024!' - company plus year plus a symbol - is exactly the weak pattern people use."] },
  { kind: "forge", goal: "Stage 3 - Forge your session. You're in as staff. Your login cookie is just base64 and it isn't signed. Decode it, change your role to admin, and send it back.", user: "dispatch@calderafreight.range", startRole: "staff", targetRole: "admin", hints: ["Hit DECODE to see it's plain JSON with a 'role' field.", "Change role from staff to admin, then SUBMIT COOKIE. An unsigned token trusts whatever you put in it."] },
  { kind: "reset", goal: "Stage 4 - Take over the owner. As admin you can see an owner account. The 'forgot password' codes are issued in order. Request one for yourself, then work out the owner's.", hints: ["Request a code for your own account first and read the number.", "The codes increase by one. If yours is RST-4417, the next one issued is RST-4418."] },
];

function BrokenAuthAct({ onCapture }: { onCapture: () => void }) {
  const [si, setSi] = useState(0);
  const [cleared, setCleared] = useState<boolean[]>(CALDERA_STEPS.map(() => false));
  const step = CALDERA_STEPS[si];
  function solved() { const n = [...cleared]; n[si] = true; setCleared(n); }
  function advance() { if (si + 1 < CALDERA_STEPS.length) setSi(si + 1); else onCapture(); }

  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {CALDERA_STEPS.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, padding: "5px 11px", borderRadius: 999, border: `1px solid ${i === si ? C.indigo : C.lineSoft}`, background: cleared[i] ? "rgba(85,217,140,.08)" : i === si ? "rgba(139,123,255,.07)" : "transparent" }}>
            <span style={{ fontFamily: MONO, fontSize: 10.5, color: cleared[i] ? C.green : i === si ? C.indigo2 : C.mute, fontWeight: 700 }}>{cleared[i] ? "✓" : i + 1}</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: i === si ? C.ink : C.mute }}>{["Enumerate", "Brute force", "Forge token", "Reset takeover"][i]}</span>
          </div>
        ))}
      </div>
      <StepView key={si} cfg={CALDERA} step={step} onSolved={solved} />
      {cleared[si] && (
        <div className="co-anim co-pop" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "13px 16px", borderRadius: 12, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.green, fontWeight: 700 }}>✓ Stage {si + 1} cleared</span>
          <Btn tone="g" onClick={advance} style={{ marginLeft: "auto" }}>{si + 1 < CALDERA_STEPS.length ? "Next stage →" : "Capture the engagement →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── lesson lab: decode a token ───────────────────────── */

function TokenDecodeLab({ onDone }: { onDone: () => void }) {
  const real = b64({ user: "j.hill", role: "staff" });
  const [val, setVal] = useState("");
  const parsed = unb64(val);
  const matched = !!parsed && parsed.user === "j.hill" && parsed.role === "staff";
  useEffect(() => { if (matched) onDone(); }, [matched, onDone]);
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 9 }}>▶ TRY IT · is a session token really secret?</div>
      <div style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, marginBottom: 10 }}>Here is a real session cookie. Paste it into the box and we&apos;ll decode it live - no key, no password, just base64.</div>
      <div style={{ fontFamily: MONO, fontSize: 12, color: C.soft, background: C.carbon, border: `1px solid ${C.lineSoft}`, borderRadius: 8, padding: "9px 11px", wordBreak: "break-all", marginBottom: 10 }}>{real}</div>
      <input style={inp} value={val} onChange={(e) => setVal(e.target.value)} placeholder="paste the token here" />
      {val && (
        parsed ? (
          <div style={{ marginTop: 11, padding: "10px 13px", borderRadius: 9, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
            <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.green, marginBottom: 6 }}>decoded in your browser - no secret needed:</div>
            <pre style={{ margin: 0, fontFamily: MONO, fontSize: 12.5, color: C.ink, whiteSpace: "pre-wrap" }}>{JSON.stringify(parsed, null, 2)}</pre>
            <div style={{ fontSize: 13, color: C.ink, lineHeight: 1.5, marginTop: 8 }}>See the <b style={{ fontFamily: MONO }}>role</b> field? It&apos;s just text. If the server doesn&apos;t sign the token, you could change that and it would believe you.</div>
          </div>
        ) : (
          <div style={{ marginTop: 10, fontFamily: MONO, fontSize: 12.5, color: C.mute }}>not valid base64 yet - paste the whole token above.</div>
        )
      )}
    </div>
  );
}

/* ───────────────────────── defend lab: pick the safe session design ───────────────────────── */

function PickSafeSessionLab({ onDone }: { onDone: () => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  const opts = [
    { code: `cookie = base64({ user, role })`, ok: false, why: "This is the bug: the role lives in a token the user can read and rewrite. Exactly what you just forged." },
    { code: `cookie = base64({ user, role }) + ".checksum"`, ok: false, why: "A checksum anyone can recompute isn't a signature. If the client can regenerate it, the client can still forge it." },
    { code: `cookie = random_session_id;  role looked up server-side`, ok: true, why: "The token is a meaningless random id; the role is stored on the server and looked up each request, so the client has nothing to tamper with. This is the fix." },
  ];
  return (
    <div style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 12, padding: "15px 16px" }}>
      <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", color: C.indigo, fontWeight: 700, marginBottom: 10 }}>▶ APPLY THE FIX · which session design can&apos;t be forged?</div>
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

/* ───────────────────────── consolidation drills ───────────────────────── */

type DrillCfg = { client: string; brief: string; cfg: AuthConfig; steps: Step[]; success: string };

const DRILLS: DrillCfg[] = [
  {
    client: "Oakfield Academy",
    brief: "Oakfield's parent portal goes live next week. Smoke-test the login: find a real account, then see if a weak password lets a stranger in. No walkthrough this time.",
    cfg: { host: "parents.oakfield.range · portal login", accounts: [{ email: "office@oakfield.range", password: "Oakfield2025", role: "staff" }], decoys: ["admin@oakfield.com", "head@oakfield.range", "test@oakfield.range"] },
    steps: [
      { kind: "enumerate", goal: "Find a real account from the login's responses.", hints: ["Tap through the emails; one reply admits the account exists.", "office@oakfield.range is real - it answers 'wrong password'."] },
      { kind: "brute", goal: "Now brute-force it - the login never locks.", email: "office@oakfield.range", candidates: ["password", "oakfield", "Oakfield2025", "letmein", "Summer2025"], hints: ["School name plus the year is the usual.", "'Oakfield2025' lands."] },
    ],
    success: "Found a live account and walked in on a weak password - no lockout to stop you. Finding logged.",
  },
  {
    client: "Tandem Fitness",
    brief: "Tandem's member app keeps your role in a cookie. You already have a normal member login. See if the app trusts that cookie more than it should.",
    cfg: { host: "app.tandemfitness.range · member area", accounts: [{ email: "m.carter@tandemfitness.range", password: "x", role: "staff" }], decoys: [] },
    steps: [
      { kind: "forge", goal: "Turn your member session into a staff one by editing the unsigned token.", user: "m.carter@tandemfitness.range", startRole: "member", targetRole: "staff", hints: ["Decode the cookie - it's plain JSON.", "Change role from member to staff and resubmit; nothing signs it."] },
    ],
    success: "Promoted yourself by rewriting an unsigned cookie - the server never checked it was genuine. Finding logged.",
  },
  {
    client: "Relay Mail",
    brief: "Relay's webmail has a 'forgot password' flow that texts a short code. The codes look random... but are they? Take over the listed account.",
    cfg: { host: "mail.relay.range · password reset", accounts: [{ email: "support@relay.range", password: "x", role: "staff" }], decoys: [], reset: { yourCode: "RST-8830", targetEmail: "support@relay.range", nextCode: "RST-8831" } },
    steps: [
      { kind: "reset", goal: "Request a code for yourself, read it, then work out support@relay.range's.", hints: ["Codes are issued in sequence.", "Yours is RST-8830, so the next one out is RST-8831."] },
    ],
    success: "Guessed a sequential reset code and seized the account - the codes weren't random at all. Finding logged.",
  },
  {
    client: "Crestline Logistics",
    brief: "The full field job to finish on. Crestline's haulage portal has all three weaknesses at once. No walkthrough: find an account, break in, then escalate to admin. Chain it yourself.",
    cfg: { host: "fleet.crestline.range · haulage portal", accounts: [{ email: "yard@crestline.range", password: "Crestline1", role: "staff" }], decoys: ["admin@crestline.com", "test@crestline.range"] },
    steps: [
      { kind: "enumerate", goal: "Step 1: find a real account.", hints: ["One email answers 'wrong password'.", "yard@crestline.range is real."] },
      { kind: "brute", goal: "Step 2: brute-force it (no lockout).", email: "yard@crestline.range", candidates: ["password1", "crestline", "Crestline1", "haulage", "Winter2025"], hints: ["Company name plus a digit.", "'Crestline1' lands."] },
      { kind: "forge", goal: "Step 3: forge your staff cookie up to admin.", user: "yard@crestline.range", startRole: "staff", targetRole: "admin", hints: ["Decode, edit role, resubmit.", "staff -> admin; it isn't signed."] },
    ],
    success: "Enumerated, brute-forced, then escalated - three broken-auth flaws chained into full control, unguided. That's the whole job. Finding logged.",
  },
];

function DrillRunner({ cfg, steps, success, onSolved }: { cfg: AuthConfig; steps: Step[]; success: string; onSolved: () => void }) {
  const [si, setSi] = useState(0);
  const [done, setDone] = useState(false);
  function stepSolved() {
    if (si + 1 < steps.length) setTimeout(() => setSi(si + 1), 600);
    else { setDone(true); onSolved(); }
  }
  const multi = steps.length > 1;
  return (
    <div style={{ display: "grid", gap: 12 }}>
      {multi && <div style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo2 }}>Step {si + 1} of {steps.length}</div>}
      {!done && <StepView key={si} cfg={cfg} step={steps[si]} onSolved={stepSolved} />}
      {done && <div className="co-anim co-pop" style={{ padding: "11px 14px", borderRadius: 10, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55`, fontSize: 13, color: "#bff3d3", lineHeight: 1.5 }}>✓ {success}</div>}
    </div>
  );
}

function ConsolidationDrills({ onDone }: { onDone: () => void }) {
  const [i, setI] = useState(0);
  const [solved, setSolved] = useState<boolean[]>(DRILLS.map(() => false));
  const d = DRILLS[i];
  function onSolved() { const n = [...solved]; n[i] = true; setSolved(n); }
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
      <DrillRunner key={d.client} cfg={d.cfg} steps={d.steps} success={d.success} onSolved={onSolved} />
      {solved[i] && (
        <div style={{ display: "flex" }}>
          <Btn tone="g" onClick={() => { if (i + 1 < DRILLS.length) setI(i + 1); else onDone(); }} style={{ marginLeft: "auto" }}>{i + 1 < DRILLS.length ? "Next drill →" : "On to the debrief →"}</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── capstone: a full chained engagement ───────────────────────── */

const CAP_CFG: AuthConfig = {
  host: "console.sableline.range · staff console",
  accounts: [
    { email: "helpdesk@sableline.range", password: "Sableline!23", role: "staff" },
    { email: "it.admin@sableline.range", password: "x", role: "admin" },
    { email: "ceo@sableline.range", password: "x", role: "owner" },
  ],
  decoys: ["admin@sableline.com", "test@sableline.range", "root@sableline.range"],
  reset: { yourCode: "RST-6F19", targetEmail: "ceo@sableline.range", nextCode: "RST-6F1A" },
};
const CAP_STEPS: Step[] = [
  { kind: "enumerate", goal: "Sableline hired Redoubt for a full authentication review. Start by finding a real staff account.", hints: ["Only real emails get a 'wrong password' reply."] },
  { kind: "brute", goal: "Break into that account - the login still never locks.", email: "helpdesk@sableline.range", candidates: ["password1", "sableline", "Sableline!23", "helpdesk", "Autumn2025", "letmein"], hints: ["Company name plus a symbol and digits."] },
  { kind: "forge", goal: "Escalate: forge your staff session into an admin one.", user: "helpdesk@sableline.range", startRole: "staff", targetRole: "admin", hints: ["Decode the cookie, flip the role, resubmit - nothing signs it."] },
  { kind: "reset", goal: "Finish it: as admin you can see the CEO's account. Take it over through the sequential reset codes.", hints: ["Read your own code, then step it up by one."] },
];

function CapstoneChallenge({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState(0);
  const [won, setWon] = useState(false);
  function solved() { if (phase + 1 < CAP_STEPS.length) setTimeout(() => setPhase(phase + 1), 650); else setWon(true); }
  const pct = (phase / CAP_STEPS.length) * 100;
  return (
    <div style={{ display: "grid", gap: 14 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.mute }}>Sableline · full engagement · step {Math.min(phase + 1, CAP_STEPS.length)} of {CAP_STEPS.length}</div>
      <div style={{ height: 6, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}><div style={{ height: "100%", width: `${won ? 100 : pct}%`, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, transition: "width .4s" }} /></div>
      {!won && <StepView key={phase} cfg={CAP_CFG} step={CAP_STEPS[phase]} onSolved={solved} />}
      {won && (
        <div className="co-anim co-pop" style={{ textAlign: "center", padding: "20px", borderRadius: 14, background: "rgba(85,217,140,.08)", border: `1px solid ${C.green}55` }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: ".2em", color: C.green, fontWeight: 700 }}>CHALLENGE COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 13.5, color: C.green, marginTop: 8 }}>flag{"{"}auth_ch41n_ceo_pwn3d{"}"}</div>
          <p style={{ fontSize: 13.5, color: C.soft, lineHeight: 1.5, margin: "10px auto 14px", maxWidth: "48ch" }}>Enumerate, brute, forge, reset - a full account-takeover chain, start to finish, in your own hands.</p>
          <Btn tone="g" onClick={onDone}>Continue to the debrief →</Btn>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── module def ───────────────────────── */

export const MODULE4: ModuleDef = {
  code: "M-04",
  moduleNo: 4,
  title: "Broken Authentication",
  client: "Caldera Freight",
  brief:
    "A deep engagement on the front door itself. Caldera's driver portal has weak passwords, no lockout, a session cookie it forgot to sign, and a 'forgot password' flow with guessable codes. Your job is the full chain: find a real account, break in, promote yourself to admin by rewriting your own cookie, then seize the owner's account through the reset flow. Then four field jobs for new clients, and a final challenge you run start to finish. All for real, all in your browser.",
  lesson: {
    blocks: [
      { h: "Authentication is the front door", body: "Authentication is how a system proves you are who you say you are, usually with a password. It is the single most-attacked part of any app, because everything valuable sits behind it. Get the door wrong and the strength of everything else barely matters." },
      { h: "What a session is", body: "Typing your password on every click would be unbearable, so after you log in the app hands your browser a session token and trusts it from then on. Every request carries that token, and the app reads it to decide who you are and what you're allowed to do. So the token is as powerful as your password - and how the app makes and checks it is everything." },
      { h: "How logins break", body: "The classic failures: passwords that are weak or guessable; passwords reused from other sites that attackers already have from past breaches (credential stuffing); no limit on how many guesses you can make, so an attacker can try thousands (brute force and password spraying); and no second factor, so one stolen password is the whole key." },
      { h: "When the token isn't really secret", body: "Some apps pack your identity straight into the token - something like {user, role} - and just base64 it. base64 looks scrambled but it is not secret: anyone can decode it, and if the app did not sign the token, anyone can change it and hand it back. Flip role from 'staff' to 'admin' and an app that trusts the token hands you the keys. That is privilege escalation." },
      { h: "The forgotten back door: password reset", body: "The strongest login in the world does not help if the 'forgot password' flow is weak. If the reset code is short, sequential, or predictable, an attacker just requests a reset for someone else's account and guesses the code - no password needed. The reset flow is a login too, and it has to be just as strong." },
    ],
    Interactive: TokenDecodeLab,
    summary: [
      "Authentication is the front door; the session token you get at login is as powerful as your password.",
      "Logins break on weak passwords, no lockout, credential reuse, and no second factor.",
      "A base64 token is readable, not secret - if it isn't signed, its role field can be rewritten (privilege escalation).",
      "A weak 'forgot password' flow is a back door around the whole login.",
      "The fixes stack: strong + breached-password checks, lockout/rate limits, MFA, signed server-side sessions, random reset codes.",
    ],
    check: {
      q: "An app stores your identity as base64({ user, role }) in the session cookie and reads it back to decide access. Why is that dangerous?",
      options: [
        { text: "base64 is readable and the token isn't signed, so you can change role to admin and the app will believe it.", correct: true, feedback: "Right. base64 isn't encryption; with no signature the client can rewrite the role and the server can't tell." },
        { text: "base64 is slow to decode, so the login takes too long and users give up.", feedback: "No - base64 is instant, and speed isn't the issue; the issue is that it's readable and editable." },
        { text: "The cookie is encrypted, so only an attacker with the key can read the role.", feedback: "base64 isn't encryption at all - there's no key, and anyone can decode it in a second." },
        { text: "It's fine as long as the role is spelled correctly, because the app checks the user field first.", feedback: "The order of fields doesn't matter - nothing stops you editing the role, which is the whole problem." },
      ],
    },
  },
  glossary: GLOSSARY,
  Consolidation: ConsolidationDrills,
  Capstone: CapstoneChallenge,
  scope: {
    target: "portal.calderafreight.range (login, session, password reset)",
    inScope: "the login, the session cookie, the reset flow; the consolidation clients named in each drill",
    offLimits: "real inboxes, other Caldera systems, locking real users out",
    timebox: "this session",
  },
  handler: "Four stages, four field jobs, then one full challenge. Find a real account from how the login replies, spray a weak password it never locks, then rewrite your unsigned cookie to become admin, and finish by guessing the owner's sequential reset code. Try each yourself before the hints. The password field is only for stage two; everything else goes around it.",
  hint: "Work the stages in order. Enumerate from the login's different replies; brute-force the weak password; DECODE your session cookie and flip the role; for the reset, read your own code first - the codes count up by one.",
  Act: BrokenAuthAct,
  flag: "flag{br0k3n_auth_full_ch41n}",
  defend: {
    blocks: [
      { h: "Harden the login", body: "Stack the defences, because no single one is enough. Enforce strong passwords (length matters more than symbols) and block known-breached passwords outright. Rate-limit and lock or slow repeated failures so guessing can't run free. Give the SAME reply whether the email exists or not, so the login can't be used to enumerate accounts. And above all, require multi-factor authentication: a second factor means a stolen or guessed password alone isn't enough." },
      { h: "Make sessions unforgeable", body: "Never put the role in a token the client can edit. The session token should be a random, meaningless id; the real identity and role live on the server, looked up fresh on every request. If you must put data in the token, sign it with a server-only secret so any tampering is detected. Then rewriting 'staff' to 'admin' simply fails." },
      { h: "Lock the back doors", body: "The reset flow is a login, so treat it like one: reset codes must be long, random, single-use, and expire quickly - never sequential or guessable. Rate-limit reset requests too. And apply defence in depth everywhere: least privilege, monitoring for spraying and stuffing, and generic error messages that don't leak which step failed." },
    ],
    Interactive: PickSafeSessionLab,
    check: {
      q: "A team fixes session forgery by appending a checksum to the base64 token so tampering can be 'detected'. Is that enough?",
      options: [
        { text: "No - if the client can recompute the checksum, it can forge it too; use a server-side random session id or a signature with a server-only secret.", correct: true, feedback: "Right. Only a secret the client doesn't have (a signature) or keeping the role server-side actually stops forgery." },
        { text: "Yes - a checksum means any change to the token is detected, so forgery is blocked.", feedback: "Only if the attacker can't reproduce it. A plain checksum uses no secret, so the client recomputes it and forges freely." },
        { text: "Yes, as long as the checksum is a long SHA-256 hash of the token.", feedback: "Hash length doesn't help if there's no secret in it - the attacker hashes their forged token the same way." },
        { text: "No - but the real fix is to base64 the token twice so it's harder to read.", feedback: "Double base64 is still not secret and still editable; obscurity isn't a signature." },
      ],
    },
  },
  finding: {
    title: "Broken authentication: enumeration, no lockout, forgeable session, guessable reset",
    where: "portal.calderafreight.range · login, session cookie, password reset",
    severity: "Critical",
    cvss: "9.8",
    impact: "The login reveals which accounts exist and never locks, so accounts are enumerable and brute-forceable. The session cookie is an unsigned base64 blob whose role field can be rewritten to gain admin. The password-reset codes are sequential and guessable, allowing takeover of any account including the owner - a complete authentication bypass and privilege escalation.",
    fix: "Enforce strong and breached-password checks, rate-limiting/lockout and generic login errors; require MFA; make sessions a random server-side id (or a signed token); and issue long, random, single-use, expiring reset codes.",
  },
  rep: 50,
  repRank: "Junior Operator",
  repTo: "135 / 300 to Operator",
  next: "NEXT MODULE · Injection →",
};

export default function Module4() {
  return <Engagement mod={MODULE4} />;
}
