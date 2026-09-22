"use client";

import { useState } from "react";
import { motion } from "framer-motion";

/**
 * The one form on /schools. Posts to /api/schools/enquiry. Kept deliberately
 * short: a head or computing lead should be able to fill it in under a
 * minute. The `website` field is a honeypot and is hidden from real users.
 */

const ROLES = [
  ["head", "Headteacher or principal"],
  ["slt", "Deputy head or SLT"],
  ["computing", "Computing or online-safety lead"],
  ["teacher", "Class teacher"],
  ["it", "IT or network manager"],
  ["other", "Other"],
] as const;

const SIZES = [
  ["u100", "Under 100 pupils"],
  ["100-300", "100 to 300 pupils"],
  ["300-600", "300 to 600 pupils"],
  ["600+", "600+ pupils"],
] as const;

type Form = {
  name: string;
  email: string;
  school: string;
  role: string;
  phase: "primary" | "secondary" | "both";
  size: string;
  message: string;
  website: string;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ACCENT = "#0a7085";

/* Labels were 10.5px at 62% white, which is faint against this panel and
   under the contrast line a school's accessibility check would apply. */
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

export default function EnquiryForm({
  defaultPhase,
}: {
  defaultPhase: "primary" | "secondary";
}) {
  const [f, setF] = useState<Form>({
    name: "",
    email: "",
    school: "",
    role: "",
    phase: defaultPhase,
    size: "",
    message: "",
    website: "",
  });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (state === "error") setState("idle");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    if (f.name.trim().length < 2) return fail("Please tell us your name.");
    if (!EMAIL_RE.test(f.email)) return fail("Please enter a valid email address.");
    if (f.school.trim().length < 2) return fail("Please tell us the name of your school.");
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/schools/enquiry", {
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
          We&rsquo;ll reply to {f.email} within two working days with next steps for {f.school.trim()}.
        </p>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="School enquiry form">
      <div className="sch-form-grid">
        <div>
          <label htmlFor="sch-name" style={label}>Your name</label>
          <input id="sch-name" style={field} value={f.name} onChange={(e) => set("name", e.target.value)} onFocus={focus} onBlur={blur} autoComplete="name" required />
        </div>
        <div>
          <label htmlFor="sch-email" style={label}>Work email</label>
          <input id="sch-email" type="email" style={field} value={f.email} onChange={(e) => set("email", e.target.value)} onFocus={focus} onBlur={blur} autoComplete="email" required />
        </div>
        <div>
          <label htmlFor="sch-school" style={label}>School</label>
          <input id="sch-school" style={field} value={f.school} onChange={(e) => set("school", e.target.value)} onFocus={focus} onBlur={blur} autoComplete="organization" required />
        </div>
        <div>
          <label htmlFor="sch-role" style={label}>Your role</label>
          <select id="sch-role" style={field} value={f.role} onChange={(e) => set("role", e.target.value)} onFocus={focus} onBlur={blur}>
            <option value="">Choose one</option>
            {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <span style={label} id="sch-phase-label">Phase</span>
          <div role="radiogroup" aria-labelledby="sch-phase-label" style={{ display: "flex", gap: 8 }}>
            {(["primary", "secondary", "both"] as const).map((p) => {
              const on = f.phase === p;
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => set("phase", p)}
                  style={{
                    flex: 1,
                    height: 50,
                    borderRadius: 12,
                    border: `1.5px solid ${on ? ACCENT : "rgba(10,112,133,0.28)"}`,
                    background: on ? "rgba(10,112,133,0.14)" : "rgba(8,10,22,0.78)",
                    color: on ? "#14161d" : "rgba(17,22,38,0.76)",
                    fontFamily: "var(--lv2-font-display)",
                    fontSize: 14.5,
                    fontWeight: 600,
                    cursor: "pointer",
                    textTransform: "capitalize",
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label htmlFor="sch-size" style={label}>School size</label>
          <select id="sch-size" style={field} value={f.size} onChange={(e) => set("size", e.target.value)} onFocus={focus} onBlur={blur}>
            <option value="">Choose one</option>
            {SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="sch-form-span">
          <label htmlFor="sch-message" style={label}>Anything else (optional)</label>
          <textarea id="sch-message" style={{ ...field, height: 110, padding: "12px 14px", resize: "vertical" }} value={f.message} onChange={(e) => set("message", e.target.value)} onFocus={focus} onBlur={blur} maxLength={2000} />
        </div>
        {/* Honeypot: hidden from people, filled by bots. */}
        <div aria-hidden style={{ position: "absolute", left: -9999, width: 1, height: 1, overflow: "hidden" }}>
          <label htmlFor="sch-website">Website</label>
          <input id="sch-website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} />
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
        <p role="alert" style={{ marginTop: 14, fontFamily: "var(--lv2-font-display)", fontSize: 14, fontWeight: 600, color: "#f4b878" }}>
          {error}
        </p>
      )}
    </form>
  );
}
