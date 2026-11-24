import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { DB_TO_TRACK, deskOf, firstNameOf } from "@/app/lib/aiCleared";
import { CYBER_SECURED_NAME, SECURED_TRACKS } from "@/app/lib/cyberSecured";
import { moduleListFor } from "@/app/lib/courseModules";
import CampusShell, { BackLink } from "@/app/components/campus-console/CampusShell";
import CorporateBrand from "@/app/corporate/CorporateBrand";
import { COURSES, type CourseSlug } from "../../engine/courses";
import JoinForm from "../../JoinForm";
import SimPreview from "../../SimPreview";

/* /ai-cleared/join/[token]: the invite landing for a Cyber Secured seat.
 * Signed out, it explains and links to sign-in with a return path; signed
 * in, it shows the job-title picker and claims the seat, which opens every
 * track at once. No track waits on another. The look is the round 6 Campus
 * Console (firm family: the corporate graphite with the office pulse); the
 * lookups, branches and redirects are unchanged. */
export const dynamic = "force-dynamic";

const rise = (i: number) => ({ "data-rise": "", style: { "--i": i } as CSSProperties });
const GO = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
const WORDS = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];

/* The room: the Cyber Secured lockup, the firm in the chrome, and the two
 * footer lines the old Frame carried. */
function Room({ firmName, meta, two, children }: { firmName?: string; meta?: ReactNode; two?: boolean; children: ReactNode }) {
  return (
    <CampusShell
      family="firm"
      page="firm-join"
      lockup={<span className="r6-brand"><CorporateBrand /></span>}
      lockupHref="/corporate"
      lockupLabel="Cyber Secured by AlgorithmX"
      right={
        <>
          {meta}
          {firmName && <span className="r6-chip"><span className="dot" aria-hidden="true" />{firmName}</span>}
          <BackLink href="/corporate">Cyber Secured</BackLink>
        </>
      }
      width={two ? 1040 : 500}
      foot={
        <>
          <span>Nothing in the course is real data, and practice chats are never stored.</span>
          <span>Questions about your seat: <a href="mailto:admissions@algorithmx.co.uk">admissions@algorithmx.co.uk</a></span>
        </>
      }
    >
      {children}
    </CampusShell>
  );
}

/* The right-hand context, as the old CourseAside drew it: the firm and who
 * to ask, the course's modules with their minutes, and the live simulator
 * window they will practise in. */
function Aside({ course, firmName, contactName, contactRole, learnerName }: { course: CourseSlug; firmName: string; contactName?: string | null; contactRole?: string | null; learnerName?: string }) {
  const list = moduleListFor(course);
  const total = list.reduce((a, m) => a + m.minutes, 0);
  return (
    <aside className="r6-aside" aria-label="Your firm and the course" {...rise(4)}>
      <div className="r6-card r6-firmcard">
        <span className="r6-avatar" aria-hidden="true">{firmName.slice(0, 1).toUpperCase()}</span>
        <span>
          <b>{firmName}</b>
          <small>{contactName ? `Ask ${contactName}${contactRole ? `, ${contactRole}` : ""}` : `Your firm's ${COURSES[course].name} programme`}</small>
        </span>
      </div>
      <div className="r6-card">
        <div className="r6-cardlabel">{WORDS[list.length] ?? list.length} modules · about {total} minutes</div>
        <ol className="r6-modules">
          {list.map((m) => (
            <li key={m.n}>
              <span className="r6-modn">{m.n}</span>
              <span className="r6-modt">{m.title}</span>
              <span className="r6-modm">{m.minutes} min</span>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <div className="r6-window sim" inert>
          <div className="r6-simscale"><SimPreview firmName={firmName} learnerName={learnerName ?? "you"} /></div>
        </div>
        <div className="r6-wcap">Where you practise: a copy of your firm&rsquo;s tool, on practice data</div>
      </div>
    </aside>
  );
}

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const seat = await prisma.seat.findUnique({ where: { inviteToken: token }, include: { org: { include: { profile: { select: { escalationContact: true, escalationRole: true } } } } } });

  if (!seat) {
    return (
      <Room>
        <p className="r6-eyebrow pill" {...rise(0)}>Invite link</p>
        <h1 className="r6-title" id="r6-title" {...rise(1)}>That invite link is not valid.</h1>
        <p className="r6-sub" {...rise(2)}>Ask your firm&rsquo;s admin for a fresh one. If you already have a seat, go straight to your courses.</p>
        <div className="r6-actions" {...rise(3)}>
          <Link href="/ai-cleared" className="r6-btn pri"><span className="lbl">Go to my courses</span>{GO}</Link>
        </div>
      </Room>
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
              <Link href={`/login?callbackUrl=${encodeURIComponent(here)}`} className="r6-btn ghost"><span className="lbl">I already have one</span></Link>
            </div>
            <p className="r6-note" {...rise(4)}>Use your work email, so your firm&rsquo;s admin can see your progress against your name.</p>
          </div>
          {aside()}
        </div>
      </Room>
    );
  }

  if (seat.userId && seat.userId !== session.user.id) {
    return (
      <Room firmName={seat.org.name}>
        <p className="r6-eyebrow pill" {...rise(0)}>Invite link</p>
        <h1 className="r6-title" id="r6-title" {...rise(1)}>That seat has already been claimed.</h1>
        <p className="r6-sub" {...rise(2)}>Ask your firm&rsquo;s admin for your own invite link.</p>
      </Room>
    );
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
