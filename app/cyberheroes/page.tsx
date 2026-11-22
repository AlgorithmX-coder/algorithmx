import HeroesSaturday from "@/app/components/heroes-sat/HeroesSaturday";

/**
 * /cyberheroes - the Cyber Heroes landing page for parents.
 *
 * 2026-11-22: the Saturday Morning design replaces the dark cosmic page. The
 * owner reviewed ten full-page concepts in the landing lab (round 3), picked
 * Saturday Morning (bright: cream, sky, one sun) and said "push it live".
 * Copy, routes, section order, the hero film's twice-through sound rules and
 * the week cards' art/focus/accent sources are unchanged from the page it
 * replaces; everything visual is new and lives in app/components/heroes-sat.
 * Metadata, OG/Twitter cards, the Course JSON-LD and the route fonts stay in
 * layout.tsx. The previous composition (CyberHeroesNav, the cosmic hero,
 * CastRow, MissionShowcase, CyberHeroesPlayfulBackdrop) is kept in git
 * history; MissionShowcase and CastRow remain on disk.
 */
export default function CyberHeroesPage() {
  return <HeroesSaturday />;
}
