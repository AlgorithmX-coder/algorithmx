"use client";

import { Fragment, useState, type CSSProperties, type ReactNode } from "react";
import { W } from "../../tokens";
import { CONTACTS, YOU } from "../northfield";
import {
  avatarColour,
  DAY_END,
  DAY_START,
  HALF_HOURS,
  ROOM_SEATS,
  WEEK,
  WORK_END,
  WORK_START,
  busyFor,
  calOf,
  clashes,
  dayLong,
  dayShort,
  fromMin,
  inMyDiary,
  lengthText,
  minutes,
  overlaps,
  timeRange,
  toMin,
  withCall,
  withResponse,
} from "../meetings";
import type { Action } from "../store";
import { newId } from "../store";
import type { InviteResponse, Meeting, OfficeState, Person, Slot } from "../types";
import { AppButton, Dialog, TitleBar } from "../ui";
import { Avatar, Icon, type IconName } from "./icons";
import type { OfficeAppProps } from "./registry";

/* The Outlook calendar, for Module 3 (criteria TM-1, TM-2): the work week
 * of Monday 9 November 2026 with the learner's own meetings; an invite to
 * Accept, mark Tentative, Decline or answer with a new time; a New event
 * form with attendees, date, start and end, a room picker, a Teams
 * meeting switch and an agenda; and the Scheduling Assistant, which lays
 * everyone's busy time on one timeline so the free slot shows. Everything
 * lives in the office record (calendar), where the jobs' checks read it. */

const HOUR = 52; // px per hour in the week grid
const SLOT_W = 34; // px per half hour in the Scheduling Assistant
const EVENT_BG = "#dbe8f8";
const BUSY = "#2f6ab3";
const HATCH = `repeating-linear-gradient(135deg, #ffffff 0 6px, ${EVENT_BG} 6px 12px)`;

interface Draft extends Slot {
  /* set when editing a meeting already sent */
  id?: string;
  title: string;
  attendees: Person[];
  room?: Person;
  place: string;
  teams: boolean;
  body: string;
}

const update = (dispatch: (a: Action) => void, fn: (s: OfficeState) => OfficeState) => dispatch({ type: "update", fn });

export default function Calendar({ state, dispatch, show, job }: OfficeAppProps) {
  const cal = calOf(state);
  const [view, setView] = useState<"week" | "day">("week");
  const [dayAt, setDayAt] = useState(cal.today);
  const [selected, setSelected] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [tab, setTab] = useState<"event" | "assistant">("event");
  const [toast, setToast] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<Meeting | null>(null);
  const [noTitle, setNoTitle] = useState(false);
  const open = cal.meetings.find((m) => m.id === selected) ?? null;
  const days = view === "week" ? [...WEEK] : [dayAt];
  const clock = /(\d{1,2}):(\d{2})/.exec(job.clock);
  const now = clock ? Number(clock[1]) * 60 + Number(clock[2]) : null;

  const startNew = (slot?: Slot) => {
    setDraft({ title: "", attendees: [], place: "", teams: true, body: "", ...(slot ?? { day: cal.today, start: "10:00", end: "10:30" }) });
    setTab("event");
    setSelected(null);
    setToast(null);
  };

  const edit = (m: Meeting) => {
    setDraft({ id: m.id, title: m.title, attendees: m.attendees, room: m.room, place: m.place ?? "", teams: m.teams, body: m.body, day: m.day, start: m.start, end: m.end });
    setTab("event");
  };

  const send = (force = false) => {
    if (!draft) return;
    if (!draft.title.trim() && !force) return setNoTitle(true);
    const invite = draft.attendees.length > 0;
    const m: Meeting = {
      id: draft.id ?? newId("meet"),
      title: draft.title.trim(),
      organiser: YOU,
      attendees: draft.attendees,
      room: draft.room,
      place: draft.room ? undefined : draft.place.trim() || undefined,
      teams: draft.teams,
      body: draft.body,
      day: draft.day,
      start: draft.start,
      end: draft.end,
      sent: invite,
      response: "accepted",
    };
    update(dispatch, (s) => {
      const c = calOf(s);
      const others = c.meetings.filter((x) => x.id !== m.id);
      return { ...s, calendar: { ...c, meetings: [...others, m] } };
    });
    setDraft(null);
    setNoTitle(false);
    setView("week");
    setSelected(m.id);
    setToast(invite ? `${draft.id ? "Update sent" : "Invite sent"} to ${names(m.attendees)}${m.room ? `, and ${m.room.name} is booked` : ""}.` : "Saved in your calendar.");
  };

  return (
    <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", background: W.page, fontFamily: W.font, color: W.ink }}>
      <style>{CALENDAR_CSS}</style>
      <TitleBar colour={W.outlook} app="Outlook" name="Calendar" />
      {draft ? (
        <EventForm state={state} draft={draft} setDraft={setDraft} tab={tab} setTab={setTab} onSend={() => send()} onDiscard={() => setDraft(null)} />
      ) : (
        <>
          {/* the ribbon */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "8px 10px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
            <AppButton primary onClick={() => startNew()}>
              <Icon name="plus" size={16} stroke={2.4} /> New event
            </AppButton>
            <AppButton
              onClick={() => {
                setDayAt(cal.today);
              }}
            >
              <Icon name="calendar" size={16} /> Today
            </AppButton>
            {view === "day" && (
              <span style={{ display: "inline-flex", gap: 2 }}>
                <IconBtn label="Previous day" icon="left" disabled={dayAt === WEEK[0]} onClick={() => setDayAt(WEEK[Math.max(0, WEEK.indexOf(dayAt as (typeof WEEK)[number]) - 1)])} />
                <IconBtn label="Next day" icon="right" disabled={dayAt === WEEK[4]} onClick={() => setDayAt(WEEK[Math.min(4, WEEK.indexOf(dayAt as (typeof WEEK)[number]) + 1)])} />
              </span>
            )}
            <b style={{ fontSize: 17, fontWeight: 600, marginLeft: 4 }}>{view === "week" ? "9 to 13 November 2026" : `${dayLong(dayAt)} 2026`}</b>
            <span role="group" aria-label="View" style={{ marginLeft: "auto", display: "inline-flex", border: `1px solid ${W.edge}`, borderRadius: 6, overflow: "hidden", background: W.page }}>
              {(["day", "week"] as const).map((v) => (
                <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className="of-btn" style={{ minHeight: 38, padding: "0 14px", border: "none", background: view === v ? W.select : "transparent", color: view === v ? W.outlook : W.ink, fontFamily: W.font, fontSize: 14.5, fontWeight: view === v ? 700 : 500, cursor: "pointer" }}>
                  {v === "day" ? "Day" : "Work week"}
                </button>
              ))}
            </span>
          </div>
          {toast && (
            <div role="status" style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 14px", background: "#dff6dd", color: "#0e5c0e", fontSize: 14.5, borderBottom: `1px solid ${W.edge}` }}>
              <Icon name="check" size={16} stroke={2.6} /> {toast}
              <button type="button" aria-label="Dismiss" onClick={() => setToast(null)} style={{ marginLeft: "auto", border: "none", background: "transparent", cursor: "pointer", color: "inherit", minHeight: 30, minWidth: 30 }}>
                <Icon name="cross" size={14} />
              </button>
            </div>
          )}
          <div style={{ flex: 1, minHeight: 0, display: "flex" }}>
            <MiniMonth today={cal.today} picked={view === "day" ? dayAt : null} onPick={(d) => { setDayAt(d); setView("day"); }} />
            <WeekGrid
              state={state}
              days={days}
              today={cal.today}
              now={now}
              selected={selected}
              onSelect={setSelected}
              onEmpty={(slot) => startNew(slot)}
              short={!!open}
            />
            {open && (
              <Peek
                meeting={open}
                state={state}
                onClose={() => setSelected(null)}
                onRespond={(r, p) => update(dispatch, (s) => withResponse(s, open.id, r, p))}
                onJoin={() => {
                  update(dispatch, (s) => withCall(s, open));
                  show("teams");
                }}
                onEdit={() => edit(open)}
                onCancel={() => setCancelling(open)}
              />
            )}
          </div>
        </>
      )}

      {noTitle && (
        <Dialog title="No title" onClose={() => setNoTitle(false)} width={480}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>This meeting has no title. People see the title first in their calendar, so it should say what the meeting is about.</p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <AppButton onClick={() => setNoTitle(false)}>Add a title</AppButton>
            <AppButton primary onClick={() => send(true)}>
              Send anyway
            </AppButton>
          </div>
        </Dialog>
      )}
      {cancelling && (
        <Dialog title="Cancel meeting" onClose={() => setCancelling(null)} width={480}>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>
            Cancel &ldquo;{cancelling.title || "(No title)"}&rdquo;? It comes out of your calendar, and {cancelling.attendees.length ? names(cancelling.attendees) : "everyone"} {cancelling.attendees.length === 1 ? "is" : "are"} told it&apos;s off.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18, flexWrap: "wrap" }}>
            <AppButton onClick={() => setCancelling(null)}>Keep it</AppButton>
            <AppButton
              primary
              colour="#c4314b"
              onClick={() => {
                const id = cancelling.id;
                update(dispatch, (s) => {
                  const c = calOf(s);
                  return { ...s, calendar: { ...c, meetings: c.meetings.filter((m) => m.id !== id) } };
                });
                setCancelling(null);
                setSelected(null);
                setToast("Meeting cancelled.");
              }}
            >
              Cancel meeting
            </AppButton>
          </div>
        </Dialog>
      )}
    </div>
  );
}

export const names = (people: Person[]) => {
  const n = people.map((p) => p.name);
  return n.length <= 1 ? n.join("") : `${n.slice(0, -1).join(", ")} and ${n[n.length - 1]}`;
};

function IconBtn({ label, icon, onClick, disabled }: { label: string; icon: IconName; onClick: () => void; disabled?: boolean }) {
  return (
    <button type="button" aria-label={label} title={label} onClick={onClick} disabled={disabled} className="of-btn" style={{ width: 40, height: 40, border: "none", borderRadius: 6, background: "transparent", color: W.ink, cursor: disabled ? "default" : "pointer", opacity: disabled ? 0.35 : 1 }}>
      <Icon name={icon} size={18} />
    </button>
  );
}

/* ── the month on the left ──────────────────────────────────────────── */

function MiniMonth({ today, picked, onPick }: { today: string; picked: string | null; onPick: (d: string) => void }) {
  /* November 2026 starts on a Sunday; weeks run Monday first. */
  const cells: (number | null)[] = [...Array(6).fill(null), ...Array.from({ length: 30 }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);
  const t = Number(today.slice(8));
  return (
    <nav aria-label="November 2026" style={{ width: 196, flexShrink: 0, padding: "12px 10px", borderRight: `1px solid ${W.edge}`, background: W.chrome, overflowY: "auto" }}>
      <b style={{ display: "block", padding: "2px 4px 8px", fontSize: 14, fontWeight: 600 }}>November 2026</b>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 1, textAlign: "center", fontSize: 12 }}>
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <span key={i} style={{ color: W.muted, padding: "3px 0" }}>
            {d}
          </span>
        ))}
        {cells.map((n, i) => {
          const day = n ? `2026-11-${String(n).padStart(2, "0")}` : "";
          const inWeek = !!n && n >= 9 && n <= 13;
          const isToday = n === t;
          return n ? (
            <button
              key={i}
              type="button"
              disabled={!inWeek}
              onClick={() => onPick(day)}
              aria-label={inWeek ? dayLong(day) : undefined}
              style={{ height: 24, border: "none", borderRadius: 12, padding: 0, fontFamily: W.font, fontSize: 12, cursor: inWeek ? "pointer" : "default", background: isToday ? W.outlook : picked === day ? W.select : inWeek ? "rgba(15,108,189,0.06)" : "transparent", color: isToday ? "#fff" : inWeek ? W.ink : W.faint, fontWeight: isToday ? 700 : 400 }}
            >
              {n}
            </button>
          ) : (
            <span key={i} />
          );
        })}
      </div>
      <b style={{ display: "block", margin: "18px 4px 6px", fontSize: 13, fontWeight: 600, color: W.muted }}>My calendars</b>
      {[
        ["Calendar", W.outlook],
        ["UK holidays", "#0e7a5a"],
        ["Birthdays", "#b4235a"],
      ].map(([n, c]) => (
        <span key={n} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 4px", fontSize: 13.5 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: n === "Calendar" ? c : "transparent", border: `2px solid ${c}` }} />
          {n}
        </span>
      ))}
    </nav>
  );
}

/* ── the week (or one day) ──────────────────────────────────────────── */

/* Side by side when meetings overlap, as Outlook lays them out. */
function columns(ms: Meeting[]) {
  const out = new Map<string, { col: number; cols: number }>();
  const sorted = [...ms].sort((a, b) => toMin(a.start) - toMin(b.start) || toMin(b.end) - toMin(a.end));
  let group: { m: Meeting; col: number }[] = [];
  let groupEnd = -1;
  const flush = () => {
    const n = Math.max(1, ...group.map((g) => g.col + 1));
    group.forEach((g) => out.set(g.m.id, { col: g.col, cols: n }));
    group = [];
    groupEnd = -1;
  };
  for (const m of sorted) {
    if (group.length && toMin(m.start) >= groupEnd) flush();
    const used = new Set(group.filter((g) => toMin(g.m.end) > toMin(m.start)).map((g) => g.col));
    let col = 0;
    while (used.has(col)) col++;
    group.push({ m, col });
    groupEnd = Math.max(groupEnd, toMin(m.end));
  }
  if (group.length) flush();
  return out;
}

function WeekGrid({ state, days, today, now, selected, onSelect, onEmpty, short }: { state: OfficeState; days: string[]; today: string; now: number | null; short?: boolean; selected: string | null; onSelect: (id: string) => void; onEmpty: (s: Slot) => void }) {
  const cal = calOf(state);
  const hours = Array.from({ length: (DAY_END - DAY_START) / 60 }, (_, i) => DAY_START / 60 + i);
  const top = (t: string) => ((toMin(t) - DAY_START) / 60) * HOUR;
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", borderBottom: `1px solid ${W.edge}`, paddingRight: 10 }}>
        <span style={{ width: 58, flexShrink: 0 }} />
        {days.map((d) => (
          <div key={d} style={{ flex: 1, minWidth: 0, padding: "8px 8px 6px", borderLeft: `1px solid ${W.edge}`, display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontSize: 22, fontWeight: d === today ? 700 : 400, color: d === today ? W.outlook : W.ink, lineHeight: 1 }}>{Number(d.slice(8))}</span>
            <span style={{ fontSize: 13.5, color: d === today ? W.outlook : W.muted, fontWeight: d === today ? 700 : 400, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{short ? dayLong(d).slice(0, 3) : dayLong(d).split(" ")[0]}</span>
          </div>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto", scrollbarGutter: "stable" }}>
        <div style={{ position: "relative", display: "flex", height: hours.length * HOUR }}>
          <div style={{ width: 58, flexShrink: 0 }}>
            {hours.map((h) => (
              <div key={h} style={{ height: HOUR, fontSize: 12, color: W.muted, textAlign: "right", padding: "0 8px", transform: "translateY(-7px)" }}>
                {h === DAY_START / 60 ? "" : `${String(h).padStart(2, "0")}:00`}
              </div>
            ))}
          </div>
          {days.map((d) => {
            const ms = cal.meetings.filter((m) => m.day === d && (inMyDiary(m) || m.response === "proposed"));
            const lay = columns(ms);
            return (
              <div key={d} style={{ position: "relative", flex: 1, minWidth: 0, borderLeft: `1px solid ${W.edge}` }}>
                {/* the half hours, shaded outside working hours; click one to book it */}
                {Array.from({ length: hours.length * 2 }, (_, i) => {
                  const start = DAY_START + i * 30;
                  const outside = start < WORK_START || start >= WORK_END;
                  return (
                    <button
                      key={i}
                      type="button"
                      aria-label={`New event, ${dayLong(d)} at ${fromMin(start)}`}
                      onClick={() => onEmpty({ day: d, start: fromMin(start), end: fromMin(start + 30) })}
                      className="cal-slot"
                      style={{ display: "block", width: "100%", height: HOUR / 2, padding: 0, border: "none", borderTop: i % 2 ? `1px dotted ${W.edge}` : `1px solid ${W.edge}`, background: outside ? W.chrome : "transparent", cursor: "pointer" }}
                    />
                  );
                })}
                {d === today && now !== null && now >= DAY_START && now <= DAY_END && (
                  <div aria-hidden style={{ position: "absolute", left: 0, right: 0, top: ((now - DAY_START) / 60) * HOUR, height: 2, background: "#c4314b", zIndex: 6, pointerEvents: "none" }}>
                    <span style={{ position: "absolute", left: -5, top: -4, width: 10, height: 10, borderRadius: "50%", background: "#c4314b" }} />
                  </div>
                )}
                {ms.map((m) => {
                  const p = lay.get(m.id) ?? { col: 0, cols: 1 };
                  const pending = !m.sent && m.organiser.address !== YOU.address && (m.response === "none" || m.response === undefined || m.response === "tentative");
                  const off = m.response === "proposed";
                  const h = Math.max(22, top(m.end) - top(m.start) - 2);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => onSelect(m.id)}
                      className="cal-event"
                      aria-label={`${m.title || "(No title)"}, ${dayLong(m.day)}, ${timeRange(m)}${pending ? ", not answered" : ""}`}
                      style={{
                        position: "absolute",
                        top: top(m.start) + 1,
                        height: h,
                        left: `calc(${(p.col / p.cols) * 100}% + 3px)`,
                        width: `calc(${100 / p.cols}% - 6px)`,
                        zIndex: selected === m.id ? 4 : 3,
                        overflow: "hidden",
                        textAlign: "left",
                        padding: h < 34 ? "2px 6px" : "4px 7px",
                        border: `1px solid ${off ? W.edge : "rgba(15,108,189,0.35)"}`,
                        borderLeft: `4px solid ${off ? W.faint : W.outlook}`,
                        borderRadius: 4,
                        background: off ? W.chrome : pending ? HATCH : EVENT_BG,
                        boxShadow: selected === m.id ? `0 0 0 2px ${W.outlook}` : "none",
                        fontFamily: W.font,
                        color: off ? W.muted : W.ink,
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ display: "block", fontSize: 13, fontWeight: 600, lineHeight: 1.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", textDecoration: off ? "line-through" : "none" }}>{m.title || "(No title)"}</span>
                      {h >= 40 && <span style={{ display: "block", fontSize: 12, lineHeight: 1.3, color: W.muted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.room?.name ?? m.place ?? (m.teams ? "Microsoft Teams meeting" : "")}</span>}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── one meeting, opened ────────────────────────────────────────────── */

function Row({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14.5, lineHeight: 1.45 }}>
      <span style={{ color: W.muted, paddingTop: 1 }}>
        <Icon name={icon} size={18} />
      </span>
      <div style={{ minWidth: 0, flex: 1 }}>{children}</div>
    </div>
  );
}

function Peek({ meeting: m, state, onClose, onRespond, onJoin, onEdit, onCancel }: { meeting: Meeting; state: OfficeState; onClose: () => void; onRespond: (r: InviteResponse, p?: Slot) => void; onJoin: () => void; onEdit: () => void; onCancel: () => void }) {
  const mine = m.organiser.address === YOU.address;
  return (
    <aside aria-label="Meeting details" style={{ width: 340, flexShrink: 0, borderLeft: `1px solid ${W.edge}`, overflowY: "auto", background: W.page, boxShadow: "-8px 0 24px -16px rgba(0,0,0,0.25)" }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "14px 12px 0 18px" }}>
        <h2 style={{ margin: 0, flex: 1, fontSize: 19, fontWeight: 600, lineHeight: 1.3 }}>{m.title || "(No title)"}</h2>
        <IconBtn label="Close" icon="cross" onClick={onClose} />
      </div>
      <div style={{ display: "grid", gap: 12, padding: "12px 18px 20px" }}>
        <Row icon="clock">
          {dayLong(m.day)}
          <br />
          <span style={{ color: W.muted }}>
            {timeRange(m)} ({lengthText(minutes(m))})
          </span>
        </Row>
        {(m.room || m.place) && <Row icon={m.room ? "door" : "pin"}>{m.room?.name ?? m.place}</Row>}
        {m.teams && (
          <Row icon="video">
            Microsoft Teams meeting
            <div style={{ marginTop: 6 }}>
              <AppButton primary colour={W.teams} onClick={onJoin}>
                <Icon name="video" size={16} /> Join
              </AppButton>
            </div>
          </Row>
        )}
        <Row icon="people">
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Avatar name={m.organiser.name} colour={avatarColour(m.organiser.address)} size={24} />
            <span>
              {m.organiser.name} <span style={{ color: W.muted }}>· Organiser</span>
            </span>
          </span>
          {m.attendees.map((p) => (
            <span key={p.address} style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
              <Avatar name={p.name} colour={avatarColour(p.address)} size={24} />
              <span>
                {p.address === YOU.address ? "You" : p.name}
                {mine && <span style={{ color: W.muted }}> · No reply yet</span>}
              </span>
            </span>
          ))}
        </Row>
        {m.body && (
          <Row icon="text">
            <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
          </Row>
        )}
        {mine ? (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", paddingTop: 4 }}>
            <AppButton onClick={onEdit}>
              <Icon name="pencil" size={16} /> Edit
            </AppButton>
            <AppButton onClick={onCancel}>
              <Icon name="cross" size={16} /> Cancel meeting
            </AppButton>
          </div>
        ) : (
          <Respond meeting={m} state={state} onRespond={onRespond} />
        )}
      </div>
    </aside>
  );
}

/* ── answering an invite: in the calendar, and in the inbox ─────────── */

const RESPONSES: { r: InviteResponse; label: string; icon: IconName; colour: string; said: string }[] = [
  { r: "accepted", label: "Accept", icon: "check", colour: "#0e700e", said: "You accepted. It's in your calendar, and the organiser knows you're coming." },
  { r: "tentative", label: "Tentative", icon: "question", colour: "#8a6d12", said: "You said maybe. It stays in your calendar, shaded, until you decide." },
  { r: "declined", label: "Decline", icon: "cross", colour: "#c4314b", said: "You declined. It's out of your calendar, and the organiser knows you can't come." },
];

export function Respond({ meeting: m, state, onRespond }: { meeting: Meeting; state: OfficeState; onRespond: (r: InviteResponse, p?: Slot) => void }) {
  const [proposing, setProposing] = useState(false);
  const r = m.response ?? "none";
  const said = RESPONSES.find((x) => x.r === r)?.said ?? (r === "proposed" && m.proposed ? `You proposed ${dayLong(m.proposed.day)}, ${timeRange(m.proposed)} instead. ${m.organiser.name.split(" ")[0]} can accept it or keep the time.` : null);
  return (
    <div>
      <div role="group" aria-label="Respond to the invite" style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {RESPONSES.map((x) => (
          <AppButton key={x.r} onClick={() => onRespond(x.r)} style={r === x.r ? { background: W.select, border: `1px solid ${W.outlook}`, fontWeight: 700 } : undefined}>
            <span style={{ color: x.colour }}>
              <Icon name={x.icon} size={16} stroke={2.4} />
            </span>
            {x.label}
          </AppButton>
        ))}
        <AppButton onClick={() => setProposing(true)} style={r === "proposed" ? { background: W.select, border: `1px solid ${W.outlook}`, fontWeight: 700 } : undefined}>
          <span style={{ color: W.outlook }}>
            <Icon name="clock" size={16} stroke={2.2} />
          </span>
          Propose new time
        </AppButton>
      </div>
      <p role="status" style={{ margin: "10px 0 0", fontSize: 14, lineHeight: 1.45, color: said ? W.body : W.muted }}>
        {said ?? `${m.organiser.name.split(" ")[0]} is waiting for your answer.`}
      </p>
      {proposing && (
        <Propose
          meeting={m}
          state={state}
          onCancel={() => setProposing(false)}
          onSend={(slot) => {
            onRespond("proposed", slot);
            setProposing(false);
          }}
        />
      )}
    </div>
  );
}

function Propose({ meeting: m, state, onCancel, onSend }: { meeting: Meeting; state: OfficeState; onCancel: () => void; onSend: (s: Slot) => void }) {
  const [slot, setSlot] = useState<Slot>(m.proposed ?? { day: m.day, start: m.start, end: m.end });
  const mine = busyFor(state, YOU, slot.day, m.id);
  const hit = mine.find((b) => overlaps(b, slot));
  return (
    <Dialog title="Propose a new time" onClose={onCancel} width={560}>
      <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.5 }}>
        Pick a time that suits you for <b>{m.title}</b>. {m.organiser.name.split(" ")[0]} will see it and can move the meeting.
      </p>
      <SlotPicker slot={slot} onChange={setSlot} />
      <div style={{ marginTop: 14, padding: "10px 12px", borderRadius: 6, background: W.chrome, fontSize: 14.5, lineHeight: 1.5 }}>
        <b style={{ fontWeight: 600 }}>Your calendar, {dayLong(slot.day)}</b>
        {mine.length === 0 ? (
          <div style={{ color: W.muted }}>Nothing booked.</div>
        ) : (
          mine.map((b, i) => (
            <div key={i} style={{ color: overlaps(b, slot) ? "#a4262c" : W.body }}>
              {timeRange(b)} · {b.title}
            </div>
          ))
        )}
      </div>
      <p role="status" style={{ margin: "10px 0 0", fontSize: 14.5, color: hit ? "#a4262c" : "#0e700e" }}>
        {hit ? `That clashes with ${hit.title}.` : "You're free then."}
      </p>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
        <AppButton onClick={onCancel}>Cancel</AppButton>
        <AppButton primary onClick={() => onSend(slot)}>
          <Icon name="send" size={16} /> Send proposal
        </AppButton>
      </div>
    </Dialog>
  );
}

const select: CSSProperties = { minHeight: 40, padding: "0 10px", border: `1px solid ${W.edge}`, borderRadius: 6, background: W.page, fontFamily: W.font, fontSize: 15, color: W.ink, cursor: "pointer" };

/* Date, start and end, in half hours. Moving the start keeps the length. */
function SlotPicker({ slot, onChange, compact }: { slot: Slot; onChange: (s: Slot) => void; compact?: boolean }) {
  const len = Math.max(30, minutes(slot));
  const setStart = (start: string) => onChange({ ...slot, start, end: fromMin(Math.min(DAY_END, toMin(start) + len)) });
  return (
    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, marginTop: compact ? 0 : 14 }}>
      <select aria-label="Date" value={slot.day} onChange={(e) => onChange({ ...slot, day: e.target.value })} style={select}>
        {WEEK.map((d) => (
          <option key={d} value={d}>
            {dayLong(d)}
          </option>
        ))}
      </select>
      <select aria-label="Start time" value={slot.start} onChange={(e) => setStart(e.target.value)} style={select}>
        {HALF_HOURS.slice(0, -1).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <span style={{ color: W.muted }}>to</span>
      <select aria-label="End time" value={slot.end} onChange={(e) => onChange({ ...slot, end: e.target.value })} style={select}>
        {HALF_HOURS.filter((t) => toMin(t) > toMin(slot.start)).map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <span style={{ fontSize: 14, color: W.muted }}>{lengthText(minutes(slot))}</span>
    </div>
  );
}

/* An invite as Outlook shows it in the reading pane: what, when, where,
 * the learner's own day around it, and the answers. Outlook draws this
 * above any email that carries an invite (Module 3). */
export function InviteCard({ state, dispatch, emailId }: { state: OfficeState; dispatch: (a: Action) => void; emailId: string }) {
  const m = calOf(state).meetings.find((x) => x.emailId === emailId);
  if (!m) return null;
  const around = busyFor(state, YOU, m.day, m.id);
  const from = Math.max(DAY_START, toMin(m.start) - 90);
  const to = Math.min(DAY_END, toMin(m.end) + 90);
  const px = 0.9;
  return (
    <section aria-label="Meeting invite" style={{ marginTop: 16, border: `1px solid ${W.edge}`, borderRadius: 8, overflow: "hidden" }}>
      <div style={{ display: "flex", flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 280px", padding: "14px 16px", display: "grid", gap: 10 }}>
          <Row icon="clock">
            <b style={{ fontWeight: 600 }}>{dayLong(m.day)}</b>, {timeRange(m)}
          </Row>
          {(m.room || m.place) && <Row icon={m.room ? "door" : "pin"}>{m.room?.name ?? m.place}</Row>}
          {m.teams && (
            <Row icon="video">
              Microsoft Teams meeting{" "}
              <button
                type="button"
                onClick={() => dispatch({ type: "update", fn: (s) => withCall(s, m) })}
                className="of-btn"
                style={{ marginLeft: 6, minHeight: 32, padding: "2px 12px", border: "none", borderRadius: 4, background: W.teams, color: "#fff", fontFamily: W.font, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
              >
                Join
              </button>
            </Row>
          )}
          <Row icon="people">
            {m.organiser.name} (organiser), {names(m.attendees.map((p) => (p.address === YOU.address ? { ...p, name: "you" } : p)))}
          </Row>
          <Respond meeting={m} state={state} onRespond={(r, p) => dispatch({ type: "update", fn: (s) => withResponse(s, m.id, r, p) })} />
        </div>
        {/* the learner's day around it */}
        <div aria-label="Your calendar" style={{ flex: "0 0 210px", padding: "12px 12px 12px 10px", background: W.chrome, borderLeft: `1px solid ${W.edge}` }}>
          <b style={{ display: "block", fontSize: 13, fontWeight: 600, color: W.muted, marginBottom: 6 }}>Your calendar</b>
          <div style={{ position: "relative", height: (to - from) * px, marginLeft: 40 }}>
            {Array.from({ length: Math.floor((to - from) / 60) + 1 }, (_, i) => Math.ceil(from / 60) * 60 + i * 60)
              .filter((t) => t <= to)
              .map((t) => (
                <div key={t} style={{ position: "absolute", left: -40, right: 0, top: (t - from) * px, borderTop: `1px solid ${W.edge}`, fontSize: 11, color: W.muted }}>
                  <span style={{ position: "absolute", left: 0, top: -7, background: W.chrome, paddingRight: 4 }}>{fromMin(t)}</span>
                </div>
              ))}
            {around
              .filter((b) => toMin(b.end) > from && toMin(b.start) < to)
              .map((b, i) => (
                <div key={i} style={{ position: "absolute", left: 2, right: 2, top: (Math.max(from, toMin(b.start)) - from) * px, height: Math.max(14, (Math.min(to, toMin(b.end)) - Math.max(from, toMin(b.start))) * px - 2), background: EVENT_BG, borderLeft: `3px solid ${W.outlook}`, borderRadius: 3, fontSize: 11.5, padding: "1px 5px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
                  {b.title}
                </div>
              ))}
            <div style={{ position: "absolute", left: 2, right: 2, top: (toMin(m.start) - from) * px, height: Math.max(14, minutes(m) * px - 2), background: HATCH, border: `1px dashed ${W.outlook}`, borderRadius: 3, fontSize: 11.5, fontWeight: 600, padding: "1px 5px", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>
              {m.title}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── a new meeting: the form and the Scheduling Assistant ───────────── */

function EventForm({ state, draft, setDraft, tab, setTab, onSend, onDiscard }: { state: OfficeState; draft: Draft; setDraft: (d: Draft) => void; tab: "event" | "assistant"; setTab: (t: "event" | "assistant") => void; onSend: () => void; onDiscard: () => void }) {
  const invite = draft.attendees.length > 0;
  const tabBtn = (t: "event" | "assistant", label: string) => (
    <button type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className="of-btn" style={{ minHeight: 40, padding: "0 14px", border: "none", borderBottom: `3px solid ${tab === t ? W.outlook : "transparent"}`, background: "transparent", fontFamily: W.font, fontSize: 15, fontWeight: tab === t ? 700 : 500, color: tab === t ? W.outlook : W.ink, cursor: "pointer" }}>
      {label}
    </button>
  );
  return (
    <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8, padding: "8px 10px", background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>
        <AppButton primary onClick={onSend}>
          <Icon name="send" size={16} /> {invite ? (draft.id ? "Send update" : "Send") : "Save"}
        </AppButton>
        <AppButton onClick={onDiscard}>Discard</AppButton>
        <span style={{ width: 1, alignSelf: "stretch", background: W.edge, margin: "0 4px" }} />
        <label style={{ display: "inline-flex", alignItems: "center", gap: 10, minHeight: 40, padding: "0 6px", fontSize: 15, cursor: "pointer" }}>
          <Switch on={draft.teams} onChange={(teams) => setDraft({ ...draft, teams })} label="Teams meeting" colour={W.teams} />
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: W.teams }}>
              <Icon name="video" size={18} />
            </span>
            Teams meeting
          </span>
        </label>
        <span role="tablist" aria-label="Event views" style={{ marginLeft: "auto", display: "inline-flex", gap: 2 }}>
          {tabBtn("event", "Event")}
          {tabBtn("assistant", "Scheduling Assistant")}
        </span>
      </div>
      <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{tab === "event" ? <EventFields state={state} draft={draft} setDraft={setDraft} onAssistant={() => setTab("assistant")} /> : <Assistant state={state} draft={draft} setDraft={setDraft} />}</div>
    </div>
  );
}

export function Switch({ on, onChange, label, colour = W.outlook }: { on: boolean; onChange: (v: boolean) => void; label: string; colour?: string }) {
  return (
    <button type="button" role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} style={{ position: "relative", width: 40, height: 22, flexShrink: 0, padding: 0, border: `1.5px solid ${on ? colour : W.muted}`, borderRadius: 11, background: on ? colour : W.page, cursor: "pointer", transition: "background .15s ease" }}>
      <span style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 13, height: 13, borderRadius: "50%", background: on ? "#fff" : W.muted, transition: "left .15s ease" }} />
    </button>
  );
}

const formRow: CSSProperties = { display: "flex", alignItems: "center", gap: 12, minHeight: 52, padding: "6px 20px", borderBottom: `1px solid ${W.edge}` };
const formInput: CSSProperties = { flex: 1, minWidth: 0, minHeight: 38, border: "none", outline: "none", fontFamily: W.font, fontSize: 16, color: W.ink, background: "transparent" };

function EventFields({ state, draft, setDraft, onAssistant }: { state: OfficeState; draft: Draft; setDraft: (d: Draft) => void; onAssistant: () => void }) {
  const [rooms, setRooms] = useState(false);
  const who = [YOU, ...draft.attendees];
  const busy = clashes(state, draft, draft.room ? [...who, draft.room] : who, draft.id);
  return (
    <div>
      <div style={formRow}>
        <span style={{ color: W.muted }}>
          <Icon name="pencil" size={20} />
        </span>
        <input aria-label="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Add a title" style={{ ...formInput, fontSize: 20, fontWeight: 600 }} />
      </div>
      <div style={{ ...formRow, alignItems: "flex-start" }}>
        <span style={{ color: W.muted, paddingTop: 9 }}>
          <Icon name="people" size={20} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <PeoplePicker people={draft.attendees} onChange={(attendees) => setDraft({ ...draft, attendees })} />
          {draft.attendees.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: "2px 0 6px" }}>
              {draft.attendees.map((p) => {
                const b = busy.find((c) => c.who.address === p.address);
                return (
                  <span key={p.address} style={{ fontSize: 13, color: b ? "#a4262c" : "#0e700e" }}>
                    {p.name.split(" ")[0]}: {b ? `busy ${timeRange(b.busy)}` : "free"}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <div style={{ ...formRow, flexWrap: "wrap" }}>
        <span style={{ color: W.muted }}>
          <Icon name="clock" size={20} />
        </span>
        <SlotPicker compact slot={draft} onChange={(s) => setDraft({ ...draft, ...s })} />
        <button type="button" onClick={onAssistant} className="of-btn" style={{ marginLeft: "auto", minHeight: 38, padding: "0 10px", border: "none", background: "transparent", color: W.outlook, fontFamily: W.font, fontSize: 14.5, fontWeight: 600, cursor: "pointer" }}>
          Find a time with the Scheduling Assistant
        </button>
      </div>
      {busy.some((c) => c.who.address === YOU.address) && (
        <p role="status" style={{ margin: 0, padding: "8px 20px 8px 52px", background: "#fde7e9", color: "#a4262c", fontSize: 14, borderBottom: `1px solid ${W.edge}` }}>
          This clashes with something in your own calendar.
        </p>
      )}
      <div style={{ ...formRow, position: "relative", flexWrap: "wrap" }}>
        <span style={{ color: W.muted }}>
          <Icon name="pin" size={20} />
        </span>
        {draft.room ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "3px 4px 3px 10px", borderRadius: 14, background: W.select, fontSize: 15 }}>
            <Icon name="door" size={15} /> {draft.room.name}
            <button type="button" aria-label={`Remove ${draft.room.name}`} onClick={() => setDraft({ ...draft, room: undefined })} style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: W.muted }}>
              <Icon name="cross" size={12} />
            </button>
          </span>
        ) : (
          <input aria-label="Location" value={draft.place} onChange={(e) => setDraft({ ...draft, place: e.target.value })} placeholder="Add a location, or pick a room" style={formInput} />
        )}
        <AppButton onClick={() => setRooms((r) => !r)}>
          <Icon name="door" size={16} /> Browse rooms ▾
        </AppButton>
        {rooms && (
          <div role="listbox" aria-label="Rooms" style={{ position: "absolute", right: 20, top: "100%", zIndex: 20, width: 340, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 8, boxShadow: W.float, padding: 6 }}>
            <p style={{ margin: 0, padding: "4px 8px 6px", fontSize: 13, color: W.muted }}>
              {dayLong(draft.day)}, {timeRange(draft)}
            </p>
            {calOf(state).rooms.map((r) => {
              const b = busyFor(state, r, draft.day, draft.id).find((x) => overlaps(x, draft));
              return (
                <button
                  key={r.address}
                  type="button"
                  role="option"
                  aria-selected={draft.room?.address === r.address}
                  className="of-row"
                  onClick={() => {
                    setDraft({ ...draft, room: r, place: "" });
                    setRooms(false);
                  }}
                  style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 48, padding: "6px 10px", border: "none", borderRadius: 6, background: "transparent", fontFamily: W.font, textAlign: "left", cursor: "pointer" }}
                >
                  <Icon name="door" size={18} />
                  <span style={{ flex: 1 }}>
                    <b style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{r.name}</b>
                    <span style={{ fontSize: 12.5, color: W.muted }}>Seats {ROOM_SEATS[r.name] ?? 4}</span>
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: b ? "#a4262c" : "#0e700e" }}>{b ? `Busy ${timeRange(b)}` : "Available"}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div style={{ padding: "14px 20px 20px 52px" }}>
        <textarea aria-label="Agenda" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} placeholder="Add an agenda: what the meeting is for" rows={7} style={{ width: "100%", boxSizing: "border-box", border: `1px solid ${W.edge}`, borderRadius: 6, padding: "10px 12px", fontFamily: W.font, fontSize: 15.5, lineHeight: 1.55, color: W.ink, resize: "vertical", outline: "none" }} />
        {draft.teams && (
          <div style={{ marginTop: 10, padding: "10px 12px", borderRadius: 6, background: W.teamsSoft, fontSize: 14, color: W.body }}>
            <b style={{ color: W.teams }}>Microsoft Teams meeting</b>
            <div>A Join link is added to the invite when you send it.</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* The To box for a meeting: people as chips, with suggestions as you type. */
function PeoplePicker({ people, onChange }: { people: Person[]; onChange: (p: Person[]) => void }) {
  const [text, setText] = useState("");
  const q = text.trim().toLowerCase();
  const matches = q ? CONTACTS.filter((p) => !people.some((x) => x.address === p.address) && (p.name.toLowerCase().includes(q) || p.address.includes(q))).slice(0, 6) : [];
  const add = (p: Person) => {
    onChange([...people, p]);
    setText("");
  };
  return (
    <div style={{ position: "relative", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 6, minHeight: 40 }}>
      {people.map((p) => (
        <span key={p.address} title={p.address} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "2px 2px 2px 3px", borderRadius: 14, background: W.select, fontSize: 14.5 }}>
          <Avatar name={p.name} colour={avatarColour(p.address)} size={22} />
          {p.name}
          <button type="button" aria-label={`Remove ${p.name}`} onClick={() => onChange(people.filter((x) => x.address !== p.address))} style={{ width: 28, height: 28, border: "none", background: "transparent", cursor: "pointer", color: W.muted }}>
            <Icon name="cross" size={12} />
          </button>
        </span>
      ))}
      <input
        aria-label="Required attendees"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && matches[0]) {
            e.preventDefault();
            add(matches[0]);
          } else if (e.key === "Backspace" && !text && people.length) onChange(people.slice(0, -1));
        }}
        placeholder={people.length ? "Add another" : "Invite required attendees"}
        style={{ ...formInput, minWidth: 180, fontSize: 15.5 }}
      />
      {matches.length > 0 && (
        <div role="listbox" style={{ position: "absolute", left: 0, top: "100%", zIndex: 20, width: 340, background: W.page, border: `1px solid ${W.edge}`, borderRadius: 8, boxShadow: W.float, padding: 4 }}>
          {matches.map((p) => (
            <button key={p.address} type="button" role="option" aria-selected={false} className="of-row" onClick={() => add(p)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, minHeight: 46, textAlign: "left", padding: "6px 10px", border: "none", background: "transparent", borderRadius: 6, fontFamily: W.font, cursor: "pointer" }}>
              <Avatar name={p.name} colour={avatarColour(p.address)} size={30} />
              <span>
                <b style={{ display: "block", fontSize: 15, fontWeight: 600 }}>{p.name}</b>
                <span style={{ fontSize: 13, color: W.muted }}>{p.address}</span>
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* Everyone's busy time on one timeline: you, the attendees, the rooms. */
function Assistant({ state, draft, setDraft }: { state: OfficeState; draft: Draft; setDraft: (d: Draft) => void }) {
  const cols = (DAY_END - DAY_START) / 30;
  const len = Math.max(30, minutes(draft));
  const rows: { p: Person; label: string; room?: boolean }[] = [
    { p: YOU, label: "You (organiser)" },
    ...draft.attendees.map((p) => ({ p, label: p.name })),
    ...calOf(state).rooms.map((p) => ({ p, label: p.name, room: true })),
  ];
  const people = rows.filter((r) => !r.room).map((r) => r.p);
  const hits = clashes(state, draft, draft.room ? [...people, draft.room] : people, draft.id);
  const x = (t: number) => ((t - DAY_START) / 30) * SLOT_W;
  const moveTo = (start: number) => setDraft({ ...draft, start: fromMin(start), end: fromMin(Math.min(DAY_END, start + len)) });
  const dayAt = WEEK.indexOf(draft.day as (typeof WEEK)[number]);
  return (
    <div style={{ padding: "12px 16px 20px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        <IconBtn label="Previous day" icon="left" disabled={dayAt <= 0} onClick={() => setDraft({ ...draft, day: WEEK[Math.max(0, dayAt - 1)] })} />
        <IconBtn label="Next day" icon="right" disabled={dayAt >= 4} onClick={() => setDraft({ ...draft, day: WEEK[Math.min(4, dayAt + 1)] })} />
        <SlotPicker compact slot={draft} onChange={(s) => setDraft({ ...draft, ...s })} />
      </div>
      <p role="status" style={{ margin: "10px 0 0", padding: "8px 12px", borderRadius: 6, fontSize: 14.5, background: hits.length ? "#fde7e9" : draft.attendees.length ? "#dff6dd" : W.chrome, color: hits.length ? "#a4262c" : draft.attendees.length ? "#0e5c0e" : W.muted }}>
        {draft.attendees.length === 0
          ? "Add the people you're inviting on the Event tab, and their busy times show here."
          : hits.length
            ? `Clash at ${timeRange(draft)}: ${hits.map((h) => `${h.who.address === YOU.address ? "you are" : `${h.who.name} is`} busy ${timeRange(h.busy)}`).join("; ")}.`
            : `Everyone${draft.room ? `, and ${draft.room.name},` : ""} is free ${dayShort(draft.day)}, ${timeRange(draft)}.`}
      </p>
      <div style={{ marginTop: 12, overflowX: "auto", border: `1px solid ${W.edge}`, borderRadius: 6 }}>
        <div style={{ position: "relative", display: "grid", gridTemplateColumns: `190px ${cols * SLOT_W}px`, minWidth: 190 + cols * SLOT_W }}>
          {/* the hours along the top */}
          <div style={{ padding: "6px 10px", fontSize: 13, fontWeight: 600, color: W.muted, borderBottom: `1px solid ${W.edge}`, background: W.chrome }}>{dayLong(draft.day)}</div>
          <div style={{ position: "relative", height: 30, borderBottom: `1px solid ${W.edge}`, background: W.chrome }}>
            {Array.from({ length: cols / 2 }, (_, i) => (
              <span key={i} style={{ position: "absolute", left: i * SLOT_W * 2 + 4, top: 7, fontSize: 12, color: W.muted }}>
                {fromMin(DAY_START + i * 60)}
              </span>
            ))}
          </div>
          {rows.map((r, ri) => {
            const busy = busyFor(state, r.p, draft.day, draft.id);
            const chosen = r.room && draft.room?.address === r.p.address;
            return (
              <Fragment key={r.p.address}>
                {r.room && ri === rows.findIndex((x) => x.room) && (
                  <>
                    <div style={{ padding: "6px 10px", fontSize: 12.5, fontWeight: 700, letterSpacing: "0.04em", color: W.muted, background: W.chrome, borderBottom: `1px solid ${W.edge}` }}>ROOMS</div>
                    <div style={{ background: W.chrome, borderBottom: `1px solid ${W.edge}` }} />
                  </>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: 8, minHeight: 40, padding: "4px 8px 4px 10px", borderBottom: `1px solid ${W.edge}`, fontSize: 14, background: chosen ? W.select : W.page }}>
                  {r.room ? <Icon name="door" size={18} style={{ color: W.muted }} /> : <Avatar name={r.p.address === YOU.address ? "You" : r.p.name} colour={avatarColour(r.p.address)} size={24} />}
                  <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</span>
                  {r.room && (
                    <button type="button" onClick={() => setDraft({ ...draft, room: chosen ? undefined : r.p, place: "" })} aria-pressed={!!chosen} aria-label={chosen ? `Remove ${r.p.name}` : `Book ${r.p.name}`} className="of-btn" style={{ minHeight: 30, padding: "0 10px", border: `1px solid ${chosen ? W.outlook : W.edge}`, borderRadius: 4, background: chosen ? W.outlook : W.page, color: chosen ? "#fff" : W.ink, fontFamily: W.font, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                      {chosen ? "Booked" : "Add"}
                    </button>
                  )}
                </div>
                <div style={{ position: "relative", height: "100%", minHeight: 40, borderBottom: `1px solid ${W.edge}` }}>
                  {Array.from({ length: cols }, (_, i) => {
                    const t = DAY_START + i * 30;
                    const outside = t < WORK_START || t >= WORK_END;
                    return (
                      <button
                        key={i}
                        type="button"
                        tabIndex={ri === 0 ? 0 : -1}
                        aria-label={ri === 0 ? `Start at ${fromMin(t)}` : undefined}
                        aria-hidden={ri === 0 ? undefined : true}
                        onClick={() => moveTo(t)}
                        style={{ position: "absolute", left: i * SLOT_W, top: 0, bottom: 0, width: SLOT_W, padding: 0, border: "none", borderLeft: `1px ${i % 2 ? "dotted" : "solid"} ${W.edge}`, background: outside ? "repeating-linear-gradient(135deg, #f3f2f1 0 4px, #e9e7e5 4px 8px)" : "transparent", cursor: "pointer" }}
                      />
                    );
                  })}
                  {busy.map((b, i) => (
                    <span key={i} aria-label={`${r.label} busy ${timeRange(b)}`} style={{ position: "absolute", left: x(toMin(b.start)) + 1, width: Math.max(4, x(toMin(b.end)) - x(toMin(b.start)) - 2), top: 9, bottom: 9, borderRadius: 3, background: BUSY, pointerEvents: "none" }} />
                  ))}
                </div>
              </Fragment>
            );
          })}
          {/* the meeting itself, as a band down the whole timeline */}
          <div aria-hidden style={{ position: "absolute", left: 190 + x(toMin(draft.start)), width: x(toMin(draft.end)) - x(toMin(draft.start)), top: 0, bottom: 0, border: `2px solid ${hits.length ? "#c4314b" : "#13a10e"}`, background: hits.length ? "rgba(196,49,75,0.10)" : "rgba(19,161,14,0.10)", borderRadius: 3, pointerEvents: "none" }} />
        </div>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 18, marginTop: 10, fontSize: 13, color: W.muted }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 22, height: 10, borderRadius: 2, background: BUSY }} /> Busy
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 22, height: 10, borderRadius: 2, background: "repeating-linear-gradient(135deg, #f3f2f1 0 4px, #e9e7e5 4px 8px)", border: `1px solid ${W.edge}` }} /> Outside working hours
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 22, height: 10, borderRadius: 2, border: "2px solid #13a10e" }} /> Your meeting: click the timeline to move it
        </span>
      </div>
    </div>
  );
}


export const CALENDAR_CSS = `
  .cal-slot:hover { background: rgba(15,108,189,0.07) !important; }
  .cal-event:hover { filter: brightness(0.97); }
`;
