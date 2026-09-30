import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { DB_TO_TRACK, clearedTrackOf, firstNameOf, hasValidClearedCertificate } from "@/app/lib/aiCleared";
import { courseByKey } from "../../engine/courses";
import Frame from "../../Frame";
import CourseAside from "../../CourseAside";
import JoinForm from "../../JoinForm";

/* /ai-cleared/join/[token]: the invite landing for both courses. Signed
 * out, it explains and links to sign-in with a return path; signed in, it
 * shows the job-title picker and claims the seat. A Fluent seat checks
 * for a valid Cleared certificate before the picker appears. */
export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const seat = await prisma.seat.findUnique({ where: { inviteToken: token }, include: { org: { include: { profile: { select: { escalationContact: true, escalationRole: true } } } } } });

  if (!seat) {
    return (
      <Frame>
        <span className="cf-eyebrow">Invite link</span>
        <h1 className="cf-h1">That invite link is not valid.</h1>
        <p className="cf-lead">Ask your firm&rsquo;s admin for a fresh one. If you already have a seat, go straight to your course.</p>
        <Link href="/ai-cleared" className="cf-btn cf-btn-pri">Go to my course</Link>
      </Frame>
    );
  }

  const course = courseByKey(seat.course);
  const fluent = course.slug === "ai-fluent";
  const session = await auth();
  const here = `/ai-cleared/join/${encodeURIComponent(token)}`;
  const contact = seat.org.profile?.escalationContact ?? seat.org.contactName;
  const role = seat.org.profile?.escalationRole ?? seat.org.contactRole;
  const aside = (learnerName?: string) => <CourseAside course={course.slug} firmName={seat.org.name} contactName={contact} contactRole={role} learnerName={learnerName} showWindow />;

  if (!session?.user?.id) {
    return (
      <Frame course={course.slug} firmName={seat.org.name} meta={<span className="cf-meta">Invited as {seat.email}</span>} aside={aside()}>
        <span className="cf-eyebrow">Your seat is reserved</span>
        <h1 className="cf-h1">{seat.org.name} has a seat waiting for you on <span className="cf-grad">{course.name}</span>.</h1>
        <p className="cf-lead">
          {fluent
            ? "About three hours, in nine short modules, on getting real work out of the AI tool your firm uses: prompting that works, the five workflows, verification as a habit, and a real task on a desk that looks like yours. You keep a playbook of the prompts that worked. Fluent opens with a valid AI Cleared certificate on your login."
            : "About ninety minutes, in five short modules, on a desk that looks like yours. You practise inside a copy of the AI tool your firm uses, on invented data, and a grader checks every prompt before the AI sees it."}
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/signup?callbackUrl=${encodeURIComponent(here)}`} className="cf-btn cf-btn-pri">Create an account</Link>
          <Link href={`/login?callbackUrl=${encodeURIComponent(here)}`} className="cf-btn">I already have one</Link>
        </div>
        <p className="cf-note" style={{ marginTop: 18 }}>{fluent ? "Sign in with the account that holds your AI Cleared certificate." : "Use your work email, so your certificate carries the right name."}</p>
      </Frame>
    );
  }

  if (seat.userId && seat.userId !== session.user.id) {
    return (
      <Frame course={course.slug} firmName={seat.org.name}>
        <span className="cf-eyebrow">Invite link</span>
        <h1 className="cf-h1">That seat has already been claimed.</h1>
        <p className="cf-lead">Ask your firm&rsquo;s admin for your own invite link.</p>
      </Frame>
    );
  }

  if (seat.userId === session.user.id && seat.claimedAt) redirect(course.base);

  const first = firstNameOf(session.user.name, session.user.email);

  if (fluent && !(await hasValidClearedCertificate(session.user.id))) {
    return (
      <Frame course={course.slug} firmName={seat.org.name} meta={<span className="cf-meta">{session.user.email}</span>} aside={aside(first)}>
        <span className="cf-eyebrow">One thing first</span>
        <h1 className="cf-h1">AI Fluent opens with your <span className="cf-grad">AI Cleared</span> certificate, {first}.</h1>
        <p className="cf-lead">
          This login does not hold a valid AI Cleared certificate yet. Fluent builds on the habits Cleared teaches, so finish Cleared first, then open this link again and your Fluent seat at {seat.org.name} is waiting.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/ai-cleared" className="cf-btn cf-btn-pri">Go to AI Cleared</Link>
        </div>
        <p className="cf-note" style={{ marginTop: 18 }}>Took Cleared under a different email? Sign in with that account and open this link there, or ask your admin to send the Fluent invite to it.</p>
      </Frame>
    );
  }

  const preset = seat.trackHint ? DB_TO_TRACK[seat.trackHint] : fluent ? await clearedTrackOf(session.user.id) : null;
  return (
    <Frame course={course.slug} firmName={seat.org.name} meta={<span className="cf-meta">{session.user.email}</span>} aside={aside(first)}>
      <span className="cf-eyebrow">One question, then you are in</span>
      <h1 className="cf-h1">Welcome, {first}. What do you <span className="cf-grad">do</span> at {seat.org.name}?</h1>
      <p className="cf-lead">
        {fluent
          ? "Same desk as your Cleared course unless you change it. Your job title picks the desk the real task in Module 9 happens on, so the documents, sheets and emails look like the ones you actually handle."
          : "Everyone learns the same habits. Your job title picks the desk the practice happens on, so the invoices, emails and documents look like the ones you actually handle."}
      </p>
      <JoinForm token={token} orgName={seat.org.name} presetTrack={preset} course={course.slug} />
    </Frame>
  );
}
