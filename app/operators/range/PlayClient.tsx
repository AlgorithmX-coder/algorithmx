"use client";

/* PlayClient — the client entry for a real, persisted engagement.
 *
 * The WeekDef carries a React component (the Act surface) and so can't cross
 * the server/client boundary as a prop; the server route passes only the week
 * number and this resolves the def from the built-weeks registry. Week 1 opens
 * on the course orientation (the whole 16-week plan up front); every week then
 * runs the persisted LiveEngagement. */

import { useState } from "react";
import { builtWeek } from "./weeks";
import CourseIntro from "./CourseIntro";
import LiveEngagement from "./LiveEngagement";
import { C, DISP, MONO, SANS } from "./Engagement";

export default function PlayClient({ week }: { week: number }) {
  const def = builtWeek(week);
  const [started, setStarted] = useState(week !== 1); // only week 1 gets orientation

  if (!def) {
    return (
      <div style={{ minHeight: "100vh", background: C.carbon, color: C.ink, fontFamily: SANS, display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 420, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".28em", textTransform: "uppercase", color: C.indigo, fontWeight: 600 }}>Redoubt</div>
          <h1 style={{ fontFamily: DISP, fontSize: 26, fontWeight: 700, margin: "12px 0 10px" }}>This engagement is still being built.</h1>
          <p style={{ color: C.soft, fontSize: 14.5, lineHeight: 1.6 }}>
            Engagement {String(week).padStart(2, "0")} isn&rsquo;t open yet. New engagements are added as they&rsquo;re cleared for the range.
          </p>
          <a href="/operators/play/1" style={{ display: "inline-block", marginTop: 18, fontFamily: MONO, fontSize: 13, color: C.indigo2, textDecoration: "underline", textUnderlineOffset: 3 }}>
            ← Back to Engagement 01
          </a>
        </div>
      </div>
    );
  }

  if (!started) return <CourseIntro onBegin={() => setStarted(true)} />;
  return <LiveEngagement week={def} />;
}
