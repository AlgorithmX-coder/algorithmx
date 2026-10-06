import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module08 from "../lessons/module08";

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
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module08")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module08} />;
}
