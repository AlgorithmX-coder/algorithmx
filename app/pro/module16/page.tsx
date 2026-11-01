import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module16 from "../lessons/module16";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module16 - Module 16: Incident response & forensics.
 *
 * The close of Act 3 (Security+ Domain 4; NIST 800-61). Paid, so
 * entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 16: Incident response & forensics | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule16Page() {
  await enforceProAccess("/pro/module16");
  return <WeekPlayer week={module16} />;
}
