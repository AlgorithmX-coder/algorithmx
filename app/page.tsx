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
    <div ref={ref} className="flex flex-col items-center gap-1 flex-1 min-w-[100px] py-6">
      <span className="text-4xl sm:text-5xl font-black text-purple-700">{isNum ? val : to}{suffix}</span>
      <span className="text-sm font-bold text-gray-400">{label}</span>
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
    note: "📦 Includes robotics kit — UK delivery only",
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
  { icon: "🎮", color: "#059669", title: "Learn By Doing", desc: "Interactive games, real-world simulations, and hands-on projects — not boring videos." },
  { icon: "🏆", color: "#d97706", title: "Earn Certificates", desc: "Complete courses and earn accredited certificates recognised across the UK." },
];

const FEATURES = [
  { icon: "👨‍🏫", title: "Built by Experts", desc: "Our curriculum is designed by certified professionals with decades of industry experience. Every lesson is reviewed for accuracy and age-appropriateness." },
  { icon: "🏅", title: "Accreditation Aligned", desc: "Courses built to recognised frameworks including CyberFirst, ASDAN, CompTIA, and more. Real credentials with real value." },
  { icon: "🎯", title: "Interactive, Not Passive", desc: "No boring lecture videos. Every lesson features hands-on games, drag-and-drop activities, real-world simulations, and gamified challenges." },
  { icon: "📊", title: "Track Progress", desc: "The parent dashboard shows exactly what your child is learning, their scores, and personalised tips to continue the conversation at home." },
];

const TESTIMONIALS = [
  { quote: "AlgorithmX is exactly what we were looking for. Our daughter actually asks to do her lesson every week. The cybersecurity course is brilliant.", author: "Sarah T., London", stars: 5 },
  { quote: "I love that I can track my son's progress. He's learning real skills while having fun. Worth every penny.", author: "James M., Manchester", stars: 5 },
  { quote: "Finally, a tech education platform that's actually designed for children. The quality is outstanding.", author: "Priya K., Birmingham", stars: 5 },
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
    <div className="relative overflow-hidden py-3" style={{ maskImage: "linear-gradient(90deg, transparent, black 10%, black 90%, transparent)" }}>
      <div className="flex items-center gap-10 whitespace-nowrap" style={{ animation: `marquee ${reverse ? "45s" : "40s"} linear infinite ${reverse ? "reverse" : ""}`, width: "max-content" }}>
        {doubled.map((logo, i) => (
          <span key={i} className="flex items-center gap-10">
            <LogoText name={logo} />
            <span className="text-gray-200 text-xs">|</span>
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
    <div className="min-h-screen bg-white" style={{ fontFamily: "Nunito, sans-serif" }}>
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

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
            <a href="/signup" className="px-5 py-2.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-md hover:shadow-lg transition-shadow">Start Free</a>
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
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-28 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 200, damping: 25 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-6">
              The future of education<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">starts with technology</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.6 }}
              className="text-lg text-gray-500 max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Interactive courses in cybersecurity, game development, AI, and more. Designed for ages 6 to adult. Built by experts. Loved by kids.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="flex gap-4 flex-wrap justify-center lg:justify-start">
              <a href="#subjects" className="px-8 py-4 rounded-xl font-black text-white bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg hover:shadow-xl transition-shadow">Explore Subjects</a>
              <a href="#how-it-works" className="px-8 py-4 rounded-xl font-black text-gray-600 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all">How It Works</a>
            </motion.div>
          </div>
          {/* Subject icon mosaic */}
          <div className="flex-1 hidden lg:flex justify-center">
            <div className="relative w-[300px] h-[200px]">
              {HERO_ICONS.map((ic, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1, y: [-4, 4, -4] }}
                  transition={{ delay: 0.4 + i * 0.1, type: "spring", stiffness: 200, damping: 15, y: { duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 } }}
                  className="absolute rounded-2xl bg-white shadow-lg border border-gray-100 flex flex-col items-center justify-center gap-1"
                  style={{ width: 80, height: 80, left: ic.x, top: ic.y, rotate: ic.rotate }}>
                  <span className="text-2xl">{ic.emoji}</span>
                  <span className="text-[9px] font-black text-gray-400">{ic.label}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGO STRIP ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-8">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center mb-5">Curriculum aligned with industry-leading standards</p>
          <Marquee items={LOGOS_ROW1} />
          <Marquee items={LOGOS_ROW2} reverse />
        </div>
      </section>

      {/* ── SUBJECTS ── */}
      <section id="subjects" className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Explore our subjects</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">Six streams of technology education, each designed with age-appropriate content from beginners to professionals.</p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SUBJECTS.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <motion.a href={s.link}
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-shadow"
                  style={{ textDecoration: "none" }}>
                  {/* Accent stripe */}
                  <div className={`h-1.5 bg-gradient-to-r ${s.gradient}`} />
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: `${s.accent}10` }}>
                        {s.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black border ${s.badgeColor}`}>{s.badge}</span>
                        </div>
                        <h3 className="font-black text-gray-900 text-lg leading-snug">{s.title}</h3>
                        <p className="text-xs font-bold text-gray-400 mt-0.5">{s.ages} · {s.tracks}</p>
                      </div>
                      {s.img && <Image src={s.img} alt="" width={44} height={44} className="rounded-full border-2 border-gray-100 shrink-0" />}
                    </div>
                    <p className="text-sm text-gray-500 leading-relaxed mb-3">{s.desc}</p>
                    {"note" in s && s.note && <p className="text-xs text-gray-400 mb-3">{s.note}</p>}
                    <span className={`text-sm font-black ${s.linkColor}`}>{s.linkText}</span>
                  </div>
                </motion.a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-gray-50 py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">How AlgorithmX Works</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-gray-200" />
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.12} className="text-center relative">
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl mx-auto mb-4 relative z-10" style={{ background: `${s.color}12`, border: `2px solid ${s.color}30` }}>
                  {s.icon}
                </div>
                <h3 className="text-lg font-black text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="for-parents" className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">Why families choose AlgorithmX</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <div className="rounded-2xl bg-white border border-gray-100 p-7 shadow-sm h-full">
                  <div className="text-3xl mb-4">{f.icon}</div>
                  <h3 className="text-lg font-black text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-gray-50 border-y border-gray-100 py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          <Counter to={6} label="Subjects" />
          <Counter to={70} suffix="+" label="Weeks of Content" />
          <Counter to="6-18+" suffix="" label="Age Range" />
          <Counter to={100} suffix="%" label="Interactive" />
          <Counter to="UK" suffix="" label="Based & Designed" />
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">What families are saying</h2>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="rounded-2xl bg-white border border-gray-100 p-7 shadow-sm h-full flex flex-col">
                  <span className="text-purple-200 text-4xl font-black leading-none mb-3">&ldquo;</span>
                  <p className="text-gray-600 text-sm leading-relaxed italic flex-1">{t.quote}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-gray-400 text-xs font-bold">— {t.author}</p>
                    <span className="text-amber-400 text-xs">{"⭐".repeat(t.stars)}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 px-6">
        <Reveal>
          <div className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-r from-purple-700 to-blue-700 p-10 sm:p-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">Start your child&apos;s tech journey today</h2>
            <p className="text-purple-200 text-lg mb-8 max-w-lg mx-auto">The first cybersecurity lesson is completely free. No credit card needed.</p>
            <a href="/signup" className="inline-block px-10 py-5 rounded-xl font-black text-purple-700 text-lg bg-white hover:bg-purple-50 transition-colors shadow-xl">Get Started Free →</a>
            <p className="text-white/50 text-sm mt-6">Join 500+ UK families learning with AlgorithmX</p>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-white border-t border-gray-200 pt-14 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Col 1 */}
            <div>
              <span className="text-lg font-black text-gray-900 block mb-3">Algorithm<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">X</span></span>
              <p className="text-sm text-gray-400 leading-relaxed mb-3">The UK&apos;s interactive tech education platform for ages 6 to adult.</p>
              <p className="text-xs text-gray-400">Made with ❤️ in the United Kingdom 🇬🇧</p>
            </div>
            {/* Col 2 */}
            <div>
              <h4 className="text-sm font-black text-gray-900 mb-4">Subjects</h4>
              <div className="flex flex-col gap-2.5">
                <a href="/cyberheroes" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Cybersecurity</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Game Development</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">AI & Machine Learning</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">App Development</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Entrepreneurship</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Robotics</a>
              </div>
            </div>
            {/* Col 3 */}
            <div>
              <h4 className="text-sm font-black text-gray-900 mb-4">Company</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">About Us</a>
                <a href="#for-parents" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">For Parents</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Pricing</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Contact</a>
              </div>
            </div>
            {/* Col 4 */}
            <div>
              <h4 className="text-sm font-black text-gray-900 mb-4">Legal</h4>
              <div className="flex flex-col gap-2.5">
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Cookie Policy</a>
                <a href="#" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Safeguarding</a>
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
