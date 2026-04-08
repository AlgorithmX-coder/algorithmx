"use client";

import { useEffect, useRef, useState } from "react";

/* ─── PARTICLE NETWORK ─── */
function ParticleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationId: number;
    let mouse = { x: -1000, y: -1000 };
    const handleMouse = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", handleMouse);
    const resize = () => { canvas.width = window.innerWidth; canvas.height = document.documentElement.scrollHeight; };
    resize(); window.addEventListener("resize", resize);
    type P = { x: number; y: number; vx: number; vy: number; size: number; opacity: number; pulse: number; hue: number };
    const particles: P[] = [];
    for (let i = 0; i < 90; i++) particles.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, size: Math.random() * 1.8 + 0.5, opacity: Math.random() * 0.4 + 0.1, pulse: Math.random() * Math.PI * 2, hue: Math.random() > 0.7 ? 280 : 190 });
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const scrollY = window.scrollY;
      particles.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy; p.pulse += 0.015;
        if (p.x < 0) p.x = canvas.width; if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height; if (p.y > canvas.height) p.y = 0;
        const dx = p.x - mouse.x, dy = p.y - (mouse.y + scrollY), dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) { p.vx += (dx / dist) * 0.02; p.vy += (dy / dist) * 0.02; }
        p.vx *= 0.99; p.vy *= 0.99;
        const glow = Math.sin(p.pulse) * 0.4 + 0.6;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * glow, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity * glow})`; ctx.fill();
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j], cx = p.x - p2.x, cy = p.y - p2.y, cd = Math.sqrt(cx * cx + cy * cy);
          if (cd < 100) { ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y); ctx.strokeStyle = `hsla(${p.hue}, 80%, 55%, ${0.06 * (1 - cd / 100)})`; ctx.lineWidth = 0.5; ctx.stroke(); }
        }
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animationId); window.removeEventListener("resize", resize); window.removeEventListener("mousemove", handleMouse); };
  }, []);
  return <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
}

/* ─── TYPING ─── */
function TypingText({ texts, className = "" }: { texts: string[]; className?: string }) {
  const [display, setDisplay] = useState(""); const [ti, setTi] = useState(0); const [ci, setCi] = useState(0); const [del, setDel] = useState(false);
  useEffect(() => {
    const t = texts[ti];
    const timeout = setTimeout(() => {
      if (!del) { setDisplay(t.substring(0, ci + 1)); setCi(p => p + 1); if (ci + 1 === t.length) setTimeout(() => setDel(true), 2000); }
      else { setDisplay(t.substring(0, ci - 1)); setCi(p => p - 1); if (ci - 1 === 0) { setDel(false); setTi(p => (p + 1) % texts.length); } }
    }, del ? 30 : 80);
    return () => clearTimeout(timeout);
  }, [ci, del, ti, texts]);
  return <span className={className}>{display}<span className="animate-[blink_1s_step-end_infinite] text-cyan-400">|</span></span>;
}

/* ─── REVEAL ─── */
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null); const [v, setV] = useState(false);
  useEffect(() => { const o = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), { threshold: 0.1 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);
  return <div ref={ref} className={`transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)] ${v ? "opacity-100 translate-y-0 blur-0" : "opacity-0 translate-y-14 blur-sm"} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

/* ─── COUNTER ─── */
function Counter({ target, suffix = "" }: { target: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null); const [c, setC] = useState(0); const [v, setV] = useState(false); const n = parseInt(target);
  useEffect(() => { const o = new IntersectionObserver(([e]) => e.isIntersecting && setV(true), { threshold: 0.5 }); if (ref.current) o.observe(ref.current); return () => o.disconnect(); }, []);
  useEffect(() => { if (!v || isNaN(n)) return; const s = performance.now(); const step = (now: number) => { const p = Math.min((now - s) / 2000, 1); setC(Math.floor((1 - Math.pow(1 - p, 4)) * n)); if (p < 1) requestAnimationFrame(step); }; requestAnimationFrame(step); }, [v, n]);
  return <span ref={ref}>{isNaN(n) ? target : c}{suffix}</span>;
}

/* ─── SCROLLING MARQUEE ─── */
function LogoMarquee() {
  const logos = [
    { name: "CyberFirst", sub: "NCSC Programme" },
    { name: "ASDAN", sub: "Accreditation" },
    { name: "NCSC", sub: "UK Cyber Security" },
    { name: "Cyber Essentials", sub: "Certification" },
    { name: "CompTIA", sub: "Industry Standard" },
    { name: "ISC²", sub: "Security Certified" },
    { name: "ISACA", sub: "Governance" },
    { name: "EC-Council", sub: "Ethical Hacking" },
    { name: "SANS", sub: "Institute" },
    { name: "CREST", sub: "Accredited" },
  ];

  const doubled = [...logos, ...logos];

  return (
    <div className="relative overflow-hidden py-10">
      {/* Fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#0a0f1e] to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#0a0f1e] to-transparent z-10" />

      <div className="flex animate-[marquee_30s_linear_infinite] w-max">
        {doubled.map((logo, i) => (
          <div key={i} className="flex items-center gap-3 mx-10 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
              <span className="text-[10px] font-black text-cyan-400/60 font-mono">{logo.name.substring(0, 2).toUpperCase()}</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white/40">{logo.name}</div>
              <div className="text-[9px] font-mono text-white/20 tracking-wider">{logo.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── MAIN ─── */
export default function Home() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => { const h = () => setScrollY(window.scrollY); window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h); }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] text-white overflow-hidden relative">
      <ParticleCanvas />

      {/* Ambient orbs */}
      <div className="fixed top-[-15%] right-[-8%] w-[700px] h-[700px] rounded-full opacity-[0.08] blur-[150px] pointer-events-none bg-[radial-gradient(circle,rgba(0,200,255,0.5)_0%,transparent_70%)] animate-[orbFloat_12s_ease-in-out_infinite]" style={{ zIndex: 0 }} />
      <div className="fixed bottom-[-15%] left-[-8%] w-[600px] h-[600px] rounded-full opacity-[0.06] blur-[130px] pointer-events-none bg-[radial-gradient(circle,rgba(100,0,255,0.5)_0%,transparent_70%)] animate-[orbFloat_15s_ease-in-out_infinite_reverse]" style={{ zIndex: 0 }} />

      {/* Scanner */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 3 }}>
        <div className="absolute w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-400/15 to-transparent animate-[scanDown_8s_linear_infinite]" />
      </div>

      <div className="relative" style={{ zIndex: 2 }}>

        {/* ── NAV ── */}
        <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrollY > 50 ? "bg-[#0a0f1e]/85 backdrop-blur-xl border-b border-cyan-500/10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]" : ""}`}>
          <div className="flex items-center justify-between px-6 md:px-10 py-4 max-w-[1400px] mx-auto">
            <a href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-[-4px] bg-cyan-400/20 rounded-xl blur-lg group-hover:blur-xl group-hover:bg-cyan-400/30 transition-all duration-500" />
                <div className="relative w-11 h-11 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_25px_rgba(0,220,255,0.4)]">
                  <span className="text-sm font-black text-white drop-shadow-lg">AX</span>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-[0.06em] leading-none">
                  <span className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.1)]">ALGORITHM</span><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-[0_0_20px_rgba(0,220,255,0.5)]">X</span>
                </span>
                <span className="text-[7px] font-mono tracking-[0.35em] text-cyan-400/50 mt-0.5">CYBER EDUCATION PLATFORM</span>
              </div>
            </a>
            <div className="flex gap-3 items-center">
              <a href="/login" className="hidden sm:block px-5 py-2.5 text-xs font-mono tracking-[0.12em] text-gray-400 hover:text-white transition duration-300">LOG IN</a>
              <a href="/signup" className="group relative px-7 py-3 rounded-lg overflow-hidden">
                <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-500 group-hover:from-cyan-300 group-hover:to-blue-400" />
                <span className="absolute inset-0 opacity-0 group-hover:opacity-100 transition shadow-[0_0_30px_rgba(0,220,255,0.5)]" />
                <span className="relative text-xs font-black font-mono tracking-[0.12em] text-black">GET STARTED</span>
              </a>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center">
          <div className="absolute inset-0 z-0">
            <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80" alt="" className="w-full h-full object-cover opacity-[0.08]" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1e] via-[#0a0f1e]/70 to-[#0a0f1e]" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 md:px-10 pt-32 pb-20 grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="animate-[slideUp_0.6s_ease-out] mb-8">
                <div className="inline-flex items-center gap-3 px-4 py-2 text-[10px] font-mono font-bold tracking-[0.2em] uppercase rounded-full border border-cyan-400/25 bg-cyan-400/[0.06]">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute h-full w-full rounded-full bg-green-400 opacity-75" /><span className="relative rounded-full h-2 w-2 bg-green-400" /></span>
                  <span className="text-cyan-300">NOW ENROLLING — 2026 COHORT</span>
                </div>
              </div>

              <h1 className="text-5xl sm:text-6xl md:text-7xl xl:text-8xl font-black leading-[0.88] tracking-tight mb-8">
                <span className="block animate-[slideUp_0.8s_ease-out_forwards] text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.05)]">LEARN TO</span>
                <span className="block animate-[slideUp_0.8s_ease-out_0.1s_forwards] opacity-0 text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.05)]">PROTECT THE</span>
                <span className="block mt-2 animate-[slideUp_0.8s_ease-out_0.2s_forwards] opacity-0">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-cyan-400 to-blue-400 animate-[gradientShift_6s_ease_infinite] bg-[length:200%_auto] drop-shadow-[0_0_40px_rgba(0,220,255,0.4)]">DIGITAL WORLD</span>
                </span>
              </h1>

              <div className="h-8 mb-6 animate-[fadeIn_1s_ease-out_0.5s_forwards] opacity-0">
                <span className="text-sm font-mono text-cyan-500/70">$ </span>
                <TypingText texts={["Cybersecurity education for ages 6 to adult", "Hands-on CTF challenges & simulations", "CyberFirst & ASDAN accredited pathways", "Interactive. Immersive. Unforgettable."]} className="text-sm font-mono text-cyan-300/80" />
              </div>

              <p className="text-base md:text-lg text-gray-300/70 max-w-lg mb-10 leading-relaxed animate-[fadeIn_1s_ease-out_0.6s_forwards] opacity-0">
                Four structured learning tracks with real-world simulations and accredited frameworks. Built to create the next generation of cyber defenders.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 animate-[fadeIn_1s_ease-out_0.8s_forwards] opacity-0">
                <a href="/signup" className="group relative px-10 py-4 rounded-lg overflow-hidden text-center">
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500" />
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-emerald-400 opacity-0 group-hover:opacity-100 transition duration-500" />
                  <span className="absolute inset-0 shadow-[0_0_50px_rgba(0,220,255,0.4)] opacity-50 group-hover:opacity-100 transition duration-500" />
                  <span className="relative text-sm font-black tracking-[0.12em] text-black">START LEARNING →</span>
                </a>
                <a href="#courses" className="group px-10 py-4 rounded-lg border border-white/10 hover:border-cyan-400/40 transition-all duration-500 text-center hover:shadow-[0_0_40px_rgba(0,220,255,0.08)]">
                  <span className="text-sm font-bold tracking-[0.12em] text-gray-300/60 group-hover:text-cyan-300 transition">VIEW COURSES</span>
                </a>
              </div>
            </div>

            {/* Hero image */}
            <div className="hidden lg:block animate-[fadeIn_1.2s_ease-out_0.4s_forwards] opacity-0">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-purple-500/15 rounded-2xl blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_80px_rgba(0,220,255,0.12)]">
                  <img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" alt="Code on screen" className="w-full h-[500px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent" />
                  <div className="absolute inset-0 bg-cyan-500/[0.03] mix-blend-overlay" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                      <span className="text-[10px] font-mono tracking-[0.2em] text-green-400/80">SECURE CONNECTION</span>
                    </div>
                    <div className="text-[10px] font-mono text-cyan-400/40">{">"} 4 tracks · 62 weeks · ages 6–adult · 100% interactive</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TRUSTED BY / SCROLLING LOGOS ── */}
        <Reveal>
          <div className="max-w-[1400px] mx-auto px-6 md:px-10">
            <div className="text-center mb-2">
              <span className="text-[10px] font-mono tracking-[0.3em] text-gray-500 uppercase">Curriculum aligned with industry-leading frameworks</span>
            </div>
            <LogoMarquee />
            <div className="h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          </div>
        </Reveal>

        {/* ── COURSES ── */}
        <section id="courses" className="max-w-[1400px] mx-auto px-6 md:px-10 py-32">
          <Reveal>
            <div className="text-center mb-20">
              <div className="text-[10px] font-mono tracking-[0.4em] text-cyan-400/40 mb-5">── TRAINING MODULES ──</div>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-5">
                FOUR TRACKS.{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-[0_0_20px_rgba(0,220,255,0.2)]">EVERY AGE.</span>
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto">From young cyber heroes to working professionals — structured pathways that build real skills.</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80", title: "Cyber Heroes Academy", desc: "Animated adventures teaching online safety, passwords, and digital citizenship through play.", duration: "12 WKS · 45 MIN", hsl: "185,100%,55%", label: "AGES 6–10" },
              { img: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&q=80", title: "Cyber Explorers", desc: "Motion-graphics lessons on networks, encryption, social engineering, and ethical hacking.", duration: "14 WKS · 1 HR", hsl: "270,100%,65%", label: "AGES 11–14" },
              { img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&q=80", title: "CyberStart", desc: "Live CTF challenges, incident response scenarios, and simulated phishing environments.", duration: "16 WKS · 1.5 HRS", hsl: "160,100%,45%", label: "AGES 15–17" },
              { img: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=600&q=80", title: "CyberStart Pro", desc: "Workplace cybersecurity, compliance, threat analysis, and professional career pathways.", duration: "20 WKS · 2 HRS", hsl: "25,100%,55%", label: "AGES 18+" },
            ].map((course, i) => (
              <Reveal key={course.title} delay={i * 120}>
                <div className="group relative h-full rounded-xl overflow-hidden cursor-pointer transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)] bg-[#111833] border border-white/[0.06] hover:border-[hsla(var(--h),0.4)]" style={{ "--h": course.hsl } as React.CSSProperties}>
                  <div className="relative h-40 overflow-hidden">
                    <img src={course.img} alt={course.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111833] via-[#111833]/50 to-transparent" />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded text-[9px] font-mono font-bold tracking-[0.15em] border backdrop-blur-sm" style={{ color: `hsla(${course.hsl},1)`, borderColor: `hsla(${course.hsl},0.3)`, backgroundColor: `hsla(${course.hsl},0.1)` }}>{course.label}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-base font-bold mb-2 tracking-tight text-white/90 group-hover:text-white transition">{course.title}</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">{course.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                      <span className="text-[9px] font-mono tracking-[0.15em]" style={{ color: `hsla(${course.hsl},0.7)` }}>{course.duration}</span>
                      <span className="text-[9px] font-mono text-gray-600 group-hover:text-white/50 transition">EXPLORE →</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── FEATURES SPLIT ── */}
        <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <Reveal>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-2xl blur-2xl" />
                <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-[0_0_60px_rgba(0,220,255,0.06)]">
                  <img src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=800&q=80" alt="Student learning" className="w-full h-[450px] object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent" />
                </div>
              </div>
            </Reveal>

            <div>
              <Reveal>
                <div className="text-[10px] font-mono tracking-[0.4em] text-cyan-400/40 mb-5">── CORE FEATURES ──</div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mb-10">
                  NOT JUST ANOTHER{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400 drop-shadow-[0_0_15px_rgba(0,220,255,0.2)]">ONLINE COURSE.</span>
                </h2>
              </Reveal>

              <div className="space-y-8">
                {[
                  { icon: "🎮", title: "Interactive Simulations", desc: "Real CTF challenges, mock phishing inboxes, and incident response scenarios. Hands-on experience, not passive watching." },
                  { icon: "🏅", title: "Accreditation Aligned", desc: "Built to CyberFirst and ASDAN frameworks. Credentials that carry weight with employers and universities." },
                  { icon: "👨‍👩‍👧‍👦", title: "Family Bundle", desc: "One purchase unlocks all three youth tracks. Complete cybersecurity education from age 6 to 17." },
                ].map((f, i) => (
                  <Reveal key={f.title} delay={i * 150}>
                    <div className="flex gap-5 group">
                      <div className="shrink-0 w-14 h-14 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-cyan-400/30 group-hover:shadow-[0_0_25px_rgba(0,220,255,0.1)] transition-all duration-500">
                        <span className="text-2xl">{f.icon}</span>
                      </div>
                      <div>
                        <h3 className="text-lg font-bold mb-1.5 text-white/90">{f.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
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
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 pb-32">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "4", label: "LEARNING TRACKS", suffix: "" },
                { value: "62", label: "WEEKS OF CONTENT", suffix: "+" },
                { value: "6", label: "STARTING AGE", suffix: "" },
                { value: "100", label: "INTERACTIVE", suffix: "%" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-[#111833] border border-white/[0.06] hover:border-cyan-500/20 transition-all duration-500 hover:-translate-y-1">
                  <div className="p-6 md:p-8 text-center">
                    <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-cyan-300 to-blue-400 mb-2">
                      <Counter target={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-[9px] font-mono text-gray-500 tracking-[0.2em]">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        {/* ── PROFESSIONALS / CERTIFIED BY ── */}
        <Reveal>
          <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-32">
            <div className="text-center mb-12">
              <div className="text-[10px] font-mono tracking-[0.4em] text-cyan-400/40 mb-5">── INDUSTRY RECOGNITION ──</div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">
                TRUSTED BY <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-400">PROFESSIONALS WORLDWIDE</span>
              </h2>
              <p className="text-gray-400 max-w-lg mx-auto text-sm">Our curriculum is built by certified cybersecurity professionals and aligned with globally recognised standards.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { img: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80", name: "Security Architect", cert: "CISSP · CISM", exp: "15+ Years Experience" },
                { img: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80", name: "Penetration Tester", cert: "CEH · OSCP", exp: "10+ Years Experience" },
                { img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80", name: "SOC Analyst", cert: "CompTIA CySA+", exp: "8+ Years Experience" },
                { img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80", name: "Education Lead", cert: "ASDAN · QTS", exp: "12+ Years Experience" },
              ].map((person, i) => (
                <div key={i} className="group relative rounded-xl overflow-hidden bg-[#111833] border border-white/[0.06] hover:border-cyan-500/20 transition-all duration-500 hover:-translate-y-1">
                  <div className="relative h-48 overflow-hidden">
                    <img src={person.img} alt={person.name} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105 opacity-70 group-hover:opacity-90" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111833] via-[#111833]/40 to-transparent" />
                  </div>
                  <div className="p-5">
                    <h4 className="text-sm font-bold text-white/90 mb-1">{person.name}</h4>
                    <div className="text-[10px] font-mono text-cyan-400/70 tracking-wider mb-1">{person.cert}</div>
                    <div className="text-[10px] font-mono text-gray-500 tracking-wider">{person.exp}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        {/* ── CTA ── */}
        <Reveal>
          <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-32">
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0">
                <img src="https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200&q=80" alt="" className="w-full h-full object-cover opacity-[0.08]" />
                <div className="absolute inset-0 bg-[#0a0f1e]/90" />
              </div>
              <div className="absolute inset-0 rounded-2xl border border-cyan-500/20" />
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent" />

              <div className="relative p-12 md:p-20 text-center">
                <div className="text-[10px] font-mono tracking-[0.4em] text-cyan-400/40 mb-6">── BEGIN YOUR JOURNEY ──</div>
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-6">
                  READY TO BECOME A{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 drop-shadow-[0_0_20px_rgba(0,220,255,0.2)]">CYBER DEFENDER?</span>
                </h2>
                <p className="text-gray-400 mb-10 max-w-lg mx-auto text-base">Join AlgorithmX and learn the skills that protect the digital world — at any age, at any level.</p>
                <a href="/signup" className="group relative inline-block px-12 py-4 overflow-hidden rounded-lg">
                  <span className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 transition-all group-hover:from-cyan-300 group-hover:to-emerald-400 duration-500" />
                  <span className="absolute inset-0 opacity-50 group-hover:opacity-100 transition shadow-[0_0_60px_rgba(0,220,255,0.4)]" />
                  <span className="relative text-sm font-black tracking-[0.15em] text-black">GET STARTED FREE →</span>
                </a>
              </div>
            </div>
          </section>
        </Reveal>

        {/* ── FOOTER ── */}
        <footer className="border-t border-white/[0.05] py-8">
          <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-600 rounded flex items-center justify-center shadow-[0_0_10px_rgba(0,220,255,0.3)]">
                <span className="text-[7px] font-black text-white">AX</span>
              </div>
              <span className="text-[10px] font-mono text-gray-500 tracking-[0.15em]">© 2026 ALGORITHMX. ALL RIGHTS RESERVED.</span>
            </div>
            <div className="flex gap-8 text-[10px] font-mono text-gray-500 tracking-[0.15em]">
              <a href="#" className="hover:text-cyan-400 transition duration-300">PRIVACY</a>
              <a href="#" className="hover:text-cyan-400 transition duration-300">TERMS</a>
              <a href="#" className="hover:text-cyan-400 transition duration-300">CONTACT</a>
            </div>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap");
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { font-family: "Outfit", -apple-system, sans-serif; background: #0a0f1e; }
        .font-mono, code { font-family: "JetBrains Mono", monospace; }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50% } 50% { background-position: 100% 50% } }
        @keyframes blink { 50% { opacity: 0 } }
        @keyframes scanDown { 0% { top: -2px } 100% { top: 100% } }
        @keyframes orbFloat { 0%, 100% { transform: translate(0,0) scale(1) } 33% { transform: translate(30px,-30px) scale(1.05) } 66% { transform: translate(-20px,20px) scale(0.95) } }
        @keyframes marquee { 0% { transform: translateX(0) } 100% { transform: translateX(-50%) } }
        ::-webkit-scrollbar { width: 5px }
        ::-webkit-scrollbar-track { background: #0a0f1e }
        ::-webkit-scrollbar-thumb { background: rgba(0,220,255,0.15); border-radius: 10px }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,220,255,0.3) }
        ::selection { background: rgba(0,220,255,0.2); color: white }
        html { scroll-behavior: smooth }
      `}</style>
    </div>
  );
}