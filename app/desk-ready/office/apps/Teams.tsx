"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { W } from "../../tokens";
import { CONTACTS, YOU } from "../northfield";
import { avatarColour, calOf, chatName, dayLong, teamsOf, timeRange, unreadChats, withCall } from "../meetings";
import { newId, type Action } from "../store";
import type { Call, Chat, OfficeState, Person, ShareWindow, TeamsState } from "../types";
import { AppButton } from "../ui";
import { Switch } from "./Calendar";
import { Avatar, CameraPicture, Icon, type IconName } from "./icons";
import type { OfficeAppProps } from "./registry";

/* Microsoft Teams, for Module 3 (criteria TM-3, TM-4): the left rail,
 * the chat list and a chat (send a message with Enter), today's meetings
 * with Join, and a call: the pre-join screen with camera and microphone
 * switches, then the call window with Camera, Mic, Share and Leave, and a
 * Share tray that offers the whole screen or one window. Chats and the
 * call live in the office record (teams), where the jobs' checks read
 * them. People outside the company can't be chatted with here: Teams
 * points the learner to email instead. */

const INSIDE = "@northfieldsupplies.example";
const RAIL = "#ebebf3";

type Pane = "activity" | "chat" | "teams" | "calendar" | "calls";

const setTeams = (dispatch: (a: Action) => void, fn: (t: TeamsState) => TeamsState) => dispatch({ type: "update", fn: (s: OfficeState) => ({ ...s, teams: fn(teamsOf(s)) }) });
const setCall = (dispatch: (a: Action) => void, fn: (c: Call) => Call) => setTeams(dispatch, (t) => (t.call ? { ...t, call: fn(t.call) } : t));

export default function Teams({ state, dispatch, show, active, job }: OfficeAppProps) {
  const t = teamsOf(state);
  const call = t.call;
  const [pane, setPane] = useState<Pane>("chat");
  const [chatId, setChatId] = useState<string | null>(() => t.chats.find((c) => c.unread)?.id ?? t.chats[0]?.id ?? null);
  const [newChat, setNewChat] = useState(false);
  const [inCallView, setInCallView] = useState(!!call && call.stage !== "left");
  const clock = /(\d{1,2}:\d{2})/.exec(job.clock)?.[1] ?? "Now";

  /* another app's Join button: come to the front, on the call */
  const asked = useRef(call?.ask ?? 0);
  useEffect(() => {
    if (call?.ask && call.ask !== asked.current) {
      asked.current = call.ask;
      setInCallView(true);
      show("teams");
    }
  }, [call?.ask, show]);

  /* opening Teams on a new message shows that chat */
  const unreadId = t.chats.find((c) => c.unread)?.id;
  useEffect(() => {
    if (active && unreadId && !inCallView) {
      setPane("chat");
      setChatId(unreadId);
    }
  }, [active, unreadId, inCallView]);

  const chat = t.chats.find((c) => c.id === chatId) ?? null;
  useEffect(() => {
    if (active && pane === "chat" && chat?.unread) setTeams(dispatch, (x) => ({ ...x, chats: x.chats.map((c) => (c.id === chat.id ? { ...c, unread: 0 } : c)) }));
  }, [active, pane, chat?.id, chat?.unread, dispatch]);

  const send = (text: string) => {
    if (!chat || !text.trim()) return;
    const msg = { id: newId("msg"), from: YOU, text: text.trim(), time: clock };
    setTeams(dispatch, (x) => ({ ...x, chats: x.chats.map((c) => (c.id === chat.id ? { ...c, messages: [...c.messages, msg] } : c)) }));
  };

  const startChat = (p: Person) => {
    const have = t.chats.find((c) => !c.title && c.people.length === 1 && c.people[0].address === p.address);
    if (have) setChatId(have.id);
    else {
      const id = newId("chat");
      setTeams(dispatch, (x) => ({ ...x, chats: [{ id, people: [p], messages: [] }, ...x.chats] }));
      setChatId(id);
    }
    setNewChat(false);
    setPane("chat");
  };

  const onCall = !!call && inCallView;

  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      <style>{TEAMS_CSS}</style>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 40, padding: "0 12px", background: W.teams, color: "#ffffff", fontSize: 14, flexShrink: 0 }}>
        <b style={{ fontWeight: 700 }}>Microsoft Teams</b>
        <span style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8, width: "min(420px, 100%)", minHeight: 28, padding: "0 10px", borderRadius: 6, background: "rgba(255,255,255,0.18)", color: "rgba(255,255,255,0.9)", fontSize: 13.5 }}>
            <Icon name="search" size={15} /> Search
          </span>
        </span>
        <Avatar name="You" colour={avatarColour(YOU.address)} size={26} presence={call?.stage === "in" ? "busy" : "available"} />
      </div>
      <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
        <Rail
          pane={onCall ? null : pane}
          unread={unreadChats(state)}
          onPane={(p) => {
            setPane(p);
            setInCallView(false);
          }}
          call={call && call.stage === "in" && !onCall ? () => setInCallView(true) : null}
        />
        {onCall && call ? (
          <CallArea call={call} state={state} dispatch={dispatch} onBack={() => setInCallView(false)} />
        ) : pane === "chat" ? (
          <>
            <ChatList chats={t.chats} openId={chatId} onOpen={(id) => { setChatId(id); setNewChat(false); }} onNew={() => setNewChat(true)} />
            {newChat ? <NewChat onPick={startChat} onCancel={() => setNewChat(false)} /> : chat ? <ChatPane key={chat.id} chat={chat} onSend={send} /> : <Empty icon="chat" text="Pick a chat on the left, or start a new one." />}
          </>
        ) : pane === "calendar" ? (
          <TeamsCalendar state={state} onJoin={(id) => {
            const m = calOf(state).meetings.find((x) => x.id === id);
            if (m) {
              dispatch({ type: "update", fn: (s) => withCall(s, m) });
              setInCallView(true);
            }
          }} />
        ) : pane === "activity" ? (
          <Activity chats={t.chats} onOpen={(id) => { setPane("chat"); setChatId(id); }} />
        ) : (
          <Empty icon={pane === "teams" ? "teams" : "phone"} text={pane === "teams" ? "Your teams and channels show here. For this job, everything you need is under Chat." : "Your recent calls show here. To call into a meeting, use Join on it in the Calendar."} />
        )}
      </div>
    </div>
  );
}

/* ── the rail ───────────────────────────────────────────────────────── */

function Rail({ pane, unread, onPane, call }: { pane: Pane | null; unread: number; onPane: (p: Pane) => void; call: (() => void) | null }) {
  const items: { p: Pane; label: string; icon: IconName; badge?: number }[] = [
    { p: "activity", label: "Activity", icon: "bell" },
    { p: "chat", label: "Chat", icon: "chat", badge: unread },
    { p: "teams", label: "Teams", icon: "teams" },
    { p: "calendar", label: "Calendar", icon: "calendar" },
    { p: "calls", label: "Calls", icon: "phone" },
  ];
  return (
    <nav aria-label="Teams" style={{ width: 72, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "stretch", gap: 2, padding: "6px 0", background: RAIL, borderRight: `1px solid ${W.edge}` }}>
      {items.map((i) => {
        const on = pane === i.p;
        return (
          <button key={i.p} type="button" aria-pressed={on} onClick={() => onPane(i.p)} className="tm-rail" style={{ position: "relative", minHeight: 56, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: "none", background: "transparent", color: on ? W.teams : W.body, fontFamily: W.font, fontSize: 11.5, fontWeight: on ? 700 : 500, cursor: "pointer" }}>
            {on && <span style={{ position: "absolute", left: 0, top: 12, bottom: 12, width: 3, borderRadius: 2, background: W.teams }} />}
            <span style={{ position: "relative" }}>
              <Icon name={i.icon} size={22} stroke={on ? 2.1 : 1.7} />
              {!!i.badge && <b style={{ position: "absolute", right: -10, top: -6, minWidth: 17, height: 17, padding: "0 4px", borderRadius: 9, background: "#c4314b", color: "#fff", fontSize: 11, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{i.badge}</b>}
            </span>
            {i.label}
          </button>
        );
      })}
      {call && (
        <button type="button" onClick={call} className="tm-rail" style={{ marginTop: "auto", minHeight: 56, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, border: "none", background: "transparent", color: "#13a10e", fontFamily: W.font, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
          <Icon name="video" size={22} />
          Back to call
        </button>
      )}
    </nav>
  );
}

function Empty({ icon, text }: { icon: IconName; text: string }) {
  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: 30, color: W.muted, textAlign: "center", fontSize: 15.5, lineHeight: 1.5 }}>
      <span style={{ width: 64, height: 64, borderRadius: "50%", background: W.teamsSoft, color: W.teams, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} size={30} />
      </span>
      <span style={{ maxWidth: 360 }}>{text}</span>
    </div>
  );
}

/* ── chats ──────────────────────────────────────────────────────────── */

function ChatAvatar({ chat, size = 32 }: { chat: Chat; size?: number }) {
  if (chat.title) {
    return (
      <span aria-hidden style={{ width: size, height: size, borderRadius: 8, flexShrink: 0, background: W.teamsSoft, color: W.teams, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Icon name="people" size={size * 0.56} />
      </span>
    );
  }
  const p = chat.people[0];
  return <Avatar name={p.name} colour={avatarColour(p.address)} size={size} presence={PRESENCE[p.address] ?? "available"} />;
}

/* Who's in, for the presence dots. */
const PRESENCE: Record<string, "available" | "busy" | "away"> = {
  "sarah.patel@northfieldsupplies.example": "busy",
  "priya.shah@northfieldsupplies.example": "available",
  "daniel.okafor@northfieldsupplies.example": "available",
  "emma.clarke@northfieldsupplies.example": "away",
};

function ChatList({ chats, openId, onOpen, onNew }: { chats: Chat[]; openId: string | null; onOpen: (id: string) => void; onNew: () => void }) {
  return (
    <div style={{ width: 290, flexShrink: 0, display: "flex", flexDirection: "column", borderRight: `1px solid ${W.edge}`, background: "#fafafa" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 52, padding: "0 10px 0 16px", borderBottom: `1px solid ${W.edge}` }}>
        <b style={{ flex: 1, fontSize: 18, fontWeight: 700 }}>Chat</b>
        <button type="button" onClick={onNew} aria-label="New chat" title="New chat" className="of-btn" style={{ width: 40, height: 40, border: "none", borderRadius: 6, background: "transparent", color: W.ink, cursor: "pointer" }}>
          <Icon name="pencil" size={20} />
        </button>
      </div>
      <div role="list" aria-label="Chats" style={{ flex: 1, overflowY: "auto", padding: 6 }}>
        <p style={{ margin: "4px 10px 6px", fontSize: 12.5, fontWeight: 600, color: W.muted }}>Recent</p>
        {chats.map((c) => {
          const last = c.messages[c.messages.length - 1];
          const on = c.id === openId;
          const bold = !!c.unread;
          return (
            <button key={c.id} type="button" role="listitem" onClick={() => onOpen(c.id)} className={on ? "tm-chat on" : "tm-chat"} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 58, padding: "6px 10px", border: "none", borderRadius: 6, background: on ? "#ffffff" : "transparent", boxShadow: on ? "0 1px 3px rgba(0,0,0,0.12)" : "none", fontFamily: W.font, textAlign: "left", cursor: "pointer", color: W.ink }}>
              <ChatAvatar chat={c} />
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "flex", justifyContent: "space-between", gap: 6 }}>
                  <span style={{ fontSize: 14.5, fontWeight: bold ? 700 : 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chatName(c)}</span>
                  <span style={{ fontSize: 12, color: W.muted, flexShrink: 0 }}>{last?.time ?? ""}</span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ flex: 1, fontSize: 13, color: bold ? W.ink : W.muted, fontWeight: bold ? 600 : 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {last ? `${last.from.address === YOU.address ? "You: " : c.title ? `${last.from.name.split(" ")[0]}: ` : ""}${last.text.replace(/\s+/g, " ")}` : "No messages yet"}
                  </span>
                  {bold && <b style={{ minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9, background: W.teams, color: "#fff", fontSize: 11, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{c.unread}</b>}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChatPane({ chat, onSend }: { chat: Chat; onSend: (text: string) => void }) {
  const [text, setText] = useState("");
  const end = useRef<HTMLDivElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [chat.messages.length]);
  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };
  return (
    <section aria-label={`Chat with ${chatName(chat)}`} style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, padding: "0 16px", borderBottom: `1px solid ${W.edge}` }}>
        <ChatAvatar chat={chat} size={30} />
        <span style={{ minWidth: 0 }}>
          <b style={{ display: "block", fontSize: 16, fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{chatName(chat)}</b>
          {chat.title && <span style={{ display: "block", fontSize: 12, color: W.muted }}>{chat.people.length + 1} people</span>}
        </span>
        <span style={{ marginLeft: 16, alignSelf: "stretch", display: "inline-flex", alignItems: "center", borderBottom: `3px solid ${W.teams}`, fontSize: 14, fontWeight: 700, color: W.teams, padding: "0 4px" }}>Chat</span>
        <span style={{ marginLeft: 14, fontSize: 14, color: W.muted }}>Shared</span>
      </header>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 20px", background: "#f5f5f5" }}>
        {chat.messages.length === 0 && <p style={{ margin: "40px auto", maxWidth: 340, textAlign: "center", fontSize: 15, color: W.muted }}>You&apos;re starting a new conversation. Type your first message below.</p>}
        {chat.messages.map((m, i) => {
          const mine = m.from.address === YOU.address;
          const prev = chat.messages[i - 1];
          const dayOf = (t: string) => (t.includes(" ") ? t.split(" ")[0] : "today");
          const head = !prev || prev.from.address !== m.from.address || dayOf(prev.time) !== dayOf(m.time);
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", gap: 10, marginTop: head ? 14 : 4 }}>
              {!mine && <span style={{ width: 32, flexShrink: 0 }}>{head && <Avatar name={m.from.name} colour={avatarColour(m.from.address)} size={32} />}</span>}
              <div style={{ maxWidth: "74%", minWidth: 0 }}>
                {head && (
                  <div style={{ fontSize: 12.5, color: W.muted, margin: "0 0 3px", textAlign: mine ? "right" : "left" }}>
                    {!mine && <b style={{ color: W.body, fontWeight: 600, marginRight: 8 }}>{m.from.name}</b>}
                    {m.time}
                  </div>
                )}
                <div style={{ padding: "8px 12px", borderRadius: 8, background: mine ? W.teamsSoft : "#ffffff", boxShadow: mine ? "none" : "0 1px 2px rgba(0,0,0,0.08)", fontSize: 15, lineHeight: 1.5, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}>{m.text}</div>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      <div style={{ padding: "10px 16px 12px", borderTop: `1px solid ${W.edge}` }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, padding: "6px 6px 6px 12px", border: `1px solid ${W.edge}`, borderBottom: `2px solid ${W.teams}`, borderRadius: 6, background: W.page }}>
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
            rows={Math.min(5, Math.max(1, text.split("\n").length))}
            style={{ flex: 1, minWidth: 0, minHeight: 34, border: "none", outline: "none", resize: "none", padding: "7px 0", fontFamily: W.font, fontSize: 15.5, lineHeight: 1.45, color: W.ink, background: "transparent" }}
          />
          <button type="button" onClick={send} disabled={!text.trim()} aria-label="Send" title="Send (Enter)" className="of-btn" style={{ width: 40, height: 40, border: "none", borderRadius: 6, background: "transparent", color: text.trim() ? W.teams : W.faint, cursor: text.trim() ? "pointer" : "default" }}>
            <Icon name="send" size={20} />
          </button>
        </div>
        <p style={{ margin: "6px 2px 0", fontSize: 12.5, color: W.muted }}>Enter sends it. Shift and Enter starts a new line.</p>
      </div>
    </section>
  );
}

function NewChat({ onPick, onCancel }: { onPick: (p: Person) => void; onCancel: () => void }) {
  const [text, setText] = useState("");
  const q = text.trim().toLowerCase();
  const matches = q ? CONTACTS.filter((p) => p.name.toLowerCase().includes(q) || p.address.includes(q)).slice(0, 6) : [];
  const [outside, setOutside] = useState<Person | null>(null);
  return (
    <section aria-label="New chat" style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <header style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 52, padding: "0 10px 0 16px", borderBottom: `1px solid ${W.edge}` }}>
        <b style={{ flex: 1, fontSize: 16 }}>New chat</b>
        <AppButton onClick={onCancel}>Cancel</AppButton>
      </header>
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 10, minHeight: 50, padding: "4px 16px", borderBottom: `1px solid ${W.edge}` }}>
        <span style={{ color: W.muted, fontSize: 15 }}>To:</span>
        <input
          aria-label="To"
          autoFocus
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            setOutside(null);
          }}
          placeholder="Type a name"
          style={{ flex: 1, minWidth: 0, minHeight: 40, border: "none", outline: "none", fontFamily: W.font, fontSize: 16, color: W.ink, background: "transparent" }}
        />
        {matches.length > 0 && (
          <div role="listbox" style={{ position: "absolute", left: 46, top: "100%", zIndex: 10, width: 340, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 8, boxShadow: W.float, padding: 4 }}>
            {matches.map((p) => {
              const external = !p.address.endsWith(INSIDE);
              return (
                <button key={p.address} type="button" role="option" aria-selected={false} className="of-row" onClick={() => (external ? setOutside(p) : onPick(p))} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 46, padding: "6px 10px", border: "none", borderRadius: 6, background: "transparent", fontFamily: W.font, textAlign: "left", cursor: "pointer" }}>
                  <Avatar name={p.name} colour={avatarColour(p.address)} size={30} />
                  <span>
                    <b style={{ display: "block", fontSize: 15, fontWeight: 600 }}>
                      {p.name}
                      {external && <span style={{ marginLeft: 6, fontSize: 12, fontWeight: 600, color: W.muted }}>(External)</span>}
                    </b>
                    <span style={{ fontSize: 13, color: W.muted }}>{p.address}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ flex: 1, padding: 24, background: "#f5f5f5" }}>
        {outside ? (
          <p role="status" style={{ margin: 0, maxWidth: 460, padding: "12px 14px", borderRadius: 8, background: "#fff4ce", border: "1px solid #f2d78a", fontSize: 15, lineHeight: 1.5 }}>
            <b>{outside.name}</b> works outside Northfield Supplies, so you can&apos;t chat with them in Teams here. Send them an email from Outlook instead.
          </p>
        ) : (
          <p style={{ margin: 0, fontSize: 15, color: W.muted }}>Type the name of someone at Northfield Supplies to start a chat.</p>
        )}
      </div>
    </section>
  );
}

function Activity({ chats, onOpen }: { chats: Chat[]; onOpen: (id: string) => void }) {
  const feed = chats.flatMap((c) => c.messages.filter((m) => m.from.address !== YOU.address).map((m) => ({ c, m }))).reverse();
  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto" }}>
      <b style={{ display: "block", padding: "16px 18px 8px", fontSize: 18 }}>Activity</b>
      {feed.length === 0 && <p style={{ margin: 0, padding: "0 18px", color: W.muted }}>Nothing new.</p>}
      {feed.map(({ c, m }) => (
        <button key={m.id} type="button" onClick={() => onOpen(c.id)} className="of-row" style={{ width: "100%", display: "flex", gap: 12, padding: "10px 18px", border: "none", borderBottom: `1px solid ${W.edge}`, background: "transparent", fontFamily: W.font, textAlign: "left", cursor: "pointer", color: W.ink }}>
          <Avatar name={m.from.name} colour={avatarColour(m.from.address)} size={32} />
          <span style={{ minWidth: 0 }}>
            <b style={{ fontSize: 14.5, fontWeight: 600 }}>{m.from.name}</b> <span style={{ fontSize: 12.5, color: W.muted }}>in {chatName(c)} · {m.time}</span>
            <span style={{ display: "block", fontSize: 14, color: W.body, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 560 }}>{m.text.replace(/\s+/g, " ")}</span>
          </span>
        </button>
      ))}
    </div>
  );
}

function TeamsCalendar({ state, onJoin }: { state: OfficeState; onJoin: (id: string) => void }) {
  const cal = calOf(state);
  const today = cal.meetings
    .filter((m) => m.day === cal.today && m.response !== "declined")
    .sort((a, b) => a.start.localeCompare(b.start));
  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", padding: "16px 20px" }}>
      <b style={{ display: "block", fontSize: 18 }}>Calendar</b>
      <p style={{ margin: "2px 0 14px", fontSize: 14, color: W.muted }}>Today, {dayLong(cal.today)}</p>
      <div style={{ display: "grid", gap: 8, maxWidth: 640 }}>
        {today.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 14px", borderRadius: 8, border: `1px solid ${W.edge}`, borderLeft: `4px solid ${m.teams ? W.teams : W.outlook}`, background: W.page }}>
            <span style={{ width: 96, flexShrink: 0, fontSize: 13.5, color: W.muted }}>{timeRange(m)}</span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <b style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{m.title}</b>
              <span style={{ fontSize: 13, color: W.muted }}>
                {m.organiser.address === YOU.address ? "You" : m.organiser.name}
                {m.teams ? " · Teams meeting" : m.room ? ` · ${m.room.name}` : m.place ? ` · ${m.place}` : ""}
              </span>
            </span>
            {m.teams && (
              <AppButton primary colour={W.teams} onClick={() => onJoin(m.id)}>
                <Icon name="video" size={16} /> Join
              </AppButton>
            )}
          </div>
        ))}
        {today.length === 0 && <p style={{ margin: 0, color: W.muted }}>Nothing else today.</p>}
      </div>
    </div>
  );
}

/* ── the call ───────────────────────────────────────────────────────── */

function CallArea({ call, state, dispatch, onBack }: { call: Call; state: OfficeState; dispatch: (a: Action) => void; onBack: () => void }) {
  const m = calOf(state).meetings.find((x) => x.id === call.meetingId);
  if (call.stage === "prejoin") return <PreJoin call={call} dispatch={dispatch} onCancel={onBack} when={m ? `${dayLong(m.day)}, ${timeRange(m)}` : ""} />;
  if (call.stage === "left") {
    return (
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14, padding: 30, background: W.call, color: "#fff", textAlign: "center" }}>
        <b style={{ fontSize: 22, fontWeight: 600 }}>You left the meeting</b>
        <span style={{ fontSize: 15, color: "rgba(255,255,255,0.75)" }}>{call.title}</span>
        <span style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <AppButton primary colour={W.teams} onClick={() => m && dispatch({ type: "update", fn: (s) => withCall(s, m) })}>
            Rejoin
          </AppButton>
          <AppButton onClick={onBack}>Back to chat</AppButton>
        </span>
      </div>
    );
  }
  return <InCall call={call} state={state} dispatch={dispatch} />;
}

function PreJoin({ call, dispatch, onCancel, when }: { call: Call; dispatch: (a: Action) => void; onCancel: () => void; when: string }) {
  const [audio, setAudio] = useState("computer");
  return (
    <div style={{ flex: 1, minWidth: 0, overflowY: "auto", background: "#f5f5f5", padding: "22px 24px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <b style={{ display: "block", fontSize: 21, fontWeight: 700 }}>{call.title}</b>
        <span style={{ fontSize: 14, color: W.muted }}>{when ? `${when} · ` : ""}Choose your video and audio options</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
          <div style={{ flex: "1 1 360px", background: W.page, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", overflow: "hidden" }}>
            <div aria-label={call.camera ? "Your camera is on" : "Your camera is off"} style={{ position: "relative", aspectRatio: "16 / 9", background: W.call, display: "flex", alignItems: "center", justifyContent: "center" }}>
              {call.camera ? <CameraPicture colour="#8a4fd8" /> : <Avatar name="You" colour={avatarColour(YOU.address)} size={76} />}
              {!call.camera && <span style={{ position: "absolute", bottom: 12, left: 0, right: 0, textAlign: "center", fontSize: 13.5, color: "rgba(255,255,255,0.8)" }}>Your camera is turned off</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18, padding: "12px 16px" }}>
              <label style={pjToggle}>
                <Icon name={call.camera ? "video" : "videoOff"} size={20} />
                <Switch on={call.camera} onChange={(v) => setCall(dispatch, (c) => ({ ...c, camera: v }))} label="Camera" colour={W.teams} />
                <span>Camera {call.camera ? "on" : "off"}</span>
              </label>
              <span style={{ ...pjToggle, color: W.muted }}>
                <Icon name="blur" size={20} /> Background filters
              </span>
            </div>
          </div>
          <div role="radiogroup" aria-label="Audio" style={{ flex: "1 1 260px", background: W.page, borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", padding: 8 }}>
            {[
              ["computer", "Computer audio"],
              ["phone", "Phone audio"],
              ["none", "Don't use audio"],
            ].map(([id, label]) => (
              <div key={id} style={{ borderRadius: 8, background: audio === id ? W.teamsSoft : "transparent" }}>
                <button type="button" role="radio" aria-checked={audio === id} onClick={() => setAudio(id)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 46, padding: "6px 10px", border: "none", background: "transparent", fontFamily: W.font, fontSize: 15, fontWeight: audio === id ? 700 : 500, color: W.ink, textAlign: "left", cursor: "pointer" }}>
                  <span style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${audio === id ? W.teams : W.muted}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{audio === id && <span style={{ width: 8, height: 8, borderRadius: "50%", background: W.teams }} />}</span>
                  {label}
                </button>
                {id === "computer" && audio === "computer" && (
                  <div style={{ display: "grid", gap: 6, padding: "0 12px 12px 36px" }}>
                    <label style={pjToggle}>
                      <Icon name={call.mic ? "mic" : "micOff"} size={20} />
                      <Switch on={call.mic} onChange={(v) => setCall(dispatch, (c) => ({ ...c, mic: v }))} label="Microphone" colour={W.teams} />
                      <span>Microphone {call.mic ? "on" : "off (muted)"}</span>
                    </label>
                    <span style={{ ...pjToggle, color: W.muted, fontSize: 13.5 }}>
                      <Icon name="speaker" size={18} /> Speakers: Laptop speakers
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <AppButton onClick={onCancel}>Cancel</AppButton>
          <AppButton primary colour={W.teams} onClick={() => setCall(dispatch, (c) => ({ ...c, stage: "in", mic: audio === "computer" ? c.mic : false, joinedWith: { mic: audio === "computer" ? c.mic : false, camera: c.camera } }))}>
            Join now
          </AppButton>
        </div>
      </div>
    </div>
  );
}

const pjToggle: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 10, minHeight: 40, fontSize: 14.5, color: W.ink };

/* What the other person says, as live captions, from what's on show. */
function caption(call: Call, windows: ShareWindow[]): string {
  const host = call.people[0]?.name.split(" ")[0] ?? "They";
  const now = windows.find((w) => w.id === call.sharing);
  if (now?.app === "screen" || now?.private) return `${host}: I can see more than the rota there, including an email that looks private. Could you share just the Excel window?`;
  if (now) return `${host}: Great, I can see ${now.title.replace(/^[^·]*·\s*/, "")}. Let's go through it.`;
  if (call.shared.length) return `${host}: Thanks. Anything else before we finish?`;
  return `${host}: Hi, thanks for joining. When you're ready, share the rota so we can go through it.`;
}

function InCall({ call, state, dispatch }: { call: Call; state: OfficeState; dispatch: (a: Action) => void }) {
  const windows = teamsOf(state).windows;
  const [tray, setTray] = useState(false);
  const [secs, setSecs] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setSecs((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);
  const sharing = windows.find((w) => w.id === call.sharing) ?? null;
  const share = (w: ShareWindow) => {
    setCall(dispatch, (c) => ({ ...c, sharing: w.id, shared: c.shared.includes(w.id) ? c.shared : [...c.shared, w.id] }));
    setTray(false);
  };
  const host = call.people[0];
  return (
    <section aria-label="Meeting" style={{ position: "relative", flex: 1, minWidth: 0, display: "flex", flexDirection: "column", background: W.call, color: "#fff" }}>
      {/* the control bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, minHeight: 64, padding: "0 10px 0 16px", background: "#2b2b2b", borderBottom: "1px solid #3a3a3a" }}>
        <span style={{ minWidth: 0, flex: 1 }}>
          <b style={{ display: "block", fontSize: 14.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{call.title}</b>
          <span style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)" }}>{`${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`}</span>
        </span>
        <CallBtn icon="chat" label="Chat" />
        <CallBtn icon="people" label="People" />
        <CallBtn icon="hand" label="Raise" />
        <span style={{ width: 1, height: 36, background: "#4a4a4a", margin: "0 6px" }} />
        <CallBtn icon={call.camera ? "video" : "videoOff"} label="Camera" pressed={call.camera} onClick={() => setCall(dispatch, (c) => ({ ...c, camera: !c.camera }))} />
        <CallBtn icon={call.mic ? "mic" : "micOff"} label="Mic" pressed={call.mic} onClick={() => setCall(dispatch, (c) => ({ ...c, mic: !c.mic }))} />
        <CallBtn icon="share" label="Share" pressed={tray || !!sharing} onClick={() => setTray((x) => !x)} />
        <button type="button" onClick={() => setCall(dispatch, (c) => ({ ...c, stage: "left", sharing: null }))} className="of-btn" style={{ marginLeft: 6, display: "inline-flex", alignItems: "center", gap: 8, minHeight: 40, padding: "0 16px", border: "none", borderRadius: 6, background: "#c4314b", color: "#fff", fontFamily: W.font, fontSize: 14.5, fontWeight: 700, cursor: "pointer" }}>
          <Icon name="leave" size={18} /> Leave
        </button>
      </div>

      {sharing && (
        <div role="status" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, minHeight: 40, padding: "4px 12px", background: "#c4314b", fontSize: 14 }}>
          <Icon name="share" size={16} /> You&apos;re sharing: <b>{sharing.title}</b>
          <button type="button" onClick={() => setCall(dispatch, (c) => ({ ...c, sharing: null }))} className="of-btn" style={{ minHeight: 30, padding: "0 12px", border: "1px solid rgba(255,255,255,0.8)", borderRadius: 4, background: "transparent", color: "#fff", fontFamily: W.font, fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
            Stop sharing
          </button>
        </div>
      )}

      {/* the stage */}
      <div style={{ position: "relative", flex: 1, minHeight: 0, padding: 14, display: "flex", gap: 12 }}>
        {sharing ? (
          <div style={{ flex: 1, minWidth: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: "min(100%, 640px)", aspectRatio: "16 / 10" }}>
              <WindowThumb w={sharing} windows={windows} big />
            </div>
          </div>
        ) : (
          <div style={{ position: "relative", flex: 1, minWidth: 0, borderRadius: 10, overflow: "hidden", background: "#3b3a39" }}>
            {host && <CameraPicture colour={avatarColour(host.address)} />}
            <span style={{ position: "absolute", left: 10, bottom: 10, padding: "3px 8px", borderRadius: 4, background: "rgba(0,0,0,0.55)", fontSize: 13 }}>{host?.name}</span>
          </div>
        )}
        {sharing && host && (
          <div style={{ width: 170, flexShrink: 0, alignSelf: "flex-start", aspectRatio: "16 / 10", position: "relative", borderRadius: 8, overflow: "hidden", background: "#3b3a39" }}>
            <CameraPicture colour={avatarColour(host.address)} />
            <span style={{ position: "absolute", left: 6, bottom: 6, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.55)", fontSize: 12 }}>{host.name}</span>
          </div>
        )}
        {/* you */}
        <div aria-label={`You: camera ${call.camera ? "on" : "off"}, microphone ${call.mic ? "on" : "muted"}`} style={{ position: "absolute", right: 24, bottom: 24, width: 190, aspectRatio: "16 / 10", borderRadius: 8, overflow: "hidden", background: "#3b3a39", boxShadow: "0 6px 18px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {call.camera ? <CameraPicture colour="#8a4fd8" /> : <Avatar name="You" colour={avatarColour(YOU.address)} size={44} />}
          <span style={{ position: "absolute", left: 6, bottom: 6, display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 6px", borderRadius: 4, background: "rgba(0,0,0,0.6)", fontSize: 12 }}>
            {!call.mic && <Icon name="micOff" size={13} />}
            You
          </span>
        </div>
      </div>

      {/* live captions */}
      <p aria-live="polite" style={{ margin: "0 auto 14px", maxWidth: "min(680px, 92%)", padding: "8px 14px", borderRadius: 6, background: "rgba(0,0,0,0.6)", fontSize: 15, lineHeight: 1.45, textAlign: "center" }}>
        {caption(call, windows)}
      </p>

      {tray && <ShareTray windows={windows} onShare={share} onClose={() => setTray(false)} />}
    </section>
  );
}

function CallBtn({ icon, label, onClick, pressed }: { icon: IconName; label: string; onClick?: () => void; pressed?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={onClick ? !!pressed : undefined} className="tm-callbtn" style={{ minWidth: 56, minHeight: 52, display: "inline-flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, padding: "4px 6px", border: "none", borderRadius: 6, background: pressed ? "rgba(255,255,255,0.12)" : "transparent", color: onClick ? "#fff" : "rgba(255,255,255,0.75)", fontFamily: W.font, fontSize: 11.5, cursor: onClick ? "pointer" : "default" }}>
      <Icon name={icon} size={20} />
      {label}
    </button>
  );
}

function ShareTray({ windows, onShare, onClose }: { windows: ShareWindow[]; onShare: (w: ShareWindow) => void; onClose: () => void }) {
  const screen = windows.filter((w) => w.app === "screen");
  const wins = windows.filter((w) => w.app !== "screen");
  return (
    <div role="dialog" aria-label="Share content" style={{ position: "absolute", right: 70, top: 68, zIndex: 20, width: "min(560px, calc(100% - 24px))", padding: 14, borderRadius: 10, background: "#2b2b2b", border: "1px solid #444", boxShadow: "0 18px 40px rgba(0,0,0,0.6)", color: "#fff" }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <b style={{ flex: 1, fontSize: 15 }}>Share content</b>
        <button type="button" aria-label="Close" onClick={onClose} style={{ width: 34, height: 34, border: "none", background: "transparent", color: "#fff", cursor: "pointer" }}>
          <Icon name="cross" size={16} />
        </button>
      </div>
      <TrayGroup label="Screen">
        {screen.map((w) => (
          <Thumb key={w.id} w={w} windows={windows} onPick={() => onShare(w)} />
        ))}
      </TrayGroup>
      <TrayGroup label="Window">
        {wins.map((w) => (
          <Thumb key={w.id} w={w} windows={windows} onPick={() => onShare(w)} />
        ))}
      </TrayGroup>
    </div>
  );
}

function TrayGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ marginTop: 10 }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: "rgba(255,255,255,0.7)" }}>{label}</span>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 10, marginTop: 6 }}>{children}</div>
    </div>
  );
}

function Thumb({ w, windows, onPick }: { w: ShareWindow; windows: ShareWindow[]; onPick: () => void }) {
  return (
    <button type="button" onClick={onPick} className="tm-thumb" aria-label={`Share ${w.title}`} style={{ display: "grid", gap: 6, padding: 6, border: "2px solid transparent", borderRadius: 8, background: "#3a3a3a", color: "#fff", fontFamily: W.font, textAlign: "left", cursor: "pointer" }}>
      <span style={{ display: "block", aspectRatio: "16 / 10" }}>
        <WindowThumb w={w} windows={windows} />
      </span>
      <span style={{ fontSize: 12.5, lineHeight: 1.3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{w.title}</span>
    </button>
  );
}

/* A small drawing of a window, or of the whole screen with every window on
 * it, for the Share tray and for what the others see. */
export function WindowThumb({ w, windows, big }: { w: ShareWindow; windows: ShareWindow[]; big?: boolean }) {
  if (w.app === "screen") {
    const parts = windows.filter((x) => x.app !== "screen").slice(0, 2);
    return (
      <span style={{ position: "relative", display: "block", width: "100%", height: "100%", borderRadius: 4, overflow: "hidden", background: W.desktop }}>
        {parts.map((p, i) => (
          <span key={p.id} style={{ position: "absolute", left: i ? "40%" : "4%", top: i ? "18%" : "6%", width: "56%", height: "70%", boxShadow: "0 3px 10px rgba(0,0,0,0.4)" }}>
            <WindowThumb w={p} windows={windows} big={big} />
          </span>
        ))}
        <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "9%", background: "rgba(238,242,250,0.85)" }} />
      </span>
    );
  }
  const colour = w.app === "excel" ? W.excel : w.app === "outlook" ? W.outlook : "#2b2b2b";
  const label = w.title.replace(/^[^·]*·\s*/, "");
  return (
    <span style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", borderRadius: 4, overflow: "hidden", background: "#fff", color: W.ink }}>
      <span style={{ flexShrink: 0, height: big ? 22 : 10, background: colour, color: "#fff", fontSize: big ? 12 : 0, padding: "0 8px", display: "flex", alignItems: "center", whiteSpace: "nowrap", overflow: "hidden" }}>{big ? w.title : ""}</span>
      {w.app === "excel" ? (
        <span style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gridAutoRows: big ? "26px" : "1fr", alignContent: "start", background: big ? `linear-gradient(${W.edge}, ${W.edge}) top / 100% ${6 * 27 + 1}px no-repeat, #fff` : W.edge, gap: 1, padding: 1 }}>
          {Array.from({ length: 30 }, (_, i) => (
            <span key={i} style={{ background: i < 5 ? "#e8f3ec" : "#fff", fontSize: big ? 11 : 0, padding: big ? "1px 4px" : 0, overflow: "hidden", whiteSpace: "nowrap", fontWeight: i < 5 ? 700 : 400 }}>
              {big ? ROTA_CELLS[i] ?? "" : ""}
            </span>
          ))}
        </span>
      ) : (
        <span style={{ flex: 1, display: "flex" }}>
          <span style={{ width: "26%", background: W.chrome, borderRight: `1px solid ${W.edge}` }} />
          <span style={{ flex: 1, padding: big ? "10px 12px" : 4, display: "grid", alignContent: "start", gap: big ? 6 : 2, fontSize: big ? 12.5 : 0 }}>
            {big ? (
              <>
                <b style={{ fontSize: 14 }}>{label}</b>
                {w.private && <span style={{ color: "#a4262c", fontWeight: 600 }}>Private and confidential</span>}
                <span>Hi, please find your new salary and the bank details we hold for you below...</span>
              </>
            ) : (
              [70, 92, 84, 60].map((n, i) => <span key={i} style={{ display: "block", height: 3, width: `${n}%`, borderRadius: 2, background: i === 0 ? W.ink : W.edge }} />)
            )}
          </span>
        </span>
      )}
    </span>
  );
}

const ROTA_CELLS = ["Name", "Mon", "Tue", "Wed", "Thu", "You", "08-16", "08-16", "Off", "12-20", "Sarah", "Off", "08-16", "08-16", "08-16", "Tom", "12-20", "12-20", "08-16", "Off", "Aisha", "08-16", "Off", "12-20", "12-20"];

/* A new message pops up at the corner of the screen when Teams isn't in
 * front, as it does at work. Click it to read it. */
export function TeamsToast({ state, active, show }: OfficeAppProps) {
  const [gone, setGone] = useState<string[]>([]);
  const c = teamsOf(state).chats.find((x) => x.unread && !gone.includes(x.id));
  if (active || !c) return null;
  const last = [...c.messages].reverse().find((m) => m.from.address !== YOU.address);
  if (!last) return null;
  return (
    <div role="status" style={{ position: "absolute", right: 14, bottom: 62, zIndex: 30, width: 340, display: "flex", gap: 10, padding: "12px 12px 12px 14px", borderRadius: 8, background: "#ffffff", boxShadow: "0 12px 34px rgba(0,0,0,0.35)", fontFamily: W.font, color: W.ink, borderTop: `3px solid ${W.teams}` }}>
      <Avatar name={last.from.name} colour={avatarColour(last.from.address)} size={34} />
      <button type="button" onClick={() => show("teams")} style={{ flex: 1, minWidth: 0, padding: 0, border: "none", background: "transparent", fontFamily: W.font, textAlign: "left", cursor: "pointer", color: W.ink }}>
        <b style={{ display: "block", fontSize: 14.5 }}>{last.from.name}</b>
        <span style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", fontSize: 13.5, color: W.body, lineHeight: 1.4 }}>{last.text}</span>
        <span style={{ display: "block", marginTop: 4, fontSize: 12.5, color: W.teams, fontWeight: 600 }}>Microsoft Teams · click to open</span>
      </button>
      <button type="button" aria-label="Dismiss" onClick={() => setGone((g) => [...g, c.id])} style={{ alignSelf: "flex-start", width: 30, height: 30, border: "none", background: "transparent", color: W.muted, cursor: "pointer" }}>
        <Icon name="cross" size={14} />
      </button>
    </div>
  );
}

const TEAMS_CSS = `
  .tm-rail:hover { background: rgba(91,95,199,0.08) !important; }
  .tm-chat:not(.on):hover { background: rgba(0,0,0,0.04) !important; }
  .tm-callbtn:hover { background: rgba(255,255,255,0.16) !important; }
  .tm-thumb:hover, .tm-thumb:focus-visible { border-color: ${W.teams} !important; }
`;
