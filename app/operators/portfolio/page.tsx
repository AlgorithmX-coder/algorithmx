import type { Metadata } from "next";
import { auth } from "@/app/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getPortfolio } from "@/app/lib/opsPortfolio.actions";
import { HIGHEST_BUILT_MODULE } from "@/app/operators/range/modules";
import { CURRICULUM, PHASE_ORDER } from "@/app/operators/range/curriculum";

export const metadata: Metadata = {
  title: "Cyber Ops · Portfolio",
  robots: { index: false, follow: false },
};

/* Tier tokens (mirrors the range's design system; inlined so this server
 * component doesn't import the "use client" Engagement module). */
const C = {
  carbon: "#0a0b0f", panel: "#0f1119", line: "rgba(139,123,255,0.18)", lineSoft: "rgba(166,178,214,0.10)",
  ink: "#e8edff", soft: "#a6b2d6", mute: "#6a7396", indigo: "#8b7bff", indigo2: "#b3a8ff",
  green: "#4ade80", red: "#ff5b62", amber: "#e8a33d",
};
const DISP = "var(--font-chakra),'Chakra Petch',system-ui,sans-serif";
const MONO = "var(--font-plex-mono),ui-monospace,Menlo,monospace";
const SANS = "var(--font-plex-sans),system-ui,sans-serif";

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
    <main style={{ minHeight: "100vh", background: C.carbon, color: C.ink, fontFamily: SANS, display: "grid", placeItems: "start center", padding: "56px 20px 100px" }}>
      <div style={{ width: "100%", maxWidth: 760 }}>
        {/* header */}
        <div style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".26em", textTransform: "uppercase", color: C.indigo, fontWeight: 600 }}>Redoubt · Operator file</div>
        <h1 style={{ fontFamily: DISP, fontSize: "clamp(28px,5vw,40px)", fontWeight: 700, margin: "12px 0 6px", letterSpacing: "-.01em" }}>Your portfolio</h1>
        <p style={{ color: C.soft, fontSize: 15, lineHeight: 1.6, margin: "0 0 28px", maxWidth: "58ch" }}>
          Every module you clear files a professional-grade finding here. This is the real thing you walk away with — show a teacher, a UCAS form, or a first employer.
        </p>

        {/* standing */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 30 }}>
          <Stat label="Rank" value={rank?.rank ?? "Recruit"} tone={C.indigo2} />
          <Stat label="Reputation" value={String(p?.totalRep ?? 0)} tone={C.amber} />
          <Stat label="Findings filed" value={`${findings.length}`} tone={C.green} />
        </div>
        {rank && rank.next && (
          <div style={{ marginBottom: 34 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 11.5, color: C.mute, marginBottom: 7 }}>
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
            <span style={{ width: 18, height: 2, background: C.indigo, borderRadius: 2 }} />
            <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.soft, fontWeight: 600 }}>The posting · {done.size}/16 modules cleared</span>
          </div>
          {PHASE_ORDER.map((phase) => (
            <div key={phase} style={{ marginBottom: 14 }}>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".1em", textTransform: "uppercase", color: C.mute, marginBottom: 7 }}>{phase}</div>
              <div style={{ display: "grid", gap: 6 }}>
                {CURRICULUM.filter((m) => m.phase === phase).map((m) => {
                  const isDone = done.has(m.no);
                  const isNext = m.no === nextModule;
                  const playable = m.no <= HIGHEST_BUILT_MODULE;
                  const inner = (
                    <div style={{ display: "flex", gap: 11, alignItems: "center", padding: "10px 13px", borderRadius: 10, background: isNext ? "rgba(139,123,255,0.07)" : C.panel, border: `1px solid ${isNext ? C.indigo : C.lineSoft}` }}>
                      <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: isDone ? C.green : isNext ? C.indigo2 : C.mute, minWidth: 30 }}>{isDone ? "✓" : `M${String(m.no).padStart(2, "0")}`}</span>
                      <span style={{ fontSize: 13.5, color: playable ? C.ink : C.mute, flex: 1 }}>{m.title}</span>
                      {isNext && <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, letterSpacing: ".08em", color: C.indigo, border: `1px solid ${C.indigo}66`, borderRadius: 5, padding: "2px 7px" }}>NEXT</span>}
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
          ))}
        </div>

        {/* findings */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "0 0 14px" }}>
          <span style={{ width: 18, height: 2, background: C.indigo, borderRadius: 2 }} />
          <span style={{ fontFamily: MONO, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase", color: C.soft, fontWeight: 600 }}>Findings filed</span>
        </div>
        {findings.length === 0 ? (
          <div style={{ padding: "40px 28px", textAlign: "center", background: C.panel, border: `1px dashed ${C.line}`, borderRadius: 16 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 19, marginBottom: 8 }}>No findings yet.</div>
            <p style={{ color: C.soft, fontSize: 14, lineHeight: 1.6, maxWidth: "42ch", margin: "0 auto 20px" }}>
              Clear your first module to file your first finding. It takes about an hour, and you act for real on day one.
            </p>
            <Link href="/operators/play/1" style={{ display: "inline-block", padding: "12px 22px", borderRadius: 9, background: C.indigo, color: "#0f0c26", fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: ".06em", textDecoration: "none" }}>
              Begin Module 01 →
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {findings.map((f) => (
              <div key={f.module} style={{ background: C.panel, border: `1px solid ${C.line}`, borderRadius: 14, padding: "18px 20px" }}>
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
              <Link href={`/operators/play/${Math.min(HIGHEST_BUILT_MODULE, (findings[findings.length - 1]?.module ?? 0) + 1)}`} style={{ textAlign: "center", padding: "14px", borderRadius: 11, border: `1px solid ${C.line}`, color: C.indigo2, fontFamily: MONO, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
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
    <div style={{ background: C.panel, border: `1px solid ${C.lineSoft}`, borderRadius: 13, padding: "16px 18px" }}>
      <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 22, color: tone, lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontFamily: MONO, fontSize: 10.5, color: C.mute, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 5 }}>{label}</div>
    </div>
  );
}
