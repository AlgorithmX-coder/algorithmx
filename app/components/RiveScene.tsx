"use client";

import {
  Component,
  CSSProperties,
  ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Fit,
  Layout,
  useRive,
  useStateMachineInput,
} from "@rive-app/react-canvas";

/**
 * RiveScene — the general-purpose Rive wrapper for in-lesson content.
 *
 * Wraps `useRive` with three things every lesson screen needs:
 *
 *   1. A graceful fallback when the .riv file is missing or fails to
 *      load (so the page never blanks while the animator is mid-build).
 *   2. A typed `inputs` map: pass `{ isFlipped: true, isMatched: false }`
 *      and the matching state-machine inputs are written each render.
 *      Booleans + numbers supported; one-shot triggers go via `triggers`.
 *   3. A typed `triggers` array: pass `["wrongShake"]` once and the
 *      named trigger fires.  Use a short-lived state from the parent
 *      (e.g. `mismatched` set true for one render) to fire it cleanly.
 *
 * Usage:
 *
 *   <RiveScene
 *     src="/rive/memory-card.riv"
 *     stateMachine="Card"
 *     width={180}
 *     height={240}
 *     inputs={{ isFlipped, isMatched }}
 *     triggers={mismatched ? ["wrongShake"] : []}
 *     onClick={onFlip}
 *     fallback={<CardSkeleton />}
 *   />
 *
 * Replace the fallback prop with anything (a static image, a CSS card)
 * so the lesson stays usable even before the .riv file lands.
 */

export type RiveInputValue = boolean | number;
export type RiveSceneInputs = Record<string, RiveInputValue>;

interface RiveSceneProps {
  /** Path under /public, e.g. `/rive/memory-card.riv`, or full URL. */
  src: string;
  /** Name of the state machine the animator wired up in Rive. */
  stateMachine: string;
  /** Pixels.  Rive scales the vector art inside this box. */
  width?: number | string;
  height?: number | string;
  /** Boolean / number inputs written every render. */
  inputs?: RiveSceneInputs;
  /** One-shot triggers — fired once per render where the name appears. */
  triggers?: readonly string[];
  /** How the art fits the box. Default: `contain` so nothing crops. */
  fit?: Fit;
  /** Forwarded onClick — Rive renders to a canvas, so wire here for taps. */
  onClick?: () => void;
  /** Class on the canvas wrapper. */
  className?: string;
  /** Inline style on the canvas wrapper. */
  style?: CSSProperties;
  /** Rendered when the .riv fails to load. Shows the user something. */
  fallback?: ReactNode;
  /** Called once when the .riv finishes loading. */
  onLoad?: () => void;
}

/* ─── error boundary ──────────────────────────────────────────────── */
class RiveErrorBoundary extends Component<
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

/* ─── inner: hooks here so they unmount cleanly on error ─────────── */
function RiveSceneInner({
  src,
  stateMachine,
  width,
  height,
  inputs,
  triggers,
  fit,
  onClick,
  className,
  style,
  onFail,
  onLoad,
}: Omit<RiveSceneProps, "fallback"> & { onFail: () => void }) {
  const { rive, RiveComponent } = useRive({
    src,
    stateMachines: stateMachine,
    autoplay: true,
    layout: new Layout({ fit: fit ?? Fit.Contain }),
    onLoadError: () => onFail(),
    onLoad: () => onLoad?.(),
  });

  // Stable list of input names so the hooks below don't re-resolve every
  // render unless the schema actually changed.
  const inputNames = useMemo(
    () => (inputs ? Object.keys(inputs) : []).sort(),
    // We intentionally key on the JSON shape, not the instance — same
    // names across renders should reuse the same hooks.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [inputs ? Object.keys(inputs).sort().join("|") : ""],
  );

  // useStateMachineInput must be called the same number of times each
  // render, so we cap with a fixed-size array of slots.
  // 8 named inputs is plenty for any lesson scene; raise if needed.
  const MAX_INPUTS = 8;
  const slot0 = useStateMachineInput(rive, stateMachine, inputNames[0]);
  const slot1 = useStateMachineInput(rive, stateMachine, inputNames[1]);
  const slot2 = useStateMachineInput(rive, stateMachine, inputNames[2]);
  const slot3 = useStateMachineInput(rive, stateMachine, inputNames[3]);
  const slot4 = useStateMachineInput(rive, stateMachine, inputNames[4]);
  const slot5 = useStateMachineInput(rive, stateMachine, inputNames[5]);
  const slot6 = useStateMachineInput(rive, stateMachine, inputNames[6]);
  const slot7 = useStateMachineInput(rive, stateMachine, inputNames[7]);
  const slots = [slot0, slot1, slot2, slot3, slot4, slot5, slot6, slot7];

  // Push input values to Rive whenever the parent's `inputs` map changes.
  useEffect(() => {
    if (!inputs) return;
    inputNames.slice(0, MAX_INPUTS).forEach((name, i) => {
      const sm = slots[i];
      if (!sm) return;
      const next = inputs[name];
      try {
        if (typeof next === "boolean" || typeof next === "number") {
          if (sm.value !== next) sm.value = next;
        }
      } catch {
        /* swallow — wrong type for this input slot */
      }
    });
    // We depend on the actual values via JSON to catch every change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(inputs), ...slots]);

  // Triggers — fire each name in the array exactly once.
  useEffect(() => {
    if (!triggers || triggers.length === 0 || !rive) return;
    triggers.forEach((name) => {
      const inp = rive
        .stateMachineInputs(stateMachine)
        ?.find((i) => i.name === name);
      try {
        inp?.fire();
      } catch {
        /* swallow */
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggers?.join("|"), rive]);

  return (
    <RiveComponent
      className={className}
      style={{
        width,
        height,
        cursor: onClick ? "pointer" : undefined,
        ...style,
      }}
      onClick={onClick}
    />
  );
}

/* ─── public component ───────────────────────────────────────────── */
export default function RiveScene(props: RiveSceneProps) {
  const [failed, setFailed] = useState(false);
  const loggedRef = useMemo(() => ({ logged: false }), []);

  const handleFail = () => {
    if (!loggedRef.logged) {
      loggedRef.logged = true;
      // eslint-disable-next-line no-console
      console.warn(
        `[RiveScene] failed to load "${props.src}" — falling back. ` +
          `Drop the .riv file in /public/rive/ or check the URL.`,
      );
    }
    setFailed(true);
  };

  const fallbackNode = props.fallback ?? (
    <div
      aria-label="Animation loading"
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
      Rive scene
    </div>
  );

  if (failed) return <>{fallbackNode}</>;

  return (
    <RiveErrorBoundary onError={handleFail} fallbackNode={fallbackNode}>
      <RiveSceneInner {...props} onFail={handleFail} />
    </RiveErrorBoundary>
  );
}
