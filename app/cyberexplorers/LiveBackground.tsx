"use client";

/**
 * Live "cool techy" backdrop for the Cyber Explorers landing: a neon particle
 * network — glowing nodes drift, link up with light lines when they're near,
 * and lean gently toward the cursor so it feels alive. Additive ("lighter")
 * compositing gives the neon glow cheaply; no per-node shadowBlur.
 *
 * Performance-safe (the landing had a history of always-on bg loops hurting
 * paint): node count scales with viewport and is capped, DPR is clamped, the
 * rAF loop stops when the tab is hidden, and prefers-reduced-motion renders a
 * single static frame with no animation.
 *
 * Sits at z-index 0, pointer-events:none, behind the page content. The CSS
 * colour aurora stays underneath it and the vignette sits on top.
 */

import { useEffect, useRef } from "react";

const COLORS = [
  [52, 225, 255],   // arc cyan
  [185, 139, 255],  // violet
  [255, 92, 168],   // pink
  [126, 235, 255],  // ice
];

type Node = { x: number; y: number; vx: number; vy: number; r: number; c: number[] };

export default function LiveBackground({ reduced }: { reduced: boolean }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0;
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999, active: false };
    const LINK = 132;        // link distance
    const LINK2 = LINK * LINK;
    const MOUSE = 168;       // cursor reach
    const MOUSE2 = MOUSE * MOUSE;

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // ~1 node per 15k px², capped — light on the CPU, dense enough to link.
      const count = Math.max(28, Math.min(90, Math.round((w * h) / 15000)));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: 0.8 + Math.random() * 1.8,
        c: COLORS[(Math.random() * COLORS.length) | 0],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";

      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        // links to other nodes
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < LINK2) {
            const t = 1 - d2 / LINK2;
            ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${t * 0.34})`;
            ctx.lineWidth = t * 1.1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
        // link to cursor
        if (mouse.active) {
          const dx = a.x - mouse.x, dy = a.y - mouse.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE2) {
            const t = 1 - d2 / MOUSE2;
            ctx.strokeStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},${t * 0.5})`;
            ctx.lineWidth = t * 1.3;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
          }
        }
        // the node itself
        ctx.fillStyle = `rgba(${a.c[0]},${a.c[1]},${a.c[2]},0.9)`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    const step = () => {
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        // gentle drift toward the cursor — the "alive" feel
        if (mouse.active) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < MOUSE2 && d2 > 1) {
            const f = (1 - d2 / MOUSE2) * 0.04;
            n.vx += (dx / Math.sqrt(d2)) * f;
            n.vy += (dy / Math.sqrt(d2)) * f;
          }
        }
        // speed clamp so cursor pulls never run away
        n.vx = Math.max(-0.9, Math.min(0.9, n.vx * 0.995));
        n.vy = Math.max(-0.9, Math.min(0.9, n.vy * 0.995));
        // wrap around edges
        if (n.x < -20) n.x = w + 20; else if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; else if (n.y > h + 20) n.y = -20;
      }
      draw();
    };

    let raf = 0;
    const loop = () => { step(); raf = requestAnimationFrame(loop); };

    const onMove = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true; };
    const onLeave = () => { mouse.active = false; mouse.x = -9999; mouse.y = -9999; };
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf && !reduced) { raf = requestAnimationFrame(loop); }
    };
    let resizeT: ReturnType<typeof setTimeout>;
    const onResize = () => { clearTimeout(resizeT); resizeT = setTimeout(build, 150); };

    build();
    if (reduced) {
      draw(); // single static frame, no loop
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      raf = requestAnimationFrame(loop);
    }
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(resizeT);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
    />
  );
}
