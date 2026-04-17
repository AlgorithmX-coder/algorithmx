"use client";

import { CSSProperties, useEffect, useRef } from "react";
import Link from "next/link";

/* ───────────────────────── CONSTANTS ───────────────────────── */

const BG = "#0a0e1a";
const CARD = "#111827";
const BLUE = "#60a5fa";
const GREEN = "#34d399";
const ORANGE = "#f97316";
const YELLOW = "#f59e0b";
const RED = "#ef4444";
const MUTED = "#94a3b8";
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const COURSES = [
  {
    title: "Cyber Heroes Academy",
    ages: "Ages 6-10",
    accent: BLUE,
    description:
      "An adventure-driven course where kids learn online safety through story, play, and interactive missions alongside Adam, Layla, and Robo.",
    features: "20 weeks · 45 min/week · Interactive missions · Boss battles",
    price: "£99",
    priceSub: "Lifetime access",
    status: "AVAILABLE NOW",
    statusColor: GREEN,
    cta: "Explore Course →",
    href: "/cyberheroes",
    enabled: true,
  },
  {
    title: "Cyber Explorers",
    ages: "Ages 11-14",
    accent: GREEN,
    description:
      "Deeper dives into digital literacy, social media safety, and critical thinking about online content. Motion graphics style.",
    features: "12 weeks · 1 hr/week · Real-world scenarios · Portfolio project",
    price: "£99",
    priceSub: "Lifetime access",
    status: "COMING SOON",
    statusColor: YELLOW,
    cta: "Coming 2026",
    href: "#",
    enabled: false,
  },
  {
    title: "CyberStart",
    ages: "Ages 15-17",
    accent: ORANGE,
    description:
      "Hands-on cybersecurity fundamentals: CTF challenges, incident response simulations, and ethical hacking basics.",
    features: "16 weeks · 1.5 hrs/week · CTF challenges · Mock environments",
    price: "£99",
    priceSub: "Lifetime access",
    status: "COMING SOON",
    statusColor: YELLOW,
    cta: "Coming 2026",
    href: "#",
    enabled: false,
  },
  {
    title: "CyberStart Pro",
    ages: "Ages 18+",
    accent: YELLOW,
    description:
      "Professional-grade cybersecurity training: penetration testing, security operations, and career preparation.",
    features: "20 weeks · 2 hrs/week · Industry tools · Career ready",
    price: "£109",
    priceSub: "Lifetime access",
    status: "COMING 2027",
    statusColor: YELLOW,
    cta: "Coming 2027",
    href: "#",
    enabled: false,
  },
];

const STATS = [
  { value: "72%", label: "of children encounter online threats before age 10", accent: RED },
  { value: "1 in 3", label: "children have been targeted by phishing or scams", accent: ORANGE },
  { value: "85%", label: "of parents feel unprepared to teach online safety", accent: YELLOW },
];

const WHY = [
  {
    icon: "shield",
    color: BLUE,
    title: "Built by Experts",
    text: "Designed in alignment with CyberFirst and ASDAN frameworks from day one.",
  },
  {
    icon: "gamepad",
    color: GREEN,
    title: "Learn by Doing",
    text: "Every lesson is hands-on: interactive simulations, not passive videos.",
  },
  {
    icon: "users",
    color: ORANGE,
    title: "Age-Appropriate",
    text: "Four tracks designed for how each age group actually learns and engages.",
  },
  {
    icon: "lock",
    color: YELLOW,
    title: "Lifetime Access",
    text: "Pay once, learn forever. Continuous updates as new threats emerge.",
  },
];

const STEPS = [
  { num: "1", title: "Choose Your Track", text: "Pick the right course for your age" },
  { num: "2", title: "Enrol — £99", text: "One-time payment, instant access" },
  { num: "3", title: "Learn at Your Pace", text: "Weekly missions, go as fast or slow as you want" },
  { num: "4", title: "Earn Certificates", text: "CyberFirst/ASDAN aligned achievements" },
];

const TESTIMONIALS = [
  {
    text: "My daughter absolutely loves it. She talks about Adam and Layla like they\u2019re her best friends, and she\u2019s already teaching ME about password safety!",
    name: "Sarah T.",
    role: "Parent of a 7-year-old",
  },
  {
    text: "Finally, a course that actually engages kids. The interactive missions are brilliant \u2014 my son doesn\u2019t even realise he\u2019s learning.",
    name: "James P.",
    role: "Parent of an 8-year-old",
  },
  {
    text: "As a teacher, I recommend this to every parent. It covers everything the curriculum misses about online safety, and the kids genuinely enjoy it.",
    name: "Mrs. K. Williams",
    role: "Year 4 Teacher",
  },
];

const PARTICLES = [
  { left: "10%", top: "15%", color: BLUE, size: 4, dur: 20, delay: 0 },
  { left: "75%", top: "22%", color: GREEN, size: 5, dur: 24, delay: -3 },
  { left: "30%", top: "50%", color: ORANGE, size: 3, dur: 18, delay: -6 },
  { left: "88%", top: "55%", color: YELLOW, size: 4, dur: 22, delay: -9 },
  { left: "6%", top: "70%", color: GREEN, size: 5, dur: 26, delay: -4 },
  { left: "50%", top: "14%", color: BLUE, size: 3, dur: 19, delay: -11 },
  { left: "65%", top: "80%", color: ORANGE, size: 4, dur: 23, delay: -7 },
  { left: "22%", top: "88%", color: YELLOW, size: 3, dur: 17, delay: -2 },
  { left: "42%", top: "38%", color: BLUE, size: 4, dur: 21, delay: -8 },
  { left: "82%", top: "42%", color: GREEN, size: 3, dur: 25, delay: -5 },
];

const TRUST_ITEMS = ["CyberFirst Aligned", "ASDAN Accreditation", "4 Age Tracks", "Ages 6 to Adult"];

/* ───────────────────────── SVG ICONS ───────────────────────── */

function Icon({ name, size = 28, color = "#fff" }: { name: string; size?: number; color?: string }) {
  const s: CSSProperties = { width: size, height: size, display: "block" };
  if (name === "shield")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    );
  if (name === "gamepad")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" />
      </svg>
    );
  if (name === "users")
    return (
      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    );
  return (
    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
  );
}

/* ───────────────────────── CSS ───────────────────────── */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Nunito:wght@400;600;700;800;900&display=swap');
* { font-family: 'Nunito', sans-serif; box-sizing: border-box; }
h1, h2, h3, h4, .display-font { font-family: 'Fredoka', 'Nunito', sans-serif; letter-spacing: -0.015em; }
.mono { font-family: 'JetBrains Mono', monospace; }
html { scroll-behavior: smooth; }

@keyframes axFloat {
  0%,100% { transform: translate(0, 0); }
  25% { transform: translate(30px, -50px); }
  50% { transform: translate(-20px, -80px); }
  75% { transform: translate(-40px, 15px); }
}
@keyframes axBreathe {
  0%,100% { opacity: 0.25; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(1.15); }
}
@keyframes axGrid {
  0% { background-position: 0 0; }
  100% { background-position: 60px 60px; }
}

.ax-card-hover {
  transition: transform 0.4s ${EASE}, box-shadow 0.4s ${EASE}, border-color 0.4s ${EASE};
}
.ax-card-hover:hover {
  transform: translateY(-6px);
}
`;

/* ───────────────────────── HELPERS ───────────────────────── */

function SectionBadge({ children, color }: { children: React.ReactNode; color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "6px 18px",
        borderRadius: 100,
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: "0.04em",
        color,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        marginBottom: 16,
      }}
    >
      {children}
    </span>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontSize: "clamp(28px, 4vw, 44px)",
        fontWeight: 700,
        color: "#fff",
        marginBottom: 16,
        lineHeight: 1.15,
      }}
    >
      {children}
    </h2>
  );
}

/* ───────────────────────── MAIN COMPONENT ───────────────────────── */

export default function AlgorithmXHome() {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mainRef.current) return;
    const els = mainRef.current.querySelectorAll<HTMLElement>("[data-reveal]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1, rootMargin: "-40px" }
    );
    els.forEach((el, i) => {
      const delay = parseFloat(el.dataset.reveal || "0") || i * 0.08;
      el.style.opacity = "0";
      el.style.transform = "translateY(28px)";
      el.style.transition = `opacity 0.7s ${EASE} ${delay}s, transform 0.7s ${EASE} ${delay}s`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={mainRef} style={{ background: BG, minHeight: "100vh", color: "#fff", overflowX: "hidden" }}>
      <style>{CSS}</style>

      {/* ── Background layers ── */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(96,165,250,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(96,165,250,0.04) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          animation: "axGrid 20s linear infinite",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 20%, transparent 70%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: p.color,
              opacity: 0.3,
              animation: `axFloat ${p.dur}s ease-in-out ${p.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* ═══════════════════ 1. NAV ═══════════════════ */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backdropFilter: "blur(16px) saturate(1.4)",
          WebkitBackdropFilter: "blur(16px) saturate(1.4)",
          background: "rgba(10,14,26,0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: `linear-gradient(135deg, ${BLUE}, ${GREEN})`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <span className="display-font" style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>
              Algorithm<span style={{ color: BLUE }}>X</span>
            </span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <a href="#courses" style={{ color: MUTED, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: `color 0.2s ${EASE}` }}>
              Courses
            </a>
            <Link href="/login" style={{ color: MUTED, fontSize: 14, fontWeight: 700, textDecoration: "none", transition: `color 0.2s ${EASE}` }}>
              Log In
            </Link>
            <Link
              href="/cyberheroes"
              style={{
                background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`,
                color: "#fff",
                fontSize: 14,
                fontWeight: 800,
                padding: "10px 22px",
                borderRadius: 100,
                textDecoration: "none",
                transition: `transform 0.25s ${EASE}, box-shadow 0.25s ${EASE}`,
                boxShadow: `0 4px 20px ${ORANGE}40`,
              }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════ 2. HERO ═══════════════════ */}
      <section
        style={{
          position: "relative",
          zIndex: 1,
          paddingTop: 160,
          paddingBottom: 100,
          textAlign: "center",
          maxWidth: 900,
          margin: "0 auto",
          padding: "160px 24px 100px",
        }}
      >
        {/* Breathing glow orb */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${BLUE}25, transparent 70%)`,
            animation: "axBreathe 6s ease-in-out infinite",
            pointerEvents: "none",
            zIndex: -1,
          }}
        />

        <h1
          data-reveal="0"
          className="display-font"
          style={{
            fontSize: "clamp(40px, 6vw, 72px)",
            fontWeight: 700,
            lineHeight: 1.08,
            marginBottom: 24,
            color: "#fff",
          }}
        >
          Cybersecurity Education
          <br />
          for the{" "}
          <span
            style={{
              background: `linear-gradient(135deg, ${BLUE}, ${GREEN})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Next Generation
          </span>
        </h1>

        <p
          data-reveal="0.1"
          style={{
            fontSize: "clamp(16px, 2vw, 20px)",
            color: "#cbd5e1",
            lineHeight: 1.7,
            maxWidth: 680,
            margin: "0 auto 40px",
          }}
        >
          We teach children and young adults the skills to stay safe online — through adventure, play,
          and real-world simulations. Because the best protection is knowledge.
        </p>

        <div data-reveal="0.2" style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Link
            href="/cyberheroes"
            style={{
              background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`,
              color: "#fff",
              fontSize: 16,
              fontWeight: 800,
              padding: "16px 36px",
              borderRadius: 100,
              textDecoration: "none",
              boxShadow: `0 8px 32px ${ORANGE}40`,
              transition: `transform 0.3s ${EASE}, box-shadow 0.3s ${EASE}`,
            }}
          >
            Explore Cyber Heroes Academy — Ages 6-10
          </Link>
          <a
            href="#courses"
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: 700,
              padding: "16px 36px",
              borderRadius: 100,
              textDecoration: "none",
              border: "2px solid rgba(255,255,255,0.15)",
              transition: `border-color 0.3s ${EASE}, background 0.3s ${EASE}`,
            }}
          >
            View All Courses
          </a>
        </div>

        {/* Trust strip */}
        <div
          data-reveal="0.3"
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          {TRUST_ITEMS.map((item) => (
            <span
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: MUTED,
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              <span style={{ color: GREEN, fontSize: 16 }}>✓</span>
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════════════ 3. THE PROBLEM ═══════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <div data-reveal="0">
            <SectionBadge color={RED}>🔒 The Challenge</SectionBadge>
          </div>
          <div data-reveal="0.05">
            <SectionHeading>The Internet Wasn&apos;t Built for Kids</SectionHeading>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 20,
            marginTop: 40,
            marginBottom: 40,
          }}
        >
          {STATS.map((stat, i) => (
            <div
              key={i}
              data-reveal={`${0.1 + i * 0.1}`}
              className="ax-card-hover"
              style={{
                background: CARD,
                borderRadius: 20,
                padding: "28px 24px",
                border: "1px solid rgba(255,255,255,0.06)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 3,
                  background: stat.accent,
                }}
              />
              <p
                className="display-font"
                style={{ fontSize: 48, fontWeight: 700, color: stat.accent, marginBottom: 8 }}
              >
                {stat.value}
              </p>
              <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.6 }}>{stat.label}</p>
            </div>
          ))}
        </div>

        <p
          data-reveal="0.4"
          style={{
            color: "#94a3b8",
            fontSize: 16,
            lineHeight: 1.8,
            textAlign: "center",
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          Schools barely scratch the surface. Parental controls can only do so much. Children need the
          knowledge and instincts to protect themselves — and they need to learn it in a way that
          actually sticks. That&apos;s why AlgorithmX exists.
        </p>
      </section>

      {/* ═══════════════════ 4. OUR COURSES ═══════════════════ */}
      <section id="courses" style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div data-reveal="0">
            <SectionBadge color={BLUE}>🎓 Our Courses</SectionBadge>
          </div>
          <div data-reveal="0.05">
            <SectionHeading>Cybersecurity Education for Every Age</SectionHeading>
          </div>
          <p data-reveal="0.1" style={{ color: MUTED, fontSize: 16, lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>
            Four carefully designed tracks that grow with your child — from playful adventures for
            little ones to professional-grade training for young adults.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: 24,
          }}
        >
          {COURSES.map((c, i) => (
            <div
              key={i}
              data-reveal={`${0.15 + i * 0.1}`}
              className="ax-card-hover"
              style={{
                background: CARD,
                borderRadius: 20,
                padding: 32,
                border: "1px solid rgba(255,255,255,0.06)",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = `${c.accent}50`;
                (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 60px ${c.accent}15`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.06)";
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              {/* Accent bar */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: c.accent }} />
              {/* Status badge */}
              <span
                style={{
                  position: "absolute",
                  top: 16,
                  right: 16,
                  padding: "4px 12px",
                  borderRadius: 100,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  color: c.statusColor,
                  background: `${c.statusColor}18`,
                  border: `1px solid ${c.statusColor}30`,
                }}
              >
                {c.status}
              </span>
              {/* Age badge */}
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: 100,
                  fontSize: 12,
                  fontWeight: 800,
                  color: c.accent,
                  background: `${c.accent}15`,
                  marginBottom: 16,
                  alignSelf: "flex-start",
                }}
              >
                {c.ages}
              </span>
              <h3 className="display-font" style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 12 }}>
                {c.title}
              </h3>
              <p style={{ color: "#cbd5e1", fontSize: 14, lineHeight: 1.7, marginBottom: 16, flex: 1 }}>
                {c.description}
              </p>
              <p className="mono" style={{ color: MUTED, fontSize: 12, marginBottom: 20, lineHeight: 1.8 }}>
                {c.features}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 20 }}>
                <span className="display-font" style={{ fontSize: 32, fontWeight: 700, color: "#fff" }}>
                  {c.price}
                </span>
                <span style={{ color: MUTED, fontSize: 13 }}>· {c.priceSub}</span>
              </div>
              {c.enabled ? (
                <Link
                  href={c.href}
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`,
                    color: "#fff",
                    fontSize: 15,
                    fontWeight: 800,
                    padding: "14px 0",
                    borderRadius: 100,
                    textDecoration: "none",
                    boxShadow: `0 4px 20px ${ORANGE}30`,
                    transition: `transform 0.25s ${EASE}`,
                  }}
                >
                  {c.cta}
                </Link>
              ) : (
                <span
                  style={{
                    display: "block",
                    textAlign: "center",
                    background: "rgba(255,255,255,0.04)",
                    color: MUTED,
                    fontSize: 15,
                    fontWeight: 700,
                    padding: "14px 0",
                    borderRadius: 100,
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "not-allowed",
                  }}
                >
                  {c.cta}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ 5. WHY ALGORITHMX ═══════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div data-reveal="0">
            <SectionBadge color={ORANGE}>⚡ Why Us</SectionBadge>
          </div>
          <div data-reveal="0.05">
            <SectionHeading>Not Just Another Online Course</SectionHeading>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 20,
          }}
        >
          {WHY.map((w, i) => (
            <div
              key={i}
              data-reveal={`${0.1 + i * 0.1}`}
              className="ax-card-hover"
              style={{
                background: CARD,
                borderRadius: 20,
                padding: "28px 24px",
                border: "1px solid rgba(255,255,255,0.06)",
                textAlign: "center",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px ${w.color}12`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = "none";
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: `${w.color}18`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <Icon name={w.icon} color={w.color} />
              </div>
              <h3 className="display-font" style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                {w.title}
              </h3>
              <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.7 }}>{w.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ 6. HOW IT WORKS ═══════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div data-reveal="0">
            <SectionBadge color={GREEN}>🚀 How It Works</SectionBadge>
          </div>
          <div data-reveal="0.05">
            <SectionHeading>Start Learning in Minutes</SectionHeading>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 20,
          }}
        >
          {STEPS.map((step, i) => {
            const colors = [BLUE, GREEN, ORANGE, YELLOW];
            const c = colors[i];
            return (
              <div
                key={i}
                data-reveal={`${0.1 + i * 0.1}`}
                style={{
                  textAlign: "center",
                  padding: "28px 20px",
                  borderRadius: 20,
                  background: CARD,
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div
                  className="display-font"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "50%",
                    background: `${c}20`,
                    color: c,
                    fontSize: 22,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                    border: `2px solid ${c}40`,
                  }}
                >
                  {step.num}
                </div>
                <h3 className="display-font" style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                  {step.title}
                </h3>
                <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6 }}>{step.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══════════════════ 7. TESTIMONIALS ═══════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <div data-reveal="0">
            <SectionBadge color={YELLOW}>💬 Testimonials</SectionBadge>
          </div>
          <div data-reveal="0.05">
            <SectionHeading>What Parents &amp; Teachers Say</SectionHeading>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 20,
          }}
        >
          {TESTIMONIALS.map((t, i) => (
            <div
              key={i}
              data-reveal={`${0.1 + i * 0.1}`}
              style={{
                background: CARD,
                borderRadius: 20,
                padding: "32px 28px",
                border: "1px solid rgba(255,255,255,0.06)",
                position: "relative",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  top: 16,
                  left: 24,
                  fontSize: 56,
                  lineHeight: 1,
                  color: `${BLUE}20`,
                  fontFamily: "Georgia, serif",
                  pointerEvents: "none",
                }}
              >
                &ldquo;
              </span>
              <p style={{ color: "#cbd5e1", fontSize: 15, lineHeight: 1.8, marginBottom: 20, position: "relative", zIndex: 1 }}>
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p style={{ color: "#fff", fontSize: 14, fontWeight: 800 }}>{t.name}</p>
                <p style={{ color: MUTED, fontSize: 13 }}>{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════ 8. FINAL CTA ═══════════════════ */}
      <section style={{ position: "relative", zIndex: 1, padding: "80px 24px", maxWidth: 700, margin: "0 auto" }}>
        <div
          data-reveal="0"
          style={{
            background: CARD,
            borderRadius: 28,
            padding: "48px 36px",
            textAlign: "center",
            border: `2px solid rgba(255,255,255,0.08)`,
            backgroundImage: `linear-gradient(${CARD}, ${CARD}), linear-gradient(135deg, ${BLUE}40, ${GREEN}40, ${ORANGE}40)`,
            backgroundOrigin: "border-box",
            backgroundClip: "padding-box, border-box",
          }}
        >
          <h2
            className="display-font"
            style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "#fff", marginBottom: 16 }}
          >
            Ready to Start?
          </h2>
          <p style={{ color: "#cbd5e1", fontSize: 16, lineHeight: 1.7, marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
            Choose the right track for your age and begin your cybersecurity journey today.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Link
              href="/cyberheroes"
              style={{
                background: `linear-gradient(135deg, ${ORANGE}, #fb923c)`,
                color: "#fff",
                fontSize: 15,
                fontWeight: 800,
                padding: "14px 32px",
                borderRadius: 100,
                textDecoration: "none",
                boxShadow: `0 6px 24px ${ORANGE}35`,
              }}
            >
              Cyber Heroes Academy (Ages 6-10)
            </Link>
            <a
              href="#courses"
              style={{
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                padding: "14px 32px",
                borderRadius: 100,
                textDecoration: "none",
                border: "2px solid rgba(255,255,255,0.15)",
              }}
            >
              View All Courses
            </a>
          </div>
          <p style={{ color: MUTED, fontSize: 13 }}>
            One-time payment · Lifetime access · 30-day guarantee
          </p>
        </div>
      </section>

      {/* ═══════════════════ 9. FOOTER ═══════════════════ */}
      <footer
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "48px 24px",
          marginTop: 40,
        }}
      >
        <div
          style={{
            maxWidth: 1000,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 24,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: `linear-gradient(135deg, ${BLUE}, ${GREEN})`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span className="display-font" style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>
                Algorithm<span style={{ color: BLUE }}>X</span>
              </span>
            </div>
            <p style={{ color: MUTED, fontSize: 13 }}>Cybersecurity Education for the Next Generation</p>
          </div>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {["Privacy", "Terms", "Contact", "Support"].map((link) => (
              <a
                key={link}
                href="#"
                style={{
                  color: MUTED,
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {link}
              </a>
            ))}
          </div>
          <p style={{ color: "rgba(148,163,184,0.5)", fontSize: 12, width: "100%", textAlign: "center", marginTop: 16 }}>
            © 2026 AlgorithmX. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
