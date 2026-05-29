"use client";

/**
 * Returns the current motion intensity factor in [0, 1].
 *
 *   1.0 = normal (no comfort, no OS reduced-motion)
 *   0.0 = full reduction (used as a "skip animation" gate)
 *
 * The toolkit's juice components multiply their amplitudes / durations
 * / particle counts by this factor so a single value controls "how
 * lively" the whole game feels. Existing exercises can adopt it as
 * they migrate to the shared juice pipeline.
 *
 * Today: returns 0.45 in comfort mode (calmer but not dead), 0 if the
 * OS explicitly requests reduced motion (strict), 1 otherwise. The
 * 0.45 vs 0 split intentionally treats user-comfort as a preference
 * and OS reduced-motion as a hard accessibility requirement.
 */

import { useComfortMode } from "@/app/lib/comfortMode";

export function useMotionIntensity(): number {
  const comfort = useComfortMode();
  if (comfort.prefersReducedMotion) return 0;
  if (comfort.enabled) return 0.45;
  return 1;
}
