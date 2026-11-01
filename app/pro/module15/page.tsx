import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module15 from "../lessons/module15";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module15 - Module 15: Detection & threat intelligence.
 *
 * Act 3 (Security+ Domain 4; MITRE ATT&CK). Paid, so entitlement-gated.
 * Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 15: Detection & threat intelligence | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule15Page() {
  await enforceProAccess("/pro/module15");
  return <WeekPlayer week={module15} />;
}
