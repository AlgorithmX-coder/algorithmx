"use client";

import { CSSProperties } from "react";
import dynamic from "next/dynamic";

/**
 * CyberHeroesPlayfulBackdrop — the backdrop for /cyberheroes.
 *
 * A deep-space GALAXY ground in CSS — layered nebula glows pulled to the
 * corners, a faint diagonal galactic band, two depth layers of static star
 * dust, and soft drifting nebula gas — with the real 3D "wow" layer on top
 * (CyberHeroes3DScene, WebGL: glowing crystal orbs, a constellation network,
 * energy pulses, elliptical rings + bloom). The CSS galaxy stays cheap and
 * always renders (even when the WebGL layer goes gentle below the hero); it
 * gives everything else a galaxy to float in. The central column is kept
 * dark so foreground text stays legible.
 *
 * Fixed, pointer-events:none, z-index:-1.
 */

const CyberHeroes3DScene = dynamic(() => import("./CyberHeroes3DScene"), {
  ssr: false,
});

/* Friendly cyber-themed code snippets — a faint "this is tech" cue. */
const CODE = [
  "if (safe) { highFive() }",
  "shield.activate()",
  "encrypt(mySecret)",
  "block(raccoon)",
  "await beAHero()",
  "scanForTricks()",
  "firewall.on()",
  "badge.unlock('cyber')",
  "verify(grownUp)",
  "scam.detected = false",
  "report() && block()",
  "mission.complete()",
];

export default function CyberHeroesPlayfulBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        // Deep galaxy: nebula glows in the corners, an edge vignette pulling
        // the eye inward, over a near-black space base.
        background: [
          "radial-gradient(ellipse 85% 65% at 80% 8%, rgba(82,40,128,0.26) 0%, transparent 58%)",
          "radial-gradient(ellipse 80% 60% at 13% 94%, rgba(26,54,124,0.26) 0%, transparent 58%)",
          "radial-gradient(ellipse 62% 48% at 93% 88%, rgba(156,36,108,0.14) 0%, transparent 58%)",
          "radial-gradient(ellipse 150% 120% at 50% 40%, transparent 34%, rgba(3,4,12,0.8) 100%)",
          "linear-gradient(180deg, #04050d 0%, #080918 46%, #090720 74%, #040509 100%)",
        ].join(","),
      }}
    >
      <style>{`
        @keyframes chpbCode { 0%,100% { opacity: 0; } 14%,86% { opacity: var(--peak, 0.16); } }
        @keyframes chpbDrift1 { 0% { transform: translate3d(0,0,0) scale(1); } 100% { transform: translate3d(-6vw, 5vh, 0) scale(1.12); } }
        @keyframes chpbDrift2 { 0% { transform: translate3d(0,0,0) scale(1.06); } 100% { transform: translate3d(7vw,-4vh, 0) scale(1); } }
        @keyframes chpbDrift3 { 0% { transform: translate3d(0,0,0) scale(1); } 100% { transform: translate3d(-5vw,-6vh, 0) scale(1.16); } }
        @keyframes chpbDrift4 { 0% { transform: translate3d(0,0,0) scale(1.04); } 100% { transform: translate3d(6vw, 6vh, 0) scale(1.14); } }
        @keyframes chpbDrift5 { 0% { transform: translate3d(0,0,0) scale(1); } 100% { transform: translate3d(-7vw, 3vh, 0) scale(1.1); } }
        .chpb-blob { position: absolute; border-radius: 50%; filter: blur(86px); mix-blend-mode: screen; will-change: transform; opacity: 0.58; }

        /* Static star dust — two depth layers of tiny points, no blur (cheap). */
        .chpb-stars { position: absolute; inset: 0; background-repeat: repeat; }
        .chpb-stars-far {
          opacity: 0.42;
          background-size: 230px 230px;
          background-image:
            radial-gradient(1px 1px at 25px 35px, rgba(205,222,255,0.75), transparent),
            radial-gradient(1px 1px at 132px 78px, rgba(255,255,255,0.65), transparent),
            radial-gradient(1px 1px at 70px 165px, rgba(186,204,255,0.55), transparent),
            radial-gradient(1px 1px at 192px 122px, rgba(255,255,255,0.6), transparent),
            radial-gradient(1px 1px at 100px 28px, rgba(214,202,255,0.5), transparent),
            radial-gradient(1px 1px at 165px 205px, rgba(255,255,255,0.5), transparent),
            radial-gradient(1px 1px at 45px 110px, rgba(190,230,255,0.5), transparent);
        }
        .chpb-stars-near {
          opacity: 0.52;
          background-size: 380px 380px;
          background-image:
            radial-gradient(1.7px 1.7px at 60px 90px, rgba(255,255,255,0.95), transparent),
            radial-gradient(1.5px 1.5px at 250px 190px, rgba(196,228,255,0.85), transparent),
            radial-gradient(1.6px 1.6px at 150px 310px, rgba(255,242,222,0.8), transparent),
            radial-gradient(1.4px 1.4px at 330px 60px, rgba(255,255,255,0.82), transparent),
            radial-gradient(1.5px 1.5px at 30px 250px, rgba(214,222,255,0.78), transparent);
        }

        /* Faint diagonal galactic band — the Milky Way streak. */
        .chpb-band {
          position: absolute; inset: -25%;
          background: radial-gradient(ellipse 68% 20% at 50% 50%, rgba(132,86,210,0.12) 0%, rgba(60,92,205,0.07) 38%, transparent 72%);
          transform: rotate(-22deg);
          filter: blur(34px);
          mix-blend-mode: screen;
        }

        @media (prefers-reduced-motion: reduce) {
          .chpb-blob, .chpb-code { animation: none !important; }
        }
      `}</style>

      {/* Galactic band — deepest gas. */}
      <div className="chpb-band" />

      {/* Static star dust — far then near for depth. */}
      <div className="chpb-stars chpb-stars-far" />
      <div className="chpb-stars chpb-stars-near" />

      {/* Drifting nebula gas — galaxy colours, kept to the edges/corners so
          the central text column stays dark. */}
      <div className="chpb-blob" style={{ top: "-22vmax", right: "-14vmax", width: "66vmax", height: "66vmax", background: "radial-gradient(circle, rgba(150,70,210,0.30), transparent 60%)", animation: "chpbDrift2 72s ease-in-out infinite alternate" }} />
      <div className="chpb-blob" style={{ bottom: "-26vmax", left: "-16vmax", width: "72vmax", height: "72vmax", background: "radial-gradient(circle, rgba(40,92,222,0.26), transparent 60%)", animation: "chpbDrift3 86s ease-in-out infinite alternate" }} />
      <div className="chpb-blob" style={{ top: "-20vmax", left: "-14vmax", width: "56vmax", height: "56vmax", background: "radial-gradient(circle, rgba(0,200,232,0.16), transparent 62%)", animation: "chpbDrift1 62s ease-in-out infinite alternate" }} />
      <div className="chpb-blob" style={{ bottom: "-18vmax", right: "-10vmax", width: "56vmax", height: "56vmax", background: "radial-gradient(circle, rgba(222,52,142,0.20), transparent 60%)", animation: "chpbDrift4 96s ease-in-out infinite alternate" }} />
      <div className="chpb-blob" style={{ top: "28%", right: "-22vmax", width: "50vmax", height: "50vmax", background: "radial-gradient(circle, rgba(120,64,205,0.15), transparent 62%)", animation: "chpbDrift5 118s ease-in-out infinite alternate" }} />

      {/* Real 3D layer — glowing orbs + constellation + pulses + rings + bloom. */}
      <div style={{ position: "absolute", inset: 0 }}>
        <CyberHeroes3DScene />
      </div>

      {/* Faint drifting code snippets — subtle cyber cue over the scene. */}
      {CODE.map((line, i) => {
        const left = (i * 47 + 4) % 88;
        const top = (i * 61 + 6) % 90;
        const colour = ["#7df0ff", "#a78bff", "#ff9bd0", "#ffd158", "#7eff97"][i % 5];
        return (
          <span
            key={`c-${i}`}
            className="chpb-code"
            style={
              {
                position: "absolute",
                left: `${left}%`,
                top: `${top}%`,
                fontFamily: "var(--lv2-font-mono)",
                fontSize: 12,
                fontWeight: 600,
                color: colour,
                textShadow: `0 0 10px ${colour}55`,
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
                opacity: 0,
                animation: `chpbCode ${8 + (i % 5)}s ease-in-out ${(i * 0.7) % 9}s infinite`,
                ["--peak" as string]: 0.11,
              } as CSSProperties
            }
          >
            {line}
          </span>
        );
      })}

      {/* Centre lift so headline text keeps contrast on the left. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 72% 62% at 38% 44%, rgba(6,8,24,0.68) 0%, rgba(6,8,24,0.32) 48%, rgba(6,8,24,0) 74%)",
        }}
      />
    </div>
  );
}
