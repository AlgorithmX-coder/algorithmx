"use client";

import { useEffect, useMemo, useState } from "react";
import { T } from "./tokens";
import type { LabProps } from "./types";

/* An interactive checklist for the Personal Security Audit. These are
 * real actions the learner does on their own accounts; ticking them here
 * just tracks the work. Saved to localStorage so it survives a reload. */
const ITEMS: { id: string; title: string; why: string; link?: { label: string; href: string } }[] = [
  { id: "breach", title: "Check which of your accounts have been in a breach", why: "See where your email or passwords have already leaked, so you know what to change first.", link: { label: "haveibeenpwned.com", href: "https://haveibeenpwned.com" } },
  { id: "manager", title: "Install a password manager", why: "It generates and remembers a long, unique password for every site, so you never reuse one." },
  { id: "unique", title: "Replace any password you use on more than one site", why: "One breach of a reused password unlocks all the accounts that share it. Start with email and banking." },
  { id: "mfa", title: "Turn on MFA for your five most important accounts", why: "Email, banking, and your main logins. A stolen password alone then isn't enough to get in." },
  { id: "recovery", title: "Set up account recovery and save backup codes", why: "So you never lock yourself out once MFA is on. Keep backup codes somewhere safe and offline." },
];

const KEY = "pro:audit:week01";

export default function AuditChecklistLab({ onDidTry }: LabProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setChecked(JSON.parse(raw));
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try { localStorage.setItem(KEY, JSON.stringify(checked)); } catch { /* ignore */ }
  }, [checked, loaded]);

  const doneCount = useMemo(() => Object.values(checked).filter(Boolean).length, [checked]);
  useEffect(() => { if (doneCount >= 1) onDidTry(); }, [doneCount, onDidTry]);

  const toggle = (id: string) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  return (
    <div style={{ fontFamily: T.sans }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10.5, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: T.faint }}>Your audit checklist</div>
        <div style={{ fontFamily: T.mono, fontSize: 12, color: doneCount === ITEMS.length ? T.green : T.cyan }}>{doneCount} / {ITEMS.length} done</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {ITEMS.map((it) => {
          const on = !!checked[it.id];
          return (
            <div key={it.id}
              style={{ display: "flex", gap: 13, alignItems: "flex-start", background: on ? T.greenSoft : T.panel, border: `1px solid ${on ? `${T.green}66` : T.edge}`, borderRadius: 11, padding: "13px 15px", transition: "background 150ms ease, border-color 150ms ease" }}>
              <button role="checkbox" aria-checked={on} onClick={() => toggle(it.id)}
                style={{ flexShrink: 0, marginTop: 1, width: 24, height: 24, borderRadius: 7, cursor: "pointer", background: on ? T.green : "transparent", border: `1.5px solid ${on ? T.green : T.faint}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                {on && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06210f" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 13l4 4L19 7" /></svg>}
              </button>
              <div style={{ flex: 1, minWidth: 0 }}>
                <button onClick={() => toggle(it.id)} style={{ display: "block", textAlign: "left", background: "transparent", border: "none", padding: 0, cursor: "pointer", fontFamily: T.display, fontSize: 15, fontWeight: 700, color: T.ink, lineHeight: 1.35, textDecoration: on ? "line-through" : "none", textDecorationColor: `${T.green}` }}>{it.title}</button>
                <div style={{ fontSize: 13.5, color: T.muted, marginTop: 4, lineHeight: 1.5 }}>{it.why}</div>
                {it.link && (
                  <a href={it.link.href} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: 6, fontFamily: T.mono, fontSize: 12, color: T.cyan, textDecoration: "none" }}>{it.link.label} ›</a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {doneCount === ITEMS.length && (
        <div style={{ marginTop: 14, background: T.greenSoft, border: `1px solid ${T.green}66`, borderRadius: 10, padding: "12px 15px", fontSize: 14, color: T.body, lineHeight: 1.55 }}>
          That is a real, finished security audit. Keep the note of what you changed. It becomes the before-and-after in your portfolio.
        </div>
      )}
    </div>
  );
}
