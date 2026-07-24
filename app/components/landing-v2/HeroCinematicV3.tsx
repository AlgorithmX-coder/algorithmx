"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
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

/* Stream rows shown on the screen dashboard. Upcoming streams are
 * CLASSIFIED until launch (matches the encrypted roadmap cards below):
 * static cipher names — deterministic strings, NOT animated; the hero's
 * perf contract stays scroll-pure — plus a T-minus countdown in the
 * status pill (same 3/6/12/15/18-month ladder as the roadmap). Real
 * names live in SubjectShowcase's STREAMS and return when a stream
 * flips live. */
const STREAMS = [
  { name: "CYBERSECURITY", age: "6-18+", status: "LIVE", color: "#5fffa3", href: "/cyberheroes", live: true },
  { name: "7F#02$AE49BD1C8", age: "", status: "T-3 MO", color: "#9ff5ff", href: "#subjects", live: false },
  { name: "C4&9E0#B7$2A6F1D3", age: "", status: "T-6 MO", color: "#cba8ff", href: "#subjects", live: false },
  { name: "0B$8D3F#A5E92C", age: "", status: "T-12 MO", color: "#ffd07a", href: "#subjects", live: false },
  { name: "E2%7C1&F8B#04A9D", age: "", status: "T-15 MO", color: "#ffc94a", href: "#subjects", live: false },
  { name: "5A#D6$1E3C&B0", age: "", status: "T-18 MO", color: "#ff3ad6", href: "#subjects", live: false },
] as const;

/* Deterministic per-row activity sparklines (viewBox 0 0 30 10). */
const SPARKS = [
  "0,7 5,6 9,7.5 13,4 17,5.5 21,3 25,4.5 30,2.5",
  "0,6 5,7 9,5 13,6.5 17,4 21,5 25,3.5 30,4.5",
  "0,7.5 5,5.5 9,6.5 13,5 17,6 21,4 25,5 30,3",
  "0,6.5 5,7.5 9,6 13,7 17,5 21,6 25,4.5 30,5.5",
  "0,7 5,6.5 9,7.5 13,6 17,7 21,5 25,6 30,4",
  "0,6 5,5 9,6.5 13,4.5 17,6 21,3.5 25,5 30,3.5",
];

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

  /* Mid band (769–1000px, i.e. iPad portrait): desktop framing put the
   * laptop on top of the headline at these widths — push the scene
   * further right and down (plus the 0.68 zoom in the CSS below) so
   * the text column keeps clean space. */
  const [isMid, setIsMid] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 769px) and (max-width: 1000px)");
    const apply = () => setIsMid(mq.matches);
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
    ([p, s]: number[]) =>
      79 + 22 * smoothstep(0, 0.6, p) + 110 * s + (isCompact ? 130 : isMid ? 80 : 0),
  );
  /* Screen ignition + keyboard underglow + energy floor. */
  const screenT = useTransform(progress, (p) => smoothstep(0.4, 0.56, p));
  const screenGlow = useTransform(screenT, (v) => 0.55 * v);
  const kbGlow = useTransform(progress, (p) => smoothstep(0.5, 0.64, p));
  const floorGlow = useTransform(progress, (p) => 0.25 + 0.75 * smoothstep(0.38, 0.6, p));
  /* Standby LED fades out as the machine wakes. */
  const ledOpacity = useTransform(progress, (p) => 1 - smoothstep(0.35, 0.5, p));
  /* LID LIGHT SWEEP — a specular band travelling across the aluminum
   * while the lid is in motion (scroll-driven; invisible at rest). Its
   * own compositor layer inside the lid — adds nothing to the lid's
   * animation cost. */
  const sweepX = useTransform(
    progress,
    (p) => `${-160 + 330 * smoothstep(0.08, 0.44, p)}%`,
  );
  const sweepOpacity = useTransform(progress, (p) => {
    const t = smoothstep(0.08, 0.44, p);
    return Math.sin(Math.PI * t) * 0.5;
  });
  /* IGNITION FLASH — a light kick that peaks as the screen lights and is
   * fully gone by 0.58. Scroll-keyed sine envelope: it physically cannot
   * linger (the failure mode of the old hero's detonation pool). */
  const ignitionFlash = useTransform(progress, (p) => {
    const t = smoothstep(0.4, 0.58, p);
    return Math.sin(Math.PI * t) * 0.75;
  });

  /* MOUSE PARALLAX — the whole rig tilts subtly toward the cursor
   * (single spring-smoothed transform, like the shipped live hero).
   * Not attached under reduced motion; inert on touch devices. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  useEffect(() => {
    if (reducedMotion) return;
    const onMove = (e: PointerEvent) => {
      /* Mouse only — touch pointers fire pointermove at drag start,
       * which made the rig twitch toward the last touch on iPads. */
      if (e.pointerType !== "mouse") return;
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reducedMotion, pointerX, pointerY]);
  const parRotY = useSpring(
    useTransform(pointerX, (v) => v * 3),
    { stiffness: 46, damping: 16 },
  );
  const parRotX = useSpring(
    useTransform(pointerY, (v) => v * -2.2),
    { stiffness: 46, damping: 16 },
  );

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
        {/* ambient cosmic wash — pure CSS, sits over GlobalBackdrop.
         *  Wrapped so the bottom-fade mask feathers the wash into the
         *  backdrop instead of cutting on the section edge. */}
        <div
          aria-hidden
          className="hv3-bottomFade"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <div className="hv3-nebulaA" />
          <div className="hv3-nebulaB" />
        </div>

        {/* ── 3D stage (contains real links — not aria-hidden) ── */}
        <div
          className="hv3-bottomFade"
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
              x: isCompact ? "5vw" : isMid ? "22vw" : "14vw",
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
          <motion.div
            style={{
              rotateX: parRotX,
              rotateY: parRotY,
              transformStyle: "preserve-3d",
            }}
          >
            {/* GALAXY FLOOR POOL — layered nebula + faint spiral swirl
             *  under the deck (all static gradients; the single opacity
             *  is the only animated value). Echoes the old hero's galaxy
             *  floor at zero per-frame cost. */}
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
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle at 50% 50%, rgba(0,229,255,0.15) 0%, rgba(60,120,255,0.08) 28%, rgba(0,229,255,0.03) 52%, transparent 70%), " +
                    "radial-gradient(ellipse 55% 38% at 38% 58%, rgba(120,80,220,0.10) 0%, transparent 65%), " +
                    "radial-gradient(ellipse 48% 30% at 66% 40%, rgba(40,160,235,0.10) 0%, transparent 65%)",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "12%",
                  borderRadius: "50%",
                  background:
                    "conic-gradient(from 210deg at 50% 50%, transparent 0deg, rgba(90,180,255,0.05) 40deg, transparent 90deg, rgba(140,120,255,0.05) 150deg, transparent 210deg, rgba(0,229,255,0.06) 280deg, transparent 340deg)",
                  filter: "blur(6px)",
                }}
              />
            </motion.div>
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

                {/* antenna isolation lines near the hinge corners */}
                {[26, undefined].map((left, i) => (
                  <div
                    key={i}
                    style={{
                      position: "absolute",
                      ...(left !== undefined ? { left } : { right: 26 }),
                      top: 3,
                      width: 1,
                      height: 22,
                      background: "rgba(150,172,208,0.2)",
                    }}
                  />
                ))}

                {/* etched regulatory micro-text */}
                <div
                  style={{
                    position: "absolute",
                    right: 58,
                    bottom: 38,
                    fontFamily: "var(--lv2-font-mono)",
                    fontSize: 5.5,
                    letterSpacing: "0.12em",
                    color: "rgba(232,237,255,0.14)",
                    userSelect: "none",
                  }}
                >
                  MODEL AX-26 · DESIGNED BY ALGORITHMX LABS
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

              {/* base thickness — front edge, with machined port cutouts */}
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
              >
                {/* USB-C ×2 */}
                {[128, 166].map((x) => (
                  <div
                    key={x}
                    style={{
                      position: "absolute",
                      left: x,
                      top: 4.5,
                      width: 24,
                      height: 4.5,
                      borderRadius: 3,
                      background: "#04060b",
                      boxShadow:
                        "inset 0 1px 2px rgba(0,0,0,0.95), 0 1px 0 rgba(160,182,215,0.1)",
                    }}
                  />
                ))}
                {/* headphone jack */}
                <div
                  style={{
                    position: "absolute",
                    left: 204,
                    top: 3.5,
                    width: 6.5,
                    height: 6.5,
                    borderRadius: 99,
                    background: "#04060b",
                    boxShadow:
                      "inset 0 1px 2px rgba(0,0,0,0.95), 0 1px 0 rgba(160,182,215,0.1)",
                  }}
                />
              </div>

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
                    overflow: "hidden",
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
                  {/* specular sweep while the lid moves */}
                  <motion.div
                    aria-hidden
                    style={{
                      position: "absolute",
                      top: "-25%",
                      bottom: "-25%",
                      left: 0,
                      width: "48%",
                      x: sweepX,
                      opacity: sweepOpacity,
                      background:
                        "linear-gradient(105deg, transparent 0%, rgba(185,220,255,0.14) 32%, rgba(225,242,255,0.3) 50%, rgba(185,220,255,0.14) 68%, transparent 100%)",
                      pointerEvents: "none",
                    }}
                  />
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
                        className="hv3-ring"
                        style={{
                          position: "absolute",
                          left: "52%",
                          top: "44%",
                          width: ring.w,
                          height: ring.h,
                          /* rotate as a SEPARATE property so the drift
                           * keyframe composes with the translate */
                          transform: "translate(-50%, -50%)",
                          rotate: "-14deg",
                          animationDelay: `${ri * -7}s`,
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
          </motion.div>
        </div>

        {/* ignition flash — light kick as the screen lights (scroll-keyed
         *  sine envelope: peaks mid-ignition, fully gone by p=0.58) */}
        <motion.div
          aria-hidden
          style={{
            position: "absolute",
            left: "28%",
            top: "4%",
            width: "60%",
            height: "78%",
            opacity: ignitionFlash,
            background:
              "radial-gradient(circle at 56% 38%, rgba(150,225,255,0.42) 0%, rgba(40,140,255,0.16) 38%, transparent 68%)",
            pointerEvents: "none",
          }}
        />

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
        @media (max-width: 1000px) { .hv3-sceneScale { zoom: 0.64; } }
        @media (max-width: 768px)  { .hv3-sceneScale { zoom: 0.56; } }
        /* BOTTOM BLEND — feathers the hero's visual layers (nebula wash,
         * laptop scene, floor glow) to transparent over the last ~18% of
         * the frame, so the section hands off into the shared global
         * backdrop instead of ending on a hard horizontal cut. Static
         * mask = zero per-frame cost; HUD text layers sit outside it and
         * stay crisp. */
        .hv3-bottomFade {
          -webkit-mask-image: linear-gradient(to bottom,
            #000 0%, #000 82%, rgba(0,0,0,0.72) 88%, rgba(0,0,0,0.38) 94%, transparent 100%);
          mask-image: linear-gradient(to bottom,
            #000 0%, #000 82%, rgba(0,0,0,0.72) 88%, rgba(0,0,0,0.38) 94%, transparent 100%);
        }
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
        .hv3-blink { animation: hv3Blink 1.1s steps(2, start) infinite; }
        @keyframes hv3Blink { to { visibility: hidden; } }
        .hv3-ring { animation: hv3RingDrift 26s ease-in-out infinite alternate; }
        @keyframes hv3RingDrift { from { rotate: -14deg; } to { rotate: -6deg; } }
        .hv3-row { transition: background-color 0.18s ease, box-shadow 0.18s ease; cursor: pointer; }
        .hv3-row:hover { background-color: rgba(63,208,255,0.1); }
        .hv3-row:focus-visible { outline: 1.5px solid var(--lv2-cyan); outline-offset: 1px; }
        @media (prefers-reduced-motion: reduce) {
          .hv3-nebulaA, .hv3-nebulaB, .hv3-ledBreathe, .hv3-blink, .hv3-ring { animation: none; }
        }
      `}</style>
    </section>
  );
}

/* Screen dashboard — real HTML mission-control layout (echoes the old
 * live hero's ORBITAL OVERVIEW screen): OS bar with tabs, left system
 * sidebar, central streams panel, right health/feed column, bottom
 * parameter strip. Everything is static except the scroll-cascading
 * stream rows — rasterized once, free during the lid animation. */
const PANEL: CSSProperties = {
  background: "rgba(9,15,28,0.66)",
  border: "1px solid rgba(90,150,220,0.2)",
  borderRadius: 7,
};
const DIM = "rgba(205,218,242,0.52)";

function ScreenDashboard({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      {/* ── OS bar ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          paddingBottom: 6,
          borderBottom: "1px solid rgba(63,208,255,0.22)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0 }}>
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: 99,
              background: "#00e5ff",
              boxShadow: "0 0 8px rgba(0,229,255,0.9)",
            }}
          />
          <span style={{ color: "#9ff5ff", fontWeight: 700, fontSize: 10.5, letterSpacing: "0.1em" }}>
            ALGORITHMX_OS
          </span>
        </span>
        <span style={{ flex: 1, display: "flex", gap: 13, justifyContent: "center" }}>
          {["OVERVIEW", "STREAMS", "MISSIONS", "ANALYTICS"].map((tab, i) => (
            <span
              key={tab}
              style={{
                fontSize: 7.5,
                letterSpacing: "0.14em",
                fontWeight: 600,
                color: i === 1 ? "#e9f0ff" : DIM,
                borderBottom: i === 1 ? "1.5px solid #3fd0ff" : "1.5px solid transparent",
                paddingBottom: 2,
              }}
            >
              {tab}
            </span>
          ))}
        </span>
        <span
          style={{
            color: DIM,
            fontSize: 7.5,
            letterSpacing: "0.16em",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <svg viewBox="0 0 12 9" style={{ width: 10, height: 8 }} aria-hidden>
            <path
              d="M1.2 3.8a7 7 0 0 1 9.6 0M3.2 5.8a4.2 4.2 0 0 1 5.6 0"
              stroke="#9ff5ff"
              strokeWidth="1.1"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
            <circle cx="6" cy="7.6" r="0.9" fill="#9ff5ff" opacity="0.9" />
          </svg>
          <span>23:47</span>
          <span>
            SYS-07 · <span style={{ color: "#5fffa3" }}>ONLINE</span>
          </span>
        </span>
      </div>

      {/* ── main grid ── */}
      <div style={{ flex: 1, display: "flex", gap: 7, padding: "7px 0", minHeight: 0 }}>
        {/* left sidebar */}
        <div
          style={{
            ...PANEL,
            width: "23%",
            padding: "8px 9px",
            display: "flex",
            flexDirection: "column",
            gap: 5,
          }}
        >
          <span style={{ fontSize: 6.5, letterSpacing: "0.16em", color: DIM }}>SYSTEM STATUS</span>
          <span
            style={{
              fontFamily: "var(--font-geist-sans, ui-sans-serif), system-ui, sans-serif",
              fontSize: 21,
              fontWeight: 750,
              color: "#3fd0ff",
              lineHeight: 1,
            }}
          >
            100%
          </span>
          <span style={{ fontSize: 6.5, letterSpacing: "0.16em", color: DIM }}>OPERATIONAL</span>
          {/* waveform */}
          <svg viewBox="0 0 100 16" style={{ width: "100%", height: 14, marginTop: 2 }} aria-hidden>
            <polyline
              points="0,9 8,9 12,4 16,13 22,9 34,9 38,6 42,12 48,9 60,9 64,3 68,14 74,9 86,9 90,6 94,11 100,9"
              fill="none"
              stroke="#3fd0ff"
              strokeWidth="1.1"
              opacity="0.8"
            />
          </svg>
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 3, marginTop: 3 }}>
            {["DASHBOARD", "STREAMS", "MISSIONS", "REPORTS"].map((n, i) => (
              <span
                key={n}
                style={{
                  fontSize: 7,
                  letterSpacing: "0.13em",
                  fontWeight: 600,
                  color: i === 1 ? "#e9f0ff" : DIM,
                  background: i === 1 ? "rgba(63,208,255,0.12)" : "transparent",
                  borderLeft: i === 1 ? "2px solid #3fd0ff" : "2px solid transparent",
                  borderRadius: 3,
                  padding: "3px 5px",
                }}
              >
                {n}
              </span>
            ))}
          </div>
          <span style={{ fontSize: 6.5, letterSpacing: "0.14em", color: DIM }}>
            UPTIME <span style={{ color: "#9ff5ff" }}>23:47:12</span>
          </span>
        </div>

        {/* centre — streams over the orbital visual */}
        <div
          style={{
            ...PANEL,
            flex: 1,
            padding: "7px 9px",
            display: "flex",
            flexDirection: "column",
            background: "rgba(7,12,24,0.45)",
            minWidth: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              justifyContent: "space-between",
              paddingBottom: 4,
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-geist-sans, ui-sans-serif), system-ui, sans-serif",
                fontSize: 11,
                fontWeight: 750,
                color: "#e9f0ff",
                letterSpacing: "0.02em",
              }}
            >
              LEARNING STREAMS
            </span>
            <span style={{ fontSize: 6.5, letterSpacing: "0.15em", color: "#3fd0ff" }}>
              ● REAL-TIME VIEW
            </span>
          </div>
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              minHeight: 0,
            }}
          >
            {STREAMS.map((s, i) => (
              <StreamRow key={s.name} stream={s} idx={i} progress={progress} />
            ))}
          </div>
        </div>

        {/* right column — health, feed */}
        <div
          style={{
            width: "27%",
            display: "flex",
            flexDirection: "column",
            gap: 7,
          }}
        >
          <div style={{ ...PANEL, padding: "7px 9px", display: "flex", gap: 8, alignItems: "center" }}>
            {/* conic gauge */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 99,
                flexShrink: 0,
                background:
                  "conic-gradient(#3fd0ff 0deg 356deg, rgba(90,150,220,0.25) 356deg 360deg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 99,
                  background: "#0a1020",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 7.5,
                  fontWeight: 700,
                  color: "#e9f0ff",
                }}
              >
                100%
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 6.5, letterSpacing: "0.14em", color: DIM }}>
                SYSTEM HEALTH
              </span>
              {["POWER", "SHIELDS", "COMMS"].map((m) => (
                <span
                  key={m}
                  style={{
                    fontSize: 6.5,
                    letterSpacing: "0.1em",
                    color: DIM,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 6,
                  }}
                >
                  {m} <span style={{ color: "#5fffa3" }}>100%</span>
                </span>
              ))}
            </div>
          </div>
          <div style={{ ...PANEL, flex: 1, padding: "7px 9px", minHeight: 0, overflow: "hidden" }}>
            <span style={{ fontSize: 6.5, letterSpacing: "0.14em", color: DIM }}>MISSION FEED</span>
            {[
              ["23:46:58", "System check complete"],
              ["23:46:31", "All nodes operational"],
              ["23:46:02", "Data sync complete"],
            ].map(([time, msg]) => (
              <div key={time} style={{ display: "flex", gap: 5, alignItems: "baseline", marginTop: 4 }}>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 99,
                    background: "#5fffa3",
                    flexShrink: 0,
                    transform: "translateY(-1px)",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 6, color: "#3fd0ff", letterSpacing: "0.1em" }}>{time}</div>
                  <div
                    style={{
                      fontSize: 7,
                      color: "rgba(225,233,250,0.8)",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {msg}
                  </div>
                </div>
              </div>
            ))}
            {/* live terminal prompt — blinking caret (CSS steps keyframe,
             *  its own tiny layer; killed under reduced motion) */}
            <div style={{ marginTop: 5, fontSize: 6.5, color: "#3fd0ff", letterSpacing: "0.1em" }}>
              &gt; <span className="hv3-blink">▍</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── bottom parameter strip ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 5,
          borderTop: "1px solid rgba(63,208,255,0.16)",
        }}
      >
        <span style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "#5fffa3", fontWeight: 700 }}>
          ● READY
        </span>
        {[
          ["AGES", "6 → ADULT"],
          ["STREAMS", "6"],
          ["FORMAT", "PROJECT-BASED"],
        ].map(([k, v]) => (
          <span key={k} style={{ fontSize: 6.5, letterSpacing: "0.14em", color: DIM }}>
            {k} <span style={{ color: "#e9f0ff", fontWeight: 700 }}>{v}</span>
          </span>
        ))}
        <span style={{ fontSize: 6.5, letterSpacing: "0.14em", color: DIM }}>
          CHOOSE A STREAM TO BEGIN
        </span>
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
    /* A real link — the on-screen OS is interactive (something a baked
     * frame sequence could never do). */
    <motion.a
      className="hv3-row"
      href={stream.href}
      aria-label={
        stream.live
          ? `${stream.name}, ages ${stream.age}, live now`
          : `Classified stream, unlocks in ${stream.status.replace("T-", "").replace(" MO", " months")}`
      }
      style={{
        opacity,
        x,
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "3px 12px 3px 6px",
        borderRadius: 6,
        textDecoration: "none",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: 99,
          background: stream.color,
          boxShadow: `0 0 6px ${stream.color}aa`,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: `${stream.color}e6`,
          fontWeight: 700,
          fontSize: 9,
          letterSpacing: "0.07em",
          whiteSpace: "nowrap",
        }}
      >
        {stream.name}
      </span>
      <span style={{ color: "rgba(232,237,255,0.42)", fontSize: 7, whiteSpace: "nowrap" }}>
        {stream.live ? `AGES ${stream.age}` : "ENCRYPTED"}
      </span>
      <span style={{ flex: 1 }} />
      {/* activity sparkline (static, deterministic per row) */}
      <svg
        viewBox="0 0 30 10"
        style={{ width: 26, height: 9, flexShrink: 0, opacity: 0.5 }}
        aria-hidden
      >
        <polyline
          points={SPARKS[idx % SPARKS.length]}
          fill="none"
          stroke={stream.color}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      <span
        style={{
          fontSize: 7,
          fontWeight: 700,
          letterSpacing: "0.1em",
          color: stream.color,
          border: `1px solid ${stream.color}66`,
          background: `${stream.color}14`,
          borderRadius: 4,
          padding: "1px 6px",
          flexShrink: 0,
        }}
      >
        {stream.status}
      </span>
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
