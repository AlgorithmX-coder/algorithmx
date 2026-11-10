import { inbound, officeFolders, PEOPLE, SIGNATURE } from "../northfield";
import { tabsOf, type Check, type Grid, type Job, type OfficeFile, type OfficeState, type Tab } from "../types";

/* E4.1 Fix the stock count (criteria XL-1, WIN-4). Sarah names two cells
 * on the Aisle C tab of the team's stock workbook. The learner opens it
 * from SharePoint, goes to the right tab and cells, saves it where it
 * lives, and tells her. The other aisles sit on their own tabs, so a
 * number typed on the wrong one is caught and named. */

const STOCK_PATH = ["Operations Team", "Documents", "Stock"];
const STOCK_ID = "seed-stock";
const pad = (rows: string[][]): Grid => {
  const g = rows.map((r) => [...r, ...Array(4 - r.length).fill("")]);
  while (g.length < 24) g.push(["", "", "", ""]);
  return g;
};
const HEAD = ["Item", "Boxes", "Location", "Counted by"];

const AISLE_A: Grid = pad([HEAD, ["Plain flour 25kg", "60", "A-01", "SP"], ["Sugar 25kg", "32", "A-02", "SP"], ["Rice 10kg", "28", "A-03", "SP"], ["Cooking oil 20L", "14", "A-04", "SP"], ["Salt 25kg", "9", "A-05", "SP"], ["Pasta 5kg", "41", "A-06", "SP"], ["Tinned tomatoes", "75", "A-07", "SP"], ["Baked beans", "88", "A-08", "SP"], ["Stock cubes", "36", "A-09", "SP"]]);
const AISLE_B: Grid = pad([HEAD, ["Washing-up liquid", "22", "B-01", "DO"], ["Hand soap 5L", "18", "B-02", "DO"], ["Blue roll", "54", "B-03", "DO"], ["Bin liners", "47", "B-04", "DO"], ["Antibac spray", "30", "B-05", "DO"], ["Mop heads", "12", "B-06", "DO"], ["Gloves (100)", "66", "B-07", "DO"], ["Bleach 5L", "20", "B-08", "DO"], ["Sponges (10)", "25", "B-09", "DO"]]);
const AISLE_C: Grid = pad([
  HEAD,
  ["Pallet wrap", "24", "C-01", "SP"],
  ["Labels (1000)", "18", "C-02", "SP"],
  ["Paper cups 8oz", "40", "C-03", "SP"],
  ["Lids 8oz", "35", "C-04", "SP"],
  ["Paper bags small", "22", "C-05", "SP"],
  ["Glass cloths", "15", "C-06", "SP"],
  ["Bin liners", "30", "C-07", "SP"],
  ["Napkins", "95", "C-08", "SP"],
  ["Paper straws", "12", "C-09", "SP"],
  ["Cling film", "28", "C-10", "SP"],
  ["Foil rolls", "19", "C-11", "SP"],
  ["Takeaway boxes", "44", "C-12", "SP"],
  ["Paper bags large", "63", "C-13", "SP"],
  ["Sauce pots", "50", "C-14", "SP"],
]);
const TABS: Tab[] = [
  { name: "Aisle A", grid: AISLE_A },
  { name: "Aisle B", grid: AISLE_B },
  { name: "Aisle C", grid: AISLE_C },
];

/* The two fixes: [row, col] from 0, the value wanted, what it holds now. */
const FIXES = [
  { cell: "B9", r: 8, c: 1, want: "120", item: "Napkins" },
  { cell: "B14", r: 13, c: 1, want: "36", item: "Paper bags large" },
];

function seed(): OfficeState {
  const files: OfficeFile[] = [
    ...officeFolders(),
    { id: STOCK_ID, path: STOCK_PATH, name: "Stock November.xlsx", kind: "xlsx", modified: "09/11/2026", by: "Sarah Patel", sheet: AISLE_A, tabs: TABS.map((t) => ({ name: t.name, grid: t.grid.map((r) => [...r]) })), widths: [180, 90, 100, 110], seeded: true },
  ];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-sarah-count",
        from: PEOPLE.sarah,
        subject: "Two fixes to the aisle C count",
        time: "10:12",
        body: `Hi,\n\nI've recounted two things in aisle C. Can you fix them in the stock workbook (Operations Team > Documents > Stock > Stock November.xlsx), on the Aisle C tab?\n\n- B9: the napkins are now 120\n- B14: the large paper bags should be 36, not 63. I typed it backwards!\n\nPlease save it, then let me know it's done.\n\nThanks,\nSarah\n\n${SIGNATURE.sarah}`,
      }),
    ],
  };
}

const cellOf = (g: Grid | undefined, r: number, c: number) => (g?.[r]?.[c] ?? "").trim();

function check(s: OfficeState): Check[] {
  const file = s.files.find((f) => f.id === STOCK_ID);
  const tabs = file ? tabsOf(file) : [];
  const aisleC = tabs.find((t) => t.name === "Aisle C")?.grid;
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  for (const fx of FIXES) {
    const got = cellOf(aisleC, fx.r, fx.c);
    /* the same cell on another tab, changed: the classic wrong-tab slip */
    const wrongTab = tabs.find((t) => t.name !== "Aisle C" && cellOf(t.grid, fx.r, fx.c) !== cellOf(TABS.find((x) => x.name === t.name)?.grid, fx.r, fx.c));
    add(
      { id: `fix-${fx.cell}`, code: "XL-1", group: "The two fixes", label: `${fx.cell} on Aisle C says ${fx.want} (${fx.item})` },
      got === fx.want,
      wrongTab && cellOf(wrongTab.grid, fx.r, fx.c) === fx.want
        ? `You changed ${fx.cell} on the ${wrongTab.name} tab. Sarah meant the Aisle C tab: click it at the bottom, then fix ${fx.cell} there.`
        : `${fx.cell} on Aisle C says ${got || "nothing"}. Open the Aisle C tab, click ${fx.cell} (column B, row ${fx.r + 1}), type ${fx.want} and press Enter. Then save.`,
    );
  }

  const changed: string[] = [];
  TABS.forEach((t) => {
    const now = tabs.find((x) => x.name === t.name)?.grid;
    t.grid.forEach((row, r) =>
      row.forEach((v, c) => {
        if (t.name === "Aisle C" && FIXES.some((f) => f.r === r && f.c === c)) return;
        if (cellOf(now, r, c) !== v.trim()) changed.push(`${t.name} ${String.fromCharCode(65 + c)}${r + 1}`);
      }),
    );
  });
  add(
    { id: "nothing-else", code: "XL-1", group: "The two fixes", label: "Nothing else in the workbook changed" },
    changed.length === 0 && tabs.length === 3,
    tabs.length !== 3 ? "A tab has been added or removed. The workbook should still have Aisle A, Aisle B and Aisle C." : `${changed[0]} has changed. Only B9 and B14 on Aisle C should. Put it back as it was.`,
  );
  add(
    { id: "saved-in-place", code: "WIN-4", group: "Saving", label: "Saved into the team's workbook, where it lives" },
    !!file && file.by === "You" && !s.files.some((f) => f.id !== STOCK_ID && f.kind === "xlsx" && !f.seeded),
    s.files.some((f) => f.id !== STOCK_ID && f.kind === "xlsx" && !f.seeded)
      ? "You saved a copy somewhere else. Sarah needs the team's file updated: open Stock November.xlsx from Operations Team > Documents > Stock, fix it, and press Save."
      : "The team's file hasn't been saved with your changes. Press Save in Excel (the title bar should say Saved).",
  );
  add(
    { id: "told", code: "OL-5", group: "Saving", label: "You told Sarah it's done" },
    s.emails.some((e) => e.folder === "sent" && e.to.some((p) => p.address === PEOPLE.sarah.address)),
    "Reply to Sarah's email to say both fixes are in and saved.",
  );
  return out;
}

export const stockCount: Job = {
  id: "m4j1",
  slug: "stock-count",
  moduleId: "m4",
  moduleLabel: "Module 4: What a spreadsheet is",
  title: "Fix the stock count",
  summary: "Sarah names two cells on one tab of the team's stock workbook. Find them, fix them, save, and tell her.",
  clock: "10:14",
  deadline: "Sarah is reordering at 11:00",
  doneLine: "Both numbers fixed on the right tab, nothing else touched, and Sarah knows. She can reorder with confidence.",
  brief: "Sarah has emailed you two fixes for the stock workbook. Read her email and make them. When you think it's done, press Check my work.",
  hints: [
    "Read Sarah's email: which file, which tab, which cells.",
    "In File Explorer, go to Operations Team > Documents > Stock and open Stock November.xlsx.",
    "Click the Aisle C tab at the bottom. Then click B9 and type 120, and B14 and type 36.",
    "Press Save. Then reply to Sarah to say it's done.",
  ],
  seed,
  check,
  habits: [
    { label: "Check your own work", checks: ["fix-B9", "fix-B14", "nothing-else"] },
    { label: "One version, in one place", checks: ["saved-in-place"] },
    { label: "Close the loop", checks: ["told"] },
  ],
};
