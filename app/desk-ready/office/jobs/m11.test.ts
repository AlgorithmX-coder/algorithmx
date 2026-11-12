import { describe, expect, it } from "vitest";
import { PEOPLE, YOU } from "../northfield";
import { CLARKSON_REPLY, deliverReplies, EMMA_CLARKSON, HARLOW_MAIN, IT_HELPDESK, isInternal, OVERTIME_NAME, OVERTIME, reach, SCAM_EMAIL_ID, SCAM_NUMBER, SCAMMER, TOM_NUMBER, PHONE_BOOK } from "../safety";
import type { Email, OfficeState, PhoneCall } from "../types";
import { bankDetails, BANK_INVOICE_ID } from "./bankDetails";
import { signInPrompt } from "./signInPrompt";
import { DANIEL_OVERTIME_ID, wrongEmma } from "./wrongEmma";

/* Module 11's office jobs: a fresh office fails, a job done as the brief
 * asks passes every check, and each classic mistake fails the right one. */

const sent = (to: { name: string; address: string }[], subject: string, body: string, over: Partial<Email> = {}): Email => ({
  id: `mail-${Math.random()}`,
  folder: "sent",
  from: YOU,
  to,
  cc: [],
  subject,
  body,
  time: "Just now",
  attachments: [],
  links: [],
  ...over,
});
const failing = (job: { check: (s: OfficeState) => { id: string; ok: boolean }[] }, s: OfficeState) =>
  job
    .check(s)
    .filter((c) => !c.ok)
    .map((c) => c.id);

/* A call the learner made on the desk phone, as the Phone app records it. */
const rang = (s: OfficeState, number: string): OfficeState => {
  const script = reach(number, s.dialable, s.phoneBook);
  const call: PhoneCall = { ...script, id: `call-out-${Math.random()}`, time: "08:44", way: "out" };
  return { ...s, phone: { calls: [call, ...(s.phone?.calls ?? [])], answered: s.phone?.answered ?? [] } };
};

describe("the safety data", () => {
  it("knows inside from outside", () => {
    expect(isInternal(PEOPLE.emma.address)).toBe(true);
    expect(isInternal(EMMA_CLARKSON.address)).toBe(false);
    expect(isInternal(SCAMMER.address)).toBe(false);
  });
  it("rings the right person for each number, however it is typed", () => {
    expect(reach("0116 496 0412", bankDetails.seed().dialable).name).toBe("Tom Hale");
    expect(reach("07700900461", bankDetails.seed().dialable).company).toMatch(/in the email/);
    expect(reach("ext 400", [], PHONE_BOOK).lines?.[0].text).toMatch(/Daniel Okafor/);
    expect(reach("01632 960 999").lines?.[0].text).toMatch(/not been recognised/);
  });
  it("never prints Tom's number in the scam", () => {
    const scam = bankDetails.seed().emails.find((e) => e.id === SCAM_EMAIL_ID)!;
    expect(scam.body).toContain(SCAM_NUMBER);
    expect(scam.body).not.toContain(TOM_NUMBER);
    expect(scam.from.address).toBe("accounts@harlow-packaging-uk.co");
  });
  it("delivers a waiting answer once, to the email that triggers it", () => {
    const s = wrongEmma.seed();
    const mail = sent([EMMA_CLARKSON], "FW: overtime", "");
    const once = deliverReplies({ ...s, emails: [...s.emails, mail] }, mail);
    expect(once.emails.filter((e) => e.subject === CLARKSON_REPLY.subject)).toHaveLength(1);
    expect(deliverReplies(once, mail).emails).toHaveLength(once.emails.length);
    expect(deliverReplies(s, sent([PEOPLE.emma], "x", ""))).toBe(s);
  });
});

/* ── E11.1 ────────────────────────────────────────────────────────────── */

describe("E11.1 The bank details have changed", () => {
  const priyaMail = sent([PEOPLE.priya], "Don't pay HP-2291 to new bank details", "Hi Priya,\n\nThe email asking us to pay HP-2291 to new bank details is a scam. Tom at Harlow says their bank details haven't changed. Please don't pay it.\n\nThanks");
  const solved = (edit: (s: OfficeState) => OfficeState = (s) => s) => {
    let s = bankDetails.seed();
    s = { ...s, emails: s.emails.map((e) => (e.id === SCAM_EMAIL_ID ? { ...e, reported: true, folder: "junk" } : e)) };
    s = rang(s, TOM_NUMBER);
    s = { ...s, emails: [...s.emails, priyaMail] };
    return edit(s);
  };
  it("fails a fresh office", () => {
    expect(failing(bankDetails, bankDetails.seed())).toEqual(["reported", "called-tom", "priya"]);
  });
  it("passes when it's reported, Tom is rung on file and Priya is told", () => {
    expect(failing(bankDetails, solved())).toEqual([]);
  });
  it("accepts Harlow's main line, and telling Priya by phone", () => {
    const viaMain = (s: OfficeState) => rang({ ...s, phone: { calls: [], answered: [] } }, HARLOW_MAIN);
    expect(failing(bankDetails, solved(viaMain))).toEqual([]);
    const byPhone = (s: OfficeState) => rang({ ...s, emails: s.emails.filter((e) => e !== priyaMail) }, "Ext 405");
    expect(failing(bankDetails, solved(byPhone))).toEqual([]);
  });
  it("fails when the link is clicked", () => {
    const clicked = solved((s) => ({ ...s, emails: s.emails.map((e) => (e.id === SCAM_EMAIL_ID ? { ...e, clicked: true } : e)) }));
    expect(failing(bankDetails, clicked)).toEqual(["no-click", "no-pay"]);
  });
  it("fails a reply to the scammer", () => {
    expect(failing(bankDetails, solved((s) => ({ ...s, emails: [...s.emails, sent([SCAMMER], "Re: new bank details", "Is this genuine?", { inReplyTo: SCAM_EMAIL_ID })] })))).toEqual(["no-reply"]);
  });
  it("fails ringing the number in the email, and says why", () => {
    const scamOnly = solved((s) => rang({ ...s, phone: { calls: [], answered: [] } }, SCAM_NUMBER));
    expect(failing(bankDetails, scamOnly)).toEqual(["called-tom", "not-scam-number"]);
    expect(bankDetails.check(scamOnly).find((c) => c.id === "called-tom")?.fix).toMatch(/number in the email/);
    /* ringing both still marks the scam call */
    expect(failing(bankDetails, solved((s) => rang(s, SCAM_NUMBER)))).toEqual(["not-scam-number"]);
  });
  it("fails approving the invoice for payment", () => {
    const approved = solved((s) => ({ ...s, files: s.files.map((f) => (f.id === BANK_INVOICE_ID ? { ...f, path: ["Finance", "Invoices", "Approved"] } : f)) }));
    expect(failing(bankDetails, approved)).toEqual(["no-pay"]);
  });
  it("fails without telling Priya, and a forward of the scam isn't telling her", () => {
    const quiet = solved((s) => ({ ...s, emails: s.emails.filter((e) => e !== priyaMail) }));
    expect(failing(bankDetails, quiet)).toEqual(["priya"]);
    const fw = solved((s) => ({ ...s, emails: [...s.emails.filter((e) => e !== priyaMail), sent([PEOPLE.priya], "FW: URGENT: new bank details", "FYI", { inReplyTo: SCAM_EMAIL_ID })] }));
    expect(failing(bankDetails, fw)).toEqual(["priya"]);
    expect(bankDetails.check(fw).find((c) => c.id === "priya")?.fix).toMatch(/forwarded/);
  });
});

/* ── E11.2 ────────────────────────────────────────────────────────────── */

describe("E11.2 The wrong Emma", () => {
  const sheet = [{ name: OVERTIME_NAME, sheet: OVERTIME }];
  const fw = (to: { name: string; address: string }[], over: Partial<Email> = {}) => sent(to, "FW: November's overtime sheet", "Hi Emma,\n\nHere's November's overtime sheet from Daniel.\n\nThanks", { attachments: sheet, inReplyTo: DANIEL_OVERTIME_ID, ...over });
  const withMail = (...mails: Email[]) => {
    const s = wrongEmma.seed();
    return { ...s, emails: [...s.emails, ...mails] };
  };
  it("fails a fresh office", () => {
    expect(failing(wrongEmma, wrongEmma.seed())).toEqual(["to-hr", "attached"]);
  });
  it("passes when it goes only to Emma Clarke", () => {
    expect(failing(wrongEmma, withMail(fw([PEOPLE.emma])))).toEqual([]);
    expect(failing(wrongEmma, withMail(fw([PEOPLE.emma], { cc: [PEOPLE.daniel] })))).toEqual([]);
  });
  it("fails when it goes to Emma Clarkson, and teaches what to do", () => {
    const r = wrongEmma.check(withMail(fw([EMMA_CLARKSON])));
    expect(r.filter((c) => !c.ok).map((c) => c.id)).toEqual(["to-hr", "only-hr"]);
    expect(r.find((c) => c.id === "only-hr")?.fix).toMatch(/tell Daniel straight away/);
    expect(r.find((c) => c.id === "only-hr")?.fix).toMatch(/delete it/);
  });
  it("fails even when Clarke got it too", () => {
    expect(failing(wrongEmma, withMail(fw([PEOPLE.emma, EMMA_CLARKSON])))).toEqual(["only-hr"]);
    expect(failing(wrongEmma, withMail(fw([PEOPLE.emma]), fw([EMMA_CLARKSON])))).toEqual(["only-hr"]);
    expect(failing(wrongEmma, withMail(fw([PEOPLE.emma], { bcc: [PEOPLE.sarah] })))).toEqual(["only-hr"]);
  });
  it("fails an email to Emma Clarke with no sheet on it", () => {
    expect(failing(wrongEmma, withMail(sent([PEOPLE.emma], "Overtime", "Here it is")))).toEqual(["to-hr", "attached"]);
  });
});

/* ── E11.3 ────────────────────────────────────────────────────────────── */

describe("E11.3 A sign-in you didn't start", () => {
  const done = (over: Partial<NonNullable<OfficeState["signIn"]>> = {}, screen: OfficeState["screen"] = { locked: true, locks: 1, afterPrompt: true }) => {
    const s = signInPrompt.seed();
    return { ...s, signIn: { ...s.signIn!, status: "denied" as const, reported: true, ...over }, screen };
  };
  it("fails a fresh office", () => {
    expect(failing(signInPrompt, signInPrompt.seed())).toEqual(["denied", "reported", "locked"]);
  });
  it("passes when it is denied, reported and the screen locked", () => {
    expect(failing(signInPrompt, done())).toEqual([]);
  });
  it("accepts an email to the IT Helpdesk as the report", () => {
    const s = done({ reported: false });
    expect(failing(signInPrompt, { ...s, emails: [...s.emails, sent([IT_HELPDESK], "Sign-in I didn't start", "A sign-in request came at 15:02 from Amsterdam. I denied it.")] })).toEqual([]);
  });
  it("fails approving it, and says what to do", () => {
    const r = signInPrompt.check(done({ status: "approved" }));
    expect(r.filter((c) => !c.ok).map((c) => c.id)).toEqual(["denied"]);
    expect(r.find((c) => c.id === "denied")?.fix).toMatch(/change your password/);
  });
  it("fails denying without reporting", () => {
    expect(failing(signInPrompt, done({ reported: false }))).toEqual(["reported"]);
  });
  it("fails without locking, or when it was unlocked after an early lock", () => {
    expect(failing(signInPrompt, done({}, { locked: false, locks: 0 }))).toEqual(["locked"]);
    expect(failing(signInPrompt, done({}, { locked: false, locks: 1, afterPrompt: false }))).toEqual(["locked"]);
    /* locked after dealing with it, then signed back in to press Check: still counts */
    expect(failing(signInPrompt, done({}, { locked: false, locks: 1, afterPrompt: true }))).toEqual([]);
  });
});
