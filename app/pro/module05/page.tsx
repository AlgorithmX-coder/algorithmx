import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module05 from "../lessons/module05";

/**
 * /pro/module05 - Module 5: Law, ethics & your first audit (5 topics).
 *
 * The legal and ethical bedrock of the course (Security+ Domain 5;
 * CyBOK Law), and the completion of portfolio piece #1. Act 1, so free:
 * no entitlement gate (the paid gate begins at Act 2). Noindex until
 * launch.
 */
export const metadata: Metadata = {
  title: "Module 5: Law, ethics & your first audit | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProModule05Page() {
  return <WeekPlayer week={module05} />;
}
