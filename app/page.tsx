/**
 * Production homepage.
 *
 * Re-exports the landing-v2 cinematic design as the canonical homepage.
 * The previous Pixar-dusk warm-themed homepage is preserved in git history
 * (last commit before this swap: see PR `redesign/landing-3d-hero-v1`).
 *
 * Single source of truth lives in `app/landing-v2/page.tsx` so anyone
 * iterating on the design only edits one file.
 */
export { default } from "./landing-v2/page";
