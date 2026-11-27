"use client";

import ByAlgorithmX from "@/app/components/ByAlgorithmX";

/* The /corporate header mark: the shield (glowing cyan-to-violet edge,
 * bright check). The nav flips night<->sand on scroll, so the wordmark uses the
 * nav's tone-aware ink and the check is a brand blue that reads on both grounds.
 * Passed to the shared Nav as its `brand`, so only this page changes. */
export default function CorporateBrand() {
  return (
    <>
      <svg width="30" height="30" viewBox="0 0 72 72" aria-hidden="true" style={{ display: "block", flexShrink: 0, filter: "drop-shadow(0 0 6px rgba(90,140,255,0.5))" }}>
        <defs>
          <linearGradient id="corpBrandEdge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6ff0ff" />
            <stop offset="48%" stopColor="#5a8cff" />
            <stop offset="100%" stopColor="#a35cff" />
          </linearGradient>
        </defs>
        <path d="M36 6 L60 14 V32 C60 48 50 59 36 65 C22 59 12 48 12 32 V14 Z" fill="rgba(96,146,255,0.14)" stroke="url(#corpBrandEdge)" strokeWidth="2.8" strokeLinejoin="round" />
        <path d="M36 6 L60 14" stroke="#bfe8ff" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
        <path d="M27 33 L34 41 L48 24" fill="none" stroke="#5f8dff" strokeWidth="4.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, lineHeight: 1 }}>
        <span className="corp-wm" style={{ fontFamily: "var(--lv2-font-mono)", fontWeight: 700, fontSize: 14, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--lv2-word-mark, #eaf1ff)" }}>
          CYBER <span className="corp-wm-secured" style={{ color: "#5f8dff" }}>SECURED</span>
        </span>
        <span className="corp-wm-by" style={{ fontFamily: "var(--lv2-font-mono)", fontWeight: 500, fontSize: 8.5, letterSpacing: "0.24em", textTransform: "uppercase", color: "var(--lv2-word-mark, #eaf1ff)", display: "inline-flex", alignItems: "center" }}>
          <ByAlgorithmX wordStyle={{ opacity: 0.6 }} />
        </span>
      </span>
    </>
  );
}
