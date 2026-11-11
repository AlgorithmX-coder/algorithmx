"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { W } from "../../tokens";
import type { CourierBooking } from "../types";
import type { OfficeAppProps } from "./registry";
import { HOPWELL, HOPWELL_HOST, HopwellMark, HopwellSite } from "./courier";

/* Microsoft Edge, for the office jobs (Module 10): tabs, back and forward,
 * an address bar you can type in, and a Favourites bar. The web is not
 * real: the one site it reaches is Hopwell Couriers (./courier), and any
 * other address shows Edge's own "can't reach this page", so nothing ever
 * leaves the page. A booking made on the site is written to the office
 * record, where the job's checks read it. */

export const EDGE_COLOUR = "#0f7fbf";
const NEW_TAB = "edge://newtab";

interface BrowserTab {
  id: number;
  stack: string[];
  at: number;
}

/* Turn whatever was typed into an address the pretend web understands. */
export function resolve(input: string): string {
  const t = input.trim();
  if (!t) return NEW_TAB;
  if (/^edge:\/\//i.test(t)) return NEW_TAB;
  const bare = t.replace(/^https?:\/\//i, "").replace(/^www\./i, "");
  if (/^hopwell/i.test(bare) || /hopwell/i.test(t)) {
    const slash = bare.indexOf("/");
    const path = /^hopwellcouriers\.example/i.test(bare) && slash > 0 ? bare.slice(slash) : "/";
    return `${HOPWELL}${path}`;
  }
  if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(bare)) return `https://${bare}`;
  return `search:${t}`;
}

const hostOf = (url: string) => (/^https?:\/\/([^/]+)/i.exec(url)?.[1] ?? "").toLowerCase();
const pathOf = (url: string) => url.replace(/^https?:\/\/[^/]+/i, "") || "/";

function titleOf(url: string): string {
  if (url === NEW_TAB) return "New tab";
  if (url.startsWith("search:")) return url.slice(7);
  if (hostOf(url) === HOPWELL_HOST) {
    const p = pathOf(url);
    if (p.startsWith("/book")) return p === "/book" ? "Book a collection | Hopwell" : "Booking confirmed | Hopwell";
    if (p.startsWith("/account")) return "My bookings | Hopwell";
    return "Hopwell Couriers";
  }
  return hostOf(url) || url;
}

/* The browser itself, used by the office's Edge window and by a lesson,
 * each with its own bookings. */
export function Browser({ bookings, onBook, onCancel, now, start = NEW_TAB }: { bookings: CourierBooking[]; onBook: (b: CourierBooking) => void; onCancel: (ref: string) => void; now: string; start?: string }) {
  const [tabs, setTabs] = useState<BrowserTab[]>([{ id: 1, stack: [start], at: 0 }]);
  const [active, setActive] = useState(1);
  const [typing, setTyping] = useState<string | null>(null);
  const tab = tabs.find((t) => t.id === active) ?? tabs[0];
  const url = tab.stack[tab.at];
  /* a new page opens at its top, as in a real browser */
  const pageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (pageRef.current) pageRef.current.scrollTop = 0;
  }, [url, active]);

  const navigate = (to: string) => {
    setTyping(null);
    setTabs((ts) => ts.map((t) => (t.id === tab.id ? { ...t, stack: [...t.stack.slice(0, t.at + 1), to], at: t.at + 1 } : t)));
  };
  const step = (d: number) => setTabs((ts) => ts.map((t) => (t.id === tab.id ? { ...t, at: Math.max(0, Math.min(t.stack.length - 1, t.at + d)) } : t)));
  const newTab = () => {
    const id = Math.max(...tabs.map((t) => t.id)) + 1;
    setTabs([...tabs, { id, stack: [NEW_TAB], at: 0 }]);
    setActive(id);
    setTyping("");
  };
  const closeTab = (id: number) => {
    if (tabs.length === 1) {
      setTabs([{ id: id + 1, stack: [NEW_TAB], at: 0 }]);
      setActive(id + 1);
      return;
    }
    const i = tabs.findIndex((t) => t.id === id);
    const rest = tabs.filter((t) => t.id !== id);
    setTabs(rest);
    if (id === active) setActive(rest[Math.max(0, i - 1)].id);
  };
  const go = (path: string) => navigate(`${HOPWELL}${path}`);
  const key = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") navigate(resolve(e.currentTarget.value));
    if (e.key === "Escape") setTyping(null);
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      {/* the tab strip */}
      <div role="tablist" aria-label="Edge tabs" style={{ display: "flex", alignItems: "flex-end", gap: 2, padding: "6px 8px 0", background: "#e9e9eb", minHeight: 42, flexShrink: 0, overflowX: "auto" }}>
        <span aria-hidden title="Microsoft Edge" style={{ alignSelf: "center", margin: "0 8px 4px 2px", display: "inline-flex" }}>
          <EdgeLogo />
        </span>
        {tabs.map((t) => {
          const u = t.stack[t.at];
          const on = t.id === tab.id;
          return (
            <div key={t.id} role="tab" aria-selected={on} style={{ display: "flex", alignItems: "center", gap: 6, width: 220, minWidth: 120, minHeight: 36, padding: "0 4px 0 12px", borderRadius: "8px 8px 0 0", background: on ? W.page : "transparent", boxShadow: on ? "0 -1px 3px rgba(0,0,0,0.08)" : "none" }}>
              <button type="button" onClick={() => setActive(t.id)} style={{ flex: 1, minWidth: 0, minHeight: 34, display: "flex", alignItems: "center", gap: 8, border: "none", background: "transparent", padding: 0, fontFamily: W.font, fontSize: 13.5, color: W.ink, cursor: "pointer", textAlign: "left" }}>
                <Favicon url={u} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titleOf(u)}</span>
              </button>
              <button type="button" aria-label={`Close tab ${titleOf(u)}`} onClick={() => closeTab(t.id)} className="of-btn" style={{ width: 28, height: 28, border: "none", borderRadius: 6, background: "transparent", color: W.muted, cursor: "pointer", fontSize: 12 }}>
                ✕
              </button>
            </div>
          );
        })}
        <button type="button" aria-label="New tab" onClick={newTab} className="of-btn" style={{ alignSelf: "center", width: 34, height: 34, marginBottom: 2, border: "none", borderRadius: 6, background: "transparent", fontSize: 20, color: W.body, cursor: "pointer" }}>
          +
        </button>
      </div>

      {/* back, forward, refresh and the address bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderBottom: `1px solid ${W.edge}`, flexShrink: 0 }}>
        <NavButton label="Back" disabled={tab.at === 0} onClick={() => step(-1)}>
          ←
        </NavButton>
        <NavButton label="Forward" disabled={tab.at >= tab.stack.length - 1} onClick={() => step(1)}>
          →
        </NavButton>
        <NavButton label="Refresh" onClick={() => setTabs((ts) => ts.map((t) => ({ ...t })))}>
          ⟳
        </NavButton>
        <label style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 8, minHeight: 36, padding: "0 14px", borderRadius: 18, background: "#f1f1f3", border: typing !== null ? `2px solid ${EDGE_COLOUR}` : "2px solid transparent" }}>
          {url.startsWith("https://") ? <Padlock /> : <span aria-hidden style={{ color: W.muted, fontSize: 14 }}>⌕</span>}
          <input
            aria-label="Address and search bar"
            value={typing ?? (url === NEW_TAB ? "" : url.startsWith("search:") ? url.slice(7) : url)}
            placeholder="Search or enter web address"
            onFocus={(e) => {
              setTyping(url === NEW_TAB ? "" : url.startsWith("search:") ? url.slice(7) : url);
              e.currentTarget.select();
            }}
            onChange={(e) => setTyping(e.target.value)}
            onBlur={() => setTyping(null)}
            onKeyDown={key}
            style={{ flex: 1, minWidth: 0, border: "none", outline: "none", background: "transparent", fontFamily: W.font, fontSize: 14.5, color: W.ink }}
          />
          <span aria-hidden title="Add this page to favourites" style={{ color: W.muted, fontSize: 16 }}>
            ☆
          </span>
        </label>
        <NavButton label="Settings and more">⋯</NavButton>
      </div>

      {/* the Favourites bar */}
      <nav aria-label="Favourites bar" style={{ display: "flex", alignItems: "center", gap: 2, padding: "3px 10px", borderBottom: `1px solid ${W.edge}`, flexShrink: 0, overflowX: "auto" }}>
        {[
          ["Hopwell Couriers", `${HOPWELL}/`],
          ["Hopwell: My bookings", `${HOPWELL}/account/bookings`],
        ].map(([name, to]) => (
          <button key={name} type="button" onClick={() => navigate(to)} className="of-row" style={{ display: "inline-flex", alignItems: "center", gap: 7, minHeight: 32, padding: "0 10px", border: "none", borderRadius: 6, background: "transparent", fontFamily: W.font, fontSize: 13.5, color: W.ink, whiteSpace: "nowrap" }}>
            <HopwellMark size={16} />
            {name}
          </button>
        ))}
      </nav>

      {/* the page */}
      <div ref={pageRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", background: W.page }}>
        {url === NEW_TAB ? (
          <NewTabPage onGo={navigate} />
        ) : hostOf(url) === HOPWELL_HOST ? (
          <HopwellSite path={pathOf(url)} go={go} bookings={bookings} onBook={onBook} onCancel={onCancel} now={now} />
        ) : (
          <CantReach url={url} />
        )}
      </div>
    </div>
  );
}

function NavButton({ label, children, onClick, disabled }: { label: string; children: string; onClick?: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="of-btn" style={{ width: 36, height: 36, border: "none", borderRadius: 6, background: "transparent", fontSize: 18, color: disabled ? W.faint : W.body, cursor: disabled ? "default" : "pointer", flexShrink: 0 }}>
      {children}
    </button>
  );
}

export function Padlock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-label="Secure connection" style={{ display: "inline-block", flexShrink: 0 }}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" fill={W.body} />
      <path d="M8 10.5 V8 a4 4 0 0 1 8 0 V10.5" fill="none" stroke={W.body} strokeWidth="2.2" />
    </svg>
  );
}

export function EdgeLogo({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block" }}>
      <defs>
        <linearGradient id="edge-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#35c1f1" />
          <stop offset="0.55" stopColor="#1a8fd8" />
          <stop offset="1" stopColor="#36b37e" />
        </linearGradient>
      </defs>
      <path d="M12 2 C 18 2, 22 6.5, 22 11.5 C 22 14.5, 19.5 16.2, 16.6 16.2 C 13.8 16.2, 12 14.8, 12 13.2 H 21 C 21 8, 17 4.5, 12 4.5 C 7.5 4.5, 3.6 7.6, 2.6 11.6 C 3.2 6.2, 7.2 2, 12 2 Z" fill="url(#edge-g)" />
      <path d="M2.6 11.6 C 2.2 17.4, 6.6 22, 12.2 22 C 15.8 22, 18.6 20.4, 20.2 18 C 17.6 19.4, 14 19.2, 11.6 17.4 C 9 15.4, 8.6 11.8, 10.8 9.6 C 7 9.4, 3.6 10.2, 2.6 11.6 Z" fill="#1167b1" />
    </svg>
  );
}

function Favicon({ url }: { url: string }) {
  if (hostOf(url) === HOPWELL_HOST) return <HopwellMark size={16} />;
  return <EdgeLogo size={16} />;
}

function NewTabPage({ onGo }: { onGo: (url: string) => void }) {
  const [q, setQ] = useState("");
  return (
    <div style={{ minHeight: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: "56px 20px", background: "linear-gradient(180deg, #f5f8fc, #eef3f9)" }}>
      <EdgeLogo size={44} />
      <input
        aria-label="Search the web"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onGo(resolve(q))}
        placeholder="Search or enter web address"
        style={{ marginTop: 22, width: "min(560px, 100%)", minHeight: 48, padding: "0 20px", borderRadius: 24, border: `1px solid ${W.edge}`, boxShadow: "0 2px 10px rgba(0,0,0,0.06)", fontFamily: W.font, fontSize: 16, color: W.ink, background: W.page }}
      />
      <div style={{ display: "flex", gap: 14, marginTop: 28, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          ["Hopwell Couriers", `${HOPWELL}/`],
          ["My bookings", `${HOPWELL}/account/bookings`],
        ].map(([name, to]) => (
          <button key={name} type="button" onClick={() => onGo(to)} className="of-btn" style={{ width: 120, minHeight: 104, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, border: "none", borderRadius: 12, background: W.page, boxShadow: "0 2px 10px rgba(0,0,0,0.07)", fontFamily: W.font, fontSize: 13.5, color: W.ink, cursor: "pointer" }}>
            <HopwellMark size={34} />
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function CantReach({ url }: { url: string }) {
  const search = url.startsWith("search:");
  return (
    <div style={{ padding: "60px 40px", maxWidth: 620 }}>
      <svg width="64" height="64" viewBox="0 0 64 64" aria-hidden style={{ display: "block" }}>
        <circle cx="32" cy="32" r="28" fill="none" stroke={W.faint} strokeWidth="3" />
        <circle cx="23" cy="26" r="3" fill={W.faint} />
        <circle cx="41" cy="26" r="3" fill={W.faint} />
        <path d="M21 45 C 26 39, 38 39, 43 45" fill="none" stroke={W.faint} strokeWidth="3" strokeLinecap="round" />
      </svg>
      <h1 style={{ margin: "20px 0 0", fontSize: 26, fontWeight: 600 }}>{search ? "Search isn't on in this office" : "Hmm… can't reach this page"}</h1>
      <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.55, color: W.body }}>
        {search ? (
          <>Type the full web address of the site you want, or pick it from the Favourites bar under the address bar.</>
        ) : (
          <>
            Check the spelling of <b>{hostOf(url) || url}</b>. In this practice office only the sites on the Favourites bar open.
          </>
        )}
      </p>
    </div>
  );
}

/* The office's Edge window: the browser, wired to the office record. */
export default function Edge({ state, dispatch, job }: OfficeAppProps) {
  const bookings = state.courier?.bookings ?? [];
  return (
    <Browser
      bookings={bookings}
      now={job.clock}
      onBook={(b) => dispatch({ type: "update", fn: (s) => ({ ...s, courier: { bookings: [...(s.courier?.bookings ?? []), b] } }) })}
      onCancel={(ref) => dispatch({ type: "update", fn: (s) => ({ ...s, courier: { bookings: (s.courier?.bookings ?? []).map((b) => (b.ref === ref ? { ...b, status: "cancelled" } : b)) } }) })}
    />
  );
}
