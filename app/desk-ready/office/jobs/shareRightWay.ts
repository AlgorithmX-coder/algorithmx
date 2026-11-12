import { accessFor, linkedFiles, pdfHead, pdfRows, wideLinks } from "../files";
import { officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import { samePath, type Check, type Email, type Job, type OfficeFile, type OfficeState } from "../types";
import { followsHouseRule } from "../word";
import { HARLOW_CODES, sameGrid, STOCK, STOCK_NAME, stockFile, stockNeighbours, stockRight } from "./stockSheet";

/* E9.2 Share it the right way (criteria SP-5, SP-6, XL-4). Priya in
 * Accounts needs to edit the November stock sheet; Tom at Harlow Packaging,
 * a supplier, wants to see just Harlow's lines. Done means Priya gets a
 * link that lets her edit (and nobody else is let in on the way), and Tom
 * gets a PDF of only the Harlow rows, attached: never a link to the whole
 * sheet, which is the company's stock for every supplier.
 *
 * Priya isn't on the Operations Team site, so a bare link won't open for
 * her: the file has to be shared with her. The Share box's Copy link starts
 * as "People in Northfield Supplies can edit", which would let the whole
 * company in; sharing with her by name is the tidy way. */

const TODAY = "2026-11-10";
const TOM = PEOPLE.tom;
const PRIYA = PEOPLE.priya;

const PRIYA_BODY = `Hi,

I need to edit the November stock sheet. And Tom at Harlow wants to see just their lines.

I'm doing the stock valuation this afternoon, so I'll be putting prices in. The sheet's in Operations Team > Documents > Stock, but I'm not on that site, so I can't open it.

Tom's email is below. He only needs Harlow's lines, nothing about our other suppliers.

Thanks,
Priya

---------- Forwarded message ----------
From: Tom Hale <${TOM.address}>
Sent: Tuesday 10 November 2026 11:52
Subject: Stock of our lines

Hi Priya,

Could you send me what you're holding of our products at the moment? It'll help us plan your next delivery.

Cheers,
Tom Hale
Account Manager, Harlow Packaging
01632 960 774`;

function seed(): OfficeState {
  const files: OfficeFile[] = [...officeFolders(), stockFile(), ...stockNeighbours()];
  files.push({ id: "seed-dir-drafts", path: ["OneDrive", "Documents"], name: "Drafts", kind: "folder", modified: "02/11/2026", by: "You", seeded: true });
  const emails: Email[] = [
    { id: "mail-priya-stock", folder: "inbox", from: PRIYA, to: [{ name: "You", address: "you@northfieldsupplies.example" }], cc: [], subject: "FW: Stock of our lines", time: "14:06", unread: true, body: PRIYA_BODY, attachments: [], links: [] },
    {
      id: "mail-sarah-stock",
      folder: "inbox",
      from: PEOPLE.sarah,
      to: [{ name: "You", address: "you@northfieldsupplies.example" }],
      cc: [],
      subject: "Stock sheet is up to date",
      time: "Mon 17:45",
      body: `Hi,\n\nLast night's count is in Stock November, in the Stock folder. Harlow's lines all start HP.\n\nSarah\n\n${SIGNATURE.sarah}`,
      attachments: [],
      links: [],
    },
  ];
  return { version: 0, files, emails };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const to = (e: Email, address: string) => [...e.to, ...e.cc, ...(e.bcc ?? [])].some((p) => p.address.toLowerCase() === address);

function check(s: OfficeState): Check[] {
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const stock = s.files.find((f) => f.id === "seed-stock");
  const sent = s.emails.filter((e) => e.folder === "sent");
  const isStock = (f: OfficeFile) => f.id === "seed-stock";
  const sheetCopy = (e: Email) => e.attachments.some((a) => /\.xlsx$/i.test(a.name));

  /* Priya */
  const toPriya = sent.filter((e) => to(e, PRIYA.address));
  const priyaLinked = toPriya.some((e) => linkedFiles(s, e).some(isStock));
  const priyaRole = stock ? accessFor(stock, PRIYA) : null;
  add(
    { id: "p-edit", code: "SP-5", group: "Priya", label: "Priya can edit the stock sheet" },
    priyaRole === "edit",
    priyaRole === "view"
      ? "Priya can only view it, and she needs to put prices in. In File Explorer, select the sheet, press Share, then the people icon for Manage access, and change her to Can edit."
      : priyaLinked
        ? "Priya has a link, but she isn't on the Operations Team site, so it won't open for her. Select the sheet in File Explorer, press Share, add Priya, choose Can edit and press Send."
        : "Select Stock November.xlsx in File Explorer and press Share. Add Priya, choose Can edit, and press Send.",
  );
  const wide = stock ? wideLinks(stock) : [];
  const extra = (stock?.access ?? []).filter((g) => g.person.address !== PRIYA.address);
  add(
    { id: "p-only", code: "SP-5", group: "Priya", label: "Only the people named can open it: no link for the whole company" },
    !!stock && wide.length === 0 && extra.length === 0,
    wide.some((l) => l.scope === "anyone")
      ? "There's an \"Anyone with the link\" link to the stock sheet: anyone it reaches, inside or outside Northfield, could open it. Share, then Manage access, and Delete that link. Share with Priya by name instead."
      : wide.length
        ? "You made a \"People in Northfield Supplies\" link, so anyone at the company who gets it could change the stock sheet. Share, then Manage access, and Delete that link. Add Priya by name in Share and press Send instead."
        : `${extra[0]?.person.name ?? "Someone"} was given access too, and the brief only names Priya. Share, then Manage access, and Remove them.`,
  );
  add(
    { id: "p-link", code: "SP-6", group: "Priya", label: "Priya got a link to it" },
    priyaLinked,
    toPriya.some(sheetCopy) ? "Priya got a copy of the sheet, not a link. Her prices would go in the copy, and the team's sheet would never have them. Send her a link: Share, add Priya, Can edit, Send." : "Nothing with a link to the stock sheet has gone to Priya yet. Share sends her one: add Priya, choose Can edit, press Send.",
  );
  add(
    { id: "p-nocopy", code: "SP-6", group: "Priya", label: "No copy of the sheet was emailed round" },
    !sent.some(sheetCopy),
    `A copy of the sheet went out as an attachment (to ${sent.find(sheetCopy)?.to.map((p) => p.name).join(", ")}). Copies drift apart. Work on the one file and share a link.`,
  );

  /* Tom */
  const toTom = sent.filter((e) => to(e, TOM.address));
  const tomMail = toTom.find((e) => e.attachments.some((a) => /\.pdf$/i.test(a.name))) ?? toTom[toTom.length - 1];
  const pdf = tomMail?.attachments.find((a) => /\.pdf$/i.test(a.name) && a.doc);
  add(
    { id: "t-sent", code: "OL-5", group: "Tom", label: "Tom got an email from you" },
    toTom.length > 0,
    "Nothing has gone to Tom yet. In Outlook, New mail, To: Tom Hale.",
  );
  add(
    { id: "t-pdf", code: "SP-6", group: "Tom", label: "With a PDF attached, not a link" },
    !!pdf,
    !tomMail
      ? "Make a PDF of Harlow's rows (Excel: filter, then File > Export > Create PDF), then attach it to an email to Tom."
      : linkedFiles(s, tomMail).length
        ? "You sent Tom a link. He's outside Northfield: send a PDF of just his lines, attached, so he gets his own copy and nothing else."
        : tomMail.attachments.some((a) => /\.xlsx$/i.test(a.name))
          ? "You attached the spreadsheet, which has every supplier's stock in it. Attach a PDF of Harlow's rows instead."
          : "There's no PDF attached. Use Attach file and pick the PDF you made.",
  );
  const head = pdfHead(pdf?.doc);
  const supplierCol = head.findIndex((h) => /supplier/i.test(h));
  const codeCol = Math.max(0, head.findIndex((h) => /code/i.test(h)));
  const rows = pdfRows(pdf?.doc);
  const others = rows.filter((r) => !/harlow/i.test(r[supplierCol] ?? ""));
  const codes = rows.map((r) => r[codeCol]);
  const missingHarlow = HARLOW_CODES.filter((c) => !codes.includes(c));
  const right = stockRight();
  const wrongCount = rows.find((r) => {
    const src = right.find((x) => x[0] === r[codeCol]);
    return src && src[3] !== r[inStockCol(head)];
  });
  add(
    { id: "t-rows", code: "XL-4", group: "Tom", label: "The PDF has Harlow's four lines and nothing else" },
    !!pdf && supplierCol >= 0 && others.length === 0 && missingHarlow.length === 0 && !wrongCount,
    !pdf
      ? "Attach a PDF of Harlow's rows first."
      : supplierCol < 0
        ? "The PDF doesn't look like the stock sheet. Make it from Stock November.xlsx: filter Supplier to Harlow Packaging, then File > Export > Create PDF."
        : others.length
          ? `The PDF has other suppliers in it too (${[...new Set(others.map((r) => r[supplierCol]))].join(", ")}). In Excel, press Filter, click the ▾ on Supplier and pick Harlow Packaging. Then make the PDF again and attach the new one.`
          : missingHarlow.length
            ? `The PDF is missing ${missingHarlow.join(", ")}. Clear any other filter and filter only Supplier to Harlow Packaging, then make the PDF again.`
            : "The numbers in the PDF don't match the stock sheet. Make it again from Stock November.xlsx without changing anything.",
  );
  const tomCan = stock ? accessFor(stock, TOM) : null;
  const tomGotSheet = toTom.some((e) => linkedFiles(s, e).some(isStock) || e.attachments.some((a) => /\.xlsx$/i.test(a.name)));
  add(
    { id: "t-not-sheet", code: "SP-5", group: "Tom", label: "Tom can't open the whole stock sheet" },
    !tomCan && !tomGotSheet,
    tomCan
      ? "Tom has access to the whole stock sheet, every supplier's numbers. In File Explorer, Share, then Manage access: Remove Tom, and Delete any \"Anyone\" link."
      : "Tom was sent the whole sheet. Send only the PDF of Harlow's rows. (At work, you'd tell your manager straight away if the whole sheet went to a supplier.)",
  );
  add(
    { id: "t-name", code: "SP-4", group: "Tom", label: "The PDF is named the house way, with today's date" },
    !!pdf && followsHouseRule(pdf.name) && pdf.name.startsWith(TODAY),
    pdf ? `It's called "${pdf.name}". Name it today's date, year first, then what it is: for example "${TODAY} Harlow stock.pdf". Save the PDF again with that name, and attach that one.` : "Attach the PDF first.",
  );

  /* The stock sheet itself */
  add(
    { id: "sheet", code: "SP-3", group: "The stock sheet", label: `${STOCK_NAME} is unchanged, in Stock, and the only copy` },
    !!stock && samePath(stock.path, STOCK) && stock.name === STOCK_NAME && sameGrid(stock.sheet, right) && !s.files.some((f) => f !== stock && f.kind === "xlsx" && !f.seeded && f.sheet?.some((r) => HARLOW_CODES.includes(r[0]))),
    !stock || !samePath(stock.path, STOCK) || stock.name !== STOCK_NAME
      ? `Put the stock sheet back where the team expects it: ${STOCK.join(" > ")} > ${STOCK_NAME}. Restore it from the Recycle bin, or Move it back.`
      : !sameGrid(stock.sheet, right)
        ? "The stock sheet was changed and saved. Filtering doesn't need a save: open Version history on it and Restore last night's version."
        : "There's a second copy of the stock sheet saved somewhere. Delete it: the team works on the one in Stock.",
  );

  return out;
}

/* The In stock column, wherever it is in the PDF's heading row. */
function inStockCol(head: string[]) {
  const i = head.findIndex((h) => /in stock/i.test(h));
  return i < 0 ? 3 : i;
}

export const shareRightWay: Job = {
  id: "m9j2",
  slug: "share-right-way",
  moduleId: "m9",
  moduleLabel: "Module 9: Files and sharing",
  title: "Share it the right way",
  summary: "Priya needs to edit the stock sheet, and Tom at Harlow wants just his lines. A link for one, a PDF for the other.",
  clock: "14:10",
  deadline: "Tuesday 10 November",
  doneLine: "Priya is pricing the one stock sheet, and Tom has his lines and nothing more.",
  brief: "Priya has forwarded you an email from a supplier. Read it and do what she asks, the way an office would. When you think it's done, press Check my work.",
  hints: [
    "Read Priya's email, and Tom's underneath it. Who works here, and who doesn't?",
    "In File Explorer, go to Operations Team > Documents > Stock and select Stock November.xlsx.",
    "Press Share. Add Priya, choose Can edit, and press Send. That gives her access and emails her a link.",
    "Open the sheet in Excel. Press Filter, click the ▾ on Supplier and pick Harlow Packaging.",
    "File > Export > Create PDF. Name it with today's date first, like 2026-11-10 Harlow stock, and look at it when it opens.",
    "In Outlook, New mail to Tom. Attach file, pick the PDF, say what it is, and send.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["p-link", "t-pdf"] },
    { label: "Name it so anyone can find it", checks: ["t-name"] },
    { label: "One version, in one place", checks: ["p-nocopy", "sheet"] },
    { label: "Close the loop", checks: ["p-link", "t-sent"] },
    { label: "Check your own work", checks: ["t-rows", "p-only", "t-not-sheet"] },
  ],
};
