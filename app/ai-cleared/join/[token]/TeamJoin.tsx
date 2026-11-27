import type { CSSProperties } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { after } from "next/server";
import { auth } from "@/app/lib/auth";
import { DB_TO_TRACK, deskOf, firstNameOf } from "@/app/lib/aiCleared";
import { CYBER_SECURED_NAME, SECURED_TRACKS } from "@/app/lib/cyberSecured";
import { leadOf, notifySeatsFull, previewTeamJoin } from "@/app/lib/firmTeamLink";
import { seatsLeft } from "@/app/lib/aiClearedAdmin";
import { askLine, seatsTakenLine } from "@/app/lib/teamLink";
import { prisma } from "@/app/lib/prisma";
import JoinForm from "../../JoinForm";
import { Aside, GO, Room, rise } from "./parts";
import { switchToWorkAddress } from "./actions";

/* The firm's team link: one address the lead forwards to everyone. Signed
 * out, it says who it is from and asks them to create an account or sign
 * in; signed in, it asks the one desk question and the claim takes a seat
 * (claimTeamLink). When it cannot let someone in it says why in a line,
 * and names the lead to ask. Same room and same look as a personal invite. */

type TeamOrg = {
  id: string;
  name: string;
  seatsPurchased: number;
  revokedAt: Date | null;
  teamDomain: string | null;
  contactName: string | null;
  contactRole: string | null;
  profile: { escalationContact: string; escalationRole: string | null } | null;
};

async function originNow(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.algorithmx.co.uk";
  return `${proto}://${host}`;
}

export default async function TeamJoin({ org, token }: { org: TeamOrg; token: string }) {
  const session = await auth();
  const here = `/ai-cleared/join/${encodeURIComponent(token)}`;
  const lead = await leadOf(org.id);
  const contact = org.profile?.escalationContact ?? org.contactName;
  const role = org.profile?.escalationRole ?? org.contactRole;
  const aside = (learnerName?: string) => <Aside course="ai-cleared" firmName={org.name} contactName={contact} contactRole={role} learnerName={learnerName} />;
  const tracks = SECURED_TRACKS.filter((t) => t.live);
  const atDomain = org.teamDomain ? `@${org.teamDomain}` : null;

  /* Told once a day at most, after the page has gone out. */
  const tellLeadFull = async () => {
    const origin = await originNow();
    after(() => notifySeatsFull({ orgId: org.id, origin }).catch((err) => console.error("[team-link] notify failed", err)));
  };

  const fullRoom = async (signedIn: boolean) => {
    await tellLeadFull();
    return (
      <Room firmName={org.name}>
        <p className="r6-eyebrow pill" {...rise(0)}>Team link</p>
        <h1 className="r6-title" id="r6-title" {...rise(1)}>{seatsTakenLine(org.seatsPurchased)}</h1>
        <p className="r6-sub" {...rise(2)}>{askLine(lead.name, "for more.")}{signedIn ? "" : " If you already have a seat, sign in and you will go straight to your courses."}</p>
        {!signedIn && (
          <div className="r6-actions" {...rise(3)}>
            <Link href={`/cyber-secured/login?callbackUrl=${encodeURIComponent(here)}`} className="r6-btn ghost"><span className="lbl">I already have a seat</span></Link>
          </div>
        )}
      </Room>
    );
  };

  if (!session?.user?.id) {
    if (org.revokedAt) {
      return (
        <Room firmName={org.name}>
          <p className="r6-eyebrow pill" {...rise(0)}>Team link</p>
          <h1 className="r6-title" id="r6-title" {...rise(1)}>{org.name}&rsquo;s access to these courses is closed.</h1>
          <p className="r6-sub" {...rise(2)}>{askLine(lead.name, "if you think this is a mistake.")}</p>
        </Room>
      );
    }
    /* Full shows before sign-in too: nobody should make an account only to
       be told there is no seat. Someone already holding one can still sign
       in from here and go straight through. */
    const { left } = await seatsLeft(org.id);
    if (left <= 0) return fullRoom(false);
    return (
      <Room firmName={org.name} meta={atDomain ? <span className="r6-meta">For {atDomain} addresses</span> : undefined} two>
        <div className="r6-two">
          <div>
            <p className="r6-eyebrow pill" {...rise(0)}>Your team link</p>
            <h1 className="r6-title" id="r6-title" {...rise(1)}>{org.name} has a seat for you on <span className="grad">{CYBER_SECURED_NAME}</span>.</h1>
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
            <p className="r6-note" {...rise(4)}>
              {atDomain
                ? <>Use your {atDomain} work address. The link only lets in {org.name} addresses.</>
                : <>Use your work email, so {lead.name ?? "your firm’s admin"} can see your progress against your name.</>}
            </p>
          </div>
          {aside()}
        </div>
      </Room>
    );
  }

  const userId = session.user.id;
  const account = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, name: true } });
  const email = account?.email ?? session.user.email ?? "";
  const decision = await previewTeamJoin({ org, userId, email });

  if (decision.ok && decision.kind === "already-in") redirect("/cyber-secured");

  if (!decision.ok) {
    if (decision.reason === "full") return fullRoom(true);
    const body =
      decision.reason === "closed"
        ? { h: <>{org.name}&rsquo;s access to these courses is closed.</>, p: askLine(lead.name, "if you think this is a mistake.") }
        : decision.reason === "removed"
          ? { h: <>Your seat at {org.name} has been handed back.</>, p: askLine(lead.name, "if you need it again. They can invite you back.") }
          : decision.reason === "taken"
            ? { h: <>A seat for {email} is already in use.</>, p: `It was claimed from a different account. ${askLine(lead.name, "to sort it out.")}` }
            : { h: <>This link is for {org.name} email addresses.</>, p: `It only works for addresses ending ${atDomain}, and you are signed in as ${email}. Sign in with your work address, or ${askLine(lead.name, "to invite you.").replace(/^Ask/, "ask")}` };
    return (
      <Room firmName={org.name} meta={<span className="r6-meta">{email}</span>}>
        <p className="r6-eyebrow pill" {...rise(0)}>Team link</p>
        <h1 className="r6-title" id="r6-title" {...rise(1)}>{body.h}</h1>
        <p className="r6-sub" {...rise(2)}>{body.p}</p>
        {decision.reason === "wrong-domain" && (
          <form action={switchToWorkAddress} className="r6-actions" {...rise(3)}>
            <input type="hidden" name="token" value={token} />
            <button type="submit" className="r6-btn pri"><span className="lbl">Use my work address</span>{GO}</button>
          </form>
        )}
      </Room>
    );
  }

  /* A seat is waiting (an invite already sent to them, or a new one). One
     question, the desk, then the claim takes the seat. */
  const first = firstNameOf(account?.name ?? session.user.name, email);
  const invite = decision.kind === "claim-invite" ? await prisma.seat.findUnique({ where: { id: decision.seatId }, select: { trackHint: true } }) : null;
  const preset = invite?.trackHint ? DB_TO_TRACK[invite.trackHint] : await deskOf(userId);
  return (
    <Room firmName={org.name} meta={<span className="r6-meta">{email}</span>} two>
      <div className="r6-two">
        <div>
          <p className="r6-eyebrow pill" {...rise(0)}>One question, then you are in</p>
          <h1 className="r6-title" id="r6-title" {...rise(1)}>Welcome, {first}. What do you <span className="grad">do</span> at {org.name}?</h1>
          <p className="r6-sub" {...rise(2)}>
            Everyone learns the same habits. Your job title picks the desk the practice happens on in every course, so the invoices, emails and documents look like the ones you actually handle.
          </p>
          <div {...rise(3)}>
            <JoinForm token={token} orgName={org.name} presetTrack={preset} course="ai-cleared" />
          </div>
        </div>
        {aside(first)}
      </div>
    </Room>
  );
}
