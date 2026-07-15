"use client";

/**
 * CyberHeroesPlayfulBackdrop — the backdrop for /cyberheroes.
 *
 * This WAS a live WebGL galaxy (CyberHeroes3DScene: glowing crystal orbs, a
 * constellation network, energy pulses, elliptical rings + bloom) layered over
 * an animated CSS nebula. It re-rendered every frame and janked / froze on
 * some desktops even after 30fps caps, DPR cuts and a high-performance GPU
 * hint. So the entire look is now BAKED into a single static image
 * (public/cyberheroes/hero-backdrop.jpg) — visually the same, zero per-frame
 * GPU cost. The live scene lives on in ./CyberHeroes3DScene if we ever want to
 * bring it back (behind a device check).
 *
 * Fixed, pointer-events:none, z-index:-1. The central column is kept dark so
 * foreground text stays legible.
 */
export default function CyberHeroesPlayfulBackdrop() {
  return (
    <div
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        pointerEvents: "none",
        overflow: "hidden",
        // Deep-space base shows instantly while the image decodes.
        background: "#04050d",
      }}
    >
      {/* Frozen galaxy + 3D orbs — a still frame of the old WebGL scene. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "url(/cyberheroes/hero-backdrop.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Centre lift so the headline text keeps contrast on the left. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 72% 62% at 38% 44%, rgba(6,8,24,0.68) 0%, rgba(6,8,24,0.32) 48%, rgba(6,8,24,0) 74%)",
        }}
      />
    </div>
  );
}
