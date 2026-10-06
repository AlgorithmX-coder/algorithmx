import type { Metadata } from "next";
import Link from "next/link";
import { SEAT_PRICE_PENCE, sellableCourses, stripeConfigured, vatMode, vatPercentShown } from "@/app/lib/stripe";
import { VAT_LINE } from "@/app/lib/corporateProducts";
import Frame from "@/app/ai-cleared/Frame";
import BuyForm from "./BuyForm";

/* /corporate/buy: a firm buys a seat pack by card, for AI Cleared or AI
 * Fluent. The firm and its admin invite are created by the Stripe webhook
 * after payment; a buyer who already runs a firm gets the seats added to
 * it. When Stripe is not configured the page says so and points at the
 * enquiry form. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy seats | AlgorithmX for firms",
  description: "Buy AI Cleared or AI Fluent seats for your firm by card. Per person, per year, in packs of ten; your admin invite arrives the moment payment clears.",
};

export default async function BuyPage({ searchParams }: { searchParams: Promise<{ course?: string; seats?: string }> }) {
  const sp = await searchParams;
  const live = stripeConfigured();
  const courses = sellableCourses();
  const course = courses.find((c) => c === sp.course) ?? courses[0] ?? "ai-cleared";
  const seats = Math.min(249, Math.max(10, Math.round((Number(sp.seats) || 10) / 10) * 10));

  return (
    <Frame firmName="AlgorithmX" course={course} meta={<Link href="/corporate" className="cf-link">Back to the corporate page</Link>}>
      <span className="cf-eyebrow">Buy seats</span>
      <h1 className="cf-h1">Seats for your firm, <span className="cf-grad">live the moment payment clears</span>.</h1>
      <p className="cf-lead">Per person, per year, in packs of ten. Your admin invite is emailed as soon as the card payment goes through; from that link you invite your staff. {VAT_LINE[vatMode()]}</p>
      {live ? (
        <BuyForm course={course} courses={courses} seats={seats} prices={SEAT_PRICE_PENCE} vatPercent={vatPercentShown()} vatMode={vatMode()} />
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
