/**
 * The block-entry XP bonus — awarded once per block (3 and 4 today) by the
 * ClearanceUpMoment, never by a case. Same event-sourced shape as a case's
 * checkpoint (`AwardEvent` + `xpForEvent`, the one place an XP number is
 * allowed to live), just keyed by block number instead of mission id, so
 * there is still exactly one source of truth for every XP figure in the app.
 */
import { type AwardEvent, xpForEvent } from "./types";

const KEY = "explorers:blockBonus";

interface BlockBonusState {
  events: AwardEvent[];
}

function load(): BlockBonusState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as BlockBonusState;
  } catch {}
  return { events: [] };
}

/** Total XP earned from block-entry bonuses so far — folded into the mission board's totalXp. */
export function blockBonusXP(): number {
  return load().events.reduce((sum, e) => sum + xpForEvent(e), 0);
}

/** Has this block's clearance-upgrade moment already fired? The once-only gate. */
export function hasBlockBonus(block: number): boolean {
  return load().events.some((e) => e.type === "BLOCK_ENTERED" && e.sourceKey === String(block));
}

/** Idempotent: a block already awarded is a no-op, never double-paid. */
export function awardBlockBonus(block: number): void {
  if (hasBlockBonus(block)) return;
  const state = load();
  state.events.push({ type: "BLOCK_ENTERED", sourceKey: String(block) });
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}
