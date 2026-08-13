import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import CyberStartProLanding from "./CyberStartProLanding";

/**
 * /cyberstart-pro — public marketing landing for the Cyber Pro track.
 *
 * Public: NOT entitlement-gated. Anyone can browse before buying.
 * The entitlement gate lives on the lesson/dashboard surfaces only.
 *
 * Server shell fetches the Product so emoji/name/ageRange/duration/
 * priceGBP/weeksCount come from the DB rather than living in the
 * component.
 *
 * Rendered dynamically: the Product is read from the DB on every
 * request, so there's nothing to statically prerender at build time
 * (and the build has no database). force-dynamic keeps the page out of
 * static generation; on Vercel it's served per-request from the DB.
 */
export const dynamic = "force-dynamic";

export default async function CyberStartProPage() {
  const product = await prisma.product.findUnique({
    where: { slug: "cyberstart-pro" },
  });
  if (!product) redirect("/hub");
  return <CyberStartProLanding product={product} />;
}
