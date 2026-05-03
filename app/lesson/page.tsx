import { Nunito } from "next/font/google";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import LessonPlayer from "./LessonPlayer";

const nunito = Nunito({ subsets: ["latin"] });

export default async function LessonPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Paywall gate — only enrolled users (Stripe webhook flipped them
  // to active/paid) can play.  Everyone else gets bounced to the
  // dashboard, which now shows the £99 upsell card.
  const accessUser = await prisma.user.findUnique({
    where: { id: session.user.id! },
    select: { stripeStatus: true },
  });
  const hasAccess =
    accessUser?.stripeStatus === "active" ||
    accessUser?.stripeStatus === "paid";
  if (!hasAccess) redirect("/dashboard?payment=needed");

  const module = await prisma.module.findFirst({
    where: { weekNumber: 1 },
  });

  const childProfile = await prisma.childProfile.findFirst({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={nunito.className}>
      <LessonPlayer
        userName={session.user.name ?? "Cyber Hero"}
        moduleId={module?.id ?? ""}
        childName={childProfile?.childName ?? session.user.name ?? "Cyber Hero"}
      />
    </div>
  );
}
