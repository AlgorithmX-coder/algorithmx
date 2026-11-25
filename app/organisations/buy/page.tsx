import type { Metadata } from "next";
import { vatPercentShown } from "@/app/lib/stripe";
import { MAX_BLOCKS } from "@/app/lib/learnerPlacesPricing";
import OrderDesk from "@/app/components/order-desk/OrderDesk";
import BuyForm from "./BuyForm";
import { ORG_FOOT_LEFT, ORG_FOOT_RIGHT, OrgSteps } from "./parts";

/**
 * /organisations/buy: a club, tutoring business or training provider buys
 * places by card and is set up the moment the payment clears.
 *
 * Schools do not come through here. A school is quoted against its own
 * budget after a conversation, so it is invoiced and created by staff in
 * /admin/schools. Keeping the two apart is the owner's decision, not an
 * oversight: an organisation buys off a published sheet, a school does not.
 *
 * Skin: the Order Desk (landing lab round 6, v1, 2026-11-23).
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

  const intro = (
    <>
      <span className="odk-eyebrow" data-rise><i />AlgorithmX &middot; For organisations</span>
      <h1 className="odk-h1" data-rise>
        Buy places for your <span className="acc">young people</span>.
      </h1>
      {/* All four, Cyber Pro included. This page is for ORGANISATIONS, and
          owner, 2026-11-09: "for schools, remove CyberPro because we're not
          doing pro. Pro is only for organizations." The /schools landing
          names three; this one names four, and the group picker matches
          whichever kind of account the buyer ends up with. Keep the two in
          step: this is the page that takes the money, so naming a course
          the picker will not offer is the one place that mistake costs
          something. */}
      <p className="odk-lead" data-rise>
        A place is one young person on one of our four courses: <b>Cyber Heroes, Cyber Explorers,
        Cyber Ops and Cyber Pro for over 18s</b>. You choose the course for each group when you make
        it, and you can run different groups on different courses at the same time.
      </p>
    </>
  );

  const after = (
    <section className="odk-section" data-rise aria-labelledby="lab-after">
      <div className="odk-label" id="lab-after">After payment, in three steps</div>
      <OrgSteps />
    </section>
  );

  return (
    <OrderDesk family="org" footLeft={ORG_FOOT_LEFT} footRight={ORG_FOOT_RIGHT}>
      <BuyForm blocks0={blocks0} vatPercent={vatPercentShown()} intro={intro} after={after} />
    </OrderDesk>
  );
}
