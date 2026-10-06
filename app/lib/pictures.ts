/**
 * The pictures a child's password is made of.
 *
 * Its own module, with NO imports, because both sides need it: the grid a
 * child taps is a client component, and the check that a tapped sequence is
 * real runs on the server next to Prisma and bcrypt. Putting these constants
 * in `pupilAuth.ts` meant the browser bundle pulled in the database client,
 * which the bundler caught and the typechecker did not.
 */

/** How many pictures make a password. Three is more than a guess between
 *  twelve, and few enough that a six year old does not lose their place. */
export const SEQUENCE_LENGTH = 3;

/** Drawn from the icon set the course already uses, so they are things the
 *  children have met in the game.
 *
 *  Chosen to be mutually unmistakable at a glance. An earlier set had a house
 *  AND a school, and a trophy AND a medal: both pairs look alike at speed to a
 *  six year old, and a password you confuse is a password you are locked out
 *  of. Replaced with things a child can name instantly. */
export const PICTURE_KEYS = [
  "rocket", "key", "trophy", "gamepad", "camera", "star",
  "dog", "mask", "shield", "pizza", "home", "cake",
] as const;

export type PictureKey = (typeof PICTURE_KEYS)[number];

/** What a screen reader says, and what a teacher says out loud when helping. */
export const PICTURE_LABEL: Record<PictureKey, string> = {
  rocket: "Rocket", key: "Key", trophy: "Trophy", gamepad: "Controller",
  camera: "Camera", star: "Star", dog: "Dog", mask: "Mask",
  shield: "Shield", pizza: "Pizza", home: "House", cake: "Cake",
};

/** Key to the file in /public/cyberheroes/icons. */
export const PICTURE_FILE: Record<PictureKey, string> = {
  rocket: "rocket", key: "key", trophy: "trophy", gamepad: "gamepad",
  camera: "camera", star: "sparkle-star", dog: "dog", mask: "mask",
  shield: "shield", pizza: "pizza", home: "home", cake: "cake",
};
