import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CATALOGUE } from "@/app/lib/courseIntent";
import { prisma } from "@/app/lib/prisma";
import DeskReadyLanding from "./DeskReadyLanding";

/**
 * /desk-ready - the Desk Ready landing (marketing page). Public, not
 * entitlement-gated; the course map lives at /desk-ready/course.
 *
 * Reads the Product on each request so the price comes from the catalogue,
 * not the component. force-dynamic keeps it out of static generation (the
 * build has no database). Noindex until launch.
 */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Desk Ready | AlgorithmX",
  description: "The fundamental computer skills every desk job runs on: email, spreadsheets, files and AI, in ten minute lessons practised in a pretend office.",
  robots: { index: false, follow: false },
};

export default async function DeskReadyLandingPage() {
  const product = await prisma.product.findUnique({ where: { slug: "desk-ready" } });
  if (!product) redirect(CATALOGUE);
  return <DeskReadyLanding priceGBP={product.priceGBP} />;
}
