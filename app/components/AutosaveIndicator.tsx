"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";

/**
 * AutosaveIndicator — small "AUTOSAVED" pill that pops up in the
 * bottom-left for ~1.6s whenever the progression module writes to
 * localStorage. Real games show this kind of feedback; without it
 * the player has no signal that anything was persisted.
 *
 * Listens to a `storage` event AND a same-tab custom event because the
 * native `storage` event only fires on OTHER tabs. progression.ts
 * dispatches `algorithmx:autosave` after every save.
 */

const SHOW_MS = 1600;

export default function AutosaveIndicator() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const flash = () => {
      setVisible(true);
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(
        () => setVisible(false),
        SHOW_MS,
      );
    };
    const onCustom = () => flash();
    window.addEventListener("algorithmx:autosave", onCustom as EventListener);
    return () => {
      window.removeEventListener(
        "algorithmx:autosave",
        onCustom as EventListener,
      );
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  /* Keyframes once. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "ax-autosave-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-autosave-spin { 0% { transform: rotate(0); } 100% { transform: rotate(360deg); } }
@keyframes ax-autosave-in { 0% { opacity: 0; transform: translateX(-12px); } 100% { opacity: 1; transform: translateX(0); } }
@keyframes ax-autosave-out { 0% { opacity: 1; transform: translateX(0); } 100% { opacity: 0; transform: translateX(-8px); } }
`;
    document.head.appendChild(el);
  }, []);

  return (
    <div
      style={{
        ...hostStyle,
        animation: visible
          ? "ax-autosave-in 280ms ease-out both"
          : "ax-autosave-out 220ms ease-in both",
        pointerEvents: "none",
      }}
      aria-live="polite"
    >
      <span style={spinnerStyle} aria-hidden>
        <span style={spinnerInnerStyle} />
      </span>
      <span style={textStyle}>AUTOSAVED</span>
    </div>
  );
}

const hostStyle: CSSProperties = {
  position: "fixed",
  bottom: 18,
  left: 18,
  zIndex: 9400,
  display: "flex",
  alignItems: "center",
  gap: 8,
  padding: "8px 14px",
  background: "rgba(15,21,48,0.85)",
  border: "1px solid rgba(0,229,255,0.32)",
  borderRadius: 999,
  boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
  color: "#7df0ff",
  fontFamily: "system-ui, -apple-system, sans-serif",
  fontSize: 11,
  letterSpacing: 3,
  fontWeight: 800,
  textTransform: "uppercase",
};

const spinnerStyle: CSSProperties = {
  display: "inline-block",
  width: 12,
  height: 12,
  position: "relative",
  animation: "ax-autosave-spin 900ms linear infinite",
};

const spinnerInnerStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  borderRadius: "50%",
  border: "2px solid rgba(0,229,255,0.2)",
  borderTopColor: "#00e5ff",
};

const textStyle: CSSProperties = {
  whiteSpace: "nowrap",
};
