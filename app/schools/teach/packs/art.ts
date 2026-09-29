/**
 * The pictures the board uses, pointed at the real icon set in /public.
 *
 * The pack was drafted against a loose art folder with its own short names,
 * so this map is the one place those names meet the 92 icon set the game
 * already ships. Keep the keys short: they are read inside slide data, where
 * a long path would drown the copy.
 *
 * Two of these are deliberate substitutions rather than direct matches, and
 * both were found by looking at the rendered board rather than the filename:
 *   envelope        -> speech-bubble   the envelope art is broken at source
 *   layla-excited   -> layla-celebrate the excited pose has a baked white
 *                                      patch that shows on a dark board
 */
export const ART = {
  key: "/cyberheroes/icons/key.png",
  muscle: "/cyberheroes/icons/muscle.png",
  symbols: "/cyberheroes/icons/symbol-keys.png",
  zipper: "/cyberheroes/icons/zipper-mouth.png",
  noentry: "/cyberheroes/icons/no-entry.png",
  vault: "/cyberheroes/icons/vault-door.png",
  trophy: "/cyberheroes/icons/trophy.png",
  gamepad: "/cyberheroes/icons/gamepad.png",
  phone: "/cyberheroes/icons/smartphone.png",
  mail: "/cyberheroes/icons/speech-bubble.png",
  mask: "/cyberheroes/icons/mask.png",
  locked: "/cyberheroes/icons/padlock.png",
  team: "/cyberheroes/icons/family.png",
  camera: "/cyberheroes/icons/camera.png",
  rocket: "/cyberheroes/icons/rocket.png",
  magnifier: "/cyberheroes/icons/magnifier.png",
  trap: "/cyberheroes/icons/mouse-trap.png",
  medal: "/cyberheroes/icons/medal.png",
  hand: "/cyberheroes/icons/stop-hand.png",
  racc: "/cyberheroes/icons/raccoon.png",
  adam: "/game/characters/adam-idle.png",
  layla: "/game/characters/layla-celebrate.png",
} as const;

export type ArtKey = keyof typeof ART;
