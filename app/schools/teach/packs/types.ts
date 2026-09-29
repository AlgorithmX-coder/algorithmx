/**
 * A teacher pack is one week of Cyber Heroes, written for the adult standing
 * in front of the class rather than for the child at the screen.
 *
 * The shape below is deliberately small. A week is DATA; the shell that draws
 * it is constant. That was proved on three structurally different weeks before
 * any of this reached the repo: week 1 is an ordinary week, week 11 has no
 * villain and carries a safeguarding briefing, and week 20 teaches nothing new.
 * None of them needed a special case, so none of them gets one here.
 *
 * COPY IN THESE FIELDS IS AUTHORED HTML. Several fields carry real markup
 * (`<b>`, `<em>`, `<br>`) and typographic entities, because a teacher script
 * needs emphasis to be readable at a glance. It is written by us, checked in,
 * and never comes from a user, which is why the renderer is allowed to set it
 * as HTML. Anything that ever becomes user supplied must not use these fields.
 */

/** Which side of the lesson a slide belongs to. The 45 minutes on the
 *  computers sits between them, and the deck says so out loud. */
export type Phase = "before" | "after";

/** What the teacher does with the slide. `tell` is said, `ask` is a question
 *  to the room, `do` is an instruction. There is no `answer` kind on purpose:
 *  answers live in the teacher notes, never on the board where a child reads
 *  them before they have thought. */
export type SlideKind = "tell" | "ask" | "do";

/** The board pictures a slide can ask for. Adding a week may add a scene;
 *  each one is a small component in Scenes.tsx and nothing else changes. */
export type SceneKey =
  | "meet" | "racc" | "risks" | "scenarios" | "five" | "tiles" | "recipe"
  | "solo" | "tonight" | "heroes" | "team" | "protocol" | "grad";

/** One of the five things a week teaches, as it appears on the wall. */
export interface Concept {
  /** Absolute path under /public. */
  art: string;
  name: string;
  line: string;
}

/** A thing a child might say, and what the teacher can say back. This is the
 *  single most used part of the pack in a real classroom, which is why it is
 *  a first class field and not a note at the bottom. */
export type Heard = readonly [heard: string, reply: string];

export interface Slide {
  at: Phase;
  kind: SlideKind;
  /** Small label above the title. */
  eyebrow: string;
  /** May contain `<br>` to control how it breaks on the board. */
  title: string;
  /** The teacher's script. Authored HTML. */
  say: string;
  scene?: SceneKey;
  /** A line under the title, on the board. */
  under?: string;
  /** What the teacher is told to watch for. Authored HTML. */
  warn?: string;
  hear?: readonly Heard[];
  /** Anchor so another slide can point here by name rather than by number.
   *  Numbers go stale the moment a slide is inserted; names do not. */
  id?: string;
  /** A cross reference. `text` contains one `%s`, replaced with the live
   *  slide number of `to` at render time. */
  link?: { to: string; text: string };
  /** Speech bubble, for the scenes that have somebody speaking. */
  bubble?: string;
  /** Marks the hand-over to the 45 minutes on the computers. */
  handover?: true;
  /** `solo` scene: the one picture this slide is about. */
  art?: string;
  /** `risks` scene: the same three cards, now stamped as stopped. */
  safe?: true;
  /** `tiles` scene: show how long each password would take to guess. */
  clocks?: true;
}

/** Country neutral by design. Every country has a different child line service,
 *  so the pack ships without a number and the board teaches the IDEA under one
 *  name the whole course uses: "the child line service". The centre fills the
 *  number in once, because only the centre knows which country it is in. A
 *  wrong number in a safeguarding lesson is worse than no number at all, so we
 *  never guess one and never ship a table of them. */
export interface HelplineSlot {
  /** What the board says when no number is set. */
  label: string;
  note: string;
  /** What the teacher deck tells the teacher to do about it. */
  setup: string;
}

/** Shown before the deck, on weeks that need the teacher prepared. */
export interface Briefing {
  head: string;
  body: readonly string[];
}

export interface Pack {
  n: number;
  title: string;
  sub: string;
  five: readonly Concept[];
  slides: readonly Slide[];
  /** The mini games in this week, named so the teacher can recognise what
   *  they see on the children's screens. */
  games: string;
  helpline?: HelplineSlot;
  brief?: Briefing;
}
