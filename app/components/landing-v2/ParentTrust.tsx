"use client";

import { FadeUp } from "./utilities";

/**
 * ParentTrust. Specifically addresses the parent decision: "is this safe,
 * is this real, and is it worth my child's time?". Six trust pillars +
 * two parent quotes. Lives between the project showcase and testimonials
 * so the reassurance comes before the broader social proof.
 */

interface Pillar {
  title: string;
  copy: string;
  accent: string;
}

const PILLARS: Pillar[] = [
  {
    title: "Safety-first by design",
    copy:
      "Every lesson is screened by educators. No ads, no in-platform purchases, no third-party trackers, no dark patterns.",
    accent: "#5fffa3",
  },
  {
    title: "Age-appropriate, always",
    copy:
      "Content is staged for ages 6-8, 9-12, 13-16. We meet your child where they are. Never push, never patronise.",
    accent: "#9ff5ff",
  },
  {
    title: "Built by UK educators",
    copy:
      "Curriculum aligned with KS2-KS4 expectations and reviewed by teachers from UK state and independent schools.",
    accent: "#cba8ff",
  },
  {
    title: "Hands-on, not videos",
    copy:
      "Your child builds things. Real tools, real code, real artefacts they can show off. No passive watching.",
    accent: "#ffd07a",
  },
  {
    title: "One transparent price",
    copy:
      "£99 lifetime access to Cyber Heroes Academy. One-time payment, no subscription, no surprise upgrades.",
    accent: "#ffc94a",
  },
  {
    title: "Real-world relevance",
    copy:
      "Skills that matter outside the screen: spotting scams, evaluating sources, building something useful.",
    accent: "#ff3ad6",
  },
];

interface Quote {
  body: string;
  attribution: string;
  context: string;
}

const QUOTES: Quote[] = [
  {
    body: "First platform my 9-year-old asks to use after school. The fact that she's learning to spot phishing emails is the cherry on top.",
    attribution: "Aisha M.",
    context: "Parent of two, Manchester",
  },
  {
    body: "Finally, something that treats my son like he's capable. He built a password defender and now lectures the whole family about strong passwords.",
    attribution: "James K.",
    context: "Parent, Edinburgh",
  },
];

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
              letterSpacing: "-0.025em",
              fontWeight: 400,
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
            Six promises we make to every parent who hands their child the
            keyboard.
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
                    gap: 10,
                  }}
                >
                  <span
                    aria-hidden
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: p.accent,
                      boxShadow: `0 0 12px ${p.accent}b3`,
                    }}
                  />
                  <h3
                    style={{
                      fontFamily: "var(--lv2-font-display)",
                      fontSize: "1.1rem",
                      fontWeight: 500,
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

        {/* Parent quotes */}
        <div className="lv2-quotes-grid" style={{ marginTop: 56 }}>
          {QUOTES.map((q, i) => (
            <FadeUp key={q.attribution} delay={0.1 * i + 0.5}>
              <blockquote
                style={{
                  background: "rgba(13,15,24,0.78)",
                  backdropFilter: "blur(14px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(14px) saturate(1.4)",
                  border: "1px solid rgba(0,229,255,0.18)",
                  borderRadius: 18,
                  padding: "28px 30px",
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  height: "100%",
                }}
              >
                <span
                  aria-hidden
                  style={{
                    fontFamily: "var(--lv2-font-display)",
                    fontSize: 36,
                    fontWeight: 700,
                    lineHeight: 1,
                    color: "var(--lv2-cyan)",
                  }}
                >
                  &ldquo;
                </span>
                <p
                  style={{
                    fontFamily: "var(--lv2-font-display)",
                    fontSize: 17,
                    lineHeight: 1.5,
                    color: "var(--lv2-paper)",
                    margin: 0,
                  }}
                >
                  {q.body}
                </p>
                <footer
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    marginTop: "auto",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "var(--lv2-cyan-soft)",
                    }}
                  >
                    {q.attribution}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 10,
                      fontWeight: 500,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: "rgba(232,237,255,0.5)",
                    }}
                  >
                    {q.context}
                  </span>
                </footer>
              </blockquote>
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
        .lv2-quotes-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 900px) {
          .lv2-trust-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .lv2-quotes-grid {
            grid-template-columns: 1fr;
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
