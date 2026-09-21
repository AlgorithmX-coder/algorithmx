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
import AmbientFutureBackdrop from "@/app/components/landing-v2/AmbientFutureBackdrop";

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
    <div className={`${fredoka.variable} ${chakra.variable} trial-sand`} style={{ display: "contents" }}>
    {/* WARM SAND TRIAL — throwaway branch, not for merge.
        Option 37 from the lighter backdrops board. The three dark canvases
        are switched off rather than deleted, the ground is painted sand,
        and the components' own palette was swapped mechanically (light
        text to ink at the same alpha, dark panel fills to white). Anything
        that looks half-done here is half-done: a real light page means
        re-colouring the glass, the glows and the 3D machine by hand. */}
    <style>{`
      html, body { background: #f3ede4 !important; }
      .trial-sand ~ * canvas, body > canvas { display: none !important; }
      body::before, body::after { display: none !important; }
      /* the sand ground, with the warm glow low and left as on the board */
      body::after {
        content: "" !important;
        display: block !important;
        position: fixed !important;
        inset: 0 !important;
        z-index: -1 !important;
        background:
          radial-gradient(ellipse 70% 56% at 30% 88%, rgba(230,150,90,0.22), transparent 70%),
          linear-gradient(180deg, #f8f4ec 0%, #f3ede4 100%) !important;
        pointer-events: none !important;
      }
      /* Two artefacts of the mechanical swap, fixed so the trial shows the
         idea rather than my script: the eyebrow kept its pale cyan and
         vanished on sand, and the headline kept the dark halo it wore to
         stand off a night sky. */
      .lv2-hero-eyebrow {
        color: #0a6c8e !important;
        border-color: rgba(10,126,164,0.34) !important;
        background: rgba(10,126,164,0.08) !important;
        text-shadow: none !important;
      }
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
      .trial-sand,
      .trial-sand :is(section, div, nav, header, footer, main) {
        --lv2-cyan: #0a7085;
        --lv2-cyan-soft: #0a7085;
        --lv2-lime: #0e7a45;
        --lv2-cosmic: #5744c9;
        --lv2-text-muted: #5d6472;
        --lv2-ink: #14161d;
      }

      /* Buttons: a bright cyan fill went pale against sand, so the primary
         becomes the deep teal with paper on it. */
      .lv2-nav-cta, .lv2-hero-cta-primary {
        background: #0a7085 !important;
        color: #fffdfa !important;
        box-shadow: 0 10px 26px -14px rgba(10,112,133,0.85) !important;
      }
      .lv2-nav-cta *, .lv2-hero-cta-primary * { color: #fffdfa !important; }

      /* The nav chips were drawn as a cyan hairline on black. */
      .lv2-nav-secondary:not(.lv2-nav-aside) {
        border-color: rgba(20,22,29,0.2) !important;
        background: rgba(10,112,133,0.07) !important;
        color: #22262f !important;
      }
      .lv2-nav-secondary:not(.lv2-nav-aside):hover {
        border-color: rgba(10,112,133,0.55) !important;
        background: rgba(10,112,133,0.14) !important;
      }
      .lv2-nav-aside { color: #8a5a00 !important; text-shadow: none !important; }

      /* The accreditations band is shared with /schools, which stays dark,
         so its light form is scoped to this page rather than edited. */
      .trial-sand .lv2-proof {
        background: linear-gradient(180deg, rgba(255,253,250,0.96), rgba(250,246,240,0.96)) !important;
        border-color: rgba(20,22,29,0.12) !important;
        box-shadow: 0 18px 44px -30px rgba(60,50,38,0.55), inset 0 1px 0 rgba(255,255,255,0.9) !important;
      }
      .trial-sand .lv2-proof-kicker { color: #0a7085 !important; }
      .trial-sand .lv2-proof-name { color: #14161d !important; }
      .trial-sand .lv2-proof-copy { color: #3c4351 !important; }
      /* The NCSC crest is white artwork and may not be recoloured, so its
         plate is the one thing on the page that stays dark. */
      .trial-sand .lv2-proof-plate-dark {
        background: #14161d !important;
        border-color: rgba(20,22,29,0.3) !important;
      }

      /* Small print that was legible on black and is not on sand. */
      .trial-sand [style*="rgba(17, 22, 38, 0.4"],
      .trial-sand [style*="rgba(17,22,38,0.4"] { color: #5d6472 !important; }
      .trial-sand [style*="rgba(17, 22, 38, 0.5"],
      .trial-sand [style*="rgba(17,22,38,0.5"] { color: #4d5462 !important; }
      .trial-sand [style*="rgba(17, 22, 38, 0.58"],
      .trial-sand [style*="rgba(17,22,38,0.58"] { color: #454c5a !important; }

      /* The course lockups are shared with /schools, so they are corrected
         here by their own inline colours rather than edited: the wordmarks
         were paper-white and the marks were neon. */
      .trial-sand [style*="#eaf6ff"] { color: #14161d !important; }
      .trial-sand [style*="color: #ffb347"],
      .trial-sand [style*="color:#ffb347"] { color: #9a5f00 !important; }
      .trial-sand svg[stroke="#22D3EE"] { stroke: #0b7183 !important; filter: none !important; }
      .trial-sand svg[stroke="#ff7a3d"] { stroke: #b8430c !important; filter: none !important; }
      .trial-sand svg[stroke="#8b7bff"] { stroke: #5744c9 !important; filter: none !important; }
      .trial-sand path[fill="#ffb347"] { fill: #9a5f00 !important; }
      .trial-sand path[fill="#22D3EE"], .trial-sand circle[fill="#22D3EE"] { fill: #0b7183 !important; }

      /* The CTA keeps the bright cyan token for its fill, so it is restated
         after the token override above. */
      .lv2-nav-cta, .lv2-hero-cta-primary { background: #0a7085 !important; }

      /* The NCSC crest is white artwork. On a dark page it needed nothing;
         on sand it disappeared entirely, so it gets its own dark plate
         wherever it appears. Recolouring it is not allowed. */
      .trial-sand img[src="/logos/ncsc.svg"] {
        background: #14161d !important;
        padding: 5px 9px !important;
        border-radius: 8px !important;
        box-sizing: content-box !important;
      }

      /* The partner logo wall is a mix of white-only and full-colour marks,
         drawn for a black page. Greyscale at weight is the usual answer on
         a light one, and it stops nine brands fighting each other. */
      .trial-sand .lv2-logo-cell img {
        filter: grayscale(1) brightness(0.42) !important;
        opacity: 0.9 !important;
      }
      .trial-sand .lv2-logo-cell:hover img {
        filter: grayscale(0.15) brightness(0.75) !important;
        opacity: 1 !important;
      }
    `}</style>
    <SmoothScroll>
      {/* <CosmicNetworkBackground /> <ScrollFormObjects /> <AmbientFutureBackdrop /> */}
      <SpotlightCursor />
      <Nav />
      <main>
        <HeroCinematic />
        <ProofBand />
        <ProblemStats />
        <SubjectShowcase />
        <ParentTrust />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </SmoothScroll>
    </div>
  );
}
