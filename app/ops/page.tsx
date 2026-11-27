import type { Metadata } from "next";
import OpsConsole from "./console/OpsConsole";

/**
 * /ops - the Cyber Ops (14-17 tier) marketing landing.
 *
 * noindex: "Cyber Ops" is a working title pending trademark clearance, so
 * the page ships and is shareable by link but is kept out of search
 * engines. Remove the `robots` block to make it publicly discoverable.
 *
 * All copy is authored and static, so no DB read is needed.
 *
 * 2026-11-27: the Glass Console design (landing lab round 9, version B, the
 * owner's pick) replaces the Hologram page. Section order, routes, the nav
 * lockup and the footer fine print are unchanged; everything visual lives
 * in ./console, which also loads its own fonts (Chakra Petch, IBM Plex
 * Mono, Inter) through next/font. The older composition
 * (CyberStartLanding) is still kept on disk.
 */
export const metadata: Metadata = {
  title: "Cyber Ops - AlgorithmX",
  description:
    "The 14-17 tier of AlgorithmX. Get recruited as a junior security operator and do the real work - inside a walled training range where nothing can go wrong.",
  robots: { index: false, follow: false },
};

export default function CyberStartPage() {
  return <OpsConsole />;
}
