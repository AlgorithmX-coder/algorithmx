import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import WeekPlayer from "../learn/WeekPlayer";
import module21 from "../lessons/module21";

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
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/module21")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <WeekPlayer week={module21} />;
}
