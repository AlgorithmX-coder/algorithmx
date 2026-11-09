import { Chakra_Petch, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { Suspense } from "react";
import PupilSignOut from "@/app/components/PupilSignOut";

/* Cyber Ops range previews live under /operators. They sit behind the site
 * password (middleware gates everything except /dev and static files) and are
 * noindexed per page — internal previews of the range engine, not the shipped
 * lesson flow. This layout self-hosts the tier's type system (Chakra Petch +
 * IBM Plex) as the --font-* variables the range components read. */
const display = Chakra_Petch({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-chakra", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-mono", display: "swap" });
const sans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "600"], variable: "--font-plex-sans", display: "swap" });

export default function OperatorsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${display.variable} ${mono.variable} ${sans.variable}`}>
      {children}
      {/* A school pupil on Cyber Ops reaches both the portfolio and every
          module through here, and had no way out of either. Renders nothing
          for anybody who is not a pupil, and is suspended so reading the
          session never holds up the first paint of a module. */}
      <Suspense fallback={null}>
        <PupilSignOut />
      </Suspense>
    </div>
  );
}
