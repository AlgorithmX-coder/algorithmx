import type { Metadata } from "next";
import AnalystConsole from "./console/AnalystConsole";

/**
 * /pro — the Cyber Pro analyst console (walking skeleton).
 *
 * Behind the site password gate via middleware like everything else;
 * noindex until the tier launches. NOT yet entitlement-gated: the
 * auth() + hasEntitlement(userId, "cyberstart-pro") pair goes in when
 * the surface ships to buyers (see docs/pro/cyber-pro-design.md §1.10).
 */
export const metadata: Metadata = {
  title: "Analyst Console | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProConsolePage() {
  return <AnalystConsole />;
}
