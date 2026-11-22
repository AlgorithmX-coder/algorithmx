"use client";

import { useState } from "react";

/**
 * The one form on /schools, restyled for the Hologram Campus page (glass
 * fields, cyan focus rings, a segmented phase control). A copy of
 * app/schools/EnquiryForm.tsx with the inline styles replaced by classes in
 * schools.css: same fields, same options, same honeypot, same validation,
 * same loading / success / error states, and the same POST body to
 * /api/schools/enquiry. The API contract is unchanged.
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

export default function HoloEnquiryForm({ defaultPhase }: { defaultPhase: "primary" | "secondary" }) {
  const [f, setF] = useState<Form>({ name: "", email: "", school: "", role: "", phase: defaultPhase, size: "", message: "", website: "" });
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  /* the phase picker higher up the page re-defaults the form's phase
     (state adjusted during render, the React-sanctioned way to follow a prop) */
  const [seenDefault, setSeenDefault] = useState(defaultPhase);
  if (seenDefault !== defaultPhase) { setSeenDefault(defaultPhase); setF((p) => ({ ...p, phase: defaultPhase })); }

  const set = <K extends keyof Form>(k: K, v: Form[K]) => {
    setF((p) => ({ ...p, [k]: v }));
    if (state === "error") setState("idle");
  };

  function fail(msg: string) { setState("error"); setError(msg); }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    if (f.name.trim().length < 2) return fail("Please tell us your name.");
    if (!EMAIL_RE.test(f.email)) return fail("Please enter a valid email address.");
    if (f.school.trim().length < 2) return fail("Please tell us the name of your school.");
    setState("loading");
    setError("");
    try {
      const res = await fetch("/api/schools/enquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(f) });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Something went wrong. Please try again.");
      }
      setState("success");
    } catch (err) {
      fail(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  if (state === "success") {
    return (
      <div className="glass success" role="status">
        <div className="eyeb">Received</div>
        <h3>Thanks, {f.name.trim().split(" ")[0]}.</h3>
        <p>We&rsquo;ll reply to {f.email} within two working days with next steps for {f.school.trim()}.</p>
      </div>
    );
  }

  return (
    <form className="form glass" onSubmit={onSubmit} noValidate aria-label="School enquiry form">
      <div className="fgrid">
        <div className="field">
          <label htmlFor="sch-name">Your name</label>
          <input id="sch-name" value={f.name} onChange={(e) => set("name", e.target.value)} autoComplete="name" required />
        </div>
        <div className="field">
          <label htmlFor="sch-email">Work email</label>
          <input id="sch-email" type="email" value={f.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="sch-school">School</label>
          <input id="sch-school" value={f.school} onChange={(e) => set("school", e.target.value)} autoComplete="organization" required />
        </div>
        <div className="field">
          <label htmlFor="sch-role">Your role</label>
          <select id="sch-role" value={f.role} onChange={(e) => set("role", e.target.value)}>
            <option value="">Choose one</option>
            {ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field">
          <span className="lab" id="sch-phase-label">Phase</span>
          <div role="radiogroup" aria-labelledby="sch-phase-label" className="radios">
            {(["primary", "secondary", "both"] as const).map((p) => (
              <button key={p} type="button" role="radio" aria-checked={f.phase === p} onClick={() => set("phase", p)} className={f.phase === p ? "on" : ""}>{p}</button>
            ))}
          </div>
        </div>
        <div className="field">
          <label htmlFor="sch-size">School size</label>
          <select id="sch-size" value={f.size} onChange={(e) => set("size", e.target.value)}>
            <option value="">Choose one</option>
            {SIZES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div className="field span">
          <label htmlFor="sch-message">Anything else (optional)</label>
          <textarea id="sch-message" value={f.message} onChange={(e) => set("message", e.target.value)} maxLength={2000} />
        </div>
        {/* Honeypot: hidden from people, filled by bots. */}
        <div aria-hidden className="hp">
          <label htmlFor="sch-website">Website</label>
          <input id="sch-website" tabIndex={-1} autoComplete="off" value={f.website} onChange={(e) => set("website", e.target.value)} />
        </div>
      </div>

      <div className="frow">
        <button className="btn primary" type="submit" disabled={state === "loading"} aria-busy={state === "loading"}>
          {state === "loading" ? "Sending…" : "Send enquiry"}
        </button>
        <span className="help">A real person replies within two working days.</span>
      </div>

      {state === "error" && <p role="alert" className="ferr">{error}</p>}
    </form>
  );
}
