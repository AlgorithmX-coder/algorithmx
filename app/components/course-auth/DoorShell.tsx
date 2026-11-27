"use client";

/**
 * The daylight door shell (landing lab round 8, r8-door.html, owner
 * 2026-11-26): everything around the form on the AI Cleared, AI Fluent and
 * Cyber Awareness auth pages. The pale grid ground, the lockup and back
 * link, one white panel with the course on the left (eyebrow, title, the
 * course's animated motif, three facts, the price) and the form on the
 * right, and the Pause control. The login/signup body (DoorConsole) and the
 * forgot/reset bodies (DoorForgot, DoorReset) render inside it.
 *
 * It replaces the Night Console for these three courses only; every other
 * course keeps NightShell. The lockup and back link point where the Night
 * Console's did (the course's `landing`), because the course's own base is
 * the signed-in console.
 */

import Link from "next/link";
import { useState, type CSSProperties, type ReactNode } from "react";
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google";
import CubeMark from "@/app/components/CubeMark";
import { INDIVIDUAL_WORKPLACE_COURSE_PENCE, poundsFigure } from "@/app/lib/individualCoursePrice";
import { SHARED, authPack } from "./content";
import { DOOR_PRICE, DOOR_SIDE, DOOR_UI, SECURED_FORM, SECURED_SIDE, type DoorCourse, type DoorKey } from "./doorContent";
import type { NightMode } from "./NightShell";
import "./door.css";

const disp = Space_Grotesk({ weight: ["500", "600", "700"], subsets: ["latin"], variable: "--r8d-disp", display: "swap" });
const sans = Inter({ weight: ["400", "500", "600", "700"], subsets: ["latin"], variable: "--r8d-sans", display: "swap" });
const mono = Geist_Mono({ weight: ["600", "700"], subsets: ["latin"], variable: "--r8d-mono", display: "swap" });

type Vars = CSSProperties & Record<`--${string}`, string | number>;

const svg = (d: string, sw = 1.9) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d={d} /></svg>
);
export const DOOR_ICON = {
  shield: svg("M12 2l8 3v6c0 5-3.5 8-8 11-4.5-3-8-6-8-11V5l8-3z M9 12l2 2 4-4"),
  bolt: svg("M13 2L3 14h7l-1 8 10-12h-7l1-8z"),
  lens: svg("M11 4a7 7 0 100 14 7 7 0 000-14z M20 20l-3.5-3.5"),
  arrow: svg("M5 12h14 M13 6l6 6-6 6"),
  back: svg("M19 12H5 M11 6l-6 6 6 6"),
  lock: svg("M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 017 0v3"),
  warn: svg("M12 3a9 9 0 100 18 9 9 0 000-18z M12 8v5 M12 16h.01", 2.2),
  tick: svg("M12 3a9 9 0 100 18 9 9 0 000-18z M8 12.5l2.6 2.5L16 9.5", 2.4),
  key: svg("M8 11a4 4 0 100 8 4 4 0 000-8z M11 12l9-9 M16 5l3 3 M13 8l3 3", 2.2),
} as const;

const MARK: Record<DoorKey, ReactNode> = { cleared: DOOR_ICON.shield, fluent: DOOR_ICON.bolt, awareness: DOOR_ICON.lens, secured: DOOR_ICON.shield };
const TRACK_ICON = { cleared: DOOR_ICON.shield, fluent: DOOR_ICON.bolt, awareness: DOOR_ICON.lens } as const;

const rise = (i: number) => ({ "data-rise": "", style: { "--i": i } as Vars });

/* The pale ground: grid, two pools, four slow streaks. */
export function DoorGround() {
  const st = (left: string, s: string, d: string, o?: string) => (
    <span className="st" style={{ left, "--s": s, "--d": d, ...(o ? { "--o": o } : {}) } as Vars} />
  );
  return (
    <div className="r8-ground" aria-hidden="true">
      <span className="grid" /><span className="pool a" /><span className="pool b" />
      {st("9%", "255,150,60", "11s")}{st("18%", "0,190,220", "8s", "-3s")}{st("86%", "139,123,255", "10s", "-5s")}{st("93%", "240,106,184", "13s", "-2s")}
    </div>
  );
}

/* Each course's motif, as the lab drew it. Decoration only. */
const CLEARED_LINES: [string, string, string][] = [["72%", "18%", "40%"], ["88%", "40%", "34%"], ["64%", "8%", "52%"], ["80%", "30%", "44%"], ["56%", "20%", "30%"]];
function Motif({ course, caption }: { course: DoorCourse; caption?: string }) {
  if (course === "cleared") {
    return (
      <div className="r8-motif m-clr" aria-hidden="true">
        <span className="stamp">CLEARED</span>
        {CLEARED_LINES.map((l, n) => <div key={n} className="ln" style={{ "--w": l[0], "--l": l[1], "--r": l[2], "--n": n } as Vars} />)}
        {caption ? <span className="cap">{caption}</span> : null}
      </div>
    );
  }
  if (course === "fluent") {
    return (
      <div className="r8-motif m-flu" aria-hidden="true">
        <div className="ask">{DOOR_ICON.bolt}<span>Summarise this report for a client</span></div>
        <div className="ans">{["92%", "78%", "85%", "46%"].map((w, n) => <i key={n} style={{ "--w": w, "--n": n } as Vars} />)}</div>
        {caption ? <span className="cap">{caption}</span> : null}
      </div>
    );
  }
  return (
    <div className="r8-motif m-awr" aria-hidden="true">
      <div className="row"><b>Payroll</b><span /><em>Safe</em></div>
      <div className="row bad"><b>IT Helpdesk</b><span /><em>Phish</em></div>
      <div className="row"><b>Amara Osei</b><span /><em>Safe</em></div>
      <i className="lens" />
    </div>
  );
}

/** The Pause/Play control, shared by every daylight page. */
export function DoorPause({ paused, onToggle }: { paused: boolean; onToggle: () => void }) {
  return (
    <button className="r8-pause" type="button" onClick={onToggle} aria-pressed={paused} aria-label={paused ? DOOR_UI.playAria : DOOR_UI.pauseAria}>
      {paused
        ? <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M3 1.5v9l7.5-4.5z" /></svg>
        : <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><rect x="2" y="1.5" width="3" height="9" rx="1" /><rect x="7" y="1.5" width="3" height="9" rx="1" /></svg>}
    </button>
  );
}

/* A course door, under the title: the motif, the facts and the price. */
function CourseSide({ course }: { course: DoorCourse }) {
  const side = DOOR_SIDE[course];
  return (
    <>
      <p className="tag" {...rise(2)}>{side.tag}</p>
      <div {...rise(3)}><Motif course={course} caption={side.caption} /></div>
      <ul className="r8-facts" {...rise(4)}>
        {side.facts.map(([b, s]) => <li key={s}><b>{b}</b><span>{s}</span></li>)}
      </ul>
      <div className="r8-price" {...rise(5)}>
        <span className="amt"><sup>£</sup>{poundsFigure(INDIVIDUAL_WORKPLACE_COURSE_PENCE)}</span>
        <p><b>{DOOR_PRICE.lead}</b><br />{DOOR_PRICE.rest}</p>
      </div>
    </>
  );
}

/* The firm door, under the title: one seat, the three courses it opens, no price. */
function SecuredSide() {
  return (
    <>
      <p className="tag" {...rise(2)}>{SECURED_SIDE.tag}</p>
      <ul className="r8-tracks" {...rise(3)}>
        {SECURED_SIDE.tracks.map((tr, n) => (
          <li key={tr.key} className="r8-track" style={{ "--t": tr.rgb, "--n": n } as Vars}>
            <span className="ic">{TRACK_ICON[tr.key]}</span>
            <div><b>{tr.name}</b><span>{tr.line}</span></div>
            <small>{tr.count}</small>
          </li>
        ))}
      </ul>
      <p className="r8-note" {...rise(4)}>{SECURED_SIDE.note}</p>
    </>
  );
}

export const DOOR_FONTS = `${disp.variable} ${sans.variable} ${mono.variable}`;

export default function DoorShell({
  course,
  mode,
  title,
  sub,
  notice = "",
  error = "",
  children,
  foot,
}: {
  course: DoorKey;
  mode: NightMode;
  title: string;
  /** null drops the sub line (the reset page's done state has none). */
  sub: string | null;
  /** The success notice (role=status); empty hides it. */
  notice?: string;
  /** The error line (role=alert); empty hides it. */
  error?: string;
  children: ReactNode;
  /** The switch line under the form ("New here? Create an account"). */
  foot: ReactNode;
}) {
  const t = authPack(course);
  const firm = course === "secured";
  const [paused, setPaused] = useState(false);
  const landing = t.landing ?? t.base;
  const [plain, acc] = firm ? SECURED_SIDE.word : DOOR_SIDE[course].word;
  /* Sign in and Create account are the two tabs; the password pages sit
     under neither, so they show none. The firm door is sign in only. */
  const tabs = !firm && (mode === "login" || mode === "signup");
  const backLabel = firm ? SECURED_FORM.back : `${SHARED.back} ${t.courseName}`;
  const trust = firm ? SECURED_FORM.trust : DOOR_UI.trust;

  return (
    <div className={`r8d ${DOOR_FONTS}`} data-c={course} data-mode={mode} data-still={paused ? "" : undefined}>
      <DoorGround />

      <header className="r8-top">
        <Link className="r8-lock" href={landing} aria-label={`${t.courseName} by AlgorithmX`}>
          <span className="mark">{MARK[course]}</span>
          <span className="col">
            <span className="name">{plain} <em>{acc}</em></span>
            <span className="by">by <CubeMark size={9} strokeWidth={2} /> AlgorithmX</span>
          </span>
        </Link>
        <Link className="r8-back" href={landing} aria-label={backLabel}>{DOOR_ICON.back}<span>{backLabel}</span></Link>
      </header>

      <main className="r8-stage">
        <div className="r8-door">
          <section className="r8-side" aria-labelledby="r8-course">
            <span className="r8-eyebrow" {...rise(0)}><i />{firm ? SECURED_SIDE.who : DOOR_SIDE[course].who}</span>
            <h1 id="r8-course" {...rise(1)}>{plain} <em>{acc}</em></h1>
            {firm ? <SecuredSide /> : <CourseSide course={course} />}
          </section>

          <section className="r8-form" aria-labelledby="r8-title" {...rise(2)}>
            {tabs && (
              <nav className="r8-tabs" aria-label={DOOR_UI.tabsAria}>
                <Link href={`${t.base}/login`} aria-current={mode === "login" ? "page" : undefined}>{DOOR_UI.tabLogin}</Link>
                <Link href={`${t.base}/signup`} aria-current={mode === "signup" ? "page" : undefined}>{DOOR_UI.tabSignup}</Link>
              </nav>
            )}
            <h2 id="r8-title">{title}</h2>
            {sub !== null && <p className="sub">{sub}</p>}

            <p className="r8-msg ok" id="r8-ok" role="status" aria-live="polite" hidden={!notice}>
              {DOOR_ICON.tick}<span>{notice}</span>
            </p>
            <p className="r8-msg err" id="r8-msg" role="alert" aria-live="polite" hidden={!error}>
              {DOOR_ICON.warn}<span>{error}</span>
            </p>

            {children}
            {foot}

            <div className="r8-trust">
              <span>{DOOR_ICON.lock}{trust[0]}</span>
              <span>{DOOR_ICON.shield}{trust[1]}</span>
              <span>{trust[2]}</span>
            </div>
            <p className="r8-legal"><Link href="/terms">Terms</Link><span aria-hidden="true"> · </span><Link href="/privacy">Privacy</Link></p>
          </section>
        </div>
      </main>

      <DoorPause paused={paused} onToggle={() => setPaused((p) => !p)} />
    </div>
  );
}
