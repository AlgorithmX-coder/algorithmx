"use client";

import { useRef } from "react";
import { useInView } from "framer-motion";
import { FadeUp, useHoverCount } from "./utilities";

/**
 * Problem-state stats. Transparent section over the global animated
 * backdrop, dark glass cards, vivid neon stat colors.
 *
 * Interactive: hover lifts the card + reruns the counter.
 */

const STATS = [
  {
    value: 72,
    suffix: "%",
    color: "#ff3ad6",
    /* Parents - safety angle */
    label: "of children encounter online threats before age 10",
  },
  {
    value: 85,
    suffix: "%",
    color: "#00f5ff",
    /* Universal - future tech literacy across all ages */
    label: "of jobs in 2030 will require digital + AI skills",
  },
  {
    value: 65,
    prefix: "£",
    suffix: "K",
    color: "#ffc94a",
    /* Adult / career angle - broadened from cyber-only to tech-sector */
    label: "average UK tech-sector salary in 2026",
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
      {/* No top dissolve. The hex floor texture now fades itself at
       *  the near-camera edge (PASS 3 in makeHexGridTexture inside
       *  LaptopScene), so GlobalBackdrop reads through the seam
       *  cleanly — masking it with an ink overlay would re-introduce
       *  the dark band we just eliminated. */}
      <div
        style={{
          position: "relative",
          maxWidth: 1100,
          margin: "0 auto",
        }}
      >
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
              marginBottom: 28,
            }}
          >
            // THE STATE OF PLAY
          </p>
        </FadeUp>

        <div className="lv2-stats-row">
          {STATS.map((s, i) => (
            <FadeUp key={i} delay={i * 0.12}>
              <StatCard stat={s} />
            </FadeUp>
          ))}
        </div>

        <FadeUp delay={0.4}>
          <p
            style={{
              textAlign: "center",
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(20px, 2.4vw, 28px)",
              fontWeight: 500,
              color: "var(--lv2-paper)",
              maxWidth: 740,
              margin: "calc(var(--lv2-rail) * 1.3) auto 0",
              lineHeight: 1.4,
              letterSpacing: "-0.01em",
            }}
          >
            Whether you&rsquo;re protecting your child or building your career,
            AlgorithmX has the right pathway.
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

/* Faint cyan-gradient hairline at the top of each section. Softened
 * (alpha 0.32 → 0.14) so it whispers a section boundary rather than
 * stamping a deliberate line — the surrounding dissolve gradients do
 * most of the work of separating sections now. */
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

function StatCard({ stat }: { stat: (typeof STATS)[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const inView = useInView(cardRef, { once: true, margin: "-80px" });
  const counter = useHoverCount(stat.value, 1500);
  return (
    <div
      ref={cardRef}
      onMouseEnter={inView ? counter.bind.onMouseEnter : undefined}
      style={{
        background: "rgba(13,15,24,0.72)",
        backdropFilter: "blur(14px) saturate(1.4)",
        WebkitBackdropFilter: "blur(14px) saturate(1.4)",
        border: "1px solid rgba(232,237,255,0.08)",
        borderTop: `2px solid ${stat.color}`,
        borderRadius: 18,
        padding: "34px 28px",
        textAlign: "center",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.4), 0 12px 36px rgba(0,0,0,0.25)",
        transition:
          "transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s cubic-bezier(0.16,1,0.3,1), border-color .35s ease",
        cursor: "default",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-6px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = `0 1px 3px rgba(0,0,0,0.4), 0 24px 60px ${stat.color}48`;
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.4), 0 12px 36px rgba(0,0,0,0.25)";
      }}
    >
      <p
        style={{
          fontFamily: "var(--lv2-font-display)",
          fontSize: "clamp(48px, 6vw, 72px)",
          fontWeight: 700,
          color: stat.color,
          lineHeight: 1,
          letterSpacing: "-0.025em",
          textShadow: `0 0 36px ${stat.color}66`,
        }}
      >
        {stat.prefix}
        {counter.value}
        {stat.suffix}
      </p>
      <p
        style={{
          color: "rgba(232,237,255,0.74)",
          fontSize: 14.5,
          lineHeight: 1.6,
          marginTop: 16,
          maxWidth: 280,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        {stat.label}
      </p>
    </div>
  );
}
