"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* Closes (or reopens) a school's access. Shared shape with the firms
 * version in app/ai-cleared/ops/[slug]/OpsFirmActions.tsx, but kept as
 * a separate component since that page uses a different style system
 * (cf-* classes, not admin.css's ad-* ones). */
export default function RevokeButton({ orgId, revoked }: { orgId: string; revoked: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  async function act(action: "revoke" | "unrevoke") {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/revoke", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orgId, action }) });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      setConfirming(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  if (revoked) {
    return (
      <div className="ad-made warn">
        <b>This school&rsquo;s access is closed.</b>
        <span>
          <button type="button" className="ad-btn ad-btn-pri" onClick={() => act("unrevoke")} disabled={busy}>{busy ? "Reopening…" : "Reopen access"}</button>
        </span>
        {err && <div className="ad-err">{err}</div>}
      </div>
    );
  }

  if (confirming) {
    return (
      <div className="ad-made warn">
        <b>Close this school&rsquo;s access right now?</b>
        <span>The teacher dashboard and adding new pupils stop immediately. Pupils already added keep their own logins working.</span>
        <span>
          <button type="button" className="ad-btn ad-btn-pri" onClick={() => act("revoke")} disabled={busy}>{busy ? "Revoking…" : "Yes, revoke access"}</button>
          <button type="button" className="ad-btn" onClick={() => setConfirming(false)}>Cancel</button>
        </span>
        {err && <div className="ad-err">{err}</div>}
      </div>
    );
  }

  return <button type="button" className="ad-btn" onClick={() => setConfirming(true)}>Revoke access</button>;
}
