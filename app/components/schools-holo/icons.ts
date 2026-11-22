/* The small line-icon set the Hologram Campus page draws inline (24x24,
 * stroked). Paths only; the <Icon> in SchoolsHolo.tsx wraps them. */
export const ICONS = {
  arrow: "M5 12h14M13 6l6 6-6 6",
  check: "M20 6L9 17l-5-5",
  plus: "M12 5v14M5 12h14",
  search: "M11 4a7 7 0 100 14 7 7 0 000-14z M20 20l-3.5-3.5",
  globe: "M12 3a9 9 0 100 18 9 9 0 000-18z M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18",
  shield: "M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4",
  headphones: "M4 14v-2a8 8 0 0116 0v2 M3 14.5a1.5 1.5 0 011.5-1.5H7v7H4.5A1.5 1.5 0 013 18.5z M17 13h2.5a1.5 1.5 0 011.5 1.5v4a1.5 1.5 0 01-1.5 1.5H17z",
  book: "M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2z M12 6v14",
} as const;

export type IconName = keyof typeof ICONS;
