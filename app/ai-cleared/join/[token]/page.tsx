import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { DB_TO_TRACK, deskOf, firstNameOf } from "@/app/lib/aiCleared";
import { CYBER_SECURED_NAME, SECURED_TRACKS } from "@/app/lib/cyberSecured";
import { findTeamOrg } from "@/app/lib/firmTeamLink";
import { COURSES } from "../../engine/courses";
import JoinForm from "../../JoinForm";
import { Aside, DeadLink, GO, Room, rise } from "./parts";
import { R8_ICON } from "@/app/components/dead-end/DeadEnd";
import TeamJoin from "./TeamJoin";

/* /ai-cleared/join/[token]: the invite landing for a Cyber Secured seat.
 * Signed out, it explains and links to sign-in with a return path; signed
 * in, it shows the job-title picker and claims the seat, which opens every
 * track at once. No track waits on another. The look is the round 6 Campus
 * Console (firm family: the corporate graphite with the office pulse); the
 * lookups, branches and redirects are unchanged. A link that cannot be
 * used (an unknown token, a seat someone else claimed) is the round 8
 * light dead end, DeadLink.
 *
 * The same address serves a firm's team link: a token that is not a seat's
 * is looked up as a firm's teamToken, and TeamJoin takes over. */
export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const seat = await prisma.seat.findUnique({ where: { inviteToken: token }, include: { org: { include: { profile: { select: { escalationContact: true, escalationRole: true } } } } } });

  if (!seat) {
    const teamOrg = await findTeamOrg(token);
    if (teamOrg) return <TeamJoin org={teamOrg} token={token} />;
    return (
      <DeadLink
        eyebrow="Invite link"
        head="That link is not working any more."
        body="It may have been replaced with a new one. Ask whoever sent it to you for the latest link. If you already have a seat, go straight to your courses."
        actions={<Link href="/ai-cleared" className="r8-btn">Go to my courses{R8_ICON.arrow}</Link>}
      />
    );
  }

  /* Where the claim lands. An old Fluent invite still lands on Fluent. */
  const course = seat.course === "AI_FLUENT" ? COURSES["ai-fluent"] : COURSES["ai-cleared"];
  const session = await auth();
  const here = `/ai-cleared/join/${encodeURIComponent(token)}`;
  const contact = seat.org.profile?.escalationContact ?? seat.org.contactName;
  const role = seat.org.profile?.escalationRole ?? seat.org.contactRole;
  const aside = (learnerName?: string) => <Aside course={course.slug} firmName={seat.org.name} contactName={contact} contactRole={role} learnerName={learnerName} />;
  const tracks = SECURED_TRACKS.filter((t) => t.live);

  if (!session?.user?.id) {
    return (
      <Room firmName={seat.org.name} meta={<span className="r6-meta">Invited as {seat.email}</span>} two>
        <div className="r6-two">
          <div>
            <p className="r6-eyebrow pill" {...rise(0)}>Your seat is reserved</p>
            <h1 className="r6-title" id="r6-title" {...rise(1)}>{seat.org.name} has a seat waiting for you on <span className="grad">{CYBER_SECURED_NAME}</span>.</h1>
            <p className="r6-sub" {...rise(2)}>One seat opens every course below. Take them in any order, whenever suits, and stop and resume as you like.</p>
            <ul className="r6-list" {...rise(3)}>
              {tracks.map((t) => (
                <li key={t.slug}><b>{t.name}</b>: {t.line}</li>
              ))}
            </ul>
            <div className="r6-actions" data-rise="" style={{ "--i": 3, marginTop: 4 } as CSSProperties}>
              <Link href={`/signup?callbackUrl=${encodeURIComponent(here)}`} className="r6-btn pri"><span className="lbl">Create an account</span>{GO}</Link>
              <Link href={`/cyber-secured/login?callbackUrl=${encodeURIComponent(here)}`} className="r6-btn ghost"><span className="lbl">I already have one</span></Link>
            </div>
            <p className="r6-note" {...rise(4)}>Use your work email, so your firm&rsquo;s admin can see your progress against your name.</p>
          </div>
          {aside()}
        </div>
      </Room>
    );
  }

  if (seat.userId && seat.userId !== session.user.id) {
    return <DeadLink eyebrow="Invite link" head="That seat has already been claimed." body="Ask your firm’s admin for your own invite link." />;
  }

  if (seat.userId === session.user.id && seat.claimedAt) redirect("/cyber-secured");

  const first = firstNameOf(session.user.name, session.user.email);
  const preset = seat.trackHint ? DB_TO_TRACK[seat.trackHint] : await deskOf(session.user.id);
  return (
    <Room firmName={seat.org.name} meta={<span className="r6-meta">{session.user.email}</span>} two>
      <div className="r6-two">
        <div>
          <p className="r6-eyebrow pill" {...rise(0)}>One question, then you are in</p>
          <h1 className="r6-title" id="r6-title" {...rise(1)}>Welcome, {first}. What do you <span className="grad">do</span> at {seat.org.name}?</h1>
          <p className="r6-sub" {...rise(2)}>
            Everyone learns the same habits. Your job title picks the desk the practice happens on in every course, so the invoices, emails and documents look like the ones you actually handle.
          </p>
          <div {...rise(3)}>
            <JoinForm token={token} orgName={seat.org.name} presetTrack={preset} course={course.slug} />
          </div>
        </div>
        {aside(first)}
      </div>
    </Room>
  );
}
