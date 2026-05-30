"use client";

/**
 * Fires a signature SFX exactly once when the component mounts.
 * Lets server components (like /cyberhq/page.tsx) trigger an audio
 * cue on page entry without becoming client components themselves —
 * the parent stays server-rendered, this tiny island handles the
 * client-only sound.
 *
 * Wrapped in a useEffect with an empty dependency array so strict-
 * mode double-invocations don't double-play (we also guard with a
 * ref against the second invocation in dev).
 */

import { useEffect, useRef } from "react";
import { useGameAudio } from "@/app/lib/gameEngine";

interface Props {
  /** Matches an `id` in SIGNATURE_SFX (app/lib/sfx-signature.ts). */
  id: string;
  /** Optional delay in ms before the cue fires. Useful when the
   *  page has a fade-in or transition we don't want to talk over. */
  delayMs?: number;
}

export default function PlaySignatureOnMount({ id, delayMs = 0 }: Props) {
  const audio = useGameAudio();
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;
    const timer = window.setTimeout(() => {
      audio.signature(id);
    }, Math.max(0, delayMs));
    return () => window.clearTimeout(timer);
    // Intentionally empty deps - this is a one-shot on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
