import type { Metadata } from "next";
import Link from "next/link";
import { COURSE_NAME, stripe, stripeConfigured } from "@/app/lib/stripe";
import type { CorporateProductSlug } from "@/app/lib/corporateProducts";
import Frame from "@/app/ai-cleared/Frame";

/* /corporate/buy/thanks: after Stripe. The webhook does the work; this
 * page only says what happens next, naming the firm, the course and the
 * admin email when the session can be read. */
export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Thank you | AlgorithmX for firms" };

export default async function ThanksPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let firm: string | null = null;
  let email: string | null = null;
  let course: CorporateProductSlug = "ai-cleared";
  if (session_id && stripeConfigured()) {
    try {
      const s = await stripe().checkout.sessions.retrieve(session_id);
      firm = s.metadata?.firmName ?? null;
      email = s.metadata?.adminEmail ?? s.customer_details?.email ?? null;
      if (s.metadata?.course === "ai-fluent") course = "ai-fluent";
    } catch (err) {
      console.error("[corporate/buy/thanks] could not read the session", err instanceof Error ? err.message : err);
    }
  }
  const name = COURSE_NAME[course];
  return (
    <Frame firmName="AlgorithmX" meta={<Link href="/corporate" className="cf-link">Corporate page</Link>}>
      <span className="cf-eyebrow">Payment received</span>
      <h1 className="cf-h1">{firm ? <>{name} seats for {firm} are being <span className="cf-grad">set up</span>.</> : <>Your {name} seats are being <span className="cf-grad">set up</span>.</>}</h1>
      <p className="cf-lead">
        {email ? <>An email is on its way to {email}.</> : <>An email is on its way to the address you gave.</>} It usually lands within a minute. If this is your firm&rsquo;s first purchase, it is your admin invite: open it, sign up with that address, and invite your staff from the console. If you already run a firm with us under that email, the seats have been added to it and the console shows them.
      </p>
      {course === "ai-fluent" ? <p className="cf-note">An AI Fluent seat is claimed by someone who holds a valid AI Cleared certificate; the invite tells them so.</p> : null}
      <p className="cf-note">Nothing after ten minutes? Check the junk folder, then email admissions@algorithmx.co.uk with your firm name and we will send the link by hand. Your VAT invoice comes separately from Stripe.</p>
      <Link href={course === "ai-fluent" ? "/ai-fluent" : "/ai-cleared"} className="cf-btn cf-btn-pri" style={{ alignSelf: "flex-start" }}>Go to {name}</Link>
    </Frame>
  );
}
