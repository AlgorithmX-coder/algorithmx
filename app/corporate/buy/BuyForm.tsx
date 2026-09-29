"use client";

import { useState } from "react";
import { K } from "@/app/ai-cleared/engine/tokens";
import { VAT_PERCENT, type CorporateProductSlug } from "@/app/lib/corporateProducts";

/* The seat-pack form: course, seats in tens, firm details, the admin's
 * email, then off to Stripe. Prices are the published ones; Stripe's
 * price objects match them. */
export default function BuyForm({ course: initialCourse, seats: initialSeats, prices }: { course: CorporateProductSlug; seats: number; prices: Record<CorporateProductSlug, Record<"TEAM" | "FIRM", number>> }) {
  const [course] = useState<CorporateProductSlug>(initialCourse);
  const [seats, setSeats] = useState(initialSeats);
  const [f, setF] = useState({ firmName: "", sector: "", contactName: "", contactRole: "", adminEmail: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const plan: "TEAM" | "FIRM" = seats >= 50 ? "FIRM" : "TEAM";
  const perSeat = prices[course][plan];
  const net = perSeat * seats;
  const vat = Math.round((net * VAT_PERCENT) / 100);
  const total = net + vat;
  const gbp = (pence: number) => `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: pence % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });

  async function pay() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/corporate/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ course, seats, ...f }) });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !j.url) throw new Error(j.error ?? "Checkout could not start.");
      window.location.href = j.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Checkout could not start.");
      setBusy(false);
    }
  }

  return (
    <div className="bf">
      <div className="cf-card bf-card">
        <div className="bf-row">
          <label>Course <input id="bf-course" value="AI Cleared" readOnly /></label>
          <label>Seats <input id="bf-seats" type="number" min={10} max={249} step={10} value={seats} onChange={(e) => setSeats(Math.min(249, Math.max(10, Number(e.target.value) || 10)))} /></label>
          <label>Pack <input id="bf-plan" value={plan === "FIRM" ? "Firm, 50 to 249 seats" : "Team, 10 to 49 seats"} readOnly /></label>
        </div>
        <div className="bf-total">
          <span>{seats} seats × {gbp(perSeat)} = {gbp(net)}, VAT at {VAT_PERCENT}% {gbp(vat)}</span>
          <b>{gbp(total)} a year</b>
        </div>
        <p className="cf-note">More than 249 seats is an Enterprise conversation: use the enquiry form and we will quote.</p>
      </div>

      <div className="cf-card bf-card">
        <div className="bf-row two">
          <label>Firm name <input id="bf-firm" value={f.firmName} onChange={(e) => set("firmName", e.target.value)} placeholder="Kestrel Mutual" /></label>
          <label>Sector <input id="bf-sector" value={f.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Insurance" /></label>
        </div>
        <div className="bf-row two">
          <label>Who your staff ask about AI <input id="bf-contact" value={f.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Amara Osei" /></label>
          <label>Their role <input id="bf-contact-role" value={f.contactRole} onChange={(e) => set("contactRole", e.target.value)} placeholder="Head of Compliance" /></label>
        </div>
        <label>Admin email, where the invite goes <input id="bf-admin" type="email" value={f.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} placeholder="you@yourfirm.co.uk" /></label>
        <p className="cf-note">The admin runs AI Cleared for the firm: invites staff, sees the register, edits the firm profile. It can be you.</p>
        {err && <div className="bf-err">{err}</div>}
        <button type="button" className="cf-btn cf-btn-pri" onClick={pay} disabled={busy || !f.firmName.trim() || !f.adminEmail.trim()}>{busy ? "Opening secure checkout…" : `Pay ${gbp(total)} by card`}</button>
        <p className="cf-note">Payment is taken by Stripe on a secure page. You receive a VAT invoice by email; enter your firm's VAT number there and it appears on the invoice.</p>
      </div>

      <style jsx>{`
        .bf { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
        .bf-card { display: flex; flex-direction: column; gap: 12px; }
        .bf-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .bf-row.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .bf-card label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${K.muted}; }
        .bf-card input { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 9px 12px; }
        .bf-card input:read-only { color: ${K.muted}; }
        .bf-card input:focus { outline: none; border-color: rgba(87,68,201,0.5); box-shadow: 0 0 0 4px rgba(87,68,201,0.12); }
        .bf-total { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; padding: 12px 14px; border-radius: 12px; background: ${K.sunk}; font-size: 14px; color: ${K.muted}; }
        .bf-total b { font-family: ${K.display}; font-size: 20px; color: ${K.ink}; }
        .bf-err { padding: 10px 14px; border-radius: 10px; font-size: 14px; background: ${K.warnSoft}; color: ${K.warn}; }
        .bf-card .cf-btn { align-self: flex-start; }
        @media (max-width: 640px) { .bf-row, .bf-row.two { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
