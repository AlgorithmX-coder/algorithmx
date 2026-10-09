"use client";

/**
 * PaperArcs - the threat-map hero's defence network, restated in ink
 * on paper (owner 2026-10-09: make the rest of the page relevant to
 * the hero's theme WITHOUT changing the light ground). A static
 * hairline arc-and-node field, absolutely positioned along the top of
 * a light section; decorative only, no motion.
 */
export default function PaperArcs() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 220"
      preserveAspectRatio="xMidYMin slice"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: 0,
        width: "100%",
        height: 170,
        pointerEvents: "none",
      }}
    >
      <g stroke="rgba(10,112,133,0.16)" fill="none" strokeWidth={1}>
        <path d="M80,150 Q340,30 600,120" />
        <path d="M600,120 Q860,20 1120,110" />
        <path d="M1120,110 Q1260,70 1400,130" opacity={0.7} />
        <path d="M240,180 Q560,80 900,170" opacity={0.6} strokeDasharray="3 5" />
      </g>
      <g fill="rgba(10,112,133,0.34)">
        <circle cx={80} cy={150} r={2.4} />
        <circle cx={600} cy={120} r={2.4} />
        <circle cx={1120} cy={110} r={2.4} />
        <circle cx={1400} cy={130} r={2} />
        <circle cx={240} cy={180} r={2} />
        <circle cx={900} cy={170} r={2} />
      </g>
    </svg>
  );
}
