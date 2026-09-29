import { notFound, redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { getTeacherContext } from "@/app/lib/schoolAccess";
import { getPack, writtenWeeks } from "../packs";
import Locked from "../Locked";
import Pack from "../Pack";

/* Reads the session on every request, so it can never be cached as somebody
   else's answer. */
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ week: string }> }): Promise<Metadata> {
  const pack = getPack(Number((await params).week));
  return {
    title: pack ? `Week ${pack.n}: ${pack.title} | Cyber Heroes teacher pack` : "Teacher pack",
    /* nothing here should ever be indexed: it is the answers */
    robots: { index: false, follow: false },
  };
}

export default async function TeachWeekPage({ params }: { params: Promise<{ week: string }> }) {
  const { week } = await params;

  // ── GATE ─────────────────────────────────────────────────────────
  const session = await auth();
  if (!session?.user?.id) {
    redirect(`/schools/login?callbackUrl=${encodeURIComponent(`/schools/teach/${week}`)}`);
  }
  const ctx = await getTeacherContext(session.user.id);
  if (!ctx) return <Locked email={session.user.email} />;

  // ── CONTENT ──────────────────────────────────────────────────────
  /* Number("11abc") is NaN but Number("") is 0, so check the shape of the
     segment rather than trusting the coercion. */
  const n = /^\d{1,2}$/.test(week) ? Number(week) : NaN;
  const pack = getPack(n);
  /* A week nobody has written yet is a 404, not an empty deck: an empty deck
     is something a teacher would only discover in front of a class. */
  if (!pack) notFound();

  return <Pack pack={pack} weeks={writtenWeeks().map((p) => p.n)} />;
}
