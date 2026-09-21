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
