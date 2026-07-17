"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { FadeUp } from "./utilities";

/**
 * "Your AlgorithmX Journey" — a 5-step constellation/orbital path from
 * "Choose a Subject" to "Earn Recognition". Each step is a glowing node
 * (number + icon) threaded by a wavy gradient light-path, with a short
 * status pill underneath. Step 5 is the DESTINATION (orbital rings).
 *
 * Keeps the section id="how" so the nav anchor still resolves.
 */

type Step = {
  n: string;
  label: string;
  title: string;
  desc: string;
  pill: string;
  color: string;
  icon: IconName;
  pillIcon: IconName;
  destination?: boolean;
  /* vertical stagger (px) of the node within the path band */
  offset: number;
};

const STEPS: Step[] = [
  { n: "01", label: "STEP 01", title: "Choose a Subject", desc: "Explore six technology pathways and find the world that inspires you.", pill: "6 technology streams", color: "#1bc6ff", icon: "compass", pillIcon: "person", offset: 22 },
  { n: "02", label: "STEP 02", title: "Pick Your Level", desc: "Find the right starting point based on age, confidence and experience.", pill: "Beginner to advanced", color: "#3ef07a", icon: "bars", pillIcon: "bars", offset: 6 },
  { n: "03", label: "STEP 03", title: "Join the Academy", desc: "Create your profile, choose your course and receive instant access.", pill: "Simple one-time enrolment", color: "#ff7a3d", icon: "idcard", pillIcon: "ticket", offset: 46 },
  { n: "04", label: "STEP 04", title: "Learn & Build", desc: "Complete interactive lessons and create real technology projects.", pill: "Project-based learning", color: "#ffc24a", icon: "code", pillIcon: "cube", offset: 12 },
  { n: "05", label: "STEP 05", title: "Earn Recognition", desc: "Build your portfolio and work towards recognised qualifications.", pill: "ASDAN & portfolio pathways", color: "#a96bff", icon: "shieldStar", pillIcon: "medal", destination: true, offset: 0 },
];

/* ── inline thin-stroke icons ─────────────────────────────────────── */
type IconName =
  | "compass" | "bars" | "idcard" | "code" | "shieldStar"
  | "person" | "ticket" | "cube" | "medal";

function Icon({ name, size = 24, color = "currentColor", sw = 1.7 }: { name: IconName; size?: number; color?: string; sw?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: color, strokeWidth: sw, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (name) {
    case "compass":
      return (<svg {...common}><circle cx="12" cy="12" r="9" /><path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" /></svg>);
    case "bars":
      return (<svg {...common}><path d="M5 19V11M12 19V5M19 19v-6" /></svg>);
    case "idcard":
      return (<svg {...common}><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="8.5" cy="11" r="2" /><path d="M5.5 16c.5-1.6 1.8-2.4 3-2.4s2.5.8 3 2.4M14 9.5h4M14 13h4M14 16h2.5" /></svg>);
    case "code":
      return (<svg {...common}><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" /></svg>);
    case "shieldStar":
      return (<svg {...common}><path d="M12 3l7 3v5c0 4.4-3 7.3-7 8.5C8 18.3 5 15.4 5 11V6l7-3z" /><path d="M12 8.5l1.1 2.2 2.4.3-1.8 1.7.5 2.4L12 13.9l-2.2 1.2.5-2.4-1.8-1.7 2.4-.3L12 8.5z" /></svg>);
    case "person":
      return (<svg {...common}><circle cx="12" cy="8" r="3.2" /><path d="M5.5 19c.6-3.3 3.3-5 6.5-5s5.9 1.7 6.5 5" /></svg>);
    case "ticket":
      return (<svg {...common}><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H6a2 2 0 0 1-2-2 2 2 0 0 0 0-4z" /><path d="M14 6v12" strokeDasharray="2 2" /></svg>);
    case "cube":
      return (<svg {...common}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z" /><path d="M12 3v18M4 7.5l8 4.5 8-4.5" /></svg>);
    case "medal":
      return (<svg {...common}><circle cx="12" cy="14" r="5" /><path d="M9 9.5L7 3M15 9.5L17 3M12 12l.8 1.6 1.7.2-1.2 1.2.3 1.7-1.6-.9-1.6.9.3-1.7-1.2-1.2 1.7-.2L12 12z" /></svg>);
  }
}

const ACCENT_GRAD = "linear-gradient(90deg,#1bc6ff,#3ef07a,#ff7a3d,#ffc24a,#a96bff)";
/* x positions of the 5 nodes as % of the path band (flex centres at 10..90) */
const XS = [10, 30, 50, 70, 90];
const BAND_H = 150;
const NODE_R = 38;

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  /* SVG wavy path through the node centres (viewBox 1000 x BAND_H,
   * preserveAspectRatio none so x maps to width-% and aligns with the
   * flex node columns at any width). */
  const pts = STEPS.map((s, i) => ({ x: (XS[i] / 100) * 1000, y: s.offset + NODE_R }));
  let d = `M 0 ${pts[0].y + 6}`;
  d += ` C 40 ${pts[0].y} 60 ${pts[0].y} ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i];
    const mx = (a.x + b.x) / 2;
    d += ` C ${mx} ${a.y} ${mx} ${b.y} ${b.x} ${b.y}`;
  }
  d += ` C 960 ${pts[4].y} 980 ${pts[4].y - 8} 1000 ${pts[4].y - 14}`;

  return (
    <section
      id="how"
      style={{ position: "relative", padding: "calc(var(--lv2-rail) * 2.2) var(--lv2-rail)", color: "var(--lv2-paper)", overflow: "hidden" }}
    >
      <div
        aria-hidden
        style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(0,229,255,0.32), transparent)", pointerEvents: "none" }}
      />

      {/* Header */}
      <div style={{ maxWidth: 720, margin: "0 auto 8px", textAlign: "center" }}>
        <FadeUp>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "7px 16px", borderRadius: 999, border: "1px solid rgba(232,237,255,0.14)", background: "rgba(13,15,24,0.5)", fontFamily: "var(--lv2-font-mono)", fontSize: 11.5, fontWeight: 600, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(232,237,255,0.72)" }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: "var(--lv2-cyan)", boxShadow: "0 0 8px var(--lv2-cyan)" }} />
            Your AlgorithmX Journey
            <span style={{ width: 5, height: 5, borderRadius: 999, border: "1px solid rgba(232,237,255,0.4)" }} />
          </span>
        </FadeUp>
        <FadeUp delay={0.05}>
          <h2 style={{ fontFamily: "var(--lv2-font-display)", fontSize: "clamp(30px, 4.4vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.05, margin: "18px 0 0" }}>
            From first click to{" "}
            <span style={{ background: "linear-gradient(90deg,#36d6ff,#a98bff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>real achievement</span>
          </h2>
        </FadeUp>
        <FadeUp delay={0.1}>
          <p style={{ color: "rgba(232,237,255,0.6)", fontSize: 17, lineHeight: 1.6, margin: "16px auto 0", maxWidth: 520 }}>
            Choose your path, build practical skills and progress towards recognised outcomes.
          </p>
        </FadeUp>
      </div>

      {/* Journey stage */}
      <div ref={ref} className="jrn-stage" style={{ position: "relative", maxWidth: 1240, margin: "44px auto 0" }}>
        {/* central AX watermark + guide rings */}
        <div aria-hidden style={{ position: "absolute", left: "50%", top: 8, transform: "translateX(-50%)", width: 300, height: 300, pointerEvents: "none", zIndex: 0 }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", border: "1px solid rgba(124,140,255,0.10)" }} />
          <div style={{ position: "absolute", inset: 38, borderRadius: "50%", border: "1px solid rgba(124,140,255,0.08)" }} />
          <div style={{ position: "absolute", inset: 76, borderRadius: "50%", border: "1px solid rgba(124,140,255,0.06)" }} />
          <span style={{ position: "absolute", left: "50%", top: "44%", transform: "translate(-50%,-50%)", fontFamily: "var(--lv2-font-display)", fontSize: 40, fontWeight: 800, letterSpacing: "0.05em", color: "rgba(150,170,255,0.12)" }}>AX</span>
        </div>

        {/* wavy connecting path */}
        <svg className="jrn-path" viewBox={`0 0 1000 ${BAND_H}`} preserveAspectRatio="none" aria-hidden
          style={{ position: "absolute", top: 0, left: 0, width: "100%", height: BAND_H, zIndex: 1, overflow: "visible" }}>
          <defs>
            <linearGradient id="jrnGrad" x1="0" y1="0" x2="1000" y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#1bc6ff" /><stop offset="27%" stopColor="#3ef07a" /><stop offset="50%" stopColor="#ff7a3d" /><stop offset="73%" stopColor="#ffc24a" /><stop offset="100%" stopColor="#a96bff" />
            </linearGradient>
          </defs>
          {/* soft glow underlay */}
          <path d={d} fill="none" stroke="url(#jrnGrad)" strokeWidth={6} opacity={0.32} style={{ filter: "blur(5px)" }} pathLength={1}
            strokeDasharray={1} strokeDashoffset={inView ? 0 : 1} />
          {/* crisp line, draws in on view */}
          <path d={d} fill="none" stroke="url(#jrnGrad)" strokeWidth={2} strokeLinecap="round" pathLength={1}
            strokeDasharray={1} strokeDashoffset={inView ? 0 : 1}
            style={{ transition: "stroke-dashoffset 1.8s cubic-bezier(0.16,1,0.3,1)" }} />
          {/* bead dots along the line */}
          <path d={d} fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" pathLength={1}
            strokeDasharray="0.004 0.055" opacity={inView ? 0.55 : 0}
            style={{ transition: "opacity 1.2s ease 0.6s" }} />
        </svg>

        {/* nodes + text columns */}
        <div className="jrn-row" style={{ position: "relative", zIndex: 2, display: "flex", alignItems: "flex-start" }}>
          {STEPS.map((s, i) => (
            <motion.div key={s.n}
              initial={{ opacity: 0, y: 18 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
              className="jrn-col"
              style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
            >
              {/* node zone — fixed height so the TEXT below aligns across all
               *  columns while the node itself sits at its staggered offset */}
              <div className="jrn-nodezone" style={{ position: "relative", width: "100%", height: BAND_H }}>
                {/* DESTINATION badge */}
                {s.destination && (
                  <span style={{ position: "absolute", left: "50%", top: s.offset - 36, transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 11px", borderRadius: 999, border: `1px solid ${s.color}66`, background: "rgba(13,15,24,0.6)", fontFamily: "var(--lv2-font-mono)", fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", color: s.color, whiteSpace: "nowrap" }}>
                    <span style={{ color: s.color }}>★</span> DESTINATION
                  </span>
                )}
                {/* node */}
                <div style={{ position: "absolute", left: "50%", top: s.offset, transform: "translateX(-50%)", width: NODE_R * 2, height: NODE_R * 2 }}>
                  {s.destination && (
                    <>
                      <span aria-hidden className="jrn-ring" style={{ position: "absolute", inset: -16, borderRadius: "50%", border: `1.5px solid ${s.color}55`, boxShadow: `0 0 22px ${s.color}44` }} />
                      <span aria-hidden className="jrn-ring2" style={{ position: "absolute", inset: -28, borderRadius: "50%", border: `1px solid ${s.color}33` }} />
                    </>
                  )}
                  <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "radial-gradient(circle at 50% 35%, rgba(20,24,40,0.95), rgba(8,10,18,0.98))", border: `2px solid ${s.color}`, boxShadow: `0 0 26px ${s.color}66, inset 0 0 18px ${s.color}22`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2 }}>
                    <span style={{ fontFamily: "var(--lv2-font-mono)", fontSize: 12, fontWeight: 700, color: s.color, lineHeight: 1, marginTop: -2 }}>{s.n}</span>
                    <Icon name={s.icon} size={24} color={s.color} />
                  </div>
                </div>
              </div>

              {/* text — dark halos + an opaque pill underlay so the copy
               *  stays crisp over the global typed-code backdrop (which
               *  occupies exactly the step-01/02 columns) */}
              <div>
                <div style={{ fontFamily: "var(--lv2-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.24em", color: s.color, marginBottom: 8, textShadow: "0 1px 10px rgba(4,5,13,0.95)" }}>{s.label}</div>
                <h3 style={{ fontFamily: "var(--lv2-font-display)", fontSize: 20, fontWeight: 700, letterSpacing: "-0.01em", margin: 0, textShadow: "0 2px 14px rgba(4,5,13,0.95), 0 0 5px rgba(4,5,13,0.8)" }}>{s.title}</h3>
                <p style={{ color: "rgba(232,237,255,0.6)", fontSize: 14, lineHeight: 1.55, margin: "10px auto 0", maxWidth: 210, textShadow: "0 2px 12px rgba(4,5,13,0.95), 0 0 4px rgba(4,5,13,0.85)" }}>{s.desc}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, marginTop: 16, padding: "7px 13px", borderRadius: 999, border: `1px solid ${s.color}3d`, background: `linear-gradient(0deg, ${s.color}14, ${s.color}14), rgba(8,10,18,0.85)`, fontSize: 12.5, fontWeight: 600, color: s.color, whiteSpace: "nowrap" }}>
                  <Icon name={s.pillIcon} size={14} color={s.color} sw={1.9} />
                  {s.pill}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* footer note pill */}
        <FadeUp delay={0.2}>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 40 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 14, padding: "16px 26px", borderRadius: 16, border: "1px solid rgba(124,140,255,0.18)", background: "rgba(13,15,24,0.5)", maxWidth: 560 }}>
              <Icon name="shieldStar" size={22} color="#a96bff" />
              <span style={{ fontSize: 14.5, lineHeight: 1.5, color: "rgba(232,237,255,0.72)", textAlign: "left" }}>
                Every step unlocks new skills, badges and real-world confidence.{" "}
                <span style={{ display: "block", fontWeight: 700, background: "linear-gradient(90deg,#36d6ff,#a98bff)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>Your journey. Your pace. Your future.</span>
              </span>
            </span>
          </div>
        </FadeUp>
      </div>

      <style jsx>{`
        .jrn-ring { animation: jrnSpin 18s linear infinite; }
        .jrn-ring2 { animation: jrnSpin 26s linear infinite reverse; }
        @keyframes jrnSpin { to { transform: rotate(360deg); } }
        @media (max-width: 820px) {
          .jrn-path { display: none; }
          .jrn-row { flex-direction: column; gap: 34px; }
          .jrn-col { align-items: center; }
        }
      `}</style>
    </section>
  );
}
