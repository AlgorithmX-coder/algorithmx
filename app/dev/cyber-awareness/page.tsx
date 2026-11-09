import ClearedPlayer from "@/app/ai-cleared/engine/ClearedPlayer";
import { DEFAULT_FIRM, TRACKS } from "@/app/ai-cleared/engine/types";
import { AWARENESS_MODULE_LIST, getAwarenessModule } from "@/app/cyber-awareness/manifests";

/* Dev-only preview of a Cyber Awareness module with no database: every
 * practice is scripted, nothing persists. Middleware 404s /dev in
 * production. ?m=1 picks the module, ?track= the desk (every desk plays
 * the same block). */
export const dynamic = "force-dynamic";

export default async function DevCyberAwareness({ searchParams }: { searchParams: Promise<{ m?: string; track?: string }> }) {
  const { m, track: trackParam } = await searchParams;
  const manifest = getAwarenessModule(Number(m ?? 1)) ?? getAwarenessModule(1)!;
  const track = TRACKS.find((t) => t === trackParam) ?? "general";
  const firm = {
    ...DEFAULT_FIRM,
    name: "Marlow Fenwick LLP",
    contactName: "Priya Nair",
    contactRole: "Head of IT and Security",
  };
  return (
    <ClearedPlayer
      manifest={manifest}
      track={track}
      firm={firm}
      tool="copilot"
      learnerName="Hannah"
      courseMap={AWARENESS_MODULE_LIST.map((x) => ({ ...x, done: false }))}
      live={false}
    />
  );
}
