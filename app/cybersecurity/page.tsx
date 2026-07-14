import type { Metadata } from "next";
import Link from "next/link";

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { getAge } from "@/app/lib/entitlements";
import { landingRouteFor } from "@/app/lib/courseLandings";

import Nav from "@/app/components/landing-v2/Nav";
import Footer from "@/app/components/landing-v2/Footer";
import GlobalBackdrop from "@/app/components/landing-v2/GlobalBackdrop";
import { FadeUp } from "@/app/components/landing-v2/utilities";

import TrackCard from "./TrackCard";

/**
 * /cybersecurity — the subject browse page.
 *
 * Sits between the homepage SubjectShowcase card and the four individual
 * track landing pages (/cyberheroes, /cyberexplorers, /cyberstart,
 * /cyberstart-pro). Parents come here to see the full age progression
 * across a single subject and choose by their child's age.
 *
 * Public — NO entitlement gate. Browse-not-buy: every track card's
 * primary CTA is "View course →" pointing at the per-track landing
 * page (where the actual purchase flow lives). Even COMING_SOON tracks
 * are linked, because their landing pages collect waitlist sign-ups.
 *
 * Server component. Fetches the four tracks by slug from the catalogue
 * and the signed-in user's children (if any) to drive a soft
 * "great fit for {name}" highlight on the matching track card.
 *
 * Rendered dynamically: this page reads the catalogue from the DB and
 * personalises on the signed-in user's children, so it can't be a
 * static prerender. force-dynamic keeps it out of build-time static
 * generation (the build has no database); it's rendered per request.
 */
export const dynamic = "force-dynamic";

const CYBER_TRACK_SLUGS = [
  "cyber-heroes",
  "cyberexplorers",
  "cyberstart",
  "cyberstart-pro",
] as const;

/* Track-level taglines NOT in the DB (the DB carries weekly content
 * only). Keyed by slug so a change here lands without a migration.
 *
 * Copy is marketing-led, parent-facing, and built around a shared
 * shape: one value/benefit beat for the parent, then the technical
 * proof-point that backs it up. Reads as premium and credible, not
 * as a dry syllabus. */
const TRACK_BLURBS: Record<string, string> = {
  "cyber-heroes":
    "A confident, safe start in technology. Through animated missions with Adam and Layla, children learn strong passwords, scam-spotting and smart online habits they can use every day.",
  cyberexplorers:
    "A spy thriller they play for real. As an agent of ARC, your child cracks 20 story missions with a voice-acted handler — learning to spot phishing, fake voices and data tricks for life.",
  cyberstart:
    "Build portfolio-ready cyber skills through network defence, capture-the-flag challenges, and incident response projects designed for serious learners.",
  "cyberstart-pro":
    "Develop career-grade cyber capability through pen-testing, threat modelling, and security projects built for university, work, and professional growth.",
};

/* Display-layer overrides for track name + age range. The DB still
 * carries the seeded names ("Cyber Heroes Academy", "CyberStart",
 * "CyberStart Pro") and original age bands, but the homepage now
 * markets the four courses under simpler names and slightly retuned
 * ranges. Overriding at render time avoids touching the DB schema /
 * Stripe / entitlement plumbing which is keyed on slug, not name. */
const TRACK_DISPLAY_OVERRIDES: Record<
  string,
  { name: string; ageRange: string }
> = {
  "cyber-heroes": { name: "Cyber Heroes", ageRange: "6–9" },
  cyberexplorers: { name: "Cyber Explorers", ageRange: "10–13" },
  cyberstart: { name: "Cyber Academy", ageRange: "14–17" },
  "cyberstart-pro": { name: "Cyber Pro", ageRange: "18+" },
};

/* Per-track character art. Only the LIVE Cyber Heroes track has a
 * dedicated animated cast (Adam + Layla) — they replace the emoji on
 * the card to signal the story-led, animated format. Other tracks
 * omit this and keep their abstract emoji identifier. */
const TRACK_CHARACTER_IMAGES: Record<string, string> = {
  "cyber-heroes": "/characters/adam-layla-happy.png",
  /* v3 card art: sunny, kid-friendly ARC command room (kid in a hoodie
   * at a holo-desk, daylight + colorful screens) — v2's dark-silhouette
   * scene read too scary for 10–13 per owner review. */
  cyberexplorers: "/explorers/scenes/explorers-card-v3.jpg",
};

/* Feature tag shown with the art (TrackCard defaults to the Heroes
 * cast line when omitted). */
const TRACK_KICKERS: Record<string, string> = {
  "cyber-heroes": "Animation-led · Adam & Layla",
  cyberexplorers: "Story-driven · Agent WREN vs SIREN",
};

/* Display-layer status + weeks overrides, same rationale as
 * TRACK_DISPLAY_OVERRIDES: Cyber Explorers is LIVE in the product
 * (missions ship at /explorers) but the DB catalogue row still says
 * COMING_SOON pending the checkout flip — the browse card shouldn't
 * under-sell a live course. */
const TRACK_STATUS_OVERRIDES: Record<string, "ACTIVE" | "COMING_SOON"> = {
  cyberexplorers: "ACTIVE",
};
const TRACK_WEEKS_OVERRIDES: Record<string, number> = {
  cyberexplorers: 20,
};

/* Per-track accent — borrowed from the homepage SubjectShowcase
 * cybersecurity stream's green so the subject reads consistently
 * across the site, then walks up the spectrum to violet for the
 * eldest track. The age-range itself does the heavy lifting; accent
 * is the supporting cue. */
const TRACK_ACCENTS: Record<string, string> = {
  "cyber-heroes": "#5fffa3",
  cyberexplorers: "#7df0ff",
  cyberstart: "#a667ff",
  "cyberstart-pro": "#ff7a3d",
};

export const metadata: Metadata = {
  title: "Cybersecurity. Tracks for Every Age, 6 to 18+ | AlgorithmX",
  description:
    "Four cybersecurity tracks covering ages 6 to 18+. From spotting scams as a child to portfolio-grade pen-testing as a college applicant. Pick by your child's age.",
  alternates: { canonical: "https://www.algorithmx.co.uk/cybersecurity" },
  openGraph: {
    title: "Cybersecurity for every age | AlgorithmX",
    description:
      "Four cybersecurity tracks. Ages 6 to 18+. One subject, every stage.",
    url: "https://www.algorithmx.co.uk/cybersecurity",
    siteName: "AlgorithmX",
    type: "website",
  },
};

/* Pence → "£99" / "£189.50". Strips the trailing ".00" for the
 * common round-pound case. Mirrors hub/page.tsx's helper so the price
 * formatting reads identically across the family browse surfaces. */
function formatPrice(pence: number): string {
  const pounds = pence / 100;
  return pounds % 1 === 0
    ? `£${pounds.toFixed(0)}`
    : `£${pounds.toFixed(2)}`;
}

export default async function CybersecurityPage() {
  /* Real DB fetch — emoji, ageRange, duration, priceGBP, weeksCount,
   * status all come from the catalogue. The seed order
   * (cyber-heroes → … → cyberstart-pro) maps to ascending ageMin so
   * ordering by ageMin gives the age-progression layout the page is
   * built around. */
  const products = await prisma.product.findMany({
    where: { slug: { in: CYBER_TRACK_SLUGS as unknown as string[] } },
    orderBy: { ageMin: "asc" },
  });

  /* Optional "great fit for {child}" highlight. Public page — auth can
   * be null and the page still works. When signed in, find every
   * (child, track) pair whose age falls in the track band and pass the
   * matching child names down to the card. We pick the FIRST track a
   * child fits (lower band on overlap) so a child whose age sits at
   * the boundary (e.g. 16 → both cyberstart and cyberstart-pro) is
   * suggested the track they're already in the middle of rather than
   * the one they're at the bottom of. */
  const session = await auth();
  const childFits: Record<string, string[]> = {};
  if (session?.user?.id) {
    const children = await prisma.childProfile.findMany({
      where: { userId: session.user.id },
      select: { name: true, dateOfBirth: true },
    });
    for (const child of children) {
      const age = getAge(child.dateOfBirth);
      for (const p of products) {
        if (age >= p.ageMin && age <= p.ageMax) {
          if (!childFits[p.slug]) childFits[p.slug] = [];
          childFits[p.slug].push(child.name);
          break;
        }
      }
    }
  }

  return (
    <>
      <GlobalBackdrop />
      <Nav />
      <main
        style={{
          position: "relative",
          color: "var(--lv2-paper)",
          minHeight: "100vh",
        }}
      >
        {/* HERO ────────────────────────────────────────────── */}
        <section
          style={{
            position: "relative",
            padding:
              "calc(var(--lv2-rail) * 4.0) var(--lv2-rail) calc(var(--lv2-rail) * 1.4)",
            maxWidth: 1180,
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <FadeUp>
            <p
              style={{
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "rgba(232,237,255,0.55)",
                marginBottom: 18,
              }}
            >
              // CYBERSECURITY · 4 TRACKS · AGES 6 → 18+
            </p>
          </FadeUp>

          <FadeUp delay={0.06}>
            <h1
              style={{
                fontFamily: "var(--lv2-font-display)",
                fontSize: "clamp(2.4rem, 5.2vw, 4.4rem)",
                lineHeight: 1.02,
                letterSpacing: "-0.028em",
                fontWeight: 400,
                margin: "0 auto",
                maxWidth: 900,
                color: "var(--lv2-paper)",
              }}
            >
              Cybersecurity for every age.
            </h1>
          </FadeUp>

          <FadeUp delay={0.12}>
            <p
              style={{
                fontFamily: "var(--lv2-font-display)",
                fontSize: "clamp(1rem, 1.25vw, 1.125rem)",
                lineHeight: 1.6,
                color: "rgba(232,237,255,0.78)",
                marginTop: 22,
                marginBottom: 0,
                maxWidth: 640,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              From spotting scams at age 6 to portfolio-grade pen-testing as a
              college applicant. Four tracks, one subject, one continuous arc.
              Pick the one that fits your child today.
            </p>
          </FadeUp>

          <FadeUp delay={0.2}>
            <div
              style={{
                marginTop: 28,
                display: "inline-flex",
                gap: 18,
                flexWrap: "wrap",
                justifyContent: "center",
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "rgba(232,237,255,0.55)",
              }}
            >
              <span>Ages 6 → 18+</span>
              <span aria-hidden style={{ opacity: 0.4 }}>·</span>
              <span>4 tracks</span>
              <span aria-hidden style={{ opacity: 0.4 }}>·</span>
              <span>one continuous journey</span>
            </div>
          </FadeUp>
        </section>

        {/* TRACK GRID ──────────────────────────────────────── */}
        <section
          aria-label="Cybersecurity tracks"
          style={{
            position: "relative",
            padding:
              "calc(var(--lv2-rail) * 1.2) var(--lv2-rail) calc(var(--lv2-rail) * 3)",
            maxWidth: 1180,
            margin: "0 auto",
          }}
        >
          <div className="lv2-cyber-tracks-grid">
            {products.map((p, i) => {
              /* landingRouteFor returns null for products without a
               * landing page, but all four cyber tracks DO have one
               * (verified at the top of courseLandings.ts). Fall back
               * to /hub if a future schema change ever breaks this so
               * we never render a dead href. */
              const landingHref = landingRouteFor(p.slug) ?? "/hub";
              const accent = TRACK_ACCENTS[p.slug] ?? "#5fffa3";
              const blurb =
                TRACK_BLURBS[p.slug] ??
                "Hands-on cybersecurity at the right level for this age.";
              const displayOverride = TRACK_DISPLAY_OVERRIDES[p.slug];
              const characterImage = TRACK_CHARACTER_IMAGES[p.slug];
              return (
                <TrackCard
                  key={p.slug}
                  slug={p.slug}
                  emoji={p.emoji}
                  name={displayOverride?.name ?? p.name}
                  ageRange={displayOverride?.ageRange ?? p.ageRange}
                  duration={p.duration}
                  priceLabel={formatPrice(p.priceGBP)}
                  weeksCount={TRACK_WEEKS_OVERRIDES[p.slug] ?? p.weeksCount}
                  status={TRACK_STATUS_OVERRIDES[p.slug] ?? (p.status as "ACTIVE" | "COMING_SOON")}
                  blurb={blurb}
                  landingHref={landingHref}
                  fitForChildren={childFits[p.slug] ?? []}
                  accent={accent}
                  index={i}
                  characterImage={characterImage}
                  kicker={TRACK_KICKERS[p.slug]}
                  imageFilter={p.slug === "cyberexplorers" ? "saturate(1.1)" : undefined}
                  imageOpacity={p.slug === "cyberexplorers" ? 0.6 : undefined}
                />
              );
            })}
          </div>

          {/* Subtle reassurance under the grid */}
          <FadeUp delay={0.4}>
            <p
              style={{
                marginTop: 48,
                textAlign: "center",
                fontFamily: "var(--lv2-font-display)",
                fontSize: 14,
                lineHeight: 1.6,
                color: "rgba(232,237,255,0.55)",
                maxWidth: 560,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              One-time payment per track, lifetime access. No subscriptions.{" "}
              <Link
                href="/hub"
                style={{
                  color: "var(--lv2-cyan-soft)",
                  textDecoration: "underline",
                  textDecorationThickness: 1,
                  textUnderlineOffset: 3,
                }}
              >
                Already enrolled? Go to your hub
              </Link>
              .
            </p>
          </FadeUp>

        </section>
      </main>

      <Footer />

      <style>{`
        .lv2-cyber-tracks-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 34px;
        }
        @media (max-width: 820px) {
          .lv2-cyber-tracks-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
