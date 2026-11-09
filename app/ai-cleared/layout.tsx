import type { Metadata } from "next";
import type { ReactNode } from "react";
import { K } from "./engine/tokens";

/* The clearance console is its own place: no site nav, no footer, the
 * graphite ground on every screen. Never indexed. */
export const metadata: Metadata = {
  title: "AI Cleared",
  description: "The AI Cleared course from AlgorithmX, part of Cyber Secured. Claim your seat, learn your firm's rules for AI, and practise in a live sandbox on practice data.",
  openGraph: { title: "AI Cleared by AlgorithmX", description: "Claim your seat and learn your firm's rules for AI, practised in a live sandbox on practice data.", siteName: "AlgorithmX", type: "website", images: [{ url: "/corporate/og.png", width: 1200, height: 630, alt: "Cyber Secured by AlgorithmX: AI Cleared, AI Fluent and Cyber Awareness" }] },
  robots: { index: false, follow: false },
};

export default function AiClearedLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: "100svh", background: K.ground, color: K.body, fontFamily: K.sans, colorScheme: "light" }}>{children}</div>;
}
