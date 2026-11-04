"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* Removes one person's access to one course - deletes their Entitlement
 * row via /api/admin/individuals/revoke. One button per course row on
 * the person's detail page. */
export default function RevokeEntitlementButton({ userId, productSlug, courseName }: { userId: string; productSlug: string; courseName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function act() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/individuals/revoke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, productSlug }) });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (confirming) {
    return (
      <span>
        <button type="button" className="ad-btn ad-btn-pri" onClick={act} disabled={busy}>{busy ? "Removing…" : `Yes, remove ${courseName}`}</button>{" "}
        <button type="button" className="ad-btn" onClick={() => setConfirming(false)} disabled={busy}>Cancel</button>
        {err && <div className="ad-err">{err}</div>}
      </span>
    );
  }

  return <button type="button" className="ad-btn" onClick={() => setConfirming(true)}>Revoke</button>;
}
