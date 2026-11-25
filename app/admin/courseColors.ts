/* Per-course identity colours for the admin portal - distinct from the
 * four section colours in admin.css (Schools/Organisations/Firms/
 * Individuals mark "which tab"; these mark "which course" inside a
 * row, mostly on the Individuals tab where one person can hold several).
 * Tuned for the dark console: each reads as text on the near-black
 * ground and as a tint behind itself at ~14% alpha. */
export const COURSE_COLORS: Record<string, string> = {
  "Cyber Heroes": "#fb923c",
  /* the production Product row still carries the old name */
  "Cyber Heroes Academy": "#fb923c",
  "Cyber Explorers": "#34d399",
  "Cyber Ops": "#c084fc",
  "Cyber Pro": "#60a5fa",
  "AI Cleared": "#22d3ee",
  "AI Fluent": "#2dd4bf",
  "Cyber Awareness": "#f472b6",
  "Cyber Secured": "#38bdf8",
  "Desk Ready": "#fbbf24",
};

const FALLBACK = "#94a3b8";

export function courseColor(name: string): string {
  return COURSE_COLORS[name] ?? FALLBACK;
}
