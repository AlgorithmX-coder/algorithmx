"use client";

import { useState } from "react";
import Link from "next/link";
import { K } from "@/app/ai-cleared/engine/tokens";
import { COURSE_BLURB, COURSE_NAME, FLUENT_NEEDS_CLEARED_FIRM, type CorporateProductSlug, type VatMode } from "@/app/lib/corporateProducts";

/* The seat-pack form: course, seats in tens, firm details, the admin's
 * email, then off to Stripe. Prices are the published ones; Stripe's
 * price objects match them. */
export default function BuyForm({ course: initialCourse, courses, seats: initialSeats, prices, vatPercent, vatMode }: { course: CorporateProductSlug; courses: CorporateProductSlug[]; seats: number; prices: Record<CorporateProductSlug, Record<"TEAM" | "FIRM", number>>; vatPercent: number; vatMode: VatMode }) {
  const [course, setCourse] = useState<CorporateProductSlug>(initialCourse);
  const [seats, setSeats] = useState(initialSeats);
  const [f, setF] = useState({ firmName: "", sector: "", contactName: "", contactRole: "", adminEmail: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const plan: "TEAM" | "FIRM" = seats >= 50 ? "FIRM" : "TEAM";
  const perSeat = prices[course][plan];
  const net = perSeat * seats;
  const vat = Math.round((net * vatPercent) / 100);
  const total = net + vat;
  const gbp = (pence: number) => `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: pence % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
  const totalLabel = vatMode === "automatic" ? `${gbp(total)} a year before VAT` : `${gbp(total)} a year`;
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
        {courses.length > 1 ? (
          <div className="bf-courses" role="radiogroup" aria-label="Course">
            {courses.map((c) => (
              <button key={c} type="button" role="radio" aria-checked={course === c} id={`bf-course-${c}`} className={"bf-course" + (course === c ? " on" : "")} onClick={() => setCourse(c)}>
                <b>{COURSE_NAME[c]}</b>
                <span>{COURSE_BLURB[c]}</span>
              </button>
            ))}
          </div>
        ) : null}
        <div className="bf-row">
          <label>Course <input id="bf-course" value={COURSE_NAME[course]} readOnly /></label>
          <label>Seats <input id="bf-seats" type="number" min={10} max={249} step={10} value={seats} onChange={(e) => setSeats(Math.min(249, Math.max(10, Number(e.target.value) || 10)))} /></label>
          <label>Pack <input id="bf-plan" value={plan === "FIRM" ? "Firm, 50 to 249 seats" : "Team, 10 to 49 seats"} readOnly /></label>
        </div>
        <div className="bf-total">
          <span>{seats} seats × {gbp(perSeat)} = {gbp(net)}{vatMode === "fixed" ? `, VAT at ${vatPercent}% ${gbp(vat)}` : vatMode === "automatic" ? ", VAT added at checkout from your billing address" : ""}</span>
          <b>{totalLabel}</b>
        </div>
        {course === "ai-fluent" ? <p className="cf-note">An AI Fluent seat is claimed by someone who holds a valid AI Cleared certificate. {FLUENT_NEEDS_CLEARED_FIRM}</p> : null}
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
        <p className="cf-note">The admin runs the course for the firm: invites staff, sees the register, edits the firm profile. It can be you. Already run a firm with us? Use the same admin email and the seats are added to that firm.</p>
        <p className="cf-note">By paying you accept the <Link href="/corporate/terms">terms for firms</Link> and the <Link href="/corporate/dpa">data processing agreement</Link>; the <Link href="/corporate/security">security page</Link> says where your people's data lives.</p>
        {err && <div className="bf-err">{err}</div>}
        <button type="button" className="cf-btn cf-btn-pri" onClick={pay} disabled={busy || !f.firmName.trim() || !f.adminEmail.trim()}>{busy ? "Opening secure checkout…" : `Pay ${gbp(total)} by card`}</button>
        <p className="cf-note">Payment is taken by Stripe on a secure page. You receive {vatMode === "none" ? "an invoice" : "a VAT invoice"} by email; enter your firm's VAT number there and it appears on the invoice.</p>
      </div>

      <style jsx>{`
        .bf { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
        .bf-card { display: flex; flex-direction: column; gap: 12px; }
        .bf-courses { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .bf-course { display: flex; flex-direction: column; gap: 4px; text-align: left; font: inherit; cursor: pointer; padding: 12px 14px; border-radius: 12px; border: 1px solid ${K.edge}; background: ${K.glassStrong}; color: ${K.ink}; }
        .bf-course span { font-size: 12.5px; line-height: 1.45; color: ${K.muted}; }
        .bf-course.on { border-color: rgba(87,68,201,0.6); box-shadow: 0 0 0 3px rgba(87,68,201,0.14); }
        .bf-course:focus-visible { outline: 2px solid rgba(87,68,201,0.6); outline-offset: 2px; }
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
        @media (max-width: 640px) { .bf-row, .bf-row.two, .bf-courses { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
