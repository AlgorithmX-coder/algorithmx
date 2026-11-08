import Link from "next/link";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import TeacherJoinButton from "./TeacherJoinButton";

/* /schools/join/[token]: the teacher invite landing. Signed out, it
 * explains and links to sign-in with a return path; signed in, one
 * button claims the invite. Mirrors /ai-cleared/join/[token], without
 * the job-title picker a teacher has no use for. */
export const dynamic = "force-dynamic";

export default async function SchoolJoinPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const invite = await prisma.teacherInvite.findUnique({ where: { inviteToken: token }, include: { org: { select: { name: true } } } });

  if (!invite) {
    return (
      <div className="axtp">
        <div className="wrap">
          <div className="brief">
            <h4>That invite link is not valid</h4>
            <p>Ask AlgorithmX for a fresh one.</p>
            <p className="line"><Link href="/schools">Back to schools</Link></p>
          </div>
        </div>
      </div>
    );
  }

  const session = await auth();
  const here = `/schools/join/${encodeURIComponent(token)}`;

  if (!session?.user?.id) {
    return (
      <div className="axtp">
        <div className="wrap">
          <header className="top">
            <div>
              <div className="brand">Algorithm<span>X</span></div>
              <div className="sub">Invited as {invite.email}</div>
            </div>
          </header>
          <div className="brief">
            <h4>{invite.org.name} has a teacher place waiting for you</h4>
            <p>Set up your account, then you land on your classes page ready to add children.</p>
            <p className="line">
              <Link href={`/signup?callbackUrl=${encodeURIComponent(here)}`} className="axbtn">Create an account</Link>{" "}
              <Link href={`/login?callbackUrl=${encodeURIComponent(here)}`} className="axbtn">I already have one</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (invite.userId && invite.userId !== session.user.id) {
    return (
      <div className="axtp">
        <div className="wrap">
          <div className="brief">
            <h4>That invite has already been claimed</h4>
            <p>Ask AlgorithmX for your own invite link.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="axtp">
      <div className="wrap">
        <header className="top">
          <div>
            <div className="brand">Algorithm<span>X</span></div>
            <div className="sub">{session.user.email}</div>
          </div>
        </header>
        <div className="brief">
          <h4>Welcome to {invite.org.name}</h4>
          <p>One click sets up your teacher account. You can add more teachers and your first class once you are in.</p>
          <TeacherJoinButton token={token} orgName={invite.org.name} />
        </div>
      </div>
    </div>
  );
}
