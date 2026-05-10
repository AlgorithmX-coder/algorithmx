"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { playSound } from "@/app/lib/sounds";

/**
 * AchievementToast - Steam / Xbox style slide-in notifications.
 *
 * Mount once near the root of the lesson shell. Anywhere in the app,
 * call `fireAchievement({...})` (or `window.__axAchievement__(...)`)
 * to push a toast onto the queue. Toasts stack vertically in the
 * bottom-right corner, slide in with a slight scale-up bounce, hold
 * for `duration` ms, then slide out.
 *
 * Designed to sit visually above content but below the pause menu
 * (zIndex 9500 vs the menu's 10000).
 */

export interface Achievement {
  /** Stable key - used to dedupe a rapid double-fire. */
  id: string;
  /** Top kicker line - usually "ACHIEVEMENT UNLOCKED" / "STREAK +5" / "BADGE EARNED". */
  kicker: string;
  /** Bold main title - the achievement name. */
  title: string;
  /** Optional subline / description. */
  subtitle?: string;
  /** Emoji or single character shown in the icon disc. */
  icon: string;
  /** Hex accent - drives the icon ring + glow. */
  accent: string;
  /** Time on screen in ms before sliding out. Default 4000. */
  duration?: number;
  /** Optional sound key to play on appear. Default "badgeEarned". */
  sound?: string;
}

type ToastInternal = Achievement & {
  /** Internal ordering id so duplicate user-supplied ids still queue. */
  uid: number;
  visible: boolean;
};

const GLOBAL_KEY = "__axAchievement__";

declare global {
  interface Window {
    __axAchievement__?: (a: Achievement) => void;
  }
}

/**
 * Fire an achievement toast from anywhere in the codebase. No-op when
 * the host hasn't been mounted yet.
 */
export function fireAchievement(a: Achievement): void {
  if (typeof window === "undefined") return;
  const fn = window[GLOBAL_KEY];
  if (typeof fn === "function") fn(a);
}

let nextUid = 1;

export default function AchievementToastHost() {
  const [toasts, setToasts] = useState<ToastInternal[]>([]);
  const recentIdsRef = useRef<Map<string, number>>(new Map());
  /* Track every pending timeout so we can clear them all on unmount -
   * otherwise a long-duration toast scheduled just before navigation
   * fires `setToasts` after this component is gone (React 18 swallows
   * the warning, but it's still wasted work). */
  const timersRef = useRef<Set<number>>(new Set());

  const push = useCallback((a: Achievement) => {
    /* Dedupe: ignore the same id within 1.2s - protects against a
     * double-fire from React strict mode dev re-renders. */
    const now = Date.now();
    const last = recentIdsRef.current.get(a.id);
    if (last && now - last < 1200) return;
    recentIdsRef.current.set(a.id, now);

    const uid = nextUid++;
    const duration = a.duration ?? 4000;
    const toast: ToastInternal = { ...a, uid, visible: true };

    setToasts((current) => [...current, toast]);

    /* Play the sound. We don't await - fire and forget. */
    try {
      playSound(a.sound ?? "badgeEarned");
    } catch {
      /* ignore */
    }

    /* Schedule the exit. The 320ms tail covers the slide-out animation
     * before we actually drop it from the array so React's reconciler
     * runs the leave transition. */
    const exitTimer = window.setTimeout(() => {
      timersRef.current.delete(exitTimer);
      setToasts((current) =>
        current.map((t) =>
          t.uid === uid ? { ...t, visible: false } : t,
        ),
      );
      const dropTimer = window.setTimeout(() => {
        timersRef.current.delete(dropTimer);
        setToasts((current) => current.filter((t) => t.uid !== uid));
      }, 360);
      timersRef.current.add(dropTimer);
    }, duration);
    timersRef.current.add(exitTimer);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window[GLOBAL_KEY] = push;
    const timers = timersRef.current;
    return () => {
      if (window[GLOBAL_KEY] === push) {
        delete window[GLOBAL_KEY];
      }
      /* Clear any in-flight slide-out / drop timeouts so callbacks
       * don't fire on an unmounted component. */
      timers.forEach((id) => window.clearTimeout(id));
      timers.clear();
    };
  }, [push]);

  /* Keyframes once. */
  useEffect(() => {
    if (typeof document === "undefined") return;
    const id = "ax-achievement-keyframes";
    if (document.getElementById(id)) return;
    const el = document.createElement("style");
    el.id = id;
    el.textContent = `
@keyframes ax-toast-in {
  0% { opacity: 0; transform: translateX(40px) scale(0.92); }
  60% { opacity: 1; transform: translateX(-6px) scale(1.02); }
  100% { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes ax-toast-out {
  0% { opacity: 1; transform: translateX(0) scale(1); }
  100% { opacity: 0; transform: translateX(20px) scale(0.96); }
}
@keyframes ax-toast-shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(120%); }
}
@keyframes ax-toast-pulse {
  0%,100% { box-shadow: 0 0 0 0 var(--ax-toast-accent), 0 12px 36px rgba(0,0,0,0.45); }
  50% { box-shadow: 0 0 0 6px transparent, 0 12px 48px rgba(0,0,0,0.5); }
}
`;
    document.head.appendChild(el);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div style={hostStyle}>
      {toasts.map((t) => (
        <ToastCard key={t.uid} toast={t} />
      ))}
    </div>
  );
}

function ToastCard({ toast }: { toast: ToastInternal }) {
  const accent = toast.accent;
  return (
    <div
      style={{
        ...cardStyle,
        animation: toast.visible
          ? "ax-toast-in 360ms cubic-bezier(0.16,1,0.3,1) both, ax-toast-pulse 2.4s ease-in-out infinite"
          : "ax-toast-out 320ms ease-in both",
        borderColor: `${accent}66`,
        boxShadow: `0 12px 40px ${accent}44, 0 0 0 1px ${accent}33 inset`,
        ["--ax-toast-accent" as string]: `${accent}66`,
      }}
    >
      <div style={shimmerWrapStyle} aria-hidden>
        <div
          style={{
            ...shimmerStyle,
            background: `linear-gradient(90deg, transparent, ${accent}55, transparent)`,
          }}
        />
      </div>

      <div
        style={{
          ...iconDiscStyle,
          background: `radial-gradient(circle at 30% 30%, ${accent}, ${accent}55 70%, transparent)`,
          boxShadow: `0 0 24px ${accent}88, inset 0 0 12px ${accent}66`,
        }}
      >
        <span style={iconGlyphStyle}>{toast.icon}</span>
      </div>

      <div style={textColStyle}>
        <div style={{ ...kickerStyle, color: accent }}>{toast.kicker}</div>
        <div style={titleStyle}>{toast.title}</div>
        {toast.subtitle && (
          <div style={subtitleStyle}>{toast.subtitle}</div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── STYLES ─────────────────────────── */

const hostStyle: CSSProperties = {
  position: "fixed",
  bottom: 24,
  right: 24,
  zIndex: 9500,
  display: "flex",
  flexDirection: "column",
  gap: 10,
  pointerEvents: "none",
  fontFamily: "system-ui, -apple-system, sans-serif",
};

const cardStyle: CSSProperties = {
  position: "relative",
  width: 360,
  maxWidth: "calc(100vw - 48px)",
  display: "flex",
  alignItems: "center",
  gap: 14,
  padding: "14px 18px",
  background:
    "linear-gradient(135deg, rgba(15,21,48,0.95) 0%, rgba(10,8,32,0.98) 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 14,
  color: "#e8edff",
  pointerEvents: "auto",
  overflow: "hidden",
  willChange: "transform, opacity",
};

const shimmerWrapStyle: CSSProperties = {
  position: "absolute",
  inset: 0,
  overflow: "hidden",
  pointerEvents: "none",
};

const shimmerStyle: CSSProperties = {
  position: "absolute",
  top: 0,
  left: 0,
  width: "60%",
  height: "100%",
  animation: "ax-toast-shimmer 2.6s ease-in-out infinite",
  opacity: 0.7,
};

const iconDiscStyle: CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: "50%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const iconGlyphStyle: CSSProperties = {
  fontSize: 28,
  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))",
};

const textColStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 2,
  flex: 1,
  minWidth: 0,
};

const kickerStyle: CSSProperties = {
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 3,
  textTransform: "uppercase",
};

const titleStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  letterSpacing: 0.5,
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const subtitleStyle: CSSProperties = {
  fontSize: 12,
  color: "rgba(232,237,255,0.65)",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};
