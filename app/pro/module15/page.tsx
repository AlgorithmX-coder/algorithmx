import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module15 from "../lessons/module15";

/**
 * /pro/module15 - Module 15: Detection & threat intelligence.
 *
 * Act 3 (Security+ Domain 4; MITRE ATT&CK). Paid, so entitlement-gated.
 * Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 15: Detection & threat intelligence | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule15Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module15")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module15} />;
}
