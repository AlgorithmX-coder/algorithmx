import type { Metadata } from "next";
import Link from "next/link";
import { stripe } from "@/app/lib/stripe";
import { placesCheckoutConfigured, placesPurchaseOutcome } from "@/app/lib/learnerPlaces";
import OrderDesk, { ArrowIcon, CheckIcon, TrustPlates } from "@/app/components/order-desk/OrderDesk";
import { ORG_FOOT_LEFT, ORG_FOOT_RIGHT, OrgSteps } from "../parts";

/* /organisations/buy/thanks: after Stripe. The webhook does the work; this
 * page only says what happens next. It names the organisation and the email
 * when the session can be read, and it NEVER shows the invite link: that
 * link claims the account, and a page is the wrong place to leave one.
 *
 * Three things it may have to say, not one. A first purchase ends in an
 * invite to set an account up. A SECOND purchase does not: that reader
 * already has an account, and telling them to go and set one up is how a
 * returning customer starts to wonder whether we know who they are. And
 * until the webhook lands we do not yet know which of the two it was, so
 * there is a third wording that is true either way.
 *
 * Skin: the Order Desk (landing lab round 6, v1). The receipt card and the
 * email preview repeat only what the session and our own record say; the
 * subject lines are the ones schoolOps.ts sends. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Thank you | AlgorithmX" };

const COURSES = "Cyber Heroes, Cyber Explorers, Cyber Ops and Cyber Pro for over 18s";

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  let orgName: string | null = null;
  let email: string | null = null;
  let places: string | null = null;

  if (session_id && placesCheckoutConfigured()) {
    try {
      const s = await stripe().checkout.sessions.retrieve(session_id);
      orgName = s.metadata?.orgName ?? null;
      email = s.metadata?.leadEmail ?? s.customer_details?.email ?? null;
      places = s.metadata?.places ?? null;
    } catch (err) {
      console.error("[organisations/buy/thanks] could not read the session", err instanceof Error ? err.message : err);
    }
  }

  /* Our own record of what happened, which the webhook writes. Null until
     it lands, and the copy below has a wording for that. */
  const outcome = session_id ? await placesPurchaseOutcome(session_id).catch(() => null) : null;
  const toppedUp = outcome ? !outcome.firstPurchase : false;
  const name = outcome?.orgName ?? orgName;
  const added = outcome ? `${outcome.places} more place${outcome.places === 1 ? "" : "s"}` : "";
  const isAre = outcome && outcome.places === 1 ? "is" : "are";

  return (
    <OrderDesk family="org" thanks footLeft={ORG_FOOT_LEFT} footRight={ORG_FOOT_RIGHT}>
      <div className="odk-grid">
        <div>
          <span className="odk-eyebrow" data-rise><i />Payment received</span>
          <h1 className="odk-h1" data-rise>
            {toppedUp ? (
              <>{name} has <span className="acc">more places</span>.</>
            ) : name ? (
              <>{name} is being <span className="acc">set up</span>.</>
            ) : (
              <>You are being <span className="acc">set up</span>.</>
            )}
          </h1>

          {toppedUp && outcome ? (
            <>
              <p className="odk-lead" data-rise>
                Your {added} {isAre} on the account already, so it now holds {outcome.total} in
                total. Nothing else needs doing: sign in and spend them on any of our courses, a
                class at a time.
              </p>
              <p className="odk-note odk-measure" data-rise>Your VAT invoice comes separately from Stripe.</p>
              <div className="odk-ctas" data-rise>
                <Link className="odk-btn primary" href="/schools/overview">See your places<ArrowIcon /></Link>
                <Link className="odk-btn ghost" href="/schools">For schools and organisations</Link>
              </div>
            </>
          ) : (
            <>
              <p className="odk-lead" data-rise>
                {email ? <>An email is on its way to {email}.</> : <>An email is on its way to the address you gave.</>}{" "}
                It usually lands within a minute. Open it to set up your account, and you will land
                on your own screen with {places ? `all ${places} places` : "your places"} ready to
                use.
              </p>
              <div data-rise><OrgSteps /></div>
              <p className="odk-note odk-measure" data-rise>
                Nothing after ten minutes? Check the junk folder, then email{" "}
                <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a> with your
                organisation&rsquo;s name and we will send the link by hand. Your VAT invoice comes
                separately from Stripe.
              </p>
              <div className="odk-ctas" data-rise>
                <Link className="odk-btn primary" href="/schools/login">Already set up? Sign in<ArrowIcon /></Link>
                <Link className="odk-btn ghost" href="/schools">For schools and organisations</Link>
              </div>
            </>
          )}
        </div>

        <aside className="odk-aside" aria-label="Your receipt">
          <section className="odk-card odk-receipt" data-rise style={{ "--d": ".2s" } as React.CSSProperties}>
            <span className="stamp"><CheckIcon />Paid on Stripe</span>
            <dl>
              {name ? <div><dt>Organisation</dt><dd>{name}</dd></div> : null}
              <div>
                <dt>Places</dt>
                <dd>{toppedUp && outcome ? `${outcome.places} more, ${outcome.total} in total` : places ? `${places} places` : "Your places"}</dd>
              </div>
              <div><dt>Courses</dt><dd>{COURSES}</dd></div>
              {toppedUp ? null : <div><dt>Set-up email to</dt><dd className="mono">{email ?? "the address you gave"}</dd></div>}
              <div><dt>VAT invoice</dt><dd>Separately, from Stripe</dd></div>
            </dl>
            <div className="odk-mail" aria-label="The email that is on its way">
              <div className="from"><i>AX</i><span>{toppedUp ? "From AlgorithmX, to the account email" : "From AlgorithmX, to whoever will run it"}</span></div>
              {toppedUp && outcome && name ? <div className="subj">{added} for {name}</div> : null}
              {!toppedUp && name ? <div className="subj">Your AlgorithmX account for {name}</div> : null}
              <div className="pre">
                {toppedUp
                  ? "The places are on the account already. Sign in and spend them on any of our courses, a class at a time."
                  : "You are the first person set up. Set up your account from the link and you will land on your classes page, ready to make a class and add children."}
              </div>
            </div>
          </section>
          <TrustPlates delay=".34s" />
        </aside>
      </div>
    </OrderDesk>
  );
}
