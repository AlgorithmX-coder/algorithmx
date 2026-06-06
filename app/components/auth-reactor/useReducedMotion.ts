"use client";

import { useSyncExternalStore } from "react";

/**
 * SSR-safe `prefers-reduced-motion` hook via useSyncExternalStore (the
 * React-blessed external-state pattern — no setState-in-effect). The reactor
 * uses this to drop camera motion / spin / breathing while keeping all
 * state-driven light changes.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined" || !window.matchMedia) return () => {};
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getSnapshot(): boolean {
  return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches;
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}
