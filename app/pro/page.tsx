import { CATALOGUE } from "@/app/lib/courseIntent";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import ProEmber from "@/app/cyberstart-pro/ember/ProEmber";

/**
 * /pro - the main Cyber Pro landing (marketing / sales page).
 *
 * Public: NOT entitlement-gated. Anyone can browse before buying; the
 * entitlement gate lives on the lesson surfaces only. The course hub
 * (all modules) lives at /pro/course.
 *
 * Server shell reads the Product from the DB on each request, so
 * name/status/priceGBP come from the catalogue, not the component.
 * force-dynamic keeps it out of static generation (the build has no
 * database).
 *
 * 2026-11-27: the Ember Console design (landing lab round 9, version A, the
 * owner's pick) replaces the Hologram page. Section order, the real
 * password lab, the PURCHASE_OPEN gate, the waitlist, the nav lockup and the
 * footer links are unchanged; everything visual lives in
 * app/cyberstart-pro/ember, which also loads its own fonts (Chakra Petch,
 * JetBrains Mono, Inter) through next/font. The older composition
 * (CyberStartProLanding) is still kept on disk.
 */
export const dynamic = "force-dynamic";

export default async function ProLandingPage() {
  const product = await prisma.product.findUnique({
    where: { slug: "cyberstart-pro" },
  });
  if (!product) redirect(CATALOGUE);
  return <ProEmber product={product} />;
}
