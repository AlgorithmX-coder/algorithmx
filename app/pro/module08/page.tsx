import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module08 from "../lessons/module08";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module08 - Module 8: Malware: how it really works.
 *
 * Act 2 (Security+ Domain 2; CE Malware Protection). Act 2 is paid, so
 * this is entitlement-gated: Act 1 is the free taster, everything from
 * here belongs to buyers. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 8: Malware: how it really works | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule08Page() {
  await enforceProAccess("/pro/module08");
  return <WeekPlayer week={module08} />;
}
