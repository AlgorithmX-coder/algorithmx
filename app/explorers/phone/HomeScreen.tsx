"use client";

/**
 * The cold open for a fresh case: a phone home screen, until the one icon
 * that matters starts to glow. Tap it — nothing auto-advances, the glow is
 * the only cue — and the whole screen dissolves into the lock screen
 * underneath, so each case announces what KIND of app this is (a DM thread,
 * a social feed, a wallet, a game chat, an incoming call) before a single
 * message is read. Never replays on a resumed case (see PhoneRuntime).
 *
 * ARC FIELD OS — a full redesign (owner, 2026-10-26): the old flat 3-tone
 * icon grid is gone. This is now a fictional field-issued phone OS —
 * dynamic-island status pill, glass squircle icons, a status widget that
 * carries the game's own ARC branding — "look like an Apple, but it's not
 * going to be an Apple". Same shell for all five Block 2 cases; only the
 * accent, wallpaper glow and the one glowing app change per case.
 *
 * The messaging/social/wallet/gamechat/call glyphs below are the THIRD
 * rebuild of this icon set (see git history on this file): every previous
 * version was a thin stroke-outline path that someone then had to hand-
 * nudge a pixel or two to "fix" its optical center, and every one of those
 * fixes was eventually reported as still wrong. These five are drawn
 * left-right symmetric about x=12 by construction (mirrored pairs of
 * circles/arcs, a tail centered under a bubble) — there is no centroid to
 * get wrong, because there is nothing asymmetric to balance. The seven
 * filler glyphs (camera, photos, settings, weather, notes, calc, maps) were
 * never flagged as off-centre, so they're unchanged.
 */

import { useState } from "react";
import { primeAudio } from "../engine/audio";
import { caseClockTime } from "./clock";
import type { PhoneAppKind } from "./case06";

const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const n = parseInt(v, 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

type GlyphKey = "camera" | "photos" | "settings" | "weather" | "notes" | "calc" | "maps" | "alerts" | "messaging" | "social" | "wallet" | "gamechat" | "call";

function Glyph({ k }: { k: GlyphKey }) {
  switch (k) {
    // --- filler glyphs: unchanged, never flagged as off-centre ---
    case "camera":
      return (
        <>
          <path d="M8.5 7l.8-1.6A1 1 0 0 1 10.2 5h3.6a1 1 0 0 1 .9.6L15.5 7" />
          <rect x="3" y="7" width="18" height="12.5" rx="2.4" />
          <circle cx="12" cy="13.2" r="3.4" />
        </>
      );
    case "photos":
      return (
        <>
          <rect x="3" y="4" width="18" height="16" rx="2.2" />
          <circle cx="8.3" cy="9.3" r="1.6" fill="currentColor" stroke="none" />
          <path d="M4 16.5l5-5 3.5 3.5 2.5-2.5 5 4.5" />
        </>
      );
    case "settings":
      return (
        <>
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M18 6l-1.6 1.6M7.6 16.4L6 18M18 18l-1.6-1.6M7.6 7.6L6 6" />
        </>
      );
    case "weather":
      return (
        <>
          <circle cx="12" cy="12" r="5" fill="currentColor" fillOpacity={0.2} />
          <circle cx="12" cy="12" r="5" />
          <path d="M12 2.5v2.3M12 19.2v2.3M21.5 12h-2.3M4.8 12H2.5M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6M18.8 18.8l-1.6-1.6M6.8 6.8L5.2 5.2" />
        </>
      );
    case "notes":
      return (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <path d="M8.5 8.5h7M8.5 12h7M8.5 15.5h4.5" />
        </>
      );
    case "calc":
      return (
        <>
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <rect x="7.3" y="5.3" width="9.4" height="3.6" rx="0.8" fill="currentColor" fillOpacity={0.25} />
          <circle cx="8.3" cy="13" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12" cy="13" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="15.7" cy="13" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="8.3" cy="16.4" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="12" cy="16.4" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="15.7" cy="16.4" r="0.9" fill="currentColor" stroke="none" />
        </>
      );
    case "maps":
      return (
        <>
          <path d="M12 21s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" />
          <circle cx="12" cy="9" r="2.6" fill="currentColor" fillOpacity={0.25} />
        </>
      );
    case "alerts":
      // A bell — symmetric about x=12 by construction.
      return (
        <>
          <path d="M12 5a7 7 0 0 1 7 7v3.5l1.4 2.1a.8.8 0 0 1-.66 1.24H4.26a.8.8 0 0 1-.66-1.24L5 15.5V12a7 7 0 0 1 7-7z" />
          <circle cx="12" cy="19.3" r="1.3" fill="currentColor" stroke="none" />
        </>
      );

    // --- the five "real app" glyphs: filled, symmetric about x=12 ---
    case "messaging":
      return (
        <>
          <rect x="3" y="4" width="18" height="14" rx="6" fill="currentColor" stroke="none" />
          <path d="M10 17h4l-2 4z" fill="currentColor" stroke="none" />
          <circle cx="8.3" cy="11" r="1.15" fill="#0008" stroke="none" />
          <circle cx="12" cy="11" r="1.15" fill="#0008" stroke="none" />
          <circle cx="15.7" cy="11" r="1.15" fill="#0008" stroke="none" />
        </>
      );
    case "social":
      // Two rings side by side — an endless loop, mirrored about x=12.
      return (
        <>
          <circle cx="8.3" cy="12" r="5.1" fill="none" stroke="currentColor" strokeWidth={2.4} />
          <circle cx="15.7" cy="12" r="5.1" fill="none" stroke="currentColor" strokeWidth={2.4} />
        </>
      );
    case "wallet":
      // Card + full-width stripe + centred chip — symmetric about x=12.
      return (
        <>
          <rect x="2.5" y="6" width="19" height="13" rx="3" fill="currentColor" stroke="none" />
          <rect x="2.5" y="9.8" width="19" height="3" fill="#0008" stroke="none" />
          <circle cx="12" cy="15.6" r="1.7" fill="#0008" stroke="none" />
        </>
      );
    case "gamechat":
      // Two overlapping filled circles with a spark at the seam — a bond.
      return (
        <>
          <circle cx="9.3" cy="12" r="6.1" fill="currentColor" fillOpacity={0.62} stroke="none" />
          <circle cx="14.7" cy="12" r="6.1" fill="currentColor" fillOpacity={0.62} stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
        </>
      );
    case "call":
      // Centre dot + two mirrored pairs of ring-waves — symmetric about x=12.
      return (
        <>
          <circle cx="12" cy="12" r="3" fill="currentColor" stroke="none" />
          <path d="M6.3 7a9 9 0 0 0 0 10" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          <path d="M17.7 7a9 9 0 0 1 0 10" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
          <path d="M3 3.5a14 14 0 0 0 0 17" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity={0.55} />
          <path d="M21 3.5a14 14 0 0 1 0 17" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" opacity={0.55} />
        </>
      );
  }
}

const KIND_ICON: Record<PhoneAppKind, GlyphKey> = {
  messaging: "messaging",
  social: "social",
  wallet: "wallet",
  gamechat: "gamechat",
  call: "call",
};

const KIND_STATUS: Record<PhoneAppKind, string> = {
  messaging: "secure line open",
  social: "feed syncing",
  wallet: "wallet unlocked",
  gamechat: "party open",
  call: "incoming call",
};

// Each filler app gets its own believable icon colour (a real home screen
// is never one flat grey tint repeated eight times).
const FILLER_APPS: { icon: GlyphKey; label: string; bg: string }[] = [
  { icon: "alerts", label: "Alerts", bg: "linear-gradient(160deg, #3a3a42, #1c1c20)" },
  { icon: "photos", label: "Photos", bg: "linear-gradient(135deg, #FFD66B, #FF6B6B 55%, #C86DD7)" },
  { icon: "settings", label: "Settings", bg: "linear-gradient(160deg, #9a9aa4, #6c6c76)" },
  { icon: "weather", label: "Weather", bg: "linear-gradient(180deg, #5FD0FB, #1D7FD6)" },
  { icon: "notes", label: "Notes", bg: "linear-gradient(160deg, #FFDE59, #F5B700)" },
  { icon: "calc", label: "Calc", bg: "linear-gradient(160deg, #3a3a42, #1c1c20)" },
  { icon: "maps", label: "Maps", bg: "linear-gradient(135deg, #4ADE80, #0EA5E9)" },
  { icon: "camera", label: "Camera", bg: "linear-gradient(160deg, #3a3a42, #1c1c20)" },
];

export function HomeScreen({
  appName,
  kind,
  accent,
  accentHi,
  reduced,
  onDone,
  caseId,
}: {
  appName: string;
  kind: PhoneAppKind;
  accent: string;
  accentHi?: string;
  reduced: boolean;
  onDone: () => void;
  caseId: string;
}) {
  const [zooming, setZooming] = useState(false);
  const duration = reduced ? 140 : 380;
  const hi = accentHi ?? accent;
  const accRGB = hexToRgb(accent);

  const open = () => {
    if (zooming) return;
    // Synchronous, inside this exact tap handler — some mobile browsers only
    // honour an autoplay unlock when it runs in the same gesture that
    // triggers it, and this tap is the first one on a fresh case, well
    // before any narration tries to play.
    primeAudio();
    setZooming(true);
    setTimeout(onDone, duration);
  };

  const apps = [...FILLER_APPS.slice(0, 4), { icon: KIND_ICON[kind], label: appName, bg: "", real: true }, ...FILLER_APPS.slice(4)];
  const m = /m(\d+)$/.exec(caseId);
  const caseNo = m ? `Case ${m[1].padStart(3, "0")}` : "Field case";

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "22px 20px 18px",
        background: `radial-gradient(640px 420px at 18% -4%, rgba(${accRGB},0.22), rgba(${accRGB},0) 60%),
          radial-gradient(520px 460px at 100% 18%, rgba(${hexToRgb(hi)},0.14), rgba(${hexToRgb(hi)},0) 55%),
          radial-gradient(130% 90% at 50% 0%, #1a1a22 0%, #0a0a0c 70%)`,
        opacity: zooming ? 0 : 1,
        transition: `opacity ${duration}ms ease`,
        position: "relative",
      }}
    >
      {/* status row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: UI, fontSize: 12.5, fontWeight: 600, color: "#F3F4F7", opacity: zooming ? 0 : 1, transition: "opacity 180ms ease" }}>
        <span>{caseClockTime(caseId)}</span>
        <span style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: 5, background: "#000", borderRadius: 999, padding: "5px 12px 5px 8px", boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
          <svg width="9" height="9" viewBox="0 0 24 24" aria-hidden><path d="M12 2l3.6 6.3 7 1-5.1 5 1.2 7-6.7-3.5-6.7 3.5 1.2-7-5.1-5 7-1z" fill={accent} /></svg>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: "#F3F4F7" }}>ARC</span>
        </span>
        <svg width="16" height="11" viewBox="0 0 24 16" aria-hidden>
          <rect x="1" y="1" width="19" height="14" rx="3" stroke="#F3F4F7" strokeWidth="1.4" fill="none" />
          <rect x="3" y="3" width="13" height="10" rx="1.5" fill="#F3F4F7" />
          <rect x="21.5" y="5" width="2" height="6" rx="1" fill="#F3F4F7" />
        </svg>
      </div>

      {/* big clock */}
      <div style={{ textAlign: "center", marginTop: 24, transition: "opacity 180ms ease", opacity: zooming ? 0 : 1 }}>
        <div style={{ fontFamily: UI, fontSize: 54, fontWeight: 200, color: "#F3F4F7", letterSpacing: "-0.01em" }}>{caseClockTime(caseId)}</div>
        <div style={{ fontFamily: UI, fontSize: 12.5, color: "#9A9AA6", marginTop: 4 }}>Tuesday, 12 October</div>
      </div>

      {/* ARC field-OS status widget */}
      <div
        style={{
          marginTop: 16,
          background: "linear-gradient(160deg, rgba(255,255,255,0.09), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.12)",
          borderRadius: 18,
          padding: "11px 14px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          opacity: zooming ? 0 : 1,
          transition: "opacity 180ms ease",
        }}
      >
        <div>
          <div style={{ fontFamily: UI, fontSize: 9, fontWeight: 700, letterSpacing: "0.16em", color: hi }}>ARC FIELD OS</div>
          <div style={{ fontFamily: UI, fontSize: 12, fontWeight: 600, color: "#F3F4F7", marginTop: 2 }}>{caseNo} · {KIND_STATUS[kind]}</div>
        </div>
        <span aria-hidden style={{ width: 7, height: 7, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}`, animation: !reduced ? "hs2Dot 1.4s ease-in-out infinite" : "none" }} />
      </div>

      {/* app grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px 10px", flex: 1, marginTop: 22 }}>
        {apps.map((a, i) => {
          const isReal = "real" in a && a.real;
          return (
            <button
              key={i}
              onClick={isReal ? open : undefined}
              aria-label={isReal ? `Open ${a.label}` : a.label}
              disabled={!isReal}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 6,
                background: "none",
                border: "none",
                cursor: isReal ? "pointer" : "default",
                padding: 0,
                transform: isReal && zooming ? "scale(2.6)" : isReal ? "scale(1.06)" : "scale(1)",
                opacity: !isReal && zooming ? 0 : 1,
                transition: isReal ? `transform ${duration}ms cubic-bezier(0.3,0,0.2,1)` : "opacity 160ms ease",
                zIndex: isReal ? 2 : 1,
                position: "relative",
              }}
            >
              {isReal && (
                <span aria-hidden style={{ position: "absolute", top: -4, right: -2, width: 8, height: 8, borderRadius: "50%", background: accent, boxShadow: `0 0 8px ${accent}`, animation: !reduced && !zooming ? "hs2Dot 1.4s ease-in-out infinite" : "none", zIndex: 3 }} />
              )}
              <span
                aria-hidden
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 17,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: isReal ? "#fff" : "#E7E2E8",
                  background: isReal ? `linear-gradient(155deg, ${hi}, ${accent} 60%, ${accent})` : a.bg,
                  border: isReal ? "none" : "1px solid rgba(255,255,255,0.10)",
                  boxShadow: isReal
                    ? !reduced && !zooming
                      ? `0 0 0 0 rgba(${accRGB},0.45), 0 10px 22px -6px rgba(${accRGB},0.55)`
                      : `0 10px 22px -6px rgba(${accRGB},0.55)`
                    : "0 6px 14px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.14)",
                  animation: isReal && !reduced && !zooming ? "hs2Pulse 2.4s ease-in-out infinite" : "none",
                }}
              >
                <svg viewBox="0 0 24 24" width={26} height={26} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                  <Glyph k={a.icon} />
                </svg>
              </span>
              <span style={{ fontFamily: UI, fontSize: 10.5, color: isReal ? hi : "#B8B8C2", fontWeight: isReal ? 700 : 500 }}>{a.label}</span>
            </button>
          );
        })}
      </div>

      {/* dock — same four, every case; only the grid's one app changes */}
      <div
        style={{
          marginTop: 18,
          background: "linear-gradient(160deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))",
          border: "1px solid rgba(255,255,255,0.10)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.14), 0 10px 26px rgba(0,0,0,0.4)",
          borderRadius: 24,
          padding: "11px 16px",
          display: "flex",
          justifyContent: "space-around",
          opacity: zooming ? 0 : 1,
          transition: "opacity 180ms ease",
        }}
        aria-hidden
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#E7E2E8"><circle cx="12" cy="12" r="3" /><path d="M6.3 7a9 9 0 0 0 0 10" stroke="#E7E2E8" strokeWidth={1.8} strokeLinecap="round" fill="none" /><path d="M17.7 7a9 9 0 0 1 0 10" stroke="#E7E2E8" strokeWidth={1.8} strokeLinecap="round" fill="none" /></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E7E2E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9" /><path d="M8.5 15.5l7-7M9.2 8.6l6.2 1.6-1.6 6.2z" fill="#E7E2E8" stroke="none" /></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E7E2E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8.5 7l.8-1.6A1 1 0 0 1 10.2 5h3.6a1 1 0 0 1 .9.6L15.5 7" /><rect x="3" y="7" width="18" height="12.5" rx="3" /><circle cx="12" cy="13.2" r="3.4" /></svg>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E7E2E8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3.2" /><path d="M12 3.5v2.3M12 18.2v2.3M20.5 12h-2.3M5.8 12H3.5M18 6l-1.6 1.6M7.6 16.4L6 18M18 18l-1.6-1.6M7.6 7.6L6 6" /></svg>
      </div>

      <style>{`
        @keyframes hs2Pulse { 0%, 100% { box-shadow: 0 0 0 0 rgba(${accRGB},0.45), 0 10px 22px -6px rgba(${accRGB},0.55); } 50% { box-shadow: 0 0 0 10px rgba(${accRGB},0), 0 10px 22px -6px rgba(${accRGB},0.55); } }
        @keyframes hs2Dot { 0%, 100% { opacity: 1; } 50% { opacity: 0.35; } }
      `}</style>
    </div>
  );
}
