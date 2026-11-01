import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module21 from "../lessons/module21";
import { enforceProAccess } from "../proAccessGate";

/**
 * /pro/module21 - Module 21: The job machinery + capstone.
 *
 * The final module of Act 4 and the course. Paid, so entitlement-gated.
 * Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 21: The job machinery + capstone | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule21Page() {
  await enforceProAccess("/pro/module21");
  return <WeekPlayer week={module21} />;
}
