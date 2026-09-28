import ClearedPlayer from "@/app/ai-cleared/engine/ClearedPlayer";
import { DEFAULT_FIRM } from "@/app/ai-cleared/engine/types";
import { MODULE_LIST, getModule } from "@/app/ai-cleared/manifests";

/* Dev-only preview of a module with no database and no model: the rules
 * layer grades, replies are scripted, nothing persists. Middleware 404s
 * /dev in production. ?m=2 picks the module. */
export const dynamic = "force-dynamic";

export default async function DevAiCleared({ searchParams }: { searchParams: Promise<{ m?: string; tool?: string; track?: string }> }) {
  const { m, tool: toolParam, track: trackParam } = await searchParams;
  const manifest = getModule(Number(m ?? 2)) ?? getModule(2)!;
  const tool = (["copilot", "chatgpt", "gemini", "claude"] as const).find((t) => t === toolParam) ?? "copilot";
  const track = (["finance", "legal", "hr", "general"] as const).find((t) => t === trackParam) ?? "finance";
  const firm = {
    ...DEFAULT_FIRM,
    name: "Marlow Fenwick LLP",
    contactName: "Priya Nair",
    contactRole: "Data Protection Officer",
    approvedTools: ["Microsoft 365 Copilot on your work account"],
    askFirstTools: ["Claude Team", "Gemini in Google Workspace"],
    bannedTools: ["Personal ChatGPT", "Browser extensions that read the page", "Meeting note-takers"],
  };
  return (
    <ClearedPlayer
      manifest={manifest}
      track={track}
      firm={firm}
      tool={tool}
      learnerName="Hannah"
      courseMap={MODULE_LIST.map((x) => ({ ...x, done: false }))}
      live={false}
    />
  );
}
