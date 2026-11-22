"use client";

import { useState } from "react";
import { AXP } from "./content";

/* The enrol band's waitlist, the same behaviour as app/components/WaitlistForm
 * (the email test, the POST to /api/waitlist with { email, courseSlug, source },
 * the loading, error and success strings) restyled for the glass slab. The
 * rocket and the check are inline SVG (no emoji rule). */

const WL = AXP.waitlist;

const ROCKET = (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 15c-1.5 1.5-2 5-2 5s3.5-.5 5-2" /><path d="M14 4c3-1 6-1 6-1s0 3-1 6-5 6-9 8l-4-4c2-4 5-7 8-9z" /><circle cx="15" cy="9" r="1.5" />
  </svg>
);
const CHECK = <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5" /></svg>;

export default function HoloWaitlist({ courseSlug }: { courseSlug: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === "loading" || state === "success") return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setState("error");
      setErrorMsg(WL.errorInvalid);
      return;
    }
    setState("loading");
    setErrorMsg("");
    try {
      const res = await fetch(WL.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, courseSlug, source: WL.source }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Server error");
      }
      setState("success");
    } catch (err: unknown) {
      setState("error");
      setErrorMsg(err instanceof Error ? err.message : WL.errorServerFallback);
    }
  };

  if (state === "success") {
    return <div className="wlok" role="status">{CHECK}<span>{WL.success}</span></div>;
  }

  return (
    <>
      <form className="wl" onSubmit={onSubmit} noValidate>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
          placeholder={WL.placeholder}
          aria-label={WL.inputAriaLabel}
          aria-invalid={state === "error" || undefined}
        />
        <button type="submit" disabled={state === "loading"}>
          {state === "loading" ? WL.buttonLoading : <>{WL.button}{ROCKET}</>}
        </button>
      </form>
      <p className="wlmsg" role="alert">{state === "error" ? errorMsg : ""}</p>
    </>
  );
}
