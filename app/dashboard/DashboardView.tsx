import Image from "next/image";
import {
  RevealOnScroll,
  AnimatedBar,
  AnimatedRing,
  StaggeredList,
} from "@/app/components/AnimatedDashboardV2";
import { DashboardParticles } from "@/app/components/DashboardAtmosphere";
import { WEEK_THEMES } from "@/app/lesson/weekContent/weekThemes";
import { weekArtSrc, WEEK_ART_WEEKS, weekArtPosition } from "@/app/lesson/weekContent/weekArt";

/* ───────────────── CYBER PALETTE (cool cosmic) ───────────────── */
const C = {
  pageBg: "#05060f",
  card: "rgba(13, 19, 44, 0.62)",
  cardSoft: "rgba(13, 19, 44, 0.42)",
  border: "rgba(86, 140, 230, 0.22)",
  borderStrong: "rgba(54, 214, 255, 0.42)",
  text: "#eaf1ff",
  textSoft: "#bcc8ee",
  textMuted: "rgba(150, 172, 224, 0.62)",
  cyan: "#36d6ff",
  cyanSoft: "#8fe9ff",
  blue: "#4d9bff",
  violet: "#8b6cff",
  violetSoft: "#a98bff",
  pink: "#ff4d9d",
  ember: "#ff7a4d",
  moss: "#7eff97",
  mossLight: "#a0ffb0",
  dark: "#05060f",
};
const GRAD_PRIMARY = `linear-gradient(135deg, ${C.cyan} 0%, ${C.violet} 100%)`;
const GRAD_NAME = `linear-gradient(120deg, ${C.cyan} 0%, ${C.violetSoft} 100%)`;
const GRAD_RACCOON = `linear-gradient(90deg, #ff5252, ${C.ember}, ${C.pink}, ${C.violet})`;
const GLOW_PRIMARY =
  "0 14px 32px -10px rgba(54, 214, 255, 0.5), 0 0 0 1px rgba(255,255,255,0.14) inset";
const SHADOW_CARD = "0 24px 48px -22px rgba(2, 4, 12, 0.85)";

const FONT_BODY = "var(--font-dm-sans), 'DM Sans', system-ui, -apple-system, sans-serif";
const FONT_DISPLAY = "var(--font-space-grotesk), 'Space Grotesk', system-ui, -apple-system, sans-serif";

/* Weeks that have a generated themed holographic backdrop strip in
   /public/dashboard/week-bg. Grow this as art lands so a card never points
   at a missing image. */
/* Weeks whose bespoke card art has been drawn and installed in
 * /public/dashboard/week-art. A week NOT listed here falls back to its own
 * colour gradient, which still looks finished, so this grows one week at a
 * time without ever pointing a tile at a missing image. */
/* The shared registry, so the dashboard and the landing page can never
 * disagree about which weeks have art or how it is framed. */
const WEEK_ART = WEEK_ART_WEEKS;
const WEEK_BG_AVAILABLE = new Set<number>([
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
]);

/* ───────────────── ICONS ───────────────── */
function ShieldLogo({ size = 22 }: { size?: number }) {
  return (
    /* Cyber Heroes brand mark (owner 2026-10-17): the amber shield + bolt
       from the course pages, replacing the old generic cyan shield-plus. */
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden style={{ filter: "drop-shadow(0 0 8px rgba(255, 179, 71, 0.6))" }}>
      <path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill="#ffb347" />
      <path d="M13.2 6 L8.6 13 H11.4 L10.6 18 L15.6 11 H12.6 Z" fill="#08101f" />
    </svg>
  );
}

function CheckIcon({ size = 18, color = C.mossLight }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M5 12.5 10 17.5 19 7.5" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CalendarIcon({ size = 22, color = C.cyan }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" stroke={color} strokeWidth="1.6" />
      <path d="M3.5 9.5h17M8 3.5v3M16 3.5v3" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <rect x="7" y="12.5" width="3" height="3" rx="0.6" fill={color} />
    </svg>
  );
}

function HourglassIcon({ size = 22, color = C.blue }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6.5 3.5h11M6.5 20.5h11" stroke={color} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M7 3.5c0 4 4 5.5 5 8.5 1-3 5-4.5 5-8.5M7 20.5c0-4 4-5.5 5-8.5 1 3 5 4.5 5 8.5" stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function StarIcon({ size = 22, color = C.violetSoft }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 17.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85L12 3.5z" stroke={color} strokeWidth="1.5" strokeLinejoin="round" fill={`${color}22`} />
    </svg>
  );
}

function ChartIcon({ size = 20, color = C.cyan }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19.5h16" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <rect x="5.5" y="12" width="3" height="6" rx="1" fill={color} opacity="0.85" />
      <rect x="10.5" y="8" width="3" height="10" rx="1" fill={color} opacity="0.85" />
      <rect x="15.5" y="4.5" width="3" height="13.5" rx="1" fill={color} opacity="0.85" />
    </svg>
  );
}

function PersonIcon({ size = 14, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.4" stroke={color} strokeWidth="1.7" />
      <path d="M5.5 20c0-3.6 3-6 6.5-6s6.5 2.4 6.5 6" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function ClockIcon({ size = 14, color = C.textMuted }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="8.5" stroke={color} strokeWidth="1.7" />
      <path d="M12 7.5V12l3 2" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon({ size = 16, color = C.textSoft }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M14 4.5H7.5A2.5 2.5 0 0 0 5 7v10a2.5 2.5 0 0 0 2.5 2.5H14" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M17 8.5 20.5 12 17 15.5M20 12h-9" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrophyIcon({ size = 16, color = C.violetSoft }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M7 4.5h10v4a5 5 0 0 1-10 0v-4Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round" />
      <path d="M7 6H4.5v1.5a3 3 0 0 0 3 3M17 6h2.5v1.5a3 3 0 0 1-3 3" stroke={color} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M12 13.5V17m-3 2.5h6m-5 0c0-1.4 1-2.5 2-2.5s2 1.1 2 2.5" stroke={color} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Pointy-top hexagon frame with a glowing icon inside — the stat tiles. */
function HexIcon({ color, glow, children, size = 58 }: { color: string; glow: string; children: React.ReactNode; size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 58 58" style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 9px ${glow})` }} aria-hidden>
        <polygon points="29,3 53,16.5 53,41.5 29,55 5,41.5 5,16.5" fill={`${color}1f`} stroke={color} strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color }}>{children}</div>
    </div>
  );
}

function StarRow({ stars }: { stars: number }) {
  const clamped = Math.max(0, Math.min(3, stars));
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${clamped} of 3 stars`}>
      {[0, 1, 2].map((i) => (
        <span key={i} aria-hidden style={{ fontSize: 12, color: i < clamped ? "#ffd158" : "rgba(150,172,224,0.3)", filter: i < clamped ? "drop-shadow(0 0 4px rgba(255,209,88,0.6))" : "none" }}>★</span>
      ))}
    </span>
  );
}

/* ───────────────── TYPES ───────────────── */
export type WeekState = "completed" | "inProgress" | "current" | "available";
export interface WeekItem {
  id: string;
  week: number;
  title: string;
  description: string;
  state: WeekState;
  stars: number;
  screen: number | null;
  href: string;
}
export interface DashboardViewProps {
  userName: string;
  childAge: number | null;
  completedCount: number;
  totalWeeks: number;
  progressPct: number;
  remaining: number;
  raccoonPower: number;
  product: { name: string; ageRange: string; weeksCount: number; duration: string } | null;
  weeks: WeekItem[];
  heroCtaHref: string;
  /** Logout server action. Omit in dev preview. */
  onLogout?: () => void | Promise<void>;
}

/* ───────────────── VIEW ───────────────── */
export default function DashboardView({
  userName,
  childAge,
  completedCount,
  totalWeeks,
  progressPct,
  remaining,
  raccoonPower,
  product,
  weeks,
  heroCtaHref,
  onLogout,
}: DashboardViewProps) {
  const allDone = completedCount >= totalWeeks && totalWeeks > 0;
  const heroSub =
    completedCount === 0
      ? "Your first mission is ready. Tap below to begin."
      : allDone
        ? "Every mission complete — the Hacker Raccoon is defeated!"
        : `${completedCount} of ${totalWeeks} weeks done. Keep the momentum going.`;
  const heroCtaLabel =
    completedCount === 0 ? "Start Your First Mission" : allDone ? "Revisit Week 1" : "Continue Mission";

  /* The four-phase ladder from the course: five weeks earns the next rank. */
  const RANKS = ["Cyber Cadet", "Cyber Guardian", "Cyber Defender", "Certified Cyber Hero"];
  const ranksEarned = Math.min(RANKS.length, Math.floor(completedCount / 5));
  const intoPhase = completedCount % 5;
  const toNextRank = ranksEarned >= RANKS.length ? 0 : 5 - intoPhase;
  const nextRank = ranksEarned >= RANKS.length ? null : RANKS[ranksEarned];

  /* The next week a child will actually open, so "Remaining" names what is
   * coming rather than only counting it. */
  const nextWeek =
    weeks.find((w) => w.state === "current" || w.state === "inProgress") ??
    weeks.find((w) => w.state === "available");

  const statCards = [
    {
      label: "Weeks Done", value: completedCount, color: C.cyan, glow: "rgba(54,214,255,0.5)", icon: <CalendarIcon color={C.cyan} />,
      /* One pip per week: the number says "3", the pips say "3, and look how
       * far the road goes". */
      foot: (
        <span className="flex flex-wrap gap-1" aria-label={`${completedCount} of ${totalWeeks} weeks done`}>
          {Array.from({ length: totalWeeks }).map((_, i) => (
            <i key={i} style={{ width: 7, height: 7, borderRadius: 2, display: "block", background: i < completedCount ? C.cyan : "rgba(86,140,230,0.22)" }} />
          ))}
        </span>
      ),
    },
    {
      label: "Remaining", value: remaining, color: C.blue, glow: "rgba(77,155,255,0.5)", icon: <HourglassIcon color={C.blue} />,
      foot: nextWeek ? (
        <span className="block truncate" style={{ fontSize: 11.5, color: C.textMuted }}>
          Next: <span style={{ color: C.blue, fontWeight: 700 }}>{nextWeek.title.split(":")[0]}</span>
        </span>
      ) : null,
    },
    {
      label: "Badges Earned", value: completedCount, color: C.violetSoft, glow: "rgba(139,108,255,0.5)", icon: <StarIcon color={C.violetSoft} />,
      foot: nextRank ? (
        <span className="block truncate" style={{ fontSize: 11.5, color: C.textMuted }}>
          <span style={{ color: C.violetSoft, fontWeight: 700 }}>{toNextRank}</span> more to {nextRank.replace("Cyber ", "")}
        </span>
      ) : (
        <span className="block truncate" style={{ fontSize: 11.5, color: C.mossLight, fontWeight: 700 }}>Every rank earned</span>
      ),
    },
    { label: "Raccoon Power", value: `${raccoonPower}%`, color: C.pink, glow: "rgba(255,77,157,0.5)", icon: <Image src="/game/characters/raccoon-head.png" alt="" width={26} height={26} style={{ borderRadius: "50%", objectFit: "cover", display: "block" }} />, art: "/dashboard/raccoon-power.webp" },
  ];

  return (
    <>
      <style>{`
        .dash { font-family: ${FONT_BODY}; color: ${C.text}; }
        .dash h1, .dash h2, .dash h3, .dash h4, .dash .display { font-family: ${FONT_DISPLAY}; letter-spacing: -0.01em; }
        .lift { transition: transform .2s cubic-bezier(.16,1,.3,1); }
        .lift:hover { transform: translateY(-2px); }
      `}</style>

      <div className="dash min-h-screen relative" style={{ background: `radial-gradient(ellipse 90% 60% at 50% -10%, #141a3e 0%, #0a0e22 38%, ${C.pageBg} 72%, #03040b 100%)` }}>
        {/* ── COOL COSMIC ATMOSPHERE ── */}
        <div aria-hidden style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
          <div style={{ position: "absolute", top: "-6%", right: "-8%", width: "46vw", height: "46vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,108,255,0.16) 0%, transparent 62%)", filter: "blur(20px)" }} />
          <div style={{ position: "absolute", top: "30%", left: "30%", width: "40vw", height: "40vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(54,214,255,0.08) 0%, transparent 60%)", filter: "blur(30px)" }} />
          <div style={{ position: "absolute", left: "-34vw", top: "8%", width: "62vw", height: "62vw", borderRadius: "50%", border: "1.5px solid rgba(90,160,255,0.28)", background: "radial-gradient(circle at 78% 38%, rgba(45,90,200,0.20) 0%, rgba(20,40,110,0.06) 45%, transparent 68%)", boxShadow: "0 0 100px rgba(70,140,255,0.18), inset -20px 0 80px rgba(90,160,255,0.12)" }} />
        </div>
        <DashboardParticles />

        {/* ── NAV ── */}
        <div className="sticky top-0 z-50 px-4 sm:px-6 pt-4">
          <nav className="max-w-[1200px] mx-auto flex items-center justify-between gap-3 rounded-2xl px-4 sm:px-5 py-3" style={{ background: "rgba(10, 14, 32, 0.82)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: `1px solid ${C.border}`, boxShadow: "0 18px 40px -22px rgba(2,4,12,0.9)" }}>
            <a href="/dashboard" className="flex items-center gap-2.5" style={{ textDecoration: "none" }}>
              <div className="flex items-center justify-center" style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(255,179,71,0.12)", border: "1px solid rgba(255,179,71,0.42)", boxShadow: "0 0 18px rgba(255,179,71,0.3)" }}>
                <ShieldLogo size={22} />
              </div>
              <span className="display text-lg font-bold" style={{ color: C.text, letterSpacing: "-0.01em" }}>CyberHeroes</span>
            </a>
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2" style={{ background: "rgba(54,214,255,0.06)", border: `1px solid ${C.border}`, borderRadius: 100, padding: "4px 12px 4px 4px" }}>
                <div style={{ width: 30, height: 30, borderRadius: 100, background: GRAD_PRIMARY, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: C.dark, boxShadow: "0 2px 10px rgba(54,214,255,0.4)" }}>
                  {userName.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-bold" style={{ color: C.textSoft }}>
                  {userName}
                  {childAge !== null && (
                  <span className="ml-1.5" style={{ color: C.textMuted, fontWeight: 700 }}>· age {childAge}</span>
                )}
                </span>
              </div>
              <a href="/cyberhq" className="hidden sm:inline-flex items-center gap-1.5 lift" style={{ background: "rgba(139,108,255,0.1)", border: `1px solid rgba(139,108,255,0.45)`, borderRadius: 100, padding: "8px 18px", fontSize: 13, fontWeight: 800, color: C.violetSoft, textDecoration: "none" }}>
                <TrophyIcon size={15} /> Cyber HQ
              </a>
              {onLogout ? (
                <form action={onLogout}>
                  <button className="inline-flex items-center gap-1.5 lift" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 100, padding: "8px 16px", color: C.textSoft, fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit" }}>
                    <LogoutIcon size={15} /> Log Out
                  </button>
                </form>
              ) : (
                <span className="inline-flex items-center gap-1.5" style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 100, padding: "8px 16px", color: C.textSoft, fontSize: 13, fontWeight: 800 }}>
                  <LogoutIcon size={15} /> Log Out
                </span>
              )}
            </div>
          </nav>
        </div>

        <div className="relative max-w-[1200px] mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10" style={{ zIndex: 1 }}>
          {/* ── HERO ── */}
          <RevealOnScroll>
            <section className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-12 mb-7">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 mb-5" style={{ background: "rgba(126,255,151,0.12)", border: `1px solid rgba(126,255,151,0.4)`, borderRadius: 100, padding: "6px 14px", fontSize: 12, fontWeight: 800, color: C.mossLight, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  <span style={{ width: 8, height: 8, borderRadius: 100, background: C.moss, boxShadow: `0 0 10px ${C.moss}`, display: "inline-block" }} />
                  Mission Active
                </div>
                <h1 className="display font-bold leading-[1.05] mb-3" style={{ color: C.text, fontSize: "clamp(2.4rem, 5vw, 3.6rem)" }}>
                  Welcome back,{" "}
                  <span style={{ background: GRAD_NAME, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{userName}</span>!
                </h1>
                <p className="text-base sm:text-lg mb-7 leading-relaxed" style={{ color: C.textSoft }}>{heroSub}</p>
                <a href={heroCtaHref} className="inline-flex items-center gap-2.5 font-black lift" style={{ background: GRAD_PRIMARY, color: C.dark, boxShadow: GLOW_PRIMARY, borderRadius: 100, padding: "15px 30px", fontSize: 16, textDecoration: "none", letterSpacing: "0.01em" }}>
                  <span aria-hidden style={{ fontSize: 18 }}>🚀</span> {heroCtaLabel}
                  <span aria-hidden style={{ fontSize: 18 }}>→</span>
                </a>
              </div>

              <div className="shrink-0">
                <div className="relative">
                  <div aria-hidden style={{ position: "absolute", inset: "-14% -8%", borderRadius: "50%", border: "1px solid rgba(86,140,230,0.25)", transform: "rotate(-12deg) scaleY(0.7)" }} />
                  <div aria-hidden className="absolute inset-0 rounded-3xl" style={{ background: "linear-gradient(135deg, rgba(54,214,255,0.4), rgba(139,108,255,0.4))", filter: "blur(34px)", transform: "scale(1.08)" }} />
                  <div className="relative rounded-3xl overflow-hidden" style={{ border: `2px solid ${C.borderStrong}`, boxShadow: "0 0 50px rgba(54,214,255,0.28), 0 0 0 5px rgba(13,19,44,0.6)" }}>
                    <Image src="/characters/heroes-hq.webp" alt="Adam and Layla in the Cyber Heroes command centre" width={320} height={239} className="block" priority />
                  </div>
                  <div className="absolute" style={{ right: -14, bottom: -14, width: 56, height: 56, borderRadius: 16, background: "rgba(10,14,32,0.92)", border: `1px solid ${C.borderStrong}`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 24px rgba(54,214,255,0.4)" }}>
                    <ShieldLogo size={30} />
                  </div>
                </div>
              </div>
            </section>
          </RevealOnScroll>

          {/* ── OVERALL PROGRESS ── */}
          <RevealOnScroll delay={80}>
            <section className="rounded-3xl p-5 sm:p-6 mb-6" style={{ background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: SHADOW_CARD }}>
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex items-center justify-center" style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(54,214,255,0.1)", border: `1px solid ${C.border}` }}><ChartIcon size={18} color={C.cyan} /></span>
                  <span className="font-black" style={{ color: C.textSoft, fontSize: 13, letterSpacing: "0.08em", textTransform: "uppercase" }}>Overall Progress</span>
                </div>
                <span className="font-black" style={{ color: C.cyan, fontSize: 15 }}>{completedCount} of {totalWeeks} weeks</span>
              </div>
              <AnimatedBar percent={progressPct} gradient={GRAD_PRIMARY} glowColor="rgba(139,108,255,0.5)" height={12} />
            </section>
          </RevealOnScroll>

          {/* ── STAT CARDS ── */}
          <RevealOnScroll delay={120}>
            <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {statCards.map((s) => (
                <div key={s.label} className="rounded-2xl p-5 lift relative overflow-hidden" style={{ background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)", boxShadow: SHADOW_CARD }}>
                  {s.art && (
                    /* Held back hard and faded out to the left. This is a
                       BACKDROP; the number on top of it is what the child is
                       reading, and art that wins here loses the card. */
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={s.art}
                      alt=""
                      aria-hidden
                      loading="lazy"
                      style={{
                        position: "absolute", inset: 0, width: "100%", height: "100%",
                        objectFit: "cover", objectPosition: "right center",
                        opacity: 0.42, pointerEvents: "none", zIndex: 0,
                        WebkitMaskImage: "linear-gradient(90deg, transparent 2%, rgba(0,0,0,0.5) 46%, #000 100%)",
                        maskImage: "linear-gradient(90deg, transparent 2%, rgba(0,0,0,0.5) 46%, #000 100%)",
                      }}
                    />
                  )}
                  <div className="relative" style={{ zIndex: 1 }}>
                  <HexIcon color={s.color} glow={s.glow}>{s.icon}</HexIcon>
                  <div className="display mt-3" style={{ fontSize: 38, fontWeight: 800, color: C.text, lineHeight: 1 }}>{s.value}</div>
                  <div className="mt-1.5" style={{ fontSize: 11, fontWeight: 800, color: C.textMuted, letterSpacing: "0.09em", textTransform: "uppercase" }}>{s.label}</div>
                  {s.foot ? <div className="mt-2.5">{s.foot}</div> : null}
                  </div>
                </div>
              ))}
            </section>
          </RevealOnScroll>

          {product ? (
            <>
              {/* ── HACKER RACCOON ── */}
              <RevealOnScroll delay={80}>
                <section className="rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-center gap-6 mb-6 relative overflow-hidden" style={{ background: C.card, border: `1px solid ${allDone ? "rgba(126,255,151,0.4)" : "rgba(255,77,157,0.4)"}`, boxShadow: (allDone ? "0 0 30px rgba(126,255,151,0.14), " : "0 0 30px rgba(255,77,157,0.16), ") + SHADOW_CARD, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                  {/* Owner, 28 Oct: "Get rid of that emoji raccoon face." It was a
                      200px raccoon GLYPH at 5% opacity standing in for art, in the
                      one card that already shows the real villain below. */}
                  <div className="relative shrink-0">
                    <div aria-hidden className="absolute inset-0 rounded-2xl" style={{ background: allDone ? "rgba(126,255,151,0.3)" : "rgba(255,77,157,0.38)", filter: "blur(26px)", transform: "scale(0.85)" }} />
                    <Image src="/characters/raccoon-sneaking.png" alt="The Hacker Raccoon" width={104} height={104} className="relative rounded-2xl block" style={{ border: `2px solid ${allDone ? "rgba(126,255,151,0.5)" : "rgba(255,77,157,0.55)"}` }} />
                  </div>
                  <div className="flex-1 text-center sm:text-left w-full relative" style={{ zIndex: 1 }}>
                    <h3 className="display font-bold text-lg sm:text-xl mb-2" style={{ color: C.text }}>
                      {allDone ? "You defeated the Hacker Raccoon!" : "The Hacker Raccoon is still out there…"}
                    </h3>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: C.textSoft, opacity: 0.9 }}>
                      {allDone ? "Amazing work, Cyber Hero! You've completed every lesson and saved the day." : `Complete all ${totalWeeks} weeks to defeat him. Each lesson weakens his power.`}
                    </p>
                    <div className="flex justify-between text-xs font-black mb-1.5">
                      <span style={{ color: C.pink, letterSpacing: 1, textTransform: "uppercase" }}>Raccoon Power</span>
                      <span style={{ color: C.pink }}>{raccoonPower}%</span>
                    </div>
                    <AnimatedBar percent={raccoonPower} gradient={GRAD_RACCOON} glowColor="rgba(255,77,157,0.5)" height={12} />
                    <p className="text-[11px] font-bold mt-2.5" style={{ color: C.textMuted }}>
                      {completedCount === 0 ? "Start your first lesson to begin weakening the raccoon." : allDone ? "The raccoon's power has been fully drained." : `${completedCount} lesson${completedCount !== 1 ? "s" : ""} down. Keep going!`}
                    </p>
                  </div>
                </section>
              </RevealOnScroll>

              {/* ── ACADEMY HEADER ── */}
              <RevealOnScroll delay={120}>
                <section className="rounded-3xl p-6 sm:p-7 mb-6 flex flex-col sm:flex-row items-center gap-6" style={{ background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", boxShadow: SHADOW_CARD }}>
                  <div className="relative shrink-0 flex items-center justify-center" style={{ width: 92, height: 92 }}>
                    <div aria-hidden style={{ position: "absolute", inset: 0, borderRadius: "50%", background: "radial-gradient(circle, rgba(54,214,255,0.28) 0%, transparent 68%)", filter: "blur(8px)" }} />
                    <div aria-hidden style={{ position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)", width: 70, height: 16, borderRadius: "50%", background: "radial-gradient(ellipse, rgba(54,214,255,0.4) 0%, transparent 70%)", filter: "blur(4px)" }} />
                    <ShieldLogo size={62} />
                  </div>
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <h2 className="display text-xl sm:text-2xl font-bold leading-snug" style={{ color: C.text }}>{product.name}</h2>
                    <div className="flex items-center justify-center sm:justify-start gap-x-4 gap-y-1 flex-wrap mt-1.5" style={{ color: C.textMuted, fontSize: 13, fontWeight: 700 }}>
                      <span className="inline-flex items-center gap-1.5"><PersonIcon /> Ages {product.ageRange}</span>
                      <span className="inline-flex items-center gap-1.5"><CalendarIcon size={14} color={C.textMuted} /> {product.weeksCount} Weeks</span>
                      <span className="inline-flex items-center gap-1.5"><ClockIcon /> {product.duration}</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <AnimatedRing percent={progressPct} size={104} radius={43} strokeWidth={9} gradientFrom={C.cyan} gradientTo={C.violet} glow="rgba(54,214,255,0.5)" track="rgba(86,140,230,0.16)" label={C.cyanSoft} />
                  </div>
                </section>
              </RevealOnScroll>

              {/* ── WEEK LIST ── */}
              {/* ── WEEK TILES ──
                  Owner pick, 28 Oct: concept 08, the capsule tile, "but can we
                  get them filled in ... relevant to the content".

                  Two things make this work. The tile takes the week's OWN
                  colour, already defined for all twenty in weekThemes.ts and
                  until now unused on this page, so a list of twenty reads as a
                  colour run instead of twenty blue rows. And STATE IS TOLD BY
                  FORM, not colour: a tick and stars for done, full strength for
                  the week you are on, dimmed for one not started. That is what
                  frees colour to mean "which week".

                  Art is per-week and OPTIONAL. A week with no image falls back
                  to its colour gradient and still looks finished, so the weeks
                  still being drawn are never broken meanwhile. */}
              <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {weeks.map((w) => {
                  const isCompleted = w.state === "completed";
                  const isInProgress = w.state === "inProgress";
                  const isCurrent = w.state === "current";
                  const notStarted = !isCompleted && !isCurrent && !isInProgress;
                  const a = WEEK_THEMES[w.week]?.accent ?? C.cyan;
                  const art = WEEK_ART.has(w.week) ? `/dashboard/week-art/week-${w.week}.webp` : null;
                  return (
                    <a
                      key={w.id}
                      href={w.href}
                      className="relative overflow-hidden rounded-3xl flex flex-col lift"
                      style={{
                        minHeight: 352,
                        padding: 20,
                        textDecoration: "none",
                        background: art ? "#0a0e1e" : `linear-gradient(160deg, ${a}, ${a}22 85%), #0a0e1e`,
                        border: `1px solid ${a}${isCurrent ? "99" : "3a"}`,
                        boxShadow: isCurrent ? `0 0 34px -14px ${a}, ` + SHADOW_CARD : SHADOW_CARD,
                        opacity: notStarted ? 0.86 : 1,
                      }}
                    >
                      {art && (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={art} alt="" aria-hidden loading="lazy" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: weekArtPosition(w.week), opacity: notStarted ? 0.74 : 1, zIndex: 0 }} />
                          {/* The scrim is what makes words legible over a
                              picture. Without it this is a poster, not a card. */}
                          <span aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(180deg, rgba(8,12,28,0.38) 0%, rgba(8,12,28,0.00) 24%, rgba(8,12,28,0.00) 56%, rgba(8,12,28,0.34) 72%, rgba(8,12,28,0.74) 86%, rgba(8,12,28,0.92) 100%)" }} />
                          <span aria-hidden style={{ position: "absolute", inset: 0, zIndex: 1, background: `linear-gradient(90deg, rgba(8,12,28,0.45) 0%, rgba(8,12,28,0.05) 52%, transparent 78%), linear-gradient(180deg, transparent 55%, ${a}1a 100%)` }} />
                        </>
                      )}

                      <div className="relative flex items-start justify-between" style={{ zIndex: 2 }}>
                        <span className="display" style={{ fontSize: 46, fontWeight: 800, lineHeight: 1, color: art ? a : "rgba(8,12,28,0.55)" }}>
                          {String(w.week).padStart(2, "0")}
                        </span>
                        {isCompleted && (
                          <span style={{ width: 30, height: 30, borderRadius: "50%", background: a, display: "grid", placeItems: "center", flexShrink: 0 }}>
                            <CheckIcon size={17} color="#0a0e1e" />
                          </span>
                        )}
                      </div>

                      <div className="relative" style={{ zIndex: 2, marginTop: "auto" }}>
                        <div className="font-black uppercase mb-1 flex items-center gap-2" style={{ fontSize: 10, letterSpacing: "0.16em", color: a }}>
                          <span>Week {w.week}</span>
                          {isCompleted && w.stars > 0 && <StarRow stars={w.stars} />}
                          {isInProgress && w.screen != null && <span>· screen {w.screen}</span>}
                        </div>
                        <h3 className="display font-bold leading-snug" style={{ fontSize: 17, color: C.text, textShadow: "0 2px 10px rgba(5,8,20,0.95), 0 1px 3px rgba(5,8,20,0.9)" }}>{w.title}</h3>
                        <p className="mt-1 leading-relaxed line-clamp-2" style={{ fontSize: 12, color: C.textSoft, textShadow: "0 2px 9px rgba(5,8,20,0.95), 0 1px 3px rgba(5,8,20,0.9)" }}>{w.description}</p>
                        <span
                          className="inline-flex items-center gap-1.5 font-black mt-3"
                          style={{
                            background: isCompleted ? `${a}2e` : a,
                            color: isCompleted ? a : "#0a0e1e",
                            border: isCompleted ? `1px solid ${a}8c` : "none",
                            borderRadius: 100, padding: "9px 17px", fontSize: 12.5,
                          }}
                        >
                          {isCompleted ? "Replay" : isInProgress ? "Continue" : "Start Lesson"} <span aria-hidden>→</span>
                        </span>
                      </div>
                    </a>
                  );
                })}
              </StaggeredList>
            </>
          ) : (
            <div className="rounded-3xl p-10 text-center" style={{ background: C.card, border: `1px solid ${C.border}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
              <p className="font-bold" style={{ color: C.textMuted }}>Cyber Heroes content is not yet available. Please run the seed script.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
