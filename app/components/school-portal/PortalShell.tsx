import type { ReactNode } from "react";
import Link from "next/link";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import ByAlgorithmX from "@/app/components/ByAlgorithmX";
import "./school-portal.css";

/**
 * The teacher's portal, in the light house.
 *
 * The working pages a teacher keeps open through a lesson (their classes,
 * one class) on the same light Hologram ground as /schools/login and the
 * dead ends: #f7f8fb with the 64px hairline grid, one cyan pool top left,
 * white panels. No streams and no canvases: this is a working page and it
 * stays calm.
 *
 * Only the room is drawn here: the lockup on the left, the page's own nav on
 * the right, and the ground. Every page brings its own words, forms and
 * actions, so the copy and the behaviour stay where they were.
 *
 * Styles are one scoped sheet (school-portal.css, prefix sp-, root .sp).
 * The old .axtp house in app/schools/teach/pack.css is left alone: the
 * teacher packs, AccessClosed and TrialEnded still use it.
 */

const disp = Space_Grotesk({ subsets: ["latin"], weight: ["600", "700"], variable: "--sp-disp", display: "swap" });
const sans = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--sp-sans", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], weight: ["600", "700"], variable: "--sp-mono", display: "swap" });

/* The cap, as DeadEnd draws it for lockup="school". */
const CAP = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 9l10-5 10 5-10 5L2 9z M6 11.5V16c2 2 10 2 12 0v-4.5 M22 9v6" />
  </svg>
);

export const SP_BACK = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M19 12H5 M11 6l-6 6 6 6" />
  </svg>
);

export default function PortalShell({
  nav,
  navLabel = "Elsewhere",
  children,
}: {
  /** The page's own links, and Sign out. Quiet links: give each sp-nav-a. */
  nav: ReactNode;
  navLabel?: string;
  children: ReactNode;
}) {
  return (
    <div className={`sp ${disp.variable} ${sans.variable} ${mono.variable}`}>
      <div className="sp-ground" aria-hidden="true">
        <span className="grid" />
        <span className="pool" />
      </div>

      <header className="sp-top">
        <Link className="sp-lock" href="/schools" aria-label="Cyber School by AlgorithmX">
          <span className="mark">{CAP}</span>
          <span className="col">
            <span className="name">Cyber <em>School</em></span>
            <span className="by"><ByAlgorithmX /></span>
          </span>
        </Link>
        <nav className="sp-nav" aria-label={navLabel}>
          {nav}
        </nav>
      </header>

      <main className="sp-main">{children}</main>
    </div>
  );
}
