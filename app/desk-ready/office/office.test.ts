import { describe, expect, it } from "vitest";
import { display, evaluate, moveRowRefs, shiftRefs } from "./formula";
import { decemberRota } from "./jobs/decemberRota";
import { lateDelivery } from "./jobs/lateDelivery";
import { mondayInbox } from "./jobs/mondayInbox";
import { morningReport } from "./jobs/morningReport";
import { stockCount } from "./jobs/stockCount";
import { PEOPLE, YOU } from "./northfield";
import { tabsOf, type Email, type Grid, type OfficeState } from "./types";

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

describe("Monday's inbox", () => {
  const FILED: Record<string, string> = { "m-sarah-short": "Deliveries", "m-kent": "Deliveries", "m-flour": "Deliveries", "m-dn": "Deliveries", "m-hale": "Invoices", "m-bright": "Invoices", "m-credit": "Invoices", "m-rota": "HR", "m-xmas": "HR", "m-pay": "HR", "m-starter": "HR" };
  const done = (): OfficeState => {
    const s = mondayInbox.seed();
    return { ...s, emails: s.emails.map((e) => (e.id === "m-scam" ? { ...e, reported: true, folder: "junk" } : FILED[e.id] ? { ...e, folder: FILED[e.id], flagged: e.id === "m-sarah-short" || e.id === "m-kent" } : e)) };
  };
  const fails = (s: OfficeState) => mondayInbox.check(s).filter((c) => !c.ok).map((c) => c.id);

  it("passes when filed, flagged and the scam reported", () => {
    expect(fails(done())).toEqual([]);
  });
  it("fails a fresh inbox, except the link not yet clicked", () => {
    expect(fails(mondayInbox.seed())).not.toContain("no-click");
    expect(fails(mondayInbox.seed())).toEqual(expect.arrayContaining(["folder-Deliveries", "empty", "flags", "reported"]));
  });
  it("catches a clicked scam link, an extra flag and a misfiled invoice", () => {
    const s = done();
    const bad = { ...s, emails: s.emails.map((e) => (e.id === "m-scam" ? { ...e, clicked: true } : e.id === "m-pay" ? { ...e, flagged: true } : e.id === "m-hale" ? { ...e, folder: "Deliveries" } : e)) };
    expect(fails(bad)).toEqual(expect.arrayContaining(["no-click", "flags", "folder-Invoices", "folder-Deliveries"]));
  });
});

describe("Reply, Reply all or Forward", () => {
  const kent = lateDelivery.seed().emails.find((e) => e.id === "m-kent")!;
  const replyAll: Email = { ...reply(), id: "r1", to: [kent.from], cc: kent.cc, subject: "Re: Late delivery on Friday", body: "Dear Imran,\n\nI'm sorry your flour was late. The haulier's van broke down on the M1.\n\nKind regards", links: [], inReplyTo: "m-kent" };
  const forward: Email = { ...reply(), id: "f1", to: [PEOPLE.sarah], cc: [], subject: "FW: Late delivery on Friday", body: "Hi Sarah, can you take this up with the haulier please?", links: [], inReplyTo: "m-kent" };
  const fails = (sent: Email[]) => lateDelivery.check({ ...lateDelivery.seed(), emails: [...lateDelivery.seed().emails, ...sent] }).filter((c) => !c.ok).map((c) => c.id);

  it("passes a Reply all and a clean Forward", () => {
    expect(fails([replyAll, forward])).toEqual([]);
  });
  it("catches a plain Reply that leaves the Cc people out", () => {
    expect(fails([{ ...replyAll, cc: [] }, forward])).toEqual(["reply-all"]);
  });
  it("counts a plain Reply put right with a Reply all afterwards", () => {
    expect(fails([{ ...replyAll, id: "r0", cc: [] }, replyAll, forward])).toEqual([]);
  });
  it("catches the customer copied into the internal forward", () => {
    expect(fails([replyAll, { ...forward, cc: kent.cc }])).toEqual(["internal"]);
  });
});

describe("moving formulas", () => {
  it("shifts every reference when copied down, and leaves text alone", () => {
    expect(shiftRefs("=E2-F2", 1)).toBe("=E3-F3");
    expect(shiftRefs("=SUM(G2:G11)", 2)).toBe("=SUM(G4:G13)");
    expect(shiftRefs("Pallet wrap", 1)).toBe("Pallet wrap");
  });
  it("keeps a sorted row pointing at itself", () => {
    expect(moveRowRefs("=E2-F2", 1, 4)).toBe("=E5-F5");
    expect(moveRowRefs("=SUM(G2:G11)", 6, 2)).toBe("=SUM(G2:G11)");
  });
});

const sentTo = (to: Email["to"]): Email => ({ ...reply(), id: "s1", to, links: [] });

describe("Fix the stock count", () => {
  const withAisleC = (edit: (g: Grid) => void, extra: Partial<OfficeState> = {}): OfficeState => {
    const s = stockCount.seed();
    return {
      ...s,
      ...extra,
      files: s.files.map((f) => {
        if (f.id !== "seed-stock") return f;
        const tabs = tabsOf(f).map((t) => ({ ...t, grid: t.grid.map((r) => [...r]) }));
        edit(tabs[2].grid);
        return { ...f, tabs, sheet: tabs[0].grid, by: "You" };
      }),
      emails: [...s.emails, sentTo([PEOPLE.sarah])],
    };
  };
  const fails = (s: OfficeState) => stockCount.check(s).filter((c) => !c.ok).map((c) => c.id);

  it("passes with both fixes saved on Aisle C and Sarah told", () => {
    expect(fails(withAisleC((g) => ((g[8][1] = "120"), (g[13][1] = "36"))))).toEqual([]);
  });
  it("names the wrong tab when B9 was changed on Aisle A", () => {
    const s = stockCount.seed();
    const wrong: OfficeState = { ...s, files: s.files.map((f) => (f.id === "seed-stock" ? { ...f, tabs: tabsOf(f).map((t, i) => (i === 0 ? { ...t, grid: t.grid.map((r, ri) => (ri === 8 ? ["Napkins", "120", "", ""] : r)) } : t)), by: "You" } : f)) };
    const fix = stockCount.check(wrong).find((c) => c.id === "fix-B9")?.fix ?? "";
    expect(fix).toContain("Aisle A tab");
  });
  it("catches a stray change elsewhere", () => {
    expect(fails(withAisleC((g) => ((g[8][1] = "120"), (g[13][1] = "36"), (g[2][1] = "81"))))).toEqual(["nothing-else"]);
  });
});

describe("Start December's rota", () => {
  const withTabs = (tabs: { name: string; grid: Grid }[], tell = true): OfficeState => {
    const s = decemberRota.seed();
    return { ...s, files: s.files.map((f) => (f.id === "seed-rota" ? { ...f, tabs, sheet: tabs[0].grid, by: "You" } : f)), emails: tell ? [...s.emails, sentTo([PEOPLE.emma])] : s.emails };
  };
  const nov = tabsOf(decemberRota.seed().files.find((f) => f.id === "seed-rota")!)[0];
  const blank = (): Grid => nov.grid.map((r) => r.map(() => ""));
  const dec = () => {
    const g = blank();
    g[0] = ["Name", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return { name: "December", grid: g };
  };
  const fails = (s: OfficeState) => decemberRota.check(s).filter((c) => !c.ok).map((c) => c.id);

  it("passes with December after November, headings in, saved and Emma told", () => {
    expect(fails(withTabs([nov, dec()]))).toEqual([]);
  });
  it("catches a tab left as Sheet2, and one put before November", () => {
    expect(fails(withTabs([nov, { ...dec(), name: "Sheet2" }]))).toEqual(expect.arrayContaining(["tab"]));
    expect(fails(withTabs([dec(), nov]))).toEqual(["after"]);
  });
  it("catches a missing heading", () => {
    const d = dec();
    d.grid[0][6] = "";
    expect(fails(withTabs([nov, d]))).toEqual(["headings"]);
  });
});
