"use client";

import { Component, CSSProperties, ReactNode, useEffect, useMemo, useState } from "react";
import { useRive, useStateMachineInput } from "@rive-app/react-canvas";

type CharacterName = "adam" | "layla" | "robo" | "raccoon";

type RiveCharacterProps = {
  character: CharacterName;
  state?: string;
  width?: number;
  height?: number;
  className?: string;
  fallback?: ReactNode;
};

const CHARACTER_COLORS: Record<CharacterName, string> = {
  adam: "#60a5fa",
  layla: "#34d399",
  robo: "#f59e0b",
  raccoon: "#ef4444",
};

function PlaceholderAvatar({
  character,
  width,
  height,
  className,
}: {
  character: CharacterName;
  width: number;
  height: number;
  className?: string;
}) {
  const color = CHARACTER_COLORS[character];
  const letter = character.charAt(0).toUpperCase();
  return (
    <div
      className={className}
      aria-label={`${character} avatar placeholder`}
      style={{
        width,
        height,
        minWidth: 60,
        minHeight: 60,
        borderRadius: "50%",
        background: `${color}22`,
        border: `2px solid ${color}`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        fontFamily: "'Fredoka', 'Nunito', system-ui, sans-serif",
        fontWeight: 700,
        fontSize: Math.max(18, Math.round(width * 0.4)),
        boxShadow: `0 0 16px ${color}33`,
      }}
    >
      {letter}
    </div>
  );
}

/* ─────────────────── Error boundary ─────────────────── */
class RiveErrorBoundary extends Component<
  { onError: () => void; children: ReactNode; fallbackNode: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { onError: () => void; children: ReactNode; fallbackNode: ReactNode }) {
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

/* ─────────────────── Inner renderer (hooks live here so they unmount on error) ─────────────────── */
function RiveInner({
  character,
  state,
  width,
  height,
  className,
  onFail,
}: {
  character: CharacterName;
  state?: string;
  width: number;
  height: number;
  className?: string;
  onFail: () => void;
}) {
  const { rive, RiveComponent } = useRive({
    src: `/rive/${character}.riv`,
    stateMachines: "main",
    autoplay: true,
    onLoadError: () => onFail(),
  });

  // Optional state-machine input driven by the `state` prop
  const stateInput = useStateMachineInput(rive, "main", "state");

  useEffect(() => {
    if (!stateInput || state === undefined) return;
    try {
      const current = stateInput.value;
      if (typeof current === "number") {
        const n = Number(state);
        if (!Number.isNaN(n)) stateInput.value = n;
      } else if (typeof current === "boolean") {
        stateInput.value = state === "true" || state === "1";
      } else {
        // string-valued inputs aren't supported by Rive here; ignore
      }
    } catch {
      /* ignore state-input write errors */
    }
  }, [stateInput, state]);

  const style: CSSProperties = { width, height };
  return <RiveComponent className={className} style={style} />;
}

/* ─────────────────── Default export ─────────────────── */
export default function RiveCharacter({
  character,
  state,
  width = 200,
  height = 200,
  className,
  fallback,
}: RiveCharacterProps) {
  const [failed, setFailed] = useState(false);
  const loggedRef = useMemo(() => ({ logged: false }), []);

  const handleFail = () => {
    if (!loggedRef.logged) {
      loggedRef.logged = true;
      // eslint-disable-next-line no-console
      console.warn(
        `[RiveCharacter] ${character}.riv not found - using fallback. Drop .riv files in /public/rive/ when ready.`,
      );
    }
    setFailed(true);
  };

  const fallbackNode =
    fallback ?? (
      <PlaceholderAvatar
        character={character}
        width={width}
        height={height}
        className={className}
      />
    );

  if (failed) return <>{fallbackNode}</>;

  return (
    <RiveErrorBoundary onError={handleFail} fallbackNode={fallbackNode}>
      <RiveInner
        character={character}
        state={state}
        width={width}
        height={height}
        className={className}
        onFail={handleFail}
      />
    </RiveErrorBoundary>
  );
}

export type { CharacterName, RiveCharacterProps };
