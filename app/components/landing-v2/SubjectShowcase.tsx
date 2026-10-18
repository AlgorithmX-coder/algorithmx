"use client";

import Link from "next/link";

import { COURSE_HREF, type LockupId } from "@/app/components/CourseLockup";
import { sectionMark } from "@/app/components/sectionMark";
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
    ages: "Ages 6 → Adult · all 4 tracks live",
    status: "LIVE NOW",
    isLive: true,
    blurb:
      "From spotting scams at age 6 to real security skills that keep growing into adulthood. Online safety is the gateway skill.",
    project: "Pen-test a live web app & ship the security report",
    accent: "#0e7a45",
    icon: "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z",
    href: "/cybersecurity",
    /* Plural: the link lands on the 4-track hub, not a single course. */
    cta: "View courses",
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
    accent: "#3a9fff",
    icon: "M7 8h10a4 4 0 014 4 4 4 0 01-4 4H7a4 4 0 01-4-4 4 4 0 014-4z M8 12h3 M9.5 10.5v3 M15.5 11.5h.01 M17.5 13h.01",
    href: null,
    cta: "Coming 2026",
    unlockIn: "2026",
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
    accent: "#9a7bff",
    icon: "M8 8h8v8H8z M5 10V8h2 M5 14v2h2 M17 8h2v2 M17 16h2v-2 M10 5V3h2 M14 5V3h-2 M10 21v-2 M14 19v2",
    href: null,
    cta: "Coming 2026",
    unlockIn: "2026",
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
    accent: "#ffb84d",
    icon: "M7 2h10a1 1 0 011 1v18a1 1 0 01-1 1H7a1 1 0 01-1-1V3a1 1 0 011-1z M11 18h2",
    href: null,
    cta: "Coming 2027",
    unlockIn: "2027",
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
    accent: "#ffd24d",
    icon: "M13 2L3 14h7l-1 8 10-12h-7l1-8z",
    href: null,
    cta: "Coming 2027",
    unlockIn: "2027",
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
    accent: "#ff5a78",
    icon: "M12 2v3 M5 8h14a1 1 0 011 1v9a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z M9 13h.01 M15 13h.01 M2 12v3 M22 12v3",
    href: null,
    cta: "Coming 2027",
    unlockIn: "2027",
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
        color: "var(--lv2-ink)",
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
            <p style={{ margin: "0 0 18px", textAlign: "center" }}>
              <span style={sectionMark}>{"// SIX STREAMS //"}</span>
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
                color: "var(--lv2-ink)",
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
                color: "rgba(17,22,38,0.73)",
                maxWidth: 640,
                margin: "18px auto 0",
              }}
            >
              {/* Owner 2026-09-23: lead on the IT world that is coming, and
                  say something for children too. The old line ended on
                  "kickstart your career in IT", which spoke only to the
                  adult end of a platform that starts at six. */}
              The IT world our children will work in is being built right
              now. Cyber Security is live today across every age, and five
              more subjects are in development, every one built on real
              projects: a six year old&rsquo;s first safe password, an
              adult&rsquo;s first job in tech.
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
              <p style={{ margin: "0 0 18px", textAlign: "left" }}>
                <span style={sectionMark}>{"// INCOMING · NEW STREAMS DETECTED"}</span>
              </p>
              <h3
                style={{
                  fontFamily: "var(--lv2-font-display)",
                  fontSize: "clamp(1.35rem, 2.2vw, 1.8rem)",
                  fontWeight: 500,
                  letterSpacing: "-0.018em",
                  lineHeight: 1.15,
                  color: "var(--lv2-ink)",
                  margin: "12px 0 0",
                  textShadow: "0 2px 18px rgba(255,255,255,0.90), 0 0 6px rgba(255,255,255,0.76)",
                }}
              >
                Five new courses. Releasing soon.
              </h3>
              <p
                style={{
                  fontFamily: "var(--lv2-font-display)",
                  fontSize: "clamp(0.9rem, 1.05vw, 1rem)",
                  lineHeight: 1.55,
                  color: "rgba(17,22,38,0.65)",
                  maxWidth: 620,
                  margin: "10px 0 0",
                  textShadow: "0 2px 14px rgba(255,255,255,0.90), 0 0 5px rgba(255,255,255,0.76)",
                }}
              >
                Every card below is a real course in development, locked and
                encrypted until launch day.
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
          color: rgba(190,216,204,0.82);
        }
        .lv2-cipher-hot {
          color: var(--accent);
          text-shadow: 0 0 10px var(--accent);
          font-weight: 700;
        }
        .lv2-scanline {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 38%;
          background: linear-gradient(180deg, transparent, var(--accent), transparent);
          opacity: 0.14;
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
        color: live ? accent : "rgba(17,22,38,0.63)",
        background: live ? `${accent}1f` : "transparent",
        border: `1px solid ${live ? `${accent}77` : "rgba(17,22,38,0.23)"}`,
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
/* The four live cyber tracks as designed mini-cards inside the featured
 * card: accent theme, logo badge, name, age band and a verb for what you
 * do there. Each links to its own course landing. */
function TrackMark({ id, accent }: { id: LockupId; accent: string }) {
  if (id === "heroes")
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
        <path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill={accent} />
        <path d="M13.2 6 L8.6 13 H11.4 L10.6 18 L15.6 11 H12.6 Z" fill="#06120d" />
      </svg>
    );
  if (id === "explorers")
    return (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.9" aria-hidden>
        <circle cx="12" cy="12" r="6.4" />
        <path d="M12 2.6 V6 M12 18 V21.4 M2.6 12 H6 M18 12 H21.4" />
        <circle cx="12" cy="12" r="1.7" fill={accent} stroke="none" />
      </svg>
    );
  if (id === "ops")
    return (
      <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.9" aria-hidden>
        <circle cx="12" cy="12" r="3" fill={accent} stroke="none" />
        <path d="M12 9 V4 M12 20 V15 M9 12 H4 M20 12 H15" strokeLinecap="round" />
        <circle cx="12" cy="4" r="1.5" fill={accent} stroke="none" />
        <circle cx="20" cy="12" r="1.5" fill={accent} stroke="none" />
      </svg>
    );
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinejoin="round" aria-hidden>
      <path d="M4 4 H14.5 L20 9.5 V20 H4 Z" />
      <path d="M8 9.5 L11.2 12.5 L8 15.5" strokeLinecap="round" />
      <path d="M13 15.5 H16.2" strokeLinecap="round" />
    </svg>
  );
}

const CYBER_TRACK_CARDS: ReadonlyArray<{ id: LockupId; label: string; accent: string; ages: string; verb: string }> = [
  { id: "heroes", label: "Heroes", accent: "#e0981f", ages: "Ages 6 to 9", verb: "Play & learn" },
  { id: "explorers", label: "Explorers", accent: "#2bbdd0", ages: "Ages 10 to 13", verb: "Investigate" },
  { id: "ops", label: "Ops", accent: "#8b7bff", ages: "Ages 14 to 17", verb: "Defend" },
  { id: "pro", label: "Pro", accent: "#ff7a3d", ages: "Ages 18+", verb: "Build & break" },
];

/* Featured Cybersecurity card — dark "cyber ops" console (owner 2026-10-18):
 * a HUD status line, a cyber grid, an animated reticle logo, the centred
 * title + blurb, the NCSC alignment strip and four designed track cards that
 * each link to a course. */
function FeaturedStreamCard({ stream }: { stream: Stream }) {
  return (
    <article className="ssf-card">
      <span aria-hidden className="ssf-grid" />
      <Bracket accent="#37e08a" corner="tl" size={24} off={16} />
      <Bracket accent="#37e08a" corner="tr" size={24} off={16} />
      <Bracket accent="#37e08a" corner="bl" size={24} off={16} />
      <Bracket accent="#37e08a" corner="br" size={24} off={16} />
      <div className="ssf-inner">
        <div className="ssf-hud">
          <span>AX // CYBER.SEC</span>
          <span>ENC:256 · STATUS:SECURE · TRACKS:4/4</span>
        </div>
        <span className="ssf-scope" aria-hidden>
          <span className="ssf-cbk a" />
          <span className="ssf-cbk b" />
          <span className="ssf-cbk c" />
          <span className="ssf-cbk d" />
          <span className="ssf-ring r1" />
          <span className="ssf-ring r2" />
          <span className="ssf-pulse" />
          <svg width="50" height="54" viewBox="0 0 24 26" fill="none" stroke="#5ff0a8" strokeWidth="1.8" strokeLinejoin="round">
            <path d="M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z" />
            <path d="M8.5 12.5 L11 15 L15.5 9.5" stroke="#8ff6ff" strokeWidth="2" />
          </svg>
        </span>
        <h3 className="ssf-ttl">{stream.name}</h3>
        <div className="ssf-ages">{stream.ages}</div>
        <p className="ssf-blurb">{stream.blurb}</p>
        <span className="ssf-ncsc">Aligned with UK&rsquo;s National Cyber Security Centre</span>
        <div className="ssf-tracks">
          {CYBER_TRACK_CARDS.map((t, i) => (
            <div key={t.id} className="ssf-trk" style={{ ["--c" as string]: t.accent }}>
              <span aria-hidden className="ssf-topbar" />
              <span aria-hidden className="ssf-no">{`0${i + 1}`}</span>
              <Link
                href={COURSE_HREF[t.id]}
                className="ssf-trk-a"
                style={{ display: "flex", flexDirection: "column", textDecoration: "none", padding: "18px 15px 15px", color: "inherit" }}
              >
                <span className="ssf-badge">
                  <TrackMark id={t.id} accent={t.accent} />
                </span>
                <span className="ssf-nm">
                  Cyber <em>{t.label}</em>
                </span>
                <span className="ssf-ag">{t.ages}</span>
                <span className="ssf-verb">{t.verb}</span>
              </Link>
            </div>
          ))}
        </div>
        {stream.href && (
          <Link href={stream.href} className="ssf-cta">
            {stream.cta}
            <span aria-hidden style={{ marginLeft: 2 }}>→</span>
          </Link>
        )}
      </div>

      <style jsx>{`
        .ssf-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          color: #37e08a;
          background: radial-gradient(130% 120% at 50% -10%, rgba(21, 155, 138, 0.14), transparent 55%),
            linear-gradient(180deg, #0b1d16, #060f0b);
          border: 1px solid rgba(21, 200, 160, 0.3);
          box-shadow: 0 26px 70px rgba(0, 0, 0, 0.55);
        }
        .ssf-grid {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: 0.8;
          background-image: linear-gradient(rgba(55, 224, 138, 0.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(55, 224, 138, 0.055) 1px, transparent 1px);
          background-size: 30px 30px;
          -webkit-mask: radial-gradient(130% 90% at 50% -10%, #000, transparent 64%);
          mask: radial-gradient(130% 90% at 50% -10%, #000, transparent 64%);
        }
        .ssf-inner {
          position: relative;
          z-index: 1;
          padding: 18px 36px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
        @media (max-width: 680px) {
          .ssf-inner {
            padding: 14px 20px 32px;
          }
        }
        .ssf-hud {
          display: flex;
          justify-content: space-between;
          width: 100%;
          gap: 8px;
          font-family: var(--lv2-font-mono);
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #5f8778;
          border-bottom: 1px solid rgba(55, 224, 138, 0.14);
          padding: 10px 2px 18px;
        }
        .ssf-hud span:last-child {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .ssf-scope {
          position: relative;
          width: 112px;
          height: 112px;
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: radial-gradient(60% 60% at 50% 42%, rgba(23, 160, 94, 0.22), #06130e 72%);
          box-shadow: 0 8px 24px -8px rgba(14, 122, 69, 0.6), inset 0 0 14px rgba(21, 155, 138, 0.18);
          border: 1px solid rgba(21, 200, 160, 0.35);
        }
        .ssf-ring {
          position: absolute;
          border-radius: 50%;
          border: 1.6px solid transparent;
          animation: ssfSpin 5s linear infinite;
        }
        .ssf-ring.r1 {
          inset: 12px;
          border-top-color: #35e0ff;
          border-right-color: rgba(53, 224, 255, 0.2);
        }
        .ssf-ring.r2 {
          inset: 26px;
          border-bottom-color: #37e08a;
          border-left-color: rgba(55, 224, 138, 0.2);
          animation-duration: 7s;
          animation-direction: reverse;
        }
        .ssf-cbk {
          position: absolute;
          width: 11px;
          height: 11px;
          margin: 9px;
          border-color: #35e0ff;
        }
        .ssf-cbk.a { left: 0; top: 0; border-left: 2px solid; border-top: 2px solid; }
        .ssf-cbk.b { right: 0; top: 0; border-right: 2px solid; border-top: 2px solid; }
        .ssf-cbk.c { left: 0; bottom: 0; border-left: 2px solid; border-bottom: 2px solid; }
        .ssf-cbk.d { right: 0; bottom: 0; border-right: 2px solid; border-bottom: 2px solid; }
        .ssf-pulse {
          position: absolute;
          inset: 30px;
          border-radius: 50%;
          border: 1.5px solid rgba(55, 224, 138, 0.5);
          animation: ssfPulse 2.8s ease-out infinite;
        }
        .ssf-scope svg {
          position: relative;
          z-index: 2;
          filter: drop-shadow(0 0 8px rgba(55, 224, 138, 0.7));
        }
        .ssf-ttl {
          font-family: var(--lv2-font-display);
          font-weight: 500;
          letter-spacing: -0.022em;
          font-size: clamp(2rem, 4.4vw, 2.9rem);
          margin: 18px 0 0;
          color: #eafff5;
          line-height: 1.02;
        }
        .ssf-ages {
          font-family: var(--lv2-font-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.17em;
          text-transform: uppercase;
          margin-top: 11px;
          color: #7bbfa4;
        }
        .ssf-blurb {
          font-family: var(--lv2-font-display);
          font-size: clamp(0.95rem, 1.15vw, 1.0625rem);
          line-height: 1.6;
          max-width: 560px;
          margin: 15px auto 0;
          color: #c3e3d5;
        }
        .ssf-ncsc {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          margin-top: 20px;
          padding: 8px 15px;
          border-radius: 999px;
          border: 1px solid rgba(55, 224, 138, 0.3);
          background: rgba(55, 224, 138, 0.05);
          font-family: var(--lv2-font-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8ff3c4;
        }
        .ssf-tracks {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin: 28px 0 0;
          width: 100%;
        }
        @media (max-width: 680px) {
          .ssf-tracks {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        .ssf-trk {
          position: relative;
          border-radius: 16px;
          overflow: hidden;
          text-align: left;
          background: linear-gradient(180deg, color-mix(in srgb, var(--c) 15%, #0a1813), #081210);
          border: 1px solid color-mix(in srgb, var(--c) 42%, transparent);
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .ssf-trk:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 34px -16px var(--c);
        }
        .ssf-topbar {
          position: absolute;
          left: 0;
          right: 0;
          top: 0;
          height: 3px;
          background: var(--c);
          z-index: 2;
        }
        .ssf-no {
          position: absolute;
          right: 13px;
          top: 13px;
          font-family: var(--lv2-font-mono);
          font-size: 10px;
          font-weight: 600;
          color: var(--c);
          opacity: 0.6;
          z-index: 2;
        }
        .ssf-badge {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          background: color-mix(in srgb, var(--c) 22%, #06120d);
          box-shadow: inset 0 0 10px color-mix(in srgb, var(--c) 30%, transparent), 0 0 14px -4px var(--c);
        }
        .ssf-nm {
          font-family: var(--lv2-font-display);
          font-weight: 600;
          font-size: 14px;
          color: #eafff5;
          line-height: 1.1;
        }
        .ssf-nm em {
          font-style: normal;
          color: var(--c);
        }
        .ssf-ag {
          font-family: var(--lv2-font-mono);
          font-size: 9px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: #8fb3a4;
          margin-top: 4px;
        }
        .ssf-verb {
          font-family: var(--lv2-font-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--c);
          margin-top: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .ssf-verb::before {
          content: "";
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--c);
          box-shadow: 0 0 7px var(--c);
        }
        :global(.ssf-cta) {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: var(--lv2-font-display);
          font-weight: 600;
          font-size: 15px;
          text-decoration: none;
          border-radius: 12px;
          padding: 14px 28px;
          margin-top: 30px;
          background: linear-gradient(180deg, #1fd089, #0f9a5c);
          color: #04140d;
          box-shadow: 0 12px 28px -10px rgba(55, 224, 138, 0.6);
          transition: transform 0.18s, box-shadow 0.18s;
        }
        :global(.ssf-cta:hover) {
          transform: translateY(-2px);
          box-shadow: 0 18px 34px -12px rgba(55, 224, 138, 0.75);
        }
        :global(.ssf-trk-a:focus-visible) {
          outline: 2px solid var(--c);
          outline-offset: 3px;
          border-radius: 12px;
        }
        @keyframes ssfSpin {
          to {
            transform: rotate(360deg);
          }
        }
        @keyframes ssfPulse {
          0% {
            transform: scale(0.6);
            opacity: 0.6;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .ssf-ring,
          .ssf-pulse {
            animation: none;
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
          /* Owner 2026-10-14: the classified cards blended into the paper.
           * They now stand off it — a visible accent border, a faint accent
           * sheen in the fill, an outer drop shadow that lifts the card and
           * a thin accent ring just outside the edge. The accent colour still
           * tells each card apart; it just reads as a card now, not a smudge. */
          background: `linear-gradient(180deg, ${a}26, #0a1712 52%, #060f0b)`,
          border: `1.5px solid ${a}99`,
          boxShadow: `0 18px 38px -22px rgba(0,0,0,0.6), 0 0 0 1px ${a}33`,
          borderRadius: 14,
          padding: "22px 20px",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          height: "100%",
          opacity: 1,
          overflow: "hidden",
          transition:
            "transform .3s cubic-bezier(0.16,1,0.3,1), box-shadow .3s cubic-bezier(0.16,1,0.3,1), border-color .3s, opacity .3s",
        } as React.CSSProperties
      }
      onMouseOver={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(-4px)";
        el.style.opacity = "1";
        el.style.borderColor = a;
        el.style.boxShadow = `0 24px 50px -22px rgba(0,0,0,0.7), 0 0 0 1px ${a}66, inset 0 0 40px ${a}12`;
      }}
      onMouseOut={(e) => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.transform = "translateY(0)";
        el.style.opacity = "1";
        el.style.borderColor = `${a}99`;
        el.style.boxShadow = `0 18px 38px -22px rgba(0,0,0,0.6), 0 0 0 1px ${a}33`;
      }}
    >
      <span aria-hidden className="lv2-scanline" style={desync(1)} />
      <Bracket accent={`${a}88`} corner="tl" size={12} off={8} />
      <Bracket accent={`${a}88`} corner="br" size={12} off={8} />

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
        <HexIcon accent={a} icon={LOCK_ICON} size={38} />
        {/* Owner: put unlocks soon. "ENCRYPTED" described the graphic;
            this says what it means for the reader. */}
        <StatusPill accent={a} status="UNLOCKS SOON" live={false} />
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
            color: a,
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
