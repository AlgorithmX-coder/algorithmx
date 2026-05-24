import HeroCinematic from "@/app/components/landing-v2/HeroCinematic";
import Nav from "@/app/components/landing-v2/Nav";
import ProblemStats from "@/app/components/landing-v2/ProblemStats";
import ChooseYourPath from "@/app/components/landing-v2/ChooseYourPath";
import SubjectShowcase from "@/app/components/landing-v2/SubjectShowcase";
import HowItWorks from "@/app/components/landing-v2/HowItWorks";
import AgeProgression from "@/app/components/landing-v2/AgeProgression";
import ProjectShowcase from "@/app/components/landing-v2/ProjectShowcase";
import ParentTrust from "@/app/components/landing-v2/ParentTrust";
import Testimonials from "@/app/components/landing-v2/Testimonials";
import FAQ from "@/app/components/landing-v2/FAQ";
import FinalCTA from "@/app/components/landing-v2/FinalCTA";
import Footer from "@/app/components/landing-v2/Footer";
import Algo from "@/app/components/landing-v2/Algo";
import SmoothScroll from "@/app/components/SmoothScroll";
import SpotlightCursor from "@/app/components/landing-v2/SpotlightCursor";
import GlobalBackdrop from "@/app/components/landing-v2/GlobalBackdrop";

/**
 * /landing-v2 - full preview of the cinematic landing redesign.
 *
 * Mirrors every section of the production homepage but restyled for the
 * sci-fi dark theme that the HeroCinematic chip establishes:
 *
 *   1. Top nav (sticky, glassmorphic dark)
 *   2. HeroCinematic - scroll-pinned 3D AX-1 chip + headline
 *   3. ProblemStats - 3 stat cards
 *   4. SubjectShowcase - 6 subject tabs + course cards
 *   5. HowItWorks - 4-step process line
 *   6. Testimonials + trust logos marquee
 *   7. FinalCTA - rotating-gradient ring around primary CTA
 *   8. Footer - 4-col dark
 *
 * Wrapped in SmoothScroll (Lenis) so wheel events advance scroll smoothly
 * and the 3D scroll-tied animations glide.
 */

export default function LandingV2() {
  return (
    <SmoothScroll>
      <GlobalBackdrop />
      <SpotlightCursor />
      <Nav />
      <main>
        <HeroCinematic />
        <ChooseYourPath />
        <ProblemStats />
        <SubjectShowcase />
        <HowItWorks />
        <AgeProgression />
        <ProjectShowcase />
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
