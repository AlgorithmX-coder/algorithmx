import { Fredoka, Chakra_Petch } from "next/font/google";

import HeroCinematic from "@/app/components/landing-v2/HeroCinematicV3";
import Nav from "@/app/components/landing-v2/Nav";
import ProofBand from "@/app/components/landing-v2/ProofBand";
import ProblemStats from "@/app/components/landing-v2/ProblemStats";
import SubjectShowcase from "@/app/components/landing-v2/SubjectShowcase";
import ParentTrust from "@/app/components/landing-v2/ParentTrust";
import Testimonials from "@/app/components/landing-v2/Testimonials";
import FAQ from "@/app/components/landing-v2/FAQ";
import Footer from "@/app/components/landing-v2/Footer";
import Algo from "@/app/components/landing-v2/Algo";
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
    <div className={`${fredoka.variable} ${chakra.variable}`} style={{ display: "contents" }}>
    <SmoothScroll>
      <CosmicNetworkBackground />
      <ScrollFormObjects />
      <AmbientFutureBackdrop />
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
      <Algo />
    </SmoothScroll>
    </div>
  );
}
