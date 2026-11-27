import type { Metadata } from "next";
import ExplorersFieldUnit from "@/app/components/explorers-field/ExplorersFieldUnit";

/**
 * /cyberexplorers, the product page for the ages 10 to 13 course. Server
 * wrapper for SEO metadata; the page itself is a client component.
 *
 * 2026-11-27: the "Field Unit" design (landing lab round 9, owner: "push it
 * live") replaces the Hologram page. Same section order, the design's
 * shortened copy, the live links, metadata, price and footer. Everything
 * lives in app/components/explorers-field (fonts load there).
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

export default function CyberExplorersPage() {
  return <ExplorersFieldUnit />;
}
