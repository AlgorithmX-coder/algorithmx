"use client";

/**
 * CourseAuthPage - the shared surface behind the course-themed auth routes
 * (/cyberheroes, /cyberexplorers, /ops, /pro, /desk-ready, /ai-cleared,
 * /ai-fluent, /cyber-awareness + /login | /signup | /forgot-password |
 * /reset-password).
 *
 * Same auth plumbing as the platform pages (next-auth credentials sign-in;
 * the existing signup endpoint, in useCourseAuth; the existing
 * forgot-password and reset-password endpoints, in NightFlows and
 * DoorFlows). Only the skin and the post-auth destination are per-course.
 * Cyber Heroes, Cyber Explorers, Cyber Ops, Cyber Pro and Desk Ready render
 * the Night Console (owner's pick, 2026-11-22, extended in round 6,
 * 2026-11-23). AI Cleared, AI Fluent and Cyber Awareness render the
 * daylight door (round 8, owner 2026-11-26). Route pages pass a course KEY
 * string; everything client-side is looked up from it.
 */

import { Suspense } from "react";
import type { CourseAuthKey } from "./content";
import NightConsole from "./NightConsole";
import { NightForgot, NightReset } from "./NightFlows";
import type { NightMode } from "./NightShell";
import DoorConsole from "./DoorConsole";
import { DoorForgot, DoorReset } from "./DoorFlows";
import { isDoorCourse } from "./doorContent";

export type { CourseAuthKey } from "./content";

/* The fallback ground while the search params resolve: each skin's own. */
const NIGHT_BG: Record<CourseAuthKey, string> = {
  cyberheroes: "#0b1026",
  cyberexplorers: "#06101a",
  ops: "#0a0814",
  pro: "#0c0a09",
  desk: "#070b17",
  cleared: "#f7f8fb",
  fluent: "#f7f8fb",
  awareness: "#f7f8fb",
};

export default function CourseAuthPage({ course, mode }: { course: CourseAuthKey; mode: NightMode }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: NIGHT_BG[course] }} />}>
      {isDoorCourse(course) ? (
        mode === "forgot" ? <DoorForgot course={course} />
          : mode === "reset" ? <DoorReset course={course} />
          : <DoorConsole course={course} mode={mode} />
      ) : (
        mode === "forgot" ? <NightForgot course={course} />
          : mode === "reset" ? <NightReset course={course} />
          : <NightConsole course={course} mode={mode} />
      )}
    </Suspense>
  );
}

/**
 * The Cyber Secured firm door (/cyber-secured/login, /forgot-password,
 * /reset-password; round 8, owner 2026-11-26): the daylight door with the
 * firm's side panel, sign in only. A firm's people land on /cyber-secured
 * unless a callbackUrl says otherwise.
 */
export function FirmAuthPage({ mode }: { mode: "login" | "forgot" | "reset" }) {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#f7f8fb" }} />}>
      {mode === "forgot" ? <DoorForgot course="secured" />
        : mode === "reset" ? <DoorReset course="secured" />
        : <DoorConsole course="secured" mode="login" />}
    </Suspense>
  );
}
