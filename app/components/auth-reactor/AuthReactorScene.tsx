"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import AuthReactorController from "./AuthReactorController";
import AuthReactorErrorBoundary from "./AuthReactorErrorBoundary";
import AuthReactorLoading from "./AuthReactorLoading";
import { QUALITY } from "./authReactorConfig";
import type { AuthMachineState } from "./authReactorTypes";

function CanvasInner({ state }: { state: AuthMachineState }) {
  return (
    <Canvas
      dpr={QUALITY[state.quality].dpr}
      camera={{ position: [0, 0.15, 6.2], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      style={{ width: "100%", height: "100%", background: "transparent", pointerEvents: "none" }}
    >
      <Suspense fallback={null}>
        <AuthReactorController state={state} />
      </Suspense>
    </Canvas>
  );
}

// Client-only so the R3F/three bundle never runs on the server; the page still
// prerenders. While the chunk loads, show the premium static fallback.
const CanvasLazy = dynamic(() => Promise.resolve({ default: CanvasInner }), {
  ssr: false,
  loading: () => <AuthReactorLoading />,
});

/**
 * AuthReactorScene — the swappable centrepiece entry point. Consumes the
 * existing AuthMachineState. Every tier renders the reactor; if WebGL is
 * unavailable or the scene throws, the error boundary shows the static
 * fallback. The 3D scene is decorative and never required for the form.
 */
export default function AuthReactorScene({ state }: { state: AuthMachineState }) {
  return (
    <>
      <AuthReactorErrorBoundary>
        <CanvasLazy state={state} />
      </AuthReactorErrorBoundary>
      {/* Always mount Leva (hidden) so it owns the panel root — otherwise the
          controller's useControls() makes leva auto-inject a VISIBLE default
          panel. `hidden` keeps it gone everywhere (dev preview + production). */}
      <Leva hidden />
    </>
  );
}
