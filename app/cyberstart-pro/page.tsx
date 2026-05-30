import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import CyberStartProLanding from "./CyberStartProLanding";

/**
 * /cyberstart-pro — public marketing landing for the CyberStart Pro track.
 *
 * Public: NOT entitlement-gated. Anyone can browse before buying.
 * The entitlement gate lives on the lesson/dashboard surfaces only.
 *
 * Server shell fetches the Product so emoji/name/ageRange/duration/
 * priceGBP/weeksCount come from the DB rather than living in the
 * component.
 */
export default async function CyberStartProPage() {
  const product = await prisma.product.findUnique({
    where: { slug: "cyberstart-pro" },
  });
  if (!product) redirect("/hub");
  return <CyberStartProLanding product={product} />;
}
