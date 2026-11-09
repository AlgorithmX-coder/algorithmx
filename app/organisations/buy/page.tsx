import type { Metadata } from "next";
import { vatPercentShown } from "@/app/lib/stripe";
import { MAX_BLOCKS } from "@/app/lib/learnerPlacesPricing";
import BuyForm from "./BuyForm";
import "./buy.css";

/**
 * /organisations/buy: a club, tutoring business or training provider buys
 * places by card and is set up the moment the payment clears.
 *
 * Schools do not come through here. A school is quoted against its own
 * budget after a conversation, so it is invoiced and created by staff in
 * /admin/schools. Keeping the two apart is the owner's decision, not an
 * oversight: an organisation buys off a published sheet, a school does not.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Buy places | AlgorithmX",
  description: "Buy pupil places for your club, tutoring business or training provider.",
};

export default async function OrganisationsBuyPage({
  searchParams,
}: {
  searchParams: Promise<{ blocks?: string }>;
}) {
  /* Carried back from a cancelled checkout so nobody has to pick again. */
  const asked = Number((await searchParams).blocks);
  const blocks0 = Number.isInteger(asked) && asked >= 1 && asked <= MAX_BLOCKS ? asked : 1;

  return (
    <div className="oxb">
      <main className="oxb-wrap">
        <p className="oxb-eyebrow">AlgorithmX &middot; For organisations</p>
        <h1 className="oxb-h1">
          Buy places for your <span className="oxb-grad">young people</span>.
        </h1>
        <p className="oxb-lede">
          A place is one young person on one of our four courses: Cyber Heroes, Cyber Explorers,
          Cyber Ops and Cyber Pro. You choose the course for each group when you make it, and you
          can run different groups on different courses at the same time.
        </p>

        <BuyForm blocks0={blocks0} vatPercent={vatPercentShown()} />

        <div className="oxb-after">
          <div className="oxb-step">
            <b>1. You get an email</b>
            <span>It lands within a minute of paying and sets up your account.</span>
          </div>
          <div className="oxb-step">
            <b>2. Make your groups</b>
            <span>Name a group, pick its course, and paste in your register of first names.</span>
          </div>
          <div className="oxb-step">
            <b>3. They sign in and play</b>
            <span>
              Each one gets a login card with the group code on it. No email address, no password to
              remember.
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
