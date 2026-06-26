"use client";

/**
 * Shared chrome for every exercise.
 *
 * Replaces the duplicated outer wrapper styling currently inlined in
 * CyberScanner, SpamBlaster, CyberMaze, WeakSorter, ChooseYourPath,
 * CrackTheCode, MemoryMatch (~9 near-identical blocks of styling).
 * Each of those exercises will migrate to wrap its contents in
 * <ExerciseFrame> + props.
 *
 * Responsibilities:
 *   - Rounded card chrome with the cosmic gradient backdrop
 *   - Centered, viewport-safe max-width (defers to the wrapping
 *     LessonStage for height; this just caps width)
 *   - Optional aspect-ratio cap for canvas-style exercises that need
 *     to shrink horizontally on short viewports
 *   - Optional title + ExerciseHowTo-style chip row (shown on first
 *     mount, can be skipped via showHowTo=false)
 *   - Standard overflow:hidden so decorative glows clip cleanly to
 *     the rounded corners
 *   - position: relative so overlays (WrongAnswerPanel, intro,
 *     finish) absolutely-position from the frame
 *
 * Does NOT impose:
 *   - The internal flow (canvas vs DOM is the exercise's choice)
 *   - The pointer handlers
 *   - The feedback panels (those are the exercise's job to mount)
 *
 * Intent: any new exercise (Password Hospital, Phish Inspector, etc.)
 * should reach commercial-quality chrome by default just by wrapping
 * its body in <ExerciseFrame>.
 */

import type { ReactNode, CSSProperties } from "react";

export interface ExerciseFrameProps {
  /**
   * Optional natural cap (px). Default 1400. Combined with the
   * aspect-ratio cap (if provided) the frame width is
   * `min(natural, calc((100dvh - reserve) * aspectW / aspectH))`.
   */
  maxWidth?: number;
  /**
   * If set, derives a height-bound max-width using the canvas-style
   * aspect ratio + reserve, identical to the pattern used in
   * CyberScanner/SpamBlaster/CyberMaze. Use for any exercise whose
   * inner content is a fixed-aspect canvas or scene.
   *
   * Example: aspectRatio={{ w: 720, h: 340 }}, reserve={280}
   *  → maxWidth: "min(1400px, calc((100dvh - 280px) * 720 / 340))"
   */
  aspectRatio?: { w: number; h: number };
  /**
   * Vertical reserve (px) used when computing the aspect-ratio
   * max-width. Should account for HUD (64) + safe-area-bottom + any
   * chrome inside the frame (intro/buttons/hints). Default 240.
   */
  reserve?: number;
  /**
   * Background gradient. Default is the cosmic deep-navy used by the
   * existing exercises. Pass null to inherit from the LessonStage.
   */
  background?: string | null;
  /**
   * Padding inside the frame. Default 0 (canvas-style exercises set
   * their own internal padding). DOM exercises typically want 24.
   */
  padding?: number | string;
  /**
   * Subtle "command-center" depth layer painted BEHIND the content
   * (faint cyber grid + corner light-glows + top sheen) so plain DOM
   * boards don't read as a flat gradient. Default true. Set false for
   * exercises that already ship their own rich scene backdrop (e.g.
   * ChooseYourPath) so the grid doesn't fight their art.
   */
  decor?: boolean;
  /**
   * Adds `touchAction: "none"` to the frame (canvas/game exercises
   * generally want this to suppress browser scroll on swipe).
   * Default false.
   */
  touchActionNone?: boolean;
  /** Custom style override (merged last). */
  style?: CSSProperties;
  children: ReactNode;
}

const COSMIC_BG =
  "linear-gradient(180deg, #0f1530 0%, #1a2147 55%, #252d5e 100%)";
const COSMIC_SHADOW =
  "0 40px 90px -30px rgba(8, 10, 22, 0.55), 0 0 0 1px rgba(125, 240, 255, 0.18) inset";

export default function ExerciseFrame({
  maxWidth = 1400,
  aspectRatio,
  reserve = 240,
  background = COSMIC_BG,
  padding = 0,
  touchActionNone = false,
  decor = true,
  style,
  children,
}: ExerciseFrameProps) {
  // Width math: capped both by `maxWidth` and (optionally) by the
  // viewport-height-derived value so canvas-style exercises shrink
  // horizontally on short viewports rather than overflowing.
  const widthCss = aspectRatio
    ? `min(${maxWidth}px, calc((100dvh - ${reserve}px) * ${aspectRatio.w} / ${aspectRatio.h}))`
    : `min(${maxWidth}px, 100%)`;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: widthCss,
        margin: "0 auto",
        padding,
        // Floor so the frame can never collapse to padding-only height. An
        // absolutely-positioned overlay (intro / complete beat) adds no flow
        // height, so without this floor the frame shrinks and overflow:hidden
        // clips the centered overlay's title. Only kicks in when content is
        // shorter than this; real exercises are taller and unaffected.
        minHeight: 420,
        borderRadius: 28,
        overflow: "hidden",
        background: background ?? undefined,
        boxShadow: background ? COSMIC_SHADOW : undefined,
        touchAction: touchActionNone ? "none" : undefined,
        color: "#e7ecff",
        fontFamily:
          "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
        ...style,
      }}
    >
      {decor && background && <FrameDecor />}
      {children}
    </div>
  );
}

/*
 * Depth layer. Sits at z-index:-1 so it paints above the frame's own
 * gradient background but below ALL content (positioned or not), which
 * keeps gameplay perfectly legible while giving the board a lit
 * "command-center" feel instead of a flat wash. Deliberately subtle —
 * the brief is "richer, not busier / not overstimulating".
 */
function FrameDecor() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        borderRadius: "inherit",
        overflow: "hidden",
      }}
    >
      {/* faint cyber grid, masked to fade out toward the edges */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(0,229,255,0.05) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(0,229,255,0.05) 1px, transparent 1px)",
          backgroundSize: "46px 46px",
          maskImage:
            "radial-gradient(ellipse at 50% 38%, #000 50%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 50% 38%, #000 50%, transparent 100%)",
        }}
      />
      {/* soft corner light-glows for depth */}
      <div
        style={{
          position: "absolute",
          top: "-12%",
          left: "-8%",
          width: 360,
          height: 360,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,229,255,0.16) 0%, transparent 70%)",
          filter: "blur(22px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-14%",
          right: "-8%",
          width: 420,
          height: 420,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,92,255,0.15) 0%, transparent 70%)",
          filter: "blur(24px)",
        }}
      />
      {/* top sheen so the frame reads as a lit glass surface */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 130,
          background: "linear-gradient(180deg, rgba(255,255,255,0.05), transparent)",
        }}
      />
      {/* command-center corner brackets — "framing" that reads as an
          intentional HUD surface rather than a plain card edge */}
      {([
        { top: 14, left: 14, bt: true, bl: true },
        { top: 14, right: 14, bt: true, br: true },
        { bottom: 14, left: 14, bb: true, bl: true },
        { bottom: 14, right: 14, bb: true, br: true },
      ] as Array<{
        top?: number;
        bottom?: number;
        left?: number;
        right?: number;
        bt?: boolean;
        bb?: boolean;
        bl?: boolean;
        br?: boolean;
      }>).map((c, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            top: c.top,
            bottom: c.bottom,
            left: c.left,
            right: c.right,
            width: 20,
            height: 20,
            borderTop: c.bt ? "2px solid rgba(125,240,255,0.32)" : undefined,
            borderBottom: c.bb ? "2px solid rgba(125,240,255,0.32)" : undefined,
            borderLeft: c.bl ? "2px solid rgba(125,240,255,0.32)" : undefined,
            borderRight: c.br ? "2px solid rgba(125,240,255,0.32)" : undefined,
            borderTopLeftRadius: c.bt && c.bl ? 8 : undefined,
            borderTopRightRadius: c.bt && c.br ? 8 : undefined,
            borderBottomLeftRadius: c.bb && c.bl ? 8 : undefined,
            borderBottomRightRadius: c.bb && c.br ? 8 : undefined,
          }}
        />
      ))}
    </div>
  );
}
