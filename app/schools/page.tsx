import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import SchoolsHolo from "@/app/components/schools-holo/SchoolsHolo";

/**
 * /schools - AlgorithmX for Schools.
 *
 * The one page a headteacher or computing lead needs: pick primary or
 * secondary, see the real product, understand the week-one setup, and ask
 * for a pilot. Prices are deliberately not listed yet (owner decision).
 *
 * 2026-11-22: the Hologram Campus design replaces the sand landing. The
 * owner reviewed ten schools concepts in the landing lab (round 2), picked
 * s01 Hologram Campus and asked for it live. Copy, sections and order are
 * unchanged; everything visual is new and lives in
 * app/components/schools-holo. The previous composition (SchoolsLanding,
 * ProductTabs, EnquiryForm, SchoolsGlobe, the shared Nav, ProofBand and
 * Footer in sand tone) is kept on disk and in git history.
 */
export const metadata: Metadata = {
  title: "AlgorithmX for Schools | Cybersecurity lessons pupils teach themselves",
  description:
    "Cyber Heroes for primary, Cyber Explorers and Cyber Ops for secondary. Pupils work independently on school computers while teachers see every pupil's progress. Built to the British curriculum, taught in schools worldwide. Free half-term pilot.",
  alternates: { canonical: "https://algorithmx.io/schools" },
  openGraph: {
    title: "AlgorithmX for Schools",
    description:
      "Cybersecurity lessons your pupils teach themselves. Primary and secondary. Free half-term pilot.",
    url: "https://algorithmx.io/schools",
    siteName: "AlgorithmX",
    type: "website",
  },
};

/* The concept's label face. Loaded here so only this page carries it; the
   display and body faces (Space Grotesk, Inter) come from the root layout. */
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", weight: ["400", "500", "600", "700"], subsets: ["latin"], display: "swap" });

export default function SchoolsPage() {
  return (
    <div className={jetbrains.variable} style={{ display: "contents" }}>
      <SchoolsHolo />
    </div>
  );
}
