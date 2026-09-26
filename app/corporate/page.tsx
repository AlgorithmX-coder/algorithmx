import type { Metadata } from "next";
import CorporateLanding from "./CorporateLanding";

/**
 * /corporate - AlgorithmX for firms: AI Cleared and AI Fluent.
 *
 * The one page an HR lead, IT manager, DPO or managing partner needs: the
 * two courses, how they run in the firm, what every seat comes with, the
 * price, and a form.
 */
export const metadata: Metadata = {
  title: "AI Cleared and AI Fluent by AlgorithmX | AI training for every member of staff",
  description:
    "AI Cleared teaches your whole firm to use Copilot, ChatGPT, Gemini and Claude without leaking client, colleague or bank data. AI Fluent teaches them to get real work out of it. Interactive, with a certificate and a training register. From £19 per person per year.",
  alternates: { canonical: "https://algorithmx.io/corporate" },
  openGraph: {
    title: "AI Cleared and AI Fluent by AlgorithmX",
    description:
      "Every member of staff, cleared to use AI. Two short interactive courses with a live sandbox, a certificate and a training register.",
    url: "https://algorithmx.io/corporate",
    siteName: "AlgorithmX",
    type: "website",
  },
};

export default function CorporatePage() {
  return <CorporateLanding />;
}
