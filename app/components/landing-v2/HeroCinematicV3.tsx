"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
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

/* Keyboard rows — real legends (static DOM text; rasterized once, free
 * during the lid animation). Wide==true stretches modifier keys. */
const KEY_LEGENDS: ReadonlyArray<ReadonlyArray<string>> = [
  ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "del"],
  ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "enter"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
  ["fn", "ctrl", "alt", "⌘", "", "⌘", "alt", "←", "↑", "→"],
];

const CHAPTERS_V3 = [
  { id: "01", title: "System dormant", range: [0.0, 0.1] as const },
  { id: "02", title: "Platform activating", range: [0.1, 0.4] as const },
  { id: "03", title: "Systems igniting", range: [0.4, 0.62] as const },
  { id: "04", title: "Start your journey", range: [0.62, 1.0] as const },
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

  /* Viewport-height fit: on short viewports (e.g. 1440×770 laptop
   * displays) the standing lid otherwise pushes up behind the nav —
   * shift the scene down and trim scale proportionally. 0 at ≥900px
   * tall, 1 at ≤650px. A MotionValue (not state) so a resize updates
   * the scene immediately, even with scroll idle. */
  const shortness = useMotionValue(0);
  useEffect(() => {
    const apply = () =>
      shortness.set(Math.max(0, Math.min(1, (900 - window.innerHeight) / 250)));
    apply();
    window.addEventListener("resize", apply);
    return () => window.removeEventListener("resize", apply);
  }, [shortness]);

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
  const lidAngle = useTransform(progress, (p) => 110 * smoothstep(0.06, 0.48, p));
  /* "Camera" = the whole scene group tilting/settling as you scroll. */
  /* Camera: open with a higher top-down establishing angle, settle into
   * a lower, more frontal product angle (screen closer to face-on) as
   * the lid comes up. Yaw is mild — a premium product shot, not an
   * isometric diagram. */
  const sceneRotX = useTransform(progress, (p) => 62 - 14 * smoothstep(0, 0.55, p));
  /* Framing matched to the shipped live hero: the laptop is a big,
   * imposing close-up — ~55% of frame width, vertically centred just
   * below the middle (screen top ≈ 20% of viewport, deck front ≈ 85%).
   * Shortness trims scale on low viewports so the lid clears the nav. */
  const sceneScale = useTransform(
    [progress, shortness] as const,
    ([p, s]: number[]) => (0.87 + 0.12 * smoothstep(0, 0.6, p)) * (1 - 0.14 * s),
  );
  const sceneY = useTransform(
    [progress, shortness] as const,
    ([p, s]: number[]) => 63 + 22 * smoothstep(0, 0.6, p) + 110 * s,
  );
  /* Screen ignition + keyboard underglow + energy floor. */
  const screenT = useTransform(progress, (p) => smoothstep(0.4, 0.56, p));
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
            perspective: 1900,
            perspectiveOrigin: "55% 34%",
          }}
        >
          <motion.div
            className="hv3-sceneScale"
            style={{
              rotateX: sceneRotX,
              rotateZ: -17,
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
                {/* hinge barrels along the back edge */}
                {[86, 402].map((x) => (
                  <div
                    key={x}
                    style={{
                      position: "absolute",
                      left: x,
                      top: -3,
                      width: 132,
                      height: 9,
                      borderRadius: 5,
                      background:
                        "linear-gradient(180deg, #0c0e15 0%, #2e3442 40%, #171b26 100%)",
                      boxShadow:
                        "inset 0 1px 1px rgba(180,200,235,0.22), 0 1px 3px rgba(0,0,0,0.7)",
                    }}
                  />
                ))}

                {/* speaker grille strip between hinge and keyboard well */}
                <div
                  style={{
                    position: "absolute",
                    left: 60,
                    right: 60,
                    top: 16,
                    height: 10,
                    borderRadius: 5,
                    backgroundImage:
                      "radial-gradient(circle at 2px 50%, rgba(0,0,0,0.85) 1.1px, transparent 1.4px)",
                    backgroundSize: "6px 10px",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.5)",
                    opacity: 0.85,
                  }}
                />

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
                  {KEY_LEGENDS.map((row, r) => (
                    <div
                      key={r}
                      style={{
                        display: "flex",
                        gap: 6,
                        position: "relative",
                        flex: 1,
                      }}
                    >
                      {row.map((legend, k) => {
                        const wide =
                          legend.length > 1 && legend !== "⌘" ? 1.7 : legend === "" ? 4.4 : 1;
                        const hue = KEY_COLS[Math.floor((k / row.length) * KEY_COLS.length)];
                        return (
                          <div
                            key={k}
                            style={{
                              flex: wide,
                              borderRadius: 5,
                              background:
                                "linear-gradient(180deg, #171b25 0%, #0d1019 100%)",
                              boxShadow: `inset 0 1px 0 rgba(170,190,225,0.13), 0 1px 2px rgba(0,0,0,0.6), 0 0 6px ${hue}14`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "var(--lv2-font-mono)",
                              fontSize: legend.length > 1 ? 6.5 : 8.5,
                              fontWeight: 600,
                              color: "rgba(215,232,255,0.6)",
                              textShadow: `0 0 5px ${hue}66`,
                              userSelect: "none",
                            }}
                          >
                            {legend}
                          </div>
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
                  {/* webcam — bezel top-centre (top of the bezel is the
                   *  container's bottom edge pre-flip, but this face is
                   *  rotX(180)-flipped, so bottom:3 lands at the visual
                   *  top of the open screen) */}
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      bottom: 3.5,
                      width: 5,
                      height: 5,
                      marginLeft: -2.5,
                      borderRadius: 99,
                      background:
                        "radial-gradient(circle at 40% 35%, #33465e 0%, #0a0f18 70%)",
                      boxShadow: "0 0 0 1.5px rgba(90,110,145,0.35)",
                    }}
                  />
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
                    {/* dormant wallpaper — cosmic core + tilted orbit
                     *  rings (all static gradients/borders: rasterized
                     *  once, free during the lid animation) */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "radial-gradient(ellipse 62% 48% at 52% 44%, rgba(30,96,156,0.5) 0%, rgba(14,52,98,0.32) 34%, rgba(5,20,44,0.16) 60%, transparent 80%), radial-gradient(circle at 52% 44%, rgba(224,250,255,0.5) 0%, rgba(124,212,255,0.14) 7%, transparent 16%)",
                        opacity: 0.55,
                      }}
                    />
                    {[
                      { w: "58%", h: "34%", o: 0.5, bw: 1.4 },
                      { w: "78%", h: "48%", o: 0.32, bw: 1.2 },
                      { w: "96%", h: "62%", o: 0.18, bw: 1 },
                    ].map((ring, ri) => (
                      <div
                        key={ri}
                        style={{
                          position: "absolute",
                          left: "52%",
                          top: "44%",
                          width: ring.w,
                          height: ring.h,
                          transform: "translate(-50%, -50%) rotate(-14deg)",
                          borderRadius: "50%",
                          border: `${ring.bw}px solid rgba(140,220,255,${ring.o})`,
                          boxShadow: `0 0 10px rgba(46,166,232,${ring.o * 0.5})`,
                          opacity: 0.6,
                        }}
                      />
                    ))}
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
