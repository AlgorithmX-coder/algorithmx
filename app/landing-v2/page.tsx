import { Fredoka, Chakra_Petch } from "next/font/google";
import HomeHolo from "@/app/components/home-holo/HomeHolo";

/**
 * /landing-v2 - production homepage (re-exported by /).
 *
 * 2026-11-21: the Hologram Deck design replaces the sand laptop cinematic.
 * The owner reviewed ten full-page concepts in the landing lab, picked
 * Hologram Deck (light), iterated locally and asked for it live. Copy,
 * course structure and section order are unchanged from the page it
 * replaces; everything visual is new and lives in app/components/home-holo.
 * The previous composition (HeroCinematicV3, ProofBand, ProblemStats,
 * SubjectShowcase, Testimonials, FAQ, the shared Nav and Footer in sand
 * tone) is kept on disk and in git history.
 */

/* The course lockups on the Cybersecurity track cards are set in each
   course's own face (the same marks the /cybersecurity cards use). Loaded
   here so only this page carries them, unpreloaded because they sit well
   below the fold. */
const fredoka = Fredoka({ variable: "--font-fredoka", weight: ["700"], subsets: ["latin"], display: "swap", preload: false });
const chakra = Chakra_Petch({ variable: "--font-chakra", weight: ["700"], subsets: ["latin"], display: "swap", preload: false });

export default function LandingV2() {
  return (
    <div className={`${fredoka.variable} ${chakra.variable}`} style={{ display: "contents" }}>
      <HomeHolo />
    </div>
  );
}
