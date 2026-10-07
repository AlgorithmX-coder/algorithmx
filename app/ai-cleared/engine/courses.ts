/* The two corporate courses, as the client and the server both see them.
 * Data only: no Prisma here, so the player and the frame can import it.
 * A course is a product slug, a seat key, a home path and the words the
 * shared pages need to read right for either course. */

export type CourseSlug = "ai-cleared" | "ai-fluent";
export type CourseKey = "AI_CLEARED" | "AI_FLUENT";

/* Narrow a database CourseKey (which also includes the consumer course
 * CYBER_PRO) to the two corporate courses. Seats and firm enrolments are
 * only ever corporate, so CYBER_PRO never reaches here; this falls back to
 * AI_CLEARED defensively rather than widening the corporate types. */
export function corporateCourse(k: string): CourseKey {
  return k === "AI_FLUENT" ? "AI_FLUENT" : "AI_CLEARED";
}

export interface CourseDef {
  slug: CourseSlug;
  key: CourseKey;
  /* "AI Cleared" */
  name: string;
  /* The header wordmark: "AI CLEARED" */
  brand: string;
  /* Where the course lives: "/ai-cleared" */
  base: string;
  /* Certificate serial prefix: AXC or AXF. */
  serialPrefix: string;
  /* How many modules, and the number of the one that carries the final. */
  modules: number;
  finalModule: number;
  /* "about ninety minutes, in five short modules" */
  length: string;
  /* The verb the home page uses: "cleared" / "fluent". */
  stateWord: string;
  /* What a completed learner is: "AI Cleared" / "AI Fluent". */
  doneName: string;
  /* One line on what the course is, for invites and the home page. */
  blurb: string;
}

export const COURSES: Record<CourseSlug, CourseDef> = {
  "ai-cleared": {
    slug: "ai-cleared",
    key: "AI_CLEARED",
    name: "AI Cleared",
    brand: "AI CLEARED",
    base: "/ai-cleared",
    serialPrefix: "AXC",
    modules: 5,
    finalModule: 5,
    length: "about ninety minutes, in five short modules",
    stateWord: "cleared",
    doneName: "AI Cleared",
    blurb: "using AI tools safely at work: you practise inside a copy of the tool you already use, on invented data, and a certificate issues at the end",
  },
  "ai-fluent": {
    slug: "ai-fluent",
    key: "AI_FLUENT",
    name: "AI Fluent",
    brand: "AI FLUENT",
    base: "/ai-fluent",
    serialPrefix: "AXF",
    modules: 9,
    finalModule: 9,
    length: "about three hours, in nine twenty-minute modules",
    stateWord: "fluent",
    doneName: "AI Fluent",
    blurb: "getting real work out of AI tools: prompting that works, the five workflows, verification as a habit, and a real task on your own desk; you keep a personal prompt playbook and a certificate issues at the end",
  },
};

export const COURSE_SLUGS: readonly CourseSlug[] = ["ai-cleared", "ai-fluent"];

export function isCourseSlug(s: unknown): s is CourseSlug {
  return s === "ai-cleared" || s === "ai-fluent";
}

export function courseByKey(key: CourseKey): CourseDef {
  return key === "AI_FLUENT" ? COURSES["ai-fluent"] : COURSES["ai-cleared"];
}

/* A serial's course, from its prefix. Null when it is neither. */
export function courseOfSerial(serial: string): CourseDef | null {
  const p = serial.trim().toUpperCase().slice(0, 3);
  return (Object.values(COURSES).find((c) => c.serialPrefix === p) ?? null) as CourseDef | null;
}
