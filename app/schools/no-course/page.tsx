import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/app/lib/auth";
import { leaveSchoolPortal } from "@/app/schools/signOut.actions";

/**
 * Where a school pupil lands when a course is not open to them: their
 * class is on a course they no longer hold, usually because the school's
 * access has been closed. requireCourse sends them here instead of to a
 * course's sales page.
 *
 * A child is never offered a price, never told to buy anything and never
 * told they did something wrong. They are told to ask their teacher, which
 * is the only thing they can act on, and they can sign out so the next
 * child can sign in. It runs no course gate itself, so it cannot loop.
 */
export const metadata: Metadata = {
  title: "Ask your teacher | AlgorithmX",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

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

export default async function PupilNoCoursePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/schools/login");

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, ${C.deep} 35%, ${C.bg} 70%, #04050d 100%)`,
        color: C.ink,
        fontFamily: "ui-rounded, 'Nunito', system-ui, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: 520,
          width: "100%",
          background: C.card,
          border: `1px solid ${C.edge}`,
          borderRadius: 18,
          padding: "clamp(22px, 4vw, 34px)",
        }}
      >
        <h1 style={{ margin: "0 0 10px", fontSize: 26, fontWeight: 900, lineHeight: 1.15 }}>
          This one is not open for you right now
        </h1>
        <p style={{ margin: "0 0 22px", fontSize: 16, lineHeight: 1.6, color: C.soft }}>
          Ask your teacher to check your class. Nothing you have done is lost.
        </p>
        <form action={leaveSchoolPortal} style={{ margin: 0 }}>
          <button
            type="submit"
            style={{
              minHeight: 44,
              padding: "12px 26px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontWeight: 900,
              fontSize: 15,
              color: C.deep,
              background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
            }}
          >
            Sign out
          </button>
        </form>
      </div>
    </main>
  );
}
