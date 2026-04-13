"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

/* ─── ANIMATED COUNTER ─── */
function Counter({ to, suffix = "", label }: { to: number | string; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  const isNum = typeof to === "number";
  useEffect(() => {
    if (!inView || !isNum) return;
    let frame: number;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / 2000, 1);
      setVal(Math.round((1 - Math.pow(1 - t, 3)) * (to as number)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to, isNum]);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1.5 flex-1 min-w-[100px] py-4">
      <span className="font-black text-white" style={{ fontSize: "clamp(36px, 5vw, 48px)" }}>{isNum ? val : to}{suffix}</span>
      <span className="font-semibold text-white/80" style={{ fontSize: 13, letterSpacing: "0.05em" }}>{label}</span>
    </div>
  );
}

/* ─── SCROLL REVEAL ─── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}>
      {children}
    </motion.div>
  );
}

/* ─── DATA ─── */
const SUBJECTS = [
  {
    emoji: "🛡️", title: "Cybersecurity", ages: "Ages 6 to Adult", tracks: "4 Tracks",
    accent: "#7c3aed", gradient: "from-purple-600 to-violet-600",
    desc: "From password safety for kids to professional threat analysis. Interactive simulations, CTF challenges, and accredited learning paths.",
    badge: "AVAILABLE NOW", badgeColor: "bg-green-50 text-green-700 border-green-200",
    link: "/cyberheroes", linkText: "Explore Courses →", linkColor: "text-purple-600",
    img: "/characters/adam-layla-happy.png",
  },
  {
    emoji: "🎮", title: "Game Development", ages: "Ages 8 to Adult", tracks: "Coming Soon",
    accent: "#2563eb", gradient: "from-blue-600 to-sky-500",
    desc: "Learn to build games with Scratch, Roblox Studio, and Unity. From simple 2D games to full 3D worlds.",
    badge: "COMING 2026", badgeColor: "bg-gray-50 text-gray-500 border-gray-200",
    link: "#", linkText: "Join Waitlist →", linkColor: "text-gray-400", img: null,
  },
  {
    emoji: "🤖", title: "AI & Machine Learning", ages: "Ages 10 to Adult", tracks: "Coming Soon",
    accent: "#059669", gradient: "from-emerald-600 to-green-500",
    desc: "Understand how AI works, build chatbots, train models, and explore the technology shaping the future.",
    badge: "COMING 2026", badgeColor: "bg-gray-50 text-gray-500 border-gray-200",
    link: "#", linkText: "Join Waitlist →", linkColor: "text-gray-400", img: null,
  },
  {
    emoji: "📱", title: "App Development", ages: "Ages 10 to Adult", tracks: "Coming Soon",
    accent: "#db2777", gradient: "from-pink-600 to-rose-500",
    desc: "Design and build real mobile apps. From wireframing and prototyping to publishing on the App Store.",
    badge: "COMING 2027", badgeColor: "bg-gray-50 text-gray-500 border-gray-200",
    link: "#", linkText: "Join Waitlist →", linkColor: "text-gray-400", img: null,
  },
  {
    emoji: "💡", title: "Tech Entrepreneurship", ages: "Ages 14 to Adult", tracks: "Coming Soon",
    accent: "#d97706", gradient: "from-amber-500 to-orange-500",
    desc: "Turn ideas into startups. Business planning, pitching, branding, and building products from scratch.",
    badge: "COMING 2027", badgeColor: "bg-gray-50 text-gray-500 border-gray-200",
    link: "#", linkText: "Join Waitlist →", linkColor: "text-gray-400", img: null,
  },
  {
    emoji: "🔧", title: "Robotic Engineering", ages: "Ages 8 to Adult", tracks: "Kit Included",
    accent: "#dc2626", gradient: "from-red-600 to-rose-500",
    desc: "Build and program real robots. Physical robotics kits delivered to your door with step-by-step guided courses.",
    badge: "COMING 2027 · UK Only", badgeColor: "bg-gray-50 text-gray-500 border-gray-200",
    link: "#", linkText: "Join Waitlist →", linkColor: "text-gray-400", img: null,
    note: "📦 Includes robotics kit. UK delivery only",
  },
];

const HERO_ICONS = [
  { emoji: "🛡️", label: "Cybersecurity", color: "#7c3aed", rotate: -6, x: 0, y: 0 },
  { emoji: "🎮", label: "Game Dev", color: "#2563eb", rotate: 4, x: 90, y: -20 },
  { emoji: "🤖", label: "AI & ML", color: "#059669", rotate: -3, x: 180, y: 10 },
  { emoji: "📱", label: "App Dev", color: "#db2777", rotate: 5, x: 20, y: 90 },
  { emoji: "💡", label: "Startups", color: "#d97706", rotate: -4, x: 110, y: 80 },
  { emoji: "🔧", label: "Robotics", color: "#dc2626", rotate: 3, x: 190, y: 100 },
];

const STEPS = [
  { icon: "📚", color: "#7c3aed", title: "Choose a Subject", desc: "Pick from cybersecurity, game development, AI, and more." },
  { icon: "🎯", color: "#2563eb", title: "Pick Your Level", desc: "Every subject has age-appropriate tracks from ages 6 to adult." },
  { icon: "🎮", color: "#059669", title: "Learn By Doing", desc: "Interactive games, real-world simulations, and hands-on projects. not boring videos." },
  { icon: "🏆", color: "#d97706", title: "Earn Certificates", desc: "Complete courses and earn accredited certificates recognised across the UK." },
];

const FEATURES = [
  { idx: 0, accent: "#6366f1", title: "Built by Experts", desc: "Our curriculum is designed by certified professionals with decades of industry experience. Every lesson is reviewed for accuracy and age-appropriateness." },
  { idx: 1, accent: "#f59e0b", title: "Accreditation Aligned", desc: "Courses built to recognised frameworks including CyberFirst, ASDAN, CompTIA, and more. Real credentials with real value." },
  { idx: 2, accent: "#ec4899", title: "Interactive, Not Passive", desc: "No boring lecture videos. Every lesson features hands-on games, drag-and-drop activities, real-world simulations, and gamified challenges." },
  { idx: 3, accent: "#10b981", title: "Track Progress", desc: "The parent dashboard shows exactly what your child is learning, their scores, and personalised tips to continue the conversation at home." },
];

const TESTIMONIALS = [
  { quote: "AlgorithmX is exactly what we were looking for. Our daughter actually asks to do her lesson every week. The cybersecurity course is brilliant.", name: "Sarah T.", city: "London", stars: 5, accent: "#6366f1" },
  { quote: "I love that I can track my son's progress. He's learning real skills while having fun. Worth every penny.", name: "James M.", city: "Manchester", stars: 5, accent: "#ec4899" },
  { quote: "Finally, a tech education platform that's actually designed for children. The quality is outstanding.", name: "Priya K.", city: "Birmingham", stars: 5, accent: "#f59e0b" },
];

/* ─── STYLED LOGOS ─── */
function LogoText({ name }: { name: string }) {
  switch (name) {
    case "NCSC":
      return <span className="font-black text-base tracking-wide text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5">🛡️ NCSC</span>;
    case "CyberFirst":
      return <span className="text-base text-slate-400 hover:text-slate-600 transition-colors"><span className="font-medium">Cyber</span><span className="font-black">First</span></span>;
    case "ASDAN":
      return <span className="font-bold text-base tracking-widest text-slate-400 hover:text-slate-600 transition-colors">ASDAN</span>;
    case "CompTIA":
      return <span className="text-base text-slate-400 hover:text-slate-600 transition-colors"><span className="font-black">Comp</span><span className="font-bold text-red-400/60">TIA</span></span>;
    case "Unity":
      return <span className="font-black text-base text-slate-500 hover:text-slate-700 transition-colors">Unity</span>;
    case "Unreal Engine":
      return <span className="font-bold italic text-base text-slate-400 hover:text-slate-600 transition-colors">Unreal Engine</span>;
    case "Roblox Education":
      return <span className="font-bold text-base text-slate-400 hover:text-slate-600 transition-colors">Roblox <span className="font-medium">Education</span></span>;
    case "Google AI":
      return (
        <span className="font-bold text-base hover:opacity-80 transition-opacity flex items-center gap-0">
          <span style={{ color: "#4285F4" }}>G</span><span style={{ color: "#EA4335" }}>o</span><span style={{ color: "#FBBC05" }}>o</span><span style={{ color: "#4285F4" }}>g</span><span style={{ color: "#34A853" }}>l</span><span style={{ color: "#EA4335" }}>e</span>
          <span className="text-slate-400 ml-1 font-black">AI</span>
        </span>
      );
    case "Microsoft":
      return (
        <span className="font-semibold text-base text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5">
          <span className="inline-grid grid-cols-2 gap-px" style={{ width: 12, height: 12 }}>
            <span className="bg-red-500/70 rounded-[1px]" /><span className="bg-green-500/70 rounded-[1px]" />
            <span className="bg-blue-500/70 rounded-[1px]" /><span className="bg-yellow-500/70 rounded-[1px]" />
          </span>
          Microsoft
        </span>
      );
    case "Apple":
      return <span className="font-semibold text-base text-slate-400 hover:text-slate-600 transition-colors"> Apple</span>;
    case "AWS":
      return <span className="font-black text-base text-orange-400/70 hover:text-orange-500 transition-colors">AWS</span>;
    case "IBM":
      return <span className="font-black text-base tracking-[0.2em] text-blue-400/70 hover:text-blue-500 transition-colors">IBM</span>;
    case "BAFTA Games":
      return <span className="font-bold text-base tracking-[0.15em] uppercase text-slate-400 hover:text-slate-600 transition-colors">BAFTA <span className="font-medium normal-case tracking-normal">Games</span></span>;
    case "Raspberry Pi":
      return <span className="font-bold text-base text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1">🍓 Raspberry Pi</span>;
    case "BCS":
      return <span className="font-black text-base tracking-widest uppercase text-slate-400 hover:text-slate-600 transition-colors">BCS</span>;
    case "STEM Learning":
      return <span className="text-base text-slate-400 hover:text-slate-600 transition-colors"><span className="font-black">STEM</span> <span className="font-medium">Learning</span></span>;
    case "Young Enterprise":
      return <span className="font-bold text-base text-slate-400 hover:text-slate-600 transition-colors">Young Enterprise</span>;
    case "Code.org":
      return <span className="text-base text-slate-400 hover:text-slate-600 transition-colors"><span className="font-black">Code</span><span className="font-medium">.org</span></span>;
    case "IET":
      return <span className="font-black text-base tracking-wide text-slate-400 hover:text-slate-600 transition-colors">IET</span>;
    case "Prince's Trust":
      return <span className="font-bold text-base text-slate-400 hover:text-slate-600 transition-colors">Prince&apos;s Trust</span>;
    default:
      return <span className="font-semibold text-base text-slate-400 hover:text-slate-600 transition-colors">{name}</span>;
  }
}

const LOGOS_ROW1 = ["NCSC", "CyberFirst", "ASDAN", "CompTIA", "Unity", "Unreal Engine", "Roblox Education", "Google AI", "Microsoft", "Apple"];
const LOGOS_ROW2 = ["AWS", "IBM", "BAFTA Games", "Raspberry Pi", "BCS", "STEM Learning", "Young Enterprise", "Code.org", "IET", "Prince's Trust"];

/* ─── MARQUEE ─── */
function Marquee({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative overflow-hidden py-2" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
      <div className="flex items-center gap-4 whitespace-nowrap" style={{ animation: `marquee ${reverse ? "45s" : "40s"} linear infinite ${reverse ? "reverse" : ""}`, width: "max-content" }}>
        {doubled.map((logo, i) => (
          <span key={i} className="flex items-center gap-4">
            <span style={{ background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 100, padding: "6px 16px", display: "inline-flex", alignItems: "center" }}>
              <LogoText name={logo} />
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const { scrollY } = useScroll();
  const navShadow = useTransform(scrollY, [0, 50], [0, 1]);
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Nunito, sans-serif", scrollBehavior: "smooth" }}>
      <style>{`
        html { scroll-behavior: smooth; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes heroFloat {
          0%, 100% { transform: perspective(1200px) rotateY(-4deg) rotateX(2deg) translateY(0); }
          50% { transform: perspective(1200px) rotateY(-4deg) rotateX(2deg) translateY(-8px); }
        }
        @keyframes availPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.3); }
          50% { box-shadow: 0 0 12px 2px rgba(22,163,74,0.15); }
        }
        @keyframes gridPulseLP { 0%,100% { opacity: 0.04; } 50% { opacity: 0.08; } }
        @keyframes codeBubbleFloat { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-20px) translateX(8px); } }
        @keyframes dotPulse { 0%,100% { r: 2; } 50% { r: 4; } }
        @keyframes sparkleTwink { 0%,100% { opacity: 0; } 50% { opacity: 0.3; } }
        @keyframes scanLineLP { from { transform: translateY(-100vh); } to { transform: translateY(100vh); } }
        @keyframes subjectFloat { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-10px) rotate(5deg); } }
      `}</style>

      {/* ── ANIMATED TECH BACKGROUND ── */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
        {/* Layer 1: Flowing grid */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
          animation: "gridPulseLP 10s ease-in-out infinite",
        }} />

        {/* Layer 2: Floating code bubbles */}
        {[
          { text: "if(safe)", left: "5%", top: "12%", w: 70, dur: 14 },
          { text: "locked()", left: "82%", top: "25%", w: 75, dur: 16 },
          { text: "encrypt()", left: "15%", top: "45%", w: 80, dur: 18 },
          { text: "shield.on", left: "68%", top: "55%", w: 85, dur: 13 },
          { text: "pass = ****", left: "40%", top: "72%", w: 90, dur: 15 },
          { text: "verify()", left: "90%", top: "40%", w: 65, dur: 20 },
          { text: "protect()", left: "25%", top: "85%", w: 75, dur: 17 },
          { text: "block(ip)", left: "55%", top: "15%", w: 72, dur: 12 },
          { text: "2FA: true", left: "75%", top: "78%", w: 78, dur: 19 },
          { text: "hash(pwd)", left: "8%", top: "65%", w: 82, dur: 16 },
        ].map((b, i) => (
          <div key={`cb-${i}`} style={{
            position: "absolute", left: b.left, top: b.top, width: b.w, height: 24,
            borderRadius: 8, background: "rgba(99,102,241,0.04)", border: "1px solid rgba(99,102,241,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "monospace", fontSize: 10, color: "rgba(99,102,241,0.15)",
            animation: `codeBubbleFloat ${b.dur}s ease-in-out infinite`,
            animationDelay: `${i * -2}s`,
          }}>{b.text}</div>
        ))}

        {/* Layer 3: Connected dots network */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          {[
            [8,12], [22,28], [45,8], [72,18], [88,32], [15,52], [38,45], [62,55],
            [82,62], [50,78], [25,72], [68,82], [92,48], [35,22], [55,35],
          ].map(([x,y], i) => (
            <circle key={`nd-${i}`} cx={`${x}%`} cy={`${y}%`} r={2} fill="rgba(99,102,241,0.08)">
              {i % 3 === 0 && <animate attributeName="r" values="2;4;2" dur={`${4 + i % 3}s`} repeatCount="indefinite" />}
            </circle>
          ))}
          {[
            [8,12,22,28], [22,28,45,8], [45,8,72,18], [72,18,88,32], [15,52,38,45],
            [38,45,62,55], [62,55,82,62], [50,78,25,72], [25,72,15,52], [68,82,82,62],
            [35,22,55,35], [55,35,62,55], [92,48,88,32], [50,78,68,82],
          ].map(([x1,y1,x2,y2], i) => (
            <line key={`nl-${i}`} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}
              stroke="rgba(99,102,241,0.04)" strokeWidth={1} />
          ))}
        </svg>

        {/* Layer 4: Gradient blobs */}
        {[
          { left: "-5%", top: "-5%", size: 400, color: "rgba(99,102,241,0.04)", delay: 0 },
          { left: "75%", top: "10%", size: 350, color: "rgba(37,99,235,0.03)", delay: 8 },
          { left: "60%", top: "70%", size: 450, color: "rgba(99,102,241,0.03)", delay: 15 },
          { left: "5%", top: "80%", size: 300, color: "rgba(37,99,235,0.04)", delay: 5 },
        ].map((bl, i) => (
          <motion.div key={`blob-${i}`}
            animate={{ x: [-15, 15, -15], y: [-10, 10, -10] }}
            transition={{ duration: 25 + i * 5, repeat: Infinity, ease: "easeInOut", delay: bl.delay }}
            style={{
              position: "absolute", left: bl.left, top: bl.top,
              width: bl.size, height: bl.size, borderRadius: "50%",
              background: `radial-gradient(circle, ${bl.color}, transparent 70%)`,
              filter: "blur(80px)",
            }}
          />
        ))}

        {/* Layer 5: Sparkle dots */}
        {Array.from({ length: 15 }, (_, i) => (
          <div key={`sp-${i}`} style={{
            position: "absolute",
            left: `${7 + ((i * 41 + 17) % 86)}%`,
            top: `${5 + ((i * 59 + 11) % 88)}%`,
            width: 2, height: 2, borderRadius: "50%", background: "rgba(99,102,241,0.2)",
            animation: `sparkleTwink ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }} />
        ))}

        {/* Layer 6: Scanning line */}
        <div style={{
          position: "absolute", left: 0, width: "100%", height: 1,
          background: "linear-gradient(to right, transparent, rgba(99,102,241,0.1), transparent)",
          animation: "scanLineLP 15s linear infinite",
        }} />

        {/* Layer 7: Floating subject icons */}
        {[
          { icon: "🔒", left: "6%", top: "18%", dur: 14 },
          { icon: "🎮", left: "85%", top: "30%", dur: 12 },
          { icon: "🤖", left: "20%", top: "58%", dur: 16 },
          { icon: "📱", left: "70%", top: "68%", dur: 18 },
          { icon: "💡", left: "45%", top: "82%", dur: 13 },
          { icon: "🔧", left: "55%", top: "10%", dur: 15 },
        ].map((ic, i) => (
          <div key={`si-${i}`} style={{
            position: "absolute", left: ic.left, top: ic.top,
            fontSize: 24, opacity: 0.06,
            animation: `subjectFloat ${ic.dur}s ease-in-out infinite`,
            animationDelay: `${i * -2.5}s`,
          }}>{ic.icon}</div>
        ))}
      </div>

      {/* ── NAV ── */}
      <motion.nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm"
        style={{ boxShadow: useTransform(navShadow, (v) => `0 1px ${v * 8}px rgba(0,0,0,${v * 0.08})`) }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-1.5">
            <span className="text-xl font-black text-gray-900">Algorithm<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">X</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#subjects" className="text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors">Subjects</a>
            <a href="#how-it-works" className="text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors">How It Works</a>
            <a href="#for-parents" className="text-sm font-bold text-gray-500 hover:text-purple-600 transition-colors">For Parents</a>
          </div>
          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-bold text-gray-500 hover:text-gray-800 transition-colors hidden sm:block">Log In</a>
            <a href="/signup" className="px-5 py-2.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-md hover:shadow-lg transition-shadow">Get Started</a>
            <button onClick={() => setMobileMenu(!mobileMenu)} className="md:hidden text-gray-500 text-xl p-1">{mobileMenu ? "✕" : "☰"}</button>
          </div>
        </div>
        {mobileMenu && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="md:hidden border-t border-gray-100 px-6 py-4 flex flex-col gap-3 bg-white">
            <a href="#subjects" className="text-sm font-bold text-gray-600 py-2" onClick={() => setMobileMenu(false)}>Subjects</a>
            <a href="#how-it-works" className="text-sm font-bold text-gray-600 py-2" onClick={() => setMobileMenu(false)}>How It Works</a>
            <a href="#for-parents" className="text-sm font-bold text-gray-600 py-2" onClick={() => setMobileMenu(false)}>For Parents</a>
            <a href="/login" className="text-sm font-bold text-gray-600 py-2">Log In</a>
          </motion.div>
        )}
      </motion.nav>

      {/* ── HERO ── */}
      <section className="pt-32 sm:pt-40 pb-24 sm:pb-32 px-6 relative overflow-hidden">
        {/* Dot grid background */}
        <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#6366f1 0.8px, transparent 0.8px)", backgroundSize: "24px 24px", opacity: 0.03 }} />
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-20 relative">
          <div className="flex-1 text-center lg:text-left">
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="font-extrabold text-gray-900 mb-6" style={{ fontSize: "clamp(40px, 5vw, 56px)", lineHeight: 1.1 }}>
              The future of education<br />
              <span style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>starts with technology</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
              className="text-lg text-gray-500 max-w-xl mx-auto lg:mx-0 mb-8 leading-relaxed">
              Interactive courses in cybersecurity, game development, AI, and more. Designed for ages 6 to adult. Built by experts. Loved by kids.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="flex gap-4 flex-wrap justify-center lg:justify-start mb-6">
              <a href="#subjects" className="px-8 py-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg hover:shadow-xl transition-shadow">Explore Subjects</a>
              <a href="#how-it-works" className="px-8 py-4 rounded-xl font-extrabold text-gray-600 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">How It Works</a>
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.6 }}
              className="flex gap-4 flex-wrap justify-center lg:justify-start text-sm text-gray-400">
              <span><span className="text-green-500">✓</span> Trusted by UK families</span>
              <span><span className="text-green-500">✓</span> Cancel anytime</span>
              <span><span className="text-green-500">✓</span> Ages 6 to adult</span>
            </motion.div>
          </div>
          {/* Product preview mockup */}
          <motion.div className="flex-1 hidden lg:flex justify-center"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, type: "spring", stiffness: 150, damping: 20 }}>
            <div style={{ animation: "heroFloat 6s ease-in-out infinite", borderRadius: 16, boxShadow: "0 25px 50px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)", overflow: "hidden", width: 420, background: "#fff" }}>
              {/* Browser toolbar */}
              <div style={{ background: "#f1f5f9", padding: "10px 14px", display: "flex", alignItems: "center", gap: 6, borderBottom: "1px solid #e2e8f0" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#22c55e" }} />
                <div style={{ flex: 1, marginLeft: 8, background: "#e2e8f0", borderRadius: 6, height: 20, display: "flex", alignItems: "center", paddingLeft: 8 }}>
                  <span style={{ fontSize: 10, color: "#94a3b8" }}>algorithmx.co.uk/lesson</span>
                </div>
              </div>
              {/* Lesson header */}
              <div style={{ background: "#1a1033", padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ color: "#9ca3af", fontSize: 11, fontWeight: 600 }}>Week 1 · Passwords: The Secret Code</span>
                <span style={{ color: "#f59e0b", fontSize: 11, fontWeight: 700 }}>🪙 45</span>
              </div>
              {/* Progress bar */}
              <div style={{ background: "#1a1033", padding: "0 16px 10px" }}>
                <div style={{ height: 5, borderRadius: 99, background: "rgba(255,255,255,0.1)" }}>
                  <div style={{ width: "35%", height: "100%", borderRadius: 99, background: "linear-gradient(90deg, #8b5cf6, #3b82f6)" }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
                  <span style={{ fontSize: 9, color: "#6b7280" }}>Step 3 of 17</span>
                  <span style={{ fontSize: 9, color: "#6b7280" }}>35%</span>
                </div>
              </div>
              {/* Content preview */}
              <div style={{ padding: "20px 16px 24px", background: "#1a1033" }}>
                <div style={{ textAlign: "center", marginBottom: 16 }}>
                  <span style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>What is a Password?</span>
                </div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {["#8b5cf6", "#3b82f6", "#ec4899"].map((c, i) => (
                    <div key={i} style={{ width: 80, height: 48, borderRadius: 12, background: `${c}20`, border: `1px solid ${c}40` }} />
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── LOGO STRIP ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center mb-6" style={{ fontSize: 11, letterSpacing: "0.15em", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase" }}>Curriculum aligned with industry-leading standards</p>
          <Marquee items={LOGOS_ROW1} />
          <Marquee items={LOGOS_ROW2} reverse />
        </div>
      </section>

      {/* ── SUBJECTS ── */}
      <section id="subjects" className="py-24 sm:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Explore our subjects</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Six streams of technology education, each designed with age-appropriate content from beginners to professionals.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUBJECTS.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.a href={s.link}
                  whileHover={{ y: -4, boxShadow: "0 12px 32px rgba(0,0,0,0.08)" }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="block rounded-2xl bg-white border border-gray-100 shadow-sm"
                  style={{ textDecoration: "none", display: "flex", overflow: "hidden" }}>
                  {/* Left accent bar */}
                  <div style={{ width: 4, background: s.accent, borderRadius: "8px 0 0 8px", flexShrink: 0 }} />
                  <div className="p-6 flex-1">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${s.accent}12` }}>
                        {s.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${s.badgeColor}`}
                            style={s.badge === "AVAILABLE NOW" ? { animation: "availPulse 2s ease-in-out infinite" } : undefined}>
                            {s.badge}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-gray-900 text-lg leading-snug">{s.title}</h3>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">{s.ages} · {s.tracks}</p>
                      </div>
                      {s.img && <Image src={s.img} alt="" width={44} height={44} className="rounded-full border-2 border-gray-100 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">{s.desc}</p>
                    {"note" in s && s.note && <p className="text-xs text-gray-400 mb-3">{s.note}</p>}
                    <span className={`text-sm font-extrabold ${s.linkColor}`}>{s.linkText}</span>
                  </div>
                </motion.a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-gray-50 py-24 sm:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">How AlgorithmX Works</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting dashed line */}
            <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-0 border-t-2 border-dashed border-gray-200" style={{ zIndex: 0 }} />
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.12} className="text-center relative">
                <div className="relative mx-auto mb-5 w-14 h-14" style={{ zIndex: 1 }}>
                  {/* Step number badge */}
                  <div style={{ position: "absolute", top: -4, left: -4, width: 20, height: 20, borderRadius: "50%", background: s.color, color: "#fff", fontSize: 10, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>{i + 1}</div>
                  {/* Icon circle */}
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ background: `linear-gradient(135deg, ${s.color}15, ${s.color}08)`, border: `2px solid ${s.color}25` }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={s.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {i === 0 && <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /></>}
                      {i === 1 && <><line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" /><line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" /><line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" /><line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" /></>}
                      {i === 2 && <><polygon points="5 3 19 12 5 21 5 3" /></>}
                      {i === 3 && <><circle cx="12" cy="8" r="7" /><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" /></>}
                    </svg>
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="for-parents" className="py-24 sm:py-32 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">Why families choose AlgorithmX</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="rounded-2xl bg-white h-full flex overflow-hidden"
                  style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)" }}>
                  <div style={{ width: 3, background: f.accent, flexShrink: 0 }} />
                  <div className="p-7 flex-1">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.accent}14` }}>
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={f.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        {f.idx === 0 && <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>}
                        {f.idx === 1 && <><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></>}
                        {f.idx === 2 && <><path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"/></>}
                        {f.idx === 3 && <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>}
                      </svg>
                    </div>
                    <h3 className="text-lg font-extrabold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <Reveal>
        <section className="relative py-20 px-6 md:px-8 overflow-hidden" style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)" }}>
          {/* Subtle pattern */}
          <div className="absolute inset-0" style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 12px)", opacity: 0.5 }} />
          <div className="max-w-5xl mx-auto flex flex-wrap justify-center gap-6 relative" style={{ borderTop: "1px solid rgba(255,255,255,0.15)", borderBottom: "1px solid rgba(255,255,255,0.15)", padding: "32px 0" }}>
            <Counter to={6} label="SUBJECTS" />
            <Counter to={70} suffix="+" label="WEEKS OF CONTENT" />
            <Counter to="6-18+" suffix="" label="AGE RANGE" />
            <Counter to={100} suffix="%" label="INTERACTIVE" />
            <Counter to="UK" suffix="" label="BASED & DESIGNED" />
          </div>
        </section>
      </Reveal>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 sm:py-32 px-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">What families are saying</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="bg-white h-full flex flex-col relative overflow-hidden"
                  style={{ borderRadius: 16, padding: 32, boxShadow: "0 2px 8px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.04)", borderLeft: `3px solid ${t.accent}` }}>
                  {/* Decorative quote */}
                  <span style={{ position: "absolute", top: -10, left: 16, fontSize: 120, color: "#6366f1", opacity: 0.06, fontFamily: "Georgia, serif", lineHeight: 1, pointerEvents: "none" }}>&ldquo;</span>
                  <p className="text-gray-600 text-sm leading-relaxed italic flex-1 relative" style={{ zIndex: 1 }}>{t.quote}</p>
                  <div className="mt-5 flex items-center justify-between relative" style={{ zIndex: 1 }}>
                    <p className="text-xs"><span className="font-bold text-gray-700">{t.name}</span> <span className="text-gray-400">, {t.city}</span></p>
                    <span style={{ color: "#f59e0b", fontSize: 16, letterSpacing: 2 }}>{"★".repeat(t.stars)}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 sm:py-32 px-6 md:px-8">
        <Reveal>
          <div className="max-w-4xl mx-auto rounded-3xl relative overflow-hidden p-10 sm:p-16 text-center"
            style={{ background: "linear-gradient(135deg, #4f46e5, #7c3aed, #6366f1)" }}>
            {/* Animated bg spots */}
            <motion.div animate={{ x: [0, 40, 0], y: [0, -20, 0] }} transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
              className="absolute" style={{ width: 300, height: 300, top: -50, right: -50, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.1), transparent 70%)" }} />
            <motion.div animate={{ x: [0, -30, 0], y: [0, 30, 0] }} transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              className="absolute" style={{ width: 250, height: 250, bottom: -40, left: -40, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.08), transparent 70%)" }} />
            <div className="relative" style={{ zIndex: 1 }}>
              <p className="text-white/80 text-sm mb-3">Trusted by parents across the UK 🇬🇧</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">Start your child&apos;s tech journey today</h2>
              <p className="text-purple-200 text-lg mb-8 max-w-lg mx-auto">Start your child's tech education journey today.</p>
              <motion.a href="/signup"
                whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
                className="inline-block text-gray-900 bg-white font-bold"
                style={{ borderRadius: 14, padding: "16px 40px", fontSize: 18, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", textDecoration: "none" }}>
                Get Started Now →
              </motion.a>
              <motion.p animate={{ opacity: [0.7, 1, 0.7] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-white/60 text-sm mt-6">Join 500+ UK families learning with AlgorithmX</motion.p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white pt-20 pb-10 px-6 md:px-8" style={{ borderTop: "1px solid #e5e7eb" }}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Col 1 */}
            <div>
              <span className="text-lg font-black text-gray-900 block mb-3">Algorithm<span style={{ background: "linear-gradient(135deg, #7c3aed, #2563eb)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>X</span></span>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">The UK&apos;s interactive tech education platform for ages 6 to adult.</p>
              <p className="text-xs text-gray-400">Made with <span style={{ color: "#ef4444" }}>❤</span> in the United Kingdom 🇬🇧</p>
            </div>
            {/* Col 2 */}
            <div>
              <h4 className="text-sm font-black text-gray-900 mb-4">Subjects</h4>
              <div className="flex flex-col gap-2.5">
                <a href="/cyberheroes" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Cybersecurity</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Game Development</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">AI & Machine Learning</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">App Development</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Entrepreneurship</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Robotics</a>
              </div>
            </div>
            {/* Col 3 */}
            <div>
              <h4 className="text-sm font-black text-gray-900 mb-4">Company</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">About Us</a>
                <a href="#for-parents" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">For Parents</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Pricing</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Contact</a>
              </div>
            </div>
            {/* Col 4 */}
            <div>
              <h4 className="text-sm font-black text-gray-900 mb-4">Legal</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Terms of Service</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Cookie Policy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-indigo-500 transition-colors duration-200">Safeguarding</a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-gray-400">&copy; 2026 AlgorithmX Ltd. All rights reserved.</span>
            <span className="text-xs text-gray-400">Registered in England and Wales</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
