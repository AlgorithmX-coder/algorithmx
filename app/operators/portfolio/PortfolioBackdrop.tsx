/* Portfolio backdrop - a soft purple nebula over a faint grid, tuned to the
 * Cyber Ops indigo theme (owner pick 2026-10-28, "Soft"). Replaces the live-
 * terminal OpsBackdrop on the portfolio page only; every other Ops surface keeps
 * OpsBackdrop. Static CSS: fixed full-bleed, behind the content, inert to input.
 *
 * Layers (back to front): two violet nebula blooms in opposite corners, a 40px
 * minor grid + 160px major grid in faint indigo, a sparse starfield, then the
 * near-black base. */
const BG =
  "radial-gradient(46% 54% at 28% 27%, rgba(139,123,255,0.28), transparent 60%)," +
  "radial-gradient(48% 56% at 82% 74%, rgba(118,96,255,0.22), transparent 62%)," +
  "linear-gradient(rgba(139,123,255,0.05) 1px, transparent 1px) 0 0 / 40px 40px," +
  "linear-gradient(90deg, rgba(139,123,255,0.05) 1px, transparent 1px) 0 0 / 40px 40px," +
  "linear-gradient(rgba(139,123,255,0.09) 1px, transparent 1px) 0 0 / 160px 160px," +
  "linear-gradient(90deg, rgba(139,123,255,0.09) 1px, transparent 1px) 0 0 / 160px 160px," +
  "radial-gradient(circle, rgba(255,255,255,0.5) 0.5px, transparent 0.7px) 20px 20px / 90px 90px," +
  "#07060e";

export default function PortfolioBackdrop() {
  return (
    <div
      aria-hidden
      style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", background: BG }}
    />
  );
}
