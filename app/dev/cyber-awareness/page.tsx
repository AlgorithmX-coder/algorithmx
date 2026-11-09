import ClearedPlayer from "@/app/ai-cleared/engine/ClearedPlayer";
import ConsoleHome from "@/app/ai-cleared/ConsoleHome";
import { DEFAULT_FIRM, TRACKS } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "@/app/cyber-awareness/manifests";

/* Dev-only preview of a Cyber Awareness module with no database: every
 * practice is scripted, nothing persists. Middleware 404s /dev in
 * production. ?m=1 picks the module, ?track= the desk (every desk plays
 * the same block). ?done=all marks every other module done, so the last
 * module's result shows the course finished. ?home=complete (or
 * ?home=progress) shows the course home instead, with every module done
 * (or half of them), as a learner would see it. */
export const dynamic = "force-dynamic";

export default async function DevCyberAwareness({ searchParams }: { searchParams: Promise<{ m?: string; track?: string; done?: string; home?: string }> }) {
  const { m, track: trackParam, done, home } = await searchParams;
  const manifest = getAwarenessModule(Number(m ?? 1)) ?? getAwarenessModule(1)!;
  const track = TRACKS.find((t) => t === trackParam) ?? "general";
  const firm = {
    ...DEFAULT_FIRM,
    name: "Marlow Fenwick LLP",
    contactName: "Priya Nair",
    contactRole: "Head of IT and Security",
  };
  if (home === "complete" || home === "progress") {
    const all = home === "complete";
    const modules = AWARENESS_MODULE_LIST.map((x) => ({ ...x, done: all || x.n <= 4 }));
    return (
      <ConsoleHome
        course="cyber-awareness"
        firmName={firm.name}
        contactName={firm.contactName}
        contactRole={firm.contactRole}
        learnerName="Hannah"
        track={track}
        trackLocked={false}
        modules={modules}
        resumeN={all ? null : 5}
        complete={all}
      />
    );
  }
  return (
    <ClearedPlayer
      manifest={manifest}
      track={track}
      firm={firm}
      tool="copilot"
      learnerName="Hannah"
      courseMap={AWARENESS_MODULE_LIST.map((x) => ({ ...x, done: done === "all" && x.n !== manifest.n }))}
      live={false}
    />
  );
}
