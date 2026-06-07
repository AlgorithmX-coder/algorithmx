"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import { QUALITY } from "./authReactorConfig";
import type { ReactorQuality } from "./authReactorTypes";

/**
 * Restrained post: tight selective bloom (only the brightest emissive cores
 * glow, so machined edges stay sharp) + a subtle vignette. Desktop tier only;
 * no chromatic aberration. Returns null on tiers where postprocessing is off.
 */
export default function AuthReactorEffects({ quality }: { quality: ReactorQuality }) {
  if (!QUALITY[quality].postprocessing) return null;
  return (
    <EffectComposer multisampling={QUALITY[quality].multisampling}>
      <Bloom intensity={0.7} luminanceThreshold={0.6} luminanceSmoothing={0.14} radius={0.36} mipmapBlur />
      <Vignette eskil={false} offset={0.24} darkness={0.78} />
    </EffectComposer>
  );
}
