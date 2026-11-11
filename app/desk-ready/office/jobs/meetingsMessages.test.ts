import { describe, expect, it } from "vitest";
import { ROOMS, calOf, clashes, fromMin, teamsOf, toMin, withCall, withResponse } from "../meetings";
import { PEOPLE, YOU } from "../northfield";
import type { Email, Meeting, OfficeState } from "../types";
import { chatOrEmail, rotaCall, stockMeeting } from "./meetingsMessages";

/* Module 3's office jobs: a fresh office fails, the job done as the
 * exercise bank describes passes every check, and each classic mistake
 * fails the check it should, and only that one where it can. */

const failing = (job: typeof stockMeeting, s: OfficeState) => job.check(s).filter((c) => !c.ok).map((c) => c.id);
const { sarah, priya, daniel, emma, tom, hr } = PEOPLE;
const ROOM2 = ROOMS[1];

/* ── E3.1 ── */

function invite(over: Partial<Meeting> = {}): Meeting {
  return { id: "mine", title: "November stock count", organiser: YOU, attendees: [sarah, priya], room: ROOM2, teams: true, day: "2026-11-12", start: "10:00", end: "10:30", body: "November stock count: agree the figures", sent: true, response: "accepted", ...over };
}

function booked(over: Partial<Meeting> = {}, tell = true, extra: Meeting[] = []): OfficeState {
  const s = stockMeeting.seed();
  const cal = calOf(s);
  const t = teamsOf(s);
  return {
    ...s,
    calendar: { ...cal, meetings: [...cal.meetings, invite(over), ...extra] },
    teams: tell ? { ...t, chats: t.chats.map((c) => (c.id === "chat-daniel" ? { ...c, messages: [...c.messages, { id: "x", from: YOU, time: "09:30", text: "Done, booked Thursday 10:00 to 10:30 in Room 2." }] } : c)) } : t,
  };
}

describe("E3.1 Book the stock meeting", () => {
  it("fails every check on a fresh office", () => {
    expect(stockMeeting.check(stockMeeting.seed()).filter((c) => c.ok).map((c) => c.id)).toEqual(["one"]);
  });
  it("passes when booked Thursday 10:00 to 10:30 in Room 2 with the agenda", () => {
    expect(failing(stockMeeting, booked())).toEqual([]);
  });
  it("10:00 is the only half hour on Thursday morning that suits everyone", () => {
    const s = stockMeeting.seed();
    const free = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"].filter((start) => clashes(s, { day: "2026-11-12", start, end: fromMin(toMin(start) + 30) }, [YOU, sarah, priya, ROOM2]).length === 0);
    expect(free).toEqual(["10:00"]);
  });
  it("catches a clash with Sarah, and names her", () => {
    const s = booked({ start: "09:30", end: "10:00" });
    expect(failing(stockMeeting, s)).toEqual(["free"]);
    expect(stockMeeting.check(s).find((c) => c.id === "free")?.fix).toMatch(/Sarah Patel is busy 09:00 to 10:00/);
  });
  it("catches 11:30, when the learner has their own induction", () => {
    expect(failing(stockMeeting, booked({ start: "11:30", end: "12:00" }))).toEqual(["free"]);
  });
  it("catches the wrong room, the wrong length, a missing person and no agenda", () => {
    expect(failing(stockMeeting, booked({ room: ROOMS[0] }))).toEqual(["free", "room"]);
    expect(failing(stockMeeting, booked({ room: undefined }))).toEqual(["room"]);
    expect(failing(stockMeeting, booked({ end: "11:00" }))).toEqual(["length", "free"]);
    expect(failing(stockMeeting, booked({ attendees: [sarah] }))).toEqual(["sent"]);
    expect(failing(stockMeeting, booked({ body: "" }))).toEqual(["agenda"]);
    expect(failing(stockMeeting, booked({ title: "Meeting" }))).toEqual(["title"]);
  });
  it("catches the wrong day, two invites, and not telling Daniel", () => {
    expect(failing(stockMeeting, booked({ day: "2026-11-13" }))).toEqual(["day", "free"]);
    expect(failing(stockMeeting, booked({}, true, [invite({ id: "again", start: "09:30", end: "10:00" })]))).toEqual(["one", "free"]);
    expect(failing(stockMeeting, booked({}, false))).toEqual(["told"]);
  });
});

/* ── E3.2 ── */

const ROTA = "seed-rota-call";

function onCall(opts: { response?: Meeting["response"]; mic?: boolean; camera?: boolean; shared?: string[]; join?: boolean } = {}): OfficeState {
  const { response = "accepted", mic = false, camera = true, shared = ["excel-rota"], join = true } = opts;
  let s = withResponse(rotaCall.seed(), ROTA, response);
  if (!join) return s;
  const m = calOf(s).meetings.find((x) => x.id === ROTA)!;
  s = withCall(s, m);
  const t = teamsOf(s);
  return { ...s, teams: { ...t, call: { ...t.call!, stage: "in", mic, camera, joinedWith: { mic, camera }, shared, sharing: shared[shared.length - 1] ?? null } } };
}

describe("E3.2 On the call", () => {
  it("fails on a fresh office", () => {
    expect(failing(rotaCall, rotaCall.seed())).toEqual(["accepted", "joined", "muted", "camera", "shared", "private"]);
  });
  it("passes: accepted, joined muted with the camera on, sharing only Excel", () => {
    expect(failing(rotaCall, onCall())).toEqual([]);
  });
  it("Join from the invite starts with the mic on and the camera off", () => {
    const s = withCall(rotaCall.seed(), calOf(rotaCall.seed()).meetings.find((x) => x.id === ROTA)!);
    expect(teamsOf(s).call).toMatchObject({ stage: "prejoin", mic: true, camera: false, shared: [] });
  });
  it("catches each mistake", () => {
    expect(failing(rotaCall, onCall({ response: "tentative" }))).toEqual(["accepted"]);
    expect(failing(rotaCall, onCall({ response: "declined" }))).toEqual(["accepted"]);
    expect(failing(rotaCall, onCall({ mic: true }))).toEqual(["muted"]);
    expect(failing(rotaCall, onCall({ camera: false }))).toEqual(["camera"]);
    expect(failing(rotaCall, onCall({ shared: [] }))).toEqual(["shared"]);
    expect(failing(rotaCall, onCall({ join: false }))).toEqual(["joined", "muted", "camera", "shared", "private"]);
  });
  it("sharing the whole screen or the Outlook window shows the private email, even after switching to Excel", () => {
    expect(failing(rotaCall, onCall({ shared: ["screen"] }))).toEqual(["shared", "private"]);
    expect(failing(rotaCall, onCall({ shared: ["outlook-pay", "excel-rota"] }))).toEqual(["private"]);
    expect(rotaCall.check(onCall({ shared: ["screen"] })).find((c) => c.id === "private")?.fix).toMatch(/whole screen/);
  });
  it("rejoining keeps what was shared earlier", () => {
    const s = onCall({ shared: ["screen"] });
    const again = withCall({ ...s, teams: { ...teamsOf(s), call: { ...teamsOf(s).call!, stage: "left" } } }, calOf(s).meetings.find((x) => x.id === ROTA)!);
    expect(teamsOf(again).call?.shared).toEqual(["screen"]);
  });
});

/* ── E3.3 ── */

const ACTIONS = "Hi Sarah and Priya,\n\nHere are the actions from this morning's stock meeting:\n\nSarah: recount aisle C by Friday 13 November\nPriya: chase Harlow about HP-2291 by Friday 13 November\nMe: update the stock sheet by Thursday (today)\n\nThanks";

function mail(to: typeof sarah[], body: string, over: Partial<Email> = {}): Email {
  return { id: `m-${Math.random()}`, folder: "sent", from: YOU, to, cc: [], subject: "Actions", body, time: "Just now", attachments: [], links: [], ...over };
}

function say(s: OfficeState, chatId: string, text: string): OfficeState {
  const t = teamsOf(s);
  return { ...s, teams: { ...t, chats: t.chats.map((c) => (c.id === chatId ? { ...c, messages: [...c.messages, { id: `y-${text.length}`, from: YOU, time: "11:12", text }] } : c)) } };
}

function sentFive(skip: string[] = [], extra: Email[] = []): OfficeState {
  let s = chatOrEmail.seed();
  if (!skip.includes("printer")) s = say(s, "chat-sarah", "Hi Sarah, is the warehouse printer fixed yet?");
  if (!skip.includes("late")) s = say(s, "chat-emma", "Hi Emma, I'm running 5 minutes late for 11:30, sorry.");
  const emails: Email[] = [];
  if (!skip.includes("credit")) emails.push(mail([tom], "Dear Mr Hale,\n\nCould you send a credit note for invoice HP-2291? Two pallets were short: £115.20 with VAT.", { subject: "Invoice HP-2291: credit note" }));
  if (!skip.includes("report")) emails.push(mail([daniel], "Hi Daniel, here's the signed-off delivery report.", { subject: "Delivery report", links: [{ name: "2026-11-10 Delivery report.xlsx", path: ["Operations Team", "Documents", "Deliveries", "2026"], fileName: "2026-11-10 Delivery report.xlsx" }] }));
  if (!skip.includes("actions")) emails.push(mail([sarah, priya], ACTIONS, { cc: [daniel], subject: "Actions from the November stock count" }));
  return { ...s, emails: [...s.emails, ...emails, ...extra] };
}

describe("E3.3 Chat or email?", () => {
  it("fails every check on a fresh office", () => {
    expect(chatOrEmail.check(chatOrEmail.seed()).every((c) => !c.ok)).toBe(true);
  });
  it("passes with two chats and three emails, and every action owned and dated", () => {
    expect(failing(chatOrEmail, sentFive())).toEqual([]);
  });
  it("an action written as a sentence still counts", () => {
    const s = sentFive(["actions"], [mail([sarah, priya], "Hi both,\n\nSarah will recount aisle C by Friday. Priya will chase HP-2291 by Friday. I'll update the stock sheet by Thursday.\n\nThanks")]);
    expect(failing(chatOrEmail, s)).toEqual([]);
  });
  it("catches a quick question sent by email instead of chat", () => {
    expect(failing(chatOrEmail, sentFive(["printer"], [mail([sarah], "Is the printer fixed?")]))).toEqual(["printer"]);
    expect(failing(chatOrEmail, sentFive([], [mail([emma], "Running 5 minutes late, sorry!")]))).toEqual(["late"]);
  });
  it("catches the actions sent only by chat, and a report sent with no file", () => {
    const s = say(sentFive(["actions"]), "chat-stock", ACTIONS);
    expect(failing(chatOrEmail, s)).toEqual(["actions-sent", "action-sarah", "action-priya", "action-you"]);
    expect(chatOrEmail.check(s).find((c) => c.id === "actions-sent")?.fix).toMatch(/record/);
    expect(failing(chatOrEmail, sentFive(["report"], [mail([daniel], "Report's done.")]))).toEqual(["report"]);
  });
  it("catches an action with no owner or no date", () => {
    const noDate = ACTIONS.replace("recount aisle C by Friday 13 November", "recount aisle C");
    expect(failing(chatOrEmail, sentFive(["actions"], [mail([sarah, priya], noDate)]))).toEqual(["action-sarah"]);
    const noOwner = ACTIONS.replace("Me: update the stock sheet by Thursday (today)", "Update the stock sheet");
    expect(failing(chatOrEmail, sentFive(["actions"], [mail([sarah, priya], noOwner)]))).toEqual(["action-you"]);
  });
  it("Tom is outside the company, so the credit note can only go by email", () => {
    expect(failing(chatOrEmail, sentFive(["credit"]))).toEqual(["credit"]);
    expect(hr.address.endsWith("@northfieldsupplies.example")).toBe(true);
    expect(tom.address.endsWith("@northfieldsupplies.example")).toBe(false);
  });
});
