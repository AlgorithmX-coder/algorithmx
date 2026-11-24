"use client";

/**
 * CourseAuthPage - the shared surface behind the course-themed auth routes
 * (/cyberheroes, /cyberexplorers, /ops, /pro, /desk-ready, /ai-cleared,
 * /ai-fluent, /cyber-awareness + /login | /signup | /forgot-password |
 * /reset-password).
 *
 * Same auth plumbing as the platform pages (next-auth credentials sign-in;
 * the existing signup endpoint, in useCourseAuth; the existing
 * forgot-password and reset-password endpoints, in NightFlows). Only the
 * skin and the post-auth destination are per-course: every course renders
 * the Night Console (owner's pick, 2026-11-22, extended in round 6,
 * 2026-11-23). Route pages pass a course KEY string; everything
 * client-side is looked up from it.
 */

import { Suspense } from "react";
import type { CourseAuthKey } from "./content";
import NightConsole from "./NightConsole";
import { NightForgot, NightReset } from "./NightFlows";
import type { NightMode } from "./NightShell";

export type { CourseAuthKey } from "./content";

const NIGHT_BG: Record<CourseAuthKey, string> = {
  cyberheroes: "#0b1026",
  cyberexplorers: "#06101a",
  ops: "#0a0814",
  pro: "#0c0a09",
  desk: "#070b17",
  cleared: "#04141a",
  fluent: "#0a0a1d",
  awareness: "#150816",
};

export default function CourseAuthPage({ course, mode }: { course: CourseAuthKey; mode: NightMode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: NIGHT_BG[course] }} />}>
      {mode === "forgot" ? <NightForgot course={course} />
        : mode === "reset" ? <NightReset course={course} />
        : <NightConsole course={course} mode={mode} />}
    </Suspense>
  );
}
