/**
 * /purchase/[slug]: where a signed-in visitor buys a consumer course.
 *
 *   1. opens soon (default). Requires sign-in. Refuses slugs that do not
 *      resolve to an ACTIVE Product. Someone who already owns the course
 *      is sent straight into it. Everyone else is told buying opens soon.
 *      This page and its action never grant an entitlement: until
 *      2026-11-25 a stub "Pay" button granted any course for free.
 *
 *   2. success (?status=success). Re-verifies the entitlement so a typed
 *      URL cannot show it to someone who has not paid.
 *
 * When real checkout lands, the Stripe webhook writes the entitlement via
 * grantEntitlement(userId, slug, "PURCHASE") and returns the buyer to the
 * success view.
 */

import { CATALOGUE, courseHomeFor, safeCourseSlug } from "@/app/lib/courseIntent";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import { FIRM_BUY_PATH, isFirmProduct } from "@/app/lib/cyberSecured";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CYBER_PALETTE,
  CYBER_GRAD,
  CYBER_SHADOW,
} from "@/app/components/scene/cyberTokens";
import FadeIn from "./FadeIn";

const C = CYBER_PALETTE;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}

/* One slug -> portal map for the whole product, in courseIntent.ts.
 * This used to keep a second copy here that fell back to the hub; with
 * the hub gone the two would have disagreed, so it now defers. */
function entryRouteFor(slug: string): string {
  return courseHomeFor(safeCourseSlug(slug));
}

function formatPrice(pence: number): string {
  const pounds = pence / 100;
  return pounds % 1 === 0 ? `£${pounds.toFixed(0)}` : `£${pounds.toFixed(2)}`;
}

export default async function PurchasePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { status } = await searchParams;

  /* Firm courses (Cyber Secured and its tracks) are licensed by firms,
   * never bought here: no order summary, no stub grant, straight to the
   * corporate page. Checked before sign-in, since nobody needs an account
   * to be told that. */
  if (isFirmProduct(decodeURIComponent(slug))) redirect(FIRM_BUY_PATH);

  /* ──────────────────── auth ──────────────────── */
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/purchase/${slug}`)}`);
  }

  /* ──────────────────── product ──────────────────── */
  const product = await prisma.product.findUnique({
    where: { slug },
    select: {
      slug: true,
      name: true,
      emoji: true,
      ageRange: true,
      duration: true,
      weeksCount: true,
      priceGBP: true,
      status: true,
    },
  });
  if (!product) redirect(CATALOGUE);

  // Only ACTIVE products are purchasable. COMING_SOON tracks have a
  // waitlist instead — kicking back to the catalogue is right here.
  if (product.status !== "ACTIVE") redirect(CATALOGUE);

  /* ──────────────────── state routing ──────────────────── */
  const owned = await hasEntitlement(session.user.id, product.slug);

  if (status === "success") {
    // Defensive: don't render the success view for users who haven't
    // actually been granted the entitlement (eg someone typing the
    // ?status=success URL directly).
    if (!owned) redirect(`/purchase/${product.slug}`);
    return <SuccessView product={product} />;
  }

  // Not the success state and the user already owns the product —
  // there's nothing to sell them, so put them straight inside the course
  // they own (owner 2026-10-16: no hub, log in and you are in the course).
  if (owned) redirect(courseHomeFor(safeCourseSlug(product.slug)));

  return <OpensSoon product={product} />;
}

/* ─────────────────────────────────────────────────────────────────────
   STATE 1 — buying opens soon
   Nothing is sold or granted here yet. Real checkout lands in a later
   change; until then a signed-in visitor who does not own the course is
   told, calmly, that buying is not open, and pointed back to the course.
   ──────────────────────────────────────────────────────────────────── */

/* Each consumer course's own landing page, where "Back to the course"
 * goes. Anything unknown falls back to the catalogue. */
const COURSE_LANDING: Record<string, string> = {
  "cyber-heroes": "/cyberheroes",
  cyberexplorers: "/cyberexplorers",
  cyberstart: "/ops",
  "cyberstart-pro": "/pro",
  "desk-ready": "/desk-ready",
};

function OpensSoon({
  product,
}: {
  product: {
    slug: string;
    name: string;
    emoji: string;
    ageRange: string;
    duration: string;
    weeksCount: number;
    priceGBP: number;
  };
}) {
  const priceLabel = formatPrice(product.priceGBP);
  const landing = COURSE_LANDING[product.slug] ?? CATALOGUE;

  return (
    <PurchaseFrame>
      <FadeIn>
        <article
          data-purchase-state="opens-soon"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 18,
            padding: "30px 26px",
            borderRadius: 22,
            background: CYBER_GRAD.card,
            border: `1px solid ${C.cyan}33`,
            boxShadow: CYBER_SHADOW.cardHero,
            backdropFilter: "blur(10px)",
          }}
        >
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
              {product.emoji}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: C.amber,
                  marginBottom: 4,
                }}
              >
                Buying opens soon
              </div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 26,
                  fontWeight: 900,
                  lineHeight: 1.15,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  color: C.textBright,
                }}
              >
                {product.name}
              </h1>
            </div>
          </header>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <MetaPill label={`Ages ${product.ageRange}`} accent={C.cyan} />
            <MetaPill label={product.duration} accent={C.cosmicSoft} />
            {product.weeksCount > 0 && (
              <MetaPill label={`${product.weeksCount} weeks`} accent={C.lime} />
            )}
            <MetaPill label={`${priceLabel} once`} accent={C.amber} />
          </div>

          <p
            role="status"
            style={{
              margin: 0,
              padding: "16px 18px",
              borderRadius: 14,
              background: "rgba(8, 10, 22, 0.4)",
              border: `1px solid ${C.cyan}1f`,
              color: C.text,
              fontSize: 15,
              lineHeight: 1.55,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            We are getting checkout ready. Soon you will be able to buy{" "}
            {product.name} here, once, for {priceLabel}. Nothing has been
            charged and nothing on your account has changed.
          </p>

          <Link
            href={landing}
            style={{
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
            }}
          >
            Back to {product.name}
          </Link>

          <Link
            href={CATALOGUE}
            style={{
              justifySelf: "center",
              color: C.cyanSoft,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            See all courses
          </Link>
        </article>
      </FadeIn>
    </PurchaseFrame>
  );
}

/* ─────────────────────────────────────────────────────────────────────
   STATE 3 — success (entitlement already written before render)
   ──────────────────────────────────────────────────────────────────── */

function SuccessView({
  product,
}: {
  product: { slug: string; name: string; emoji: string };
}) {
  const entryHref = entryRouteFor(product.slug);

  return (
    <PurchaseFrame>
      <FadeIn>
        <section
          role="status"
          aria-live="polite"
          style={{
            display: "grid",
            gap: 18,
            padding: "36px 28px",
            borderRadius: 22,
            background: CYBER_GRAD.card,
            border: `1px solid ${C.lime}55`,
            boxShadow: `0 0 32px ${C.lime}33, ${CYBER_SHADOW.cardHero}`,
            textAlign: "center",
            backdropFilter: "blur(10px)",
          }}
        >
          {/* Big success rosette */}
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
            <div
              style={{
                fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.lime,
                marginBottom: 6,
                textShadow: `0 0 10px ${C.lime}66`,
              }}
            >
              Access granted
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: 26,
                fontWeight: 900,
                lineHeight: 1.2,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                color: C.textBright,
              }}
            >
              <span aria-hidden style={{ marginRight: 8 }}>
                {product.emoji}
              </span>
              {product.name} unlocked
            </h1>
          </div>

          <p
            style={{
              margin: 0,
              color: C.text,
              fontSize: 15,
              lineHeight: 1.55,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            You and your family now have lifetime access. Jump straight in,
            or head back to the hub to set up a child profile first.
          </p>

          <Link
            href={entryHref}
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              alignSelf: "stretch",
              padding: "14px 22px",
              borderRadius: 14,
              background: `linear-gradient(135deg, ${C.lime}, ${C.cyan})`,
              color: C.abyss,
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontWeight: 900,
              fontSize: 16,
              letterSpacing: "0.01em",
              textDecoration: "none",
              boxShadow: `0 0 24px ${C.lime}66`,
            }}
          >
            Enter {product.name} →
          </Link>

          <Link
            href={CATALOGUE}
            style={{
              color: C.cyanSoft,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            ← Back to all courses
          </Link>
        </section>
      </FadeIn>
    </PurchaseFrame>
  );
}

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
