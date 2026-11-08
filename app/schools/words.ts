import type { LearnerOrgKind } from "@prisma/client";

/**
 * The two vocabularies, customer side.
 *
 * A school and a youth organisation run on identical machinery: the same
 * four courses, the same classes, pupils, picture sign-in and places
 * ledger. What differs is what the buyer calls themselves and the people
 * in front of them. A youth club does not have pupils and does not teach
 * classes, and reading "pupils" on your own dashboard is the moment you
 * notice you were sold a school product with the labels left on.
 *
 * So the difference lives here, in words, rather than in a second set of
 * tables and a second set of screens that would drift apart. Staff have
 * the same split for the admin console in `app/admin/orgWords.ts`; this is
 * the customer-facing half, and the two are deliberately separate files
 * because they are read by different people for different reasons.
 */
export interface SchoolWords {
  /** The buyer. "School" / "Organisation". */
  Noun: string;
  noun: string;
  /** The children. "pupils" / "young people". */
  people: string;
  person: string;
  /** A group of them. "class" / "group". */
  Group: string;
  group: string;
  groups: string;
  /** The adults who run them. "teacher" / "leader". */
  Staff: string;
  staff: string;
  staffs: string;
  /** The person who holds the licence, for the one line that names them. */
  head: string;
  /** What a class is grouped by, where a school says "Year 4". */
  yearLabel: string;
}

export const SCHOOL_WORDS: SchoolWords = {
  Noun: "School",
  noun: "school",
  people: "pupils",
  person: "pupil",
  Group: "Class",
  group: "class",
  groups: "classes",
  Staff: "Teacher",
  staff: "teacher",
  staffs: "teachers",
  head: "head",
  yearLabel: "Year",
};

export const ORGANISATION_WORDS: SchoolWords = {
  Noun: "Organisation",
  noun: "organisation",
  people: "young people",
  person: "young person",
  Group: "Group",
  group: "group",
  groups: "groups",
  Staff: "Leader",
  staff: "leader",
  staffs: "leaders",
  head: "lead",
  /* A youth club's Thursday group is not "Year 7", but the field behind it
     is the same one, so the label changes and the data does not. */
  yearLabel: "Age",
};

export function wordsFor(kind: LearnerOrgKind | null | undefined): SchoolWords {
  return kind === "ORGANISATION" ? ORGANISATION_WORDS : SCHOOL_WORDS;
}
