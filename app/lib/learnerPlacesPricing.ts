/**
 * What places cost. Pure arithmetic, no imports, safe in a browser.
 *
 * Split out of learnerPlaces.ts because the buy form is a client component
 * and needs to price the ladder as the buyer changes the number. That file
 * imports Prisma and Stripe, and importing one function from it drags the
 * whole module graph into the browser bundle, which fails the build on
 * `pg`. The repo already does this split for stickers-data vs
 * stickers.actions; same reason, same shape.
 *
 * THE LADDER (owner, settled 2026-10-13): £2,500 for the first fifty
 * places, £2,250 for every further fifty. Places are sold in blocks of
 * fifty because that is the published deal, and a block is the only unit
 * the ladder is defined on.
 */

export const PLACES_PER_BLOCK = 50;
export const BLOCK_FIRST_PENCE = 250_000;
export const BLOCK_FURTHER_PENCE = 225_000;
/* Twenty blocks is a thousand places. Past that somebody should be talking
   to us rather than typing a card number in. */
export const MAX_BLOCKS = 20;

/** What `blocks` blocks cost, in pence, before VAT. */
export function placesPricePence(blocks: number): number {
  if (!Number.isInteger(blocks) || blocks < 1) return 0;
  return BLOCK_FIRST_PENCE + (blocks - 1) * BLOCK_FURTHER_PENCE;
}

export function validateBlocks(blocks: number): string | null {
  if (!Number.isInteger(blocks)) return "Choose a whole number of blocks.";
  if (blocks < 1) return `The smallest licence is ${PLACES_PER_BLOCK} places.`;
  if (blocks > MAX_BLOCKS) {
    return `For more than ${MAX_BLOCKS * PLACES_PER_BLOCK} places, talk to us and we will quote you.`;
  }
  return null;
}
