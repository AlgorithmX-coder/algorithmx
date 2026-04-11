import { Nunito } from "next/font/google";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import LessonPlayer from "../LessonPlayer";

const nunito = Nunito({ subsets: ["latin"] });

export default async function LessonNewPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const module = await prisma.module.findFirst({
    where: { weekNumber: 1 },
  });

  return (
    <div className={nunito.className}>
      <LessonPlayer
        userName={session.user.name ?? "Cyber Hero"}
        moduleId={module?.id ?? ""}
      />
    </div>
  );
}
