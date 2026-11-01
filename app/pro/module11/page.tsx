import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module11 from "../lessons/module11";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module11 - Module 11: Vulnerabilities & patching.
 *
 * The close of Act 2 (Security+ Domains 2/4; OWASP A06; CE Update
 * Management). Act 2 is paid, so this is entitlement-gated: Act 1 is the
 * free taster, everything from here belongs to buyers. Noindex until
 * launch.
 */
export const metadata: Metadata = {
  title: "Module 11: Vulnerabilities & patching | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule11Page() {
  await enforceProAccess("/pro/module11");
  return <WeekPlayer week={module11} />;
}
