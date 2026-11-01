import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module17 from "../lessons/module17";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module17 - Module 17: Governance, risk & compliance (GRC).
 *
 * The start of Act 4 (Security+ Domain 5; ISO 27001; NIST CSF). Paid,
 * so entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 17: Governance, risk & compliance | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule17Page() {
  await enforceProAccess("/pro/module17");
  return <WeekPlayer week={module17} />;
}
