import Link from "next/link";
import BrightPage from "@/app/components/bright/BrightPage";
import { findConsentLink, isStaffEmail } from "@/app/lib/parentConsent";
import { consumerCourse, formatPence, vatIncludedPence } from "@/app/lib/consumerCatalogue";
import { hasEntitlement } from "@/app/lib/entitlements";
import { CONSUMER_CHECKOUT_OPEN } from "@/app/lib/launchSwitch";
import { consumerPurchaseRecorded } from "@/app/lib/consumerCheckout";
import AwaitPayment from "@/app/purchase/[slug]/AwaitPayment";
import ConsentForm from "./ConsentForm";
import ParentPayForm from "./ParentPayForm";
import { giveConsentAction, parentCheckoutAction } from "./actions";

/**
 * /parent-approve/[token]: the page a parent reaches from the consent email
 * when their child under 13 signs up for Cyber Explorers or Cyber Ops.
 *
 * It says plainly what the child signed up for and what we keep about
 * them, records the parent's consent (UK GDPR Article 8), and then lets the
 * parent buy the course for the child's account: the course goes on the
 * CHILD's account, the receipt to the parent. Bright, like the rest of the
 * front door.
 *
 * The token in the URL is the only key. Only its hash is stored; it lasts
 * seven days (app/lib/parentConsent.ts).
 */
export const dynamic = "force-dynamic";

/* Never indexed, never cached by a shared cache. */
export const metadata = { title: "A parent's consent | AlgorithmX", robots: { index: false, follow: false } };

function firstName(name: string | null | undefined): string {
  const n = (name ?? "").trim();
  return n ? n.split(/\s+/)[0] : "Your child";
}

export default async function ParentApprovePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ status?: string; error?: string; session_id?: string }>;
}) {
  const { token } = await params;
  const { status, error, session_id: sessionId } = await searchParams;
  const link = await findConsentLink(token);

  if (!link) {
    return (
      <BrightPage eyebrow="Parent's consent" title="This link has run out">
        <p>Consent links work for seven days, and only the newest one counts.</p>
        <p>Ask your child to sign in again and press &ldquo;Send the email again&rdquo;. A fresh link arrives in a minute.</p>
        <Link href="/" className="axbright-ghost">
          About AlgorithmX
        </Link>
      </BrightPage>
    );
  }

  const child = firstName(link.user.name);
  const course = consumerCourse(link.courseSlug);
  const courseName = course?.name ?? "their course";

  if (!link.user.parentConsentAt) {
    return (
      <BrightPage eyebrow="Parent's consent" title={<>{child} would like to join {courseName}</>}>
        <p>
          {child} has made an AlgorithmX account to take <b>{courseName}</b>
          {course ? <>: {course.line.charAt(0).toLowerCase() + course.line.slice(1)}</> : "."}
        </p>
        <p>Children under 13 need a parent or guardian to say yes before they start. Here is what saying yes means:</p>
        <div className="axbright-box">
          <ul>
            <li>{child} can sign in and use {courseName}.</li>
            <li>
              We keep {child}&rsquo;s name, email address ({link.user.email}), year of birth and progress in the course, to run their account.
            </li>
            <li>You can ask us to delete the account at any time: email support@algorithmx.co.uk.</li>
          </ul>
        </div>
        <p className="axbright-small">
          More detail is in our <Link href="/privacy">privacy notice</Link>.
        </p>
        <ConsentForm action={giveConsentAction.bind(null, token)} child={child} />
        {error === "consent" && <p className="axbright-warn">Tick the box to give your consent.</p>}
      </BrightPage>
    );
  }

  /* Consent given. Now the course itself. */
  const owned = course ? await hasEntitlement(link.user.id, course.slug) : false;

  if (status === "paid" && !owned && sessionId && course && !(await consumerPurchaseRecorded(sessionId, link.user.id))) {
    return (
      <BrightPage eyebrow="Thank you" title={<>Setting up {courseName} for {child}</>}>
        <p>Your payment is going through. This page updates by itself in a few seconds. There is no need to pay again.</p>
        <AwaitPayment />
      </BrightPage>
    );
  }

  if (owned || !course) {
    return (
      <BrightPage eyebrow="All set" title={<>{child} is ready to go</>}>
        <p className="axbright-ok">Your consent is recorded{status === "paid" ? " and your payment has gone through" : ""}.</p>
        <p>
          {child} can sign in now and start {courseName}.{status === "paid" ? " Your receipt is on its way to your inbox." : ""}
        </p>
        <Link href={course?.signIn ?? "/"} className="axbright-btn">
          Open {courseName}
        </Link>
      </BrightPage>
    );
  }

  const canPay = CONSUMER_CHECKOUT_OPEN || (await isStaffEmail(link.user.parentEmail));
  const price = formatPence(course.pence);

  return (
    <BrightPage eyebrow="Consent recorded" title={<>Thank you. Now {courseName} for {child}</>}>
      <p className="axbright-ok">Your consent is recorded.</p>
      {canPay ? (
        <>
          <p>
            Buy {courseName} for {child} here. It goes straight onto {child}&rsquo;s account and the receipt comes to you.
          </p>
          <div className="axbright-box axbright-price">
            <span>
              One payment, theirs for life.
              <br />
              <span className="axbright-small">Includes {formatPence(vatIncludedPence(course.pence))} VAT.</span>
            </span>
            <strong>{price}</strong>
          </div>
          <ParentPayForm action={parentCheckoutAction.bind(null, token)} price={price} />
          {error === "consent" && <p className="axbright-warn">Tick the box to start the course straight away, then press pay.</p>}
          {error === "unavailable" && <p className="axbright-warn">Checkout did not open just then. Please try again in a moment.</p>}
          <p className="axbright-small">Payment is handled securely by Stripe.</p>
          {!CONSUMER_CHECKOUT_OPEN && <p className="axbright-small">Staff preview: checkout is open to staff only until launch.</p>}
        </>
      ) : (
        <p>
          {child} can sign in and start now. Buying {courseName} for {child} opens here soon, {price} once.
        </p>
      )}
    </BrightPage>
  );
}
