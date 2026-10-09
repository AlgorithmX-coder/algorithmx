"use client";

/**
 * /heropreview?bg=1..16 - OWNER PREVIEW ONLY, never linked, deleted
 * before ship. Round seven (2026-10-09): static options were "too
 * subtle" - these are LIVE animated backgrounds (code, pulses,
 * sweeps) in the hero's ivory / grey-blue / teal family, behind the
 * REAL hero (overlay copy + scroll-booting machine). All motion is
 * CSS/SMIL or the shipped CodeRain canvas; reduced-motion safe where
 * the primitive allows.
 */

import { Suspense, type CSSProperties, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import HeroCinematic from "@/app/components/landing-v2/HeroCinematicV3";
import CodeRainBackground from "@/app/components/CodeRainBackground";

interface Bg {
  name: string;
  node: ReactNode;
}

const IVORY = "#f6f1e9";

/* Veil keeping the copy column readable over busy motion. */
function CopyVeil({ a = 0.78 }: { a?: number }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: `linear-gradient(90deg, rgba(246,241,233,${Math.min(1, a + 0.14)}) 0%, rgba(246,241,233,${a}) 36%, rgba(246,241,233,0.1) 64%, rgba(246,241,233,0) 100%)`,
      }}
    />
  );
}

const CODE_LINES = [
  "import { Shield } from \"@algorithmx/core\";",
  "const learner = enrol({ age: 6 });",
  "while (learner.curious) {",
  "  learner.build(realProjects);",
  "  shield.level += 1;",
  "}",
  "deploy(career);",
];

const bgKeyframes = `
  @media (prefers-reduced-motion: no-preference) {
    .bg-type-line { opacity: 0; animation: bgType 12s linear infinite; }
    .bg-caret { animation: bgBlink 1.1s steps(1) infinite; }
    .bg-sweepY { animation: bgSweepY 7s linear infinite; }
    .bg-rise { animation-name: bgRise; animation-timing-function: linear; animation-iteration-count: infinite; }
    .bg-spin { animation: bgSpin 30s linear infinite; }
    .bg-spin-r { animation: bgSpin 22s linear infinite reverse; }
    .bg-drift { animation: bgDrift 16s linear infinite; }
    .bg-rowPulse { animation: bgRowPulse 5s ease-in-out infinite; }
    .bg-dash { animation: bgDash 9s linear infinite; }
  }
  @keyframes bgType { 0% { opacity: 0; } 2% { opacity: 1; } 86% { opacity: 1; } 92% { opacity: 0; } 100% { opacity: 0; } }
  @keyframes bgBlink { 50% { opacity: 0; } }
  @keyframes bgSweepY { 0% { transform: translateY(-16vh); opacity: 0; } 10% { opacity: 1; } 85% { opacity: 1; } 100% { transform: translateY(110vh); opacity: 0; } }
  @keyframes bgRise { 0% { transform: translate3d(0,0,0); opacity: 0; } 10% { opacity: 0.9; } 85% { opacity: 0.6; } 100% { transform: translate3d(var(--sw,3vw),-108vh,0); opacity: 0; } }
  @keyframes bgSpin { to { transform: rotate(360deg); } }
  @keyframes bgDrift { from { transform: translateY(-50%); } to { transform: translateY(0); } }
  @keyframes bgRowPulse { 0%, 100% { opacity: 0.12; } 50% { opacity: 0.4; } }
  @keyframes bgDash { to { stroke-dashoffset: -600; } }
`;

const typeStyle = (i: number): CSSProperties => ({
  animationDelay: `${i * 1.3}s`,
});

const BGS: Bg[] = [
  {
    name: "CODE RAIN INK",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: IVORY }} />
        <CodeRainBackground fixed={false} bg={IVORY} head="rgba(10,112,133,0.75)" accentA="rgba(10,112,133,0.45)" accentB="rgba(87,68,201,0.4)" />
        <CopyVeil a={0.8} />
      </>
    ),
  },
  {
    name: "CODE RAIN SIDES",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: IVORY }} />
        <div style={{ position: "absolute", inset: 0, maskImage: "linear-gradient(90deg, #000 0%, transparent 22%, transparent 78%, #000 100%)", WebkitMaskImage: "linear-gradient(90deg, #000 0%, transparent 22%, transparent 78%, #000 100%)" }}>
          <CodeRainBackground fixed={false} bg={IVORY} head="rgba(10,112,133,0.8)" accentA="rgba(10,112,133,0.5)" accentB="rgba(165,17,127,0.4)" />
        </div>
      </>
    ),
  },
  {
    name: "TYPING CODE",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 115% 95% at 25% 8%, #f9f5ed, #efe9dc 85%)" }} />
        <pre style={{ position: "absolute", right: "4vw", top: "9vh", margin: 0, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 17, lineHeight: 2.2, color: "rgba(10,112,133,0.4)", userSelect: "none" }}>
          {CODE_LINES.map((l, i) => (
            <span key={i} className="bg-type-line" style={typeStyle(i)}>
              {l}
              {"\n"}
            </span>
          ))}
          <span className="bg-caret" style={{ display: "inline-block", width: 9, height: 18, verticalAlign: "-3px", background: "rgba(10,112,133,0.55)" }} />
        </pre>
        <style>{bgKeyframes}</style>
      </>
    ),
  },
  {
    name: "TERMINAL TICKER",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f7f3ea, #f0ebdf)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "#10141b", padding: "12px 3vw", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 12.5, letterSpacing: "0.04em", color: "#9fe8c4", overflow: "hidden", whiteSpace: "nowrap" }}>
          <span className="bg-drift2">$ enrol --age 6..adult &nbsp;·&nbsp; shields 100% &nbsp;·&nbsp; 6 courses live &nbsp;·&nbsp; NCSC-aligned &nbsp;·&nbsp; port scan dropped &nbsp;·&nbsp; phishing URL quarantined &nbsp;·&nbsp; brute force locked out &nbsp;·&nbsp; $ enrol --age 6..adult &nbsp;·&nbsp; shields 100% &nbsp;·&nbsp; 6 courses live &nbsp;·&nbsp; NCSC-aligned &nbsp;·&nbsp; port scan dropped &nbsp;·&nbsp; phishing URL quarantined &nbsp;·&nbsp; brute force locked out &nbsp;·&nbsp;</span>
        </div>
        <style>{`
          @media (prefers-reduced-motion: no-preference) { .bg-drift2 { display: inline-block; animation: bgTick 26s linear infinite; } }
          @keyframes bgTick { to { transform: translateX(-50%); } }
        `}</style>
      </>
    ),
  },
  {
    name: "POWER TRACES",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f8f4ec 0%, #f1ebdf 100%)" }} />
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          <g stroke="rgba(10,112,133,0.2)" fill="none" strokeWidth={1.4}>
            <path d="M-20,115 H640 V300 H1030" />
            <path d="M-20,640 H300 V690 H760 V520 H1040" />
            <path d="M240,830 V720 H860 V580 H1060" />
            <path d="M1460,170 H1180 V330 H1050" />
          </g>
          <g fill="rgba(10,112,133,0.4)">
            <circle cx={640} cy={115} r={3.2} />
            <circle cx={300} cy={640} r={3.2} />
            <circle cx={1180} cy={170} r={3.2} />
            <circle cx={860} cy={720} r={3.2} />
          </g>
          {[
            { d: "M-20,115 H640 V300 H1030", dur: "6.5s", b: "0s", c: "#0a7085" },
            { d: "M-20,640 H300 V690 H760 V520 H1040", dur: "5.6s", b: "1.4s", c: "#5744c9" },
            { d: "M240,830 V720 H860 V580 H1060", dur: "7.2s", b: "0.7s", c: "#a5117f" },
            { d: "M1460,170 H1180 V330 H1050", dur: "4.8s", b: "2.2s", c: "#0a7085" },
          ].map((p, i) => (
            <g key={i}>
              <circle r={3.4} fill={p.c} opacity={0.9}>
                <animateMotion dur={p.dur} begin={p.b} repeatCount="indefinite" path={p.d} />
              </circle>
              <circle r={5.4} fill="none" stroke={p.c} strokeWidth={0.9} opacity={0.3}>
                <animateMotion dur={p.dur} begin={p.b} repeatCount="indefinite" path={p.d} />
              </circle>
            </g>
          ))}
        </svg>
      </>
    ),
  },
  {
    name: "ARC NETWORK",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f7f3ea, #f1ecdf)" }} />
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          <g stroke="rgba(10,112,133,0.22)" fill="none" strokeWidth={1.1}>
            <path d="M120,210 Q400,60 690,180" />
            <path d="M690,180 Q950,70 1240,190" />
            <path d="M300,260 Q700,120 1100,250" opacity={0.6} />
          </g>
          <g fill="rgba(10,112,133,0.45)">
            <circle cx={120} cy={210} r={2.6} />
            <circle cx={690} cy={180} r={2.6} />
            <circle cx={1240} cy={190} r={2.6} />
          </g>
          {[
            { d: "M120,210 Q400,60 690,180", dur: "4.4s", b: "0s", c: "#0a7085" },
            { d: "M690,180 Q950,70 1240,190", dur: "5.2s", b: "1.1s", c: "#5744c9" },
            { d: "M300,260 Q700,120 1100,250", dur: "6.1s", b: "2s", c: "#a5117f" },
          ].map((p, i) => (
            <circle key={i} r={3.4} fill={p.c} opacity={0.9}>
              <animateMotion dur={p.dur} begin={p.b} repeatCount="indefinite" path={p.d} />
            </circle>
          ))}
          <circle cx={690} cy={180} r={8} fill="none" stroke="#0e7a45" strokeWidth={1.4}>
            <animate attributeName="r" values="4;22" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0" dur="2.6s" repeatCount="indefinite" />
          </circle>
        </svg>
      </>
    ),
  },
  {
    name: "SCAN SWEEP",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 115% 95% at 30% 5%, #f9f5ed, #efe9dc 85%)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(20,22,29,0.045) 0 1px, transparent 1px 64px), repeating-linear-gradient(90deg, rgba(20,22,29,0.045) 0 1px, transparent 1px 64px)", maskImage: "radial-gradient(ellipse 85% 80% at 55% 45%, #000 30%, transparent 92%)", WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 55% 45%, #000 30%, transparent 92%)" }} />
        <div className="bg-sweepY" style={{ position: "absolute", left: 0, right: 0, top: 0, height: "9vh", background: "linear-gradient(180deg, transparent, rgba(10,112,133,0.1) 45%, rgba(10,112,133,0.18) 50%, rgba(10,112,133,0.1) 55%, transparent)", opacity: 0 }} />
        <style>{bgKeyframes}</style>
      </>
    ),
  },
  {
    name: "ORBIT RINGS",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f6f1e9, #efe9dc)" }} />
        <div className="bg-spin" style={{ position: "absolute", left: "64%", top: "46%", width: 880, height: 880, margin: "-440px 0 0 -440px", borderRadius: "50%", border: "1.5px dashed rgba(10,112,133,0.3)" }} />
        <div className="bg-spin-r" style={{ position: "absolute", left: "64%", top: "46%", width: 620, height: 620, margin: "-310px 0 0 -310px", borderRadius: "50%", border: "1px dashed rgba(87,68,201,0.28)" }} />
        <div className="bg-spin" style={{ position: "absolute", left: "64%", top: "46%", width: 1120, height: 1120, margin: "-560px 0 0 -560px", borderRadius: "50%", border: "1px dotted rgba(165,17,127,0.2)" }} />
        <style>{bgKeyframes}</style>
      </>
    ),
  },
  {
    name: "BINARY DRIFT",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: IVORY }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "space-between", padding: "0 2vw", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 15, lineHeight: 2.4, color: "rgba(10,112,133,0.22)", overflow: "hidden", userSelect: "none" }}>
          {["10110100 11", "01 100101 10", "110 01 10011", "0101 110 010", "10 011010 01", "011 10 01101"].map((s, i) => (
            <div key={i} className="bg-drift" style={{ animationDuration: `${14 + i * 3}s`, animationDelay: `${-i * 4}s`, whiteSpace: "pre" }}>
              {Array.from({ length: 30 }, () => s).join("\n")}
            </div>
          ))}
        </div>
        <CopyVeil a={0.72} />
        <style>{bgKeyframes}</style>
      </>
    ),
  },
  {
    name: "WAVE FIELD",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, #f8f4ec, #f0ebdf)" }} />
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          {[0, 1, 2, 3].map((i) => (
            <path
              key={i}
              className="bg-dash"
              d={`M-40,${480 + i * 60} C300,${400 + i * 60} 700,${560 + i * 60} 1480,${440 + i * 60}`}
              fill="none"
              stroke={["#0a7085", "#5744c9", "#a5117f", "#0a7085"][i]}
              strokeOpacity={0.25 - i * 0.04}
              strokeWidth={1.6}
              strokeDasharray="10 14"
            />
          ))}
        </svg>
        <style>{bgKeyframes}</style>
      </>
    ),
  },
  {
    name: "PARTICLE RISE",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 115% 95% at 30% 8%, #f9f5ed, #efe9dc 85%)" }} />
        {[
          { l: "8%", s: 6, c: "10,112,133", d: "15s", b: "0s", sw: "4vw" },
          { l: "20%", s: 4, c: "87,68,201", d: "21s", b: "-7s", sw: "-3vw" },
          { l: "33%", s: 5, c: "10,112,133", d: "17s", b: "-12s", sw: "5vw" },
          { l: "47%", s: 4, c: "165,17,127", d: "23s", b: "-3s", sw: "-4vw" },
          { l: "60%", s: 5, c: "10,112,133", d: "19s", b: "-15s", sw: "4vw" },
          { l: "72%", s: 6, c: "87,68,201", d: "16s", b: "-9s", sw: "-5vw" },
          { l: "84%", s: 4, c: "165,17,127", d: "22s", b: "-5s", sw: "3vw" },
          { l: "93%", s: 5, c: "10,112,133", d: "18s", b: "-11s", sw: "-4vw" },
        ].map((m, i) => (
          <span
            key={i}
            className="bg-rise"
            style={{
              position: "absolute",
              left: m.l,
              bottom: -12,
              width: m.s,
              height: m.s,
              borderRadius: "50%",
              background: `rgba(${m.c},0.75)`,
              boxShadow: `0 0 ${m.s * 2.5}px rgba(${m.c},0.55)`,
              opacity: 0,
              animationDuration: m.d,
              animationDelay: m.b,
              ["--sw" as never]: m.sw,
            }}
          />
        ))}
        <style>{bgKeyframes}</style>
      </>
    ),
  },
  {
    name: "GRID PULSE",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: IVORY }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(0deg, rgba(20,22,29,0.05) 0 1px, transparent 1px 90px), repeating-linear-gradient(90deg, rgba(20,22,29,0.05) 0 1px, transparent 1px 90px)" }} />
        {[14, 38, 62, 86].map((p, i) => (
          <div key={i} className="bg-rowPulse" style={{ position: "absolute", left: 0, right: 0, top: `${p}%`, height: 90, background: "linear-gradient(180deg, transparent, rgba(10,112,133,0.5), transparent)", opacity: 0.12, animationDelay: `${i * 1.25}s`, mixBlendMode: "multiply" }} />
        ))}
        <style>{bgKeyframes}</style>
      </>
    ),
  },
  {
    name: "RAIN + TRACES COMBO",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: IVORY }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.55, maskImage: "linear-gradient(90deg, transparent 0%, transparent 34%, #000 60%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 34%, #000 60%)" }}>
          <CodeRainBackground fixed={false} bg={IVORY} head="rgba(10,112,133,0.7)" accentA="rgba(10,112,133,0.42)" accentB="rgba(87,68,201,0.36)" />
        </div>
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          <path d="M-20,620 H420 V470 H900" stroke="rgba(10,112,133,0.25)" strokeWidth={1.4} fill="none" />
          <circle r={4} fill="#0a7085">
            <animateMotion dur="5.5s" repeatCount="indefinite" path="M-20,620 H420 V470 H900" />
          </circle>
        </svg>
      </>
    ),
  },
  {
    name: "CURSOR GARDEN",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 115% 95% at 28% 8%, #f9f5ed, #f0eadd 85%)" }} />
        {[
          ["68%", "16%", "whoami → defender"],
          ["80%", "34%", "nmap -sV range.local"],
          ["63%", "56%", "shield --level up"],
          ["78%", "74%", "git push career"],
        ].map(([l, t, s], i) => (
          <div key={i} style={{ position: "absolute", left: l, top: t, fontFamily: "ui-monospace, Menlo, monospace", fontSize: 14, letterSpacing: "0.04em", color: "rgba(10,112,133,0.5)" }}>
            <span style={{ color: "rgba(165,17,127,0.55)" }}>$</span> {s}{" "}
            <span className="bg-caret" style={{ display: "inline-block", width: 8, height: 15, verticalAlign: "-2px", background: "rgba(10,112,133,0.5)", animationDelay: `${i * 0.3}s` }} />
          </div>
        ))}
        <style>{bgKeyframes}</style>
      </>
    ),
  },
  {
    name: "AURORA LIVE",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: "#faf7f0" }} />
        <div style={{ position: "absolute", width: "56vw", height: "44vw", left: "-14vw", top: "-14vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(10,112,133,0.2), transparent 64%)", filter: "blur(48px)", animation: "bgA 15s ease-in-out infinite alternate" }} />
        <div style={{ position: "absolute", width: "50vw", height: "40vw", right: "-12vw", top: "-4vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(87,68,201,0.17), transparent 64%)", filter: "blur(48px)", animation: "bgA 19s ease-in-out -6s infinite alternate-reverse" }} />
        <div style={{ position: "absolute", width: "46vw", height: "38vw", left: "30vw", bottom: "-20vw", borderRadius: "50%", background: "radial-gradient(circle, rgba(165,17,127,0.14), transparent 64%)", filter: "blur(48px)", animation: "bgA 23s ease-in-out -3s infinite alternate" }} />
        <style>{`@media (prefers-reduced-motion: no-preference){ } @keyframes bgA { to { transform: translate(5vw,3vh) scale(1.12); } }`}</style>
      </>
    ),
  },
  {
    name: "FULL LAB (rain + sweep + pulses)",
    node: (
      <>
        <div style={{ position: "absolute", inset: 0, background: IVORY }} />
        <div style={{ position: "absolute", inset: 0, opacity: 0.5, maskImage: "linear-gradient(90deg, transparent 0%, transparent 30%, #000 58%)", WebkitMaskImage: "linear-gradient(90deg, transparent 0%, transparent 30%, #000 58%)" }}>
          <CodeRainBackground fixed={false} bg={IVORY} head="rgba(10,112,133,0.75)" accentA="rgba(10,112,133,0.45)" accentB="rgba(165,17,127,0.35)" />
        </div>
        <div className="bg-sweepY" style={{ position: "absolute", left: 0, right: 0, top: 0, height: "8vh", background: "linear-gradient(180deg, transparent, rgba(10,112,133,0.12) 50%, transparent)", opacity: 0 }} />
        <svg viewBox="0 0 1440 800" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} aria-hidden>
          <path d="M-20,660 H360 V540 H880" stroke="rgba(10,112,133,0.22)" strokeWidth={1.3} fill="none" />
          <circle r={3.6} fill="#5744c9">
            <animateMotion dur="6s" repeatCount="indefinite" path="M-20,660 H360 V540 H880" />
          </circle>
        </svg>
        <style>{bgKeyframes}</style>
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
        LIVE {String(n).padStart(2, "0")} · {b.name}
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
