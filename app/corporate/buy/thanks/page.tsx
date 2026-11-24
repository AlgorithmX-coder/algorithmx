import type { Metadata } from "next";
import Link from "next/link";
import { stripe, stripeConfigured } from "@/app/lib/stripe";
import { CYBER_SECURED_NAME, liveTrackNames } from "@/app/lib/cyberSecured";
import { purchaseFromMetadata } from "@/app/lib/cyberSecuredPricing";
import OrderDesk, { ArrowIcon, CheckIcon, TrustPlates } from "@/app/components/order-desk/OrderDesk";
import { CORP_FOOT_LEFT, CORP_FOOT_RIGHT } from "../parts";

/* /corporate/buy/thanks: after Stripe. The webhook does the work; this
 * page only says what happens next, naming the firm, the seat count and
 * the admin email when the session can be read. A session opened under
 * the old per-course checkout is counted the way the webhook counts it.
 *
 * Skin: the Order Desk (landing lab round 6, v1). The receipt card and the
 * email preview only repeat what the session says; the page cannot tell a
 * first purchase from a top-up, so the preview names both subject lines,
 * exactly as the two emails (aiClearedAdmin.ts) write them. */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you | AlgorithmX for firms" };

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let firm: string | null = null;
  let email: string | null = null;
  let seats = 0;
  if (session_id && stripeConfigured()) {
    try {
      const s = await stripe().checkout.sessions.retrieve(session_id);
      firm = s.metadata?.firmName ?? null;
      email = s.metadata?.adminEmail ?? s.customer_details?.email ?? null;
      seats = purchaseFromMetadata(s.metadata ?? {}).people;
    } catch (err) {
      console.error("[corporate/buy/thanks] could not read the session", err instanceof Error ? err.message : err);
    }
  }
  const what = seats > 0 ? `${seats} ${CYBER_SECURED_NAME} ${seats === 1 ? "seat" : "seats"}` : `Your ${CYBER_SECURED_NAME} seats`;
  const seatLine = seats > 0 ? `${seats} ${CYBER_SECURED_NAME} ${seats === 1 ? "seat" : "seats"}` : null;
  return (
    <OrderDesk family="corp" thanks footLeft={CORP_FOOT_LEFT} footRight={CORP_FOOT_RIGHT}>
      <div className="odk-grid">
        <div>
          <span className="odk-eyebrow" data-rise><i />Payment received</span>
          <h1 className="odk-h1" data-rise>
            {firm ? <>{what} for {firm} {seats === 1 ? "is" : "are"} being <span className="acc">set up</span>.</> : <>{what} {seats === 1 ? "is" : "are"} being <span className="acc">set up</span>.</>}
          </h1>
          <p className="odk-lead" data-rise>
            {email ? <>An email is on its way to {email}.</> : <>An email is on its way to the address you gave.</>} It usually lands within a minute. If this is your firm&rsquo;s first purchase, it is your admin invite: open it, sign up with that address, and invite your staff from the admin console. Each seat is one person and opens every course. If you already run a firm with us under that email, the seats have been added to it and the console shows the new total.
          </p>

          <div className="odk-steps" data-rise>
            <div className="odk-step"><div className="n">01</div><b>Open the email</b><span>It is the admin invite for your firm. One link, one click, no password to remember yet.</span></div>
            <div className="odk-step"><div className="n">02</div><b>Set up your admin account</b><span>Sign up with the same address and the admin console opens: the seats, the firm profile, the approved tool.</span></div>
            <div className="odk-step"><div className="n">03</div><b>Invite your staff</b><span>Paste their email addresses and each person gets their own invite. The same console shows how far everyone has got.</span></div>
          </div>

          <p className="odk-note odk-measure" data-rise>Nothing after ten minutes? Check the junk folder, then email <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a> with your firm name and we will send the link by hand. Your invoice comes separately from Stripe.</p>
          <div className="odk-ctas" data-rise>
            <Link className="odk-btn primary" href="/cyber-secured">Go to {CYBER_SECURED_NAME}<ArrowIcon /></Link>
            <Link className="odk-btn ghost" href="/corporate">Corporate page</Link>
          </div>
        </div>

        <aside className="odk-aside" aria-label="Your receipt">
          <section className="odk-card odk-receipt" data-rise style={{ "--d": ".2s" } as React.CSSProperties}>
            <span className="stamp"><CheckIcon />Paid on Stripe</span>
            <dl>
              {firm ? <div><dt>Firm</dt><dd>{firm}</dd></div> : null}
              <div><dt>Seats</dt><dd>{what}</dd></div>
              <div><dt>Each seat opens</dt><dd>{liveTrackNames()}</dd></div>
              <div><dt>Email to</dt><dd className="mono">{email ?? "the address you gave"}</dd></div>
              <div><dt>Invoice</dt><dd>Separately, from Stripe</dd></div>
            </dl>
            <div className="odk-mail" aria-label="The email that is on its way">
              <div className="from"><i>AX</i><span>From AlgorithmX, to the admin email</span></div>
              <div className="mail-item">
                <span className="tag">New firm</span>
                {firm && seatLine ? <div className="subj">{CYBER_SECURED_NAME} is ready for {firm}: {seatLine}</div> : null}
                <div className="pre">You are the admin. Set up your account, then invite your staff from the admin console. One seat is one person, and it opens every course.</div>
              </div>
              <div className="mail-item">
                <span className="tag">A firm you already run</span>
                {firm && seatLine ? <div className="subj">{seatLine} added to {firm}</div> : null}
                <div className="pre">The seats are on your firm&rsquo;s account now and the admin console shows them.</div>
              </div>
            </div>
          </section>
          <TrustPlates delay=".34s" />
        </aside>
      </div>
    </OrderDesk>
  );
}
