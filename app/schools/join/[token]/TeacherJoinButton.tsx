"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* The one action on the teacher invite landing: no job-title picker,
 * since a teacher enrols on nothing. */
export default function TeacherJoinButton({ token, orgName }: { token: string; orgName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function claim() {
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/schools/join", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) });
      const j = (await res.json()) as { error?: string; redirect?: string };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      router.push(j.redirect ?? "/schools/classes");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div>
      {error && <p className="shareerr">{error}</p>}
      <button type="button" className="axbtn" onClick={claim} disabled={busy}>
        {busy ? "Setting up…" : `Set up my teacher account at ${orgName}`}
      </button>
    </div>
  );
}
