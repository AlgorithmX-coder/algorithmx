import Link from "next/link";
import { AnimatedRing, RevealOnScroll } from "@/app/components/AnimatedDashboardV2";
import { DashboardParticles } from "@/app/components/DashboardAtmosphere";

/* ── cool cosmic palette (mirrors the learner dashboard) ── */
const C = {
  card: "rgba(13, 19, 44, 0.62)",
  border: "rgba(86, 140, 230, 0.22)",
  borderStrong: "rgba(54, 214, 255, 0.42)",
  text: "#eaf1ff",
  textSoft: "#bcc8ee",
  textMuted: "rgba(150, 172, 224, 0.62)",
  cyan: "#36d6ff",
  cyanSoft: "#8fe9ff",
  violet: "#8b6cff",
  violetSoft: "#a98bff",
  amber: "#ffc15e",
  moss: "#7eff97",
  dark: "#05060f",
};
const GRAD_PRIMARY = `linear-gradient(135deg, ${C.cyan} 0%, ${C.violet} 100%)`;
const GRAD_NAME = `linear-gradient(120deg, ${C.cyan} 0%, ${C.violetSoft} 100%)`;
const SHADOW_CARD = "0 24px 48px -22px rgba(2, 4, 12, 0.85)";
const FONT_BODY = "var(--font-dm-sans), 'DM Sans', system-ui, -apple-system, sans-serif";
const FONT_DISPLAY = "var(--font-space-grotesk), 'Space Grotesk', system-ui, -apple-system, sans-serif";

export type WeekState = "completed" | "in_progress" | "not_started";
export interface WeekCell { week: number; state: WeekState; stars: number; }
export interface ChildSummary {
  id: string;
  name: string;
  age: number;
  completedCount: number;
  totalStars: number;
  weeks: WeekCell[];
}
export interface ParentViewProps {
  productName: string;
  weeksCount: number;
  summaries: ChildSummary[];
  /** Logout server action. Omit in dev preview. */
  onLogout?: () => void | Promise<void>;
}

function ShieldLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ filter: "drop-shadow(0 0 8px rgba(54, 214, 255, 0.65))" }}>
      <defs>
        <linearGradient id="parentShieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={C.cyan} />
          <stop offset="100%" stopColor={C.violet} />
        </linearGradient>
      </defs>
      <path d="M12 2.5L3.5 5.6V12c0 5.4 3.7 8.6 8.5 9.5 4.8-.9 8.5-4.1 8.5-9.5V5.6L12 2.5z" stroke="url(#parentShieldGrad)" strokeWidth={1.6} fill="rgba(54, 214, 255, 0.14)" strokeLinejoin="round" />
      <path d="M12 8v8M8 12h8" stroke="url(#parentShieldGrad)" strokeWidth={1.4} strokeLinecap="round" />
      <circle cx="12" cy="12" r="1.3" fill="url(#parentShieldGrad)" />
    </svg>
  );
}

function StarGlyph() {
  return (
    <svg width={9} height={9} viewBox="0 0 24 24" fill="#ffd158" aria-hidden style={{ display: "block" }}>
      <path d="M12 2.5l2.9 6.2 6.6.8-4.9 4.6 1.4 6.7L12 17.6l-6 3.2 1.4-6.7L2.5 9.5l6.6-.8L12 2.5z" />
    </svg>
  );
}

function Stars({ count }: { count: number }) {
  const safe = Math.max(0, Math.min(3, count));
  return (
    <div style={{ display: "flex", gap: 1.5 }} aria-label={`${safe} stars`}>
      {Array.from({ length: safe }).map((_, i) => <StarGlyph key={i} />)}
    </div>
  );
}

export default function ParentView({ productName, weeksCount, summaries, onLogout }: ParentViewProps) {
  return (
    <div style={{ minHeight: "100vh", position: "relative", color: C.text, fontFamily: FONT_BODY, background: `radial-gradient(ellipse 90% 60% at 50% -10%, #141a3e 0%, #0a0e22 38%, ${C.dark} 72%, #03040b 100%)` }}>
      {/* cosmic atmosphere */}
      <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "-6%", right: "-8%", width: "46vw", height: "46vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,108,255,0.16) 0%, transparent 62%)", filter: "blur(20px)" }} />
        <div style={{ position: "absolute", left: "-34vw", top: "8%", width: "62vw", height: "62vw", borderRadius: "50%", border: "1.5px solid rgba(90,160,255,0.28)", background: "radial-gradient(circle at 78% 38%, rgba(45,90,200,0.20) 0%, rgba(20,40,110,0.06) 45%, transparent 68%)", boxShadow: "0 0 100px rgba(70,140,255,0.18), inset -20px 0 80px rgba(90,160,255,0.12)" }} />
      </div>
      <DashboardParticles />

      <style>{`
        .pdash h1, .pdash h2, .pdash .display { font-family: ${FONT_DISPLAY}; letter-spacing: -0.01em; }
        .lift { transition: transform .2s cubic-bezier(.16,1,.3,1); }
        .lift:hover { transform: translateY(-2px); }
        @media (max-width: 540px) { .p-hub, .p-tag { display: none !important; } }
      `}</style>

      <div className="pdash" style={{ position: "relative", zIndex: 1 }}>
        {/* ── NAV ── */}
        <div style={{ position: "sticky", top: 0, zIndex: 50, padding: "16px 16px 0" }}>
          <nav style={{ maxWidth: 1080, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, borderRadius: 16, padding: "12px 18px", background: "rgba(10, 14, 32, 0.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${C.border}`, boxShadow: "0 18px 40px -22px rgba(2,4,12,0.9)" }}>
            <Link href="/hub" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <span style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(54,214,255,0.1)", border: `1px solid ${C.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 18px rgba(54,214,255,0.3)" }}>
                <ShieldLogo size={22} />
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="display" style={{ color: C.text, fontSize: 18, fontWeight: 700 }}>CyberHeroes</span>
                <span className="p-tag" style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: C.cyan, background: "rgba(54,214,255,0.1)", border: `1px solid ${C.border}`, borderRadius: 999, padding: "3px 9px" }}>Parent</span>
              </span>
            </Link>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <Link href="/hub" className="lift p-hub" style={{ color: C.cyan, fontSize: 13, fontWeight: 800, textDecoration: "none", padding: "8px 18px", borderRadius: 999, border: `1px solid ${C.borderStrong}`, background: "rgba(54,214,255,0.08)" }}>Hub</Link>
              {onLogout ? (
                <form action={onLogout}>
                  <button type="submit" style={{ background: "transparent", color: C.textSoft, fontSize: 13, fontWeight: 800, padding: "8px 16px", borderRadius: 999, border: `1px solid ${C.border}`, cursor: "pointer", fontFamily: "inherit" }}>Log out</button>
                </form>
              ) : (
                <span style={{ background: "transparent", color: C.textSoft, fontSize: 13, fontWeight: 800, padding: "8px 16px", borderRadius: 999, border: `1px solid ${C.border}` }}>Log out</span>
              )}
            </div>
          </nav>
        </div>

        <main style={{ maxWidth: 1080, margin: "0 auto", padding: "36px 24px 80px" }}>
          <RevealOnScroll>
            <header style={{ marginBottom: 30 }}>
              <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.18em", textTransform: "uppercase", color: C.cyan, marginBottom: 10 }}>
                {productName} · Progress Report
              </div>
              <h1 className="display" style={{ fontSize: "clamp(2rem, 4vw, 2.6rem)", lineHeight: 1.1, fontWeight: 700, color: C.text, margin: 0 }}>
                Your family{" "}
                <span style={{ background: GRAD_NAME, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>at a glance</span>
              </h1>
              <p style={{ marginTop: 12, fontSize: 15, color: C.textSoft, lineHeight: 1.6, maxWidth: 620 }}>
                A simple read-out of weeks completed and stars earned. Tap any started week for a closer look at how it went.
              </p>
            </header>
          </RevealOnScroll>

          {summaries.length === 0 && (
            <RevealOnScroll delay={80}>
              <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: 28, boxShadow: SHADOW_CARD, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                <h2 className="display" style={{ fontSize: 18, fontWeight: 700, color: C.text, margin: 0, marginBottom: 6 }}>No child profiles yet</h2>
                <p style={{ color: C.textSoft, fontSize: 14, lineHeight: 1.6, margin: 0 }}>Add a child to start tracking their journey through {productName}.</p>
                <Link href="/onboarding" className="lift" style={{ display: "inline-block", marginTop: 16, padding: "12px 22px", borderRadius: 999, background: GRAD_PRIMARY, color: C.dark, fontWeight: 800, fontSize: 14, textDecoration: "none", boxShadow: "0 14px 32px -10px rgba(54,214,255,0.5)" }}>Add a child profile</Link>
              </section>
            </RevealOnScroll>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
            {summaries.map((c, i) => (
              <RevealOnScroll key={c.id} delay={80 + i * 60}>
                <ChildCard child={c} weeksCount={weeksCount} />
              </RevealOnScroll>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

/* ───────────────────────── CHILD CARD ───────────────────────── */
function ChildCard({ child, weeksCount }: { child: ChildSummary; weeksCount: number }) {
  const pct = weeksCount > 0 ? (child.completedCount / weeksCount) * 100 : 0;
  return (
    <section style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 22, padding: 26, boxShadow: SHADOW_CARD, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, minWidth: 0 }}>
          <span style={{ width: 48, height: 48, borderRadius: 100, background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, fontWeight: 900, color: C.dark, boxShadow: "0 2px 12px rgba(54,214,255,0.4)" }}>
            {child.name.charAt(0).toUpperCase()}
          </span>
          <div style={{ minWidth: 0 }}>
            <h2 className="display" style={{ margin: 0, fontSize: 22, fontWeight: 700, color: C.text }}>
              {child.name}{" "}
              <span style={{ fontSize: 14, color: C.textMuted, fontWeight: 500 }}>· age {child.age}</span>
            </h2>
            <p style={{ margin: "4px 0 0", color: C.textSoft, fontSize: 14, lineHeight: 1.5 }}>
              <span style={{ color: C.cyan, fontWeight: 800 }}>{child.completedCount}</span> of {weeksCount} weeks complete
              <span style={{ color: C.textMuted, margin: "0 8px" }}>·</span>
              <span style={{ color: "#ffd158", fontWeight: 800 }}>{child.totalStars}</span> stars
            </p>
          </div>
        </div>
        <div style={{ flexShrink: 0 }}>
          <AnimatedRing percent={pct} size={86} radius={36} strokeWidth={8} gradientFrom={C.cyan} gradientTo={C.violet} glow="rgba(54,214,255,0.5)" track="rgba(86,140,230,0.16)" label={C.cyanSoft} />
        </div>
      </div>

      <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(58px, 1fr))", gap: 10 }}>
        {child.weeks.map((w) => <WeekDot key={w.week} cell={w} />)}
      </div>

      <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 18, fontSize: 12, color: C.textMuted }}>
        <LegendSwatch color={C.moss} label="Complete" />
        <LegendSwatch color={C.amber} label="In progress" />
        <LegendSwatch color="rgba(54,214,255,0.14)" ringColor={C.border} label="Not started" />
      </div>
    </section>
  );
}

/* ───────────────────────── WEEK DOT ───────────────────────── */
function WeekDot({ cell }: { cell: WeekCell }) {
  const { week, state, stars } = cell;
  let bg: string; let border: string; let textColor: string; let glow: string | undefined;
  if (state === "completed") {
    bg = `linear-gradient(135deg, ${C.moss}, ${C.cyan})`;
    border = `1px solid ${C.moss}99`;
    textColor = C.dark;
    glow = `0 0 16px ${C.moss}55`;
  } else if (state === "in_progress") {
    bg = "rgba(255,193,94,0.18)";
    border = `1px solid ${C.amber}88`;
    textColor = C.amber;
    glow = "0 0 12px rgba(255,193,94,0.25)";
  } else {
    bg = "rgba(54,214,255,0.05)";
    border = `1px solid ${C.border}`;
    textColor = C.textMuted;
  }

  const body = (
    <div
      className={state === "not_started" ? undefined : "lift"}
      style={{ position: "relative", aspectRatio: "1 / 1", borderRadius: 14, background: bg, border, boxShadow: glow, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: state === "not_started" ? "default" : "pointer" }}
      title={`Week ${week} · ${state === "completed" ? `complete (${stars}★)` : state === "in_progress" ? "in progress" : "not started"}`}
    >
      <div style={{ fontSize: 11, fontWeight: 800, color: textColor, letterSpacing: "0.04em", lineHeight: 1 }}>W{week}</div>
      {state === "completed" && stars > 0 && <div style={{ marginTop: 2 }}><Stars count={stars} /></div>}
    </div>
  );

  if (state === "not_started") return body;
  return (
    <Link href={`/parent/week/${week}`} style={{ textDecoration: "none" }} aria-label={`Open week ${week} details`}>
      {body}
    </Link>
  );
}

function LegendSwatch({ color, ringColor, label }: { color: string; ringColor?: string; label: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 10, height: 10, borderRadius: 4, background: color, border: ringColor ? `1px solid ${ringColor}` : undefined, display: "inline-block" }} />
      {label}
    </div>
  );
}
