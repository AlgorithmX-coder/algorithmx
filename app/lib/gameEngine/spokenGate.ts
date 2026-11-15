/**
 * Belt-and-braces release for a spoken gate: a board that is held while Sarah
 * speaks (taps disabled, the next beat waiting). InfoNarration already fires
 * onDone on end / error / blocked / no-recording, and every engine releases on
 * the master mute separately, so this timer only matters when none of those
 * fire. It therefore has to be LONGER than the longest clip an engine gates on.
 *
 * At 15 s it was not: the Clue Stamper's how-to runs 14.6 s and a case
 * read-aloud 16 s, so the gate unmounted the narration and the child heard the
 * last word cut off ("tap Close the ..."; UAT round 2, W3 items 3a/3b).
 *
 * At 45 s it stopped being enough after the 2026-11-15 course re-record: the
 * new recordings give every bullet a full break and read at a calmer pace, so
 * game how-tos grew (W4 Name Tag Check 51 s, the longest card 63 s) and 45 s
 * would have cut them mid-sentence. 90 s clears the longest clip by a wide
 * margin and still frees a stuck board.
 */
export const SPOKEN_GATE_MAX_MS = 90000;
