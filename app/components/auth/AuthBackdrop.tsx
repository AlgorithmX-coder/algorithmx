"use client";

import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import { ACCESS, ACCESS_GRAD, rgba } from "./accessTokens";
import { useIsDesktop } from "./useIsDesktop";

/**
 * AuthBackdrop — the living atmosphere behind the Access Layer.
 *
 * A deep black-blue base wash grounds the colour while the 3D portal chamber
 * loads on top. Legibility scrims then seat the form: on desktop a soft
 * darkening sweeps in from the left so the form column blends into the scene
 * rather than sitting on a card; a top/bottom vignette frames the surface.
 *
 * All decorative; aria-hidden; freezes under reduced-motion; degrades on phones.
 */

// Client-only — the R3F/three bundle must never run on the server.
const Portal = dynamic(() => import("./AuthPortalBackground"), { ssr: false });
const CodeRain = dynamic(() => import("./AuthCodeRain"), { ssr: false });

export default function AuthBackdrop({
  energy = 0,
  submitting = false,
  success = false,
}: {
  /** 0..1 form completion — charges the portal as the user fills the form. */
  energy?: number;
  /** Form is submitting — gives the portal a spin burst. */
  submitting?: boolean;
  /** Auth succeeded — flares the portal ("the chamber opens"). */
  success?: boolean;
} = {}) {
  const reduced = !!useReducedMotion();
  const isDesktop = useIsDesktop(1200);
  const isTabletUp = useIsDesktop(768);
  const quality: "high" | "medium" | "low" = isDesktop ? "high" : isTabletUp ? "medium" : "low";
  // The reactor column's centre sits a fixed ~246px right of screen-centre in
  // the max-1440 grid; match that so the portal stays locked behind it. Centred
  // (0) on small screens where the reactor sits behind the form.
  const offsetPx = isDesktop ? 246 : 0;

  return (
    <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Base wash — deep black-blue chamber, the void the portal lives in. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 60% 55% at ${isDesktop ? "calc(50% + 246px)" : "50%"} 44%, ${rgba(ACCESS.violetDeep, 0.18)} 0%, transparent 55%), linear-gradient(180deg, #070914 0%, #05060f 55%, #030308 100%)`,
        }}
      />

      {/* Faint blue code rain in the dark space — masked OUT over the portal so
          it never clutters the rings/core, kept low-opacity so it's ambient. */}
      {(() => {
        const mask = isDesktop
          ? "radial-gradient(ellipse 32% 46% at calc(50% + 246px) 50%, transparent 0%, transparent 40%, #000 82%)"
          : "radial-gradient(ellipse 64% 46% at 50% 42%, transparent 0%, transparent 38%, #000 84%)";
        return (
          <div style={{ position: "absolute", inset: 0, opacity: 0.55, maskImage: mask, WebkitMaskImage: mask }}>
            <CodeRain reducedMotion={reduced} />
          </div>
        );
      })()}

      {/* The portal chamber. */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Portal quality={quality} reducedMotion={reduced} offsetPx={offsetPx} energy={energy} submitting={submitting} success={success} />
      </div>

      {/* Legibility wash — a gentle, edge-free gradient so the chamber reads as
          ONE continuous scene (no left/right division). The real text contrast
          comes from the glow-pool attached to the form (AuthTerminalPanel),
          which tracks the form across widths. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: isDesktop
            ? "transparent"
            : `radial-gradient(ellipse 120% 80% at 50% 38%, ${rgba(ACCESS.void, 0.5)} 0%, ${rgba(ACCESS.void, 0.22)} 48%, transparent 80%)`,
        }}
      />

      {/* Top + bottom vignette to seat the columns. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${rgba(ACCESS.void, 0.6)} 0%, transparent 16%, transparent 78%, ${rgba(ACCESS.void, 0.78)} 100%)`,
        }}
      />
    </div>
  );
}
