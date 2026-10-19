import type React from "react";

/**
 * Section tag — the "live ticker" eyebrow (owner pick 2026-10-19, concept 3
 * of the 10-design board). A status dot plus the label, underlined by a
 * gradient bar that sweeps cyan -> violet -> pink. Replaces the old solid
 * teal pill ([[sectionMark]]) on every homepage section.
 *
 * Styling lives in globals.css (.lv2-smark*) so the sweep keyframe is defined
 * once rather than per instance. Colours come from the lv2 tokens, so it
 * adapts to the sand homepage and the dark pages alike. Label is uppercased
 * in CSS, so pass it in whatever case reads best in source.
 */
export function SectionTag({ children }: { children: React.ReactNode }) {
  return (
    <span className="lv2-smark">
      <span className="lv2-smark-row">
        <span aria-hidden className="lv2-smark-dot" />
        <span className="lv2-smark-txt">{children}</span>
      </span>
      <span aria-hidden className="lv2-smark-bar" />
    </span>
  );
}

export default SectionTag;
