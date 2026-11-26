"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { BLOCK_FIRST_PENCE, BLOCK_FURTHER_PENCE, MAX_BLOCKS, PLACES_PER_BLOCK, placesPricePence } from "@/app/lib/learnerPlacesPricing";
import { ArrowIcon, LockIcon, TrustPlates } from "@/app/components/order-desk/OrderDesk";
import { tweenNumber } from "@/app/components/order-desk/orderDeskFx";

/**
 * Buy places.
 *
 * The price is worked out here as the buyer changes the number, and again
 * on the server before Stripe is asked for anything, because a number
 * typed in a browser is a suggestion. `placesPricePence` is the same
 * function in both places, so the two can never drift.
 *
 * Order Desk skin (landing lab round 6, v1): the form on the left, the
 * sticky order summary on the right with the total, the ladder of blocks
 * and the pay pill. The pill is still this form's submit button (form=),
 * so the submit handler, its payload and its errors are unchanged.
 */

const money = (pence: number) =>
  (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 });

const COURSES = [
  { name: "Cyber Heroes", c: "#ffb347" },
  { name: "Cyber Explorers", c: "#22d3ee" },
  { name: "Cyber Ops", c: "#8b7bff" },
  { name: "Cyber Pro, for over 18s", c: "#ff7a3d" },
];

export default function BuyForm({ blocks0, vatPercent, intro, after }: { blocks0: number; vatPercent: number; intro: React.ReactNode; after: React.ReactNode }) {
  const [blocks, setBlocks] = useState(blocks0);
  const [orgName, setOrgName] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [contactName, setContactName] = useState("");
  const [sector, setSector] = useState("");
  const [website, setWebsite] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quote = useMemo(() => {
    const net = placesPricePence(blocks);
    const vat = Math.round((net * vatPercent) / 100);
    return { net, vat, gross: net + vat, places: blocks * PLACES_PER_BLOCK };
  }, [blocks, vatPercent]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/organisations/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          orgName,
          blocks,
          leadEmail,
          contactName: contactName || null,
          sector: sector || null,
          website,
        }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j.url) {
        setError(j.error ?? "Something went wrong starting the payment. Try again in a moment.");
        return;
      }
      window.location.href = j.url as string;
    } catch {
      setError("We could not reach the payment page. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  /* The big figure counts between totals; the lines flash on change, never on first paint. */
  const [shown, setShown] = useState(quote.gross);
  const shownRef = useRef(quote.gross);
  useEffect(() => tweenNumber(shownRef.current, quote.gross, (v) => { shownRef.current = v; setShown(v); }), [quote.gross]);
  const [touched, setTouched] = useState(false);
  const flash = touched ? "" : undefined;

  return (
    <div className="odk-grid">
      <div className="odk-order">
        {intro}

        <form id="oxb-form" onSubmit={submit} noValidate>
          <section className="odk-card" data-rise aria-labelledby="lab-org">
            <div className="odk-label" id="lab-org"><span className="n">01</span>Your organisation</div>
            <div className="odk-field">
              <label htmlFor="oxb-org">Your organisation&rsquo;s name</label>
              <input id="oxb-org" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Northside Coding Club" maxLength={120} required autoComplete="organization" />
            </div>
            <div className="odk-row">
              <div className="odk-field">
                <label htmlFor="oxb-blocks">How many places</label>
                <select id="oxb-blocks" value={blocks} onChange={(e) => { setTouched(true); setBlocks(Number(e.target.value)); }}>
                  {Array.from({ length: MAX_BLOCKS }, (_, i) => i + 1).map((b) => (
                    <option key={b} value={b}>{b * PLACES_PER_BLOCK} places</option>
                  ))}
                </select>
              </div>
              <div className="odk-field">
                <label htmlFor="oxb-sector">What you run (optional)</label>
                <input id="oxb-sector" value={sector} onChange={(e) => setSector(e.target.value)} placeholder="After-school club" maxLength={80} />
              </div>
            </div>
            <div className="odk-row">
              <div className="odk-field">
                <label htmlFor="oxb-email">Email of whoever will run it</label>
                <input id="oxb-email" type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} placeholder="you@yourclub.co.uk" maxLength={200} required autoComplete="email" />
              </div>
              <div className="odk-field">
                <label htmlFor="oxb-contact">Their name (optional)</label>
                <input id="oxb-contact" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Sam Patel" maxLength={120} autoComplete="name" />
              </div>
            </div>

            {/* Honeypot. Hidden from people, irresistible to a form bot. */}
            <div className="odk-hp" aria-hidden>
              <label htmlFor="oxb-website">Website</label>
              <input id="oxb-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
            </div>

            <p className="odk-note">
              Paid by card through Stripe. Your VAT invoice comes from Stripe straight after. Places never
              expire. A place is one young person on one course: it follows them, so moving them between
              groups on that course costs nothing, and starting them on a second course uses another
              place. Need an invoice instead, or buying for a school? Write to{" "}
              <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a>.
            </p>
          </section>
        </form>

        {after}
      </div>

      <aside className="odk-aside" aria-label="Your order">
        <section className="odk-card odk-sum" data-rise style={{ "--d": ".2s" } as React.CSSProperties}>
          <span className="scanline" aria-hidden="true" />
          <div className="odk-label"><span>Your order</span><span className="live"><i />Updates as you choose</span></div>
          <div className="odk-big">
            {/* The figure counts between totals; screen readers hear only where it lands. */}
            <span className="amt" aria-hidden="true">{money(shown)}</span>
            <span className="odk-sr" role="status" aria-live="polite">{money(quote.gross)}</span>
            <span className="for">to pay today for <b>{quote.places} places</b>, {blocks === 1 ? "one block of fifty" : `${blocks} blocks of fifty`}</span>
          </div>
          <div className="odk-ladder" aria-hidden="true">
            {Array.from({ length: MAX_BLOCKS }, (_, i) => <i key={i} data-on={i < blocks ? "" : undefined} style={{ "--i": i } as React.CSSProperties} />)}
          </div>
          <div className="odk-ladder-cap" aria-hidden="true">
            <span>First fifty {money(BLOCK_FIRST_PENCE)}</span>
            <span>{blocks > 1 ? `${blocks - 1} further × ${money(BLOCK_FURTHER_PENCE)}` : `Each further fifty ${money(BLOCK_FURTHER_PENCE)}`}</span>
          </div>
          <dl>
            <div className="em"><dt>{quote.places} places</dt><dd key={`n${quote.net}`} data-flash={flash}>{money(quote.net)}</dd></div>
            {vatPercent > 0 && <div><dt>VAT at {vatPercent}%</dt><dd key={`v${quote.vat}`} data-flash={flash}>{money(quote.vat)}</dd></div>}
            <div className="em tot"><dt>To pay today</dt><dd key={`g${quote.gross}`} data-flash={flash}>{money(quote.gross)}</dd></div>
          </dl>
          <button type="submit" form="oxb-form" className="odk-pay" disabled={busy}>
            {busy ? "Taking you to payment…" : <>{`Pay ${money(quote.gross)}`}<ArrowIcon /></>}
          </button>
          {error && <p className="odk-err" role="alert">{error}</p>}
          <p className="odk-secure"><LockIcon /><span>Paid by card through Stripe. Your VAT invoice comes from Stripe straight after.</span></p>
        </section>

        <section className="odk-card" data-rise style={{ "--d": ".32s" } as React.CSSProperties}>
          <div className="odk-label">The price, per fifty places</div>
          <dl className="odk-rates">
            <div data-on=""><dt>The first fifty places</dt><dd>{money(BLOCK_FIRST_PENCE)}</dd></div>
            <div><dt>Every further fifty</dt><dd>{money(BLOCK_FURTHER_PENCE)}</dd></div>
          </dl>
          <p className="odk-note">
            Places never expire.{vatPercent > 0 ? ` VAT at ${vatPercent}% is added at checkout and shown on your invoice.` : ""} More than {(MAX_BLOCKS * PLACES_PER_BLOCK).toLocaleString("en-GB")} places? Write to <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a> and we will quote you.
          </p>
        </section>

        <section className="odk-card" data-rise style={{ "--d": ".42s" } as React.CSSProperties}>
          <div className="odk-label">A place opens one of four courses</div>
          <div className="odk-courses">
            {COURSES.map((c) => <span key={c.name} style={{ "--c": c.c } as React.CSSProperties}><i />{c.name}</span>)}
          </div>
          <p className="odk-note">You choose the course for each group when you make it. Different groups can run on different courses at the same time.</p>
        </section>

        <TrustPlates delay=".52s" />
      </aside>
    </div>
  );
}
