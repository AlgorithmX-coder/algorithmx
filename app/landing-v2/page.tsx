import HeroCinematic from "@/app/components/landing-v2/HeroCinematicV3";
import Nav from "@/app/components/landing-v2/Nav";
import ProblemStats from "@/app/components/landing-v2/ProblemStats";
import SubjectShowcase from "@/app/components/landing-v2/SubjectShowcase";
import ParentTrust from "@/app/components/landing-v2/ParentTrust";
import Testimonials from "@/app/components/landing-v2/Testimonials";
import FAQ from "@/app/components/landing-v2/FAQ";
import FinalCTA from "@/app/components/landing-v2/FinalCTA";
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
 *   3. ProblemStats - 3 stat cards
 *   4. SubjectShowcase - 6 subject tabs + course cards
 *   5. ParentTrust - safety + safeguarding messaging
 *   6. Testimonials + trust logos marquee
 *   7. FAQ
 *   8. FinalCTA - rotating-gradient ring around primary CTA
 *   9. Footer - 4-col dark
 *
 * Previous batches removed four sections: "Who is this for?", "One
 * platform, four stages of growth", "What you'll actually build", and
 * "HowItWorks" (owner call 2026-07-26; component kept on disk).
 *
 * Wrapped in SmoothScroll (Lenis) so wheel events advance scroll smoothly
 * and the 3D scroll-tied animations glide.
 */

export default function LandingV2() {
  return (
    <SmoothScroll>
      <CosmicNetworkBackground />
      <ScrollFormObjects />
      <AmbientFutureBackdrop />
      <SpotlightCursor />
      <Nav />
      <main>
        <HeroCinematic />
        <ProblemStats />
        <SubjectShowcase />
        <ParentTrust />
        <Testimonials />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
      <Algo />
    </SmoothScroll>
  );
}
