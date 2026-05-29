"use client";

/**
 * Narration block for reading-heavy info screens.
 *
 * Renders Adam's (or Layla's) lines as short caption bullets and
 * exposes a "Tap to hear" button that uses the Web Speech API to read
 * them aloud. Auto-read fires on mount when the user has not muted
 * narration; the user can mute via the toggle.
 *
 * If speechSynthesis is not available (Safari iOS in some contexts,
 * older browsers), the button is still rendered but its onClick is a
 * no-op visual press - the captions themselves are the fallback.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useComfortMode } from "@/app/lib/comfortMode";

export interface InfoNarrationProps {
  /** Short lines read in order. Keep each ≤ 12 words. */
  lines: string[];
  /**
   * Legacy speaker hint. Character avatars were removed from
   * narration UI; this only affects the synthesized-voice pitch now
   * (Layla slightly higher than Adam) so existing call sites keep
   * their voice flavour without showing a character image.
   */
  speaker?: "adam" | "layla";
  /** Auto-play on mount. Defaults to true; user toggle overrides. */
  autoPlay?: boolean;
}

const NARRATION_PREF_KEY = "algorithmx-narration-on-v1";

function readPref(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(NARRATION_PREF_KEY);
    return raw === null ? true : raw === "true";
  } catch {
    return true;
  }
}

function writePref(value: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NARRATION_PREF_KEY, String(value));
  } catch {
    /* noop */
  }
}

export default function InfoNarration({
  lines,
  speaker = "adam",
  autoPlay = true,
}: InfoNarrationProps) {
  const comfort = useComfortMode();
  const [enabled, setEnabled] = useState<boolean>(true);
  const [speaking, setSpeaking] = useState<boolean>(false);
  const [activeLine, setActiveLine] = useState<number>(-1);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    setEnabled(readPref());
  }, []);

  const stop = useCallback(() => {
    if (!supported) return;
    try {
      window.speechSynthesis.cancel();
    } catch {
      /* noop */
    }
    setSpeaking(false);
    setActiveLine(-1);
  }, [supported]);

  const speak = useCallback(() => {
    if (!supported || lines.length === 0) return;
    stop();
    const text = lines.join(". ");
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = comfort.enabled ? 0.9 : 1.0;
    utter.pitch = speaker === "layla" ? 1.15 : 0.95;
    utter.volume = 1;
    utter.onstart = () => {
      setSpeaking(true);
      setActiveLine(0);
    };
    utter.onend = () => {
      setSpeaking(false);
      setActiveLine(-1);
    };
    utter.onerror = () => {
      setSpeaking(false);
      setActiveLine(-1);
    };
    utteranceRef.current = utter;
    try {
      window.speechSynthesis.speak(utter);
    } catch {
      setSpeaking(false);
    }
  }, [supported, lines, comfort.enabled, speaker, stop]);

  // Auto-play on mount when enabled.
  useEffect(() => {
    if (!autoPlay || !enabled || !supported) return;
    const id = window.setTimeout(speak, 400);
    return () => {
      window.clearTimeout(id);
      stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Stop speech when unmounting / navigating away.
  useEffect(() => () => stop(), [stop]);

  const toggleEnabled = () => {
    const next = !enabled;
    setEnabled(next);
    writePref(next);
    if (!next) stop();
    else speak();
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        padding: 14,
        background: "rgba(15, 21, 48, 0.65)",
        border: "1px solid rgba(125, 240, 255, 0.25)",
        borderRadius: 14,
        marginBottom: 16,
      }}
    >
      <div
        aria-hidden
        style={{
          width: 48,
          height: 48,
          minWidth: 48,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          border: "2px solid #7df0ff",
          boxShadow: speaking
            ? "0 0 18px rgba(125, 240, 255, 0.6)"
            : "0 0 0 1px rgba(125, 240, 255, 0.25) inset",
          background:
            "radial-gradient(circle at 30% 30%, #1a2147 0%, #0a0f24 70%)",
          flexShrink: 0,
          transition: "box-shadow 200ms ease-out",
          fontSize: 22,
          color: "#7df0ff",
          filter: speaking
            ? "drop-shadow(0 0 6px rgba(125, 240, 255, 0.8))"
            : undefined,
        }}
      >
        <span>♪</span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 6,
            gap: 8,
          }}
        >
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800,
              fontSize: 10,
              letterSpacing: "0.14em",
              color: "#7df0ff",
              textTransform: "uppercase",
            }}
          >
            Narration
          </span>
          {supported && (
            <button
              type="button"
              onClick={speaking ? stop : speak}
              aria-label={speaking ? "Stop narration" : "Read aloud"}
              style={{
                background: speaking
                  ? "linear-gradient(135deg, #ff5fb3, #7c5cff)"
                  : "linear-gradient(135deg, #00e5ff, #7c5cff)",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 800,
                cursor: "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {speaking ? "■ Stop" : "▶ Read aloud"}
            </button>
          )}
        </div>

        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            color: "#e7ecff",
            fontFamily:
              "ui-rounded, 'Fredoka', 'Quicksand', system-ui, -apple-system, sans-serif",
            fontSize: 14,
            lineHeight: 1.4,
          }}
        >
          {lines.map((l, i) => (
            <li
              key={i}
              style={{
                paddingLeft: 14,
                position: "relative",
                opacity: activeLine === i ? 1 : speaking ? 0.65 : 1,
                transition: "opacity 200ms ease-out",
              }}
            >
              <span
                aria-hidden
                style={{
                  position: "absolute",
                  left: 0,
                  top: 8,
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#7df0ff",
                  boxShadow: "0 0 6px rgba(125, 240, 255, 0.6)",
                }}
              />
              {l}
            </li>
          ))}
        </ul>

        {supported && (
          <button
            type="button"
            onClick={toggleEnabled}
            style={{
              marginTop: 8,
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: 11,
              cursor: "pointer",
              padding: 0,
              textDecoration: "underline",
            }}
          >
            {enabled ? "Auto-read is on" : "Auto-read is off"}
          </button>
        )}
      </div>
    </div>
  );
}
