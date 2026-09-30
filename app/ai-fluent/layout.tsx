import type { Metadata } from "next";
import type { ReactNode } from "react";
import { K } from "@/app/ai-cleared/engine/tokens";

/* AI Fluent shares AI Cleared's console: no site nav, no footer, the same
 * ground on every screen. Never indexed. */
export const metadata: Metadata = {
  title: "AI Fluent",
  robots: { index: false, follow: false },
};

export default function AiFluentLayout({ children }: { children: ReactNode }) {
  return <div style={{ minHeight: "100svh", background: K.ground, color: K.body, fontFamily: K.sans, colorScheme: "light" }}>{children}</div>;
}
