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
      {children}
    </div>
  );
}
