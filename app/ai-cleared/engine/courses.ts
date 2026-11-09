/* The Cyber Secured courses, as the client and the server both see them.
 * Data only: no Prisma here, so the player and the frame can import it.
 * A course is a product slug, a home path and the words the shared pages
 * need to read right for it. AI Cleared and AI Fluent are also seat-keyed
 * (CourseKey, below); Cyber Awareness is not — it is reached by Enrolment
 * on its Product row alone (owner correction, Cyber Secured build: seats
 * are one CYBER_SECURED seat per person, not a per-course Seat.course). */

export type CourseSlug = "ai-cleared" | "ai-fluent" | "cyber-awareness";

/* The seat-keyed courses only (Seat.course on Prisma's CourseKey enum).
 * Cyber Awareness has no value there yet, so it is deliberately excluded
 * from this type, from CourseDef.key and from corporateCourse/courseByKey:
 * widening those needs a Prisma migration, which is not this file's call. */
export type CourseKey = "AI_CLEARED" | "AI_FLUENT";

/* The two courses that once issued a certificate, so still have serials
 * in the wild. No course issues a new one (owner, 2026-11-09: Cyber
 * Secured tracks completion per module only), but an AXC or AXF
 * certificate already issued stays good until it expires: /verify/[serial]
 * checks it and its holder can still open and download it. This type keys
 * the words those certificates carry (CERT_COPY). Cyber Awareness never
 * had one. */
export type CertifiedCourseSlug = "ai-cleared" | "ai-fluent";

/* Narrow a database CourseKey (which also includes the consumer course
 * CYBER_PRO) to the two seat-keyed corporate courses. Seats and firm
 * enrolments are only ever corporate, so CYBER_PRO never reaches here;
 * this falls back to AI_CLEARED defensively rather than widening the
 * corporate types. */
export function corporateCourse(k: string): CourseKey {
  return k === "AI_FLUENT" ? "AI_FLUENT" : "AI_CLEARED";
}

export interface CourseDef {
  slug: CourseSlug;
  /* The Seat.course key this course claims through, for the two
   * seat-keyed courses. Absent for Cyber Awareness: it has no Seat.course
   * value, so nothing here ever feeds a Prisma `course` filter for it. */
  key?: CourseKey;
  /* "AI Cleared" */
  name: string;
  /* The header wordmark: "AI CLEARED" */
  brand: string;
  /* Where the course lives: "/ai-cleared" */
  base: string;
  /* Certificate serial prefix, AXC or AXF, for the certificates issued
   * before issuing stopped. Absent on a course that never had one. */
  serialPrefix?: string;
  /* How many modules, and the number of the one that carries the final. */
  modules: number;
  finalModule: number;
  /* "about ninety minutes, in five short modules" */
  length: string;
  /* The verb the home page uses: "cleared" / "fluent" / "aware". */
  stateWord: string;
  /* What a completed learner is: "AI Cleared" / "AI Fluent" / "Cyber Aware". */
  doneName: string;
  /* One line on what the course is, for invites and the home page. */
  blurb: string;
  /* Whether this course issues a new certificate on completion. False on
   * every course since 2026-11-09; certificates already issued still
   * verify and still download for their holder. */
  certificate: boolean;
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
    blurb: "using AI tools safely at work: you practise inside a copy of the tool you already use, on invented data, and every module you finish goes on your firm's training register",
    certificate: false,
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
    blurb: "getting real work out of AI tools: prompting that works, the five workflows, verification as a habit, and a real task on your own desk; you keep a personal prompt playbook, and every module you finish goes on your firm's training register",
    certificate: false,
  },
  "cyber-awareness": {
    slug: "cyber-awareness",
    name: "Cyber Awareness",
    brand: "CYBER AWARENESS",
    base: "/cyber-awareness",
    modules: 8,
    finalModule: 8,
    length: "about two hours, in eight short modules",
    stateWord: "aware",
    doneName: "Cyber Aware",
    blurb: "everyday cyber hygiene for every member of staff: spotting phishing, handling passwords and devices, and knowing when to ask; completion is tracked module by module, with no certificate",
    certificate: false,
  },
};


export function isCourseSlug(s: unknown): s is CourseSlug {
  return s === "ai-cleared" || s === "ai-fluent" || s === "cyber-awareness";
}

export function courseByKey(key: CourseKey): CourseDef {
  return key === "AI_FLUENT" ? COURSES["ai-fluent"] : COURSES["ai-cleared"];
}

/* A serial's course, from its prefix. Null when it is neither (Cyber
 * Awareness has none, so it can never match here). */
export function courseOfSerial(serial: string): CourseDef | null {
  const p = serial.trim().toUpperCase().slice(0, 3);
  return (Object.values(COURSES).find((c) => c.serialPrefix === p) ?? null) as CourseDef | null;
}
