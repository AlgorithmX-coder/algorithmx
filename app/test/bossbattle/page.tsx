"use client";

import { useEffect, useState } from "react";
import BossBattle from "@/app/components/game/BossBattle";
import { WEEK_1 } from "@/app/lesson/weekContent/week1";

type Stats = { combo: number; accuracy: number; xp: number };

export default function TestBoss() {
  const [badgeStats, setBadgeStats] = useState<Stats | null>(null);

  useEffect(() => {
    const prevHtml = document.documentElement.style.cssText;
    const prevBody = document.body.style.cssText;
    document.documentElement.style.cssText =
      "margin:0;padding:0;width:100%;height:100%;overflow:hidden;";
    document.body.style.cssText =
      "margin:0;padding:0;width:100%;height:100%;overflow:hidden;";
    return () => {
      document.documentElement.style.cssText = prevHtml;
      document.body.style.cssText = prevBody;
    };
  }, []);

  if (badgeStats) {
    return <BadgeEarned stats={badgeStats} />;
  }

  return (
    <BossBattle
      // Use Week 1's real password-themed boss phases so the QA harness
      // matches the live /lesson/1 boss (was falling back to BossBattle's
      // generic built-in defaults, which mix in off-topic safety questions).
      phases={WEEK_1.bossPhases}
      onEnd={(won, stats) => {
        console.log("Game ended:", won, stats);
        if (won) setBadgeStats(stats);
      }}
    />
  );
}

/* ────────────────────────────────────────────────────────────────
 * Mission-complete / badge-earned payoff screen.
 * Rebuilt to match the polished reference: gold shield on glowing
 * orbital rings + rays, a "MISSION COMPLETE!" ribbon, the badge
 * flourish, a big gradient title, three icon stat cards, and the two
 * CTAs. Exported so it can be previewed in isolation.
 * ──────────────────────────────────────────────────────────────── */
export function BadgeEarned({
  stats,
  weekNumber = 1,
}: {
  stats: Stats;
  weekNumber?: number;
}) {
  const cornerBase: React.CSSProperties = {
    position: "absolute",
    width: 26,
    height: 26,
    borderColor: "rgba(251,191,36,0.6)",
    pointerEvents: "none",
  };
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        background:
          "radial-gradient(ellipse 70% 55% at 50% 122%, rgba(90,40,150,0.55), transparent 60%), radial-gradient(ellipse 85% 60% at 50% -12%, rgba(40,32,110,0.7), transparent 55%), linear-gradient(180deg, #090a1f 0%, #0d0824 100%)",
      }}
    >
      <BadgeStyles />

      {/* Confetti */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <span
            key={i}
            className="be-confetti"
            style={{
              left: `${(i * 2.5 + (i % 5) * 3.1) % 100}%`,
              width: i % 3 === 0 ? 11 : 6,
              height: i % 3 === 0 ? 6 : 12,
              background: ["#fbbf24", "#f59e0b", "#a78bfa", "#7c5cff", "#fde047", "#c084fc"][i % 6],
              animationDelay: `${(i * 0.21) % 5}s`,
              animationDuration: `${3.8 + (i % 4) * 0.9}s`,
            }}
          />
        ))}
      </div>

      {/* Card */}
      <div
        style={{
          position: "relative",
          width: "min(1040px, 94vw)",
          borderRadius: 28,
          padding: "clamp(20px,3.5vw,44px) clamp(20px,4vw,64px) clamp(26px,3.5vw,40px)",
          background: "linear-gradient(180deg, rgba(22,18,54,0.62), rgba(11,9,30,0.66))",
          border: "1.5px solid rgba(96,140,255,0.32)",
          boxShadow: "0 30px 90px rgba(0,0,0,0.6), inset 0 0 70px rgba(70,48,140,0.22)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        {/* Gold corner brackets */}
        <span style={{ ...cornerBase, top: 14, left: 14, borderTop: "2px solid", borderLeft: "2px solid", borderTopLeftRadius: 10 }} />
        <span style={{ ...cornerBase, top: 14, right: 14, borderTop: "2px solid", borderRight: "2px solid", borderTopRightRadius: 10 }} />
        <span style={{ ...cornerBase, bottom: 14, left: 14, borderBottom: "2px solid", borderLeft: "2px solid", borderBottomLeftRadius: 10 }} />
        <span style={{ ...cornerBase, bottom: 14, right: 14, borderBottom: "2px solid", borderRight: "2px solid", borderBottomRightRadius: 10 }} />

        {/* Shield stage: rays + rings + shield + ribbon */}
        <div style={{ position: "relative", width: 260, height: 236, display: "grid", placeItems: "center", marginBottom: 6 }}>
          <span aria-hidden className="be-rays" />
          <span aria-hidden className="be-ring be-ring-1" />
          <span aria-hidden className="be-ring be-ring-2" />
          <span aria-hidden className="be-ring be-ring-3" />
          <ShieldMark />
          <div className="be-ribbon">
            <span aria-hidden>★</span> MISSION COMPLETE! <span aria-hidden>★</span>
          </div>
        </div>

        {/* Week N Badge Earned */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 20,
            color: "#fbbf24",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(15px,2vw,21px)",
            letterSpacing: "0.01em",
            textShadow: "0 0 16px rgba(251,191,36,0.5)",
          }}
        >
          <span aria-hidden style={{ opacity: 0.7, letterSpacing: "-2px" }}>‹‹‹</span>
          Week {weekNumber} Badge Earned!
          <span aria-hidden style={{ opacity: 0.7, letterSpacing: "-2px" }}>›››</span>
        </div>

        {/* Title */}
        <h1
          style={{
            margin: "4px 0 6px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(40px,7vw,86px)",
            lineHeight: 1,
            letterSpacing: "-0.022em",
            background: "linear-gradient(180deg, #ffffff 0%, #d4dcf7 52%, #9fabd8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 4px 22px rgba(160,180,255,0.28))",
          }}
        >
          Password Protector
        </h1>

        {/* Subtitle */}
        <p style={{ color: "#b3a4e0", fontSize: "clamp(14px,1.6vw,18px)", margin: "0 0 clamp(22px,3vw,32px)", opacity: 0.92 }}>
          You completed the Passwords: The Secret Code mission!
        </p>

        {/* Stat cards */}
        <div
          style={{
            display: "flex",
            alignItems: "stretch",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: 0,
            marginBottom: "clamp(24px,3vw,36px)",
          }}
        >
          <StatCard accent="#fbbf24" label="XP earned" value={String(stats.xp)} icon={<XpIcon />} />
          <StatDivider />
          <StatCard accent="#34d399" label="Accuracy" value={`${stats.accuracy}%`} icon={<TargetIcon />} />
          <StatDivider />
          <StatCard accent="#a78bfa" label="Best combo" value={`${stats.combo}x`} icon={<BoltIcon />} />
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          <a href="/dashboard" className="be-btn be-btn-secondary">
            <ShieldMini /> Back to Dashboard
          </a>
          <a href="#" className="be-btn be-btn-primary">
            Continue to Week 2 <span aria-hidden>→</span>
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Shield with checkmark ─────────────────────────────────────── */
function ShieldMark() {
  return (
    <svg className="be-shield" viewBox="0 0 120 140" width="150" height="175" aria-hidden style={{ position: "relative", zIndex: 2 }}>
      <defs>
        <linearGradient id="beShield" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#fff2c2" />
          <stop offset="34%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="beShieldEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff7d6" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path
        d="M60 5 L106 23 V70 Q106 112 60 135 Q14 112 14 70 V23 Z"
        fill="url(#beShield)"
        stroke="url(#beShieldEdge)"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path d="M60 12 L100 27 V70 Q100 106 60 127 Q20 106 20 70 V27 Z" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
      <path d="M41 70 l13 15 l27 -33" stroke="#5a3a05" strokeWidth="8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldMini() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M12 3l7 2.6V11c0 4.4-3 7-7 8.4C8 18 5 15.4 5 11V5.6L12 3z" strokeLinejoin="round" />
      <path d="M9.2 11.5l1.9 2 3.7-4.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Stat cards ────────────────────────────────────────────────── */
function StatCard({ accent, label, value, icon }: { accent: string; label: string; value: string; icon: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px clamp(18px,2.4vw,30px)",
        borderRadius: 18,
        background: "rgba(12,10,32,0.55)",
        border: "1px solid rgba(120,130,190,0.18)",
        minWidth: 190,
      }}
    >
      <span
        style={{
          flexShrink: 0,
          width: 44,
          height: 44,
          borderRadius: 12,
          display: "grid",
          placeItems: "center",
          color: accent,
          background: `${accent}1e`,
          border: `1px solid ${accent}55`,
          boxShadow: `0 0 16px ${accent}33`,
        }}
      >
        {icon}
      </span>
      <span style={{ textAlign: "left", lineHeight: 1.1 }}>
        <span style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: "#a7b0d6", marginBottom: 3 }}>{label}:</span>
        <span style={{ display: "block", fontFamily: "'Space Grotesk', sans-serif", fontSize: 30, fontWeight: 900, color: accent, textShadow: `0 0 16px ${accent}55` }}>{value}</span>
      </span>
    </div>
  );
}

function StatDivider() {
  return (
    <span
      aria-hidden
      style={{
        alignSelf: "center",
        width: 1,
        height: 46,
        margin: "0 clamp(6px,1.4vw,18px)",
        background: "linear-gradient(180deg, transparent, rgba(150,160,220,0.4), transparent)",
      }}
    />
  );
}

function XpIcon() {
  return (
    <svg viewBox="0 0 32 32" width="26" height="26" aria-hidden>
      <polygon points="16,3 27,9.5 27,22.5 16,29 5,22.5 5,9.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <text x="16" y="20.5" textAnchor="middle" fontSize="10" fontWeight="900" fill="currentColor" fontFamily="'Space Grotesk', sans-serif">XP</text>
    </svg>
  );
}
function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
function BoltIcon() {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="currentColor" />
    </svg>
  );
}

/* ── Scoped styles + keyframes ─────────────────────────────────── */
function BadgeStyles() {
  return (
    <style>{`
      @keyframes beConfettiFall {
        0%   { transform: translateY(-12vh) rotate(0deg); opacity: 0; }
        12%  { opacity: 1; }
        100% { transform: translateY(112vh) rotate(540deg); opacity: 0.9; }
      }
      .be-confetti {
        position: absolute; top: -6vh; border-radius: 2px;
        animation-name: beConfettiFall; animation-timing-function: linear; animation-iteration-count: infinite;
      }
      @keyframes beShieldFloat {
        0%,100% { transform: translateY(0); filter: drop-shadow(0 10px 22px rgba(217,119,6,0.55)) drop-shadow(0 0 30px rgba(251,191,36,0.5)); }
        50%     { transform: translateY(-6px); filter: drop-shadow(0 14px 28px rgba(217,119,6,0.65)) drop-shadow(0 0 46px rgba(251,191,36,0.75)); }
      }
      .be-shield { animation: beShieldFloat 3s ease-in-out infinite; }
      .be-rays {
        position: absolute; width: 340px; height: 340px; top: -46px; border-radius: 50%;
        background: conic-gradient(from 0deg,
          rgba(253,224,71,0.30) 0deg, transparent 10deg, rgba(253,224,71,0.30) 20deg, transparent 30deg,
          rgba(253,224,71,0.30) 40deg, transparent 50deg, rgba(253,224,71,0.30) 60deg, transparent 70deg,
          rgba(253,224,71,0.30) 80deg, transparent 90deg, rgba(253,224,71,0.30) 100deg, transparent 110deg,
          rgba(253,224,71,0.30) 120deg, transparent 130deg, rgba(253,224,71,0.30) 140deg, transparent 150deg,
          rgba(253,224,71,0.30) 160deg, transparent 170deg, rgba(253,224,71,0.30) 180deg, transparent 190deg,
          rgba(253,224,71,0.30) 200deg, transparent 210deg, rgba(253,224,71,0.30) 220deg, transparent 230deg,
          rgba(253,224,71,0.30) 240deg, transparent 250deg, rgba(253,224,71,0.30) 260deg, transparent 270deg,
          rgba(253,224,71,0.30) 280deg, transparent 290deg, rgba(253,224,71,0.30) 300deg, transparent 310deg,
          rgba(253,224,71,0.30) 320deg, transparent 330deg, rgba(253,224,71,0.30) 340deg, transparent 350deg);
        filter: blur(1px);
        -webkit-mask-image: radial-gradient(circle, #000 20%, transparent 70%);
        mask-image: radial-gradient(circle, #000 20%, transparent 70%);
        animation: beRaySpin 26s linear infinite; opacity: 0.7;
      }
      @keyframes beRaySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .be-ring {
        position: absolute; border-radius: 50%; border: 2px solid rgba(251,191,36,0.5);
        box-shadow: 0 0 18px rgba(251,191,36,0.4); transform: rotateX(72deg);
        animation: beRingPulse 3.2s ease-in-out infinite;
      }
      .be-ring-1 { width: 190px; height: 190px; top: 74px; }
      .be-ring-2 { width: 250px; height: 250px; top: 60px; opacity: 0.6; animation-delay: .4s; }
      .be-ring-3 { width: 310px; height: 310px; top: 44px; opacity: 0.35; animation-delay: .8s; }
      @keyframes beRingPulse { 0%,100% { opacity: var(--o,0.5); } 50% { opacity: 0.15; } }
      .be-ribbon {
        position: absolute; bottom: 8px; left: 50%; transform: translateX(-50%);
        white-space: nowrap; z-index: 3;
        background: linear-gradient(180deg, #7c5cff, #5b3fd6);
        color: #fff; font-family: 'Space Grotesk', sans-serif; font-weight: 800;
        font-size: 14px; letter-spacing: 0.06em; padding: 8px 26px; border-radius: 6px;
        box-shadow: 0 8px 20px rgba(60,30,140,0.55), inset 0 1px 0 rgba(255,255,255,0.3);
      }
      .be-ribbon span { color: #ffd94a; }
      .be-ribbon::before, .be-ribbon::after {
        content: ""; position: absolute; top: 100%; width: 0; height: 0; border-style: solid;
      }
      .be-ribbon::before { left: 0; border-width: 7px 0 0 12px; border-color: transparent transparent transparent #3f2ba0; }
      .be-ribbon::after  { right: 0; border-width: 7px 12px 0 0; border-color: transparent #3f2ba0 transparent transparent; }
      .be-btn {
        display: inline-flex; align-items: center; gap: 10px; text-decoration: none;
        padding: 15px 30px; border-radius: 100px; font-weight: 800; font-size: 16px;
        font-family: 'DM Sans', system-ui, sans-serif; letter-spacing: 0.01em;
        transition: transform .18s ease, box-shadow .18s ease;
      }
      .be-btn:hover { transform: translateY(-2px); }
      .be-btn-secondary { background: rgba(18,16,44,0.7); color: #dbe3ff; border: 1.5px solid rgba(120,130,190,0.4); }
      .be-btn-secondary:hover { border-color: rgba(150,165,230,0.7); }
      .be-btn-primary {
        background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none;
        box-shadow: 0 10px 30px rgba(249,115,22,0.55), 0 0 0 1px rgba(255,255,255,0.14) inset;
      }
      .be-btn-primary:hover { box-shadow: 0 14px 38px rgba(249,115,22,0.7), 0 0 0 1px rgba(255,255,255,0.2) inset; }
    `}</style>
  );
}
