"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import SmoothScroll from "@/app/components/SmoothScroll";

/* ─────────────── TOKENS ─────────────── */
const WHITE = "#ffffff";
const BG_ALT = "#f8fafc";
const BORDER = "#e2e8f0";
const HEADING = "#0f172a";
const BODY = "#475569";
const MUTED = "#94a3b8";

const BLUE = "#3b82f6";
const GREEN = "#10b981";
const ORANGE = "#f97316";
const YELLOW = "#eab308";
const PURPLE = "#8b5cf6";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const RED = "#ef4444";

/* ─────────────── FUTURISTIC BACKGROUND ─────────────── */
function FuturisticBackground() {
  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      overflow: "hidden",
    }}>
      {/* Layer 1 — Living mesh gradient */}
      <div style={{
        position: "absolute", top: "15%", left: "20%",
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${BLUE}, transparent 70%)`,
        opacity: 0.08, filter: "blur(60px)",
        animation: "meshOrbit1 35s ease-in-out infinite",
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute", top: "60%", left: "65%",
        width: 450, height: 450, borderRadius: "50%",
        background: `radial-gradient(circle, ${GREEN}, transparent 70%)`,
        opacity: 0.06, filter: "blur(60px)",
        animation: "meshOrbit2 42s ease-in-out infinite",
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute", top: "30%", left: "75%",
        width: 550, height: 550, borderRadius: "50%",
        background: `radial-gradient(circle, ${PURPLE}, transparent 70%)`,
        opacity: 0.05, filter: "blur(60px)",
        animation: "meshOrbit3 38s ease-in-out infinite",
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute", bottom: "20%", left: "10%",
        width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${PINK}, transparent 70%)`,
        opacity: 0.04, filter: "blur(60px)",
        animation: "meshOrbit4 45s ease-in-out infinite",
        willChange: "transform",
      }} />
      <div style={{
        position: "absolute", top: "50%", left: "40%",
        width: 350, height: 350, borderRadius: "50%",
        background: `radial-gradient(circle, ${AMBER}, transparent 70%)`,
        opacity: 0.04, filter: "blur(60px)",
        animation: "meshOrbit5 30s ease-in-out infinite",
        willChange: "transform",
      }} />

      {/* Layer 2 — Circuit trace SVG */}
      <svg
        width="100%" height="100%" viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute", inset: 0, opacity: 0.5,
          maskImage: "radial-gradient(ellipse 85% 80% at 50% 45%, black 20%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 50% 45%, black 20%, transparent 75%)",
        }}
      >
        <defs>
          <filter id="pulseGlowBlue" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="glow" />
            <feMerge><feMergeNode in="glow" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Horizontal and vertical trace paths (right-angle PCB style) */}
        <g stroke="#cbd5e1" strokeWidth="0.5" fill="none" opacity="0.35">
          <path id="trace1" d="M0 120 L300 120 L300 200 L600 200 L600 140 L900 140 L900 280 L1200 280" />
          <path id="trace2" d="M0 380 L180 380 L180 320 L420 320 L420 460 L720 460 L720 400 L1020 400 L1020 520 L1200 520" />
          <path id="trace3" d="M0 640 L240 640 L240 580 L480 580 L480 700 L780 700 L780 620 L1200 620" />
          <path d="M150 0 L150 160 L90 160 L90 340 L210 340 L210 520 L150 520 L150 800" />
          <path d="M540 0 L540 100 L480 100 L480 260 L600 260 L600 440 L540 440 L540 620 L600 620 L600 800" />
          <path d="M900 0 L900 80 L840 80 L840 220 L960 220 L960 360 L900 360 L900 560 L1020 560 L1020 800" />
        </g>

        {/* Junction dots */}
        <g fill="#cbd5e1" opacity="0.4">
          <circle cx="300" cy="120" r="2" />
          <circle cx="300" cy="200" r="2" />
          <circle cx="600" cy="200" r="2" />
          <circle cx="600" cy="140" r="2" />
          <circle cx="900" cy="140" r="2" />
          <circle cx="900" cy="280" r="2" />
          <circle cx="180" cy="380" r="2" />
          <circle cx="180" cy="320" r="2" />
          <circle cx="420" cy="320" r="2" />
          <circle cx="420" cy="460" r="2" />
          <circle cx="720" cy="460" r="2" />
          <circle cx="720" cy="400" r="2" />
          <circle cx="1020" cy="400" r="2" />
          <circle cx="1020" cy="520" r="2" />
          <circle cx="150" cy="160" r="2" />
          <circle cx="90" cy="160" r="2" />
          <circle cx="90" cy="340" r="2" />
          <circle cx="540" cy="100" r="2" />
          <circle cx="480" cy="100" r="2" />
          <circle cx="480" cy="260" r="2" />
          <circle cx="600" cy="260" r="2" />
          <circle cx="900" cy="80" r="2" />
          <circle cx="840" cy="80" r="2" />
          <circle cx="840" cy="220" r="2" />
          <circle cx="960" cy="220" r="2" />
        </g>

        {/* Animated pulse dots */}
        <circle r="3" fill={BLUE} style={{ filter: `drop-shadow(0 0 4px ${BLUE})` }}>
          <animateMotion dur="8s" repeatCount="indefinite">
            <mpath href="#trace1" />
          </animateMotion>
        </circle>
        <circle r="3" fill={GREEN} style={{ filter: `drop-shadow(0 0 4px ${GREEN})` }}>
          <animateMotion dur="12s" repeatCount="indefinite">
            <mpath href="#trace2" />
          </animateMotion>
        </circle>
        <circle r="3" fill={PURPLE} style={{ filter: `drop-shadow(0 0 4px ${PURPLE})` }}>
          <animateMotion dur="10s" repeatCount="indefinite">
            <mpath href="#trace3" />
          </animateMotion>
        </circle>
      </svg>

      {/* Layer 3 — Hexagonal grid */}
      <svg
        width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{
          position: "absolute", inset: 0, opacity: 0.04,
          maskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 10%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 40%, black 10%, transparent 70%)",
        }}
      >
        <defs>
          <pattern id="hexPattern" width="40" height="34.64" patternUnits="userSpaceOnUse" patternTransform="translate(0,0)">
            <path d="M20 0 L40 11.55 L40 23.09 L20 34.64 L0 23.09 L0 11.55 Z" stroke="#94a3b8" strokeWidth="0.3" fill="none" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hexPattern)" />
      </svg>

      {/* Layer 4 — Noise texture */}
      <svg
        width="100%" height="100%"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: "absolute", inset: 0, opacity: 0.025 }}
      >
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)" />
      </svg>
    </div>
  );
}

/* ─────────────── TRUST LOGOS ─────────────── */
const TRUST_LOGOS: { name: string; src: string | null }[] = [
  { name: "ASDAN", src: "/logos/asdan.jpg" },
  { name: "CompTIA", src: "/logos/comptia.webp" },
  { name: "CyberFirst", src: "/logos/cyberfirst.webp" },
  { name: "Unity", src: "/logos/unity.webp" },
  { name: "AWS", src: "/logos/aws.webp" },
  { name: "Raspberry Pi", src: "/logos/raspberry.webp" },
  { name: "BCS", src: "/logos/bcs.webp" },
  { name: "King\u2019s Trust", src: "/logos/kingstrust.svg" },
  { name: "NCSC", src: "/logos/ncsc.svg" },
  { name: "Google for Education", src: null },
  { name: "Microsoft Education", src: null },
  { name: "Cisco Networking Academy", src: null },
  { name: "EC-Council", src: null },
  { name: "Micro:bit Foundation", src: null },
  { name: "GitHub Education", src: null },
  { name: "Code.org", src: null },
  { name: "Ofqual", src: null },
  { name: "BAFTA Games", src: null },
];

/* ─────────────── DATA ─────────────── */
const TRUST_STRIP = ["CyberFirst Aligned", "ASDAN Accredited", "6 Subjects", "Ages 6 to Adult", "UK Designed"];

type AgeGroup = "6-10" | "11-14" | "15-17" | "18+";

type Course = {
  title: string;
  ageRange: string;
  ageGroup: AgeGroup;
  ageColor: string;
  desc: string;
  duration: string;
  price: string;
  live: boolean;
  coming?: string;
  gradient: [string, string];
  icon: string;
  image: string;
  extra?: string;
  href: string;
};

type Subject = {
  id: string;
  title: string;
  icon: string;
  accent: string;
  ages: string;
  status: string;
  statusColor: string;
  courses: Course[];
};

const SUBJECTS: Subject[] = [
  {
    id: "cybersecurity", title: "Cybersecurity", icon: "shield", accent: GREEN,
    ages: "Ages 6 to Adult", status: "AVAILABLE NOW", statusColor: GREEN,
    courses: [
      { title: "Cyber Heroes Academy", ageRange: "Ages 6-10", ageGroup: "6-10", ageColor: GREEN, desc: "Join Adam, Layla, and Robo on animated adventures to learn online safety. Story-driven missions make cybersecurity feel like a game.", duration: "20 weeks · 45 min/week", price: "£99 · Lifetime Access", live: true, gradient: ["#d1fae5", "#a7f3d0"], icon: "shield", image: "/images/courses/cyber-heroes.svg", href: "/cyberheroes" },
      { title: "Cyber Explorers", ageRange: "Ages 11-14", ageGroup: "11-14", ageColor: PURPLE, desc: "Go beyond the basics. Phishing simulations, network fundamentals, and your first ethical hacking challenges.", duration: "12 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ede9fe", "#c4b5fd"], icon: "shield", image: "/images/courses/cyber-explorers.png", href: "/cyberexplorers" },
      { title: "CyberStart", ageRange: "Ages 15-17", ageGroup: "15-17", ageColor: ORANGE, desc: "CTF competitions, incident response drills, and penetration testing. Build a portfolio that gets you noticed.", duration: "16 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ffedd5", "#fed7aa"], icon: "shield", image: "/images/courses/cyberstart.png", href: "#" },
      { title: "CyberStart Pro", ageRange: "Ages 18+", ageGroup: "18+", ageColor: YELLOW, desc: "Industry-standard security operations, compliance frameworks, and career preparation. Get certified and get hired.", duration: "20 weeks · 2 hrs/week", price: "£109 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fef9c3", "#fde68a"], icon: "shield", image: "/images/courses/cyberstart-pro.png", href: "#" },
    ],
  },
  {
    id: "game-dev", title: "Game Development", icon: "gamepad", accent: BLUE,
    ages: "Ages 8 to Adult", status: "COMING 2026", statusColor: AMBER,
    courses: [
      { title: "Game Starters", ageRange: "Ages 8-10", ageGroup: "6-10", ageColor: BLUE, desc: "Build your first games with Scratch! Drag, drop, and watch your creations come to life.", duration: "10 weeks · 45 min/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#dbeafe", "#bfdbfe"], icon: "gamepad", image: "/images/courses/gamestarters.png", href: "#" },
      { title: "Game Builders", ageRange: "Ages 11-14", ageGroup: "11-14", ageColor: BLUE, desc: "Level up to Unity and Roblox Studio. Design real mechanics, characters, and worlds.", duration: "14 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#bfdbfe", "#93c5fd"], icon: "gamepad", image: "/images/courses/gamebuilders.png", href: "#" },
      { title: "Game Engineers", ageRange: "Ages 15+", ageGroup: "15-17", ageColor: BLUE, desc: "Unreal Engine, C#, physics systems, and publishing. Ship a real game to a real audience.", duration: "18 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#93c5fd", "#60a5fa"], icon: "gamepad", image: "/images/courses/gameengineers.png", href: "#" },
    ],
  },
  {
    id: "ai-ml", title: "AI & Machine Learning", icon: "brain", accent: PURPLE,
    ages: "Ages 10 to Adult", status: "COMING 2026", statusColor: AMBER,
    courses: [
      { title: "AI Discoverers", ageRange: "Ages 10-13", ageGroup: "11-14", ageColor: PURPLE, desc: "Play with AI! Train your first models, chat with AI safely, and explore the ethics of intelligent machines.", duration: "10 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ede9fe", "#ddd6fe"], icon: "brain", image: "/images/courses/aidiscoverers.png", href: "#" },
      { title: "AI Builders", ageRange: "Ages 14-16", ageGroup: "15-17", ageColor: PURPLE, desc: "Python, TensorFlow, image recognition, and NLP. Build real machine learning models from scratch.", duration: "14 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ddd6fe", "#c4b5fd"], icon: "brain", image: "/images/courses/aibuilders.png", href: "#" },
      { title: "AI Engineers", ageRange: "Ages 17+", ageGroup: "18+", ageColor: PURPLE, desc: "Neural networks, deep learning, responsible AI, and deployment. University-level AI skills for your career.", duration: "18 weeks · 2 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#c4b5fd", "#a78bfa"], icon: "brain", image: "/images/courses/aiengineers.png", href: "#" },
    ],
  },
  {
    id: "app-dev", title: "App Development", icon: "phone", accent: ORANGE,
    ages: "Ages 10 to Adult", status: "COMING 2027", statusColor: AMBER,
    courses: [
      { title: "App Starters", ageRange: "Ages 10-13", ageGroup: "11-14", ageColor: ORANGE, desc: "Design your dream app! No-code tools, wireframes, and UX thinking — bring your ideas to life.", duration: "10 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#ffedd5", "#fed7aa"], icon: "phone", image: "/images/courses/appstarters.png", href: "#" },
      { title: "App Developers", ageRange: "Ages 14-16", ageGroup: "15-17", ageColor: ORANGE, desc: "React Native, real mobile apps, from idea to working prototype — right on your phone.", duration: "14 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fed7aa", "#fdba74"], icon: "phone", image: "/images/courses/appdevelopers.png", href: "#" },
      { title: "Full-Stack Developers", ageRange: "Ages 17+", ageGroup: "18+", ageColor: ORANGE, desc: "React, Node.js, databases, APIs, CI/CD. Ship production applications and land developer roles.", duration: "18 weeks · 2 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fdba74", "#fb923c"], icon: "phone", image: "/images/courses/fullstackdeveloper.jpeg", href: "#" },
    ],
  },
  {
    id: "entrepreneurship", title: "Tech Entrepreneurship", icon: "rocket", accent: YELLOW,
    ages: "Ages 14 to Adult", status: "COMING 2027", statusColor: AMBER,
    courses: [
      { title: "Startup Foundations", ageRange: "Ages 14-16", ageGroup: "15-17", ageColor: YELLOW, desc: "Turn your ideas into products. Lean startup, customer discovery, and your first pitch deck.", duration: "12 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fef9c3", "#fde68a"], icon: "rocket", image: "/images/courses/startupfoundations.png", href: "#" },
      { title: "Venture Builder", ageRange: "Ages 17+", ageGroup: "18+", ageColor: YELLOW, desc: "Financial modelling, fundraising, go-to-market strategy. Build and launch a real tech company.", duration: "16 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fde68a", "#fcd34d"], icon: "rocket", image: "/images/courses/venturestarter.png", href: "#" },
    ],
  },
  {
    id: "robotics", title: "Robotic Engineering", icon: "cpu", accent: PINK,
    ages: "Ages 8 to Adult", status: "COMING 2027", statusColor: AMBER,
    courses: [
      { title: "Robot Explorers", ageRange: "Ages 8-10", ageGroup: "6-10", ageColor: PINK, desc: "Build your first robot with Lego Mindstorms! Sensors, motors, and programming through play.", duration: "10 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fce7f3", "#fbcfe8"], icon: "cpu", image: "/images/courses/robot-explorers.svg", href: "#" },
      { title: "Robot Builders", ageRange: "Ages 11-14", ageGroup: "11-14", ageColor: PINK, desc: "Arduino, breadboards, sensors, and circuit design. Program real hardware.", duration: "14 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fbcfe8", "#f9a8d4"], icon: "cpu", image: "/images/courses/robot-builders.svg", href: "#" },
      { title: "Robot Engineers", ageRange: "Ages 15+", ageGroup: "15-17", ageColor: PINK, desc: "ROS, computer vision, autonomous systems. Engineering-grade robotics.", duration: "18 weeks · 2 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#f9a8d4", "#f472b6"], icon: "cpu", image: "/images/courses/robot-engineers.svg", href: "#", extra: "UK Only · Kit Included" },
    ],
  },
];

const STEPS = [
  { n: 1, title: "Choose a Subject", desc: "Browse six streams of technology education", accent: BLUE },
  { n: 2, title: "Pick Your Level", desc: "Select the age-appropriate track for you or your child", accent: GREEN },
  { n: 3, title: "Enrol", desc: "One-time £99 payment — no subscriptions, no hidden fees", accent: ORANGE },
  { n: 4, title: "Learn & Certify", desc: "Complete missions at your pace and earn accredited certificates", accent: YELLOW },
];

const TESTIMONIALS: { text: string; name: string; role: string; accent?: string }[] = [
  { text: "My daughter absolutely loves it. She talks about Adam and Layla like they\u2019re her best friends, and she\u2019s already teaching ME about password safety.", name: "Sarah T.", role: "Parent · London" },
  { text: "Finally, a course that actually engages kids. The interactive missions are brilliant \u2014 my son doesn\u2019t even realise he\u2019s learning.", name: "James P.", role: "Parent · Manchester" },
  { text: "As a teacher, I recommend this to every parent. It covers everything the curriculum misses about online safety.", name: "Mrs. K. Williams", role: "Year 4 Teacher" },
  { text: "I built my first penetration test environment at 15. The CTF challenges are genuinely hard \u2014 and I love it. My school doesn\u2019t teach anything like this.", name: "Aisha R.", role: "Age 16 · Birmingham", accent: PURPLE },
];

/* ─────────────── SVG ICONS ─────────────── */
const ICON_PATHS: Record<string, string> = {
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  gamepad: "M6 12h4M8 10v4M15 11h.01M18 13h.01",
  brain: "M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7zM9 22h6",
  phone: "M12 18h.01",
  rocket: "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09zM12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z",
  cpu: "M9 9h6M9 13h6",
  check: "M20 6L9 17l-5-5",
  arrow: "M5 12h14M12 5l7 7-7 7",
  chevron: "M6 9l6 6 6-6",
  quote: "M3 21c3 0 7-1 7-8V5H5v8c0 3-2 3-2 3zM17 21c3 0 7-1 7-8V5h-5v8c0 3-2 3-2 3z",
};
const ICON_RECTS: Record<string, [number, number, number, number, number]> = {
  gamepad: [2, 6, 20, 12, 2],
  cpu: [6, 4, 12, 16, 1],
  phone: [5, 2, 14, 20, 2],
};

function Ico({ name, size = 24, color = "#fff", sw = 2 }: { name: string; size?: number; color?: string; sw?: number }) {
  const r = ICON_RECTS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {r && <rect x={r[0]} y={r[1]} width={r[2]} height={r[3]} rx={r[4]} />}
      <path d={ICON_PATHS[name] || ICON_PATHS.shield} />
    </svg>
  );
}

/* ─────────────── FADE-UP WRAPPER ─────────────── */
function FadeUp({ children, delay = 0, className, style }: { children: React.ReactNode; delay?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* ─────────────── COUNTER ─────────────── */
function Counter({ to, duration = 2000 }: { to: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.2 });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    let cancelled = false;
    const start = performance.now();
    const tick = (now: number) => {
      if (cancelled) return;
      const t = Math.min((now - start) / duration, 1);
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => { cancelled = true; cancelAnimationFrame(frame); };
  }, [inView, to, duration]);
  return <span ref={ref}>{val}</span>;
}

/* ─────────────── COURSE CARD ─────────────── */
function ctaLabel(ageGroup: AgeGroup, live: boolean, hasLink: boolean): string {
  if (!live && !hasLink) return "Coming Soon";
  if (!live && hasLink) return ageGroup === "6-10" ? "Coming Soon" : ageGroup === "11-14" ? "Coming Soon" : ageGroup === "15-17" ? "Coming Soon" : "Coming Soon";
  // live
  if (ageGroup === "6-10") return "Start the Adventure";
  if (ageGroup === "11-14") return "Start Exploring";
  if (ageGroup === "15-17") return "Build Your Portfolio";
  return "Launch Your Career";
}

function CourseCard({ c }: { c: Course }) {
  const [hover, setHover] = useState(false);
  const [imgError, setImgError] = useState(false);
  const lifted = hover && c.live;
  const isKids = c.ageGroup === "6-10";
  const titleSize = isKids ? 20 : 18;
  const cardCornerRadius = isKids ? 20 : 16;
  const hasLink = c.href !== "#";
  const label = ctaLabel(c.ageGroup, c.live, hasLink);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "0 0 280px",
        scrollSnapAlign: "start",
        background: WHITE,
        borderRadius: cardCornerRadius,
        border: `1px solid ${BORDER}`,
        boxShadow: lifted ? "0 12px 40px rgba(0,0,0,0.1)" : "0 1px 3px rgba(0,0,0,0.04)",
        transform: lifted ? "translateY(-6px)" : "none",
        transition: "transform .3s cubic-bezier(0.16,1,0.3,1), box-shadow .3s cubic-bezier(0.16,1,0.3,1)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        willChange: "transform",
      }}
    >
      {/* Image header (with gradient fallback) */}
      <div style={{
        height: 180, position: "relative", overflow: "hidden",
        borderRadius: `${cardCornerRadius}px ${cardCornerRadius}px 0 0`,
        background: `linear-gradient(135deg,${c.gradient[0]},${c.gradient[1]})`,
      }}>
        {!imgError && (
          <img
            src={c.image}
            alt={c.title}
            width={400}
            height={300}
            loading="lazy"
            onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        )}
        {imgError && (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", opacity: 0.7 }}>
            <Ico name={c.icon} size={56} color="#ffffff" sw={1.5} />
          </div>
        )}
        {c.live && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            display: "flex", alignItems: "center", gap: 6,
            padding: "4px 10px", borderRadius: 100,
            background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
            fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: ".06em",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
            LIVE
          </div>
        )}
        {c.coming && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            padding: "4px 10px", borderRadius: 100,
            background: "rgba(255,255,255,0.92)", backdropFilter: "blur(8px)",
            fontSize: 10, fontWeight: 700, color: AMBER, letterSpacing: ".06em",
          }}>
            {c.coming}
          </div>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <h3 className="dsp" style={{ fontSize: titleSize, fontWeight: 700, color: HEADING, lineHeight: 1.3 }}>
          {c.title}
        </h3>
        <span style={{
          alignSelf: "flex-start",
          display: "inline-block", padding: "3px 10px", borderRadius: 100,
          fontSize: 12, fontWeight: 700, letterSpacing: ".02em",
          color: c.ageColor, background: `${c.ageColor}1a`,
        }}>
          {c.ageRange}
        </span>
        <p style={{ color: BODY, fontSize: 14, lineHeight: 1.6, flex: 1 }}>{c.desc}</p>
        <p className="mono" style={{ fontSize: 12, color: MUTED }}>{c.duration}</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: HEADING }}>{c.price}</p>
        {c.extra && (
          <p style={{ fontSize: 11, fontWeight: 700, color: PINK, letterSpacing: ".02em" }}>{c.extra}</p>
        )}
        {c.live ? (
          <Link href={c.href} style={{
            marginTop: 4,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: `linear-gradient(135deg,${BLUE},#2563eb)`, color: "#fff",
            fontSize: 14, fontWeight: 700, padding: "11px 20px",
            borderRadius: isKids ? 100 : 100,
            textDecoration: "none", boxShadow: `0 4px 14px ${BLUE}30`,
          }}>
            {label} <Ico name="arrow" size={14} sw={2.5} />
          </Link>
        ) : hasLink ? (
          <Link href={c.href} style={{
            marginTop: 4,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "#f1f5f9", color: BODY,
            fontSize: 14, fontWeight: 600, padding: "11px 20px", borderRadius: 100,
            textDecoration: "none",
          }}>
            {label} <Ico name="arrow" size={14} color={BODY} sw={2.5} />
          </Link>
        ) : (
          <span style={{
            marginTop: 4,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "#f1f5f9", color: MUTED,
            fontSize: 14, fontWeight: 600, padding: "11px 20px", borderRadius: 100,
            cursor: "not-allowed",
          }}>
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─────────────── CSS ─────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*{font-family:'DM Sans',sans-serif;box-sizing:border-box;margin:0;padding:0}
body{background:${WHITE}}
h1,h2,h3,h4,.dsp{font-family:'Space Grotesk',sans-serif;letter-spacing:-0.02em}
.mono{font-family:'JetBrains Mono',monospace}
html{scroll-behavior:smooth}
a,button{cursor:pointer}

@property --angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes axRotateGrad{to{--angle:360deg}}
@keyframes chevronBounce{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(6px);opacity:.9}}

@keyframes meshOrbit1{0%,100%{transform:translate(0,0)}50%{transform:translate(150px,80px)}}
@keyframes meshOrbit2{0%,100%{transform:translate(0,0)}50%{transform:translate(-120px,-100px)}}
@keyframes meshOrbit3{0%,100%{transform:translate(0,0)}50%{transform:translate(-100px,60px)}}
@keyframes meshOrbit4{0%,100%{transform:translate(0,0)}50%{transform:translate(80px,-120px)}}
@keyframes meshOrbit5{0%,100%{transform:scale(1)}50%{transform:scale(1.3)}}

.ax-course-row{
  display:flex;gap:20px;
  overflow-x:auto;overflow-y:hidden;
  scroll-snap-type:x mandatory;
  -webkit-overflow-scrolling:touch;
  padding-bottom:8px;padding-top:4px;
  scrollbar-width:thin;scrollbar-color:#cbd5e1 transparent;
}
.ax-course-row::-webkit-scrollbar{height:6px}
.ax-course-row::-webkit-scrollbar-track{background:transparent}
.ax-course-row::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}
@media(min-width:1100px){
  .ax-course-row{overflow-x:visible;flex-wrap:wrap;justify-content:center}
  .ax-course-row>*{flex:1 1 260px;max-width:300px}
}

.ax-tab-row{
  display:flex;gap:10px;justify-content:center;flex-wrap:wrap;
}
@media(max-width:768px){
  .ax-tab-row{flex-wrap:nowrap;overflow-x:auto;justify-content:flex-start;padding:4px;-webkit-overflow-scrolling:touch;scrollbar-width:none}
  .ax-tab-row::-webkit-scrollbar{display:none}
}

.ax-logo-img{
  filter:grayscale(0.3) opacity(0.8);
  transition:filter .3s ease;
}
.ax-logo-img:hover{filter:grayscale(0) opacity(1)}

@media(max-width:768px){
  .ax-hero-ctas{flex-direction:column;align-items:center}
  .ax-stats-row{grid-template-columns:1fr!important}
  .ax-steps{flex-direction:column!important;gap:32px!important;align-items:flex-start!important}
  .ax-steps-line-h{display:none!important}
  .ax-testimonials{grid-template-columns:1fr!important}
  .ax-footer-grid{grid-template-columns:1fr!important;text-align:center}
  .ax-nav-links a:not(:last-child){display:none}
  .ax-trust-strip{gap:14px!important}
  .ax-subject-info{flex-direction:column!important;align-items:flex-start!important;gap:16px!important}
  .ax-final-ctas{flex-direction:column;align-items:stretch}
}
`;

/* ═══════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════ */
export default function AlgorithmXHome() {
  const [scrolled, setScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const stepsRef = useRef<HTMLDivElement>(null);
  const [stepsInView, setStepsInView] = useState(false);

  const underlineRef = useRef<HTMLDivElement>(null);
  const underlineInView = useInView(underlineRef, { once: true, amount: 0.5 });

  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const headlineWords = "Technology Skills for Every Stage of Life".split(" ");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!stepsRef.current) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setStepsInView(true);
            obs.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    obs.observe(stepsRef.current);
    return () => obs.disconnect();
  }, []);

  const activeSubject = SUBJECTS[activeTab];

  return (
    <SmoothScroll>
      <div style={{ background: WHITE, minHeight: "100vh", color: HEADING, overflowX: "hidden" }}>
        <style>{CSS}</style>

        <FuturisticBackground />

        {/* ═══ 1. NAV ═══ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(20px) saturate(1.8)", WebkitBackdropFilter: "blur(20px) saturate(1.8)",
          borderBottom: `1px solid ${BORDER}`,
          boxShadow: scrolled ? "0 1px 8px rgba(0,0,0,0.06)" : "none",
          transition: "box-shadow .25s ease",
        }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg,${BLUE},${GREEN})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Ico name="shield" size={18} sw={2.5} />
              </div>
              <span className="dsp" style={{ fontSize: 20, fontWeight: 700, color: HEADING }}>Algorithm<span style={{ color: BLUE }}>X</span></span>
            </Link>
            <div className="ax-nav-links" style={{ display: "flex", alignItems: "center", gap: 28 }}>
              <a href="#subjects" style={{ color: BODY, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Subjects</a>
              <a href="#how" style={{ color: BODY, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>How It Works</a>
              <Link href="/login" style={{ color: BODY, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Log In</Link>
              <Link href="/cyberheroes" style={{
                background: `linear-gradient(135deg,${BLUE},#2563eb)`, color: "#fff",
                fontSize: 13, fontWeight: 700, padding: "9px 22px", borderRadius: 100,
                textDecoration: "none", boxShadow: `0 4px 14px ${BLUE}30`,
              }}>Get Started</Link>
            </div>
          </div>
        </nav>

        {/* ═══ 2. HERO ═══ */}
        <section ref={heroRef} style={{ position: "relative", zIndex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", padding: "120px 24px 80px", maxWidth: 960, margin: "0 auto" }}>
          <motion.p
            initial={{ opacity: 0 }}
            animate={heroInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="mono"
            style={{ fontSize: 13, color: MUTED, marginBottom: 20, letterSpacing: ".03em" }}
          >
            {">_ algorithmx.co.uk"}
          </motion.p>

          <h1 className="dsp" style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 700, lineHeight: 1.06, color: HEADING, marginBottom: 24 }}>
            {headlineWords.map((word, i) => {
              const gradient = word === "Every" || word === "Stage";
              return (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={heroInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.55, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    display: "inline-block",
                    marginRight: i < headlineWords.length - 1 ? "0.3em" : 0,
                    ...(gradient ? {
                      background: `linear-gradient(135deg,${BLUE},${GREEN})`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    } : {}),
                  }}
                >
                  {word}
                </motion.span>
              );
            })}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{ fontSize: 19, color: "#64748b", lineHeight: 1.6, maxWidth: 640, marginBottom: 40 }}
          >
            From online safety for six-year-olds to professional cybersecurity certifications. Interactive courses designed for how YOU learn — whether you&rsquo;re 6 or 26.
          </motion.p>

          <motion.div
            className="ax-hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.1, type: "spring", stiffness: 120, damping: 20 }}
            style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 44, justifyContent: "center" }}
          >
            <a href="#subjects" style={{
              background: `linear-gradient(135deg,${BLUE},#2563eb)`, color: "#fff",
              fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 100,
              textDecoration: "none", boxShadow: `0 4px 16px rgba(59,130,246,0.25)`,
            }}>I&rsquo;m a Parent</a>
            <a href="#subjects" style={{
              color: "#334155", fontSize: 15, fontWeight: 600,
              padding: "14px 32px", borderRadius: 100, textDecoration: "none",
              border: `1.5px solid #cbd5e1`, background: "#fff",
            }}>I Want to Learn</a>
          </motion.div>

          <div className="ax-trust-strip" style={{ display: "flex", justifyContent: "center", gap: 28, flexWrap: "wrap" }}>
            {TRUST_STRIP.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, x: -20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.4 + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#64748b", fontSize: 13, fontWeight: 500 }}
              >
                <Ico name="check" size={14} color={GREEN} sw={2.5} />{t}
              </motion.span>
            ))}
          </div>

          {/* Scroll chevron */}
          <div aria-hidden style={{
            position: "absolute", bottom: 36, left: "50%", transform: "translateX(-50%)",
            animation: "chevronBounce 2s ease-in-out infinite",
            color: MUTED,
          }}>
            <Ico name="chevron" size={22} color={MUTED} sw={2} />
          </div>
        </section>

        {/* ═══ 3. THE PROBLEM — 3 stat cards ═══ */}
        <section style={{ position: "relative", zIndex: 1, background: BG_ALT, padding: "120px 24px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <div className="ax-stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
              {[
                { value: 72, prefix: "", suffix: "%", color: RED, label: "of children encounter online threats before age 10" },
                { value: 93, prefix: "", suffix: "%", color: BLUE, label: "of UK employers say cybersecurity skills are now essential" },
                { value: 65, prefix: "£", suffix: "K", color: GREEN, label: "average UK cybersecurity salary in 2026" },
              ].map((stat, i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div style={{
                    background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
                    padding: 32, textAlign: "center", overflow: "hidden",
                    position: "relative", height: "100%",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: stat.color }} />
                    <p className="dsp" style={{ fontSize: 72, fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                      {stat.prefix}<Counter to={stat.value} duration={2000} />{stat.suffix}
                    </p>
                    <p style={{ color: BODY, fontSize: 15, lineHeight: 1.6, marginTop: 14, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
                      {stat.label}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>

            <div ref={underlineRef} style={{ textAlign: "center", marginTop: 72 }}>
              <p className="dsp" style={{ fontSize: 20, fontWeight: 700, color: HEADING, display: "inline-block", position: "relative", maxWidth: 720, lineHeight: 1.5 }}>
                Whether you&rsquo;re protecting your child or building your career — AlgorithmX has the right course.
                <span style={{
                  position: "absolute", bottom: -6, left: 0, height: 2,
                  background: `linear-gradient(90deg,${BLUE},${GREEN})`,
                  borderRadius: 2,
                  width: underlineInView ? "100%" : "0%",
                  transition: "width 0.8s cubic-bezier(0.16,1,0.3,1)",
                }} />
              </p>
            </div>
          </div>
        </section>

        {/* ═══ 4. SUBJECT SHOWCASE ═══ */}
        <section id="subjects" style={{ position: "relative", zIndex: 1, background: WHITE, padding: "120px 24px", overflow: "hidden" }}>
          <AnimatePresence>
            <motion.div
              key={activeSubject.id + "-wash"}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              aria-hidden
              style={{
                position: "absolute", top: "30%", left: "50%", transform: "translate(-50%,-50%)",
                width: 900, height: 900, borderRadius: "50%",
                background: `radial-gradient(circle,${activeSubject.accent},transparent 65%)`,
                opacity: 0.05, pointerEvents: "none", zIndex: 0,
              }}
            />
          </AnimatePresence>

          <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <FadeUp>
                <h2 className="dsp" style={{ fontSize: "clamp(30px,4vw,40px)", fontWeight: 700, color: HEADING, marginBottom: 14 }}>
                  Explore Our Engineering Fields
                </h2>
              </FadeUp>
              <FadeUp delay={0.1}>
                <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.6, maxWidth: 620, margin: "0 auto" }}>
                  Six streams of technology education. Click a subject to explore its tracks.
                </p>
              </FadeUp>
            </div>

            <FadeUp delay={0.15}>
              <div className="ax-tab-row" style={{ marginBottom: 40 }}>
                {SUBJECTS.map((s, i) => {
                  const active = i === activeTab;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setActiveTab(i)}
                      style={{
                        border: active ? `1px solid ${s.accent}` : `1px solid ${BORDER}`,
                        background: active ? s.accent : "#f1f5f9",
                        color: active ? "#fff" : BODY,
                        padding: "10px 24px", borderRadius: 100,
                        fontFamily: "'DM Sans',sans-serif", fontSize: 14, fontWeight: 700,
                        whiteSpace: "nowrap",
                        boxShadow: active ? `0 4px 16px ${s.accent}30` : "none",
                        transition: "background .2s ease, color .2s ease, box-shadow .2s ease",
                      }}
                    >
                      {s.title}
                    </button>
                  );
                })}
              </div>
            </FadeUp>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubject.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="ax-subject-info" style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "24px 28px", marginBottom: 32,
                  background: WHITE, borderRadius: 16, border: `1px solid ${BORDER}`,
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{
                      width: 48, height: 48, borderRadius: 14,
                      background: `${activeSubject.accent}14`, border: `1px solid ${activeSubject.accent}30`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Ico name={activeSubject.icon} size={24} color={activeSubject.accent} />
                    </div>
                    <div>
                      <h3 className="dsp" style={{ fontSize: 28, fontWeight: 700, color: HEADING, lineHeight: 1.1 }}>
                        {activeSubject.title}
                      </h3>
                      <p className="mono" style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
                        {activeSubject.ages} · {activeSubject.courses.length} {activeSubject.courses.length === 1 ? "Track" : "Tracks"}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 14px", borderRadius: 100,
                    fontSize: 11, fontWeight: 700, letterSpacing: ".06em",
                    color: activeSubject.statusColor,
                    background: `${activeSubject.statusColor}14`,
                    border: `1px solid ${activeSubject.statusColor}30`,
                  }}>
                    {activeSubject.status === "AVAILABLE NOW" && <span style={{ width: 6, height: 6, borderRadius: "50%", background: activeSubject.statusColor }} />}
                    {activeSubject.status}
                  </span>
                </div>

                <div className="ax-course-row">
                  {activeSubject.courses.map((c) => (
                    <CourseCard key={c.title} c={c} />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </section>

        {/* ═══ 5. HOW IT WORKS ═══ */}
        <section id="how" style={{ position: "relative", zIndex: 1, background: BG_ALT, padding: "140px 24px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1000, margin: "0 auto" }}>
            <FadeUp>
              <h2 className="dsp" style={{ fontSize: "clamp(28px,4vw,36px)", fontWeight: 700, color: HEADING, textAlign: "center", marginBottom: 64 }}>
                How It Works
              </h2>
            </FadeUp>

            <div ref={stepsRef} className="ax-steps" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", gap: 16 }}>
              <div className="ax-steps-line-h" aria-hidden style={{
                position: "absolute", top: 28, left: 28, right: 28, height: 2, zIndex: 0,
                background: "#e2e8f0", borderRadius: 2, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: `linear-gradient(90deg,${BLUE},${GREEN},${ORANGE},${YELLOW})`,
                  width: stepsInView ? "100%" : "0%",
                  transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)",
                }} />
              </div>

              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={stepsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + i * 0.15, type: "spring", stiffness: 180, damping: 15 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flex: 1, position: "relative", zIndex: 1 }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: WHITE, border: `2px solid ${step.accent}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    marginBottom: 16,
                    boxShadow: `0 4px 14px ${step.accent}25`,
                  }}>
                    <span className="dsp" style={{ fontSize: 22, fontWeight: 700, color: step.accent }}>{step.n}</span>
                  </div>
                  <h3 className="dsp" style={{ fontSize: 16, fontWeight: 700, color: HEADING, marginBottom: 6 }}>{step.title}</h3>
                  <p style={{ color: BODY, fontSize: 14, lineHeight: 1.6, maxWidth: 200 }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 6. CREDIBILITY ═══ */}
        <section style={{ position: "relative", zIndex: 1, background: WHITE, padding: "120px 24px" }}>
          <div style={{ maxWidth: 1100, margin: "0 auto" }}>
            <FadeUp>
              <h2 className="dsp" style={{ fontSize: "clamp(28px,4vw,36px)", fontWeight: 700, color: HEADING, textAlign: "center", marginBottom: 56 }}>
                Trusted by Parents, Teachers &amp; Learners
              </h2>
            </FadeUp>

            <div className="ax-testimonials" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 72 }}>
              {TESTIMONIALS.map((t, i) => (
                <FadeUp key={i} delay={i * 0.08}>
                  <div
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow = "0 12px 40px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "none";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                    }}
                    style={{
                      background: WHITE, borderRadius: 16, padding: 28,
                      border: `1px solid ${BORDER}`,
                      borderLeft: t.accent ? `3px solid ${t.accent}` : `1px solid ${BORDER}`,
                      position: "relative", overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      height: "100%",
                      transition: "transform .3s ease, box-shadow .3s ease",
                    }}
                  >
                    <div aria-hidden style={{ position: "absolute", top: 14, left: 20, opacity: 0.08 }}>
                      <Ico name="quote" size={48} color={t.accent || BLUE} sw={1.5} />
                    </div>
                    <p style={{ color: BODY, fontSize: 15, lineHeight: 1.8, marginBottom: 20, position: "relative" }}>
                      &ldquo;{t.text}&rdquo;
                    </p>
                    <p style={{ color: HEADING, fontSize: 14, fontWeight: 700 }}>{t.name}</p>
                    <p style={{ color: MUTED, fontSize: 12 }}>{t.role}</p>
                  </div>
                </FadeUp>
              ))}
            </div>

            <FadeUp>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: MUTED, marginBottom: 28 }}>
                  Trusted &amp; Aligned With
                </p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                  {TRUST_LOGOS.map((t) => (
                    <div key={t.name} title={t.name} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 56 }}>
                      {t.src ? (
                        <img
                          src={t.src}
                          alt={t.name}
                          width={56}
                          height={56}
                          loading="lazy"
                          className="ax-logo-img"
                          style={{ objectFit: "contain" }}
                        />
                      ) : (
                        <div className="ax-logo-img" style={{
                          width: 56, height: 56, borderRadius: "50%",
                          background: "#f1f5f9",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          padding: 6, textAlign: "center",
                        }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: MUTED, lineHeight: 1.15 }}>
                            {t.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ═══ 7. FINAL CTA ═══ */}
        <section style={{ position: "relative", zIndex: 1, background: BG_ALT, padding: "120px 24px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <FadeUp>
              <div style={{
                borderRadius: 24, padding: 2,
                background: `conic-gradient(from var(--angle,0deg),${BLUE},${GREEN},${ORANGE},${YELLOW},${BLUE})`,
                animation: "axRotateGrad 4s linear infinite",
              }}>
                <div style={{
                  background: WHITE, borderRadius: 22, padding: "56px 36px", textAlign: "center",
                }}>
                  <h2 className="dsp" style={{ fontSize: "clamp(30px,4vw,38px)", fontWeight: 700, color: HEADING, marginBottom: 14 }}>
                    Ready to Start?
                  </h2>
                  <p style={{ color: "#64748b", fontSize: 17, lineHeight: 1.7, maxWidth: 460, margin: "0 auto 32px" }}>
                    Choose a subject, pick your level, and begin today.
                  </p>
                  <div className="ax-final-ctas" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
                    <a href="#subjects" style={{
                      background: `linear-gradient(135deg,${BLUE},#2563eb)`, color: "#fff",
                      fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 100,
                      textDecoration: "none", boxShadow: `0 6px 20px ${BLUE}30`,
                    }}>Find a Course for My Child</a>
                    <a href="#subjects" style={{
                      color: "#334155", fontSize: 15, fontWeight: 600,
                      padding: "14px 32px", borderRadius: 100, textDecoration: "none",
                      border: `1.5px solid #cbd5e1`, background: WHITE,
                    }}>I Want to Learn</a>
                  </div>
                  <p style={{ color: MUTED, fontSize: 13 }}>One-time payment · Lifetime access · 30-day guarantee</p>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ═══ 8. FOOTER ═══ */}
        <footer style={{ position: "relative", zIndex: 1, background: "#0f172a", color: "#cbd5e1", padding: "56px 24px 40px" }}>
          <div className="ax-footer-grid" style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 40 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: `linear-gradient(135deg,${BLUE},${GREEN})`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Ico name="shield" size={15} sw={2.5} />
                </div>
                <span className="dsp" style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>Algorithm<span style={{ color: "#60a5fa" }}>X</span></span>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>Technology Skills for Every Stage of Life</p>
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: ".03em", textTransform: "uppercase" }}>Subjects</p>
              {[
                { name: "Cybersecurity", href: "/cyberheroes" },
                { name: "Cyber Explorers", href: "/cyberexplorers" },
                { name: "Game Dev", href: "#" },
                { name: "AI / ML", href: "#" },
                { name: "App Dev", href: "#" },
                { name: "Entrepreneurship", href: "#" },
                { name: "Robotics", href: "#" },
              ].map((l) => (
                <Link key={l.name} href={l.href} style={{ display: "block", color: "#94a3b8", fontSize: 13, textDecoration: "none", marginBottom: 8 }}>{l.name}</Link>
              ))}
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: ".03em", textTransform: "uppercase" }}>Company</p>
              {["About", "For Parents", "For Teens", "Pricing", "Contact"].map((l) => (
                <a key={l} href="#" style={{ display: "block", color: "#94a3b8", fontSize: 13, textDecoration: "none", marginBottom: 8 }}>{l}</a>
              ))}
            </div>
            <div>
              <p style={{ color: "#fff", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: ".03em", textTransform: "uppercase" }}>Legal</p>
              {["Privacy", "Terms", "Cookies", "Safeguarding"].map((l) => (
                <a key={l} href="#" style={{ display: "block", color: "#94a3b8", fontSize: 13, textDecoration: "none", marginBottom: 8 }}>{l}</a>
              ))}
            </div>
          </div>
          <p style={{ color: "#64748b", fontSize: 11, textAlign: "center", marginTop: 40 }}>
            &copy; 2026 AlgorithmX Ltd. Registered in England and Wales.
          </p>
        </footer>
      </div>
    </SmoothScroll>
  );
}
