"use client";
/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PHASES, type Phase } from "@/app/schools/phases";
import { CURRICULUM, STRAND_COLOUR } from "@/app/schools/curriculum";
import { MOCK_CAPTION, TABS, TEACHER_MOCK, pupilStatus, shotFull, shotSet, shotSrc } from "@/app/schools/productData";
import { AXS } from "./content";
import { ICONS } from "./icons";

/* The product section: six tabs as a sticky vertical segmented list beside
 * a glass browser frame that slides between screens. Four tabs show the real
 * captures for the chosen phase (with the Full size lightbox), two show the
 * built-in teacher view and curriculum map, rendered from the same data as
 * app/schools/ProductTabs.tsx so the numbers never drift from the product.
 * Arrow keys, Home and End move the tabs; prev/next loop. */

const F = AXS.product.frame;

export default function ProductFrame({ phase }: { phase: Phase }) {
  const [active, setActive] = useState(0);
  const [open, setOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const tab = TABS[active];
  const info = PHASES[phase];
  const shot = tab.kind === "shot" && tab.shot ? tab.shot[phase] : null;
  const go = (i: number) => setActive((i + TABS.length) % TABS.length);

  const onKeyDown = (e: React.KeyboardEvent) => {
    let next: number | null = null;
    if (e.key === "ArrowDown" || e.key === "ArrowRight") next = active + 1;
    if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = active - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = TABS.length - 1;
    if (next === null) return;
    e.preventDefault();
    const idx = (next + TABS.length) % TABS.length;
    setActive(idx);
    listRef.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[idx]?.focus();
  };

  const openLb = (e: React.MouseEvent<HTMLElement>) => { triggerRef.current = e.currentTarget; setOpen(true); };
  const closeLb = () => setOpen(false);

  /* Lightbox: Esc closes, page scroll locks while open, focus goes to the
     close button and comes back to whatever opened it. */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeRef.current?.focus();
    const back = triggerRef.current;
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; back?.focus(); };
  }, [open]);

  const caption = shot ? shot.caption : MOCK_CAPTION[tab.kind === "teacher" ? "teacher" : "curriculum"];

  return (
    <div className="prodGrid">
      <div ref={listRef} role="tablist" aria-label={AXS.product.tablistAriaLabel} aria-orientation="vertical" className="tablist" data-reveal onKeyDown={onKeyDown}>
        {TABS.map((t, i) => {
          const on = i === active;
          return (
            <button key={t.id} role="tab" id={`sv-tab-${t.id}`} aria-selected={on} aria-controls="sv-frame" tabIndex={on ? 0 : -1} onClick={() => setActive(i)}>
              <span className="n">{t.n}</span><span className="t">{t.title}</span><span className="d">{t.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="frame glass" id="sv-frame" role="tabpanel" aria-labelledby={`sv-tab-${tab.id}`} data-reveal style={{ "--d": ".1s" } as React.CSSProperties}>
        <div className="fbar">
          <span className="dots" aria-hidden="true"><i /><i /><i /></span>
          <span className="url"><i aria-hidden="true" /><span>{shot ? info.frameUrl : F.urlForMocks}</span></span>
          {!shot && <span className="pilot">{F.pilotChip}</span>}
          <span className="fnav" role="group" aria-label={F.navAriaLabel}>
            <button type="button" onClick={() => go(active - 1)} aria-label={F.prev.ariaLabel}>{F.prev.glyph}</button>
            <button type="button" onClick={() => go(active + 1)} aria-label={F.next.ariaLabel}>{F.next.glyph}</button>
          </span>
        </div>
        <div className="fbody">
          <div className="scene" key={`${tab.id}-${phase}`}>
            {shot && (
              <>
                <button type="button" className="shotbtn" onClick={openLb} aria-label={`${F.openFullSizeAriaPrefix}${shot.caption}`}>
                  <img src={shotSrc(shot.img)} srcSet={shotSet(shot.img)} sizes="(max-width: 900px) 100vw, 1200px" alt={shot.caption} loading={active === 0 ? "eager" : "lazy"} />
                </button>
                <span className="fullsz" aria-hidden="true"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d={ICONS.search} /></svg>{F.fullSizeButton}</span>
              </>
            )}
            {tab.kind === "teacher" && <TeacherMock phase={phase} />}
            {tab.kind === "curriculum" && <CurriculumMock phase={phase} />}
          </div>
        </div>
        <div className="fcap">{caption}</div>
      </div>

      {/* Portalled to <body>: the section's reveal leaves a transform on an
          ancestor, which would trap position: fixed. */}
      {open && shot && createPortal(
        <div className="sv1-lb" role="dialog" aria-modal="true" aria-label={shot.caption} onClick={closeLb}>
          <button ref={closeRef} type="button" className="x" onClick={closeLb} aria-label={F.lightbox.closeAriaLabel}>{F.lightbox.closeGlyph}</button>
          <figure onClick={(e) => e.stopPropagation()}>
            <img src={shotFull(shot.img)} alt={shot.caption} />
            <figcaption>{shot.caption}</figcaption>
          </figure>
        </div>,
        document.body,
      )}
    </div>
  );
}

/* ── Teacher view preview (tab 05) ───────────────────────────────────── */

function TeacherMock({ phase }: { phase: Phase }) {
  const T = AXS.product.teacherMock;
  const d = TEACHER_MOCK[phase];
  const done = d.pupils.filter((p) => p[1] === 100).length;
  const stuck = d.pupils.filter((p) => p[1] > 0 && p[1] < 100).length;
  const not = d.pupils.length - done - stuck;
  const counts = [done, stuck, not];
  return (
    <div className="tm" style={{ "--a": PHASES[phase].accent } as React.CSSProperties}>
      <aside>
        <div className="tb">{T.brand.slice(0, -1)}<span>{T.brand.slice(-1)}</span></div>
        <ul>{T.sidebar.map((s) => <li key={s} className={s === T.sidebarActive ? "on" : ""}>{s}</li>)}</ul>
      </aside>
      <div className="tmain">
        <div className="tmtop"><div><div className="k">{T.schoolLabel}</div><div className="v">{d.school}</div></div><span className="lock">{T.lockButton}</span></div>
        <div className="eyeb">{d.course} · {d.unit}</div>
        <h4>Class {d.cls}</h4>
        <div className="prog">{d.unitWord} {d.unitN} of {d.unitOf}</div>
        <div className="stats">{T.stats.map((label, i) => <div key={label}><b>{counts[i]}</b><span>{label}</span></div>)}</div>
        <div className="tmgrid">
          <ul className="pupils">
            {d.pupils.map(([n, pct]) => (
              <li key={n}><span>{n}</span><i style={{ "--w": `${pct}%`, "--c": pct === 100 ? "#0e7a45" : "#b8730a" } as React.CSSProperties} /><em>{pupilStatus(pct)}</em></li>
            ))}
          </ul>
          <div className="missed">
            <div className="k">{T.missedEyebrow}</div>
            <div className="q">&ldquo;{d.missed.q}&rdquo;</div>
            <div className="n">{d.missed.n} of {d.pupils.length} {T.missedTail}</div>
            <p>{d.missed.why}</p>
            <span className="lock">{T.missedButton}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Curriculum map preview (tab 06) ─────────────────────────────────── */

function CurriculumMock({ phase }: { phase: Phase }) {
  const C = AXS.product.curriculumMock;
  const rows = CURRICULUM[phase];
  const accent = PHASES[phase].accent;
  const strands = [...new Set(rows.map((r) => r.strand))];
  const colour = (s: string) => STRAND_COLOUR[s] ?? accent;
  return (
    <div className="cm" style={{ "--a": accent } as React.CSSProperties}>
      <div className="cmtop">
        <div><h4>{C.title}</h4><div className="eyeb">{C.eyebrow[phase]}</div></div>
        <span className="dl"><span aria-hidden="true">↓</span> {C.downloadButton}</span>
      </div>
      <table>
        <thead><tr>{C.columns.map((c) => <th key={c}>{c}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.lesson}>
              <td><b>{r.lesson}</b><span className="tt">{r.title}</span></td>
              <td><span className="strand" style={{ "--c": colour(r.strand) } as React.CSSProperties}>{r.strand}</span></td>
              <td>{r.computing}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="cov">
        <b>{C.coverageLead}{strands.length}{C.coverageTail}</b>
        {strands.map((s) => <span key={s} className="strand" style={{ "--c": colour(s) } as React.CSSProperties}>{s}</span>)}
      </div>
    </div>
  );
}
