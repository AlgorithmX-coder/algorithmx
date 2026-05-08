"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import SmoothScroll from "@/app/components/SmoothScroll";
import { AuroraDawnScene } from "@/app/components/PixarScenes";

/* ─────────────── TOKENS — warm Pixar dusk palette ─────────────── */
const WHITE = "#2a0d2e";        // card surface (was pure white)
const BG_ALT = "#1a0612";       // alt section panel (was off-white)
const BORDER = "rgba(255, 220, 180, 0.28)";
const HEADING = "#fff7e6";      // cream headlines
const BODY = "rgba(255, 233, 200, 0.85)";
const MUTED = "rgba(255, 233, 200, 0.55)";

const BLUE = "#ff9b4a";         // primary brand → gold mid
const GREEN = "#7cc89a";        // secondary → moss
const ORANGE = "#f08e7e";       // coral
const YELLOW = "#ffd58a";       // gold light
const PURPLE = "#a06aff";       // mystic violet (kept)
const PINK = "#f7c1d6";         // blossom
const AMBER = "#ff9b4a";        // gold mid
const RED = "#c4513a";          // ember

/* ─────────────── INLINE ACETERNITY COMPONENTS ─────────────── */

/** BackgroundGradientAnimation — 5 soft-light blobs with slow drift + interactive pointer */
function BackgroundGradientAnimation() {
  const interactiveRef = useRef<HTMLDivElement>(null);
  const [target, setTarget] = useState({ x: 0, y: 0 });
  const cur = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let frame = 0;
    const tick = () => {
      cur.current.x += (target.x - cur.current.x) * 0.08;
      cur.current.y += (target.y - cur.current.y) * 0.08;
      if (interactiveRef.current) {
        interactiveRef.current.style.transform = `translate3d(${cur.current.x}px, ${cur.current.y}px, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target]);

  const onMove = useCallback((e: MouseEvent) => {
    const rect = document.body.getBoundingClientRect();
    setTarget({ x: e.clientX - rect.left - 200, y: e.clientY - rect.top - 200 });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [onMove]);

  const blobStyle = (color: string): React.CSSProperties => ({
    position: "absolute",
    width: "80%",
    height: "80%",
    borderRadius: "50%",
    background: `radial-gradient(circle at center, rgba(${color}, 0.8) 0%, rgba(${color}, 0) 70%)`,
    mixBlendMode: "normal",
    willChange: "transform",
    filter: "blur(80px)",
    pointerEvents: "none",
  });

  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      overflow: "hidden",
      background: `radial-gradient(ellipse at 50% -10%, #4a1a4a 0%, #2a0d2e 35%, #1a0612 70%, #0a0410 100%)`,
    }}>
      {/* Pixar dawn aurora — drifting warm-gold curtains, twinkling stars, ember motes */}
      <AuroraDawnScene />

      <svg style={{ position: "absolute", inset: 0, width: 0, height: 0 }}>
        <defs>
          <filter id="bgGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* Mouse-tracked warm orb */}
      <div style={{ position: "absolute", inset: 0, filter: "url(#bgGoo) blur(40px)", opacity: 0.55 }}>
        <div
          ref={interactiveRef}
          style={{
            ...blobStyle("255, 178, 110"),
            width: 420, height: 420,
            top: 0, left: 0,
            opacity: 0.5,
          }}
        />
      </div>
    </div>
  );
}

/** TextGenerateEffect — words appear with blur→sharp fade, per-word custom styling supported */
function TextGenerateEffect({
  words, highlightWords = [], className, style,
}: {
  words: string;
  highlightWords?: string[];
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true });
  const parts = words.split(" ");
  return (
    <h1 ref={ref} className={className} style={style}>
      {parts.map((word, i) => {
        const highlight = highlightWords.includes(word);
        return (
          <motion.span
            key={i}
            initial={{ opacity: 0, filter: "blur(10px)", y: 12 }}
            animate={inView ? { opacity: 1, filter: "blur(0px)", y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            style={{
              display: "inline-block",
              marginRight: i < parts.length - 1 ? "0.3em" : 0,
              willChange: "opacity, filter, transform",
              ...(highlight
                ? {
                    background: `linear-gradient(135deg,${BLUE},${GREEN})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }
                : {}),
            }}
          >
            {word}
          </motion.span>
        );
      })}
    </h1>
  );
}

/** CardSpotlight — mouse-tracking radial gradient glow */
function CardSpotlight({
  children, accent = BLUE, style, className,
}: {
  children: React.ReactNode;
  accent?: string;
  style?: React.CSSProperties;
  className?: string;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);

  const onMove = useCallback((e: React.MouseEvent) => {
    if (!cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  }, []);

  const accentRgba = (a: number) => {
    const hex = accent.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${a})`;
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={onMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0,
          background: hover
            ? `radial-gradient(500px circle at ${pos.x}px ${pos.y}px, ${accentRgba(0.12)}, transparent 40%)`
            : "transparent",
          transition: "background 0.15s ease",
        }}
      />
      <div style={{ position: "relative", zIndex: 1, width: "100%", height: "100%" }}>{children}</div>
    </div>
  );
}

/** InfiniteMovingCards — CSS marquee with duplicated content */
function InfiniteMovingCards<T>({
  items, renderItem, speed = 50, pauseOnHover = true, itemKey,
}: {
  items: T[];
  renderItem: (item: T, i: number) => React.ReactNode;
  speed?: number;
  pauseOnHover?: boolean;
  itemKey: (item: T, i: number) => string;
}) {
  return (
    <div
      className={pauseOnHover ? "ax-marquee ax-marquee-pause" : "ax-marquee"}
      style={{
        overflow: "hidden",
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div
        style={{
          display: "flex", gap: 20, width: "max-content",
          animation: `axMarquee ${speed}s linear infinite`,
        }}
      >
        {[0, 1].map((dup) => (
          <div key={dup} style={{ display: "flex", gap: 20, paddingRight: 20 }}>
            {items.map((item, i) => (
              <div key={`${dup}-${itemKey(item, i)}`}>{renderItem(item, i)}</div>
            ))}
          </div>
        ))}
      </div>
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
  { name: "Cisco", src: null },
  { name: "EC-Council", src: null },
  { name: "Micro:bit", src: null },
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
      { title: "Cyber Heroes Academy", ageRange: "Ages 6-10", ageGroup: "6-10", ageColor: GREEN, desc: "Join Adam, Layla, and Robo on animated adventures to learn online safety. Story-driven missions make cybersecurity feel like a game.", duration: "20 weeks · 45 min/week", price: "£99 · Lifetime Access", live: true, gradient: ["#d1fae5", "#a7f3d0"], icon: "shield", image: "/images/courses/cyberheroes.png", href: "/cyberheroes" },
      { title: "Cyber Explorers", ageRange: "Ages 11-14", ageGroup: "11-14", ageColor: PURPLE, desc: "Go beyond the basics. Phishing simulations, network fundamentals, and your first ethical hacking challenges.", duration: "12 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ede9fe", "#c4b5fd"], icon: "shield", image: "/images/courses/cyber-explorers.png", href: "/cyberexplorers" },
      { title: "CyberStart", ageRange: "Ages 15-17", ageGroup: "15-17", ageColor: ORANGE, desc: "CTF competitions, incident response drills, and penetration testing. Build a portfolio that gets you noticed.", duration: "16 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ffedd5", "#fed7aa"], icon: "shield", image: "/images/courses/cyberstart.png", href: "/cyberstart" },
      { title: "CyberStart Pro", ageRange: "Ages 18+", ageGroup: "18+", ageColor: YELLOW, desc: "Industry-standard security operations, compliance frameworks, and career preparation. Get certified and get hired.", duration: "20 weeks · 2 hrs/week", price: "£109 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fef9c3", "#fde68a"], icon: "shield", image: "/images/courses/cyberstart-pro.png", href: "/cyberstart-pro" },
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
      { title: "App Starters", ageRange: "Ages 10-13", ageGroup: "11-14", ageColor: ORANGE, desc: "Design your dream app. No-code tools, wireframes, and UX thinking. Bring your ideas to life.", duration: "10 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#ffedd5", "#fed7aa"], icon: "phone", image: "/images/courses/appstarters.png", href: "#" },
      { title: "App Developers", ageRange: "Ages 14-16", ageGroup: "15-17", ageColor: ORANGE, desc: "React Native, real mobile apps, from idea to working prototype, right on your phone.", duration: "14 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fed7aa", "#fdba74"], icon: "phone", image: "/images/courses/appdevelopers.png", href: "#" },
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
  { n: 1, title: "Choose a Subject", desc: "Browse six technology streams", accent: BLUE },
  { n: 2, title: "Pick Your Level", desc: "Find the right course for your age", accent: GREEN },
  { n: 3, title: "Enrol", desc: "One-time payment, instant access", accent: ORANGE },
  { n: 4, title: "Learn & Certify", desc: "Interactive lessons with real credentials", accent: YELLOW },
];

const TESTIMONIALS = [
  { quote: "My daughter absolutely loves it. She talks about Adam and Layla like they\u2019re her best friends, and she\u2019s already teaching ME about password safety.", name: "Sarah T.", title: "Parent, London", accent: BLUE },
  { quote: "Finally, a course that actually engages kids. The interactive missions are brilliant \u2014 my son doesn\u2019t even realise he\u2019s learning.", name: "James P.", title: "Parent, Manchester", accent: GREEN },
  { quote: "As a teacher, I recommend this to every parent. It covers everything the curriculum misses about online safety.", name: "Mrs. K. Williams", title: "Year 4 Teacher", accent: ORANGE },
  { quote: "I built my first penetration test environment at 15. The CTF challenges are genuinely hard \u2014 and I love it. My school doesn\u2019t teach anything like this.", name: "Aisha R.", title: "Age 16, Birmingham", accent: PURPLE },
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
  const inView = useInView(ref, { once: true, amount: 0.3 });
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
  if (!live && hasLink) return ageGroup === "11-14" ? "Start Exploring" : "Coming Soon";
  if (ageGroup === "6-10") return "Start the Adventure";
  if (ageGroup === "11-14") return "Start Exploring";
  if (ageGroup === "15-17") return "Build Your Portfolio";
  return "Launch Your Career";
}

function CourseCard({ c }: { c: Course }) {
  const [imgError, setImgError] = useState(false);
  const hasLink = c.href !== "#";
  const label = ctaLabel(c.ageGroup, c.live, hasLink);

  return (
    <CardSpotlight
      accent={c.ageColor}
      className="ax-course-card"
      style={{
        flex: "0 0 280px",
        scrollSnapAlign: "start",
        background: WHITE,
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        transition: "transform .3s ease, box-shadow .3s ease",
        display: "flex",
        flexDirection: "column",
        willChange: "transform",
      }}
    >
      <div style={{
        height: 180, position: "relative", overflow: "hidden",
        borderRadius: "16px 16px 0 0",
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
            background: "rgba(40, 18, 38, 0.78)", backdropFilter: "blur(12px)",
            fontSize: 10, fontWeight: 700, color: GREEN, letterSpacing: ".06em",
            boxShadow: "0 0 20px rgba(16,185,129,0.15)",
          }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: GREEN }} />
            LIVE
          </div>
        )}
        {c.coming && (
          <div style={{
            position: "absolute", top: 12, right: 12,
            padding: "4px 10px", borderRadius: 100,
            background: "rgba(40, 18, 38, 0.78)", backdropFilter: "blur(12px)",
            fontSize: 10, fontWeight: 700, color: AMBER, letterSpacing: ".06em",
          }}>
            {c.coming}
          </div>
        )}
      </div>

      <div style={{ padding: 20, display: "flex", flexDirection: "column", flex: 1, gap: 10 }}>
        <h3 className="dsp" style={{ fontSize: 18, fontWeight: 700, color: HEADING, lineHeight: 1.3 }}>
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
        <p style={{ color: BODY, fontSize: 14, lineHeight: 1.6, flex: 1, minHeight: 60 }}>{c.desc}</p>
        <p className="mono" style={{ fontSize: 12, color: MUTED }}>{c.duration}</p>
        <p style={{ fontSize: 16, fontWeight: 700, color: HEADING }}>{c.price}</p>
        {c.extra && (
          <p style={{ fontSize: 11, fontWeight: 700, color: PINK, letterSpacing: ".02em", fontStyle: "italic" }}>{c.extra}</p>
        )}
        {c.live ? (
          <Link href={c.href} style={{
            marginTop: 4,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: `linear-gradient(135deg,${BLUE},#2563eb)`, color: "#fff",
            fontSize: 14, fontWeight: 700, padding: "11px 20px", borderRadius: 100,
            textDecoration: "none", boxShadow: `0 4px 14px ${BLUE}30`,
          }}>
            {label} <Ico name="arrow" size={14} sw={2.5} />
          </Link>
        ) : hasLink ? (
          <Link href={c.href} style={{
            marginTop: 4,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: `${c.ageColor}14`, color: c.ageColor,
            fontSize: 14, fontWeight: 600, padding: "11px 20px", borderRadius: 100,
            textDecoration: "none",
          }}>
            {label} <Ico name="arrow" size={14} color={c.ageColor} sw={2.5} />
          </Link>
        ) : (
          <span style={{
            marginTop: 4,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "rgba(255, 220, 180, 0.08)", color: MUTED,
            fontSize: 14, fontWeight: 600, padding: "11px 20px", borderRadius: 100,
            cursor: "not-allowed",
          }}>
            {label}
          </span>
        )}
      </div>
    </CardSpotlight>
  );
}

/* ─────────────── CSS ─────────────── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
*{font-family:'DM Sans',sans-serif;box-sizing:border-box;margin:0;padding:0}
body{background:#1a0612;color:${HEADING}}
h1,h2,h3,h4,.dsp{font-family:'Space Grotesk',sans-serif;letter-spacing:-0.02em}
.mono{font-family:'JetBrains Mono',monospace}
html{scroll-behavior:smooth}
a,button{cursor:pointer}

@property --angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes axRotateGrad{to{--angle:360deg}}
@keyframes axBounce{0%,100%{transform:translate(-50%,0)}50%{transform:translate(-50%,8px)}}
@keyframes axMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}

@keyframes bgMove1{
  0%{transform:translate(0,0);opacity:1}
  33%{transform:translate(30%,-50%);opacity:0.8}
  66%{transform:translate(-20%,20%);opacity:0.9}
  100%{transform:translate(0,0);opacity:1}
}
@keyframes bgMove2{
  0%{transform:rotate(0deg)}
  100%{transform:rotate(360deg)}
}
@keyframes bgMove3{
  0%{transform:rotate(0deg)}
  100%{transform:rotate(360deg)}
}
@keyframes bgMove4{
  0%{transform:rotate(0deg)}
  50%{transform:rotate(180deg) scale(1.1)}
  100%{transform:rotate(360deg)}
}
@keyframes bgMove5{
  0%{transform:rotate(0deg) scale(1)}
  50%{transform:rotate(180deg) scale(1.15)}
  100%{transform:rotate(360deg) scale(1)}
}

.ax-course-card:hover{transform:translateY(-6px);box-shadow:0 12px 40px rgba(0,0,0,0.1)}

.ax-marquee-pause:hover>div{animation-play-state:paused}

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
  filter:grayscale(0.3) opacity(0.7);
  transition:filter .3s ease;
}
.ax-logo-img:hover{filter:grayscale(0) opacity(1)}

@media(max-width:768px){
  .ax-hero-ctas{flex-direction:column;align-items:center}
  .ax-stats-row{grid-template-columns:1fr!important}
  .ax-steps{flex-direction:column!important;gap:24px!important;align-items:stretch!important}
  .ax-steps-line-h{display:none!important}
  .ax-footer-grid{grid-template-columns:1fr!important;text-align:center}
  .ax-nav-links a:not(:last-child),.ax-nav-links a.ax-nav-login{display:none}
  .ax-trust-strip{gap:14px!important}
  .ax-subject-info{flex-direction:column!important;align-items:flex-start!important;gap:16px!important}
  .ax-final-ctas{flex-direction:column;align-items:stretch}
  .ax-footer-bottom{flex-direction:column!important;gap:8px;text-align:center}
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

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
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

        <BackgroundGradientAnimation />

        {/* ═══ 1. NAV ═══ */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
          background: "rgba(26, 6, 18, 0.78)",
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
              <Link className="ax-nav-login" href="/login" style={{ color: BODY, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Log In</Link>
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

          <TextGenerateEffect
            words="Technology Skills for Every Stage of Life"
            highlightWords={["Every", "Stage"]}
            className="dsp"
            style={{ fontSize: "clamp(36px,6vw,64px)", fontWeight: 700, lineHeight: 1.06, color: HEADING, marginBottom: 24, maxWidth: 800 }}
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            style={{ fontSize: 19, color: "#64748b", lineHeight: 1.6, maxWidth: 640, marginBottom: 40 }}
          >
            From online safety for six-year-olds to professional cybersecurity certifications. Interactive courses designed for how YOU learn — whether you&rsquo;re 6 or 26.
          </motion.p>

          <motion.div
            className="ax-hero-ctas"
            initial={{ opacity: 0, y: 20 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1.2, type: "spring", stiffness: 120, damping: 20 }}
            style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 48, justifyContent: "center" }}
          >
            <a href="#subjects" style={{
              background: `linear-gradient(135deg,${BLUE},#2563eb)`, color: "#fff",
              fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 100,
              textDecoration: "none", boxShadow: `0 4px 16px rgba(59,130,246,0.25)`,
            }}>I&rsquo;m a Parent</a>
            <a href="#subjects" style={{
              color: "#334155", fontSize: 15, fontWeight: 600,
              padding: "14px 32px", borderRadius: 100, textDecoration: "none",
              border: `1px solid ${BORDER}`, background: "rgba(40, 18, 38, 0.55)",
            }}>I Want to Learn</a>
          </motion.div>

          <div className="ax-trust-strip" style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap" }}>
            {TRUST_STRIP.map((t, i) => (
              <motion.span
                key={t}
                initial={{ opacity: 0, x: -20 }}
                animate={heroInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 1.5 + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#94a3b8", fontSize: 13, fontWeight: 500 }}
              >
                <span style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: `${GREEN}26`,
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Ico name="check" size={10} color={GREEN} sw={3} />
                </span>
                {t}
              </motion.span>
            ))}
          </div>

          <div aria-hidden style={{
            position: "absolute", bottom: 32, left: "50%",
            animation: "axBounce 2s ease-in-out infinite",
            color: MUTED,
          }}>
            <Ico name="chevron" size={24} color={MUTED} sw={2} />
          </div>
        </section>

        {/* ═══ 3. THE PROBLEM — 3 stat cards ═══ */}
        <section style={{ position: "relative", zIndex: 1, background: BG_ALT, padding: "100px 24px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <div className="ax-stats-row" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
              {[
                { value: 72, prefix: "", suffix: "%", color: RED, label: "of children encounter online threats before age 10" },
                { value: 93, prefix: "", suffix: "%", color: BLUE, label: "of UK employers say cybersecurity skills are now essential" },
                { value: 65, prefix: "£", suffix: "K", color: GREEN, label: "average UK cybersecurity salary in 2026" },
              ].map((stat, i) => (
                <FadeUp key={i} delay={i * 0.1}>
                  <div style={{
                    background: WHITE, borderRadius: 16,
                    border: `1px solid ${BORDER}`,
                    borderTop: `3px solid ${stat.color}`,
                    padding: 32, textAlign: "center",
                    height: "100%",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}>
                    <p className="dsp" style={{ fontSize: 64, fontWeight: 700, color: stat.color, lineHeight: 1 }}>
                      {stat.prefix}<Counter to={stat.value} duration={2000} />{stat.suffix}
                    </p>
                    <p style={{ color: BODY, fontSize: 14, lineHeight: 1.6, marginTop: 14, maxWidth: 280, marginLeft: "auto", marginRight: "auto" }}>
                      {stat.label}
                    </p>
                  </div>
                </FadeUp>
              ))}
            </div>

            <div ref={underlineRef} style={{ textAlign: "center", marginTop: 48 }}>
              <p className="dsp" style={{ fontSize: 20, fontWeight: 700, color: HEADING, display: "inline-block", position: "relative", maxWidth: 700, lineHeight: 1.5 }}>
                Whether you&rsquo;re protecting your child or building your career — AlgorithmX has the right course.
                <span style={{
                  position: "absolute", bottom: -8, left: 0, height: 2,
                  background: `linear-gradient(90deg,${BLUE},${GREEN})`,
                  borderRadius: 2,
                  width: underlineInView ? "100%" : "0%",
                  transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
                }} />
              </p>
            </div>
          </div>
        </section>

        {/* ═══ 4. SUBJECT SHOWCASE ═══ */}
        <section id="subjects" style={{ position: "relative", zIndex: 1, background: WHITE, padding: "100px 24px", overflow: "hidden" }}>
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
                opacity: 0.04, pointerEvents: "none", zIndex: 0,
              }}
            />
          </AnimatePresence>

          <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <FadeUp>
                <h2 className="dsp" style={{ fontSize: "clamp(30px,4vw,40px)", fontWeight: 700, color: HEADING, marginBottom: 12 }}>
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
                        boxShadow: active ? `0 4px 16px ${s.accent}40` : "none",
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
                      background: `${activeSubject.accent}14`, border: `2px solid ${activeSubject.accent}4d`,
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
                    background: `${activeSubject.statusColor}1a`,
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
        <section id="how" style={{ position: "relative", zIndex: 1, background: BG_ALT, padding: "100px 24px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 900, margin: "0 auto" }}>
            <FadeUp>
              <h2 className="dsp" style={{ fontSize: "clamp(28px,4vw,36px)", fontWeight: 700, color: HEADING, textAlign: "center", marginBottom: 56 }}>
                How It Works
              </h2>
            </FadeUp>

            <div ref={stepsRef} className="ax-steps" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", gap: 0 }}>
              <div className="ax-steps-line-h" aria-hidden style={{
                position: "absolute", top: 28, left: 28, right: 28, height: 2, zIndex: 0,
                background: "#e2e8f0", borderRadius: 2, overflow: "hidden",
              }}>
                <div style={{
                  height: "100%", borderRadius: 2,
                  background: `linear-gradient(90deg,${BLUE},${GREEN},${ORANGE},${YELLOW})`,
                  width: stepsInView ? "100%" : "0%",
                  transition: "width 1.5s cubic-bezier(0.16,1,0.3,1)",
                }} />
              </div>

              {STEPS.map((step, i) => (
                <motion.div
                  key={step.n}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={stepsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.2, type: "spring", stiffness: 180, damping: 15 }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: 200, position: "relative", zIndex: 1 }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: "50%",
                    background: WHITE, border: `2px solid ${step.accent}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    boxShadow: `0 4px 16px ${step.accent}40`,
                  }}>
                    <span className="dsp" style={{ fontSize: 20, fontWeight: 700, color: step.accent }}>{step.n}</span>
                  </div>
                  <h3 className="dsp" style={{ fontSize: 15, fontWeight: 700, color: HEADING, marginTop: 16 }}>{step.title}</h3>
                  <p style={{ color: MUTED, fontSize: 13, marginTop: 6 }}>{step.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══ 6. CREDIBILITY ═══ */}
        <section style={{ position: "relative", zIndex: 1, background: WHITE, padding: "100px 24px" }}>
          <FadeUp>
            <h2 className="dsp" style={{ fontSize: "clamp(28px,4vw,36px)", fontWeight: 700, color: HEADING, textAlign: "center", marginBottom: 56 }}>
              Trusted by Parents, Teachers &amp; Learners
            </h2>
          </FadeUp>

          {/* Testimonials marquee */}
          <div style={{ marginBottom: 72 }}>
            <InfiniteMovingCards
              items={TESTIMONIALS}
              speed={60}
              pauseOnHover
              itemKey={(t) => t.name}
              renderItem={(t) => (
                <div style={{
                  width: 360,
                  background: WHITE, borderRadius: 16, padding: 28,
                  border: `1px solid ${BORDER}`,
                  borderLeft: `3px solid ${t.accent}`,
                  position: "relative", overflow: "hidden",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  height: 260,
                  display: "flex", flexDirection: "column",
                }}>
                  <div aria-hidden style={{ position: "absolute", top: 14, left: 20, opacity: 0.08 }}>
                    <Ico name="quote" size={48} color={t.accent} sw={1.5} />
                  </div>
                  <p style={{ color: BODY, fontSize: 15, lineHeight: 1.7, marginBottom: 16, position: "relative", flex: 1 }}>
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <p style={{ color: HEADING, fontSize: 14, fontWeight: 700 }}>{t.name}</p>
                  <p style={{ color: MUTED, fontSize: 12 }}>{t.title}</p>
                </div>
              )}
            />
          </div>

          {/* Trust logos marquee */}
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: MUTED, marginBottom: 28 }}>
              Trusted &amp; Aligned With
            </p>
            <InfiniteMovingCards
              items={TRUST_LOGOS}
              speed={45}
              pauseOnHover
              itemKey={(l) => l.name}
              renderItem={(t) => (
                <div title={t.name} style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 56, minWidth: 64 }}>
                  {t.src ? (
                    <img
                      src={t.src}
                      alt={t.name}
                      width={48}
                      height={48}
                      loading="lazy"
                      className="ax-logo-img"
                      style={{ objectFit: "contain" }}
                    />
                  ) : (
                    <div className="ax-logo-img" style={{
                      height: 48, padding: "0 16px",
                      background: "rgba(255, 220, 180, 0.08)",
                      borderRadius: 8,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      whiteSpace: "nowrap",
                    }}>
                      <span style={{ fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: ".02em" }}>
                        {t.name}
                      </span>
                    </div>
                  )}
                </div>
              )}
            />
          </div>
        </section>

        {/* ═══ 7. FINAL CTA ═══ */}
        <section style={{ position: "relative", zIndex: 1, background: BG_ALT, padding: "100px 24px", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <FadeUp>
              <div style={{
                borderRadius: 24, padding: 2,
                background: `conic-gradient(from var(--angle,0deg),${BLUE},${GREEN},${ORANGE},${YELLOW},${PURPLE},${BLUE})`,
                animation: "axRotateGrad 4s linear infinite",
              }}>
                <div style={{
                  background: WHITE, borderRadius: 22, padding: "56px 36px", textAlign: "center",
                }}>
                  <h2 className="dsp" style={{ fontSize: "clamp(30px,4vw,38px)", fontWeight: 700, color: HEADING, marginBottom: 16 }}>
                    Ready to Start?
                  </h2>
                  <p style={{ color: "#64748b", fontSize: 17, lineHeight: 1.7, maxWidth: 420, margin: "0 auto 32px" }}>
                    Choose a subject, pick your level, and begin today.
                  </p>
                  <div className="ax-final-ctas" style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
                    <a href="#subjects" style={{
                      background: `linear-gradient(135deg,${BLUE},#2563eb)`, color: "#fff",
                      fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 100,
                      textDecoration: "none", boxShadow: `0 6px 20px ${BLUE}30`,
                    }}>Find a Course for My Child</a>
                    <a href="#subjects" style={{
                      color: "#334155", fontSize: 15, fontWeight: 600,
                      padding: "14px 32px", borderRadius: 100, textDecoration: "none",
                      border: `1px solid ${BORDER}`, background: WHITE,
                    }}>I Want to Learn</a>
                  </div>
                  <p style={{ color: MUTED, fontSize: 13 }}>One-time payment · Lifetime access · 30-day guarantee</p>
                  <p style={{ marginTop: 8, fontSize: 13 }}>
                    <a href="mailto:support@algorithmx.co.uk" style={{ color: MUTED, textDecoration: "none" }}>
                      Questions? Email us at support@algorithmx.co.uk
                    </a>
                  </p>
                </div>
              </div>
            </FadeUp>
          </div>
        </section>

        {/* ═══ 8. FOOTER ═══ */}
        <footer style={{ position: "relative", zIndex: 1, background: "rgba(10, 4, 16, 0.85)", color: BODY, padding: "56px 24px 40px", borderTop: `1px solid ${BORDER}`, backdropFilter: "blur(8px)" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto" }}>
            <div className="ax-footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 48 }}>
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
                <p style={{ color: "#64748b", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: ".03em", textTransform: "uppercase" }}>Subjects</p>
                {[
                  { name: "Cybersecurity", href: "/cyberheroes" },
                  { name: "Cyber Explorers", href: "/cyberexplorers" },
                  { name: "Game Dev", href: "#" },
                  { name: "AI / ML", href: "#" },
                  { name: "App Dev", href: "#" },
                  { name: "Entrepreneurship", href: "#" },
                  { name: "Robotics", href: "#" },
                ].map((l) => (
                  <Link key={l.name} href={l.href} style={{ display: "block", color: "#94a3b8", fontSize: 14, textDecoration: "none", marginBottom: 8 }}>{l.name}</Link>
                ))}
              </div>
              <div>
                <p style={{ color: "#64748b", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: ".03em", textTransform: "uppercase" }}>Company</p>
                {[
                  { name: "About", href: "#" },
                  { name: "For Parents", href: "#" },
                  { name: "For Teens", href: "#" },
                  { name: "Pricing", href: "#" },
                  { name: "Contact", href: "mailto:support@algorithmx.co.uk" },
                ].map((l) => (
                  <a key={l.name} href={l.href} style={{ display: "block", color: "#94a3b8", fontSize: 14, textDecoration: "none", marginBottom: 8 }}>{l.name}</a>
                ))}
              </div>
              <div>
                <p style={{ color: "#64748b", fontSize: 13, fontWeight: 700, marginBottom: 14, letterSpacing: ".03em", textTransform: "uppercase" }}>Legal</p>
                {["Privacy", "Terms", "Cookies", "Safeguarding"].map((l) => (
                  <a key={l} href="#" style={{ display: "block", color: "#94a3b8", fontSize: 14, textDecoration: "none", marginBottom: 8 }}>{l}</a>
                ))}
              </div>
            </div>
            <div style={{ height: 1, background: BORDER, margin: "40px 0 24px" }} />
            <div className="ax-footer-bottom" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <a href="mailto:support@algorithmx.co.uk" style={{ color: "#64748b", fontSize: 12, textDecoration: "none" }}>
                support@algorithmx.co.uk
              </a>
              <p style={{ color: "#64748b", fontSize: 11 }}>
                &copy; 2026 AlgorithmX Ltd. Registered in England and Wales.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </SmoothScroll>
  );
}
