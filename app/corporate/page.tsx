import type { Metadata } from "next";
import CorporateLanding from "./CorporateLanding";

/**
 * /corporate - AlgorithmX for firms. The AI Cleared course.
 *
 * The one page an HR lead, IT manager, DPO or managing partner needs: what
 * the course covers, how it runs in the firm, what evidence they get, and a
 * form. Prices are deliberately not listed yet (owner decision, as on
 * /schools).
 */
export const metadata: Metadata = {
  title: "AI Cleared by AlgorithmX | AI safety training for every member of staff",
  description:
    "AI Cleared teaches your whole firm to use Copilot, ChatGPT, Gemini and Claude without leaking client, colleague or bank data, and to get real work out of them. Interactive, about ninety minutes, with a certificate and a training register.",
  alternates: { canonical: "https://algorithmx.io/corporate" },
  openGraph: {
    title: "AI Cleared by AlgorithmX",
    description:
      "Every member of staff, cleared to use AI. A short interactive course with a live sandbox, a certificate and a training register.",
    url: "https://algorithmx.io/corporate",
    siteName: "AlgorithmX",
    type: "website",
  },
};

export default function CorporatePage() {
  return <CorporateLanding />;
}
