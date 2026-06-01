/**
 * /hub — the family home base after login.
 *
 * Server component: auth + data fetch happen here, then the result is
 * composed into client components for entrance motion and waitlist
 * interactions. No entitlement gate on this route itself — the hub is
 * the ROUTING surface for entitlement gates (cards on it link out to
 * either /dashboard for owned tracks or /purchase/<slug> for not-yet-
 * owned ones).
 *
 * Quality bar: this is the parent's first view every visit, so spacing,
 * type hierarchy, and the chromatic halo on the owned card all matter.
 * Match the polish of /login and /signup.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { getOwnedProductSlugs, getAge } from "@/app/lib/entitlements";
import { CYBER_PALETTE, CYBER_GRAD, CYBER_SHADOW } from "@/app/components/scene/cyberTokens";
import Link from "next/link";
import ProductCard, { type ProductCardVariant } from "@/app/components/hub/ProductCard";
import AgeProgressionBanner from "@/app/components/hub/AgeProgressionBanner";
import { landingRouteFor } from "@/app/lib/courseLandings";

const C = CYBER_PALETTE;
const GRAD = CYBER_GRAD.hero;

/** "Asad Jalal" → "Asad". Falls back to "hero" when name is missing. */
function firstName(full?: string | null): string {
  if (!full) return "hero";
  const trimmed = full.trim();
  if (!trimmed) return "hero";
  return trimmed.split(/\s+/)[0];
}

/** Pence → "£99" / "£189.50". Strips trailing ".00" for the common case. */
function formatPrice(pence: number): string {
  const pounds = pence / 100;
  return pounds % 1 === 0 ? `£${pounds.toFixed(0)}` : `£${pounds.toFixed(2)}`;
}

export default async function HubPage({
  searchParams,
}: {
  /* ?selected=<slug> arrives from the login/signup journey when the user
     came in via a specific course card. We use it only to gently highlight
     the matching track — the account still belongs to the whole platform. */
  searchParams: Promise<{ selected?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const { selected } = await searchParams;
  const selectedSlug =
    selected && /^[a-z0-9-]{1,40}$/.test(selected) ? selected : null;

  /* Three independent reads — could be Promise.all'd but Prisma already
     pipelines these and the page is server-rendered. Keep readable. */
  const products = await prisma.product.findMany({
    orderBy: [{ status: "asc" }, { ageMin: "asc" }],
  });
  const ownedSlugs = await getOwnedProductSlugs(userId);
  const children = await prisma.childProfile.findMany({
    where: { userId },
    select: { id: true, name: true, dateOfBirth: true },
  });

  /* Age-progression nudge: find the first (child, product) pair where the
     child is within 1 year of an ACTIVE, unowned product's ageMin. Cap at
     one banner so it stays a gentle nudge, not a wall of CTAs. */
  let progressionHint: { childName: string; productName: string; ctaHref: string } | null = null;
  outer: for (const child of children) {
    const age = getAge(child.dateOfBirth);
    for (const product of products) {
      if (product.status !== "ACTIVE") continue;
      if (ownedSlugs.has(product.slug)) continue;
      if (age >= product.ageMin - 1 && age < product.ageMin) {
        progressionHint = {
          childName: child.name,
          productName: product.name,
          ctaHref: `/purchase/${product.slug}`,
        };
        break outer;
      }
    }
  }

  return (
    <main
      style={{
        position: "relative",
        minHeight: "100vh",
        background: CYBER_GRAD.page,
        color: C.textBright,
        overflowX: "hidden",
        fontFamily: "'DM Sans', 'Inter', system-ui, -apple-system, sans-serif",
      }}
    >
      {/* ─── Subtle drifting grain — keeps the dark bg from feeling flat.
              Pure CSS pseudo-element via inline style; respects reduced-motion
              indirectly because there's no animation here, just a static field. */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(0, 229, 255, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(124, 92, 255, 0.06) 0%, transparent 55%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 1120,
          margin: "0 auto",
          padding: "32px 22px 80px",
        }}
      >
        {/* ─── HEADER ROW: logo (matches /login) + tiny session crumb ─── */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 48,
          }}
        >
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              textDecoration: "none",
            }}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: GRAD,
                boxShadow: `0 0 22px ${C.cyan}77`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 900,
                  color: C.abyss,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                AX
              </span>
            </div>
            <span
              style={{
                fontSize: 20,
                fontWeight: 900,
                color: C.textBright,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                letterSpacing: "-0.01em",
              }}
            >
              Algorithm
              <span
                style={{
                  background: GRAD,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                X
              </span>
            </span>
          </Link>

          {/* Tiny terminal crumb — same vocabulary as /login's "$ ax_login --auth" */}
          <span
            style={{
              fontFamily: "ui-monospace, 'JetBrains Mono', Menlo, monospace",
              fontSize: 11,
              letterSpacing: 1.5,
              color: C.cyan,
              padding: "5px 12px",
              borderRadius: 999,
              background: "rgba(8, 10, 22, 0.6)",
              border: `1px solid ${C.cyan}55`,
              textShadow: `0 0 8px ${C.cyan}`,
            }}
          >
            ◇ FAMILY HUB ◇
          </span>
        </header>

        {/* ─── GREETING ─── */}
        <section style={{ marginBottom: 36 }}>
          <h1
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: "clamp(34px, 5.5vw, 52px)",
              fontWeight: 900,
              letterSpacing: "-0.025em",
              lineHeight: 1.08,
              margin: 0,
              marginBottom: 12,
              background: GRAD,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              color: "transparent",
              filter: `drop-shadow(0 2px 0 rgba(8,10,22,0.9)) drop-shadow(0 0 22px ${C.cyan}55)`,
            }}
          >
            Welcome back, {firstName(session.user.name)}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 500,
              color: C.text,
              maxWidth: 560,
              lineHeight: 1.5,
            }}
          >
            Choose an adventure for your family.
          </p>
        </section>

        {/* ─── AGE PROGRESSION NUDGE (optional) ─── */}
        {progressionHint && (
          <div style={{ marginBottom: 28 }}>
            <AgeProgressionBanner
              childName={progressionHint.childName}
              productName={progressionHint.productName}
              ctaHref={progressionHint.ctaHref}
            />
          </div>
        )}

        {/* ─── PRODUCT GRID ─── */}
        <section aria-labelledby="tracks-heading">
          <h2
            id="tracks-heading"
            style={{
              fontFamily: "'Space Grotesk', system-ui, sans-serif",
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: C.cyanSoft,
              margin: 0,
              marginBottom: 18,
            }}
          >
            Tracks
          </h2>

          <div
            style={{
              display: "grid",
              gap: 22,
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            }}
          >
            {products.map((product, i) => {
              const owned = ownedSlugs.has(product.slug);
              const variant: ProductCardVariant =
                product.status === "COMING_SOON"
                  ? "coming"
                  : owned
                    ? "owned"
                    : "active";

              const ctaHref =
                variant === "owned"
                  ? "/dashboard"
                  : variant === "active"
                    ? `/purchase/${product.slug}`
                    : "#";

              const ctaLabel =
                variant === "owned"
                  ? "Enter →"
                  : variant === "active"
                    ? `Purchase ${formatPrice(product.priceGBP)}`
                    : "Coming soon";

              return (
                <ProductCard
                  key={product.id}
                  slug={product.slug}
                  name={product.name}
                  emoji={product.emoji}
                  ageRange={product.ageRange}
                  duration={product.duration}
                  weeksCount={product.weeksCount}
                  priceGBP={product.priceGBP}
                  variant={variant}
                  ctaHref={ctaHref}
                  ctaLabel={ctaLabel}
                  landingHref={landingRouteFor(product.slug)}
                  highlighted={product.slug === selectedSlug}
                  index={i}
                />
              );
            })}
          </div>
        </section>
      </div>
    </main>
  );
}

