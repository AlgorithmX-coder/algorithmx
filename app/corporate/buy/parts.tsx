/* The static pieces of the Cyber Secured buy page (Order Desk skin), shared
 * by the live order (BuyForm.tsx) and the page shown while card checkout is
 * switched off. No hooks and no behaviour: words and prices only, all read
 * from the same modules the checkout charges from. */

import Link from "next/link";
import { CYBER_SECURED_NAME, SECURED_TRACKS, liveTrackNames } from "@/app/lib/cyberSecured";
import { FIRM_RATE_FROM, SECURED_RATE_PENCE, SECURED_SEAT_MAX, SECURED_SEAT_MIN, gbp, type SecuredTier } from "@/app/lib/cyberSecuredPricing";

export function CorpIntro() {
  return (
    <>
      <span className="odk-eyebrow" data-rise><i />Buy {CYBER_SECURED_NAME}</span>
      <h1 className="odk-h1" data-rise>{CYBER_SECURED_NAME} for your firm, <span className="acc">live the moment payment clears</span>.</h1>
      <p className="odk-lead" data-rise>One seat per person, per year, and every seat opens <b>{liveTrackNames()}</b>. Your admin invite is emailed as soon as the card payment goes through; from that link you invite your staff.</p>
    </>
  );
}

/* tier: the rate the current seat count earns, lit; none while checkout is off. */
export function CorpPriceCard({ tier, vatLine, delay }: { tier?: SecuredTier; vatLine: string; delay: string }) {
  return (
    <section className="odk-card" data-rise style={{ "--d": delay } as React.CSSProperties}>
      <div className="odk-label">The price, per seat per year</div>
      <dl className="odk-rates">
        <div data-on={tier === "TEAM" ? "" : undefined}><dt>Team, {SECURED_SEAT_MIN} to {FIRM_RATE_FROM - 1} seats</dt><dd>{gbp(SECURED_RATE_PENCE.TEAM)}</dd></div>
        <div data-on={tier === "FIRM" ? "" : undefined}><dt>Firm, {FIRM_RATE_FROM} seats or more</dt><dd>{gbp(SECURED_RATE_PENCE.FIRM)}</dd></div>
      </dl>
      <p className="odk-note">The whole order goes at the rate its seat count earns. {vatLine} More than {SECURED_SEAT_MAX} seats? <Link href="/corporate#enquiry">Talk to us</Link> and we will quote you.</p>
    </section>
  );
}

export function CorpTracksCard({ delay }: { delay: string }) {
  const tracks = SECURED_TRACKS.filter((t) => t.live);
  return (
    <section className="odk-card" data-rise style={{ "--d": delay } as React.CSSProperties}>
      <div className="odk-label">What each seat opens</div>
      <ul className="odk-tracks">
        {tracks.map((t) => (
          <li key={t.slug}>
            <b><i />{t.name}</b>
            <span>{t.line.charAt(0).toUpperCase() + t.line.slice(1)}.</span>
          </li>
        ))}
      </ul>
      <p className="odk-note">One seat is one person. They take every course, in any order, and stop and resume whenever suits.</p>
    </section>
  );
}

export const CORP_FOOT_LEFT = (
  <>Questions about your seat: <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a></>
);
export const CORP_FOOT_RIGHT = `${CYBER_SECURED_NAME} by AlgorithmX`;
