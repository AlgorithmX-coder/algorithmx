import type { Metadata } from "next";
import { Chakra_Petch, JetBrains_Mono } from "next/font/google";
import OpsHolo from "./holo/OpsHolo";

// Self-hosted via next/font (no Google request at runtime - better for a
// UK product aimed at minors). Chakra Petch is the Ops wordmark and label
// face; JetBrains Mono the design's mono. The display and body faces
// (Space Grotesk, Inter) come from the root layout.
const display = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-chakra",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

/**
 * /ops - the Cyber Ops (14-17 tier) marketing landing.
 *
 * noindex: "Cyber Ops" is a working title pending trademark clearance, so
 * the page ships and is shareable by link but is kept out of search
 * engines. Remove the `robots` block to make it publicly discoverable.
 *
 * All copy is authored and static, so no DB read is needed.
 *
 * 2026-11-22: the Hologram design (landing lab round 4, concept o01, the
 * owner's pick) replaces the dark violet page. Copy, section order, routes
 * and the reel's playback rules are unchanged; everything visual lives in
 * ./holo. The previous composition (CyberStartLanding) is kept on disk.
 */
export const metadata: Metadata = {
  title: "Cyber Ops - AlgorithmX",
  description:
    "The 14-17 tier of AlgorithmX. Get recruited as a junior security operator and do the real work - inside a walled training range where nothing can go wrong.",
  robots: { index: false, follow: false },
};

export default function CyberStartPage() {
  return (
    <div className={`${display.variable} ${mono.variable}`} style={{ display: "contents" }}>
      <OpsHolo />
    </div>
  );
}
