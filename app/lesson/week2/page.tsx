import { Nunito } from "next/font/google";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import Week2Player from "./Week2Player";

const nunito = Nunito({ subsets: ["latin"] });

export default async function Week2Page() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const module = await prisma.module.findFirst({
    where: { weekNumber: 2 },
  });

  const childProfile = await prisma.childProfile.findFirst({
    where: { userId: session.user.id! },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className={nunito.className}>
      <Week2Player
        userName={session.user.name ?? "Cyber Hero"}
        moduleId={module?.id ?? ""}
        childName={childProfile?.childName ?? session.user.name ?? "Cyber Hero"}
      />
    </div>
  );
}
