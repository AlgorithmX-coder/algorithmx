"use client";

/**
 * /heropreview?theme=1..20 - OWNER PREVIEW ONLY, never linked from the
 * site and deleted before any ship. Renders the REAL 3D machine
 * (HeroCinematicV3, true angle, true scroll boot) over 20 candidate
 * theme backdrops, so the owner judges real frames rather than CSS
 * mock-ups (2026-10-09 round five).
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import HeroCinematic from "@/app/components/landing-v2/HeroCinematicV3";

const AGES = ["AGES 6-9", "10-13", "14-17", "18+", "SCHOOLS", "WORKPLACE"];

const ACCREDITATIONS: Array<{ src: string; alt: string; label: string; dark?: boolean; h: number }> = [
  { src: "/logos/cyber-essentials.png", alt: "Cyber Essentials", label: "Certified", h: 20 },
  { src: "/logos/ncsc.svg", alt: "National Cyber Security Centre", label: "Aligned", dark: true, h: 19 },
  { src: "/logos/microsoft-for-startups.webp", alt: "Microsoft for Startups", label: "Collaborating", h: 15 },
  { src: "/logos/asdan.jpg", alt: "ASDAN", label: "Accredited", h: 20 },
];

/* Shared soft shadow under the machine; dark surfaces get a deeper one,
 * abstract grounds a fainter hover shadow. */
function Shadow({ strength = 0.3, blur = 6 }: { strength?: number; blur?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: "calc(50% + 16vw)",
        top: "50%",
        width: 740,
        height: 540,
        transform: "translate(-46%, -42%) rotate(-17deg)",
        borderRadius: 60,
        background: `radial-gradient(ellipse 52% 48% at 50% 50%, rgba(25,22,16,${strength}), rgba(25,22,16,${strength * 0.35}) 55%, transparent 74%)`,
        filter: `blur(${blur}px)`,
      }}
    />
  );
}

function Img({ src }: { src: string }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />;
}

interface Theme {
  name: string;
  /** Ink colour scheme for copy: "ink" on light, "paper" on dark. */
  dark?: boolean;
  bg: React.ReactNode;
}

const THEMES: Theme[] = [
  {
    name: "OAK FLAT-LAY",
    bg: (<><Img src="/landing/hero-desk2.webp" /><Shadow /></>),
  },
  {
    name: "WHITE MARBLE",
    bg: (<><Img src="/landing/theme-marble.webp" /><Shadow strength={0.24} /></>),
  },
  {
    name: "DARK WALNUT",
    dark: true,
    bg: (<><Img src="/landing/theme-walnut.webp" /><div style={{ position: "absolute", inset: 0, background: "rgba(20,14,8,0.2)" }} /><Shadow strength={0.5} /></>),
  },
  {
    name: "CONCRETE STUDIO",
    bg: (<><Img src="/landing/theme-concrete.webp" /><Shadow strength={0.28} /></>),
  },
  {
    name: "CREAM LINEN",
    bg: (<><Img src="/landing/theme-linen.webp" /><Shadow strength={0.26} /></>),
  },
  {
    name: "TERRAZZO",
    bg: (<><Img src="/landing/theme-terrazzo.webp" /><Shadow strength={0.26} /></>),
  },
  {
    name: "PAPER SWEEP",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #faf6ee 0%, #f3ecdf 60%, #e9dfcc 100%)" }} />
        <div style={{ position: "absolute", left: "calc(50% + 10vw)", top: "40%", width: "60vw", height: "60vw", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.9), transparent 62%)" }} />
        <Shadow strength={0.22} blur={10} />
      </>
    ),
  },
  {
    name: "SAND DUNE",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #f6ead6 0%, #eeD9b9 45%, #e3c89e 100%)".replace("#eeD9b9", "#eed9b9") }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 30% 20%, rgba(255,250,240,0.8), transparent 60%)" }} />
        <Shadow strength={0.26} blur={9} />
      </>
    ),
  },
  {
    name: "BLUEPRINT PAPER",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#f4f6f5" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(10,112,133,0.1) 0 1px, transparent 1px 42px), repeating-linear-gradient(90deg, rgba(10,112,133,0.1) 0 1px, transparent 1px 42px), repeating-linear-gradient(0deg, rgba(10,112,133,0.05) 0 1px, transparent 1px 8.4px), repeating-linear-gradient(90deg, rgba(10,112,133,0.05) 0 1px, transparent 1px 8.4px)" }} />
        <Shadow strength={0.2} blur={10} />
      </>
    ),
  },
  {
    name: "DOT MATRIX",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#f9f6ef" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(20,22,29,0.16) 1.2px, transparent 1.2px)", backgroundSize: "24px 24px" }} />
        <Shadow strength={0.2} blur={10} />
      </>
    ),
  },
  {
    name: "PASTEL AURORA",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#fcfaf6" }} />
        <div style={{ position: "absolute", width: "54vw", height: "54vw", left: "-16vw", top: "-18vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.2), transparent 65%)", filter: "blur(44px)" }} />
        <div style={{ position: "absolute", width: "48vw", height: "48vw", right: "-10vw", top: "-6vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,123,255,0.18), transparent 65%)", filter: "blur(44px)" }} />
        <div style={{ position: "absolute", width: "46vw", height: "46vw", left: "28vw", bottom: "-22vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(244,114,182,0.15), transparent 65%)", filter: "blur(44px)" }} />
        <Shadow strength={0.18} blur={12} />
      </>
    ),
  },
  {
    name: "TEAL STUDIO",
    dark: true,
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #0d7c93 0%, #0a7085 55%, #075a6b 100%)" }} />
        <div style={{ position: "absolute", left: "calc(50% + 12vw)", top: "38%", width: "56vw", height: "56vw", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(185,240,255,0.3), transparent 62%)" }} />
        <Shadow strength={0.5} blur={10} />
      </>
    ),
  },
  {
    name: "MESH BRIGHT",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#fdfbf7" }} />
        <div style={{ position: "absolute", width: "60vw", height: "44vw", left: "-14vw", top: "-12vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(34,211,238,0.34), transparent 62%)", filter: "blur(56px)" }} />
        <div style={{ position: "absolute", width: "54vw", height: "42vw", right: "-12vw", bottom: "-14vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(165,17,127,0.22), transparent 62%)", filter: "blur(56px)" }} />
        <div style={{ position: "absolute", width: "40vw", height: "36vw", left: "34vw", top: "30%", borderRadius: "50%", background: "radial-gradient(circle, rgba(139,123,255,0.26), transparent 62%)", filter: "blur(56px)" }} />
        <Shadow strength={0.2} blur={12} />
      </>
    ),
  },
  {
    name: "SAGE BOARD",
    dark: true,
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #5d7466 0%, #51685a 60%, #46594e 100%)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.25, backgroundImage: "radial-gradient(rgba(255,255,255,0.25) 1px, transparent 1px)", backgroundSize: "3px 3px" }} />
        <Shadow strength={0.45} blur={9} />
      </>
    ),
  },
  {
    name: "HALO RING",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#faf7f1" }} />
        <div style={{ position: "absolute", left: "calc(50% + 16vw)", top: "48%", width: 860, height: 860, transform: "translate(-50%,-50%)", borderRadius: "50%", border: "2px solid rgba(10,112,133,0.3)" }} />
        <div style={{ position: "absolute", left: "calc(50% + 16vw)", top: "48%", width: 1060, height: 1060, transform: "translate(-50%,-50%)", borderRadius: "50%", border: "1px dashed rgba(10,112,133,0.18)" }} />
        <Shadow strength={0.2} blur={10} />
      </>
    ),
  },
  {
    name: "LIGHT RAYS",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#fbf8f1" }} />
        <div style={{ position: "absolute", inset: "-20%", background: "repeating-linear-gradient(115deg, rgba(255,214,140,0.22) 0 70px, transparent 70px 190px)", filter: "blur(22px)" }} />
        <Shadow strength={0.22} blur={10} />
      </>
    ),
  },
  {
    name: "ARCTIC MIST",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f3f7f9 0%, #e8f0f3 55%, #dce8ec 100%)" }} />
        <div style={{ position: "absolute", width: "60vw", height: "30vw", left: "20vw", top: "46%", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,255,255,0.95), transparent 65%)", filter: "blur(30px)" }} />
        <Shadow strength={0.24} blur={10} />
      </>
    ),
  },
  {
    name: "INK CIRCUIT CORNERS",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#f8f4ec" }} />
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          <g stroke="rgba(10,112,133,0.25)" fill="none" strokeWidth={1.4}>
            <path d="M-20,100 H400 V-20" />
            <path d="M-20,170 H330 V-20" opacity={0.6} />
            <path d="M1460,700 H1040 V820" />
            <path d="M1460,630 H1120 V820" opacity={0.6} />
          </g>
          <g fill="rgba(10,112,133,0.45)">
            <circle cx={400} cy={100} r={3.4} />
            <circle cx={1040} cy={700} r={3.4} />
          </g>
        </svg>
        <Shadow strength={0.22} blur={10} />
      </>
    ),
  },
  {
    name: "GOLD DUSK",
    dark: true,
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #3c2f1e 0%, #6b4f27 45%, #b98a44 100%)" }} />
        <div style={{ position: "absolute", width: "70vw", height: "40vw", left: "16vw", bottom: "-16vw", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,204,128,0.5), transparent 65%)", filter: "blur(40px)" }} />
        <Shadow strength={0.55} blur={9} />
      </>
    ),
  },
  {
    name: "GRAPH MINIMAL",
    bg: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#fcfaf5" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(20,22,29,0.07) 0 1px, transparent 1px 110px), repeating-linear-gradient(90deg, rgba(20,22,29,0.07) 0 1px, transparent 1px 110px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "50%", height: 1, background: "rgba(10,112,133,0.25)" }} />
        <Shadow strength={0.18} blur={12} />
      </>
    ),
  },
];

/* Angle presets so the owner can point at the correct facing instead
 * of describing it: a = shipped -17, then alternatives. */
const ROTS: Record<string, number> = { a: -17, b: 17, c: 0, d: -32, e: 32 };

function Inner() {
  const params = useSearchParams();
  const n = Math.min(20, Math.max(1, parseInt(params.get("theme") ?? "1", 10) || 1));
  const rotKey = (params.get("rot") ?? "a").toLowerCase();
  const rotZ = ROTS[rotKey] ?? -17;
  const t = THEMES[n - 1];
  const ink = t.dark ? "#f4f7ff" : "#14161d";
  const soft = t.dark ? "rgba(230,238,252,0.85)" : "#3c4351";
  const chipInk = t.dark ? "#bfeaff" : "#075a6b";
  const chipBorder = t.dark ? "rgba(191,234,255,0.45)" : "rgba(10,112,133,0.4)";
  const chipBg = t.dark ? "rgba(10,20,30,0.25)" : "rgba(255,253,248,0.72)";

  const grad = t.dark
    ? "linear-gradient(92deg, #2fe3ff 0%, #8b7bff 55%, #ff5fb0 100%)"
    : "linear-gradient(92deg, #0a7085 0%, #5744c9 55%, #a5117f 100%)";

  return (
    <div style={{ position: "relative" }}>
      <span
        style={{
          position: "fixed",
          top: 14,
          left: 16,
          zIndex: 100,
          fontFamily: "var(--lv2-font-mono)",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.14em",
          padding: "7px 12px",
          borderRadius: 999,
          background: "rgba(20,22,29,0.85)",
          color: "#fff",
        }}
      >
        {String(n).padStart(2, "0")} · {t.name} · {rotZ}°
      </span>
      {/* owner controls: click through themes and angles, no URL editing */}
      <div
        style={{
          position: "fixed",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          padding: "10px 14px",
          borderRadius: 16,
          background: "rgba(20,22,29,0.88)",
          boxShadow: "0 16px 40px -12px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", justifyContent: "center" }}>
          {THEMES.map((_, i) => (
            <a
              key={i}
              href={`?theme=${i + 1}&rot=${rotKey}`}
              style={{
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 8px",
                borderRadius: 7,
                textDecoration: "none",
                color: i + 1 === n ? "#0b0e14" : "rgba(235,242,255,0.85)",
                background: i + 1 === n ? "#7ee7ff" : "rgba(255,255,255,0.1)",
              }}
            >
              {i + 1}
            </a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          <span style={{ fontFamily: "var(--lv2-font-mono)", fontSize: 10, letterSpacing: "0.12em", color: "rgba(235,242,255,0.6)" }}>ANGLE</span>
          {Object.entries(ROTS).map(([k, deg]) => (
            <a
              key={k}
              href={`?theme=${n}&rot=${k}`}
              style={{
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 11,
                fontWeight: 700,
                padding: "4px 9px",
                borderRadius: 7,
                textDecoration: "none",
                color: k === rotKey ? "#0b0e14" : "rgba(235,242,255,0.85)",
                background: k === rotKey ? "#ffd27e" : "rgba(255,255,255,0.1)",
              }}
            >
              {deg}°
            </a>
          ))}
        </div>
      </div>
      <HeroCinematic
        overlay={false}
        ambience={false}
        rotZ={rotZ}
        backdrop={
          <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
            {t.bg}
            {/* universal copy veil: every theme gets a quiet left column
                so the headline never fights the texture */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: t.dark
                  ? "linear-gradient(90deg, rgba(10,12,18,0.68) 0%, rgba(10,12,18,0.4) 36%, rgba(10,12,18,0) 62%)"
                  : "linear-gradient(90deg, rgba(250,247,241,0.92) 0%, rgba(250,247,241,0.68) 36%, rgba(250,247,241,0) 62%)",
              }}
            />
          </div>
        }
        frameChildren={
          <>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 96,
                width: "100%",
                maxWidth: 1340,
                margin: "0 auto",
                right: 0,
                padding: "96px 24px 0 5vw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                pointerEvents: "none",
                zIndex: 5,
              }}
            >
              <h1 style={{ fontFamily: "var(--lv2-font-display)", fontSize: "clamp(2.3rem, 3.9vw, 3.8rem)", lineHeight: 1.06, letterSpacing: "-0.026em", fontWeight: 650, margin: 0, maxWidth: "15ch", color: ink }}>
                Cyber and AI skills for{" "}
                <span style={{ background: grad, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent", textShadow: "none" }}>
                  all ages, schools and firms.
                </span>
              </h1>
              <p style={{ fontFamily: "var(--lv2-font-display)", fontSize: "clamp(0.95rem, 1.15vw, 1.0625rem)", lineHeight: 1.6, color: soft, maxWidth: "40ch", margin: "20px 0 0" }}>
                Cyber security taught properly, from age 6 all the way through to adulthood.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 24, maxWidth: 500 }}>
                {AGES.map((a) => (
                  <span key={a} style={{ fontFamily: "var(--lv2-font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", color: chipInk, padding: "7px 14px", borderRadius: 999, border: `1px solid ${chipBorder}`, background: chipBg }}>
                    {a}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 5, pointerEvents: "none" }}>
              <div style={{ maxWidth: 1180, margin: "0 auto", padding: "20px 24px 24px", display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: "14px 34px", borderTop: `1px solid ${t.dark ? "rgba(244,247,255,0.25)" : "rgba(20,22,29,0.14)"}` }}>
                {ACCREDITATIONS.map((a) => (
                  <span key={a.alt} style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: 30, padding: "0 10px", borderRadius: 8, background: a.dark ? "#14161d" : "#fff", border: a.dark ? "1px solid rgba(159,245,255,0.3)" : "1px solid rgba(20,22,29,0.12)", boxShadow: "0 4px 12px -6px rgba(20,22,29,0.3)" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={a.src} alt={a.alt} style={{ display: "block", height: a.h, width: "auto" }} />
                    </span>
                    <span style={{ fontFamily: "var(--lv2-font-mono)", fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", textTransform: "uppercase", color: t.dark ? "rgba(230,238,252,0.8)" : "#4a5160" }}>
                      {a.label}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          </>
        }
      />
    </div>
  );
}

export default function HeroPreviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f6f1e9" }} />}>
      <Inner />
    </Suspense>
  );
}
