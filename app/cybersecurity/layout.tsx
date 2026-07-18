import { Fredoka, Chakra_Petch } from "next/font/google";

/**
 * Route-scoped brand fonts for the /cybersecurity browse page.
 *
 * The track cards carry each course's branded name lockup (the logo
 * system from the track landings' navs — PR #103): Cyber Heroes sets
 * its wordmark in Fredoka, Cyber Ops and Cyber Pro in Chakra Petch.
 * Loaded here via next/font so they are self-hosted and preloaded ONLY
 * on this route (same pattern as /cyberheroes' layout — no
 * render-blocking Google Fonts @import). Explorers' wordmark uses the
 * app-wide Geist Mono, which the root layout already provides.
 *
 * The `display: contents` wrapper exposes the CSS variables to the
 * page without introducing a layout box. Page metadata lives in
 * page.tsx (a server component) — this layout deliberately exports
 * none so it can't clobber it.
 */
const fredoka = Fredoka({
  variable: "--font-fredoka",
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
});
const chakra = Chakra_Petch({
  variable: "--font-chakra",
  weight: ["700"],
  subsets: ["latin"],
  display: "swap",
});

export default function CybersecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${fredoka.variable} ${chakra.variable}`}
      style={{ display: "contents" }}
    >
      {children}
    </div>
  );
}
