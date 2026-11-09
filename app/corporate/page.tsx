import type { Metadata } from "next";
import CorporateLanding from "./CorporateLanding";
import { stripeConfigured } from "@/app/lib/stripe";

/**
 * /corporate - Cyber Secured by AlgorithmX: one seat per person opens AI
 * Cleared, AI Fluent and Cyber Awareness.
 *
 * The one page an HR lead, IT manager, DPO or managing partner needs: the
 * three courses, the real attacks they teach from, how it runs in the firm,
 * what every seat comes with, the price, and a form.
 */
const OG_ALT = "Attacks change daily. We have your firm covered. Cyber Secured by AlgorithmX: AI Cleared, AI Fluent and Cyber Awareness for every member of staff.";

export const metadata: Metadata = {
  title: "Cyber Secured by AlgorithmX | AI and cyber training for every member of staff",
  description:
    "One seat per person opens three courses: AI Cleared to use Copilot, ChatGPT, Gemini and Claude safely, AI Fluent to get real work out of them, and Cyber Awareness to spot the attacks aimed at staff. Built on real, reported incidents, with every completion on your team register. From £85 per person per year plus VAT.",
  alternates: { canonical: "https://algorithmx.io/corporate" },
  openGraph: {
    title: "Cyber Secured by AlgorithmX",
    description:
      "Attacks change daily. One seat per person opens AI Cleared, AI Fluent and Cyber Awareness, built on real, reported incidents, with every completion on your team register.",
    url: "https://algorithmx.io/corporate",
    siteName: "AlgorithmX",
    type: "website",
    images: [{ url: "https://algorithmx.io/corporate/og.png", width: 1200, height: 630, alt: OG_ALT }],
  },
  twitter: { card: "summary_large_image", title: "Cyber Secured by AlgorithmX", description: "Attacks change daily. One seat per person opens AI Cleared, AI Fluent and Cyber Awareness, built on real, reported incidents, with every completion on your team register.", images: ["https://algorithmx.io/corporate/og.png"] },
};

export default function CorporatePage() {
  return <CorporateLanding checkoutLive={stripeConfigured()} />;
}
