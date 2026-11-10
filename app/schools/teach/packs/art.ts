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
  star: "/cyberheroes/icons/sparkle-star.png",
  laughing: "/cyberheroes/icons/laughing.png",
  megaphone: "/cyberheroes/icons/megaphone.png",
  /* Added for weeks 6 to 19: the rest of the icon set, in one go, so that
     writing a week never has to touch this file. `envelope` stays out for the
     reason above, and so does `cake`: the keying punched a hole through its
     white icing, which is invisible on white and a black blotch on the board. */
  bell: "/cyberheroes/icons/bell.png",
  brick: "/cyberheroes/icons/brick.png",
  check: "/cyberheroes/icons/check-badge.png",
  clipboard: "/cyberheroes/icons/clipboard.png",
  crown: "/cyberheroes/icons/crown.png",
  diamond: "/cyberheroes/icons/diamond.png",
  dice: "/cyberheroes/icons/dice.png",
  dog: "/cyberheroes/icons/dog.png",
  door: "/cyberheroes/icons/door.png",
  fist: "/cyberheroes/icons/fist.png",
  gear: "/cyberheroes/icons/gear.png",
  gift: "/cyberheroes/icons/gift.png",
  globe: "/cyberheroes/icons/globe.png",
  gradcap: "/cyberheroes/icons/graduation-cap.png",
  hammer: "/cyberheroes/icons/hammer.png",
  cape: "/cyberheroes/icons/hero-cape.png",
  hospital: "/cyberheroes/icons/hospital.png",
  inbox: "/cyberheroes/icons/inbox.png",
  keyboard: "/cyberheroes/icons/keyboard.png",
  letters: "/cyberheroes/icons/letter-blocks.png",
  bulb: "/cyberheroes/icons/lightbulb.png",
  lightning: "/cyberheroes/icons/lightning.png",
  link: "/cyberheroes/icons/link.png",
  mailbox: "/cyberheroes/icons/mailbox.png",
  mouse: "/cyberheroes/icons/mouse.png",
  numbers: "/cyberheroes/icons/number-blocks.png",
  padkey: "/cyberheroes/icons/padlock-key.png",
  unlocked: "/cyberheroes/icons/padlock-open.png",
  palette: "/cyberheroes/icons/palette.png",
  party: "/cyberheroes/icons/party.png",
  person: "/cyberheroes/icons/person.png",
  pizza: "/cyberheroes/icons/pizza.png",
  pushpin: "/cyberheroes/icons/pushpin.png",
  puzzle: "/cyberheroes/icons/puzzle.png",
  robot: "/cyberheroes/icons/robot.png",
  rookie: "/cyberheroes/icons/rookie-badge.png",
  shuffle: "/cyberheroes/icons/shuffle.png",
  shush: "/cyberheroes/icons/shush.png",
  skeleton: "/cyberheroes/icons/skeleton-key.png",
  sparkles: "/cyberheroes/icons/sparkles.png",
  swirl: "/cyberheroes/icons/swirl.png",
  tap: "/cyberheroes/icons/tap-finger.png",
  target: "/cyberheroes/icons/target.png",
  thumbsup: "/cyberheroes/icons/thumbs-up.png",
  trash: "/cyberheroes/icons/trash.png",
} as const;

export type ArtKey = keyof typeof ART;
