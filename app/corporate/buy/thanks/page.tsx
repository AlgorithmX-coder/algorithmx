import type { Metadata } from "next";
import Link from "next/link";
import { stripe, stripeConfigured } from "@/app/lib/stripe";
import Frame from "@/app/ai-cleared/Frame";

/* /corporate/buy/thanks: after Stripe. The webhook does the work; this
 * page only says what happens next, naming the firm and the admin email
 * when the session can be read. */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you | AI Cleared by AlgorithmX" };

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let firm: string | null = null;
  let email: string | null = null;
  if (session_id && stripeConfigured()) {
    try {
      const s = await stripe().checkout.sessions.retrieve(session_id);
      firm = s.metadata?.firmName ?? null;
      email = s.metadata?.adminEmail ?? s.customer_details?.email ?? null;
    } catch (err) {
      console.error("[corporate/buy/thanks] could not read the session", err instanceof Error ? err.message : err);
    }
  }
  return (
    <Frame firmName="AlgorithmX" meta={<Link href="/corporate" className="cf-link">Corporate page</Link>}>
      <span className="cf-eyebrow">Payment received</span>
      <h1 className="cf-h1">{firm ? <>{firm} is being <span className="cf-grad">set up</span>.</> : <>Your firm is being <span className="cf-grad">set up</span>.</>}</h1>
      <p className="cf-lead">
        {email ? <>Your admin invite is on its way to {email}.</> : <>Your admin invite is on its way to the email you gave.</>} It usually lands within a minute. Open it, sign up with that address, and you are the firm&rsquo;s admin: invite your staff from there, and they each get their own link.
      </p>
      <p className="cf-note">Nothing after ten minutes? Check the junk folder, then email admissions@algorithmx.co.uk with your firm name and we will send the link by hand. Your VAT invoice comes separately from Stripe.</p>
      <Link href="/ai-cleared" className="cf-btn cf-btn-pri" style={{ alignSelf: "flex-start" }}>Go to AI Cleared</Link>
    </Frame>
  );
}
