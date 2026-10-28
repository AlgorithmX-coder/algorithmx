/**
 * The 7 recurring threat-actor portraits (public/explorers/actors), keyed by
 * codename — shared by every per-block mission-briefing screen and the
 * Watchlist gallery, so a kid sees the same dossier photo everywhere that
 * actor appears, not just in VillainGallery (which reads it straight off
 * MissionManifest.actor.portrait). MissionIntroData doesn't carry that field,
 * so the briefings look it up here by codename instead.
 */
export const ACTOR_PORTRAIT: Record<string, string> = {
  "PHANTOM HOOK": "/explorers/actors/phantom-hook.png",
  SIREN: "/explorers/actors/siren.png",
  "SKELETON KEY": "/explorers/actors/skeleton-key.png",
  PACKRAT: "/explorers/actors/packrat.png",
  MIMIC: "/explorers/actors/mimic.png",
  GHOSTWRITER: "/explorers/actors/ghostwriter.png",
  ZERO: "/explorers/actors/coordinator.png",
};
