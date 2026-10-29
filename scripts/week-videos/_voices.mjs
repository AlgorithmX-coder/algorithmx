/* The two voices allowed in a bookend video, and their delivery.
 *
 * Emma narrates across the whole product. Callum is the Hacker Raccoon. No
 * third voice appears in a bookend, and the video models never speak: they
 * are told not to, the footage is checked for an audio stream, and any audio
 * a model does return is dropped before ours goes on.
 *
 * Kept in one file so a week cannot drift onto a different voice or a
 * different delivery by accident.
 */
export const EMMA = "oClOrzqamOXmtcB8iqTj";
export const CALLUM = "N2lVS1w4EtoT3dr4eOWO";

export const EMMA_SETTINGS = { stability: 0.6, similarity_boost: 0.75, style: 0.3, use_speaker_boost: true, speed: 0.9 };
export const VILLAIN_SETTINGS = { stability: 0.25, similarity_boost: 0.75, style: 0.6, use_speaker_boost: true, speed: 0.95 };

/* Default seconds of footage per shot. A week overrides per shot where its
 * own pacing needs it - the intro's first shot is always longer, because the
 * Raccoon's line has to finish while the Raccoon is still on screen. */
export const SHOT_SECONDS = 7;
