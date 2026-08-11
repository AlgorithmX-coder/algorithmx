"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { FadeUp } from "./utilities";

/**
 * SubjectShowcase — the "Pick your stream" section.
 *
 * Restructured so the one live product leads. Cybersecurity is promoted to
 * a full-width FEATURED card (two-column HUD panel: hero copy + a flagship-
 * project showcase, carrying the section's only CTA button). The other five
 * streams drop to a compact, de-emphasized ROADMAP strip below — corner
 * brackets and accent kept, but muted so the live card owns the eye. The
 * layout now mirrors the subhead: one live today, five on the roadmap.
 *
 * ENCRYPTED ROADMAP (2026-07-17): the five upcoming streams are hidden
 * until launch. Each roadmap card renders as a classified/encrypted
 * teaser — a lock badge, permanently-scrambling ciphertext where the
 * name and flagship project used to be, and an "UNLOCKS IN N MONTHS"
 * countdown line. The scramble never resolves to the real strings; the
 * card data stays here so flipping a stream live restores the old card.
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
  /** Countdown label for encrypted roadmap cards, e.g. "3 months". */
  unlockIn?: string;
}

const STREAMS: Stream[] = [
  {
    id: "cybersecurity",
    name: "Cybersecurity",
    ages: "Ages 6 → Adult · 2 of 4 tracks live",
    status: "LIVE NOW",
    isLive: true,
    blurb:
      "From spotting scams at age 6 to real security skills that keep growing into adulthood. Online safety is the gateway skill.",
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
    unlockIn: "3 months",
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
    unlockIn: "6 months",
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
    unlockIn: "12 months",
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
    unlockIn: "15 months",
  },
  {
    id: "robotics",
    name: "Robotic Engineering",
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
    unlockIn: "18 months",
  },
];

export default function SubjectShowcase() {
  const featured = STREAMS.find((s) => s.isLive)!;
  const upcoming = STREAMS.filter((s) => !s.isLive);

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
              Cyber Security is live today. Five more courses are releasing
              soon, each built around real projects to kickstart your career
              in IT!
            </p>
          </FadeUp>
        </div>

        <FadeUp delay={0.16}>
          <FeaturedStreamCard stream={featured} />
        </FadeUp>

        <div style={{ marginTop: 40 }}>
          {/* Announcement header — says plainly what the encrypted cards
           *  are: new courses, releasing soon, decrypting on launch day. */}
          <FadeUp delay={0.22}>
            <div style={{ margin: "0 0 26px" }}>
              <p
                style={{
                  fontFamily: "var(--lv2-font-mono)",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.26em",
                  textTransform: "uppercase",
                  color: "var(--lv2-cyan)",
                  margin: 0,
                  textShadow: "0 0 18px rgba(0,229,255,0.35)",
                }}
              >
                {"// INCOMING · NEW STREAMS DETECTED"}
              </p>
              <h3
                style={{
                  fontFamily: "var(--lv2-font-display)",
                  fontSize: "clamp(1.35rem, 2.2vw, 1.8rem)",
                  fontWeight: 500,
                  letterSpacing: "-0.018em",
                  lineHeight: 1.15,
                  color: "var(--lv2-paper)",
                  margin: "12px 0 0",
                  textShadow: "0 2px 18px rgba(4,5,13,0.95), 0 0 6px rgba(4,5,13,0.8)",
                }}
              >
                Five new courses. Releasing soon.
              </h3>
              <p
                style={{
                  fontFamily: "var(--lv2-font-display)",
                  fontSize: "clamp(0.9rem, 1.05vw, 1rem)",
                  lineHeight: 1.55,
                  color: "rgba(232,237,255,0.62)",
                  maxWidth: 620,
                  margin: "10px 0 0",
                  textShadow: "0 2px 14px rgba(4,5,13,0.95), 0 0 5px rgba(4,5,13,0.8)",
                }}
              >
                Every card below is a real course, locked and encrypted until
                launch day. The first stream decrypts in 3 months.
              </p>
            </div>
          </FadeUp>
          <div className="lv2-roadmap-grid">
            {upcoming.map((s, i) => (
              <FadeUp key={s.id} delay={0.06 * i + 0.26}>
                <RoadmapCard stream={s} idx={i} />
              </FadeUp>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .lv2-roadmap-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
        }
        @media (max-width: 1080px) {
          .lv2-roadmap-grid {
            grid-template-columns: repeat(3, 1fr);
          }
        }
        @media (max-width: 720px) {
          .lv2-roadmap-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 460px) {
          .lv2-roadmap-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
      {/* Encrypted-card ambience (global: rendered by child components).
       *  PERF CONTRACT (2026-07-17): nothing here may paint per frame.
       *  The original decrypt sweep animated background-position on
       *  background-clip:text — 10 text elements repainting at 60fps for
       *  the life of the page, which showed up as scroll jank. The
       *  moving decrypt head is now plain colored spans advanced by the
       *  same ~11fps scramble tick (which was already repainting the
       *  text), and the scanline/caret are transform/opacity-only CSS
       *  animations, paused while the card is offscreen. */}
      <style jsx global>{`
        .lv2-cipher {
          display: block;
          font-family: var(--lv2-font-mono);
          letter-spacing: 0.1em;
          white-space: nowrap;
          overflow: hidden;
          color: rgba(232, 237, 255, 0.34);
        }
        .lv2-cipher-hot {
          color: var(--accent);
          text-shadow: 0 0 9px var(--accent);
        }
        .lv2-scanline {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 38%;
          background: linear-gradient(180deg, transparent, var(--accent), transparent);
          opacity: 0.055;
          pointer-events: none;
          animation: lv2ScanDrop 4.4s linear infinite;
        }
        @keyframes lv2ScanDrop {
          from {
            transform: translateY(-110%);
          }
          to {
            transform: translateY(290%);
          }
        }
        .lv2-cipher-caret {
          animation: lv2CipherCaret 1.1s steps(2, jump-none) infinite;
        }
        @keyframes lv2CipherCaret {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .lv2-scanline,
          .lv2-cipher-caret {
            animation: none;
          }
          .lv2-scanline {
            display: none;
          }
        }
      `}</style>
    </section>
  );
}

/* ─── Encrypted-card machinery ───────────────────────────────────── */

/* Charset the encrypted cards cycle through — hex + cipher punctuation. */
const CIPHER_GLYPHS = "ABCDEF0123456789#$%&@+=<>/";

/* Deterministic seed so the server render and the client's first paint
 * match — randomness only starts after mount. */
function cipherSeed(length: number, phase: number): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += CIPHER_GLYPHS[(i * 13 + phase * 7 + 5) % CIPHER_GLYPHS.length];
  }
  return out;
}

/* Permanently-scrambling ciphertext. Never derived from the real course
 * strings — there is nothing to "decode". ~25% of the glyphs re-roll
 * per tick, and a 3-glyph "decrypt head" walks the string on the same
 * tick (colored spans — no per-frame CSS painting). `active` gates the
 * interval so offscreen cards cost nothing; idle under
 * prefers-reduced-motion (static seed text stays). */
function CipherText({
  length,
  phase,
  active,
  style,
}: {
  length: number;
  phase: number;
  active: boolean;
  style?: React.CSSProperties;
}) {
  const [text, setText] = useState(() => cipherSeed(length, phase));
  const [head, setHead] = useState(() => (phase * 5) % length);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      setText((prev) => {
        const arr = prev.split("");
        const churn = Math.max(2, arr.length >> 2);
        for (let n = 0; n < churn; n++) {
          const i = Math.floor(Math.random() * arr.length);
          arr[i] = CIPHER_GLYPHS[Math.floor(Math.random() * CIPHER_GLYPHS.length)];
        }
        return arr.join("");
      });
      /* walk a few steps past the end so the highlight breathes off
       * between passes */
      setHead((h) => (h + 1) % (length + 8));
    }, 90);
    return () => window.clearInterval(id);
  }, [active, length]);
  return (
    <span aria-hidden className="lv2-cipher" style={style}>
      {text.slice(0, head)}
      <span className="lv2-cipher-hot">{text.slice(head, head + 3)}</span>
      {text.slice(head + 3)}
    </span>
  );
}

/* Padlock drawn in the hex badge — replaces the stream icons (which
 * would hint at the hidden subject). */
const LOCK_ICON =
  "M6 11h12a1 1 0 011 1v8a1 1 0 01-1 1H6a1 1 0 01-1-1v-8a1 1 0 011-1z M8 11V7a4 4 0 018 0v4 M12 15v2.5";

/* L-shaped corner bracket */
function Bracket({
  accent,
  corner,
  size = 18,
  off = 10,
}: {
  accent: string;
  corner: "tl" | "tr" | "bl" | "br";
  size?: number;
  off?: number;
}) {
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

/* Hexagon stream badge with the thin-line icon centred inside. */
function HexIcon({
  accent,
  icon,
  size = 46,
}: {
  accent: string;
  icon: string;
  size?: number;
}) {
  const k = size / 46;
  const w = 46 * k;
  const h = 52 * k;
  const pts = [
    [23, 2],
    [44, 14.5],
    [44, 37.5],
    [23, 50],
    [2, 37.5],
    [2, 14.5],
  ]
    .map(([x, y]) => `${x * k},${y * k}`)
    .join(" ");
  const inner = 22 * k;
  return (
    <span
      style={{
        position: "relative",
        width: w,
        height: h,
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }} aria-hidden>
        <polygon points={pts} fill={`${accent}1f`} stroke={accent} strokeWidth={1.5} />
      </svg>
      <svg
        width={inner}
        height={inner}
        viewBox="0 0 24 24"
        fill="none"
        stroke={accent}
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ position: "relative" }}
        aria-hidden
      >
        <path d={icon} />
      </svg>
    </span>
  );
}

/* Status pill — filled + pulse dot when live, muted outline otherwise. */
function StatusPill({ accent, status, live }: { accent: string; status: string; live: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 7,
        fontFamily: "var(--lv2-font-mono)",
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: live ? accent : "rgba(232,237,255,0.6)",
        background: live ? `${accent}1f` : "transparent",
        border: `1px solid ${live ? `${accent}77` : "rgba(232,237,255,0.22)"}`,
        padding: "5px 12px",
        borderRadius: 999,
      }}
    >
      {live && (
        <span
          aria-hidden
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: accent,
            boxShadow: `0 0 10px ${accent}`,
          }}
        />
      )}
      {status}
    </span>
  );
}

/* FEATURED — full-width, two-column hero panel for the live stream. */
function FeaturedStreamCard({ stream }: { stream: Stream }) {
  const a = stream.accent;
  return (
    <article
      className="lv2-featured-card"
      style={
        {
          "--accent": a,
          position: "relative",
          background: `radial-gradient(110% 130% at 12% -20%, ${a}24, transparent 55%), linear-gradient(180deg, rgba(11,15,26,0.94), rgba(4,7,14,0.96))`,
          border: `1px solid ${a}66`,
          borderRadius: 20,
          overflow: "hidden",
          boxShadow: `0 0 0 1px rgba(0,0,0,0.3), 0 26px 70px rgba(0,0,0,0.45), inset 0 0 70px ${a}14`,
          transition: "transform .35s cubic-bezier(0.16,1,0.3,1), box-shadow .35s cubic-bezier(0.16,1,0.3,1)",
        } as React.CSSProperties
      }
      onMouseOver={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-4px)";
        el.style.boxShadow = `0 0 0 1px ${a}66, 0 34px 84px ${a}30, inset 0 0 84px ${a}20`;
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.boxShadow = `0 0 0 1px rgba(0,0,0,0.3), 0 26px 70px rgba(0,0,0,0.45), inset 0 0 70px ${a}14`;
      }}
    >
      <Bracket accent={a} corner="tl" size={22} off={14} />
      <Bracket accent={a} corner="tr" size={22} off={14} />
      <Bracket accent={a} corner="bl" size={22} off={14} />
      <Bracket accent={a} corner="br" size={22} off={14} />

      <div className="lv2-featured-inner">
        {/* Left: hero copy + CTA */}
        <div className="lv2-featured-copy">
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <HexIcon accent={a} icon={stream.icon} size={58} />
            <svg width="60" height="20" viewBox="0 0 60 20" style={{ opacity: 0.6 }} aria-hidden>
              <path d="M0 10h40l8-6" fill="none" stroke={a} strokeWidth="1.4" />
              <circle cx="48" cy="4" r="2.5" fill={a} />
            </svg>
            <span style={{ marginLeft: "auto" }}>
              <StatusPill accent={a} status={stream.status} live />
            </span>
          </div>

          <h3
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(2rem, 3.4vw, 2.7rem)",
              fontWeight: 500,
              color: "var(--lv2-paper)",
              margin: "18px 0 0",
              letterSpacing: "-0.022em",
              lineHeight: 1.05,
            }}
          >
            {stream.name}
          </h3>

          <div
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(232,237,255,0.55)",
              marginTop: 10,
            }}
          >
            {stream.ages}
          </div>

          <p
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(0.95rem, 1.15vw, 1.0625rem)",
              lineHeight: 1.6,
              color: "rgba(232,237,255,0.78)",
              margin: "18px 0 0",
              maxWidth: 460,
            }}
          >
            {stream.blurb}
          </p>

          {stream.href && (
            <Link href={stream.href} style={ctaStyle(a)}>
              {stream.cta}
              <span aria-hidden style={{ marginLeft: 2 }}>→</span>
            </Link>
          )}

          {/* Aligned with the NCSC — scoped to the cybersecurity card only,
              framed as alignment (the NCSC runs no endorsement scheme). */}
          {stream.id === "cybersecurity" && (
            <div style={{ marginTop: 22 }}>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 12,
                  padding: "9px 16px",
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${a}44`,
                  boxShadow: `0 0 22px -14px ${a}`,
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: a,
                  }}
                >
                  Aligned with
                </span>
                <span aria-hidden style={{ width: 1, height: 20, background: "rgba(232,237,255,0.18)" }} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logos/ncsc.svg" alt="National Cyber Security Centre" loading="lazy" style={{ height: 26, width: "auto" }} />
              </span>
            </div>
          )}
        </div>

        {/* Right: flagship-project showcase */}
        <div
          className="lv2-featured-project"
          style={{
            border: `1px solid ${a}3a`,
            background: `linear-gradient(180deg, ${a}14, transparent 90%)`,
            borderRadius: 16,
            padding: "28px 26px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <span
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              color: a,
            }}
          >
            // FLAGSHIP PROJECT
          </span>
          <span
            style={{
              fontFamily: "var(--lv2-font-display)",
              fontSize: "clamp(1.15rem, 1.7vw, 1.45rem)",
              fontWeight: 500,
              color: "var(--lv2-paper)",
              lineHeight: 1.32,
            }}
          >
            {stream.project}
          </span>
          <span
            style={{
              fontFamily: "var(--lv2-font-mono)",
              fontSize: 11.5,
              lineHeight: 1.6,
              color: "rgba(232,237,255,0.5)",
              marginTop: 2,
            }}
          >
            Every stream ends in a real, shippable project.
          </span>
        </div>
      </div>

      <style jsx>{`
        .lv2-featured-card {
          will-change: transform;
        }
        .lv2-featured-inner {
          display: grid;
          grid-template-columns: 1.35fr 1fr;
          gap: 34px;
          align-items: stretch;
          padding: 38px 40px;
        }
        @media (max-width: 820px) {
          .lv2-featured-inner {
            grid-template-columns: 1fr;
            gap: 24px;
            padding: 30px 26px;
          }
        }
      `}</style>
    </article>
  );
}

/* ROADMAP — encrypted teaser for an upcoming stream. The course name,
 * ages, and flagship project are NOT rendered; in their place runs
 * permanently-scrambling ciphertext under a decrypt-sweep highlight and
 * a scanline beam. The only readable facts are the lock badge, the
 * ENCRYPTED pill, and the unlock countdown. */
function RoadmapCard({ stream, idx }: { stream: Stream; idx: number }) {
  const a = stream.accent;
  /* Run the encryption ambience only while the card is (near) visible —
   * offscreen cards pause their scramble intervals AND their CSS loops. */
  const cardRef = useRef<HTMLElement>(null);
  const onScreen = useInView(cardRef, { margin: "240px 0px 240px 0px" });
  /* Stagger the CSS loops so the five cards never pulse in sync. */
  const desync = (k: number): React.CSSProperties => ({
    animationDelay: `${(-1.3 * (idx + 1) * k).toFixed(2)}s`,
    animationPlayState: onScreen ? "running" : "paused",
  });
  return (
    <article
      ref={cardRef}
      className="lv2-roadmap-card"
      aria-label={`Classified upcoming course, unlocks in ${stream.unlockIn ?? "the future"}`}
      style={
        {
          "--accent": a,
          position: "relative",
          /* Near-opaque (was 0.6/0.72): the global typed-code backdrop
           * showed through the glass and cut across the ciphertext. */
          background:
            "linear-gradient(180deg, rgba(11,15,26,0.88), rgba(4,7,14,0.94))",
          border: `1px solid ${a}2e`,
          borderRadius: 14,
          padding: "22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          height: "100%",
          opacity: 0.9,
          overflow: "hidden",
          transition:
            "transform .3s cubic-bezier(0.16,1,0.3,1), box-shadow .3s cubic-bezier(0.16,1,0.3,1), border-color .3s, opacity .3s",
        } as React.CSSProperties
      }
      onMouseOver={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-3px)";
        el.style.opacity = "1";
        el.style.borderColor = `${a}66`;
        el.style.boxShadow = `0 16px 40px rgba(0,0,0,0.4), inset 0 0 34px ${a}12`;
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.opacity = "0.9";
        el.style.borderColor = `${a}2e`;
        el.style.boxShadow = "none";
      }}
    >
      <span aria-hidden className="lv2-scanline" style={desync(1)} />
      <Bracket accent={`${a}88`} corner="tl" size={12} off={8} />
      <Bracket accent={`${a}88`} corner="br" size={12} off={8} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <HexIcon accent={a} icon={LOCK_ICON} size={38} />
        <StatusPill accent={a} status="ENCRYPTED" live={false} />
      </div>

      {/* Ciphertext where the course name used to be. */}
      <CipherText
        length={14 + (idx % 3) * 2}
        phase={idx}
        active={onScreen}
        style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}
      />

      {/* The one readable line: the unlock countdown. */}
      <div
        style={{
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: a,
        }}
      >
        &gt; Unlocks in {stream.unlockIn ?? stream.status}
        <span aria-hidden className="lv2-cipher-caret" style={desync(0.31)}>
          _
        </span>
      </div>

      <div
        style={{
          borderTop: `1px solid ${a}22`,
          paddingTop: 12,
          marginTop: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 5,
        }}
      >
        <span
          style={{
            fontFamily: "var(--lv2-font-mono)",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: `${a}cc`,
          }}
        >
          {"// CLASSIFIED"}
        </span>
        <CipherText
          length={19 + ((idx + 1) % 3) * 2}
          phase={idx + 3}
          active={onScreen}
          style={{ fontSize: 11.5, opacity: 0.75 }}
        />
      </div>

      <style jsx>{`
        .lv2-roadmap-card {
          will-change: transform;
        }
      `}</style>
    </article>
  );
}

function ctaStyle(a: string): React.CSSProperties {
  return {
    alignSelf: "flex-start",
    marginTop: 26,
    padding: "15px 26px",
    borderRadius: 11,
    fontFamily: "var(--lv2-font-mono)",
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: "0.18em",
    textTransform: "uppercase",
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: a,
    color: "var(--lv2-ink)",
    border: "none",
    boxShadow: `0 8px 26px ${a}55, 0 0 18px ${a}66`,
    cursor: "pointer",
  };
}
