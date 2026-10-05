import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module06 from "../lessons/module06";

/**
 * /pro/module06 - Module 6: Who the attackers are & how they operate.
 *
 * The opening of Act 2 (Security+ Domain 2; MITRE ATT&CK). Act 2 is paid
 * content, so this is entitlement-gated: Act 1 is the free taster,
 * everything from here belongs to buyers. Noindex until launch.
 */
export const metadata: Metadata = {
  title: "Module 6: Who the attackers are | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProModule06Page() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module06")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module06} />;
}
