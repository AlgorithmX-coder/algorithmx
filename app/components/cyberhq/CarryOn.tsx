import Link from "next/link";

/**
 * "Carry on with Week N", and every week within reach.
 *
 * WHY THIS EXISTS. A school pupil signing in lands on Cyber HQ, which is
 * the reward wall: badges, stickers, certificates, the wardrobe. All of it
 * is about what they have already done, and none of it was a way back into
 * a lesson. The only link to one appeared when a child had no stickers at
 * all, so the moment they finished week one it vanished, and a child in a
 * classroom was left on a trophy cabinet with nowhere to go.
 *
 * It sits directly under the title, above everything they have won, because
 * a lesson is forty minutes and the first thing on the screen should be the
 * thing they came to do.
 *
 * The weeks are not locked and never have been: a child can open any of
 * them, and a teacher sometimes sets one out of order. So every week is a
 * link, the finished ones are marked, and the next one is the one that
 * stands out.
 */
const C = {
  card: "rgba(15, 21, 48, 0.72)",
  border: "rgba(0, 229, 255, 0.22)",
  text: "#e8edff",
  textSoft: "#c5cdf0",
  gold: "#fde047",
  cyan: "#00e5ff",
  violet: "#7c5cff",
  deep: "#0f1530",
};

export default function CarryOn({
  nextWeek,
  completedWeeks,
  totalWeeks,
}: {
  /** Null once every week is finished. */
  nextWeek: number | null;
  completedWeeks: number[];
  totalWeeks: number;
}) {
  const done = new Set(completedWeeks);
  const fresh = done.size === 0;

  return (
    <section
      aria-label="Your lessons"
      style={{
        padding: "18px 22px",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        marginBottom: 20,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <h2 style={{ margin: "0 0 2px", fontSize: 18, fontWeight: 900, color: C.text }}>
            {nextWeek === null
              ? "You have finished all " + totalWeeks + " weeks"
              : fresh
                ? "Ready to start?"
                : "Pick up where you left off"}
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: C.textSoft }}>
            {nextWeek === null
              ? "Every mission is done. Go back to any week whenever you want to play it again."
              : `You have finished ${done.size} of ${totalWeeks} weeks.`}
          </p>
        </div>

        {nextWeek !== null && (
          <Link
            href={`/lesson/${nextWeek}`}
            style={{
              display: "inline-block",
              padding: "14px 30px",
              background: `linear-gradient(135deg, ${C.cyan}, ${C.violet})`,
              color: C.deep,
              fontWeight: 900,
              borderRadius: 12,
              textDecoration: "none",
              fontSize: 15,
              /* 44px of target at the smallest, because this is tapped by a
                 six year old on a shared tablet. */
              minHeight: 44,
            }}
          >
            {fresh ? `Start Week ${nextWeek}` : `Carry on with Week ${nextWeek}`} →
          </Link>
        )}
      </div>

      <ol
        aria-label="All weeks"
        style={{
          listStyle: "none",
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          margin: "16px 0 0",
          padding: 0,
        }}
      >
        {Array.from({ length: totalWeeks }, (_, i) => i + 1).map((week) => {
          const finished = done.has(week);
          const isNext = week === nextWeek;
          return (
            <li key={week}>
              <Link
                href={`/lesson/${week}`}
                aria-label={`Week ${week}${finished ? ", finished" : isNext ? ", carry on here" : ""}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  textDecoration: "none",
                  fontSize: 14,
                  fontWeight: 800,
                  color: isNext ? C.deep : finished ? C.gold : C.textSoft,
                  background: isNext ? C.gold : finished ? "rgba(253, 224, 71, 0.12)" : "rgba(255,255,255,0.05)",
                  border: `1px solid ${isNext ? C.gold : finished ? "rgba(253, 224, 71, 0.5)" : C.border}`,
                }}
              >
                {week}
              </Link>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
