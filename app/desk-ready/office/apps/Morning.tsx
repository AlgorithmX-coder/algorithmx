"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { markDone } from "../../learn/progress";
import { Button, Kicker } from "../../learn/ui";
import { D, W } from "../../tokens";
import { ARRIVALS, clockAt, LENGTH, MORNING_ID } from "../jobs/monday/data";
import { unreadChats } from "../meetings";
import { advance, finish, morningOf, watch } from "../jobs/monday/morning";
import type { Action } from "../store";
import type { OfficeState } from "../types";
import type { OfficeAppProps } from "./registry";

/* The final task's clock, drawn over the office (the registry's "morning"
 * layer) and in the task panel (MorningPanel, the job's live panel).
 *
 * The office clock runs from 08:30 to 12:30 at four times real speed, so
 * the morning takes about an hour. It lives in the office record (minute),
 * so leaving and coming back carries on where the learner was; it only
 * moves while this page is open, in front, and the learner has pressed
 * Start or Carry on. Each arrival lands at its office time (./jobs/monday).
 * A hidden ?speed=60 runs it faster, for testing only. */

export const MORNING_COLOUR = "#c4314b";
export const REAL_SPEED = 4;

/* Has the clock been set going on this page, this visit? Shared by the
 * layer and the panel, and false again on every fresh visit, so a learner
 * who left mid-morning comes back to a paused clock, not a running one. */
const go = { on: false, subs: new Set<() => void>() };
const setGo = (on: boolean) => {
  go.on = on;
  go.subs.forEach((f) => f());
};
const useGo = () =>
  useSyncExternalStore(
    (f) => {
      go.subs.add(f);
      return () => go.subs.delete(f);
    },
    () => go.on,
    () => false,
  );

function speedFromUrl(): number {
  try {
    const n = Number(new URLSearchParams(window.location.search).get("speed"));
    return Number.isFinite(n) && n >= 1 ? Math.min(n, 600) : REAL_SPEED;
  } catch {
    return REAL_SPEED;
  }
}

const update = (dispatch: (a: Action) => void, fn: (s: OfficeState) => OfficeState) => dispatch({ type: "update", fn });
const pause = (dispatch: (a: Action) => void) => update(dispatch, (s) => ({ ...s, morning: { ...morningOf(s), paused: true } }));
const carryOn = (dispatch: (a: Action) => void) => {
  update(dispatch, (s) => (morningOf(s).started ? { ...s, morning: { ...morningOf(s), paused: false } } : advance({ ...s, morning: { ...morningOf(s), paused: false } }, 0)));
  setGo(true);
};

/* ── the layer over the desktop ─────────────────────────────────────── */

interface Toast {
  id: string;
  from: string;
  what: string;
  at: string;
}

export function MorningLayer({ state, dispatch, show }: OfficeAppProps) {
  const m = morningOf(state);
  const on = useGo();
  /* the office renders on the client only, so the address is there to read */
  const [speed] = useState(speedFromUrl);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seen = useRef<string[] | null>(null);
  const timers = useRef<number[]>([]);
  const over = m.endedAt !== undefined;
  const running = on && m.started && !m.paused && !over;

  /* a fresh visit starts with the clock stopped */
  useEffect(() => {
    setGo(false);
    return () => setGo(false);
  }, []);

  /* the clock: one office minute every 15 real seconds at 4x */
  useEffect(() => {
    if (!running) return;
    const per = 60000 / speed;
    let last = performance.now();
    let acc = 0;
    const id = window.setInterval(() => {
      const now = performance.now();
      acc += now - last;
      last = now;
      const steps = Math.floor(acc / per);
      if (steps > 0) {
        acc -= steps * per;
        update(dispatch, (s) => advance(s, steps));
      }
    }, Math.max(50, Math.min(250, per / 2)));
    return () => window.clearInterval(id);
  }, [running, speed, dispatch]);

  /* note when jobs are done, stamp sent mail with the office time */
  useEffect(() => {
    if (watch(state)) update(dispatch, (s) => watch(s) ?? s);
  }, [state, dispatch]);

  /* leaving the tab pauses the clock */
  useEffect(() => {
    const away = () => {
      if (document.hidden && go.on) pause(dispatch);
    };
    document.addEventListener("visibilitychange", away);
    return () => document.removeEventListener("visibilitychange", away);
  }, [dispatch]);

  /* a passed morning counts as finished on the learner's account */
  useEffect(() => {
    if (m.result?.passed) markDone(MORNING_ID);
  }, [m.result?.passed]);

  /* a new email lands: a notification, as Windows shows one */
  useEffect(() => {
    if (seen.current === null) {
      seen.current = m.arrived;
      return;
    }
    const fresh = m.arrived.filter((id) => !seen.current!.includes(id));
    seen.current = m.arrived;
    const mails = ARRIVALS.filter((a) => fresh.includes(a.id) && a.how === "email");
    if (!mails.length) return;
    setToasts((t) => [...t, ...mails.map((a) => ({ id: a.id, from: a.from, what: a.what, at: clockAt(a.at) }))].slice(-3));
    const ids = mails.map((a) => a.id);
    timers.current.push(window.setTimeout(() => setToasts((t) => t.filter((x) => !ids.includes(x.id))), 9000));
  }, [m.arrived]);
  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const now = clockAt(m.endedAt ?? m.minute);
  /* Windows stacks notifications above the taskbar: above a Teams toast or a ringing phone, when one is showing */
  const ringing = (state.phone?.calls ?? []).some((c) => c.ringing && !(state.phone?.answered ?? []).includes(c.id));
  const toastBottom = 62 + (ringing ? 186 : unreadChats(state) > 0 ? 112 : 0);
  let card: { kicker: string; title: string; body: string[]; action?: { label: string; onClick: () => void }; link?: boolean } | null = null;
  if (over) {
    card = {
      kicker: `Monday 16 November · ${now}`,
      title: m.endedAt! >= LENGTH ? "It's 12:30. That's the morning over." : `You finished at ${now}.`,
      body: ["Well done for getting through it. Your scorecard shows every job: done, done late or missed, with how to put right anything you missed.", "It's saved, so you can come back to it any time."],
      link: true,
    };
  } else if (!m.started) {
    card = {
      kicker: "Monday 16 November 2026 · 08:30",
      title: "Your desk is ready.",
      body: ["Work starts landing as soon as the clock starts: email, Teams and the phone, each at its own time, as on a real Monday.", `The clock runs ${speed === REAL_SPEED ? "four times faster than real time, so an office hour takes 15 minutes" : `${speed} times faster than real time (a testing speed)`}. You can pause it from the panel on the left.`],
      action: { label: "Start the clock", onClick: () => carryOn(dispatch) },
    };
  } else if (m.paused) {
    card = { kicker: `Paused · ${now}`, title: "The clock is paused.", body: ["Nothing lands and no time passes while it's paused. Your desk is just as you left it."], action: { label: "Carry on", onClick: () => carryOn(dispatch) } };
  } else if (!on) {
    card = { kicker: `Monday 16 November · ${now}`, title: "Welcome back.", body: [`The clock stopped at ${now} when you left. Everything is where you left it.`], action: { label: "Carry on with the morning", onClick: () => carryOn(dispatch) } };
  }

  return (
    <>
      {toasts.length > 0 && !card && (
        <div className="mm-toasts" aria-live="polite" style={{ bottom: toastBottom }}>
          {toasts.map((t) => (
            <button
              key={t.id}
              type="button"
              className="mm-toast"
              onClick={() => {
                show("outlook");
                setToasts((x) => x.filter((y) => y.id !== t.id));
              }}
            >
              <span className="mm-toast-app">
                <span className="mm-toast-ico" aria-hidden>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" style={{ display: "block" }}>
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                  </svg>
                </span>
                Outlook · New email · {t.at}
              </span>
              <b>{t.from}</b>
              <span>{t.what}</span>
            </button>
          ))}
        </div>
      )}
      {card && (
        <div className="mm-cover" role="dialog" aria-modal="true" aria-label={card.title}>
          <div className="mm-card">
            <span className="mm-kicker">{card.kicker}</span>
            <h2>{card.title}</h2>
            {card.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <div className="mm-card-actions">
              {card.action && (
                <button type="button" className="mm-primary" onClick={card.action.onClick} autoFocus>
                  {card.action.label}
                </button>
              )}
              {card.link && (
                <Link href="/desk-ready/final/scorecard" className="mm-primary">
                  See your scorecard
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
      <style>{LAYER_CSS}</style>
    </>
  );
}

const LAYER_CSS = `
  .mm-toasts { position: absolute; right: 14px; z-index: 40; display: flex; flex-direction: column-reverse; gap: 8px; width: 330px; }
  .mm-toast { display: grid; gap: 3px; text-align: left; padding: 12px 14px 13px; border: none; border-radius: 8px; background: #ffffff; box-shadow: 0 14px 38px rgba(0,0,0,0.35); border-top: 3px solid ${W.outlook}; font-family: ${W.font}; color: ${W.ink}; cursor: pointer; animation: mm-in .28s ease-out both; }
  .mm-toast:hover { background: #f7faff; }
  .mm-toast b { font-size: 15px; }
  .mm-toast > span:last-child { font-size: 14px; color: ${W.body}; }
  .mm-toast-app { display: flex; align-items: center; gap: 7px; font-size: 12.5px; color: ${W.muted}; }
  .mm-toast-ico { width: 18px; height: 18px; border-radius: 4px; background: ${W.outlook}; display: inline-flex; align-items: center; justify-content: center; }
  @keyframes mm-in { from { opacity: 0; transform: translateY(-8px); } }
  @media (prefers-reduced-motion: reduce) { .mm-toast { animation: none; } }
  .mm-cover { position: absolute; inset: 0; z-index: 80; display: flex; align-items: center; justify-content: center; padding: 24px; background: rgba(9,16,36,0.55); backdrop-filter: blur(9px); -webkit-backdrop-filter: blur(9px); }
  .mm-card { width: min(520px, 100%); padding: 28px 30px 26px; border-radius: 14px; background: #ffffff; color: ${W.ink}; font-family: ${W.font}; box-shadow: 0 40px 80px -30px rgba(0,0,0,0.75); }
  .mm-kicker { display: block; font-size: 13px; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: ${MORNING_COLOUR}; font-variant-numeric: tabular-nums; }
  .mm-card h2 { margin: 8px 0 0; font-size: 27px; line-height: 1.2; font-weight: 600; letter-spacing: -0.01em; }
  .mm-card p { margin: 12px 0 0; font-size: 16.5px; line-height: 1.55; color: ${W.body}; }
  .mm-card-actions { margin-top: 22px; display: flex; flex-wrap: wrap; gap: 10px; }
  .mm-primary { display: inline-flex; align-items: center; justify-content: center; min-height: 46px; padding: 0 22px; border: none; border-radius: 6px; background: ${W.outlook}; color: #fff; font-family: ${W.font}; font-size: 16px; font-weight: 600; text-decoration: none; cursor: pointer; }
  .mm-primary:hover { background: #0c5aa0; }
  .mm-primary:focus-visible { outline: 3px solid ${W.outlook}; outline-offset: 3px; }
`;

/* ── the task panel ─────────────────────────────────────────────────── */

export function MorningPanel({ state, dispatch, restart }: { state: OfficeState; dispatch: (a: Action) => void; restart: () => void }) {
  const m = morningOf(state);
  const on = useGo();
  const [ask, setAsk] = useState<"finish" | "restart" | null>(null);
  const [hints, setHints] = useState(false);
  const over = m.endedAt !== undefined;
  const running = on && m.started && !m.paused && !over;
  const now = clockAt(m.endedAt ?? m.minute);
  const pct = Math.round(((m.endedAt ?? m.minute) / LENGTH) * 100);
  const landed = ARRIVALS.filter((a) => m.arrived.includes(a.id));
  const count = (how: string, one: string, many: string) => {
    const n = landed.filter((a) => a.how === how).length;
    return n ? `${n} ${n === 1 ? one : many}` : null;
  };
  const so = [count("email", "email", "emails"), count("teams", "Teams message", "Teams messages"), count("phone", "phone call", "phone calls")].filter(Boolean);

  return (
    <>
      <div className="mm-clock" style={{ "--mm": MORNING_COLOUR } as CSSProperties}>
        <span className="mm-clock-top">
          <span>Office time</span>
          <span className={running ? "mm-live on" : "mm-live"}>{over ? "Finished" : running ? "Clock running" : m.started ? "Paused" : "Not started"}</span>
        </span>
        <b className="mm-time" aria-live="off">
          {now}
        </b>
        <span className="mm-date">Monday 16 November 2026</span>
        <span className="mm-bar" role="progressbar" aria-label="How far through the morning" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${pct}%` }} />
        </span>
        <span className="mm-ends">
          <span>08:30</span>
          <span>Ends 12:30</span>
        </span>
      </div>
      <p className="of-brief">Work lands on your desk as it would on a real Monday. Read each thing as it arrives, decide what matters most, and do it. Nobody will tell you which app to use, or what order to work in.</p>
      <p className="mm-so">{so.length ? `So far this morning: ${so.join(", ")}.` : "Nothing has landed yet."}</p>
      {over ? (
        <div className="of-actions">
          <Link href="/desk-ready/final/scorecard" className="of-link-btn">
            See your scorecard
          </Link>
          <Button kind="secondary" onClick={() => setAsk("restart")}>
            Try the morning again
          </Button>
        </div>
      ) : (
        <>
          <div className="of-actions">
            {m.started && !m.paused && on ? (
              <Button kind="secondary" onClick={() => pause(dispatch)}>
                Pause the clock
              </Button>
            ) : (
              <Button onClick={() => carryOn(dispatch)}>{m.started ? "Carry on" : "Start the clock"}</Button>
            )}
            {m.started && (
              <Button kind={running ? "primary" : "secondary"} onClick={() => setAsk("finish")}>
                I&apos;m done for the morning
              </Button>
            )}
          </div>
          <p className="mm-small">The clock runs four times faster than real time: an office hour takes 15 minutes. It stops when you pause it or leave the page, so you can come back to it.</p>
          <button type="button" className="mm-hint-btn" onClick={() => setHints((h) => !h)} aria-expanded={hints}>
            {hints ? "Hide the tips" : "Stuck? Some tips"}
          </button>
          {hints && (
            <ol className="of-hints">
              <li>Read each message as it lands: what is being asked, by whom, and by when?</li>
              <li>Some jobs say when they&apos;re needed. Some can wait. One should never wait.</li>
              <li>The red numbers on the taskbar show what&apos;s new: unread email, a Teams message, a ringing phone.</li>
              <li>When a job is done, tell the person who asked, in one line.</li>
            </ol>
          )}
          {m.started && (
            <button type="button" className="of-reset" onClick={() => setAsk("restart")}>
              Start the morning again
            </button>
          )}
        </>
      )}
      <p className="of-note">Nothing here is sent anywhere. It is a pretend office, so you can&apos;t break anything.</p>

      {/* drawn on the page itself: the panel is its own layer, so a dialog inside it would sit under the desktop */}
      {ask &&
        createPortal(
        <div className="of-overlay" role="dialog" aria-modal="true" aria-label={ask === "finish" ? "Finish the morning" : "Start the morning again"} style={{ fontFamily: D.sans, color: D.body, zIndex: 90 }}>
          <div className="of-card dr-glass">
            <Kicker>{ask === "finish" ? `Office time ${now}` : "Start again"}</Kicker>
            <h2 className="of-h2">{ask === "finish" ? "Finish the morning now?" : "Start the morning again?"}</h2>
            <p className="of-brief">
              {ask === "finish"
                ? `Your scorecard is marked on your desk as it is now, at ${now}. Anything not done counts as missed, and anything still to arrive counts as not reached.`
                : over
                  ? "Your desk goes back to 08:30 on Monday, with the clock stopped. This scorecard is kept with your earlier ones."
                  : "Your desk goes back to 08:30 on Monday, with the clock stopped. Anything you've done this morning is cleared."}
            </p>
            <div className="of-actions">
              <Button
                onClick={() => {
                  if (ask === "finish") update(dispatch, (s) => finish(s));
                  else {
                    setGo(false);
                    restart();
                  }
                  setAsk(null);
                }}
              >
                {ask === "finish" ? "Yes, I'm done" : "Start again"}
              </Button>
              <Button kind="secondary" onClick={() => setAsk(null)}>
                {ask === "finish" ? "Keep going" : "Cancel"}
              </Button>
            </div>
          </div>
        </div>,
          document.body,
        )}
      <style>{PANEL_CSS}</style>
    </>
  );
}

const PANEL_CSS = `
  .mm-clock { margin-top: 14px; display: grid; gap: 4px; padding: 14px 16px 14px; border-radius: 14px; background: ${D.glass}; border: 1px solid ${D.edgeStrong}; }
  .mm-clock-top { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-family: ${D.mono}; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: ${D.faint}; }
  .mm-live { display: inline-flex; align-items: center; gap: 6px; color: ${D.warn}; }
  .mm-live::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: currentColor; }
  .mm-live.on { color: ${D.good}; }
  @media (prefers-reduced-motion: no-preference) { .mm-live.on::before { animation: mm-pulse 1.6s ease-in-out infinite; } }
  @keyframes mm-pulse { 50% { opacity: 0.25; } }
  .mm-time { font-family: ${D.display}; font-size: 54px; line-height: 1; font-weight: 600; letter-spacing: -0.02em; color: ${D.ink}; font-variant-numeric: tabular-nums; margin-top: 4px; }
  .mm-date { font-size: 15px; color: ${D.muted}; }
  .mm-bar { margin-top: 10px; height: 6px; border-radius: 99px; background: rgba(255,255,255,0.09); overflow: hidden; }
  .mm-bar span { display: block; height: 100%; border-radius: 99px; background: linear-gradient(90deg, ${D.accent}, ${D.warn}); transition: width .6s ease; }
  .mm-ends { display: flex; justify-content: space-between; font-family: ${D.mono}; font-size: 11.5px; color: ${D.faint}; }
  .mm-so { margin: 12px 0 0; font-size: 15px; line-height: 1.5; color: ${D.accent}; }
  .mm-small { margin: 14px 0 0; font-size: 14px; line-height: 1.5; color: ${D.faint}; }
  .mm-hint-btn { margin-top: 10px; min-height: 40px; padding: 0; border: none; background: none; color: ${D.accent}; font-family: ${D.sans}; font-size: 15px; text-decoration: underline; cursor: pointer; }
`;
