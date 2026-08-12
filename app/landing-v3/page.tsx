import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import LandingV3 from "./LandingV3";

// Self-hosted via next/font, exposed as the CSS vars LandingV3 maps onto its
// --disp / --mono / --sans tokens.
const display = Chakra_Petch({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-chakra", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-mono", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-sans", display: "swap" });

/**
 * /landing-v3 - the rebuilt homepage, in progress. noindex while it's a
 * preview; `/` will re-export this once it's approved.
 */
export const metadata: Metadata = {
  title: "AlgorithmX - real cyber security skills, from age 6 to a career",
  robots: { index: false, follow: false },
};

export default function LandingV3Page() {
  return (
    <div className={`${display.variable} ${mono.variable} ${sans.variable}`}>
      <LandingV3 />
    </div>
  );
}
