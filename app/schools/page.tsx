import type { Metadata } from "next";
import SchoolsLanding from "./SchoolsLanding";

/**
 * /schools - AlgorithmX for Schools.
 *
 * The one page a headteacher or computing lead needs: pick primary or
 * secondary, see the real product, understand the week-one setup, and ask
 * for a pilot. Prices are deliberately not listed yet (owner decision).
 */
export const metadata: Metadata = {
  title: "AlgorithmX for Schools | Cybersecurity lessons pupils teach themselves",
  description:
    "Cyber Heroes for primary, Cyber Explorers and Cyber Ops for secondary. Pupils work independently on school computers while teachers see every pupil's progress. Free half-term pilot for UK and British schools worldwide.",
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

export default function SchoolsPage() {
  return <SchoolsLanding />;
}
