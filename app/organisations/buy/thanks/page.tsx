import type { Metadata } from "next";
import Link from "next/link";
import { stripe } from "@/app/lib/stripe";
import { placesCheckoutConfigured, placesPurchaseOutcome } from "@/app/lib/learnerPlaces";
import "../buy.css";

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
 * there is a third wording that is true either way. */
export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Thank you | AlgorithmX" };

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
    <div className="oxb">
      <main className="oxb-wrap">
        <p className="oxb-eyebrow">Payment received</p>
        <h1 className="oxb-h1">
          {toppedUp ? (
            <>{name} has <span className="oxb-grad">more places</span>.</>
          ) : name ? (
            <>{name} is being <span className="oxb-grad">set up</span>.</>
          ) : (
            <>You are being <span className="oxb-grad">set up</span>.</>
          )}
        </h1>

        {toppedUp && outcome ? (
          <>
            <p className="oxb-lede">
              Your {added} {isAre} on the account already, so it now holds {outcome.total} in
              total. Nothing else needs doing: sign in and spend them on any of our courses, a
              class at a time.
            </p>
            <p className="oxb-note">
              <Link href="/schools/overview">See your places</Link>. Your VAT invoice comes
              separately from Stripe.
            </p>
          </>
        ) : (
          <>
            <p className="oxb-lede">
              {email ? <>An email is on its way to {email}.</> : <>An email is on its way to the address you gave.</>}{" "}
              It usually lands within a minute. Open it to set up your account, and you will land
              on your own screen with {places ? `all ${places} places` : "your places"} ready to
              use.
            </p>
            <p className="oxb-note">
              Nothing after ten minutes? Check the junk folder, then email{" "}
              <a href="mailto:schools@algorithmx.co.uk">schools@algorithmx.co.uk</a> with your
              organisation&rsquo;s name and we will send the link by hand. Your VAT invoice comes
              separately from Stripe.
            </p>
            <p className="oxb-note">
              <Link href="/schools/login">Already set up? Sign in</Link>
            </p>
          </>
        )}
      </main>
    </div>
  );
}
