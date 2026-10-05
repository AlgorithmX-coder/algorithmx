import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module10 from "../lessons/module10";

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
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module10")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module10} />;
}
