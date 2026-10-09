"use client";

/**
 * /heropreview?bg=1..20 - OWNER PREVIEW ONLY, never linked, deleted
 * before ship. Round six (2026-10-09): the owner keeps the ORIGINAL
 * hero (restored by #475) and wants its BACKGROUND professionalised
 * incrementally, same colour family. This renders the real hero -
 * HeroOverlay copy, scroll pill, scroll-booting machine - with the
 * ambience swapped for 20 candidate backgrounds in the ivory /
 * grey-blue / teal palette. Pills switch options on the page.
 */

import { Suspense, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import HeroCinematic from "@/app/components/landing-v2/HeroCinematicV3";

interface Bg {
  name: string;
  node: ReactNode;
}

const IVORY = "#f6f1e9";
const ivory = (a: number) => `rgba(246,241,233,${a})`;

const BGS: Bg[] = [
  {
    name: "BASELINE (as live)",
    node: (
      <>
        <div style={{ position: "absolute", width: "55vw", height: "42vw", left: "8vw", top: "12vh", borderRadius: "50%", opacity: 0.7, background: "radial-gradient(ellipse, rgba(40,90,190,0.26), rgba(0,229,255,0.06) 55%, transparent 75%)", filter: "blur(70px)" }} />
        <div style={{ position: "absolute", width: "48vw", height: "40vw", right: "2vw", bottom: "4vh", borderRadius: "50%", opacity: 0.55, background: "radial-gradient(ellipse, rgba(90,60,200,0.21), rgba(63,208,255,0.06) 55%, transparent 75%)", filter: "blur(70px)" }} />
      </>
    ),
  },
  {
    name: "STUDIO FALLOFF",
    node: (
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 100% at 18% 0%, #faf6ee 0%, #f3ede1 45%, #e3dfd6 78%, #d2cfc9 100%)" }} />
    ),
  },
  {
    name: "SOFT SPOT",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f2ede3, #e9e4d9)" }} />
        <div style={{ position: "absolute", left: "58%", top: "46%", width: "70vw", height: "44vw", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(255,253,247,0.95), rgba(255,253,247,0.4) 45%, transparent 70%)" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 130% 110% at 50% 50%, transparent 62%, rgba(70,75,90,0.16) 100%)" }} />
      </>
    ),
  },
  {
    name: "LINEN GRAIN",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 110% 90% at 30% 10%, #f9f5ed, #efe9dc 70%, #e6e0d2 100%)" }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, backgroundImage: "radial-gradient(rgba(120,110,95,0.14) 0.8px, transparent 0.8px)", backgroundSize: "5px 5px" }} />
      </>
    ),
  },
  {
    name: "HORIZON BAND",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: IVORY }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: "30%", height: "46%", background: "linear-gradient(180deg, transparent, rgba(135,150,175,0.2) 28%, rgba(135,150,175,0.26) 55%, transparent)", filter: "blur(22px)" }} />
      </>
    ),
  },
  {
    name: "TEAL BREATH",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f7f3ea, #f0ebdf)" }} />
        <div style={{ position: "absolute", width: "46vw", height: "34vw", right: "4vw", top: "16vh", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(10,112,133,0.16), rgba(10,112,133,0.05) 55%, transparent 74%)", filter: "blur(44px)" }} />
        <div style={{ position: "absolute", width: "30vw", height: "22vw", left: "2vw", bottom: "4vh", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(10,112,133,0.08), transparent 70%)", filter: "blur(40px)" }} />
      </>
    ),
  },
  {
    name: "DUAL SWEEP",
    node: (
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(118deg, #faf6ee 0%, #f4efe3 42%, #e2e2de 72%, #ccd2d8 100%)" }} />
    ),
  },
  {
    name: "VIGNETTE PRO",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#f4efe5" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 115% 95% at 50% 42%, transparent 55%, rgba(60,66,82,0.22) 100%)" }} />
      </>
    ),
  },
  {
    name: "ARC LIGHT",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f3eee4, #eae5d9)" }} />
        <div style={{ position: "absolute", left: "62%", top: "44%", width: 980, height: 980, transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(circle, transparent 58%, rgba(255,253,247,0.9) 64%, rgba(255,253,247,0.25) 72%, transparent 80%)" }} />
      </>
    ),
  },
  {
    name: "TONE PILLARS",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: IVORY }} />
        <div style={{ position: "absolute", left: "-6vw", top: 0, bottom: 0, width: "34vw", background: "linear-gradient(90deg, rgba(150,160,180,0.18), transparent)", filter: "blur(26px)" }} />
        <div style={{ position: "absolute", right: "-8vw", top: 0, bottom: 0, width: "40vw", background: "linear-gradient(270deg, rgba(120,135,160,0.22), transparent)", filter: "blur(26px)" }} />
      </>
    ),
  },
  {
    name: "PEARL SHEEN",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(165deg, #f8f4ec 0%, #eeebe4 48%, #e4e4e2 100%)" }} />
        <div style={{ position: "absolute", left: "-20%", top: "18%", width: "140%", height: "22%", transform: "rotate(-9deg)", background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.65), transparent)", filter: "blur(30px)" }} />
      </>
    ),
  },
  {
    name: "MIST FLOOR",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f8f4ec 0%, #f2ede1 62%, #e6e2d8 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "34%", background: "linear-gradient(180deg, transparent, rgba(125,140,165,0.26))", filter: "blur(18px)" }} />
      </>
    ),
  },
  {
    name: "NORTH LIGHT",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(160deg, #f1f2f0 0%, #f5f1e7 38%, #efe8d9 100%)" }} />
        <div style={{ position: "absolute", left: "-10vw", top: "-14vh", width: "60vw", height: "50vh", background: "radial-gradient(ellipse, rgba(235,243,250,0.9), transparent 68%)", filter: "blur(30px)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "26%", background: "linear-gradient(180deg, transparent, rgba(196,178,142,0.18))" }} />
      </>
    ),
  },
  {
    name: "GRAPHITE EDGE",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: IVORY }} />
        <div style={{ position: "absolute", right: "-14vw", top: "-20vh", width: "54vw", height: "140vh", transform: "rotate(10deg)", background: "linear-gradient(265deg, rgba(85,95,115,0.3), rgba(85,95,115,0.1) 55%, transparent)", filter: "blur(34px)" }} />
      </>
    ),
  },
  {
    name: "SILK CURVES",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#f5f0e6" }} />
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.6 }} aria-hidden>
          <path d="M-50,560 C360,420 720,660 1500,440 L1500,900 L-50,900 Z" fill="rgba(170,180,200,0.2)" />
          <path d="M-50,660 C420,540 860,740 1500,560 L1500,900 L-50,900 Z" fill="rgba(140,155,180,0.16)" />
        </svg>
      </>
    ),
  },
  {
    name: "DOT WHISPER",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 100% at 25% 5%, #f9f5ed, #efe9dc 85%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(rgba(20,22,29,0.08) 1px, transparent 1px)", backgroundSize: "30px 30px", maskImage: "radial-gradient(ellipse 80% 75% at 62% 50%, #000 30%, transparent 85%)", WebkitMaskImage: "radial-gradient(ellipse 80% 75% at 62% 50%, #000 30%, transparent 85%)" }} />
      </>
    ),
  },
  {
    name: "LINE WHISPER",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 100% at 25% 5%, #f9f5ed, #f0eadd 85%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(20,22,29,0.05) 0 1px, transparent 1px 72px), repeating-linear-gradient(90deg, rgba(20,22,29,0.05) 0 1px, transparent 1px 72px)", maskImage: "radial-gradient(ellipse 85% 80% at 55% 45%, #000 35%, transparent 92%)", WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 55% 45%, #000 35%, transparent 92%)" }} />
      </>
    ),
  },
  {
    name: "GLOW CORE",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f4efe5, #ece7db)" }} />
        <div style={{ position: "absolute", left: "63%", top: "46%", width: "40vw", height: "30vw", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "radial-gradient(ellipse, rgba(185,235,245,0.55), rgba(10,112,133,0.1) 55%, transparent 74%)", filter: "blur(36px)" }} />
      </>
    ),
  },
  {
    name: "PHOTO: IVORY SWEEP",
    node: (
      // eslint-disable-next-line @next/next/no-img-element
      <img src="/landing/bg-ivory-sweep.webp" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
    ),
  },
  {
    name: "PHOTO: PEARL STUDIO",
    node: (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/landing/bg-pearl-studio.webp" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: ivory(0.22) }} />
      </>
    ),
  },
];

function Inner() {
  const params = useSearchParams();
  const n = Math.min(BGS.length, Math.max(1, parseInt(params.get("bg") ?? "1", 10) || 1));
  const b = BGS[n - 1];

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
        BG {String(n).padStart(2, "0")} · {b.name}
      </span>
      <div
        style={{
          position: "fixed",
          bottom: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 100,
          display: "flex",
          gap: 5,
          flexWrap: "wrap",
          justifyContent: "center",
          padding: "10px 14px",
          borderRadius: 16,
          background: "rgba(20,22,29,0.88)",
          boxShadow: "0 16px 40px -12px rgba(0,0,0,0.5)",
          maxWidth: 740,
        }}
      >
        {BGS.map((_, i) => (
          <a
            key={i}
            href={`?bg=${i + 1}`}
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
      <HeroCinematic
        ambience={false}
        backdrop={<div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>{b.node}</div>}
      />
    </div>
  );
}

export default function HeroPreviewPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: IVORY }} />}>
      <Inner />
    </Suspense>
  );
}
