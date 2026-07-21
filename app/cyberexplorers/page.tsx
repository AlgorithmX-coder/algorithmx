import type { Metadata } from "next";
import CyberExplorersLanding from "./CyberExplorersLanding";

/**
 * /cyberexplorers — product page for the ages 10–13 tier ("Signal
 * Room"). Server wrapper for SEO metadata; the page itself is the
 * client component alongside. Replaced the pre-design-session landing
 * (12 weeks / ages 11–14 / code-rain) on 2026-07-12 — canon lives in
 * docs/explorers/algorithmx-explorers-art-direction.md.
 */

export const metadata: Metadata = {
  title: "Cyber Explorers — Cybersecurity for Ages 10–13 | AlgorithmX",
  description:
    "A 20-mission cybersecurity course for ages 10–13. Your child joins ARC, hunts the STATIC network, and learns to spot scams, read URLs, and out-think attackers — real skills, real judgment, zero jump scares.",
  openGraph: {
    title: "Cyber Explorers — Cybersecurity for Ages 10–13 | AlgorithmX",
    description:
      "20 missions. 4 clearance blocks. Your child becomes the operative who finds the signal in the noise.",
    type: "website",
    url: "https://algorithmx.io/cyberexplorers",
  },
};

export default function CyberExplorersPage() {
  return <CyberExplorersLanding />;
}
