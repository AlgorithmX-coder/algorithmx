"use client";

import { useEffect, useRef, useState } from "react";
import Simulator from "@/app/ai-cleared/sims";
import type { SimMessage } from "@/app/ai-cleared/sims/types";

/**
 * The hero window on /corporate: the course's Copilot simulator exactly as
 * a learner meets it, tailored to a firm. Kestrel Mutual does not exist;
 * its mark is drawn here. The window renders at full size and is scaled
 * to the column, so it is the real thing, not a mock-up.
 */

const FIRM = "Kestrel Mutual";
const LEARNER = "Amara";
const BASE_W = 640;
const NARROW_W = 480;
const BASE_H = 548;

const WELCOME: SimMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    text: `Welcome to your training, ${LEARNER}. This is ${FIRM}'s practice copy of Copilot. It looks and behaves like the one you use at work, but every document on your desk here is invented and nothing you type leaves the room.\n\n**Module 1, What happens to what you type**, takes about 18 minutes. When you are ready, tell me the first thing you would normally ask me on a Monday morning, and we will start there.`,
  },
];

function KestrelMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden style={{ flexShrink: 0 }}>
      <defs>
        <linearGradient id="kestrel-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0a7085" />
          <stop offset="100%" stopColor="#1d2b5c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#kestrel-g)" />
      <path d="M6 20 L16 9 L26 20" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 23 L16 17 L21 23" fill="none" stroke="#f2c14e" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function HeroSim() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.7);
  /* A narrow column drops the app rail and lays the window out at 480px,
   * so the scale stays readable on a phone. */
  const [narrow, setNarrow] = useState(false);
  const baseW = narrow ? NARROW_W : BASE_W;

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const fit = () => {
      const w = el.clientWidth;
      const n = w < 480;
      setNarrow(n);
      setK(Math.min(1, w / (n ? NARROW_W : BASE_W)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="corp-hs" aria-label={`The course's Copilot practice window, tailored to ${FIRM}`}>
      <div className="corp-hs-bar">
        <span className="corp-hs-dots" aria-hidden><i /><i /><i /></span>
        <span className="corp-hs-firm">
          <KestrelMark />
          <b>{FIRM}</b>
          <span className="corp-hs-sep" aria-hidden>·</span>
          <span>practice tenant</span>
        </span>
        <span className="corp-hs-chip">Module 1</span>
      </div>
      <div ref={hostRef} className={narrow ? "corp-hs-host corp-hs-narrow" : "corp-hs-host"} style={{ height: Math.round(BASE_H * k) }}>
        <div style={{ width: baseW, height: BASE_H, transform: `scale(${k})`, transformOrigin: "top left" }}>
          <div style={{ height: BASE_H, display: "grid" }}>
            <Simulator tool="copilot" tier="enterprise" firmName={FIRM} learnerName={LEARNER} messages={WELCOME} draft="" onSend={() => {}} canSend={false} composerLocked status={undefined} />
          </div>
        </div>
      </div>
      <style jsx>{`
        .corp-hs {
          position: relative; border-radius: 16px; overflow: hidden; background: #ffffff;
          border: 1px solid rgba(20,22,29,0.35);
          box-shadow: 0 30px 70px -30px rgba(10,112,133,0.55), 0 30px 60px -20px rgba(0,0,0,0.5);
        }
        .corp-hs-bar { display: flex; align-items: center; gap: 12px; height: 42px; padding: 0 14px; background: #f4efe7; border-bottom: 1px solid rgba(17,22,38,0.08); }
        .corp-hs-dots { display: inline-flex; gap: 6px; }
        .corp-hs-dots i { width: 9px; height: 9px; border-radius: 50%; display: block; }
        .corp-hs-dots i:nth-child(1) { background: #ff5f57; } .corp-hs-dots i:nth-child(2) { background: #febc2e; } .corp-hs-dots i:nth-child(3) { background: #28c840; }
        .corp-hs-firm { flex: 1 1 0; min-width: 0; display: inline-flex; align-items: center; gap: 8px; overflow: hidden; white-space: nowrap; font-family: var(--lv2-font-mono); font-size: 11.5px; color: rgba(17,22,38,0.7); background: rgba(255,253,248,0.7); border-radius: 8px; padding: 4px 11px 4px 6px; }
        .corp-hs-firm b { color: #14161d; font-weight: 700; letter-spacing: 0.02em; }
        .corp-hs-sep { opacity: 0.5; }
        .corp-hs-chip { font-family: var(--lv2-font-mono); font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #0a7085; border: 1px solid rgba(10,112,133,0.45); border-radius: 999px; padding: 4px 9px; white-space: nowrap; }
        .corp-hs-host { position: relative; overflow: hidden; background: #ffffff; }
        .corp-hs-host :global(.sim-copilot) { border: none !important; border-radius: 0 !important; height: 100%; }
        .corp-hs-narrow :global(.sim-copilot) { grid-template-columns: minmax(0, 1fr) !important; }
        .corp-hs-narrow :global(.sim-copilot-rail) { display: none !important; }
      `}</style>
    </div>
  );
}
