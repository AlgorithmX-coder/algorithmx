"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { REACTOR } from "./authReactorConfig";

/**
 * Studio lighting: cool key + violet rim + neutral & warm fills, plus a
 * state-coloured core point-light spill. The metal stays readable with the
 * emissive off — the model never depends on bloom to look good.
 */
export default function AuthReactorLighting({ energy, isError }: { energy: number; isError: boolean }) {
  const spill = useRef<THREE.PointLight>(null);
  const dormant = useMemo(() => new THREE.Color(REACTOR.dormant), []);
  const charged = useMemo(() => new THREE.Color(REACTOR.charged), []);
  const warn = useMemo(() => new THREE.Color(REACTOR.warn), []);
  const target = useMemo(() => new THREE.Color(), []);

  useFrame((_, dt) => {
    if (!spill.current) return;
    target.copy(dormant).lerp(charged, energy);
    if (isError) target.copy(warn);
    spill.current.color.lerp(target, Math.min(1, dt * 4));
    spill.current.intensity = THREE.MathUtils.lerp(spill.current.intensity, 0.6 + energy * 2.4, Math.min(1, dt * 4));
  });

  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 3, 6]} intensity={1.5} color={REACTOR.cyan} />
      <directionalLight position={[-5, 1, 1]} intensity={1} color={REACTOR.violet} />
      <directionalLight position={[0, 4, 3]} intensity={0.4} color="#aab6e0" />
      <directionalLight position={[3, -2, 3]} intensity={0.35} color="#b6a6ff" />
      <pointLight ref={spill} position={[0, 0, 0.4]} intensity={0.6} color={REACTOR.dormant} distance={9} decay={2} />
    </>
  );
}
