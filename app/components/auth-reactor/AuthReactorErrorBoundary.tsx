"use client";

import { Component, type ReactNode } from "react";
import AuthReactorFallback from "./AuthReactorFallback";

/**
 * Catches any render/runtime error inside the R3F subtree (shader compile,
 * context loss surfacing as a throw, GLB parse failure) and shows the premium
 * static fallback instead. The form is outside this boundary and is never
 * affected — account creation never depends on the 3D scene.
 */
export default class AuthReactorErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[AuthReactor] scene error — showing static fallback:", error);
  }

  render() {
    if (this.state.failed) return <AuthReactorFallback />;
    return this.props.children;
  }
}
