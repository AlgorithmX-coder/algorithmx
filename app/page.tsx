"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";

/* ─── ANIMATED COUNTER ─── */
function AnimCounter({ to, suffix = "", label }: { to: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let frame: number;
    const start = performance.now();
    const dur = 2000;
    const tick = (now: number) => {
      const t = Math.min((now - start) / dur, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(ease * to));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [inView, to]);
  return (
    <div ref={ref} className="flex flex-col items-center gap-1 flex-1 min-w-[120px] py-6">
      <span className="text-4xl sm:text-5xl font-black text-purple-700">{val}{suffix}</span>
      <span className="text-sm font-bold text-slate-400">{label}</span>
    </div>
  );
}

/* ─── SECTION REVEAL ─── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── COURSE DATA ─── */
const COURSES = [
  {
    title: "Cyber Heroes Academy", ages: "6–10", weeks: 20, time: "45 min/week",
    gradient: "from-purple-500 to-blue-500", icon: null, img: "/characters/adam-layla-happy.png",
    desc: "Fun animated adventures with Adam & Layla. Kids learn about passwords, online safety, and digital citizenship through interactive games and challenges.",
    badge: "AVAILABLE NOW", badgeColor: "bg-green-100 text-green-700",
    link: "/cyberheroes", linkText: "Explore Course →", linkColor: "text-purple-600",
  },
  {
    title: "Cyber Explorers", ages: "11–14", weeks: 14, time: "1 hour/week",
    gradient: "from-violet-500 to-purple-500", icon: "🔍", img: null,
    desc: "Motion-graphics lessons exploring networks, encryption, social engineering, and ethical hacking fundamentals.",
    badge: "COMING 2026", badgeColor: "bg-slate-100 text-slate-500",
    link: "/cyber-explorers", linkText: "Join Waitlist →", linkColor: "text-slate-500",
  },
  {
    title: "CyberStart", ages: "15–17", weeks: 16, time: "1.5 hours/week",
    gradient: "from-emerald-500 to-green-500", icon: "💻", img: null,
    desc: "Real-world CTF challenges, incident response scenarios, and simulated phishing environments.",
    badge: "COMING 2026", badgeColor: "bg-slate-100 text-slate-500",
    link: "/cyberstart", linkText: "Join Waitlist →", linkColor: "text-slate-500",
  },
  {
    title: "CyberStart Pro", ages: "18+", weeks: 20, time: "2 hours/week",
    gradient: "from-amber-500 to-orange-500", icon: "🏢", img: null,
    desc: "Professional workplace cybersecurity. Compliance frameworks, threat analysis, and career pathways.",
    badge: "COMING 2027", badgeColor: "bg-slate-100 text-slate-500",
    link: "/cyberstart-pro", linkText: "Join Waitlist →", linkColor: "text-slate-500",
  },
];

const STEPS = [
  { num: "1", title: "Choose a Course", desc: "Pick the right course for your child's age. Each track is designed specifically for their learning stage.", icon: "📋" },
  { num: "2", title: "Learn Through Adventure", desc: "Animated stories, interactive games, quizzes, and real-world challenges. No boring lectures — just hands-on learning.", icon: "🎮" },
  { num: "3", title: "Earn Your Certificate", desc: "Complete all modules and earn an accredited certificate. Track progress through the parent dashboard.", icon: "🏅" },
];

const FEATURES = [
  { title: "Not Just Videos", desc: "Hands-on games, simulations, and interactive challenges. Your child learns by doing — not watching. Every lesson features drag-and-drop activities, real-world scenarios, and gamified quizzes.", icon: "🎯" },
  { title: "Accreditation Aligned", desc: "Our curriculum is built to CyberFirst and ASDAN frameworks. Your child earns credentials recognised by universities and employers across the UK.", icon: "🏅" },
  { title: "Family Bundle", desc: "One purchase covers all three youth tracks. Complete cybersecurity education from ages 6 to 17 under one roof.", icon: "👨‍👩‍👧‍👦" },
];

const TESTIMONIALS = [
  { quote: "My daughter loves the Cyber Heroes course. She actually asks to do her lesson each week!", author: "Parent, London" },
  { quote: "Finally, a cybersecurity course that's actually designed for kids. The interactive games are brilliant.", author: "Parent, Manchester" },
  { quote: "I love the parent dashboard. I can see exactly what my son is learning.", author: "Parent, Birmingham" },
];

/* ─── MAIN PAGE ─── */
export default function HomePage() {
  const { scrollY } = useScroll();
  const navShadow = useTransform(scrollY, [0, 50], [0, 1]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "Nunito, sans-serif" }}>

      {/* ── NAV ── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm"
        style={{ boxShadow: useTransform(navShadow, (v) => `0 1px ${v * 12}px rgba(0,0,0,${v * 0.06})`) }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-xs font-black text-white">AX</span>
            </div>
            <span className="text-lg font-black text-slate-800">
              Algorithm<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">X</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#courses" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">Courses</a>
            <a href="#how-it-works" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">About</a>
            <a href="#why-us" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">For Parents</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="/login" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors hidden sm:block">
              Log In
            </a>
            <a href="/signup"
              className="px-5 py-2.5 rounded-xl text-sm font-black text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg">
              Get Started
            </a>
            {/* Mobile menu */}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-slate-600 text-xl p-1">
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden border-t border-slate-100 px-6 py-4 flex flex-col gap-3 bg-white"
          >
            <a href="#courses" className="text-sm font-bold text-slate-600 py-2" onClick={() => setMobileMenuOpen(false)}>Courses</a>
            <a href="#how-it-works" className="text-sm font-bold text-slate-600 py-2" onClick={() => setMobileMenuOpen(false)}>About</a>
            <a href="#why-us" className="text-sm font-bold text-slate-600 py-2" onClick={() => setMobileMenuOpen(false)}>For Parents</a>
            <a href="/login" className="text-sm font-bold text-slate-600 py-2">Log In</a>
          </motion.div>
        )}
      </motion.nav>

      {/* ── HERO ── */}
      <section className="pt-32 sm:pt-40 pb-20 sm:pb-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-800 leading-tight mb-6"
          >
            Cybersecurity education that kids{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">actually love</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Interactive courses for ages 6 to adult. Animated adventures, real-world simulations, and accredited learning paths that build real skills.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex gap-4 flex-wrap justify-center"
          >
            <a href="#courses"
              className="px-8 py-4 rounded-xl font-black text-white text-base bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl">
              Explore Courses
            </a>
            <a href="#how-it-works"
              className="px-8 py-4 rounded-xl font-black text-slate-600 text-base border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
              Watch How It Works
            </a>
          </motion.div>

          {/* Floating shield illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 150, damping: 20 }}
            className="mt-16 flex justify-center"
          >
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: [0, 3, 0, -3, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="w-24 h-28 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-2xl"
              style={{ boxShadow: "0 20px 60px rgba(109,40,217,0.2)" }}
            >
              <span className="text-white text-3xl font-black">🛡️</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="bg-slate-50 border-y border-slate-100 py-8">
        <Reveal className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Trusted by families across the United Kingdom</p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {["CyberFirst Aligned", "ASDAN Framework", "NCSC Standards", "COPPA Compliant"].map((item) => (
              <span key={item} className="text-sm font-bold text-slate-400">{item}</span>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── COURSES ── */}
      <section id="courses" className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">Four courses. Every age group.</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">
              Each course is designed specifically for its age group — from animated adventures for young learners to professional training for adults.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {COURSES.map((c, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.a
                  href={c.link}
                  className="block rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-shadow"
                  whileHover={{ y: -6 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  style={{ textDecoration: "none" }}
                >
                  {/* Gradient header */}
                  <div className={`bg-gradient-to-r ${c.gradient} p-6 flex items-center gap-4`}>
                    {c.img ? (
                      <Image src={c.img} alt={c.title} width={64} height={64} className="rounded-full border-2 border-white/50" />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl shrink-0">
                        {c.icon}
                      </div>
                    )}
                    <div>
                      <h3 className="font-black text-white text-lg leading-snug">{c.title}</h3>
                      <p className="text-white/70 text-sm font-bold">Ages {c.ages} · {c.weeks} Weeks · {c.time}</p>
                    </div>
                  </div>
                  {/* Card body */}
                  <div className="p-6">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-black ${c.badgeColor} mb-3`}>{c.badge}</span>
                    <p className="text-slate-500 text-sm leading-relaxed mb-4">{c.desc}</p>
                    <span className={`text-sm font-black ${c.linkColor}`}>{c.linkText}</span>
                  </div>
                </motion.a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="bg-slate-50 py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">Three Simple Steps</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.15} className="text-center">
                <div className="text-6xl font-black text-purple-100 mb-4">{s.num}</div>
                <div className="text-4xl mb-4">{s.icon}</div>
                <h3 className="text-xl font-black text-slate-800 mb-3">{s.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section id="why-us" className="py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">Why parents choose AlgorithmX</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.12}>
                <div className="rounded-2xl bg-white border border-slate-200 p-7 shadow-sm h-full">
                  <div className="text-4xl mb-5">{f.icon}</div>
                  <h3 className="text-lg font-black text-slate-800 mb-3">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="border-y border-slate-100 py-16 px-6">
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-4">
          <AnimCounter to={4} label="Learning Tracks" />
          <AnimCounter to={70} suffix="+" label="Weeks of Content" />
          <AnimCounter to={6} suffix="-18+" label="Age Range" />
          <AnimCounter to={100} suffix="%" label="Interactive" />
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-slate-50 py-20 sm:py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <Reveal className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-800 mb-4">What parents are saying</h2>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.15}>
                <div className="rounded-2xl bg-white border border-slate-200 p-7 shadow-sm h-full flex flex-col">
                  <span className="text-purple-200 text-4xl font-black leading-none mb-3">"</span>
                  <p className="text-slate-600 text-sm leading-relaxed italic flex-1">{t.quote}</p>
                  <p className="text-slate-400 text-xs font-bold mt-4">— {t.author}</p>
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
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
              Ready to start your child&apos;s cybersecurity journey?
            </h2>
            <p className="text-purple-200 text-lg mb-8 max-w-lg mx-auto">
              The first lesson is completely free. No credit card required.
            </p>
            <a href="/signup"
              className="inline-block px-10 py-5 rounded-xl font-black text-purple-700 text-lg bg-white hover:bg-purple-50 transition-colors shadow-xl">
              Get Started Free
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-50 border-t border-slate-200 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <span className="text-[9px] font-black text-white">AX</span>
            </div>
            <span className="text-sm font-bold text-slate-400">&copy; 2026 AlgorithmX. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <a href="#courses" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Courses</a>
            <a href="#how-it-works" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">About</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Privacy</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Terms</a>
            <a href="#" className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors">Contact</a>
          </div>
          <span className="text-xs font-bold text-slate-400">Made in the UK 🇬🇧</span>
        </div>
      </footer>
    </div>
  );
}
