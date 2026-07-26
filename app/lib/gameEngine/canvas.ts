/**
 * Hi-DPI canvas helper.
 *
 * The canvas-based exercises (CyberScanner, SpamBlaster, CyberMaze, etc.)
 * previously set `canvas.width = LOGICAL_W` and styled the canvas to
 * `width: 100%`, which causes blurry rendering on Retina / 2x / 3x
 * displays because the browser scales the bitmap up.
 *
 * This helper sizes the canvas BUFFER to logicalW * dpr and scales the
 * 2D context once so all subsequent draw calls can be written in
 * logical pixels. The CSS size of the canvas is kept in logical pixels
 * via `style.width / style.height`, so the layout doesn't change.
 *
 * `maxDpr` caps the effective device pixel ratio - high-DPR mobile
 * displays often report 3x but we don't need 3x for kid's game UI;
 * 2x is the sweet spot. Capping also limits the cost of redraws on
 * lower-end devices.
 */

export interface HiDpiCanvasSetup {
  /** 2D context, already scaled by dpr so drawing uses logical pixels. */
  ctx: CanvasRenderingContext2D;
  /** Effective dpr applied (post-cap). */
  dpr: number;
  /** Logical width and height passed in. */
  logicalWidth: number;
  logicalHeight: number;
}

export interface HiDpiOptions {
  logicalWidth: number;
  logicalHeight: number;
  /** Hard cap on effective device pixel ratio. Default 2. */
  maxDpr?: number;
  /**
   * If true, set explicit CSS pixel sizes on the canvas element. If the
   * canvas already has CSS `width: 100%` set in JSX, leave this false
   * so we don't fight the parent layout. Default false.
   */
  setCssSize?: boolean;
}

export function setupHiDpiCanvas(
  canvas: HTMLCanvasElement,
  opts: HiDpiOptions
): HiDpiCanvasSetup | null {
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return null;

  const { logicalWidth, logicalHeight, maxDpr = 2, setCssSize = false } = opts;
  const dpr = Math.min(
    Math.max(1, typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1),
    maxDpr
  );

  // Render at the canvas's DISPLAYED size, not just its logical size. A game
  // authored in e.g. a 720-wide coordinate space is shown in a slot up to
  // ~1400px wide (see ExerciseFrame), so sizing the buffer to logicalWidth*dpr
  // made the browser upscale a 720px bitmap — the "not HD" blur. Instead we
  // size the buffer to the on-screen CSS width * dpr and fold the
  // display/logical ratio into the context scale, so every existing draw call
  // (and the CANVAS_W / rect.width pointer math) keeps working in logical
  // units while the buffer has real pixels to stay crisp.
  const rect = canvas.getBoundingClientRect();
  const cssWidth = rect.width > 0 ? rect.width : logicalWidth;
  // Cap the buffer so ultra-wide / high-dpi combos can't create huge buffers;
  // 2600px keeps a ~1400px slot crisp even at 2x. The Math.max floor means we
  // never render BELOW the old logicalWidth*dpr resolution, so this can only
  // sharpen, never soften, whatever the display.
  const MAX_BUFFER_WIDTH = 2600;
  const targetBufferWidth = Math.min(cssWidth * dpr, MAX_BUFFER_WIDTH);
  const scale = Math.max(dpr, targetBufferWidth / logicalWidth);

  canvas.width = Math.round(logicalWidth * scale);
  canvas.height = Math.round(logicalHeight * scale);
  if (setCssSize) {
    canvas.style.width = `${logicalWidth}px`;
    canvas.style.height = `${logicalHeight}px`;
  }

  // Reset any prior scale before applying the new one. A canvas resize
  // implicitly resets the transform, but we call this explicitly so the
  // helper can be called more than once on the same canvas.
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(scale, scale);

  // Common defaults that make typography and shapes crisp.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if ("textRendering" in ctx) {
    // textRendering is a newer spec property; safe to assign if present.
    (ctx as CanvasRenderingContext2D & { textRendering?: string }).textRendering = "optimizeLegibility";
  }

  return { ctx, dpr, logicalWidth, logicalHeight };
}

/**
 * Translate a pointer event into the canvas's LOGICAL coordinate space,
 * accounting for the fact that the canvas may be displayed at a size
 * different from its logical resolution (e.g. `width: 100%`).
 */
export function getPointerLogicalPos(
  canvas: HTMLCanvasElement,
  e: { clientX: number; clientY: number },
  logicalWidth: number,
  logicalHeight: number
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return { x: 0, y: 0 };
  const sx = logicalWidth / rect.width;
  const sy = logicalHeight / rect.height;
  return {
    x: (e.clientX - rect.left) * sx,
    y: (e.clientY - rect.top) * sy,
  };
}
