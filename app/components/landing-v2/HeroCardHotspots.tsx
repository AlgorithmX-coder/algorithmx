"use client";

import { useEffect, useState } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";

/**
 * HeroCardHotspots — hover info for the three course cards in the
 * pre-rendered (scrub) hero. On capable GPUs the cards are live 3D meshes;
 * on integrated GPUs the hero is a flat baked sequence, so we overlay an
 * invisible hotspot on each card. Hovering a card zooms it slightly and
 * reveals a panel describing how that subject is taught. No navigation —
 * each of the three is independent.
 *
 * Positions map through the SAME object-fit:cover transform HeroScrubSequence
 * uses, so the hotspots track the cards across any viewport. They only
 * activate once the cards have emerged (high scroll progress).
 */

const FRAME_AR = 2160 / 1350;

/* Card rect in normalised frame coords + the info revealed on hover. */
const CARDS = [
  {
    fx: 0.435, fy: 0.255, fw: 0.115, fh: 0.255,
    color: "#5fffa3",
    title: "Defend Against Cyber Attacks",
    how: "Hands-on missions — spot phishing, build & crack passwords, and defend a live network, guided step by step.",
  },
  {
    fx: 0.553, fy: 0.245, fw: 0.115, fh: 0.275,
    color: "#cba8ff",
    title: "Build Intelligent Machines",
    how: "Train your own AI models, explore image recognition and chatbots, and learn how machines actually make decisions.",
  },
  {
    fx: 0.668, fy: 0.265, fw: 0.115, fh: 0.255,
    color: "#ffd07a",
    title: "Deliver Real Industry Projects",
    how: "Plan, build and ship real apps — from first idea to a working product you can show off in a portfolio.",
  },
];
const SHOW_AT = 0.74; // progress at which the cards have emerged

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
        dw = cw; dh = cw / FRAME_AR; dx = 0; dy = (ch - dh) / 2;
      } else {
        dh = ch; dw = ch * FRAME_AR; dy = 0; dx = (cw - dw) / 2;
      }
      setRects(
        CARDS.map((c) => ({
          x: dx + c.fx * dw, y: dy + c.fy * dh, w: c.fw * dw, h: c.fh * dh,
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
      {rects.map((r, i) => {
        const c = CARDS[i];
        return (
          <div
            key={i}
            className="hcard"
            style={{
              position: "absolute",
              left: r.x,
              top: r.y,
              width: r.w,
              height: r.h,
              pointerEvents: active ? "auto" : "none",
              opacity: active ? 1 : 0,
              transition: "opacity .25s ease, transform .25s ease",
            }}
          >
            {/* info panel — zooms in on hover, describes how the subject is taught */}
            <div
              className="hcard-pop"
              style={{
                position: "absolute",
                left: "50%",
                bottom: "calc(100% + 14px)",
                width: 282,
                maxWidth: "62vw",
                padding: "16px 18px",
                borderRadius: 16,
                border: `1.5px solid ${c.color}aa`,
                background:
                  "linear-gradient(180deg, rgba(24,28,44,0.99), rgba(13,16,26,0.99))",
                boxShadow: `0 22px 55px rgba(0,0,0,0.7), 0 0 30px ${c.color}55, inset 0 1px 0 ${c.color}22`,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--lv2-font-display)",
                  fontSize: 15.5,
                  fontWeight: 800,
                  color: c.color,
                  marginBottom: 8,
                  textShadow: `0 0 14px ${c.color}66`,
                }}
              >
                {c.title}
              </div>
              <div style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(236,241,255,0.92)" }}>
                {c.how}
              </div>
              {/* caret pointing down at the card */}
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: "50%",
                  bottom: -7,
                  transform: "translateX(-50%) rotate(45deg)",
                  width: 12,
                  height: 12,
                  background: "rgba(13,16,26,0.99)",
                  borderRight: `1.5px solid ${c.color}aa`,
                  borderBottom: `1.5px solid ${c.color}aa`,
                }}
              />
            </div>
          </div>
        );
      })}
      <style jsx>{`
        .hcard {
          cursor: default;
        }
        .hcard:hover {
          transform: scale(1.06);
          z-index: 6;
        }
        .hcard-pop {
          transform: translate(-50%, -6px) scale(0.92);
          transform-origin: bottom center;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.2s ease, transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .hcard:hover .hcard-pop {
          opacity: 1;
          transform: translate(-50%, 0) scale(1);
        }
      `}</style>
    </div>
  );
}
