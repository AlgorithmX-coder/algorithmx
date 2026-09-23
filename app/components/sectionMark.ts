import type React from "react";

/**
 * The section mark.
 *
 * Every eyebrow on both landing pages used to be faint mono text, and on
 * paper faint mono text disappears: the owner flagged six of them
 * separately as "disguised". Rather than treat them one at a time, this is
 * the one treatment they all take.
 *
 * Solid rather than tinted, because these sit over three different grounds
 * (sand, the silver laptop lid, and the globe) and a tinted pill has
 * nothing to push against on the lighter two. Paper on #0a7085 measures
 * 5.6:1, so it reads on any of them.
 */
export const sectionMark: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  margin: 0,
  padding: "7px 15px",
  borderRadius: 999,
  background: "#0a7085",
  color: "#fffdfa",
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 11.5,
  fontWeight: 700,
  letterSpacing: "0.2em",
  textTransform: "uppercase",
  /* Wraps rather than clips. The hero's label is 38 characters and at
     390px nowrap cut it off mid-word inside a pill that could not scroll:
     the page has no horizontal scroll, so the end was simply gone. Every
     label fits one line at desktop widths, so this only ever engages on a
     phone. */
  whiteSpace: "normal",
  boxShadow:
    "0 10px 24px -14px rgba(10,112,133,0.95), inset 0 1px 0 rgba(255,255,255,0.28)",
};

/**
 * The mark without its badge: the label itself in deep teal, nothing
 * behind it.
 *
 * Owner 2026-09-23, on the /schools hero: "remove the coloured backdrop,
 * maybe just highlight the font". A hero eyebrow sits above a very large
 * headline and can afford to be the quiet one, where a section eyebrow
 * competing with a page full of cards cannot. This is deliberately the
 * exception, so the section marks below it keep the badge.
 *
 * #0a7085 on the sand ground measures 4.9:1, so the label still clears AA
 * on its own. The weight and tracking go up to carry the emphasis the
 * badge used to.
 */
export const sectionMarkBare: React.CSSProperties = {
  display: "inline-block",
  margin: 0,
  /* Say it, do not assume it. On /schools this lands on a bare <p>, but
     the homepage hero keeps its pill in a class (.lv2-hero-eyebrow), and
     an inline style that set only colour and type would have left the
     card sitting behind the label. */
  padding: 0,
  background: "none",
  border: "none",
  borderRadius: 0,
  boxShadow: "none",
  backdropFilter: "none",
  WebkitBackdropFilter: "none",
  textShadow: "none",
  color: "#0a7085",
  fontFamily: "var(--lv2-font-mono)",
  fontSize: 12.5,
  fontWeight: 800,
  letterSpacing: "0.26em",
  textTransform: "uppercase",
  whiteSpace: "normal",
};

/** Left-aligned, for a mark that sits in a column rather than centred. */
export const sectionMarkWrap: React.CSSProperties = {
  ...sectionMark,
  textAlign: "left",
};
