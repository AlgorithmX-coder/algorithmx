"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
 *   (headline + CTAs are visible from p=0 since the 2026-07-24
 *   reviewer pass — HeroOverlay no longer takes scroll progress)
 *
 * Deterministic by construction: every animated value derives from
 * scroll progress only — no clocks, no one-shot triggers. Ambient life
 * (LED breathing, nebula drift) is CSS keyframes, disabled under
 * prefers-reduced-motion. Reduced motion pins progress to 1.
 */

/* Stream rows shown on the screen dashboard. The cipher-name teasers
 * (T-minus countdowns for unlaunched streams) retired 2026-10-07: the
 * whole lineup is live, so the screen now sells the real catalogue -
 * every row a named course with its audience and a working link. Hues
 * are each course world's own accent at full brightness - the console
 * surface is dark, so they carry the neon (Heroes amber, Explorers
 * green, Ops violet, Pro orange). */
const STREAMS = [
  { name: "CYBER HEROES", age: "AGES 6-9", status: "LIVE", color: "#ffb347", href: "/cyberheroes" },
  { name: "CYBER EXPLORERS", age: "AGES 10-13", status: "LIVE", color: "#4ade80", href: "/cyberexplorers" },
  { name: "CYBER OPS", age: "AGES 14-17", status: "LIVE", color: "#8b7bff", href: "/ops" },
  { name: "CYBER PRO", age: "AGES 18+", status: "LIVE", color: "#ff7a3d", href: "/pro" },
  { name: "AI CLEARED", age: "FOR WORK", status: "LIVE", color: "#22d3ee", href: "/ai-cleared" },
  { name: "AI FLUENT", age: "FOR WORK", status: "LIVE", color: "#f472b6", href: "/ai-fluent" },
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
const KEY_COLS = ["#0a7085", "#0a7085", "#5744c9", "#a5117f", "#ff7a9f", "#8a5a00", "#0e7a45"];

/* Keyboard rows — real legends (static DOM text; rasterized once, free
 * during the lid animation). Wide==true stretches modifier keys. */
const KEY_LEGENDS: ReadonlyArray<ReadonlyArray<string>> = [
  ["esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "del"],
  ["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"],
  ["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "enter"],
  ["shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "shift"],
  ["fn", "ctrl", "alt", "⌘", "", "⌘", "alt", "←", "↑", "→"],
];

function smoothstep(a: number, b: number, x: number): number {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * overlay       false drops the headline/CTA column (the page said it already).
 * staticOpen    true renders the machine fully open and lit with NO scroll
 *               rail or pinning - the frame fills its parent, for compositing
 *               into another hero. Implies ambience off.
 * ambience      false hides the nebula washes and galaxy floor pool, for
 *               compositing the machine over a host backdrop (2026-10-09:
 *               the desk-scene hero) while KEEPING the scroll-open rail.
 * backdrop      rendered first inside the pinned frame, behind the stage -
 *               the host's own scene (e.g. the photographed desk).
 * frameChildren rendered inside the pinned frame above the stage - the
 *               host's copy column and accreditations, pinned with the
 *               machine through the whole scroll.
 */
export default function HeroCinematicV3({
  overlay = true,
  staticOpen = false,
  ambience = true,
  backdrop,
  frameChildren,
}: {
  overlay?: boolean;
  staticOpen?: boolean;
  ambience?: boolean;
  backdrop?: ReactNode;
  frameChildren?: ReactNode;
} = {}) {
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
  const progress = useTransform(smoothScroll, (v) => (reducedMotion || staticOpen ? 1 : v));

  /* ── beat-derived motion values (all scroll-pure) ────────────────── */
  /* Lid: 0deg = closed flat over the deck; +108deg = open (positive
   * rotateX with the hinge at the container's top edge lifts the free
   * edge toward the viewer — the physical opening direction after the
   * scene tilt). Starts at p=0.06 so the very first wheel tick
   * responds. */
  /* Rest pose starts 12deg ajar (2026-10-09 self-review on the desk
   * scene): dead-flat at p=0 the closed machine read as a thickness-less
   * slab; a sliver of opening shows the deck's depth and lets the
   * screen's glow leak out, so frame one reads as a real machine about
   * to wake rather than a placemat. */
  const lidAngle = useTransform(progress, (p) => 12 + 98 * smoothstep(0.06, 0.48, p));
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
  /* Dormant base raised 0.25 -> 0.45 (reviewer pass): the galaxy pool
   * is now clearly visible under the closed laptop, so the opening
   * frame reads as a product shot in a cosmos rather than a void. */
  const floorGlow = useTransform(progress, (p) => 0.45 + 0.55 * smoothstep(0.38, 0.6, p));
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
        height: staticOpen ? "100%" : isCompact ? "170vh" : "220vh",
        background: "transparent",
      }}
    >
      {/* The pinned frame. Height comes from the class, not from here,
          because it needs two declarations: 100vh for anything without
          svh, then 100svh. On iOS Safari 100vh is the toolbar-HIDDEN
          height, so a frame that tall runs its last ~90px underneath the
          visible toolbar. That is where the phone CTA is pinned, and the
          owner's screenshot shows it cut in half by the toolbar. 100svh
          is the toolbar-SHOWN height, so the frame ends where the user
          can actually see. On desktop svh and vh are the same number, so
          nothing there moves. */}
      <div
        className="hv3-pinFrame"
        style={
          staticOpen
            ? { position: "relative", width: "100%", height: "100%", overflow: "visible" }
            : { position: "sticky", top: 0, width: "100%", overflow: "hidden" }
        }
      >
        {/* ambient cosmic wash — pure CSS, sits over GlobalBackdrop.
         *  Wrapped so the bottom-fade mask feathers the wash into the
         *  backdrop instead of cutting on the section edge. */}
        {/* host scene behind everything, when composited (desk etc.) */}
        {backdrop}
        {!staticOpen && ambience && (
          <div
            aria-hidden
            className="hv3-bottomFade"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <div className="hv3-nebulaA" />
            <div className="hv3-nebulaB" />
          </div>
        )}

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
              /* Sharing the frame with a copy column (its own overlay or
                 a host's frameChildren), the machine sits right of
                 centre; owning the frame alone, it centres. */
              x: overlay || frameChildren ? (isCompact ? "5vw" : isMid ? "22vw" : "16vw") : "0vw",
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
             *  floor at zero per-frame cost. Hidden when composited into
             *  another hero (staticOpen), where it reads as fog. */}
            <motion.div
              style={{
                position: "absolute",
                left: "50%",
                top: "50%",
                width: 1150,
                height: 1150,
                transform: "translate(-50%, -46%)",
                borderRadius: "50%",
                opacity: staticOpen ? 0 : floorGlow,
                display: staticOpen || !ambience ? "none" : undefined,
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
            {!staticOpen && ambience && (
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
                    "radial-gradient(ellipse at 50% 50%, rgba(238,240,243,0.55) 0%, rgba(238,240,243,0.25) 45%, transparent 70%)",
                }}
              />
            )}

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
                    "linear-gradient(145deg, #b3bac4 0%, #d2d7de 45%, #d2d7de 100%)",
                  /* the top inset band is the lid's occlusion shadow on
                     the deck - visible through the ajar rest pose */
                  boxShadow:
                    "inset 0 1px 0 rgba(32,36,45,0.82), inset 0 -1px 0 rgba(0,0,0,0.5), inset 1px 0 0 rgba(140,155,185,0.12), inset 0 34px 36px -26px rgba(25,30,42,0.4)",
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
                        "linear-gradient(180deg, #eef0f3 0%, #b3bac4 40%, #d2d7de 100%)",
                      boxShadow:
                        "inset 0 1px 1px rgba(32,36,45,0.82), 0 1px 3px rgba(0,0,0,0.7)",
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
                      "radial-gradient(circle at 2px 50%, rgba(238,240,243,0.85) 1.1px, transparent 1.4px)",
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
                    background: "linear-gradient(160deg, #eef0f3, #eef0f3)",
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
                                "linear-gradient(180deg, #d2d7de 0%, #eef0f3 100%)",
                              boxShadow: `inset 0 1px 0 rgba(170,190,225,0.13), 0 1px 2px rgba(0,0,0,0.6), 0 0 6px ${hue}14`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontFamily: "var(--lv2-font-mono)",
                              fontSize: legend.length > 1 ? 6.5 : 8.5,
                              fontWeight: 600,
                              color: "rgba(32,36,45,0.82)",
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
                      "linear-gradient(155deg, rgba(210,215,222,0.95), rgba(238,240,243,0.98))",
                    boxShadow:
                      "inset 0 1px 0 rgba(32,36,45,0.82), inset 0 0 0 1px rgba(0,0,0,0.55), inset 0 -8px 22px rgba(0,0,0,0.4)",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: 12,
                      background:
                        "none",
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
                    background: "linear-gradient(180deg, #20242d, #9aa2b0)",
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
                    color: "rgba(17,22,38,0.42)",
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
                    background: "#0a7085",
                    boxShadow: "0 0 8px rgba(0,229,255,0.9)",
                    opacity: ledOpacity,
                  }}
                  className="hv3-ledBreathe"
                />
              </div>

              {/* base thickness — front edge, with machined port cutouts.
                  REMOVED on the light machine: its plane is rotated outward
                  from the deck, so in screen space it projects down and to
                  the left past the machine's silhouette. No horizontal inset
                  can contain that, because the overhang comes from the
                  rotation, not the width. On a black machine it was invisible
                  against a black page; on silver it read as a tray. */}
              <div
                style={{
                  display: "none",
                  position: "absolute",
                  /* The port strip, not a tray. Inset 20px still left its
                   * flat ends outside the machine's silhouette once the
                   * whole scene is rotated in 3D: in screen space the strip
                   * ran past the bottom-left corner as a white slab. It now
                   * sits well inside both corners and is rounded on every
                   * side, so it reads as a recessed edge rather than a plate
                   * under the machine. */
                  left: 58,
                  right: 58,
                  bottom: -11,
                  height: 12,
                  transformOrigin: "50% 0%",
                  transform: "rotateX(-84deg)",
                  borderRadius: 8,
                  /* an edge in shadow, a shade under the deck it belongs to */
                  background: "linear-gradient(180deg, #a8b0bc, #c6ccd5)",
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
                      background: "#eef0f3",
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
                    background: "#eef0f3",
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
                      "linear-gradient(150deg, #b3bac4 0%, #d2d7de 50%, #d2d7de 100%)",
                    boxShadow:
                      "inset 0 1px 0 rgba(32,36,45,0.82), inset 0 -1px 0 rgba(0,0,0,0.45)",
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
                      color: "#0a7085",
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
                        "linear-gradient(105deg, transparent 0%, rgba(255,255,255,0.4) 46%, transparent 78%)",
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
                    background: "linear-gradient(160deg, #d2d7de, #eef0f3)",
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
                        "radial-gradient(circle at 40% 35%, #33465e 0%, #eef0f3 70%)",
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
                      background: "#eef0f3",
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
                          "radial-gradient(ellipse 62% 48% at 52% 44%, rgba(30,96,156,0.5) 0%, rgba(179,186,196,0.32) 34%, rgba(238,240,243,0.16) 60%, transparent 80%), radial-gradient(circle at 52% 44%, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.14) 7%, transparent 16%)",
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
                          "none",
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
                        /* near-opaque: the light dormant wallpaper sits
                           underneath, and any see-through washes the
                           console grey. The boot-up now reads as the
                           display going dark and lighting up. */
                        background:
                          "linear-gradient(180deg, rgba(9,13,21,0.97), rgba(12,17,26,0.98))",
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

        {/* headline / CTA column — visible from scroll 0 (2026-07-24
         *  reviewer pass: the dormant first frame read as empty/dark
         *  with no message until p=0.68).
         *  overlay=false since 2026-10-09: the scene also serves as the
         *  mid-page MISSION CONTROL showcase under the threat-map hero,
         *  where the page already said its headline. */}
        {overlay && <HeroOverlay />}
        {frameChildren}

        {/* scroll hint */}
      </div>

      {/* scoped styles: ambient keyframes + responsive scale + a11y */}
      <style>{`
        /* Two declarations on purpose: the second wins wherever svh is
           understood, the first is the fallback. See the comment on the
           element itself. */
        .hv3-pinFrame { height: 100vh; height: 100svh; }
        .hv3-sceneScale { transform-style: preserve-3d; }
        @media (max-width: 1100px) { .hv3-sceneScale { zoom: 0.82; } }
        @media (max-width: 1000px) { .hv3-sceneScale { zoom: 0.64; } }
        @media (max-width: 768px)  { .hv3-sceneScale { zoom: 0.56; } }
        /* Phones: one step smaller again. The scene grows through the pin
           (measured 432-594 at rest, 412-642 by the end of it) and the
           frame is only ~664 tall, which left no floor for the CTA the
           owner wants under it. */
        @media (max-width: 640px)  { .hv3-sceneScale { zoom: 0.44; } }
        /* Width alone is not enough on a phone: the frame also has to hold
           the copy and the button, and a short phone has 100px less to
           give. Measured at 390x600 the machine ran to 541 while the
           button started at 536. These two steps buy that back. */
        @media (max-width: 640px) and (max-height: 700px) { .hv3-sceneScale { zoom: 0.36; } }
        @media (max-width: 640px) and (max-height: 620px) { .hv3-sceneScale { zoom: 0.29; } }
        /* Shrinking alone raises the machine TOWARDS the copy, because the
           box shrinks about its own centre: at 0.22 the gap under it grew
           to 100 while the copy started overlapping it by 3. So on the
           shortest phones it is pushed back down instead. margin, not
           transform, because framer-motion owns the transform. */
        @media (max-width: 640px) and (max-height: 620px) { .hv3-sceneScale { margin-top: 26px; } }
        /* SCROLL HINT on short windows: the overlay copy (headline, CTA,
         * trust row) fills the 100vh frame, so the hint drops to the
         * frame edge, and disappears where even that would collide. */
        @media (max-height: 1040px) { .hv3-scrollHint { bottom: 10px !important; } }
        @media (max-height: 820px)  { .hv3-scrollHint { display: none !important; } }
        @media (max-width: 640px)   { .hv3-scrollHint { display: none !important; } }
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
        /* Nebula opacities raised (0.5 -> 0.7 / 0.4 -> 0.55) so the
         * opening frame has visible cosmic atmosphere before the first
         * scroll (reviewer pass: frame read as near-black). */
        .hv3-nebulaA {
          width: 55vw; height: 42vw; left: 8vw; top: 12vh; opacity: 0.7;
          background: radial-gradient(ellipse, rgba(40,90,190,0.26), rgba(0,229,255,0.06) 55%, transparent 75%);
          animation: hv3DriftA 26s ease-in-out infinite alternate;
        }
        .hv3-nebulaB {
          width: 48vw; height: 40vw; right: 2vw; bottom: 4vh; opacity: 0.55;
          background: radial-gradient(ellipse, rgba(90,60,200,0.21), rgba(63,208,255,0.06) 55%, transparent 75%);
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
        .hv3-row:hover { background-color: rgba(63,208,255,0.12); }
        .hv3-row:focus-visible { outline: 1.5px solid var(--lv2-cyan); outline-offset: 1px; }
        .hv3-sweep { animation: hv3Sweep 3.6s linear infinite; }
        @keyframes hv3Sweep { to { transform: rotate(360deg); } }
        .hv3-radarBlip { animation: hv3BlipPulse 3.3s ease-in-out infinite; }
        @keyframes hv3BlipPulse { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .hv3-nebulaA, .hv3-nebulaB, .hv3-ledBreathe, .hv3-blink, .hv3-ring, .hv3-sweep, .hv3-radarBlip { animation: none; }
        }
      `}</style>
    </section>
  );
}

/* Screen dashboard — a dark SOC-style threat console (owner
 * 2026-10-07: "something in cybersecurity that looks cool"). Same
 * skeleton as the old mission-control layout — OS bar, left sidebar,
 * centre panel, right column, bottom strip — so the lid animation's
 * raster cost is unchanged. Everything is static except the
 * scroll-cascading operation rows and three tiny CSS loops (radar
 * sweep, blip pulse, caret), all killed under reduced motion. */
const PANEL: CSSProperties = {
  /* Dark glass panes on a near-black display; the faint cyan hairline
   * does the lifting that light fills did on the old silver screen. */
  background: "rgba(16,23,34,0.85)",
  border: "1px solid rgba(63,208,255,0.16)",
  borderRadius: 7,
};
const DIM = "rgba(168,186,214,0.62)";
const INK = "#e8f2ff";

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
              background: "#3fd0ff",
              boxShadow: "0 0 8px rgba(63,208,255,0.9)",
            }}
          />
          <span style={{ color: "#3fd0ff", fontWeight: 700, fontSize: 10.5, letterSpacing: "0.1em", textShadow: "0 0 10px rgba(63,208,255,0.45)" }}>
            ALGORITHMX_OS
          </span>
        </span>
        <span style={{ flex: 1, display: "flex", gap: 13, justifyContent: "center" }}>
          {["OVERVIEW", "RANGE", "THREATS", "INTEL"].map((tab, i) => (
            <span
              key={tab}
              style={{
                fontSize: 7.5,
                letterSpacing: "0.14em",
                fontWeight: 600,
                color: i === 1 ? INK : DIM,
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
              stroke="#3fd0ff"
              strokeWidth="1.1"
              strokeLinecap="round"
              fill="none"
              opacity="0.75"
            />
            <circle cx="6" cy="7.6" r="0.9" fill="#3fd0ff" opacity="0.9" />
          </svg>
          <span>23:47</span>
          <span>
            SYS-07 · <span style={{ color: "#2fe28a" }}>SHIELDS UP</span>
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
          <span style={{ fontSize: 6.5, letterSpacing: "0.16em", color: DIM }}>SHIELD STATUS</span>
          <span
            style={{
              fontFamily: "var(--font-geist-sans, ui-sans-serif), system-ui, sans-serif",
              fontSize: 21,
              fontWeight: 750,
              color: "#3fd0ff",
              lineHeight: 1,
              textShadow: "0 0 14px rgba(63,208,255,0.5)",
            }}
          >
            100%
          </span>
          <span style={{ fontSize: 6.5, letterSpacing: "0.16em", color: "#2fe28a" }}>PERIMETER SECURE</span>
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
            {["RADAR", "RANGE", "INTEL", "REPORTS"].map((n, i) => (
              <span
                key={n}
                style={{
                  fontSize: 7,
                  letterSpacing: "0.13em",
                  fontWeight: 600,
                  color: i === 1 ? INK : DIM,
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
            THREATS BLOCKED <span style={{ color: "#2fe28a", fontWeight: 700 }}>312</span>
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
            background: "rgba(13,19,29,0.55)",
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
                color: INK,
                letterSpacing: "0.02em",
              }}
            >
              LIVE OPERATIONS
            </span>
            <span style={{ fontSize: 6.5, letterSpacing: "0.15em", color: "#2fe28a" }}>
              ● RANGE ACTIVE
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
          <div style={{ ...PANEL, padding: "7px 9px", display: "flex", gap: 9, alignItems: "center" }}>
            {/* perimeter radar — rotating sweep + pulsing contacts */}
            <div
              style={{
                position: "relative",
                width: 44,
                height: 44,
                borderRadius: 99,
                flexShrink: 0,
                overflow: "hidden",
                background: "radial-gradient(circle, rgba(63,208,255,0.1), rgba(8,13,21,0.4) 72%)",
                boxShadow: "inset 0 0 0 1px rgba(63,208,255,0.3)",
              }}
            >
              <div style={{ position: "absolute", inset: 7, borderRadius: 99, border: "1px solid rgba(63,208,255,0.22)" }} />
              <div style={{ position: "absolute", inset: 14, borderRadius: 99, border: "1px solid rgba(63,208,255,0.15)" }} />
              <div
                className="hv3-sweep"
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 99,
                  background: "conic-gradient(from 0deg, rgba(63,208,255,0.5), rgba(63,208,255,0) 75deg, transparent 360deg)",
                }}
              />
              <span className="hv3-radarBlip" style={{ position: "absolute", left: "62%", top: "26%", width: 4, height: 4, borderRadius: 99, background: "#ff5d73", boxShadow: "0 0 6px rgba(255,93,115,0.9)" }} />
              <span className="hv3-radarBlip" style={{ position: "absolute", left: "28%", top: "54%", width: 3.5, height: 3.5, borderRadius: 99, background: "#ffb347", boxShadow: "0 0 6px rgba(255,179,71,0.9)", animationDelay: "-1.1s" }} />
              <span className="hv3-radarBlip" style={{ position: "absolute", left: "52%", top: "68%", width: 3, height: 3, borderRadius: 99, background: "#2fe28a", boxShadow: "0 0 6px rgba(47,226,138,0.9)", animationDelay: "-2.2s" }} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
              <span style={{ fontSize: 6.5, letterSpacing: "0.14em", color: DIM }}>
                PERIMETER SCAN
              </span>
              {[
                ["TRACKING", "3", "#ffb347"],
                ["BLOCKED", "312", "#2fe28a"],
                ["RISK", "LOW", "#2fe28a"],
              ].map(([m, v, c]) => (
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
                  {m} <span style={{ color: c, fontWeight: 700 }}>{v}</span>
                </span>
              ))}
            </div>
          </div>
          <div style={{ ...PANEL, flex: 1, padding: "7px 9px", minHeight: 0, overflow: "hidden" }}>
            <span style={{ fontSize: 6.5, letterSpacing: "0.14em", color: DIM }}>INTERCEPT LOG</span>
            {[
              ["23:46:58", "Port scan dropped · 203.0.113.9", "#ff5d73"],
              ["23:46:31", "Phishing URL quarantined", "#ffb347"],
              ["23:46:02", "Brute force locked out", "#2fe28a"],
            ].map(([time, msg, c]) => (
              <div key={time} style={{ display: "flex", gap: 5, alignItems: "baseline", marginTop: 4 }}>
                <span
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 99,
                    background: c,
                    boxShadow: `0 0 5px ${c}`,
                    flexShrink: 0,
                    transform: "translateY(-1px)",
                  }}
                />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 6, color: "#3fd0ff", letterSpacing: "0.1em" }}>{time}</div>
                  <div
                    style={{
                      fontSize: 7,
                      color: "rgba(206,220,242,0.82)",
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
        <span style={{ fontSize: 7.5, letterSpacing: "0.18em", color: "#2fe28a", fontWeight: 700, textShadow: "0 0 8px rgba(47,226,138,0.5)" }}>
          ● SHIELDS UP
        </span>
        {[
          ["AGES", "6 → ADULT"],
          ["OPERATIONS", "6"],
          ["FORMAT", "HANDS-ON"],
        ].map(([k, v]) => (
          <span key={k} style={{ fontSize: 6.5, letterSpacing: "0.14em", color: DIM }}>
            {k} <span style={{ color: INK, fontWeight: 700 }}>{v}</span>
          </span>
        ))}
        <span style={{ fontSize: 6.5, letterSpacing: "0.14em", color: DIM }}>
          CHOOSE YOUR OPERATION
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
      aria-label={`${stream.name}, ${stream.age.toLowerCase()}, live now`}
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
          color: stream.color,
          fontWeight: 700,
          fontSize: 9,
          letterSpacing: "0.07em",
          whiteSpace: "nowrap",
          textShadow: `0 0 9px ${stream.color}59`,
        }}
      >
        {stream.name}
      </span>
      <span style={{ color: "rgba(186,200,224,0.5)", fontSize: 7, whiteSpace: "nowrap" }}>
        {stream.age}
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

/* ChapterRailV3 and ChapterLabelV3 removed 2026-09-20 (owner call):
   the "04 / 04 · START YOUR JOURNEY" counter in the corner of the hero.
   It narrated the scroll animation to itself; nobody was reading it. */

/* ScrollHintV3 removed 2026-09-20: the hero button now carries the
   "scroll to continue" wording itself, and two of them in one screen
   read as a mistake. */
