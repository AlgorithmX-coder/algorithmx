import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import CyberStartProLanding from "@/app/cyberstart-pro/CyberStartProLanding";

/**
 * /pro — the main Cyber Pro landing (marketing / sales page).
 *
 * Public: NOT entitlement-gated. Anyone can browse before buying; the
 * entitlement gate lives on the lesson surfaces only. The course hub
 * (all modules) lives at /pro/course.
 *
 * Server shell reads the Product from the DB on each request, so
 * name/ageRange/duration/priceGBP come from the catalogue, not the
 * component. force-dynamic keeps it out of static generation (the build
 * has no database).
 */
export const dynamic = "force-dynamic";

export default async function ProLandingPage() {
  const product = await prisma.product.findUnique({
    where: { slug: "cyberstart-pro" },
  });
  if (!product) redirect("/hub");
  return <CyberStartProLanding product={product} />;
}
