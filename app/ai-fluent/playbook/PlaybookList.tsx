"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { K } from "@/app/ai-cleared/engine/tokens";

export interface PlaybookRow {
  id: string;
  module: number;
  workflow: string;
  tool: string;
  prompt: string;
  whenToUse: string | null;
  check: string | null;
  createdAt: string;
}

/* The saved prompts grouped by workflow, with print and delete. */
export default function PlaybookList({ entries }: { entries: PlaybookRow[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const groups = new Map<string, PlaybookRow[]>();
  for (const e of entries) {
    if (!groups.has(e.workflow)) groups.set(e.workflow, []);
    groups.get(e.workflow)!.push(e);
  }

  async function remove(id: string) {
    setBusy(id);
    try {
      await fetch("/api/ai-fluent/playbook", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
      router.refresh();
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="pb">
      <div className="pb-tools">
        <button type="button" className="cf-btn" onClick={() => window.print()}>Print or save as PDF</button>
        <span className="cf-note">{entries.length} prompt{entries.length === 1 ? "" : "s"}</span>
      </div>
      {[...groups.entries()].map(([workflow, rows]) => (
        <section key={workflow} className="pb-group">
          <h2 className="pb-h2">{workflow}</h2>
          {rows.map((e) => (
            <article key={e.id} className="cf-card pb-entry">
              <div className="pb-meta"><span>Module {e.module}</span><span>{e.tool}</span><span>{new Date(e.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span></div>
              <pre className="pb-prompt">{e.prompt}</pre>
              {e.whenToUse && <p className="pb-line"><b>When to use it:</b> {e.whenToUse}</p>}
              {e.check && <p className="pb-line"><b>Check before you use the output:</b> {e.check}</p>}
              <button type="button" className="pb-del" onClick={() => remove(e.id)} disabled={busy === e.id}>{busy === e.id ? "Removing…" : "Remove"}</button>
            </article>
          ))}
        </section>
      ))}
      <style jsx>{`
        .pb { display: flex; flex-direction: column; gap: 22px; }
        .pb-tools { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
        .pb-group { display: flex; flex-direction: column; gap: 12px; }
        .pb-h2 { font-family: ${K.display}; font-size: 22px; margin: 0; color: ${K.ink}; }
        .pb-entry { display: flex; flex-direction: column; gap: 10px; }
        .pb-meta { display: flex; gap: 12px; font-family: ${K.mono}; font-size: 10.5px; letter-spacing: 0.12em; text-transform: uppercase; color: ${K.faint}; }
        .pb-prompt { margin: 0; font: inherit; font-size: 14.5px; line-height: 1.55; color: ${K.ink}; white-space: pre-wrap; word-break: break-word; background: ${K.sunk}; border-radius: 12px; padding: 12px 14px; }
        .pb-line { margin: 0; font-size: 14px; color: ${K.body}; }
        .pb-line b { color: ${K.ink}; }
        .pb-del { align-self: flex-start; font: inherit; font-size: 12.5px; color: ${K.muted}; background: none; border: none; padding: 0; cursor: pointer; text-decoration: underline; text-underline-offset: 3px; }
        @media print { .pb-tools, .pb-del { display: none; } .pb-entry { break-inside: avoid; } }
      `}</style>
    </div>
  );
}
