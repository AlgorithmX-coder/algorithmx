"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { FadeUp, useHoverCount } from "./utilities";

/**
 * "The state of play" — the evidence section. Transparent over the global
 * animated backdrop, dark glass cards with vivid neon stat colors.
 *
 * Layout (top → bottom):
 *   1. Three headline stat cards (icon chip · sparkline · badge · source)
 *   2. Bridge tagline
 *
 * (The context-panel row — Why this matters · Learning pathways ·
 * Outcomes — and the CTA row were removed 2026-07-17 per design pass.)
 *
 * FIGURES VERIFIED 2026-07-17 — every number traces to a named source;
 * do not change a value without re-sourcing it:
 *   72%  Internet Matters Pulse (Apr–May 2026 wave, 1,000 UK children
 *        aged 9–17): "72% of children have experienced at least one
 *        online harm."          internetmatters.org/pulse
 *   82%  DCMS × Burning Glass, "No Longer Optional: Employer Demand
 *        for Digital Skills" (9M+ UK job ads analysed): 82% of
 *        advertised openings require digital skills.   gov.uk
 *   £60K ITJobsWatch, median advertised UK Cyber Security salary,
 *        6 months to 17 Jul 2026 (+6.19% YoY).  itjobswatch.co.uk
 */

const STATS = [
  {
    value: 72,
    suffix: "%",
    color: "#ff3ad6",
    icon: "shield" as const,
    label: "of UK children have experienced harm online",
    badgeTop: "9–17s",
    badgeSub: "UK · 2026",
    source: "Internet Matters · Pulse 2026",
    /* Parents — safety angle */
    spark: [30, 28, 32, 24, 27, 21, 25, 16, 19, 9, 5],
  },
  {
    value: 82,
    suffix: "%",
    color: "#00f5ff",
    icon: "brain" as const,
    label: "of UK job openings require digital skills",
    badgeTop: "9M+",
    badgeSub: "ads analysed",
    source: "DCMS · No Longer Optional",
    /* Universal — future tech literacy across all ages */
    spark: [33, 30, 31, 25, 26, 18, 22, 14, 12, 8, 4],
  },
  {
    value: 60,
    prefix: "£",
    suffix: "K",
    color: "#ffc94a",
    icon: "trend" as const,
    label: "median advertised UK cyber security salary",
    badgeTop: "↑ +6%",
    badgeSub: "year on year",
    source: "ITJobsWatch · Jul 2026",
    /* Adult / career angle */
    spark: [31, 29, 30, 26, 24, 22, 20, 17, 15, 10, 6],
  },
];

export default function ProblemStats() {
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
      </div>

      <style jsx>{`
        .lv2-stats-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
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

      {/* Bottom row: sparkline + fact badge */}
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
              whiteSpace: "nowrap",
            }}
          >
            {stat.badgeTop}
          </span>
          <span
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 10,
              color: "rgba(232,237,255,0.5)",
              whiteSpace: "nowrap",
            }}
          >
            {stat.badgeSub}
          </span>
        </div>
      </div>

      {/* Source line — every figure on this row is verifiable */}
      <p
        style={{
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 9,
          fontWeight: 600,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "rgba(232,237,255,0.38)",
          margin: "14px 0 0",
        }}
      >
        Source: {stat.source}
      </p>
    </div>
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


/* ─── Inline glyph set ───────────────────────────────────────────── */
/* A few icons the shared ICON_PATHS set doesn't cover. Thin-stroke,
 * 24×24, matching the landing-v2 line style. */

type GlyphName = "shield" | "brain" | "trend";

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
    default:
      return null;
  }
}
