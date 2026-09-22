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

/** Left-aligned, for a mark that sits in a column rather than centred. */
export const sectionMarkWrap: React.CSSProperties = {
  ...sectionMark,
  textAlign: "left",
};
