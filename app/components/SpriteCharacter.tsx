"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

/**
 * SpriteCharacter — plays a PNG sprite-sheet animation produced by
 * Cartoon Animator 5 (or any other tool that outputs an image sequence).
 *
 * The expected asset shape is a single PNG with N frames laid out in
 * a horizontal strip OR a grid. The metadata (frame count, frame
 * dimensions, fps) is passed via props so the component knows how to
 * step through it.
 *
 * Why not Lottie?  Lottie playback is fine when the source IS Lottie.
 * Cartoon Animator 5's primary export is a sprite sheet, and converting
 * sprite sheet → Lottie loses fidelity. Better to play sprite sheets
 * natively.
 *
 * Why not <video>?  PNG sprite sheets have transparency support
 * everywhere, no codec-decode cost, and you can pause/loop/scrub
 * without a video element. For 12-24 frame loops they're the simplest
 * format.
 *
 * Usage:
 *   <SpriteCharacter
 *     src="/sprites/adam-idle.png"
 *     frameWidth={400}
 *     frameHeight={500}
 *     frameCount={24}
 *     fps={24}
 *     loop
 *   />
 */

export interface SpriteCharacterProps {
  /** Path to the sprite-sheet PNG. */
  src: string;
  /** Width of one frame in pixels (the image is sliced into these). */
  frameWidth: number;
  /** Height of one frame in pixels. */
  frameHeight: number;
  /** Total number of frames in the sheet. */
  frameCount: number;
  /** Frames laid out in a grid? Default: 1 row, all horizontal. */
  framesPerRow?: number;
  /** Frames per second of playback. Default 24. */
  fps?: number;
  /** Loop back to frame 0 when reaching the last frame. Default true. */
  loop?: boolean;
  /** Auto-play on mount. Default true. */
  autoplay?: boolean;
  /** Display size — defaults to frame native size. Aspect ratio is preserved. */
  width?: number | string;
  height?: number | string;
  /** Force re-mount + restart from frame 0 when this number changes. */
  play?: number;
  className?: string;
  style?: CSSProperties;
  /** Fires once when the last frame is shown (only meaningful if loop=false). */
  onComplete?: () => void;
  /** Click handler — sprite is rendered to a div, so wire here for taps. */
  onClick?: () => void;
}

export default function SpriteCharacter({
  src,
  frameWidth,
  frameHeight,
  frameCount,
  framesPerRow,
  fps = 24,
  loop = true,
  autoplay = true,
  width,
  height,
  play = 0,
  className,
  style,
  onComplete,
  onClick,
}: SpriteCharacterProps) {
  const [frame, setFrame] = useState(0);
  const lastTickRef = useRef<number>(0);
  const completedRef = useRef(false);

  // Restart on play key change.
  useEffect(() => {
    setFrame(0);
    completedRef.current = false;
  }, [play, src]);

  useEffect(() => {
    if (!autoplay) return;
    const frameMs = 1000 / fps;
    let raf = 0;
    const step = (now: number) => {
      if (lastTickRef.current === 0) lastTickRef.current = now;
      const elapsed = now - lastTickRef.current;
      if (elapsed >= frameMs) {
        lastTickRef.current = now - (elapsed % frameMs);
        setFrame((f) => {
          const next = f + 1;
          if (next >= frameCount) {
            if (loop) return 0;
            if (!completedRef.current) {
              completedRef.current = true;
              onComplete?.();
            }
            return frameCount - 1;
          }
          return next;
        });
      }
      raf = window.requestAnimationFrame(step);
    };
    raf = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(raf);
  }, [autoplay, fps, frameCount, loop, onComplete]);

  // Compute background-position for the current frame.
  const cols = framesPerRow ?? frameCount;
  const col = frame % cols;
  const row = Math.floor(frame / cols);
  const bgX = -col * frameWidth;
  const bgY = -row * frameHeight;

  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        width: width ?? frameWidth,
        height: height ?? frameHeight,
        backgroundImage: `url(${src})`,
        backgroundPosition: `${bgX}px ${bgY}px`,
        backgroundRepeat: "no-repeat",
        // Crisp pixels — sprite-sheet kids' content rarely benefits from
        // bilinear smoothing.
        imageRendering: "auto",
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
    />
  );
}
