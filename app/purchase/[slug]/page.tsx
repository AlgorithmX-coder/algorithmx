/**
 * /purchase/[slug]: where one person buys one course for themselves.
 *
 *   1. buy (checkout open, or staff while it is shut). An order summary at
 *      the catalogue price, VAT included, and the 14-day cancellation tick.
 *      The button creates a Stripe Checkout Session (./actions.ts); nothing
 *      is granted here. The Stripe webhook writes the PURCHASE entitlement
 *      once the payment clears (app/lib/consumerCheckout.ts).
 *
 *   2. opens soon (checkout shut, everyone but staff). Calm, and grants
 *      nothing. CONSUMER_CHECKOUT_OPEN in app/lib/launchSwitch.ts.
 *
 *   3. success (?status=success). Shown only to someone who now holds the
 *      course. A buyer back from Stripe before the webhook has landed sees
 *      a short "setting up" view that refreshes itself, never a promise.
 *
 * Requires sign-in: a signed-out visitor goes to the course's own sign-up
 * with a callback here. Someone who already holds the course is sent
 * straight into it.
 */

import { CATALOGUE } from "@/app/lib/courseIntent";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import { FIRM_BUY_PATH, isFirmProduct } from "@/app/lib/cyberSecured";
import { consumerCourse, formatPence, purchasePath, vatIncludedPence, type ConsumerCourse } from "@/app/lib/consumerCatalogue";
import { consumerPurchaseRecorded } from "@/app/lib/consumerCheckout";
import { CONSUMER_CHECKOUT_OPEN } from "@/app/lib/launchSwitch";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CYBER_PALETTE,
  CYBER_GRAD,
  CYBER_SHADOW,
} from "@/app/components/scene/cyberTokens";
import FadeIn from "./FadeIn";
import BuyForm from "./BuyForm";
import AwaitPayment from "./AwaitPayment";
import { startCheckoutAction } from "./actions";

const C = CYBER_PALETTE;

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; error?: string; session_id?: string }>;
}

type ProductView = { slug: string; name: string; emoji: string; ageRange: string; duration: string };

export default async function PurchasePage({ params, searchParams }: PageProps) {
  const { slug: rawSlug } = await params;
  const { status, error, session_id: sessionId } = await searchParams;
  const slug = decodeURIComponent(rawSlug);

  /* Only the owner's price list is for sale here. The firm licence itself
   * (Cyber Secured) is sold to firms on /corporate. Checked before sign-in,
   * since nobody needs an account to be told that. */
  const course = consumerCourse(slug);
  if (!course) {
    if (isFirmProduct(slug)) redirect(FIRM_BUY_PATH);
    redirect(CATALOGUE);
  }
  const here = purchasePath(course.slug);

  /* ──────────────────── auth ──────────────────── */
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`${course.signUp}?callbackUrl=${encodeURIComponent(here)}`);
  }
  const userId = session.user.id;

  /* ──────────────────── product ──────────────────── */
  const product = await prisma.product.findUnique({
    where: { slug: course.slug },
    select: { slug: true, name: true, emoji: true, ageRange: true, duration: true },
  });
  if (!product) redirect(CATALOGUE);

  /* ──────────────────── state routing ──────────────────── */
  const owned = await hasEntitlement(userId, course.slug);

  if (status === "success") {
    if (owned) return <SuccessView course={course} product={product} />;
    /* Back from Stripe, webhook not landed yet: wait for it. Anything else
       (a typed URL, a cancelled payment) goes back to the buy page. */
    if (sessionId && !(await consumerPurchaseRecorded(sessionId, userId))) return <Processing course={course} />;
    redirect(here);
  }

  // Already theirs: nothing to sell, straight inside the course.
  if (owned) redirect(course.home);

  const staff = await isStaffUser(userId);
  if (!CONSUMER_CHECKOUT_OPEN && !staff) return <OpensSoon course={course} product={product} />;

  return (
    <BuyView
      course={course}
      product={product}
      email={session.user.email ?? ""}
      error={error === "consent" || error === "unavailable" ? error : null}
      preview={!CONSUMER_CHECKOUT_OPEN}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STATE 1: buy
   ──────────────────────────────────────────────────────────────────── */

const ERRORS: Record<"consent" | "unavailable", string> = {
  consent: "Tick the box to start your course straight away, then press pay.",
  unavailable: "Checkout did not open just then. Please try again in a moment.",
};

function BuyView({
  course,
  product,
  email,
  error,
  preview,
}: {
  course: ConsumerCourse;
  product: ProductView;
  email: string;
  error: "consent" | "unavailable" | null;
  preview: boolean;
}) {
  const price = formatPence(course.pence);
  const vat = formatPence(vatIncludedPence(course.pence));
  return (
    <PurchaseFrame>
      <FadeIn>
        <article data-purchase-state="buy" style={cardStyle(C.cyan)}>
          <CourseHeader eyebrow="Your order" eyebrowColour={C.cyan} name={course.name} emoji={product.emoji} />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {product.ageRange && <MetaPill label={`Ages ${product.ageRange}`} accent={C.cyan} />}
            {product.duration && <MetaPill label={product.duration} accent={C.cosmicSoft} />}
            <MetaPill label="Lifetime access" accent={C.lime} />
          </div>

          <p style={bodyText}>{course.line}</p>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              gap: 12,
              padding: "16px 18px",
              borderRadius: 14,
              background: "rgba(8, 10, 22, 0.4)",
              border: `1px solid ${C.cyan}1f`,
            }}
          >
            <div style={{ fontFamily: "'DM Sans', system-ui, sans-serif", color: C.text, fontSize: 14, lineHeight: 1.5 }}>
              One payment, yours for life.
              <br />
              <span style={{ fontSize: 12.5, opacity: 0.8 }}>Includes {vat} VAT.</span>
            </div>
            <div style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif", fontWeight: 900, fontSize: 32, color: C.textBright }} data-price-pence={course.pence}>
              {price}
            </div>
          </div>

          {error && (
            <p role="alert" style={{ ...bodyText, margin: 0, color: C.amber }}>
              {ERRORS[error]}
            </p>
          )}

          <BuyForm action={startCheckoutAction.bind(null, course.slug)} price={price} />

          <p style={{ ...bodyText, fontSize: 12.5, margin: 0, opacity: 0.8 }}>
            Payment is handled securely by Stripe. Your receipt goes to {email || "the address on your account"}.
          </p>

          {preview && (
            <p data-staff-preview style={{ ...bodyText, fontSize: 12, margin: 0, color: C.amber }}>
              Staff preview: checkout is open to staff only until launch.
            </p>
          )}

          <Link href={course.landing} style={smallLink}>
            Back to {course.name}
          </Link>
        </article>
      </FadeIn>
    </PurchaseFrame>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STATE 2: buying opens soon
   Nothing is sold or granted here. A signed-in visitor who does not own
   the course is told, calmly, that buying is not open yet.
   ──────────────────────────────────────────────────────────────────── */

function OpensSoon({ course, product }: { course: ConsumerCourse; product: ProductView }) {
  const price = formatPence(course.pence);
  return (
    <PurchaseFrame>
      <FadeIn>
        <article data-purchase-state="opens-soon" style={cardStyle(C.cyan)}>
          <CourseHeader eyebrow="Buying opens soon" eyebrowColour={C.amber} name={course.name} emoji={product.emoji} />

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {product.ageRange && <MetaPill label={`Ages ${product.ageRange}`} accent={C.cyan} />}
            {product.duration && <MetaPill label={product.duration} accent={C.cosmicSoft} />}
            <MetaPill label={`${price} once`} accent={C.amber} />
          </div>

          <p role="status" style={panelText}>
            We are getting checkout ready. Soon you will be able to buy {course.name} here, once, for {price}. Nothing has been
            charged and nothing on your account has changed.
          </p>

          <Link href={course.landing} style={primaryButton}>
            Back to {course.name}
          </Link>

          <Link href={CATALOGUE} style={smallLink}>
            See all courses
          </Link>
        </article>
      </FadeIn>
    </PurchaseFrame>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STATE 3: paid, waiting for Stripe's confirmation to land
   ──────────────────────────────────────────────────────────────────── */

function Processing({ course }: { course: ConsumerCourse }) {
  return (
    <PurchaseFrame>
      <FadeIn>
        <section data-purchase-state="processing" role="status" aria-live="polite" style={{ ...cardStyle(C.cyan), textAlign: "center" }}>
          <h1 style={headline}>Setting up {course.name}</h1>
          <p style={bodyText}>
            Thank you. Your payment is going through and your course opens here in a few seconds. There is no need to pay again.
          </p>
          <AwaitPayment />
        </section>
      </FadeIn>
    </PurchaseFrame>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STATE 4: success (the entitlement is already written)
   ──────────────────────────────────────────────────────────────────── */

function SuccessView({ course, product }: { course: ConsumerCourse; product: ProductView }) {
  return (
    <PurchaseFrame>
      <FadeIn>
        <section
          data-purchase-state="success"
          role="status"
          aria-live="polite"
          style={{ ...cardStyle(C.lime), textAlign: "center", boxShadow: `0 0 32px ${C.lime}33, ${CYBER_SHADOW.cardHero}` }}
        >
          <div
            aria-hidden
            style={{
              width: 72,
              height: 72,
              margin: "0 auto",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 900,
              color: C.abyss,
              background: `linear-gradient(135deg, ${C.lime}, ${C.cyan})`,
              boxShadow: `0 0 32px ${C.lime}aa, inset 0 0 0 2px rgba(255,255,255,0.35)`,
            }}
          >
            ✓
          </div>

          <div>
            <div style={{ ...eyebrow, color: C.lime, marginBottom: 6, textShadow: `0 0 10px ${C.lime}66` }}>Access granted</div>
            <h1 style={headline}>
              <span aria-hidden style={{ marginRight: 8 }}>
                {product.emoji}
              </span>
              {course.name} is yours
            </h1>
          </div>

          <p style={bodyText}>Lifetime access starts now. Your receipt is on its way to your inbox.</p>

          <Link href={course.home} style={{ ...primaryButton, background: `linear-gradient(135deg, ${C.lime}, ${C.cyan})`, boxShadow: `0 0 24px ${C.lime}66` }}>
            Start {course.name}
          </Link>
        </section>
      </FadeIn>
    </PurchaseFrame>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   Shared pieces
   ──────────────────────────────────────────────────────────────────── */

function CourseHeader({ eyebrow: label, eyebrowColour, name, emoji }: { eyebrow: string; eyebrowColour: string; name: string; emoji: string }) {
  return (
    <header style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div
        style={{
          flexShrink: 0,
          width: 64,
          height: 64,
          borderRadius: 16,
          background: `${C.cyan}18`,
          border: `1px solid ${C.cyan}55`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 36,
          boxShadow: `inset 0 0 16px ${C.cyan}33`,
        }}
        aria-hidden
      >
        {emoji}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ ...eyebrow, color: eyebrowColour, marginBottom: 4 }}>{label}</div>
        <h1 style={headline}>{name}</h1>
      </div>
    </header>
  );
}

function cardStyle(accent: string): React.CSSProperties {
  return {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 18,
    padding: "30px 26px",
    borderRadius: 22,
    background: CYBER_GRAD.card,
    border: `1px solid ${accent}33`,
    boxShadow: CYBER_SHADOW.cardHero,
    backdropFilter: "blur(10px)",
  };
}

const eyebrow: React.CSSProperties = {
  fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
  fontSize: 11,
  letterSpacing: 2,
  textTransform: "uppercase",
};

const headline: React.CSSProperties = {
  margin: 0,
  fontSize: 26,
  fontWeight: 900,
  lineHeight: 1.15,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  color: C.textBright,
};

const bodyText: React.CSSProperties = {
  margin: 0,
  color: C.text,
  fontSize: 15,
  lineHeight: 1.55,
  fontFamily: "'DM Sans', system-ui, sans-serif",
};

const panelText: React.CSSProperties = {
  ...bodyText,
  padding: "16px 18px",
  borderRadius: 14,
  background: "rgba(8, 10, 22, 0.4)",
  border: `1px solid ${C.cyan}1f`,
};

const primaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  alignSelf: "stretch",
  padding: "14px 22px",
  borderRadius: 14,
  background: CYBER_GRAD.hero,
  color: C.abyss,
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
  fontWeight: 900,
  fontSize: 16,
  letterSpacing: "0.01em",
  textDecoration: "none",
  boxShadow: CYBER_SHADOW.buttonGlow,
};

const smallLink: React.CSSProperties = {
  justifySelf: "center",
  color: C.cyanSoft,
  fontWeight: 700,
  fontSize: 13,
  textDecoration: "none",
  fontFamily: "'DM Sans', system-ui, sans-serif",
};

/* ─────────────────────────────────────────────────────────────────────
   Frame / helpers
   ──────────────────────────────────────────────────────────────────── */

function PurchaseFrame({ children }: { children: React.ReactNode }) {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: CYBER_GRAD.page,
        color: C.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 18px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 560 }}>{children}</div>
    </main>
  );
}

function MetaPill({ label, accent }: { label: string; accent: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "4px 10px",
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: 0.4,
        fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
        color: accent,
        background: "rgba(8, 10, 22, 0.55)",
        border: `1px solid ${accent}44`,
        borderRadius: 999,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
