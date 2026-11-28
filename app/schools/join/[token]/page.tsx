import type { ReactNode } from "react";
import Link from "next/link";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TeacherJoinButton from "./TeacherJoinButton";
import { findStaffLink, judgeStaffLink } from "@/app/lib/staffLink";
import { wordsFor } from "@/app/schools/words";
import SignOut from "@/app/schools/SignOut";
import DeadEnd, { R8_ICON, type R8Glyph } from "@/app/components/dead-end/DeadEnd";

/* /schools/join/[token]: the teacher invite landing. Signed out, it
 * explains and links to sign-in with a return path; signed in, one
 * button claims the invite. Mirrors /ai-cleared/join/[token], without
 * the job-title picker a teacher has no use for. The lookups and branches
 * are unchanged.
 *
 * Every state is the round 8 light house (owner, 2026-11-25: invite pages
 * are bright), drawn by DeadEnd: a valid invite is a waving room, a link
 * that cannot be used is the unlink dead end (Trouble), a staff link the
 * signed-in address cannot use is a lock.
 *
 * The signed-in address shows ONCE (owner, 2026-11-27): in the "Signed in
 * as" strip at the foot of the panel, beside Sign out. The eyebrow names
 * the context instead. The one exception is the signed-out per-email room,
 * whose eyebrow is the invited address, because that address is the point
 * of that screen and appears nowhere else on it. School names are shown
 * exactly as staff typed them. */
export const dynamic = "force-dynamic";

/** The "Signed in as" strip, with the school portal's own Sign out. */
function whoFor(email: string | null) {
  return {
    label: email ? <>Signed in as <b>{email}</b></> : "Signed in",
    signOut: <SignOut className="r8-btn" kind="ghost" />,
  };
}

/** A room for a link that works: the light house, the school accent. */
function Room({
  eyebrow,
  title,
  actions,
  email,
  glyph = "wave",
  err = false,
  children,
}: {
  eyebrow: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  /** The signed-in adult, when there is one: drawn in the strip, nowhere else. */
  email?: string | null;
  glyph?: R8Glyph;
  err?: boolean;
  children?: ReactNode;
}) {
  return (
    <DeadEnd
      tone="school"
      lockup="school"
      back={{ href: "/schools", label: "AlgorithmX for Schools" }}
      eyebrow={eyebrow}
      err={err}
      title={title}
      glyph={glyph}
      actions={actions}
      who={email === undefined ? undefined : whoFor(email)}
    >
      {children}
    </DeadEnd>
  );
}

/** Create an account / I already have one, both coming back here. */
function SignInActions({ here }: { here: string }) {
  return (
    <>
      <Link className="r8-btn" href={`/signup?callbackUrl=${encodeURIComponent(here)}`}>Create an account{R8_ICON.arrow}</Link>
      <Link className="r8-btn" data-kind="ghost" href={`/login?callbackUrl=${encodeURIComponent(here)}`}>I already have one</Link>
    </>
  );
}

/* A link that cannot be used: the round 8 dead end (landing lab
 * r8-state.html?s=school-join) in the light house. The words are this
 * page's own; `ask` adds the design's mailto for the two cases whose words
 * already say to ask AlgorithmX. */
function Trouble({ eyebrow, head, body, back, ask = false }: { eyebrow: string; head: string; body: string; back: boolean; ask?: boolean }) {
  return (
    <DeadEnd
      tone="school"
      lockup="school"
      back={{ href: "/schools", label: "AlgorithmX for Schools" }}
      err
      eyebrow={eyebrow}
      title={head}
      glyph="unlink"
      actions={
        ask || back ? (
          <>
            {ask && <a className="r8-btn" href="mailto:admissions@algorithmx.co.uk">Ask for a new link{R8_ICON.arrow}</a>}
            {back && <Link className="r8-btn" data-kind="ghost" href="/schools">Back to schools</Link>}
          </>
        ) : undefined
      }
    >
      <p>{body}</p>
    </DeadEnd>
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

  if (!invite) return <Trouble eyebrow="Teacher invite" head="That invite link is not valid" body="Ask AlgorithmX for a fresh one." back ask />;

  const session = await auth();
  const here = `/schools/join/${encodeURIComponent(token)}`;

  if (!session?.user?.id) {
    return (
      <Room
        eyebrow={<span>Invited as <span data-case="keep">{invite.email}</span></span>}
        title={`${invite.org.name} has a teacher place waiting for you`}
        actions={<SignInActions here={here} />}
      >
        <p>Set up your account, then you land on your classes page ready to add children.</p>
      </Room>
    );
  }

  if (invite.userId && invite.userId !== session.user.id) {
    return <Trouble eyebrow="Teacher invite" head="That invite has already been claimed" body="Ask AlgorithmX for your own invite link." back ask />;
  }

  return (
    <Room
      eyebrow="Teacher invite"
      title={`Welcome to ${invite.org.name}`}
      email={session.user.email ?? null}
      actions={<TeacherJoinButton token={token} orgName={invite.org.name} />}
    >
      <p>One click sets up your teacher account. You can add more teachers and your first class once you are in.</p>
    </Room>
  );
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
    return <Trouble eyebrow="Teacher invite" head="That link is not valid any more" body="It may have been replaced by a newer one. Ask whoever sent it for the new link." back />;
  }
  const w = wordsFor(target.kind);
  const eyebrow = `${w.Staff} link`;
  const here = `/schools/join/${encodeURIComponent(token)}${confirm ? `?confirm=${encodeURIComponent(confirm)}` : ""}`;
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <Room eyebrow={eyebrow} title={`Join ${target.orgName} as a ${w.staff}`} actions={<SignInActions here={here} />}>
        <p>
          {target.lockedTo
            ? `Sign in or create an account with your @${target.lockedTo} address. We send a quick email to that address to check it is yours, then you land on your own ${w.groups}.`
            : `Sign in or create an account, then you land on your own ${w.groups}, ready to add ${w.people}.`}
        </p>
      </Room>
    );
  }

  const verdict = await judgeStaffLink(token, session.user.id, confirm);
  const me = session.user.email ?? "";

  if (verdict.state === "refused") {
    if (verdict.why === "closed") {
      return <Trouble eyebrow={eyebrow} head={`Access for ${target.orgName} is closed`} body="Ask whoever sent you the link." back />;
    }
    if (verdict.why === "pupil") {
      return <Trouble eyebrow={eyebrow} head={`A ${w.person} account cannot join as a ${w.staff}`} body="Sign out, then open the link again and sign in with your own account." back />;
    }
    if (verdict.why === "wrong_domain") {
      /* The sentence already names the signed-in address and Sign out is
       * the action, so this room has no strip: the address still shows once. */
      return (
        <Room
          eyebrow={eyebrow}
          err
          glyph="lock"
          title={`Use your ${target.orgName} address`}
          actions={<SignOut className="r8-btn" kind="ghost" />}
        >
          <p>This link is for @{target.lockedTo} addresses.</p>
          <p>
            You are signed in as {me}. Sign out, open the link again and sign in with your @{target.lockedTo} address.
            If you do not have one, ask whoever sent the link for a personal invite.
          </p>
        </Room>
      );
    }
    return <Trouble eyebrow={eyebrow} head="That link is not valid any more" body="Ask whoever sent it for the new link." back />;
  }

  if (verdict.state === "already") {
    return (
      <Room
        eyebrow={eyebrow}
        title={`You are already in at ${target.orgName}`}
        email={me}
        actions={<Link className="r8-btn" href="/schools/overview">Go to my {w.groups}{R8_ICON.arrow}</Link>}
      >
        <p>Nothing to do. Your {w.groups} are where you left them.</p>
      </Room>
    );
  }

  /* By email, the sentence names the address the email goes to, so the
   * strip is left off and the address still shows once. */
  const byEmail = verdict.state === "confirm_by_email";
  return (
    <Room
      eyebrow={eyebrow}
      title={`Join ${target.orgName} as a ${w.staff}`}
      email={byEmail ? undefined : me}
      actions={
        <TeacherJoinButton
          token={token}
          orgName={target.orgName}
          confirm={byEmail ? undefined : confirm}
          label={byEmail ? `Email me a link to confirm` : `Set up my ${w.staff} account at ${target.orgName}`}
        />
      }
    >
      <p>
        {byEmail
          ? `This link is for @${target.lockedTo} addresses, so we check yours first. Press the button and we email ${me} a link that finishes joining.`
          : `One click sets up your ${w.staff} account. You get your own ${w.groups}, and every ${w.person} you add uses a place from the ${w.noun}'s shared pool.`}
      </p>
    </Room>
  );
}
