"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";

// Live R3F backdrop — lazy-loaded so SSR doesn't try to execute WebGL.
const CyberHeroesBackdrop = dynamic(
  () => import("@/app/components/CyberHeroesBackdrop"),
  { ssr: false },
);

/* ─── CONSTANTS ─── */
const GRAD = "linear-gradient(135deg, #7c5cff, #00e5ff)";
// Primary CTA gradient — cosmic gold→coral→pink. Was orange/amber
// (#ff7a59 → #ffd158) which read as a warm-Pixar tonal break in an
// otherwise cosmic-cyber page; this gradient pops harder AND stays
// in palette.
const BTN_GRAD = "linear-gradient(135deg, #ffd158, #ff7a59, #ff5fb3)";
const BTN_GLOW = "0 0 24px rgba(255, 95, 179, 0.45)";
const BTN_GLOW_HOVER = "0 0 36px rgba(255, 95, 179, 0.65), 0 0 60px rgba(255, 122, 89, 0.4)";
const BLUE_GLOW = "0 0 20px rgba(124,92,255,0.4)";
const ACCENT_TEXT: CSSProperties = {
  background: "linear-gradient(135deg, #7c5cff, #00e5ff)",
  backgroundClip: "text",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  textShadow: "0 0 30px rgba(124,92,255,0.3)",
  whiteSpace: "nowrap",
};

/* ─── CONSTELLATION MESH ───
   Replaces the old rigid circuit-board grid with an organic
   constellation-network — random points connected by thin lines for
   nearby pairs. Multi-coloured cosmic palette. */
function ConstellationMesh() {
  // Pre-computed deterministic node positions so the mesh is stable
  // across renders (no jarring re-shuffles on resize).
  const nodes = [
    { x: 6,  y: 8,   c: "#7c5cff" }, { x: 22, y: 14,  c: "#a06aff" }, { x: 38, y: 6,  c: "#ff5fb3" },
    { x: 54, y: 12,  c: "#7df0ff" }, { x: 72, y: 8,   c: "#ffd158" }, { x: 88, y: 14, c: "#7c5cff" },
    { x: 12, y: 28,  c: "#ff5fb3" }, { x: 30, y: 32,  c: "#7df0ff" }, { x: 46, y: 22, c: "#7c5cff" },
    { x: 62, y: 30,  c: "#ffd158" }, { x: 80, y: 26,  c: "#ff5fb3" }, { x: 95, y: 32, c: "#a06aff" },
    { x: 4,  y: 50,  c: "#7df0ff" }, { x: 24, y: 48,  c: "#7c5cff" }, { x: 42, y: 54, c: "#ffd158" },
    { x: 60, y: 46,  c: "#ff5fb3" }, { x: 76, y: 52,  c: "#a06aff" }, { x: 92, y: 48, c: "#7df0ff" },
    { x: 14, y: 70,  c: "#ffd158" }, { x: 32, y: 76,  c: "#ff5fb3" }, { x: 50, y: 68, c: "#7c5cff" },
    { x: 68, y: 74,  c: "#7df0ff" }, { x: 84, y: 70,  c: "#a06aff" },
    { x: 8,  y: 90,  c: "#7c5cff" }, { x: 28, y: 86,  c: "#ffd158" }, { x: 46, y: 92, c: "#ff5fb3" },
    { x: 64, y: 88,  c: "#a06aff" }, { x: 82, y: 94,  c: "#7df0ff" },
  ];

  // Build edges: connect each node to its 2-3 nearest neighbours.
  type Edge = { a: number; b: number; len: number };
  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length; i++) {
    const dists = nodes
      .map((_, j) => ({ j, d: i === j ? Infinity : Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) }))
      .sort((a, b) => a.d - b.d);
    // Connect to 2 nearest if within threshold.
    for (let k = 0; k < 2; k++) {
      const { j, d } = dists[k];
      if (d > 26) break;
      const a = Math.min(i, j);
      const b = Math.max(i, j);
      if (!edges.some((e) => e.a === a && e.b === b)) {
        edges.push({ a, b, len: d });
      }
    }
  }

  return (
    <svg
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        filter: "drop-shadow(0 0 6px rgba(124, 92, 255, 0.35))",
      }}
      preserveAspectRatio="xMidYMid slice"
      viewBox="0 0 100 100"
    >
      <defs>
        <linearGradient id="constEdge" x1="0" x2="1">
          <stop offset="0%" stopColor="#7c5cff" stopOpacity="0" />
          <stop offset="50%" stopColor="#a06aff" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#7df0ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {edges.map((e, i) => {
        const a = nodes[e.a];
        const b = nodes[e.b];
        return (
          <line
            key={`edge-${i}`}
            x1={a.x}
            y1={a.y}
            x2={b.x}
            y2={b.y}
            stroke="url(#constEdge)"
            strokeWidth={0.18}
            style={{
              animation: `constTwinkle ${4 + (i % 5)}s ease-in-out ${i * 0.13}s infinite`,
            }}
          />
        );
      })}
      {nodes.map((n, i) => (
        <g key={`node-${i}`}>
          <circle cx={n.x} cy={n.y} r={1.2} fill={n.c} opacity={0.22} />
          <circle
            cx={n.x}
            cy={n.y}
            r={0.55}
            fill={n.c}
            style={{
              filter: `drop-shadow(0 0 2px ${n.c})`,
              animation: `constTwinkle ${3 + (i % 4)}s ease-in-out ${i * 0.2}s infinite`,
            }}
          />
        </g>
      ))}
    </svg>
  );
}

/* ─── ANIMATED TECH BACKGROUND ─── */
function TechBackground() {
  // Mouse parallax — sets --mx / --my CSS custom properties on the root.
  // Inner layers translate by --mx * (their depth multiplier) so the
  // closer layers move more, creating a parallax depth read.
  const rootRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let raf = 0;
    let mx = 0, my = 0;
    const onMove = (e: PointerEvent) => {
      mx = (e.clientX / window.innerWidth - 0.5) * 2;
      my = (e.clientY / window.innerHeight - 0.5) * 2;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          root.style.setProperty("--mx", String(mx));
          root.style.setProperty("--my", String(my));
        });
      }
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden", ["--mx" as string]: 0, ["--my" as string]: 0 } as CSSProperties}>
      <style>{`
        @keyframes dashFlow { from { stroke-dashoffset: 0; } to { stroke-dashoffset: -40; } }
        @keyframes dataStream { from { left: -300px; } to { left: 100vw; } }
        @keyframes binaryFall { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
        @keyframes cyberFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-30px) rotate(8deg); } }
        @keyframes codeRainCH { from { transform: translateY(-100%); } to { transform: translateY(100vh); } }
        @keyframes gridPulse { 0%,100% { opacity: 0.06; } 50% { opacity: 0.12; } }
        @keyframes scanLine { from { transform: translateY(-100vh); } to { transform: translateY(100vh); } }
        @keyframes sparkle { 0%,100% { opacity: 0; } 50% { opacity: 0.6; } }
        @keyframes hexPulse { 0%,100% { fill: rgba(124,92,255,0); } 50% { fill: rgba(124,92,255,0.08); } }
        @keyframes constTwinkle { 0%,100% { opacity: 0.35; } 50% { opacity: 1; } }
      `}</style>

      {/* Layer 0: Live R3F cosmic depth — sparse 3D atmosphere with
          nebulae, starfield, aurora ribbons, floating wireframe shapes,
          mouse-parallax camera pan. Sits at the back of every layer. */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <CyberHeroesBackdrop />
      </div>

      {/* Layer 5: Animated grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(124,92,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,92,255,0.08) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        animation: "gridPulse 8s ease-in-out infinite",
        transform: "translate3d(calc(var(--mx) * 4px), calc(var(--my) * 4px), 0)",
      }} />

      {/* Layer 1: Constellation mesh — replaces the old rigid circuit
          grid with an organic node-network in cosmic palette. */}
      <div style={{ position: "absolute", inset: 0, transform: "translate3d(calc(var(--mx) * 8px), calc(var(--my) * 8px), 0)" }}>
        <ConstellationMesh />
      </div>

      {/* Layer 2: Floating cyber icons */}
      {[
        { icon: "🔒", left: "4%", top: "8%", size: 40, dur: 10 },
        { icon: "🛡️", left: "88%", top: "18%", size: 48, dur: 9 },
        { icon: "🔑", left: "18%", top: "42%", size: 36, dur: 13 },
        { icon: "💻", left: "72%", top: "52%", size: 44, dur: 11 },
        { icon: "🎮", left: "38%", top: "72%", size: 38, dur: 12 },
        { icon: "📱", left: "58%", top: "10%", size: 34, dur: 14 },
        { icon: "⚡", left: "92%", top: "65%", size: 42, dur: 8 },
        { icon: "🌐", left: "8%", top: "78%", size: 50, dur: 11 },
        { icon: "🔐", left: "48%", top: "32%", size: 32, dur: 15 },
        { icon: "👾", left: "28%", top: "88%", size: 40, dur: 10 },
        { icon: "🕵️", left: "82%", top: "38%", size: 36, dur: 12 },
        { icon: "🎯", left: "15%", top: "22%", size: 30, dur: 16 },
        { icon: "🚀", left: "65%", top: "82%", size: 44, dur: 9 },
        { icon: "💡", left: "42%", top: "55%", size: 38, dur: 13 },
        { icon: "🔍", left: "78%", top: "92%", size: 34, dur: 11 },
      ].map((ic, i) => (
        <div key={`cyber-${i}`} style={{
          position: "absolute", left: ic.left, top: ic.top, fontSize: ic.size, opacity: 0.15,
          animation: `cyberFloat ${ic.dur}s ease-in-out infinite`,
          animationDelay: `${i * -1.2}s`,
        }}>{ic.icon}</div>
      ))}

      {/* Layer 3: Glowing orbs — diversified palette + mouse-parallax
          drift (closer-feeling orbs move more). */}
      <div style={{ position: "absolute", inset: 0, transform: "translate3d(calc(var(--mx) * -16px), calc(var(--my) * -10px), 0)" }}>
        {[
          { left: "5%", top: "10%", size: 400, color: "rgba(124,92,255,0.14)", delay: 0 },
          { left: "65%", top: "5%", size: 350, color: "rgba(0,229,255,0.12)", delay: 3 },
          { left: "45%", top: "45%", size: 500, color: "rgba(255,95,179,0.10)", delay: 6 },
          { left: "80%", top: "55%", size: 380, color: "rgba(255,209,88,0.10)", delay: 2 },
          { left: "15%", top: "70%", size: 450, color: "rgba(124,92,255,0.10)", delay: 5 },
          { left: "55%", top: "80%", size: 300, color: "rgba(255,122,89,0.10)", delay: 1 },
        ].map((orb, i) => (
          <motion.div key={`orb-${i}`}
            animate={{ opacity: [0.06, 0.18, 0.06], x: [-25, 25, -25] }}
            transition={{ duration: 10 + i * 2, repeat: Infinity, ease: "easeInOut", delay: orb.delay }}
            style={{
              position: "absolute", left: orb.left, top: orb.top,
              width: orb.size, height: orb.size, borderRadius: "50%",
              background: `radial-gradient(circle, ${orb.color}, transparent 70%)`,
              filter: "blur(60px)",
            }}
          />
        ))}
      </div>

      {/* Layer 6: Sparkle particles — full cosmic palette (violet,
          cyan, pink, gold) + mouse-parallax. */}
      <div style={{ position: "absolute", inset: 0, transform: "translate3d(calc(var(--mx) * 18px), calc(var(--my) * 14px), 0)" }}>
        {Array.from({ length: 26 }, (_, i) => {
          const palette = [
            "rgba(124,92,255,0.55)",
            "rgba(0,229,255,0.55)",
            "rgba(255,95,179,0.50)",
            "rgba(255,209,88,0.50)",
          ];
          return (
            <div key={`spark-${i}`} style={{
              position: "absolute",
              left: `${3 + ((i * 37 + 13) % 94)}%`,
              top: `${2 + ((i * 53 + 7) % 94)}%`,
              width: i % 3 === 0 ? 4 : i % 2 === 0 ? 3 : 2,
              height: i % 3 === 0 ? 4 : i % 2 === 0 ? 3 : 2,
              borderRadius: "50%",
              background: palette[i % palette.length],
              boxShadow: `0 0 6px ${palette[i % palette.length]}`,
              animation: `sparkle ${2 + (i % 3)}s ease-in-out infinite`,
              animationDelay: `${i * 0.35}s`,
            }} />
          );
        })}
      </div>

      {/* Layer 7: Scanning line */}
      <div style={{
        position: "absolute", left: 0, width: "100%", height: 2,
        background: "linear-gradient(to right, transparent, rgba(124,92,255,0.25), transparent)",
        boxShadow: "0 0 10px rgba(124,92,255,0.3), 0 0 30px rgba(124,92,255,0.15)",
        animation: "scanLine 8s linear infinite",
      }} />

      {/* Layer 9: Data stream lines */}
      {[
        { top: "15%", dur: 3.5, delay: 0, w: 200 },
        { top: "35%", dur: 4, delay: 2.5, w: 250 },
        { top: "55%", dur: 3, delay: 5, w: 180 },
        { top: "72%", dur: 4.5, delay: 1, w: 300 },
        { top: "88%", dur: 3.5, delay: 4, w: 220 },
      ].map((ds, i) => (
        <div key={`ds-${i}`} style={{
          position: "absolute", top: ds.top, height: 1, width: ds.w,
          background: "linear-gradient(to right, transparent, rgba(124,92,255,0.4), transparent)",
          animation: `dataStream ${ds.dur}s linear infinite`,
          animationDelay: `${ds.delay}s`,
        }} />
      ))}

      {/* Layer 10: Binary rain — REMOVED (was redundant with code rain
          + hex grid; trimmed to ease GPU load and reduce visual noise) */}
      {false && [10, 30, 70, 90].map((left, i) => (
        <div key={`bin-${i}`} style={{
          position: "absolute", left: `${left}%`, top: 0, width: 14,
          fontFamily: "monospace", fontSize: 16, fontWeight: 700,
          color: "rgba(124,92,255,0.1)", lineHeight: "22px",
          whiteSpace: "pre-wrap", wordBreak: "break-all",
          animation: `binaryFall ${15 + i * 3}s linear infinite`,
          animationDelay: `${i * -4}s`,
        }}>
          {"10110100011101001011010001110100101101000111010010110100011101001011"}
        </div>
      ))}
    </div>
  );
}

/* ─── COUNT-UP SPAN (plain, for composition) ─── */
function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [val, setVal] = useState(0);
  const counted = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true;
          const start = performance.now();
          const dur = 1600;
          const tick = (now: number) => {
            const t = Math.min((now - start) / dur, 1);
            setVal(Math.round((1 - Math.pow(1 - t, 3)) * to));
            if (t < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);
  return (
    <span ref={ref}>
      {val}
      {suffix}
    </span>
  );
}

/* ─── COUNTER ANIMATION ─── */
function AnimCounter({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [val, setVal] = useState(0);
  const counted = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !counted.current) {
        counted.current = true;
        let frame: number;
        const start = performance.now();
        const dur = 1600;
        const tick = (now: number) => {
          const t = Math.min((now - start) / dur, 1);
          setVal(Math.round((1 - Math.pow(1 - t, 3)) * to));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        observer.disconnect();
      }
    }, { threshold: 0.5 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to]);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 px-4 py-5 rounded-2xl flex-1 min-w-[140px]"
      style={{ background: "linear-gradient(135deg, rgba(124,92,255,0.25), rgba(0,229,255,0.25), rgba(124,92,255,0.25))", backdropFilter: "blur(12px)", border: "1px solid rgba(124,92,255,0.3)", boxShadow: "0 0 20px rgba(124,92,255,0.2)" }}>
      <span className="text-3xl sm:text-4xl font-black text-white">{val}{suffix}</span>
      <span className="text-xs sm:text-sm font-bold text-gray-400">{label}</span>
    </div>
  );
}

/* ─── COURSE CARD DATA ─── */
const COURSES = [
  { emoji: "🛡️", title: "Cyber Heroes Academy", ages: "6–9", weeks: 20, time: "45 min/week", accent: "#00e5ff", desc: "Fun animated adventures teaching password safety, online awareness, and digital citizenship.", featured: true },
  { emoji: "🔍", title: "Cyber Explorers", ages: "11–14", weeks: 14, time: "1 hr/week", accent: "#8b5cf6", desc: "Deeper dives into encryption, social engineering, safe browsing, and data privacy.", featured: false },
  { emoji: "💻", title: "CyberStart", ages: "15–17", weeks: 16, time: "1.5 hrs/week", accent: "#22c55e", desc: "Hands-on challenges covering networking, ethical hacking basics, and secure coding.", featured: false },
  { emoji: "🚀", title: "CyberStart Pro", ages: "18+", weeks: 20, time: "2 hrs/week", accent: "#ffd158", desc: "Industry-aligned curriculum preparing for certifications and real-world security roles.", featured: false },
];

/* ─── FEATURES DATA ─── */
const FEATURES = [
  { emoji: "🎮", title: "Interactive Adventures", desc: "Not just videos. Real games, puzzles, drag-and-drop challenges, and boss battles that keep kids engaged for the full lesson." },
  { emoji: "🏅", title: "Accreditation Aligned", desc: "Built around CyberFirst and ASDAN frameworks so every lesson counts towards recognised achievements." },
];

/* ─── STORY CARDS DATA ─── */
const STORY = [
  { src: "/characters/adam-layla-happy.png", alt: "Adam and Layla sitting happily", caption: "Meet Adam & Layla", sub: "Two enthusiastic gamers who love exploring the digital world. But danger lurks online..." },
  { src: "/characters/adam-layla-raccoon.png", alt: "The Hacker Raccoon appears", caption: "The Hacker Raccoon Strikes", sub: "A sneaky villain who preys on their vulnerabilities: weak passwords, risky clicks, and shared secrets." },
  { src: "/characters/adam-layla-hacked.png", alt: "Adam and Layla with hacked tablet", caption: "Can They Become Cyber Heroes?", sub: "20 weeks of missions to outsmart the Raccoon and earn their Cyber Hero certificate!" },
];

/* ─── WEEKS DATA ─── */
const WEEKS = [
  { w: 1, title: "Passwords: The Secret Code", sub: "Discover why passwords matter and learn how to create super strong ones" },
  { w: 6, title: "Gaming Safety: Defend Your Game Zone", sub: "Stay safe in Roblox, Minecraft, and Fortnite" },
  { w: 13, title: "Screen Time: Balance Your Power", sub: "Find the right balance between time online, breaks, sleep, and healthy habits" },
  { w: 19, title: "Protecting Family: Family Firewall", sub: "Become the family cyber expert" },
  { w: 20, title: "Graduation Day: The Final Mission", sub: "The ultimate challenge! Earn your Cyber Hero certificate" },
];

/* ─── SVG ICONS ─── */
const IconController = ({ size = 32, color = "#7c5cff" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/><line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>
    <rect x="2" y="6" width="20" height="12" rx="2"/>
  </svg>
);
const IconAward = ({ size = 32, color = "#ffd158" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
  </svg>
);
const IconFamily = ({ size = 32, color = "#ec4899" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

/* ─── FAQ ACCORDION ─── */
function FAQAccordion() {
  const [open, setOpen] = useState<number | null>(0);
  const items = [
    { q: "What age is this for?", a: "Cyber Heroes Academy is designed for children aged 6–9. Every lesson, character, and activity is crafted to be age-appropriate and engaging for this specific age group." },
    { q: "How long does it take?", a: "20 weeks, one 45-minute session per week. Children can go at their own pace — there's no pressure to keep to a schedule." },
    { q: "Is it safe? Can strangers contact my child?", a: "Yes, completely safe. Lessons are sandboxed — no chat, no public profile, no social feed. Your child plays through the missions on their own; nobody else can contact them through the course. We don't sell or share data, and we don't run third-party advertising trackers." },
    { q: "Can I see what my child is learning?", a: "Yes. The parent dashboard shows you which lessons they've completed, badges earned, time spent, and a snapshot of how they're progressing each week. You'll also receive a printable milestone certificate at the end of each module." },
    { q: "Is it accredited?", a: "Yes. Designed in alignment with CyberFirst and ASDAN accreditation frameworks from day one." },
    { q: "What devices does it work on?", a: "Modern browsers on desktop or laptop (Chrome, Safari, Firefox, Edge — last two major versions) and on tablets / phones (iOS 14+, Android 9+, iPad 6th gen+). For the boss-battle visuals we recommend a screen of at least 10 inches. Headphones are optional but help kids focus." },
    { q: "What if something breaks during a lesson?", a: "Email hello@algorithmx.co.uk with a quick description of what happened — we usually respond within one working day and push fixes within the week. If you're stuck mid-lesson, refresh the page; progress is saved automatically every few seconds." },
    { q: "Do we get lifetime access?", a: "Yes! Your one-time purchase of £99 gives you lifetime access with continuous updates — as new threats emerge, we update the content so your child's knowledge stays current." },
    { q: "I have more than one child — do I need to pay £99 each time?", a: "Yes, enrolment is per child at £99 — there's no sibling discount. Each child gets their own dedicated account, progress tracking, badges, and milestone certificates, so they can each move at their own pace. It's a one-time payment per child with lifetime access; no subscriptions, no renewals." },
    { q: "What if my child doesn't enjoy it?", a: "We offer a 30-day money-back guarantee, no questions asked. If your child isn't engaged within the first 30 days, email hello@algorithmx.co.uk and we'll process a full refund. Their progress is saved during the 30-day window — if you change your mind, you can re-enrol any time." },
  ];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            data-scroll
            data-scroll-delay={String(i * 0.05)}
            onClick={() => setOpen(isOpen ? null : i)}
            style={{
              borderBottom: "1px solid rgba(148,163,184,0.12)",
              cursor: "pointer",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 4px", fontSize: 16, fontWeight: 700, color: "#fff" }}>
              <span>{item.q}</span>
              <span style={{
                width: 30, height: 30, borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: isOpen ? "#00e5ff" : "rgba(0,229,255,0.1)",
                color: isOpen ? "#fff" : "#00e5ff",
                fontSize: 20, flexShrink: 0,
                transition: "all 0.3s",
              }}>
                {isOpen ? "−" : "+"}
              </span>
            </div>
            <div style={{
              maxHeight: isOpen ? 360 : 0,
              overflow: "hidden",
              transition: "max-height 0.45s cubic-bezier(0.16,1,0.3,1)",
            }}>
              <p style={{ padding: "0 4px 22px", color: "#94a3b8", fontSize: 15, lineHeight: 1.75 }}>
                {item.a}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const [scrolled, setScrolled] = useState(false);
  // Hero video starts muted (browser autoplay policy requires it).
  // Tap the speaker icon overlay to unmute.
  const [heroMuted, setHeroMuted] = useState(true);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Hero video — sound-by-default strategy:
  //
  // 1. Attempt to play UNMUTED on mount. Most browsers block this on
  //    a fresh visit, but allow it on return visits or when the site
  //    has Media autoplay permission. When it works, we get sound
  //    immediately with no user action.
  //
  // 2. If that's blocked, fall back to muted autoplay + a global
  //    listener that unmutes on the first scroll / click / key /
  //    touch anywhere on the page.
  //
  // Once unmuted, the manual mute toggle takes over for the session.
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;

    let unmuted = false;
    const finishUnmute = () => {
      if (unmuted) return;
      unmuted = true;
      setHeroMuted(false);
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
    };

    const onInteraction = () => {
      const vv = heroVideoRef.current;
      if (vv) {
        vv.muted = false;
        if (vv.paused) vv.play().catch(() => {});
      }
      finishUnmute();
    };

    // 1) aggressive immediate-unmute attempt
    v.muted = false;
    const p = v.play();
    if (p) {
      p.then(() => {
        finishUnmute();
      }).catch(() => {
        // Blocked — restore muted autoplay and rely on interaction.
        if (v) {
          v.muted = true;
          v.play().catch(() => {});
        }
      });
    }

    // 2) interaction fallback listeners (no-op once finishUnmute fires)
    window.addEventListener("pointerdown", onInteraction, { passive: true });
    window.addEventListener("keydown", onInteraction);
    window.addEventListener("scroll", onInteraction, { passive: true });
    window.addEventListener("touchstart", onInteraction, { passive: true });

    return () => {
      window.removeEventListener("pointerdown", onInteraction);
      window.removeEventListener("keydown", onInteraction);
      window.removeEventListener("scroll", onInteraction);
      window.removeEventListener("touchstart", onInteraction);
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll("[data-scroll]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.1 }
    );
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const delay = htmlEl.getAttribute("data-scroll-delay") || "0";
      htmlEl.style.opacity = "0";
      htmlEl.style.transform = "translateY(30px)";
      htmlEl.style.transition = `opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "#080a16", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=JetBrains+Mono:wght@400;500;700&family=Nunito:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Nunito', sans-serif; }
        h1, h2, h3, h4, .display-font { font-family: 'Space Grotesk', system-ui, sans-serif; letter-spacing: -0.015em; }
        .mono { font-family: 'JetBrains Mono', monospace; }
        html { scroll-behavior: smooth; }
        @keyframes chTyping { from { width: 0; } to { width: 100%; } }
        @keyframes chBlink { 0%,100% { border-color: transparent; } 50% { border-color: #ff7a59; } }
        .ch-typewriter {
          display: inline-block; overflow: hidden; white-space: nowrap;
          border-right: 2px solid #ff7a59;
          animation: chTyping 3s steps(35) 1s forwards, chBlink 0.8s step-end infinite;
          width: 0;
        }
        @keyframes chFadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .char-blob { transition: transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s cubic-bezier(0.16,1,0.3,1); }
        .char-blob:hover { transform: translateY(-6px) scale(1.05); }
        .char-blob-adam:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(0,229,255,0.45); }
        .char-blob-layla:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(52,211,153,0.45); }
        .char-blob-robo:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(255, 209, 88,0.45); }
        .char-blob-raccoon:hover { box-shadow: 0 20px 40px rgba(0,0,0,0.3), 0 0 30px rgba(239,68,68,0.45); }
        @keyframes chFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .char-float { animation: chFloat 3s ease-in-out infinite; }
        @keyframes chParticleA { 0%,100% { transform: translate(0,0); } 25% { transform: translate(40px,-60px); } 50% { transform: translate(-30px,-90px); } 75% { transform: translate(-50px,20px); } }
        @keyframes chParticleB { 0%,100% { transform: translate(0,0); } 30% { transform: translate(-50px,50px); } 60% { transform: translate(60px,-40px); } }
        @keyframes chParticleC { 0%,100% { transform: translate(0,0); } 33% { transform: translate(30px,70px); } 66% { transform: translate(-40px,30px); } }
      `}</style>

      <TechBackground />

      {/* ── Floating brand particles ── */}
      <div aria-hidden style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
        {[
          { left: "12%", top: "18%", color: "#00e5ff", size: 4, dur: 18, path: "A", delay: 0 },
          { left: "78%", top: "24%", color: "#34d399", size: 5, dur: 22, path: "B", delay: -3 },
          { left: "34%", top: "52%", color: "#ff7a59", size: 3, dur: 16, path: "C", delay: -6 },
          { left: "86%", top: "58%", color: "#ffd158", size: 4, dur: 20, path: "A", delay: -9 },
          { left: "8%", top: "72%", color: "#34d399", size: 5, dur: 24, path: "B", delay: -4 },
          { left: "52%", top: "18%", color: "#00e5ff", size: 3, dur: 19, path: "C", delay: -11 },
          { left: "68%", top: "82%", color: "#ff7a59", size: 4, dur: 21, path: "B", delay: -7 },
          { left: "22%", top: "38%", color: "#ffd158", size: 3, dur: 17, path: "A", delay: -2 },
          { left: "92%", top: "40%", color: "#00e5ff", size: 4, dur: 23, path: "C", delay: -13 },
          { left: "46%", top: "84%", color: "#34d399", size: 4, dur: 20, path: "A", delay: -5 },
        ].map((p, i) => (
          <div key={i} style={{
            position: "absolute", left: p.left, top: p.top,
            width: p.size, height: p.size, borderRadius: "50%",
            background: p.color, opacity: 0.12,
            boxShadow: `0 0 8px ${p.color}`,
            animation: `chParticle${p.path} ${p.dur}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            willChange: "transform",
          }} />
        ))}
      </div>

      <div className="min-h-screen relative" style={{ zIndex: 1 }}>

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
          style={{
            background: scrolled ? "rgba(26,6,18,0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(20px)" : "none",
            borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          }}>
          <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center shadow-lg"
                style={{ background: GRAD, boxShadow: "0 0 20px rgba(124,92,255,0.4)" }}>
                <span className="text-xs font-black text-white">AX</span>
              </div>
              <span className="text-lg font-black text-white tracking-tight">
                Algorithm<span style={{ color: "#00e5ff" }}>X</span>
              </span>
            </a>
            <div className="flex items-center gap-4">
              <a href="/login" className="text-sm font-bold text-gray-300 hover:text-white transition-colors hidden sm:block">
                Log In
              </a>
              <motion.a href="/signup"
                whileHover={{ scale: 1.05, y: -2, boxShadow: BTN_GLOW_HOVER }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white"
                style={{ background: BTN_GRAD, boxShadow: BTN_GLOW }}>
                Enrol Now — £99
              </motion.a>
            </div>
          </div>
        </nav>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <motion.div className="flex-1 text-center lg:text-left"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 150, damping: 20 }}>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black mb-6"
                style={{ background: "rgba(124,92,255,0.15)", border: "1px solid rgba(124,92,255,0.3)", color: "#7c5cff", boxShadow: "0 0 12px rgba(124,92,255,0.2)" }}>
                <CyberIconOrEmoji emoji="🛡️" size={16} accent="cyan" glow={false} />
                Cybersecurity for Kids
              </div>
              <h1 className="text-white leading-none mb-6" style={{ fontSize: "clamp(40px, 7vw, 72px)", fontWeight: 900, letterSpacing: "-0.04em" }}>
                Turn Your Child Into a{" "}
                <span style={ACCENT_TEXT}>
                  Cyber Hero
                </span>
              </h1>
              <p className="text-gray-300 text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-4">
                Join Adam and Layla on an interactive journey to become a Cyber Hero. Fun animated lessons, games, and challenges for ages 6–9.
              </p>
              <p className="mb-4 mono" style={{ fontSize: 14, color: "#ff7a59", fontWeight: 500 }}>
                <span className="ch-typewriter">20 weeks. 40+ missions. 1 Cyber Hero.</span>
              </p>
              {/* Trust line — surfaces accreditation + privacy from the
                  FAQ so it's visible above the fold. */}
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 justify-center lg:justify-start"
                style={{ fontSize: 12, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.04em" }}>
                <span className="inline-flex items-center gap-1.5">
                  <span style={{ color: "#7df0ff" }}>✓</span> CyberFirst (UK) aligned
                </span>
                <span style={{ color: "rgba(148,163,184,0.4)" }}>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span style={{ color: "#7df0ff" }}>✓</span> ASDAN aligned
                </span>
                <span style={{ color: "rgba(148,163,184,0.4)" }}>·</span>
                <span className="inline-flex items-center gap-1.5">
                  <span style={{ color: "#7df0ff" }}>✓</span> GDPR compliant
                </span>
              </div>
              {/* Social proof line — placeholder until real reviews land */}
              <div className="mb-8 flex flex-wrap items-center gap-2 justify-center lg:justify-start"
                style={{ fontSize: 13, color: "#cbd5e1", fontWeight: 600 }}>
                <span style={{ color: "#ffd158", letterSpacing: 1, fontSize: 15 }}>★★★★★</span>
                <span>Built by parents, for parents — UK-based</span>
              </div>
              <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
                <motion.a href="/signup"
                  whileHover={{ scale: 1.05, y: -2, boxShadow: BTN_GLOW_HOVER }}
                  whileTap={{ scale: 0.95 }}
                  className="px-7 py-4 font-bold text-white text-base"
                  style={{ background: BTN_GRAD, boxShadow: BTN_GLOW, borderRadius: 14 }}>
                  Enrol Now — £99
                </motion.a>
                <motion.a href="#how"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-7 py-4 font-bold text-base inline-flex items-center gap-2"
                  style={{
                    color: "#00e5ff",
                    background: "rgba(0,229,255,0.06)",
                    border: "1px solid rgba(0,229,255,0.3)",
                    borderRadius: 14,
                    textDecoration: "none",
                  }}>
                  See How It Works
                </motion.a>
              </div>
              {/* Hero counters row — staggered fade-in-up reveal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-2xl mx-auto lg:mx-0">
                {[
                  { to: 20, suffix: "", label: "Weeks", color: "#00e5ff" },
                  { to: 40, suffix: "+", label: "Activities", color: "#7eff97" },
                  { to: 4, suffix: "", label: "Certificates", color: "#ff7a59" },
                  { to: 100, suffix: "%", label: "Hands-On", color: "#ffd158" },
                ].map((s, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    style={{
                      background: "rgba(255,255,255,0.03)", border: "1px solid rgba(148,163,184,0.12)",
                      borderRadius: 14, padding: "14px 12px", textAlign: "center",
                    }}
                  >
                    <div className="display-font" style={{ color: s.color, fontSize: 28, fontWeight: 700, lineHeight: 1 }}>
                      <CountUp to={s.to} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", letterSpacing: "0.08em", marginTop: 6, textTransform: "uppercase" }}>
                      {s.label}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div className="flex-1 flex justify-center lg:justify-end"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 20, delay: 0.2 }}>
              <div className="relative">
                {/* Glow behind image */}
                <motion.div className="absolute inset-0 rounded-3xl"
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    background: "linear-gradient(135deg, rgba(124,92,255,0.4), rgba(0,229,255,0.4))",
                    filter: "blur(40px)", transform: "scale(1.1)",
                  }} />
                <motion.div className="relative rounded-3xl overflow-hidden border-2 shadow-2xl"
                  animate={{ y: [-8, 8, -8] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  style={{
                    borderColor: "rgba(124,92,255,0.45)",
                    boxShadow: "0 0 28px rgba(124,92,255,0.45), 0 0 64px rgba(0,229,255,0.25)",
                  }}>
                  <video
                    ref={heroVideoRef}
                    src="/videos/cyberheroes-hero.mp4"
                    autoPlay
                    muted={heroMuted}
                    loop
                    playsInline
                    poster="/characters/heroic.png"
                    className="block w-full max-w-[500px]"
                    style={{ display: "block", background: "#000", cursor: "pointer" }}
                    onClick={() => {
                      setHeroMuted((m) => !m);
                      const v = heroVideoRef.current;
                      if (v && v.paused) v.play().catch(() => {});
                    }}
                  />
                  {/* Sound toggle — overlays the bottom-right corner.
                      "Tap for sound" hint while muted; speaker icon
                      while playing with sound. */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setHeroMuted((m) => !m);
                      const v = heroVideoRef.current;
                      if (v && v.paused) v.play().catch(() => {});
                    }}
                    aria-label={heroMuted ? "Unmute video" : "Mute video"}
                    style={{
                      position: "absolute",
                      bottom: 14,
                      right: 14,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: heroMuted ? "8px 14px" : "8px 12px",
                      borderRadius: 999,
                      background: "rgba(8, 10, 22, 0.78)",
                      border: "1px solid rgba(125, 240, 255, 0.5)",
                      color: "#7df0ff",
                      fontSize: 13,
                      fontWeight: 800,
                      letterSpacing: 1,
                      cursor: "pointer",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4), 0 0 14px rgba(0, 229, 255, 0.35)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{heroMuted ? "🔇" : "🔊"}</span>
                    {heroMuted && <span>Tap for sound</span>}
                  </button>
                </motion.div>
                {/* Sparkles */}
                {[
                  { top: "-8px", right: "-8px", size: 14 },
                  { bottom: "12px", left: "-10px", size: 10 },
                  { top: "40%", right: "-14px", size: 8 },
                ].map((s, i) => (
                  <motion.div key={i} className="absolute text-yellow-300"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
                    style={{ ...s, fontSize: s.size }}>✦</motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── MEET YOUR HEROES ──────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Meet Your{" "}
              <span style={ACCENT_TEXT}>Cyber Heroes</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-3xl mx-auto mb-10">
            {/* Adam */}
            <div data-scroll data-scroll-delay="0">
              <motion.div className="rounded-3xl overflow-hidden char-blob char-blob-adam"
                whileHover={{ y: -8, scale: 1.03, boxShadow: "0 0 25px rgba(124,92,255,0.4)" }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "2px solid rgba(124,92,255,0.3)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 0 20px rgba(124,92,255,0.3)",
                }}>
                <div style={{ height: 420, overflow: "hidden", background: "linear-gradient(180deg, rgba(124,92,255,0.08) 0%, transparent 100%)" }}>
                  <Image src="/characters/adam.png" alt="Adam, curious and brave Cyber Hero" width={400} height={500} className="char-float" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
                </div>
                <div className="px-6 py-5 text-center">
                  <h3 className="font-black text-white text-2xl mb-2">Adam</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Curious, brave, and always ready to learn. Adam enjoys gaming and wants to keep his digital world safe.
                  </p>
                </div>
              </motion.div>
            </div>

            {/* Layla */}
            <div data-scroll data-scroll-delay="0.15">
              <motion.div className="rounded-3xl overflow-hidden char-blob char-blob-layla"
                whileHover={{ y: -8, scale: 1.03, boxShadow: "0 0 25px rgba(124,92,255,0.4)" }}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "2px solid rgba(124,92,255,0.3)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 0 20px rgba(124,92,255,0.3)",
                }}>
                <div style={{ height: 420, overflow: "hidden", background: "linear-gradient(180deg, rgba(124,92,255,0.08) 0%, transparent 100%)" }}>
                  <Image src="/characters/layla.png" alt="Layla, smart and fearless Cyber Hero" width={400} height={500} className="char-float" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
                </div>
                <div className="px-6 py-5 text-center">
                  <h3 className="font-black text-white text-2xl mb-2">Layla</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Smart, creative, and fearless. Layla knows that staying safe online is a superpower everyone needs.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="text-center" data-scroll data-scroll-delay="0.2">
            <p className="text-gray-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
              Join Adam and Layla on their adventure to become cybersecurity experts. Help them stay safe from the Hacker Raccoon and learn how to protect yourself too!
            </p>
            <motion.a href="/signup"
              whileHover={{ scale: 1.05, y: -2, boxShadow: BTN_GLOW_HOVER }}
              whileTap={{ scale: 0.95 }}
              className="inline-block px-7 py-4 font-bold text-white text-base"
              style={{ background: BTN_GRAD, boxShadow: BTN_GLOW, borderRadius: 14 }}>
              Enrol Your Child — £99
            </motion.a>
          </div>
        </section>

        {/* ── STORY ────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              The Adventure{" "}
              <span style={ACCENT_TEXT}>Begins</span>
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Follow Adam and Layla as they learn to protect their digital world from the sneaky Hacker Raccoon. Each week is a new adventure!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STORY.map((s, i) => (
              <div key={i} data-scroll data-scroll-delay={String(i * 0.15)}>
                <motion.div className="overflow-hidden group"
                  whileHover={{ y: -8, scale: 1.03, boxShadow: "0 0 25px rgba(124,92,255,0.15)" }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(124,92,255,0.2)",
                    backdropFilter: "blur(8px)",
                    borderRadius: 20,
                    position: "relative",
                    height: 380,
                    overflow: "hidden",
                  }}>
                  <Image src={s.src} alt={s.alt} width={400} height={400} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                  {/* Step number badge */}
                  <div style={{ position: "absolute", top: 12, left: 12, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 900, color: "#fff", background: GRAD, boxShadow: "0 4px 12px rgba(124,92,255,0.4)", zIndex: 2 }}>
                    {i + 1}
                  </div>
                  {/* Text overlay */}
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "linear-gradient(transparent, rgba(0,0,0,0.85))", padding: "40px 16px 16px", borderRadius: "0 0 16px 16px" }}>
                    <p style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 4 }}>{s.caption}</p>
                    <p style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", lineHeight: 1.4 }}>{s.sub}</p>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

        {/* ── RACCOON ──────────────────────────────────────────────────────── */}
        <div className="flex justify-center py-12" data-scroll data-scroll-delay="0.2">
          <div className="relative max-w-xs">
            <div className="absolute inset-0 rounded-3xl"
              style={{ background: "rgba(239,68,68,0.3)", filter: "blur(50px)", transform: "scale(0.9)" }} />
            <motion.div
              animate={{ boxShadow: ["0 0 30px rgba(239,68,68,0.3)", "0 0 60px rgba(239,68,68,0.6)", "0 0 30px rgba(239,68,68,0.3)"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{ borderRadius: 20, display: "inline-block", border: "2px solid rgba(239,68,68,0.3)" }}>
              <Image src="/characters/raccoon.png" alt="The Hacker Raccoon villain"
                width={280} height={280} className="relative block" style={{ borderRadius: 18 }} />
            </motion.div>
            <div className="text-center mt-4">
              <p className="text-blue-300 text-sm font-black">The Hacker Raccoon</p>
              <p style={{ color: "#ef4444", fontWeight: 700, fontSize: 18, marginTop: 4 }}>The villain your kids will learn to outsmart!</p>
              <p style={{ color: "#9ca3af", fontSize: 14, fontStyle: "italic", marginTop: 4 }}>Can Adam &amp; Layla defeat him? Your child decides!</p>
            </div>
          </div>
        </div>

        {/* ── VILLAIN SPOTLIGHT ─────────────────────────────────────────── */}
        <div className="flex justify-center px-6 pb-16" data-scroll data-scroll-delay="0.1">
          <div style={{
            maxWidth: 800, width: "100%",
            background: "#111827",
            border: "1px solid rgba(239,68,68,0.2)",
            boxShadow: "0 0 30px rgba(239,68,68,0.08)",
            borderRadius: 20, padding: 32,
          }}>
            <h3 className="display-font" style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 12 }}>
              🦝 Who is the Hacker Raccoon?
            </h3>
            <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.75 }}>
              The Hacker Raccoon isn&apos;t just a cartoon villain — he represents the real cyber threats targeting your children every day.
              From sophisticated phishing emails disguised as game rewards, to social engineering in chat rooms, fake app downloads, and password-cracking attacks.
              Each week, the Raccoon deploys a new tactic pulled straight from today&apos;s threat landscape.
              Your child learns to recognise, outsmart, and block every single one.
            </p>
          </div>
        </div>

        {/* ── OTHER AGES ──────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 sm:py-16">
          <div className="text-center" data-scroll>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-400 mb-3">
              Looking for{" "}
              <span style={ACCENT_TEXT}>other ages</span>?
            </h3>
            <p className="text-gray-500 text-sm max-w-lg mx-auto mb-6">
              Cyber Heroes Academy is designed for ages 6-9. For older children and adults, check out our other cybersecurity courses.
            </p>
            <a href="/" className="inline-block px-6 py-3 text-sm font-bold text-white transition-all"
              style={{ background: BTN_GRAD, boxShadow: BTN_GLOW, borderRadius: 14 }}>
              Explore All Courses →
            </a>
          </div>
        </section>

        {/* ── CURRICULUM TEASER ───────────────────────────────────────────── */}
        <section className="max-w-[800px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              A{" "}
              <span style={ACCENT_TEXT}>Sneak Peek</span>
              {" "}at Your Journey
            </h2>
            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto">
              20 weeks of cybersecurity missions. Here are some highlights.
            </p>
          </div>
          {/* Timeline */}
          <div style={{ position: "relative" }}>
            {/* Centre line */}
            <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "rgba(124,92,255,0.15)", transform: "translateX(-50%)" }} />
            {([
              { w: 1, title: "Passwords: The Secret Code", sub: "Discover why passwords matter and learn how to create super strong ones", gap: null, phase: "PHASE 1: FOUNDATIONS", phaseColor: "#00e5ff" },
              { w: null, label: "4 more Phase 1 missions...", gap: true, milestone: "🛡️ Cyber Cadet Certificate (after W5)", milestoneColor: "#00e5ff" },
              { w: 6, title: "Gaming Safety: Defend Your Game Zone", sub: "Stay safe in Roblox, Minecraft, and Fortnite", gap: null, phase: "PHASE 2: DIGITAL WORLD", phaseColor: "#34d399" },
              { w: null, label: "6 more Phase 2 missions...", gap: true, milestone: "⚔️ Cyber Guardian Certificate (after W10)", milestoneColor: "#34d399" },
              { w: 13, title: "Screen Time: Balance Your Power", sub: "Find the right balance between time online, breaks, sleep, and healthy habits", gap: null, phase: "PHASE 3: ADVANCED OPS", phaseColor: "#ff7a59" },
              { w: null, label: "5 more Phase 3 missions...", gap: true, milestone: "🏰 Cyber Defender Certificate (after W15)", milestoneColor: "#ff7a59" },
              { w: 19, title: "Protecting Family: Family Firewall", sub: "Become the family cyber expert", gap: null, phase: "PHASE 4: GRADUATION", phaseColor: "#ffd158" },
              { w: null, label: "The grand finale awaits...", gap: true, milestone: "🎓 Certified Cyber Hero (after W20)", milestoneColor: "#ffd158" },
              { w: 20, title: "Graduation Day: The Final Mission", sub: "The ultimate challenge! Earn your Cyber Hero certificate", gap: null, phase: "PHASE 4: GRADUATION", phaseColor: "#ffd158" },
            ] as Array<{ w: number | null; title?: string; sub?: string; gap: boolean | null; label?: string; phase?: string; phaseColor?: string; milestone?: string; milestoneColor?: string }>).map((item, i) => (
              <div key={i} data-scroll data-scroll-delay={String(i * 0.08)}>
                {item.gap ? (
                  /* Locked placeholder + milestone */
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "14px 0" }}>
                    <div style={{
                      background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)",
                      borderRadius: 12, padding: "10px 24px", opacity: 0.5, display: "flex", alignItems: "center", gap: 8,
                    }}>
                      <CyberIconOrEmoji emoji="🔒" size={16} accent="cosmic" glow={false} />
                      <span style={{ color: "#6b7280", fontSize: 13, fontWeight: 600 }}>{item.label}</span>
                    </div>
                    {item.milestone && (
                      <div style={{
                        display: "inline-flex", alignItems: "center", gap: 6,
                        background: `${item.milestoneColor}1a`,
                        border: `1px solid ${item.milestoneColor}55`,
                        borderRadius: 999,
                        padding: "6px 14px",
                        fontSize: 12,
                        fontWeight: 800,
                        letterSpacing: "0.03em",
                        color: item.milestoneColor,
                        boxShadow: `0 0 12px ${item.milestoneColor}33`,
                      }}>
                        {item.milestone}
                      </div>
                    )}
                  </div>
                ) : (
                  /* Visible module card */
                  <div style={{
                    display: "flex",
                    justifyContent: i % 2 === 0 ? "flex-start" : "flex-end",
                    padding: "8px 0",
                  }}>
                    <div style={{
                      width: "45%",
                      background: item.w === 20 ? "rgba(255, 209, 88,0.06)" : "rgba(255,255,255,0.04)",
                      border: item.w === 20 ? "2px solid #ffd158" : "1px solid rgba(124,92,255,0.2)",
                      borderLeft: item.w === 20 ? "2px solid #ffd158" : "3px solid #7c5cff",
                      boxShadow: item.w === 20 ? "0 0 15px rgba(255, 209, 88,0.4)" : "0 0 10px rgba(124,92,255,0.2)",
                      borderRadius: 16, padding: 20,
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: item.w === 20 ? "linear-gradient(135deg, #ffd158, #ff7a59)" : GRAD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff", flexShrink: 0 }}>
                          {item.w}
                        </div>
                        {item.phase && (
                          <span style={{
                            fontSize: 9, fontWeight: 800, letterSpacing: "0.08em",
                            color: item.phaseColor,
                            background: `${item.phaseColor}1a`,
                            border: `1px solid ${item.phaseColor}55`,
                            borderRadius: 8, padding: "2px 8px",
                          }}>
                            {item.phase}
                          </span>
                        )}
                        {item.w === 20 && <span style={{ fontSize: 10, fontWeight: 800, color: "#ffd158", background: "rgba(255, 209, 88,0.15)", borderRadius: 8, padding: "2px 8px", boxShadow: "0 0 12px rgba(255, 209, 88,0.4)" }}>🎓 Final Mission</span>}
                        {item.w === 1 && <span style={{ fontSize: 10, fontWeight: 800, color: "#10b981", background: "rgba(16,185,129,0.15)", borderRadius: 8, padding: "2px 8px", boxShadow: "0 0 12px rgba(16,185,129,0.4)" }}>START HERE</span>}
                      </div>
                      <h4 style={{ color: "#fff", fontWeight: 800, fontSize: 15, marginBottom: 4 }}>{item.title}</h4>
                      <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.5 }}>{item.sub}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* CTA */}
          <div data-scroll style={{ background: "rgba(124,92,255,0.1)", border: "1px solid rgba(124,92,255,0.3)", boxShadow: "0 0 20px rgba(124,92,255,0.2)", borderRadius: 20, padding: 32, textAlign: "center", maxWidth: 600, margin: "32px auto 0" }}>
            <div style={{ marginBottom: 12, display: "flex", justifyContent: "center" }}>
              <CyberIconOrEmoji emoji="🔒" size={40} accent="cyan" glow />
            </div>
            <h3 style={{ color: "#fff", fontSize: 22, fontWeight: 900, marginBottom: 8 }}>Want to unlock all 20 missions?</h3>
            <p style={{ color: "#9ca3af", fontSize: 16, marginBottom: 20, maxWidth: 480, margin: "0 auto 20px" }}>
              Enrol today to reveal every week, every game, every badge. One payment — lifetime access to the full Cyber Heroes journey.
            </p>
            <motion.a href="/signup"
              whileHover={{ scale: 1.05, y: -2, boxShadow: BTN_GLOW_HOVER }} whileTap={{ scale: 0.95 }}
              style={{ display: "inline-block", background: BTN_GRAD, color: "#fff", fontSize: 18, fontWeight: 700, padding: "14px 36px", borderRadius: 14, textDecoration: "none", boxShadow: BTN_GLOW }}>
              Enrol Now — £99
            </motion.a>
          </div>
        </section>

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-6" data-scroll>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 display-font" style={{ fontSize: 28 }}>
              Why Cybersecurity Matters for Kids
            </h2>
          </div>
          <p data-scroll className="mx-auto text-center" style={{ fontSize: 17, color: "#94a3b8", maxWidth: 720, marginBottom: 20, lineHeight: 1.8 }}>
            Children are spending more time online than ever before — gaming, chatting, streaming, learning. But the internet wasn&apos;t designed with kids in mind. Cyberbullying, phishing scams, data harvesting, and predatory behaviour are real threats that most children have never been taught to recognise.
          </p>
          <p data-scroll data-scroll-delay="0.08" className="mx-auto text-center" style={{ fontSize: 17, color: "#94a3b8", maxWidth: 720, marginBottom: 48, lineHeight: 1.8 }}>
            Schools barely scratch the surface. Parental controls can only do so much. The best protection you can give your child is the knowledge to protect themselves. That&apos;s exactly what Cyber Heroes Academy delivers — real cybersecurity skills, taught through the language kids understand best: adventure, play, and stories.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {FEATURES.map((f, i) => (
              <div key={i} data-scroll data-scroll-delay={String(i * 0.12)}>
                <motion.div className="rounded-3xl p-6 h-full"
                  whileHover={{ y: -8, scale: 1.03, boxShadow: "0 0 25px rgba(124,92,255,0.15)" }}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(124,92,255,0.2)",
                    backdropFilter: "blur(12px)",
                  }}>
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: "rgba(124,92,255,0.1)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                    {i === 0 ? <IconController /> : <IconAward />}
                  </div>
                  <h3 className="font-black text-white text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </div>
            ))}
          </div>

          {/* Raccoon moved to after story section */}
        </section>

        {/* ── HOW IT WORKS ────────────────────────────────────────────────── */}
        <section id="how" className="max-w-[900px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
              color: "#ff7a59", background: "rgba(255, 122, 89,0.1)",
              border: "1px solid rgba(255, 122, 89,0.25)",
              marginBottom: 20,
            }}>
              HOW IT WORKS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              From zero to <span style={ACCENT_TEXT}>Cyber Hero</span> in 20 weeks
            </h2>
          </div>
          <div style={{ position: "relative", paddingLeft: 40 }}>
            {/* connecting vertical line */}
            <div style={{
              position: "absolute", left: 36, top: 32, bottom: 32,
              width: 2, background: "rgba(0,229,255,0.1)",
            }} aria-hidden />
            {[
              { num: "1", title: "Enrol & Create Account", desc: "One-time payment of £99. Set up your child's profile and customise their avatar in under 2 minutes.", color: "#00e5ff" },
              { num: "2", title: "Watch the Story", desc: "Each week opens with an animated chapter where Adam, Layla, and Robo discover a new cyber threat.", color: "#34d399" },
              { num: "3", title: "Complete the Mission", desc: "Interactive simulations, drag-and-drop puzzles, and a boss battle finale against the Hacker Raccoon.", color: "#ff7a59" },
              { num: "4", title: "Earn Badges & Level Up", desc: "Collect digital badges, unlock milestone certificates, and watch the Raccoon's power drain week by week.", color: "#ffd158" },
            ].map((s, i) => (
              <div key={i} data-scroll data-scroll-delay={String(0.08 + i * 0.1)} style={{ display: "flex", gap: 28, alignItems: "flex-start", marginBottom: 30, position: "relative" }}>
                <div style={{
                  flexShrink: 0,
                  width: 72, height: 72, borderRadius: "50%",
                  marginLeft: -36,
                  background: "#111827",
                  border: `2px solid ${s.color}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 0 28px ${s.color}44`,
                  position: "relative", zIndex: 1,
                }}>
                  <span className="display-font" style={{
                    fontSize: 40, fontWeight: 700,
                    background: `linear-gradient(135deg, ${s.color}, ${s.color}aa)`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    lineHeight: 1,
                  }}>
                    {s.num}
                  </span>
                </div>
                <div style={{ paddingTop: 12 }}>
                  <h3 className="display-font" style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ color: "#94a3b8", fontSize: 15, lineHeight: 1.7, maxWidth: 560 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── STATS ────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-12 sm:py-20">
          <div className="flex flex-wrap gap-4 justify-center">
            <AnimCounter to={20} label="Weeks of Adventure" />
            <AnimCounter to={100} suffix="+" label="Interactive Activities" />
            <AnimCounter to={6} suffix="-10" label="Age Range" />
            <AnimCounter to={100} suffix="%" label="Interactive" />
          </div>
        </section>

        {/* ── TESTIMONIALS ────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12" data-scroll>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
              color: "#ffd158", background: "rgba(255, 209, 88,0.1)",
              border: "1px solid rgba(255, 209, 88,0.25)",
              marginBottom: 20,
            }}>
              ★ TRUSTED BY PARENTS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Families are seeing <span style={ACCENT_TEXT}>real results</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {[
              { name: "Sarah M.", role: "Mum of 8-year-old", text: "My daughter now teaches ME about password safety. She genuinely looks forward to each lesson.", color: "#00e5ff" },
              { name: "James T.", role: "Dad of twins, age 7", text: "Finally, cybersecurity for kids that isn't boring. The boss battles are an absolute hit in our house.", color: "#34d399" },
              { name: "Priya K.", role: "Mum of 9-year-old", text: "Worth every penny. My son spotted a real phishing email last week and knew exactly what to do.", color: "#ffd158" },
            ].map((r, i) => (
              <div key={i} data-scroll data-scroll-delay={String(i * 0.12)}>
                <motion.div
                  whileHover={{ y: -4, borderColor: r.color }}
                  style={{
                    position: "relative", overflow: "hidden",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(124,92,255,0.15)",
                    borderRadius: 20, padding: 28,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <span className="display-font" aria-hidden style={{
                    position: "absolute", top: 8, right: 20,
                    fontSize: 48, lineHeight: 1,
                    color: "rgba(0,229,255,0.08)", fontWeight: 700,
                  }}>
                    &ldquo;
                  </span>
                  <div style={{ color: "#ffd158", fontSize: 16, letterSpacing: 3, marginBottom: 14 }}>★★★★★</div>
                  <p style={{ color: "#d1d5db", fontSize: 15, lineHeight: 1.7, marginBottom: 20, fontStyle: "italic" }}>
                    &ldquo;{r.text}&rdquo;
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${r.color}, #34d399)`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 800, fontSize: 16,
                    }}>
                      {r.name[0]}
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>{r.name}</div>
                      <div style={{ color: "#64748b", fontSize: 12 }}>{r.role}</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </section>

        {/* ── PRICING ─────────────────────────────────────────────────────── */}
        <section className="max-w-[800px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-10" data-scroll>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
              color: "#ff7a59", background: "rgba(255, 122, 89,0.1)",
              border: "1px solid rgba(255, 122, 89,0.25)",
              marginBottom: 20,
            }}>
              SIMPLE PRICING
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              One price. <span style={ACCENT_TEXT}>Lifetime access.</span>
            </h2>
          </div>
          <div data-scroll style={{
            maxWidth: 480, margin: "0 auto",
            background: "linear-gradient(135deg, #00e5ff, #34d399, #ff7a59, #ffd158)",
            borderRadius: 24, padding: 2,
            boxShadow: "0 20px 60px rgba(0,0,0,0.35), 0 0 40px rgba(255, 122, 89,0.15)",
          }}>
            <div style={{
              background: "#111827", borderRadius: 22,
              padding: "40px 32px", textAlign: "center",
              position: "relative",
            }}>
              <div style={{
                display: "inline-block",
                padding: "4px 14px", borderRadius: 100,
                fontSize: 11, fontWeight: 800, letterSpacing: 1,
                background: "rgba(255, 122, 89,0.12)", color: "#ff7a59",
                border: "1px solid rgba(255, 122, 89,0.3)",
                marginBottom: 20,
              }}>
                BEST VALUE
              </div>
              <div className="display-font" style={{ fontSize: 80, fontWeight: 700, lineHeight: 1, letterSpacing: "-0.03em" }}>
                <span style={{ fontSize: 36, color: "#64748b", verticalAlign: "top" }}>£</span>
                <span style={{ color: "#fff" }}>99</span>
              </div>
              <div style={{ fontSize: 14, color: "#64748b", marginBottom: 28 }}>
                One-time payment · Lifetime access · Continuously updated
              </div>
              <ul style={{ listStyle: "none", textAlign: "left", marginBottom: 28, padding: 0 }}>
                {[
                  "Full 20-week Cyber Heroes Academy",
                  "All interactive missions & boss battles",
                  "4 milestone certificates (printable PDFs)",
                  "Parent progress dashboard",
                  "One-time £99 per child — no subscriptions, no renewals",
                  "CyberFirst & ASDAN aligned content",
                  "Continuous content updates as new threats emerge",
                  "GDPR-compliant · No data sold · No third-party ads",
                  "30-day money-back guarantee — full refund, no questions asked",
                ].map((f, i, arr) => (
                  <li key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 0", fontSize: 14, color: "#d1d5db",
                    borderBottom: i === arr.length - 1 ? "none" : "1px solid rgba(148,163,184,0.1)",
                  }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5 10 17.5 19 7.5" />
                    </svg>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <motion.a href="/signup"
                whileHover={{ scale: 1.05, y: -2, boxShadow: BTN_GLOW_HOVER }} whileTap={{ scale: 0.95 }}
                style={{
                  display: "inline-block", width: "100%",
                  background: BTN_GRAD, color: "#fff",
                  fontSize: 16, fontWeight: 800,
                  padding: "16px 28px", borderRadius: 14,
                  textDecoration: "none", textAlign: "center",
                  boxShadow: BTN_GLOW,
                }}
              >
                Enrol Your Child Now
              </motion.a>
              <p style={{ fontSize: 13, color: "#64748b", marginTop: 14 }}>
                30-day money-back guarantee
              </p>
            </div>
          </div>
          <p data-scroll className="text-center mt-6" style={{ fontSize: 14, color: "#94a3b8", maxWidth: 520, margin: "24px auto 0", lineHeight: 1.7 }}>
            That&apos;s less than £5 per week for 20 weeks of expert cybersecurity education — with free updates for life.
          </p>
        </section>

        {/* ── FAQ ─────────────────────────────────────────────────────────── */}
        <section className="max-w-[800px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-10" data-scroll>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 16px", borderRadius: 100,
              fontSize: 11, fontWeight: 800, letterSpacing: "0.15em",
              color: "#00e5ff", background: "rgba(0,229,255,0.1)",
              border: "1px solid rgba(0,229,255,0.25)",
              marginBottom: 20,
            }}>
              COMMON QUESTIONS
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Got questions?</h2>
          </div>
          <FAQAccordion />
        </section>

        {/* ── CTA ──────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div data-scroll>
            <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 text-center"
              style={{
                background: "linear-gradient(135deg, #7c5cff, #1d4ed8, #00e5ff)",
                border: "1px solid rgba(124,92,255,0.3)",
                backdropFilter: "blur(16px)",
                boxShadow: "0 0 30px rgba(124,92,255,0.3)",
              }}>
              {/* Blurred background image */}
              <div className="absolute inset-0 z-0">
                <Image src="/characters/adam-layla-happy.png" alt="" fill
                  className="object-cover opacity-10" style={{ filter: "blur(30px)" }} />
              </div>
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
                  Ready to Become a{" "}
                  <span style={ACCENT_TEXT}>
                    Cyber Hero
                  </span>?
                </h2>
                <p className="text-gray-400 text-base sm:text-lg max-w-lg mx-auto mb-8">
                  Join families across the UK giving their children the online safety skills they&apos;ll carry for life.
                </p>
                <motion.a href="/signup"
                  whileHover={{ scale: 1.05, y: -2, boxShadow: BTN_GLOW_HOVER }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-block px-10 py-5 font-bold text-white text-lg"
                  style={{ background: BTN_GRAD, boxShadow: BTN_GLOW, borderRadius: 14 }}>
                  Enrol Now — £99
                </motion.a>
                <p className="mt-4" style={{ fontSize: 13, color: "#94a3b8" }}>
                  One-time payment · Instant access · 30-day guarantee
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer className="border-t py-8 px-6 md:px-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GRAD }}>
                <span className="text-[9px] font-black text-white">AX</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-500">&copy; 2026 AlgorithmX. All rights reserved.</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>Cybersecurity Education for Kids</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Privacy</a>
              <a href="/terms" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Terms</a>
              <a href="mailto:hello@algorithmx.co.uk" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}
