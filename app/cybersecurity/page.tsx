import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "@/app/lib/prisma";
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
    "A spy thriller they play for real. As an agent of ARC, your child cracks 20 story missions with a voice-acted handler, learning to spot phishing, fake voices and data tricks for life.",
  cyberstart:
    "Real, hands-on security done safely. Recruited as a junior operator, your teen runs weekly engagements in a sealed range (break in, defend, respond) and finishes with a portfolio, not just a certificate.",
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
  cyberstart: { name: "Cyber Ops", ageRange: "14–17" },
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
  /* Operator's-console scene: terminals mid-engagement + the star-fort
   * (Cyber Ops' motif), composed for the card scrim (focal upper-right,
   * dark left for the text). Signals the hands-on, real-tooling format. */
  cyberstart: "/operators/cyberops-card.jpg",
  /* Cyber Pro (18+): the same split-scene treatment as Cyber Ops but in
   * a warm/amber key (matches its orange accent) with career-grade
   * content - a live pen-test to root, a CVSS/STRIDE threat model, and a
   * signed-off remediation report. Signals the professional tier. */
  "cyberstart-pro": "/operators/cyberpro-card.jpg",
};

/* Feature tag shown with the art (TrackCard defaults to the Heroes
 * cast line when omitted). */
const TRACK_KICKERS: Record<string, string> = {
  "cyber-heroes": "Animation-led · Adam & Layla",
  cyberexplorers: "Story-driven · Agent WREN vs SIREN",
  cyberstart: "Hands-on · a live cyber range",
  "cyberstart-pro": "Career-grade · pen-testing",
};

/* Display-layer status + weeks overrides, same rationale as
 * TRACK_DISPLAY_OVERRIDES: Cyber Explorers is LIVE in the product
 * (missions ship at /explorers) but the DB catalogue row still says
 * COMING_SOON pending the checkout flip — the browse card shouldn't
 * under-sell a live course. */
const TRACK_STATUS_OVERRIDES: Record<string, "ACTIVE" | "COMING_SOON"> = {
  cyberexplorers: "ACTIVE",
};
/* Per-track accent. Heroes runs the hub palette's warm amber-orange
 * (kid-energy, matches the hub card's accent) — kept lighter than
 * Cyber Pro's deep orange so the two never read as the same track.
 * The age-range itself does the heavy lifting; accent is the
 * supporting cue. */
const TRACK_ACCENTS: Record<string, string> = {
  "cyber-heroes": "#ffb347",
  cyberexplorers: "#7df0ff",
  cyberstart: "#8b7bff",
  "cyberstart-pro": "#ff7a3d",
};

/* Per-track emoji override (the DB emoji is the fallback). Cyber Ops
 * swaps the generic rocket for a shield so the card reads as
 * security/defence, not a startup launch. */
const TRACK_EMOJI_OVERRIDES: Record<string, string> = {
  cyberstart: "🛡️",
};

/* ── Branded course-name lockups ─────────────────────────────────────
 * The logo system from the track landings' navs (glyph + wordmark in
 * the course's own display font — PR #103), rendered inside each
 * card's title <h3> in place of the plain name. Glyphs are the same
 * marks the landings use, scaled to card size. The "by AlgorithmX"
 * byline is deliberately omitted: these cards already sit under the
 * AlgorithmX site nav, so the byline would be redundant. Fredoka /
 * Chakra Petch are provided by this route's layout.tsx; Explorers'
 * mono is the app-wide Geist Mono. Pro's terminal cursor is static
 * here (the landing blinks) — the browse page stays animation-quiet.
 */
const LOCKUP_ROW: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 9,
  whiteSpace: "nowrap",
};

const TRACK_LOCKUPS: Record<string, React.ReactNode> = {
  "cyber-heroes": (
    <span style={LOCKUP_ROW}>
      <svg
        width="21"
        height="21"
        viewBox="0 0 24 24"
        aria-hidden
        style={{
          transform: "rotate(-7deg)",
          filter: "drop-shadow(0 0 10px rgba(255,179,71,0.4))",
          flexShrink: 0,
        }}
      >
        <path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill="#ffb347" />
        <path d="M13.2 6 L8.6 13 H11.4 L10.6 18 L15.6 11 H12.6 Z" fill="#08101f" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-fredoka), system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "1.3rem",
          letterSpacing: "0.02em",
          color: "#eaf6ff",
        }}
      >
        CYBER <span style={{ color: "#ffb347" }}>HEROES</span>
      </span>
    </span>
  ),
  cyberexplorers: (
    <span style={LOCKUP_ROW}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#22D3EE"
        strokeWidth="1.8"
        aria-hidden
        style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.35))", flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="6.4" />
        <path d="M12 2.6 V6 M12 18 V21.4 M2.6 12 H6 M18 12 H21.4" />
        <circle cx="12" cy="12" r="1.6" fill="#22D3EE" stroke="none" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
          fontWeight: 600,
          fontSize: "1.1rem",
          letterSpacing: "0.12em",
          color: "#eaf6ff",
        }}
      >
        CYBER EXPLORERS
      </span>
    </span>
  ),
  cyberstart: (
    <span style={LOCKUP_ROW}>
      <span
        aria-hidden
        style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: "#8B7BFF",
          boxShadow: "0 0 14px rgba(139,123,255,0.35)",
          flexShrink: 0,
        }}
      />
      <span
        style={{
          fontFamily: "var(--font-chakra), ui-sans-serif, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "1.2rem",
          letterSpacing: "0.16em",
          color: "#eaf6ff",
        }}
      >
        CYBER OPS
      </span>
    </span>
  ),
  "cyberstart-pro": (
    <span style={LOCKUP_ROW}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#ff7a3d"
        strokeWidth="2"
        aria-hidden
        style={{ filter: "drop-shadow(0 0 9px rgba(255,122,61,0.35))", flexShrink: 0 }}
      >
        <path d="M4 4 H14.5 L20 9.5 V20 H4 Z" strokeLinejoin="round" />
        <path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 15.5 H16.2" strokeLinecap="round" />
      </svg>
      <span
        style={{
          fontFamily: "var(--font-chakra), ui-sans-serif, system-ui, sans-serif",
          fontWeight: 700,
          fontSize: "1.2rem",
          letterSpacing: "0.07em",
          color: "#eaf6ff",
        }}
      >
        CYBER PRO
      </span>
    </span>
  ),
};

/* Per-track art-layer tuning for the three cards that carry a scene.
 *
 * Cyber Explorers is a bright daylight photo: a light scrim keeps it
 * bright, a focal crop settles the subject centre-right, ~full opacity.
 *
 * Cyber Ops (14-17) and Cyber Pro (18+) share the same split-scene
 * treatment - Pro is the warm/amber sibling (matching its orange accent)
 * with career-grade content (a live pen-test to root, a CVSS/STRIDE
 * threat model, a remediation report). Both use opacity 1 / centre /
 * split scrim / a capped left text column, described below for Ops.
 *
 * Cyber Ops is the operator-console art, composed as a deliberate split
 * — a dark left half (the copy sits here) and a bright, code-dense right
 * half (terminal + HTTP + a fix diff). Shown near-full and centred so
 * the split maps across the card; the "split" scrim only firms up the
 * left column (it clears by ~66% so the bright right stays bright); and
 * the copy is capped to a left column (contentMaxWidth) so it never runs
 * over the code. This is what keeps it bright AND readable at once. */
const TRACK_IMAGE_FILTER: Record<string, string> = {
  cyberexplorers: "saturate(1.12) brightness(1.05)",
  cyberstart: "saturate(1.06) brightness(1.03)",
  "cyberstart-pro": "saturate(1.08) brightness(1.03)",
};
const TRACK_IMAGE_OPACITY: Record<string, number> = {
  cyberexplorers: 0.95,
  cyberstart: 1,
  "cyberstart-pro": 1,
};
const TRACK_IMAGE_POSITION: Record<string, string> = {
  cyberexplorers: "62% 38%",
  cyberstart: "center",
  "cyberstart-pro": "center",
};
const TRACK_SCRIM: Record<string, "default" | "light" | "split"> = {
  cyberexplorers: "light",
  cyberstart: "split",
  "cyberstart-pro": "split",
};
const TRACK_CONTENT_MAX_WIDTH: Record<string, number> = {
  cyberstart: 265,
  "cyberstart-pro": 265,
};

export const metadata: Metadata = {
  title: "Cybersecurity. Tracks for Every Age, 6 to 18+ | AlgorithmX",
  description:
    "Four cybersecurity tracks covering ages 6 to 18+. From spotting scams as a child to portfolio-grade pen-testing as an adult. For your child's journey, or your own.",
  alternates: { canonical: "https://algorithmx.io/cybersecurity" },
  openGraph: {
    title: "Cybersecurity for every age | AlgorithmX",
    description:
      "Four cybersecurity tracks. Ages 6 to 18+. One subject, every stage.",
    url: "https://algorithmx.io/cybersecurity",
    siteName: "AlgorithmX",
    type: "website",
  },
};

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

  /* The "great fit for {child}" personalisation was REMOVED 2026-07-18
   * at the owner's request — no child names are shown on the cards for
   * anyone. (The bright accent age chips carry the "which track is for
   * my child" job now.) */

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
          {/* Escape hatch back to the homepage (owner request): the
           *  shared Nav's brand mark links home but doesn't read as
           *  navigation, so visitors landing here directly had no
           *  obvious way out. Same treatment as the auth pages. */}
          <FadeUp>
            <div style={{ textAlign: "left", marginBottom: 30 }}>
              <Link
                href="/"
                className="transition hover:opacity-80"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 11.5,
                  fontWeight: 700,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "var(--lv2-cyan-soft)",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span aria-hidden>←</span> Back to home
              </Link>
            </div>
          </FadeUp>

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
              From spotting scams at age 6 to portfolio-grade pen-testing at
              18+. Four tracks, one subject, one continuous arc. Start your
              child&rsquo;s journey, or your own.
            </p>
          </FadeUp>

          {/* Aligned with the NCSC (alignment, not endorsement — the NCSC
              runs no endorsement scheme). One trust mark across all four
              cybersecurity tracks. */}
          <FadeUp delay={0.18}>
            <div style={{ display: "flex", justifyContent: "center", marginTop: 32 }}>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 14,
                padding: "10px 20px", borderRadius: 999,
                background: "rgba(13,15,24,0.55)",
                border: "1px solid rgba(159,245,255,0.28)",
                boxShadow: "0 0 30px -16px rgba(159,245,255,0.9)",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}>
                <span style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 10.5, fontWeight: 700, letterSpacing: "0.24em",
                  textTransform: "uppercase", color: "var(--lv2-cyan-soft)",
                }}>
                  Aligned with
                </span>
                <span aria-hidden style={{ width: 1, height: 22, background: "rgba(232,237,255,0.18)" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/ncsc.svg" alt="National Cyber Security Centre" loading="lazy" style={{ height: 30, width: "auto" }} />
              </span>
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
                  emoji={TRACK_EMOJI_OVERRIDES[p.slug] ?? p.emoji}
                  name={displayOverride?.name ?? p.name}
                  ageRange={displayOverride?.ageRange ?? p.ageRange}
                  status={TRACK_STATUS_OVERRIDES[p.slug] ?? (p.status as "ACTIVE" | "COMING_SOON")}
                  blurb={blurb}
                  landingHref={landingHref}
                  accent={accent}
                  index={i}
                  characterImage={characterImage}
                  kicker={TRACK_KICKERS[p.slug]}
                  lockup={TRACK_LOCKUPS[p.slug]}
                  imageFilter={TRACK_IMAGE_FILTER[p.slug]}
                  imageOpacity={TRACK_IMAGE_OPACITY[p.slug]}
                  imagePosition={TRACK_IMAGE_POSITION[p.slug]}
                  scrim={TRACK_SCRIM[p.slug]}
                  contentMaxWidth={TRACK_CONTENT_MAX_WIDTH[p.slug]}
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
