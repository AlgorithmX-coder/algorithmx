import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { DB_TO_TRACK, deskOf, firstNameOf } from "@/app/lib/aiCleared";
import { CYBER_SECURED_NAME, SECURED_TRACKS } from "@/app/lib/cyberSecured";
import { COURSES } from "../../engine/courses";
import Frame from "../../Frame";
import CourseAside from "../../CourseAside";
import JoinForm from "../../JoinForm";

/* /ai-cleared/join/[token]: the invite landing for a Cyber Secured seat.
 * Signed out, it explains and links to sign-in with a return path; signed
 * in, it shows the job-title picker and claims the seat, which opens every
 * track at once. No track waits on another. */
export const dynamic = "force-dynamic";

/* The learner notice (DRAFT for the solicitor, held on the legal drafts
 * branch): what happens to what a person types, and what their admin
 * sees. Shown before they sign in and again on the claim step. */
function LearnerNotice() {
  return (
    <p className="cf-note">
      Before you start: in AI Cleared and AI Fluent, what you type into a practice is sent to our AI model provider to grade it and to reply, under our <Link href="/corporate/dpa">processor terms</Link>. It is never used to train the model, and we do not keep the conversation; we keep your progress and scores. Every practice uses invented data, so do not type anything real. Your firm&rsquo;s admin sees how far you have got on each course, module by module, and when you were last active, never what you type. A prompt you save to your AI Fluent playbook is private to you.
    </p>
  );
}

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const seat = await prisma.seat.findUnique({ where: { inviteToken: token }, include: { org: { include: { profile: { select: { escalationContact: true, escalationRole: true } } } } } });

  if (!seat) {
    return (
      <Frame>
        <span className="cf-eyebrow">Invite link</span>
        <h1 className="cf-h1">That invite link is not valid.</h1>
        <p className="cf-lead">Ask your firm&rsquo;s admin for a fresh one. If you already have a seat, go straight to your courses.</p>
        <Link href="/ai-cleared" className="cf-btn cf-btn-pri">Go to my courses</Link>
      </Frame>
    );
  }

  /* Where the claim lands. An old Fluent invite still lands on Fluent. */
  const course = seat.course === "AI_FLUENT" ? COURSES["ai-fluent"] : COURSES["ai-cleared"];
  const session = await auth();
  const here = `/ai-cleared/join/${encodeURIComponent(token)}`;
  const contact = seat.org.profile?.escalationContact ?? seat.org.contactName;
  const role = seat.org.profile?.escalationRole ?? seat.org.contactRole;
  const aside = (learnerName?: string) => <CourseAside course={course.slug} firmName={seat.org.name} contactName={contact} contactRole={role} learnerName={learnerName} showWindow />;
  const tracks = SECURED_TRACKS.filter((t) => t.live);

  if (!session?.user?.id) {
    return (
      <Frame course={course.slug} firmName={seat.org.name} meta={<span className="cf-meta">Invited as {seat.email}</span>} aside={aside()}>
        <span className="cf-eyebrow">Your seat is reserved</span>
        <h1 className="cf-h1">{seat.org.name} has a seat waiting for you on <span className="cf-grad">{CYBER_SECURED_NAME}</span>.</h1>
        <p className="cf-lead">One seat opens every course below. Take them in any order, whenever suits, and stop and resume as you like.</p>
        <ul className="cf-lead" style={{ margin: "0 0 18px", paddingLeft: 20 }}>
          {tracks.map((t) => (
            <li key={t.slug}><b>{t.name}</b>: {t.line}</li>
          ))}
        </ul>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/signup?callbackUrl=${encodeURIComponent(here)}`} className="cf-btn cf-btn-pri">Create an account</Link>
          <Link href={`/login?callbackUrl=${encodeURIComponent(here)}`} className="cf-btn">I already have one</Link>
        </div>
        <p className="cf-note" style={{ marginTop: 18 }}>Use your work email, so your firm&rsquo;s admin can see your progress against your name.</p>
        <LearnerNotice />
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

  if (seat.userId === session.user.id && seat.claimedAt) redirect("/cyber-secured");

  const first = firstNameOf(session.user.name, session.user.email);
  const preset = seat.trackHint ? DB_TO_TRACK[seat.trackHint] : await deskOf(session.user.id);
  return (
    <Frame course={course.slug} firmName={seat.org.name} meta={<span className="cf-meta">{session.user.email}</span>} aside={aside(first)}>
      <span className="cf-eyebrow">One question, then you are in</span>
      <h1 className="cf-h1">Welcome, {first}. What do you <span className="cf-grad">do</span> at {seat.org.name}?</h1>
      <p className="cf-lead">
        Everyone learns the same habits. Your job title picks the desk the practice happens on in every course, so the invoices, emails and documents look like the ones you actually handle.
      </p>
      <JoinForm token={token} orgName={seat.org.name} presetTrack={preset} course={course.slug} />
      <LearnerNotice />
    </Frame>
  );
}
