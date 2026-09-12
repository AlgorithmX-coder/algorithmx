/**
 * Per-week MISSION STAGE WORLD (owner 2026-09-12: "the structure stays the
 * same, but the mission briefing should be a different world every week").
 *
 * The briefing keeps its ritual everywhere: title plate, three objective
 * cards the child taps to flip, pedestal + beam, Accept Mission, the cast at
 * the wings. A world only swaps the MATERIALS around that ritual:
 *
 *   sky    - the week's live Mission Command backdrop (WeekIntroBackdrop
 *            scene) replaces the fixed starfield + painted ridges
 *   floor  - the stage floor texture (steel plate, cobbles, neon grid, PCB...)
 *   motes  - what drifts in the pedestal beam (sparks, fireflies, glyphs, code)
 *   card   - the card's material + the motif on its face-down back
 *
 * KEY RULE (same as weekThemes.ts): a week with NO entry here renders EXACTLY
 * as before. Styles for every kind live in
 * app/components/game/missionWorldStyles.tsx.
 */

export type MissionFloor =
  | "steel" | "concrete" | "cobbles" | "boardwalk" | "moss" | "grid" | "velvet" | "tile" | "belt" | "earth"
  | "grating" | "snow" | "grass" | "rug" | "circuit" | "checker" | "glass" | "lockerTile" | "hearth" | "stage";

export type MissionMotes =
  | "sparks" | "dust" | "fireflies" | "bulbs" | "embers" | "glyphs" | "glints" | "amber" | "code" | "spores"
  | "blips" | "snow" | "pollen" | "pulses" | "orchid" | "likes" | "scan" | "confetti";

export type MissionCardMaterial =
  | "steel" | "glass" | "manila" | "ticket" | "wood" | "cabinet" | "tag" | "photo" | "tile" | "stone"
  | "monitor" | "frost" | "paper" | "speaker" | "module" | "door" | "post" | "locker" | "quilt" | "certificate";

export interface MissionWorld {
  /** Short label for QA logs / dev previews. */
  name: string;
  floor: MissionFloor;
  motes: MissionMotes;
  card: {
    material: MissionCardMaterial;
    /** PixIcon key on the face-down back (the world's motif). */
    backIcon: string;
  };
}

export const MISSION_WORLDS: Record<number, MissionWorld> = {
  1: { name: "The Vault", floor: "steel", motes: "sparks", card: { material: "steel", backIcon: "🔒" } },
  2: { name: "The Safehouse", floor: "concrete", motes: "dust", card: { material: "glass", backIcon: "🛡️" } },
  3: { name: "Masquerade Street", floor: "cobbles", motes: "fireflies", card: { material: "manila", backIcon: "🎭" } },
  4: { name: "Carnival of Fakes", floor: "boardwalk", motes: "bulbs", card: { material: "ticket", backIcon: "🌟" } },
  5: { name: "Warm Campfire", floor: "moss", motes: "embers", card: { material: "wood", backIcon: "💬" } },
  6: { name: "Neon Arcade", floor: "grid", motes: "glyphs", card: { material: "cabinet", backIcon: "🎮" } },
  7: { name: "The Loot Shop", floor: "velvet", motes: "glints", card: { material: "tag", backIcon: "🎁" } },
  8: { name: "The Darkroom", floor: "tile", motes: "amber", card: { material: "photo", backIcon: "📸" } },
  9: { name: "The Conveyor", floor: "belt", motes: "code", card: { material: "tile", backIcon: "🧩" } },
  10: { name: "The Glowing Burrow", floor: "earth", motes: "spores", card: { material: "stone", backIcon: "🔔" } },
  11: { name: "Calm Alert Centre", floor: "grating", motes: "blips", card: { material: "monitor", backIcon: "📣" } },
  12: { name: "The Snowfield", floor: "snow", motes: "snow", card: { material: "frost", backIcon: "🔗" } },
  13: { name: "Sunrise Balance", floor: "grass", motes: "pollen", card: { material: "paper", backIcon: "📱" } },
  14: { name: "The Smart Home", floor: "rug", motes: "pulses", card: { material: "speaker", backIcon: "🏠" } },
  15: { name: "The Robot Lab", floor: "circuit", motes: "code", card: { material: "module", backIcon: "🤖" } },
  16: { name: "The Doorway Maze", floor: "checker", motes: "orchid", card: { material: "door", backIcon: "🚪" } },
  17: { name: "The Feed", floor: "glass", motes: "likes", card: { material: "post", backIcon: "👍" } },
  18: { name: "The Locker Room", floor: "lockerTile", motes: "scan", card: { material: "locker", backIcon: "🗝️" } },
  19: { name: "The Hearth", floor: "hearth", motes: "embers", card: { material: "quilt", backIcon: "👪" } },
  20: { name: "The Ceremony Stage", floor: "stage", motes: "confetti", card: { material: "certificate", backIcon: "🎓" } },
};
