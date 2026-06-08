"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";

/**
 * HeroCardHotspots — clickable / hover overlay for the three course cards in
 * the pre-rendered (scrub) hero. On capable GPUs the cards are live 3D meshes
 * that scale on hover and link to the course; on integrated GPUs the hero is
 * a flat baked sequence, so we recreate the interaction with HTML hotspots
 * positioned over where the cards land in the frame.
 *
 * Positions are mapped through the SAME object-fit:cover transform that
 * HeroScrubSequence uses to draw the frames, so the hotspots track the cards
 * across any viewport. They only become active once the cards have emerged
 * (high scroll progress); before that the frame shows the closed/opening
 * laptop and the boxes would sit over nothing.
 */

/* Card rectangles in normalised frame coordinates (frame is 2160x1350).
 * Measured from the final frame; the three cards sit in the upper band. */
const FRAME_AR = 2160 / 1350;
const CARDS = [
  { fx: 0.435, fy: 0.255, fw: 0.115, fh: 0.255 }, // DEFEND AGAINST CYBER ATTACKS
  { fx: 0.553, fy: 0.245, fw: 0.115, fh: 0.275 }, // BUILD INTELLIGENT MACHINES
  { fx: 0.668, fy: 0.265, fw: 0.115, fh: 0.255 }, // DELIVER REAL INDUSTRY PROJECTS
];
const HREF = "/cyberheroes";
const SHOW_AT = 0.74; // progress at which the cards are emerged enough to click
const DEBUG = false;

export default function HeroCardHotspots({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const [rects, setRects] = useState<
    Array<{ x: number; y: number; w: number; h: number }>
  >([]);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const compute = () => {
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const cr = cw / ch;
      let dw: number, dh: number, dx: number, dy: number;
      if (cr > FRAME_AR) {
        dw = cw;
        dh = cw / FRAME_AR;
        dx = 0;
        dy = (ch - dh) / 2;
      } else {
        dh = ch;
        dw = ch * FRAME_AR;
        dy = 0;
        dx = (cw - dw) / 2;
      }
      setRects(
        CARDS.map((c) => ({
          x: dx + c.fx * dw,
          y: dy + c.fy * dh,
          w: c.fw * dw,
          h: c.fh * dh,
        })),
      );
    };
    compute();
    window.addEventListener("resize", compute);
    return () => window.removeEventListener("resize", compute);
  }, []);

  useMotionValueEvent(progress, "change", (v) => {
    const on = v >= SHOW_AT;
    setActive((prev) => (prev === on ? prev : on));
  });
  useEffect(() => {
    setActive(progress.get() >= SHOW_AT);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }}>
      {rects.map((r, i) => (
        <a
          key={i}
          href={HREF}
          aria-label="Explore courses"
          className="hero-card-hotspot"
          style={{
            position: "absolute",
            left: r.x,
            top: r.y,
            width: r.w,
            height: r.h,
            borderRadius: 14,
            cursor: "pointer",
            pointerEvents: active ? "auto" : "none",
            opacity: active ? 1 : 0,
            transition: "opacity .25s ease, box-shadow .2s ease, transform .2s ease",
            outline: DEBUG ? "2px solid rgba(255,0,200,0.8)" : "none",
          }}
        />
      ))}
      <style jsx>{`
        .hero-card-hotspot:hover {
          box-shadow:
            0 0 0 2px rgba(0, 229, 255, 0.75),
            0 0 30px rgba(0, 229, 255, 0.45);
          transform: translateY(-5px) scale(1.03);
        }
      `}</style>
    </div>
  );
}
