"use client";

import { useEffect, useRef, useState } from "react";
import { FIRM_TOOL_OPTIONS, type VatMode } from "@/app/lib/corporateProducts";
import { FIRM_RATE_FROM, SECURED_RATE_PENCE, SECURED_SEAT_MAX, SECURED_SEAT_MIN, TIER_NAME, cheaperAtThreshold, clampSeats, gbp, securedQuote } from "@/app/lib/cyberSecuredPricing";
import { ArrowIcon, LockIcon, TrustPlates } from "@/app/components/order-desk/OrderDesk";
import { tweenNumber } from "@/app/components/order-desk/orderDeskFx";
import { CorpIntro, CorpPriceCard, CorpTracksCard } from "./parts";

/* The Cyber Secured order form: a seat count, the rate it earns shown as
 * the buyer types, the totals before and after VAT, the firm's details and
 * the admin's email, then off to Stripe. The figures come from the same
 * module the checkout charges from, so the page and Stripe always agree.
 *
 * Order Desk skin (landing lab round 6, v1): the order on the left, the
 * sticky order summary on the right with the total, the Team / Firm band
 * meter and the pay pill. The state, the validation, the pay() call and its
 * payload are exactly the ones this form has always had. */
export default function BuyForm({ seats: initialSeats, vatPercent, vatMode, vatLine }: { seats: number; vatPercent: number; vatMode: VatMode; vatLine: string }) {
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
  const disabled = busy || !valid || !f.firmName.trim() || !f.adminEmail.trim();

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

  /* The big figure counts between totals, formatted the whole way. */
  const target = q.incVatPence ?? q.exVatPence;
  const [shown, setShown] = useState(target);
  const shownRef = useRef(target);
  useEffect(() => tweenNumber(shownRef.current, target, (v) => { shownRef.current = v; setShown(v); }), [target]);
  /* The summary lines flash when they change, never on first paint. */
  const [touched, setTouched] = useState(false);
  const flash = touched ? "" : undefined;

  /* The band: Team 10..49 on the left half, Firm 50..249 on the right. */
  const p = q.tier === "TEAM" ? ((seats - SECURED_SEAT_MIN) / (FIRM_RATE_FROM - SECURED_SEAT_MIN)) * 50 : 50 + ((seats - FIRM_RATE_FROM) / (SECURED_SEAT_MAX - FIRM_RATE_FROM)) * 50;
  const dotAt = `${Math.max(1.5, Math.min(98.5, p)).toFixed(1)}%`;
  const per = vatMode === "fixed" ? "a year, inc VAT, for" : vatMode === "automatic" ? "a year, plus VAT, for" : "a year, for";

  return (
    <div className="odk-grid">
      <div className="odk-order">
        <CorpIntro />

        <section className="odk-card" data-rise aria-labelledby="lab-seats">
          <div className="odk-label" id="lab-seats"><span className="n">01</span>How many seats</div>
          <div className="odk-row keep">
            <div className="odk-field">
              <label htmlFor="bf-seats">Seats</label>
              <input id="bf-seats" type="number" inputMode="numeric" min={SECURED_SEAT_MIN} max={SECURED_SEAT_MAX} step={1} value={raw} autoComplete="off" onChange={(e) => { setTouched(true); setRaw(e.target.value); }} onBlur={() => setRaw(String(seats))} />
            </div>
            <div className="odk-field">
              <label htmlFor="bf-plan">Rate</label>
              <input id="bf-plan" value={`${TIER_NAME[q.tier]}, ${gbp(q.ratePence)} per seat`} readOnly />
            </div>
          </div>
          <p className="odk-rate" id="bf-rate">{rateLine}</p>
          <p className="odk-warn" role="status" aria-live="polite">{!valid ? `Choose between ${SECURED_SEAT_MIN} and ${SECURED_SEAT_MAX} seats. The figures below are for ${seats}.` : ""}</p>
          {better ? (
            <div className="odk-hint" id="bf-hint">
              <span>{better.seats} seats cost {gbp(better.exVatPence)} before VAT, less than {seats} at {gbp(q.exVatPence)}.</span>
              <button type="button" onClick={() => { setTouched(true); setRaw(String(better.seats)); }}>Make it {better.seats}</button>
            </div>
          ) : null}
        </section>

        <section className="odk-card" data-rise aria-labelledby="lab-firm">
          <div className="odk-label" id="lab-firm"><span className="n">02</span>Your firm</div>
          <div className="odk-row">
            <div className="odk-field"><label htmlFor="bf-firm">Firm name</label><input id="bf-firm" value={f.firmName} onChange={(e) => set("firmName", e.target.value)} placeholder="Kestrel Mutual" autoComplete="organization" /></div>
            <div className="odk-field"><label htmlFor="bf-sector">Sector</label><input id="bf-sector" value={f.sector} onChange={(e) => set("sector", e.target.value)} placeholder="Insurance" /></div>
          </div>
          <div className="odk-row">
            <div className="odk-field"><label htmlFor="bf-contact">Who your staff ask about AI</label><input id="bf-contact" value={f.contactName} onChange={(e) => set("contactName", e.target.value)} placeholder="Amara Osei" autoComplete="name" /></div>
            <div className="odk-field"><label htmlFor="bf-contact-role">Their role</label><input id="bf-contact-role" value={f.contactRole} onChange={(e) => set("contactRole", e.target.value)} placeholder="Head of Compliance" autoComplete="organization-title" /></div>
          </div>
          <div className="odk-field">
            <label htmlFor="bf-tool">The AI tool your staff use</label>
            <select id="bf-tool" value={f.tool} onChange={(e) => set("tool", e.target.value)}><option value="">Not decided yet</option>{FIRM_TOOL_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}</select>
          </div>
          <p className="odk-note">AI Cleared and AI Fluent name it as your approved tool, and their practice screens are a copy of it. Your admin can change the list at any time.</p>
          <div className="odk-field">
            <label htmlFor="bf-admin">Admin email, where the invite goes</label>
            <input id="bf-admin" type="email" value={f.adminEmail} onChange={(e) => set("adminEmail", e.target.value)} placeholder="you@yourfirm.co.uk" autoComplete="email" />
          </div>
          <p className="odk-note">The admin runs Cyber Secured for the firm: invites staff, sees how far everyone has got, edits the firm profile. It can be you. Already run a firm with us? Use the same admin email and the seats are added to that firm.</p>
        </section>

        <section className="odk-section" data-rise aria-labelledby="lab-after">
          <div className="odk-label" id="lab-after">After payment, in three steps</div>
          <div className="odk-steps">
            <div className="odk-step"><div className="n">01</div><b>Your admin invite lands</b><span>Emailed to the admin address the moment the card payment clears. It usually arrives within a minute.</span></div>
            <div className="odk-step"><div className="n">02</div><b>Set up the admin account</b><span>Open the link and sign up with that address. The admin console shows the seats, the firm profile and the approved tool.</span></div>
            <div className="odk-step"><div className="n">03</div><b>Invite your staff</b><span>Paste their email addresses and each person gets their own invite. One seat is one person, and it opens every course.</span></div>
          </div>
        </section>
      </div>

      <aside className="odk-aside" aria-label="Your order">
        <section className="odk-card odk-sum" data-rise style={{ "--d": ".2s" } as React.CSSProperties}>
          <span className="scanline" aria-hidden="true" />
          <div className="odk-label"><span>Your order</span><span className="live"><i />Updates as you type</span></div>
          <div className="odk-big">
            {/* The figure counts between totals; screen readers hear only where it lands. */}
            <span className="amt" aria-hidden="true">{gbp(shown)}</span>
            <span className="odk-sr" role="status" aria-live="polite">{gbp(target)}</span>
            <span className="for">{per} <b>{seats} {seats === 1 ? "seat" : "seats"}</b> at the <b>{TIER_NAME[q.tier]}</b> rate</span>
          </div>
          <div className="odk-band" aria-hidden="true">
            <div className="track">
              <span className="zone" data-on={q.tier === "TEAM" ? "" : undefined}>{TIER_NAME.TEAM} · {gbp(SECURED_RATE_PENCE.TEAM)}</span>
              <span className="zone" data-on={q.tier === "FIRM" ? "" : undefined}>{TIER_NAME.FIRM} · {gbp(SECURED_RATE_PENCE.FIRM)}</span>
              <i className="dot" data-firm={q.tier === "FIRM" ? "" : undefined} style={{ "--p": dotAt } as React.CSSProperties} />
            </div>
            <div className="scale"><span>{SECURED_SEAT_MIN} seats</span><span>{FIRM_RATE_FROM}</span><span>{SECURED_SEAT_MAX} seats</span></div>
          </div>
          <dl id="bf-total">
            <div className="em"><dt>Total a year, ex VAT <small>{seats} seats &times; {gbp(q.ratePence)}</small></dt><dd key={`ex${q.exVatPence}`} data-flash={flash}>{gbp(q.exVatPence)}</dd></div>
            {vatMode === "fixed" ? <div><dt>VAT at {vatPercent}%</dt><dd key={`vat${q.vatPence}`} data-flash={flash}>{gbp(q.vatPence ?? 0)}</dd></div> : null}
            {vatMode === "automatic" ? <div><dt>VAT</dt><dd className="small">Worked out at checkout from your billing address</dd></div> : null}
            {q.incVatPence !== null ? <div className="em tot"><dt>Total a year, inc VAT</dt><dd key={`inc${q.incVatPence}`} data-flash={flash}>{gbp(q.incVatPence)}</dd></div> : null}
          </dl>
          {vatMode === "none" ? <p className="odk-note">No VAT is charged, so the totals ex and inc VAT are the same.</p> : null}
          <button type="button" id="bf-pay" className="odk-pay" onClick={pay} disabled={disabled}>{busy ? "Opening secure checkout…" : <>{payLabel}<ArrowIcon /></>}</button>
          {err ? <div className="odk-err" role="alert">{err}</div> : null}
          {disabled && !busy ? <p className="odk-needs">{!valid ? `Choose between ${SECURED_SEAT_MIN} and ${SECURED_SEAT_MAX} seats to continue.` : "Add your firm name and the admin email, then pay."}</p> : null}
          <p className="odk-secure"><LockIcon /><span>Payment is taken by Stripe on a secure page. You receive {vatMode === "none" ? "an invoice" : "a VAT invoice"} by email; enter your firm&rsquo;s VAT number at checkout and it appears on the invoice.</span></p>
        </section>

        <CorpPriceCard tier={q.tier} vatLine={vatLine} delay=".32s" />
        <CorpTracksCard delay=".42s" />
        <TrustPlates delay=".52s" />
      </aside>
    </div>
  );
}
