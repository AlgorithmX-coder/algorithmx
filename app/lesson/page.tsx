import { Nunito } from "next/font/google";
import { requireCourse } from "@/app/lib/courseAccess";
import { prisma } from "@/app/lib/prisma";
import LessonGate from "./LessonGate";
import { resolveActiveChildProfileId } from "@/app/lib/progressService";

const nunito = Nunito({ subsets: ["latin"] });

export default async function LessonPage() {
  // Gate: must be signed in AND entitled to the cyber-heroes product.
  const { session } = await requireCourse("cyber-heroes", "/lesson");

  // Fetch the cyber-heroes week-1 CourseContent. We resolve via the
  // product slug so we never hard-code productIds in the page layer.
  const courseContent = await prisma.courseContent.findFirst({
    where: { product: { slug: "cyber-heroes" }, week: 1 },
    select: { id: true },
  });

  // Active child profile (most-recently-created). May be null on first
  // visit before the parent has set up a child — fall back to the
  // signed-in user's name so the title screen still has something to
  // show.
  const activeChildId = await resolveActiveChildProfileId(session.user.id);
  const childProfile = activeChildId
    ? await prisma.childProfile.findUnique({
        where: { id: activeChildId },
        select: { name: true },
      })
    : null;

  return (
    <div className={nunito.className}>
      <LessonGate
        userName={session.user.name ?? "Cyber Hero"}
        moduleId={courseContent?.id ?? ""}
        childName={childProfile?.name ?? session.user.name ?? "Cyber Hero"}
      />
    </div>
  );
}
