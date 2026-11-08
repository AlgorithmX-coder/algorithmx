import type { OrgWords } from "./schools/AdminSchoolsPanel";

/**
 * The two vocabularies.
 *
 * A school and a youth organisation run on identical machinery: the same
 * four courses, the same classes, pupils, picture sign-in and places ledger.
 * What differs is who you are selling to and what they call themselves, so
 * the difference lives here, in words, rather than in a second set of tables
 * and a second set of screens that would drift apart.
 */

export const SCHOOL_WORDS: OrgWords = {
  kind: "SCHOOL",
  Noun: "School",
  noun: "school",
  namePlaceholder: "Oakwood Primary",
  sectorPlaceholder: "Primary school",
  contactPlaceholder: "Head of computing",
  emailHint: "teacher@school.sch.uk",
  firstPerson: "First teacher",
};

export const ORGANISATION_WORDS: OrgWords = {
  kind: "ORGANISATION",
  Noun: "Organisation",
  noun: "organisation",
  namePlaceholder: "Leicester Youth Club",
  sectorPlaceholder: "Youth club, council, charity",
  contactPlaceholder: "Who runs the sessions",
  emailHint: "their.name@example.com",
  firstPerson: "First leader",
};
