import type { ReactNode } from "react";
import { Atkinson_Hyperlegible_Next, Lexend } from "next/font/google";
import { D } from "./tokens";

/* Self-hosted fonts per the house rule (no runtime Google @import). Both
 * faces were drawn for easy reading: Lexend for headings, Atkinson
 * Hyperlegible for everything a learner reads. Exposed as vars so the
 * themed auth pages pick them up too. */
const display = Lexend({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--font-desk-display" });
const sans = Atkinson_Hyperlegible_Next({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-desk-sans" });

export default function DeskReadyLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${display.variable} ${sans.variable}`}
      style={{ minHeight: "100svh", background: D.ground, color: D.body, fontFamily: D.sans, colorScheme: "light" }}
    >
      {children}
    </div>
  );
}
