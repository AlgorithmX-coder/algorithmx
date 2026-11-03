"use client";

import { useState } from "react";
import Link from "next/link";
import { K } from "@/app/ai-cleared/engine/tokens";
import { COURSE_BLURB, COURSE_NAME, FIRM_TOOL_OPTIONS, FLUENT_NEEDS_CLEARED_FIRM, type CorporateProductSlug, type VatMode } from "@/app/lib/corporateProducts";

/* The seat-pack form: one course or both, seats in tens, firm details,
 * the admin's email, then off to Stripe. Prices are the published ones;
 * Stripe's price objects match them. "Both" is one checkout with two
 * lines: AI Cleared for everyone, AI Fluent for the people who go on. */
type Mode = CorporateProductSlug | "both";
type Pack = "TEAM" | "FIRM";
const packOf = (n: number): Pack => (n >= 50 ? "FIRM" : "TEAM");
const clamp = (n: number) => Math.min(249, Math.max(10, Math.round(n / 10) * 10 || 10));

export default function BuyForm({ course: initialCourse, courses, seats: initialSeats, both: initialBoth = false, prices, vatPercent, vatMode }: { course: CorporateProductSlug; courses: CorporateProductSlug[]; seats: number; both?: boolean; prices: Record<CorporateProductSlug, Record<Pack, number>>; vatPercent: number; vatMode: VatMode }) {
  const bundleOffered = courses.includes("ai-cleared") && courses.includes("ai-fluent");
  const [mode, setMode] = useState<Mode>(initialBoth && bundleOffered ? "both" : initialCourse);
  const [seats, setSeats] = useState(initialSeats);
  const [fluentSeats, setFluentSeats] = useState(initialSeats);
  const [f, setF] = useState({ firmName: "", sector: "", contactName: "", contactRole: "", adminEmail: "", tool: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const course: CorporateProductSlug = mode === "both" ? "ai-cleared" : mode;
  const lines: { course: CorporateProductSlug; seats: number }[] = mode === "both" ? [{ course: "ai-cleared", seats }, { course: "ai-fluent", seats: fluentSeats }] : [{ course, seats }];
  const priced = lines.map((l) => ({ ...l, pack: packOf(l.seats), perSeat: prices[l.course][packOf(l.seats)], net: prices[l.course][packOf(l.seats)] * l.seats }));
  const net = priced.reduce((a, l) => a + l.net, 0);
  const vat = Math.round((net * vatPercent) / 100);
  const total = net + vat;
  const gbp = (pence: number) => `£${(pence / 100).toLocaleString("en-GB", { minimumFractionDigits: pence % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
  const totalLabel = vatMode === "automatic" ? `${gbp(total)} a year before VAT` : `${gbp(total)} a year`;
  const packLabel = (p: Pack) => (p === "FIRM" ? "Firm, 50 to 249 seats" : "Team, 10 to 49 seats");
  const vatLine = vatMode === "fixed" ? `, VAT at ${vatPercent}% ${gbp(vat)}` : vatMode === "automatic" ? ", VAT added at checkout from your billing address" : "";
  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });

  async function pay() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/corporate/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ course, seats, fluentSeats: mode === "both" ? fluentSeats : 0, ...f }) });
      const j = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !j.url) throw new Error(j.error ?? "Checkout could not start.");
      window.location.href = j.url;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Checkout could not start.");
      setBusy(false);
    }
  }

  const choices: { id: Mode; name: string; blurb: string }[] = courses.map((c) => ({ id: c as Mode, name: COURSE_NAME[c], blurb: COURSE_BLURB[c] }));
  if (bundleOffered) choices.push({ id: "both", name: "Both courses", blurb: "AI Cleared for everyone, AI Fluent for the people who go on. One payment, one invoice." });

  return (
    <div className="bf">
      <div className="cf-card bf-card">
        {choices.length > 1 ? (
          <div className={"bf-courses" + (choices.length > 2 ? " three" : "")} role="radiogroup" aria-label="Course">
            {choices.map((c) => (
              <button key={c.id} type="button" role="radio" aria-checked={mode === c.id} id={`bf-course-${c.id}`} className={"bf-course" + (mode === c.id ? " on" : "")} onClick={() => setMode(c.id)}>
                <b>{c.name}</b>
                <span>{c.blurb}</span>
              </button>
            ))}
          </div>
        ) : null}
        {mode === "both" ? (
          <div className="bf-row">
            <label>AI Cleared seats <input id="bf-seats" type="number" min={10} max={249} step={10} value={seats} onChange={(e) => setSeats(clamp(Number(e.target.value)))} /></label>
            <label>AI Fluent seats <input id="bf-fluent-seats" type="number" min={10} max={249} step={10} value={fluentSeats} onChange={(e) => setFluentSeats(clamp(Number(e.target.value)))} /></label>
            <label>Packs <input id="bf-plan" value={priced.map((l) => (l.pack === "FIRM" ? "Firm" : "Team")).join(" + ")} readOnly /></label>
          </div>
        ) : (
          <div className="bf-row">
            <label>Course <input id="bf-course" value={COURSE_NAME[course]} readOnly /></label>
            <label>Seats <input id="bf-seats" type="number" min={10} max={249} step={10} value={seats} onChange={(e) => setSeats(clamp(Number(e.target.value)))} /></label>
            <label>Pack <input id="bf-plan" value={packLabel(priced[0].pack)} readOnly /></label>
          </div>
        )}
        <div className="bf-total">
          <span>
            {priced.map((l, i) => (
              <span key={l.course} style={{ display: "block" }}>
                {priced.length > 1 ? `${COURSE_NAME[l.course]}: ` : ""}{l.seats} seats × {gbp(l.perSeat)} = {gbp(l.net)}{i === priced.length - 1 ? vatLine : ""}
              </span>
            ))}
          </span>
          <b>{totalLabel}</b>
        </div>
        {mode === "ai-fluent" ? <p className="cf-note">An AI Fluent seat is claimed by someone who holds a valid AI Cleared certificate. {FLUENT_NEEDS_CLEARED_FIRM}</p> : null}
        {mode === "both" ? <p className="cf-note">Everyone takes AI Cleared first; an AI Fluent seat is claimed by someone who holds their AI Cleared certificate. Buy fewer Fluent seats than Cleared if not everyone will go on, and add more later from the same admin email.</p> : null}
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
        <label>The AI tool your staff use <select id="bf-tool" value={f.tool} onChange={(e) => set("tool", e.target.value)}><option value="">Not decided yet</option>{FIRM_TOOL_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select></label>
        <p className="cf-note">Both courses name it as your approved tool and every practice screen is a copy of it. Your admin can change the list at any time.</p>
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
        .bf-courses.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .bf-course { display: flex; flex-direction: column; gap: 4px; text-align: left; font: inherit; cursor: pointer; padding: 12px 14px; border-radius: 12px; border: 1px solid ${K.edge}; background: ${K.glassStrong}; color: ${K.ink}; }
        .bf-course span { font-size: 12.5px; line-height: 1.45; color: ${K.muted}; }
        .bf-course.on { border-color: rgba(87,68,201,0.6); box-shadow: 0 0 0 3px rgba(87,68,201,0.14); }
        .bf-course:focus-visible { outline: 2px solid rgba(87,68,201,0.6); outline-offset: 2px; }
        .bf-row { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
        .bf-row.two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .bf-card label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${K.muted}; }
        .bf-card input, .bf-card select { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 9px 12px; }
        .bf-card input:read-only { color: ${K.muted}; }
        .bf-card input:focus, .bf-card select:focus { outline: none; border-color: rgba(87,68,201,0.5); box-shadow: 0 0 0 4px rgba(87,68,201,0.12); }
        .bf-total { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; flex-wrap: wrap; padding: 12px 14px; border-radius: 12px; background: ${K.sunk}; font-size: 14px; color: ${K.muted}; }
        .bf-total b { font-family: ${K.display}; font-size: 20px; color: ${K.ink}; }
        .bf-err { padding: 10px 14px; border-radius: 10px; font-size: 14px; background: ${K.warnSoft}; color: ${K.warn}; }
        .bf-card .cf-btn { align-self: flex-start; }
        @media (max-width: 640px) { .bf-row, .bf-row.two, .bf-courses, .bf-courses.three { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
