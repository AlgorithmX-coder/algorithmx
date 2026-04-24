"use client";

/**
 * Subtle animated background for lesson content cards.
 * Drop inside a `position: relative; overflow: hidden;` container; the backdrop
 * absolutely fills the parent and sits beneath the card's own content.
 *
 * Layers (all very low-opacity, meant to be felt not seen):
 *   - scrolling cyber grid (0.02 opacity, 30s cycle)
 *   - centre radial glow
 *   - 9 drifting brand-colour particles (20–35s cycles)
 */
export default function ContentBackdrop() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden",
      }}
    >
      <div className="cb-grid" />
      <div className="cb-glow" />
      <div className="cb-particles">
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="cb-particle"
            style={{
              left: `${(i * 11 + (i % 3) * 5) % 100}%`,
              background: ["#60a5fa", "#34d399", "#a78bfa", "#fde047"][i % 4],
              animationDelay: `${(i * 1.7) % 10}s`,
              animationDuration: `${20 + (i % 5) * 3}s`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes cbGridScroll {
          0% { background-position: 0 0; }
          100% { background-position: 0 60px; }
        }
        @keyframes cbParticleRise {
          0%   { transform: translateY(0); opacity: 0; }
          20%  { opacity: 0.12; }
          80%  { opacity: 0.12; }
          100% { transform: translateY(-120%); opacity: 0; }
        }
        .cb-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(96,165,250,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(96,165,250,0.02) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: cbGridScroll 30s linear infinite;
        }
        .cb-glow {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 30%, rgba(96,165,250,0.04), transparent 70%);
        }
        .cb-particles {
          position: absolute; inset: 0;
        }
        .cb-particle {
          position: absolute;
          bottom: -8px;
          width: 3px; height: 3px;
          border-radius: 50%;
          box-shadow: 0 0 6px currentColor;
          animation: cbParticleRise linear infinite;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
