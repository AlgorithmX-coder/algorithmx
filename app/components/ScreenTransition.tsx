"use client";

import { ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { playSound } from "@/app/lib/sounds";

export type TransitionType = "fade" | "slideLeft" | "slideRight" | "slideUp" | "zoom" | "blur";

type ScreenTransitionProps = {
  screenKey: number;
  children: ReactNode;
  transition?: TransitionType;
  duration?: number;
};

type Layer = {
  id: number;
  children: ReactNode;
};

const KEYFRAMES = `
@keyframes st-fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes st-fade-out { from { opacity: 1; } to { opacity: 0; } }

@keyframes st-slideLeft-in { from { opacity: 0; transform: translateX(30%); } to { opacity: 1; transform: translateX(0); } }
@keyframes st-slideLeft-out { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(-30%); } }

@keyframes st-slideRight-in { from { opacity: 0; transform: translateX(-30%); } to { opacity: 1; transform: translateX(0); } }
@keyframes st-slideRight-out { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(30%); } }

@keyframes st-slideUp-in { from { opacity: 0; transform: translateY(30%); } to { opacity: 1; transform: translateY(0); } }
@keyframes st-slideUp-out { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(-30%); } }

@keyframes st-zoom-in { from { opacity: 0; transform: scale(1.05); } to { opacity: 1; transform: scale(1); } }
@keyframes st-zoom-out { from { opacity: 1; transform: scale(1); } to { opacity: 0; transform: scale(0.95); } }

@keyframes st-blur-in { from { opacity: 0; filter: blur(8px); } to { opacity: 1; filter: blur(0); } }
@keyframes st-blur-out { from { opacity: 1; filter: blur(0); } to { opacity: 0; filter: blur(8px); } }
`;

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  const id = "ax-screen-transition-keyframes";
  if (document.getElementById(id)) return;
  const el = document.createElement("style");
  el.id = id;
  el.textContent = KEYFRAMES;
  document.head.appendChild(el);
}

const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

export default function ScreenTransition({
  screenKey,
  children,
  transition = "fade",
  duration = 400,
}: ScreenTransitionProps) {
  const firstRenderRef = useRef(true);
  const [currentKey, setCurrentKey] = useState(screenKey);
  const [currentChildren, setCurrentChildren] = useState<ReactNode>(children);
  const [outgoing, setOutgoing] = useState<Layer | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    ensureKeyframes();
  }, []);

  useEffect(() => {
    if (firstRenderRef.current) {
      firstRenderRef.current = false;
      return;
    }
    if (screenKey === currentKey) {
      // Update children in place without replaying transition
      setCurrentChildren(children);
      return;
    }

    // Start transition — play sound cue
    playSound("transition");

    // Move existing content into an outgoing layer and swap in the new content
    setOutgoing({ id: currentKey, children: currentChildren });
    setCurrentKey(screenKey);
    setCurrentChildren(children);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setOutgoing(null);
      timerRef.current = null;
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screenKey]);

  // Keep currentChildren in sync when children prop changes without a key change
  useEffect(() => {
    if (screenKey === currentKey) {
      setCurrentChildren(children);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const animIn = `st-${transition}-in ${duration}ms ${EASE} both`;
  const animOut = `st-${transition}-out ${duration}ms ${EASE} both`;

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        willChange: "transform, opacity",
      }}
    >
      <div
        key={currentKey}
        style={{
          animation: firstRenderRef.current ? undefined : animIn,
          willChange: "transform, opacity, filter",
        }}
      >
        {currentChildren}
      </div>
      {outgoing && (
        <div
          key={`out-${outgoing.id}`}
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            animation: animOut,
            pointerEvents: "none",
            willChange: "transform, opacity, filter",
          }}
        >
          {outgoing.children}
        </div>
      )}
    </div>
  );
}

export function useScreenTransition(totalScreens: number) {
  const [screenKey, setScreenKey] = useState(0);
  const [transition, setTransition] = useState<TransitionType>("fade");

  const next = useCallback(() => {
    setTransition("slideLeft");
    setScreenKey((k) => (k >= totalScreens - 1 ? k : k + 1));
  }, [totalScreens]);

  const prev = useCallback(() => {
    setTransition("slideRight");
    setScreenKey((k) => (k <= 0 ? k : k - 1));
  }, []);

  const goTo = useCallback(
    (n: number) => {
      setTransition("fade");
      setScreenKey(() => {
        if (n < 0) return 0;
        if (n >= totalScreens) return totalScreens - 1;
        return n;
      });
    },
    [totalScreens],
  );

  return { screenKey, transition, next, prev, goTo };
}
