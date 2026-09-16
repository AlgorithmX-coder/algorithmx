import { Fredoka, Chakra_Petch } from "next/font/google";

/**
 * Route-scoped brand fonts for /schools: the phase cards carry each
 * course's branded lockup (Cyber Heroes in Fredoka, Cyber Ops in Chakra
 * Petch; Explorers uses the app-wide Geist Mono). Same pattern as the
 * /cybersecurity layout. Page metadata stays in page.tsx.
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

export default function SchoolsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${fredoka.variable} ${chakra.variable}`} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
