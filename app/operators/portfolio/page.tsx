import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPortfolio } from "@/app/lib/opsPortfolio.actions";
import { HIGHEST_BUILT_MODULE } from "@/app/operators/range/modules";
import { CURRICULUM, PHASE_ORDER, PHASE_COLOR } from "@/app/operators/range/curriculum";
import OpsBackdrop from "@/app/operators/range/OpsBackdrop";

export const metadata: Metadata = {
  title: "Cyber Ops · Portfolio",
  robots: { index: false, follow: false },
};

/* Tier tokens (mirrors the range's design system; inlined so this server
 * component doesn't import the "use client" Engagement module). */
const C = {
  carbon: "#16181f", panel: "#1d212c", line: "rgba(139,123,255,0.20)", lineSoft: "rgba(166,178,214,0.12)",
  ink: "#eef2fb", soft: "#c3cce0", mute: "#8e98b4", indigo: "#8b7bff", indigo2: "#c2b8ff",
  cyan: "#5fe6ff", green: "#55d98c", red: "#f26d72", amber: "#e8a33d",
};
/* Glass surfaces: translucent panels, now with enough body to hold the type
 * clear of the live terminal behind them. backdropFilter frosts the backdrop. */
const GLASS = "rgba(20,23,33,0.90)";
const GLASS_SOFT = "rgba(20,23,33,0.82)";
const BLUR = "blur(8px)";
/* Cool glowing theme for the NEXT module - electric cyan over indigo. */
const NEXT_BG = "linear-gradient(135deg, rgba(18,46,64,0.92), rgba(38,32,80,0.92))";
/* Shadow for text sitting directly on the backdrop (no panel behind it), so it
 * stays legible over the terminal chatter. */
const TSHADOW = "0 1px 12px rgba(6,8,14,0.9), 0 0 3px rgba(6,8,14,0.7)";
const DISP = "var(--font-chakra),'Chakra Petch',system-ui,sans-serif";
const MONO = "var(--font-plex-mono),ui-monospace,Menlo,monospace";
const SANS = "var(--font-plex-sans),system-ui,sans-serif";

/* Pulse for the NEXT card's glow; disabled under reduced motion. */
const GLOW_CSS = `
@keyframes opsNextPulse {
  0%,100% { box-shadow: 0 0 0 1px rgba(95,230,255,0.30), 0 0 20px rgba(95,230,255,0.24), 0 10px 28px rgba(0,0,0,0.45); }
  50%     { box-shadow: 0 0 0 1px rgba(95,230,255,0.55), 0 0 34px rgba(95,230,255,0.48), 0 10px 28px rgba(0,0,0,0.5); }
}
.ops-next { animation: opsNextPulse 2.6s ease-in-out infinite; }
@media (prefers-reduced-motion: reduce) { .ops-next { animation: none; box-shadow: 0 0 0 1px rgba(95,230,255,0.4), 0 0 26px rgba(95,230,255,0.33), 0 10px 28px rgba(0,0,0,0.45); } }
`;

const SEV_COLOR: Record<string, string> = { LOW: C.soft, MEDIUM: C.amber, HIGH: C.red, CRITICAL: C.red };
const SEV_LABEL: Record<string, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical" };

export default async function OperatorsPortfolioPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/operators/portfolio");

  const p = await getPortfolio();
  const findings = p?.findings ?? [];
  const rank = p?.rank;
  const done = new Set(findings.map((f) => f.module));
  const nextModule = CURRICULUM.find((m) => !done.has(m.no) && m.no <= HIGHEST_BUILT_MODULE)?.no ?? null;

  return (
    <main style={{ position: "relative", minHeight: "100vh", background: "transparent", color: C.ink, fontFamily: SANS, display: "grid", placeItems: "start center", padding: "56px 20px 100px" }}>
      <OpsBackdrop />
      <style>{GLOW_CSS}</style>
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 760 }}>
        {/* header */}
        <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".26em", textTransform: "uppercase", color: C.cyan, fontWeight: 700, textShadow: TSHADOW }}>Redoubt · Operator file</div>
        <h1 style={{ fontFamily: DISP, fontSize: "clamp(28px,5vw,40px)", fontWeight: 700, margin: "12px 0 6px", letterSpacing: "-.01em", color: "#ffffff", textShadow: TSHADOW }}>Your portfolio</h1>
        <p style={{ color: C.ink, fontSize: 15, lineHeight: 1.6, margin: "0 0 28px", maxWidth: "58ch", textShadow: TSHADOW }}>
          Every module you clear files a professional-grade finding here. This is the real thing you walk away with: show a teacher, a UCAS form, or a first employer.
        </p>

        {/* standing */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 30 }}>
          <Stat label="Rank" value={rank?.rank ?? "Recruit"} tone={C.indigo2} />
          <Stat label="Reputation" value={String(p?.totalRep ?? 0)} tone={C.amber} />
          <Stat label="Findings filed" value={`${findings.length}`} tone={C.green} />
        </div>
        {rank && rank.next && (
          <div style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11.5, color: C.soft, marginBottom: 7, textShadow: TSHADOW }}>
              <span style={{ color: C.indigo2 }}>{rank.rank}</span><span>{rank.label}</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.07)", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${Math.round(rank.fraction * 100)}%`, borderRadius: 999, background: `linear-gradient(90deg, ${C.indigo}, ${C.amber})`, boxShadow: `0 0 12px ${C.amber}` }} />
            </div>
          </div>
        )}

        {/* course map — the full posting, status per module */}
        <div style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 14px" }}>
            <span style={{ width: 18, height: 2, background: C.cyan, borderRadius: 2, boxShadow: `0 0 8px ${C.cyan}` }} />
            <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.ink, fontWeight: 700, textShadow: TSHADOW }}>The posting · {done.size}/16 modules cleared</span>
          </div>
          {PHASE_ORDER.map((phase) => {
            const pc = PHASE_COLOR[phase];
            return (
            <div key={phase} style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
                <span style={{ width: 22, height: 3, borderRadius: 2, background: pc, boxShadow: `0 0 10px ${pc}` }} />
                <span style={{ fontFamily: DISP, fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: pc, fontWeight: 700, textShadow: TSHADOW }}>{phase}</span>
              </div>
              <div style={{ display: "grid", gap: 6 }}>
                {CURRICULUM.filter((m) => m.phase === phase).map((m) => {
                  const isDone = done.has(m.no);
                  const isNext = m.no === nextModule;
                  const playable = m.no <= HIGHEST_BUILT_MODULE;
                  const inner = (
                    <div className={isNext ? "ops-next" : undefined} style={{ display: "flex", gap: 11, alignItems: "center", padding: isNext ? "13px 14px" : "10px 13px", borderRadius: 10, background: isNext ? NEXT_BG : GLASS_SOFT, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${isNext ? "rgba(95,230,255,0.55)" : C.lineSoft}`, borderLeft: `3px solid ${isNext ? C.cyan : pc}`, boxShadow: isNext ? undefined : "0 4px 14px rgba(0,0,0,0.22)" }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isDone ? C.green : isNext ? C.cyan : pc, minWidth: 30, textShadow: isNext ? `0 0 12px ${C.cyan}` : undefined }}>{isDone ? "✓" : `M${String(m.no).padStart(2, "0")}`}</span>
                      <span style={{ fontSize: isNext ? 14.5 : 13.5, fontWeight: isNext ? 600 : 400, color: isNext ? "#ffffff" : playable ? C.ink : C.mute, flex: 1 }}>{m.title}</span>
                      {isNext && <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: ".1em", color: "#eafbff", background: "rgba(95,230,255,0.16)", border: "1px solid rgba(95,230,255,0.7)", borderRadius: 5, padding: "3px 9px", boxShadow: `0 0 12px ${C.cyan}66`, textShadow: `0 0 8px ${C.cyan}` }}>NEXT ▸</span>}
                      {isDone && !isNext && <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.green }}>filed</span>}
                      {!playable && <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute }}>soon</span>}
                    </div>
                  );
                  return playable ? (
                    <Link key={m.no} href={`/operators/play/${m.no}`} style={{ textDecoration: "none" }}>{inner}</Link>
                  ) : (
                    <div key={m.no}>{inner}</div>
                  );
                })}
              </div>
            </div>
            );
          })}
        </div>

        {/* findings */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 14px" }}>
          <span style={{ width: 18, height: 2, background: C.cyan, borderRadius: 2, boxShadow: `0 0 8px ${C.cyan}` }} />
          <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.ink, fontWeight: 700, textShadow: TSHADOW }}>Findings filed</span>
        </div>
        {findings.length === 0 ? (
          <div style={{ padding: "40px 28px", textAlign: "center", background: GLASS, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px dashed ${C.line}`, borderRadius: 16, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 19, marginBottom: 8 }}>No findings yet.</div>
            <p style={{ color: C.soft, fontSize: 14, lineHeight: 1.6, maxWidth: "42ch", margin: "0 auto 20px" }}>
              Clear your first module to file your first finding. It takes about an hour, and you act for real on day one.
            </p>
            <Link href="/operators/play/1" className="ops-next" style={{ display: "inline-block", padding: "12px 22px", borderRadius: 9, background: "linear-gradient(135deg, #5fe6ff, #8b7bff)", color: "#071018", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".06em", textDecoration: "none" }}>
              Begin Module 01 →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {findings.map((f) => (
              <div key={f.module} style={{ background: GLASS, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C.line}`, borderRadius: 14, padding: "18px 20px", boxShadow: "0 8px 24px rgba(0,0,0,0.28)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                  <span style={{ fontFamily: MONO, fontSize: 11.5, color: C.indigo, fontWeight: 600 }}>M-{String(f.module).padStart(2, "0")}</span>
                  <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16.5 }}>{f.title}</span>
                  <span style={{ marginLeft: "auto", fontFamily: MONO, fontSize: 11, color: SEV_COLOR[f.severity], border: `1px solid ${SEV_COLOR[f.severity]}55`, padding: "2px 8px", borderRadius: 6 }}>
                    {SEV_LABEL[f.severity]} · CVSS {f.cvss}
                  </span>
                </div>
                <div style={{ fontFamily: MONO, fontSize: 12.5, color: C.mute, marginTop: 6 }}>{f.location}</div>
                <p style={{ fontSize: 13.5, color: C.soft, marginTop: 10, lineHeight: 1.55 }}><b style={{ color: C.ink }}>Impact.</b> {f.impact}</p>
                <p style={{ fontSize: 13.5, color: C.soft, marginTop: 5, lineHeight: 1.55 }}><b style={{ color: C.ink }}>Fix.</b> {f.fix}</p>
                <div style={{ fontFamily: MONO, fontSize: 12, color: C.green, marginTop: 10 }}>{f.flag}</div>
              </div>
            ))}
            {HIGHEST_BUILT_MODULE > findings.length && (
              <Link href={`/operators/play/${Math.min(HIGHEST_BUILT_MODULE, (findings[findings.length - 1]?.module ?? 0) + 1)}`} style={{ textAlign: "center", padding: "14px", borderRadius: 11, background: GLASS_SOFT, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C.line}`, color: C.indigo2, fontFamily: MONO, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                Continue the posting →
              </Link>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div style={{ background: GLASS, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${C.lineSoft}`, borderRadius: 13, padding: "16px 18px", boxShadow: "0 6px 20px rgba(0,0,0,0.28)" }}>
      <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 22, color: tone, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 5 }}>{label}</div>
    </div>
  );
}
