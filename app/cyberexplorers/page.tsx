import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import ExplorersHolo from "@/app/components/explorers-holo/ExplorersHolo";

/**
 * /cyberexplorers — product page for the ages 10–13 tier ("Signal
 * Room"). Server wrapper for SEO metadata; the page itself is a client
 * component. Replaced the pre-design-session landing (12 weeks / ages 11–14
 * / code-rain) on 2026-07-12 — canon lives in
 * docs/explorers/algorithmx-explorers-art-direction.md.
 *
 * 2026-11-22: the Hologram design (landing lab round 4, concept e01, the
 * owner's pick) replaces the dark teal page. Copy, sections, order, every
 * href and the hero trailer's behaviour are unchanged; everything visual
 * lives in app/components/explorers-holo. The previous composition
 * (CyberExplorersLanding, IntroVideo, LiveBackground) is kept on disk.
 */

export const metadata: Metadata = {
  title: "Cyber Explorers: Cybersecurity for Ages 10–13 | AlgorithmX",
  description:
    "A 20-mission cybersecurity course for ages 10–13. Your child joins ARC, hunts the STATIC network, and learns to spot scams, read URLs, and out-think attackers. Real skills, real judgment, zero jump scares.",
  openGraph: {
    title: "Cyber Explorers: Cybersecurity for Ages 10–13 | AlgorithmX",
    description:
      "20 missions. 4 clearance blocks. Your child becomes the operative who finds the signal in the noise.",
    type: "website",
    url: "https://algorithmx.io/cyberexplorers",
  },
};

/* The concept's label face. Loaded here so only this page carries it; the
   display and body faces (Space Grotesk, Inter) and Geist Mono for the
   lockup come from the root layout. */
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", weight: ["400", "500", "600", "700"], subsets: ["latin"], display: "swap" });

export default function CyberExplorersPage() {
  return (
    <div className={jetbrains.variable} style={{ display: "contents" }}>
      <ExplorersHolo />
    </div>
  );
}
