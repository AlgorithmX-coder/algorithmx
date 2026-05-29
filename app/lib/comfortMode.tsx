"use client";

/**
 * Comfort mode - a single per-user switch that reduces motion, removes
 * harsh effects, slows down timed games and caps simultaneous moving
 * targets. Persists to localStorage AND to the server-side
 * UserPreference table so the setting follows the child across
 * devices. Respects prefers-reduced-motion as a default-on signal.
 *
 * Exercise components read `useComfortMode()` and adjust their own
 * pacing/effects; this hook does not enforce anything globally.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  getPreferences,
  savePreferences,
} from "@/app/lib/preferences.actions";

const STORAGE_KEY = "algorithmx-comfort-mode-v1";

interface ComfortModeValue {
  /** True when the child should get the slower/calmer experience. */
  enabled: boolean;
  /** True when the OS-level prefers-reduced-motion is set. */
  prefersReducedMotion: boolean;
  /** Toggle the user-controlled switch. */
  toggle: () => void;
  /** Force a value (used by the HUD button). */
  setEnabled: (next: boolean) => void;
}

const ComfortModeContext = createContext<ComfortModeValue | null>(null);

function readStored(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === "true") return true;
    if (raw === "false") return false;
    return null;
  } catch {
    return null;
  }
}

function readReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ComfortModeProvider({ children }: { children: ReactNode }) {
  const [prefersReducedMotion, setPRM] = useState<boolean>(false);
  const [userEnabled, setUserEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    setPRM(readReducedMotion());
    setUserEnabled(readStored());

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setPRM(mq.matches);
    mq.addEventListener?.("change", onChange);

    // Hydrate from the server (UserPreference) if the user is signed
    // in. Fails silently on anonymous routes - localStorage is the
    // fallback. Server value wins over localStorage so a child can
    // switch tablets and not lose their setting.
    let cancelled = false;
    void getPreferences()
      .then((prefs) => {
        if (cancelled || !prefs) return;
        setUserEnabled(prefs.comfortMode);
        try {
          window.localStorage.setItem(STORAGE_KEY, String(prefs.comfortMode));
        } catch {
          /* noop */
        }
      })
      .catch(() => {
        /* not signed in or network fail - keep localStorage value */
      });

    return () => {
      cancelled = true;
      mq.removeEventListener?.("change", onChange);
    };
  }, []);

  const enabled = userEnabled === null ? prefersReducedMotion : userEnabled;

  const setEnabled = useCallback((next: boolean) => {
    setUserEnabled(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* storage may be blocked; in-memory state still works */
    }
    // Best-effort server sync. Failure leaves the user with the
    // local value, which is fine - they'll just lose it across
    // devices until the next successful save.
    void savePreferences({ comfortMode: next }).catch(() => {
      /* swallow */
    });
  }, []);

  const toggle = useCallback(() => {
    setEnabled(!enabled);
  }, [enabled, setEnabled]);

  const value = useMemo<ComfortModeValue>(
    () => ({ enabled, prefersReducedMotion, toggle, setEnabled }),
    [enabled, prefersReducedMotion, toggle, setEnabled]
  );

  return (
    <ComfortModeContext.Provider value={value}>
      {children}
    </ComfortModeContext.Provider>
  );
}

/** Hook for exercises and HUD elements. Safe to call outside the provider — falls back to OS reduced-motion only. */
export function useComfortMode(): ComfortModeValue {
  const ctx = useContext(ComfortModeContext);
  const [fallbackPRM, setFallbackPRM] = useState<boolean>(false);

  useEffect(() => {
    if (ctx) return;
    setFallbackPRM(readReducedMotion());
  }, [ctx]);

  if (ctx) return ctx;

  // No provider mounted (e.g. tests, isolated previews). Return a
  // read-only value derived from the OS signal.
  return {
    enabled: fallbackPRM,
    prefersReducedMotion: fallbackPRM,
    toggle: () => {},
    setEnabled: () => {},
  };
}
