"use client";

import { useMemo, useState } from "react";
import { MAX_BLOCKS, PLACES_PER_BLOCK, placesPricePence } from "@/app/lib/learnerPlaces";

/**
 * Buy places.
 *
 * The price is worked out here as the buyer changes the number, and again
 * on the server before Stripe is asked for anything, because a number
 * typed in a browser is a suggestion. `placesPricePence` is the same
 * function in both places, so the two can never drift.
 */

const money = (pence: number) =>
  (pence / 100).toLocaleString("en-GB", { style: "currency", currency: "GBP", minimumFractionDigits: 0 });

export default function BuyForm({ blocks0, vatPercent }: { blocks0: number; vatPercent: number }) {
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

  return (
    <form className="oxb-card" onSubmit={submit} noValidate>
      <div className="oxb-grid">
        <div className="oxb-field wide">
          <label className="oxb-label" htmlFor="oxb-org">Your organisation&rsquo;s name</label>
          <input
            id="oxb-org"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            placeholder="Northside Coding Club"
            maxLength={120}
            required
          />
        </div>

        <div className="oxb-field">
          <label className="oxb-label" htmlFor="oxb-blocks">How many places</label>
          <select id="oxb-blocks" value={blocks} onChange={(e) => setBlocks(Number(e.target.value))}>
            {Array.from({ length: MAX_BLOCKS }, (_, i) => i + 1).map((b) => (
              <option key={b} value={b}>
                {b * PLACES_PER_BLOCK} places
              </option>
            ))}
          </select>
        </div>

        <div className="oxb-field">
          <label className="oxb-label" htmlFor="oxb-sector">What you run (optional)</label>
          <input
            id="oxb-sector"
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            placeholder="After-school club"
            maxLength={80}
          />
        </div>

        <div className="oxb-field">
          <label className="oxb-label" htmlFor="oxb-email">Email of whoever will run it</label>
          <input
            id="oxb-email"
            type="email"
            value={leadEmail}
            onChange={(e) => setLeadEmail(e.target.value)}
            placeholder="you@yourclub.co.uk"
            maxLength={200}
            required
          />
        </div>

        <div className="oxb-field">
          <label className="oxb-label" htmlFor="oxb-contact">Their name (optional)</label>
          <input
            id="oxb-contact"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Sam Patel"
            maxLength={120}
          />
        </div>

        {/* Honeypot. Hidden from people, irresistible to a form bot. */}
        <div className="oxb-hp" aria-hidden>
          <label htmlFor="oxb-website">Website</label>
          <input id="oxb-website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </div>
      </div>

      <div className="oxb-quote">
        <div className="oxb-row">
          <span>{quote.places} places</span>
          <span>{money(quote.net)}</span>
        </div>
        {vatPercent > 0 && (
          <div className="oxb-row">
            <span>VAT at {vatPercent}%</span>
            <span>{money(quote.vat)}</span>
          </div>
        )}
        <div className="oxb-row total">
          <span>To pay today</span>
          <span>{money(quote.gross)}</span>
        </div>
      </div>

      <button type="submit" className="oxb-btn" disabled={busy}>
        {busy ? "Taking you to payment…" : `Pay ${money(quote.gross)}`}
      </button>

      {error && (
        <p className="oxb-msg" role="alert">
          {error}
        </p>
      )}

      <p className="oxb-note">
        Paid by card through Stripe. Your VAT invoice comes from Stripe straight after. Places never
        expire, and a place belongs to a child rather than to a course, so moving a child up to the
        next course next year costs nothing. Need an invoice instead, or buying for a school? Write
        to <a href="mailto:schools@algorithmx.co.uk">schools@algorithmx.co.uk</a>.
      </p>
    </form>
  );
}
