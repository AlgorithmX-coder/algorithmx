"use client";

/**
 * VerdictVoice: Sarah speaks EVERY verdict with its reason.
 *
 * Owner mandate 2026-09-12 (all 20 weeks): when the child answers correctly,
 * Sarah says so AND why it was right; when they answer incorrectly, she says
 * so AND why it was wrong. This is the one shared way to do it, so every
 * exercise engine sounds the same:
 *
 *   "That's right!"  + <why it was right>
 *   "Not quite."     + <why it was wrong>
 *
 * Audio-only: the host keeps its own visual feedback (toast, panel, hint).
 * Two clips play back to back: the shared lead, then the reason, so the
 * reason reuses the per-item recordings already in the manifest
 * (explanation / note / why). `recordedOnly` keeps an un-recorded week
 * SILENT (never the robot voice) and finishes at once, so no host can hang on
 * a clip that does not exist. The narration click-guard holds the screen while
 * she speaks; `onDone` fires exactly once when she has finished (or at once
 * when muted / nothing to play), so a host waits for her before it advances or
 * lets the child retry and a verdict is never cut off.
 *
 * Usage (per verdict, a fresh key resets the sequence):
 *   const verdict = useVerdictVoice();
 *   ...on a pick: verdict.say(isRight ? "right" : "wrong", item.why, () => next());
 *   ...hold taps while verdict.speaking; render {verdict.element} anywhere.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import InfoNarration from "@/app/components/lesson/InfoNarration";
import { isAudioMuted, subscribeAudioMute } from "@/app/lib/audioMute";

export type VerdictKind = "right" | "wrong";

/** The two shared leads (recorded once, reused by every week). Keep these
 *  strings identical to the generator's shared blocks. */
export const VERDICT_LEADS: Record<VerdictKind, string> = {
  right: "That's right!",
  wrong: "Not quite.",
};

const HIDDEN: React.CSSProperties = {
  position: "absolute",
  width: 1,
  height: 1,
  overflow: "hidden",
  clip: "rect(0 0 0 0)",
  pointerEvents: "none",
};

export interface VerdictVoiceProps {
  verdict: VerdictKind;
  /** The reason, one kid-sized sentence. Empty = the lead alone. */
  why?: string | null;
  /** Fires once when the whole verdict has been heard (or cannot play). */
  onDone?: () => void;
  /** Both content voices are Sarah; "adam" matches the manifest keys. */
  speaker?: "adam" | "layla";
  /** Skip the lead when the host already speaks it in its own line. */
  leadless?: boolean;
}

export default function VerdictVoice({ verdict, why, onDone, speaker = "adam", leadless = false }: VerdictVoiceProps) {
  const whyText = (why ?? "").trim();
  const [stage, setStage] = useState<"lead" | "why" | "done">(leadless ? (whyText ? "why" : "done") : "lead");
  const onDoneRef = useRef(onDone);
  useEffect(() => { onDoneRef.current = onDone; }, [onDone]);
  const firedRef = useRef(false);
  const finish = useCallback(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    onDoneRef.current?.();
  }, []);

  // Stable line arrays so InfoNarration does not re-resolve on every render.
  const leadLines = useMemo(() => [VERDICT_LEADS[verdict]], [verdict]);
  const whyLines = useMemo(() => (whyText ? [whyText] : []), [whyText]);

  useEffect(() => {
    if (stage === "done") finish();
  }, [stage, finish]);

  // Muted: there is no voice to wait for, and InfoNarration never fires onDone
  // when the master mute holds it back. Finish after a short beat so the host
  // flow (advance / retry) continues at the same pace a child expects.
  useEffect(() => {
    let id: number | undefined;
    const end = () => { id = window.setTimeout(() => setStage("done"), 250); };
    if (isAudioMuted()) end();
    const unsub = subscribeAudioMute((muted) => { if (muted) end(); });
    return () => { unsub(); if (id) window.clearTimeout(id); };
  }, []);

  // Backstop: never leave a host waiting on a verdict that failed to end.
  useEffect(() => {
    const maxMs = Math.min(25000, 4000 + whyText.length * 80);
    const id = window.setTimeout(() => setStage("done"), maxMs);
    return () => window.clearTimeout(id);
  }, [whyText.length]);

  return (
    <div aria-hidden style={HIDDEN} data-verdict-voice={verdict}>
      {stage === "lead" && (
        <InfoNarration speaker={speaker} lines={leadLines} recordedOnly onDone={() => setStage(whyLines.length ? "why" : "done")} />
      )}
      {stage === "why" && (
        <InfoNarration speaker={speaker} lines={whyLines} recordedOnly onDone={() => setStage("done")} />
      )}
    </div>
  );
}

/**
 * Host-side helper: one call per verdict, a `speaking` flag to hold taps, and
 * the element to render. `then` runs once when Sarah has finished (advance the
 * item, open the retry, etc.).
 */
export function useVerdictVoice(speaker: "adam" | "layla" = "adam") {
  const [current, setCurrent] = useState<{ kind: VerdictKind; why: string | null; n: number; leadless: boolean } | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const thenRef = useRef<(() => void) | null>(null);

  const say = useCallback((kind: VerdictKind, why?: string | null, then?: () => void, opts?: { leadless?: boolean }) => {
    thenRef.current = then ?? null;
    setSpeaking(true);
    setCurrent((prev) => ({ kind, why: why ?? null, n: (prev?.n ?? 0) + 1, leadless: !!opts?.leadless }));
  }, []);

  const handleDone = useCallback(() => {
    setSpeaking(false);
    const t = thenRef.current;
    thenRef.current = null;
    t?.();
  }, []);

  /** Drop a pending verdict (e.g. the host unmounts its round early). */
  const cancel = useCallback(() => {
    thenRef.current = null;
    setSpeaking(false);
    setCurrent(null);
  }, []);

  const element: ReactNode = current ? (
    <VerdictVoice key={current.n} verdict={current.kind} why={current.why} speaker={speaker} leadless={current.leadless} onDone={handleDone} />
  ) : null;

  return { say, speaking, element, cancel };
}
