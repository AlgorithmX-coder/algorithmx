import type { ReactNode } from "react";

/* The contract every simulator implements. The player mounts one by tool
 * and never knows which; the simulator owns only its chrome. Nominative
 * use in training: each names the real tool, follows its layout closely
 * enough that habits transfer, uses no vendor logo or wordmark artwork,
 * and carries a "Practice tenant" label. */

/* Which account the window pretends to be. The badge or tenant label that
 * changes with the tier is the teaching point of Module 1. */
export type SimTier = "consumer-free" | "consumer-paid" | "enterprise";

export interface SimMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  /* The assistant is still writing. */
  pending?: boolean;
  /* Rendered under a user message: the grader's panel. */
  panel?: ReactNode;
}

export interface SimProps {
  firmName: string;
  learnerName: string;
  messages: SimMessage[];
  draft: string;
  onDraftChange?: (v: string) => void;
  onSend: () => void;
  canSend: boolean;
  /* Locked composer: the builder writes the draft, the learner cannot edit. */
  composerLocked?: boolean;
  status?: string;
  /* Default enterprise: the firm's own tenant or workspace. */
  tier?: SimTier;
  /* Chrome only, small, for "which tier is this?" sorting: no messages,
   * no live composer, greeting state, roughly 320px wide. */
  compact?: boolean;
}
