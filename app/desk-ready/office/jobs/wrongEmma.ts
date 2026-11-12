import { inbound, officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import { CLARKSON_REPLY, EMMA_CLARKSON, OVERTIME, OVERTIME_NAME } from "../safety";
import type { Check, Email, Job, OfficeState } from "../types";

/* E11.2 The wrong Emma (criterion SAFE-4). Daniel: "Send November's
 * overtime sheet to Emma in HR." Typing "Emma" in the To box offers Emma
 * Clarkson first (a customer at Bright Cafe, who emailed this morning) and
 * Emma Clarke (HR) second, as Outlook puts the most recent first. Outlook
 * marks Clarkson as External and shows a warning above To once she's on
 * the email. Done means: the sheet goes only to
 * emma.clarke@northfieldsupplies.example. Sent to Clarkson, she writes
 * back, and the scorecard teaches the wrong-person lesson: tell your
 * manager straight away, and ask the person to delete it. */

export const DANIEL_OVERTIME_ID = "m-daniel-overtime";

function seed(): OfficeState {
  const emails: Email[] = [
    inbound({
      id: DANIEL_OVERTIME_ID,
      from: PEOPLE.daniel,
      subject: "November's overtime sheet",
      time: "10:15",
      body: `Hi,\n\nSend November's overtime sheet to Emma in HR, please. It's attached. She needs it for payroll today.\n\nThanks,\nDaniel\n\n${SIGNATURE.daniel}`,
      attachments: [{ name: OVERTIME_NAME, sheet: OVERTIME }],
    }),
    inbound({
      id: "m-clarkson-order",
      from: EMMA_CLARKSON,
      subject: "Friday's order: 6 more cases of cups",
      time: "09:52",
      body: "Hi,\n\nCould you add 6 cases of the 8 oz paper cups to Friday's order? We've got a busy weekend.\n\nMany thanks,\nEmma Clarkson\nBright Cafe, 22 Granby Street, Leicester",
    }),
    inbound({
      id: "m-xmas",
      from: PEOPLE.emma,
      subject: "Christmas holiday requests",
      time: "Mon 16:30",
      unread: false,
      body: "Hi all,\n\nIf you'd like time off over Christmas, please send in a holiday request form by Friday 20 November. Requests are agreed in the order they arrive.\n\nThanks,\nEmma\n\nEmma Clarke\nHR Advisor | Northfield Supplies",
    }),
    inbound({
      id: "m-fire-drill",
      from: PEOPLE.facilities,
      subject: "Fire drill on Thursday at 11:00",
      time: "Mon 15:30",
      unread: false,
      body: "Hello all,\n\nThe alarm will sound for about two minutes on Thursday at 11:00. Please leave by the nearest exit and meet in the car park.\n\nFacilities Team",
    }),
  ];
  return {
    version: 0,
    files: officeFolders(),
    emails,
    contacts: [EMMA_CLARKSON],
    replies: [{ to: EMMA_CLARKSON.address, reply: CLARKSON_REPLY }],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const carries = (e: Email) => e.attachments.some((a) => /overtime/i.test(a.name)) || e.links.some((l) => /overtime/i.test(l.fileName));
const everyone = (e: Email) => [...e.to, ...e.cc, ...(e.bcc ?? [])];
/* HR (Emma Clarke or the HR mailbox), and Daniel, who sent it, may see it. */
const allowed = (address: string) => [PEOPLE.emma.address, PEOPLE.hr.address, PEOPLE.daniel.address].includes(address.toLowerCase());

function check(s: OfficeState): Check[] {
  const sent = s.emails.filter((e) => e.folder === "sent");
  const withSheet = sent.filter(carries);
  const toEmma = sent.filter((e) => everyone(e).some((p) => p.address === PEOPLE.emma.address || p.address === PEOPLE.hr.address));
  const leaks = withSheet.flatMap(everyone).filter((p) => !allowed(p.address));
  const leak = leaks[0];
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  add(
    { id: "to-hr", code: "SAFE-4", group: "The overtime sheet", label: "It went to Emma Clarke in HR" },
    withSheet.some((e) => everyone(e).some((p) => p.address === PEOPLE.emma.address || p.address === PEOPLE.hr.address)),
    toEmma.length ? "Your email to Emma Clarke has no overtime sheet on it. Forward Daniel's email, so the attachment goes too." : `Nothing with the overtime sheet has gone to Emma Clarke (${PEOPLE.emma.address}) yet. Open Daniel's email and press Forward.`,
  );
  add(
    { id: "only-hr", code: "SAFE-4", group: "The overtime sheet", label: "Nobody else got it" },
    !leak,
    leak
      ? leak.address === EMMA_CLARKSON.address
        ? "It went to Emma Clarkson at Bright Cafe: a customer, outside the company. That's everyone's pay sent to a stranger, a data breach. Outlook marked her External and warned you above the To line. At work, tell Daniel straight away, and ask Emma Clarkson to delete it (she's written back). Here, press Start the job again and send it only to Emma Clarke, HR. Read the address before you press Send."
        : `It also went to ${leak.name} (${leak.address}). Payroll is for HR only. At work, tell Daniel straight away and ask them to delete it. Here, start the job again and send it only to Emma Clarke.`
      : undefined,
  );
  add(
    { id: "attached", code: "OL-6", group: "Check your own work", label: "The sheet was on the email to HR" },
    toEmma.some(carries),
    toEmma.length
      ? "Your email to Emma Clarke didn't carry the overtime sheet. Forward Daniel's email (the attachment comes with it), or use Attach file."
      : "No email has gone to HR yet, so the sheet hasn't either. Forward Daniel's email to Emma Clarke: the attachment comes with it.",
  );
  return out;
}

export const wrongEmma: Job = {
  id: "m11j2",
  slug: "wrong-emma",
  moduleId: "m11",
  moduleLabel: "Module 11: Staying safe at work",
  title: "The wrong Emma",
  summary: "Daniel needs the overtime sheet sent to Emma in HR. Outlook knows two Emmas.",
  clock: "Wed 11 Nov, 10:15",
  deadline: "HR need it for payroll today",
  doneLine: "Everyone's pay went to HR and nobody else. That's personal data handled properly.",
  brief: "Daniel has emailed you a job. Do what he asks, and check who it's going to before you press Send. When you think it's done, press Check my work.",
  hints: [
    "Open Daniel's email and press Forward: the attachment comes with it.",
    "Type \"Emma\" in To. Read every suggestion: the name, the address under it, and who they are.",
    "A yellow bar above To means someone on the email is outside the company. For payroll, that's a stop sign.",
  ],
  seed,
  check,
  habits: [{ label: "Check your own work", checks: ["only-hr", "attached"] }],
};
