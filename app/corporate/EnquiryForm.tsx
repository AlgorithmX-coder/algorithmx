"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * The one form on /corporate. Posts to /api/corporate/enquiry. Same shape and
 * treatment as the schools form so the two pages read as one company: an HR
 * lead or IT manager should fill it in under a minute. The `website` field
 * is a honeypot and is hidden from real users.
 */

const ROLES = [
  ["hr", "HR, people or L&D"],
  ["it", "IT or information security"],
  ["dpo", "DPO, risk or compliance"],
  ["partner", "Partner, director or owner"],
  ["ops", "Operations or office management"],
  ["other", "Other"],
] as const;

const SIZES = [
  ["u10", "Under 10 staff"],
  ["10-49", "10 to 49 staff"],
  ["50-249", "50 to 249 staff"],
  ["250-999", "250 to 999 staff"],
  ["1000+", "1,000+ staff"],
] as const;

const TOOLS = [
  ["copilot", "Microsoft 365 Copilot"],
  ["chatgpt", "ChatGPT"],
  ["gemini", "Gemini"],
  ["claude", "Claude"],
  ["unsure", "Not sure yet"],
] as const;

type Form = {
  name: string;
  email: string;
  company: string;
  role: string;
  size: string;
  tools: string[];
  message: string;
  website: string;
};

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
  height: 54,
  borderRadius: 12,
  padding: "0 16px",
  fontFamily: "var(--lv2-font-display)",
  fontSize: 16.5,
  fontWeight: 500,
  color: "#f2f6ff",
  background: "rgba(6,9,20,0.86)",
  border: "1.5px solid rgba(10,112,133,0.4)",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color .2s ease, box-shadow .2s ease",
};

function focus(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = ACCENT;
  e.currentTarget.style.boxShadow = `0 0 0 3px rgba(10,112,133,0.14)`;
}
function blur(e: React.FocusEvent<HTMLElement>) {
  e.currentTarget.style.borderColor = "rgba(10,112,133,0.4)";
  e.currentTarget.style.boxShadow = "none";
}

export default function EnquiryForm() {
  const [f, setF] = useState<Form>({
    name: "",
    email: "",
    company: "",
    role: "",
    size: "",
    tools: [],
    message: "",
    website: "",
  });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (state === "error") setState("idle");
  };
  const toggleTool = (t: string) =>
    set("tools", f.tools.includes(t) ? f.tools.filter((x) => x !== t) : [...f.tools, t]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    if (f.name.trim().length < 2) return fail("Please tell us your name.");
    if (!EMAIL_RE.test(f.email)) return fail("Please enter a valid work email address.");
    if (f.company.trim().length < 2) return fail("Please tell us the name of your firm.");
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/corporate/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
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

  if (state === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        role="status"
        style={{
          padding: "28px 26px",
          borderRadius: 18,
          background: "rgba(10,112,133,0.08)",
          border: "1px solid rgba(10,112,133,0.4)",
          boxShadow: "0 0 40px -18px rgba(10,112,133,0.9)",
        }}
      >
        <p style={{ margin: 0, fontFamily: "var(--lv2-font-mono)", fontSize: 11, letterSpacing: "0.24em", textTransform: "uppercase", color: ACCENT, fontWeight: 700 }}>
          Received
        </p>
        <h3 style={{ margin: "10px 0 8px", fontFamily: "var(--lv2-font-display)", fontSize: "1.5rem", fontWeight: 500, color: "#14161d", letterSpacing: "-0.01em" }}>
          Thanks, {f.name.trim().split(" ")[0]}.
        </h3>
        <p style={{ margin: 0, fontFamily: "var(--lv2-font-display)", fontSize: 15.5, lineHeight: 1.6, color: "rgba(17,22,38,0.82)" }}>
          We&rsquo;ll reply to {f.email} within two working days with next steps for {f.company.trim()}.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="Corporate enquiry form">
      <div className="corp-form-grid">
        <div>
          <label htmlFor="corp-name" style={label}>Your name</label>
          <input id="corp-name" style={field} value={f.name} onChange={(e) => set("name", e.target.value)} onFocus={focus} onBlur={blur} autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="corp-email" style={label}>Work email</label>
          <input id="corp-email" type="email" style={field} value={f.email} onChange={(e) => set("email", e.target.value)} onFocus={focus} onBlur={blur} autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="corp-company" style={label}>Firm or company</label>
          <input id="corp-company" style={field} value={f.company} onChange={(e) => set("company", e.target.value)} onFocus={focus} onBlur={blur} autoComplete="organization" required />
        </div>
        <div>
          <label htmlFor="corp-role" style={label}>Your role</label>
          <select id="corp-role" style={field} value={f.role} onChange={(e) => set("role", e.target.value)} onFocus={focus} onBlur={blur}>
            <option value="">Choose one</option>
            {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="corp-size" style={label}>Headcount</label>
          <select id="corp-size" style={field} value={f.size} onChange={(e) => set("size", e.target.value)} onFocus={focus} onBlur={blur}>
            <option value="">Choose one</option>
            {SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <span style={label} id="corp-tools-label">AI tools in use</span>
          <div role="group" aria-labelledby="corp-tools-label" className="corp-form-tools">
            {TOOLS.map(([v, l]) => {
              const on = f.tools.includes(v);
              return (
                <button
                  key={v}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleTool(v)}
                  className={`corp-form-tool${on ? " on" : ""}`}
                >
                  {l}
                </button>
              );
            })}
          </div>
        </div>
        <div className="corp-form-span">
          <label htmlFor="corp-message" style={label}>Anything else (optional)</label>
          <textarea id="corp-message" style={{ ...field, height: 110, padding: "12px 14px", resize: "vertical" }} value={f.message} onChange={(e) => set("message", e.target.value)} onFocus={focus} onBlur={blur} maxLength={2000} />
        </div>
        {/* Honeypot: hidden from people, filled by bots. */}
        <div aria-hidden style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
          <label htmlFor="corp-website">Website</label>
          <input id="corp-website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} />
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 16, marginTop: 22 }}>
        <motion.button
          type="submit"
          disabled={state === "loading"}
          whileHover={{ scale: state === "loading" ? 1 : 1.03 }}
          whileTap={{ scale: state === "loading" ? 1 : 0.97 }}
          style={{
            height: 52,
            padding: "0 28px",
            borderRadius: 999,
            border: "none",
            cursor: state === "loading" ? "wait" : "pointer",
            background: "linear-gradient(135deg, #2af0ff 0%, #00cfff 55%, #00b4f0 100%)",
            color: "#04050d",
            fontFamily: "var(--lv2-font-display)",
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: "0.01em",
            boxShadow: "0 12px 30px -12px rgb(10,112,133)",
            opacity: state === "loading" ? 0.7 : 1,
          }}
        >
          {state === "loading" ? "Sending…" : "Send enquiry"}
        </motion.button>
        <span style={{ fontFamily: "var(--lv2-font-display)", fontSize: 13.5, color: "rgba(17,22,38,0.66)" }}>
          A real person replies within two working days.
        </span>
      </div>

      {state === "error" && (
        <p role="alert" style={{ marginTop: 14, fontFamily: "var(--lv2-font-display)", fontSize: 14, fontWeight: 600, color: "#a63a08" }}>
          {error}
        </p>
      )}
    </form>
  );
}
