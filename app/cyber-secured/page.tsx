import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { FIRM_ORG, deskOf, enrolOnEveryTrack, firstNameOf } from "@/app/lib/aiCleared";
import { isStaffUser } from "@/app/lib/aiClearedStaff";
import { moduleListFor } from "@/app/lib/courseModules";
import { CYBER_SECURED_BRAND, CYBER_SECURED_NAME, SECURED_TRACKS } from "@/app/lib/cyberSecured";
import { K } from "@/app/ai-cleared/engine/tokens";
import Frame from "@/app/ai-cleared/Frame";

/* /cyber-secured: where a firm's people land. Every course their seat
 * opens, how far they have got on each, and the one to pick up next. An
 * admin or manager also gets the way into their team's page.
 *
 * Opening it also enrols the person on any track built since they claimed
 * their seat, so a new course reaches everyone without a second invite. */
export const dynamic = "force-dynamic";

const BRAND = { word: CYBER_SECURED_BRAND, href: "/cyber-secured" };

export default async function CyberSecuredHome() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fcyber-secured");
  const userId = session.user.id;

  const [member, staff] = await Promise.all([
    prisma.orgMember.findFirst({ where: { userId, org: FIRM_ORG }, orderBy: { createdAt: "asc" }, include: { org: { include: { profile: true } } } }),
    isStaffUser(userId),
  ]);

  if (!member) {
    if (staff) redirect("/admin/firms");
    return (
      <Frame brand={BRAND} meta={<span className="cf-meta">{session.user.email}</span>}>
        <span className="cf-eyebrow">No seat yet</span>
        <h1 className="cf-h1">Your firm reserves your seat. Then you are <span className="cf-grad">in</span>.</h1>
        <p className="cf-lead">{CYBER_SECURED_NAME} is licensed by firms, one seat per person. Your admin sends an invite link that claims your seat; open that link while signed in as {session.user.email}.</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link href="/corporate" className="cf-btn cf-btn-pri">About {CYBER_SECURED_NAME} for firms</Link>
          <a href="mailto:admissions@algorithmx.co.uk" className="cf-btn">Email admissions</a>
        </div>
      </Frame>
    );
  }

  const org = member.org;
  const isAdmin = member.role === "ADMIN" || member.role === "MANAGER";
  const first = firstNameOf(session.user.name, session.user.email);
  const meta = (
    <>
      <span className="cf-meta cs-who">{first}</span>
      {isAdmin && <Link href="/cyber-secured/admin" className="cf-link">Your team</Link>}
      {staff && <Link href="/admin/firms" className="cf-link">Ops</Link>}
    </>
  );

  if (org.revokedAt) {
    return (
      <Frame brand={BRAND} firmName={org.name} meta={meta}>
        <span className="cf-eyebrow">Access closed</span>
        <h1 className="cf-h1">{org.name}&rsquo;s access has been <span className="cf-grad">closed</span>.</h1>
        <p className="cf-lead">Everything you did is kept exactly as it was. If you believe this is a mistake, ask your admin or email admissions@algorithmx.co.uk.</p>
      </Frame>
    );
  }

  /* Anyone who has claimed works at a desk; use it for any new track. */
  const desk = await deskOf(userId);
  if (desk) await enrolOnEveryTrack({ userId, orgId: member.orgId, track: desk });

  const enrolments = await prisma.enrolment.findMany({
    where: { userId, orgId: member.orgId },
    select: { completedAt: true, startedAt: true, product: { select: { slug: true } }, modules: { select: { module: true, completedAt: true, updatedAt: true } } },
  });

  const tracks = SECURED_TRACKS.filter((t) => t.live).flatMap((t) => {
    const e = enrolments.find((x) => x.product.slug === t.slug);
    if (!e) return [];
    const list = moduleListFor(t.slug).filter((m) => m.available);
    const doneSet = new Set(e.modules.filter((m) => m.completedAt).map((m) => m.module));
    const touched = new Set(e.modules.map((m) => m.module));
    const done = list.filter((m) => doneSet.has(m.n)).length;
    const next = list.find((m) => !doneSet.has(m.n) && touched.has(m.n)) ?? list.find((m) => !doneSet.has(m.n)) ?? null;
    const last = Math.max(0, ...e.modules.map((m) => m.updatedAt.getTime()));
    return [{ ...t, total: list.length, done, complete: !!e.completedAt || (list.length > 0 && done === list.length), next, last }];
  });

  /* The one to pick up: the course touched most recently and not finished. */
  const resume = tracks.filter((t) => !t.complete && t.last > 0).sort((a, b) => b.last - a.last)[0] ?? null;
  const anyStarted = tracks.some((t) => t.last > 0);
  const allDone = tracks.length > 0 && tracks.every((t) => t.complete);
  const contact = org.profile?.escalationContact ?? org.contactName;
  const contactRole = org.profile?.escalationRole ?? org.contactRole;

  let teamLine: string | null = null;
  if (isAdmin) {
    const [seats, claimed] = await Promise.all([
      prisma.seat.findMany({ where: { orgId: member.orgId }, select: { email: true }, distinct: ["email"] }),
      prisma.seat.findMany({ where: { orgId: member.orgId, claimedAt: { not: null } }, select: { email: true }, distinct: ["email"] }),
    ]);
    teamLine = `${seats.length} of ${org.seatsPurchased} seats given out, ${claimed.length} signed in.`;
  }

  return (
    <Frame
      brand={BRAND}
      firmName={org.name}
      meta={meta}
      aside={
        <>
          <div className="cf-card cf-firmcard">
            <span className="cf-avatar" aria-hidden>{org.name.charAt(0).toUpperCase()}</span>
            <div>
              <b>{org.name}</b>
              <small>Your firm&rsquo;s {CYBER_SECURED_NAME} seat</small>
            </div>
          </div>
          {contact && (
            <div className="cf-card">
              <div className="cf-label">Questions about AI at work</div>
              <p className="cf-note" style={{ margin: 0 }}>Ask <b style={{ color: K.ink }}>{contact}</b>{contactRole ? `, ${contactRole}` : ""}. The courses name them wherever a rule needs a person.</p>
            </div>
          )}
          {isAdmin && (
            <Link href="/cyber-secured/admin" className="cf-card cs-team">
              <div className="cf-label">Your team</div>
              <p className="cf-note" style={{ margin: "0 0 8px" }}>{teamLine}</p>
              <span className="cs-go">See who has started, and invite people &rarr;</span>
            </Link>
          )}
        </>
      }
    >
      <span className="cf-eyebrow">{CYBER_SECURED_NAME}</span>
      <h1 className="cf-h1">
        {allDone ? <>Every course done, {first}. <span className="cf-grad">Well done.</span></> : anyStarted ? <>Welcome back, {first}. <span className="cf-grad">Pick up</span> where you left off.</> : <>Welcome, {first}. Start <span className="cf-grad">anywhere</span>.</>}
      </h1>
      <p className="cf-lead">Your seat at {org.name} opens every course below. Take them in any order, and stop and resume whenever suits.</p>

      {resume?.next && (
        <Link href={`${resume.base}/m/${resume.next.n}`} className="cf-card cs-resume">
          <span className="cf-label" style={{ margin: 0 }}>Continue {resume.name}</span>
          <b>Module {resume.next.n}: {resume.next.title}</b>
          <span className="cf-btn cf-btn-pri">Continue</span>
        </Link>
      )}

      <div className="cs-tracks">
        {tracks.map((t) => {
          const pct = t.total ? Math.round((t.done / t.total) * 100) : 0;
          const action = t.complete ? "Look back" : t.last > 0 ? "Continue" : "Start";
          return (
            <Link key={t.slug} href={t.base} className={`cf-card cs-track ${t.complete ? "done" : ""}`}>
              <div className="cs-track-top">
                <b>{t.name}</b>
                <span className={`cs-state ${t.complete ? "done" : t.last > 0 ? "on" : ""}`}>{t.complete ? "Finished" : t.last > 0 ? `${t.done} of ${t.total} modules` : "Not started"}</span>
              </div>
              <p>{t.line.charAt(0).toUpperCase() + t.line.slice(1)}.</p>
              <span className="cs-bar" aria-hidden><span style={{ width: `${pct}%` }} /></span>
              <span className="cs-go">{action} &rarr;</span>
            </Link>
          );
        })}
      </div>

      <style>{`
        .cs-resume { display: grid; grid-template-columns: 1fr auto; grid-template-rows: auto auto; align-items: center; gap: 4px 16px; margin-bottom: 18px; text-decoration: none; border-color: rgba(87,68,201,0.28); }
        .cs-resume .cf-label { grid-column: 1; }
        .cs-resume b { grid-column: 1; color: ${K.ink}; font-size: 17px; }
        .cs-resume .cf-btn { grid-column: 2; grid-row: 1 / span 2; }
        .cs-tracks { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 14px; }
        .cs-track { display: flex; flex-direction: column; gap: 10px; text-decoration: none; color: inherit; transition: transform 160ms ease, border-color 160ms ease; }
        .cs-track:hover, .cs-resume:hover, .cs-team:hover { transform: translateY(-2px); border-color: ${K.accent}; }
        .cs-track-top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; flex-wrap: wrap; }
        .cs-track-top b { color: ${K.ink}; font-size: 18px; font-family: ${K.display}; font-weight: 600; }
        .cs-track p { margin: 0; font-size: 14.5px; line-height: 1.5; color: ${K.body}; flex: 1; }
        .cs-state { font-family: ${K.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.06em; border-radius: 6px; padding: 3px 8px; color: ${K.muted}; background: ${K.sunk}; white-space: nowrap; }
        .cs-state.on { color: ${K.accentInk}; background: ${K.accentSoft}; }
        .cs-state.done { color: ${K.ok}; background: ${K.okSoft}; }
        .cs-bar { display: block; height: 6px; border-radius: 999px; background: ${K.sunk}; overflow: hidden; }
        .cs-bar span { display: block; height: 100%; border-radius: 999px; background: ${K.grad}; }
        .cs-go { font-size: 14px; font-weight: 600; color: ${K.accentInk}; }
        .cs-team { display: block; text-decoration: none; color: inherit; transition: transform 160ms ease, border-color 160ms ease; }
        @media (prefers-reduced-motion: reduce) { .cs-track, .cs-resume, .cs-team { transition: none; } }
      `}</style>
    </Frame>
  );
}
