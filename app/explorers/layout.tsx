import { Suspense } from "react";
import PupilSignOut from "@/app/components/PupilSignOut";
import CourseLocked from "@/app/components/CourseLocked";
import { courseGate } from "@/app/lib/courseGate";

/**
 * THE LICENCE GATE FOR CYBER EXPLORERS, and the sign-out pill.
 *
 * Until now there was no gate at all. `/explorers` is a client component,
 * so it never asked the server who was signed in, and the whole course sat
 * behind nothing but the site password: twenty cases, free, to anybody with
 * the link. /explorers/family even says in its own comment that "the whole
 * /explorers area is auth-gated", which was not true of anything.
 *
 * It belongs in the layout because of that client component. A layout is
 * the last server thing above it, every route in the course sits under
 * this one, and a gate the page itself cannot perform has to live here.
 * Reading the session makes this segment dynamic, which is correct: an
 * answer that depends on who is asking must never be cached.
 *
 * Deliberately a bare fragment around the children otherwise. Explorers
 * paints its own full-screen chrome and this must add nothing to it: no
 * wrapper element, no background, no padding. The only things it
 * contributes are the gate and a control that renders for a pupil and
 * renders nothing for anybody else.
 *
 * It also hides every scroll bar on every Explorers screen (owner, UAT:
 * "hide the scroll bar for ALL modules"). Scrolling still works by wheel,
 * touch and keyboard; only the bar is gone. Set here, once, so no runtime
 * can bring one back with its own styling.
 */
const HIDE_SCROLLBARS = "*{scrollbar-width:none !important}*::-webkit-scrollbar{display:none !important}";

const SLUG = "cyberexplorers";

export default async function ExplorersLayout({ children }: { children: React.ReactNode }) {
  const gate = await courseGate(SLUG);
  if (!gate.ok) {
    /* The course's own chrome never loads, so this stands in for it whole:
       no scroll-bar rule, no sign-out, nothing of the mission map. */
    return <CourseLocked gate={gate} courseName="Cyber Explorers" slug={SLUG} here="/explorers" />;
  }

  return (
    <>
      <style>{HIDE_SCROLLBARS}</style>
      {children}
      {/* Suspended, so reading the session never holds up the first paint of
          the mission map. Next's own layout docs point out that loading.js
          cannot cover runtime data read in the layout itself, so the
          boundary has to be here. */}
      <Suspense fallback={null}>
        <PupilSignOut />
      </Suspense>
    </>
  );
}
