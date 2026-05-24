"use client";

import { FadeUp } from "./utilities";

/**
 * ProjectShowcase. Six real projects learners actually build, one per
 * stream. Concrete artefacts — not "learn X". Sits between the age
 * progression and trust sections to anchor the curriculum in tangible
 * output.
 */

interface Project {
  name: string;
  stream: string;
  age: string;
  blurb: string;
  artefacts: string[];
  accent: string;
  status: "LIVE" | "2026" | "2027";
}

const PROJECTS: Project[] = [
  {
    name: "Password Defender",
    stream: "CYBERSECURITY",
    age: "9–14",
    blurb:
      "Crack weak passwords, then build a tool that rates yours. Learn entropy, brute-force timing, and why \"P@ssword1\" is a disaster.",
    artefacts: ["Strength meter", "Brute-force demo", "Personal cheat sheet"],
    accent: "#5fffa3",
    status: "LIVE",
  },
  {
    name: "Pixel Platformer",
    stream: "GAME DEVELOPMENT",
    age: "10–16",
    blurb:
      "Design pixel art, code collisions, ship a playable level. Learn loops, state machines, and what makes a jump feel good.",
    artefacts: ["Tileset", "Physics engine", "Shareable build"],
    accent: "#9ff5ff",
    status: "2026",
  },
  {
    name: "Image Classifier",
    stream: "AI & MACHINE LEARNING",
    age: "11+",
    blurb:
      "Train a tiny neural net to tell cats from dogs. Inspect the dataset, watch accuracy climb, learn what \"the model is biased\" actually means.",
    artefacts: ["Labelled dataset", "Trained model", "Live demo"],
    accent: "#cba8ff",
    status: "2026",
  },
  {
    name: "Habit Tracker",
    stream: "APP DEVELOPMENT",
    age: "12+",
    blurb:
      "Build a phone app that actually runs. State, persistence, notifications. Shipped, not screenshot-mocked.",
    artefacts: ["UI components", "Local DB", "TestFlight / APK"],
    accent: "#ffd07a",
    status: "2027",
  },
  {
    name: "Pitch Deck Builder",
    stream: "ENTREPRENEURSHIP",
    age: "13+",
    blurb:
      "Run discovery interviews, size a market, build a 10-slide deck that VCs actually read. Practical not theoretical.",
    artefacts: ["Customer interviews", "TAM/SAM/SOM", "10-slide deck"],
    accent: "#ffc94a",
    status: "2027",
  },
  {
    name: "Maze-Solver Bot",
    stream: "ROBOTICS",
    age: "10+",
    blurb:
      "Code a virtual robot to navigate mazes using sensors. Wall-following, BFS, and why \"just go forward\" doesn't scale.",
    artefacts: ["Sensor sim", "BFS pathfinder", "Replay viewer"],
    accent: "#ff3ad6",
    status: "2027",
  },
];

export default function ProjectShowcase() {
  return (
    <section
      id="projects"
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
            // PROJECT-BASED LEARNING
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
            What you&rsquo;ll actually build.
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
            One real project per stream. Shipped artefacts, not certificates.
            Built in your hands, not someone else&rsquo;s.
          </p>
        </FadeUp>

        <div className="lv2-projects-grid">
          {PROJECTS.map((p, i) => (
            <FadeUp key={p.name} delay={0.06 * i + 0.18}>
              <article
                style={{
                  background: "rgba(13,15,24,0.72)",
                  backdropFilter: "blur(14px) saturate(1.4)",
                  WebkitBackdropFilter: "blur(14px) saturate(1.4)",
                  border: "1px solid rgba(232,237,255,0.08)",
                  borderLeft: `3px solid ${p.accent}`,
                  borderRadius: 16,
                  padding: "26px 26px 24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  height: "100%",
                  boxShadow:
                    "0 1px 3px rgba(0,0,0,0.4), 0 10px 32px rgba(0,0,0,0.25)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      color: p.accent,
                    }}
                  >
                    {p.stream}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--lv2-font-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.16em",
                      textTransform: "uppercase",
                      color: "var(--lv2-ink)",
                      background: p.accent,
                      padding: "2px 8px",
                      borderRadius: 999,
                      marginLeft: "auto",
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: "var(--lv2-font-display)",
                    fontSize: "1.6rem",
                    fontWeight: 500,
                    color: "var(--lv2-paper)",
                    margin: 0,
                    letterSpacing: "-0.02em",
                    lineHeight: 1.1,
                  }}
                >
                  {p.name}
                </h3>
                <div
                  style={{
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "rgba(232,237,255,0.5)",
                  }}
                >
                  AGES {p.age}
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
                  {p.blurb}
                </p>
                <div
                  style={{
                    borderTop: "1px solid rgba(232,237,255,0.08)",
                    paddingTop: 12,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                  }}
                >
                  {p.artefacts.map((a) => (
                    <span
                      key={a}
                      style={{
                        fontFamily: "var(--lv2-font-mono)",
                        fontSize: 10,
                        fontWeight: 600,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: "rgba(232,237,255,0.68)",
                        border: "1px solid rgba(232,237,255,0.12)",
                        padding: "4px 8px",
                        borderRadius: 6,
                      }}
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </article>
            </FadeUp>
          ))}
        </div>
      </div>

      <style jsx>{`
        .lv2-projects-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 960px) {
          .lv2-projects-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .lv2-projects-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}
