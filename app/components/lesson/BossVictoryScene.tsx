"use client";

/**
 * Boss Victory Scene - the post-bossBattle payoff.
 *
 * "Mission complete" celebration matching the badge-earned reference:
 * a gold shield on glowing orbital rings + rays, a MISSION COMPLETE!
 * ribbon, the "Week N Badge Earned!" flourish, the badge name as a big
 * gradient title, three icon stat cards, and the lesson CTAs. Audio
 * stings + motion-intensity handling preserved from the toolkit.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useGameAudio, useMotionIntensity } from "@/app/lib/gameEngine";

export interface BossVictoryStats {
  combo: number;
  accuracy: number;
  xp: number;
  phasesCleared?: number;
  totalPhases?: number;
}

export interface BossVictorySceneProps {
  badgeIcon: string;
  badgeName: string;
  weekNumber: number;
  /** Mission name for the subtitle, e.g. "Passwords: The Secret Code". */
  missionTitle?: string;
  stats: BossVictoryStats | null;
  onClaim: () => void;
}

export default function BossVictoryScene({
  badgeName,
  weekNumber,
  missionTitle,
  stats,
  onClaim,
}: BossVictorySceneProps) {
  const audio = useGameAudio();
  const intensity = useMotionIntensity();
  const router = useRouter();
  const [shown, setShown] = useState(false);
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    setShown(true);
    // Big-win sting + defeated raccoon signature.
    audio.victory();
    audio.signature("boss-defeated");
    // Badge bloom a beat later.
    const t = window.setTimeout(
      () => {
        audio.badgeEarned();
        audio.signature("badge-bloom");
      },
      intensity === 0 ? 120 : 900,
    );
    return () => window.clearTimeout(t);
  }, [audio, intensity]);

  const handleHQ = useCallback(() => {
    audio.tap();
    router.push("/cyberhq");
  }, [audio, router]);

  const handleClaim = useCallback(() => {
    audio.tap();
    onClaim();
  }, [audio, onClaim]);

  const anim = intensity > 0;
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
        position: "relative",
        width: "100%",
        maxWidth: 1040,
        margin: "0 auto",
        padding: "8px clamp(8px,2vw,24px)",
        fontFamily: "'DM Sans', system-ui, -apple-system, sans-serif",
        color: "#fff7e6",
      }}
    >
      <SceneStyles />

      {/* Confetti (decorative, gated on motion) */}
      {anim && (
        <div aria-hidden style={{ position: "absolute", inset: "-40px 0 0", pointerEvents: "none", overflow: "hidden" }}>
          {Array.from({ length: 34 }).map((_, i) => (
            <span
              key={i}
              className="mcc-confetti"
              style={{
                left: `${(i * 2.9 + (i % 5) * 3.1) % 100}%`,
                width: i % 3 === 0 ? 11 : 6,
                height: i % 3 === 0 ? 6 : 12,
                background: ["#fbbf24", "#f59e0b", "#a78bfa", "#7c5cff", "#fde047", "#c084fc"][i % 6],
                animationDelay: `${(i * 0.24) % 5}s`,
                animationDuration: `${3.8 + (i % 4) * 0.9}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Card */}
      <div
        className={anim ? "mcc-card mcc-card-in" : "mcc-card"}
        style={{
          position: "relative",
          borderRadius: 26,
          padding: "clamp(16px,3vw,38px) clamp(18px,4vw,56px) clamp(22px,3vw,34px)",
          background: "linear-gradient(180deg, rgba(22,18,54,0.6), rgba(11,9,30,0.64))",
          border: "1.5px solid rgba(96,140,255,0.32)",
          boxShadow: "0 26px 80px rgba(0,0,0,0.55), inset 0 0 70px rgba(70,48,140,0.22)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          opacity: shown || !anim ? 1 : 0,
        }}
      >
        {/* Gold corner brackets */}
        <span style={{ ...cornerBase, top: 14, left: 14, borderTop: "2px solid", borderLeft: "2px solid", borderTopLeftRadius: 10 }} />
        <span style={{ ...cornerBase, top: 14, right: 14, borderTop: "2px solid", borderRight: "2px solid", borderTopRightRadius: 10 }} />
        <span style={{ ...cornerBase, bottom: 14, left: 14, borderBottom: "2px solid", borderLeft: "2px solid", borderBottomLeftRadius: 10 }} />
        <span style={{ ...cornerBase, bottom: 14, right: 14, borderBottom: "2px solid", borderRight: "2px solid", borderBottomRightRadius: 10 }} />

        {/* Shield stage */}
        <div style={{ position: "relative", width: 260, height: 224, display: "grid", placeItems: "center", marginBottom: 4 }}>
          <span aria-hidden className={anim ? "mcc-rays" : "mcc-rays mcc-rays-static"} />
          <span aria-hidden className="mcc-ring mcc-ring-1" style={anim ? undefined : { animation: "none" }} />
          <span aria-hidden className="mcc-ring mcc-ring-2" style={anim ? undefined : { animation: "none" }} />
          <span aria-hidden className="mcc-ring mcc-ring-3" style={anim ? undefined : { animation: "none" }} />
          <ShieldMark anim={anim} />
          <div className="mcc-ribbon">
            <span aria-hidden>★</span> MISSION COMPLETE! <span aria-hidden>★</span>
          </div>
        </div>

        {/* Week N Badge Earned */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 18,
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

        {/* Badge name title */}
        <h1
          style={{
            margin: "4px 0 6px",
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 900,
            fontSize: "clamp(38px,6.4vw,80px)",
            lineHeight: 1.02,
            letterSpacing: "-0.022em",
            background: "linear-gradient(180deg, #ffffff 0%, #d4dcf7 52%, #9fabd8 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            filter: "drop-shadow(0 4px 22px rgba(160,180,255,0.28))",
          }}
        >
          {badgeName}
        </h1>

        {/* Subtitle */}
        <p style={{ color: "#b3a4e0", fontSize: "clamp(14px,1.6vw,18px)", margin: "0 0 clamp(20px,3vw,30px)", opacity: 0.92 }}>
          {missionTitle
            ? `You completed the ${missionTitle} mission!`
            : "You completed this week's mission!"}
        </p>

        {/* Stat cards */}
        <div style={{ display: "flex", alignItems: "stretch", justifyContent: "center", flexWrap: "wrap", gap: 0, marginBottom: "clamp(22px,3vw,34px)" }}>
          <StatCard accent="#fbbf24" label="XP earned" value={`+${stats?.xp ?? 0}`} icon={<XpIcon />} />
          <StatDivider />
          <StatCard accent="#34d399" label="Accuracy" value={`${stats?.accuracy ?? 0}%`} icon={<TargetIcon />} />
          <StatDivider />
          <StatCard accent="#a78bfa" label="Best combo" value={`${stats?.combo ?? 0}x`} icon={<BoltIcon />} />
        </div>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center", width: "100%" }}>
          <button type="button" onClick={handleHQ} className="mcc-btn mcc-btn-secondary">
            <ShieldMini /> Visit Cyber HQ
          </button>
          <button type="button" onClick={handleClaim} className="mcc-btn mcc-btn-primary">
            Claim Badge <span aria-hidden>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Shield + icons ────────────────────────────────────────────── */
function ShieldMark({ anim }: { anim: boolean }) {
  return (
    <svg className={anim ? "mcc-shield" : undefined} viewBox="0 0 120 140" width="148" height="172" aria-hidden style={{ position: "relative", zIndex: 2 }}>
      <defs>
        <linearGradient id="mccShield" x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" stopColor="#fff2c2" />
          <stop offset="34%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
        <linearGradient id="mccShieldEdge" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fff7d6" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>
      <path d="M60 5 L106 23 V70 Q106 112 60 135 Q14 112 14 70 V23 Z" fill="url(#mccShield)" stroke="url(#mccShieldEdge)" strokeWidth="4" strokeLinejoin="round" />
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

function StatCard({ accent, label, value, icon }: { accent: string; label: string; value: string; icon: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px clamp(16px,2.2vw,28px)", borderRadius: 18, background: "rgba(12,10,32,0.55)", border: "1px solid rgba(120,130,190,0.18)", minWidth: 184 }}>
      <span style={{ flexShrink: 0, width: 44, height: 44, borderRadius: 12, display: "grid", placeItems: "center", color: accent, background: `${accent}1e`, border: `1px solid ${accent}55`, boxShadow: `0 0 16px ${accent}33` }}>
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
  return <span aria-hidden style={{ alignSelf: "center", width: 1, height: 46, margin: "0 clamp(6px,1.4vw,18px)", background: "linear-gradient(180deg, transparent, rgba(150,160,220,0.4), transparent)" }} />;
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

/* ── Scoped styles ─────────────────────────────────────────────── */
function SceneStyles() {
  return (
    <style jsx global>{`
      @keyframes mccConfettiFall {
        0% { transform: translateY(-14vh) rotate(0deg); opacity: 0; }
        12% { opacity: 1; }
        100% { transform: translateY(120vh) rotate(540deg); opacity: 0.9; }
      }
      .mcc-confetti { position: absolute; top: -8vh; border-radius: 2px; animation-name: mccConfettiFall; animation-timing-function: linear; animation-iteration-count: infinite; }
      @keyframes mccCardIn { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: none; } }
      .mcc-card-in { animation: mccCardIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
      @keyframes mccShieldFloat {
        0%,100% { transform: translateY(0); filter: drop-shadow(0 10px 22px rgba(217,119,6,0.55)) drop-shadow(0 0 30px rgba(251,191,36,0.5)); }
        50% { transform: translateY(-6px); filter: drop-shadow(0 14px 28px rgba(217,119,6,0.65)) drop-shadow(0 0 46px rgba(251,191,36,0.75)); }
      }
      .mcc-shield { animation: mccShieldFloat 3s ease-in-out infinite; }
      .mcc-rays {
        position: absolute; width: 330px; height: 330px; top: -50px; border-radius: 50%;
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
        animation: mccRaySpin 26s linear infinite; opacity: 0.7;
      }
      .mcc-rays-static { animation: none; opacity: 0.5; }
      @keyframes mccRaySpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      .mcc-ring { position: absolute; border-radius: 50%; border: 2px solid rgba(251,191,36,0.5); box-shadow: 0 0 18px rgba(251,191,36,0.4); transform: rotateX(72deg); animation: mccRingPulse 3.2s ease-in-out infinite; }
      .mcc-ring-1 { width: 190px; height: 190px; top: 70px; }
      .mcc-ring-2 { width: 250px; height: 250px; top: 56px; opacity: 0.6; animation-delay: .4s; }
      .mcc-ring-3 { width: 310px; height: 310px; top: 40px; opacity: 0.35; animation-delay: .8s; }
      @keyframes mccRingPulse { 0%,100% { opacity: 0.5; } 50% { opacity: 0.15; } }
      .mcc-ribbon {
        position: absolute; bottom: 6px; left: 50%; transform: translateX(-50%); white-space: nowrap; z-index: 3;
        background: linear-gradient(180deg, #7c5cff, #5b3fd6); color: #fff; font-family: 'Space Grotesk', sans-serif; font-weight: 800;
        font-size: 14px; letter-spacing: 0.06em; padding: 8px 26px; border-radius: 6px;
        box-shadow: 0 8px 20px rgba(60,30,140,0.55), inset 0 1px 0 rgba(255,255,255,0.3);
      }
      .mcc-ribbon span { color: #ffd94a; }
      .mcc-ribbon::before, .mcc-ribbon::after { content: ""; position: absolute; top: 100%; width: 0; height: 0; border-style: solid; }
      .mcc-ribbon::before { left: 0; border-width: 7px 0 0 12px; border-color: transparent transparent transparent #3f2ba0; }
      .mcc-ribbon::after { right: 0; border-width: 7px 12px 0 0; border-color: transparent #3f2ba0 transparent transparent; }
      .mcc-btn { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; padding: 15px 30px; border-radius: 100px; font-weight: 800; font-size: 16px; font-family: 'DM Sans', system-ui, sans-serif; letter-spacing: 0.01em; transition: transform .18s ease, box-shadow .18s ease; }
      .mcc-btn:hover { transform: translateY(-2px); }
      .mcc-btn-secondary { background: rgba(18,16,44,0.7); color: #dbe3ff; border: 1.5px solid rgba(120,130,190,0.4); }
      .mcc-btn-secondary:hover { border-color: rgba(150,165,230,0.7); }
      .mcc-btn-primary { background: linear-gradient(135deg, #f97316, #ea580c); color: #fff; border: none; box-shadow: 0 10px 30px rgba(249,115,22,0.55), 0 0 0 1px rgba(255,255,255,0.14) inset; }
      .mcc-btn-primary:hover { box-shadow: 0 14px 38px rgba(249,115,22,0.7), 0 0 0 1px rgba(255,255,255,0.2) inset; }
    `}</style>
  );
}
