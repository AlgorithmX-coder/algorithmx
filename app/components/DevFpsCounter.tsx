"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Lightweight FPS overlay that only mounts in dev AND only when the user
 * has toggled it on - press `Ctrl + Shift + F` to show/hide. Rolling
 * 60-frame average, fixed top-right corner so it never obstructs UI chrome.
 */
export default function DevFpsCounter() {
  const [on, setOn] = useState(false);
  const [fps, setFps] = useState(60);
  const samplesRef = useRef<number[]>([]);
  const lastTimeRef = useRef<number>(performance.now());
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && (e.key === "F" || e.key === "f")) {
        e.preventDefault();
        setOn((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!on) return;
    let running = true;
    const tick = (now: number) => {
      if (!running) return;
      const dt = now - lastTimeRef.current;
      lastTimeRef.current = now;
      const inst = dt > 0 ? 1000 / dt : 60;
      const arr = samplesRef.current;
      arr.push(inst);
      if (arr.length > 60) arr.shift();
      if (arr.length >= 10 && arr.length % 10 === 0) {
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        setFps(Math.round(avg));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    lastTimeRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      running = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [on]);

  if (process.env.NODE_ENV === "production") return null;
  if (!on) return null;

  const colour = fps >= 55 ? "#4ade80" : fps >= 30 ? "#fbbf24" : "#ef4444";
  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        right: 8,
        zIndex: 99999,
        background: "rgba(4,6,14,0.85)",
        border: `1px solid ${colour}`,
        color: colour,
        fontFamily: "'Courier New', monospace",
        fontSize: 12,
        fontWeight: 700,
        padding: "4px 10px",
        borderRadius: 6,
        pointerEvents: "none",
        letterSpacing: 1,
      }}
      aria-hidden
    >
      {fps} FPS
    </div>
  );
}
