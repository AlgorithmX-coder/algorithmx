import { Fredoka, Chakra_Petch, Nunito } from "next/font/google";
import "./teach/pack.css";

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
/* The teacher-facing pages (packs, classes) run on Nunito for everything the
   adult reads and Fredoka for anything a class reads off a board. Declared
   here rather than in each of them, so the two can never drift apart. */
const nunito = Nunito({
  variable: "--font-nunito",
  weight: ["600", "700", "800"],
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
    <div className={`${fredoka.variable} ${chakra.variable} ${nunito.variable}`} style={{ display: "contents" }}>
      {children}
    </div>
  );
}
