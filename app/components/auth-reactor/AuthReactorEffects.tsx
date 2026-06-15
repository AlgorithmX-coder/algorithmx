"use client";

import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { QUALITY } from "./authReactorConfig";
import type { ReactorQuality } from "./authReactorTypes";

/**
 * Restrained post: tight selective bloom (only the brightest emissive cores
 * glow, so machined edges stay sharp). Desktop tier only; no chromatic
 * aberration. Returns null on tiers where postprocessing is off.
 *
 * NOTE: the old Vignette was removed — the reactor now floats in a full-bleed
 * portal chamber, so a per-canvas vignette darkened its column edges and read
 * as a vertical "division" down the page.
 */
export default function AuthReactorEffects({ quality }: { quality: ReactorQuality }) {
  if (!QUALITY[quality].postprocessing) return null;
  return (
    <EffectComposer multisampling={QUALITY[quality].multisampling}>
      <Bloom intensity={0.55} luminanceThreshold={0.72} luminanceSmoothing={0.18} radius={0.42} mipmapBlur />
    </EffectComposer>
  );
}
