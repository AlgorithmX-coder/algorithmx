import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module10 from "../lessons/module10";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module10 - Module 10: Networks & Wi-Fi under attack.
 *
 * Act 2 (Security+ Domains 2-3). Act 2 is paid, so this is entitlement-
 * gated: Act 1 is the free taster, everything from here belongs to
 * buyers. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 10: Networks & Wi-Fi under attack | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule10Page() {
  await enforceProAccess("/pro/module10");
  return <WeekPlayer week={module10} />;
}
