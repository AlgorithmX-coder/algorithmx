"use client";

import Link from "next/link";
import { FadeUp } from "./utilities";

/**
 * SubjectShowcase. Six stream cards in a 2x3 grid - one per technology
 * subject. Cybersecurity is the only live subject; clicking its card
 * takes families to the /cybersecurity subject page where the four
 * cyber tracks (ages 6 → 18+) are listed in age order.
 *
 * The other five subjects do NOT have subject pages yet and MUST NOT
 * link to a dead route. They render the same card but with a soft
 * "Coming soon" treatment and a non-interactive CTA, so the homepage
 * never leaves the family at a 404. Batch 8+ will introduce per-
 * subject pages and re-enable those links one by one.
 */

interface Stream {
  id: string;
  name: string;
  ages: string;
  status: "LIVE NOW" | "COMING 2026" | "COMING 2027";
  isLive: boolean;
  blurb: string;
  project: string;
  accent: string;
  /** href is non-null ONLY for live subjects. Coming-soon subjects
   *  must not link anywhere — keeping href off the type for them
   *  prevents accidental relinking on a future edit. */
  href: string | null;
  cta: string;
}

const STREAMS: Stream[] = [
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    /* Subject page covers four age tracks: cyber-heroes (6–9),
     * cyberexplorers (10–13), cyberstart (14–16), cyberstart-pro
     * (16–18+). Surface "Ages 6 → Adult · 4 tracks" so the card reads
     * as a SUBJECT, not as one of the tracks underneath it. */
    ages: "Ages 6 → Adult · 4 tracks",
    status: "LIVE NOW",
    isLive: true,
    blurb:
      "From spotting scams at age 6 to delivering a full penetration-test report on a live web app as an adult. Online safety is the gateway skill.",
    project: "Build a Password Defender · 8 missions",
    accent: "#5fffa3",
    href: "/cybersecurity",
    cta: "View course",
  },
  {
    id: "game-dev",
    name: "Game Development",
    ages: "Ages 8 → Adult",
    status: "COMING 2026",
    isLive: false,
    blurb:
      "Pixel art, physics, state machines, and what makes a jump feel good. Scratch through Unity through Unreal.",
    project: "Ship a Pixel Platformer level",
    accent: "#9ff5ff",
    href: null,
    cta: "Coming 2026",
  },
  {
    id: "ai-ml",
    name: "AI & Machine Learning",
    ages: "Ages 11 → Adult",
    status: "COMING 2026",
    isLive: false,
    blurb:
      "Train a real model, inspect its bias, deploy it. Cuts through hype with hands-on intuition for how AI actually works.",
    project: "Train an Image Classifier",
    accent: "#cba8ff",
    href: null,
    cta: "Coming 2026",
  },
  {
    id: "app-dev",
    name: "App Development",
    ages: "Ages 12 → Adult",
    status: "COMING 2027",
    isLive: false,
    blurb:
      "Real apps on real phones. State, persistence, notifications, design. Build something your friends actually install.",
    project: "Ship a Habit Tracker",
    accent: "#ffd07a",
    href: null,
    cta: "Coming 2027",
  },
  {
    id: "entrepreneurship",
    name: "Tech Entrepreneurship",
    ages: "Ages 13 → Adult",
    status: "COMING 2027",
    isLive: false,
    blurb:
      "Discovery interviews, market sizing, MVP design, pitch craft. The non-coding half of building a tech business.",
    project: "Pitch a 10-slide deck to a real VC panel",
    accent: "#ffc94a",
    href: null,
    cta: "Coming 2027",
  },
  {
    id: "robotics",
    name: "Robotics",
    ages: "Ages 10 → Adult",
    status: "COMING 2027",
    isLive: false,
    blurb:
      "Sensors, pathfinding, motor control, autonomy. Code virtual robots first, then graduate to physical kits.",
    project: "Code a Maze-Solver Bot",
    accent: "#ff3ad6",
    href: null,
    cta: "Coming 2027",
  },
];

export default function SubjectShowcase() {
  return (
    <section
      id="subjects"
      style={{
        position: "relative",
        padding: "calc(var(--lv2-rail) * 2.4) var(--lv2-rail)",
        overflow: "hidden",
        color: "var(--lv2-paper)",
      }}
    >
      {/* Top seam line */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: 0,
          left: "10%",
          right: "10%",
          height: 1,
          background:
            "linear-gradient(90deg, transparent, rgba(0,229,255,0.32), transparent)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          maxWidth: 1180,
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <FadeUp>
            <p
              style={{
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "0.32em",
                textTransform: "uppercase",
                color: "rgba(232,237,255,0.55)",
                marginBottom: 14,
              }}
            >
              // SIX STREAMS
            </p>
          </FadeUp>
          <FadeUp delay={0.05}>
            <h2
              style={{
                fontFamily: "var(--lv2-font-display)",
                fontSize: "clamp(2.2rem, 4.6vw, 3.6rem)",
                lineHeight: 1.04,
                letterSpacing: "-0.025em",
                fontWeight: 400,
                margin: 0,
                color: "var(--lv2-paper)",
              }}
            >
              Pick your stream.
            </h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <p
              style={{
                fontFamily: "var(--lv2-font-display)",
                fontSize: "clamp(1rem, 1.2vw, 1.0625rem)",
                lineHeight: 1.55,
                color: "rgba(232,237,255,0.7)",
                maxWidth: 640,
                margin: "18px auto 0",
              }}
            >
              Cyber Security is live today. The other five are on the
              2026 – 2027 roadmap, each built around a real projects to
              kickstart your career in IT!
            </p>
          </FadeUp>
        </div>

        <div className="lv2-streams-grid">
          {STREAMS.map((s, i) => (
            <FadeUp key={s.id} delay={0.06 * i + 0.16}>
              <StreamCard stream={s} />
            </FadeUp>
          ))}
        </div>
      </div>

      <style jsx>{`
        .lv2-streams-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        @media (max-width: 960px) {
          .lv2-streams-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 600px) {
          .lv2-streams-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </section>
  );
}

function StreamCard({ stream }: { stream: Stream }) {
  const ctaStyle: React.CSSProperties = stream.isLive
    ? {
        background: stream.accent,
        color: "var(--lv2-ink)",
        border: "none",
        boxShadow: `0 8px 24px ${stream.accent}55`,
      }
    : {
        background: "transparent",
        color: stream.accent,
        border: `1px solid ${stream.accent}55`,
      };
  return (
    <article
      style={{
        background: "rgba(13,15,24,0.72)",
        backdropFilter: "blur(14px) saturate(1.4)",
        WebkitBackdropFilter: "blur(14px) saturate(1.4)",
        border: "1px solid rgba(232,237,255,0.08)",
        borderTop: `2px solid ${stream.accent}`,
        borderRadius: 18,
        padding: "28px 26px 26px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        height: "100%",
        boxShadow:
          "0 1px 3px rgba(0,0,0,0.4), 0 12px 36px rgba(0,0,0,0.28)",
        transition:
          "transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s cubic-bezier(0.16,1,0.3,1), border-color .35s ease",
      }}
      onMouseOver={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          `0 1px 3px rgba(0,0,0,0.4), 0 22px 56px ${stream.accent}38`;
      }}
      onMouseOut={(e) => {
        (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 1px 3px rgba(0,0,0,0.4), 0 12px 36px rgba(0,0,0,0.28)";
      }}
    >
      {/* Header row: accent dot + status pill */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <span
          aria-hidden
          style={{
            width: 10,
            height: 10,
            borderRadius: 999,
            background: stream.accent,
            boxShadow: `0 0 14px ${stream.accent}b3`,
          }}
        />
        <span
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: stream.isLive ? "var(--lv2-ink)" : stream.accent,
            background: stream.isLive ? stream.accent : "transparent",
            border: stream.isLive ? "none" : `1px solid ${stream.accent}66`,
            padding: stream.isLive ? "3px 9px" : "2px 8px",
            borderRadius: 999,
            marginLeft: "auto",
          }}
        >
          {stream.status}
        </span>
      </div>

      <h3
        style={{
          fontFamily: "var(--lv2-font-display)",
          fontSize: "1.6rem",
          fontWeight: 500,
          color: "var(--lv2-paper)",
          margin: 0,
          letterSpacing: "-0.018em",
          lineHeight: 1.1,
        }}
      >
        {stream.name}
      </h3>

      <div
        style={{
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 11,
          fontWeight: 600,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(232,237,255,0.5)",
        }}
      >
        {stream.ages}
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
        {stream.blurb}
      </p>

      <div
        style={{
          borderTop: "1px solid rgba(232,237,255,0.08)",
          paddingTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <span
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 10,
            fontWeight: 600,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(232,237,255,0.45)",
          }}
        >
          // FLAGSHIP PROJECT
        </span>
        <span
          style={{
            fontFamily: "var(--lv2-font-display)",
            fontSize: 14,
            color: "var(--lv2-paper)",
            lineHeight: 1.45,
          }}
        >
          {stream.project}
        </span>
      </div>

      {/* Live subjects render a real Link to their subject page. Coming-
       *  soon subjects render an inert span styled identically — NOT a
       *  Link with href="#", which still shows up as a valid anchor to
       *  the browser and used to slip into clicks before the
       *  pointer-events:none caught them. With no anchor in the DOM
       *  there's zero risk of a dead navigation. */}
      {stream.isLive && stream.href ? (
        <Link
          href={stream.href}
          style={{
            ...ctaStyle,
            marginTop: 4,
            padding: "12px 18px",
            borderRadius: 999,
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {stream.cta}
          <span aria-hidden style={{ marginLeft: 2 }}>→</span>
        </Link>
      ) : (
        <span
          role="presentation"
          aria-disabled
          style={{
            ...ctaStyle,
            marginTop: 4,
            padding: "12px 18px",
            borderRadius: 999,
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            opacity: 0.7,
            cursor: "not-allowed",
          }}
        >
          {stream.cta}
        </span>
      )}
    </article>
  );
}
