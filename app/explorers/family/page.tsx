import { auth } from "@/app/lib/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from "next/navigation";
import { EXPLORERS_CONTENT } from "@/prisma/explorersContent";

/**
 * Parent-facing progress view for Cyber Explorers, at /explorers/family.
 * Reads each child's account-synced Progress (see explorersProgress.actions)
 * and shows completion, XP and the real-world habits the course asks them to
 * build at home. Server-rendered; no entitlement gate (the whole /explorers
 * area is auth-gated). Shows an "empty" state gracefully before any progress
 * is synced.
 */

export const dynamic = "force-dynamic";

const SLUG = "cyberexplorers";
const TOTAL = EXPLORERS_CONTENT.length;

const CYAN = "#34E1FF";
const VIOLET = "#B98BFF";
const INK = "#e8edf7";
const DIM = "#9aa6bd";
const FAINT = "#63708a";
const EDGE = "#232c40";
const BG = "#0a0d16";
const PANEL = "#0f1420";
const MONO = "ui-monospace, 'IBM Plex Mono', monospace";

/** The key real-world habits the course asks the child to build at home. */
const HOME_HABITS: { habit: string; from: string }[] = [
  { habit: "Agree a family code word for phone emergencies", from: "Case 10 · The Voice" },
  { habit: "Search your own name and check your profiles logged out", from: "Case 16 · The File On You" },
  { habit: "Turn on two-factor login on your most important account", from: "Case 11 · The Master Key" },
  { habit: "If a friend's message feels off, check them a different way first", from: "Case 7 · Borrowed Faces" },
  { habit: "Read the web address before typing a password anywhere", from: "Case 15 · The Real Site" },
  { habit: "Pause before sharing anything that makes you want to share it now", from: "Case 17 · Ghost Stories" },
  { habit: "Any ask about money, codes or secrets: pause and tell a trusted adult", from: "Case 9 · The Long Game" },
];

export default async function ExplorersFamilyPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const children = await prisma.childProfile.findMany({
    where: { userId },
    select: { id: true, name: true },
    orderBy: { createdAt: "desc" },
  });
  const product = await prisma.product.findUnique({ where: { slug: SLUG }, select: { id: true } });

  const perChild = await Promise.all(
    children.map(async (c) => {
      const rows =
        product != null
          ? await prisma.progress.findMany({
              where: { childProfileId: c.id, productId: product.id },
              select: { week: true, xp: true, completedAt: true },
            })
          : [];
      const byWeek = new Map(rows.map((r) => [r.week, r]));
      const done = rows.filter((r) => r.completedAt != null).length;
      const inProgress = rows.filter((r) => r.completedAt == null).length;
      const xp = rows.reduce((s, r) => s + r.xp, 0);
      let next: number | null = null;
      for (let w = 1; w <= TOTAL; w++) {
        const r = byWeek.get(w);
        if (!r || r.completedAt == null) {
          next = w;
          break;
        }
      }
      return { child: c, done, inProgress, xp, next, byWeek };
    }),
  );

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: `radial-gradient(900px 500px at 50% -120px, rgba(52,225,255,.06), transparent 70%), ${BG}`,
        color: INK,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        padding: "48px 20px 96px",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: ".24em", textTransform: "uppercase", color: CYAN, fontWeight: 600 }}>
          Cyber Explorers · Parent view
        </div>
        <h1 style={{ fontSize: "clamp(30px,5vw,44px)", fontWeight: 800, letterSpacing: "-.01em", margin: "12px 0 6px" }}>Your Explorer&apos;s progress</h1>
        <p style={{ color: DIM, fontSize: 17, maxWidth: "60ch", margin: 0 }}>
          What your child has completed, and the real-world safety habits each case asks them to practise with you at home.
        </p>

        {children.length === 0 ? (
          <Panel>
            <p style={{ margin: 0, color: DIM }}>
              No child profile yet. Once your child starts playing, their progress appears here.
            </p>
          </Panel>
        ) : (
          perChild.map(({ child, done, inProgress, xp, next, byWeek }) => {
            const pct = Math.round((done / TOTAL) * 100);
            return (
              <section key={child.id} style={{ marginTop: 28 }}>
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                  <h2 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{child.name}</h2>
                  <div style={{ fontFamily: MONO, fontSize: 13, color: DIM }}>
                    <span style={{ color: CYAN, fontWeight: 600 }}>{done}</span> of {TOTAL} cases · <span style={{ color: VIOLET, fontWeight: 600 }}>{xp}</span> XP
                  </div>
                </div>

                {/* progress bar */}
                <div style={{ marginTop: 12, height: 10, borderRadius: 6, background: "#0c1120", border: `1px solid ${EDGE}`, overflow: "hidden" }}>
                  <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${CYAN}, ${VIOLET})` }} />
                </div>
                <div style={{ marginTop: 7, fontFamily: MONO, fontSize: 12, color: FAINT }}>
                  {done === TOTAL ? "All 20 cases complete. Programme finished." : next != null ? `Next up: Case ${String(next).padStart(3, "0")} · ${EXPLORERS_CONTENT[next - 1]?.title}` : "Ready to start."}
                  {inProgress > 0 && done < TOTAL ? ` · ${inProgress} in progress` : ""}
                </div>

                {/* case grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 8, marginTop: 16 }}>
                  {EXPLORERS_CONTENT.map((cc) => {
                    const r = byWeek.get(cc.week);
                    const state = r?.completedAt != null ? "done" : r != null ? "prog" : "todo";
                    const col = state === "done" ? "#3ee08f" : state === "prog" ? CYAN : FAINT;
                    return (
                      <div key={cc.week} style={{ background: PANEL, border: `1px solid ${state === "todo" ? EDGE : col + "55"}`, borderLeft: `3px solid ${col}`, borderRadius: 8, padding: "9px 11px" }}>
                        <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: ".08em", color: col, fontWeight: 600 }}>
                          {String(cc.week).padStart(2, "0")} · {state === "done" ? "DONE" : state === "prog" ? "STARTED" : "TO DO"}
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: state === "todo" ? DIM : INK, lineHeight: 1.25 }}>{cc.title}</div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

        {/* home habits */}
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>Habits they&apos;re building at home</h2>
          <p style={{ color: DIM, margin: "0 0 16px", fontSize: 15 }}>Each case ends with one real-world action. Ask your child about these, or do them together.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {HOME_HABITS.map((h) => (
              <div key={h.from} style={{ display: "grid", gridTemplateColumns: "22px 1fr", gap: 12, background: PANEL, border: `1px solid ${EDGE}`, borderRadius: 8, padding: "12px 14px" }}>
                <span aria-hidden style={{ color: "#3ee08f", fontWeight: 700 }}>✓</span>
                <div>
                  <div style={{ fontWeight: 600, color: INK }}>{h.habit}</div>
                  <div style={{ fontFamily: MONO, fontSize: 11.5, color: FAINT, marginTop: 2 }}>{h.from}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ marginTop: 44, paddingTop: 20, borderTop: `1px solid ${EDGE}`, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <a href="/explorers" style={{ fontFamily: MONO, fontSize: 13, color: CYAN, textDecoration: "none" }}>← Back to the mission board</a>
          <a href="/hub" style={{ fontFamily: MONO, fontSize: 13, color: FAINT, textDecoration: "none" }}>Account hub</a>
        </div>
      </div>
    </main>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: 24, background: PANEL, border: `1px solid ${EDGE}`, borderRadius: 12, padding: "20px 22px" }}>{children}</div>;
}
