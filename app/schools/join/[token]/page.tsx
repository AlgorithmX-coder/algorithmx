import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import SchoolBrand from "@/app/schools/SchoolBrand";
import CampusShell, { BackLink } from "@/app/components/campus-console/CampusShell";
import TeacherJoinButton from "./TeacherJoinButton";

/* /schools/join/[token]: the teacher invite landing. Signed out, it
 * explains and links to sign-in with a return path; signed in, one
 * button claims the invite. Mirrors /ai-cleared/join/[token], without
 * the job-title picker a teacher has no use for. The look is the round 6
 * Campus Console; the lookups and branches are unchanged. */
export const dynamic = "force-dynamic";

const WARN = (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></svg>
);
const rise = (i: number) => ({ "data-rise": "", style: { "--i": i } as CSSProperties });

function Room({ meta, children }: { meta?: ReactNode; children: ReactNode }) {
  return (
    <CampusShell
      family="schools"
      page="join"
      lockup={<span className="r6-brand"><SchoolBrand /></span>}
      lockupHref="/schools"
      lockupLabel="Cyber School by AlgorithmX"
      right={<>{meta}<BackLink href="/schools">AlgorithmX for Schools</BackLink></>}
      width={464}
    >
      {children}
    </CampusShell>
  );
}

function Trouble({ head, body, back }: { head: string; body: string; back: boolean }) {
  return (
    <Room>
      <p className="r6-msg err" role="alert" aria-live="polite" {...rise(0)}>{WARN}<span>{head}</span></p>
      <h1 className="r6-title" id="r6-title" {...rise(1)}>{head}</h1>
      <p className="r6-sub" {...rise(2)}>{body}</p>
      {back && <div className="r6-actions" {...rise(3)}><Link className="r6-btn ghost" href="/schools"><span className="lbl">Back to schools</span></Link></div>}
    </Room>
  );
}

export default async function SchoolJoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await prisma.teacherInvite.findUnique({ where: { inviteToken: token }, include: { org: { select: { name: true } } } });

  if (!invite) return <Trouble head="That invite link is not valid" body="Ask AlgorithmX for a fresh one." back />;

  const session = await auth();
  const here = `/schools/join/${encodeURIComponent(token)}`;

  if (!session?.user?.id) {
    return (
      <Room meta={<span className="r6-meta">Invited as {invite.email}</span>}>
        <p className="r6-eyebrow pill" {...rise(0)}>Invited as {invite.email}</p>
        <h1 className="r6-title" id="r6-title" {...rise(1)}><span className="grad">{invite.org.name}</span> has a teacher place waiting for you</h1>
        <p className="r6-sub" {...rise(2)}>Set up your account, then you land on your classes page ready to add children.</p>
        <div className="r6-actions" {...rise(3)}>
          <Link href={`/signup?callbackUrl=${encodeURIComponent(here)}`} className="r6-btn pri"><span className="lbl">Create an account</span><GoArrow /></Link>
          <Link href={`/login?callbackUrl=${encodeURIComponent(here)}`} className="r6-btn ghost"><span className="lbl">I already have one</span></Link>
        </div>
      </Room>
    );
  }

  if (invite.userId && invite.userId !== session.user.id) {
    return <Trouble head="That invite has already been claimed" body="Ask AlgorithmX for your own invite link." back />;
  }

  return (
    <Room meta={<span className="r6-meta">{session.user.email}</span>}>
      <p className="r6-eyebrow pill" {...rise(0)}><span className="r6-dot" aria-hidden="true" />{session.user.email}</p>
      <h1 className="r6-title" id="r6-title" {...rise(1)}>Welcome to <span className="grad">{invite.org.name}</span></h1>
      <p className="r6-sub" {...rise(2)}>One click sets up your teacher account. You can add more teachers and your first class once you are in.</p>
      <div {...rise(3)}><TeacherJoinButton token={token} orgName={invite.org.name} /></div>
    </Room>
  );
}

function GoArrow() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>;
}
