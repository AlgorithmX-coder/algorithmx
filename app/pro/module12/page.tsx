import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module12 from "../lessons/module12";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module12 - Module 12: Hardening & secure configuration.
 *
 * The start of Act 3 (Security+ Domain 4; Cyber Essentials). Paid, so
 * entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 12: Hardening & secure configuration | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule12Page() {
  await enforceProAccess("/pro/module12");
  return <WeekPlayer week={module12} />;
}
