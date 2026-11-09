import type { Metadata } from "next";
import type { ReactNode } from "react";
import { K } from "@/app/ai-cleared/engine/tokens";

/* The Cyber Secured portal: a firm's own place for its courses, on the
 * same ground as the courses themselves. Never indexed. */
export const metadata: Metadata = {
  title: "Cyber Secured",
  description: "Your firm's Cyber Secured courses from AlgorithmX, every one on a single seat.",
  robots: { index: false, follow: false },
};

export default function CyberSecuredLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{ minHeight: "100svh", background: K.ground, color: K.body, fontFamily: K.sans, colorScheme: "light" }}>
      {children}
      {/* On a phone the header keeps the firm and the links, not the name. */}
      <style>{`.cf-link { white-space: nowrap; } @media (max-width: 560px) { .cs-who { display: none; } }`}</style>
    </div>
  );
}
