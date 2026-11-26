import type { Metadata } from "next";
import { requireCourse } from "@/app/lib/courseAccess";
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
 * Gated on the Cyber Ops entitlement ("cyberstart" in the catalogue) via
 * requireCourse: signed out goes to the Ops sign-in, signed in without the
 * course goes to the Ops landing page.
 */
export default async function OperatorsPlayPage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const n = Number(module);
  const moduleNo = Number.isInteger(n) && n > 0 ? n : 1;

  await requireCourse("cyberstart", `/operators/play/${moduleNo}`);

  const resume = await getOpsResume(moduleNo);
  return <PlayClient module={moduleNo} initialBeat={resume?.beat} initialCallsign={resume?.callsign ?? undefined} />;
}
