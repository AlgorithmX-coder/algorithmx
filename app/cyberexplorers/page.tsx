"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import SmoothScroll from "@/app/components/SmoothScroll";
import { ForestGlowScene } from "@/app/components/PixarScenes";

/* ─────────────── TOKENS — warm Pixar dusk palette ─────────────── */
const BG = "#1a0612";              // page bg (was near-black)
const CARD = "#2a0d2e";            // card surface (was navy)
const CYAN = "#ffd58a";            // primary accent → gold light
const PURPLE = "#a06aff";          // mystic violet (kept)
const EMERALD = "#7cc89a";         // success accent → moss
const GOLD = "#ff9b4a";            // gold mid
const MUTED = "rgba(255, 233, 200, 0.55)";
const MONO = "'JetBrains Mono', 'Fira Code', 'Consolas', monospace";
const HEAD = "'Space Grotesk', system-ui, sans-serif";
const BODY = "'DM Sans', system-ui, sans-serif";

/* ─────────────── DATA ─────────────── */
const WEEKS = [
  { week: 1, title: "Digital Identity & Footprint", desc: "Your online presence is permanent — learn to control it", free: true },
  { week: 2, title: "Password Security & Authentication", desc: "Beyond \"password123\" — hashing, 2FA, and password managers" },
  { week: 3, title: "Phishing & Social Engineering", desc: "How hackers manipulate people, not just machines" },
  { week: 4, title: "Network Fundamentals", desc: "IP addresses, Wi-Fi security, VPNs — how data travels" },
  { week: 5, title: "Encryption & Secure Communication", desc: "Caesar ciphers to modern encryption — keeping secrets safe" },
  { week: 6, title: "Malware & Threat Landscape", desc: "Viruses, ransomware, trojans — how they work and how to stop them" },
  { week: 7, title: "Social Media Security", desc: "Privacy settings, data harvesting, deepfakes, and digital manipulation" },
  { week: 8, title: "Safe Browsing & OSINT", desc: "How to verify information and spot misinformation online" },
  { week: 9, title: "Ethical Hacking Introduction", desc: "White hat vs black hat, bug bounties, responsible disclosure" },
  { week: 10, title: "Incident Response", desc: "What to do when things go wrong — the cyber emergency plan" },
  { week: 11, title: "CTF Challenge Week", desc: "Capture The Flag — apply everything you've learned in a live challenge" },
  { week: 12, title: "Certification & Graduation", desc: "Final assessment, portfolio review, CyberFirst-aligned certificate" },
];

const FEATURES = [
  { title: "Hands-on Labs", desc: "Build real security tools and run simulated attacks in safe sandboxed environments.", icon: "🧪" },
  { title: "CTF Challenges", desc: "Compete in Capture The Flag competitions to test your skills against real scenarios.", icon: "🚩" },
  { title: "Industry Tools", desc: "Learn the same tools professionals use — Wireshark, Nmap, Burp Suite basics.", icon: "🛠️" },
  { title: "Portfolio Builder", desc: "Graduate with a cybersecurity portfolio showcasing your skills to schools and employers.", icon: "📁" },
];

const PATHWAY = [
  { name: "Script Kiddie", weeks: "Weeks 1-4", colour: EMERALD, skills: ["Digital identity", "Password security", "Phishing awareness", "Network basics"] },
  { name: "Ethical Hacker", weeks: "Weeks 5-8", colour: CYAN, skills: ["Encryption fundamentals", "Malware analysis", "Social media defence", "OSINT techniques"] },
  { name: "Security Analyst", weeks: "Weeks 9-12", colour: PURPLE, skills: ["Ethical hacking", "Incident response", "CTF competition", "Portfolio projects"] },
];

const HERO_LINES = [
  { prefix: "$", text: "initialise cyber_explorers --age 11-14", type: "cmd" as const },
  { prefix: ">", text: "Loading threat detection modules...", type: "log" as const },
  { prefix: ">", text: "Activating encryption protocols...", type: "log" as const },
  { prefix: ">", text: "Ready.", type: "log" as const },
  { prefix: "", text: "", type: "blank" as const },
  { prefix: "", text: "CYBER EXPLORERS ACADEMY", type: "title" as const },
  { prefix: "", text: "12-week cybersecurity course for ages 11-14", type: "sub" as const },
];

const ICONS_DRIFT = ["🔒", "🛡", "🔑", "⟨/⟩", "⌘", "#", "$", "{ }"];

/* ─────────────── KEYFRAMES ─────────────── */
const STYLES = `
@keyframes cxBlink { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
@keyframes cxScan { 0% { transform: translateY(-100%); } 100% { transform: translateY(100%); } }
@keyframes cxMatrixFall {
  0% { transform: translateY(-100%); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  100% { transform: translateY(110vh); opacity: 0; }
}
@keyframes cxIconDrift {
  0%,100% { transform: translate(0,0) rotate(0deg); }
  25% { transform: translate(6px,-10px) rotate(4deg); }
  50% { transform: translate(-8px,-5px) rotate(-3deg); }
  75% { transform: translate(5px,6px) rotate(2deg); }
}
@keyframes cxDashFlow {
  from { stroke-dashoffset: 24; }
  to { stroke-dashoffset: 0; }
}
@keyframes cxPulseTag {
  0%,100% { box-shadow: 0 0 0 rgba(255,213,138,0); }
  50% { box-shadow: 0 0 14px rgba(255,213,138,0.55); }
}
@keyframes cxGlowPulse {
  0%,100% { box-shadow: 0 0 20px rgba(255,213,138,0.15); }
  50% { box-shadow: 0 0 36px rgba(255,213,138,0.35); }
}
`;

let injected = false;
function ensureStyles() {
  if (typeof document === "undefined" || injected) return;
  const el = document.createElement("style");
  el.id = "ax-cyberexplorers-page";
  el.textContent = STYLES;
  document.head.appendChild(el);
  injected = true;
}

/* ─────────────── TERMINAL WINDOW ─────────────── */
function TerminalHeader({ title = "mentor@cyberexplorers:~" }: { title?: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 14px",
        borderBottom: "1px solid rgba(255,213,138,0.18)",
        background:
          "linear-gradient(180deg, rgba(255,213,138,0.08), rgba(255,213,138,0.02))",
      }}
    >
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: "#ef4444" }} />
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: GOLD }} />
      <span style={{ width: 12, height: 12, borderRadius: "50%", background: EMERALD }} />
      <span
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: MUTED,
          marginLeft: 10,
          letterSpacing: 0.5,
        }}
      >
        {title}
      </span>
    </div>
  );
}

/* ─────────────── HERO TYPEWRITER ─────────────── */
function HeroTerminal() {
  const [shown, setShown] = useState<number[]>(HERO_LINES.map(() => 0));
  const [lineIdx, setLineIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= HERO_LINES.length) return;
    const target = HERO_LINES[lineIdx].text.length;
    if (shown[lineIdx] >= target) {
      const nextDelay = HERO_LINES[lineIdx].type === "title" ? 320 : 180;
      const t = window.setTimeout(() => setLineIdx((i) => i + 1), nextDelay);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => {
      setShown((prev) => {
        const next = prev.slice();
        next[lineIdx] = Math.min(target, next[lineIdx] + 1);
        return next;
      });
    }, 28);
    return () => window.clearTimeout(t);
  }, [lineIdx, shown]);

  return (
    <div
      style={{
        maxWidth: 720,
        width: "92%",
        margin: "0 auto",
        background: "#0a0e1a",
        borderRadius: 16,
        overflow: "hidden",
        border: "1px solid rgba(255,213,138,0.22)",
        boxShadow:
          "0 0 40px rgba(255,213,138,0.2), inset 0 0 30px rgba(160,106,255,0.05)",
        animation: "cxGlowPulse 4s ease-in-out infinite",
      }}
    >
      <TerminalHeader />
      <div
        style={{
          fontFamily: MONO,
          fontSize: 15,
          padding: "28px 24px 32px",
          minHeight: 320,
          color: "#fff7e6",
          lineHeight: 1.8,
        }}
      >
        {HERO_LINES.map((line, i) => {
          const visible = shown[i];
          const isCurrent = i === lineIdx;
          const txt = line.text.slice(0, visible);
          if (line.type === "blank") return <div key={i} style={{ height: 10 }} />;
          if (line.type === "title") {
            return (
              <div
                key={i}
                style={{
                  fontFamily: HEAD,
                  fontSize: "clamp(28px, 5vw, 40px)",
                  fontWeight: 900,
                  letterSpacing: 1,
                  marginTop: 8,
                  background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {txt}
                {isCurrent && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 28,
                      background: CYAN,
                      marginLeft: 6,
                      verticalAlign: "middle",
                      animation: "cxBlink 1s steps(1) infinite",
                    }}
                  />
                )}
              </div>
            );
          }
          if (line.type === "sub") {
            return (
              <div
                key={i}
                style={{
                  fontFamily: BODY,
                  fontSize: 16,
                  color: MUTED,
                  marginTop: 8,
                }}
              >
                {txt}
                {isCurrent && txt.length < line.text.length && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 8,
                      height: 16,
                      background: MUTED,
                      marginLeft: 4,
                      animation: "cxBlink 1s steps(1) infinite",
                      verticalAlign: "middle",
                    }}
                  />
                )}
              </div>
            );
          }
          const prefixColour = line.type === "cmd" ? CYAN : EMERALD;
          return (
            <div key={i}>
              <span style={{ color: prefixColour, marginRight: 10 }}>{line.prefix}</span>
              <span style={{ color: line.type === "cmd" ? "#f1f5f9" : "#86efac" }}>
                {txt}
              </span>
              {isCurrent && (
                <span
                  style={{
                    display: "inline-block",
                    width: 8,
                    height: 16,
                    background: prefixColour,
                    marginLeft: 4,
                    verticalAlign: "middle",
                    animation: "cxBlink 1s steps(1) infinite",
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─────────────── MATRIX RAIN ─────────────── */
function MatrixRain() {
  const cols = useMemo(() => {
    return Array.from({ length: 28 }).map((_, i) => ({
      key: i,
      left: (i * 3.6 + (i % 3)) % 100,
      char: "01XY#$/&*?!%@ZL".charAt(i % 15),
      delay: (i * 0.9) % 14,
      duration: 16 + (i % 7) * 2.2,
      size: 11 + (i % 4),
      colour: i % 3 === 0 ? CYAN : i % 3 === 1 ? EMERALD : PURPLE,
    }));
  }, []);
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        opacity: 0.08,
      }}
    >
      {cols.map((c) => (
        <span
          key={c.key}
          style={{
            position: "absolute",
            left: `${c.left}%`,
            top: 0,
            fontFamily: MONO,
            fontSize: c.size,
            color: c.colour,
            animation: `cxMatrixFall ${c.duration}s linear infinite`,
            animationDelay: `${c.delay}s`,
          }}
        >
          {c.char}
        </span>
      ))}
    </div>
  );
}

/* ─────────────── DRIFTING ICONS ─────────────── */
function DriftingIcons() {
  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {ICONS_DRIFT.map((icon, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            fontFamily: MONO,
            fontSize: 22 + (i % 4) * 8,
            color: i % 2 === 0 ? CYAN : PURPLE,
            opacity: 0.06,
            left: `${(i * 11 + 7) % 95}%`,
            top: `${(i * 17 + 13) % 85}%`,
            animation: `cxIconDrift ${8 + (i % 5)}s ease-in-out infinite`,
            animationDelay: `${(i * 0.7) % 4}s`,
            filter: "blur(0.3px)",
          }}
        >
          {icon}
        </span>
      ))}
    </div>
  );
}

/* ─────────────── SECTION HEADING ─────────────── */
function TermHeading({ cmd }: { cmd: string }) {
  return (
    <h2
      style={{
        fontFamily: MONO,
        fontSize: "clamp(20px, 3vw, 28px)",
        fontWeight: 700,
        color: "#f1f5f9",
        marginBottom: 32,
        letterSpacing: 0.4,
      }}
    >
      <span style={{ color: EMERALD }}>root@cyberexplorers</span>
      <span style={{ color: MUTED }}>:</span>
      <span style={{ color: CYAN }}>~</span>
      <span style={{ color: MUTED }}>$ </span>
      <span>{cmd}</span>
      <span
        style={{
          display: "inline-block",
          width: 10,
          height: 20,
          background: CYAN,
          marginLeft: 6,
          verticalAlign: "middle",
          animation: "cxBlink 1s steps(1) infinite",
        }}
      />
    </h2>
  );
}

/* ─────────────── WEEK CARD ─────────────── */
function WeekCard({ week, title, desc, free, index }: { week: number; title: string; desc: string; free?: boolean; index: number }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -4 }}
      style={{
        background: CARD,
        borderRadius: 14,
        border: "1px solid rgba(255,213,138,0.18)",
        overflow: "hidden",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
      onMouseEnter={(e) => {
        const t = e.currentTarget;
        t.style.borderColor = CYAN;
        t.style.boxShadow = `0 0 24px rgba(255,213,138,0.25)`;
      }}
      onMouseLeave={(e) => {
        const t = e.currentTarget;
        t.style.borderColor = "rgba(255,213,138,0.18)";
        t.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "9px 14px",
          borderBottom: "1px solid rgba(255,213,138,0.15)",
          background:
            "linear-gradient(180deg, rgba(255,213,138,0.07), rgba(160,106,255,0.04))",
        }}
      >
        <span
          style={{
            fontFamily: MONO,
            fontSize: 11,
            fontWeight: 700,
            color: CYAN,
            letterSpacing: 1,
            padding: "3px 9px",
            borderRadius: 4,
            background: "rgba(255,213,138,0.08)",
            border: "1px solid rgba(255,213,138,0.3)",
            animation: free ? "cxPulseTag 1.8s ease-in-out infinite" : undefined,
          }}
        >
          WEEK {week.toString().padStart(2, "0")}
        </span>
        {free && (
          <span
            style={{
              fontFamily: MONO,
              fontSize: 10,
              fontWeight: 800,
              color: "#0a0e1a",
              background: EMERALD,
              padding: "3px 9px",
              borderRadius: 4,
              letterSpacing: 1,
            }}
          >
            FREE
          </span>
        )}
      </div>
      <div style={{ padding: "16px 18px 20px" }}>
        <h3
          style={{
            fontFamily: HEAD,
            fontSize: 17,
            fontWeight: 700,
            color: "#f1f5f9",
            margin: "0 0 8px",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        <p style={{ fontFamily: BODY, fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.55 }}>
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

/* ─────────────── FEATURE CARD ─────────────── */
function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: string }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        background: CARD,
        borderRadius: 14,
        border: "1px solid rgba(160,106,255,0.18)",
        padding: 20,
        overflow: "hidden",
        transition: "border-color 0.2s, transform 0.2s",
        transform: hovered ? "translateY(-3px)" : "none",
        borderColor: hovered ? PURPLE : "rgba(160,106,255,0.18)",
      }}
    >
      {hovered && (
        <div
          aria-hidden
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: 0,
            height: 2,
            background: `linear-gradient(90deg, transparent, ${CYAN}, transparent)`,
            filter: "blur(1px)",
            animation: "cxScan 1.4s linear infinite",
          }}
        />
      )}
      <div style={{ fontSize: 32, marginBottom: 10 }}>{icon}</div>
      <h3
        style={{
          fontFamily: HEAD,
          fontSize: 17,
          fontWeight: 700,
          color: CYAN,
          margin: "0 0 8px",
        }}
      >
        {title}
      </h3>
      <p style={{ fontFamily: BODY, fontSize: 14, color: MUTED, margin: 0, lineHeight: 1.55 }}>
        {desc}
      </p>
    </div>
  );
}

/* ─────────────── PATHWAY TIER ─────────────── */
function PathwayTier({ name, weeks, colour, skills, index }: { name: string; weeks: string; colour: string; skills: string[]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{
        flex: 1,
        minWidth: 240,
        background: CARD,
        borderRadius: 14,
        border: `1px solid ${colour}55`,
        padding: 22,
        position: "relative",
        boxShadow: `inset 0 0 30px ${colour}10`,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          fontWeight: 700,
          color: colour,
          letterSpacing: 2,
          marginBottom: 6,
        }}
      >
        TIER {index + 1}
      </div>
      <h3
        style={{
          fontFamily: HEAD,
          fontSize: 22,
          fontWeight: 900,
          color: "#f1f5f9",
          margin: "0 0 4px",
          letterSpacing: 0.3,
        }}
      >
        {name}
      </h3>
      <div
        style={{
          fontFamily: MONO,
          fontSize: 12,
          color: MUTED,
          marginBottom: 16,
        }}
      >
        {weeks}
      </div>
      <ul
        style={{
          listStyle: "none",
          margin: 0,
          padding: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {skills.map((s) => (
          <li
            key={s}
            style={{
              fontFamily: BODY,
              fontSize: 14,
              color: "rgba(255, 233, 200, 0.85)",
              paddingLeft: 16,
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                left: 0,
                color: colour,
                fontFamily: MONO,
                fontWeight: 700,
              }}
            >
              ▸
            </span>
            {s}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

/* ─────────────── MAIN ─────────────── */
export default function CyberExplorersPage() {
  useEffect(ensureStyles, []);

  return (
    <SmoothScroll>
      <main
        style={{
          background: `radial-gradient(ellipse at 50% -10%, #4a1a4a 0%, #2a0d2e 35%, ${BG} 70%, #0a0410 100%)`,
          color: "#fff7e6",
          fontFamily: BODY,
          minHeight: "100vh",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <ForestGlowScene />
        {/* 1. HERO */}
        <section
          style={{
            position: "relative",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "80px 20px 60px",
          }}
        >
          <MatrixRain />
          <DriftingIcons />
          <div
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at 50% 50%, rgba(160,106,255,0.15), transparent 60%), radial-gradient(ellipse at 50% 110%, rgba(255,213,138,0.12), transparent 50%)",
              pointerEvents: "none",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: CYAN,
              letterSpacing: 4,
              marginBottom: 16,
              textTransform: "uppercase",
              zIndex: 2,
            }}
          >
            // algorithmx / cyber_explorers
          </motion.div>

          <div style={{ position: "relative", zIndex: 2, width: "100%" }}>
            <HeroTerminal />
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 2.2 }}
            style={{
              position: "relative",
              zIndex: 2,
              marginTop: 32,
              display: "flex",
              gap: 14,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <Link
              href="/cyberexplorers/week1"
              style={{
                background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                color: "#0a0e1a",
                fontWeight: 800,
                padding: "14px 32px",
                borderRadius: 12,
                textDecoration: "none",
                fontFamily: HEAD,
                letterSpacing: 0.8,
                boxShadow: `0 0 24px ${CYAN}55`,
                fontSize: 15,
              }}
            >
              Start Free Trial →
            </Link>
            <a
              href="#curriculum"
              style={{
                border: `1px solid ${CYAN}66`,
                color: CYAN,
                fontWeight: 700,
                padding: "13px 30px",
                borderRadius: 12,
                textDecoration: "none",
                fontFamily: HEAD,
                letterSpacing: 0.5,
                fontSize: 15,
                background: "rgba(255,213,138,0.05)",
              }}
            >
              View Curriculum
            </a>
          </motion.div>
        </section>

        {/* 2. CURRICULUM */}
        <section
          id="curriculum"
          style={{
            position: "relative",
            padding: "100px 20px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <TermHeading cmd="cat curriculum.txt" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 18,
            }}
          >
            {WEEKS.map((w, i) => (
              <WeekCard key={w.week} {...w} index={i} />
            ))}
          </div>
        </section>

        {/* 3. FEATURES */}
        <section
          style={{
            position: "relative",
            padding: "100px 20px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <TermHeading cmd="ls -la /features/" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 18,
            }}
          >
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </section>

        {/* 4. PATHWAY */}
        <section
          style={{
            position: "relative",
            padding: "100px 20px",
            maxWidth: 1200,
            margin: "0 auto",
          }}
        >
          <TermHeading cmd="cat /etc/pathway" />
          <div
            style={{
              position: "relative",
              display: "flex",
              gap: 20,
              flexWrap: "wrap",
              alignItems: "stretch",
            }}
          >
            {/* animated connector line */}
            <svg
              aria-hidden
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                top: "50%",
                width: "100%",
                height: 2,
                pointerEvents: "none",
                zIndex: 0,
              }}
              preserveAspectRatio="none"
            >
              <line
                x1="0"
                y1="1"
                x2="100%"
                y2="1"
                stroke={CYAN}
                strokeWidth="2"
                strokeDasharray="8 8"
                style={{ animation: "cxDashFlow 1s linear infinite" }}
                opacity="0.4"
              />
            </svg>
            {PATHWAY.map((t, i) => (
              <div key={t.name} style={{ position: "relative", zIndex: 1, display: "flex", flex: 1, minWidth: 240 }}>
                <PathwayTier {...t} index={i} />
              </div>
            ))}
          </div>
        </section>

        {/* 5. PRICING */}
        <section
          style={{
            position: "relative",
            padding: "100px 20px",
            maxWidth: 640,
            margin: "0 auto",
          }}
        >
          <TermHeading cmd="cat pricing.yaml" />
          <div
            style={{
              background: CARD,
              borderRadius: 18,
              border: `1px solid ${CYAN}33`,
              overflow: "hidden",
              boxShadow: `0 0 40px ${CYAN}15`,
            }}
          >
            <TerminalHeader title="enrolment — cyber_explorers" />
            <div style={{ padding: 32, textAlign: "center" }}>
              <h3 style={{ fontFamily: HEAD, fontSize: 22, fontWeight: 800, color: "#f1f5f9", margin: "0 0 4px" }}>
                Cyber Explorers Academy
              </h3>
              <div
                style={{
                  fontFamily: HEAD,
                  fontSize: 48,
                  fontWeight: 900,
                  background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  margin: "8px 0 4px",
                }}
              >
                £149
              </div>
              <div style={{ color: MUTED, fontSize: 14, marginBottom: 20 }}>
                Lifetime access — 12 weeks of content, new content added regularly
              </div>
              <ul
                style={{
                  listStyle: "none",
                  margin: "0 0 24px",
                  padding: 0,
                  textAlign: "left",
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {[
                  "12 weekly missions with interactive exercises",
                  "Capture The Flag challenges & real lab environments",
                  "Industry tools: Wireshark, Nmap, Burp Suite basics",
                  "Personal cybersecurity portfolio you can show off",
                  "CyberFirst-aligned certificate on completion",
                ].map((item) => (
                  <li
                    key={item}
                    style={{ fontFamily: BODY, color: "rgba(255, 233, 200, 0.85)", fontSize: 15, paddingLeft: 24, position: "relative" }}
                  >
                    <span style={{ position: "absolute", left: 0, color: EMERALD, fontFamily: MONO }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/cyberexplorers/week1"
                style={{
                  display: "inline-block",
                  background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
                  color: "#0a0e1a",
                  fontWeight: 800,
                  padding: "14px 32px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontFamily: HEAD,
                  letterSpacing: 0.8,
                  boxShadow: `0 0 22px ${CYAN}55`,
                }}
              >
                Get Started →
              </Link>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  color: EMERALD,
                  marginTop: 14,
                  letterSpacing: 0.5,
                }}
              >
                # Week 1 is FREE — no card required
              </div>
            </div>
          </div>
        </section>

        {/* 6. CTA */}
        <section
          style={{
            position: "relative",
            padding: "100px 20px 60px",
            textAlign: "center",
            maxWidth: 720,
            margin: "0 auto",
          }}
        >
          <div
            style={{
              fontFamily: MONO,
              fontSize: 15,
              color: EMERALD,
              marginBottom: 16,
              letterSpacing: 0.5,
            }}
          >
            <span style={{ color: MUTED }}>$ </span>
            sudo enroll --course cyber_explorers --now
          </div>
          <h2
            style={{
              fontFamily: HEAD,
              fontSize: "clamp(32px, 5vw, 48px)",
              fontWeight: 900,
              margin: "0 0 22px",
              background: `linear-gradient(135deg, ${CYAN}, ${PURPLE}, ${EMERALD})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: 0.5,
            }}
          >
            Ready to hack your future?
          </h2>
          <Link
            href="/cyberexplorers/week1"
            style={{
              display: "inline-block",
              background: `linear-gradient(135deg, ${CYAN}, ${PURPLE})`,
              color: "#0a0e1a",
              fontWeight: 800,
              padding: "16px 36px",
              borderRadius: 12,
              textDecoration: "none",
              fontFamily: HEAD,
              fontSize: 17,
              letterSpacing: 0.8,
              boxShadow: `0 0 26px ${CYAN}66`,
            }}
          >
            Start Your Free Trial →
          </Link>
        </section>

        {/* 7. FOOTER */}
        <footer
          style={{
            borderTop: `1px solid ${CYAN}22`,
            padding: "40px 20px",
            textAlign: "center",
            fontFamily: MONO,
            fontSize: 13,
            color: MUTED,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 18,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <Link href="/" style={{ color: MUTED, textDecoration: "none" }}>
              Home
            </Link>
            <span style={{ color: "#334155" }}>·</span>
            <Link href="/cyberheroes" style={{ color: MUTED, textDecoration: "none" }}>
              Cyber Heroes (6–9)
            </Link>
            <span style={{ color: "#334155" }}>·</span>
            <Link href="/cyberstart" style={{ color: MUTED, textDecoration: "none" }}>
              CyberStart (15–17)
            </Link>
            <span style={{ color: "#334155" }}>·</span>
            <Link href="/cyberstart-pro" style={{ color: MUTED, textDecoration: "none" }}>
              CyberStart Pro (18+)
            </Link>
          </div>
          <div style={{ color: "#64748b" }}>© 2026 AlgorithmX</div>
        </footer>
      </main>
    </SmoothScroll>
  );
}
