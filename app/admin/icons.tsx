/* Small inline SVG icon set for the admin portal - one per section, plus
 * a search glyph for the list controls. Stroke-based, 24x24 viewBox,
 * currentColor throughout so they pick up whatever colour wraps them. */

type IconProps = { className?: string };

export function SchoolIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3 2 8l10 5 10-5-10-5Z" />
      <path d="M6 10.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-5.5" />
      <path d="M22 8v7" />
    </svg>
  );
}

/* Organisations: a youth club, council, charity or training provider. Three
   figures rather than a building, because what they have in common is a
   group of young people, not a site. */
export function OrganisationIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="7" r="3" />
      <path d="M7 21v-2a5 5 0 0 1 10 0v2" />
      <path d="M4 13.5a2.5 2.5 0 1 1 2-4.4" />
      <path d="M20 13.5a2.5 2.5 0 1 0-2-4.4" />
    </svg>
  );
}

export function FirmIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2.5" y="7.5" width="19" height="12" rx="2" />
      <path d="M8 7.5V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1.5" />
      <path d="M2.5 13h19" />
    </svg>
  );
}

export function IndividualsIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 20c0-3.3 2.5-5.5 5.5-5.5s5.5 2.2 5.5 5.5" />
      <path d="M16 8.5a3 3 0 1 0 0-6" />
      <path d="M15 14.8c2.6.3 4.5 2.3 4.5 5.2" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
