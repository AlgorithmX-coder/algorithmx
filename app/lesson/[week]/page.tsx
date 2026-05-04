import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import DynamicLesson from "./DynamicLesson";

/**
 * /lesson/[week] — server-side auth + paywall gate.
 *
 * The lesson UI itself is a client component (DynamicLesson) that uses
 * useParams + browser-only state.  This server wrapper exists solely
 * to bounce unauthenticated and unpaid users before any client JS
 * loads.  Without this, the dynamic week routes were reachable by
 * anyone with the URL.
 */
export default async function WeekRoutePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const devBypass =
    process.env.NODE_ENV !== "production" &&
    process.env.DEV_BYPASS_PAYWALL === "true";
  if (!devBypass) {
    const accessUser = await prisma.user.findUnique({
      where: { id: session.user.id! },
      select: { stripeStatus: true },
    });
    const hasAccess =
      accessUser?.stripeStatus === "active" ||
      accessUser?.stripeStatus === "paid";
    if (!hasAccess) redirect("/dashboard?payment=needed");
  }

  return <DynamicLesson />;
}
