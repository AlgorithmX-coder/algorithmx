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

import { useEffect, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
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
const STAGE_FIT_MIN = 0.55;
/**
 * Everything between the HUD and the board that `avail` cannot see.
 *
 * The fit sizes the content correctly - on Week 20's Ask the ring at 1093x525
 * it measured 445px, exactly 525 - 64 - 16 - and the POST IT button still
 * ended 11px under the fold. The content does not START at the HUD: the stage
 * centres it inside its own vertical padding, so it began at y=97 and ran on
 * to 541. A pad of 16 was breathing room UNDER the board; it was never the
 * ~33px the stage spends above it.
 *
 * 48 covers both. It only ever makes a board smaller, so it cannot push
 * anything off-screen, and it applies only below STAGE_FIT_HEIGHT - the
 * owner's 771px window and every signed-off screenshot are untouched.
 */
const STAGE_FIT_PAD = 24;

/**
 * Is the window too short for the layouts this course was drawn for?
 *
 * The fit can only scale a board down so far before the type stops being
 * readable by a six-year-old, and some boards are simply twice the height a
 * 1366x768 laptop at 125% scaling leaves (Week 2's Learn screens measure 923px
 * against 413px of room). Those boards have to lay themselves out differently,
 * not just smaller - so they ask this.
 *
 * Same threshold as the fit, so a window at or above it is untouched.
 */
export function useShortViewport(): boolean {
  const [short, setShort] = useState(false);
  useEffect(() => {
    const read = () => setShort(window.innerHeight < STAGE_FIT_HEIGHT);
    read();
    window.addEventListener("resize", read);
    return () => window.removeEventListener("resize", read);
  }, []);
  return short;
}

/**
 * Fit the stage to the content it actually holds.
 *
 * The first version assumed every board was about STAGE_FIT_HEIGHT tall and
 * scaled by viewport alone. Boards are not all that height: at 1093x525 the
 * Week 16 panes and the Week 17 draft still pushed their answer buttons below
 * the fold, because a fixed ratio cannot know a given board is 700px tall.
 * Measuring the content and dividing out the zoom already in force (the same
 * trick the intro card uses) fits each board on its own terms.
 *
 * Still a STRICT no-op at or above STAGE_FIT_HEIGHT, so every viewport the
 * course was signed off at renders byte-identically.
 */
export function useStageFit(ref: RefObject<HTMLDivElement | null>): number {
  const [fit, setFit] = useState(1);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let current = 1;
    const measure = () => {
      const h = window.innerHeight;
      if (h >= STAGE_FIT_HEIGHT) {
        if (current !== 1) { current = 1; setFit(1); }
        return;
      }
      // getBoundingClientRect reflects zoom, so divide it back out.
      const natural = el.getBoundingClientRect().height / current;
      const avail = h - LESSON_HUD_HEIGHT - STAGE_FIT_PAD;
      if (natural <= 0 || avail <= 0) return;
      const next = Math.max(STAGE_FIT_MIN, Math.min(1, avail / natural));
      if (Math.abs(next - current) < 0.01) return;
      current = next;
      setFit(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [ref]);
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
  const contentRef = useRef<HTMLDivElement | null>(null);
  const shortViewport = useShortViewport();
  const fit = useStageFit(contentRef);
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
        // On a short window that vertical clamp resolves to ~33px top AND
        // bottom - 66px of the ~460px a 1366x768 laptop at 125% leaves, spent
        // on air above and below a board that already does not fit. Reclaimed
        // first, because losing padding costs nothing and shrinking the type
        // costs a six-year-old their reading.
        padding: shortViewport
          ? "8px clamp(12px, 3vw, 24px)"
          : "clamp(16px, 3vw, 40px) clamp(12px, 3vw, 24px)",
        paddingBottom: shortViewport
          ? "max(8px, calc(env(safe-area-inset-bottom, 0px) + 6px))"
          : "max(clamp(16px, 3vw, 40px), calc(env(safe-area-inset-bottom, 0px) + 16px))",
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
        ref={contentRef}
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
