import { Nunito } from "next/font/google";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import LessonPlayer from "../LessonPlayer";
import { hasEntitlement } from "@/app/lib/entitlements";
import { resolveActiveChildProfileId } from "@/app/lib/progressService";

const nunito = Nunito({ subsets: ["latin"] });

export default async function LessonNewPage() {
  // Gate: must be signed in AND entitled to the cyber-heroes product.
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const ok = await hasEntitlement(session.user.id, "cyber-heroes");
  if (!ok) redirect("/hub");

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
      <LessonPlayer
        userName={session.user.name ?? "Cyber Hero"}
        moduleId={courseContent?.id ?? ""}
        childName={childProfile?.name ?? session.user.name ?? "Cyber Hero"}
      />
    </div>
  );
}
