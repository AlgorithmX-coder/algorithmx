/**
 * /purchase/[slug] — real order-summary + stub payment + success view.
 *
 * Three states funnel through one server component:
 *
 *   1. order-summary — default landing. Requires login (bounces with
 *      ?callbackUrl so the user returns here after auth). Refuses
 *      slugs that don't resolve to an ACTIVE Product. Refuses to
 *      upsell what the user already owns. Renders the real DB-driven
 *      summary + the stub PaymentButton.
 *
 *   2. payment — the PaymentButton calls startCheckoutAction which
 *      grants the entitlement (today; Stripe later) and redirects
 *      back here with ?status=success.
 *
 *   3. success — confirmation panel with "Enter <track>" CTA.
 *      Defensively re-verifies the entitlement so a hand-crafted
 *      `?status=success` URL can't render the success view to a
 *      user who hasn't actually paid.
 *
 * The grant is written by the standalone grantEntitlement() function
 * in lib/entitlements.ts. Stripe's webhook will call the same
 * function with source="PURCHASE" so this page stays unchanged when
 * real payments land.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  CYBER_PALETTE,
  CYBER_GRAD,
  CYBER_SHADOW,
} from "@/app/components/scene/cyberTokens";
import FadeIn from "./FadeIn";
import PaymentButton from "./PaymentButton";

const C = CYBER_PALETTE;

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string }>;
}

/* Cyber-heroes is the only product with a live lesson entry today.
 * When a second track becomes enterable, replace this with a real
 * slug → route map (mirrors COURSE_LANDING_ROUTES). */
function entryRouteFor(slug: string): string {
  if (slug === "cyber-heroes") return "/dashboard";
  return "/hub";
}

function formatPrice(pence: number): string {
  const pounds = pence / 100;
  return pounds % 1 === 0 ? `£${pounds.toFixed(0)}` : `£${pounds.toFixed(2)}`;
}

export default async function PurchasePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { status } = await searchParams;

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
  if (!product) redirect("/hub");

  // Only ACTIVE products are purchasable. COMING_SOON tracks have a
  // waitlist instead — kicking back to /hub is the right behaviour.
  if (product.status !== "ACTIVE") redirect("/hub");

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
  // there's nothing to sell them. Push them to the hub.
  if (owned) redirect("/hub");

  return <OrderSummary product={product} />;
}

/* ─────────────────────────────────────────────────────────────────────
   STATE 1 — order summary (real, DB-driven)
   ──────────────────────────────────────────────────────────────────── */

function OrderSummary({
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

  const included = [
    `${product.weeksCount > 0 ? `${product.weeksCount} weekly` : "Weekly"} interactive missions`,
    "Boss battles, badges and a printable hero certificate",
    "Progress saved per child — multiple kids on one account",
    "Family-safe: COPPA-aware, no third-party tracking",
    "Lifetime access — buy once, replay any time",
  ];

  return (
    <PurchaseFrame>
      <FadeIn>
        <article
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
          {/* Header row: emoji tile + name + meta */}
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
                  color: C.cyan,
                  marginBottom: 4,
                }}
              >
                Order summary
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

          {/* Meta chips */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <MetaPill label={`Ages ${product.ageRange}`} accent={C.cyan} />
            <MetaPill label={product.duration} accent={C.cosmicSoft} />
            {product.weeksCount > 0 && (
              <MetaPill label={`${product.weeksCount} weeks`} accent={C.lime} />
            )}
            <MetaPill label="Lifetime access" accent={C.amber} />
          </div>

          {/* What's included list */}
          <section
            aria-label="What's included"
            style={{
              padding: "16px 18px",
              borderRadius: 14,
              background: "rgba(8, 10, 22, 0.4)",
              border: `1px solid ${C.cyan}1f`,
            }}
          >
            <div
              style={{
                fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
                fontSize: 11,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: C.cyan,
                marginBottom: 12,
              }}
            >
              {/* TODO: tailor this per-product when more tracks ship. */}
              What&apos;s included
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 10 }}>
              {included.map((line) => (
                <li
                  key={line}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "flex-start",
                    color: C.text,
                    fontSize: 14.5,
                    lineHeight: 1.45,
                    fontFamily: "'DM Sans', system-ui, sans-serif",
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      marginTop: 2,
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: `${C.lime}1f`,
                      color: C.lime,
                      fontSize: 11,
                      fontWeight: 900,
                      border: `1px solid ${C.lime}66`,
                    }}
                  >
                    ✓
                  </span>
                  {line}
                </li>
              ))}
            </ul>
          </section>

          {/* Total row */}
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              padding: "14px 18px",
              borderRadius: 14,
              background: "rgba(8, 10, 22, 0.55)",
              border: `1px solid ${C.cyan}33`,
            }}
          >
            <span
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: C.textSoft,
                fontFamily: "'DM Sans', system-ui, sans-serif",
                letterSpacing: 0.5,
              }}
            >
              Total today
            </span>
            <span
              style={{
                fontSize: 30,
                fontWeight: 900,
                color: C.textBright,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                letterSpacing: "-0.02em",
              }}
            >
              {priceLabel}
            </span>
          </div>

          {/* Payment step */}
          <PaymentButton slug={product.slug} priceLabel={priceLabel} />

          {/* Reassurance line + back link */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
              paddingTop: 4,
              fontSize: 12.5,
              color: C.textSoft,
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            <span>One-time payment · No subscription · 14-day refund.</span>
            <Link
              href="/hub"
              style={{
                color: C.cyanSoft,
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              ← Back to hub
            </Link>
          </div>
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
            href="/hub"
            style={{
              color: C.cyanSoft,
              fontWeight: 700,
              fontSize: 13,
              textDecoration: "none",
              fontFamily: "'DM Sans', system-ui, sans-serif",
            }}
          >
            ← Back to hub
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
