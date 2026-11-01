import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module13 from "../lessons/module13";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module13 - Module 13: The SOC & the analyst's day.
 *
 * Act 3 (Security+ Domain 4; NICE Cyber Defense Analyst). Paid, so
 * entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 13: The SOC & the analyst's day | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule13Page() {
  await enforceProAccess("/pro/module13");
  return <WeekPlayer week={module13} />;
}
