import { inbound, KENT_STAFF, officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import type { Check, Email, Job, OfficeState, Person } from "../types";

/* E1.2 Reply, Reply all or Forward? (criteria OL-3, OL-4, OL-5). Kent
 * Bakery complain about Friday's late flour, with four of their staff on
 * Cc. Everyone on the email needs the apology, so it is a Reply all. Sarah
 * needs the complaint to take up with the haulier, so it is a Forward,
 * and nothing internal may reach the customer. */

const KENT = "m-kent";
const isKent = (p: Person) => p.address.endsWith("@kentbakery.example");

function seed(): OfficeState {
  const emails: Email[] = [
    inbound({
      id: "m-daniel-kent",
      from: PEOPLE.daniel,
      subject: "Kent Bakery complaint",
      time: "09:02",
      body: `Hi,\n\nKent Bakery have complained about Friday's late flour (it's in your inbox). Sarah says the haulier's van broke down on the M1, which is why it came at 11:40.\n\nCan you:\n1. Reply to them all with an apology and the reason. Their whole team was affected, so make sure everyone on their email gets it.\n2. Forward their email to Sarah, so she can take it up with the haulier.\n\nKeep anything internal between us, please. Don't copy Kent Bakery into the email to Sarah.\n\nThanks,\nDaniel\n\n${SIGNATURE.daniel}`,
    }),
    inbound({
      id: KENT,
      from: PEOPLE.imran,
      cc: KENT_STAFF,
      subject: "Late delivery on Friday",
      time: "Fri 16:55",
      body: "Hello,\n\nOur flour order on Friday arrived at 11:40, not 08:00 as booked. We had to close the bakery counter for the morning.\n\nPlease let us all know what happened, and how you will stop it happening again.\n\nImran Ahmed\nOwner, Kent Bakery",
    }),
    inbound({
      id: "m-rota-2",
      from: PEOPLE.hr,
      subject: "Your rota for next week",
      time: "Fri 10:05",
      unread: false,
      body: "Hi,\n\nYour shifts for 16 to 22 November are on the rota in the HR site.\n\nHR Team",
    }),
  ];
  return { version: 0, files: officeFolders(), emails };
}

function check(s: OfficeState): Check[] {
  const sent = s.emails.filter((e) => e.folder === "sent");
  const everyone = [PEOPLE.imran, ...KENT_STAFF];
  const has = (e: Email, p: Person) => [...e.to, ...e.cc, ...(e.bcc ?? [])].some((x) => x.address === p.address);
  const toKent = sent.filter((e) => [...e.to, ...e.cc, ...(e.bcc ?? [])].some(isKent));
  /* A learner who puts a slip right with a second email is marked on the
   * better one: the reply that reached the most of the bakery's people, the
   * latest first on a tie. */
  const reach = (e: Email) => everyone.filter((p) => has(e, p)).length;
  const reply = toKent
    .slice()
    .reverse()
    .sort((a, b) => reach(b) - reach(a))[0];
  const toSarah = sent.filter((e) => has(e, PEOPLE.sarah)).reverse();
  const forward = toSarah.find((e) => /^fw/i.test(e.subject.trim()) && e.inReplyTo === KENT && !toKent.includes(e)) ?? toSarah.find((e) => /^fw/i.test(e.subject.trim())) ?? toSarah[0];
  const missing = reply ? everyone.filter((p) => !has(reply, p)) : everyone;
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  add(
    { id: "reply-all", code: "OL-5", group: "The reply to Kent Bakery", label: "Everyone on their email got your reply (Reply all)" },
    !!reply && missing.length === 0,
    !reply
      ? "Nothing has gone to Kent Bakery yet. Open their email and press Reply all."
      : `${missing.map((p) => p.name).join(", ")} didn't get it. Reply only goes to the sender; Reply all keeps everyone on Cc.`,
  );
  add(
    { id: "kept-subject", code: "OL-2", group: "The reply to Kent Bakery", label: 'It kept the subject, "Re: Late delivery on Friday"' },
    !!reply && /late delivery/i.test(reply.subject),
    "Keep the subject when you reply, so the bakery see at once what it answers.",
  );
  add(
    { id: "greeting", code: "OL-3", group: "The reply to Kent Bakery", label: "It opens with a greeting that suits a customer" },
    !!reply && /^\s*(dear|hi|hello|good (morning|afternoon))\b/i.test(reply.body),
    'Start with a greeting on its own line, for example "Dear Imran," or "Hello everyone,".',
  );
  add(
    { id: "sorry", code: "OL-4", group: "The reply to Kent Bakery", label: "It says sorry and gives the reason: the van broke down" },
    !!reply && /sorry|apologi[sz]e/i.test(reply.body) && /van|broke|break ?down|m1|haulier/i.test(reply.body),
    !reply || !/sorry|apologi[sz]e/i.test(reply.body) ? "Say sorry plainly, near the start." : "Give the reason in one line: the haulier's van broke down on the M1.",
  );

  add(
    { id: "forward", code: "OL-5", group: "The email to Sarah", label: "You forwarded their email to Sarah" },
    !!forward && /^fw/i.test(forward.subject.trim()) && forward.inReplyTo === KENT,
    !forward ? "Open Kent Bakery's email and press Forward, then put Sarah in To." : "Use Forward on Kent Bakery's email, so Sarah gets their message underneath yours.",
  );
  add(
    { id: "internal", code: "OL-5", group: "The email to Sarah", label: "Nobody at Kent Bakery is copied into it" },
    !!forward && ![...forward.to, ...forward.cc, ...(forward.bcc ?? [])].some(isKent),
    !forward ? "Forward it to Sarah first." : "Kent Bakery are copied into your email to Sarah. Internal notes about the haulier stay inside the company.",
  );
  add(
    { id: "note", code: "OL-4", group: "The email to Sarah", label: "You told Sarah what you need from her" },
    !!forward && forward.body.trim().split(/\s+/).length >= 6,
    "Add a line above the forwarded email, for example: \"Hi Sarah, can you take this up with the haulier? I've replied to Kent Bakery.\"",
  );
  return out;
}

export const lateDelivery: Job = {
  id: "m1j2",
  slug: "late-delivery",
  moduleId: "m1",
  moduleLabel: "Module 1: The work inbox",
  title: "Reply, Reply all or Forward?",
  summary: "A customer complains with four colleagues copied in. Answer them all, and pass it to Sarah without the customer seeing.",
  clock: "09:03",
  deadline: "Daniel wants it sorted this morning",
  doneLine: "The bakery have their apology, all five of them, and Sarah has what she needs. Nothing internal leaked.",
  brief: "Daniel has emailed you about a complaint. Read his email, then do the two things he asks. When you think it's done, press Check my work.",
  hints: [
    "Read Daniel's email, then open Kent Bakery's. Look at how many people are on Cc.",
    "Press Reply all on Kent Bakery's email: say sorry, give the reason, and sign off.",
    "Then open Kent Bakery's email again and press Forward. Put Sarah in To, and add a line saying what you need.",
    "Check the To and Cc boxes on the forward: no one from Kent Bakery.",
  ],
  seed,
  check,
  habits: [
    { label: "Close the loop", checks: ["reply-all", "forward"] },
    { label: "Check your own work", checks: ["internal", "kept-subject"] },
  ],
};
