import type { MissionCheckpoint } from "./types";

/**
 * Server transport for mission progress (template §5: same
 * MissionCheckpoint payload as localStorage, different transport).
 *
 * Everything here is fail-soft: the mission must play identically for
 * a signed-out visitor, a family with no child profile, or a dropped
 * connection — in all of those cases these helpers quietly no-op and
 * the engine keeps its localStorage behaviour. The server copy is what
 * makes progress survive cleared storage and device switches.
 */

export const EXPLORERS_PRODUCT_SLUG = "cyberexplorers";

/** "explorers-m01" → 1. Null when the id carries no mission number. */
export function missionWeek(missionId: string): number | null {
  const m = missionId.match(/(\d+)\s*$/);
  if (!m) return null;
  const week = parseInt(m[1], 10);
  return Number.isFinite(week) && week >= 1 ? week : null;
}

export interface ServerProgressRow {
  week: number;
  screen: number;
  xp: number;
  completedAt: string | null;
  checkpoint: MissionCheckpoint | null;
}

/**
 * The signed-in family's active child (same "most recently created"
 * convention as the Heroes lesson flow). Null when signed out or no
 * child profile exists yet.
 */
export async function fetchActiveChildId(): Promise<string | null> {
  try {
    const res = await fetch("/api/child-profile");
    if (!res.ok) return null;
    const children = (await res.json()) as { id?: string }[];
    return typeof children[0]?.id === "string" ? children[0].id : null;
  } catch {
    return null;
  }
}

export async function pullMissionProgress(
  childProfileId: string,
  week: number,
): Promise<ServerProgressRow | null> {
  try {
    const params = new URLSearchParams({
      childProfileId,
      productSlug: EXPLORERS_PRODUCT_SLUG,
    });
    const res = await fetch(`/api/progress?${params}`);
    if (!res.ok) return null;
    const rows = (await res.json()) as ServerProgressRow[];
    return rows.find((r) => r.week === week) ?? null;
  } catch {
    return null;
  }
}

/**
 * Fire-and-forget write. `keepalive` lets a push started just before
 * navigation still land. Errors are swallowed — localStorage remains
 * the safety net.
 */
export function pushMissionProgress(
  childProfileId: string,
  data: {
    week: number;
    screen: number;
    xp: number;
    checkpoint: MissionCheckpoint | null;
    completed: boolean;
  },
): void {
  try {
    void fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        childProfileId,
        productSlug: EXPLORERS_PRODUCT_SLUG,
        stars: 0,
        ...data,
      }),
    }).catch(() => {});
  } catch {}
}
