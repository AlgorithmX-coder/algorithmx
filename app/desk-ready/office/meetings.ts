import { PEOPLE, YOU } from "./northfield";
import type { Busy, CalendarState, Call, Chat, InviteResponse, Meeting, OfficeState, Person, Slot, TeamsState } from "./types";

/* Module 3's shared workings for the Calendar and Teams apps, their jobs
 * and the jobs' checks: the Northfield week, its meeting rooms, the
 * learner's own diary, and the sums that say whether a time is free. */

/* ── the week ───────────────────────────────────────────────────────── */

export const WEEK = ["2026-11-09", "2026-11-10", "2026-11-11", "2026-11-12", "2026-11-13"] as const;
const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export const dayIndex = (day: string) => WEEK.indexOf(day as (typeof WEEK)[number]);

/* ── Final task ── the names below read the date itself, so the calendar
 * can show the week of Monday 16 November too. A weekday in the course's
 * week reads exactly as before. */
const WEEKDAYS = ["Sunday", ...DAY_NAMES, "Saturday"];
const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const dateOf = (day: string) => (/^\d{4}-\d{2}-\d{2}$/.test(day) ? new Date(`${day}T12:00:00Z`) : null);
/* The Monday to Friday that holds a day: weekOf("2026-11-18") is 16 to 20 November. */
export function weekOf(day: string): string[] {
  const d = dateOf(day);
  if (!d) return [...WEEK];
  const monday = new Date(d.getTime() - ((d.getUTCDay() + 6) % 7) * 86400000);
  return Array.from({ length: 5 }, (_, i) => new Date(monday.getTime() + i * 86400000).toISOString().slice(0, 10));
}
/* "9 to 13 November 2026" */
export const weekTitle = (week: readonly string[]) => {
  const a = dateOf(week[0]);
  const b = dateOf(week[week.length - 1]);
  return a && b ? `${a.getUTCDate()} to ${b.getUTCDate()} ${MONTHS[b.getUTCMonth()]} ${b.getUTCFullYear()}` : "";
};
/* "Thursday 12 November" */
export const dayLong = (day: string) => {
  const d = dateOf(day);
  return d ? `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}` : day;
};
/* "Thu 12" */
export const dayShort = (day: string) => {
  const d = dateOf(day);
  return d ? `${WEEKDAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()}` : day;
};
/* ── end Final task ── */

/* The working day the apps draw, and the times the pickers offer. */
export const DAY_START = 8 * 60;
export const DAY_END = 18 * 60;
export const WORK_START = 9 * 60;
export const WORK_END = 17 * 60 + 30;

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};
export const fromMin = (n: number) => `${String(Math.floor(n / 60)).padStart(2, "0")}:${String(n % 60).padStart(2, "0")}`;
export const minutes = (s: Slot) => toMin(s.end) - toMin(s.start);
export const overlaps = (a: Slot, b: Slot) => a.day === b.day && toMin(a.start) < toMin(b.end) && toMin(b.start) < toMin(a.end);
/* "10:00 to 10:30" */
export const timeRange = (s: Slot) => `${s.start} to ${s.end}`;
/* "30 minutes", "1 hour", "1 hour 30 minutes" */
export function lengthText(n: number) {
  const h = Math.floor(n / 60);
  const m = n % 60;
  const hs = h ? `${h} hour${h > 1 ? "s" : ""}` : "";
  const ms = m ? `${m} minutes` : "";
  return [hs, ms].filter(Boolean).join(" ") || "0 minutes";
}
/* Every half hour of the drawn day, for the time pickers. */
export const HALF_HOURS = Array.from({ length: (DAY_END - DAY_START) / 30 + 1 }, (_, i) => fromMin(DAY_START + i * 30));

/* ── the rooms ──────────────────────────────────────────────────────── */

const DOMAIN = "northfieldsupplies.example";
export const ROOMS: Person[] = [
  { name: "Room 1", address: `room1@${DOMAIN}` },
  { name: "Room 2", address: `room2@${DOMAIN}` },
  { name: "Boardroom", address: `boardroom@${DOMAIN}` },
];
export const isRoom = (p: Person) => ROOMS.some((r) => r.address === p.address);
/* How many each room seats, for the room picker. */
export const ROOM_SEATS: Record<string, number> = { "Room 1": 4, "Room 2": 6, Boardroom: 12 };

/* ── the learner's own diary for the week ───────────────────────────── */

/* What every Module 3 job starts with in the learner's calendar. A job
 * adds its own invites and free/busy on top. */
export function myWeek(): Meeting[] {
  const huddles: Meeting[] = WEEK.map((day, i) => ({
    id: `seed-huddle-${i}`,
    title: "Morning huddle",
    organiser: PEOPLE.daniel,
    attendees: [YOU, PEOPLE.sarah, PEOPLE.priya, PEOPLE.emma],
    place: "Office floor",
    teams: false,
    day,
    start: "09:00",
    end: "09:15",
    body: "Ten minutes, standing up: what's on today, and anything that's stuck.",
    response: "accepted",
  }));
  return [
    ...huddles,
    { id: "seed-welcome", title: "Welcome and IT set-up", organiser: PEOPLE.daniel, attendees: [YOU], room: ROOMS[0], teams: false, day: WEEK[0], start: "10:00", end: "11:00", body: "Your laptop, your sign-in and a tour of Outlook and Teams.", response: "accepted" },
    { id: "seed-orders", title: "Order desk shadowing", organiser: PEOPLE.sarah, attendees: [YOU], place: "Warehouse office", teams: false, day: WEEK[1], start: "14:00", end: "15:30", body: "Sit with the order desk for an afternoon and see how an order goes from email to van.", response: "accepted" },
    { id: "seed-induction", title: "Health and safety induction", organiser: PEOPLE.emma, attendees: [YOU], place: "Warehouse, meet at reception", teams: false, day: WEEK[3], start: "11:30", end: "12:30", body: "Fire exits, first aid and the forklift lanes. Wear flat shoes.", response: "accepted" },
    { id: "seed-team", title: "Weekly team meeting", organiser: PEOPLE.daniel, attendees: [YOU, PEOPLE.sarah, PEOPLE.priya, PEOPLE.emma], room: ROOMS[1], teams: true, day: WEEK[4], start: "15:00", end: "16:00", body: "1. The week's deliveries\n2. Stock count\n3. Anything else", response: "accepted" },
  ];
}

/* ── reading the record ─────────────────────────────────────────────── */

export const calOf = (s: OfficeState): CalendarState => s.calendar ?? { today: WEEK[0], meetings: [], busy: [], rooms: ROOMS };
export const teamsOf = (s: OfficeState): TeamsState => s.teams ?? { chats: [], windows: [] };

/* A meeting the learner has said yes or maybe to, or booked. A new invite
 * shows as "tentative" until they answer, as Outlook draws it. */
export const inMyDiary = (m: Meeting) => m.sent || m.organiser.address === YOU.address || m.response === "accepted" || m.response === "tentative" || m.response === "none" || m.response === undefined;

/* When someone (or a room) is busy on a day: the free/busy the job seeded,
 * plus any meeting the learner has booked them into. `skip` leaves out the
 * meeting being edited, so it doesn't clash with itself. */
export function busyFor(s: OfficeState, who: Person, day: string, skip?: string): (Slot & { title?: string })[] {
  const cal = calOf(s);
  if (who.address === YOU.address) {
    return cal.meetings.filter((m) => m.day === day && m.id !== skip && inMyDiary(m) && m.response !== "declined" && m.response !== "proposed").map((m) => ({ day: m.day, start: m.start, end: m.end, title: m.title }));
  }
  const seeded: Slot[] = cal.busy.filter((b: Busy) => b.who === who.address && b.day === day);
  const booked: Slot[] = cal.meetings.filter((m) => m.sent && m.id !== skip && m.day === day && (m.attendees.some((p) => p.address === who.address) || m.room?.address === who.address));
  return [...seeded, ...booked];
}

/* Who, of these people and rooms, is busy during a slot. */
export function clashes(s: OfficeState, slot: Slot, who: Person[], skip?: string): { who: Person; busy: Slot }[] {
  const out: { who: Person; busy: Slot }[] = [];
  for (const p of who) {
    const hit = busyFor(s, p, slot.day, skip).find((b) => overlaps(b, slot));
    if (hit) out.push({ who: p, busy: hit });
  }
  return out;
}

/* ── answering and joining ──────────────────────────────────────────── */

export function withResponse(s: OfficeState, id: string, response: InviteResponse, proposed?: Slot): OfficeState {
  const cal = calOf(s);
  return { ...s, calendar: { ...cal, meetings: cal.meetings.map((m) => (m.id === id ? { ...m, response, proposed: response === "proposed" ? proposed : undefined } : m)) } };
}

/* Join a Teams meeting: the pre-join screen, with the mic on and the
 * camera off as Teams starts them, or the call itself if already in it.
 * Rejoining keeps what was shared earlier: once seen, it was seen. */
export function withCall(s: OfficeState, m: Meeting): OfficeState {
  const t = teamsOf(s);
  const cur = t.call;
  const ask = (cur?.ask ?? 0) + 1;
  const same = cur?.meetingId === m.id;
  const call: Call =
    same && cur.stage === "in"
      ? { ...cur, ask }
      : {
          meetingId: m.id,
          title: m.title,
          people: [m.organiser, ...m.attendees].filter((p) => p.address !== YOU.address && !isRoom(p)),
          stage: "prejoin",
          mic: same ? cur.mic : true,
          camera: same ? cur.camera : false,
          joinedWith: same ? cur.joinedWith : undefined,
          sharing: null,
          shared: same ? cur.shared : [],
          ask,
        };
  return { ...s, teams: { ...t, call } };
}

/* ── chats ──────────────────────────────────────────────────────────── */

export const chatName = (c: Chat) => c.title ?? c.people.map((p) => p.name).join(", ");
/* What the learner has written in any chat that includes this person. */
export const saidTo = (s: OfficeState, p: Person) => teamsOf(s).chats.filter((c) => c.people.some((x) => x.address === p.address)).flatMap((c) => c.messages.filter((m) => m.from.address === YOU.address).map((m) => ({ chat: c, text: m.text })));
export const unreadChats = (s: OfficeState) => teamsOf(s).chats.reduce((n, c) => n + (c.unread ?? 0), 0);
/* Invites still waiting for an answer. */
export const pendingInvites = (s: OfficeState) => calOf(s).meetings.filter((m) => !m.sent && m.organiser.address !== YOU.address && (m.response ?? "none") === "none").length;

/* Initials for an avatar: "Sarah Patel" -> "SP". */
export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

/* A steady colour per person, as Teams and Outlook give each avatar. */
const AVATAR = ["#c2410c", "#0e7a5a", "#7a3fb0", "#b4235a", "#1f6fb2", "#8a6d12", "#5b5fc7"];
export function avatarColour(address: string) {
  if (address === YOU.address || /^you\b/i.test(address)) return "#8a4fd8";
  let h = 0;
  for (const ch of address) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return AVATAR[h % AVATAR.length];
}
