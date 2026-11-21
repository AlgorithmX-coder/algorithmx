import type { Metadata } from "next";
import PlayClient from "@/app/operators/range/PlayClient";
import { getOpsResume } from "@/app/lib/opsPortfolio.actions";
import { courseGate } from "@/app/lib/courseGate";
import CourseLocked from "@/app/components/CourseLocked";

/** Cyber Ops is "cyberstart" in the catalogue; the name changed, the slug did not. */
const OPS_SLUG = "cyberstart";

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
 * THE ENTITLEMENT GATE IS NOW HERE, which is what "lands with the launch
 * phase" meant. Until it did, this page asked for a sign-in and then never
 * asked what the account had paid for: the same hole as no gate at all,
 * with a login page in front of it.
 */
export default async function OperatorsPlayPage({ params }: { params: Promise<{ module: string }> }) {
  const { module } = await params;
  const n = Number(module);
  const moduleNo = Number.isInteger(n) && n > 0 ? n : 1;

  const gate = await courseGate(OPS_SLUG);
  if (!gate.ok) {
    return (
      <CourseLocked
        gate={gate}
        courseName="Cyber Ops"
        slug={OPS_SLUG}
        here={`/operators/play/${moduleNo}`}
      />
    );
  }

  const resume = await getOpsResume(moduleNo);
  return <PlayClient module={moduleNo} initialBeat={resume?.beat} initialCallsign={resume?.callsign ?? undefined} />;
}
