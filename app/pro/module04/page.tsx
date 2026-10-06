import type { Metadata } from "next";
import WeekPlayer from "../learn/WeekPlayer";
import module04 from "../lessons/module04";

/**
 * /pro/module04 - Module 4: Cryptography without the maths (5 topics).
 *
 * The full crypto module, with the real in-browser AES encryption lab
 * (topic 4). Act 1, so free: no entitlement gate (the paid gate begins
 * at Act 2). Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 4: Cryptography without the maths | Cyber Pro",
  robots: { index: false, follow: false },
};

export default function ProModule04Page() {
  return <WeekPlayer week={module04} />;
}
