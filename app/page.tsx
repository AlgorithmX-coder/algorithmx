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
const PURPLE = "#8b5cf6";
const ORANGE = "#f97316";
const YELLOW = "#eab308";
const PINK = "#ec4899";
const AMBER = "#f59e0b";
const RED = "#ef4444";

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
  { name: "BAFTA Games", src: null },
];

function BaftaTrophyIcon() {
  return (
    <svg width={44} height={44} viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 5h12v3c0 4-2 8-6 8s-6-4-6-8z" />
      <path d="M6 6H4a2 2 0 0 0 0 4h2" />
      <path d="M18 6h2a2 2 0 0 1 0 4h-2" />
      <path d="M12 16v4" />
      <path d="M8 21h8" />
    </svg>
  );
}

/* ─────────────── CODE BACKGROUND (preserved) ─────────────── */
const CODE_SNIPPETS = [
  "if (secure) {", "const key = encrypt()", "while (learning)", "return safety;", "async defend()",
  "class CyberHero {", "import { Shield }", "for (let i = 0;", "catch (threat) {", "hash(password)",
  "firewall.enable()", "authenticate(user)", "decrypt(message)", "validate(input)", "scan(network)",
  "const safe = true;", "export default App", "await protect()", "<CyberShield />", "npm run secure",
  "git push origin", "sudo chmod 700", "ping 192.168.1.1", "ssh user@server", "docker build .",
  "python3 train.py", "SELECT * FROM", "CREATE TABLE users", "kubectl apply -f", "terraform init",
];

const CODE_FLOATERS = Array.from({ length: 30 }, (_, i) => ({
  text: CODE_SNIPPETS[i % CODE_SNIPPETS.length],
  left: [4,91,17,63,38,82,11,55,73,28,47,6,86,34,59,21,69,44,78,14,52,93,31,66,8,75,49,23,40,97][i],
  size: [12,11,13,12,11,12,13,11,12,13,11,12,13,11,12,13,11,12,13,11,12,13,11,12,13,11,12,13,11,12][i],
  opacity: [.32,.38,.28,.42,.26,.35,.30,.45,.33,.29,.40,.27,.36,.43,.31,.38,.25,.41,.34,.28,.44,.30,.37,.26,.39,.32,.42,.29,.35,.33][i],
  duration: [42,38,55,47,36,50,41,58,35,44,52,39,46,60,37,49,43,56,40,51,45,38,54,42,48,53,41,57,36,45][i],
  delay: [-12,-38,-5,-27,-45,-18,-33,-8,-50,-22,-60,-3,-30,-15,-55,-9,-41,-20,-48,-26,-7,-53,-14,-35,-58,-11,-40,-24,-47,-2][i],
  rotation: [-5,3,-2,6,-4,1,-7,4,-3,7,0,5,-6,2,-1,8,-5,3,-2,6,-8,1,-4,5,-3,7,-1,4,-6,2][i],
  darker: [false,true,false,false,true,false,false,true,false,false,true,false,false,true,false,false,true,false,false,true,false,false,true,false,false,true,false,false,true,false][i],
}));

const CODE_LINES = [
  { top: "15%", text: "const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);  //  secure transmission protocol v2.1  //  validated: true", duration: 55, delay: 0, opacity: 0.35 },
  { top: "35%", text: "export async function authenticate(user: User): Promise<Session> { const hash = await bcrypt.compare(user.password, stored); return { valid: hash, token: jwt.sign(payload, secret) }; }", duration: 68, delay: -20, opacity: 0.3 },
  { top: "60%", text: "SELECT users.name, certificates.grade FROM users INNER JOIN certificates ON users.id = certificates.user_id WHERE certificates.status = 'PASSED' ORDER BY grade DESC;", duration: 48, delay: -35, opacity: 0.38 },
  { top: "85%", text: "if (threatLevel > THRESHOLD) { await incident.escalate({ severity: 'HIGH', team: 'SOC', timestamp: Date.now() }); firewall.blockIP(source); logger.alert('Breach detected'); }", duration: 62, delay: -12, opacity: 0.32 },
];

function CodeBackground() {
  return (
    <div aria-hidden="true" style={{
      position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
      overflow: "hidden", userSelect: "none",
    }}>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "radial-gradient(circle, #cbd5e1 0.5px, transparent 0.5px)",
        backgroundSize: "32px 32px",
        opacity: 0.15,
        maskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
        WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 50% 40%, black 30%, transparent 80%)",
      }} />
      <div style={{ position: "absolute", top: "10%", left: "8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, #3b82f6, transparent 70%)", opacity: 0.04, animation: "glowDrift1 30s ease-in-out infinite", willChange: "transform" }} />
      <div style={{ position: "absolute", bottom: "8%", right: "6%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, #10b981, transparent 70%)", opacity: 0.03, animation: "glowDrift2 25s ease-in-out infinite", willChange: "transform" }} />
      <div style={{ position: "absolute", top: "40%", left: "50%", width: 350, height: 350, borderRadius: "50%", transform: "translate(-50%,-50%)", background: "radial-gradient(circle, #8b5cf6, transparent 70%)", opacity: 0.02, animation: "glowPulse 20s ease-in-out infinite", willChange: "transform, opacity" }} />
      {CODE_LINES.map((l, i) => (
        <div key={i} className="mono" style={{ position: "absolute", top: l.top, left: 0, fontSize: 11, color: "#e2e8f0", whiteSpace: "nowrap", opacity: l.opacity, animation: `codeScrollLeft ${l.duration}s linear ${l.delay}s infinite`, willChange: "transform" }}>
          {l.text}
        </div>
      ))}
      {CODE_FLOATERS.map((f, i) => (
        <span key={i} aria-hidden="true" className="mono" style={{
          position: "absolute", left: `${f.left}%`, top: 0,
          fontSize: f.size, color: f.darker ? "#94a3b8" : "#cbd5e1",
          opacity: f.opacity, whiteSpace: "nowrap", userSelect: "none", pointerEvents: "none",
          ["--rot" as string]: `${f.rotation}deg`,
          animation: `codeFloatUp ${f.duration}s linear ${f.delay}s infinite`,
          willChange: "transform",
        }}>
          {f.text}
        </span>
      ))}
    </div>
  );
}

/* ─────────────── DATA ─────────────── */
const TRUST_STRIP = ["CyberFirst Aligned", "ASDAN Accredited", "6 Subjects", "Ages 6 to Adult", "UK Designed"];

type Course = {
  title: string;
  ageRange: string;
  ageColor: string;
  desc: string;
  duration: string;
  price: string;
  live: boolean;
  coming?: string;
  gradient: [string, string];
  icon: string;
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
    id: "cybersecurity",
    title: "Cybersecurity",
    icon: "shield",
    accent: GREEN,
    ages: "Ages 6 to Adult",
    status: "AVAILABLE NOW",
    statusColor: GREEN,
    courses: [
      { title: "Cyber Heroes Academy", ageRange: "Ages 6-10", ageColor: GREEN, desc: "Learn cybersecurity through animated adventures with Adam, Layla, and Robo. Story-driven missions make online safety fun and unforgettable.", duration: "20 weeks · 45 min/week", price: "£99 · Lifetime Access", live: true, gradient: ["#d1fae5", "#a7f3d0"], icon: "shield", href: "/cyberheroes" },
      { title: "Cyber Explorers", ageRange: "Ages 11-14", ageColor: PURPLE, desc: "Go deeper into how the internet really works. Phishing simulations, network basics, and your first ethical hacking challenges.", duration: "12 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ede9fe", "#c4b5fd"], icon: "shield", href: "/cyberexplorers" },
      { title: "CyberStart", ageRange: "Ages 15-17", ageColor: ORANGE, desc: "Hands-on CTF challenges, incident response drills, and mock penetration testing. Build a portfolio that proves your skills.", duration: "16 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ffedd5", "#fed7aa"], icon: "shield", href: "#" },
      { title: "CyberStart Pro", ageRange: "Ages 18+", ageColor: YELLOW, desc: "Professional-grade training in penetration testing, security operations, and compliance. Get ready to apply for industry roles.", duration: "20 weeks · 2 hrs/week", price: "£109 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fef9c3", "#fde68a"], icon: "shield", href: "#" },
    ],
  },
  {
    id: "game-dev",
    title: "Game Development",
    icon: "gamepad",
    accent: BLUE,
    ages: "Ages 8 to Adult",
    status: "COMING 2026",
    statusColor: AMBER,
    courses: [
      { title: "Game Starters", ageRange: "Ages 8-10", ageColor: BLUE, desc: "Build your first games with Scratch and block-based coding. Drag, drop, and play your creations.", duration: "10 weeks · 45 min/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#dbeafe", "#bfdbfe"], icon: "gamepad", href: "#" },
      { title: "Game Builders", ageRange: "Ages 11-14", ageColor: BLUE, desc: "Level up to Unity and Roblox Studio. Design real game mechanics, characters, and worlds.", duration: "14 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#bfdbfe", "#93c5fd"], icon: "gamepad", href: "#" },
      { title: "Game Engineers", ageRange: "Ages 15+", ageColor: BLUE, desc: "Unreal Engine, C#, physics engines, and publishing. Ship a real game to a real audience.", duration: "18 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#93c5fd", "#60a5fa"], icon: "gamepad", href: "#" },
    ],
  },
  {
    id: "ai-ml",
    title: "AI & Machine Learning",
    icon: "brain",
    accent: PURPLE,
    ages: "Ages 10 to Adult",
    status: "COMING 2026",
    statusColor: AMBER,
    courses: [
      { title: "AI Discoverers", ageRange: "Ages 10-13", ageColor: PURPLE, desc: "Explore how AI works through interactive playgrounds. Train your first models and understand the ethics.", duration: "10 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ede9fe", "#ddd6fe"], icon: "brain", href: "#" },
      { title: "AI Builders", ageRange: "Ages 14-16", ageColor: PURPLE, desc: "Build real machine learning models with Python. Image recognition, NLP, and data science fundamentals.", duration: "14 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#ddd6fe", "#c4b5fd"], icon: "brain", href: "#" },
      { title: "AI Engineers", ageRange: "Ages 17+", ageColor: PURPLE, desc: "TensorFlow, neural networks, responsible AI, and deployment. Prepare for university-level AI studies.", duration: "18 weeks · 2 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2026", gradient: ["#c4b5fd", "#a78bfa"], icon: "brain", href: "#" },
    ],
  },
  {
    id: "app-dev",
    title: "App Development",
    icon: "phone",
    accent: ORANGE,
    ages: "Ages 10 to Adult",
    status: "COMING 2027",
    statusColor: AMBER,
    courses: [
      { title: "App Starters", ageRange: "Ages 10-13", ageColor: ORANGE, desc: "Design your first app with no-code tools. Wireframes, UX thinking, and bringing ideas to life.", duration: "10 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#ffedd5", "#fed7aa"], icon: "phone", href: "#" },
      { title: "App Developers", ageRange: "Ages 14-16", ageColor: ORANGE, desc: "Build real mobile apps with React Native. From idea to working prototype on your phone.", duration: "14 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fed7aa", "#fdba74"], icon: "phone", href: "#" },
      { title: "Full-Stack Developers", ageRange: "Ages 17+", ageColor: ORANGE, desc: "React, Node.js, databases, APIs, and deployment. Ship production-ready applications.", duration: "18 weeks · 2 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fdba74", "#fb923c"], icon: "phone", href: "#" },
    ],
  },
  {
    id: "entrepreneurship",
    title: "Tech Entrepreneurship",
    icon: "rocket",
    accent: YELLOW,
    ages: "Ages 14 to Adult",
    status: "COMING 2027",
    statusColor: AMBER,
    courses: [
      { title: "Startup Foundations", ageRange: "Ages 14-16", ageColor: YELLOW, desc: "Turn your ideas into real products. Lean startup thinking, customer research, and your first pitch deck.", duration: "12 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fef9c3", "#fde68a"], icon: "rocket", href: "#" },
      { title: "Venture Builder", ageRange: "Ages 17+", ageColor: YELLOW, desc: "Financial modelling, go-to-market strategy, fundraising, and building a real tech company.", duration: "16 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fde68a", "#fcd34d"], icon: "rocket", href: "#" },
    ],
  },
  {
    id: "robotics",
    title: "Robotic Engineering",
    icon: "cpu",
    accent: PINK,
    ages: "Ages 8 to Adult",
    status: "COMING 2027",
    statusColor: AMBER,
    courses: [
      { title: "Robot Explorers", ageRange: "Ages 8-10", ageColor: PINK, desc: "Build your first robot with Lego Mindstorms. Sensors, motors, and simple programming through play.", duration: "10 weeks · 1 hr/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fce7f3", "#fbcfe8"], icon: "cpu", href: "#" },
      { title: "Robot Builders", ageRange: "Ages 11-14", ageColor: PINK, desc: "Arduino, sensors, and circuit design. Program real hardware to interact with the physical world.", duration: "14 weeks · 1.5 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#fbcfe8", "#f9a8d4"], icon: "cpu", href: "#" },
      { title: "Robot Engineers", ageRange: "Ages 15+", ageColor: PINK, desc: "ROS, autonomous systems, computer vision, and advanced microcontrollers. Engineering-grade robotics.", duration: "18 weeks · 2 hrs/week", price: "£99 · Lifetime Access", live: false, coming: "COMING 2027", gradient: ["#f9a8d4", "#f472b6"], icon: "cpu", href: "#", extra: "UK Only · Kit Included" },
    ],
  },
];

const STEPS = [
  { n: 1, title: "Choose a Subject", desc: "Browse six streams of technology education", accent: BLUE, icon: "grid" },
  { n: 2, title: "Pick Your Track", desc: "Select the age-appropriate course within that subject", accent: GREEN, icon: "layers" },
  { n: 3, title: "Enrol — £99", desc: "One-time payment — no subscriptions, no hidden fees", accent: ORANGE, icon: "card" },
  { n: 4, title: "Learn & Certify", desc: "Complete missions at your pace and earn accredited certificates", accent: YELLOW, icon: "trophy" },
];

const TESTIMONIALS = [
  { text: "My daughter absolutely loves it. She talks about Adam and Layla like they\u2019re her best friends, and she\u2019s already teaching ME about password safety.", name: "Sarah T.", role: "London" },
  { text: "Finally, a course that actually engages kids. The interactive missions are brilliant \u2014 my son doesn\u2019t even realise he\u2019s learning.", name: "James P.", role: "Manchester" },
  { text: "As a teacher, I recommend this to every parent. It covers everything the curriculum misses about online safety, and the kids genuinely enjoy it.", name: "Mrs. K. Williams", role: "Year 4 Teacher" },
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
  grid: "M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z",
  layers: "M12 2L2 7l10 5 10-5zM2 17l10 5 10-5M2 12l10 5 10-5",
  card: "M3 10h18M7 15h3",
  trophy: "M8 21h8M12 17v4M7 4h10v5a5 5 0 01-10 0zM7 6H4a2 2 0 000 4h3M17 6h3a2 2 0 010 4h-3",
};
const ICON_RECTS: Record<string, [number, number, number, number, number]> = {
  gamepad: [2, 6, 20, 12, 2],
  cpu: [6, 4, 12, 16, 1],
  phone: [5, 2, 14, 20, 2],
  card: [2, 5, 20, 14, 2],
  grid: [0, 0, 0, 0, 0],
};

function Ico({ name, size = 24, color = "#fff", sw = 2 }: { name: string; size?: number; color?: string; sw?: number }) {
  const r = ICON_RECTS[name];
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
      {r && r[2] > 0 && <rect x={r[0]} y={r[1]} width={r[2]} height={r[3]} rx={r[4]} />}
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
function CourseCard({ c }: { c: Course }) {
  const [hover, setHover] = useState(false);
  const lifted = hover && c.live;
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: "0 0 280px",
        scrollSnapAlign: "start",
        background: WHITE,
        borderRadius: 16,
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
      {/* Gradient header */}
      <div style={{
        height: 160, position: "relative", overflow: "hidden",
        background: `linear-gradient(135deg,${c.gradient[0]},${c.gradient[1]})`,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ opacity: 0.75 }}>
          <Ico name={c.icon} size={56} color="#ffffff" sw={1.5} />
        </div>
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
            fontSize: 14, fontWeight: 700, padding: "11px 20px", borderRadius: 100,
            textDecoration: "none", boxShadow: `0 4px 14px ${BLUE}30`,
          }}>
            Explore Course <Ico name="arrow" size={14} sw={2.5} />
          </Link>
        ) : c.href !== "#" ? (
          <Link href={c.href} style={{
            marginTop: 4,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "#f1f5f9", color: BODY,
            fontSize: 14, fontWeight: 600, padding: "11px 20px", borderRadius: 100,
            textDecoration: "none",
          }}>
            Coming Soon <Ico name="arrow" size={14} color={BODY} sw={2.5} />
          </Link>
        ) : (
          <span style={{
            marginTop: 4,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "#f1f5f9", color: MUTED,
            fontSize: 14, fontWeight: 600, padding: "11px 20px", borderRadius: 100,
            cursor: "not-allowed",
          }}>
            Coming Soon
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

@keyframes axMarquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
@property --angle{syntax:'<angle>';initial-value:0deg;inherits:false}
@keyframes axRotateGrad{to{--angle:360deg}}
@keyframes chevronBounce{0%,100%{transform:translateY(0);opacity:.5}50%{transform:translateY(6px);opacity:.9}}

@keyframes codeFloatUp{from{transform:translateY(100vh) rotate(var(--rot))}to{transform:translateY(-20vh) rotate(var(--rot))}}
@keyframes codeScrollLeft{from{transform:translateX(100vw)}to{transform:translateX(-200%)}}
@keyframes glowDrift1{0%,100%{transform:translate(0,0)}50%{transform:translate(120px,40px)}}
@keyframes glowDrift2{0%,100%{transform:translate(0,0)}50%{transform:translate(-100px,-60px)}}
@keyframes glowPulse{0%,100%{transform:scale(1);opacity:.02}50%{transform:scale(1.25);opacity:.04}}

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
  filter:grayscale(0.4) opacity(0.85);
  transition:filter .3s ease;
}
.ax-logo-img:hover{filter:grayscale(0) opacity(1)}

@media(max-width:768px){
  .ax-hero-ctas{flex-direction:column;align-items:center}
  .ax-problem-grid{grid-template-columns:1fr!important;text-align:center;gap:40px!important}
  .ax-steps{flex-direction:column!important;gap:32px!important;align-items:flex-start!important}
  .ax-steps-line-h{display:none!important}
  .ax-testimonials{grid-template-columns:1fr!important}
  .ax-footer-grid{grid-template-columns:1fr!important;text-align:center}
  .ax-nav-links a:not(:last-child){display:none}
  .ax-trust-strip{gap:14px!important}
  .ax-subject-info{flex-direction:column!important;align-items:flex-start!important;gap:16px!important}
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

  const problemRef = useRef<HTMLDivElement>(null);
  const problemInView = useInView(problemRef, { once: true, amount: 0.2 });

  const underlineRef = useRef<HTMLDivElement>(null);
  const underlineInView = useInView(underlineRef, { once: true, amount: 0.5 });

  const heroRef = useRef<HTMLDivElement>(null);
  const heroInView = useInView(heroRef, { once: true });

  const headlineWords = "The Future Starts With What They Learn Today".split(" ");

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

        <CodeBackground />

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

          <h1 className="dsp" style={{ fontSize: "clamp(36px,6vw,68px)", fontWeight: 700, lineHeight: 1.06, color: HEADING, marginBottom: 24 }}>
            {headlineWords.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={heroInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                style={{
                  display: "inline-block",
                  marginRight: i < headlineWords.length - 1 ? "0.3em" : 0,
                  ...(word === "Future" ? {
                    background: `linear-gradient(135deg,${BLUE},${GREEN})`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  } : {}),
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            style={{ fontSize: 20, color: "#64748b", lineHeight: 1.6, maxWidth: 560, marginBottom: 40 }}
          >
            Six subjects. Four age tracks. Interactive lessons that actually stick.
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
            }}>Explore Subjects</a>
            <a href="#how" style={{
              color: "#334155", fontSize: 15, fontWeight: 600,
              padding: "14px 32px", borderRadius: 100, textDecoration: "none",
              border: `1.5px solid #cbd5e1`, background: "#fff",
            }}>How It Works</a>
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

        {/* ═══ 3. THE PROBLEM ═══ */}
        <section ref={problemRef} style={{ position: "relative", zIndex: 1, background: BG_ALT, padding: "120px 24px", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1060, margin: "0 auto" }}>
            <div className="ax-problem-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 60, alignItems: "center" }}>
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={problemInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <h2 className="dsp" style={{ fontSize: "clamp(28px,4vw,36px)", fontWeight: 700, color: HEADING, lineHeight: 1.2, marginBottom: 20 }}>
                  The Internet Wasn&rsquo;t Built for Kids
                </h2>
                <p style={{ color: BODY, fontSize: 17, lineHeight: 1.8 }}>
                  72% of children encounter online threats before age 10. Schools can&rsquo;t keep up. Parental controls only go so far. Children need real knowledge and real instincts — taught in a way that actually sticks.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={problemInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                style={{ textAlign: "center" }}
              >
                <p className="dsp" style={{ fontSize: "clamp(80px,12vw,120px)", fontWeight: 700, color: RED, lineHeight: 1 }}>
                  <Counter to={72} duration={2000} />
                  <span style={{ fontSize: "0.5em" }}>%</span>
                </p>
                <p style={{ color: MUTED, fontSize: 14, marginTop: 10 }}>of children face online threats before age 10</p>
              </motion.div>
            </div>

            <div ref={underlineRef} style={{ textAlign: "center", marginTop: 72 }}>
              <p className="dsp" style={{ fontSize: 22, fontWeight: 700, color: HEADING, display: "inline-block", position: "relative" }}>
                That&rsquo;s why we built AlgorithmX.
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
          {/* Accent wash */}
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
            {/* Header */}
            <div style={{ textAlign: "center", marginBottom: 48 }}>
              <FadeUp>
                <h2 className="dsp" style={{ fontSize: "clamp(30px,4vw,40px)", fontWeight: 700, color: HEADING, marginBottom: 14 }}>
                  Explore Our Subjects
                </h2>
              </FadeUp>
              <FadeUp delay={0.1}>
                <p style={{ fontSize: 17, color: "#64748b", lineHeight: 1.6, maxWidth: 620, margin: "0 auto" }}>
                  Six streams of technology education. Click a subject to explore its tracks.
                </p>
              </FadeUp>
            </div>

            {/* Tabs */}
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

            {/* Subject content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSubject.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Subject info bar */}
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

                {/* Course cards */}
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
              {/* Connecting line */}
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
                Trusted by Parents &amp; Teachers
              </h2>
            </FadeUp>

            <div className="ax-testimonials" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 72 }}>
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
                      border: `1px solid ${BORDER}`, position: "relative", overflow: "hidden",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      height: "100%",
                      transition: "transform .3s ease, box-shadow .3s ease",
                    }}
                  >
                    <div aria-hidden style={{ position: "absolute", top: 14, left: 20, opacity: 0.08 }}>
                      <Ico name="quote" size={48} color={BLUE} sw={1.5} />
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

            {/* Trust logos */}
            <FadeUp>
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: ".14em", textTransform: "uppercase", color: MUTED, marginBottom: 28 }}>
                  Curriculum Aligned With
                </p>
                <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
                  {TRUST_LOGOS.map((t) => (
                    <div key={t.name} title={t.name} style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 48 }}>
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
                        <div className="ax-logo-img" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <BaftaTrophyIcon />
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
                    Choose a subject, pick your track, and begin today.
                  </p>
                  <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 20 }}>
                    <Link href="/cyberheroes" style={{
                      background: `linear-gradient(135deg,${BLUE},#2563eb)`, color: "#fff",
                      fontSize: 15, fontWeight: 700, padding: "14px 32px", borderRadius: 100,
                      textDecoration: "none", boxShadow: `0 6px 20px ${BLUE}30`,
                    }}>Start with Cyber Heroes — Ages 6-10</Link>
                    <a href="#subjects" style={{
                      color: "#334155", fontSize: 15, fontWeight: 600,
                      padding: "14px 32px", borderRadius: 100, textDecoration: "none",
                      border: `1.5px solid #cbd5e1`, background: WHITE,
                    }}>Explore All Subjects</a>
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
              <p style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6, maxWidth: 260 }}>Technology Education for the Next Generation</p>
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
              {["About", "For Parents", "Pricing", "Contact"].map((l) => (
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
