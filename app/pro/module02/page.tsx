import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module02 from "../lessons/module02";

/**
 * /pro/module02 - Module 2: How the internet actually works (5 topics).
 *
 * The network foundation (Security+ Domain 3 / Network+ basics), taught
 * through five real outages and attacks. Act 1, so free: no entitlement
 * gate (the paid gate begins at Act 2). Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 2: How the internet actually works | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProModule02Page() {
  return <WeekPlayer week={module02} />;
}
