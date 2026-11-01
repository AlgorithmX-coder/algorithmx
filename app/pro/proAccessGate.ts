import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { hasEntitlement } from "@/app/lib/entitlements";

/**
 * Pro paywall for Act 2-4 (Modules 6-21). One switch, one gate.
 *
 * ⚠️ UAT: the paywall is currently LIFTED (PRO_PAYWALL_ENABLED = false).
 * During testing every Pro module is open, so testers — including
 * accounts created before the free-on-signup grant — can reach all of
 * them without an entitlement. Act 1 (Modules 1-5) was always free; with
 * the switch off, Modules 6-21 behave the same.
 *
 * 🔒 Before the £99 Stripe launch, flip PRO_PAYWALL_ENABLED back to true.
 * That single change restores the login + `cyberstart-pro` entitlement
 * gate on all fifteen Act 2-4 module routes at once. Pair it with
 * removing `cyberstart-pro` from FREE_ON_SIGNUP in
 * app/api/signup/route.ts so the purchase flow becomes the only grant.
 */
const PRO_PAYWALL_ENABLED: boolean = false;

/**
 * Guard a paid Pro module route. No-op while the paywall is lifted;
 * otherwise redirects anonymous users to login and un-entitled users to
 * the course page with a locked notice. `modulePath` is this module's
 * own path (e.g. "/pro/module06") so login returns the user here.
 */
export async function enforceProAccess(modulePath: string): Promise<void> {
  if (!PRO_PAYWALL_ENABLED) return;

  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=${encodeURIComponent(modulePath)}`);
  }
  if (!(await hasEntitlement(session.user.id, "cyberstart-pro"))) {
    redirect("/pro/course?locked=1");
  }
}
