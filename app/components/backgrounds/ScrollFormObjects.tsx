"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ScrollFormObjects — additive scroll-driven "stations" that form as you
 * scroll down the landing page, in conjunction with the (locked) galaxy in
 * CosmicNetworkBackground:
 *
 *   ① galaxy (lives in CosmicNetworkBackground — untouched)
 *   ② a holographic IDE that TYPES real syntax-highlighted code on scroll
 *   ③ a wireframe robot that ASSEMBLES part-by-part on scroll
 *
 * Pure function of page-scroll progress, so it's exactly reversible (scroll
 * up un-types the code / disassembles the robot). Lives in its own fixed
 * layer at z-index -1 (behind ALL content, above the galaxy), pointer-events
 * none, aria-hidden — it touches nothing else. Updates imperatively from one
 * rAF-throttled scroll handler (no React re-render on scroll). Hidden on
 * small screens and under prefers-reduced-motion.
 */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/* ── the code that types itself out (syntax-coloured tokens per line) ───── */
type Tok = { t: string; c: string };
const C = {
  com: "#5f6e94",
  kw: "#c792ea",
  fn: "#82aaff",
  str: "#5fffb0",
  num: "#f78c6c",
  def: "#cdd8ff",
};
const CODE: Tok[][] = [
  [{ t: "// AlgorithmX · teach machines to think", c: C.com }],
  [{ t: "function ", c: C.kw }, { t: "learn", c: C.fn }, { t: "(mind) {", c: C.def }],
  [
    { t: "  const ", c: C.kw }, { t: "skills", c: C.def }, { t: " = [", c: C.def },
    { t: '"logic"', c: C.str }, { t: ", ", c: C.def }, { t: '"code"', c: C.str },
    { t: ", ", c: C.def }, { t: '"AI"', c: C.str }, { t: "];", c: C.def },
  ],
  [
    { t: "  return ", c: C.kw }, { t: "skills", c: C.def }, { t: ".", c: C.def },
    { t: "map", c: C.fn }, { t: "((skill) => {", c: C.def },
  ],
  [
    { t: "    return ", c: C.kw }, { t: "mind", c: C.def }, { t: ".", c: C.def },
    { t: "master", c: C.fn }, { t: "(skill);", c: C.def },
  ],
  [{ t: "  });", c: C.def }],
  [{ t: "}", c: C.def }],
  [{ t: "", c: C.def }],
  [{ t: "launch", c: C.fn }, { t: "(learn);", c: C.def }],
];

/* ── wireframe robot parts, in assembly order (drawn via stroke-dashoffset) ─ */
type RPart = { d: string; node?: boolean; color: string };
const ROBOT: RPart[] = [
  { d: "M74,44 H126 A12,12 0 0 1 138,56 V92 A12,12 0 0 1 126,104 H74 A12,12 0 0 1 62,92 V56 A12,12 0 0 1 74,44 Z", color: "#6fdcff" }, // head
  { d: "M80,74 H94 M106,74 H120", color: "#9fe9ff" }, // visor / eyes
  { d: "M100,44 V28", color: "#6fdcff" }, // antenna stem
  { d: "M100,24 m-4,0 a4,4 0 1 0 8,0 a4,4 0 1 0 -8,0", node: true, color: "#b48cff" }, // antenna tip
  { d: "M74,116 H126 A10,10 0 0 1 136,126 V186 A10,10 0 0 1 126,196 H74 A10,10 0 0 1 64,186 V126 A10,10 0 0 1 74,116 Z", color: "#6fdcff" }, // torso
  { d: "M100,150 m-9,0 a9,9 0 1 0 18,0 a9,9 0 1 0 -18,0", node: true, color: "#b48cff" }, // chest core
  { d: "M64,128 H44 V172", color: "#6fdcff" }, // left arm
  { d: "M136,128 H156 V172", color: "#6fdcff" }, // right arm
  { d: "M86,196 V240 M114,196 V240 M78,240 H94 M106,240 H122", color: "#6fdcff" }, // legs + feet
];

function useGate() {
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    if (typeof window === "undefined") return;
    const small = window.matchMedia("(max-width: 900px)");
    const rm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const compute = () => setHidden(small.matches || rm.matches);
    compute();
    small.addEventListener("change", compute);
    rm.addEventListener("change", compute);
    return () => {
      small.removeEventListener("change", compute);
      rm.removeEventListener("change", compute);
    };
  }, []);
  return hidden;
}

export default function ScrollFormObjects() {
  const hidden = useGate();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (hidden) return;
    const root = rootRef.current;
    if (!root) return;
    const codeWrap = root.querySelector<HTMLElement>(".sfo-code");
    const robotWrap = root.querySelector<HTMLElement>(".sfo-robot");
    const lines = Array.from(root.querySelectorAll<HTMLElement>(".sfo-line"));
    const carets = lines.map((l) => l.querySelector<HTMLElement>(".sfo-caret"));
    const parts = Array.from(root.querySelectorAll<SVGElement>(".sfo-part"));
    if (!codeWrap || !robotWrap) return;

    let scrollable = 1;
    const measure = () => {
      scrollable = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight,
      );
    };
    measure();

    const apply = () => {
      const P = clamp01(window.scrollY / scrollable);

      /* ② CODE — fades in ~16%, types 18→46%, fades out 48→55% */
      const codeP = clamp01((P - 0.18) / (0.46 - 0.18));
      const codeOp = clamp01((P - 0.15) / 0.05) * (1 - clamp01((P - 0.48) / 0.07));
      codeWrap.style.opacity = String(codeOp);
      codeWrap.style.transform = `translateY(-50%) translateX(${(1 - smooth(clamp01((P - 0.15) / 0.06))) * -24}px)`;
      const shown = codeP * lines.length;
      const active = Math.min(lines.length - 1, Math.floor(shown));
      lines.forEach((ln, i) => {
        const lp = clamp01(shown - i);
        ln.style.opacity = lp <= 0 ? "0" : String(0.4 + 0.6 * lp);
        ln.style.transform = `translateX(${(1 - lp) * -8}px)`;
        const car = carets[i];
        if (car) car.style.display = i === active && codeOp > 0.05 && codeP < 1 ? "inline-block" : "none";
      });

      /* ③ ROBOT — fades in ~50%, assembles 52→85% */
      const robotP = clamp01((P - 0.52) / (0.85 - 0.52));
      const robotOp = clamp01((P - 0.5) / 0.06);
      robotWrap.style.opacity = String(robotOp);
      const n = parts.length;
      parts.forEach((pt, i) => {
        const dp = smooth(clamp01((robotP - i / n) / (1 / n)));
        if (pt.classList.contains("sfo-node")) {
          pt.style.opacity = String(dp);
        } else {
          pt.style.strokeDashoffset = String(1 - dp);
        }
      });
    };

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        apply();
        ticking = false;
      });
    };
    const onResize = () => {
      measure();
      apply();
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [hidden]);

  if (hidden) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      {/* ② holographic code editor — left side */}
      <div
        className="sfo-code"
        style={{
          position: "absolute",
          left: "clamp(10px, 3.5vw, 80px)",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(300px, 31vw, 432px)",
          opacity: 0,
          borderRadius: 14,
          border: "1px solid rgba(120,180,255,0.22)",
          background: "linear-gradient(160deg, rgba(13,18,32,0.82), rgba(8,11,22,0.82))",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          boxShadow: "0 24px 70px rgba(0,0,0,0.5), 0 0 40px rgba(60,130,255,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            padding: "9px 13px",
            borderBottom: "1px solid rgba(120,180,255,0.14)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <span style={{ width: 9, height: 9, borderRadius: 9, background: "#ff5f57" }} />
          <span style={{ width: 9, height: 9, borderRadius: 9, background: "#febc2e" }} />
          <span style={{ width: 9, height: 9, borderRadius: 9, background: "#28c840" }} />
          <span style={{ marginLeft: 8, fontFamily: "var(--lv2-font-mono, monospace)", fontSize: 11, letterSpacing: "0.12em", color: "rgba(180,200,255,0.6)" }}>
            learn.js
          </span>
        </div>
        <div style={{ padding: "14px 16px", fontFamily: "var(--lv2-font-mono, monospace)", fontSize: 13, lineHeight: "1.55em" }}>
          {CODE.map((line, i) => (
            <div key={i} className="sfo-line" style={{ opacity: 0, whiteSpace: "pre", display: "flex" }}>
              <span style={{ width: 22, flexShrink: 0, color: "rgba(120,140,190,0.4)", userSelect: "none" }}>
                {i + 1}
              </span>
              <span>
                {line.map((seg, j) => (
                  <span key={j} style={{ color: seg.c }}>
                    {seg.t}
                  </span>
                ))}
                <span className="sfo-caret" style={{ display: "none", width: 7, height: "1.05em", background: "#9fe9ff", verticalAlign: "-2px", marginLeft: 1, boxShadow: "0 0 8px #6fdcff" }} />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ③ wireframe robot — right side, above the galaxy */}
      <div
        className="sfo-robot"
        style={{
          position: "absolute",
          right: "clamp(10px, 4vw, 96px)",
          top: "41%",
          transform: "translateY(-50%)",
          width: "clamp(200px, 22vw, 290px)",
          opacity: 0,
          filter: "drop-shadow(0 0 10px rgba(80,170,255,0.45))",
        }}
      >
        <svg viewBox="0 0 200 270" width="100%" height="auto" fill="none">
          {ROBOT.map((p, i) =>
            p.node ? (
              <path
                key={i}
                className="sfo-part sfo-node"
                d={p.d}
                fill={p.color}
                opacity={0}
                style={{ opacity: 0 }}
              />
            ) : (
              <path
                key={i}
                className="sfo-part"
                d={p.d}
                stroke={p.color}
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                pathLength={1}
                strokeDasharray={1}
                style={{ strokeDashoffset: 1 }}
              />
            ),
          )}
        </svg>
      </div>

      <style jsx>{`
        .sfo-caret {
          animation: sfoBlink 1s steps(1) infinite;
        }
        @keyframes sfoBlink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
