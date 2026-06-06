"use client";

import { Environment, Lightformer, ContactShadows } from "@react-three/drei";
import { QUALITY, REACTOR } from "./authReactorConfig";
import type { ReactorQuality } from "./authReactorTypes";

/**
 * Baked studio environment (reflections from inline Lightformers — no external
 * HDRI, no remote assets) + an optional contact-shadow ground. Quality-gated.
 */
export default function AuthReactorEnvironment({ quality }: { quality: ReactorQuality }) {
  const q = QUALITY[quality];
  return (
    <>
      <Environment resolution={q.envResolution} frames={1}>
        <Lightformer form="rect" intensity={2.6} color={REACTOR.cyan} position={[3, 2, 4]} scale={[6, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color={REACTOR.violet} position={[-4, -1, 2]} scale={[6, 6, 1]} />
        <Lightformer form="circle" intensity={1.4} color={REACTOR.white} position={[0, 5, 1]} scale={3} />
        <Lightformer form="rect" intensity={1} color="#ffcaa0" position={[3, -3, 2]} scale={[4, 3, 1]} />
      </Environment>
      {q.contactShadows && (
        <ContactShadows position={[0, -1.55, 0]} opacity={0.42} scale={7} blur={2.6} far={4} resolution={1024} color="#04060f" />
      )}
    </>
  );
}
