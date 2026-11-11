import { officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import { pathText, samePath, type Check, type Email, type Job, type OfficeFile, type OfficeState, type WordDoc } from "../types";
import { docText, isFakeHeading, isHeading, issues, para, placeholdersIn } from "../word";

/* E8.1 A letter on the letterhead (criteria WD-1, WD-2, WD-3, WD-4, SP-6).
 * Daniel forwards a customer's complaint: Oak Street Deli were charged
 * twice for napkins on order 4405. The learner writes to them on the
 * company letterhead (a Word template in HR > Templates), says sorry and
 * that the £32.50 is being refunded, checks the spelling, saves it as a
 * PDF named by the house rule in Orders > 2026, and sends it to Rita at
 * the deli as an attachment, because she is outside the company.
 *
 * Two traps, both from real offices: Daniel's suggested wording, typed on
 * his phone, has two spelling mistakes the spelling check finds; and he
 * spells her surname wrong (Fenwik), which a spelling check can't know.
 * Her own email, forwarded underneath, has it right. */

export const HEADER = { name: "Northfield Supplies", lines: ["Unit 2, Abbey Trade Park, Leicester LE4 5AA", "01632 960 400 · hello@northfieldsupplies.example"] };
export const FOOTER = "Northfield Supplies Ltd · Registered in England and Wales";

/* The company letterhead: the logo and address in the page header, and a
 * letter laid out with a placeholder in square brackets for every part
 * that changes. */
export function letterheadDoc(): WordDoc {
  return {
    header: HEADER,
    footer: FOOTER,
    blocks: [
      para("[Date]"),
      para("Our reference: [Reference]"),
      para(""),
      para("[Recipient name]"),
      para("[Company]"),
      para("[Street address]"),
      para("[Town and postcode]"),
      para(""),
      para("Dear [Name],"),
      para("[Subject of the letter]", "h2"),
      para("[Write your letter here.]"),
      para(""),
      para("Yours sincerely,"),
      para(""),
      para(""),
      para("[Your name]"),
      para("Office Administrator"),
    ],
  };
}

/* The letterhead file in HR > Templates, with its pages. */
export function withLetterhead(files: OfficeFile[]): OfficeFile[] {
  return files.map((f) => (f.id === "seed-letterhead" ? { ...f, doc: letterheadDoc() } : f));
}

const ORDERS = ["Operations Team", "Documents", "Orders", "2026"] as const;
const NAME = "2026-11-10 Letter to Oak Street Deli.pdf";
const RITA = PEOPLE.rita;

/* A letter Daniel sent last month, so the folder shows how letters are
 * named and what one looks like. */
function earlierLetter(): WordDoc {
  return {
    header: HEADER,
    footer: FOOTER,
    template: "Letterhead.dotx",
    blocks: [
      para("28 October 2026"),
      para("Our reference: NS/4372"),
      para(""),
      para("Mr Sam Dale"),
      para("Bright Cafe"),
      para("4 Market Place"),
      para("Leicester LE1 5GG"),
      para(""),
      para("Dear Mr Dale,"),
      para("Paper cup prices from 1 December", "h2"),
      para("From 1 December 2026, our 8oz paper cups will cost £19.20 a case, up from £18.00. Orders placed before then keep the old price."),
      para("Thank you for your custom. If you have any questions, please call me on 01632 960 400."),
      para(""),
      para("Yours sincerely,"),
      para(""),
      para(""),
      para("Daniel Okafor"),
      para("Office Manager"),
    ],
  };
}

const DANIEL_BODY = `Hi,

We charged Oak Street Deli twice for napkins on order 4405. Can you write to them on letterhead, say sorry, and tell them the £32.50 is being refunded? Send it as a PDF.

The letterhead is in HR > Templates. Our reference is NS/4405. Put the PDF in Operations Team > Documents > Orders > 2026 with our other letters, named the same way. The refund will reach them within 5 working days.

Something like this would do:
"We are very sory that we charged you twice for the napkins on order 4405. We have refunded the £32.50, and you should recieve it within 5 working days."

It's to Ms Rita Fenwik, the manager. Her email is below.

Thanks,
Daniel

Sent from my phone

---------- Forwarded message ----------
From: Rita Fenwick <${RITA.address}>
Sent: Monday 9 November 2026 16:40
Subject: Napkins charged twice on order 4405

Hello,

Our invoice for order 4405 has the napkins on it twice, at £32.50 each. We only had one box. Could you put this right, please?

Kind regards,
Rita Fenwick
Manager, Oak Street Deli
18 Oak Street, Leicester LE1 6AB
0116 496 0418`;

function seed(): OfficeState {
  const files = withLetterhead(officeFolders());
  files.push({ id: "seed-letter-bright", path: [...ORDERS], name: "2026-10-28 Letter to Bright Cafe.pdf", kind: "pdf", modified: "28/10/2026", by: "Daniel Okafor", doc: earlierLetter(), seeded: true });
  files.push({ id: "seed-orders-nov", path: [...ORDERS], name: "Orders November.xlsx", kind: "xlsx", modified: "09/11/2026", by: "Priya Shah", sheet: [["Order no", "Date", "Customer", "Item", "Qty", "Unit price", "Total"], ["4405", "05/11/2026", "Oak Street Deli", "Napkins (box of 2000)", "1", "£32.50", "=E2*F2"], ["4406", "05/11/2026", "Kent Bakery", "Flour 25kg", "20", "£14.20", "=E3*F3"]], widths: [80, 100, 140, 180, 60, 90, 90], seeded: true });
  const emails: Email[] = [
    {
      id: "mail-daniel-letter",
      folder: "inbox",
      from: PEOPLE.daniel,
      to: [{ name: "You", address: "you@northfieldsupplies.example" }],
      cc: [],
      subject: "FW: Napkins charged twice on order 4405",
      time: "09:14",
      unread: true,
      body: DANIEL_BODY,
      attachments: [],
      links: [],
    },
    {
      id: "mail-priya-credit",
      folder: "inbox",
      from: PEOPLE.priya,
      to: [{ name: "You", address: "you@northfieldsupplies.example" }],
      cc: [],
      subject: "Oak Street Deli refund",
      time: "09:02",
      unread: true,
      body: "Hi,\n\nJust so you know, I've refunded the £32.50 to Oak Street Deli this morning. It should reach them within 5 working days.\n\nPriya",
      attachments: [],
      links: [],
    },
    {
      id: "mail-daniel-welcome",
      folder: "inbox",
      from: PEOPLE.daniel,
      to: [{ name: "You", address: "you@northfieldsupplies.example" }],
      cc: [],
      subject: "Welcome to Northfield!",
      time: "Mon 09:12",
      body: `Hi,\n\nWelcome aboard. A quick tip for your first week: your OneDrive is for your own drafts. Anything the team needs goes on the team site, in SharePoint, so everyone works on the same file.\n\nShout if you get stuck.\n\nDaniel\n\n${SIGNATURE.daniel}`,
      attachments: [],
      links: [],
    },
  ];
  return { version: 0, files, emails };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const isLetter = (f: OfficeFile) => f.kind === "pdf" && !!f.doc && !f.seeded && /4405|oak street/i.test(docText(f.doc));
const norm = (s: string) => s.replace(/\s+/g, " ").trim();

function check(s: OfficeState): Check[] {
  const pdfs = s.files.filter(isLetter);
  const isTarget = (f: OfficeFile) => samePath(f.path, ORDERS) && f.name.toLowerCase() === NAME.toLowerCase();
  const pdf = pdfs.find(isTarget) ?? pdfs.find((f) => samePath(f.path, ORDERS)) ?? pdfs[pdfs.length - 1];
  const doc = pdf?.doc;
  const text = doc ? docText(doc) : "";
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const noPdf = "There's no PDF of the letter yet. Write it in Word, then File > Export > Create PDF (or File > Save As, and pick PDF).";

  /* The letter */
  add({ id: "template", code: "WD-2", group: "The letter", label: "It's on the company letterhead, started from the template" }, !!doc?.header && doc.template === "Letterhead.dotx", !pdf ? noPdf : "Start from HR > Templates > Letterhead.dotx, so the letter has the company's name and address at the top. Write it again from there.");
  const left = doc ? placeholdersIn(doc) : [];
  add(
    { id: "placeholders", code: "WD-2", group: "The letter", label: "Every [placeholder] is filled in" },
    !!doc && left.length === 0,
    !pdf ? noPdf : `${left.slice(0, 3).map((p) => `"${p}"`).join(", ")} ${left.length === 1 ? "is" : "are"} still in the PDF. Click each one in Word, type over it, then make the PDF again.`,
  );
  const dated = /\b10(th)? November 2026\b|\b10\/11\/2026\b/i.test(text);
  const refd = /NS\/4405/i.test(text);
  add({ id: "dateref", code: "WD-2", group: "The letter", label: "Today's date, 10 November 2026, and our reference NS/4405" }, !!doc && dated && refd, !pdf ? noPdf : !dated ? "Put today's date at the top: 10 November 2026." : "Put Daniel's reference after \"Our reference\": NS/4405.");
  const addressed = /Oak Street Deli/i.test(text) && /18 Oak Street/i.test(text) && /LE1 6AB/i.test(text);
  add({ id: "address", code: "WD-2", group: "The letter", label: "Addressed to Oak Street Deli, 18 Oak Street, Leicester LE1 6AB" }, !!doc && addressed, !pdf ? noPdf : "Copy the address from the bottom of Rita's email: Oak Street Deli, 18 Oak Street, Leicester LE1 6AB.");
  const sorry = /\b(sorry|apologi[sz]e|apologies)\b/i.test(text);
  const money = /£\s?32\.50/.test(text) && /refund/i.test(text);
  add({ id: "says", code: "OL-9", group: "The letter", label: "It says sorry, and that the £32.50 is being refunded" }, !!doc && sorry && money, !pdf ? noPdf : !sorry ? "Say sorry, once and plainly: \"I'm sorry we charged you twice.\"" : "Say what you're doing about it: the £32.50 is being refunded, within 5 working days.");
  const fake = doc?.blocks.find(isFakeHeading);
  const heading = doc?.blocks.some((b) => isHeading(b) && b.text.trim() && !/^\[/.test(b.text.trim()));
  add(
    { id: "heading", code: "WD-1", group: "The letter", label: "The subject line uses a heading style, not bold, bigger Normal text" },
    !!doc && !!heading && !fake,
    !pdf ? noPdf : fake ? `"${norm(fake.text).slice(0, 50)}" is Normal text made bold or bigger. Click in it and pick Heading 2 from Styles, so it's a real heading.` : "Give the letter a subject line in the Heading 2 style, as the template has, for example \"Refund for order 4405\".",
  );
  const mistakes = doc ? issues(doc, { all: true }) : [];
  add(
    { id: "spelling", code: "WD-3", group: "The letter", label: "No spelling or grammar mistakes left" },
    !!doc && mistakes.length === 0,
    !pdf ? noPdf : `"${mistakes[0]?.word.trim()}" is ${mistakes[0]?.kind === "spelling" ? "spelled wrong" : "a grammar slip"}. Run Review > Spelling & Grammar in Word, then make the PDF again over the old one.`,
  );
  const wrongName = text.match(/\bFenwi(?!ck\b)[a-z]*\b/i)?.[0];
  add(
    { id: "rita", code: "WD-3", group: "The letter", label: "Her name is spelled right: Rita Fenwick" },
    !!doc && /\bFenwick\b/.test(text) && !wrongName,
    !pdf ? noPdf : wrongName ? `"${wrongName}" should be "Fenwick", as she signs her own email. Daniel spelled it wrong, and a spelling check doesn't know people's names, so it didn't catch it.` : "Address it to her by name: Ms Rita Fenwick, and \"Dear Ms Fenwick,\".",
  );

  /* Where it went */
  add({ id: "place", code: "SP-3", group: "Where you saved it", label: `Saved in ${pathText(ORDERS)}` }, !!pdf && samePath(pdf.path, ORDERS), pdf ? `It's in ${pathText(pdf.path)}. Daniel asked for ${pathText(ORDERS)}. In File Explorer, select it and use Move to.` : noPdf);
  add({ id: "name", code: "WD-4", group: "Where you saved it", label: `Named "${NAME}"` }, !!pdf && pdf.name.toLowerCase() === NAME.toLowerCase(), pdf ? `It's called "${pdf.name}". Name it like the letter beside it: the date, then what it is: "${NAME}". In File Explorer, select it and use Rename.` : noPdf);
  const strays = pdfs.filter((f) => f !== pdf);
  add({ id: "one", code: "SP-3", group: "Where you saved it", label: "One PDF of the letter, in one place" }, !!pdf && strays.length === 0, !pdf ? noPdf : `There's a second PDF of it: ${strays[0] ? `${pathText(strays[0].path)} > ${strays[0].name}` : ""}. Delete the extra one, so nobody sends the wrong one.`);

  /* Sending it */
  const toRita = s.emails.filter((e) => e.folder === "sent" && e.to.some((p) => p.address === RITA.address));
  const mail = toRita.find((e) => e.attachments.some((a) => /\.pdf$/i.test(a.name))) ?? toRita[toRita.length - 1];
  add({ id: "sent", code: "OL-5", group: "Sending it", label: "Sent to Rita at Oak Street Deli" }, !!mail, "Send it to Rita: New mail in Outlook, and type Rita in To.");
  const att = mail?.attachments.find((a) => /\.pdf$/i.test(a.name) && a.doc);
  const sameAsSaved = !!att?.doc && !!doc && docText(att.doc) === docText(doc);
  add(
    { id: "attached", code: "SP-6", group: "Sending it", label: "With the PDF attached, not a link" },
    !!att && sameAsSaved && (mail?.links.length ?? 0) === 0,
    !mail
      ? "Send Rita an email with the PDF attached: Attach file, then find it in Orders > 2026."
      : mail.links.length && !att
        ? "You sent a link. Rita is outside the company and can't open our SharePoint. Use Attach file instead, so she gets her own copy."
        : mail.attachments.some((a) => /\.docx$/i.test(a.name)) && !att
          ? "You attached the Word file. Attach the PDF: she can open it on anything, and it can't be changed by mistake."
          : att && !sameAsSaved
            ? "The PDF you attached isn't the one saved in Orders > 2026. Attach the final PDF."
            : mail.links.length
              ? "Take the link out: send her the PDF as an attachment only."
              : "There's no PDF attached. Use Attach file and pick the letter in Orders > 2026.",
  );
  const told = toRita.some((e) => [...e.to, ...e.cc].some((p) => p.address === PEOPLE.daniel.address)) || s.emails.some((e) => e.folder === "sent" && e.to.some((p) => p.address === PEOPLE.daniel.address));
  add({ id: "loop", code: "OL-5", group: "Sending it", label: "Daniel knows it's gone" }, told, "Close the loop: copy Daniel in (Cc) on the email to Rita, or send him one line to say it's done.");
  return out;
}

export const letterhead: Job = {
  id: "m8j1",
  slug: "letter-on-letterhead",
  moduleId: "m8",
  moduleLabel: "Module 8: Documents",
  title: "A letter on the letterhead",
  summary: "Daniel wants a letter to Oak Street Deli on the company letterhead: sorry, and the £32.50 is being refunded. Sent as a PDF.",
  clock: "09:20",
  deadline: "Tuesday 10 November",
  doneLine: "Oak Street Deli have a proper apology, and the letter is filed where anyone can find it.",
  brief: "Daniel has forwarded you a customer's email. Read it and do what he asks, the way he asks. When you think it's done, press Check my work.",
  apps: ["word"],
  hints: [
    "Read Daniel's email, and the one from Rita underneath it.",
    "In File Explorer, go to HR > Templates and open Letterhead. It opens in Word as a new document.",
    "Click each [placeholder] and type over it. Her address is at the bottom of her email. Today is 10 November 2026.",
    "Review > Spelling & Grammar. Then read the names back against Rita's email: a spelling check doesn't know names.",
    "File > Export > Create PDF. Save it in Operations Team > Documents > Orders > 2026, named like the letter already there.",
    "In Outlook, New mail to Rita, Cc Daniel. Attach file, pick the PDF, and send.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["place"] },
    { label: "Name it so anyone can find it", checks: ["name"] },
    { label: "One version, in one place", checks: ["one"] },
    { label: "Close the loop", checks: ["sent", "loop"] },
    { label: "Check your own work", checks: ["placeholders", "spelling", "rita"] },
  ],
};
