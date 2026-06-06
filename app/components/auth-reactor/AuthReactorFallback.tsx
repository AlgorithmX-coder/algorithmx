"use client";

import { ACCESS, rgba } from "../auth/accessTokens";
import { energyForStage, REACTOR } from "./authReactorConfig";
import type { AuthReactorStage } from "./authReactorTypes";

/**
 * AuthReactorFallback — premium static reactor for no-WebGL / context-loss /
 * `prefers-reduced-data`. Pure CSS, decorative (aria-hidden). Still reflects
 * power level so the form never sits next to a dead box, and never blocks
 * account creation.
 */
export default function AuthReactorFallback({ stage = 0 }: { stage?: AuthReactorStage }) {
  const energy = energyForStage(stage);
  const coreColor = stage === 8 ? REACTOR.warn : stage >= 5 ? ACCESS.cyan : ACCESS.violet;
  return (
    <div
      aria-hidden
      style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", pointerEvents: "none" }}
    >
      <div
        style={{
          position: "absolute",
          width: "60%",
          aspectRatio: "1",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${rgba(coreColor, 0.12 + energy * 0.2)} 0%, transparent 62%)`,
          filter: "blur(36px)",
          transition: "background 600ms ease",
        }}
      />
      <div style={{ position: "relative", width: "min(58%, 520px)", aspectRatio: "1", transform: "rotateX(8deg)" }}>
        {[100, 78, 56].map((pct, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              inset: `${(100 - pct) / 2}%`,
              borderRadius: "50%",
              border: `1.5px solid ${rgba(i === 0 ? REACTOR.brass : ACCESS.cyan, 0.25 + energy * 0.5)}`,
              boxShadow: `0 0 ${10 + energy * 24}px ${rgba(ACCESS.cyan, energy * 0.18)}`,
              transition: "all 600ms ease",
            }}
          />
        ))}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: "18%",
            aspectRatio: "1",
            transform: "translate(-50%,-50%) rotate(45deg)",
            borderRadius: 10,
            background: `linear-gradient(135deg, ${coreColor}, ${rgba(coreColor, 0.4)})`,
            border: `1px solid ${coreColor}`,
            boxShadow: `0 0 30px ${rgba(coreColor, 0.4 + energy * 0.5)}`,
            transition: "all 500ms ease",
          }}
        />
      </div>
    </div>
  );
}
