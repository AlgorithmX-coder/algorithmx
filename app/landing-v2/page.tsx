import HeroCinematic from "@/app/components/landing-v2/HeroCinematic";
import Nav from "@/app/components/landing-v2/Nav";
import ProblemStats from "@/app/components/landing-v2/ProblemStats";
import SubjectShowcase from "@/app/components/landing-v2/SubjectShowcase";
import HowItWorks from "@/app/components/landing-v2/HowItWorks";
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
 *   5. HowItWorks - 5-step process line (incl. qualification step)
 *   6. ParentTrust - safety + safeguarding messaging
 *   7. Testimonials + trust logos marquee
 *   8. FAQ
 *   9. FinalCTA - rotating-gradient ring around primary CTA
 *  10. Footer - 4-col dark
 *
 * Previous batch removed three sections: "Who is this for?", "One
 * platform, four stages of growth", and "What you'll actually build".
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
        <HowItWorks />
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
