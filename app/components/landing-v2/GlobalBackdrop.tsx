"use client";

import { useEffect, useRef } from "react";

/**
 * GlobalBackdrop — the visual environment behind the /cybersecurity page.
 *
 * A sibling of the homepage's CosmicNetworkBackground (same deep-space
 * universe so the site reads as one), composed to match a reference
 * deep-space HUD scene:
 *
 *   • bright BLUE nebula bottom-left with a planet-limb edge + concentric
 *     orbital arcs sweeping through it
 *   • bright VIOLET nebula top-right with a hexagon HUD over it
 *   • deliberate CONSTELLATION shapes down the right side (bright linked
 *     stars), plus smaller ones near the glows
 *   • HUD furniture — concentric rings, hexagons, dot-matrix grids,
 *     crosshairs, dashed ticks, leader lines
 *   • a blue-white + violet STARFIELD over a near-black navy base
 *   • a centre-dim scrim so the content column stays legible
 *
 * One canvas / one rAF drives the starfield (drift + twinkle), the
 * constellation twinkle and a rare shooting star; the HUD + constellation
 * geometry is deterministic so it reads as intentional. CSS carries the
 * base wash, the colour glows and the scrim. Cursor parallax adds depth.
 * Honours prefers-reduced-motion (single static frame, no loop, glows
 * frozen) and pauses on hidden tabs.
 *
 * Fixed-position, pointer-events: none, z-index: -1.
 */
export default function GlobalBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0;
    let h = 0;

    /* ── Starfield ── */
    interface Star {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      z: number;
      a: number;
      tw: number;
      phase: number;
      violet: boolean;
    }
    let stars: Star[] = [];

    /* ── Constellations — hand-authored templates (local coords ≈ -1..1),
     *    placed + scaled at fractional anchors. Edge-biased to the right
     *    and toward the glows so the centre stays clear. ── */
    interface CTemplate {
      ax: number;
      ay: number;
      s: number; // scale (fraction of min dimension)
      pts: [number, number][];
      closed?: boolean;
      majors?: number[]; // indices of brighter "anchor" stars
    }
    const C_TEMPLATES: CTemplate[] = [
      // tall zig-zag chain down the right edge (the hero constellation)
      {
        ax: 0.93,
        ay: 0.52,
        s: 0.5,
        pts: [
          [0.2, -1.0],
          [-0.2, -0.55],
          [0.25, -0.12],
          [-0.1, 0.35],
          [0.3, 0.78],
          [0.05, 1.15],
        ],
        majors: [0, 2, 4],
      },
      // small "W" lower-right
      {
        ax: 0.8,
        ay: 0.66,
        s: 0.13,
        pts: [
          [-1, 0.3],
          [-0.5, -0.4],
          [0, 0.25],
          [0.5, -0.4],
          [1, 0.3],
        ],
        majors: [1, 3],
      },
      // little triangle near bottom-left blue glow
      {
        ax: 0.22,
        ay: 0.86,
        s: 0.12,
        pts: [
          [0, 0],
          [0.7, 0.25],
          [0.25, 0.85],
        ],
        closed: true,
        majors: [0],
      },
      // short arc top-right under the violet glow
      {
        ax: 0.74,
        ay: 0.2,
        s: 0.11,
        pts: [
          [-0.8, 0.2],
          [-0.2, -0.2],
          [0.4, 0.1],
          [0.9, 0.55],
        ],
        majors: [1],
      },
    ];

    interface CNode {
      x: number;
      y: number;
      major: boolean;
      phase: number;
    }
    interface Constellation {
      nodes: CNode[];
      links: [number, number][];
    }
    let constellations: Constellation[] = [];

    /* Static dot-matrix grids (bottom-right HUD detail) */
    interface DotGrid {
      x: number;
      y: number;
      cols: number;
      rows: number;
      gap: number;
    }
    let dotGrids: DotGrid[] = [];

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const min = Math.min(w, h);

      const N = Math.min(170, Math.floor((w * h) / 11000));
      stars = Array.from({ length: N }, () => {
        const z = Math.random();
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * (0.04 + z * 0.13),
          vy: (Math.random() - 0.5) * (0.04 + z * 0.13),
          r: 0.4 + z * 1.5,
          z,
          a: 0.16 + Math.random() * 0.5,
          tw: Math.random() < 0.45 ? 0.34 : 0.08,
          phase: Math.random() * Math.PI * 2,
          violet: Math.random() < 0.24,
        };
      });

      constellations = C_TEMPLATES.map((t) => {
        const nodes: CNode[] = t.pts.map((p, i) => ({
          x: t.ax * w + p[0] * t.s * min,
          y: t.ay * h + p[1] * t.s * min,
          major: t.majors?.includes(i) ?? false,
          phase: i * 1.3,
        }));
        const links: [number, number][] = [];
        for (let i = 0; i < nodes.length - 1; i++) links.push([i, i + 1]);
        if (t.closed) links.push([nodes.length - 1, 0]);
        return { nodes, links };
      });

      dotGrids = [
        { x: w - min * 0.2, y: h * 0.64, cols: 7, rows: 4, gap: min * 0.012 },
        { x: w - min * 0.11, y: h * 0.72, cols: 5, rows: 5, gap: min * 0.009 },
      ];
    };
    build();

    let rt: ReturnType<typeof setTimeout>;
    const onResize = () => {
      clearTimeout(rt);
      rt = setTimeout(build, 180);
    };
    window.addEventListener("resize", onResize);

    const target = { x: 0, y: 0 };
    const eased = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth - 0.5) * 2;
      target.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    if (!reduceMotion) window.addEventListener("pointermove", onPointer, { passive: true });

    const hud = (a: number) => `rgba(130,185,255,${a})`;

    /* Concentric partial rings around a centre */
    const rings = (cx: number, cy: number, radii: number[], a0: number, a1: number, alpha: number) => {
      for (let i = 0; i < radii.length; i++) {
        ctx.strokeStyle = hud(alpha - i * 0.018);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(cx, cy, radii[i], a0, a1);
        ctx.stroke();
      }
    };

    const hexagon = (cx: number, cy: number, r: number, alpha: number) => {
      ctx.strokeStyle = hud(alpha);
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i - Math.PI / 6;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    };

    const crosshair = (cx: number, cy: number, alpha: number) => {
      ctx.strokeStyle = hud(alpha);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy);
      ctx.lineTo(cx + 4, cy);
      ctx.moveTo(cx, cy - 4);
      ctx.lineTo(cx, cy + 4);
      ctx.stroke();
    };

    const drawHud = () => {
      const min = Math.min(w, h);

      // top-left concentric rings + leader line ending in a node
      rings(w * 0.11, h * 0.17, [min * 0.07, min * 0.1, min * 0.135], 0.6, 5.4, 0.22);
      ctx.fillStyle = hud(0.45);
      ctx.beginPath();
      ctx.arc(w * 0.11, h * 0.17, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = hud(0.16);
      ctx.beginPath();
      ctx.moveTo(w * 0.11, h * 0.17);
      ctx.lineTo(w * 0.24, h * 0.115);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w * 0.24, h * 0.115, 2, 0, Math.PI * 2);
      ctx.fillStyle = hud(0.4);
      ctx.fill();

      // bottom-left orbital arcs sweeping through the blue glow (planet limb)
      rings(w * 0.04, h * 1.04, [min * 0.4, min * 0.5, min * 0.6, min * 0.72], -1.5, -0.05, 0.3);

      // bottom-right corner ring
      rings(w * 1.0, h * 1.05, [min * 0.2, min * 0.27], Math.PI, Math.PI * 1.5, 0.24);

      // hexagons — top-right (over violet) + bottom-left
      hexagon(w * 0.86, h * 0.16, min * 0.06, 0.14);
      hexagon(w * 0.07, h * 0.82, min * 0.045, 0.13);

      // crosshairs scattered toward the edges
      for (const [fx, fy] of [
        [0.46, 0.17],
        [0.93, 0.31],
        [0.07, 0.46],
        [0.66, 0.5],
        [0.5, 0.86],
      ]) {
        crosshair(fx * w, fy * h, 0.22);
      }

      // dot-matrix grids (bottom-right)
      for (const g of dotGrids) {
        for (let r = 0; r < g.rows; r++) {
          for (let c = 0; c < g.cols; c++) {
            const bright = (r * 7 + c * 3) % 5 === 0;
            ctx.fillStyle = hud(bright ? 0.45 : 0.16);
            ctx.beginPath();
            ctx.arc(g.x + c * g.gap, g.y + r * g.gap, bright ? 1.3 : 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // dashed tick near bottom centre + a corner bracket
      ctx.save();
      ctx.setLineDash([4, 5]);
      ctx.strokeStyle = hud(0.14);
      ctx.beginPath();
      ctx.moveTo(w * 0.44, h * 0.93);
      ctx.lineTo(w * 0.58, h * 0.93);
      ctx.stroke();
      ctx.restore();
      ctx.strokeStyle = hud(0.12);
      ctx.beginPath();
      ctx.moveTo(w * 0.04, h * 0.9);
      ctx.lineTo(w * 0.11, h * 0.9);
      ctx.lineTo(w * 0.14, h * 0.94);
      ctx.stroke();
    };

    /* Bright planet-limb crescent through the bottom-left blue glow —
     * the lit edge of a world, as in the reference. */
    const drawPlanetLimb = () => {
      const min = Math.min(w, h);
      const cx = w * 0.04;
      const cy = h * 1.04;
      const R = min * 0.47;
      // wide soft glow band along the limb
      ctx.strokeStyle = "rgba(110,190,255,0.14)";
      ctx.lineWidth = 16;
      ctx.beginPath();
      ctx.arc(cx, cy, R, -1.18, -0.3);
      ctx.stroke();
      // crisp bright crescent edge
      ctx.strokeStyle = "rgba(195,230,255,0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy, R, -1.02, -0.46);
      ctx.stroke();
      // faint inner highlight just inside the edge
      ctx.strokeStyle = "rgba(150,210,255,0.28)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R - 7, -0.96, -0.5);
      ctx.stroke();
    };

    const drawConstellations = (ts: number, motion: number, px: number, py: number) => {
      for (const c of constellations) {
        // links
        ctx.strokeStyle = "rgba(150,200,255,0.22)";
        ctx.lineWidth = 1;
        for (const [i, j] of c.links) {
          const a = c.nodes[i];
          const b = c.nodes[j];
          ctx.beginPath();
          ctx.moveTo(a.x + px * 6, a.y + py * 6);
          ctx.lineTo(b.x + px * 6, b.y + py * 6);
          ctx.stroke();
        }
        // nodes
        for (const n of c.nodes) {
          const tw = motion ? 0.7 + Math.sin(ts * 0.9 + n.phase) * 0.3 : 1;
          const x = n.x + px * 6;
          const y = n.y + py * 6;
          const base = n.major ? 0.9 : 0.55;
          ctx.fillStyle = `rgba(205,226,255,${base * tw})`;
          ctx.beginPath();
          ctx.arc(x, y, n.major ? 1.8 : 1.2, 0, Math.PI * 2);
          ctx.fill();
          if (n.major) {
            ctx.fillStyle = `rgba(150,200,255,${0.12 * tw})`;
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    const render = (ts: number, motion: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      const px = eased.x;
      const py = eased.y;

      // starfield
      for (const s of stars) {
        if (motion) {
          s.x += s.vx;
          s.y += s.vy;
          if (s.x < 0) s.x = w;
          if (s.x > w) s.x = 0;
          if (s.y < 0) s.y = h;
          if (s.y > h) s.y = 0;
        }
        const twk = motion && s.tw > 0.1 ? 1 + Math.sin(ts * (0.5 + s.z) + s.phase) * s.tw : 1;
        const alpha = Math.max(0, Math.min(1, s.a * twk));
        const x = s.x + px * (2 + s.z * 16);
        const y = s.y + py * (2 + s.z * 16);
        ctx.fillStyle = s.violet
          ? `rgba(186,158,255,${alpha})`
          : `rgba(208,226,255,${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
        if (s.r > 1.5 && alpha > 0.45) {
          // soft halo
          ctx.fillStyle = s.violet
            ? `rgba(150,120,255,${alpha * 0.1})`
            : `rgba(150,200,255,${alpha * 0.1})`;
          ctx.beginPath();
          ctx.arc(x, y, s.r * 2.6, 0, Math.PI * 2);
          ctx.fill();
          // diffraction spikes on the brightest stars (astrophotography feel)
          const L = s.r * (3.2 + s.z * 3);
          ctx.strokeStyle = s.violet
            ? `rgba(180,150,255,${alpha * 0.5})`
            : `rgba(205,226,255,${alpha * 0.55})`;
          ctx.lineWidth = 0.75;
          ctx.beginPath();
          ctx.moveTo(x - L, y);
          ctx.lineTo(x + L, y);
          ctx.moveTo(x, y - L);
          ctx.lineTo(x, y + L);
          ctx.stroke();
        }
      }

      drawPlanetLimb();
      drawConstellations(ts, motion, px, py);
      drawHud();
      ctx.globalCompositeOperation = "source-over";
    };

    if (reduceMotion) {
      render(0, 0);
      const onResizeStatic = () => {
        build();
        render(0, 0);
      };
      window.removeEventListener("resize", onResize);
      window.addEventListener("resize", onResizeStatic);
      return () => window.removeEventListener("resize", onResizeStatic);
    }

    let shoot: { x: number; y: number; vx: number; vy: number; life: number; max: number; len: number } | null = null;
    let nextShootAt = 9000 + Math.random() * 9000;

    let raf = 0;
    let running = true;
    let last = performance.now();
    let elapsed = 0;

    const frame = (now: number) => {
      if (!running) return;
      const dt = Math.min(64, now - last);
      last = now;
      elapsed += dt;
      const ts = elapsed * 0.001;
      eased.x += (target.x - eased.x) * 0.045;
      eased.y += (target.y - eased.y) * 0.045;

      render(ts, 1);

      ctx.globalCompositeOperation = "lighter";
      if (!shoot && elapsed > nextShootAt) {
        const fromLeft = Math.random() < 0.5;
        const sxp = fromLeft ? Math.random() * 0.3 : 0.7 + Math.random() * 0.3;
        const speed = (w + h) * 0.0006;
        const dir = fromLeft ? 1 : -1;
        shoot = {
          x: sxp * w,
          y: Math.random() * h * 0.4,
          vx: dir * speed * (0.8 + Math.random() * 0.5),
          vy: speed * (0.5 + Math.random() * 0.4),
          life: 0,
          max: 850 + Math.random() * 500,
          len: 110 + Math.random() * 120,
        };
      }
      if (shoot) {
        shoot.life += dt;
        shoot.x += shoot.vx * dt;
        shoot.y += shoot.vy * dt;
        const sp = shoot.life / shoot.max;
        const fade = Math.sin(Math.PI * sp);
        const ang = Math.atan2(shoot.vy, shoot.vx);
        const tx = shoot.x - Math.cos(ang) * shoot.len;
        const ty = shoot.y - Math.sin(ang) * shoot.len;
        const grad = ctx.createLinearGradient(shoot.x, shoot.y, tx, ty);
        grad.addColorStop(0, `rgba(220,238,255,${0.9 * fade})`);
        grad.addColorStop(0.4, `rgba(120,180,255,${0.4 * fade})`);
        grad.addColorStop(1, "rgba(120,180,255,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(shoot.x, shoot.y);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        if (sp >= 1) {
          shoot = null;
          nextShootAt = elapsed + 11000 + Math.random() * 12000;
        }
      }
      ctx.globalCompositeOperation = "source-over";

      raf = requestAnimationFrame(frame);
    };

    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    raf = requestAnimationFrame(frame);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      clearTimeout(rt);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        background: "#04050d",
      }}
    >
      {/* Layer 1: near-black navy base, darkest through the centre */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(120% 100% at 50% 45%, #070b18 0%, #04060f 45%, #020308 100%)",
        }}
      />

      {/* Layer 2: bright BLUE nebula bottom-left (planet-limb glow) */}
      <div className="gb-glow gb-glow-blue" />
      {/* Layer 3: bright VIOLET nebula top-right */}
      <div className="gb-glow gb-glow-violet" />
      {/* Layer 4: faint magenta wisp low-centre */}
      <div className="gb-glow gb-glow-magenta" />

      {/* Layer 5: starfield + constellations + HUD + shooting star */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          mixBlendMode: "screen",
        }}
      />

      {/* Layer 6: centre-dim readability scrim */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 64% 52% at 50% 47%, rgba(2,3,8,0.72) 0%, rgba(2,3,8,0.34) 44%, rgba(2,3,8,0) 72%), " +
            "linear-gradient(to bottom, rgba(2,3,8,0.45) 0%, rgba(2,3,8,0) 22%, rgba(2,3,8,0) 100%)",
        }}
      />

      <style jsx>{`
        .gb-glow {
          position: absolute;
          border-radius: 50%;
          mix-blend-mode: screen;
          will-change: transform;
        }
        .gb-glow-blue {
          left: -16vmax;
          bottom: -14vmax;
          width: 66vmax;
          height: 66vmax;
          background:
            radial-gradient(circle at 40% 58%, rgba(185, 222, 255, 0.4) 0%, transparent 30%),
            radial-gradient(circle at 62% 38%, rgba(80, 170, 245, 0.3) 0%, transparent 38%),
            radial-gradient(
              circle,
              rgba(150, 205, 255, 0.5) 0%,
              rgba(50, 150, 240, 0.42) 26%,
              rgba(40, 110, 220, 0.18) 46%,
              transparent 64%
            );
          filter: blur(46px);
          animation: gbDrift1 70s ease-in-out infinite alternate;
        }
        .gb-glow-violet {
          right: -14vmax;
          top: -16vmax;
          width: 62vmax;
          height: 62vmax;
          background:
            radial-gradient(circle at 58% 44%, rgba(220, 175, 255, 0.4) 0%, transparent 30%),
            radial-gradient(circle at 38% 62%, rgba(150, 105, 245, 0.28) 0%, transparent 40%),
            radial-gradient(
              circle,
              rgba(190, 140, 255, 0.46) 0%,
              rgba(140, 95, 240, 0.4) 28%,
              rgba(110, 70, 210, 0.16) 48%,
              transparent 64%
            );
          filter: blur(52px);
          animation: gbDrift2 86s ease-in-out infinite alternate;
        }
        .gb-glow-magenta {
          bottom: -8vmax;
          left: 38%;
          width: 40vmax;
          height: 30vmax;
          background: radial-gradient(circle, rgba(210, 70, 190, 0.14), transparent 60%);
          filter: blur(64px);
          animation: gbDrift3 98s ease-in-out infinite alternate;
        }
        @keyframes gbDrift1 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(5vw, -4vh, 0) scale(1.08); }
        }
        @keyframes gbDrift2 {
          0% { transform: translate3d(0, 0, 0) scale(1.06); }
          100% { transform: translate3d(-5vw, 4vh, 0) scale(1); }
        }
        @keyframes gbDrift3 {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          100% { transform: translate3d(4vw, -5vh, 0) scale(1.16); }
        }
        @media (prefers-reduced-motion: reduce) {
          .gb-glow {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
