"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { W } from "../../tokens";
import { accessFor, COMPANY, DIRECTORY, isColleague, keepLink, linkSentence, makeLink, removeGrant, removeLink, SCOPE_LABEL, setGrant, shareWith, SITE_MEMBERS } from "../files";
import { CONTACTS, YOU } from "../northfield";
import type { Action } from "../store";
import type { OfficeFile, OfficeState, Person, ShareLink, ShareRole } from "../types";
import { AppButton, FileGlyph } from "../ui";

/* ── Module 9: Files and sharing ──────────────────────────────────────────
 * The Share box, the way OneDrive and SharePoint show it (criteria SP-5,
 * SP-6). Three ways to let someone in, as the real one has:
 *   - Send: add people by name, pick Can edit or Can view, and they get an
 *     email with a link that works only for them;
 *   - Copy link: a link to paste anywhere, with link settings saying who it
 *     works for (anyone, everyone at Northfield, or specific people);
 *   - Manage access: everyone who can open it now, to change or remove.
 * Everything lands in the office record (the file's access and links, and
 * the email in Sent items), where the job's checks read it. */

type View = "share" | "settings" | "copied" | "access";

const ROLE_LABEL: Record<ShareRole, string> = { edit: "Can edit", view: "Can view" };
const initials = (n: string) =>
  n
    .split(/[\s.@]+/)
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase())
    .join("")
    .slice(0, 2);

export function Avatar({ name, outside, size = 32 }: { name: string; outside?: boolean; size?: number }) {
  return (
    <span aria-hidden style={{ width: size, height: size, borderRadius: "50%", background: outside ? "#8a3c00" : name === "You" ? "#8a4fd8" : "#0f6cbd", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 700, flexShrink: 0 }}>
      {initials(name)}
    </span>
  );
}

/* A small drawn icon, so the box needs no image files. */
export const ShareIcon = {
  link: (size = 18, colour = "currentColor") => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M10 14 L14 10 M8.5 11.5 L6.6 13.4 A3.6 3.6 0 0 0 11.7 18.5 L13.6 16.6 M15.5 12.5 L17.4 10.6 A3.6 3.6 0 0 0 12.3 5.5 L10.4 7.4" fill="none" stroke={colour} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  ),
  gear: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M12 2.8 V5.2 M12 18.8 V21.2 M2.8 12 H5.2 M18.8 12 H21.2 M5.5 5.5 L7.2 7.2 M16.8 16.8 L18.5 18.5 M5.5 18.5 L7.2 16.8 M16.8 7.2 L18.5 5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  ),
  pencil: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M4 20 L5 15.5 L15.5 5 A2.1 2.1 0 0 1 18.5 8 L8 18.5 Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  ),
  eye: (size = 16) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M2.5 12 C5 7.5 8.3 5.5 12 5.5 C15.7 5.5 19 7.5 21.5 12 C19 16.5 15.7 18.5 12 18.5 C8.3 18.5 5 16.5 2.5 12 Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  ),
  globe: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3 12 H21 M12 3 C9 6 9 18 12 21 C15 18 15 6 12 3" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  building: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <path d="M4 21 V4 H14 V21 M14 9 H20 V21 M2.5 21 H21.5 M7 8 H11 M7 12 H11 M7 16 H11 M16.5 13 H17.5 M16.5 17 H17.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
  people: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <circle cx="9" cy="8" r="3.4" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M2.8 19.5 C3.4 15.6 5.9 13.6 9 13.6 C12.1 13.6 14.6 15.6 15.2 19.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="16.6" cy="9" r="2.7" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17.2 13.9 C19.4 14.2 20.9 15.9 21.3 18.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  lock: (size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden style={{ display: "inline-block", flexShrink: 0 }}>
      <rect x="5" y="10.5" width="14" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 10.5 V7.5 A4 4 0 0 1 16 7.5 V10.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
};

export const scopeIcon = (scope: ShareLink["scope"], size = 18) => (scope === "anyone" ? ShareIcon.globe(size) : scope === "org" ? ShareIcon.building(size) : scope === "people" ? ShareIcon.people(size) : ShareIcon.lock(size));

const box: CSSProperties = { minHeight: 42, padding: "6px 10px", border: `1px solid ${W.faint}`, borderRadius: 4, fontFamily: W.font, fontSize: 15, color: W.ink, background: W.page, boxSizing: "border-box" };

/* Can edit / Can view, as a pick list with its pencil or eye. */
function RolePick({ role, onChange, label }: { role: ShareRole; onChange: (r: ShareRole) => void; label: string }) {
  return (
    <span style={{ position: "relative", display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
      <span style={{ position: "absolute", left: 10, color: W.ink, pointerEvents: "none", display: "inline-flex" }}>{role === "edit" ? ShareIcon.pencil() : ShareIcon.eye()}</span>
      <select aria-label={label} value={role} onChange={(e) => onChange(e.target.value as ShareRole)} style={{ ...box, paddingLeft: 32, minWidth: 128, cursor: "pointer" }}>
        <option value="edit">Can edit</option>
        <option value="view">Can view</option>
      </select>
    </span>
  );
}

/* The people box: chips for who is added, and the directory as you type.
 * Someone outside Northfield can be added by typing their whole address. */
function PeoplePicker({ people, onChange, placeholder, label }: { people: Person[]; onChange: (p: Person[]) => void; placeholder: string; label: string }) {
  const [text, setText] = useState("");
  const q = text.trim().toLowerCase();
  const pool = [...DIRECTORY, ...CONTACTS.filter((c) => !DIRECTORY.some((d) => d.address === c.address) && !isColleague(c))];
  const matches = q ? pool.filter((p) => p.address !== YOU.address && !people.some((x) => x.address === p.address) && (p.name.toLowerCase().includes(q) || p.address.includes(q))).slice(0, 6) : [];
  const typedAddress = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(text.trim()) && !matches.some((m) => m.address === q) && !people.some((p) => p.address === q);
  const add = (p: Person) => {
    onChange([...people, p]);
    setText("");
  };
  return (
    <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
      <div style={{ ...box, display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, padding: "4px 8px" }}>
        {people.map((p) => (
          <span key={p.address} title={p.address} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 4px 2px 3px", borderRadius: 16, background: isColleague(p) ? W.select : "#fde7d9", fontSize: 14 }}>
            <Avatar name={p.name} outside={!isColleague(p)} size={22} />
            {p.name}
            <button type="button" aria-label={`Remove ${p.name}`} onClick={() => onChange(people.filter((x) => x.address !== p.address))} style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", color: W.muted, fontSize: 12 }}>
              ✕
            </button>
          </span>
        ))}
        <input
          aria-label={label}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              if (matches[0]) add(matches[0]);
              else if (typedAddress) add({ name: text.trim(), address: text.trim().toLowerCase() });
            } else if (e.key === "Backspace" && !text && people.length) onChange(people.slice(0, -1));
          }}
          placeholder={people.length ? "" : placeholder}
          style={{ flex: 1, minWidth: 150, minHeight: 32, border: "none", outline: "none", fontFamily: W.font, fontSize: 15, color: W.ink, background: "transparent" }}
        />
      </div>
      {(matches.length > 0 || typedAddress) && (
        <div role="listbox" aria-label="Suggestions" style={{ position: "absolute", left: 0, right: 0, top: "100%", zIndex: 5, marginTop: 2, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 6, boxShadow: "0 12px 30px -10px rgba(0,0,0,0.35)", padding: 4 }}>
          {matches.map((p) => (
            <button key={p.address} type="button" role="option" aria-selected={false} className="of-row" onClick={() => add(p)} style={suggestion}>
              <Avatar name={p.name} outside={!isColleague(p)} />
              <span style={{ minWidth: 0 }}>
                <b style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{p.name}</b>
                <span style={{ fontSize: 13, color: W.muted }}>{p.address}</span>
              </span>
              {!isColleague(p) && <span style={{ marginLeft: "auto", fontSize: 12.5, color: "#8a3c00", fontWeight: 600 }}>Outside {COMPANY}</span>}
            </button>
          ))}
          {typedAddress && (
            <button type="button" role="option" aria-selected={false} className="of-row" onClick={() => add({ name: text.trim(), address: text.trim().toLowerCase() })} style={suggestion}>
              <Avatar name={text.trim()} outside />
              <span>
                Add <b>{text.trim()}</b>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const suggestion: CSSProperties = { width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 48, textAlign: "left", padding: "6px 10px", border: "none", background: "transparent", borderRadius: 4, fontFamily: W.font, color: W.ink, cursor: "pointer" };

/* The box itself. It sits over the office screen like a real dialog. */
export function ShareDialog({ state, fileId, dispatch, onClose, start = "share" }: { state: OfficeState; fileId: string; dispatch: (a: Action) => void; onClose: () => void; start?: "share" | "copy" | "access" }) {
  const file = state.files.find((f) => f.id === fileId);
  const [view, setView] = useState<View>(start === "access" ? "access" : start === "copy" && file ? "copied" : "share");
  const [people, setPeople] = useState<Person[]>([]);
  const [role, setRole] = useState<ShareRole>("edit");
  const [message, setMessage] = useState("");
  /* the Copy link settings: People in Northfield, can edit, until changed */
  const [linkScope, setLinkScope] = useState<ShareLink["scope"]>("org");
  const [linkRole, setLinkRole] = useState<ShareRole>("edit");
  const [linkPeople, setLinkPeople] = useState<Person[]>([]);
  const [draft, setDraft] = useState<{ scope: ShareLink["scope"]; role: ShareRole; people: Person[] }>({ scope: "org", role: "edit", people: [] });
  /* Copy link on the command bar copies straight away, with the settings
   * every new link starts with, and shows them so they can be changed. */
  const [copied, setCopied] = useState<ShareLink | null>(() => (start === "copy" && file ? makeLink(state, fileId, "org", "edit").link : null));
  const [sent, setSent] = useState<string | null>(null);
  const first = useRef(copied);
  useEffect(() => {
    const link = first.current;
    if (!link) return;
    first.current = null;
    dispatch({ type: "update", fn: (s) => keepLink(s, fileId, link) });
    try {
      void navigator.clipboard?.writeText(link.url).catch(() => {});
    } catch {
      /* no clipboard: the link is shown to copy by hand */
    }
  }, [dispatch, fileId]);

  if (!file) return null;
  const outside = people.filter((p) => !isColleague(p));

  const copy = (scope = linkScope, r = linkRole, who = linkPeople) => {
    if (scope === "people" && who.length === 0) {
      setDraft({ scope, role: r, people: who });
      setView("settings");
      return;
    }
    /* made here, so the link shown is the very one the file keeps */
    const { link } = makeLink(state, file.id, scope, r, who);
    if (link) {
      dispatch({ type: "update", fn: (s) => keepLink(s, file.id, link) });
      try {
        void navigator.clipboard?.writeText(link.url).catch(() => {});
      } catch {
        /* no clipboard: the link is shown to copy by hand */
      }
      setCopied(link);
      setView("copied");
    }
  };

  const send = () => {
    if (!people.length) return;
    dispatch({ type: "update", fn: (s) => shareWith(s, file.id, people, role, message) });
    setSent(`Sent to ${people.map((p) => p.name).join(", ")}. They can ${role === "edit" ? "edit" : "view"} it.`);
    setPeople([]);
    setMessage("");
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`Share ${file.name}`} style={{ position: "absolute", inset: 0, zIndex: 45, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(10,14,26,0.45)" }}>
      <div style={{ width: "100%", maxWidth: 560, maxHeight: "100%", overflow: "auto", background: W.page, borderRadius: 10, boxShadow: "0 30px 80px -20px rgba(0,0,0,0.6)", fontFamily: W.font, color: W.ink }}>
        {view === "share" && (
          <>
            <Head
              title={
                <>
                  Share &ldquo;{file.name}&rdquo;
                </>
              }
              onClose={onClose}
              extra={
                <button type="button" onClick={() => setView("access")} title="Manage access" aria-label="Manage access" className="of-btn" style={iconBtn}>
                  {ShareIcon.people(20)}
                </button>
              }
            />
            <div style={{ padding: "16px 18px 6px" }}>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <PeoplePicker people={people} onChange={setPeople} placeholder="Add a name, group or email" label="Add a name, group or email" />
                <RolePick role={role} onChange={setRole} label="What the people you add can do" />
              </div>
              <textarea aria-label="Add a message" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Add a message (optional)" rows={2} style={{ ...box, width: "100%", marginTop: 10, resize: "vertical", lineHeight: 1.45 }} />
              {outside.length > 0 && (
                <p role="alert" style={{ margin: "10px 0 0", padding: "10px 12px", borderRadius: 6, background: "#fff4ce", fontSize: 14.5, lineHeight: 1.45 }}>
                  <b>{outside.map((p) => p.name).join(", ")}</b> {outside.length === 1 ? "is" : "are"} outside {COMPANY}. They will be able to {role === "edit" ? "change" : "open"} this whole file.
                </p>
              )}
              {sent && (
                <p role="status" style={{ margin: "10px 0 0", padding: "10px 12px", borderRadius: 6, background: "#dff6dd", fontSize: 14.5, lineHeight: 1.45 }}>
                  ✓ {sent}
                </p>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
                <AppButton primary onClick={send} disabled={!people.length}>
                  Send
                </AppButton>
              </div>
            </div>
            <div style={{ borderTop: `1px solid ${W.edge}`, padding: "14px 18px 18px" }}>
              <b style={{ fontSize: 15, fontWeight: 600 }}>Copy link</b>
              <div style={{ display: "flex", gap: 8, alignItems: "stretch", marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => {
                    setDraft({ scope: linkScope, role: linkRole, people: linkPeople });
                    setView("settings");
                  }}
                  className="of-btn"
                  title="Link settings"
                  style={{ ...box, flex: 1, minWidth: 0, display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer", borderColor: W.edge, background: W.chrome }}
                >
                  <span style={{ color: W.muted, display: "inline-flex" }}>{scopeIcon(linkScope)}</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 14.5 }}>{linkSentence(linkScope, linkRole, linkPeople)}</span>
                  <span style={{ color: W.muted, display: "inline-flex" }}>{ShareIcon.gear()}</span>
                </button>
                <AppButton onClick={() => copy()}>Copy</AppButton>
              </div>
            </div>
          </>
        )}

        {view === "settings" && (
          <>
            <Head title="Link settings" onBack={() => setView(copied ? "copied" : "share")} onClose={onClose} />
            <div style={{ padding: "14px 18px 18px" }}>
              <p style={{ margin: 0, fontSize: 14.5, color: W.muted }}>Share the link with</p>
              <div role="radiogroup" aria-label="Share the link with" style={{ display: "grid", gap: 6, marginTop: 8 }}>
                {(
                  [
                    ["anyone", "Anyone with the link, even people outside Northfield. Nobody has to sign in."],
                    ["org", `Anyone at ${COMPANY} who has the link.`],
                    ["existing", "Only people who can already open it. Handy for reminding someone where it is."],
                    ["people", "Only the people you name here."],
                  ] as const
                ).map(([scope, sub]) => {
                  const on = draft.scope === scope;
                  return (
                    <button key={scope} type="button" role="radio" aria-checked={on} onClick={() => setDraft({ ...draft, scope })} className="of-row" style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 54, padding: "8px 12px", border: `1px solid ${on ? W.outlook : W.edge}`, borderRadius: 6, background: on ? W.select : W.page, textAlign: "left", fontFamily: W.font, color: W.ink, cursor: "pointer" }}>
                      <span style={{ display: "inline-flex", color: on ? W.outlook : W.muted }}>{scopeIcon(scope, 22)}</span>
                      <span>
                        <b style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{SCOPE_LABEL[scope]}</b>
                        <span style={{ fontSize: 13.5, color: W.muted }}>{sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
              {draft.scope === "people" && (
                <div style={{ marginTop: 12 }}>
                  <PeoplePicker people={draft.people} onChange={(p) => setDraft({ ...draft, people: p })} placeholder="Add the people this link is for" label="Who the link is for" />
                </div>
              )}
              {draft.scope !== "existing" && (
                <>
                  <p style={{ margin: "16px 0 0", fontSize: 14.5, color: W.muted }}>More settings</p>
                  <div style={{ marginTop: 8 }}>
                    <RolePick role={draft.role} onChange={(r) => setDraft({ ...draft, role: r })} label="What people with the link can do" />
                  </div>
                </>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
                <AppButton onClick={() => setView(copied ? "copied" : "share")}>Cancel</AppButton>
                <AppButton
                  primary
                  disabled={draft.scope === "people" && draft.people.length === 0}
                  onClick={() => {
                    setLinkScope(draft.scope);
                    setLinkRole(draft.role);
                    setLinkPeople(draft.people);
                    if (copied) copy(draft.scope, draft.role, draft.people);
                    else setView("share");
                  }}
                >
                  Apply
                </AppButton>
              </div>
            </div>
          </>
        )}

        {view === "copied" && copied && (
          <>
            <Head title="Link copied" onClose={onClose} onBack={() => setView("share")} />
            <div style={{ padding: "16px 18px 18px" }}>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>The link is copied. Paste it into an email or a chat with <b>Ctrl+V</b>.</p>
              <input readOnly aria-label="The link" value={copied.url} onFocus={(e) => e.currentTarget.select()} style={{ ...box, width: "100%", marginTop: 12, fontSize: 14, color: W.outlook }} />
              <button
                type="button"
                onClick={() => {
                  setDraft({ scope: copied.scope, role: copied.role, people: copied.people });
                  setView("settings");
                }}
                className="of-btn"
                style={{ ...box, width: "100%", marginTop: 10, display: "flex", alignItems: "center", gap: 10, textAlign: "left", cursor: "pointer", borderColor: W.edge, background: W.chrome }}
              >
                <span style={{ color: W.muted, display: "inline-flex" }}>{scopeIcon(copied.scope)}</span>
                <span style={{ flex: 1, fontSize: 14.5 }}>{linkSentence(copied.scope, copied.role, copied.people)}</span>
                <span style={{ color: W.muted, display: "inline-flex" }}>{ShareIcon.gear()}</span>
              </button>
              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
                <AppButton primary onClick={onClose}>
                  Done
                </AppButton>
              </div>
            </div>
          </>
        )}

        {view === "access" && <ManageAccess state={state} file={file} dispatch={dispatch} onBack={() => setView("share")} onClose={onClose} />}
      </div>
    </div>
  );
}

const iconBtn: CSSProperties = { width: 40, height: 40, border: "none", background: "transparent", cursor: "pointer", color: W.muted, borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center" };

function Head({ title, onClose, onBack, extra }: { title: ReactNode; onClose: () => void; onBack?: () => void; extra?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 10px 10px 16px", borderBottom: `1px solid ${W.edge}` }}>
      {onBack && (
        <button type="button" onClick={onBack} aria-label="Back" className="of-btn" style={{ ...iconBtn, fontSize: 19, marginLeft: -8 }}>
          ←
        </button>
      )}
      <b style={{ flex: 1, minWidth: 0, fontSize: 17, fontWeight: 600, overflowWrap: "anywhere" }}>{title}</b>
      {extra}
      <button type="button" onClick={onClose} aria-label="Close" className="of-btn" style={{ ...iconBtn, fontSize: 18 }}>
        ✕
      </button>
    </div>
  );
}

/* Manage access: who can open it now, and the links that let people in. */
function ManageAccess({ state, file, dispatch, onBack, onClose }: { state: OfficeState; file: OfficeFile; dispatch: (a: Action) => void; onBack: () => void; onClose: () => void }) {
  const site = file.path[0];
  const members = site === "OneDrive" ? [] : SITE_MEMBERS[site] ?? [];
  const grants = file.access ?? [];
  const links = file.shareLinks ?? [];
  void state;
  return (
    <>
      <Head title="Manage access" onBack={onBack} onClose={onClose} />
      <div style={{ padding: "12px 18px 18px" }}>
        <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, color: W.muted }}>
          <FileGlyph kind={file.kind} size={18} /> {file.name}
        </p>
        <h3 style={sectionHead}>People</h3>
        <ul style={list}>
          {site === "OneDrive" ? (
            <li style={row}>
              <Avatar name="You" />
              <span style={{ flex: 1 }}>
                <b style={nameStyle}>You</b>
                <span style={subStyle}>Owner. It&apos;s in your OneDrive, so only you, until you share it.</span>
              </span>
            </li>
          ) : (
            <li style={row}>
              <span aria-hidden style={{ width: 32, height: 32, borderRadius: 6, background: "#03787c", color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                {site
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)}
              </span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={nameStyle}>{site} members</b>
                <span style={subStyle}>{members.map((m) => (m.address === YOU.address ? "You" : m.name)).join(", ")}. Everyone on the site.</span>
              </span>
              <span style={{ fontSize: 14, color: W.muted, whiteSpace: "nowrap" }}>Can edit</span>
            </li>
          )}
          {grants.map((g) => (
            <li key={g.person.address} style={row}>
              <Avatar name={g.person.name} outside={!isColleague(g.person)} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <b style={nameStyle}>{g.person.name}</b>
                <span style={subStyle}>
                  {g.person.address}
                  {!isColleague(g.person) && <b style={{ color: "#8a3c00", fontWeight: 600 }}> · Outside {COMPANY}</b>}
                </span>
              </span>
              <RolePick role={g.role} onChange={(r) => dispatch({ type: "update", fn: (s) => setGrant(s, file.id, g.person, r) })} label={`What ${g.person.name} can do`} />
              <AppButton onClick={() => dispatch({ type: "update", fn: (s) => removeGrant(s, file.id, g.person) })} title={`Stop sharing with ${g.person.name}`}>
                Remove
              </AppButton>
            </li>
          ))}
        </ul>
        <h3 style={sectionHead}>Links giving access</h3>
        {links.length === 0 ? (
          <p style={{ margin: "6px 0 0", fontSize: 14.5, color: W.muted }}>No links yet. Copy link makes one.</p>
        ) : (
          <ul style={list}>
            {links.map((l) => (
              <li key={l.id} style={row}>
                <span style={{ width: 32, height: 32, borderRadius: "50%", background: l.scope === "anyone" ? "#fde7e9" : W.select, color: l.scope === "anyone" ? "#c4314b" : W.outlook, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{scopeIcon(l.scope)}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <b style={nameStyle}>{linkSentence(l.scope, l.role, l.people)}</b>
                  <span style={{ ...subStyle, color: W.outlook }}>{l.url}</span>
                </span>
                <AppButton onClick={() => dispatch({ type: "update", fn: (s) => removeLink(s, file.id, l.id) })} title="Delete this link: it stops working for everyone">
                  Delete link
                </AppButton>
              </li>
            ))}
          </ul>
        )}
        <p style={{ margin: "14px 0 0", fontSize: 13.5, color: W.muted, lineHeight: 1.5 }}>
          Who can open it now:{" "}
          {[...DIRECTORY, ...grants.map((g) => g.person).filter((p) => !isColleague(p))]
            .filter((p) => accessFor(file, p))
            .map((p) => `${p.name} (${ROLE_LABEL[accessFor(file, p) as ShareRole].toLowerCase()})`)
            .join(", ") || "only you"}
          {links.some((l) => l.scope === "anyone") ? ", and anyone who gets the link" : links.some((l) => l.scope === "org") ? `, and anyone at ${COMPANY} who gets the link` : ""}.
        </p>
      </div>
    </>
  );
}

const sectionHead: CSSProperties = { margin: "16px 0 0", fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: W.muted };
const list: CSSProperties = { listStyle: "none", margin: "6px 0 0", padding: 0, display: "grid", gap: 4 };
const row: CSSProperties = { display: "flex", alignItems: "center", gap: 10, minHeight: 52, padding: "6px 0", borderBottom: `1px solid ${W.edge}`, flexWrap: "wrap" };
const nameStyle: CSSProperties = { display: "block", fontSize: 15, fontWeight: 600 };
const subStyle: CSSProperties = { display: "block", fontSize: 13, color: W.muted, overflowWrap: "anywhere" };
