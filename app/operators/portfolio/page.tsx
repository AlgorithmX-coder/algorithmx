import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPortfolio } from "@/app/lib/opsPortfolio.actions";
import { HIGHEST_BUILT_MODULE } from "@/app/operators/range/modules";
import { CURRICULUM, PHASE_ORDER, PHASE_COLOR } from "@/app/operators/range/curriculum";
import { OPS_RANKS } from "@/app/lib/opsRank";
import OpsBackdrop from "@/app/operators/range/OpsBackdrop";
import ResumeStrip from "./ResumeStrip";

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
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 880 }}>
        {/* header */}
        <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".26em", textTransform: "uppercase", color: C.cyan, fontWeight: 700, textShadow: TSHADOW }}>Redoubt · Operator file</div>
        <h1 style={{ fontFamily: DISP, fontSize: "clamp(28px,5vw,40px)", fontWeight: 700, margin: "12px 0 6px", letterSpacing: "-.01em", color: "#ffffff", textShadow: TSHADOW }}>Your portfolio</h1>
        <p style={{ color: C.ink, fontSize: 15, lineHeight: 1.6, margin: "0 0 28px", maxWidth: "58ch", textShadow: TSHADOW }}>
          Every module you clear files a professional-grade finding here. This is the real thing you walk away with: show a teacher, a UCAS form, or a first employer.
        </p>

        {/* operator standing - the hero dashboard (stats stand out, not a plain row) */}
        <OperatorCard rank={rank} rep={p?.totalRep ?? 0} findingsCount={findings.length} cleared={done.size} />

        {/* continue where you left off: in-progress modules from this device */}
        <ResumeStrip />

        {/* course map — the full posting, status per module */}
        <div style={{ marginBottom: 34 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 14px" }}>
            <span style={{ width: 18, height: 2, background: C.cyan, borderRadius: 2, boxShadow: `0 0 8px ${C.cyan}` }} />
            <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.ink, fontWeight: 700, textShadow: TSHADOW }}>The posting · {done.size}/{CURRICULUM.length} modules cleared</span>
          </div>
          {PHASE_ORDER.map((phase) => {
            const pc = PHASE_COLOR[phase];
            const mods = CURRICULUM.filter((m) => m.phase === phase);
            const clearedN = mods.filter((m) => done.has(m.no)).length;
            return (
            <div key={phase} style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 11 }}>
                <span style={{ width: 22, height: 3, borderRadius: 2, background: pc, boxShadow: `0 0 10px ${pc}` }} />
                <span style={{ fontFamily: DISP, fontSize: 13, letterSpacing: ".14em", textTransform: "uppercase", color: pc, fontWeight: 700, textShadow: TSHADOW }}>{phase}</span>
                <span style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute }}>{clearedN}/{mods.length}</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: 10 }}>
                {mods.map((m) => (
                  <ModuleTile key={m.no} no={m.no} title={m.title} pc={pc} isDone={done.has(m.no)} isNext={m.no === nextModule} playable={m.no <= HIGHEST_BUILT_MODULE} />
                ))}
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

/* ---------- operator dashboard (the hero: stats stand out) ---------- */
function OperatorCard({ rank, rep, findingsCount, cleared }: { rank?: { rank: string; next?: unknown; label?: string; fraction?: number } | null; rep: number; findingsCount: number; cleared: number }) {
  const rankName = rank?.rank ?? "Recruit";
  const pct = Math.round((rank?.fraction ?? 0) * 100);
  return (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: 22, padding: "26px 28px", marginBottom: 30, background: `radial-gradient(120% 150% at 0% 0%, rgba(139,123,255,0.30), transparent 55%), radial-gradient(120% 150% at 100% 0%, rgba(95,230,255,0.22), transparent 52%), linear-gradient(150deg, rgba(22,25,34,0.92), #0c0e16)`, border: `1px solid ${C.indigo}66`, boxShadow: `0 30px 70px -34px #000, 0 0 60px -30px ${C.indigo}`, backdropFilter: BLUR, WebkitBackdropFilter: BLUR }}>
      <div style={{ display: "flex", gap: 22, alignItems: "center", justifyContent: "space-between", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 200 }}>
          <RankBadge rank={rankName} />
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: ".22em", textTransform: "uppercase", color: C.cyan, fontWeight: 700 }}>Current rank</div>
            <div style={{ fontFamily: DISP, fontSize: "clamp(26px,5vw,38px)", fontWeight: 700, color: "#fff", lineHeight: 1, marginTop: 4, textShadow: `0 0 20px ${C.indigo}55` }}>{rankName}</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <StatBig n={String(rep)} l="reputation" tone={C.amber} />
          <StatBig n={String(findingsCount)} l="findings filed" tone={C.green} />
          <StatBig n={`${cleared}/${CURRICULUM.length}`} l="modules cleared" tone={C.cyan} />
        </div>
      </div>
      {rank?.next ? (
        <div style={{ marginTop: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11, color: C.soft, marginBottom: 7 }}>
            <span style={{ color: C.indigo2 }}>{rankName}</span><span>{rank?.label}</span>
          </div>
          <div style={{ height: 10, borderRadius: 999, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: `linear-gradient(90deg, ${C.indigo}, ${C.cyan}, ${C.amber})`, boxShadow: `0 0 16px ${C.cyan}` }} />
          </div>
        </div>
      ) : null}
    </div>
  );
}
/* Rank insignia: a hexagon with chevrons (one per rank tier you've reached), so
 * it reads as a real rank emblem rather than a single placeholder letter. */
function RankBadge({ rank }: { rank: string }) {
  const tier = Math.max(0, OPS_RANKS.findIndex((r) => r.name === rank));
  return (
    <div style={{ position: "relative", width: 64, height: 70, flexShrink: 0, display: "grid", placeItems: "center" }}>
      <svg width="64" height="70" viewBox="0 0 64 70" style={{ position: "absolute", inset: 0 }} aria-hidden>
        <polygon points="32,2 60,17 60,53 32,68 4,53 4,17" fill="rgba(139,123,255,0.16)" stroke="#8b7bff" strokeWidth="1.5" />
        <polygon points="32,10 53,21 53,49 32,60 11,49 11,21" fill="none" stroke="rgba(95,230,255,0.4)" strokeWidth="1" />
      </svg>
      <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 3.5, alignItems: "center", filter: `drop-shadow(0 0 4px ${C.indigo}aa)` }} aria-hidden>
        {Array.from({ length: tier + 1 }).map((_, i) => (
          <svg key={i} width="23" height="7" viewBox="0 0 23 7"><path d="M2 6 L11.5 1.6 L21 6" fill="none" stroke="#c2b8ff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
        ))}
      </div>
    </div>
  );
}
function StatBig({ n, l, tone }: { n: string; l: string; tone: string }) {
  return (
    <div style={{ minWidth: 96, padding: "13px 17px", borderRadius: 14, background: "rgba(0,0,0,0.32)", border: `1px solid ${tone}3a` }}>
      <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: "clamp(26px,4vw,34px)", color: tone, lineHeight: 1, textShadow: `0 0 18px ${tone}55` }}>{n}</div>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: ".1em", textTransform: "uppercase", color: C.mute, marginTop: 7 }}>{l}</div>
    </div>
  );
}
/* ---------- a module tile on the mission board ---------- */
function ModuleTile({ no, title, pc, isDone, isNext, playable }: { no: number; title: string; pc: string; isDone: boolean; isNext: boolean; playable: boolean }) {
  const inner = (
    <div className={isNext ? "ops-next" : undefined} style={{ position: "relative", height: "100%", minHeight: 96, display: "flex", flexDirection: "column", padding: "13px 14px", borderRadius: 13, background: isNext ? NEXT_BG : GLASS_SOFT, backdropFilter: BLUR, WebkitBackdropFilter: BLUR, border: `1px solid ${isNext ? "rgba(95,230,255,0.55)" : C.lineSoft}`, borderTop: `3px solid ${isDone ? C.green : isNext ? C.cyan : pc}`, boxShadow: isNext ? undefined : "0 6px 18px rgba(0,0,0,0.26)", opacity: playable ? 1 : 0.6 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isDone ? C.green : isNext ? C.cyan : pc, textShadow: isNext ? `0 0 12px ${C.cyan}` : undefined }}>M{String(no).padStart(2, "0")}</span>
        {isDone ? <span aria-hidden style={{ color: C.green, fontSize: 14, fontWeight: 700 }}>✓</span>
          : isNext ? <span style={{ fontFamily: MONO, fontSize: 9, fontWeight: 700, letterSpacing: ".1em", color: "#eafbff", background: "rgba(95,230,255,0.16)", border: "1px solid rgba(95,230,255,0.7)", borderRadius: 5, padding: "2px 7px" }}>NEXT ▸</span>
          : !playable ? <span style={{ fontFamily: MONO, fontSize: 9.5, color: C.mute }}>soon</span> : null}
      </div>
      <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 14.5, color: isNext ? "#fff" : playable ? C.ink : C.mute, lineHeight: 1.25, marginTop: 9 }}>{title}</span>
      {isDone && <span style={{ marginTop: "auto", paddingTop: 10, fontFamily: MONO, fontSize: 10, letterSpacing: ".06em", color: C.green }}>FINDING FILED</span>}
      {isNext && <span style={{ marginTop: "auto", paddingTop: 10, fontFamily: MONO, fontSize: 10, letterSpacing: ".06em", color: C.cyan }}>START HERE</span>}
    </div>
  );
  return playable ? <Link href={`/operators/play/${no}`} style={{ textDecoration: "none", height: "100%" }}>{inner}</Link> : <div style={{ height: "100%" }}>{inner}</div>;
}
