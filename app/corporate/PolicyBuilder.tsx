"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { APPROVED, BANNED, SECTORS, buildPolicy, policyToText, type PolicyProfile, type SectorId } from "./policyText";

/**
 * The free AI use policy, on the page.
 *
 * Six answers on the left, the policy written on the right as they type, and
 * one gate at the end: a work email to receive a copy. That email is the
 * lead. The policy itself is a starting point and says so; nothing here
 * claims to make a firm compliant.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ACCENT = "#0a7085";

const label: React.CSSProperties = {
  display: "block",
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: "0.16em",
  textTransform: "uppercase",
  color: "rgba(17,22,38,0.97)",
  marginBottom: 9,
};

const field: React.CSSProperties = {
  width: "100%",
  height: 50,
  borderRadius: 12,
  padding: "0 14px",
  fontFamily: "var(--lv2-font-display)",
  fontSize: 15.5,
  fontWeight: 500,
  color: "#14161d",
  background: "#fffdf8",
  border: "1.5px solid rgba(10,112,133,0.32)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s ease, box-shadow .2s ease",
};

function focus(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = ACCENT;
  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(10,112,133,0.14)`;
}
function blur(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "rgba(10,112,133,0.32)";
  e.currentTarget.style.boxShadow = "none";
}

export default function PolicyBuilder() {
  const [p, setP] = useState<PolicyProfile>({
    firm: "",
    sector: "legal",
    approved: ["copilot"],
    banned: ["personal-chatgpt", "extensions"],
    contactName: "",
    contactRole: "",
  });
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const set = <K extends keyof PolicyProfile>(k: K, v: PolicyProfile[K]) => {
    setP((x) => ({ ...x, [k]: v }));
    if (state === "error") setState("idle");
  };
  const toggle = (k: "approved" | "banned", id: string) =>
    set(k, p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id]);

  const policy = useMemo(() => buildPolicy(p), [p]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(policyToText(policy));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    if (p.firm.trim().length < 2) return fail("Please tell us the name of your firm, so the policy can carry it.");
    if (name.trim().length < 2) return fail("Please tell us your name.");
    if (!EMAIL_RE.test(email)) return fail("Please enter a valid work email address.");
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/corporate/policy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, name, email, website }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      setState("success");
    } catch (err) {
      fail(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };
  function fail(msg: string) {
    setState("error");
    setError(msg);
  }

  return (
    <div className="corp-pol">
      {/* ── the answers ── */}
      <form onSubmit={send} noValidate aria-label="AI policy generator" className="corp-pol-form">
        <div>
          <label htmlFor="pol-firm" style={label}>Firm name</label>
          <input id="pol-firm" style={field} value={p.firm} onChange={(e) => set("firm", e.target.value)} onFocus={focus} onBlur={blur} autoComplete="organization" placeholder="e.g. Marlow Fenwick LLP" />
        </div>
        <div>
          <label htmlFor="pol-sector" style={label}>Sector</label>
          <select id="pol-sector" style={field} value={p.sector} onChange={(e) => set("sector", e.target.value as SectorId)} onFocus={focus} onBlur={blur}>
            {SECTORS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <span style={label} id="pol-approved-label">Approved for work data</span>
          <div role="group" aria-labelledby="pol-approved-label" className="corp-pol-chips">
            {APPROVED.map(([v, l]) => (
              <button key={v} type="button" aria-pressed={p.approved.includes(v)} onClick={() => toggle("approved", v)} className={`corp-pol-chip${p.approved.includes(v) ? " on" : ""}`}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <span style={label} id="pol-banned-label">Not allowed for work</span>
          <div role="group" aria-labelledby="pol-banned-label" className="corp-pol-chips">
            {BANNED.map(([v, l]) => (
              <button key={v} type="button" aria-pressed={p.banned.includes(v)} onClick={() => toggle("banned", v)} className={`corp-pol-chip corp-pol-chip-no${p.banned.includes(v) ? " on" : ""}`}>{l}</button>
            ))}
          </div>
        </div>
        <div className="corp-pol-two">
          <div>
            <label htmlFor="pol-cname" style={label}>Who staff should ask</label>
            <input id="pol-cname" style={field} value={p.contactName} onChange={(e) => set("contactName", e.target.value)} onFocus={focus} onBlur={blur} placeholder="Name" />
          </div>
          <div>
            <label htmlFor="pol-crole" style={label}>Their role</label>
            <input id="pol-crole" style={field} value={p.contactRole} onChange={(e) => set("contactRole", e.target.value)} onFocus={focus} onBlur={blur} placeholder="e.g. DPO, Office Manager" />
          </div>
        </div>

        <div className="corp-pol-gate">
          <p className="corp-pol-gate-head">Email me a copy</p>
          {state === "success" ? (
            <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} role="status" className="corp-pol-ok">
              Sent to {email}. The same copy is on the right, and we will be in touch about training your team.
            </motion.p>
          ) : (
            <>
              <div className="corp-pol-two">
                <div>
                  <label htmlFor="pol-name" style={label}>Your name</label>
                  <input id="pol-name" style={field} value={name} onChange={(e) => { setName(e.target.value); if (state === "error") setState("idle"); }} onFocus={focus} onBlur={blur} autoComplete="name" />
                </div>
                <div>
                  <label htmlFor="pol-email" style={label}>Work email</label>
                  <input id="pol-email" type="email" style={field} value={email} onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }} onFocus={focus} onBlur={blur} autoComplete="email" />
                </div>
              </div>
              <div aria-hidden style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
                <label htmlFor="pol-website">Website</label>
                <input id="pol-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </div>
              <div className="corp-pol-actions">
                <motion.button type="submit" disabled={state === "loading"} whileHover={{ scale: state === "loading" ? 1 : 1.03 }} whileTap={{ scale: state === "loading" ? 1 : 0.97 }} className="corp-pol-send">
                  {state === "loading" ? "Sending…" : "Send me the policy"}
                </motion.button>
                <span className="corp-pol-fine">Free. We reply about training within two working days.</span>
              </div>
              {state === "error" && <p role="alert" className="corp-pol-err">{error}</p>}
            </>
          )}
        </div>
      </form>

      {/* ── the policy, live ── */}
      <div className="corp-pol-doc" aria-live="polite">
        <div className="corp-pol-doc-bar">
          <span>{policy.stamp}</span>
          <button type="button" onClick={copy} className="corp-pol-copy">{copied ? "Copied" : "Copy text"}</button>
        </div>
        <div className="corp-pol-doc-body">
          <h3>{policy.title}</h3>
          <p className="corp-pol-doc-intro">{policy.intro}</p>
          {policy.sections.map((s) => (
            <section key={s.heading}>
              <h4>{s.heading}</h4>
              {s.paras.map((t, i) => <p key={i}>{t}</p>)}
              {s.bullets && <ul>{s.bullets.map((b) => <li key={b}>{b}</li>)}</ul>}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
