"use client";

import { useEffect, useRef, useState } from "react";

/* ─── FLOATING SHAPES ─── */
function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Circles */}
      <div className="absolute top-[10%] left-[5%] w-20 h-20 rounded-full bg-yellow-300/10 animate-[floatSlow_8s_ease-in-out_infinite]" />
      <div className="absolute top-[25%] right-[8%] w-14 h-14 rounded-full bg-pink-400/10 animate-[floatSlow_10s_ease-in-out_infinite_1s]" />
      <div className="absolute top-[60%] left-[12%] w-10 h-10 rounded-full bg-blue-400/10 animate-[floatSlow_9s_ease-in-out_infinite_2s]" />
      <div className="absolute top-[45%] right-[15%] w-16 h-16 rounded-full bg-green-400/10 animate-[floatSlow_11s_ease-in-out_infinite_0.5s]" />
      <div className="absolute top-[80%] left-[50%] w-12 h-12 rounded-full bg-purple-400/10 animate-[floatSlow_7s_ease-in-out_infinite_3s]" />
      {/* Stars */}
      <div className="absolute top-[15%] left-[30%] text-2xl animate-[twinkle_3s_ease-in-out_infinite] opacity-20">✦</div>
      <div className="absolute top-[35%] right-[25%] text-lg animate-[twinkle_4s_ease-in-out_infinite_1s] opacity-20">✦</div>
      <div className="absolute top-[70%] left-[70%] text-xl animate-[twinkle_3.5s_ease-in-out_infinite_2s] opacity-20">✦</div>
      <div className="absolute top-[55%] left-[20%] text-sm animate-[twinkle_5s_ease-in-out_infinite_0.5s] opacity-20">✦</div>
    </div>
  );
}

/* ─── REVEAL ─── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const o = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), { threshold: 0.1 });
    if (ref.current) o.observe(ref.current);
    return () => o.disconnect();
  }, []);
  return (
    <div ref={ref} className={`transition-all duration-[1000ms] ease-[cubic-bezier(0.34,1.56,0.64,1)] ${v ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-10 scale-95"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ─── COUNTER ─── */
function Counter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [c, setC] = useState(0);
  const [v, setV] = useState(false);
  const n = parseInt(target);
  useEffect(() => { const o = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), { threshold: 0.5 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);
  useEffect(() => { if (!v || isNaN(n)) return; const s = performance.now(); const step = (now: number) => { const p = Math.min((now - s) / 1500, 1); setC(Math.floor((1 - Math.pow(1 - p, 3)) * n)); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }, [v, n]);
  return <span ref={ref}>{isNaN(n) ? target : c}{suffix}</span>;
}

/* ─── LOGO MARQUEE ─── */
function LogoMarquee() {
  const logos = [
    { name: "CyberFirst", emoji: "🛡️" }, { name: "ASDAN", emoji: "🏅" }, { name: "NCSC", emoji: "🔒" },
    { name: "Cyber Essentials", emoji: "✅" }, { name: "CompTIA", emoji: "💻" }, { name: "ISC²", emoji: "🌐" },
    { name: "EC-Council", emoji: "🎓" }, { name: "SANS", emoji: "📡" }, { name: "CREST", emoji: "⭐" }, { name: "ISACA", emoji: "📋" },
  ];
  const doubled = [...logos, ...logos];
  return (
    <div className="relative overflow-hidden py-6">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#f0f4ff] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#f0f4ff] to-transparent z-10" />
      <div className="flex animate-[marquee_25s_linear_infinite] w-max">
        {doubled.map((logo, i) => (
          <div key={i} className="flex items-center gap-2 mx-8 shrink-0 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-100">
            <span className="text-lg">{logo.emoji}</span>
            <span className="text-sm font-bold text-gray-600">{logo.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── BOUNCY CHARACTER ─── */
function BouncyCharacter({ emoji, delay = 0 }: { emoji: string; delay?: number }) {
  return (
    <span className="inline-block animate-[bounce3d_2s_ease-in-out_infinite] text-5xl" style={{ animationDelay: `${delay}ms` }}>
      {emoji}
    </span>
  );
}

/* ─── MAIN ─── */
export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);

  return (
    <div className="min-h-screen bg-[#f0f4ff] text-gray-900 overflow-hidden relative">
      <FloatingShapes />

      <div className="relative" style={{ zIndex: 2 }}>

        {/* ── NAV ── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-blue-500/5 border-b border-blue-100" : ""}`}>
          <div className="flex items-center justify-between px-6 md:px-10 py-4 max-w-[1300px] mx-auto">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-[-3px] bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl blur-md opacity-40 group-hover:opacity-60 transition-all duration-500 animate-[pulse_3s_ease-in-out_infinite]" />
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <span className="text-lg font-black text-white drop-shadow-md">AX</span>
                </div>
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight">
                  <span className="text-gray-800">Algorithm</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500">X</span>
                </span>
              </div>
            </a>
            <div className="flex gap-3 items-center">
              <a href="/login" className="hidden sm:block px-5 py-2.5 text-sm font-bold text-gray-500 hover:text-blue-600 transition duration-300">Log In</a>
              <a href="/signup" className="group relative px-7 py-3 rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40">
                <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition duration-500" />
                <span className="relative text-sm font-black text-white">Get Started! 🚀</span>
              </a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center pt-20">
          {/* Big gradient blob */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-blue-200/40 via-purple-200/30 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr from-yellow-200/30 via-pink-200/20 to-transparent rounded-full blur-3xl" />

          <div className="relative z-10 max-w-[1300px] mx-auto px-6 md:px-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              {/* Badge */}
              <div className="animate-[popIn_0.6s_cubic-bezier(0.34,1.56,0.64,1)] mb-8">
                <div className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200 shadow-sm">
                  <span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative rounded-full h-2.5 w-2.5 bg-green-500" /></span>
                  Now Enrolling — 2026! 🎉
                </div>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[0.95] tracking-tight mb-6">
                <span className="block animate-[slideUp_0.7s_cubic-bezier(0.34,1.56,0.64,1)_forwards] text-gray-800">
                  Learn to be a
                </span>
                <span className="block animate-[slideUp_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.1s_forwards] opacity-0">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-[gradientShift_6s_ease_infinite] bg-[length:200%_auto]">
                    Cyber Hero!
                  </span>
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-500 max-w-lg mb-10 leading-relaxed animate-[slideUp_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.25s_forwards] opacity-0">
                Fun, interactive cybersecurity courses for <strong className="text-gray-700">ages 6 to adult</strong>. 
                Real simulations. Real skills. Accredited learning paths that make security stick! ✨
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-[slideUp_0.7s_cubic-bezier(0.34,1.56,0.64,1)_0.4s_forwards] opacity-0">
                <a href="/signup" className="group relative px-10 py-4 rounded-2xl overflow-hidden text-center transform hover:scale-105 transition-all duration-300 shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30">
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 opacity-0 group-hover:opacity-100 transition duration-500" />
                  <span className="relative text-base font-black text-white">Start Learning — It&apos;s Free! 🎮</span>
                </a>
                <a href="#courses" className="group px-10 py-4 rounded-2xl border-2 border-gray-200 hover:border-blue-400 transition-all duration-300 text-center bg-white hover:shadow-lg transform hover:scale-105">
                  <span className="text-base font-bold text-gray-500 group-hover:text-blue-600 transition">View Courses ↓</span>
                </a>
              </div>
            </div>

            {/* Hero characters & image */}
            <div className="hidden lg:flex flex-col items-center justify-center animate-[popIn_0.8s_cubic-bezier(0.34,1.56,0.64,1)_0.3s_forwards] opacity-0">
              <div className="relative">
                {/* Main image */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10 border-4 border-white transform hover:rotate-1 transition-transform duration-500">
                  <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=700&q=80" alt="Kids learning" className="w-full h-[420px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
                </div>
                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100 animate-[floatSlow_4s_ease-in-out_infinite] flex items-center gap-2">
                  <span className="text-2xl">🛡️</span>
                  <div>
                    <div className="text-xs font-black text-gray-800">100%</div>
                    <div className="text-[10px] text-gray-400 font-bold">Interactive</div>
                  </div>
                </div>
                <div className="absolute -bottom-3 -left-4 bg-white rounded-2xl px-4 py-3 shadow-xl border border-gray-100 animate-[floatSlow_5s_ease-in-out_infinite_1s] flex items-center gap-2">
                  <span className="text-2xl">🏅</span>
                  <div>
                    <div className="text-xs font-black text-gray-800">Accredited</div>
                    <div className="text-[10px] text-gray-400 font-bold">CyberFirst & ASDAN</div>
                  </div>
                </div>
                <div className="absolute top-1/2 -right-6 bg-white rounded-2xl px-3 py-2 shadow-xl border border-gray-100 animate-[floatSlow_6s_ease-in-out_infinite_2s]">
                  <span className="text-2xl">⭐</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── CHARACTERS BAR ─── */}
        <div className="flex justify-center gap-6 py-12">
          <BouncyCharacter emoji="🦸" delay={0} />
          <BouncyCharacter emoji="🔐" delay={200} />
          <BouncyCharacter emoji="💻" delay={400} />
          <BouncyCharacter emoji="🕵️" delay={600} />
          <BouncyCharacter emoji="🚀" delay={800} />
        </div>

        {/* ── TRUSTED BY ── */}
        <Reveal>
          <div className="max-w-[1300px] mx-auto px-6 md:px-10 mb-8">
            <div className="text-center mb-2">
              <span className="text-sm font-bold text-gray-400">Aligned with world-class frameworks</span>
            </div>
            <LogoMarquee />
          </div>
        </Reveal>

        {/* ── COURSES ── */}
        <section id="courses" className="max-w-[1300px] mx-auto px-6 md:px-10 py-20">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-3 block">Choose Your Path</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5">
                Four Epic Tracks.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Every Age! 🎯</span>
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-lg">From little cyber heroes to working pros — there&apos;s a course built just for you.</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80", emoji: "🦸", title: "Cyber Heroes Academy", age: "Ages 6–10", desc: "Fun animated adventures! Learn about online safety, passwords, and being a good digital citizen.", duration: "12 weeks · 45 min/week", gradient: "from-blue-500 to-cyan-400", bg: "bg-blue-50", border: "border-blue-200", tag: "text-blue-600 bg-blue-100" },
              { img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80", emoji: "🔍", title: "Cyber Explorers", age: "Ages 11–14", desc: "Explore networks, encryption, and ethical hacking with cool motion-graphics lessons!", duration: "14 weeks · 1 hr/week", gradient: "from-purple-500 to-pink-400", bg: "bg-purple-50", border: "border-purple-200", tag: "text-purple-600 bg-purple-100" },
              { img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80", emoji: "💻", title: "CyberStart", age: "Ages 15–17", desc: "Real CTF challenges, incident response, and simulated phishing environments. Level up!", duration: "16 weeks · 1.5 hrs/week", gradient: "from-green-500 to-emerald-400", bg: "bg-green-50", border: "border-green-200", tag: "text-green-600 bg-green-100" },
              { img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80", emoji: "🏢", title: "CyberStart Pro", age: "Ages 18+", desc: "Professional cybersecurity. Compliance, threat analysis, and career pathways for adults.", duration: "20 weeks · 2 hrs/week", gradient: "from-orange-500 to-amber-400", bg: "bg-orange-50", border: "border-orange-200", tag: "text-orange-600 bg-orange-100" },
            ].map((course, i) => (
              <Reveal key={course.title} delay={i * 100}>
                <div className={`group relative h-full rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl bg-white border-2 ${course.border} hover:shadow-${course.gradient.split("-")[1]}-500/10`}>
                  <div className="relative h-40 overflow-hidden">
                    <img src={course.img} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white via-white/50 to-transparent" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-black ${course.tag}`}>{course.age}</span>
                    </div>
                    <div className="absolute bottom-3 left-4 text-4xl animate-[bounce3d_3s_ease-in-out_infinite]">{course.emoji}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-black mb-2 text-gray-800">{course.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed mb-4">{course.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs font-bold text-gray-400">{course.duration}</span>
                      <span className="text-xs font-black text-blue-500 group-hover:text-purple-500 transition">Explore →</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── WHY US ── */}
        <section className="max-w-[1300px] mx-auto px-6 md:px-10 py-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <Reveal>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-blue-200/50 to-purple-200/50 rounded-[2rem] blur-2xl" />
                <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-purple-500/10 border-4 border-white">
                  <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80" alt="Student learning" className="w-full h-[420px] object-cover" />
                </div>
                {/* Floating card */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 animate-[floatSlow_5s_ease-in-out_infinite] max-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">🎮</span>
                    <span className="text-sm font-black text-gray-800">Not just videos!</span>
                  </div>
                  <p className="text-[11px] text-gray-400">Real hands-on simulations and challenges.</p>
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <span className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-3 block">Why AlgorithmX?</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-10">
                  Not your average{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">online course! 💪</span>
                </h2>
              </Reveal>

              <div className="space-y-6">
                {[
                  { emoji: "🎮", title: "Interactive Simulations", desc: "Real CTF challenges, mock phishing inboxes, and incident response scenarios. Learn by doing, not watching!", color: "bg-blue-100 border-blue-200" },
                  { emoji: "🏅", title: "Accreditation Aligned", desc: "Built to CyberFirst and ASDAN frameworks. Earn credentials that universities and employers respect.", color: "bg-purple-100 border-purple-200" },
                  { emoji: "👨‍👩‍👧‍👦", title: "Family Bundle", desc: "One purchase unlocks all three youth tracks. Cybersecurity education for your whole family, ages 6 to 17!", color: "bg-pink-100 border-pink-200" },
                ].map((f, i) => (
                  <Reveal key={f.title} delay={i * 120}>
                    <div className="flex gap-4 group p-4 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 -mx-4">
                      <div className={`shrink-0 w-14 h-14 rounded-2xl ${f.color} border-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                        <span className="text-2xl">{f.emoji}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-gray-800 mb-1">{f.title}</h3>
                        <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <Reveal>
          <div className="max-w-[1300px] mx-auto px-6 md:px-10 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[
                { value: "4", label: "Learning Tracks", suffix: "", emoji: "📚", color: "from-blue-500 to-cyan-400" },
                { value: "62", label: "Weeks of Content", suffix: "+", emoji: "📅", color: "from-purple-500 to-pink-400" },
                { value: "6", label: "Starting Age", suffix: "+", emoji: "👶", color: "from-green-500 to-emerald-400" },
                { value: "100", label: "Interactive", suffix: "%", emoji: "🎯", color: "from-orange-500 to-amber-400" },
              ].map((s) => (
                <div key={s.label} className="bg-white rounded-3xl border-2 border-gray-100 p-6 md:p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group">
                  <div className="text-3xl mb-3 group-hover:animate-[bounce3d_1s_ease-in-out]">{s.emoji}</div>
                  <div className={`text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${s.color} mb-1`}>
                    <Counter target={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── PROFESSIONALS ── */}
        <Reveal>
          <section className="max-w-[1300px] mx-auto px-6 md:px-10 py-16">
            <div className="text-center mb-12">
              <span className="text-sm font-bold text-purple-500 uppercase tracking-widest mb-3 block">Our Team</span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                Built by <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">certified experts 🧑‍💻</span>
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">Real cybersecurity professionals who know how to make learning fun and effective.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", role: "Security Architect", certs: "CISSP · CISM", color: "from-blue-400 to-cyan-400" },
                { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", role: "Penetration Tester", certs: "CEH · OSCP", color: "from-purple-400 to-pink-400" },
                { img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", role: "SOC Analyst", certs: "CompTIA CySA+", color: "from-green-400 to-emerald-400" },
                { img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", role: "Education Lead", certs: "ASDAN · QTS", color: "from-orange-400 to-amber-400" },
              ].map((p, i) => (
                <Reveal key={i} delay={i * 100}>
                  <div className="group bg-white rounded-3xl overflow-hidden border-2 border-gray-100 hover:shadow-xl hover:-translate-y-2 transition-all duration-500">
                    <div className="relative h-48 overflow-hidden">
                      <img src={p.img} alt={p.role} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
                    </div>
                    <div className="p-5 text-center -mt-4 relative">
                      <h4 className="text-sm font-black text-gray-800 mb-1">{p.role}</h4>
                      <div className={`text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r ${p.color}`}>{p.certs}</div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ── CTA ── */}
        <Reveal>
          <section className="max-w-[1300px] mx-auto px-6 md:px-10 py-16">
            <div className="relative rounded-[2rem] overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600" />
              <div className="absolute inset-0 opacity-10">
                <img src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200&q=80" alt="" className="w-full h-full object-cover" />
              </div>
              {/* Floating shapes */}
              <div className="absolute top-8 left-8 w-16 h-16 rounded-full bg-white/10 animate-[floatSlow_6s_ease-in-out_infinite]" />
              <div className="absolute bottom-8 right-12 w-12 h-12 rounded-full bg-white/10 animate-[floatSlow_8s_ease-in-out_infinite_2s]" />
              <div className="absolute top-12 right-24 w-8 h-8 rounded-full bg-white/10 animate-[floatSlow_5s_ease-in-out_infinite_1s]" />

              <div className="relative p-12 md:p-20 text-center text-white">
                <div className="text-5xl mb-6">🚀</div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
                  Ready to become a<br />Cyber Hero?
                </h2>
                <p className="text-white/70 mb-10 max-w-lg mx-auto text-lg">Join AlgorithmX and start your cybersecurity adventure today. For kids, teens, and adults!</p>
                <a href="/signup" className="group relative inline-block px-12 py-5 rounded-2xl overflow-hidden transform hover:scale-105 transition-all duration-300 shadow-xl">
                  <span className="absolute inset-0 bg-white" />
                  <span className="relative text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Get Started Free — Let&apos;s Go! 🎮</span>
                </a>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── FOOTER ── */}
        <footer className="py-10 mt-8">
          <div className="max-w-[1300px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-[9px] font-black text-white">AX</span>
              </div>
              <span className="text-sm font-bold text-gray-400">© 2026 AlgorithmX. All rights reserved.</span>
            </div>
            <div className="flex gap-8 text-sm font-bold text-gray-400">
              <a href="#" className="hover:text-blue-600 transition duration-300">Privacy</a>
              <a href="#" className="hover:text-blue-600 transition duration-300">Terms</a>
              <a href="#" className="hover:text-blue-600 transition duration-300">Contact</a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap");
        * { -webkit-font-smoothing: antialiased; }
        body { font-family: "Nunito", -apple-system, sans-serif; background: #f0f4ff; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.8) } to { opacity: 1; transform: scale(1) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
        @keyframes floatSlow { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-15px) } }
        @keyframes bounce3d { 0%, 100% { transform: translateY(0) scale(1) } 50% { transform: translateY(-12px) scale(1.1) } }
        @keyframes twinkle { 0%, 100% { opacity: 0.1; transform: scale(1) } 50% { opacity: 0.4; transform: scale(1.3) } }
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        ::-webkit-scrollbar { width: 8px }
        ::-webkit-scrollbar-track { background: #f0f4ff }
        ::-webkit-scrollbar-thumb { background: linear-gradient(to bottom, #818cf8, #c084fc); border-radius: 10px }
        ::selection { background: rgba(139, 92, 246, 0.2) }
        html { scroll-behavior: smooth }
      `}</style>
    </div>
  );
}
