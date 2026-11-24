/* The twelve favourite colours a grown-up can pick for their hero on
 * /onboarding. The slug is what is saved on ChildProfile.favouriteColour,
 * so slugs never change: a saved profile has to keep meaning the same
 * colour. The labels name the colour actually shown (landing lab round 6,
 * 2026-11-23), and "Glowing Gold" is a real gold now; it used to be the same
 * violet as Mystic Violet. Data only, safe in client and server code. */

export interface HeroColour {
  slug: string;
  hex: string;
  label: string;
}

export const HERO_COLOURS: readonly HeroColour[] = [
  { slug: "purple", hex: "#7c5cff", label: "Mystic Violet" },
  { slug: "blue", hex: "#6aa6ff", label: "Sky Blue" },
  { slug: "cyan", hex: "#7eff97", label: "Mint Green" },
  { slug: "green", hex: "#5eff80", label: "Meadow Green" },
  { slug: "amber", hex: "#00e5ff", label: "Electric Cyan" },
  { slug: "pink", hex: "#f7c1d6", label: "Blossom Pink" },
  { slug: "neon-violet", hex: "#c08aff", label: "Lavender Magic" },
  { slug: "plasma-magenta", hex: "#ff5fb3", label: "Bubblegum Pink" },
  { slug: "inferno-red", hex: "#ff7a59", label: "Coral" },
  { slug: "glitch-gold", hex: "#ffc93c", label: "Glowing Gold" },
  { slug: "frost-teal", hex: "#5fa8b3", label: "Frost Teal" },
  { slug: "laser-lime", hex: "#a8c46a", label: "Soft Lime" },
];

export const DEFAULT_HERO_COLOUR = "purple";

export function heroColour(slug: string | null | undefined): HeroColour {
  return HERO_COLOURS.find((c) => c.slug === slug) ?? HERO_COLOURS[0];
}

/* Dark ink on a light swatch, white on a dark one (relative luminance). */
export function inkOn(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const lin = (c: number) => { const v = c / 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  const L = 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
  return L > 0.28 ? "#0b1026" : "#ffffff";
}
