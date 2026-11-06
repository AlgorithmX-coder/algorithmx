/* Per-course identity colours for the admin portal - distinct from the
 * three section colours in admin.css (Schools/Firms/Individuals mark
 * "which tab"; these mark "which course" inside a row, mostly on the
 * Individuals tab where one person can hold several). Reuses a brand
 * colour where one already exists elsewhere on the site (Cyber Heroes'
 * amber, AI Cleared's teal); the rest are new but kept in the same
 * muted-enough register as --schools/--firms/--individuals so a chip
 * reads as "a label", not a loud marketing swatch. */
export const COURSE_COLORS: Record<string, string> = {
  "Cyber Heroes Academy": "#9a5b00",
  "Cyber Explorers": "#15803d",
  "Cyber Ops": "#7c3aed",
  "Cyber Pro": "#2563eb",
  "AI Cleared": "#0a7085",
  "AI Fluent": "#0f766e",
};

const FALLBACK = "#5b6572";

export function courseColor(name: string): string {
  return COURSE_COLORS[name] ?? FALLBACK;
}
