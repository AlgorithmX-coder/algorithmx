import HomeHolo from "@/app/components/home-holo/HomeHolo";

/**
 * /landing-v2 - production homepage (re-exported by /).
 *
 * 2026-11-21: the Hologram Deck design replaces the sand laptop cinematic.
 * The owner reviewed ten full-page concepts in the landing lab, picked
 * Hologram Deck (light), iterated three rounds locally and asked for it
 * live. Copy, course structure and section order are unchanged from the
 * page it replaces; everything visual is new and lives in
 * app/components/home-holo. The previous composition (HeroCinematicV3,
 * ProofBand, ProblemStats, SubjectShowcase, Testimonials, FAQ, the shared
 * Nav and Footer in sand tone) is kept on disk and in git history.
 */
export default function LandingV2() {
  return <HomeHolo />;
}
