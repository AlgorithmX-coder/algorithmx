"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { W } from "../../tokens";
import type { OfficeState, SignInPrompt } from "../types";
import type { OfficeAppProps } from "./registry";

/* Module 11: Staying safe at work (criteria SAFE-3, SAFE-5). Two layers
 * drawn over the pretend desktop:
 *
 * - Your mobile, on the desk beside the keyboard, with an authenticator
 *   app. A sign-in request arrives a few seconds into the job ("Approve
 *   sign-in?", with the app, the place and the time, and a box for the
 *   number shown on the screen that started it). The learner isn't
 *   signing in to anything, so there is no number to match: "No, it's not
 *   me", then Report. It sits above the lock screen, as a real phone would.
 *
 * - Windows' Start button, its menu (with You > Lock), and the lock screen.
 *   Win+L locks it too. On a real Windows computer Win+L locks the real
 *   computer before the page sees the L, so the Windows key held as the
 *   page loses focus counts as Win+L; signing back in to Windows brings the
 *   learner back to the pretend lock screen. */

export const SECURITY_COLOUR = "#3a3a3a";

const later = (time: string, minutes: number) => {
  const m = time.match(/(\d{1,2}):(\d{2})/);
  if (!m) return time;
  const t = Number(m[1]) * 60 + Number(m[2]) + minutes;
  return `${String(Math.floor(t / 60) % 24).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
};

/* "Wed 11 Nov, 15:01" as the lock screen says it: "Wednesday 11 November". */
const DAYS: Record<string, string> = { Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday" };
const MONTHS: Record<string, string> = { Nov: "November", Dec: "December", Oct: "October" };
function longDate(clock: string): string {
  const m = clock.match(/^(\w{3}) (\d{1,2}) (\w{3})/);
  return m ? `${DAYS[m[1]] ?? m[1]} ${m[2]} ${MONTHS[m[3]] ?? m[3]}` : "Wednesday 11 November";
}

/* ── your mobile, and the sign-in request ─────────────────────────────── */

const setPrompt = (fn: (p: SignInPrompt) => Partial<SignInPrompt>) => (s: OfficeState): OfficeState => (s.signIn ? { ...s, signIn: { ...s.signIn, ...fn(s.signIn) } } : s);

export function SignInLayer({ state, dispatch }: OfficeAppProps) {
  const p = state.signIn;
  const [open, setOpen] = useState(p?.status !== "waiting");
  const [declined, setDeclined] = useState(false);
  const [num, setNum] = useState("");
  const status = p?.status;

  /* it arrives a few seconds after the job opens */
  useEffect(() => {
    if (status !== "waiting") return;
    const id = setTimeout(() => {
      dispatch({ type: "update", fn: setPrompt(() => ({ status: "shown" })) });
      setOpen(true);
    }, 4500);
    return () => clearTimeout(id);
  }, [status, dispatch]);

  if (!p) return null;
  const pending = p.status === "shown";

  if (!open || p.status === "waiting")
    return (
      <button
        type="button"
        onClick={() => p.status !== "waiting" && setOpen(true)}
        aria-label={pending ? "Your phone: a sign-in request is waiting" : "Your phone"}
        style={{ position: "absolute", right: 18, bottom: 64, zIndex: 48, display: "inline-flex", alignItems: "center", gap: 8, minHeight: 40, padding: "0 14px 0 10px", border: "none", borderRadius: 20, background: "#1b1b1f", color: "#fff", fontFamily: W.font, fontSize: 13.5, boxShadow: "0 10px 26px -10px rgba(0,0,0,0.7)", cursor: p.status === "waiting" ? "default" : "pointer" }}
      >
        <MiniPhone />
        Your phone
        {pending && <b style={{ minWidth: 18, height: 18, borderRadius: 9, background: "#c4314b", fontSize: 11.5, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>1</b>}
      </button>
    );

  return (
    <div role="dialog" aria-label="Your phone" className={pending ? "sec-buzz" : undefined} style={{ position: "absolute", right: 18, bottom: 62, zIndex: 48, width: 262, maxHeight: "calc(100% - 80px)", padding: 9, borderRadius: 34, background: "#1b1b1f", boxShadow: "0 30px 60px -18px rgba(0,0,0,0.75), inset 0 0 0 2px #3a3a40", fontFamily: W.font }}>
      <div style={{ position: "relative", height: 496, maxHeight: "calc(100svh - 200px)", minHeight: 400, borderRadius: 26, overflow: "hidden", background: "#f3f4f7", color: W.ink, display: "flex", flexDirection: "column" }}>
        <StatusBar time={p.at} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 14px 10px", borderBottom: "1px solid #e2e4ea", background: "#fff" }}>
          <AuthLogo />
          <b style={{ fontSize: 15 }}>Authenticator</b>
          <button type="button" onClick={() => setOpen(false)} aria-label="Put the phone down" title="Put the phone down" style={{ marginLeft: "auto", width: 30, height: 30, border: "none", borderRadius: 15, background: "#eef0f4", color: W.muted, fontSize: 15, cursor: "pointer" }}>
            ▾
          </button>
        </div>
        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "14px 14px 16px" }}>
          {pending ? (
            <div style={{ display: "grid", gap: 12 }}>
              <PromptCard p={p} />
              <label style={{ display: "grid", gap: 6, fontSize: 13.5, color: W.body, textAlign: "center" }}>
                Enter the number shown to sign in.
                <input
                  aria-label="The number shown on the sign-in screen"
                  inputMode="numeric"
                  value={num}
                  onChange={(e) => setNum(e.target.value.replace(/\D/g, "").slice(0, 2))}
                  placeholder="Number"
                  style={{ justifySelf: "center", width: 110, minHeight: 46, border: "1px solid #c8ccd6", borderRadius: 8, textAlign: "center", fontFamily: W.font, fontSize: 22, letterSpacing: "0.1em", color: W.ink, background: "#fff" }}
                />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1.45fr 1fr", gap: 8 }}>
                <PhoneButton onClick={() => dispatch({ type: "update", fn: setPrompt(() => ({ status: "denied" })) })}>No, it&apos;s not me</PhoneButton>
                <PhoneButton primary disabled={num.length < 2} onClick={() => dispatch({ type: "update", fn: setPrompt(() => ({ status: "approved" })) })}>
                  Yes
                </PhoneButton>
              </div>
              <button type="button" onClick={() => dispatch({ type: "update", fn: setPrompt(() => ({ status: "denied" })) })} style={{ justifySelf: "center", minHeight: 36, border: "none", background: "none", color: "#2357c6", fontFamily: W.font, fontSize: 13.5, textDecoration: "underline", cursor: "pointer" }}>
                I can&apos;t see the number
              </button>
            </div>
          ) : p.status === "approved" ? (
            <Outcome tone="bad" title="Sign-in approved" lines={["Whoever was signing in is now in your Northfield account.", p.reported ? "You've told IT. They will lock the account and reset your password." : "Tell IT straight away, so they can lock them out."]}>
              {!p.reported && (
                <PhoneButton primary onClick={() => dispatch({ type: "update", fn: setPrompt(() => ({ reported: true })) })}>
                  Report it to IT
                </PhoneButton>
              )}
            </Outcome>
          ) : p.reported ? (
            <Outcome tone="good" title="Reported" lines={["Thanks. IT have been told, and the sign-in was blocked.", "They may ask you to change your password, in case someone knows it."]} />
          ) : declined ? (
            <Outcome tone="plain" title="Sign-in denied" lines={["The sign-in was blocked, but IT haven't been told.", "Someone has your password. Tell IT, by email or with Report."]}>
              <PhoneButton primary onClick={() => dispatch({ type: "update", fn: setPrompt(() => ({ reported: true })) })}>
                Report
              </PhoneButton>
            </Outcome>
          ) : (
            <Outcome tone="plain" title="Sign-in denied" lines={["Did you try to sign in just now?", "If it wasn't you, someone else has your password. Report it, so IT can protect your account."]}>
              <PhoneButton primary onClick={() => dispatch({ type: "update", fn: setPrompt(() => ({ reported: true })) })}>
                Report: it wasn&apos;t me
              </PhoneButton>
              <PhoneButton onClick={() => setDeclined(true)}>Don&apos;t report</PhoneButton>
            </Outcome>
          )}
        </div>
      </div>
      <style>{SECURITY_CSS}</style>
    </div>
  );
}

/* The request itself, as the app shows it. Shared with the lessons. */
export function PromptCard({ p }: { p: Pick<SignInPrompt, "at" | "app" | "location"> }) {
  return (
    <div style={{ padding: "14px 14px 12px", borderRadius: 14, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", textAlign: "center" }}>
      <b style={{ display: "block", fontSize: 18 }}>Approve sign-in?</b>
      <span style={{ display: "block", marginTop: 6, fontSize: 14, fontWeight: 600 }}>Northfield Supplies</span>
      <span style={{ display: "block", fontSize: 13, color: W.muted, overflowWrap: "anywhere" }}>you@northfieldsupplies.example</span>
      <span style={{ display: "grid", gap: 3, marginTop: 10, paddingTop: 10, borderTop: "1px solid #e8eaef", fontSize: 13, color: W.body, textAlign: "left" }}>
        <span>
          <span style={{ color: W.muted }}>App:</span> {p.app}
        </span>
        <span>
          <span style={{ color: W.muted }}>Location:</span> {p.location}
        </span>
        <span>
          <span style={{ color: W.muted }}>Time:</span> {p.at} today
        </span>
      </span>
    </div>
  );
}

function Outcome({ tone, title, lines, children }: { tone: "good" | "bad" | "plain"; title: string; lines: string[]; children?: ReactNode }) {
  const c = tone === "good" ? "#0e700e" : tone === "bad" ? "#c4314b" : W.ink;
  return (
    <div role="status" style={{ display: "grid", gap: 10, padding: "16px 14px", borderRadius: 14, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.12)", textAlign: "center" }}>
      <span aria-hidden style={{ justifySelf: "center", width: 44, height: 44, borderRadius: 22, background: tone === "good" ? "#dff6dd" : tone === "bad" ? "#fde7e9" : "#eef0f4", color: c, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 800 }}>
        {tone === "good" ? "✓" : tone === "bad" ? "!" : "✕"}
      </span>
      <b style={{ fontSize: 17, color: c }}>{title}</b>
      {lines.map((l) => (
        <span key={l} style={{ fontSize: 13.5, lineHeight: 1.45, color: W.body }}>
          {l}
        </span>
      ))}
      {children && <div style={{ display: "grid", gap: 8, marginTop: 4 }}>{children}</div>}
    </div>
  );
}

function PhoneButton({ children, onClick, primary, disabled }: { children: ReactNode; onClick: () => void; primary?: boolean; disabled?: boolean }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} style={{ minHeight: 44, padding: "0 10px", border: primary ? "none" : "1px solid #c8ccd6", borderRadius: 22, background: primary ? "#2357c6" : "#fff", color: primary ? "#fff" : W.ink, fontFamily: W.font, fontSize: 14, fontWeight: 600, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.45 : 1 }}>
      {children}
    </button>
  );
}

export function StatusBar({ time }: { time: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 16px 4px", background: "#fff", fontSize: 12, fontWeight: 600, color: W.ink }}>
      <span>{time}</span>
      <span aria-hidden style={{ display: "inline-flex", gap: 2, alignItems: "flex-end" }}>
        {[5, 7, 9, 11].map((h) => (
          <i key={h} style={{ display: "inline-block", width: 3, height: h, background: W.ink, borderRadius: 1 }} />
        ))}
        <i style={{ display: "inline-block", width: 18, height: 9, marginLeft: 6, border: `1.5px solid ${W.ink}`, borderRadius: 2, background: `linear-gradient(90deg, ${W.ink} 70%, transparent 70%)` }} />
      </span>
    </div>
  );
}

/* An invented authenticator app's mark: a shield with a person in it. */
export function AuthLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M12 2 L20 5 V11 C20 16 16.5 20 12 22 C7.5 20 4 16 4 11 V5 Z" fill="#2357c6" />
      <circle cx="12" cy="10" r="3" fill="#fff" />
      <path d="M7.5 17 C8.5 14.5 10 13.6 12 13.6 C14 13.6 15.5 14.5 16.5 17" fill="#fff" />
    </svg>
  );
}

function MiniPhone() {
  return (
    <svg width="14" height="20" viewBox="0 0 14 20" aria-hidden style={{ display: "inline-block" }}>
      <rect x="1" y="1" width="12" height="18" rx="2.5" fill="none" stroke="#fff" strokeWidth="1.6" />
      <rect x="5" y="15.5" width="4" height="1.4" rx="0.7" fill="#fff" />
    </svg>
  );
}

/* ── Start, Lock, and the lock screen ─────────────────────────────────── */

function lockFn(s: OfficeState): OfficeState {
  const prev = s.screen ?? { locked: false, locks: 0 };
  if (prev.locked) return s;
  const answered = !!s.signIn && (s.signIn.status === "denied" || s.signIn.status === "approved");
  return { ...s, screen: { locked: true, locks: prev.locks + 1, afterPrompt: prev.afterPrompt || answered } };
}
const unlockFn = (s: OfficeState): OfficeState => ({ ...s, screen: { ...(s.screen ?? { locks: 0 }), locked: false } });

export function LockLayer({ state, dispatch, job, show }: OfficeAppProps) {
  const locked = !!state.screen?.locked;
  const [menu, setMenu] = useState<null | "start" | "you" | "power">(null);
  const [left, setLeft] = useState<number | null>(null);
  const [signIn, setSignIn] = useState(false);
  const anchor = useRef<HTMLSpanElement>(null);
  const meta = useRef(false);
  const time = later(job.clock, 3);

  const lock = () => {
    setMenu(null);
    setSignIn(false);
    dispatch({ type: "update", fn: lockFn });
  };

  /* Win+L, from the keyboard */
  useEffect(() => {
    if (locked) return;
    const down = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "OS") meta.current = true;
      else if ((e.metaKey || meta.current) && e.key.toLowerCase() === "l") {
        e.preventDefault();
        meta.current = false;
        dispatch({ type: "update", fn: lockFn });
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Meta" || e.key === "OS") meta.current = false;
    };
    /* Windows locked the real computer while the Windows key was held */
    const away = () => {
      if (meta.current && (document.visibilityState === "hidden" || !document.hasFocus())) {
        meta.current = false;
        dispatch({ type: "update", fn: lockFn });
      }
    };
    const back = () => {
      meta.current = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", away);
    document.addEventListener("visibilitychange", away);
    window.addEventListener("focus", back);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", away);
      document.removeEventListener("visibilitychange", away);
      window.removeEventListener("focus", back);
    };
  }, [locked, dispatch]);

  /* Start sits just left of the first taskbar button, as on Windows 11 */
  useLayoutEffect(() => {
    const screen = anchor.current?.parentElement;
    const bar = screen?.querySelector(".of-taskbar") as HTMLElement | null;
    if (!bar) return;
    const place = () => {
      const first = bar.querySelector(".of-task") as HTMLElement | null;
      setLeft(first ? Math.max(8, first.offsetLeft - 48) : 12);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(bar);
    return () => ro.disconnect();
  }, []);

  /* any key on the lock screen brings up Sign in, as Windows does */
  useEffect(() => {
    if (!locked) return;
    const any = () => setSignIn(true);
    window.addEventListener("keydown", any);
    return () => window.removeEventListener("keydown", any);
  }, [locked]);

  const apps: [string, string, string][] = [
    ["outlook", "Outlook", W.outlook],
    ["explorer", "File Explorer", W.folder],
    ["excel", "Excel", W.excel],
  ];

  return (
    <>
      <span ref={anchor} aria-hidden style={{ display: "none" }} />
      {/* the Start button, on the taskbar */}
      <button
        type="button"
        aria-label="Start"
        aria-expanded={menu !== null}
        onClick={() => setMenu((m) => (m ? null : "start"))}
        className={menu ? "of-task on" : "of-task"}
        style={{ position: "absolute", bottom: 5, left: left ?? 12, zIndex: 5, width: 42, minHeight: 40, padding: 0, justifyContent: "center", visibility: left === null ? "hidden" : "visible" }}
      >
        <WinLogo />
      </button>

      {menu && (
        <>
          <div aria-hidden onClick={() => setMenu(null)} style={{ position: "absolute", inset: 0, zIndex: 44 }} />
          <div role="dialog" aria-label="Start menu" style={{ position: "absolute", bottom: 58, left: "50%", transform: "translateX(-50%)", zIndex: 45, width: 520, maxWidth: "calc(100% - 24px)", borderRadius: 10, background: "rgba(243,243,243,0.97)", backdropFilter: "blur(20px)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 30px 70px -20px rgba(0,0,0,0.55)", fontFamily: W.font, color: W.ink }}>
            <div style={{ padding: "22px 28px 12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 36, padding: "0 14px", borderRadius: 18, background: "#fff", border: `1px solid ${W.edge}`, color: W.faint, fontSize: 14 }}>⌕ Search for apps, settings and documents</div>
              <p style={{ margin: "20px 0 10px", fontSize: 14, fontWeight: 600 }}>Pinned</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
                {apps.map(([id, label, colour]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      show(id);
                      setMenu(null);
                    }}
                    className="of-row"
                    style={{ minHeight: 76, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, border: "none", borderRadius: 6, background: "transparent", fontFamily: W.font, fontSize: 13, color: W.ink, cursor: "pointer" }}
                  >
                    <span aria-hidden style={{ width: 30, height: 30, borderRadius: 6, background: colour }} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 28px", borderTop: "1px solid rgba(0,0,0,0.08)", background: "rgba(232,232,232,0.9)", borderRadius: "0 0 10px 10px" }}>
              <button type="button" onClick={() => setMenu(menu === "you" ? "start" : "you")} aria-expanded={menu === "you"} className="of-row" style={{ display: "inline-flex", alignItems: "center", gap: 10, minHeight: 42, padding: "0 12px", border: "none", borderRadius: 6, background: "transparent", fontFamily: W.font, fontSize: 14, color: W.ink, cursor: "pointer" }}>
                <span aria-hidden style={{ width: 30, height: 30, borderRadius: 15, background: "#8a4fd8", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13 }}>
                  Y
                </span>
                You
              </button>
              <button type="button" onClick={() => setMenu(menu === "power" ? "start" : "power")} aria-label="Power" aria-expanded={menu === "power"} className="of-row" style={{ width: 42, height: 42, border: "none", borderRadius: 6, background: "transparent", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block" }}>
                  <path d="M12 3 V12 M6.5 6.5 A8 8 0 1 0 17.5 6.5" fill="none" stroke={W.ink} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
              {menu === "you" && (
                <div role="menu" aria-label="Account" style={{ position: "absolute", left: 24, bottom: "calc(100% - 4px)", width: 240, padding: 4, borderRadius: 8, background: "#fff", border: `1px solid ${W.edge}`, boxShadow: W.float }}>
                  <p style={{ margin: 0, padding: "8px 12px 6px", fontSize: 12.5, color: W.muted }}>you@northfieldsupplies.example</p>
                  <MenuItem disabled>Change account settings</MenuItem>
                  <MenuItem onClick={lock}>Lock</MenuItem>
                  <MenuItem disabled>Sign out</MenuItem>
                </div>
              )}
              {menu === "power" && (
                <div role="menu" aria-label="Power" style={{ position: "absolute", right: 24, bottom: "calc(100% - 4px)", width: 250, padding: 4, borderRadius: 8, background: "#fff", border: `1px solid ${W.edge}`, boxShadow: W.float }}>
                  <MenuItem disabled>Sleep</MenuItem>
                  <MenuItem disabled>Shut down</MenuItem>
                  <MenuItem disabled>Restart</MenuItem>
                  <p style={{ margin: 0, padding: "6px 12px 8px", fontSize: 12.5, lineHeight: 1.4, color: W.muted }}>Stepping away? Lock it instead: click You, then Lock. Or press Windows key + L.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {locked && (
        <div
          role="dialog"
          aria-label="Lock screen"
          onClick={() => setSignIn(true)}
          style={{ position: "absolute", inset: 0, zIndex: 46, overflow: "hidden", background: "radial-gradient(120% 90% at 70% 10%, #6f8fc9 0%, #2d4e8c 45%, #13254a 100%)", color: "#fff", fontFamily: W.font, cursor: "default" }}
        >
          <LockArt />
          {!signIn ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: "16%", textAlign: "center", textShadow: "0 2px 18px rgba(0,0,0,0.35)" }}>
              <div style={{ fontSize: 96, fontWeight: 600, lineHeight: 1, letterSpacing: "-0.02em" }}>{time}</div>
              <div style={{ marginTop: 10, fontSize: 24, fontWeight: 500 }}>{longDate(job.clock)}</div>
            </div>
          ) : null}
          {!signIn ? (
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, textAlign: "center", fontSize: 14, opacity: 0.88 }}>Click, or press any key, to sign in</div>
          ) : (
            <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, background: "rgba(10,18,40,0.35)", backdropFilter: "blur(14px)" }}>
              <span aria-hidden style={{ width: 120, height: 120, borderRadius: 60, background: "#8a4fd8", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 44, fontWeight: 700 }}>
                Y
              </span>
              <b style={{ fontSize: 26, fontWeight: 600 }}>You</b>
              <span style={{ fontSize: 14, opacity: 0.85 }}>you@northfieldsupplies.example</span>
              <button
                type="button"
                autoFocus
                onClick={(e) => {
                  e.stopPropagation();
                  setSignIn(false);
                  dispatch({ type: "update", fn: unlockFn });
                }}
                style={{ marginTop: 8, minHeight: 44, padding: "0 30px", border: "1px solid rgba(255,255,255,0.5)", borderRadius: 6, background: "rgba(255,255,255,0.16)", color: "#fff", fontFamily: W.font, fontSize: 16, fontWeight: 600, cursor: "pointer" }}
              >
                Sign in
              </button>
            </div>
          )}
          <span style={{ position: "absolute", right: 22, bottom: 18, fontSize: 13, opacity: 0.85 }}>{time}</span>
        </div>
      )}
    </>
  );
}

function MenuItem({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="menuitem" onClick={onClick} disabled={disabled} className={disabled ? undefined : "of-row"} style={{ width: "100%", minHeight: 40, padding: "6px 12px", textAlign: "left", border: "none", borderRadius: 4, background: "transparent", fontFamily: W.font, fontSize: 14.5, color: disabled ? W.faint : W.ink, cursor: disabled ? "default" : "pointer" }}>
      {children}
    </button>
  );
}

export function WinLogo({ size = 18 }: { size?: number }) {
  const s = size / 2 - 1;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ display: "inline-block" }}>
      <rect x="0" y="0" width={s} height={s} fill="#0f6cbd" />
      <rect x={s + 2} y="0" width={s} height={s} fill="#0f6cbd" />
      <rect x="0" y={s + 2} width={s} height={s} fill="#0f6cbd" />
      <rect x={s + 2} y={s + 2} width={s} height={s} fill="#0f6cbd" />
    </svg>
  );
}

/* Soft hills behind the clock, so it reads as a lock screen at a glance. */
export function LockArt() {
  return (
    <svg viewBox="0 0 1200 600" preserveAspectRatio="xMidYMax slice" aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block" }}>
      <path d="M0 430 C200 370 360 400 520 440 C700 485 860 380 1200 410 V600 H0 Z" fill="rgba(10,25,60,0.45)" />
      <path d="M0 500 C240 450 420 480 640 515 C840 548 980 470 1200 495 V600 H0 Z" fill="rgba(6,14,36,0.6)" />
    </svg>
  );
}

const SECURITY_CSS = `
  @keyframes sec-buzz { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-3px) rotate(-1deg); } 40% { transform: translateX(3px) rotate(1deg); } 60% { transform: translateX(-2px); } 80% { transform: translateX(2px); } }
  .sec-buzz { animation: sec-buzz .5s ease-in-out 3; }
  @media (prefers-reduced-motion: reduce) { .sec-buzz { animation: none; } }
`;
