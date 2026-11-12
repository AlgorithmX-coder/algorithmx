import { describe, expect, it } from "vitest";
import { AGENCY, PASSAGE, STAFF, bestLine, bestTyping, excelTestBook, markExcel, passageWords, scoreTyping } from "../agency";
import { ALL_STARTING_LINES, CV_TEMPLATE, agencyLines, contentHeight, cvFileName, cvStartingLines, cvTemplateDoc, homeAddress, isCopied, pagesOf, skillLines } from "../cv";
import { display, shiftRefs } from "../formula";
import { YOU } from "../northfield";
import type { Check, Email, OfficeFile, OfficeState, Tab, TypingResult, WordDoc } from "../types";
import { fromTemplate, para, placeholdersIn } from "../word";
import { agencyTests } from "./agencyTests";
import { cvWeek, morningLines, notesDoc, seed as cvSeed } from "./cvWeek";

/* Module 13: the CV and the agency tests. A fresh office fails, a job done
 * the way the brief asks passes every check, and each planted mistake
 * fails the check that names it. */

const failing = (cs: Check[]) => cs.filter((c) => !c.ok).map((c) => c.id);
const JO = AGENCY.consultant;

/* ── formulas: the $ that fixes a reference ─────────────────────────── */

describe("the final task as CV proof", () => {
  const result = { passed: true, score: 9, outOf: 10, late: 1, finishedOn: "2026-11-16T12:30:00.000Z", jobsDone: [] };
  it("a passed Monday morning offers one line, with its score and month", () => {
    const lines = morningLines(result);
    expect(lines).toHaveLength(1);
    expect(lines[0].from).toBe("Monday morning at the desk");
    expect(lines[0].line).toContain("9 of 10 tasks");
    expect(lines[0].line).toContain("November 2026");
  });
  it("a morning that didn't pass, or none at all, offers nothing", () => {
    expect(morningLines({ ...result, passed: false })).toEqual([]);
    expect(morningLines(null)).toEqual([]);
  });
});

describe("absolute references", () => {
  it("works out $E$12 as E12, and keeps it fixed when copied down", () => {
    const g = [
      ["5", "=A1/$A$3"],
      ["15", ""],
      ["=SUM(A1:A2)", ""],
    ];
    expect(display(g, 0, 1, "percent")).toBe("25%");
    expect(shiftRefs("=A1/$A$3", 1)).toBe("=A2/$A$3");
    expect(shiftRefs("=A1/A$3", 1)).toBe("=A2/A$3");
    expect(shiftRefs("=$A1/A3", 1)).toBe("=$A2/A4");
  });
});

/* ── the typing test ──────────────────────────────────────────────────── */

describe("the typing test's marking", () => {
  const words = passageWords();
  it("marks a clean minute as gross = net, 100% accurate", () => {
    const typed = words.slice(0, 40).join(" ") + " ";
    const r = scoreTyping(typed, 60);
    expect(r.errors).toBe(0);
    expect(r.accuracy).toBe(100);
    expect(r.gross).toBe(r.net);
    expect(r.gross).toBe(Math.round(typed.trimEnd().length / 5));
  });
  it("costs one word for one slip, not the rest of the line", () => {
    const w = [...words.slice(0, 40)];
    w[3] = "yuor";
    const r = scoreTyping(w.join(" ") + " ", 60);
    expect(r.errors).toBe(1);
    expect(r.net).toBe(r.gross - 1);
    expect(r.accuracy).toBeGreaterThan(98);
  });
  it("doesn't count a word still being typed as wrong", () => {
    const typed = words.slice(0, 5).join(" ") + " " + words[5].slice(0, 2);
    expect(scoreTyping(typed, 30).errors).toBe(0);
  });
  it("picks the best attempt: a pass first, else the nearest to one", () => {
    const r = (net: number, accuracy: number): TypingResult => ({ at: 0, practice: false, seconds: 180, chars: 0, words: 0, errors: 0, gross: net, net, accuracy });
    expect(bestTyping([r(50, 90), r(36, 96)])?.net).toBe(36);
    expect(bestTyping([r(40, 90), r(30, 98)])?.net).toBe(40);
    expect(PASSAGE.join(" ").includes("—")).toBe(false);
  });
});

/* ── the Excel test ───────────────────────────────────────────────────── */

/* The workbook done right, as a candidate would do it in Excel. */
function solved(): Tab[] {
  const [orders, staff] = excelTestBook();
  const g = orders.grid;
  g[3][2] = "2";
  g[9] = ["Sticky notes", "Paper Direct", "12", "1.85", "", ""];
  for (let r = 2; r <= 10; r++) {
    g[r - 1][4] = `=C${r}*D${r}`;
    g[r - 1][5] = `=E${r}/$E$12`;
  }
  g[11][4] = "=SUM(E2:E10)";
  g[12][4] = "=AVERAGE(E2:E10)";
  g[13][4] = '=COUNTIF(B2:B10,"Paper Direct")';
  const header = staff.grid[0];
  const sorted = STAFF.slice(1)
    .filter((r) => r[0])
    .sort((a, b) => a[1].localeCompare(b[1]));
  const sg = [header, ...sorted.map((r) => [...r]), ...staff.grid.slice(sorted.length + 1)];
  return [
    { ...orders, grid: g, formats: { E12: "money", E13: "money", F2: "percent" } },
    { ...staff, grid: sg },
  ];
}

describe("the Excel test's marking", () => {
  it("gives nothing for the untouched workbook", () => {
    expect(markExcel(excelTestBook())).toEqual([]);
  });
  it("gives all ten for the workbook done right", () => {
    expect(markExcel(solved())).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(display(solved()[0].grid, 11, 4, "money")).toBe("£501.90");
  });
  it("marks each task on its own", () => {
    const typedTotal = solved();
    typedTotal[0].grid[11][4] = "501.9";
    expect(markExcel(typedTotal)).not.toContain(5);
    expect(markExcel(typedTotal)).toContain(4);

    const relative = solved();
    for (let r = 2; r <= 10; r++) relative[0].grid[r - 1][5] = `=E${r}/E12`;
    expect(markExcel(relative)).not.toContain(9);

    const scrambled = solved();
    scrambled[1].grid[2][3] = "01/01/2020";
    expect(markExcel(scrambled)).not.toContain(10);

    const typedCost = solved();
    typedCost[0].grid[1][4] = "129";
    expect(markExcel(typedCost)).not.toContain(3);
  });
});

/* ── E13.2 The agency tests ───────────────────────────────────────────── */

const typingRun = (over: Partial<TypingResult> = {}): TypingResult => ({ at: 1, practice: false, seconds: 180, chars: 1300, words: 120, errors: 2, gross: 43, net: 42, accuracy: 98.1, ...over });
const reply = (to = JO): Email => ({ id: "r1", folder: "sent", from: YOU, to: [to], cc: [], subject: "Re: Your typing and Excel tests", body: "Hi Jo, both tests are done. Thanks", time: "11:30", attachments: [], links: [] });

function agencyDone(): OfficeState {
  const s = agencyTests.seed();
  return { ...s, agency: { typing: [typingRun({ practice: true, net: 30 }), typingRun()], excel: [{ at: 2, practice: false, seconds: 700, right: [1, 2, 3, 4, 5, 6, 7, 8, 10] }] }, emails: [...s.emails, reply()] };
}

describe("E13.2 The agency tests", () => {
  it("fails a fresh office", () => {
    expect(failing(agencyTests.check(agencyTests.seed()))).toEqual(["typing", "speed", "accuracy", "excel", "excel-score", "told"]);
  });
  it("passes when both tests are passed for real and Jo is told", () => {
    expect(failing(agencyTests.check(agencyDone()))).toEqual([]);
  });
  it("doesn't count practice runs, or a real run stopped early", () => {
    const s = agencyDone();
    expect(failing(agencyTests.check({ ...s, agency: { ...s.agency!, typing: [typingRun({ practice: true })] } }))).toEqual(["typing", "speed", "accuracy"]);
    expect(failing(agencyTests.check({ ...s, agency: { ...s.agency!, typing: [typingRun({ seconds: 90 })] } }))).toEqual(["typing", "speed", "accuracy"]);
    expect(failing(agencyTests.check({ ...s, agency: { ...s.agency!, excel: [{ at: 1, practice: true, seconds: 400, right: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }] } }))).toEqual(["excel", "excel-score"]);
  });
  it("marks speed and accuracy on the same run", () => {
    const s = agencyDone();
    expect(failing(agencyTests.check({ ...s, agency: { ...s.agency!, typing: [typingRun({ net: 31 })] } }))).toEqual(["speed"]);
    expect(failing(agencyTests.check({ ...s, agency: { ...s.agency!, typing: [typingRun({ accuracy: 92.5 })] } }))).toEqual(["accuracy"]);
  });
  it("needs 8 of the 10 Excel tasks", () => {
    const s = agencyDone();
    expect(failing(agencyTests.check({ ...s, agency: { ...s.agency!, excel: [{ at: 1, practice: false, seconds: 900, right: [1, 2, 3, 4, 5, 6, 7], timedOut: true }] } }))).toEqual(["excel-score"]);
  });
  it("needs a line back to Jo", () => {
    const s = agencyDone();
    expect(failing(agencyTests.check({ ...s, emails: s.emails.filter((e) => e.folder !== "sent") }))).toEqual(["told"]);
  });
  it("says the best real results in one line", () => {
    expect(bestLine(agencyDone().agency!)).toBe("Your best: typing 42 words a minute at 98%, Excel 9 of 10");
    expect(agencyLines(agencyDone().agency!).map((l) => l.from)).toEqual(["Pennyford's typing test", "Pennyford's Excel test"]);
  });
});

/* ── the CV model ─────────────────────────────────────────────────────── */

const NAME = "Jordan Miles";
const OWN = ["Logged every delivery in Excel each morning and flagged anything short to the supervisor", "Wrote to customers on the company letterhead to put mistakes right", "Kept a shared inbox tidy, so nothing urgent was missed"];

function cv(over: { skills?: string[]; name?: string; extra?: string[]; contact?: string; fake?: boolean } = {}): WordDoc {
  const d = fromTemplate(cvTemplateDoc(), CV_TEMPLATE);
  const name = over.name ?? NAME;
  const skills = over.skills ?? OWN;
  const text = [name, over.contact ?? "Leicester · 07700 900461 · jordan.miles@email.example", "Profile", "Organised and careful, with a week's office experience. Looking for an office administrator job in Leicester.", "Skills", ...skills, "Experience", "Office Administrator (placement), Northfield Supplies", "November 2026", "Logged deliveries and stock in Excel for the warehouse team", "Wrote and sent customer letters as PDFs", "Education", "Leicester College, Functional Skills Maths Level 2, 2025", "References", "Available on request."];
  d.blocks = d.blocks.map((b, i) => ({ ...b, text: text[i] ?? b.text }));
  if (over.fake) d.blocks = d.blocks.map((b) => (b.text === "Skills" ? { ...b, style: "normal", bold: true, size: 16 } : b));
  if (over.extra) d.blocks.push(...over.extra.map((t) => para(t)));
  return d;
}

describe("the CV model", () => {
  it("has a template with a placeholder for every gap, each short enough to click", () => {
    const t = cvTemplateDoc();
    expect(placeholdersIn(t)).toHaveLength(15);
    expect(pagesOf(t)).toBe(1);
  });
  it("reads the name, the file name and the skill lines", () => {
    expect(cvFileName(cv())).toBe("Jordan Miles CV.pdf");
    expect(skillLines(cv())).toEqual(OWN);
    expect(skillLines(cv({ fake: true }))).toEqual(OWN);
  });
  it("tells a copied line from one made the learner's own", () => {
    expect(isCopied("Logged daily deliveries in Excel and flagged shortages.")).toBe(true);
    expect(isCopied("logged daily deliveries in excel, and flagged shortages")).toBe(true);
    expect(isCopied("Logged daily deliveries in Excel and flagged any shortages")).toBe(false);
  });
  it("offers lines only for the jobs actually finished, then the extra proof", () => {
    expect(cvStartingLines(["m5j1", "m8j1", "m2t1"]).lines.map((l) => l.from)).toEqual(["The morning delivery report", "A letter on the letterhead"]);
    expect(cvStartingLines([]).general).toBe(true);
    expect(cvStartingLines([], [{ from: "Monday morning at the desk", line: "Cleared a busy Monday inbox to deadline" }]).lines).toHaveLength(1);
  });
  it("spots a home address, and lets a town through", () => {
    expect(homeAddress(cv())).toBeNull();
    expect(homeAddress(cv({ contact: "27 Bramble Way, Leicester · 07700 900461" }))).toBe("27 Bramble Way");
    expect(homeAddress(cv({ contact: "Leicester LE3 9PN · 07700 900461" }))).toBe("LE3 9PN");
  });
  it("counts pages from the paragraphs", () => {
    expect(pagesOf(cv())).toBe(1);
    const long = cv({ extra: Array(30).fill("Worked hard in a busy team, keeping everything tidy and up to date for the managers.") });
    expect(pagesOf(long)).toBeGreaterThan(1);
    expect(contentHeight(long)).toBeGreaterThan(contentHeight(cv()));
  });
});

/* ── E13.1 Turn your week into a CV ────────────────────────────────────── */

const DOCS = ["OneDrive", "Documents"];

function cvOffice(doc: WordDoc = cv(), file: Partial<OfficeFile> = {}, mail: Partial<Email> | null = {}): OfficeState {
  const s = cvSeed({ lines: cvStartingLines(["m5j1", "m8j1"]).lines, general: false });
  const pdf: OfficeFile = { id: "my-cv", path: DOCS, name: cvFileName(doc), kind: "pdf", modified: "Today, just now", by: "You", doc, ...file };
  const emails = mail === null ? s.emails : [...s.emails, { id: "sent-cv", folder: "sent", from: YOU, to: [JO], cc: [], subject: "Re: Your CV, please", body: "Hi Jo, my CV is attached. Thanks", time: "10:02", attachments: [{ name: pdf.name, doc: pdf.doc }], links: [], ...mail } as Email];
  return { ...s, files: [...s.files, pdf], emails };
}

describe("E13.1 Turn your week into a CV", () => {
  it("seeds the template and Daniel's notes from the finished jobs", () => {
    const s = cvSeed({ lines: cvStartingLines(["m5j1"]).lines, general: false });
    expect(s.files.find((f) => f.name === CV_TEMPLATE)?.path).toEqual(["OneDrive", "Documents", "Custom Office Templates"]);
    const notes = s.files.find((f) => f.name === "My week at Northfield.docx")?.doc;
    expect(notes?.blocks.filter((b) => b.style === "bullet").map((b) => b.text)).toEqual(["Logged daily deliveries in Excel and flagged shortages"]);
    expect(notesDoc(cvStartingLines([]).lines, true).blocks[1].text).toMatch(/general lines/);
  });
  it("fails a fresh office", () => {
    const ids = failing(cvWeek.check(cvWeek.seed()));
    expect(ids).toEqual(["template", "placeholders", "headings", "skills", "own", "page", "spelling", "private", "pdf", "name", "place", "one", "sent"]);
  });
  it("passes a one-page CV in the learner's words, saved and sent the right way", () => {
    expect(failing(cvWeek.check(cvOffice()))).toEqual([]);
  });
  it("catches a placeholder left in", () => {
    expect(failing(cvWeek.check(cvOffice(cv({ contact: "Leicester · [Phone number] · jordan.miles@email.example" }))))).toEqual(["placeholders"]);
  });
  it("catches a heading made with bold", () => {
    expect(failing(cvWeek.check(cvOffice(cv({ fake: true }))))).toEqual(["headings"]);
  });
  it("catches a skill line left word for word as offered, and lets an edited one through", () => {
    expect(failing(cvWeek.check(cvOffice(cv({ skills: [ALL_STARTING_LINES[7], OWN[1], OWN[2]] }))))).toEqual(["own"]);
    expect(failing(cvWeek.check(cvOffice(cv({ skills: ["Logged daily deliveries in Excel and flagged any shortages to Sarah", OWN[1], OWN[2]] }))))).toEqual([]);
  });
  it("catches fewer than three skills", () => {
    const d = cv();
    d.blocks = d.blocks.filter((b) => b.text !== OWN[2]);
    expect(failing(cvWeek.check(cvOffice(d)))).toEqual(["skills", "own"]);
  });
  it("catches a CV that runs to two pages", () => {
    expect(failing(cvWeek.check(cvOffice(cv({ extra: Array(30).fill("Worked hard in a busy team, keeping everything tidy and up to date for the managers.") }))))).toEqual(["page"]);
  });
  it("catches a spelling slip and a home address", () => {
    expect(failing(cvWeek.check(cvOffice(cv({ skills: [OWN[0], OWN[1], "Kept a shared inbox tidy, so nothing urgent was mised and nothing went untill late"] }))))).toEqual(["spelling"]);
    expect(failing(cvWeek.check(cvOffice(cv({ contact: "14 Fosse Road, Leicester · 07700 900461" }))))).toEqual(["private"]);
  });
  it("catches a PDF named or put in the wrong place, or saved twice", () => {
    expect(failing(cvWeek.check(cvOffice(cv(), { name: "CV final.pdf" })))).toEqual(["name"]);
    expect(failing(cvWeek.check(cvOffice(cv(), { path: ["Operations Team", "Documents"] })))).toEqual(["place"]);
    const twice = cvOffice();
    twice.files.push({ ...twice.files[twice.files.length - 1], id: "copy", path: ["OneDrive", "Desktop"] });
    expect(failing(cvWeek.check(twice))).toEqual(["one"]);
  });
  it("needs it sent to Jo as the PDF, not the Word file", () => {
    expect(failing(cvWeek.check(cvOffice(cv(), {}, null)))).toEqual(["sent"]);
    expect(failing(cvWeek.check(cvOffice(cv(), {}, { attachments: [{ name: "Jordan Miles CV.docx", doc: cv() }] })))).toEqual(["sent"]);
  });
  it("catches a CV not started from the template", () => {
    const d = cv();
    d.template = undefined;
    expect(failing(cvWeek.check(cvOffice(d)))).toEqual(["template"]);
  });
});
