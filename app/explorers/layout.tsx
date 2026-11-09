import { Suspense } from "react";
import PupilSignOut from "@/app/components/PupilSignOut";

/**
 * A layout for Cyber Explorers that exists for one reason: the page itself
 * is a client component, so it cannot ask the server who is signed in, and
 * a school pupil playing Explorers on a shared classroom machine had no way
 * to sign out at all.
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

export default function ExplorersLayout({ children }: { children: React.ReactNode }) {
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
