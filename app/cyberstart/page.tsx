import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import CyberStartLanding from "./CyberStartLanding";

/**
 * /cyberstart — public marketing landing for the CyberStart track.
 *
 * Public: NOT entitlement-gated. Anyone (signed in or out) can browse
 * before buying. The entitlement gate lives on the lesson/dashboard
 * surfaces only.
 *
 * Server shell fetches the Product so emoji/name/ageRange/duration/
 * priceGBP/weeksCount come from the DB rather than living in the
 * component. The crafted marketing copy (features grid, hero blurb,
 * etc.) stays hardcoded in the client landing — it's deliberate
 * authored copy, not catalogue data.
 *
 * Rendered dynamically: the Product is read from the DB on every
 * request, so there's nothing to statically prerender at build time
 * (and the build has no database). force-dynamic keeps the page out of
 * static generation; on Vercel it's served per-request from the DB.
 */
export const dynamic = "force-dynamic";

export default async function CyberStartPage() {
  const product = await prisma.product.findUnique({
    where: { slug: "cyberstart" },
  });
  if (!product) redirect("/hub");
  return <CyberStartLanding product={product} />;
}
