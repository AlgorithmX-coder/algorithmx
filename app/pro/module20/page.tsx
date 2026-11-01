import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module20 from "../lessons/module20";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module20 - Module 20: The roles & the certification roadmap.
 *
 * Act 4 (career map). Paid, so entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 20: The roles & the cert roadmap | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule20Page() {
  await enforceProAccess("/pro/module20");
  return <WeekPlayer week={module20} />;
}
