"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { W } from "../../tokens";
import { YOU } from "../northfield";
import { FileList } from "../places";
import { listFolder, newId } from "../store";
import type { OfficeFile, OfficeState, Path } from "../types";
import { AppButton } from "../ui";
import type { OfficeAppProps } from "./registry";
import { Avatar } from "./Share";

/* ── Module 9: Files and sharing ──────────────────────────────────────────
 * Teams, as much of it as Module 9's jobs need: a chat with one colleague
 * (where a job's brief can arrive, "Help! I saved over the stock sheet"),
 * and the Operations Team's channel with its Files tab. The Files tab is
 * the point (criteria SP-1): it shows the very same folders as the
 * Operations Team site in SharePoint and File Explorer, because that is
 * where Teams keeps a team's files. Open a file here and it is the same
 * file. Module 3 builds the full Teams; this one is kept small. */

/* Teams' own purple. */
const TEAMS = "#5b5fc7";
const TEAMS_SOFT = "#e8ebfa";

type Pane = "chat" | "teams";

export default function TeamsChat({ state, dispatch, openFile, active }: OfficeAppProps) {
  const chat = state.teamsNote;
  const [pane, setPane] = useState<Pane>("chat");
  const [tab, setTab] = useState<"posts" | "files">("files");
  const [at, setAt] = useState<Path>(["Operations Team", "Documents"]);
  const [picked, setPicked] = useState<string | null>(null);
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);

  /* opening Teams on the chat marks it read */
  useEffect(() => {
    if (active && pane === "chat" && chat && !chat.read) dispatch({ type: "update", fn: (s) => (s.teamsNote ? { ...s, teamsNote: { ...s.teamsNote, read: true } } : s) });
  }, [active, pane, chat, dispatch]);
  useEffect(() => end.current?.scrollIntoView({ block: "end" }), [chat?.messages.length, pane]);

  const send = () => {
    const t = text.trim();
    if (!t || !chat) return;
    dispatch({ type: "update", fn: (s) => (s.teamsNote ? { ...s, teamsNote: { ...s.teamsNote, messages: [...s.teamsNote.messages, { id: newId("msg"), from: YOU, text: t, time: "Just now" }] } } : s) });
    setText("");
  };

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column", background: "#f5f5f5", fontFamily: W.font, color: W.ink }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 40, padding: "0 12px", background: "#ebebeb", borderBottom: `1px solid ${W.edge}`, fontSize: 14, flexShrink: 0 }}>
        <span aria-hidden style={{ width: 20, height: 20, borderRadius: 4, background: TEAMS, color: "#fff", fontSize: 12, fontWeight: 800, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>T</span>
        <b style={{ fontWeight: 600 }}>Microsoft Teams</b>
        <span style={{ margin: "0 auto", width: 320, maxWidth: "40%", minHeight: 28, display: "inline-flex", alignItems: "center", padding: "0 10px", borderRadius: 4, background: "#fff", border: `1px solid ${W.edge}`, color: W.faint, fontSize: 13.5 }}>Search</span>
        <Avatar name="You" size={26} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        {/* the app bar down the left */}
        <nav aria-label="Teams" style={{ width: 68, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, paddingTop: 8, background: "#ebebeb", borderRight: `1px solid ${W.edge}` }}>
          <Rail label="Chat" on={pane === "chat"} badge={chat && !chat.read ? 1 : 0} onClick={() => setPane("chat")} icon={<path d="M4 5.5 H20 V15.5 H10 L6 19 V15.5 H4 Z" />} />
          <Rail label="Teams" on={pane === "teams"} onClick={() => setPane("teams")} icon={<path d="M9 11 A3.2 3.2 0 1 0 9 4.6 A3.2 3.2 0 1 0 9 11 M2.8 19.5 C3.4 15.6 5.9 13.6 9 13.6 C12.1 13.6 14.6 15.6 15.2 19.5 M16.6 11.7 A2.7 2.7 0 1 0 16.6 6.3 M17.2 13.9 C19.4 14.2 20.9 15.9 21.3 18.6" />} />
        </nav>

        {pane === "chat" ? (
          <>
            <div style={{ width: 250, flexShrink: 0, background: "#f0f0f0", borderRight: `1px solid ${W.edge}`, padding: "10px 8px" }}>
              <b style={{ display: "block", padding: "4px 8px 10px", fontSize: 18, fontWeight: 700 }}>Chat</b>
              {chat ? (
                <button type="button" className="of-row on" style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 56, padding: "6px 8px", border: "none", borderRadius: 6, background: "#fff", textAlign: "left", fontFamily: W.font, color: W.ink }}>
                  <Avatar name={chat.with.name} />
                  <span style={{ minWidth: 0, flex: 1 }}>
                    <span style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                      <b style={{ fontSize: 14.5, fontWeight: chat.read ? 500 : 700 }}>{chat.with.name}</b>
                      <span style={{ fontSize: 12, color: W.muted }}>{chat.messages.at(-1)?.time}</span>
                    </span>
                    <span style={{ display: "block", fontSize: 13, color: W.muted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chat.messages.at(-1)?.text}</span>
                  </span>
                </button>
              ) : (
                <p style={{ margin: 0, padding: 8, fontSize: 14, color: W.muted }}>No chats yet.</p>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#fff" }}>
              {chat ? (
                <>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, padding: "0 16px", borderBottom: `1px solid ${W.edge}` }}>
                    <Avatar name={chat.with.name} size={30} />
                    <b style={{ fontSize: 16, fontWeight: 600 }}>{chat.with.name}</b>
                  </div>
                  <div role="log" aria-label={`Chat with ${chat.with.name}`} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 18px", background: "#f8f8f8" }}>
                    {chat.messages.map((m) => {
                      const me = m.from.address === YOU.address;
                      return (
                        <div key={m.id} style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", gap: 8, marginBottom: 12 }}>
                          {!me && <Avatar name={m.from.name} size={30} />}
                          <div style={{ maxWidth: "75%", padding: "8px 12px", borderRadius: 6, background: me ? TEAMS_SOFT : "#fff", boxShadow: "0 1px 2px rgba(0,0,0,0.12)" }}>
                            <span style={{ display: "block", fontSize: 12, color: W.muted, marginBottom: 2 }}>
                              {me ? "" : `${m.from.name} · `}
                              {m.time}
                            </span>
                            <span style={{ fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{m.text}</span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={end} />
                  </div>
                  <div style={{ padding: "10px 16px 14px", borderTop: `1px solid ${W.edge}` }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "flex-end", border: `1px solid ${W.edge}`, borderBottom: `2px solid ${TEAMS}`, borderRadius: 4, padding: "4px 4px 4px 10px", background: "#fff" }}>
                      <textarea
                        aria-label="Type a message"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            send();
                          }
                        }}
                        placeholder="Type a message"
                        rows={2}
                        style={{ flex: 1, minWidth: 0, border: "none", outline: "none", resize: "none", fontFamily: W.font, fontSize: 15, lineHeight: 1.45, color: W.ink, background: "transparent", paddingTop: 6 }}
                      />
                      <AppButton primary colour={TEAMS} onClick={send} disabled={!text.trim()} title="Send (Enter)">
                        Send
                      </AppButton>
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 12.5, color: W.muted }}>Enter sends. Shift+Enter starts a new line.</p>
                  </div>
                </>
              ) : (
                <p style={{ margin: 0, padding: 28, color: W.muted }}>Pick a chat.</p>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ width: 250, flexShrink: 0, background: "#f0f0f0", borderRight: `1px solid ${W.edge}`, padding: "10px 8px" }}>
              <b style={{ display: "block", padding: "4px 8px 10px", fontSize: 18, fontWeight: 700 }}>Teams</b>
              <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px", fontSize: 14.5, fontWeight: 600 }}>
                <span aria-hidden style={{ width: 28, height: 28, borderRadius: 6, background: "#03787c", color: "#fff", fontSize: 11.5, fontWeight: 700, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>OT</span>
                Operations Team
              </div>
              <button type="button" className="of-row on" style={{ width: "100%", minHeight: 38, padding: "6px 8px 6px 46px", border: "none", borderRadius: 6, background: "#fff", textAlign: "left", fontFamily: W.font, fontSize: 14.5, fontWeight: 600, color: W.ink }}>
                General
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 18, minHeight: 52, padding: "0 16px", borderBottom: `1px solid ${W.edge}` }}>
                <b style={{ alignSelf: "center", fontSize: 16, fontWeight: 600, marginRight: 6 }}>General</b>
                {(["posts", "files"] as const).map((t) => (
                  <button key={t} type="button" onClick={() => setTab(t)} aria-pressed={tab === t} style={{ minHeight: 44, padding: "0 4px", border: "none", borderBottom: `3px solid ${tab === t ? TEAMS : "transparent"}`, background: "transparent", fontFamily: W.font, fontSize: 15, fontWeight: tab === t ? 600 : 400, color: tab === t ? W.ink : W.muted, cursor: "pointer" }}>
                    {t === "posts" ? "Posts" : "Files"}
                  </button>
                ))}
              </div>
              {tab === "posts" ? (
                <div style={{ padding: 18, fontSize: 15, lineHeight: 1.55, color: W.body }}>
                  <Post who="Daniel Okafor" time="Mon 09:05">Morning all. Reminder: anything the team needs lives in Files, here or in the Operations Team site. Same place, two ways in.</Post>
                </div>
              ) : (
                <ChannelFiles state={state} at={at} setAt={(p) => (setAt(p), setPicked(null))} picked={picked} setPicked={setPicked} openFile={openFile} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Rail({ label, on, onClick, icon, badge = 0 }: { label: string; on: boolean; onClick: () => void; icon: ReactNode; badge?: number }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} style={{ position: "relative", width: 60, minHeight: 54, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: "none", borderRadius: 6, background: on ? "#fff" : "transparent", color: on ? TEAMS : W.muted, fontFamily: W.font, fontSize: 11.5, fontWeight: on ? 700 : 500, cursor: "pointer" }}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" strokeLinecap="round" aria-hidden style={{ display: "inline-block" }}>
        {icon}
      </svg>
      {label}
      {badge > 0 && <b style={{ position: "absolute", top: 4, right: 10, minWidth: 18, height: 18, borderRadius: 9, background: "#c4314b", color: "#fff", fontSize: 11, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{badge}</b>}
    </button>
  );
}

function Post({ who, time, children }: { who: string; time: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, padding: "12px 14px", borderRadius: 6, background: "#f8f8f8", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
      <Avatar name={who} size={30} />
      <div>
        <span style={{ fontSize: 12.5, color: W.muted }}>
          <b style={{ color: W.ink, fontWeight: 600 }}>{who}</b> · {time}
        </span>
        <p style={{ margin: "2px 0 0" }}>{children}</p>
      </div>
    </div>
  );
}

/* The Files tab: the Operations Team site's Documents, as Teams lists them. */
function ChannelFiles({ state, at, setAt, picked, setPicked, openFile }: { state: OfficeState; at: Path; setAt: (p: Path) => void; picked: string | null; setPicked: (id: string) => void; openFile: (f: OfficeFile) => void }) {
  const items = listFolder(state, at);
  const crumb: CSSProperties = { border: "none", background: "transparent", padding: "4px 2px", fontFamily: W.font, fontSize: 15, cursor: "pointer" };
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <p style={{ margin: 0, display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", fontSize: 13.5, color: W.body, background: "#eef6f6", borderBottom: `1px solid ${W.edge}` }}>
        These are the Operations Team site&apos;s files on SharePoint. The same files you see in File Explorer, not copies.
      </p>
      <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 6, minHeight: 44, padding: "4px 14px", borderBottom: `1px solid ${W.edge}` }}>
        {at.slice(1).map((part, i) => (
          <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {i > 0 && <span style={{ color: W.faint }}>›</span>}
            <button type="button" onClick={() => setAt(at.slice(0, i + 2))} style={{ ...crumb, color: i === at.length - 2 ? W.ink : W.muted, fontWeight: i === at.length - 2 ? 600 : 400 }}>
              {part}
            </button>
          </span>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        <FileList items={items} selected={picked} onPick={(f) => setPicked(f.id)} onOpen={(f) => (f.kind === "folder" ? setAt([...f.path, f.name]) : openFile(f))} />
      </div>
    </div>
  );
}

/* The taskbar's count: a chat message not yet read. */
export const unreadNote = (s: OfficeState) => (s.teamsNote && !s.teamsNote.read ? 1 : 0);
