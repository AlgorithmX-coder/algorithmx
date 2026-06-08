"use client";

import { useEffect, useRef } from "react";
import { useMotionValueEvent, type MotionValue } from "framer-motion";

/**
 * HeroScrubSequence — scroll-scrubbed playback of the pre-rendered hero
 * cinematic (public/hero-seq/frame-NNN.webp). Used in place of the live
 * WebGL LaptopScene on integrated GPUs (and prefers-reduced-motion), where
 * the real-time scene can't hold a smooth framerate.
 *
 * Why this is smooth everywhere: playback is just decoding a WebP once and
 * blitting it to a 2D canvas as scroll advances — no per-frame 3D render,
 * no ambient occlusion, no bloom. It's the same technique Apple uses for
 * scroll-driven product reveals.
 *
 * The frames were captured at the same camera/scene as the live hero, with
 * an alpha background, so this layers over GlobalBackdrop and sits under the
 * same top-shade / bottom-mask / vignette overlays as the live canvas —
 * visually identical, just pre-baked.
 */

const FRAME_COUNT = 60;
const frameSrc = (i: number) =>
  `/hero-seq/frame-${String(i).padStart(3, "0")}.webp`;

function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cw: number,
  ch: number,
) {
  const ir = img.width / img.height;
  const cr = cw / ch;
  let dw: number, dh: number, dx: number, dy: number;
  if (cr > ir) {
    // canvas wider than image → match width, crop top/bottom
    dw = cw;
    dh = cw / ir;
    dx = 0;
    dy = (ch - dh) / 2;
  } else {
    dh = ch;
    dw = ch * ir;
    dy = 0;
    dx = (cw - dw) / 2;
  }
  ctx.clearRect(0, 0, cw, ch);
  ctx.drawImage(img, dx, dy, dw, dh);
}

export default function HeroScrubSequence({
  progress,
}: {
  progress: MotionValue<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const loadedRef = useRef<boolean[]>([]);
  const lastDrawn = useRef(-1);

  const draw = (idx: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Fall back to the nearest already-loaded frame so scrubbing never
    // blanks while later frames are still streaming in.
    let i = idx;
    if (!loadedRef.current[i]) {
      let lo = i,
        hi = i;
      while (lo >= 0 || hi < FRAME_COUNT) {
        if (lo >= 0 && loadedRef.current[lo]) {
          i = lo;
          break;
        }
        if (hi < FRAME_COUNT && loadedRef.current[hi]) {
          i = hi;
          break;
        }
        lo--;
        hi++;
      }
      if (!loadedRef.current[i]) return;
    }
    const img = imagesRef.current[i];
    const ctx = canvas.getContext("2d");
    if (!ctx || !img) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
    drawCover(ctx, img, canvas.width, canvas.height);
    lastDrawn.current = idx;
  };

  const update = (p: number) => {
    const idx = Math.max(
      0,
      Math.min(FRAME_COUNT - 1, Math.round(p * (FRAME_COUNT - 1))),
    );
    if (idx !== lastDrawn.current) draw(idx);
  };

  // Preload all frames; draw frame 0 as soon as it lands, and (re)draw the
  // current scroll frame whenever a newly-loaded image is the one we want.
  useEffect(() => {
    const imgs: HTMLImageElement[] = [];
    const loaded: boolean[] = new Array(FRAME_COUNT).fill(false);
    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        loaded[i] = true;
        const want = Math.round(
          progress.get() * (FRAME_COUNT - 1),
        );
        if (i === want || lastDrawn.current === -1) {
          lastDrawn.current = -1;
          update(progress.get());
        }
      };
      img.src = frameSrc(i);
      imgs[i] = img;
    }
    imagesRef.current = imgs;
    loadedRef.current = loaded;
    update(progress.get());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useMotionValueEvent(progress, "change", update);

  useEffect(() => {
    const onResize = () => {
      lastDrawn.current = -1;
      update(progress.get());
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}
