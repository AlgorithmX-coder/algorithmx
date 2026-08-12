import type { Metadata } from "next";
import { Chakra_Petch, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import CyberStartLanding from "./CyberStartLanding";

// Self-hosted via next/font (no Google request at runtime - better for a
// UK product aimed at minors). Exposed as CSS variables the landing maps
// onto its --display / --mono / --sans tokens.
const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-chakra",
  display: "swap",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});
const sans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-plex-sans",
  display: "swap",
});

/**
 * /cyberstart - the Cyber Ops (14-17 tier) marketing landing.
 *
 * noindex: "Cyber Ops" is a working title pending trademark clearance, so
 * the page ships and is shareable by link but is kept out of search
 * engines. Remove the `robots` block to make it publicly discoverable.
 *
 * All copy is authored and static, so no DB read is needed.
 */
export const metadata: Metadata = {
  title: "Cyber Ops - AlgorithmX",
  description:
    "The 14-17 tier of AlgorithmX. Get recruited as a junior security operator and do the real work - inside a walled training range where nothing can go wrong.",
  robots: { index: false, follow: false },
};

export default function CyberStartPage() {
  return (
    <div className={`${display.variable} ${mono.variable} ${sans.variable}`}>
      <CyberStartLanding />
    </div>
  );
}
