import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { DB_TO_TRACK } from "@/app/lib/aiCleared";
import { K } from "../../engine/tokens";
import JoinForm from "../../JoinForm";

/* /ai-cleared/join/[token]: the invite landing. Signed out, it explains
 * and links to sign-in with a return path; signed in, it shows the
 * job-title picker and claims the seat. */
export const dynamic = "force-dynamic";

export default async function JoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const seat = await prisma.seat.findUnique({ where: { inviteToken: token }, include: { org: { select: { name: true } } } });

  const wrap = (children: React.ReactNode) => (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "60px 24px 80px" }}>
      <span style={{ fontFamily: K.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.22em", color: K.accentInk }}>AI CLEARED</span>
      {children}
    </div>
  );

  if (!seat) {
    return wrap(
      <>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: K.ink, margin: "20px 0 10px", letterSpacing: "-0.015em" }}>That invite link is not valid.</h1>
        <p style={{ fontSize: 16, color: K.body }}>Ask your firm&rsquo;s admin for a fresh one. If you already have a seat, <Link href="/ai-cleared" style={{ color: K.accentInk }}>go to your course</Link>.</p>
      </>,
    );
  }

  const session = await auth();
  const here = `/ai-cleared/join/${encodeURIComponent(token)}`;

  if (!session?.user?.id) {
    return wrap(
      <>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: K.ink, margin: "20px 0 10px", letterSpacing: "-0.015em", textWrap: "balance" }}>{seat.org.name} has reserved you a seat on AI Cleared.</h1>
        <p style={{ fontSize: 16, color: K.body, maxWidth: "56ch" }}>
          About ninety minutes, in five short modules, on a desk that looks like yours. Sign in or create an account with your work email to claim it.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <Link href={`/signup?callbackUrl=${encodeURIComponent(here)}`} style={{ fontSize: 14.5, fontWeight: 600, color: K.onAccent, background: K.accent, borderRadius: 9, padding: "11px 18px", textDecoration: "none" }}>Create an account</Link>
          <Link href={`/login?callbackUrl=${encodeURIComponent(here)}`} style={{ fontSize: 14.5, fontWeight: 600, color: K.ink, border: `1px solid ${K.edge}`, borderRadius: 9, padding: "11px 18px", textDecoration: "none" }}>I already have one</Link>
        </div>
        <p style={{ fontSize: 13.5, color: K.muted, marginTop: 18 }}>Invited as {seat.email}.</p>
      </>,
    );
  }

  if (seat.userId && seat.userId !== session.user.id) {
    return wrap(
      <>
        <h1 style={{ fontSize: 28, fontWeight: 600, color: K.ink, margin: "20px 0 10px", letterSpacing: "-0.015em" }}>That seat has already been claimed.</h1>
        <p style={{ fontSize: 16, color: K.body }}>Ask your firm&rsquo;s admin for your own invite link.</p>
      </>,
    );
  }

  if (seat.userId === session.user.id && seat.claimedAt) redirect("/ai-cleared");

  return wrap(
    <>
      <h1 style={{ fontSize: 28, fontWeight: 600, color: K.ink, margin: "20px 0 10px", letterSpacing: "-0.015em", textWrap: "balance" }}>Welcome. One question, then you are in.</h1>
      <p style={{ fontSize: 16, color: K.body, maxWidth: "56ch", marginBottom: 22 }}>
        Everyone at {seat.org.name} learns the same habits. Your job title picks the desk the practice happens on, so the invoices, emails and documents look like the ones you actually handle.
      </p>
      <JoinForm token={token} orgName={seat.org.name} presetTrack={seat.trackHint ? DB_TO_TRACK[seat.trackHint] : null} />
    </>,
  );
}
