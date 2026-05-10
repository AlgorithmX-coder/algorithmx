"use client";

import { useEffect } from "react";

/**
 * FullscreenManager - global F key shortcut + state mirror that drives
 * the Fullscreen API. Real PC games support F11 / F to swap to
 * full-screen play; web kids' content rarely does, so it's a free
 * upgrade in perceived premium.
 *
 * Mounts a single keydown listener and toggles the document fullscreen
 * state. Honours typing context (input/textarea/contenteditable) so
 * pressing F inside a name field doesn't accidentally fullscreen.
 *
 * Exposes `requestFullscreen()` / `exitFullscreen()` so the settings
 * panel can drive it from a button as well.
 */

export function isFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  return Boolean(document.fullscreenElement);
}

export async function enterFullscreen(): Promise<void> {
  if (typeof document === "undefined") return;
  if (document.fullscreenElement) return;
  try {
    await document.documentElement.requestFullscreen();
  } catch {
    /* User declined / browser denied - silent. */
  }
}

export async function exitFullscreen(): Promise<void> {
  if (typeof document === "undefined") return;
  if (!document.fullscreenElement) return;
  try {
    await document.exitFullscreen();
  } catch {
    /* ignore */
  }
}

export async function toggleFullscreen(): Promise<void> {
  if (isFullscreen()) {
    await exitFullscreen();
  } else {
    await enterFullscreen();
  }
}

export default function FullscreenManager() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "f" && e.key !== "F") return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      void toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return null;
}
