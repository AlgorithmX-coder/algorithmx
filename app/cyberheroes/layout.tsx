import type { Metadata } from "next";
import { Nunito, Fredoka, JetBrains_Mono } from "next/font/google";

/**
 * Route-scoped display fonts for the Cyber Heroes landing page.
 *
 * Imported here (not in the root layout) so next/font self-hosts them and
 * preloads them ONLY on /cyberheroes — replacing the render-blocking Google
 * Fonts `@import` the page used to inline. Space Grotesk is already loaded
 * app-wide by the root layout as `--font-space-grotesk`. The CSS variables
 * are applied via a `display: contents` wrapper below, so they cascade into
 * the "use client" page without introducing a layout box.
 */
const nunito = Nunito({
  variable: "--font-nunito",
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
});
const fredoka = Fredoka({
  variable: "--font-fredoka",
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
});

/**
 * Cyber Heroes - landing-page metadata.
 *
 * Sits as a route-segment layout because the page itself is a "use
 * client" component and can't export `metadata`. This layout adds
 * page-specific OpenGraph + Twitter cards (so WhatsApp / Facebook
 * shares show the right preview) plus a schema.org/Course JSON-LD
 * block for richer search results.
 */

const PAGE_TITLE =
  "Cyber Heroes Academy - Cybersecurity for Kids Ages 6–10 | AlgorithmX";
const PAGE_DESC =
  "Turn your child into a Cyber Hero. 20 weeks of interactive cybersecurity missions for kids 6–10 - animated lessons, boss battles, printable certificates. £99 one-time, lifetime access, no subscriptions.";
const PAGE_URL = "https://www.algorithmx.co.uk/cyberheroes";
const OG_IMAGE = "/characters/heroic.png";

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESC,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: "Cyber Heroes Academy - Cybersecurity for Kids 6–10",
    description: PAGE_DESC,
    url: PAGE_URL,
    siteName: "AlgorithmX",
    type: "website",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Adam and Layla - the Cyber Heroes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cyber Heroes Academy - Cybersecurity for Kids 6–10",
    description:
      "20 weeks of interactive cybersecurity adventures. £99 one-time, lifetime access.",
    images: [OG_IMAGE],
  },
};

const COURSE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Cyber Heroes Academy",
  description:
    "Interactive cybersecurity course for children aged 6–10. 20 weeks of animated lessons, missions, and boss battles teaching password safety, phishing awareness, and digital citizenship.",
  provider: {
    "@type": "Organization",
    name: "AlgorithmX",
    sameAs: "https://www.algorithmx.co.uk",
  },
  educationalLevel: "Primary education / Key Stage 1–2",
  audience: {
    "@type": "EducationalAudience",
    educationalRole: "student",
    audienceType: "Children aged 6–10",
  },
  offers: {
    "@type": "Offer",
    price: 99,
    priceCurrency: "GBP",
    availability: "https://schema.org/InStock",
    url: PAGE_URL,
    category: "Educational Software",
  },
  hasCourseInstance: {
    "@type": "CourseInstance",
    courseMode: "online",
    courseWorkload: "PT45M",
    duration: "P20W",
  },
  inLanguage: "en-GB",
  about: [
    "Password safety",
    "Phishing awareness",
    "Online safety",
    "Digital citizenship",
    "Cybersecurity for kids",
  ],
};

export default function CyberHeroesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${nunito.variable} ${fredoka.variable} ${jetbrainsMono.variable}`}
      style={{ display: "contents" }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(COURSE_JSON_LD),
        }}
      />
      {children}
    </div>
  );
}
