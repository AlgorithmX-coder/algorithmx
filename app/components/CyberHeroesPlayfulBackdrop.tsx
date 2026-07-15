"use client";

import { CSSProperties, useMemo } from "react";

/**
 * CyberHeroesPlayfulBackdrop — the backdrop for /cyberheroes.
 *
 * A premium deep-space scene built entirely from CSS + SVG (no WebGL): a
 * layered nebula, a crisp non-repeating starfield with depth + gentle twinkle,
 * a soft drifting aurora, one elegant ringed "cyber world" with an orbiting
 * moon, a distant second world for scale, and a faint constellation. Every
 * animation is transform/opacity only, so it composites on the GPU and stays
 * perfectly smooth (the old live WebGL scene froze on some desktops). The
 * central-left column is kept dark so the headline text keeps contrast.
 *
 * Fixed, pointer-events:none, z-index:-1. Motion is decorative and is
 * neutralised by the global prefers-reduced-motion guard in globals.css.
 */

/* Deterministic PRNG so star fields are identical on server + client (no
 * hydration mismatch) and stable between renders. */
function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STAR_TINT = ["#eaf6ff", "#7df0ff", "#c9b8ff", "#ffffff", "#bfe6ff"];

export default function CyberHeroesPlayfulBackdrop() {
  // Dense faint starfield (static, non-repeating), rendered once as an SVG.
  const stars = useMemo(() => {
    const rng = mulberry32(0x5eed42);
    return Array.from({ length: 130 }, () => ({
      x: +(rng() * 100).toFixed(2),
      y: +(rng() * 100).toFixed(2),
      r: +(0.35 + rng() * 1.15).toFixed(2),
      o: +(0.22 + rng() * 0.5).toFixed(2),
      c: STAR_TINT[Math.floor(rng() * STAR_TINT.length)],
    }));
  }, []);

  // Brighter foreground stars that gently twinkle (opacity only).
  const twinkles = useMemo(() => {
    const rng = mulberry32(0xa11ce);
    return Array.from({ length: 16 }, (_, i) => ({
      x: +(rng() * 100).toFixed(2),
      y: +(rng() * 94).toFixed(2),
      s: +(1.5 + rng() * 2).toFixed(2),
      dur: +(3.2 + rng() * 4).toFixed(2),
      delay: +(rng() * 6).toFixed(2),
      c: i % 3 === 0 ? "#7df0ff" : i % 3 === 1 ? "#c9b8ff" : "#ffffff",
    }));
  }, []);

  return (
    <div aria-hidden style={rootStyle}>
      <style>{KEYFRAMES}</style>

      {/* 1 · Dense faint starfield — crisp, non-repeating, static. */}
      <svg style={svgFill} viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r * 0.16} fill={s.c} opacity={s.o} />
        ))}
      </svg>

      {/* 2 · Soft drifting nebula clouds — colour + depth, pushed to the edges. */}
      <div className="chb-neb" style={neb(cyanGlow, "-18vmax", undefined, undefined, "-12vmax", 66, "chbDrift1 74s")} />
      <div className="chb-neb" style={neb(violetGlow, "-22vmax", "-14vmax", undefined, undefined, 78, "chbDrift2 92s")} />
      <div className="chb-neb" style={neb(pinkGlow, undefined, undefined, "-22vmax", "-8vmax", 54, "chbDrift3 108s")} />

      {/* 3 · A soft aurora ribbon sweeping the upper frame. */}
      <div className="chb-aurora" />

      {/* 4 · A faint constellation — the "cyber network" cue, lower-right. */}
      <svg style={{ ...svgFill }} viewBox="0 0 100 56" preserveAspectRatio="xMidYMid slice">
        <g stroke="#7df0ff" strokeWidth="0.09" opacity="0.34" fill="none">
          <polyline points="60,44 66,38 73,41 79,34 86,37" />
          <polyline points="66,38 69,46 76,48" />
        </g>
        {[[60, 44], [66, 38], [73, 41], [79, 34], [86, 37], [69, 46], [76, 48]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="0.28" fill="#bfe9ff" opacity="0.7" />
        ))}
      </svg>

      {/* 5 · Focal ringed "cyber world" (top-right) — frames the hero video. */}
      <div className="chb-world">
        <div className="chb-ring" />
        <div className="chb-ring chb-ring-2" />
        <div className="chb-atmo" />
        <div className="chb-orb" />
        <div className="chb-moonpath">
          <span className="chb-moon" />
        </div>
      </div>

      {/* 6 · A distant, dim second world (lower-left) for depth + scale. */}
      <div className="chb-farworld" />

      {/* 7 · Twinkling accent stars (opacity only). */}
      {twinkles.map((t, i) => (
        <span
          key={i}
          style={
            {
              position: "absolute",
              left: `${t.x}%`,
              top: `${t.y}%`,
              width: t.s,
              height: t.s,
              borderRadius: "50%",
              background: t.c,
              boxShadow: `0 0 ${t.s * 3}px ${t.c}`,
              opacity: 0.7,
              animation: `chbTwinkle ${t.dur}s ease-in-out ${t.delay}s infinite`,
              willChange: "opacity",
            } as CSSProperties
          }
        />
      ))}

      {/* 8 · Centre lift + edge vignette — keeps the headline legible, seats the scene. */}
      <div style={centreLift} />
      <div style={vignette} />
    </div>
  );
}

/* ---------- static style objects ---------- */

const svgFill: CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%" };

const cyanGlow = "radial-gradient(circle, rgba(0,200,255,0.20), transparent 62%)";
const violetGlow = "radial-gradient(circle, rgba(124,92,255,0.26), transparent 62%)";
const pinkGlow = "radial-gradient(circle, rgba(255,120,190,0.16), transparent 62%)";

const rootStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: -1,
  pointerEvents: "none",
  overflow: "hidden",
  background: [
    "radial-gradient(ellipse 72% 60% at 86% 4%, rgba(124,92,255,0.26) 0%, transparent 56%)",
    "radial-gradient(ellipse 56% 62% at 101% 46%, rgba(0,229,255,0.15) 0%, transparent 55%)",
    "radial-gradient(ellipse 72% 55% at 6% 100%, rgba(0,150,220,0.14) 0%, transparent 56%)",
    "radial-gradient(ellipse 52% 46% at 96% 96%, rgba(255,120,190,0.10) 0%, transparent 55%)",
    "linear-gradient(180deg, #04050d 0%, #070814 52%, #05060f 100%)",
  ].join(","),
};

function neb(
  bg: string,
  top?: string,
  left?: string,
  bottom?: string,
  right?: string,
  size = 60,
  animation?: string,
): CSSProperties {
  return {
    position: "absolute",
    top,
    left,
    bottom,
    right,
    width: `${size}vmax`,
    height: `${size}vmax`,
    background: bg,
    filter: "blur(60px)",
    mixBlendMode: "screen",
    borderRadius: "50%",
    willChange: "transform",
    animation: animation ? `${animation} ease-in-out infinite alternate` : undefined,
  };
}

const centreLift: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(ellipse 70% 60% at 36% 44%, rgba(4,6,18,0.72) 0%, rgba(4,6,18,0.34) 46%, rgba(4,6,18,0) 72%)",
};

const vignette: CSSProperties = {
  position: "absolute",
  inset: 0,
  background:
    "radial-gradient(ellipse 120% 120% at 50% 45%, transparent 56%, rgba(3,4,12,0.52) 100%)",
};

const KEYFRAMES = `
  .chb-neb { position: absolute; }
  @keyframes chbDrift1 { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(5vw,4vh,0) scale(1.1); } }
  @keyframes chbDrift2 { from { transform: translate3d(0,0,0) scale(1.05); } to { transform: translate3d(-4vw,5vh,0) scale(1); } }
  @keyframes chbDrift3 { from { transform: translate3d(0,0,0) scale(1); } to { transform: translate3d(-5vw,-4vh,0) scale(1.12); } }

  .chb-aurora {
    position: absolute; top: -30%; left: 6%; width: 94%; height: 82%;
    background: conic-gradient(from 205deg at 62% 42%,
      transparent 0deg, rgba(0,229,255,0.14) 38deg, rgba(124,92,255,0.20) 118deg,
      rgba(255,120,190,0.09) 176deg, transparent 250deg);
    filter: blur(46px);
    mix-blend-mode: screen;
    will-change: transform;
    animation: chbAurora 110s ease-in-out infinite alternate;
  }
  @keyframes chbAurora { from { transform: translate3d(0,0,0) rotate(0deg) scale(1); } to { transform: translate3d(-3vw,2vh,0) rotate(8deg) scale(1.08); } }

  /* Focal ringed world (top-right). rotateX tilts the rings + moon orbit into
     a graceful ellipse. */
  .chb-world { position: absolute; top: -12vmax; right: -7vmax; width: 42vmax; height: 42vmax; }
  .chb-orb {
    position: absolute; inset: 35%; border-radius: 50%;
    background: radial-gradient(circle at 36% 30%, #cfeeff 0%, #5aa8ff 30%, #3a63d6 52%, #1c2f86 74%, #0b1450 92%);
    box-shadow:
      inset -2.4vmax -2.4vmax 5vmax rgba(3,6,34,0.85),
      inset 1.2vmax 1.2vmax 3vmax rgba(190,235,255,0.28),
      0 0 9vmax 1vmax rgba(70,160,255,0.20);
    will-change: transform, opacity;
    animation: chbOrb 9s ease-in-out infinite alternate;
  }
  @keyframes chbOrb { from { transform: scale(1); opacity: 0.94; } to { transform: scale(1.035); opacity: 1; } }
  /* Atmosphere rim glow. */
  .chb-atmo {
    position: absolute; inset: 33.2%; border-radius: 50%;
    box-shadow: 0 0 0 0.2vmax rgba(150,220,255,0.22), 0 0 4vmax rgba(120,200,255,0.32);
  }
  .chb-ring {
    position: absolute; inset: 12%; border-radius: 50%;
    border: 0.28vmax solid rgba(125,240,255,0.30);
    transform: rotateX(72deg);
    box-shadow: 0 0 2vmax rgba(0,229,255,0.14);
  }
  .chb-ring-2 { inset: 22%; border-color: rgba(160,140,255,0.24); border-width: 0.2vmax; }
  .chb-moonpath {
    position: absolute; inset: 6%; border-radius: 50%;
    transform: rotateX(72deg);
    will-change: transform;
    animation: chbMoon 46s linear infinite;
  }
  @keyframes chbMoon { from { transform: rotateX(72deg) rotateZ(0deg); } to { transform: rotateX(72deg) rotateZ(360deg); } }
  .chb-moon {
    position: absolute; top: -0.6vmax; left: 50%; width: 1.1vmax; height: 1.1vmax;
    margin-left: -0.55vmax; border-radius: 50%;
    background: #eaf6ff; box-shadow: 0 0 1.6vmax #7df0ff;
  }

  /* Distant dim world (lower-left) for scale. */
  .chb-farworld {
    position: absolute; left: 8vmax; bottom: 6vmax; width: 7vmax; height: 7vmax;
    border-radius: 50%;
    background: radial-gradient(circle at 38% 34%, rgba(160,150,255,0.5), rgba(80,70,180,0.25) 46%, transparent 72%);
    box-shadow: 0 0 4vmax rgba(120,100,255,0.18);
    will-change: transform, opacity;
    animation: chbOrb 11s ease-in-out infinite alternate;
  }

  @keyframes chbTwinkle { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
`;
