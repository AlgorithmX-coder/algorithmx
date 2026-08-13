import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import CourseHub from "./CourseHub";

/**
 * /pro - the Cyber Pro course home (the shell).
 *
 * Viewable behind the site gate so a curious learner can see the whole
 * course map. Act 1 is free; Acts 2 to 4 unlock with the £99 purchase,
 * checked here via the existing Entitlement model (slug cyberstart-pro).
 * Progress is client-side (localStorage) for now.
 */
export const metadata: Metadata = {
  title: "Your course | Cyber Pro",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProHubPage() {
  const session = await auth();
  const userId = session?.user?.id;
  const [product, hasPro] = await Promise.all([
    prisma.product.findUnique({ where: { slug: "cyberstart-pro" }, select: { priceGBP: true } }),
    userId ? hasEntitlement(userId, "cyberstart-pro") : Promise.resolve(false),
  ]);
  return <CourseHub priceGBP={product?.priceGBP ?? 9900} hasPro={hasPro} loggedIn={Boolean(userId)} />;
}
