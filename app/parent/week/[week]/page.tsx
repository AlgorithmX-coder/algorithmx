/**
 * Parent-facing Week deep-dive.
 *
 * Server component. Pulls the latest LessonAttempt for the
 * authenticated user + weekNumber and renders a readable summary:
 *   - Completion status + time spent
 *   - Stars per screen
 *   - Boss result (if any)
 *   - Concepts the child struggled with (most-wrong question keys)
 *   - Badges earned
 *   - Suggested next step
 *
 * Privacy:
 *   - `auth()` guards the route; unauthenticated → /login.
 *   - All Prisma queries are filtered by `session.user.id` so a
 *     leaked weekNumber URL can never expose another user's data.
 *   - `userId` is taken from the session, never the request.
 */

import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getWeekContent } from "@/app/lesson/weekContent";

interface PageProps {
  params: Promise<{ week: string }>;
}

const C = {
  pageBg: "#080a16",
  card: "rgba(15, 21, 48, 0.72)",
  border: "rgba(0, 229, 255, 0.22)",
  borderStrong: "rgba(0, 229, 255, 0.45)",
  text: "#e8edff",
  textSoft: "#c5cdf0",
  textMuted: "rgba(125, 240, 255, 0.55)",
  gold: "#00e5ff",
  violet: "#7c5cff",
  moss: "#7eff97",
  coral: "#ff5fb3",
  ember: "#ff7a59",
};

const FONT_STACK =
  "ui-rounded, 'Fredoka', 'Quicksand', 'Nunito', system-ui, -apple-system, sans-serif";

function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s - m * 60;
  return rem === 0 ? `${m}m` : `${m}m ${rem}s`;
}

function stars(n: number): string {
  const filled = Math.max(0, Math.min(3, n));
  return "★".repeat(filled) + "☆".repeat(3 - filled);
}

/**
 * Map a screen type → a parent-readable label. The screen array in
 * WeekContent gives us the type per index; we render this for
 * each ScreenResult row.
 */
function screenLabel(type: string): string {
  switch (type) {
    case "video": return "Intro video";
    case "mission": return "Mission briefing";
    case "info": return "Concept lesson";
    case "cyberScanner": return "Password Scanner";
    case "passwordLab": return "Password Lab";
    case "crackTheCode": return "Crack the Code";
    case "conveyorBelt": return "Sorting Belt";
    case "weakSorter": return "Weakness Detective";
    case "memoryMatch": return "Memory Match";
    case "spamBlaster": return "Spam Blaster";
    case "chooseYourPath": return "Choose Your Path";
    case "cyberMaze": return "Cyber Maze";
    case "bossBattle": return "Boss Battle";
    case "completion": return "Badge ceremony";
    case "firewallBuilder": return "Firewall Builder";
    case "protectTheData": return "Protect the Data";
    default: return type;
  }
}

/**
 * Convert a stable question key like "boss-easy-3" or "maze-2" into a
 * concept tag a parent can read. Reads the live WeekContent so the
 * concept follows whatever the curriculum currently says.
 */
function describeQuestion(
  key: string,
  weekNumber: number
): { source: string; concept: string } | null {
  const content = getWeekContent(weekNumber);
  if (!content) return null;
  const bossMatch = /^boss-(easy|medium|hard)-(\d+)$/.exec(key);
  if (bossMatch) {
    const tier = bossMatch[1] as "easy" | "medium" | "hard";
    const idx = Number(bossMatch[2]);
    const q = content.bossQuestions?.[tier]?.[idx];
    if (!q) return { source: `Boss ${tier}`, concept: key };
    return { source: `Boss · ${tier}`, concept: q.question };
  }
  const mazeMatch = /^maze-(\d+)$/.exec(key);
  if (mazeMatch) {
    const idx = Number(mazeMatch[1]);
    const mazeScreen = content.screens.find((s) => s.type === "cyberMaze");
    if (mazeScreen && mazeScreen.type === "cyberMaze") {
      const q = mazeScreen.questions[idx];
      if (q) return { source: "Cyber Maze", concept: q.question };
    }
    return { source: "Cyber Maze", concept: key };
  }
  return { source: "Quiz", concept: key };
}

export default async function ParentWeekDetail({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const userId = session.user.id!;

  const { week } = await params;
  const weekNumber = Number.parseInt(week, 10);
  if (!Number.isFinite(weekNumber) || weekNumber < 1 || weekNumber > 60) {
    notFound();
  }

  // Pick the most informative attempt to display:
  //   1. Completed attempts first (parents care about the result).
  //   2. Among in-progress, prefer LIVE (non-abandoned) over
  //      abandoned (Postgres `nulls: first` puts null abandonedAt
  //      ahead of any timestamped value, i.e. live wins).
  //   3. Most recently started as the final tiebreaker.
  const latestAttempt = await prisma.lessonAttempt.findFirst({
    where: { userId, weekNumber },
    orderBy: [
      { completed: "desc" },
      { abandonedAt: { sort: "asc", nulls: "first" } },
      { startedAt: "desc" },
    ],
    include: {
      screenResults: { orderBy: { screenIndex: "asc" } },
      bossResult: true,
    },
  });

  // Top struggled-with questions across ALL attempts on this week.
  // We aggregate by questionKey + wasCorrect=false, count, take top 5.
  const wrongRows = await prisma.questionResponse.findMany({
    where: {
      attempt: { userId, weekNumber },
      wasCorrect: false,
    },
    select: { questionKey: true },
  });
  const wrongByKey = new Map<string, number>();
  for (const row of wrongRows) {
    wrongByKey.set(row.questionKey, (wrongByKey.get(row.questionKey) ?? 0) + 1);
  }
  const topStruggles = Array.from(wrongByKey.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([key, count]) => ({ key, count, ...describeQuestion(key, weekNumber) }));

  // Child name (for friendlier copy) - re-use the existing profile model.
  const child = await prisma.childProfile.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  const childName = child?.childName ?? "your child";

  const totalDurationMs = latestAttempt
    ? latestAttempt.screenResults.reduce((sum, s) => sum + (s.durationMs ?? 0), 0)
    : 0;

  const weekContent = getWeekContent(weekNumber);
  const totalScreens = weekContent?.screens.length ?? 0;

  return (
    <main
      style={{
        minHeight: "100vh",
        background: `radial-gradient(ellipse at 50% -10%, #1d1f4d 0%, #0f1530 35%, ${C.pageBg} 70%, #04050d 100%)`,
        color: C.text,
        fontFamily: FONT_STACK,
        padding: "24px 18px 60px",
      }}
    >
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        {/* Header */}
        <Link
          href="/parent"
          style={{
            display: "inline-block",
            color: C.gold,
            textDecoration: "none",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 16,
            padding: "6px 14px",
            background: "rgba(0, 229, 255, 0.08)",
            border: `1px solid ${C.border}`,
            borderRadius: 999,
          }}
        >
          ← All weeks
        </Link>
        <h1
          style={{
            fontSize: 32,
            fontWeight: 900,
            margin: "0 0 6px",
            background: `linear-gradient(135deg, ${C.gold}, ${C.violet})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Week {weekNumber} - {weekContent?.title ?? "Mission"}
        </h1>
        <p style={{ color: C.textSoft, fontSize: 15, marginBottom: 24 }}>
          {childName}&apos;s detailed progress for this week.
        </p>

        {/* Empty state */}
        {!latestAttempt && (
          <section
            style={{
              padding: 28,
              background: C.card,
              border: `1px solid ${C.border}`,
              borderRadius: 16,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, marginBottom: 8 }}>📭</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 6px" }}>
              No attempts yet
            </h2>
            <p style={{ color: C.textSoft, margin: "0 0 18px" }}>
              {childName} hasn&apos;t started Week {weekNumber} yet.
            </p>
            <Link
              href={`/lesson/${weekNumber}`}
              style={{
                display: "inline-block",
                background: `linear-gradient(135deg, ${C.gold}, ${C.violet})`,
                color: "#080a16",
                fontWeight: 900,
                padding: "12px 28px",
                borderRadius: 12,
                textDecoration: "none",
              }}
            >
              Start Week {weekNumber}
            </Link>
          </section>
        )}

        {latestAttempt && (
          <>
            {/* Summary tiles */}
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 14,
                marginBottom: 24,
              }}
            >
              <SummaryTile
                label="Status"
                value={
                  latestAttempt.completed
                    ? "Completed"
                    : `In progress (screen ${latestAttempt.finalScreenIndex + 1}/${totalScreens})`
                }
                accent={latestAttempt.completed ? C.moss : C.gold}
              />
              <SummaryTile
                label="Time spent"
                value={formatDuration(totalDurationMs)}
                accent={C.gold}
              />
              <SummaryTile
                label="XP earned"
                value={`${latestAttempt.totalXp}`}
                accent={C.violet}
              />
              <SummaryTile
                label="Attempts"
                value={`${latestAttempt.attemptNumber}`}
                accent={C.ember}
              />
            </section>

            {/* Boss result */}
            {latestAttempt.bossResult && (
              <section
                style={{
                  padding: 22,
                  background: C.card,
                  border: `1px solid ${
                    latestAttempt.bossResult.won
                      ? "rgba(126, 255, 151, 0.5)"
                      : C.border
                  }`,
                  borderRadius: 16,
                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 12,
                  }}
                >
                  <span style={{ fontSize: 28 }}>
                    {latestAttempt.bossResult.won ? "🏆" : "💀"}
                  </span>
                  <h2 style={{ margin: 0, fontSize: 20, fontWeight: 900 }}>
                    Boss Battle - {latestAttempt.bossResult.won ? "WON" : "Defeated"}
                  </h2>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
                    gap: 12,
                    color: C.textSoft,
                    fontSize: 13,
                  }}
                >
                  <Stat label="Accuracy" value={`${latestAttempt.bossResult.accuracy}%`} />
                  <Stat
                    label="Correct"
                    value={`${latestAttempt.bossResult.correctCount} / ${latestAttempt.bossResult.totalQuestions}`}
                  />
                  <Stat label="Best combo" value={`${latestAttempt.bossResult.bestCombo}×`} />
                  <Stat
                    label="Duration"
                    value={formatDuration(latestAttempt.bossResult.durationMs)}
                  />
                  <Stat
                    label="Badge"
                    value={latestAttempt.bossResult.badgeEarned ? "Earned" : "Not earned"}
                    accent={latestAttempt.bossResult.badgeEarned ? C.moss : C.textMuted}
                  />
                </div>
              </section>
            )}

            {/* Stars per screen */}
            <section
              style={{
                padding: 22,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                marginBottom: 24,
              }}
            >
              <h2 style={{ margin: "0 0 12px", fontSize: 18, fontWeight: 800 }}>
                Stars per screen
              </h2>
              {latestAttempt.screenResults.length === 0 && (
                <p style={{ color: C.textMuted, fontSize: 13, margin: 0 }}>
                  No screens completed yet.
                </p>
              )}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {latestAttempt.screenResults.map((sr) => (
                  <div
                    key={sr.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      padding: "8px 12px",
                      background: "rgba(0, 0, 0, 0.2)",
                      borderRadius: 10,
                      border: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <span style={{ fontSize: 13, color: C.textSoft, fontWeight: 600 }}>
                      Screen {sr.screenIndex + 1} · {screenLabel(sr.screenType)}
                    </span>
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 12,
                        color: C.textMuted,
                      }}
                    >
                      <span style={{ color: "#fde047", fontSize: 16 }}>
                        {stars(sr.starsEarned)}
                      </span>
                      <span>
                        {formatDuration(sr.durationMs)} ·{" "}
                        {sr.wrongCount === 0
                          ? "no wrong"
                          : `${sr.wrongCount} wrong`}
                      </span>
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Struggled with */}
            <section
              style={{
                padding: 22,
                background: C.card,
                border: `1px solid ${C.border}`,
                borderRadius: 16,
                marginBottom: 24,
              }}
            >
              <h2 style={{ margin: "0 0 6px", fontSize: 18, fontWeight: 800 }}>
                Concepts {childName} struggled with
              </h2>
              <p
                style={{
                  color: C.textMuted,
                  fontSize: 12,
                  margin: "0 0 14px",
                }}
              >
                Questions answered wrong most often across all attempts.
              </p>
              {topStruggles.length === 0 ? (
                <p style={{ color: C.textSoft, fontSize: 13, margin: 0 }}>
                  Nothing flagged - {childName} aced every question{" "}
                  <span style={{ color: C.moss }}>👏</span>
                </p>
              ) : (
                <ol
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: C.textSoft,
                    fontSize: 14,
                    lineHeight: 1.5,
                  }}
                >
                  {topStruggles.map((s) => (
                    <li key={s.key} style={{ marginBottom: 8 }}>
                      <div>
                        <strong style={{ color: C.text }}>{s.concept ?? s.key}</strong>
                      </div>
                      <div style={{ fontSize: 12, color: C.textMuted }}>
                        {s.source ?? "Quiz"} ·{" "}
                        {s.count} wrong{" "}
                        {s.count === 1 ? "answer" : "answers"}
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            {/* Suggested next step */}
            <section
              style={{
                padding: 22,
                background: `linear-gradient(135deg, ${C.card}, rgba(124, 92, 255, 0.18))`,
                border: `1px solid ${C.borderStrong}`,
                borderRadius: 16,
                marginBottom: 12,
              }}
            >
              <h2 style={{ margin: "0 0 8px", fontSize: 18, fontWeight: 800 }}>
                Suggested next step
              </h2>
              <p style={{ color: C.textSoft, fontSize: 14, margin: "0 0 14px" }}>
                {!latestAttempt.completed
                  ? `Encourage ${childName} to finish Week ${weekNumber}. They're on screen ${latestAttempt.finalScreenIndex + 1} of ${totalScreens}.`
                  : topStruggles.length > 0
                  ? `${childName} finished Week ${weekNumber}. Replay it once to lock in the tricky concepts above, then move on to Week ${weekNumber + 1}.`
                  : `${childName} aced Week ${weekNumber}! Time to start Week ${weekNumber + 1}.`}
              </p>
              <Link
                href={
                  !latestAttempt.completed
                    ? `/lesson/${weekNumber}`
                    : `/lesson/${weekNumber + 1}`
                }
                style={{
                  display: "inline-block",
                  background: `linear-gradient(135deg, ${C.gold}, ${C.violet})`,
                  color: "#080a16",
                  fontWeight: 900,
                  padding: "12px 28px",
                  borderRadius: 12,
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                {!latestAttempt.completed
                  ? `Resume Week ${weekNumber} →`
                  : `Go to Week ${weekNumber + 1} →`}
              </Link>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function SummaryTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div
      style={{
        padding: "14px 16px",
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 14,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.16em",
          color: C.textMuted,
          textTransform: "uppercase",
          fontWeight: 800,
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 20, fontWeight: 900, color: accent }}>{value}</div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 9,
          letterSpacing: "0.16em",
          color: C.textMuted,
          textTransform: "uppercase",
          fontWeight: 800,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 16,
          fontWeight: 900,
          color: accent ?? C.text,
        }}
      >
        {value}
      </div>
    </div>
  );
}
