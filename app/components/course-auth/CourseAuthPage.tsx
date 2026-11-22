"use client";

/**
 * CourseAuthPage - the shared login/signup surface behind the course-themed
 * auth routes (/cyberheroes, /cyberexplorers, /ops, /pro, /desk-ready
 * + /login|/signup).
 *
 * Same auth plumbing as the platform pages (next-auth credentials sign-in;
 * the existing signup endpoint; the shared forgot-password flow), in
 * useCourseAuth. Only the skin and the post-auth destination are
 * per-course: the four cyber courses render the Night Console (owner's
 * pick, 2026-11-22), Desk Ready keeps its desk. Route pages pass a course
 * KEY string; everything client-side is looked up from it.
 */

import { Suspense } from "react";
import type { CourseAuthKey } from "./content";
import type { AuthMode } from "./useCourseAuth";
import NightConsole from "./NightConsole";
import DeskConsole from "./DeskConsole";
import { DESK_THEME } from "./themes";

export type { CourseAuthKey } from "./content";

const NIGHT_BG: Record<Exclude<CourseAuthKey, "desk">, string> = {
  cyberheroes: "#0b1026",
  cyberexplorers: "#06101a",
  ops: "#0a0814",
  pro: "#0c0a09",
};

export default function CourseAuthPage({ course, mode }: { course: CourseAuthKey; mode: AuthMode }) {
  const page = course === "desk" ? DESK_THEME.palette.page : NIGHT_BG[course];
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: page }} />}>
      {course === "desk" ? <DeskConsole mode={mode} /> : <NightConsole course={course} mode={mode} />}
    </Suspense>
  );
}
