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
  /* Added for weeks 2 and 3: the places a stranger could reach a child, and
     the tools for checking who is really there. All of these were already in
     /public; only this map had not heard of them. */
  home: "/cyberheroes/icons/home.png",
  school: "/cyberheroes/icons/school.png",
  nametag: "/cyberheroes/icons/name-tag.png",
  pin: "/cyberheroes/icons/map-pin.png",
  shield: "/cyberheroes/icons/shield.png",
  question: "/cyberheroes/icons/question-mark.png",
  pause: "/cyberheroes/icons/pause-button.png",
  detective: "/cyberheroes/icons/detective.png",
  eye: "/cyberheroes/icons/eye.png",
  warning: "/cyberheroes/icons/warning.png",
  idcard: "/cyberheroes/icons/id-card.png",
  share: "/cyberheroes/icons/share-board.png",
  speech: "/cyberheroes/icons/speech-bubble.png",
  brain: "/cyberheroes/icons/brain.png",
  stopwatch: "/cyberheroes/icons/stopwatch.png",
} as const;

export type ArtKey = keyof typeof ART;
