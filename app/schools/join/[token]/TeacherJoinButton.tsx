"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* The one action on the teacher invite landing: no job-title picker,
 * since a teacher enrols on nothing. The request, the redirect and the
 * error text are unchanged; the look is the round 8 light house's (r8-btn,
 * r8-msg in dead-end.css), as the page is drawn by DeadEnd and this sits
 * in its actions row. The label keeps its case (data-case="keep"): it
 * carries the school name, shown exactly as staff typed it.
 *
 * Also the button on a school's staff join link. There it may carry the
 * `confirm` signature from the emailed link, and on a link locked to the
 * school's domain the first press sends that email instead of joining, so
 * the reply can say "check your inbox" rather than move on. */
export default function TeacherJoinButton({
  token,
  orgName,
  confirm,
  label,
}: {
  token: string;
  orgName: string;
  confirm?: string;
  /** Overrides the default "Set up my teacher account at ..." */
  label?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  async function claim() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/schools/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(confirm ? { token, confirm } : { token }) });
      const j = (await res.json()) as { error?: string; redirect?: string; emailed?: boolean; email?: string };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      if (j.emailed) {
        setSentTo(j.email ?? "your inbox");
        setBusy(false);
        return;
      }
      router.push(j.redirect ?? "/schools/classes");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (sentTo) {
    return (
      <p className="r8-msg" data-tone="ok" role="status" aria-live="polite">
        <span>
          We have emailed <b>{sentTo}</b>. Open the link in that email to finish joining {orgName}. It works for 24 hours.
        </span>
      </p>
    );
  }

  return (
    <>
      <p className="r8-msg" data-tone="err" role="alert" aria-live="polite" hidden={!error}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
        <span>{error}</span>
      </p>
      <button type="button" className="r8-btn" data-case="keep" onClick={claim} disabled={busy} aria-busy={busy}>
        {busy ? <>Setting up…<span className="r8-dots" aria-hidden="true"><i /><i /><i /></span></> : label ?? `Set up my teacher account at ${orgName}`}
      </button>
    </>
  );
}
