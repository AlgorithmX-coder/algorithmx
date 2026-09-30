import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { firstNameOf, getEnrolment } from "@/app/lib/aiCleared";
import { TOOL_LABEL } from "@/app/ai-cleared/engine/types";
import { K } from "@/app/ai-cleared/engine/tokens";
import Frame from "@/app/ai-cleared/Frame";
import CourseAside from "@/app/ai-cleared/CourseAside";
import PlaybookList from "./PlaybookList";

/* /ai-fluent/playbook: the learner's saved prompts, grouped by workflow,
 * printable from the browser. The learner's, not the firm's: the admin
 * never sees this page. */
export const dynamic = "force-dynamic";

const TOOL_OF: Record<string, keyof typeof TOOL_LABEL> = { COPILOT: "copilot", CHATGPT: "chatgpt", GEMINI: "gemini", CLAUDE: "claude" };

export default async function PlaybookPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=%2Fai-fluent%2Fplaybook");
  const enrolment = await getEnrolment(session.user.id, "ai-fluent");
  if (!enrolment) redirect("/ai-fluent");

  const entries = await prisma.playbookEntry.findMany({ where: { enrolmentId: enrolment.id }, orderBy: [{ module: "asc" }, { createdAt: "asc" }] });
  const first = firstNameOf(enrolment.user.name, enrolment.user.email);
  const profile = enrolment.org.profile;
  const rows = entries.map((e) => ({ id: e.id, module: e.module, workflow: e.workflow, tool: TOOL_LABEL[TOOL_OF[e.tool] ?? "copilot"], prompt: e.prompt, whenToUse: e.whenToUse, check: e.check, createdAt: e.createdAt.toISOString() }));

  return (
    <Frame course="ai-fluent" firmName={enrolment.org.name} courseLink meta={<span className="cf-meta">{first}</span>} aside={<CourseAside course="ai-fluent" firmName={enrolment.org.name} contactName={profile?.escalationContact ?? enrolment.org.contactName} contactRole={profile?.escalationRole ?? enrolment.org.contactRole} learnerName={first} done={enrolment.modules.filter((m) => m.completedAt).map((m) => m.module)} />}>
      <span className="cf-eyebrow">Your playbook</span>
      <h1 className="cf-h1">The prompts you wrote that <span className="cf-grad">worked</span>.</h1>
      <p className="cf-lead">
        Every practice that scores Fluent offers to save your prompt here, with one line on when to use it and the check that goes with it. It is yours: your admin sees only that it exists. Print it from the browser and keep it by your desk.
      </p>
      {rows.length === 0 ? (
        <div className="cf-card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <b style={{ color: K.ink }}>Nothing saved yet.</b>
          <span className="cf-note">Your first entry arrives at the end of Module 4, Summarise. Until then the loop, the elements and iterating are the habits; the playbook is where the workflows land.</span>
          <Link href="/ai-fluent" className="cf-btn cf-btn-pri" style={{ alignSelf: "flex-start" }}>Back to the course</Link>
        </div>
      ) : (
        <PlaybookList entries={rows} />
      )}
      <p className="cf-note" style={{ marginTop: 22, maxWidth: "60ch" }}>Everything here was written about invented practice material. The prompts are stored on your enrolment and deleted with it.</p>
    </Frame>
  );
}
