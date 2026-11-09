"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import DeskHeader from "../DeskHeader";
import { D } from "../tokens";
import { markDone, parseDone, readDoneRaw, serverDoneRaw, subscribeDone } from "./progress";
import TopicPlayer from "./TopicPlayer";
import type { ModuleManifest } from "./types";
import { Button, Tick, card } from "./ui";

/* A Desk Ready module: the overview (what you will be able to do, and the
 * lessons in order with a tick on each finished one), and the lesson
 * player when one is open. Which lesson is open is client state; the page
 * returns to the top whenever it changes. */
export default function ModulePlayer({ module: m }: { module: ModuleManifest }) {
  const doneRaw = useSyncExternalStore(subscribeDone, readDoneRaw, serverDoneRaw);
  const done = useMemo(() => parseDone(doneRaw), [doneRaw]);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [open]);

  const finished = m.topics.filter((t) => done.includes(t.id)).length;
  const firstOpen = m.topics.findIndex((t) => !done.includes(t.id));
  const resumeAt = firstOpen === -1 ? 0 : firstOpen;

  if (open !== null) {
    const t = m.topics[open];
    const hasNext = open + 1 < m.topics.length;
    return (
      <>
        <DeskHeader link={{ href: "/desk-ready/course", label: "Your course" }} />
        <main style={{ maxWidth: 820, margin: "0 auto", padding: "20px 16px 72px" }}>
          <TopicPlayer
            key={t.id}
            topic={t}
            index={open}
            total={m.topics.length}
            onBack={() => setOpen(null)}
            onFinish={() => markDone(t.id)}
            next={hasNext ? { label: `Next lesson: ${m.topics[open + 1].title}`, go: () => setOpen(open + 1) } : { label: "Back to the module", go: () => setOpen(null) }}
          />
        </main>
      </>
    );
  }

  return (
    <>
      <DeskHeader link={{ href: "/desk-ready/course", label: "Your course" }} />
      <main style={{ maxWidth: 820, margin: "0 auto", padding: "28px 16px 72px" }}>
        <Link href="/desk-ready/course" style={{ fontSize: 16, fontWeight: 700, color: D.accent, textDecoration: "none" }}>
          &larr; All modules
        </Link>
        <p style={{ margin: "18px 0 0", fontSize: 15, fontWeight: 700, color: D.accent, letterSpacing: "0.04em", textTransform: "uppercase" }}>Module {m.number}</p>
        <h1 style={{ margin: "6px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: "clamp(1.9rem, 5vw, 2.6rem)", lineHeight: 1.12, color: D.ink }}>{m.title}</h1>
        <p style={{ margin: "14px 0 0", fontSize: 19, lineHeight: 1.6, color: D.body }}>{m.intro}</p>

        <div style={{ ...card, marginTop: 22 }}>
          <p style={{ margin: 0, fontSize: 17, fontWeight: 700, color: D.ink }}>By the end you will be able to:</p>
          <ul style={{ listStyle: "none", padding: 0, margin: "12px 0 0", display: "grid", gap: 10 }}>
            {m.outcomes.map((o) => (
              <li key={o} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 17.5, lineHeight: 1.5, color: D.body }}>
                <Tick color={D.accent} />
                <span>{o}</span>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ marginTop: 22, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 14 }}>
          <Button onClick={() => setOpen(resumeAt)}>{finished === 0 ? "Start the first lesson" : finished === m.topics.length ? "Go through it again" : `Carry on: lesson ${resumeAt + 1}`}</Button>
          <span style={{ fontSize: 16, color: D.muted }}>
            {finished} of {m.topics.length} lessons finished
          </span>
        </div>

        <h2 style={{ margin: "34px 0 0", fontFamily: D.display, fontWeight: 700, fontSize: 23, color: D.ink }}>The lessons</h2>
        <ol style={{ listStyle: "none", padding: 0, margin: "14px 0 0", display: "grid", gap: 12 }}>
          {m.topics.map((t, i) => {
            const isDone = done.includes(t.id);
            return (
              <li key={t.id}>
                <button
                  type="button"
                  onClick={() => setOpen(i)}
                  style={{ width: "100%", textAlign: "left", display: "flex", alignItems: "center", gap: 14, padding: "16px 16px", borderRadius: 14, background: D.panel, border: `1px solid ${isDone ? "rgba(27,122,67,0.35)" : D.edge}`, cursor: "pointer", fontFamily: D.sans }}
                >
                  <span aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: isDone ? D.goodSoft : D.sunk, color: D.muted, fontFamily: D.display, fontWeight: 700, fontSize: 17 }}>
                    {isDone ? <Tick size={20} /> : i + 1}
                  </span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: "block", fontSize: 18, fontWeight: 700, color: D.ink, lineHeight: 1.35 }}>{t.title}</span>
                    <span style={{ display: "block", marginTop: 3, fontSize: 15, color: D.faint }}>
                      {isDone ? "Finished" : `About ${t.minutes} minutes`}
                    </span>
                  </span>
                  <span aria-hidden style={{ fontSize: 22, color: D.accent }}>
                    &rsaquo;
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </main>
    </>
  );
}
