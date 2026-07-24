"use client";

import { FadeUp } from "./utilities";

/**
 * ParentTrust. Specifically addresses the parent decision: "is this safe,
 * is this real, and is it worth my child's time?". Six trust pillars +
 * two parent quotes. Lives between the project showcase and testimonials
 * so the reassurance comes before the broader social proof.
 */

type PillarIcon = "shield" | "person" | "gradcap" | "code" | "tag" | "globe";

interface Pillar {
  title: string;
  copy: string;
  accent: string;
  icon: PillarIcon;
}

const PILLARS: Pillar[] = [
  {
    title: "Safety-first by design",
    copy:
      "Every lesson is screened by educators. No ads, no in-platform purchases, no third-party trackers, no dark patterns.",
    accent: "#5fffa3",
    icon: "shield",
  },
  {
    title: "Age-appropriate, always",
    copy:
      "Content is staged for ages 6-9, 10-13, 14-17 and adults. We meet your child where they are. Never push, never patronise.",
    accent: "#9ff5ff",
    icon: "person",
  },
  {
    title: "Built by UK educators",
    copy:
      "Curriculum aligned with KS2-KS4 expectations and reviewed by teachers from UK state and independent schools.",
    accent: "#cba8ff",
    icon: "gradcap",
  },
  {
    title: "No passive watching",
    copy:
      "Your child builds things. Real tools, real code, real artefacts they can show off.",
    accent: "#ffd07a",
    icon: "code",
  },
  {
    title: "Transparent pricing",
    copy:
      "One clear price per course, shown up front. Pay once, keep lifetime access. No subscriptions, no surprise upgrades.",
    accent: "#ffc94a",
    icon: "tag",
  },
  {
    title: "Real-world relevance",
    copy:
      "Skills that matter outside the screen: spotting scams, evaluating sources, building something useful.",
    accent: "#ff3ad6",
    icon: "globe",
  },
];

function PillarIconSvg({ name, color }: { name: PillarIcon; color: string }) {
  const c = { width: 24, height: 24, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "shield":
      return (<svg {...c}><path d="M12 3l7 3v5c0 4.4-3 7.3-7 8.5C8 18.3 5 15.4 5 11V6l7-3z" /></svg>);
    case "person":
      return (<svg {...c}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19c.6-3.3 3.3-5 6.5-5s5.9 1.7 6.5 5" /></svg>);
    case "gradcap":
      return (<svg {...c}><path d="M2 9l10-4 10 4-10 4L2 9z" /><path d="M6 11v4.2c0 1.2 2.7 2.3 6 2.3s6-1.1 6-2.3V11" /><path d="M20 10v4.5" /></svg>);
    case "code":
      return (<svg {...c}><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" /></svg>);
    case "tag":
      return (<svg {...c}><path d="M20.5 13.4l-7.1 7.1a2 2 0 0 1-2.8 0l-6.1-6.1a2 2 0 0 1-.5-1.3V5.5a2 2 0 0 1 2-2h7.6a2 2 0 0 1 1.4.6l5.5 5.5a2 2 0 0 1 0 2.8z" /><circle cx="7.8" cy="7.8" r="1.3" /></svg>);
    case "globe":
      return (<svg {...c}><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18" /></svg>);
  }
}

export default function ParentTrust() {
  return (
    <section
      id="parent-trust"
      style={{
        position: "relative",
        padding:
          "calc(var(--lv2-rail) * 2.2) var(--lv2-rail) calc(var(--lv2-rail) * 2.0)",
        color: "var(--lv2-paper)",
      }}
    >
      <div
        style={{
          position: "relative",
          maxWidth: 1180,
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
              marginBottom: 18,
              textAlign: "center",
            }}
          >
            // FOR PARENTS
          </p>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.03em",
              fontWeight: 800,
              margin: "0 auto 16px",
              maxWidth: 880,
              color: "var(--lv2-paper)",
              textAlign: "center",
            }}
          >
            Why families trust AlgorithmX.
          </h2>
        </FadeUp>

        <FadeUp delay={0.12}>
          <p
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(1rem, 1.2vw, 1.0625rem)",
              lineHeight: 1.55,
              color: "rgba(232,237,255,0.7)",
              maxWidth: 640,
              margin: "0 auto 56px",
              textAlign: "center",
            }}
          >
            Six promises we make to every parent who puts a screen in their
            child&apos;s hands.
          </p>
        </FadeUp>

        <div className="lv2-trust-grid">
          {PILLARS.map((p, i) => (
            <FadeUp key={p.title} delay={0.05 * i + 0.18}>
              <article
                style={{
                  background: "rgba(13,15,24,0.62)",
                  backdropFilter: "blur(12px) saturate(1.3)",
                  WebkitBackdropFilter: "blur(12px) saturate(1.3)",
                  border: "1px solid rgba(232,237,255,0.08)",
                  borderRadius: 14,
                  padding: "22px 22px 20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  height: "100%",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      flexShrink: 0,
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      border: `1.5px solid ${p.accent}66`,
                      background: `radial-gradient(circle at 50% 38%, ${p.accent}1f, rgba(10,12,20,0.6))`,
                      boxShadow: `0 0 22px ${p.accent}33, inset 0 0 12px ${p.accent}1a`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <PillarIconSvg name={p.icon} color={p.accent} />
                  </span>
                  <h3
                    style={{
                      fontFamily: "var(--lv2-font-display)",
                      fontSize: "1.15rem",
                      fontWeight: 600,
                      color: "var(--lv2-paper)",
                      margin: 0,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {p.title}
                  </h3>
                </div>
                <p
                  style={{
                    fontFamily: "var(--lv2-font-display)",
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: "rgba(232,237,255,0.74)",
                    margin: 0,
                  }}
                >
                  {p.copy}
                </p>
              </article>
            </FadeUp>
          ))}
        </div>

      </div>

      <style jsx>{`
        .lv2-trust-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .lv2-trust-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 560px) {
          .lv2-trust-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
