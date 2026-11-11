import type { FileVersion, Grid, OfficeFile } from "../types";

/* ── Module 9: Files and sharing ──────────────────────────────────────────
 * Stock November.xlsx, the warehouse's stock sheet in Operations Team >
 * Documents > Stock, with its version history. E9.2 shares it (an edit link
 * for Priya, a PDF of Harlow's rows for Tom); E9.3 puts it back after Sarah
 * saved last month's numbers over it. Harlow's rows are spread through the
 * sheet, so a filter is the way to pick them out. */

export const STOCK = ["Operations Team", "Documents", "Stock"] as const;
export const STOCK_NAME = "Stock November.xlsx";
export const STOCK_HEAD = ["Code", "Item", "Supplier", "In stock", "Reorder at", "Counted"];
export const STOCK_WIDTHS = [86, 232, 164, 100, 116, 116];

/* code, item, supplier, reorder at, then the count on 2 Nov, 9 Nov (right)
 * and 30 Oct (the numbers Sarah saved over it by mistake) */
const ITEMS: [string, string, string, number, number, number, number][] = [
  ["HP-101", "Pallet wrap 500mm", "Harlow Packaging", 20, 41, 34, 18],
  ["KF-201", "Plain flour 25kg", "Kent Flour Mills", 40, 60, 52, 75],
  ["BC-301", "Paper cups 8oz (case of 500)", "Brightwater Cups", 30, 48, 41, 22],
  ["HP-114", "Bubble wrap roll", "Harlow Packaging", 10, 15, 12, 9],
  ["OC-401", "Blue roll (pack of 6)", "Oakfield Cleaning", 40, 70, 64, 52],
  ["BC-305", "Cup lids 8oz (case of 500)", "Brightwater Cups", 30, 44, 37, 20],
  ["HP-120", "Cardboard boxes, large", "Harlow Packaging", 150, 260, 240, 135],
  ["KF-210", "Strong bread flour 16kg", "Kent Flour Mills", 25, 30, 18, 41],
  ["BC-312", "Napkins (box of 2000)", "Brightwater Cups", 15, 26, 22, 30],
  ["HP-131", "Parcel tape (pack of 36)", "Harlow Packaging", 60, 95, 86, 48],
  ["OC-408", "Hand soap 5L", "Oakfield Cleaning", 12, 14, 9, 16],
];

export const HARLOW_CODES = ITEMS.filter((i) => i[2] === "Harlow Packaging").map((i) => i[0]);

function sheet(col: 4 | 5 | 6, counted: string): Grid {
  const g: Grid = [STOCK_HEAD, ...ITEMS.map((i) => [i[0], i[1], i[2], String(i[col]), String(i[3]), counted])];
  while (g.length < 22) g.push(Array(STOCK_HEAD.length).fill(""));
  return g.map((r) => [...r]);
}

/* 2 November's count, the first version of the month */
export const stockFirst = () => sheet(4, "02/11/2026");
/* last night's count: the right one */
export const stockRight = () => sheet(5, "09/11/2026");
/* last month's numbers, saved over it this morning */
export const stockWrong = () => sheet(6, "30/10/2026");

export const V_FIRST: Omit<FileVersion, "sheet"> = { no: "1.0", modified: "02/11/2026 09:10", by: "Sarah Patel" };
export const V_RIGHT: Omit<FileVersion, "sheet"> = { no: "2.0", modified: "09/11/2026 17:42", by: "Sarah Patel" };
export const V_WRONG = { modified: "10/11/2026 08:31", by: "Sarah Patel" };

/* The sheet as E9.2 finds it: last night's count is the current version. */
export function stockFile(over: Partial<OfficeFile> = {}): OfficeFile {
  return {
    id: "seed-stock",
    path: [...STOCK],
    name: STOCK_NAME,
    kind: "xlsx",
    modified: "09/11/2026 17:42",
    by: "Sarah Patel",
    sheet: stockRight(),
    widths: STOCK_WIDTHS,
    seeded: true,
    editable: true,
    versions: [{ ...V_FIRST, sheet: stockFirst() }],
    ...over,
  };
}

/* The sheet as E9.3 finds it: Sarah's 08:31 save, with October's numbers,
 * is current; last night's 17:42 version is one back in the history. */
export function stockSavedOver(): OfficeFile {
  return stockFile({
    modified: V_WRONG.modified,
    by: V_WRONG.by,
    sheet: stockWrong(),
    versions: [
      { ...V_FIRST, sheet: stockFirst() },
      { ...V_RIGHT, sheet: stockRight() },
    ],
  });
}

export const sameGrid = (a?: Grid, b?: Grid) => JSON.stringify(trimGrid(a ?? [])) === JSON.stringify(trimGrid(b ?? []));
const trimGrid = (g: Grid) => g.filter((r) => r.some((c) => c.trim())).map((r) => r.map((c) => c.trim()));

/* The other files in the Stock folder, so it looks lived in. */
export function stockNeighbours(): OfficeFile[] {
  return [
    { id: "seed-stock-oct", path: [...STOCK], name: "Stock October.xlsx", kind: "xlsx", modified: "30/10/2026 16:55", by: "Sarah Patel", sheet: stockWrong().map((r, i) => (i === 0 ? r : r.map((c, ci) => (ci === 5 && c ? "30/10/2026" : c)))), widths: STOCK_WIDTHS, seeded: true },
    { id: "seed-stock-guide", path: [...STOCK], name: "How we count stock.docx", kind: "docx", modified: "12/05/2026", by: "Daniel Okafor", seeded: true },
  ];
}
