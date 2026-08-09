"use client";

/**
 * Case glyphs — one flat technical icon per attack, so the mission map
 * reads as cool techy case files, not cartoon mugshots. Geometric line
 * glyphs (1.6px stroke, currentColor) per the Signal Room art direction.
 */

import type { ReactNode } from "react";

const GLYPHS: Record<string, ReactNode> = {
  // Phishing — a hook
  "explorers-m01": (
    <>
      <circle cx="15" cy="4" r="1.4" />
      <path d="M15 5.4v6.6a4.5 4.5 0 0 1-9 0" />
      <path d="M6 12l-1.6-2M6 12l2-1.2" />
    </>
  ),
  // Bait & Switch — swap arrows
  "explorers-m02": (
    <>
      <path d="M4 8h13l-3-3M4 8l3 3" />
      <path d="M20 16H7l3 3M20 16l-3-3" />
    </>
  ),
  // Brute Force — a lock hammered from the side
  "explorers-m03": (
    <>
      <rect x="6" y="10" width="13" height="9" rx="1.6" />
      <path d="M9 10V7a3.5 3.5 0 0 1 7 0v3" />
      <path d="M2 6l2.5 1M2 12l2.5-.4M2 18l2.5-1" />
    </>
  ),
  // OSINT — an eye in a magnifier
  "explorers-m04": (
    <>
      <circle cx="10" cy="10" r="6" />
      <circle cx="10" cy="10" r="2" />
      <path d="M14.5 14.5L20.5 20.5" />
    </>
  ),
  // Spear Phishing — a spear into a target
  "explorers-m05": (
    <>
      <circle cx="14.5" cy="9.5" r="6" />
      <circle cx="14.5" cy="9.5" r="2" />
      <path d="M3 3l8.5 8.5M11.5 11.5H8.5M11.5 11.5V8.5" />
    </>
  ),
  // Social Engineering — puppet strings pulling nodes
  "explorers-m06": (
    <>
      <path d="M5 3h14" />
      <path d="M9 3v4.5M15 3v6.5" />
      <circle cx="9" cy="10" r="2.5" />
      <circle cx="15" cy="12.5" r="2.5" />
    </>
  ),
  // Account Takeover — a user with an intrusion arrow
  "explorers-m07": (
    <>
      <circle cx="10" cy="8" r="3.3" />
      <path d="M4 20a6 6 0 0 1 11.5-2.3" />
      <path d="M17 7l3.5 3.5-3.5 3.5" />
      <path d="M20.5 10.5H13" />
    </>
  ),
  // Catfish — a masquerade mask
  "explorers-m08": (
    <>
      <path d="M3.5 7.5c4-2 13-2 17 0-1 5.5-3.2 8.5-8.5 8.5S4.5 13 3.5 7.5z" />
      <circle cx="9" cy="10.5" r="1" />
      <circle cx="15" cy="10.5" r="1" />
    </>
  ),
  // The Long Con — an hourglass
  "explorers-m09": (
    <>
      <path d="M6 3h12M6 21h12" />
      <path d="M7 3c0 5 5 6 5 9s-5 4-5 9" />
      <path d="M17 3c0 5-5 6-5 9s5 4 5 9" />
    </>
  ),
  // Vishing — a phone with sound waves
  "explorers-m10": (
    <>
      <rect x="5" y="2.5" width="9" height="19" rx="2" />
      <path d="M9.5 18.5h0.01" />
      <path d="M17 8.5a4 4 0 0 1 0 7M19.5 6a8 8 0 0 1 0 12" />
    </>
  ),
  // Two-Factor — a shield with a check
  "explorers-m11": (
    <>
      <path d="M12 3l7 2.5V11c0 5-3 8-7 9.5-4-1.5-7-4.5-7-9.5V5.5z" />
      <path d="M9 11.5l2 2 4-4.5" />
    </>
  ),
  // Man in the Middle — two endpoints, an interceptor between
  "explorers-m12": (
    <>
      <circle cx="4" cy="12" r="2" />
      <circle cx="20" cy="12" r="2" />
      <path d="M6 12h3M15 12h3" />
      <path d="M12 7.5l3 4.5-3 4.5-3-4.5z" />
    </>
  ),
  // Backdoors — a door left ajar
  "explorers-m13": (
    <>
      <path d="M4 21h16" />
      <path d="M7 21V4l8-1.5V21" />
      <path d="M15 3.5l3 1.2V21" />
      <circle cx="12.5" cy="12" r="0.9" />
    </>
  ),
  // Trojan — a bug (malware)
  "explorers-m14": (
    <>
      <ellipse cx="12" cy="13" rx="4" ry="5" />
      <path d="M12 8V5" />
      <path d="M8.5 9.5L6 7.5M15.5 9.5L18 7.5" />
      <path d="M8 13H4M16 13h4" />
      <path d="M8.5 16.5L6 18.5M15.5 16.5L18 18.5" />
    </>
  ),
  // Spoofing — two identical overlapping windows
  "explorers-m15": (
    <>
      <rect x="3.5" y="6" width="12" height="10" rx="1.4" />
      <rect x="8.5" y="9" width="12" height="10" rx="1.4" />
    </>
  ),
  // Data Brokers — a database stack
  "explorers-m16": (
    <>
      <ellipse cx="12" cy="6" rx="7" ry="2.5" />
      <path d="M5 6v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" />
      <path d="M5 12v6c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5v-6" />
    </>
  ),
  // Deepfake — a face split real / synthetic
  "explorers-m17": (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v16" />
      <circle cx="8.5" cy="10.5" r="1" />
      <path d="M15 9.5h3M15 12.5h3M15 15.5h2" />
    </>
  ),
  // Black Hat — a fedora
  "explorers-m18": (
    <>
      <path d="M3 16.5c3.5 1.6 14.5 1.6 18 0" />
      <path d="M6 16.5c0-2.2 1-8.5 6-8.5s6 6.3 6 8.5" />
    </>
  ),
  // Attack Chain — interlocked links
  "explorers-m19": (
    <>
      <rect x="2.5" y="9.5" width="8.5" height="5" rx="2.5" />
      <rect x="8" y="9.5" width="8.5" height="5" rx="2.5" />
      <rect x="13.5" y="9.5" width="8" height="5" rx="2.5" />
    </>
  ),
  // Signal Zero — a radar crosshair
  "explorers-m20": (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 1.5v4M12 18.5v4M1.5 12h4M18.5 12h4" />
    </>
  ),
};

export function CaseGlyph({ id, size = 30, color = "currentColor" }: { id: string; size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {GLYPHS[id] ?? <circle cx="12" cy="12" r="7" />}
    </svg>
  );
}
