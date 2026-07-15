"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import HeroOverlay from "./HeroOverlay";

/**
 * HeroCinematicV3 — the scroll-pinned laptop hero, rebuilt as PURE
 * DOM/CSS 3D. Replaces the WebGL scene + baked-frame scrub fallback
 * with ONE render path that is identical on every device.
 *
 * Why this architecture:
 *   - The previous hero maintained two renderers (live three.js scene +
 *     a pre-baked frame sequence for integrated GPUs). Keeping them in
 *     sync spawned a whole class of bugs: frame-overlap ghosting, bake/
 *     playback mismatches, decode jank, white flash wedges. None of
 *     those are POSSIBLE here — there are no frames, no bakes, no alpha
 *     compositing, no mode switching. The laptop is four rectangles and
 *     a hinge, transformed by the browser's compositor.
 *   - The screen is REAL HTML: razor-sharp text at any DPI, trivially
 *     editable copy, real hover states. (The old scene painted it into
 *     a 2048px canvas texture.)
 *   - CSS 3D transforms + opacity are compositor-accelerated on every
 *     GPU tier, including the integrated GPUs the old scene had to
 *     fall back on.
 *
 * Scroll choreography (beat map, progress p of the 220vh rail):
 *   0.00–0.10  dormant closed laptop, standby LED breathing
 *   0.06–0.48  lid opens (starts almost immediately — the old hero's
 *              dead first third was its #1 measured flow problem)
 *   0.40–0.56  screen ignites, dashboard rows cascade in
 *   0.50–0.64  keyboard underglow ramps
 *   0.60–0.84  three course cards rise out of the screen plane
 *   0.66–0.80  headline + CTAs reveal (HeroOverlay's own gates)
 *
 * Deterministic by construction: every animated value derives from
 * scroll progress only — no clocks, no one-shot triggers. Ambient life
 * (LED breathing, nebula drift) is CSS keyframes, disabled under
 * prefers-reduced-motion. Reduced motion pins progress to 1.
 */

/* Stream rows shown on the screen dashboard — mirrors the platform
 * catalogue (same data the old canvas dashboard painted). */
const STREAMS = [
  { name: "CYBERSECURITY", age: "9-16", status: "LIVE", color: "#5fffa3" },
  { name: "GAME DEVELOPMENT", age: "8-16", status: "2026", color: "#9ff5ff" },
  { name: "AI & MACHINE LEARNING", age: "11+", status: "2026", color: "#cba8ff" },
  { name: "APP DEVELOPMENT", age: "12+", status: "2027", color: "#ffd07a" },
  { name: "ENTREPRENEURSHIP", age: "13+", status: "2027", color: "#ffc94a" },
  { name: "ROBOTICS", age: "10+", status: "2027", color: "#ff3ad6" },
] as const;

/* Per-column key glow hues — the curated luxe palette from the brand
 * keyboard (not a raw rainbow). */
const KEY_COLS = ["#00e5ff", "#7df0ff", "#cba8ff", "#ff3ad6", "#ff7a9f", "#ffd07a", "#5fffa3"];

/* Keyboard rows (visual only — lengths tuned to read as a real board). */
const KEY_ROWS = [14, 14, 13, 12, 9];

const CHAPTERS_V3 = [
  { id: "01", title: "System dormant", range: [0.0, 0.1] as const },
  { id: "02", title: "Platform activating", range: [0.1, 0.4] as const },
  { id: "03", title: "Systems igniting", range: [0.4, 0.62] as const },
  { id: "04", title: "Start your journey", range: [0.62, 1.0] as const },
];

const COURSE_CARDS = [
  {
    title: "Cyber Heroes",
    meta: "AGES 6–9 · LIVE",
    color: "#5fffa3",
    blurb: "Defend against cyber attacks",
    href: "/cyberheroes",
  },
  {
    title: "Cyber Explorers",
    meta: "AGES 9–13 · LIVE",
    color: "#9ff5ff",
    blurb: "Real missions, real skills",
    href: "/cyberexplorers",
  },
  {
    title: "AI & Machine Learning",
    meta: "AGES 11+ · 2026",
    color: "#cba8ff",
    blurb: "Build intelligent machines",
    href: "#subjects",
  },
];

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export default function HeroCinematicV3() {
  const railRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const apply = () => setIsCompact(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const { scrollYProgress } = useScroll({
    target: railRef,
    offset: ["start start", "end end"],
  });
  /* Same spring feel as the shipped hero — follows scroll responsively,
   * glides through wheel steps. */
  const smoothScroll = useSpring(scrollYProgress, {
    stiffness: 55,
    damping: 19,
    mass: 0.5,
  });
  const progress = useTransform(smoothScroll, (v) => (reducedMotion ? 1 : v));

  /* ── beat-derived motion values (all scroll-pure) ────────────────── */
  /* Lid: 0deg = closed flat over the deck; +108deg = open (positive
   * rotateX with the hinge at the container's top edge lifts the free
   * edge toward the viewer — the physical opening direction after the
   * scene tilt). Starts at p=0.06 so the very first wheel tick
   * responds. */
  const lidAngle = useTransform(progress, (p) => 102 * smoothstep(0.06, 0.48, p));
  /* "Camera" = the whole scene group tilting/settling as you scroll. */
  const sceneRotX = useTransform(progress, (p) => 66 - 9 * smoothstep(0, 0.5, p));
  /* Sized so the OPEN laptop owns the right half of the frame and never
   * collides with the headline column or the nav. */
  const sceneScale = useTransform(progress, (p) => 0.8 + 0.06 * smoothstep(0, 0.6, p));
  const sceneY = useTransform(progress, (p) => 70 - 30 * smoothstep(0, 0.6, p));
  /* Screen ignition + keyboard underglow + energy floor. */
  /* Dashboard fades up at ignition, then quietens slightly as the
   * course cards arrive — a focus handoff, so the two layers never
   * fight for attention. */
  const screenT = useTransform(
    progress,
    (p) => smoothstep(0.4, 0.56, p) * (1 - 0.38 * smoothstep(0.6, 0.76, p)),
  );
  const screenGlow = useTransform(screenT, (v) => 0.55 * v);
  const kbGlow = useTransform(progress, (p) => smoothstep(0.5, 0.64, p));
  const floorGlow = useTransform(progress, (p) => 0.25 + 0.75 * smoothstep(0.38, 0.6, p));
  /* Standby LED fades out as the machine wakes. */
  const ledOpacity = useTransform(progress, (p) => 1 - smoothstep(0.35, 0.5, p));

  return (
    <section
      ref={railRef}
      style={{
        position: "relative",
        height: isCompact ? "170vh" : "220vh",
        background: "transparent",
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          width: "100%",
          overflow: "hidden",
        }}
      >
        {/* ambient cosmic wash — pure CSS, sits over GlobalBackdrop */}
        <div aria-hidden className="hv3-nebulaA" />
        <div aria-hidden className="hv3-nebulaB" />

        {/* ── 3D stage ── */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            perspective: 1500,
            perspectiveOrigin: "55% 30%",
          }}
        >
          <motion.div
            className="hv3-sceneScale"
            style={{
              rotateX: sceneRotX,
              rotateZ: -24,
              scale: sceneScale,
              y: sceneY,
              x: isCompact ? 0 : "14vw",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            {/* energy floor + contact shadow (in-plane, under the deck) */}
            <motion.div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 1150,
                height: 1150,
                transform: "translate(-50%, -46%)",
                borderRadius: "50%",
                opacity: floorGlow,
                background:
                  "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.16) 0%, rgba(60,120,255,0.08) 30%, rgba(0,229,255,0.03) 52%, transparent 70%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 780,
                height: 560,
                transform: "translate(-50%, -48%)",
                borderRadius: "50%",
                background:
                  "radial-gradient(ellipse at 50% 50%, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 45%, transparent 70%)",
              }}
            />

            {/* ══ LAPTOP ══ */}
            <div
              style={{
                position: "relative",
                width: 620,
                height: 430,
                transformStyle: "preserve-3d",
              }}
            >
              {/* ── BASE (deck) ── */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 16,
                  transformStyle: "preserve-3d",
                  background:
                    "linear-gradient(145deg, #343a48 0%, #262b37 45%, #1d212c 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(190,205,235,0.28), inset 0 -1px 0 rgba(0,0,0,0.5), inset 1px 0 0 rgba(140,155,185,0.12)",
                }}
              >
                {/* keyboard well */}
                <div
                  style={{
                    position: "absolute",
                    left: 44,
                    right: 44,
                    top: 34,
                    height: 208,
                    borderRadius: 10,
                    background: "linear-gradient(160deg, #0a0c13, #070910)",
                    boxShadow:
                      "inset 0 2px 8px rgba(0,0,0,0.85), inset 0 0 0 1px rgba(120,140,180,0.10)",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* keyboard underglow — single strip, scroll-driven */}
                  <motion.div
                    style={{
                      position: "absolute",
                      inset: 6,
                      borderRadius: 8,
                      opacity: kbGlow,
                      background:
                        "linear-gradient(90deg, rgba(0,229,255,0.16), rgba(203,168,255,0.13), rgba(255,58,214,0.12), rgba(255,208,122,0.12), rgba(95,255,163,0.14))",
                      filter: "blur(10px)",
                    }}
                  />
                  {KEY_ROWS.map((count, r) => (
                    <div
                      key={r}
                      style={{
                        display: "flex",
                        gap: 6,
                        position: "relative",
                        flex: r === KEY_ROWS.length - 1 ? "0 0 40px" : 1,
                      }}
                    >
                      {Array.from({ length: count }, (_, k) => {
                        const wide =
                          (r === KEY_ROWS.length - 1 && k === Math.floor(count / 2)) ||
                          (r > 0 && (k === 0 || k === count - 1));
                        const hue = KEY_COLS[Math.floor((k / count) * KEY_COLS.length)];
                        return (
                          <div
                            key={k}
                            style={{
                              flex: wide ? 2.2 : 1,
                              borderRadius: 5,
                              background:
                                "linear-gradient(180deg, #171b25 0%, #0d1019 100%)",
                              boxShadow: `inset 0 1px 0 rgba(170,190,225,0.13), 0 1px 2px rgba(0,0,0,0.6), 0 0 6px ${hue}14`,
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                </div>

                {/* trackpad — glass inset */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    bottom: 38,
                    width: 200,
                    height: 118,
                    transform: "translateX(-58%)",
                    borderRadius: 12,
                    background:
                      "linear-gradient(155deg, rgba(24,28,40,0.95), rgba(10,12,20,0.98))",
                    boxShadow:
                      "inset 0 1px 0 rgba(190,210,240,0.18), inset 0 0 0 1px rgba(0,0,0,0.55), inset 0 -8px 22px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 12,
                      background:
                        "linear-gradient(115deg, transparent 30%, rgba(160,200,255,0.07) 46%, transparent 62%)",
                    }}
                  />
                </div>

                {/* deck badge */}
                <div
                  style={{
                    position: "absolute",
                    right: 58,
                    bottom: 52,
                    fontFamily:
                      "var(--font-geist-sans, ui-sans-serif), system-ui, sans-serif",
                    fontWeight: 800,
                    fontSize: 15,
                    letterSpacing: "0.01em",
                    background: "linear-gradient(180deg, #f2f5fa, #9aa2b0)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    color: "transparent",
                    textShadow: "0 1px 2px rgba(0,0,0,0.4)",
                  }}
                >
                  Algorithm
                  <span
                    style={{
                      background: "none",
                      WebkitBackgroundClip: "initial",
                      color: "#ff2f40",
                      fontSize: 21,
                      textShadow: "0 0 10px rgba(255,47,64,0.75)",
                    }}
                  >
                    X
                  </span>
                </div>

                {/* standby LED on the front lip */}
                <motion.div
                  style={{
                    position: "absolute",
                    left: 84,
                    bottom: 10,
                    width: 26,
                    height: 3,
                    borderRadius: 2,
                    background: "#00e5ff",
                    boxShadow: "0 0 8px rgba(0,229,255,0.9)",
                    opacity: ledOpacity,
                  }}
                  className="hv3-ledBreathe"
                />
              </div>

              {/* base thickness — front edge */}
              <div
                style={{
                  position: "absolute",
                  left: 4,
                  right: 4,
                  bottom: -13,
                  height: 14,
                  transformOrigin: "50% 0%",
                  transform: "rotateX(-84deg)",
                  borderRadius: "0 0 10px 10px",
                  background: "linear-gradient(180deg, #232836, #12151e)",
                  boxShadow: "inset 0 1px 0 rgba(150,170,205,0.14)",
                }}
              />

              {/* ── LID (hinged at the back edge) ── */}
              <motion.div
                style={{
                  position: "absolute",
                  inset: 0,
                  transformOrigin: "50% 0%",
                  rotateX: lidAngle,
                  transformStyle: "preserve-3d",
                  willChange: "transform",
                  z: 2,
                }}
              >
                {/* outer shell (visible when closed) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 16,
                    backfaceVisibility: "hidden",
                    transform: "translateZ(1.2px)",
                    background:
                      "linear-gradient(150deg, #3a4152 0%, #272c39 50%, #1c202b 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(200,215,245,0.3), inset 0 -1px 0 rgba(0,0,0,0.45)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--lv2-font-mono)",
                      fontWeight: 800,
                      fontSize: 30,
                      letterSpacing: "0.34em",
                      paddingLeft: "0.34em",
                      color: "#b8faff",
                      textShadow:
                        "0 0 14px rgba(0,229,255,0.75), 0 0 40px rgba(0,229,255,0.35)",
                    }}
                  >
                    ALGORITHMX
                  </div>
                </div>

                {/* inner face: bezel + REAL HTML screen (visible open) */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: 16,
                    backfaceVisibility: "hidden",
                    transform: "rotateX(180deg) translateZ(1.2px)",
                    background: "linear-gradient(160deg, #1a1e29, #10131c)",
                    boxShadow: "inset 0 0 0 1px rgba(130,150,185,0.14)",
                    padding: 12,
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "100%",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#02030a",
                    }}
                  >
                    {/* dormant wallpaper (always present, dim) */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(ellipse 62% 48% at 52% 44%, rgba(30,96,156,0.5) 0%, rgba(14,52,98,0.32) 34%, rgba(5,20,44,0.16) 60%, transparent 80%), radial-gradient(circle at 52% 44%, rgba(224,250,255,0.5) 0%, rgba(124,212,255,0.14) 7%, transparent 16%)",
                        opacity: 0.55,
                      }}
                    />
                    {/* screen glass sheen */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(112deg, transparent 42%, rgba(170,210,255,0.05) 52%, transparent 60%)",
                        zIndex: 3,
                        pointerEvents: "none",
                      }}
                    />
                    {/* ignited dashboard — real HTML */}
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: screenT,
                        display: "flex",
                        flexDirection: "column",
                        padding: "14px 18px 12px",
                        fontFamily: "var(--lv2-font-mono)",
                        background:
                          "linear-gradient(180deg, rgba(7,12,24,0.92), rgba(4,7,15,0.95))",
                        zIndex: 2,
                      }}
                    >
                      <ScreenDashboard progress={progress} />
                    </motion.div>
                    {/* ignition glow wash over the panel */}
                    <motion.div
                      style={{
                        position: "absolute",
                        inset: 0,
                        opacity: screenGlow,
                        background:
                          "radial-gradient(ellipse at 50% 40%, rgba(63,208,255,0.14), transparent 70%)",
                        zIndex: 4,
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* ── COURSE CARDS rising from the screen plane ── */}
              {COURSE_CARDS.map((card, i) => (
                <EmergeCard key={card.title} card={card} idx={i} progress={progress} />
              ))}
            </div>
          </motion.div>
        </div>

        {/* screen light spill onto the page (2D, subtle) */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            left: "38%",
            top: "18%",
            width: "46%",
            height: "56%",
            opacity: screenGlow,
            background:
              "radial-gradient(ellipse at 50% 45%, rgba(0,190,255,0.10), transparent 65%)",
            pointerEvents: "none",
          }}
        />

        {/* headline / CTA column — same overlay as the shipped hero */}
        <HeroOverlay progress={progress} />

        {/* chapter label rail */}
        <ChapterRailV3 progress={progress} />

        {/* scroll hint */}
        <ScrollHintV3 progress={smoothScroll} />
      </div>

      {/* scoped styles: ambient keyframes + responsive scale + a11y */}
      <style>{`
        .hv3-sceneScale { transform-style: preserve-3d; }
        @media (max-width: 1100px) { .hv3-sceneScale { zoom: 0.82; } }
        @media (max-width: 768px)  { .hv3-sceneScale { zoom: 0.56; } }
        .hv3-nebulaA, .hv3-nebulaB {
          position: absolute; border-radius: 50%; pointer-events: none;
          filter: blur(70px);
        }
        .hv3-nebulaA {
          width: 55vw; height: 42vw; left: 8vw; top: 12vh; opacity: 0.5;
          background: radial-gradient(ellipse, rgba(40,90,190,0.20), rgba(0,229,255,0.05) 55%, transparent 75%);
          animation: hv3DriftA 26s ease-in-out infinite alternate;
        }
        .hv3-nebulaB {
          width: 48vw; height: 40vw; right: 2vw; bottom: 4vh; opacity: 0.4;
          background: radial-gradient(ellipse, rgba(90,60,200,0.16), rgba(63,208,255,0.05) 55%, transparent 75%);
          animation: hv3DriftB 32s ease-in-out infinite alternate;
        }
        @keyframes hv3DriftA { from { transform: translate3d(0,0,0); } to { transform: translate3d(3vw,2vh,0); } }
        @keyframes hv3DriftB { from { transform: translate3d(0,0,0); } to { transform: translate3d(-2.5vw,-2vh,0); } }
        .hv3-ledBreathe { animation: hv3Led 2.6s ease-in-out infinite; }
        @keyframes hv3Led { 0%,100% { filter: brightness(0.7); } 50% { filter: brightness(1.3); } }
        .hv3-card { transition: box-shadow 0.22s ease, border-color 0.22s ease, filter 0.22s ease; cursor: pointer; }
        .hv3-card:hover { filter: brightness(1.12); }
        .hv3-card:focus-visible { outline: 2px solid var(--lv2-cyan); outline-offset: 3px; }
        .hv3-row { transition: background-color 0.18s ease; }
        @media (prefers-reduced-motion: reduce) {
          .hv3-nebulaA, .hv3-nebulaB, .hv3-ledBreathe { animation: none; }
        }
      `}</style>
    </section>
  );
}

/* Screen dashboard — real HTML. Rows cascade in with scroll (no clock). */
function ScreenDashboard({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      {/* OS bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingBottom: 8,
          borderBottom: "1px solid rgba(63,208,255,0.22)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 99,
              background: "#00e5ff",
              boxShadow: "0 0 8px rgba(0,229,255,0.9)",
            }}
          />
          <span style={{ color: "#9ff5ff", fontWeight: 700, fontSize: 13, letterSpacing: "0.1em" }}>
            ALGORITHMX_OS
          </span>
        </span>
        <span style={{ color: "rgba(232,237,255,0.5)", fontSize: 10, letterSpacing: "0.18em" }}>
          6 STREAMS · AGES 6 → ADULT
        </span>
      </div>

      {/* stream rows */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-evenly" }}>
        {STREAMS.map((s, i) => (
          <StreamRow key={s.name} stream={s} idx={i} progress={progress} />
        ))}
      </div>

      {/* footer */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 8,
          borderTop: "1px solid rgba(63,208,255,0.16)",
          fontSize: 10,
          letterSpacing: "0.2em",
        }}
      >
        <span style={{ color: "#5fffa3", fontWeight: 700 }}>● READY</span>
        <span style={{ color: "rgba(232,237,255,0.45)" }}>CHOOSE A STREAM TO BEGIN</span>
      </div>
    </>
  );
}

function StreamRow({
  stream,
  idx,
  progress,
}: {
  stream: (typeof STREAMS)[number];
  idx: number;
  progress: MotionValue<number>;
}) {
  /* Cascade: each row lands slightly after the previous as scroll passes
   * the ignition beat. */
  const t0 = 0.46 + idx * 0.018;
  const opacity = useTransform(progress, (p) => smoothstep(t0, t0 + 0.05, p));
  const x = useTransform(progress, (p) => 10 * (1 - smoothstep(t0, t0 + 0.05, p)));
  return (
    <motion.div
      className="hv3-row"
      style={{
        opacity,
        x,
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "3px 12px 3px 6px",
        borderRadius: 6,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: 99,
          background: stream.color,
          boxShadow: `0 0 6px ${stream.color}aa`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: `${stream.color}d9`,
          fontWeight: 700,
          fontSize: 12.5,
          letterSpacing: "0.06em",
          whiteSpace: "nowrap",
        }}
      >
        {stream.name}
      </span>
      <span style={{ color: "rgba(232,237,255,0.4)", fontSize: 10.5, whiteSpace: "nowrap" }}>
        AGES {stream.age}
      </span>
      <span style={{ flex: 1 }} />
      <span
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: stream.color,
          border: `1px solid ${stream.color}66`,
          background: `${stream.color}14`,
          borderRadius: 5,
          padding: "1px 8px",
        }}
      >
        {stream.status}
      </span>
    </motion.div>
  );
}

/* Course card that rises out of the screen plane. DOM + CSS 3D — hover
 * pop is a filter/shadow change (no layout shift). */
function EmergeCard({
  card,
  idx,
  progress,
}: {
  card: (typeof COURSE_CARDS)[number];
  idx: number;
  progress: MotionValue<number>;
}) {
  const t0 = 0.6 + idx * 0.05;
  const emerge = useTransform(progress, (p) => smoothstep(t0, t0 + 0.16, p));
  const opacity = emerge;
  /* Hover over the KEYBOARD zone of the deck, well forward of the lid
   * plane (the open lid leans back from the hinge — over the deck's
   * front half, z≈340 is unambiguously in front of it). */
  const y = useTransform(emerge, (v) => 60 - 90 * v);
  const z = useTransform(emerge, (v) => 160 + 180 * v);
  const rotX = useTransform(emerge, (v) => -10 * (1 - v));
  return (
    <motion.a
      className="hv3-card"
      href={card.href}
      aria-label={`${card.title} — ${card.blurb}`}
      style={{
        position: "absolute",
        left: 60 + idx * 175,
        top: "64%",
        width: 150,
        minHeight: 92,
        opacity,
        y,
        z,
        rotateX: rotX,
        display: "block",
        padding: "12px 14px",
        borderRadius: 12,
        textDecoration: "none",
        background: "linear-gradient(165deg, rgba(20,26,42,0.94), rgba(10,13,24,0.96))",
        border: `1px solid ${card.color}55`,
        boxShadow: `0 18px 44px rgba(0,0,0,0.5), 0 0 18px ${card.color}22, inset 0 1px 0 rgba(200,220,255,0.09)`,
        fontFamily: "var(--lv2-font-mono)",
      }}
    >
      <div style={{ fontSize: 9, letterSpacing: "0.16em", color: card.color, fontWeight: 700 }}>
        {card.meta}
      </div>
      <div
        style={{
          marginTop: 5,
          fontFamily:
            "var(--font-geist-sans, ui-sans-serif), system-ui, sans-serif",
          fontWeight: 700,
          fontSize: 15,
          color: "#eef2ff",
          lineHeight: 1.2,
        }}
      >
        {card.title}
      </div>
      <div style={{ marginTop: 5, fontSize: 9.5, lineHeight: 1.45, color: "rgba(232,237,255,0.6)" }}>
        {card.blurb}
      </div>
    </motion.a>
  );
}

function ChapterRailV3({ progress }: { progress: MotionValue<number> }) {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        bottom: "calc(var(--lv2-rail) * 1.0)",
        right: "var(--lv2-rail)",
        zIndex: 4,
        pointerEvents: "none",
      }}
    >
      {CHAPTERS_V3.map((ch, i) => (
        <ChapterLabelV3 key={ch.id} progress={progress} idx={i} chapter={ch} />
      ))}
    </div>
  );
}

function ChapterLabelV3({
  progress,
  chapter,
  idx,
}: {
  progress: MotionValue<number>;
  chapter: (typeof CHAPTERS_V3)[number];
  idx: number;
}) {
  const [lo, hi] = chapter.range;
  const opacity = useTransform(
    progress,
    [lo - 0.03, lo + 0.01, hi - 0.02, hi + 0.03],
    [0, 1, 1, 0],
  );
  return (
    <motion.div
      style={{
        opacity,
        position: "absolute",
        bottom: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        gap: 14,
        color: "var(--lv2-paper)",
        fontFamily: "var(--lv2-font-mono)",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.32em",
        textTransform: "uppercase",
        textShadow: "0 2px 18px rgba(4,5,13,0.95)",
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ color: "rgba(232,237,255,0.45)" }}>
        {String(idx + 1).padStart(2, "0")}
        <span style={{ opacity: 0.45, margin: "0 6px" }}>/</span>
        {String(CHAPTERS_V3.length).padStart(2, "0")}
      </span>
      <span
        style={{
          display: "inline-block",
          width: 22,
          height: 1,
          background: "var(--lv2-cyan)",
          boxShadow: "0 0 8px rgba(0,229,255,0.65)",
        }}
      />
      <span>{chapter.title}</span>
    </motion.div>
  );
}

function ScrollHintV3({ progress }: { progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [0, 0.24, 0.34], [1, 1, 0]);
  return (
    <motion.div
      aria-hidden
      style={{
        opacity,
        position: "absolute",
        bottom: "calc(var(--lv2-rail) * 1.2)",
        left: "50%",
        x: "-50%",
        zIndex: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
        pointerEvents: "none",
        fontFamily: "var(--lv2-font-mono)",
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: "0.28em",
        textTransform: "uppercase",
        color: "var(--lv2-paper)",
      }}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 12,
          padding: "9px 20px",
          borderRadius: 999,
          border: "1px solid rgba(0,229,255,0.28)",
          background: "rgba(4,5,13,0.58)",
          backdropFilter: "blur(14px) saturate(1.4)",
          WebkitBackdropFilter: "blur(14px) saturate(1.4)",
          boxShadow:
            "inset 0 1px 0 rgba(232,237,255,0.06), 0 8px 26px rgba(0,229,255,0.16)",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: 999,
            background: "var(--lv2-cyan)",
            boxShadow: "0 0 10px rgba(0,229,255,0.8)",
          }}
        />
        Scroll to continue
      </span>
      <svg width="22" height="11" viewBox="0 0 22 11" fill="none" aria-hidden>
        <path
          d="M2 2L11 9L20 2"
          stroke="var(--lv2-cyan)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </motion.div>
  );
}
