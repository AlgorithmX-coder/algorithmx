"use client";

import { FadeUp } from "./utilities";
import { sectionMark } from "@/app/components/sectionMark";

/**
 * "Why AlgorithmX" — the six promises, rewritten by the owner 2026-09-20.
 *
 * It used to speak only to parents of young children. It now speaks to
 * every learner the platform takes, adults included, and answers the
 * question the whole category now raises: what does this look like in a
 * world being reshaped by AI. Copy is the owner's own wording.
 *
 * NOTE: this copy states the age bands as 7 to 9, 10 to 13, 14 to 16 and
 * adults. The hero, the track chips and the stream data still say 6 to 9
 * and 14 to 17. Raised with the owner on delivery; do not "fix" either
 * side without their call.
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
    title: "Safe by design",
    copy:
      "No ads, no third-party trackers and no tricks designed to keep you hooked. Your data is never sold or used to train AI models.",
    accent: "#0e7a45",
    icon: "shield",
  },
  {
    title: "Right for every stage",
    copy:
      "Pathways for ages 7 to 9, 10 to 13, 14 to 16 and adults, from first steps to career-ready skills. We meet every learner where they are. Never push, never patronise.",
    accent: "#0a7085",
    icon: "person",
  },
  {
    title: "Built by educators and tech professionals",
    copy:
      "Created by the team behind an Ofsted-registered STEM provider, with input from people working in tech every day. Aligned with KS2 to KS4 computing for schools and grounded in real industry practice for adults.",
    accent: "#5744c9",
    icon: "gradcap",
  },
  {
    title: "Learn by doing",
    copy:
      "Build real things with real tools, including the AI tools shaping every industry. Projects you can proudly show off, not videos you half watch.",
    accent: "#8a5a00",
    icon: "code",
  },
  {
    title: "Clear, honest pricing",
    copy:
      "Simple pricing for individuals and families, straightforward licensing for schools. No hidden fees and no surprise upgrades.",
    accent: "#8a5a00",
    icon: "tag",
  },
  {
    title: "Ready for an AI world",
    copy:
      "Technology is changing fast, and so are our lessons. Learn to spot deepfakes and AI-powered scams, question what chatbots tell you, and use AI as a tool rather than a shortcut.",
    accent: "#a5117f",
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
        color: "var(--lv2-ink)",
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
          <p style={{ margin: "0 0 18px", textAlign: "center" }}>
            <span style={sectionMark}>// WHY ALGORITHMX</span>
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
              color: "var(--lv2-ink)",
              textAlign: "center",
            }}
          >
            Our promises to every learner.
          </h2>
        </FadeUp>

        <FadeUp delay={0.12}>
          <p
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(1rem, 1.2vw, 1.0625rem)",
              lineHeight: 1.55,
              color: "rgba(17,22,38,0.73)",
              maxWidth: 640,
              margin: "0 auto 56px",
              textAlign: "center",
            }}
          >
            Whether you&rsquo;re 7 or 47, a parent, a teacher or learning for
            yourself, here&rsquo;s what you can count on in a world being
            reshaped by AI.
          </p>
        </FadeUp>

        <div className="lv2-trust-grid">
          {PILLARS.map((p, i) => (
            <FadeUp key={p.title} delay={0.05 * i + 0.18}>
              <article
                style={{
                  background: "linear-gradient(180deg, #fffdf8, #fdf9f2)",
                  boxShadow: "0 12px 30px -20px rgba(86,68,45,0.5), inset 0 1px 0 rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px) saturate(1.3)",
                  WebkitBackdropFilter: "blur(12px) saturate(1.3)",
                  border: "1px solid rgba(70,58,44,0.14)",
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
                      background: `radial-gradient(circle at 50% 38%, ${p.accent}1f, rgba(255,253,250,0.6))`,
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
                      color: "var(--lv2-ink)",
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
                    color: "rgba(17,22,38,0.78)",
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
