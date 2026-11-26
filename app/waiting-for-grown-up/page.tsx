import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import BrightPage from "@/app/components/bright/BrightPage";
import CourseSignOut from "@/app/components/CourseSignOut";
import { awaitingParent } from "@/app/lib/parentConsent";
import { maskEmail } from "@/app/lib/ageCheck";
import { consumerCourse } from "@/app/lib/consumerCatalogue";
import { CATALOGUE } from "@/app/lib/courseIntent";
import { resendParentEmailAction } from "./actions";

/**
 * /waiting-for-grown-up: where a child under 13 lands, from any course,
 * until a parent has said yes (requireCourse sends them here; the tester
 * switch does not get round it). Calm and short: who we emailed, what
 * happens next, a way to send the email again.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "Waiting for your grown-up | AlgorithmX", robots: { index: false, follow: false } };

export default async function WaitingForGrownUp({ searchParams }: { searchParams: Promise<{ sent?: string; wait?: string }> }) {
  const { sent, wait } = await searchParams;
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      parentEmail: true,
      needsParentConsent: true,
      parentConsentAt: true,
      parentConsentTokens: { orderBy: { createdAt: "desc" }, take: 1, select: { courseSlug: true } },
    },
  });
  const course = consumerCourse(user?.parentConsentTokens[0]?.courseSlug);
  if (!awaitingParent(user)) redirect(course?.home ?? CATALOGUE);

  const first = (user?.name ?? "").trim().split(/\s+/)[0] || "Cyber Explorer";
  const signOutCourse = course?.slug === "cyberstart" ? "cyberstart" : "cyberexplorers";

  return (
    <BrightPage eyebrow="Nearly there" title={<>Waiting for your grown-up, {first}</>}>
      <p>
        Before you start, a parent or carer needs to say yes. We have sent them an email
        {user?.parentEmail ? <> at <b>{maskEmail(user.parentEmail)}</b></> : null}.
      </p>
      <p>When they say yes, {course ? course.name : "your course"} opens right here. You do not need to do anything else.</p>

      {sent === "1" && <p className="axbright-ok">Sent again. Ask your grown-up to check their inbox, and their junk folder too.</p>}
      {wait === "1" && <p className="axbright-warn">We only just sent one. Give it a couple of minutes, then try again.</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
        <Link href={course?.home ?? CATALOGUE} className="axbright-btn">
          My grown-up said yes
        </Link>
        <form action={resendParentEmailAction}>
          <button type="submit" className="axbright-ghost">
            Send the email again
          </button>
        </form>
      </div>

      <div className="axbright-small" style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span>Not you?</span>
        <CourseSignOut course={signOutCourse} className="axbright-ghost">
          Sign out
        </CourseSignOut>
      </div>
    </BrightPage>
  );
}
