"use client";

import { useEffect, useRef, useState } from "react";

/**
 * ScrollFormObjects — a holographic IDE that TYPES real syntax-highlighted
 * code as you scroll down, in conjunction with the (locked) galaxy in
 * CosmicNetworkBackground. Pure function of page-scroll progress, so it's
 * reversible (scroll up un-types it). Once typed it STAYS on screen for the
 * rest of the page. Own fixed layer at z-index -1 (behind all content),
 * pointer-events none, aria-hidden — touches nothing else. Updated
 * imperatively from one rAF-throttled scroll handler (no idle loop). Hidden
 * on small screens + prefers-reduced-motion.
 */

const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const smooth = (x: number) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

/* the code that types itself out (syntax-coloured tokens per line) */
type Tok = { t: string; c: string };
const C = {
  com: "#5f6e94",
  kw: "#c792ea",
  fn: "#82aaff",
  str: "#5fffb0",
  num: "#f78c6c",
  cls: "#ffcb6b",
  def: "#cdd8ff",
};
const CODE: Tok[][] = [
  [{ t: "// AlgorithmX · from first line to real skill", c: C.com }],
  [{ t: "import ", c: C.kw }, { t: "{ Brain } ", c: C.def }, { t: "from ", c: C.kw }, { t: '"@algorithmx/core"', c: C.str }, { t: ";", c: C.def }],
  [{ t: "", c: C.def }],
  [{ t: "async function ", c: C.kw }, { t: "learn", c: C.fn }, { t: "(student) {", c: C.def }],
  [
    { t: "  const ", c: C.kw }, { t: "tracks", c: C.def }, { t: " = [", c: C.def },
    { t: '"cyber"', c: C.str }, { t: ", ", c: C.def }, { t: '"ai"', c: C.str },
    { t: ", ", c: C.def }, { t: '"apps"', c: C.str }, { t: ", ", c: C.def }, { t: '"games"', c: C.str }, { t: "];", c: C.def },
  ],
  [{ t: "  const ", c: C.kw }, { t: "brain", c: C.def }, { t: " = ", c: C.def }, { t: "new ", c: C.kw }, { t: "Brain", c: C.cls }, { t: "(student);", c: C.def }],
  [{ t: "", c: C.def }],
  [{ t: "  for ", c: C.kw }, { t: "(", c: C.def }, { t: "const ", c: C.kw }, { t: "track ", c: C.def }, { t: "of ", c: C.kw }, { t: "tracks) {", c: C.def }],
  [{ t: "    await ", c: C.kw }, { t: "brain", c: C.def }, { t: ".", c: C.def }, { t: "train", c: C.fn }, { t: "(track, { pace: ", c: C.def }, { t: '"self"', c: C.str }, { t: " });", c: C.def }],
  [{ t: "    log", c: C.fn }, { t: "(", c: C.def }, { t: "`${student.name} levelled up`", c: C.str }, { t: ");", c: C.def }],
  [{ t: "  }", c: C.def }],
  [{ t: "", c: C.def }],
  [{ t: "  return ", c: C.kw }, { t: "brain", c: C.def }, { t: ".", c: C.def }, { t: "certify", c: C.fn }, { t: "();", c: C.def }],
  [{ t: "}", c: C.def }],
  [{ t: "", c: C.def }],
  [{ t: "launch", c: C.fn }, { t: "(() => ", c: C.def }, { t: "learn", c: C.fn }, { t: "(you));", c: C.def }],
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
    const lines = Array.from(root.querySelectorAll<HTMLElement>(".sfo-line"));
    const carets = lines.map((l) => l.querySelector<HTMLElement>(".sfo-caret"));
    if (!codeWrap) return;

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
      /* types 16→52% of the page, then STAYS (fades in once, never out) */
      const codeP = clamp01((P - 0.16) / (0.52 - 0.16));
      /* kept low so the code reads as part of the background, not a UI panel */
      const codeOp = clamp01((P - 0.12) / 0.06) * 0.46;
      codeWrap.style.opacity = String(codeOp);
      codeWrap.style.transform = `translateY(-50%) translateX(${(1 - smooth(clamp01((P - 0.12) / 0.07))) * -26}px)`;
      const shown = codeP * lines.length;
      const active = Math.min(lines.length - 1, Math.floor(shown));
      lines.forEach((ln, i) => {
        const lp = clamp01(shown - i);
        ln.style.opacity = lp <= 0 ? "0" : String(0.45 + 0.55 * lp);
        ln.style.transform = `translateX(${(1 - lp) * -7}px)`;
        const car = carets[i];
        if (car) car.style.display = i === active && codeOp > 0.05 && codeP < 1 ? "inline-block" : "none";
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
      {/* holographic code — left side, no panel (floats over space) */}
      <div
        className="sfo-code"
        style={{
          position: "absolute",
          left: "clamp(14px, 4.5vw, 104px)",
          top: "50%",
          transform: "translateY(-50%)",
          width: "clamp(310px, 32vw, 452px)",
          opacity: 0,
          display: "flex",
          fontFamily: "var(--lv2-font-mono, monospace)",
          fontSize: 13.5,
          lineHeight: "1.62em",
          textShadow: "0 1px 12px rgba(2,4,10,0.95), 0 0 2px rgba(2,4,10,0.9)",
        }}
      >
        {/* glowing left accent rule (replaces the panel) */}
        <div
          aria-hidden
          style={{
            width: 2,
            flexShrink: 0,
            marginRight: 16,
            borderRadius: 2,
            background: "linear-gradient(180deg, #36d6ff, #a98bff)",
            boxShadow: "0 0 12px rgba(80,170,255,0.5)",
            opacity: 0.7,
          }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              fontSize: 11,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "rgba(150,200,255,0.7)",
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: 6, background: "#5fffb0", boxShadow: "0 0 8px #5fffb0" }} />
            learn.js
          </div>
          {CODE.map((line, i) => (
            <div key={i} className="sfo-line" style={{ opacity: 0, whiteSpace: "pre", display: "flex" }}>
              <span style={{ width: 22, flexShrink: 0, color: "rgba(120,140,190,0.38)", userSelect: "none" }}>
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
