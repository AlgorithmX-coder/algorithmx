import { Chakra_Petch, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

/* Cyber Ops range previews live under /operators. They sit behind the site
 * password (middleware gates everything except /dev and static files) and are
 * noindexed per page — internal previews of the range engine, not the shipped
 * lesson flow. This layout self-hosts the tier's type system (Chakra Petch +
 * IBM Plex) as the --font-* variables the range components read. */
const display = Chakra_Petch({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-chakra", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-mono", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-sans", display: "swap" });

export default function OperatorsLayout({ children }: { children: React.ReactNode }) {
  return <div className={`${display.variable} ${mono.variable} ${sans.variable}`}>{children}</div>;
}
