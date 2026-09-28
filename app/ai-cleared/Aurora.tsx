/* The backdrop behind every AI Cleared page: three slow aurora blobs in
 * the course's own hues (teal, violet, pink) over the sand ground, with a
 * faint dot grid. Pure CSS, fixed and non-interactive; still under reduced
 * motion. Place it first inside a positioned, overflow-hidden parent. */
export default function Aurora({ intensity = 1 }: { intensity?: number }) {
  return (
    <div className="au" aria-hidden style={{ opacity: intensity }}>
      <span className="au-b au-1" />
      <span className="au-b au-2" />
      <span className="au-b au-3" />
      <span className="au-grid" />
      <style>{`
        .au { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
        .au-b { position: absolute; border-radius: 50%; filter: blur(70px); will-change: transform; }
        .au-1 { width: 720px; height: 520px; left: -140px; top: -220px; background: radial-gradient(closest-side, rgba(10,112,133,0.34), rgba(10,112,133,0)); animation: au-drift-1 26s ease-in-out infinite alternate; }
        .au-2 { width: 640px; height: 520px; right: -180px; top: -140px; background: radial-gradient(closest-side, rgba(87,68,201,0.26), rgba(87,68,201,0)); animation: au-drift-2 32s ease-in-out infinite alternate; }
        .au-3 { width: 560px; height: 420px; left: 38%; top: 320px; background: radial-gradient(closest-side, rgba(165,17,127,0.16), rgba(165,17,127,0)); animation: au-drift-3 38s ease-in-out infinite alternate; }
        .au-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(20,22,29,0.10) 1px, transparent 1.2px); background-size: 26px 26px; mask-image: linear-gradient(to bottom, rgba(0,0,0,0.9), rgba(0,0,0,0.25) 60%, transparent); }
        @keyframes au-drift-1 { from { transform: translate(0, 0) scale(1); } to { transform: translate(90px, 60px) scale(1.08); } }
        @keyframes au-drift-2 { from { transform: translate(0, 0) scale(1); } to { transform: translate(-80px, 70px) scale(1.06); } }
        @keyframes au-drift-3 { from { transform: translate(0, 0) scale(1); } to { transform: translate(-60px, -40px) scale(1.1); } }
        @media (prefers-reduced-motion: reduce) { .au-b { animation: none; } }
      `}</style>
    </div>
  );
}
