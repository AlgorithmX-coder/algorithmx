import type { Metadata } from "next";
import Link from "next/link";
import { stripeConfigured, vatMode, vatPercentShown } from "@/app/lib/stripe";
import { VAT_LINE } from "@/app/lib/corporateProducts";
import { CYBER_SECURED_BRAND, CYBER_SECURED_NAME, SECURED_TRACKS, liveTrackNames } from "@/app/lib/cyberSecured";
import { FIRM_RATE_FROM, SECURED_RATE_PENCE, SECURED_SEAT_MAX, SECURED_SEAT_MIN, clampSeats, gbp } from "@/app/lib/cyberSecuredPricing";
import { K } from "@/app/ai-cleared/engine/tokens";
import Frame from "@/app/ai-cleared/Frame";
import BuyForm from "./BuyForm";

/* /corporate/buy: a firm buys Cyber Secured seats by card. One product,
 * one seat per person, and the seat opens every track. The firm and its
 * admin invite are created by the Stripe webhook after payment; a buyer
 * who already runs a firm gets the seats added to it. When Stripe is not
 * configured the page says so and points at the enquiry form.
 *
 * Old links that still say ?course=ai-cleared, ai-fluent or both land
 * here too: the course is ignored and the seat count kept. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy Cyber Secured seats | AlgorithmX for firms",
  description: "Buy Cyber Secured for your firm by card. One seat per person, per year, opening AI Cleared, AI Fluent and Cyber Awareness. Your admin invite arrives the moment payment clears.",
};

const BRAND = { word: CYBER_SECURED_BRAND, href: "/corporate" };

export default async function BuyPage({ searchParams }: { searchParams: Promise<{ seats?: string }> }) {
  const sp = await searchParams;
  const live = stripeConfigured();
  const seats = clampSeats(Number(sp.seats) || SECURED_SEAT_MIN);
  const tracks = SECURED_TRACKS.filter((t) => t.live);

  const aside = (
    <>
      <div className="cf-card">
        <div className="cf-label">What each seat opens</div>
        <ul className="bp-tracks">
          {tracks.map((t) => (
            <li key={t.slug}>
              <b>{t.name}</b>
              <span>{t.line.charAt(0).toUpperCase() + t.line.slice(1)}.</span>
            </li>
          ))}
        </ul>
        <p className="cf-note" style={{ margin: "10px 0 0" }}>One seat is one person. They take every course, in any order, and stop and resume whenever suits.</p>
      </div>
      <div className="cf-card">
        <div className="cf-label">The price, per seat per year</div>
        <dl className="bp-rates">
          <div><dt>Team, {SECURED_SEAT_MIN} to {FIRM_RATE_FROM - 1} seats</dt><dd>{gbp(SECURED_RATE_PENCE.TEAM)}</dd></div>
          <div><dt>Firm, {FIRM_RATE_FROM} seats or more</dt><dd>{gbp(SECURED_RATE_PENCE.FIRM)}</dd></div>
        </dl>
        <p className="cf-note" style={{ margin: "10px 0 0" }}>The whole order goes at the rate its seat count earns. {VAT_LINE[vatMode()]} More than {SECURED_SEAT_MAX} seats? <Link href="/corporate#enquiry" className="bp-link">Talk to us</Link> and we will quote you.</p>
      </div>
      <style>{`
        .bp-tracks { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
        .bp-tracks li { display: flex; flex-direction: column; gap: 2px; padding: 10px 0; border-top: 1px solid ${K.edgeSoft}; }
        .bp-tracks li:first-child { border-top: none; padding-top: 0; }
        .bp-tracks b { color: ${K.ink}; font-size: 15px; font-weight: 600; }
        .bp-tracks span { color: ${K.muted}; font-size: 13.5px; line-height: 1.45; }
        .bp-rates { margin: 0; display: flex; flex-direction: column; gap: 8px; }
        .bp-rates div { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
        .bp-rates dt { color: ${K.body}; font-size: 14px; }
        .bp-rates dd { margin: 0; color: ${K.ink}; font-family: ${K.display}; font-size: 20px; font-weight: 600; }
        .bp-link { color: ${K.accentInk}; font-weight: 600; }
      `}</style>
    </>
  );

  return (
    <Frame brand={BRAND} courseNote={false} meta={<Link href="/corporate" className="cf-link">Corporate page</Link>} aside={aside}>
      <span className="cf-eyebrow">Buy {CYBER_SECURED_NAME}</span>
      <h1 className="cf-h1">{CYBER_SECURED_NAME} for your firm, <span className="cf-grad">live the moment payment clears</span>.</h1>
      <p className="cf-lead">One seat per person, per year, and every seat opens {liveTrackNames()}. Your admin invite is emailed as soon as the card payment goes through; from that link you invite your staff.</p>
      {live ? (
        <BuyForm seats={seats} vatPercent={vatPercentShown()} vatMode={vatMode()} />
      ) : (
        <div className="cf-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <b>Card checkout is not switched on yet.</b>
          <span className="cf-note">Use the enquiry form and we will set your firm up by hand and invoice you. Same seats, same price, one working day.</span>
          <Link href="/corporate#enquiry" className="cf-btn cf-btn-pri" style={{ alignSelf: "flex-start" }}>Go to the enquiry form</Link>
        </div>
      )}
    </Frame>
  );
}
