/**
 * The ethics reminder — spoken once after every skill clears, in every
 * block. One shared WREN line, recorded once (not 100+ bespoke ones): the
 * message is identical each time on purpose, so it stays consistent and
 * never drifts in tone. Originally a Block 3 UAT request ("stress ethics
 * throughout this module"), rolled out everywhere since the concern is the
 * same in every block — everything taught is to defend, never to copy
 * against someone else.
 */
export const ETHICS_LINE =
  "Quick reminder before we move on, Agent. Everything you just built is to protect YOUR accounts. Never use what you've learned to get into someone else's.";
export const ETHICS_VOICE = "/audio/wren/ethics-defend-not-attack.mp3";
