import type { Metadata } from "next";
import type { ReactNode } from "react";
import { K } from "./engine/tokens";

/* The clearance console is its own place: no site nav, no footer, the
 * graphite ground on every screen. Never indexed. */
export const metadata: Metadata = {
  title: "AI Cleared",
  robots: { index: false, follow: false },
};

export default function AiClearedLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: "100svh", background: K.ground, color: K.body, fontFamily: K.sans, colorScheme: "light" }}>{children}</div>;
}
