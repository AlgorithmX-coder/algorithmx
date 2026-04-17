"use client";
import { ReactLenis } from "lenis/react";
export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  return <ReactLenis root options={{ smoothWheel: true, lerp: 0.08 }}>{children}</ReactLenis>;
}
