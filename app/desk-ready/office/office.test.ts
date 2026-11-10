import { describe, expect, it } from "vitest";
import { display, evaluate } from "./formula";
import { morningReport } from "./jobs/morningReport";
import { PEOPLE, YOU } from "./northfield";
import type { Email, Grid, OfficeState } from "./types";

/* The office engine held on every CI run: the formulas a learner types,
 * and the morning report's marking (a fresh office fails, a job done the
 * way Sarah asked passes, and each classic mistake fails the right check). */

describe("formulas", () => {
  const g: Grid = [
    ["Qty", "Price", "Total"],
    ["12", "£4.50", "=A2*B2"],
    ["6", "£18.00", "=A3*B3"],
    ["", "", "=SUM(C2:C3)"],
    ["=A2-A3", "=AVERAGE(A2:A3)", "=C9"],
  ];
  it("works out references, sums and averages", () => {
    expect(evaluate(g, 1, 2)).toBe(54);
    expect(evaluate(g, 3, 2)).toBe(162);
    expect(evaluate(g, 4, 0)).toBe(6);
    expect(evaluate(g, 4, 1)).toBe(9);
  });
  it("shows money as money and plain text as typed", () => {
    expect(display(g, 1, 1)).toBe("£4.50");
    expect(display(g, 0, 0)).toBe("Qty");
    expect(display(g, 4, 2)).toBe("0"); // an empty cell counts as 0
  });
  it("flags a loop and a formula it cannot read", () => {
    expect(evaluate([["=A1"]], 0, 0)).toBe("#REF!");
    expect(evaluate([["5", "=SUM(A1"]], 0, 1)).toBe("#VALUE!");
  });
});

const TARGET = ["Operations Team", "Documents", "Deliveries", "2026"];
const NAME = "2026-11-10 Delivery report.xlsx";

function report(dates = ["10/11/2026", "10/11/2026", "10/11/2026"]): Grid {
  const g: Grid = [
    ["Date", "Delivery note", "Supplier", "Item", "Expected", "Received", "Short by", "Checked by"],
    [dates[0], "DN-77812", "Harlow Packaging", "Pallet wrap", "12", "10", "=E2-F2", "JM"],
    [dates[1], "DN-40915", "Kent Flour Mills", "Plain flour 25kg", "40", "40", "=E3-F3", "JM"],
    [dates[2], "DN-11630", "Brightwater Cups", "Paper cups", "30", "30", "0", "JM"],
  ];
  return g;
}

function reply(over: Partial<Email> = {}): Email {
  return {
    id: "mail-reply",
    folder: "sent",
    from: YOU,
    to: [PEOPLE.sarah],
    cc: [],
    subject: "Re: This morning's deliveries",
    body: "Hi Sarah,\n\nDone. DN-77812 came two pallets short.\n\nJM",
    time: "Just now",
    attachments: [],
    links: [{ name: NAME, path: TARGET, fileName: NAME }],
    ...over,
  };
}

function solved(edit: (s: OfficeState) => OfficeState = (s) => s): OfficeState {
  const s = morningReport.seed();
  return edit({
    ...s,
    files: [...s.files, { id: "mine", path: TARGET, name: NAME, kind: "xlsx", modified: "Today", by: "You", sheet: report() }],
    emails: [...s.emails, reply()],
  });
}

const failing = (s: OfficeState) => morningReport.check(s).filter((c) => !c.ok).map((c) => c.id);

describe("the morning delivery report", () => {
  it("fails every check in a fresh office", () => {
    expect(failing(morningReport.seed())).toHaveLength(morningReport.check(morningReport.seed()).length - 1); // only "one copy" holds
  });

  it("passes when it is done the way Sarah asked", () => {
    expect(failing(solved())).toEqual([]);
  });

  it("catches a report saved in OneDrive with a lazy name", () => {
    const s = solved((x) => ({ ...x, files: x.files.map((f) => (f.id === "mine" ? { ...f, path: ["OneDrive", "Documents"], name: "delivery report.xlsx" } : f)) }));
    const bad = morningReport.check(s).filter((c) => !c.ok);
    expect(bad.map((c) => c.id)).toEqual(expect.arrayContaining(["place", "name", "link"]));
    expect(bad.find((c) => c.id === "place")?.fix).toContain("OneDrive > Documents");
  });

  it("catches a date written a different way", () => {
    const s = solved((x) => ({ ...x, files: x.files.map((f) => (f.id === "mine" ? { ...f, sheet: report(["10/11/2026", "10/11/26", "10/11/2026"]) } : f)) }));
    expect(failing(s)).toEqual(["dates"]);
  });

  it("wants a link, not an attached copy", () => {
    const s = solved((x) => ({ ...x, emails: x.emails.map((e) => (e.id === "mail-reply" ? reply({ links: [], attachments: [{ name: NAME, sheet: report() }] }) : e)) }));
    const link = morningReport.check(s).find((c) => c.id === "link");
    expect(link?.ok).toBe(false);
    expect(link?.fix).toContain("attached a copy");
  });

  it("notices when yesterday's report was changed", () => {
    const s = solved((x) => ({ ...x, files: x.files.map((f) => (f.id === "seed-report-2" && f.sheet ? { ...f, sheet: f.sheet.map((r, i) => (i === 1 ? ["X", ...r.slice(1)] : r)) } : f)) }));
    expect(failing(s)).toEqual(["one"]);
  });

  it("wants Sarah told about the short delivery", () => {
    const s = solved((x) => ({ ...x, emails: x.emails.map((e) => (e.id === "mail-reply" ? reply({ body: "Hi Sarah, it's saved. JM" }) : e)) }));
    expect(failing(s)).toEqual(["short-told"]);
  });
});
