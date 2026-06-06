"use client";

import { useSyncExternalStore } from "react";
import type { ReactorQuality } from "./authReactorTypes";

/**
 * Maps viewport width → a reactor quality tier via useSyncExternalStore (no
 * setState-in-effect). Used by the standalone preview route; signup/login
 * already compute `quality` into AuthMachineState and pass it through.
 *
 * SSR snapshot is "low", then upgrades on the client.
 */
function subscribe(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function getSnapshot(): ReactorQuality {
  if (typeof window === "undefined") return "low";
  const w = window.innerWidth;
  if (w >= 1200) return "high";
  if (w >= 768) return "medium";
  return "low";
}

export function useDeviceQuality(): ReactorQuality {
  return useSyncExternalStore(subscribe, getSnapshot, () => "low");
}
