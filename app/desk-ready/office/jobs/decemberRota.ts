import { inbound, officeFolders, PEOPLE } from "../northfield";
import { tabsOf, type Check, type Grid, type Job, type OfficeFile, type OfficeState } from "../types";

/* E4.2 Start December's rota (criteria XL-1, WIN-4). Emma wants a new
 * December tab in the rota workbook, after November, with the same
 * headings, ready for her to fill in. The learner adds a sheet, renames
 * it, types the headings, saves the workbook where it lives and tells
 * Emma. November must be left exactly as it was. */

const ROTA_PATH = ["HR", "Rotas"];
const ROTA_ID = "seed-rota";
const HEAD = ["Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const NOVEMBER: Grid = (() => {
  const g: Grid = [
    HEAD,
    ["Sarah Patel", "E", "E", "E", "E", "E", "-"],
    ["Daniel Okafor", "E", "E", "E", "E", "E", "-"],
    ["Jordan Miles", "L", "L", "E", "E", "L", "-"],
    ["Priya Shah", "E", "E", "E", "-", "E", "-"],
    ["Sam Reid", "L", "L", "L", "L", "-", "E"],
    ["Aisha Noor", "-", "E", "L", "L", "L", "E"],
    [],
    ["E = early 07:00 to 15:00, L = late 12:00 to 20:00, - = day off"],
  ].map((r) => [...r, ...Array(HEAD.length - r.length).fill("")]);
  while (g.length < 24) g.push(Array(HEAD.length).fill(""));
  return g;
})();

function seed(): OfficeState {
  const folders = officeFolders();
  const files: OfficeFile[] = [
    ...folders,
    { id: "seed-dir-HR/Rotas", path: ["HR"], name: "Rotas", kind: "folder", modified: "02/11/2026", by: "Emma Clarke", seeded: true },
    { id: ROTA_ID, path: ROTA_PATH, name: "Rota 2026.xlsx", kind: "xlsx", modified: "30/10/2026", by: "Emma Clarke", sheet: NOVEMBER, tabs: [{ name: "November", grid: NOVEMBER.map((r) => [...r]) }], widths: [150, 64, 64, 64, 64, 64, 64], seeded: true },
  ];
  return {
    version: 0,
    files,
    emails: [
      inbound({
        id: "m-emma-rota",
        from: PEOPLE.emma,
        subject: "December rota",
        time: "14:40",
        body: "Hi,\n\nCan you start December's rota for me? Add a new tab called December to the rota workbook (HR > Rotas > Rota 2026.xlsx), after November, with the same headings along the top. Leave the rest blank and I'll fill in the shifts.\n\nSave it, and let me know when it's ready.\n\nThanks,\nEmma",
      }),
    ],
  };
}

function check(s: OfficeState): Check[] {
  const file = s.files.find((f) => f.id === ROTA_ID);
  const tabs = file ? tabsOf(file) : [];
  const dec = tabs.findIndex((t) => t.name.trim().toLowerCase() === "december");
  const nov = tabs.findIndex((t) => t.name === "November");
  const decGrid = dec >= 0 ? tabs[dec].grid : undefined;
  const heads = HEAD.map((_, c) => (decGrid?.[0]?.[c] ?? "").trim());
  const wrongHead = HEAD.findIndex((h, c) => heads[c].toLowerCase() !== h.toLowerCase());
  const extra = decGrid ? decGrid.slice(1).some((row) => row.some((v) => v.trim() !== "")) : false;
  const novSame = nov >= 0 && JSON.stringify(tabs[nov].grid.map((r) => r.map((v) => v.trim()))) === JSON.stringify(NOVEMBER.map((r) => r.map((v) => v.trim())));
  const out: Check[] = [];
  const add = (c: Omit<Check, "ok" | "fix">, ok: boolean, fix?: string) => out.push({ ...c, ok, fix: ok ? undefined : fix });

  add(
    { id: "tab", code: "XL-1", group: "The December tab", label: "There's a tab called December" },
    dec >= 0,
    tabs.length > 1 ? `The new tab is called "${tabs[tabs.length - 1].name}". Double-click it and rename it December.` : "Open Rota 2026.xlsx, press ⊕ next to the November tab, then double-click the new tab and call it December. Then save.",
  );
  add({ id: "after", code: "XL-1", group: "The December tab", label: "It comes after November" }, dec >= 0 && nov >= 0 && dec > nov, "December should sit to the right of November, so the months run in order.");
  add(
    { id: "headings", code: "XL-1", group: "The December tab", label: "It has the same seven headings as November, in row 1" },
    dec >= 0 && wrongHead === -1,
    dec < 0 ? "Add the December tab first." : `${String.fromCharCode(65 + wrongHead)}1 should say "${HEAD[wrongHead]}". November's headings are Name, Mon, Tue, Wed, Thu, Fri, Sat, in A1 to G1.`,
  );
  add({ id: "blank", code: "XL-1", group: "The December tab", label: "The rest is left blank for Emma" }, dec >= 0 && !extra, "Emma will fill in the shifts herself. Leave everything under the headings empty.");
  add({ id: "november", code: "XL-1", group: "Saving", label: "November is exactly as it was" }, novSame, "Something on the November tab has changed. Put it back, or start the job again.");
  add(
    { id: "saved", code: "WIN-4", group: "Saving", label: "Saved into the rota workbook, where it lives" },
    !!file && dec >= 0 && file.by === "You",
    "Emma's file doesn't have your new tab yet. Press Save in Excel, so the title bar says Saved.",
  );
  add(
    { id: "told", code: "OL-5", group: "Saving", label: "You told Emma it's ready" },
    s.emails.some((e) => e.folder === "sent" && e.to.some((p) => p.address === PEOPLE.emma.address)),
    "Reply to Emma to say December is ready for her.",
  );
  return out;
}

export const decemberRota: Job = {
  id: "m4j2",
  slug: "december-rota",
  moduleId: "m4",
  moduleLabel: "Module 4: What a spreadsheet is",
  title: "Start December's rota",
  summary: "Emma wants a new December tab in the rota workbook, with the same headings as November, ready for her to fill in.",
  clock: "14:42",
  deadline: "Emma wants it today",
  doneLine: "December is ready for Emma, in the right file and the right order, and November is untouched.",
  brief: "Emma has asked you to start December's rota. Read her email and do it. When you think it's done, press Check my work.",
  hints: [
    "In File Explorer, go to HR > Rotas and open Rota 2026.xlsx.",
    "Press ⊕ next to the November tab to add a sheet. Double-click the new tab and call it December.",
    "Type the seven headings from November into A1 to G1: Name, Mon, Tue, Wed, Thu, Fri, Sat.",
    "Press Save, then reply to Emma.",
  ],
  seed,
  check,
  habits: [
    { label: "Check your own work", checks: ["headings", "blank", "november"] },
    { label: "One version, in one place", checks: ["saved"] },
    { label: "Close the loop", checks: ["told"] },
  ],
};
