import { describe, expect, it } from "vitest";
import { accessFor, linkedFiles, makeLink, keepLink, pdfOfRows, recycle, restoreItem, restoreVersion, shareWith, versionsOf, wideLinks } from "../files";
import { PEOPLE, YOU } from "../northfield";
import { newId } from "../store";
import type { Check, Email, OfficeFile, OfficeState, Path } from "../types";
import { DELIVERIES, LOOSE, sharedFolder } from "./sharedFolder";
import { shareRightWay } from "./shareRightWay";
import { STOCK, stockRight, stockWrong } from "./stockSheet";
import { versionBack } from "./versionBack";

/* Module 9's file model and its three office jobs: a fresh office fails,
 * a job done the way the brief asks passes every check, and each planted
 * mistake fails the check that names it. */

const failed = (cs: Check[]) => cs.filter((c) => !c.ok).map((c) => c.id);
const move = (s: OfficeState, id: string, path: Path, name?: string): OfficeState => ({ ...s, files: s.files.map((f) => (f.id === id ? { ...f, path, name: name ?? f.name } : f)) });
const folder = (s: OfficeState, path: Path, name: string): OfficeState => ({ ...s, files: [...s.files, { id: newId("dir"), path, name, kind: "folder", modified: "Today", by: "You" }] });
const mail = (over: Partial<Email>): Email => ({ id: newId("mail"), folder: "sent", from: YOU, to: [], cc: [], subject: "", body: "", time: "Just now", attachments: [], links: [], ...over });

describe("the file model", () => {
  const base = (): OfficeState => ({ version: 1, emails: [], files: [{ id: "f", path: ["Operations Team", "Documents", "Stock"], name: "Stock November.xlsx", kind: "xlsx", modified: "x", by: "Sarah Patel", sheet: stockRight() }] });

  it("knows who can open a file: the site's members, and nobody else until it's shared", () => {
    const f = base().files[0];
    expect(accessFor(f, PEOPLE.sarah)).toBe("edit");
    expect(accessFor(f, YOU)).toBe("edit");
    expect(accessFor(f, PEOPLE.priya)).toBeNull();
    expect(accessFor(f, PEOPLE.tom)).toBeNull();
    expect(accessFor({ ...f, path: ["OneDrive", "Documents"] }, PEOPLE.sarah)).toBeNull();
  });
  it("shares by name: access for that person only, and an email with a link", () => {
    const s = shareWith(base(), "f", [PEOPLE.priya], "edit", "For the valuation");
    const f = s.files[0];
    expect(accessFor(f, PEOPLE.priya)).toBe("edit");
    expect(accessFor(f, PEOPLE.emma)).toBeNull();
    expect(wideLinks(f)).toHaveLength(0);
    expect(s.emails).toHaveLength(1);
    expect(linkedFiles(s, s.emails[0])).toEqual([f]);
  });
  it("makes links that open for the right people, and reuses one with the same settings", () => {
    let s = base();
    const org = makeLink(s, "f", "org", "edit");
    s = keepLink(org.state, "f", org.link!);
    expect(accessFor(s.files[0], PEOPLE.emma)).toBe("edit");
    expect(accessFor(s.files[0], PEOPLE.tom)).toBeNull();
    expect(makeLink(s, "f", "org", "edit").link?.id).toBe(org.link?.id);
    const anyone = makeLink(s, "f", "anyone", "view");
    s = keepLink(s, "f", anyone.link!);
    expect(accessFor(s.files[0], PEOPLE.tom)).toBe("view");
    expect(wideLinks(s.files[0])).toHaveLength(2);
    /* a link pasted into an email as text is found */
    expect(linkedFiles(s, mail({ body: `Here it is: ${org.link!.url}` }))).toEqual([s.files[0]]);
  });
  it("restores a version as a new current one, keeping the one it replaced", () => {
    let s = base();
    s = { ...s, files: [{ ...s.files[0], sheet: stockWrong(), versions: [{ no: "1.0", modified: "09/11/2026 17:42", by: "Sarah Patel", sheet: stockRight() }] }] };
    s = restoreVersion(s, "f", 0);
    const f = s.files[0];
    expect(f.sheet).toEqual(stockRight());
    expect(f.versions).toHaveLength(2);
    expect(f.versions?.[1].sheet).toEqual(stockWrong());
    expect(versionsOf(f)[0]).toMatchObject({ no: "3.0", current: true, comment: "Restored from version 1.0" });
  });
  it("deletes to the Recycle bin and puts things back where they were", () => {
    let s: OfficeState = { version: 1, emails: [], files: [{ id: "docs", path: ["OneDrive"], name: "Documents", kind: "folder", modified: "", by: "You" }, { id: "d", path: ["OneDrive", "Documents"], name: "Drafts", kind: "folder", modified: "", by: "You" }, { id: "n", path: ["OneDrive", "Documents", "Drafts"], name: "Notes.docx", kind: "docx", modified: "", by: "You" }] };
    s = recycle(s, "d");
    expect(s.files.map((f) => f.id)).toEqual(["docs"]);
    expect(s.recycle?.[0].inside).toHaveLength(1);
    s = restoreItem(s, s.recycle![0].id);
    expect(s.files.map((f) => f.id).sort()).toEqual(["d", "docs", "n"]);
    expect(s.recycle).toHaveLength(0);
  });
  it("prints what a filtered sheet shows, and leaves empty columns off", () => {
    const doc = pdfOfRows([
      ["Code", "Supplier", ""],
      ["HP-101", "Harlow Packaging", ""],
    ]);
    expect(doc.blocks[0].table).toEqual([
      ["Code", "Supplier"],
      ["HP-101", "Harlow Packaging"],
    ]);
  });
});

/* ── E9.1 Sort out the shared folder ─────────────────────────────────── */

const Y = (y: string): Path => [...DELIVERIES, y];

function tidied(): OfficeState {
  let s = folder(sharedFolder.seed(), [...DELIVERIES], "2025");
  for (const l of LOOSE) {
    if (l.id === "seed-copy") continue;
    s = move(s, l.id, Y(l.year), l.example);
  }
  s = recycle(s, "seed-copy");
  s = { ...s, emails: [...s.emails, mail({ to: [PEOPLE.sarah], subject: "Re: Deliveries folder is a mess", body: "Done, Deliveries is sorted into 2025 and 2026." })] };
  return s;
}

describe("E9.1 Sort out the shared folder", () => {
  it("fails a fresh office", () => {
    expect(failed(sharedFolder.check(sharedFolder.seed()))).toEqual(["names", "dates", "folder2025", "years", "dup", "told"]);
  });
  it("passes when every file is named and filed and the copy is gone", () => {
    expect(failed(sharedFolder.check(tidied()))).toEqual([]);
  });
  it("keeps either copy of the duplicate, not both and not neither", () => {
    let s = tidied();
    s = restoreItem(s, s.recycle![0].id);
    s = move(s, "seed-copy", Y("2026"), "2026-11-06 Delivery report (2).xlsx");
    expect(failed(sharedFolder.check(s))).toContain("dup");
    let t = tidied();
    t = recycle(t, "seed-final");
    expect(failed(sharedFolder.check(t))).toEqual(["dup"]);
  });
  it("fails a name that breaks the rule, a vague one, and a wrong date", () => {
    expect(failed(sharedFolder.check(move(tidied(), "seed-1912", Y("2025"), "2025-12-19 Delivery report SP.xlsx")))).toEqual(["names"]);
    expect(failed(sharedFolder.check(move(tidied(), "seed-scan", Y("2026"), "2026-11-09 Scan.pdf")))).toEqual(["names"]);
    expect(failed(sharedFolder.check(move(tidied(), "seed-scan", Y("2026"), "2026-11-11 Delivery note DN-77790.pdf")))).toEqual(["dates"]);
    const fix = sharedFolder.check(move(tidied(), "seed-final", Y("2026"), "report final v2.xlsx")).find((c) => c.id === "names")?.fix;
    expect(fix).toContain("2026-11-06 Delivery report.xlsx");
  });
  it("fails a file left in the wrong year, a missing 2025 folder, and a real file deleted", () => {
    expect(failed(sharedFolder.check(move(tidied(), "seed-2212", [...DELIVERIES])))).toEqual(["years"]);
    const fix = sharedFolder.check(recycle(tidied(), "seed-returns")).find((c) => c.id === "kept");
    expect(fix?.ok).toBe(false);
    expect(fix?.fix).toContain("Recycle bin");
    const noFolder = { ...tidied(), files: tidied().files.filter((f) => !(f.kind === "folder" && f.name === "2025")) };
    expect(failed(sharedFolder.check(noFolder))).toContain("folder2025");
    expect(failed(sharedFolder.check(move(tidied(), "seed-pallets", ["OneDrive", "Documents"])))).toEqual(["years", "kept"]);
  });
  it("needs a word to Sarah", () => {
    expect(failed(sharedFolder.check({ ...tidied(), emails: tidied().emails.filter((e) => e.folder !== "sent") }))).toEqual(["told"]);
  });
});

/* ── E9.2 Share it the right way ─────────────────────────────────────── */

const harlowPdf = (rows = stockRight().filter((r, i) => i === 0 || r[2] === "Harlow Packaging")) => ({ name: "2026-11-10 Harlow stock.pdf", doc: pdfOfRows(rows) });

function shared(): OfficeState {
  let s = shareWith(shareRightWay.seed(), "seed-stock", [PEOPLE.priya], "edit", "");
  const pdf = harlowPdf();
  const file: OfficeFile = { id: "pdf", path: ["OneDrive", "Documents"], name: pdf.name, kind: "pdf", modified: "Today", by: "You", doc: pdf.doc };
  s = { ...s, files: [...s.files, file], emails: [...s.emails, mail({ to: [PEOPLE.tom], subject: "Harlow stock", body: "Hi Tom, our stock of your lines is attached.", attachments: [pdf] })] };
  return s;
}

describe("E9.2 Share it the right way", () => {
  it("fails a fresh office", () => {
    expect(failed(shareRightWay.check(shareRightWay.seed()))).toEqual(["p-edit", "p-link", "t-sent", "t-pdf", "t-rows", "t-name"]);
  });
  it("passes with an edit share for Priya and a PDF of Harlow's rows for Tom", () => {
    expect(failed(shareRightWay.check(shared()))).toEqual([]);
  });
  it("fails a view-only share, and a company-wide link", () => {
    expect(failed(shareRightWay.check(shareWith(shared(), "seed-stock", [PEOPLE.priya], "view", "")))).toEqual(["p-edit"]);
    const { state, link } = makeLink(shared(), "seed-stock", "org", "edit");
    expect(failed(shareRightWay.check(keepLink(state, "seed-stock", link!)))).toEqual(["p-only"]);
  });
  it("fails a bare link to Priya, who isn't on the site", () => {
    const s = shared();
    const bare = { ...s, files: s.files.map((f) => (f.id === "seed-stock" ? { ...f, access: [] } : f)), emails: s.emails.filter((e) => !e.to.some((p) => p.address === PEOPLE.priya.address)) };
    const withLink = { ...bare, emails: [...bare.emails, mail({ to: [PEOPLE.priya], links: [{ name: "Stock November.xlsx", path: [...STOCK], fileName: "Stock November.xlsx" }] })] };
    const c = shareRightWay.check(withLink);
    expect(failed(c)).toEqual(["p-edit"]);
    expect(c.find((x) => x.id === "p-edit")?.fix).toContain("isn't on the Operations Team site");
  });
  it("fails a PDF with every supplier in it, or a link sent to Tom", () => {
    const s = shared();
    const all = { ...s, emails: s.emails.map((e) => (e.to[0]?.address === PEOPLE.tom.address ? { ...e, attachments: [harlowPdf(stockRight())] } : e)) };
    expect(failed(shareRightWay.check(all))).toEqual(["t-rows"]);
    const link = { ...s, emails: s.emails.map((e) => (e.to[0]?.address === PEOPLE.tom.address ? { ...e, attachments: [], links: [{ name: "Stock November.xlsx", path: [...STOCK], fileName: "Stock November.xlsx" }] } : e)) };
    expect(failed(shareRightWay.check(link))).toEqual(["t-pdf", "t-rows", "t-not-sheet", "t-name"]);
  });
  it("fails sharing the sheet with Tom, and a badly named PDF", () => {
    expect(failed(shareRightWay.check(shareWith(shared(), "seed-stock", [PEOPLE.tom], "view", "")))).toEqual(["p-only", "t-not-sheet"]);
    const s = shared();
    const named = { ...s, emails: s.emails.map((e) => (e.to[0]?.address === PEOPLE.tom.address ? { ...e, attachments: [{ ...harlowPdf(), name: "Stock November.pdf" }] } : e)) };
    expect(failed(shareRightWay.check(named))).toEqual(["t-name"]);
  });
  it("fails an emailed copy of the sheet, and a changed sheet", () => {
    const s = shared();
    const copy = { ...s, emails: [...s.emails, mail({ to: [PEOPLE.priya], attachments: [{ name: "Stock November.xlsx", sheet: stockRight() }] })] };
    expect(failed(shareRightWay.check(copy))).toEqual(["p-nocopy"]);
    const changed = { ...s, files: s.files.map((f) => (f.id === "seed-stock" ? { ...f, sheet: stockWrong() } : f)) };
    expect(failed(shareRightWay.check(changed))).toEqual(["sheet"]);
  });
});

/* ── E9.3 Get yesterday's version back ───────────────────────────────── */

function putRight(): OfficeState {
  let s = versionBack.seed();
  const stock = s.files.find((f) => f.id === "seed-stock")!;
  const i = stock.versions!.findIndex((v) => v.modified === "09/11/2026 17:42");
  s = restoreVersion(s, "seed-stock", i);
  s = move(s, "seed-notes", ["OneDrive", "Documents", "Drafts"]);
  s = { ...s, teams: { ...s.teams!, chats: s.teams!.chats.map((c) => (c.id === "chat-sarah" ? { ...c, messages: [...c.messages, { id: "m", from: YOU, text: "Done, last night's version is back.", time: "08:58" }] } : c)) } };
  return s;
}

describe("E9.3 Get yesterday's version back", () => {
  it("fails a fresh office", () => {
    expect(failed(versionBack.check(versionBack.seed()))).toEqual(["restored", "notes", "site", "told"]);
  });
  it("passes with 17:42 restored, the notes in Drafts and Sarah told", () => {
    expect(failed(versionBack.check(putRight()))).toEqual([]);
  });
  it("fails the wrong version restored, and says which it was", () => {
    let s = versionBack.seed();
    s = restoreVersion(s, "seed-stock", 0);
    s = move(s, "seed-notes", ["OneDrive", "Documents", "Drafts"]);
    const c = versionBack.check(s).find((x) => x.id === "restored");
    expect(c?.ok).toBe(false);
    expect(c?.fix).toContain("02/11/2026");
  });
  it("fails notes left on the site, put in the wrong OneDrive folder, or deleted", () => {
    expect(failed(versionBack.check(move(putRight(), "seed-notes", [...STOCK])))).toEqual(["notes", "site"]);
    expect(failed(versionBack.check(move(putRight(), "seed-notes", ["OneDrive", "Desktop"])))).toEqual(["notes"]);
    const gone = recycle(putRight(), "seed-notes");
    const c = versionBack.check(gone).find((x) => x.id === "notes");
    expect(c?.fix).toContain("Recycle bin");
  });
  it("fails a stock sheet copied out, and no word to Sarah", () => {
    const s = putRight();
    const copy = { ...s, files: [...s.files, { id: "c", path: ["OneDrive", "Documents"], name: "Stock November old.xlsx", kind: "xlsx" as const, modified: "", by: "You", sheet: stockRight() }] };
    expect(failed(versionBack.check(copy))).toEqual(["kept"]);
    expect(failed(versionBack.check({ ...s, teams: versionBack.seed().teams }))).toEqual(["told"]);
  });
});
