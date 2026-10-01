"use client";

/**
 * Shared lesson screen wrapper.
 *
 * Every lesson screen (info, mission, video, exercise, completion,
 * boss intro/result) wraps its content in <LessonStage>. The wrapper
 * solves the "exercise clipped at top/bottom" bug by:
 *
 *   1. Sizing to 100dvh - HUD - safe-area, not raw 100vh. Mobile
 *      browsers shrink 100dvh when the toolbar is visible so content
 *      doesn't hide under it.
 *   2. Reserving a 64px gap at the top for the fixed HUD (and any
 *      future overlays added there).
 *   3. Honouring iOS safe-area-inset at the bottom for phones with a
 *      home indicator.
 *   4. Allowing internal scroll as a fallback when the playable
 *      content genuinely cannot fit (rare, but better than clipping).
 *   5. Capping max-width to 900px so desktop stays cinematic, but
 *      letting it stretch to viewport edge minus a small inset on
 *      mobile where every pixel of width matters.
 *
 * The decorative glow remains; everything else flows naturally inside.
 */

import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { useLessonTheme } from "./LessonThemeContext";

/**
 * Constant the rest of the lesson layout reads. Kept in one place so a
 * future HUD-height change (e.g. 72px on tablet) is a one-line edit.
 */
export const LESSON_HUD_HEIGHT = 64;

/**
 * Short-viewport fit (UAT retest W6 2d/4a, W10 5a, W5 2b: "frame too small,"
 * buttons under the fold, the Listening pill landing on the board).
 *
 * Every board was laid out for the owner's 771px-tall window. Abdullah tests on
 * a 1366x768 laptop at 125% scaling, which leaves 525px, and there the same
 * boards ran under the fold with the pill sitting on top of them. Below
 * STAGE_FIT_HEIGHT the stage content is zoomed down so it lays out as it does
 * on a tall window; at or above it this is a strict no-op, so nothing changes
 * on any viewport where the course was signed off.
 *
 * `zoom` rather than transform: it participates in layout, so nothing leaves a
 * gap or a scrollbar behind (the intro card already fits itself this way).
 * The factor is published as --stage-zoom so fixed overlays inside the stage
 * can undo it for viewport-sized reserves (see ExerciseBeats).
 */
export const STAGE_FIT_HEIGHT = 640;
const STAGE_FIT_MIN = 0.72;

export function useStageFit(): number {
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const measure = () => {
      const h = window.innerHeight;
      const next =
        h >= STAGE_FIT_HEIGHT
          ? 1
          : Math.max(
              STAGE_FIT_MIN,
              (h - LESSON_HUD_HEIGHT) / (STAGE_FIT_HEIGHT - LESSON_HUD_HEIGHT)
            );
      setFit((cur) => (Math.abs(cur - next) < 0.005 ? cur : next));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  return fit;
}

/**
 * The amount of available vertical space inside a LessonStage, in CSS.
 * Useful for canvas exercises that want to scale their max-height by
 * available room. Returns a CSS calc() string suitable for inline
 * `maxHeight` / `maxWidth` use.
 *
 * The bottom reserve covers iOS home indicator + a small breathing
 * pad. The internal-padding reserve covers LessonStage's own padding
 * so the consumer doesn't need to subtract twice.
 *
 * Example:
 *   maxHeight: lessonAvailableHeight(220)
 *   maxWidth: "min(760px, calc(" + lessonAvailableHeight(220) + " * 720 / 340))"
 */
export function lessonAvailableHeight(reservePx: number = 0): string {
  // dvh = dynamic viewport height; reflows correctly as mobile
  // toolbars collapse. Falls back gracefully on older browsers.
  return `calc(100dvh - ${LESSON_HUD_HEIGHT + reservePx}px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px))`;
}

export interface LessonStageProps {
  bg?: string;
  glow?: string;
  /**
   * When true the stage allows vertical scrolling if content exceeds
   * the visible height. Default true - the alternative is clipping,
   * which we explicitly want to avoid for accessibility.
   */
  scrollable?: boolean;
  /**
   * Override the max-width of the inner content area. Default 1500px.
   * Non-exercise screens (info, mission, completion) use their own
   * inner Card widths so this cap doesn't shrink them; it exists to
   * stop canvas exercises from spanning the full width of a 4K
   * monitor, which would distort the cinematic centring.
   */
  maxWidth?: number;
  children: ReactNode;
}

export default function LessonStage({
  bg,
  glow,
  scrollable = true,
  maxWidth = 1500,
  children,
}: LessonStageProps) {
  // A themed week overrides the per-screen gradient with its own world bg/glow;
  // an un-themed week (theme === null) keeps the exact per-screen values passed.
  const theme = useLessonTheme();
  const bgValue = theme?.bgGradient ?? bg ?? "linear-gradient(180deg, #0a0a1a 0%, #1a1033 100%)";
  const glowValue = theme?.glow ?? glow;
  const fit = useStageFit();
  const fitStyle: CSSProperties =
    fit < 1
      ? ({ zoom: fit, "--stage-zoom": String(fit) } as CSSProperties)
      : {};
  return (
    <div
      style={{
        // 100dvh is the visible viewport height even when the mobile
        // toolbar collapses. minHeight (not height) so content can
        // grow naturally; the scroll fallback handles the rest.
        minHeight: `calc(100dvh - ${LESSON_HUD_HEIGHT}px)`,
        background: bgValue,
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        // Horizontal padding clamps from 12-24px depending on viewport.
        // Vertical padding includes safe-area-inset-bottom for iOS home
        // indicator. clamp() prevents 40px padding eating the whole
        // screen on a tiny phone.
        padding: "clamp(16px, 3vw, 40px) clamp(12px, 3vw, 24px)",
        paddingBottom:
          "max(clamp(16px, 3vw, 40px), calc(env(safe-area-inset-bottom, 0px) + 16px))",
        // Allow internal scroll as a fallback. Better than clipping.
        // overflowX:hidden keeps decorative glows from forcing a
        // horizontal scrollbar.
        overflowY: scrollable ? "auto" : "hidden",
        overflowX: "hidden",
        // Soften the touch-scroll on iOS.
        WebkitOverflowScrolling: "touch",
      }}
    >
      {glowValue && (
        <div
          key={glowValue}
          aria-hidden
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: glowValue,
            filter: "blur(120px)",
            opacity: 0.3,
            pointerEvents: "none",
            animation: "fullSceneGlowIn 420ms ease-out both",
            willChange: "opacity",
          }}
        />
      )}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          width: "100%",
          maxWidth,
          ...fitStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
}
