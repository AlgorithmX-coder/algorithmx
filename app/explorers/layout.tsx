import { Suspense } from "react";
import PupilSignOut from "@/app/components/PupilSignOut";
import { requireCourse } from "@/app/lib/courseAccess";

/**
 * A layout for Cyber Explorers. The page itself is a client component, so
 * it cannot ask the server who is signed in. That makes this layout the
 * last server code above it, which is why two things live here:
 *
 * THE COURSE GATE. Until 2026-11-25 there was none: anybody past the site
 * password played all twenty cases. requireCourse checks, on the server,
 * that the signed-in account holds Cyber Explorers (a school pupil's class
 * grant counts) and otherwise redirects. /explorers is the only route in
 * this segment and it carries no server data of its own, so a gate here
 * runs on every arrival at it. Reading the session makes the segment
 * dynamic, which is right for an answer that depends on who is asking.
 *
 * THE PUPIL SIGN-OUT. A school pupil playing Explorers on a shared
 * classroom machine had no way to sign out at all.
 *
 * Deliberately a bare fragment around the children. Explorers paints its own
 * full-screen chrome and this must add nothing to it: no wrapper element, no
 * background, no padding. The only thing it contributes is a control that
 * renders for a pupil and renders nothing for anybody else.
 *
 * It also hides every scroll bar on every Explorers screen (owner, UAT:
 * "hide the scroll bar for ALL modules"). Scrolling still works by wheel,
 * touch and keyboard; only the bar is gone. Set here, once, so no runtime
 * can bring one back with its own styling.
 */
const HIDE_SCROLLBARS = "*{scrollbar-width:none !important}*::-webkit-scrollbar{display:none !important}";

export default async function ExplorersLayout({ children }: { children: React.ReactNode }) {
  await requireCourse("cyberexplorers", "/explorers");
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
