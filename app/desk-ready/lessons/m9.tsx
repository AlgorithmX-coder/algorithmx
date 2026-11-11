"use client";

import { AccessFigure, BinFigure, ExportFigure, keep, LibraryFigure, LinkSettingsFigure, NameFigure, PlacesFigure, SendFigure, ShareFigure, TidyFigure, VersionsFigure } from "../learn/figures/files";
import { FilesLab, type FilesRule } from "../learn/filesLab";
import { SendLab } from "../learn/sendLab";
import type { LabProps, ModuleManifest } from "../learn/types";
import { accessFor, linkUrl, wideLinks } from "../office/files";
import { PEOPLE } from "../office/northfield";
import { samePath, type Grid, type OfficeFile, type OfficeState, type Paper, type Path } from "../office/types";
import { followsHouseRule, para } from "../office/word";

/* Module 9: Files and sharing (criteria SP-1 to SP-7, WIN-5). Folders that
 * make sense, file names you can find again, OneDrive against SharePoint
 * and Teams, a link or an attachment, and who can see a file. Every
 * practice that moves, names or shares a file runs in the office's own
 * File Explorer (FilesLab), with the real Share box, Version history and
 * Recycle bin; link or attachment runs in an Outlook look-alike (SendLab).
 * Three office jobs follow on the module page.
 *
 * House copy rules: UK English, plain words, short sentences, no
 * em-dashes. Quiz options are kept to similar lengths so the right answer
 * is never the obvious longest one. */

const OPS = ["Operations Team", "Documents"];
const ORDERS = [...OPS, "Orders"];
const file = (id: string, path: Path, name: string, extra: Partial<OfficeFile> = {}): OfficeFile => ({ id, path, name, kind: (name.split(".").pop() as OfficeFile["kind"]) ?? "xlsx", modified: "09/11/2026", by: "Sarah Patel", seeded: true, editable: true, ...extra });
const find = (s: OfficeState, id: string) => s.files.find((f) => f.id === id);
const inPath = (s: OfficeState, id: string, p: Path) => !!find(s, id) && samePath(find(s, id)!.path, p);
const hasFolder = (s: OfficeState, p: Path, name: string) => s.files.some((f) => f.kind === "folder" && samePath(f.path, p) && f.name === name);
const sheet = (rows: string[][]): Grid => [...rows.map((r) => [...r]), ...Array.from({ length: 8 }, () => Array(rows[0].length).fill(""))];

/* ---------- Lesson 1: folders that make sense ---------- */

const ORDER_HEAD = ["Order no", "Date", "Customer", "Item", "Qty"];
const summary = (date: string, n: string) => sheet([ORDER_HEAD, [n, date, "Bright Cafe", "Paper cups (case of 500)", "6"], [String(Number(n) + 1), date, "Kent Bakery", "Plain flour 25kg", "20"]]);

function FolderLab(p: LabProps) {
  const rules: FilesRule[] = [
    { label: "There's a 2025 folder in Orders", test: (s) => hasFolder(s, ORDERS, "2025"), hint: "In Orders, press New folder, type 2025 and press Enter." },
    { label: "Last year's two summaries are in Orders > 2025", test: (s) => inPath(s, "lab-o1", [...ORDERS, "2025"]) && inPath(s, "lab-o2", [...ORDERS, "2025"]), hint: "Drag each 2025 file onto the 2025 folder, or select it and press Move to." },
    { label: "This year's summary is in Orders > 2026", test: (s) => inPath(s, "lab-o3", [...ORDERS, "2026"]), hint: "Drag 2026-11-02 Order summary.xlsx onto the 2026 folder." },
    { label: "The extra copy is deleted, and the real one kept", test: (s) => !find(s, "lab-o4") && !!find(s, "lab-o3"), hint: "\"(1)\" on the end means a copy. Open both to see they match, then delete the one ending (1)." },
  ];
  return (
    <FilesLab
      {...p}
      tasks={[
        {
          scenario:
            "The Orders folder on the team site has last year's order summaries mixed in with this year's, and one file twice.\n\n1. Make a folder called 2025 in Orders.\n2. Put the two 2025 summaries in it.\n3. Put this year's summary in the 2026 folder.\n4. Delete the copy that ends in (1).",
          start: ORDERS,
          files: [
            file("lab-o1", ORDERS, "2025-12-01 Order summary.xlsx", { sheet: summary("01/12/2025", "4012"), modified: "01/12/2025" }),
            file("lab-o2", ORDERS, "2025-12-15 Order summary.xlsx", { sheet: summary("15/12/2025", "4050"), modified: "15/12/2025" }),
            file("lab-o3", ORDERS, "2026-11-02 Order summary.xlsx", { sheet: summary("02/11/2026", "4398"), modified: "02/11/2026" }),
            file("lab-o4", ORDERS, "2026-11-02 Order summary (1).xlsx", { sheet: summary("02/11/2026", "4398"), modified: "02/11/2026" }),
          ],
          rules,
        },
      ]}
    />
  );
}

/* ---------- Lesson 2: file names you can find again ---------- */

const PO: Paper = {
  heading: "Purchase order",
  from: ["Northfield Supplies", "Unit 2, Abbey Trade Park", "Leicester LE4 5AA"],
  meta: [
    ["Order number", "PO 3312"],
    ["Date", "04/11/2026"],
    ["Supplier", "Kent Flour Mills"],
  ],
  table: { head: ["Item", "Qty", "Price"], rows: [["Plain flour 25kg", "40", "£14.20"]] },
  footer: "Please quote the order number on your invoice.",
};
const NAMES: { id: string; date: string; says: RegExp; example: string }[] = [
  { id: "lab-n1", date: "2026-11-04", says: /purchase|order|PO|3312|kent/i, example: "2026-11-04 Purchase order PO 3312.pdf" },
  { id: "lab-n2", date: "2026-11-06", says: /kent|bakery|order/i, example: "2026-11-06 Kent Bakery order.xlsx" },
  { id: "lab-n3", date: "2026-10-28", says: /letter|bright/i, example: "2026-10-28 Letter to Bright Cafe.docx" },
];

function NamesLab(p: LabProps) {
  const at = [...ORDERS, "2026"];
  const rule = (n: (typeof NAMES)[number], what: string): FilesRule => ({
    label: `${what} is named the house way, with its own date`,
    test: (s) => {
      const f = find(s, n.id);
      return !!f && followsHouseRule(f.name) && f.name.startsWith(n.date) && n.says.test(f.name.slice(11));
    },
    hint: `Open it to find its date. Then Rename (F2): the date year first, then what it is, like "${n.example}".`,
  });
  return (
    <FilesLab
      {...p}
      tasks={[
        {
          scenario:
            "Three files in Orders > 2026 have names nobody could search for. Open each one to see what it is and its date, then rename it the house way: the date, year first, then a few words saying what it is.\n\nThe ending (.pdf, .xlsx, .docx) stays as it is.",
          start: at,
          files: [
            file("lab-n1", at, "scan002.pdf", { kind: "pdf", paper: PO, by: "Daniel Okafor" }),
            file("lab-n2", at, "Kent order FINAL v2.xlsx", { sheet: sheet([ORDER_HEAD, ["4410", "06/11/2026", "Kent Bakery", "Plain flour 25kg", "20"], ["4411", "06/11/2026", "Kent Bakery", "Strong bread flour 16kg", "8"]]), widths: [80, 100, 130, 190, 50] }),
            file("lab-n3", at, "letter bright cafe JM.docx", { kind: "docx", by: "Daniel Okafor", doc: { blocks: [para("28 October 2026"), para("Bright Cafe"), para("4 Market Place, Leicester LE1 5GG"), para(""), para("Dear Mr Dale,"), para("Paper cup prices from 1 December", "h2"), para("From 1 December 2026, our 8oz paper cups will cost £19.20 a case.")] } }),
            file("lab-n0", at, "2026-11-02 Order summary.xlsx", { sheet: summary("02/11/2026", "4398"), editable: false }),
          ],
          rules: [rule(NAMES[0], "The scanned purchase order"), rule(NAMES[1], "Kent Bakery's order"), rule(NAMES[2], "The letter to Bright Cafe")],
        },
      ]}
    />
  );
}

/* ---------- Lesson 3: OneDrive, SharePoint and Teams files ---------- */

const PRICE_HEAD = ["Code", "Item", "Price"];
const prices = (cups: string, flour: string) => sheet([PRICE_HEAD, ["BC-301", "Paper cups 8oz (case of 500)", cups], ["KF-201", "Plain flour 25kg", flour], ["HP-101", "Pallet wrap 500mm", "£4.50"]]);
const RIGHT_PRICES = prices("£19.20", "£14.20");

function PlacesLab(p: LabProps) {
  const drafts = ["OneDrive", "Documents", "Drafts"];
  const stock = [...OPS, "Stock"];
  return (
    <FilesLab
      {...p}
      tasks={[
        {
          scenario:
            "Two files are in the wrong place.\n\n1. Your own rough notes on the stock count are on the team site, in Operations Team > Documents > Stock. Move them to your OneDrive, in Documents > Drafts.\n2. The Bay C count Sarah needs is sitting in your Downloads, where only you can see it. Move it to the team's Stock folder.",
          start: stock,
          files: [
            file("lab-p1", stock, "2026-11-09 My notes on the count.docx", { kind: "docx", by: "You", doc: { blocks: [para("My notes on the count", "title"), para("Bay C: count by the layer.", "bullet"), para("Ask Sarah about the bread flour.", "bullet")] } }),
            file("lab-p2", ["OneDrive", "Downloads"], "2026-11-10 Bay C count.xlsx", { by: "You", seeded: false, sheet: sheet([["Bay", "Item", "Counted"], ["C", "Cardboard boxes, large", "240"], ["C", "Parcel tape (pack of 36)", "86"]]) }),
            file("lab-p0", stock, "Stock November.xlsx", { editable: false }),
          ],
          rules: [
            { label: "Your notes are in OneDrive > Documents > Drafts", test: (s) => inPath(s, "lab-p1", drafts), hint: "Select your notes, press Move to, click Documents under OneDrive, then double-click Drafts, and press Move here." },
            { label: "The Bay C count is in Operations Team > Documents > Stock", test: (s) => inPath(s, "lab-p2", stock), hint: "Go to Downloads, select the count, press Move to, then pick Operations Team > Documents > Stock." },
          ],
        },
        {
          scenario:
            "Daniel saved over the price list by mistake this morning, and the paper cup price went back to last month's. Open its Version history, look at the versions, and restore the one from yesterday, 10/11/2026 at 16:05.",
          start: ORDERS,
          files: [
            file("lab-price", ORDERS, "Price list.xlsx", {
              by: "Daniel Okafor",
              modified: "11/11/2026 09:02",
              sheet: prices("£18.00", "£14.20"),
              widths: [80, 240, 90],
              versions: [
                { no: "1.0", modified: "02/11/2026 10:30", by: "Priya Shah", sheet: prices("£18.00", "£13.90") },
                { no: "2.0", modified: "10/11/2026 16:05", by: "Priya Shah", sheet: RIGHT_PRICES },
              ],
            }),
          ],
          rules: [
            { label: "Yesterday's 16:05 version is the current one again", test: (s) => JSON.stringify(find(s, "lab-price")?.sheet) === JSON.stringify(RIGHT_PRICES), hint: "Select Price list.xlsx, press Version history, and press Restore beside 10/11/2026 16:05. Open it first to check: cups are £19.20." },
            { label: "It's still Price list.xlsx, in Orders", test: (s) => inPath(s, "lab-price", ORDERS) && find(s, "lab-price")?.name === "Price list.xlsx", hint: "Restore puts it right in the same file. Leave its name and folder as they are." },
          ],
        },
      ]}
    />
  );
}

/* ---------- Lesson 4: send a link or attach a file? ---------- */

function LinkOrAttachLab(p: LabProps) {
  const stock = { name: "Stock November.xlsx", kind: "xlsx" as const, where: "Operations Team › Documents › Stock" };
  const harlow = { name: "2026-11-10 Harlow stock.pdf", kind: "pdf" as const, where: "A PDF of Harlow's four rows only" };
  const report = { name: "2026-11-10 Delivery report.xlsx", kind: "xlsx" as const, where: "Operations Team › Documents › Deliveries › 2026" };
  const reportPdf = { name: "2026-11-10 Delivery report.pdf", kind: "pdf" as const, where: "A PDF of the report, made this morning" };
  const letter = { name: "2026-11-10 Letter to Oak Street Deli.pdf", kind: "pdf" as const, where: "A PDF of the letter" };
  const letterDoc = { name: "Letter to Oak Street Deli.docx", kind: "docx" as const, where: "OneDrive › Documents › Drafts" };
  return (
    <SendLab
      {...p}
      tasks={[
        {
          to: "Priya Shah",
          org: "Accounts, at Northfield",
          ask: "Can you send me the stock sheet? I need to put the prices in.",
          subject: "Stock sheet",
          files: [stock, harlow],
          how: "link",
          file: 0,
          right: "Priya works here, so she gets a link to the one stock sheet (shared with her first, as the next lesson shows). Her prices go straight into the team's file.",
          wrongHow: "An attachment is a copy. Priya's prices would go into her copy, and the team's sheet would never get them. Send a link instead.",
          wrongFile: "That PDF has only Harlow's rows, and nobody can type prices into a PDF. Link her to the stock sheet itself.",
        },
        {
          to: "Tom Hale",
          org: "Harlow Packaging, a supplier",
          outside: true,
          ask: "Could you send me what you're holding of our products?",
          subject: "Stock of your products",
          files: [stock, harlow],
          how: "attach",
          file: 1,
          right: "Tom is outside the company, so he gets his own copy, and only his rows: the PDF of Harlow's rows, attached.",
          wrongHow: "A link to our files is no use to someone outside Northfield, and could let him into far more than his rows. Attach a copy instead.",
          wrongFile: "The stock sheet has every supplier's numbers in it. Tom only gets Harlow's: attach the PDF of his rows.",
        },
        {
          to: "Daniel Okafor",
          org: "Office Manager, at Northfield",
          ask: "Where's this morning's delivery report? I want to add a note to it.",
          subject: "This morning's delivery report",
          files: [report, reportPdf],
          how: "link",
          file: 0,
          right: "Daniel is on the team and wants to add to it, so a link to the one report on the team site. No copies going round.",
          wrongHow: "A copy by email means two reports: his note would go in his, not the team's. Send a link to the one on the site.",
          wrongFile: "Nobody can add a note to a PDF, and it's a copy. Link him to the report itself.",
        },
        {
          to: "Rita Fenwick",
          org: "Oak Street Deli, a customer",
          outside: true,
          ask: "Could you put the refund in writing for me, please?",
          subject: "Refund for order 4405",
          files: [letterDoc, letter],
          how: "attach",
          file: 1,
          right: "Rita is a customer, outside the company. She gets the finished letter as a PDF, attached: it looks the same on any computer and can't be changed by mistake.",
          wrongHow: "Rita can't open our OneDrive or SharePoint, so a link won't work for her. Attach the letter.",
          wrongFile: "That's the Word draft: she could change it, and it might look different on her computer. Attach the PDF.",
        },
      ]}
    />
  );
}

/* ---------- Lesson 5: who can see it ---------- */

const ROTA = sheet([["Day", "Early (06:00)", "Late (14:00)"], ["Mon 16/11", "Sarah", "Ben"], ["Tue 17/11", "Ben", "Sarah"], ["Wed 18/11", "Sarah", "Ben"]]);

function ShareLab(p: LabProps) {
  const anyone = (f: OfficeFile) => ({ id: "lnk-anyone", scope: "anyone" as const, role: "view" as const, people: [], url: linkUrl(f, "lnkanyone01") });
  const rotaBase = file("lab-rota", OPS, "2026-11-16 Warehouse rota.xlsx", { sheet: ROTA, widths: [110, 140, 140] });
  const rota = { ...rotaBase, shareLinks: [anyone(rotaBase)] };
  const priceBase = file("lab-price2", ORDERS, "Price list.xlsx", { by: "Priya Shah", sheet: RIGHT_PRICES, widths: [80, 240, 90] });
  return (
    <FilesLab
      {...p}
      tasks={[
        {
          scenario:
            "Emma in HR needs to read next week's warehouse rota, but not change it. She isn't on the Operations Team site.\n\n1. Share 2026-11-16 Warehouse rota.xlsx with Emma so she can view it.\n2. Someone made an \"Anyone\" link to the rota. Open Manage access (the people icon in the Share box) and delete that link.",
          start: OPS,
          files: [rota],
          rules: [
            { label: "Emma can view the rota", test: (s) => !!find(s, "lab-rota") && accessFor(find(s, "lab-rota")!, PEOPLE.emma) === "view", hint: "Select the rota, press Share, type Emma and pick her, change Can edit to Can view, then press Send." },
            { label: "Emma can't change it", test: (s) => !!find(s, "lab-rota") && accessFor(find(s, "lab-rota")!, PEOPLE.emma) !== "edit", hint: "In Manage access, change Emma to Can view." },
            { label: "There's no \"Anyone\" link left", test: (s) => !(find(s, "lab-rota")?.shareLinks ?? []).some((l) => l.scope === "anyone"), hint: "Press Share, then the people icon at the top for Manage access. Press Delete link beside the Anyone link." },
          ],
        },
        {
          scenario:
            "Priya needs to update Price list.xlsx, and you want to paste a link to it in a chat. Make a link that only Priya can use, and that lets her edit:\n\nSelect the file, press Share, then the link settings under Copy link. Pick Specific people, add Priya, keep Can edit, Apply.",
          start: ORDERS,
          files: [priceBase],
          rules: [
            { label: "A Specific people link for Priya, that can edit", test: (s) => (find(s, "lab-price2")?.shareLinks ?? []).some((l) => l.scope === "people" && l.role === "edit" && l.people.some((x) => x.address === PEOPLE.priya.address)), hint: "In the Share box, press the bar under Copy link to open Link settings. Pick Specific people, add Priya, check it says Can edit, then press Apply." },
            { label: "No link for the whole company, or for anyone", test: (s) => !!find(s, "lab-price2") && wideLinks(find(s, "lab-price2")!).length === 0, hint: "A People in Northfield Supplies or Anyone link was made. In Manage access, Delete it." },
          ],
        },
      ]}
    />
  );
}

const m9: ModuleManifest = {
  id: "m9",
  number: 9,
  title: "Files and sharing",
  intro: "Every office keeps its files in shared folders, and expects you to find, name and share them the same way everyone else does. In five short lessons you'll tidy a folder, name files so anyone can find them, learn your OneDrive from the team's SharePoint, choose between a link and an attachment, and control who can open a file. Then you'll do it for real in the pretend office.",
  outcomes: [
    "Make folders, and move and delete files, without losing any",
    "Name a file the house way: the date, then what it is",
    "Keep your drafts in OneDrive and the team's files on SharePoint",
    "Send a colleague a link, and someone outside a PDF",
    "Share a file with the right people, and bring back an older version",
  ],
  topics: [
    {
      id: "m9t1",
      title: "Folders that make sense",
      minutes: 9,
      brief: "A shared folder is only useful if anyone can find things in it. In this lesson you'll see a whole team folder, then make a folder, move files into it, and delete safely.",
      learn: [
        {
          heading: "Here is a whole team folder",
          body: [
            "This is File Explorer, open at the Operations Team's Deliveries folder. The numbers on the picture match the list underneath it.",
            "On the left are your places (1) and the Recycle bin (16). Along the top, the buttons for working with files (3 to 10), and under them where you are (2). In the middle, the folders (11) and files (12), with when (14) and who (15) last saved each one.",
          ],
          figure: <LibraryFigure />,
        },
        {
          heading: "Where you are",
          body: [
            "Places (1) lists your OneDrive first, then the SharePoint sites of the teams you're in. Click one to go there.",
            "The path (2) shows the folder you're in and every folder above it: Operations Team, then Documents, then Deliveries. Click any step to go back up to it.",
          ],
          figure: <LibraryFigure focus={["places", "path"]} title="Places and the path" />,
          tip: "When an email says \"Operations Team > Documents > Deliveries\", that's a path. Click each step in turn, left to right.",
        },
        {
          heading: "A messy folder, and a tidy one",
          body: [
            "Here's the same folder twice. Before: the same report twice (1), last year mixed in with this year (2), and a name that says nothing (3).",
            "After: a folder for each year (4), a list that sorts itself into date order (5), and names that start with the date, like the scan's new name (6). Same files, nothing lost.",
          ],
          figure: <TidyFigure />,
        },
        {
          heading: "One folder per year",
          body: [
            "Here, a file from last December sits among this month's (2). Let last year's files pile up like that and the folder only ever grows, and finding this week's report means reading past dozens of old ones.",
            "Give each year its own folder (4). This year's work goes in 2026. Last year's goes in 2025, where it's kept but out of the way.",
          ],
          figure: <TidyFigure focus={["mixed", "years"]} title="Years in their own folders" />,
        },
        {
          heading: "Make a folder",
          body: [
            "Go into the folder where the new one belongs, then press New folder (3). Type its name and press Enter. It appears in the list, the way the 2026 folder does here (11).",
            "Name folders plainly, for what's in them: 2025, Invoices, Health and safety.",
          ],
          figure: <LibraryFigure focus={["newfolder", "folder"]} title="New folder" />,
        },
        {
          heading: "Move a file: drag it, or Move to",
          body: [
            "Press and hold on a file (12), drag it onto a folder (11), and let go. The folder lights up when you're over it. Here, this year's report goes into 2026.",
            "Or select the file, press Move to (5), pick the folder and press Move here. Either way the file is in one place: moved, not copied.",
          ],
          figure: <LibraryFigure focus={["moveto", "folder", "file"]} title="Moving a file" />,
        },
        {
          heading: "Delete, and get it back",
          body: [
            "Delete sends a file to the Recycle bin, not away for ever. Here, two files sit in the bin. For each one you can see where it was (2), when it was deleted (3), and what it is (4).",
            "Deleted the wrong one? Select it and press Restore (1). It goes back where it was.",
          ],
          figure: <BinFigure />,
          tip: "Before you delete a \"copy\", open both files and check they really are the same.",
        },
      ],
      tryIt: { title: "Tidy a folder", intro: "The Orders folder has two years mixed together and a file twice. Sort it out in File Explorer.", Lab: FolderLab },
      check: [
        {
          q: "Last year's reports are mixed in with this year's. What's the tidy fix?",
          options: ["Make a 2025 folder and move them in", "Delete last year's reports for good", "Move them all into your OneDrive"],
          answer: 0,
          reasons: ["They're kept, but out of the way of this year's work.", "Old reports are still needed, for audits and checking back.", "Then nobody else on the team could find them."],
        },
        {
          q: "You deleted the wrong file a minute ago. What do you do?",
          options: ["Restore it from the Recycle bin", "Ask Sarah to make it again", "Start a new file with its name"],
          answer: 0,
          reasons: ["It waits in the Recycle bin, so Restore puts it back as it was.", "No need: nothing is lost yet. Look in the Recycle bin.", "A new file would be empty. The real one is in the Recycle bin."],
        },
        {
          q: "Two files in a folder look like the same report. What do you do?",
          options: ["Open both, then delete the copy", "Keep both of them, just in case", "Rename one of them to v2"],
          answer: 0,
          reasons: ["Check they match first. Then one version, in one place.", "Two copies drift apart, and nobody knows which is right.", "That makes it worse: now there's a v2 to explain."],
        },
      ],
      takeaways: ["A folder per year keeps this year's work easy to find.", "Drag a file onto a folder, or use Move to.", "Delete goes to the Recycle bin: Restore puts it back."],
    },
    {
      id: "m9t2",
      title: "File names you can find again",
      minutes: 8,
      brief: "A good name tells anyone what a file is without opening it. In this lesson you'll learn Northfield's house rule for names, then rename files to fit it.",
      learn: [
        {
          heading: "Here is a file name, done the house way",
          body: [
            "Every file at Northfield is named the same way: the date (1), a space, then what it is (2). The ending (3) says what kind of file it is.",
            "Because every name starts with its date, year first, a folder lists its files in date order all by itself (4).",
          ],
          figure: <NameFigure />,
        },
        {
          heading: "The date goes first, year first",
          body: [
            "Write the date as year, month, day, with dashes: 10 November 2026 is 2026-11-10 (1). Two digits for the month and the day, so 9 November is 2026-11-09.",
            "Use the date the file is about: the day of the delivery, the date on the letter. Not the day you happened to save it. Then the folder lists every file in date order (4).",
          ],
          figure: <NameFigure focus={["date", "sorted"]} title="The date" />,
          good: [{ text: "2026-11-09", note: "Year, month, day. Sorts in order." }],
          bad: [{ text: "9 Nov, 09-11-26, 9.11.2026", note: "Every one sorts out of order, and some are unclear." }],
        },
        {
          heading: "Then say what it is",
          body: [
            "After the date, a few plain words (2): Delivery report, Letter to Oak Street Deli, Purchase order PO 3312. Start with a capital letter.",
            "No \"final\", no \"v2\", no \"new\", no initials. The date already says which one it is, and Version history keeps the older ones.",
          ],
          figure: <NameFigure focus={["words"]} title="What it is" />,
          good: [{ text: "2026-11-06 Delivery report.xlsx", note: "The date, then what it is." }],
          bad: [{ text: "report final v2.xlsx", note: "Final for now. Which report? When?" }, { text: "scan001.pdf", note: "Nobody can tell what it is." }],
        },
        {
          heading: "Leave the ending alone",
          body: [
            "The ending (3) says what kind of file it is: .xlsx is Excel, .docx is Word, .pdf is a PDF. The program puts it there.",
            "When you rename, change only the words in front of it. File Explorer keeps the ending for you.",
          ],
          figure: <NameFigure focus={["ending"]} title="The ending" />,
        },
        {
          heading: "Open it to find its date",
          body: [
            "A name like scan001 (3) gives nothing away. Double-click the file to open it, and read what it is and its date.",
            "Here, scan001 turns out to be Harlow's delivery note DN-77790, dated 09/11/2026. So it becomes 2026-11-09 Delivery note DN-77790.pdf (6).",
          ],
          figure: <TidyFigure focus={["vague", "dated"]} title="From a vague name to a clear one" />,
        },
        {
          heading: "Rename a file",
          body: [
            "Here, the selected file (12) is called report final v2.xlsx. It was last saved on 9 November, but open it and the report inside is for 6 November. Use that date: press Rename (6), or F2 on the keyboard, type 2026-11-06 Delivery report, and press Enter.",
            "Check it afterwards: the date year first, a space, a few words, and the ending as it was.",
          ],
          figure: <LibraryFigure focus={["rename", "file"]} title="Rename" file="report final v2.xlsx" what={{ file: "Its name says nothing useful. Open it, find its date, then rename it." }} />,
        },
      ],
      tryIt: { title: "Rename three files", intro: "Three files have names nobody could search for. Open each one, then rename it the house way.", Lab: NamesLab },
      check: [
        {
          q: "Which name follows the house rule?",
          options: ["2026-11-09 Delivery note DN-77790.pdf", "Delivery note 9 Nov FINAL.pdf", "09-11-2026 delivery note SP.pdf"],
          answer: 0,
          reasons: ["Date year first, then what it is. Anyone can find it.", "The date comes first, year first, and no \"final\".", "Year first, a capital to start the words, and no initials."],
        },
        {
          q: "Why does the year go first in the date?",
          options: ["So files sort into date order", "Because Windows needs it that way", "So the newest file is always top"],
          answer: 0,
          reasons: ["Year, then month, then day sorts oldest to newest by itself.", "Windows takes any name. It's a house rule, for people.", "Sorted by name, the oldest comes first, the newest last."],
        },
        {
          q: "A scanned delivery note is called scan001.pdf. What date goes in its new name?",
          options: ["The date on the delivery note", "Today's date, when you rename it", "The date it was scanned in"],
          answer: 0,
          reasons: ["The name says what the file is about, so its own date.", "Renaming doesn't change what it is. Use the date on it.", "The scan date is about the scanner, not the delivery."],
        },
      ],
      takeaways: ["Date first, year first: 2026-11-10.", "Then a few words that say what it is.", "No final, no v2, no initials. Leave the ending alone."],
    },
    {
      id: "m9t3",
      title: "OneDrive, SharePoint and Teams files",
      minutes: 9,
      brief: "Your work files live in two kinds of place: your own OneDrive, and the team's SharePoint sites, which Teams shows too. In this lesson you'll see which is which, what goes where, and how every save is kept.",
      learn: [
        {
          heading: "Two places, and Teams showing one of them",
          body: [
            "On the left, your OneDrive (1): only you can open it (2), so it's for your drafts (3).",
            "In the middle, the Operations Team's site on SharePoint (4): the whole team can open it (5), so it holds the files the team works on (6). On the right, the Files tab in Teams (7): not a third place, but the team's site again, showing that very same file (8).",
          ],
          figure: <PlacesFigure />,
        },
        {
          heading: "OneDrive is yours",
          body: [
            "Your OneDrive (1) is your own drawer at work, kept online so it's on any computer you sign in to. Nobody else can open what's in it (2) unless you share it.",
            "That makes it right for your drafts and notes (3), and wrong for anything the team needs. If you're off sick, nobody can get at it.",
          ],
          figure: <PlacesFigure focus={["onedrive", "onlyyou", "drafts"]} title="Your OneDrive" />,
        },
        {
          heading: "SharePoint is the team's",
          body: [
            "Every team has a site on SharePoint (4): Operations Team, Finance, HR. Everyone in the team can open what's on it (5), without being sent anything.",
            "So anything the team needs goes there (6): the stock sheet, delivery reports, the rota. One file, in one place, that everyone works on.",
          ],
          figure: <PlacesFigure focus={["site", "members", "teamfile"]} title="The team's SharePoint site" />,
          tip: "Ask yourself: would anyone else need this if I were off tomorrow? If yes, it goes on the team's site.",
        },
        {
          heading: "Teams shows the same files",
          body: [
            "In Teams, each team has a Files tab (7). It isn't a third place to keep things: it shows the team's SharePoint site.",
            "So the stock sheet in Teams (8) is the very same file as on the site (6). Change it in one and it's changed in both.",
          ],
          figure: <PlacesFigure focus={["filestab", "samefile", "teamfile"]} title="Teams' Files tab" />,
        },
        {
          heading: "Getting a file onto the team's site",
          body: [
            "Here, the Bay C count (4) is in your OneDrive, but the team needs it. Select it and press Move to (2). A box opens with the same places down its left side as File Explorer has here (3). Click Operations Team, double-click Documents and then Stock, and press Move here. It's moved, so there's still only one.",
            "A file that's only on your computer goes up with Upload (1), into the folder you're in.",
          ],
          figure: <LibraryFigure view="onedrive" focus={["upload", "moveto", "places", "file"]} renumber={{ upload: 1, moveto: 2, places: 3, file: 4 }} title="Moving it to the team" what={{ places: "Your OneDrive at the top, then the team sites. The Move to box lists the same places.", file: "The Bay C count. The team needs it, but it is still in your OneDrive, where only you can see it." }} />,
        },
        {
          heading: "Every save is kept",
          body: [
            "Files on OneDrive and SharePoint keep every version (3). Each time someone saves, the one before is kept, with when it was saved and by whom (1).",
            "Here, Sarah saved last month's numbers over the stock sheet at 08:31, so that's now the current version (2). Last night's count, from 17:42, is just underneath.",
          ],
          figure: <VersionsFigure />,
        },
        {
          heading: "Open it, then Restore",
          body: [
            "Select the file and press Version history. Press Open (4) on a version to look at it (6), read-only. Check it's the one you want.",
            "Then press Restore (5). That version becomes the current one again, and the one it replaced stays in the list, so nothing is ever lost.",
          ],
          figure: <VersionsFigure focus={["open", "restore", "preview"]} title="Bringing a version back" />,
        },
      ],
      tryIt: { title: "Put files in their place", intro: "Move your notes to your OneDrive and a team file onto the team's site. Then bring back yesterday's version of a price list.", Lab: PlacesLab },
      check: [
        {
          q: "Where do your own rough notes go?",
          options: ["Your OneDrive, in Drafts", "The team's site, to keep them safe", "Teams, in the channel's Files tab"],
          answer: 0,
          reasons: ["They're just for you, so your own OneDrive.", "The team would see them, and wonder which file is real.", "The Files tab is the team's site, so it's the same problem."],
        },
        {
          q: "Sarah changes the stock sheet in Teams' Files tab. What happens to the one on the team's site?",
          options: ["It changes too: it's one file", "Nothing: Teams has its own copy", "It changes once she emails it"],
          answer: 0,
          reasons: ["The Files tab shows the team's SharePoint site. Same file.", "Teams keeps a team's files on its SharePoint site, not a copy.", "Nothing needs sending. It's already the same file."],
        },
        {
          q: "You restore yesterday's version. What happens to this morning's?",
          options: ["It stays in the version list", "It's gone for good straight away", "It goes to the Recycle bin"],
          answer: 0,
          reasons: ["Restoring keeps it, so you could bring it back too.", "Nothing is lost. It's kept as an earlier version.", "It stays in the file's own Version history, not the bin."],
        },
      ],
      takeaways: ["OneDrive is yours: drafts and notes.", "SharePoint is the team's, and Teams' Files tab shows it.", "Version history keeps every save: Open, then Restore."],
    },
    {
      id: "m9t4",
      title: "Send a link or attach a file?",
      minutes: 8,
      brief: "There are two ways to send someone a file: a link to the one file, or a copy attached. In this lesson you'll learn which to use when, and how to make a PDF of only the rows someone should see.",
      learn: [
        {
          heading: "A link, and an attachment",
          body: [
            "Two emails. On the left, to Priya, a colleague (1), with a link (2): it opens the team's own stock sheet (3).",
            "On the right, to Tom at a supplier, outside the company (4), with an attachment (5): a PDF copy of just his rows (6), to keep.",
          ],
          figure: <SendFigure />,
        },
        {
          heading: "A link: everyone on the one file",
          body: [
            "Priya is a colleague (1), so she gets a link (2). A link copies nothing. It opens the file where it lives (3), so her changes go into the team's file, and everyone sees the latest.",
            "That's why colleagues get links: one version, in one place. But a link only opens for people who can open the file, so share it with them first (the next lesson shows how).",
          ],
          figure: <SendFigure focus={["colleague", "link", "onefile"]} title="A link, for a colleague" />,
        },
        {
          heading: "An attachment: a copy that's theirs",
          body: [
            "An attachment (5) is a copy that travels with the email. Once it's sent, it's theirs (6): what they do to it never touches our file, and our changes never reach theirs.",
            "So an attachment suits someone outside the company (4), who can't open our files, or anything that should stay as it was sent: a letter, a quote.",
          ],
          figure: <SendFigure focus={["outside", "attachment", "copy"]} title="An attachment, for someone outside" />,
        },
        {
          heading: "Outside the company: a PDF, and only what's theirs",
          body: [
            "For someone outside (4), send a PDF (5), not the spreadsheet. A PDF can't be changed by mistake and looks the same on any computer.",
            "And only what's theirs (6). The stock sheet has every supplier's numbers: Tom gets Harlow's four rows, never a link to the whole sheet.",
          ],
          figure: <SendFigure focus={["outside", "attachment", "copy"]} title="What Tom gets" what={{ copy: "Harlow's four rows and nothing else. Other suppliers' stock is none of Tom's business." }} />,
          good: [{ text: "PDF of Harlow's rows, attached", note: "His rows only, to keep." }],
          bad: [{ text: "A link to Stock November.xlsx", note: "Every supplier's stock, and our own file." }],
        },
        {
          heading: "Here is Excel making a PDF of some rows",
          body: [
            "To send only Harlow's rows, filter the sheet (3) so only theirs show (4), then make a PDF of what's on screen.",
            "Press File (1), then Export, then Create PDF (2). The PDF gets exactly what you can see.",
          ],
          figure: <ExportFigure />,
        },
        {
          heading: "Filter to the rows they need",
          body: [
            "Press Filter on the ribbon, then the ▾ on the Supplier heading (3), and pick Harlow Packaging.",
            "Only Harlow's rows show (4). The others are hidden, not deleted, and the yellow bar says how many are on show: 4 of 11.",
          ],
          figure: <ExportFigure focus={["filter", "shown"]} title="The filter" menu={false} />,
        },
        {
          heading: "Export, then look at it",
          body: [
            "Press File (1), Export, then Create PDF (2). Name it the house way, the date first and then what it is, like 2026-11-10\u00a0Harlow\u00a0stock, and press Save.",
            "The PDF opens. Read it before you send it: Harlow's rows, and nobody else's. Then attach it to your email.",
          ],
          figure: <ExportFigure focus={["file", "export"]} title="Create PDF" />,
          tip: "The stock sheet is the team's one file, so when you're done, press Clear filter in the yellow bar. Then the next person to open it sees every row.",
        },
      ],
      tryIt: { title: "Link or attach?", intro: "Four people need a file. For each one, insert a link or attach a copy, pick the right file, and send.", Lab: LinkOrAttachLab },
      check: [
        {
          q: "Priya in Accounts needs to add prices to the stock sheet. How do you send it?",
          options: ["Share it, then send her a link", "Attach the spreadsheet to an email", "Attach a PDF of the stock sheet"],
          answer: 0,
          reasons: ["Her prices go into the one team file.", "She'd fill in a copy, and the team's sheet would never get them.", "Nobody can type prices into a PDF."],
        },
        {
          q: "Tom at Harlow wants to see his stock rows. How do you send them?",
          options: ["A PDF of just his rows, attached", "A link to the whole stock sheet", "The spreadsheet, as an attachment"],
          answer: 0,
          reasons: ["His own copy of his rows, and nothing else.", "He's outside the company, and it shows every supplier.", "That's every supplier's stock, in a file he could change."],
        },
        {
          q: "You filter the sheet to Harlow and press Create PDF. What's in the PDF?",
          options: ["The headings and Harlow's rows", "Every row, with Harlow's coloured", "Harlow's rows, and a count of the rest"],
          answer: 0,
          reasons: ["It prints what's on screen: the filtered rows.", "The hidden rows stay out. Only what shows goes in.", "Nothing about the other rows goes in at all."],
        },
      ],
      takeaways: ["Colleagues get a link to the one file.", "Someone outside gets a PDF, attached.", "Filter first, so the PDF has only what's theirs."],
    },
    {
      id: "m9t5",
      title: "Who can see it: sharing settings",
      minutes: 9,
      brief: "Sharing decides who can open a file, and whether they can change it. In this lesson you'll share with the right people, set what a link can do, and take access away.",
      learn: [
        {
          heading: "Here is the Share box",
          body: [
            "Select a file and press Share, and this opens. At the top, what you're sharing (1). Then who (2), what they can do (3), a message (4), and Send (5).",
            "Underneath, Copy link: who the link works for (6), and Copy (7). At the top right, Manage access (8): everyone who can open it now.",
          ],
          figure: <ShareFigure />,
        },
        {
          heading: "Share with people by name",
          body: [
            "Type a name (2) and pick them from the list. Choose Can edit or Can view (3), add a line saying why (4), and press Send (5).",
            "They get an email with a link that works for them, and only them. This is the simplest, safest way to share.",
          ],
          figure: <ShareFigure focus={["people", "role", "message", "send"]} title="Share by name" />,
          tip: "Only give Can edit to people who need to change it. Everyone else gets Can view.",
        },
        {
          heading: "Copy link, and who it works for",
          body: [
            "Copy (7) gives you a link to paste into an email or a chat. Who it works for is written in the bar under Copy link (6).",
            "Read that bar every time. Here it says \"People in Northfield Supplies with the link can edit\": anyone at the company who gets hold of the link could change the file.",
          ],
          figure: <ShareFigure focus={["copylink", "settings"]} title="Copy link" />,
        },
        {
          heading: "Here are the link settings",
          body: [
            "Press the bar under Copy link and these settings open. Who the link works for: Anyone (1), People in Northfield Supplies (2), People with existing access (3), or Specific people (4).",
            "Here, Specific people is picked (4), the safest choice. Then what they can do (5): Can edit, or Can view. Press Apply, and copy the link.",
          ],
          figure: <LinkSettingsFigure />,
        },
        {
          heading: "Anyone means anyone",
          body: [
            "An Anyone link (1) works for whoever has it, with no sign-in. Forwarded once, it's out of your hands. Never use it for company files.",
            "People in Northfield Supplies (2) lets in the whole company. Specific people (4) lets in only the people you name: the right choice when you're asked to share with someone by name.",
          ],
          figure: <LinkSettingsFigure focus={["anyone", "org", "people"]} title="Who a link lets in" />,
          good: [{ text: "Specific people: Priya Shah, Can edit", note: "Only Priya, and she can change it." }],
          bad: [{ text: "Anyone with the link can edit", note: "Anyone it reaches can change your file." }],
        },
        {
          heading: "Here is Manage access",
          body: [
            "The people icon in the Share box opens Manage access. It shows the team (1), who can open everything on the team's SharePoint site anyway, and anyone the file was shared with by name (2), with what they can do (3).",
            "Below, every link that opens it (5). This one works for the whole company.",
          ],
          figure: <AccessFigure />,
        },
        {
          heading: "Take access away",
          body: [
            "Shared with the wrong person, or with Can edit by mistake? Change it (3), or press Remove (4) and it stops working for them.",
            "A link that lets in too many people: press Delete link (6). It stops working for everyone who has it.",
          ],
          figure: <AccessFigure focus={["change", "remove", "deletelink"]} title="Changing your mind" />,
          tip: "Check Manage access before you share anything that matters. It's the true list of who can open it.",
        },
      ],
      tryIt: { title: "Share it the right way", intro: "Let Emma read the rota without changing it, and get rid of a risky link. Then make a link only Priya can use.", Lab: ShareLab },
      check: [
        {
          q: "Emma needs to read the rota, not change it. What do you do?",
          options: ["Share with Emma, Can view, and Send", "Copy an Anyone link that can view", "Share with Emma, Can edit, and Send"],
          answer: 0,
          reasons: ["Only Emma gets in, and she can read but not change it.", "Anyone who gets the link could open it, not just Emma.", "She'd be able to change it, which she doesn't need."],
        },
        {
          q: "Which kind of link could be opened by someone outside the company?",
          options: ["Anyone", "People in Northfield Supplies", "Specific people"],
          answer: 0,
          reasons: ["Anyone with it can open it, inside or outside, no sign-in.", "Only people at Northfield, signed in, can use it.", "Only the people named, signed in, can use it."],
        },
        {
          q: "You shared a file with the wrong person. What do you do?",
          options: ["Manage access, then Remove them", "Rename the file so they can't find it", "Delete the email you sent to them"],
          answer: 0,
          reasons: ["That takes their access away, so the link stops working.", "Their link still opens it, whatever it's called.", "It's in their inbox already. Take the access away instead."],
        },
      ],
      takeaways: ["Share by name, with the least they need: often Can view.", "Read who a link works for. Never Anyone for company files.", "Manage access shows who has it, and takes it away."],
    },
  ],
};

/* Dates, codes, short paths and file names never split across two lines. */
function keptWhole(m: ModuleManifest): ModuleManifest {
  const ex = (e?: { text: string; note?: string }[]) => e?.map((x) => ({ text: keep(x.text), note: x.note && keep(x.note) }));
  return {
    ...m,
    topics: m.topics.map((t) => ({
      ...t,
      brief: keep(t.brief),
      learn: t.learn.map((c) => ({ ...c, heading: keep(c.heading), body: c.body.map(keep), tip: c.tip && keep(c.tip), good: ex(c.good), bad: ex(c.bad) })),
      check: t.check.map((q) => ({ ...q, q: keep(q.q), options: q.options.map(keep), reasons: q.reasons.map(keep) })),
      takeaways: t.takeaways.map(keep),
    })),
  };
}

export default keptWhole(m9);
