/**
 * The Agent Wardrobe - the kit a child has earned, and the one they're wearing.
 *
 * Design: docs/cyberheroes/agent-wardrobe-design.md. The short version:
 *
 *   Finish a week, and you keep that week's outfit forever.
 *
 * This replaced a proposed coin shop. The reason is week 7: "In-Game Spending:
 * The Gem Bucks Trap" teaches six-to-nine year olds that game coins are "real
 * money in a costume", and its badge is Wallet Guard. A course that spends a
 * week teaching children to distrust coin shops cannot hand them one. So there
 * is no currency here, no prices, no rarity and no timers - only work already
 * done, worn.
 *
 * THE ART IS ALREADY DRAWN. public/game/characters/wNN/ holds 220 sprites from
 * the themed-cast mandate (2026-09-11): twenty bespoke outfits for Adam and
 * twenty for Layla, keyed and installed. The wardrobe commissions nothing - it
 * makes what twenty weeks of production already paid for selectable.
 *
 * TRIAL SCOPE (27 October 2026): unlocks are DERIVED from progress the page
 * already loads, and the choice lives in localStorage. No schema change, no
 * migration, no API - so this can be judged and thrown away cheaply. The
 * production shape (ChildProfile fields + server-side validation of the choice
 * against earned weeks) is in the design doc.
 */

import { WEEK_OUTFITS } from "@/app/lib/weekCharacters";

/** Where the chosen kit lives for the trial. Per device, deliberately. */
/* Keyed by WEEK, not by outfit slug. Weeks 9 and 16 both carry the slug
 * `inspector`, so a slug is ambiguous and "Code Inspector" would have
 * resolved to week 9's art. The week is unique by construction. */
export const WARDROBE_STORAGE_KEY = "cyberheroes.wardrobe.week.v1";

/** The look every agent starts in, before a single week is finished. */
export const BASE_OUTFIT = "base";

export interface WardrobeItem {
  /** The costume slug in the wNN filenames. `base` means the shared sprites. */
  outfit: string;
  /** The week that awards it (0 for the base kit). */
  week: number;
  /** What the child reads. */
  name: string;
  /** One line naming what the week was about, so the kit records the work. */
  earnedFor: string;
}

/**
 * Display names.
 *
 * Weeks 9 and 16 both carry the slug `inspector`, and 13/18 are `pj`/`pajama`.
 * The FILES differ (verified by hash), so these are twenty distinct looks with
 * two colliding labels - fine as internal slugs, confusing as collectibles. The
 * names below separate them without moving any art. See DECIDE 1 in the design
 * doc; the owner may rename these.
 */
const DISPLAY: Record<number, { name: string; earnedFor: string }> = {
  1: { name: "Locksmith Kit", earnedFor: "Passwords" },
  2: { name: "Forge Apron", earnedFor: "Private info" },
  3: { name: "Detective Coat", earnedFor: "Strangers online" },
  4: { name: "Angler Jacket", earnedFor: "Scams and tricks" },
  5: { name: "Artist Smock", earnedFor: "Kind words online" },
  6: { name: "Esports Jersey", earnedFor: "Gaming safety" },
  7: { name: "Wallet Guard", earnedFor: "Spending in games" },
  8: { name: "Photographer Vest", earnedFor: "Photos and videos" },
  9: { name: "App Inspector", earnedFor: "Apps and downloads" },
  10: { name: "Rescue Gear", earnedFor: "Videos and channels" },
  11: { name: "Captain's Coat", earnedFor: "Getting help" },
  12: { name: "Ranger Kit", earnedFor: "Digital footprint" },
  13: { name: "Sleep Guard", earnedFor: "Screen time" },
  14: { name: "Scout Uniform", earnedFor: "Smart devices" },
  15: { name: "Reporter Coat", earnedFor: "AI and chatbots" },
  16: { name: "Code Inspector", earnedFor: "QR codes and links" },
  17: { name: "Knight's Armour", earnedFor: "Social media" },
  18: { name: "Lights Out Kit", earnedFor: "Sharing devices" },
  19: { name: "Cardigan Kit", earnedFor: "Protecting family" },
  20: { name: "Graduation Suit", earnedFor: "Graduation day" },
};

/** The base kit, always owned. */
export const BASE_ITEM: WardrobeItem = {
  outfit: BASE_OUTFIT,
  week: 0,
  name: "Agent Basics",
  earnedFor: "Yours from day one",
};

/** Every kit in the course, in week order, base first. */
export function allWardrobeItems(): WardrobeItem[] {
  const items: WardrobeItem[] = [BASE_ITEM];
  for (let w = 1; w <= 20; w++) {
    const outfit = WEEK_OUTFITS[w];
    const d = DISPLAY[w];
    if (!outfit || !d) continue;
    items.push({ outfit, week: w, name: d.name, earnedFor: d.earnedFor });
  }
  return items;
}

/**
 * The kits this child has earned: the base one, plus one per COMPLETED week.
 *
 * Derived, never stored - the same `completedAt` that already decides badges
 * and stickers. Nothing to keep in sync, and nothing new in the data footprint.
 */
export function earnedWardrobe(completedWeeks: readonly number[]): WardrobeItem[] {
  const done = new Set(completedWeeks);
  return allWardrobeItems().filter((i) => i.week === 0 || done.has(i.week));
}

/**
 * The NEXT kit to earn - one invitation, not a wall of padlocks.
 *
 * `economy.md` is explicit that "a badge wall of 60 grey placeholders is
 * demotivating", and a locked rail is the closest thing to a price list this
 * design could accidentally grow. So the UI shows what is earned plus exactly
 * one line about what is next.
 */
export function nextWardrobeItem(completedWeeks: readonly number[]): WardrobeItem | null {
  const done = new Set(completedWeeks);
  return allWardrobeItems().find((i) => i.week > 0 && !done.has(i.week)) ?? null;
}

/** May this child wear this week's kit? The base kit is always theirs. */
export function isWeekEarned(week: number, completedWeeks: readonly number[]): boolean {
  if (week === 0) return true;
  return completedWeeks.includes(week);
}

/**
 * The sprite for a chosen kit.
 *
 * `base` resolves to the shared art. Anything else resolves into that week's
 * directory, and callers keep the existing `fallbackToShared` onError so a
 * missing file renders exactly as it does today.
 */
export function wardrobeSpriteSrc(
  item: Pick<WardrobeItem, "outfit" | "week">,
  character: "adam" | "layla",
  mood: string,
): string {
  if (item.outfit === BASE_OUTFIT || item.week === 0) {
    return `/game/characters/${character}-${mood}.png`;
  }
  const NN = String(item.week).padStart(2, "0");
  return `/game/characters/w${NN}/${character}-${item.outfit}-${mood}.png`;
}

/** The kit for a week (0 = base), or the base kit if the week has none. */
export function itemForWeek(week: number): WardrobeItem {
  return allWardrobeItems().find((i) => i.week === week) ?? BASE_ITEM;
}

/** Read the worn week. Safe in every browser state - see the catch note. */
export function readWornWeek(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.localStorage.getItem(WARDROBE_STORAGE_KEY);
    const n = Number(raw);
    return Number.isInteger(n) && n >= 0 && n <= 20 ? n : 0;
  } catch {
    /* Private window, blocked site data, thumbnail capture. The base kit is a
     * correct answer, not a failure state. */
    return 0;
  }
}

/** Wear a week's kit. Silently a no-op where storage is unavailable. */
export function writeWornWeek(week: number): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(WARDROBE_STORAGE_KEY, String(week));
  } catch {
    /* As above. The child still sees the selection for this session. */
  }
}
