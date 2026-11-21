import Link from "next/link";
import { landingRouteFor } from "@/app/lib/courseLandings";
import type { CourseGate } from "@/app/lib/courseGate";

/**
 * The screen somebody sees when a course is not theirs.
 *
 * IT IS NOT A SALES PAGE AND IT IS NOT AN ERROR. Two different people hit
 * it: a child in a lesson whose class is on another course or whose school
 * has lapsed, and an adult who has not bought this one. Sending either to
 * the other's screen wastes their time, so the only thing on it is the door
 * that is actually theirs.
 *
 * A child is never offered a price, never told to buy anything, and never
 * told they have done something wrong. They are told to ask their teacher,
 * which is true and is the only thing they can act on.
 *
 * Dark, quiet and self-contained: it stands in for a course whose own
 * chrome has not loaded, so it cannot borrow that course's styling.
 */
const C = {
  bg: "#080a16",
  card: "rgba(15, 21, 48, 0.72)",
  edge: "rgba(0, 229, 255, 0.22)",
  ink: "#e8edff",
  soft: "#c5cdf0",
  cyan: "#00e5ff",
  violet: "#7c5cff",
  deep: "#0f1530",
};

export default function CourseLocked({
  gate,
  courseName,
  slug,
  here,
}: {
  /** The refusal from courseGate. */
  gate: Extract<CourseGate, { ok: false }>;
  courseName: string;
  slug: string;
  /** Where to come back to once they are in. */
  here: string;
}) {
  const landing = landingRouteFor(slug);
  const signedOut = gate.reason === "signed_out";
  const pupil = gate.reason === "not_entitled" && gate.pupil;

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 18px",
        background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, ${C.bg} 70%, #04050d 100%)`,
        color: C.ink,
        fontFamily: "ui-rounded, 'Fredoka', 'Quicksand', 'Nunito', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 560,
          width: "100%",
          background: C.card,
          border: `1px solid ${C.edge}`,
          borderRadius: 18,
          padding: "clamp(22px, 4vw, 34px)",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            fontSize: 11,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 800,
            color: C.cyan,
          }}
        >
          {courseName}
        </p>

        {signedOut ? (
          <>
            <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 900, lineHeight: 1.15 }}>
              Sign in to start
            </h1>
            <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.6, color: C.soft }}>
              {courseName} opens once we know who you are, so your work is saved and waiting next
              time.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {/* The child's door first. They are the ones who arrive here
                  from a link on a board with no idea what an account is. */}
              <Link
                href={`/schools/login?callbackUrl=${encodeURIComponent(here)}`}
                style={{
                  display: "inline-block",
                  padding: "13px 26px",
                  minHeight: 44,
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 900,
                  fontSize: 15,
                  color: C.deep,
                  background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
                }}
              >
                I have a class code
              </Link>
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(here)}&course=${encodeURIComponent(slug)}`}
                style={{
                  display: "inline-block",
                  padding: "13px 26px",
                  minHeight: 44,
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: 15,
                  color: C.ink,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${C.edge}`,
                }}
              >
                Sign in with an email
              </Link>
            </div>
          </>
        ) : pupil ? (
          <>
            <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 900, lineHeight: 1.15 }}>
              This one is not on your account yet
            </h1>
            <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.6, color: C.soft }}>
              Your class is on a different course. Ask your teacher if you should be on{" "}
              {courseName}, and they can move you across. Nothing you have done is lost.
            </p>
            <Link
              href="/schools/play"
              style={{
                display: "inline-block",
                padding: "13px 26px",
                minHeight: 44,
                borderRadius: 12,
                textDecoration: "none",
                fontWeight: 900,
                fontSize: 15,
                color: C.deep,
                background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
              }}
            >
              Go to my lessons
            </Link>
          </>
        ) : (
          <>
            <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 900, lineHeight: 1.15 }}>
              {courseName} is not on your account
            </h1>
            <p style={{ margin: "0 0 20px", fontSize: 15, lineHeight: 1.6, color: C.soft }}>
              You are signed in, but this course has not been added to you. If your school or
              organisation bought it, ask them to put you in a group for it.
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {landing && (
                <Link
                  href={landing}
                  style={{
                    display: "inline-block",
                    padding: "13px 26px",
                    minHeight: 44,
                    borderRadius: 12,
                    textDecoration: "none",
                    fontWeight: 900,
                    fontSize: 15,
                    color: C.deep,
                    background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
                  }}
                >
                  See what {courseName} is
                </Link>
              )}
              <Link
                href="/cybersecurity"
                style={{
                  display: "inline-block",
                  padding: "13px 26px",
                  minHeight: 44,
                  borderRadius: 12,
                  textDecoration: "none",
                  fontWeight: 800,
                  fontSize: 15,
                  color: C.ink,
                  background: "rgba(255,255,255,0.06)",
                  border: `1px solid ${C.edge}`,
                }}
              >
                My courses
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
