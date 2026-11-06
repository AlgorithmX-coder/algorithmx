/**
 * Vertically centre a panel's content WITHOUT ever cutting off its top.
 *
 * `justify-content: center` on a scrolling column pushes overflow out of the
 * top AND the bottom, and the part above the top can never be scrolled to:
 * that is why the Phone/Console/War Room debriefs lost their titles on laptop
 * screens while "Next case" at the bottom still looked fine. Auto margins on
 * the first and last child centre the content when there is room and
 * collapse to 0 when there isn't, so it simply scrolls from the top.
 */
export const SAFE_CENTER = "ax-safe-center";

export const SAFE_CENTER_CSS =
  ".ax-safe-center{display:flex;flex-direction:column;overflow-y:auto;min-height:0}" +
  ".ax-safe-center>:first-child{margin-top:auto}" +
  ".ax-safe-center>:last-child{margin-bottom:auto}";
