import { Chakra_Petch, IBM_Plex_Mono, Nunito } from "next/font/google";

/* Self-hosted fonts per the house rule (no runtime Google @import).
 * Chakra Petch = Pro display lockups, Nunito = body, Plex Mono = the
 * log viewer and console chrome. Exposed as vars so /dev harnesses
 * still render with the literal fallbacks in tokens.ts. */
const display = Chakra_Petch({ weight: ["600", "700"], subsets: ["latin"], variable: "--font-pro-display" });
const sans = Nunito({ weight: ["400", "600", "700", "800"], subsets: ["latin"], variable: "--font-pro-sans" });
const mono = IBM_Plex_Mono({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-pro-mono" });

export default function ProLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      {children}
    </div>
  );
}
