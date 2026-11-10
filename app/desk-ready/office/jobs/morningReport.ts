import { numeric } from "../formula";
import { officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import { pathText, samePath, type Check, type Grid, type Job, type OfficeFile, type OfficeState, type Paper } from "../types";

/* E5.1 The morning delivery report (criteria XL-2, XL-3, SP-2, SP-3, SP-4,
 * SP-6, OL-2, OL-4, OL-5). Sarah emails three delivery notes and asks for
 * a new report from the team template, saved in Deliveries > 2026 and
 * named like the others, then a reply with a link. The older reports in
 * that folder show the naming and the date format by example, as a real
 * shared folder would. */

const DELIVERIES = ["Operations Team", "Documents", "Deliveries"] as const;
const TARGET = [...DELIVERIES, "2026"] as const;
const NAME = "2026-11-10 Delivery report.xlsx";
const TODAY = "10/11/2026";
const SUBJECT = "This morning's deliveries";

const HEAD = ["Date", "Delivery note", "Supplier", "Item", "Expected", "Received", "Short by", "Checked by"];
const WIDTHS = [104, 116, 156, 184, 84, 84, 84, 104];

interface Delivery {
  dn: string;
  supplier: string;
  item: string;
  expected: number;
  received: number;
  /* Words a correct supplier and item cell must contain. */
  supplierKey: RegExp;
  itemKey: RegExp;
}

const TODAYS: Delivery[] = [
  { dn: "DN-77812", supplier: "Harlow Packaging", item: "Pallet wrap", expected: 12, received: 10, supplierKey: /harlow/i, itemKey: /wrap/i },
  { dn: "DN-40915", supplier: "Kent Flour Mills", item: "Plain flour 25kg", expected: 40, received: 40, supplierKey: /kent/i, itemKey: /flour/i },
  { dn: "DN-11630", supplier: "Brightwater Cups", item: "Paper cups (case of 500)", expected: 30, received: 30, supplierKey: /brightwater/i, itemKey: /cup/i },
];

const PO: Record<string, string> = { "DN-77812": "PO 3307", "DN-40915": "PO 3312", "DN-11630": "PO 3315" };
const SUPPLIER_ADDRESS: Record<string, string[]> = {
  "DN-77812": ["Harlow Packaging Ltd", "Unit 9, Canal Business Park", "Leicester LE4 0XA"],
  "DN-40915": ["Kent Flour Mills", "Mill Lane, Ashford", "Kent TN24 8QH"],
  "DN-11630": ["Brightwater Cups Ltd", "14 Station Road", "Derby DE1 2QY"],
};

function note(d: Delivery): Paper {
  return {
    heading: "Delivery note",
    from: SUPPLIER_ADDRESS[d.dn],
    meta: [
      ["Delivery note", d.dn],
      ["Date", TODAY],
      ["Your order", PO[d.dn]],
      ["Deliver to", "Northfield Supplies, Goods in"],
    ],
    table: { head: ["Item", "Ordered", "Delivered"], rows: [[d.item, String(d.expected), String(d.received)]] },
    note: d.received < d.expected ? `Only ${d.received} on the van. SP` : "All in. SP",
    footer: "Received in good condition unless noted above.",
  };
}

function report(rows: string[][]): Grid {
  const g: Grid = [HEAD, ...rows];
  while (g.length < 30) g.push(Array(HEAD.length).fill(""));
  return g.map((r) => [...r]);
}

/* Older reports, so the folder shows the house naming and date style. */
const OLDER: [string, string[][]][] = [
  [
    "2026-11-05 Delivery report.xlsx",
    [
      ["05/11/2026", "DN-77761", "Harlow Packaging", "Pallet wrap", "6", "6", "=E2-F2", "SP"],
      ["05/11/2026", "DN-11602", "Brightwater Cups", "Lids (case of 500)", "20", "20", "=E3-F3", "SP"],
    ],
  ],
  [
    "2026-11-06 Delivery report.xlsx",
    [
      ["06/11/2026", "DN-40861", "Kent Flour Mills", "Plain flour 25kg", "40", "38", "=E2-F2", "SP"],
    ],
  ],
  [
    "2026-11-09 Delivery report.xlsx",
    [
      ["09/11/2026", "DN-40877", "Kent Flour Mills", "Plain flour 25kg", "40", "40", "=E2-F2", "DO"],
      ["09/11/2026", "DN-77790", "Harlow Packaging", "Pallet wrap", "8", "8", "=E3-F3", "DO"],
      ["09/11/2026", "DN-11618", "Brightwater Cups", "Paper cups (case of 500)", "25", "25", "=E4-F4", "DO"],
    ],
  ],
];

function seed(): OfficeState {
  const files: OfficeFile[] = officeFolders();

  files.push({
    id: "seed-template",
    path: [...DELIVERIES],
    name: "Delivery report template.xltx",
    kind: "xltx",
    modified: "14/01/2026",
    by: "Sarah Patel",
    sheet: report([]),
    widths: WIDTHS,
    seeded: true,
  });
  OLDER.forEach(([name, rows], i) =>
    files.push({ id: `seed-report-${i}`, path: [...TARGET], name, kind: "xlsx", modified: name.slice(8, 10) + "/11/2026", by: i === 2 ? "Daniel Okafor" : "Sarah Patel", sheet: report(rows), widths: WIDTHS, seeded: true }),
  );
  files.push({
    id: "seed-orders",
    path: ["Operations Team", "Documents", "Orders", "2026"],
    name: "Orders November.xlsx",
    kind: "xlsx",
    modified: "07/11/2026",
    by: "Priya Shah",
    sheet: report([]).map((_, r) =>
      r === 0
        ? ["Order no", "Date", "Customer", "Item", "Qty", "Unit price", "Total", ""]
        : r <= 3
          ? [["4401", "03/11/2026", "Harlow Foods", "Pallet wrap", "12", "£4.50", "=E2*F2", ""], ["4402", "03/11/2026", "Bright Cafe", "Paper cups (500)", "6", "£18.00", "=E3*F3", ""], ["4403", "04/11/2026", "Kent Bakery", "Flour 25kg", "20", "£14.20", "=E4*F4", ""]][r - 1]
          : Array(8).fill(""),
    ),
    widths: [80, 100, 140, 150, 60, 90, 90, 60],
    seeded: true,
  });

  return {
    version: 0,
    files,
    emails: [
      {
        id: "mail-sarah",
        folder: "inbox",
        from: PEOPLE.sarah,
        to: [{ name: "You", address: "you@northfieldsupplies.example" }],
        cc: [],
        subject: SUBJECT,
        time: "08:05",
        unread: true,
        body: `Morning,\n\nThree deliveries came in first thing. The delivery notes are attached.\n\nCan you put them in a new delivery report? Use the template in Operations Team > Documents > Deliveries, and save it in the 2026 folder, named like the others. I need it by 9 for the stand-up.\n\nWhen it's saved, reply with a link so I can open it.\n\nThanks,\nSarah\n\n${SIGNATURE.sarah}`,
        attachments: TODAYS.map((d) => ({ name: `${d.dn}.pdf`, paper: note(d) })),
        links: [],
      },
      {
        id: "mail-hr",
        folder: "inbox",
        from: PEOPLE.hr,
        to: [{ name: "You", address: "you@northfieldsupplies.example" }],
        cc: [],
        subject: "Your rota for next week",
        time: "07:52",
        unread: true,
        body: "Hi,\n\nYour shifts for 16 to 22 November are on the rota in the HR site. Let us know by Thursday if anything needs to change.\n\nHR Team",
        attachments: [],
        links: [],
      },
      {
        id: "mail-daniel",
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
      {
        id: "mail-facilities",
        folder: "inbox",
        from: PEOPLE.facilities,
        to: [{ name: "You", address: "you@northfieldsupplies.example" }],
        cc: [],
        subject: "Fire drill on Thursday at 11:00",
        time: "Fri 15:30",
        body: "Hello all,\n\nThe alarm will sound for about two minutes on Thursday at 11:00. Please leave by the nearest exit and meet in the car park.\n\nFacilities Team",
        attachments: [],
        links: [],
      },
    ],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const dnKey = (s: string) => s.toUpperCase().replace(/[^0-9]/g, "");
const cellText = (g: Grid, r: number, c: number) => (g[r]?.[c] ?? "").trim();

/* The rows of a sheet that carry one of today's delivery notes. */
function rowsFor(g: Grid, d: Delivery): number[] {
  const out: number[] = [];
  g.forEach((row, r) => {
    if (r > 0 && dnKey(row[1] ?? "") === dnKey(d.dn)) out.push(r);
  });
  return out;
}

const hasToday = (f: OfficeFile) => !!f.sheet && TODAYS.some((d) => rowsFor(f.sheet as Grid, d).length > 0);

function sheetsDiffer(a?: Grid, b?: Grid) {
  return JSON.stringify(a ?? []) !== JSON.stringify(b ?? []);
}

function check(s: OfficeState): Check[] {
  const fresh = seed();
  const isTarget = (f: OfficeFile) => samePath(f.path, TARGET) && f.name.toLowerCase() === NAME.toLowerCase();
  /* Every sheet holding today's deliveries; the one marked is the best placed. */
  const candidates = s.files.filter((f) => (f.kind === "xlsx" || f.kind === "xltx") && hasToday(f));
  const reportFile = candidates.find(isTarget) ?? candidates.find((f) => samePath(f.path, TARGET)) ?? candidates[0];
  const g = reportFile?.sheet ?? [];
  const where = reportFile ? `${pathText(reportFile.path)} > ${reportFile.name}` : "";
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  /* The report */
  const counts = TODAYS.map((d) => rowsFor(g, d).length);
  const missing = TODAYS.filter((_, i) => counts[i] === 0).map((d) => d.dn);
  const doubled = TODAYS.filter((_, i) => counts[i] > 1).map((d) => d.dn);
  add(
    { id: "rows", code: "XL-2", group: "The report", label: "All three deliveries are in, one row each" },
    !!reportFile && missing.length === 0 && doubled.length === 0,
    !reportFile
      ? "No saved report has today's deliveries in it yet. Open the template, add the three delivery notes, and save it."
      : missing.length
        ? `${missing.join(" and ")} ${missing.length === 1 ? "is" : "are"} missing. Type the delivery note number in the Delivery note column.`
        : `${doubled.join(" and ")} ${doubled.length === 1 ? "is" : "are"} in twice. Delete the extra row.`,
  );

  const wrong: string[] = [];
  TODAYS.forEach((d) => {
    const r = rowsFor(g, d)[0];
    if (r === undefined) return;
    if (!d.supplierKey.test(cellText(g, r, 2))) wrong.push(`${d.dn}: the supplier should be ${d.supplier}.`);
    else if (!d.itemKey.test(cellText(g, r, 3))) wrong.push(`${d.dn}: the item should be ${d.item}.`);
    else if (numeric(g, r, 4) !== d.expected) wrong.push(`${d.dn}: Expected should be ${d.expected}, the number ordered.`);
    else if (numeric(g, r, 5) !== d.received) wrong.push(`${d.dn}: Received should be ${d.received}, the number delivered.`);
  });
  add({ id: "facts", code: "XL-2", group: "The report", label: "Supplier, item, expected and received match the delivery notes" }, !!reportFile && missing.length < 3 && wrong.length === 0, wrong[0] ?? "Add the deliveries first.");

  const badDates = TODAYS.map((d) => rowsFor(g, d)[0]).filter((r) => r !== undefined && cellText(g, r, 0) !== TODAY);
  add(
    { id: "dates", code: "XL-3", group: "The report", label: `Dates are written ${TODAY}, like every other report` },
    !!reportFile && missing.length < 3 && badDates.length === 0,
    badDates.length ? `One date says "${cellText(g, badDates[0], 0) || "nothing"}". Write every date the same way: ${TODAY}.` : "Add the deliveries first.",
  );

  const badShort = TODAYS.filter((d) => {
    const r = rowsFor(g, d)[0];
    return r !== undefined && numeric(g, r, 6) !== d.expected - d.received;
  });
  add(
    { id: "short", code: "XL-2", group: "The report", label: "Short by is right: 2, 0 and 0" },
    !!reportFile && missing.length < 3 && badShort.length === 0,
    badShort.length ? `${badShort[0].dn} should be short by ${badShort[0].expected - badShort[0].received}. Expected take away Received, or type =E2-F2 for row 2 as the older reports do.` : "Add the deliveries first.",
  );

  const unsigned = TODAYS.filter((d) => {
    const r = rowsFor(g, d)[0];
    return r !== undefined && cellText(g, r, 7) === "";
  });
  add(
    { id: "checked", code: "XL-2", group: "The report", label: "Checked by has your name or initials on every row" },
    !!reportFile && missing.length < 3 && unsigned.length === 0,
    unsigned.length ? `${unsigned[0].dn} has nobody in Checked by. Put your initials there.` : "Add the deliveries first.",
  );

  /* Where you saved it */
  const inTarget = !!reportFile && samePath(reportFile.path, TARGET);
  add(
    { id: "place", code: "SP-3", group: "Where you saved it", label: `Saved in ${pathText(TARGET)}` },
    inTarget,
    reportFile ? `You saved it in ${pathText(reportFile.path)}. Sarah asked for ${pathText(TARGET)}. In File Explorer, select it and use Move to.` : "Save the report first.",
  );
  add(
    { id: "name", code: "SP-4", group: "Where you saved it", label: `Named "${NAME}", like the others` },
    !!reportFile && reportFile.name.toLowerCase() === NAME.toLowerCase(),
    reportFile ? `It is called "${reportFile.name}". The others are named year-month-day, then Delivery report: "${NAME}". In File Explorer, select it and use Rename.` : "Save the report first.",
  );
  const strays = candidates.filter((f) => f !== reportFile && !f.seeded);
  const touched = s.files.filter((f) => f.seeded && f.sheet && sheetsDiffer(f.sheet, fresh.files.find((x) => x.id === f.id)?.sheet));
  add(
    { id: "one", code: "SP-3", group: "Where you saved it", label: "One copy only, and the template and older reports are untouched" },
    strays.length === 0 && touched.length === 0,
    touched.length
      ? `"${touched[0].name}" has been changed. Nobody else's file should change: open it and put it back, or start again.`
      : `There is a second copy: ${pathText(strays[0]?.path ?? [])} > ${strays[0]?.name}. Delete the extra one so there is only one report.`,
  );

  /* Telling Sarah */
  const toSarah = s.emails.filter((e) => e.folder === "sent" && e.to.some((p) => p.address === PEOPLE.sarah.address));
  const mail = toSarah.find((e) => e.links.length > 0) ?? toSarah[toSarah.length - 1];
  add(
    { id: "replied", code: "OL-5", group: "Telling Sarah", label: "You replied to Sarah" },
    !!mail,
    "Open Sarah's email in Outlook and press Reply. Nothing has gone to her yet.",
  );
  const linked = !!mail && !!reportFile && mail.links.some((l) => samePath(l.path, reportFile.path) && l.fileName === reportFile.name);
  const attached = !!mail && mail.attachments.length > 0;
  add(
    { id: "link", code: "SP-6", group: "Telling Sarah", label: "With a link to the report, not a copy" },
    linked && !attached,
    !mail
      ? "Reply to Sarah, then use Insert link and pick the report."
      : attached && !linked
        ? "You attached a copy. Sarah asked for a link, so everyone works on the one file in SharePoint. Use Insert link instead."
        : mail.links.length
          ? `Your link goes to "${mail.links[0].fileName}", not today's report${where ? ` (${where})` : ""}.`
          : "Your reply has no link. Use Insert link and pick today's report.",
  );
  add(
    { id: "short-told", code: "OL-4", group: "Telling Sarah", label: "You told her DN-77812 came two pallets short" },
    !!mail && (/77812/.test(mail.body) || (/short/i.test(mail.body) && /\b(2|two)\b/i.test(mail.body))),
    "Say what she needs to know: DN-77812 from Harlow came two pallets short.",
  );
  add(
    { id: "subject", code: "OL-2", group: "Telling Sarah", label: "The subject says what it is about" },
    !!mail && (/^re:/i.test(mail.subject.trim()) || /deliver/i.test(mail.subject)),
    'Keep "Re: This morning\'s deliveries" when you reply, so Sarah sees at once what it answers.',
  );
  return out;
}

export const morningReport: Job = {
  id: "m5j1",
  slug: "morning-report",
  moduleId: "m5",
  moduleLabel: "Module 5: Putting business data in",
  title: "The morning delivery report",
  summary: "Sarah needs this morning's three deliveries in a new report on the team site by 9, and a link to it.",
  clock: "08:07",
  deadline: "Sarah needs it by 09:00",
  doneLine: "Sarah has her report, and you did it the way an office does.",
  brief: "There is a job from Sarah in your inbox. Read it and do what she asks, the way she asks. When you think it's done, press Check my work.",
  hints: [
    "Open Sarah's email in Outlook. Open each delivery note.",
    "In File Explorer, go to Operations Team > Documents > Deliveries and open the template.",
    "Add one row for each delivery note. Copy the style of the rows in the older reports.",
    "File > Save as. Pick Operations Team > Documents > Deliveries > 2026, and name it like the others.",
    "Back in Outlook, reply to Sarah. Use Insert link to add the report, and say what was short.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["place"] },
    { label: "Name it so anyone can find it", checks: ["name"] },
    { label: "One version, in one place", checks: ["one"] },
    { label: "Close the loop", checks: ["replied", "link"] },
    { label: "Check your own work", checks: ["rows", "facts", "dates", "short", "checked"] },
  ],
};
