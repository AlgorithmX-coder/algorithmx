import { Nunito } from "next/font/google";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import LessonGate from "./LessonGate";
import { hasLessonAccess } from "@/app/lib/paywall";

const nunito = Nunito({ subsets: ["latin"] });

export default async function LessonPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Paywall gate via the shared hasLessonAccess helper. The helper
  // honours the PAYWALL_DISABLED env var (set on Vercel for the
  // testing window) AND the user's Stripe status, so flipping a
  // single flag opens the gate everywhere without code edits.
  const accessUser = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { stripeStatus: true },
  });
  if (!hasLessonAccess(accessUser)) redirect("/dashboard?payment=needed");

  const module = await prisma.module.findFirst({
    where: { weekNumber: 1 },
  });

  const childProfile = await prisma.childProfile.findFirst({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={nunito.className}>
      <LessonGate
        userName={session.user.name ?? "Cyber Hero"}
        moduleId={module?.id ?? ""}
        childName={childProfile?.childName ?? session.user.name ?? "Cyber Hero"}
      />
    </div>
  );
}
