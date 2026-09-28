import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { DB_TO_TRACK, firstNameOf } from "@/app/lib/aiCleared";
import Frame from "../../Frame";
import CourseAside from "../../CourseAside";
import JoinForm from "../../JoinForm";

/* /ai-cleared/join/[token]: the invite landing. Signed out, it explains
 * and links to sign-in with a return path; signed in, it shows the
 * job-title picker and claims the seat. */
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

  const session = await auth();
  const here = `/ai-cleared/join/${encodeURIComponent(token)}`;
  const contact = seat.org.profile?.escalationContact ?? seat.org.contactName;
  const role = seat.org.profile?.escalationRole ?? seat.org.contactRole;

  if (!session?.user?.id) {
    return (
      <Frame firmName={seat.org.name} meta={<span className="cf-meta">Invited as {seat.email}</span>} aside={<CourseAside firmName={seat.org.name} contactName={contact} contactRole={role} showWindow />}>
        <span className="cf-eyebrow">Your seat is reserved</span>
        <h1 className="cf-h1">{seat.org.name} has a seat waiting for you on <span className="cf-grad">AI Cleared</span>.</h1>
        <p className="cf-lead">
          About ninety minutes, in five short modules, on a desk that looks like yours. You practise inside a copy of the AI tool your firm uses, on invented data, and a grader checks every prompt before the AI sees it.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href={`/signup?callbackUrl=${encodeURIComponent(here)}`} className="cf-btn cf-btn-pri">Create an account</Link>
          <Link href={`/login?callbackUrl=${encodeURIComponent(here)}`} className="cf-btn">I already have one</Link>
        </div>
        <p className="cf-note" style={{ marginTop: 18 }}>Use your work email, so your certificate carries the right name.</p>
      </Frame>
    );
  }

  if (seat.userId && seat.userId !== session.user.id) {
    return (
      <Frame firmName={seat.org.name}>
        <span className="cf-eyebrow">Invite link</span>
        <h1 className="cf-h1">That seat has already been claimed.</h1>
        <p className="cf-lead">Ask your firm&rsquo;s admin for your own invite link.</p>
      </Frame>
    );
  }

  if (seat.userId === session.user.id && seat.claimedAt) redirect("/ai-cleared");

  const first = firstNameOf(session.user.name, session.user.email);
  return (
    <Frame firmName={seat.org.name} meta={<span className="cf-meta">{session.user.email}</span>} aside={<CourseAside firmName={seat.org.name} contactName={contact} contactRole={role} learnerName={first} showWindow />}>
      <span className="cf-eyebrow">One question, then you are in</span>
      <h1 className="cf-h1">Welcome, {first}. What do you <span className="cf-grad">do</span> at {seat.org.name}?</h1>
      <p className="cf-lead">
        Everyone learns the same habits. Your job title picks the desk the practice happens on, so the invoices, emails and documents look like the ones you actually handle.
      </p>
      <JoinForm token={token} orgName={seat.org.name} presetTrack={seat.trackHint ? DB_TO_TRACK[seat.trackHint] : null} />
    </Frame>
  );
}
