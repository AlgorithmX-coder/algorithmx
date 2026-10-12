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
 */

import { useState } from "react";
import type { PhoneAppKind } from "./case06";

const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

const KIND_ICON: Record<PhoneAppKind, string> = {
  messaging: "💬",
  social: "📸",
  wallet: "💰",
  gamechat: "🎮",
  call: "📞",
};

// Each filler app gets its own believable icon colour (a real home screen
// is never one flat grey tint repeated eight times).
const FILLER_APPS = [
  { icon: "📷", label: "Camera", bg: "linear-gradient(160deg, #3a3a42, #1c1c20)" },
  { icon: "🖼️", label: "Photos", bg: "linear-gradient(135deg, #FFD66B, #FF6B6B 55%, #C86DD7)" },
  { icon: "⚙️", label: "Settings", bg: "linear-gradient(160deg, #9a9aa4, #6c6c76)" },
  { icon: "🕐", label: "Clock", bg: "linear-gradient(160deg, #2c2c32, #111114)" },
  { icon: "☀️", label: "Weather", bg: "linear-gradient(180deg, #5FD0FB, #1D7FD6)" },
  { icon: "📝", label: "Notes", bg: "linear-gradient(160deg, #FFDE59, #F5B700)" },
  { icon: "🧮", label: "Calc", bg: "linear-gradient(160deg, #3a3a42, #1c1c20)" },
  { icon: "🗺️", label: "Maps", bg: "linear-gradient(135deg, #4ADE80, #0EA5E9)" },
];

export function HomeScreen({
  appName,
  kind,
  accent,
  reduced,
  onDone,
}: {
  appName: string;
  kind: PhoneAppKind;
  accent: string;
  reduced: boolean;
  onDone: () => void;
}) {
  const [zooming, setZooming] = useState(false);
  const duration = reduced ? 140 : 380;

  const open = () => {
    if (zooming) return;
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
        <div style={{ fontFamily: UI, fontSize: 30, fontWeight: 300, color: "#F3F4F7" }}>9:41</div>
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
                  lineHeight: 1,
                  fontSize: 30,
                  background: isReal ? `linear-gradient(145deg, ${accent}, ${accent}aa)` : a.bg,
                  boxShadow: isReal
                    ? !reduced
                      ? `0 4px 14px rgba(0,0,0,0.45), 0 0 0 0 ${accent}66`
                      : "0 4px 14px rgba(0,0,0,0.45)"
                    : "0 3px 10px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                  animation: isReal && !reduced && !zooming ? "homePulse 1.6s ease-in-out infinite" : "none",
                }}
              >
                <span style={{ transform: "translateY(0.5px)" }}>{a.icon}</span>
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
