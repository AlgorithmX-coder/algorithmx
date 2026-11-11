import { ROOMS, WEEK, calOf, clashes, dayLong, minutes, myWeek, saidTo, teamsOf, timeRange, toMin } from "../meetings";
import { inbound, officeFolders, PEOPLE, SIGNATURE, YOU } from "../northfield";
import type { Busy, Chat, Check, Email, Job, Meeting, OfficeFile, OfficeState, Person } from "../types";

/* The three Module 3 jobs (criteria TM-1 to TM-5), built as the exercise
 * bank writes them:
 *
 * - E3.1 Book the stock meeting: Daniel, on Teams, wants 30 minutes with
 *   Sarah and Priya on Thursday morning, Room 2 if it's free. Only 10:00
 *   works: Sarah is busy 09:00 to 10:00, Priya 10:30 to 11:30, and the
 *   learner has their induction from 11:30.
 * - E3.2 On the call: Emma's invite for a 14:00 Teams call about the
 *   rota. Accept it, join muted with the camera on, and share only the
 *   Excel window: a private email sits in Outlook beside it.
 * - E3.3 Chat or email? Five things to send before lunch. The printer
 *   question and the running-late note go by chat; the credit note, the
 *   signed-off report and the stock meeting's actions go by email, and
 *   the actions say who, what and by when.
 *
 * Every check reads the office record at the end, never the clicks. */

const MODULE = { moduleId: "m3", moduleLabel: "Module 3: Meetings and messages" } as const;
const [, TUE, WED, THU, FRI] = WEEK;
const { daniel, sarah, priya, emma, tom } = PEOPLE;
const [ROOM1, ROOM2, BOARDROOM] = ROOMS;

const msg = (id: string, from: Person, time: string, text: string) => ({ id, from, time, text });
const has = (people: Person[], p: Person) => people.some((x) => x.address === p.address);
const sentMail = (s: OfficeState) => s.emails.filter((e) => e.folder === "sent");
const mailTo = (s: OfficeState, p: Person) => sentMail(s).filter((e) => has([...e.to, ...e.cc], p));

/* Sarah's and Priya's mornings: everyone stands up for the huddle at nine. */
function huddles(...people: Person[]): Busy[] {
  return people.flatMap((p) => WEEK.map((day) => ({ who: p.address, day, start: "09:00", end: "09:15" })));
}

function everydayInbox(): Email[] {
  return [
    inbound({ id: "m3-facilities", from: PEOPLE.facilities, subject: "Car park resurfacing on Saturday", time: "Mon 16:05", unread: false, body: "Hello all,\n\nThe car park is being resurfaced on Saturday 14 November. Please don't leave cars there on Friday night.\n\nThanks,\nFacilities" }),
    inbound({ id: "m3-hr-welcome", from: PEOPLE.hr, subject: "Your first week: who's who", time: "Mon 08:30", unread: false, body: "Hi,\n\nWelcome to Northfield Supplies. Daniel Okafor is your manager. Sarah Patel runs the warehouse, Priya Shah looks after accounts and Emma Clarke is HR.\n\nHR Team" }),
  ];
}

/* ── E3.1 Book the stock meeting ────────────────────────────────────── */

const DANIEL_BOOK = "Can you book 30 minutes with Sarah and Priya on Thursday morning to go through the November stock count? Room 2 if it's free.";

function seedStock(): OfficeState {
  const chats: Chat[] = [
    {
      id: "chat-daniel",
      people: [daniel],
      unread: 1,
      messages: [msg("d1", daniel, "Mon 09:05", "Welcome aboard! Shout here if you need anything. Teams is quickest for quick questions."), msg("d2", YOU, "Mon 09:12", "Thanks Daniel, will do."), msg("d3", daniel, "09:18", DANIEL_BOOK)],
    },
    { id: "chat-sarah", people: [sarah], messages: [msg("s1", sarah, "Mon 14:40", "I've put you down for order desk shadowing tomorrow afternoon. See you at 2.")] },
    { id: "chat-priya", people: [priya], messages: [msg("p1", priya, "Mon 11:02", "Hi! I'm on extension 415 if you need me for anything invoice-y.")] },
  ];
  const busy: Busy[] = [
    ...huddles(sarah, priya),
    { who: sarah.address, day: THU, start: "09:00", end: "10:00" },
    { who: sarah.address, day: THU, start: "14:00", end: "16:00" },
    { who: sarah.address, day: WED, start: "10:00", end: "12:00" },
    { who: priya.address, day: THU, start: "10:30", end: "11:30" },
    { who: priya.address, day: THU, start: "15:00", end: "16:00" },
    { who: priya.address, day: FRI, start: "09:30", end: "11:00" },
    { who: ROOM1.address, day: THU, start: "09:30", end: "11:00" },
    { who: ROOM1.address, day: TUE, start: "13:00", end: "15:00" },
    { who: ROOM2.address, day: THU, start: "14:00", end: "15:00" },
    { who: ROOM2.address, day: FRI, start: "15:00", end: "16:00" },
    { who: BOARDROOM.address, day: THU, start: "10:00", end: "12:00" },
  ];
  return {
    version: 0,
    files: officeFolders(),
    emails: everydayInbox(),
    calendar: { today: TUE, meetings: myWeek(), busy, rooms: ROOMS },
    teams: { chats, windows: [] },
  };
}

/* The invite the learner booked for this: the newest one with Sarah or
 * Priya on it. */
const stockInvites = (s: OfficeState) => calOf(s).meetings.filter((m) => m.sent && m.organiser.address === YOU.address && (has(m.attendees, sarah) || has(m.attendees, priya)) && !m.id.startsWith("seed-"));

function checkStock(s: OfficeState): Check[] {
  const all = stockInvites(s);
  const m: Meeting | undefined = all[all.length - 1];
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const none = "Open Calendar and press New event. Add Sarah and Priya, pick the time, then press Send.";

  add({ id: "sent", code: "TM-2", group: "The invite", label: "An invite is sent to Sarah and Priya" }, !!m && has(m.attendees, sarah) && has(m.attendees, priya), !m ? none : `It went to ${m.attendees.map((p) => p.name).join(" and ")}. Open it in your calendar, press Edit, and make sure Sarah Patel and Priya Shah are both in Required attendees.`);
  add({ id: "one", code: "TM-2", group: "The invite", label: "Just one invite, so nobody gets two" }, all.length <= 1, `You've sent ${all.length} invites for this. Open the extra ones in your calendar and press Cancel meeting.`);
  add(
    { id: "day", code: "TM-2", group: "The time", label: "On Thursday 12 November, in the morning" },
    !!m && m.day === THU && toMin(m.start) >= toMin("09:00") && toMin(m.end) <= toMin("12:00"),
    !m ? none : m.day !== THU ? `It's on ${dayLong(m.day)}. Daniel asked for Thursday 12 November.` : `It's at ${timeRange(m)}. Daniel asked for the morning, from 09:00.`,
  );
  add({ id: "length", code: "TM-2", group: "The time", label: "30 minutes long" }, !!m && minutes(m) === 30, !m ? none : `It's ${minutes(m)} minutes. Set the end time 30 minutes after the start.`);
  const hits = m ? clashes(s, m, m.room ? [YOU, sarah, priya, m.room] : [YOU, sarah, priya], m.id) : [];
  add(
    { id: "free", code: "TM-2", group: "The time", label: "At a time when everyone is free: 10:00 to 10:30" },
    !!m && m.day === THU && hits.length === 0,
    !m ? none : hits.length ? `At ${timeRange(m)}, ${hits.map((h) => `${h.who.address === YOU.address ? "you are" : `${h.who.name} is`} busy ${timeRange(h.busy)}`).join(", and ")}. Open the Scheduling Assistant and find the gap where every row is clear.` : "Put it on Thursday, then find the gap where every row in the Scheduling Assistant is clear.",
  );
  add(
    { id: "room", code: "TM-2", group: "Where", label: "In Room 2" },
    !!m && m.room?.address === ROOM2.address,
    !m ? none : m.room ? `It's in ${m.room.name}. Daniel asked for Room 2, and it's free all Thursday morning.` : "No room is booked. Press Browse rooms and pick Room 2.",
  );
  add({ id: "title", code: "TM-2", group: "What it's for", label: "A title that says what it's about" }, !!m && /stock/i.test(m.title), "Give it a title people can find, like \"November stock count\".");
  add(
    { id: "agenda", code: "TM-2", group: "What it's for", label: "The agenda: November stock count: agree the figures" },
    !!m && /stock\s*count/i.test(m.body) && /figure/i.test(m.body),
    "In the box under the location, add the one-line agenda: \"November stock count: agree the figures\".",
  );
  const told = saidTo(s, daniel).filter((x) => x.chat.id === "chat-daniel" || !x.chat.title).some((x) => /book|done|sent|invite|thursday|10/i.test(x.text));
  add({ id: "told", code: "TM-4", group: "Closing the loop", label: "You told Daniel it's booked, in one line in his chat" }, told, "Go back to Daniel's chat in Teams and tell him: \"Done, booked Thursday 10:00 to 10:30 in Room 2.\"");
  return out;
}

export const stockMeeting: Job = {
  id: "m3j1",
  slug: "stock-meeting",
  ...MODULE,
  title: "Book the stock meeting",
  summary: "Daniel wants 30 minutes with Sarah and Priya on Thursday morning. Find the one time that works for everyone, book a room and send the invite.",
  clock: "Tue 10 Nov, 09:20",
  deadline: "Daniel needs it booked today",
  doneLine: "Booked for the one time everyone is free, in the room Daniel wanted, with an agenda. And Daniel knows it's done.",
  brief: "Daniel has sent you a message on Teams. Read it and do what he asks. When you think it's done, press Check my work.",
  hints: [
    "Read Daniel's message in Teams. Who, which day, how long, which room?",
    "Open Calendar and press New event. Type Sarah and Priya into Required attendees.",
    "Open the Scheduling Assistant and set Thursday 12 November. Look for the 30 minutes where every row, yours too, is clear.",
    "Press Browse rooms and pick Room 2. Add the agenda \"November stock count: agree the figures\", then Send.",
    "Tell Daniel in his chat, in one line, that it's booked.",
  ],
  apps: ["calendar", "teams"],
  start: "teams",
  seed: seedStock,
  check: checkStock,
  habits: [
    { label: "Put it where the brief says", checks: ["day", "room"] },
    { label: "Name it so anyone can find it", checks: ["title", "agenda"] },
    { label: "One version, in one place", checks: ["one"] },
    { label: "Close the loop", checks: ["told"] },
    { label: "Check your own work", checks: ["free", "length", "sent"] },
  ],
};

/* ── E3.2 On the call ───────────────────────────────────────────────── */

const ROTA_CALL = "seed-rota-call";
const INVITE_MAIL = "m3-emma-invite";
const EMMA_ASK = "Quick Teams call at 14:00 to walk through your rota. Please share your screen with the rota open.\n\nCameras on and microphones on mute when you join, please: the HR office is noisy.";
const ROTA_FILE = "Rota w/c 16 November.xlsx";

function rotaSheet() {
  return [
    ["Name", "Mon 16", "Tue 17", "Wed 18", "Thu 19", "Fri 20"],
    ["You", "08:00-16:00", "08:00-16:00", "Off", "12:00-20:00", "12:00-20:00"],
    ["Sarah Patel", "Off", "08:00-16:00", "08:00-16:00", "08:00-16:00", "08:00-16:00"],
    ["Tom Reid", "12:00-20:00", "12:00-20:00", "08:00-16:00", "Off", "08:00-16:00"],
    ["Aisha Khan", "08:00-16:00", "Off", "12:00-20:00", "12:00-20:00", "Off"],
    ["", "", "", "", "", ""],
  ];
}

function seedRota(): OfficeState {
  const rota: OfficeFile = { id: "seed-rota", path: ["OneDrive", "Documents"], name: ROTA_FILE, kind: "xlsx", modified: "Today 13:30", by: "Emma Clarke", sheet: rotaSheet(), widths: [120, 110, 110, 110, 110, 110], seeded: true };
  const invite: Meeting = { id: ROTA_CALL, title: "Rota walk-through", organiser: emma, attendees: [YOU], teams: true, day: WED, start: "14:00", end: "14:30", body: EMMA_ASK, response: "none", emailId: INVITE_MAIL };
  const kent: Meeting = { id: "seed-kent-call", title: "Call Kent Bakery about Friday", organiser: YOU, attendees: [], place: "Your desk", teams: false, day: WED, start: "15:00", end: "15:30", body: "Confirm Friday's flour order.", response: "accepted" };
  return {
    version: 0,
    files: [...officeFolders(), rota],
    emails: [
      inbound({ id: INVITE_MAIL, from: emma, subject: "Rota walk-through", time: "13:40", body: `Hi,\n\n${EMMA_ASK}\n\nThanks,\nEmma` }),
      inbound({
        id: "m3-pay",
        from: PEOPLE.hr,
        subject: "Private: your salary and bank details",
        time: "11:15",
        unread: false,
        body: "Hi,\n\nPrivate and confidential.\n\nPlease check your starting salary of £24,500 and the bank details we hold for you: sort code 00-00-00, account ending 4417. Tell us by Friday if anything is wrong.\n\nHR Team",
      }),
      ...everydayInbox(),
    ],
    calendar: { today: WED, meetings: [...myWeek(), invite, kent], busy: [], rooms: ROOMS },
    teams: {
      chats: [
        { id: "chat-emma", people: [emma], messages: [msg("e1", emma, "Mon 10:20", "Hi! I'll go through your first rota with you on Wednesday. I'll send an invite.")] },
        { id: "chat-daniel", people: [daniel], messages: [msg("d1", daniel, "Mon 09:05", "Welcome aboard! Shout here if you need anything.")] },
      ],
      windows: [
        { id: "screen", app: "screen", title: "Screen 1 (your whole screen)" },
        { id: "excel-rota", app: "excel", title: `Excel · ${ROTA_FILE}` },
        { id: "outlook-pay", app: "outlook", title: "Outlook · Private: your salary and bank details", private: true },
      ],
    },
  };
}

function checkRota(s: OfficeState): Check[] {
  const m = calOf(s).meetings.find((x) => x.id === ROTA_CALL);
  const call = teamsOf(s).call?.meetingId === ROTA_CALL ? teamsOf(s).call : undefined;
  const windows = teamsOf(s).windows;
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const r = m?.response ?? "none";
  add(
    { id: "accepted", code: "TM-1", group: "The invite", label: "Emma's invite is accepted: you're free at 14:00" },
    r === "accepted",
    r === "tentative" ? "You said maybe. Your calendar is free at 14:00, so press Accept and Emma knows you're coming." : r === "declined" ? "You declined it, but your calendar is free at 14:00. Open the invite and press Accept." : r === "proposed" ? "You proposed a new time, but you're free at 14:00. Press Accept instead." : "Open Emma's email and press Accept on the invite.",
  );
  const joined = !!call?.joinedWith;
  add({ id: "joined", code: "TM-3", group: "Joining", label: "You joined the call" }, joined, "Press Join on the invite (in Outlook, Calendar or Teams), then Join now.");
  add({ id: "muted", code: "TM-3", group: "Joining", label: "You joined with your microphone muted" }, joined && call?.joinedWith?.mic === false, joined ? "You joined with your microphone on, and Emma asked for mute. Leave, press Rejoin, and switch the microphone off before Join now." : "Join the call with the microphone switched off.");
  add({ id: "camera", code: "TM-3", group: "Joining", label: "You joined with your camera on" }, joined && call?.joinedWith?.camera === true, joined ? "You joined with your camera off, and Emma asked for cameras on. Leave, press Rejoin, and switch the camera on before Join now." : "Join the call with the camera switched on.");
  const shown = (call?.shared ?? []).map((id) => windows.find((w) => w.id === id)).filter((w): w is NonNullable<typeof w> => !!w);
  add({ id: "shared", code: "TM-3", group: "Sharing", label: "You shared the Excel window with the rota" }, shown.some((w) => w.app === "excel"), joined ? "In the call, press Share, then pick the Excel window with the rota." : "Join the call first, then press Share and pick the Excel window.");
  const leaked = shown.find((w) => w.app === "screen" || w.private);
  add(
    { id: "private", code: "TM-3", group: "Sharing", label: "Only the rota was on show, never your private email" },
    joined && !leaked,
    !joined ? "Join the call and share just the Excel window." : `You shared ${leaked?.app === "screen" ? "your whole screen" : "the Outlook window"}, so Emma could see your salary and bank details. At work, stop sharing at once. Here, press Start the job again and share only the Excel window.`,
  );
  return out;
}

export const rotaCall: Job = {
  id: "m3j2",
  slug: "rota-call",
  ...MODULE,
  title: "On the call",
  summary: "Emma wants a quick Teams call to walk through your rota. Answer her invite, join the way she asks, and share only what she needs to see.",
  clock: "Wed 11 Nov, 13:52",
  deadline: "The call starts at 14:00",
  doneLine: "Accepted, joined on mute with your camera on, and Emma saw the rota and nothing else.",
  brief: "Emma has sent you a meeting invite. Read it and do what she asks. When you think it's done, press Check my work.",
  hints: [
    "Open Emma's email in Outlook. Is your calendar free at 14:00? Then press Accept.",
    "Press Join on the invite. Before Join now, switch the microphone off and the camera on.",
    "In the call, press Share. Pick the Excel window with the rota, not your whole screen: your private email is open in Outlook.",
  ],
  apps: ["calendar", "teams"],
  start: "outlook",
  seed: seedRota,
  check: checkRota,
  habits: [
    { label: "Close the loop", checks: ["accepted"] },
    { label: "Put it where the brief says", checks: ["shared"] },
    { label: "Check your own work", checks: ["muted", "camera", "private"] },
  ],
};

/* ── E3.3 Chat or email? ────────────────────────────────────────────── */

const DANIEL_FIVE =
  "Five things need sending before lunch. Send each one the right way.\n\n1. Ask Sarah if the warehouse printer is fixed.\n2. Ask Tom Hale at Harlow for a credit note for invoice HP-2291: 2 pallets short, £115.20 with VAT.\n3. Tell Emma you're running 5 minutes late for your 11:30.\n4. Send me the signed-off delivery report. It's in Deliveries > 2026.\n5. Send Sarah and Priya the actions from this morning's stock meeting. They're in the meeting chat.";
const REPORT_DIR = ["Operations Team", "Documents", "Deliveries", "2026"];
const REPORT = "2026-11-10 Delivery report.xlsx";

function seedFive(): OfficeState {
  const stock: Meeting = { id: "seed-stock-meeting", title: "November stock count", organiser: YOU, attendees: [sarah, priya, daniel], room: ROOM2, teams: true, day: THU, start: "10:00", end: "10:30", body: "November stock count: agree the figures", sent: true, response: "accepted" };
  const report: OfficeFile = {
    id: "seed-report",
    path: REPORT_DIR,
    name: REPORT,
    kind: "xlsx",
    modified: "10/11/2026",
    by: "Sarah Patel",
    seeded: true,
    sheet: [
      ["Date", "Delivery note", "Supplier", "Item", "Expected", "Received", "Short by", "Checked by"],
      ["10/11/2026", "DN-77812", "Harlow Packaging", "Pallet wrap", "12", "10", "=E2-F2", "SP"],
      ["10/11/2026", "DN-40915", "Kent Flour Mills", "Plain flour 25kg", "40", "40", "=E3-F3", "SP"],
      ["10/11/2026", "DN-11630", "Brightwater Cups", "Paper cups", "30", "30", "=E4-F4", "SP"],
      ["", "", "", "", "", "", "", ""],
      ["Signed off: Sarah Patel, 11/11/2026", "", "", "", "", "", "", ""],
    ],
    widths: [110, 110, 140, 130, 80, 80, 80, 90],
  };
  return {
    version: 0,
    files: [...officeFolders(), report],
    emails: [
      inbound({ id: "m3-sarah-signed", from: sarah, subject: "Delivery report signed off", time: "Wed 16:50", unread: false, body: `Hi,\n\nI've checked and signed off Tuesday's delivery report. It's in Deliveries > 2026.\n\nThanks,\nSarah\n\n${SIGNATURE.sarah}` }),
      ...everydayInbox(),
    ],
    calendar: { today: THU, meetings: [...myWeek(), stock], busy: [], rooms: ROOMS },
    teams: {
      chats: [
        { id: "chat-daniel", people: [daniel], unread: 1, messages: [msg("d1", daniel, "Mon 09:05", "Welcome aboard! Shout here if you need anything."), msg("d2", daniel, "11:08", DANIEL_FIVE)] },
        {
          id: "chat-stock",
          title: "November stock count",
          people: [daniel, sarah, priya],
          messages: [
            msg("k1", daniel, "10:02", "Thanks all. Aisle C is 14 pallets out on the stock sheet. Sarah, can you recount it?"),
            msg("k2", sarah, "10:05", "Yes, I'll recount aisle C. I can have it done by Friday."),
            msg("k3", priya, "10:11", "Some of it is invoice HP-2291: Harlow billed us for 12 pallets and only 10 came. I'll chase Harlow about it, by Friday too."),
            msg("k4", daniel, "10:18", "Great. And once the figures are agreed, can you update the stock sheet? By Thursday, please, so end of today."),
            msg("k5", daniel, "10:26", "Can you send the actions round after this, so we all have them in writing? Thanks everyone."),
          ],
        },
        { id: "chat-sarah", people: [sarah], messages: [msg("s1", sarah, "Tue 14:40", "Thanks for this afternoon. You picked the order desk up fast.")] },
        { id: "chat-emma", people: [emma], messages: [msg("e1", emma, "Wed 14:31", "Thanks for the call! See you Thursday for the induction.")] },
        { id: "chat-priya", people: [priya], messages: [msg("p1", priya, "Mon 11:02", "Hi! I'm on extension 415 if you need me for anything invoice-y.")] },
      ],
      windows: [],
    },
  };
}

/* The lines of an email, and the sentences inside them, so an action
 * written as a list or as a sentence is found either way. */
const lines = (body: string) => body.split(/\n|(?<=[.;])\s+/).map((l) => l.trim()).filter(Boolean);
const actionLine = (body: string, tests: RegExp[]) => lines(body).some((l) => tests.every((t) => t.test(l)));
const ME = /\b(i|i'll|i will|me|my|myself|you|jordan)\b/i;

function checkFive(s: OfficeState): Check[] {
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  const printerChat = saidTo(s, sarah).some((x) => /printer/i.test(x.text));
  const printerMail = sentMail(s).some((e) => /printer/i.test(`${e.subject} ${e.body}`));
  add(
    { id: "printer", code: "TM-4", group: "Quick ones: by chat", label: "\"Is the printer fixed?\" went to Sarah by Teams chat" },
    printerChat && !printerMail,
    printerMail ? "You emailed the printer question. A quick yes-or-no question goes in a Teams chat: it's quicker for both of you, and nobody needs a record of it." : "Open Sarah's chat in Teams and ask her if the warehouse printer is fixed.",
  );
  const lateChat = saidTo(s, emma).some((x) => /late|minutes|mins|running/i.test(x.text));
  const lateMail = mailTo(s, emma).some((e) => /late|minutes|running/i.test(`${e.subject} ${e.body}`));
  add(
    { id: "late", code: "TM-4", group: "Quick ones: by chat", label: "\"Running 5 minutes late\" went to Emma by Teams chat" },
    lateChat && !lateMail,
    lateMail ? "You emailed Emma that you're running late. She might not see an email before 11:30. A chat pops up straight away." : "Open Emma's chat in Teams and tell her you're running 5 minutes late.",
  );

  const credit = mailTo(s, tom).some((e) => /HP-?\s?2291/i.test(`${e.subject} ${e.body}`) && /credit/i.test(`${e.subject} ${e.body}`));
  add(
    { id: "credit", code: "TM-4", group: "Needs a record: by email", label: "The credit note request went to Tom Hale by email" },
    credit,
    mailTo(s, tom).length ? "Your email to Tom needs the invoice number, HP-2291, and to ask for a credit note." : "Tom works for another company, and money needs a record: email him from Outlook, with the invoice number and what you need.",
  );
  const report = mailTo(s, daniel).some((e) => e.links.some((l) => /delivery report/i.test(l.fileName)) || e.attachments.some((a) => /delivery report/i.test(a.name)));
  add(
    { id: "report", code: "TM-4", group: "Needs a record: by email", label: "The signed-off delivery report went to Daniel by email, with the file" },
    report,
    mailTo(s, daniel).length ? `Your email to Daniel needs the report itself. Press Insert link and pick ${REPORT} in Operations Team > Documents > Deliveries > 2026.` : `Email Daniel from Outlook. Press Insert link and pick ${REPORT} in Operations Team > Documents > Deliveries > 2026.`,
  );
  const both = sentMail(s).filter((e) => has([...e.to, ...e.cc], sarah) && has([...e.to, ...e.cc], priya));
  const actions = both[both.length - 1];
  const chatOnly = !actions && (saidTo(s, sarah).some((x) => /aisle|recount|action/i.test(x.text)) || saidTo(s, priya).some((x) => /2291|chase|action/i.test(x.text)));
  add(
    { id: "actions-sent", code: "TM-4", group: "Needs a record: by email", label: "The actions went to Sarah and Priya by email" },
    !!actions,
    chatOnly ? "You sent the actions in a chat. Actions need a record people can find later, so send them by email to Sarah and Priya." : "Write one email to Sarah and Priya (Daniel on Cc if you like) with the actions from the meeting.",
  );
  const body = actions?.body ?? "";
  const missing = actions ? "" : "Send the actions email first. ";
  add(
    { id: "action-sarah", code: "TM-5", group: "The actions: who, what, by when", label: "Sarah: recount aisle C, by Friday" },
    !!actions && actionLine(body, [/sarah/i, /recount|aisle\s*c/i, /fri/i]),
    `${missing}Put Sarah's action on one line: who, what and by when, like \"Sarah: recount aisle C by Friday\".`,
  );
  add(
    { id: "action-priya", code: "TM-5", group: "The actions: who, what, by when", label: "Priya: chase HP-2291 with Harlow, by Friday" },
    !!actions && actionLine(body, [/priya/i, /2291|chase|harlow/i, /fri/i]),
    `${missing}Put Priya's action on one line, like \"Priya: chase Harlow about HP-2291 by Friday\".`,
  );
  add(
    { id: "action-you", code: "TM-5", group: "The actions: who, what, by when", label: "You: update the stock sheet, by Thursday" },
    !!actions && actionLine(body, [ME, /stock\s*sheet/i, /thu|today/i]),
    `${missing}Your own action counts too: \"Me: update the stock sheet by Thursday\".`,
  );
  return out;
}

export const chatOrEmail: Job = {
  id: "m3j3",
  slug: "chat-or-email",
  ...MODULE,
  title: "Chat or email?",
  summary: "Five things to send before lunch. Pick Teams chat or email for each, and write up the stock meeting's actions: who, what and by when.",
  clock: "Thu 12 Nov, 11:10",
  deadline: "All five before lunch",
  doneLine: "The quick ones went by chat, the ones that need a record went by email, and every action has an owner and a date.",
  brief: "Daniel has sent you a list on Teams. Send each thing the right way. When you think it's done, press Check my work.",
  hints: [
    "Quick, and nobody needs it later? Teams chat. Money, files, other companies or anything people need to find again? Email.",
    "The printer question goes to Sarah, and the late note to Emma, both in Teams chat.",
    "Tom is outside the company: email him about HP-2291. Email Daniel a link to the delivery report.",
    "Read the November stock count chat for the actions. Email Sarah and Priya one line per action: who, what, by when.",
  ],
  apps: ["teams", "calendar"],
  start: "teams",
  seed: seedFive,
  check: checkFive,
  habits: [
    { label: "Put it where the brief says", checks: ["printer", "late", "credit", "report", "actions-sent"] },
    { label: "Check your own work", checks: ["action-sarah", "action-priya", "action-you"] },
  ],
};

