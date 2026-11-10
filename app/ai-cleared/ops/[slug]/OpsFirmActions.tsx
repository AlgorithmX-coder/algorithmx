"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { checkFirmSeats } from "@/app/lib/firmSeats";

/* Staff-only actions on one firm: close/reopen its access, and refund a
 * purchase by a typed amount. Separate from TeamPanel (which a firm's
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

/**
 * Edit a firm's Cyber Secured seat count: an invoice-paid top-up, a
 * correction, a goodwill seat. Seat count only; Stripe is never touched.
 *
 * Shows the floor (people already holding a seat) beside the box, the same
 * way the schools PlacesControl does: the number staff type only means
 * anything against the number already taken, and saying so up front is
 * kinder than explaining a refusal. The same checkFirmSeats runs here and
 * on the server; the server's is the one that counts.
 */
const field = { padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(20,22,29,0.2)" } as const;

export function SeatsControl({ orgId, seats, held }: { orgId: string; seats: number; held: number }) {
  const router = useRouter();
  const [value, setValue] = useState(String(seats));
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const check = checkFirmSeats({ seats: value, held, current: seats, reason });
  const unchanged = check.ok && check.unchanged;
  /* Only shout about the number while typing; the reason's own message
     waits for Save, so an empty reason box is not an error on load. */
  const numberProblem = !check.ok && (check.error === "not_whole" || check.error === "below_held" || check.error === "over_max") ? check.message : null;

  async function save() {
    if (!check.ok) {
      setErr(check.message);
      return;
    }
    setBusy(true);
    setErr(null);
    setDone(null);
    try {
      const res = await fetch("/api/ops/firms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orgId, seatsPurchased: check.seats, reason: check.reason }),
      });
      const j = (await res.json().catch(() => ({}))) as { error?: string; previous?: number; seats?: number };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      setDone(j.previous !== j.seats ? `Changed from ${j.previous} to ${j.seats}. Logged with your reason.` : "Saved. Nothing changed.");
      setReason("");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-testid="seats-control" style={{ display: "flex", flexDirection: "column", gap: 8, padding: "10px 0 16px" }}>
      <span className="cf-note">
        {held === 0 ? "Nobody holds a seat yet, so this can be set to anything." : `${held} ${held === 1 ? "person holds" : "people hold"} a seat, so it cannot go below ${held}.`}
      </span>
      <span style={{ display: "flex", gap: 10, alignItems: "flex-end", flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13 }}>
          Seats
          <input
            id="ops-seats"
            type="number"
            inputMode="numeric"
            min={held}
            max={10000}
            step={1}
            value={value}
            onChange={(e) => { setValue(e.target.value); setErr(null); setDone(null); }}
            style={{ ...field, width: 110 }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 13, flex: "1 1 260px", minWidth: 0 }}>
          Reason (required)
          <input
            id="ops-seats-reason"
            value={reason}
            maxLength={200}
            placeholder="e.g. Invoice 1042 paid, 5 more seats"
            onChange={(e) => { setReason(e.target.value); setErr(null); setDone(null); }}
            style={field}
          />
        </label>
        {/* cf-btn-pri has no disabled look of its own, so say it here: a
            refused number should not leave a button that looks pressable. */}
        <button
          type="button"
          className="cf-btn cf-btn-pri"
          onClick={save}
          disabled={busy || !!numberProblem || unchanged}
          style={busy || numberProblem || unchanged ? { opacity: 0.45, cursor: "not-allowed" } : undefined}
        >
          {busy ? "Saving…" : "Save seats"}
        </button>
      </span>
      <span className="cf-note">Changes the seat count only. No charge is made.</span>
      {(numberProblem || err) && <span className="cf-note" role="alert" style={{ color: "#a63a08" }}>{err ?? numberProblem}</span>}
      {done && <span className="cf-note" role="status">{done}</span>}
    </div>
  );
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

/**
 * Delete a firm for good. Only rendered once its access is closed.
 *
 * Same rule and same endpoint as the schools side: closing access is a
 * separate, reversible act that someone had to mean, and this button does
 * not exist before it. The server checks the condition again, because a
 * button is not a gate.
 *
 * Unlike a school, deleting a firm never deletes its people. A firm's
 * learners are real people with real work addresses who may hold a course
 * of their own; they lose the seat and the enrolment and keep the account.
 */
export function DeleteFirmButton({ orgId, name, revoked }: { orgId: string; name: string; revoked: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (!revoked) return null;

  async function remove() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/admin/delete-org", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orgId }) });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "Something went wrong.");
      router.push("/admin/firms");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong.");
      setBusy(false);
    }
  }

  if (!open) {
    return <button type="button" className="cf-btn" style={{ color: "#a11" }} onClick={() => setOpen(true)}>Delete this firm</button>;
  }

  return (
    <span style={{ display: "inline-flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <span className="cf-note">
        Delete {name} for good? This cannot be undone. Seats, enrolments and certificates go with it.
        The people keep their own accounts.
      </span>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value)}
        placeholder={name}
        autoComplete="off"
        aria-label={`Type ${name} to confirm deletion`}
        style={{ padding: "6px 8px", borderRadius: 8, border: "1px solid rgba(20,22,29,0.2)", minWidth: 160 }}
      />
      <button type="button" className="cf-btn cf-btn-pri" onClick={remove} disabled={busy || typed.trim() !== name}>
        {busy ? "Deleting…" : "Delete this firm"}
      </button>
      <button type="button" className="cf-btn" onClick={() => { setOpen(false); setTyped(""); }} disabled={busy}>Cancel</button>
      {err && <span className="cf-note" style={{ color: "#a63a08" }}>{err}</span>}
    </span>
  );
}
