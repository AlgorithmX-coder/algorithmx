"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/* Staff refunding a card purchase from /admin: one person's course (always
 * in full) or an organisation's places (some or all). Real money, so the
 * button only arms once staff type REFUND, the same deliberate second step
 * as the firm refund. The server applies the effect (access removed, or
 * places taken off) and emails support@; see app/lib/refundEffects.ts. */

const WORD = "REFUND";

function money(pence: number, currency: string) {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: currency.toUpperCase() }).format(pence / 100);
}

export default function RefundButton({
  kind,
  purchaseId,
  remainingPence,
  currency = "gbp",
  what,
}: {
  kind: "consumer" | "place";
  purchaseId: string;
  remainingPence: number;
  currency?: string;
  /** What is being refunded, for the confirm line: "Cyber Heroes", "50 places". */
  what: string;
}) {
  const router = useRouter();
  const partial = kind === "place";
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState((remainingPence / 100).toFixed(2));
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  if (remainingPence <= 0) return <span>Refunded</span>;
  if (done) return <span>{done}</span>;

  async function submit() {
    const pence = partial ? Math.round(Number(amount) * 100) : remainingPence;
    if (!Number.isFinite(pence) || pence <= 0 || pence > remainingPence) {
      setErr(`Enter an amount up to ${money(remainingPence, currency)}.`);
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const body = kind === "consumer" ? { consumerPurchaseId: purchaseId } : { placePurchaseId: purchaseId, amountPence: pence };
      const res = await fetch("/api/admin/refund", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(j.error ?? "The refund did not go through.");
      setDone(`Refunded ${money(pence, currency)}.`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "The refund did not go through.");
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="ad-btn" onClick={() => setOpen(true)}>
        Refund
      </button>
    );
  }

  return (
    <span className="ad-confirm" style={{ display: "inline-flex", flexDirection: "column", gap: 6 }}>
      <span>
        {partial ? (
          <>
            Refund £{" "}
            <input type="number" min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ width: 90 }} aria-label="Amount in pounds" />{" "}
            of {what}
          </>
        ) : (
          <>Refund {money(remainingPence, currency)} for {what} and remove the course.</>
        )}
      </span>
      <span>
        Type {WORD} to confirm:{" "}
        <input value={typed} onChange={(e) => setTyped(e.target.value)} style={{ width: 90 }} aria-label={`Type ${WORD} to confirm`} autoComplete="off" />
      </span>
      <span>
        <button type="button" className="ad-btn ad-btn-pri" onClick={submit} disabled={busy || typed.trim().toUpperCase() !== WORD}>
          {busy ? "Refunding..." : "Confirm refund"}
        </button>{" "}
        <button type="button" className="ad-btn" onClick={() => setOpen(false)} disabled={busy}>
          Cancel
        </button>
      </span>
      {err && <span className="ad-err">{err}</span>}
    </span>
  );
}
