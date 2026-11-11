"use client";

import type { CSSProperties } from "react";
import { W } from "../../tokens";
import { Avatar, Icon, type IconName } from "../../office/apps/icons";
import { avatarColour } from "../../office/meetings";
import { AppWindow, FakeButton, FigureFrame, Part, type PartInfo } from "./parts";

/* Meetings, drawn the way Outlook shows them, every part numbered
 * (Module 3): an invite you've been sent, a meeting you're booking, and
 * the Scheduling Assistant that shows when everyone is free. */

/* Replace what a part's key says, and leave parts out, for one example. */
export function infoWith<K extends string>(parts: Record<K, PartInfo>, what: Partial<Record<K, string>> = {}, omit: K[] = []): Record<K, PartInfo> {
  return Object.fromEntries((Object.entries(parts) as [K, PartInfo][]).filter(([k]) => !omit.includes(k)).map(([k, p]) => [k, what[k] ? { ...p, what: what[k] } : p])) as Record<K, PartInfo>;
}

const ico = (name: IconName, size = 17) => (
  <span style={{ color: W.muted, display: "inline-flex", paddingTop: 2 }}>
    <Icon name={name} size={size} />
  </span>
);

const line: CSSProperties = { display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14.5, lineHeight: 1.5 };

/* ── an invite you've been sent ─────────────────────────────────────── */

export type InvitePart = "title" | "organiser" | "when" | "where" | "join" | "people" | "agenda" | "respond" | "yourday";

export const INVITE_PARTS: Record<InvitePart, PartInfo> = {
  title: { n: 1, name: "Title", what: "What the meeting is about. It's also the name it has in your calendar." },
  organiser: { n: 2, name: "Organiser", what: "Who's asking for the meeting. Your answer goes back to them." },
  when: { n: 3, name: "Date and time", what: "The day, when it starts and when it ends. Check your own calendar is free then." },
  where: { n: 4, name: "Location", what: "Where to go: a meeting room, or somewhere like the warehouse." },
  join: { n: 5, name: "Teams meeting", what: "It's a video call too. At the time, press Join to go in from your computer." },
  people: { n: 6, name: "Attendees", what: "Everyone else who's been asked to come." },
  agenda: { n: 9, name: "Agenda", what: "What the meeting is for. Read it before you go, and bring what it asks for." },
  respond: { n: 7, name: "Your answer", what: "Accept, Tentative (maybe), Decline, or Propose new time when you can't make it but should be there." },
  yourday: { n: 8, name: "Your calendar", what: "Your own day around the meeting, so you can see at a glance if you're free." },
};

export interface InviteExample {
  title: string;
  organiser: string;
  day: string; // "Wednesday 11 November"
  time: string; // "14:00 to 14:30"
  where?: string;
  teams?: boolean;
  people: string[];
  agenda: string[];
  /* Your calendar that day: [start hour as a number, length in hours, title]. The meeting itself is `meeting`. */
  mine: [number, number, string][];
  meeting: [number, number];
  from: number; // first hour drawn
  to: number;
}

export const ROTA_INVITE: InviteExample = {
  title: "Christmas rota planning",
  organiser: "Emma Clarke",
  day: "Tuesday 10 November",
  time: "11:00 to 11:30",
  where: "Room 1",
  teams: true,
  people: ["You", "Sarah Patel", "Daniel Okafor"],
  agenda: ["Who works which days over Christmas.", "Bring your holiday dates."],
  mine: [
    [9, 0.25, "Morning huddle"],
    [14, 1.5, "Order desk shadowing"],
  ],
  meeting: [11, 0.5],
  from: 9,
  to: 13,
};

const HOUR_PX = 34;

function MyDay({ ex }: { ex: InviteExample }) {
  const hours = Array.from({ length: ex.to - ex.from + 1 }, (_, i) => ex.from + i);
  const y = (h: number) => (h - ex.from) * HOUR_PX;
  const clash = ex.mine.some(([s, l]) => s < ex.meeting[0] + ex.meeting[1] && ex.meeting[0] < s + l);
  return (
    <div style={{ position: "relative", height: (ex.to - ex.from) * HOUR_PX, marginLeft: 42 }}>
      {hours.map((h) => (
        <div key={h} style={{ position: "absolute", left: -42, right: 0, top: y(h), borderTop: `1px solid ${W.edge}`, fontSize: 11, color: W.muted }}>
          <span style={{ position: "absolute", left: 0, top: -8, background: W.chrome, paddingRight: 4 }}>{`${String(h).padStart(2, "0")}:00`}</span>
        </div>
      ))}
      {ex.mine
        .filter(([s, l]) => s + l > ex.from && s < ex.to)
        .map(([s, l, t]) => (
          <div key={t} style={{ position: "absolute", left: s < ex.meeting[0] + ex.meeting[1] && ex.meeting[0] < s + l ? "52%" : 2, right: 2, top: y(Math.max(s, ex.from)) + 1, height: Math.max(16, (Math.min(s + l, ex.to) - Math.max(s, ex.from)) * HOUR_PX - 2), background: "#dbe8f8", borderLeft: `3px solid ${W.outlook}`, borderRadius: 3, fontSize: 11, lineHeight: "14px", padding: "1px 5px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
            {t}
          </div>
        ))}
      <div style={{ position: "absolute", left: 2, right: clash ? "50%" : 2, top: y(ex.meeting[0]) + 1, height: Math.max(16, ex.meeting[1] * HOUR_PX - 2), background: `repeating-linear-gradient(135deg, #ffffff 0 5px, #dbe8f8 5px 10px)`, border: `1px dashed ${clash ? "#c4314b" : W.outlook}`, borderRadius: 3, fontSize: 11, lineHeight: "14px", fontWeight: 600, padding: "1px 5px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
        {ex.title}
      </div>
    </div>
  );
}

export function InviteFigure({ invite = ROTA_INVITE, focus, title = "A meeting invite in Outlook", note, what, chosen }: { invite?: InviteExample; focus?: InvitePart[]; title?: string; note?: string; what?: Partial<Record<InvitePart, string>>; chosen?: "Accept" | "Tentative" | "Decline" | "Propose new time" }) {
  const omit: InvitePart[] = [...(invite.where ? [] : (["where"] as InvitePart[])), ...(invite.teams ? [] : (["join"] as InvitePart[]))];
  const info = infoWith(INVITE_PARTS, what, omit);
  const respond: [string, IconName, string][] = [
    ["Accept", "check", "#0e700e"],
    ["Tentative", "question", "#8a6d12"],
    ["Decline", "cross", "#c4314b"],
    ["Propose new time", "clock", W.outlook],
  ];
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={600}>
      <AppWindow app="Outlook" colour={W.outlook} title="Inbox">
        <div style={{ padding: "18px 22px 22px 52px", display: "grid", gap: 12 }}>
          <Part k="title" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{invite.title}</div>
          </Part>
          <Part k="organiser" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14.5 }}>
              <Avatar name={invite.organiser} colour={avatarColour(invite.organiser)} size={32} />
              <span>
                <b style={{ fontWeight: 600 }}>{invite.organiser}</b> <span style={{ color: W.muted }}>invited you</span>
              </span>
            </div>
          </Part>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 18, border: `1px solid ${W.edge}`, borderRadius: 8, padding: "14px 14px 14px 14px" }}>
            <div style={{ flex: "1 1 250px", display: "grid", gap: 10, minWidth: 0 }}>
              <Part k="when">
                <div style={line}>
                  {ico("clock")}
                  <span>
                    <b style={{ fontWeight: 600 }}>{invite.day}</b>, {invite.time}
                  </span>
                </div>
              </Part>
              {invite.where && (
                <Part k="where">
                  <div style={line}>
                    {ico("door")}
                    <span>{invite.where}</span>
                  </div>
                </Part>
              )}
              {invite.teams && (
                <Part k="join">
                  <div style={{ ...line, alignItems: "center" }}>
                    {ico("video")}
                    <span>Microsoft Teams meeting</span>
                    <FakeButton primary colour={W.teams}>
                      Join
                    </FakeButton>
                  </div>
                </Part>
              )}
              <Part k="people">
                <div style={line}>
                  {ico("people")}
                  <span>{[`${invite.organiser} (organiser)`, ...invite.people].join(", ")}</span>
                </div>
              </Part>
              <Part k="respond">
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 2 }}>
                  {respond.map(([label, icon, c]) => (
                    <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 32, padding: "4px 11px", borderRadius: 5, border: `1px solid ${chosen === label ? W.outlook : W.edge}`, background: chosen === label ? W.select : W.page, fontSize: 13.5, fontWeight: chosen === label ? 700 : 500, whiteSpace: "nowrap" }}>
                      <span style={{ color: c, display: "inline-flex" }}>
                        <Icon name={icon} size={15} stroke={2.4} />
                      </span>
                      {label}
                    </span>
                  ))}
                </div>
              </Part>
            </div>
            <Part k="yourday" badge="top" style={{ flex: "0 1 230px", minWidth: 190, alignSelf: "flex-start" }}>
              <div style={{ background: W.chrome, borderRadius: 6, padding: "10px 10px 12px" }}>
                <b style={{ display: "block", fontSize: 12.5, fontWeight: 600, color: W.muted, marginBottom: 10 }}>Your calendar</b>
                <MyDay ex={invite} />
              </div>
            </Part>
          </div>
          <Part k="agenda">
            <div style={{ display: "grid", gap: 6, fontSize: 15, lineHeight: 1.55 }}>
              {invite.agenda.map((a) => (
                <p key={a} style={{ margin: 0 }}>
                  {a}
                </p>
              ))}
            </div>
          </Part>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── a meeting you're booking ───────────────────────────────────────── */

export type BookPart = "send" | "title" | "attendees" | "time" | "teams" | "room" | "agenda" | "assistant";

export const BOOK_PARTS: Record<BookPart, PartInfo> = {
  send: { n: 1, name: "Send", what: "Sends the invite to everyone you've added. It goes in their calendars, waiting for their answer." },
  title: { n: 2, name: "Title", what: "What the meeting is about, in a few words. It's what people see in their calendar." },
  attendees: { n: 3, name: "Required attendees", what: "The people you need there. Start typing a name and Outlook suggests them." },
  time: { n: 4, name: "Date, start and end", what: "When it is and how long. Pick a time everyone is free." },
  teams: { n: 5, name: "Teams meeting", what: "Switched on, the invite gets a Join button, so people can come by video too." },
  room: { n: 6, name: "Location and rooms", what: "Browse rooms shows which meeting rooms are free at that time. Pick one and it's booked." },
  agenda: { n: 7, name: "Agenda", what: "One line on what the meeting is for, so people come ready." },
  assistant: { n: 8, name: "Scheduling Assistant", what: "Shows everyone's busy times side by side, so you can see when they're all free." },
};

export interface BookExample {
  title: string;
  attendees: string[];
  day: string;
  start: string;
  end: string;
  length: string;
  room?: string;
  agenda: string;
  teams?: boolean;
}

export const DELIVERY_REVIEW: BookExample = {
  title: "Late deliveries review",
  attendees: ["Sarah Patel", "Emma Clarke"],
  day: "Wednesday 11 November",
  start: "09:30",
  end: "10:00",
  length: "30 minutes",
  room: "Room 2",
  agenda: "Late deliveries in October: agree what to change.",
  teams: true,
};

const formRow: CSSProperties = { display: "flex", alignItems: "center", gap: 12, minHeight: 46, padding: "6px 12px", borderBottom: `1px solid ${W.edge}`, fontSize: 14.5 };
const pick = (text: string) => <span style={{ display: "inline-flex", alignItems: "center", gap: 6, minHeight: 30, padding: "2px 10px", border: `1px solid ${W.edge}`, borderRadius: 5, background: W.page, whiteSpace: "nowrap" }}>{text} <span style={{ fontSize: 10, color: W.muted }}>▼</span></span>;

export function BookingFigure({ meeting = DELIVERY_REVIEW, focus, title = "Booking a meeting in Outlook", note, what }: { meeting?: BookExample; focus?: BookPart[]; title?: string; note?: string; what?: Partial<Record<BookPart, string>> }) {
  const info = infoWith(BOOK_PARTS, what);
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={560}>
      <AppWindow app="Outlook" colour={W.outlook} title="New event">
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12, padding: "10px 46px 10px 52px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
          <Part k="send" block={false}>
            <FakeButton primary>
              <Icon name="send" size={15} /> Send
            </FakeButton>
          </Part>
          <Part k="teams" block={false} badge="top">
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, whiteSpace: "nowrap" }}>
              <span style={{ position: "relative", width: 36, height: 20, borderRadius: 10, background: meeting.teams ? W.teams : W.page, border: `1.5px solid ${meeting.teams ? W.teams : W.muted}` }}>
                <span style={{ position: "absolute", top: 3, left: meeting.teams ? 18 : 3, width: 11, height: 11, borderRadius: "50%", background: meeting.teams ? "#fff" : W.muted }} />
              </span>
              Teams meeting
            </span>
          </Part>
          <span style={{ marginLeft: "auto", display: "inline-flex", gap: 14, alignItems: "center", fontSize: 14 }}>
            <b style={{ color: W.outlook, borderBottom: `3px solid ${W.outlook}`, paddingBottom: 3 }}>Event</b>
            <Part k="assistant" block={false} badge="top">
              <span style={{ whiteSpace: "nowrap" }}>Scheduling Assistant</span>
            </Part>
          </span>
        </div>
        <div style={{ padding: "4px 18px 18px 52px" }}>
          <Part k="title">
            <div style={{ ...formRow, fontSize: 18, fontWeight: 600 }}>
              {ico("pencil", 18)}
              {meeting.title}
            </div>
          </Part>
          <Part k="attendees">
            <div style={{ ...formRow, flexWrap: "wrap" }}>
              {ico("people", 18)}
              {meeting.attendees.map((p) => (
                <span key={p} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 10px 2px 3px", borderRadius: 14, background: W.select }}>
                  <Avatar name={p} colour={avatarColour(p)} size={22} />
                  {p}
                </span>
              ))}
            </div>
          </Part>
          <Part k="time">
            <div style={{ ...formRow, flexWrap: "wrap" }}>
              {ico("clock", 18)}
              {pick(meeting.day)}
              {pick(meeting.start)}
              <span style={{ color: W.muted }}>to</span>
              {pick(meeting.end)}
              <span style={{ fontSize: 13, color: W.muted }}>{meeting.length}</span>
            </div>
          </Part>
          <Part k="room">
            <div style={{ ...formRow, flexWrap: "wrap" }}>
              {ico("pin", 18)}
              {meeting.room ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 10px", borderRadius: 14, background: W.select }}>
                  <Icon name="door" size={14} /> {meeting.room}
                </span>
              ) : (
                <span style={{ color: W.faint }}>Add a location, or pick a room</span>
              )}
              <span style={{ marginLeft: "auto" }}>
                <FakeButton>
                  <Icon name="door" size={14} /> Browse rooms ▾
                </FakeButton>
              </span>
            </div>
          </Part>
          <Part k="agenda" style={{ marginTop: 12 }}>
            <div style={{ minHeight: 70, padding: "10px 12px", border: `1px solid ${W.edge}`, borderRadius: 6, fontSize: 15, lineHeight: 1.5 }}>{meeting.agenda || <span style={{ color: W.faint }}>Add an agenda: what the meeting is for</span>}</div>
          </Part>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

/* ── the Scheduling Assistant ───────────────────────────────────────── */

export type FindPart = "date" | "people" | "busy" | "rooms" | "slot" | "status";

export const FIND_PARTS: Record<FindPart, PartInfo> = {
  date: { n: 1, name: "The day and time", what: "The day you're looking at, and the meeting's start and end." },
  people: { n: 2, name: "Everyone invited", what: "One row for you and one for each person you've invited." },
  busy: { n: 3, name: "Busy", what: "A blue bar is a time that person is already booked. You can't see what it is, just that they're busy." },
  rooms: { n: 4, name: "Rooms", what: "The meeting rooms get rows too. A clear row is a free room." },
  slot: { n: 5, name: "Your meeting", what: "The box is your meeting. Click the timeline to move it. Green: everyone's free. Red: it clashes." },
  status: { n: 6, name: "Who's free", what: "Says in words whether everyone is free, or who is busy and when." },
};

export interface FindRow {
  name: string;
  busy: [number, number][]; // [start, end] in hours, 9.5 = 09:30
  room?: boolean;
}

export const REVIEW_ROWS: FindRow[] = [
  { name: "You (organiser)", busy: [[9, 9.25], [10.5, 11]] },
  { name: "Sarah Patel", busy: [[9, 9.25], [10, 12]] },
  { name: "Emma Clarke", busy: [[9, 9.25], [12, 13]] },
  { name: "Room 1", room: true, busy: [[10.5, 12]] },
  { name: "Room 2", room: true, busy: [[11.5, 12.5]] },
];

const SLOT_PX = 44; // per half hour
const fmt = (h: number) => `${String(Math.floor(h)).padStart(2, "0")}:${h % 1 ? "30" : "00"}`;

export function SchedulingFigure({ rows = REVIEW_ROWS, day = "Wednesday 11 November", start = 9.5, length = 0.5, from = 8.5, to = 13, focus, title = "The Scheduling Assistant", note, what }: { rows?: FindRow[]; day?: string; start?: number; length?: number; from?: number; to?: number; focus?: FindPart[]; title?: string; note?: string; what?: Partial<Record<FindPart, string>> }) {
  const info = infoWith(FIND_PARTS, what);
  const cols = (to - from) * 2;
  const x = (h: number) => (h - from) * 2 * SLOT_PX;
  const end = start + length;
  const busyAt = rows.filter((r) => r.busy.some(([s, e]) => s < end && start < e));
  const people = rows.filter((r) => !r.room);
  const rooms = rows.filter((r) => r.room);
  const clash = busyAt.filter((r) => !r.room);
  const NAME_W = 170;
  const rowH = 38;
  const lit = rows.findIndex((r) => r.busy.length > 0 && !r.room && r.name !== rows[0].name);
  const row = (r: FindRow, i: number) => (
    <div key={r.name} style={{ display: "flex", height: rowH, borderBottom: `1px solid ${W.edge}` }}>
      <div style={{ width: NAME_W, flexShrink: 0, display: "flex", alignItems: "center", gap: 8, padding: "0 10px", fontSize: 13.5, whiteSpace: "nowrap", overflow: "hidden" }}>
        {r.room ? <Icon name="door" size={16} style={{ color: W.muted }} /> : <Avatar name={r.name.replace(" (organiser)", "")} colour={avatarColour(r.name)} size={22} />}
        {r.name}
      </div>
      <div style={{ position: "relative", width: cols * SLOT_PX }}>
        {Array.from({ length: cols }, (_, c) => {
          const t = from + c / 2;
          return <span key={c} style={{ position: "absolute", left: c * SLOT_PX, top: 0, bottom: 0, width: SLOT_PX, borderLeft: `1px ${c % 2 ? "dotted" : "solid"} ${W.edge}`, background: t < 9 ? "repeating-linear-gradient(135deg, #f3f2f1 0 4px, #e9e7e5 4px 8px)" : "transparent" }} />;
        })}
        {r.busy.map(([s, e], j) => {
          const bar = <span style={{ display: "block", height: "100%", borderRadius: 3, background: "#2f6ab3" }} />;
          const style: CSSProperties = { position: "absolute", left: x(s) + 1, width: x(e) - x(s) - 2, top: 9, bottom: 9 };
          return i === lit && j === r.busy.length - 1 ? (
            <Part key={j} k="busy" badge="right" style={{ ...style, borderRadius: 3 }}>
              {bar}
            </Part>
          ) : (
            <span key={j} style={style}>
              {bar}
            </span>
          );
        })}
      </div>
    </div>
  );
  return (
    <FigureFrame info={info} focus={focus} title={title} note={note} minWidth={NAME_W + cols * SLOT_PX + 80}>
      <AppWindow app="Outlook" colour={W.outlook} title="New event · Scheduling Assistant">
        <div style={{ padding: "14px 40px 18px 52px", display: "grid", gap: 12 }}>
          <Part k="date" style={{ justifySelf: "start", paddingRight: 8 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, fontSize: 14 }}>
              {pick(day)}
              {pick(fmt(start))}
              <span style={{ color: W.muted }}>to</span>
              {pick(fmt(end))}
            </div>
          </Part>
          <Part k="status">
            <div style={{ padding: "8px 12px", borderRadius: 6, fontSize: 14, background: clash.length ? "#fde7e9" : "#dff6dd", color: clash.length ? "#a4262c" : "#0e5c0e" }}>
              {clash.length ? `Clash at ${fmt(start)} to ${fmt(end)}: ${clash.map((r) => r.name.replace(" (organiser)", "")).join(" and ")} ${clash.length > 1 ? "are" : "is"} busy.` : `Everyone is free ${fmt(start)} to ${fmt(end)}.`}
            </div>
          </Part>
          <div style={{ position: "relative", border: `1px solid ${W.edge}`, borderRadius: 6, overflow: "visible" }}>
            <div style={{ display: "flex", height: 28, borderBottom: `1px solid ${W.edge}`, background: W.chrome }}>
              <div style={{ width: NAME_W, flexShrink: 0 }} />
              <div style={{ position: "relative", width: cols * SLOT_PX }}>
                {Array.from({ length: Math.ceil(to - from) }, (_, i) => Math.ceil(from) + i)
                  .filter((h) => h < to)
                  .map((h) => (
                    <span key={h} style={{ position: "absolute", left: x(h) + 4, top: 6, fontSize: 11.5, color: W.muted }}>
                      {fmt(h)}
                    </span>
                  ))}
              </div>
            </div>
            <Part k="people" style={{ borderRadius: 0 }} holds={["busy"]}>
              <div>{people.map((r) => row(r, rows.indexOf(r)))}</div>
            </Part>
            <div style={{ padding: "4px 10px", fontSize: 11.5, fontWeight: 700, letterSpacing: "0.04em", color: W.muted, background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>ROOMS</div>
            <Part k="rooms" style={{ borderRadius: 0 }}>
              <div>{rooms.map((r) => row(r, rows.indexOf(r)))}</div>
            </Part>
            <Part k="slot" badge="right" style={{ position: "absolute", left: NAME_W + x(start), width: x(end) - x(start), top: 0, bottom: 0, pointerEvents: "none", zIndex: 2 }}>
              <span style={{ display: "block", height: "100%", border: `2px solid ${clash.length ? "#c4314b" : "#13a10e"}`, background: clash.length ? "rgba(196,49,75,0.10)" : "rgba(19,161,14,0.12)", borderRadius: 3 }} />
            </Part>
          </div>
        </div>
      </AppWindow>
    </FigureFrame>
  );
}

