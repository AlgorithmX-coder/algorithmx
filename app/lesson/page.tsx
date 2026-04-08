import { Nunito } from "next/font/google";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import LessonGame from "./LessonGame";

const nunito = Nunito({ subsets: ["latin"] });

export default async function LessonPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!prisma) redirect("/dashboard");

  const module = await prisma.module.findFirst({
    where: { weekNumber: 1 },
  });

  return (
    <div className={nunito.className}>
      <LessonGame
        userName={session.user.name ?? "Cyber Hero"}
        moduleId={module?.id ?? ""}
      />
    </div>
  );
}
