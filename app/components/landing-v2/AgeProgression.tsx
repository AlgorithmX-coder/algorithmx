"use client";

import { FadeUp } from "./utilities";

/**
 * AgeProgression. Shows how a learner moves through the AlgorithmX
 * curriculum from age 6 to adult - four stages, four objectives,
 * four entry points. Lives between SubjectShowcase and the project /
 * trust sections so the user understands the "long arc" the platform
 * supports before drilling into specifics.
 */

interface Stage {
  agesLabel: string;
  agesShort: string;
  title: string;
  copy: string;
  recommended: string;
  accent: string;
}

const STAGES: Stage[] = [
  {
    agesLabel: "Ages 6–8",
    agesShort: "06-08",
    title: "Start",
    copy: "First taste of how tech really works. Character-led stories, no jargon, no screens-as-babysitter.",
    recommended: "CYBER HEROES JR",
    accent: "#5fffa3",
  },
  {
    agesLabel: "Ages 9–12",
    agesShort: "09-12",
    title: "Building",
    copy: "Spot scams, write first lines of code, design tiny games. Confidence builds with hands-on missions.",
    recommended: "CYBER HEROES ACADEMY",
    accent: "#9ff5ff",
  },
  {
    agesLabel: "Ages 13–16",
    agesShort: "13-16",
    title: "Creating",
    copy: "Build real apps, train AI models, prototype products. Portfolio work that GCSE and college recognise.",
    recommended: "GAME DEV + AI",
    accent: "#cba8ff",
  },
  {
    agesLabel: "17+ / Adult",
    agesShort: "17+",
    title: "Career",
    copy: "Pivot into tech or level up an existing career. UK tech avg £65K. Structured for working learners.",
    recommended: "CYBERSECURITY",
    accent: "#ffd07a",
  },
];

export default function AgeProgression() {
  return (
    <section
      id="age-progression"
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
            // AGES 6 → ADULT
          </p>
        </FadeUp>

        <FadeUp delay={0.06}>
          <h2
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
              lineHeight: 1.04,
              letterSpacing: "-0.025em",
              fontWeight: 400,
              margin: "0 auto 16px",
              maxWidth: 880,
              color: "var(--lv2-paper)",
              textAlign: "center",
            }}
          >
            One platform, four stages of growth.
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
            We meet learners where they are — toddler curiosity, teenage
            ambition, mid-career pivot — and keep meeting them as they grow.
          </p>
        </FadeUp>

        <div className="lv2-age-grid">
          {STAGES.map((stage, i) => (
            <FadeUp key={stage.agesShort} delay={0.08 * i + 0.18}>
              <article
                style={{
                  background: "rgba(13,15,24,0.72)",
                  backdropFilter: "blur(14px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(14px) saturate(1.4)",
                  border: "1px solid rgba(232,237,255,0.08)",
                  borderTop: `2px solid ${stage.accent}`,
                  borderRadius: 18,
                  padding: "28px 26px 26px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  minHeight: 280,
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.4), 0 12px 36px rgba(0,0,0,0.28)",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: stage.accent,
                  }}
                >
                  STAGE {String(i + 1).padStart(2, "0")}
                </div>
                <div
                  style={{
                    fontFamily: "var(--lv2-font-display)",
                    fontSize: 38,
                    fontWeight: 700,
                    color: stage.accent,
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    textShadow: `0 0 28px ${stage.accent}55`,
                  }}
                >
                  {stage.agesShort}
                </div>
                <div
                  style={{
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 11,
                    fontWeight: 500,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(232,237,255,0.55)",
                  }}
                >
                  {stage.agesLabel} · {stage.title}
                </div>
                <p
                  style={{
                    fontFamily: "var(--lv2-font-display)",
                    fontSize: 14.5,
                    lineHeight: 1.55,
                    color: "rgba(232,237,255,0.78)",
                    margin: 0,
                    flex: 1,
                  }}
                >
                  {stage.copy}
                </p>
                <div
                  style={{
                    borderTop: "1px solid rgba(232,237,255,0.08)",
                    paddingTop: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: 999,
                      background: stage.accent,
                      boxShadow: `0 0 10px ${stage.accent}b3`,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: stage.accent,
                    }}
                  >
                    {stage.recommended}
                  </span>
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>

      <style jsx>{`
        .lv2-age-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 960px) {
          .lv2-age-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 560px) {
          .lv2-age-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
