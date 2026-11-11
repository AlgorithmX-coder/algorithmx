import { fold, timed } from "../admin";
import { inbound, officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import type { Check, Email, Job, OfficeState, PhoneCall } from "../types";

/* E10.3 Take a phone message (criterion ADM-4). The desk phone rings at
 * 14:20: Mr Ahmed from Kent Bakery wants Thursday's flour changed from 20
 * sacks to 30, and asks Sarah to call him back on 0116 496 0738 before
 * 4pm. Sarah is on the warehouse floor, so the learner takes the message
 * and emails it to her, with the subject "Phone message: Kent Bakery wants
 * 30 sacks on Thursday", saying who called, when, the change, the number
 * and the deadline. Wording is free; the facts are marked strictly. */

export const KENT_CALL_ID = "call-kent";
const NUMBER = "0116 496 0738";

export const KENT_CALL: PhoneCall = {
  id: KENT_CALL_ID,
  name: "Mr Ahmed",
  company: "Kent Bakery",
  number: NUMBER,
  time: "14:20",
  way: "in",
  ringing: true,
  ...timed([
    { who: "you", text: "Good afternoon, Northfield Supplies, how can I help?" },
    { who: "them", text: "Hello, it's Mr Ahmed from Kent Bakery. Is Sarah there, please?" },
    { who: "you", text: "She's out on the warehouse floor at the moment. Can I take a message?" },
    { who: "them", text: "Yes please. It's about our flour delivery on Thursday. We've got 20 sacks booked, but we need 30 now. A big wedding order has just come in." },
    { who: "you", text: "So Thursday's flour goes up from 20 sacks to 30." },
    { who: "them", text: "That's it. Can she ring me back to confirm? I need to know before 4pm, so I can sort out my staff for Thursday." },
    { who: "you", text: "Of course. What's the best number to call you on?" },
    { who: "them", text: "0116 496 0738." },
    { who: "you", text: "Let me read that back: 0116 496 0738. And it's Mr Ahmed, A H M E D?" },
    { who: "them", text: "That's right. Thanks very much. Bye." },
  ]),
};

/* Earlier calls today, so the phone looks lived in. */
const EARLIER: PhoneCall[] = [
  { id: "call-tom", name: "Tom Hale", company: "Harlow Packaging", number: "01632 960 552", time: "11:05", way: "in", seconds: 134 },
  { id: "call-sarah", name: "Sarah Patel", company: "Warehouse, ext 412", number: "Ext 412", time: "09:31", way: "out", seconds: 48 },
  { id: "call-missed", name: "01632 960 870", company: "Kent Flour Mills", number: "01632 960 870", time: "08:47", way: "missed", seconds: 0 },
];

function seed(): OfficeState {
  return {
    version: 0,
    files: officeFolders(),
    phone: { calls: [KENT_CALL, ...EARLIER], answered: [] },
    emails: [
      inbound({
        id: "m-sarah-floor",
        from: PEOPLE.sarah,
        subject: "On the floor this afternoon",
        time: "13:05",
        unread: false,
        body: `Hi,\n\nI'm on the warehouse floor doing the stock count all afternoon, so I won't be at my desk. If anyone rings for me, take a message and email it to me. I'll see it on my phone.\n\nThanks,\nSarah\n\n${SIGNATURE.sarah}`,
      }),
      inbound({
        id: "m-fire-drill",
        from: PEOPLE.facilities,
        subject: "Fire drill on Thursday at 11:00",
        time: "Mon 15:30",
        unread: false,
        body: "Hello all,\n\nThe alarm will sound for about two minutes on Thursday at 11:00. Please leave by the nearest exit and meet in the car park.\n\nFacilities Team",
      }),
    ],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

/* Every phone number written in a piece of text, folded to its digits. */
const numbersIn = (t: string) => (t.match(/0[\d\s]{9,14}\d/g) ?? []).map((n) => fold(n)).filter((n) => n.length === 11);

/* The old and new amounts in one sentence, once times like 14:20 and the
 * phone number are taken out, so "rang at 14:20 for 30 sacks" is not read
 * as 20 to 30. */
function changeOk(b: string): boolean {
  const t = b.replace(/\b\d{1,2}[:.]\d{2}\b/g, " ").replace(/0[\d\s]{9,14}\d/g, " ");
  return /\b20\b[^.\n]{0,60}\b30\b|\b30\b[^.\n]{0,60}\b20\b/.test(t) && /thursday/i.test(t) && /(sack|flour)/i.test(t);
}

function check(s: OfficeState): Check[] {
  const toSarah = s.emails.filter((e) => e.folder === "sent" && [...e.to, ...e.cc].some((p) => p.address === PEOPLE.sarah.address));
  /* the best of them: the one with the number in, else the latest */
  const mail: Email | undefined = toSarah.slice().reverse().find((e) => fold(e.body).includes("01164960738")) ?? toSarah[toSarah.length - 1];
  const b = mail?.body ?? "";
  const subj = mail?.subject ?? "";
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const first = "Email Sarah first: New mail, to Sarah Patel.";

  add({ id: "sent", code: "OL-5", group: "The message to Sarah", label: "You emailed the message to Sarah" }, !!mail, "Nothing has gone to Sarah yet. In Outlook press New mail, and send it to Sarah Patel.");
  add(
    { id: "subject", code: "OL-2", group: "The message to Sarah", label: 'The subject says what it is: "Phone message: Kent Bakery wants 30 sacks on Thursday"' },
    !!mail && /^\s*phone message/i.test(subj) && /kent bakery/i.test(subj) && /\b30\b/.test(subj) && /thursday/i.test(subj),
    !mail ? first : `Your subject is "${subj || "(empty)"}". Start with "Phone message:", then who wants what, and when: "Phone message: Kent Bakery wants 30 sacks on Thursday".`,
  );
  add(
    { id: "who", code: "ADM-4", group: "What it says", label: "Who rang: Mr Ahmed from Kent Bakery" },
    !!mail && /ahmed/i.test(b) && /kent bakery/i.test(b),
    !mail ? first : "Say who called, with their company, in the email itself: Mr Ahmed from Kent Bakery.",
  );
  add(
    { id: "when", code: "ADM-4", group: "What it says", label: "When he rang: 14:20" },
    !!mail && /\b(14[:.]20|2[:.]20)(?!\d)/.test(b),
    !mail ? first : "Say when the call came in: 14:20 (2:20pm). Sarah needs to know how long he has been waiting.",
  );
  add(
    { id: "change", code: "ADM-4", group: "What it says", label: "The change: Thursday's flour goes from 20 sacks to 30" },
    !!mail && changeOk(b),
    !mail ? first : "Give the change in full, old and new: Thursday's flour from 20 sacks to 30.",
  );
  const nums = numbersIn(b);
  add(
    { id: "number", code: "ADM-4", group: "What it says", label: `The number to call back: ${NUMBER}` },
    !!mail && fold(b).includes("01164960738"),
    !mail ? first : nums.length ? `The number in your email is ${nums[0].replace(/^(\d{4})(\d{3})(\d{4})$/, "$1 $2 $3")}. He said ${NUMBER}. Play the call again and check each digit.` : `Put his number in, so Sarah can ring straight back: ${NUMBER}.`,
  );
  add(
    { id: "deadline", code: "ADM-4", group: "What it says", label: "The deadline: call back before 4pm" },
    !!mail && /(before|by)\s*(4|four|16[:.]?00)|\b4\s*(pm|p\.m|o.?clock)|\b16[:.]00\b/i.test(b),
    !mail ? first : "Say by when he needs the call: before 4pm. Without it Sarah might ring tomorrow, too late.",
  );
  return out;
}

export const phoneMessage: Job = {
  id: "m10j3",
  slug: "phone-message",
  moduleId: "m10",
  moduleLabel: "Module 10: Admin in practice",
  title: "Take a phone message",
  summary: "Kent Bakery rings for Sarah while she's on the warehouse floor. Take the message and email it to her.",
  clock: "Wed 11 Nov, 14:20",
  deadline: "He needs a call back before 16:00",
  doneLine: "Sarah can ring Mr Ahmed back in time, with everything she needs in one email.",
  brief: "The phone on your desk is ringing. Answer it and listen to the whole call. Sarah is out on the warehouse floor, so take a message and email it to her. When you think it's done, press Check my work.",
  hints: [
    "Press the green Answer button. The words appear as they are said. Press Play again or Show all the words to go over it.",
    "Jot down five things: who rang, when, what they want, the number, and by when.",
    'In Outlook, press New mail, and send it to Sarah Patel. Start the subject with "Phone message:".',
    "Read the number back against the call before you press Send.",
  ],
  apps: ["phone"],
  start: "phone",
  seed,
  check,
  habits: [
    { label: "Name it so anyone can find it", checks: ["subject"] },
    { label: "Check your own work", checks: ["change", "number", "deadline"] },
    { label: "Close the loop", checks: ["sent", "who", "when"] },
  ],
};
