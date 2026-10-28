/**
 * WEEK ARTWORK - the file, and where to look in it.
 *
 * Owner, 28 October 2026: "Some of them look low quality ... a lot of them,
 * especially number 6, they kind of need to be centred just so we can see
 * exactly what the image is. So yeah, have a run through all of them. And
 * then centre them appropriately." And then, on where: "the dashboard week
 * tiles, I'm talking about them ... I just want to make sure that we're still
 * using the high quality centred images."
 *
 * WHY THIS FILE EXISTS AT ALL. The artwork is 4:5 portrait; the cards that
 * show it are shorter than that, so `object-fit: cover` always crops a band
 * out of the middle and `object-position` decides WHICH band. Both surfaces
 * were picking that band with a single hardcoded number for all twenty
 * images - the dashboard used 68%, the landing page used 52% - and the
 * subjects actually sit anywhere from 48% to 77%. That is why week 6's
 * characters were sliced and week 7 sat off-centre.
 *
 * One number per week, in one place, read by BOTH the dashboard tile and the
 * landing card. The owner's specific worry was that a fix would land on the
 * sales page and not on the page you see after logging in; sharing the map
 * makes that impossible by construction.
 *
 * HOW THE NUMBERS WERE FOUND. Every scene was briefed the same way: dark and
 * low contrast, with the character lit and the rest left empty. So the lit
 * region IS the subject, and a brightness-weighted centre of mass finds it
 * (scripts/_focal.mjs) rather than me guessing twenty times. Measured first,
 * then checked by eye on a contact sheet and nudged where the maths picked a
 * glow instead of a face.
 */

/** Vertical focal point per week, as a percentage for `object-position`. */
export const WEEK_ART_FOCUS: Record<number, number> = {
  1: 74, 2: 73, 3: 61, 4: 67, 5: 65,
  6: 72, 7: 53, 8: 69, 9: 66, 10: 77,
  11: 67, 12: 74, 13: 48, 14: 60, 15: 71,
  16: 67, 17: 62, 18: 75, 19: 67, 20: 74,
};

/** Weeks whose artwork exists in /public/dashboard/week-art. */
export const WEEK_ART_WEEKS: ReadonlySet<number> = new Set(
  Array.from({ length: 20 }, (_, i) => i + 1),
);

export const weekArtSrc = (week: number) => `/dashboard/week-art/week-${week}.webp`;

/**
 * The `object-position` for a week's artwork. Falls back to the middle, which
 * is the least-wrong default for art that has not been measured.
 */
export const weekArtPosition = (week: number) =>
  `center ${WEEK_ART_FOCUS[week] ?? 60}%`;
