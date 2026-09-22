import { Fredoka, Chakra_Petch } from "next/font/google";

import HeroCinematic from "@/app/components/landing-v2/HeroCinematicV3";
import Nav from "@/app/components/landing-v2/Nav";
import ProofBand from "@/app/components/ProofBand";
import ProblemStats from "@/app/components/landing-v2/ProblemStats";
import SubjectShowcase from "@/app/components/landing-v2/SubjectShowcase";
import ParentTrust from "@/app/components/landing-v2/ParentTrust";
import Testimonials from "@/app/components/landing-v2/Testimonials";
import FAQ from "@/app/components/landing-v2/FAQ";
import Footer from "@/app/components/landing-v2/Footer";
import SmoothScroll from "@/app/components/SmoothScroll";
import SpotlightCursor from "@/app/components/landing-v2/SpotlightCursor";
import CosmicNetworkBackground from "@/app/components/backgrounds/CosmicNetworkBackground";
import ScrollFormObjects from "@/app/components/backgrounds/ScrollFormObjects";

/**
 * /landing-v2 - production homepage (re-exported by /).
 *
 * Sections, in scroll order:
 *
 *   1. Top nav (sticky, glassmorphic dark)
 *   2. HeroCinematic - scroll-pinned 3D laptop scene + headline
 *   3. ProofBand - the four accreditations, one line of copy each
 *   4. ProblemStats - 3 stat cards
 *   5. SubjectShowcase - 6 subject tabs + course cards
 *   6. ParentTrust - safety + safeguarding messaging
 *   7. Testimonials + trust logos marquee
 *   8. FAQ
 *   9. Footer - 4-col dark
 *
 * Previous batches removed four sections: "Who is this for?", "One
 * platform, four stages of growth", "What you'll actually build", and
 * "HowItWorks" (owner call 2026-07-26; component kept on disk).
 *
 * The ALGO pill (bottom right, "standing by") removed 2026-09-20 on
 * the owner's call, along with the hero's chapter counter. Algo.tsx is
 * kept on disk.
 *
 * "Ready to start?" (FinalCTA) removed 2026-09-20 on the owner's call.
 * The page now ends on the FAQ, and the only standing calls to action
 * are the nav's Get started and the per-stream View course buttons.
 * FinalCTA.tsx is kept on disk like the others.
 *
 * Wrapped in SmoothScroll (Lenis) so wheel events advance scroll smoothly
 * and the 3D scroll-tied animations glide.
 */

/* The course lockups inside the Cybersecurity card are set in each course's
   own face. Loaded here rather than in the root layout so only this page
   carries them, and unpreloaded because they sit well below the fold and
   must not compete with the hero. */
const fredoka = Fredoka({ variable: "--font-fredoka", weight: ["700"], subsets: ["latin"], display: "swap", preload: false });
const chakra = Chakra_Petch({ variable: "--font-chakra", weight: ["700"], subsets: ["latin"], display: "swap", preload: false });

export default function LandingV2() {
  return (
    <div className={`${fredoka.variable} ${chakra.variable} lv2-sand`} style={{ display: "contents" }}>
    {/* WARM SAND — the light homepage. Option 37 from the lighter
        backdrops board, shipped 2026-09-22 after an owner review round.

        Three surfaces carry the whole page: ground #f3ede4 (L* 94), raised
        #fffdf8 (99.3), recessed #e8dfd0 (89.2), with live things raised and
        locked things recessed. The neon accents kept their hue and came
        down until each cleared 4.5:1 on the ground.

        Shared components take a tone prop rather than being repainted,
        because /cybersecurity uses the same nav, footer and galaxy and has
        to stay dark: night is the default everywhere and a light page has
        to ask. The CSS below is what is genuinely page-scoped, and the
        laptop is recoloured rather than re-lit, which is the remaining
        debt if this ever becomes a real theme rather than one page. */}
    <style>{`
      /* The ground goes on html, not body. Both backdrops sit at
         z-index -1, and a background on body paints in front of them: it
         was hiding the galaxy and the typing IDE completely. */
      html { background: #f3ede4 !important; }
      body { background: transparent !important; }
      /* the galaxy bloom layers screen on black and must multiply on paper */
      :root { --cnb-blend: multiply; }
      /* The galaxy canvas paints the sand ground itself now, so the
         stand-in layer is gone: it shared z-index -1 with the backdrops and
         was painting over both of them. */
      body::before { display: none !important; }

      /* The hero eyebrow takes the shared section mark now (an inline
         style), and these !important rules were beating it back to the old
         outline pill. */
      .lv2-hero-copy h1, .lv2-hero-copy p { text-shadow: none !important; }
      /* The scrim exists so the headline reads against a sunset sky. Its
         own comment warns it would otherwise be a black smudge behind the
         headline, which is exactly what it becomes on sand. */
      .lv2-hero-scrim { display: none !important; }

      /* ---- the sand palette ----
         Measured against the ground, every value below at 4.5:1 or better
         for body text and 3:1 for large. The neon accents were kept at the
         same hue and taken down until they cleared the line: cyan 00e5ff
         to 0a7085, green 3ee88f to 0e7a45, amber ffc94a to 8a5a00, orange
         ff7a3d to b8430c, violet 8b7bff to 5744c9, pink ff3ad6 to a5117f. */
      .lv2-sand,
      .lv2-sand :is(section, div, nav, header, footer, main) {
        --lv2-cyan: #0a7085;
        --lv2-cyan-soft: #0a7085;
        --lv2-lime: #0e7a45;
        --lv2-cosmic: #5744c9;
        --lv2-text-muted: #5d6472;
        --lv2-ink: #14161d;
      }

      /* Buttons: a bright cyan fill went pale against sand, so the primary
         becomes the deep teal with paper on it. The nav's CTA is the nav's
         own business now (see Nav.tsx's sand tone), so that /schools
         inherits it too; this is the hero's. */
      .lv2-hero-cta-primary {
        background: #0a7085 !important;
        color: #fffdfa !important;
        box-shadow: 0 10px 26px -14px rgba(10,112,133,0.85) !important;
      }
      .lv2-hero-cta-primary * { color: #fffdfa !important; }

      /* Glow, for paper. A halo works on black by adding light; sand has no
         darkness to bloom into, so the same idea becomes a saturated colour
         cast under the element and a lit inner edge above it. */
      .lv2-hero-cta-primary {
        box-shadow:
          0 14px 34px -12px rgba(10,112,133,0.75),
          0 0 0 1px rgba(10,112,133,0.25),
          inset 0 1px 0 rgba(255,255,255,0.45) !important;
      }
      .lv2-hero-cta-primary:hover {
        box-shadow:
          0 18px 42px -12px rgba(10,112,133,0.9),
          0 0 0 1px rgba(10,112,133,0.4),
          inset 0 1px 0 rgba(255,255,255,0.55) !important;
      }

      /* The nav chips are the nav component's business now: it takes a
         tone, and these page-scoped rules were fighting it. */
      .lv2-nav-aside { color: #8a5a00 !important; text-shadow: none !important; }

      /* The accreditations band is shared with /schools, which stays dark,
         so its light form is scoped to this page rather than edited. */
      .lv2-sand .lv2-proof {
        background: linear-gradient(180deg, rgba(255,253,250,0.96), rgba(250,246,240,0.96)) !important;
        border-color: rgba(20,22,29,0.12) !important;
        box-shadow: 0 18px 44px -30px rgba(60,50,38,0.55), inset 0 1px 0 rgba(255,255,255,0.9) !important;
      }
      .lv2-sand .lv2-proof-kicker { color: #0a7085 !important; }
      .lv2-sand .lv2-proof-name { color: #14161d !important; }
      .lv2-sand .lv2-proof-copy { color: #3c4351 !important; }
      /* The NCSC crest is white artwork and may not be recoloured, so its
         plate is the one thing on the page that stays dark. */
      .lv2-sand .lv2-proof-plate-dark {
        background: #14161d !important;
        border-color: rgba(20,22,29,0.3) !important;
      }

      /* Small print that was legible on black and is not on sand. */
      .lv2-sand [style*="rgba(17, 22, 38, 0.4"],
      .lv2-sand [style*="rgba(17,22,38,0.4"] { color: #5d6472 !important; }
      .lv2-sand [style*="rgba(17, 22, 38, 0.5"],
      .lv2-sand [style*="rgba(17,22,38,0.5"] { color: #4d5462 !important; }
      .lv2-sand [style*="rgba(17, 22, 38, 0.58"],
      .lv2-sand [style*="rgba(17,22,38,0.58"] { color: #454c5a !important; }

      /* The course lockups are shared with /schools, so they are corrected
         here by their own inline colours rather than edited: the wordmarks
         were paper-white and the marks were neon. */
      .lv2-sand [style*="#eaf6ff"] { color: #14161d !important; }
      .lv2-sand [style*="color: #ffb347"],
      .lv2-sand [style*="color:#ffb347"] { color: #9a5f00 !important; }
      .lv2-sand svg[stroke="#22D3EE"] { stroke: #0a6675 !important; filter: none !important; }
      .lv2-sand svg[stroke="#ff7a3d"] { stroke: #a63a08 !important; filter: none !important; }
      .lv2-sand svg[stroke="#8b7bff"] { stroke: #5744c9 !important; filter: none !important; }
      .lv2-sand path[fill="#ffb347"] { fill: #9a5f00 !important; }
      .lv2-sand path[fill="#22D3EE"], .lv2-sand circle[fill="#22D3EE"] { fill: #0a6675 !important; }

      /* The hero CTA keeps the bright cyan token for its fill, so it is
         restated after the token override above. */
      .lv2-hero-cta-primary { background: #0a7085 !important; }

      /* The NCSC crest is white artwork. On a dark page it needed nothing;
         on sand it disappeared entirely, so it gets its own dark plate
         wherever it appears. Recolouring it is not allowed. */
      .lv2-sand img[src="/logos/ncsc.svg"] {
        background: #14161d !important;
        padding: 5px 9px !important;
        border-radius: 8px !important;
        box-sizing: content-box !important;
      }

      /* The partner logo wall is a mix of white-only and full-colour marks,
         drawn for a black page. Greyscale at weight is the usual answer on
         a light one, and it stops nine brands fighting each other. */
      /* Owner asked for colour on the partner wall. Nine of the eleven
         marks are already full brand colour in the file; only Apple and
         Unity are drawn as white-only artwork, which is invisible on
         paper. Those two render black, which is the presentation their
         own guidelines give for a light ground. */
      .lv2-sand .lv2-logo-cell img {
        filter: none !important;
        opacity: 1 !important;
      }
      .lv2-sand .lv2-logo-cell img[src*="apple"],
      .lv2-sand .lv2-logo-cell img[src*="unity"] {
        filter: brightness(0) !important;
        opacity: 0.88 !important;
      }
      .lv2-sand .lv2-logo-cell:hover img { opacity: 1 !important; }
    `}</style>
    <SmoothScroll>
      {/* The galaxy and the typing IDE run in sand tone: the same
          formation, built out of ink on paper instead of light on black.
          AmbientFutureBackdrop is gone from this page; it is a night scene
          with no light equivalent. The component is kept on disk. */}
      <CosmicNetworkBackground tone="sand" />
      <ScrollFormObjects tone="sand" />
      <SpotlightCursor />
      <Nav tone="sand" />
      <main>
        <HeroCinematic />
        <ProofBand />
        <ProblemStats />
        <SubjectShowcase />
        <ParentTrust />
        <Testimonials />
        <FAQ />
      </main>
      <Footer tone="sand" />
    </SmoothScroll>
    </div>
  );
}
