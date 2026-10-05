import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";
import CodeLab from "./CodeLab";

/**
 * /pro/code - the Code Lab: an in-browser JavaScript playground with
 * small security-flavoured challenges. The hands-on home of the
 * scripting strand (Module 18, Act 4), so entitlement-gated: Act 1 is
 * the free taster, everything after it belongs to buyers.
 */
export const metadata: Metadata = {
  title: "Code Lab | Cyber Pro",
  robots: { index: false, follow: false },
};

export default async function ProCodePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent("/pro/code")}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
  return <CodeLab />;
}
