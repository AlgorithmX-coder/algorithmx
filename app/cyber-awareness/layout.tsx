import type { Metadata } from "next";
import type { ReactNode } from "react";
import { K } from "@/app/ai-cleared/engine/tokens";

/* Cyber Awareness shares AI Cleared and AI Fluent's console: no site nav,
 * no footer, the same ground on every screen. Never indexed. */
export const metadata: Metadata = {
  title: "Cyber Awareness",
  description: "The Cyber Awareness course from AlgorithmX. Eight modules on everyday cyber hygiene for every member of staff, tracked module by module.",
  openGraph: { title: "Cyber Awareness by AlgorithmX", description: "Eight modules on everyday cyber hygiene for every member of staff.", siteName: "AlgorithmX", type: "website", images: [{ url: "/corporate/og.png", width: 1200, height: 630, alt: "Cyber Secured by AlgorithmX" }] },
  robots: { index: false, follow: false },
};

export default function CyberAwarenessLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: "100svh", background: K.ground, color: K.body, fontFamily: K.sans, colorScheme: "light" }}>{children}</div>;
}
