import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module17 from "../lessons/module17";

/**
 * /pro/module17 - Module 17: Governance, risk & compliance (GRC).
 *
 * The start of Act 4 (Security+ Domain 5; ISO 27001; NIST CSF). Paid,
 * so entitlement-gated. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 17: Governance, risk & compliance | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule17Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module17")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module17} />;
}
