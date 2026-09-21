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
        Option 37 from the lighter backdrops board. The page palette was
        repainted against a measured sand ground; the galaxy and the typing
        IDE run in their sand tone; AmbientFutureBackdrop stays off because
        it is a night scene with no light equivalent. What is page-scoped
        here rather than fixed properly is the work between a trial and a
        real light theme: shared components corrected by CSS instead of a
        tone prop, and a machine recoloured rather than re-lit. */}
    <style>{`
      html, body { background: #f3ede4 !important; }
      /* the galaxy bloom layers screen on black and must multiply on paper */
      :root { --cnb-blend: multiply; }
      /* The galaxy canvas paints the sand ground itself now, so the
         stand-in layer is gone: it shared z-index -1 with the backdrops and
         was painting over both of them. */
      body::before { display: none !important; }
    `}</style>
    <SmoothScroll>
      {/* The galaxy and the typing IDE come back in sand tone: the same
          formation, built out of ink on paper instead of light on black.
          AmbientFutureBackdrop stays off; it is a night scene with no
          light equivalent. */}
      <CosmicNetworkBackground tone="sand" />
      <ScrollFormObjects tone="sand" />
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
