import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import DynamicLesson from "./DynamicLesson";
import { hasLessonAccess } from "@/app/lib/paywall";

/**
 * /lesson/[week] - server-side auth + paywall gate.
 *
 * The lesson UI itself is a client component (DynamicLesson) that uses
 * useParams + browser-only state. This server wrapper exists solely
 * to bounce unauthenticated and unpaid users before any client JS
 * loads.
 */
export default async function WeekRoutePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const accessUser = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { stripeStatus: true },
  });
  if (!hasLessonAccess(accessUser)) redirect("/dashboard?payment=needed");

  return <DynamicLesson />;
}
