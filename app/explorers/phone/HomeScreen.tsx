"use client";

/**
 * The cold open for a fresh case: a plain phone home screen, like any other,
 * until the one icon that matters starts to glow. Tap it (or wait a beat)
 * and the screen zooms into it, straight into the lock screen underneath —
 * so each case announces what KIND of app this is (a DM thread, a social
 * feed, a wallet, a game chat, an incoming call) before a single message
 * is read, instead of every case opening on the same generic chat screen.
 * Skippable; never replays on a resumed case (see PhoneRuntime).
 */

import { useEffect, useState } from "react";
import type { PhoneAppKind } from "./case06";

const UI = `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif`;

const KIND_ICON: Record<PhoneAppKind, string> = {
  messaging: "💬",
  social: "📸",
  wallet: "💰",
  gamechat: "🎮",
  call: "📞",
};

const FILLER_APPS = [
  { icon: "📷", label: "Camera" },
  { icon: "🖼️", label: "Photos" },
  { icon: "⚙️", label: "Settings" },
  { icon: "🕐", label: "Clock" },
  { icon: "☀️", label: "Weather" },
  { icon: "📝", label: "Notes" },
  { icon: "🧮", label: "Calc" },
  { icon: "🗺️", label: "Maps" },
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

  const open = () => {
    if (zooming) return;
    setZooming(true);
    setTimeout(onDone, reduced ? 120 : 620);
  };

  // A beat to register "this is a normal phone", then the icon pulls focus
  // on its own — tapping it early just does the same thing sooner.
  useEffect(() => {
    const t = setTimeout(open, reduced ? 400 : 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const apps = [...FILLER_APPS.slice(0, 4), { icon: KIND_ICON[kind], label: appName, real: true }, ...FILLER_APPS.slice(4)];

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        padding: "28px 20px 24px",
        background: "radial-gradient(130% 90% at 50% 0%, #1a1a22 0%, #0a0a0c 70%)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 26 }}>
        <div style={{ fontFamily: UI, fontSize: 30, fontWeight: 300, color: "#F3F4F7" }}>9:41</div>
        <div style={{ fontFamily: UI, fontSize: 12.5, color: "#7a7a88", marginTop: 2 }}>Tuesday, 12 October</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px 14px", flex: 1 }}>
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
                gap: 5,
                background: "none",
                border: "none",
                cursor: isReal ? "pointer" : "default",
                padding: 0,
                transform: isReal && zooming ? "scale(7)" : "scale(1)",
                opacity: !isReal && zooming ? 0 : 1,
                transition: isReal ? "transform 600ms cubic-bezier(0.3,0,0,1)" : "opacity 300ms",
                zIndex: isReal ? 2 : 1,
              }}
            >
              <span
                aria-hidden
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 25,
                  background: isReal ? `linear-gradient(145deg, ${accent}, ${accent}aa)` : "rgba(255,255,255,0.06)",
                  boxShadow: isReal && !reduced ? `0 0 0 0 ${accent}66` : "none",
                  animation: isReal && !reduced && !zooming ? "homePulse 1.6s ease-in-out infinite" : "none",
                }}
              >
                {a.icon}
              </span>
              <span style={{ fontFamily: UI, fontSize: 10.5, color: isReal ? "#fff" : "#9A9AA6", fontWeight: isReal ? 700 : 500 }}>{a.label}</span>
            </button>
          );
        })}
      </div>

      <style>{`@keyframes homePulse { 0%, 100% { box-shadow: 0 0 0 0 ${accent}55; } 50% { box-shadow: 0 0 0 10px ${accent}00; } }`}</style>
    </div>
  );
}
