import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module14 from "../lessons/module14";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module14 - Module 14: Logs & the SIEM (5 topics).
 *
 * The full logs/SIEM module, with the real in-browser honeypot SIEM
 * investigation (topic 2). Act 3 is paid, so entitlement-gated. Noindex
 * until launch.
 */
export const metadata: Metadata = {
  title: "Module 14: Logs & the SIEM | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule14Page() {
  await enforceProAccess("/pro/module14");
  return <WeekPlayer week={module14} />;
}
