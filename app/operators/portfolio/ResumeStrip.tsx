/* "Continue where you left off" (UAT): the in-progress modules for the signed-in
 * learner, surfaced at the top of the portfolio. The data is account-wide (saved
 * server-side by the Engagement shell), fetched by the portfolio page and passed
 * in, so it follows the learner across devices. Renders nothing when there's
 * nothing in progress. Presentational only - no client state needed. */

import Link from "next/link";
import { CURRICULUM } from "@/app/operators/range/curriculum";

const BEAT_LABEL: Record<string, string> = {
  lesson: "Lesson", authorize: "Scope", act: "Capture", drills: "Drills", challenge: "Challenge", defend: "Defend",
};

const C = {
  ink: "#eef2fb", cyan: "#5fe6ff", indigo: "#8b7bff", indigo2: "#c2b8ff",
};
const GLASS_SOFT = "rgba(20,23,33,0.82)";
const BLUR = "blur(8px)";
const TSHADOW = "0 1px 12px rgba(6,8,14,0.9), 0 0 3px rgba(6,8,14,0.7)";
const DISP = "var(--font-chakra),'Chakra Petch',system-ui,sans-serif";
const MONO = "var(--font-plex-mono),ui-monospace,Menlo,monospace";

export default function ResumeStrip({ items }: { items: { module: number; beat: string }[] }) {
  const titleOf = new Map(CURRICULUM.map((m) => [m.no, m.title] as const));
  const rows = items
    .filter((it) => BEAT_LABEL[it.beat] && titleOf.has(it.module))
    .map((it) => ({ no: it.module, title: titleOf.get(it.module)!, beat: BEAT_LABEL[it.beat] }));

  if (rows.length === 0) return null;

  return (
    <div style={{ marginBottom: 30 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 14px" }}>
        <span style={{ width: 18, height: 2, background: C.cyan, borderRadius: 2, boxShadow: `0 0 8px ${C.cyan}` }} />
        <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.ink, fontWeight: 700, textShadow: TSHADOW }}>Continue where you left off</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 10 }}>
        {rows.map((it) => (
          <Link key={it.no} href={`/operators/play/${it.no}`} style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "13px 15px", borderRadius: 13, background: GLASS_SOFT, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C.indigo}55`, borderLeft: `3px solid ${C.cyan}`, boxShadow: "0 6px 18px rgba(0,0,0,0.26)" }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontFamily: MONO, fontSize: 11, color: C.indigo2, fontWeight: 600 }}>M{String(it.no).padStart(2, "0")} · <span style={{ color: C.cyan }}>{it.beat}</span></div>
                <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15, color: C.ink, lineHeight: 1.2, marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.title}</div>
              </div>
              <span aria-hidden style={{ fontFamily: MONO, fontSize: 12, color: C.cyan, flexShrink: 0 }}>Resume →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
