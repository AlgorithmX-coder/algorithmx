"use client";

import type { CSSProperties, ReactNode } from "react";
import { W } from "../../tokens";
import { Avatar, CameraPicture, Icon, type IconName } from "../../office/apps/icons";
import { avatarColour } from "../../office/meetings";
import { infoWith } from "./calendar";
import { AppWindow, FakeButton, FigureFrame, Part, type PartInfo } from "./parts";

/* Teams, drawn the way it looks at work, every part numbered (Module 3):
 * the chat window, the screen before you join a call (in Teams and in
 * Zoom), the call itself with its controls, the Share tray, and an email
 * that writes up a meeting's actions. */

/* ── the Teams window ───────────────────────────────────────────────── */

export type TeamsPart = "rail" | "list" | "unread" | "presence" | "header" | "messages" | "compose" | "send";

export const TEAMS_PARTS: Record<TeamsPart, PartInfo> = {
  rail: { n: 1, name: "The left rail", what: "Teams' main sections: Activity, Chat, Teams, Calendar and Calls. Chat is where your conversations live." },
  list: { n: 2, name: "Your chats", what: "One line per conversation, newest at the top: a person, or a group like a meeting's chat." },
  unread: { n: 3, name: "Unread", what: "Bold, with a number: messages you haven't read yet." },
  presence: { n: 4, name: "Status dot", what: "Green: available. Red: busy or in a call. Yellow: away. It tells you if now's a good time." },
  header: { n: 5, name: "Who you're chatting with", what: "The person or group this conversation is with. Check it before you type." },
  messages: { n: 6, name: "The conversation", what: "Their messages on the left, yours on the right, each with the time." },
  compose: { n: 7, name: "Type a message", what: "Short and to the point, like talking across the desk." },
  send: { n: 8, name: "Send", what: "Sends it straight away. Pressing Enter does the same." },
};

export interface ChatLine {
  who: string; // "You" for the learner
  time: string;
  text: string;
}

export interface TeamsExample {
  /* The chat that's open. */
  name: string;
  group?: boolean;
  lines: ChatLine[];
  draft?: string;
}

export const PRINTER_CHAT: TeamsExample = {
  name: "Sarah Patel",
  lines: [
    { who: "You", time: "10:41", text: "Hi Sarah, is the warehouse printer working again?" },
    { who: "Sarah Patel", time: "10:43", text: "Yes, fixed this morning. It just needed paper!" },
  ],
  draft: "Great, thanks!",
};

const CHAT_LIST: { name: string; preview: string; time: string; presence: "available" | "busy" | "away"; unread?: number; group?: boolean }[] = [
  { name: "Sarah Patel", preview: "Yes, fixed this morning.", time: "10:43", presence: "busy" },
  { name: "Daniel Okafor", preview: "Can you book a room for…", time: "10:30", presence: "available", unread: 2 },
  { name: "Late deliveries review", preview: "Emma: See you all at 9:30", time: "09:12", presence: "available", group: true },
  { name: "Emma Clarke", preview: "Thanks for the call!", time: "Mon", presence: "away" },
];

function railItem(icon: IconName, label: string, on = false) {
  return (
    <span key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "7px 0", fontSize: 10.5, color: on ? W.teams : W.body, fontWeight: on ? 700 : 500 }}>
      <Icon name={icon} size={19} stroke={on ? 2.1 : 1.7} />
      {label}
    </span>
  );
}

export function TeamsFigure({ chat = PRINTER_CHAT, focus, title = "Microsoft Teams: a chat", note, what }: { chat?: TeamsExample; focus?: TeamsPart[]; title?: string; note?: string; what?: Partial<Record<TeamsPart, string>> }) {
  const info = infoWith(TEAMS_PARTS, what);
  const list = chat.group && !CHAT_LIST.some((c) => c.name === chat.name) ? [{ name: chat.name, preview: chat.lines[chat.lines.length - 1]?.text ?? "", time: chat.lines[chat.lines.length - 1]?.time ?? "", presence: "available" as const, group: true }, ...CHAT_LIST.slice(0, 3)] : CHAT_LIST;
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={720}>
      <AppWindow app="Microsoft Teams" colour={W.teams}>
        <div style={{ display: "flex", minHeight: 330 }}>
          <div style={{ width: 96, flexShrink: 0, padding: "10px 6px 10px 30px", background: "#ebebf3", borderRight: `1px solid ${W.edge}`, borderRadius: "0 0 0 8px" }}>
            <Part k="rail" badge="left">
              <div>
                {railItem("bell", "Activity")}
                {railItem("chat", "Chat", true)}
                {railItem("teams", "Teams")}
                {railItem("calendar", "Calendar")}
                {railItem("phone", "Calls")}
              </div>
            </Part>
          </div>
          <div style={{ width: 236, flexShrink: 0, padding: "10px 8px 10px 38px", background: "#fafafa", borderRight: `1px solid ${W.edge}` }}>
            <b style={{ display: "block", fontSize: 16, padding: "2px 4px 10px" }}>Chat</b>
            <Part k="list" holds={["unread", "presence"]} badge="top">
              <div style={{ display: "grid", gap: 2 }}>
                {list.map((c, i) => {
                  const on = c.name === chat.name;
                  const avatar = c.group ? (
                    <span style={{ width: 30, height: 30, borderRadius: 7, background: W.teamsSoft, color: W.teams, display: "inline-flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon name="people" size={17} />
                    </span>
                  ) : (
                    <Avatar name={c.name} colour={avatarColour(c.name)} size={30} presence={c.presence} />
                  );
                  const body = (
                    <span style={{ display: "flex", gap: 8, alignItems: "center", padding: "6px 6px", borderRadius: 6, background: on ? "#fff" : "transparent", boxShadow: on ? "0 1px 3px rgba(0,0,0,0.12)" : "none" }}>
                      {i === 0 && !c.group ? (
                        <Part k="presence" block={false} badge="left">
                          {avatar}
                        </Part>
                      ) : (
                        avatar
                      )}
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: "flex", justifyContent: "space-between", gap: 4, fontSize: 13, fontWeight: c.unread ? 700 : 500 }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
                          <span style={{ fontSize: 11, color: W.muted, fontWeight: 400 }}>{c.time}</span>
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ flex: 1, minWidth: 0, fontSize: 12, color: c.unread ? W.ink : W.muted, fontWeight: c.unread ? 600 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.preview}</span>
                          {c.unread && <b style={{ minWidth: 16, height: 16, borderRadius: 8, background: W.teams, color: "#fff", fontSize: 10.5, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{c.unread}</b>}
                        </span>
                      </span>
                    </span>
                  );
                  return c.unread ? (
                    <Part key={c.name} k="unread" badge="left">
                      {body}
                    </Part>
                  ) : (
                    <div key={c.name}>{body}</div>
                  );
                })}
              </div>
            </Part>
          </div>
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "10px 14px 8px 46px", borderBottom: `1px solid ${W.edge}` }}>
              <Part k="header" style={{ justifySelf: "start", display: "inline-block", paddingRight: 8 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 15, fontWeight: 700 }}>
                  {chat.group ? (
                    <span style={{ width: 26, height: 26, borderRadius: 6, background: W.teamsSoft, color: W.teams, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon name="people" size={15} />
                    </span>
                  ) : (
                    <Avatar name={chat.name} colour={avatarColour(chat.name)} size={26} />
                  )}
                  {chat.name}
                  <span style={{ marginLeft: 8, fontSize: 13, color: W.teams, borderBottom: `2px solid ${W.teams}` }}>Chat</span>
                </span>
              </Part>
            </div>
            <div style={{ flex: 1, padding: "12px 14px 12px 46px", background: "#f5f5f5" }}>
              <Part k="messages">
                <div style={{ display: "grid", gap: 8 }}>
                  {chat.lines.map((l, i) => {
                    const mine = l.who === "You";
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: mine ? "flex-end" : "flex-start", gap: 8 }}>
                        {!mine && <Avatar name={l.who} colour={avatarColour(l.who)} size={26} />}
                        <div style={{ maxWidth: "80%" }}>
                          <div style={{ fontSize: 11.5, color: W.muted, textAlign: mine ? "right" : "left", marginBottom: 2 }}>
                            {!mine && <b style={{ color: W.body, fontWeight: 600, marginRight: 6 }}>{l.who}</b>}
                            {l.time}
                          </div>
                          <div style={{ padding: "6px 10px", borderRadius: 7, background: mine ? W.teamsSoft : "#fff", boxShadow: mine ? "none" : "0 1px 2px rgba(0,0,0,0.08)", fontSize: 13.5, lineHeight: 1.45 }}>{l.text}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Part>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 46px 12px 46px", borderTop: `1px solid ${W.edge}` }}>
              <Part k="compose" style={{ flex: 1, minWidth: 0 }}>
                <div style={{ minHeight: 34, padding: "7px 10px", border: `1px solid ${W.edge}`, borderBottom: `2px solid ${W.teams}`, borderRadius: 5, fontSize: 13.5, color: chat.draft ? W.ink : W.faint, background: W.page }}>{chat.draft ?? "Type a message"}</div>
              </Part>
              <Part k="send" block={false} badge="right">
                <span style={{ display: "inline-flex", color: W.teams, padding: 4 }}>
                  <Icon name="send" size={20} />
                </span>
              </Part>
            </div>
          </div>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── before you join: Teams, and Zoom ───────────────────────────────── */

export type JoinPart = "meeting" | "preview" | "camera" | "mic" | "audio" | "join";

export const JOIN_PARTS: Record<JoinPart, PartInfo> = {
  meeting: { n: 1, name: "The meeting", what: "Which meeting you're joining, and when. Check it's the right one." },
  preview: { n: 2, name: "Your picture", what: "What the others will see when you go in: you, or just your initials when the camera is off." },
  camera: { n: 3, name: "Camera switch", what: "On shows your face. Set it before you join, the way the invite asks." },
  mic: { n: 4, name: "Microphone switch", what: "Off means muted: nobody hears you, or the noise around you, until you switch it on." },
  audio: { n: 5, name: "Computer audio", what: "Sound through your computer or headset. The usual choice at a desk." },
  join: { n: 6, name: "Join now", what: "Goes into the meeting with the settings you've chosen." },
};

export function PreJoinFigure({ zoom, camera = false, mic = true, focus, title, note, what }: { zoom?: boolean; camera?: boolean; mic?: boolean; focus?: JoinPart[]; title?: string; note?: string; what?: Partial<Record<JoinPart, string>> }) {
  const zoomWhat: Partial<Record<JoinPart, string>> = zoom
    ? {
        camera: "Zoom calls it Start video and Stop video. A tick in \"Turn off my video\" joins with the camera off.",
        mic: "Zoom calls it Mute and Unmute. A tick in \"Mute my microphone\" joins muted.",
        audio: "\"Join with Computer Audio\": Zoom asks this as you go in. Say yes, or nobody can hear you.",
        join: "Zoom's button just says Join.",
      }
    : {};
  const info = infoWith(JOIN_PARTS, { ...zoomWhat, ...what });
  const colour = zoom ? "#0b5cff" : W.teams;
  const toggle = (on: boolean) => (
    <span style={{ position: "relative", width: 36, height: 20, flexShrink: 0, borderRadius: 10, background: on ? colour : W.page, border: `1.5px solid ${on ? colour : W.muted}` }}>
      <span style={{ position: "absolute", top: 3, left: on ? 18 : 3, width: 11, height: 11, borderRadius: "50%", background: on ? "#fff" : W.muted }} />
    </span>
  );
  const tick = (on: boolean) => (
    <span style={{ width: 16, height: 16, flexShrink: 0, borderRadius: 3, border: `1.5px solid ${on ? colour : W.muted}`, background: on ? colour : W.page, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>{on && <Icon name="check" size={12} stroke={3} />}</span>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title ?? (zoom ? "Joining a Zoom meeting" : "Before you join a Teams call")} note={note}>
      <AppWindow app={zoom ? "Zoom" : "Microsoft Teams"} colour={colour}>
        <div style={{ padding: "16px 40px 18px 52px", background: zoom ? W.page : "#f5f5f5", borderRadius: "0 0 8px 8px", display: "grid", gap: 14 }}>
          <Part k="meeting" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div>
              <b style={{ display: "block", fontSize: 18 }}>{zoom ? "Kent Bakery: Christmas orders" : "Rota walk-through"}</b>
              <span style={{ fontSize: 13, color: W.muted }}>{zoom ? "Meeting ID 000 000 0000 · Thursday 12 November, 15:00" : "Wednesday 11 November, 14:00 to 14:30"}</span>
            </div>
          </Part>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
            <div style={{ flex: "1 1 260px", minWidth: 0, background: W.page, borderRadius: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.1)" }}>
              <Part k="preview" badge="left" style={{ borderRadius: "8px 8px 0 0" }}>
                <div style={{ position: "relative", aspectRatio: "16 / 9", background: W.call, borderRadius: "8px 8px 0 0", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {camera ? <CameraPicture colour="#8a4fd8" /> : <Avatar name="You" colour={avatarColour("you@northfieldsupplies.example")} size={56} />}
                  {!camera && <span style={{ position: "absolute", left: 0, right: 0, bottom: 8, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.8)" }}>Your camera is off</span>}
                </div>
              </Part>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 14, padding: "10px 12px" }}>
                <Part k="camera" block={false} badge="left">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, whiteSpace: "nowrap", paddingRight: 4 }}>
                    {zoom ? tick(!camera) : <Icon name={camera ? "video" : "videoOff"} size={18} />}
                    {zoom ? "Turn off my video" : <>{toggle(camera)} Camera {camera ? "on" : "off"}</>}
                  </span>
                </Part>
                {zoom && (
                  <Part k="mic" block={false} badge="right">
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, whiteSpace: "nowrap", paddingRight: 4 }}>
                      {tick(!mic)} Mute my microphone
                    </span>
                  </Part>
                )}
              </div>
            </div>
            <div style={{ flex: "1 1 200px", minWidth: 0, background: W.page, borderRadius: 8, boxShadow: "0 1px 6px rgba(0,0,0,0.1)", padding: 10, display: "grid", gap: 10, alignContent: "start" }}>
              <Part k="audio">
                <div style={{ padding: "8px 10px", borderRadius: 6, background: zoom ? "#e8efff" : W.teamsSoft, fontSize: 13.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                  {zoom ? <Icon name="speaker" size={17} /> : <span style={{ width: 14, height: 14, borderRadius: "50%", border: `2px solid ${colour}`, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: colour }} /></span>}
                  {zoom ? "Join with Computer Audio" : "Computer audio"}
                </div>
              </Part>
              {!zoom && (
                <Part k="mic" style={{ justifySelf: "start" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5, paddingRight: 6, whiteSpace: "nowrap" }}>
                    <Icon name={mic ? "mic" : "micOff"} size={18} /> {toggle(mic)} Microphone {mic ? "on" : "off"}
                  </span>
                </Part>
              )}
              {!zoom && <span style={{ fontSize: 12.5, color: W.muted, paddingLeft: 4 }}>Phone audio · Don&apos;t use audio</span>}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            <FakeButton>Cancel</FakeButton>
            <Part k="join" block={false} badge="right">
              <FakeButton primary colour={colour}>
                {zoom ? "Join" : "Join now"}
              </FakeButton>
            </Part>
          </div>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── in the call ────────────────────────────────────────────────────── */

export type CallPart = "title" | "them" | "you" | "chat" | "raise" | "camera" | "mic" | "share" | "leave" | "sharebar";

export const CALL_PARTS: Record<CallPart, PartInfo> = {
  title: { n: 1, name: "Meeting and timer", what: "Which meeting you're in, and how long it's been going." },
  them: { n: 2, name: "The others", what: "Everyone else in the call: their camera picture, or their initials." },
  you: { n: 3, name: "You", what: "Your own picture, small, so you can see what they see. A crossed-out mic means you're muted." },
  chat: { n: 4, name: "Chat", what: "Type to everyone in the meeting without talking over anyone: a link, or \"you've frozen\"." },
  raise: { n: 5, name: "Raise", what: "Puts a hand up next to your name when you want to speak." },
  camera: { n: 6, name: "Camera", what: "Click to turn your camera on or off. A line through it means it's off." },
  mic: { n: 7, name: "Mic", what: "Click to mute or unmute. A line through it means nobody can hear you." },
  share: { n: 8, name: "Share", what: "Shows the others something on your screen: one window, or the whole screen." },
  leave: { n: 9, name: "Leave", what: "Leaves the call. The meeting carries on for everyone else." },
  sharebar: { n: 10, name: "You're sharing", what: "A red bar while you share, saying exactly what the others can see. Stop sharing ends it." },
};

export function CallFigure({ mic = false, camera = true, sharing, focus, title = "In a Teams call", note, what }: { mic?: boolean; camera?: boolean; sharing?: string; focus?: CallPart[]; title?: string; note?: string; what?: Partial<Record<CallPart, string>> }) {
  const info = infoWith<CallPart>(CALL_PARTS, what, sharing ? [] : ["sharebar"]);
  const btn = (k: CallPart, icon: IconName, label: string, on?: boolean) => (
    <Part k={k} block={false} badge="top">
      <span style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2, minWidth: 46, padding: "4px 4px", borderRadius: 5, background: on ? "rgba(255,255,255,0.13)" : "transparent", fontSize: 10.5, color: "#fff" }}>
        <Icon name={icon} size={18} />
        {label}
      </span>
    </Part>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={660}>
      <AppWindow app="Microsoft Teams" colour={W.teams}>
        <div style={{ background: W.call, color: "#fff", borderRadius: "0 0 8px 8px", padding: "34px 40px 16px 46px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", background: "#2b2b2b", borderRadius: 6 }}>
            <Part k="title" style={{ flex: 1, minWidth: 0, marginRight: 8 }}>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600 }}>
                Rota walk-through
                <span style={{ display: "block", fontSize: 11.5, fontWeight: 400, color: "rgba(255,255,255,0.7)" }}>04:12</span>
              </span>
            </Part>
            {btn("chat", "chat", "Chat")}
            {btn("raise", "hand", "Raise")}
            <span style={{ width: 1, height: 30, background: "#4a4a4a", margin: "0 2px" }} />
            {btn("camera", camera ? "video" : "videoOff", "Camera", camera)}
            {btn("mic", mic ? "mic" : "micOff", "Mic", mic)}
            {btn("share", "share", "Share", !!sharing)}
            <Part k="leave" block={false} badge="top">
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, minHeight: 32, padding: "0 10px", borderRadius: 5, background: "#c4314b", fontSize: 12.5, fontWeight: 700 }}>
                <Icon name="leave" size={15} /> Leave
              </span>
            </Part>
          </div>
          {sharing && (
            <Part k="sharebar" style={{ marginTop: 8 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexWrap: "wrap", gap: 10, padding: "6px 10px", background: "#c4314b", borderRadius: 4, fontSize: 12.5 }}>
                You&apos;re sharing: <b>{sharing}</b>
                <span style={{ padding: "2px 8px", border: "1px solid rgba(255,255,255,0.8)", borderRadius: 3, fontWeight: 700 }}>Stop sharing</span>
              </div>
            </Part>
          )}
          <div style={{ position: "relative", display: "flex", gap: 10, marginTop: 12, minHeight: 210 }}>
            <Part k="them" style={{ flex: 1, minWidth: 0 }}>
              <div style={{ position: "relative", height: "100%", minHeight: 210, borderRadius: 8, overflow: "hidden", background: "#3b3a39" }}>
                {sharing ? (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                    <div style={{ width: "80%", aspectRatio: "16 / 9", background: "#fff", borderRadius: 4, overflow: "hidden", display: "grid", gridTemplateRows: "14px 1fr" }}>
                      <span style={{ background: W.excel }} />
                      <span style={{ backgroundImage: `linear-gradient(${W.edge} 1px, transparent 1px), linear-gradient(90deg, ${W.edge} 1px, transparent 1px)`, backgroundSize: "40px 16px" }} />
                    </div>
                  </div>
                ) : (
                  <CameraPicture colour={avatarColour("emma.clarke@northfieldsupplies.example")} />
                )}
                <span style={{ position: "absolute", left: 8, bottom: 8, padding: "2px 7px", borderRadius: 4, background: "rgba(0,0,0,0.55)", fontSize: 12 }}>{sharing ? "What Emma sees" : "Emma Clarke"}</span>
              </div>
            </Part>
            <Part k="you" badge="right" style={{ position: "absolute", right: 10, bottom: 10, width: 128 }}>
              <div style={{ position: "relative", aspectRatio: "16 / 10", borderRadius: 6, overflow: "hidden", background: "#2b2b2b", boxShadow: "0 4px 14px rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {camera ? <CameraPicture colour="#8a4fd8" /> : <Avatar name="You" colour="#8a4fd8" size={34} />}
                <span style={{ position: "absolute", left: 4, bottom: 4, display: "inline-flex", alignItems: "center", gap: 3, padding: "1px 5px", borderRadius: 3, background: "rgba(0,0,0,0.6)", fontSize: 10.5 }}>
                  {!mic && <Icon name="micOff" size={11} />}You
                </span>
              </div>
            </Part>
          </div>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── the Share tray ─────────────────────────────────────────────────── */

export type TrayPart = "screen" | "window" | "private";

export const TRAY_PARTS: Record<TrayPart, PartInfo> = {
  screen: { n: 1, name: "Your whole screen", what: "Everything on it: every window, every pop-up, any private email that's open. Rarely the right choice." },
  window: { n: 2, name: "One window", what: "Only that window, like the rota in Excel. Nothing else on your screen shows. Usually the right choice." },
  private: { n: 3, name: "A window to keep to yourself", what: "Your email, with something private in it. Never share it. Close it first if you can." },
};

function MiniWindow({ app }: { app: "excel" | "outlook" }) {
  return (
    <span style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", borderRadius: 3, overflow: "hidden", background: "#fff" }}>
      <span style={{ height: 9, background: app === "excel" ? W.excel : W.outlook, flexShrink: 0 }} />
      {app === "excel" ? (
        <span style={{ flex: 1, backgroundImage: `linear-gradient(${W.edge} 1px, transparent 1px), linear-gradient(90deg, ${W.edge} 1px, transparent 1px)`, backgroundSize: "22px 10px" }} />
      ) : (
        <span style={{ flex: 1, display: "flex" }}>
          <span style={{ width: "28%", background: W.chrome }} />
          <span style={{ flex: 1, display: "grid", alignContent: "start", gap: 4, padding: 6 }}>
            {[70, 90, 80, 55].map((n, i) => (
              <span key={i} style={{ display: "block", height: 3, width: `${n}%`, borderRadius: 2, background: i === 0 ? "#a4262c" : W.edge }} />
            ))}
          </span>
        </span>
      )}
    </span>
  );
}

function Thumb({ children, label }: { children: ReactNode; label: string }) {
  return (
    <span style={{ display: "grid", gap: 5, padding: 6, borderRadius: 7, background: "#3a3a3a", color: "#fff", width: 160 }}>
      <span style={{ display: "block", aspectRatio: "16 / 10" }}>{children}</span>
      <span style={{ fontSize: 11.5, lineHeight: 1.3 }}>{label}</span>
    </span>
  );
}

export function ShareTrayFigure({ focus, title = "Share: what the others will see", note, what }: { focus?: TrayPart[]; title?: string; note?: string; what?: Partial<Record<TrayPart, string>> }) {
  const info = infoWith(TRAY_PARTS, what);
  const label: CSSProperties = { fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", margin: "10px 0 6px" };
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={470}>
      <div style={{ display: "inline-block", padding: "14px 40px 16px 44px", borderRadius: 10, background: "#2b2b2b", color: "#fff", boxShadow: W.float }}>
        <b style={{ fontSize: 14.5 }}>Share content</b>
        <p style={label}>Screen</p>
        <Part k="screen" block={false} style={{ borderRadius: 7 }}>
          <Thumb label="Screen 1 (your whole screen)">
            <span style={{ position: "relative", display: "block", width: "100%", height: "100%", borderRadius: 3, overflow: "hidden", background: W.desktop }}>
              <span style={{ position: "absolute", left: "5%", top: "8%", width: "55%", height: "66%" }}>
                <MiniWindow app="excel" />
              </span>
              <span style={{ position: "absolute", left: "40%", top: "22%", width: "55%", height: "66%", boxShadow: "0 3px 8px rgba(0,0,0,0.4)" }}>
                <MiniWindow app="outlook" />
              </span>
            </span>
          </Thumb>
        </Part>
        <p style={label}>Window</p>
        <span style={{ display: "flex", flexWrap: "wrap", gap: 30 }}>
          <Part k="window" block={false} style={{ borderRadius: 7 }}>
            <Thumb label="Excel · Rota w/c 16 November.xlsx">
              <MiniWindow app="excel" />
            </Thumb>
          </Part>
          <Part k="private" block={false} badge="right" style={{ borderRadius: 7 }}>
            <Thumb label="Outlook · Private: your salary">
              <MiniWindow app="outlook" />
            </Thumb>
          </Part>
        </span>
      </div>
    </FigureFrame>
  );
}

/* ── the actions email ──────────────────────────────────────────────── */

export type ActionsPart = "to" | "subject" | "opening" | "who" | "what" | "when" | "signoff";

export const ACTIONS_PARTS: Record<ActionsPart, PartInfo> = {
  to: { n: 1, name: "To", what: "Everyone who has an action, so each of them has it in writing. Others from the meeting can go on Cc." },
  subject: { n: 2, name: "Subject", what: "Says which meeting, so anyone can find it later by searching." },
  opening: { n: 3, name: "One opening line", what: "Says what this is: the actions from the meeting, and when it was." },
  who: { n: 4, name: "Who", what: "One named person per action. \"Someone\" or \"we\" means nobody does it." },
  what: { n: 5, name: "What", what: "The job, in a few words, starting with a doing word: recount, chase, update." },
  when: { n: 6, name: "By when", what: "A real day, like Friday 13 November. Never \"soon\" or \"next week\"." },
  signoff: { n: 7, name: "Sign-off", what: "Thanks, and your name, as on any work email." },
};

export interface ActionRow {
  who: string;
  what: string;
  when: string;
}

export const REVIEW_ACTIONS: ActionRow[] = [
  { who: "Sarah", what: "Ring Kent Flour Mills about the late vans", when: "Thursday 12 November" },
  { who: "Emma", what: "Move the early shift to start at 07:30", when: "Friday 13 November" },
  { who: "Me", what: "Add a Late column to the delivery log", when: "Wednesday 11 November" },
];

export function ActionsFigure({ actions = REVIEW_ACTIONS, to = "Sarah Patel; Emma Clarke", cc = "Daniel Okafor", subject = "Actions from the late deliveries review", opening = "Here are the actions from this morning's late deliveries review:", focus, title = "An email with a meeting's actions", note, what }: { actions?: ActionRow[]; to?: string; cc?: string; subject?: string; opening?: string; focus?: ActionsPart[]; title?: string; note?: string; what?: Partial<Record<ActionsPart, string>> }) {
  const info = infoWith(ACTIONS_PARTS, what);
  const field: CSSProperties = { display: "flex", alignItems: "center", gap: 10, minHeight: 36, padding: "4px 10px", borderBottom: `1px solid ${W.edge}`, fontSize: 14 };
  const lab: CSSProperties = { width: 52, flexShrink: 0, color: W.muted };
  const cell: CSSProperties = { display: "flex", alignItems: "center", height: 58, padding: "0 10px", borderBottom: `1px solid ${W.edge}`, fontSize: 14, lineHeight: 1.35, overflow: "hidden" };
  const head: CSSProperties = { ...cell, height: 34, background: W.chrome, fontWeight: 700, fontSize: 13 };
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={600}>
      <AppWindow app="Outlook" colour={W.outlook} title="New message">
        <div style={{ display: "flex", gap: 10, padding: "10px 12px 10px 52px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <FakeButton primary>
            <Icon name="send" size={15} /> Send
          </FakeButton>
        </div>
        <div style={{ padding: "4px 20px 0 52px" }}>
          <Part k="to" holds={[]}>
            <div>
              <div style={field}>
                <span style={lab}>To</span>
                {to}
              </div>
              <div style={field}>
                <span style={lab}>Cc</span>
                {cc}
              </div>
            </div>
          </Part>
          <Part k="subject">
            <div style={field}>
              <span style={lab}>Subject</span>
              <b style={{ fontWeight: 600 }}>{subject}</b>
            </div>
          </Part>
        </div>
        <div style={{ padding: "14px 24px 20px 52px", display: "grid", gap: 10, fontSize: 15, lineHeight: 1.55 }}>
          <div>Hi Sarah and Emma,</div>
          <Part k="opening">
            <div>{opening}</div>
          </Part>
          <div style={{ display: "grid", gridTemplateColumns: "minmax(70px, 0.6fr) minmax(0, 2fr) minmax(0, 1.2fr)", border: `1px solid ${W.edge}`, borderRadius: 6, marginTop: 26 }}>
            <Part k="who" badge="top" style={{ borderRadius: 0 }}>
              <div>
                <div style={head}>Who</div>
                {actions.map((a) => (
                  <div key={a.who + a.what} style={{ ...cell, fontWeight: 600 }}>
                    {a.who}
                  </div>
                ))}
              </div>
            </Part>
            <Part k="what" badge="top" style={{ borderRadius: 0 }}>
              <div>
                <div style={head}>What</div>
                {actions.map((a) => (
                  <div key={a.what} style={cell}>
                    {a.what}
                  </div>
                ))}
              </div>
            </Part>
            <Part k="when" badge="top" style={{ borderRadius: 0 }}>
              <div>
                <div style={head}>By when</div>
                {actions.map((a) => (
                  <div key={a.what + a.when} style={cell}>
                    {a.when}
                  </div>
                ))}
              </div>
            </Part>
          </div>
          <Part k="signoff" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div style={{ whiteSpace: "pre-wrap" }}>{"Thanks,\nJordan"}</div>
          </Part>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}
