"use client";

import {
  Component,
  type CSSProperties,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

/**
 * LottieScene - drop-in wrapper for any Lottie or dotLottie animation.
 *
 * Pattern matches RiveScene: pass a `src` (URL or `/public/...` path),
 * choose loop / autoplay / speed, get a graceful fallback when the
 * file is missing or fails. Use this for celebrations, badge
 * animations, character reactions, scene transitions - anywhere you'd
 * have asked Framer Motion to animate a static PNG and felt the
 * limitations.
 *
 * The `controlPlay` prop turns it into a one-shot trigger:
 *   <LottieScene src="..." play={triggerKey} />
 * Each time `play` changes, the animation restarts from frame 0.
 *
 * Lottie files come from LottieFiles.com (subscribe → search → download
 * .lottie or .json → drop in /public/lottie/). The wrapper accepts both
 * formats. Prefer .lottie (binary, ~70% smaller than .json).
 */

export interface LottieSceneProps {
  /** Path to a .lottie or .json file. Use /public/lottie/<name>.lottie. */
  src: string;
  width?: number | string;
  height?: number | string;
  /** Loop the animation forever. Default true (good for idles, ambience). */
  loop?: boolean;
  /** Auto-start on mount. Default true. */
  autoplay?: boolean;
  /** Playback speed multiplier (1 = normal, 0.5 = half, 2 = double). */
  speed?: number;
  /** Re-render trigger. Each time this number changes, restart the animation. */
  play?: number;
  className?: string;
  style?: CSSProperties;
  /** Rendered when the .lottie fails to load (404, parse error, etc.). */
  fallback?: ReactNode;
  /** Forwarded onClick - Lottie renders to a canvas, so wire here for taps. */
  onClick?: () => void;
}

/* ─── Error boundary ──────────────────────────────────────────── */
class LottieErrorBoundary extends Component<
  { onError: () => void; children: ReactNode; fallbackNode: ReactNode },
  { hasError: boolean }
> {
  constructor(props: {
    onError: () => void;
    children: ReactNode;
    fallbackNode: ReactNode;
  }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    if (this.state.hasError) return this.props.fallbackNode;
    return this.props.children;
  }
}

/* ─── Inner - DotLottieReact handles both .lottie and .json ─── */
function LottieSceneInner({
  src,
  width,
  height,
  loop,
  autoplay,
  speed,
  play,
  className,
  style,
  onClick,
  onFail,
}: Omit<LottieSceneProps, "fallback"> & { onFail: () => void }) {
  // Force a remount whenever `play` changes so the animation restarts.
  const remountKey = play ?? 0;

  // dotLottie's react binding routes error/load events through the ref
  // callback rather than props. We hook addEventListener once the
  // instance is ready and translate "loadError" / "error" to onFail.
  return (
    <div
      key={remountKey}
      className={className}
      style={{
        width,
        height,
        cursor: onClick ? "pointer" : undefined,
        display: "inline-block",
        lineHeight: 0,
        ...style,
      }}
      onClick={onClick}
    >
      <DotLottieReact
        src={src}
        loop={loop ?? true}
        autoplay={autoplay ?? true}
        speed={speed ?? 1}
        style={{ width: "100%", height: "100%" }}
        dotLottieRefCallback={(instance) => {
          if (!instance) return;
          // Older + newer event names differ slightly across versions.
          // Listen on both so we don't have to pin to a specific dotLottie release.
          const handle = () => onFail();
          (instance as unknown as {
            addEventListener?: (e: string, h: () => void) => void;
          }).addEventListener?.("loadError", handle);
          (instance as unknown as {
            addEventListener?: (e: string, h: () => void) => void;
          }).addEventListener?.("error", handle);
        }}
      />
    </div>
  );
}

/* ─── Public component ───────────────────────────────────────── */
export default function LottieScene(props: LottieSceneProps) {
  const [failed, setFailed] = useState(false);
  // Reset failed state if src changes - give the new file a chance.
  useEffect(() => {
    setFailed(false);
  }, [props.src]);

  const handleFail = () => {
    if (!failed) {
      // eslint-disable-next-line no-console
      console.warn(
        `[LottieScene] failed to load "${props.src}" - showing fallback. ` +
          `Drop the file in /public/lottie/ or check the URL.`,
      );
      setFailed(true);
    }
  };

  const fallbackNode = props.fallback ?? (
    <div
      aria-label="Animation"
      style={{
        width: props.width ?? 200,
        height: props.height ?? 200,
        borderRadius: 14,
        background:
          "linear-gradient(135deg, rgba(124, 92, 255, 0.18), rgba(0, 229, 255, 0.12))",
        border: "1px dashed rgba(125, 240, 255, 0.45)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#7df0ff",
        fontFamily: "ui-monospace, 'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: 1.5,
        textTransform: "uppercase",
        ...(props.style ?? {}),
      }}
      className={props.className}
    >
      Lottie
    </div>
  );

  if (failed) return <>{fallbackNode}</>;

  return (
    <LottieErrorBoundary onError={handleFail} fallbackNode={fallbackNode}>
      <LottieSceneInner {...props} onFail={handleFail} />
    </LottieErrorBoundary>
  );
}
