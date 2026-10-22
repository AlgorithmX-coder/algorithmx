import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import PlayClient from "@/app/operators/range/PlayClient";
import { getOpsResume } from "@/app/lib/opsPortfolio.actions";

export const metadata: Metadata = {
  title: "Cyber Ops · Module",
  robots: { index: false, follow: false },
};

/**
 * /operators/play/[module] — a REAL, persisted Cyber Ops module.
 *
 * Unlike the /operators/* preview routes (which run the range engine with no
 * backend), this route requires a signed-in family account: reaching the
 * report beat saves progress + reputation and files the finding to the
 * learner's portfolio. This server wrapper bounces unauthenticated users, then
 * hydrates the account-wide resume point (the section the learner last left
 * off on, from any device) and hands it to the client module so there's no
 * flash of the intro before it jumps to where they were.
 *
 * No entitlement gate yet — Cyber Ops is pre-launch and opened for testing
 * behind the site password, matching how the hub's TEST_ENTER opens the other
 * unlaunched tiers. The purchase/entitlement gate lands with the launch phase.
 */
export default async function OperatorsPlayPage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const n = Number(module);
  const moduleNo = Number.isInteger(n) && n > 0 ? n : 1;

  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/operators/play/${moduleNo}`);

  const resume = await getOpsResume(moduleNo);
  return <PlayClient module={moduleNo} initialBeat={resume?.beat} initialCallsign={resume?.callsign ?? undefined} />;
}
