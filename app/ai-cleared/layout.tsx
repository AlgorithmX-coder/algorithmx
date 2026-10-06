import type { Metadata } from "next";
import type { ReactNode } from "react";
import { K } from "./engine/tokens";

/* The clearance console is its own place: no site nav, no footer, the
 * graphite ground on every screen. Never indexed. */
export const metadata: Metadata = {
  title: "AI Cleared",
  description: "The AI Cleared course from AlgorithmX. Claim your seat, learn your firm's rules for AI, practise in a live sandbox on practice data, and earn a certificate.",
  openGraph: { title: "AI Cleared by AlgorithmX", description: "Claim your seat, learn your firm's rules for AI, and earn a certificate.", siteName: "AlgorithmX", type: "website", images: [{ url: "/corporate/og.png", width: 1200, height: 630, alt: "AI Cleared and AI Fluent by AlgorithmX" }] },
  robots: { index: false, follow: false },
};

export default function AiClearedLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: "100svh", background: K.ground, color: K.body, fontFamily: K.sans, colorScheme: "light" }}>{children}</div>;
}
