"use client";

import { useEffect, useState } from "react";
import { T } from "./learn/tokens";

/* A "job-readiness" meter for the course hub, so overall progress is
 * something a learner can FEEL, not just a grid of modules. Reads the
 * topics they have completed from localStorage (the lesson checkpoints)
 * and, for a signed-in learner, merges the server's cross-device record.
 * Best-effort and client-only: if nothing is read, it simply shows the
 * starting state. Grown-up framing, no childish gimmicks. */

const TOTAL = 100; // ~20 modules x 5 topics (the Code Lab aside)

const MILESTONES: { at: number; label: string }[] = [
  { at: 0, label: "Begin your climb to job-ready" },
  { at: 1, label: "You have started. Keep the streak." },
  { at: 20, label: "Building your foundations" },
  { at: 45, label: "Starting to think like an analyst" },
  { at: 70, label: "Nearly job-ready" },
  { at: 100, label: "Job-ready. Every module done." },
];

function milestoneFor(pct: number): string {
  let m = MILESTONES[0].label;
  for (const x of MILESTONES) if (pct >= x.at) m = x.label;
  return m;
}

export default function ReadinessMeter() {
  const [done, setDone] = useState<number | null>(null);

  useEffect(() => {
    const ids = new Set<string>();
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!k || !k.startsWith("pro:lesson:")) continue;
        try {
          const cp = JSON.parse(localStorage.getItem(k) || "null");
          if (cp && cp.phase === "done" && cp.id) ids.add(cp.id);
        } catch { /* ignore a corrupt checkpoint */ }
      }
    } catch { /* localStorage unavailable */ }
    setDone(ids.size);
    // Merge the server's record for a signed-in learner (cross-device).
    (async () => {
      try {
        const res = await fetch("/api/pro/progress", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { done?: string[] };
        if (Array.isArray(data.done) && data.done.length) {
          for (const id of data.done) ids.add(id);
          setDone(ids.size);
        }
      } catch { /* no server sync; local stands */ }
    })();
  }, []);

  if (done === null) return null; // avoid a hydration flash; fills in on mount

  const pct = Math.max(0, Math.min(100, Math.round((done / TOTAL) * 100)));
  const label = milestoneFor(pct);

  return (
    <div style={{ background: T.panel, border: `1px solid ${T.edge}`, borderRadius: 14, padding: "16px 20px", margin: "8px 0 4px", position: "relative", overflow: "hidden" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 10 }}>
        <div>
          <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: T.primary, marginBottom: 4 }}>Your readiness</div>
          <div style={{ fontFamily: T.display, fontSize: 17, fontWeight: 800, color: T.ink }}>{label}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontFamily: T.display, fontSize: 22, fontWeight: 800, color: pct >= 100 ? T.green : T.cyan }}>{pct}%</div>
          <div style={{ fontFamily: T.mono, fontSize: 11, color: T.faint }}>{done} of {TOTAL} topics</div>
        </div>
      </div>
      <div style={{ height: 9, borderRadius: 99, background: T.bgRaise, border: `1px solid ${T.edge}`, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 99, background: pct >= 100 ? T.green : `linear-gradient(90deg, ${T.primary}, ${T.cyan})`, transition: "width 600ms cubic-bezier(0.2,0.7,0.2,1)" }} />
      </div>
    </div>
  );
}
