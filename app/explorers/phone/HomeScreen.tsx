"use client";

/**
 * The cold open for a fresh case: a plain phone home screen, like any other,
 * until the one icon that matters starts to glow. Tap it — nothing auto-
 * advances, the glow is the only cue — and the whole screen dissolves into
 * the lock screen underneath, so each case announces what KIND of app this
 * is (a DM thread, a social feed, a wallet, a game chat, an incoming call)
 * before a single message is read, instead of every case opening on the
 * same generic chat screen. Never replays on a resumed case (see
 * PhoneRuntime).
 *
 * Icons are drawn SVG, not emoji: an emoji's own glyph metrics vary (the
 * camera emoji in particular sits visibly off-centre in its box on
 * Windows/Edge), so centering it with CSS alone isn't reliable. A 24x24
 * viewBox centers itself by construction.
 */

import { useState } from "react";
import { primeAudio } from "../engine/audio";
import { caseClockTime } from "./clock";
import type { PhoneAppKind } from "./case06";

const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

type GlyphKey = "camera" | "photos" | "settings" | "clock" | "weather" | "notes" | "calc" | "maps" | "messaging" | "social" | "wallet" | "gamechat" | "call";

function Glyph({ k }: { k: GlyphKey }) {
  switch (k) {
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
    case "clock":
      return (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
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
    case "messaging":
      // The speech-bubble tail pulls the drawn shape's own bounding box
      // left of the 24x24 frame's center (measured: 2px margin left, 4px
      // right), unlike every other glyph here which lands dead-centered —
      // that's what read as "not fixed" next to the others. Shifting the
      // whole glyph +1 right re-centers it without reshaping the bubble.
      return (
        <g transform="translate(1, 0)">
          <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8A2.5 2.5 0 0 1 17.5 17H10l-4.5 3.5V17h-1A2.5 2.5 0 0 1 2 14.5" />
          <circle cx="8.3" cy="10.3" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="10.3" r="1" fill="currentColor" stroke="none" />
          <circle cx="15.7" cy="10.3" r="1" fill="currentColor" stroke="none" />
        </g>
      );
    case "social":
      return (
        <>
          <rect x="3" y="3" width="18" height="18" rx="5.5" />
          <circle cx="12" cy="12" r="4.2" />
          <circle cx="17.1" cy="6.9" r="1.1" fill="currentColor" stroke="none" />
        </>
      );
    case "wallet":
      // Measured bbox sat 1px low in its 24x24 frame (same off-center class
      // of bug as "messaging" below) — shifted up to re-center.
      return (
        <g transform="translate(0, -0.5)">
          <rect x="3" y="6" width="18" height="13" rx="2.2" />
          <path d="M3 10.5h18" />
          <circle cx="16.8" cy="14.2" r="1.3" fill="currentColor" stroke="none" />
        </g>
      );
    case "gamechat":
      // Measured bbox sat ~1px left and ~2px high in its frame — the
      // controller's handles don't balance the body the way they look like
      // they should; shifted to re-center the actual drawn ink.
      return (
        <g transform="translate(-0.5, -1.1)">
          <path d="M6.5 9h11a3.5 3.5 0 0 1 3.4 4.3l-.6 2.4a2 2 0 0 1-3.6.6l-1-1.6a1.6 1.6 0 0 0-1.3-.7h-3.8a1.6 1.6 0 0 0-1.3.7l-1 1.6a2 2 0 0 1-3.6-.6l-.6-2.4A3.5 3.5 0 0 1 6.5 9z" />
          <path d="M8.3 11.3v2.6M7 12.6h2.6" />
          <circle cx="16" cy="12" r="0.9" fill="currentColor" stroke="none" />
          <circle cx="17.6" cy="13.6" r="0.9" fill="currentColor" stroke="none" />
        </g>
      );
    case "call":
      // Measured bbox sat slightly left and low in its frame — shifted to
      // re-center.
      return (
        <g transform="translate(0.4, -0.5)">
        <path d="M6.6 10.8c1.4 2.8 3.8 5.2 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25l3.1 1a1 1 0 0 1 .7.95v3.1a1 1 0 0 1-1.1 1C10.4 20.6 3.4 13.6 3 5.1A1 1 0 0 1 4 4h3.1a1 1 0 0 1 .95.7l1 3.1a1 1 0 0 1-.25 1z" />
        </g>
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

// Each filler app gets its own believable icon colour (a real home screen
// is never one flat grey tint repeated eight times).
const FILLER_APPS: { icon: GlyphKey; label: string; bg: string }[] = [
  { icon: "camera", label: "Camera", bg: "linear-gradient(160deg, #3a3a42, #1c1c20)" },
  { icon: "photos", label: "Photos", bg: "linear-gradient(135deg, #FFD66B, #FF6B6B 55%, #C86DD7)" },
  { icon: "settings", label: "Settings", bg: "linear-gradient(160deg, #9a9aa4, #6c6c76)" },
  { icon: "clock", label: "Clock", bg: "linear-gradient(160deg, #2c2c32, #111114)" },
  { icon: "weather", label: "Weather", bg: "linear-gradient(180deg, #5FD0FB, #1D7FD6)" },
  { icon: "notes", label: "Notes", bg: "linear-gradient(160deg, #FFDE59, #F5B700)" },
  { icon: "calc", label: "Calc", bg: "linear-gradient(160deg, #3a3a42, #1c1c20)" },
  { icon: "maps", label: "Maps", bg: "linear-gradient(135deg, #4ADE80, #0EA5E9)" },
];

export function HomeScreen({
  appName,
  kind,
  accent,
  reduced,
  onDone,
  caseId,
}: {
  appName: string;
  kind: PhoneAppKind;
  accent: string;
  reduced: boolean;
  onDone: () => void;
  caseId: string;
}) {
  const [zooming, setZooming] = useState(false);
  const duration = reduced ? 140 : 380;

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

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "28px 20px 24px",
        background: "radial-gradient(130% 90% at 50% 0%, #1a1a22 0%, #0a0a0c 70%)",
        opacity: zooming ? 0 : 1,
        transition: `opacity ${duration}ms ease`,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24, transition: "opacity 180ms ease", opacity: zooming ? 0 : 1 }}>
        <div style={{ fontFamily: UI, fontSize: 30, fontWeight: 300, color: "#F3F4F7" }}>{caseClockTime(caseId)}</div>
        <div style={{ fontFamily: UI, fontSize: 12.5, color: "#7a7a88", marginTop: 2 }}>Tuesday, 12 October</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "22px 12px", flex: 1 }}>
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
                transform: isReal && zooming ? "scale(2.6)" : "scale(1)",
                opacity: !isReal && zooming ? 0 : 1,
                transition: isReal ? `transform ${duration}ms cubic-bezier(0.3,0,0.2,1)` : "opacity 160ms ease",
                zIndex: isReal ? 2 : 1,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 17,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  background: isReal ? `linear-gradient(145deg, ${accent}, ${accent}aa)` : a.bg,
                  boxShadow: isReal
                    ? !reduced
                      ? `0 4px 14px rgba(0,0,0,0.45), 0 0 0 0 ${accent}66`
                      : "0 4px 14px rgba(0,0,0,0.45)"
                    : "0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                  animation: isReal && !reduced && !zooming ? "homePulse 1.6s ease-in-out infinite" : "none",
                }}
              >
                <svg viewBox="0 0 24 24" width={30} height={30} fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round">
                  <Glyph k={a.icon} />
                </svg>
              </span>
              <span style={{ fontFamily: UI, fontSize: 11, color: isReal ? "#fff" : "#B8B8C2", fontWeight: isReal ? 700 : 500 }}>{a.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`@keyframes homePulse { 0%, 100% { box-shadow: 0 4px 14px rgba(0,0,0,0.45), 0 0 0 0 ${accent}55; } 50% { box-shadow: 0 4px 14px rgba(0,0,0,0.45), 0 0 0 11px ${accent}00; } }`}</style>
    </div>
  );
}
