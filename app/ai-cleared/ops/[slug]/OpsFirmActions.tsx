"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* Staff-only actions on one firm: close/reopen its access, and refund a
 * purchase by a typed amount. Separate from AdminPanel (which a firm's
 * own admin also sees) - these are staff-only actions and must never
 * appear in a component a customer can render. Uses this page's own
 * cf-* style system, not /admin's admin.css. */

export interface PurchaseRow {
  id: string;
  course: string;
  seats: number;
  createdAt: string;
  amountPence: number | null;
  refundedPence: number;
  currency: string;
}

function money(pence: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(pence / 100);
}

function RefundRow({ purchase }: { purchase: PurchaseRow }) {
  const router = useRouter();
  const remaining = purchase.amountPence !== null ? purchase.amountPence - purchase.refundedPence : null;
  const [amount, setAmount] = useState(remaining !== null ? (remaining / 100).toFixed(2) : "");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function submit() {
    const pence = Math.round(Number(amount) * 100);
    if (!Number.isFinite(pence) || pence <= 0) {
      setErr("Enter an amount in pounds.");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/refund", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seatPurchaseId: purchase.id, amountPence: pence }) });
      const j = (await res.json().catch(() => ({}))) as { error?: string; refundId?: string };
      if (!res.ok) throw new Error(j.error ?? "The refund did not go through.");
      setDone(`Refunded ${money(pence, purchase.currency)}.`);
      setOpen(false);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The refund did not go through.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 0", borderTop: "1px solid rgba(20,22,29,0.08)" }}>
      <span>
        <b>{purchase.course}</b> &middot; {purchase.seats} seat{purchase.seats === 1 ? "" : "s"} &middot; {new Date(purchase.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        {purchase.amountPence !== null && <> &middot; {money(purchase.amountPence, purchase.currency)} paid{purchase.refundedPence > 0 ? `, ${money(purchase.refundedPence, purchase.currency)} already refunded` : ""}</>}
      </span>
      {done ? (
        <span className="cf-note">{done}</span>
      ) : open ? (
        <span style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          £ <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: 100, padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(20,22,29,0.2)" }} />
          <button type="button" className="cf-btn cf-btn-pri" onClick={submit} disabled={busy}>{busy ? "Refunding…" : "Confirm refund"}</button>
          <button type="button" className="cf-btn" onClick={() => setOpen(false)} disabled={busy}>Cancel</button>
        </span>
      ) : (
        <button type="button" className="cf-btn" onClick={() => setOpen(true)} disabled={purchase.amountPence === null}>Refund</button>
      )}
      {err && <span className="cf-note" style={{ color: "#a63a08" }}>{err}</span>}
    </li>
  );
}

export function PurchasesPanel({ purchases }: { purchases: PurchaseRow[] }) {
  if (purchases.length === 0) return <p className="cf-note">No card purchases on this firm - set up by hand, or seats added without Stripe.</p>;
  return <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>{purchases.map((p) => <RefundRow key={p.id} purchase={p} />)}</ul>;
}

export function RevokeFirmButton({ orgId, revoked }: { orgId: string; revoked: boolean }) {
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
      <span>
        <button type="button" className="cf-btn cf-btn-pri" onClick={() => act("unrevoke")} disabled={busy}>{busy ? "Reopening…" : "Reopen access"}</button>
        {err && <span className="cf-note" style={{ color: "#a63a08" }}> {err}</span>}
      </span>
    );
  }

  if (confirming) {
    return (
      <span style={{ display: "inline-flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
        <span className="cf-note">Close this firm&rsquo;s access right now?</span>
        <button type="button" className="cf-btn cf-btn-pri" onClick={() => act("revoke")} disabled={busy}>{busy ? "Revoking…" : "Yes, revoke access"}</button>
        <button type="button" className="cf-btn" onClick={() => setConfirming(false)}>Cancel</button>
        {err && <span className="cf-note" style={{ color: "#a63a08" }}>{err}</span>}
      </span>
    );
  }

  return <button type="button" className="cf-btn" onClick={() => setConfirming(true)}>Revoke access</button>;
}
