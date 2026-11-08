/* The shared prompt vocabulary every bookend film is written in.
 *
 * Extracted from _generate-week-files.mjs when weeks 11-20 moved to a
 * three-shot shape. Both generators import from here, so a rule learned on
 * one week applies to every week that is generated afterwards. Copying these
 * strings into a second generator instead is how the eyes-closed rule would
 * come back on week 14 after being fixed on week 6.
 */

/* Naming the OBJECTS, not just "writing". The week 3 detective wall came back
 * covered in little cards of green pseudo-code: the model does not count a
 * screen full of glyphs as "writing", so it has to be told about screens. */
export const NOTEXT =
  "CRITICAL: the picture fills the entire frame edge to edge, with no black bars, no letterboxing and no borders at any edge. No screens, no monitors, no displays, no pinned notes or cards, no diagrams, no icons, no code, no text, no letters, no numbers, no brand marks, no badges, no patches, no flags, no emblems, no insignia and no writing of any kind anywhere in the picture.";

export const villain = ({ pose, set, light }) =>
  `Stylised 3D cartoon still, cinematic, for a children's cybersecurity cartoon. The striped grey raccoon villain from the reference image, wearing his purple circuit-patterned hoodie with the hood UP over his head and his cape, ${pose}, in ${set}. ${light} His mouth is closed. ${NOTEXT} No human characters. 16:9 cinematic framing, full scene, nothing cropped.`;

export const heroes = ({ costume, pose, set, light }) =>
  `Stylised 3D cartoon still, cinematic, for a children's cybersecurity cartoon. The two child heroes from the reference images, a boy with short curly dark hair and a girl with two afro puffs, both wearing ${costume}, ${pose}, in ${set}. ${light} Both children fully in frame, mouths closed, eyes OPEN, calm and capable. ${NOTEXT} 16:9 cinematic framing, full scene, nothing cropped.`;

/* "Keep the costumes" is not enough on its own. Week 4's beaten Raccoon came
 * back bare-headed with a different cape: the model reads a defeated pose as
 * licence to restyle the character. So the end frame restates the costume as
 * a positive instruction rather than only a thing to preserve. */
export const KEEP_VILLAIN =
  "The raccoon KEEPS his purple circuit-patterned hoodie with the hood UP over his head and his cape on: his costume does not change at all.";

/* From week 11. Its outro came back with GREEN eyes against the intro's amber
 * ones: the costume was restated and held, the eye colour was not restated and
 * drifted. Anything not named is a thing free to move. Kept separate from
 * KEEP_VILLAIN so the weeks 1-10 files stay a faithful record of the prompts
 * that actually produced their shipped art. */
export const KEEP_VILLAIN_V2 = `${KEEP_VILLAIN} He also keeps the same AMBER GOLDEN-BROWN eyes: his eye colour does not change at all.`;

/* Owner, 2026-10-29, on week 6's outro: "Adam and Layla laughing with their
 * eyes closed... recreate it with their eyes open." Asked to cheer, the model
 * reaches for a squeezed-shut laughing face, which on a still reads as a
 * blink. It had done it on weeks 3, 4 and 6. So every hero frame says it. */
export const EYES = "Both children have their eyes OPEN, never closed or squeezed shut.";

export const KEEP_HEROES = (costume) =>
  `Both children KEEP wearing ${costume}: their costumes do not change at all. ${EYES}`;

export const endFrame = (change, keep) =>
  `Keep the set, the background, the lighting and the camera framing EXACTLY as they are in the reference image. ${keep} Change ONLY this: ${change}. Same characters, same costumes, same colours, same camera. ${NOTEXT}`;

/* ── the two motion registers ─────────────────────────────────────────────
 * Weeks 1-10 were all ordered with the SLOW prefix, and that is half of why
 * the owner said, 2026-10-29: "when it shows Adam and Layla is too slow
 * motion... maybe speed up their motion a little bit." Forty clips were
 * asked for slow motion in their first four words.
 *
 * The other half was duration. A clip is ordered as long as the voice over it
 * needs, and a pinned pair whose two frames differ by ONE small action gets
 * that one action spread across the whole order: week 3's opening shot moved
 * a mask away from a face over FIFTEEN seconds. No prompt wording survives
 * that. So BRISK comes with two rules kept by the generator below: a shot
 * carries at most one voice turn's worth of lines, and the action between its
 * two frames is a two-beat move rather than a single gesture.
 */
export const motionSlow = (m) =>
  `Slow, smooth cinematic shot. ${m} ONE continuous shot, no cuts, camera almost still. Nobody speaks and no mouth moves to form words. No text, no captions, no subtitles.`;

export const motionBrisk = (m) =>
  `Lively cinematic shot at natural real-world speed. ${m} The movement is brisk and purposeful and carries right through the shot: nothing drifts, floats, hangs or slides in slow motion, and there is no slow-motion or dreamlike effect of any kind. ONE continuous shot, no cuts, camera almost still. Nobody speaks and no mouth moves to form words. No text, no captions, no subtitles.`;
