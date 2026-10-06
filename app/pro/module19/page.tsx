import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module19 from "../lessons/module19";

/**
 * /pro/module19 - Module 19: Resilience: backups & continuity.
 *
 * Act 4 (Security+ Domains 3/4; ISC2 CC D2). Paid, so entitlement-gated.
 * Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 19: Resilience: backups & continuity | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule19Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module19")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module19} />;
}
