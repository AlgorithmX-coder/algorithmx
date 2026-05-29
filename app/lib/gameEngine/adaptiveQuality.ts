"use client";

/**
 * Adaptive quality tier for the Week 1 exercises.
 *
 * We pick "high" / "medium" / "low" once on first call (memoized) using
 * a cheap blend of platform signals:
 *   - hardwareConcurrency (logical cores)
 *   - deviceMemory (gibibytes, where exposed)
 *   - mobile UA hint
 *   - prefers-reduced-motion
 *
 * The tier maps onto concrete settings each exercise can read:
 *   - dprCap: bound on devicePixelRatio for canvas buffers
 *   - particleMultiplier: scale particle counts
 *   - blurAllowed / shadowAllowed: expensive canvas effects
 *
 * Anything fancier (FPS-driven downgrade, runtime profiling) is a
 * follow-up.
 */

import { useEffect, useState } from "react";

export type QualityTier = "high" | "medium" | "low";

export interface QualitySettings {
  tier: QualityTier;
  dprCap: number;
  particleMultiplier: number;
  blurAllowed: boolean;
  shadowAllowed: boolean;
}

const HIGH: QualitySettings = {
  tier: "high",
  dprCap: 2,
  particleMultiplier: 1,
  blurAllowed: true,
  shadowAllowed: true,
};
const MEDIUM: QualitySettings = {
  tier: "medium",
  dprCap: 1.5,
  particleMultiplier: 0.7,
  blurAllowed: true,
  shadowAllowed: true,
};
const LOW: QualitySettings = {
  tier: "low",
  dprCap: 1,
  particleMultiplier: 0.4,
  blurAllowed: false,
  shadowAllowed: false,
};

function detectTier(): QualityTier {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return "high";
  }
  const cores = navigator.hardwareConcurrency ?? 8;
  const deviceMemory =
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  const prm =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  // Reduced-motion users get the lowest particle/effect tier, but we
  // still serve them sharp text - cap dpr is independent of motion.
  if (prm) return "low";

  if (cores >= 6 && deviceMemory >= 4 && !isMobile) return "high";
  if (cores >= 4 && deviceMemory >= 2) return "medium";
  if (isMobile && cores <= 4) return "low";
  return "medium";
}

function settingsForTier(tier: QualityTier): QualitySettings {
  return tier === "high" ? HIGH : tier === "medium" ? MEDIUM : LOW;
}

let cached: QualitySettings | null = null;

/** Synchronous accessor for non-React code paths (e.g. inside an rAF). */
export function getQualitySettings(): QualitySettings {
  if (cached) return cached;
  cached = settingsForTier(detectTier());
  return cached;
}

/**
 * React hook variant. Returns the same settings as the sync accessor
 * but the value is stable across renders for the lifetime of the page.
 */
export function useAdaptiveQuality(): QualitySettings {
  const [settings] = useState<QualitySettings>(() => getQualitySettings());
  useEffect(() => {
    // No teardown - tier is fixed for the session. Future: re-evaluate
    // on prefers-reduced-motion change.
  }, []);
  return settings;
}

/** Convenience: returns a particle count after applying the active multiplier. */
export function scaledParticleCount(base: number): number {
  return Math.max(1, Math.round(base * getQualitySettings().particleMultiplier));
}
