"use client";

/**
 * AlgorithmX Cinematic Engine — Hotspot/Panel interaction hook
 * ===========================================================
 *
 * Generalises the Password Vault's tap → focus → challenge → answer flow
 * (`handleLockTap` / `handleChoice` / camera focus / wrong panel / hint
 * escalation) into a content-agnostic hook. It knows nothing about locks
 * or passwords — it works on generic hotspots with multiple-choice
 * answers, and routes every answer through the sacred callback contract
 * (`onCorrect` / `onWrong` / `onAnswered` / `onHintReached`).
 *
 * It owns: which hotspot is focused, the derived camera mode, the set of
 * "active" (correctly-answered) hotspots, the wrong-answer panel state,
 * and the wrong-count → hint-tier escalation. Visual/audio specifics
 * (sounds, spark animations, lock art) stay with the scene via the
 * optional hooks below.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { SceneCamera } from "./SceneShell";

export interface HotspotChoice {
  isCorrect: boolean;
  /** Shown in the wrong-answer panel when this choice is picked. */
  explanation: string;
}

export interface HotspotDef {
  id: string;
  /** Percent offset from scene centre — fed to SceneShell's focus camera. */
  x: number;
  y: number;
  choices: HotspotChoice[];
  speaker?: "adam" | "layla";
}

export interface HotspotWrongState {
  id: string;
  explanation: string;
  speaker?: "adam" | "layla";
}

export interface UseHotspotPanelOptions {
  hotspots: HotspotDef[];
  /** Build the QuestionResponse key from a hotspot id. Default: identity. */
  questionKey?: (id: string) => string;
  /**
   * Wrong-answer counts (within a single hotspot) that escalate hint
   * tiers. Default `[2, 4]` → tier 1 at the 2nd wrong, tier 2 at the 4th
   * (the vault's behaviour). Index i maps to tier (i + 1), capped at 3.
   */
  hintThresholds?: number[];
  /** ms to stay focused after a correct answer before returning to overview. Default 650 (vault parity). */
  cameraReturnMs?: number;
  /** ms the "just activated" flag stays set (for spark animations). Default 900 (vault parity). */
  activatedFlagMs?: number;
  /** Interaction is ignored while true (e.g. during the climax). */
  locked?: boolean;

  // The sacred contract:
  onCorrect?: () => void;
  onWrong?: () => void;
  onHintReached?: (tier: 1 | 2 | 3) => void;
  onAnswered?: (data: {
    questionKey: string;
    selectedIndex: number;
    correctIndex: number;
    wasCorrect: boolean;
  }) => void;

  // Scene-specific hooks:
  /** Fired when a hotspot is focused; `alreadyActive` lets the scene pick a sound. */
  onFocus?: (id: string, alreadyActive: boolean) => void;
  /** Fired when the panel is closed (e.g. play a "back" sound). */
  onClosePanel?: () => void;
  /** Fired when a hotspot becomes active (correct answer). */
  onActivated?: (id: string) => void;
}

export interface HotspotPanelController {
  camera: SceneCamera;
  focusedId: string | null;
  wrong: HotspotWrongState | null;
  clearWrong: () => void;
  activeIds: ReadonlySet<string>;
  isActive: (id: string) => boolean;
  activeCount: number;
  allActive: boolean;
  /** The hotspot most recently activated, for transient spark visuals. */
  recentlyActivated: string | null;
  focusHotspot: (id: string) => void;
  closePanel: () => void;
  answer: (hotspotId: string, choiceIndex: number) => void;
}

export function useHotspotPanel(
  opts: UseHotspotPanelOptions,
): HotspotPanelController {
  const {
    hotspots,
    questionKey = (id) => id,
    hintThresholds = [2, 4],
    cameraReturnMs = 650,
    activatedFlagMs = 900,
    locked = false,
    onCorrect,
    onWrong,
    onHintReached,
    onAnswered,
    onFocus,
    onClosePanel,
    onActivated,
  } = opts;

  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<HotspotWrongState | null>(null);
  const [recentlyActivated, setRecentlyActivated] = useState<string | null>(
    null,
  );

  const wrongCountByIdRef = useRef<Record<string, number>>({});
  const hintFiredRef = useRef<Set<number>>(new Set());
  const timersRef = useRef<number[]>([]);

  // Keep callback-bearing options fresh without destabilising handlers.
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });

  useEffect(
    () => () => {
      timersRef.current.forEach((id) => window.clearTimeout(id));
      timersRef.current = [];
    },
    [],
  );

  const focusHotspot = useCallback(
    (id: string) => {
      if (locked) return;
      const already = activeIds.has(id);
      onFocus?.(id, already);
      setFocusedId(id);
    },
    [locked, activeIds, onFocus],
  );

  const closePanel = useCallback(() => {
    onClosePanel?.();
    setFocusedId(null);
  }, [onClosePanel]);

  const clearWrong = useCallback(() => setWrong(null), []);

  const answer = useCallback(
    (hotspotId: string, choiceIndex: number) => {
      const h = hotspots.find((x) => x.id === hotspotId);
      if (!h) return;
      const choice = h.choices[choiceIndex];
      if (!choice) return;
      const correctIndex = h.choices.findIndex((c) => c.isCorrect);
      const wasCorrect = choice.isCorrect;

      onAnswered?.({
        questionKey: questionKey(h.id),
        selectedIndex: choiceIndex,
        correctIndex,
        wasCorrect,
      });

      if (wasCorrect) {
        onCorrect?.();
        setActiveIds((prev) => {
          const next = new Set(prev);
          next.add(hotspotId);
          return next;
        });
        onActivated?.(hotspotId);
        setRecentlyActivated(hotspotId);
        timersRef.current.push(
          window.setTimeout(
            () => setRecentlyActivated(null),
            activatedFlagMs,
          ),
        );
        timersRef.current.push(
          window.setTimeout(() => setFocusedId(null), cameraReturnMs),
        );
      } else {
        onWrong?.();
        const newCount = (wrongCountByIdRef.current[hotspotId] ?? 0) + 1;
        wrongCountByIdRef.current[hotspotId] = newCount;
        hintThresholds.forEach((threshold, i) => {
          const tier = Math.min(3, i + 1) as 1 | 2 | 3;
          if (newCount === threshold && !hintFiredRef.current.has(tier)) {
            hintFiredRef.current.add(tier);
            onHintReached?.(tier);
          }
        });
        setWrong({
          id: hotspotId,
          explanation: choice.explanation,
          speaker: h.speaker ?? "layla",
        });
      }
    },
    [
      hotspots,
      questionKey,
      hintThresholds,
      cameraReturnMs,
      activatedFlagMs,
      onAnswered,
      onCorrect,
      onWrong,
      onHintReached,
      onActivated,
    ],
  );

  const camera: SceneCamera = focusedId
    ? (() => {
        const h = hotspots.find((x) => x.id === focusedId);
        return h ? { kind: "focus", x: h.x, y: h.y } : { kind: "overview" };
      })()
    : { kind: "overview" };

  return {
    camera,
    focusedId,
    wrong,
    clearWrong,
    activeIds,
    isActive: (id: string) => activeIds.has(id),
    activeCount: activeIds.size,
    allActive: activeIds.size === hotspots.length,
    recentlyActivated,
    focusHotspot,
    closePanel,
    answer,
  };
}
