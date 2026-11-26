import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import SchoolBrand from "@/app/schools/SchoolBrand";
import CampusShell, { BackLink } from "@/app/components/campus-console/CampusShell";
import TeacherJoinButton from "./TeacherJoinButton";
import { findStaffLink, judgeStaffLink } from "@/app/lib/staffLink";
import { wordsFor } from "@/app/schools/words";
import SignOut from "@/app/schools/SignOut";

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

export default async function SchoolJoinPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { token } = await params;
  const invite = await prisma.teacherInvite.findUnique({ where: { inviteToken: token }, include: { org: { select: { name: true } } } });

  /* Not a per-email invite: the school's one staff join link, if it is one. */
  if (!invite && token.startsWith("staff-")) {
    const raw = (await searchParams).confirm;
    return <StaffLinkLanding token={token} confirm={typeof raw === "string" ? raw : undefined} />;
  }

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

/**
 * The landing for a school's one staff join link (app/lib/staffLink.ts).
 *
 * Same room as a per-email invite, different words: nobody was invited by
 * name, so the page says which school it is and, on a link locked to the
 * school's domain, which addresses it takes. Every branch below is decided
 * by judgeStaffLink, the same function the join itself runs, so the page
 * cannot offer a button the server will then refuse.
 */
async function StaffLinkLanding({ token, confirm }: { token: string; confirm?: string }) {
  const target = await findStaffLink(token);
  if (!target) {
    return <Trouble head="That link is not valid any more" body="It may have been replaced by a newer one. Ask whoever sent it for the new link." back />;
  }
  const w = wordsFor(target.kind);
  const here = `/schools/join/${encodeURIComponent(token)}${confirm ? `?confirm=${encodeURIComponent(confirm)}` : ""}`;
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Room meta={<span className="r6-meta">{w.Staff} link</span>}>
        <p className="r6-eyebrow pill" {...rise(0)}>{target.lockedTo ? `For @${target.lockedTo} addresses` : `${w.Staff} link`}</p>
        <h1 className="r6-title" id="r6-title" {...rise(1)}>Join <span className="grad">{target.orgName}</span> as a {w.staff}</h1>
        <p className="r6-sub" {...rise(2)}>
          {target.lockedTo
            ? `Sign in or create an account with your @${target.lockedTo} address. We send a quick email to that address to check it is yours, then you land on your own ${w.groups}.`
            : `Sign in or create an account, then you land on your own ${w.groups}, ready to add ${w.people}.`}
        </p>
        <div className="r6-actions" {...rise(3)}>
          <Link href={`/signup?callbackUrl=${encodeURIComponent(here)}`} className="r6-btn pri"><span className="lbl">Create an account</span><GoArrow /></Link>
          <Link href={`/login?callbackUrl=${encodeURIComponent(here)}`} className="r6-btn ghost"><span className="lbl">I already have one</span></Link>
        </div>
      </Room>
    );
  }

  const verdict = await judgeStaffLink(token, session.user.id, confirm);
  const me = session.user.email ?? "";

  if (verdict.state === "refused") {
    if (verdict.why === "closed") {
      return <Trouble head={`Access for ${target.orgName} is closed`} body="Ask whoever sent you the link." back />;
    }
    if (verdict.why === "pupil") {
      return <Trouble head={`A ${w.person} account cannot join as a ${w.staff}`} body="Sign out, then open the link again and sign in with your own account." back />;
    }
    if (verdict.why === "wrong_domain") {
      return (
        <Room meta={<span className="r6-meta">{me}</span>}>
          <p className="r6-msg err" role="alert" {...rise(0)}>{WARN}<span>This link is for @{target.lockedTo} addresses</span></p>
          <h1 className="r6-title" id="r6-title" {...rise(1)}>Use your {target.orgName} address</h1>
          <p className="r6-sub" {...rise(2)}>
            You are signed in as {me}. Sign out, open the link again and sign in with your @{target.lockedTo} address.
            If you do not have one, ask whoever sent the link for a personal invite.
          </p>
          <div className="r6-actions" {...rise(3)}><SignOut className="r6-btn ghost" /></div>
        </Room>
      );
    }
    return <Trouble head="That link is not valid any more" body="Ask whoever sent it for the new link." back />;
  }

  if (verdict.state === "already") {
    return (
      <Room meta={<span className="r6-meta">{me}</span>}>
        <p className="r6-eyebrow pill" {...rise(0)}><span className="r6-dot" aria-hidden="true" />{me}</p>
        <h1 className="r6-title" id="r6-title" {...rise(1)}>You are already in at <span className="grad">{target.orgName}</span></h1>
        <p className="r6-sub" {...rise(2)}>Nothing to do. Your {w.groups} are where you left them.</p>
        <div className="r6-actions" {...rise(3)}><Link href="/schools/overview" className="r6-btn pri"><span className="lbl">Go to my {w.groups}</span><GoArrow /></Link></div>
      </Room>
    );
  }

  const byEmail = verdict.state === "confirm_by_email";
  return (
    <Room meta={<span className="r6-meta">{me}</span>}>
      <p className="r6-eyebrow pill" {...rise(0)}><span className="r6-dot" aria-hidden="true" />{me}</p>
      <h1 className="r6-title" id="r6-title" {...rise(1)}>Join <span className="grad">{target.orgName}</span> as a {w.staff}</h1>
      <p className="r6-sub" {...rise(2)}>
        {byEmail
          ? `This link is for @${target.lockedTo} addresses, so we check yours first. Press the button and we email ${me} a link that finishes joining.`
          : `One click sets up your ${w.staff} account. You get your own ${w.groups}, and every ${w.person} you add uses a place from the ${w.noun}'s shared pool.`}
      </p>
      <div {...rise(3)}>
        <TeacherJoinButton
          token={token}
          orgName={target.orgName}
          confirm={byEmail ? undefined : confirm}
          label={byEmail ? `Email me a link to confirm` : `Set up my ${w.staff} account at ${target.orgName}`}
        />
      </div>
    </Room>
  );
}
