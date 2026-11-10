"use client";

import { useState } from "react";
import { K } from "@/app/ai-cleared/engine/tokens";
import { FIRM_TOOL_OPTIONS, type VatMode } from "@/app/lib/corporateProducts";
import { FIRM_RATE_FROM, SECURED_RATE_PENCE, SECURED_SEAT_MAX, SECURED_SEAT_MIN, TIER_NAME, cheaperAtThreshold, clampSeats, gbp, securedQuote } from "@/app/lib/cyberSecuredPricing";

/* The Cyber Secured order form: a seat count, the rate it earns shown as
 * the buyer types, the totals before and after VAT, the firm's details and
 * the admin's email, then off to Stripe. The figures come from the same
 * module the checkout charges from, so the page and Stripe always agree. */
export default function BuyForm({ seats: initialSeats, vatPercent, vatMode }: { seats: number; vatPercent: number; vatMode: VatMode }) {
  const [raw, setRaw] = useState(String(initialSeats));
  const [f, setF] = useState({ firmName: "", sector: "", contactName: "", contactRole: "", adminEmail: "", tool: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const typed = Number(raw);
  const valid = raw.trim() !== "" && Number.isInteger(typed) && typed >= SECURED_SEAT_MIN && typed <= SECURED_SEAT_MAX;
  const seats = valid ? typed : clampSeats(typed);
  const q = securedQuote(seats, vatMode, vatPercent);
  const better = cheaperAtThreshold(seats);
  const set = (k: keyof typeof f, v: string) => setF({ ...f, [k]: v });

  const rateLine =
    q.tier === "FIRM"
      ? `${FIRM_RATE_FROM} seats or more: ${gbp(SECURED_RATE_PENCE.FIRM)} per seat, the Firm rate.`
      : `Under ${FIRM_RATE_FROM} seats: ${gbp(SECURED_RATE_PENCE.TEAM)} per seat, the Team rate. ${FIRM_RATE_FROM} seats or more: ${gbp(SECURED_RATE_PENCE.FIRM)} per seat.`;
  const payLabel = q.incVatPence === null ? `Pay ${gbp(q.exVatPence)} plus VAT by card` : `Pay ${gbp(q.incVatPence)} by card`;

  async function pay() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch("/api/corporate/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ seats, ...f }) });
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
        <div className="bf-row keep">
          <label>
            Seats
            <input id="bf-seats" type="number" inputMode="numeric" min={SECURED_SEAT_MIN} max={SECURED_SEAT_MAX} step={1} value={raw} onChange={(e) => setRaw(e.target.value)} onBlur={() => setRaw(String(seats))} />
          </label>
          <label>
            Rate
            <input id="bf-plan" value={`${TIER_NAME[q.tier]}, ${gbp(q.ratePence)} per seat`} readOnly />
          </label>
        </div>
        <p className="bf-rate" id="bf-rate">{rateLine}</p>
        {!valid ? <p className="bf-warn">Choose between {SECURED_SEAT_MIN} and {SECURED_SEAT_MAX} seats. The figures below are for {seats}.</p> : null}
        {better ? (
          <div className="bf-hint" id="bf-hint">
            <span>{better.seats} seats cost {gbp(better.exVatPence)} before VAT, less than {seats} at {gbp(q.exVatPence)}.</span>
            <button type="button" onClick={() => setRaw(String(better.seats))}>Make it {better.seats}</button>
          </div>
        ) : null}
        <dl className="bf-sum" id="bf-total">
          <div className="em"><dt>Total a year, ex VAT <small>{seats} seats &times; {gbp(q.ratePence)}</small></dt><dd>{gbp(q.exVatPence)}</dd></div>
          {vatMode === "fixed" ? <div><dt>VAT at {vatPercent}%</dt><dd>{gbp(q.vatPence ?? 0)}</dd></div> : null}
          {vatMode === "automatic" ? <div><dt>VAT</dt><dd className="small">Worked out at checkout from your billing address</dd></div> : null}
          {q.incVatPence !== null ? <div className="em big"><dt>Total a year, inc VAT</dt><dd>{gbp(q.incVatPence)}</dd></div> : null}
        </dl>
        {vatMode === "none" ? <p className="cf-note bf-tight">No VAT is charged, so the totals ex and inc VAT are the same.</p> : null}
      </div>

      <div className="cf-card bf-card">
        <div className="bf-row">
          <label>Firm name <input id="bf-firm" value={f.firmName} onChange={(e) => set("firmName", e.target.value)} placeholder="Kestrel Mutual" /></label>
          <label>Sector <input id="bf-sector" value={f.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Insurance" /></label>
        </div>
        <div className="bf-row">
          <label>Who your staff ask about AI <input id="bf-contact" value={f.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Amara Osei" /></label>
          <label>Their role <input id="bf-contact-role" value={f.contactRole} onChange={(e) => set("contactRole", e.target.value)} placeholder="Head of Compliance" /></label>
        </div>
        <label>The AI tool your staff use <select id="bf-tool" value={f.tool} onChange={(e) => set("tool", e.target.value)}><option value="">Not decided yet</option>{FIRM_TOOL_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select></label>
        <p className="cf-note bf-tight">AI Cleared and AI Fluent name it as your approved tool, and their practice screens are a copy of it. Your admin can change the list at any time.</p>
        <label>Admin email, where the invite goes <input id="bf-admin" type="email" value={f.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} placeholder="you@yourfirm.co.uk" /></label>
        <p className="cf-note bf-tight">The admin runs Cyber Secured for the firm: invites staff, sees how far everyone has got, edits the firm profile. It can be you. Already run a firm with us? Use the same admin email and the seats are added to that firm.</p>
        {err && <div className="bf-err">{err}</div>}
        <button type="button" id="bf-pay" className="bf-pay" onClick={pay} disabled={busy || !valid || !f.firmName.trim() || !f.adminEmail.trim()}>{busy ? "Opening secure checkout…" : payLabel}</button>
        <p className="cf-note bf-tight">Payment is taken by Stripe on a secure page. You receive {vatMode === "none" ? "an invoice" : "a VAT invoice"} by email; enter your firm&rsquo;s VAT number at checkout and it appears on the invoice.</p>
      </div>

      <style jsx>{`
        .bf { display: flex; flex-direction: column; gap: 16px; margin-top: 8px; }
        .bf-card { display: flex; flex-direction: column; gap: 12px; }
        .bf-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .bf-card label { display: flex; flex-direction: column; gap: 6px; font-size: 12.5px; color: ${K.muted}; }
        .bf-card input, .bf-card select { width: 100%; box-sizing: border-box; font: inherit; font-size: 14px; color: ${K.ink}; background: ${K.glassStrong}; border: 1px solid ${K.edge}; border-radius: 10px; padding: 9px 12px; }
        .bf-card input:read-only { color: ${K.muted}; }
        .bf-card input:focus, .bf-card select:focus { outline: none; border-color: rgba(10,112,133,0.55); box-shadow: 0 0 0 4px rgba(10,112,133,0.12); }
        .bf-rate { margin: 0; font-size: 14px; line-height: 1.5; color: ${K.body}; }
        .bf-warn { margin: 0; font-size: 13.5px; color: ${K.warn}; }
        .bf-hint { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; padding: 10px 14px; border-radius: 12px; background: ${K.accentSoft}; color: ${K.ink}; font-size: 14px; line-height: 1.45; }
        .bf-hint button { font: inherit; font-size: 13.5px; font-weight: 600; color: #0a7085; background: #fff; border: 1px solid rgba(10,112,133,0.4); border-radius: 999px; padding: 6px 14px; cursor: pointer; white-space: nowrap; }
        .bf-hint button:hover { border-color: #0a7085; }
        .bf-sum { margin: 0; display: flex; flex-direction: column; gap: 6px; padding: 12px 14px; border-radius: 12px; background: ${K.sunk}; font-size: 14px; color: ${K.muted}; }
        .bf-sum div { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
        .bf-sum dd { margin: 0; color: ${K.ink}; font-variant-numeric: tabular-nums; text-align: right; }
        .bf-sum dd.small { font-size: 13px; color: ${K.muted}; }
        .bf-sum .em dt { color: ${K.ink}; font-weight: 600; }
        .bf-sum .em dd { font-weight: 600; }
        .bf-sum small { display: block; font-weight: 400; font-size: 12.5px; color: ${K.muted}; margin-top: 2px; }
        .bf-sum .big { margin-top: 4px; padding-top: 8px; border-top: 1px solid ${K.edge}; }
        .bf-sum .big dd { font-family: ${K.display}; font-size: 20px; }
        .bf-tight { margin: -4px 0 0; }
        .bf-err { padding: 10px 14px; border-radius: 10px; font-size: 14px; background: ${K.warnSoft}; color: ${K.warn}; }
        .bf-pay { align-self: flex-start; display: inline-flex; align-items: center; justify-content: center; min-height: 52px; padding: 0 28px; border: 0; border-radius: 999px; cursor: pointer; background: linear-gradient(135deg, #0a7085 0%, #086072 55%, #075464 100%); color: #fffdfa; font-family: ${K.sans}; font-size: 15.5px; font-weight: 600; letter-spacing: 0.005em; box-shadow: 0 16px 38px -12px rgba(10,112,133,0.9), 0 0 0 1px rgba(10,112,133,0.3), inset 0 1px 0 rgba(255,255,255,0.4); transition: transform 160ms ease, filter 160ms ease; }
        .bf-pay:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.06); }
        .bf-pay:focus-visible { outline: 2px solid #0a7085; outline-offset: 3px; }
        .bf-pay:disabled { cursor: not-allowed; opacity: 0.5; box-shadow: none; }
        @media (max-width: 640px) { .bf-row { grid-template-columns: 1fr; } .bf-row.keep { grid-template-columns: minmax(0, 0.8fr) minmax(0, 1.2fr); } .bf-pay { align-self: stretch; } }
      `}</style>
    </div>
  );
}
