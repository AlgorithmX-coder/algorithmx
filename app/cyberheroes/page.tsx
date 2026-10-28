"use client";

import Image from "next/image";
import Link from "next/link";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { CyberIconOrEmoji } from "@/app/components/CyberIcon";
import CyberHeroesPlayfulBackdrop from "@/app/components/CyberHeroesPlayfulBackdrop";
import CubeMark from "@/app/components/CubeMark";
import MissionShowcase from "./MissionShowcase";
import CastRow from "./CastRow";

/* ─── CONSTANTS ─── */
const GRAD = "linear-gradient(135deg, #7c5cff, #00e5ff)";
// Primary CTA gradient - cosmic gold→coral→pink. Was orange/amber
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

/* The credentials marquee lived here until 28 Oct 2026. Owner: "Remove the
 * trusted credentials at the bottom." The accreditation signal is not lost
 * with it: the hero still carries "CyberFirst (UK) aligned", and both the
 * features grid and the FAQ still state the CyberFirst/ASDAN alignment. */

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
      style={{ background: "linear-gradient(135deg, rgba(18,16,46,0.64), rgba(10,18,40,0.6), rgba(18,16,46,0.64))", backdropFilter: "blur(12px)", border: "1px solid rgba(124,92,255,0.38)", boxShadow: "0 0 20px rgba(124,92,255,0.18)" }}>
      <span className="text-3xl sm:text-4xl font-black text-white">{val}{suffix}</span>
      <span className="text-xs sm:text-sm font-bold text-gray-400">{label}</span>
    </div>
  );
}

/* ─── COURSE CARD DATA ─── */
const COURSES = [
  { emoji: "🛡️", title: "Cyber Heroes Academy", ages: "6–9", weeks: 20, time: "45 min/week", accent: "#00e5ff", desc: "Fun animated adventures teaching password safety, online awareness, and digital citizenship.", featured: true },
  { emoji: "🔍", title: "Cyber Explorers", ages: "10–13", weeks: 20, time: "1 hr/week", accent: "#8b5cf6", desc: "A story-driven spy thriller: 20 voice-acted missions on phishing, fake voices, and data tricks.", featured: false },
  { emoji: "💻", title: "Cyber Ops", ages: "14–17", weeks: 16, time: "1.5 hrs/week", accent: "#22c55e", desc: "Hands-on challenges covering networking, ethical hacking basics, and secure coding.", featured: false },
  { emoji: "🚀", title: "Cyber Pro", ages: "18+", weeks: 20, time: "2 hrs/week", accent: "#ffd158", desc: "Industry-aligned curriculum preparing for certifications and real-world security roles.", featured: false },
];

/* ─── FEATURES DATA ─── */
const FEATURES = [
  { emoji: "🎮", title: "Interactive Adventures", desc: "Not just videos. Real games, puzzles, drag-and-drop challenges, and boss battles that keep kids engaged for the full lesson." },
  { emoji: "🏅", title: "Accreditation Aligned", desc: "Built around CyberFirst and ASDAN frameworks so every lesson counts towards recognised achievements." },
];

/* ─── STORY CARDS DATA ─── */
const STORY = [
  { src: "/characters/adam-layla-happy.png", alt: "Adam and Layla sitting happily", caption: "Meet Adam & Layla", sub: "Two enthusiastic gamers who love exploring the digital world. But danger lurks online...", accent: "#00e5ff", numGrad: "linear-gradient(135deg,#7c5cff,#00e5ff)" },
  { src: "/characters/adam-layla-raccoon.png", alt: "The Hacker Raccoon appears", caption: "The Hacker Raccoon Strikes", sub: "He strikes with the real threats kids face online, from phishing traps to fake apps and sneaky links.", accent: "#ff5fb3", numGrad: "linear-gradient(135deg,#ff7a59,#ff5fb3)" },
  { src: "/characters/adam-layla-hacked.png", alt: "Adam and Layla with hacked tablet", caption: "Can They Become Cyber Heroes?", sub: "20 weeks of missions to outsmart the Raccoon and earn their Cyber Hero certificate!", accent: "#ffd158", numGrad: "linear-gradient(135deg,#ffd158,#ff7a59)" },
];

/* ─── FULL 20-WEEK CURRICULUM ───
   Real week titles + descriptions sourced from prisma/seed.ts, grouped
   into the four 5-week phases, each ending with its milestone cert. */
const CURRICULUM: Array<{
  phase: string;
  range: string;
  accent: string;
  cert: string;
  certEmoji: string;
  weeks: Array<{ w: number; title: string; sub: string }>;
}> = [
  {
    phase: "Foundations",
    range: "Weeks 1–5",
    accent: "#00e5ff",
    cert: "Cyber Cadet",
    certEmoji: "🛡️",
    weeks: [
      { w: 1, title: "Passwords: The Secret Code", sub: "Why passwords matter and how to create super-strong ones." },
      { w: 2, title: "Private Info: Guard Your Secrets", sub: "What personal information is and why some things stay private." },
      { w: 3, title: "Stranger Danger: Friend or Foe?", sub: "Spot fake profiles and stay safe chatting to people online." },
      { w: 4, title: "Scams and Tricks: Real or Fake?", sub: "Spot scam messages, fake pop-ups and sneaky tricks." },
      { w: 5, title: "Cyberbullying: Words Have Power", sub: "How words can hurt online and what to do if it happens." },
    ],
  },
  {
    phase: "Digital World",
    range: "Weeks 6–10",
    accent: "#7eff97",
    cert: "Cyber Guardian",
    certEmoji: "⚔️",
    weeks: [
      { w: 6, title: "Gaming Safety: Defend Your Game Zone", sub: "Stay safe in Roblox, Minecraft and Fortnite — chat, reporting, blocking." },
      { w: 7, title: "In-Game Spending: The V-Bucks Trap", sub: "Loot boxes, Robux and V-Bucks — and why to ask a grown-up first." },
      { w: 8, title: "Photos & Videos: Think Before You Share", sub: "Why screenshots last forever and why consent matters." },
      { w: 9, title: "Apps & Downloads: Spot the Fakes", sub: "Spot fake apps, understand permissions and download safely." },
      { w: 10, title: "YouTube & Videos: Escape the Rabbit Hole", sub: "Stay safe watching videos and manage screen time." },
    ],
  },
  {
    phase: "Advanced Skills",
    range: "Weeks 11–15",
    accent: "#ff7a59",
    cert: "Cyber Defender",
    certEmoji: "🏰",
    weeks: [
      { w: 11, title: "Something Wrong? Emergency Protocol", sub: "How to report, block and tell a trusted grown-up — it's never your fault." },
      { w: 12, title: "Digital Footprint: Tracks in the Snow", sub: "Everything you do online leaves a trail — learn to be proud of yours." },
      { w: 13, title: "Screen Time: Balance Your Power", sub: "The right balance between time online, breaks, sleep and healthy habits." },
      { w: 14, title: "Smart Devices: Who's Listening?", sub: "What Alexa, Siri and smart devices hear — and how to protect your privacy." },
      { w: 15, title: "AI & Chatbots: Robot or Real?", sub: "ChatGPT and chatbots — what they know and what never to share." },
    ],
  },
  {
    phase: "Cyber Hero",
    range: "Weeks 16–20",
    accent: "#ffd158",
    cert: "Certified Cyber Hero",
    certEmoji: "🎓",
    weeks: [
      { w: 16, title: "QR Codes & Links: Don't Take the Bait", sub: "Check before you scan or click — not every link is safe." },
      { w: 17, title: "Social Media: The Profile Shield", sub: "Stay safe on TikTok, Snapchat and Instagram — privacy and smart posting." },
      { w: 18, title: "Sharing Devices: Lock Before You Leave", sub: "Keep your stuff private on family tablets — logging out and boundaries." },
      { w: 19, title: "Protecting Family: Family Firewall", sub: "Become the family cyber expert and help everyone stay safe." },
      { w: 20, title: "Graduation Day: The Final Mission", sub: "The ultimate challenge — earn your Cyber Hero certificate!" },
    ],
  },
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
    /* removed per request: "What age is this for?" */
    { q: "How long does it take?", a: "20 weeks, one 45-minute session per week. Children can go at their own pace. There's no pressure to keep to a schedule." },
    /* removed per request: "Is it safe? Can strangers contact my child?" */
    { q: "Can I see what my child is learning?", a: "Yes. The parent dashboard shows you which lessons they've completed, badges earned, time spent, and a snapshot of how they're progressing each week. You'll also receive a milestone certificate at the end of each module." },
    { q: "Is it accredited?", a: "Yes. Designed in alignment with CyberFirst and ASDAN accreditation frameworks from day one." },
    { q: "What devices does it work on?", a: "Modern browsers on desktop or laptop (Chrome, Safari, Firefox, Edge: last two major versions) and on tablets (iPad 6th gen+, Android 9+). For the boss-battle visuals we recommend a screen of at least 10 inches. Headphones are optional but help kids focus." },
    /* removed per request: "What if something breaks during a lesson?" */
    { q: "Do we get lifetime access?", a: "Yes. Your one-time purchase of £99 gives you lifetime access with continuous updates. As new threats emerge, we update the content so your child's knowledge stays current." },
    { q: "I have more than one child. Do I need to pay £99 each time?", a: "Yes, enrolment is per child at £99. There's no sibling discount. Each child gets their own dedicated account, progress tracking, badges, and milestone certificates, so they can each move at their own pace. It's a one-time payment per child with lifetime access; no subscriptions, no renewals." },
  ];
  return (
    <div style={{ maxWidth: 720, margin: "0 auto", background: "rgba(9,12,28,0.55)", backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)", border: "1px solid rgba(124,92,255,0.18)", borderRadius: 24, padding: "6px 26px" }}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={i}
            data-scroll
            data-scroll-delay={String(i * 0.05)}
            style={{ borderBottom: "1px solid rgba(148,163,184,0.12)" }}
          >
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                  padding: "22px 4px", fontSize: 16, fontWeight: 700, color: "#fff",
                  background: "transparent", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                }}
              >
                <span>{item.q}</span>
                <span aria-hidden style={{
                  width: 30, height: 30, borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isOpen ? "#00e5ff" : "rgba(0,229,255,0.1)",
                  color: isOpen ? "#04121a" : "#00e5ff",
                  fontSize: 20, flexShrink: 0,
                  transition: "all 0.3s",
                }}>
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
              style={{
                maxHeight: isOpen ? 700 : 0,
                overflow: "hidden",
                transition: "max-height 0.45s cubic-bezier(0.16,1,0.3,1)",
              }}
            >
              <p style={{ padding: "0 4px 22px", color: "#d1d5db", fontSize: 15, lineHeight: 1.75 }}>
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
/* ─── UPGRADED NAV ───
   A detached frosted-glass "command pill": refined glass material, four
   active-section anchor links with a centre-out gradient underline, a masked
   gradient hairline frame (the single cyber accent), and a mobile sheet. */
const NAV_LINKS = [
  { id: "heroes", label: "Heroes" },
  { id: "curriculum", label: "Curriculum" },
  { id: "how", label: "How It Works" },
  { id: "unlock", label: "Pricing" },
];

function CyberHeroesNav() {
  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active-section highlight — one IntersectionObserver, off the scroll
  // thread. Keeps the last active id (never clears) so tall gaps don't flicker.
  useEffect(() => {
    const els = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(
      (e): e is HTMLElement => !!e,
    );
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        let best: { id: string; d: number } | null = null;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const r = e.target.getBoundingClientRect();
          const d = Math.abs(r.top + r.height / 2 - window.innerHeight / 2);
          if (!best || d < best.d) best = { id: e.target.id, d };
        }
        if (best) setActiveId(best.id);
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Mobile sheet: lock scroll + Escape to close.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Smooth-scroll first, then close on the next frame so the unmount can't
  // cancel the scroll.
  const goTo = (id: string) => {
    setOpen(false);
    requestAnimationFrame(() =>
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  };

  const pillStyle: CSSProperties = {
    position: "relative",
    height: scrolled ? 58 : 64,
    borderRadius: 18,
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    background: scrolled
      ? "linear-gradient(180deg, rgba(9,11,24,0.82), rgba(7,9,20,0.74))"
      : "linear-gradient(180deg, rgba(10,12,28,0.46), rgba(8,10,22,0.30))",
    backdropFilter: scrolled ? "blur(22px) saturate(150%)" : "blur(14px) saturate(135%)",
    WebkitBackdropFilter: scrolled ? "blur(22px) saturate(150%)" : "blur(14px) saturate(135%)",
    border: `1px solid ${scrolled ? "rgba(255,255,255,0.10)" : "rgba(255,255,255,0.07)"}`,
    boxShadow: scrolled
      ? "inset 0 1px 0 rgba(255,255,255,0.07), 0 10px 34px -14px rgba(4,6,18,0.7), 0 0 24px -6px rgba(124,92,255,0.18)"
      : "inset 0 1px 0 rgba(255,255,255,0.06), 0 8px 30px -12px rgba(4,6,18,0.55)",
    transition:
      "height 320ms cubic-bezier(0.16,1,0.3,1), background 320ms cubic-bezier(0.16,1,0.3,1), border-color 320ms, box-shadow 320ms",
  };

  return (
    <nav aria-label="Primary" className="fixed left-0 right-0 z-50" style={{ top: scrolled ? 10 : 14, transition: "top 320ms cubic-bezier(0.16,1,0.3,1)" }}>
      <style>{`
        section[id] { scroll-margin-top: 92px; }
        .chnav-grid { width: 100%; display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 12px; position: relative; z-index: 1; }
        .chnav-logo { display: inline-flex; align-items: center; gap: 10px; text-decoration: none; justify-self: start; }
        .chnav-stack { display: flex; flex-direction: column; gap: 2px; line-height: 1; align-items: flex-start; }
        .chnav-shield { display:inline-flex; transform:rotate(-7deg); filter:drop-shadow(0 0 10px rgba(255,179,71,0.4)); transition: transform 200ms cubic-bezier(0.16,1,0.3,1); }
        .chnav-logo:hover .chnav-shield { transform:rotate(-7deg) scale(1.1); }
        .chnav-word { font-family:var(--font-fredoka),system-ui,sans-serif; font-weight:700; font-size:19px; letter-spacing:0.02em; color:#eaf6ff; white-space:nowrap; }
        .chnav-word em { font-style:normal; color:#ffb347; }
        .chnav-by { font-family:var(--font-nunito),sans-serif; font-weight:800; font-size:9px; letter-spacing:0.18em; text-transform:uppercase; color:#7df0ff; margin-left:0; white-space:nowrap; text-shadow:0 0 8px rgba(0,229,255,0.4); }
        @media (max-width: 639px) { .chnav-by { display:none; } }
        .chnav-links { display:flex; align-items:center; justify-content:center; gap:24px; justify-self:center; }
        .chnav-link { position:relative; font-weight:700; font-size:14px; letter-spacing:0.01em; color:rgba(234,246,255,0.72); padding:8px 4px; text-decoration:none; transition: color 180ms; }
        .chnav-link:hover, .chnav-link.is-active { color:#eaf6ff; }
        .chnav-underline { position:absolute; left:50%; bottom:2px; width:18px; height:2px; border-radius:2px; background:linear-gradient(90deg,#00e5ff,#a78bff); box-shadow:0 0 8px rgba(0,229,255,0.5); transform:translateX(-50%) scaleX(0); transform-origin:center; transition: transform 200ms cubic-bezier(0.16,1,0.3,1); }
        .chnav-link:hover .chnav-underline, .chnav-link.is-active .chnav-underline { transform:translateX(-50%) scaleX(1); }
        .chnav-cta { display:inline-flex; align-items:center; gap:16px; justify-self:end; }
        .chnav-login { font-weight:700; font-size:14px; color:rgba(234,246,255,0.70); text-decoration:none; transition:color 160ms; }
        .chnav-login:hover { color:#eaf6ff; text-decoration:underline; text-underline-offset:4px; text-decoration-color:rgba(0,229,255,0.5); }
        .chnav-enrol { display:inline-flex; align-items:center; border-radius:14px; border:1px solid rgba(255,255,255,0.18); color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.38); font-family:var(--font-space-grotesk),system-ui,sans-serif; font-weight:800; font-size:14px; text-decoration:none; white-space:nowrap; }
        .chnav-frame { position:absolute; inset:0; border-radius:18px; padding:1px; pointer-events:none; z-index:0; background:linear-gradient(135deg, rgba(124,92,255,0.9), rgba(0,229,255,0.9)); -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); mask-composite:exclude; transition:opacity 320ms; }
        .chnav-frame.breathe { animation: chnavBreathe 6s ease-in-out infinite; }
        @keyframes chnavBreathe { 0%,100% { opacity:0.6; } 50% { opacity:0.74; } }
        .chnav-link:focus-visible, .chnav-login:focus-visible { outline:2px solid #7df0ff; outline-offset:3px; border-radius:8px; }
        .chnav-logo:focus-visible .chnav-shield { outline:2px solid #7df0ff; outline-offset:3px; border-radius:6px; }
        .chnav-enrol:focus-visible { outline:2px solid #fff; outline-offset:4px; box-shadow:0 0 0 4px rgba(124,92,255,0.35); }
        .chnav-burger { display:none; }
        .chnav-burger-icon { position:relative; width:18px; height:14px; display:inline-block; }
        .chnav-burger-icon i { position:absolute; left:0; width:18px; height:2px; border-radius:2px; background:#eaf6ff; transition:transform 200ms, opacity 200ms, top 200ms; }
        .chnav-burger-icon i:nth-child(1){ top:0; }
        .chnav-burger-icon i:nth-child(2){ top:6px; }
        .chnav-burger-icon i:nth-child(3){ top:12px; }
        .chnav-burger-icon.is-open i:nth-child(1){ top:6px; transform:rotate(45deg); }
        .chnav-burger-icon.is-open i:nth-child(2){ opacity:0; }
        .chnav-burger-icon.is-open i:nth-child(3){ top:6px; transform:rotate(-45deg); }
        .chnav-scrim { position:fixed; inset:0; background:rgba(4,6,18,0.5); z-index:40; }
        .chnav-sheet { position:relative; margin:12px 12px 0; border-radius:18px; background:rgba(8,10,22,0.92); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px); border:1px solid rgba(124,92,255,0.18); box-shadow:0 16px 40px -12px rgba(0,0,0,0.6); padding:8px 16px 16px; z-index:50; animation:chnavSheet 260ms cubic-bezier(0.16,1,0.3,1); }
        @keyframes chnavSheet { from { opacity:0; transform:translateY(-8px);} to {opacity:1; transform:none;} }
        .chnav-sheet-link { display:block; padding:14px 8px; font-weight:700; font-size:15px; color:rgba(234,246,255,0.8); text-decoration:none; border-bottom:1px solid rgba(148,163,184,0.12); }
        .chnav-sheet-link.is-active { color:#eaf6ff; border-left:2px solid #00e5ff; padding-left:12px; }
        .chnav-sheet-login { display:block; text-align:center; padding:12px; margin-top:12px; border-radius:12px; border:1px solid rgba(0,229,255,0.3); color:#7df0ff; font-weight:700; text-decoration:none; }
        .chnav-sheet-enrol { display:block; text-align:center; padding:13px; margin-top:10px; border-radius:14px; color:#fff; text-shadow:0 1px 2px rgba(0,0,0,0.38); font-weight:800; font-family:var(--font-space-grotesk),system-ui,sans-serif; text-decoration:none; }
        @media (max-width: 1023px) {
          .chnav-grid { grid-template-columns: 1fr auto; }
          .chnav-links { display:none; }
          .chnav-burger { display:inline-flex; align-items:center; justify-content:center; width:40px; height:40px; border-radius:10px; background:transparent; border:1px solid rgba(125,240,255,0.18); cursor:pointer; transition:background 160ms, border-color 160ms; }
          .chnav-burger:hover { background:rgba(255,255,255,0.06); border-color:rgba(0,229,255,0.4); }
        }
        @media (min-width: 1024px) { .chnav-burger { display:none; } }
        @media (max-width: 639px) { .chnav-login { display:none; } }
        @media (prefers-reduced-motion: reduce) { .chnav-frame.breathe, .chnav-sheet { animation: none !important; } }
      `}</style>

      <div className="max-w-[1200px] mx-auto px-5">
        <div style={pillStyle}>
          <span aria-hidden className={`chnav-frame${scrolled ? " breathe" : ""}`} style={{ opacity: scrolled ? 0.72 : 0.38 }} />

          <div className="chnav-grid">
            <Link href="/" className="chnav-logo" aria-label="Cyber Heroes by AlgorithmX — home">
              <span className="chnav-shield" aria-hidden>
                <svg width="22" height="22" viewBox="0 0 24 24">
                  <path d="M12 2 L20 5 V12 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 12 V5 Z" fill="#ffb347" />
                  <path d="M13.2 6 L8.6 13 H11.4 L10.6 18 L15.6 11 H12.6 Z" fill="#08101f" />
                </svg>
              </span>
              <span className="chnav-stack">
                <span className="chnav-word">CYBER <em>HEROES</em></span>
                <span className="chnav-by">by <CubeMark size={13} color="#5f8dff" code style={{ display: "inline-block", verticalAlign: "middle", position: "relative", top: "-0.15em", margin: "0 3px 0 2px", filter: "drop-shadow(0 0 5px rgba(95,141,255,0.7))" }} />AlgorithmX</span>
              </span>
            </Link>

            <div className="chnav-links">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  aria-current={activeId === l.id ? "true" : undefined}
                  className={`chnav-link${activeId === l.id ? " is-active" : ""}`}
                  onClick={(e) => { e.preventDefault(); goTo(l.id); }}
                >
                  {l.label}
                  <span className="chnav-underline" />
                </a>
              ))}
            </div>

            <div className="chnav-cta">
              <a href="/cyberheroes/login" className="chnav-login">Log In</a>
              <a
                href="/cyberheroes/signup"
                className="chnav-enrol ch-lift"
                style={{ background: BTN_GRAD, boxShadow: `${BTN_GLOW}, inset 0 1px 0 rgba(255,255,255,0.3)`, padding: scrolled ? "10px 18px" : "11px 20px" }}
              >
                Enrol · £99
              </a>
              <button
                type="button"
                className="chnav-burger"
                aria-label={open ? "Close menu" : "Menu"}
                aria-expanded={open}
                aria-controls="nav-sheet"
                onClick={() => setOpen((o) => !o)}
              >
                <span className={`chnav-burger-icon${open ? " is-open" : ""}`}><i /><i /><i /></span>
              </button>
            </div>
          </div>
        </div>

        {open && (
          <>
            <div className="chnav-scrim" onClick={() => setOpen(false)} aria-hidden />
            <div id="nav-sheet" role="dialog" aria-modal="true" aria-label="Menu" className="chnav-sheet">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.id}
                  href={`#${l.id}`}
                  aria-current={activeId === l.id ? "true" : undefined}
                  className={`chnav-sheet-link${activeId === l.id ? " is-active" : ""}`}
                  onClick={(e) => { e.preventDefault(); goTo(l.id); }}
                >
                  {l.label}
                </a>
              ))}
              <a href="/cyberheroes/login" className="chnav-sheet-login" onClick={() => setOpen(false)}>Log In</a>
              <a href="/cyberheroes/signup" className="chnav-sheet-enrol" style={{ background: BTN_GRAD, boxShadow: BTN_GLOW }} onClick={() => setOpen(false)}>
                Enrol Now · £99
              </a>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}

export default function HomePage() {
  // Hero video: it AUTOPLAYS MUTED through twice (browsers only allow
  // autoplay when muted), then stops on its first frame and shows a Play
  // button. Tapping the video OR the Play button is a user gesture, so we
  // can then replay it WITH sound.
  const [heroEnded, setHeroEnded] = useState(false);
  const heroVideoRef = useRef<HTMLVideoElement | null>(null);
  const heroPlaysRef = useRef(0);
  const heroManualRef = useRef(false);

  // Kick off muted autoplay on mount. The twice-through count + the Play
  // button are driven by handleHeroEnded / playHeroWithSound below.
  useEffect(() => {
    const v = heroVideoRef.current;
    if (!v) return;
    v.muted = true;
    v.play().catch(() => {});

    // Unmuted autoplay is blocked by every browser, so we start muted and
    // unmute on the visitor's FIRST interaction ANYWHERE on the page — the
    // earliest moment audio is allowed (unmuting without a gesture just
    // makes the browser pause the clip). A pointer/key press counts;
    // scroll/hover do not. The natural second auto-pass then plays with
    // sound from the start. Fires once, then removes itself.
    const unmuteOnFirstGesture = () => {
      const vid = heroVideoRef.current;
      if (vid && !heroManualRef.current) {
        vid.muted = false;
        if (vid.paused) vid.play().catch(() => {});
      }
      window.removeEventListener("pointerdown", unmuteOnFirstGesture);
      window.removeEventListener("keydown", unmuteOnFirstGesture);
    };
    window.addEventListener("pointerdown", unmuteOnFirstGesture);
    window.addEventListener("keydown", unmuteOnFirstGesture);

    return () => {
      window.removeEventListener("pointerdown", unmuteOnFirstGesture);
      window.removeEventListener("keydown", unmuteOnFirstGesture);
    };
  }, []);

  // After a play ends: on the first (muted) autoplay, start a second pass;
  // after the second pass — or after any manual, sound-on re-watch — stop
  // on the first frame and reveal the Play button.
  const handleHeroEnded = () => {
    const v = heroVideoRef.current;
    if (!heroManualRef.current && heroPlaysRef.current === 0) {
      heroPlaysRef.current = 1;
      if (v) {
        v.currentTime = 0;
        v.play().catch(() => {});
      }
    } else {
      if (v) {
        v.pause();
        v.currentTime = 0;
      }
      setHeroEnded(true);
    }
  };

  // User gesture → allowed to play with sound. Used by the Play button and
  // by tapping the video itself.
  const playHeroWithSound = () => {
    const v = heroVideoRef.current;
    if (!v) return;
    heroManualRef.current = true;
    v.muted = false;
    v.currentTime = 0;
    setHeroEnded(false);
    v.play().catch(() => {});
  };

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
    <div style={{ background: "transparent", minHeight: "100vh" }}>
      <style>{`
        /* Fonts self-hosted + preloaded via next/font in app/cyberheroes/layout.tsx (was a render-blocking Google Fonts @import). */
        * { font-family: var(--font-nunito), sans-serif; }
        h1, h2, h3, h4, .display-font { font-family: var(--font-space-grotesk), system-ui, sans-serif; letter-spacing: -0.015em; }
        .mono { font-family: var(--font-jetbrains-mono), monospace; }
        html { scroll-behavior: smooth; }
        /* Legibility: a soft dark halo on all content text so it separates
           from the bright animated backdrop. Inherited; elements with their
           own inline text-shadow (e.g. gradient accent words) override it. */
        .ch-legible { text-shadow: 0 0 1px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.74), 0 0 16px rgba(2,4,14,0.55); }
        /* Section subtitles that float directly over the bright field: brighter
           ink + a tighter dark halo so they read cleanly over orbs/lines. */
        .ch-legible .ch-sub { color: #dbe4f3; text-shadow: 0 0 2px rgba(0,0,0,0.72), 0 1px 4px rgba(0,0,0,0.85), 0 0 16px rgba(2,4,14,0.72); }
        /* Types to the text's exact width (58 mono chars), not 100% of the
           parent - otherwise the caret keeps travelling past the text and
           parks mid-page. The blink runs 5 x 0.8s = the 1s delay + 3s typing,
           then holds its final (transparent) keyframe so the caret vanishes
           once the line is written. Keep ch width + steps in sync with the
           tagline's character count if the copy changes. */
        @keyframes chTyping { from { width: 0; } to { width: 58ch; } }
        @keyframes chBlink { 0%,100% { border-color: transparent; } 50% { border-color: #ff7a59; } }
        .ch-typewriter {
          display: inline-block; overflow: hidden; white-space: nowrap;
          border-right: 2px solid #ff7a59;
          animation: chTyping 3s steps(58) 1s forwards, chBlink 0.8s step-end 5 forwards;
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
        /* Mobile: let the typewriter tagline wrap normally instead of
           nowrap-overflowing the viewport (was a source of horizontal scroll). */
        @media (max-width: 640px) {
          .ch-typewriter { white-space: normal; border-right: none; width: auto !important; animation: none; }
        }
        .ch-lift { transition: transform 0.22s cubic-bezier(0.16,1,0.3,1), box-shadow 0.22s cubic-bezier(0.16,1,0.3,1); will-change: transform; }
        .ch-lift:hover { transform: translateY(-2px) scale(1.04); }
        .ch-lift:active { transform: scale(0.97); }
        @keyframes chSparkleFM { 0%,100% { opacity: 0.3; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); } }
        .ch-sparkle { animation: chSparkleFM 2.5s ease-in-out infinite; }
        @keyframes chRaccoonGlow { 0%,100% { box-shadow: 0 0 30px rgba(239,68,68,0.3); } 50% { box-shadow: 0 0 60px rgba(239,68,68,0.6); } }
        .ch-raccoon-glow { animation: chRaccoonGlow 3s ease-in-out infinite; }
        .ch-playbtn { transition: transform 0.18s ease; }
        .ch-playbtn:hover { transform: scale(1.08); }
        /* CTA label on the warm gradient: white pops off the orange/pink far
           better than the old near-black; the soft shadow keeps it crisp over
           the light gold end of the gradient. */
        .ch-cta-text { color: #fff; text-shadow: 0 1px 2px rgba(0,0,0,0.38); }
        /* Final CTA card: animated glow border + aurora + twinkle. */
        @keyframes chCtaFlow { to { background-position: 300% 0; } }
        .ch-cta-border { position: absolute; inset: 0; border-radius: 24px; padding: 2px; pointer-events: none; z-index: 5; background: linear-gradient(120deg, rgba(0,229,255,0.9), rgba(124,92,255,0.9), rgba(255,95,179,0.8), rgba(0,229,255,0.9)); background-size: 300% 300%; -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; opacity: 0.7; animation: chCtaFlow 8s linear infinite; }
        @keyframes chCtaAurora { to { transform: translate(-3%,2%) rotate(8deg) scale(1.08); } }
        @keyframes chCtaTwinkle { 0%,100% { opacity: 0.25; } 50% { opacity: 0.9; } }
      `}</style>

      {/* New playful-but-techy cosmic backdrop (replaces the old R3F
          TechBackground), zoomed in to fill the screen like production. */}
      <CyberHeroesPlayfulBackdrop />

      <div className="min-h-screen relative ch-legible" style={{ zIndex: 1, overflowX: "clip" }}>

        {/* ── NAV ──────────────────────────────────────────────────────────── */}
        <CyberHeroesNav />

        <main>

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 pt-28 sm:pt-36 pb-16 sm:pb-24">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Text */}
            <div className="flex-1 text-center lg:text-left">
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
              <p className="ch-sub text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 mb-4">
                Join Adam and Layla on an interactive journey to become a Cyber Hero. Fun animated lessons, games, and challenges for ages 6-9.
              </p>
              <p className="mb-4 mono" style={{ fontSize: 14, color: "#ff7a59", fontWeight: 500 }}>
                <span className="ch-typewriter">20 weeks. 40+ missions. Lifetime access, no subscriptions.</span>
              </p>
              {/* Trust line - surfaces accreditation + privacy from the
                  FAQ so it's visible above the fold. */}
              <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2 justify-center lg:justify-start"
                style={{ fontSize: 12, color: "#d1d5db", fontWeight: 600, letterSpacing: "0.04em" }}>
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
              {/* NCSC alignment mark, up in the hero so it's visible above the
                  fold like the other cyber pages (alignment, not endorsement). */}
              <div className="mb-6 flex justify-center lg:justify-start">
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 13,
                  padding: "9px 16px", borderRadius: 999,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,209,88,0.30)",
                  boxShadow: "0 0 24px -14px rgba(255,209,88,0.9)",
                }}>
                  <span style={{
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 10, fontWeight: 800, letterSpacing: "0.2em",
                    textTransform: "uppercase", color: "#ffd158",
                  }}>
                    Aligned with UK&rsquo;s National Cyber Security Centre
                  </span>
                  <span aria-hidden style={{ width: 1, height: 20, background: "rgba(255,255,255,0.18)" }} />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/logos/ncsc.svg" alt="National Cyber Security Centre" loading="lazy" style={{ height: 26, width: "auto" }} />
                </span>
              </div>
              {/* Honest trust line - no star-rating claim until real reviews exist */}
              <div className="mb-8 flex flex-wrap items-center gap-2 justify-center lg:justify-start"
                style={{ fontSize: 13, color: "#e8edff", fontWeight: 600 }}>
                <span style={{ color: "#7eff97", fontWeight: 800, fontSize: 15 }}>✓</span>
                <span>Built by parents, for parents. UK-based.</span>
              </div>
              <div className="flex gap-4 flex-wrap justify-center lg:justify-start">
                <a href="/cyberheroes/signup"
                  className="px-7 py-4 font-bold ch-cta-text text-base ch-lift"
                  style={{ background: BTN_GRAD, boxShadow: BTN_GLOW, borderRadius: 14 }}>
                  Enrol Now · £99
                </a>
                <a href="#how"
                  className="px-7 py-4 font-bold text-base inline-flex items-center gap-2 ch-lift"
                  style={{
                    color: "#00e5ff",
                    background: "rgba(0,229,255,0.06)",
                    border: "1px solid rgba(0,229,255,0.3)",
                    borderRadius: 14,
                    textDecoration: "none",
                  }}>
                  See How It Works
                </a>
              </div>
              {/* Hero counters row - staggered fade-in-up reveal */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-2xl mx-auto lg:mx-0">
                {[
                  { to: 20, suffix: "", label: "Weeks", color: "#00e5ff" },
                  { to: 40, suffix: "+", label: "Missions", color: "#7eff97" },
                  { to: 4, suffix: "", label: "Certificates", color: "#ff7a59" },
                  { to: 100, suffix: "%", label: "Hands-On", color: "#ffd158" },
                ].map((s, i) => (
                  <div
                    key={i}
                    style={{
                      background: `linear-gradient(180deg, ${s.color}14, rgba(10,13,30,0.62))`,
                      border: `1px solid ${s.color}40`,
                      boxShadow: `0 0 18px ${s.color}22, inset 0 0 14px ${s.color}10`,
                      borderRadius: 14, padding: "14px 12px", textAlign: "center",
                    }}
                  >
                    <div className="display-font" style={{ color: s.color, fontSize: 28, fontWeight: 700, lineHeight: 1, textShadow: `0 0 14px ${s.color}80` }}>
                      <CountUp to={s.to} suffix={s.suffix} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#d1d5db", letterSpacing: "0.08em", marginTop: 6, textTransform: "uppercase" }}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="flex-1 flex justify-center lg:justify-end">
              <div className="relative">
                <div className="relative">
                  {/* Ambient cosmic glow - STATIC, sits behind the video.
                      Previously this was a drop-shadow filter on the video
                      wrapper, which forced the GPU to recomposite every
                      frame and made playback stutter. A static blurred div
                      gets the same look without the per-frame cost. */}
                  <div aria-hidden style={{
                    position: "absolute",
                    inset: "-60px",
                    borderRadius: 80,
                    background: "radial-gradient(ellipse at center, rgba(124,92,255,0.55) 0%, rgba(0,229,255,0.30) 40%, rgba(255,95,179,0.20) 65%, transparent 85%)",
                    filter: "blur(48px)",
                    pointerEvents: "none",
                    zIndex: 0,
                  }} />
                  <div
                    className="relative overflow-hidden"
                    style={{
                      borderRadius: 24,
                      zIndex: 1,
                    }}
                  >
                    <video
                      ref={heroVideoRef}
                      src="/videos/cyberheroes-hero.mp4"
                      autoPlay
                      muted
                      playsInline
                      preload="auto"
                      poster="/characters/heroic.png"
                      onEnded={handleHeroEnded}
                      onClick={playHeroWithSound}
                      className="block w-full max-w-[500px]"
                      style={{ display: "block", background: "#04050d", cursor: "pointer" }}
                    />
                    {/* Vignette OVERLAY - fades the edges of the video
                        into the cosmic backdrop without applying a
                        per-frame mask to the video itself. The video
                        plays unfiltered; the GPU only paints this
                        static overlay once. Big perf win on devices
                        that struggled with mask-image-on-video. */}
                    <div aria-hidden style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 24,
                      pointerEvents: "none",
                      background:
                        "radial-gradient(ellipse 100% 100% at center, transparent 55%, rgba(8,10,22,0.55) 80%, rgba(8,10,22,0.95) 100%)",
                    }} />
                    {/* Play button — appears after the clip has played twice
                        so a child can re-watch it. */}
                    {heroEnded && (
                      <button
                        type="button"
                        onClick={playHeroWithSound}
                        aria-label="Play video with sound"
                        className="ch-playbtn"
                        style={{
                          position: "absolute",
                          inset: 0,
                          margin: "auto",
                          width: 74,
                          height: 74,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: "rgba(8, 10, 22, 0.72)",
                          border: "1.5px solid rgba(125, 240, 255, 0.6)",
                          color: "#7df0ff",
                          cursor: "pointer",
                          backdropFilter: "blur(8px)",
                          WebkitBackdropFilter: "blur(8px)",
                          boxShadow:
                            "0 6px 20px rgba(0, 0, 0, 0.5), 0 0 24px rgba(0, 229, 255, 0.45)",
                          zIndex: 3,
                        }}
                      >
                        <span style={{ fontSize: 30, marginLeft: 5, lineHeight: 1 }}>
                          ▶
                        </span>
                      </button>
                    )}
                  </div>
                </div>
                {/* Sparkles */}
                {[
                  { top: "-8px", right: "-8px", size: 14 },
                  { bottom: "12px", left: "-10px", size: 10 },
                  { top: "40%", right: "-14px", size: 8 },
                ].map((s, i) => (
                  <div key={i} className="absolute text-yellow-300 ch-sparkle"
                    style={{ ...s, fontSize: s.size, animationDelay: `${i * 0.8}s` }}>✦</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── MEET THE CHARACTERS — one compact row (owner, 28 Oct:
             "needs to be a complete mini version. Maybe on one row"). The
             villain's tile carries the condensed threat copy that used to
             live in the separate "Who is the Hacker Raccoon?" panel. ── */}
        <CastRow accentText={ACCENT_TEXT} />

        {/* ── A LOOK INSIDE — the week cards, five shown, the rest locked ─── */}
        <MissionShowcase
          weeks={CURRICULUM.flatMap((p) => p.weeks)}
          accentText={ACCENT_TEXT}
          btnGrad={BTN_GRAD}
          btnGlow={BTN_GLOW}
        />

        {/* ── FEATURES ─────────────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div
            className="mx-auto"
            data-scroll
            style={{
              maxWidth: 860,
              marginBottom: 48,
              padding: "14px 32px 18px",
              borderRadius: 28,
              background:
                "radial-gradient(ellipse 100% 100% at 50% 45%, rgba(7,10,24,0.85) 0%, rgba(7,10,24,0.5) 60%, transparent 88%)",
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 display-font" style={{ fontSize: 28, textAlign: "center" }}>
              Why Cybersecurity Matters for Kids
            </h2>
            <p className="mx-auto text-center" style={{ fontSize: 17, color: "#e2e8f0", maxWidth: 720, marginBottom: 20, lineHeight: 1.8 }}>
              Children are spending more time online than ever before - gaming, chatting, streaming, learning. But the internet wasn&apos;t designed with kids in mind. Cyberbullying, phishing scams, data harvesting, and predatory behaviour are real threats that most children have never been taught to recognise.
            </p>
            <p className="mx-auto text-center" style={{ fontSize: 17, color: "#e2e8f0", maxWidth: 720, marginBottom: 0, lineHeight: 1.8 }}>
              Schools barely scratch the surface. Parental controls can only do so much. The best protection you can give your child is the knowledge to protect themselves. That&apos;s exactly what Cyber Heroes Academy delivers - real cybersecurity skills, taught through the language kids understand best: adventure, play, and stories.
            </p>
          </div>

          {/* (removed per request: "Interactive Adventures" + "Accreditation Aligned" feature cards) */}

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
              { num: "1", title: "Enrol & Create Account", desc: "One-time payment of £99. Set up your child's profile and customise their avatar.", color: "#00e5ff" },
              { num: "2", title: "Watch the Story", desc: "Each week opens with an animated chapter where Adam, Layla, and Robo discover a new cyber threat.", color: "#34d399" },
              { num: "3", title: "Earn Badges & Level Up", desc: "Collect digital badges, unlock milestone certificates, and watch the Raccoon's power drain week by week.", color: "#ff7a59" },
              { num: "4", title: "Complete the Mission", desc: "Interactive simulations, drag-and-drop puzzles, and a boss battle finale against the Hacker Raccoon.", color: "#ffd158" },
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
                    color: s.color,
                    textShadow: `0 0 12px ${s.color}cc`,
                    lineHeight: 1,
                  }}>
                    {s.num}
                  </span>
                </div>
                <div style={{ paddingTop: 12 }}>
                  <h3 className="display-font" style={{ color: "#fff", fontSize: 22, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                  <p className="ch-sub" style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 560 }}>{s.desc}</p>
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

        {/* Sample-lesson preview removed - no free-trial path on this
             landing page. Visitors enrol straight from the pricing
             section. */}

        {/* ── ON EVERY DEVICE ─────────────────────────────────────────────── */}
        <section className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 sm:py-24">
          <div className="text-center mb-12 sm:mb-16" data-scroll>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(0,229,255,0.12)", border: "1px solid rgba(0,229,255,0.35)",
              color: "#7df0ff", borderRadius: 999, padding: "5px 14px",
              fontFamily: "var(--font-jetbrains-mono), monospace", fontSize: 11,
              fontWeight: 800, letterSpacing: "0.2em", textTransform: "uppercase",
              marginBottom: 16,
            }}>
              Anywhere · Anytime
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mb-4">
              Works on <span style={ACCENT_TEXT}>Laptop &amp; Tablet</span>
            </h2>
            <p className="ch-sub text-base sm:text-lg max-w-2xl mx-auto">
              Laptop and tablet. Same lesson, same progress, picked up anywhere - kids start in the morning on a tablet and finish on a laptop after school.
            </p>
          </div>

          <div className="relative max-w-[1040px] mx-auto flex flex-wrap items-end justify-center gap-6 sm:gap-8 px-2" data-scroll data-scroll-delay="0.15">
            {/* Big cosmic glow behind the device cluster */}
            <div aria-hidden style={{
              position: "absolute", inset: "-10%",
              background: "radial-gradient(ellipse at center, rgba(124,92,255,0.35) 0%, rgba(0,229,255,0.20) 35%, rgba(255,95,179,0.15) 60%, transparent 80%)",
              filter: "blur(60px)",
              pointerEvents: "none",
              zIndex: 0,
            }} />

            {/* (removed per request: phone mockup — product is laptop + tablet only) */}

            {/* ── LAPTOP - center, biggest ── */}
            <div
              data-scroll
              style={{
                position: "relative",
                width: "clamp(360px, 50vw, 540px)",
                aspectRatio: "16 / 10",
                filter: "drop-shadow(0 30px 60px rgba(124,92,255,0.45)) drop-shadow(0 0 90px rgba(0,229,255,0.22))",
              }}
            >
              {/* Laptop body */}
              <div style={{
                position: "absolute", inset: 0,
                borderRadius: "14px 14px 6px 6px",
                background: "linear-gradient(135deg, #1a1f3a, #0a0e22)",
                border: "2px solid rgba(125,240,255,0.45)",
                padding: "12px 12px 18px",
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
              }}>
                {/* Camera notch */}
                <div style={{ position: "absolute", top: 4, left: "50%", transform: "translateX(-50%)", width: 4, height: 4, borderRadius: "50%", background: "rgba(125,240,255,0.5)" }} />
                {/* Screen */}
                <div style={{
                  position: "relative",
                  width: "100%", height: "100%",
                  borderRadius: 6, overflow: "hidden",
                  background: "radial-gradient(ellipse at 50% 70%, #2a0d2e 0%, #1a1f4d 35%, #0f1530 70%, #04050d 100%)",
                }}>
                  <Image
                    src="/characters/heroic.png"
                    alt="Cyber Heroes lesson on a laptop"
                    width={640} height={400}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 25%" }}
                    sizes="(max-width: 768px) 70vw, 640px"
                  />
                  {/* Faint cosmic overlay */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(8,10,22,0.6) 100%)" }} />
                  {/* Caption pill */}
                  <div style={{
                    position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 9, letterSpacing: "0.2em", color: "#7df0ff",
                    background: "rgba(8,10,22,0.78)",
                    border: "1px solid rgba(125,240,255,0.4)",
                    borderRadius: 999, padding: "3px 10px",
                    textTransform: "uppercase",
                  }}>
                    ▸ Boss Battle · Week 1
                  </div>
                </div>
              </div>
              {/* Laptop base / hinge */}
              <div style={{
                position: "absolute", bottom: "-10px", left: "-4%", width: "108%", height: 14,
                borderRadius: "0 0 18px 18px",
                background: "linear-gradient(180deg, #1a1f3a, #04050d)",
                boxShadow: "0 6px 14px -2px rgba(0,0,0,0.6)",
              }} />
            </div>

            {/* ── TABLET - right ── */}
            <div
              data-scroll
              style={{
                position: "relative",
                width: "clamp(170px, 22vw, 220px)",
                aspectRatio: "4 / 5.6",
                marginBottom: 10,
                filter: "drop-shadow(0 26px 50px rgba(255,95,179,0.45)) drop-shadow(0 0 80px rgba(124,92,255,0.22))",
              }}
            >
              <div style={{
                width: "100%", height: "100%",
                borderRadius: 22,
                background: "linear-gradient(135deg, #1a1f3a, #0a0e22)",
                border: "2px solid rgba(255,95,179,0.45)",
                padding: 8,
                boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.05)",
              }}>
                <div style={{
                  position: "relative",
                  width: "100%", height: "100%",
                  borderRadius: 14, overflow: "hidden",
                  background: "radial-gradient(ellipse at 50% 70%, #2a0d2e 0%, #1a1f4d 35%, #0f1530 70%, #04050d 100%)",
                }}>
                  <Image
                    src="/characters/adam-layla-hacked.png"
                    alt="Cyber Heroes lesson on a tablet"
                    width={280} height={392}
                    style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
                    sizes="(max-width: 768px) 34vw, 280px"
                  />
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 60%, rgba(8,10,22,0.6) 100%)" }} />
                  <div style={{
                    position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)",
                    fontFamily: "var(--font-jetbrains-mono), monospace",
                    fontSize: 8, letterSpacing: "0.18em", color: "#ff9bcb",
                    background: "rgba(8,10,22,0.78)",
                    border: "1px solid rgba(255,95,179,0.4)",
                    borderRadius: 999, padding: "3px 8px",
                    textTransform: "uppercase",
                  }}>
                    ▸ Story · The Hack
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-line under the cluster */}
          <div className="text-center mt-8 sm:mt-10" data-scroll data-scroll-delay="0.5">
            <p style={{ color: "#eaf0ff", fontSize: 14, fontWeight: 600, letterSpacing: "0.02em" }}>
              Progress, badges, and certificates sync automatically - your child picks up exactly where they left off.
            </p>
          </div>
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
                background:
                  "radial-gradient(ellipse 90% 120% at 50% -10%, rgba(124,92,255,0.5), transparent 60%), radial-gradient(ellipse 80% 120% at 50% 115%, rgba(0,229,255,0.36), transparent 60%), radial-gradient(circle at 84% 28%, rgba(255,95,179,0.26), transparent 45%), linear-gradient(160deg, #241a5c 0%, #141a44 45%, #0c1030 100%)",
                boxShadow: "0 40px 90px -30px rgba(6,8,20,0.9), inset 0 0 90px rgba(124,92,255,0.18)",
              }}>
              {/* animated glow border */}
              <div aria-hidden className="ch-cta-border" />
              {/* aurora shimmer */}
              <div aria-hidden style={{
                position: "absolute", inset: "-20% -10%", zIndex: 0, pointerEvents: "none",
                background: "conic-gradient(from 200deg at 60% 40%, transparent 0deg, rgba(0,229,255,0.16) 60deg, rgba(124,92,255,0.2) 150deg, transparent 250deg)",
                filter: "blur(50px)", mixBlendMode: "screen", animation: "chCtaAurora 14s ease-in-out infinite alternate",
              }} />
              {/* starfield */}
              <div aria-hidden style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }}>
                {Array.from({ length: 34 }).map((_, i) => (
                  <span key={i} style={{
                    position: "absolute", borderRadius: "50%", background: "#fff",
                    width: 1 + (i % 3), height: 1 + (i % 3),
                    left: `${(i * 37 + 5) % 100}%`, top: `${(i * 53 + 7) % 100}%`,
                    animation: `chCtaTwinkle 3.5s ease-in-out ${(i % 7) * 0.4}s infinite`,
                  }} />
                ))}
              </div>
              {/* floating sparkles */}
              {[
                { pos: { top: "16%", left: "12%" }, d: 0 },
                { pos: { top: "24%", right: "15%" }, d: 0.8 },
                { pos: { bottom: "24%", left: "18%" }, d: 1.4 },
              ].map((s, i) => (
                <span key={i} aria-hidden className="ch-sparkle" style={{
                  position: "absolute", zIndex: 1, color: "#fffbe6", fontSize: 15,
                  ...s.pos, animationDelay: `${s.d}s`,
                }}>✦</span>
              ))}
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight"
                  style={{ textShadow: "0 2px 20px rgba(0,0,0,0.35)" }}>
                  Ready to Become a{" "}
                  <span style={ACCENT_TEXT}>
                    Cyber Hero
                  </span>?
                </h2>
                <p className="text-base sm:text-lg max-w-lg mx-auto mb-8" style={{ color: "#dbe4ff", fontWeight: 500 }}>
                  Join families across the UK giving their children the online safety skills they&apos;ll carry for life.
                </p>
                <a href="/cyberheroes/signup"
                  className="inline-block px-10 py-5 font-bold ch-cta-text text-lg ch-lift"
                  style={{ background: BTN_GRAD, boxShadow: BTN_GLOW, borderRadius: 14 }}>
                  Enrol Now · £99
                </a>
                <p className="mt-4" style={{ fontSize: 13, color: "#aeb8d6", fontWeight: 500 }}>
                  One-time payment · Instant access · Lifetime updates
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        </main>

        <footer className="border-t py-8 px-6 md:px-10" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
          <div className="max-w-[1200px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: GRAD }}>
                <CubeMark size={17} color="#ffffff" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-500">&copy; 2026 AlgorithmX. All rights reserved.</span>
                <span style={{ fontSize: 12, color: "#64748b" }}>Cybersecurity Education for Kids</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <a href="/privacy" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Privacy</a>
              <a href="/terms" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Terms</a>
              <a href="mailto:support@algorithmx.co.uk" className="text-xs font-bold text-gray-500 hover:text-gray-300 transition-colors">Contact</a>
            </div>
          </div>
        </footer>
      </div>

    </div>
  );
}
