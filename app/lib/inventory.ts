/**
 * Inventory catalog - the 19 collectibles a kid earns through Week 1.
 *
 * Each correct screen completion drops one item into the persistent
 * inventory bar at the top of the lesson. Two reasons this exists:
 *
 *   1. Continuity. Right now every screen is locally stateful. The bar
 *      gives the kid a *visible journey* across the 19 screens - the
 *      thing they earned five minutes ago is still on screen now.
 *   2. Reveal-Then-Earn beat. After a correct answer, the new item
 *      flies from the action point into its inventory slot, and a
 *      one-line "did you know" pops in the Adam/Layla bubble. Adds
 *      ~3.5s of emotional payoff per screen - opposite of boring.
 *
 * Items are keyed by stable string ids ("loop1-vault-key", etc.) so we
 * can reorder screens later without invalidating saved state. Persisted
 * to localStorage under a per-week key so progress survives reload.
 */

export interface InventoryItem {
  /** Stable identifier - never reuse / rename without a migration. */
  id: string;
  /** Lesson screen index (0..18) the item is earned on. Used to lay
   *  out the empty-slot row even before the kid has earned anything. */
  screen: number;
  /** Emoji glyph rendered as the icon. Kept as a glyph (not an SVG
   *  asset) so the bar stays cheap to render and consistent across
   *  themes. Picked to feel concrete - a thing, not a decoration. */
  icon: string;
  /** Short display name (≤ 22 chars). Shown on hover and in the
   *  earn floater so the kid associates the icon with a label. */
  name: string;
  /** One-line "did you know" reveal. Appears in the Adam/Layla speech
   *  bubble immediately after the fly animation lands. Kept short
   *  (≤ ~140 chars) so younger readers can finish before it fades. */
  didYouKnow: string;
  /** Which character delivers the reveal line. Alternating between
   *  Adam and Layla through the lesson keeps both heroes present. */
  speaker: "adam" | "layla";
  /** Tailwind-friendly accent colour for the slot ring + glow. All
   *  values come from the warm Pixar dusk palette. */
  accent: string;
}

export const INVENTORY_ITEMS: InventoryItem[] = [
  {
    id: "w1-mission-briefing",
    screen: 0,
    icon: "🎬",
    name: "Mission Briefing",
    didYouKnow: "Every great hero starts with a mission. Yours is keeping passwords safe!",
    speaker: "adam",
    accent: "#00e5ff",
  },
  {
    id: "w1-hero-license",
    screen: 1,
    icon: "🌟",
    name: "Hero License",
    didYouKnow: "You're officially a Cyber Hero now. The Raccoon should be worried…",
    speaker: "layla",
    accent: "#ff5fb3",
  },
  {
    id: "w1-vault-key",
    screen: 2,
    icon: "🔑",
    name: "Vault Key",
    didYouKnow: "A password is a tiny key that fits only one lock - yours.",
    speaker: "adam",
    accent: "#7c5cff",
  },
  {
    id: "w1-strength-goggles",
    screen: 3,
    icon: "👓",
    name: "Strength Goggles",
    didYouKnow: "Strong passwords mix big letters, small letters, numbers AND symbols. All four!",
    speaker: "layla",
    accent: "#7eff97",
  },
  {
    id: "w1-shield-reflex",
    screen: 4,
    icon: "🛡️",
    name: "Shield Reflex",
    didYouKnow: "Your data is precious - defend it like you'd defend a friend.",
    speaker: "adam",
    accent: "#3a7bff",
  },
  {
    id: "w1-first-insight",
    screen: 5,
    icon: "💡",
    name: "First Insight",
    didYouKnow: "Hackers trick people more than they trick computers. Stay sharp!",
    speaker: "layla",
    accent: "#00e5ff",
  },
  {
    id: "w1-password-potion",
    screen: 6,
    icon: "⚗️",
    name: "Password Potion",
    didYouKnow: "Mix the right ingredients and even the Raccoon can't crack it.",
    speaker: "adam",
    accent: "#ff5fb3",
  },
  {
    id: "w1-cracker-tool",
    screen: 7,
    icon: "🔓",
    name: "Code Cracker",
    didYouKnow: "Long, random passwords are the strongest. 8 characters minimum!",
    speaker: "layla",
    accent: "#7c5cff",
  },
  {
    id: "w1-memory-glasses",
    screen: 8,
    icon: "🧠",
    name: "Memory Charm",
    didYouKnow: "Linking a term to a picture makes it stick - that's how cyber pros remember.",
    speaker: "adam",
    accent: "#7eff97",
  },
  {
    id: "w1-sorting-speed",
    screen: 9,
    icon: "⚡",
    name: "Sorting Speed",
    didYouKnow: "You can spot a weak password in seconds now. Real superpower!",
    speaker: "layla",
    accent: "#00e5ff",
  },
  {
    id: "w1-rule-book",
    screen: 10,
    icon: "📜",
    name: "Rule Book",
    didYouKnow: "Pros follow rules so they never have to think twice in danger.",
    speaker: "adam",
    accent: "#3a7bff",
  },
  {
    id: "w1-second-insight",
    screen: 11,
    icon: "💎",
    name: "Second Insight",
    didYouKnow: "Two passwords that LOOK alike can be miles apart in safety.",
    speaker: "layla",
    accent: "#00e5ff",
  },
  {
    id: "w1-detective-eye",
    screen: 12,
    icon: "🕵️",
    name: "Detective Eye",
    didYouKnow: "Phishing tricks always leave a clue. You just trained your eye to spot one.",
    speaker: "adam",
    accent: "#ff5fb3",
  },
  {
    id: "w1-spam-sword",
    screen: 13,
    icon: "🪄",
    name: "Spam Wand",
    didYouKnow: "One tap can save a whole inbox. Junk mail beware!",
    speaker: "layla",
    accent: "#7eff97",
  },
  {
    id: "w1-path-compass",
    screen: 14,
    icon: "🧭",
    name: "Choice Compass",
    didYouKnow: "The best heroes don't just react - they choose. Smart over fast.",
    speaker: "adam",
    accent: "#00e5ff",
  },
  {
    id: "w1-boss-trophy",
    screen: 15,
    icon: "🏆",
    name: "Boss Trophy",
    didYouKnow: "You out-thought the Hacker Raccoon. Adam and Layla are safe!",
    speaker: "layla",
    accent: "#7c5cff",
  },
  {
    id: "w1-victory-aura",
    screen: 16,
    icon: "🌈",
    name: "Victory Aura",
    didYouKnow: "Real heroes celebrate the people they protected, not just the win.",
    speaker: "adam",
    accent: "#3a7bff",
  },
  {
    id: "w1-academy-pin",
    screen: 17,
    icon: "🎓",
    name: "Academy Pin",
    didYouKnow: "You finished Week 1. The Cyber Heroes Academy is yours to keep.",
    speaker: "layla",
    accent: "#00e5ff",
  },
  {
    id: "w1-secret-badge",
    screen: 18,
    icon: "✨",
    name: "Secret Spark",
    didYouKnow: "There's always something extra for those who go the distance.",
    speaker: "adam",
    accent: "#ff5fb3",
  },
];

export function getItem(id: string): InventoryItem | undefined {
  return INVENTORY_ITEMS.find((i) => i.id === id);
}

export function getItemForScreen(screen: number): InventoryItem | undefined {
  return INVENTORY_ITEMS.find((i) => i.screen === screen);
}

/* ───────────────────────── PERSISTENCE ─────────────────────────
 * Earned items are stored as a JSON string array of ids under a
 * per-week + per-slot key. We deliberately keep the schema dumb -
 * a `Set` of ids is easy to evolve and survives item reorderings.
 *
 * Slot-aware: keys are now `ax-inventory-v1::week-X::slot-Y`. The
 * saveSlots / slotStorage modules handle the slot-id resolution. */

const STORAGE_PREFIX = "ax-inventory-v1";

function activeSlotId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem("algorithmx-active-slot-v1");
  } catch {
    return null;
  }
}

export function storageKeyForWeek(weekKey: string): string {
  const id = activeSlotId();
  const base = `${STORAGE_PREFIX}::${weekKey}`;
  return id ? `${base}::${id}` : base;
}

export function loadEarnedItems(weekKey: string): Set<string> {
  if (typeof window === "undefined") return new Set();
  /* One-shot migrate: if a legacy unsuffixed inventory blob exists
   * from before slot-namespacing shipped, copy it under the active
   * slot's key so existing players don't lose earned items. */
  try {
    const id = activeSlotId();
    if (id) {
      const namespaced = `${STORAGE_PREFIX}::${weekKey}::${id}`;
      if (window.localStorage.getItem(namespaced) === null) {
        const legacy = window.localStorage.getItem(
          `${STORAGE_PREFIX}::${weekKey}`,
        );
        if (legacy !== null) {
          window.localStorage.setItem(namespaced, legacy);
        }
      }
    }
  } catch {
    /* ignore migration errors */
  }
  try {
    const raw = window.localStorage.getItem(storageKeyForWeek(weekKey));
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is string => typeof x === "string"));
  } catch {
    return new Set();
  }
}

export function saveEarnedItems(weekKey: string, ids: Set<string>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKeyForWeek(weekKey),
      JSON.stringify(Array.from(ids))
    );
  } catch {
    // Storage quota / private mode - silently no-op. The bar still
    // works in-session; we just can't persist across reloads.
  }
}
