"use client";

import Link from "next/link";
import { FadeUp } from "./utilities";

/**
 * SubjectShowcase — the "Pick your stream" section. Six stream cards in a
 * 2×3 grid, restyled as HUD panels (reference): per-stream accent glow,
 * corner brackets, a hexagon stream icon with a short circuit tail, a
 * status badge, a flagship-project block, and a full-width CTA (a real
 * link for the live Cybersecurity subject, an inert locked "Coming 20XX"
 * for the rest so the homepage never leaves a family at a 404).
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
  /** Feather-style 24×24 icon path drawn in the hexagon badge. */
  icon: string;
  href: string | null;
  cta: string;
}

const STREAMS: Stream[] = [
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    ages: "Ages 6 → Adult · 4 tracks",
    status: "LIVE NOW",
    isLive: true,
    blurb:
      "From spotting scams at age 6 to delivering a full penetration-test report on a live web app as an adult. Online safety is the gateway skill.",
    project: "Pen-test a live web app & ship the security report",
    accent: "#3ee88f",
    icon: "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z",
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
    accent: "#4aa8ff",
    icon: "M7 8h10a4 4 0 014 4 4 4 0 01-4 4H7a4 4 0 01-4-4 4 4 0 014-4z M8 12h3 M9.5 10.5v3 M15.5 11.5h.01 M17.5 13h.01",
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
    accent: "#a472ff",
    icon: "M8 8h8v8H8z M5 10V8h2 M5 14v2h2 M17 8h2v2 M17 16h2v-2 M10 5V3h2 M14 5V3h-2 M10 21v-2 M14 19v2",
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
    accent: "#ffae4d",
    icon: "M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1z M11 18h2",
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
    icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
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
    accent: "#ff5b7a",
    icon: "M12 2v3 M5 8h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z M9 13h.01 M15 13h.01 M2 12v3 M22 12v3",
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

      <div style={{ position: "relative", maxWidth: 1180, margin: "0 auto" }}>
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
              // SIX STREAMS //
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
              Cyber Security is live today. The other five are on the 2026 – 2027
              roadmap, each built around real projects to kickstart your career
              in IT!
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
          gap: 22px;
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

/* L-shaped corner bracket */
function Bracket({
  accent,
  corner,
}: {
  accent: string;
  corner: "tl" | "tr" | "bl" | "br";
}) {
  const size = 18;
  const off = 10;
  const base: React.CSSProperties = {
    position: "absolute",
    width: size,
    height: size,
    pointerEvents: "none",
  };
  const pos: React.CSSProperties =
    corner === "tl"
      ? { top: off, left: off, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }
      : corner === "tr"
        ? { top: off, right: off, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}` }
        : corner === "bl"
          ? { bottom: off, left: off, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` }
          : { bottom: off, right: off, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` };
  return <span aria-hidden style={{ ...base, ...pos }} />;
}

function StreamCard({ stream }: { stream: Stream }) {
  const a = stream.accent;
  return (
    <article
      className="lv2-stream-card"
      style={
        {
          "--accent": a,
          position: "relative",
          background:
            `radial-gradient(120% 80% at 50% -10%, ${a}1c, transparent 60%), linear-gradient(180deg, rgba(11,15,26,0.92), rgba(4,7,14,0.94))`,
          border: `1px solid ${a}55`,
          borderRadius: 16,
          padding: "30px 26px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
          height: "100%",
          boxShadow: `0 0 0 1px rgba(0,0,0,0.3), 0 18px 50px rgba(0,0,0,0.4), inset 0 0 40px ${a}10`,
          transition:
            "transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s cubic-bezier(0.16,1,0.3,1)",
        } as React.CSSProperties
      }
      onMouseOver={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = `0 0 0 1px ${a}66, 0 26px 64px ${a}33, inset 0 0 56px ${a}1c`;
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = `0 0 0 1px rgba(0,0,0,0.3), 0 18px 50px rgba(0,0,0,0.4), inset 0 0 40px ${a}10`;
      }}
    >
      <Bracket accent={a} corner="tl" />
      <Bracket accent={a} corner="tr" />
      <Bracket accent={a} corner="bl" />
      <Bracket accent={a} corner="br" />

      {/* Header: hexagon icon + circuit tail, status badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            position: "relative",
            width: 46,
            height: 52,
            flexShrink: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="46" height="52" viewBox="0 0 46 52" style={{ position: "absolute", inset: 0 }} aria-hidden>
            <polygon
              points="23,2 44,14.5 44,37.5 23,50 2,37.5 2,14.5"
              fill={`${a}1f`}
              stroke={a}
              strokeWidth="1.5"
            />
          </svg>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={a}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "relative" }}
            aria-hidden
          >
            <path d={stream.icon} />
          </svg>
        </span>
        {/* circuit tail */}
        <svg width="60" height="20" viewBox="0 0 60 20" style={{ opacity: 0.6 }} aria-hidden>
          <path d="M0 10h40l8-6" fill="none" stroke={a} strokeWidth="1.4" />
          <circle cx="48" cy="4" r="2.5" fill={a} />
        </svg>

        <span
          style={{
            marginLeft: "auto",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: a,
            background: stream.isLive ? `${a}1f` : "transparent",
            border: `1px solid ${a}77`,
            padding: "5px 12px",
            borderRadius: 999,
          }}
        >
          {stream.isLive && (
            <span
              aria-hidden
              style={{
                width: 7,
                height: 7,
                borderRadius: 999,
                background: a,
                boxShadow: `0 0 10px ${a}`,
              }}
            />
          )}
          {stream.status}
        </span>
      </div>

      <h3
        style={{
          fontFamily: "var(--lv2-font-display)",
          fontSize: "1.55rem",
          fontWeight: 500,
          color: "var(--lv2-paper)",
          margin: "2px 0 0",
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
          letterSpacing: "0.18em",
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
          color: "rgba(232,237,255,0.74)",
          margin: 0,
          flex: 1,
        }}
      >
        {stream.blurb}
      </p>

      <div
        style={{
          borderTop: `1px solid ${a}22`,
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
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: a,
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

      {stream.isLive && stream.href ? (
        <Link href={stream.href} style={ctaStyle(a, true)}>
          {stream.cta}
          <span aria-hidden style={{ marginLeft: 2 }}>→</span>
        </Link>
      ) : (
        <span role="presentation" aria-disabled style={ctaStyle(a, false)}>
          {stream.cta}
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={a} strokeWidth="2.2" aria-hidden>
            <rect x="5" y="11" width="14" height="10" rx="2" />
            <path d="M8 11V7a4 4 0 018 0v4" strokeLinecap="round" />
          </svg>
        </span>
      )}

      <style jsx>{`
        .lv2-stream-card {
          will-change: transform;
        }
      `}</style>
    </article>
  );
}

function ctaStyle(a: string, live: boolean): React.CSSProperties {
  return {
    marginTop: 6,
    padding: "13px 18px",
    borderRadius: 10,
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
    background: live ? a : `${a}12`,
    color: live ? "var(--lv2-ink)" : a,
    border: live ? "none" : `1px solid ${a}55`,
    boxShadow: live ? `0 8px 26px ${a}55, 0 0 18px ${a}66` : "none",
    cursor: live ? "pointer" : "not-allowed",
    opacity: live ? 1 : 0.92,
  };
}
