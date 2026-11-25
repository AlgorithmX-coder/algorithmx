import { JetBrains_Mono } from "next/font/google";
import { CATALOGUE } from "@/app/lib/courseIntent";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import ProHolo from "@/app/cyberstart-pro/holo/ProHolo";

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
 *
 * 2026-11-22: the Hologram design (landing lab round 4, concept p01, the
 * owner's pick) replaces the Command Bar page. Copy, sections, order, the
 * real password lab, the PURCHASE_OPEN gate and the waitlist are unchanged;
 * everything visual lives in app/cyberstart-pro/holo. The previous
 * composition (CyberStartProLanding) is kept on disk.
 */
export const dynamic = "force-dynamic";

/* The concept's label face. Loaded here so only this page carries it; the
   display and body faces (Space Grotesk, Inter) come from the root layout and
   Chakra Petch from app/pro/layout.tsx. */
const jetbrains = JetBrains_Mono({ variable: "--font-jetbrains", weight: ["400", "500", "600", "700"], subsets: ["latin"], display: "swap" });

export default async function ProLandingPage() {
  const product = await prisma.product.findUnique({
    where: { slug: "cyberstart-pro" },
  });
  if (!product) redirect(CATALOGUE);
  return (
    <div className={jetbrains.variable} style={{ display: "contents" }}>
      <ProHolo product={product} />
    </div>
  );
}
