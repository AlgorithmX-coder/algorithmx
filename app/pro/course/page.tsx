import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { hasEntitlement } from "@/app/lib/entitlements";
import CourseHub from "../CourseHub";

/**
 * /pro/course — the course hub: all 21 modules across the four acts,
 * with a route into the built ones. Act 1 is free for everyone; the
 * hub shows the lock state for Acts 2-4 (the module pages themselves
 * enforce it) and, once the product is ACTIVE, the way to unlock.
 * Noindex until the tier launches.
 */
export const metadata: Metadata = {
  title: "Cyber Pro - the course",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function ProCoursePage({
  searchParams,
}: {
  searchParams: Promise<{ locked?: string }>;
}) {
  const { locked: bouncedParam } = await searchParams;
  const session = await auth();
  const entitled = session?.user?.id
    ? await hasEntitlement(session.user.id, "cyberstart-pro")
    : false;

  const product = await prisma.product.findUnique({
    where: { slug: "cyberstart-pro" },
    select: { status: true, priceGBP: true },
  });
  const purchasable = product?.status === "ACTIVE";
  const priceLabel = product ? `£${Math.round(product.priceGBP / 100)}` : "£99";

  return (
    <CourseHub
      locked={!entitled}
      purchasable={purchasable}
      priceLabel={priceLabel}
      bounced={!entitled && bouncedParam === "1"}
    />
  );
}
