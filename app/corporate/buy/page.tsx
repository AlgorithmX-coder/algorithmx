import type { Metadata } from "next";
import Link from "next/link";
import { stripeConfigured, vatMode, vatPercentShown } from "@/app/lib/stripe";
import { VAT_LINE } from "@/app/lib/corporateProducts";
import { SECURED_SEAT_MIN, clampSeats } from "@/app/lib/cyberSecuredPricing";
import OrderDesk, { ArrowIcon, TrustPlates } from "@/app/components/order-desk/OrderDesk";
import BuyForm from "./BuyForm";
import { CORP_FOOT_LEFT, CORP_FOOT_RIGHT, CorpIntro, CorpPriceCard, CorpTracksCard } from "./parts";

/* /corporate/buy: a firm buys Cyber Secured seats by card. One product,
 * one seat per person, and the seat opens every track. The firm and its
 * admin invite are created by the Stripe webhook after payment; a buyer
 * who already runs a firm gets the seats added to it. When Stripe is not
 * configured the page says so and points at the enquiry form.
 *
 * Old links that still say ?course=ai-cleared, ai-fluent or both land
 * here too: the course is ignored and the seat count kept.
 *
 * Skin: the Order Desk (landing lab round 6, v1, 2026-11-23). */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy Cyber Secured seats | AlgorithmX for firms",
  description: "Buy Cyber Secured for your firm by card. One seat per person, per year, opening AI Cleared, AI Fluent and Cyber Awareness. Your admin invite arrives the moment payment clears.",
};

export default async function BuyPage({ searchParams }: { searchParams: Promise<{ seats?: string }> }) {
  const sp = await searchParams;
  const live = stripeConfigured();
  const seats = clampSeats(Number(sp.seats) || SECURED_SEAT_MIN);
  const vatLine = VAT_LINE[vatMode()];

  return (
    <OrderDesk family="corp" footLeft={CORP_FOOT_LEFT} footRight={CORP_FOOT_RIGHT}>
      {live ? (
        <BuyForm seats={seats} vatPercent={vatPercentShown()} vatMode={vatMode()} vatLine={vatLine} />
      ) : (
        <div className="odk-grid">
          <div className="odk-order">
            <CorpIntro />
            <section className="odk-card odk-closed" data-rise>
              <b>Card checkout is not switched on yet.</b>
              <span className="odk-note">Use the enquiry form and we will set your firm up by hand and invoice you. Same seats, same price, one working day.</span>
              <Link href="/corporate#enquiry" className="odk-btn primary">Go to the enquiry form<ArrowIcon /></Link>
            </section>
          </div>
          <aside className="odk-aside" aria-label="The price">
            <CorpPriceCard vatLine={vatLine} delay=".2s" />
            <CorpTracksCard delay=".32s" />
            <TrustPlates delay=".42s" />
          </aside>
        </div>
      )}
    </OrderDesk>
  );
}
