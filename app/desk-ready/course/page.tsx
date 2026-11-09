import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import DeskHeader from "../DeskHeader";
import { FINAL, PARTS, type DeskModule } from "../syllabus";
import { D } from "../tokens";

/**
 * /desk-ready/course - the course map: every part and module in order,
 * from the syllabus data. Where a learner lands after signing up or in
 * (courseIntent COURSE_HOME). No entitlement gate yet: like Cyber Pro
 * during UAT, the course is open while it is being tested. Noindex until
 * launch.
 */
export const metadata: Metadata = {
  title: "Your course | Desk Ready",
  robots: { index: false, follow: false },
};

function ModuleCard({ m }: { m: DeskModule }) {
  const body = (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          aria-hidden
          style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: D.display, fontWeight: 700, fontSize: 18, background: m.ready ? D.accent : D.sunk, color: m.ready ? D.onAccent : D.muted }}
        >
          {m.number}
        </span>
        <h3 style={{ margin: 0, fontFamily: D.display, fontWeight: 600, fontSize: 19, lineHeight: 1.25, color: D.ink }}>
          <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>Module {m.number}: </span>
          {m.title}
        </h3>
      </div>
      <p style={{ margin: "12px 0 0", fontSize: 16.5, lineHeight: 1.5, color: D.body }}>{m.promise}</p>
      <p style={{ margin: "10px 0 0", fontSize: 14.5, color: D.faint }}>{m.topics.length} short lessons</p>
      <div style={{ marginTop: 14 }}>
        {m.ready ? (
          <span style={{ fontWeight: 700, fontSize: 16, color: D.accent }}>Start this module</span>
        ) : (
          <span style={{ display: "inline-block", fontSize: 13.5, fontWeight: 700, color: D.muted, background: D.sunk, borderRadius: 999, padding: "4px 12px" }}>Coming soon</span>
        )}
      </div>
    </>
  );
  const card: CSSProperties = {
    display: "block",
    background: D.panel,
    border: `1px solid ${m.ready ? "rgba(43,89,195,0.35)" : D.edge}`,
    borderRadius: 16,
    padding: "18px 18px 20px",
    textDecoration: "none",
    boxShadow: m.ready ? D.lift : "none",
    opacity: m.ready ? 1 : 0.92,
  };
  return m.ready ? (
    <Link href={`/desk-ready/${m.id}`} style={card}>
      {body}
    </Link>
  ) : (
    <div style={card}>{body}</div>
  );
}

export default function DeskCoursePage() {
  return (
    <>
      <DeskHeader link={{ href: "/desk-ready", label: "About the course" }} />
      <main style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 16px 72px" }}>
        <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: D.accent, letterSpacing: "0.04em", textTransform: "uppercase" }}>Your course</p>
        <h1 style={{ margin: "8px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: "clamp(1.9rem, 4.5vw, 2.6rem)", lineHeight: 1.15, color: D.ink }}>
          Everything you will learn, in order
        </h1>
        <p style={{ margin: "14px 0 0", maxWidth: 680, fontSize: 18, lineHeight: 1.6, color: D.body }}>
          Each module is a handful of short lessons. Every lesson explains one thing, then you try it yourself in a pretend office where nothing breaks and nothing gets sent. Go at your own pace and stop whenever you like.
        </p>

        {PARTS.map((part) => (
          <section key={part.id} aria-labelledby={`${part.id}-h`} style={{ marginTop: 44 }}>
            <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: D.faint, letterSpacing: "0.04em", textTransform: "uppercase" }}>{part.label}</p>
            <h2 id={`${part.id}-h`} style={{ margin: "4px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: 25, color: D.ink }}>
              {part.title}
            </h2>
            <p style={{ margin: "8px 0 0", maxWidth: 680, fontSize: 16.5, lineHeight: 1.55, color: D.muted }}>{part.blurb}</p>
            <div style={{ marginTop: 16, display: "grid", gap: 14, gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))" }}>
              {part.modules.map((m) => (
                <ModuleCard key={m.id} m={m} />
              ))}
            </div>
          </section>
        ))}

        <section aria-labelledby="final-h" style={{ marginTop: 48, background: D.panel, border: `1px solid ${D.edge}`, borderRadius: 18, padding: "22px 20px" }}>
          <p style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: D.faint, letterSpacing: "0.04em", textTransform: "uppercase" }}>Final task</p>
          <h2 id="final-h" style={{ margin: "4px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: 25, color: D.ink }}>
            {FINAL.title}
          </h2>
          <p style={{ margin: "8px 0 0", maxWidth: 720, fontSize: 17, lineHeight: 1.55, color: D.body }}>{FINAL.promise}</p>
          {!FINAL.ready && (
            <span style={{ display: "inline-block", marginTop: 14, fontSize: 13.5, fontWeight: 700, color: D.muted, background: D.sunk, borderRadius: 999, padding: "4px 12px" }}>Coming soon</span>
          )}
        </section>
      </main>
    </>
  );
}
