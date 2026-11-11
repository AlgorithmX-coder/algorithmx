import { officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import { pathText, samePath, type Check, type Grid, type Job, type OfficeFile, type OfficeState, type Paper, type Path } from "../types";
import { followsHouseRule } from "../word";

/* E9.1 Sort out the shared folder (criteria SP-3, SP-4, WIN-5). Sarah says
 * nobody can find anything in Deliveries: nine files sit loose in it, named
 * every which way (scan001.pdf, report final v2.xlsx, a "Copy of" it), with
 * last year's mixed in with this year's. The learner opens each to find
 * its date and what it is, names it by the house rule, makes a 2025 folder
 * for last year's and moves this year's into 2026, deletes the duplicate,
 * and loses nothing else. The well-named reports already in 2026 show the
 * house way by example. */

export const DELIVERIES = ["Operations Team", "Documents", "Deliveries"] as const;
const Y2025: Path = [...DELIVERIES, "2025"];
const Y2026: Path = [...DELIVERIES, "2026"];
const HEAD = ["Date", "Delivery note", "Supplier", "Item", "Expected", "Received", "Short by", "Checked by"];
const WIDTHS = [104, 116, 156, 184, 84, 84, 84, 104];

function report(rows: string[][]): Grid {
  const g: Grid = [HEAD, ...rows.map((r, i) => [...r.slice(0, 6), `=E${i + 2}-F${i + 2}`, r[6] ?? "SP"])];
  while (g.length < 20) g.push(Array(HEAD.length).fill(""));
  return g;
}

const SCAN: Paper = {
  heading: "Delivery note",
  from: ["Harlow Packaging Ltd", "Unit 9, Canal Business Park", "Leicester LE4 0XA"],
  meta: [
    ["Delivery note", "DN-77790"],
    ["Date", "09/11/2026"],
    ["Your order", "PO 3301"],
    ["Deliver to", "Northfield Supplies, Goods in"],
  ],
  table: { head: ["Item", "Ordered", "Delivered"], rows: [["Pallet wrap", "8", "8"]] },
  note: "All in. DO",
  footer: "Received in good condition unless noted above.",
};

/* One loose file: what it is called now, what is in it, and what a good
 * name and place for it are. */
interface Loose {
  id: string;
  name: string;
  year: "2025" | "2026";
  /* the date it belongs to, house style */
  date: string;
  /* words a good description has one of */
  says: RegExp;
  example: string;
  file: Omit<OfficeFile, "id" | "path" | "name" | "seeded" | "editable">;
}

const R1106 = report([
  ["06/11/2026", "DN-40861", "Kent Flour Mills", "Plain flour 25kg", "40", "38", "SP"],
  ["06/11/2026", "DN-11604", "Brightwater Cups", "Paper cups (case of 500)", "20", "20", "SP"],
]);

export const LOOSE: Loose[] = [
  { id: "seed-scan", name: "scan001.pdf", year: "2026", date: "2026-11-09", says: /delivery note|DN-?77790|harlow/i, example: "2026-11-09 Delivery note DN-77790.pdf", file: { kind: "pdf", modified: "09/11/2026 16:20", by: "Daniel Okafor", paper: SCAN } },
  { id: "seed-final", name: "report final v2.xlsx", year: "2026", date: "2026-11-06", says: /deliver|report/i, example: "2026-11-06 Delivery report.xlsx", file: { kind: "xlsx", modified: "06/11/2026 15:02", by: "Sarah Patel", sheet: R1106, widths: WIDTHS } },
  { id: "seed-copy", name: "Copy of report final v2.xlsx", year: "2026", date: "2026-11-06", says: /deliver|report/i, example: "2026-11-06 Delivery report.xlsx", file: { kind: "xlsx", modified: "06/11/2026 15:40", by: "Sarah Patel", sheet: R1106.map((r) => [...r]), widths: WIDTHS } },
  {
    id: "seed-3nov",
    name: "Delivery report 3 Nov.xlsx",
    year: "2026",
    date: "2026-11-03",
    says: /deliver|report/i,
    example: "2026-11-03 Delivery report.xlsx",
    file: { kind: "xlsx", modified: "03/11/2026 10:18", by: "Sarah Patel", sheet: report([["03/11/2026", "DN-77744", "Harlow Packaging", "Pallet wrap", "10", "10", "SP"]]), widths: WIDTHS },
  },
  {
    id: "seed-pallets",
    name: "Pallet count 10th Nov.xlsx",
    year: "2026",
    date: "2026-11-10",
    says: /pallet|count/i,
    example: "2026-11-10 Pallet count.xlsx",
    file: {
      kind: "xlsx",
      modified: "10/11/2026 17:05",
      by: "Sarah Patel",
      sheet: [["Date", "Bay", "Full pallets", "Empty pallets", "Counted by"], ["10/11/2026", "A", "14", "3", "SP"], ["10/11/2026", "B", "9", "6", "SP"], ["10/11/2026", "C", "11", "2", "SP"], ...Array.from({ length: 12 }, () => Array(5).fill(""))],
      widths: [104, 70, 110, 120, 104],
    },
  },
  { id: "seed-dr1412", name: "DR 14-12-25.xlsx", year: "2025", date: "2025-12-14", says: /deliver|report/i, example: "2025-12-14 Delivery report.xlsx", file: { kind: "xlsx", modified: "14/12/2025 11:47", by: "Sarah Patel", sheet: report([["14/12/2025", "DN-40512", "Kent Flour Mills", "Plain flour 25kg", "60", "60", "SP"]]), widths: WIDTHS } },
  {
    id: "seed-1912",
    name: "Delivery report 19.12.2025 SP.xlsx",
    year: "2025",
    date: "2025-12-19",
    says: /deliver|report/i,
    example: "2025-12-19 Delivery report.xlsx",
    file: { kind: "xlsx", modified: "19/12/2025 09:30", by: "Sarah Patel", sheet: report([["19/12/2025", "DN-11520", "Brightwater Cups", "Cup lids (case of 500)", "40", "36", "SP"]]), widths: WIDTHS },
  },
  {
    id: "seed-2212",
    name: "2025-12-22 Delivery report.xlsx",
    year: "2025",
    date: "2025-12-22",
    says: /deliver|report/i,
    example: "2025-12-22 Delivery report.xlsx",
    file: { kind: "xlsx", modified: "22/12/2025 12:14", by: "Sarah Patel", sheet: report([["22/12/2025", "DN-77650", "Harlow Packaging", "Cardboard boxes, large", "200", "200", "SP"]]), widths: WIDTHS },
  },
  {
    id: "seed-returns",
    name: "Christmas returns.xlsx",
    year: "2025",
    date: "2025-12-23",
    says: /return/i,
    example: "2025-12-23 Christmas returns.xlsx",
    file: {
      kind: "xlsx",
      modified: "23/12/2025 16:40",
      by: "Daniel Okafor",
      sheet: [["Date", "Customer", "Item", "Qty", "Reason"], ["23/12/2025", "Bright Cafe", "Paper cups (case of 500)", "2", "Crushed in transit"], ["23/12/2025", "Kent Bakery", "Plain flour 25kg", "1", "Split sack"], ...Array.from({ length: 12 }, () => Array(5).fill(""))],
      widths: [104, 130, 200, 60, 160],
    },
  },
];

const PAIR = ["seed-final", "seed-copy"];

/* Reports already filed the house way, in 2026: the example to follow. */
const FILED: [string, string[][]][] = [
  ["2026-11-02 Delivery report.xlsx", [["02/11/2026", "DN-40830", "Kent Flour Mills", "Plain flour 25kg", "40", "40", "SP"]]],
  ["2026-11-05 Delivery report.xlsx", [["05/11/2026", "DN-77761", "Harlow Packaging", "Pallet wrap", "6", "6", "SP"]]],
  ["2026-11-09 Delivery report.xlsx", [["09/11/2026", "DN-77790", "Harlow Packaging", "Pallet wrap", "8", "8", "DO"]]],
];

const SARAH_BODY = `Hi,

Nobody can find anything in Deliveries. Can you sort it out?

It's Operations Team > Documents > Deliveries. Last year's files are mixed in with this year's, and half the names don't say what's in them. Name them the house way, like the reports already in the 2026 folder, so they sort by date.

Don't bin anything we need, mind. There's a copy of one report in there twice, though.

Thanks,
Sarah

${SIGNATURE.sarah}`;

function seed(): OfficeState {
  /* the Deliveries folder starts with 2026 only: 2025 is for the learner to make */
  const files: OfficeFile[] = officeFolders().filter((f) => !(f.kind === "folder" && samePath(f.path, DELIVERIES) && f.name === "2025"));
  for (const l of LOOSE) files.push({ ...l.file, id: l.id, path: [...DELIVERIES], name: l.name, seeded: true, editable: true });
  FILED.forEach(([name, rows], i) => files.push({ id: `seed-filed-${i}`, path: [...Y2026], name, kind: "xlsx", modified: `${name.slice(8, 10)}/11/2026`, by: "Sarah Patel", sheet: report(rows), widths: WIDTHS, seeded: true }));
  return {
    version: 0,
    files,
    emails: [
      { id: "mail-sarah-tidy", folder: "inbox", from: PEOPLE.sarah, to: [{ name: "You", address: "you@northfieldsupplies.example" }], cc: [], subject: "Deliveries folder is a mess", time: "11:24", unread: true, body: SARAH_BODY, attachments: [], links: [] },
      {
        id: "mail-daniel-names",
        folder: "inbox",
        from: PEOPLE.daniel,
        to: [{ name: "You", address: "you@northfieldsupplies.example" }],
        cc: [],
        subject: "How we name files",
        time: "Mon 09:20",
        body: `Hi,\n\nOne house rule worth knowing early: every file is named with its date first, year-month-day, then a few words saying what it is. Like this:\n\n2026-11-10 Delivery report.xlsx\n\nNo "final", no "v2", no initials. That way a folder sorts itself into date order and anyone can find anything.\n\nDaniel\n\n${SIGNATURE.daniel}`,
        attachments: [],
        links: [],
      },
    ],
  };
}

/* ── marking ─────────────────────────────────────────────────────────── */

const insideDeliveries = (f: OfficeFile) => f.path.length >= DELIVERIES.length && DELIVERIES.every((x, i) => f.path[i] === x);
const stem = (n: string) => n.replace(/\.[a-z]{3,4}$/i, "");

function check(s: OfficeState): Check[] {
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });
  const now = (id: string) => s.files.find((f) => f.id === id);
  const binned = (id: string) => (s.recycle ?? []).some((r) => r.file.id === id || r.inside.some((f) => f.id === id));
  /* the loose files still about, the duplicate pair counted once */
  const pairLeft = PAIR.map(now).filter((f): f is OfficeFile => !!f);
  const kept = LOOSE.filter((l) => !PAIR.includes(l.id) || l.id === pairLeft[0]?.id).map((l) => ({ l, f: now(l.id) })).filter((x): x is { l: Loose; f: OfficeFile } => !!x.f);

  /* Names */
  const badRule = kept.find(({ f }) => !followsHouseRule(f.name) || /\s[A-Z]{2,3}$/.test(stem(f.name)));
  const vague = kept.find(({ l, f }) => followsHouseRule(f.name) && !l.says.test(stem(f.name).slice(11)));
  add(
    { id: "names", code: "SP-4", group: "The names", label: "Every file is named the house way: the date, then what it is" },
    !badRule && !vague,
    badRule
      ? `"${badRule.f.name}" doesn't follow the house rule. Year-month-day first, then a few words saying what it is, with no "final", "v2", "copy" or initials: for example "${badRule.l.example}". Select it in File Explorer and press Rename (or F2).`
      : vague
        ? `"${vague.f.name}" has the date right, but the words after it don't say what's in it. Open it and say what it is, like "${vague.l.example}".`
        : undefined,
  );
  const badDate = kept.find(({ l, f }) => followsHouseRule(f.name) && f.name.slice(0, 10) !== l.date);
  add(
    { id: "dates", code: "SP-4", group: "The names", label: "Each date is the date in the file, not today's" },
    kept.some(({ l, f }) => f.name !== l.name && followsHouseRule(f.name)) && !badDate,
    badDate ? `"${badDate.f.name}" has the wrong date. Open it: the date inside is ${badDate.l.date.split("-").reverse().join("/")}, so the name starts ${badDate.l.date}.` : "Rename the files first.",
  );

  /* The folders */
  const has2025 = s.files.some((f) => f.kind === "folder" && samePath(f.path, DELIVERIES) && f.name === "2025");
  add(
    { id: "folder2025", code: "WIN-5", group: "The folders", label: "There's a 2025 folder in Deliveries, next to 2026" },
    has2025,
    s.files.some((f) => f.kind === "folder" && f.name.includes("2025") && insideDeliveries(f))
      ? 'Your folder for last year isn\'t called just "2025", or isn\'t straight inside Deliveries. Name it 2025, like the 2026 folder beside it.'
      : "Go to Deliveries, press New folder, and call it 2025, like the 2026 folder beside it.",
  );
  const wrongYear = kept.find(({ l, f }) => !samePath(f.path, l.year === "2025" ? Y2025 : Y2026));
  add(
    { id: "years", code: "SP-3", group: "The folders", label: "Last year's files are in 2025, and this year's in 2026" },
    kept.length > 0 && !wrongYear,
    wrongYear
      ? `"${wrongYear.f.name}" is in ${pathText(wrongYear.f.path)}. It's from ${wrongYear.l.year}, so it goes in Deliveries > ${wrongYear.l.year}: drag it onto the folder, or use Move to.`
      : "Move the files into their year's folder.",
  );

  /* Nothing lost */
  add(
    { id: "dup", code: "SP-3", group: "Nothing lost", label: 'The "Copy of" duplicate is deleted, and one copy is kept' },
    pairLeft.length === 1,
    pairLeft.length === 2
      ? `"${pairLeft[1].name}" and "${pairLeft[0].name}" are the same report twice. Open both to see. Delete one, so there's one version in one place.`
      : 'Both copies of that report are gone. Open the Recycle bin in File Explorer, pick one of them and press Restore: the team still needs one.',
  );
  const others = [...LOOSE.filter((l) => !PAIR.includes(l.id)).map((l) => l.id), ...FILED.map((_, i) => `seed-filed-${i}`)];
  const missing = others.find((id) => !now(id));
  const strayed = others.map(now).find((f) => f && !insideDeliveries(f));
  const lostName = (id: string) => LOOSE.find((l) => l.id === id)?.name ?? FILED[Number(id.slice(-1))]?.[0] ?? id;
  add(
    { id: "kept", code: "SP-3", group: "Nothing lost", label: "Nothing else was deleted or moved out of Deliveries" },
    !missing && !strayed,
    missing
      ? `"${lostName(missing)}" ${binned(missing) ? "is in the Recycle bin" : "is gone"}. Every file but the duplicate is still needed. ${binned(missing) ? "Open the Recycle bin in File Explorer, select it and press Restore." : "Start the job again to get it back."}`
      : strayed
        ? `"${strayed.name}" is now in ${pathText(strayed.path)}, outside Deliveries, where nobody will look for it. Move it back into its year's folder.`
        : undefined,
  );

  /* Telling Sarah */
  const told = s.emails.some((e) => e.folder === "sent" && e.to.some((p) => p.address === PEOPLE.sarah.address));
  add({ id: "told", code: "OL-5", group: "Telling Sarah", label: "You told Sarah it's done" }, told, "Close the loop: reply to Sarah's email in one line, like \"Done, Deliveries is sorted into 2025 and 2026.\"");
  return out;
}

export const sharedFolder: Job = {
  id: "m9j1",
  slug: "sort-shared-folder",
  moduleId: "m9",
  moduleLabel: "Module 9: Files and sharing",
  title: "Sort out the shared folder",
  summary: "Nobody can find anything in Deliveries. Name every file the house way, file last year's in a 2025 folder, and lose nothing but the duplicate.",
  clock: "11:30",
  deadline: "Wednesday 11 November",
  doneLine: "Deliveries sorts itself by date now, and anyone can find anything in it.",
  brief: "Sarah has emailed about the team's Deliveries folder. Read it and do what she asks. When you think it's done, press Check my work.",
  hints: [
    "Read Sarah's email, and Daniel's about how files are named.",
    "In File Explorer, click Operations Team, then double-click Documents, then Deliveries.",
    "Double-click each loose file to open it and find its date. Write the name year-month-day first: 9 November 2026 is 2026-11-09.",
    "Select a file and press Rename (or F2). Keep the words short and say what it is, like Delivery report.",
    "Press New folder in Deliveries and call it 2025. Drag each file onto its year's folder, or use Move to.",
    "Two files are the same report: open both, then delete the \"Copy of\" one. Anything deleted by mistake is in the Recycle bin.",
    "Reply to Sarah in one line to say it's done.",
  ],
  seed,
  check,
  habits: [
    { label: "Put it where the brief says", checks: ["folder2025", "years"] },
    { label: "Name it so anyone can find it", checks: ["names", "dates"] },
    { label: "One version, in one place", checks: ["dup"] },
    { label: "Close the loop", checks: ["told"] },
    { label: "Check your own work", checks: ["dates", "kept"] },
  ],
};
