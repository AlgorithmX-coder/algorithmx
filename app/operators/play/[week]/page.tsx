import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import PlayRoute from "./PlayRoute";

export const metadata: Metadata = {
  title: "Cyber Ops · Engagement",
  robots: { index: false, follow: false },
};

/**
 * /operators/play/[week] — a REAL, persisted Cyber Ops engagement.
 *
 * Unlike the /operators/* preview routes (which run the range engine with no
 * backend), this route requires a signed-in family account: reaching the
 * report beat saves progress + reputation and files the finding to the
 * learner's portfolio. The engagement UI is a client component (it reads the
 * week param via useParams and holds all beat state), so this server wrapper
 * exists only to bounce unauthenticated users before any client JS loads.
 *
 * No entitlement gate yet — Cyber Ops is pre-launch and opened for testing
 * behind the site password, matching how the hub's TEST_ENTER opens the other
 * unlaunched tiers. The purchase/entitlement gate lands with the launch phase.
 */
export default async function OperatorsPlayPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/operators/play/1");
  return <PlayRoute />;
}
