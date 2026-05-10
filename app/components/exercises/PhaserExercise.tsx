"use client";

import { useEffect, useRef } from "react";
import * as Phaser from "phaser";

/**
 * PhaserExercise - generic React wrapper that mounts a Phaser game
 * inside a div, passes through callbacks + initial data, and tears
 * down cleanly when the React component unmounts.
 *
 * Phaser handles all rendering, animation, particles, sound, input.
 * React handles the lesson shell (navigation, HUD, transitions
 * between cases). They communicate only through:
 *
 *   1. `sceneData` - initial config passed to the scene's `init()`
 *   2. `callbacks` - Phaser scenes can invoke React handlers via
 *      these (onCorrect, onWrong, onComplete, etc.)
 *
 * Each exercise gets its own Scene subclass.  See
 * `PhaserMemoryMatch.ts` for the first one.
 */

export interface PhaserExerciseCallbacks {
  onCorrect?: () => void;
  onWrong?: () => void;
  /** Stars: 1, 2, or 3 - passed through to the lesson's progression system. */
  onComplete?: (score: number) => void;
}

export interface PhaserExerciseProps<TData = unknown> {
  /** The Scene constructor (subclass of Phaser.Scene). */
  Scene: new () => Phaser.Scene;
  /** Initial data passed to scene.init(). */
  sceneData?: TData;
  /** Callbacks available on `this.game.registry.get('callbacks')` inside the scene. */
  callbacks?: PhaserExerciseCallbacks;
  /** Game canvas size. Defaults to fill parent (responsive). */
  width?: number;
  height?: number;
  /** Background color of the canvas (used when no scene background renders). */
  backgroundColor?: string;
  className?: string;
}

export default function PhaserExercise<TData = unknown>({
  Scene,
  sceneData,
  callbacks,
  width,
  height,
  backgroundColor = "#04050d",
  className,
}: PhaserExerciseProps<TData>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);

  // Stable callbacks ref so we can mutate without re-mounting Phaser.
  const callbacksRef = useRef(callbacks);
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the Phaser game once per mount.
    const game = new Phaser.Game({
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: width ?? containerRef.current.clientWidth,
      height: height ?? containerRef.current.clientHeight,
      backgroundColor,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: Scene,
      // Disable Phaser's banner spam in the browser console.
      banner: false,
      // Pause when hidden (kid switches tab) - avoids burning battery.
      autoFocus: true,
    });

    // Make callbacks + initial data available to the scene via the game registry.
    game.registry.set("callbacks", callbacksRef);
    if (sceneData !== undefined) {
      game.registry.set("sceneData", sceneData);
    }

    gameRef.current = game;

    // Resize observer so Phaser canvas tracks parent dimensions.
    const resize = () => {
      if (!containerRef.current || !gameRef.current) return;
      const w = width ?? containerRef.current.clientWidth;
      const h = height ?? containerRef.current.clientHeight;
      gameRef.current.scale.resize(w, h);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
    // We deliberately mount the game ONCE for this React mount.
    // Re-creating Phaser on every prop change is expensive; the
    // callbacksRef + registry pattern lets us mutate behaviour without.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Scene]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 480,
        position: "relative",
        // Hide default focus outline on the canvas - Phaser handles input.
        outline: "none",
      }}
    />
  );
}
