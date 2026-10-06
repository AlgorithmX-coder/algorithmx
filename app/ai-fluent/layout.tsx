import type { Metadata } from "next";
import type { ReactNode } from "react";
import { K } from "@/app/ai-cleared/engine/tokens";

/* AI Fluent shares AI Cleared's console: no site nav, no footer, the same
 * ground on every screen. Never indexed. */
export const metadata: Metadata = {
  title: "AI Fluent",
  description: "The AI Fluent course from AlgorithmX. Nine modules on getting real work out of your firm's AI tool, with a playbook of the prompts that worked and a certificate.",
  openGraph: { title: "AI Fluent by AlgorithmX", description: "Nine modules on getting real work out of your firm's AI tool, with a playbook and a certificate.", siteName: "AlgorithmX", type: "website", images: [{ url: "/corporate/og.png", width: 1200, height: 630, alt: "AI Cleared and AI Fluent by AlgorithmX" }] },
  robots: { index: false, follow: false },
};

export default function AiFluentLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: "100svh", background: K.ground, color: K.body, fontFamily: K.sans, colorScheme: "light" }}>{children}</div>;
}
