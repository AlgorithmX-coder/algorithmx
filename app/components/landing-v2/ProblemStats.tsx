"use client";

import Link from "next/link";
import { useRef } from "react";
import { useInView } from "framer-motion";
import { FadeUp, Ico, useHoverCount, useMagnetic } from "./utilities";

/**
 * "The state of play" — the evidence section. Transparent over the global
 * animated backdrop, dark glass cards with vivid neon stat colors.
 *
 * Layout (top → bottom):
 *   1. Three headline stat cards (icon chip · sparkline · delta badge)
 *   2. Bridge tagline
 *   3. Three context panels — Why this matters · Learning pathways · Outcomes
 *   4. CTA row
 */

const STATS = [
  {
    value: 72,
    suffix: "%",
    color: "#ff3ad6",
    icon: "shield" as const,
    label: "of children encounter online threats before age 10",
    delta: "+12%",
    /* Parents — safety angle */
    spark: [30, 28, 32, 24, 27, 21, 25, 16, 19, 9, 5],
  },
  {
    value: 85,
    suffix: "%",
    color: "#00f5ff",
    icon: "brain" as const,
    label: "of jobs in 2030 will require digital + AI skills",
    delta: "+23%",
    /* Universal — future tech literacy across all ages */
    spark: [33, 30, 31, 25, 26, 18, 22, 14, 12, 8, 4],
  },
  {
    value: 65,
    prefix: "£",
    suffix: "K",
    color: "#ffc94a",
    icon: "trend" as const,
    label: "average UK tech-sector salary in 2026",
    delta: "+8%",
    /* Adult / career angle */
    spark: [31, 29, 30, 26, 24, 22, 20, 17, 15, 10, 6],
  },
];

const PATHWAYS = [
  { icon: "shield" as const, label: "Cyber Security", color: "#ff3ad6" },
  { icon: "brain" as const, label: "AI & Machine Learning", color: "#00f5ff" },
  { icon: "code" as const, label: "App Development", color: "#7c5cff" },
  { icon: "robot" as const, label: "Robotics", color: "#ffc94a" },
];

const OUTCOMES = [
  { icon: "code" as const, value: "500+", label: "Live Projects", color: "#7c5cff" },
  { icon: "brain" as const, value: "40+", label: "Industry Skills", color: "#00f5ff" },
  { icon: "person" as const, value: "6 to Adult", label: "All Ages", color: "#ffc94a" },
];

export default function ProblemStats() {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  useMagnetic(ctaRef, { strength: 0.3, radius: 110 });

  return (
    <section
      id="the-state-of-play"
      style={{
        position: "relative",
        padding: "calc(var(--lv2-rail) * 2.2) var(--lv2-rail)",
        color: "var(--lv2-paper)",
      }}
    >
      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
        <FadeUp>
          <p
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.32em",
              textTransform: "uppercase",
              color: "rgba(232,237,255,0.55)",
              textAlign: "center",
              marginBottom: 30,
            }}
          >
            // THE STATE OF PLAY
          </p>
        </FadeUp>

        {/* 1 · Headline stat cards */}
        <div className="lv2-stats-row">
          {STATS.map((s, i) => (
            <FadeUp key={i} delay={i * 0.12}>
              <StatCard stat={s} />
            </FadeUp>
          ))}
        </div>

        {/* 2 · Bridge tagline */}
        <FadeUp delay={0.3}>
          <p
            style={{
              textAlign: "center",
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(20px, 2.4vw, 28px)",
              fontWeight: 500,
              color: "var(--lv2-paper)",
              maxWidth: 760,
              margin: "calc(var(--lv2-rail) * 1.3) auto calc(var(--lv2-rail) * 1.1)",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
            }}
          >
            Whether you&rsquo;re protecting your child or building your career,{" "}
            <span style={{ color: "var(--lv2-cyan)" }}>AlgorithmX</span> has the
            right pathway.
          </p>
        </FadeUp>

        {/* 3 · Context panels */}
        <div className="lv2-panels-row">
          <FadeUp delay={0.36}>
            <WhyPanel />
          </FadeUp>
          <FadeUp delay={0.44}>
            <PathwaysPanel />
          </FadeUp>
          <FadeUp delay={0.52}>
            <OutcomesPanel />
          </FadeUp>
        </div>

        {/* 4 · CTA row */}
        <FadeUp delay={0.6}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 28,
              flexWrap: "wrap",
              marginTop: "calc(var(--lv2-rail) * 1.4)",
            }}
          >
            <Link
              ref={ctaRef as unknown as React.Ref<HTMLAnchorElement>}
              href="#subjects"
              style={ctaPill}
              data-plausible="landing-v2-state-explore"
            >
              Explore Pathways
              <Ico name="arrow" size={15} sw={2.2} />
            </Link>
            <Link href="#how-it-works" style={ctaLink}>
              See full roadmap
              <Ico name="arrow" size={14} sw={2.2} />
            </Link>
          </div>
        </FadeUp>
      </div>

      <style jsx>{`
        .lv2-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }
        .lv2-panels-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
          align-items: stretch;
        }
        @media (max-width: 900px) {
          .lv2-panels-row {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 760px) {
          .lv2-stats-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

/* Faint cyan-gradient hairline at the top of each section. */
export function SeamLine() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        top: 0,
        left: "10%",
        right: "10%",
        height: 1,
        background:
          "linear-gradient(90deg, transparent, rgba(0,229,255,0.14), transparent)",
        pointerEvents: "none",
        zIndex: 1,
      }}
    />
  );
}

/* ─── Headline stat card ─────────────────────────────────────────── */

function StatCard({ stat }: { stat: (typeof STATS)[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-80px" });
  const counter = useHoverCount(stat.value, 1500);
  return (
    <div
      ref={cardRef}
      onMouseEnter={inView ? counter.bind.onMouseEnter : undefined}
      style={{
        position: "relative",
        background: "rgba(13,15,24,0.72)",
        backdropFilter: "blur(14px) saturate(1.4)",
        WebkitBackdropFilter: "blur(14px) saturate(1.4)",
        border: "1px solid rgba(232,237,255,0.08)",
        borderTop: `2px solid ${stat.color}`,
        borderRadius: 18,
        padding: "26px 26px 22px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.4), 0 12px 36px rgba(0,0,0,0.25)",
        transition:
          "transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s cubic-bezier(0.16,1,0.3,1)",
        cursor: "default",
        overflow: "hidden",
      }}
      onMouseOver={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-6px)";
        el.style.boxShadow = `0 1px 3px rgba(0,0,0,0.4), 0 24px 60px ${stat.color}48`;
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.4), 0 12px 36px rgba(0,0,0,0.25)";
      }}
    >
      {/* Top row: corner dots + icon chip */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: 5, marginTop: 4 }}>
          {[0, 1, 2, 3].map((d) => (
            <span
              key={d}
              style={{
                width: 5,
                height: 5,
                borderRadius: 999,
                background: stat.color,
                opacity: 0.5 + d * 0.12,
              }}
            />
          ))}
        </div>
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: 44,
            height: 44,
            borderRadius: 11,
            border: `1px solid ${stat.color}3a`,
            background: `${stat.color}12`,
            color: stat.color,
          }}
        >
          <GlyphIcon name={stat.icon} size={22} color={stat.color} />
        </div>
      </div>

      {/* Number */}
      <p
        style={{
          fontFamily: "var(--lv2-font-display)",
          fontSize: "clamp(48px, 6vw, 72px)",
          fontWeight: 700,
          color: stat.color,
          lineHeight: 1,
          letterSpacing: "-0.03em",
          marginTop: 14,
          textShadow: `0 0 36px ${stat.color}66`,
        }}
      >
        {stat.prefix}
        {counter.value}
        {stat.suffix}
      </p>

      {/* Label */}
      <p
        style={{
          color: "rgba(232,237,255,0.74)",
          fontSize: 14.5,
          lineHeight: 1.55,
          marginTop: 14,
          minHeight: 44,
        }}
      >
        {stat.label}
      </p>

      {/* Bottom row: sparkline + delta badge */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 14,
          marginTop: 18,
        }}
      >
        <Sparkline points={stat.spark} color={stat.color} />
        <div
          style={{
            flexShrink: 0,
            textAlign: "right",
            border: `1px solid ${stat.color}33`,
            borderRadius: 9,
            padding: "6px 10px",
            background: `${stat.color}0f`,
          }}
        >
          <span
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 12.5,
              fontWeight: 700,
              color: stat.color,
              display: "block",
              lineHeight: 1.2,
            }}
          >
            ↑ {stat.delta}
          </span>
          <span
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 10,
              color: "rgba(232,237,255,0.5)",
            }}
          >
            vs 2022
          </span>
        </div>
      </div>
    </div>
  );
}

/* ─── Context panels ─────────────────────────────────────────────── */

function Panel({
  title,
  icon,
  children,
}: {
  title: string;
  icon: GlyphName;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        height: "100%",
        background: "rgba(13,15,24,0.6)",
        backdropFilter: "blur(14px) saturate(1.3)",
        WebkitBackdropFilter: "blur(14px) saturate(1.3)",
        border: "1px solid rgba(232,237,255,0.08)",
        borderRadius: 18,
        padding: "22px 22px 24px",
        boxShadow: "0 12px 36px rgba(0,0,0,0.22)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 18,
        }}
      >
        <GlyphIcon name={icon} size={16} color="var(--lv2-cyan)" />
        <span
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(232,237,255,0.62)",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function WhyPanel() {
  return (
    <Panel title="Why this matters" icon="target">
      <div style={{ display: "flex", gap: 16 }}>
        <RiskChart />
        <ul
          style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: 14,
            flex: 1,
            minWidth: 0,
          }}
        >
          <Bullet>
            Online risks for children have risen{" "}
            <strong style={{ color: "#ff3ad6" }}>120%</strong> since 2020.
          </Bullet>
          <Bullet>
            The global digital skills gap could impact{" "}
            <strong style={{ color: "#00f5ff" }}>85M</strong> jobs by 2030.
          </Bullet>
        </ul>
      </div>
    </Panel>
  );
}

function PathwaysPanel() {
  return (
    <Panel title="Learning pathways" icon="layers">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 10,
        }}
      >
        {PATHWAYS.map((p) => (
          <div
            key={p.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 8,
              padding: "16px 8px",
              borderRadius: 13,
              border: "1px solid rgba(232,237,255,0.08)",
              background: "rgba(232,237,255,0.025)",
              transition:
                "transform .3s cubic-bezier(0.16,1,0.3,1), border-color .3s ease, background .3s ease",
              cursor: "default",
            }}
            onMouseOver={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "translateY(-3px)";
              el.style.borderColor = `${p.color}55`;
              el.style.background = `${p.color}10`;
            }}
            onMouseOut={(e) => {
              const el = e.currentTarget as HTMLDivElement;
              el.style.transform = "translateY(0)";
              el.style.borderColor = "rgba(232,237,255,0.08)";
              el.style.background = "rgba(232,237,255,0.025)";
            }}
          >
            <GlyphIcon name={p.icon} size={24} color={p.color} />
            <span
              style={{
                fontSize: 12.5,
                fontWeight: 500,
                color: "rgba(232,237,255,0.82)",
                lineHeight: 1.3,
              }}
            >
              {p.label}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function OutcomesPanel() {
  return (
    <Panel title="Outcomes" icon="target">
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 10,
        }}
      >
        {OUTCOMES.map((o) => (
          <div
            key={o.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: 42,
                height: 42,
                borderRadius: 11,
                border: `1px solid ${o.color}33`,
                background: `${o.color}10`,
              }}
            >
              <GlyphIcon name={o.icon} size={20} color={o.color} />
            </div>
            <span
              style={{
                fontFamily: "var(--lv2-font-display)",
                fontSize: 19,
                fontWeight: 700,
                color: o.color,
                lineHeight: 1.1,
              }}
            >
              {o.value}
            </span>
            <span
              style={{
                fontSize: 11.5,
                color: "rgba(232,237,255,0.62)",
                lineHeight: 1.3,
              }}
            >
              {o.label}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li
      style={{
        position: "relative",
        paddingLeft: 16,
        fontSize: 13,
        lineHeight: 1.55,
        color: "rgba(232,237,255,0.72)",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: 0,
          top: 7,
          width: 5,
          height: 5,
          borderRadius: 999,
          background: "var(--lv2-cyan)",
        }}
      />
      {children}
    </li>
  );
}

/* ─── Mini charts ────────────────────────────────────────────────── */

/* Card sparkline — jagged upward line on a 120×40 grid with a glowing
 * end dot. `points` are y-values (0 = top … 40 = bottom). */
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const w = 132;
  const h = 40;
  const step = w / (points.length - 1);
  const coords = points.map((y, i) => [i * step, y] as const);
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [ex, ey] = coords[coords.length - 1];
  const gid = `spk-${color.replace("#", "")}`;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h + 4}`}
      fill="none"
      style={{ overflow: "visible", flexShrink: 1 }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="1" />
        </linearGradient>
      </defs>
      <polyline
        points={line}
        stroke={`url(#${gid})`}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={ex} cy={ey} r={3.2} fill={color} />
      <circle cx={ex} cy={ey} r={6.5} fill={color} opacity={0.22} />
    </svg>
  );
}

/* "Why this matters" risk chart — labelled mini line chart, 2020→2024. */
function RiskChart() {
  const w = 150;
  const h = 110;
  const padL = 26;
  const padB = 18;
  const plotW = w - padL;
  const plotH = h - padB;
  const data = [25, 38, 48, 62, 88]; // % per year, rising
  const years = ["2020", "2021", "2022", "2023", "2024"];
  const stepX = plotW / (data.length - 1);
  const coords = data.map(
    (v, i) => [padL + i * stepX, (1 - v / 100) * plotH] as const,
  );
  const line = coords.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area =
    `${padL},${plotH} ` + line + ` ${padL + plotW},${plotH}`;
  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      fill="none"
      style={{ flexShrink: 0 }}
      aria-hidden
    >
      <defs>
        <linearGradient id="risk-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff3ad6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#ff3ad6" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines + y labels */}
      {[0, 25, 50, 75, 100].map((g) => {
        const y = (1 - g / 100) * plotH;
        return (
          <g key={g}>
            <line
              x1={padL}
              y1={y}
              x2={w}
              y2={y}
              stroke="rgba(232,237,255,0.08)"
              strokeWidth={1}
            />
            <text
              x={padL - 5}
              y={y + 3}
              textAnchor="end"
              fontSize="7"
              fill="rgba(232,237,255,0.4)"
              fontFamily="var(--lv2-font-mono)"
            >
              {g}%
            </text>
          </g>
        );
      })}
      {/* area + line */}
      <polygon points={area} fill="url(#risk-area)" />
      <polyline
        points={line}
        stroke="#ff3ad6"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {coords.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={2.4} fill="#ff3ad6" />
      ))}
      {/* x labels */}
      {years.map((yr, i) => (
        <text
          key={yr}
          x={padL + i * stepX}
          y={h - 5}
          textAnchor="middle"
          fontSize="7"
          fill="rgba(232,237,255,0.4)"
          fontFamily="var(--lv2-font-mono)"
        >
          {yr}
        </text>
      ))}
    </svg>
  );
}

/* ─── Inline glyph set ───────────────────────────────────────────── */
/* A few icons the shared ICON_PATHS set doesn't cover. Thin-stroke,
 * 24×24, matching the landing-v2 line style. */

type GlyphName =
  | "shield"
  | "brain"
  | "trend"
  | "code"
  | "robot"
  | "person"
  | "target"
  | "layers";

function GlyphIcon({
  name,
  size = 22,
  color = "currentColor",
}: {
  name: GlyphName;
  size?: number;
  color?: string;
}) {
  const sw = 1.7;
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "shield":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 11.5l2 2 4-4" />
        </svg>
      );
    case "brain":
      return (
        <svg {...common}>
          <path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7zM9 22h6" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="M3 17l6-6 4 4 7-7" />
          <path d="M17 8h4v4" />
        </svg>
      );
    case "code":
      return (
        <svg {...common}>
          <path d="M9 8l-4 4 4 4M15 8l4 4-4 4" />
        </svg>
      );
    case "robot":
      return (
        <svg {...common}>
          <rect x="5" y="9" width="14" height="10" rx="2.5" />
          <path d="M12 5v4M9 14h.01M15 14h.01M3 13v2M21 13v2" />
          <circle cx="12" cy="4" r="1.4" />
        </svg>
      );
    case "person":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0114 0" />
        </svg>
      );
    case "target":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="5" />
          <circle cx="12" cy="12" r="1.4" fill={color} stroke="none" />
        </svg>
      );
    case "layers":
      return (
        <svg {...common}>
          <path d="M12 3l9 5-9 5-9-5 9-5z" />
          <path d="M3 13l9 5 9-5M3 18l9 5 9-5" opacity={0.5} />
        </svg>
      );
    default:
      return null;
  }
}

/* ─── CTA styles ─────────────────────────────────────────────────── */

const ctaPill: React.CSSProperties = {
  position: "relative",
  display: "inline-flex",
  alignItems: "center",
  gap: 10,
  padding: "15px 30px",
  borderRadius: 999,
  fontFamily: "var(--lv2-font-display)",
  fontSize: 16,
  fontWeight: 600,
  letterSpacing: "0.01em",
  color: "#ffffff",
  textDecoration: "none",
  background: "rgba(13,15,24,0.6)",
  border: "1px solid transparent",
  backgroundImage:
    "linear-gradient(rgba(13,15,24,0.6), rgba(13,15,24,0.6)), linear-gradient(90deg, #ff3ad6, #7c5cff, #00e5ff)",
  backgroundOrigin: "border-box",
  backgroundClip: "padding-box, border-box",
  boxShadow: "0 10px 34px rgba(124,92,255,0.28)",
  willChange: "transform",
};

const ctaLink: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  fontFamily: "var(--lv2-font-display)",
  fontSize: 15,
  fontWeight: 500,
  color: "var(--lv2-cyan)",
  textDecoration: "none",
};
