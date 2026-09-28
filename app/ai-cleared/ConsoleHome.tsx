import Link from "next/link";
import { K } from "./engine/tokens";
import { TRACK_LABEL, type Track } from "./engine/types";
import type { CourseMapEntry } from "./engine/ClearedPlayer";
import TrackChange from "./TrackChange";

/* The console home: firm name, the five modules, resume, the certificate
 * once the course is complete, and the one-time desk change. */
export default function ConsoleHome({ firmName, learnerName, track, trackLocked, modules, resumeN, complete }: { firmName: string; learnerName: string; track: Track; trackLocked: boolean; modules: (CourseMapEntry & { phaseLabel?: string })[]; resumeN: number | null; complete: boolean }) {
  const done = modules.filter((m) => m.done).length;
  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "40px 24px 80px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span style={{ fontFamily: K.mono, fontSize: 11.5, fontWeight: 700, letterSpacing: "0.22em", color: K.accentInk }}>AI CLEARED</span>
        <span style={{ fontSize: 13, color: K.muted, display: "inline-flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>{learnerName} · {TRACK_LABEL[track]} track <TrackChange current={track} locked={trackLocked} /></span>
      </div>
      <h1 style={{ fontSize: 30, lineHeight: 1.15, fontWeight: 600, letterSpacing: "-0.015em", color: K.ink, margin: "26px 0 8px", textWrap: "balance" }}>{firmName}</h1>
      <p style={{ fontSize: 16.5, color: K.body, margin: "0 0 26px", maxWidth: "60ch" }}>
        Five short modules. Everybody gets cleared on the same habits, on a desk that looks like yours. Nothing you type in here is real data, and none of it is stored.
      </p>

      <div style={{ height: 8, background: K.sunk, borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
        <i style={{ display: "block", height: "100%", width: `${(done / modules.length) * 100}%`, background: K.accent }} />
      </div>
      <div style={{ fontSize: 13, color: K.muted, marginBottom: 28 }}>{done} of {modules.length} modules cleared</div>

      {complete && (
        <Link href="/ai-cleared/certificate" style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", padding: "16px 18px", marginBottom: 18, background: K.okSoft, border: `1px solid ${K.ok}`, borderRadius: 12, textDecoration: "none" }}>
          <span style={{ fontFamily: K.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.16em", color: K.ok, border: `1.5px solid ${K.ok}`, borderRadius: 6, padding: "4px 8px", whiteSpace: "nowrap" }}>COURSE CLEARED</span>
          <span style={{ color: K.ink, fontSize: 15, flex: "1 1 240px" }}>Your certificate is ready. Download it, or send the verify link to your manager.</span>
          <span style={{ color: K.ok, fontWeight: 600, whiteSpace: "nowrap" }}>Open</span>
        </Link>
      )}

      <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        {modules.map((m) => {
          const state = m.done ? "done" : m.available ? "open" : "locked";
          const colour = state === "done" ? K.ok : state === "open" ? K.accentInk : K.faint;
          const inner = (
            <>
              <span style={{ flexShrink: 0, width: 32, height: 32, borderRadius: "50%", border: `1px solid ${colour}`, color: colour, fontFamily: K.mono, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", background: state === "done" ? K.okSoft : state === "open" ? K.accentSoft : "transparent" }}>{m.done ? "✓" : m.n}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
                <b style={{ color: state === "locked" ? K.muted : K.ink, fontSize: 16, fontWeight: 600 }}>{m.title}</b>
                <small style={{ color: K.faint, fontSize: 13 }}>{m.minutes} min{m.phaseLabel ? ` · ${m.phaseLabel}` : ""}{state === "locked" ? " · coming with the next release" : ""}</small>
              </span>
              <span style={{ marginLeft: "auto", fontSize: 13.5, fontWeight: 600, color: colour, whiteSpace: "nowrap" }}>{state === "done" ? "Cleared" : state === "open" ? (m.n === resumeN ? "Resume" : "Start") : "Locked"}</span>
            </>
          );
          const style = { display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: K.panel, border: `1px solid ${state === "open" ? K.accent : K.edge}`, borderRadius: 12, textDecoration: "none" } as const;
          return (
            <li key={m.n}>
              {state === "locked" ? <div style={style}>{inner}</div> : <Link href={`/ai-cleared/m/${m.n}`} style={style}>{inner}</Link>}
            </li>
          );
        })}
      </ol>

      <p style={{ marginTop: 30, fontSize: 13.5, color: K.muted }}>
        Questions about the course go to your firm&rsquo;s admin. Questions about your seat go to <a href="mailto:admissions@algorithmx.co.uk" style={{ color: K.accentInk }}>admissions@algorithmx.co.uk</a>.
      </p>
    </div>
  );
}
