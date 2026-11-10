import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { stripe, stripeConfigured } from "@/app/lib/stripe";
import { CYBER_SECURED_BRAND, CYBER_SECURED_NAME } from "@/app/lib/cyberSecured";
import { purchaseFromMetadata } from "@/app/lib/cyberSecuredPricing";
import Frame from "@/app/ai-cleared/Frame";

/* /corporate/buy/thanks: after Stripe. The webhook does the work; this
 * page only says what happens next, naming the firm, the seat count and
 * the admin email when the session can be read. A session opened under
 * the old per-course checkout is counted the way the webhook counts it. */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you | AlgorithmX for firms" };

const BRAND = { word: CYBER_SECURED_BRAND, href: "/corporate" };

/* The corporate primary pill, as on /corporate and the buy page. */
const PILL: CSSProperties = { display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 52, padding: "0 28px", borderRadius: 999, background: "linear-gradient(135deg, #0a7085 0%, #086072 55%, #075464 100%)", color: "#fffdfa", fontWeight: 600, fontSize: 15.5, textDecoration: "none", boxShadow: "0 16px 38px -12px rgba(10,112,133,0.9), 0 0 0 1px rgba(10,112,133,0.3), inset 0 1px 0 rgba(255,255,255,0.4)" };

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
  return (
    <Frame brand={BRAND} courseNote={false} meta={<Link href="/corporate" className="cf-link">Corporate page</Link>}>
      <span className="cf-eyebrow">Payment received</span>
      <h1 className="cf-h1">
        {firm ? <>{what} for {firm} {seats === 1 ? "is" : "are"} being <span className="cf-grad">set up</span>.</> : <>{what} {seats === 1 ? "is" : "are"} being <span className="cf-grad">set up</span>.</>}
      </h1>
      <p className="cf-lead">
        {email ? <>An email is on its way to {email}.</> : <>An email is on its way to the address you gave.</>} It usually lands within a minute. If this is your firm&rsquo;s first purchase, it is your admin invite: open it, sign up with that address, and invite your staff from the admin console. Each seat is one person and opens every course. If you already run a firm with us under that email, the seats have been added to it and the console shows the new total.
      </p>

      <p className="cf-note" style={{ margin: "0 0 22px", maxWidth: "62ch" }}>Nothing after ten minutes? Check the junk folder, then email admissions@algorithmx.co.uk with your firm name and we will send the link by hand. Your invoice comes separately from Stripe.</p>
      <Link href="/cyber-secured" style={PILL}>Go to {CYBER_SECURED_NAME}</Link>
    </Frame>
  );
}
